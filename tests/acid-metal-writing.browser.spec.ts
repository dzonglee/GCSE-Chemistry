import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { acidNeutralisationJourney as journey } from "../src/content/journeys/acids-and-neutralisation";
import { acidMetalWritingAdditions as added } from "../src/content/journeys/acid-metal-writing";
import { acidMetalForTier } from "../src/content/journeys/acid-metal-writing";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/acids-and-neutralisation";
async function shot(page: Page, name: string) {
  await mkdir("test-results/qa/acid-metal-writing", {
    recursive: true,
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `test-results/qa/acid-metal-writing/${name}.png`,
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
        : ".question-panel .answer-option, .question-panel input, .question-panel textarea, .question-panel select",
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

async function setTier(page: Page, tier: "foundation" | "higher") {
  await expect
    .poll(() =>
      page.evaluate((key) => localStorage.getItem(key) !== null, STORAGE_KEY),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.evaluate(
    ({ key, tier }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      p.preferences.tier = tier;
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, tier },
  );
  await page.reload();
}
async function reserved(page: Page) {
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
}
test("all common and Higher teaching opens with native full controls and readable representations", async ({
  browser,
}, info) => {
  test.setTimeout(240000);
  for (const tier of ["foundation", "higher"] as const)
    for (const width of [320, 390, 1280]) {
      const context = await browser.newContext({
          ...devices[
            info.project.name === "mobile" ? "iPhone 13" : "Desktop Chrome"
          ],
          viewport: { width, height: 720 },
        }),
        page = await context.newPage();
      await page.goto(route);
      await setTier(page, tier);
      const content = acidMetalForTier(journey, tier);
      for (const stage of [
        "warmup",
        "refresher",
        "guided",
        "practice",
      ] as const) {
        if (stage === "warmup")
          await page
            .getByRole("button", { name: "Warm-up", exact: true })
            .click();
        if (stage === "guided")
          await page
            .getByRole("button", { name: "Learn", exact: true })
            .click();
        if (stage === "refresher") {
          await page
            .getByRole("button", { name: "Learn", exact: true })
            .click();
          await choose(page, 1);
          await page.getByLabel("Your answer", { exact: true }).fill("3");
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
        for (let n = 0; n < content[stage].length; n++) {
          await choose(page, n + 1);
          await opening(page, !!content[stage][n].model);
          if (content[stage][n].rubric) {
            await expect(
              page.getByLabel("Your explanation", { exact: true }),
            ).toHaveValue("");
            await expect(
              page.getByText(content[stage][n].answer, { exact: true }),
            ).toHaveCount(0);
          }
        }
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        );
      }
      await context.close();
    }
});
test("common independent equations and method retain wrong writing with criteria only after submission", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(route);
  await setTier(page, "foundation");
  await reserved(page);
  const raw =
    "FeCl3 and water form with every acid. Hydrogen gas loses electrons. 1..2";
  const form = acidMetalForTier(journey, "foundation").checkForms[2];
  for (let n = 0; n < form.length; n++) {
    await opening(page);
    await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    await expect(
      page.getByText(form[n].explanation, { exact: true }),
    ).toHaveCount(0);
    await shot(
      page,
      `${info.project.name}-${["chloride", "sulfate", "method"][n]}-opening`,
    );
    await answer(page, form[n], raw);
    await page.reload();
    await expect(
      page.getByLabel("Your explanation", { exact: true }),
    ).toHaveValue(raw);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    if (n < form.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(page.locator(".results-banner")).toContainText(
    "3 of 3 responses saved for self-review",
  );
  await expect(page.locator(".results-banner")).toContainText(
    "no automatic score is assigned",
  );
  for (let n = 0; n < 3; n++) {
    const row = page.locator(".results-list > details").nth(n);
    await row.locator(":scope > summary").click();
    await expect(row.getByText(raw, { exact: true })).toBeVisible();
    await expect(row.locator(".assessment-review-criteria")).toBeVisible();
    await expect(
      row.getByText(form[n].explanation, { exact: true }),
    ).toBeVisible();
  }
  await shot(page, `${info.project.name}-retained-wrong-writing`);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("Higher redox teaching and a started written form keep identity across a Foundation switch", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(route);
  await setTier(page, "higher");
  await choose(page, 7);
  await expect(
    page.getByRole("region", { name: "Higher electron account" }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Dilute acid", exact: true })
    .selectOption("H2SO4");
  await page.getByRole("button", { name: "Fe: Iron", exact: true }).click();
  await expect(page.locator(".acid-metal-reference")).toContainText(
    "Fe → Fe2+ + 2e−",
  );
  await shot(page, `${info.project.name}-higher-electron-reference`);
  await setTier(page, "foundation");
  await expect(page.locator(".acid-metal-electrons")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Task 7", exact: true }),
  ).toHaveCount(0);
  await setTier(page, "higher");
  await reserved(page);
  for (let n = 0; n < 3; n++) {
    await answer(page, added.check[n]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
  }
  await opening(page);
  await shot(page, `${info.project.name}-higher-redox-opening`);
  const raw = "Mg gains electrons; hydrogen gas loses them. 1..2";
  await answer(page, added.check[3], raw);
  await setTier(page, "foundation");
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue(raw);
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(page.locator(".results-banner")).toContainText(
    "4 of 4 responses saved for self-review",
  );
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  await expect(page.locator(".session-heading")).toContainText(
    "0 / 3 recorded",
  );
});
test("true seven-day retrieval requires independent common reactions and Higher electron writing", async ({
  browser,
}, info) => {
  test.setTimeout(150000);
  for (const tier of ["foundation", "higher"] as const) {
    const context = await browser.newContext({
        ...devices[
          info.project.name === "mobile" ? "iPhone 13" : "Desktop Chrome"
        ],
        viewport: {
          width: info.project.name === "mobile" ? 320 : 1280,
          height: 720,
        },
      }),
      page = await context.newPage();
    await page.goto(route);
    await setTier(page, tier);
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await page
      .getByRole("button", { name: "Start understanding check →", exact: true })
      .click();
    await complete(page, journey.checkForms[0]);
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Start review →", exact: true }),
    ).toHaveCount(0);
    const forms = acidMetalForTier(journey, tier).reviewForms;
    for (let f = 0; f < 3; f++) {
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
          for (const h of p.work["acids-and-neutralisation"].history)
            h.submitted = Date.now() - delay - 1000;
          p.work["acids-and-neutralisation"].run.submitted =
            Date.now() - delay - 1000;
          localStorage.setItem(key, JSON.stringify(p));
        },
        { key: STORAGE_KEY, delay: REVIEW_DELAY },
      );
      await page.reload();
      await page
        .getByRole("button", {
          name: f === 0 ? "Start review →" : "Try the next form",
          exact: true,
        })
        .click();
      if (f < 2) await complete(page, forms[f]);
      else {
        for (let n = 0; n < forms[f].length; n++) {
          await opening(page);
          await expect(
            page.locator(".acid-metal-reference, .assessment-review-criteria"),
          ).toHaveCount(0);
          await shot(
            page,
            `${info.project.name}-${tier}-${["sulfate", "chloride", "method", "redox"][n]}-delayed-opening`,
          );
          await answer(page, forms[f][n]);
          await page
            .getByRole("button", { name: "Record answer", exact: true })
            .click();
          if (n < forms[f].length - 1)
            await page
              .getByRole("button", { name: "Next question →", exact: true })
              .click();
        }
        await page
          .getByRole("button", { name: "Submit whole set", exact: true })
          .click();
        await expect(page.locator(".results-banner")).toContainText(
          `${forms[f].length} of ${forms[f].length} responses saved for self-review`,
        );
      }
    }
    await context.close();
  }
});
test("six keyboard combinations retain the correct salt while independent practice removes the reference", async ({
  page,
}, info) => {
  await page.goto(route);
  await setTier(page, "foundation");
  await choose(page, 6);
  const ref = page.locator(".acid-metal-reference"),
    buttons = page.locator(".acid-metal-buttons button");
  await expect(buttons).toHaveCount(3);
  for (const acid of ["HCl", "H2SO4"]) {
    await page
      .getByRole("combobox", { name: "Dilute acid", exact: true })
      .selectOption(acid);
    for (let n = 0; n < 3; n++) {
      await buttons.nth(n).focus();
      await page.keyboard.press("Enter");
      await expect(buttons.nth(n)).toHaveAttribute("aria-pressed", "true");
      expect(
        (await buttons.nth(n).boundingBox())!.height,
      ).toBeGreaterThanOrEqual(44);
      await expect(ref).toContainText(
        ["Mg", "Zn", "Fe"][n] + (acid === "HCl" ? "Cl2" : "SO4"),
      );
    }
  }
  await shot(page, `${info.project.name}-six-reaction-reference`);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await choose(page, 21);
  await expect(ref).toHaveCount(0);
  await answer(page, added.practice[0], "FeCl3 + water with every acid. 1..2");
  await page
    .getByRole("button", { name: "Save and review explanation", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue("FeCl3 + water with every acid. 1..2");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
