import { test, expect } from "@playwright/test";
import { ratesJourney as journey } from "../src/content/journeys/reaction-rates";

test("requested two decimal places reject extra digits and retain the raw practice answer", async ({
  page,
}) => {
  await page.goto("/lessons/measuring-rates");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const n = journey.practice.findIndex((q) => q.id === "rr-v1-p-minutes") + 1;
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
  const input = page.getByLabel("Your answer", { exact: true });
  const feedback = page.locator(".sample-task-answer .feedback[role=status]");
  await input.fill("0.070");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(feedback).toContainText("Your numerical value is right");
  await expect(feedback).toContainText("2 decimal places");
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.reload();
  await expect(input).toHaveValue("0.070");
  await input.fill("0.07");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(feedback).toContainText("That’s right");
});

test("reserved three-decimal answer survives reload and is only marked after submitting the whole set", async ({
  page,
}) => {
  await page.goto("/lessons/measuring-rates");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (const [i, q] of journey.checkForms[0].entries()) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    if (q.rateDrawing?.kind === "plot-fit") {
      const data = q.rateDrawing.data;
      for (let j = 0; j < data.times.length; j++) {
        await page
          .getByLabel("Graph marker to edit", { exact: true })
          .selectOption(String(j));
        await page
          .getByLabel("Graph element to edit", { exact: true })
          .selectOption("point");
        await page
          .getByLabel(`Your plotted observation ${j + 1} time / s`, {
            exact: true,
          })
          .fill(String(data.times[j]));
        await page
          .getByLabel(
            `Your plotted observation ${j + 1} quantity / ${data.unit}`,
            { exact: true },
          )
          .fill(String(data.values[j]));
        await page
          .getByLabel("Graph element to edit", { exact: true })
          .selectOption("curve");
        await page
          .getByLabel(
            `Your curve knot at ${data.times[j]} s quantity / ${data.unit}`,
            { exact: true },
          )
          .fill(String(data.values[j]));
      }
    } else if (q.options)
      await page.getByRole("radio", { name: q.answer, exact: true }).check();
    else
      await page
        .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
          exact: true,
        })
        .fill(q.id === "rr-v1-A-round" ? "0.0380" : q.answer);
    if (q.id === "rr-v1-A-round") {
      await expect
        .poll(() =>
          page.evaluate(() =>
            sessionStorage.getItem("gcse-chemistry.pending.v1"),
          ),
        )
        .toBeNull();
      await page.reload();
      await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
        "0.0380",
      );
    }
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(
      page.getByText("Your numerical value is right", { exact: false }),
    ).toHaveCount(0);
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "3 of 4 correct", exact: true }),
  ).toBeVisible();
  const result = page.locator(".result-row").nth(1);
  await result.locator("summary").click();
  await expect(result).toContainText("Your answer: 0.0380");
  await expect(result).toContainText("Expected: 0.038");
  await expect(result).toContainText("rounded 0.038 g/s");
});
