import {
  dueReview,
  emptyWork,
  REVIEW_DELAY,
  type Run,
} from "../src/lib/progress";
import { test, expect } from "@playwright/test";
import {
  purityJourney as j,
  purityRecovery,
  purityExposureFamilies,
} from "../src/content/journeys/purity-journey";
import { purityCases } from "../src/lib/purity-cases";
import {
  initialPurity,
  expectedPurity,
  validPurity,
  validPurityHistory,
  checkPurity,
  parsePurityNumber,
  type PurityMode,
} from "../src/lib/purity-domain";
import {
  initialPurityDrawing,
  referencePurityDrawing,
  readPurityDrawing,
  separationSources,
  type PurityDrawingData,
} from "../src/lib/purity-drawing";
import {
  filtrationForecast,
  makeFiltrationAsset,
  disposeFiltrationAsset,
} from "../src/lib/purity-asset";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import { mark, reviewSubject } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import * as T from "three";
const all = [
  ...j.warmup,
  ...j.refresher,
  ...j.guided,
  ...j.practice,
  ...j.checkForms.flat(),
  ...j.reviewForms.flat(),
];
test("one reviewed lesson has complete routes and reserved cold forms", () => {
  expect(all).toHaveLength(74);
  expect(new Set(all.map((q) => q.id)).size).toBe(74);
  const grouped = j.practiceGroups.flatMap((g) => g.taskIds);
  expect(grouped).toHaveLength(25);
  expect(new Set(grouped).size).toBe(25);
  for (const q of j.practice) {
    expect(purityRecovery[q.id][0]).toBe(q.followUp);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  for (const form of [...j.checkForms, ...j.reviewForms])
    for (const q of form) expect(q.model).toBeUndefined();
  expect(j.checkForms.map((f) => f.filter((q) => !q.rubric).length)).toEqual([
    7, 7,
  ]);
  expect(j.reviewForms.map((f) => f.filter((q) => !q.rubric).length)).toEqual([
    2, 2,
  ]);
  const l = lessons.find((l) => l.slug === "purity-and-separation")!;
  expect(l.journey).toBe(j);
  expect(l.prerequisite).toBe("states-of-matter");
});
test("40 immutable source cases round-trip through actual app model adapters", () => {
  let count = 0;
  for (const mode of Object.keys(purityCases) as PurityMode[])
    for (const record of Object.keys(purityCases[mode])) {
      const model = { kind: "purity-separation" as const, mode, record },
        z = initialPurity(mode, record);
      expect(initialBoard(model)).toEqual(z);
      const h = [z];
      for (const [key, value] of Object.entries(expectedPurity(mode, record)))
        h.push({ ...h.at(-1)!, [key]: value });
      expect(validHistory(model, h)).toBe(true);
      expect(checkBoard(model, h.at(-1)!).correct).toBe(true);
      expect(validHistory(model, [...h, z])).toBe(true);
      expect(validPurity(mode, { ...z, extra: "" })).toBe(false);
      count++;
    }
  expect(count).toBe(40);
});
test("wet product fraction and recovery use independently supplied denominators", () => {
  expect(expectedPurity("recovery", "wet")).toEqual({
    collectionMass: "11",
    recovery: "80",
    purity: "72.7",
    lostProduct: "2",
  });
  expect(expectedPurity("recovery", "decimal")).toEqual({
    collectionMass: "8",
    recovery: "75",
    purity: "75",
    lostProduct: "2",
  });
  for (const q of all.filter((q) => q.unit && !q.options))
    expect(mark(q, q.answer).correct).toBe(true);
  const zero = all.find((q) => q.id === "purity-v1-g-filter-salt")!;
  expect(mark(zero, "0.00000001").correct).toBe(false);
  expect(
    mark(
      all.find((q) => q.id === "purity-v1-g-wet-purity")!,
      "72.70",
    ).correct,
  ).toBe(true);
});
test("damp, partial-dissolution and wash inputs conserve stated salt and water", () => {
  expect(expectedPurity("filtration", "damp")).toEqual({
    residueSand: "6",
    residueSalt: "0.2",
    residueWater: "2",
    filtrateSand: "0",
    filtrateSalt: "3.8",
    filtrateWater: "38",
  });
  expect(expectedPurity("filtration", "incomplete").residueSalt).toBe("1");
  expect(expectedPurity("filtration", "washed")).toEqual({
    residueSand: "7",
    residueSalt: "0",
    residueWater: "1",
    filtrateSand: "0",
    filtrateSalt: "3",
    filtrateWater: "49",
  });
});
test("ordinary decimals preserve unfinished and signed wrong proposals without snapping", () => {
  expect(parsePurityNumber("−.4", true)).toBe(-0.4);
  expect(parsePurityNumber(".4")).toBe(0.4);
  for (const raw of ["0.", "1e2", " 1", "-1"])
    expect(parsePurityNumber(raw)).toBeNull();
  const wrong = { ...initialPurity("melting", "negative"), width: "−3" };
  expect(checkPurity("melting", wrong, "width")).toEqual({
    valid: true,
    correct: false,
  });
  expect(wrong.width).toBe("−3");
  expect(
    checkPurity(
      "filtration",
      { ...initialPurity("filtration", "complete"), residueSalt: "0.00000001" },
      "residueSalt",
    ).correct,
  ).toBe(false);
});
test("focused checks do not fill or require hidden answer quantities", () => {
  const b: Record<string, string> = {
    ...initialPurity("formulation", "ink"),
    amount0: "170",
  };
  expect(checkPurity("formulation", b, "amount0").correct).toBe(true);
  expect(checkPurity("formulation", b).valid).toBe(false);
  expect(b.amount1).toBe("");
  const model = {
    kind: "purity-separation" as const,
    mode: "melting" as const,
    record: "matching",
    focus: "width" as const,
  };
  expect(
    validHistory(model, [
      initialPurity("melting", "matching"),
      initialPurity("melting", "incomplete"),
    ]),
  ).toBe(false);
  expect(
    validPurityHistory("melting", "matching", [
      initialPurity("melting", "matching"),
      { ...initialPurity("melting", "matching"), start: "75", finish: "78" },
    ]),
  ).toBe(false);
});
test("supplied formulation ratios are simplest and ordered rather than just equivalent", () => {
  const refs: [string, number, number][] = [
    ["r-ratio", 3, 1],
    ["p-ingredient-ratio", 13, 7],
    ["cB-recipe", 3, 2],
  ];
  for (const [id, left, right] of refs) {
    const q = all.find((q) => q.id === "purity-v1-" + id)!;
    expect(mark(q, q.answer).correct).toBe(true);
    expect(
      mark(q, JSON.stringify({ left: String(left), right: String(right) }))
        .correct,
    ).toBe(true);
    expect(
      mark(
        q,
        JSON.stringify({ left: String(left * 2), right: String(right * 2) }),
      ).correct,
    ).toBe(false);
    expect(
      mark(q, JSON.stringify({ left: String(right), right: String(left) }))
        .correct,
    ).toBe(false);
  }
});
test("all six fixed-source drawings start blank and never receive automatic examiner marks", () => {
  for (const [record, source] of Object.entries(separationSources)) {
    const data: PurityDrawingData = { record, mode: source.mode },
      q = all.find((q) => q.purityDrawing?.record === record)!;
    const blank = initialPurityDrawing(data);
    expect(
      Object.entries(blank)
        .filter(([k]) => k !== "record")
        .every(([, v]) => v === ""),
    ).toBe(true);
    expect(mark(q, JSON.stringify(blank)).empty).toBe(true);
    const reference = JSON.stringify(referencePurityDrawing(data));
    expect(readPurityDrawing(data, reference)).not.toBeNull();
    expect(mark(q, reference)).toMatchObject({
      correct: false,
      selfReview: true,
      empty: false,
    });
    expect(reviewSubject(q)).toBe("separation proposal");
    expect(mark(q, "{original bad bytes")).toMatchObject({
      correct: false,
      invalid: true,
    });
    expect(
      readPurityDrawing({ ...data, record: "different" }, reference),
    ).toBeNull();
  }
});
test("direct exposure aliases cannot spread by transitive closure", () => {
  for (const q of all)
    for (const alias of q.exposureAliases ?? []) {
      if (!alias.startsWith("purity-v1-")) continue;
      expect(
        Object.values(purityExposureFamilies).some(
          (f) =>
            f.includes(q.id.replace("purity-v1-", "")) &&
            f.includes(alias.replace("purity-v1-", "")),
        ),
      ).toBe(true);
    }
  const ratio = all.find((q) => q.id === "purity-v1-cB-recipe")!;
  expect(ratio.exposureAliases ?? []).not.toContain(
    "purity-v1-p-ingredient-ratio",
  );
});
test("conditional salt complements follow a wrong proposal without mutating raw fields", () => {
  const b: Record<string, string> = {
      ...initialPurity("filtration", "complete"),
      residueSalt: "1",
    },
    f = filtrationForecast(b, "residueSalt");
  expect(f.filtrateSalt).toBe(1);
  expect(f.residueWater).toBeNull();
  expect(b.filtrateSalt).toBe("");
  expect(
    filtrationForecast({ ...b, residueSalt: "3" }, "residueSalt").filtrateSalt,
  ).toBeNull();
});
test("real cutaway apparatus has finite connected geometry and retains wrong material masses", () => {
  const b = {
      ...initialPurity("filtration", "damp"),
      ...expectedPurity("filtration", "damp"),
      residueSalt: "999",
    },
    root = makeFiltrationAsset(b);
  root.traverse((o) => {
    if (o instanceof T.Mesh)
      for (const value of o.geometry.getAttribute("position").array)
        expect(Number.isFinite(value)).toBe(true);
  });
  const outlet = root.getObjectByName(
      "Continuous funnel outlet into receiving flask neck",
    )!,
    paper = root.getObjectByName(
      "Porous filter paper inside funnel cutaway",
    ) as T.Mesh<T.CylinderGeometry>;
  expect(outlet.position.y).toBe(1.75);
  expect(paper.geometry.parameters.thetaStart).toBe(Math.PI / 2);
  expect(root.userData.rawProposal.residueSalt).toBe("999");
  expect(root.userData.status).toContain("Student proposal");
  disposeFiltrationAsset(root);
});

test("reading uncertainty is supplied separately from resolution when an interval matches a reference", () => {
  expect(purityCases.melting.matching.uncertainty).toBe(0.2);
  expect(purityCases.melting.narrow.uncertainty).toBe(0.2);
  expect(all.find((q) => q.id === "purity-v1-cB-interval")!.prompt).toContain(
    "reading uncertainty ±0.4 °C",
  );
});

test("each delayed review is scheduled from the latest actual submission, including a previous review", () => {
  const now = 1800000000000;
  const old: Run = {
    kind: "check",
    ids: ["a"],
    index: 0,
    responses: {},
    started: now - 2 * REVIEW_DELAY,
    submitted: now - 2 * REVIEW_DELAY,
  };
  const recent: Run = {
    ...old,
    kind: "review",
    started: now - 1000,
    submitted: now,
  };
  const w = { ...emptyWork(), history: [old, recent], run: recent };
  expect(dueReview(w, now)).toBe(false);
  expect(dueReview(w, now + REVIEW_DELAY - 1)).toBe(false);
  expect(dueReview(w, now + REVIEW_DELAY)).toBe(true);
  expect(dueReview(emptyWork(), now)).toBe(false);
});
