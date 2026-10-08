"use client";
import { useId, useState } from "react";
import {
  pollutionRecord,
  pollutionLabels,
  pollutionChoices,
  pollutionNumeric,
  fieldsFor,
  initialPollution,
  validPollutionHistory,
  checkPollution,
  atomTally,
  pollutionNumber,
  type PollutionMode,
  type PollutionBoard,
  type PollutionGiven,
  type PollutionEquation,
} from "@/lib/pollution";
function Equation({
  data,
  values = {},
}: {
  data: PollutionEquation;
  values?: Record<string, string>;
}) {
  return (
    <div
      className="pollution-equation"
      role="group"
      aria-label="Fixed chemical formulae with your proposed coefficients"
    >
      {(["left", "right"] as const).map((side, i) => (
        <div key={side} className="pollution-equation-side">
          {i === 1 && (
            <span className="pollution-arrow" aria-label="reacts to form">
              →
            </span>
          )}
          {data[side].map((s, j) => (
            <span className="pollution-species" key={s.field}>
              {j > 0 && <span aria-hidden="true">+ </span>}
              <span className="pollution-coefficient">
                {values[s.field] || "?"}
              </span>{" "}
              {s.formula}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
export function PollutionGivenFigure({
  data,
  values = {},
  compact = false,
}: {
  data: PollutionGiven;
  values?: Record<string, string>;
  compact?: boolean;
}) {
  return (
    <div className="pollution-original">
      {!compact && <h3>{data.title}</h3>}
      {!compact && <p>{data.note}</p>}
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
      {data.equation && <Equation data={data.equation} values={values} />}
      {data.fuels && (
        <>
          <p className="pollution-pan-note">
            Swipe the fuel table, or focus it and use ←/→, to compare all
            columns.
          </p>
          <div
            className="pollution-table pollution-fuel-table"
            tabIndex={0}
            role="region"
            aria-label="Fuel data table; swipe or use arrow keys to pan"
          >
            <table>
              <caption>Original supplied fuel data</caption>
              <thead>
                <tr>
                  <th>Fuel</th>
                  <th>Mass / kg</th>
                  <th>Sulfur / %</th>
                  <th>Particles</th>
                </tr>
              </thead>
              <tbody>
                {data.fuels.map((f) => (
                  <tr key={f.name}>
                    <th scope="row">{f.name}</th>
                    <td>{f.mass}</td>
                    <td>{f.sulfur}</td>
                    <td>{f.particles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {data.monitor && (
        <>
          <div className="pollution-table">
            <table>
              <caption>
                {data.monitor.pollutant} emission rate / {data.monitor.unit}
              </caption>
              <thead>
                <tr>
                  <th>Before</th>
                  <th>After</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{data.monitor.before}</td>
                  <td>{data.monitor.after}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>{data.monitor.other}</p>
        </>
      )}
    </div>
  );
}
export function PollutionWorkbench({
  mode,
  record,
  history,
  onChange,
}: {
  mode: PollutionMode;
  record: string;
  history: PollutionBoard[];
  onChange: (h: PollutionBoard[]) => void;
}) {
  const uid = useId(),
    [checked, setChecked] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    r = pollutionRecord(mode, record);
  if (!r || !validPollutionHistory(mode, record, history))
    return (
      <p role="status">
        This saved pollution proposal is unreadable; its raw entries are
        retained.
      </p>
    );
  const b = history.at(-1)!,
    fields = fieldsFor(mode, record),
    full = history.length >= 500;
  function change(h: PollutionBoard[]) {
    onChange(h);
    setChecked(null);
  }
  function edit(f: string, v: string) {
    if (full || b[f] === v) return;
    const h = [...history, { ...b, [f]: v }];
    if (validPollutionHistory(mode, record, h)) change(h);
  }
  const completeCoefficients =
    mode === "balance" &&
    fields.every((f) => {
      const n = pollutionNumber(b[f]);
      return n !== null && Number.isSafeInteger(n) && n > 0;
    });
  return (
    <section
      className="pollution-workbench"
      data-record={record}
      aria-label="Task model"
    >
      <h3>{r.title}</h3>
      <p className="pollution-context">{r.note}</p>
      <div
        className={
          "pollution-fields " +
          (mode === "products" ? "pollution-products" : "")
        }
      >
        {fields.map((f) => (
          <label key={f} htmlFor={uid + f}>
            {mode === "balance"
              ? [...r.equation!.left, ...r.equation!.right].find(
                  (s) => s.field === f,
                )!.formula + " coefficient"
              : pollutionLabels[f]}
            {f === "removed" && r.monitor ? " / " + r.monitor.unit : ""}
            {pollutionNumeric.includes(f) ? (
              <input
                id={uid + f}
                data-field={f}
                value={b[f]}
                inputMode={mode === "balance" ? "numeric" : "decimal"}
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
                {pollutionChoices[f].map((v) => (
                  <option key={v} value={v}>
                    {pollutionLabels[v]}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>
      {(r.equation || r.fuels || r.monitor) && (
        <PollutionGivenFigure
          data={{
            ...r,
            note:
              mode === "balance"
                ? "Formulae stay fixed; coefficients are your proposed particle numbers."
                : "Use the original supplied values above and below.",
          }}
          values={b}
        />
      )}
      {mode === "balance" &&
        (completeCoefficients ? (
          <div className="pollution-table pollution-tally">
            <table>
              <caption>Your proposed atom totals</caption>
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Reactants</th>
                  <th>Products</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(atomTally(r.equation!, b)).map(([atom, t]) => (
                  <tr key={atom} data-atom={atom}>
                    <th scope="row">{atom}</th>
                    <td>{t.left}</td>
                    <td>{t.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="pollution-unknown">
            Enter positive whole-number coefficients to compare atom totals.
            Blank or invalid values remain unknown.
          </p>
        ))}
      {mode === "products" && (
        <div
          className="pollution-product-groups"
          role="group"
          aria-label="Your predicted combustion products"
        >
          {[
            ["possible", "Your predicted products"],
            ["absent", "Not predicted here"],
            ["", "Not decided"],
          ].map(([value, title]) => {
            const selected = fields.filter((f) => b[f] === value);
            return selected.length ? (
              <section
                key={title}
                className="pollution-product-group"
                data-proposal={value || "unknown"}
              >
                <h4>{title}</h4>
                <ul>
                  {selected.map((f) => (
                    <li key={f}>{pollutionLabels[f]}</li>
                  ))}
                </ul>
              </section>
            ) : null;
          })}
        </div>
      )}
      {(mode === "source" || mode === "effects") && (
        <ol
          className="pollution-chain"
          aria-label="Your proposed explanation chain"
        >
          {fields.map((f) => (
            <li key={f}>
              <strong>{pollutionLabels[f]}:</strong>{" "}
              {b[f] ? pollutionLabels[b[f]] : "Not chosen"}
            </li>
          ))}
        </ol>
      )}
      <div className="pollution-actions">
        <button
          type="button"
          className="button"
          onClick={() => setChecked(checkPollution(mode, b))}
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
          onClick={() => change([initialPollution(mode, record)])}
        >
          Clear proposal
        </button>
      </div>
      {full && (
        <p role="status">
          Edit-history limit reached. Undo or clear this proposal to continue.
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
