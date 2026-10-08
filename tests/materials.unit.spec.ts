import { test, expect } from "@playwright/test";
import {
  allMaterialsTasks as all,
  materialsJourney as j,
  materialsRecoveryRoutes,
} from "../src/content/journeys/materials-and-corrosion";
import {
  materialsRecords as R,
  materialsFields,
  materialsNumeric,
  materialsChoices,
  materialsNumber,
  initialMaterials,
  validMaterials,
  validMaterialsHistory,
  checkMaterials,
} from "../src/lib/materials";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
test("one93-task separate Chemistry lesson has eight specific activities and25 supplied cases", () => {
  const l = lessons.find((l) => l.slug === "materials-and-corrosion")!;
  expect(l.journey).toBe(j);
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("separate");
  expect(all).toHaveLength(93);
  expect(new Set(all.map((q) => q.id)).size).toBe(93);
  expect(j.refresher).toHaveLength(28);
  expect(j.guided).toHaveLength(8);
  expect(j.practice).toHaveLength(29);
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4]);
  expect(Object.keys(R)).toHaveLength(25);
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  for (const q of j.practice) {
    expect(q.followUp).toBe(materialsRecoveryRoutes[q.id]);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  for (const q of [
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ])
    expect(q.model).toBeUndefined();
  for (const record of Object.keys(R))
    expect(
      j.refresher.some(
        (q) =>
          q.model?.kind === "materials-investigation" &&
          q.model.record === record,
      ),
    ).toBe(true);
});
test("every wrong proposal preserves immutable facts and exact one-field histories", () => {
  const source = JSON.stringify(R);
  for (const [record, r] of Object.entries(R)) {
    const model = {
        kind: "materials-investigation" as const,
        mode: r.mode,
        record,
      },
      h = [initialMaterials(r.mode, record)];
    expect(initialBoard(model)).toEqual(h[0]);
    expect(checkBoard(model, h[0]).correct).toBe(false);
    for (const [f, v] of Object.entries(r.expected))
      h.push({ ...h.at(-1)!, [f]: v });
    expect(validHistory(model, h)).toBe(true);
    expect(checkBoard(model, h.at(-1)!).correct, record).toBe(true);
    for (const f of materialsFields[r.mode]) {
      const v = materialsNumeric.includes(f)
          ? "999"
          : materialsChoices[f].find((v) => v !== r.expected[f])!,
        b = { ...h.at(-1)!, [f]: v };
      expect(validBoard(model, b)).toBe(true);
      expect(checkBoard(model, b).correct).toBe(false);
      expect(checkBoard(model, b).feedback).toContain("remains as entered");
      expect(b[f]).toBe(v);
    }
  }
  expect(JSON.stringify(R)).toBe(source);
});
test("malformed numeric work remains raw; foreign, forged and non-plain states rejected", () => {
  const b = initialMaterials("composition", "gold18");
  for (const v of [
    { ...b, record: "gold12" },
    { ...b, baseMass: 9 },
    { ...b, extra: "" },
    [b],
    { ...b, record: "__proto__" },
  ])
    expect(validMaterials("composition", v, "gold18")).toBe(false);
  for (const raw of ["1e3", "5 g", "abc", " 9"]) {
    const proposal = { ...b, baseMass: raw };
    expect(validMaterials("composition", proposal, "gold18")).toBe(true);
    expect(materialsNumber(raw)).toBeNull();
    expect(validMaterialsHistory("composition", "gold18", [b, proposal])).toBe(
      true,
    );
    expect(checkMaterials("composition", proposal).correct).toBe(false);
    expect(proposal.baseMass).toBe(raw);
  }
  const wrong = { ...b, baseMass: "1..2" };
  expect(validMaterials("composition", wrong)).toBe(true);
  expect(materialsNumber(wrong.baseMass)).toBeNull();
  expect(checkMaterials("composition", wrong).correct).toBe(false);
  expect(wrong.baseMass).toBe("1..2");
  expect(validMaterialsHistory("composition", "gold18", [b, wrong])).toBe(true);
  for (const h of [
    [wrong],
    [b, b],
    [],
    [b, { ...b, basePercent: "75", baseMass: "9" }],
  ])
    expect(validMaterialsHistory("composition", "gold18", h)).toBe(false);
  for (const s of ["", " ", "1e3", "1/2", "NaN", "Infinity", "1..2"])
    expect(materialsNumber(s)).toBeNull();
});
test("rust controls, coating reactivity and finite zinc are scientifically distinct", () => {
  expect(R.wet.expected).toEqual({
    oxygen: "yes",
    water: "yes",
    outcome: "rust",
  });
  expect(R.dry.expected).toEqual({
    oxygen: "yes",
    water: "no",
    outcome: "protected",
  });
  expect(R.noOxygen.expected).toEqual({
    oxygen: "no",
    water: "yes",
    outcome: "protected",
  });
  expect(R.paint.expected).toEqual({
    mechanism: "barrier",
    outcome: "protected",
    oxidises: "neither",
  });
  expect(R.scratchPaint.expected).toEqual({
    mechanism: "failed",
    outcome: "rust",
    oxidises: "iron",
  });
  expect(R.zinc.expected).toEqual({
    mechanism: "sacrificial",
    outcome: "protected",
    oxidises: "zinc",
  });
  for (const key of ["silver", "spent"])
    expect(R[key].expected).toEqual({
      mechanism: "failed",
      outcome: "rust",
      oxidises: "iron",
    });
  expect(R.zinc.note).toContain("electrical contact");
  expect(R.noOxygen.rows![0].text).toContain("dissolved oxygen");
});
test("independent literal numerical references and native material balances use the correct whole", () => {
  const references: Record<string, number> = {
    "w-percent": 10,
    "r-massGain": 0.2,
    "r-percentage": 4,
    "r-density": 6.3,
    "p-threeSF": 4.62,
    "p-resolution": 0.01,
    "p-gain": 0.24,
    "p-carats": 18,
    "p-strength": 100,
    "vA-carats": 87.5,
    "vB-mass": 24,
  };
  for (const [s, v] of Object.entries(references)) {
    const q = all.find((q) => q.id === "materials-v1-" + s)!;
    expect(Number(q.answer)).toBe(v);
    expect(mark(q, String(v)).correct).toBe(true);
    expect(mark(q, String(v + 1)).correct).toBe(false);
  }
  const builds: Record<string, number[]> = {
    "p-rustPercent": [6, 1, 5],
    "p-gold": [37.5, 6, 10],
    "p-remainder": [92, 460, 40],
    "p-panel": [80, 20, 4],
    "cA-gold": [62.5, 15, 9],
    "cB-alloy": [90, 270, 30],
  };
  for (const [s, refs] of Object.entries(builds)) {
    const q = all.find((q) => q.id === "materials-v1-" + s)!;
    expect(q.parts!.map((p) => Number(p.answer))).toEqual(refs);
    expect(mark(q, q.answer).correct).toBe(true);
    const b = JSON.parse(q.answer);
    b[q.parts![0].id] = "999";
    expect(mark(q, JSON.stringify(b)).correct).toBe(false);
  }
  expect(((0.18 / 3.3) * 100 - (0.04 / 4.8) * 100).toPrecision(3)).toBe("4.62");
  expect(((4.24 - 4) / 4) * 100).toBeCloseTo(6);
  expect(((5.05 - 5) / 5) * 100).toBeCloseTo(1);
  expect(R.gold18.expected).toEqual({
    basePercent: "75",
    baseMass: "9",
    otherMass: "3",
  });
  expect(R.gold12.expected).toEqual({
    basePercent: "50",
    baseMass: "10",
    otherMass: "10",
  });
  expect(R.titanium.expected).toEqual({
    basePercent: "90",
    baseMass: "180",
    otherMass: "20",
  });
});
test("crosslinks and packing have separate structures and correct consequences", () => {
  expect(R.soft.expected).toEqual({
    structure: "separate",
    behaviour: "melts",
    reason: "between",
  });
  expect(R.set.expected).toEqual({
    structure: "crosslinked",
    behaviour: "noMelts",
    reason: "crosslinks",
  });
  expect(R.ld.expected).toEqual({
    structure: "branched",
    behaviour: "lowerDensity",
    reason: "poorPacking",
  });
  expect(R.hd.expected).toEqual({
    structure: "linear",
    behaviour: "higherDensity",
    reason: "closePacking",
  });
  expect(R.set.feedback).toContain("decompose");
  expect(R.hd.feedback).toContain("not covalent crosslinking");
  expect(R.mixed.expected).toEqual({
    size: "different",
    sliding: "harder",
    bonding: "remains",
  });
});
test("recipes, composite roles and simultaneous constraints cannot be interchanged", () => {
  expect(R.soda.expected).toEqual({
    rawOne: "sand",
    rawTwo: "sodium",
    rawThree: "limestone",
    process: "heatMix",
  });
  expect(R.boro.expected).toEqual({
    rawOne: "sand",
    rawTwo: "boron",
    rawThree: "none",
    process: "heatMix",
  });
  expect(R.clay.expected).toEqual({
    rawOne: "clay",
    rawTwo: "none",
    rawThree: "none",
    process: "shapeFire",
  });
  expect(R.concrete.expected).toEqual({
    matrix: "cement",
    reinforcement: "steel",
    role: "bind",
  });
  expect(R.fibre.expected).toEqual({
    matrix: "resin",
    reinforcement: "glass",
    role: "bind",
  });
  expect(R.light.expected).toEqual({ material: "c", property: "lightStrong" });
  expect(R.hot.expected).toEqual({ material: "a", property: "heat" });
  expect(R.cold.expected).toEqual({ material: "b", property: "impact" });
});
test("fourteen explanations are manual and reserved numerics are distinct from teaching", () => {
  const written = all.filter((q) => q.rubric);
  expect(written).toHaveLength(14);
  for (const q of written) {
    expect(q.referenceResponse).toBe(q.answer);
    expect(mark(q, q.answer)).toMatchObject({
      correct: false,
      selfReview: true,
    });
  }
  const teaching = new Set(
    [...j.warmup, ...j.refresher, ...j.guided, ...j.practice].map(
      (q) => q.prompt,
    ),
  );
  for (const q of [...j.checkForms.flat(), ...j.reviewForms.flat()])
    expect(teaching.has(q.prompt)).toBe(false);
  expect(j.scopeNote).toContain("Separate");
  expect(j.outcomes!.join(" ")).toContain("LD/HD");
});
test("legacy and shared identical facts retain global reciprocal exposure closure", () => {
  const candidates = lessons.flatMap((l) => [
    ...l.questions,
    ...l.checks,
    ...(l.journey
      ? [
          ...l.journey.warmup,
          ...l.journey.refresher,
          ...l.journey.guided,
          ...l.journey.practice,
          ...l.journey.checkForms.flat(),
          ...l.journey.reviewForms.flat(),
        ]
      : []),
  ]);
  for (let i = 0; i < 6; i++) {
    const old = candidates.find(
      (q) => q.id === "materials-and-corrosion-" + i,
    )!;
    expect(
      old.exposureAliases!.some((a) => a.startsWith("materials-v1-")),
    ).toBe(true);
  }
  for (const [a, b] of [
    ["materials-v1-p-layer", "mb-v1-g-alloy"],
    ["materials-v1-p-thermal", "ps-v1-g-separation"],
  ]) {
    const qa = candidates.find((q) => q.id === a)!,
      qb = candidates.find((q) => q.id === b)!;
    expect(qa.exposureAliases).toContain(b);
    expect(qb.exposureAliases).toContain(a);
  }
  for (const q of all)
    for (const alias of q.exposureAliases ?? []) {
      const target = candidates.find((o) => o.id === alias)!;
      expect(target, alias).toBeDefined();
      expect(target.exposureAliases).toContain(q.id);
    }
});
