import { lessons } from "../src/content/curriculum";
import { tasks } from "../src/content/journeys/helpers";
import { exposureIds } from "../src/lib/progress";
import { test, expect } from "@playwright/test";
import {
  fuelHalfRecords,
  fuelHalfOptions,
  initialFuelHalfBoard,
  validFuelHalfBoard,
  fuelHalfPrediction,
  fuelConstructionLedger,
  fuelCombinationLedger,
  fuelHalfHistoryStep,
  type FuelHalfMode,
} from "../src/lib/fuel-half";
import { markHalfEquation, balance } from "../src/lib/half-equations";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import { fuelHalfJourney as journey } from "../src/content/journeys/fuel-half";
import { mark } from "../src/lib/marking";
import { fuelCellAsset } from "../src/lib/fuel-cell-asset";
import * as T from "three";
const modes = Object.keys(fuelHalfRecords) as FuelHalfMode[];
function complete(mode: FuelHalfMode, key: string) {
  const b = initialFuelHalfBoard(mode, key),
    r = (fuelHalfRecords[mode] as Record<string, Record<string, unknown>>)[key];
  for (const k of Object.keys(b)) if (k in r) b[k] = String(r[k]);
  if (mode === "construct") {
    b.leftCharge = "0";
    b.rightCharge = "0";
  }
  if (mode === "combine") b.cancel = "electrons-and-protons";
  return b;
}
for (const mode of modes)
  test(`${mode}: saved wrong states stay wrong and every required field is necessary across all supplied cases`, () => {
    for (const key of Object.keys(fuelHalfRecords[mode])) {
      const initial = initialFuelHalfBoard(mode, key),
        right = complete(mode, key);
      expect(validFuelHalfBoard(mode, initial)).toBe(true);
      expect(fuelHalfPrediction(mode, initial).correct).toBe(false);
      expect(fuelHalfPrediction(mode, right).correct).toBe(true);
      for (const k of Object.keys(right).filter((k) => k !== "record")) {
        const wrong = {
          ...right,
          [k]: fuelHalfOptions[mode][k]
            ? "unset"
            : String(Number(right[k]) + 1),
        };
        expect(validFuelHalfBoard(mode, wrong)).toBe(true);
        expect(fuelHalfPrediction(mode, wrong).correct).toBe(false);
        expect(fuelHalfHistoryStep(mode, right, wrong)).toBe(true);
      }
      const model = {
        kind: "fuel-half" as const,
        mode,
        instruction: "Use the supplied acidic conditions",
      };
      const history = [initialBoard(model)];
      if (key !== "initial") history.push(initial);
      for (const k of Object.keys(right))
        if (history.at(-1)![k] !== right[k])
          history.push({ ...history.at(-1)!, [k]: right[k] });
      expect(validHistory(model, history)).toBe(true);
      expect(checkBoard(model, history.at(-1)!).correct).toBe(true);
      expect(validHistory(model, [history.at(-1)!])).toBe(false);
      expect(validFuelHalfBoard(mode, { ...right, extra: "1" })).toBe(false);
      expect(validFuelHalfBoard(mode, { ...right, record: "invented" })).toBe(
        false,
      );
    }
  });
