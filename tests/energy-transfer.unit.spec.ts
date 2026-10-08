import { test, expect } from "@playwright/test";
import {
  energyRecords,
  energyChoices,
  initialEnergyBoard,
  validEnergyBoard,
  energyPrediction,
  temperatureTarget,
  traceTarget,
  symbolicEnergyLedger,
  type EnergyMode,
} from "../src/lib/energy-transfer";
import { initialBoard, validHistory } from "../src/lib/workbench";
test("all30 energy records admit strict canonical boards and reject unknown fields and records", () => {
  let count = 0;
  for (const mode of Object.keys(energyRecords) as EnergyMode[])
    for (const record of Object.keys(energyRecords[mode])) {
      count++;
      const b = initialEnergyBoard(mode, record);
      expect(validEnergyBoard(mode, b)).toBe(true);
      expect(validEnergyBoard(mode, { ...b, unknown: "bad" })).toBe(false);
      expect(validEnergyBoard(mode, { ...b, record: "missing" })).toBe(false);
    }
  expect(count).toBe(30);
});
test("symbolic transfers conserve total distribution in both directions without atoms or measured energy claims", () => {
  for (let transfer = -4; transfer <= 4; transfer++) {
    const l = symbolicEnergyLedger(transfer);
    expect(l.system + l.surroundings).toBe(12);
    expect(l.system).toBe(6 - transfer);
    expect(l.surroundings).toBe(6 + transfer);
  }
  for (const [record, r] of Object.entries(energyRecords.transfer)) {
    expect(
      energyPrediction("transfer", {
        record,
        transfer: r.direction,
        classification: r.classification,
      }).correct,
    ).toBe(true);
    expect(
      energyPrediction("transfer", {
        record,
        transfer: -r.direction,
        classification: r.classification,
      }).correct,
    ).toBe(false);
    expect(
      energyPrediction("transfer", {
        record,
        transfer: 0,
        classification: r.classification,
      }).correct,
    ).toBe(false);
  }
});
test("signed and decrease-size references independently use final minus initial including negative temperatures", () => {
  for (const [record, r] of Object.entries(energyRecords.temperature)) {
    const signed = r.extreme - r.initial,
      expected = r.quantity === "decrease-size" ? Math.abs(signed) : signed,
      target = temperatureTarget(
        record as keyof typeof energyRecords.temperature,
      );
    expect(target.answerTenths / 10).toBeCloseTo(expected, 10);
    expect(
      energyPrediction("temperature", {
        record,
        guess: Math.round(expected * 10),
        classification: r.classification,
      }).correct,
    ).toBe(true);
    expect(
      energyPrediction("temperature", {
        record,
        guess: Math.round(expected * 10) + 1,
        classification: r.classification,
      }).correct,
    ).toBe(false);
  }
  expect(temperatureTarget("nonfreezing").answerTenths).toBe(40);
  expect(temperatureTarget("cooling").answerTenths).toBe(-65);
  expect(temperatureTarget("decrease").answerTenths).toBe(55);
});
test("reaction-stage extrema rather than final room-exchange readings define the supplied trace change", () => {
  for (const [record, r] of Object.entries(energyRecords.trace)) {
    const v = traceTarget(record as keyof typeof energyRecords.trace);
    const b = {
      record,
      baseline: String(r.baseline),
      extreme: r.extreme === null ? "none" : String(r.extreme),
      guess: String(v.answerTenths),
      classification: r.classification,
      late: r.late,
    };
    expect(validEnergyBoard("trace", b)).toBe(true);
    expect(energyPrediction("trace", b).correct).toBe(true);
    if (r.extreme !== null) {
      expect(r.extreme).not.toBe(r.temperatures.length - 1);
      expect(
        energyPrediction("trace", {
          ...b,
          extreme: String(r.temperatures.length - 1),
        }).correct,
      ).toBe(false);
    }
  }
  expect(traceTarget("initial").answerTenths).toBe(120);
  expect(traceTarget("cooling").answerTenths).toBe(-70);
  expect(
    validEnergyBoard("trace", {
      ...initialEnergyBoard("trace", "stable"),
      baseline: "6",
    }),
  ).toBe(false);
});
test("application choices satisfy all independently checked numerical and electrical conditions", () => {
  for (const [record, r] of Object.entries(energyRecords.use)) {
    const valid = r.options
      .filter(
        (o) =>
          o.temperature <= r.max &&
          o.duration >= r.minDuration &&
          (!("min" in r) || o.temperature >= r.min) &&
          (record !== "activation" || o.id === "A"),
      )
      .map((o) => o.id);
    expect([...r.acceptable]).toEqual(valid);
    const selected =
      valid.length === 0 ? "neither" : valid.length === 2 ? "both" : valid[0];
    expect(
      energyPrediction("use", { record, selected, reason: "all-constraints" })
        .correct,
    ).toBe(true);
    for (const wrong of energyChoices.use.selected.filter(
      (x) => x !== selected,
    ))
      expect(
        energyPrediction("use", {
          record,
          selected: wrong,
          reason: "all-constraints",
        }).correct,
      ).toBe(false);
  }
});
test("nine evidence records reject each wrong claim and each wrong explanation", () => {
  expect(Object.keys(energyRecords.evidence)).toHaveLength(9);
  for (const [record, r] of Object.entries(energyRecords.evidence)) {
    expect(
      energyPrediction("evidence", { record, claim: r.claim, reason: r.reason })
        .correct,
    ).toBe(true);
    for (const field of ["claim", "reason"] as const)
      for (const wrong of energyChoices.evidence[field].filter(
        (x) => x !== r[field],
      ))
        expect(
          energyPrediction("evidence", {
            record,
            claim: r.claim,
            reason: r.reason,
            [field]: wrong,
          }).correct,
        ).toBe(false);
  }
});
test("native histories preserve symbolic one-step moves, direct numeric predictions and atomic supplied-record resets", () => {
  const m = {
      kind: "thermal-transfer",
      mode: "transfer",
      instruction: "Move",
    } as const,
    b = initialBoard(m);
  expect(validHistory(m, [b, { ...b, transfer: "1" }])).toBe(true);
  expect(validHistory(m, [b, { ...b, transfer: "2" }])).toBe(false);
  expect(validHistory(m, [b, initialEnergyBoard("transfer", "cooling")])).toBe(
    true,
  );
  expect(
    validHistory(m, [
      b,
      { ...b, record: "cooling", classification: "endothermic" },
    ]),
  ).toBe(false);
  const t = {
      kind: "thermal-transfer",
      mode: "temperature",
      record: "cooling",
      instruction: "Read",
    } as const,
    base = initialBoard(t);
  expect(validHistory(t, [base, { ...base, guess: "-65" }])).toBe(true);
  expect(validHistory(t, [base, { ...base, guess: "-6.5" }])).toBe(false);
});
