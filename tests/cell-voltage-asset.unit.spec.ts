import { test, expect } from "@playwright/test";
import * as T from "three";
import { voltageCellAsset } from "../src/lib/voltage-cell-asset";
test("actual immersed plates and red/COM tube endpoints preserve normal, reversed and same-plate circuits", () => {
  for (const metal1 of ["chromium", "copper", "iron", "tin", "zinc"])
    for (const metal2 of ["chromium", "copper", "iron", "tin", "zinc"])
      for (const [red, black] of [
        ["metal1", "metal2"],
        ["metal2", "metal1"],
        ["metal1", "metal1"],
        ["metal2", "metal2"],
      ]) {
        const root = voltageCellAsset({
          metal1,
          metal2,
          red,
          black,
          electronFrom: "metal1",
          electronTo: "metal2",
          volts: "-0.7",
        });
        root.updateMatrixWorld(true);
        const bounds = (name: string) =>
          new T.Box3().setFromObject(root.getObjectByName(name)!);
        const a = bounds("metal1-plate"),
          b = bounds("metal2-plate"),
          floor = bounds("beaker-floor"),
          liquid = bounds("supplied-electrolyte"),
          bench = bounds("support-bench");
        expect(a.max.x).toBeLessThan(b.min.x);
        expect(a.min.y).toBeGreaterThan(floor.max.y);
        expect(b.min.y).toBeGreaterThan(floor.max.y);
        expect(a.min.y).toBeLessThan(liquid.max.y);
        expect(a.max.y).toBeGreaterThan(liquid.max.y);
        expect(floor.min.y).toBeCloseTo(bench.max.y, 6);
        for (const [name, role, portX] of [
          ["red-meter-lead", red, -0.25],
          ["black-meter-lead", black, 0.25],
        ] as const) {
          const wire = root.getObjectByName(name) as T.Mesh,
            p = wire.geometry.getAttribute("position");
          const centre = (ring: number) => {
            const v = new T.Vector3();
            for (let i = 0; i < 8; i++)
              v.add(new T.Vector3().fromBufferAttribute(p, ring * 9 + i));
            return v.multiplyScalar(1 / 8);
          };
          expect(
            centre(0).distanceTo(
              new T.Vector3(role === "metal1" ? -0.7 : 0.7, 0.55, 0.06),
            ),
          ).toBeLessThan(1e-6);
          expect(
            centre(40).distanceTo(new T.Vector3(portX, 1.04, 0.75)),
          ).toBeLessThan(1e-6);
        }
        expect(root.getObjectByName("metal1-load-wire")).toBeDefined();
        expect(root.getObjectByName("metal2-load-wire")).toBeDefined();
        root.traverse((obj) => {
          if (obj instanceof T.Mesh || obj instanceof T.Line) {
            expect(
              Array.from(obj.geometry.getAttribute("position").array).every(
                Number.isFinite,
              ),
            ).toBe(true);
            obj.geometry.dispose();
            for (const mat of [obj.material].flat()) mat.dispose();
          }
        });
      }
});
