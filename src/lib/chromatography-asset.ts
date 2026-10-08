import * as THREE from "three";
import type { SetupSource } from "./chromatography-cases";
import { readChromaNumber, type ChromaBoard } from "./chromatography-domain";
export const CHROMA_METRES_PER_MM = 0.001;
export function chromatographyApparatusState(
  source: SetupSource,
  board: ChromaBoard,
) {
  const level = readChromaNumber(board.solventLevel, true),
    beakerHeight = source.paperTop + 12;
  return {
    level,
    beakerHeight,
    drawable: level !== null && level >= 0 && level <= beakerHeight,
    paperContact: level === null ? null : level >= source.paperBottom,
    sampleContact: level === null ? null : level >= source.origin,
    lineMaterial: board.lineMaterial || null,
  };
}
/** Real macro apparatus, in glTF metres. Source heights stay unchanged.
 * Colour distinguishes proposal/source; it does not claim purple water. */
export function buildChromatographyApparatus(
  source: SetupSource,
  board: ChromaBoard,
): THREE.Group {
  const state = chromatographyApparatusState(source, board),
    s = CHROMA_METRES_PER_MM,
    group = new THREE.Group();
  group.name = "Chromatography_current_apparatus";
  group.userData = {
    kind: "paper-chromatography-macro-apparatus",
    record: source.id,
    units: "metres",
    metresPerSourceMillimetre: s,
    original: {
      paperBottomMm: source.paperBottom,
      paperTopMm: source.paperTop,
      originMm: source.origin,
      waterLevelMm: source.suppliedLevel,
      lineMaterial: source.suppliedLine,
    },
    proposal: {
      rawLevel: board.solventLevel,
      levelMm: state.level,
      lineMaterial: state.lineMaterial,
      surfaceDrawn: state.drawable,
      paperContact: state.paperContact,
      sampleContact: state.sampleContact,
    },
    scope:
      "Schematic macro apparatus; no molecular distribution, measured Rf or new experimental observation is generated.",
    colourEncoding: "Purple marks a student proposal; water is colourless.",
  };
  const glass = new THREE.MeshStandardMaterial({
    color: 0xb5d2ed,
    transparent: true,
    opacity: 0.18,
    roughness: 0.18,
    metalness: 0.04,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: 0x596579,
    roughness: 0.45,
    metalness: 0.55,
  });
  const paper = new THREE.MeshStandardMaterial({
    color: 0xfff7df,
    roughness: 0.94,
  });
  const originalSurface = new THREE.MeshStandardMaterial({
    color: 0x749bc9,
    transparent: true,
    opacity: 0.36,
    roughness: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const proposedLiquid = new THREE.MeshStandardMaterial({
    color: 0x8961bc,
    transparent: true,
    opacity: 0.37,
    roughness: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const add = (
    name: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: [number, number, number],
    role: string,
  ) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.userData = { role };
    group.add(mesh);
    return mesh;
  };
  const height = state.beakerHeight * s,
    radius = 0.04;
  const wall = add(
    "Beaker_open_wall",
    new THREE.CylinderGeometry(radius, radius, height, 64, 1, true),
    glass,
    [0, height / 2, 0],
    "fixed apparatus",
  );
  wall.renderOrder = 4;
  const base = add(
    "Beaker_closed_base",
    new THREE.CylinderGeometry(radius, radius, 0.002, 64),
    glass,
    [0, -0.001, 0],
    "fixed apparatus",
  );
  base.renderOrder = 4;
  const rim = add(
    "Beaker_connected_rim",
    new THREE.TorusGeometry(radius, 0.001, 12, 64),
    glass,
    [0, height, 0],
    "fixed apparatus",
  );
  rim.rotation.x = Math.PI / 2;
  rim.renderOrder = 4;
  const supportY = height + 0.002;
  const support = add(
    "Support_bar",
    new THREE.CylinderGeometry(0.001, 0.001, 0.092, 24),
    metal,
    [0, supportY, 0],
    "fixed support resting on rim",
  );
  support.rotation.z = Math.PI / 2;
  const paperTop = source.paperTop * s,
    paperBottom = source.paperBottom * s;
  const wireBottom = paperTop + 0.0015,
    wireHeight = supportY - wireBottom;
  add(
    "Hanging_support_wire",
    new THREE.CylinderGeometry(0.0005, 0.0005, wireHeight, 16),
    metal,
    [0, (supportY + wireBottom) / 2, 0],
    "fixed support joining bar to clip",
  );
  add(
    "Paper_clip",
    new THREE.BoxGeometry(0.007, 0.0046, 0.002),
    metal,
    [0, paperTop + 0.0007, 0],
    "fixed clip connected to paper and support wire",
  );
  const sheet = add(
    "Fixed_chromatography_paper",
    new THREE.BoxGeometry(0.026, paperTop - paperBottom, 0.00025),
    paper,
    [0, (paperTop + paperBottom) / 2, 0],
    "fixed paper",
  );
  sheet.userData = {
    role: "fixed paper",
    bottomMm: source.paperBottom,
    topMm: source.paperTop,
  };
  const line = state.lineMaterial ?? source.suppliedLine,
    lineMaterial = new THREE.MeshStandardMaterial({
      color: line === "pencil" ? 0x505766 : 0xa62d83,
      roughness: 0.9,
    });
  const baseline = add(
    "Fixed_origin_line",
    new THREE.BoxGeometry(0.026, 0.00055, 0.00025),
    lineMaterial,
    [0, source.origin * s, 0.0002],
    state.lineMaterial
      ? "student proposed line material at fixed original origin"
      : "original supplied line",
  );
  baseline.userData = {
    role: state.lineMaterial
      ? "student line-material proposal"
      : "original supplied line",
    sourceOriginMm: source.origin,
    sourceLine: source.suppliedLine,
    proposedLine: state.lineMaterial,
  };
  const ink = new THREE.MeshStandardMaterial({
    color: 0x6a3db3,
    roughness: 0.8,
  });
  const sample = add(
    "Fixed_starting_sample",
    new THREE.CylinderGeometry(0.002, 0.002, 0.0004, 24),
    ink,
    [0, source.origin * s, 0.0002],
    "fixed original sample-origin marker",
  );
  sample.rotation.x = Math.PI / 2;
  sample.userData = {
    role: "fixed original sample-origin marker, enlarged for visibility rather than showing ink volume",
    sourceOriginMm: source.origin,
  };
  // A thin outlined reference plane is an observed level, not added liquid.
  if (state.level !== source.suppliedLevel) {
    const ring = add(
      "Original_reservoir_surface",
      new THREE.RingGeometry(0.0365, 0.0385, 64),
      originalSurface,
      [0, source.suppliedLevel * s, 0],
      "original recorded reservoir boundary",
    );
    ring.rotation.x = -Math.PI / 2;
    ring.renderOrder = 2;
    ring.userData = {
      role: "original recorded reservoir boundary",
      sourceLevelMm: source.suppliedLevel,
    };
  }
  if (state.drawable && state.level !== null) {
    const level = state.level * s;
    if (level > 0) {
      const liquid = add(
        "Student_proposed_reservoir",
        new THREE.CylinderGeometry(0.0385, 0.0385, level, 64),
        proposedLiquid,
        [0, level / 2, 0],
        "student proposed liquid region",
      );
      liquid.renderOrder = 1;
      liquid.userData = {
        role: "student proposal, not a new observation",
        rawLevel: board.solventLevel,
        levelMm: state.level,
      };
    }
    const proposedSurface = add(
      "Student_proposed_surface",
      new THREE.RingGeometry(0.0365, 0.0385, 64),
      new THREE.MeshStandardMaterial({
        color: 0x67359f,
        roughness: 0.6,
        side: THREE.DoubleSide,
      }),
      [0, level, 0],
      "student proposed level boundary",
    );
    proposedSurface.rotation.x = -Math.PI / 2;
    proposedSurface.renderOrder = 3;
  }
  group.updateMatrixWorld(true);
  return group;
}
export function disposeChromatographyApparatus(group: THREE.Object3D) {
  const geometry = new Set<THREE.BufferGeometry>(),
    materials = new Set<THREE.Material>();
  group.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      geometry.add(node.geometry);
      for (const material of Array.isArray(node.material)
        ? node.material
        : [node.material])
        materials.add(material);
    }
  });
  geometry.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
}
