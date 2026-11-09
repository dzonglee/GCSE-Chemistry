import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { STORAGE_KEY } from "../src/lib/progress";

const pilots = [
  { slug: "relative-atomic-mass", selector: "#relative-atomic-mass-worked" },
  { slug: "inside-an-atom", selector: "#inside-atom-worked" },
] as const;
const shots = "test-results/qa/t17";

function currentStep(frame: Locator) {
  return frame.locator("[data-current-worked-step]");
}

async function expectStep(frame: Locator, step: number) {
  await expect(frame).toHaveAttribute("data-worked-step", String(step));
  await expect(currentStep(frame)).toHaveCount(1);
  await expect(currentStep(frame).locator("dt")).toHaveText([
    "Before",
    "Action",
    "After",
    "Why",
  ]);
  await expect(currentStep(frame).locator("h4")).toHaveCount(1);
}

async function setStep(frame: Locator, step: number) {
  let position = Number(await frame.getAttribute("data-worked-step"));
  while (position !== step) {
    await frame
      .getByRole("button", {
        name: position < step ? "Next" : "Back",
        exact: true,
      })
      .click();
    position += position < step ? 1 : -1;
    await expectStep(frame, position);
  }
}

async function committedCursor(
  page: Page,
  slug: string,
  example: "main" | "difficult",
  step: number,
) {
  await expect
    .poll(() =>
      page.evaluate(
        ({ key, slug }) => {
          const raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw).work[slug]?.worked : undefined;
        },
        { key: STORAGE_KEY, slug },
      ),
    )
    .toEqual({ version: 1, example, step });
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}

async function noOverflow(page: Page, frame: Locator) {
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  expect(
    await frame.evaluate(
      (element) => element.scrollWidth <= element.clientWidth + 1,
    ),
  ).toBe(true);
}

async function atomCounts(
  frame: Locator,
  protons: number,
  neutrons: number,
  electrons: number,
) {
  const diagram = currentStep(frame).locator(".t17-worked-atom-figure");
  await expect(diagram).toHaveAttribute(
    "data-worked-counts",
    `${protons},${neutrons},${electrons}`,
  );
  await expect(diagram.locator('[data-particle="proton"]')).toHaveCount(
    protons,
  );
  await expect(diagram.locator('[data-particle="neutron"]')).toHaveCount(
    neutrons,
  );
  await expect(diagram.locator('[data-particle="electron"]')).toHaveCount(
    electrons,
  );
  await expect(diagram.getByText("Nucleus", { exact: true })).toBeVisible();
  await expect(
    diagram.getByText("Electron shells", { exact: true }),
  ).toBeVisible();
  await expect(diagram.locator(".t17-worked-atom-ledger")).toContainText(
    `A = ${protons} + ${neutrons} = ${protons + neutrons}`,
  );
  await expect(diagram.locator(".t17-worked-atom-ledger")).toContainText(
    `Charge = +${protons} − ${electrons} = ${protons - electrons > 0 ? "+" : ""}${protons - electrons}`,
  );
}

