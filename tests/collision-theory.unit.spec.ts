import { test, expect } from "@playwright/test";
import {
  collisionJourney as journey,
  collisionAllTasks,
} from "../src/content/journeys/collision-theory";
import {
  collisionRecords,
  initialCollisionBoard,
  validCollisionBoard,
  validCollisionNumber,
  collisionHistoryStep,
  collisionBoardCheck,
} from "../src/lib/collision-board";
import {
  surfaceGeometry,
  gasParticlePositions,
  solidPiecePositions,
  successfulEncounter,
  type CollisionMode,
} from "../src/lib/collision-theory";
import { collisionAsset } from "../src/lib/collision-asset";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
const answers = {
  conditions: {
    initial: { outcome: "no" },
    threshold: { outcome: "yes" },
    noContact: { outcome: "no" },
    inert: { outcome: "no" },
    molecular: { outcome: "no" },
    atomic: { outcome: "yes" },
  },
  solution: {
    initial: {
      particles: "24",
      occupiedVolume: "2",
      density: "12",
      direction: "more",
      kinetic: "unchanged",
    },
    dilution: {
      particles: "12",
      occupiedVolume: "4",
      density: "3",
      direction: "less",
      kinetic: "unchanged",
    },
    equal: {
      particles: "24",
      occupiedVolume: "4",
      density: "6",
      direction: "same",
      kinetic: "unchanged",
    },
    vessel: {
      particles: "12",
      occupiedVolume: "2",
      density: "6",
      direction: "same",
      kinetic: "unchanged",
    },
    lessDespiteCount: {
      particles: "18",
      occupiedVolume: "6",
      density: "3",
      direction: "less",
      kinetic: "unchanged",
    },
    moreDespiteCount: {
      particles: "18",
      occupiedVolume: "2",
      density: "9",
      direction: "more",
      kinetic: "unchanged",
    },
  },
  gas: {
    initial: {
      occupiedVolume: "2",
      density: "6",
      direction: "more",
      kinetic: "unchanged",
    },
    expansion: {
      occupiedVolume: "4",
      density: "3",
      direction: "less",
      kinetic: "unchanged",
    },
    unchanged: {
      occupiedVolume: "2",
      density: "6",
      direction: "same",
      kinetic: "unchanged",
    },
    stronger: {
      occupiedVolume: "1",
      density: "24",
      direction: "more",
      kinetic: "unchanged",
    },
    inert: {
      occupiedVolume: "2",
      density: "6",
      direction: "same",
      kinetic: "unchanged",
    },
    inertCompression: {
      occupiedVolume: "2",
      density: "6",
      direction: "more",
      kinetic: "unchanged",
    },
  },
  surface: {
    initial: {
      divisions: "2",
      separated: "yes",
      pieces: "8",
      area: "192",
      volume: "64",
      ratio: "3",
      rateFactor: "not-established",
    },
    whole: {
      divisions: "1",
      separated: "no",
      pieces: "1",
      area: "96",
      volume: "64",
      ratio: "1.5",
      rateFactor: "not-established",
    },
    fine: {
      divisions: "4",
      separated: "yes",
      pieces: "64",
      area: "384",
      volume: "64",
      ratio: "6",
      rateFactor: "not-established",
    },
    joinedEight: {
      divisions: "2",
      separated: "no",
      pieces: "8",
      area: "96",
      volume: "64",
      ratio: "1.5",
      rateFactor: "not-established",
    },
    joinedFine: {
      divisions: "4",
      separated: "no",
      pieces: "64",
      area: "96",
      volume: "64",
      ratio: "1.5",
      rateFactor: "not-established",
    },
    separateWhole: {
      divisions: "1",
      separated: "yes",
      pieces: "1",
      area: "96",
      volume: "64",
      ratio: "1.5",
      rateFactor: "not-established",
    },
  },
  comparison: {
    initial: { rateA: ".8", rateB: ".4", faster: "A" },
    slower: { rateA: ".5", rateB: ".25", faster: "A" },
    reverse: { rateA: ".3", rateB: ".6", faster: "B" },
    differentAmount: { rateA: "1", rateB: "1.3333333333", faster: "B" },
    equalRate: { rateA: ".6", rateB: ".6", faster: "same" },
    mass: { rateA: ".02", rateB: ".03", faster: "B" },
  },
  evidence: {
    initial: { claim: "frequency", reason: "density" },
    exactRate: { claim: "direction-only", reason: "measurement-needed" },
    solidAmount: { claim: "speed-not-amount", reason: "same-material" },
    joined: { claim: "outer-faces", reason: "interfaces-blocked" },
    depletion: { claim: "frequency-decreases", reason: "reactant-consumed" },
    cooling: { claim: "energy-and-speed", reason: "temperature-lower" },
  },
};

const expectedCases = answers as Record<
  CollisionMode,
  Record<string, Record<string, string>>
