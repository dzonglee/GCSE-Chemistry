import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  checkBoard,
  initialBoard,
  validHistory,
  validBoard,
} from "../src/lib/workbench";
import {
  decode,
  emptyProgress,
  emptyWork,
  observedResults,
  lessonStatus,
} from "../src/lib/progress";
const lesson = lessons.find((l) => l.slug === "inside-an-atom")!;
const journey = lesson.journey!;
test("individually rebuilt journeys have unique identities and the atom sample reserves assessment forms", () => {
  expect(lessons.filter((l) => l.journey).map((l) => l.slug)).toEqual([
    "inside-an-atom",
    "atomic-models",
    "atomic-scale",
    "isotopes-and-ions",
    "relative-atomic-mass",
    "electron-shells",
    "periodic-patterns",
    "periodic-development",
    "group-reactions",
    "group-seven",
    "group-zero",
    "transition-metals",
    "states-of-matter",
    "ionic-bonding",
    "ionic-structures",
    "ionic-formulae",
    "covalent-bonding",
    "small-molecules-properties",
    "structure-and-properties",
    "carbon-structures",
    "graphite",
    "graphene",
    "fullerenes",
    "carbon-nanotubes",
    "polymer-structures",
    "particles-and-nanoparticles",
    "formulae-and-mass",
    "percentage-composition",
    "balancing-equations",
    "conservation-of-mass",
    "measurement-uncertainty",
    "conservation-and-concentration",
    "changing-concentration",
    "moles-and-reacting-masses",
    "reacting-masses",
    "balancing-from-masses",
    "limiting-reactants",
    "yield-and-atom-economy",
    "atom-economy",
    "theoretical-yield",
    "production-pathways",
    "molar-concentration",
    "gas-volumes-and-solutions",
    "empirical-formulae",
    "titration-calculations",
    "metal-reactivity",
    "oxidation-and-reduction",
    "metal-extraction",
    "acids-and-neutralisation",
    "making-soluble-salts",
    "electrolysis",
    "aqueous-electrolysis-products",
    "aqueous-electrolysis",
    "ph-scale-and-indicators",
    "ph-and-strong-acids",
    "titration-practical",
    "half-equations",
    "exothermic-and-endothermic",
    "reaction-profiles",
    "bond-energy",
    "energy-practical",
    "cells-and-fuel-cells",
    "fuel-cell-half-equations",
    "interpreting-cell-voltages",
    "measuring-rates",
    "rates-from-tangents",
    "collision-theory",
    "temperature-and-catalysts",
    "reversible-reactions",
    "changing-equilibrium",
    "rates-practical",
    "crude-oil-and-fractions",
    "alkanes-and-combustion",
    "cracking-and-alkenes",
    "alcohols-and-acids",
    "polymers",
    "organic-reactions",
    "natural-polymers",
    "purity-and-separation",
    "chromatography",
    "gas-tests",
    "ion-tests",
    "instrumental-analysis",
    "separation-practical",
    "early-atmosphere",
    "greenhouse-effect",
    "climate-evidence",
    "air-pollutants",
    "carbon-cycle",
    "potable-water",
    "wastewater-and-treatment",
    "extracting-metals",
    "life-cycle-and-recycling",
    "materials-and-corrosion",
    "haber-and-fertilisers",
  ]);
  expect(journey.warmup.length).toBeGreaterThan(0);
  expect(journey.refresher.length).toBeGreaterThan(0);
  expect(journey.guided[0].openingHint).toBe(true);
  expect(journey.guided.slice(1).every((q) => !q.openingHint)).toBe(true);
  expect(journey.guided.every((q) => q.model)).toBe(true);
  expect(journey.checkForms.map((f) => f.length)).toEqual([3, 3, 5]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([2, 2, 3]);
  const all = tasks(journey);
  const ids = [
    ...lessons.flatMap((l) => [...l.questions, ...l.checks]).map((q) => q.id),
    ...lessons
      .flatMap((l) => (l.journey ? tasks(l.journey) : []))
      .map((q) => q.id),
  ];
  expect(new Set(ids).size).toBe(ids.length);
  for (const q of all) {
    expect(q.purpose.length).toBeGreaterThan(15);
    const result = mark(q, q.answer);
    expect(q.rubric ? result.selfReview : result.correct, q.id).toBe(true);
    for (const error of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, error).correct, q.id).toBe(false);
    if (q.followUp)
      expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
    if (q.model)
      expect(validHistory(q.model, [initialBoard(q.model)]), q.id).toBe(true);
  }
  const teaching = new Set(
    [
      ...journey.warmup,
      ...journey.refresher,
      ...journey.guided,
      ...journey.practice,
    ].map((q) => q.prompt),
  );
  for (const q of [
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ]) {
    expect(teaching.has(q.prompt), q.id).toBe(false);
    expect(q.model, q.id).toBeUndefined();
  }
});
test("atom answers agree with nuclear counts, including inverse and multi-part questions", () => {
  const q = (id: string) => tasks(journey).find((q) => q.id === id)!;
  for (const [id, value] of [
    ["atom-v2-g-mass", 27 - 13],
    ["atom-v2-p-neon", 22 - 10],
    ["atom-v2-p-sulfur", 16 + 18],
    ["atom-v2-p-inverse", 19],
    ["atom-v2-cb-mass", 7 + 8],
    ["atom-v2-ra-inverse", 12 + 13],
  ] as const)
    expect(Number(q(id).answer), id).toBe(value);
  for (const question of tasks(journey).filter(
    (q) => q.parts && q.id.startsWith("atom-v2-"),
  )) {
    const notation = question.notation!;
    expect(question.parts!.map((p) => p.answer)).toEqual([
      notation.atomicNumber,
      notation.massNumber - notation.atomicNumber,
      notation.atomicNumber,
    ]);
    expect(
      mark(
        question,
        JSON.stringify({
          p: String(notation.atomicNumber),
          n: "0",
          e: String(notation.atomicNumber),
        }),
      ).correct,
    ).toBe(false);
    expect(
      mark(question, JSON.stringify({ p: String(notation.atomicNumber) }))
        .invalid,
    ).toBe(true);
    expect(mark(question, "null").invalid).toBe(true);
  }
  expect(mark(q("atom-v2-g-mass"), "27/1").feedback).toContain(
    "includes protons",
  );
  expect(mark(q("atom-v2-g-mass"), "14 neutrons").invalid).toBe(true);
  const written = q("atom-v2-p-explain");
  expect(mark(written, "protons neutrons electrons")).toMatchObject({
    correct: false,
    selfReview: true,
  });
});
test("particle sorting diagnoses the wrong region and atom operations separate identity, mass and charge", () => {
  const particles = { kind: "particles" as const };
  expect(
    checkBoard(particles, {
      proton: "shells",
      neutron: "nucleus",
      electron: "shells",
    }).feedback,
  ).toContain("Protons belong in the nucleus");
  expect(
    checkBoard(particles, {
      proton: "nucleus",
      neutron: "shells",
      electron: "shells",
    }).correct,
  ).toBe(false);
  expect(
    checkBoard(particles, {
      proton: "nucleus",
      neutron: "nucleus",
      electron: "nucleus",
    }).correct,
  ).toBe(false);
  expect(
    checkBoard(particles, {
      proton: "nucleus",
      neutron: "nucleus",
      electron: "shells",
    }).correct,
  ).toBe(true);
  const model = journey.guided[1].model!;
  expect(checkBoard(model, { p: 7, n: 6, e: 6 }).feedback).toContain(
    "changes the element",
  );
  expect(checkBoard(model, { p: 6, n: 8, e: 6 }).feedback).toContain(
    "Mass number",
  );
  expect(checkBoard(model, { p: 6, n: 6, e: 5 }).feedback).toContain(
    "target charge is 0",
  );
  expect(checkBoard(model, { p: 6, n: 6, e: 6 }).correct).toBe(true);
  expect(validBoard(model, { p: 6, n: 6, e: -1 })).toBe(false);
});
test("saved model history validates original start, one operation per step and bounds", () => {
  const model = journey.guided[1].model!,
    initial = initialBoard(model);
  const history = [initial, { ...initial, e: 1 }, { ...initial, e: 2 }];
  expect(validHistory(model, history)).toBe(true);
  expect(validHistory(model, [initial, { ...initial, e: 2, n: 7 }])).toBe(
    false,
  );
  expect(validHistory(model, [history[1]])).toBe(false);
  const p = emptyProgress();
  p.work[lesson.slug] = {
    ...emptyWork(),
    learning: { version: 1, stage: "guided", index: 1 },
    taskModels: { "atom-v2-g-neutral": history },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
  p.work[lesson.slug].taskModels!["atom-v2-g-neutral"] = [
    { p: 6, n: 6, e: -1 },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("both original records and new form results retain their question identities", () => {
  const p = emptyProgress(),
    form = journey.checkForms[1];
  p.work[lesson.slug] = {
    ...emptyWork(),
    history: [
      {
        kind: "check",
        ids: form.map((q) => q.id),
        index: 2,
        responses: Object.fromEntries(
          form.map((q) => [
            q.id,
            {
              answer: q.answer,
              correct: true,
              helped: false,
              fresh: true,
              at: 2,
            },
          ]),
        ),
        started: 1,
        submitted: 3,
      },
    ],
  };
  expect(lessonStatus(lesson.slug, p)).toBe("Check completed");
  expect(observedResults(lesson.slug, p)?.every((r) => r.correct)).toBe(true);
  expect(decode(JSON.stringify(p))).toEqual(p);
  p.work[lesson.slug].run = {
    kind: "check",
    ids: lesson.checks.map((q) => q.id),
    index: 0,
    responses: {},
    started: 4,
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
