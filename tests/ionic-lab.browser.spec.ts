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
  await p.waitForFunction(
    ({ key, work, draft }) => {
      const raw = localStorage.getItem(key);
      return (
        raw !== null && JSON.parse(raw).work[work]?.drafts[draft] !== undefined
      );
    },
    { key: STORAGE_KEY, work: LAB_WORK, draft: LAB_DRAFT },
  );
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
async function dragElectron(
  page: Page,
  donor: number,
  receiver: number,
  cancel = false,
) {
  const pickup = page.locator(`[data-drag-donor="${donor}"]`);
  await pickup.scrollIntoViewIfNeeded();
  const from = (await pickup.boundingBox())!;
  const target = page
    .locator(`[data-side="nonmetal"][data-atom-index="${receiver}"] button`)
    .first();
  const to = (await target.boundingBox())!;
  const start = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const end = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) {
    const native = await page.context().newCDPSession(page);
    const touch = (x: number, y: number) => ({
      x,
      y,
      radiusX: 4,
      radiusY: 4,
      force: 1,
      id: 1,
    });
    await native.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [touch(start.x, start.y)],
    });
    for (let step = 1; step <= 12; step++)
      await native.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          touch(
            start.x + ((end.x - start.x) * step) / 12,
            start.y + ((end.y - start.y) * step) / 12,
          ),
        ],
      });
    await visibleParticles(page);
    await native.send("Input.dispatchTouchEvent", {
      type: cancel ? "touchCancel" : "touchEnd",
      touchPoints: [],
    });
    await native.detach();
    // Chromium suppresses the next synthesized click during its post-drag
    // gesture window, including on a plain HTML page with no event handlers.
    // Let that window finish before the first subsequent native tap; never
    // retry the tap or relax its required response/persistence assertions.
    await page.waitForTimeout(500);
  } else {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 12 });
    await visibleParticles(page);
    if (cancel) await page.keyboard.press("Escape");
    await page.mouse.up();
  }
}
async function visibleParticles(page: Page) {
  const particles = await page
    .locator("svg[data-electrons]")
    .evaluateAll((ions) =>
      ions.map((svg) => ({
        expected: Number(svg.getAttribute("data-electrons")),
        visible: [
          ...svg.querySelectorAll('circle[r="4.6"], path[class*="cross"]'),
        ].filter((marker) => getComputedStyle(marker).visibility !== "hidden")
          .length,
        held:
          svg
            .closest("[data-atom-visual]")
            ?.querySelectorAll("[data-drag-donor]").length ?? 0,
        placeholders: svg.querySelectorAll("[data-electron-placeholder]")
          .length,
      })),
    );
  for (const atom of particles) {
    expect(atom.visible + atom.held).toBe(atom.expected);
    expect(atom.placeholders).toBe(atom.held);
  }
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

test("direct electron manipulation supports real pointer and touch drag, cancellation, tap and keyboard without changing a nucleus", async ({
  page,
}) => {
  await page.goto(route);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const unchanged = await page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).work["experiment-ionic-bonding"] ??
      null,
    STORAGE_KEY,
  );
  await dragElectron(page, 0, 0, true);
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work[
          "experiment-ionic-bonding"
        ] ?? null,
      STORAGE_KEY,
    ),
  ).toEqual(unchanged);
  await expect(page.locator('svg[data-protons="11"]')).toHaveAttribute(
    "data-electrons",
    "11",
  );
  await expect(
    page.getByText("Choose a receiving atom. Tap × again or Escape to cancel."),
  ).toHaveCount(0);
  await press(page, "Move an outer electron from sodium");
  await expect(
    button(page, "Move an outer electron from sodium"),
  ).toHaveAttribute("aria-pressed", "true");
  await press(page, "Move an outer electron from sodium");
  await expect(
    button(page, "Move an outer electron from sodium"),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator('svg[data-protons="11"]')).toHaveAttribute(
    "data-electrons",
    "11",
  );
  await dragElectron(page, 0, 0);
  await expect.poll(async () => (await saved(page)).nacl.sent).toBe(1);
  await expect(page.locator('svg[data-protons="11"]')).toHaveAttribute(
    "data-electrons",
    "10",
  );
  await expect(page.locator('svg[data-protons="17"]')).toHaveAttribute(
    "data-electrons",
    "18",
  );
  // The entire first prediction row should fit, as well as the pickup control.
  for (const name of ["1−", "0", "1+"]) {
    const bounds = (await button(page, name).boundingBox())!;
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(664);
  }
  await press(page, "1−");
  await press(page, "Check my prediction");
  await expect(
    page.getByText("Losing a negative makes the ion positive."),
  ).toBeVisible();
  await page.reload();
  await expect
    .poll(async () => (await saved(page)).nacl)
    .toMatchObject({
      sent: 1,
      charge: "-1",
      checked: true,
    });
  await press(page, "Return an electron from chlorine to sodium");
  const pickup = button(page, "Move an outer electron from sodium");
  await pickup.focus();
  await page.keyboard.press("Enter");
  await expect(pickup).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(pickup).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Space");
  const receiver = button(page, "Give sodium’s electron to chlorine");
  await receiver.focus();
  await page.keyboard.press("Enter");
  await expect.poll(async () => (await saved(page)).nacl.sent).toBe(1);
  await press(page, "Return an electron from chlorine to sodium");
  await press(page, "Move an outer electron from sodium");
  await press(page, "Give sodium’s electron to chlorine");
  await expect.poll(async () => (await saved(page)).nacl.sent).toBe(1);
  expect((await saved(page)).nacl.checked).toBe(false);
  await press(page, "Return an electron from chlorine to sodium");
  await press(page, "Move an outer electron from sodium");
  await press(page, "Send an electron from sodium to chlorine");
  await expect(button(page, "Inspect chlorine")).toBeVisible();
  await expect(button(page, "Give sodium’s electron to chlorine")).toHaveCount(
    0,
  );
  await expect.poll(async () => (await saved(page)).nacl.sent).toBe(1);
});

