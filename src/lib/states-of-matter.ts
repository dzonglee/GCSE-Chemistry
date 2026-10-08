export type ParticlePhase = "solid" | "liquid" | "gas";
export type PredictedPhase = ParticlePhase | "solid/liquid" | "liquid/gas";
export const phaseParticleCount = 24;
export const phaseParticleRadius = 0.15;
function seededPoints(
  count: number,
  limits: [number, number][],
  minimum: number,
  seed: number,
) {
  let state = seed;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const result: [number, number, number][] = [];
  for (let attempt = 0; result.length < count && attempt < 10000; attempt++) {
    const p = limits.map(([a, b]) => a + random() * (b - a)) as [
      number,
      number,
      number,
    ];
    if (
      result.every((q) => Math.hypot(...p.map((v, i) => v - q[i])) >= minimum)
    )
      result.push(p);
  }
  if (result.length !== count)
    throw Error("Unable to form separated illustrative particles");
  return result;
}
const liquidSites = seededPoints(
  24,
  [
    [-1, 1],
    [-2, -0.65],
    [-0.65, 0.65],
  ],
  0.32,
  8462,
);
const gasSites = seededPoints(
  24,
  [
    [-2, 2],
    [-2, 2],
    [-2, 2],
  ],
  0.8,
  8464,
);
const reflect = (v: number) => {
  const n = (((v + 2) % 8) + 8) % 8;
  return n <= 4 ? n - 2 : 6 - n;
};
/** Same IDs/radii in all states. Frames exaggerate schematic motion; no
 * measured speed, pressure, density or actual particle force is calculated. */
