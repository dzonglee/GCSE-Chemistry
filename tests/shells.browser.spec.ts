import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { shellJourney as journey } from "../src/content/journeys/shells";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import { readFile } from "node:fs/promises";

async function answer(page: Page, q: Question) {
  if (q.arrangement)
    await page
      .getByLabel("Your electron arrangement", { exact: true })
      .fill(q.answer.replaceAll(",", "."));
  else if (q.parts)
    for (const part of q.parts)
      await page
        .getByLabel(part.label, { exact: true })
        .fill(String(part.answer));
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else if (q.rubric)
    await page
      .getByLabel("Your explanation", { exact: true })
      .fill(
        "Two occupied shells mean period 2. Three outer electrons mean GCSE Group 3; group and period count different features.",
      );
  else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
async function capture(page: Page, path: string) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
async function form(page: Page, questions: Question[]) {
  for (let i = 0; i < questions.length; i++) {
    await answer(page, questions[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    if (i < questions.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
}

test("shell placement separates the budget from distribution, works with keys, and resumes undo", async ({
  page,
}, info) => {
  await page.goto("/lessons/electron-shells");
  const firstPlacement = page.getByRole("button", {
    name: "Add electron to shell 1",
    exact: true,
  });
  const bounds = await firstPlacement.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(
    page.viewportSize()!.height,
  );
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".shell-workbench [role=status]")).toContainText(
    "8 remain",
  );
  await firstPlacement.press("Enter");
  await firstPlacement.press("Enter");
  for (let i = 0; i < 6; i++)
    await page
      .getByRole("button", { name: "Add electron to shell 2", exact: true })
      .press("Enter");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".shell-workbench [role=status]")).toContainText(
    "2,6",
  );
  await expect(page.locator(".shell-workbench svg")).toHaveAttribute(
    "data-shells",
    "2,6,0,0",
  );
  await answer(page, journey.guided[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `docs/qa/electron-shells-${info.project.name}-construction.png`,
  );
  await page.reload();
  await expect(
    page.getByLabel("Shell 2 electron count", { exact: true }),
  ).toHaveText("6");
  await expect(
    page.getByLabel("Your electron arrangement", { exact: true }),
  ).toHaveValue("2.6");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Shell 2 electron count", { exact: true }),
  ).toHaveText("5");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Shell 2 electron count", { exact: true }),
  ).toHaveText("0");
  await page.getByRole("button", { name: "Task 4", exact: true }).click();
  await page
    .getByRole("button", { name: "Add electron to shell 4", exact: true })
    .click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".shell-workbench [role=status]")).toContainText(
    "2,8,8,1",
  );
});
test("the real 3D asset retains wrong placement, exports that placement and updates after repair", async ({
  page,
}, info) => {
  await page.goto("/lessons/electron-shells");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".shell-workbench [role=status]")).toContainText(
    "total is right",
  );
  await page
    .getByRole("button", {
      name: "Inspect your arrangement in 3D",
      exact: true,
    })
    .click();
  await expect(page.locator(".atom-scene")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(page.locator(".atom-scene-canvas")).toHaveAttribute(
    "data-shells",
    "1,8,0,0",
  );
  await page.getByText("Use this 3D asset", { exact: true }).click();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download 3D model (.glb)", exact: true })
    .click();
  const download = await pending;
  const path = info.outputPath("wrong-shell-arrangement.glb");
  await download.saveAs(path);
  const file = await readFile(path);
  const length = file.readUInt32LE(12);
  const gltf = JSON.parse(
    file
      .subarray(20, 20 + length)
      .toString()
      .trim(),
  );
  const nodes = gltf.nodes as {
    name?: string;
    children?: number[];
    extras?: { shellCounts?: number[] };
  }[];
  expect(
    nodes.find((n) => n.name === "SchematicAtom_NotToScale")?.extras
      ?.shellCounts,
  ).toEqual([1, 8, 0, 0]);
  expect(
    nodes.find((n) => n.name === "Shell_1_Electrons")?.children,
  ).toHaveLength(1);
  expect(
    nodes.find((n) => n.name === "Shell_2_Electrons")?.children,
  ).toHaveLength(8);
  await page
    .getByRole("button", { name: "Remove electron from shell 2", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add electron to shell 1", exact: true })
    .click();
  await expect(page.locator(".atom-scene-canvas")).toHaveAttribute(
    "data-shells",
    "2,7,0,0",
  );
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".shell-workbench [role=status]")).toContainText(
    "2,7",
  );
  await answer(page, journey.guided[2]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `docs/qa/electron-shells-${info.project.name}-3d-repair.png`,
  );
});
test("unavailable WebGL preserves the learner's actual placement and recovery", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.startsWith("webgl")) return null;
      return original.call(this, type as "2d", ...(args as []));
    } as typeof original;
  });
  await page.goto("/lessons/electron-shells");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Inspect your arrangement in 3D",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("3D is unavailable in this browser.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".atom-scene-fallback svg")).toHaveAttribute(
    "data-shells",
    "1,8,0,0",
  );
  await page
    .getByRole("button", { name: "Remove electron from shell 2", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add electron to shell 1", exact: true })
    .click();
  await expect(page.locator(".atom-scene-fallback svg")).toHaveAttribute(
    "data-shells",
    "2,7,0,0",
  );
});
test("varied practice constructs uncorrected diagrams, diagnoses group notation and retains honest written review", async ({
  page,
}, info) => {
  await page.goto("/lessons/electron-shells");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i)
      await page
        .getByRole("button", { name: `Task ${i + 1}`, exact: true })
        .click();
    await expect(
      page.getByRole("region", { name: "Task model", exact: true }),
    ).toHaveCount(0);
    if (i === 2) {
      await page
        .getByLabel("Your electron arrangement", { exact: true })
        .fill("2,3,1");
      await expect(page.locator(".answer-diagram svg")).toHaveAttribute(
        "data-shells",
        "2,3,1",
      );
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(page.getByRole("status")).toContainText("Not yet");
      await page
        .getByRole("button", { name: "Revisit the key idea", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: /Build a neutral beryllium/ }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Return to your task →", exact: true })
        .click();
      await expect(
        page.getByLabel("Your electron arrangement", { exact: true }),
      ).toHaveValue("2,3,1");
    }
    if (i === 4) {
      await page.getByLabel("Your answer", { exact: true }).fill("13");
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(page.getByRole("status")).toContainText(
        "modern group label",
      );
    }
    await answer(page, journey.practice[i]);
    await page
      .getByRole("button", {
        name: i === 9 ? "Save and review explanation" : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      i === 9 ? "Compare your explanation" : "That’s right",
    );
    if (i === 2)
      await capture(
        page,
        `docs/qa/electron-shells-${info.project.name}-independent-diagram.png`,
      );
  }
  await expect(page.getByRole("status")).not.toContainText("mass lies");
  await expect
    .poll(async () =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work[
            "electron-shells"
          ].attempts["sh-v1-p-explanation"]?.at(-1)?.correct,
        STORAGE_KEY,
      ),
    )
    .toBe(false);
  await page.reload();
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue(/period 2/);
});
test("reserved arrangements and position tables lock and defer marks, rotate forms and retain exposure", async ({
  page,
}) => {
  await page.goto("/lessons/electron-shells");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await answer(page, journey.checkForms[0][0]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(
    page.getByLabel("Your electron arrangement", { exact: true }),
  ).toBeDisabled();
  await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(0);
  for (let i = 1; i < 4; i++) {
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
    await answer(page, journey.checkForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "4 of 4 correct", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/^4 correct on a fresh/)).toBeVisible();
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  await form(page, journey.checkForms[1]);
  await expect(page.getByText(/^4 correct on a fresh/)).toBeVisible();
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  await form(page, journey.checkForms[0]);
  await expect(page.getByText(/^0 correct on a fresh/)).toBeVisible();
});
test("seven-day review uses distinct questions and preserves the selected form on reload", async ({
  page,
}) => {
  await page.goto("/lessons/electron-shells");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await form(page, journey.checkForms[0]);
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await page.evaluate(
    ({ key, delay }) => {
      const data = JSON.parse(localStorage.getItem(key)!);
      data.work["electron-shells"].history[0].submitted =
        Date.now() - delay - 1000;
      data.work["electron-shells"].run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  await page.reload();
  await form(page, journey.reviewForms[0]);
  await expect(
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
});
test("placement, diagrams, independent construction, written review and checks are accessible and reflow", async ({
  page,
}) => {
  for (const [stage, index] of [
    ["Learn", 0],
    ["Learn", 3],
    ["Practise", 2],
    ["Practise", 3],
    ["Practise", 9],
    ["Check", 0],
  ] as const) {
    await page.goto("/lessons/electron-shells");
    await page.getByRole("button", { name: stage, exact: true }).click();
    if (index)
      await page
        .getByRole("button", { name: `Task ${index + 1}`, exact: true })
        .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});
