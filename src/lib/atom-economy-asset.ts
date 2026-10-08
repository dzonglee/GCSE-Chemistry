import * as T from "three";
import { reactionAsset } from "./reaction-asset";
export function economyAllocationAsset(desired: "CO2" | "H2O") {
  if (desired !== "CO2" && desired !== "H2O")
    throw Error("Select a supplied product");
  const root = reactionAsset([1, 2, 1, 2]);
  root.name = "atom-economy-mass-allocation";
  root.userData = {
    ...root.userData,
    desired,
    totalRelativeMass: 80,
    desiredRelativeMass: desired === "CO2" ? 44 : 36,
    representation:
      "Complete molecules before and after, with schematic product selection frames; not atom trajectories, mass-scaled balls or measured grams",
  };
  for (const molecule of [...root.children]) {
    for (const connection of [...molecule.children].filter((c) =>
      c.name.includes("-connection-"),
    )) {
      connection.userData = {
        bondOrder:
          molecule.userData.formula === "O2" ||
          molecule.userData.formula === "CO2"
            ? 2
            : 1,
      };
      if (connection.userData.bondOrder === 2) {
        connection.position.y -= 0.08;
        const second = connection.clone();
        second.name += "-second";
        second.position.y += 0.16;
        molecule.add(second);
      }
    }
    if (molecule.userData.side !== "product") continue;
    molecule.userData = {
      ...molecule.userData,
      isDesired: molecule.userData.formula === desired,
      relativeMass: molecule.userData.formula === "CO2" ? 44 : 18,
    };
    const box = new T.Box3().setFromObject(molecule),
      size = box.getSize(new T.Vector3()).addScalar(0.4),
      centre = box.getCenter(new T.Vector3());
    const frameBox = new T.BoxGeometry(size.x, size.y, size.z);
    const frame = new T.LineSegments(
      new T.EdgesGeometry(frameBox),
      new T.LineBasicMaterial({
        color: molecule.userData.isDesired ? 0x3345c8 : 0xa3adc0,
      }),
    );
    frameBox.dispose();
    frame.name = `selection-frame-${molecule.name}`;
    frame.position.copy(centre);
    frame.userData = {
      selectionFrame: true,
      isDesired: molecule.userData.isDesired,
      notChemicalBond: true,
    };
    root.add(frame);
  }
  return root;
}
