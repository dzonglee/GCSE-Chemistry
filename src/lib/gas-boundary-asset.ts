import * as T from "three";
import { gasMassBalance } from "./mass-conservation";
import { moleculePositions } from "./covalent";
export function gasBoundaryAsset(closed: boolean, stage: number) {
  const d = gasMassBalance(closed, stage),
    root = new T.Group();
  root.name = "gas-boundary-accounting";
  root.userData = {
    closed,
    stage,
    readingGrams: d.reading,
    escapedGrams: d.escapedMass,
    totalAccountedGrams: 75,
    representation:
      "three macroscopic 1.5 g CO2 parcels represented by molecule glyphs, not grams per single molecule",
  };
  const glass = new T.MeshStandardMaterial({
      color: 0x9ebde8,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
      side: T.DoubleSide,
    }),
    outline = new T.MeshStandardMaterial({ color: 0x3f4fd0 }),
    liquid = new T.MeshStandardMaterial({
      color: 0x3b938b,
      transparent: true,
      opacity: 0.45,
    }),
    carbon = new T.MeshStandardMaterial({ color: 0x344055 }),
    oxygen = new T.MeshStandardMaterial({ color: 0xc95166 }),
    link = new T.MeshStandardMaterial({ color: 0x7b8499 });
  const vessel = new T.Mesh(
    new T.CylinderGeometry(2, 2, 3.6, 48, 1, true),
    glass,
  );
  vessel.name = "weighed-vessel";
  root.add(vessel);
  const floor = new T.Mesh(new T.CylinderGeometry(2, 2, 0.08, 48), outline);
  floor.name = "vessel-base";
  floor.position.y = -1.8;
  root.add(floor);
  const retained = new T.Mesh(
    new T.CylinderGeometry(1.85, 1.85, 1, 48),
    liquid,
  );
  retained.name = "retained-liquid-and-solid-mixture";
  retained.userData = { grams: 20.5, schematic: true };
  retained.position.y = -1.22;
  root.add(retained);
  if (closed) {
    const lid = new T.Mesh(new T.CylinderGeometry(2, 2, 0.08, 48), outline);
    lid.name = "closed-boundary-lid";
    lid.position.y = 1.8;
    root.add(lid);
  }
  const sphere = new T.SphereGeometry(1, 20, 16),
    rod = new T.CylinderGeometry(0.025, 0.025, 1, 12),
    positions = moleculePositions("CO2").map((p) =>
      new T.Vector3(...p).multiplyScalar(0.35),
    );
  for (const packet of d.packets) {
    const group = new T.Group();
    group.name = `CO2-parcel-${packet.id}`;
    group.userData = { parcelId: packet.id, grams: 1.5, inside: packet.inside };
    group.position.set(
      packet.inside ? packet.id - 1 : 4.2 + packet.id * 1.5,
      packet.inside ? (packet.id === 1 ? 1.3 : 0.4) : 1.1,
      0,
    );
    positions.forEach((p, i) => {
      const mesh = new T.Mesh(sphere, i === 0 ? carbon : oxygen);
      mesh.name = `parcel-${packet.id}-atom-${i}-${i === 0 ? "C" : "O"}`;
      mesh.position.copy(p);
      mesh.scale.setScalar(0.14);
      group.add(mesh);
    });
    for (let i = 1; i < 3; i++) {
      const delta = positions[i].clone().sub(positions[0]),
        mesh = new T.Mesh(rod, link);
      mesh.position.copy(
        positions[i].clone().add(positions[0]).multiplyScalar(0.5),
      );
      mesh.scale.y = delta.length();
      mesh.quaternion.setFromUnitVectors(
        new T.Vector3(0, 1, 0),
        delta.normalize(),
      );
      group.add(mesh);
    }
    root.add(group);
  }
  return root;
}
