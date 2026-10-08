import * as T from "three";
import {
  covalentMolecules,
  moleculePositions,
  type CovalentMolecule,
} from "./covalent";
export function reactionAsset(coefficients: readonly number[]) {
  if (
    coefficients.length !== 4 ||
    coefficients.some((v) => !Number.isInteger(v) || v < 1 || v > 8)
  )
    throw Error("Use four complete molecular amounts from one to eight");
  const root = new T.Group();
  root.name = "methane-combustion-amounts";
  root.userData = {
    reaction: "CH4 + O2 -> CO2 + H2O",
    coefficients: [...coefficients],
    representation:
      "separate before-and-after quantities, not atom trajectories",
  };
  const sphere = new T.SphereGeometry(1, 20, 16),
    rod = new T.CylinderGeometry(0.045, 0.045, 1, 12),
    colours: Record<string, number> = { H: 0xaebbd4, C: 0x344055, O: 0xc95166 },
    materials = Object.fromEntries(
      Object.entries(colours).map(([k, color]) => [
        k,
        new T.MeshStandardMaterial({ color, roughness: 0.4 }),
      ]),
    ),
    stick = new T.MeshStandardMaterial({ color: 0x7b8499 });
  const formulas: CovalentMolecule[] = ["CH4", "O2", "CO2", "H2O"];
  for (const [side, indices] of [
    ["reactant", [0, 1]],
    ["product", [2, 3]],
  ] as const) {
    const total = indices.reduce<number>((sum, i) => sum + coefficients[i], 0),
      rows = Math.ceil(total / 2);
    let slot = 0;
    for (const i of indices)
      for (let copy = 0; copy < coefficients[i]; copy++) {
        const formula = formulas[i],
          spec = covalentMolecules[formula],
          positions = moleculePositions(formula),
          atoms = [spec.centre, ...spec.partners],
          group = new T.Group();
        group.name = `${side}-${formula}-${copy}`;
        group.userData = { formula, side };
        group.position.set(
          (side === "reactant" ? -4 : 4) + ((slot % 2) - 0.5) * 3.2,
          ((rows - 1) / 2 - Math.floor(slot / 2)) * 3.2,
          0,
        );
        slot++;
        positions.forEach((p, j) => {
          const mesh = new T.Mesh(sphere, materials[atoms[j].symbol]);
          mesh.name = `${side}-${formula}-${copy}-atom-${j}-${atoms[j].symbol}`;
          mesh.position.set(...p);
          mesh.scale.setScalar(atoms[j].symbol === "H" ? 0.22 : 0.34);
          group.add(mesh);
        });
        for (let j = 1; j < positions.length; j++) {
          const a = new T.Vector3(...positions[0]),
            b = new T.Vector3(...positions[j]),
            delta = b.clone().sub(a),
            mesh = new T.Mesh(rod, stick);
          mesh.name = `${side}-${formula}-${copy}-connection-${j}`;
          mesh.position.copy(a.clone().add(b).multiplyScalar(0.5));
          mesh.scale.y = delta.length();
          mesh.quaternion.setFromUnitVectors(
            new T.Vector3(0, 1, 0),
            delta.normalize(),
          );
          group.add(mesh);
        }
        root.add(group);
      }
  }
  return root;
}
