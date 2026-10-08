import { test, expect } from "@playwright/test";
import {
  temperatureJourney as journey,
  temperatureAllTasks,
} from "../src/content/journeys/temperature-and-catalysts";
import {
  energySamples,
  thresholdSamples,
  thermalProfiles,
  additiveEvidence,
  thermalComparisons,
  thermalClaims,
  type ThermalMode,
} from "../src/lib/temperature-catalysts";
import {
  initialThermalBoard,
  thermalRecords,
  validThermalBoard,
  thermalHistoryStep,
  thermalBoardCheck,
  type ThermalBoard,
} from "../src/lib/thermal-board";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import type { TaskModel } from "../src/content/types";
const modes: ThermalMode[] = [
  "heating",
  "threshold",
  "profile",
  "identification",
  "comparison",
  "evidence",
];
function solved(mode: ThermalMode, id: string): ThermalBoard {
  const b = initialThermalBoard(mode, id);
  if (mode === "heating") {
    const r = energySamples[id as keyof typeof energySamples];
    Object.assign(b, {
      state: "warm",
      adequate: String(r.warm.filter((e) => e >= r.barrier).length),
      total: String(r.warm.length),
      average: "higher",
      frequency: "higher",
      barrier: "same",
    });
  }
  if (mode === "threshold") {
    const r = thresholdSamples[id as keyof typeof thresholdSamples];
    Object.assign(b, {
      pathway: "catalysed",
      adequate: String(r.energies.filter((e) => e >= r.catalysed).length),
      total: String(r.energies.length),
      average: "same",
      barrier: "lower",
    });
  }
  if (mode === "profile") {
    const r = thermalProfiles[id as keyof typeof thermalProfiles];
    Object.assign(b, {
      peak: String(r.reactant + r.catalysedEa),
      activation: String(r.catalysedEa),
      change: String(r.product - r.reactant),
      endpoints: "same",
    });
  }
  if (mode === "identification") {
    const r = additiveEvidence[id as keyof typeof additiveEvidence];
    Object.assign(b, {
      classification: r.answer,
      reason: !r.controlled
        ? "confounded"
        : r.answer === "reactant"
          ? "consumed"
          : !r.faster
            ? "noRateChange"
            : r.sameIdentity === null
              ? "massAlone"
              : "rateIdentityControls",
    });
  }
  if (mode === "comparison") {
    const r = thermalComparisons[id as keyof typeof thermalComparisons],
      a = r.amountA / r.timeA,
      c = r.amountB / r.timeB;
    Object.assign(b, {
      rateA: String(a),
      rateB: String(c),
      greater: a === c ? "equal" : a > c ? "A" : "B",
      final: "same",
    });
  }
  if (mode === "evidence") {
    const r = thermalClaims[id as keyof typeof thermalClaims];
    Object.assign(b, { claim: r.claim, reason: r.reason });
  }
  return b;
}
for (const mode of modes)
  test(`${mode}: six supplied comparisons require correct predictions and retain scientific errors as valid saved states`, () => {
    expect(Object.keys(thermalRecords[mode])).toHaveLength(6);
    for (const id of Object.keys(thermalRecords[mode])) {
      const model: TaskModel = {
        kind: "temperature-catalysts",
        mode,
        record: id,
        instruction: "Compare the supplied teaching case.",
      };
      const first = initialThermalBoard(mode, id),
        answer = solved(mode, id),
        history = [first];
      expect(initialBoard(model)).toEqual(first);
      expect(validThermalBoard(mode, answer)).toBe(true);
      expect(thermalBoardCheck(mode, first).correct).toBe(false);
      for (const [key, value] of Object.entries(answer))
        if (value !== history.at(-1)![key])
          history.push({ ...history.at(-1)!, [key]: value });
      expect(validHistory(model, history)).toBe(true);
      expect(checkBoard(model, answer).correct).toBe(true);
      const wrong =
        mode === "heating"
          ? { ...answer, barrier: "lower" }
          : mode === "threshold"
            ? { ...answer, average: "higher" }
            : mode === "profile"
              ? { ...answer, peak: String(Number(answer.peak) + 5) }
              : mode === "identification"
                ? {
                    ...answer,
                    classification:
                      answer.classification === "supports"
                        ? "reactant"
                        : "supports",
                  }
                : mode === "comparison"
                  ? { ...answer, final: "greater" }
                  : {
                      ...answer,
                      reason:
                        answer.reason === "pathway" ? "temperature" : "pathway",
                    };
      expect(validThermalBoard(mode, wrong)).toBe(true);
      expect(thermalBoardCheck(mode, wrong).correct).toBe(false);
    }
  });