export function stateParticles(phase: ParticlePhase, frame = 0) {
  if (!Number.isInteger(frame) || frame < 0 || frame > 3)
    throw Error("Use an available illustrative frame");
  return Array.from({ length: 24 }, (_, id) => {
    let position: [number, number, number];
    if (phase === "solid") {
      const base = [
        ((id % 4) - 1.5) * 0.55,
        (Math.floor(id / 4) % 3) * 0.55 - 1.98,
        (Math.floor(id / 12) - 0.5) * 0.55,
      ];
      position = base.map(
        (v, axis) =>
          v + 0.06 * Math.sin((frame * Math.PI) / 2 + id * 0.7 + axis),
      ) as [number, number, number];
    } else if (phase === "liquid")
      position = [...liquidSites[(id + frame * 5) % 24]];
    else
      position = gasSites[id].map((v, axis) =>
        reflect(
          v + frame * (0.35 + ((id + axis * 3) % 5) * 0.12) * (id % 2 ? 1 : -1),
        ),
      ) as [number, number, number];
    return { id, position, radius: phaseParticleRadius };
  });
}
export function stateFromData(
  temperature: number,
  melting: number,
  boiling: number,
): PredictedPhase {
  if (
    ![temperature, melting, boiling].every(Number.isFinite) ||
    melting >= boiling
  )
    throw Error("Use finite data with melting below boiling");
  return temperature < melting
    ? "solid"
    : temperature === melting
      ? "solid/liquid"
      : temperature < boiling
        ? "liquid"
        : temperature === boiling
          ? "liquid/gas"
          : "gas";
}
export const transitionData = {
  melting: { from: "solid", to: "liquid", energy: "in" },
  freezing: { from: "liquid", to: "solid", energy: "out" },
  boiling: { from: "liquid", to: "gas", energy: "in" },
  condensing: { from: "gas", to: "liquid", energy: "out" },
} as const;
export type StateMode = "solid" | "liquid-gas" | "forecast" | "transition";
export function initialStateBoard(
  mode: StateMode,
): Record<string, string | number> {
  switch (mode) {
    case "solid":
      return { arrangement: "unset", motion: "unset", frame: 0 };
    case "liquid-gas":
      return {
        phase: "liquid",
        arrangement: "unset",
        motion: "unset",
        frame: 0,
      };
    case "forecast":
      return { temperature: -40, prediction: "unset" };
    case "transition":
      return { change: "melting", energy: "unset", identity: "unset" };
  }
}
export function validStateBoard(mode: StateMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    initial = initialStateBoard(mode);
  if (
    Object.keys(b).length !== Object.keys(initial).length ||
    Object.keys(initial).some((k) => !(k in b))
  )
    return false;
  const member = (key: string, values: unknown[]) => values.includes(b[key]);
  switch (mode) {
    case "solid":
      return (
        member("arrangement", [
          "unset",
          "close-ordered",
          "far",
          "close-random",
        ]) &&
        member("motion", ["unset", "vibrate", "still", "flow"]) &&
        member("frame", [0, 1, 2, 3])
      );
    case "liquid-gas":
      return (
        member("phase", ["liquid", "gas"]) &&
        member("arrangement", [
          "unset",
          "close-random",
          "far-random",
          "close-ordered",
        ]) &&
        member("motion", ["unset", "past", "rapid", "still"]) &&
        member("frame", [0, 1, 2, 3])
      );
    case "forecast":
      return (
        member("temperature", [-40, -20, 0, 20, 40, 60, 80]) &&
        member("prediction", [
          "unset",
          "solid",
          "liquid",
          "gas",
          "solid/liquid",
          "liquid/gas",
        ])
      );
    case "transition":
      return (
        member("change", Object.keys(transitionData)) &&
        member("energy", ["unset", "in", "out"]) &&
        member("identity", ["unset", "same", "grow", "chemical"])
      );
  }
}
export function statePrediction(
  mode: StateMode,
  b: Record<string, string | number>,
) {
  const observed = b.phase === "gas" ? "gas" : "liquid";
  const change =
    transitionData[b.change as keyof typeof transitionData] ??
    transitionData.melting;
  const correct =
    mode === "solid"
      ? b.arrangement === "close-ordered" && b.motion === "vibrate"
      : mode === "liquid-gas"
        ? b.arrangement ===
            (observed === "liquid" ? "close-random" : "far-random") &&
          b.motion === (observed === "liquid" ? "past" : "rapid")
        : mode === "forecast"
          ? b.prediction === stateFromData(Number(b.temperature), -20, 60)
          : b.energy === change.energy && b.identity === "same";
  const feedback =
    mode === "solid"
      ? "Particles are close and regularly arranged in this crystalline solid model. They vibrate about fixed positions; they are not motionless. The same 24 particles and sphere radii remain in every frame. Not every solid has a perfect crystal arrangement."
      : mode === "liquid-gas"
        ? observed === "liquid"
          ? "Liquid particles stay close but are disordered and can move past one another. Particle identities/counts/sizes are retained; neighbours can change. The frames are illustrative, not measured trajectories."
          : "Gas particles are widely spaced and move rapidly/randomly through available space. Count and particle size remain the same; more space between particles is not bigger atoms. Frames do not measure a real speed."
        : mode === "forecast"
          ? `At ${b.temperature} °C, the supplied pure-substance data (melting −20 °C, boiling 60 °C at fixed pressure) predict ${stateFromData(Number(b.temperature), -20, 60)}. At an exact transition, both phases may coexist; temperature alone does not establish the proportions.`
          : `${String(b.change)[0].toUpperCase() + String(b.change).slice(1)} changes ${change.from} to ${change.to}. Energy is transferred ${change.energy === "in" ? "into the substance" : "from the substance to its surroundings"}. Particle chemical identity is retained; they do not grow or become a new substance. Relevant forces depend on the bonding and structure, so do not assume every material has only weak intermolecular forces.`;
  return {
    correct,
    feedback: correct ? feedback : `Your predictions are retained. ${feedback}`,
  };
}

const liquidDiagramSites = seededPoints(
  24,
  [
    [60, 300],
    [210, 298],
    [0, 0],
  ],
  24,
  325,
);
const gasDiagramFrames = Array.from({ length: 4 }, (_, frame) =>
  seededPoints(
    24,
    [
      [40, 320],
      [40, 290],
      [0, 0],
    ],
    30,
    625 + frame * 37,
  ),
);
/** Separate flat schematic, not a literal projection of the 3D positions. */
export function stateDiagramParticles(phase: ParticlePhase, frame = 0) {
  if (!Number.isInteger(frame) || frame < 0 || frame > 3)
    throw Error("Use an available illustrative frame");
  return Array.from({ length: 24 }, (_, id) => {
    const p =
      phase === "solid"
        ? [
            85 + (id % 6) * 30 + 2 * Math.sin((frame * Math.PI) / 2 + id),
            220 +
              Math.floor(id / 6) * 26 +
              2 * Math.cos((frame * Math.PI) / 2 + id),
          ]
        : phase === "liquid"
          ? liquidDiagramSites[(id + frame * 5) % 24]
          : gasDiagramFrames[frame][id];
    return { id, x: p[0], y: p[1], radius: 10 };
  });
}
