import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ionicBondingJourney as journey } from "../src/content/journeys/ionic-bonding";
import type { Question } from "../src/content/types";
import { mkdir } from "node:fs/promises";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function answer(page: Page, q: Question) {
  if (q.drawDotCross) {
    const parts = q.parts!;
    await page
      .getByLabel(parts[0].label, { exact: true })
      .fill(String(parts[0].answer));
    await page
      .getByLabel(parts[1].label, { exact: true })
      .fill(String(parts[1].answer));
    await page
      .getByLabel("Ion charge", { exact: true })
      .selectOption(String(parts[2].answer));
    await page
      .getByLabel("Draw square brackets", { exact: true })
      .setChecked(parts[3].answer === 1);
  } else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(q.answer);
}
async function choose(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) await picker.selectOption(String(n - 1));
  else
    await page.getByRole("button", { name: `Task ${n}`, exact: true }).click();
}
async function audit(page: Page) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
async function capture(page: Page, name: string) {
  await mkdir("test-results/qa/ionic-bonding", { recursive: true });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: name, fullPage: true });
}
const transfer = (
  page: Page,
  donor: string,
  di: number,
  acceptor: string,
  ai: number,
) =>
  page.getByRole("button", {
    name: `Transfer electron from ${donor} ${di} to ${acceptor} ${ai}`,
    exact: true,
  });
