import { expect, test } from "@playwright/test";
import {
  decode,
  emptyProgress,
  emptyWork,
  dueReview,
  observedResults,
  lessonStatus,
} from "../src/lib/progress";
import {
  initialWorkedCursor,
  validWorkedCursor,
  isWorkedLesson,
} from "../src/lib/worked-cursor";

test("old progress is unchanged and all bounded pilot positions round-trip", () => {
  const old = emptyProgress();
  old.work["inside-an-atom"] = {
    ...emptyWork(),
    drafts: { "atom-v2-g-neutral": "1//2 unfinished" },
  };
  expect(decode(JSON.stringify(old))).toEqual(old);
  for (const slug of ["inside-an-atom", "relative-atomic-mass"])
    for (const example of ["main", "difficult"] as const)
      for (const step of [0, 1, 2]) {
        const progress = structuredClone(old);
        progress.work[slug] = {
          ...(progress.work[slug] ?? emptyWork()),
          worked: { version: 1, example, step },
        };
        expect(decode(JSON.stringify(progress))).toEqual(progress);
      }
});

test("invalid or unsupported cursor records fail decoding without changing raw work", () => {
  const invalid: unknown[] = [
    null,
    [],
    {},
    { ...initialWorkedCursor(), version: 2 },
    { ...initialWorkedCursor(), example: "reserved-check" },
    ...[-1, 3, 1000000, 0.5, "1", null].map((step) => ({
      ...initialWorkedCursor(),
      step,
    })),
    { ...initialWorkedCursor(), attempts: 1 },
  ];
  for (const cursor of invalid) {
    expect(validWorkedCursor(cursor)).toBe(false);
    const data = emptyProgress();
    const raw = JSON.stringify({
      ...data,
      work: {
        "inside-an-atom": {
          ...emptyWork(),
          drafts: { "old-raw-answer": "13???" },
          worked: cursor,
        },
      },
    });
    expect(decode(raw)).toBeNull();
    expect(JSON.parse(raw).work["inside-an-atom"].drafts).toEqual({
      "old-raw-answer": "13???",
    });
  }
  const unrelated = emptyProgress();
  unrelated.work["titration-calculations"] = {
    ...emptyWork(),
    worked: initialWorkedCursor(),
  };
  expect(isWorkedLesson("titration-calculations")).toBe(false);
  expect(decode(JSON.stringify(unrelated))).toBeNull();
});

test("worked completion is not an attempt, exposure, result or review eligibility", () => {
  const data = emptyProgress();
  data.seen["an-existing-exposure"] = 123;
  const original = {
    ...emptyWork(),
    drafts: { "atom-v2-g-neutral": "12", "preview-intent": "early" },
    hints: ["an-existing-hint"],
    attempts: {
      "atom-v2-g-neutral": [
        {
          answer: "12",
          correct: false,
          helped: true,
          fresh: false,
          at: 100,
        },
      ],
    },
    taskModels: { "atom-v2-g-neutral": [{ p: 6, n: 6, e: 0 }] },
  };
  data.work["inside-an-atom"] = {
    ...original,
    worked: { version: 1, example: "difficult", step: 2 },
  };
  const restored = decode(JSON.stringify(data))!;
  expect(restored).not.toBeNull();
  const { worked, ...retained } = restored.work["inside-an-atom"];
  expect(worked?.step).toBe(2);
  expect(retained).toEqual(original);
  expect(restored.seen).toEqual({ "an-existing-exposure": 123 });
  expect(observedResults("inside-an-atom", restored)).toBeNull();
  expect(dueReview(restored.work["inside-an-atom"])).toBe(false);
  expect(lessonStatus("inside-an-atom", restored)).toBe("In progress");
});
