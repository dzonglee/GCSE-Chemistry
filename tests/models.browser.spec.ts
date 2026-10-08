import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("reviewed ionic conductivity retains wrong solid predictions and saved mobile-carrier explanations", async ({
  page,
}) => {
  await page.goto("/lessons/ionic-structures");
  await page
    .getByRole("button", { name: "Task 2", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Your conductivity prediction", { exact: true })
    .selectOption("yes");
  await page
    .getByLabel("Your particle explanation", { exact: true })
    .selectOption("fixed");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".ionic-structure [role=status]")).not.toHaveClass(
    /correct/,
  );
  await page
    .getByRole("button", { name: "Task 3", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Your conductivity prediction", { exact: true })
    .selectOption("yes");
  await page
    .getByLabel("Your particle explanation", { exact: true })
    .selectOption("mobile");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".ionic-structure [role=status]")).toHaveClass(
    /correct/,
  );
  await page.reload();
  await expect(
    page.getByLabel("Your conductivity prediction", { exact: true }),
  ).toHaveValue("yes");
  await expect(
    page.getByLabel("Your particle explanation", { exact: true }),
  ).toHaveValue("mobile");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("quantity model uses unit conversion rather than raw cm³ division", async ({
  page,
}) => {
  await page.goto("/lessons/conservation-and-concentration");
  const mass = page.getByLabel("Dissolved solute mass", { exact: true });
  await mass.focus();
  await page.keyboard.press("ArrowDown");
  await expect(mass).toHaveValue("10");
  await page
    .getByLabel("Final solution volume", { exact: true })
    .selectOption("500");
  await page
    .getByLabel("Your converted solution volume", { exact: true })
    .selectOption("0.5");
  await page
    .getByLabel("Your concentration", { exact: true })
    .selectOption("0.02");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".concentration-workbench .feedback[role=status]"),
  ).toHaveClass(/retry/);
  await page
    .getByLabel("Your concentration", { exact: true })
    .selectOption("20");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".concentration-workbench .feedback[role=status]"),
  ).toHaveClass(/correct/);
  await expect(
    page.locator(".concentration-workbench .feedback[role=status]"),
  ).toContainText("20 g/dm³");
});
test("pH changes retain keyboard controls and explicit tenfold concentration reasoning", async ({
  page,
}) => {
  await page.goto("/lessons/ph-and-strong-acids");
  await page
    .getByRole("button", { name: "Task 2", exact: true })
    .first()
    .click();
  const lower = page.getByRole("button", {
    name: "Lower chosen pH by 1",
    exact: true,
  });
  await lower.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(page.locator(".model-readout")).toContainText(
    "Your chosen pH: 2",
  );
  await expect(
    page.locator(".acid-factor-table tr[data-chosen=true]"),
  ).toContainText("10 × 10 times");
  await page
    .getByLabel("Your H+ concentration direction", { exact: true })
    .selectOption("increases");
  await page
    .getByLabel("Your H+ concentration change factor", { exact: true })
    .selectOption("2");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".acid-strength-workbench .feedback[role=status]"),
  ).toHaveClass(/retry/);
  await page
    .getByLabel("Your H+ concentration change factor", { exact: true })
    .selectOption("100");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".acid-strength-workbench .feedback[role=status]"),
  ).toHaveClass(/correct/);
  await page
    .getByLabel("Explore supplied acid evidence", { exact: true })
    .selectOption("riseThree");
  const raise = page.getByRole("button", {
    name: "Raise chosen pH by 1",
    exact: true,
  });
  await raise.focus();
  for (let i = 0; i < 3; i++) await page.keyboard.press("Space");
  await expect(page.locator(".model-readout")).toContainText(
    "Your chosen pH: 5",
  );
  await expect(
    page.locator(".acid-factor-table tr[data-chosen=true]"),
  ).toContainText("1 / (10 × 10 × 10)");
  await page
    .getByLabel("Your H+ concentration direction", { exact: true })
    .selectOption("decreases");
  await page
    .getByLabel("Your H+ concentration change factor", { exact: true })
    .selectOption("1000");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".acid-strength-workbench .feedback[role=status]"),
  ).toHaveClass(/correct/);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("catalyst changes the energy barrier but preserves the overall energy difference", async ({
  page,
}) => {
  await page.goto("/lessons/reaction-profiles");
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await page
    .getByRole("button", { name: "Task 4", exact: true })
    .first()
    .click();
  const diagram = page.locator(".profile-workbench svg[data-alternative-peak]");
  await expect(diagram).toHaveAttribute("data-reactant", "20");
  await expect(diagram).toHaveAttribute("data-product", "55");
  await expect(diagram).toHaveAttribute("data-peak", "90");
  await expect(diagram).toHaveAttribute("data-alternative-peak", "90");
  for (let i = 0; i < 4; i++)
    await page
      .getByRole("button", {
        name: "Decrease Proposed peak energy level",
        exact: true,
      })
      .click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".profile-workbench .feedback[role=status]"),
  ).toHaveClass(/correct/);
  await expect(diagram).toHaveAttribute("data-alternative-peak", "70");
  await expect(diagram).toHaveAttribute("data-alternative-reactant", "20");
  await expect(diagram).toHaveAttribute("data-alternative-product", "55");
  const levels = await diagram.evaluate((n) => ({
    originalBarrier:
      Number(n.getAttribute("data-peak")) -
      Number(n.getAttribute("data-reactant")),
    alternativeBarrier:
      Number(n.getAttribute("data-alternative-peak")) -
      Number(n.getAttribute("data-alternative-reactant")),
    overall:
      Number(n.getAttribute("data-product")) -
      Number(n.getAttribute("data-reactant")),
    alternativeOverall:
      Number(n.getAttribute("data-alternative-product")) -
      Number(n.getAttribute("data-alternative-reactant")),
  }));
  expect(levels).toEqual({
    originalBarrier: 70,
    alternativeBarrier: 50,
    overall: 35,
    alternativeOverall: 35,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("reviewed collision comparisons distinguish density from energy and reset reference states", async ({
  page,
}) => {
  await page.goto("/lessons/collision-theory");
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await page
    .getByRole("button", { name: "Task 2", exact: true })
    .first()
    .click();
  const model = page.locator(".collision-workbench");
  await model
    .getByLabel("Reacting-particle symbols", { exact: true })
    .selectOption("24");
  await model
    .getByLabel("Your reacting density / symbols per unit", { exact: true })
    .fill("12");
  await model
    .getByLabel("Your density comparison", { exact: true })
    .selectOption("more");
  await model
    .getByLabel("Your average kinetic-energy comparison", { exact: true })
    .selectOption("higher");
  await model.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(model.locator(".feedback[role=status]")).toHaveClass(/retry/);
  await model
    .getByLabel("Your average kinetic-energy comparison", { exact: true })
    .selectOption("unchanged");
  await model.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(model.locator(".feedback[role=status]")).toHaveClass(/correct/);
  await expect(model.locator(".feedback[role=status]")).toContainText(
    "temperature",
  );
  await model.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    model.getByLabel("Reacting-particle symbols", { exact: true }),
  ).toHaveValue("12");
  await expect(
    model.getByLabel("Occupied volume / schematic units", { exact: true }),
  ).toHaveValue("2");
  await model.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(model.locator(".feedback[role=status]")).toHaveClass(/retry/);
  await page
    .getByRole("button", { name: "Task 1", exact: true })
    .first()
    .click();
  await model
    .getByLabel("Collision energy / stated units", { exact: true })
    .fill("30");
  await model
    .getByLabel("Your reaction prediction", { exact: true })
    .selectOption("yes");
  await model.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(model.locator(".feedback[role=status]")).toHaveClass(/correct/);
  await model.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    model.getByLabel("Collision energy / stated units", { exact: true }),
  ).toHaveValue("20");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("equilibrium directions use stoichiometry and do not combine opposing changes into a fake yield", async ({
  page,
}) => {
  await page.goto("/lessons/changing-equilibrium");
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await page
    .getByRole("button", { name: "Task 5", exact: true })
    .first()
    .click();
  const root = page.getByRole("region", { name: "Task model", exact: true });
  await root
    .getByLabel("Pressure effect considered alone", { exact: true })
    .selectOption("forward");
  await root
    .getByLabel("Temperature effect considered alone", { exact: true })
    .selectOption("reverse");
  await root
    .getByLabel("Overall change supported by the supplied information", {
      exact: true,
    })
    .selectOption("forward");
  await root
    .getByLabel("How do these effects combine?", { exact: true })
    .selectOption("oppose");
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".feedback")).toHaveClass(/retry/);
  await root
    .getByLabel("Overall change supported by the supplied information", {
      exact: true,
    })
    .selectOption("insufficient");
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".feedback")).toHaveClass(/correct/);
  await expect(root.locator(".feedback")).toContainText("additional evidence");
  await root
    .getByText("Choose another supplied comparison", { exact: true })
    .click();
  await root
    .getByLabel("Supplied comparison", { exact: true })
    .selectOption("equalGas");
  await root
    .getByText("Choose another supplied comparison", { exact: true })
    .click();
  await root
    .getByLabel("Pressure effect considered alone", { exact: true })
    .selectOption("unchanged");
  await root
    .getByLabel("Temperature effect considered alone", { exact: true })
    .selectOption("forward");
  await root
    .getByLabel("Overall change supported by the supplied information", {
      exact: true,
    })
    .selectOption("forward");
  await root
    .getByLabel("How do these effects combine?", { exact: true })
    .selectOption("pressureNeutral");
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".feedback")).toHaveClass(/correct/);
});
test("alkane structures conserve representative first-four formulas", async ({
  page,
}) => {
  await page.goto("/lessons/alkanes-and-combustion");
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await page
    .getByRole("button", { name: "Task 2", exact: true })
    .first()
    .click();
  const root = page.getByRole("region", { name: "Task model" });
  await root.locator("details summary").click();
  for (const [record, carbon, hydrogen, next] of [
    ["methane", "1", "4", "6"],
    ["ethane", "2", "6", "8"],
    ["propane", "3", "8", "10"],
    ["initial", "4", "10", "12"],
  ]) {
    await root
      .getByLabel("Supplied comparison", { exact: true })
      .selectOption(record);
    await root.locator('[id$="-n"]').fill(carbon);
    await root.locator('[id$="-twice"]').fill(String(Number(carbon) * 2));
    await root.locator('[id$="-hydrogens"]').fill(hydrogen);
    await root.locator('[id$="-nextHydrogens"]').fill(next);
    await root.locator('[id$="-difference"]').fill("2");
    await root
      .locator('[id$="-name"]')
      .selectOption(record === "initial" ? "butane" : record);
    await root
      .getByRole("button", { name: "Check model", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/correct/);
  }
});
test("gas-test proposals provide chemistry feedback, retry and scoped clear", async ({
  page,
}) => {
  await page.goto("/lessons/gas-tests");
  const root = page.locator(".gas-tests-workbench"),
    material = root.locator('[data-field="material"]'),
    placement = root.locator('[data-field="placement"]');
  await material.selectOption("glowingSplint");
  await placement.selectOption("mouth");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".gas-feedback")).toHaveClass(/gas-reconsider/);
  await expect(material).toHaveValue("glowingSplint");
  await material.selectOption("burningSplint");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".gas-feedback")).toHaveClass(/gas-correct/);
  await expect(root.locator(".gas-feedback")).toContainText("pop");
  await root
    .getByRole("button", { name: "Clear proposal", exact: true })
    .click();
  await expect(material).toHaveValue("");
  await expect(placement).toHaveValue("");
});
