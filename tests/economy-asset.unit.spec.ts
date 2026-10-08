import { test, expect } from "@playwright/test";
import * as T from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { economyAllocationAsset } from "../src/lib/atom-economy-asset";
class BlobReader {
  result: unknown;
  onloadend?: () => void;
  readAsArrayBuffer(b: Blob) {
    b.arrayBuffer().then((v) => {
      this.result = v;
      this.onloadend?.();
    });
  }
}
test("actual allocation exports preserve mass-weighted elements, molecular depths and desired product frames", async () => {
  Object.assign(globalThis, { FileReader: BlobReader });
  for (const desired of ["CO2", "H2O"] as const) {
    const root = economyAllocationAsset(desired),
      binary = (await new GLTFExporter().parseAsync(root, {
        binary: true,
      })) as ArrayBuffer,
      h = new DataView(binary);
    expect(h.getUint32(0, true)).toBe(0x46546c67);
    expect(h.getUint32(8, true)).toBe(binary.byteLength);
    const json = JSON.parse(
      new TextDecoder().decode(
        new Uint8Array(binary, 20, h.getUint32(12, true)),
      ),
    );
    for (const side of ["reactant", "product"]) {
      const atoms = json.nodes.filter(
        (n: { name?: string }) =>
          n.name?.startsWith(side + "-") && n.name.includes("-atom-"),
      );
      expect(atoms).toHaveLength(9);
      const counts = { C: 0, H: 0, O: 0 };
      for (const a of atoms) {
        const symbol = a.name.split("-").at(-1) as keyof typeof counts;
        counts[symbol]++;
        expect(a.mesh).not.toBeUndefined();
      }
      expect(counts).toEqual({ C: 1, H: 4, O: 4 });
      expect(counts.C * 12 + counts.H + counts.O * 16).toBe(80);
    }
    const rods = json.nodes.filter(
      (n: { name?: string; extras?: { bondOrder?: number } }) =>
        n.extras?.bondOrder,
    );
    expect(
      rods.filter(
        (n: { name: string; extras: { bondOrder: number } }) =>
          n.name.includes("-O2-") && n.extras.bondOrder === 2,
      ),
    ).toHaveLength(4);
    expect(
      rods.filter(
        (n: { name: string; extras: { bondOrder: number } }) =>
          n.name.includes("-CO2-") && n.extras.bondOrder === 2,
      ),
    ).toHaveLength(4);
    const products = json.nodes.filter(
      (n: { extras?: { side?: string; formula?: string } }) =>
        n.extras?.side === "product" && n.extras?.formula,
    );
    expect(products).toHaveLength(3);
    const useful = products.filter(
      (n: { extras: { isDesired: boolean } }) => n.extras.isDesired,
    );
    expect(useful).toHaveLength(desired === "CO2" ? 1 : 2);
    expect(
      useful.reduce(
        (s: number, n: { extras: { relativeMass: number } }) =>
          s + n.extras.relativeMass,
        0,
      ),
    ).toBe(desired === "CO2" ? 44 : 36);
    const methane = root.children.find((g) => g.name === "reactant-CH4-0")!,
      depths = methane.children
        .filter((m) => m.name.includes("-atom-"))
        .map((m) => m.position.z);
    expect(Math.max(...depths) - Math.min(...depths)).toBeGreaterThan(0.5);
    for (const product of root.children.filter(
      (g) => g.userData.side === "product",
    )) {
      const frame = root.children.find(
        (g) => g.name === `selection-frame-${product.name}`,
      )!;
      expect(
        new T.Box3()
          .setFromObject(frame)
          .containsBox(new T.Box3().setFromObject(product)),
      ).toBe(true);
    }
  }
});
