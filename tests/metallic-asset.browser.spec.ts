import { test, expect } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
test("real metal GLB has conserved charge, three layers and independent depth; keyboard rotation and saved displacement work", async ({
  page,
}, info) => {
  await mkdir("test-results/qa/metallic-writing", { recursive: true });
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/lessons/structure-and-properties");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  await page
    .getByRole("button", { name: "Displace the top layer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Inspect layers in 3D", exact: true })
    .click();
  const host = page.getByRole("group", {
    name: "Rotate metallic layers",
    exact: true,
  });
  await expect(host).toHaveAttribute("data-ready", "true");
  expect((await host.boundingBox())!.width).toBeGreaterThanOrEqual(200);
  await host.focus();
  await page.keyboard.press("ArrowRight");
  await expect(host).toHaveAttribute("data-rotation", "-0.30000000000000004");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download metal model as GLB", exact: true })
    .click();
  const download = await downloadPromise;
  const path = `test-results/qa/metallic-writing/${info.project.name}-metal.glb`;
  await download.saveAs(path);
  const bytes = await readFile(path);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(4)).toBe(2);
  const length = bytes.readUInt32LE(12),
    json = JSON.parse(bytes.subarray(20, 20 + length).toString());
  const cores = json.nodes.filter(
      (n: { extras?: { kind?: string } }) => n.extras?.kind === "positive-core",
    ),
    electrons = json.nodes.filter(
      (n: { extras?: { kind?: string } }) =>
        n.extras?.kind === "delocalised-electron",
    );
  const position = (node: { translation?: number[]; matrix?: number[] }) =>
    node.translation ?? node.matrix!.slice(12, 15);
  expect(cores).toHaveLength(12);
  expect(electrons).toHaveLength(12);
  expect(
    [...cores, ...electrons].reduce(
      (s: number, n: { extras: { charge: number } }) => s + n.extras.charge,
      0,
    ),
  ).toBe(0);
  expect(
    new Set(cores.map((n: { translation: number[] }) => position(n)[2])).size,
  ).toBe(2);
  for (const layer of [0, 1, 2])
    expect(
      cores.filter(
        (n: { extras: { layer: number } }) => n.extras.layer === layer,
      ),
    ).toHaveLength(4);
  expect(
    position(cores.find((n: { name: string }) => n.name === "core-0")),
  ).toEqual([-0.56, 0.9, -0.68]);
  const binStart = 20 + length + 8;
  for (const mesh of json.meshes)
    for (const primitive of mesh.primitives) {
      const a = json.accessors[primitive.attributes.POSITION],
        v = json.bufferViews[a.bufferView];
      expect(a.componentType).toBe(5126);
      expect(a.type).toBe("VEC3");
      for (let i = 0; i < a.count * 3; i++)
        expect(
          Number.isFinite(
            bytes.readFloatLE(
              binStart + (v.byteOffset ?? 0) + (a.byteOffset ?? 0) + i * 4,
            ),
          ),
        ).toBe(true);
    }
  await page.screenshot({
    path: `test-results/qa/metallic-writing/${info.project.name}-layers-3d.png`,
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.reload();
  await expect(page.locator('[data-metal-core="0"] circle')).toHaveAttribute(
    "cx",
    "75",
  );
  await page.getByRole("button", { name: "Task 4", exact: true }).click();
  await page
    .getByLabel("Inspect pure metal or alloy", { exact: true })
    .selectOption("alloy");
  await page
    .getByRole("button", { name: "Inspect layers in 3D", exact: true })
    .click();
  await expect(host).toHaveAttribute("data-ready", "true");
  const dp = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download metal model as GLB", exact: true })
    .click();
  const d = await dp;
  await d.saveAs(path.replace("metal.glb", "alloy.glb"));
  const ab = await readFile(path.replace("metal.glb", "alloy.glb"));
  const aj = JSON.parse(ab.subarray(20, 20 + ab.readUInt32LE(12)).toString());
  expect(
    aj.nodes.filter(
      (n: { extras?: { species?: string } }) => n.extras?.species === "X",
    ),
  ).toHaveLength(3);
  await page.screenshot({
    path: `test-results/qa/metallic-writing/${info.project.name}-alloy-3d.png`,
    fullPage: true,
  });
});
test("unavailable WebGL retains labelled metal interpretation and prediction", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).startsWith("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto("/lessons/structure-and-properties");
  await page
    .getByLabel("Particles that attract in metallic bonding", { exact: true })
    .selectOption("core-core");
  await page
    .getByRole("button", { name: "Inspect layers in 3D", exact: true })
    .click();
  await expect(
    page.getByText(
      "3D is unavailable. Use the labelled 2D metal diagram and particle count below.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator(".metallic-diagram svg")).toHaveAttribute(
    "data-core-count",
    "12",
  );
  await expect(
    page.getByLabel("Particles that attract in metallic bonding", {
      exact: true,
    }),
  ).toHaveValue("core-core");
});