test("independent atom and charge inventories distinguish reversed process, wrong atoms and wrong electron side", () => {
  const expected: Record<string, [number, number, boolean, boolean]> = {
    initial: [0, 1, true, false],
    oxygenCharge: [2, 0, true, false],
    hydrogenAtoms: [0, 0, false, true],
    reversed: [0, 0, true, true],
    waterAtoms: [0, 0, false, true],
    wrongSide: [-2, 2, true, false],
  };
  for (const [key, [left, right, atoms, charge]] of Object.entries(expected)) {
    const r =
        fuelHalfRecords.diagnose[key as keyof typeof fuelHalfRecords.diagnose],
      ledger = balance([...r.left], [...r.right]);
    expect([
      ledger.left.charge,
      ledger.right.charge,
      ledger.atoms,
      ledger.charge,
    ]).toEqual([left, right, atoms, charge]);
    expect([r.leftCharge, r.rightCharge]).toEqual([left, right]);
  }
  for (const key of Object.keys(fuelHalfRecords.construct)) {
    const ledger = fuelConstructionLedger(key, complete("construct", key));
    expect(ledger.atoms && ledger.charge).toBe(true);
  }
});
test("combination uses independently calculated smallest common electron counts and retains the requested scale", () => {
  const refs: Record<string, number[]> = {
    initial: [2, 1, 4, 2, 1, 2],
    matched: [1, 1, 4, 2, 1, 2],
    oxygenDouble: [4, 1, 8, 4, 2, 4],
    unequal: [2, 3, 12, 6, 3, 6],
  };
  for (const [key, [hm, om, e, h, o, w]] of Object.entries(refs)) {
    const r =
      fuelHalfRecords.combine[key as keyof typeof fuelHalfRecords.combine];
    expect(2 * r.hBase * hm).toBe(e);
    expect(4 * r.oBase * om).toBe(e);
    expect([
      r.hMultiplier,
      r.oMultiplier,
      r.electrons,
      r.protons,
      r.hydrogen,
      r.oxygen,
      r.water,
    ]).toEqual([hm, om, e, e, h, o, w]);
    const ledger = fuelCombinationLedger(key, complete("combine", key));
    expect([
      ledger.remainingProtonsLeft,
      ledger.remainingProtonsRight,
      ledger.remainingElectronsLeft,
      ledger.remainingElectronsRight,
    ]).toEqual([0, 0, 0, 0]);
    expect(2 * h).toBe(2 * w);
    expect(2 * o).toBe(w);
  }
  const wrong = { ...complete("combine", "initial"), electrons: "5" };
  expect(fuelCombinationLedger("initial", wrong).remainingElectronsLeft).toBe(
    -1,
  );
  expect(wrong.electrons).toBe("5");
  expect(fuelHalfPrediction("combine", wrong).correct).toBe(false);
});
test("typed equations preserve required species, atoms, charge, process direction and smallest whole-number scale", () => {
  for (const input of [
    "H2 -> 2H+ + 2e-",
    "H₂ → 2e⁻ + 2H⁺",
    "H2(g) -> 2H+(aq) + 2e-",
  ])
    expect(markHalfEquation("fuelHydrogen", input, true).correct).toBe(true);
  for (const input of [
    "O2 + 4H+ + 4e- -> 2H2O",
    "4e- + 4H+ + O2 -> 2H2O",
    "O2(g) + 4H+(aq) + 4e- -> 2H2O(l)",
  ])
    expect(markHalfEquation("fuelOxygen", input, true).correct).toBe(true);
  for (const input of [
    "H2 -> 2H+ + e-",
    "H2 -> H+ + e-",
    "2H+ + 2e- -> H2",
    "H2(g) -> 2H+(g) + 2e-",
    "2H2 -> 4H+ + 4e-",
  ])
    expect(markHalfEquation("fuelHydrogen", input, true).correct).toBe(false);
  expect(
    markHalfEquation("fuelHydrogen", "2H2 -> 4H+ + 4e-", false).correct,
  ).toBe(true);
  expect(
    markHalfEquation("fuelOverall", "2H2 + O2 -> 2H2O", true).correct,
  ).toBe(true);
});
test("fuel-cell phase choices allow actual liquid/vapour outputs without changing earlier aqueous-electrolysis states", () => {
  for (const phase of ["l", "g"]) {
    expect(
      markHalfEquation(
        "fuelOxygen",
        `O2(g) + 4H+(aq) + 4e- -> 2H2O(${phase})`,
        true,
      ).correct,
    ).toBe(true);
    expect(
      markHalfEquation("fuelOverall", `2H2(g) + O2(g) -> 2H2O(${phase})`, true)
        .correct,
    ).toBe(true);
  }
  expect(
    markHalfEquation("fuelOxygen", "O2(g) + 4H+(aq) + 4e- -> 2H2O(s)", true)
      .correct,
  ).toBe(false);
  expect(
    markHalfEquation("hydroxide", "4OH-(aq) -> O2(g) + 2H2O(g) + 4e-", false)
      .correct,
  ).toBe(false);
});

