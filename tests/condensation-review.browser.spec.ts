import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { polymerisationJourney as j } from "../src/content/journeys/polymerisation";
import {
  condensationAdditions as added,
  polyesterReferenceChain,
} from "../src/content/journeys/condensation-writing";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { LearningTask } from "../src/content/types";
import {
  assertCondensationNativeDevice,
  captureCondensationNative,
} from "./condensation-native-capture";
const route = "/lessons/polymers";
const out = "test-results/qa/condensation-review-final";
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function tier(page: Page, value: "foundation" | "higher") {
  await page.goto("/preferences");
  await page.getByLabel("Tier", { exact: true }).selectOption(value);
  await page
    .getByLabel("Qualification", { exact: true })
    .selectOption("separate");
  await saved(page);
}
async function tap(page: Page, name: string) {
  const button = page.getByRole("button", { name, exact: true });
  if (test.info().project.name === "mobile") await button.tap();
  else await button.click();
}
async function practice(page: Page, id: string) {
  await tap(page, "Practise");
  await page
    .getByLabel("Choose a practice task", { exact: true })
    .selectOption(String(j.practice.findIndex((q) => q.id === id)));
}
async function layout(page: Page, label: string) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await assertCondensationNativeDevice(page);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    label,
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(await page.evaluate(() => innerWidth), label).toBe(
    page.viewportSize()!.width,
  );
  const sizes = await page
    .locator(
      ".sample-task-layout svg text, .assessment-session svg text, .assessment-results svg text, [data-condensation-construction] svg text",
    )
    .evaluateAll((nodes) =>
      nodes
        .filter((n) => n.getClientRects().length > 0)
        .map((n) => {
          const el = n as SVGTextElement,
            m = el.getScreenCTM();
          return (
            parseFloat(getComputedStyle(el).fontSize) *
            (m ? Math.hypot(m.a, m.b) : 1)
          );
        }),
    );
  const unreadable = page.getByRole("button", {
    name: "Start a new condensation construction",
    exact: true,
  });
  if (await unreadable.count()) {
    await expect(unreadable).toHaveCount(1);
    await expect(
      page.locator("[data-condensation-construction] svg"),
    ).toHaveCount(0);
    await expect(
      page.getByText(
        "This work cannot be read. It stays saved until you start again.",
        { exact: true },
      ),
    ).toBeVisible();
  } else if (await page.locator("[data-condensation-construction]").count())
    expect(sizes.length, label).toBeGreaterThan(0);
  for (const size of sizes) expect(size, label).toBeGreaterThanOrEqual(12);
  expect((await new AxeBuilder({ page }).analyze()).violations, label).toEqual(
    [],
  );
  return {
    width: page.viewportSize()!.width,
    svgSizes: sizes,
    touch: await page.evaluate(() => navigator.maxTouchPoints),
    dpr: await page.evaluate(() => devicePixelRatio),
  };
}
async function geometry(page: Page, first: string, label: string) {
  const result = await layout(page, label);
  const b = (await page.locator(first).first().boundingBox())!;
  expect(b.height, label).toBeGreaterThanOrEqual(44);
  expect(b.y + b.height, label).toBeLessThanOrEqual(664);
  return { label, b, ...result };
}
async function shot(page: Page, name: string) {
  await mkdir(out, { recursive: true });
  await captureCondensationNative(page, async () => {
    await page.screenshot({
      path: `${out}/${name}-viewport.png`,
      scale: "css",
    });
    await page.screenshot({
      path: `${out}/${name}-full.png`,
      fullPage: true,
      scale: "css",
    });
  });
  await assertCondensationNativeDevice(page);
}
async function construct(page: Page, q: LearningTask, wrong = false) {
  const data = q.polyesterDrawing!;
  if (data.construction === "groups") {
    for (const end of ["diolLeft", "diolRight", "acidLeft", "acidRight"]) {
      await tap(
        page,
        `Edit ${end.startsWith("diol") ? "diol" : "diacid"} ${end.endsWith("Left") ? "left" : "right"}`,
      );
      const root = page.locator('[data-condensation-construction="groups"]');
      await root
        .locator(`[id$="${end}O"]`)
        .selectOption(wrong && end === "diolLeft" ? "2" : "1");
      await root.locator(`[id$="${end}H"]`).selectOption("1");
      if (end.startsWith("acid"))
        await root.locator(`[id$="${end}Carbonyl"]`).selectOption("2");
    }
    await tap(page, "Edit diol left");
  } else {
    const chain = polyesterReferenceChain(data);
    for (const a of chain) {
      await tap(page, `Add ${a.atom === "CH2" ? "CH₂" : a.atom}`);
      if (a.atom === "C")
        await page
          .getByLabel("Separate O attached to this C", { exact: true })
          .selectOption(wrong ? "1" : a.oxygen);
    }
    const root = page.locator('[data-condensation-construction="sequence"]');
    for (const key of ["left", "right", "brackets"])
      await root.locator(`[id$="${key}"]`).selectOption("1");
    await root
      .locator('[id$="countMark"]')
      .selectOption(wrong ? "inside" : "n");
  }
}
async function readWork(page: Page) {
  await saved(page);
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).work.polymers,
    STORAGE_KEY,
  );
}
for (const width of [320, 390, 1280]) {
  test(`fonts-ready ${width}: original and new guided/practice construction controls, readable SVGs and axe`, async ({
    page,
  }, info) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 664 });
    await tier(page, "higher");
    await page.goto(route);
    const rows = [];
    for (const n of [6, 8]) {
      await tap(page, "Learn");
      await page
        .getByRole("button", { name: `Task ${n}`, exact: true })
        .first()
        .click();
      rows.push(
        await geometry(
          page,
          n === 6
            ? ".polymerisation-workbench select"
            : "[data-condensation-construction] select",
          `guided-${n}`,
        ),
      );
      if (n === 8) {
        await construct(page, added.guided[0]);
        await geometry(
          page,
          "[data-condensation-construction] select",
          "guided-groups-built",
        );
        await shot(page, `${info.project.name}-${width}-guided`);
      }
    }
    for (const id of [
      "pol-v1-p-polyester1",
      "pol-v1-p-polyester2",
      "pol-v1-p-polyester3",
      ...added.practice.map((q) => q.id),
    ]) {
      await practice(page, id);
      rows.push(
        await geometry(
          page,
          "[data-condensation-construction] select, [data-condensation-construction] button",
          id,
        ),
      );
      await expect(page.locator(".polymerisation-review")).toHaveCount(0);
      if (id === added.practice[1].id) {
        await construct(page, added.practice[1], true);
        rows.push(
          await geometry(
            page,
            "[data-condensation-construction] button",
            "wrong-repeat-built",
          ),
        );
        await shot(page, `${info.project.name}-${width}-practice-wrong-repeat`);
      }
    }
    await mkdir(out, { recursive: true });
    await writeFile(
      `${out}/${info.project.name}-${width}-geometry.json`,
      JSON.stringify(rows, null, 2),
    );
  });
  test(`fonts-ready ${width}: both Higher cold forms, sealed criteria, manual marks, preserved history and actual seven-day retrieval`, async ({
    page,
  }, info) => {
    test.setTimeout(240000);
    await page.setViewportSize({ width, height: 664 });
    await tier(page, "higher");
    await page.goto(route);
    await tap(page, "Check");
    await tap(page, "Start understanding check →");
    const rows = [];
    for (let f = 0; f < 2; f++) {
      for (let i = 0; i < 3; i++) {
        const q = added.checkForms[f][i];
        if (i) await tap(page, "Next question →");
        await expect(page.locator(".polymerisation-review")).toHaveCount(0);
        await expect(
          page.locator(".feedback, .assessment-results"),
        ).toHaveCount(0);
        await expect(page.getByText(q.answer, { exact: true })).toHaveCount(0);
        if (q.rubric)
          rows.push(
            await geometry(
              page,
              "[data-condensation-construction] select, [data-condensation-construction] button",
              q.id,
            ),
          );
        else rows.push(await geometry(page, ".question-panel input", q.id));
        if (q.polyesterDrawing) {
          await tap(page, "Record answer");
          await expect(
            page.getByRole("button", { name: "Next question →", exact: true }),
          ).toBeDisabled();
          if (f === 0 && i === 0) {
            await saved(page);
            await page.evaluate(
              ({ key, id }) => {
                const p = JSON.parse(localStorage.getItem(key)!);
                p.work.polymers.drafts[id] =
                  "original malformed reserved construction";
                localStorage.setItem(key, JSON.stringify(p));
              },
              { key: STORAGE_KEY, id: q.id },
            );
            await page.reload();
            rows.push(
              await geometry(
                page,
                "[data-condensation-construction] button",
                q.id + "-unreadable-retained",
              ),
            );
            await tap(page, "Record answer");
            const invalidMessage = page.getByText(
              "Your saved construction cannot be read. Your work is retained; start a new construction explicitly, or leave this question unanswered.",
              { exact: true },
            );
            await expect(invalidMessage).toBeVisible();
            expect((await readWork(page)).drafts[q.id]).toBe(
              "original malformed reserved construction",
            );
            expect((await readWork(page)).run.responses[q.id]).toBeUndefined();
            await expect(
              page.getByRole("button", {
                name: "Next question →",
                exact: true,
              }),
            ).toBeDisabled();
            await tap(page, "Start a new condensation construction");
            await expect(invalidMessage).toHaveCount(0);
          }
          await construct(page, q, f === 0);
          await geometry(
            page,
            "[data-condensation-construction] select, [data-condensation-construction] button",
            q.id + "-built",
          );
          if (i === 1 && width < 500) {
            const scroll = page.locator(".condensation-scroll").first();
            expect(
              await scroll.evaluate((e) => e.scrollWidth > e.clientWidth),
            ).toBe(true);
            await scroll.focus();
            await page.keyboard.press("ArrowRight");
            await expect
              .poll(() => scroll.evaluate((e) => e.scrollLeft))
              .toBeGreaterThan(0);
            await page.keyboard.press("ArrowLeft");
          }
          if (i === 1)
            await shot(
              page,
              `${info.project.name}-${width}-independent-repeat${f === 1 ? "-correct" : ""}`,
            );
          if (f === 0 && i === 0)
            await shot(
              page,
              `${info.project.name}-${width}-independent-groups`,
            );
        } else
          await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
        await saved(page);
        const before = (await readWork(page)).drafts[q.id];
        await page.reload();
        expect((await readWork(page)).drafts[q.id]).toBe(before);
        await tap(page, "Record answer");
        await saved(page);
        expect((await readWork(page)).run.responses[q.id].correct).toBe(
          !q.rubric,
        );
        await expect(page.locator(".polymerisation-review")).toHaveCount(0);
        await expect(
          page.getByText(q.rubric?.[0] ?? "REFERENCE NEVER", { exact: true }),
        ).toHaveCount(0);
      }
      await tap(page, "Submit whole set");
      await expect(
        page.getByRole("heading", { name: "1 of 1 correct", exact: true }),
      ).toBeVisible();
      await page
        .locator(".assessment-results details")
        .first()
        .locator("summary")
        .click();
      const references = page.locator(
        ".assessment-results .polymerisation-review",
      );
      await expect(references).toHaveCount(2);
      await expect(references.first()).toBeVisible();
      await expect(references.last()).not.toBeVisible();
      await layout(page, "submitted groups and reference");
      for (const el of await page
        .locator("[data-condensation-construction] select")
        .all())
        await expect(el).toBeDisabled();
      await expect(
        page.getByText(added.checkForms[f][0].rubric![0], { exact: true }),
      ).toBeVisible();
      if (f === 0) {
        await shot(
          page,
          `${info.project.name}-${width}-submitted-groups-reference`,
        );
      }
      await page
        .locator(".assessment-results details")
        .nth(1)
        .locator("summary")
        .click();
      await expect(references.first()).toBeVisible();
      await expect(references.last()).toBeVisible();
      await layout(page, "submitted groups and repeat references together");
      if (f === 0) {
        await tap(page, "Try the next form");
      }
    }
    const history = (await readWork(page)).history;
    expect(history).toHaveLength(2);
    await tap(page, "Review");
    await expect(
      page.getByRole("button", { name: "Start review →", exact: true }),
    ).toHaveCount(0);
    const submitted = history.at(-1).submitted;
    await page.clock.setFixedTime(submitted + REVIEW_DELAY - 1);
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Start review →", exact: true }),
    ).toHaveCount(0);
    expect((await readWork(page)).history).toEqual(history);
    await page.clock.setFixedTime(submitted + REVIEW_DELAY + 1000);
    await page.reload();
    await tap(page, "Start review →");
    expect((await readWork(page)).history).toEqual(history);
    for (let f = 0; f < 2; f++) {
      for (let i = 0; i < 2; i++) {
        const q = added.reviewForms[f][i];
        if (i) await tap(page, "Next question →");
        await expect(page.locator(".polymerisation-review")).toHaveCount(0);
        rows.push(
          await geometry(
            page,
            "[data-condensation-construction] select, [data-condensation-construction] button",
            q.id,
          ),
        );
        await construct(page, q);
        await tap(page, "Record answer");
        const response = (await readWork(page)).run.responses[q.id];
        expect(response.correct).toBe(false);
        expect(response.fresh).toBe(false);
      }
      await tap(page, "Submit whole set");
      await expect(page.locator(".assessment-results")).toContainText(
        "self-review",
      );
      if (f === 0) {
        const retained = (await readWork(page)).history;
        const last = retained.at(-1).submitted;
        await page.clock.setFixedTime(last + REVIEW_DELAY + 1000);
        await page.reload();
        expect((await readWork(page)).history).toEqual(retained);
        await tap(page, "Try the next form");
      }
    }
    await mkdir(out, { recursive: true });
    await writeFile(
      `${out}/${info.project.name}-${width}-cold-geometry.json`,
      JSON.stringify(rows, null, 2),
    );
  });
}
test("wrong and unreadable constructions retain exact bytes; malformed work cannot record and scoped reset preserves siblings", async ({
  page,
}) => {
  await tier(page, "higher");
  await page.goto(route);
  for (const q of added.practice) {
    await practice(page, q.id);
    await construct(page, q, true);
    const before = (await readWork(page)).drafts[q.id];
    await page.reload();
    expect((await readWork(page)).drafts[q.id]).toBe(before);
    await tap(page, "Save and review structure");
    await expect(page.locator(".polymerisation-review")).toBeVisible();
    expect((await readWork(page)).attempts[q.id].at(-1)).toMatchObject({
      answer: before,
      correct: false,
      fresh: false,
    });
    await saved(page);
    await page.evaluate(
      ({ key, id }) => {
        const p = JSON.parse(localStorage.getItem(key)!);
        p.work.polymers.drafts[id] = "original malformed construction bytes";
        p.work.polymers.drafts["pol-v1-p-propene"] =
          "untouched addition sibling";
        localStorage.setItem(key, JSON.stringify(p));
      },
      { key: STORAGE_KEY, id: q.id },
    );
    await page.reload();
    await expect(
      page.getByRole("button", {
        name: "Start a new condensation construction",
        exact: true,
      }),
    ).toBeVisible();
    const attempts = (await readWork(page)).attempts[q.id];
    await tap(page, "Save and review structure");
    expect((await readWork(page)).attempts[q.id]).toEqual(attempts);
    expect((await readWork(page)).drafts[q.id]).toBe(
      "original malformed construction bytes",
    );
    await tap(page, "Start a new condensation construction");
    const work = await readWork(page);
    expect(work.drafts["pol-v1-p-propene"]).toBe("untouched addition sibling");
  }
});
test("helped equivalent construction cannot be fresh in a reserved Higher form", async ({
  page,
}) => {
  await tier(page, "higher");
  await page.goto(route);
  await practice(page, added.practice[0].id);
  await tap(page, "Give me a hint");
  await tap(page, "Check");
  await tap(page, "Start understanding check →");
  const run = (await readWork(page)).run;
  expect(
    (await readWork(page)).drafts["fresh:" + added.checkForms[0][0].id],
  ).toBe("false");
  await construct(page, added.checkForms[0][0]);
  await tap(page, "Record answer");
  expect(
    (await readWork(page)).run.responses[added.checkForms[0][0].id],
  ).toMatchObject({ fresh: false, correct: false });
  const recorded = (await readWork(page)).run;
  await tier(page, "foundation");
  await page.goto(route);
  await expect(
    page.locator('[data-condensation-construction="groups"]'),
  ).toBeVisible();
  expect((await readWork(page)).run).toEqual(recorded);
  expect(recorded.ids).toEqual(run.ids);
});
test("a started ORIGINAL addition form survives a Higher switch with answer bytes and reserved IDs intact", async ({
  page,
}) => {
  await tier(page, "foundation");
  await page.goto(route);
  await tap(page, "Check");
  await tap(page, "Start understanding check →");
  const root = page.locator(".polymerisation-drawing");
  await root.locator('[id$="s0"]').selectOption("F");
  await tap(page, "Record answer");
  const before = await readWork(page);
  expect(before.run.ids).toEqual(j.checkForms[0].map((q) => q.id));
  await tier(page, "higher");
  await page.goto(route);
  expect((await readWork(page)).run).toEqual(before.run);
  await expect(root.locator('[id$="s0"]')).toHaveValue("F");
  await page.reload();
  expect((await readWork(page)).run).toEqual(before.run);
  await tap(page, "Practise");
  await tier(page, "foundation");
  await page.goto(route);
  await tap(page, "Practise");
  expect(
    await page
      .getByLabel("Choose a practice task", { exact: true })
      .locator("option")
      .evaluateAll((ns) => ns.some((n) => n.textContent?.includes("Higher:"))),
  ).toBe(false);
});

