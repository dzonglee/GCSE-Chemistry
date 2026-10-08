"use client";
import { useId, useState } from "react";
import {
  cycleRecord,
  cycleFields,
  cycleNumeric,
  cycleLabels,
  cycleChoices,
  initialCycle,
  validCycleHistory,
  checkCycle,
  type CycleMode,
  type CycleBoard,
  type CycleGiven,
  type CycleLedger,
  type CycleSeries,
} from "@/lib/cycle";
import { readNumber } from "@/lib/marking";
const nodes = [
  ["air", 30, 20, "Atmosphere", "CO₂"],
  ["plants", 30, 130, "Plants/algae", "Organic carbon"],
  ["animals", 300, 130, "Animals", "Organic carbon"],
  ["dead", 30, 240, "Dead material", "and waste"],
  ["microbes", 300, 240, "Decomposers", "Organic carbon"],
  ["fossil", 30, 350, "Fossil fuels", "Stored carbon"],
  ["ocean", 300, 20, "Ocean", "Dissolved carbon"],
  ["rock", 300, 350, "Sediment/rock", "Carbonates"],
] as const;
function RouteMap({
  from,
  to,
  label,
}: {
  from: string;
  to: string;
  label: string;
}) {
  const uid = useId(),
    a = nodes.find((n) => n[0] === from),
    b = nodes.find((n) => n[0] === to);
  const start = a ? [a[1] === 30 ? 215 : 295, a[2] + 39] : [0, 0],
    finish = b ? [b[1] === 30 ? 220 : 290, b[2] + 39] : [0, 0];
  return (
    <>
      <p className="cycle-pan-note">
        Swipe the diagram, or focus it and use ←/→. Boxes are stores; the orange
        arrow is the supplied or proposed transfer.
      </p>
      <div
        className="cycle-pan"
        tabIndex={0}
        role="region"
        aria-label="Carbon stores diagram; swipe or use arrow keys to pan"
      >
        <svg
          width="540"
          height="448"
          role="img"
          aria-label={`${cycleLabels[from] || "Unchosen store"} → ${label || "Unchosen process"} → ${cycleLabels[to] || "Unchosen store"}`}
        >
          <defs>
            <marker
              id={uid}
              markerWidth="9"
              markerHeight="9"
              refX="8"
              refY="4"
              orient="auto"
            >
              <path d="M0 0L8 4L0 8" fill="#b55a16" />
            </marker>
          </defs>
          {a && b && a !== b && (
            <path
              d={`M${start[0]} ${start[1]}H255V${finish[1]}H${finish[0]}`}
              fill="none"
              stroke="#b55a16"
              strokeWidth="4"
              markerEnd={`url(#${uid})`}
              data-transfer="proposal"
            />
          )}
          {nodes.map(([key, x, y, l1, l2]) => (
            <g key={key}>
              <rect
                x={x}
                y={y}
                width="180"
                height="78"
                rx="10"
                fill={
                  key === from ? "#fff2df" : key === to ? "#e8f1ff" : "#fff"
                }
                stroke={
                  key === from ? "#b55a16" : key === to ? "#3344c6" : "#bac5d9"
                }
                strokeWidth="2"
              />
              <text
                x={x + 90}
                y={y + 30}
                textAnchor="middle"
                fontSize="16"
                fontWeight="700"
                fill="#26334c"
              >
                {l1}
              </text>
              <text
                x={x + 90}
                y={y + 55}
                textAnchor="middle"
                fontSize="14"
                fill="#26334c"
              >
                {l2}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className="cycle-route-text">
        <strong>Transfer:</strong>{" "}
        {cycleLabels[from] || "Starting store unknown"} →{" "}
        {label || "Process unknown"} →{" "}
        {cycleLabels[to] || "Destination unknown"}
        {from && from === to
          ? " (same store selected; no movement between stores drawn)"
          : ""}
      </p>
    </>
  );
}
function Ledger({ data }: { data: CycleLedger }) {
  return (
    <div className="cycle-inventory">
      <h4>{data.store}</h4>
      <p>
        <strong>Starting store:</strong> {data.start} {data.unit}. Interval:{" "}
        {data.interval}.
      </p>
      <div className="cycle-table">
        <table>
          <caption>
            Fixed carbon transfers / {data.unit} over {data.interval}
          </caption>
          <thead>
            <tr>
              <th>Direction</th>
              <th>Process</th>
              <th>Carbon</th>
            </tr>
          </thead>
          <tbody>
            {[
              ...data.inflows.map((r) => ({ ...r, direction: "Entering" })),
              ...data.outflows.map((r) => ({ ...r, direction: "Leaving" })),
            ].map((r, i) => (
              <tr key={i}>
                <th scope="row">{r.direction}</th>
                <td>{r.label}</td>
                <td>{r.amount}</td>
              </tr>
            ))}
            {!data.inflows.length && (
              <tr>
                <th scope="row">Entering</th>
                <td>No inflow supplied</td>
                <td>0</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Series({
  data,
  values,
}: {
  data: CycleSeries;
  values: Record<string, string>;
}) {
  const top = 35,
    bottom = 235,
    y = (v: number) =>
      bottom - ((v - data.min) / (data.max - data.min)) * (bottom - top),
    x = (i: number) => 80 + i * 80,
    ticks = Array.from(
      { length: 5 },
      (_, i) => data.min + (i * (data.max - data.min)) / 4,
    );
  return (
    <>
      <p className="cycle-pan-note">
        Swipe the graph, or focus it and use ←/→. The full numerical table is
        below.
      </p>
      <div
        className="cycle-pan"
        tabIndex={0}
        role="region"
        aria-label="Original concentration graph; swipe or use arrow keys to pan"
      >
        <svg
          width="540"
          height="345"
          role="img"
          aria-label="Original supplied concentration series, blue supplied exercise points with your orange endpoint proposals"
        >
          <text x="80" y="20" fontSize="14" fill="#26334c">
            Concentration / {data.unit}
          </text>
          {ticks.map((t) => (
            <g key={t}>
              <path d={`M80 ${y(t)}H480`} stroke="#d8dfeb" />
              <text
                x="68"
                y={y(t) + 5}
                textAnchor="end"
                fontSize="14"
                fill="#26334c"
              >
                {t}
              </text>
            </g>
          ))}
          <path d={`M80 ${top}V${bottom}H480`} fill="none" stroke="#61738e" />
          <polyline
            points={data.points
              .map((p, i) => `${x(i)},${y(p.value)}`)
              .join(" ")}
            fill="none"
            stroke="#3344c6"
            strokeWidth="3"
          />
          {data.points.map((p, i) => (
            <g key={p.label}>
              <circle cx={x(i)} cy={y(p.value)} r="5" fill="#3344c6" />
              <text
                x={x(i)}
                y={bottom + 24}
                textAnchor="middle"
                fontSize="14"
                fill="#26334c"
              >
                {p.label.split(" ")[0]}
              </text>
              <text
                x={x(i)}
                y={bottom + 44}
                textAnchor="middle"
                fontSize="14"
                fill="#26334c"
              >
                {p.label.split(" ")[1]}
              </text>
            </g>
          ))}
          {["start", "end"].map((f, i) => {
            const v = readNumber(values[f] || "");
            return v !== null && v >= data.min && v <= data.max ? (
              <circle
                key={f}
                cx={x(i ? data.points.length - 1 : 0)}
                cy={y(v)}
                r="9"
                fill="none"
                stroke="#b55a16"
                strokeWidth="3"
                data-endpoint={f}
              />
            ) : null;
          })}
          <text x="80" y="323" fontSize="14" fill="#26334c">
            Blue: supplied data. Orange rings: your endpoint readings.
          </text>
        </svg>
      </div>
      {(values.start || values.end) && (
        <p className="cycle-route-text">
          Your first reading: {values.start || "unknown"}; last reading:{" "}
          {values.end || "unknown"}. Values outside {data.min}–{data.max}, or
          unreadable entries, remain here rather than being moved onto the axis.
        </p>
      )}
      <div className="cycle-table">
        <table>
          <caption>Original concentration values / {data.unit}</caption>
          <thead>
            <tr>
              <th>Time</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {data.points.map((p) => (
              <tr key={p.label}>
                <th scope="row">{p.label}</th>
                <td>{p.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
const carbonCount: Record<string, number> = {
  glucose: 6,
  carbonDioxide: 1,
  methane: 1,
  calciumCarbonate: 1,
  oxygen: 0,
  water: 0,
};
function AtomTrace({
  data,
  values,
}: {
  data: NonNullable<CycleGiven["atom"]>;
  values: Record<string, string>;
}) {
  const forms = [data.forms[0], values.middleForm, values.finalForm];
  return (
    <ol
      className="cycle-atom-trace"
      aria-label="Your proposed carbon-containing forms"
    >
      {data.stages.map((stage, i) => {
        const form = forms[i],
          count = carbonCount[form];
        return (
          <li key={stage}>
            <h4>{stage}</h4>
            <p>{cycleLabels[form] || "Form unknown"}</p>
            {count !== undefined ? (
              <>
                <div
                  className="cycle-carbon-dots"
                  role="group"
                  aria-label={`${count} carbon atoms per ${form === "calciumCarbonate" ? "formula unit" : "molecule"}`}
                >
                  {Array.from({ length: count }, (_, j) => (
                    <span
                      key={j}
                      className={j === 0 ? "cycle-traced-carbon" : ""}
                    >
                      C
                    </span>
                  ))}
                </div>
                {count > 0 && (
                  <p>
                    The orange C marks one traced carbon atom; other C markers
                    belong to the same proposed compound.
                  </p>
                )}
                <p>
                  {count} carbon {count === 1 ? "atom" : "atoms"} per{" "}
                  {form === "calciumCarbonate" ? "formula unit" : "molecule"}.
                </p>
              </>
            ) : form ? (
              <>
                <div className="cycle-carbon-dots">
                  <span className="cycle-traced-carbon">C</span>
                </div>
                <p>
                  One traced carbon atom in a mixture of compounds; no single
                  molecular formula or total carbon count is implied.
                </p>
              </>
            ) : (
              <p>The form and carbon count remain unknown.</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
export function CycleGivenFigure({
  data,
  values = {},
  embedded = false,
}: {
  data: CycleGiven;
  embedded?: boolean;
  values?: Record<string, string>;
}) {
  return (
    <div className="cycle-original">
      {!embedded && (
        <>
          <h3>{data.title}</h3>
          <p>{data.note}</p>
        </>
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
      {data.route && <RouteMap {...data.route} />}{" "}
      {data.ledger && <Ledger data={data.ledger} />}{" "}
      {data.comparison && (
        <>
          <h4>Before</h4>
          <Ledger data={data.comparison.before} />
          <h4>After</h4>
          <Ledger data={data.comparison.after} />
        </>
      )}
      {data.series && <Series data={data.series} values={values} />}{" "}
      {data.atom && <AtomTrace data={data.atom} values={values} />}
    </div>
  );
}
export function CycleWorkbench({
  mode,
  record,
  history,
  onChange,
}: {
  mode: CycleMode;
  record: string;
  history: CycleBoard[];
  onChange: (h: CycleBoard[]) => void;
}) {
  const uid = useId(),
    [checked, setChecked] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    r = cycleRecord(mode, record);
  if (!r || !validCycleHistory(mode, record, history))
    return (
      <p role="status">
        This saved carbon proposal is unreadable; its raw entries are retained.
      </p>
    );
  const b = history.at(-1)!,
    fields = cycleFields[mode],
    full = history.length >= 500;
  function change(h: CycleBoard[]) {
    onChange(h);
    setChecked(null);
  }
  function edit(f: string, v: string) {
    if (full || b[f] === v) return;
    const h = [...history, { ...b, [f]: v }];
    if (validCycleHistory(mode, record, h)) change(h);
  }
  const unit = r.series?.unit || r.ledger?.unit || r.comparison?.before.unit;
  return (
    <section
      className="cycle-workbench"
      data-record={record}
      aria-label="Task model"
    >
      <h3>{r.title}</h3>
      <p className="cycle-context">{r.note}</p>
      {["ledger", "change", "pattern"].includes(mode) && (
        <CycleGivenFigure data={r} values={b} embedded />
      )}
      <div className="cycle-fields">
        {fields.map((f) => (
          <label key={f} htmlFor={uid + f}>
            {cycleLabels[f]}
            {cycleNumeric.includes(f) && unit ? " / " + unit : ""}
            {cycleNumeric.includes(f) ? (
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
                {cycleChoices[f].map((v) => (
                  <option key={v} value={v}>
                    {cycleLabels[v]}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>
      {mode === "route" ? (
        <RouteMap
          from={b.from}
          to={b.to}
          label={cycleLabels[b.process] || ""}
        />
      ) : mode === "atom" ? (
        <CycleGivenFigure data={r} values={b} embedded />
      ) : null}
      {mode === "atom" && (
        <p className="cycle-route-text">
          Your traced-atom proposal: {cycleLabels[b.conserved] || "Unknown"}.
        </p>
      )}
      {["ledger", "change", "stores", "pattern"].includes(mode) && (
        <dl className="cycle-proposal" aria-label="Your proposal">
          {fields.map((f) => (
            <div key={f}>
              <dt>{cycleLabels[f]}</dt>
              <dd>
                {cycleLabels[b[f]] || b[f] || "Unknown"}
                {cycleNumeric.includes(f) && unit && b[f] ? " " + unit : ""}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <div className="cycle-actions">
        <button
          type="button"
          className="button"
          onClick={() => setChecked(checkCycle(mode, b))}
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
          onClick={() => change([initialCycle(mode, record)])}
        >
          Clear proposal
        </button>
      </div>
      {full && (
        <p role="status">
          This proposal has reached its saved-edit limit. Undo or clear this
          proposal to keep working.
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
        <summary>About this representation</summary>
        <p>
          Carbon boxes represent stores, not size or location to scale. An arrow
          transfers existing carbon; it does not create atoms. Invented
          numerical inventories and concentration series teach reasoning and are
          not global observations. A chemical formula counts carbon per molecule
          or formula unit, rather than all carbon in a store. Energy flows
          through ecosystems; it is not recycled in the same way as carbon.
        </p>
      </details>
    </section>
  );
}
