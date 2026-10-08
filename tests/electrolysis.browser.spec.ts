import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { electrolysisJourney as journey } from "../src/content/journeys/electrolysis";
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
    page.locator(".electrolysis-workbench .feedback[role=status]"),
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

const route = "/lessons/electrolysis";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/electrolysis");
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
      if (i === 0) {
        await saved(page);
        await page.reload();
        await expect(
          page.getByRole("radio", { name: q.answer, exact: true }),
        ).toBeChecked();
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work["electrolysis"].run
                  .responses[id]?.fresh,
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
      for (const run of p.work["electrolysis"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["electrolysis"].run.submitted = Date.now() - delay - 1000;
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
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
});

test("all original practice works while four written explanations remain self-reviewed", async ({
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
                "electrolysis"
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

test("schematic ion movement keeps wrong direction, keyboard touch controls, reset, reload and reversed polarity", async ({
  page,
}, info) => {
  await page.goto(route);
  const left = page.getByRole("button", {
      name: "← Move ion one step left",
      exact: true,
    }),
    right = page.getByRole("button", {
      name: "Move ion one step right →",
      exact: true,
    });
  const box = await left.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  for (const button of [left, right]) {
    const fit = await button.evaluate((el) => {
      const r = el.getBoundingClientRect(),
        range = document.createRange();
      range.selectNodeContents(el);
      const t = range.getBoundingClientRect();
      return (
        el.scrollWidth <= el.clientWidth + 1 &&
        el.scrollHeight <= el.clientHeight + 1 &&
        t.left >= r.left &&
        t.right <= r.right &&
        t.top >= r.top &&
        t.bottom <= r.bottom
      );
    });
    expect(fit).toBe(true);
  }
  await right.focus();
  await page.keyboard.press("Enter");
  await select(page, "Your destination electrode", "anode");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your destination electrode", { exact: true }),
  ).toHaveValue("anode");
  await expect(page.locator(".electrolysis-movement figcaption")).toContainText(
    "position 1",
  );
  for (let i = 0; i < 4; i++) await left.click();
  await select(page, "Your destination electrode", "cathode");
  await check(page, true);
  await capture(
    page,
    "docs/qa/electrolysis-" + info.project.name + "-movement.png",
  );
  await select(page, "Explore a supplied electrolysis record", "reversed");
  await expect(page.locator(".electrolysis-movement figcaption")).toContainText(
    "position 0",
  );
  for (let i = 0; i < 3; i++) await right.click();
  await check(page, true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".electrolysis-movement figcaption")).toContainText(
    "position 2",
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Your destination electrode", { exact: true }),
  ).toHaveValue("unset");
  const smallest = await page
    .locator(".electrolysis-movement svg text")
    .evaluateAll((nodes) =>
      Math.min(
        ...nodes.map((n) => {
          const s = getComputedStyle(n),
            m = (n as SVGGraphicsElement).getScreenCTM()!;
          return parseFloat(s.fontSize) * Math.hypot(m.c, m.d);
        }),
      ),
    );
  expect(smallest).toBeGreaterThanOrEqual(12);
});
test("solid fixed ions, molten mobile ions and metal-wire electrons remain different editable demands", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await choices(page, {
    "Your conduction classification": "ionic-electrolyte",
    "Your charge carrier": "mobile-electrons",
  });
  await check(page, false);
  for (const [record, conduction, carrier] of [
    ["initial", "not-mobile-ionic", "fixed-ions"],
    ["molten", "ionic-electrolyte", "mobile-ions"],
    ["solution", "ionic-electrolyte", "mobile-ions"],
    ["copper", "metallic-conductor", "mobile-electrons"],
    ["sugar", "not-mobile-ionic", "no-supplied-mobile-ions"],
  ]) {
    await select(page, "Explore a supplied electrolysis record", record);
    await choices(page, {
      "Your conduction classification": conduction,
      "Your charge carrier": carrier,
    });
    await check(page, true);
  }
  await capture(
    page,
    "docs/qa/electrolysis-" + info.project.name + "-carriers.png",
  );
});
test("both neutral molten products must match, with no imported water-derived hydrogen or chloride gas", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your final cathode product": "H2",
    "Your final anode product": "Cl−",
  });
  await check(page, false);
  await choices(page, {
    "Your final cathode product": "Zn",
    "Your final anode product": "Cl2",
  });
  await check(page, true);
  await capture(
    page,
    "docs/qa/electrolysis-" + info.project.name + "-products.png",
  );
  for (const [record, cathode, anode] of [
    ["lead", "Pb", "Br2"],
    ["sodium", "Na", "Cl2"],
    ["calcium", "Ca", "Cl2"],
    ["potassium", "K", "Br2"],
  ]) {
    await select(page, "Explore a supplied electrolysis record", record);
    await choices(page, {
      "Your final cathode product": cathode,
      "Your final anode product": anode,
    });
    await check(page, true);
    await expect(page.locator(".molten-electrolysis-asset")).toHaveCount(0);
  }
});
test("cryolite lowers temperature while current remains, and reactivity and aqueous boundaries are explicit", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Your process reason": "cryolite-eliminates-current",
    "Your continuing energy requirement": "no-heating-or-current",
  });
  await check(page, false);
  for (const [record, reason, energy] of [
    [
      "initial",
      "lower-operating-temperature",
      "heating-and-current-still-needed",
    ],
    [
      "carbon",
      "carbon-cannot-reduce-oxide",
      "heating-and-current-still-needed",
    ],
    ["aqueous", "water-competes", "not-valid-aluminium-production"],
  ]) {
    await select(page, "Explore a supplied electrolysis record", record);
    await choices(page, {
      "Your process reason": reason,
      "Your continuing energy requirement": energy,
    });
    await check(page, true);
  }
  await capture(
    page,
    "docs/qa/electrolysis-" + info.project.name + "-mixture.png",
  );
});
test("carbon reacts in the given oxygen record but inert electrodes have no universal consumption", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await choices(page, {
    "Your anode material change": "carbon-just-melts",
    "Your replacement decision": "replace-cathode-instead",
  });
  await check(page, false);
  await choices(page, {
    "Your anode material change": "carbon-consumed",
    "Your replacement decision": "replace-carbon-anode",
  });
  await check(page, true);
  await select(page, "Explore a supplied electrolysis record", "identity");
  await check(page, true);
  await expect(page.getByText(/The anode loses 12 g carbon/)).toBeVisible();
  await select(page, "Explore a supplied electrolysis record", "inert");
  await choices(page, {
    "Your anode material change": "not-consumed-in-this-record",
    "Your replacement decision": "no-carbon-oxygen-replacement-reason",
  });
  await check(page, true);
  await capture(
    page,
    "docs/qa/electrolysis-" + info.project.name + "-anode.png",
  );
});
test("actual binary asset retains six atomic meshes, three identities per state, neutral products and one Cl2 bond", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  const canvas = page.getByRole("group", {
    name: "Rotate molten electrolysis reference",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.1");
  for (let i = 0; i < 7; i++)
    await page
      .getByRole("button", { name: "Rotate right", exact: true })
      .click();
  await canvas.screenshot({
    path: "docs/qa/electrolysis-" + info.project.name + "-asset.png",
    style: ".mobile-bar,.skip-link{visibility:hidden!important;}",
  });
  await page
    .getByRole("button", { name: "Enlarge after state", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-focus", "after");
  await canvas.screenshot({
    path: "docs/qa/electrolysis-" + info.project.name + "-enlarged-after.png",
    style: ".mobile-bar,.skip-link{visibility:hidden!important;}",
  });
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D asset", exact: true })
    .click();
  const d = await pending;
  await d.saveAs("docs/qa/electrolysis-" + info.project.name + "-molten.glb");
  const { readFile } = await import("node:fs/promises"),
    bytes = await readFile((await d.path())!);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const len = bytes.readUInt32LE(12),
    g = JSON.parse(bytes.subarray(20, 20 + len).toString()),
    atoms = g.nodes.filter(
      (n: { extras?: { element?: string } }) => n.extras?.element,
    );
  expect(atoms).toHaveLength(6);
  expect(
    new Set(
      atoms.map((n: { extras: { atomicId: string } }) => n.extras.atomicId),
    ).size,
  ).toBe(3);
  expect(
    atoms.reduce(
      (s: number, n: { extras: { formalCharge: number } }) =>
        s + n.extras.formalCharge,
      0,
    ),
  ).toBe(0);
  expect(
    g.nodes.filter(
      (n: { extras?: { kind?: string } }) =>
        n.extras?.kind === "single-covalent-bond",
    ),
  ).toHaveLength(1);
  const binary = 28 + len;
  for (const mesh of g.meshes) {
    const a = g.accessors[mesh.primitives[0].attributes.POSITION],
      v = g.bufferViews[a.bufferView],
      start = binary + (v.byteOffset ?? 0) + (a.byteOffset ?? 0);
    expect(a.componentType).toBe(5126);
    for (let i = 0; i < a.count * 3; i++)
      expect(Number.isFinite(bytes.readFloatLE(start + i * 4))).toBe(true);
  }
});
test("wrong reversed-layout answer returns from its targeted polarity refresher with the original draft", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 8);
  await page
    .getByRole("radio", {
      name: "Left, because cathodes must be left",
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Use polarity, not page position",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByRole("radio", {
      name: "Left, because cathodes must be left",
      exact: true,
    }),
  ).toBeChecked();
});
test("WebGL fallback retains separate-ion and neutral-product text with both editable predictions", async ({
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
  await task(page, 3);
  await expect(page.getByText(/3D is unavailable/)).toBeVisible();
  await choices(page, {
    "Your final cathode product": "Zn",
    "Your final anode product": "Cl2",
  });
  await check(page, true);
  await capture(
    page,
    "docs/qa/electrolysis-" + info.project.name + "-fallback.png",
  );
});
test("fresh independent molten-products form hides assistance and all marking before submission", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await answer(page, journey.checkForms[0][0]);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".feedback.correct")).toHaveCount(0);
  await capture(
    page,
    "docs/qa/electrolysis-" + info.project.name + "-independent.png",
  );
});
