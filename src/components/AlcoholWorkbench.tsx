"use client";
import { useId, useState, type ReactNode } from "react";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import {
  alcoholRecords,
  organicStructures,
  organicReactions,
  alcoholCombustions,
  fermentationCases,
  fuelComparisons,
  fuelPlots,
  fuelPlotTolerance,
  organicFormula,
  type AlcoholMode,
} from "../lib/alcohols";
import {
  initialAlcoholBoard,
  validAlcoholBoard,
  alcoholHistoryStep,
  checkAlcoholBoard,
  organicProposal,
  alcoholAtomTotals,
  type AlcoholBoard,
} from "../lib/alcohol-board";
import { OrganicDisplayed, OrganicHydrogens } from "./OrganicDisplayed";
import { AlcoholScene3D } from "./AlcoholScene3D";
import { FuelApparatus } from "./FuelApparatus";
import { FuelPlotEditor, fuelCoordinate } from "./FuelPlotEditor";
const labels: Record<string, string> = {
  alcohol: "Alcohol",
  acid: "Carboxylic acid",
  alkane: "Alkane",
  chemical: "Chemical change",
  physical: "Physical change",
  OH: "Alcohol-type covalent –OH",
  COOH: "The whole carboxyl –COOH",
  CCdouble: "Carbon–carbon double bond",
  alkoxide: "Provided sodium alkoxide group",
  carboxylate: "Provided carboxylate salt group",
  ester: "Ester group",
  none: "None of the listed functional groups",
  notEstablished: "No gas identity is established by a reported gas test",
  hydrogen: "Hydrogen",
  carbonDioxide: "Carbon dioxide",
  carbonMonoxide: "Carbon monoxide",
  carbon: "Carbon",
  oxygen: "Oxygen",
  water: "Water",
  alkoxideAndHydrogen: "Provided sodium alkoxide and hydrogen",
  sameDissolvedAlcohol: "The same alcohol molecules mixed/dissolved in water",
  correspondingAcid: "The corresponding carboxylic acid",
  saltWaterCarbonDioxide: "Salt, water and carbon dioxide",
  esterAndWater: "Ester and water",
  alkeneAndWater: "Alkene and water",
  carbonDioxideAndWater: "Carbon dioxide and water",
  fermentation: "Fermentation",
  fractionalDistillation: "Fractional distillation",
  combustion: "Combustion",
  cracking: "Cracking",
  sugarSolution: "Aqueous sugar solution",
  ethanolWaterMixture: "Ethanol already mixed with water",
  pureEthanol: "Absolutely pure ethanol",
  enzymes: "Yeast provides active enzyme catalysts",
  damagedEnzymes: "The original report states damaged/denatured enzymes",
  absentEnzymes: "No supplied active fermentation enzymes",
  notRequiredForSeparation:
    "Not required as the basis of this physical separation",
  warm: "The supplied warm condition",
  slowerCold: "The supplied cold condition gives a slower reported rate",
  damagedHighHeat: "The supplied high heat damaged this preparation",
  vaporiseAndCondense:
    "Vaporise and condense using different boiling behaviour",
  alwaysBoiling: "Boiling is always the required fermentation condition",
  anaerobic: "Anaerobic conditions for the intended ethanol fermentation",
  oxygenRequired: "Oxygen is required for the intended ethanol fermentation",
  ethanolAndCarbonDioxide: "Ethanol and carbon dioxide",
  notDemonstrated: "Ethanol formation is not demonstrated in this report",
  sameMolecules: "Original ethanol/water molecule identities retained",
  enzymeCatalysis: "Enzymes catalyse the fermentation",
  lowerRate: "Lower temperature slows the reported process",
  enzymeDamage: "Reported enzyme damage prevents the process here",
  missingCatalyst: "The specified enzyme catalyst is absent",
  differentBoilingBehaviour:
    "The existing molecules have different boiling behaviour",
  createsAtoms: "The process creates new atoms",
  aqueousMixture: "An aqueous mixture containing ethanol",
  unreactedMixture: "An unreacted/damaged preparation, not proven ethanol",
  enrichedMixture: "An ethanol-enriched solution, not proved absolutely pure",
  suppliedEnergyPerGram: "The original supplied energy-per-gram value",
  temperatureIsEnergy: "Temperature in degrees is already energy in kJ",
  containerMass: "The total container mass is the consumed fuel mass",
  AgreaterPerGram: "A gives the greater observed rise per gram",
  BgreaterPerGram: "B gives the greater observed rise per gram",
  equalObservedResponse: "The observed rises per gram are equal",
  notComparableFromRiseAlone:
    "Raw rise per gram alone cannot establish an energy ranking here",
  observedNotTrueCombustionEnergy:
    "Matched observed response is not the true total combustion energy",
  unequalWaterMass:
    "Different heated-water masses limit the direct rise comparison",
  heatLossNotRemovedByRepeats:
    "Repeats do not automatically remove the stated systematic heat loss",
  guaranteedTrueEnergy:
    "The observations guarantee exact true combustion energies",
  increasesWithSmallerGains: "Increases, with smaller successive gains",
  approximatelyProportional:
    "Approximately proportional within the supplied data",
  decreases: "Decreases",
  constantObserved: "Constant observed response",
  extrapolatedEstimate: "An estimated value outside the original data range",
  interpolatedEstimate: "An estimated value within the original data range",
  measuredValue: "A directly reported measured value",
  universalConstant: "A universal constant for every real process",
};
function Totals({ before, after }: { before: number[]; after: number[] }) {
  return (
    <table className="organic-ledger">
      <caption>Your current C,H,O atom inventory</caption>
      <thead>
        <tr>
          <th>Element</th>
          <th>Before</th>
          <th>After</th>
        </tr>
      </thead>
      <tbody>
        {["C", "H", "O"].map((e, i) => (
          <tr key={e}>
            <th scope="row">{e}</th>
            <td>{before[i]}</td>
            <td>{after[i]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function ProposalBars({ a, b }: { a: string; b: string }) {
  const max = 25;
  return (
    <div className="fuel-normalized-bars">
      <p>Your proposed temperature rise per gram; common scale 0–{max} °C/g.</p>
      {[
        ["A", a],
        ["B", b],
      ].map(([name, raw]) => {
        const n = fuelCoordinate(raw);
        return (
          <div key={name}>
            <strong>
              {name}: {raw || "not entered"} °C/g
            </strong>
            <div className="fuel-bar-track">
              <span
                style={{
                  width:
                    n === null ? "0" : Math.min(100, (n / max) * 100) + "%",
                }}
              />
            </div>
            {n !== null && n > max && (
              <p>
                Proposal exceeds the printed common scale; its original value is
                retained.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
export function AlcoholWorkbench({
  mode,
  history,
  onChange,
  record: original = "initial",
  instruction,
}: {
  mode: AlcoholMode;
  history: AlcoholBoard[];
  onChange: (h: AlcoholBoard[]) => void;
  record?: string;
  instruction?: string;
}) {
  const uid = useId(),
    value = history.at(-1) ?? initialAlcoholBoard(mode, original),
    id = value.record,
    [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({}),
    [feedback, setFeedback] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    b = { ...value, ...raw },
    locked = history.length >= 500;
  function append(next: AlcoholBoard) {
    if (Object.keys(next).every((k) => next[k] === value[k])) return;
    if (
      !locked &&
      validAlcoholBoard(mode, next) &&
      alcoholHistoryStep(mode, value, next)
    )
      onChange([...history, next]);
  }
  function update(key: string, v: string, numeric = false) {
    if (v === value[key] && !Object.hasOwn(raw, key)) return;
    setFeedback(null);
    const next = { ...value, [key]: v };
    if (!(numeric && v === "") && validAlcoholBoard(mode, next)) {
      setRaw((old) =>
        Object.fromEntries(Object.entries(old).filter(([k]) => k !== key)),
      );
      append(next);
    } else setRaw((old) => ({ ...old, [key]: v }));
  }
  function field(key: string, label: string) {
    return (
      <div className="organic-field" key={key}>
        <label htmlFor={uid + "-" + key}>{label}</label>
        <input
          id={uid + "-" + key}
          inputMode={
            mode === "structure" || mode === "combustion"
              ? "numeric"
              : "decimal"
          }
          value={b[key]}
          maxLength={64}
          disabled={locked}
          onChange={(e) => update(key, e.target.value, true)}
        />
      </div>
    );
  }
  function optionLabel(key: string, value: string) {
    if (key === "gas" && value === "none")
      return "The report explicitly observes no gas evolution";
    return labels[value] ?? value;
  }
  function choice(key: string, label: string, options: string[]) {
    return (
      <div className="organic-field" key={key}>
        <label htmlFor={uid + "-" + key}>{label}</label>
        <select
          id={uid + "-" + key}
          value={b[key]}
          disabled={locked}
          onChange={(e) => update(key, e.target.value)}
        >
          <option value="">Choose your prediction</option>
          {options.map((v) => (
            <option key={v} value={v}>
              {optionLabel(key, v)}
            </option>
          ))}
        </select>
        {b[key] && (
          <p className="organic-selected">
            Selected: {optionLabel(key, b[key])}
          </p>
        )}
      </div>
    );
  }
  const toggle = (key: string) =>
    update(key, value[key] === "yes" ? "no" : "yes");
  let first: ReactNode = null,
    content: ReactNode = null;
  if (mode === "structure") {
    const r = organicStructures[id],
      p = organicProposal(r.n, value),
      h = p.carbonHydrogens + p.hydroxylHydrogen,
      o = p.hydroxylOxygen + p.carbonylOxygen;
    first = (
      <button
        type="button"
        className="organic-first"
        disabled={locked}
        aria-pressed={value.hydroxyl === "yes"}
        onClick={() => toggle("hydroxyl")}
      >
        Terminal C–O: {value.hydroxyl === "yes" ? "present" : "absent"}
      </button>
    );
    content = (
      <>
        <p>{r.note}</p>
        <p className="organic-given">
          Original target: {r.name}; {r.n} carbon atom{r.n === 1 ? "" : "s"}.
          Your current proposal contains {h} H and {o} O atoms.
        </p>
        <div className="model-controls">
          <button
            type="button"
            disabled={locked}
            aria-pressed={value.oxygenH === "yes"}
            onClick={() => toggle("oxygenH")}
          >
            H on that O: {value.oxygenH === "yes" ? "chosen" : "not chosen"}
          </button>
        </div>
        <div className="organic-field">
          <label htmlFor={uid + "-carbonyl"}>
            Separate terminal C–O bond order
          </label>
          <select
            id={uid + "-carbonyl"}
            value={value.carbonyl}
            disabled={locked}
            onChange={(e) => update("carbonyl", e.target.value)}
          >
            <option value="0">No separate O</option>
            <option value="1">Separate O with single C–O</option>
            <option value="2">Separate O with double C=O</option>
          </select>
        </div>
        {value.hydroxyl === "no" && value.oxygenH === "yes" && (
          <p role="status">
            Your oxygen-H choice is retained while that oxygen is absent; it is
            not counted until its C–O attachment is restored.
          </p>
        )}
        <OrganicDisplayed
          n={r.n}
          board={value}
          onToggle={locked ? undefined : toggle}
        />
        <OrganicHydrogens
          n={r.n}
          board={value}
          onToggle={toggle}
          disabled={locked}
        />
        <AlcoholScene3D n={r.n} family={r.family} board={value} />
        <table>
          <caption>Your local carbon bond-order totals</caption>
          <thead>
            <tr>
              <th>C</th>
              <th>Other bond order</th>
              <th>H atoms</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {p.carbons.map((c, i) => (
              <tr key={i}>
                <th scope="row">{i + 1}</th>
                <td>{c.other}</td>
                <td>{c.hydrogens}</td>
                <td>{c.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Current terminal C–O–H oxygen bond-order total: {p.hydroxylValence}.
          Separate O bond-order total: {p.carbonylValence}. Neutral C needs
          four, O two and H one.
        </p>
        <div className="organic-fields">
          {field("hTotal", "Your total H atoms in the complete target")}
          {field("oTotal", "Your total O atoms in the complete target")}
          {choice("family", "Classify the WHOLE supplied functional group", [
            "alcohol",
            "acid",
            "alkane",
          ])}
          {choice(
            "name",
            "First-four target name",
            Object.values(organicStructures).map((r) => r.name),
          )}
        </div>
        <p>
          A carboxylic acid needs the whole C(=O)–O–H group. Its carboxyl carbon
          is included in the carbon count. Covalent OH is not a free hydroxide
          ion.
        </p>
      </>
    );
  }
  if (mode === "reaction") {
    const r = organicReactions[id];
    content = (
      <>
        <p>{r.note}</p>
        <div className="organic-reaction-flow">
          <div>
            <strong>Original reactant</strong>
            <p>{r.reactant}</p>
          </div>
          <div>
            <strong>Supplied partner/conditions</strong>
            <p>{r.partner}</p>
          </div>
          <div>
            <strong>Your proposed result</strong>
            <p>{labels[value.result] || "Not chosen"}</p>
          </div>
        </div>
        {value.reveal === "yes" ? (
          <p className="organic-given">
            <strong>Original observation:</strong> {r.originalObservation}
          </p>
        ) : (
          <p>Original observations have not yet been revealed.</p>
        )}
        <button
          type="button"
          disabled={locked || value.reveal === "yes"}
          onClick={() => update("reveal", "yes")}
        >
          Reveal original reaction report
        </button>
        <div className="organic-fields">
          {choice(
            "result",
            "Products supported by the original reagent/evidence",
            [
              "alkoxideAndHydrogen",
              "sameDissolvedAlcohol",
              "correspondingAcid",
              "saltWaterCarbonDioxide",
              "esterAndWater",
              "alkeneAndWater",
              "carbonDioxideAndWater",
            ],
          )}
          {choice(
            "gas",
            "Most specific conclusion from the supplied gas observation/test",
            ["hydrogen", "carbonDioxide", "oxygen", "none", "notEstablished"],
          )}
          {choice("change", "Type of change", ["chemical", "physical"])}
          {choice("beforeGroup", "Original functional group", [
            "OH",
            "COOH",
            "CCdouble",
            "none",
          ])}
          {choice("afterGroup", "Supplied product group / retained group", [
            "OH",
            "COOH",
            "alkoxide",
            "carboxylate",
            "ester",
            "CCdouble",
            "none",
          ])}
        </div>
        <p>
          Use the original reagent and observation. Bubbles alone do not
          identify a gas. Controlled oxidation to an acid is not complete
          combustion; alcohol mixed with water retains its molecular identity.
        </p>
      </>
    );
  }
  if (mode === "combustion") {
    const r = alcoholCombustions[id],
      totals = alcoholAtomTotals(id, value);
    content = (
      <>
        <p>{r.note}</p>
        <p className="organic-given">
          Original supplied fuel: {r.name}, {organicFormula(r.n, "alcohol")}.
          Complete combustion with sufficient oxygen is requested.
        </p>
        <div className="organic-equation">
          <span>
            {value.fuel || "?"} {organicFormula(r.n, "alcohol")}
          </span>
          <span>+</span>
          <span>{value.oxygen || "?"} O₂</span>
          <span>→</span>
          <span>
            {value.carbon || "?"}{" "}
            {value.carbonProduct === "carbonDioxide"
              ? "CO₂"
              : value.carbonProduct === "carbonMonoxide"
                ? "CO"
                : value.carbonProduct === "carbon"
                  ? "C"
                  : "carbon product?"}
          </span>
          <span>+</span>
          <span>
            {value.water || "?"}{" "}
            {value.hydrogenProduct === "water"
              ? "H₂O"
              : value.hydrogenProduct === "hydrogen"
                ? "H₂"
                : "hydrogen product?"}
          </span>
        </div>
        <div className="organic-fields">
          {choice(
            "carbonProduct",
            "Choose the complete-combustion carbon product",
            ["carbonDioxide", "carbonMonoxide", "carbon"],
          )}
          {choice(
            "hydrogenProduct",
            "Choose the complete-combustion hydrogen product",
            ["water", "hydrogen"],
          )}
          {field("fuel", "Fuel coefficient")}
          {field("oxygen", "O₂ coefficient")}
          {field("carbon", "Carbon-product coefficient")}
          {field("water", "Hydrogen-product coefficient")}
        </div>
        <div className="model-controls">
          {[2, 0.5].map((factor) => {
            const keys = ["fuel", "oxygen", "carbon", "water"],
              enabled =
                !locked &&
                !Object.keys(raw).length &&
                keys.every(
                  (k) =>
                    value[k] !== "" &&
                    Number(value[k]) > 0 &&
                    Number.isInteger(Number(value[k]) * factor) &&
                    Number(value[k]) * factor >= 1 &&
                    Number(value[k]) * factor <= 1000,
                );
            return (
              <button
                type="button"
                key={factor}
                disabled={!enabled}
                onClick={() => {
                  setFeedback(null);
                  append({
                    ...value,
                    ...Object.fromEntries(
                      keys.map((k) => [k, String(Number(value[k]) * factor)]),
                    ),
                  });
                }}
              >
                {factor === 2
                  ? "Double ALL coefficients"
                  : "Halve ALL coefficients, if whole"}
              </button>
            );
          })}
        </div>
        <Totals {...totals} />
        <p>
          The alcohol already contains oxygen. Preserve the whole fuel formula;
          coefficients multiply every atom. Positive whole-number balanced
          multiples remain valid.
        </p>
      </>
    );
  }
  if (mode === "fermentation") {
    const r = fermentationCases[id];
    content = (
      <>
        <p>{r.note}</p>
        <p className="organic-given">
          <strong>Original target:</strong> {r.original}
        </p>
        {value.reveal === "yes" ? (
          <div className="fermentation-reports">
            {[
              ["Yeast/catalyst", r.yeastReport],
              ["Temperature", r.temperatureReport],
              ["Oxygen context", r.oxygenReport],
              ["Original product report", r.productReport],
            ].map(([label, text]) => (
              <section key={label}>
                <h4>{label}</h4>
                <p>{text}</p>
              </section>
            ))}
          </div>
        ) : (
          <p>The original conditions/product report is not yet revealed.</p>
        )}
        <button
          type="button"
          disabled={locked || value.reveal === "yes"}
          onClick={() => update("reveal", "yes")}
        >
          Reveal original process report
        </button>
        <div className="organic-fields">
          {choice("stage", "Chemical production or later collection stage", [
            "fermentation",
            "fractionalDistillation",
            "combustion",
            "cracking",
          ])}
          {choice("feed", "Original feed mixture", [
            "sugarSolution",
            "ethanolWaterMixture",
            "pureEthanol",
          ])}
          {choice("yeast", "Role/status of the supplied yeast enzymes", [
            "enzymes",
            "damagedEnzymes",
            "absentEnzymes",
            "notRequiredForSeparation",
          ])}
          {choice("temperature", "Use the original temperature/report", [
            "warm",
            "slowerCold",
            "damagedHighHeat",
            "vaporiseAndCondense",
            "alwaysBoiling",
          ])}
          {choice("oxygen", "Oxygen context of this stage", [
            "anaerobic",
            "notRequiredForSeparation",
            "oxygenRequired",
          ])}
          {choice(
            "products",
            "Original reported chemical products/identities",
            [
              "ethanolAndCarbonDioxide",
              "notDemonstrated",
              "sameMolecules",
              "carbonDioxideAndWater",
            ],
          )}
          {choice("reason", "Reason for the stated result/process", [
            "enzymeCatalysis",
            "lowerRate",
            "enzymeDamage",
            "missingCatalyst",
            "differentBoilingBehaviour",
            "createsAtoms",
          ])}
          {choice("collection", "What mixture is actually established?", [
            "aqueousMixture",
            "unreactedMixture",
            "enrichedMixture",
            "pureEthanol",
          ])}
        </div>
        <p>
          Fermentation chemically produces ethanol and CO₂ from sugar using
          yeast enzymes. Distillation subsequently separates existing molecules
          by boiling behaviour; an aqueous product or concentrated fraction is
          not automatically absolutely pure ethanol.
        </p>
      </>
    );
  }
  if (mode === "fuel") {
    const r = fuelComparisons[id];
    content = (
      <>
        <p>{r.note}</p>
        {r.kind === "specifiedEnergy" ? (
          <>
            <p className="organic-given">
              Original supplied energy value: {r.rate} kJ/g for {r.name}.
              Requested energy: {r.target} kJ.
            </p>
            <div className="organic-fields">
              {field("mass", "Your fuel mass needed")}
              {choice("unit", "Unit for the requested fuel mass", [
                "g",
                "kg",
                "kJ",
                "°C/g",
              ])}
              {choice("basis", "What supplies the energy-per-gram basis?", [
                "suppliedEnergyPerGram",
                "temperatureIsEnergy",
                "containerMass",
              ])}
            </div>
            <p>
              Your mass proposal: {value.mass || "?"} × {r.rate} kJ/g ={" "}
              {value.mass === "" ? "?" : Number(value.mass) * r.rate} kJ. The
              original requested energy remains {r.target} kJ.
            </p>
          </>
        ) : (
          <>
            <FuelApparatus data={r} />
            <div className="organic-fields">
              {field("massA", "A: actual fuel consumed (g)")}
              {field("massB", "B: actual fuel consumed (g)")}
              {field("riseA", "A: original water temperature rise (°C)")}
              {field("riseB", "B: original water temperature rise (°C)")}
              {field(
                "normA",
                "A: rise per gram, rounded to 1 decimal place (°C/g)",
              )}
              {field(
                "normB",
                "B: rise per gram, rounded to 1 decimal place (°C/g)",
              )}
            </div>
            <ProposalBars a={value.normA} b={value.normB} />
            <div className="organic-fields">
              {choice(
                "judgement",
                "Comparison justified by the stated controls",
                [
                  "AgreaterPerGram",
                  "BgreaterPerGram",
                  "equalObservedResponse",
                  "notComparableFromRiseAlone",
                ],
              )}
              {choice("limitation", "Relevant limit from the original report", [
                "observedNotTrueCombustionEnergy",
                "unequalWaterMass",
                "heatLossNotRemovedByRepeats",
                "guaranteedTrueEnergy",
              ])}
            </div>
            <p>
              Burner BEFORE minus AFTER gives fuel consumed; water final minus
              initial gives the rise. For matched heated-water/apparatus compare
              rise per gram. °C/g is a normalized response, not automatically
              kJ/g or the true total chemical energy.
            </p>
          </>
        )}
      </>
    );
  }
  if (mode === "plot") {
    const r = fuelPlots[id];
    content = (
      <>
        <p>{r.note}</p>
        <table>
          <caption>Original supplied observations — retained unchanged</caption>
          <thead>
            <tr>
              <th>
                {r.xName} ({r.xUnit})
              </th>
              <th>
                {r.yName} ({r.yUnit})
              </th>
            </tr>
          </thead>
          <tbody>
            {r.points.map(([x, y], i) => (
              <tr key={i}>
                <td>{x}</td>
                <td>{y}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <FuelPlotEditor
          key={id}
          data={r}
          board={value}
          inputValues={b}
          disabled={locked}
          onChange={(changes) => {
            const keys = Object.keys(changes);
            if (keys.length === 1) {
              const k = keys[0];
              update(k, changes[k], true);
              return;
            }
            const next = { ...value, ...changes };
            if (
              validAlcoholBoard(mode, next) &&
              alcoholHistoryStep(mode, value, next)
            ) {
              setFeedback(null);
              setRaw((old) =>
                Object.fromEntries(
                  Object.entries(old).filter(([k]) => !keys.includes(k)),
                ),
              );
              append(next);
            }
          }}
        />
        <div className="organic-fields">
          {choice("trend", "Trend in the ORIGINAL supplied observations", [
            "increasesWithSmallerGains",
            "approximatelyProportional",
            "decreases",
            "constantObserved",
          ])}
          {choice("limit", "Status of your proposed target value", [
            "extrapolatedEstimate",
            "interpolatedEstimate",
            "measuredValue",
            "universalConstant",
          ])}
        </div>
        <p>
          Check model allows plotting positions within half a small square: ±
          {fuelPlotTolerance(r).x} {r.xUnit} horizontally and ±
          {fuelPlotTolerance(r).y} {r.yUnit} vertically. Your coordinates and
          the original table stay visible. Your independently chosen fit curve
          and estimate still need self-review; this activity does not award an
          examiner graph mark.
        </p>
      </>
    );
  }
  return (
    <section className="model alcohol-workbench" aria-label="Task model">
      {first}
      <h3>
        {instruction ||
          "Construct a proposal from the original supplied evidence."}
      </h3>
      {content}
      {Object.keys(raw).length > 0 && (
        <p role="status">
          Incomplete or invalid raw entries remain for correction. Diagrams show
          accepted scientific state; other accepted fields can still be saved.
          Undo discards raw edits before changing model history.
        </p>
      )}
      {locked && (
        <p role="status">
          This model’s history is full. Undo or reset this model to continue;
          learning and assessment exposure are retained.
        </p>
      )}
      <div className="model-controls">
        <button
          type="button"
          className="button"
          onClick={() => setFeedback(checkAlcoholBoard(mode, b))}
        >
          Check model
        </button>
        <button
          type="button"
          disabled={history.length <= 1 && !Object.keys(raw).length}
          onClick={() => {
            setFeedback(null);
            if (Object.keys(raw).length) {
              setRaw({});
              return;
            }
            if (history.length > 1) onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => {
            setRaw({});
            setFeedback(null);
            onChange([initialAlcoholBoard(mode, original)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <div
          className={"feedback " + (feedback.correct ? "correct" : "incorrect")}
          role="status"
        >
          {feedback.message}
        </div>
      )}
      <details>
        <summary>Choose another supplied comparison</summary>
        <label htmlFor={uid + "-record"}>Supplied comparison</label>
        <select
          id={uid + "-record"}
          value={id}
          disabled={locked}
          onChange={(e) => {
            if (e.target.value === id) return;
            setRaw({});
            setFeedback(null);
            append(initialAlcoholBoard(mode, e.target.value));
          }}
        >
          {Object.entries(alcoholRecords[mode]).map(([key, r]) => (
            <option key={key} value={key}>
              {r.title}
            </option>
          ))}
        </select>
        <p>
          Changing comparison starts its pristine proposal and retains earlier
          history. Selecting the same comparison keeps your work. Reset returns
          to this task’s original comparison.
        </p>
      </details>
    </section>
  );
}
