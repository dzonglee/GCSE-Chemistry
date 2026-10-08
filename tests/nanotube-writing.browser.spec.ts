import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { nanotubeJourney as journey } from "../src/content/journeys/nanotubes";
import { nanotubeWritingAdditions as added } from "../src/content/journeys/nanotube-writing";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/carbon-nanotubes";
async function shot(page: Page, name: string) {
  await mkdir("test-results/qa/nanotube-writing", {
    recursive: true,
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `test-results/qa/nanotube-writing/${name}.png`,
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
  const sizes = await page
    .locator(".question-panel svg text, .task-workbench svg text")
    .evaluateAll((nodes) =>
      nodes.map((n) => {
        const text = n as SVGTextElement,
          m = text.getScreenCTM();
        return (
          parseFloat(getComputedStyle(text).fontSize) *
          (m ? Math.hypot(m.a, m.b) : 1)
        );
      }),
    );
  for (const size of sizes) expect.soft(size).toBeGreaterThanOrEqual(12);
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

test("written practice preserves an incorrect causal account without awarding an automatic mark", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await choose(page, journey.practice.length);
  await opening(page);
  const raw =
    "A hollow tube guarantees zero frame mass and moving carbon nuclei carry charge. 1..2";
  const input = page.getByLabel("Your explanation", { exact: true });
  await input.fill(raw);
  await page.reload();
  await expect(input).toHaveValue(raw);
  await page
    .getByRole("button", { name: "Save and review explanation", exact: true })
    .click();
  await expect(page.locator(".question-panel [role=status]")).toContainText(
    "Compare your explanation",
  );
  await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(0);
  await shot(page, `${info.project.name}-trend-self-review`);
});
test("reserved nanotube conduction, reinforcement and evidence explanations hide criteria until whole submission", async ({
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
  const raw = [
    "Nanotube nuclei flow and there are no electrons. 1..2",
    "Weak layer sliding gives every nanotube frame strength and zero mass.",
    "D wins because low density overrides strength and stiffness.",
  ];
  for (let i = 0; i < added.check.length; i++) {
    const q = added.check[i];
    await opening(page);
    if (i === 2) {
      await expect(page.locator(".nanotube-reference-response")).toContainText(
        "density ≤ 1.7 g/cm³, strength ≥ 35, stiffness ≥ 30.",
      );
      await expect(
        page.locator(".nanotube-reference-response tbody tr"),
      ).toHaveCount(3);
      await expect(
        page.locator(".nanotube-reference-response tbody tr").nth(1),
      ).toContainText("E");
      await expect(
        page.locator(".nanotube-reference-response tbody tr").nth(1),
      ).toContainText("1.5");
      await expect(
        page.locator(".nanotube-reference-response tbody tr").nth(1),
      ).toContainText("38");
    }
    await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    await shot(
      page,
      `${info.project.name}-${["conduction", "strength", "decision"][i]}-opening`,
    );
    if (i === 2) await shot(page, `${info.project.name}-decision-evidence`);
    await answer(page, q, raw[i]);
    await page.reload();
    await expect(
      page.getByLabel("Your explanation", { exact: true }),
    ).toHaveValue(raw[i]);
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
  await expect(
    page.getByRole("heading", {
      name: "Responses ready for self-review",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".results-banner")).toContainText(
    "3 of 3 responses saved for self-review",
  );
  for (let i = 0; i < 3; i++) {
    const row = page.locator(".results-list > details").nth(i);
    await row.locator(":scope > summary").click();
    await expect(row.locator(".result-self-review")).toHaveText("Self-review");
    await expect(row.getByText(raw[i], { exact: true })).toBeVisible();
    await expect(row.locator(".assessment-review-criteria")).toBeVisible();
  }
  await shot(page, `${info.project.name}-retained-wrong-writing`);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("delayed tube model, aspect ratio and finished material explanations remain distinct, gated and manually reviewed", async ({
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
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem(key)!).work["carbon-nanotubes"]
              .section,
          STORAGE_KEY,
        ),
      )
      .toBe("review");
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
        for (const r of p.work["carbon-nanotubes"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["carbon-nanotubes"].run.submitted = Date.now() - delay - 1000;
        localStorage.setItem(key, JSON.stringify(p));
      },
      { key: STORAGE_KEY, delay: REVIEW_DELAY },
    );
    await page.reload();
    await page
      .getByRole("button", {
        name: i === 0 ? "Start review →" : "Try the next form",
        exact: true,
      })
      .click();
    if (i < 2) await complete(page, journey.reviewForms[i]);
    else {
      for (let n = 0; n < added.review.length; n++) {
        const q = added.review[n];
        await opening(page);
        if (n === 2) {
          await expect(
            page.locator(".nanotube-reference-response"),
          ).toContainText(
            "density ≤ 1.6 g/cm³, strength ≥ 35, stiffness ≥ 30.",
          );
          await expect(
            page.locator(".nanotube-reference-response tbody tr"),
          ).toHaveCount(2);
          await expect(
            page.locator(".nanotube-reference-response tbody tr").nth(0),
          ).toContainText("G");
          await expect(
            page.locator(".nanotube-reference-response tbody tr").nth(1),
          ).toContainText("H");
        }
        await expect(page.locator(".assessment-review-criteria")).toHaveCount(
          0,
        );
        await shot(
          page,
          `${info.project.name}-${["model", "ratio", "limit"][n]}-delayed-opening`,
        );
        if (n === 2) await shot(page, `${info.project.name}-limit-evidence`);
        await answer(
          page,
          q,
          n === 1
            ? "Doubling both dimensions makes Y twice the aspect ratio and proves conductivity."
            : q.answer,
        );
        await page
          .getByRole("button", { name: "Record answer", exact: true })
          .click();
        if (n < added.review.length - 1)
          await page
            .getByRole("button", { name: "Next question →", exact: true })
            .click();
      }
      await page
        .getByRole("button", { name: "Submit whole set", exact: true })
        .click();
      await expect(
        page.getByRole("heading", {
          name: "Responses ready for self-review",
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.locator(".results-banner")).toContainText(
        "3 of 3 responses saved for self-review",
      );
      const row = page.locator(".results-list > details").nth(1);
      await row.locator(":scope > summary").click();
      await expect(
        row.getByText(
          "Doubling both dimensions makes Y twice the aspect ratio and proves conductivity.",
          {
            exact: true,
          },
        ),
      ).toBeVisible();
      await expect(row.locator(".assessment-review-criteria")).toContainText(
        "invariance",
      );
      await shot(page, `${info.project.name}-solution-self-review`);
    }
  }
});
