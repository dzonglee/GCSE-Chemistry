"use client";
import { useId, useState } from "react";
import {
  lcaRecord,
  lcaFields,
  lcaLabels,
  lcaChoices,
  lcaNumeric,
  initialLca,
  validLcaHistory,
  checkLca,
  boundarySubtotal,
  type LcaMode,
  type LcaBoard,
  type LcaGiven,
} from "@/lib/life-cycle";
export function LcaGivenFigure({
  data,
  embedded = false,
}: {
  data: LcaGiven;
  embedded?: boolean;
}) {
  return (
    <div className="lca-given" aria-label={data.title}>
      {!embedded && <h3>{data.title}</h3>}
      <p>{data.note}</p>
      {data.events && (
        <ol>
          {data.events.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ol>
      )}
      {data.rows && (
        <dl>
          {data.rows.map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>{r.text}</dd>
            </div>
          ))}
        </dl>
      )}
      {data.energy && (
        <>
          <table>
            <caption>Original matched stage energies / kJ</caption>
            <thead>
              <tr>
                <th>Stage</th>
                <th>A</th>
                <th>B</th>
              </tr>
            </thead>
            <tbody>
              {data.energy.map((r) => (
                <tr key={r.stage}>
                  <th scope="row">{r.stage}</th>
                  <td>{r.a}</td>
                  <td>{r.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <details className="lca-source-chart">
            <summary>Read the same data as a graph</summary>
            <LcaEnergyChart rows={data.energy} />
          </details>
        </>
      )}
      {data.service && (
        <dl>
          {[
            {
              label: "Completed equivalent services",
              text: String(data.service.uses),
            },
            {
              label: "Reusable fixed energy",
              text: data.service.fixed + " kJ, counted once",
            },
            {
              label: "Reusable washing/return",
              text: data.service.wash + " kJ for every service",
            },
            {
              label: "Single-use lifecycle energy",
              text: data.service.single + " kJ per equivalent service",
            },
          ].map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>{r.text}</dd>
            </div>
          ))}
        </dl>
      )}
      {data.impacts && (
        <table>
          <caption>Original data for the same service</caption>
          <thead>
            <tr>
              <th>Quantity</th>
              <th>A</th>
              <th>B</th>
            </tr>
          </thead>
          <tbody>
            {data.impacts.map((r) => (
              <tr key={r.name}>
                <th scope="row">
                  {r.name} / {r.unit}
                </th>
                <td>{r.a}</td>
                <td>{r.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data.recycling && (
        <dl>
          {[
            {
              label: "Collected material",
              text: data.recycling.collected + " kg",
            },
            {
              label: "Suitable sorted material",
              text: data.recycling.sorted + " kg",
            },
            {
              label: "Usable recovery of sorted mass",
              text: data.recycling.yield + "%",
            },
            {
              label: "New product demand",
              text: data.recycling.demand + " kg suitable material",
            },
          ].map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>{r.text}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
function LcaEnergyChart({ rows }: { rows: NonNullable<LcaGiven["energy"]> }) {
  const max = Math.ceil(Math.max(...rows.flatMap((r) => [r.a, r.b])) / 10) * 10;
  return (
    <figure className="lca-energy-chart">
      <figcaption>
        Energy by stage; blue A, teal B. Every bar uses the same 0–{max} kJ
        scale.
      </figcaption>
      {rows.map((r) => (
        <div key={r.stage}>
          <strong>{r.stage}</strong>
          <svg
            viewBox="0 0 320 92"
            role="img"
            aria-label={`${r.stage}: A ${r.a} kJ, B ${r.b} kJ. Common axis 0 to ${max} kJ.`}
          >
            <line x1="35" y1="7" x2="35" y2="62" stroke="#606a80" />
            {[0, max / 2, max].map((v, i) => (
              <g key={v}>
                <line
                  x1={35 + i * 125}
                  y1="62"
                  x2={35 + i * 125}
                  y2="67"
                  stroke="#606a80"
                />
                <text
                  x={35 + i * 125}
                  y="86"
                  textAnchor="middle"
                  fontSize="15"
                  fill="#26324d"
                >
                  {v}
                </text>
              </g>
            ))}
            <text x="4" y="27" fontSize="16" fill="#26324d">
              A
            </text>
            <text x="4" y="54" fontSize="16" fill="#26324d">
              B
            </text>
            <rect
              x="35"
              y="12"
              width={(r.a / max) * 250}
              height="20"
              fill="#3f4fd0"
            />
            <rect
              x="35"
              y="39"
              width={(r.b / max) * 250}
              height="20"
              fill="#0f7a73"
            />
          </svg>
        </div>
      ))}
    </figure>
  );
}
function LcaProposal({
  mode,
  b,
  r,
}: {
  mode: LcaMode;
  b: LcaBoard;
  r: LcaGiven;
}) {
  const label = (f: string) => lcaLabels[b[f]] || "Unknown",
    value = (f: string) => b[f] || "Unknown";
  if (mode === "boundary") {
    const subtotal = boundarySubtotal(r, b);
    return (
      <div className="lca-proposal" aria-label="Your lifecycle boundary">
        <ol className="lca-boundary">
          {["raw", "make", "use", "end"].map((f) => (
            <li key={f} data-included={b[f] === "include"}>
              <strong>{lcaLabels[f]}</strong>
              <span>{label(f)}</span>
            </li>
          ))}
        </ol>
        <p>
          Your selected subtotal:{" "}
          {subtotal
            ? `A ${subtotal.a}, B ${subtotal.b} kJ`
            : "Unknown until all stage choices are set"}
          . This is your chosen boundary, not an automatic full-life result.
        </p>
        <p>Transport: {label("transport")}.</p>
      </div>
    );
  }
  if (mode === "reuse")
    return (
      <div className="lca-proposal" aria-label="Your reuse comparison">
        <strong>{r.service!.uses} equivalent services</strong>
        <div className="lca-branches">
          <div>
            Reusable<p>{value("rTotal")} kJ total</p>
            <p>{value("rPer")} kJ per service</p>
          </div>
          <div>
            Single-use<p>{value("sTotal")} kJ total</p>
            <p>{r.service!.single} kJ per service (given)</p>
          </div>
        </div>
        <p>
          Your energy choice: {label("choice")}. Other environmental effects
          remain separate.
        </p>
      </div>
    );
  if (mode === "recycle")
    return (
      <div className="lca-proposal" aria-label="Your recycling balance">
        <strong>Original collected mass: {r.recycling!.collected} kg</strong>
        <div className="lca-branches">
          <div>
            Usable recovered<p>{value("recovered")} kg</p>
          </div>
          <div>
            Other collected streams<p>{value("rejected")} kg</p>
          </div>
        </div>
        <p>Your required new material: {value("virgin")} kg.</p>
        <p>
          Non-product material still exists. Recovery does not create atoms.
        </p>
      </div>
    );
  return (
    <div className="lca-proposal" aria-label="Your lifecycle proposal">
      <strong>Your proposal</strong>
      <dl>
        {lcaFields[mode].map((f, i) => (
          <div key={f}>
            <dt>{mode === "stages" ? r.events![i] : lcaLabels[f]}</dt>
            <dd>{lcaNumeric.includes(f) ? value(f) : label(f)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
export function LcaWorkbench({
  mode,
  record,
  history,
  onChange,
}: {
  mode: LcaMode;
  record: string;
  history: LcaBoard[];
  onChange: (h: LcaBoard[]) => void;
}) {
  const uid = useId(),
    [checked, setChecked] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    r = lcaRecord(mode, record);
  if (!r || !validLcaHistory(mode, record, history))
    return (
      <p role="status">
        Saved lifecycle proposal is unreadable; raw entries are retained.
      </p>
    );
  const b = history.at(-1)!,
    full = history.length >= 500;
  function change(h: LcaBoard[]) {
    onChange(h);
    setChecked(null);
  }
  function edit(f: string, v: string) {
    if (full || b[f] === v) return;
    const h = [...history, { ...b, [f]: v }];
    if (validLcaHistory(mode, record, h)) change(h);
  }
  return (
    <section
      className="lca-workbench"
      data-record={record}
      aria-label="Task model"
    >
      <h3>{r.title}</h3>
      <div className="lca-context">
        {mode === "stages" ? (
          <p>{r.summary || r.note}</p>
        ) : (
          <LcaGivenFigure data={r} embedded />
        )}
      </div>
      <div className="lca-fields">
        {lcaFields[mode].map((f, i) => (
          <label key={f} htmlFor={uid + f}>
            {mode === "stages" ? `${i + 1}. ${r.events![i]}` : lcaLabels[f]}
            {lcaNumeric.includes(f) ? (
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
                {lcaChoices[f].map((v) => (
                  <option key={v} value={v}>
                    {lcaLabels[v]}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>
      {mode === "stages" && (
        <details>
          <summary>Full original evidence</summary>
          <LcaGivenFigure data={r} embedded />
        </details>
      )}
      <LcaProposal mode={mode} b={b} r={r} />
      <div className="lca-actions">
        <button
          type="button"
          className="button"
          onClick={() => setChecked(checkLca(mode, b))}
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
          onClick={() => change([initialLca(mode, record)])}
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
      <details>
        <summary>About these lifecycle models</summary>
        <p>
          Original supplied exercises, not measured industrial LCAs. Compare
          equal service and matching boundaries. Transport is included as
          stated. Reuse energy assumes the specified completed services and
          washing rule; actual breakage, cleaning and logistics may differ.
          Water, energy and waste quantities have different units. Judging
          pollutant effects and priorities needs further evidence and value
          judgements. No universal environmental ranking follows.
        </p>
      </details>
    </section>
  );
}
