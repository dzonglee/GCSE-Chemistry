import { test, expect } from "@playwright/test";
import {
  profileRecords,
  profileChoices,
  initialProfileBoard,
  validProfileBoard,
  profilePrediction,
  profileDifferences,
  profileHeight,
  validSimpleProfile,
  profileHistoryStep,
  emptyProfileDrawing,
  readProfileDrawing,
  drawingLevels,
  markProfileDrawing,
  type ProfileMode,
} from "../src/lib/reaction-profiles";
import { initialBoard, validHistory } from "../src/lib/workbench";
test("all30 profile scenarios have strict canonical fields and task-matched defaults", () => {
  let count = 0;
  for (const mode of Object.keys(profileRecords) as ProfileMode[])
    for (const record of Object.keys(profileRecords[mode])) {
      count++;
      const b = initialProfileBoard(mode, record);
      expect(validProfileBoard(mode, b)).toBe(true);
      expect(validProfileBoard(mode, { ...b, unknown: "bad" })).toBe(false);
      expect(validProfileBoard(mode, { ...b, record: "missing" })).toBe(false);
    }
  expect(count).toBe(30);
  expect(initialProfileBoard("catalyst", "endothermic")).toEqual({
    record: "endothermic",
    reactant: "20",
    product: "55",
    peak: "90",
  });
});
test("supplied differences independently match forward barrier, signed change and release magnitude", () => {
  const expected: Record<string, [number, number, string]> = {
    initial: [50, -20, "exothermic"],
    endothermic: [75, 35, "endothermic"],
    releaseSize: [40, 50, "exothermic"],
    offset: [50, -20, "exothermic"],
    zero: [50, 0, "no-net-difference"],
    highProduct: [90, 75, "endothermic"],
  };
  for (const [record, [activation, overall, classification]] of Object.entries(
    expected,
  )) {
    const b = {
      record,
      activation: String(activation),
      overall: String(overall),
      classification,
    };
    expect(profilePrediction("read", b).correct, record).toBe(true);
    expect(
      profilePrediction("read", { ...b, activation: String(activation + 5) })
        .correct,
    ).toBe(false);
    expect(
      profilePrediction("read", { ...b, overall: String(overall + 5) }).correct,
    ).toBe(false);
  }
});
test("source-based construction derives peak from reactants and product level from transfer direction", () => {
  const expected: Record<string, [number, number, number]> = {
    initial: [80, 30, 120],
    endothermic: [20, 55, 90],
    shifted: [140, 90, 180],
    fromRelease: [70, 45, 120],
    fromAbsorb: [35, 75, 95],
  };
  for (const [record, [reactant, product, peak]] of Object.entries(expected)) {
    const b = {
      record,
      reactant: String(reactant),
      product: String(product),
      peak: String(peak),
    };
    expect(profilePrediction("build", b).correct).toBe(true);
    expect(
      profilePrediction("build", { ...b, peak: String(peak - reactant) })
        .correct,
    ).toBe(false);
  }
});
test("actual curve samples have flat plateaus, exact central maximum, finite heights and smooth joins", () => {
  for (const mode of ["build", "read", "arrows", "catalyst"] as const)
    for (const r of Object.values(profileRecords[mode])) {
      expect(profileHeight(0, r)).toBe(r.reactant);
      expect(profileHeight(1, r)).toBe(r.product);
      expect(profileHeight(0.5, r)).toBe(r.peak);
      expect(profileHeight(0.05, r)).toBe(r.reactant);
      expect(profileHeight(0.95, r)).toBe(r.product);
      let maximum = -Infinity,
        finite = true;
      for (let i = 0; i <= 1000; i++) {
        const h = profileHeight(i / 1000, r);
        maximum = Math.max(maximum, h);
        finite =
          finite && Number.isFinite(h) && h >= Math.min(r.reactant, r.product);
      }
      expect(finite).toBe(true);
      expect(maximum).toBe(r.peak);
      expect(validSimpleProfile(r)).toBe(true);
      const step = 1e-6;
      expect(
        Math.abs(profileHeight(0.5 + step, r) - profileHeight(0.5 - step, r)),
      ).toBeLessThan(1e-6);
    }
  expect(() =>
    profileHeight(-0.1, { reactant: 0, product: 0, peak: 10 }),
  ).toThrow();
  expect(() =>
    profileHeight(NaN, { reactant: 0, product: 0, peak: 10 }),
  ).toThrow();
});
test("a changed zero reference or horizontal width cannot alter energy differences", () => {
  const a = { reactant: 40, product: 20, peak: 90 },
    shifted = { reactant: 140, product: 120, peak: 190 };
  expect(profileDifferences(a)).toEqual(profileDifferences(shifted));
  for (const t of [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1])
    expect(profileHeight(t, shifted) - profileHeight(t, a)).toBeCloseTo(
      100,
      10,
    );
  const wide = { ...a, wide: true };
  expect(profileHeight(0.2, wide)).toBeGreaterThan(profileHeight(0.2, a));
  expect(profileDifferences(wide)).toEqual(profileDifferences(a));
  expect(profileHeight(0.5, wide)).toBe(a.peak);
});
test("arrows reject absolute peak and product-to-peak substitutes and reversed overall direction", () => {
  for (const record of Object.keys(profileRecords.arrows)) {
    const b = {
      record,
      activationArrow: "reactants-peak",
      overallArrow: "reactants-products",
    };
    expect(profilePrediction("arrows", b).correct).toBe(true);
    for (const arrow of profileChoices.arrows.activationArrow.filter(
      (v) => v !== b.activationArrow,
    ))
      expect(
        profilePrediction("arrows", { ...b, activationArrow: arrow }).correct,
      ).toBe(false);
    for (const arrow of profileChoices.arrows.overallArrow.filter(
      (v) => v !== b.overallArrow,
    ))
      expect(
        profilePrediction("arrows", { ...b, overallArrow: arrow }).correct,
      ).toBe(false);
  }
});
test("catalyst accepts different valid lower peaks while rejecting changed endpoints or maxima below either plateau", () => {
  for (const [record, r] of Object.entries(profileRecords.catalyst))
    for (let peak = 0; peak <= 240; peak += 5) {
      const b = {
          record,
          reactant: String(r.reactant),
          product: String(r.product),
          peak: String(peak),
        },
        expected = peak > Math.max(r.reactant, r.product) && peak < r.peak;
      expect(profilePrediction("catalyst", b).correct, record + peak).toBe(
        expected,
      );
      expect(
        profilePrediction("catalyst", { ...b, product: String(r.product + 5) })
          .correct,
      ).toBe(false);
    }
});
test("all9 profile-evidence scenarios reject each unsupported claim and reason", () => {
  expect(Object.keys(profileRecords.evidence)).toHaveLength(9);
  for (const [record, r] of Object.entries(profileRecords.evidence)) {
    const b = { record, claim: r.claim, reason: r.reason };
    expect(profilePrediction("evidence", b).correct).toBe(true);
    for (const field of ["claim", "reason"] as const)
      for (const v of profileChoices.evidence[field].filter(
        (v) => v !== r[field],
      ))
        expect(
          profilePrediction("evidence", { ...b, [field]: v }).correct,
        ).toBe(false);
  }
});
test("histories preserve one5-kJ construction move or numeric prediction and atomically reset supplied scenario fields", () => {
  const m = {
      kind: "reaction-profile",
      mode: "build",
      instruction: "Construct",
    } as const,
    b = initialBoard(m);
  expect(validHistory(m, [b, { ...b, reactant: "5" }])).toBe(true);
  expect(validHistory(m, [b, { ...b, reactant: "10" }])).toBe(false);
  expect(validHistory(m, [b, { ...b, reactant: "5", peak: "5" }])).toBe(false);
  expect(
    validHistory(m, [b, initialProfileBoard("build", "endothermic")]),
  ).toBe(true);
  expect(
    validHistory(m, [b, { ...b, record: "endothermic", peak: "90" }]),
  ).toBe(false);
  const read = {
      kind: "reaction-profile",
      mode: "read",
      instruction: "Predict",
    } as const,
    r = initialBoard(read);
  expect(validHistory(read, [r, { ...r, activation: "75" }])).toBe(true);
  expect(profileHistoryStep("build", b, { ...b, reactant: "5" })).toBe(true);
  expect(profileHistoryStep("build", b, { ...b, reactant: "5.0" })).toBe(false);
});
test("independent drawing data retains invalid entries without marking or inventing a curve", () => {
  expect(readProfileDrawing("bad")).toBeNull();
  expect(readProfileDrawing("[]")).toBeNull();
  const empty = emptyProfileDrawing();
  expect(drawingLevels(empty)).toBeNull();
  expect(
    readProfileDrawing(JSON.stringify({ ...empty, peak: "not a number" }))!
      .peak,
  ).toBe("not a number");
  expect(
    drawingLevels({ ...empty, reactant: "20", product: "55", peak: "90" }),
  ).toEqual({ reactant: 20, product: 55, peak: 90 });
  expect(
    drawingLevels({ ...empty, reactant: "0x20", product: "55", peak: "90" }),
  ).toBeNull();
  expect(
    drawingLevels({ ...empty, reactant: "20", product: "55", peak: "90.5" }),
  ).toBeNull();
  expect(
    readProfileDrawing(JSON.stringify({ ...empty, unknown: "bad" })),
  ).toBeNull();
});
test("independent construction marks all levels and both arrow spans, accepts equivalent numeric notation and rejects each wrong or missing field", () => {
  const expected = {
      reactant: "25",
      product: "65",
      peak: "105",
      activationArrow: "reactants-peak",
      overallArrow: "reactants-products",
    },
    raw = JSON.stringify(expected);
  expect(markProfileDrawing(raw, raw)).toBe(true);
  expect(
    markProfileDrawing(
      JSON.stringify({ ...expected, reactant: " 25.0 ", peak: "1.05e2" }),
      raw,
    ),
  ).toBe(true);
  for (const [field, value] of [
    ["reactant", "20"],
    ["product", "60"],
    ["peak", "100"],
    ["activationArrow", "products-peak"],
    ["overallArrow", "products-reactants"],
    ["peak", ""],
    ["activationArrow", "unset"],
  ])
    expect(
      markProfileDrawing(JSON.stringify({ ...expected, [field]: value }), raw),
    ).toBe(false);
});
