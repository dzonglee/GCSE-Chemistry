import { test, expect, type Page } from "@playwright/test";
import { paper1HigherFull } from "../src/content/paper1-higher-full";
import { paper2HigherFull } from "../src/content/paper2-higher-full";
import { emptyProgress, emptyWork, STORAGE_KEY } from "../src/lib/progress";
import {
  captureReadableCaption,
  captureDocumentRegion,
} from "./helpers/review-capture";
import { emptyFuelDrawing } from "../src/lib/fuel-drawing";

// Private proposal only. Imports are relative to eventual application tests directory.
async function retainedRaw(page: Page, paperId: string, questionId: string) {
  return page.evaluate(
    ({ key, workId, questionId }) =>
      JSON.parse(localStorage.getItem(key)!).work[workId].run.responses[
        questionId
      ].answer,
    { key: STORAGE_KEY, workId: `assessment-${paperId}`, questionId },
  );
}

for (const paper of [paper1HigherFull, paper2HigherFull])
  for (const width of [320, 390])
    test(`${paper.id} ${width}: complete wrong fit and separate estimate remain exact and read-only`, async ({
      page,
    }, info) => {
      test.setTimeout(120000);
      const index = paper.parts.findIndex(
        ({ question }) => !!question.fuelDrawing,
      );
      const part = paper.parts[index],
        q = part.question,
        data = q.fuelDrawing!.data;
      const board = emptyFuelDrawing(data);
      data.points.forEach(([x, y], i) => {
        board[`p${i}x`] = String(x);
        board[`p${i}y`] = String(y);
        // Deliberately proposed fit differs from the original observations.
        board[`c${i}`] = String(y + 0.5);
      });
      board.estimate = String(data.yMin + 0.25);
      if (data.independentExtrapolation) {
        expect(data.targetX).toBeLessThan(data.points[0][0]);
        board.extensionX = String(data.targetX);
      }
      const raw = JSON.stringify(board, null, 2),
        p = emptyProgress(),
        w = emptyWork();
      const started = Date.now() - 10000;
      w.run = {
        kind: "paper",
        ids: paper.parts.map(({ question }) => question.id),
        index,
        started,
        submitted: started + 5000,
        responses: Object.fromEntries(
          paper.parts.map(({ question }) => [
            question.id,
            {
              answer: question.id === q.id ? raw : "",
              correct: false,
              helped: false,
              fresh: true,
              at: started + 1000,
            },
          ]),
        ),
      };
      p.work[`assessment-${paper.id}`] = w;
      await page.setViewportSize({ width, height: 720 });
      await page.goto(`/exams/${paper.id}`);
      await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
        key: STORAGE_KEY,
        raw: JSON.stringify(p),
      });
      await page.reload();
      const row = page.locator(".results-list > details").nth(index);
      await row.locator(":scope > summary").click();
      const retained = row.getByRole("region", {
        name: `Retained ${part.number} response: graph construction`,
        exact: true,
      });
      await expect(retained.locator("input,select,button")).toHaveCount(0);
      await expect(retained.locator("[data-fit]")).toHaveCount(1);
      if (data.independentExtrapolation)
        await expect(retained.locator("[data-fit-extrapolation]")).toHaveCount(
          1,
        );
      await expect(retained).toContainText(
        `Separate estimate at x=${data.targetX}`,
      );
      await expect(retained).toContainText(board.estimate);
      if (data.independentExtrapolation) {
        await expect(retained).toContainText("Extension endpoint x");
        await expect(retained).toContainText(board.extensionX);
      }
      const caption = retained.locator(".graph-axis-caption");
      await caption.scrollIntoViewIfNeeded();
      await expect(caption).toBeVisible();
      for (const value of [
        data.xName,
        data.yName,
        data.xUnit,
        data.yUnit,
      ].filter(Boolean))
        await expect(caption).toContainText(value);
      const box = (await caption.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      await captureDocumentRegion(
        page,
        retained.locator(".fuel-plot-editor"),
        `test-results/qa/construction-supplement-${info.project.name}-${width}-${paper.id}-retained-region.png`,
      );
      await captureReadableCaption(
        page,
        caption,
        `test-results/qa/construction-supplement-${info.project.name}-${width}-${paper.id}-retained-viewport.png`,
      );
      const plot = retained.locator(".fuel-plot-scroll");
      expect(await plot.evaluate((e) => e.scrollLeft)).toBe(0);
      await plot.focus();
      await plot.press("ArrowRight");
      await plot.press("ArrowUp");
      await retained
        .locator("svg")
        .click({ position: { x: 140, y: 100 }, force: true });
      expect(await retainedRaw(page, paper.id, q.id)).toBe(raw);
      await retained
        .getByText("Original saved response", { exact: true })
        .click();
      expect(await retained.locator("pre").textContent()).toBe(raw);
      await row.locator(".paper-reference > summary").click();
      await expect(
        row.locator(".paper-mark-decision select").first(),
      ).toBeVisible();
      // H1 has a temperature reference disclosure; H2 has a worked construction.
      const referenceDetails = row.locator(".temperature-graph-reference");
      if (await referenceDetails.count())
        await referenceDetails.locator(":scope > summary").click();
      const referenceCaptions = row.locator(
        ".paper-reference .graph-axis-caption",
      );
      expect(await referenceCaptions.count()).toBeGreaterThan(0);
      for (const reference of await referenceCaptions.all()) {
        await reference.scrollIntoViewIfNeeded();
        await expect(reference).toBeVisible();
        for (const value of [
          data.xName,
          data.yName,
          data.xUnit,
          data.yUnit,
        ].filter(Boolean))
          await expect(reference).toContainText(value);
        const bounds = (await reference.boundingBox())!;
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      }
      const referenceRegion = (await referenceDetails.count())
        ? referenceDetails
        : row.locator(".paper-worked-construction");
      await captureDocumentRegion(
        page,
        referenceRegion,
        `test-results/qa/construction-supplement-${info.project.name}-${width}-${paper.id}-reference-region.png`,
      );
      await captureReadableCaption(
        page,
        referenceCaptions.first(),
        `test-results/qa/construction-supplement-${info.project.name}-${width}-${paper.id}-reference-viewport.png`,
      );
      expect(await retainedRaw(page, paper.id, q.id)).toBe(raw);
      await page.reload();
      expect(await retainedRaw(page, paper.id, q.id)).toBe(raw);
    });

test("live complete graph construction still exposes editing controls and keeps references sealed", async ({
  page,
}) => {
  const paper = paper2HigherFull;
  const index = paper.parts.findIndex(({ question }) => !!question.fuelDrawing);
  const p = emptyProgress(),
    w = emptyWork();
  w.run = {
    kind: "paper",
    ids: paper.parts.map(({ question }) => question.id),
    index,
    started: Date.now(),
    responses: {},
  };
  p.work[`assessment-${paper.id}`] = w;
  await page.goto(`/exams/${paper.id}`);
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(p),
  });
  await page.reload();
  const live = page.locator(".fuel-drawing-input");
  expect(await live.locator("input,select,button").count()).toBeGreaterThan(0);
  await expect(
    live.getByRole("button", { name: "Clear this fuel plot", exact: true }),
  ).toBeEnabled();
  await expect(
    page.locator(".paper-reference,.paper-worked-construction,.results-list"),
  ).toHaveCount(0);
});
