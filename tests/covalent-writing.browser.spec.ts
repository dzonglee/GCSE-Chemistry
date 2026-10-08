import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { covalentBondingJourney as journey } from "../src/content/journeys/covalent-bonding";
import { covalentWritingAdditions as added } from "../src/content/journeys/covalent-writing";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/covalent-bonding";
async function shot(page: Page, name: string) {
  await mkdir("test-results/qa/covalent-writing", {
    recursive: true,
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `test-results/qa/covalent-writing/${name}.png`,
    fullPage: !name.endsWith("opening"),
  });
}
async function opening(page: Page, model = false) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    scrollTo(0, 0);
  });
  const control = page
    .locator(
      model
        ? ".task-workbench select, .task-workbench input:not([type=checkbox]), .task-workbench button:not([disabled])"
        : ".question-panel .answer-option, .question-panel input, .question-panel textarea",
    )
    .first();
  const b = (await control.boundingBox())!;
  expect.soft(b.height).toBeGreaterThanOrEqual(44);
  expect
    .soft(
      b.y + b.height,
      `${await page.locator(".sample-task-panel > h2, .assessment-session .question-panel h2").first().innerText()} at ${page.viewportSize()!.width}px`,
    )
    .toBeLessThanOrEqual(664);
  expect
    .soft(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    )
    .toBe(true);
}
async function answer(page: Page, q: Question, raw = q.answer) {
  if (q.parts) {
    for (const part of q.parts)
      await page
        .getByLabel(part.label, { exact: true })
        .fill(String(part.answer));
  } else if (q.options)
    await page.getByRole("radio", { name: raw, exact: true }).check();
  else
    await page
      .getByLabel(
        q.writtenEquations
          ? "Your equations"
          : q.rubric
            ? "Your explanation"
            : "Your answer",
        {
          exact: true,
        },
      )
      .fill(raw);
}
async function choose(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) await picker.selectOption(String(n - 1));
  else
    await page.getByRole("button", { name: `Task ${n}`, exact: true }).click();
}
async function complete(page: Page, form: Question[]) {
  for (let i = 0; i < form.length; i++) {
    await opening(page);
    await answer(page, form[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    if (i < form.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
}

test("every teaching task opens at 320, 390 and desktop with a full response control", async ({
  browser,
}, info) => {
  test.setTimeout(150000);
  for (const width of [320, 390, 1280])
    for (const stage of [
      "warmup",
      "refresher",
      "guided",
      "practice",
    ] as const) {
      const context = await browser.newContext({
        ...devices[
          info.project.name === "mobile" ? "iPhone 13" : "Desktop Chrome"
        ],
        viewport: { width, height: 720 },
      });
      const page = await context.newPage();
      await page.goto(route);
      if (stage === "warmup")
        await page
          .getByRole("button", { name: "Warm-up", exact: true })
          .click();
      if (stage === "refresher") {
        await page
          .getByRole("radio", {
            name: journey.guided[0].options!.find(
              (o) => o !== journey.guided[0].answer,
            )!,
            exact: true,
          })
          .check();
        await page
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
        await page
          .locator(".question-panel")
          .getByRole("button", { name: "Revisit the key idea", exact: true })
          .click();
      }
      if (stage === "practice")
        await page
          .getByRole("button", { name: "Practise", exact: true })
          .click();
      for (let i = 0; i < journey[stage].length; i++) {
        await choose(page, i + 1);
        await opening(page, !!journey[stage][i].model);
        if (journey[stage][i].rubric) {
          await expect(
            page.getByLabel("Your explanation", { exact: true }),
          ).toHaveValue("");
          await expect(
            page.getByText(journey[stage][i].answer, { exact: true }),
          ).toHaveCount(0);
        }
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      if (stage === "practice")
        await shot(page, `${info.project.name}-${width}-practice-opening`);
      await context.close();
    }
});

test("force writing and learner-produced bond lines retain wrong and malformed entries", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await choose(page, 16);
  await opening(page);
  const raw =
    "Both positive nuclei attract each other; the connector is a literal rod. 1..2";
  await answer(page, added.practice[0], raw);
  await page.reload();
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue(raw);
  await page
    .getByRole("button", { name: "Save and review explanation", exact: true })
    .click();
  await expect(page.locator(".question-panel [role=status]")).toContainText(
    "Compare your explanation",
  );
  await shot(page, `${info.project.name}-force-self-review`);
  await choose(page, 17);
  await opening(page);
  const q = added.practice[1];
  for (const part of q.parts!)
    await expect(page.getByLabel(part.label, { exact: true })).toHaveValue("");
  await answer(page, q);
  await page.getByLabel(q.parts![0].label, { exact: true }).fill("2");
  await expect(
    page.getByRole("img", { name: /Your proposed bond-line diagram/ }),
  ).toHaveAttribute("aria-label", /lines per connection 2, 1, 1/);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel [role=status]")).not.toContainText(
    "That’s right.",
  );
  await shot(page, `${info.project.name}-wrong-line-diagram`);
  await page.getByLabel(q.parts![0].label, { exact: true }).fill("1..2");
  await page.reload();
  await expect(page.getByLabel(q.parts![0].label, { exact: true })).toHaveValue(
    "1..2",
  );
  await expect(
    page.getByRole("img", { name: /Your proposed bond-line diagram/ }),
  ).toHaveCount(0);
});
test("reserved ammonia, methane, force and model-limit construction withholds feedback until whole submission", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (const form of journey.checkForms.slice(0, 2)) {
    await complete(page, form);
    await page
      .getByRole("button", { name: "Try the next form", exact: true })
      .click();
  }
  const raws = [
    "Positive nuclei attract one another; electrons are transferred.",
    "Dots are one electron species and sticks are real rods.",
  ];
  for (let i = 0; i < added.check.length; i++) {
    const q = added.check[i];
    await opening(page);
    await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    if (q.rubric)
      await expect(
        page.getByLabel("Your explanation", { exact: true }),
      ).toHaveValue("");
    await shot(
      page,
      `${info.project.name}-${["ammonia", "methane", "force", "limits", "lines"][i]}-opening`,
    );
    await answer(page, q, q.rubric ? raws[i - 2] : q.answer);
    if (i === 0) {
      await page
        .getByLabel(q.parts!.find((p) => p.id === "centre0")!.label, {
          exact: true,
        })
        .fill("2");
      await page
        .getByLabel(q.parts!.find((p) => p.id === "partner0")!.label, {
          exact: true,
        })
        .fill("0");
      await page.reload();
      await expect(
        page.getByLabel(q.parts!.find((p) => p.id === "partner0")!.label, {
          exact: true,
        }),
      ).toHaveValue("0");
      await shot(page, `${info.project.name}-wrong-ammonia-proposal`);
    }
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    if (i < added.check.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  for (let i = 2; i <= 3; i++) {
    const row = page.locator(".results-list > details").nth(i);
    await row.locator(":scope > summary").click();
    await expect(row.locator(".result-self-review")).toHaveText("Self-review");
    await expect(row.getByText(raws[i - 2], { exact: true })).toBeVisible();
    await expect(row.locator(".assessment-review-criteria")).toBeVisible();
  }
  await shot(page, `${info.project.name}-retained-wrong-writing`);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("hydrogen, nitrogen and water-line retrieval is seven-day gated and distinguishes conserved counting from model claims", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await complete(page, journey.checkForms[0]);
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  for (let formIndex = 0; formIndex < 3; formIndex++) {
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          sessionStorage.getItem("gcse-chemistry.pending.v1"),
        ),
      )
      .toBeNull();
    await page.evaluate(
      ({ key, delay }) => {
        const p = JSON.parse(localStorage.getItem(key)!);
        for (const r of p.work["covalent-bonding"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["covalent-bonding"].run.submitted = Date.now() - delay - 1000;
        localStorage.setItem(key, JSON.stringify(p));
      },
      { key: STORAGE_KEY, delay: REVIEW_DELAY },
    );
    await page.reload();
    await page
      .getByRole("button", {
        name: formIndex === 0 ? "Start review →" : "Try the next form",
        exact: true,
      })
      .click();
    if (formIndex < 2) await complete(page, journey.reviewForms[formIndex]);
    else {
      for (let i = 0; i < added.review.length; i++) {
        const q = added.review[i];
        await opening(page);
        await expect(page.locator(".assessment-review-criteria")).toHaveCount(
          0,
        );
        await shot(
          page,
          `${info.project.name}-${["hydrogen", "nitrogen", "inventory", "markers", "water-lines"][i]}-delayed-opening`,
        );
        await answer(
          page,
          q,
          q.rubric
            ? "Sharing creates new electrons and a flat diagram proves a flat molecule. 1..2"
            : q.answer,
        );
        await page
          .getByRole("button", { name: "Record answer", exact: true })
          .click();
        if (i < added.review.length - 1)
          await page
            .getByRole("button", { name: "Next question →", exact: true })
            .click();
      }
      await page
        .getByRole("button", { name: "Submit whole set", exact: true })
        .click();
      const row = page.locator(".results-list > details").nth(2);
      await row.locator(":scope > summary").click();
      await expect(
        row.getByText(
          "Sharing creates new electrons and a flat diagram proves a flat molecule. 1..2",
          { exact: true },
        ),
      ).toBeVisible();
      await expect(row.locator(".assessment-review-criteria")).toContainText(
        "same four shared electrons",
      );
      await shot(page, `${info.project.name}-inventory-self-review`);
    }
  }
});
