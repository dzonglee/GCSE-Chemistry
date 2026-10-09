import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import baseline from "./fixtures/electrolysis-writing-baseline.json";
import { electrolysisJourney as j } from "../src/content/journeys/electrolysis";
import { electrolysisWriting as added } from "../src/content/journeys/electrolysis-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { exposureIds } from "../src/lib/progress";

test("all49 original electrolysis definitions, old positions and sealed forms remain identical", () => {
  const all = tasks(j);
  expect(j.version).toBe(1);
  expect(Object.keys(baseline.tasks)).toHaveLength(49);
  for (const [id, hash] of Object.entries(baseline.tasks))
    expect(
      createHash("sha256")
        .update(JSON.stringify(all.find((q) => q.id === id)))
        .digest("hex"),
      id,
    ).toBe(hash);
  for (const stage of ["warmup", "refresher", "guided", "practice"] as const)
    expect(
      j[stage].slice(0, baseline.stages[stage].length).map((q) => q.id),
    ).toEqual(baseline.stages[stage]);
  expect(j.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    baseline.checkForms,
  );
  expect(j.reviewForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    baseline.reviewForms,
  );
});
test("full mixture and anode explanations require the real causal links and stay manually reviewed", () => {
  const all = [
    ...added.practice,
    ...added.checkForms.flat(),
    ...added.reviewForms.flat(),
  ];
  expect(all).toHaveLength(14);
  for (const q of all) {
    expect(q.rubric!.length).toBeGreaterThanOrEqual(2);
    expect(mark(q, q.answer).correct).toBe(false);
    expect(
      mark(q, "1..2 — cryolite is a catalyst; graphite wears away").correct,
    ).toBe(false);
    expect(q.model).toBeUndefined();
    expect(q.openingHint).toBeUndefined();
  }
  for (const q of all.filter((q) => q.id.endsWith("-mixture"))) {
    expect(q.answer).toMatch(/lower.*melting point|lowers the melting point/);
    expect(q.answer).toMatch(/energy/);
    expect(q.answer).toMatch(/current/);
  }
  for (const q of all.filter((q) => q.id.endsWith("-anode"))) {
    expect(q.answer).toMatch(/carbon/);
    expect(q.answer).toMatch(/oxygen|Oxygen/);
    expect(q.answer).toMatch(/consum|using up/);
  }
});
test("four application equations use conserved atoms and neutral products rather than aqueous or ionic substitutions", () => {
  const reactions = [
    ...added.checkForms.flat(),
    ...added.reviewForms.flat(),
  ].filter((q) => q.id.endsWith("-reaction"));
  expect(reactions.map((q) => q.answer)).toEqual([
    "C + O2 → CO2",
    "2 Al2O3 → 4 Al + 3 O2",
    "MgCl2 → Mg + Cl2",
    "CaBr2 → Ca + Br2",
  ]);
  // Independently parse the supplied answer strings, including their coefficients.
  function atoms(side: string) {
    const totals: Record<string, number> = {};
    for (const term of side.split("+")) {
      const match = term.trim().match(/^(\d+)?\s*([A-Z][A-Za-z0-9]*)$/)!;
      expect(match).not.toBeNull();
      const coefficient = Number(match[1] ?? 1);
      for (const atom of match[2].matchAll(/([A-Z][a-z]?)(\d*)/g))
        totals[atom[1]] =
          (totals[atom[1]] ?? 0) + coefficient * Number(atom[2] || 1);
    }
    return totals;
  }
  for (const q of reactions) {
    const [left, right] = q.answer.split("→");
    expect(atoms(left), q.id).toEqual(atoms(right));
  }
  expect(atoms("Al2O3")).not.toEqual(atoms("Al + O2"));
  for (const q of reactions) {
    expect(q.rubric!.join(" ")).toMatch(/state symbols are not required/i);
    expect(q.prompt).not.toMatch(/half.equation/i);
    expect(q.answer).not.toContain("H2");
    expect(q.answer).not.toContain("e−");
  }
});
test("equivalent explanations retain global exposure including the old combined practice", () => {
  for (const family of ["mixture", "anode"]) {
    const same = [
      ...added.refresher,
      ...added.guided,
      ...added.practice,
      ...added.checkForms.flat(),
      ...added.reviewForms.flat(),
    ].filter((q) => q.id.endsWith("-" + family));
    for (const q of same) {
      const ids = exposureIds([q.id]);
      for (const other of same) expect(ids).toContain(other.id);
      expect(ids).toContain("el-v1-p-extraction-write");
    }
  }
  const old = exposureIds(["el-v1-p-extraction-write"]);
  expect(old).toContain("el-write-v1-cA-mixture");
  expect(old).toContain("el-write-v1-cA-anode");
  expect(
    new Set(
      [...added.checkForms.flat(), ...added.reviewForms.flat()].map(
        (q) => q.id,
      ),
    ).size,
  ).toBe(12);
});
