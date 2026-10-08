import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { profileJourney as journey } from "../src/content/journeys/reaction-profiles";
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
    page.locator(".profile-workbench .feedback[role=status]"),
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
  if (q.profileDrawing) {
    const b = JSON.parse(q.answer);
    for (const k of ["reactant", "product", "peak"])
      await page
        .getByLabel("Your drawn " + k + " level / kJ", { exact: true })
        .fill(b[k]);
    await page
      .getByLabel("Your drawn activation arrow", { exact: true })
      .selectOption(b.activationArrow);
    await page
      .getByLabel("Your drawn overall-change arrow", { exact: true })
      .selectOption(b.overallArrow);
  } else if (q.parts) {
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

const route = "/lessons/reaction-profiles";
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/reaction-profiles");
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
      if (
        (form === 0 && i === 0) ||
        (form === 0 && i === 3) ||
        (form === 1 && i === 1)
      )
        await capture(
          page,
          "docs/qa/reaction-profiles-" +
            info.project.name +
            (q.profileDrawing
              ? "-independent-draw-" + form + ".png"
              : "-independent.png"),
        );
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work["reaction-profiles"]
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
      for (const run of p.work["reaction-profiles"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["reaction-profiles"].run.submitted = Date.now() - delay - 1000;
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

test("all original practice works while three written explanations remain self-reviewed", async ({
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
                "reaction-profiles"
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

async function learn(page: Page, n: number) {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, n);
}
async function opening(page: Page, label: string, button = false) {
  await page.evaluate(() => scrollTo(0, 0));
  const control = button
    ? page.getByRole("button", { name: label, exact: true })
    : page.getByLabel(label, { exact: true });
  const b = await control.boundingBox();
  expect(b!.height).toBeGreaterThanOrEqual(44);
  expect(b!.y + b!.height).toBeLessThanOrEqual(664);
}
async function move(page: Page, field: string, times: number) {
  for (let i = 0; i < Math.abs(times); i++)
    await page
      .getByRole("button", {
        name: (times < 0 ? "Decrease " : "Increase ") + field,
        exact: true,
      })
      .click();
}
async function readable(page: Page) {
  const sizes = await page
    .locator(".reaction-profile-figure svg text")
    .evaluateAll((nodes) =>
      nodes.map((n) => {
        const v = n as SVGGraphicsElement;
        return (
          (parseFloat(getComputedStyle(n).fontSize) *
            n.getBoundingClientRect().height) /
          v.getBBox().height
        );
      }),
    );
  expect(sizes.length).toBeGreaterThan(5);
  for (const s of sizes) expect(s).toBeGreaterThanOrEqual(12);
}
const recordLabel = "Supplied profile scenario";
const activationLabel = "Your forward activation energy / kJ";
const overallLabel = "Your requested overall quantity / kJ";
const classificationLabel = "Your profile classification";
const shot = (project: string, kind: string) =>
  `docs/qa/reaction-profiles-${project}-${kind}.png`;
test("construction retains incorrect peak through reload and builds exact curved plateaus with keyboard, undo and reset", async ({
  page,
}, info) => {
  await learn(page, 1);
  await opening(page, "Increase Reactant energy level", true);
  await page
    .getByRole("button", {
      name: "Increase Reactant energy level",
      exact: true,
    })
    .focus();
  await page.keyboard.press("Enter");
  await move(page, "Reactant energy level", 15);
  await move(page, "Product energy level", 6);
  await move(page, "Proposed peak energy level", 8);
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(page.locator(".profile-workbench svg")).toHaveAttribute(
    "data-peak",
    "40",
  );
  await check(page, false);
  await move(page, "Proposed peak energy level", 16);
  await check(page, true);
  await readable(page);
  await capture(page, shot(info.project.name, "build"));
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await check(page, false);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(page.locator(".profile-workbench svg")).toHaveAttribute(
    "data-reactant",
    "0",
  );
  await select(page, recordLabel, "endothermic");
  await move(page, "Reactant energy level", 4);
  await move(page, "Product energy level", 11);
  await move(page, "Proposed peak energy level", 18);
  await check(page, true);
  await capture(page, shot(info.project.name, "build-endo"));
  await select(page, recordLabel, "fromRelease");
  await expect(page.locator(".profile-workbench svg")).toHaveAttribute(
    "data-peak",
    "0",
  );
});
test("read predictions distinguish peak, forward barrier, signed difference, release magnitude and shared reference shifts", async ({
  page,
}, info) => {
  await learn(page, 2);
  await opening(page, activationLabel);
  await page.getByLabel(activationLabel, { exact: true }).fill("90");
  await page.getByLabel(overallLabel, { exact: true }).fill("-20");
  await select(page, classificationLabel, "exothermic");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(page.getByLabel(activationLabel, { exact: true })).toHaveValue(
    "90",
  );
  await page.getByLabel(activationLabel, { exact: true }).fill("50");
  await check(page, true);
  await readable(page);
  await capture(page, shot(info.project.name, "read"));
  for (const [record, activation, overall, classification] of [
    ["endothermic", "75", "35", "endothermic"],
    ["releaseSize", "40", "50", "exothermic"],
    ["offset", "50", "-20", "exothermic"],
    ["zero", "50", "0", "no-net-difference"],
    ["highProduct", "90", "75", "endothermic"],
  ]) {
    await select(page, recordLabel, record);
    await expect(page.getByLabel(activationLabel, { exact: true })).toHaveValue(
      "0",
    );
    await expect(
      page.getByLabel(classificationLabel, { exact: true }),
    ).toHaveValue("unset");
    await page.getByLabel(activationLabel, { exact: true }).fill(activation);
    await page.getByLabel(overallLabel, { exact: true }).fill(overall);
    await select(page, classificationLabel, classification);
    await check(page, true);
  }
});
test("arrow placement rejects product-to-peak and reverse overall spans and preserves chosen wrong arrows", async ({
  page,
}, info) => {
  await learn(page, 3);
  await opening(page, "Your activation arrow");
  await select(page, "Your activation arrow", "products-peak");
  await select(page, "Your overall-change arrow", "products-reactants");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your activation arrow", { exact: true }),
  ).toHaveValue("products-peak");
  await select(page, "Your activation arrow", "reactants-peak");
  await select(page, "Your overall-change arrow", "reactants-products");
  await check(page, true);
  await readable(page);
  await capture(page, shot(info.project.name, "arrows"));
  await select(page, recordLabel, "endothermic");
  await expect(
    page.getByLabel("Your activation arrow", { exact: true }),
  ).toHaveValue("unset");
  await select(page, "Your activation arrow", "reactants-peak");
  await select(page, "Your overall-change arrow", "reactants-products");
  await check(page, true);
  await capture(page, shot(info.project.name, "arrows-endo"));
});
test("catalyst construction keeps endpoints and requires the alternative maximum above both but below original barrier", async ({
  page,
}, info) => {
  await learn(page, 4);
  await opening(page, "Decrease Proposed peak energy level", true);
  await expect(page.getByLabel(recordLabel, { exact: true })).toHaveValue(
    "endothermic",
  );
  await check(page, false);
  await move(page, "Proposed peak energy level", 30);
  await check(page, false);
  await expect(page.locator(".profile-workbench svg")).toHaveAttribute(
    "data-alternative-peak",
    "240",
  );
  const yCoordinates = await page
    .locator(".profile-workbench path[stroke-dasharray]")
    .evaluate((n) =>
      n
        .getAttribute("d")!
        .split(/[ML]/)
        .filter(Boolean)
        .map((p) => Number(p.split(",")[1])),
    );
  expect(Math.min(...yCoordinates)).toBeCloseTo(55, 8);
  expect(yCoordinates.every((y) => y >= 55 && y <= 370)).toBe(true);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await move(page, "Proposed peak energy level", -7);
  await check(page, false);
  await expect(
    page.locator(".profile-workbench svg path[stroke-dasharray]"),
  ).toHaveCount(1);
  await move(page, "Proposed peak energy level", 3);
  await check(page, true);
  await move(page, "Product energy level", -1);
  await check(page, false);
  await saved(page);
  await page.reload();
  await check(page, false);
  await move(page, "Product energy level", 1);
  await check(page, true);
  await readable(page);
  await capture(page, shot(info.project.name, "catalyst"));
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(page.getByLabel(recordLabel, { exact: true })).toHaveValue(
    "endothermic",
  );
  await check(page, false);
});
test("diagram evidence rejects unsupported clock readings and catalyst endpoint changes and retains all selected interpretations", async ({
  page,
}, info) => {
  await learn(page, 5);
  await opening(page, "Your supported profile claim");
  await select(page, "Your supported profile claim", "rate-not-established");
  await select(page, "Your profile evidence reason", "width-not-time");
  await check(page, false);
  await select(page, "Your supported profile claim", "time-not-established");
  await select(page, "Your profile evidence reason", "progress-not-time");
  await check(page, true);
  await capture(page, shot(info.project.name, "evidence"));
  for (const [record, claim, reason] of [
    ["initial", "barrier-and-release", "different-spans"],
    ["catalyst", "not-same-catalysed-reaction", "endpoints-must-remain"],
    ["peak", "invalid-simple-profile", "peak-above-both"],
    ["zero", "differences-unchanged", "same-offset-cancels"],
    ["collision", "not-guaranteed", "orientation-also-matters"],
    ["multistep", "single-hump-not-universal", "schematic-not-mechanism-proof"],
  ]) {
    await select(page, recordLabel, record);
    await select(page, "Your supported profile claim", claim);
    await select(page, "Your profile evidence reason", reason);
    await check(page, true);
  }
});
test("wrong practice peak substitution survives targeted recovery and reload before an explicit correction", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await page.getByLabel("Your answer", { exact: true }).fill("95");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "95",
  );
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "95",
  );
  await page.getByLabel("Your answer", { exact: true }).fill("65");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "That’s right.",
  );
});
test("independent drawing retains a wrong maximum and raw invalid draft without teaching feedback or model assistance", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 3; i++) {
    await answer(page, journey.checkForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
  }
  await page
    .getByLabel("Your drawn reactant level / kJ", { exact: true })
    .fill("50");
  await page
    .getByLabel("Your drawn product level / kJ", { exact: true })
    .fill("20");
  await page
    .getByLabel("Your drawn peak level / kJ", { exact: true })
    .fill("bad");
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your drawn peak level / kJ", { exact: true }),
  ).toHaveValue("bad");
  await expect(page.locator(".profile-drawing-input svg")).toHaveCount(0);
  await page
    .getByLabel("Your drawn peak level / kJ", { exact: true })
    .fill("100");
  await select(page, "Your drawn activation arrow", "products-peak");
  await select(page, "Your drawn overall-change arrow", "products-reactants");
  await saved(page);
  await page.reload();
  await expect(page.locator(".profile-drawing-input svg")).toHaveAttribute(
    "data-peak",
    "100",
  );
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Check model", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(0);
  await readable(page);
  await capture(page, shot(info.project.name, "independent-wrong-draw"));
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(0);
  await expect(
    page.getByLabel("Your drawn peak level / kJ", { exact: true }),
  ).toBeDisabled();
});
test("downloaded SVG preserves actual finite curve geometry, energy metadata and selected arrow endpoints", async ({
  page,
}, info) => {
  await learn(page, 3);
  await select(page, "Your activation arrow", "reactants-peak");
  await select(page, "Your overall-change arrow", "reactants-products");
  const promise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download this profile diagram", exact: true })
    .click();
  const download = await promise;
  expect(download.suggestedFilename()).toBe("reaction-profile.svg");
  const path = `docs/qa/reaction-profiles-${info.project.name}.svg`;
  await download.saveAs(path);
  const fs = await import("node:fs/promises"),
    source = await fs.readFile(path, "utf8");
  const audit = await page.evaluate((source) => {
    const d = new DOMParser().parseFromString(source, "image/svg+xml"),
      svg = d.documentElement,
      curve = svg.querySelector('path[stroke="#3b44c9"]')!,
      points = curve
        .getAttribute("d")!
        .split(/[ML]/)
        .filter(Boolean)
        .map((v) => v.split(",").map(Number)),
      arrows = [...svg.querySelectorAll("line[marker-end]")].map((n) => ({
        from: Number(n.getAttribute("y1")),
        to: Number(n.getAttribute("y2")),
      }));
    return {
      valid: d.querySelector("parsererror") === null,
      reactant: svg.getAttribute("data-reactant"),
      product: svg.getAttribute("data-product"),
      peak: svg.getAttribute("data-peak"),
      axis: svg.getAttribute("data-axis"),
      points,
      arrows,
    };
  }, source);
  expect(audit.valid).toBe(true);
  expect([audit.reactant, audit.product, audit.peak, audit.axis]).toEqual([
    "80",
    "30",
    "120",
    "reaction-progress",
  ]);
  expect(audit.points).toHaveLength(101);
  expect(audit.points.every((p) => p.every(Number.isFinite))).toBe(true);
  const y = (v: number) => 370 - (v / 140) * 315;
  expect(audit.points[0][1]).toBeCloseTo(y(80), 8);
  expect(audit.points[50][1]).toBeCloseTo(y(120), 8);
  expect(audit.points[100][1]).toBeCloseTo(y(30), 8);
  expect(audit.arrows).toEqual([
    { from: y(80), to: y(120) },
    { from: y(80), to: y(30) },
  ]);
  expect(source).toContain('width="500"');
  expect(source).toContain('height="435"');
  const standalone = await page.context().newPage();
  await standalone.setViewportSize({ width: 500, height: 435 });
  await standalone.setContent(source);
  await standalone.screenshot({
    path: shot(info.project.name, "downloaded-diagram"),
  });
  await standalone.close();
  await fs.writeFile(
    path.replace(".svg", "-audit.json"),
    JSON.stringify(audit, null, 2),
  );
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await page.addStyleTag({
    content: ".mobile-bar, .skip-link {visibility:hidden !important;}",
  });
  await page
    .locator(".reaction-profile-figure")
    .screenshot({ path: shot(info.project.name, "enlarged-diagram") });
});
