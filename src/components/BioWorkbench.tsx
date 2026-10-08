"use client";
import { useId, useState } from "react";
import {
  bioRecord,
  bioFields,
  bioNumeric,
  bioLabels,
  bioChoices,
  initialBio,
  validBioHistory,
  checkBio,
  type BioMode,
  type BioBoard,
  type BioGiven,
} from "@/lib/bio-extraction";
import { MetalDisplacement3D } from "./MetalDisplacement3D";
export function BioGivenFigure({
  data,
  embedded = false,
}: {
  data: BioGiven;
  embedded?: boolean;
}) {
  return (
    <div className="bio-original">
      {!embedded && (
        <>
          <h3>{data.title}</h3>
          <p>{data.note}</p>
        </>
      )}{" "}
      {!!data.rows.length && (
        <dl>
          {data.rows.map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>{r.text}</dd>
            </div>
          ))}
        </dl>
      )}
      {data.grade && (
        <dl>
          <div>
            <dt>Original source mass</dt>
            <dd>
              {data.grade.mass} kg {data.grade.compound ? "pure CuO" : "ore"}
            </dd>
          </div>
          {data.grade.percent !== undefined && (
            <div>
              <dt>Copper content of source</dt>
              <dd>{data.grade.percent}% by mass, present in compounds</dd>
            </div>
          )}
          <div>
            <dt>Recovery of contained copper into metal</dt>
            <dd>{data.grade.recovery}%</dd>
          </div>
        </dl>
      )}
      {data.ash && (
        <dl>
          <div>
            <dt>Starting dry biomass</dt>
            <dd>
              {data.ash.biomass} kg containing {data.ash.copper} kg copper
              content in compounds
            </dd>
          </div>
          <div>
            <dt>Final dry ash</dt>
            <dd>
              {data.ash.ash} kg; retains {data.ash.retained}% of the initial
              copper content
            </dd>
          </div>
        </dl>
      )}
      {data.comparison && (
        <>
          <table>
            <caption>Original totals within the stated boundary</caption>
            <thead>
              <tr>
                <th>Route</th>
                <th>Energy / kWh</th>
                <th>Recovered Cu / kg</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">A</th>
                <td>{data.comparison.aEnergy}</td>
                <td>{data.comparison.aCopper}</td>
              </tr>
              <tr>
                <th scope="row">B</th>
                <td>{data.comparison.bEnergy}</td>
                <td>{data.comparison.bCopper}</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>Required service:</strong> {data.comparison.requirement}
          </p>
        </>
      )}
    </div>
  );
}
function BioProposal({
  mode,
  b,
  data,
}: {
  mode: BioMode;
  b: BioBoard;
  data: BioGiven;
}) {
  const label = (f: string) => bioLabels[b[f]] || "Unknown";
  if (mode === "pathway")
    return (
      <ol className="bio-path" aria-label="Your extraction pathway">
        <li>
          <strong>Your agent</strong>
          <p>{label("agent")}</p>
        </li>
        <li>
          <strong>Your process</strong>
          <p>{label("stage")}</p>
        </li>
        <li>
          <strong>Your intermediate</strong>
          <p>{label("intermediate")}</p>
        </li>
        <li>
          <strong>Your remaining stage</strong>
          <p>{label("next")}</p>
        </li>
      </ol>
    );
  if (mode === "grade")
    return (
      <div className="bio-proposal" aria-label="Your copper inventory">
        <strong>Your copper inventory</strong>
        <p>
          Fixed original source {data.grade!.mass} kg → your copper content{" "}
          {b.available || "Unknown"} kg.
        </p>
        <div className="bio-branches">
          <div>
            <strong>Your metal product</strong>
            <p>{b.recovered || "Unknown"} kg copper metal</p>
          </div>
          <div>
            <strong>Copper in other streams</strong>
            <p>{b.unrecovered || "Unknown"} kg copper content</p>
          </div>
        </div>
      </div>
    );
  if (mode === "ash")
    return (
      <div
        className="bio-proposal"
        aria-label="Your copper-in-ash construction"
      >
        <strong>Original copper content: {data.ash!.copper} kg</strong>
        <p>
          Your retained ash copper: {b.retainedCu || "Unknown"} kg; copper
          elsewhere: {b.lostCu || "Unknown"} kg.
        </p>
        <p>
          Your ash copper content: {b.ashGrade || "Unknown"}%. Copper form:{" "}
          {label("identity")}.
        </p>
      </div>
    );
  if (mode === "recovery")
    return (
      <div className="bio-proposal" aria-label="Your copper recovery proposal">
        <strong>Your recovery proposal</strong>
        <p>
          {label("method")} → {label("product")}
        </p>
        <p>Copper-ion change: {label("change")}</p>
      </div>
    );
  return (
    <div className="bio-proposal" aria-label="Your matched-output comparison">
      <p>
        Your energies: A {b.aPer || "Unknown"}, B {b.bPer || "Unknown"} kWh/kg
        Cu.
      </p>
      <p>
        {label("decision")}; limit: {label("limit")}
      </p>
    </div>
  );
}
export function BioWorkbench({
  mode,
  record,
  history,
  onChange,
}: {
  mode: BioMode;
  record: string;
  history: BioBoard[];
  onChange: (h: BioBoard[]) => void;
}) {
  const uid = useId(),
    [checked, setChecked] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    r = bioRecord(mode, record);
  if (!r || !validBioHistory(mode, record, history))
    return (
      <p role="status">
        Saved copper-extraction proposal is unreadable; its raw entries are
        retained.
      </p>
    );
  const b = history.at(-1)!,
    full = history.length >= 500;
  function change(h: BioBoard[]) {
    onChange(h);
    setChecked(null);
  }
  function edit(f: string, v: string) {
    if (full || b[f] === v) return;
    const h = [...history, { ...b, [f]: v }];
    if (validBioHistory(mode, record, h)) change(h);
  }
  return (
    <section
      className="bio-workbench"
      data-record={record}
      aria-label="Task model"
    >
      <h3>{r.title}</h3>
      <p className="bio-context">{r.summary || r.note}</p>
      {!r.summary && <BioGivenFigure data={r} embedded />}
      <div className="bio-fields">
        {bioFields[mode].map((f) => (
          <label htmlFor={uid + f} key={f}>
            {bioLabels[f]}
            {bioNumeric.includes(f) ? (
              <input
                id={uid + f}
                data-field={f}
                value={b[f]}
                inputMode="decimal"
                maxLength={16}
                autoComplete="off"
                disabled={full}
                onChange={(e) => edit(f, e.target.value)}
              />
            ) : (
              <select
                id={uid + f}
                data-field={f}
                value={b[f]}
                disabled={full}
                onChange={(e) => edit(f, e.target.value)}
              >
                <option value="">Choose…</option>
                {bioChoices[f].map((v) => (
                  <option key={v} value={v}>
                    {bioLabels[v]}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>
      {r.summary && (
        <details>
          <summary>Full original evidence</summary>
          <BioGivenFigure data={r} embedded />
        </details>
      )}
      <BioProposal mode={mode} b={b} data={r} />
      <div className="bio-actions">
        <button
          type="button"
          className="button"
          onClick={() => setChecked(checkBio(mode, b))}
        >
          Check proposal
        </button>
        <button
          type="button"
          disabled={history.length < 2}
          onClick={() => change(history.slice(0, -1))}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => change([initialBio(mode, record)])}
        >
          Clear proposal
        </button>
      </div>
      {full && (
        <p role="status">
          Saved-edit limit reached. Undo or clear this proposal to continue.
        </p>
      )}
      {checked && (
        <p
          className={"feedback " + (checked.correct ? "good" : "bad")}
          role="status"
        >
          {checked.message}
        </p>
      )}
      {r.ironScene && (
        <details className="bio-reaction-view">
          <summary>Inspect the supplied iron–copper reaction in 3D</summary>
          <MetalDisplacement3D added="Fe" dissolved="Cu" />
        </details>
      )}
      <details>
        <summary>About these extraction models</summary>
        <p>
          Original supplied processes and numeric records. Copper content means
          mass of Cu atoms present in compounds or metal, not a claim that
          plants or ash contain pure copper. Copper inventories use the stated
          retention/recovery and stream boundary. Burning uses oxygen and
          changes other matter into products; atoms do not vanish. Process
          diagrams show chemical forms and proposed quantities, not particle
          counts or measured industry performance. The optional 3D scene
          represents the same one iron/copper displacement event before and
          after, with water/hydration and complete metal lattices omitted.
          Independent practice fades these live aids; simulated study does not
          establish practical or whole-course examination competence.
        </p>
      </details>
    </section>
  );
}
