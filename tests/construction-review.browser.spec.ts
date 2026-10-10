import { test, expect } from "@playwright/test";
import { captureDocumentRegion } from "./helpers/review-capture";
import AxeBuilder from "@axe-core/playwright";
import { paper2FoundationFull } from "../src/content/paper2-foundation-full";
import { paper2HigherFull } from "../src/content/paper2-higher-full";
import { emptyProgress, emptyWork, STORAGE_KEY } from "../src/lib/progress";
import { emptyFuelDrawing } from "../src/lib/fuel-drawing";
import { blankPolymerisationDrawing } from "../src/lib/polymerisation-board";

// Private candidate: copy into application tests only after the existing browser owner closes.
for (const paper of [paper2FoundationFull, paper2HigherFull])
  for (const width of [320, 390, 1280])
    test(`${paper.id} ${width}: retained wrong constructions are read-only and exact through review/reload`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 720 });
      await page.goto(`/exams/${paper.id}`);
      const p = emptyProgress(),
        w = emptyWork(),
        started = Date.now() - 10000;
      const rawById: Record<string, string> = {};
      for (const part of paper.parts) {
        const q = part.question;
        if (q.fuelDrawing) {
          const board = emptyFuelDrawing(q.fuelDrawing.data);
          q.fuelDrawing.data.points.forEach(([x, y], i) => {
            board["p" + i + "x"] = String(x);
            board["p" + i + "y"] = String(y);
            board["c" + i] = String(y + 1);
          });
          board.p0x = "wrong";
          board.p1y = "999";
          board.c0 = "";
          board.estimate = "99";
          rawById[q.id] = JSON.stringify(board, null, 2);
        }
        if (q.polymerisationDrawing)
          rawById[q.id] = JSON.stringify(
            {
              ...blankPolymerisationDrawing(),
              s0: "Cl",
              s1: "H",
              s2: "F",
              s3: "H",
              bond: "2",
              left: "1",
              right: "0",
              brackets: "1",
              countMark: "inside",
            },
            null,
            2,
          );
      }
      w.run = {
        kind: "paper",
        ids: paper.parts.map((part) => part.question.id),
        index: paper.parts.length - 1,
        started,
        submitted: started + 5000,
        responses: Object.fromEntries(
          paper.parts.map((part) => [
            part.question.id,
            {
              answer: rawById[part.question.id] ?? "",
              correct: false,
              helped: false,
              fresh: true,
              at: started + 1000,
            },
          ]),
        ),
      };
      p.work[`assessment-${paper.id}`] = w;
      await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
        key: STORAGE_KEY,
        raw: JSON.stringify(p),
      });
      await page.reload();
      for (const [i, part] of paper.parts.entries()) {
        if (!rawById[part.question.id]) continue;
        const row = page.locator(".results-list > details").nth(i);
        await row.locator(":scope > summary").click();
        const retained = row.getByRole("region", {
          name: `Retained ${part.number} response: ${part.question.fuelDrawing ? "graph" : "polymer"} construction`,
          exact: true,
        });
        await expect(retained.locator("input,select,button")).toHaveCount(0);
        await retained
          .getByText("Original saved response", { exact: true })
          .click();
        expect(await retained.locator("pre").textContent()).toBe(
          rawById[part.question.id],
        );
        if (part.question.fuelDrawing) {
          await expect(retained.locator("[data-fit]")).toHaveCount(0);
          await expect(retained).toContainText("x: wrong");
          await expect(retained).toContainText("Retained outside");
          await expect(retained.locator(".graph-axis-caption")).toContainText(
            part.question.fuelDrawing.data.xName,
          );
          await expect(retained.locator(".graph-axis-caption")).toContainText(
            part.question.fuelDrawing.data.yName,
          );
        } else {
          await expect(retained).toContainText("Double C=C");
          await expect(retained).toContainText("n inside brackets");
        }
        await row.locator(".paper-reference > summary").click();
        await expect(
          row.locator(
            ".paper-worked-construction input,.paper-worked-construction select,.paper-worked-construction button",
          ),
        ).toHaveCount(0);
        await expect(
          row.locator(".paper-worked-construction svg").first(),
        ).toBeVisible();
        await expect(
          row.locator(".paper-mark-decision select").first(),
        ).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        );
        await page.evaluate(() =>
          (document.activeElement as HTMLElement)?.blur(),
        );
        await retained.scrollIntoViewIfNeeded();
        await captureDocumentRegion(
          page,
          retained,
          `test-results/qa/construction-detail-${info.project.name}-${width}-${paper.id}-${part.number.replace(/[^a-z0-9]/gi, "")}-retained.png`,
        );
        await captureDocumentRegion(
          page,
          row.locator(".paper-worked-construction"),
          `test-results/qa/construction-detail-${info.project.name}-${width}-${paper.id}-${part.number.replace(/[^a-z0-9]/gi, "")}-reference.png`,
        );
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({
          path: `test-results/qa/construction-review-${info.project.name}-${width}-${paper.id}-${part.number.replace(/[^a-z0-9]/gi, "")}.png`,
          fullPage: true,
          scale: "css",
        });
        await row.locator(":scope > summary").click();
      }
      await page.reload();
      const stored = await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!),
        STORAGE_KEY,
      );
      for (const [id, raw] of Object.entries(rawById))
        expect(
          stored.work[`assessment-${paper.id}`].run.responses[id].answer,
        ).toBe(raw);
    });

for (const width of [320, 390])
  test(`invalid construction raw remains exact and wraps when opened at ${width}`, async ({
    page,
  }) => {
    const paper = paper2HigherFull,
      p = emptyProgress(),
      w = emptyWork(),
      started = Date.now() - 10000,
      raw = "unreadable-original-" + "x".repeat(1400);
    w.run = {
      kind: "paper",
      ids: paper.parts.map((part) => part.question.id),
      index: paper.parts.length - 1,
      started,
      submitted: started + 5000,
      responses: Object.fromEntries(
        paper.parts.map((part) => [
          part.question.id,
          {
            answer:
              part.question.fuelDrawing || part.question.polymerisationDrawing
                ? raw
                : "",
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
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
      key: STORAGE_KEY,
      value: JSON.stringify(p),
    });
    await page.reload();
    for (const [i, part] of paper.parts.entries()) {
      if (!part.question.fuelDrawing && !part.question.polymerisationDrawing)
        continue;
      const row = page.locator(".results-list > details").nth(i);
      await row.locator(":scope > summary").click();
      const retained = row.getByRole("region", {
        name: `Retained ${part.number} response: ${part.question.fuelDrawing ? "graph" : "polymer"} construction`,
        exact: true,
      });
      await expect(retained.locator("input,select,button,svg")).toHaveCount(0);
      await expect(retained.getByRole("status")).toContainText("retained");
      await retained
        .getByText("Original saved response", { exact: true })
        .click();
      expect(await retained.locator("pre").textContent()).toBe(raw);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await row.locator(":scope > summary").click();
    }
    await page.reload();
    const stored = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      STORAGE_KEY,
    );
    for (const part of paper.parts)
      if (part.question.fuelDrawing || part.question.polymerisationDrawing)
        expect(
          stored.work[`assessment-${paper.id}`].run.responses[part.question.id]
            .answer,
        ).toBe(raw);
  });
