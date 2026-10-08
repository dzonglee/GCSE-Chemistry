import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ratesJourney as journey } from "../src/content/journeys/reaction-rates";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import {
  ratesRecords,
  ratesOptions,
  initialRatesBoard,
} from "../src/lib/rate-measurement";
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".rates-workbench .feedback[role=status]"),
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
async function construct(
  page: Page,
  data: import("../src/lib/rate-measurement").RateData,
  curve: readonly number[] = data.values,
) {
  for (let i = 0; i < 7; i++) {
    await page
      .getByLabel("Graph marker to edit", { exact: true })
      .selectOption(String(i));
    await page
      .getByLabel("Graph element to edit", { exact: true })
      .selectOption("point");
    await page
      .getByLabel(`Your plotted observation ${i + 1} time / s`, { exact: true })
      .fill(String(data.times[i]));
    await page
      .getByLabel(`Your plotted observation ${i + 1} quantity / ${data.unit}`, {
        exact: true,
      })
      .fill(String(data.values[i]));
  }
  await page
    .getByLabel("Graph element to edit", { exact: true })
    .selectOption("curve");
  for (let i = 0; i < 7; i++) {
    await page
      .getByLabel("Graph marker to edit", { exact: true })
      .selectOption(String(i));
    await page
      .getByLabel(
        `Your curve knot at ${data.times[i]} s quantity / ${data.unit}`,
        { exact: true },
      )
      .fill(String(curve[i]));
  }
}
async function answer(page: Page, q: (typeof journey.practice)[number]) {
  if (q.rateDrawing) {
    if (q.rateDrawing.kind === "plot-fit")
      await construct(
        page,
        q.rateDrawing.data,
        q.id === "rr-v1-p-draw-fit"
          ? ratesRecords.plot.initial.curve
          : q.rateDrawing.data.values,
      );
    else {
      for (const [i, t, amount] of [
        [0, 10, 22.3],
        [1, 30, 45.7],
      ]) {
        await page
          .getByLabel("Graph marker to edit", { exact: true })
          .selectOption(String(i));
        await page
          .getByLabel(`Your tangent endpoint ${i + 1} time / s`, {
            exact: true,
          })
          .fill(String(t));
        await page
          .getByLabel(`Your tangent endpoint ${i + 1} quantity / cm³`, {
            exact: true,
          })
          .fill(String(amount));
      }
    }
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

const route = "/lessons/measuring-rates";
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/measuring-rates");
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
          "docs/qa/measuring-rates-" +
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
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work["measuring-rates"]
                  .run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(false); // The opening interval model conservatively exposes the shared interval procedure.
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
      for (const run of p.work["measuring-rates"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["measuring-rates"].run.submitted = Date.now() - delay - 1000;
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

test("all original practice works while written and drawn responses remain self-reviewed", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    await task(page, i + 1);
    const q = journey.practice[i];
    await answer(page, q);
    if (q.rateDrawing?.kind === "tangent")
      await capture(
        page,
        `docs/qa/measuring-rates-${info.project.name}-tangent-construction.png`,
      );
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
                "measuring-rates"
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
const labels: Record<string, string> = {
  seconds: "Your elapsed time / s",
  kind: "Your measured quantity interpretation",
  operation: "Your calculation operation",
  unit: "Your rate unit",
  cause: "Your explanation of the balance change",
  closure: "Your identified apparatus boundary",
  claim: "Your supported measurement claim",
  reason: "Your measurement reason",
  rateTrend: "Your rate trend",
  direction: "Your recorded signal direction",
  fastest: "Your fastest stated interval",
  endClaim: "Your supported final-state claim",
  rateView: "Your way to represent rate at a moment",
  aRate: "Your A interval mean / cm³/s",
  bRate: "Your B interval mean / cm³/s",
  faster: "Your faster interval comparison",
  yield: "Your final-product comparison",
  basis: "Your comparison basis",
};
for (const [mode, n] of [
  ["interval", 1],
  ["mass", 2],
  ["plot", 3],
  ["trend", 4],
  ["compare", 5],
  ["evidence", 6],
] as const)
  test(`${mode}: every supplied record preserves wrong predictions and reaches its own correct construction`, async ({
    page,
  }, info) => {
    await learn(page, n);
    for (const key of Object.keys(ratesRecords[mode])) {
      if (key !== "initial") {
        await page
          .getByText("Choose another supplied case", { exact: true })
          .click();
        await page
          .getByLabel("Supplied rate measurement", { exact: true })
          .selectOption(key);
        await page
          .getByText("Choose another supplied case", { exact: true })
          .click();
      }
      await check(page, false);
      const b = initialRatesBoard(mode, key),
        r = (
          ratesRecords[mode] as unknown as Record<
            string,
            Record<string, unknown>
          >
        )[key];
      if (mode === "plot") {
        const p = ratesRecords.plot[key as keyof typeof ratesRecords.plot];
        await construct(page, p.data, p.curve);
        await page
          .getByLabel(labels.reason, { exact: true })
          .selectOption(p.reason);
      } else {
        for (const field of Object.keys(b)) {
          if (field === "record") continue;
          const value = String(r[field]),
            unit = r.unit === "g/s" ? "g" : "cm³",
            label =
              field === "quantity"
                ? "Your quantity changed / " + (mode === "mass" ? "g" : unit)
                : field === "rate"
                  ? mode === "mass"
                    ? "Your observed balance-loss rate / g/s"
                    : "Your predicted mean rate / " + r.unit
                  : labels[field];
          if (ratesOptions[mode][field])
            await page.getByLabel(label, { exact: true }).selectOption(value);
          else await page.getByLabel(label, { exact: true }).fill(value);
        }
      }
      await check(page, true);
      if (key === "initial")
        await capture(
          page,
          `docs/qa/measuring-rates-${info.project.name}-${mode}.png`,
        );
    }
  });
test("wrong interval time survives reload, undo and reset; an invalid fraction remains visible and blocks checking", async ({
  page,
}) => {
  await learn(page, 1);
  const time = page.getByLabel(labels.seconds, { exact: true });
  await time.fill("30");
  await saved(page);
  await page.reload();
  await expect(time).toHaveValue("30");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(time).toHaveValue("0");
  await time.fill("1/2");
  await expect(time).toHaveValue("1/2");
  await expect(
    page.getByRole("button", { name: "Check model", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(time).toHaveValue("0");
  await saved(page);
  await page.reload();
  await expect(time).toHaveValue("0");
});
test("actual graph markers support keyboard and pointer coordinates, retain invalid entries and do not overwrite the observed anomaly", async ({
  page,
}) => {
  await learn(page, 3);
  await page
    .getByLabel("Graph marker to edit", { exact: true })
    .selectOption("3");
  const graph = page.getByRole("group", {
    name: "Place your selected graph marker",
    exact: true,
  });
  await graph.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowUp");
  await expect(
    page.getByLabel("Your plotted observation 4 time / s", { exact: true }),
  ).toHaveValue("1");
  await expect(
    page.getByLabel("Your plotted observation 4 quantity / g", { exact: true }),
  ).toHaveValue("0.1");
  const box = await graph.boundingBox();
  if (!box) throw Error("missing graph");
  await graph.click({ position: { x: box.width * 0.53, y: box.height * 0.4 } });
  await saved(page);
  await page.reload();
  await page
    .getByLabel("Graph marker to edit", { exact: true })
    .selectOption("3");
  await expect(
    page.getByLabel("Your plotted observation 4 time / s", { exact: true }),
  ).toHaveValue("60");
  await page
    .getByLabel("Your plotted observation 4 quantity / g", { exact: true })
    .fill("2.9");
  await page
    .getByLabel("Graph element to edit", { exact: true })
    .selectOption("curve");
  await page
    .getByLabel("Your curve knot at 60 s quantity / g", { exact: true })
    .fill("3.25");
  await page
    .getByLabel("Graph element to edit", { exact: true })
    .selectOption("point");
  await expect(
    page.getByLabel("Your plotted observation 4 quantity / g", { exact: true }),
  ).toHaveValue("2.9");
  await page
    .getByLabel("Your plotted observation 4 quantity / g", { exact: true })
    .fill("1/2");
  await page
    .getByLabel("Graph marker to edit", { exact: true })
    .selectOption("4");
  await expect(
    page.getByRole("button", { name: "Check model", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel("Graph marker to edit", { exact: true })
    .selectOption("3");
  await expect(
    page.getByLabel("Your plotted observation 4 quantity / g", { exact: true }),
  ).toHaveValue("1/2");
  await saved(page);
  await page.reload();
  await page
    .getByLabel("Graph marker to edit", { exact: true })
    .selectOption("3");
  await expect(
    page.getByLabel("Your plotted observation 4 quantity / g", { exact: true }),
  ).toHaveValue("1/2");
  await expect(
    page.getByRole("button", { name: "Check model", exact: true }),
  ).toBeDisabled();
});
test("opening includes a complete 44px input within the unchanged mobile viewport", async ({
  page,
}, info) => {
  await learn(page, 1);
  const box = await page
    .getByLabel("Your quantity changed / cm³", { exact: true })
    .boundingBox();
  if (!box) throw Error("missing opening control");
  expect(box.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box.y + box.height).toBeLessThanOrEqual(664);
  await capture(
    page,
    `docs/qa/measuring-rates-${info.project.name}-opening.png`,
  );
});
test("actual open and closed apparatus exports supplied readings and supports keyboard rotation", async ({
  page,
}, info) => {
  await learn(page, 2);
  await page
    .getByText("Inspect the supplied mass-loss apparatus in actual 3D", {
      exact: true,
    })
    .click();
  await page
    .getByLabel("Supplied balance phase", { exact: true })
    .selectOption("end");
  const asset = page.locator(".rate-flask-asset"),
    rotation = page.getByRole("group", {
      name: "Rotate rate-measurement flask",
      exact: true,
    });
  await expect(asset.locator("canvas")).toBeVisible();
  await rotation.focus();
  await page.keyboard.press("ArrowRight");
  await expect(rotation).toHaveAttribute("data-rotation", "0.1");
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  for (const [key, value] of [
    ["initial", "178.4"],
    ["sealed", "182.4"],
  ]) {
    if (key === "sealed") {
      await page
        .getByText("Choose another supplied case", { exact: true })
        .click();
      await page
        .getByLabel("Supplied rate measurement", { exact: true })
        .selectOption("sealed");
      await page
        .getByText("Choose another supplied case", { exact: true })
        .click();
      await page
        .getByLabel("Supplied balance phase", { exact: true })
        .selectOption("end");
    }
    await expect(asset).toContainText(value + " g");
    await expect(
      page.getByRole("button", {
        name: "Download actual 3D apparatus",
        exact: true,
      }),
    ).toBeEnabled();
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", {
        name: "Download actual 3D apparatus",
        exact: true,
      })
      .click();
    await (
      await download
    ).saveAs(`docs/qa/measuring-rates-${info.project.name}-${key}-flask.glb`);
    await capture(
      page,
      `docs/qa/measuring-rates-${info.project.name}-${key}-flask.png`,
    );
    const style = await page.addStyleTag({
      content: ".mobile-bar,.skip-link{display:none!important}",
    });
    await asset.screenshot({
      path: `docs/qa/measuring-rates-${info.project.name}-${key}-enlarged3d.png`,
    });
    await style.evaluate((el) => el.parentNode?.removeChild(el));
  }
});
test("independent drawn coordinates survive reload and remain self-reviewed with deferred whole-set feedback", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 4; i++)
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
  const q = journey.checkForms[0][4];
  await answer(page, q);
  await saved(page);
  await page.reload();
  await page
    .getByLabel("Graph marker to edit", { exact: true })
    .selectOption("4");
  await page
    .getByLabel("Graph element to edit", { exact: true })
    .selectOption("point");
  await expect(
    page.getByLabel("Your plotted observation 5 quantity / cm³", {
      exact: true,
    }),
  ).toHaveValue("46");
  await page
    .getByLabel("Your plotted observation 5 quantity / cm³", { exact: true })
    .fill("1/2");
  await saved(page);
  await page.reload();
  await page
    .getByLabel("Graph marker to edit", { exact: true })
    .selectOption("4");
  await expect(
    page.getByLabel("Your plotted observation 5 quantity / cm³", {
      exact: true,
    }),
  ).toHaveValue("1/2");
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Your invalid coordinate is retained." }),
  ).toBeVisible();
  await page
    .getByLabel("Your plotted observation 5 quantity / cm³", { exact: true })
    .fill("46");
  await page
    .getByRole("button", { name: "Clear your construction", exact: true })
    .click();
  await expect(
    page.getByLabel("Your plotted observation 5 quantity / cm³", {
      exact: true,
    }),
  ).toHaveValue("0");
  await answer(page, q);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await capture(
    page,
    `docs/qa/measuring-rates-${info.project.name}-independent-drawing.png`,
  );
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(0);
  await expect(
    page.getByLabel("Graph marker to edit", { exact: true }),
  ).toBeDisabled();
});
test("WebGL failure preserves supplied balance data and working numeric predictions", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (kind.includes("webgl")) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await learn(page, 2);
  await page
    .getByText("Inspect the supplied mass-loss apparatus in actual 3D", {
      exact: true,
    })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".rate-flask-asset")).toContainText("182.4 g");
  await page.getByLabel("Your quantity changed / g", { exact: true }).fill("4");
  await expect(
    page.getByLabel("Your quantity changed / g", { exact: true }),
  ).toHaveValue("4");
});
test("a retained wrong late-interval denominator returns from targeted recovery with its exact draft", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 2);
  await page.getByLabel("Your answer", { exact: true }).fill("1.25");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: journey.refresher.find((q) => q.id === "rr-v1-r-time")!.title,
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "1.25",
  );
});
