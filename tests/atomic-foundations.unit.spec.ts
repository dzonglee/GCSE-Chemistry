import { test, expect } from "@playwright/test";
import { lessons, questionById } from "../src/content/curriculum";
import { atomicFoundations as a } from "../src/content/journeys/atomic-foundations";
import { elements } from "../src/content/elements";
import { mark } from "../src/lib/marking";

const journey = lessons.find((l) => l.slug === "inside-an-atom")!.journey!;
const added = Object.values(a).flat();
test("the foundation extension preserves the original journey positions and sealed forms", () => {
  expect(added).toHaveLength(22);
  expect(new Set(added.map((q) => q.id)).size).toBe(22);
  expect(journey.guided.slice(0, 3).map((q) => q.title)).toEqual([
    "Where is an atom’s mass?",
    "Build a neutral atom",
    "Find the neutron number",
  ]);
  expect(journey.checkForms.map((f) => f.map((q) => q.id))).toEqual([
    ["atom-v2-ca-neutrons", "atom-v2-ca-electrons", "atom-v2-ca-mass"],
    ["atom-v2-cb-neutrons", "atom-v2-cb-mass", "atom-v2-cb-neutral"],
    ["ca-unit", "ca-table", "ca-count", "ca-mixture", "ca-state"].map(
      (id) => "atom-found-v1-" + id,
    ),
  ]);
  expect(journey.reviewForms.map((f) => f.map((q) => q.id))).toEqual([
    ["atom-v2-ra-inverse", "atom-v2-ra-location"],
    ["atom-v2-rb-number", "atom-v2-rb-neutrons"],
    ["ra-element", "ra-table", "ra-count"].map((id) => "atom-found-v1-" + id),
  ]);
});

test("independently identified chemical references distinguish atom counts, atom types and literal symbols", () => {
  const refs: Record<string, string | Record<string, string>> = {
    "w-unit": "An atom",
    "w-element": "It contains only one type of atom",
    "r-symbol": "Na",
    "r-state": "H₂O molecules",
    "r-element": "Neither: each contains one element",
    "r-count": "2",
    "g-symbol": "Na",
    "g-ratio": "2:1",
    "g-decompose": "A chemical reaction that decomposes water",
    "p-element": "One element",
    "p-symbol": "Si",
    "p-count": { nitrogen: "1", oxygen: "2", types: "2" },
    "p-reaction": "Atoms are chemically rearranged to form a new substance",
    "ca-unit": "One oxygen atom",
    "ca-table": "Li",
    "ca-count": { nitrogen: "1", hydrogen: "3", types: "2" },
    "ca-mixture": "A mixture of two compounds",
    "ra-element": "An element",
    "ra-table": "Mg",
    "ra-count": "6",
  };
  expect(Object.keys(refs)).toHaveLength(20);
  for (const [id, raw] of Object.entries(refs))
    expect(
      mark(
        questionById("atom-found-v1-" + id)!,
        typeof raw === "string" ? raw : JSON.stringify(raw),
      ).correct,
      id,
    ).toBe(true);
  expect(mark(a.refresher[0], "NA").correct).toBe(false);
  expect(mark(a.practice[1], "SI").correct).toBe(false);
  expect(
    mark(
      a.check[2],
      JSON.stringify({ nitrogen: "1", hydrogen: "2", types: "2" }),
    ).correct,
  ).toBe(false);
  expect(
    mark(
      a.check[2],
      JSON.stringify({ nitrogen: "1..2", hydrogen: "3", types: "2" }),
    ).invalid,
  ).toBe(true);
  expect(a.guided[0].model).toMatchObject({
    kind: "atom-build",
    initial: [10, 10, 10],
    target: [11, 12, 11],
  });
});

test("the supplied reference agrees with the first twenty AQA element identities and proton numbers", () => {
  const symbols = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca".split(
    " ",
  );
  const names =
    "Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminium Silicon Phosphorus Sulfur Chlorine Argon Potassium Calcium".split(
      " ",
    );
  expect(elements.map((e) => [e.protons, e.symbol, e.name])).toEqual(
    symbols.map((s, i) => [i + 1, s, names[i]]),
  );
  expect(added.filter((q) => q.elementReference).map((q) => q.id)).toEqual(
    ["r-symbol", "g-symbol", "p-symbol", "ca-table", "ra-table"].map(
      (id) => "atom-found-v1-" + id,
    ),
  );
});

test("written explanations remain manual and direct exposure/recovery references resolve without self cycles", () => {
  for (const q of added.filter((q) => q.rubric)) {
    expect(
      mark(q, "Boiling splits the atoms into new elements."),
    ).toMatchObject({ correct: false, selfReview: true });
    expect(mark(q, q.answer)).toMatchObject({
      correct: false,
      selfReview: true,
    });
  }
  for (const q of added) {
    for (const id of q.exposureAliases ?? []) {
      expect(id).not.toBe(q.id);
      expect(questionById(id)?.exposureAliases).toContain(q.id);
    }
    if (q.followUp) {
      expect(q.followUp).not.toBe(q.id);
      expect(questionById(q.followUp)).toBeDefined();
    }
  }
  expect(a.check[1].exposureAliases).toBeUndefined();
  expect(a.review[1].exposureAliases).toBeUndefined();
});
