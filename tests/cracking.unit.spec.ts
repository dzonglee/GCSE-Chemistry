import { test, expect } from "@playwright/test";
import {
  crackingJourney as journey,
  crackingRecovery,
} from "../src/content/journeys/cracking";
import {
  crackingRecords,
  canonicalHydrogens,
  mirroredDouble,
  type CrackingMode,
} from "../src/lib/cracking";
import {
  initialCrackingBoard,
  expectedCrackingBoard,
  checkCrackingBoard,
  crackingHistoryStep,
  structureValences,
  crackingBalanceTotals,
} from "../src/lib/cracking-board";
import { initialBoard, validBoard, validHistory } from "../src/lib/workbench";
import {
  emptyAlkeneDrawing,
  readAlkeneDrawing,
  activeAlkeneDouble,
} from "../src/lib/alkene-drawing";
import { mark, displayResponse } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
for (const mode of Object.keys(crackingRecords) as CrackingMode[])
  test(mode + " selected-record schemas reject corrupt histories", () => {
    const m = { kind: "cracking" as const, mode, instruction: "Construct" };
    for (const id of Object.keys(crackingRecords[mode])) {
      const i = initialCrackingBoard(mode, id),
        e = expectedCrackingBoard(mode, id);
      expect(validBoard(m, i)).toBe(true);
      expect(validBoard(m, e)).toBe(true);
      expect(validBoard(m, { ...i, extra: "" })).toBe(false);
      expect(validBoard(m, { ...i, record: "constructor" })).toBe(false);
      expect(
        validHistory(m, [initialBoard(m), ...(id === "initial" ? [] : [i])]),
      ).toBe(true);
      expect(validHistory(m, [initialBoard(m), e])).toBe(false);
      expect(checkCrackingBoard(mode, e).correct).toBe(true);
      for (const key of Object.keys(i))
        expect(validBoard(m, { ...i, [key]: null })).toBe(false);
    }
  });
