import { test, expect } from "@playwright/test";
import * as T from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { theoreticalAmmoniaAsset } from "../src/lib/theoretical-inventory-asset";
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
test("actual excess-hydrogen inventory conserves elements, intact unused molecule and binary geometry", async () => {
  Object.assign(globalThis, { FileReader: BlobReader });
  const root = theoreticalAmmoniaAsset();
  const binary = (await new GLTFExporter().parseAsync(root, {
    binary: true,
  })) as ArrayBuffer;
  const header = new DataView(binary);
  expect(header.getUint32(0, true)).toBe(0x46546c67);
  expect(header.getUint32(8, true)).toBe(binary.byteLength);
  const json = JSON.parse(
    new TextDecoder().decode(
      new Uint8Array(binary, 20, header.getUint32(12, true)),
    ),
  );
  for (const side of ["before", "after"]) {
    const molecules = root.children.filter((g) => g.userData.side === side);
    expect(molecules).toHaveLength(side === "before" ? 5 : 3);
    const atoms = json.nodes.filter(
      (n: { extras?: { side?: string; element?: string } }) =>
        n.extras?.side === side && n.extras.element,
    );
    expect(atoms).toHaveLength(10);
    expect(
      atoms.filter(
        (n: { extras: { element: string } }) => n.extras.element === "N",
      ),
    ).toHaveLength(2);
    expect(
      atoms.filter(
        (n: { extras: { element: string } }) => n.extras.element === "H",
      ),
    ).toHaveLength(8);
    expect(2 * 14 + 8).toBe(36);
    for (const atom of atoms) expect(atom.mesh).not.toBeUndefined();
    const unused = molecules.find((g) => g.userData.unused)!;
    expect(unused.userData.originalId).toBe("unused-hydrogen");
    expect(unused.children.filter((g) => g.userData.order === 1)).toHaveLength(
      1,
    );
    const frame = root.children.find((g) => g.name === `unused-frame-${side}`)!;
    expect(frame).toBeInstanceOf(T.LineSegments);
    expect(
      new T.Box3()
        .setFromObject(frame)
        .containsBox(new T.Box3().setFromObject(unused)),
    ).toBe(true);
    for (let i = 0; i < molecules.length; i++)
      for (let j = i + 1; j < molecules.length; j++)
        expect(
          new T.Box3()
            .setFromObject(molecules[i])
            .intersectsBox(new T.Box3().setFromObject(molecules[j])),
        ).toBe(false);
  }
  const unchanged = ["before", "after"].map((side) =>
    root.children
      .find((g) => g.name === `${side}-H2-unused`)!
      .children.filter((g) => g.userData.element)
      .map((g) => g.userData.atomId)
      .sort(),
  );
  expect(unchanged[0]).toEqual(unchanged[1]);
  const nitrogen = root.children.find((g) => g.name === "before-N2-0")!;
  expect(nitrogen.children.filter((g) => g.userData.order === 3)).toHaveLength(
    3,
  );
  for (const ammonia of root.children.filter(
    (g) => g.userData.formula === "NH3",
  )) {
    const z = ammonia.children
      .filter((g) => g.userData.element)
      .map((g) => g.position.z);
    expect(Math.max(...z) - Math.min(...z)).toBeGreaterThan(0.5);
    expect(ammonia.children.filter((g) => g.userData.order === 1)).toHaveLength(
      3,
    );
  }
});
