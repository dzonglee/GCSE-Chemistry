"use client";
import { useState } from "react";
import { elements } from "@/content/elements";
import type { Lesson } from "@/content/types";
import { mark } from "@/lib/marking";
import {
  atomCounts,
  waterBalance,
  profile,
  organicHydrogen,
  shift,
  rf,
} from "@/lib/science";
interface Props {
  lesson: Lesson;
  state: Record<string, string | number>;
  onChange: (next: Record<string, string | number>) => void;
}
function Control({
  label,
  value,
  min,
  max,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="range-label">
      <span>
        {label} <strong>{value}</strong>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
export function ChemistryModel({ lesson, state, onChange }: Props) {
  const [feedback, setFeedback] = useState("");
  const value = (key: string, fallback: number) =>
    typeof state[key] === "number" ? (state[key] as number) : fallback;
  const text = (key: string, fallback: string) =>
    typeof state[key] === "string" ? (state[key] as string) : fallback;
  const change = (key: string, v: string | number) => {
    onChange({ ...state, [key]: v });
    setFeedback("");
  };
  const reset = () => {
    onChange({});
    setFeedback("Model reset. Try another prediction.");
  };
  let body: React.ReactNode;
  if (lesson.model === "atom") {
    const p = value("p", 8),
      n = value("n", 8),
      e = value("e", 8);
    const counts = atomCounts(p, n, e).shells;
    const name = [
      "",
      "Hydrogen",
      "Helium",
      "Lithium",
      "Beryllium",
      "Boron",
      "Carbon",
      "Nitrogen",
      "Oxygen",
      "Fluorine",
      "Neon",
      "Sodium",
      "Magnesium",
      "Aluminium",
      "Silicon",
      "Phosphorus",
      "Sulfur",
      "Chlorine",
      "Argon",
      "Potassium",
      "Calcium",
    ][p];
    const target =
      lesson.slug === "electron-shells"
        ? [11, 12, 11]
        : lesson.slug === "periodic-patterns"
          ? [12, 12, 12]
          : lesson.slug === "isotopes-and-ions"
            ? [8, 10, 10]
            : [8, 10, 8];
    const task =
      lesson.slug === "electron-shells"
        ? "Build neutral sodium-23: 11 protons. Use its shell arrangement to identify Group 1 and Period 3."
        : lesson.slug === "periodic-patterns"
          ? "Choose sodium and magnesium in the table. Build magnesium-24 and compare their shells and group positions."
          : lesson.slug === "isotopes-and-ions"
            ? "Build an oxygen-18 oxide ion: 8 protons, mass number 18 and overall charge −2. Compare it with a neutral atom."
            : "Build a neutral oxygen-18 atom: 8 protons, mass number 18 and no overall charge. Then change an electron and compare.";
    body = (
      <>
        <p className="model-task">{task}</p>
        <div className="model-grid">
          <svg
            role="img"
            aria-label={`${name}: ${p} protons, ${n} neutrons and ${e} electrons`}
            viewBox="0 0 300 300"
          >
            <circle cx="150" cy="150" r="26" className="nucleus" />
            <text x="150" y="146" textAnchor="middle" className="svg-light">
              {p} p⁺
            </text>
            <text x="150" y="166" textAnchor="middle" className="svg-light">
              {n} n
            </text>
            {counts.map((count, s) => (
              <g key={s}>
                {count > 0 && (
                  <circle cx="150" cy="150" r={48 + s * 26} className="orbit" />
                )}
                {Array.from({ length: count }, (_, i) => {
                  const a = (i * 2 * Math.PI) / count - Math.PI / 2;
                  return (
                    <circle
                      key={i}
                      cx={150 + (48 + s * 26) * Math.cos(a)}
                      cy={150 + (48 + s * 26) * Math.sin(a)}
                      r="6"
                      className="electron"
                    />
                  );
                })}
              </g>
            ))}
          </svg>
          <div>
            <Control
              label="Protons"
              value={p}
              min={1}
              max={20}
              onChange={(v) => change("p", v)}
            />
            <Control
              label="Neutrons"
              value={n}
              min={0}
              max={24}
              onChange={(v) => change("n", v)}
            />
            <Control
              label="Electrons"
              value={e}
              min={0}
              max={20}
              onChange={(v) => change("e", v)}
            />
            <div className="readout" aria-live="polite">
              <strong>{name}</strong>
              <span>
                Atomic number {p} · Mass number {p + n}
              </span>
              <span>
                Charge {p - e > 0 ? "+" : ""}
                {p - e} · Shells{" "}
                {counts.filter((x) => x > 0).join(",") || "empty"}
              </span>
            </div>
            <button
              className="button"
              onClick={() =>
                setFeedback(
                  p === target[0] && n === target[1] && e === target[2]
                    ? `Correct: ${name.toLowerCase()}-${p + n} has ${p} protons, ${n} neutrons and ${e} electrons.`
                    : `For this task, use ${target[0]} protons, ${target[1]} neutrons and ${target[2]} electrons. Mass number counts nuclear particles; charge is protons minus electrons.`,
                )
              }
            >
              Check atom
            </button>
          </div>
        </div>
        <details
          className="periodic-reference"
          open={lesson.slug === "periodic-patterns" ? true : undefined}
        >
          <summary>Explore the first 20 elements</summary>
          <p>
            Choose an element to build a neutral atom of one common isotope. A
            mass number here is not the weighted relative atomic mass.
          </p>
          <div
            className="periodic-scroll"
            tabIndex={0}
            aria-label="First 20 elements; scroll horizontally on small screens"
          >
            <div className="periodic-grid">
              {elements.map((element) => (
                <button
                  key={element.symbol}
                  style={{
                    gridColumn: element.column,
                    gridRow: element.period,
                  }}
                  aria-label={`${element.name}, atomic number ${element.protons}`}
                  aria-pressed={p === element.protons}
                  onClick={() => {
                    onChange({
                      ...state,
                      p: element.protons,
                      n: element.mass - element.protons,
                      e: element.protons,
                    });
                    setFeedback("");
                  }}
                >
                  <small>{element.protons}</small>
                  <strong>{element.symbol}</strong>
                </button>
              ))}
            </div>
          </div>
          <p className="caption">
            Columns follow modern positions. GCSE main groups 3–7 occupy modern
            columns 13–17; Group 0 is modern Group 18. Periods are rows.
          </p>
        </details>
        <p className="caption">
          Simplified shell diagram for the first 20 elements; not to scale.
          Nuclear particles are counted, not shown individually. Arbitrary ion
          counts are a charge model, not a claim that every configuration is
          stable.
        </p>
      </>
    );
  } else if (lesson.model === "balance") {
    const h = value("h", 1),
      o = value("o", 1),
      w = value("w", 1);
    const balanced = waterBalance(h, o, w).balanced;
    body = (
      <>
        <p className="model-task">
          Balance hydrogen + oxygen → water using the smallest positive
          whole-number coefficients.
        </p>
        <div className="equation">
          {h}H₂ + {o}O₂ → {w}H₂O
        </div>
        <div className="model-grid">
          <div>
            <Control
              label="Hydrogen coefficient"
              value={h}
              min={1}
              max={6}
              onChange={(v) => change("h", v)}
            />
            <Control
              label="Oxygen coefficient"
              value={o}
              min={1}
              max={6}
              onChange={(v) => change("o", v)}
            />
            <Control
              label="Water coefficient"
              value={w}
              min={1}
              max={6}
              onChange={(v) => change("w", v)}
            />
          </div>
          <div className="atom-totals">
            <h3>Atom ledger</h3>
            {[
              ["Hydrogen", 2 * h, 2 * w],
              ["Oxygen", 2 * o, w],
            ].map(([label, left, right]) => (
              <div key={label}>
                <strong>{label}</strong>
                <span>
                  {left} before · {right} after
                </span>
                <div className="dot-row" aria-hidden="true">
                  {Array.from({ length: Number(left) }, (_, i) => (
                    <i key={i} />
                  ))}
                  <span>→</span>
                  {Array.from({ length: Number(right) }, (_, i) => (
                    <i key={i} />
                  ))}
                </div>
              </div>
            ))}
            <p role="status">
              {balanced ? "Atoms conserved." : "Atom counts do not match yet."}
            </p>
            <button
              className="button"
              onClick={() =>
                setFeedback(
                  h === 2 && o === 1 && w === 2
                    ? "Correct: 2H₂ + O₂ → 2H₂O is balanced in the smallest whole-number ratio."
                    : balanced
                      ? "Balanced, but divide the coefficients to the smallest whole-number ratio."
                      : "Change coefficients only. Match H atoms and O atoms on both sides.",
                )
              }
            >
              Check coefficients
            </button>
          </div>
        </div>
      </>
    );
  } else if (lesson.model === "bond") {
    const selected = text("material", "sodium-chloride");
    const melted = Boolean(value("melted", 0));
    const materials = [
      ["sodium-chloride", "Sodium chloride"],
      ["copper", "Copper"],
      ["diamond", "Diamond"],
      ["graphite", "Graphite"],
      ["methane", "Methane"],
    ];
    const conducts =
      selected === "copper" ||
      selected === "graphite" ||
      (selected === "sodium-chloride" && melted);
    const descriptions: Record<string, string> = {
      "sodium-chloride": melted
        ? "Mobile Na⁺ and Cl⁻ ions carry charge."
        : "Oppositely charged ions in fixed lattice positions.",
      copper: "Positive metal ions surrounded by delocalised electrons.",
      diamond:
        "Each carbon makes four bonds in a rigid 3D network; no delocalised electrons.",
      graphite:
        "Each carbon makes three bonds in layers; delocalised electrons carry charge.",
      methane:
        "Small neutral CH₄ molecules with weak intermolecular attractions.",
    };
    body = (
      <>
        <p className="model-task">
          Choose a material and predict whether it conducts. Explain the charge
          carrier before revealing the result.
        </p>
        <label>
          Material
          <select
            aria-label="Material"
            value={selected}
            onChange={(e) => change("material", e.target.value)}
          >
            {materials.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {selected === "sodium-chloride" && (
          <label className="check-label">
            <input
              type="checkbox"
              checked={melted}
              onChange={(e) => change("melted", Number(e.target.checked))}
            />{" "}
            Molten rather than solid
          </label>
        )}
        <svg
          viewBox="0 0 400 160"
          role="img"
          aria-label={`Schematic structure of ${materials.find((m) => m[0] === selected)?.[1]}`}
        >
          {Array.from({ length: 18 }, (_, i) => {
            const x = 35 + (i % 6) * 64,
              y = 35 + Math.floor(i / 6) * 45;
            const ion = selected === "sodium-chloride";
            const alternate = (Math.floor(i / 6) + (i % 6)) % 2;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="16"
                  className={
                    ion && alternate ? "particle-gold" : "particle-blue"
                  }
                />
                <text x={x} y={y + 5} textAnchor="middle" className="svg-light">
                  {ion
                    ? alternate
                      ? "−"
                      : "+"
                    : selected === "copper"
                      ? "+"
                      : selected === "methane"
                        ? "CH₄"
                        : "C"}
                </text>
                {(selected === "diamond" || selected === "graphite") &&
                  i % 6 < 5 && (
                    <line
                      x1={x + 17}
                      y1={y}
                      x2={x + 47}
                      y2={y}
                      className="bond-line"
                    />
                  )}
              </g>
            );
          })}
        </svg>
        <p>{descriptions[selected]}</p>
        <div className="button-row">
          <button
            className="button"
            onClick={() =>
              setFeedback(
                conducts
                  ? "Correct prediction: it conducts because charged particles can move."
                  : "Not here: this form has no mobile charged particles, so it does not conduct.",
              )
            }
          >
            Predict: conducts
          </button>
          <button
            className="button"
            onClick={() =>
              setFeedback(
                !conducts
                  ? "Correct prediction: it does not conduct in this form."
                  : "Check the available charge carriers. This form does conduct.",
              )
            }
          >
            Predict: does not conduct
          </button>
        </div>
        <p className="caption">
          Schematic particle arrangement, not a complete molecular or 3D lattice
          diagram. Use the description to interpret bonding.
        </p>
      </>
    );
  } else if (lesson.model === "moles") {
    const mode =
      lesson.slug === "yield-and-atom-economy"
        ? "yield"
        : lesson.slug === "conservation-and-concentration"
          ? "concentration"
          : lesson.slug === "formulae-and-mass"
            ? "formula"
            : lesson.slug === "gas-volumes-and-solutions"
              ? "gas"
              : "moles";
    const a = value("a", mode === "formula" ? 1 : 12),
      b = value("b", mode === "formula" ? 2 : 24);
    const result =
      mode === "formula"
        ? 12 * a + 16 * b
        : mode === "yield"
          ? (a / b) * 100
          : mode === "concentration"
            ? a / (b / 1000)
            : mode === "gas"
              ? a * 24
              : a / b;
    const task =
      mode === "formula"
        ? "Build the atom counts in CO₂: choose 1 carbon and 2 oxygens."
        : mode === "yield"
          ? "Set actual yield to 15 g and theoretical yield to 20 g. Predict the percentage."
          : mode === "concentration"
            ? "Dissolve 10 g in a final volume of 500 cm³. Predict concentration in g/dm³."
            : mode === "gas"
              ? "Set amount to 0.5 mol. Predict gas volume at the stated conditions."
              : "Set mass to 24 g and molar mass to 12 g/mol. Predict the amount in moles.";
    const target =
      mode === "formula"
        ? [1, 2]
        : mode === "yield"
          ? [15, 20]
          : mode === "concentration"
            ? [10, 500]
            : mode === "gas"
              ? [0.5, b]
              : [24, 12];
    body = (
      <>
        <p className="model-task">{task}</p>
        <Control
          label={
            mode === "formula"
              ? "Carbon atoms"
              : mode === "yield"
                ? "Actual yield / g"
                : mode === "gas"
                  ? "Amount / mol"
                  : "Mass / g"
          }
          value={a}
          min={mode === "gas" ? 0.1 : 1}
          max={mode === "formula" ? 6 : mode === "gas" ? 2 : 60}
          step={mode === "gas" ? 0.1 : 1}
          onChange={(v) => change("a", v)}
        />
        {mode !== "gas" && (
          <Control
            label={
              mode === "formula"
                ? "Oxygen atoms"
                : mode === "yield"
                  ? "Theoretical yield / g"
                  : mode === "concentration"
                    ? "Final solution volume / cm³"
                    : "Molar mass / g/mol"
            }
            value={b}
            min={1}
            max={mode === "concentration" ? 1000 : mode === "formula" ? 6 : 100}
            onChange={(v) => change("b", v)}
          />
        )}
        <div className="readout big" aria-live="polite">
          <strong>
            {Number(result.toFixed(4))}{" "}
            {mode === "formula"
              ? "relative mass"
              : mode === "yield"
                ? "%"
                : mode === "concentration"
                  ? "g/dm³"
                  : mode === "gas"
                    ? "dm³"
                    : "mol"}
          </strong>
          <span>
            {mode === "formula"
              ? `${a} × 12 + ${b} × 16`
              : mode === "yield"
                ? `${a} ÷ ${b} × 100`
                : mode === "concentration"
                  ? `${a} ÷ (${b} ÷ 1000)`
                  : mode === "gas"
                    ? `${a} × 24`
                    : `${a} ÷ ${b}`}
          </span>
        </div>
        <button
          className="button"
          onClick={() =>
            setFeedback(
              Math.abs(a - target[0]) < 0.00001 &&
                (mode === "gas" || b === target[1])
                ? "Target reached. Explain the conversion using the quantities and units shown."
                : "Adjust the quantities to the target task, then read the calculation again.",
            )
          }
        >
          Check target
        </button>
        <p className="caption">
          {mode === "gas"
            ? "Approximate molar volume 24 dm³/mol at GCSE room temperature and pressure."
            : mode === "yield" && a > b
              ? "A yield above 100% suggests contamination or measurement error; it is not extra atoms created."
              : "The numerical model displays the formula and units; it does not perform a real experiment."}
        </p>
      </>
    );
  } else if (lesson.model === "ph") {
    const ph = value("ph", 7);
    body = (
      <>
        <p className="model-task">
          Move from pH 4 to pH 3. Predict how the hydrogen ion concentration
          changes, then compare the readout.
        </p>
        <Control
          label="pH"
          value={ph}
          min={0}
          max={14}
          onChange={(v) => change("ph", v)}
        />
        <div className="ph-scale" aria-hidden="true">
          {Array.from({ length: 15 }, (_, i) => (
            <span className={i === ph ? "active" : ""} key={i}>
              {i}
            </span>
          ))}
        </div>
        <div className="readout big" aria-live="polite">
          <strong>
            {ph < 7 ? "Acidic" : ph === 7 ? "Neutral" : "Alkaline"}
          </strong>
          <span>[H⁺] ≈ 10⁻{ph} mol/dm³</span>
          <span>
            {ph <= 7
              ? `H⁺ concentration is ${10 ** (7 - ph)} times the pH 7 value.`
              : `H⁺ concentration is 1/${10 ** (ph - 7)} of the pH 7 value.`}
          </span>
        </div>
        <button
          className="button"
          onClick={() =>
            setFeedback(
              "Going from pH 4 to pH 3 increases H⁺ concentration tenfold. Lower pH means more hydrogen ions, not a larger amount of every substance.",
            )
          }
        >
          Explain the pH step
        </button>
        <p className="caption">
          Idealised aqueous model near 25 °C. pH is about hydrogen ion
          concentration; it does not alone tell you whether an acid is strong or
          weak.
        </p>
      </>
    );
  } else if (lesson.model === "energy") {
    const react = value("react", 60),
      product = value("product", 25),
      activation = value("activation", 50),
      catalyst = Boolean(value("catalyst", 0));
    const peak = profile(react, product, activation, catalyst).peak,
      scale = 1.25;
    const y = (energy: number) => 230 - energy * scale;
    body = (
      <>
        <p className="model-task">
          Make an exothermic profile with an overall change of −30 kJ. Add a
          catalyst and check what stays unchanged.
        </p>
        <div className="model-grid">
          <svg
            viewBox="0 0 400 280"
            role="img"
            aria-label={`Reaction profile: reactants ${react}, products ${product}, activation energy ${Number((peak - react).toFixed(1))} kJ`}
          >
            <line x1="40" y1="245" x2="380" y2="245" className="axis" />
            <line x1="40" y1="245" x2="40" y2="10" className="axis" />
            <path
              d={`M 55 ${y(react)} L 95 ${y(react)} C 150 ${y(react)}, 160 ${y(peak)}, 215 ${y(peak)} S 275 ${y(product)}, 325 ${y(product)} L 370 ${y(product)}`}
              className="profile-line"
            />
            <text x="60" y={y(react) - 10}>
              Reactants
            </text>
            <text x="280" y={y(product) - 10}>
              Products
            </text>
            <text x="160" y="270">
              Reaction pathway
            </text>
            <text x="8" y="140" transform="rotate(-90 8 140)">
              Energy / kJ
            </text>
          </svg>
          <div>
            <Control
              label="Reactant energy / kJ"
              value={react}
              min={10}
              max={90}
              onChange={(v) => change("react", v)}
            />
            <Control
              label="Product energy / kJ"
              value={product}
              min={10}
              max={90}
              onChange={(v) => change("product", v)}
            />
            <Control
              label="Extra barrier above the higher endpoint / kJ"
              value={activation}
              min={20}
              max={70}
              onChange={(v) => change("activation", v)}
            />
            <label className="check-label">
              <input
                type="checkbox"
                checked={catalyst}
                onChange={(e) => change("catalyst", Number(e.target.checked))}
              />{" "}
              Add a catalyst
            </label>
          </div>
        </div>
        <div className="readout" aria-live="polite">
          <strong>
            Overall change: {product - react > 0 ? "+" : ""}
            {product - react} kJ ·{" "}
            {product < react
              ? "exothermic"
              : product > react
                ? "endothermic"
                : "no net change"}
          </strong>
          <span>Activation energy: {Number((peak - react).toFixed(1))} kJ</span>
        </div>
        <button
          className="button"
          onClick={() =>
            setFeedback(
              product - react === -30
                ? "Correct: products are 30 kJ lower. The catalyst lowers the barrier but does not change that energy difference."
                : "Set products 30 kJ below reactants. A catalyst should only lower the pathway barrier.",
            )
          }
        >
          Check profile
        </button>
        <p className="caption">
          Schematic profile with arbitrary energy reference. The pathway axis is
          not time. The barrier control sits above the higher endpoint;
          activation energy is measured from reactants to the peak.
        </p>
      </>
    );
  } else if (lesson.model === "rate") {
    const concentration = value("concentration", 1),
      temperature = value("temperature", 20),
      surface = value("surface", 1),
      catalyst = Boolean(value("catalyst", 0));
    const index =
      concentration *
      surface *
      (1 + (temperature - 20) / 40) *
      (catalyst ? 1.6 : 1);
    body = (
      <>
        <p className="model-task">
          Predict how changing one condition affects the reaction rate. Keep the
          other three fixed to make a fair comparison.
        </p>
        <div className="model-grid">
          <div>
            <Control
              label="Relative concentration"
              value={concentration}
              min={1}
              max={4}
              onChange={(v) => change("concentration", v)}
            />
            <Control
              label="Temperature / °C"
              value={temperature}
              min={20}
              max={60}
              onChange={(v) => change("temperature", v)}
            />
            <Control
              label="Relative exposed surface"
              value={surface}
              min={1}
              max={4}
              onChange={(v) => change("surface", v)}
            />
            <label className="check-label">
              <input
                type="checkbox"
                checked={catalyst}
                onChange={(e) => change("catalyst", Number(e.target.checked))}
              />{" "}
              Catalyst present
            </label>
          </div>
          <div>
            <svg
              role="img"
              aria-label="Schematic product–time curves comparing initial and chosen conditions"
              viewBox="0 0 350 240"
            >
              <line x1="30" y1="210" x2="330" y2="210" className="axis" />
              <line x1="30" y1="210" x2="30" y2="15" className="axis" />
              {[1, index].map((rate, i) => (
                <polyline
                  key={i}
                  points={Array.from(
                    { length: 31 },
                    (_, t) =>
                      `${30 + t * 10},${210 - 170 * (1 - Math.exp((-t * rate) / 10))}`,
                  ).join(" ")}
                  className={i ? "profile-line" : "reference-line"}
                />
              ))}
              <text x="90" y="235">
                Time (illustrative scale)
              </text>
              <text x="40" y="25">
                Product formed
              </text>
            </svg>
            <p className="legend">
              <span>Grey: starting conditions</span>
              <span>Blue: chosen conditions</span>
            </p>
          </div>
        </div>
        <div className="readout" aria-live="polite">
          <strong>
            {index === 1
              ? "Same as the starting conditions"
              : "Faster than the starting conditions"}
          </strong>
          <span>
            {concentration > 1
              ? "More particles per volume increase collision frequency. "
              : ""}
            {temperature > 20 ? "More particles have enough energy. " : ""}
            {surface > 1 ? "More solid surface is exposed. " : ""}
            {catalyst ? "A different pathway has a lower barrier." : ""}
          </span>
        </div>
        <p className="caption">
          Qualitative teaching simulation, not a fitted rate law or prediction
          of experimental times. The final amount is held constant to isolate
          rate effects.
        </p>
      </>
    );
  } else if (lesson.model === "equilibrium") {
    const pressure = text("pressure", "same"),
      temp = text("temp", "same"),
      reactant = text("reactant", "same");
    const direction = shift(pressure, temp, reactant);
    body = (
      <>
        <p className="model-task">
          Exothermic Haber reaction: change one condition and predict the shift.
        </p>
        <div className="equation">N₂ + 3H₂ ⇌ 2NH₃</div>
        <div className="model-grid">
          <div>
            <label>
              Pressure
              <select
                aria-label="Pressure"
                value={pressure}
                onChange={(e) => change("pressure", e.target.value)}
              >
                <option value="same">Unchanged</option>
                <option value="high">Increase</option>
                <option value="low">Decrease</option>
              </select>
            </label>
            <label>
              Temperature
              <select
                aria-label="Temperature"
                value={temp}
                onChange={(e) => change("temp", e.target.value)}
              >
                <option value="same">Unchanged</option>
                <option value="high">Increase</option>
                <option value="low">Decrease</option>
              </select>
            </label>
            <label>
              Nitrogen concentration
              <select
                aria-label="Nitrogen concentration"
                value={reactant}
                onChange={(e) => change("reactant", e.target.value)}
              >
                <option value="same">Unchanged</option>
                <option value="add">Add nitrogen</option>
              </select>
            </label>
          </div>
          <div className="readout big" aria-live="polite">
            <strong>
              {direction === "multiple"
                ? "Several changes: evaluate their effects separately"
                : direction === "products"
                  ? "Shift towards ammonia →"
                  : direction === "reactants"
                    ? "← Shift towards reactants"
                    : "No imposed shift"}
            </strong>
            <span>4 gas molecules ⇌ 2 gas molecules</span>
            <span>
              {pressure === "high"
                ? "Higher pressure favours the side with fewer gas molecules."
                : pressure === "low"
                  ? "Lower pressure favours the side with more gas molecules."
                  : ""}
            </span>
            <span>
              {temp === "high"
                ? "Higher temperature favours the reverse endothermic direction."
                : temp === "low"
                  ? "Lower temperature favours the forward exothermic direction."
                  : ""}
            </span>
            <span>
              {reactant === "add"
                ? "Adding nitrogen favours its consumption towards products."
                : ""}
            </span>
          </div>
        </div>
        <p className="caption">
          Qualitative direction only, not a numerical yield calculation. At
          equilibrium both reactions continue at equal rates; concentrations
          need not be equal.
        </p>
      </>
    );
  } else if (lesson.model === "organic") {
    const carbon = value("carbon", 2),
      group = text("group", "alkane");
    const hydrogen = organicHydrogen(carbon, group);
    const formula = `C${carbon === 1 ? "" : carbon}H${hydrogen}${group === "alcohol" ? "O" : group === "acid" ? "O₂" : ""}`;
    body = (
      <>
        <p className="model-task">
          Build ethene: choose two carbons and the alkene family. Compare with
          ethane, then inspect the functional groups.
        </p>
        <Control
          label="Carbon atoms"
          value={carbon}
          min={2}
          max={8}
          onChange={(v) => change("carbon", v)}
        />
        <label>
          Compound family
          <select
            aria-label="Compound family"
            value={group}
            onChange={(e) => change("group", e.target.value)}
          >
            <option value="alkane">Alkane (saturated)</option>
            <option value="alkene">Alkene (one C=C)</option>
            <option value="alcohol">Alcohol (one –OH)</option>
            <option value="acid">Carboxylic acid (one –COOH)</option>
          </select>
        </label>
        <div
          className="carbon-chain"
          aria-label={`Simplified carbon chain with ${carbon} carbon atoms`}
        >
          {Array.from({ length: carbon }, (_, i) => (
            <span key={i}>
              <b>C</b>
              {i < carbon - 1 && (
                <i>{group === "alkene" && i === 0 ? "=" : "–"}</i>
              )}
            </span>
          ))}
          {group === "alcohol" && <b>–OH</b>}
          {group === "acid" && <b> (terminal –COOH)</b>}
        </div>
        <div className="readout big" aria-live="polite">
          <strong>
            {formula.replace(/\d/g, (digit) => "₀₁₂₃₄₅₆₇₈₉"[Number(digit)])}
          </strong>
          <span>
            {group === "alkene"
              ? "One carbon–carbon double bond; unsaturated."
              : group === "alkane"
                ? "All carbon–carbon bonds are single."
                : group === "alcohol"
                  ? "The hydroxyl group belongs to the alcohol family."
                  : "The terminal carbon is part of the carboxyl group."}
          </span>
        </div>
        <button
          className="button"
          onClick={() =>
            setFeedback(
              carbon === 2 && group === "alkene"
                ? "Correct: ethene is C₂H₄. The double bond makes addition reactions possible."
                : "Ethene needs two carbon atoms and a carbon–carbon double bond.",
            )
          }
        >
          Check ethene
        </button>
        <p className="caption">
          Straight-chain representative formulae, not every possible isomer.
          Diagram omits hydrogen atoms and is not a complete displayed formula.
        </p>
      </>
    );
  } else if (lesson.model === "chromatography") {
    const distance = value("distance", 3),
      front = value("front", 6);
    body = (
      <>
        <p className="model-task">
          Place the spot so that Rf = 0.5. Both distances are measured from the
          same baseline.
        </p>
        <div className="model-grid">
          <svg
            viewBox="0 0 260 300"
            role="img"
            aria-label={`Chromatogram: spot ${distance} cm, solvent front ${front} cm from baseline`}
          >
            <rect
              x="40"
              y="10"
              width="150"
              height="270"
              className="paper-rect"
            />
            <line x1="40" y1="260" x2="190" y2="260" className="axis" />
            <line
              x1="40"
              y1={260 - front * 24}
              x2="190"
              y2={260 - front * 24}
              className="reference-line"
            />
            <circle
              cx="115"
              cy={260 - distance * 24}
              r="9"
              className="electron"
            />
            <text x="45" y="282">
              Baseline
            </text>
            <text x="45" y={250 - front * 24}>
              Solvent front
            </text>
          </svg>
          <div>
            <Control
              label="Solvent-front distance / cm"
              value={front}
              min={1}
              max={10}
              onChange={(v) => {
                onChange({
                  ...state,
                  front: v,
                  distance: Math.min(distance, v),
                });
                setFeedback("");
              }}
            />
            <Control
              label="Spot distance / cm"
              value={Math.min(distance, front)}
              min={0}
              max={front}
              step={0.5}
              onChange={(v) => change("distance", v)}
            />
            <div className="readout" aria-live="polite">
              <strong>
                Rf = {Math.min(distance, front)} ÷ {front} ={" "}
                {Number((rf(Math.min(distance, front), front) ?? 0).toFixed(3))}
              </strong>
              <span>Rf has no units.</span>
            </div>
            <button
              className="button"
              onClick={() =>
                setFeedback(
                  Math.abs(distance / front - 0.5) < 0.001
                    ? "Correct: the spot travels half as far as the solvent front."
                    : "Set the spot distance to half the solvent-front distance.",
                )
              }
            >
              Check Rf
            </button>
          </div>
        </div>
      </>
    );
  } else if (lesson.model === "electrolysis") {
    const substance = text("substance", "molten-nacl");
    const samples: Record<string, [string, string, string, string]> = {
      "molten-nacl": [
        "Molten sodium chloride",
        "Sodium",
        "Chlorine",
        "Na⁺ gains electrons; Cl⁻ loses electrons.",
      ],
      "molten-pbbr": [
        "Molten lead bromide",
        "Lead",
        "Bromine",
        "Pb²⁺ gains electrons; Br⁻ loses electrons.",
      ],
      "aqueous-cuso": [
        "Aqueous copper sulfate, inert electrodes",
        "Copper",
        "Oxygen",
        "Copper ions are reduced; water-derived hydroxide ions are oxidised.",
      ],
      brine: [
        "Concentrated aqueous sodium chloride, inert electrodes",
        "Hydrogen",
        "Chlorine",
        "Hydrogen forms instead of sodium; chloride gives chlorine under these stated conditions.",
      ],
    };
    const sample = samples[substance];
    body = (
      <>
        <p className="model-task">
          Choose a system and predict its cathode product. Notice when water
          introduces competing ions.
        </p>
        <label>
          System
          <select
            aria-label="System"
            value={substance}
            onChange={(e) => change("substance", e.target.value)}
          >
            {Object.entries(samples).map(([id, s]) => (
              <option key={id} value={id}>
                {s[0]}
              </option>
            ))}
          </select>
        </label>
        <div className="cell-diagram">
          <div>
            <b>Cathode −</b>
            <span>Positive ions move here</span>
            <span>Gain electrons: reduction</span>
          </div>
          <span className="ion-arrow" aria-hidden="true">
            ← + · − →
          </span>
          <div>
            <b>Anode +</b>
            <span>Negative ions move here</span>
            <span>Lose electrons: oxidation</span>
          </div>
        </div>
        <div className="button-row">
          {["Sodium", "Lead", "Copper", "Hydrogen"].map((answer) => (
            <button
              key={answer}
              className="button"
              onClick={() =>
                setFeedback(
                  answer === sample[1]
                    ? `Correct: ${sample[1]} forms at the cathode and ${sample[2].toLowerCase()} at the anode. ${sample[3]}`
                    : `Not in this system. ${sample[3]} Predict again using the ions and presence or absence of water.`,
                )
              }
            >
              {answer}
            </button>
          ))}
        </div>
        <p className="caption">
          School-level product predictions for specified systems, not a complete
          electrochemical model. This is a simulation; do not attempt
          electrolysis at home.
        </p>
      </>
    );
  } else {
    const question = lesson.questions[0];
    const chosen = text("prediction", "");
    const result = chosen ? mark(question, chosen) : null;
    body = (
      <>
        <p className="model-task">Predict, compare, explain</p>
        <h3>{question.prompt}</h3>
        {question.options ? (
          <div className="prediction-cards">
            {question.options.map((option) => (
              <button
                className="prediction-card"
                aria-pressed={chosen === option}
                key={option}
                onClick={() => {
                  change("prediction", option);
                  setFeedback("");
                }}
              >
                {option}
                <span>
                  {chosen === option
                    ? "Your prediction"
                    : "Choose this prediction"}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <label>
            Your prediction
            <input
              value={chosen}
              onChange={(e) => change("prediction", e.target.value)}
              inputMode="decimal"
            />
          </label>
        )}
        {result && (
          <div
            className={`feedback ${result.correct ? "correct" : "retry"}`}
            role="status"
          >
            <strong>
              {result.correct
                ? "Prediction supported"
                : "Reconsider your prediction"}
            </strong>
            <p>{result.correct ? question.explanation : result.feedback}</p>
          </div>
        )}
        <details>
          <summary>Reason through the evidence</summary>
          <p>{lesson.concept}</p>
        </details>
      </>
    );
  }
  return (
    <section
      className="model"
      data-model={lesson.model}
      aria-label="Interactive chemistry model"
    >
      <div className="model-heading">
        <span className="eyebrow">Explore the chemistry</span>
        <button className="text-button" onClick={reset}>
          Reset model
        </button>
      </div>
      {body}
      {feedback && (
        <p className="feedback" role="status">
          {feedback}
        </p>
      )}
    </section>
  );
}
