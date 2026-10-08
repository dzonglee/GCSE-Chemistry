"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { initialBoard, checkBoard } from "@/lib/workbench";
import {
  halogens,
  halogenPhase,
  halogenParticle,
  displacement,
  halogenFromHalide,
  type Halogen,
  type Halide,
  type HalogenRepresentation,
} from "@/lib/halogens";
import { DiatomicScene3D } from "./DiatomicScene3D";
export function HalogenOuterDiagram({ halogen }: { halogen: Halogen }) {
  const h = halogens[halogen],
    outer = 40 + h.shells * 18;
  return (
    <figure className="halogen-outer">
      <svg
        viewBox="0 0 300 300"
        role="img"
        aria-label={`${h.name} neutral-atom comparison: ${h.shells} occupied shells and seven outer electrons. Inner electron counts omitted; not a full arrangement or to scale.`}
      >
        <circle cx="150" cy="150" r="23" fill="#e8ecfa" />
        <text x="150" y="157" textAnchor="middle" fontSize="20">
          +
        </text>
        {Array.from({ length: h.shells }, (_, i) => (
          <circle
            key={i}
            cx="150"
            cy="150"
            r={40 + (i + 1) * 18}
            fill="none"
            stroke={i === h.shells - 1 ? "#8896b5" : "#c7cfdf"}
          />
        ))}
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i * 2 * Math.PI) / 7;
          return (
            <circle
              key={i}
              cx={150 + outer * Math.cos(a)}
              cy={150 + outer * Math.sin(a)}
              r="6"
              fill="#6b3fc4"
            />
          );
        })}
      </svg>
      <figcaption>
        <strong>
          {h.name}: {h.shells} occupied shells
        </strong>
        <br />
        Seven outer electrons; inner counts omitted. Neutral-atom comparison,
        not the dissolved halide ion.
      </figcaption>
    </figure>
  );
}
export function HalogenWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<
    TaskModel,
    { kind: "halogen-particle" | "halogen-phase" | "halogen-displacement" }
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
        feedback: "Undo or reset to continue; your answer is retained.",
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
  if (model.kind === "halogen-particle") {
    const representation = b.representation as HalogenRepresentation,
      p = halogenParticle(model.halogen, representation),
      h = halogens[model.halogen];
    return (
      <section
        className="model task-workbench halogen-workbench"
        data-model={model.kind}
        aria-label="Task model"
      >
        <p className="bench-instruction">{model.instruction}</p>
        <label className="halogen-control">
          Particle representation
          <select
            aria-label="Proposed halogen particle"
            value={representation}
            onChange={(e) => change("representation", e.target.value)}
          >
            <option value="atom">One neutral atom</option>
            <option value="molecule">Two bonded neutral atoms</option>
            <option value="ion">One negative halide ion</option>
          </select>
        </label>
        {actions}
        <p className="halogen-species" aria-live="polite">
          Your choice: <strong>{p.formula}</strong> · {p.atomCount} atom
          {p.atomCount === 1 ? "" : "s"} · charge {p.charge === -1 ? "−1" : "0"}
        </p>
        <DiatomicScene3D
          halogen={model.halogen}
          representation={representation}
        />
        <p className="position-caption">
          {representation === "molecule"
            ? `Relative molecular mass: 2 × ${h.mass} = ${2 * h.mass}. The subscript 2 counts atoms; it is not a charge.`
            : "This is a single atomic species, not a diatomic molecule. A halide ion has gained an electron; it is not an elemental halogen molecule."}
        </p>
      </section>
    );
  }
  if (model.kind === "halogen-phase") {
    const temperature = Number(b.temperature),
      state = halogenPhase(model.halogen, temperature),
      h = halogens[model.halogen];
    const positions =
      state === "gas"
        ? [
            [45, 50],
            [190, 45],
            [105, 125],
            [235, 135],
            [40, 225],
            [180, 225],
          ]
        : state === "solid"
          ? [
              [65, 115],
              [155, 115],
              [65, 165],
              [155, 165],
              [65, 215],
              [155, 215],
            ]
          : [
              [65, 140],
              [158, 110],
              [90, 185],
              [200, 165],
              [55, 230],
              [165, 230],
            ];
    return (
      <section
        className="model task-workbench halogen-workbench"
        data-model={model.kind}
        aria-label="Task model"
      >
        <p className="bench-instruction">{model.instruction}</p>
        <label className="halogen-control">
          Temperature: <strong>{temperature} °C</strong>
          <input
            aria-label="Model temperature"
            type="range"
            min={-120}
            max={220}
            step={10}
            value={temperature}
            onChange={(e) => change("temperature", Number(e.target.value))}
          />
        </label>
        {actions}
        <p className="halogen-species" aria-live="polite">
          Using the supplied values, {h.name.toLowerCase()} at {temperature} °C
          is <strong>{state}</strong>.
        </p>
        <table className="halogen-data">
          <caption>Supplied rounded transition values, °C</caption>
          <thead>
            <tr>
              <th scope="col">Element</th>
              <th scope="col">Melting</th>
              <th scope="col">Boiling</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(halogens).map(([key, h]) => (
              <tr key={key}>
                <th scope="row">{h.name}</th>
                <td>{h.melting}</td>
                <td>{h.boiling}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <figure className="halogen-phase-figure">
          <svg
            viewBox="0 0 300 280"
            role="img"
            aria-label={`Schematic ${state}: six intact ${h.symbol}₂ molecules. Spacing is qualitative, not numerical density.`}
          >
            {positions.map(([x, y], i) => (
              <g
                key={i}
                transform={`translate(${x},${y}) rotate(${state === "solid" ? 0 : i * 27})`}
              >
                <line
                  x1="0"
                  y1="0"
                  x2="22"
                  y2="0"
                  stroke="#8994ad"
                  strokeWidth="4"
                />
                <circle r="10" fill="#4655cd" />
                <circle cx="22" r="10" fill="#4655cd" />
              </g>
            ))}
          </svg>
          <figcaption>
            Paired atoms stay paired during a phase change. Spacing illustrates
            the state, not measured density or physical colour.
          </figcaption>
        </figure>
        <p className="position-caption">
          Values converted from the cited secondary reference’s kelvin data and
          rounded to whole °C. Use the supplied values for these tasks; exact
          transitions depend on pressure and precision. At a transition, phases
          may coexist. Room-temperature iodine is grey-black; its vapour is
          purple.
        </p>
      </section>
    );
  }
  const added = b.added as Halogen,
    halide = b.halide as Halide,
    result = displacement(added, halide),
    original = halogenFromHalide(halide),
    afterHalogen = result.liberated ?? added;
  return (
    <section
      className="model task-workbench halogen-workbench"
      data-model={model.kind}
      aria-label="Task model"
    >
      <p className="bench-instruction">{model.instruction}</p>
      <div className="position-controls">
        <label>
          Added halogen
          <select
            aria-label="Added halogen"
            value={added}
            onChange={(e) => change("added", e.target.value)}
          >
            {Object.entries(halogens).map(([key, h]) => (
              <option key={key} value={key}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Dissolved halide
          <select
            aria-label="Dissolved halide"
            value={halide}
            onChange={(e) => change("halide", e.target.value)}
          >
            {Object.values(halogens).map((h) => (
              <option key={h.halide} value={h.halide}>
                {h.halide[0].toUpperCase() + h.halide.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="halogen-control">
        Your prediction
        <select
          aria-label="Displacement prediction"
          value={String(b.prediction)}
          onChange={(e) => change("prediction", e.target.value)}
        >
          <option value="reaction">A displacement occurs</option>
          <option value="none">No net displacement</option>
        </select>
      </label>
      {actions}
      <p className="position-caption">
        Compare added halogen with the halogen represented by the halide:
        chlorine &gt; bromine &gt; iodine. These are dilute aqueous comparisons;
        the sodium/potassium counter-ion is a spectator.
      </p>
      <div className="halogen-before-after">
        <section>
          <h3>Before the prediction is tested</h3>
          <p data-halogen-before>{result.before}</p>
          <p>
            A neutral {halogens[added].symbol}₂ molecule and two{" "}
            {halogens[original].symbol}⁻ ions; shown charge −2. Two +1 spectator
            counter-ions, omitted here, keep the solution electrically neutral.
          </p>
        </section>
        <section>
          <h3>After testing</h3>
          {feedback ? (
            <>
              <p data-halogen-after>{result.after}</p>
              <p>
                {result.reacts
                  ? `A ${halogens[afterHalogen].symbol}₂ molecule is formed; shown charge remains −2.`
                  : "The original species remain: no net displacement."}
              </p>
              <div
                className="halogen-solution"
                style={{ background: halogens[afterHalogen].colour }}
              >
                <strong>{result.appearance} solution</strong>
              </div>
            </>
          ) : (
            <p>
              Check your prediction to reveal the resulting species and reported
              appearance.
            </p>
          )}
        </section>
      </div>
      <p className="position-caption">
        A coloured added halogen can leave a coloured solution even if no
        displacement occurs. Colours are qualitative and
        concentration-dependent; iodine is brown in this aqueous comparison, not
        the purple colour of its vapour or some organic-solvent solutions.
      </p>
      <details className="model-boundaries">
        <summary>Why does reactivity decrease?</summary>
        <div className="halogen-atom-comparison">
          <HalogenOuterDiagram halogen="chlorine" />
          <HalogenOuterDiagram halogen="iodine" />
        </div>
        <p>
          Down Group 7, more occupied shells increase distance and shielding.
          Attraction to an incoming electron is weaker overall, so gaining an
          electron is harder and reactivity decreases. These diagrams compare
          neutral atoms; the halide ions in the solution already have full outer
          shells. Formal redox half-equations are a Higher follow-on.
        </p>
      </details>
    </section>
  );
}
