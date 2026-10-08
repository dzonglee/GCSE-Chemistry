import { test, expect } from "@playwright/test";
import {
  allIonTasks,
  ionTestsJourney as j,
  ionRecoveryRoutes,
} from "../src/content/journeys/ion-tests";
import {
  checkIon,
  initialIon,
  ionChoices,
  ionFields,
  ionLedger,
  ionRecords,
  validIon,
  validIonHistory,
} from "../src/lib/ion-tests";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
import {
  makeIonPortions,
  disposeIonPortions,
} from "../src/lib/ion-tests-asset";
import * as T from "three";
const lesson = lessons.find((l) => l.slug === "ion-tests")!;
test("one authored ion journey covers every source, specific recovery, groups and sealed forms", () => {
  expect(lesson.journey).toBe(j);
  expect(lesson.course).toBe("separate");
  expect(allIonTasks).toHaveLength(95);
  expect(new Set(allIonTasks.map((q) => q.id)).size).toBe(95);
  const bindings = new Set(
    allIonTasks
      .filter((q) => q.model?.kind === "ion-test-investigation")
      .map((q) => {
        const model = q.model;
        if (model?.kind !== "ion-test-investigation")
          throw new Error("Missing ion task model");
        return `${model.mode}:${model.record}`;
      }),
  );
  expect(bindings.size).toBe(35);
  for (const [record, r] of Object.entries(ionRecords))
    expect(bindings.has(`${r.mode}:${record}`)).toBe(true);
  expect(j.practiceGroups!.flatMap((g) => g.taskIds).sort()).toEqual(
    j.practice.map((q) => q.id).sort(),
  );
  for (const q of j.practice) {
    expect(ionRecoveryRoutes[q.id]?.[0]).toBe(q.followUp);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  for (const q of [...j.checkForms.flat(), ...j.reviewForms.flat()])
    expect(q.model).toBeUndefined();
  expect(j.checkForms.map((f) => f.length)).toEqual([10, 10]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([5, 5]);
  expect([...lesson.questions, ...lesson.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "ion-tests-" + i),
  );
});
test("literal independent specification contracts cover flame, hydroxide and anion methods", () => {
  for (const [record, observation, cation, claim] of [
    ["flame-k", "lilac", "potassium", "single"],
    ["flame-li", "crimson", "lithium", "single"],
    ["flame-na", "yellowFlame", "sodium", "single"],
    ["flame-ca", "orangeRed", "calcium", "single"],
    ["flame-cu", "greenFlame", "copper", "single"],
    ["flame-mixture", "yellowFlame", "sodium", "present"],
  ])
    expect(ionRecords[record].expected).toEqual({ observation, cation, claim });
  for (const [record, observation, excess, cation] of [
    ["oh-al", "whiteSolid", "dissolves", "aluminium"],
    ["oh-white", "whiteSolid", "notRecorded", "whiteGroup"],
    ["oh-camg", "whiteSolid", "remains", "calciumMagnesium"],
    ["oh-cu", "blueSolid", "remains", "copper"],
    ["oh-fe2", "greenSolid", "remains", "ironII"],
    ["oh-fe3", "brownSolid", "remains", "ironIII"],
  ])
    expect(ionRecords[record].expected).toEqual({
      observation,
      excess,
      cation,
    });
  for (const [record, acid, reagent, observation, anion] of [
    ["anion-cl", "nitric", "silver", "whiteSolid", "chloride"],
    ["anion-br", "nitric", "silver", "creamSolid", "bromide"],
    ["anion-i", "nitric", "silver", "yellowSolid", "iodide"],
    ["anion-so4", "hydrochloric", "barium", "whiteSolid", "sulfate"],
    ["anion-co3", "hydrochloric", "limewater", "cloudyGas", "carbonate"],
  ])
    expect(ionRecords[record].expected).toEqual({
      portion: "fresh",
      acid,
      reagent,
      observation,
      anion,
    });
  expect(
    checkIon("hydroxide", {
      ...initialIon("hydroxide", "oh-camg"),
      observation: "whiteSolid",
      excess: "remains",
      cation: "calcium",
    }).correct,
  ).toBe(false);
  expect(
    checkIon("flame", {
      ...initialIon("flame", "flame-mixture"),
      observation: "yellowFlame",
      cation: "sodium",
      claim: "pure",
    }).correct,
  ).toBe(false);
});
test("all actual board adapters retain scientific wrong choices and enforce single-edit anchored histories", () => {
  let wrong = 0;
  for (const [record, r] of Object.entries(ionRecords)) {
    const model = {
      kind: "ion-test-investigation" as const,
      mode: r.mode,
      record,
    };
    let b = initialIon(r.mode, record);
    const h = [b];
    expect(initialBoard(model)).toEqual(b);
    expect(checkBoard(model, b).correct).toBe(false);
    for (const field of ionFields[r.mode]) {
      b = { ...b, [field]: r.expected[field] };
      h.push(b);
    }
    expect(validHistory(model, h)).toBe(true);
    expect(checkBoard(model, b).correct).toBe(true);
    for (const field of ionFields[r.mode])
      for (const value of ionChoices[field].filter(
        (v) => v !== r.expected[field],
      )) {
        const bad = { ...b, [field]: value };
        expect(validBoard(model, bad)).toBe(true);
        expect(checkBoard(model, bad).correct).toBe(false);
        expect(bad[field]).toBe(value);
        wrong++;
      }
    expect(validIon(r.mode, { ...b, invented: "x" }, record)).toBe(false);
    expect(validIonHistory(r.mode, record, [b])).toBe(false);
    expect(
      validIonHistory(r.mode, record, [initialIon(r.mode, record), b]),
    ).toBe(false);
    expect(validHistory(model, [initialBoard(model)])).toBe(true);
    expect(Object.isFrozen(r.expected)).toBe(true);
  }
  expect(wrong).toBeGreaterThan(500);
});
test("a same-mode foreign original cannot pass the active model or progress decoder", () => {
  const model = {
    kind: "ion-test-investigation" as const,
    mode: "flame" as const,
    record: "flame-k",
  };
  const foreign = {
    ...initialIon("flame", "flame-na"),
    ...ionRecords["flame-na"].expected,
  };
  expect(validBoard(model, foreign)).toBe(false);
  expect(checkBoard(model, foreign).correct).toBe(false);
  const q = j.guided[0],
    p = emptyProgress(),
    w = emptyWork();
  p.work[lesson.slug] = {
    ...w,
    taskModels: {
      [q.id]: [
        initialBoard(q.model!),
        { ...initialBoard(q.model!), observation: "lilac" },
      ],
    },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
  p.work[lesson.slug].taskModels![q.id] = [initialIon("flame", "flame-na")];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("six hydroxide equations independently conserve metal, oxygen, hydrogen and charge", () => {
  for (const [record, charge] of [
    ["eq-cu", 2],
    ["eq-fe2", 2],
    ["eq-fe3", 3],
    ["eq-al", 3],
    ["eq-mg", 2],
    ["eq-ca", 2],
  ] as const) {
    const b = {
      ...initialIon("equation", record),
      metal: "1",
      hydroxide: String(charge),
      product: "1",
    };
    expect(checkIon("equation", b).correct).toBe(true);
    expect(ionLedger(b)).toEqual({
      metalLeft: 1,
      metalRight: 1,
      oxygenLeft: charge,
      oxygenRight: charge,
      hydrogenLeft: charge,
      hydrogenRight: charge,
      chargeLeft: 0,
      chargeRight: 0,
    });
    expect(
      checkIon("equation", {
        ...b,
        metal: "2",
        hydroxide: String(charge * 2),
        product: "2",
      }).correct,
    ).toBe(false);
    expect(
      checkIon("equation", { ...b, metal: "0", hydroxide: "0", product: "0" })
        .correct,
    ).toBe(false);
  }
  const missing = ionLedger(initialIon("equation", "eq-fe3"));
  expect(Object.values(missing).every((v) => v === null)).toBe(true);
});
test("reagent contamination and incomplete records never identify a replacement ion", () => {
  for (const [record, problem, correction] of [
    ["fault-wire", "dirtyWire", "cleanCompare"],
    ["fault-hcl", "chlorideAdded", "useNitric"],
    ["fault-h2so4", "sulfateAdded", "useHCl"],
    ["fault-white", "missingExcess", "testExcess"],
    ["fault-bubbles", "missingGasTest", "confirmGas"],
    ["fault-portion", "sharedPortion", "separate"],
  ])
    expect(ionRecords[record].expected).toEqual({
      problem,
      correction,
      claim: "invalid",
    });
  expect(ionRecords["salt-incomplete"].expected).toEqual({
    cation: "calcium",
    anion: "anionUnknown",
    formula: "unknownFormula",
  });
  for (const [record, cation, anion, formula] of [
    ["salt-kbr", "potassium", "bromide", "KBr"],
    ["salt-cacl2", "calcium", "chloride", "CaCl2"],
    ["salt-cuso4", "copper", "sulfate", "CuSO4"],
    ["salt-k2so4", "potassium", "sulfate", "K2SO4"],
    ["salt-na2co3", "sodium", "carbonate", "Na2CO3"],
  ])
    expect(ionRecords[record].expected).toEqual({ cation, anion, formula });
});
test("authored numeric constructions mark actual coefficients; extended plans remain honest self-review", () => {
  for (const q of allIonTasks) {
    if (q.parts) {
      expect(mark(q, q.answer).correct).toBe(true);
      const b = JSON.parse(q.answer);
      b.hydroxide = "1";
      expect(mark(q, JSON.stringify(b)).correct).toBe(false);
      expect(mark(q, '{"metal":"1"}').invalid).toBe(true);
    } else if (q.rubric) {
      const result = mark(q, q.answer);
      expect(result.correct).toBe(false);
      expect(result.selfReview).toBe(true);
    } else {
      expect(mark(q, q.answer).correct).toBe(true);
      for (const option of q.options!.filter((v) => v !== q.answer))
        expect(mark(q, option).correct).toBe(false);
    }
  }
});
test("legacy exposure and direct related reasoning remain globally conservative", () => {
  expect(exposureIds(["if-v1-p-halide"])).toContain("ion-tests-v1-cA-formula");
  expect(exposureIds(["ion-tests-v1-w-ratio"])).toContain("if-v1-p-halide");
  expect(exposureIds(["gas-tests-v1-p-cloudy"])).toContain(
    "ion-tests-v1-w-co2",
  );
  expect(exposureIds(["ion-tests-v1-w-co2"])).toContain(
    "gas-tests-v1-p-cloudy",
  );
  const bank = [...lesson.questions, ...lesson.checks];
  for (const q of bank) {
    expect(q.exposureAliases?.some((a) => a.startsWith("ion-tests-v1-"))).toBe(
      true,
    );
    expect(exposureIds([q.id])).toContain(q.id);
  }
  expect(exposureIds(["ion-tests-v1-r-excess"])).toContain(
    "ion-tests-v1-cB-excess",
  );
  expect(exposureIds(["ion-tests-v1-p-camg"])).toContain(
    "ion-tests-v1-vA-white",
  );
});
test("actual 3D portions keep unchosen and wrong selection states without fabricated observations", () => {
  for (const portion of ["", "fresh", "reused"]) {
    const b = {
      ...initialIon("anion", "anion-cl"),
      portion,
      acid: "hydrochloric",
    };
    const root = makeIonPortions(b),
      nodes = new Map<string, T.Object3D>();
    root.traverse((o) => nodes.set(o.name, o));
    expect(root.userData.observationsSimulated).toBe(false);
    expect(root.userData.acid).toBe("hydrochloric");
    expect(root.userData).not.toHaveProperty("expected");
    expect(root.userData).not.toHaveProperty("observation");
    const barBox = new T.Box3().setFromObject(
      nodes.get("Connected upper rack bar")!,
    );
    const baseBox = new T.Box3().setFromObject(nodes.get("Rack base")!);
    for (const x of [-0.069, 0.069]) {
      const uprightBox = new T.Box3().setFromObject(
        nodes.get(`Rack upright ${x}`)!,
      );
      expect(uprightBox.intersectsBox(barBox)).toBe(true);
      expect(uprightBox.intersectsBox(baseBox)).toBe(true);
    }
    for (const [i, x] of [-0.048, 0, 0.048].entries()) {
      const tube = nodes.get(`Open portion tube ${i + 1}`)!;
      expect(tube.position.x).toBe(x);
      const liquidBox = new T.Box3().setFromObject(
        nodes.get(`Original aqueous portion ${i + 1}`)!,
      );
      expect(liquidBox.min.y).toBeGreaterThan(0.01);
      expect(liquidBox.max.y).toBeLessThan(0.12);
      expect(liquidBox.max.x).toBeLessThan(x + 0.008);
      expect(liquidBox.min.x).toBeGreaterThan(x - 0.008);
    }
    if (portion) {
      const box = new T.Box3().setFromObject(
        nodes.get("Selected dropping pipette")!,
      );
      expect(box.min.y).toBeGreaterThan(0.12);
      expect(root.userData.selectedTube).toBe(portion === "fresh" ? 1 : 2);
    } else expect(nodes.has("Selected dropping pipette")).toBe(false);
    for (const o of nodes.values())
      if (o instanceof T.Mesh) {
        const p = o.geometry.getAttribute("position");
        for (let i = 0; i < p.count; i++)
          expect([p.getX(i), p.getY(i), p.getZ(i)].every(Number.isFinite)).toBe(
            true,
          );
      }
    disposeIonPortions(root);
  }
});
