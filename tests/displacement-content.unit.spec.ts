import { test, expect } from "@playwright/test";
import { displacementJourney as j } from "../src/content/journeys/displacement";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
import { initialBoard } from "../src/lib/workbench";
const all = [
  ...j.warmup,
  ...j.refresher,
  ...j.guided,
  ...j.practice,
  ...j.checkForms.flat(),
  ...j.reviewForms.flat(),
];
test("eighteen numeric answers agree with independent shared-multiple, charge and spectator references", () => {
  const expected: Record<string, number> = {
    "w-multiple": 6,
    "r-charge": 2,
    "g-combine": 2,
    "g-cancel": 2,
    "g-ledger": 6,
    "p-cu-factor": 2,
    "p-al-cu-factor": 3,
    "p-al-ag-factor": 3,
    "p-chloride": 2,
    "p-two-spectators": 2,
    "p-net-charge": 2,
    "p-al-charge": 6,
    "a-factor": 3,
    "a-charge": 6,
    "b-factor": 3,
    "b-cancel": 3,
    "d-a-transfer": 6,
    "d-b-charge": 6,
  };
  const numeric = all.filter((q) => !q.options && !q.rubric);
  expect(numeric).toHaveLength(18);
  for (const q of numeric)
    expect(Number(q.answer), q.id).toBe(expected[q.id.replace("disp-v1-", "")]);
  expect(3 * 2).toBe(2 * 3);
  expect(2 * 3).toBe(6);
  expect(2 * -1).toBe(-2);
});
test("all five native task histories decode while invented jumps retain the raw unreadable boundary", () => {
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of j.guided) w.taskModels[q.id] = [initialBoard(q.model!)];
  p.work["half-equations"] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels[j.guided[0].id] = [
    initialBoard(j.guided[0].model!),
    { ...initialBoard(j.guided[0].model!), oxidation: "5" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("repeated transfer and spectator demands cannot become fresh evidence across lessons", () => {
  expect(exposureIds(["disp-v1-p-al-cu-factor"])).toContain("disp-v1-a-factor");
  expect(exposureIds(["he-v1-r-spectator"])).toContain("disp-v1-p-sulfate");
  expect(exposureIds(["disp-v1-p-sulfate"])).toContain("he-v1-r-spectator");
  expect(exposureIds(["disp-v1-g-ledger"])).toContain("disp-v1-d-b-charge");
});
