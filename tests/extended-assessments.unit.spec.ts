import { test, expect } from "@playwright/test";
import {
  paper1Foundation,
  paper2Foundation,
} from "../src/content/extended-assessments";
import { chromaGivenSources } from "../src/lib/chromatography-givens";
import { chromaDrawingSources } from "../src/lib/chromatography-drawing";
import { questionById } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";

test("the individually curated Foundation Paper1 set keeps scope, original identities and a balanced five-strand sample", () => {
  expect(paper1Foundation.questions).toHaveLength(30);
  expect(paper1Foundation.course).toBe("separate");
  expect(paper1Foundation.tier).toBe("foundation");
  expect(new Set(paper1Foundation.questions.map((q) => q.id)).size).toBe(30);
  expect(paper1Foundation.questions.filter((q) => q.rubric)).toHaveLength(9);
  expect(paper1Foundation.questions.filter((q) => q.tier === "higher")).toEqual(
    [],
  );
  expect(
    Object.fromEntries(
      [...new Set(paper1Foundation.topics)].map((t) => [
        t,
        paper1Foundation.topics.filter((topic) => topic === t).length,
      ]),
    ),
  ).toEqual({
    "atomic-structure": 6,
    bonding: 6,
    quantitative: 6,
    "chemical-changes": 6,
    energy: 6,
  });
  for (const q of paper1Foundation.questions)
    expect(q).toBe(questionById(q.id));
});

test("selected numeric and construction references agree with independently calculated literal values", () => {
  const references: Record<string, string | Record<string, string>> = {
    "atom-v2-ca-neutrons": { p: "5", n: "6", e: "5" },
    "as-v1-ca-ratio": "50000",
    "ram-v1-ca-three": "16.35",
    "ib-v1-ca-draw": { dots: "7", crosses: "1", charge: "-1", brackets: "1" },
    "cb-v1-ca-hcl": {
      unsharedCentre: "6",
      centre0: "1",
      partner0: "1",
      unsharedPartner0: "0",
    },
    "fm-v1-ca-barium": "261",
    "be-v1-ca-neutralisation": { c0: "1", c1: "2", c2: "1", c3: "2" },
    "mc-v1-ca-reading": "45.2",
    "mu-v1-ca-half": "0.4",
    "sc-v1-ca-mg": "4",
    "tech-v1-a-titre": "25.25",
    "heat-v1-a-graph": "-6",
    "profile-v1-a-draw": {
      reactant: "50",
      product: "20",
      peak: "115",
      activationArrow: "reactants-peak",
      overallArrow: "reactants-products",
    },
    "ep-v1-a-gradient": "1.4",
  };
  for (const [id, value] of Object.entries(references)) {
    const q = paper1Foundation.questions.find((q) => q.id === id)!;
    expect(
      mark(q, typeof value === "string" ? value : JSON.stringify(value))
        .correct,
      id,
    ).toBe(true);
  }
  expect(mark(questionById("as-v1-ca-ratio")!, "40000").correct).toBe(false);
  expect(mark(questionById("sc-v1-ca-mg")!, "4000").correct).toBe(false);
});

test("every selected extended written answer stays manually reviewed, including method ordering and evidence limits", () => {
  for (const q of paper1Foundation.questions.filter((q) => q.rubric)) {
    expect(mark(q, q.answer).correct, q.id).toBe(false);
    expect(mark(q, q.answer).selfReview, q.id).toBe(true);
    expect(mark(q, "").empty, q.id).toBe(true);
    expect(q.rubric!.length).toBeGreaterThanOrEqual(2);
  }
  const method = questionById("ss-v1-p-method-write")!;
  expect(method.answer.indexOf("Filter")).toBeLessThan(
    method.answer.indexOf("Concentrate"),
  );
  expect(method.answer.indexOf("cooling")).toBeLessThan(
    method.answer.indexOf("pat dry"),
  );
  expect(questionById("py-v1-ca-proof")!.answer).toContain("110%");
  expect(questionById("py-v1-ca-proof")!.answer).toContain("90%");
});

