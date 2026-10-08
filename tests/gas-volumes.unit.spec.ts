import { test, expect } from "@playwright/test";
import {
  rtpGasVolume,
  rtpGasMoles,
  gasMassToVolume,
  gasRatioVolume,
  methaneDryGas,
  silaneSteamGas,
  gasChoices,
  gasExpected,
  gasPrediction,
  initialGasBoard,
  validGasBoard,
  type GasMode,
} from "../src/lib/gas-volumes";
test("RTP uses24dm³ per mole and exact cubic conversion rather than24cm³", () => {
  expect(rtpGasVolume(0.3)).toBeCloseTo(7.2, 12);
  expect(rtpGasVolume(0.3, "cm3")).toBeCloseTo(7200, 10);
  expect(rtpGasMoles(1200, "cm3")).toBe(0.05);
  expect(rtpGasMoles(4.8)).toBeCloseTo(0.2, 12);
  expect(rtpGasVolume(0)).toBe(0);
});
test("mass requires whole gas formula and grams, retaining supplied official unrounded answers", () => {
  expect(gasMassToVolume(8.8, 32).volume).toBeCloseTo(6.6, 12);
  expect(gasMassToVolume(8.8, 44).volume).toBeCloseTo(4.8, 12);
  expect(gasMassToVolume(0.0088, 32, "kg").grams).toBeCloseTo(8.8, 12);
  expect(gasMassToVolume(150, 71, "kg").volume).toBeCloseTo(3600000 / 71, 9);
  expect(gasMassToVolume(100, 80, "kg").moles * 2 * 24).toBe(60000);
});
test("gas coefficient ratios work without assuming24 for unknown temperature and pressure", () => {
  expect(gasRatioVolume(15, 1, 3)).toBe(45);
  expect(gasRatioVolume(18, 3, 2)).toBe(12);
  expect(gasRatioVolume(24, 2, 1)).toBe(12);
  expect(gasRatioVolume(12, 2, 7)).toBe(42);
});
test("dry methane products include identified unused gas and exclude collected liquid water", () => {
  const r = methaneDryGas(30, 40);
  expect(r.carbonDioxide).toBe(20);
  expect(r.methaneLeft).toBe(10);
  expect(r.oxygenLeft).toBe(0);
  expect(r.totalDryGas).toBe(30);
  expect(r.waterMoles).toBeCloseTo(1 / 600, 14);
  expect(methaneDryGas(10, 30).totalDryGas).toBe(20);
  expect(methaneDryGas(10, 20).totalDryGas).toBe(10);
  expect(methaneDryGas(0, 20).totalDryGas).toBe(20);
});
test("official steam phase excludes solid but retains vapour and excess oxygen", () => {
  expect(silaneSteamGas(30, 150)).toEqual({
    steam: 90,
    fuelLeft: 0,
    oxygenLeft: 45,
    totalGas: 135,
    solidIncludedInGas: false,
  });
  expect(silaneSteamGas(20, 100).totalGas).toBe(90);
  expect(silaneSteamGas(20, 35)).toEqual({
    steam: 30,
    fuelLeft: 10,
    oxygenLeft: 0,
    totalGas: 40,
    solidIncludedInGas: false,
  });
});
test("all authored model records have reachable correct selectable predictions and strict history domains", () => {
  for (const mode of Object.keys(gasChoices) as GasMode[]) {
    const initial = initialGasBoard(mode);
    expect(validGasBoard(mode, initial)).toBe(true);
    expect(gasPrediction(mode, initial)).toMatchObject({
      correct: false,
      complete: false,
    });
    for (const record of gasChoices[mode].record)
      for (const unit of mode === "molar" ? ["cm3", "dm3"] : [undefined]) {
        const b = { ...initial, record, ...(unit ? { unit } : {}) },
          e = gasExpected(mode, b),
          selected = Object.fromEntries(
            Object.entries(e).map(([key, value]) => [
              key,
              gasChoices[mode][key].find(
                (v) =>
                  v === value ||
                  (!["reason", "identity"].includes(key) &&
                    Math.abs(Number(v) - Number(value)) < 1e-9),
              ),
            ]),
          );
        expect(Object.values(selected).every((v) => v !== undefined)).toBe(
          true,
        );
        expect(
          gasPrediction(mode, { ...b, ...selected } as Record<string, string>),
        ).toMatchObject({ correct: true, complete: true });
      }
    expect(validGasBoard(mode, { ...initial, record: 1 })).toBe(false);
    expect(validGasBoard(mode, { ...initial, extra: "initial" })).toBe(false);
  }
});
test("negative, nonfinite amounts and undefined molar-mass or coefficient divisions reject", () => {
  for (const bad of [-1, NaN, Infinity]) {
    expect(() => rtpGasVolume(bad)).toThrow();
    expect(() => methaneDryGas(10, bad)).toThrow();
  }
  for (const bad of [0, -1, NaN, Infinity]) {
    expect(() => gasMassToVolume(8, bad)).toThrow();
    expect(() => gasRatioVolume(20, bad, 2)).toThrow();
  }
  expect(() => rtpGasVolume(0.5, "litres" as "cm3")).toThrow();
});
