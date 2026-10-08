import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { groupSevenJourney as journey } from "../src/content/journeys/group-seven";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function answer(page: Page, q: Question) {
  if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(q.answer);
}
async function capture(page: Page, path: string) {
  await mkdir("test-results/qa/group-seven", { recursive: true });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    document.querySelectorAll("textarea").forEach((el) => (el.scrollTop = 0));
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
async function form(page: Page, questions: Question[]) {
  for (let i = 0; i < questions.length; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(page, questions[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
}
test("the actual 3D particle retains incorrect species, rotates, exports two bonded atoms and resumes undo", async ({
  page,
}, info) => {
  await page.goto("/lessons/group-seven");
  const select = page.getByLabel("Proposed halogen particle", { exact: true }),
    scene = page.locator(".diatomic-scene");
  const box = await select.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(scene).toHaveAttribute("data-ready", "true");
  const rotateBox = await page
    .getByRole("button", { name: "Rotate particle left", exact: true })
    .boundingBox();
  expect(rotateBox!.height).toBeGreaterThanOrEqual(44);
  await expect(scene).toHaveAttribute("data-atoms", "1");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".halogen-workbench [role=status]"),
  ).not.toHaveClass(/correct/);
  await select.selectOption("ion");
  await expect(scene).toHaveAttribute("data-charge", "-1");
  await expect(page.locator(".halogen-species")).toContainText("Cl⁻");
  await select.selectOption("molecule");
  await expect(scene).toHaveAttribute("data-atoms", "2");
  await expect(scene).toHaveAttribute("data-charge", "0");
  const before = await scene.getAttribute("data-rotation");
  await scene.focus();
  await scene.press("ArrowRight");
  expect(await scene.getAttribute("data-rotation")).not.toBe(before);
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Download current particle as GLB",
      exact: true,
    })
    .click();
  const download = await downloadEvent,
    path = `test-results/qa/group-seven/chlorine-molecule-${info.project.name}.glb`;
  await download.saveAs(path);
  const buffer = await readFile(path);
  expect(buffer.subarray(0, 4).toString()).toBe("glTF");
  expect(buffer.readUInt32LE(4)).toBe(2);
  const jsonLength = buffer.readUInt32LE(12),
    gltf = JSON.parse(buffer.subarray(20, 20 + jsonLength).toString()) as {
      nodes: { name?: string; extras?: Record<string, unknown> }[];
    };
  expect(gltf.nodes.filter((n) => n.name?.startsWith("atom-"))).toHaveLength(2);
  expect(gltf.nodes.some((n) => n.name === "schematic-covalent-bond")).toBe(
    true,
  );
  expect(
    gltf.nodes.find((n) => n.extras?.representation === "molecule")!.extras,
  ).toMatchObject({ atomCount: 2, charge: 0, formula: "Cl₂" });
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".halogen-workbench [role=status]")).toHaveClass(
    /correct/,
  );
  await answer(page, journey.guided[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `test-results/qa/group-seven/group-seven-${info.project.name}-molecule.png`,
  );
  await page.reload();
  await expect(select).toHaveValue("molecule");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(select).toHaveValue("ion");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(select).toHaveValue("atom");
  await page
    .getByRole("button", { name: "Use 2D diagram", exact: true })
    .click();
  await select.selectOption("molecule");
  await expect(page.locator(".diatomic-asset > svg")).toHaveAttribute(
    "aria-label",
    /Cl₂: 2 atoms, charge 0/,
  );
});
test("unavailable WebGL retains particle science and keyboard-accessible repairs", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const prototype = HTMLCanvasElement.prototype,
      original = prototype.getContext;
    prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (kind.startsWith("webgl")) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.goto("/lessons/group-seven");
  await expect(
    page.getByText("3D is unavailable here.", { exact: false }),
  ).toBeVisible();
  const select = page.getByLabel("Proposed halogen particle", { exact: true });
  await select.selectOption("molecule");
  await expect(page.locator(".diatomic-asset > svg")).toHaveAttribute(
    "aria-label",
    /2 atoms, charge 0/,
  );
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".halogen-workbench [role=status]")).toHaveClass(
    /correct/,
  );
});
test("temperature inference changes room solid to liquid and gas while retaining diatomic pairs", async ({
  page,
}, info) => {
  await page.goto("/lessons/group-seven");
  await page.getByRole("button", { name: "Task 2", exact: true }).click();
  const slider = page.getByRole("slider", {
    name: "Model temperature",
    exact: true,
  });
  await expect(page.locator(".halogen-species")).toContainText("solid");
  for (let i = 0; i < 13; i++) await slider.press("ArrowRight");
  await expect(slider).toHaveValue("150");
  await expect(page.locator(".halogen-species")).toContainText("liquid");
  await expect(page.locator(".halogen-phase-figure svg circle")).toHaveCount(
    12,
  );
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await answer(page, journey.guided[1]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `test-results/qa/group-seven/group-seven-${info.project.name}-temperature.png`,
  );
  await page.reload();
  await expect(slider).toHaveValue("150");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(slider).toHaveValue("140");
  await slider.press("End");
  await expect(page.locator(".halogen-species")).toContainText("gas");
  await expect(page.locator(".halogen-phase-figure svg circle")).toHaveCount(
    12,
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(slider).toHaveValue("20");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("displacement reveals conserved species after checking and accepts a coloured no-reaction result", async ({
  page,
}, info) => {
  await page.goto("/lessons/group-seven");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  const prediction = page.getByLabel("Displacement prediction", {
    exact: true,
  });
  await expect(page.locator("[data-halogen-after]")).toHaveCount(0);
  await expect(page.locator("[data-halogen-before]")).toHaveText("Cl₂ + 2 Br⁻");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".halogen-workbench [role=status]"),
  ).not.toHaveClass(/correct/);
  await expect(page.locator("[data-halogen-after]")).toHaveText("2 Cl⁻ + Br₂");
  await prediction.selectOption("reaction");
  await expect(page.locator("[data-halogen-after]")).toHaveCount(0);
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".halogen-workbench [role=status]")).toHaveClass(
    /correct/,
  );
  await answer(page, journey.guided[2]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `test-results/qa/group-seven/group-seven-${info.project.name}-displacement.png`,
  );
  await page.reload();
  await expect(prediction).toHaveValue("reaction");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(prediction).toHaveValue("none");
  await page.getByRole("button", { name: "Task 4", exact: true }).click();
  await prediction.selectOption("none");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".halogen-workbench [role=status]")).toHaveClass(
    /correct/,
  );
  await expect(page.locator("[data-halogen-after]")).toHaveText("I₂ + 2 Cl⁻");
  await expect(page.locator(".halogen-solution")).toHaveText("Brown solution");
  await answer(page, journey.guided[3]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `test-results/qa/group-seven/group-seven-${info.project.name}-no-reaction.png`,
  );
  await page
    .getByText("Why does reactivity decrease?", { exact: true })
    .click();
  await expect(page.locator(".halogen-outer svg")).toHaveCount(2);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("all independent halogen practice supports table inference, targeted gain recovery and honest written explanations", async ({
  page,
}, info) => {
  await page.goto("/lessons/group-seven");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) {
      const picker = page.getByLabel("Choose a practice task", { exact: true });
      if (await picker.isVisible()) await picker.selectOption(String(i));
      else
        await page
          .getByRole("button", { name: `Task ${i + 1}`, exact: true })
          .click();
    }
    await expect(
      page.getByRole("region", { name: "Task model", exact: true }),
    ).toHaveCount(0);
    if (i === 7) {
      await expect(
        page.getByRole("table", {
          name: "Displacement results",
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.locator(".halogen-data tbody tr")).toHaveCount(4);
    }
    if (i === 11) {
      const q = journey.practice[i];
      await page
        .getByRole("radio", {
          name: q.options!.find((o) => o !== q.answer)!,
          exact: true,
        })
        .check();
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Revisit the key idea", exact: true })
        .click();
      await expect(
        page.getByRole("heading", {
          name: "Explain harder gain",
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Return to your task →", exact: true })
        .click();
    }
    const q = journey.practice[i];
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.rubric ? "Save and review explanation" : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      q.rubric ? "Compare your explanation" : "That’s right",
    );
    if (q.rubric)
      await capture(
        page,
        `test-results/qa/group-seven/group-seven-${info.project.name}-reactivity-explanation.png`,
      );
  }
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work["group-seven"].attempts[
            "g7-v1-p-explain"
          ]?.at(-1)?.correct,
        STORAGE_KEY,
      ),
    )
    .toBe(false);
});
test("reserved Group 7 checks defer marking and the separate delayed form unlocks after seven days", async ({
  page,
}) => {
  await page.goto("/lessons/group-seven");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await answer(page, journey.checkForms[0][0]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toBeDisabled();
  await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "254",
  );
  for (let i = 1; i < journey.checkForms[0].length; i++) {
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
    page.getByRole("heading", { name: "5 of 5 correct", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.evaluate(
    ({ key, delay }) => {
      const data = JSON.parse(localStorage.getItem(key)!);
      data.work["group-seven"].history[0].submitted = Date.now() - delay - 1000;
      data.work["group-seven"].run.submitted = Date.now() - delay - 1000;
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
