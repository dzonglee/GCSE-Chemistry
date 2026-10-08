import * as T from "three";
export function moltenElectrolysisAsset() {
  const root = new T.Group();
  root.name = "molten-ZnCl2-discharge-reference";
  root.userData = {
    representation:
      "Separate ionic constituents before; neutral zinc and a Cl2 molecule after. Representative identities, not a full molten liquid, apparatus or microscopic discharge mechanism.",
    atomicInventory: "Zn1Cl2",
    totalRepresentedCharge: 0,
  };
  const zinc = new T.MeshStandardMaterial({ color: 0x7184b5, roughness: 0.4 }),
    chlorine = new T.MeshStandardMaterial({ color: 0x3caa72, roughness: 0.45 }),
    bondMaterial = new T.MeshStandardMaterial({ color: 0x8794aa });
  const sphere = new T.SphereGeometry(0.17, 24, 16);
  for (const state of ["before", "after"] as const) {
    const group = new T.Group();
    group.name = state;
    group.position.x = state === "before" ? -1.7 : 1.7;
    group.userData = { state, inventory: "Zn1Cl2", totalCharge: 0 };
    root.add(group);
    const positions: Record<string, [number, number, number]> =
      state === "before"
        ? {
            "zinc-1": [-0.65, 0, 0],
            "chlorine-1": [0.55, 0.48, 0.12],
            "chlorine-2": [0.55, -0.48, -0.12],
          }
        : {
            "zinc-1": [-0.65, 0, 0],
            "chlorine-1": [0.55, 0.38, 0.12],
            "chlorine-2": [0.55, -0.38, -0.12],
          };
    const molecule = new T.Group();
    molecule.name = "after-Cl2-molecule";
    molecule.position.x = 0.55;
    molecule.userData = { rotateAsSubstance: true, species: "Cl2" };
    if (state === "after") group.add(molecule);
    for (const [id, [x, y, z]] of Object.entries(positions)) {
      const element = id.startsWith("zinc") ? "Zn" : "Cl",
        charge = state === "after" ? 0 : element === "Zn" ? 2 : -1,
        atom = new T.Mesh(sphere, element === "Zn" ? zinc : chlorine);
      atom.name = state + "-" + id;
      atom.position.set(
        state === "after" && element === "Cl" ? x - 0.55 : x,
        y,
        z,
      );
      atom.userData = {
        atomicId: id,
        element,
        formalCharge: charge,
        species:
          state === "before"
            ? element === "Zn"
              ? "Zn2+"
              : "Cl−"
            : element === "Zn"
              ? "Zn metal"
              : "Cl2",
        representation: "atomic constituent; not a gram portion",
      };
      if (state === "after" && element === "Cl") molecule.add(atom);
      else group.add(atom);
    }
    if (state === "after") {
      const a = new T.Vector3(...positions["chlorine-1"]),
        b = new T.Vector3(...positions["chlorine-2"]),
        direction = b.clone().sub(a),
        bond = new T.Mesh(
          new T.CylinderGeometry(0.045, 0.045, direction.length(), 12),
          bondMaterial,
        );
      bond.name = "after-Cl2-single-bond";
      bond.position.copy(a.clone().add(b).multiplyScalar(0.5));
      bond.position.x -= 0.55;
      bond.quaternion.setFromUnitVectors(
        new T.Vector3(0, 1, 0),
        direction.normalize(),
      );
      bond.userData = {
        kind: "single-covalent-bond",
        between: ["chlorine-1", "chlorine-2"],
      };
      molecule.add(bond);
    }
    const frame = new T.LineSegments(
      new T.EdgesGeometry(new T.BoxGeometry(2.8, 2.1, 1.3)),
      new T.LineBasicMaterial({ color: 0xc8d0df }),
    );
    frame.name = state + "-visual-frame";
    frame.userData = { notChemicalBonds: true };
    group.add(frame);
  }
  return root;
}
