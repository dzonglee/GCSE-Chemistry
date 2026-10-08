"use client";
import { useState } from "react";
import {
  initialPurity,
  purityCase,
  purityTargets,
  checkPurity,
  updatePurity,
  compatiblePurityCases,
  parsePurityNumber,
  type PurityMode,
  type PurityFocus,
  type PurityBoard,
} from "../lib/purity-domain";
import { filtrationForecast } from "../lib/purity-asset";
import { PurityTemperaturePlot } from "./PurityTemperaturePlot";
import { PurityScene3D } from "./PurityScene3D";
const labels: Record<string, string> = {
  category: "Classify the supplied sample",
  label: "Meaning of the supplied purity label",
  start: "Start temperature",
  finish: "Finish temperature",
  width: "Interval width",
  conclusion: "What does the evidence support?",
  amount0: "First ingredient mass",
  amount1: "Second ingredient mass",
  amount2: "Third ingredient mass",
  method: "Choose a method for the stated target",
  location: "Where is the requested product?",
  residueSand: "Sand in residue",
  residueSalt: "Salt in residue",
  residueWater: "Water in residue",
  filtrateSand: "Sand in filtrate",
  filtrateSalt: "Salt in filtrate",
  filtrateWater: "Water in filtrate",
  collectionMass: "Total collected mass",
  recovery: "Product recovery",
  purity: "Product fraction of collected mass",
  lostProduct: "Uncollected product",
};
const words: Record<string, string> = {
  element: "Pure element",
  compound: "Pure compound",
  mixture: "Mixture",
  unknown: "Insufficient composition evidence",
  chemical: "Chemical purity claim",
  everyday: "Everyday natural or nothing-added claim",
  none: "No purity claim supplied",
  consistent: "Consistent with this pure reference",
  impure: "Lower and wider: evidence of impurity",
  other: "Narrow, but does not match this reference",
  inconsistent: "Inconsistent with this pure reference",
  insufficient: "Insufficient comparable evidence",
  filtration: "Filtration",
  simple: "Simple distillation",
  crystallisation: "Crystallisation",
  evaporation: "Evaporation without collecting water",
  fractional: "Fractional distillation",
  chromatography: "Paper chromatography",
  residue: "Filter residue",
  distillate: "Collected liquid distillate",
  crystals: "Crystals",
  vessel: "Original vessel",
  fractions: "Separate collected fractions",
  paper: "Separated spots on paper",
  together: "Salt and water still together",
};
const methodRoutes: Record<string, string[]> = {
  filtration: [
    "Feed reaches filter paper",
    "Insoluble grains remain as residue",
    "Liquid and dissolved material pass as filtrate",
  ],
  simple: [
    "Volatile liquid vaporises",
    "Vapour enters a cooled condenser",
    "Condensed liquid is collected; nonvolatile material remains behind",
  ],
  crystallisation: [
    "Concentrated solution",
    "Cooling reduces solubility for the stated solid",
    "Crystals form; mother liquor remains",
  ],
  evaporation: [
    "Volatile liquid leaves the vessel",
    "Its vapour is not collected",
    "Stable dissolved solid remains at the stated endpoint",
  ],
  fractional: [
    "A volatile-liquid mixture is vaporised",
    "Repeated vaporisation and condensation in a column",
    "Different fractions are collected; purity still needs evidence",
  ],
  chromatography: [
    "Mixture is applied to the paper",
    "Solvent moves through the stationary phase",
    "Different mobility can produce separate spots",
  ],
  none: [
    "Ordinary filtration alone is considered",
    "Dissolved material passes with the solvent",
    "The solution remains together",
  ],
};
const choices: Record<string, string[]> = {
  label: ["chemical", "everyday", "none"],
  conclusion: [],
  method: [
    "filtration",
    "simple",
    "crystallisation",
    "evaporation",
    "fractional",
    "chromatography",
    "none",
  ],
  location: [
    "residue",
    "distillate",
    "crystals",
    "vessel",
    "fractions",
    "paper",
    "together",
  ],
};
export function PurityWorkbench({
  mode,
  record,
  focus = "all",
  history: retained,
  onChange,
}: {
  mode: PurityMode;
  record: string;
  focus?: PurityFocus;
  history?: PurityBoard[];
  onChange?: (history: PurityBoard[]) => void;
}) {
  const [localHistory, setLocalHistory] = useState<PurityBoard[]>(() => [
      initialPurity(mode, record),
    ]),
    [feedback, setFeedback] = useState("");
  const history = retained ?? localHistory;
  const setHistory = (update: (h: PurityBoard[]) => PurityBoard[]) => {
    const next = update(history);
    if (onChange) onChange(next);
    else setLocalHistory(next);
  };
  const board = history[history.length - 1],
    c = purityCase(mode, board.record)!,
    targets = purityTargets(mode, board.record, focus);
  const change = (field: string, value: string) => {
    if (history.length >= 500) {
      setFeedback(
        "This investigation has reached 500 retained steps. Undo a step to continue; your history is preserved.",
      );
      return;
    }
    setHistory((h) => [
      ...h,
      updatePurity(mode, h[h.length - 1], field, value),
    ]);
    setFeedback("");
  };
  const reset = (next = record) => {
    if (history.length >= 500) {
      setFeedback(
        "Undo a step before adding another comparison; your history is preserved.",
      );
      return;
    }
    setHistory((h) => [...h, initialPurity(mode, next)]);
    setFeedback("");
  };
  const num = (key: string) => Number(c[key]);
  const explanation = () => {
    if (mode === "identity")
      return c.category === "unknown"
        ? "Appearance alone does not supply chemical composition."
        : `The complete given composition is classified as ${words[String(c.category)]}. Count different substances, rather than the element symbols within one compound. A label states a claim; it does not change that composition.`;
    if (mode === "melting")
      return c.finish === null
        ? "A missing finish reading prevents calculation of a complete interval."
        : `The supplied width is ${Math.round((num("finish") - num("start")) * 1e8) / 1e8}°C: finish minus start. Compare both its width and position with the ${num("reference")}°C reference. A matching measured property does not establish unique identity.`;
    if (mode === "boiling")
      return c.measuredPressure !== c.referencePressure
        ? "The pressure conditions differ or are missing. Since pressure affects boiling temperature, this comparison is insufficient."
        : `These readings have the same stated pressure. Compare ${num("measured")}°C with ${num("reference")}°C and the stated ±${num("uncertainty")}°C uncertainty. Consistency is evidence, not proof that every possible impurity is absent.`;
    if (mode === "formulation")
      return "Ingredient mass = whole recipe mass × the stated percentage ÷ 100. A matching total alone does not verify each proportion. A formulation also requires deliberate design for useful properties.";
    if (mode === "method")
      return `The supplied target is: ${String(c.target)}. ${c.method === "none" ? "Dissolved ions pass through ordinary paper with water, so filtration alone does not separate this solution." : `For the stated conditions, ${words[String(c.method)]} places the requested product in ${words[String(c.location)]}.`} Choosing depends on the target and given properties.`;
    if (mode === "filtration")
      return `Insoluble sand remains on the paper. Of ${num("salt")} g salt, ${num("dissolvedSalt")} g is dissolved and travels with water, except the supplied ${num("retainedDissolvedSalt")} g retained in mother liquor. Undissolved salt is also retained. No salt changes into another substance.`;
    return `Recovery uses the original ${num("sourceProduct")} g available product as denominator. Product fraction uses all collected components: ${num("productCollected")} g product + ${num("contaminant")} g other material + ${num("water")} g water. These are different questions; water is not recovered product.`;
  };
  const field = (key: string) => {
    let opts =
      key === "category"
        ? mode === "identity"
          ? ["element", "compound", "mixture", "unknown"]
          : ["formulation", "mixture"]
        : choices[key];
    if (key === "conclusion")
      opts =
        mode === "melting"
          ? ["consistent", "impure", "other", "insufficient"]
          : ["consistent", "inconsistent", "insufficient"];
    const label =
      mode === "formulation" && key.startsWith("amount")
        ? (c.components as { name: string }[])[Number(key.slice(-1))].name +
          " mass"
        : labels[key];
    return (
      <label className="purity-field" key={key}>
        <span>{label}</span>
        {opts ? (
          <select
            data-field={key}
            value={board[key]}
            onChange={(e) => change(key, e.target.value)}
          >
            <option value="">Choose…</option>
            {opts.map((v) => (
              <option key={v} value={v}>
                {mode === "formulation" && key === "category"
                  ? v === "formulation"
                    ? "Designed useful formulation supplied"
                    : "Only an accidental mixture supplied"
                  : mode === "method" && v === "none"
                    ? "Ordinary filtration alone does not separate this solution"
                    : (words[v] ?? v)}
              </option>
            ))}
          </select>
        ) : (
          <span className="purity-number">
            <input
              type="text"
              data-field={key}
              inputMode={
                ["start", "finish", "width"].includes(key) ? "text" : "decimal"
              }
              value={board[key]}
              onChange={(e) => {
                if (e.target.value.length <= 24) change(key, e.target.value);
              }}
            />
            <span>
              {["start", "finish", "width"].includes(key)
                ? "°C"
                : ["recovery", "purity"].includes(key)
                  ? "%"
                  : "g"}
            </span>
          </span>
        )}
      </label>
    );
  };
  const forecast =
    mode === "filtration" ? filtrationForecast(board, focus) : null;
  const components =
    mode === "formulation"
      ? (c.components as { name: string; purpose: string; percent: number }[])
      : [];
  const allocated = components.map((_, i) =>
    parsePurityNumber(board["amount" + i]),
  );
  const allocationTotal = allocated.every((n) => n !== null)
    ? allocated.reduce((a, b) => a! + b!, 0)
    : null;
  return (
    <section className="purity-workbench" aria-label="Task model">
      {board.record !== record && (
        <p className="purity-compare-notice">
          Comparison: {String(c.title)}. The original question is unchanged;
          reset to its source before answering it.
        </p>
      )}
      {mode === "formulation" && typeof c.source === "string" && (
        <p>{c.source}</p>
      )}
      {mode === "identity" && (
        <div className="purity-source">
          <strong>Composition evidence</strong>
          <p>{String(c.source)}</p>
          <p>
            Choose the sample classification separately from what a label
            claims. A claim can be contradicted by its composition.
          </p>
        </div>
      )}
      {mode === "melting" && (
        <>
          <dl className="purity-melting-readings">
            <div>
              <dt>Start</dt>
              <dd>{num("start")} °C</dd>
            </div>
            <div>
              <dt>Finish</dt>
              <dd>
                {c.finish === null ? "Not recorded" : num("finish") + " °C"}
              </dd>
            </div>
            <div>
              <dt>Reference</dt>
              <dd>{num("reference")} °C</dd>
            </div>
            <div>
              <dt>Uncertainty</dt>
              <dd>±{num("uncertainty")} °C</dd>
            </div>
          </dl>
          {focus === "all" ? (
            <PurityTemperaturePlot
              low={num("low")}
              high={num("high")}
              step={num("step")}
              reference={num("reference")}
              start={board.start}
              finish={board.finish}
              finishAvailable={c.finish !== null}
              interactive
              onChange={change}
            />
          ) : (
            <PurityTemperaturePlot
              low={num("low")}
              high={num("high")}
              step={num("step")}
              reference={num("reference")}
              start={String(c.start)}
              finish={c.finish === null ? "" : String(c.finish)}
              finishAvailable={c.finish !== null}
              interactive={false}
            />
          )}
        </>
      )}
      {mode === "melting" && (
        <p className="purity-calibration">
          Reading resolution: {num("resolution")} °C. Reference for pure{" "}
          {String(c.substance)}.
        </p>
      )}
      {mode === "boiling" && (
        <div className="purity-comparison">
          <article>
            <h3>Pure-water reference</h3>
            <strong>{num("reference")}°C</strong>
            <p>At {num("referencePressure")} kPa</p>
          </article>
          <article>
            <h3>Measured sample</h3>
            <strong>{num("measured")}°C</strong>
            <p>
              {c.measuredPressure === null
                ? "Pressure not recorded"
                : "At " + num("measuredPressure") + " kPa"}
            </p>
            <p>Stated uncertainty ±{num("uncertainty")}°C</p>
          </article>
        </div>
      )}
      {mode === "formulation" && (
        <>
          <p>
            Total required mass: <strong>{num("total")} g</strong>. Enter your
            allocation; unchosen ingredients stay unchosen.
          </p>
          <div className="purity-recipe">
            {components.map((v, i) => (
              <article key={v.name}>
                <h3>
                  {v.name}: {v.percent}%
                </h3>
                <p>{v.purpose}</p>
                <div
                  role="img"
                  className="purity-bar"
                  aria-label={
                    v.name + " target proportion " + v.percent + " percent"
                  }
                >
                  <span style={{ width: v.percent + "%" }} />
                </div>
                {targets.includes("amount" + i) && field("amount" + i)}
                {allocated[i] !== null && (
                  <>
                    <p>
                      Your allocation: {allocated[i]} g (approximately
                      {Math.round((allocated[i]! / num("total")) * 10000) / 100}
                      % of the whole recipe)
                    </p>
                    <div
                      role="img"
                      className="purity-bar purity-proposal-bar"
                      aria-label={v.name + " proposed fraction of whole recipe"}
                    >
                      <span
                        style={{
                          width:
                            Math.min(
                              100,
                              (allocated[i]! / num("total")) * 100,
                            ) + "%",
                        }}
                      />
                    </div>
                    {allocated[i]! > num("total") && (
                      <p>
                        Your entry exceeds the whole recipe. Its displayed bar
                        stops at the whole; the entry is retained.
                      </p>
                    )}
                  </>
                )}
              </article>
            ))}
          </div>
          {allocationTotal !== null && (
            <p>
              Your total: {allocationTotal} g.{" "}
              {allocationTotal > num("total")
                ? "Exceeds the supplied total by " +
                  (allocationTotal - num("total")) +
                  " g."
                : allocationTotal < num("total")
                  ? "Short of the supplied total by " +
                    (num("total") - allocationTotal) +
                    " g."
                  : "Matches the total; check the individual proportions too."}
            </p>
          )}
        </>
      )}
      {mode === "method" && (
        <div className="purity-source">
          <h3>Mixture: {String(c.mixture)}</h3>
          <p>{String(c.properties)}</p>
          <strong>Target: {String(c.target)}</strong>
          <p>
            Select for these stated conditions. Other apparatus can sometimes
            recover the same material by a different process.
          </p>
        </div>
      )}
      {mode === "filtration" && (
        <>
          <div className="purity-source">
            <strong>Supplied mixture and endpoint</strong>
            <p>
              {num("sand")} g sand · {num("salt")} g salt · {num("water")} g
              water.
            </p>
            <p>
              {num("dissolvedSalt")} g salt is dissolved. Retained mother
              liquor: {num("retainedWater")} g water and{" "}
              {num("retainedDissolvedSalt")} g dissolved salt.
            </p>
            {typeof c.waterNote === "string" && <p>{c.waterNote}</p>}
            <p>
              Sand is insoluble; dissolved salt passes with water. These are
              supplied endpoint data, not a prediction from a moving-particle
              animation.
            </p>
          </div>
        </>
      )}
      {mode === "recovery" && (
        <div className="purity-comparison">
          <article>
            <h3>Originally available product</h3>
            <strong>{num("sourceProduct")} g</strong>
            <p>Reference for product recovery</p>
          </article>
          <article>
            <h3>Collection composition supplied</h3>
            <p>
              {num("productCollected")} g product
              <br />
              {num("contaminant")} g other material
              <br />
              {num("water")} g water
            </p>
            <p>Use the entire collected mass for its product fraction.</p>
          </article>
        </div>
      )}
      <div className="purity-fields">
        {targets
          .filter((k) => !(mode === "formulation" && k.startsWith("amount")))
          .map(field)}
      </div>
      {mode === "recovery" &&
        (["recovery", "purity"] as const).map((key) => {
          const proposed = parsePurityNumber(board[key]);
          if (proposed === null) return null;
          const denominator =
            key === "recovery"
              ? num("sourceProduct")
              : num("productCollected") + num("contaminant") + num("water");
          return (
            <section key={key} className="purity-recovery-proposal">
              <h3>
                Your{" "}
                {key === "recovery" ? "recovery" : "collected-sample fraction"}{" "}
                proposal
              </h3>
              <p>
                {proposed}% of this {denominator} g reference implies{" "}
                {Math.round((proposed / 100) * denominator * 1e8) / 1e8} g
                product. Compare that implied quantity with the supplied
                collected product; this is your proposal, not a new measurement.
                A rounded percentage can give a slightly different implied mass.
              </p>
              <div
                role="img"
                className="purity-bar purity-proposal-bar"
                aria-label={"Your " + proposed + " percent proposal"}
              >
                <span style={{ width: Math.min(100, proposed) + "%" }} />
              </div>
              {proposed > 100 && (
                <p>
                  The entry exceeds 100%. The displayed bar stops at the whole,
                  but your entry is retained.
                </p>
              )}
            </section>
          );
        })}
      {mode === "method" && board.method && (
        <section className="purity-route">
          <h3>
            Your selected process:{" "}
            {board.method === "none"
              ? "Ordinary filtration alone does not separate the solution"
              : words[board.method]}
          </h3>
          <ol>
            {methodRoutes[board.method].map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>
            This describes your selected operation. Compare it with the original
            target and supplied properties; selecting it does not establish that
            it meets the task.
          </p>
        </section>
      )}
      {forecast && (
        <>
          <div className="purity-ledger">
            <h3>Your material proposal</h3>
            {(["residue", "filtrate"] as const).map((place) => (
              <article key={place}>
                <h4>
                  {place === "residue"
                    ? "On the paper"
                    : "In the receiving flask"}
                </h4>
                {(["Sand", "Salt", "Water"] as const).map((material) => {
                  const k = (place + material) as keyof typeof forecast,
                    v = forecast[k];
                  return (
                    <p key={material}>
                      {material}: {v === null ? "unchosen" : v + " g"}
                      {forecast.derived.includes(k) &&
                        " (conditional complement of your salt proposal)"}
                    </p>
                  );
                })}
              </article>
            ))}
          </div>
          <PurityScene3D board={board} focus={focus} originalRecord={record} />
        </>
      )}
      <div className="purity-buttons">
        <button
          type="button"
          onClick={() => {
            const result = checkPurity(mode, board, focus);
            setFeedback(
              !result.valid
                ? "Complete the asked fields with an ordinary decimal or a supplied choice. Your entry is retained."
                : result.correct
                  ? "Your asked fields match this supplied case. Other unchosen fields have not been checked. " +
                    explanation()
                  : "Your proposal is retained. " + explanation(),
            );
          }}
        >
          Check my proposal
        </button>
        <button
          type="button"
          disabled={history.length === 1}
          onClick={() => {
            setHistory((h) => h.slice(0, -1));
            setFeedback("");
          }}
        >
          Undo one change
        </button>
        <button type="button" onClick={() => reset()}>
          Reset to original task
        </button>
      </div>
      <label className="purity-compare">
        Compare supplied cases
        <select
          data-field="record"
          value={board.record}
          onChange={(e) => reset(e.target.value)}
        >
          {compatiblePurityCases(mode, focus).map((r) => (
            <option key={r} value={r}>
              {String(purityCase(mode, r)!.title)}
            </option>
          ))}
        </select>
      </label>
      {board.record !== record && (
        <p>
          Comparison case selected. Return to the original task before answering
          its question.
        </p>
      )}
      {feedback && (
        <p className="purity-feedback" role="status">
          {feedback}
        </p>
      )}
    </section>
  );
}
