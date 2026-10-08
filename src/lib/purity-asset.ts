import * as THREE from "three";
import {
  parsePurityNumber,
  purityCase,
  validPurity,
  type PurityBoard,
  type PurityFocus,
} from "./purity-domain";
export type FiltrationForecast = {
  residueSand: number | null;
  residueSalt: number | null;
  residueWater: number | null;
  filtrateSand: number | null;
  filtrateSalt: number | null;
  filtrateWater: number | null;
  derived: string[];
};
export function filtrationForecast(
  board: PurityBoard,
  focus: PurityFocus,
): FiltrationForecast {
  if (!validPurity("filtration", board))
    throw new Error("Invalid retained filtration proposal.");
  const c = purityCase("filtration", board.record)!,
    n = (key: string) => parsePurityNumber(board[key]);
  const result: FiltrationForecast = {
    residueSand: n("residueSand"),
    residueSalt: n("residueSalt"),
    residueWater: n("residueWater"),
    filtrateSand: n("filtrateSand"),
    filtrateSalt: n("filtrateSalt"),
    filtrateWater: n("filtrateWater"),
    derived: [],
  };
  // Show the conditional conserved complement of the asked salt allocation, without filling or marking another answer field.
  if (
    focus === "residueSalt" &&
    result.residueSalt !== null &&
    result.residueSalt <= Number(c.salt)
  ) {
    result.filtrateSalt = Number(c.salt) - result.residueSalt;
    result.derived.push("filtrateSalt");
  }
  if (
    focus === "filtrateSalt" &&
    result.filtrateSalt !== null &&
    result.filtrateSalt <= Number(c.salt)
  ) {
    result.residueSalt = Number(c.salt) - result.filtrateSalt;
    result.derived.push("residueSalt");
  }
  return result;
}
export function makeFiltrationAsset(
  board: PurityBoard,
  focus: PurityFocus = "all",
  originalRecord = board.record,
): THREE.Group {
  const proposal = filtrationForecast(board, focus),
    c = purityCase("filtration", board.record)!;
  const group = new THREE.Group();
  group.name =
    "Original filtration apparatus with retained student mass proposal";
  group.userData = {
    lesson: "Purity and separation",
    units: "g",
    originalTaskRecord: originalRecord,
    currentComparisonRecord: board.record,
    source: {
      sand: c.sand,
      salt: c.salt,
      water: c.water,
      waterNote: c.waterNote ?? null,
      dissolvedSalt: c.dissolvedSalt,
      retainedWaterGiven: c.retainedWater,
      retainedDissolvedSaltGiven: c.retainedDissolvedSalt,
    },
    rawProposal: { ...board },
    interpretedProposal: proposal,
    representation:
      "Schematic apparatus and material markers. Markers are not atoms, molecules, ions, salt grains or a count of particles. Use the mass ledger. The conditional complementary salt mass is derived from the student proposal and conservation; no other answer field is filled.",
    status:
      "Student proposal, not a correct reference or a simulated experimental result",
  };
  const glass = new THREE.MeshStandardMaterial({
    color: 0xc3d1e4,
    transparent: true,
    opacity: 0.18,
    roughness: 0.15,
    metalness: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const edge = new THREE.MeshStandardMaterial({
    color: 0x899ab3,
    roughness: 0.4,
  });
  const paper = new THREE.MeshStandardMaterial({
    color: 0xfffbef,
    side: THREE.DoubleSide,
    roughness: 0.95,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: 0x5a6577,
    roughness: 0.4,
    metalness: 0.35,
  });
  const water = new THREE.MeshStandardMaterial({
    color: 0x66bbdc,
    transparent: true,
    opacity: 0.45,
    roughness: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const sand = new THREE.MeshStandardMaterial({
    color: 0xb69b62,
    roughness: 0.95,
  });
  const salt = new THREE.MeshStandardMaterial({
    color: 0x7651a8,
    roughness: 0.5,
  });
  const unknown = new THREE.MeshStandardMaterial({
    color: 0xa6aec0,
    roughness: 0.8,
  });
  function add(
    name: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
    info: Record<string, unknown> = {},
  ) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.userData = info;
    group.add(mesh);
    return mesh;
  }
  function ring(name: string, r: number, y: number) {
    const mesh = add(
      name,
      new THREE.TorusGeometry(r, 0.025, 8, 48),
      edge,
      0,
      y,
      0,
    );
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }
  // Flask body, neck and outlet overlap at their junctions; the receiver remains open to the outlet.
  add(
    "Receiving flask body",
    new THREE.CylinderGeometry(0.3, 1, 1.2, 48, 1, true),
    glass,
    0,
    0.6,
    0,
  );
  add(
    "Receiving flask base",
    new THREE.CylinderGeometry(0.98, 0.98, 0.035, 48),
    glass,
    0,
    0.02,
    0,
  );
  add(
    "Open receiving flask neck",
    new THREE.CylinderGeometry(0.3, 0.3, 0.45, 36, 1, true),
    glass,
    0,
    1.425,
    0,
  );
  ring("Receiving flask mouth", 0.3, 1.65);
  add(
    "Continuous funnel outlet into receiving flask neck",
    new THREE.CylinderGeometry(0.1, 0.1, 0.65, 24, 1, true),
    glass,
    0,
    1.75,
    0,
    {
      joins:
        "Cone bottom2.05; outlet top2.075. Outlet bottom1.425 enters neck1.2–1.65.",
    },
  );
  add(
    "Funnel cone cutaway",
    new THREE.CylinderGeometry(
      0.95,
      0.12,
      1,
      48,
      1,
      true,
      Math.PI / 2,
      Math.PI * 1.5,
    ),
    glass,
    0,
    2.55,
    0,
    { cutaway: true },
  );
  ring("Funnel rim", 0.95, 3.05);
  add(
    "Porous filter paper inside funnel cutaway",
    new THREE.CylinderGeometry(
      0.928,
      0,
      0.93,
      48,
      1,
      true,
      Math.PI / 2,
      Math.PI * 1.5,
    ),
    paper,
    0,
    2.585,
    0,
    {
      porous: true,
      notToScale: true,
      role: "Filter paper positioned inside funnel; liquid passes through pores, not around the paper.",
    },
  );
  // Stand is connected to a ring at the funnel and is separate from the liquid path.
  add(
    "Stand base",
    new THREE.BoxGeometry(1.2, 0.12, 0.9),
    metal,
    -1.5,
    0.04,
    0.1,
  );
  add(
    "Stand upright",
    new THREE.CylinderGeometry(0.035, 0.035, 3.2, 12),
    metal,
    -1.5,
    1.64,
    0.1,
  );
  const support = add(
    "Connected support arm",
    new THREE.CylinderGeometry(0.025, 0.025, 0.92, 12),
    metal,
    -1.04,
    2.62,
    0.1,
  );
  support.rotation.z = Math.PI / 2;
  const supportRing = add(
    "Support ring around funnel",
    new THREE.TorusGeometry(0.58, 0.035, 8, 48),
    metal,
    0,
    2.62,
    0,
  );
  supportRing.rotation.x = Math.PI / 2;
  // Material marks are endpoint forecasts, not particles travelling through paper or new substances.
  function materialMarks(
    place: "residue" | "filtrate",
    name: "Sand" | "Salt",
    amount: number | null,
  ) {
    const top = place === "residue",
      key = place + (name === "Sand" ? "Sand" : "Salt");
    if (amount === null) {
      add(
        "Unchosen " + key,
        new THREE.TorusGeometry(0.07, 0.016, 8, 16),
        unknown,
        top ? -0.16 : 0.16,
        top ? 2.64 : 0.28,
        0.16,
        { quantity: null, field: key },
      );
      return;
    }
    if (amount <= 0) return;
    if (name === "Sand") {
      const coordinates = top
        ? [
            [-0.18, 2.56, 0.02],
            [0.16, 2.62, -0.02],
            [0.0, 2.67, 0.16],
            [-0.13, 2.7, -0.14],
            [0.15, 2.74, 0.14],
          ]
        : [
            [-0.3, 0.17, 0],
            [0.28, 0.2, -0.12],
            [0, 0.23, 0.3],
            [-0.12, 0.28, -0.25],
            [0.18, 0.3, 0.14],
          ];
      for (const [i, pos] of coordinates.entries())
        add(
          "Proposed " + key + " material mark " + i,
          new THREE.IcosahedronGeometry(0.07, 0),
          sand,
          pos[0],
          pos[1],
          pos[2],
          {
            field: key,
            mass: amount,
            unit: "g",
            symbolic: true,
            particleCount: false,
          },
        );
    } else
      add(
        "Proposed " + key + " mass marker",
        new THREE.SphereGeometry(0.095, 16, 12),
        salt,
        top ? 0.2 : 0.3,
        top ? 2.6 : 0.38,
        0.18,
        {
          field: key,
          mass: amount,
          unit: "g",
          symbolic: true,
          particleCount: false,
          conditionalComplement: proposal.derived.includes(key),
        },
      );
  }
  function liquid(place: "residue" | "filtrate", amount: number | null) {
    const key = place + "Water";
    if (amount === null) {
      add(
        "Unchosen " + key + " material marker",
        new THREE.TorusGeometry(0.09, 0.018, 8, 16),
        unknown,
        -0.1,
        place === "residue" ? 2.57 : 0.35,
        -0.2,
        { field: key, quantity: null },
      );
      return;
    }
    if (amount <= 0) return;
    const fraction = Math.min(1, amount / Number(c.water)),
      low = place === "residue" ? 2.38 : 0.07,
      high =
        place === "residue" ? 2.43 + 0.28 * fraction : 0.17 + 0.65 * fraction;
    const radius = (y: number) =>
      place === "residue"
        ? Math.max(0.02, ((y - 2.12) / 0.93) * 0.92 - 0.04)
        : 1 - (0.7 * y) / 1.2 - 0.06;
    add(
      "Proposed " + key + " schematic liquid",
      new THREE.CylinderGeometry(radius(high), radius(low), high - low, 40),
      water,
      0,
      (low + high) / 2,
      0,
      {
        field: key,
        mass: amount,
        unit: "g",
        schematicLevel: true,
        volumeIsNotMeasured: true,
        displayedLevelCapsAtSourceWater: amount > Number(c.water),
      },
    );
  }
  materialMarks("residue", "Sand", proposal.residueSand);
  materialMarks("residue", "Salt", proposal.residueSalt);
  materialMarks("filtrate", "Sand", proposal.filtrateSand);
  materialMarks("filtrate", "Salt", proposal.filtrateSalt);
  liquid("residue", proposal.residueWater);
  liquid("filtrate", proposal.filtrateWater);
  group.updateMatrixWorld(true);
  return group;
}
export function disposeFiltrationAsset(group: THREE.Group) {
  const geometry = new Set<THREE.BufferGeometry>(),
    materials = new Set<THREE.Material>();
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      geometry.add(object.geometry);
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material])
        materials.add(material);
    }
  });
  geometry.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
}