test("literal atom references and repeated molecular formulas conserve both elements", () => {
  for (const [id, c, h] of [
    ["initial", 2, 4],
    ["twoAlkenes", 4, 8],
    ["nineCarbon", 4, 8],
  ] as const) {
    const b = expectedCrackingBoard("balance", id);
    expect([Number(b.carbons), Number(b.hydrogens)]).toEqual([c, h]);
    const t = crackingBalanceTotals(id, b);
    expect(t.before).toEqual(t.after);
  }
  for (const [id, ratio] of [
    ["sixCarbon", [1, 1, 1]],
    ["tenCarbon", [1, 1, 2]],
    ["sixteenCarbon", [1, 1, 2]],
  ] as const) {
    const b = expectedCrackingBoard("balance", id);
    expect([+b.feed, +b.alkane, +b.alkene]).toEqual(ratio);
    expect(
      checkCrackingBoard("balance", {
        ...b,
        feed: "0",
        alkane: "0",
        alkene: "0",
      }).correct,
    ).toBe(false);
  }
});
test("exact global coefficient changes admit balanced multiples and reject arbitrary batch edits", () => {
  const b = expectedCrackingBoard("balance", "tenCarbon"),
    d = { ...b, feed: "2", alkane: "2", alkene: "4" };
  expect(crackingHistoryStep("balance", b, d)).toBe(true);
  expect(crackingHistoryStep("balance", d, b)).toBe(true);
  expect(checkCrackingBoard("balance", d).correct).toBe(true);
  expect(
    crackingHistoryStep("balance", b, {
      ...b,
      feed: "2",
      alkane: "3",
      alkene: "5",
    }),
  ).toBe(false);
});
test("local valence admits reversed chains and equivalent displayed H orientation", () => {
  for (const [id, n, pos] of [
    ["initial", 2, 0],
    ["propene", 3, 0],
    ["but1", 4, 0],
    ["but2", 4, 1],
    ["pent1", 5, 0],
    ["pent2", 5, 1],
  ] as const) {
    const b = expectedCrackingBoard("structure", id),
      r: Record<string, string> = {
        ...b,
        double: String(mirroredDouble(n, pos)),
      };
    for (let c = 0; c < n; c++)
      for (let slot = 0; slot < 4; slot++)
        r["h" + (4 * c + slot)] = canonicalHydrogens(n, +r.double, c).includes(
          slot,
        )
          ? "yes"
          : "no";
    expect(checkCrackingBoard("structure", r).correct).toBe(true);
    expect(structureValences(n, r).every((x) => x.total === 4)).toBe(true);
  }
  const p = expectedCrackingBoard("structure", "propene");
  expect(
    checkCrackingBoard("structure", { ...p, h10: "yes", h11: "no" }).correct,
  ).toBe(true);
  expect(checkCrackingBoard("structure", { ...p, h6: "yes" }).correct).toBe(
    false,
  );
});
test("supplied mixtures and failed controls do not turn into unique formulas", () => {
  for (const [id, verdict] of [
    ["mixture", "unsaturationPresent"],
    ["blankFailed", "unreliable"],
    ["positiveFailed", "unreliable"],
    ["spent", "unreliable"],
  ] as const) {
    const b = expectedCrackingBoard("bromine", id);
    expect(b.verdict).toBe(verdict);
    expect(
      checkCrackingBoard("bromine", { ...b, verdict: "alkeneSupported" })
        .correct,
    ).toBe(false);
  }
  expect(
    checkCrackingBoard("process", {
      ...expectedCrackingBoard("process", "either"),
      contact: "steam",
    }).correct,
  ).toBe(true);
});
test("independent drawings retain hidden H and C=C choices without automatic marking", () => {
  const d = { ...emptyAlkeneDrawing(), n: "5", double: "3", h16: "yes" },
    small = { ...d, n: "2" };
  expect(activeAlkeneDouble(small)).toBeNull();
  expect(readAlkeneDrawing(JSON.stringify(small))).toEqual(small);
  expect(activeAlkeneDouble({ ...small, n: "5" })).toBe(3);
  expect(readAlkeneDrawing(JSON.stringify({ ...d, extra: "no" }))).toBeNull();
  for (const q of journey.practice.filter((q) => q.rubric)) {
    expect(
      mark(q, q.alkeneDrawing ? JSON.stringify(d) : q.answer),
    ).toMatchObject({ correct: false, selfReview: true });
    if (q.alkeneDrawing)
      expect(displayResponse(q, JSON.stringify(d))).toContain("5 carbon atoms");
  }
});
test("all numerical answers have literal independent references and every practice has targeted recovery", () => {
  const refs: Record<string, string> = {
      "w-coefficient": "12",
      "r-ethene-h": "2",
      "r-formula": "10",
      "r-subscript": "4",
      "r-repeated": "8",
      "g-rearrange": "14",
      "g-structure": "4",
      "g-balance": "4",
      "p-feed-h": "22",
      "p-other-cut": "2",
      "p-methane-pair": "10",
      "p-propene-h": "1",
      "p-but2-h": "1",
      "p-formula-seven": "14",
      "p-nine-formula": "4",
      "p-two-alkenes": "8",
      "p-ten-coeff": "2",
      "a-missing-h": "6",
      "a-repeated": "2",
      "b-missing-c": "4",
      "b-repeated": "8",
      "ra-formula": "8",
      "rb-repeated": "8",
    },
    all = [
      ...journey.warmup,
      ...journey.refresher,
      ...journey.guided,
      ...journey.practice,
      ...journey.checkForms.flat(),
      ...journey.reviewForms.flat(),
    ];
  expect(all).toHaveLength(81);
  for (const q of all.filter((q) => !q.options && !q.rubric)) {
    expect(q.answer, q.id).toBe(refs[q.id.replace("crk-v1-", "")]);
    delete refs[q.id.replace("crk-v1-", "")];
  }
  expect(refs).toEqual({});
  for (const q of journey.practice) {
    expect(crackingRecovery[q.id.replace("crk-v1-", "")]).toBeTruthy();
    expect(journey.refresher.some((t) => t.id === q.followUp)).toBe(true);
  }
  for (const q of journey.checkForms.flat().concat(journey.reviewForms.flat()))
    expect(q.model).toBeUndefined();
});
test("legacy and actual prior-demand links are direct, not transitive", () => {
  const pool = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey
        ? [
            ...l.journey.warmup,
            ...l.journey.refresher,
            ...l.journey.guided,
            ...l.journey.practice,
            ...l.journey.checkForms.flat(),
            ...l.journey.reviewForms.flat(),
          ]
        : []),
    ]),
    get = (id: string) => pool.find((q) => q.id === id)!;
  expect(get("crk-v1-g-balance").exposureAliases).toContain(
    "cracking-and-alkenes-3",
  );
  expect(get("crk-v1-p-ring").exposureAliases).toContain("alk-v1-p-ring");
  expect(get("crk-v1-r-scale").exposureAliases).toContain("alk-v1-p-multiple");
  expect(get("crk-v1-p-distil").exposureAliases).toContain("oil-v1-p-identity");
  expect(get("crk-v1-a-ring").exposureAliases).not.toContain(
    "alk-v1-p-ethane-name",
  );
});
