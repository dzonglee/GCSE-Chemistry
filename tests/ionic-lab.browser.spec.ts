import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { emptyProgress, emptyWork, STORAGE_KEY } from "../src/lib/progress";
import {
  initialLab,
  LAB_DRAFT,
  LAB_WORK,
  newRun,
  SEVEN_DAYS,
  submitRun,
  type LabState,
} from "../src/lib/experiments/ionic-lab";
const route = "/experiments/ionic-bonding";
const button = (p: Page, name: string) =>
  p.getByRole("button", { name, exact: true });
async function press(p: Page, name: string) {
  const target = button(p, name);
  if (await p.evaluate(() => navigator.maxTouchPoints > 0)) await target.tap();
  else await target.click();
}
async function saved(p: Page) {
  return p.evaluate(
    ({ key, work, draft }) =>
      JSON.parse(
        JSON.parse(localStorage.getItem(key)!).work[work].drafts[draft],
      ),
    { key: STORAGE_KEY, work: LAB_WORK, draft: LAB_DRAFT },
  ) as Promise<LabState>;
}
async function seed(p: Page, state: LabState | string) {
  await p.goto("/privacy");
  const data = emptyProgress();
  data.work[LAB_WORK] = {
    ...emptyWork(),
    drafts: {
      [LAB_DRAFT]: typeof state === "string" ? state : JSON.stringify(state),
      "other-experiment-draft": "keep me",
    },
  };
  data.work["ionic-bonding"] = {
    ...emptyWork(),
    drafts: { "ib-v1-p-draw-chloride": "1..2" },
  };
  await p.evaluate(
    ({ key, data }) => localStorage.setItem(key, JSON.stringify(data)),
    { key: STORAGE_KEY, data },
  );
  await p.goto(route);
}
async function layout(p: Page, first: Locator) {
  await p.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo(0, 0);
  });
  const b = await first.boundingBox();
  expect(b).not.toBeNull();
  expect(b!.height).toBeGreaterThanOrEqual(44);
  expect(b!.width).toBeGreaterThanOrEqual(44);
  expect(b!.y + b!.height).toBeLessThanOrEqual(664);
  const geometry = await p.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    fonts: [...document.querySelectorAll<SVGTextElement>("main svg text")].map(
      (e) =>
        parseFloat(getComputedStyle(e).fontSize) *
        Math.hypot(e.getScreenCTM()!.a, e.getScreenCTM()!.b),
    ),
    buttons: [
      ...document.querySelectorAll<HTMLButtonElement>("main button"),
    ].map((e) => e.getBoundingClientRect().height),
  }));
  expect(geometry.overflow).toBe(false);
  for (const size of geometry.fonts) expect(size).toBeGreaterThanOrEqual(12);
  for (const height of geometry.buttons)
    expect(height).toBeGreaterThanOrEqual(44);
  expect((await new AxeBuilder({ page: p }).analyze()).violations).toEqual([]);
}
async function begin(p: Page) {
  await press(p, "Open Challenge chapter");
  await press(p, "Start the challenge");
}
async function charge(p: Page, label: string, value: string) {
  await p
    .getByRole("group", { name: label, exact: true })
    .getByRole("button", { name: value, exact: true })
    .click();
}
function completed(at: number) {
  const state = initialLab();
  state.run = newRun("check", at - 1000);
  state.run.drawing = {
    transfers: [2],
    metalCharge: "2",
    nonmetalCharge: "-2",
    brackets: "yes",
  };
  state.run.force = "attraction";
  state.run.writing =
    "Magnesium loses two electrons; oxygen gains two. They form Mg2+ and O2− ions.";
  state.run.recorded = [true, true, true];
  return submitRun(state, at);
}

