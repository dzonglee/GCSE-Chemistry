import * as T from "three";
export const sevenSegments: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgecd",
  "7": "abc",
  "8": "abcdefg",
  "9": "abfgcd",
};
export function phProbeAsset(reading = 4.2) {
  if (
    !Number.isFinite(reading) ||
    reading < 0 ||
    reading > 14 ||
    !Number.isInteger(reading * 10)
  )
    throw new Error("Use a supplied one-decimal GCSE pH reading from 0 to 14.");
  const root = new T.Group();
  root.name = "macroscopic-ph-probe-reference";
  root.userData = {
    representation:
      "Macroscopic apparatus, not atoms, ions or molecules. Display is a supplied reading, not computed from geometry.",
    phReading: reading,
    display: reading.toFixed(1),
    temperatureC: 25,
    indicatorAdded: false,
    solutionAppearance:
      "colourless; transparent material is a visual surface, not an indicator result",
    unit: "dimensionless pH",
    calibration: "assumed checked for the supplied reference",
  };
  const body = new T.MeshStandardMaterial({ color: 0xd5ddec, roughness: 0.65 }),
    dark = new T.MeshStandardMaterial({ color: 0x26324c }),
    glass = new T.MeshStandardMaterial({
      color: 0xf0f4fb,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      side: T.DoubleSide,
    }),
    liquid = new T.MeshStandardMaterial({
      color: 0xf7f9ff,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      side: T.DoubleSide,
    }),
    screen = new T.MeshStandardMaterial({ color: 0xd9e6cf }),
    digitInk = new T.MeshBasicMaterial({ color: 0x26352b });
  const mesh = (
    name: string,
    geometry: T.BufferGeometry,
    material: T.Material,
    position: T.Vector3,
    kind: string,
  ) => {
    const m = new T.Mesh(geometry, material);
    m.name = name;
    m.position.copy(position);
    m.userData = { kind, representation: "macroscopic apparatus constituent" };
    root.add(m);
    return m;
  };
  mesh(
    "bench",
    new T.BoxGeometry(4.5, 0.08, 1.8),
    new T.MeshStandardMaterial({ color: 0xe6eaf3 }),
    new T.Vector3(0.25, -1.245, 0),
    "bench",
  );
  const wall = mesh(
    "open-beaker-wall",
    new T.LatheGeometry(
      [
        new T.Vector2(0.7, -0.65),
        new T.Vector2(0.7, 0.65),
        new T.Vector2(0.72, 0.65),
        new T.Vector2(0.72, -0.65),
        new T.Vector2(0.7, -0.65),
      ],
      48,
    ),
    glass,
    new T.Vector3(-0.9, -0.53, 0),
    "glass-beaker",
  );
  wall.userData.openTop = true;
  wall.userData.interiorRadius = 0.7;
  mesh(
    "beaker-floor",
    new T.CylinderGeometry(0.72, 0.72, 0.05, 48),
    glass,
    new T.Vector3(-0.9, -1.18, 0),
    "glass-beaker-base",
  );
  const solution = mesh(
    "clear-solution",
    new T.CylinderGeometry(0.65, 0.65, 0.85, 48),
    liquid,
    new T.Vector3(-0.9, -0.68, 0),
    "colourless-solution",
  );
  solution.userData = {
    ...solution.userData,
    phReading: reading,
    indicatorAdded: false,
    topY: -0.255,
    bottomY: -1.105,
  };
  mesh(
    "probe-shaft",
    new T.CylinderGeometry(0.065, 0.065, 1.25, 24),
    body,
    new T.Vector3(-0.9, 0.08, 0),
    "probe",
  );
  mesh(
    "probe-connector",
    new T.CylinderGeometry(0.1, 0.1, 0.28, 24),
    dark,
    new T.Vector3(-0.9, 0.67, 0),
    "probe-handle",
  );
  mesh(
    "sensor-neck",
    new T.CylinderGeometry(0.04, 0.04, 0.15, 24),
    glass,
    new T.Vector3(-0.9, -0.56, 0),
    "sensor-neck",
  );
  const tip = mesh(
    "immersed-sensing-tip",
    new T.SphereGeometry(0.09, 24, 18),
    new T.MeshStandardMaterial({ color: 0x8dacc0 }),
    new T.Vector3(-0.9, -0.64, 0),
    "sensing-tip",
  );
  tip.userData.immersed = true;
  mesh(
    "meter-housing",
    new T.BoxGeometry(1.75, 1.45, 0.28),
    body,
    new T.Vector3(1.15, 0.35, 0),
    "meter",
  );
  mesh(
    "meter-screen",
    new T.BoxGeometry(1.45, 0.75, 0.03),
    screen,
    new T.Vector3(1.15, 0.5, 0.17),
    "numeric-display",
  );
  const text = reading.toFixed(1),
    width = [...text].reduce((n, c) => n + (c === "." ? 0.12 : 0.4), 0);
  let cursor = 1.15 - width / 2;
  const segment: { [key: string]: [number, number, number, number] } = {
    a: [0, 0.26, 0.24, 0.035],
    b: [0.13, 0.13, 0.035, 0.2],
    c: [0.13, -0.13, 0.035, 0.2],
    d: [0, -0.26, 0.24, 0.035],
    e: [-0.13, -0.13, 0.035, 0.2],
    f: [-0.13, 0.13, 0.035, 0.2],
    g: [0, 0, 0.24, 0.035],
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i],
      g = new T.Group();
    g.name = "display-character-" + i;
    g.userData = { kind: "display-character", character: c, position: i };
    root.add(g);
    if (c === ".") {
      g.position.set(cursor + 0.06, 0.5, 0.215);
      const dot = new T.Mesh(new T.SphereGeometry(0.025, 16, 12), digitInk);
      dot.position.y = -0.26;
      dot.userData = {
        kind: "decimal-point",
        representation: "display mark, not a particle",
      };
      g.add(dot);
      cursor += 0.12;
      continue;
    }
    g.position.set(cursor + 0.2, 0.5, 0.215);
    for (const id of sevenSegments[c]) {
      const [x, y, w, h] = segment[id],
        m = new T.Mesh(new T.BoxGeometry(w, h, 0.025), digitInk);
      m.position.set(x, y, 0);
      m.name = "digit-" + i + "-segment-" + id;
      m.userData = { kind: "seven-segment-stroke", segment: id, character: c };
      g.add(m);
    }
    cursor += 0.4;
  }
  for (const x of [0.65, 1.65])
    mesh(
      "meter-support-" + x,
      new T.BoxGeometry(0.12, 0.85, 0.35),
      dark,
      new T.Vector3(x, -0.75, 0),
      "meter-support",
    );
  mesh(
    "meter-base",
    new T.BoxGeometry(1.6, 0.07, 0.8),
    dark,
    new T.Vector3(1.15, -1.17, 0),
    "meter-base",
  );
  const path = new T.CatmullRomCurve3([
    new T.Vector3(-0.9, 0.81, 0),
    new T.Vector3(-0.7, 1.22, 0.06),
    new T.Vector3(0.05, 1.26, 0.1),
    new T.Vector3(0.4, 0.75, 0.03),
  ]);
  mesh(
    "electronic-probe-lead",
    new T.TubeGeometry(path, 40, 0.035, 12, false),
    dark,
    new T.Vector3(),
    "electronic-lead",
  );
  return root;
}
