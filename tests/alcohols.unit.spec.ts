import { test, expect } from "@playwright/test";
import {
  alcoholJourney as journey,
  alcoholRecovery,
} from "../src/content/journeys/alcohols";
import {
  alcoholRecords,
  organicStructures,
  type AlcoholMode,
} from "../src/lib/alcohols";
import {
  initialAlcoholBoard,
  expectedAlcoholBoard,
  checkAlcoholBoard,
  alcoholHistoryStep,
  validAlcoholBoard,
  alcoholAtomTotals,
  fuelReference,
} from "../src/lib/alcohol-board";
import { initialBoard, validBoard, validHistory } from "../src/lib/workbench";
import {
  emptyOrganicDrawing,
  readOrganicDrawing,
  drawingOrganicCounts,
} from "../src/lib/organic-drawing";
import { emptyFuelDrawing, readFuelDrawing } from "../src/lib/fuel-drawing";
import { fuelPlots } from "../src/lib/alcohols";
import { mark, displayResponse } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
const all = [
  ...journey.warmup,
  ...journey.refresher,
  ...journey.guided,
  ...journey.practice,
  ...journey.checkForms.flat(),
  ...journey.reviewForms.flat(),
];
test("all93 demands retain first-four scope, literal numeric references and honest independent drawings", () => {
  expect(all).toHaveLength(93);
  expect(new Set(all.map((t) => t.id)).size).toBe(93);
  const refs: Record<string, number> = {
    "w-mass": 1.2,
    "r-acid-carbon": 2,
    "r-methanol-h": 4,
    "g-structure": 4,
    "g-combustion": 3,
    "g-fuel": 10,
    "p-name-alcohol": 10,
    "p-name-acid": 6,
    "p-ethanol-o": 3,
    "p-propanol-o": 9,
    "p-butanol-water": 5,
    "p-fuel-a": 1.2,
    "p-fuel-b": 14,
    "p-energy": 1.25,
    "p-percent": 315,
    "p-ferment-percent": 220,
    "a-o": 3,
    "a-fuel": 15,
    "a-percent": 210,
    "b-o": 3,
    "b-fuel": 7.5,
    "ra-h": 2,
    "ra-fuel": 16,
    "rb-carbon": 4,
  };
  expect(all.filter((t) => !t.options && !t.rubric)).toHaveLength(24);
  for (const [id, n] of Object.entries(refs))
    expect(Number(all.find((t) => t.id === "alc-v1-" + id)!.answer)).toBe(n);
  for (const t of all) {
    if (t.rubric) {
      expect(
        mark(
          t,
          t.fuelDrawing
            ? JSON.stringify({
                ...emptyFuelDrawing(t.fuelDrawing.data),
                p0x: "1",
              })
            : t.organicDrawing
              ? JSON.stringify({ ...emptyOrganicDrawing(), n: "1" })
              : t.answer,
        ).selfReview,
      ).toBe(true);
      expect(mark(t, t.answer).correct).toBe(false);
    } else expect(mark(t, t.answer).correct).toBe(true);
  }
  expect(all.filter((t) => t.rubric)).toHaveLength(15);
  expect(journey.checkForms.map((f) => f.length)).toEqual([8, 8]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  expect(
    [...journey.checkForms.flat(), ...journey.reviewForms.flat()].every(
      (t) => !t.model,
    ),
  ).toBe(true);
});
for (const mode of Object.keys(alcoholRecords) as AlcoholMode[])
  test(
    mode +
      " validates every selected schema, native history and incorrect proposals",
    () => {
      for (const id of Object.keys(alcoholRecords[mode])) {
        const m = { kind: "alcohol" as const, mode, record: id },
          b = initialAlcoholBoard(mode, id),
          e = expectedAlcoholBoard(mode, id);
        expect(validBoard(m, b)).toBe(true);
        expect(initialBoard(m)).toEqual(b);
        expect(checkAlcoholBoard(mode, e).correct).toBe(true);
        expect(validAlcoholBoard(mode, { ...b, extra: "" })).toBe(false);
        expect(validAlcoholBoard(mode, { ...b, record: "constructor" })).toBe(
          false,
        );
        const h = [b];
        let last = b;
        for (const k of Object.keys(e)) {
          if (e[k] === last[k]) continue;
          last = { ...last, [k]: e[k] };
          expect(alcoholHistoryStep(mode, h.at(-1), last)).toBe(true);
          h.push(last);
        }
        expect(validHistory(m, h)).toBe(true);
        expect(checkAlcoholBoard(mode, b).correct).toBe(false);
        expect(validHistory(m, [b, e])).toBe(false);
      }
    },
  );
test("every actual OH/COOH construction has literal formulas and equivalent H slots", () => {
  const refs: Record<string, number[]> = {
    initial: [1, 4, 1],
    ethanol: [2, 6, 1],
    propanol: [3, 8, 1],
    butanol: [4, 10, 1],
    methanoic: [1, 2, 2],
    ethanoic: [2, 4, 2],
    propanoic: [3, 6, 2],
    butanoic: [4, 8, 2],
  };
  for (const [id, r] of Object.entries(organicStructures)) {
    const e = expectedAlcoholBoard("structure", id),
      d = {
        ...emptyOrganicDrawing(),
        ...Object.fromEntries(
          Object.entries(e).filter(([k]) => /^h\d+$/.test(k)),
        ),
        n: String(r.n),
        hydroxyl: e.hydroxyl,
        oxygenH: e.oxygenH,
        carbonyl: e.carbonyl,
      },
      count = drawingOrganicCounts(d);
    expect([count.C, count.H, count.O]).toEqual(refs[id]);
    const alt = { ...e };
    for (let c = 0; c < r.n; c++)
      for (let s = 0; s < 4; s++)
        alt["h" + (4 * c + s)] = e["h" + (4 * c + 3 - s)];
    expect(checkAlcoholBoard("structure", alt).correct).toBe(true);
    expect(
      checkAlcoholBoard("structure", { ...e, oxygenH: "no" }).correct,
    ).toBe(false);
  }
});
test("alcohol combustion includes fuel oxygen and exact positive whole coefficient multiples", () => {
  for (const id of Object.keys(alcoholRecords.combustion)) {
    const e = expectedAlcoholBoard("combustion", id),
      t = alcoholAtomTotals(id, e),
      double = { ...e };
    expect(t.before).toEqual(t.after);
    for (const k of ["fuel", "oxygen", "carbon", "water"])
      double[k] = String(Number(e[k]) * 2);
    expect(alcoholHistoryStep("combustion", e, double)).toBe(true);
    expect(alcoholHistoryStep("combustion", double, e)).toBe(true);
    expect(checkAlcoholBoard("combustion", double).correct).toBe(true);
    expect(
      checkAlcoholBoard("combustion", {
        ...e,
        fuel: "0",
        oxygen: "0",
        carbon: "0",
        water: "0",
      }).correct,
    ).toBe(false);
  }
});
test("fuel measurements normalize actual consumed mass and do not convert degrees into energy", () => {
  expect(fuelReference("initial")).toEqual({
    massA: "1.2",
    massB: "1",
    riseA: "12",
    riseB: "14",
    normA: "10",
    normB: "14",
  });
  expect(fuelReference("reversed").normB).toBe("12.5");
  expect(fuelReference("equalEnergy").mass).toBe("1.25");
  expect(expectedAlcoholBoard("fuel", "unequalWater").judgement).toBe(
    "notComparableFromRiseAlone",
  );
  expect(expectedAlcoholBoard("fuel", "heatLoss").limitation).toBe(
    "heatLossNotRemovedByRepeats",
  );
});
test("plot coordinate-pair operation is local; curves/estimates never receive false examiner marks", () => {
  const b = initialAlcoholBoard("plot");
  expect(alcoholHistoryStep("plot", b, { ...b, p0x: "2", p0y: "30" })).toBe(
    true,
  );
  expect(alcoholHistoryStep("plot", b, { ...b, p0x: "2", p1y: "30" })).toBe(
    false,
  );
  expect(
    alcoholHistoryStep("plot", b, { ...b, p0x: "2", p0y: "30", c0: "30" }),
  ).toBe(false);
  const e = expectedAlcoholBoard("plot");
  const near = { ...e, p0x: "2.1", p0y: "30.2" };
  expect(checkAlcoholBoard("plot", near).correct).toBe(true);
  expect(near.p0x).toBe("2.1");
  expect(near.p0y).toBe("30.2");
  expect(checkAlcoholBoard("plot", { ...e, p0x: "2.11" }).correct).toBe(false);
  expect(checkAlcoholBoard("plot", { ...e, p0y: "30.21" }).correct).toBe(false);
  expect(
    checkAlcoholBoard("plot", { ...e, c0: "999", estimate: "999" }).correct,
  ).toBe(true);
  expect(checkAlcoholBoard("plot", { ...e, p0y: "999" }).correct).toBe(false);
  expect(checkAlcoholBoard("plot", e).message).toContain("does NOT mark");
});
test("independent responses retain hidden flags and invalid saved originals without fake marking", () => {
  const d = { ...emptyOrganicDrawing(), n: "4", h15: "yes", oxygenH: "yes" },
    raw = JSON.stringify(d);
  expect(readOrganicDrawing(raw)).toEqual(d);
  expect(readOrganicDrawing(JSON.stringify({ ...d, n: "1" }))!.h15).toBe("yes");
  expect(readOrganicDrawing("{broken")).toBeNull();
  const f = emptyFuelDrawing(fuelPlots.initial);
  f.p0x = "1.";
  expect(readFuelDrawing(JSON.stringify(f), fuelPlots.initial)!.p0x).toBe("1.");
  const q = journey.practice.find((t) => t.organicDrawing)!;
  expect(mark(q, raw).feedback).toContain("Compare your structure");
  expect(displayResponse(q, raw)).not.toContain('"h15"');
  const graph = journey.practice.find((t) => t.fuelDrawing)!;
  expect(graph.fuelDrawing!.data.yUnit).toBe("kJ/g");
  expect(graph.answer).toContain("kJ/g");
  expect(mark(graph, JSON.stringify(f)).feedback).toContain(
    "Compare your graph",
  );
  expect(mark(graph, JSON.stringify(f)).selfReview).toBe(true);
});
test("practice recovery and direct legacy demand links are complete without transitive expansion", () => {
  for (const q of journey.practice) {
    expect(alcoholRecovery[q.id][0]).toBe(q.followUp);
    for (const id of alcoholRecovery[q.id])
      expect(all.some((t) => t.id === id)).toBe(true);
  }
  const lesson = lessons.find((l) => l.slug === "alcohols-and-acids")!;
  expect(lesson.course).toBe("separate");
  expect(lesson.journey).toBe(journey);
  expect(all.find((t) => t.id === "alc-v1-r-oh")!.exposureAliases).toContain(
    "alcohols-and-acids-0",
  );
  expect(all.find((t) => t.id === "alc-v1-r-weak")!.exposureAliases).toContain(
    "alcohols-and-acids-5",
  );
  expect(
    all.find((t) => t.id === "alc-v1-p-multiple")!.exposureAliases,
  ).toContain("alk-v1-p-multiple");
  expect(all.find((t) => t.id === "alc-v1-a-o")!.exposureAliases).not.toContain(
    "alk-v1-p-multiple",
  );
});

test("displayed H-slot markers remain separate for all first-four carbon scaffolds", async () => {
  const { organicAttachment } =
    await import("../src/components/OrganicDisplayed");
  for (let n = 1; n <= 4; n++) {
    const slots = Array.from({ length: n * 4 }, (_, i) =>
      organicAttachment(n, Math.floor(i / 4), i % 4),
    );
    for (let i = 0; i < slots.length; i++)
      for (let j = i + 1; j < slots.length; j++)
        expect(
          Math.hypot(slots[i][0] - slots[j][0], slots[i][1] - slots[j][1]),
        ).toBeGreaterThanOrEqual(34);
  }
});

test("seven named practice groups contain all45 reviewed demands exactly once", () => {
  const ids = journey.practiceGroups!.flatMap((g) => g.taskIds);
  expect(journey.practiceGroups).toHaveLength(7);
  expect(ids).toHaveLength(45);
  expect(new Set(ids).size).toBe(45);
  expect([...ids].sort()).toEqual(journey.practice.map((t) => t.id).sort());
});
