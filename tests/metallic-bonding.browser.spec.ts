import { mkdir } from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { metallicBondingJourney as journey } from "../src/content/journeys/metallic-bonding";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function separatedParticles(page: Page) {
  const minimumGap = await page
    .locator(".metallic-diagram svg")
    .evaluate((svg) => {
      const circles = (selector: string) =>
        [...svg.querySelectorAll(selector)].map((n) => ({
          x: Number(n.getAttribute("cx")),
          y: Number(n.getAttribute("cy")),
          r: Number(n.getAttribute("r")),
        }));
      const cores = circles("[data-metal-core] circle"),
        electrons = circles("[data-delocalised-electron] circle");
      return Math.min(
        ...cores.flatMap((c) =>
          electrons.map((e) => Math.hypot(c.x - e.x, c.y - e.y) - c.r - e.r),
        ),
      );
    });
  expect(minimumGap).toBeGreaterThanOrEqual(0);
}
async function audit(page: Page) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
async function capture(page: Page, path: string) {
  await mkdir("test-results/qa/metallic-bonding", { recursive: true });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
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
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  if (correct)
    await expect(page.locator(".metallic-workbench [role=status]")).toHaveClass(
      /correct/,
    );
  else
    await expect(page.locator(".metallic-workbench [role=status]")).toHaveClass(
      /retry/,
    );
}
test("metallic attraction requires opposite particle charges and retains wrong keyboard predictions across reload", async ({
  page,
}, info) => {
  await page.goto("/lessons/structure-and-properties");
  await expect(
    page.getByRole("heading", {
      name: "Metallic bonding and properties",
      exact: true,
    }),
  ).toBeVisible();
  const select = page.getByLabel("Particles that attract in metallic bonding", {
      exact: true,
    }),
    box = await select.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await select.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await select.selectOption("core-core");
  await check(page, false);
  await expect(page.locator(".metallic-workbench [role=status]")).toContainText(
    "repel",
  );
  await saved(page);
  await page.reload();
  await expect(select).toHaveValue("core-core");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await select.selectOption("core-electron");
  await check(page, true);
  await expect(page.locator("[data-metal-core]")).toHaveCount(12);
  await expect(page.locator("[data-delocalised-electron]")).toHaveCount(12);
  const sizes = await page
    .locator(".metallic-diagram svg text")
    .evaluateAll((nodes) =>
      nodes.map(
        (n) =>
          parseFloat(getComputedStyle(n).fontSize) *
          (n as SVGGraphicsElement).getScreenCTM()!.a,
      ),
    );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
  await separatedParticles(page);
  await audit(page);
  await capture(
    page,
    `test-results/qa/metallic-bonding/${info.project.name}-attraction.png`,
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(select).toHaveValue("unset");
});
test("electron drift preserves core positions, charge balance and incorrect proposed carrier arrows", async ({
  page,
}, info) => {
  await page.goto("/lessons/structure-and-properties");
  await page
    .getByRole("button", { name: "Task 2", exact: true })
    .first()
    .click();
  const carrier = page.getByLabel("Charge carriers in the solid metal", {
    exact: true,
  });
  await carrier.selectOption("cores");
  await check(page, false);
  await expect(page.locator("[data-proposed-core-motion]")).toHaveCount(1);
  const cores = await page
    .locator("[data-metal-core] circle")
    .evaluateAll((nodes) =>
      nodes.map((n) => [n.getAttribute("cx"), n.getAttribute("cy")]),
    );
  const electrons = await page
    .locator("[data-delocalised-electron] circle")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("cx")));
  const drift = page.getByRole("button", {
    name: "Advance electron drift",
    exact: true,
  });
  await drift.focus();
  await page.keyboard.press("Enter");
  expect(
    await page
      .locator("[data-metal-core] circle")
      .evaluateAll((nodes) =>
        nodes.map((n) => [n.getAttribute("cx"), n.getAttribute("cy")]),
      ),
  ).toEqual(cores);
  expect(
    await page
      .locator("[data-delocalised-electron] circle")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("cx"))),
  ).not.toEqual(electrons);
  await expect(carrier).toHaveValue("cores");
  await expect(page.locator(".metallic-diagram svg")).toHaveAttribute(
    "data-net-charge",
    "0",
  );
  await saved(page);
  await page.reload();
  await expect(carrier).toHaveValue("cores");
  await expect(page.locator("[data-proposed-core-motion]")).toHaveCount(1);
  await carrier.selectOption("electrons");
  await check(page, true);
  await expect(page.locator("[data-proposed-core-motion]")).toHaveCount(0);
  await separatedParticles(page);
  await audit(page);
  await capture(
    page,
    `test-results/qa/metallic-bonding/${info.project.name}-conduction.png`,
  );
  for (let i = 0; i < 3; i++) await drift.click();
  await expect(drift).toBeDisabled();
  await expect(page.locator("[data-delocalised-electron]")).toHaveCount(12);
  await page
    .getByRole("button", { name: "Step drift back", exact: true })
    .click();
  await expect(drift).toBeEnabled();
});
test("pure-layer displacement retains electrons and alloy comparison requires size distortion and difficult sliding", async ({
  page,
}, info) => {
  await page.goto("/lessons/structure-and-properties");
  await page
    .getByRole("button", { name: "Task 3", exact: true })
    .first()
    .click();
  const top = page.locator('[data-core-row="0"] circle'),
    bottom = page.locator('[data-core-row="2"] circle');
  const first = await top.first().getAttribute("cx"),
    last = await bottom.first().getAttribute("cx");
  await page
    .getByLabel("Bonding during layer movement", { exact: true })
    .selectOption("vanishes");
  await check(page, false);
  await page
    .getByRole("button", { name: "Displace the top layer", exact: true })
    .click();
  expect(Number(await top.first().getAttribute("cx"))).toBe(Number(first) + 10);
  await expect(bottom.first()).toHaveAttribute("cx", last!);
  await expect(page.locator("[data-delocalised-electron]")).toHaveCount(12);
  await page
    .getByLabel("Bonding during layer movement", { exact: true })
    .selectOption("remains");
  await check(page, true);
  await separatedParticles(page);
  await audit(page);
  await capture(
    page,
    `test-results/qa/metallic-bonding/${info.project.name}-layers.png`,
  );
  await page
    .getByRole("button", { name: "Task 4", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Inspect pure metal or alloy", { exact: true })
    .selectOption("alloy");
  await page
    .getByLabel("Atom sizes in the alloy", { exact: true })
    .selectOption("same");
  await page
    .getByLabel("Effect of alloy distortion on sliding", { exact: true })
    .selectOption("harder");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Atom sizes in the alloy", { exact: true }),
  ).toHaveValue("same");
  const radii = await page
    .locator("[data-metal-core] circle")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("r")));
  expect(new Set(radii).size).toBe(2);
  await page
    .getByLabel("Atom sizes in the alloy", { exact: true })
    .selectOption("different");
  await check(page, true);
  await expect(page.locator("[data-delocalised-electron]")).toHaveCount(12);
  await separatedParticles(page);
  await audit(page);
  await capture(
    page,
    `test-results/qa/metallic-bonding/${info.project.name}-alloy.png`,
  );
});
test("fifteen independent demands include atom-percent precision and two honestly self-reviewed explanations", async ({
  page,
}, info) => {
  await page.goto("/lessons/structure-and-properties");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) {
      const picker = page.getByLabel("Choose a practice task", { exact: true });
      if (await picker.isVisible()) await picker.selectOption(String(i));
      else
        await page
          .getByRole("button", { name: `Task ${i + 1}`, exact: true })
          .first()
          .click();
    }
    const q = journey.practice[i];
    if (q.id === "mb-v1-p-percent") {
      await page.getByLabel("Your answer", { exact: true }).fill("20");
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(
        page.locator(".question-panel [role=status]"),
      ).not.toHaveClass(/correct/);
      await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
        "20",
      );
    }
    if (q.id === "mb-v1-p-diagram-percent") {
      await expect(page.locator("[data-metal-core]")).toHaveCount(12);
      await expect(
        page.locator("[data-metal-core]").filter({ hasText: "X⁺" }),
      ).toHaveCount(3);
      await separatedParticles(page);
    }
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
    if (q.id === "mb-v1-p-diagram-percent") {
      await audit(page);
      await capture(
        page,
        `test-results/qa/metallic-bonding/${info.project.name}-independent-alloy-count.png`,
      );
    }
    if (q.rubric) {
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "structure-and-properties"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
      await audit(page);
      if (q.id === "mb-v1-p-alloy-explain")
        await capture(
          page,
          `test-results/qa/metallic-bonding/${info.project.name}-explanation.png`,
        );
    }
  }
});
test("reserved metallic checks defer feedback, preserve typed drafts and reserve distinct seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/structure-and-properties");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 5; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    const q = journey.checkForms[0][i];
    await answer(page, q);
    if (i === 3) {
      await saved(page);
      await page.reload();
      await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
        q.answer,
      );
    }
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("region", { name: "Task model", exact: true }),
    ).toHaveCount(0);
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
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      p.work["structure-and-properties"].history[0].submitted =
        Date.now() - delay - 1000;
      p.work["structure-and-properties"].run.submitted =
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
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
});
