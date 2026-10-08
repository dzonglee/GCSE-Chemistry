import * as T from "three";
import { limitingInventoryAsset } from "./limiting-inventory-asset";
import { gasRecords, methaneDryGas } from "./gas-volumes";
export type DryGasRecord = keyof typeof gasRecords.remaining;
export function dryGasInventoryAsset(record: DryGasRecord = "initial") {
  const data = gasRecords.remaining[record],
    result = methaneDryGas(data.methane, data.oxygen),
    root = new T.Group();
  root.name = "methane-dry-gas-and-collected-water";
  root.userData = {
    record,
    equation: "CH4(g)+2O2(g)→CO2(g)+2H2O(l)",
    representation:
      "Illustrative molecular amount ratios, not one molecule per10cm³ or one mole; before and final dry gases measured at RTP; liquid-water tray not to volume scale",
    initialGasCm3: result.initialGas,
    finalDryGasCm3: result.totalDryGas,
  };
  const source = limitingInventoryAsset(),
    templates: Record<string, T.Object3D> = {};
  for (const group of source.children)
    if (!templates[group.userData.formula])
      templates[group.userData.formula] = group;
  const methane = data.methane / 10,
    oxygen = data.oxygen / 10,
    extent = Math.min(methane, oxygen / 2);
  const before = [...Array(methane).fill("CH4"), ...Array(oxygen).fill("O2")];
  const after = [
    ...Array(extent).fill("CO2"),
    ...Array(methane - extent).fill("CH4"),
    ...Array(oxygen - 2 * extent).fill("O2"),
  ];
  const water = Array(2 * extent).fill("H2O");
  const unused = {
    CH4: Math.max(0, methane - extent),
    O2: Math.max(0, oxygen - 2 * extent),
  };
  for (const [side, phase, formulas, volume] of [
    ["before", "gas", before, result.initialGas],
    ["after", "gas", after, result.totalDryGas],
    ["after", "liquid", water, 0],
  ] as const) {
    const inventory = new T.Group();
    inventory.name = `${side}-${phase}-inventory`;
    inventory.position.set(
      side === "before" ? -8 : 8,
      phase === "liquid" ? -7 : 1,
      0,
    );
    inventory.userData = {
      side,
      phase,
      volumeCm3: phase === "gas" ? volume : undefined,
      notLiquidVolume: phase === "liquid",
    };
    const sideLength = phase === "gas" ? 10 * Math.cbrt(volume / 70) : 0;
    const box =
      phase === "gas"
        ? new T.BoxGeometry(sideLength, sideLength, sideLength)
        : new T.BoxGeometry(7, 2.2, 6);
    const frame = new T.LineSegments(
      new T.EdgesGeometry(box),
      new T.LineBasicMaterial({ color: phase === "gas" ? 0x8ba2be : 0xc7972a }),
    );
    box.dispose();
    frame.name = `${side}-${phase}-boundary`;
    frame.userData = {
      gasVolumeBoundary: phase === "gas",
      schematicLiquidTray: phase === "liquid",
      notChemicalBond: true,
    };
    inventory.add(frame);
    const counts: Record<string, number> = {},
      columns = formulas.length === 1 ? 1 : formulas.length > 4 ? 3 : 2,
      rows = Math.ceil(formulas.length / columns);
    formulas.forEach((formula, i) => {
      const molecule = templates[formula].clone(true),
        index = counts[formula] ?? 0;
      counts[formula] = index + 1;
      molecule.name = `${side}-${phase}-${formula}-${index}`;
      const retained =
        formula in unused &&
        (side === "before"
          ? index >=
            { CH4: methane, O2: oxygen }[formula as "CH4" | "O2"] -
              unused[formula as "CH4" | "O2"]
          : unused[formula as "CH4" | "O2"] > 0);
      const originalIndex =
        side === "before"
          ? index
          : ({ CH4: methane, O2: oxygen }[formula as "CH4" | "O2"] ?? 0) -
            unused[formula as "CH4" | "O2"] +
            index;
      molecule.userData = {
        formula,
        side,
        phase,
        unreacted: retained,
        originalId: retained
          ? `retained-${formula}-${originalIndex}`
          : undefined,
        gasContribution: phase === "gas" ? 1 : 0,
      };
      if (phase === "liquid")
        molecule.position.set(
          ((i % 2) - 0.5) * 3.2,
          0,
          (Math.floor(i / 2) - (rows - 1) / 2) * 3,
        );
      else
        molecule.position.set(
          ((i % columns) - (columns - 1) / 2) * 3,
          ((rows - 1) / 2 - Math.floor(i / columns)) * 3,
          i % 2 ? 0.55 : -0.55,
        );
      molecule.traverse((child) => {
        if (child === molecule) return;
        child.userData = { ...child.userData, side, phase };
        child.name = `${molecule.name}-${child.name.split("-atom-")[1] ?? child.name.split("-bond-")[1] ?? child.name}`;
      });
      inventory.add(molecule);
    });
    root.add(inventory);
  }
  return root;
}
