import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { waterJourney as j } from "../src/content/journeys/potable-water";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
  type Run,
  decode,
} from "../src/lib/progress";
import type { LearningTask } from "../src/content/types";
const route = "/lessons/potable-water";
async function pick(p: Page, index: number) {
  await p
    .getByLabel("Choose a practice task", { exact: true })
    .selectOption(String(index));
}
async function committed(p: Page) {
  await expect
    .poll(() =>
      p.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function gate(p: Page, root: Locator) {
  await p.evaluate(async () => {
    await document.fonts.ready;
    scrollTo(0, 0);
  });
  const a = await root
    .locator("input,textarea,select,.potable-recovery-clear:visible")
    .first()
    .evaluate((e) => {
      const x = e.matches('input[type="radio"]') ? e.closest("label")! : e;
      const b = x.getBoundingClientRect();
      return { height: b.height, bottom: b.bottom, width: b.width };
    });
  expect(a.height).toBeGreaterThanOrEqual(44);
  expect(a.width).toBeGreaterThanOrEqual(44);
  expect(a.bottom).toBeLessThanOrEqual(664);
  expect(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  ).toBe(false);
  for (const size of await p.locator("main svg text").evaluateAll((es) =>
    es.map((e) => {
      const t = e as SVGTextElement;
      return (
        parseFloat(getComputedStyle(t).fontSize) *
        Math.hypot(t.getScreenCTM()!.a, t.getScreenCTM()!.b)
      );
    }),
  ))
    expect(size).toBeGreaterThanOrEqual(12);
}
async function answer(p: Page, q: LearningTask) {
  if (q.parts) {
    for (const part of q.parts)
      await p.getByLabel(part.label, { exact: true }).fill(String(part.answer));
  } else await p.getByRole("radio", { name: q.answer, exact: true }).check();
}
function pastRun(kind: "check" | "review", ids: string[], at: number): Run {
  return {
    kind,
    ids,
    index: ids.length - 1,
    responses: Object.fromEntries(
      ids.map((id) => [
        id,
        {
          answer: "",
          correct: false,
          helped: false,
          fresh: false,
          at: at - 500,
        },
      ]),
    ),
    started: at - 1000,
    submitted: at,
  };
}
async function seed(
  p: Page,
  stage: "check" | "review" | "practice",
  history: Run[],
  drafts: Record<string, string> = {},
  index = 0,
  seen: Record<string, number> = {},
) {
  await p.goto("/privacy");
  const data = emptyProgress();
  data.seen = seen;
  data.work["potable-water"] = {
    ...emptyWork(),
    history,
    drafts,
    section: stage === "practice" ? "explore" : stage,
    learning: { version: 1, stage: "practice", index },
  };
  data.work["ionic-bonding"] = {
    ...emptyWork(),
    drafts: { "ib-v1-p-draw-chloride": "1..2" },
  };
  expect(
    decode(JSON.stringify(data)),
    "Fixture must obey the unchanged v1 progress parser",
  ).not.toBeNull();
  await p.evaluate(
    ({ key, data }) => localStorage.setItem(key, JSON.stringify(data)),
    { key: STORAGE_KEY, data },
  );
  await p.goto(route);
}

test("all original and appended guided/independent openings keep complete answers reachable and figures readable", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto(route);
  for (let i = 0; i < j.guided.length; i++) {
    const picker = page.getByLabel("Choose a practice task", { exact: true });
    if (await picker.count()) await picker.selectOption(String(i));
    else
      await page
        .getByRole("button", { name: `Task ${i + 1}`, exact: true })
        .first()
        .click();
    await gate(page, page.locator(".sample-task-layout"));
  }
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await pick(page, i);
    await gate(page, page.locator(".question-panel"));
    if (i >= 27 || [5, 9, 14, 25].includes(i))
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});

test("a wrong source concentration remains raw after check/reload; scoped reset leaves other work intact", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await pick(page, 28);
  await page.getByLabel("Pond P / g per dm³", { exact: true }).fill("1..2");
  await page.getByLabel("Stream Q / g per dm³", { exact: true }).fill("50");
  await page.locator(".sample-check-answer").click();
  await committed(page);
  await page.reload();
  await expect(
    page.getByLabel("Pond P / g per dm³", { exact: true }),
  ).toHaveValue("1..2");
  await expect(
    page.getByLabel("Stream Q / g per dm³", { exact: true }),
  ).toHaveValue("50");
  await expect(page.locator(".water-original")).toContainText(
    "0.05 g residue from 25 cm³",
  );
  // Invalid typing is retained but is not recorded as a completed answer.
  // Use a valid wrong number to exercise the explanatory recovery route.
  await page.getByLabel("Pond P / g per dm³", { exact: true }).fill("99");
  await page.locator(".sample-check-answer").click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Compare equal volumes", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("radio", { name: "Dry residue mass per dm³", exact: true })
    .check();
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "3 g/dm³",
  );
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByLabel("Pond P / g per dm³", { exact: true }),
  ).toHaveValue("99");
  await page.getByLabel("Pond P / g per dm³", { exact: true }).fill("3");
  await page.getByLabel("Stream Q / g per dm³", { exact: true }).fill("2");
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toHaveClass(
    /correct/,
  );
  await page.getByRole("button", { name: "Clear answer", exact: true }).click();
  await expect(
    page.getByLabel("Pond P / g per dm³", { exact: true }),
  ).toHaveValue("");
});

