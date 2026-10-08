import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
import { initialStrengthBoard } from "../src/lib/acid-strength";
test("Higher shared route retains all six legacy identities and strict saved acid histories", () => {
  const l = lessons.find((l) => l.slug === "ph-and-strong-acids")!;
  expect(l.tier).toBe("higher");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("ph-scale-and-indicators");
  expect([...l.questions, ...l.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "ph-and-strong-acids-" + i),
  );
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of l.journey!.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    w.taskModels[q.id] = [b];
  }
  p.work[l.slug] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels[l.journey!.guided[1].id] = [
    { ...initialBoard(l.journey!.guided[1].model!), ph: "99" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("single pH and volume steps cannot jump, and changed factor records reset to their own starting pH", () => {
  const j = lessons.find((l) => l.slug === "ph-and-strong-acids")!.journey!;
  for (const [index, field, record, one] of [
    [1, "ph", "riseThree", "3"],
    [2, "steps", "hundred", "1"],
  ] as const) {
    const m = j.guided[index].model!,
      b = initialBoard(m),
      changed = { ...b, [field]: one };
    expect(validHistory(m, [b, changed])).toBe(true);
    expect(
      validHistory(m, [b, { ...b, [field]: field === "ph" ? "2" : "2" }]),
    ).toBe(false);
    const reset = initialStrengthBoard(
      index === 1 ? "factors" : "dilution",
      record,
    );
    expect(validHistory(m, [b, changed, reset])).toBe(true);
    expect(validHistory(m, [b, changed, { ...changed, record }])).toBe(false);
  }
  const m = j.guided[1].model!,
    b = initialBoard(m);
  expect(validHistory(m, [b, { ...b, ph: "3", direction: "increases" }])).toBe(
    false,
  );
});
