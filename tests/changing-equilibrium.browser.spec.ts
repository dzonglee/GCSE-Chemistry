import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { equilibriumShiftJourney as journey } from "../src/content/journeys/changing-equilibrium";
import type { ShiftMode } from "../src/lib/equilibrium-shifts";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import {
  shiftRecords,
  expectedShiftBoard,
  validShiftBoard,
  shiftHistoryStep,
} from "../src/lib/equilibrium-shift-board";
const route = "/lessons/changing-equilibrium";
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
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
  if (q.rubric)
    await page.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
async function learn(page: Page, n: number) {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, n);
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".shift-workbench .feedback[role=status]"),
  ).toHaveClass(correct ? /correct/ : /retry/);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/changing-equilibrium");
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
      if (form === 0 && i === 2) {
        await saved(page);
        await page.reload();
        await expect(
          page.getByLabel("Your answer", { exact: true }),
        ).toHaveValue(q.answer);
      }
      if (
        (form === 0 && i === 0) ||
        (form === 0 && i === 2) ||
        (form === 0 && i === 3) ||
        (form === 1 && i === 1)
      )
        await capture(
          page,
          "docs/qa/changing-equilibrium-" +
            info.project.name +
            "-independent-form-" +
            form +
            "-task-" +
            i +
            ".png",
        );
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if ((form === 0 && (i === 0 || i === 1)) || (form === 1 && i === 0))
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "changing-equilibrium"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(form === 0 && i === 1);
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
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work["changing-equilibrium"]
            .section,
        STORAGE_KEY,
      ),
    )
    .toBe("review");
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      for (const run of p.work["changing-equilibrium"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["changing-equilibrium"].run.submitted = Date.now() - delay - 1000;
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

test("all original practice works while written responses remain self-reviewed", async ({
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
                "changing-equilibrium"
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
for (const [mode, n] of [
  ["compression", 1],
  ["pressure", 2],
  ["temperature", 3],
  ["concentration", 4],
  ["combined", 5],
  ["evidence", 6],
] as [ShiftMode, number][])
  test(`${mode}: six comparisons retain scientific predictions and strict histories`, async ({
    page,
  }, info) => {
    if (
      info.project.name === "mobile" &&
      ["temperature", "concentration", "evidence"].includes(mode)
    ) {
      await page.setViewportSize({ width: 320, height: 844 });
    }
    await learn(page, n);
    const root = page.getByRole("region", { name: "Task model", exact: true }),
      original = journey.guided[n - 1].model!;
    for (const [id, r] of Object.entries(shiftRecords[mode])) {
      await root
        .getByText("Choose another supplied comparison", { exact: true })
        .click();
      await root
        .getByLabel("Supplied comparison", { exact: true })
        .selectOption(id);
      await root
        .getByText("Choose another supplied comparison", { exact: true })
        .click();
      await check(page, false);
      if (mode === "compression") {
        for (const stage of [0, 1, 2]) {
          if (stage)
            await root
              .getByRole("button", {
                name:
                  stage === 1
                    ? "Change the occupied volume"
                    : "Show supplied later composition",
                exact: true,
              })
              .click();
          await expect(root.locator("[data-stage]")).toHaveAttribute(
            "data-stage",
            String(stage),
          );
          await expect(root.locator("[data-stage]")).toHaveAttribute(
            "data-comparison",
            r.title,
          );
          const canvas = root.locator("canvas");
          const dims = await canvas.evaluate((c) => ({
            width: c.getBoundingClientRect().width,
            parent: c.parentElement!.clientWidth,
            pixels: (c as HTMLCanvasElement).width,
            dpr: Math.min(devicePixelRatio, 2),
          }));
          expect(Math.abs(dims.width - dims.parent)).toBeLessThan(1);
          expect(
            Math.abs(dims.pixels - dims.parent * dims.dpr),
          ).toBeLessThanOrEqual(1);
        }
        await expect(
          root.getByRole("button", {
            name: "Later equilibrium shown",
            exact: true,
          }),
        ).toBeDisabled();
        if (id === "initial") {
          const downloadButton = root.getByRole("button", {
            name: "Download 3D asset",
            exact: true,
          });
          await expect(downloadButton).toBeEnabled();
          const downloadPromise = page.waitForEvent("download");
          await downloadButton.click();
          await (
            await downloadPromise
          ).saveAs(`docs/qa/changing-equilibrium-${info.project.name}.glb`);
          const view = root.locator("[data-stage]");
          await view.focus();
          await page.keyboard.press("ArrowRight");
          expect(
            Number(await view.getAttribute("data-rotation")),
          ).toBeGreaterThan(0);
          await root
            .getByRole("button", { name: "Reset view", exact: true })
            .click();
          await expect(view).toHaveAttribute("data-rotation", "0");
        }
      }
      const expected = expectedShiftBoard(mode, id);
      for (const [key, v] of Object.entries(expected)) {
        if (key === "record" || key === "step") continue;
        const field = root.locator(`[id$="-${key}"]`);
        if (await field.evaluate((x) => x.tagName === "SELECT"))
          await field.selectOption(v);
        else await field.fill(v);
      }
      await check(page, true);
      await root
        .getByText("Choose another supplied comparison", { exact: true })
        .click();
      await root
        .getByLabel("Supplied comparison", { exact: true })
        .selectOption(id);
      await root
        .getByText("Choose another supplied comparison", { exact: true })
        .click();
      await check(page, true);
      await saved(page);
      const history = await page.evaluate(
        ({ key, id }) =>
          JSON.parse(localStorage.getItem(key)!).work["changing-equilibrium"]
            .taskModels[id],
        { key: STORAGE_KEY, id: journey.guided[n - 1].id },
      );
      expect(
        history.every((b: Record<string, string>) => validShiftBoard(mode, b)),
      ).toBe(true);
      for (let i = 1; i < history.length; i++)
        expect(shiftHistoryStep(mode, history[i - 1], history[i])).toBe(true);
      if (mode === "concentration" || mode === "evidence")
        await root.locator("th[scope=col]").evaluateAll((headers) => {
          for (const header of headers) {
            const walker = document.createTreeWalker(
              header,
              NodeFilter.SHOW_TEXT,
            );
            let node: Node | null;
            while ((node = walker.nextNode()))
              for (const word of node.textContent!.matchAll(/[A-Za-z]+/g)) {
                const range = document.createRange();
                range.setStart(node, word.index!);
                range.setEnd(node, word.index! + word[0].length);
                if (
                  Array.from(range.getClientRects()).filter(
                    (r) => r.width && r.height,
                  ).length > 1
                )
                  throw Error("Split column heading word " + word[0]);
              }
          }
        });
      if (mode === "evidence")
        await expect(root).toContainText(
          "supplied as known dynamic equilibria",
        );
      if (mode === "temperature" || mode === "evidence")
        await root.locator("svg").evaluateAll((svgs) => {
          for (const svg of svgs as SVGSVGElement[])
            for (const t of svg.querySelectorAll("text")) {
              const box = t.getBBox(),
                matrix = t.getScreenCTM()!,
                font = parseFloat(getComputedStyle(t).fontSize);
              if (font * Math.hypot(matrix.a, matrix.b) < 12)
                throw Error("Small label " + t.textContent);
              if (
                box.x < 0 ||
                box.y < 0 ||
                box.x + box.width > svg.viewBox.baseVal.width ||
                box.y + box.height > svg.viewBox.baseVal.height
              )
                throw Error("Clipped label " + t.textContent);
            }
        });
      for (const button of await root.getByRole("button").all())
        expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      if (
        id === ("record" in original ? original.record : "initial") ||
        ((!("record" in original) || !original.record) && id === "initial")
      ) {
        await answer(page, journey.guided[n - 1]);
        await page
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
        await expect(
          page.locator(".sample-task-answer [role=status]"),
        ).toContainText("That’s right.");
        await capture(
          page,
          `docs/qa/changing-equilibrium-${info.project.name}-${mode}.png`,
        );
      }
      await page.reload();
      await check(page, true);
    }
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await check(page, false);
    await root
      .getByRole("button", { name: "Reset model", exact: true })
      .click();
    await check(page, false);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
test("opening compression action is complete within the mobile viewport and keyboard-operable", async ({
  page,
}, info) => {
  await learn(page, 1);
  const control = page.getByRole("button", {
      name: "Change the occupied volume",
      exact: true,
    }),
    box = await control.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await control.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".shift-stage")).toHaveText(
    "Immediately after volume changes",
  );
  await expect(page.locator(".shift-workbench")).toContainText(
    "Total 24 gas molecules",
  );
  await capture(
    page,
    `docs/qa/changing-equilibrium-${info.project.name}-opening.png`,
  );
});
test("gas tallies respond to construction buttons and preserve wrong and invalid entries correctly", async ({
  page,
}) => {
  await learn(page, 2);
  const root = page.getByRole("region", { name: "Task model", exact: true });
  await root
    .getByRole("button", { name: "Add one left gas count", exact: true })
    .click();
  await expect(
    root.getByLabel("Gas coefficient total on the left", { exact: true }),
  ).toHaveValue("1");
  await expect(root.locator(".shift-tally span")).toHaveCount(1);
  await check(page, false);
  await saved(page);
  await page.reload();
  const field = root.getByLabel("Gas coefficient total on the left", {
    exact: true,
  });
  await expect(field).toHaveValue("1");
  await field.fill("2.5");
  await expect(root).toContainText("is not saved");
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(field).toHaveValue("1");
  await field.fill("1/2");
  await page.reload();
  await expect(field).toHaveValue("1");
  await root
    .getByRole("button", { name: "Remove one left gas count", exact: true })
    .click();
  await expect(field).toHaveValue("0");
  await root
    .getByLabel("Gas coefficient total on the right", { exact: true })
    .fill("1");
  await root
    .getByLabel("Equilibrium-position change", { exact: true })
    .selectOption("reverse");
  await root
    .getByLabel("Reason for that pressure response", { exact: true })
    .selectOption("fewerGas");
  await check(page, true);
  await root.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(root.locator(".shift-tally span")).toHaveCount(0);
});
test("unavailable WebGL retains volume inventory and editable chemistry predictions", async ({
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
      return original.call(this, kind, ...(args as []));
    } as typeof original;
  });
  await learn(page, 1);
  await expect(page.getByText(/3D is unavailable/)).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Task model", exact: true })
      .locator("[role=img]"),
  ).toBeHidden();
  await page
    .getByRole("button", { name: "Change the occupied volume", exact: true })
    .click();
  await expect(page.locator(".shift-workbench")).toContainText(
    "Total 24 gas molecules",
  );
  await page
    .getByRole("button", {
      name: "Show supplied later composition",
      exact: true,
    })
    .click();
  await expect(page.locator(".shift-workbench")).toContainText(
    "Total 22 gas molecules",
  );
  await page
    .getByLabel("Total gas molecules immediately after volume changes", {
      exact: true,
    })
    .fill("22");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Total gas molecules immediately after volume changes", {
      exact: true,
    }),
  ).toHaveValue("22");
  await capture(
    page,
    `docs/qa/changing-equilibrium-${info.project.name}-fallback.png`,
  );
});
