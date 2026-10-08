import * as T from "three";
/** A finite qualitative three-layer fragment, not a measured metal unit cell.
 * The same twelve illustrative +1 cores/−1 outer electrons as the 2D model.
 * Inner electrons belong to each core. Colours/radii are diagram conventions. */
export function metallicAsset(alloy: boolean, shift: number, drift: number) {
  const group = new T.Group();
  group.name = "metallic-fragment";
  group.userData = {
    cores: 12,
    delocalisedElectrons: 12,
    netCharge: 0,
    model:
      "Illustrative monovalent fragment; not a measured lattice or electron trajectory",
  };
  const coreMat = new T.MeshStandardMaterial({
    color: 0x91abd9,
    roughness: 0.55,
  });
  const otherMat = new T.MeshStandardMaterial({
    color: 0xe4a853,
    roughness: 0.55,
  });
  const electronMat = new T.MeshStandardMaterial({
    color: 0x7341bb,
    roughness: 0.4,
  });
  for (let i = 0; i < 12; i++) {
    const layer = Math.floor(i / 4),
      other = alloy && [2, 5, 9].includes(i),
      radius = other ? 0.34 : 0.27;
    const core = new T.Mesh(
      new T.SphereGeometry(radius, 20, 14),
      other ? otherMat : coreMat,
    );
    core.name = `core-${i}`;
    core.position.set(
      (i % 2 ? 0.68 : -0.68) +
        (layer === 0 ? shift * 0.12 : 0) +
        (alloy ? (i % 2 ? 0.07 : -0.07) : 0),
      0.9 - layer * 0.9 + (alloy ? (other ? 0.06 : -0.03) : 0),
      Math.floor((i % 4) / 2) ? 0.68 : -0.68,
    );
    core.userData = {
      kind: "positive-core",
      id: i,
      layer,
      charge: 1,
      radius,
      species: other ? "X" : "M",
      contains: "nucleus and inner electrons",
    };
    group.add(core);
  }
  for (let i = 0; i < 12; i++) {
    const electron = new T.Mesh(
      new T.SphereGeometry(0.075, 14, 10),
      electronMat,
    );
    electron.name = `electron-${i}`;
    const x = (i % 2 ? 0.95 : -0.95) + drift * 0.09;
    electron.position.set(
      x > 1.12 ? x - 2.24 : x,
      0.45 - Math.floor(i / 4) * 0.9,
      Math.floor((i % 4) / 2) ? 0.9 : -0.9,
    );
    electron.userData = {
      kind: "delocalised-electron",
      id: i,
      charge: -1,
      radius: 0.075,
    };
    group.add(electron);
  }
  return group;
}
