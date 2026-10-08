import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { energyJourney as journey } from "../src/content/journeys/energy-transfer";
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
    page.locator(".energy-workbench .feedback[role=status]"),
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

const route = "/lessons/exothermic-and-endothermic";
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/exothermic-and-endothermic");
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
      if (form === 0 && i === 0)
        await capture(
          page,
          "docs/qa/energy-transfer-" + info.project.name + "-independent.png",
        );
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "exothermic-and-endothermic"
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
      for (const run of p.work["exothermic-and-endothermic"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["exothermic-and-endothermic"].run.submitted =
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
                "exothermic-and-endothermic"
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

async function learn(page: Page, n: number) {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, n);
}
async function openingControl(page: Page, label: string, button = false) {
  await page.evaluate(() => scrollTo(0, 0));
  const control = button
    ? page.getByRole("button", { name: label, exact: true })
    : page.getByLabel(label, { exact: true });
  const b = await control.boundingBox();
  expect(b!.height).toBeGreaterThanOrEqual(44);
  expect(b!.y + b!.height).toBeLessThanOrEqual(664);
}
const guessLabel = "Your requested temperature change / °C";
const classLabel = "Your energy classification";
const recordLabel = "Supplied energy observation";
const shot = (project: string, kind: string) =>
  `docs/qa/energy-transfer-${project}-${kind}.png`;
test("energy transfers retain wrong direction across reload and conserve symbolic total through undo and record reset", async ({
  page,
}, info) => {
  await learn(page, 1);
  await openingControl(page, "Move energy to system", true);
  await page
    .getByRole("button", { name: "Move energy to system", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await select(page, classLabel, "exothermic");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByText("Reacting system: 7 symbolic shares", { exact: true }),
  ).toBeVisible();
  await check(page, false);
  await page
    .getByRole("button", { name: "Move energy to surroundings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Move energy to surroundings", exact: true })
    .click();
  await check(page, true);
  await capture(page, shot(info.project.name, "transfer"));
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await check(page, false);
  await select(page, recordLabel, "cooling");
  await expect(page.getByLabel(classLabel, { exact: true })).toHaveValue(
    "unset",
  );
  await page
    .getByRole("button", { name: "Move energy to system", exact: true })
    .click();
  await select(page, classLabel, "endothermic");
  await check(page, true);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(page.getByLabel(recordLabel, { exact: true })).toHaveValue(
    "initial",
  );
  await expect(
    page.getByText("Reacting system: 6 symbolic shares", { exact: true }),
  ).toBeVisible();
});
test("temperature predictions distinguish signed falls from positive decrease sizes and negative starting values", async ({
  page,
}, info) => {
  await learn(page, 2);
  await openingControl(page, guessLabel);
  await page.getByLabel(guessLabel, { exact: true }).fill("32");
  await select(page, classLabel, "exothermic");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(page.getByLabel(guessLabel, { exact: true })).toHaveValue("32");
  await page.getByLabel(guessLabel, { exact: true }).fill("12");
  await check(page, true);
  await capture(page, shot(info.project.name, "temperature"));
  for (const [record, value, classification] of [
    ["cooling", "-6.5", "endothermic"],
    ["decrease", "5.5", "endothermic"],
    ["decimal", "8.3", "exothermic"],
    ["nonfreezing", "4", "exothermic"],
    ["same", "0", "not-established"],
  ]) {
    await select(page, recordLabel, record);
    await expect(page.getByLabel(guessLabel, { exact: true })).toHaveValue("0");
    await expect(page.getByLabel(classLabel, { exact: true })).toHaveValue(
      "unset",
    );
    await page.getByLabel(guessLabel, { exact: true }).fill(value);
    await select(page, classLabel, classification);
    await check(page, true);
  }
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(page.getByLabel(recordLabel, { exact: true })).toHaveValue(
    "initial",
  );
});
test("graph predictions retain a wrong last-point selection and use supplied baseline and reaction-stage extreme", async ({
  page,
}, info) => {
  await learn(page, 3);
  await openingControl(page, "Your pre-mixing baseline");
  await select(page, "Your pre-mixing baseline", "1");
  await select(page, "Your reaction-stage extreme", "5");
  await page.getByLabel(guessLabel, { exact: true }).fill("6");
  await select(page, classLabel, "exothermic");
  await select(
    page,
    "Your later-stage interpretation",
    "cooling-after-reaction",
  );
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your reaction-stage extreme", { exact: true }),
  ).toHaveValue("5");
  await select(page, "Your reaction-stage extreme", "3");
  await page.getByLabel(guessLabel, { exact: true }).fill("12");
  await check(page, true);
  const fonts = await page
    .locator(".temperature-trace svg text")
    .evaluateAll((nodes) =>
      nodes.map((n) => {
        const b = n.getBoundingClientRect();
        const v = n as SVGGraphicsElement;
        return (
          (b.height / v.getBBox().height) *
          parseFloat(getComputedStyle(n).fontSize)
        );
      }),
    );
  expect(fonts.length).toBeGreaterThan(5);
  for (const size of fonts) expect(size).toBeGreaterThanOrEqual(12);
  await capture(page, shot(info.project.name, "trace"));
  for (const [record, baseline, extreme, value, classification, late] of [
    ["cooling", "2", "4", "-7", "endothermic", "warming-after-reaction"],
    ["minimumSize", "1", "3", "6", "endothermic", "warming-after-reaction"],
    ["stable", "1", "none", "0", "not-established", "not-established"],
  ]) {
    await select(page, recordLabel, record);
    await select(page, "Your pre-mixing baseline", baseline);
    await select(page, "Your reaction-stage extreme", extreme);
    await page.getByLabel(guessLabel, { exact: true }).fill(value);
    await select(page, classLabel, classification);
    await select(page, "Your later-stage interpretation", late);
    await check(page, true);
  }
});
test("product comparison applies all thresholds rather than choosing hottest or longest product", async ({
  page,
}, info) => {
  await learn(page, 4);
  await openingControl(page, "Your qualifying option");
  await expect(page.getByLabel(recordLabel, { exact: true })).toHaveValue(
    "neither",
  );
  await select(page, "Your qualifying option", "B");
  await select(page, "Your comparison reason", "all-constraints");
  await check(page, false);
  await select(page, "Your qualifying option", "neither");
  await check(page, true);
  await capture(page, shot(info.project.name, "use"));
  for (const [record, answer] of [
    ["initial", "A"],
    ["cooler", "A"],
    ["both", "both"],
    ["activation", "A"],
  ]) {
    await select(page, recordLabel, record);
    await expect(
      page.getByLabel("Your qualifying option", { exact: true }),
    ).toHaveValue("unset");
    await select(page, "Your qualifying option", answer);
    await select(page, "Your comparison reason", "all-constraints");
    await check(page, true);
  }
});
test("evidence rejects external-heater and uncontrolled-temperature claims while distinguishing process and electrical heating", async ({
  page,
}, info) => {
  await learn(page, 5);
  await openingControl(page, "Your supported claim");
  await expect(page.getByLabel(recordLabel, { exact: true })).toHaveValue(
    "heater",
  );
  await select(page, "Your supported claim", "exothermic-supported");
  await select(page, "Your evidence reason", "energy-to-surroundings");
  await check(page, false);
  await select(page, "Your supported claim", "not-established");
  await select(page, "Your evidence reason", "external-input-confounds");
  await check(page, true);
  await capture(page, shot(info.project.name, "evidence"));
  for (const [record, claim, reason] of [
    ["spark", "exothermic-supported", "initial-input-not-overall"],
    ["salt", "endothermic-process", "process-not-new-substance-proof"],
    ["electric", "electrical-heating", "no-reaction-evidence"],
    ["capacity", "not-established", "uncontrolled-thermal-context"],
    ["late", "exothermic-supported", "use-reaction-stage"],
  ]) {
    await select(page, recordLabel, record);
    await select(page, "Your supported claim", claim);
    await select(page, "Your evidence reason", reason);
    await check(page, true);
  }
});
test("wrong practice temperature survives targeted recovery and reload without being counted as correct", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 2);
  await page.getByLabel("Your answer", { exact: true }).fill("31.9");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "31.9",
  );
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "31.9",
  );
  await page.getByLabel("Your answer", { exact: true }).fill("8.3");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "That’s right.",
  );
});
test("actual macro apparatus rotates with keyboard and exports the observed reaction-stage Celsius reading", async ({
  page,
}, info) => {
  await learn(page, 2);
  await page
    .getByText("3D temperature apparatus reference", { exact: true })
    .click();
  const group = page.getByRole("group", {
    name: "Rotate temperature apparatus reference",
    exact: true,
  });
  await expect(group).toHaveAttribute("data-ready", "true");
  await page
    .getByRole("button", { name: "Show reaction-stage 32.0 °C", exact: true })
    .click();
  await expect(group).toHaveAttribute("data-reading", "32");
  await expect(group).toHaveAttribute("data-ready", "true");
  await group.focus();
  await page.keyboard.press("ArrowRight");
  await expect(group).toHaveAttribute("data-rotation", "0.1");
  await capture(page, shot(info.project.name, "asset"));
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D apparatus", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("temperature-cup-32.0.glb");
  await download.saveAs(`docs/qa/energy-transfer-${info.project.name}.glb`);
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  // Element-only crops exclude fixed navigation; full-page captures retain it.
  await page.addStyleTag({
    content: ".mobile-bar, .skip-link { visibility: hidden !important; }",
  });
  await page
    .locator(".energy-cup-asset")
    .screenshot({ path: shot(info.project.name, "enlarged") });
});
test("unavailable WebGL preserves explicit temperatures and usable native predictions", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (kind.startsWith("webgl")) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await learn(page, 2);
  await page
    .getByText("3D temperature apparatus reference", { exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "3D is unavailable." }),
  ).toBeVisible();
  await page.getByLabel(guessLabel, { exact: true }).fill("12");
  await select(page, classLabel, "exothermic");
  await check(page, true);
  await capture(page, shot(info.project.name, "fallback"));
});
