import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import { productionPathwaysJourney as journey } from "../src/content/journeys/production-pathways";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function task(page: Page, n: number) {
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
    page.locator(".pathway-workbench .feedback[role=status]"),
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
    const values = JSON.parse(q.answer);
    for (const part of q.parts)
      await page.getByLabel(part.label, { exact: true }).fill(values[part.id]);
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

const route = "/lessons/production-pathways";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/production-pathways");
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
          page.getByLabel(q.parts![0].label, { exact: true }),
        ).toHaveValue(JSON.parse(q.answer)[q.parts![0].id]);
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
                  "production-pathways"
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
      page.getByRole("heading", { name: "4 of 4 correct", exact: true }),
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
      for (const run of p.work["production-pathways"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["production-pathways"].run.submitted = Date.now() - delay - 1000;
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
test("equal-charge output keeps wrong highest-economy choice, reload and canonical reset", async ({
  page,
}, info) => {
  await page.goto(route);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".sample-tier")).toHaveText("Higher");
  await expect(page.getByText("Chemistry only", { exact: true })).toBeVisible();
  const box = await page
    .getByLabel("A collected product", { exact: true })
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await choices(page, {
    "A collected product": "40",
    "B collected product": "54",
    "Greater collected output": "A",
  });
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Greater collected output", { exact: true }),
  ).toHaveValue("A");
  await select(page, "Greater collected output", "B");
  await check(page, true);
  await capture(
    page,
    `docs/qa/production-pathways-${info.project.name}-output.png`,
  );
  await select(page, "Process record", "double");
  await check(page, false);
  await choices(page, {
    "A collected product": "80",
    "B collected product": "108",
  });
  await check(page, true);
  await select(page, "Process record", "changed");
  await choices(page, {
    "B collected product": "30",
    "Greater collected output": "A",
  });
  await check(page, true);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("A collected product", { exact: true }),
  ).toHaveValue("unset");
  await expect(
    page.getByText("Saved work is unreadable", { exact: false }),
  ).toHaveCount(0);
});
test("complete batch times alter output ranking and proportional scale leaves rate fixed", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await choices(page, {
    "A collected output": "90",
    "B collected output": "64",
    "Greater hourly output": "A",
  });
  await check(page, false);
  await choices(page, {
    "A collected output": "30",
    "Greater hourly output": "B",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/production-pathways-${info.project.name}-throughput.png`,
  );
  await select(page, "Process record", "scaled");
  await check(page, true);
  await select(page, "Process record", "delayed");
  await choices(page, {
    "B collected output": "16",
    "Greater hourly output": "A",
  });
  await check(page, true);
});
test("buyer demand retains unsold disposal and does not change desired-product atom economy", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "B unsold co-product": "0",
    "B sales credit": "75",
    "A net included cost": "140",
    "B net included cost": "55",
    "Lower included cost": "B",
    "Desired-product atom economy": "increased",
  });
  await check(page, false);
  await select(page, "Desired-product atom economy", "unchanged");
  await check(page, true);
  await capture(
    page,
    `docs/qa/production-pathways-${info.project.name}-byproducts.png`,
  );
  await select(page, "Process record", "noBuyer");
  await choices(page, {
    "B unsold co-product": "25",
    "B sales credit": "0",
    "B net included cost": "180",
    "Lower included cost": "A",
  });
  await check(page, true);
  await select(page, "Process record", "limitedBuyer");
  await choices(page, {
    "B unsold co-product": "15",
    "B sales credit": "30",
    "B net included cost": "130",
    "Lower included cost": "B",
  });
  await check(page, true);
  await expect(page.locator(".pathway-selected")).toContainText("only 10 kg");
});
test("equilibrium and output use separate units and catalyst never raises equilibrium percentage", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Supplied equilibrium yield": "45",
    "Your collected output": "45",
    "Within the energy limit?": "yes",
    "Catalyst effect on equilibrium": "higher",
  });
  await check(page, false);
  await select(page, "Catalyst effect on equilibrium", "same");
  await check(page, true);
  await capture(
    page,
    `docs/qa/production-pathways-${info.project.name}-conditions.png`,
  );
  await select(page, "Process record", "catalysed");
  await select(page, "Your collected output", "90");
  await check(page, true);
  await expect(
    page.getByRole("img", { name: /Your equilibrium reading/ }),
  ).toHaveAccessibleName(/45 Equilibrium yield \/ %/);
  await expect(
    page.getByRole("img", { name: /Your production-rate calculation/ }),
  ).toHaveAccessibleName(/90 Collected output \/ kg\/h/);
  await select(page, "Process record", "hot");
  await choices(page, {
    "Supplied equilibrium yield": "30",
    "Your collected output": "60",
    "Within the energy limit?": "no",
  });
  await check(page, true);
});
test("eligibility precedes a stated objective and changing the purpose changes the chosen route", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await choices(page, {
    "Your eligible routes": "B",
    "Your route for this purpose": "B",
    "Your decision rule": "largestEconomy",
  });
  await check(page, false);
  await select(page, "Your decision rule", "objective");
  await check(page, true);
  await capture(
    page,
    `docs/qa/production-pathways-${info.project.name}-decision.png`,
  );
  await select(page, "Maximum energy", "11");
  await choices(page, {
    "Your eligible routes": "BC",
    "Your route for this purpose": "C",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/production-pathways-${info.project.name}-decision-comparison.png`,
  );
  await select(page, "Purpose of this comparison", "rate");
  await check(page, false);
  await select(page, "Your route for this purpose", "B");
  await check(page, true);
  await expect(page.locator(".pathway-workbench .feedback")).toContainText(
    "fails the minimum rate",
  );
});
test("all 21 practice tasks preserve chemical assumptions and written review stays non-evidence", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    await task(page, i + 1);
    const q = journey.practice[i];
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.rubric ? "Save and review explanation" : "Check answer",
        exact: true,
      })
      .click();
    await expect(
      page.getByText(q.rubric ? "Compare your explanation." : "That’s right.", {
        exact: true,
      }),
    ).toBeVisible();
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "production-pathways"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
  }
});
test("highest-percentage recovery returns to the original wrong argument", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 2);
  await page
    .getByRole("radio", {
      name: "B wins because its theoretical product is larger",
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Give me a hint", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Apply a supplied yield", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("radio", {
      name: "B wins because its theoretical product is larger",
      exact: true,
    }),
  ).toBeChecked();
});
test("reserved multipart fields align, reject missing parts and clear obsolete warning on edit", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await page.getByLabel("A collected / kg", { exact: true }).fill("48");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".question-panel [role=status]")).toContainText(
    "Complete every part",
  );
  await answer(page, journey.checkForms[0][0]);
  await expect(page.locator(".question-panel [role=status]")).toHaveCount(0);
  const tops = await page
    .locator(".multipart-answer input")
    .evaluateAll((xs) => xs.map((x) => x.getBoundingClientRect().top));
  expect(Math.abs(tops[0] - tops[1])).toBeLessThan(1);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await capture(
    page,
    `docs/qa/production-pathways-${info.project.name}-independent.png`,
  );
});
test("actual quantity chart exports retained predictions with meaningful units and readable rendered text", async ({
  page,
}, info) => {
  await page.goto(route);
  await choices(page, {
    "A collected product": "40",
    "B collected product": "54",
    "Greater collected output": "B",
  });
  await check(page, true);
  const svg = page.getByRole("img", {
    name: /Constructed maximum and collected prediction/,
  });
  const sizes = await svg
    .locator("text")
    .evaluateAll((xs) =>
      xs.map(
        (x) =>
          parseFloat(getComputedStyle(x).fontSize) *
          (x as SVGGraphicsElement).getScreenCTM()!.a,
      ),
    );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
  await expect(svg).toHaveAccessibleName(
    /A supplied maximum: 80 Desired product \/ kg; A your collected amount: 40/,
  );
  const xml = await svg.evaluate((x) => {
    const copy = x.cloneNode(true) as SVGElement;
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    copy.setAttribute("style", "font:16px sans-serif");
    return new XMLSerializer().serializeToString(copy);
  });
  await writeFile(
    `docs/qa/production-pathways-comparison-${info.project.name}.svg`,
    xml,
  );
  await svg.screenshot({
    path: `docs/qa/production-pathways-chart-${info.project.name}.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden!important}",
  });
});
