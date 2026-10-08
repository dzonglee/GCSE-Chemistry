import * as T from "three";
/** A qualitative, conserved ion inventory. Geometry does not represent one mol. */
export function molarDilutionAsset(dilutes = true) {
  const root = new T.Group();
  root.name = "aqueous-salt-dilution";
  root.userData = {
    representation:
      "Illustrative Na+ and Cl− inventory, not one mol, hydration or atom trajectories; water omitted",
    solute: "NaCl",
    initialConcentration: 0.4,
    finalConcentration: dilutes ? 0.2 : 0.4,
    amountConserved: true,
    volumeRatio: dilutes ? 2 : 1,
  };
  const sphere = new T.SphereGeometry(0.23, 20, 14);
  const sodium = new T.MeshStandardMaterial({
    color: 0x4056ce,
    roughness: 0.38,
  });
  const chloride = new T.MeshStandardMaterial({
    color: 0xd2a137,
    roughness: 0.38,
  });
  const sodiumCoordinates = [
    [-0.8, -0.7, -0.65],
    [0.65, 0.8, -0.5],
    [0.8, -0.5, 0.7],
    [-0.6, 0.55, 0.75],
  ];
  const chlorideCoordinates = [
    [0.7, 0.55, 0.7],
    [-0.7, -0.55, 0.65],
    [-0.55, 0.7, -0.7],
    [0.55, -0.8, -0.5],
  ];
  for (const side of ["before", "after"] as const) {
    const solution = new T.Group();
    solution.name = `${side}-solution`;
    const factor = side === "before" || !dilutes ? 1 : Math.cbrt(2);
    solution.position.x = side === "before" ? -2.2 : 2.2;
    solution.userData = {
      side,
      relativeVolume: side === "before" || !dilutes ? 1 : 2,
      concentration: side === "before" || !dilutes ? 0.4 : 0.2,
    };
    const box = new T.BoxGeometry(2.4 * factor, 2.4 * factor, 2.4 * factor);
    const boundary = new T.LineSegments(
      new T.EdgesGeometry(box),
      new T.LineBasicMaterial({ color: 0x96b0c8 }),
    );
    box.dispose();
    boundary.name = `${side}-final-solution-volume`;
    boundary.userData = { solutionBoundary: true, notChemicalBond: true };
    solution.add(boundary);
    for (let i = 0; i < sodiumCoordinates.length; i++)
      for (const [element, charge, material, sign] of [
        ["Na", 1, sodium, -1],
        ["Cl", -1, chloride, 1],
      ] as const) {
        const ion = new T.Mesh(sphere, material);
        ion.name = `${side}-${element}-ion-${i + 1}`;
        const p = (sign === -1 ? sodiumCoordinates : chlorideCoordinates)[i];
        ion.position.set(p[0] * factor, p[1] * factor, p[2] * factor);
        ion.userData = {
          element,
          charge,
          ionId: `${element}-${i + 1}`,
          side,
          notMolecule: true,
        };
        solution.add(ion);
      }
    root.add(solution);
  }
  return root;
}
