import { test, expect } from "@playwright/test";
import {
  stateParticles,
  stateDiagramParticles,
  phaseParticleRadius,
  stateFromData,
  initialStateBoard,
  validStateBoard,
  statePrediction,
  transitionData,
} from "../src/lib/states-of-matter";
import { statesForTier } from "../src/content/journeys/states-writing";
import { statesJourney } from "../src/content/journeys/states-of-matter";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { exposureIds } from "../src/lib/progress";
test("all phases conserve twenty-four unique particle identities and radii while positions show vibration rearrangement and wide gas spacing", () => {
  for (const phase of ["solid", "liquid", "gas"] as const)
    for (let frame = 0; frame < 4; frame++) {
      const particles = stateParticles(phase, frame);
      expect(particles).toHaveLength(24);
      expect(particles.map((p) => p.id)).toEqual(
        Array.from({ length: 24 }, (_, i) => i),
      );
      expect(new Set(particles.map((p) => p.position.join(","))).size).toBe(24);
      for (const p of particles) {
        expect(p.radius).toBe(phaseParticleRadius);
        for (const v of p.position)
          expect(Math.abs(v) + p.radius).toBeLessThanOrEqual(2.2);
      }
      const distances = particles.flatMap((p, i) =>
        particles
          .slice(i + 1)
          .map((q) =>
            Math.hypot(...p.position.map((v, k) => v - q.position[k])),
          ),
      );
      expect(Math.min(...distances)).toBeGreaterThanOrEqual(
        phaseParticleRadius * 2,
      );
      const drawing = stateDiagramParticles(phase, frame);
      expect(drawing).toHaveLength(24);
      for (const p of drawing) expect(p.radius).toBe(10);
      expect(
        Math.min(
          ...drawing.flatMap((p, i) =>
            drawing.slice(i + 1).map((q) => Math.hypot(p.x - q.x, p.y - q.y)),
          ),
        ),
      ).toBeGreaterThan(20);
    }
  const solid0 = stateParticles("solid", 0),
    solid1 = stateParticles("solid", 1);
  expect(solid1[0].position).not.toEqual(solid0[0].position);
  for (const p of solid1) {
    const b = [
      ((p.id % 4) - 1.5) * 0.55,
      (Math.floor(p.id / 4) % 3) * 0.55 - 1.98,
      (Math.floor(p.id / 12) - 0.5) * 0.55,
    ];
    for (let k = 0; k < 3; k++)
      expect(Math.abs(p.position[k] - b[k])).toBeLessThanOrEqual(0.0600001);
  }
  const liquid0 = stateParticles("liquid", 0),
    liquid1 = stateParticles("liquid", 1);
  expect(liquid1[0].position).not.toEqual(liquid0[0].position);
  expect(new Set(liquid0.map((p) => p.position.join(",")))).toEqual(
    new Set(liquid1.map((p) => p.position.join(","))),
  );
  const neighbours = (particles: ReturnType<typeof stateParticles>) =>
    particles
      .slice(1)
      .filter(
        (p) =>
          Math.hypot(
            ...p.position.map((v, k) => v - particles[0].position[k]),
          ) < 0.7,
      )
      .map((p) => p.id);
  expect(neighbours(liquid1)).not.toEqual(neighbours(liquid0));
  for (const frame of [0, 1, 2, 3]) {
    const gas = stateParticles("gas", frame);
    for (let k = 0; k < 3; k++)
      expect(
        Math.max(...gas.map((p) => p.position[k])) -
          Math.min(...gas.map((p) => p.position[k])),
      ).toBeGreaterThan(3);
  }
  expect(() => stateParticles("solid", 0.5)).toThrow();
  expect(() => stateDiagramParticles("gas", 4)).toThrow();
});
test("signed melting boiling intervals preserve both equality boundaries and reject invalid supplied data", () => {
  const values: [number, string][] = [
    [-40, "solid"],
    [-20, "solid/liquid"],
    [-19, "liquid"],
    [0, "liquid"],
    [59, "liquid"],
    [60, "liquid/gas"],
    [80, "gas"],
  ];
  for (const [t, state] of values)
    expect(stateFromData(t, -20, 60)).toBe(state);
  expect(stateFromData(5, -10, 30)).toBe("liquid");
  expect(stateFromData(-10, -10, 30)).toBe("solid/liquid");
  expect(stateFromData(20, -5, 45)).toBe("liquid");
  for (const args of [
    [0, 10, 10],
    [0, 30, -10],
    [NaN, -20, 60],
    [0, -20, Infinity],
  ])
    expect(() =>
      stateFromData(...(args as [number, number, number])),
    ).toThrow();
});
test("complete causal predictions retain wrong state movement energy and identity with single-frame saved operations", () => {
  for (const mode of [
    "solid",
    "liquid-gas",
    "forecast",
    "transition",
  ] as const) {
    const b = initialStateBoard(mode);
    expect(validStateBoard(mode, b)).toBe(true);
    expect(validStateBoard(mode, { ...b, extra: 1 })).toBe(false);
  }
  expect(
    statePrediction("solid", {
      arrangement: "close-ordered",
      motion: "vibrate",
      frame: 1,
    }).correct,
  ).toBe(true);
  expect(
    statePrediction("solid", {
      arrangement: "close-ordered",
      motion: "still",
      frame: 1,
    }).correct,
  ).toBe(false);
  expect(
    statePrediction("liquid-gas", {
      phase: "liquid",
      arrangement: "close-random",
      motion: "past",
      frame: 1,
    }).correct,
  ).toBe(true);
  expect(
    statePrediction("liquid-gas", {
      phase: "gas",
      arrangement: "close-random",
      motion: "past",
      frame: 1,
    }).correct,
  ).toBe(false);
  expect(
    statePrediction("liquid-gas", {
      phase: "gas",
      arrangement: "far-random",
      motion: "rapid",
      frame: 2,
    }).correct,
  ).toBe(true);
  expect(
    statePrediction("forecast", { temperature: -20, prediction: "liquid" })
      .correct,
  ).toBe(false);
  expect(
    statePrediction("forecast", {
      temperature: -20,
      prediction: "solid/liquid",
    }).correct,
  ).toBe(true);
  for (const [change, data] of Object.entries(transitionData)) {
    expect(
      statePrediction("transition", {
        change,
        energy: data.energy,
        identity: "same",
      }).correct,
    ).toBe(true);
    expect(
      statePrediction("transition", {
        change,
        energy: data.energy,
        identity: "grow",
      }).correct,
    ).toBe(false);
    expect(
      statePrediction("transition", {
        change,
        energy: data.energy === "in" ? "out" : "in",
        identity: "same",
      }).correct,
    ).toBe(false);
  }
  const model = {
      kind: "state-properties" as const,
      mode: "solid" as const,
      instruction: "Track movement.",
    },
    b = initialBoard(model);
  expect(validHistory(model, [b, { ...b, frame: 1 }])).toBe(true);
  expect(validHistory(model, [b, { ...b, frame: 3 }])).toBe(false);
  expect(validHistory(model, [b, b])).toBe(false);
  expect(validHistory(model, [b, { ...b, frame: 1, motion: "vibrate" }])).toBe(
    false,
  );
  expect(validStateBoard("solid", { ...b, frame: "1" })).toBe(false);
  expect(
    validStateBoard("forecast", { temperature: NaN, prediction: "solid" }),
  ).toBe(false);
});
test("all forty-eight state tasks have reviewed references and Higher-only extension stays outside common reserved forms", () => {
  const all = tasks(statesJourney);
  expect(all).toHaveLength(57);
  for (const q of all) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
    if (q.followUp)
      expect(statesJourney.refresher.some((r) => r.id === q.followUp)).toBe(
        true,
      );
  }
  expect(
    statesJourney.practice.find((q) => q.id === "st-v1-p-higher-limits")!.title,
  ).toContain("Higher");
  expect(
    [
      ...statesForTier(statesJourney, "foundation").checkForms.flat(),
      ...statesForTier(statesJourney, "foundation").reviewForms.flat(),
    ].some((q) => q.id.includes("higher")),
  ).toBe(false);
  expect(lessons.find((l) => l.slug === "states-of-matter")!.prerequisite).toBe(
    "inside-an-atom",
  );
  const ids = [
    "st-v1-g-solid",
    "st-v1-r-solid",
    "st-v1-ca-solid",
    "st-v1-ra-solid",
  ];
  for (const id of ids)
    for (const other of ids) expect(exposureIds([id])).toContain(other);
});
