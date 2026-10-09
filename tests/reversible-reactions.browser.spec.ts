import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { reversibleJourney as journey } from "../src/content/journeys/reversible-reactions";
import type { ReversibleMode } from "../src/lib/reversible-equilibrium";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/reversible-reactions";
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
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
  if (q.rubric)
    await page.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
async function learn(page: Page, n: number) {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, n);
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".reversible-workbench .feedback[role=status]"),
  ).toHaveClass(correct ? /correct/ : /retry/);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/reversible-reactions");
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
      if (form === 0 && i === 1) {
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
          "docs/qa/reversible-reactions-" +
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
                JSON.parse(localStorage.getItem(key)!).work[
                  "reversible-reactions"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(form === 1); // Opening continuing-turnover evidence exposes A1; B1 uses unexposed reaction-side interpretation.
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
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work["reversible-reactions"]
            .section,
        STORAGE_KEY,
      ),
    )
    .toBe("review");
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      for (const run of p.work["reversible-reactions"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["reversible-reactions"].run.submitted = Date.now() - delay - 1000;
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

test("all original practice works while written responses remain self-reviewed", async ({
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
                "reversible-reactions"
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
import {
  directionRecords,
  reversibleEnergies,
  turnoverRecords,
  reversibleRates,
  boundaryRecords,
  equilibriumEvidence,
} from "../src/lib/reversible-equilibrium";
import { reversibleRecords } from "../src/lib/reversible-board";
type FieldAnswer = { label: string; value: string; numeric?: boolean };
function answers(mode: ReversibleMode, id: string): FieldAnswer[] {
  const num = (label: string, n: number) => ({
      label,
      value: String(n),
      numeric: true,
    }),
    pick = (label: string, value: string) => ({ label, value });
  if (mode === "direction") {
    const r = directionRecords[id],
      f = r.target === "forward";
    return [
      pick("Direction to inspect", r.target),
      pick("Your starting substances", f ? "left" : "right"),
      pick("Your formed substances", f ? "right" : "left"),
      pick("Your applicable supplied condition", r.target),
    ];
  }
  if (mode === "energy") {
    const r = reversibleEnergies[id],
      delta =
        ((r.right - r.left) * (r.reverse ? -1 : 1) * r.targetAmount) / r.amount;
    return [
      pick("Energy direction to inspect", r.reverse ? "reverse" : "forward"),
      num("Your signed target energy change / kJ", delta),
      num("Your magnitude transferred / kJ", Math.abs(delta)),
      pick(
        "Your direction of energy transfer",
        delta < 0 ? "toSurroundings" : "fromSurroundings",
      ),
    ];
  }
  if (mode === "turnover") {
    const r = turnoverRecords[id];
    return [
      num("Your current A token count", r.a - r.forward + r.reverse),
      num("Your current B token count", r.b + r.forward - r.reverse),
      num("Your cumulative forward events", r.forward),
      num("Your cumulative reverse events", r.reverse),
      pick(
        "Your dynamic-equilibrium conclusion",
        r.forward === r.reverse && r.forward > 0
          ? "equilibrium"
          : "notEquilibrium",
      ),
    ];
  }
  if (mode === "rates") {
    const r = reversibleRates[id],
      net = (r.forward - r.reverse) * r.seconds;
    return [
      num("Your signed net B change / tokens", net),
      num("Your A count after the interval", r.a - net),
      num("Your B count after the interval", r.b + net),
      pick(
        "Your dynamic-equilibrium conclusion",
        r.forward === r.reverse && r.forward > 0
          ? "equilibrium"
          : "notEquilibrium",
      ),
    ];
  }
  if (mode === "boundary") {
    const r = boundaryRecords[id];
    return [
      pick("Your evidence-based conclusion", r.classification),
      pick("Your supporting reason", r.reason),
    ];
  }
  const r = equilibriumEvidence[id];
  return [
    pick(
      "Your earliest demonstrated equilibrium / s",
      r.first === null ? "none" : String(r.first),
    ),
    pick("Your supporting rate and boundary evidence", r.reason),
  ];
}
for (const [mode, n] of [
  ["turnover", 1],
  ["direction", 2],
  ["energy", 3],
  ["rates", 4],
  ["boundary", 5],
  ["evidence", 6],
] as [ReversibleMode, number][])
  test(`${mode}: all six supplied records retain wrong predictions, reload, undo and atomic resets`, async ({
    page,
  }, info) => {
    await learn(page, n);
    const root = page.getByRole("region", { name: "Task model", exact: true });
    for (const id of Object.keys(reversibleRecords[mode])) {
      await root
        .getByText("Change the supplied teaching case", { exact: true })
        .click();
      await root
        .getByLabel("Supplied comparison", { exact: true })
        .selectOption(id);
      await root
        .getByText("Change the supplied teaching case", { exact: true })
        .click();
      await check(page, false);
      if (mode === "turnover") {
        await root
          .getByRole("button", { name: "Advance one interval", exact: true })
          .click();
        expect(await root.locator(".reversible-token").count()).toBe(20);
        const t = turnoverRecords[id];
        expect(await root.locator(".token-changed").count()).toBe(
          t.forward + t.reverse,
        );
      }
      for (const field of answers(mode, id)) {
        const control = root.getByLabel(field.label, { exact: true });
        if (field.numeric) await control.fill(field.value);
        else await control.selectOption(field.value);
      }
      if (mode === "direction") {
        const r = directionRecords[id];
        await expect(
          root.locator(".reversible-reading p").first(),
        ).toContainText(r.target === "forward" ? r.left : r.right);
        await expect(
          root.locator(".reversible-reading p").last(),
        ).toContainText(r.target === "forward" ? r.right : r.left);
      }
      await check(page, true);
      if (mode === "energy" || mode === "evidence") {
        const labels = await root.locator("svg text").evaluateAll((nodes) =>
          nodes.map((node) => {
            const text = node as SVGTextElement,
              matrix = text.getScreenCTM()!,
              box = text.getBoundingClientRect(),
              svg = text.ownerSVGElement!.getBoundingClientRect();
            return {
              label: text.textContent,
              size:
                parseFloat(getComputedStyle(text).fontSize) *
                Math.hypot(matrix.a, matrix.b),
              inside:
                box.left >= svg.left - 1 &&
                box.right <= svg.right + 1 &&
                box.top >= svg.top - 1 &&
                box.bottom <= svg.bottom + 1,
            };
          }),
        );
        for (const label of labels) {
          expect(label.size, label.label!).toBeGreaterThanOrEqual(12);
          expect(label.inside, label.label!).toBe(true);
        }
      }
      await root
        .getByText("Change the supplied teaching case", { exact: true })
        .click();
      await root
        .getByLabel("Supplied comparison", { exact: true })
        .selectOption(id);
      await root
        .getByText("Change the supplied teaching case", { exact: true })
        .click();
      await check(page, true);
      await saved(page);
      await page.reload();
      await check(page, true);
      for (const label of ["Check model", "Undo", "Reset model"]) {
        const box = await root
          .getByRole("button", { name: label, exact: true })
          .boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
    }
    await root
      .getByRole("button", { name: "Reset model", exact: true })
      .click();
    await check(page, false);
    // Recreate the original guided comparison and submit its own question.
    if (mode === "turnover")
      await root
        .getByRole("button", { name: "Advance one interval", exact: true })
        .click();
    for (const field of answers(mode, "initial")) {
      const control = root.getByLabel(field.label, { exact: true });
      if (field.numeric) await control.fill(field.value);
      else await control.selectOption(field.value);
    }
    await check(page, true);
    await answer(page, journey.guided[n - 1]);
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await expect(
      page.locator(".sample-task-answer [role=status]"),
    ).toContainText("That’s right.");
    await capture(
      page,
      `docs/qa/reversible-reactions-${info.project.name}-${mode}.png`,
    );
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await check(page, false);
    await root
      .getByRole("button", { name: "Reset model", exact: true })
      .click();
    await check(page, false);
  });
test("opening turnover control is a real keyboard-accessible mobile action", async ({
  page,
}, info) => {
  await learn(page, 1);
  const control = page.getByRole("button", {
    name: "Advance one interval",
    exact: true,
  });
  const box = await control.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await control.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".token-changed")).toHaveCount(4);
  await capture(
    page,
    `docs/qa/reversible-reactions-${info.project.name}-opening.png`,
  );
});
test("wrong signed energy persists and invalid raw entry never overwrites it", async ({
  page,
}) => {
  await learn(page, 3);
  const field = page.getByLabel("Your signed target energy change / kJ", {
    exact: true,
  });
  await field.fill("30");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(field).toHaveValue("30");
  await field.fill("-30");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(field).toHaveValue("30");
  await field.fill("1/2");
  await expect(page.locator(".reversible-workbench")).toContainText(
    "retained as a draft",
  );
  await saved(page);
  const modelId = journey.guided[2].id;
  const retained = await page.evaluate(
    ({ key, modelId }) => {
      const work = JSON.parse(localStorage.getItem(key)!).work[
        "reversible-reactions"
      ];
      return {
        board: work.taskModels[modelId].at(-1),
        draft: work.drafts["model-input:" + modelId],
      };
    },
    { key: STORAGE_KEY, modelId },
  );
  expect(retained.board.change).toBe("30");
  expect(JSON.parse(retained.draft).change).toBe("1/2");
  await page.reload();
  await expect(field).toHaveValue("1/2");
  const restored = await page.evaluate(
    ({ key, modelId }) => {
      const work = JSON.parse(localStorage.getItem(key)!).work[
        "reversible-reactions"
      ];
      return {
        board: work.taskModels[modelId].at(-1),
        draft: work.drafts["model-input:" + modelId],
      };
    },
    { key: STORAGE_KEY, modelId },
  );
  expect(restored).toEqual(retained);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(field).toHaveValue("30");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(field).toHaveValue("0");
});
test("six continuing intervals preserve identities and wrong stale predictions until corrected", async ({
  page,
}, info) => {
  await learn(page, 1);
  const root = page.getByRole("region", { name: "Task model", exact: true });
  for (let i = 0; i < 6; i++)
    await root
      .getByRole("button", { name: "Advance one interval", exact: true })
      .click();
  await expect(
    root.getByRole("button", { name: "Advance one interval", exact: true }),
  ).toBeDisabled();
  await expect(root.locator(".reversible-token")).toHaveCount(20);
  await expect(root).toContainText(
    "does not mean the equilibrium reactions stop",
  );
  await root
    .getByLabel("Your current A token count", { exact: true })
    .fill("14");
  await root
    .getByLabel("Your current B token count", { exact: true })
    .fill("6");
  await root
    .getByLabel("Your cumulative forward events", { exact: true })
    .fill("2");
  await root
    .getByLabel("Your cumulative reverse events", { exact: true })
    .fill("2");
  await root
    .getByLabel("Your dynamic-equilibrium conclusion", { exact: true })
    .selectOption("equilibrium");
  await check(page, false);
  await saved(page);
  await page.reload();
  await check(page, false);
  await root
    .getByLabel("Your cumulative forward events", { exact: true })
    .fill("12");
  await root
    .getByLabel("Your cumulative reverse events", { exact: true })
    .fill("12");
  await check(page, true);
  await capture(
    page,
    `docs/qa/reversible-reactions-${info.project.name}-six-intervals.png`,
  );
  await root.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(root.locator(".token-changed")).toHaveCount(0);
});
