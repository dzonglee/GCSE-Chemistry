import { test, expect } from "@playwright/test";
import {
  concentrationChange,
  dilutedSolution,
  retainedPortion,
  changeChoices,
  initialChangeBoard,
  validChangeBoard,
  changePrediction,
  type ChangeMode,
} from "../src/lib/changing-concentration";
import { changingConcentrationJourney as journey } from "../src/content/journeys/changing-concentration";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
test("two independent factors divide; equal scaling and opposite changes differ", () => {
  expect(concentrationChange(2, 0.5)).toBe(4);
  expect(concentrationChange(0.5, 2)).toBe(0.25);
  expect(concentrationChange(3, 3)).toBe(1);
  expect(concentrationChange(2, 4)).toBe(0.5);
  expect(concentrationChange(1.5, 3)).toBe(0.5);
  expect(() => concentrationChange(1, 0)).toThrow();
  expect(() => concentrationChange(Infinity, 2)).toThrow();
});
test("dilution retains solute whereas homogeneous sampling closes both inventories", () => {
  expect(dilutedSolution(10, 500)).toEqual({
    mass: 10,
    cm3: 500,
    concentration: 20,
  });
  expect(dilutedSolution(10, 1000).mass).toBe(10);
  expect(retainedPortion(10, 500, 250)).toEqual({
    mass: 5,
    removedMass: 5,
    cm3: 250,
    removedCm3: 250,
    concentration: 20,
  });
  for (const cm3 of [50, 100, 150, 300, 600]) {
    const d = retainedPortion(12, 600, cm3);
    expect(d.mass + d.removedMass).toBe(12);
    expect(d.cm3 + d.removedCm3).toBe(600);
    expect((d.mass * 1000) / d.cm3).toBe(20);
  }
  expect(() => retainedPortion(10, 500, 600)).toThrow();
  expect(() => retainedPortion(10, 500, 0)).toThrow();
});
test("all native combinations have strict valid correct predictions and retain wrong causal selections", () => {
  for (const mode of [
    "factors",
    "dilution",
    "portion",
    "target",
  ] as ChangeMode[]) {
    const b = initialChangeBoard(mode);
    expect(validChangeBoard(mode, b)).toBe(true);
    expect(changePrediction(mode, b).correct).toBe(false);
    expect(validChangeBoard(mode, { ...b, extra: 1 })).toBe(false);
  }
  for (const massFactor of changeChoices.factors.massFactor)
    for (const volumeFactor of changeChoices.factors.volumeFactor) {
      const b = {
        massFactor,
        volumeFactor,
        factor: String(massFactor / volumeFactor),
        reason: "mass-over-volume",
      };
      expect(validChangeBoard("factors", b)).toBe(true);
      expect(changePrediction("factors", b).correct).toBe(true);
      expect(
        changePrediction("factors", { ...b, reason: "multiply" }).correct,
      ).toBe(false);
    }
  for (const finalCm3 of changeChoices.dilution.finalCm3) {
    const b = {
      finalCm3,
      mass: "10",
      concentration: String(10000 / finalCm3),
      reason: "retained-more-volume",
    };
    expect(validChangeBoard("dilution", b)).toBe(true);
    expect(changePrediction("dilution", b).correct).toBe(true);
    expect(changePrediction("dilution", { ...b, mass: "5" }).correct).toBe(
      false,
    );
  }
  for (const retainedCm3 of changeChoices.portion.retainedCm3) {
    const b = {
      retainedCm3,
      mass: String(retainedCm3 / 50),
      concentration: "20",
      reason: "both-proportional",
    };
    expect(validChangeBoard("portion", b)).toBe(true);
    expect(changePrediction("portion", b).correct).toBe(true);
    expect(
      changePrediction("portion", { ...b, reason: "all-solute-retained" })
        .correct,
    ).toBe(false);
  }
  for (const target of changeChoices.target.target) {
    const final = 10000 / target,
      b = {
        target,
        finalCm3: String(final),
        addedCm3: String(final - 250),
        reason: "final-minus-initial",
      };
    expect(validChangeBoard("target", b)).toBe(true);
    expect(changePrediction("target", b).correct).toBe(true);
    expect(
      changePrediction("target", { ...b, addedCm3: String(final) }).correct,
    ).toBe(false);
  }
  expect(
    validChangeBoard("factors", {
      ...initialChangeBoard("factors"),
      massFactor: "2",
    }),
  ).toBe(false);
});
test("46 individual authored references mark accurately, written explanations remain self-reviewed", () => {
  expect(tasks(journey).filter((q) => q.id.startsWith("cc-v1-"))).toHaveLength(
    46,
  );
  expect(
    new Set(
      tasks(journey)
        .filter((q) => q.id.startsWith("cc-v1-"))
        .map((q) => q.id),
    ).size,
  ).toBe(46);
  for (const q of tasks(journey)) {
    const r = mark(q, q.answer);
    expect(r.correct).toBe(!q.rubric);
    if (q.rubric) expect(r.selfReview).toBe(true);
  }
  expect(journey.checkForms.slice(0, 2).map((x) => x.length)).toEqual([5, 5]);
  expect(journey.reviewForms.slice(0, 2).map((x) => x.length)).toEqual([3, 3]);
  expect(
    journey.practice.find((q) => q.parts)?.parts?.map((p) => p.answer),
  ).toEqual([3, 9, 20]);
});
test("Higher route saves strict model histories and repeated explanations never become fresh evidence", () => {
  const l = lessons.find((l) => l.slug === "changing-concentration")!;
  expect(l.tier).toBe("higher");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("conservation-and-concentration");
  expect(l.questions).toHaveLength(0);
  expect(l.checks).toHaveLength(0);
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of journey.guided.filter((q) => q.model)) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [])).toBe(false);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    w.taskModels[q.id] = [b];
  }
  p.work[l.slug] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels["cc-v1-g-factors"] = [
    { ...initialChangeBoard("factors"), massFactor: "2" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
  expect(exposureIds(["cc-v1-cb-equal"])).toContain("cc-v1-p-equal");
  expect(exposureIds(["cc-v1-ca-factor"])).toEqual(["cc-v1-ca-factor"]);
  for (const q of tasks(journey)) {
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
    if (q.followUp)
      expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  const inventory = journey.practice.find((q) => q.id === "cc-v1-p-inventory")!;
  expect(
    mark(
      inventory,
      JSON.stringify({ retained: "12", removed: "0", concentration: "80" }),
    ).correct,
  ).toBe(false);
});
