import * as T from "three";
import { metalDisplacement } from "./metal-reactivity";
export function metalDisplacementAsset(
  added: "Zn" | "Mg" | "Fe" | "Cu",
  dissolved: "Zn" | "Mg" | "Fe" | "Cu",
) {
  const outcome = metalDisplacement(added, dissolved),
    root = new T.Group();
  root.name = "metal-displacement-same-constituents-two-states";
  root.userData = {
    addedMetal: added,
    dissolvedMetal: dissolved,
    reacts: outcome.reacts,
    atomicConstituentsPerState: 7,
    totalChargePerState: 0,
    representation:
      "Two states of the same representative event: one metal-surface atom, one dissolved2+metal ion and one intact sulfate2- spectator. Water/hydration and complete bulk metal lattices omitted. Separate aqueous ions,NOT salt molecules. Equal sulfate connections show tetrahedral arrangement,not a Lewis bond-order assignment.",
  };
  const colors: Record<string, number> = {
      Zn: 0x90a0b8,
      Mg: 0xb0b7c7,
      Fe: 0x637486,
      Cu: 0xb36a36,
      S: 0xe5bd45,
      O: 0xc05464,
    },
    sphere = new T.SphereGeometry(1, 24, 18),
    materials = Object.fromEntries(
      Object.entries(colors).map(([symbol, color]) => [
        symbol,
        new T.MeshStandardMaterial({ color, roughness: 0.4 }),
      ]),
    ),
    linkMaterial = new T.MeshStandardMaterial({ color: 0x8790a4 }),
    solidMaterial = new T.MeshStandardMaterial({ color: 0xd5dae3 }),
    frameMaterial = new T.LineBasicMaterial({ color: 0x8997ad });
  const directions = [
    new T.Vector3(1, 1, 1),
    new T.Vector3(1, -1, -1),
    new T.Vector3(-1, 1, -1),
    new T.Vector3(-1, -1, 1),
  ].map((v) => v.normalize());
  for (const [state, x] of [
    ["before", -1.3],
    ["after", 1.3],
  ] as const) {
    const group = new T.Group();
    group.name = `displacement-${state}`;
    group.position.x = x;
    group.userData = { state, totalCharge: 0 };
    root.add(group);
    const reacting = state === "after" && outcome.reacts;
    const addAtom = (
      symbol: string,
      id: string,
      position: T.Vector3,
      phase: "solid" | "aqueous",
      charge: number,
    ) => {
      const atom = new T.Mesh(sphere, materials[symbol]);
      atom.position.copy(position);
      atom.scale.setScalar(
        symbol === "O" ? 0.085 : symbol === "S" ? 0.12 : 0.15,
      );
      atom.name = `${state}-atom-${id}`;
      atom.userData = {
        element: symbol,
        particleId: id,
        phase,
        charge,
        notSaltMolecule: true,
      };
      group.add(atom);
      return atom;
    };
    addAtom(
      reacting ? dissolved : added,
      reacting ? `solution-source-${dissolved}` : `metal-source-${added}`,
      new T.Vector3(-0.6, -0.4, 0),
      "solid",
      0,
    );
    addAtom(
      reacting ? added : dissolved,
      reacting ? `metal-source-${added}` : `solution-source-${dissolved}`,
      new T.Vector3(0.42, 0.76, 0),
      "aqueous",
      2,
    );
    const anion = new T.Group();
    anion.name = `${state}-intact-sulfate-spectator`;
    anion.userData = {
      species: "SO4",
      charge: -2,
      particleId: "unchanged-sulfate",
      spectator: true,
      phase: "aqueous",
    };
    group.add(anion);
    const centre = new T.Vector3(0.42, -0.18, 0);
    const sulfur = addAtom("S", "sulfate-S", centre, "aqueous", 0);
    group.remove(sulfur);
    anion.add(sulfur);
    delete sulfur.userData.charge;
    sulfur.userData.parentIon = "unchanged-sulfate";
    directions.forEach((direction, index) => {
      const position = centre.clone().addScaledVector(direction, 0.48),
        oxygen = addAtom("O", `sulfate-O-${index}`, position, "aqueous", 0);
      group.remove(oxygen);
      anion.add(oxygen);
      delete oxygen.userData.charge;
      oxygen.userData.parentIon = "unchanged-sulfate";
      const link = new T.Mesh(
        new T.CylinderGeometry(0.025, 0.025, 0.48, 12),
        linkMaterial,
      );
      link.position.copy(centre).add(position).multiplyScalar(0.5);
      link.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), direction);
      link.name = `${state}-sulfate-arrangement-link-${index}`;
      link.userData = {
        geometryConnection: true,
        from: "sulfate-S",
        to: `sulfate-O-${index}`,
        notLewisBondOrder: true,
      };
      anion.add(link);
    });
    const surface = new T.Mesh(
      new T.BoxGeometry(0.54, 0.05, 0.54),
      solidMaterial,
    );
    surface.position.set(-0.6, -0.58, 0);
    surface.name = `${state}-representative-metal-surface`;
    surface.userData = { surfaceCrop: true, notAdditionalAtoms: true };
    group.add(surface);
    const geometry = new T.BoxGeometry(1.9, 1.75, 1.25),
      frame = new T.LineSegments(new T.EdgesGeometry(geometry), frameMaterial);
    geometry.dispose();
    frame.position.y = 0.08;
    frame.name = `${state}-schematic-state-boundary`;
    frame.userData = { notChemicalBonds: true };
    group.add(frame);
  }
  return root;
}