test("strict decoder rejects missing, extra, coerced and unfinished fields while retaining ordinary wrong numbers", () => {
  for (const mode of modes) {
    const b = initialThermalBoard(mode);
    expect(validThermalBoard(mode, { ...b, extra: "x" })).toBe(false);
    expect(validThermalBoard(mode, { ...b, record: "unknown" })).toBe(false);
    for (const k of Object.keys(b)) {
      const partial = { ...b };
      delete partial[k];
      expect(validThermalBoard(mode, partial)).toBe(false);
      expect(validThermalBoard(mode, { ...b, [k]: 0 })).toBe(false);
    }
  }
  const p = initialThermalBoard("profile");
  for (const value of [
    "",
    "1/2",
    "NaN",
    "Infinity",
    "1e2",
    "00",
    "-1",
    "100001",
    "1.12345678901",
  ])
    expect(validThermalBoard("profile", { ...p, peak: value })).toBe(false);
  expect(
    validThermalBoard("profile", { ...p, peak: "99", change: "-45" }),
  ).toBe(true);
});
test("record changes atomically reset all fields; ordinary history steps change exactly one field", () => {
  for (const mode of modes) {
    const a = solved(mode, "initial"),
      record = Object.keys(thermalRecords[mode])[1],
      b = initialThermalBoard(mode, record);
    expect(thermalHistoryStep(mode, a, b)).toBe(true);
    expect(
      thermalHistoryStep(
        mode,
        a,
        Object.fromEntries(Object.entries(b).reverse()),
      ),
    ).toBe(true);
    expect(thermalHistoryStep(mode, a, a)).toBe(false);
    const key = Object.keys(b).find((k) => k !== "record")!;
    expect(thermalHistoryStep(mode, a, { ...b, [key]: a[key] })).toBe(
      a[key] === b[key],
    );
  }
});
test("same encounter counts survive warming and pathway changes; equality meets the minimum without guaranteeing reaction", () => {
  for (const r of Object.values(energySamples)) {
    expect(r.cool.length).toBe(r.warm.length);
    expect(r.warm.every((e, i) => e > r.cool[i])).toBe(true);
  }
  expect(solved("heating", "initial").adequate).toBe("7");
  expect(solved("threshold", "initial").adequate).toBe("6");
  expect(solved("threshold", "equality").adequate).toBe("5");
  expect(solved("threshold", "noneEither").adequate).toBe("0");
  expect(solved("threshold", "all").adequate).toBe("8");
  for (const r of Object.values(thresholdSamples))
    expect(r.catalysed).toBeLessThan(r.original);
});
test("catalysed profiles preserve endpoints and signed overall change for shifted, endothermic and zero-change cases", () => {
  for (const [id, r] of Object.entries(thermalProfiles)) {
    const b = solved("profile", id);
    expect(Number(b.peak)).toBeGreaterThan(Math.max(r.reactant, r.product));
    expect(Number(b.peak)).toBeLessThan(r.original);
    expect(Number(b.activation)).toBe(Number(b.peak) - r.reactant);
    expect(Number(b.change)).toBe(r.product - r.reactant);
  }
  expect(solved("profile", "initial").peak).toBe("65");
  expect(solved("profile", "offset").peak).toBe("165");
  expect(solved("profile", "equalEnds").change).toBe("0");
  expect(solved("profile", "endothermic").change).toBe("30");
});
test("72 authored tasks use the actual marker; objective drawing requires all levels and arrows, written responses remain self-review", () => {
  expect(temperatureAllTasks).toHaveLength(72);
  expect(new Set(temperatureAllTasks.map((q) => q.id)).size).toBe(72);
  expect(journey.practice).toHaveLength(32);
  expect(temperatureAllTasks.filter((q) => q.unit)).toHaveLength(25);
  expect(temperatureAllTasks.filter((q) => q.rubric)).toHaveLength(9);
  expect(temperatureAllTasks.filter((q) => q.profileDrawing)).toHaveLength(3);
  const references: Record<string, number> = {
    "w-barrier": 80 - 30,
    "g-heat": [8, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 60].filter(
      (x) => x >= 30,
    ).length,
    "g-catalyst": [4, 8, 10, 12, 14, 16, 18, 20, 22, 26, 30, 40].filter(
      (x) => x >= 18,
    ).length,
    "g-profile": 40 + 25,
    "g-rate": 24 / 30,
    "p-high-count": [10, 15, 25, 30, 40, 45, 50, 60, 65, 70, 80, 90].filter(
      (x) => x >= 60,
    ).length,
    "p-fraction": (5 / 20) * 100,
    "p-threshold-equality": [5, 10, 15, 20, 25, 30, 35, 40].filter(
      (x) => x >= 20,
    ).length,
    "p-peak-offset": 140 + 25,
    "p-ea-original": 100 - 20,
    "p-signed-change": 25 - 70,
    "p-rate-heat": 30 / 30,
    "p-rate-nondouble": 20 / 40,
    "p-rate-mass": 0.6 / 40,
    a2: 35 + 30,
    a4: 21 / 35,
    b2: 95 - 55,
    b4: [6, 12, 18, 24, 30, 36, 42, 48, 54, 60].filter((x) => x >= 36).length,
    ra1: 70 - 25,
    rb1: 28 / 40,
    "r-fraction": (3 / 12) * 100,
    "r-peak": 20 + 35,
    "r-ea": 100 - 45,
    "r-change": 20 - 50,
    "r-rate": 18 / 45,
  };
  for (const q of temperatureAllTasks) {
    if (q.unit)
      expect(
        Number(q.answer),
        q.id + " independently recalculated reference",
      ).toBeCloseTo(references[q.id.slice(6)], 10);
    const result = mark(q, q.answer);
    if (q.rubric) {
      expect(result.correct).toBe(false);
      expect(result.selfReview).toBe(true);
    } else {
      expect(result.correct, q.id).toBe(true);
      if (q.profileDrawing) {
        expect(q.reactionProfile).toBeUndefined();
        const a = JSON.parse(q.answer);
        expect(
          mark(q, JSON.stringify({ ...a, activationArrow: "zero-peak" }))
            .correct,
        ).toBe(false);
        expect(
          mark(q, JSON.stringify({ ...a, peak: String(Number(a.peak) + 5) }))
            .correct,
        ).toBe(false);
      } else if (q.options) {
        for (const option of q.options)
          if (option !== q.answer) {
            expect(q.misconceptions?.[option]).toBeTruthy();
            expect(mark(q, option).correct).toBe(false);
          }
      } else expect(mark(q, "99999").correct).toBe(false);
    }
  }
  for (const q of journey.practice)
    expect(
      journey.refresher.some((r) => r.id === q.followUp),
      q.id + " targeted recovery",
    ).toBe(true);
  for (const q of [...journey.checkForms.flat(), ...journey.reviewForms.flat()])
    expect(q.model).toBeUndefined();
});
test("six original bank IDs survive and prior thermal, catalytic, profile, identity and rate exposure links are direct", () => {
  const lesson = lessons.find((l) => l.slug === "temperature-and-catalysts")!;
  for (let i = 0; i < 6; i++)
    expect(
      [...lesson.questions, ...lesson.checks].some(
        (q) => q.id === "temperature-and-catalysts-" + i,
      ),
    ).toBe(true);
  const pairs = [
    ["a1", "temperature-and-catalysts-0"],
    ["a5", "temperature-and-catalysts-1"],
    ["rb3", "temperature-and-catalysts-2"],
    ["b3", "temperature-and-catalysts-3"],
    ["a1", "temperature-and-catalysts-4"],
    ["a3", "temperature-and-catalysts-5"],
    ["b5", "ct-v1-p-cooling"],
  ];
  for (const [id, prior] of pairs)
    expect(
      temperatureAllTasks.find((q) => q.id === "tc-v1-" + id)?.exposureAliases,
      `${id} direct prior ${prior}`,
    ).toContain(prior);
});
