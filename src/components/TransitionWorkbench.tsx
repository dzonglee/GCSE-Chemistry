"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { initialBoard, checkBoard } from "@/lib/workbench";
import {
  comparisonStatements,
  transitionExamples,
  catalystData,
} from "@/lib/transition-metals";
export function TransitionWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<
    TaskModel,
    {
      kind:
        | "transition-compare"
        | "transition-ion"
        | "transition-catalyst"
        | "transition-colour";
    }
  >;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialBoard(model),
    [feedback, setFeedback] = useState<ReturnType<typeof checkBoard> | null>(
      null,
    );
  const change = (key: string, value: string | number) => {
    if (b[key] === value) return;
    if (history.length >= 500) {
      setFeedback({
        correct: false,
        feedback: "Undo or reset to continue. Your saved proposal is retained.",
      });
      return;
    }
    onChange([...history, { ...b, [key]: value }]);
    setFeedback(null);
  };
  const actions = (
    <>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => setFeedback(checkBoard(model, b))}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length <= 1}
          onClick={() => {
            onChange(history.slice(0, -1));
            setFeedback(null);
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            onChange([initialBoard(model)]);
            setFeedback(null);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={`feedback ${feedback.correct ? "correct" : ""}`}
        >
          {feedback.feedback}
        </p>
      )}
    </>
  );
  if (model.kind === "transition-colour")
    return (
      <section
        className="model task-workbench transition-workbench"
        aria-label="Task model"
      >
        <strong>{model.instruction}</strong>
        <div className="transition-controls">
          <label>
            Paper condition
            <select
              aria-label="Paper condition"
              value={String(b.condition)}
              onChange={(e) => change("condition", e.target.value)}
            >
              <option value="dry">Dried indicator paper</option>
              <option value="wet">After contact with water</option>
            </select>
          </label>
          <label>
            Your colour prediction
            <select
              aria-label="Your colour prediction"
              value={String(b.colour)}
              onChange={(e) => change("colour", e.target.value)}
            >
              <option value="unset">Choose a prediction</option>
              <option value="blue">Blue</option>
              <option value="pink">Pink</option>
            </select>
          </label>
        </div>
        <figure className="transition-paper-prediction">
          <div
            data-colour={b.colour}
            role="img"
            aria-label={`Your proposed paper colour: ${b.colour === "unset" ? "no prediction" : b.colour}`}
          />
          <figcaption>
            Your prediction, not an observed result.{" "}
            {b.colour === "unset"
              ? "No colour selected."
              : `You chose ${b.colour}.`}
          </figcaption>
        </figure>
        {actions}
        <p className="model-caption">
          Supplied observation for cobalt chloride indicator paper: blue after
          drying; pink after contact with water. Interpret this particular
          compound and condition. This is a prediction activity, not a practical
          procedure or a simulation of every cobalt compound.
        </p>
      </section>
    );
  if (model.kind === "transition-compare")
    return (
      <section
        className="model task-workbench transition-workbench"
        aria-label="Task model"
      >
        <strong>{model.instruction}</strong>
        <div className="transition-controls">
          {(["first", "second"] as const).map((key, i) => (
            <label key={key}>
              Physical comparison {i + 1}
              <select
                aria-label={`Physical comparison ${i + 1}`}
                value={String(b[key])}
                onChange={(e) => change(key, e.target.value)}
              >
                {Object.entries(comparisonStatements).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {actions}
        <table className="alkali-count-table">
          <caption>
            Supplied rounded reference data: sodium versus selected transition
            metals
          </caption>
          <thead>
            <tr>
              <th scope="col">Element</th>
              <th scope="col">Melting point / °C</th>
              <th scope="col">Density / g cm⁻³</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Na — sodium</th>
              <td>98</td>
              <td>0.968</td>
            </tr>
            {transitionExamples.map((e) => (
              <tr key={e.symbol}>
                <th scope="row">
                  {e.symbol} — {e.name}
                </th>
                <td>{e.melting}</td>
                <td>{e.density}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="model-caption">
          These selected transition metals are also generally harder and
          stronger than Group 1 metals. Melting point, density, hardness and
          strength are distinct physical comparisons. Do not turn a general
          comparison into an absolute rule for every metal.
        </p>
      </section>
    );
  if (model.kind === "transition-ion")
    return (
      <section
        className="model task-workbench transition-workbench"
        aria-label="Task model"
      >
        <strong>{model.instruction}</strong>
        <label className="transition-electrons">
          Electrons in the iron particle
          <select
            aria-label="Electrons in the iron particle"
            value={Number(b.electrons)}
            onChange={(e) => change("electrons", Number(e.target.value))}
          >
            {[26, 25, 24, 23].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        {actions}
        <div className="transition-ledger">
          <div>
            <span>Fixed nucleus</span>
            <strong>26 protons</strong>
          </div>
          <div>
            <span>Your electrons</span>
            <strong>{b.electrons}</strong>
          </div>
          <div>
            <span>Your charge</span>
            <strong>
              {26 - Number(b.electrons) === 0
                ? "0"
                : `${26 - Number(b.electrons)}+`}
            </strong>
          </div>
        </div>
        <figure>
          <svg
            viewBox="0 0 380 150"
            role="img"
            aria-label={`Iron charge ledger: 26 positive proton charges, ${b.electrons} negative electron charges; ${26 - Number(b.electrons)} electrons lost. Not a shell arrangement.`}
          >
            <rect
              x="8"
              y="15"
              width="170"
              height="100"
              rx="12"
              fill="#e8ecff"
            />
            <rect
              x="202"
              y="15"
              width="170"
              height="100"
              rx="12"
              fill="#f2eaff"
            />
            <text x="93" y="57" textAnchor="middle" fontSize="24">
              26 positive
            </text>
            <text x="93" y="87" textAnchor="middle" fontSize="18">
              proton charges
            </text>
            <text x="287" y="57" textAnchor="middle" fontSize="24">
              {b.electrons} negative
            </text>
            <text x="287" y="87" textAnchor="middle" fontSize="18">
              electron charges
            </text>
            <text x="190" y="142" textAnchor="middle" fontSize="18">
              Total lost from neutral: {26 - Number(b.electrons)}; protons
              unchanged
            </text>
          </svg>
          <figcaption>
            Charge accounting, not an electron-shell arrangement. The first-20
            shell rule is not extended to iron.
          </figcaption>
        </figure>
        <p>
          Iron(II) means Fe²⁺; iron(III) means Fe³⁺. The Roman numeral gives the
          charge of this simple iron ion, not the number of iron atoms.
        </p>
      </section>
    );
  return (
    <section
      className="model task-workbench transition-workbench"
      aria-label="Task model"
    >
      <strong>{model.instruction}</strong>
      <div className="transition-controls">
        {(["early", "final"] as const).map((key, i) => (
          <label key={key}>
            {i === 0 ? "Catalysed amount at 20 s" : "Catalysed final amount"}
            <select
              aria-label={
                i === 0 ? "Catalysed amount at 20 s" : "Catalysed final amount"
              }
              value={String(b[key])}
              onChange={(e) => change(key, e.target.value)}
            >
              <option value="less">Less than without catalyst</option>
              <option value="same">Same as without catalyst</option>
              <option value="greater">Greater than without catalyst</option>
            </select>
          </label>
        ))}
      </div>
      {actions}
      <figure>
        <svg
          viewBox="0 0 400 275"
          role="img"
          aria-label="Original illustrative data: catalysed run gives 22 cubic centimetres at 20 seconds versus 14 without; both finish at 24. Curves join supplied readings, not a numerical reaction law."
        >
          <path d="M45 20V230H365" stroke="#697795" fill="none" />
          {[0, 8, 16, 24].map((v) => (
            <g key={v}>
              <text x="36" y={234 - v * 8} textAnchor="end" fontSize="20">
                {v}
              </text>
              <path d={`M45 ${230 - v * 8}H365`} stroke="#e3e7f0" />
            </g>
          ))}
          {[0, 20, 40, 60].map((v) => (
            <text
              key={v}
              x={45 + v * 5}
              y="249"
              textAnchor="middle"
              fontSize="20"
            >
              {v}
            </text>
          ))}
          <polyline
            points={catalystData
              .map((d) => `${45 + d.time * 5},${230 - d.with * 8}`)
              .join(" ")}
            fill="none"
            stroke="#3547ce"
            strokeWidth="3"
          />
          <polyline
            points={catalystData
              .map((d) => `${45 + d.time * 5},${230 - d.without * 8}`)
              .join(" ")}
            fill="none"
            stroke="#9a681c"
            strokeDasharray="6 4"
            strokeWidth="3"
          />
          <text x="200" y="272" textAnchor="middle" fontSize="22">
            Time / s
          </text>
          <text x="8" y="18" fontSize="20">
            Product volume / cm³
          </text>
        </svg>
        <figcaption>
          Original illustrative readings with identical initial reactants and
          temperature. Blue solid: catalyst; brown dashed: no catalyst. Both
          completed runs produce 24 cm³. A catalyst provides a
          lower-activation-energy pathway and is not consumed overall.
        </figcaption>
      </figure>
      <details>
        <summary>Read the supplied data as a table</summary>
        <table className="alkali-count-table">
          <thead>
            <tr>
              <th scope="col">Time / s</th>
              <th scope="col">Without / cm³</th>
              <th scope="col">With / cm³</th>
            </tr>
          </thead>
          <tbody>
            {catalystData.map((d) => (
              <tr key={d.time}>
                <th scope="row">{d.time}</th>
                <td>{d.without}</td>
                <td>{d.with}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