test("a started Higher condensation form survives switching to Foundation without replacing its structure or evidence", async ({
  page,
}) => {
  test.setTimeout(180000);
  await tier(page, "higher");
  await page.goto(route);
  await tap(page, "Check");
  await tap(page, "Start understanding check →");
  const q = added.checkForms[0][0];
  await construct(page, q, true);
  await tap(page, "Record answer");
  const before = await readWork(page);
  expect(before.run.ids).toEqual(added.checkForms[0].map((task) => task.id));
  expect(before.run.responses[q.id].correct).toBe(false);
  await tier(page, "foundation");
  await page.goto(route);
  expect((await readWork(page)).run).toEqual(before.run);
  expect((await readWork(page)).drafts[q.id]).toBe(before.drafts[q.id]);
  await expect(
    page.locator('[data-condensation-construction="groups"] [id$="diolLeftO"]'),
  ).toHaveValue("2");
  await expect(page.locator(".polymerisation-review")).toHaveCount(0);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 664 });
    await geometry(
      page,
      '[data-condensation-construction="groups"] select',
      `retained-Higher-after-Foundation-${width}`,
    );
  }
  await page.reload();
  const after = await readWork(page);
  expect(after.run).toEqual(before.run);
  expect(after.drafts[q.id]).toBe(before.drafts[q.id]);
  expect(after.history).toEqual(before.history);
});

