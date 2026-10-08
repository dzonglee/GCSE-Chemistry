import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { displacementJourney as journey } from "../src/content/journeys/displacement";
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
    page.locator(".displacement-workbench .feedback[role=status]"),
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

const route = "/lessons/half-equations";
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/half-equations");
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
      if (i === 0 && !q.options) {
        await saved(page);
        await page.reload();
        await expect(
          page.getByLabel("Your answer", { exact: true }),
        ).toHaveValue(q.answer);
      }
      if (form === 0 && i === 2)
        await capture(
          page,
          "docs/qa/displacement-" + info.project.name + "-independent.png",
        );
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work["half-equations"]
                  .run.responses[id]?.fresh,
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
      for (const run of p.work["half-equations"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["half-equations"].run.submitted = Date.now() - delay - 1000;
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
    page.getByRole("heading", { name: "2 of 2 correct", exact: true }),
  ).toBeVisible();
});

test("all original practice works while three written explanations remain self-reviewed", async ({
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
    if (q.rubric) {
      await expect(
        page.locator(".sample-task-answer .feedback[role=status]"),
      ).toContainText("Compare your explanation");
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "half-equations"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    } else
      await expect(
        page.locator(".sample-task-answer [role=status]"),
      ).toContainText("That’s right.");
  }
});
test("whole-half controls reject unequal transfer and retain wrong steps across reload, undo and atomic record reset", async ({
  page,
}, info) => {
  await page.goto(route);
  const increase = page.getByRole("button", {
      name: "Increase Oxidation multiplier",
      exact: true,
    }),
    box = await increase.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await check(page, false);
  await increase.focus();
  await page.keyboard.press("Enter");
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("status").filter({ hasText: "Your proposed answer" }),
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Oxidation multiplier", { exact: true }),
  ).toHaveText("2");
  await check(page, false);
  await select(page, "Supplied reaction record", "zinc");
  await select(page, "Supplied reaction record", "aluminium");
  await expect(
    page.getByLabel("Oxidation multiplier", { exact: true }),
  ).toHaveText("1");
  await page
    .getByRole("button", { name: "Increase Oxidation multiplier", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Increase Reduction multiplier", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Increase Reduction multiplier", exact: true })
    .click();
  await check(page, true);
  await capture(
    page,
    "docs/qa/displacement-" + info.project.name + "-combine.png",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await check(page, false);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Supplied reaction record", { exact: true }),
  ).toHaveValue("aluminium");
});
test("spectator cancellation retains particles and correctly handles two spectator identities", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, 2);
  await select(page, "Your proposed spectator cancellation", "Ag1@aq");
  await check(page, false);
  await select(page, "Your proposed spectator cancellation", "NO3@aq");
  await check(page, true);
  await capture(
    page,
    "docs/qa/displacement-" + info.project.name + "-cancel.png",
  );
  await select(page, "Supplied reaction record", "neutralisation");
  await expect(
    page.getByLabel("Your proposed spectator cancellation", { exact: true }),
  ).toHaveValue("none");
  await select(page, "Your proposed spectator cancellation", "Na1@aq");
  await check(page, false);
  await select(page, "Your proposed spectator cancellation", "Cl1@aq,Na1@aq");
  await check(page, true);
});
test("independent ledgers show atoms-only failure and accept doubled balanced coefficients", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, 3);
  await check(page, false);
  for (const [label, times] of [
    ["First reactant coefficient", 1],
    ["Second reactant coefficient", 2],
    ["First product coefficient", 1],
    ["Second product coefficient", 2],
  ] as const)
    for (let i = 0; i < times; i++)
      await page
        .getByRole("button", { name: "Increase " + label, exact: true })
        .click();
  await check(page, true);
  await capture(
    page,
    "docs/qa/displacement-" + info.project.name + "-ledger.png",
  );
  for (const [label, times] of [
    ["First reactant coefficient", 2],
    ["Second reactant coefficient", 3],
    ["First product coefficient", 2],
    ["Second product coefficient", 3],
  ] as const)
    for (let i = 0; i < times; i++)
      await page
        .getByRole("button", { name: "Increase " + label, exact: true })
        .click();
  await check(page, true);
});
test("representation choices preserve solid and molecular terms and nonzero equal charge", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, 4);
  await select(page, "Supplied reaction record", "initial");
  await select(page, "Your representation", "split-all");
  await select(page, "Your representation reason", "dissolved-salt");
  await check(page, false);
  await select(page, "Your representation", "separate-ions");
  await check(page, true);
  await select(page, "Supplied reaction record", "nonzero");
  await select(page, "Your representation", "equal-not-zero");
  await select(page, "Your representation reason", "charge-conservation");
  await check(page, true);
  await capture(
    page,
    "docs/qa/displacement-" + info.project.name + "-representation.png",
  );
});
test("balanced reverse proposal is rejected using supplied ranking and surface barrier is distinguished", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, 5);
  await select(page, "Supplied reaction record", "reverse");
  await select(page, "Your occurrence conclusion", "yes-because-balanced");
  await select(page, "Your feasibility reason", "balance-proves-reaction");
  await select(page, "Species actually oxidised", "Cu");
  await select(page, "Species actually reduced", "Cu²⁺");
  await check(page, false);
  await select(page, "Your occurrence conclusion", "no");
  await select(page, "Your feasibility reason", "metal-less-reactive");
  await select(page, "Species actually oxidised", "none");
  await select(page, "Species actually reduced", "none");
  await check(page, true);
  await capture(
    page,
    "docs/qa/displacement-" + info.project.name + "-feasibility.png",
  );
  await select(page, "Supplied reaction record", "passivation");
  await select(page, "Your occurrence conclusion", "no-detectable-change");
  await select(page, "Your feasibility reason", "surface-barrier");
  await select(page, "Species actually oxidised", "not-detected");
  await select(page, "Species actually reduced", "not-detected");
  await check(page, true);
});
test("actual 3D correspondence rotates substances separately and downloads real conserved nitrate geometry", async ({
  page,
}, info) => {
  await page.goto(route);
  await page
    .getByText("3D copper/silver reference with nitrate spectators", {
      exact: true,
    })
    .click();
  const canvas = page.getByRole("group", {
    name: "Rotate copper silver displacement reference",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await page
    .getByRole("button", { name: "Enlarge after state", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-focus", "after");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.1");
  await capture(
    page,
    "docs/qa/displacement-" + info.project.name + "-asset.png",
  );
  await page.locator(".displacement-asset").screenshot({
    path: "docs/qa/displacement-" + info.project.name + "-enlarged-after.png",
    style: ".mobile-bar,.skip-link{visibility:hidden}",
  });
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D asset", exact: true })
    .click();
  const file = await download;
  await file.saveAs("docs/qa/displacement-" + info.project.name + ".glb");
});
test("WebGL unavailable retains particle, signed charge and editable half scaling reference", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).startsWith("webgl")) return null;
      return original.apply(this, args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto(route);
  await page
    .getByText("3D copper/silver reference with nitrate spectators", {
      exact: true,
    })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await select(page, "Supplied reaction record", "initial");
  await page
    .getByRole("button", { name: "Increase Reduction multiplier", exact: true })
    .click();
  await check(page, true);
  await capture(
    page,
    "docs/qa/displacement-" + info.project.name + "-fallback.png",
  );
});
test("wrong silver multiplier returns from targeted recovery with the original draft retained", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await page.getByLabel("Your answer", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.locator(".sample-task-answer .feedback[role=status]"),
  ).not.toHaveClass(/correct/);
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: false })
    .click();
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "1",
  );
  await page.getByLabel("Your answer", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.locator(".sample-task-answer .feedback[role=status]"),
  ).toContainText("That’s right.");
});
