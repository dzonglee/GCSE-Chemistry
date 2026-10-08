"use client";
import { useId, useState } from "react";
import { readNumber } from "@/lib/marking";
import {
  greenhouseRecord,
  greenhouseFields,
  greenhouseChoices,
  greenhouseLabels,
  greenhouseNumeric,
  initialGreenhouse,
  validGreenhouseHistory,
  checkGreenhouse,
  type GreenhouseMode,
  type GreenhouseBoard,
  type GreenhouseGiven,
} from "@/lib/greenhouse";
export function GreenhouseLedger({
  data,
  values = {},
  teaching = false,
  validateProposal = true,
}: {
  data: NonNullable<GreenhouseGiven["budget"]>;
  values?: Record<string, string>;
  teaching?: boolean;
  validateProposal?: boolean;
}) {
  const max = Math.max(data.incoming, data.escaping),
    rows = [
      { label: "Incoming sunlight", value: data.incoming, color: "#cb8d21" },
      { label: "Reflected sunlight", value: data.reflected, color: "#69758c" },
      { label: "Escaping infrared", value: data.escaping, color: "#b54f38" },
    ];
  return (
    <figure className="greenhouse-ledger">
      <figcaption>Whole-Earth energy per equal interval</figcaption>
      {rows.map((r) => (
        <div className="greenhouse-energy-row" key={r.label}>
          <span>{r.label}</span>
          <div className="greenhouse-track">
            <span
              style={{
                width: (100 * r.value) / max + "%",
                background: r.color,
              }}
            />
          </div>
          <strong>{r.value} units</strong>
        </div>
      ))}
      {Object.keys(values).length > 0 && (
        <div
          className="greenhouse-proposal-ledger"
          aria-label="Your constructed energy ledger"
        >
          {["absorbed", "net"].map((f) => {
            const n = readNumber(values[f] ?? "");
            return (
              <p key={f}>
                <strong>{greenhouseLabels[f]}:</strong>{" "}
                {values[f] || "Not entered"}
                {validateProposal && values[f] && n === null
                  ? " — not a readable number"
                  : ""}
                {validateProposal &&
                f === "absorbed" &&
                n !== null &&
                (n < 0 || n > data.incoming)
                  ? " — outside the supplied incoming total"
                  : ""}
              </p>
            );
          })}
        </div>
      )}
      <p className="greenhouse-note">
        {teaching
          ? "Original teaching units. Reflection leaves the system; internal back radiation is not extra sunlight. No exact temperature can be calculated from this ledger."
          : "Original teaching energy amounts, all for the same interval."}
      </p>
    </figure>
  );
}
export function GreenhouseGivenFigure({ data }: { data: GreenhouseGiven }) {
  return (
    <div className="greenhouse-original">
      <h3>{data.title}</h3>
      <p>{data.note}</p>
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
      {data.budget && <GreenhouseLedger data={data.budget} />}
    </div>
  );
}
function WaveComparison({ b }: { b: GreenhouseBoard }) {
  const wave = (cycles: number) =>
    Array.from(
      { length: 181 },
      (_, i) =>
        `${i === 0 ? "M" : "L"}${10 + i * 1.5},${45 + 16 * Math.sin((i / 180) * Math.PI * 2 * cycles)}`,
    ).join(" ");
  return (
    <figure className="greenhouse-waves">
      <figcaption>Compare wave spacing over the same drawn distance</figcaption>
      {["incoming", "outgoing"].map((f, i) => (
        <div key={f}>
          <strong>{i === 0 ? "Sun → Earth" : "Surface → atmosphere"}</strong>
          <svg
            viewBox="0 0 290 90"
            role="img"
            aria-label={
              (i === 0
                ? "A: more cycles over the same distance"
                : "B: fewer cycles over the same distance") +
              "; illustrative wavelength comparison"
            }
          >
            <path
              d={wave(i === 0 ? 6 : 2)}
              fill="none"
              stroke={i === 0 ? "#be831b" : "#b54f38"}
              strokeWidth="3"
            />
            <path d="M10 78H280" stroke="#637089" />
          </svg>
          <p>Your label: {b[f] ? greenhouseLabels[b[f]] : "Not chosen"}</p>
        </div>
      ))}
      <p className="greenhouse-note">
        Spacing is illustrative. Real solar and terrestrial radiation each span
        a range of wavelengths.
      </p>
    </figure>
  );
}
function RadiationPath({ b }: { b: GreenhouseBoard }) {
  const full = b.release === "allDirections",
    down = full || b.release === "downOnly";
  return (
    <figure className="greenhouse-radiation">
      <figcaption>Your radiation pathway</figcaption>
      <svg
        viewBox="0 0 300 265"
        role="img"
        aria-label="Schematic Sun, atmosphere and surface; arrows follow the selected proposal, explained in the text below"
      >
        <circle cx="45" cy="35" r="22" fill="#f5d477" />
        <text x="80" y="40">
          Sun
        </text>
        <rect x="15" y="100" width="270" height="65" rx="12" fill="#e5ecfa" />
        <text data-atmosphere-label="" x="190" y="155">
          Atmosphere
        </text>
        <rect x="15" y="225" width="270" height="25" rx="4" fill="#d2e9dc" />
        <text x="25" y="244">
          Earth’s surface
        </text>
        {b.entry && (
          <path
            data-solar-path=""
            d={
              b.entry === "blockAll"
                ? "M55 60L80 95l-10-4m10 4l-1-11"
                : "M55 60L112 215l-12-7m12 7l3-14"
            }
            fill="none"
            stroke="#b78116"
            strokeWidth="4"
          />
        )}
        {b.surface && b.surface !== "reflectOnly" && (
          <path
            data-surface-path=""
            d="M170 215V173l-7 11m7-11l7 11"
            stroke="#ad4b34"
            fill="none"
            strokeWidth="4"
          />
        )}
        {b.gas === "reflectIR" && (
          <path
            d="M180 172l35 40-12-3m12 3l-2-12"
            stroke="#ad4b34"
            fill="none"
            strokeWidth="4"
          />
        )}
        {b.gas === "absorbIR" && (
          <circle cx="170" cy="146" r="9" fill="#ad4b34" />
        )}
        {full && (
          <path
            data-upward-emission=""
            d="M183 140l40-62-12 6m12-6l-1 14"
            fill="none"
            stroke="#ad4b34"
            strokeWidth="4"
          />
        )}
        {down && (
          <path
            data-downward-emission=""
            d="M180 159l38 50-12-5m12 5l-2-12"
            fill="none"
            stroke="#ad4b34"
            strokeWidth="4"
          />
        )}
      </svg>
      <ol>
        {greenhouseFields.mechanism.map((f) => (
          <li key={f}>
            <strong>{greenhouseLabels[f]}:</strong>{" "}
            {b[f] ? greenhouseLabels[b[f]] : "Not chosen"}
          </li>
        ))}
      </ol>
      <p className="greenhouse-note">
        A schematic radiation-only explanation. Other energy transfers occur;
        arrows are not exact wavelengths, amounts or molecular trajectories.
      </p>
    </figure>
  );
}
export function GreenhouseWorkbench({
  mode,
  record,
  history,
  onChange,
}: {
  mode: GreenhouseMode;
  record: string;
  history: GreenhouseBoard[];
  onChange: (h: GreenhouseBoard[]) => void;
}) {
  const uid = useId(),
    [checked, setChecked] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    r = greenhouseRecord(mode, record);
  if (!r || !validGreenhouseHistory(mode, record, history))
    return (
      <p role="status">
        This saved greenhouse proposal is unreadable; its raw entries are
        retained.
      </p>
    );
  const b = history.at(-1)!,
    full = history.length >= 500;
  function change(h: GreenhouseBoard[]) {
    onChange(h);
    setChecked(null);
  }
  function edit(f: string, v: string) {
    if (full) return;
    const next = { ...b, [f]: v };
    if (validGreenhouseHistory(mode, record, [...history, next]))
      change([...history, next]);
  }
  return (
    <section
      className="greenhouse-workbench"
      data-record={record}
      aria-label="Task model"
    >
      <div className="greenhouse-original">
        <h3>{r.title}</h3>
        {mode !== "wave" && <p>{r.note}</p>}
        {r.rows && (
          <dl>
            {r.rows.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.text}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="greenhouse-fields">
        {greenhouseFields[mode].map((f) => (
          <label key={f} htmlFor={uid + f}>
            {greenhouseLabels[f]}
            {greenhouseNumeric.includes(f) ? (
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
                {greenhouseChoices[f].map((v) => (
                  <option value={v} key={v}>
                    {greenhouseLabels[v]}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>
      {mode === "wave" && <WaveComparison b={b} />}{" "}
      {mode === "mechanism" && <RadiationPath b={b} />}{" "}
      {r.budget && <GreenhouseLedger data={r.budget} values={b} teaching />}{" "}
      {mode === "source" && (
        <ol
          className="greenhouse-chain"
          aria-label="Your proposed activity to gas route"
        >
          <li>{r.title}</li>
          <li>
            {b.process ? greenhouseLabels[b.process] : "Process not selected"}
          </li>
          <li>
            {b.emission ? greenhouseLabels[b.emission] : "Gas not selected"}
          </li>
        </ol>
      )}
      {mode === "change" && (
        <ol
          className="greenhouse-chain"
          aria-label="Your proposed warming and balance explanation"
        >
          {greenhouseFields.change.map((f) => (
            <li key={f}>{b[f] ? greenhouseLabels[b[f]] : "Not selected"}</li>
          ))}
        </ol>
      )}
      {mode === "critique" && (
        <p className="greenhouse-repair">
          Your repair: {b.repair ? greenhouseLabels[b.repair] : "Not selected"}
        </p>
      )}
      <div className="greenhouse-actions">
        <button
          type="button"
          className="button"
          onClick={() => setChecked(checkGreenhouse(mode, b))}
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
          onClick={() => change([initialGreenhouse(mode, record)])}
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