test("malformed source construction bytes survive reload with sibling work unchanged", async ({
  page,
}) => {
  const raw = '{"s0":true,"s1":"1..2","foreign":"keep"}';
  await seed(page, "practice", [], { [j.practice[28].id]: raw }, 28);
  await expect(page.locator(".question-panel")).toContainText(
    "Saved constructed answer is unreadable",
  );
  await page.reload();
  await expect(page.locator(".question-panel")).toContainText(
    "Saved constructed answer is unreadable",
  );
  const data = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(data.work["potable-water"].drafts[j.practice[28].id]).toBe(raw);
  expect(data.work["ionic-bonding"].drafts["ib-v1-p-draw-chloride"]).toBe(
    "1..2",
  );
  await gate(page, page.locator(".question-panel"));
  await page
    .getByRole("button", { name: "Start this answer again", exact: true })
    .click();
  await committed(page);
  await page.reload();
  await expect(
    page.getByLabel("Pond P / g per dm³", { exact: true }),
  ).toHaveValue("");
  const recovered = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(recovered.work["ionic-bonding"].drafts["ib-v1-p-draw-chloride"]).toBe(
    "1..2",
  );
});

test("new reserved forms stay sealed and preserve cold versus helped exposure across changed sources", async ({
  page,
}) => {
  const now = Date.now();
  await seed(
    page,
    "check",
    j.checkForms.slice(0, 2).map((f) =>
      pastRun(
        "check",
        f.map((q) => q.id),
        now - 10000,
      ),
    ),
  );
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (const form of j.checkForms.slice(2)) {
    for (let i = 0; i < form.length; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      await gate(page, page.locator(".assessment-session"));
      await expect(
        page.locator(
          ".sample-reference,.assessment-review-criteria,.water-workbench",
        ),
      ).toHaveCount(0);
      await answer(page, form[i]);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "2 of 2 correct", exact: true }),
    ).toBeVisible();
    await committed(page);
    const run = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).work["potable-water"].run,
      STORAGE_KEY,
    );
    expect(
      Object.values(run.responses).map(
        (r: unknown) => (r as { fresh: boolean }).fresh,
      ),
    ).toEqual(form === j.checkForms[2] ? [true, true] : [false, false]);
    if (form === j.checkForms[2])
      await page
        .getByRole("button", { name: "Try the next form", exact: true })
        .click();
  }
});