test("every learning and challenge opening reflows with usable native controls and accessible diagrams", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.setViewportSize({
    width: page.viewportSize()!.width,
    height: 664,
  });
  await page.goto(route);
  for (const chapter of ["Transfer", "Balance", "Connect"]) {
    await press(page, `Open ${chapter} chapter`);
    await layout(page, page.locator("[data-answer-control]").first());
  }
  await press(page, "Open Challenge chapter");
  await layout(page, button(page, "Start the challenge"));
  await press(page, "Start the challenge");
  await layout(page, page.locator("[data-answer-control]").first());
  await press(page, "Open Force response");
  await layout(page, page.locator("label:has(input[type=radio])").first());
  await press(page, "Open Explain response");
  await layout(page, page.getByRole("textbox", { name: "Your explanation" }));
  await expect(
    page.getByRole("region", { name: "Whole challenge review" }),
  ).toHaveCount(0);
  const finished = completed(Date.now());
  finished.scene = 4;
  await seed(page, finished);
  await layout(page, button(page, "Start delayed retrieval"));
});

test("wrong transfers and charge predictions survive reload and can be reversed without losing any electron", async ({
  page,
}) => {
  await page.goto(route);
  await press(page, "Send an electron from sodium to chlorine");
  await expect(page.locator("svg[data-electrons]").first()).toHaveAttribute(
    "aria-label",
    /charge awaiting your prediction/,
  );
  expect(
    await page
      .locator("svg[data-electrons]")
      .first()
      .getAttribute("data-shown-charge"),
  ).toBeNull();
  await press(page, "Inspect sodium");
  await expect(page.locator("svg[data-electrons]").last()).toHaveAttribute(
    "aria-label",
    /charge awaiting your prediction/,
  );
  await press(page, "Close atom view");
  await press(page, "1−");
  await press(page, "Check my prediction");
  await page.reload();
  await expect(button(page, "1−")).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText("Losing a negative makes the ion positive."),
  ).toBeVisible();
  await expect(page.locator("[data-electron-total]")).toHaveAttribute(
    "data-electron-total",
    "28",
  );
  await press(page, "1+");
  await press(page, "Check my prediction");
  await expect(
    page.getByText("Exactly. One less electron, a +1 ion."),
  ).toBeVisible();
  await press(page, "Open Balance chapter");
  await press(page, "Send an electron from magnesium to chlorine 1");
  await press(page, "Send an electron from magnesium to chlorine 1");
  await press(page, "Check my arrangement");
  await page.reload();
  await expect(
    page.getByText("One chlorine received both electrons."),
  ).toBeVisible();
  await expect(
    page.locator('[data-compound="MgCl2"] svg[data-electrons]').nth(1),
  ).toHaveAttribute("data-shells", "2,8,9");
  await expect(page.locator("[data-electron-total]")).toHaveAttribute(
    "data-electron-total",
    "46",
  );
  await expect(
    button(page, "Send an electron from magnesium to chlorine 2"),
  ).toBeDisabled();
  await press(page, "Return an electron from chlorine 1 to magnesium");
  await press(page, "Send an electron from magnesium to chlorine 2");
  await charge(page, "Chloride ions per magnesium ion", "2");
  await press(page, "Check my arrangement");
  await expect(
    page.getByText("Two recipients. One balanced formula."),
  ).toBeVisible();
  const work = await page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).work["experiment-ionic-bonding"],
    STORAGE_KEY,
  );
  expect(work.attempts["ionic-lab-balance"]).toHaveLength(2);
  expect(
    JSON.parse(work.attempts["ionic-lab-balance"][0].answer).mgcl.transfers,
  ).toEqual([2, 0]);
});

test("rotating a 3D cutaway retains six opposite neighbours and its planar slice has four", async ({
  page,
}) => {
  await page.goto(route);
  await press(page, "Open Connect chapter");
  await expect(page.locator("[data-neighbour]")).toHaveCount(4);
  await press(page, "Reveal the third dimension");
  await expect(page.locator("[data-neighbour]")).toHaveCount(6);
  const before = await page
    .locator("[data-lattice-charge]")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("transform")));
  await press(page, "Turn lattice right");
  await expect(page.getByText("View 53°")).toBeVisible();
  expect(
    await page
      .locator("[data-lattice-charge]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("transform"))),
  ).not.toEqual(before);
  await expect(page.locator('[data-lattice-charge="-1"]')).toHaveCount(32);
  await layout(page, page.locator("[data-answer-control]").first());
  await press(page, "Return to the flat slice");
  await expect(page.locator("[data-neighbour]")).toHaveCount(4);
});

