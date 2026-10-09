import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { phJourney as journey } from "../src/content/journeys/ph";
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
    page.locator(".ph-workbench .feedback[role=status]"),
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
      .fill(q.answer);
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}

const route = "/lessons/ph-scale-and-indicators";
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/ph-scale-and-indicators");
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
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "ph-scale-and-indicators"
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
      for (const run of p.work["ph-scale-and-indicators"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["ph-scale-and-indicators"].run.submitted =
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

test("all practice works while complete writing remains self-reviewed", async ({
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
        name: q.writtenEquations
          ? "Save and review equations"
          : q.rubric
            ? "Save and review explanation"
            : "Check answer",
        exact: true,
      })
      .click();
    if (q.rubric) {
      await expect(
        page.locator(".sample-task-answer .feedback[role=status]"),
      ).toContainText(
        q.writtenEquations
          ? "Compare your equations"
          : "Compare your explanation",
      );
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "ph-scale-and-indicators"
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
test("pH classification preserves a wrong claim, reload, keyboard controls and atomic record reset", async ({
  page,
}, info) => {
  await page.goto(route);
  const acid = page.getByRole("button", { name: "Acidic", exact: true });
  const box = await acid.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await page.getByRole("button", { name: "Neutral", exact: true }).click();
  await select(page, "Your acid/alkali ion comparison", "none");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Neutral", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await acid.focus();
  await page.keyboard.press("Enter");
  await select(page, "Your acid/alkali ion comparison", "H+");
  await check(page, true);
  await expect(
    page.getByRole("group", { name: "Rotate pH probe reference", exact: true }),
  ).toHaveAttribute("data-ready", "true");
  await capture(page, "docs/qa/ph-" + info.project.name + "-probe.png");
  await select(page, "Explore a supplied pH record", "alkaline");
  await expect(
    page.getByLabel("Your acid/alkali ion comparison", { exact: true }),
  ).toHaveValue("unset");
  await expect(acid).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Alkaline", exact: true }).click();
  await select(page, "Your acid/alkali ion comparison", "OH−");
  await check(page, true);
  const canvas = page.getByRole("group", {
    name: "Rotate pH probe reference",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.1");
  await canvas.screenshot({
    path: "docs/qa/ph-" + info.project.name + "-asset.png",
    style: ".mobile-bar,.skip-link{visibility:hidden!important;}",
  });
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D asset", exact: true })
    .click();
  const d = await pending;
  await d.saveAs("docs/qa/ph-" + info.project.name + "-probe.glb");
  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile((await d.path())!);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const len = bytes.readUInt32LE(12),
    g = JSON.parse(bytes.subarray(20, 20 + len).toString());
  expect(
    g.nodes.some(
      (n: { extras?: { phReading?: number } }) => n.extras?.phReading === 11.6,
    ),
  ).toBe(true);
  expect(
    g.nodes.some((n: { extras?: { atomicId?: string } }) => n.extras?.atomicId),
  ).toBe(false);
  const bin = 28 + len;
  for (const mesh of g.meshes) {
    const a = g.accessors[mesh.primitives[0].attributes.POSITION],
      v = g.bufferViews[a.bufferView],
      start = bin + (v.byteOffset ?? 0) + (a.byteOffset ?? 0);
    expect(a.componentType).toBe(5126);
    for (let i = 0; i < a.count * 3; i++)
      expect(Number.isFinite(bytes.readFloatLE(start + i * 4))).toBe(true);
  }
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Explore a supplied pH record", { exact: true }),
  ).toHaveValue("initial");
});
test("colour range, named indicator, neutralisation graph and reference evidence require separate predictions", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "Increase guess by 1 →", exact: true })
      .click();
  await page.getByRole("button", { name: "Acidic", exact: true }).click();
  await select(page, "Your reading confidence", "exact-every-time");
  await check(page, false);
  await select(page, "Your reading confidence", "approximate");
  await check(page, true);
  await page.getByLabel("Your answer", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "That’s right.",
  );
  await capture(page, "docs/qa/ph-" + info.project.name + "-colour.png");
  await task(page, 3);
  await select(page, "Your indicator colour", "colourless");
  await select(page, "Does the supplied evidence establish neutrality?", "no");
  await check(page, true);
  await select(page, "Explore a supplied pH record", "unknown");
  await select(page, "Your indicator colour", "colourless");
  await select(page, "Does the supplied evidence establish neutrality?", "yes");
  await check(page, false);
  await select(
    page,
    "Does the supplied evidence establish neutrality?",
    "not-established",
  );
  await check(page, true);
  await capture(page, "docs/qa/ph-" + info.project.name + "-indicator.png");
  await task(page, 4);
  for (let i = 0; i < 5; i++)
    await page
      .getByRole("button", { name: "Next observation →", exact: true })
      .click();
  await page.getByRole("button", { name: "Neutral", exact: true }).click();
  await select(page, "Your neutralisation reactant excess", "matched");
  await check(page, true);
  await expect(page.locator(".ph-measurements table")).toContainText("25");
  await capture(page, "docs/qa/ph-" + info.project.name + "-graph.png");
  await select(page, "Explore a supplied pH record", "powder");
  await expect(
    page.getByLabel("Your neutralisation reactant excess", { exact: true }),
  ).toHaveValue("unset");
  await expect(page.locator(".ph-measurements table")).toContainText("g");
  await task(page, 5);
  await select(page, "Your measurement conclusion", "reported-reading");
  await select(page, "Your evidence reason", "checked-reference");
  await check(page, true);
  await capture(page, "docs/qa/ph-" + info.project.name + "-measurement.png");
});
test("WebGL fallback keeps numerical reading and editable acid/alkali predictions", async ({
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
  await expect(page.getByText(/3D is unavailable/)).toBeVisible();
  await page.getByRole("button", { name: "Acidic", exact: true }).click();
  await select(page, "Your acid/alkali ion comparison", "H+");
  await check(page, true);
  await capture(page, "docs/qa/ph-" + info.project.name + "-fallback.png");
});
test("wrong numeric range survives targeted recovery and independent curve is static", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 6);
  await page.getByLabel("Your answer", { exact: true }).fill("7");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.locator(".sample-task-answer .feedback.correct"),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "7",
  );
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "7",
  );
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 2; i++) {
    await answer(page, journey.checkForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
  }
  await expect(page.locator(".ph-measurements table")).toContainText("12");
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Next observation →", exact: true }),
  ).toHaveCount(0);
  await capture(page, "docs/qa/ph-" + info.project.name + "-independent.png");
  expect(
    await page.locator(".ph-measurements svg text").evaluateAll((nodes) =>
      nodes.every((n) => {
        const m = (n as SVGGraphicsElement).getScreenCTM()!;
        return Number(n.getAttribute("font-size")) * Math.hypot(m.a, m.b) >= 12;
      }),
    ),
  ).toBe(true);
});