>;
for (const mode of Object.keys(collisionRecords) as CollisionMode[])
  test(
    mode +
      ": native cases keep incorrect predictions, honest feedback and canonical saved histories",
    () => {
      for (const [record, fields] of Object.entries(expectedCases[mode])) {
        const model = {
          kind: "collision-theory" as const,
          mode,
          record,
          instruction: "Predict the stated controlled comparison.",
        };
        const initial = initialCollisionBoard(mode, record),
          right = { ...initial };
        for (const [k, v] of Object.entries(fields))
          right[k] = v.startsWith(".") ? "0" + v : v;
        expect(validCollisionBoard(mode, initial)).toBe(true);
        expect(checkBoard(model, initial).correct).toBe(false);
        expect(
          collisionBoardCheck(mode, right).correct,
          mode + "/" + record,
        ).toBe(true);
        expect(checkBoard(model, right).correct).toBe(true);
        const history = [initial];
        let current = initial;
        for (const [k, v] of Object.entries(right)) {
          if (current[k] === v) continue;
          const next = { ...current, [k]: v };
          expect(collisionHistoryStep(mode, current, next)).toBe(true);
          history.push(next);
          current = next;
        }
        expect(validHistory(model, history)).toBe(true);
        const prediction =
          mode === "conditions"
            ? "outcome"
            : mode === "solution" || mode === "gas"
              ? "density"
              : mode === "surface"
                ? "area"
                : mode === "comparison"
                  ? "rateA"
                  : "claim";
        const wrong = {
          ...right,
          [prediction]: ["outcome", "claim"].includes(prediction)
            ? "unset"
            : String(Number(right[prediction]) + 1),
        };
        expect(validCollisionBoard(mode, wrong)).toBe(true);
        expect(checkBoard(model, wrong).correct).toBe(false);
        expect(checkBoard(model, wrong).feedback.length).toBeGreaterThan(40);
      }
    },
  );