test("one sodium electron transfers with accessible touch targets, conservation and correct charged outer diagrams", async ({
  page,
}, info) => {
  await page.goto("/lessons/ionic-bonding");
  const button = transfer(page, "sodium", 1, "chlorine", 1),
    box = await button.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.width).toBeGreaterThanOrEqual(44);
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".ionic-transfer [role=status]")).not.toHaveClass(
    /correct/,
  );
  await button.click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".ionic-transfer [role=status]")).toHaveClass(
    /correct/,
  );
  const ions = page.locator(".ionic-ion-cards .ion-dot-cross");
  await expect(ions.nth(0)).toHaveAttribute("data-charge", "1");
  await expect(ions.nth(0)).toHaveAttribute("data-crosses", "0");
  await expect(ions.nth(0)).toHaveAttribute("data-shells-omitted", "true");
  await expect(page.locator(".ionic-ion-cards > div").first()).toContainText(
    "10 electrons",
  );
  await expect(ions.nth(1)).toHaveAttribute("data-charge", "-1");
  await expect(ions.nth(1)).toHaveAttribute("data-dots", "7");
  await expect(ions.nth(1)).toHaveAttribute("data-crosses", "1");
  await expect(page.locator(".ionic-conservation")).toHaveAttribute(
    "data-total-electrons",
    "28",
  );
  await expect(page.locator(".ionic-conservation")).toHaveAttribute(
    "data-total-charge",
    "0",
  );
  await answer(page, journey.guided[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await audit(page);
  await capture(
    page,
    `test-results/qa/ionic-bonding/ionic-bonding-${info.project.name}-sodium-chloride.png`,
  );
  await page.reload();
  await expect(ions.nth(1)).toHaveAttribute("data-crosses", "1");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(ions.nth(1)).toHaveAttribute("data-crosses", "0");
  await expect(ions.nth(0)).toHaveAttribute("data-charge", "0");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(button).toBeEnabled();
});
test("magnesium chlorides retain the conserved wrong distribution and repair by returning and redistributing an electron", async ({
  page,
}, info) => {
  await page.goto("/lessons/ionic-bonding");
  await page.getByRole("button", { name: "Task 2", exact: true }).click();
  const a = transfer(page, "magnesium", 1, "chlorine", 1),
    b = transfer(page, "magnesium", 1, "chlorine", 2),
    status = page.locator(".ionic-transfer [role=status]");
  await a.click();
  await a.click();
  await expect(b).toBeDisabled();
  await expect(page.locator(".ionic-conservation")).toHaveAttribute(
    "data-total-electrons",
    "46",
  );
  await expect(page.locator(".ionic-conservation")).toHaveAttribute(
    "data-total-charge",
    "0",
  );
  await expect(
    page.locator(".ionic-ion-cards .ion-dot-cross").nth(1),
  ).toHaveAttribute("data-crosses", "2");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).not.toHaveClass(/correct/);
  await expect(status).toContainText("distribution");
  await page.reload();
  await expect(
    page.locator(".ionic-ion-cards .ion-dot-cross").nth(1),
  ).toHaveAttribute("data-crosses", "2");
  await page
    .getByRole("button", {
      name: "Return electron from chlorine 1 to magnesium 1",
      exact: true,
    })
    .click();
  await b.click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).toHaveClass(/correct/);
  const ions = page.locator(".ionic-ion-cards .ion-dot-cross");
  await expect(ions.nth(0)).toHaveAttribute("data-charge", "2");
  for (const i of [1, 2]) {
    await expect(ions.nth(i)).toHaveAttribute("data-charge", "-1");
    await expect(ions.nth(i)).toHaveAttribute("data-dots", "7");
    await expect(ions.nth(i)).toHaveAttribute("data-crosses", "1");
  }
  await answer(page, journey.guided[1]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await audit(page);
  await capture(
    page,
    `test-results/qa/ionic-bonding/ionic-bonding-${info.project.name}-magnesium-chloride.png`,
  );
});
test("oxide examples use two electron gains with one magnesium donor or two sodium donors", async ({
  page,
}, info) => {
  await page.goto("/lessons/ionic-bonding");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  const mg = transfer(page, "magnesium", 1, "oxygen", 1);
  await mg.click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".ionic-transfer [role=status]")).not.toHaveClass(
    /correct/,
  );
  await mg.click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".ionic-transfer [role=status]")).toHaveClass(
    /correct/,
  );
  await expect(
    page.locator(".ionic-ion-cards .ion-dot-cross").nth(1),
  ).toHaveAttribute("data-dots", "6");
  await expect(
    page.locator(".ionic-ion-cards .ion-dot-cross").nth(1),
  ).toHaveAttribute("data-crosses", "2");
  await expect(page.locator(".ionic-conservation")).toHaveAttribute(
    "data-total-electrons",
    "20",
  );
  await answer(page, journey.guided[2]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await audit(page);
  await capture(
    page,
    `test-results/qa/ionic-bonding/ionic-bonding-${info.project.name}-magnesium-oxide.png`,
  );
  await page.getByRole("button", { name: "Task 4", exact: true }).click();
  await transfer(page, "sodium", 1, "oxygen", 1).click();
  await expect(transfer(page, "sodium", 1, "oxygen", 1)).toBeDisabled();
  await transfer(page, "sodium", 2, "oxygen", 1).click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".ionic-transfer [role=status]")).toHaveClass(
    /correct/,
  );
  await expect(page.locator(".ionic-conservation")).toHaveAttribute(
    "data-total-electrons",
    "30",
  );
  await answer(page, journey.guided[3]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await audit(page);
  await capture(
    page,
    `test-results/qa/ionic-bonding/ionic-bonding-${info.project.name}-sodium-oxide.png`,
  );
});
test("all independent practice works while proposed diagrams remain visibly uncorrected and written work is not automatically marked", async ({
  page,
}, info) => {
  await page.goto("/lessons/ionic-bonding");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) await choose(page, i + 1);
    await expect(page.locator(".ionic-transfer")).toHaveCount(0);
    if (i === 2) {
      await page
        .getByRole("radio", {
          name: journey.practice[i].options!.find(
            (o) => o !== journey.practice[i].answer,
          )!,
          exact: true,
        })
        .check();
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Revisit the key idea", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Return to your task →", exact: true })
        .click();
    }
    await answer(page, journey.practice[i]);
    await page
      .getByRole("button", {
        name: journey.practice[i].rubric
          ? "Save and review explanation"
          : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      journey.practice[i].rubric ? "Compare your explanation" : "That’s right",
    );
    if (i === 3) {
      await expect(
        page.locator(".question-panel .ion-dot-cross"),
      ).toHaveAttribute("data-dots", "6");
      await expect(
        page.locator(".question-panel .ion-dot-cross"),
      ).toHaveAttribute("data-crosses", "2");
      await audit(page);
      await capture(
        page,
        `test-results/qa/ionic-bonding/ionic-bonding-${info.project.name}-origin-error.png`,
      );
    }
    if (journey.practice[i].rubric) {
      await audit(page);
      await capture(
        page,
        `test-results/qa/ionic-bonding/ionic-bonding-${info.project.name}-explanation.png`,
      );
      const attempts = await page.evaluate(
        ({ key, id }) =>
          JSON.parse(localStorage.getItem(key)!).work["ionic-bonding"].attempts[
            id
          ],
        { key: STORAGE_KEY, id: journey.practice[i].id },
      );
      expect(attempts.at(-1).correct).toBe(false);
    }
  }
});
test("cold ion diagrams and six-item checks defer all feedback and separate three-item retrieval unlocks only after seven days", async ({
  page,
}) => {
  await page.goto("/lessons/ionic-bonding");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < journey.checkForms[0].length; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    if (i === 2)
      await expect(page.locator(".ion-dot-cross")).toHaveAttribute(
        "data-crosses",
        "1",
      );
    await answer(page, journey.checkForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(
      0,
    );
    if (i === 0) {
      await page.reload();
      await expect(
        page.getByRole("button", { name: "Next question →", exact: true }),
      ).toBeVisible();
    }
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "6 of 6 correct", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.evaluate(
    ({ key, delay }) => {
      const data = JSON.parse(localStorage.getItem(key)!);
      data.work["ionic-bonding"].history[0].submitted =
        Date.now() - delay - 1000;
      data.work["ionic-bonding"].run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  for (let i = 0; i < journey.reviewForms[0].length; i++) {
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
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
});

test("independent drawing preserves wrong origin totals, charge and missing brackets before correction, save and reload", async ({
  page,
}, info) => {
  await page.goto("/lessons/ionic-bonding");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await choose(page, 6);
  const dots = page.getByLabel("Original non-metal electrons (dots)", {
      exact: true,
    }),
    crosses = page.getByLabel("Transferred metal electrons (crosses)", {
      exact: true,
    }),
    charge = page.getByLabel("Ion charge", { exact: true }),
    brackets = page.getByLabel("Draw square brackets", { exact: true }),
    diagram = page.locator(".ion-construction-preview .ion-dot-cross");
  await dots.fill("6");
  await crosses.fill("2");
  await charge.selectOption("1");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(diagram).toHaveAttribute("data-dots", "6");
  await expect(diagram).toHaveAttribute("data-crosses", "2");
  await expect(diagram).toHaveAttribute("data-charge", "1");
  await expect(diagram).toHaveAttribute("data-brackets", "false");
  await expect(page.getByRole("status")).not.toContainText("That’s right");
  await page.reload();
  await expect(dots).toHaveValue("6");
  await expect(crosses).toHaveValue("2");
  await expect(charge).toHaveValue("1");
  await expect(brackets).not.toBeChecked();
  await dots.fill("7");
  await crosses.fill("1");
  await charge.selectOption("-1");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("status")).not.toContainText("That’s right");
  await brackets.check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("That’s right");
  await expect(diagram).toHaveAttribute("data-charge", "-1");
  await expect(diagram).toHaveAttribute("data-brackets", "true");
  await expect(diagram.locator("[data-marker=dot]")).toHaveCount(7);
  await expect(diagram.locator("[data-marker=cross]")).toHaveCount(1);
  await audit(page);
  await capture(
    page,
    `test-results/qa/ionic-bonding/ionic-bonding-${info.project.name}-independent-drawing.png`,
  );
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  const id = journey.practice[5].id,
    raw = '{"dots":7,"crosses":1,"charge":-1,"brackets":1}';
  await page.evaluate(
    ({ key, id, raw }) => {
      const data = JSON.parse(localStorage.getItem(key)!);
      data.work["ionic-bonding"].drafts[id] = raw;
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, id, raw },
  );
  await page.reload();
  await expect(dots).toHaveValue("");
  await expect(crosses).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Check answer", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work["ionic-bonding"].drafts[id],
      { key: STORAGE_KEY, id },
    ),
  ).toBe(raw);
  await answer(page, journey.practice[5]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("That’s right");
});
