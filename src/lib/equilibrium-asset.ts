import * as T from "three";
import {
  compressionSnapshot,
  type CompressionRecord,
} from "./equilibrium-shifts";

/** Stationary schematic gas inventory. Only container/centres change with volume; atom/bond geometry stays fixed. */
export function equilibriumAsset(record: CompressionRecord, stage: 0 | 1 | 2) {
  const { inventory, volume } = compressionSnapshot(record, stage);
  const edge = 3 * Math.cbrt(volume);
  const root = new T.Group();
  root.name = "ammonia-equilibrium-volume";
  root.userData = {
    stage,
    relativeVolume: volume,
    inventory,
    schematic: true,
    stationary: true,
    noPredictedYield: true,
    noRateSimulation: true,
  };
  const boundary = new T.BoxGeometry(edge, edge, edge);
  const box = new T.Mesh(
    boundary,
    new T.MeshStandardMaterial({
      color: 0xe6edfa,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
      side: T.DoubleSide,
    }),
  );
  box.name = "occupied-volume-boundary";
  box.userData = { edge, geometricVolume: edge ** 3, relativeVolume: volume };
  root.add(box);
  const wire = new T.LineSegments(
    new T.EdgesGeometry(boundary),
    new T.LineBasicMaterial({ color: 0x6e809d }),
  );
  wire.name = "occupied-volume-edges";
  root.add(wire);
  const materials = {
    nitrogen: new T.MeshStandardMaterial({ color: 0x3445c9, roughness: 0.5 }),
    hydrogen: new T.MeshStandardMaterial({ color: 0xd8e0ec, roughness: 0.5 }),
    bond: new T.MeshStandardMaterial({ color: 0x8693ac, roughness: 0.6 }),
  };
  function atom(
    group: T.Group,
    element: "nitrogen" | "hydrogen",
    position: T.Vector3,
    index: number,
  ) {
    const radius = element === "nitrogen" ? 0.078 : 0.054;
    const mesh = new T.Mesh(
      new T.SphereGeometry(radius, 16, 12),
      materials[element],
    );
    mesh.position.copy(position);
    mesh.name = `${element}-atom-${index}`;
    mesh.userData = { element, radius, schematic: true };
    group.add(mesh);
  }
  function bond(
    group: T.Group,
    a: T.Vector3,
    b: T.Vector3,
    name: string,
    offset = 0,
  ) {
    const delta = b.clone().sub(a),
      mesh = new T.Mesh(
        new T.CylinderGeometry(0.011, 0.011, delta.length(), 8),
        materials.bond,
      );
    mesh.position.copy(a.clone().add(b).multiplyScalar(0.5));
    mesh.position.y += offset;
    mesh.quaternion.setFromUnitVectors(
      new T.Vector3(0, 1, 0),
      delta.normalize(),
    );
    mesh.name = name;
    group.add(mesh);
  }
  let serial = 0;
  for (const species of ["nitrogen", "hydrogen", "ammonia"] as const)
    for (let i = 0; i < inventory[species]; i++) {
      const molecule = new T.Group();
      molecule.name = `${species}-molecule-${i + 1}`;
      molecule.userData = {
        species,
        moleculeId: serial + 1,
        noMeasuredMoles: true,
      };
      // Disperse sequential identities across a 4×4×4 grid, without random re-layout on resize.
      const cell = (serial * 17) % 64,
        xyz = [cell % 4, Math.floor(cell / 4) % 4, Math.floor(cell / 16)];
      molecule.position.set(
        ...(xyz.map((c) => edge * ((c + 0.5) / 4 - 0.5)) as [
          number,
          number,
          number,
        ]),
      );
      if (species === "ammonia") {
        const centre = new T.Vector3(0, 0, 0);
        atom(molecule, "nitrogen", centre, 1);
        // Three bonds with tetrahedral H–N–H angles; trigonal-pyramidal molecule.
        for (let h = 0; h < 3; h++) {
          const angle = (2 * Math.PI * h) / 3;
          const p = new T.Vector3(
            0.204 * Math.sqrt(8 / 9) * Math.cos(angle),
            -0.204 / 3,
            0.204 * Math.sqrt(8 / 9) * Math.sin(angle),
          );
          atom(molecule, "hydrogen", p, h + 2);
          bond(molecule, centre, p, `N-H-bond-${h + 1}`);
        }
      } else {
        const a = new T.Vector3(-0.102, 0, 0),
          b = new T.Vector3(0.102, 0, 0);
        atom(molecule, species, a, 1);
        atom(molecule, species, b, 2);
        if (species === "nitrogen")
          for (const [j, offset] of [-0.025, 0, 0.025].entries())
            bond(molecule, a, b, `triple-bond-${j + 1}`, offset);
        else bond(molecule, a, b, "single-bond");
      }
      root.add(molecule);
      serial++;
    }
  return root;
}
