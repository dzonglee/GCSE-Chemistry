import { test, expect } from "@playwright/test";
import { periodicDevelopmentJourney as journey } from "../src/content/journeys/periodic-development";
import { periodicDevelopmentWriting as added } from "../src/content/journeys/periodic-development-writing";
import { tasks } from "../src/content/journeys/helpers";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
import { mark } from "../src/lib/marking";

test("old historical forms, learning positions and malformed written work remain resumable", () => {
  expect(journey.version).toBe(1);
  expect(journey.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    [
      ["early", "gap", "evidence"].map((id) => "pd-v1-ca-" + id),
      ["order", "isotope", "modern"].map((id) => "pd-v1-cb-" + id),
    ],
  );
  expect(
    journey.reviewForms.slice(0, 2).map((f) => f.map((q) => q.id)),
  ).toEqual([
    ["gap", "weight"].map((id) => "pd-v1-ra-" + id),
    ["test", "isotope"].map((id) => "pd-v1-rb-" + id),
  ]);
  expect(journey.practice.slice(0, 9).map((q) => q.id)).toEqual(
    [
      "early",
      "swap",
      "test",
      "conflict",
      "predict",
      "isotopes",
      "scientist",
      "noble",
      "explain",
    ].map((id) => "pd-v1-p-" + id),
  );
  const data = emptyProgress();
  const model = added.guided[0].model!;
  data.work["periodic-development"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 8 },
    drafts: {
      [added.check[0].id]: "Electron shells were measured in 1869. 1..2",
    },
    taskModels: {
      [added.guided[0].id]: [
        initialBoard(model),
        { candidate: "match", verdict: "support" },
      ],
    },
    run: {
      kind: "check",
      ids: journey.checkForms[0].map((q) => q.id),
      index: 0,
      started: 1,
      responses: {},
    },
  };
  expect(decode(JSON.stringify(data))).toEqual(data);
});
test("matching and conflicting discoveries justify different conclusions and cannot permanently prove a table", () => {
  const model = added.guided[0].model!;
  const start = initialBoard(model);
  expect(checkBoard(model, start).correct).toBe(false);
  for (const candidate of ["match", "conflict"])
    for (const verdict of ["support", "investigate", "proof"]) {
      const b = { candidate, verdict };
      expect(validBoard(model, b)).toBe(true);
      expect(checkBoard(model, b).correct).toBe(
        candidate === "match"
          ? verdict === "support"
          : verdict === "investigate",
      );
    }
  expect(validBoard(model, { ...start, fabricated: "measurement" })).toBe(
    false,
  );
  expect(validBoard(model, { candidate: "gallium", verdict: "proof" })).toBe(
    false,
  );
  expect(
    validHistory(model, [{ candidate: "match", verdict: "support" }]),
  ).toBe(false);
  expect(
    validHistory(model, [start, { candidate: "match", verdict: "support" }]),
  ).toBe(true);
});
test("historical and isotope writing is manual and helped equivalent demands remain exposed", () => {
  const all = tasks(journey);
  for (const q of [...added.practice, ...added.check, ...added.review]) {
    for (const raw of [
      q.answer,
      "Mendeleev used known electron shells. Every isotope has different protons. 1..2",
      "",
    ]) {
      expect(mark(q, raw).correct, q.id).toBe(false);
      if (raw) expect(mark(q, raw).selfReview, q.id).toBe(true);
    }
    expect(q.model).toBeUndefined();
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
    for (const alias of q.exposureAliases ?? []) {
      expect(all.find((t) => t.id === alias)?.exposureAliases, alias).toContain(
        q.id,
      );
      expect(exposureIds([alias])).toContain(q.id);
    }
  }
  expect(exposureIds(["pd-v1-p-explain"])).toContain(added.check[0].id);
  expect(exposureIds(["pd-v1-r-isotopes"])).toContain(added.check[2].id);
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
});
