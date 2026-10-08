import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { titrationTechniqueJourney as journey } from "../src/content/journeys/titration-technique";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
  if (await page.locator(".technique-workbench").count()) {
    const first = page
        .locator(
          ".technique-workbench input,.technique-workbench select,.technique-workbench .particle-choice:not([disabled])",
        )
        .first(),
      box = await first.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  }
}
async function select(page: Page, label: string, value: string) {
  await page.getByLabel(label, { exact: true }).selectOption(value);
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".technique-workbench .feedback[role=status]"),
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

const route = "/lessons/titration-practical";
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/titration-practical");
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
      if (form === 1 && i === 0) {
        await expect(
          page.getByRole("img", { name: /Burette scale window/ }),
        ).toBeVisible();
        await capture(
          page,
          "docs/qa/titration-technique-" +
            test.info().project.name +
            "-fine-independent.png",
        );
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
                  "titration-practical"
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
      for (const run of p.work["titration-practical"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["titration-practical"].run.submitted = Date.now() - delay - 1000;
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

test("all original practice works while two written explanations remain self-reviewed", async ({
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
                "titration-practical"
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
test("burette reading retains final-only mistake through reload and uses keyboard prediction before the asset", async ({
  page,
}, info) => {
  await page.goto(route);
  const input = page.getByLabel("Your predicted delivered titre", {
      exact: true,
    }),
    box = await input.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await input.fill("23.60");
  await select(page, "Your reading position", "bottom-eye-level");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(input).toHaveValue("23.6");
  await input.focus();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("22.40");
  await check(page, true);
  await expect(
    page.getByRole("group", {
      name: "Rotate titration apparatus reference",
      exact: true,
    }),
  ).toHaveAttribute("data-ready", "true");
  await capture(
    page,
    "docs/qa/titration-technique-" + info.project.name + "-reading.png",
  );
  await select(page, "Supplied record", "nonzero");
  await expect(input).toHaveValue("0");
  await expect(
    page.getByLabel("Your reading position", { exact: true }),
  ).toHaveValue("unset");
  await input.fill("25.05");
  await select(page, "Your reading position", "bottom-eye-level");
  await check(page, true);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(input).toHaveValue("0");
  await expect(page.getByLabel("Supplied record", { exact: true })).toHaveValue(
    "initial",
  );
});
test("repeat selector handles boundaries overlapping pairs and a separately stated wider protocol", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await page.getByRole("button", { name: "A: 24.10 cm³", exact: true }).click();
  await page.getByRole("button", { name: "B: 24.15 cm³", exact: true }).click();
  await page.getByRole("button", { name: "C: 24.10 cm³", exact: true }).click();
  await select(page, "Does your selected group meet this protocol?", "yes");
  await check(page, true);
  await expect(
    page.locator(".technique-workbench .model-readout"),
  ).toContainText("24.12 cm³");
  await capture(
    page,
    "docs/qa/titration-technique-" + info.project.name + "-repeats.png",
  );
  await select(page, "Supplied record", "chain");
  await page.getByRole("button", { name: "A: 19.90 cm³", exact: true }).click();
  await page.getByRole("button", { name: "B: 20.00 cm³", exact: true }).click();
  await select(page, "Does your selected group meet this protocol?", "yes");
  await check(page, true);
  await page.getByRole("button", { name: "C: 20.10 cm³", exact: true }).click();
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "C: 20.10 cm³", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await select(page, "Does your selected group meet this protocol?", "no");
  await check(page, true);
  await expect(page.locator(".technique-workbench .feedback")).toContainText(
    "not an accepted mean",
  );
  await select(page, "Supplied record", "wider");
  await page.getByRole("button", { name: "A: 15.25 cm³", exact: true }).click();
  await page.getByRole("button", { name: "B: 15.45 cm³", exact: true }).click();
  await select(page, "Does your selected group meet this protocol?", "yes");
  await check(page, true);
  await expect(page.locator(".technique-workbench .feedback")).toContainText(
    "15.35 cm³",
  );
});
test("six error mechanisms retain wrong predictions and correctly distinguish sample dilution jet filling and unrecorded topup", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await select(page, "Your titre or measured-delivery direction", "smaller");
  await select(page, "Your error mechanism", "diluted-titrant");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your titre or measured-delivery direction", {
      exact: true,
    }),
  ).toHaveValue("smaller");
  for (const [record, direction, reason] of [
    ["initial", "larger", "diluted-titrant"],
    ["pipetteWater", "smaller", "diluted-aliquot"],
    ["flaskWater", "unchanged", "same-aliquot-amount"],
    ["bubble", "larger", "jet-filling-counted"],
    ["overshoot", "larger", "extra-titrant"],
    ["funnel", "smaller", "unrecorded-topup"],
  ]) {
    await select(page, "Supplied record", record);
    await select(page, "Your titre or measured-delivery direction", direction);
    await select(page, "Your error mechanism", reason);
    await check(page, true);
    if (record === "flaskWater")
      await capture(
        page,
        "docs/qa/titration-technique-" + info.project.name + "-errors.png",
      );
  }
});
test("endpoint records distinguish reverse addition temporary patches overshoot and sharp suitable indicators", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  for (const [record, action, colour, reason] of [
    ["initial", "dropwise-swirl", "faint-pink", "control-final-volume"],
    ["reverse", "dropwise-swirl", "colourless", "control-final-volume"],
    ["methyl", "dropwise-swirl", "orange", "control-final-volume"],
    ["temporary", "continue-dropwise", "not-yet-persistent", "local-not-mixed"],
    [
      "overshot",
      "repeat-carefully",
      "beyond-specified-endpoint",
      "cannot-recover-delivered-volume",
    ],
    [
      "broad",
      "choose-suitable-single-indicator",
      "sharp-transition",
      "broad-colour-range",
    ],
  ]) {
    await select(page, "Supplied record", record);
    await select(page, "Your next action", "claim-exact-ph7");
    await select(page, "Your endpoint observation", colour);
    await select(page, "Your endpoint reason", reason);
    await check(page, false);
    await select(page, "Your next action", action);
    await check(page, true);
    if (record === "reverse")
      await capture(
        page,
        "docs/qa/titration-technique-" + info.project.name + "-endpoint.png",
      );
  }
});
test("adjacent method repairs preserve preparation alternatives and restart with record-specific order", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await check(page, false);
  const later = page.getByRole("button", {
    name: "Move step 5 later",
    exact: true,
  });
  await later.focus();
  await page.keyboard.press("Enter");
  await check(page, true);
  await capture(
    page,
    "docs/qa/titration-technique-" + info.project.name + "-sequence.png",
  );
  await saved(page);
  await page.reload();
  await check(page, true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await check(page, false);
  await select(page, "Supplied record", "salt");
  await expect(page.locator(".technique-sequence li").first()).toContainText(
    "Measure fresh solutions",
  );
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Supplied record", { exact: true })).toHaveValue(
    "salt",
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(page.getByLabel("Supplied record", { exact: true })).toHaveValue(
    "initial",
  );
});
test("actual apparatus rotates by keyboard and exports its selected numerical readings and open flask", async ({
  page,
}, info) => {
  await page.goto(route);
  const view = page.getByRole("group", {
    name: "Rotate titration apparatus reference",
    exact: true,
  });
  await expect(view).toHaveAttribute("data-ready", "true");
  await view.focus();
  await page.keyboard.press("ArrowRight");
  await expect(view).toHaveAttribute("data-rotation", "0.1");
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D asset", exact: true })
    .click();
  const download = await downloading;
  const path =
    "docs/qa/titration-technique-" + info.project.name + "-apparatus.glb";
  await download.saveAs(path);
  const fs = await import("node:fs/promises");
  const data = await fs.readFile(path);
  expect(data.readUInt32LE(0)).toBe(0x46546c67);
  expect(data.readUInt32LE(4)).toBe(2);
  expect(data.readUInt32LE(8)).toBe(data.length);
  const json = JSON.parse(
    data.subarray(20, 20 + data.readUInt32LE(12)).toString(),
  );
  expect(
    json.nodes.some((n: { name?: string }) => n.name === "open-conical-flask"),
  ).toBe(true);
  const root = json.nodes.find(
    (n: { name?: string }) =>
      n.name === "titration-apparatus-selected-final-state",
  );
  expect(root.extras).toMatchObject({ initialCm3: 1.2, finalCm3: 23.6 });
  expect(
    json.nodes.filter((n: { mesh?: number }) => n.mesh !== undefined).length,
  ).toBeGreaterThanOrEqual(10);
  await page.locator(".technique-apparatus").screenshot({
    path: "docs/qa/titration-technique-" + info.project.name + "-apparatus.png",
    style: ".mobile-bar,.skip-link{visibility:hidden !important;}",
  });
});
test("unavailable WebGL preserves editable delivery predictions and readable scale", async ({
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
    } as typeof original;
  });
  await page.goto(route);
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await page
    .getByLabel("Your predicted delivered titre", { exact: true })
    .fill("22.4");
  await select(page, "Your reading position", "bottom-eye-level");
  await check(page, true);
  await capture(
    page,
    "docs/qa/titration-technique-" + info.project.name + "-fallback.png",
  );
});
test("fresh independent reading keeps assistance hidden and screenshot inputs usable", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Give me a hint", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Your answer", { exact: true }).fill("25.25");
  await capture(
    page,
    "docs/qa/titration-technique-" + info.project.name + "-independent.png",
  );
});

