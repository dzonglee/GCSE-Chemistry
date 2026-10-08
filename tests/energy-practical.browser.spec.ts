import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { practicalJourney as journey } from "../src/content/journeys/energy-practical";
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
    page.locator(".energy-practical-workbench .feedback[role=status]"),
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
  if (q.fuelDrawing) {
    const root = page.getByRole("region", {
      name: "Temperature graph construction",
      exact: true,
    });
    for (let i = 0; i < q.fuelDrawing.data.points.length; i++) {
      await root
        .getByLabel("Choose an observation or line end", { exact: true })
        .selectOption(String(i));
      await root
        .locator(`[data-plot-field="p${i}x"]`)
        .fill(String(q.fuelDrawing.data.points[i][0]));
      await root
        .locator(`[data-plot-field="p${i}y"]`)
        .fill(String(q.fuelDrawing.data.points[i][1]));
    }
  } else if (q.profileDrawing) {
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

const route = "/lessons/energy-practical";
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/energy-practical");
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
        (form === 0 && i === 2) ||
        (form === 0 && i === 3) ||
        (form === 1 && i === 1)
      )
        await capture(
          page,
          "docs/qa/energy-practical-" +
            info.project.name +
            (q.profileDrawing
              ? "-independent-draw-" + form + ".png"
              : "-independent-form-" + form + "-task-" + i + ".png"),
        );
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work["energy-practical"]
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
      for (const run of p.work["energy-practical"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["energy-practical"].run.submitted = Date.now() - delay - 1000;
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

test("all original practice works while explanations and the appended graph remain self-reviewed", async ({
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
        name: q.fuelDrawing
          ? "Save and review graph"
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
        q.fuelDrawing ? "Compare your graph" : "Compare your explanation",
      );
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "energy-practical"
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
async function scenario(page: Page, key: string) {
  await select(page, "Supplied practical investigation", key);
}
async function input(page: Page, label: string, value: string | number) {
  await page.getByLabel(label, { exact: true }).fill(String(value));
}
async function opening(page: Page) {
  await page.evaluate(() => scrollTo(0, 0));
  const box = await page
    .locator(
      ".energy-practical-workbench input,.energy-practical-workbench select",
    )
    .first()
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(664);
}
const prefix = "docs/qa/energy-practical-";
test("investigation plans retain plausible wrong controls and sequence through reload undo and scenario reset", async ({
  page,
}, info) => {
  await learn(page, 1);
  await opening(page);
  await select(page, "Your independent variable", "highest-temperature");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your independent variable", { exact: true }),
  ).toHaveValue("highest-temperature");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Your independent variable", { exact: true }),
  ).toHaveValue("unset");
  for (const [record, independent, dependent, instrument, controls] of [
    [
      "initial",
      "carbonate-mass",
      "highest-temperature",
      "balance",
      "acid-volume-concentration-start",
    ],
    [
      "volume",
      "alkali-volume",
      "highest-temperature",
      "measuring-cylinder",
      "acid-volume-concentration-start",
    ],
    [
      "displacement",
      "metal-identity",
      "temperature-change",
      "thermometer",
      "solution-volume-concentration-start-and-metal-amount",
    ],
    [
      "insulation",
      "insulation",
      "temperature-change",
      "thermometer",
      "reactant-amounts-concentrations-start",
    ],
  ]) {
    await scenario(page, record);
    for (const [l, v] of [
      ["Your independent variable", independent],
      ["Your measured response", dependent],
      ["Your measuring instrument", instrument],
      ["Your controlled conditions", controls],
      ["Your measurement sequence", "initial-add-stir-peak-repeat"],
    ])
      await select(page, l, v);
    await check(page, true);
  }
  await scenario(page, "initial");
  await select(page, "Your independent variable", "carbonate-mass");
  await select(page, "Your measured response", "highest-temperature");
  await select(page, "Your measuring instrument", "balance");
  await select(
    page,
    "Your controlled conditions",
    "acid-volume-concentration-start",
  );
  await select(page, "Your measurement sequence", "add-read-final-only");
  await check(page, false);
  await capture(page, prefix + info.project.name + "-plan.png");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Your measurement sequence", { exact: true }),
  ).toHaveValue("unset");
});
test("reaction-stage selections retain wrong final reading and signed prediction across reload", async ({
  page,
}, info) => {
  await learn(page, 2);
  await opening(page);
  await select(page, "Your pre-mixing reading", "2");
  await select(page, "Your reaction-stage extremum", "6");
  await input(page, "Your signed temperature change / °C", 6.2);
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your reaction-stage extremum", { exact: true }),
  ).toHaveValue("6");
  for (const [record, baseline, extreme, value] of [
    ["initial", "2", "4", "8.5"],
    ["cooling", "2", "4", "-6.5"],
    ["decimal", "2", "4", "8.2"],
    ["late", "1", "3", "7.5"],
    ["negative", "1", "3", "6"],
  ]) {
    await scenario(page, record);
    await select(page, "Your pre-mixing reading", baseline);
    await select(page, "Your reaction-stage extremum", extreme);
    await input(page, "Your signed temperature change / °C", value);
    await check(page, true);
  }
  await scenario(page, "decimal");
  await select(page, "Your pre-mixing reading", "2");
  await select(page, "Your reaction-stage extremum", "4");
  await input(page, "Your signed temperature change / °C", 8.2);
  await check(page, true);
  await capture(page, prefix + info.project.name + "-readings.png");
  await input(page, "Your signed temperature change / °C", "");
  await check(page, false);
  await expect(
    page.getByLabel("Your signed temperature change / °C", { exact: true }),
  ).toHaveValue("");
});
test("repeated data require a justified trial set and mean while wrong deletion persists", async ({
  page,
}, info) => {
  await learn(page, 3);
  await opening(page);
  await select(page, "Your retained trials", "first-two");
  await select(
    page,
    "Your reason for retaining or excluding trials",
    "delete-highest",
  );
  await input(page, "Your mean retained temperature rise / °C", 7.85);
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your reason for retaining or excluding trials", {
      exact: true,
    }),
  ).toHaveValue("delete-highest");
  for (const [record, retained, reason, mean] of [
    ["initial", "all", "ordinary-spread", "8.4"],
    ["failed", "first-two", "documented-failure", "7.85"],
    ["low", "all", "ordinary-spread", "3.6"],
    ["spread", "all", "retain-and-investigate", "7"],
    ["baseline", "all", "compare-changes-not-peaks", "8"],
  ]) {
    await scenario(page, record);
    await select(page, "Your retained trials", retained);
    await select(page, "Your reason for retaining or excluding trials", reason);
    await input(page, "Your mean retained temperature rise / °C", mean);
    await check(page, true);
  }
  await scenario(page, "failed");
  await select(page, "Your retained trials", "first-two");
  await select(
    page,
    "Your reason for retaining or excluding trials",
    "documented-failure",
  );
  await input(page, "Your mean retained temperature rise / °C", 7.85);
  await check(page, true);
  await capture(page, prefix + info.project.name + "-repeats.png");
});
test("gradient triangles use matching coordinate differences, axis units and uncorrected intercepts", async ({
  page,
}, info) => {
  await learn(page, 4);
  await opening(page);
  await select(page, "Your first fitted-line point", "0");
  await select(page, "Your second fitted-line point", "4");
  await select(page, "Your gradient unit", "gram-per-degree");
  await input(page, "Your matching temperature difference / °C", 6);
  await input(page, "Your matching mass difference / g", 4);
  await input(page, "Your fitted-line gradient", 1.5);
  await input(page, "Your extrapolated initial temperature / °C", 0);
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your extrapolated initial temperature / °C", {
      exact: true,
    }),
  ).toHaveValue("0");
  for (const [record, rise, run, gradient, intercept, unit] of [
    ["initial", "8", "4", "2", "21", "degree-per-gram"],
    ["decimal", "6", "4", "1.5", "21.2", "degree-per-gram"],
    ["shallow", "3.2", "4", "0.8", "20.6", "degree-per-gram"],
    ["volume", "8", "20", "0.4", "21", "degree-per-cubic-centimetre"],
  ]) {
    await scenario(page, record);
    await select(page, "Your first fitted-line point", "0");
    await select(page, "Your second fitted-line point", "4");
    await select(page, "Your gradient unit", unit);
    await input(page, "Your matching temperature difference / °C", rise);
    await input(
      page,
      unit === "degree-per-gram"
        ? "Your matching mass difference / g"
        : "Your matching volume difference / cm³",
      run,
    );
    await input(page, "Your fitted-line gradient", gradient);
    await input(page, "Your extrapolated initial temperature / °C", intercept);
    await check(page, true);
    await expect(page.getByTestId("gradient-triangle")).toBeVisible();
  }
  const fonts = await page
    .locator(".practical-plot svg text")
    .evaluateAll((ns) =>
      ns.map(
        (n) =>
          (parseFloat(getComputedStyle(n).fontSize) *
            n.getBoundingClientRect().height) /
          (n as SVGGraphicsElement).getBBox().height,
      ),
    );
  expect(Math.min(...fonts)).toBeGreaterThanOrEqual(12);
  await scenario(page, "decimal");
  await select(page, "Your first fitted-line point", "0");
  await select(page, "Your second fitted-line point", "4");
  await select(page, "Your gradient unit", "degree-per-gram");
  await input(page, "Your matching temperature difference / °C", 6);
  await input(page, "Your matching mass difference / g", 4);
  await input(page, "Your fitted-line gradient", 1.5);
  await input(page, "Your extrapolated initial temperature / °C", 21.2);
  await check(page, true);
  await capture(page, prefix + info.project.name + "-gradient.png");
  await select(page, "Your second fitted-line point", "0");
  await check(page, false);
  await expect(
    page.getByLabel("Your second fitted-line point", { exact: true }),
  ).toHaveValue("0");
});
test("fitted maximum estimates move an actual uncorrected cross and distinguish tied sampled peaks", async ({
  page,
}, info) => {
  await learn(page, 5);
  await opening(page);
  await input(page, "Your estimated intersection volume / cm³", 25);
  await input(page, "Your estimated maximum temperature / °C", 30);
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your estimated intersection volume / cm³", {
      exact: true,
    }),
  ).toHaveValue("25");
  await expect(page.getByTestId("intersection-prediction")).toBeVisible();
  await input(page, "Your estimated intersection volume / cm³", 26.67);
  await input(page, "Your estimated maximum temperature / °C", 30.67);
  await check(page, true);
  await capture(page, prefix + info.project.name + "-fitted-maximum.png");
  await page.getByText("Read the supplied data table", { exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await scenario(page, "second");
  await input(page, "Your estimated intersection volume / cm³", 16.67);
  await input(page, "Your estimated maximum temperature / °C", 31);
  await check(page, true);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Your estimated maximum temperature / °C", { exact: true }),
  ).toHaveValue("0");
});
test("practical explanations require matching evidence and preserve plausible wrong bias claims", async ({
  page,
}, info) => {
  await learn(page, 6);
  await opening(page);
  await select(page, "Your supported practical claim", "repeat-removes-bias");
  await select(page, "Your evidence reason", "all-errors-average-away");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your supported practical claim", { exact: true }),
  ).toHaveValue("repeat-removes-bias");
  for (const [record, claim, reason] of [
    [
      "resolution",
      "finer-resolution-not-guaranteed-accuracy",
      "smaller-division-not-calibration-proof",
    ],
    [
      "risk",
      "follow-prescribed-eye-protection",
      "address-supplied-eye-splash-risk",
    ],
    [
      "initial",
      "insulation-reduces-transfer",
      "smaller-unwanted-heat-exchange",
    ],
    [
      "stir",
      "stir-for-representative-temperature",
      "reduce-spatial-temperature-differences",
    ],
    [
      "repetitions",
      "repeat-estimate-mean-and-spread",
      "random-variation-remains",
    ],
    [
      "bias",
      "repetition-does-not-remove-bias",
      "same-systematic-effect-remains",
    ],
    [
      "volume",
      "total-volume-increases",
      "added-volume-is-not-constant-total-volume",
    ],
    [
      "energy",
      "temperature-alone-insufficient-energy",
      "amount-and-heat-capacity-not-controlled",
    ],
    ["peak", "record-reaction-stage-maximum", "final-cooling-misses-peak"],
    ["zero", "intercept-is-estimate", "extrapolation-not-direct-observation"],
    ["excess", "rise-then-level", "acid-limits-further-reaction"],
    ["tied", "sampled-maximum-tied", "fit-estimate-distinct-from-observation"],
  ]) {
    await scenario(page, record);
    await select(page, "Your supported practical claim", claim);
    await select(page, "Your evidence reason", reason);
    await check(page, true);
  }
  await scenario(page, "stir");
  await select(
    page,
    "Your supported practical claim",
    "stir-for-representative-temperature",
  );
  await select(
    page,
    "Your evidence reason",
    "reduce-spatial-temperature-differences",
  );
  await check(page, true);
  await capture(page, prefix + info.project.name + "-evidence.png");
});
test("wrong temperature recovery returns to the original retained response", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await input(page, "Your answer", "3.6");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "3.6",
  );
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "3.6",
  );
  await input(page, "Your answer", "7.7");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByText("That’s right.", { exact: true })).toBeVisible();
  await capture(page, prefix + info.project.name + "-recovery.png");
});
test("real nested-cup reference rotates and exports actual geometry without replacing investigation measurements", async ({
  page,
}, info) => {
  await learn(page, 1);
  await page
    .getByText("Inspect the real 3D cup apparatus", { exact: true })
    .click();
  const group = page.getByRole("group", {
    name: "Rotate temperature apparatus reference",
    exact: true,
  });
  await expect(group).toHaveAttribute("data-ready", "true");
  await page
    .getByRole("button", { name: "Show reaction-stage 28.0 °C", exact: true })
    .click();
  await expect(group).toHaveAttribute("data-reading", "28");
  await group.focus();
  await page.keyboard.press("ArrowRight");
  await expect(group).toHaveAttribute("data-rotation", "0.1");
  await expect(
    page.getByText(/illustrative 20 °C and 28 °C states/),
  ).toBeVisible();
  await expect(
    page.getByLabel("Your independent variable", { exact: true }),
  ).toHaveValue("unset");
  await capture(page, prefix + info.project.name + "-3d.png");
  const waiting = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D apparatus", exact: true })
    .click();
  const download = await waiting;
  const path = prefix + info.project.name + "-cup.glb";
  await download.saveAs(path);
  const { readFile } = await import("node:fs/promises"),
    raw = await readFile(path);
  expect(raw.toString("ascii", 0, 4)).toBe("glTF");
  expect(raw.readUInt32LE(4)).toBe(2);
  expect(raw.readUInt32LE(8)).toBe(raw.length);
  const json = JSON.parse(raw.toString("utf8", 20, 20 + raw.readUInt32LE(12))),
    node = json.nodes.find(
      (n: { name?: string }) =>
        n.name === "macroscopic-temperature-cup-cutaway",
    );
  expect(node.extras.temperatureC).toBe(28);
  expect(json.meshes.length).toBeGreaterThan(20);
  expect(
    json.nodes.some(
      (n: { extras?: { immersed?: boolean } }) => n.extras?.immersed === true,
    ),
  ).toBe(true);
  const binary = 20 + raw.readUInt32LE(12) + 8;
  let vertices = 0;
  const coordinates: number[] = [];
  for (const a of json.accessors.filter(
    (a: { type: string }) => a.type === "VEC3",
  )) {
    if (a.componentType !== 5126) continue;
    const view = json.bufferViews[a.bufferView];
    for (let i = 0; i < a.count; i++)
      for (let axis = 0; axis < 3; axis++)
        coordinates.push(
          raw.readFloatLE(
            binary +
              (view.byteOffset ?? 0) +
              (a.byteOffset ?? 0) +
              i * (view.byteStride ?? 12) +
              axis * 4,
          ),
        );
    vertices += a.count;
  }
  expect(coordinates.every(Number.isFinite)).toBe(true);
  expect(coordinates).toHaveLength(vertices * 3);
  expect(vertices).toBeGreaterThan(1000);
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  const style = await page.addStyleTag({
    content: ".mobile-bar,.skip-link{visibility:hidden!important}",
  });
  await page
    .locator(".energy-cup-asset")
    .screenshot({ path: prefix + info.project.name + "-enlarged3d.png" });
  await style.evaluate((n) => n.parentNode?.removeChild(n));
});
test("unavailable WebGL keeps the apparatus explanation and working method choices", async ({
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
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await learn(page, 1);
  await page
    .getByText("Inspect the real 3D cup apparatus", { exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "3D is unavailable." }),
  ).toBeVisible();
  for (const [l, v] of [
    ["Your independent variable", "carbonate-mass"],
    ["Your measured response", "highest-temperature"],
    ["Your measuring instrument", "balance"],
    ["Your controlled conditions", "acid-volume-concentration-start"],
    ["Your measurement sequence", "initial-add-stir-peak-repeat"],
  ])
    await select(page, l, v);
  await check(page, true);
  await capture(page, prefix + info.project.name + "-fallback.png");
});
