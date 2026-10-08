"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useId, useState } from "react";
import {
  oilRecords,
  oilInventories,
  oilColumns,
  oilTraces,
  oilTrends,
  oilUses,
  oilYields,
  fractionNames,
  type OilMode,
} from "../lib/crude-oil";
import {
  initialOilBoard,
  validOilBoard,
  oilHistoryStep,
  checkOilBoard,
  type OilBoard,
} from "../lib/crude-oil-board";
import { OilColumnScene3D } from "./OilColumnScene3D";
import { traceDisplay } from "../lib/oil-column-asset";
import { OilBarChart } from "./OilBarChart";
const labels: Record<string, string> = {
  yes: "Included",
  no: "Not included",
  mixture: "A mixture of different compounds",
  pure: "One pure compound",
  physical: "Physical separation; formulas retained",
  cracking: "Cracking changes molecular identities",
  newSubstances: "Every collected fraction is a new substance",
  coolerUp: "Cooler upwards",
  hotterUp: "Hotter upwards",
  flat: "Same temperature throughout",
  vaporCondense: "Vaporisation and condensation",
  breakBonds: "Break every carbon–carbon bond",
  filter: "Filter only by particle size",
  liquid: "Liquid",
  gas: "Gas",
  condensed: "Condensed at a tray",
  topGas: "Leaves as top gas",
  residue: "Retained liquid residue",
  unchanged: "Molecular formula remains unchanged",
  broken: "Molecule is broken by cooling",
  newFormula: "Every change of state gives a new formula",
  higher: "Increases in the requested direction",
  lower: "Decreases in the requested direction",
  same: "Stays the same",
  intermolecular: "Intermolecular attractions; molecules separate",
  covalentBroken: "Every covalent bond breaks on boiling",
  atomsLarger: "Carbon atoms become a different size/element",
  domestic: "Domestic heating and cooking",
  cars: "Cars with suitable petrol engines",
  aircraft: "Aircraft fuel",
  dieselVehicles: "Some cars and trains with diesel engines",
  shipsPower: "Large ships and some power stations",
  roadsRoofs: "Roads and roofs",
  fuel: "Burned as fuel for energy",
  material: "Used directly as a material",
  feedstock: "Chemical starting material for processing",
  ignitesReadily: "Easy ignition for the stated cooking use",
  suitableBoilingRange: "An appropriate fuel range for the stated aircraft use",
  viscousSurface: "Viscous material suited to the stated surface use",
  engineSuitability: "Suitable for the stated diesel engine",
  burnedEnergy: "Can be burned for energy in a suitable installation",
  processedMaterials: "Processed into useful chemical products",
  A: "Source A",
  B: "Source B",
  equal: "Equal under the stated criterion",
  criterion: "Conclusion follows the stated criterion and feed masses",
  alwaysMore: "Higher percentage always means more kilograms",
  density: "Percentages alone prove a density difference",
};
const titles: Record<OilMode, string> = {
  inventory: "Classify components and distinguish molecules from compounds.",
  column: "Construct the temperature gradient and relative collection order.",
  trace: "Follow the supplied component through a threshold model.",
  trends: "Construct the requested size order and all three property trends.",
  uses: "Match named fractions to uses and classify the supplied target purpose.",
  yield: "Construct original percentage bars and compare the stated yields.",
};
export function CrudeOilWorkbench({
  mode,
  history,
  onChange,
  record: original = "initial",
  instruction,
}: {
  mode: OilMode;
  history: OilBoard[];
  onChange: (v: OilBoard[]) => void;
  record?: string;
  instruction?: string;
}) {
  const uid = useId(),
    value = history.at(-1) ?? initialOilBoard(mode, original),
    [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({}),
    [feedback, setFeedback] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    b = { ...value, ...raw },
    id = value.record,
    locked = history.length >= 500;
  function append(next: OilBoard) {
    if (Object.keys(next).every((k) => next[k] === value[k])) return;
    if (
      !locked &&
      validOilBoard(mode, next) &&
      oilHistoryStep(mode, value, next)
    )
      onChange([...history, next]);
  }
  function update(k: string, v: string) {
    setFeedback(null);
    const next = { ...value, [k]: v };
    if (validOilBoard(mode, next)) {
      setRaw((old) =>
        Object.fromEntries(Object.entries(old).filter(([key]) => key !== k)),
      );
      append(next);
    } else setRaw((old) => ({ ...old, [k]: v }));
  }
  function select(
    k: string,
    label: string,
    options: string[],
    names: Record<string, string> = labels,
  ) {
    return (
      <div key={k}>
        <label htmlFor={uid + "-" + k}>{label}</label>
        <select
          id={uid + "-" + k}
          disabled={locked}
          value={b[k]}
          onChange={(e) => update(k, e.target.value)}
        >
          <option value="">Choose your prediction</option>
          {options.map((v) => (
            <option key={v} value={v}>
              {names[v] ?? v}
            </option>
          ))}
        </select>
        {b[k] && (
          <p className="oil-selection">Selected: {names[b[k]] ?? b[k]}</p>
        )}
      </div>
    );
  }
  function number(k: string, label: string) {
    return (
      <div key={k}>
        <label htmlFor={uid + "-" + k}>{label}</label>
        <input
          id={uid + "-" + k}
          inputMode="decimal"
          disabled={locked}
          value={b[k]}
          onChange={(e) => update(k, e.target.value)}
        />
      </div>
    );
  }
  function toggleComponent(i: number) {
    const c = oilInventories[id].components[i];
    return (
      <button
        type="button"
        disabled={locked}
        className="oil-component-choice"
        aria-pressed={b["include" + i] === "yes"}
        onClick={() =>
          update("include" + i, b["include" + i] === "yes" ? "no" : "yes")
        }
        data-component={i}
      >
        <strong>{c.formula}</strong>
        <span>
          Elements: {c.elements.join(", ")}; {c.count}{" "}
          {c.count === 1 ? "molecule" : "molecules"}
        </span>
        <span>
          Hydrocarbon: {b["include" + i] === "yes" ? "Yes" : "Not selected"}
        </span>
      </button>
    );
  }
  let content;
  if (mode === "inventory") {
    const r = oilInventories[id];
    content = (
      <>
        <p>{r.note}</p>
        <p>
          Hydrocarbons contain carbon and hydrogen only. Select each matching
          component. Original molecule counts remain unchanged.
        </p>
        <div className="oil-components">
          {r.components.map((_, i) =>
            i ? <div key={i}>{toggleComponent(i)}</div> : null,
          )}
        </div>
        <div className="oil-fields">
          {number(
            "compounds",
            "Distinct compounds in the entire supplied sample",
          )}
          {number("hydrocarbons", "Selected hydrocarbon molecules")}
          {select("purity", "Is the entire supplied sample pure?", [
            "mixture",
            "pure",
          ])}
          {select(
            "process",
            "What does distillation do to molecular identity?",
            ["physical", "cracking", "newSubstances"],
          )}
        </div>
      </>
    );
  }
  if (mode === "column") {
    const r = oilColumns[id],
      names = Object.fromEntries(
        r.temperatures.map((t) => [String(t), t + " °C"]),
      ),
      groupNames = Object.fromEntries(
        r.groups.map((g, i) => [
          String(i),
          "Group " + g.label + ": " + g.range,
        ]),
      );
    content = (
      <>
        <p>{r.note}</p>
        <p>
          Original supplied temperatures:{" "}
          {r.temperatures.map((t) => t + " °C").join("; ")}.
        </p>
        <div
          className="oil-column-build"
          aria-label="Constructed top-to-bottom temperatures"
        >
          <p>Top of column</p>
          {[0, 1, 2, 3].map((i) => (
            <div className="oil-stage" key={i}>
              {select(
                "temp" + i,
                `Temperature at level ${i + 1} / °C (top to bottom)`,
                r.temperatures.map(String),
                names,
              )}
            </div>
          ))}
          <p>
            Hot feed enters lower down; highest-boiling residue can remain
            below.
          </p>
        </div>
        <table>
          <caption>Original example boiling-range groups</caption>
          <thead>
            <tr>
              <th>Group</th>
              <th>Supplied boiling range</th>
            </tr>
          </thead>
          <tbody>
            {r.groups.map((g) => (
              <tr key={g.label}>
                <th scope="row">{g.label}</th>
                <td>{g.range}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="oil-fields">
          {["Upper/top outlet", "Intermediate", "Lower"].map((label, i) =>
            select("group" + i, label + " group", ["0", "1", "2"], groupNames),
          )}
          {select("gradient", "Temperature direction", [
            "coolerUp",
            "hotterUp",
            "flat",
          ])}
          {select("process", "Physical separation method", [
            "vaporCondense",
            "breakBonds",
            "filter",
          ])}
        </div>
        <p>
          Top gas may leave without condensing. These groups establish relative
          positions; a mixture&apos;s supplied range is not one pure-component
          boiling point.
        </p>
      </>
    );
  }
  if (mode === "trace") {
    const r = oilTraces[id],
      step = Number(b.step),
      display = traceDisplay(id, step),
      markerY = display.collectedTray
        ? 270 - (display.collectedTray - 1) * 45
        : step === 0 || display.station.startsWith("Liquid residue")
          ? 310
          : step === 6
            ? 35
            : 270 - (step - 1) * 45,
      markerX = display.collectedTray ? 310 : step === 6 ? 310 : 205;
    content = (
      <>
        <p>{r.note}</p>
        <p className="oil-given">
          Component: <strong>{r.formula}</strong>. Supplied boiling point:{" "}
          <strong>{r.bp} °C</strong>. Feed temperature:{" "}
          <strong>{r.feed} °C</strong>.
        </p>
        {select("feedPhase", "Phase leaving the feed heater in this model", [
          "gas",
          "liquid",
        ])}
        <div className="model-controls">
          <button
            type="button"
            disabled={locked || step === 0}
            onClick={() => update("step", String(step - 1))}
          >
            Previous station
          </button>
          <button
            type="button"
            disabled={locked || step === 6}
            onClick={() => update("step", String(step + 1))}
          >
            Next station
          </button>
        </div>
        <p aria-live="polite" className="oil-given">
          Station {step} of 6: {display.station}. Formula retained:{" "}
          {display.formula}. Marker phase: {display.phase}.
        </p>
        <OilColumnScene3D record={id} step={step} />
        <p>Original tray temperatures; tray numbers start at the bottom.</p>
        <svg
          viewBox="0 0 420 360"
          role="img"
          aria-label={`Labelled supplied temperature profile with five trays. ${display.station}.`}
        >
          <rect
            x="165"
            y="55"
            width="90"
            height="250"
            rx="18"
            fill="#edf2fa"
            stroke="#334155"
          />
          {r.trays.map((t, i) => {
            const y = 270 - i * 45;
            return (
              <g key={i} data-tray={i + 1} data-temperature={t}>
                <line x1="165" x2="315" y1={y} y2={y} stroke="#526480" />
                <text x="140" y={y + 10} textAnchor="end">
                  {t} °C
                </text>
                <text x="345" y={y + 10}>
                  {i + 1}
                </text>
              </g>
            );
          })}
          <path
            d="M205 55 V35 H320 M165 310 H100"
            fill="none"
            stroke="#526480"
            strokeWidth="3"
          />
          <circle
            data-tracer-phase={display.phase}
            cx={markerX}
            cy={markerY}
            r="10"
            fill={display.phase === "gas" ? "#c48b1c" : "#416ac3"}
          />
        </svg>
        <p className="oil-selection">
          Marker colours: gold vapour; blue liquid. The marker denotes the
          selected component, not one atom. The first-cooler-tray rule is the
          stated teaching model, not a unique industrial cut calculation.
        </p>
        <div className="oil-fields">
          {select("path", "Predicted path", ["condensed", "topGas", "residue"])}
          {number("tray", "Collection tray number; 0 means no tray")}
          {select("phase", "Phase at the predicted destination", [
            "liquid",
            "gas",
          ])}
          {select("identity", "Molecular formula after physical separation", [
            "unchanged",
            "broken",
            "newFormula",
          ])}
        </div>
      </>
    );
  }
  if (mode === "trends") {
    const r = oilTrends[id];
    content = (
      <>
        <p>{r.note}</p>
        <p>
          Construct{" "}
          <strong>
            {r.direction === "increasing"
              ? "smallest to largest"
              : "largest to smallest"}
          </strong>
          . Predict property changes in that same requested direction.
        </p>
        <div className="oil-order">
          {[0, 1, 2, 3].map((i) => {
            const index = Number(b["order" + i]),
              s = r.sizes[index],
              move = (to: number) => {
                setFeedback(null);
                append({
                  ...value,
                  ["order" + i]: value["order" + to],
                  ["order" + to]: value["order" + i],
                });
              };
            return (
              <div key={i} className="oil-order-card" data-order-index={index}>
                <span>Position {i + 1}</span>
                <strong>
                  {s.label}: {s.carbons} C atoms
                </strong>
                <div className="oil-size-bar" aria-hidden="true">
                  <span
                    style={{
                      width:
                        (s.carbons /
                          Math.max(...r.sizes.map((x) => x.carbons))) *
                          100 +
                        "%",
                    }}
                  />
                </div>
                <div className="model-controls">
                  <button
                    type="button"
                    disabled={locked || i === 0}
                    aria-label={`Move ${s.label} earlier`}
                    onClick={() => move(i - 1)}
                  >
                    ← Earlier
                  </button>
                  <button
                    type="button"
                    disabled={locked || i === 3}
                    aria-label={`Move ${s.label} later`}
                    onClick={() => move(i + 1)}
                  >
                    Later →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="oil-fields">
          {select("boiling", "Boiling point in your requested size direction", [
            "higher",
            "lower",
            "same",
          ])}
          {select("viscosity", "Viscosity in your requested size direction", [
            "higher",
            "lower",
            "same",
          ])}
          {select(
            "ignition",
            "Ease of ignition in your requested size direction",
            ["higher", "lower", "same"],
          )}
          {select("explanation", "Why boiling behaviour differs", [
            "intermolecular",
            "covalentBroken",
            "atomsLarger",
          ])}
          {number("span", "Largest minus smallest carbon count")}
        </div>
      </>
    );
  }
  if (mode === "uses") {
    const r = oilUses[id];
    content = (
      <>
        <p>{r.note}</p>
        <div className="oil-fields">
          {r.order.map((f, i) =>
            select("use" + i, fractionNames[f] + ": appropriate listed use", [
              "domestic",
              "cars",
              "aircraft",
              "dieselVehicles",
              "shipsPower",
              "roadsRoofs",
            ]),
          )}
        </div>
        <p className="oil-given">Stated target: {fractionNames[r.target]}.</p>
        <div className="oil-fields">
          {select("category", "Purpose of the stated target use", [
            "fuel",
            "material",
            "feedstock",
          ])}
          {select("property", "Appropriate target justification", [
            "ignitesReadily",
            "suitableBoilingRange",
            "viscousSurface",
            "engineSuitability",
            "burnedEnergy",
            "processedMaterials",
          ])}
        </div>
        <p>
          Fraction names denote useful mixtures, not guaranteed pure compounds.
          Suitable engines and the stated process matter. Petroleum gases,
          petrol, kerosene, diesel oil and fuel oil have listed fuel uses;
          bitumen has roads/roofs uses. Chemical feedstock can make useful
          products such as solvents, lubricants, polymers and detergents.
        </p>
      </>
    );
  }
  if (mode === "yield") {
    const r = oilYields[id],
      names = { A: "Source A", B: "Source B" },
      selected = b.selected;
    content = (
      <>
        <p>{r.note}</p>
        <table>
          <caption>Original {r.fraction.toLowerCase()} observations</caption>
          <thead>
            <tr>
              <th>Source</th>
              <th>Yield / %</th>
              <th>Feed mass / kg</th>
            </tr>
          </thead>
          <tbody>
            {r.percentages.map((p, i) => (
              <tr key={i}>
                <th scope="row">{i ? "B" : "A"}</th>
                <td>{p}</td>
                <td>{r.feedMasses[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="oil-given">
          Criterion:{" "}
          {r.criterion === "mass"
            ? "larger mass of the desired fraction"
            : "larger percentage yield of the desired fraction"}
          . Axis: 0–{r.max}%, major intervals {r.step} percentage points.
        </p>
        {number("scaleStep", "Your major scale interval / percentage points")}
        <p className="oil-chart-heading">{r.fraction} / % by mass</p>
        <OilBarChart
          max={r.max}
          step={b.scaleStep}
          bars={[b.drawnA, b.drawnB]}
          placed={[b.placedA === "yes", b.placedB === "yes"]}
          onChoose={
            locked
              ? undefined
              : (s, h) => {
                  setFeedback(null);
                  setRaw((old) =>
                    Object.fromEntries(
                      Object.entries(old).filter(([k]) => k !== "bar" + s),
                    ),
                  );
                  append({ ...value, selected: s, ["bar" + s]: String(h) });
                }
          }
        />
        <p>
          Source. Bars show only your explicitly placed predictions; original
          data stays in the table.
        </p>
        {select("selected", "Choose source bar", ["A", "B"], names)}
        <div className="oil-fields">
          {number("barA", "Source A predicted bar height / %")}
          {number("barB", "Source B predicted bar height / %")}
        </div>
        <div className="model-controls">
          <button
            type="button"
            disabled={
              locked ||
              Object.hasOwn(raw, "bar" + selected) ||
              b["bar" + selected] === "" ||
              Number(b["bar" + selected]) > r.max
            }
            onClick={() => {
              setFeedback(null);
              append({
                ...value,
                ["drawn" + selected]: value["bar" + selected],
                ["placed" + selected]: "yes",
              });
            }}
          >
            Place selected bar
          </button>
        </div>
        <p>
          Placed: A{b.placedA === "yes" ? ` at ${b.drawnA}%` : " not placed"}; B
          {b.placedB === "yes" ? ` at ${b.drawnB}%` : " not placed"}.
          Outside-axis predictions are clipped visually; correct bar heights
          must follow the supplied observations.
        </p>
        <p>
          Desired fraction mass = percentage ÷100 × feed mass. A higher
          percentage is not automatically more kilograms when the feed masses
          differ.
        </p>
        <div className="oil-fields">
          {number("massA", "Source A desired fraction / kg")}
          {number("massB", "Source B desired fraction / kg")}
          {select("preference", "Preferred source under the stated criterion", [
            "A",
            "B",
            "equal",
          ])}
          {select("interpretation", "What does the comparison establish?", [
            "criterion",
            "alwaysMore",
            "density",
          ])}
        </div>
      </>
    );
  }
  return (
    <section
      className="model task-workbench oil-workbench"
      aria-label="Task model"
    >
      {mode === "inventory" && toggleComponent(0)}
      <h3>{instruction ?? titles[mode]}</h3>
      {content}
      <div className="model-controls">
        <button
          type="button"
          className="button"
          onClick={() =>
            setFeedback(
              Object.keys(raw).length
                ? {
                    correct: false,
                    message:
                      "Your raw entries remain visible. Correct ordinary decimal fields before checking; the last committed model predictions are retained.",
                  }
                : checkOilBoard(mode, value),
            )
          }
        >
          Check model
        </button>
        <button
          type="button"
          disabled={!Object.keys(raw).length && history.length <= 1}
          onClick={() => {
            setFeedback(null);
            if (Object.keys(raw).length) setRaw({});
            else onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => {
            setFeedback(null);
            setRaw({});
            onChange([initialOilBoard(mode, original)]);
          }}
        >
          Reset model
        </button>
      </div>
      {Object.keys(raw).length > 0 && (
        <p role="status">
          Raw incomplete, fractional or noncanonical entries remain visible.
          Other valid predictions can still be committed individually. Undo
          discards raw entries before changing saved history.
        </p>
      )}
      {locked && (
        <p role="status">
          This task&apos;s model history is full. Undo or reset the model to
          continue; learning exposure and assessment history are retained.
        </p>
      )}
      {feedback && (
        <div
          role="status"
          className={
            "feedback " + (feedback.correct ? "correct" : "incorrect retry")
          }
        >
          {feedback.message}
        </div>
      )}
      <details>
        <summary>Choose another supplied comparison</summary>
        <label htmlFor={uid + "-record"}>Supplied comparison</label>
        <select
          id={uid + "-record"}
          disabled={locked}
          value={id}
          onChange={(e) => {
            if (e.target.value === id) return;
            setFeedback(null);
            setRaw({});
            append(initialOilBoard(mode, e.target.value));
          }}
        >
          {Object.entries(oilRecords[mode]).map(([k, r]) => (
            <option key={k} value={k}>
              {r.title}
            </option>
          ))}
        </select>
      </details>
    </section>
  );
}
