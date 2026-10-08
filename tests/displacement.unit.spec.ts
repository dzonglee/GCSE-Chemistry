import { test, expect } from "@playwright/test";
import {
  displacementRecords,
  displacementCombineRecords,
  displacementCancelRecords,
  displacementChoices,
  initialDisplacementBoard,
  validDisplacementBoard,
  leastElectronMultipliers,
  combinedDisplacement,
  displacementPrediction,
  ionicLedger,
  ionicBalance,
  cancelIonic,
  scaleIonic,
} from "../src/lib/displacement-redox";
import { initialBoard, validHistory } from "../src/lib/workbench";
import type { DisplacementMode } from "../src/lib/displacement-redox";
import { displacementJourney as journey } from "../src/content/journeys/displacement";
import { lessons } from "../src/content/curriculum";
test("28 supplied records have canonical strict boards with no extra keys", () => {
  let count = 0;
  for (const mode of Object.keys(displacementRecords) as DisplacementMode[])
    for (const record of Object.keys(displacementRecords[mode])) {
      count++;
      const b = initialDisplacementBoard(mode, record);
      expect(validDisplacementBoard(mode, b)).toBe(true);
      expect(validDisplacementBoard(mode, { ...b, extra: "bad" })).toBe(false);
      expect(validDisplacementBoard(mode, { ...b, record: "invented" })).toBe(
        false,
      );
    }
  expect(count).toBe(28);
});
test("all five half combinations conserve every atom and signed charge after least whole scaling", () => {
  for (const [record, r] of Object.entries(displacementCombineRecords)) {
    const least = leastElectronMultipliers(r.lost, r.gained),
      v = combinedDisplacement(
        record as keyof typeof displacementCombineRecords,
        least.oxidation,
        least.reduction,
      );
    expect(v.balance.atoms && v.balance.charge && v.matched).toBe(true);
    expect([...v.left, ...v.right].some((t) => t.species === "electron")).toBe(
      false,
    );
    expect(
      displacementPrediction("combine", {
        record,
        oxidation: least.oxidation,
        reduction: least.reduction,
      }).correct,
    ).toBe(true);
    expect(
      displacementPrediction("combine", {
        record,
        oxidation: least.oxidation * 2,
        reduction: least.reduction * 2,
      }).correct,
    ).toBe(false);
  }
});
test("whole-half scaling changes all terms and unmatched transfer leaves electron bookkeeping", () => {
  expect(
    scaleIonic(
      [
        { species: "Ag1", coefficient: 1 },
        { species: "electron", coefficient: 1 },
      ],
      3,
    ),
  ).toEqual([
    { species: "Ag1", coefficient: 3 },
    { species: "electron", coefficient: 3 },
  ]);
  const v = combinedDisplacement("initial", 1, 1);
  expect(v.matched).toBe(false);
  expect(v.right.some((t) => t.species === "electron")).toBe(true);
});
test("full and net equations independently conserve atoms and charge without zero-charge requirement", () => {
  for (const [record, r] of Object.entries(displacementCancelRecords)) {
    const net = cancelIonic(r.left, r.right);
    expect(ionicBalance(r.left, r.right)).toMatchObject({
      atoms: true,
      charge: true,
    });
    expect(ionicBalance(net.left, net.right)).toMatchObject({
      atoms: true,
      charge: true,
    });
    expect(
      displacementPrediction("cancel", {
        record,
        selected: net.removed
          .map((t) => t.id)
          .sort()
          .join(","),
      }).correct,
    ).toBe(true);
  }
  const r = displacementCancelRecords.initial,
    net = cancelIonic(r.left, r.right);
  expect(ionicLedger(r.left).charge).toBe(0);
  expect(ionicLedger(net.left).charge).toBe(2);
});
test("cancellation uses charge and phase identities and only matching available quantities", () => {
  expect(
    cancelIonic(
      [{ species: "Cu", coefficient: 1 }],
      [{ species: "Cu2", coefficient: 1 }],
    ).removed,
  ).toEqual([]);
  expect(
    cancelIonic(
      [{ species: "water", state: "l", coefficient: 1 }],
      [{ species: "water", state: "g", coefficient: 1 }],
    ).removed,
  ).toEqual([]);
  const net = cancelIonic(
    [{ species: "NO3", coefficient: 3 }],
    [{ species: "NO3", coefficient: 2 }],
  );
  expect(net.left).toEqual([{ species: "NO3", coefficient: 1 }]);
  expect(net.right).toEqual([]);
});
test("atom repair accepts multiples while rejecting atoms-only balance", () => {
  expect(
    displacementPrediction("ledger", {
      record: "initial",
      a: 2,
      b: 4,
      c: 2,
      d: 4,
    }).correct,
  ).toBe(true);
  expect(
    displacementPrediction("ledger", {
      record: "initial",
      a: 1,
      b: 1,
      c: 1,
      d: 1,
    }).correct,
  ).toBe(false);
});
test("representation and feasibility records reject each incorrect prediction independently", () => {
  for (const mode of ["representation", "feasibility"] as const)
    for (const [record, r] of Object.entries(displacementRecords[mode])) {
      const b = initialDisplacementBoard(mode, record);
      for (const field of Object.keys(b))
        if (field !== "record")
          b[field] = (r as unknown as Record<string, string>)[field];
      expect(displacementPrediction(mode, b).correct).toBe(true);
      for (const [field, choices] of Object.entries(displacementChoices[mode]))
        if (field !== "record")
          for (const wrong of choices.filter((x) => x !== b[field]))
            expect(
              displacementPrediction(mode, { ...b, [field]: wrong }).correct,
            ).toBe(false);
    }
});
test("record changes reset all dependent fields; numeric controls permit only one step", () => {
  const model = {
      kind: "displacement-redox",
      mode: "combine",
      instruction: "Scale",
    } as const,
    b = initialBoard(model);
  expect(validHistory(model, [b, { ...b, oxidation: "2" }])).toBe(true);
  expect(validHistory(model, [b, { ...b, oxidation: "3" }])).toBe(false);
  expect(
    validHistory(model, [b, initialDisplacementBoard("combine", "aluminium")]),
  ).toBe(true);
  expect(
    validHistory(model, [b, { ...b, record: "aluminium", oxidation: "2" }]),
  ).toBe(false);
});
test("journey keeps legacy route IDs and uses distinct deferred forms with self-reviewed explanations", () => {
  const l = lessons.find((l) => l.slug === "half-equations")!;
  expect(l.journey).toBe(journey);
  expect([...l.questions, ...l.checks].map((q) => q.id).sort()).toEqual(
    Array.from({ length: 6 }, (_, i) => "half-equations-" + i),
  );
  expect(l.title).toBe("Displacement and ionic equations");
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  expect(all).toHaveLength(48);
  expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  for (const q of all) {
    expect(q.purpose).toBeTruthy();
    if (q.followUp)
      expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  expect(all.filter((q) => q.rubric).length).toBe(7);
});