test("three incorrect responses stay sealed until whole submission; editing invalidates recording and written work stays manual", async ({
  page,
}) => {
  await page.goto(route);
  await begin(page);
  await expect(page.locator("svg[data-electrons]").first()).toHaveAttribute(
    "aria-label",
    /charge not chosen/,
  );
  await press(page, "Send an electron from magnesium to oxygen");
  await charge(page, "Metal-ion charge", "1−");
  await charge(page, "Non-metal-ion charge", "1+");
  await press(page, "No brackets");
  await press(page, "Record this response");
  expect((await saved(page)).run!.recorded[0]).toBe(true);
  await charge(page, "Metal-ion charge", "2−");
  expect((await saved(page)).run!.recorded[0]).toBe(false);
  await expect(button(page, "Next response →")).toBeDisabled();
  await press(page, "Record this response");
  await press(page, "Next response →");
  await page.getByRole("radio", { name: /A shared pair/ }).check();
  await press(page, "Record this response");
  await press(page, "Next response →");
  const wrong = "Protons move and electrons are shared? 1..2 ";
  await page.getByRole("textbox", { name: "Your explanation" }).fill(wrong);
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Your explanation" }),
  ).toHaveValue(wrong);
  await expect(
    page.getByText("A reference to compare with", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Compare with the reference", { exact: true }),
  ).toHaveCount(0);
  await press(page, "Record this response");
  await press(page, "Submit all three and review →");
  await page.reload();
  await expect(
    page.getByRole("region", { name: "Whole challenge review" }),
  ).toBeVisible();
  await expect(page.getByText(wrong, { exact: true })).toBeVisible();
  const state = await saved(page);
  expect(state.runs[0]).toMatchObject({
    helped: true,
    fresh: false,
    drawing: {
      transfers: [1],
      metalCharge: "-2",
      nonmetalCharge: "1",
      brackets: "no",
    },
    writing: wrong,
  });
  expect(Object.keys(state.runs[0])).not.toContain("marks");
  await expect(
    page.getByText("The bond is attraction between opposite charges.", {
      exact: true,
    }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("seven-day gate stays closed at the last millisecond and opens at the boundary without reloading", async ({
  page,
}) => {
  const at = 1800000000000,
    boundary = at + SEVEN_DAYS;
  await page.clock.install({ time: new Date(boundary - 10000) });
  await page.clock.pauseAt(new Date(boundary - 10000));
  const state = completed(at);
  state.scene = 4;
  await seed(page, state);
  await page.clock.runFor(32);
  await expect(button(page, "Start delayed retrieval")).toBeDisabled();
  await page.clock.runFor(9967);
  await expect(button(page, "Start delayed retrieval")).toBeDisabled();
  await page.clock.runFor(1);
  await expect(button(page, "Start delayed retrieval")).toBeEnabled();
  await page.clock.resume();
  await press(page, "Start delayed retrieval");
  await expect(page.locator('[data-compound="Na2O"]')).toBeVisible();
  expect((await saved(page)).run!.kind).toBe("review");
  expect((await saved(page)).runs).toHaveLength(1);
  await expect(
    page.getByText("Compare with the reference", { exact: true }),
  ).toHaveCount(0);
  await press(page, "Send an electron from sodium 1 to oxygen");
  await press(page, "Send an electron from sodium 2 to oxygen");
  await charge(page, "Metal-ion charge", "1+");
  await charge(page, "Non-metal-ion charge", "2−");
  await press(page, "Square brackets");
  await press(page, "Record this response");
  await press(page, "Next response →");
  await page.getByRole("radio", { name: /Electrostatic attraction/ }).check();
  await press(page, "Record this response");
  await press(page, "Next response →");
  await page
    .getByRole("textbox", { name: "Your explanation" })
    .fill(
      "The nucleus still has 11 protons, but only 10 electrons remain, so the charge is +1.",
    );
  await press(page, "Record this response");
  await press(page, "Submit all three and review →");
  const reviewed = await saved(page);
  expect(reviewed.runs).toHaveLength(2);
  expect(reviewed.runs[0]).toEqual(state.runs[0]);
  expect(reviewed.runs[1]).toMatchObject({
    kind: "review",
    helped: true,
    fresh: false,
    drawing: {
      transfers: [1, 1],
      metalCharge: "1",
      nonmetalCharge: "-2",
      brackets: "yes",
    },
  });
  await press(page, "Plan a seven-day revisit →");
  await expect(button(page, "Start delayed retrieval")).toBeDisabled();
  await expect(button(page, "Open Revisit chapter")).toContainText("✓");
});

test("malformed experimental bytes survive reload and explicit recovery archives them while preserving course work", async ({
  page,
}) => {
  const raw = "{broken experimental bytes 1..2";
  await seed(page, raw);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your saved experiment stays safe." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      ({ key, work, draft }) =>
        JSON.parse(localStorage.getItem(key)!).work[work].drafts[draft],
      { key: STORAGE_KEY, work: LAB_WORK, draft: LAB_DRAFT },
    ),
  ).toBe(raw);
  await press(page, "Start a new experiment; archive this record");
  const progress = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(progress.work[LAB_WORK].attempts["ionic-lab-archived"][0].answer).toBe(
    raw,
  );
  expect(progress.work[LAB_WORK].drafts["other-experiment-draft"]).toBe(
    "keep me",
  );
  expect(progress.work["ionic-bonding"].drafts["ib-v1-p-draw-chloride"]).toBe(
    "1..2",
  );
  await page.reload();
  await expect(
    button(page, "Send an electron from sodium to chlorine"),
  ).toBeEnabled();
});

test("blocked storage permits study and honestly warns that persistence is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    for (const key of ["getItem", "setItem"])
      Object.defineProperty(Storage.prototype, key, {
        value: () => {
          throw Error("blocked");
        },
      });
  });
  await page.goto(route);
  await expect(page.getByText(/Browser storage is unavailable/)).toBeVisible();
  await press(page, "Send an electron from sodium to chlorine");
  await expect(page.locator("svg[data-electrons]").first()).toHaveAttribute(
    "data-electrons",
    "10",
  );
  await expect(page.getByText("Work is kept for this visit")).toBeVisible();
});

