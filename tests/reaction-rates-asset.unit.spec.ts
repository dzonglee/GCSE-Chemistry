import { test, expect } from "@playwright/test";
import * as T from "three";
import {
  rateFlaskAsset,
  type RateFlaskState,
} from "../src/lib/rate-flask-asset";
test("actual balance/flask geometry verifies contact, porous egress, sealed gas confinement and independent display segments", () => {
  for (const closure of [
    "porous-cotton-wool",
    "sealed-boundary",
    "open-neck",
  ] as const)
    for (const phase of ["start", "end"] as const)
      for (const reading of [182.4, 178.4, 95.6, 94.7]) {
        const root = rateFlaskAsset({
          closure,
          phase,
          reading,
          loss: closure === "sealed-boundary" ? "retained-gas" : "only-gas",
        });
        const bounds = (name: string) =>
          new T.Box3().setFromObject(root.getObjectByName(name)!, true);
        const pan = bounds("weighing-pan"),
          floor = bounds("flask-floor"),
          liquid = bounds("supplied-liquid");
        expect(pan.max.y).toBeCloseTo(floor.min.y, 6);
        expect(liquid.min.y).toBeCloseTo(floor.max.y, 6);
        for (let i = 0; i < 5; i++) {
          const box = bounds("schematic-marble-chip-" + i);
          expect(box.min.y).toBeGreaterThanOrEqual(floor.max.y - 1e-6);
          expect(box.max.y).toBeLessThan(liquid.max.y);
        }
        if (closure === "porous-cotton-wool") {
          for (let i = 0; i < 5; i++) {
            const m = root.getObjectByName("porous-wool-cluster-" + i)!;
            expect(
              Math.hypot(m.position.x, m.position.z) - 0.065,
            ).toBeGreaterThan(0.03);
          }
          expect(root.getObjectByName("specified-sealing-cap")).toBeUndefined();
        }
        if (closure === "sealed-boundary") {
          expect(root.getObjectByName("specified-sealing-cap")).toBeDefined();
          expect(
            root.getObjectByName("escaping-gas-boundary-arrow"),
          ).toBeUndefined();
          if (phase === "end")
            expect(bounds("boundary-arrow-head").max.y).toBeLessThan(
              bounds("specified-sealing-cap").min.y,
            );
        }
        if (phase === "start")
          expect(root.getObjectByName("boundary-arrow-head")).toBeUndefined();
        const segments: Record<string, string> = {
          "0": "abcdef",
          "1": "bc",
          "2": "abdeg",
          "3": "abcdg",
          "4": "bcfg",
          "5": "acdfg",
          "6": "acdefg",
          "7": "abc",
          "8": "abcdefg",
          "9": "abcdfg",
        };
        reading
          .toFixed(1)
          .split("")
          .forEach((digit, i) => {
            if (digit === ".") {
              expect(
                root.getObjectByName("reading-decimal-" + i),
              ).toBeDefined();
              return;
            }
            const present = root.children
              .filter((c) => c.name.startsWith("reading-digit-" + i + "-"))
              .map((c) => c.name.at(-1))
              .sort()
              .join("");
            expect(present).toBe(segments[digit]);
          });
        root.traverse((o) => {
          if (o instanceof T.Mesh || o instanceof T.Line) {
            for (const kind of ["position", "normal"]) {
              const a = o.geometry.getAttribute(kind);
              if (a)
                expect(Array.from(a.array).every(Number.isFinite)).toBe(true);
            }
            o.geometry.dispose();
            for (const mat of [o.material].flat()) mat.dispose();
          }
        });
      }
  expect(() =>
    rateFlaskAsset({
      closure: "sealed-boundary",
      phase: "end",
      reading: 100,
      loss: "only-gas",
    } as RateFlaskState),
  ).toThrow("Inconsistent supplied gas boundary");
});
