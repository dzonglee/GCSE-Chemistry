import * as T from "three";
export function copperTransferAsset() {
  const root = new T.Group();
  root.name = "copper-electrode-transfer-reference";
  root.userData = {
    atomicInventory: "Cu7S1O4",
    totalRepresentedCharge: 0,
    representation:
      "Selected atomic constituents, copper electrodes and separate aqueous ions; water and hydration omitted. Not CuSO4 molecules or a complete apparatus.",
  };
  const copper = new T.MeshStandardMaterial({
      color: 0xbf754a,
      roughness: 0.4,
    }),
    sulfur = new T.MeshStandardMaterial({ color: 0xe6b633 }),
    oxygen = new T.MeshStandardMaterial({ color: 0xd84d62 }),
    rod = new T.MeshStandardMaterial({ color: 0x8b97aa });
  const atom = (
    parent: T.Group,
    id: string,
    element: string,
    position: [number, number, number],
    species: string,
  ) => {
    const a = new T.Mesh(
      new T.SphereGeometry(element === "O" ? 0.095 : 0.12, 24, 16),
      element === "Cu" ? copper : element === "S" ? sulfur : oxygen,
    );
    a.name = parent.name + "-" + id;
    a.position.set(...position);
    a.userData = {
      atomicId: id,
      element,
      species,
      representation: "atomic constituent; not a mass parcel",
    };
    parent.add(a);
    return a;
  };
  for (const state of ["before", "after"] as const) {
    const g = new T.Group();
    g.name = state;
    g.position.x = state === "before" ? -1.9 : 1.9;
    g.userData = { state, inventory: "Cu7S1O4", totalCharge: 0 };
    root.add(g);
    const anode = new T.Group();
    anode.name = state + "-positive-copper-anode";
    anode.position.x = -1.15;
    anode.userData = { species: "Cu metal", ionicCharge: 0 };
    g.add(anode);
    const cathode = new T.Group();
    cathode.name = state + "-negative-copper-cathode";
    cathode.position.x = 1.15;
    cathode.userData = { species: "Cu metal", ionicCharge: 0 };
    g.add(cathode);
    for (let i = 1; i <= 3; i++) {
      if (state === "before" || i < 3)
        atom(
          anode,
          "Cu-anode-" + i,
          "Cu",
          [0, state === "before" ? (i - 2) * 0.9 : (i - 1.5) * 0.9, 0],
          "Cu metal",
        );
      atom(
        cathode,
        "Cu-cathode-" + i,
        "Cu",
        [0, state === "before" ? (i - 2) * 0.9 : (i - 2.5) * 0.6, 0],
        "Cu metal",
      );
    }
    if (state === "after")
      atom(cathode, "Cu-solution-1", "Cu", [0, 0.9, 0], "Cu metal");
    const ion = new T.Group();
    ion.name = state + "-aqueous-copper-ion";
    ion.position.y = 0.9;
    ion.userData = { species: "Cu2+(aq)", ionicCharge: 2 };
    g.add(ion);
    atom(
      ion,
      state === "before" ? "Cu-solution-1" : "Cu-anode-3",
      "Cu",
      [0, 0, 0],
      "Cu2+(aq)",
    );
    const sulfate = new T.Group();
    sulfate.name = state + "-intact-sulfate-ion";
    sulfate.position.y = -0.65;
    sulfate.userData = {
      species: "SO4²−(aq)",
      ionicCharge: -2,
      rotateAsSubstance: true,
    };
    g.add(sulfate);
    const orientation = new T.Group();
    orientation.name = state + "-sulfate-geometry";
    sulfate.add(orientation);
    atom(orientation, "S-1", "S", [0, 0, 0], "SO4²−(aq)");
    for (const [i, coords] of (
      [
        [1, 1, 1],
        [1, -1, -1],
        [-1, 1, -1],
        [-1, -1, 1],
      ] as [number, number, number][]
    ).entries()) {
      const p = new T.Vector3(...coords).normalize().multiplyScalar(0.48);
      atom(orientation, "O-" + (i + 1), "O", [p.x, p.y, p.z], "SO4²−(aq)");
      const bond = new T.Mesh(
        new T.CylinderGeometry(0.025, 0.025, p.length(), 12),
        rod,
      );
      bond.position.copy(p.clone().multiplyScalar(0.5));
      bond.quaternion.setFromUnitVectors(
        new T.Vector3(0, 1, 0),
        p.clone().normalize(),
      );
      bond.userData = {
        kind: "sulfate-connection",
        between: ["S-1", "O-" + (i + 1)],
        representation:
          "schematic internal connections, not a bond-order claim",
      };
      orientation.add(bond);
    }
    const frame = new T.LineSegments(
      new T.EdgesGeometry(new T.BoxGeometry(3.4, 3.2, 1.8)),
      new T.LineBasicMaterial({ color: 0xc8d0df }),
    );
    frame.name = state + "-visual-frame";
    frame.userData = { kind: "visual-guide-not-bonds" };
    g.add(frame);
  }
  return root;
}
