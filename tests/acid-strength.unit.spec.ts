import { test, expect } from "@playwright/test";
import {
  strengthRecords,
  strengthChoices,
  strengthExpected,
  strengthPrediction,
  initialStrengthBoard,
  validStrengthBoard,
  type StrengthMode,
} from "../src/lib/acid-strength";
test("all31 supplied acid records have reachable predictions and individually reject incorrect claims", () => {
  let count = 0;
  for (const mode of Object.keys(strengthChoices) as StrengthMode[])
    for (const record of Object.keys(strengthRecords[mode])) {
      count++;
      const b = initialStrengthBoard(mode, record),
        expected = strengthExpected(mode, b),
        correct = { ...b, ...expected };
      expect(validStrengthBoard(mode, correct)).toBe(true);
      expect(strengthPrediction(mode, correct).correct, mode + record).toBe(
        true,
      );
      expect(strengthPrediction(mode, b).correct, mode + record).toBe(false);
      for (const [field, value] of Object.entries(expected))
        for (const wrong of strengthChoices[mode][field].filter(
          (v) => v !== "unset" && v !== value,
        ))
          expect(
            strengthPrediction(mode, { ...correct, [field]: wrong }).correct,
            mode + record + field + wrong,
          ).toBe(false);
    }
  expect(count).toBe(31);
});
test("whole-number pH factors independently agree with hydrogen-ion concentrations, including neutral and equal readings", () => {
  for (const [record, r] of Object.entries(strengthRecords.factors)) {
    const initial = 10 ** -r.start,
      final = 10 ** -r.target,
      ratio = final / initial,
      expected = strengthExpected("factors", { record });
    expect(expected.direction).toBe(
      ratio > 1 ? "increases" : ratio < 1 ? "decreases" : "unchanged",
    );
    expect(Number(expected.factor)).toBeCloseTo(Math.max(ratio, 1 / ratio), 7);
    expect(Number(expected.factor)).not.toBe(
      r.start / r.target === 1 ? 0 : r.start / r.target,
    );
  }
});
test("fully ionised monoprotic HCl dilution conserves amount and matches independent volume/concentration references", () => {
  for (const [record, r] of Object.entries(strengthRecords.dilution)) {
    const n = 10 ** -r.ph * (r.volume / 1000),
      volume = (r.volume * 10 ** r.target) / 1000,
      c = n / volume,
      ph = -Math.log10(c),
      expected = strengthExpected("dilution", { record });
    expect(Number(expected.ph)).toBeCloseTo(ph, 10);
    expect(expected.strength).toBe("still-strong");
    expect(c / 10 ** -r.ph).toBeCloseTo(1 / 10 ** r.target, 10);
    expect(Number(expected.ph)).toBeLessThanOrEqual(5);
  }
});
test("strength/concentration comparison retains complete dilute, partial concentrated and missing ionisation evidence", () => {
  expect(strengthExpected("descriptors", { record: "initial" })).toEqual({
    strength: "strong",
    concentration: "lower",
  });
  expect(strengthExpected("descriptors", { record: "weakHigher" })).toEqual({
    strength: "weak",
    concentration: "higher",
  });
  expect(strengthExpected("descriptors", { record: "unknown" })).toEqual({
    strength: "not-established",
    concentration: "lower",
  });
});
test("controlled evidence distinguishes relative ionisation, completeness, equal pH and weak dilution limitations", () => {
  expect(strengthExpected("comparison", { record: "unnamed" })).toEqual({
    hydrogen: "A",
    ph: "B",
    reason: "equal-concentration-not-completeness",
  });
  expect(
    strengthExpected("comparison", { record: "weakConcentrated" }),
  ).toEqual({
    hydrogen: "not-established",
    ph: "not-established",
    reason: "uncontrolled-concentration",
  });
  expect(strengthExpected("comparison", { record: "samePH" })).toEqual({
    hydrogen: "equal",
    ph: "equal",
    reason: "equal-ph-not-strength",
  });
  expect(strengthExpected("evidence", { record: "weakDilution" }).claim).toBe(
    "exact-ph-change-not-established",
  );
  expect(strengthExpected("evidence", { record: "sulfuric" }).reason).toBe(
    "second-dissociation-distinct",
  );
});
test("canonical saved records reject numerical coercion unsupported operations unknown properties and misleading initial pH", () => {
  const b = initialStrengthBoard("factors");
  for (const bad of [
    { ...b, ph: 4 },
    { ...b, ph: "04" },
    { ...b, ph: "15" },
    { ...b, extra: "0" },
    { ...b, record: "missing" },
    { ...b, direction: "more-acid" },
  ])
    expect(validStrengthBoard("factors", bad)).toBe(false);
  expect(initialStrengthBoard("factors", "riseThree").ph).toBe("2");
  expect(
    validStrengthBoard("dilution", {
      ...initialStrengthBoard("dilution"),
      steps: "4",
    }),
  ).toBe(false);
});
