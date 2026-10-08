import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile } from "node:fs/promises";
import { ionicStructuresJourney as journey } from "../src/content/journeys/ionic-structures";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
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
  await mkdir("test-results/qa/ionic-structures", { recursive: true });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: name, fullPage: true });
}
test("actual 3D lattice preserves wrong predictions, rotates, exports balanced charged ions and reloads", async ({
  page,
}, info) => {
  await page.goto("/lessons/ionic-structures");
  const first = page.getByLabel("Inspect an interior ion", { exact: true }),
    box = await first.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await expect(page.locator(".lattice-scene")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page.getByLabel("Your nearest-neighbour count").selectOption("4");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".ionic-structure [role=status]")).not.toHaveClass(
    /correct/,
  );
  await expect(page.getByLabel("Your nearest-neighbour count")).toHaveValue(
    "4",
  );
  await page.reload();
  await expect(page.getByLabel("Your nearest-neighbour count")).toHaveValue(
    "4",
  );
  await page.getByLabel("Your nearest-neighbour count").selectOption("6");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".ionic-structure [role=status]")).toHaveClass(
    /correct/,
  );
  await first.selectOption("Cl-");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".lattice-scene")).toHaveAttribute(
    "data-selected",
    "ion-1-1-1",
  );
  const rotation = await page
    .locator(".lattice-scene")
    .getAttribute("data-rotation");
  await page.locator(".lattice-scene").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".lattice-scene")).not.toHaveAttribute(
    "data-rotation",
    rotation!,
  );
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download lattice as GLB", exact: true })
    .click();
  const download = await downloadPromise,
    file = `test-results/qa/ionic-structures/sodium-chloride-lattice-${info.project.name}.glb`;
  await download.saveAs(file);
  const binary = await readFile(file);
  expect(binary.readUInt32LE(0)).toBe(0x46546c67);
  expect(binary.readUInt32LE(4)).toBe(2);
  expect(binary.readUInt32LE(8)).toBe(binary.length);
  const json = JSON.parse(
    binary.subarray(20, 20 + binary.readUInt32LE(12)).toString(),
  );
  const ions = json.nodes.filter((n: { name?: string }) =>
    /^ion-\d-\d-\d$/.test(n.name ?? ""),
  );
  expect(ions).toHaveLength(64);
  expect(
    ions.filter((n: { extras: { charge: number } }) => n.extras.charge === 1),
  ).toHaveLength(32);
  expect(
    ions.reduce(
      (sum: number, n: { extras: { charge: number } }) => sum + n.extras.charge,
      0,
    ),
  ).toBe(0);
  expect(
    ions.filter(
      (n: { extras: { nearestNeighbour: boolean } }) =>
        n.extras.nearestNeighbour,
    ),
  ).toHaveLength(6);
  const depth = ions.map((n: { translation?: number[]; matrix?: number[] }) =>
    n.translation ? n.translation[2] : n.matrix ? n.matrix[14] : 0,
  );
  expect([...new Set(depth)].sort((a, b) => Number(a) - Number(b))).toEqual([
    -1.5, -0.5, 0.5, 1.5,
  ]);
  await audit(page);
  await capture(
    page,
    `test-results/qa/ionic-structures/ionic-structures-${info.project.name}-lattice.png`,
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(first).toHaveValue("Na+");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(page.getByLabel("Your nearest-neighbour count")).toHaveValue(
    "0",
  );
});
test("solid molten and solution predictions reject electrons, retain errors and show correct phase-specific particles", async ({
  page,
}, info) => {
  await page.goto("/lessons/ionic-structures");
  for (let i = 1; i < 4; i++) {
    await page
      .getByRole("button", { name: `Task ${i + 1}`, exact: true })
      .first()
      .click();
    const conducts = page.getByLabel("Your conductivity prediction"),
      carriers = page.getByLabel("Your particle explanation");
    await conducts.selectOption(i === 1 ? "no" : "yes");
    await carriers.selectOption("electrons");
    await page
      .getByRole("button", { name: "Check model", exact: true })
      .click();
    await expect(
      page.locator(".ionic-structure [role=status]"),
    ).not.toHaveClass(/correct/);
    await expect(carriers).toHaveValue("electrons");
    await page.reload();
    await expect(carriers).toHaveValue("electrons");
    await carriers.selectOption(i === 1 ? "fixed" : "mobile");
    await page
      .getByRole("button", { name: "Check model", exact: true })
      .click();
    await expect(page.locator(".ionic-structure [role=status]")).toHaveClass(
      /correct/,
    );
    await expect(page.locator(".ionic-structure svg")).toHaveAttribute(
      "aria-label",
      i === 1 ? /Regular fixed positions/ : /Disordered mobile ions/,
    );
    await expect(page.locator(".lattice-scene")).toHaveCount(0);
    await audit(page);
    await capture(
      page,
      `test-results/qa/ionic-structures/ionic-structures-${info.project.name}-${["", "solid", "molten", "solution"][i]}.png`,
    );
  }
});
test("unavailable WebGL retains 2D projection and complete accessible structure explanation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (kind.includes("webgl")) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.goto("/lessons/ionic-structures");
  await expect(
    page.getByText("3D is unavailable;", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".lattice-asset svg circle")).toHaveCount(64);
  await page.getByLabel("Your nearest-neighbour count").selectOption("6");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.getByText("Nearest neighbours lie above", { exact: false }),
  ).toBeVisible();
  await audit(page);
});
test("independent practice includes retained lattice slice and written causal explanation without automatic correctness", async ({
  page,
}, info) => {
  await page.goto("/lessons/ionic-structures");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) await choose(page, i + 1);
    const q = journey.practice[i];
    if (q.rubric)
      await page.getByLabel("Your explanation", { exact: true }).fill(q.answer);
    else await page.getByRole("radio", { name: q.answer, exact: true }).check();
    await page
      .getByRole("button", {
        name: q.rubric ? "Save and review explanation" : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      q.rubric ? "Compare your explanation" : "That’s right",
    );
    if (i === 0) {
      await expect(page.locator(".question-panel svg circle")).toHaveCount(16);
      await audit(page);
      await capture(
        page,
        `test-results/qa/ionic-structures/ionic-structures-${info.project.name}-slice.png`,
      );
    }
    if (q.rubric) {
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) => {
              const data = JSON.parse(localStorage.getItem(key)!);
              return data.work["ionic-structures"].attempts[id]?.at(-1)
                ?.correct;
            },
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
      await audit(page);
      await capture(
        page,
        `test-results/qa/ionic-structures/ionic-structures-${info.project.name}-explanation.png`,
      );
    }
  }
});
test("cold checks defer feedback and separate retrieval waits for the real seven-day delay", async ({
  page,
}) => {
  await page.goto("/lessons/ionic-structures");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 4; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await page
      .getByRole("radio", {
        name: journey.checkForms[0][i].answer,
        exact: true,
      })
      .check();
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
    page.getByRole("heading", { name: "4 of 4 correct", exact: true }),
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
      data.work["ionic-structures"].history[0].submitted =
        Date.now() - delay - 1000;
      data.work["ionic-structures"].run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  for (let i = 0; i < 2; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await page
      .getByRole("radio", {
        name: journey.reviewForms[0][i].answer,
        exact: true,
      })
      .check();
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
