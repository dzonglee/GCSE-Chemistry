import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import { lessons } from "../src/content/curriculum";
import { climateRecords } from "../src/lib/climate";
import { atmosphereRecords } from "../src/lib/early-atmosphere";
import { greenhouseRecords } from "../src/lib/greenhouse";
const key = "gcse-chemistry.progress.v1";
const dir = "test-results/qa/course-audit";
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function shot(page: Page, name: string, device: string) {
  fs.mkdirSync(dir, { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `${dir}/${device}-${name}.png`,
    fullPage: true,
  });
}
for (const [slug, record, field, records] of [
  ["climate-evidence", "trend", "start", climateRecords],
  ["early-atmosphere", "modern", "nitrogen", atmosphereRecords],
  ["greenhouse-effect", "balance", "absorbed", greenhouseRecords],
] as const) {
  test(`${slug}: unsupported raw input replaces an old correct proposal and survives check/reload`, async ({
    page,
  }, info) => {
    await page.goto(`/lessons/${slug}`);
    const journey = lessons.find((l) => l.slug === slug)!.journey!;
    const index = journey.guided.findIndex(
      (q) => q.model && "record" in q.model && q.model.record === record,
    );
    expect(index).toBeGreaterThanOrEqual(0);
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    await page
      .getByRole("button", { name: `Task ${index + 1}`, exact: true })
      .first()
      .click();
    const root = page.getByRole("region", { name: "Task model", exact: true });
    const source = await root
      .locator(
        slug === "climate-evidence"
          ? ".climate-table-wrap table"
          : '[class$="-original"]',
      )
      .first()
      .innerText();
    for (const [f, v] of Object.entries(records[record].expected)) {
      const control = root.locator(`[data-field="${f}"]`);
      if (await control.evaluate((el) => el.tagName === "SELECT"))
        await control.selectOption(v);
      else await control.fill(v);
    }
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback.good")).toBeVisible();
    for (const raw of ["1..2", "1e3", "5 mol", "Infinity"]) {
      await root.locator(`[data-field="${field}"]`).fill(raw);
      await root
        .getByRole("button", { name: "Check proposal", exact: true })
        .click();
      await expect(root.locator(".feedback.bad")).toBeVisible();
      await saved(page);
      await page.reload();
      await expect(root.locator(`[data-field="${field}"]`)).toHaveValue(raw);
      expect(
        await root
          .locator(
            slug === "climate-evidence"
              ? ".climate-table-wrap table"
              : '[class$="-original"]',
          )
          .first()
          .innerText(),
      ).toBe(source);
      await root
        .getByRole("button", { name: "Check proposal", exact: true })
        .click();
      await expect(root.locator(".feedback.bad")).toBeVisible();
    }
    await shot(page, `${slug}-raw`, info.project.name);
  });
}
test("alcohol raw count persists separately from validated construction and clears through Undo", async ({
  page,
}, info) => {
  await page.goto("/lessons/alcohols-and-acids");
  const root = page.getByRole("region", { name: "Task model", exact: true }),
    input = root.locator("input").first();
  await input.fill("1");
  await saved(page);
  const original = await page.evaluate(
    (k) =>
      JSON.parse(localStorage.getItem(k)!).work["alcohols-and-acids"]
        .taskModels["alc-v1-g-structure"],
    key,
  );
  await input.fill("1e3");
  await saved(page);
  await page.reload();
  await expect(input).toHaveValue("1e3");
  expect(
    await page.evaluate(
      (k) =>
        JSON.parse(localStorage.getItem(k)!).work["alcohols-and-acids"]
          .taskModels["alc-v1-g-structure"],
      key,
    ),
  ).toEqual(original);
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".feedback.incorrect")).toContainText(
    "Keep your original proposal",
  );
  await shot(page, "alcohol-raw-retained", info.project.name);
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(input).toHaveValue("1");
});
test("unreadable or foreign raw model draft stays byte-for-byte until explicitly cleared", async ({
  page,
}) => {
  await page.goto("/lessons/alcohols-and-acids");
  await page
    .getByRole("region", { name: "Task model", exact: true })
    .locator("input")
    .first()
    .fill("1");
  await saved(page);
  for (const original of [
    "{broken",
    JSON.stringify({ record: "foreign", hTotal: "1e3" }),
  ]) {
    await page.evaluate(
      ({ key, original }) => {
        const data = JSON.parse(localStorage.getItem(key)!);
        data.work["alcohols-and-acids"].drafts[
          "model-input:alc-v1-g-structure"
        ] = original;
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem("course-audit-unrelated", "retain");
      },
      { key, original },
    );
    await page.reload();
    await expect(
      page.getByText("A saved model input draft could not be read."),
    ).toBeVisible();
    for (const typed of ["1e3", "2"]) {
      await page
        .getByRole("region", { name: "Task model", exact: true })
        .locator("input")
        .first()
        .fill(typed);
      await saved(page);
      expect(
        await page.evaluate(
          (k) =>
            JSON.parse(localStorage.getItem(k)!).work["alcohols-and-acids"]
              .drafts["model-input:alc-v1-g-structure"],
          key,
        ),
      ).toBe(original);
    }
    await page
      .getByRole("button", {
        name: "Clear this saved model input draft",
        exact: true,
      })
      .click();
    await saved(page);
    expect(
      await page.evaluate(() => localStorage.getItem("course-audit-unrelated")),
    ).toBe("retain");
    await page.reload();
    await expect(
      page.getByText("A saved model input draft could not be read."),
    ).toHaveCount(0);
  }
});
test("active late lesson is visible in its navigation; progress updates preserve deliberate map scrolling", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/lessons/haber-and-fertilisers");
  const current = page.locator('.topic-lesson-links [aria-current="page"]');
  await expect
    .poll(() =>
      current.evaluate((el) => {
        const link = el.getBoundingClientRect(),
          panel = el.closest("#course-navigation")!.getBoundingClientRect();
        return link.top >= panel.top && link.bottom <= panel.bottom;
      }),
    )
    .toBe(true);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await shot(page, "late-sidebar", info.project.name);
  await page.locator("#course-navigation").evaluate((el) => {
    el.scrollTop = 0;
  });
  await page
    .locator('.haber-workbench [data-field="nitrogenSource"]')
    .selectOption("Air");
  await saved(page);
  expect(
    await page.locator("#course-navigation").evaluate((el) => el.scrollTop),
  ).toBe(0);
});
test("coverage describes all current journeys and the eight practical preparations accessibly", async ({
  page,
}) => {
  await page.goto("/coverage");
  await expect(page.locator("main")).toContainText("All 95 lessons");
  await expect(page.locator("main")).not.toContainText("other lessons retain");
  for (const slug of [
    "making-soluble-salts",
    "titration-practical",
    "aqueous-electrolysis-products",
    "energy-practical",
    "rates-practical",
    "chromatography",
    "ion-tests",
    "potable-water",
  ])
    await expect(page.locator(`main a[href="/lessons/${slug}"]`)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});

// Every case below was reproduced in an actual browser before its correction.
const reproducedEditors = [
  ["titration-practical", "tech-v1-g-reading", true],
  ["exothermic-and-endothermic", "heat-v1-g-temperature", true],
  ["reaction-profiles", "profile-v1-g-read", true],
  ["bond-energy", "bond-v1-g-ledger", true],
  ["energy-practical", "ep-v1-g-observe", true],
  ["cells-and-fuel-cells", "cf-v1-g-cell", true],
  ["fuel-cell-half-equations", "fh-v1-g-hydrogen", true],
  ["interpreting-cell-voltages", "cv-v1-g-read", true],
  ["measuring-rates", "rr-v1-g-interval", true],
  ["measuring-rates", "rr-v1-g-plot", true],
  ["rates-from-tangents", "tr-v1-g-construct", true],
  ["collision-theory", "ct-v1-guide-energy", true],
  ["temperature-and-catalysts", "tc-v1-g-heat", true],
  ["reversible-reactions", "re-v1-g-turnover", true],
  ["changing-equilibrium", "es-v1-g-compression", true],
  ["rates-practical", "rp-v1-g-apparatus", true],
  ["crude-oil-and-fractions", "oil-v1-g-inventory", true],
  ["alkanes-and-combustion", "alk-v1-g-kit", true],
  ["cracking-and-alkenes", "crk-v1-g-rearrange", true],
  ["instrumental-analysis", "instrumental-analysis-v1-g-cal4", false],
  ["separation-practical", "separation-practical-v1-g-dry", false],
  ["early-atmosphere", "early-atmosphere-v1-g-composition", false],
  ["air-pollutants", "pollution-v1-g-balance", false],
  ["carbon-cycle", "cycle-v1-g-ledger", false],
  ["potable-water", "water-v1-g-residue", false],
  ["wastewater-and-treatment", "waste-v1-g-solids", false],
  ["extracting-metals", "bio-v1-g-grade", false],
  ["life-cycle-and-recycling", "lca-v1-g-inventory", false],
] as const;
for (const [slug, id, separateDraft] of reproducedEditors) {
  test(`${slug} (${id}): reproduced unsupported editor input persists without changing accepted structure`, async ({
    page,
  }, info) => {
    await page.goto(`/lessons/${slug}`);
    const journey = lessons.find((l) => l.slug === slug)!.journey!;
    const index = journey.guided.findIndex((q) => q.id === id);
    expect(index).toBeGreaterThanOrEqual(0);
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    await page
      .getByRole("button", { name: `Task ${index + 1}`, exact: true })
      .first()
      .click();
    const root = page.getByRole("region", { name: "Task model", exact: true });
    const input = root
      .locator(
        'input:not([type="range"]):not([type="checkbox"]):not([type="radio"])',
      )
      .first();
    await input.fill("1");
    await saved(page);
    const accepted = await page.evaluate(
      ({ key, slug, id }) =>
        JSON.parse(localStorage.getItem(key)!).work[slug].taskModels[id],
      { key, slug, id },
    );
    for (const raw of ["1..2", "1e3", "5 mol"]) {
      await input.fill(raw);
      await expect(input).toHaveValue(raw);
      await saved(page);
      await page.reload();
      await expect(input).toHaveValue(raw);
      if (separateDraft)
        expect(
          await page.evaluate(
            ({ key, slug, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[slug].taskModels[id],
            { key, slug, id },
          ),
        ).toEqual(accepted);
      const check = root.getByRole("button", {
        name: /^Check (model|proposal)$/,
      });
      await expect(check).toHaveCount(1);
      if (await check.isEnabled()) await check.click();
      else await expect(check).toBeDisabled();
      await expect(
        root.locator(".feedback.correct,.feedback.good"),
      ).toHaveCount(0);
    }
    if (
      [
        "reaction-profiles",
        "rates-from-tangents",
        "interpreting-cell-voltages",
        "carbon-cycle",
        "potable-water",
        "extracting-metals",
      ].includes(slug)
    )
      await shot(page, `${slug}-retained`, info.project.name);
  });
}
