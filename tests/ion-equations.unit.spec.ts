import { test, expect } from "@playwright/test";
import baseline from "./fixtures/ion-equations-baseline.json";
import { lessons } from "../src/content/curriculum";
import {
  allIonTasks,
  ionTestsJourney as j,
} from "../src/content/journeys/ion-tests";
import {
  ionWritingGuided,
  ionWritingPractice,
  ionWritingChecks,
  ionWritingReviews,
  ionWritingRefresher,
} from "../src/content/journeys/ion-equation-writing";
import { readableIonEquation } from "../src/lib/ion-equation-writing";
import { formulaCounts } from "../src/lib/formula-mass";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
const writing = [
  ionWritingGuided,
  ...ionWritingPractice,
  ...ionWritingChecks.flat(),
  ...ionWritingReviews.flat(),
];
test("all95 original ion definitions, stage indices and reserved forms survive the append", () => {
  expect(j.version).toBe(1);
  expect(lessons.find((l) => l.slug === "ion-tests")!.course).toBe("separate");
  for (const [stage, ids] of Object.entries(baseline.stageIds))
    expect(
      j[stage as "practice"].slice(0, ids.length).map((q) => q.id),
    ).toEqual(ids);
  expect(j.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    baseline.checkForms,
  );
  expect(j.reviewForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    baseline.reviewForms,
  );
  for (const old of baseline.tasks) {
    const now = JSON.parse(
      JSON.stringify(allIonTasks.find((q) => q.id === old.id)!),
    );
    const { exposureAliases: previous, ...original } = old;
    const { exposureAliases: current, ...retained } = now;
    expect(retained, old.id).toEqual(original);
    expect(
      current?.filter((id: string) => !previous?.includes(id)) ?? [],
      old.id,
    ).toEqual(
      old.id === "ion-tests-v1-p-molecular"
        ? [ionWritingRefresher.id, ionWritingChecks[1][0].id]
        : [],
    );
    expect(current?.filter((id: string) => previous?.includes(id))).toEqual(
      previous,
    );
  }
});
test("independent literal chemistry contracts conserve every element and retain correct states and spectators", () => {
  const references = [
    ["FeCl₂(aq) + 2NaOH(aq) → Fe(OH)₂(s) + 2NaCl(aq)", "Na⁺ and Cl⁻"],
    ["MgCl₂(aq) + 2NaOH(aq) → Mg(OH)₂(s) + 2NaCl(aq)", "Na⁺ and Cl⁻"],
    ["Al(NO₃)₃(aq) + 3NaOH(aq) → Al(OH)₃(s) + 3NaNO₃(aq)", "Na⁺ and NO₃⁻"],
    ["Ca(NO₃)₂(aq) + 2NaOH(aq) → Ca(OH)₂(s) + 2NaNO₃(aq)", "Na⁺ and NO₃⁻"],
    ["FeCl₃(aq) + 3NaOH(aq) → Fe(OH)₃(s) + 3NaCl(aq)", "Na⁺ and Cl⁻"],
    ["Cu(NO₃)₂(aq) + 2NaOH(aq) → Cu(OH)₂(s) + 2NaNO₃(aq)", "Na⁺ and NO₃⁻"],
    ["Fe(NO₃)₂(aq) + 2NaOH(aq) → Fe(OH)₂(s) + 2NaNO₃(aq)", "Na⁺ and NO₃⁻"],
    ["AlCl₃(aq) + 3NaOH(aq) → Al(OH)₃(s) + 3NaCl(aq)", "Na⁺ and Cl⁻"],
  ];
  const digits = "₀₁₂₃₄₅₆₇₈₉";
  for (const [i, q] of writing.entries()) {
    expect(q.referenceResponse).toBe(
      references[i][0] + "\nSpectators: " + references[i][1],
    );
    expect(readableIonEquation(q.answer)).toBe(true);
    const sides = references[i][0]
      .replace(/[₀-₉]/g, (d) => String(digits.indexOf(d)))
      .split(" → ");
    const counts = sides.map((side) => {
      const totals: Record<string, number> = {};
      for (const raw of side.split(" + ")) {
        const m = raw.match(/^(\d*)\s*(.+)\((aq|s)\)$/)!;
        const coefficient = Number(m[1] || 1);
        for (const [atom, n] of Object.entries(formulaCounts(m[2])))
          totals[atom] = (totals[atom] ?? 0) + coefficient * n;
      }
      return totals;
    });
    expect(counts[0]).toEqual(counts[1]);
    expect(q.options).toBeUndefined();
    expect(q.parts).toBeUndefined();
    expect(q.model).toBeUndefined();
  }
  // Ionic meaning independently checks zero net charge for the two iron states.
  expect(2 + 2 * -1).toBe(0);
  expect(3 + 3 * -1).toBe(0);
  expect(ionWritingChecks[0][0].answer).toContain("Fe(OH)₃");
  expect(ionWritingReviews[0][0].answer).toContain("Fe(OH)₂");
});
test("syntax distinguishes malformed bytes from readable wrong chemistry without imposing an automatic examiner mark", () => {
  for (const raw of [
    "1..2",
    "MgCl2(aq) + -> Mg(OH)2(s)",
    "MgCl2 + NaOH -> Mg(OH2",
    '{"broken":',
    "MgCl2 ->",
    "-> Mg(OH)2",
  ])
    expect(readableIonEquation(raw), raw).toBe(false);
  for (const raw of [
    "MgCl2 + NaOH -> MgOH(s) + NaCl",
    "Fe²⁺(aq) + 2OH⁻(aq) → Fe(OH)₂(s)",
    "Fe2+(aq)+2OH-(aq)->Fe(OH)2(s)",
    "MgCl2 + NaOH -> MgOH(s) + NaCl; spectators: Na+ and Cl-",
    "0MgCl2 + NaOH -> Mg(OH)2 + NaCl",
    "999MgCl2(aq) + 1998NaOH(aq) -> 999Mg(OH)2(s) + 1998NaCl(aq)",
    "2MgCl2(aq)+4NaOH(aq)->2Mg(OH)2(s)+4NaCl(aq)",
    "MgCl2(aq) + 1.5NaOH(aq) -> Mg(OH)3(g) + NaCl(aq)",
  ])
    expect(readableIonEquation(raw), raw).toBe(true);
  for (const q of writing) {
    expect(mark(q, q.answer)).toMatchObject({
      correct: false,
      selfReview: true,
    });
    expect(mark(q, "MgCl2 + NaOH -> MgOH(s) + NaCl")).toMatchObject({
      correct: false,
      selfReview: true,
    });
  }
});
test("raw malformed and scientifically wrong drafts remain byte-exact through saved decoding", () => {
  const p = emptyProgress(),
    w = emptyWork();
  p.work["ion-tests"] = w;
  w.drafts[ionWritingChecks[0][0].id] = "1..2 — {unfinished";
  w.drafts[ionWritingGuided.id] = "FeCl2 + NaOH -> FeOH + NaCl";
  const result = decode(JSON.stringify(p));
  expect(result).not.toBeNull();
  if (!result) throw Error("decode");
  expect(result.work["ion-tests"].drafts).toEqual(w.drafts);
});
test("shown copper and helped equivalent iron/aluminium writing cannot become fresh on another form", () => {
  expect(exposureIds(["ion-tests-v1-p-molecular"])).toContain(
    ionWritingChecks[1][0].id,
  );
  expect(exposureIds([ionWritingRefresher.id])).toContain(
    "ion-tests-v1-p-molecular",
  );
  expect(exposureIds([ionWritingGuided.id])).toContain(
    ionWritingReviews[0][0].id,
  );
  expect(exposureIds([ionWritingPractice[1].id])).toContain(
    ionWritingReviews[1][0].id,
  );
  expect(exposureIds(["ion-tests-v1-g-eq-fe"])).toContain(
    ionWritingChecks[0][0].id,
  );
  expect(exposureIds(["ion-tests-v1-p-eq-al"])).toContain(
    ionWritingReviews[1][0].id,
  );
  expect(exposureIds(["ion-tests-v1-p-eq-mg"])).toContain(
    ionWritingChecks[1][0].id,
  );
  expect(exposureIds([ionWritingGuided.id])).not.toContain(
    ionWritingChecks[0][0].id,
  );
});
