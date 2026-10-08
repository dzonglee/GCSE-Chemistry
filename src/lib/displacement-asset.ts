import * as T from "three";
/** Representative correspondence; no hydration, metal lattice or kinetic mechanism. */
export function displacementAsset() {
  const root = new T.Group();
  root.name = "copper-silver-displacement-with-nitrate-spectators";
  root.userData = {
    equation: "Cu + 2Ag⁺ → Cu²⁺ + 2Ag",
    atomicInventory: "Cu1Ag2N2O6",
    atomicConstituentsPerState: 11,
    totalChargePerState: 0,
    netEquationChargePerSide: 2,
    representation:
      "Schematic atomic correspondence. Hydration, bulk solvent and metal lattices omitted. Nitrate connectivity rods do not assign localised single/double bonds. Spectators remain present; electrons are bookkeeping rather than free solution atoms.",
  };
  const sphere = new T.SphereGeometry(1, 24, 18);
  const materials = {
    Cu: new T.MeshStandardMaterial({ color: 0xb87349 }),
    Ag: new T.MeshStandardMaterial({ color: 0xa6b1c3 }),
    N: new T.MeshStandardMaterial({ color: 0x435cca }),
    O: new T.MeshStandardMaterial({ color: 0xc05464 }),
  };
  const bondMaterial = new T.MeshStandardMaterial({ color: 0x8996ac });
  for (const [index, state] of ["before", "after"].entries()) {
    const frame = new T.Group();
    frame.name = state;
    frame.position.x = index === 0 ? -2.5 : 2.5;
    frame.userData = {
      state,
      totalCharge: 0,
      atomicInventory: "Cu1Ag2N2O6",
      rotationCentre: "each represented substance",
    };
    root.add(frame);
    const part = (name: string, charge: number, p: T.Vector3) => {
      const g = new T.Group();
      g.name = state + "-" + name;
      g.position.copy(p);
      g.userData = {
        representedSubstance: name,
        speciesCharge: charge,
        rotateAsSubstance: true,
      };
      frame.add(g);
      return g;
    };
    const atom = (
      g: T.Group,
      id: string,
      element: keyof typeof materials,
      p: T.Vector3,
    ) => {
      const m = new T.Mesh(sphere, materials[element]);
      m.name = state + "-" + id;
      m.position.copy(p);
      m.scale.setScalar(element === "Cu" || element === "Ag" ? 0.16 : 0.13);
      m.userData = { kind: "atomic-constituent", atomicId: id, element };
      g.add(m);
    };
    const copper = part(
      state === "before" ? "Cu" : "Cu2+",
      state === "before" ? 0 : 2,
      new T.Vector3(-0.9, 1, 0),
    );
    atom(copper, "Cu-1", "Cu", new T.Vector3());
    for (let i = 0; i < 2; i++) {
      const silver = part(
        (state === "before" ? "Ag+" : "Ag") + "-" + (i + 1),
        state === "before" ? 1 : 0,
        new T.Vector3(0.55 + i * 0.65, 1, i === 0 ? -0.3 : 0.3),
      );
      atom(silver, "Ag-" + (i + 1), "Ag", new T.Vector3());
      const nitrate = part(
        "NO3-" + (i + 1),
        -1,
        new T.Vector3(i === 0 ? -1 : 1, -0.65, i === 0 ? -0.22 : 0.22),
      );
      nitrate.userData.geometry =
        "trigonal planar connectivity; schematic equal rods; delocalisation not drawn as a fixed double bond";
      atom(nitrate, "N-" + (i + 1), "N", new T.Vector3());
      for (let j = 0; j < 3; j++) {
        const p = new T.Vector3(
          0.75 * Math.cos((j * 2 * Math.PI) / 3),
          0.75 * Math.sin((j * 2 * Math.PI) / 3),
          0,
        ).applyEuler(new T.Euler(Math.PI / 5, Math.PI / 7, Math.PI / 9));
        atom(nitrate, "O-" + (i + 1) + "-" + (j + 1), "O", p);
        const rod = new T.Mesh(
          new T.CylinderGeometry(0.025, 0.025, p.length(), 12),
          bondMaterial,
        );
        rod.name = state + "-nitrate-" + (i + 1) + "-connectivity-" + (j + 1);
        rod.position.copy(p).multiplyScalar(0.5);
        rod.quaternion.setFromUnitVectors(
          new T.Vector3(0, 1, 0),
          p.clone().normalize(),
        );
        rod.userData = {
          kind: "connectivity-guide",
          localisedBondOrder: false,
        };
        nitrate.add(rod);
      }
    }
  }
  return root;
}