test("new delayed sources obey the exact seven-day gate and retain malformed work until whole submission", async ({
  page,
}) => {
  const now = new Date("2026-10-12T15:00:00Z").getTime();
  await page.clock.setFixedTime(new Date(now));
  const history = [
    ...j.checkForms.slice(0, 2).map((f) =>
      pastRun(
        "check",
        f.map((q) => q.id),
        now - REVIEW_DELAY + 1,
      ),
    ),
    ...j.reviewForms.slice(0, 2).map((f) =>
      pastRun(
        "review",
        f.map((q) => q.id),
        now - REVIEW_DELAY * 2,
      ),
    ),
  ];
  history.sort((a, b) => a.submitted! - b.submitted!);
  await seed(page, "review", history);
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await page.clock.setFixedTime(new Date(now + 1));
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  const form = j.reviewForms[2];
  await answer(page, form[0]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Next question →", exact: true })
    .click();
  await page
    .getByLabel("Reservoir M / g per dm³", { exact: true })
    .fill("1..2");
  await page.getByLabel("Spring N / g per dm³", { exact: true }).fill("1");
  await committed(page);
  await page.reload();
  await expect(
    page.getByLabel("Reservoir M / g per dm³", { exact: true }),
  ).toHaveValue("1..2");
  await expect(
    page.locator(".sample-reference,.assessment-review-criteria"),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Submit whole set", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Leave unanswered", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "1 of 2 correct", exact: true }),
  ).toBeVisible();
  await committed(page);
  const run = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).work["potable-water"].run,
    STORAGE_KEY,
  );
  expect(run.responses[form[1].id].answer).toBe("");
  const rawDraft = await page.evaluate(
    ({ key, id }) =>
      JSON.parse(localStorage.getItem(key)!).work["potable-water"].drafts[id],
    { key: STORAGE_KEY, id: form[1].id },
  );
  expect(rawDraft).toBe('{"s0":"1..2","s1":"1"}');
  await expect(
    page.getByRole("button", { name: "Try the next form", exact: true }),
  ).toBeDisabled();
  await page.clock.setFixedTime(new Date(now + REVIEW_DELAY));
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Try the next form", exact: true }),
  ).toBeDisabled();
  await page.clock.setFixedTime(new Date(now + 1 + REVIEW_DELAY));
  await page.reload();
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  for (let i = 0; i < j.reviewForms[3].length; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(page, j.reviewForms[3][i]);
    await expect(
      page.locator(".sample-reference,.assessment-review-criteria"),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "2 of 2 correct", exact: true }),
  ).toBeVisible();
});

test("hinted source comparisons cannot be presented as fresh by the new independent form", async ({
  page,
}) => {
  const now = Date.now();
  await seed(
    page,
    "practice",
    j.checkForms.slice(0, 2).map((f) =>
      pastRun(
        "check",
        f.map((q) => q.id),
        now - 10000,
      ),
    ),
  );
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.count()) await picker.selectOption("7");
  else
    await page
      .getByRole("button", { name: "Task 8", exact: true })
      .first()
      .click();
  await page
    .getByRole("button", { name: "Give me a hint", exact: true })
    .click();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 2; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(page, j.checkForms[2][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await committed(page);
  const run = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).work["potable-water"].run,
    STORAGE_KEY,
  );
  expect(run.responses[j.checkForms[2][1].id].fresh).toBe(false);
});

test("original reserved written methods keep their full demand and reachable retained response", async ({
  page,
}) => {
  for (let form = 0; form < 2; form++) {
    await seed(
      page,
      "check",
      j.checkForms.slice(0, form).map((f) =>
        pastRun(
          "check",
          f.map((q) => q.id),
          Date.now() - 10000,
        ),
      ),
    );
    await page
      .getByRole("button", { name: "Start understanding check →", exact: true })
      .click();
    for (let index = 0; index < j.checkForms[form].length; index++) {
      const q = j.checkForms[form][index];
      if (!q.rubric) continue;
      await page
        .getByRole("button", { name: `Question ${index + 1}`, exact: true })
        .click();
      await expect(page.locator(".written-equation-prompt")).toHaveText(
        q.prompt,
      );
      await page
        .getByLabel("Your explanation", { exact: true })
        .fill("pH7 proves safety; weigh the hot dish including its mass.");
      await committed(page);
      await page.reload();
      await expect(
        page.getByLabel("Your explanation", { exact: true }),
      ).toHaveValue(
        "pH7 proves safety; weigh the hot dish including its mass.",
      );
      await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
      await gate(page, page.locator(".question-panel"));
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
  }
});

test("the original residue model cannot create fresh source-concentration evidence", async ({
  page,
}) => {
  await seed(
    page,
    "practice",
    j.checkForms.slice(0, 2).map((f) =>
      pastRun(
        "check",
        f.map((q) => q.id),
        Date.now() - 10000,
      ),
    ),
  );
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await page
    .getByRole("button", { name: "Task 3", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Give me a hint", exact: true })
    .click();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await page.getByRole("button", { name: "Question 2", exact: true }).click();
  await answer(page, j.checkForms[2][1]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await committed(page);
  const run = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).work["potable-water"].run,
    STORAGE_KEY,
  );
  expect(run.responses[j.checkForms[2][1].id].fresh).toBe(false);
});
