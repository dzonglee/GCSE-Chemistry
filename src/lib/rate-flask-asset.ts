import * as T from "three";
export interface RateFlaskState {
  closure: "porous-cotton-wool" | "sealed-boundary" | "open-neck";
  phase: "start" | "end";
  reading: number;
  loss: "only-gas" | "mixed-loss" | "retained-gas";
}
/** Macroscopic apparatus and boundary annotation; no geometry-to-mass calculation or particle inventory. */
export function rateFlaskAsset(state: RateFlaskState) {
  if ((state.closure === "sealed-boundary") !== (state.loss === "retained-gas"))
    throw Error("Inconsistent supplied gas boundary");
  const root = new T.Group();
  root.name = "rate-measurement-flask";
  root.userData = {
    ...state,
    representation:
      "Macroscopic measurement boundary; supplied reading, not calculated chemistry",
    units: "g",
  };
  const glass = new T.MeshPhysicalMaterial({
      color: "#dce7ef",
      transparent: true,
      opacity: 0.23,
      roughness: 0.12,
      metalness: 0,
      depthWrite: false,
      side: T.DoubleSide,
    }),
    steel = new T.MeshStandardMaterial({ color: "#7c8a9e", roughness: 0.7 }),
    body = new T.MeshStandardMaterial({ color: "#42536e", roughness: 0.65 }),
    water = new T.MeshStandardMaterial({
      color: "#b9d4e3",
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
    }),
    chip = new T.MeshStandardMaterial({ color: "#b1b6ae", roughness: 1 }),
    wool = new T.MeshStandardMaterial({ color: "#f5f2e8", roughness: 1 }),
    blue = new T.MeshStandardMaterial({ color: "#4358bd" }),
    white = new T.MeshStandardMaterial({ color: "#dce8ef" });
  const mesh = (
    name: string,
    geometry: T.BufferGeometry,
    material: T.Material,
    position: [number, number, number],
  ) => {
    const m = new T.Mesh(geometry, material);
    m.name = name;
    m.position.set(...position);
    root.add(m);
    return m;
  };
  mesh("balance-body", new T.BoxGeometry(2.6, 0.3, 1.8), body, [0, -0.15, 0]);
  mesh(
    "weighing-pan",
    new T.CylinderGeometry(1.02, 1.02, 0.05, 64),
    steel,
    [0, 0.025, 0],
  );
  mesh(
    "flask-floor",
    new T.CylinderGeometry(0.95, 0.95, 0.06, 64),
    glass,
    [0, 0.08, 0],
  );
  for (const [name, r1, r2] of [
    ["flask-outer-wall", 0.95, 0.27],
    ["flask-inner-wall", 0.88, 0.2],
  ] as const) {
    mesh(
      name,
      new T.LatheGeometry(
        [
          new T.Vector2(r1, 0.1),
          new T.Vector2(r2, 1.1),
          new T.Vector2(r2, 1.65),
        ],
        64,
      ),
      glass,
      [0, 0, 0],
    );
  }
  const rim = mesh(
    "open-neck-rim",
    new T.TorusGeometry(0.235, 0.035, 12, 64),
    glass,
    [0, 1.65, 0],
  );
  rim.rotation.x = Math.PI / 2;
  mesh(
    "supplied-liquid",
    new T.CylinderGeometry(0.57, 0.86, 0.4, 64),
    water,
    [0, 0.31, 0],
  );
  for (const [i, x, z] of [
    [0, -0.4, -0.25],
    [1, 0.3, -0.3],
    [2, -0.15, 0.3],
    [3, 0.4, 0.22],
    [4, 0.02, -0.02],
  ] as const) {
    const m = mesh(
      "schematic-marble-chip-" + i,
      new T.DodecahedronGeometry(0.095),
      chip,
      [x, 0.21, z],
    );
    m.rotation.set(i * 0.21, i * 0.43, i * 0.12);
    m.userData = {
      representation:
        "Apparatus illustration only; this chip is not a measured mass or atom count",
    };
  }
  if (state.closure === "porous-cotton-wool") {
    for (const [i, x, z] of [
      [0, -0.12, 0],
      [1, 0.12, 0],
      [2, 0, -0.12],
      [3, 0, 0.12],
      [4, 0.09, 0.09],
    ] as const) {
      const m = mesh(
        "porous-wool-cluster-" + i,
        new T.SphereGeometry(0.065, 12, 10),
        wool,
        [x, 1.55, z],
      );
      m.userData = {
        representation:
          "Schematic porous wool; central egress path remains open",
      };
    }
  }
  if (state.closure === "sealed-boundary")
    mesh(
      "specified-sealing-cap",
      new T.CylinderGeometry(0.27, 0.27, 0.18, 48),
      body,
      [0, 1.6, 0],
    );
  if (state.phase === "end") {
    const retained = state.loss === "retained-gas",
      lo = retained ? 0.7 : 1.67,
      hi = retained ? 1.23 : 2.3;
    const stem = mesh(
      retained ? "retained-gas-boundary-arrow" : "escaping-gas-boundary-arrow",
      new T.CylinderGeometry(0.012, 0.012, hi - lo, 12),
      blue,
      [0, (lo + hi) / 2, 0],
    );
    stem.userData = {
      representation:
        "Boundary annotation, not molecule number or measured gas speed",
    };
    mesh("boundary-arrow-head", new T.ConeGeometry(0.055, 0.13, 12), blue, [
      0,
      hi + 0.065,
      0,
    ]);
  }
  mesh(
    "balance-display-face",
    new T.BoxGeometry(1.35, 0.22, 0.015),
    body,
    [0, -0.15, 0.915],
  );
  const segments: Record<string, string> = {
      "0": "abcedf",
      "1": "bc",
      "2": "abged",
      "3": "abgcd",
      "4": "fgbc",
      "5": "afgcd",
      "6": "afgecd",
      "7": "abc",
      "8": "abcdefg",
      "9": "abfgcd",
    },
    text = state.reading.toFixed(1),
    width = 0.14,
    start = (-(text.length - 1) * width) / 2;
  const places: Record<string, [number, number, boolean]> = {
    a: [0, 0.072, true],
    b: [0.039, 0.036, false],
    c: [0.039, -0.036, false],
    d: [0, -0.072, true],
    e: [-0.039, -0.036, false],
    f: [-0.039, 0.036, false],
    g: [0, 0, true],
  };
  [...text].forEach((digit, i) => {
    const x = start + i * width;
    if (digit === ".") {
      mesh("reading-decimal-" + i, new T.SphereGeometry(0.009, 8, 6), white, [
        x,
        -0.21,
        0.927,
      ]);
      return;
    }
    for (const s of segments[digit] ?? "") {
      const [dx, dy, horizontal] = places[s];
      mesh(
        `reading-digit-${i}-${s}`,
        new T.BoxGeometry(
          horizontal ? 0.072 : 0.012,
          horizontal ? 0.012 : 0.06,
          0.008,
        ),
        white,
        [x + dx, -0.15 + dy, 0.927],
      );
    }
  });
  root.updateMatrixWorld(true);
  return root;
}
