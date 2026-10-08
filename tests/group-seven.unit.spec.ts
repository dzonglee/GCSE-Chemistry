import { test, expect } from "@playwright/test";
import { groupSevenJourney as journey } from "../src/content/journeys/group-seven";
import { tasks } from "../src/content/journeys/helpers";
import {
  halogenParticle,
  halogenPhase,
  displacement,
} from "../src/lib/halogens";
import { mark } from "../src/lib/marking";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { decode, emptyProgress, emptyWork } from "../src/lib/progress";
test("neutral halogen pairs, atoms and halide ions have different counts, charges and notation", () => {
  expect(halogenParticle("chlorine", "atom")).toEqual({
    atomCount: 1,
    charge: 0,
    formula: "Cl",
  });
  expect(halogenParticle("chlorine", "molecule")).toEqual({
    atomCount: 2,
    charge: 0,
    formula: "Cl₂",
  });
  expect(halogenParticle("chlorine", "ion")).toEqual({
    atomCount: 1,
    charge: -1,
    formula: "Cl⁻",
  });
  expect(halogenParticle("bromine", "molecule").formula).toBe("Br₂");
  expect(halogenParticle("iodine", "ion").formula).toBe("I⁻");
  const model = journey.guided[0].model!;
  expect(checkBoard(model, initialBoard(model)).correct).toBe(false);
  expect(checkBoard(model, { representation: "molecule" }).correct).toBe(true);
  expect(checkBoard(model, { representation: "ion" }).correct).toBe(false);
});
test("all nine first-three displacement combinations follow an independently tabulated chemical order", () => {
  const reference = [
    ["chlorine", "chloride", false],
    ["chlorine", "bromide", true],
    ["chlorine", "iodide", true],
    ["bromine", "chloride", false],
    ["bromine", "bromide", false],
    ["bromine", "iodide", true],
    ["iodine", "chloride", false],
    ["iodine", "bromide", false],
    ["iodine", "iodide", false],
  ] as const;
  for (const [added, halide, reacts] of reference)
    expect(displacement(added, halide).reacts, `${added}/${halide}`).toBe(
      reacts,
    );
  expect(displacement("chlorine", "bromide")).toMatchObject({
    before: "Cl₂ + 2 Br⁻",
    after: "2 Cl⁻ + Br₂",
    liberated: "bromine",
    appearance: "Orange",
  });
  expect(displacement("iodine", "chloride")).toMatchObject({
    before: "I₂ + 2 Cl⁻",
    after: "I₂ + 2 Cl⁻",
    liberated: null,
    appearance: "Brown",
  });
  expect(displacement("bromine", "chloride").appearance).toBe("Orange");
  const model = journey.guided[2].model!;
  expect(checkBoard(model, initialBoard(model)).correct).toBe(false);
  expect(
    checkBoard(model, {
      added: "chlorine",
      halide: "bromide",
      prediction: "reaction",
    }).correct,
  ).toBe(true);
  expect(
    checkBoard(model, {
      added: "iodine",
      halide: "chloride",
      prediction: "none",
    }),
  ).toMatchObject({
    correct: false,
    feedback: expect.stringContaining("valid for your chosen mixture"),
  });
});
test("phase inference depends on supplied temperature, permits boundary coexistence and retains molecules", () => {
  expect(
    ["chlorine", "bromine", "iodine"].map((h) =>
      halogenPhase(h as "chlorine" | "bromine" | "iodine", 20),
    ),
  ).toEqual(["gas", "liquid", "solid"]);
  expect(halogenPhase("bromine", 150)).toBe("gas");
  expect(halogenPhase("iodine", 150)).toBe("liquid");
  expect(halogenPhase("iodine", 200)).toBe("gas");
  expect(halogenPhase("chlorine", -60)).toBe("liquid");
  expect(halogenPhase("chlorine", -110)).toBe("solid");
  expect(halogenPhase("iodine", 114)).toBe("solid/liquid");
  expect(halogenPhase("iodine", 184)).toBe("liquid/gas");
  expect(() => halogenPhase("iodine", NaN)).toThrow();
  const model = journey.guided[1].model!;
  expect(validBoard(model, { temperature: 150 })).toBe(true);
  expect(validBoard(model, { temperature: 151 })).toBe(false);
  expect(validBoard(model, { temperature: 230 })).toBe(false);
});
test("molecule, phase and displacement histories resume while invalid or simultaneous transitions are rejected", () => {
  for (const [i, next] of [
    [0, { representation: "molecule" }],
    [1, { temperature: 150 }],
    [2, { added: "chlorine", halide: "bromide", prediction: "reaction" }],
  ] as const) {
    const q = journey.guided[i],
      model = q.model!,
      start = initialBoard(model);
    expect(validHistory(model, [start, next])).toBe(true);
    const data = emptyProgress();
    data.work["group-seven"] = {
      ...emptyWork(),
      learning: { version: 1, stage: "guided", index: i },
      taskModels: { [q.id]: [start, next] },
    };
    expect(decode(JSON.stringify(data))).toEqual(data);
  }
  const model = journey.guided[2].model!;
  expect(
    validBoard(model, {
      added: "fluorine",
      halide: "bromide",
      prediction: "reaction",
    }),
  ).toBe(false);
  expect(
    validHistory(model, [
      initialBoard(model),
      { added: "iodine", halide: "chloride", prediction: "none" },
    ]),
  ).toBe(false);
});
test("60 reviewed tasks include cold forms, a real observation table and written electron-gain reasoning", () => {
  expect(tasks(journey)).toHaveLength(60);
  const teaching = new Set(
    [
      ...journey.warmup,
      ...journey.refresher,
      ...journey.guided,
      ...journey.practice,
    ].map((q) => q.prompt),
  );
  for (const q of tasks(journey)) {
    const result = mark(q, q.answer);
    expect(q.rubric ? result.selfReview : result.correct, q.id).toBe(true);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
    if (q.followUp)
      expect(
        journey.refresher.some((r) => r.id === q.followUp),
        q.id,
      ).toBe(true);
  }
  expect(journey.practice[7].halogenResults).toHaveLength(4);
  expect(journey.practice.at(-1)!.options).toBeUndefined();
  expect(
    mark(journey.practice.at(-1)!, "shielding gain distance"),
  ).toMatchObject({ correct: false, selfReview: true });
  for (const q of [
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ]) {
    expect(q.model).toBeUndefined();
    expect(teaching.has(q.prompt)).toBe(false);
  }
  expect(journey.checkForms[0][0].answer).toBe(String(2 * 127));
});