test("fine scale practice exposes divisions without an answer readout", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 2);
  await expect(
    page.getByRole("img", { name: /Burette scale window/ }),
  ).toBeVisible();
  await page.getByLabel("Your answer", { exact: true }).fill("6.3");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer .feedback")).not.toHaveClass(
    /correct/,
  );
  await page.getByLabel("Your answer", { exact: true }).fill("6.35");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer .feedback")).toHaveClass(
    /correct/,
  );
  for (const svg of await page.locator(".technique-fine-scale svg").all()) {
    const smallest = await svg.evaluate((el) =>
      Math.min(
        ...[...el.querySelectorAll("text")].map((t) => {
          const m = t.getScreenCTM()!;
          return (
            Number(getComputedStyle(t).fontSize.replace("px", "")) *
            Math.hypot(m.a, m.b)
          );
        }),
      ),
    );
    expect(smallest).toBeGreaterThanOrEqual(12);
  }
  await capture(
    page,
    "docs/qa/titration-technique-" + info.project.name + "-fine-scale.png",
  );
});
test("wrong final-only delivery returns from targeted subtraction teaching with its original draft", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 1);
  await page.getByLabel("Your answer", { exact: true }).fill("29.40");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Use both readings", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "29.40",
  );
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "29.40",
  );
});
