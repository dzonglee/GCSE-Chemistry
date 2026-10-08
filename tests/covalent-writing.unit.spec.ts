import { test, expect } from "@playwright/test";
import { covalentBondingJourney as journey } from "../src/content/journeys/covalent-bonding";
import { covalentWritingAdditions as added } from "../src/content/journeys/covalent-writing";
import { covalentMolecules } from "../src/lib/covalent";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  exposureIds,
  decode,
  emptyProgress,
  emptyWork,
} from "../src/lib/progress";
test("all eight AQA electron molecules now have reserved construction while original identities and positions remain", () => {
  expect(journey.version).toBe(1);
  expect(tasks(journey)).toHaveLength(61);
  expect(
    journey.practice.slice(0, 9).map((q) => q.drawCovalent!.molecule),
  ).toEqual(["H2", "Cl2", "HCl", "O2", "N2", "H2O", "NH3", "CH4", "CO2"]);
  expect(journey.practice[14].id).toBe("cb-v1-p-explain");
  expect(journey.checkForms[0][0].id).toBe("cb-v1-ca-hcl");
  expect(journey.reviewForms[1][0].id).toBe("cb-v1-rb-chlorine");
  const reserved = [
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  expect(
    new Set(
      reserved
        .filter((q) => q.drawCovalent)
        .map((q) => q.drawCovalent!.molecule),
    ),
  ).toEqual(new Set(["H2", "Cl2", "HCl", "O2", "N2", "H2O", "NH3", "CH4"]));
  const grouped = journey.practiceGroups!.flatMap((g) => g.taskIds);
  expect(grouped).toHaveLength(17);
  expect(new Set(grouped)).toEqual(new Set(journey.practice.map((q) => q.id)));
  const p = emptyProgress();
  p.work["covalent-bonding"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 14 },
    drafts: {
      [added.check[2].id]: "Positive nuclei attract one another. 1..2",
    },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("full writing is manual while independently entered line counts conserve the selected connectivity", () => {
  for (const q of [...added.practice, ...added.check, ...added.review]) {
    if (q.rubric) {
      expect(mark(q, q.answer).correct).toBe(false);
      expect(mark(q, "Sharing makes electrons and rods. 1..2").correct).toBe(
        false,
      );
    }
    if (q.molecularLineDrawing) {
      const spec = covalentMolecules[q.molecularLineDrawing.molecule];
      expect(q.parts!.map((p) => p.answer)).toEqual([...spec.orders]);
      expect(q.parts).toHaveLength(spec.partners.length);
      expect(mark(q, q.answer).correct).toBe(true);
      const bad = JSON.parse(q.answer);
      bad.bond0 = "1..2";
      expect(mark(q, JSON.stringify(bad)).correct).toBe(false);
      bad.bond0 = "0";
      expect(mark(q, JSON.stringify(bad)).correct).toBe(false);
      expect(mark(q, "").correct).toBe(false);
    }
  }
});
test("helped drawing equivalents and force criteria are not relabelled fresh", () => {
  expect(exposureIds(["cb-v1-p-ammonia"])).toContain(added.check[0].id);
  expect(exposureIds([added.check[0].id])).toContain("cb-v1-p-ammonia");
  expect(exposureIds(["cb-v1-p-methane"])).toContain(added.check[1].id);
  expect(exposureIds(["cb-v1-r-strong"])).toContain(added.check[2].id);
  expect(exposureIds(["cb-v1-p-explain"])).toContain(added.review[2].id);
  for (const q of [...added.practice, ...added.check, ...added.review])
    for (const alias of q.exposureAliases ?? [])
      expect(
        tasks(journey).find((t) => t.id === alias)?.exposureAliases,
      ).toContain(q.id);
});