test("spatial electron drops preserve a wrong magnesium distribution and can repair it after reload", async ({
  page,
}) => {
  await page.goto(route);
  await press(page, "Open Balance chapter");
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await dragElectron(page, 0, 0);
  await dragElectron(page, 0, 0);
  await press(page, "Check my arrangement");
  await expect(
    page.getByText("One chlorine received both electrons."),
  ).toBeVisible();
  await page.reload();
  expect((await saved(page)).mgcl.transfers).toEqual([2, 0]);
  await expect(
    page.getByText("One chlorine received both electrons."),
  ).toBeVisible();
  await expect(page.locator('svg[data-protons="17"]').first()).toHaveAttribute(
    "data-shells",
    "2,8,9",
  );
  await press(page, "Return an electron from chlorine 1 to magnesium");
  await dragElectron(page, 0, 1);
  expect((await saved(page)).mgcl.transfers).toEqual([1, 1]);
  const particles = await page
    .locator("svg[data-electrons]")
    .evaluateAll((ions) =>
      ions.map((a) => ({
        protons: Number(a.getAttribute("data-protons")),
        electrons: Number(a.getAttribute("data-electrons")),
      })),
    );
  expect(particles.map((a) => a.protons)).toEqual([12, 17, 17]);
  expect(particles.reduce((sum, a) => sum + a.electrons, 0)).toBe(46);
  await page.reload();
  expect((await saved(page)).mgcl.transfers).toEqual([1, 1]);
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

test("charge bookkeeping and following either lattice ion distinguish ion formation from the extended attraction network", async ({
  page,
}) => {
  await page.goto(route);
  await expect(page.getByText("See why sodium becomes positive")).toHaveCount(
    0,
  );
  await press(page, "Send an electron from sodium to chlorine");
  await press(page, "1−");
  await press(page, "Check my prediction");
  const ledgerToggle = page.getByText("See why sodium becomes positive", {
    exact: true,
  });
  if (await page.evaluate(() => navigator.maxTouchPoints > 0))
    await ledgerToggle.tap();
  else await ledgerToggle.click();
  await expect(
    page.getByRole("img", {
      name: /Sodium has eleven positive proton charges and 10 negative electron charges/,
    }),
  ).toBeVisible();
  await expect(page.getByText("11 − 10 = +1", { exact: true })).toBeVisible();
  const positive = page.locator('[data-positive="true"]');
  await expect(positive).toHaveCount(11);
  await expect(page.locator('[data-missing="true"]')).toHaveCount(1);
  await press(page, "Open Connect chapter");
  await press(page, "Follow Cl⁻");
  await press(page, "Show attraction directions");
  await expect(page.locator("[data-force-direction]")).toHaveCount(4);
  await expect(page.locator("[data-selected-ion]")).toHaveAttribute(
    "data-lattice-charge",
    "-1",
  );
  await press(page, "Reveal the third dimension");
  await expect(page.locator("[data-force-direction]")).toHaveCount(6);
  await expect(page.locator('[data-lattice-charge="1"]')).toHaveCount(32);
  await expect(page.locator('[data-lattice-charge="-1"]')).toHaveCount(32);
  await press(page, "4");
  await press(page, "Check my prediction");
  await press(page, "Just its donor");
  await press(page, "Check the connection");
  await expect(
    page.getByText("The transferred electron does not choose a partner."),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Follow Cl⁻", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-force-direction]")).toHaveCount(6);
  await expect
    .poll(async () => (await saved(page)).lattice)
    .toMatchObject({
      focus: "chloride",
      forces: true,
      guess: "4",
      checked: true,
      relationship: "donor",
      relationshipChecked: true,
    });
  await layout(
    page,
    // The bonding response now precedes the model on mobile. Gate the actual
    // first complete answer; all model controls still receive the 44px check.
    page.getByRole("button", { name: "Just its donor", exact: true }),
  );
  await press(page, "Follow Na⁺");
  await expect(page.locator("[data-selected-ion]")).toHaveAttribute(
    "data-lattice-charge",
    "1",
  );
  await expect(page.locator("[data-force-direction]")).toHaveCount(6);
  await expect(page.locator('[data-lattice-charge="1"]')).toHaveCount(32);
  await expect(page.locator('[data-lattice-charge="-1"]')).toHaveCount(32);
  await press(page, "Hide attraction directions");
  await expect(page.locator("[data-force-direction]")).toHaveCount(0);
  await expect(page.locator("[data-neighbour]")).toHaveCount(6);
  expect((await saved(page)).lattice.guess).toBe("4");
  await press(page, "Other Na⁺ too");
  await expect(
    page.getByText("The transferred electron does not choose a partner."),
  ).toHaveCount(0);
  await press(page, "Check the connection");
  await expect(
    page.getByText("Transfer made ions. Attraction makes a network."),
  ).toBeVisible();
  const work = await saved(page);
  expect(work.lattice.relationship).toBe("network");
  await expect
    .poll(async () =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work[
            "experiment-ionic-bonding"
          ].attempts["ionic-lab-network"]?.length ?? 0,
        STORAGE_KEY,
      ),
    )
    .toBe(2);
  const history = await page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).work["experiment-ionic-bonding"]
        .attempts["ionic-lab-network"],
    STORAGE_KEY,
  );
  expect(history).toHaveLength(2);
  expect(
    history.every(
      (attempt: { helped: boolean; fresh: boolean; correct: boolean }) =>
        attempt.helped && !attempt.fresh && !attempt.correct,
    ),
  ).toBe(true);
  expect(JSON.parse(history[0].answer).lattice.relationship).toBe("donor");
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
  await expect
    .poll(async () => (await saved(page)).run!.recorded[0])
    .toBe(true);
  await charge(page, "Metal-ion charge", "2−");
  await expect
    .poll(async () => (await saved(page)).run!.recorded[0])
    .toBe(false);
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
  await layout(page, button(page, "Send an electron from sodium 1 to oxygen"));
  const chargeBounds = (await page
    .getByRole("group", { name: "Metal-ion charge", exact: true })
    .getByRole("button", { name: "1+", exact: true })
    .boundingBox())!;
  expect(chargeBounds.height).toBeGreaterThanOrEqual(44);
  expect(chargeBounds.y + chargeBounds.height).toBeLessThanOrEqual(664);
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