test("foreign corrupt namespace is preserved and stale cross-tab actions cannot overwrite newer experimental work", async ({
  page,
  context,
}) => {
  await page.goto("/privacy");
  await page.evaluate(
    (key) => localStorage.setItem(key, "original corrupt bytes"),
    STORAGE_KEY,
  );
  await page.goto(route);
  await press(page, "Send an electron from sodium to chlorine");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe("original corrupt bytes");
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
  const second = await context.newPage();
  await second.goto(route);
  await press(second, "Send an electron from sodium to chlorine");
  await expect(page.getByText(/changed in another tab/)).toBeVisible();
  const newer = await second.evaluate(
    (key) => localStorage.getItem(key),
    STORAGE_KEY,
  );
  await press(page, "1−");
  expect(
    await second.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(newer);
  await page.reload();
  await expect(page.locator("svg[data-electrons]").first()).toHaveAttribute(
    "data-electrons",
    "10",
  );
  await second.close();
});

test("guided exposure remains global, no course task changes, reduced motion and keyboard operation remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page, initialLab());
  await button(page, "Send an electron from sodium to chlorine").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("svg[data-electrons]").first()).toHaveAttribute(
    "data-electrons",
    "10",
  );
  expect(
    await page
      .locator("main")
      .evaluate(
        (e) =>
          [...e.querySelectorAll("*")].filter(
            (n) => getComputedStyle(n).animationName !== "none",
          ).length,
      ),
  ).toBe(0);
  const data = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(data.seen["ib-v1-p-draw-chloride"]).toBeGreaterThan(0);
  expect(data.work["ionic-bonding"].drafts["ib-v1-p-draw-chloride"]).toBe(
    "1..2",
  );
  await page.goto("/lessons/ionic-bonding");
  await expect(page.locator(".ionic-transfer")).toBeVisible();
  expect(
    await page.locator("main").evaluate((e) => getComputedStyle(e).maxWidth),
  ).not.toBe("1360px");
});
