import * as T from "three";
import { covalentMolecules, moleculePositions } from "./covalent";
export function limitingInventoryAsset() {
  const root = new T.Group();
  root.name = "limiting-methane-inventory";
  root.userData = {
    equation: "CH4 + 2O2 -> CO2 + 2H2O",
    representation:
      "one illustrative finite collection: 3 CH4 and 4 O2 initially, 2 CO2 and 4 H2O plus 1 unchanged CH4 finally; not mol quantities or a reaction mechanism",
  };
  const sphere = new T.SphereGeometry(1, 20, 16),
    rod = new T.CylinderGeometry(0.04, 0.04, 1, 12),
    materials = {
      C: new T.MeshStandardMaterial({ color: 0x344254, roughness: 0.4 }),
      O: new T.MeshStandardMaterial({ color: 0xd84853, roughness: 0.4 }),
      H: new T.MeshStandardMaterial({ color: 0xaebbd4, roughness: 0.4 }),
    },
    stick = new T.MeshStandardMaterial({ color: 0x79849a });
  for (const [side, formulas] of [
    ["before", ["CH4", "CH4", "CH4", "O2", "O2", "O2", "O2"]],
    ["after", ["CO2", "CO2", "H2O", "H2O", "H2O", "H2O", "CH4"]],
  ] as const) {
    for (const [i, formula] of formulas.entries()) {
      const spec = covalentMolecules[formula],
        positions = moleculePositions(formula),
        atoms = [spec.centre, ...spec.partners],
        group = new T.Group();
      group.name = `${side}-${formula}-${i}`;
      group.userData = {
        formula,
        side,
        unreacted: side === "after" && formula === "CH4",
        originalId:
          formula === "CH4" &&
          ((side === "before" && i === 2) || side === "after")
            ? "retained-methane-2"
            : undefined,
      };
      group.position.set(
        (side === "before" ? -7.5 : 7.5) + ((i % 3) - 1) * 4.2,
        ((Math.ceil(formulas.length / 3) - 1) / 2) * 3.4 -
          Math.floor(i / 3) * 3.4,
        0,
      );
      positions.forEach((p, j) => {
        const mesh = new T.Mesh(
          sphere,
          materials[atoms[j].symbol as "C" | "O" | "H"],
        );
        mesh.name = `${side}-${formula}-${i}-atom-${j}-${atoms[j].symbol}`;
        mesh.userData = { element: atoms[j].symbol, side };
        mesh.position.set(...p);
        mesh.scale.setScalar(atoms[j].symbol === "H" ? 0.22 : 0.34);
        group.add(mesh);
      });
      for (let j = 1; j < positions.length; j++) {
        const a = new T.Vector3(...positions[0]),
          b = new T.Vector3(...positions[j]),
          delta = b.clone().sub(a),
          order = spec.orders[j - 1];
        for (let k = 0; k < order; k++) {
          const mesh = new T.Mesh(rod, stick);
          mesh.name = `${side}-${formula}-${i}-bond-${j}-${k}`;
          mesh.userData = { order };
          mesh.position.copy(a.clone().add(b).multiplyScalar(0.5));
          if (order > 1) mesh.position.y += (k - (order - 1) / 2) * 0.16;
          mesh.scale.y = delta.length();
          mesh.quaternion.setFromUnitVectors(
            new T.Vector3(0, 1, 0),
            delta.clone().normalize(),
          );
          group.add(mesh);
        }
      }
      root.add(group);
    }
  }
  return root;
}