test("the separately reviewed Foundation Paper2 set retains lesson identities and the five Paper2 strands", () => {
  expect(paper2Foundation.questions).toHaveLength(30);
  expect(paper2Foundation.course).toBe("separate");
  expect(paper2Foundation.tier).toBe("foundation");
  expect(new Set(paper2Foundation.questions.map((q) => q.id)).size).toBe(30);
  expect(paper2Foundation.questions.filter((q) => q.rubric)).toHaveLength(14);
  expect(paper2Foundation.questions.filter((q) => q.tier === "higher")).toEqual(
    [],
  );
  expect(
    Object.fromEntries(
      [...new Set(paper2Foundation.topics)].map((t) => [
        t,
        paper2Foundation.topics.filter((x) => x === t).length,
      ]),
    ),
  ).toEqual({
    rates: 6,
    organic: 6,
    analysis: 6,
    atmosphere: 6,
    resources: 6,
  });
  for (const q of paper2Foundation.questions)
    expect(q).toBe(questionById(q.id));
});

test("Paper2 scalar, graph-reading and formulation references match independently calculated values and original givens", () => {
  const references: Record<string, string | Record<string, string>> = {
    "rr-v1-A-interval": "1.8",
    "tc-v1-a2": "65",
    "alk-v1-a-balance": "11",
    "chromatography-v1-cA-rf": "0.5",
    "instrumental-analysis-v1-cA-concentration": "5",
    "climate-v1-cA-graph": { start: "-0.3", end: "0.8", change: "1.1" },
    "pollution-v1-cA-sulfur": "8",
    "haber-v1-cA-mix": { n: "4", p: "2", k: "6", o: "28" },
  };
  for (const [id, value] of Object.entries(references))
    expect(
      mark(
        questionById(id)!,
        typeof value === "string" ? value : JSON.stringify(value),
      ).correct,
      id,
    ).toBe(true);
  expect(mark(questionById("rr-v1-A-interval")!, "2.4").correct).toBe(false);
  expect(mark(questionById("chromatography-v1-cA-rf")!, "0.5833").correct).toBe(
    false,
  );
  expect(mark(questionById("pollution-v1-cA-sulfur")!, "0.008").correct).toBe(
    false,
  );
  const source = chromaGivenSources.coldAmeasurement;
  expect([source.origin, source.lanes[0].centres[0], source.front]).toEqual([
    18, 63, 108,
  ]);
  const drawing = chromaDrawingSources.plotCheckA;
  expect(drawing.mode).toBe("chromatogram");
  if (drawing.mode !== "chromatogram") throw Error("Wrong drawing source");
  expect([drawing.origin, drawing.front, ...drawing.reference]).toEqual([
    15, 115, 35, 85, 70,
  ]);
  expect(questionById("pol-v1-a-draw")!.polymerisationGiven).toEqual({
    groups: ["H", "Cl", "H", "CH3"],
    polymer: false,
  });
  expect(questionById("rr-v1-A-draw")!.rateDrawing!.data.values).toEqual([
    0, 18, 31, 40, 46, 46, 46,
  ]);
});

test("Paper2 written and full constructed responses retain honest manual review and self-contained methods", () => {
  const constructions: Record<string, string> = {
    "pol-v1-a-draw": JSON.stringify({
      s0: "H",
      s1: "Cl",
      s2: "H",
      s3: "CH3",
      bond: "1",
      left: "1",
      right: "1",
      brackets: "1",
      countMark: "n",
    }),
    "chromatography-v1-cA-drawing": JSON.stringify({
      record: "plotCheckA",
      raw: { origin: "15", front: "115", a1: "30", a2: "85", b1: "70" },
      placed: { origin: 15, front: 115, a1: 30, a2: 85, b1: 70 },
      choices: { stationary: "paper", mobile: "water", lineMaterial: "pencil" },
    }),
  };
  for (const q of paper2Foundation.questions.filter((q) => q.rubric)) {
    const response = constructions[q.id] ?? q.answer;
    expect(mark(q, response).correct, q.id).toBe(false);
    expect(mark(q, response).selfReview, q.id).toBe(true);
    expect(mark(q, "").empty, q.id).toBe(true);
  }
  const method = questionById("ion-tests-v1-cA-plan")!;
  expect(method.answer.indexOf("nitric acid")).toBeLessThan(
    method.answer.indexOf("silver nitrate"),
  );
  expect(method.answer).toContain("separate fresh");
  expect(method.answer).toContain("crimson");
  expect(method.answer).toContain("white precipitate");
  expect(questionById("haber-v1-cA-cool")!.prompt).toContain(
    "Haber reactor contains ammonia and unreacted nitrogen and hydrogen",
  );
  expect(questionById("lca-v1-cA-judgement")!.answer).toContain(
    "No overall universal winner",
  );
});
