import { test, expect } from "@playwright/test";
import { potableEvidence } from "../src/lib/potable-evidence";
import { waterRecords } from "../src/lib/water";

test("native water readouts expose raw quantities and conditions, not constructed answers", () => {
  expect(potableEvidence(waterRecords.dish10, "residue")).toBe(
    "Sample 10 cm³; empty dish 32.46 g; dish + dry cooled stable nonvolatile residue 32.51 g.",
  );
  expect(potableEvidence(waterRecords.mem100, "membrane")).toBe(
    "Ideal feed 100 litres with 3000 g salt; product 40 litres. No volume loss; complete salt rejection.",
  );
  expect(potableEvidence(waterRecords.fresh, "treatment")).toContain(
    "Suspended grit and harmful microbes",
  );
  expect(potableEvidence(waterRecords.fresh, "treatment")).toContain(
    "filter beds, then chlorine",
  );
  expect(potableEvidence(waterRecords.coast, "resources")).toContain("2 m³");
  expect(potableEvidence(waterRecords.repeat50, "repeat")).toContain(
    "each sample 50 cm³",
  );
});
test("formatting preserves all26 original records and cannot read learner or expected solutions", () => {
  const before = JSON.stringify(waterRecords);
  for (const r of Object.values(waterRecords)) {
    const result = potableEvidence(r, r.mode);
    expect(result.length).toBeGreaterThan(0);
    expect(
      potableEvidence(
        { ...r, expected: { forged: "999999" } } as typeof r,
        r.mode,
      ),
    ).toBe(result);
  }
  expect(JSON.stringify(waterRecords)).toBe(before);
});