test("live isotope worked stages follow the original slider, endpoints, Undo and Reset", async ({
  page,
}) => {
  await page.goto("/lessons/relative-atomic-mass");
  const frame = page.locator("#relative-atomic-mass-worked");
  const slider = page.getByRole("slider", {
    name: "Percentage of mass-35 atoms",
    exact: true,
  });
  await expectStep(frame, 0);
  await expect(page.locator("[data-worked-vocabulary]")).toBeVisible();
  expect(
    await slider.evaluate((element) => {
      const vocabulary = document.querySelector("[data-worked-vocabulary]");
      return (
        !!vocabulary &&
        !!(
          vocabulary.compareDocumentPosition(element) &
          Node.DOCUMENT_POSITION_FOLLOWING
        )
      );
    }),
  ).toBe(true);
  await expect(currentStep(frame)).toContainText(
    "50 mass-35 atoms and 50 mass-37 atoms",
  );
  await expect(frame.locator("[data-mean]")).toHaveAttribute("data-mean", "36");
  await slider.focus();
  for (let index = 0; index < 5; index++) await slider.press("ArrowRight");
  await expect(slider).toHaveValue("75");
  await expect(currentStep(frame)).toContainText(
    "75 mass-35 atoms and 25 mass-37 atoms",
  );
  await expect(frame.locator("[data-counts]")).toHaveAttribute(
    "data-counts",
    "75,25",
  );
  await expect(frame.locator("[data-mean]")).toHaveAttribute(
    "data-mean",
    "35.5",
  );
  await setStep(frame, 1);
  await expect(currentStep(frame)).toContainText("2625 + 925 = 3550");
  await expect(frame.locator("tbody tr").nth(0)).toContainText(
    "35 × 75 = 2625",
  );
  await expect(frame.locator("tbody tr").nth(1)).toContainText("37 × 25 = 925");
  await setStep(frame, 2);
  await expect(currentStep(frame)).toContainText("3550 ÷ 100 = 35.5");
  await expect(frame.locator("[data-mean]")).toHaveAttribute(
    "data-mean",
    "35.5",
  );

  await slider.focus();
  await slider.press("End");
  await expect(slider).toHaveValue("100");
  await expect(currentStep(frame)).toContainText("3500 ÷ 100 = 35");
  await expect(currentStep(frame)).toContainText(
    "Only mass-35 atoms are present",
  );
  await expect(currentStep(frame)).not.toContainText("strictly between");
  await expect(frame.locator("[data-mean]")).toHaveAttribute("data-mean", "35");
  await slider.press("Home");
  await expect(slider).toHaveValue("0");
  await expect(currentStep(frame)).toContainText("3700 ÷ 100 = 37");
  await expect(currentStep(frame)).toContainText(
    "Only mass-37 atoms are present",
  );
  await expect(currentStep(frame)).not.toContainText("strictly between");
  await expect(frame.locator("[data-mean]")).toHaveAttribute("data-mean", "37");
  await setStep(frame, 1);
  await expect(currentStep(frame)).toContainText("35 × 0 = 0; 37 × 100 = 3700");
  await setStep(frame, 0);
  await expect(frame.locator("[data-counts]")).toHaveAttribute(
    "data-counts",
    "0,100",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(slider).toHaveValue("100");
  await expect(frame.locator("[data-counts]")).toHaveAttribute(
    "data-counts",
    "100,0",
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(slider).toHaveValue("50");
  await expect(frame.locator("[data-counts]")).toHaveAttribute(
    "data-counts",
    "50,50",
  );
  await expect(frame.locator("[data-mean]")).toHaveAttribute("data-mean", "36");
});

test("count-table example reveals ten atoms, their contribution and the actual denominator in order", async ({
  page,
}) => {
  await page.goto("/lessons/relative-atomic-mass");
  const frame = page.locator("#relative-atomic-mass-worked");
  await frame
    .getByLabel("Worked example", { exact: true })
    .selectOption("difficult");
  await expectStep(frame, 0);
  await expect(frame.getByRole("slider")).toHaveCount(0);
  await expect(frame.locator(".t17-worked-count-tile")).toHaveCount(10);
  await expect(
    frame.locator('.t17-worked-count-tile[data-mass="30"]'),
  ).toHaveCount(6);
  await expect(
    frame.locator('.t17-worked-count-tile[data-mass="32"]'),
  ).toHaveCount(4);
  await expect(currentStep(frame)).toContainText("6 + 4 = 10");
  await expect(currentStep(frame)).not.toContainText("308");
  await expect(currentStep(frame)).not.toContainText("30.8");
  await setStep(frame, 1);
  await expect(currentStep(frame)).toContainText("180 + 128 = 308");
  await expect(frame.locator("tbody tr").nth(0)).toContainText("30 × 6 = 180");
  await expect(frame.locator("tbody tr").nth(1)).toContainText("32 × 4 = 128");
  await expect(currentStep(frame)).not.toContainText("30.8");
  await setStep(frame, 2);
  await expect(currentStep(frame)).toContainText("308 ÷ 10 = 30.8");
  await expect(currentStep(frame)).toContainText(
    "3.08, outside the supplied mass range",
  );
  await expect(frame.locator("[data-mean]")).toHaveAttribute(
    "data-mean",
    "30.8",
  );
  await expect(frame.locator(".t17-worked-count-tile")).toHaveCount(10);
});

test("carbon and aluminium constructions track their current step without changing the learner model", async ({
  page,
}) => {
  await page.goto("/lessons/inside-an-atom");
  await page
    .getByRole("group", { name: "Learning task navigation", exact: true })
    .getByRole("button", { name: "Task 2", exact: true })
    .click();
  await page.getByRole("button", { name: "Add electron", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate((key) => {
        const raw = localStorage.getItem(key);
        return raw
          ? JSON.parse(raw).work["inside-an-atom"]?.taskModels?.[
              "atom-v2-g-neutral"
            ]?.at(-1)?.e
          : undefined;
      }, STORAGE_KEY),
    )
    .toBe(1);
  const originalModels = await page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).work["inside-an-atom"].taskModels,
    STORAGE_KEY,
  );
  const frame = page.locator("#inside-atom-worked");
  await expectStep(frame, 0);
  await atomCounts(frame, 6, 6, 0);
  await expect(currentStep(frame)).toContainText(
    "construction state, not a neutral atom",
  );
  await frame
    .getByRole("button", { name: "Add six electrons", exact: true })
    .click();
  await expectStep(frame, 1);
  await atomCounts(frame, 6, 6, 6);
  await expect(
    frame.locator('[data-particle="electron"][data-added="true"]'),
  ).toHaveCount(6);
  await expect(currentStep(frame)).toContainText("Electrons have a small mass");
  await setStep(frame, 2);
  await atomCounts(frame, 6, 6, 6);
  await expect(currentStep(frame)).toContainText("Neutrons have no charge");
  await setStep(frame, 0);
  await atomCounts(frame, 6, 6, 0);

  await frame
    .getByLabel("Worked example", { exact: true })
    .selectOption("difficult");
  await expectStep(frame, 0);
  await atomCounts(frame, 13, 13, 13);
  await expect(currentStep(frame)).toContainText(
    "does not yet have mass number 27",
  );
  await frame
    .getByRole("button", { name: "Add one neutron", exact: true })
    .click();
  await expectStep(frame, 1);
  await atomCounts(frame, 13, 14, 13);
  await expect(
    frame.locator('[data-particle="neutron"][data-added="true"]'),
  ).toHaveCount(1);
  await expect(currentStep(frame)).toContainText("27 − 13 = 14");
  await setStep(frame, 2);
  await atomCounts(frame, 13, 14, 13);
  await expect(currentStep(frame)).toContainText(
    "An electron changes charge, not mass number",
  );
  await expect(currentStep(frame)).toContainText(
    "Changing the proton count changes Z and therefore the element",
  );
  await committedCursor(page, "inside-an-atom", "difficult", 2);
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work["inside-an-atom"]
          .taskModels,
      STORAGE_KEY,
    ),
  ).toEqual(originalModels);
});

