import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import { measurementJourney as journey } from "../src/content/journeys/measurement-uncertainty";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function task(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) {
    await picker.selectOption(String(n - 1));
    return;
  }
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function select(page: Page, label: string, value: string) {
  await page.getByLabel(label, { exact: true }).selectOption(value);
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".measurement-workbench .feedback[role=status]"),
  ).toHaveClass(correct ? /correct/ : /retry/);
}
async function capture(page: Page, path: string) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
async function answer(page: Page, q: (typeof journey.practice)[number]) {
  if (q.parts) {
    const a = JSON.parse(q.answer);
    for (const p of q.parts)
      await page.getByLabel(p.label, { exact: true }).fill(a[p.id]);
  } else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(q.answer);
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
test("justified selection preserves wrong reasons, retained count and the original excluded reading", async ({
  page,
}, info) => {
  await page.goto("/lessons/measurement-uncertainty");
  const box = await page
    .getByLabel("Recorded measurement evidence", { exact: true })
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await select(page, "Excluded recorded trial", "4");
  await select(page, "Reason for selection", "furthest");
  await select(page, "Your retained reading count", "3");
  await select(page, "Your retained mean", "10.1");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Reason for selection", { exact: true }),
  ).toHaveValue("furthest");
  await expect(page.locator('[data-measurement-included="false"]')).toHaveCount(
    1,
  );
  await expect(page.locator('[data-measurement-value="14"]')).toHaveCount(1);
  await select(page, "Reason for selection", "fault");
  await check(page, true);
  const fits = await page
    .getByLabel("Reason for selection", { exact: true })
    .evaluate((e) => {
      const select = e as HTMLSelectElement,
        style = getComputedStyle(select),
        context = document.createElement("canvas").getContext("2d")!;
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      return (
        context.measureText(select.selectedOptions[0].text).width <=
        select.clientWidth -
          parseFloat(style.paddingLeft) -
          parseFloat(style.paddingRight) -
          24
      );
    });
  expect(fits).toBe(true);
  await capture(page, `docs/qa/uncertainty-${info.project.name}-selection.png`);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await check(page, false);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Excluded recorded trial", { exact: true }),
  ).toHaveValue("0");
  await expect(page.locator(".storage-warning")).toHaveCount(0);
});
test("a valid maximum stays in the justified mean and a wrong proposed mean stays plotted", async ({
  page,
}, info) => {
  await page.goto("/lessons/measurement-uncertainty");
  await select(page, "Recorded measurement evidence", "valid");
  await select(page, "Excluded recorded trial", "4");
  await select(page, "Reason for selection", "fault");
  await select(page, "Your retained reading count", "3");
  await select(page, "Your retained mean", "10.1");
  await check(page, false);
  await select(page, "Excluded recorded trial", "0");
  await select(page, "Reason for selection", "keep");
  await select(page, "Your retained reading count", "4");
  await select(page, "Your retained mean", "14");
  await check(page, false);
  await expect(page.locator('[data-proposed-mean="14"]')).toHaveCount(1);
  await page.reload();
  await expect(
    page.getByLabel("Your retained mean", { exact: true }),
  ).toHaveValue("14");
  await expect(page.locator('[data-proposed-mean="14"]')).toHaveAttribute(
    "x1",
    String(80 + (5 / 6) * 520),
  );
  await expect(page.locator("[data-measurement-value]")).toHaveCount(4);
  await select(page, "Your retained mean", "10.15");
  await check(page, true);
  await capture(page, `docs/qa/uncertainty-${info.project.name}-valid.png`);
});
test("range endpoints full width and supplied half-range uncertainty remain distinct and use a common numerical axis", async ({
  page,
}, info) => {
  await page.goto("/lessons/measurement-uncertainty");
  await task(page, 2);
  await select(page, "Your observed minimum", "18.2");
  await select(page, "Your observed maximum", "18.8");
  await select(page, "Your full range width", "0.6");
  await select(page, "Your half-range uncertainty", "0.6");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Your half-range uncertainty", { exact: true }),
  ).toHaveValue("0.6");
  await select(page, "Your half-range uncertainty", "0.3");
  await check(page, true);
  const svg = page.locator(".measurement-distribution svg"),
    narrow = await svg.getAttribute("viewBox");
  await select(page, "Repeat temperature set", "wide");
  await select(page, "Your observed minimum", "17.9");
  await select(page, "Your observed maximum", "19.1");
  await select(page, "Your full range width", "1.2");
  await select(page, "Your half-range uncertainty", "0.6");
  await check(page, true);
  await expect(svg).toHaveAttribute("viewBox", narrow!);
  await expect(svg).toHaveAccessibleName(/shared axis 17.5 to 19.5/);
  for (const text of await svg.locator("text").all()) {
    const size = await text.evaluate(
      (e) =>
        parseFloat(getComputedStyle(e).fontSize) *
        Math.hypot(
          (e as SVGGraphicsElement).getScreenCTM()!.a,
          (e as SVGGraphicsElement).getScreenCTM()!.b,
        ),
    );
    expect(size).toBeGreaterThanOrEqual(12);
  }
  await writeFile(
    `docs/qa/uncertainty-distribution-${info.project.name}.svg`,
    await svg.evaluate((e) => e.outerHTML),
  );
  await capture(page, `docs/qa/uncertainty-${info.project.name}-spread.png`);
});
test("a common offset moves the distribution without changing scatter and hidden reference cannot establish accuracy", async ({
  page,
}, info) => {
  await page.goto("/lessons/measurement-uncertainty");
  await task(page, 3);
  await select(page, "Your repeat mean", "10.4");
  await select(page, "Your repeat range width", "0.2");
  await select(page, "Your accuracy conclusion", "aligned");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Your accuracy conclusion", { exact: true }),
  ).toHaveValue("aligned");
  await expect(page.locator("[data-reference-position]")).toHaveCount(0);
  await select(page, "Your accuracy conclusion", "unknown");
  await check(page, true);
  await select(page, "Reference information", "known");
  await select(page, "Your accuracy conclusion", "biased");
  await check(page, true);
  await expect(page.locator('[data-reference-position="10"]')).toHaveCount(1);
  await expect(page.locator('[data-measurement-value="10.3"]')).toHaveCount(1);
  await capture(page, `docs/qa/uncertainty-${info.project.name}-bias.png`);
  await select(page, "Your repeat mean", "0.4");
  await check(page, false);
  await expect(
    page.locator(".measurement-distribution figcaption"),
  ).toContainText("outside this plotted axis");
  await expect(page.locator("[data-proposed-mean]")).toHaveCount(0);
  await select(page, "Calibration offset", "0");
  await select(page, "Your repeat mean", "10");
  await select(page, "Your accuracy conclusion", "aligned");
  await check(page, true);
  await expect(
    page.getByLabel("Your repeat range width", { exact: true }),
  ).toHaveValue("0.2");
  await expect(page.locator('[data-measurement-value="9.9"]')).toHaveCount(1);
});
test("tight repeats for both investigators do not guarantee between-investigator agreement", async ({
  page,
}, info) => {
  await page.goto("/lessons/measurement-uncertainty");
  await task(page, 4);
  await select(page, "Your difference between means", "0.8");
  await select(page, "Repeatable within both sets", "yes");
  await select(page, "Reproducible for this comparison", "yes");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Reproducible for this comparison", { exact: true }),
  ).toHaveValue("yes");
  await select(page, "Reproducible for this comparison", "no");
  await check(page, true);
  await expect(page.locator("[data-measurement-value]")).toHaveCount(6);
  await capture(page, `docs/qa/uncertainty-${info.project.name}-reproduce.png`);
  await select(page, "Second investigator's result set", "agree");
  await select(page, "Your difference between means", "0");
  await select(page, "Reproducible for this comparison", "yes");
  await check(page, true);
});
test("all twenty-one independent demands preserve original sets and written explanations are self-reviewed", async ({
  page,
}, info) => {
  await page.goto("/lessons/measurement-uncertainty");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    const q = journey.practice[i];
    await task(page, i + 1);
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.rubric ? "Save and review explanation" : "Check answer",
        exact: true,
      })
      .click();
    await expect(
      page.locator(".sample-task-answer .feedback[role=status]"),
    ).toContainText(q.rubric ? "Compare your explanation" : "That’s right");
    if (q.parts)
      await capture(
        page,
        `docs/qa/uncertainty-${info.project.name}-independent.png`,
      );
  }
  for (const q of journey.practice.filter((q) => q.rubric))
    await expect
      .poll(() =>
        page.evaluate(
          ({ key, id }) => {
            const progress = JSON.parse(localStorage.getItem(key) ?? "null");
            return progress?.work?.["measurement-uncertainty"]?.attempts?.[
              id
            ]?.at(-1)?.correct;
          },
          { key: STORAGE_KEY, id: q.id },
        ),
      )
      .toBe(false);
});
test("incorrect range construction survives targeted teaching and returns without replacing the original set", async ({
  page,
}) => {
  await page.goto("/lessons/measurement-uncertainty");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 6);
  await page.getByLabel("Minimum / g", { exact: true }).fill("0.61");
  await page.getByLabel("Maximum / g", { exact: true }).fill("0.65");
  await page.getByLabel("Full width / g", { exact: true }).fill("0.04");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.locator(".sample-task-answer .feedback[role=status]"),
  ).toContainText("Not yet");
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await page.reload();
  await expect(page.getByLabel("Minimum / g", { exact: true })).toHaveValue(
    "0.61",
  );
  await expect(page.getByLabel("Full width / g", { exact: true })).toHaveValue(
    "0.04",
  );
});
test("numeric scatter diagrams remain accessible with WebGL unavailable and do not invent atomic representations", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return original.apply(this, [type, ...args] as never);
    } as typeof original;
  });
  await page.goto("/lessons/measurement-uncertainty");
  await task(page, 3);
  await select(page, "Your repeat mean", "10.4");
  await select(page, "Your repeat range width", "0.4");
  await select(page, "Your accuracy conclusion", "unknown");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Your repeat range width", { exact: true }),
  ).toHaveValue("0.4");
  await expect(page.locator(".measurement-distribution svg")).toHaveCount(1);
  await expect(page.locator("canvas")).toHaveCount(0);
  await capture(page, `docs/qa/uncertainty-${info.project.name}-diagram.png`);
});

test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/measurement-uncertainty");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let form = 0; form < 2; form++) {
    for (let i = 0; i < 5; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      const q = journey.checkForms[form][i];
      await answer(page, q);
      if (i === 0) {
        await saved(page);
        await page.reload();
        await expect(
          page.getByLabel("Your answer", { exact: true }),
        ).toHaveValue(q.answer);
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "measurement-uncertainty"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(true);
      await expect(
        page.getByText("That’s right.", { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("region", { name: "Task model", exact: true }),
      ).toHaveCount(0);
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "5 of 5 correct", exact: true }),
    ).toBeVisible();
    if (form === 0)
      await page
        .getByRole("button", { name: "Try the next form", exact: true })
        .click();
  }
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      for (const run of p.work["measurement-uncertainty"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["measurement-uncertainty"].run.submitted =
        Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  for (let i = 0; i < 3; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(page, journey.reviewForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
});
