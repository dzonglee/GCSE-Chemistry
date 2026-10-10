import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import archivedBefore from "./fixtures/polymerisation-v1-before-condensation.json";
import { polymerisationJourney as j } from "../src/content/journeys/polymerisation";
import {
  condensationAdditions as added,
  polymerisationForTier,
  polyesterReferenceChain,
} from "../src/content/journeys/condensation-writing";
import {
  blankCondensationDrawing,
  readCondensationDrawing,
  readChain,
  readPolyesterResponse,
  describePolyesterResponse,
} from "../src/lib/condensation-drawing";
import {
  blankPolyesterDrawing,
  readPolyesterDrawing,
} from "../src/lib/polyester";
// Preserve the archived source fixture; apply only the individually reviewed
// spacing fixes and exact retained-choice alias to the comparison copy.
const editorialFixes = [
  ["mass28", "mass 28"],
  ["that12.0g", "that 12.0 g"],
  ["all12.0g", "all 12.0 g"],
  ["contains18", "contains 18"],
  ["joins200", "joins 200"],
  ["All200", "All 200"],
  ["mass42", "mass 42"],
  ["contains14", "contains 14"],
];
let expectedJSON = JSON.stringify(archivedBefore);
for (const [old, updated] of editorialFixes)
  expectedJSON = expectedJSON.replaceAll(old, updated);
const before: typeof archivedBefore = JSON.parse(expectedJSON);
const molecules = before.practice.find((q) => q.id === "pol-v1-p-molecules")!;
Object.assign(molecules, {
  optionAliases: {
    "All200 separate molecules remain disconnected":
      "All 200 separate molecules remain disconnected",
  },
});
const all = [
  ...j.warmup,
  ...j.refresher,
  ...j.guided,
  ...j.practice,
  ...j.checkForms.flat(),
  ...j.reviewForms.flat(),
];

test("all 91 original definitions and positions survive apart from explicit editorial corrections", () => {
  expect(lessons.find((l) => l.slug === "polymers")!.journey).toBe(j);
  expect(j.version).toBe(1);
  const baseAll = [
    ...before.warmup,
    ...before.refresher,
    ...before.guided,
    ...before.practice,
    ...before.checkForms.flat(),
    ...before.reviewForms.flat(),
  ];
  expect(baseAll).toHaveLength(91);
  expect(all).toHaveLength(104);
  expect(new Set(all.map((q) => q.id)).size).toBe(104);
  for (const stage of ["warmup", "refresher", "guided", "practice"] as const)
    expect(j[stage].slice(0, before[stage].length).map((q) => q.id)).toEqual(
      before[stage].map((q) => q.id),
    );
  expect(j.checkForms.slice(0, 2)).toEqual(before.checkForms);
  expect(j.reviewForms.slice(0, 2)).toEqual(before.reviewForms);
  for (const old of baseAll) {
    const now = all.find((q) => q.id === old.id)!;
    if (!old.title.startsWith("Higher:")) expect(now).toEqual(old);
    else {
      const { tier, exposureAliases, ...rest } = now;
      const { exposureAliases: originalAliases, ...original } = old;
      expect(rest).toEqual(original);
      expect(tier).toBe("higher");
      expect(exposureAliases).toEqual(
        expect.arrayContaining(originalAliases ?? []),
      );
      expect(
        exposureAliases
          ?.filter((id) => !(originalAliases ?? []).includes(id))
          .every((id) => id.startsWith("pol-cond-v1-")),
      ).toBe(true);
    }
  }
});
test("Higher-only forms add genuine blank construction; original addition forms remain accessible and Foundation never receives condensation", () => {
  const foundation = polymerisationForTier(j, "foundation"),
    higher = polymerisationForTier(j, "higher");
  expect(foundation.checkForms).toEqual(before.checkForms);
  expect(foundation.reviewForms).toEqual(before.reviewForms);
  for (const qs of [
    foundation.guided,
    foundation.practice,
    foundation.refresher,
    ...foundation.checkForms,
    ...foundation.reviewForms,
  ])
    expect(qs.some((q) => q.tier === "higher")).toBe(false);
  expect(higher.checkForms.slice(0, 2)).toEqual(added.checkForms);
  expect(higher.reviewForms.slice(0, 2)).toEqual(added.reviewForms);
  expect(higher.checkForms.slice(2)).toEqual(before.checkForms);
  expect(higher.reviewForms.slice(2)).toEqual(before.reviewForms);
  for (const q of [
    ...added.guided,
    ...added.practice,
    ...added.checkForms.flat(),
    ...added.reviewForms.flat(),
  ]) {
    expect(q.tier).toBe("higher");
    expect(q.model).toBeUndefined();
    if (q.polyesterDrawing) {
      expect(q.rubric?.length).toBeGreaterThan(0);
      const kind = q.polyesterDrawing.construction!;
      expect(
        readCondensationDrawing(
          JSON.stringify(blankCondensationDrawing(kind)),
          kind,
        ),
      ).toEqual(blankCondensationDrawing(kind));
    } else {
      expect(q.options).toBeUndefined();
      expect(q.answer).toBe("H2O");
      expect(q.chemicalFormula).toBe(true);
    }
  }
});
for (const kind of ["groups", "sequence"] as const)
  test(`${kind}: malformed bytes fail decoding; chemically wrong valid proposals remain exactly readable`, () => {
    const blank = blankCondensationDrawing(kind);
    for (const raw of [
      "original malformed bytes",
      "null",
      "[]",
      "{}",
      JSON.stringify({ ...blank, extra: "1" }),
      JSON.stringify({
        ...blank,
        kind: kind === "groups" ? "sequence" : "groups",
      }),
    ])
      expect(readCondensationDrawing(raw, kind)).toBeNull();
    for (const key of Object.keys(blank))
      expect(
        readCondensationDrawing(
          JSON.stringify({ ...blank, [key]: null }),
          kind,
        ),
      ).toBeNull();
    const wrong =
      kind === "groups"
        ? { ...blank, diolLeftO: "2", diolLeftH: "1", acidRightCarbonyl: "1" }
        : {
            ...blank,
            chain: JSON.stringify([
              { atom: "O", oxygen: "0", hydrogen: "1" },
              { atom: "C", oxygen: "1", hydrogen: "0" },
            ]),
            left: "1",
            countMark: "N",
          };
    expect(readCondensationDrawing(JSON.stringify(wrong), kind)).toEqual(wrong);
    const data = { diolC: 2, acidSpacerC: 2, note: "", construction: kind };
    expect(
      readPolyesterResponse(JSON.stringify(blankPolyesterDrawing()), data),
    ).toBeNull();
    expect(readPolyesterResponse(JSON.stringify(wrong), data)).toEqual(wrong);
    expect(
      describePolyesterResponse(JSON.stringify(wrong), data),
    ).not.toContain("{");
    expect(readPolyesterDrawing(JSON.stringify(wrong))).toBeNull();
  });
