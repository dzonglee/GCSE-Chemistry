import * as T from "three";
import { ammoniaRatioAsset } from "./ammonia-ratio-asset";
export function theoreticalAmmoniaAsset() {
  const root = ammoniaRatioAsset();
  root.name = "theoretical-ammonia-inventory";
  root.userData = {
    equation: "N2 + 3H2 → 2NH3",
    representation:
      "Illustrative before/ideal-after ratio inventory, not one mol or atom trajectories",
    beforeInventory: "1 N2 and 4 H2",
    afterInventory: "2 NH3 and 1 unused H2",
    relativeMassBefore: 36,
    relativeMassAfter: 36,
  };
  const template = root.children.find((g) => g.name === "before-H2-1")!;
  for (const side of ["before", "after"]) {
    const unused = template.clone(true);
    unused.name = `${side}-H2-unused`;
    unused.userData = {
      formula: "H2",
      side,
      originalId: "unused-hydrogen",
      unused: true,
    };
    unused.traverse((child) => {
      if (child === unused) return;
      child.name = child.name.replace("before-H2-1", `${side}-H2-unused`);
      child.userData = { ...child.userData, side };
      if (child.userData.element)
        child.userData.atomId = `unused-hydrogen-${child.name.split("-atom-")[1]}`;
    });
    root.add(unused);
  }
  for (const side of ["before", "after"]) {
    const molecules = root.children.filter((g) => g.userData.side === side),
      rows = Math.ceil(molecules.length / 2);
    molecules.forEach((g, i) =>
      g.position.set(
        (side === "before" ? -7.5 : 7.5) + ((i % 2) - 0.5) * 4.2,
        ((rows - 1) / 2 - Math.floor(i / 2)) * 4.2,
        0,
      ),
    );
  }
  for (const unused of root.children.filter((g) => g.userData.unused)) {
    const box = new T.Box3().setFromObject(unused),
      size = box.getSize(new T.Vector3()).addScalar(0.4),
      centre = box.getCenter(new T.Vector3()),
      base = new T.BoxGeometry(size.x, size.y, size.z),
      frame = new T.LineSegments(
        new T.EdgesGeometry(base),
        new T.LineBasicMaterial({ color: 0xc7972a }),
      );
    base.dispose();
    frame.name = `unused-frame-${unused.userData.side}`;
    frame.position.copy(centre);
    frame.userData = { unusedSelection: true, notChemicalBond: true };
    root.add(frame);
  }
  return root;
}
