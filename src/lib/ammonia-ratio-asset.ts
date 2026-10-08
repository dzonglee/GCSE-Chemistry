import * as T from "three";
import { covalentMolecules, moleculePositions } from "./covalent";
export function ammoniaRatioAsset() {
  const root = new T.Group();
  root.name = "ammonia-equation-event";
  root.userData = {
    equation: "N2 + 3H2 -> 2NH3",
    representation:
      "one illustrative equation event, separate before/after groups; not a mole or reaction mechanism",
  };
  const sphere = new T.SphereGeometry(1, 20, 16),
    rod = new T.CylinderGeometry(0.04, 0.04, 1, 12),
    materials = {
      N: new T.MeshStandardMaterial({ color: 0x3c62cf, roughness: 0.4 }),
      H: new T.MeshStandardMaterial({ color: 0xaebbd4, roughness: 0.4 }),
    },
    stick = new T.MeshStandardMaterial({ color: 0x79849a });
  for (const [side, formulas] of [
    ["before", ["N2", "H2", "H2", "H2"]],
    ["after", ["NH3", "NH3"]],
  ] as const) {
    for (const [i, formula] of formulas.entries()) {
      const spec = covalentMolecules[formula],
        positions = moleculePositions(formula),
        atoms = [spec.centre, ...spec.partners],
        group = new T.Group();
      group.name = `${side}-${formula}-${i}`;
      group.userData = { formula, side };
      group.position.set(
        (side === "before" ? -3.6 : 3.6) + ((i % 2) - 0.5) * 3.1,
        ((Math.ceil(formulas.length / 2) - 1) / 2) * 3.2 -
          Math.floor(i / 2) * 3.2,
        0,
      );
      positions.forEach((p, j) => {
        const mesh = new T.Mesh(
          sphere,
          materials[atoms[j].symbol as "N" | "H"],
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