test("saved schemas reject invalid values and multi-field teleports while record changes reset atomically", () => {
  for (const v of [
    "",
    "1/2",
    "1e2",
    "NaN",
    "Infinity",
    "-1",
    "01",
    ".5",
    "0.12345678901",
    1,
    null,
  ])
    expect(validCollisionNumber(v)).toBe(false);
  for (const v of ["0", "0.02", "1.3333333333", "100000"])
    expect(validCollisionNumber(v)).toBe(true);
  const model = {
      kind: "collision-theory" as const,
      mode: "surface" as const,
      instruction: "Construct and predict.",
    },
    a = initialBoard(model),
    b = { ...a, divisions: "2" },
    c = { ...b, separated: "yes" };
  expect(validHistory(model, [a, b, c])).toBe(true);
  expect(validHistory(model, [a, c])).toBe(false);
  expect(validHistory(model, [a, a])).toBe(false);
  expect(validCollisionBoard("surface", { ...a, extra: "0" })).toBe(false);
  expect(
    collisionHistoryStep(
      "surface",
      a,
      initialCollisionBoard("surface", "fine"),
    ),
  ).toBe(true);
  expect(
    collisionHistoryStep("surface", a, {
      ...initialCollisionBoard("surface", "fine"),
      divisions: "4",
    }),
  ).toBe(false);
});
test("collision conditions distinguish threshold, absence of contact, inert partners and a specified molecular condition", () => {
  const e = {
    contact: true,
    reactingPartner: true,
    energy: 30,
    activation: 30,
    molecular: false,
    suitableOrientation: false,
  };
  expect(successfulEncounter(e)).toBe(true);
  expect(successfulEncounter({ ...e, energy: 29.999 })).toBe(false);
  expect(successfulEncounter({ ...e, contact: false, energy: 100 })).toBe(
    false,
  );
  expect(successfulEncounter({ ...e, reactingPartner: false })).toBe(false);
  expect(successfulEncounter({ ...e, molecular: true })).toBe(false);
  expect(
    successfulEncounter({ ...e, molecular: true, suitableOrientation: true }),
  ).toBe(true);
});
test("accessible-face geometry conserves material and excludes joined internal interfaces", () => {
  for (const divisions of [1, 2, 4] as const)
    for (const separated of [false, true]) {
      const g = surfaceGeometry(divisions, separated),
        ps = solidPiecePositions(divisions, separated);
      expect(ps).toHaveLength(divisions ** 3);
      expect(ps.reduce((v, p) => v + p.side ** 3, 0)).toBe(64);
      expect(g.accessibleArea).toBe(separated ? 96 * divisions : 96);
      const root = collisionAsset({ kind: "solid", divisions, separated });
      const pieces = root.children.filter((p) =>
        p.name.startsWith("solid-piece-"),
      );
      expect(
        pieces.reduce(
          (sum, p) => sum + p.userData.accessibleFaces * (4 / divisions) ** 2,
          0,
        ),
      ).toBe(g.accessibleArea);
      for (let i = 0; i < ps.length; i++)
        for (const q of ps.slice(i + 1))
          expect(
            [
              Math.abs(ps[i].x - q.x),
              Math.abs(ps[i].y - q.y),
              Math.abs(ps[i].z - q.z),
            ].some((d) => (separated ? d > ps[i].side : d >= ps[i].side)),
          ).toBe(true);
    }
});
test("irregular fixed-radius gas particles stay confined and separate in the minimum and expanded volumes", () => {
  for (const volume of [1, 2, 4, 6]) {
    const ps = gasParticlePositions(24, 12, volume);
    expect(ps).toHaveLength(36);
    expect(ps.filter((p) => p.species === "reacting")).toHaveLength(24);
    expect(new Set(ps.map((p) => p.z)).size).toBeGreaterThan(20);
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      expect(p.radius).toBe(0.09);
      expect(Math.abs(p.x) + p.radius).toBeLessThanOrEqual(volume / 2 + 1e-12);
      expect(Math.abs(p.y) + p.radius).toBeLessThanOrEqual(1 + 1e-12);
      expect(Math.abs(p.z) + p.radius).toBeLessThanOrEqual(1 + 1e-12);
      for (const q of ps.slice(i + 1))
        expect(
          Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z),
        ).toBeGreaterThanOrEqual(0.18);
    }
  }
  expect(() => gasParticlePositions(50, 0, 1)).toThrow();
  expect(() => gasParticlePositions(12, 0, NaN)).toThrow();
});
test("all authored tasks keep exact numerical references, per-error explanations, targeted recovery and honest written marking", () => {
  expect(collisionAllTasks).toHaveLength(72);
  expect(new Set(collisionAllTasks.map((q) => q.id)).size).toBe(72);
  expect(journey.practice).toHaveLength(32);
  const references: Record<string, number> = {
    "warm-density": 12 / 2,
    "guide-energy": 30,
    "guide-solution": 24 / 2,
    "guide-gas": 12 / 2,
    "guide-solid": 8 * 6 * 2 ** 2,
    "guide-endpoint": 20 / 25,
    "p-density": 18 / 6,
    "p-dilution": 12 / 4,
    "p-compression": 24 / 1,
    "p-eight-area": 8 * 6 * 2 ** 2,
    "p-fine-area": 64 * 6,
    "p-joined-area": 6 * 4 ** 2,
    "p-area-volume": 192 / 64,
    "p-rate": 30 / 40,
    "check-a-density": 18 / 3,
    "check-a-area": 27 * 6 * 2 ** 2,
    "check-b-rate": 15 / 30,
    "review-a-density": 21 / 3,
    "review-a-area": 27 * 6,
    "review-b-rate": 24 / 80,
    "refresh-density": 10 / 2,
    "refresh-gas": 12 / 3,
    "refresh-face": 6 * 2 ** 2,
    "refresh-area-volume": 120 / 40,
    "refresh-rate": 10 / 20,
  };
  for (const q of collisionAllTasks) {
    if (q.rubric) {
      expect(mark(q, q.answer).selfReview).toBe(true);
      expect(mark(q, q.answer).correct).toBe(false);
    } else if (q.options) {
      expect(q.options).toContain(q.answer);
      expect(mark(q, q.answer).correct).toBe(true);
      for (const wrong of q.options.filter((o) => o !== q.answer)) {
        expect(q.misconceptions?.[wrong]).toBeTruthy();
        expect(mark(q, wrong).correct).toBe(false);
      }
    } else {
      expect(Number(q.answer)).toBe(references[q.id.slice(6)]);
      expect(mark(q, q.answer).correct).toBe(true);
      expect(mark(q, String(Number(q.answer) + 1)).correct).toBe(false);
    }
  }
  for (const q of journey.practice)
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  for (const q of [...journey.checkForms.flat(), ...journey.reviewForms.flat()])
    expect(q.model).toBeUndefined();
  const l = lessons.find((l) => l.slug === "collision-theory")!;
  expect([...l.questions, ...l.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "collision-theory-" + i),
  );
  expect(lessons).toHaveLength(95);
});
test("all six original collision questions and relevant prior work directly expose matching new procedures", async () => {
  const { exposureIds } = await import("../src/lib/progress");
  for (const [id, target] of [
    ["collision-theory-0", "ct-v1-check-a-density"],
    ["collision-theory-1", "ct-v1-check-a-area"],
    ["collision-theory-2", "ct-v1-check-a-compress"],
    ["collision-theory-3", "ct-v1-check-a-energy"],
    ["collision-theory-4", "ct-v1-check-b-explain"],
    ["collision-theory-5", "ct-v1-check-a-area"],
    ["rr-v1-r-rate", "ct-v1-check-b-rate"],
    ["sc-v1-r-basis", "ct-v1-check-b-density"],
  ])
    expect(exposureIds([id])).toContain(target);
});
