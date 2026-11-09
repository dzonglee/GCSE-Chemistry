import { test, expect } from "@playwright/test";
import {
  liveRelativeMassPopulation,
  relativeMassMainSteps,
  relativeMassCountPopulation,
  relativeMassCountSteps,
  relativeMassPosition,
} from "../src/lib/relative-atomic-mass-worked";

test("every available slider setting uses the actual population and its independently derived mean", () => {
  for (let light = 0; light <= 100; light += 5) {
    const population = liveRelativeMassPopulation(light);
    const representedMasses = [
      ...Array<number>(light).fill(35),
      ...Array<number>(100 - light).fill(37),
    ];
    const independentTotal = representedMasses.reduce(
      (sum, mass) => sum + mass,
      0,
    );
    expect(population.counts).toEqual([light, 100 - light]);
    expect(population.contributions).toEqual([35 * light, 37 * (100 - light)]);
    expect(population.totalAtoms).toBe(representedMasses.length);
    expect(population.totalContribution).toBe(independentTotal);
    expect(population.mean).toBe(independentTotal / representedMasses.length);
    expect(population.mean).toBeCloseTo(37 - light / 50, 10);
    expect(population.mean).toBeGreaterThanOrEqual(35);
    expect(population.mean).toBeLessThanOrEqual(37);
    const steps = relativeMassMainSteps(light);
    expect(steps).toHaveLength(3);
    expect(steps[0].after).toContain(`${light} mass-35 atoms`);
    expect(steps[1].after).toContain(`35 × ${light} = ${35 * light}`);
    expect(steps[1].after).toContain(
      `37 × ${100 - light} = ${37 * (100 - light)}`,
    );
    expect(steps[2].after).toContain(
      `${independentTotal} ÷ 100 = ${population.mean}`,
    );
  }
});

test("main case retains the reviewed equal population and 75/25 worked calculations", () => {
  expect(liveRelativeMassPopulation(50)).toMatchObject({
    contributions: [1750, 1850],
    totalContribution: 3600,
    mean: 36,
  });
  expect(liveRelativeMassPopulation(75)).toMatchObject({
    contributions: [2625, 925],
    totalContribution: 3550,
    mean: 35.5,
  });
  const steps = relativeMassMainSteps(75);
  expect(steps[0].before).toContain("(1750 + 1850) ÷ 100 = 36");
  expect(steps[0].action).toContain("75%");
  expect(steps[1].after).toContain("2625 + 925 = 3550");
  expect(steps[2].after).toContain("3550 ÷ 100 = 35.5");
  expect(steps[2].why).toContain(
    "not the mass number of a new atom or a fractional neutron",
  );
  expect(steps[2].why).toContain("no unit");
});

test("endpoint and equal-population explanations do not claim a strictly interior mean", () => {
  for (const light of [0, 50, 100]) {
    expect(relativeMassPosition(light)).not.toContain("strictly between");
    expect(relativeMassPosition(light)).not.toContain("below");
    expect(relativeMassPosition(light)).not.toContain("above");
  }
  expect(relativeMassPosition(0)).toContain("mean equals 37");
  expect(relativeMassPosition(100)).toContain("mean equals 35");
  expect(relativeMassPosition(50)).toContain("halfway value, 36");
  for (let light = 5; light < 100; light += 5) {
    if (light === 50) continue;
    expect(relativeMassPosition(light)).toContain("strictly between 35 and 37");
    expect(relativeMassPosition(light)).toContain(
      light > 50 ? "below" : "above",
    );
    expect(relativeMassPosition(light)).toContain(
      light > 50 ? "closer to 35" : "closer to 37",
    );
  }
});

test("count variant totals actual atoms, reveals each calculation in order and keeps its denominator", () => {
  const atoms = [30, 30, 30, 30, 30, 30, 32, 32, 32, 32];
  const sum = atoms.reduce((total, mass) => total + mass, 0);
  expect(relativeMassCountPopulation.counts).toEqual([6, 4]);
  expect(relativeMassCountPopulation.contributions).toEqual([180, 128]);
  expect(relativeMassCountPopulation.totalAtoms).toBe(atoms.length);
  expect(relativeMassCountPopulation.totalContribution).toBe(sum);
  expect(relativeMassCountPopulation.mean).toBe(sum / atoms.length);
  expect(relativeMassCountPopulation.mean).toBe(30.8);
  expect(30.8 - 30).toBeLessThan(32 - 30.8);
  expect(relativeMassCountSteps).toHaveLength(3);
  expect(relativeMassCountSteps[0].after).toContain("6 + 4 = 10");
  expect(JSON.stringify(relativeMassCountSteps[0])).not.toContain("308");
  expect(JSON.stringify(relativeMassCountSteps[0])).not.toContain("30.8");
  expect(relativeMassCountSteps[1].after).toContain("180 + 128 = 308");
  expect(JSON.stringify(relativeMassCountSteps[1])).not.toContain("30.8");
  expect(relativeMassCountSteps[2].after).toContain("308 ÷ 10 = 30.8");
  expect(relativeMassCountSteps[2].why).toContain(
    "3.08, outside the supplied mass range",
  );
  expect(relativeMassCountSteps[2].why).toContain("no unit");
});

test("invalid live percentages fail explicitly instead of presenting invented arithmetic", () => {
  for (const value of [NaN, Infinity, -Infinity, -5, 105])
    expect(() => liveRelativeMassPopulation(value)).toThrow(
      "between 0 and 100",
    );
});
