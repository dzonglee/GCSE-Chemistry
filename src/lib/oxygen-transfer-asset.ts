import * as T from "three";
/** Identity/conservation representation, not a reaction mechanism or complete solid lattice. */
export function oxygenTransferAsset() {
  const root = new T.Group();
  root.name = "same-Cu2-C1-O2-oxygen-transfer-states";
  root.userData = {
    equation: "2CuO + C → 2Cu + CO2",
    atomicConstituentsPerState: 5,
    totalChargePerState: 0,
    representation:
      "Initial oxide is an ionic-solid crop, not CuO molecules. Carbon/metal surfaces are representative crops. Product CO2 is a separate linear molecule. Oxygen identity is tracked, not a microscopic mechanism.",
  };
  const sphere = new T.SphereGeometry(1, 24, 18),
    materials = {
      Cu: new T.MeshStandardMaterial({ color: 0xb36a36 }),
      C: new T.MeshStandardMaterial({ color: 0x46516b }),
      O: new T.MeshStandardMaterial({ color: 0xc05464 }),
    },
    link = new T.MeshStandardMaterial({ color: 0x9aa4b5 }),
    surfaceMaterial = new T.MeshStandardMaterial({
      color: 0xe2e6ee,
      roughness: 1,
    });
  for (const [index, state] of ["before", "after"].entries()) {
    const group = new T.Group();
    group.name = `oxygen-transfer-${state}`;
    group.position.x = index === 0 ? -1.4 : 1.4;
    root.add(group);
    function atom(
      id: string,
      element: keyof typeof materials,
      position: T.Vector3,
      phase: string,
      charge: number,
      parentSpecies: string,
    ) {
      const mesh = new T.Mesh(sphere, materials[element]);
      mesh.name = `${state}-atom-${id}`;
      mesh.position.copy(position);
      mesh.scale.setScalar(
        element === "Cu" ? 0.18 : element === "C" ? 0.17 : 0.14,
      );
      mesh.userData = { particleId: id, element, phase, charge, parentSpecies };
      group.add(mesh);
      return mesh;
    }
    if (state === "before") {
      atom(
        "Cu-0",
        "Cu",
        new T.Vector3(-0.68, 0.3, -0.22),
        "solid",
        2,
        "CuO ionic-solid crop",
      );
      atom(
        "Cu-1",
        "Cu",
        new T.Vector3(-0.68, -0.25, 0.22),
        "solid",
        2,
        "CuO ionic-solid crop",
      );
      atom(
        "O-0",
        "O",
        new T.Vector3(-0.22, 0.3, 0.22),
        "solid",
        -2,
        "CuO ionic-solid crop",
      );
      atom(
        "O-1",
        "O",
        new T.Vector3(-0.22, -0.25, -0.22),
        "solid",
        -2,
        "CuO ionic-solid crop",
      );
      atom(
        "C-0",
        "C",
        new T.Vector3(0.65, -0.25, 0),
        "solid",
        0,
        "carbon surface crop",
      );
    } else {
      atom(
        "Cu-0",
        "Cu",
        new T.Vector3(-0.68, 0.3, -0.22),
        "solid",
        0,
        "metal surface crop",
      );
      atom(
        "Cu-1",
        "Cu",
        new T.Vector3(-0.68, -0.25, 0.22),
        "solid",
        0,
        "metal surface crop",
      );
      atom("C-0", "C", new T.Vector3(0.45, 0.15, 0), "gas", 0, "CO2 molecule");
      atom("O-0", "O", new T.Vector3(0.45, 0.7, 0), "gas", 0, "CO2 molecule");
      atom("O-1", "O", new T.Vector3(0.45, -0.4, 0), "gas", 0, "CO2 molecule");
      for (const [i, dy] of [0.55, -0.55].entries())
        for (const [j, dx] of [-0.04, 0.04].entries()) {
          const rod = new T.Mesh(
            new T.CylinderGeometry(0.018, 0.018, 0.55, 12),
            link,
          );
          rod.position.set(0.45 + dx, 0.15 + dy / 2, 0);
          rod.name = `after-CO2-double-bond-${i}-${j}`;
          rod.userData = {
            bondOrder: 2,
            fromAtom: "C-0",
            toAtom: `O-${i}`,
            sameBondComponent: j,
          };
          group.add(rod);
        }
    }
    const oxideOrMetal = new T.Mesh(
      new T.BoxGeometry(
        state === "before" ? 1.1 : 0.65,
        0.04,
        state === "before" ? 0.9 : 0.7,
      ),
      surfaceMaterial,
    );
    oxideOrMetal.position.set(state === "before" ? -0.45 : -0.68, -0.47, 0);
    oxideOrMetal.name = `${state}-solid-surface-crop`;
    oxideOrMetal.userData = { notAdditionalAtoms: true, phaseCueOnly: true };
    group.add(oxideOrMetal);
    if (state === "before") {
      const carbon = new T.Mesh(
        new T.BoxGeometry(0.5, 0.04, 0.5),
        surfaceMaterial,
      );
      carbon.position.set(0.65, -0.47, 0);
      carbon.name = "before-carbon-surface-crop";
      carbon.userData = { notAdditionalAtoms: true, phaseCueOnly: true };
      group.add(carbon);
    }
    // Rotate each represented substance around its own centre so phases stay distinguishable.
    const objects = [...group.children];
    const parts =
      state === "before"
        ? [
            {
              name: "oxide",
              centre: new T.Vector3(-0.45, 0.025, 0),
              accepts: (n: T.Object3D) =>
                n.userData.parentSpecies === "CuO ionic-solid crop" ||
                n.name.endsWith("solid-surface-crop"),
            },
            {
              name: "carbon",
              centre: new T.Vector3(0.65, -0.25, 0),
              accepts: (n: T.Object3D) =>
                n.userData.parentSpecies === "carbon surface crop" ||
                n.name.endsWith("carbon-surface-crop"),
            },
          ]
        : [
            {
              name: "metal",
              centre: new T.Vector3(-0.68, 0.025, 0),
              accepts: (n: T.Object3D) =>
                n.userData.element === "Cu" ||
                n.name.endsWith("solid-surface-crop"),
            },
            {
              name: "molecule",
              centre: new T.Vector3(0.45, 0.15, 0),
              accepts: (n: T.Object3D) =>
                n.userData.parentSpecies === "CO2 molecule" ||
                n.userData.bondOrder === 2,
            },
          ];
    for (const part of parts) {
      const substance = new T.Group();
      substance.name = `${state}-${part.name}-rotation-group`;
      substance.position.copy(part.centre);
      substance.userData = {
        rotateAsSubstance: true,
        representedSubstance: part.name,
      };
      group.add(substance);
      for (const object of objects.filter(part.accepts))
        substance.attach(object);
    }
    const frame = new T.LineSegments(
      new T.EdgesGeometry(new T.BoxGeometry(2.4, 1.55, 1.25)),
      new T.LineBasicMaterial({ color: 0xaab5c8 }),
    );
    frame.position.y = 0.1;
    frame.name = `${state}-schematic-boundary`;
    frame.userData = { notChemicalBonds: true };
    group.add(frame);
  }
  return root;
}
