import * as T from "three";
export interface VoltageApparatusState {
  metal1: string;
  metal2: string;
  red: string;
  black: string;
  electronFrom: string;
  electronTo: string;
  volts: string;
}
/** Macroscopic supplied-cell topology. Meter lead changes do not replace the physical plates/load. */
export function voltageCellAsset(state: VoltageApparatusState) {
  const root = new T.Group();
  root.name = "signed-cell-measurement-apparatus";
  root.userData = {
    ...state,
    representation:
      "Macroscopic supplied simple cell, electrolyte, parallel voltmeter and separate conducting load. Reading and electron direction are student predictions, not voltages/current generated from geometry.",
  };
  const mat = (color: number, opacity = 1) =>
    new T.MeshStandardMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      roughness: 0.55,
      side: T.DoubleSide,
      depthWrite: opacity === 1,
    });
  const glass = mat(0xb9cadd, 0.18),
    liquid = mat(0xcbe7ee, 0.36),
    dark = mat(0x2d3850),
    pale = mat(0xe5eaf2),
    red = mat(0xc54a56),
    black = mat(0x263046),
    white = mat(0xffffff);
  const mesh = (
    name: string,
    g: T.BufferGeometry,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    kind: string,
  ) => {
    const obj = new T.Mesh(g, m);
    obj.name = name;
    obj.position.set(x, y, z);
    obj.userData = { kind, representation: "Macroscopic apparatus" };
    root.add(obj);
    return obj;
  };
  mesh(
    "outer-open-beaker-wall",
    new T.CylinderGeometry(1.05, 1.05, 1.25, 48, 1, true),
    glass,
    0,
    -0.25,
    0,
    "open-glass-vessel",
  );
  mesh(
    "inner-open-beaker-wall",
    new T.CylinderGeometry(0.99, 0.99, 1.25, 48, 1, true),
    glass,
    0,
    -0.25,
    0,
    "open-glass-vessel",
  );
  mesh(
    "beaker-floor",
    new T.CylinderGeometry(1.05, 1.05, 0.06, 48),
    glass,
    0,
    -0.875,
    0,
    "glass-floor",
  );
  const rim = mesh(
    "open-beaker-rim",
    new T.TorusGeometry(1.02, 0.03, 8, 48),
    glass,
    0,
    0.375,
    0,
    "open-rim",
  );
  rim.rotation.x = Math.PI / 2;
  mesh(
    "supplied-electrolyte",
    new T.CylinderGeometry(0.98, 0.98, 0.8, 48),
    liquid,
    0,
    -0.43,
    0,
    "electrolyte",
  );
  mesh(
    "support-bench",
    new T.CylinderGeometry(1.18, 1.18, 0.12, 48),
    pale,
    0,
    -0.965,
    0,
    "support",
  );
  const colours: Record<string, number> = {
    copper: 0xb67243,
    chromium: 0x889ba9,
    iron: 0x707c8e,
    tin: 0xa5b6c0,
    zinc: 0x91a2b7,
  };
  for (const [role, x, metal] of [
    ["metal1", -0.7, state.metal1],
    ["metal2", 0.7, state.metal2],
  ] as const) {
    const plate = mesh(
      role + "-plate",
      new T.BoxGeometry(0.15, 1.3, 0.5),
      mat(colours[metal] ?? 0x9aabb8),
      x,
      -0.1,
      0,
      "electrode",
    );
    plate.userData = {
      kind: "electrode",
      role,
      metal,
      representation: "Separate partly immersed macroscopic plate",
    };
  }
  mesh(
    "voltmeter-body",
    new T.BoxGeometry(0.8, 0.45, 0.28),
    dark,
    0,
    1.3,
    0.75,
    "voltmeter",
  );
  mesh(
    "meter-display",
    new T.BoxGeometry(0.56, 0.25, 0.02),
    mat(0x1a2439),
    0,
    1.32,
    0.9,
    "voltmeter-display",
  );
  const symbol = new T.CatmullRomCurve3([
    new T.Vector3(-0.075, 1.4, 0.922),
    new T.Vector3(0, 1.22, 0.922),
    new T.Vector3(0.075, 1.4, 0.922),
  ]);
  mesh(
    "physical-V-symbol",
    new T.TubeGeometry(symbol, 12, 0.012, 6),
    white,
    0,
    0,
    0,
    "meter-unit-symbol",
  );
  mesh(
    "red-positive-terminal",
    new T.SphereGeometry(0.065, 12, 8),
    red,
    -0.25,
    1.04,
    0.75,
    "red-positive-input",
  );
  mesh(
    "black-COM-terminal",
    new T.SphereGeometry(0.065, 12, 8),
    black,
    0.25,
    1.04,
    0.75,
    "black-reference-input",
  );
  mesh(
    "positive-terminal-mark-horizontal",
    new T.BoxGeometry(0.07, 0.014, 0.014),
    red,
    -0.25,
    1.13,
    0.902,
    "positive-terminal-mark",
  );
  mesh(
    "positive-terminal-mark-vertical",
    new T.BoxGeometry(0.014, 0.07, 0.014),
    red,
    -0.25,
    1.13,
    0.902,
    "positive-terminal-mark",
  );
  mesh(
    "reference-terminal-mark",
    new T.BoxGeometry(0.07, 0.014, 0.014),
    white,
    0.25,
    1.13,
    0.902,
    "reference-terminal-mark",
  );
  const tube = (
    name: string,
    points: T.Vector3[],
    material: T.Material,
    kind: string,
    extra: Record<string, unknown> = {},
  ) => {
    const curve = new T.CatmullRomCurve3(points),
      wire = mesh(
        name,
        new T.TubeGeometry(curve, 40, 0.022, 8),
        material,
        0,
        0,
        0,
        kind,
      );
    wire.userData = {
      kind,
      ...extra,
      start: points[0].toArray(),
      end: points.at(-1)!.toArray(),
      representation: "Actual macroscopic connection geometry",
    };
    return wire;
  };
  for (const [name, role, terminalX, material, depth] of [
    ["red-meter-lead", state.red, -0.25, red, 0.25],
    ["black-meter-lead", state.black, 0.25, black, -0.3],
  ] as const) {
    if (role !== "metal1" && role !== "metal2") continue;
    const x = role === "metal1" ? -0.7 : 0.7;
    tube(
      name,
      [
        new T.Vector3(x, 0.55, 0.06),
        new T.Vector3(x * 1.35, 1, depth),
        new T.Vector3(terminalX, 1.04, 0.75),
      ],
      material,
      "meter-lead",
      {
        electrodeRole: role,
        terminal: name.startsWith("red") ? "positive" : "COM",
      },
    );
  }
  mesh(
    "separate-conducting-load",
    new T.BoxGeometry(0.6, 0.26, 0.3),
    mat(0x637492),
    0,
    1.75,
    -0.35,
    "load",
  );
  for (const [role, x] of [
    ["metal1", -0.7],
    ["metal2", 0.7],
  ] as const)
    tube(
      role + "-load-wire",
      [
        new T.Vector3(x, 0.5, -0.1),
        new T.Vector3(x * 1.4, 1.45, -0.55),
        new T.Vector3(Math.sign(x) * 0.3, 1.75, -0.35),
      ],
      black,
      "load-circuit",
      { electrodeRole: role },
    );
  if (
    ["metal1", "metal2"].includes(state.electronFrom) &&
    ["metal1", "metal2"].includes(state.electronTo) &&
    state.electronFrom !== state.electronTo
  ) {
    const forward = state.electronFrom === "metal1",
      arrow = new T.ArrowHelper(
        new T.Vector3(forward ? 1 : -1, 0, 0),
        new T.Vector3(forward ? -0.32 : 0.32, 1.99, -0.2),
        0.64,
        0x384ac5,
        0.13,
        0.08,
      );
    arrow.name = "proposed-load-electron-direction";
    arrow.userData = {
      kind: "student-route-annotation",
      from: state.electronFrom,
      to: state.electronTo,
      representation:
        "Proposed discharge direction, not measured current or electron speed",
    };
    root.add(arrow);
  }
  root.updateMatrixWorld(true);
  return root;
}
