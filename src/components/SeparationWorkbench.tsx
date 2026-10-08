"use client";
import { useId, useState } from "react";
import {
  checkSeparation,
  initialSeparation,
  separationChoices,
  separationFields,
  separationLabels,
  separationRecord,
  validSeparationHistory,
  type SeparationBoard,
  type SeparationGiven,
  type SeparationMode,
} from "@/lib/separation-investigation";
export function SeparationEvidence({ data }: { data: SeparationGiven }) {
  return (
    <section
      className="separation-evidence"
      aria-label="Supplied investigation evidence"
    >
      <h3>{data.title}</h3>
      <p>{data.note}</p>
      {data.rows && (
        <dl>
          {data.rows.map((row, i) => (
            <div key={i}>
              <dt>{row.label}</dt>
              <dd>{row.text}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
export function SeparationWorkbench({
  mode,
  record,
  history: retained,
  onChange,
}: {
  mode: SeparationMode;
  record: string;
  history?: SeparationBoard[];
  onChange?: (h: SeparationBoard[]) => void;
}) {
  const uid = useId(),
    [local, setLocal] = useState(() => [initialSeparation(mode, record)]),
    [checked, setChecked] = useState<ReturnType<typeof checkSeparation> | null>(
      null,
    ),
    history = retained ?? local;
  function change(h: SeparationBoard[]) {
    if (onChange) onChange(h);
    else setLocal(h);
    setChecked(null);
  }
  if (!validSeparationHistory(mode, record, history))
    return (
      <section className="separation-workbench" aria-label="Task model">
        <p role="alert">
          The retained proposal cannot be read. Its entries have been preserved.
        </p>
        <button
          type="button"
          onClick={() => change([initialSeparation(mode, record)])}
        >
          Start a new proposal for this task
        </button>
      </section>
    );
  const b = history.at(-1)!,
    r = separationRecord(mode, record)!,
    full = history.length >= 500;
  function field(f: string, v: string) {
    if (!full && b[f] !== v) change([...history, { ...b, [f]: v }]);
  }
  const origin =
    b.level === "submerged" ? 195 : b.level === "above" ? 145 : null;
  return (
    <section
      className="separation-workbench"
      aria-label="Task model"
      data-separation-mode={mode}
      data-separation-record={record}
    >
      <div className="separation-original">
        <SeparationEvidence data={r} />
      </div>
      <fieldset className="separation-fields">
        <legend>Your proposal</legend>
        {separationFields[mode].map((f) => (
          <div key={f}>
            <label htmlFor={uid + f}>{separationLabels[f]}</label>
            {["net", "percent"].includes(f) ? (
              <input
                id={uid + f}
                data-field={f}
                type="text"
                inputMode="decimal"
                maxLength={16}
                value={b[f]}
                disabled={full}
                onChange={(e) => field(f, e.target.value)}
              />
            ) : (
              <>
                <select
                  id={uid + f}
                  data-field={f}
                  disabled={full}
                  value={b[f]}
                  onChange={(e) => field(f, e.target.value)}
                >
                  <option value="">Choose…</option>
                  {separationChoices[f].map((v) => (
                    <option key={v} value={v}>
                      {separationLabels[v]}
                    </option>
                  ))}
                </select>
                {b[f] && separationLabels[b[f]].length > 24 && (
                  <p className="separation-selected">
                    {separationLabels[b[f]]}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </fieldset>
      {mode === "sequence" && (
        <ol className="separation-flow" aria-label="Your proposed sequence">
          {["first", "second", "third"].map((f, i) => (
            <li key={f}>
              <span className="separation-step">{i + 1}</span>
              <span>{b[f] ? separationLabels[b[f]] : "Stage not chosen"}</span>
            </li>
          ))}
        </ol>
      )}
      {mode === "fractions" && (
        <div
          className="separation-fractions"
          aria-label="Your proposed fraction map"
        >
          <div>
            <span className="separation-filter" aria-hidden="true">
              ▽
            </span>
            <strong>On the filter</strong>
            <p>{b.residue ? separationLabels[b.residue] : "Unassigned"}</p>
          </div>
          <div>
            <span className="separation-liquid" aria-hidden="true">
              ▱
            </span>
            <strong>Through the filter</strong>
            <p>{b.filtrate ? separationLabels[b.filtrate] : "Unassigned"}</p>
          </div>
          <p className="separation-product">
            Collect: {b.collect ? separationLabels[b.collect] : "not chosen"}
          </p>
        </div>
      )}
      {mode === "setup" && (
        <figure className="separation-setup">
          <svg
            viewBox="0 0 300 240"
            role="img"
            aria-label="Your proposed origin line relative to the solvent; schematic, not to scale"
          >
            <path
              d="M35 22V214H265V22"
              fill="#f8fafc"
              stroke="#64748b"
              strokeWidth="2"
            />
            <path d="M36 177H264V212H36Z" fill="#d6ecf8" />
            <rect
              x="85"
              y="38"
              width="125"
              height="164"
              fill="white"
              stroke="#94a3b8"
            />
            {origin !== null && (
              <g data-proposed-origin={b.level}>
                <line
                  x1="86"
                  y1={origin}
                  x2="209"
                  y2={origin}
                  stroke={b.line === "ink" ? "#8c3ab9" : "#374151"}
                  strokeWidth="2"
                  strokeDasharray={b.line ? undefined : "4 4"}
                />
                <circle cx="143" cy={origin} r="5" fill="#dd6b24" />
              </g>
            )}
            <line
              x1="37"
              y1="177"
              x2="264"
              y2="177"
              stroke="#3980a4"
              strokeWidth="2"
            />
          </svg>
          <p className="separation-diagram-key">
            Blue line: solvent surface. Orange spot: your proposed sample.
          </p>
          <figcaption>
            {b.level ? separationLabels[b.level] : "Origin not placed"}.{" "}
            {b.line ? separationLabels[b.line] : "Line material unchosen"}. The
            bottom of the paper dips into the solvent.
          </figcaption>
        </figure>
      )}
      {mode === "recovery" && (
        <div className="separation-mass-proposal">
          <strong>Your calculation</strong>
          <p>
            {b.net || "?"} g recovered · {b.percent || "?"}% recovery
          </p>
          <p>
            These are your entries. The supplied weighings remain unchanged.
          </p>
        </div>
      )}
      <div className="separation-actions">
        <button
          type="button"
          className="button"
          onClick={() => setChecked(checkSeparation(mode, b))}
        >
          Check proposal
        </button>
        <button
          type="button"
          disabled={history.length === 1}
          onClick={() => change(history.slice(0, -1))}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => change([initialSeparation(mode, record)])}
        >
          Clear proposal
        </button>
      </div>
      {full && (
        <p role="status">
          This task has reached its edit-history limit. Undo or clear this
          proposal to continue.
        </p>
      )}
      {checked && (
        <p
          role="status"
          className={checked.correct ? "feedback good" : "feedback bad"}
        >
          {checked.message}
        </p>
      )}
    </section>
  );
}
