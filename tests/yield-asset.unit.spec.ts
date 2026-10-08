import * as T from "three";
import { test, expect } from "@playwright/test";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { yieldRecoveryAsset } from "../src/lib/yield-recovery-asset";
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
test("actual exported mass markers preserve ten identified2-g portions with genuine depths through recovery", async () => {
  Object.assign(globalThis, { FileReader: BlobReader });
  for (const recovered of [6, 8, 10]) {
    const geometryRoot = yieldRecoveryAsset(recovered);
    for (const marker of geometryRoot.children.filter(
      (o) => o.userData.portionId,
    )) {
      const boundaryName =
        marker.userData.side === "before"
          ? "formed-product-boundary"
          : marker.userData.location === "collected sample"
            ? "collected-sample-boundary"
            : "retained-apparatus-boundary";
      const boundary = geometryRoot.children.find(
        (o) => o.name === boundaryName,
      )!;
      expect(
        new T.Box3()
          .setFromObject(boundary)
          .containsBox(new T.Box3().setFromObject(marker)),
      ).toBe(true);
    }
    const root = yieldRecoveryAsset(recovered),
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
    const before = json.nodes.filter(
        (n: { extras?: { side?: string } }) => n.extras?.side === "before",
      ),
      after = json.nodes.filter(
        (n: { extras?: { side?: string } }) => n.extras?.side === "after",
      );
    expect(before).toHaveLength(10);
    expect(after).toHaveLength(10);
    expect(
      after.map((n: { extras: { portionId: string } }) => n.extras.portionId),
    ).toEqual(
      before.map((n: { extras: { portionId: string } }) => n.extras.portionId),
    );
    expect(
      after.reduce(
        (s: number, n: { extras: { grams: number } }) => s + n.extras.grams,
        0,
      ),
    ).toBe(20);
    expect(
      after.filter(
        (n: { extras: { location: string } }) =>
          n.extras.location === "collected sample",
      ),
    ).toHaveLength(recovered);
    expect(
      new Set(
        after.map(
          (n: { translation?: number[]; matrix?: number[] }) =>
            n.translation?.[2] ?? n.matrix?.[14] ?? 0,
        ),
      ).size,
    ).toBeGreaterThan(1);
    for (const n of after) expect(n.mesh).not.toBeUndefined();
  }
});
