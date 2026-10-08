import * as T from "three";
/** Source-backed macroscopic cup cutaway; temperatures supplied, not computed from geometry. */
const digits: Record<string, string> = {
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
export function energyCupAsset(reading = 32) {
  if (
    !Number.isFinite(reading) ||
    reading < -10 ||
    reading > 50 ||
    Math.abs(reading * 10 - Math.round(reading * 10)) > 1e-8
  )
    throw Error("Use a supplied one-decimal temperature from−10 to50°C.");
  const root = new T.Group();
  root.name = "macroscopic-temperature-cup-cutaway";
  root.userData = {
    temperatureC: reading,
    display: reading.toFixed(1),
    unit: "°C",
    representation:
      "Macroscopic nested-cup cutaway with immersed temperature probe and stirrer. Supplied display, not energy computed from geometry; no atoms or energy particles. The cutaway is for visibility, not an actual open-front experimental cup.",
    solutionAppearance:
      "Blue tint is a visibility aid, not an indicator or temperature scale.",
  };
  const foam = new T.MeshStandardMaterial({
      color: 0xe5eaf2,
      roughness: 0.8,
      side: T.DoubleSide,
    }),
    outerFoam = new T.MeshStandardMaterial({
      color: 0xd4dce9,
      roughness: 0.8,
      side: T.DoubleSide,
    });
  const liquid = new T.MeshStandardMaterial({
      color: 0xa9d3de,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      side: T.DoubleSide,
    }),
    dark = new T.MeshStandardMaterial({ color: 0x35415a }),
    sensor = new T.MeshStandardMaterial({ color: 0x8dacc0 }),
    screen = new T.MeshStandardMaterial({ color: 0xd9e6cf }),
    ink = new T.MeshBasicMaterial({ color: 0x26352b });
  const mesh = (
    name: string,
    geometry: T.BufferGeometry,
    material: T.Material,
    p: T.Vector3,
    kind: string,
  ) => {
    const m = new T.Mesh(geometry, material);
    m.name = name;
    m.position.copy(p);
    m.userData = { kind, representation: "macroscopic apparatus constituent" };
    root.add(m);
    return m;
  };
  const start = Math.PI / 4,
    length = (3 * Math.PI) / 2;
  const cup = (name: string, points: T.Vector2[], material: T.Material) => {
    const m = mesh(
      name,
      new T.LatheGeometry(points, 60, start, length),
      material,
      new T.Vector3(),
      "insulating-cup-cutaway",
    );
    m.userData.cutawayRadians = Math.PI / 2;
    return m;
  };
  cup(
    "outer-polystyrene-cup",
    [
      new T.Vector2(0.6, -1.12),
      new T.Vector2(0.94, 0.25),
      new T.Vector2(0.98, 0.25),
      new T.Vector2(0.64, -1.16),
      new T.Vector2(0.6, -1.12),
    ],
    outerFoam,
  );
  cup(
    "inner-polystyrene-cup",
    [
      new T.Vector2(0.57, -1.03),
      new T.Vector2(0.88, 0.25),
      new T.Vector2(0.92, 0.25),
      new T.Vector2(0.61, -1.07),
      new T.Vector2(0.57, -1.03),
    ],
    foam,
  );
  mesh(
    "inner-cup-floor",
    new T.CylinderGeometry(0.59, 0.59, 0.04, 48),
    foam,
    new T.Vector3(0, -1.05, 0),
    "cup-floor",
  );
  mesh(
    "outer-cup-floor",
    new T.CylinderGeometry(0.64, 0.64, 0.04, 48),
    outerFoam,
    new T.Vector3(0, -1.14, 0),
    "cup-floor",
  );
  const solution = mesh(
    "reaction-solution",
    new T.CylinderGeometry(0.75, 0.57, 0.78, 48),
    liquid,
    new T.Vector3(0, -0.64, 0),
    "surrounding-solution",
  );
  solution.userData = {
    ...solution.userData,
    topY: -0.25,
    bottomY: -1.03,
    temperatureC: reading,
  };
  const lidShape = new T.Shape(),
    radius = 0.99,
    a = -Math.PI / 4,
    z = (5 * Math.PI) / 4;
  lidShape.moveTo(0, 0);
  lidShape.lineTo(radius * Math.cos(a), radius * Math.sin(a));
  lidShape.absarc(0, 0, radius, a, z, false);
  lidShape.lineTo(0, 0);
  for (const x of [-0.27, 0.27]) {
    const hole = new T.Path();
    hole.absarc(x, 0, 0.1, 0, Math.PI * 2, true);
    lidShape.holes.push(hole);
  }
  const lid = mesh(
    "cutaway-cover-with-probe-and-stirrer-holes",
    new T.ExtrudeGeometry(lidShape, {
      depth: 0.05,
      bevelEnabled: false,
      curveSegments: 48,
    }),
    foam,
    new T.Vector3(0, 0.25, 0),
    "insulating-cover",
  );
  lid.rotation.x = -Math.PI / 2;
  lid.userData.holeCentres = [
    [-0.27, 0],
    [0.27, 0],
  ];
  lid.userData.holeRadius = 0.1;
  mesh(
    "temperature-probe-shaft",
    new T.CylinderGeometry(0.04, 0.04, 1.6, 24),
    sensor,
    new T.Vector3(-0.27, -0.05, 0),
    "temperature-probe",
  );
  const tip = mesh(
    "immersed-temperature-sensor",
    new T.SphereGeometry(0.055, 24, 18),
    sensor,
    new T.Vector3(-0.27, -0.85, 0),
    "temperature-sensor",
  );
  tip.userData.immersed = true;
  mesh(
    "stirring-rod",
    new T.CylinderGeometry(0.035, 0.035, 1.55, 24),
    dark,
    new T.Vector3(0.27, -0.175, 0),
    "stirrer",
  );
  mesh(
    "meter-housing",
    new T.BoxGeometry(1.8, 0.78, 0.22),
    foam,
    new T.Vector3(-0.27, 1.12, 0),
    "temperature-meter",
  );
  mesh(
    "meter-screen",
    new T.BoxGeometry(1.58, 0.59, 0.025),
    screen,
    new T.Vector3(-0.27, 1.12, 0.125),
    "numeric-display",
  );
  const text = reading.toFixed(1),
    width = [...text].reduce((n, c) => n + (c === "." ? 0.08 : 0.28), 0),
    segments: Record<string, [number, number, number, number]> = {
      a: [0, 0.18, 0.16, 0.025],
      b: [0.09, 0.09, 0.025, 0.14],
      c: [0.09, -0.09, 0.025, 0.14],
      d: [0, -0.18, 0.16, 0.025],
      e: [-0.09, -0.09, 0.025, 0.14],
      f: [-0.09, 0.09, 0.025, 0.14],
      g: [0, 0, 0.16, 0.025],
    };
  let cursor = -0.38 - width / 2;
  for (const [i, char] of [...text].entries()) {
    const g = new T.Group();
    g.name = "temperature-display-character-" + i;
    g.userData = { kind: "display-character", character: char, index: i };
    g.position.set(cursor + (char === "." ? 0.04 : 0.14), 1.12, 0.15);
    root.add(g);
    if (char === ".") {
      const dot = new T.Mesh(new T.SphereGeometry(0.018, 16, 12), ink);
      dot.position.y = -0.18;
      dot.userData.kind = "decimal-point";
      g.add(dot);
      cursor += 0.08;
      continue;
    }
    for (const s of char === "-" ? "g" : digits[char]) {
      const [x, y, w, h] = segments[s],
        m = new T.Mesh(new T.BoxGeometry(w, h, 0.012), ink);
      m.position.set(x, y, 0);
      m.userData = { kind: "seven-segment", segment: s };
      g.add(m);
    }
    cursor += 0.28;
  }
  const degree = mesh(
    "display-degree-symbol",
    new T.TorusGeometry(0.025, 0.008, 8, 20),
    ink,
    new T.Vector3(0.34, 1.24, 0.15),
    "display-unit",
  );
  const celsius = mesh(
    "display-C",
    new T.TorusGeometry(0.07, 0.012, 8, 24, 1.5 * Math.PI),
    ink,
    new T.Vector3(0.42, 1.12, 0.15),
    "display-unit",
  );
  celsius.rotation.z = Math.PI / 4;
  degree.userData.unit = "°C";
  celsius.userData.unit = "°C";
  mesh(
    "bench",
    new T.BoxGeometry(3.2, 0.06, 2.5),
    new T.MeshStandardMaterial({ color: 0xe6eaf3 }),
    new T.Vector3(0, -1.19, 0),
    "bench",
  );
  return root;
}
