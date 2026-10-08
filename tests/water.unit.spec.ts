import { test, expect } from "@playwright/test";
import {
  waterJourney as j,
  allWaterTasks as all,
  waterRecoveryRoutes,
} from "../src/content/journeys/potable-water";
import {
  waterRecords as R,
  waterFields,
  waterChoices,
  waterNumeric,
  initialWater,
  validWater,
  validWaterHistory,
  checkWater,
  waterNumber,
} from "../src/lib/water";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
import {
  makeWaterApparatus,
  disposeWaterApparatus,
  waterDimensions as D,
} from "../src/lib/water-asset";
import * as T from "three";
test("one individually authored88-task water journey has seven activities,26 supplied records and27 directed recoveries", () => {
  expect(lessons.find((l) => l.slug === "potable-water")!.journey).toBe(j);
  expect(all).toHaveLength(88);
  expect(new Set(all.map((q) => q.id)).size).toBe(88);
  expect(Object.keys(R)).toHaveLength(26);
  expect(j.guided).toHaveLength(7);
  expect(j.refresher).toHaveLength(26);
  expect(j.practice).toHaveLength(27);
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4]);
  expect(j.scopeNote).toContain("practical 8");
  expect(j.scopeNote).toContain("practical 13");
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  for (const q of j.practice) {
    expect(q.followUp).toBe(waterRecoveryRoutes[q.id]);
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
          q.model?.kind === "water-investigation" && q.model.record === record,
      ),
      record,
    ).toBe(true);
});
test("native water proposals retain each wrong field, pristine source and one-field edits", () => {
  const original = JSON.stringify(R);
  for (const [record, r] of Object.entries(R)) {
    const m = { kind: "water-investigation" as const, mode: r.mode, record },
      h = [initialWater(r.mode, record)];
    expect(initialBoard(m)).toEqual(h[0]);
    expect(checkBoard(m, h[0]).correct).toBe(false);
    for (const [f, v] of Object.entries(r.expected))
      h.push({ ...h.at(-1)!, [f]: v });
    expect(validHistory(m, h), record).toBe(true);
    expect(checkBoard(m, h.at(-1)!).correct, record).toBe(true);
    for (const f of waterFields[r.mode]) {
      const v = waterNumeric.includes(f)
          ? "999"
          : waterChoices[f].find((v) => v !== r.expected[f])!,
        b = { ...h.at(-1)!, [f]: v };
      expect(validBoard(m, b)).toBe(true);
      expect(checkBoard(m, b).correct, record + "/" + f).toBe(false);
      expect(checkBoard(m, b).feedback).toContain("remains as entered");
      expect(b[f]).toBe(v);
    }
  }
  expect(JSON.stringify(R)).toBe(original);
});
test("saved schema rejects foreign sources, forged data, nonstrings and multi-field repair while preserving malformed numbers", () => {
  const b = initialWater("residue", "dish10");
  for (const v of [
    { ...b, record: "dish25" },
    { ...b, solidMass: 5 },
    { ...b, extra: "" },
    [b],
  ])
    expect(validWater("residue", v, "dish10")).toBe(false);
  expect(
    validWaterHistory("residue", "dish10", [
      b,
      { ...b, solidMass: ".05", litres: ".01" },
    ]),
  ).toBe(false);
  expect(
    validWaterHistory("residue", "dish10", [{ ...b, solidMass: ".05" }]),
  ).toBe(false);
  const raw = { ...b, ...R.dish10.expected, concentration: "1..2" };
  expect(validWater("residue", raw)).toBe(true);
  expect(checkWater("residue", raw).correct).toBe(false);
  expect(raw.concentration).toBe("1..2");
  for (const v of ["", "1..2", "1e3", "1/2", "Infinity"])
    expect(waterNumber(v)).toBeNull();
  expect(waterNumber("-2")).toBe(-2);
});
test("39 native numeric references independently agree with original source arithmetic", () => {
  const refs: Record<string, number[]> = {
    dish10: [0.05, 0.01, 5],
    dish25: [0.1, 0.025, 4],
    dish50: [1.6, 0.05, 32],
    dish100: [0.03, 0.1, 0.3],
    mem100: [40, 60, 3000],
    mem80: [24, 56, 2400],
    mem120: [54, 66, 3600],
    coast: [4, 15, 11],
    lake: [0.5, 6, 5.5],
    heatReuse: [5, 3, -2],
    equal: [2, 2, 0],
    repeat50: [1.71, 34.2],
    repeat25: [0.12, 4.8],
    repeat10: [0.03, 3],
  };
  expect(Object.values(refs).flat()).toHaveLength(39);
  for (const [k, nums] of Object.entries(refs)) {
    const r = R[k];
    expect(
      waterFields[r.mode]
        .filter((f) => waterNumeric.includes(f))
        .map((f) => Number(r.expected[f])),
      k,
    ).toEqual(nums);
    if (r.balance) {
      const mass = r.balance.cooled - r.balance.empty;
      expect(mass).toBeCloseTo(nums[0], 8);
      expect(mass / (r.balance.volume / 1000)).toBeCloseTo(nums[2], 8);
    }
    if (r.repeat) {
      const mean =
        r.repeat.masses.reduce((a, b) => a + b, 0) / r.repeat.masses.length;
      expect(mean).toBeCloseTo(nums[0], 8);
      expect(mean / (r.repeat.volume / 1000)).toBeCloseTo(nums[1], 8);
    }
    if (r.energy) {
      expect(r.energy.a / r.energy.volume).toBeCloseTo(nums[0]);
      expect(r.energy.b / r.energy.volume).toBeCloseTo(nums[1]);
    }
    if (r.membrane) expect(nums[0] + nums[1]).toBe(r.membrane.feed);
  }
});
test("14 independent constructions and39 fields match separately audited literal answers; fraction inputs accepted without live solutions", () => {
  const refs: Record<string, number[]> = {
    "p-residue": [0.15, 0.025, 6],
    "p-dilute": [0.02, 0.1, 0.2],
    "p-repeat": [6.8, 1.7, 34],
    "p-membrane": [36, 54, 2700],
    "p-brineConcentration": [50, 60],
    "p-energy": [3, 9, 6],
    "p-energyReverse": [8, 5, -3],
    "cA-residue": [0.18, 0.03, 6],
    "cA-membrane": [72, 4000],
    "cA-energy": [2, 7, 5],
    "cB-residue": [0.07, 0.02, 3.5],
    "cB-repeat": [3.72, 1.24, 31],
    "cB-energy": [6, 4, -2],
    "vB-membrane": [46, 2100],
  };
  expect(Object.values(refs).flat()).toHaveLength(39);
  expect(all.filter((q) => q.parts)).toHaveLength(14);
  for (const [s, nums] of Object.entries(refs)) {
    const q = all.find((q) => q.id === "water-v1-" + s)!;
    expect(
      q.parts!.map((p) => p.answer),
      s,
    ).toEqual(nums);
    expect(mark(q, q.answer).correct).toBe(true);
    const fractional = Object.fromEntries(
      q.parts!.map((p) => [p.id, `${p.answer * 1000}/1000`]),
    );
    expect(mark(q, JSON.stringify(fractional)).correct, s).toBe(true);
    const bad = { ...JSON.parse(q.answer), [q.parts![0].id]: "1..2" };
    expect(mark(q, JSON.stringify(bad)).correct).toBe(false);
    for (const bad of ["[]", "null", '{"extra":"1"}', '{"mass":true}'])
      expect(mark(q, bad).correct).toBe(false);
  }
});
test("actual scientific distinctions and written marking remain honest and early exposures linked", () => {
  expect(R.clear.expected).toMatchObject({
    potable: "unknown",
    pure: "unknown",
  });
  expect(R.saline.expected).toMatchObject({ potable: "no", pure: "no" });
  expect(R.mineral.expected).toMatchObject({ potable: "yes", pure: "no" });
  expect(R.freshUV.expected.second).toBe("uv");
  expect(R.seawater.expected).toMatchObject({
    second: "none",
    saltFate: "left",
    microbeFate: "destroyed",
  });
  expect(R.seawater.feedback).toContain("not a universal claim");
  for (const q of all) {
    expect(
      q.rubric ? mark(q, q.answer).selfReview : mark(q, q.answer).correct,
      q.id,
    ).toBe(true);
    for (const error of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, error).correct, q.id).toBe(false);
    if (q.rubric) {
      expect(q.referenceResponse).toBe(q.answer);
      expect(mark(q, "pH7 means every water sample is safe")).toMatchObject({
        correct: false,
        selfReview: true,
      });
    }
  }
  expect(all.filter((q) => q.rubric)).toHaveLength(10);
  expect(j.guided[0].exposureAliases).toContain("potable-water-0");
  expect(j.guided[1].exposureAliases).toContain("potable-water-1");
  expect(j.guided[4].exposureAliases).toContain("potable-water-4");
  for (const [reserved, taught] of [
    ["cA-quality", "r-saline"],
    ["cA-treatment", "r-fresh"],
    ["cA-distil", "r-cold"],
    ["cA-dry", "p-constant"],
    ["cB-pure", "r-mineral"],
    ["cB-UV", "r-uv"],
    ["cB-pressure", "p-pressure"],
    ["cB-cooling", "r-uncooled"],
  ]) {
    expect(
      all.find((q) => q.id === "water-v1-" + reserved)!.exposureAliases,
    ).toContain("water-v1-" + taught);
  }
  for (const q of [...j.checkForms.flat(), ...j.reviewForms.flat()].filter(
    (q) => q.parts,
  ))
    expect(q.exposureAliases).toBeUndefined();
  const teaching = new Set(
    [...j.warmup, ...j.refresher, ...j.guided, ...j.practice].map(
      (q) => q.prompt,
    ),
  );
  for (const q of [...j.checkForms.flat(), ...j.reviewForms.flat()])
    expect(teaching.has(q.prompt), q.id).toBe(false);
});
test("real apparatus geometry has an open bore, continuous vapour path, supported receiver and outlet above collected water", () => {
  for (const cooling of ["cold", "warm", ""]) {
    const b = { ...initialWater("distil", "cold"), cooling },
      root = makeWaterApparatus(b),
      names: string[] = [];
    root.updateMatrixWorld(true);
    root.traverse((n) => {
      const m = n as T.Mesh;
      if (!m.geometry) return;
      names.push(m.name);
      const a = m.geometry.getAttribute("position");
      for (let i = 0; i < a.count; i++) {
        const v = new T.Vector3()
          .fromBufferAttribute(a, i)
          .applyMatrix4(m.matrixWorld);
        expect([v.x, v.y, v.z].every(Number.isFinite), m.name).toBe(true);
      }
    });
    expect(names).toContain("Continuous hollow delivery tube");
    expect(names).toContain("Flask bung with open delivery bore");
    expect(names).toContain("Open receiver with closed bottom");
    expect(names).toContain("Receiver clamp arm");
    expect(names.includes("Cold bath water")).toBe(cooling === "cold");
    if (cooling === "cold") {
      const bath = root.getObjectByName("Cold bath water") as T.Mesh,
        ps = bath.geometry.getAttribute("position");
      for (let i = 0; i < ps.count; i++) {
        const v = new T.Vector3()
          .fromBufferAttribute(ps, i)
          .applyMatrix4(bath.matrixWorld);
        expect(Math.hypot(v.x - 0.1, v.z)).toBeGreaterThanOrEqual(0.01199);
      }
    }
    const bounds = (name: string) =>
      new T.Box3().setFromObject(root.getObjectByName(name)!);
    expect(bounds("Collected water illustrative region").max.y).toBeCloseTo(
      D.collectedSurface,
      5,
    );
    expect(D.outlet).toBeGreaterThan(D.collectedSurface);
    expect(D.outlet).toBeLessThan(D.receiverMouth);
    expect(bounds("Conical flask glass").min.y).toBeCloseTo(
      bounds("Tripod gauze").max.y,
      5,
    );
    expect(root.userData).not.toHaveProperty("expected");
    disposeWaterApparatus(root);
  }
});
test("23 scalar tasks independently match literal original quantities and signed comparisons", () => {
  const refs: Record<string, number> = {
    "w-volume": 0.025,
    "w-subtract": 0.08,
    "r-dish10": 5,
    "r-dish25": 4,
    "r-dish50": 32,
    "r-dish100": 0.3,
    "r-mem100": 60,
    "r-mem80": 56,
    "r-mem120": 66,
    "r-coast": 11,
    "r-lake": 5.5,
    "r-heatReuse": -2,
    "r-equal": 0,
    "r-repeat50": 34.2,
    "r-repeat25": 4.8,
    "r-repeat10": 3,
    "g-residue": 5,
    "g-membrane": 60,
    "g-energy": 11,
    "g-repeat": 34.2,
    "p-scaleOnly": 31,
    "vA-residue": 4.5,
    "vB-energy": 7,
  };
  expect(all.filter((q) => q.inputMode === "decimal" && !q.parts)).toHaveLength(
    23,
  );
  for (const [s, n] of Object.entries(refs)) {
    const q = all.find((q) => q.id === "water-v1-" + s)!;
    expect(Number(q.answer), s).toBe(n);
    expect(mark(q, String(n)).correct).toBe(true);
    expect(mark(q, String(n + 100)).correct).toBe(false);
  }
});