for (const pilot of pilots) {
  test(`${pilot.slug}: keyboard navigation is bounded, focused and exposes only collapsed prior steps`, async ({
    page,
  }) => {
    await page.goto(`/lessons/${pilot.slug}`);
    const frame = page.locator(pilot.selector);
    await expectStep(frame, 0);
    await expect(
      frame.getByRole("button", { name: "Back", exact: true }),
    ).toBeDisabled();
    await expect(
      frame.getByRole("button", { name: "Next", exact: true }),
    ).toBeEnabled();
    const next = frame.getByRole("button", { name: "Next", exact: true });
    await next.focus();
    await next.press("Enter");
    await expectStep(frame, 1);
    const heading = currentStep(frame).locator("h4");
    await expect(heading).toBeFocused();
    expect(
      await heading.evaluate((element) =>
        parseFloat(getComputedStyle(element).outlineWidth),
      ),
    ).toBeGreaterThanOrEqual(2);
    const history = frame.locator("details");
    await expect(history).not.toHaveAttribute("open", "");
    await expect(history.locator("li")).toHaveCount(1);
    await expect(history.locator("li")).toBeHidden();
    await history.locator("summary").focus();
    await history.locator("summary").press("Enter");
    await expect(history.locator("li")).toBeVisible();
    await next.focus();
    await next.press("Enter");
    await expectStep(frame, 2);
    await expect(currentStep(frame).locator("h4")).toBeFocused();
    await expect(next).toBeDisabled();
    await expect(history).not.toHaveAttribute("open", "");
    await expect(history.locator("li")).toHaveCount(2);
    await expect(history.locator("li").first()).toBeHidden();
    await frame.getByRole("button", { name: "Back", exact: true }).focus();
    await frame
      .getByRole("button", { name: "Back", exact: true })
      .press("Enter");
    await expectStep(frame, 1);
    await expect(currentStep(frame).locator("h4")).toBeFocused();
    await frame
      .getByLabel("Worked example", { exact: true })
      .selectOption("difficult");
    await expectStep(frame, 0);
    await expect(currentStep(frame).locator("h4")).toBeFocused();
    await expect(history.locator("li")).toHaveCount(0);
    await expect(
      frame.getByRole("button", { name: "Back", exact: true }),
    ).toBeDisabled();
    await frame
      .getByLabel("Worked example", { exact: true })
      .selectOption("main");
    await expectStep(frame, 0);
  });

  test(`${pilot.slug}: each stage of both examples restores the saved cursor after reload`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.goto(`/lessons/${pilot.slug}`);
    const frame = page.locator(pilot.selector);
    // Make an explicit selection so the initial main cursor is saved as well.
    await frame
      .getByLabel("Worked example", { exact: true })
      .selectOption("difficult");
    for (const example of ["main", "difficult"] as const) {
      await frame
        .getByLabel("Worked example", { exact: true })
        .selectOption(example);
      for (const step of [0, 1, 2]) {
        await setStep(frame, step);
        await committedCursor(page, pilot.slug, example, step);
        await page.reload();
        await expect(
          frame.getByLabel("Worked example", { exact: true }),
        ).toHaveValue(example);
        await expectStep(frame, step);
        await expect(frame.locator("details")).not.toHaveAttribute("open", "");
      }
    }
  });

  test(`${pilot.slug}: practice is directly reachable and worked content stays out of other stages and lessons`, async ({
    page,
  }) => {
    await page.goto(`/lessons/${pilot.slug}`);
    const frame = page.locator(pilot.selector);
    await expect(frame).toBeVisible();
    await frame
      .getByRole("button", { name: "Go straight to practice", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Practise", exact: true }),
    ).toHaveAttribute("aria-current", "step");
    await expect(page.locator("[data-worked-example]")).toHaveCount(0);
    for (const stage of ["Check", "Review", "Warm-up"] as const) {
      await page.getByRole("button", { name: stage, exact: true }).click();
      await expect(page.locator("[data-worked-example]")).toHaveCount(0);
    }
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    await expect(frame).toBeVisible();
    await page
      .getByRole("group", { name: "Learning task navigation", exact: true })
      .getByRole("button", {
        name: pilot.slug === "relative-atomic-mass" ? "Task 2" : "Task 4",
        exact: true,
      })
      .click();
    await expect(page.locator("[data-worked-example]")).toHaveCount(0);
    await page.goto("/lessons/titration-calculations");
    await expect(page.locator("[data-worked-example]")).toHaveCount(0);
    await expect(page.locator("[data-worked-vocabulary]")).toHaveCount(0);
  });
}

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 844 },
]) {
  test(`${viewport.width}×${viewport.height}: both worked players reflow with 44px controls and accessible diagrams`, async ({
    page,
  }, info) => {
    test.setTimeout(120000);
    await page.setViewportSize(viewport);
    await mkdir(shots, { recursive: true });
    for (const pilot of pilots) {
      await page.goto(`/lessons/${pilot.slug}`);
      const frame = page.locator(pilot.selector);
      await expect(frame).toBeVisible();
      await noOverflow(page, frame);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: `${shots}/${info.project.name}-${viewport.width}-${pilot.slug}-opening.png`,
      });
      const jump = page.getByRole("link", {
        name: "See worked steps",
        exact: true,
      });
      await expect(jump).toBeVisible();
      const jumpBox = await jump.boundingBox();
      expect(jumpBox!.height).toBeGreaterThanOrEqual(44);
      await jump.click();
      await expect(frame).toBeInViewport();
      for (const example of ["main", "difficult"] as const) {
        await frame
          .getByLabel("Worked example", { exact: true })
          .selectOption(example);
        for (const step of [0, 1, 2]) {
          await setStep(frame, step);
          await noOverflow(page, frame);
          const controls = frame.locator("button, select, summary");
          for (const control of await controls.all()) {
            const box = await control.boundingBox();
            expect(box).not.toBeNull();
            expect(box!.height).toBeGreaterThanOrEqual(44);
            expect(box!.width).toBeGreaterThanOrEqual(44);
          }
        }
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await frame.screenshot({
        path: `${shots}/${info.project.name}-${viewport.width}-${pilot.slug}-difficult.png`,
      });
    }
  });
}
