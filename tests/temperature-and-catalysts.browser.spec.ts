import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { temperatureJourney as journey } from "../src/content/journeys/temperature-and-catalysts";
import type { ThermalMode } from "../src/lib/temperature-catalysts";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/temperature-and-catalysts";
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
  } else if (q.rubric)
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
    page.locator(".thermal-workbench .feedback[role=status]"),
  ).toHaveClass(correct ? /correct/ : /retry/);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/temperature-and-catalysts");
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
          "docs/qa/temperature-and-catalysts-" +
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
                  "temperature-and-catalysts"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(form === 1); // The opening heating model exposes A1; B1 tests unexposed catalyst-identification evidence.
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
      for (const run of p.work["temperature-and-catalysts"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["temperature-and-catalysts"].run.submitted =
        Date.now() - delay - 1000;
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
                "temperature-and-catalysts"
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
  energySamples,
  thresholdSamples,
  thermalProfiles,
  additiveEvidence,
  thermalComparisons,
  thermalClaims,
} from "../src/lib/temperature-catalysts";
import { thermalRecords } from "../src/lib/thermal-board";
type FieldAnswer = { label: string; value: string; numeric?: boolean };
function answers(mode: ThermalMode, id: string): FieldAnswer[] {
  const input = (label: string, value: number): FieldAnswer => ({
    label,
    value: String(value),
    numeric: true,
  });
  const pick = (label: string, value: string): FieldAnswer => ({
    label,
    value,
  });
  if (mode === "heating") {
    const r = energySamples[id as keyof typeof energySamples];
    return [
      pick("Supplied thermal snapshot", "warm"),
      input(
        "Your encounters meeting the minimum",
        r.warm.filter((e) => e >= r.barrier).length,
      ),
      input("Your total encounter count", r.warm.length),
      pick("Average particle energy compared with cooler state", "higher"),
      pick("Expected collision frequency on heating", "higher"),
      pick("Activation energy of the unchanged pathway", "same"),
    ];
  }
  if (mode === "threshold") {
    const r = thresholdSamples[id as keyof typeof thresholdSamples];
    return [
      pick("Reaction pathway at fixed temperature", "catalysed"),
      input(
        "Your encounters meeting this minimum",
        r.energies.filter((e) => e >= r.catalysed).length,
      ),
      input("Your total encounter count", r.energies.length),
      pick("Average particle energy when catalyst is added", "same"),
      pick("Activation energy of catalysed pathway", "lower"),
    ];
  }
  if (mode === "profile") {
    const r = thermalProfiles[id as keyof typeof thermalProfiles];
    return [
      input("Proposed catalysed peak / kJ", r.reactant + r.catalysedEa),
      input("Your forward activation energy / kJ", r.catalysedEa),
      input("Your signed overall energy change / kJ", r.product - r.reactant),
      pick("Reactant and product energy levels", "same"),
    ];
  }
  if (mode === "identification") {
    const r = additiveEvidence[id as keyof typeof additiveEvidence];
    return [
      pick("Your classification", r.answer),
      pick(
        "Your supporting observation",
        !r.controlled
          ? "confounded"
          : r.answer === "reactant"
            ? "consumed"
            : !r.faster
              ? "noRateChange"
              : r.sameIdentity === null
                ? "massAlone"
                : "rateIdentityControls",
      ),
    ];
  }
  if (mode === "comparison") {
    const r = thermalComparisons[id as keyof typeof thermalComparisons],
      a = r.amountA / r.timeA,
      b = r.amountB / r.timeB;
    return [
      input("Your trial A mean rate / " + r.unit, a),
      input("Your trial B mean rate / " + r.unit, b),
      pick(
        "Your greater measured mean rate",
        a === b ? "equal" : a > b ? "A" : "B",
      ),
      pick("Final amount of product in stated complete reactions", "same"),
    ];
  }
  const r = thermalClaims[id as keyof typeof thermalClaims];
  return [
    pick("Your supported claim", r.claim),
    pick("Your supporting reason", r.reason),
  ];
}
async function fillModel(page: Page, mode: ThermalMode, id: string) {
  const root = page.locator(".thermal-workbench");
  for (const a of answers(mode, id))
    if (a.numeric)
      await root.getByLabel(a.label, { exact: true }).fill(a.value);
    else await root.getByLabel(a.label, { exact: true }).selectOption(a.value);
}
const modes: ThermalMode[] = [
  "heating",
  "threshold",
  "profile",
  "identification",
  "comparison",
  "evidence",
];
for (const [index, mode] of modes.entries())
  test(`${mode}: native comparisons retain false predictions, saved fields and readable controls`, async ({
    page,
  }, info) => {
    await learn(page, index + 1);
    const root = page.locator(".thermal-workbench");
    for (const id of Object.keys(thermalRecords[mode])) {
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
      await fillModel(page, mode, id);
      await check(page, true);
      await saved(page);
      await page.reload();
      await check(page, true);
    }
    await root
      .getByRole("button", { name: "Reset model", exact: true })
      .click();
    await fillModel(page, mode, "initial");
    await check(page, true);
    if (mode === "identification")
      await expect(
        root.getByText("Selected: Supports catalyst identification", {
          exact: true,
        }),
      ).toBeVisible();
    await answer(page, journey.guided[index]);
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await expect(
      page.locator(".sample-task-answer [role=status]"),
    ).toContainText("That’s right.");
    for (const control of await root.getByRole("button").all()) {
      const bounds = await control.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
    }
    await capture(
      page,
      `docs/qa/temperature-and-catalysts-${info.project.name}-${mode}.png`,
    );
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await check(page, false);
    await root
      .getByRole("button", { name: "Reset model", exact: true })
      .click();
    await check(page, false);
  });
test("opening thermal control is44px and within the unchanged mobile viewport", async ({
  page,
}, info) => {
  await learn(page, 1);
  await page.evaluate(() => scrollTo(0, 0));
  const b = await page
    .getByLabel("Supplied thermal snapshot", { exact: true })
    .boundingBox();
  expect(b).not.toBeNull();
  expect(b!.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(b!.y + b!.height).toBeLessThanOrEqual(664);
  await capture(
    page,
    `docs/qa/temperature-and-catalysts-${info.project.name}-opening.png`,
  );
});
test("wrong peak persists through reload and undo; invalid raw entry stays visible until reset", async ({
  page,
}) => {
  await learn(page, 3);
  const field = page.getByLabel("Proposed catalysed peak / kJ", {
    exact: true,
  });
  await field.fill("99");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(field).toHaveValue("99");
  await field.fill("65");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(field).toHaveValue("99");
  await field.fill("1/2");
  await expect(field).toHaveValue("1/2");
  await expect(page.locator(".thermal-workbench")).toContainText(
    "is not saved",
  );
  await page.reload();
  await expect(field).toHaveValue("99");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(field).toHaveValue("100");
});
test("independent profile requires endpoint levels and both arrows together", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 16);
  const q = journey.practice[15];
  await answer(page, q);
  await page
    .getByLabel("Your drawn activation arrow", { exact: true })
    .selectOption("zero-peak");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.locator(".sample-task-answer [role=status]"),
  ).not.toContainText("That’s right.");
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your drawn activation arrow", { exact: true }),
  ).toHaveValue("zero-peak");
  await page
    .getByLabel("Your drawn activation arrow", { exact: true })
    .selectOption("reactants-peak");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "That’s right.",
  );
  await capture(
    page,
    `docs/qa/temperature-and-catalysts-${info.project.name}-profile-construction.png`,
  );
});
