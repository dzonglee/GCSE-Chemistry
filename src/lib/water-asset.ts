import * as T from "three";
import { validWater, type WaterBoard } from "./water";
export const waterDimensions = {
  flaskX: -0.085,
  flaskBottom: 0.08,
  flaskMouth: 0.2,
  receiverX: 0.1,
  receiverBottom: 0.025,
  receiverMouth: 0.155,
  collectedSurface: 0.05,
  outlet: 0.1,
};
export function makeWaterApparatus(b: WaterBoard) {
  if (!validWater("distil", b)) throw Error("Unreadable distillation proposal");
  const g = new T.Group();
  g.name = "Simple distillation apparatus";
  g.userData = {
    units: "metres",
    record: b.record,
    cooling: b.cooling || null,
    dimensions: waterDimensions,
    representation:
      "Macroscopic illustrative phase separation, not molecular geometry or a measured yield",
  };
  const glass = new T.MeshStandardMaterial({
      color: 0x94bed6,
      transparent: true,
      opacity: 0.26,
      side: T.DoubleSide,
      roughness: 0.35,
    }),
    metal = new T.MeshStandardMaterial({ color: 0x3d506d, roughness: 0.6 }),
    water = new T.MeshStandardMaterial({
      color: 0x377ed2,
      transparent: true,
      opacity: 0.7,
    }),
    bath = new T.MeshStandardMaterial({
      color: 0x75d4dc,
      transparent: true,
      opacity: 0.32,
    }),
    salt = new T.MeshStandardMaterial({ color: 0xc89932 });
  const mesh = (
    name: string,
    geometry: T.BufferGeometry,
    m: T.Material,
    x: number,
    y: number,
    z = 0,
  ) => {
    const n = new T.Mesh(geometry, m);
    n.name = name;
    n.position.set(x, y, z);
    g.add(n);
    return n;
  };
  const rod = (
    name: string,
    a: [number, number, number],
    b: [number, number, number],
    radius: number,
    m: T.Material,
  ) => {
    const start = new T.Vector3(...a),
      end = new T.Vector3(...b),
      delta = end.clone().sub(start),
      n = mesh(
        name,
        new T.CylinderGeometry(radius, radius, delta.length(), 16),
        m,
        0,
        0,
      );
    n.position.copy(start.add(end).multiplyScalar(0.5));
    n.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize());
    return n;
  };
  const lathe = (
    name: string,
    profile: [number, number][],
    x: number,
    y: number,
    m = glass,
  ) =>
    mesh(
      name,
      new T.LatheGeometry(
        profile.map((p) => new T.Vector2(...p)),
        40,
      ),
      m,
      x,
      y,
    );
  lathe(
    "Conical flask glass",
    [
      [0, 0],
      [0.044, 0],
      [0.045, 0.002],
      [0.014, 0.1],
      [0.014, 0.12],
      [0.012, 0.12],
      [0.012, 0.1],
      [0.042, 0.003],
      [0, 0.003],
    ],
    -0.085,
    0.08,
  );
  mesh(
    "Salt solution in flask",
    new T.CylinderGeometry(0.035, 0.041, 0.021, 40),
    water,
    -0.085,
    0.094,
  );
  mesh(
    "Nonvolatile salt region at heated end",
    new T.CylinderGeometry(0.015, 0.018, 0.003, 30),
    salt,
    -0.085,
    0.085,
  );
  lathe(
    "Flask bung with open delivery bore",
    [
      [0.0036, 0],
      [0.012, 0],
      [0.012, 0.012],
      [0.0036, 0.012],
      [0.0036, 0],
    ],
    -0.085,
    0.195,
    metal,
  );
  // Connected glass-wall delivery tube: no solid rod closes the vapour path.
  const points = [
      new T.Vector3(-0.085, 0.2, 0),
      new T.Vector3(-0.085, 0.25, 0),
      new T.Vector3(0.1, 0.25, 0),
      new T.Vector3(0.1, 0.1, 0),
    ],
    path = new T.CurvePath<T.Vector3>();
  for (let i = 1; i < points.length; i++)
    path.add(new T.LineCurve3(points[i - 1], points[i]));
  const wall = new T.TubeGeometry(path, 80, 0.0035, 16, false);
  mesh("Continuous hollow delivery tube", wall, glass, 0, 0);
  // TubeGeometry is a surface shell, open at both ends; centre is not filled.
  lathe(
    "Open receiver with closed bottom",
    [
      [0, 0],
      [0.008, 0],
      [0.01, 0.004],
      [0.011, 0.13],
      [0.009, 0.13],
      [0.009, 0.005],
      [0, 0.003],
    ],
    0.1,
    0.025,
  );
  mesh(
    "Collected water illustrative region",
    new T.CylinderGeometry(0.008, 0.008, 0.022, 24),
    water,
    0.1,
    0.039,
  );
  if (b.cooling === "cold") {
    lathe(
      "Open cold bath",
      [
        [0, 0],
        [0.044, 0],
        [0.045, 0.1],
        [0.042, 0.1],
        [0.042, 0.003],
        [0, 0.003],
      ],
      0.1,
      0.01,
    );
    lathe(
      "Cold bath water",
      [
        [0.012, 0.013],
        [0.041, 0.013],
        [0.041, 0.089],
        [0.012, 0.089],
        [0.012, 0.013],
      ],
      0.1,
      0,
      bath,
    );
    for (const [x, z] of [
      [0.125, 0.018],
      [0.075, -0.02],
      [0.125, -0.02],
    ])
      mesh(
        "Ice in cold bath",
        new T.BoxGeometry(0.012, 0.012, 0.012),
        new T.MeshStandardMaterial({
          color: 0xe9ffff,
          transparent: true,
          opacity: 0.7,
        }),
        x,
        0.087,
        z,
      );
  }
  mesh(
    "Tripod gauze",
    new T.BoxGeometry(0.105, 0.003, 0.1),
    metal,
    -0.085,
    0.0785,
  );
  for (const [x, z] of [
    [-0.129, -0.04],
    [-0.041, -0.04],
    [-0.085, 0.045],
  ])
    rod("Tripod leg", [x, 0, z], [x, 0.077, z], 0.003, metal);
  mesh(
    "Heater base illustrative",
    new T.CylinderGeometry(0.02, 0.024, 0.008, 30),
    metal,
    -0.085,
    0.004,
  );
  mesh(
    "Heater tube",
    new T.CylinderGeometry(0.006, 0.006, 0.045, 24),
    metal,
    -0.085,
    0.0305,
  );
  mesh(
    "Receiver stand base",
    new T.BoxGeometry(0.072, 0.005, 0.075),
    metal,
    0.16,
    0.0025,
  );
  rod(
    "Receiver stand upright",
    [0.18, 0.005, 0],
    [0.18, 0.19, 0],
    0.003,
    metal,
  );
  rod("Receiver clamp arm", [0.18, 0.12, 0], [0.112, 0.12, 0], 0.003, metal);
  const ring = mesh(
    "Receiver support collar",
    new T.TorusGeometry(0.0115, 0.002, 12, 36),
    metal,
    0.1,
    0.12,
  );
  ring.rotation.x = Math.PI / 2;
  return g;
}
export function disposeWaterApparatus(g: T.Group) {
  const gs = new Set<T.BufferGeometry>(),
    ms = new Set<T.Material>();
  g.traverse((n) => {
    const m = n as T.Mesh;
    if (m.geometry) gs.add(m.geometry);
    if (m.material)
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) =>
        ms.add(x),
      );
  });
  gs.forEach((x) => x.dispose());
  ms.forEach((x) => x.dispose());
}
