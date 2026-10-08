import * as T from "three";
import {
  gasParticlePositions,
  solidPiecePositions,
  surfaceGeometry,
} from "./collision-theory";
export type CollisionAssetState =
  | { kind: "gas"; reacting: number; inert: number; volume: number }
  | { kind: "solid"; divisions: 1 | 2 | 4; separated: boolean };
export function collisionAsset(state: CollisionAssetState) {
  const root = new T.Group();
  root.name =
    state.kind === "gas"
      ? "schematic-reacting-gas-density"
      : "accessible-solid-surfaces";
  root.userData = {
    ...state,
    schematic: true,
    stationary: true,
    noMeasuredRate: true,
  };
  if (state.kind === "gas") {
    const boundary = new T.BoxGeometry(state.volume, 2, 2);
    const box = new T.Mesh(
      boundary,
      new T.MeshStandardMaterial({
        color: 0xdde8f8,
        transparent: true,
        opacity: 0.07,
        depthWrite: false,
        side: T.DoubleSide,
      }),
    );
    box.name = "actual-occupied-volume-boundary";
    box.userData = {
      width: state.volume,
      height: 2,
      depth: 2,
      actualGeometricVolume: state.volume * 4,
      volumeUnitScale: 4,
    };
    root.add(box);
    const wire = new T.LineSegments(
      new T.EdgesGeometry(boundary),
      new T.LineBasicMaterial({ color: 0x7c8daa }),
    );
    wire.name = "occupied-volume-edges";
    root.add(wire);
    const geometry = new T.SphereGeometry(0.09, 16, 12);
    const materials = {
      reacting: new T.MeshStandardMaterial({ color: 0x3344c8, roughness: 0.5 }),
      inert: new T.MeshStandardMaterial({ color: 0x8b95a8, roughness: 0.6 }),
    };
    for (const p of gasParticlePositions(
      state.reacting,
      state.inert,
      state.volume,
    )) {
      const mesh = new T.Mesh(geometry, materials[p.species]);
      mesh.name = `${p.species}-particle-${p.id}`;
      mesh.position.set(p.x, p.y, p.z);
      mesh.userData = {
        particleId: p.id,
        species: p.species,
        radius: p.radius,
        notMeasuredMoles: true,
      };
      root.add(mesh);
    }
  } else {
    const data = surfaceGeometry(state.divisions, state.separated);
    root.userData = {
      ...root.userData,
      ...data,
      unit: "mm",
      notAtoms: true,
      fullyWettedWhenSeparated: true,
      internalInterfacesInaccessibleWhenJoined: true,
    };
    // BoxGeometry material groups: +x,-x,+y,-y,+z,-z. Yellow is accessible; grey is joined internal interface.
    const accessible = new T.MeshStandardMaterial({
      color: 0xe8bb45,
      roughness: 0.65,
    });
    const inaccessible = new T.MeshStandardMaterial({
      color: 0x758198,
      roughness: 0.65,
    });
    const geometry = new T.BoxGeometry(data.side, data.side, data.side);
    const positions = solidPiecePositions(state.divisions, state.separated);
    const extent = ((state.divisions - 1) * data.side) / 2;
    for (const p of positions) {
      const flags = state.separated
        ? [true, true, true, true, true, true]
        : [
            p.x === extent,
            p.x === -extent,
            p.y === extent,
            p.y === -extent,
            p.z === extent,
            p.z === -extent,
          ];
      const mesh = new T.Mesh(
        geometry,
        flags.map((v) => (v ? accessible : inaccessible)),
      );
      mesh.name = `solid-piece-${p.id}`;
      mesh.position.set(p.x, p.y, p.z);
      mesh.userData = {
        pieceId: p.id,
        side: p.side,
        accessibleFaces: flags.filter(Boolean).length,
        faceArea: p.side ** 2,
        notAtom: true,
      };
      root.add(mesh);
      const wire = new T.LineSegments(
        new T.EdgesGeometry(geometry),
        new T.LineBasicMaterial({ color: 0x536079 }),
      );
      wire.position.copy(mesh.position);
      wire.name = `piece-edges-${p.id}`;
      root.add(wire);
    }
  }
  return root;
}