test("functional-group changes show the edited monomer and reveal its end beside the desktop controls without rewriting the proposal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 664 });
  await tier(page, "higher");
  await page.goto(route);
  await tap(page, "Learn");
  await page
    .getByRole("button", { name: "Task 8", exact: true })
    .first()
    .click();
  await construct(page, added.guided[0]);
  const before = (await readWork(page)).drafts[added.guided[0].id];
  await tap(page, "Edit diacid right");
  await geometry(
    page,
    '[data-condensation-construction="groups"] select',
    "visible-edited-diacid",
  );
  const region = page
    .locator(".condensation-group-diagrams .condensation-scroll")
    .first();
  await expect(region).toHaveAttribute(
    "aria-label",
    "Your diacid structure: scroll to inspect both ends",
  );
  await expect
    .poll(() => region.evaluate((n) => n.scrollLeft))
    .toBeGreaterThan(0);
  const control = (await page
    .locator('[data-condensation-construction="groups"] select')
    .first()
    .boundingBox())!;
  const preview = (await region.locator("svg").boundingBox())!;
  expect(preview.y + preview.height).toBeLessThanOrEqual(664);
  const frame = (await region.boundingBox())!;
  expect(frame.x).toBeGreaterThan(control.x + control.width);
  const endO = region.locator("svg > g").last().locator("text").first();
  await expect(endO).toHaveText("O");
  const endBox = (await endO.boundingBox())!;
  expect(endBox.x).toBeGreaterThanOrEqual(frame.x);
  expect(endBox.x + endBox.width).toBeLessThanOrEqual(frame.x + frame.width);
  expect((await readWork(page)).drafts[added.guided[0].id]).toBe(before);
  await tap(page, "Edit diol left");
  await expect(region).toHaveAttribute(
    "aria-label",
    "Your diol structure: scroll to inspect both ends",
  );
  await expect.poll(() => region.evaluate((n) => n.scrollLeft)).toBe(0);
  expect((await readWork(page)).drafts[added.guided[0].id]).toBe(before);
});
