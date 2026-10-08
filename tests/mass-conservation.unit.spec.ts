import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
import { test, expect } from "@playwright/test";
import {
  inventoryMass,
  gasMassBalance,
  oxidationMass,
  weightedMass,
  initialMassBoard,
  validMassBoard,
  massPrediction,
  type MassMode,
} from "../src/lib/mass-conservation";
import { gasBoundaryAsset } from "../src/lib/gas-boundary-asset";
import { massConservationJourney } from "../src/content/journeys/conservation-of-mass";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
test("mass accounting defines apparatus, unused reactants, retained gas and oxygen transfer independently", () => {
  expect(inventoryMass("complete", "apparatus")).toEqual({
    initial: 20,
    products: 20,
    unreacted: 0,
    afterContents: 20,
    reading: 70,
  });
  expect(inventoryMass("leftover", "apparatus")).toEqual({
    initial: 17,
    products: 13,
    unreacted: 4,
    afterContents: 17,
    reading: 67,
  });
  expect(inventoryMass("leftover", "contents").reading).toBe(17);
  for (let stage = 0; stage <= 3; stage++) {
    const open = gasMassBalance(false, stage),
      closed = gasMassBalance(true, stage);
    expect(open.reading + open.escapedMass).toBe(75);
    expect(closed.reading).toBe(75);
    expect(closed.escaped).toBe(0);
    expect(open.retainedGas + open.escapedMass).toBe(4.5);
    expect(open.packets.map((p) => p.id)).toEqual([0, 1, 2]);
    expect(open.packets.filter((p) => !p.inside)).toHaveLength(stage);
  }
  expect(() => gasMassBalance(false, 1.5)).toThrow();
  expect(() => gasMassBalance(false, 4)).toThrow();
  expect(oxidationMass(1, "sample")).toMatchObject({
    magnesium: 12,
    oxygen: 8,
    oxide: 20,
    before: 12,
    after: 20,
    gain: 8,
  });
  expect(oxidationMass(2, "closed")).toMatchObject({
    magnesium: 24,
    oxygen: 16,
    oxide: 40,
    before: 40,
    after: 40,
    gain: 0,
  });
  expect(weightedMass("water", [2, 1, 2])).toMatchObject({
    left: 36,
    right: 36,
    atoms: { balanced: true },
  });
  expect(weightedMass("water", [1, 1, 1])).toMatchObject({
    left: 34,
    right: 18,
    atoms: { balanced: false },
  });
  expect(weightedMass("magnesium", [2, 1, 2])).toMatchObject({
    left: 80,
    right: 80,
    atoms: { balanced: true },
  });
});
test("actual boundary asset retains all three parcel identities and all carbon dioxide atoms across every transfer snapshot", () => {
  for (const closed of [true, false])
    for (let stage = 0; stage <= 3; stage++) {
      const group = gasBoundaryAsset(closed, stage),
        parcels = group.children.filter((n) =>
          n.name.startsWith("CO2-parcel-"),
        );
      expect(parcels).toHaveLength(3);
      expect(parcels.map((n) => n.userData.parcelId)).toEqual([0, 1, 2]);
      expect(parcels.reduce((sum, p) => sum + p.userData.grams, 0)).toBe(4.5);
      expect(parcels.filter((p) => !p.userData.inside)).toHaveLength(
        closed ? 0 : stage,
      );
      expect(!!group.getObjectByName("closed-boundary-lid")).toBe(closed);
      const atoms: string[] = [];
      for (const parcel of parcels)
        parcel.traverse((node) => {
          const m = node.name.match(/-atom-\d+-(C|O)$/);
          if (m) {
            atoms.push(m[1]);
            const point = node.position.clone().add(parcel.position),
              radius = Number(node.scale.x);
            if (parcel.userData.inside) {
              expect(Math.hypot(point.x, point.z) + radius).toBeLessThan(2);
              expect(Math.abs(point.y) + radius).toBeLessThan(1.8);
            } else expect(point.x - radius).toBeGreaterThan(2);
          }
        });
      expect(atoms.filter((a) => a === "C")).toHaveLength(3);
      expect(atoms.filter((a) => a === "O")).toHaveLength(6);
      expect(group.userData.readingGrams + group.userData.escapedGrams).toBe(
        75,
      );
    }
});
test("complete predictions require boundary-specific mass and cause while preserving false reasoning", () => {
  for (const mode of [
    "inventory",
    "gas",
    "oxidation",
    "weighted",
  ] as MassMode[]) {
    const b = initialMassBoard(mode);
    expect(validMassBoard(mode, b)).toBe(true);
    expect(massPrediction(mode, b).correct).toBe(false);
    expect(validMassBoard(mode, { ...b, extra: 1 })).toBe(false);
  }
  for (const [mode, b] of [
    [
      "inventory",
      {
        case: "complete",
        boundary: "apparatus",
        reading: "70",
        productTotal: "20",
      },
    ],
    [
      "inventory",
      {
        case: "leftover",
        boundary: "apparatus",
        reading: "67",
        productTotal: "13",
      },
    ],
    [
      "inventory",
      {
        case: "leftover",
        boundary: "contents",
        reading: "17",
        productTotal: "13",
      },
    ],
    ["gas", { closure: "closed", stage: 3, reading: "75", reason: "retained" }],
    ["gas", { closure: "open", stage: 3, reading: "70.5", reason: "escaped" }],
    [
      "oxidation",
      {
        scale: 2,
        boundary: "sample",
        after: "40",
        gain: "16",
        reason: "entered",
      },
    ],
    [
      "oxidation",
      {
        scale: 2,
        boundary: "closed",
        after: "40",
        gain: "0",
        reason: "retained",
      },
    ],
    [
      "weighted",
      { reaction: "water", a: 2, b: 1, c: 2, left: "36", right: "36" },
    ],
    [
      "weighted",
      { reaction: "magnesium", a: 2, b: 1, c: 2, left: "80", right: "80" },
    ],
  ] as [MassMode, Record<string, string | number>][]) {
    expect(validMassBoard(mode, b)).toBe(true);
    expect(massPrediction(mode, b).correct).toBe(true);
  }
  expect(
    massPrediction("inventory", {
      case: "leftover",
      boundary: "apparatus",
      reading: "67",
      productTotal: "17",
    }).correct,
  ).toBe(false);
  expect(
    massPrediction("gas", {
      closure: "open",
      stage: 3,
      reading: "70.5",
      reason: "destroyed",
    }).correct,
  ).toBe(false);
  expect(
    massPrediction("oxidation", {
      scale: 1,
      boundary: "sample",
      after: "20",
      gain: "8",
      reason: "heat",
    }).correct,
  ).toBe(false);
  expect(
    massPrediction("weighted", {
      reaction: "water",
      a: 2,
      b: 1,
      c: 2,
      left: "34",
      right: "18",
    }).correct,
  ).toBe(false);
  expect(
    validMassBoard("gas", { ...initialMassBoard("gas"), stage: "3" }),
  ).toBe(false);
});
test("all forty-nine tasks retain mass definitions, correct references and ungraded written reasoning", () => {
  const qs = tasks(massConservationJourney).filter((q) =>
    q.id.startsWith("mc-v1-"),
  );
  expect(qs).toHaveLength(49);
  expect(
    massConservationJourney.practice.filter((q) => q.id.startsWith("mc-v1-")),
  ).toHaveLength(22);
  expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
  const ids = new Set(qs.map((q) => q.id));
  for (const q of qs) {
    expect(q.prompt.trim()).not.toBe("");
    expect(q.explanation.trim()).not.toBe("");
    const result = mark(q, q.answer);
    expect(result.correct).toBe(!q.rubric);
    if (q.rubric) expect(result.selfReview).toBe(true);
    if (q.followUp) expect(ids.has(q.followUp)).toBe(true);
  }
  const q = massConservationJourney.practice.find(
    (q) => q.id === "mc-v1-p-ledger",
  )!;
  expect(
    mark(q, JSON.stringify({ contents: "11.5", reading: "11.5", gas: "2.5" }))
      .correct,
  ).toBe(false);
  expect(
    mark(q, JSON.stringify({ contents: "11.5", reading: "47.5" })).correct,
  ).toBe(false);
  expect(
    massConservationJourney.practice.find((q) => q.id === "mc-v1-p-oxidation")!
      .answer,
  ).toBe("30");
  expect(
    massConservationJourney.practice.find((q) => q.id === "mc-v1-p-gain")!
      .answer,
  ).toBe("4.8");
  expect(massConservationJourney.checkForms[0][2].answer).toBe("12");
  expect(massConservationJourney.reviewForms[1][0].answer).toBe("14");
});

