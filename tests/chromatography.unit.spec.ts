import { test, expect } from "@playwright/test";
import {
  chromatographyJourney as j,
  chromatographyRecoveryRoutes,
} from "../src/content/journeys/chromatography-journey";
import {
  chromatographyCases,
  type ChromatographyMode,
} from "../src/lib/chromatography-cases";
import {
  initialChroma,
  expectedChroma,
  updateChroma,
  validChromaHistory,
  checkChroma,
  readChromaNumber,
} from "../src/lib/chromatography-domain";
import {
  initialChromaDrawing,
  referenceChromaDrawing,
  updateChromaDrawing,
  readChromaDrawing,
  chromaDrawingSources,
  type ChromaDrawingData,
} from "../src/lib/chromatography-drawing";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import { mark, displayResponse, reviewSubject } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import {
  exposureIds,
  dueReview,
  emptyWork,
  REVIEW_DELAY,
  type Run,
} from "../src/lib/progress";
import {
  buildChromatographyApparatus,
  disposeChromatographyApparatus,
} from "../src/lib/chromatography-asset";
import * as T from "three";
const all = [
  ...j.warmup,
  ...j.refresher,
  ...j.guided,
  ...j.practice,
  ...j.checkForms.flat(),
  ...j.reviewForms.flat(),
];
test("one chromatography journey has full targeted routes and distinct sealed forms", () => {
  expect(all).toHaveLength(104);
  expect(new Set(all.map((q) => q.id)).size).toBe(104);
  expect(j.practiceGroups.flatMap((g) => g.taskIds).sort()).toEqual(
    j.practice.map((q) => q.id).sort(),
  );
  for (const q of j.practice) {
    expect(chromatographyRecoveryRoutes[q.id][0]).toBe(q.followUp);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  for (const f of [...j.checkForms, ...j.reviewForms])
    for (const q of f) expect(q.model).toBeUndefined();
  expect(j.checkForms.map((f) => f.filter((q) => !q.rubric).length)).toEqual([
    8, 8,
  ]);
  expect(j.reviewForms.map((f) => f.filter((q) => !q.rubric).length)).toEqual([
    2, 2,
  ]);
  expect(lessons.find((l) => l.slug === "chromatography")!.journey).toBe(j);
});
test("43 original cases persist through the actual workbench adapters", () => {
  let count = 0;
  for (const mode of Object.keys(chromatographyCases) as ChromatographyMode[])
    for (const s of chromatographyCases[mode]) {
      const model = {
          kind: "chromatography-investigation" as const,
          mode,
          record: s.id,
        },
        z = initialChroma(mode, s.id),
        h = [z];
      expect(initialBoard(model)).toEqual(z);
      for (const [k, v] of Object.entries(expectedChroma(mode, s.id)))
        h.push(updateChroma(mode, h.at(-1)!, k, v));
      expect(validHistory(model, h)).toBe(true);
      expect(checkBoard(model, h.at(-1)!).correct).toBe(true);
      expect(validHistory(model, [...h, z])).toBe(true);
      expect(validHistory(model, [z, { ...z, extra: "" }])).toBe(false);
      count++;
    }
  expect(count).toBe(43);
});
test("setup accepts a range and checks only the requested field", () => {
  const z = initialChroma("setup", "immersed");
  for (const value of ["2", "2.1", "17.999"])
    expect(
      checkChroma("setup", { ...z, solventLevel: value }, "solventLevel")
        .correct,
    ).toBe(true);
  for (const value of ["1.999", "18", "24", "999", "0."])
    expect(
      checkChroma("setup", { ...z, solventLevel: value }, "solventLevel")
        .correct,
    ).toBe(false);
  expect(
    checkChroma("setup", { ...z, solventLevel: "12" }, "all").correct,
  ).toBe(false);
});
test("scientific raw parser retains incomplete and disallowed formats instead of manufacturing values", () => {
  for (const value of ["0.", "1e2", "1/2", " 2", "Infinity", "NaN"])
    expect(readChromaNumber(value)).toBeNull();
  expect(readChromaNumber(".4")).toBe(0.4);
  expect(readChromaNumber("−50", true)).toBe(-50);
  expect(readChromaNumber("−50")).toBeNull();
});
test("origin and centre remain independent from ruler and answer proposals", () => {
  const z = initialChroma("measurement", "shifted-origin"),
    b = updateChroma(
      "measurement",
      updateChroma("measurement", z, "rulerZero", "10"),
      "spotDistance",
      "58",
    );
  expect(
    validChromaHistory(
      "measurement",
      "shifted-origin",
      [z, { ...z, rulerZero: "10" }, b],
      "spotDistance",
    ),
  ).toBe(true);
  expect(checkChroma("measurement", b, "spotDistance").correct).toBe(false);
  expect(
    checkChroma("measurement", { ...b, spotDistance: "48" }, "spotDistance")
      .correct,
  ).toBe(true);
  const s = chromatographyCases.measurement.find(
    (s) => s.id === "shifted-origin",
  )!;
  expect([s.origin, s.spot, s.front]).toEqual([10, 58, 90]);
});
test("each drawing is blank-start and never receives automatic examiner correctness", () => {
  for (const [record, s] of Object.entries(chromaDrawingSources)) {
    const data: ChromaDrawingData = { record, mode: s.mode },
      q = all.find((q) => q.chromatographyDrawing?.record === record)!;
    expect(mark(q, JSON.stringify(initialChromaDrawing(data))).empty).toBe(
      true,
    );
    const answer = JSON.stringify(referenceChromaDrawing(data)),
      result = mark(q, answer);
    expect(result.correct).toBe(false);
    expect(result.selfReview).toBe(true);
    expect(reviewSubject(q)).toBe("chromatography proposal");
    expect(displayResponse(q, answer)).not.toContain('"placed"');
    expect(mark(q, "{bad").invalid).toBe(true);
  }
});
test("unfinished drawing retains its prior wrong placement; clearing removes it", () => {
  const data: ChromaDrawingData = {
      mode: "chromatogram",
      record: "plotPractice",
    },
    z = initialChromaDrawing(data),
    wrong = updateChromaDrawing(data, z, "a1", "−50"),
    unfinished = updateChromaDrawing(data, wrong, "a1", "7.");
  expect(unfinished.raw.a1).toBe("7.");
  expect(unfinished.placed.a1).toBe(-50);
  expect(readChromaDrawing(JSON.stringify(unfinished), data)).toEqual(
    unfinished,
  );
  expect(updateChromaDrawing(data, unfinished, "a1", "").placed.a1).toBeNull();
  expect(wrong.raw.origin).toBe("");
});
test("reference diagrams use independent original origin-offset positions", () => {
  for (const [record, positions] of [
    ["plotPractice", [10, 90, 30, 70, 50]],
    ["plotCheckA", [15, 115, 35, 85, 70]],
    ["plotReviewA", [20, 100, 44, 84, 56]],
  ] as [string, number[]][]) {
    const b = referenceChromaDrawing({ mode: "chromatogram", record });
    expect(
      ["origin", "front", "a1", "a2", "b1"].map((k) => Number(b.raw[k])),
    ).toEqual(positions);
  }
});
test("legacy conclusions link directly but distinct numerical givens remain distinct", () => {
  for (const [legacy, newId] of [
    [0, "p-pencil"],
    [1, "p-immersed"],
    [3, "p-count"],
    [5, "cB-conditions"],
  ] as [number, string][]) {
    expect(exposureIds(["chromatography-" + legacy])).toContain(
      "chromatography-v1-" + newId,
    );
    expect(exposureIds(["chromatography-v1-" + newId])).toContain(
      "chromatography-" + legacy,
    );
  }
  expect(exposureIds(["chromatography-2"])).not.toContain(
    "chromatography-v1-p-direct",
  );
  expect(exposureIds(["chromatography-4"])).not.toContain(
    "chromatography-v1-p-direct",
  );
});
test("practical interpretation explanations are separate from original figure givens", () => {
  for (const s of chromatographyCases.interpretation) {
    expect(s.givenNote).toBeTruthy();
    expect(s.givenNote).not.toBe(s.note);
  }
  expect(
    chromatographyCases.interpretation.find((s) => s.id === "known-mixture")!
      .givenNote,
  ).not.toContain("matches P");
});
test("actual macro geometry preserves source heights and out-of-scale proposals without fake liquid", () => {
  const s = chromatographyCases.setup.find((s) => s.id === "immersed")!;
  for (const raw of ["24", "0.", "−50", "999"]) {
    const root = buildChromatographyApparatus(s, {
        ...initialChroma("setup", s.id),
        solventLevel: raw,
      }),
      paper = new T.Box3().setFromObject(
        root.getObjectByName("Fixed_chromatography_paper")!,
      ),
      sample = new T.Box3().setFromObject(
        root.getObjectByName("Fixed_starting_sample")!,
      );
    expect(paper.min.y).toBeCloseTo(0.002, 7);
    expect(paper.max.y).toBeCloseTo(0.11, 7);
    expect(sample.getCenter(new T.Vector3()).y).toBeCloseTo(0.018, 7);
    expect(root.userData.proposal.rawLevel).toBe(raw);
    expect(root.userData.proposal.lineMaterial).toBeNull();
    if (raw === "24")
      expect(
        new T.Box3().setFromObject(
          root.getObjectByName("Student_proposed_reservoir")!,
        ).max.y,
      ).toBeCloseTo(0.024, 7);
    else
      expect(
        root.getObjectByName("Student_proposed_reservoir"),
      ).toBeUndefined();
    root.traverse((node) => {
      if (node instanceof T.Mesh)
        for (const v of node.geometry.getAttribute("position").array)
          expect(Number.isFinite(v)).toBe(true);
    });
    disposeChromatographyApparatus(root);
  }
});
test("seven-day review is based on the latest actual submission", () => {
  const now = 1800000000000,
    old: Run = {
      kind: "check",
      ids: ["a"],
      index: 0,
      responses: {},
      started: now - 2 * REVIEW_DELAY,
      submitted: now - 2 * REVIEW_DELAY,
    },
    recent: Run = {
      ...old,
      kind: "review",
      started: now - 1000,
      submitted: now,
    },
    w = { ...emptyWork(), history: [old, recent], run: recent };
  expect(dueReview(w, now + REVIEW_DELAY - 1)).toBe(false);
  expect(dueReview(w, now + REVIEW_DELAY)).toBe(true);
});
