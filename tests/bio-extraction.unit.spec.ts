import { test, expect } from "@playwright/test";
import {
  bioJourney as j,
  allBioTasks as all,
  bioRecoveryRoutes,
} from "../src/content/journeys/extracting-metals";
import {
  bioRecords as R,
  bioFields,
  bioNumeric,
  bioChoices,
  initialBio,
  validBio,
  validBioHistory,
  checkBio,
  bioNumber,
} from "../src/lib/bio-extraction";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
import { metalDisplacementAsset } from "../src/lib/metal-displacement-asset";
import * as T from "three";
test("one65-task Higher biological extraction lesson has five activities and16 individually supplied cases", () => {
  const l = lessons.find((l) => l.slug === "extracting-metals")!;
  expect(l.journey).toBe(j);
  expect(l.tier).toBe("higher");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("metal-extraction");
  expect(j.scopeNote).toContain("Higher tier");
  expect(all).toHaveLength(65);
  expect(new Set(all.map((q) => q.id)).size).toBe(65);
  expect(Object.keys(R)).toHaveLength(16);
  expect(j.refresher).toHaveLength(16);
  expect(j.guided).toHaveLength(5);
  expect(j.practice).toHaveLength(22);
  expect(j.checkForms.map((f) => f.length)).toEqual([6, 6]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  for (const q of j.practice) {
    expect(q.followUp).toBe(bioRecoveryRoutes[q.id]);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  for (const q of [
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ])
    expect(q.model).toBeUndefined();
  for (const record of Object.keys(R))
    expect(
      j.refresher.some(
        (q) =>
          q.model?.kind === "bio-extraction-investigation" &&
          q.model.record === record,
      ),
    ).toBe(true);
});
test("native copper proposals retain every wrong field, unchanged original sources and one-field history", () => {
  const original = JSON.stringify(R);
  for (const [record, r] of Object.entries(R)) {
    const m = {
        kind: "bio-extraction-investigation" as const,
        mode: r.mode,
        record,
      },
      h = [initialBio(r.mode, record)];
    expect(initialBoard(m)).toEqual(h[0]);
    expect(checkBoard(m, h[0]).correct).toBe(false);
    for (const [f, v] of Object.entries(r.expected))
      h.push({ ...h.at(-1)!, [f]: v });
    expect(validHistory(m, h)).toBe(true);
    expect(checkBoard(m, h.at(-1)!).correct, record).toBe(true);
    for (const f of bioFields[r.mode]) {
      const v = bioNumeric.includes(f)
          ? "999"
          : bioChoices[f].find((v) => v !== r.expected[f])!,
        b = { ...h.at(-1)!, [f]: v };
      expect(validBoard(m, b)).toBe(true);
      expect(checkBoard(m, b).correct).toBe(false);
      expect(checkBoard(m, b).feedback).toContain("remains as entered");
      expect(b[f]).toBe(v);
    }
  }
  expect(JSON.stringify(R)).toBe(original);
});
test("unreadable numeric work is retained while forged/foreign/multi-field saved states are rejected", () => {
  const b = initialBio("grade", "oreA");
  for (const v of [
    { ...b, record: "oreB" },
    { ...b, available: 6 },
    { ...b, extra: "" },
    [b],
  ])
    expect(validBio("grade", v, "oreA")).toBe(false);
  expect(
    validBioHistory("grade", "oreA", [
      b,
      { ...b, available: "6", recovered: "4.2" },
    ]),
  ).toBe(false);
  expect(validBioHistory("grade", "oreA", [{ ...b, available: "6" }])).toBe(
    false,
  );
  const raw = { ...b, ...R.oreA.expected, available: "1..2" };
  expect(validBio("grade", raw)).toBe(true);
  expect(checkBio("grade", raw).correct).toBe(false);
  expect(raw.available).toBe("1..2");
  for (const v of ["", "1..2", "1e3", "1/2", "Infinity"])
    expect(bioNumber(v)).toBeNull();
});
test("24 native numeric values independently conserve copper through grade, ash and equal-output comparison", () => {
  const refs: Record<string, number[]> = {
    oreA: [6, 4.2, 1.8],
    oreB: [3, 2.4, 0.6],
    oxide: [2, 1.2, 0.8],
    ashA: [1, 0, 10],
    ashB: [3.6, 0.4, 7.2],
    ashC: [2.28, 0.12, 7.6],
    matched: [15, 20],
    reversed: [30, 15],
    deadline: [12, 20],
  };
  expect(Object.values(refs).flat()).toHaveLength(24);
  for (const [k, nums] of Object.entries(refs)) {
    const r = R[k];
    expect(
      bioFields[r.mode]
        .filter((f) => bioNumeric.includes(f))
        .map((f) => Number(r.expected[f])),
    ).toEqual(nums);
    if (r.grade) {
      const cu =
        r.grade.mass *
        (r.grade.compound ? 64 / (64 + 16) : r.grade.percent! / 100);
      expect(cu).toBeCloseTo(nums[0]);
      expect((cu * r.grade.recovery) / 100).toBeCloseTo(nums[1]);
      expect(cu - nums[1]).toBeCloseTo(nums[2]);
    }
    if (r.ash) {
      const cu = (r.ash.copper * r.ash.retained) / 100;
      expect(cu).toBeCloseTo(nums[0]);
      expect(r.ash.copper - cu).toBeCloseTo(nums[1]);
      expect((cu / r.ash.ash) * 100).toBeCloseTo(nums[2]);
    }
    if (r.comparison) {
      expect(r.comparison.aEnergy / r.comparison.aCopper).toBe(nums[0]);
      expect(r.comparison.bEnergy / r.comparison.bCopper).toBe(nums[1]);
    }
  }
  expect(R.deadline.expected.decision).toBe("bDeadline");
  expect(R.reversed.expected.decision).toBe("bLower");
  expect(R.oxide.grade!.percent).toBeUndefined();
});
test("22 scalar references and8 independent constructions match separately audited literal answers", () => {
  const refs: Record<string, number> = {
    "w-percent": 2,
    "w-formula": 80,
    "r-oreA": 4.2,
    "r-oreB": 2.4,
    "r-oxide": 1.2,
    "r-ashA": 10,
    "r-ashB": 7.2,
    "r-ashC": 7.6,
    "r-matched": 15,
    "r-reversed": 30,
    "r-deadline": 20,
    "g-grade": 4.2,
    "g-ash": 10,
    "g-compare": 15,
    "p-oreNeeded": 1500,
    "p-compoundPercent": 88.9,
    "p-enrichment": 25,
    "p-scrap": 54,
    "cA-rate": 14,
    "cB-rate": 18,
    "vA-grade": 2.7,
    "vB-ash": 6.8,
  };
  const qs = all.filter((q) => !q.options && !q.parts && !q.rubric);
  expect(qs).toHaveLength(22);
  for (const q of qs) {
    const n = refs[q.id.replace("bio-v1-", "")];
    expect(Number(q.answer)).toBe(n);
    expect(mark(q, String(n)).correct).toBe(true);
    expect(mark(q, String(n + 1)).correct).toBe(false);
  }
  const constructions: Record<string, number[]> = {
    "p-grade": [5.4, 4.05, 1.35],
    "p-compoundYield": [3.2, 2.56, 0.64],
    "p-ashInventory": [1.62, 0.18, 8.1],
    "p-compare": [18, 24, 6],
    "cA-grade": [10, 6, 4],
    "cA-ash": [1.5, 0, 6],
    "cB-grade": [4.5, 3.6, 0.9],
    "cB-ash": [2.4, 0.6, 8],
  };
  const builds = all.filter((q) => q.parts);
  expect(builds).toHaveLength(8);
  expect(builds.flatMap((q) => q.parts!)).toHaveLength(24);
  for (const q of builds) {
    expect(q.parts!.map((p) => p.answer)).toEqual(
      constructions[q.id.replace("bio-v1-", "")],
    );
    expect(mark(q, q.answer).correct).toBe(true);
    const wrong = JSON.parse(q.answer);
    wrong[q.parts![0].id] = "999";
    expect(mark(q, JSON.stringify(wrong)).correct).toBe(false);
  }
  expect(6 / (0.005 * 0.8)).toBe(1500);
  expect((128 / (128 + 16)) * 100).toBeCloseTo(88.88888889);
  expect((3.6 * 128) / 144).toBeCloseTo(3.2);
  expect((0.6 / 12) * 100).toBe(5);
  expect((0.6 / 300) * 100).toBe(0.2);
  expect(5 / 0.2).toBe(25);
  expect(60 * 0.9).toBe(54);
});
test("chemical intermediates, final reduction and manual reviews preserve the actual exam demands", () => {
  expect(R.plants.expected.intermediate).toBe("ashCompounds");
  expect(R.plants.expected.next).toBe("acidThenRecover");
  expect(R.bacteria.expected.intermediate).toBe("aqueousCompounds");
  expect(R.readyAsh.expected.stage).toBe("dissolve");
  expect(R.silver.expected.change).toBe("unchanged");
  expect(R.filter.expected.product).toBe("ionsRemain");
  expect(R.cell.expected.change).toBe("gain");
  const written = all.filter((q) => q.rubric);
  expect(written).toHaveLength(10);
  for (const q of written) {
    expect(q.referenceResponse).toBe(q.answer);
    expect(mark(q, q.answer).selfReview).toBe(true);
    expect(mark(q, q.answer).correct).toBe(false);
  }
  for (const q of all)
    if (q.bioGiven) {
      expect(Object.keys(q.bioGiven)).not.toContain("expected");
      expect(Object.keys(q.bioGiven)).not.toContain("feedback");
      expect(q.bioGiven.ironScene).toBeUndefined();
    }
});
test("actual supplied iron/copper3D geometry preserves identities, separate sulfate, phases and charge", () => {
  const root = metalDisplacementAsset("Fe", "Cu"),
    states = root.children;
  expect(states).toHaveLength(2);
  for (const state of states) {
    const atoms: T.Object3D[] = [];
    state.traverse((n) => {
      if (n.userData.element) atoms.push(n);
    });
    expect(atoms).toHaveLength(7);
    expect(atoms.filter((n) => n.userData.element === "O")).toHaveLength(4);
    expect(atoms.filter((n) => n.userData.element === "S")).toHaveLength(1);
    expect(atoms.find((n) => n.userData.element === "Cu")!.userData.phase).toBe(
      state.userData.state === "before" ? "aqueous" : "solid",
    );
    expect(atoms.find((n) => n.userData.element === "Fe")!.userData.phase).toBe(
      state.userData.state === "before" ? "solid" : "aqueous",
    );
    expect(state.userData.totalCharge).toBe(0);
    const sulfate: T.Object3D[] = [];
    state.traverse((n) => {
      if (n.userData.particleId === "unchanged-sulfate") sulfate.push(n);
    });
    expect(sulfate).toHaveLength(1);
    expect(sulfate[0].userData.charge).toBe(-2);
  }
  root.traverse((n) => {
    const mesh = n as T.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material)
      for (const m of Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material])
        m.dispose();
  });
});
test("global exposures include old primary/biological questions and repeated electron-gain theory, reserving new numbers", () => {
  const candidates = lessons.flatMap((l) => [
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
  ]);
  const l = lessons.find((l) => l.slug === "extracting-metals")!;
  for (const q of [...all, ...l.questions, ...l.checks])
    for (const a of q.exposureAliases ?? []) {
      const o = candidates.find((o) => o.id === a);
      expect(o, a).toBeDefined();
      expect(o!.exposureAliases).toContain(q.id);
    }
  for (let i = 0; i < 6; i++)
    expect(
      [...l.questions, ...l.checks].find(
        (q) => q.id === "extracting-metals-" + i,
      )!.exposureAliases!.length,
    ).toBeGreaterThan(0);
  expect(
    all.find((q) => q.id === "bio-v1-cB-reduction")!.exposureAliases,
  ).toContain("bio-v1-g-recovery");
  for (const s of [
    "cA-grade",
    "cA-ash",
    "cA-rate",
    "cB-grade",
    "cB-ash",
    "cB-rate",
    "vA-grade",
    "vB-ash",
  ])
    expect(
      all.find((q) => q.id === "bio-v1-" + s)!.exposureAliases,
    ).toBeUndefined();
});