test("registered mass journey preserves valid model history, rejects malformed storage and aliases repeated reasoning", () => {
  const lesson = lessons.find((l) => l.slug === "conservation-of-mass")!;
  expect(lesson.prerequisite).toBe("balancing-equations");
  expect(lesson.questions).toEqual([]);
  expect(lesson.checks).toEqual([]);
  expect(lesson.course).toBe("combined");
  const progress = emptyProgress();
  const work = emptyWork();
  work.taskModels = {};
  for (const q of massConservationJourney.guided) {
    const board = initialBoard(q.model!);
    expect(validHistory(q.model!, [board])).toBe(true);
    expect(validHistory(q.model!, [])).toBe(false);
    expect(validHistory(q.model!, [board, board])).toBe(false);
    expect(validHistory(q.model!, [board, { ...board, extra: 1 }])).toBe(false);
    work.taskModels[q.id] = [board];
  }
  progress.work[lesson.slug] = work;
  expect(decode(JSON.stringify(progress))).toEqual(progress);
  work.taskModels["mc-v1-g-gas"] = [{ ...initialMassBoard("gas"), stage: "3" }];
  expect(decode(JSON.stringify(progress))).toBeNull();
  expect(exposureIds(["mc-v1-ca-retained"])).toContain(
    "conservation-and-concentration-1",
  );
  expect(exposureIds(["mc-v1-cb-cause"])).toContain("mc-v1-r-oxygen");
  expect(exposureIds(["mc-v1-cb-inference"])).toContain("mc-v1-p-incomplete");
  expect(exposureIds(["mc-v1-ca-product"])).toEqual(["mc-v1-ca-product"]);
});
