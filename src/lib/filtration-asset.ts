import * as T from "three";
/** Macroscopic apparatus and material regions: no particle or molecular interpretation. */
export function filtrationAsset() {
  const root = new T.Group();
  root.name = "macroscopic-filtration";
  const glass = new T.MeshStandardMaterial({
      color: 0xa8c7df,
      transparent: true,
      opacity: 0.22,
      side: T.DoubleSide,
      roughness: 0.3,
      depthWrite: false,
    }),
    paper = new T.MeshStandardMaterial({
      color: 0xf2eee2,
      side: T.DoubleSide,
      roughness: 0.9,
    }),
    black = new T.MeshStandardMaterial({ color: 0x353948, roughness: 0.9 }),
    blue = new T.MeshStandardMaterial({
      color: 0x337ed6,
      transparent: true,
      opacity: 0.6,
    }),
    metal = new T.MeshStandardMaterial({ color: 0x79869a, roughness: 0.5 });
  const mesh = (
    name: string,
    g: T.BufferGeometry,
    m: T.Material,
    x: number,
    y: number,
    z = 0,
  ) => {
    const o = new T.Mesh(g, m);
    o.name = name;
    o.position.set(x, y, z);
    root.add(o);
    return o;
  };
  // Open conical funnel widens upward; its stem leads into an open receiving beaker.
  mesh(
    "glass-funnel",
    new T.CylinderGeometry(0.78, 0.12, 0.78, 48, 1, true),
    glass,
    0,
    0.88,
  );
  mesh(
    "funnel-stem",
    new T.CylinderGeometry(0.08, 0.08, 0.75, 24, 1, true),
    glass,
    0,
    0.14,
  );
  mesh(
    "filter-paper",
    new T.CylinderGeometry(
      0.72,
      0.07,
      0.62,
      48,
      1,
      true,
      Math.PI / 3,
      (4 * Math.PI) / 3,
    ),
    paper,
    0,
    0.94,
  );
  const residue = mesh(
    "excess-CuO-residue",
    new T.CylinderGeometry(0.18, 0.09, 0.1, 32),
    black,
    0,
    0.76,
  );
  residue.userData = {
    material: "excess insoluble copper oxide",
    scale: "macroscopic portion, not particles",
    fraction: "residue",
  };
  const beaker = mesh(
    "receiving-beaker",
    new T.CylinderGeometry(0.58, 0.58, 0.9, 48, 1, true),
    glass,
    0,
    -0.59,
  );
  beaker.userData = { apparatus: "open receiving beaker" };
  mesh(
    "beaker-base",
    new T.CylinderGeometry(0.58, 0.58, 0.035, 48),
    glass,
    0,
    -1.055,
  );
  const filtrate = mesh(
    "copper-sulfate-filtrate",
    new T.CylinderGeometry(0.54, 0.54, 0.3, 48),
    blue,
    0,
    -0.87,
  );
  filtrate.userData = {
    material: "copper sulfate solution",
    fraction: "filtrate",
    scale: "macroscopic liquid region, not salt molecules",
  };
  const drop = mesh(
    "filtrate-drop",
    new T.SphereGeometry(0.045, 16, 12),
    blue,
    0,
    -0.3,
  );
  drop.userData = { material: "salt solution droplet", scale: "macroscopic" };
  mesh("stand-base", new T.BoxGeometry(0.48, 0.1, 0.8), metal, -1.04, -1.11);
  mesh(
    "stand-rod",
    new T.CylinderGeometry(0.035, 0.035, 2.35, 16),
    metal,
    -1.04,
    0.065,
  );
  const arm = mesh(
    "support-arm",
    new T.CylinderGeometry(0.025, 0.025, 1.04, 16),
    metal,
    -0.52,
    0.69,
  );
  arm.rotation.z = Math.PI / 2;
  const ring = mesh(
    "support-ring",
    new T.TorusGeometry(0.34, 0.025, 8, 48),
    metal,
    0,
    0.69,
  );
  ring.rotation.x = Math.PI / 2;
  root.userData = {
    representation:
      "macroscopic apparatus; colour regions identify bulk materials, not particles",
    residue: "unreacted CuO",
    paperCutaway:
      "front120-degree sector removed only to reveal the residue; real paper surrounds the mixture",
    filtrate: "copper sulfate solution",
    stage: "first filtration after complete acid reaction",
  };
  return root;
}
