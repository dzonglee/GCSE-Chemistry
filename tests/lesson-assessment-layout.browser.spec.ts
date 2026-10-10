import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { lessons } from "../src/content/curriculum";
import { blankPolymerisationDrawing } from "../src/lib/polymerisation-board";
import { blankPolyesterDrawing } from "../src/lib/polyester";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
} from "../src/lib/progress";

for (const lesson of lessons.filter((lesson) => lesson.journey)) {
  test(`${lesson.slug}: lesson checks and active reviews put responses before navigation and preserve recorded work`, async ({
    page,
  }, info) => {
    if (info.project.name === "mobile")
      await page.setViewportSize({ width: 320, height: 720 });
    const journey = lesson.journey!;
    for (const kind of ["check", "review"] as const) {
      const form = (
        kind === "check" ? journey.checkForms : journey.reviewForms
      )[0];
      const index = Math.min(1, form.length - 1),
        q = form[index];
      const raw = q.polymerisationDrawing
        ? JSON.stringify({ ...blankPolymerisationDrawing(), s0: "H" })
        : q.polyesterDrawing
          ? JSON.stringify({ ...blankPolyesterDrawing(), diolC: "1" })
          : q.answer;
      const data = emptyProgress(),
        work = emptyWork();
      data.preferences.tier = "higher";
      data.preferences.course = "separate";
      work.section = kind;
      work.drafts[q.id] = raw;
      work.run = {
        kind,
        ids: form.map((q) => q.id),
        index,
        responses: {},
        started: Date.now(),
      };
      if (kind === "review")
        work.history = [
          {
            kind: "check",
            ids: journey.checkForms[0].map((q) => q.id),
            index: 0,
            responses: Object.fromEntries(
              journey.checkForms[0].map((q) => [
                q.id,
                {
                  answer: "",
                  correct: false,
                  helped: false,
                  fresh: false,
                  at: Date.now() - REVIEW_DELAY - 1500,
                },
              ]),
            ),
            started: Date.now() - REVIEW_DELAY - 2000,
            submitted: Date.now() - REVIEW_DELAY - 1000,
          },
        ];
      data.work[lesson.slug] = work;
      await page.goto(`/lessons/${lesson.slug}`);
      await page.evaluate(
        ({ key, data }) => localStorage.setItem(key, JSON.stringify(data)),
        { key: STORAGE_KEY, data },
      );
      await page.reload();
      const panel = page.locator(".assessment-session .question-panel");
      await expect(panel).toBeVisible();
      await expect(
        panel.getByRole("button", { name: "Record answer", exact: true }),
      ).toBeVisible();
      const nav = page.locator(".assessment-session .question-navigation");
      await expect(nav).toBeVisible();
      expect(
        await page.evaluate(() => {
          const panel = document.querySelector(
            ".assessment-session .question-panel",
          )!;
          const nav = document.querySelector(
            ".assessment-session .question-navigation",
          )!;
          return Boolean(
            panel.compareDocumentPosition(nav) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          );
        }),
      ).toBe(true);
      await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
      await expect(
        page.getByText("That’s right.", { exact: true }),
      ).toHaveCount(0);
      if (kind === "review") {
        const schedule = page.locator("details.review-schedule");
        await expect(schedule).toBeVisible();
        expect(
          await schedule.evaluate((e) => (e as HTMLDetailsElement).open),
        ).toBe(false);
        expect(
          await page.evaluate(() =>
            Boolean(
              document
                .querySelector(".assessment-session")!
                .compareDocumentPosition(
                  document.querySelector("details.review-schedule")!,
                ) & Node.DOCUMENT_POSITION_FOLLOWING,
            ),
          ),
        ).toBe(true);
        await schedule.locator("summary").focus();
        await page.keyboard.press("Enter");
        await expect(
          schedule.getByRole("heading", {
            name: "Retrieve after a gap",
            exact: true,
          }),
        ).toBeVisible();
        await page.keyboard.press("Enter");
        expect(
          await schedule.evaluate((e) => (e as HTMLDetailsElement).open),
        ).toBe(false);
      }
      if (
        kind === "review" &&
        ["formulae-and-mass", "reaction-profiles"].includes(lesson.slug)
      ) {
        await mkdir("test-results/qa/shared-assessment-layout", {
          recursive: true,
        });
        await page.evaluate(async () => {
          await document.fonts.ready;
          (document.activeElement as HTMLElement)?.blur();
          scrollTo(0, 0);
        });
        await page.screenshot({
          path: `test-results/qa/shared-assessment-layout/${info.project.name}-${lesson.slug}-review.png`,
          fullPage: true,
        });
      }
      await panel
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await expect(panel.locator(".recorded-note[role=status]")).toContainText(
        "Answer recorded and locked.",
      );
      await expect(
        panel.getByRole("button", { name: "Record answer", exact: true }),
      ).toHaveCount(0);
      await expect
        .poll(() =>
          page.evaluate(() =>
            sessionStorage.getItem("gcse-chemistry.pending.v1"),
          ),
        )
        .toBeNull();
      await page.reload();
      await expect(panel.locator(".recorded-note[role=status]")).toContainText(
        "Answer recorded and locked.",
      );
      const retained = await page.evaluate(
        ({ key, slug, id }) => {
          const work = JSON.parse(localStorage.getItem(key)!).work[slug];
          return {
            ids: work.run.ids,
            draft: work.drafts[id],
            answer: work.run.responses[id].answer,
            correct: work.run.responses[id].correct,
          };
        },
        { key: STORAGE_KEY, slug: lesson.slug, id: q.id },
      );
      expect({
        ids: retained.ids,
        draft: retained.draft,
        answer: retained.answer,
      }).toEqual({
        ids: form.map((q) => q.id),
        draft: raw,
        answer: raw,
      });
      if (q.rubric) expect(retained.correct).toBe(false);
      if (form.length > 1) {
        await nav.locator("button").nth(0).click();
        await expect(nav.locator("button").nth(0)).toHaveAttribute(
          "aria-current",
          "step",
        );
        await nav.locator("button").nth(index).click();
        await expect(
          panel.locator(".recorded-note[role=status]"),
        ).toContainText("Answer recorded and locked.");
      }
      await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });
}