test("chain decoder bounds malformed schema without rejecting ether, terminal-OH or same-formula connectivity mistakes", () => {
  for (const raw of [
    "null",
    "{}",
    "not json",
    JSON.stringify(Array(17).fill({ atom: "O", oxygen: "0", hydrogen: "0" })),
    JSON.stringify([{ atom: "CH2", oxygen: "2", hydrogen: "0" }]),
    JSON.stringify([{ atom: "C", oxygen: "0", hydrogen: "1" }]),
  ])
    expect(readChain(raw)).toBeNull();
  expect(
    readCondensationDrawing(
      JSON.stringify({
        ...blankCondensationDrawing("sequence"),
        chain: "[  ]",
      }),
      "sequence",
    ),
  ).toEqual(blankCondensationDrawing("sequence"));
  const ether = [
    { atom: "CH2", oxygen: "0", hydrogen: "0" },
    { atom: "O", oxygen: "0", hydrogen: "0" },
    { atom: "CH2", oxygen: "0", hydrogen: "0" },
  ];
  expect(readChain(JSON.stringify(ether))).toEqual(ether);
});
test("literal polyester paths retain O atoms, ester adjacency and correct valence INCLUDING the boundary, not merely matching formula", () => {
  const refs: [number, number, string[], number[]][] = [
    [2, 2, ["O", "CH2", "CH2", "O", "C", "CH2", "CH2", "C"], [6, 8, 4]],
    [3, 1, ["O", "CH2", "CH2", "CH2", "O", "C", "CH2", "C"], [6, 8, 4]],
    [
      2,
      4,
      ["O", "CH2", "CH2", "O", "C", "CH2", "CH2", "CH2", "CH2", "C"],
      [8, 12, 4],
    ],
    [4, 1, ["O", "CH2", "CH2", "CH2", "CH2", "O", "C", "CH2", "C"], [7, 10, 4]],
    [
      3,
      3,
      ["O", "CH2", "CH2", "CH2", "O", "C", "CH2", "CH2", "CH2", "C"],
      [8, 12, 4],
    ],
    [
      4,
      3,
      ["O", "CH2", "CH2", "CH2", "CH2", "O", "C", "CH2", "CH2", "CH2", "C"],
      [9, 14, 4],
    ],
    [3, 2, ["O", "CH2", "CH2", "CH2", "O", "C", "CH2", "CH2", "C"], [7, 10, 4]],
    [2, 1, ["O", "CH2", "CH2", "O", "C", "CH2", "C"], [5, 6, 4]],
  ];
  for (const [diolC, acidSpacerC, path, atoms] of refs) {
    const chain = polyesterReferenceChain({ diolC, acidSpacerC, note: "" });
    expect(chain.map((a) => a.atom)).toEqual(path);
    expect([
      chain.filter((a) => a.atom === "C" || a.atom === "CH2").length,
      chain.filter((a) => a.atom === "CH2").length * 2,
      chain.filter((a) => a.atom === "O" || a.oxygen !== "0").length,
    ]).toEqual(atoms);
    for (let i = 0; i < chain.length; i++) {
      const a = chain[i],
        previous = chain[(i - 1 + chain.length) % chain.length],
        next = chain[(i + 1) % chain.length];
      expect(a.hydrogen).toBe("0");
      expect(2 + Number(a.oxygen) + (a.atom === "CH2" ? 2 : 0)).toBe(
        a.atom === "O" ? 2 : 4,
      );
      if (a.atom === "C") {
        expect(a.oxygen).toBe("2");
        expect([previous.atom, next.atom].sort()).toEqual(["CH2", "O"].sort());
      }
    }
  }
});
test("equivalent constructions and original help share conservative direct exposure, without linking addition or different response demands", () => {
  for (const q of [...added.checkForms.flat(), ...added.reviewForms.flat()]) {
    const source =
      q.polyesterDrawing?.construction === "groups"
        ? "pol-cond-v1-p-groups"
        : q.polyesterDrawing
          ? "pol-v1-p-polyester1"
          : "pol-v1-p-water";
    expect(q.exposureAliases).toContain(source);
    expect(all.find((q) => q.id === source)!.exposureAliases).toContain(q.id);
    expect(
      q.exposureAliases?.some((id) =>
        /pol-v1-(a-|b-|p-ethene|p-propene)/.test(id),
      ),
    ).toBe(false);
  }
  expect(added.checkForms[0][1].exposureAliases).not.toContain(
    added.checkForms[0][0].id,
  );
});
