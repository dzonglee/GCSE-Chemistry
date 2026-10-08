"use client";
import { useId, useState } from "react";
import {
  wasteRecord,
  wasteFields,
  wasteNumeric,
  wasteLabels,
  wasteChoices,
  initialWaste,
  validWasteHistory,
  checkWaste,
  type WasteMode,
  type WasteBoard,
  type WasteGiven,
} from "@/lib/wastewater";
export function WasteGivenFigure({
  data,
  embedded = false,
}: {
  data: WasteGiven;
  embedded?: boolean;
}) {
  return (
    <div className="waste-original">
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
      {data.solids && (
        <dl>
          {Object.entries(data.solids).map(([k, v]) => (
            <div key={k}>
              <dt>
                {
                  {
                    feed: "Feed dry solids",
                    screen: "Screened dry solids",
                    grit: "Removed dry grit",
                    sludge: "Settled dry solids in sludge",
                  }[k]
                }
              </dt>
              <dd>{v} kg</dd>
            </div>
          ))}
        </dl>
      )}
      {data.disposal && (
        <table>
          <caption>Supplied dry-sludge disposal / tonnes</caption>
          <thead>
            <tr>
              <th>Destination</th>
              <th>Mass / tonnes</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.disposal).map(([k, v]) => (
              <tr key={k}>
                <th scope="row">
                  {
                    {
                      fertiliser: "Fertiliser",
                      landfill: "Landfill",
                      burn: "Burned",
                      other: "Other",
                    }[k]
                  }
                </th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
function WasteProposal({
  mode,
  b,
  data,
}: {
  mode: WasteMode;
  b: WasteBoard;
  data: WasteGiven;
}) {
  const label = (f: string) => wasteLabels[b[f]] || "Unknown";
  if (mode === "route")
    return (
      <div className="waste-path" aria-label="Your proposed treatment branches">
        <div>
          <strong>Physical route</strong>
          <p>
            Supplied feed → {label("first")} → {label("next")}
          </p>
        </div>
        <div className="waste-branches">
          <div>
            <strong>Settled sludge</strong>
            <p>{label("sludge")}</p>
            <small>Settled material plus water</small>
          </div>
          <div>
            <strong>Liquid effluent</strong>
            <p>{label("effluent")}</p>
            <small>Liquid stream; quality unproved</small>
          </div>
        </div>
      </div>
    );
  if (mode === "solids")
    return (
      <div className="waste-proposal" aria-label="Your dry-solid inventory">
        <strong>Your dry-solid inventory</strong>
        <p>
          After screening/grit: {b.after || "Unknown"} kg → settled dry solids:{" "}
          {data.solids?.sludge} kg; effluent solids: {b.remaining || "Unknown"}{" "}
          kg.
        </p>
        <p>Basis: {label("basis")}</p>
      </div>
    );
  if (mode === "disposal")
    return (
      <div className="waste-proposal" aria-label="Your percentage construction">
        <strong>Your part-to-whole construction</strong>
        <p>
          Fixed burned mass ÷ your total {b.total || "Unknown"} tonnes → your
          fraction {b.fraction || "Unknown"} → your percentage{" "}
          {b.percent || "Unknown"}%.
        </p>
      </div>
    );
  if (mode === "biology")
    return (
      <div className="waste-proposal" aria-label="Your biological proposal">
        <p>
          {label("oxygen")} → {label("process")}
        </p>
        <p>Unproved: {label("limit")}</p>
      </div>
    );
  return null;
}
export function WasteWorkbench({
  mode,
  record,
  history,
  onChange,
}: {
  mode: WasteMode;
  record: string;
  history: WasteBoard[];
  onChange: (h: WasteBoard[]) => void;
}) {
  const uid = useId(),
    [checked, setChecked] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    r = wasteRecord(mode, record);
  if (!r || !validWasteHistory(mode, record, history))
    return (
      <p role="status">
        Saved wastewater proposal is unreadable; its raw entries are retained.
      </p>
    );
  const b = history.at(-1)!,
    full = history.length >= 500;
  function change(h: WasteBoard[]) {
    onChange(h);
    setChecked(null);
  }
  function edit(f: string, v: string) {
    if (full || b[f] === v) return;
    const h = [...history, { ...b, [f]: v }];
    if (validWasteHistory(mode, record, h)) change(h);
  }
  return (
    <section
      className="waste-workbench"
      data-record={record}
      aria-label="Task model"
    >
      <h3>{r.title}</h3>
      <p className="waste-context">{r.summary || r.note}</p>
      {!r.summary && <WasteGivenFigure data={r} embedded />}
      <div className="waste-fields">
        {wasteFields[mode].map((f) => (
          <label htmlFor={uid + f} key={f}>
            {wasteLabels[f]}
            {wasteNumeric.includes(f) ? (
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
                {wasteChoices[f].map((v) => (
                  <option key={v} value={v}>
                    {wasteLabels[v]}
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
          <WasteGivenFigure data={r} embedded />
        </details>
      )}
      <WasteProposal mode={mode} b={b} data={r} />
      <div className="waste-actions">
        <button
          type="button"
          className="button"
          onClick={() => setChecked(checkWaste(mode, b))}
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
          onClick={() => change([initialWaste(mode, record)])}
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
        <summary>About these wastewater models</summary>
        <p>
          Original supplied cases and inventories. The branch map shows stages,
          not dimensions or measured plant performance. Dry suspended-solid
          balances cover physical separation before reaction; sludge also
          contains water. Biological treatment changes matter into other forms,
          not vanished atoms. Discharge and drinking quality require different
          evidence. Methane-containing biogas is labelled cross-science
          explanatory context. No hands-on or examination competence is
          certified.
        </p>
      </details>
    </section>
  );
}
