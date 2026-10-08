import { test, expect } from "@playwright/test";
import * as T from "three";
import {
  dryGasInventoryAsset,
  type DryGasRecord,
} from "../src/lib/gas-inventory-asset";
const records: DryGasRecord[] = ["initial", "oxygenExcess", "stoichiometric"];
test("every actual methane inventory conserves complete atom counts while liquid water leaves the gas count", () => {
  for (const record of records) {
    const root = dryGasInventoryAsset(record),
      counts: Record<string, Record<string, number>> = {
        before: {},
        after: {},
      };
    root.traverse((n) => {
      if (n.userData.element) {
        const b = counts[n.userData.side];
        b[n.userData.element] = (b[n.userData.element] ?? 0) + 1;
      }
    });
    expect(counts.before).toEqual(counts.after);
    expect(counts.before).toEqual(
      record === "initial"
        ? { C: 3, H: 12, O: 8 }
        : record === "oxygenExcess"
          ? { C: 1, H: 4, O: 6 }
          : { C: 1, H: 4, O: 4 },
    );
    const gas = root.children.filter((g) => g.userData.phase === "gas"),
      water = root.children.find((g) => g.userData.phase === "liquid")!;
    expect(
      water.children
        .filter((n) => n.userData.formula)
        .every(
          (n) =>
            n.userData.formula === "H2O" && n.userData.gasContribution === 0,
        ),
    ).toBe(true);
    const gasCounts = gas.map(
      (g) => g.children.filter((n) => n.userData.formula).length,
    );
    expect(gasCounts).toEqual(
      record === "initial"
        ? [7, 3]
        : record === "oxygenExcess"
          ? [4, 2]
          : [3, 1],
    );
  }
});
test("exported geometry candidates have real common-scale gas volumes, contained molecules and unchanged unused identities", () => {
  for (const record of records) {
    const root = dryGasInventoryAsset(record),
      volumes: number[] = [];
    root.updateMatrixWorld(true);
    for (const group of root.children.filter(
      (g) => g.userData.phase === "gas",
    )) {
      const frame = group.children.find((n) => n.userData.gasVolumeBoundary)!;
      const bounds = new T.Box3().setFromObject(frame),
        size = bounds.getSize(new T.Vector3());
      volumes.push(size.x * size.y * size.z);
      for (const molecule of group.children.filter((n) => n.userData.formula))
        expect(bounds.containsBox(new T.Box3().setFromObject(molecule))).toBe(
          true,
        );
    }
    expect(volumes[1] / volumes[0]).toBeCloseTo(
      root.userData.finalDryGasCm3 / root.userData.initialGasCm3,
      5,
    );
    const unused = root.children
      .flatMap((g) => g.children)
      .filter((n) => n.userData.unreacted);
    expect(unused.map((n) => n.userData.originalId)).toEqual(
      record === "stoichiometric"
        ? []
        : record === "initial"
          ? ["retained-CH4-2", "retained-CH4-2"]
          : ["retained-O2-2", "retained-O2-2"],
    );
    expect(
      root.children.find((g) => g.userData.phase === "liquid")!.userData
        .notLiquidVolume,
    ).toBe(true);
  }
});
