import * as T from "three";
import type { ApparatusRecord } from "./rates-practical";
/** Schematic assembly. Numerical measurement is supplied separately in 2D. */
export function practicalApparatusAsset(r: ApparatusRecord) {
  const root = new T.Group();
  root.name = "Connected gas-collection apparatus";
  root.userData = {
    method: r.method,
    gas: r.gas,
    reading: r.gasReading,
    schematic: true,
    notToScale: true,
  };
  const glass = new T.MeshStandardMaterial({
    color: 0x91b7d4,
    transparent: true,
    opacity: 0.28,
    roughness: 0.35,
    side: T.DoubleSide,
    depthWrite: false,
  });
  const dark = new T.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 }),
    liquid = new T.MeshStandardMaterial({
      color: 0x667dda,
      transparent: true,
      opacity: 0.65,
      roughness: 0.6,
    }),
    gas = new T.MeshStandardMaterial({
      color: 0xe0ba45,
      transparent: true,
      opacity: 0.2,
      roughness: 0.5,
    }),
    metal = new T.MeshStandardMaterial({
      color: 0xc6cedb,
      metalness: 0.4,
      roughness: 0.5,
    });
  function mesh(
    name: string,
    g: T.BufferGeometry,
    m: T.Material,
    x: number,
    y: number,
    z = 0,
  ) {
    const o = new T.Mesh(g, m);
    o.name = name;
    o.position.set(x, y, z);
    root.add(o);
    return o;
  }
  const profile = [
    new T.Vector2(0, -0.65),
    new T.Vector2(0.45, -0.65),
    new T.Vector2(0.45, -0.58),
    new T.Vector2(0.17, 0.15),
    new T.Vector2(0.14, 0.2),
    new T.Vector2(0.14, 0.45),
  ];
  mesh("Conical flask", new T.LatheGeometry(profile, 40), glass, -1, 0);
  mesh(
    "Reaction mixture",
    new T.CylinderGeometry(0.34, 0.43, 0.25, 32),
    liquid,
    -1,
    -0.49,
  );
  if (r.reaction.startsWith("Mg")) {
    const ribbon = mesh(
      "Magnesium ribbon schematic",
      new T.BoxGeometry(0.3, 0.015, 0.055),
      metal,
      -1,
      -0.36,
    );
    ribbon.rotation.z = 0.16;
  } else {
    for (const [i, x] of [-1.18, -1, -0.82].entries())
      mesh(
        "Marble chip " + (i + 1),
        new T.DodecahedronGeometry(0.075),
        metal,
        x,
        -0.36,
      );
  }
  mesh(
    "Gas-tight bung",
    new T.CylinderGeometry(0.15, 0.14, 0.13, 32),
    dark,
    -1,
    r.fault === "leak" ? 0.57 : 0.45,
  );
  const curve = new T.CubicBezierCurve3(
    new T.Vector3(-1, r.fault === "leak" ? 0.63 : 0.51, 0),
    new T.Vector3(-1, 1.05, 0),
    new T.Vector3(-0.65, 1.05, 0),
    new T.Vector3(-0.35, 0.8, 0),
  );
  mesh(
    "Delivery tubing",
    new T.TubeGeometry(curve, 48, 0.035, 12, false),
    dark,
    0,
    0,
  );
  function cylinder(
    name: string,
    radius: number,
    length: number,
    m: T.Material,
    x: number,
  ) {
    const o = mesh(
      name,
      new T.CylinderGeometry(radius, radius, length, 32),
      m,
      x,
      0.8,
    );
    o.rotation.z = Math.PI / 2;
    return o;
  }
  cylinder("Syringe nozzle", 0.05, 0.25, dark, -0.22);
  cylinder("Syringe barrel", 0.17, 1.25, glass, 0.55);
  cylinder("Syringe flange", 0.26, 0.05, dark, 1.2);
  const piston = -0.07 + (r.gasReading / 60) * 1.2;
  cylinder("Piston face", 0.155, 0.035, dark, piston);
  cylinder("Piston rod", 0.045, 1.05, metal, piston + 0.54);
  cylinder("Piston thumb plate", 0.2, 0.05, dark, piston + 1.08);
  const gasLength = piston + 0.08;
  if (gasLength > 0)
    cylinder(
      "Collected gas region",
      0.145,
      gasLength,
      gas,
      (piston - 0.08) / 2,
    );
  for (let n = 0; n <= 60; n += 10) {
    const mark = mesh(
      "Schematic graduation " + n,
      new T.BoxGeometry(0.012, 0.12, 0.025),
      dark,
      -0.07 + (n / 60) * 1.2,
      0.94,
      0.1,
    );
    mark.userData = { tick: n };
  }
  root.userData.pistonX = piston;
  return root;
}
