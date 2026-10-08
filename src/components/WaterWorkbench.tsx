"use client";
import { Fragment, useId, useState } from "react";
import {
  waterRecord,
  waterFields,
  waterNumeric,
  waterLabels,
  waterChoices,
  initialWater,
  validWaterHistory,
  checkWater,
  type WaterMode,
  type WaterBoard,
  type WaterGiven,
} from "@/lib/water";
import { WaterScene3D } from "./WaterScene3D";
export function WaterGivenFigure({
  data,
  embedded = false,
}: {
  data: WaterGiven;
  embedded?: boolean;
}) {
  return (
    <div className="water-original">
      {!embedded && (
        <>
          <h3>{data.title}</h3>
          <p>{data.note}</p>
        </>
      )}
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
      {data.balance && (
        <dl>
          <div>
            <dt>Empty dish / g</dt>
            <dd>{data.balance.empty.toFixed(2)}</dd>
          </div>
          <div>
            <dt>Dish + dry cooled residue / g</dt>
            <dd>{data.balance.cooled.toFixed(2)}</dd>
          </div>
          <div>
            <dt>Measured sample / cm³</dt>
            <dd>{data.balance.volume}</dd>
          </div>
        </dl>
      )}
      {data.membrane && (
        <dl>
          <div>
            <dt>Original feed / litres</dt>
            <dd>{data.membrane.feed}</dd>
          </div>
          <div>
            <dt>Supplied product volume / litres</dt>
            <dd>{data.membrane.product}</dd>
          </div>
          <div>
            <dt>Original dissolved salt / g</dt>
            <dd>{data.membrane.salt}</dd>
          </div>
        </dl>
      )}
      {data.energy && (
        <dl>
          <div>
            <dt>Route A total energy / kWh</dt>
            <dd>{data.energy.a}</dd>
          </div>
          <div>
            <dt>Route B total energy / kWh</dt>
            <dd>{data.energy.b}</dd>
          </div>
          <div>
            <dt>Equal treated volume / m³</dt>
            <dd>{data.energy.volume}</dd>
          </div>
        </dl>
      )}
      {data.repeat && (
        <>
          <div className="water-table">
            <table>
              <caption>
                Original residue masses / g; each sample {data.repeat.volume}{" "}
                cm³
              </caption>
              <thead>
                <tr>
                  <th>Repeat</th>
                  <th>Mass / g</th>
                </tr>
              </thead>
              <tbody>
                {data.repeat.masses.map((n, i) => (
                  <tr key={i}>
                    <th scope="row">{i + 1}</th>
                    <td>{n.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {data.apparatus && (
        <p>
          Fixed path: heated flask → connected vapour delivery tube → open
          receiver. Nonvolatile feed salt is at the heated end. This supplied
          feed contains no volatile contaminants.
        </p>
      )}
    </div>
  );
}
function RouteFates({ b }: { b: WaterBoard }) {
  const filter = b.first === "filter" || b.second === "filter",
    disinfect = [b.first, b.second].some((x) =>
      ["chlorine", "ozone", "uv"].includes(x),
    ),
    desalt = b.first === "distillation" || b.first === "ro";
  return (
    <div
      className="water-route"
      aria-label="Consequences of your treatment route"
    >
      <ol>
        <li>Original source</li>
        <li>{waterLabels[b.first] || "First stage unknown"}</li>
        <li>{waterLabels[b.second] || "Next stage unknown"}</li>
      </ol>
      <dl>
        <div>
          <dt>Suspended particles</dt>
          <dd>
            {filter
              ? "Removed by your filter stage"
              : "No ordinary filtration stage selected; consult the fixed source evidence."}
          </dd>
        </div>
        <div>
          <dt>Dissolved salts</dt>
          <dd>
            {desalt
              ? "Separated into the flask residue or brine stream"
              : "Remain dissolved; ordinary filtration/disinfection does not desalinate."}
          </dd>
        </div>
        <div>
          <dt>Harmful microbes</dt>
          <dd>
            {disinfect || b.first === "distillation"
              ? "Targeted by the proposed disinfection or supplied heating"
              : "No supplied disinfection/heating selected; do not assume a safety result."}
          </dd>
        </div>
      </dl>
    </div>
  );
}
function PhasePath({ b }: { b: WaterBoard }) {
  return (
    <ol
      className="water-phase"
      aria-label="Your proposed phase and collection path"
    >
      <li>
        <strong>Heated flask</strong>
        <p>{waterLabels[b.heating] || "Phase change unknown"}</p>
      </li>
      <li>
        <strong>Delivery tube / receiver</strong>
        <p>{waterLabels[b.cooling] || "Cooling unknown"}</p>
      </li>
      <li>
        <strong>Collected material</strong>
        <p>{waterLabels[b.receiver] || "Collection unknown"}</p>
      </li>
    </ol>
  );
}
export function WaterWorkbench({
  mode,
  record,
  history,
  onChange,
}: {
  mode: WaterMode;
  record: string;
  history: WaterBoard[];
  onChange: (h: WaterBoard[]) => void;
}) {
  const uid = useId(),
    [unavailable, setUnavailable] = useState(false),
    [checked, setChecked] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    r = waterRecord(mode, record);
  if (!r || !validWaterHistory(mode, record, history))
    return (
      <p role="status">
        This saved water proposal is unreadable; its raw entries are retained.
      </p>
    );
  const b = history.at(-1)!,
    full = history.length >= 500;
  function change(h: WaterBoard[]) {
    onChange(h);
    setChecked(null);
  }
  function edit(f: string, v: string) {
    if (full || b[f] === v) return;
    const h = [...history, { ...b, [f]: v }];
    if (validWaterHistory(mode, record, h)) change(h);
  }
  return (
    <section
      className="water-workbench"
      data-record={record}
      aria-label="Task model"
    >
      <h3>{r.title}</h3>
      <p className="water-context">{r.summary || r.note}</p>
      {!r.summary && <WaterGivenFigure data={r} embedded />}
      <div className="water-fields">
        {waterFields[mode].map((f) => (
          <Fragment key={f}>
            <label htmlFor={uid + f}>
              {waterLabels[f]}
              {waterNumeric.includes(f) ? (
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
                  {waterChoices[f].map((v) => (
                    <option key={v} value={v}>
                      {waterLabels[v]}
                    </option>
                  ))}
                </select>
              )}
            </label>
            {mode === "distil" && f === "cooling" && (
              <WaterScene3D board={b} onUnavailable={setUnavailable} />
            )}
          </Fragment>
        ))}
      </div>
      {r.summary && (
        <details>
          <summary>Full original evidence</summary>
          <WaterGivenFigure data={r} embedded />
        </details>
      )}
      {mode === "treatment" && <RouteFates b={b} />}
      {mode === "distil" && (
        <details open={unavailable}>
          <summary>Read your proposed phase path</summary>
          <PhasePath b={b} />
        </details>
      )}
      {mode === "membrane" && (
        <div
          className="water-streams"
          aria-label="Your proposed membrane streams"
        >
          <div>
            <strong>Original feed</strong>
            <p>
              {r.membrane!.feed} litres, {r.membrane!.salt} g salt
            </p>
          </div>
          <div>
            <strong>Your product stream</strong>
            <p>{b.product || "Unknown"} litres</p>
          </div>
          <div>
            <strong>Your brine stream</strong>
            <p>
              {b.brine || "Unknown"} litres; {b.brineSalt || "Unknown"} g
              retained salt
            </p>
          </div>
        </div>
      )}
      {["residue", "resources", "repeat"].includes(mode) && (
        <div className="water-proposal" aria-label="Your proposal">
          <strong>Your construction</strong>
          {mode === "residue" && (
            <p>
              {b.solidMass || "Unknown"} g ÷ {b.litres || "Unknown"} dm³ → your
              concentration: {b.concentration || "Unknown"} g/dm³.
            </p>
          )}
          {mode === "resources" && (
            <p>
              A: {b.aPer || "Unknown"}; B: {b.bPer || "Unknown"}; your B−A:{" "}
              {b.difference || "Unknown"} kWh/m³.{" "}
              {waterLabels[b.decision] || "Conclusion unknown"}.
            </p>
          )}
          {mode === "repeat" && (
            <p>
              Your mean: {b.mean || "Unknown"} g; concentration:{" "}
              {b.scaled || "Unknown"} g/dm³. Dryness evidence:{" "}
              {waterLabels[b.dry] || "Unknown"}.
            </p>
          )}
        </div>
      )}
      <div className="water-actions">
        <button
          type="button"
          className="button"
          onClick={() => setChecked(checkWater(mode, b))}
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
          onClick={() => change([initialWater(mode, record)])}
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
        <summary>About these water models</summary>
        <p>
          Quality classifications use the supplied evidence; appearance, pH or
          one residue test alone does not prove universal safety. Numeric
          records are original exercises. Ideal membrane inventories assume the
          explicitly stated rejection and losses. Apparatus regions illustrate
          physical phase separation, not water decomposition, molecules or a
          measured yield. These simulations prepare practical reasoning; actual
          experiments require qualified school supervision.
        </p>
      </details>
    </section>
  );
}
