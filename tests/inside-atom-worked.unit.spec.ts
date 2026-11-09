import { test, expect } from "@playwright/test";
import {
  insideAtomWorkedExamples,
  workedAtomShells,
  workedAtomSummary,
} from "../src/lib/inside-atom-worked";
import { lessons } from "../src/content/curriculum";

test("carbon construction adds six electrons, preserving its nucleus and mass number", () => {
  const example = insideAtomWorkedExamples.main;
  expect(example.steps).toHaveLength(3);
  expect(example.start).toEqual({ protons: 6, neutrons: 6, electrons: 0 });
  expect(example.target).toEqual({ protons: 6, neutrons: 6, electrons: 6 });
  expect(example.steps.map((step) => step.counts)).toEqual([
    { protons: 6, neutrons: 6, electrons: 0 },
    { protons: 6, neutrons: 6, electrons: 6 },
    { protons: 6, neutrons: 6, electrons: 6 },
  ]);
  expect(example.steps.map((step) => workedAtomSummary(step.counts))).toEqual([
    { atomicNumber: 6, massNumber: 12, charge: 6 },
    { atomicNumber: 6, massNumber: 12, charge: 0 },
    { atomicNumber: 6, massNumber: 12, charge: 0 },
  ]);
  expect(example.target.electrons - example.start.electrons).toBe(6);
  expect(example.target.protons).toBe(example.start.protons);
  expect(example.target.neutrons).toBe(example.start.neutrons);
  expect(example.steps[0].stateLabel).toContain("construction state");
  expect(example.steps[0].stateLabel).not.toContain("Neutral");
});

test("aluminium starts at A26 and gains exactly one neutron to reach neutral Al27", () => {
  const example = insideAtomWorkedExamples.difficult;
  const requiredNeutrons = 27 - 13;
  expect(requiredNeutrons).toBe(14);
  expect(example.steps).toHaveLength(3);
  expect(example.start).toEqual({ protons: 13, neutrons: 13, electrons: 13 });
  expect(example.target).toEqual({ protons: 13, neutrons: 14, electrons: 13 });
  expect(example.target.neutrons).toBe(requiredNeutrons);
  expect(example.target.neutrons - example.start.neutrons).toBe(1);
  expect(example.steps.map((step) => step.counts)).toEqual([
    { protons: 13, neutrons: 13, electrons: 13 },
    { protons: 13, neutrons: 14, electrons: 13 },
    { protons: 13, neutrons: 14, electrons: 13 },
  ]);
  expect(example.steps.map((step) => workedAtomSummary(step.counts))).toEqual([
    { atomicNumber: 13, massNumber: 26, charge: 0 },
    { atomicNumber: 13, massNumber: 27, charge: 0 },
    { atomicNumber: 13, massNumber: 27, charge: 0 },
  ]);
  expect(example.steps[0].stateLabel).toContain("A = 26");
  expect(example.steps[0].stateLabel).not.toContain("aluminium-27");
  expect(example.steps[1].added).toBe("neutron");
});

test("every rendered atom ledger and shell count agrees with its current construction", () => {
  for (const example of Object.values(insideAtomWorkedExamples)) {
    for (const step of example.steps) {
      const { protons, neutrons, electrons } = step.counts;
      const summary = workedAtomSummary(step.counts);
      expect(summary.atomicNumber).toBe(protons);
      expect(summary.massNumber).toBe(protons + neutrons);
      expect(summary.charge).toBe(protons - electrons);
      expect(
        workedAtomShells(electrons).reduce((sum, count) => sum + count, 0),
      ).toBe(electrons);
      for (const text of [
        step.title,
        step.before,
        step.action,
        step.after,
        step.why,
      ])
        expect(text.length).toBeGreaterThan(10);
    }
  }
  expect(workedAtomShells(0)).toEqual([]);
  expect(workedAtomShells(6)).toEqual([2, 4]);
  expect(workedAtomShells(13)).toEqual([2, 8, 3]);
});

test("wrong-particle comparisons distinguish charge, mass number and element", () => {
  const aluminium = insideAtomWorkedExamples.difficult;
  const wrongElectron = { ...aluminium.start, electrons: 14 };
  expect(workedAtomSummary(wrongElectron)).toEqual({
    atomicNumber: 13,
    massNumber: 26,
    charge: -1,
  });
  const wrongProton = { ...aluminium.start, protons: 14 };
  expect(workedAtomSummary(wrongProton)).toEqual({
    atomicNumber: 14,
    massNumber: 27,
    charge: 1,
  });
  const carbon = insideAtomWorkedExamples.main;
  expect(workedAtomSummary({ ...carbon.start, neutrons: 12 })).toEqual({
    atomicNumber: 6,
    massNumber: 18,
    charge: 6,
  });
  expect(carbon.steps[1].why).toContain("Electrons have a small mass");
  expect(aluminium.steps[2].why).toContain(
    "changes Z and therefore the element",
  );
});

test("both examples reuse guided cases and do not copy sealed assessment items", () => {
  const journey = lessons.find(
    (lesson) => lesson.slug === "inside-an-atom",
  )!.journey!;
  const reserved = [
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  for (const example of Object.values(insideAtomWorkedExamples)) {
    const guided = journey.guided.find(
      (question) => question.id === example.taskId,
    );
    expect(guided?.model?.kind).toBe("atom-build");
    expect(reserved.some((question) => question.id === example.taskId)).toBe(
      false,
    );
    for (const step of example.steps)
      expect(
        reserved.some(
          (question) =>
            question.prompt === step.before || question.prompt === step.action,
        ),
      ).toBe(false);
  }
});
