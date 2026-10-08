import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("the real 3D asset rotates, updates every particle, exports and survives reload", async ({
  page,
}, info) => {
  await page.goto("/lessons/inside-an-atom");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  const host = page.getByRole("group", {
    name: "Rotate the 3D atom",
    exact: true,
  });
  await expect(page.locator(".atom-scene")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(host.locator("canvas")).toHaveCount(1);
  await expect(host).toHaveAttribute("data-particles", "13,13,13");
  const rotation = await host.getAttribute("data-rotation");
  await host.focus();
  await page.keyboard.press("ArrowRight");
  await expect(host).not.toHaveAttribute("data-rotation", rotation!);
  await page.keyboard.press("Home");
  await expect(host).toHaveAttribute("data-rotation", rotation!);
  const bounds = await host.boundingBox();
  await page.mouse.move(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds!.x + bounds!.width / 2 + 45,
    bounds!.y + bounds!.height / 2 + 10,
    { steps: 4 },
  );
  await page.mouse.up();
  await expect(host).not.toHaveAttribute("data-rotation", rotation!);
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await page.getByRole("button", { name: "Add neutron", exact: true }).click();
  await expect(host).toHaveAttribute("data-particles", "13,14,13");
  await page.getByRole("button", { name: "Add electron", exact: true }).click();
  await expect(host).toHaveAttribute("data-particles", "13,14,14");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(host).toHaveAttribute("data-particles", "13,14,13");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await page.getByLabel("Your answer", { exact: true }).fill("14");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: `docs/qa/inside-an-atom-${info.project.name}-3d.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Focus on nucleus", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Focus on nucleus", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator(".atom-scene").screenshot({
    path: `docs/qa/inside-an-atom-${info.project.name}-3d-nucleus.png`,
  });
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await page.getByText("Use this 3D asset", { exact: true }).click();
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download 3D model (.glb)", exact: true })
    .click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("atom-13p-14n-13e.glb");
  const assetPath = info.outputPath("aluminium-27.glb");
  await download.saveAs(assetPath);
  const asset = await readFile(assetPath);
  // Inspect the GLB container and independently count exported mesh nodes.
  expect(asset.toString("ascii", 0, 4)).toBe("glTF");
  expect(asset.readUInt32LE(4)).toBe(2);
  expect(asset.readUInt32LE(8)).toBe(asset.length);
  expect(asset.readUInt32LE(16)).toBe(0x4e4f534a);
  const json = JSON.parse(
    asset.toString("utf8", 20, 20 + asset.readUInt32LE(12)),
  );
  const nodes = json.nodes as {
    name?: string;
    mesh?: number;
    translation?: number[];
  }[];
  for (const [kind, count] of [
    ["proton", 13],
    ["neutron", 14],
    ["electron", 13],
  ] as const)
    expect(
      nodes.filter(
        (node) => node.mesh !== undefined && node.name?.startsWith(kind + "_"),
      ),
    ).toHaveLength(count);
  expect(
    nodes.some(
      (node) =>
        node.name?.startsWith("proton_") &&
        Math.abs(node.translation?.[2] ?? 0) > 0.1,
    ),
  ).toBe(true);
  if (info.project.name === "desktop")
    await download.saveAs("docs/qa/inside-an-atom-aluminium-27.glb");
  await page.reload();
  await expect(page.locator(".atom-scene")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(host).toHaveAttribute("data-particles", "13,14,13");
  await page
    .getByRole("button", { name: "Use 2D diagram", exact: true })
    .click();
  await expect(host).toBeHidden();
  await expect(page.locator(".atom-scene-fallback svg")).toBeVisible();
  await page.getByRole("button", { name: "Show 3D", exact: true }).click();
  await expect(host).toBeVisible();
  await expect(host.locator("canvas")).toHaveCount(1);
});

test("lack of WebGL preserves the diagram, meaningful controls and feedback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const prototype = HTMLCanvasElement.prototype;
    const original = prototype.getContext;
    prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (kind.startsWith("webgl")) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.goto("/lessons/inside-an-atom");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  await expect(
    page.getByText("3D is unavailable in this browser.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".atom-scene-fallback svg")).toBeVisible();
  await page.getByRole("button", { name: "Add neutron", exact: true }).click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "13 protons, 14 neutrons and 13 electrons",
  );
});
