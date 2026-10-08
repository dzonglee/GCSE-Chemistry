import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile } from "node:fs/promises";
import { covalentBondingJourney as journey } from "../src/content/journeys/covalent-bonding";
import { covalentMolecules, type CovalentMolecule } from "../src/lib/covalent";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function answer(page: Page, q: Question) {
  if (q.parts)
    for (const part of q.parts)
      await page
        .getByLabel(part.label, { exact: true })
        .fill(String(part.answer));
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(q.answer);
}
async function audit(page: Page) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
async function capture(page: Page, path: string) {
  await mkdir("test-results/qa/covalent-bonding", { recursive: true });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function build(page: Page, molecule: CovalentMolecule) {
  const spec = covalentMolecules[molecule];
  for (let i = 0; i < spec.partners.length; i++)
    for (let n = 0; n < spec.orders[i]; n++) {
      await page
        .getByRole("button", {
          name: `Move one centre ${spec.centre.symbol} electron into bond ${i + 1}`,
          exact: true,
        })
        .click();
      await page
        .getByRole("button", {
          name: `Move one partner ${spec.partners[i].symbol} electron into bond ${i + 1}`,
          exact: true,
        })
        .click();
    }
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".covalent-workbench [role=status]")).toHaveClass(
    /correct/,
  );
}
test("diatomic sharing keeps every outer electron, diagnoses an incomplete pair and same-origin chlorine, and preserves native operations", async ({
  page,
}, info) => {
  await page.goto("/lessons/covalent-bonding");
  const move = page.getByRole("button", {
      name: "Move one centre H electron into bond 1",
      exact: true,
    }),
    box = await move.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await move.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".covalent-workbench [role=status]"),
  ).not.toHaveClass(/correct/);
  await expect(page.locator(".covalent-inventory")).toHaveAttribute(
    "data-total-electrons",
    "2",
  );
  await saved(page);
  await page.reload();
  await expect(move).toBeDisabled();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(move).toBeEnabled();
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await build(page, "H2");
  for (const [task, molecule, total] of [
    [2, "Cl2", 14],
    [3, "HCl", 8],
    [4, "O2", 12],
    [5, "N2", 10],
  ] as const) {
    await page
      .getByRole("button", { name: `Task ${task}`, exact: true })
      .first()
      .click();
    if (molecule === "Cl2") {
      const donor = page.getByRole("button", {
        name: "Move one centre Cl electron into bond 1",
        exact: true,
      });
      await donor.click();
      await donor.click();
      await page
        .getByRole("button", { name: "Check model", exact: true })
        .click();
      await expect(
        page.locator(".covalent-workbench [role=status]"),
      ).not.toHaveClass(/correct/);
      await expect(page.locator(".covalent-diagram")).toHaveAttribute(
        "data-electrons",
        "14",
      );
      await saved(page);
      await page.reload();
      await expect(
        page.locator(".covalent-diagram svg [data-electron-origin=reference]"),
      ).toHaveCount(7);
      await page
        .getByRole("button", { name: "Reset model", exact: true })
        .click();
    }
    await build(page, molecule);
    await expect(page.locator(".covalent-inventory")).toHaveAttribute(
      "data-total-electrons",
      String(total),
    );
    await expect(
      page.locator(".covalent-diagram svg [data-electron-origin]"),
    ).toHaveCount(total);
    await audit(page);
    await capture(
      page,
      `test-results/qa/covalent-bonding/covalent-bonding-${info.project.name}-${molecule}.png`,
    );
  }
});
test("water ammonia methane and carbon dioxide distribute electrons into separate bonds and retain lone electrons", async ({
  page,
}, info) => {
  await page.goto("/lessons/covalent-bonding");
  for (const [task, molecule, total] of [
    [6, "H2O", 8],
    [7, "NH3", 8],
    [8, "CH4", 8],
    [9, "CO2", 16],
  ] as const) {
    await page
      .getByRole("button", { name: `Task ${task}`, exact: true })
      .first()
      .click();
    await build(page, molecule);
    await expect(page.locator(".covalent-diagram")).toHaveAttribute(
      "data-electrons",
      String(total),
    );
    await expect(
      page.locator(".covalent-diagram svg [data-electron-origin]"),
    ).toHaveCount(total);
    await audit(page);
    await capture(
      page,
      `test-results/qa/covalent-bonding/covalent-bonding-${info.project.name}-${molecule}.png`,
    );
  }
});
test("formed methane has a real rotating tetrahedral asset and GLB with independently verified atom geometry and bonds", async ({
  page,
}, info) => {
  await page.goto("/lessons/covalent-bonding");
  await page
    .getByRole("button", { name: "Task 8", exact: true })
    .first()
    .click();
  await build(page, "CH4");
  await page
    .getByRole("button", { name: "Inspect 3D molecule", exact: true })
    .click();
  const scene = page.getByRole("group", {
    name: "Rotate covalent molecule",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  await expect(scene).toHaveAttribute("data-atoms", "5");
  await expect(scene).toHaveAttribute("data-bond-pairs", "4");
  const old = await scene.getAttribute("data-rotation");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).not.toHaveAttribute("data-rotation", old!);
  const waiting = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download molecule as GLB", exact: true })
    .click();
  await mkdir("test-results/qa/covalent-bonding", { recursive: true });
  const download = await waiting,
    path = `test-results/qa/covalent-bonding/methane-covalent-${info.project.name}.glb`;
  await download.saveAs(path);
  const binary = await readFile(path);
  expect(binary.readUInt32LE(0)).toBe(0x46546c67);
  expect(binary.readUInt32LE(4)).toBe(2);
  expect(binary.readUInt32LE(8)).toBe(binary.length);
  const json = JSON.parse(
    binary.subarray(20, 20 + binary.readUInt32LE(12)).toString(),
  );
  const atoms = json.nodes.filter((n: { name?: string }) =>
    /^atom-\d-[A-Za-z]+$/.test(n.name ?? ""),
  );
  expect(atoms).toHaveLength(5);
  expect(
    atoms.filter(
      (n: { extras: { element: string } }) => n.extras.element === "H",
    ),
  ).toHaveLength(4);
  expect(
    atoms.filter(
      (n: { extras: { element: string } }) => n.extras.element === "C",
    ),
  ).toHaveLength(1);
  expect(
    json.nodes.filter((n: { name?: string }) =>
      /^bond-\d-pair-\d$/.test(n.name ?? ""),
    ),
  ).toHaveLength(4);
  const positions = atoms
    .filter((n: { extras: { element: string } }) => n.extras.element === "H")
    .map(
      (n: { translation?: number[]; matrix?: number[] }) =>
        n.translation ?? n.matrix?.slice(12, 15) ?? [0, 0, 0],
    );
  const [a, b, c] = positions;
  const determinant =
    a[0] * (b[1] * c[2] - b[2] * c[1]) -
    a[1] * (b[0] * c[2] - b[2] * c[0]) +
    a[2] * (b[0] * c[1] - b[1] * c[0]);
  expect(Math.abs(determinant)).toBeGreaterThan(1);
  await audit(page);
  await capture(
    page,
    `test-results/qa/covalent-bonding/covalent-bonding-${info.project.name}-methane-3d.png`,
  );
  await page
    .getByRole("button", { name: "Use 2D projection", exact: true })
    .click();
  await expect(page.locator(".covalent-asset svg circle")).toHaveCount(5);
});
test("unavailable WebGL preserves the completed outer diagram and proper projected multiple-bond representation", async ({
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
  await page.goto("/lessons/covalent-bonding");
  await page
    .getByRole("button", { name: "Task 5", exact: true })
    .first()
    .click();
  await build(page, "N2");
  await page
    .getByRole("button", { name: "Inspect 3D molecule", exact: true })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".covalent-asset svg line")).toHaveCount(3);
  await expect(
    page.locator(".covalent-workbench > .covalent-diagram"),
  ).toHaveAttribute("data-electrons", "10");
  await audit(page);
});
test("independent construction keeps a conserved wrong origin diagram and all nine practice drawings require complete outer counts", async ({
  page,
}, info) => {
  await page.goto("/lessons/covalent-bonding");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (
      i &&
      (await page
        .getByLabel("Choose a practice task", { exact: true })
        .isVisible())
    )
      await page
        .getByLabel("Choose a practice task", { exact: true })
        .selectOption(String(i));
    else if (i)
      await page
        .getByRole("button", { name: `Task ${i + 1}`, exact: true })
        .first()
        .click();
    const q = journey.practice[i];
    await answer(page, q);
    if (i === 1) {
      for (const [key, value] of Object.entries({
        centre0: "2",
        partner0: "0",
        unsharedCentre: "5",
        unsharedPartner0: "7",
      })) {
        const label = q.parts!.find((p) => p.id === key)!.label;
        await page.getByLabel(label, { exact: true }).fill(value);
      }
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(
        page.locator(".question-panel [role=status]"),
      ).not.toHaveClass(/correct/);
      await expect(
        page.locator(".question-panel .covalent-diagram"),
      ).toHaveAttribute("data-electrons", "14");
      await saved(page);
      await page.reload();
      await expect(
        page.getByLabel(q.parts!.find((p) => p.id === "centre0")!.label, {
          exact: true,
        }),
      ).toHaveValue("2");
      await answer(page, q);
    }
    await page
      .getByRole("button", {
        name: q.rubric ? "Save and review explanation" : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      q.rubric ? "Compare your explanation" : "That’s right",
    );
    if (i === 5 || i === 7 || i === 10 || q.rubric) {
      await audit(page);
      await capture(
        page,
        `test-results/qa/covalent-bonding/covalent-bonding-${info.project.name}-${i === 5 ? "independent-water" : i === 7 ? "independent-methane" : i === 10 ? "missing-lone-pair" : "explanation"}.png`,
      );
    }
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "covalent-bonding"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
  }
});
test("reserved independent electron diagrams defer feedback and distinct three-item reviews unlock after a real seven days", async ({
  page,
}) => {
  await page.goto("/lessons/covalent-bonding");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 5; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(page, journey.checkForms[0][i]);
    await expect(page.locator(".covalent-workbench")).toHaveCount(0);
    if (i === 0) {
      await saved(page);
      await page.reload();
      await expect(
        page.getByLabel(journey.checkForms[0][0].parts![0].label, {
          exact: true,
        }),
      ).toHaveValue("6");
    }
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(
      0,
    );
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "5 of 5 correct", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const data = JSON.parse(localStorage.getItem(key)!);
      data.work["covalent-bonding"].history[0].submitted =
        Date.now() - delay - 1000;
      data.work["covalent-bonding"].run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(data));
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
