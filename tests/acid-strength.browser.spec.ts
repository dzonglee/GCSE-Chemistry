import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { acidStrengthJourney as journey } from "../src/content/journeys/acid-strength";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function select(page: Page, label: string, value: string) {
  await page.getByLabel(label, { exact: true }).selectOption(value);
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".acid-strength-workbench .feedback[role=status]"),
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
async function answer(page: Page, q: (typeof journey.practice)[number]) {
  if (q.parts) {
    const values = JSON.parse(q.answer);
    for (const part of q.parts)
      await page.getByLabel(part.label, { exact: true }).fill(values[part.id]);
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

const route = "/lessons/ph-and-strong-acids";
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/ph-and-strong-acids");
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
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "ph-and-strong-acids"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(true);
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
      for (const run of p.work["ph-and-strong-acids"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["ph-and-strong-acids"].run.submitted = Date.now() - delay - 1000;
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

test("all original practice works while two written explanations remain self-reviewed", async ({
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
                "ph-and-strong-acids"
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
test("separate descriptor predictions retain wrong choices keyboard undo atomic reset and reload", async ({
  page,
}, info) => {
  await page.goto(route);
  const strong = page.getByRole("button", { name: "Strong", exact: true }),
    box = await strong.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await page.getByRole("button", { name: "Weak", exact: true }).click();
  await select(page, "Your total acid concentration comparison", "lower");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Weak", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await strong.focus();
  await page.keyboard.press("Enter");
  await check(page, true);
  await expect(
    page.getByRole("group", {
      name: "Rotate hydrated acid ionisation reference",
      exact: true,
    }),
  ).toHaveAttribute("data-ready", "true");
  await capture(
    page,
    "docs/qa/acid-strength-" + info.project.name + "-descriptors.png",
  );
  await select(page, "Explore supplied acid evidence", "weakHigher");
  await expect(
    page.getByLabel("Your total acid concentration comparison", {
      exact: true,
    }),
  ).toHaveValue("unset");
  await expect(strong).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Weak", exact: true }).click();
  await select(page, "Your total acid concentration comparison", "higher");
  await check(page, true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Your total acid concentration comparison", {
      exact: true,
    }),
  ).toHaveValue("unset");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Explore supplied acid evidence", { exact: true }),
  ).toHaveValue("initial");
});
test("pH steps distinguish target direction and powers of ten from pH-number ratios", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await page
    .getByRole("button", { name: "Lower chosen pH by 1", exact: true })
    .click();
  await select(page, "Your H+ concentration direction", "increases");
  await select(page, "Your H+ concentration change factor", "100");
  await check(page, false);
  await page
    .getByRole("button", { name: "Lower chosen pH by 1", exact: true })
    .click();
  await select(page, "Your H+ concentration change factor", "2");
  await check(page, false);
  await select(page, "Your H+ concentration change factor", "100");
  await check(page, true);
  await capture(
    page,
    "docs/qa/acid-strength-" + info.project.name + "-factors.png",
  );
  await expect(
    page.locator(".acid-factor-table tr[data-chosen=true]"),
  ).toContainText("10 × 10 times");

  await select(page, "Explore supplied acid evidence", "riseThree");
  await expect(page.locator(".model-readout")).toContainText(
    "Your chosen pH: 2",
  );
  await expect(
    page.getByLabel("Your H+ concentration direction", { exact: true }),
  ).toHaveValue("unset");
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "Raise chosen pH by 1", exact: true })
      .click();
  await select(page, "Your H+ concentration direction", "decreases");
  await select(page, "Your H+ concentration change factor", "1000");
  await check(page, true);
  await expect(
    page.locator(".acid-factor-table tr[data-chosen=true]"),
  ).toContainText("1 / (10 × 10 × 10)");
});
test("stated dilution preserves dissolved amount and acid strength while changing volume concentration and pH", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await page
    .getByRole("button", {
      name: "Select one more tenfold dilution",
      exact: true,
    })
    .click();
  await expect(page.locator(".model-readout")).toContainText("250 cm³");
  await select(page, "Your predicted final pH", "3");
  await select(page, "Your total acid concentration change", "tenfold-lower");
  await select(page, "Your acid strength after dilution", "now-weak");
  await check(page, false);
  await select(page, "Your acid strength after dilution", "still-strong");
  await check(page, true);
  await capture(
    page,
    "docs/qa/acid-strength-" + info.project.name + "-dilution.png",
  );
  await select(page, "Explore supplied acid evidence", "hundred");
  await expect(
    page.getByLabel("Your predicted final pH", { exact: true }),
  ).toHaveValue("unset");
  for (let i = 0; i < 2; i++)
    await page
      .getByRole("button", {
        name: "Select one more tenfold dilution",
        exact: true,
      })
      .click();
  await select(page, "Your predicted final pH", "4");
  await select(
    page,
    "Your total acid concentration change",
    "hundredfold-lower",
  );
  await select(page, "Your acid strength after dilution", "still-strong");
  await check(page, true);
  await expect(page.locator(".model-readout")).toContainText("1000 cm³");
});
test("controlled comparison and missing-evidence modes reject unsupported strength claims", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await select(page, "Which has more H+ per unit volume?", "HCl");
  await select(page, "Which has higher pH?", "ethanoic");
  await select(page, "Your comparison reason", "equal-concentration");
  await check(page, true);
  await capture(
    page,
    "docs/qa/acid-strength-" + info.project.name + "-comparison.png",
  );
  await select(page, "Explore supplied acid evidence", "weakConcentrated");
  await select(page, "Which has more H+ per unit volume?", "HCl");
  await select(page, "Which has higher pH?", "ethanoic");
  await select(page, "Your comparison reason", "lower-ph-always-stronger");
  await check(page, false);
  await select(page, "Which has more H+ per unit volume?", "not-established");
  await select(page, "Which has higher pH?", "not-established");
  await select(page, "Your comparison reason", "uncontrolled-concentration");
  await check(page, true);
  await task(page, 5);
  await select(page, "Your supported claim", "ph-proves-strength");
  await select(page, "Your evidence reason", "ph-depends-on-both");
  await check(page, false);
  await select(page, "Your supported claim", "strength-not-established");
  await check(page, true);
  await capture(
    page,
    "docs/qa/acid-strength-" + info.project.name + "-evidence.png",
  );
  await select(page, "Explore supplied acid evidence", "weakDilution");
  await select(page, "Your supported claim", "exact-ph-change-not-established");
  await select(page, "Your evidence reason", "fraction-can-change");
  await check(page, true);
});
test("wrong factor survives recovery and fresh independent task hides learning assistance", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 7);
  await page.getByLabel("Your answer", { exact: true }).fill("100");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.locator(".sample-task-answer .feedback.correct"),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "100",
  );
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "100",
  );
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Give me a hint", exact: true }),
  ).toHaveCount(0);
  await capture(
    page,
    "docs/qa/acid-strength-" + info.project.name + "-independent.png",
  );
});
test("actual binary retains ten atomic meshes five conserved IDs real bonds and distinct hydrated species", async ({
  page,
}, info) => {
  await page.goto(route);
  const canvas = page.getByRole("group", {
    name: "Rotate hydrated acid ionisation reference",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.1");
  await page
    .getByRole("button", { name: "Enlarge after state", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-focus", "after");
  await canvas.screenshot({
    path: "docs/qa/acid-strength-" + info.project.name + "-enlarged-after.png",
    style: ".mobile-bar,.skip-link{visibility:hidden!important;}",
  });
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D asset", exact: true })
    .click();
  const d = await pending;
  await d.saveAs(
    "docs/qa/acid-strength-" + info.project.name + "-ionisation.glb",
  );
  const { readFile } = await import("node:fs/promises"),
    bytes = await readFile((await d.path())!);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const len = bytes.readUInt32LE(12),
    g = JSON.parse(bytes.subarray(20, 20 + len).toString()),
    nodes = g.nodes as {
      extras?: {
        atomicId?: string;
        kind?: string;
        speciesCharge?: number;
        representedSubstance?: string;
      };
    }[],
    atoms = nodes.filter((n) => n.extras?.atomicId);
  expect(atoms).toHaveLength(10);
  expect(new Set(atoms.map((n) => n.extras!.atomicId)).size).toBe(5);
  expect(
    nodes.filter((n) => n.extras?.kind === "covalent-bond-rod"),
  ).toHaveLength(6);
  expect(
    nodes.find((n) => n.extras?.representedSubstance === "H3O+")!.extras!
      .speciesCharge,
  ).toBe(1);
  expect(
    nodes.find((n) => n.extras?.representedSubstance === "Cl−")!.extras!
      .speciesCharge,
  ).toBe(-1);
  const bin = 28 + len;
  for (const mesh of g.meshes) {
    const a = g.accessors[mesh.primitives[0].attributes.POSITION],
      v = g.bufferViews[a.bufferView],
      start = bin + (v.byteOffset ?? 0) + (a.byteOffset ?? 0);
    expect(a.componentType).toBe(5126);
    for (let i = 0; i < a.count * 3; i++)
      expect(Number.isFinite(bytes.readFloatLE(start + i * 4))).toBe(true);
  }
});
test("WebGL fallback retains hydrated transfer conservation and editable descriptor predictions", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind,
      ...args
    ) {
      if (String(kind).startsWith("webgl")) return null;
      return get.call(this, kind, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto(route);
  await expect(page.getByText(/3D is unavailable/)).toBeVisible();
  await page.getByRole("button", { name: "Strong", exact: true }).click();
  await select(page, "Your total acid concentration comparison", "lower");
  await check(page, true);
  await capture(
    page,
    "docs/qa/acid-strength-" + info.project.name + "-fallback.png",
  );
});
