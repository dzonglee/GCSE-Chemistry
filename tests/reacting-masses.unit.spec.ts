import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
import { test, expect } from "@playwright/test";
import {
  reactionMass,
  scaleReactionAmount,
  reactingCases,
  reactingChoices,
  initialReactingBoard,
  validReactingBoard,
  reactingPrediction,
  type ReactionMode,
} from "../src/lib/reacting-masses";
import { ammoniaRatioAsset } from "../src/lib/ammonia-ratio-asset";
import { reactingMassesJourney as journey } from "../src/content/journeys/reacting-masses";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
test("independent exam methods give the same required reactant and decomposition product", () => {
  expect(reactionMass(1200, 60, 1, 24, 2)).toEqual({
    givenAmount: 20,
    requestedAmount: 40,
    mass: 960,
  });
  expect((1200 * 48) / 60).toBe(960);
  expect(reactionMass(2000000, 102, 2, 32, 3).mass / 1000).toBeCloseTo(
    941.176470588,
    6,
  );
  expect((2000 * 96) / 204).toBeCloseTo(941.176470588, 6);
  expect(scaleReactionAmount(0.9, 3, 2)).toBeCloseTo(0.6, 12);
  expect(() => reactionMass(1, 0, 1, 24, 2)).toThrow();
  expect(() => scaleReactionAmount(Infinity, 1, 2)).toThrow();
  expect(() => reactionMass(1e308, 1, 1, 1e308, 2)).toThrow();
});
test("every selectable scenario has correct supported working and retains plausible coefficient-as-mass mistakes", () => {
  for (const mode of [
    "ratio",
    "forward",
    "required",
    "conserved",
  ] as ReactionMode[]) {
    const b = initialReactingBoard(mode);
    expect(validReactingBoard(mode, b)).toBe(true);
    expect(reactingPrediction(mode, b).correct).toBe(false);
    expect(validReactingBoard(mode, { ...b, extra: 1 })).toBe(false);
  }
  for (const [reaction, d] of Object.entries(reactingCases))
    for (const [i, size] of ["small", "middle", "large"].entries()) {
      const mode = reaction === "silica" ? "required" : "forward",
        r = reactionMass(
          d.masses[i],
          d.givenM,
          d.givenCoefficient,
          d.requestedM,
          d.requestedCoefficient,
        ),
        b: Record<string, string | number> =
          mode === "required"
            ? {
                size,
                unit: "kg",
                grams: String(d.masses[i]),
                givenAmount: String(r.givenAmount),
                requestedAmount: String(r.requestedAmount),
                mass: String(r.mass),
              }
            : {
                reaction,
                size,
                givenAmount: String(r.givenAmount),
                requestedAmount: String(r.requestedAmount),
                mass: String(r.mass),
              };
      expect(validReactingBoard(mode, b)).toBe(true);
      expect(reactingPrediction(mode, b).correct).toBe(true);
      expect(
        reactingPrediction(mode, {
          ...b,
          mass: String(
            (d.masses[i] * d.requestedCoefficient) / d.givenCoefficient,
          ),
        }).correct,
      ).toBe(false);
    }
  for (const scale of reactingChoices.conserved.scale) {
    const b = {
      scale,
      beforeAmount: String(4 * scale),
      afterAmount: String(2 * scale),
      beforeMass: String(34 * scale),
      afterMass: String(34 * scale),
    };
    expect(validReactingBoard("conserved", b)).toBe(true);
    expect(reactingPrediction("conserved", b).correct).toBe(true);
    expect(
      reactingPrediction("conserved", { ...b, afterAmount: b.beforeAmount })
        .correct,
    ).toBe(false);
  }
});
test("ammonia geometry contains actual conserved atoms and correct bond orders on separate sides", () => {
  const root = ammoniaRatioAsset(),
    groups = root.children;
  expect(groups.filter((x) => x.userData.side === "before")).toHaveLength(4);
  expect(groups.filter((x) => x.userData.side === "after")).toHaveLength(2);
  for (const side of ["before", "after"]) {
    const counts = { N: 0, H: 0 };
    root.traverse((x) => {
      if (x.userData.side === side && x.userData.element)
        counts[x.userData.element as "N" | "H"]++;
    });
    expect(counts).toEqual({ N: 2, H: 6 });
  }
  const nitrogen = groups.find((x) => x.userData.formula === "N2")!;
  expect(
    nitrogen.children.filter((x) => x.name.includes("-bond-")),
  ).toHaveLength(3);
  const ammonia = groups.find((x) => x.userData.formula === "NH3")!;
  expect(
    ammonia.children.filter((x) => x.name.includes("-bond-")),
  ).toHaveLength(3);
  const atoms = ammonia.children.filter((x) => x.userData.element);
  expect(atoms[0].position.y).toBeGreaterThan(atoms[1].position.y);
  expect(new Set(atoms.map((x) => x.position.z)).size).toBe(3);
});
test("47 individually authored task answers are consistent and written explanations remain self-reviewed", () => {
  expect(tasks(journey)).toHaveLength(47);
  expect(journey.practice).toHaveLength(20);
  for (const q of tasks(journey)) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    for (const w of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, w).correct, q.id).toBe(false);
  }
  const q = journey.practice.find((q) => q.id === "rm-v1-p-working")!;
  expect(
    mark(q, JSON.stringify({ given: "0.75", requested: "0.75", mass: "27" }))
      .correct,
  ).toBe(false);
});

test("new Higher route keeps strict saved numeric types and conservative legacy exposure", () => {
  const lesson = lessons.find((l) => l.slug === "reacting-masses")!;
  expect(lesson.tier).toBe("higher");
  expect(lesson.prerequisite).toBe("moles-and-reacting-masses");
  expect(lesson.questions).toHaveLength(0);
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of journey.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    w.taskModels[q.id] = [b];
  }
  p.work[lesson.slug] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels["rm-v1-g-conserved"] = [
    { ...initialReactingBoard("conserved"), scale: "1" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
  expect(exposureIds(["rm-v1-g-ratio"])).toContain(
    "moles-and-reacting-masses-4",
  );
  expect(exposureIds(["rm-v1-ca-quantity"])).toContain("rm-v1-r-coeff");
  expect(exposureIds(["rm-v1-ca-mass"])).toEqual(["rm-v1-ca-mass"]);
});
