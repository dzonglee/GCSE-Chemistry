import { test, expect } from "@playwright/test";
import * as T from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { limitingInventoryAsset } from "../src/lib/limiting-inventory-asset";
class BlobReader {
  result: unknown;
  onloadend?: () => void;
  readAsArrayBuffer(blob: Blob) {
    blob.arrayBuffer().then((v) => {
      this.result = v;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob: Blob) {
    blob.arrayBuffer().then((v) => {
      this.result = `data:${blob.type};base64,${Buffer.from(v).toString("base64")}`;
      this.onloadend?.();
    });
  }
}
test("actual 3D inventory conserves C3 H12 O8 and preserves one intact unused methane", async () => {
  const root = limitingInventoryAsset();
  for (const side of ["before", "after"]) {
    const counts: Record<string, number> = {};
    root.traverse((o) => {
      if (o.userData.side === side && o.userData.element)
        counts[o.userData.element] = (counts[o.userData.element] ?? 0) + 1;
    });
    expect(counts).toEqual({ C: 3, H: 12, O: 8 });
  }
  const groups = root.children.filter((o) => o.userData.side === "after");
  const bounds = groups.map((o) => new T.Box3().setFromObject(o));
  for (let i = 0; i < bounds.length; i++)
    for (let j = i + 1; j < bounds.length; j++)
      expect(bounds[i].intersectsBox(bounds[j])).toBe(false);
  const before = root.children.find(
    (o) =>
      o.userData.originalId === "retained-methane-2" &&
      o.userData.side === "before",
  )!;
  const after = root.children.find((o) => o.userData.unreacted)!;
  expect(after.userData.formula).toBe("CH4");
  expect(after.userData.originalId).toBe(before.userData.originalId);
  expect(
    after.children
      .filter((o) => o.userData.element)
      .map((o) => o.position.toArray()),
  ).toEqual(
    before.children
      .filter((o) => o.userData.element)
      .map((o) => o.position.toArray()),
  );
  expect(after.children.filter((o) => o.userData.element)).toHaveLength(5);
  expect(
    new Set(
      after.children.filter((o) => o.userData.element).map((o) => o.position.z),
    ).size,
  ).toBeGreaterThan(1);
  Object.assign(globalThis, { FileReader: BlobReader });
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
    const counts: Record<string, number> = {};
    for (const n of json.nodes) {
      if (n.mesh !== undefined && n.extras?.side === side && n.extras.element)
        counts[n.extras.element] = (counts[n.extras.element] ?? 0) + 1;
    }
    expect(counts).toEqual({ C: 3, H: 12, O: 8 });
  }
  expect(
    json.nodes.filter(
      (n: { extras?: { unreacted?: boolean } }) => n.extras?.unreacted,
    ),
  ).toHaveLength(1);
  root.traverse((o) => {
    if (o instanceof T.Mesh) {
      o.geometry.dispose();
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
      else o.material.dispose();
    }
  });
});
