import { test, expect } from "@playwright/test";
import {
  pathwaysJourney as j,
  pathwaysRecovery,
} from "../src/content/journeys/pathways-journey";
import {
  pathwayRecords,
  additionCases,
  originalCounts,
  productCounts,
  hydrationSites,
  type PathwayMode,
} from "../src/lib/pathways";
import {
  initialPathwayBoard,
  expectedPathwayBoard,
  validPathwayBoard,
  pathwayHistoryStep,
  validPathwayHistory,
  checkPathwayBoard,
  emptyPathwayDrawing,
  readPathwayDrawing,
  referencePathwayDrawing,
  pathwayDrawingAtoms,
  additionProposalCounts,
  type PathwayBoard,
} from "../src/lib/pathway-board";
import { pathwayGeometry } from "../src/lib/pathway-asset";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import { mark, displayResponse, reviewSubject } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
const all = [
  ...j.warmup,
  ...j.refresher,
  ...j.guided,
  ...j.practice,
  ...j.checkForms.flat(),
  ...j.reviewForms.flat(),
];
test("103 original demands preserve eighteen literal numbers, complete groups and precise recovery entry points", () => {
  expect(all).toHaveLength(103);
  expect(new Set(all.map((q) => q.id)).size).toBe(103);
  const references: Record<string, string> = {
    "g-mass": "46",
    "p-ethanol-Mr": "46",
    "p-br-Mr": "188",
    "p-cl-Mr": "99",
    "p-i-Mr": "282",
    "p-propane-Mr": "44",
    "p-pentanol-Mr": "88",
    "p-process-E": "6",
    "p-process-W": "2",
    "p-process-P": "2",
    "p-process-bound": "3",
    "p-process-zero": "0",
    "a-unused": "16",
    "a-mass": "202",
    "b-unused": "8",
    "b-mass": "74",
    "d1-flow": "5",
    "d2-mass": "113",
  };
  expect(all.filter((q) => q.unit)).toHaveLength(18);
  for (const [id, value] of Object.entries(references)) {
    const q = all.find((q) => q.id === "path-v1-" + id)!;
    expect(q.answer).toBe(value);
    expect(mark(q, value).correct).toBe(true);
  }
  const ids = j.practiceGroups!.flatMap((g) => g.taskIds);
  expect(new Set(ids).size).toBe(j.practice.length);
  expect(ids).toHaveLength(j.practice.length);
  for (const q of j.practice) {
    expect(ids).toContain(q.id);
    expect(pathwaysRecovery[q.id][0]).toBe(q.followUp);
    expect(j.refresher.some((t) => t.id === q.followUp)).toBe(true);
  }
});
test("54 supplied native cases retain exact schemas and use the main saved-model adapters", () => {
  let count = 0;
  for (const [mode, records] of Object.entries(pathwayRecords))
    for (const record of Object.keys(records)) {
      const model = {
          kind: "pathways" as const,
          mode: mode as PathwayMode,
          record,
        },
        z = initialPathwayBoard(model.mode, record),
        e = expectedPathwayBoard(model.mode, record);
      expect(initialBoard(model)).toEqual(z);
      expect(validPathwayBoard(model.mode, e)).toBe(true);
      expect(checkBoard(model, e).correct).toBe(true);
      expect(checkBoard(model, z).correct).toBe(false);
      expect(validPathwayBoard(model.mode, { ...e, extra: "" })).toBe(false);
      expect(
        validPathwayBoard(model.mode, { ...e, record: "constructor" }),
      ).toBe(false);
      for (const k of Object.keys(e))
        expect(validPathwayBoard(model.mode, { ...e, [k]: null })).toBe(false);
      count++;
    }
  expect(count).toBe(54);
});
test("one-field saved transitions, undo and explicit same-case resets preserve history without accepting skipped states", () => {
  for (const [mode, records] of Object.entries(pathwayRecords))
    for (const record of Object.keys(records)) {
      const m = mode as PathwayMode,
        z = initialPathwayBoard(m, record),
        e = expectedPathwayBoard(m, record),
        h: PathwayBoard[] = [z];
      for (const [k, v] of Object.entries(e)) {
        if (h.at(-1)![k] === v) continue;
        const next = { ...h.at(-1), [k]: v } as PathwayBoard;
        expect(pathwayHistoryStep(m, h.at(-1)!, next)).toBe(true);
        h.push(next);
      }
      expect(validPathwayHistory(m, h)).toBe(true);
      expect(validHistory({ kind: "pathways", mode: m, record }, h)).toBe(true);
      expect(validPathwayHistory(m, [...h, z])).toBe(true);
      expect(pathwayHistoryStep(m, z, z)).toBe(false);
      expect(validPathwayHistory(m, [z, e])).toBe(false);
      expect(validPathwayHistory(m, [])).toBe(false);
      expect(validPathwayHistory(m, null)).toBe(false);
    }
});
test("blank site and latent OH choices add no invented atoms; an actual wrong site is kept and rejected", () => {
  const r = additionCases.initial,
    z = {
      ...initialPathwayBoard("addition"),
      rightNew: "Br",
      ohH0: "1",
      ohH1: "1",
    };
  expect(additionProposalCounts(r, z)).toEqual(originalCounts(r));
  expect(
    pathwayGeometry(r, z).atoms.every((a) => a.origin === "original"),
  ).toBe(true);
  expect(validPathwayBoard("addition", { ...z, site: "1" })).toBe(false);
  const wrong = { ...expectedPathwayBoard("addition", "buteneH"), site: "1" },
    m = pathwayGeometry(additionCases.buteneH, wrong);
  expect(m.orders[0]).toBe(2);
  expect(m.atoms.some((a) => a.id === "added.C1.H")).toBe(true);
  expect(m.atoms.some((a) => a.id === "added.C2.H")).toBe(true);
  expect(m.atoms.some((a) => a.incomplete)).toBe(true);
  expect(checkPathwayBoard("addition", wrong).correct).toBe(false);
  const e = expectedPathwayBoard("addition");
  expect(
    checkPathwayBoard("addition", { ...e, ohH0: "1", ohH1: "1" }).correct,
  ).toBe(true);
  expect(additionProposalCounts(r, { ...e, ohH0: "1" })).toEqual(
    productCounts(r),
  );
});
test("23 references preserve complete inventories; hydration only permits the stated or equivalent landing sites", () => {
  for (const [id, r] of Object.entries(additionCases)) {
    const e = expectedPathwayBoard("addition", id),
      drawing = referencePathwayDrawing(id);
    expect(pathwayDrawingAtoms(drawing)).toEqual(productCounts(r));
    expect(additionProposalCounts(r, e)).toEqual(productCounts(r));
    expect(readPathwayDrawing(JSON.stringify(drawing))).toEqual(drawing);
    if (r.reagent === "water") {
      expect(
        checkPathwayBoard("addition", {
          ...e,
          leftNew: "OH",
          rightNew: "OH",
          ohH0: "1",
          ohH1: "1",
        }).correct,
      ).toBe(false);
      for (const site of hydrationSites(r)) {
        const left = site === r.double;
        expect(
          checkPathwayBoard("addition", {
            ...e,
            leftNew: left ? "OH" : "H",
            rightNew: left ? "H" : "OH",
            ohH0: left ? "1" : "0",
            ohH1: left ? "0" : "1",
          }).correct,
        ).toBe(true);
      }
    }
  }
});
test("46 genuine geometries conserve atoms and valid local bond angles without nonbonded sphere intersections", () => {
  const radius: Record<string, number> = {
    C: 0.23,
    H: 0.13,
    O: 0.22,
    Cl: 0.25,
    Br: 0.28,
    I: 0.31,
  };
  for (const [id, r] of Object.entries(additionCases))
    for (const product of [false, true]) {
      const m = pathwayGeometry(
          r,
          product
            ? expectedPathwayBoard("addition", id)
            : initialPathwayBoard("addition", id),
        ),
        counts = { C: 0, H: 0, O: 0, Cl: 0, Br: 0, I: 0 };
      for (const a of m.atoms) {
        counts[a.element]++;
        expect(a.incomplete).toBe(false);
        expect(Number.isFinite(a.point.length())).toBe(true);
      }
      expect(counts).toEqual(product ? productCounts(r) : originalCounts(r));
      const edges = new Set(m.bonds.map((e) => [e.a, e.b].sort().join("|")));
      for (let i = 0; i < m.atoms.length; i++)
        for (let k = i + 1; k < m.atoms.length; k++) {
          const a = m.atoms[i],
            b = m.atoms[k];
          if (!edges.has([a.id, b.id].sort().join("|")))
            expect(a.point.distanceTo(b.point)).toBeGreaterThan(
              radius[a.element] + radius[b.element],
            );
        }
      for (const c of m.atoms.filter((a) => a.element === "C")) {
        const neighbors = m.bonds
          .filter((e) => e.a === c.id || e.b === c.id)
          .map((e) =>
            m.atoms
              .find((a) => a.id === (e.a === c.id ? e.b : e.a))!
              .point.clone()
              .sub(c.point)
              .normalize(),
          );
        for (let i = 0; i < neighbors.length; i++)
          for (let k = i + 1; k < neighbors.length; k++)
            expect(neighbors[i].dot(neighbors[k])).toBeCloseTo(
              neighbors.length === 4 ? -1 / 3 : -0.5,
              8,
            );
      }
    }
});
test("reported reactor conversion and literal zero differ from maximum feed and unfinished input", () => {
  const partial = expectedPathwayBoard("process", "waterLimited");
  expect(partial).toMatchObject({
    etheneLeft: "7",
    waterLeft: "1",
    ethanol: "2",
    maximum: "3",
  });
  expect(
    checkPathwayBoard("process", { ...partial, ethanol: "3" }).correct,
  ).toBe(false);
  const zero = expectedPathwayBoard("process", "zero");
  expect(zero).toMatchObject({
    ethanol: "0",
    waterLeft: "6",
    etheneLeft: "4",
    liquid: "waterOnly",
    waterOrigin: "unreactedFeed",
    cooling: "physicalChange",
  });
  for (const raw of ["", " ", "0.", "0e0", "Infinity"])
    expect(
      checkPathwayBoard("process", { ...zero, ethanol: raw }).correct,
    ).toBe(false);
});
test("independent drawings start from no carbons, retain malformed bytes and never award an examiner mark", () => {
  expect(emptyPathwayDrawing().n).toBe("");
  expect(pathwayDrawingAtoms(emptyPathwayDrawing()).C).toBe(0);
  const drawings = all.filter((q) => q.pathwayDrawing);
  expect(drawings).toHaveLength(24);
  for (const q of drawings) {
    const raw = JSON.stringify(
      referencePathwayDrawing(q.pathwayDrawing!.caseId),
    );
    expect(mark(q, raw)).toMatchObject({
      correct: false,
      selfReview: true,
      empty: false,
    });
    expect(reviewSubject(q)).toBe("structure");
    expect(displayResponse(q, raw)).not.toContain("{");
  }
  const q = drawings[0],
    broken = '{"n":"2",bad';
  expect(mark(q, broken)).toMatchObject({
    correct: false,
    invalid: true,
    empty: false,
  });
  expect(mark(q, broken).selfReview).not.toBe(true);
  expect(broken).toBe('{"n":"2",bad');
  expect(
    readPathwayDrawing(JSON.stringify({ ...emptyPathwayDrawing(), h0: "0e0" })),
  ).toBeNull();
});
test("both-tier route scope, genuinely separate cold/delayed sets and direct exposure survive integration", () => {
  const l = lessons.find((l) => l.slug === "organic-reactions")!;
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("separate");
  expect(l.journey).toBe(j);
  expect(j.checkForms.map((f) => f.length)).toEqual([7, 7]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  for (const f of j.checkForms) {
    expect(f.filter((q) => q.rubric)).toHaveLength(2);
    expect(
      f.every((q) => !q.model && !/Higher/i.test(q.title + q.prompt)),
    ).toBe(true);
  }
  const previous = j.practice.find((q) => q.id === "path-v1-p-propene-br")!,
    cold = j.checkForms[0][0];
  expect(previous.exposureAliases).toContain(cold.id);
  expect(cold.exposureAliases).toContain(previous.id);
  expect(cold.exposureAliases).not.toContain("path-v1-p-pentanol-Mr");
  expect(
    j.practice.find((q) => q.id === "path-v1-p-higher-condensation")!.prompt,
  ).toContain("Higher Chemistry");
});

test("earlier drawn products and route/test questions retain direct exposure without unrelated mass propagation", () => {
  const ethanol = lessons
    .find((l) => l.slug === "alcohols-and-acids")!
    .journey!.practice.find((q) => q.id === "alc-v1-p-ethanol")!;
  const next = j.practice.find((q) => q.id === "path-v1-p-ethene-water")!;
  expect(ethanol.exposureAliases).toContain(next.id);
  expect(next.exposureAliases).toContain(ethanol.id);
  expect(next.exposureAliases).not.toContain("path-v1-a-mass");
  const prior = lessons
    .flatMap((l) =>
      l.journey
        ? [
            ...l.journey.refresher,
            ...l.journey.guided,
            ...l.journey.practice,
            ...l.journey.checkForms.flat(),
          ]
        : [],
    )
    .find((q) => q.id === "crk-v1-r-bromine")!;
  expect(prior.exposureAliases).toContain("path-v1-d1-test");
  expect(j.reviewForms[0][0].exposureAliases).toContain(prior.id);
});
