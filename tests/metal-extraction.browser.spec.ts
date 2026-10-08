import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { metalExtractionJourney as journey } from "../src/content/journeys/metal-extraction";
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
    page.locator(".metal-extraction-workbench .feedback[role=status]"),
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

const route = "/lessons/metal-extraction";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/metal-extraction");
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
          page.getByRole("radio", { name: q.answer, exact: true }),
        ).toBeChecked();
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work["metal-extraction"]
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
      for (const run of p.work["metal-extraction"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["metal-extraction"].run.submitted = Date.now() - delay - 1000;
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

test("all original practice works while four written explanations remain self-reviewed", async ({
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
                "metal-extraction"
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

test("fresh changed reaction check hides assistance and premature feedback", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await answer(page, journey.checkForms[0][0]);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".feedback.correct")).toHaveCount(0);
  await capture(
    page,
    `docs/qa/metal-extraction-${info.project.name}-independent.png`,
  );
});
test("route predictions preserve wrong chemical reasons and fit the opening mobile viewport", async ({
  page,
}, info) => {
  await page.goto(route);
  const control = page.getByLabel("Your extraction route", { exact: true });
  await expect(control).toBeVisible();
  const box = await control.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await choices(page, {
    "Your extraction route": "carbon-reduction",
    "Your chemical reason": "cheapest-always-works",
  });
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your chemical reason", { exact: true }),
  ).toHaveValue("cheapest-always-works");
  await select(page, "Your chemical reason", "carbon-more-reactive");
  await check(page, true);
  await select(page, "Explore a supplied extraction record", "aluminium");
  await check(page, false);
  await choices(page, {
    "Your extraction route": "electrolysis",
    "Your chemical reason": "carbon-cannot-reduce",
  });
  await check(page, true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await check(page, false);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(control).toHaveValue("unset");
  await capture(
    page,
    `docs/qa/metal-extraction-${info.project.name}-route.png`,
  );
});
test("native mixtures and carbonate preparation do not manufacture extracted metal", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await select(page, "Explore a supplied extraction record", "gold");
  await choices(page, {
    "Your material identity": "pure-metal-guaranteed",
    "Your required change": "physical-separation-may-be-needed",
  });
  await check(page, false);
  await select(page, "Your material identity", "uncombined-metal-in-mixture");
  await check(page, true);
  await select(page, "Explore a supplied extraction record", "carbonate");
  await choices(page, {
    "Your material identity": "metal-compound-in-mixture",
    "Your required change": "oxide-preparation-not-metal-extraction",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/metal-extraction-${info.project.name}-source.png`,
  );
});
test("oxygen removal uses the correct supplied carbon product and real inventory", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your oxide reduced": "CuO",
    "Your carbon product": "CO2",
    "Your oxygen atoms transferred": "2",
  });
  await check(page, true);
  const model = page.getByRole("group", {
    name: "Rotate oxygen transfer states",
    exact: true,
  });
  await expect(model).toHaveAttribute("data-ready", "true");
  await model.focus();
  await page.keyboard.press("ArrowRight");
  await expect(model).toHaveAttribute("data-rotation", "0.1");
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download 3D asset", exact: true })
    .click();
  const d = await pending;
  const { readFile } = await import("node:fs/promises");
  const buf = await readFile((await d.path())!);
  expect(buf.subarray(0, 4).toString()).toBe("glTF");
  expect(buf.readUInt32LE(8)).toBe(buf.length);
  await d.saveAs(`docs/qa/metal-extraction-${info.project.name}-transfer.glb`);
  await capture(
    page,
    `docs/qa/metal-extraction-${info.project.name}-oxygen.png`,
  );
  await select(page, "Explore a supplied extraction record", "nickel");
  await check(page, false);
  await choices(page, {
    "Your oxide reduced": "NiO",
    "Your carbon product": "CO",
    "Your oxygen atoms transferred": "1",
  });
  await check(page, true);
  await expect(model).toHaveCount(0);
});
test("ore scale distinguishes compound mass from contained maximum and keeps labels readable", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Your oxide mass / kg": "25",
    "Your contained metal maximum / kg": "25",
  });
  await check(page, false);
  await select(page, "Your contained metal maximum / kg", "20");
  await check(page, true);
  await expect(page.locator(".extraction-mass-ledger")).toContainText(
    "not particle counts",
  );
  await capture(
    page,
    `docs/qa/metal-extraction-${info.project.name}-grade.png`,
  );
  await select(page, "Explore a supplied extraction record", "iron");
  await choices(page, {
    "Your oxide mass / kg": "60",
    "Your contained metal maximum / kg": "42",
  });
  await check(page, true);
});
test("complete batch comparisons permit neither under simultaneous constraints", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await choices(page, {
    "Your route A cost / £ per kg": "4",
    "Your route B cost / £ per kg": "4.5",
    "Your route meeting the priority": "A",
  });
  await check(page, true);
  await select(page, "Explore a supplied extraction record", "emissions");
  await check(page, false);
  await select(page, "Your route meeting the priority", "B");
  await check(page, true);
  await select(page, "Explore a supplied extraction record", "both");
  await check(page, false);
  await select(page, "Your route meeting the priority", "neither");
  await check(page, true);
  await capture(
    page,
    `docs/qa/metal-extraction-${info.project.name}-decision.png`,
  );
});

test("mass chart text remains at least12 actual pixels on each viewport", async ({
  page,
}) => {
  await page.goto(route);
  await task(page, 4);
  const sizes = await page
    .locator(".extraction-mass-ledger svg text")
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const t = node as SVGTextElement,
          m = t.getScreenCTM()!;
        return parseFloat(getComputedStyle(t).fontSize) * Math.hypot(m.c, m.d);
      }),
    );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
});
test("wrong chemical route returns from targeted recovery with original answer retained", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const wrong = "Carbon reduction";
  await page.getByRole("radio", { name: wrong, exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.locator(".sample-task-answer .feedback[role=status]"),
  ).toContainText("Not yet");
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByText(
      "Given C > Fe, why can carbon reduce the supplied iron oxide under suitable conditions?",
      { exact: true },
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: wrong, exact: true }),
  ).toBeChecked();
});
test("WebGL unavailable retains chemical inventory and editable extraction prediction", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind,
      ...args
    ) {
      if (String(kind).startsWith("webgl")) return null;
      return get.call(this, kind, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto(route);
  await task(page, 3);
  await expect(
    page.getByText("Before: two Cu", { exact: false }).first(),
  ).toBeVisible();
  await choices(page, {
    "Your oxide reduced": "CuO",
    "Your carbon product": "CO2",
    "Your oxygen atoms transferred": "2",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/metal-extraction-${info.project.name}-fallback.png`,
  );
});
