import { test, expect } from "@playwright/test";
import { decode, emptyProgress, emptyWork } from "../src/lib/progress";
function sample(working?: unknown) {
  const p = emptyProgress();
  p.work.sample = {
    ...emptyWork(),
    run: {
      kind: "paper",
      ids: ["calculation"],
      index: 0,
      started: 1,
      responses: {
        calculation: {
          answer: "0.25",
          correct: true,
          helped: false,
          fresh: true,
          at: 2,
          ...(working === undefined ? {} : { working }),
        },
      },
    },
  } as (typeof p.work)[string];
  return p;
}
test("calculation working and line breaks survive decoding alongside original final-answer evidence", () => {
  const p = sample("11 g / 44 g mol−1 = 0.25 mol\nKeep the units.");
  const raw = JSON.stringify(p);
  expect(decode(raw)).toEqual(p);
  expect(JSON.stringify(p)).toBe(raw);
  const old = sample();
  expect(decode(JSON.stringify(old))).toEqual(old);
});
test("malformed or oversized working blocks decoding without modifying the original record", () => {
  for (const value of [null, {}, ["forged"], "a".repeat(3001)]) {
    const p = sample(value);
    const raw = JSON.stringify(p);
    expect(decode(raw)).toBeNull();
    expect(JSON.stringify(p)).toBe(raw);
  }
  expect(decode(JSON.stringify(sample("a".repeat(3000))))).not.toBeNull();
});
