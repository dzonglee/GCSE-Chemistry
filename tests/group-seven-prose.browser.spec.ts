import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { groupSevenJourney as journey } from "../src/content/journeys/group-seven";
import { emptyProgress, emptyWork, STORAGE_KEY } from "../src/lib/progress";

for (const scenario of [
  {
    id: "gain",
    task: "g7-v1-r-gain",
    raw: "It gains one electron to form1−",
    label: "It gains one electron to form 1−",
    correct: true,
    feedback: "That’s right",
  },
  {
    id: "species",
    task: "g7-v1-r-species",
    raw: "The2 means two negative charges",
    label: "The 2 means two negative charges",
    correct: false,
    feedback: "A subscript counts atoms; a superscript shows charge.",
  },
])
  test(`historical ${scenario.id} choice remains selected and raw with its original scientific feedback after editorial correction and reload`, async ({
    page,
  }, info) => {
    if (info.project.name === "mobile")
      await page.setViewportSize({ width: 320, height: 720 });
    const q = journey.refresher.find((q) => q.id === scenario.task)!;
    const raw = scenario.raw;
    const original = {
      answer: raw,
      correct: scenario.correct,
      helped: true,
      fresh: false,
      at: Date.now() - 1000,
    };
    const data = emptyProgress();
    data.work["group-seven"] = {
      ...emptyWork(),
      learning: {
        version: 1,
        stage: "refresher",
        index: journey.refresher.indexOf(q),
      },
      drafts: { [q.id]: raw },
      attempts: { [q.id]: [original] },
    };
    await page.addInitScript(
      ({ key, data }) => {
        if (!localStorage.getItem(key))
          localStorage.setItem(key, JSON.stringify(data));
      },
      { key: STORAGE_KEY, data },
    );
    await page.goto("/lessons/group-seven");
    const selected = page.getByRole("radio", {
      name: scenario.label,
      exact: true,
    });
    await expect(selected).toBeChecked();
    await expect(
      page.locator(".sample-task-answer [role=status]"),
    ).toContainText(scenario.feedback);
    await page.reload();
    await expect(selected).toBeChecked();
    await expect(
      page.locator(".sample-task-answer [role=status]"),
    ).toContainText(scenario.feedback);
    const saved = await page.evaluate(
      ({ key, id }) => {
        const work = JSON.parse(localStorage.getItem(key)!).work["group-seven"];
        return { draft: work.drafts[id], attempts: work.attempts[id] };
      },
      { key: STORAGE_KEY, id: q.id },
    );
    expect(saved).toEqual({ draft: raw, attempts: [original] });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await mkdir("test-results/qa/group-seven-prose", { recursive: true });
    await page.evaluate(async () => {
      await document.fonts.ready;
      (document.activeElement as HTMLElement)?.blur();
      scrollTo(0, 0);
    });
    await page.screenshot({
      path: `test-results/qa/group-seven-prose/${info.project.name}-legacy-${scenario.id}.png`,
      fullPage: true,
    });
  });
