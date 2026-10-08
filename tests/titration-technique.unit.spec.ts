import { test, expect } from "@playwright/test";
import {
  techniqueTitre,
  selectedTitres,
  techniqueRecords,
  techniqueChoices,
  initialTechniqueBoard,
  validTechniqueBoard,
  techniquePrediction,
  techniqueRepeatRecords,
  techniqueSequenceRecords,
  type TechniqueMode,
} from "../src/lib/titration-technique";
test("precise burette differences use both readings and reject impossible or unsupported precision", () => {
  expect(techniqueTitre(4.35, 29.4)).toBe(25.05);
  expect(techniqueTitre(6.2, 28.6)).toBe(22.4);
  for (const [a, b] of [
    [-1, 20],
    [0, 51],
    [20, 10],
    [10, 10],
    [0.001, 20],
    [0, NaN],
  ])
    expect(() => techniqueTitre(a, b)).toThrow();
});
test("repeat selection includes exact thresholds and rejects close-neighbour chains", () => {
  const edge = techniqueRepeatRecords.edge,
    chain = techniqueRepeatRecords.chain;
  expect(selectedTitres(edge.readings, ["a", "b"], 10).usable).toBe(true);
  expect(selectedTitres(chain.readings, ["a", "b"], 10).usable).toBe(true);
  expect(selectedTitres(chain.readings, ["b", "c"], 10).usable).toBe(true);
  expect(selectedTitres(chain.readings, ["a", "b", "c"], 10)).toMatchObject({
    usable: false,
    spanCm3: 0.2,
    meanCm3: 20,
  });
});
test("selected arithmetic follows stated protocol and does not confuse a matching rough estimate with a careful trial", () => {
  const r = techniqueRepeatRecords.identicalRough;
  expect(selectedTitres(r.readings, ["rough", "a", "b"], 10).usable).toBe(
    false,
  );
  expect(selectedTitres(r.readings, ["a", "b"], 10)).toMatchObject({
    usable: true,
    meanCm3: 22.125,
  });
  const wider = techniqueRepeatRecords.wider;
  expect(selectedTitres(wider.readings, ["a", "b"], 20)).toMatchObject({
    usable: true,
    meanCm3: 15.35,
  });
  expect(selectedTitres(wider.readings, ["a", "b"], 10).usable).toBe(false);
  expect(selectedTitres(wider.readings, [], 20)).toMatchObject({
    usable: false,
    meanCm3: null,
    spanCm3: null,
  });
  expect(() => selectedTitres(wider.readings, ["a", "a"], 20)).toThrow();
  expect(() => selectedTitres(wider.readings, ["missing"], 20)).toThrow();
});
test("all24 records have reachable decisions while invalid saved fields and wrong directions are rejected", () => {
  let count = 0;
  for (const mode of Object.keys(techniqueRecords) as TechniqueMode[])
    for (const record of Object.keys(techniqueRecords[mode])) {
      count++;
      const b = initialTechniqueBoard(mode, record);
      expect(validTechniqueBoard(mode, b)).toBe(true);
      expect(techniquePrediction(mode, b).correct).toBe(false);
      expect(validTechniqueBoard(mode, { ...b, extra: "x" })).toBe(false);
      expect(validTechniqueBoard(mode, { ...b, record: "missing" })).toBe(
        false,
      );
      if (mode === "reading") {
        const r =
          techniqueRecords.reading[
            record as keyof typeof techniqueRecords.reading
          ];
        expect(
          techniquePrediction(mode, {
            ...b,
            guess: String(Math.round((r.final - r.initial) * 100)),
            meniscus: "bottom-eye-level",
          }).correct,
        ).toBe(true);
      }
      if (mode === "errors") {
        const r =
            techniqueRecords.errors[
              record as keyof typeof techniqueRecords.errors
            ],
          right = { ...b, direction: r.direction, reason: r.reason };
        expect(techniquePrediction(mode, right).correct).toBe(true);
        for (const wrong of techniqueChoices.errors.direction.filter(
          (x) => x !== "unset" && x !== r.direction,
        ))
          expect(
            techniquePrediction(mode, { ...right, direction: wrong }).correct,
          ).toBe(false);
      }
      if (mode === "endpoint") {
        const r =
            techniqueRecords.endpoint[
              record as keyof typeof techniqueRecords.endpoint
            ],
          right = {
            ...b,
            action: r.action,
            colour: r.colour,
            reason: r.reason,
          };
        expect(techniquePrediction(mode, right).correct).toBe(true);
        expect(
          techniquePrediction(mode, { ...right, action: "claim-exact-ph7" })
            .correct,
        ).toBe(false);
      }
      if (mode === "sequence") {
        const r =
          techniqueSequenceRecords[
            record as keyof typeof techniqueSequenceRecords
          ];
        expect(
          techniquePrediction(mode, {
            ...b,
            order: r.steps.map((_, i) => i).join(","),
          }).correct,
        ).toBe(true);
      }
    }
  expect(count).toBe(24);
});
test("diagnosing an unsuitable selected group is correct reasoning without accepting its mean", () => {
  const b = {
    ...initialTechniqueBoard("repeats", "chain"),
    selected: "a,b,c",
    decision: "no",
  };
  expect(techniquePrediction("repeats", b)).toMatchObject({
    complete: true,
    correct: true,
  });
  expect(techniquePrediction("repeats", b).explanation).toContain(
    "not an accepted mean",
  );
  expect(
    techniquePrediction("repeats", { ...b, decision: "yes" }).correct,
  ).toBe(false);
  expect(validTechniqueBoard("repeats", { ...b, selected: "b,a" })).toBe(false);
  expect(validTechniqueBoard("repeats", { ...b, selected: "a,a" })).toBe(false);
});
test("method order permits independent preparation alternatives but preserves scientific dependencies", () => {
  const b = initialTechniqueBoard("sequence");
  expect(
    techniquePrediction("sequence", { ...b, order: "0,1,2,3,4,5" }).correct,
  ).toBe(true);
  expect(
    techniquePrediction("sequence", { ...b, order: "1,0,2,3,4,5" }).correct,
  ).toBe(true);
  expect(
    techniquePrediction("sequence", { ...b, order: "0,1,2,4,3,5" }).correct,
  ).toBe(false);
  expect(validTechniqueBoard("sequence", { ...b, order: "0,1,2,3,4,4" })).toBe(
    false,
  );
  expect(validTechniqueBoard("sequence", { ...b, order: "00,1,2,3,4,5" })).toBe(
    false,
  );
});