test("all authored answers mark coherently, written work remains self-review and recovery/exposure targets are direct existing IDs", () => {
  const all = [
      ...journey.warmup,
      ...journey.refresher,
      ...journey.guided,
      ...journey.practice,
      ...journey.checkForms.flat(),
      ...journey.reviewForms.flat(),
    ],
    ids = new Set(all.map((q) => q.id));
  expect(all.length).toBe(58);
  expect(ids.size).toBe(58);
  for (const q of all) {
    const result = mark(q, q.answer);
    expect(result.correct).toBe(!q.rubric);
    if (q.rubric) expect(result.selfReview).toBe(true);
    for (const id of q.exposureAliases ?? [])
      expect(
        lessons.some((l) =>
          [
            ...l.questions,
            ...l.checks,
            ...(l.journey ? tasks(l.journey) : []),
          ].some((other) => other.id === id),
        ),
      ).toBe(true);
  }
  for (const q of journey.practice)
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  for (const q of all.filter(
    (q) => q.model?.kind === "fuel-half" && q.model.mode === "construct",
  ))
    expect(q.exposureAliases).toEqual(
      expect.arrayContaining(["fh-v1-A-hydrogen", "fh-v1-B-oxygen"]),
    );
});
test("actual geometry has separated electrode/electrolyte layers, feed and water ports, external load and correctly oriented proposed route", () => {
  for (const path of ["external-wire", "electrolyte", "gas-inlet"])
    for (const direction of ["hydrogen-to-oxygen", "oxygen-to-hydrogen"]) {
      const root = fuelCellAsset({
        carrier: "electrons",
        path,
        direction,
        hydrogenSign: "negative",
        oxygenSign: "positive",
      });
      root.updateMatrixWorld(true);
      const h = new T.Box3().setFromObject(
          root.getObjectByName("hydrogen-anode-layer")!,
        ),
        e = new T.Box3().setFromObject(
          root.getObjectByName("proton-conducting-electrolyte")!,
        ),
        o = new T.Box3().setFromObject(
          root.getObjectByName("oxygen-cathode-layer")!,
        );
      expect(h.max.x < e.min.x && e.max.x < o.min.x).toBe(true);
      for (const name of [
        "hydrogen-inlet",
        "oxygen-air-inlet",
        "water-outlet",
        "external-electrical-load",
        "hydrogen-external-wire",
        "oxygen-external-wire",
      ])
        expect(root.getObjectByName(name)).toBeTruthy();
      const arrow = root.getObjectByName("proposed-carrier-route")!;
      const tip = new T.Vector3(0, 1, 0).applyQuaternion(arrow.quaternion);
      expect(Math.sign(tip.x)).toBe(
        direction === "hydrogen-to-oxygen" ? 1 : -1,
      );
      expect(arrow.userData.path).toBe(path);
      let finite = true,
        vertices = 0;
      root.traverse((obj) => {
        if (obj instanceof T.Mesh || obj instanceof T.Line) {
          const p = obj.geometry.getAttribute("position");
          vertices += p.count;
          finite &&= [...p.array].every(Number.isFinite);
          obj.geometry.dispose();
          for (const mat of [obj.material].flat()) mat.dispose();
        }
      });
      expect(finite).toBe(true);
      expect(vertices).toBeGreaterThan(1000);
    }
});

test("shared previous teaching directly exposes the repeated cold demands without transitive assumptions", () => {
  expect(exposureIds(["cf-v1-g-reaction"])).toContain("fh-v1-p-overall");
  expect(exposureIds(["he-v1-p-carriers"])).toContain("fh-v1-A-path");
  expect(exposureIds(["fh-v1-g-hydrogen"])).toEqual(
    expect.arrayContaining(["fh-v1-A-hydrogen", "fh-v1-B-oxygen"]),
  );
});

test("all 22 numerical answers independently reconstruct atom counts, signed charges, full reaction scaling and least common multiples", () => {
  const refs: Record<string, number> = {
    "warm-positive": 2 * +1,
    "warm-electron": 4 * -1,
    "r-atoms": 2,
    "r-charge": 2 * +1 + 2 * -1,
    "r-water": 2 * 1,
    "g-combine": 4,
    "g-diagnose": 2 * +1 + -1,
    "p-h-double": 2 * 2,
    "p-o-double": 2 * 2,
    "p-h-charge": 2 * +1 + 3 * -1,
    "p-o-charge": 4 * +1 + -1,
    "p-water-count": 4 * 2,
    "p-wrong-side": 2 * -1,
    "p-matched": 4 / 4,
    "p-o-combine": 8 / 2,
    "p-unequal": 12,
    "A-water": 3 * 2,
    "A-charge": 2 * +1,
    "B-electrons": 4 * 2,
    "B-common": 24,
    "R-charge": 6 * +1 + 6 * -1,
    "S-electrons": 5 * 2,
  };
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  const numbers = all.filter(
    (q) => !q.options && !q.rubric && !q.electronEquation,
  );
  expect(numbers).toHaveLength(22);
  for (const q of numbers) expect(Number(q.answer)).toBe(refs[q.id.slice(6)]);
  const lcm = (a: number, b: number) => {
    let candidate = Math.max(a, b);
    while (candidate % a !== 0 || candidate % b !== 0) candidate++;
    return candidate;
  };
  expect(refs["g-combine"]).toBe(lcm(2, 4));
  expect(refs["p-unequal"]).toBe(lcm(6, 4));
  expect(refs["B-common"]).toBe(lcm(6, 8));
});
