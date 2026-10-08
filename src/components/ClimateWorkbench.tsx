"use client";
import { useEffect, useId, useRef, useState } from "react";
import { readNumber } from "@/lib/marking";
import {
  climateRecord,
  climateFields,
  climateChoices,
  climateLabels,
  climateNumeric,
  initialClimate,
  validClimateHistory,
  checkClimate,
  type ClimateMode,
  type ClimateBoard,
  type ClimateGiven,
  type ClimateGraph,
} from "@/lib/climate";
export function ClimateTrend({
  data,
  values = {},
}: {
  data: ClimateGraph;
  values?: Record<string, string>;
}) {
  const pan = useRef<HTMLDivElement>(null),
    previous = useRef({ start: "", end: "" });
  useEffect(() => {
    const current = { start: values.start ?? "", end: values.end ?? "" },
      field = current.end !== previous.current.end ? "end" : "start",
      n = readNumber(current[field]);
    if (pan.current && n !== null && n >= data.min && n <= data.max)
      pan.current.scrollLeft =
        field === "end" ? pan.current.scrollWidth - pan.current.clientWidth : 0;
    previous.current = current;
  }, [values.start, values.end, data.min, data.max]);
  const intervals = Math.round(
      (data.max - data.min) / (data.max - data.min >= 1 ? 0.2 : 0.1),
    ),
    a = data.points[0].year,
    b = data.points.at(-1)!.year,
    x = (year: number) => 70 + ((year - a) / (b - a)) * 410,
    y = (n: number) => 235 - ((n - data.min) / (data.max - data.min)) * 180;
  const proposed = [
    { field: "start", year: a },
    { field: "end", year: b },
  ];
  return (
    <figure className="climate-trend">
      <figcaption>Temperature anomaly / °C</figcaption>
      <p className="climate-note">{data.baseline}. Original teaching series.</p>
      <p className="climate-note">
        Swipe the graph, or focus it and use ←/→. The table lists every original
        value.
      </p>
      <div
        ref={pan}
        className="climate-pan"
        tabIndex={0}
        role="region"
        aria-label="Temperature graph; swipe or use arrow keys to pan"
      >
        <svg
          viewBox="0 0 530 285"
          role="img"
          aria-label={`Original temperature anomalies from ${a} to ${b}; fixed vertical range ${data.min} to ${data.max}°C. All plotted data are also listed below.`}
        >
          {Array.from({ length: intervals + 1 }, (_, i) => {
            const n = Number(
              (data.min + ((data.max - data.min) * i) / intervals).toFixed(3),
            );
            return (
              <g key={i}>
                <path d={`M70 ${y(n)}H490`} stroke="#dee4ee" />
                <text x="58" y={y(n) + 5} textAnchor="end">
                  {n}
                </text>
              </g>
            );
          })}
          <path
            d="M70 45V235H490"
            fill="none"
            stroke="#5f6d85"
            strokeWidth="2"
          />
          <path
            data-original="series"
            d={data.points
              .map((p, i) => `${i ? "L" : "M"}${x(p.year)},${y(p.anomaly)}`)
              .join(" ")}
            stroke="#3344c6"
            fill="none"
            strokeWidth="3"
          />
          {data.points.map((p) => (
            <g key={p.year}>
              <circle cx={x(p.year)} cy={y(p.anomaly)} r="4" fill="#3344c6" />
              <text x={x(p.year)} y="260" textAnchor="middle">
                {p.year}
              </text>
            </g>
          ))}
          <text x="275" y="282" textAnchor="middle">
            Year
          </text>
          {proposed.map((p) => {
            const n = readNumber(values[p.field] ?? "");
            return n !== null && n >= data.min && n <= data.max ? (
              <g data-proposed={p.field} key={p.field}>
                <path
                  d={`M${x(p.year) - 7} ${y(n)}l7 -7l7 7l-7 7z`}
                  fill="#b15c18"
                  stroke="white"
                  strokeWidth="1.5"
                />
              </g>
            ) : null;
          })}
        </svg>
      </div>
      <p className="climate-legend">
        <span>● Original series</span>
        <span>◆ Your entered endpoints</span>
      </p>
      <div className="climate-table-wrap">
        <table>
          <caption>Original supplied data</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Anomaly / °C</th>
            </tr>
          </thead>
          <tbody>
            {data.points.map((p) => (
              <tr key={p.year}>
                <th scope="row">{p.year}</th>
                <td>{p.anomaly}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {Object.keys(values).length > 0 && (
        <div className="climate-proposal" aria-label="Your graph reading">
          {["start", "end", "change"].map((f) => {
            const n = readNumber(values[f] ?? "");
            return (
              <p key={f}>
                <strong>{climateLabels[f]}:</strong>{" "}
                {values[f] || "Not entered"}
                {values[f] && n === null ? " — not a readable number" : ""}
                {f !== "change" && n !== null && (n < data.min || n > data.max)
                  ? " — outside the supplied graph scale; no marker drawn"
                  : ""}
              </p>
            );
          })}
        </div>
      )}
    </figure>
  );
}
function Inventory({
  data,
  omitted,
}: {
  data: NonNullable<ClimateGiven["stages"]>;
  omitted?: string;
}) {
  const selected: Record<string, string> = {
    useStage: "Use",
    manufacturingStage: "Manufacture",
    transportStage: "Transport",
    disposalStage: "End of life",
  };
  return (
    <figure className="climate-inventory">
      <figcaption>Supplied full-lifetime inventory / kg CO₂e</figcaption>
      <ol>
        {data.map((r, i) => (
          <li
            key={r.stage}
            data-stage={r.stage}
            className={
              selected[omitted ?? ""] === r.stage
                ? "climate-selected-stage"
                : ""
            }
          >
            <span className="climate-stage-number" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <strong>{r.stage}</strong>
              <span>{r.amount} kg CO₂e</span>
              {selected[omitted ?? ""] === r.stage && (
                <small>Your proposed omitted stage</small>
              )}
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
function Range({
  data,
  values = {},
}: {
  data: NonNullable<ClimateGiven["range"]>;
  values?: Record<string, string>;
}) {
  return (
    <figure className="climate-range">
      <figcaption>Supplied estimate interval</figcaption>
      <p>{data.context}</p>
      <div className="climate-range-limits">
        <div>
          <span>Lower limit</span>
          <strong>
            {data.low}
            {data.unit}
          </strong>
        </div>
        <div>
          <span>Upper limit</span>
          <strong>
            {data.high}
            {data.unit}
          </strong>
        </div>
      </div>
      <div className="climate-range-band" aria-hidden="true" />
      <p className="climate-note">
        Band marks the stated interval only; no probability distribution is
        supplied.
      </p>
      {Object.keys(values).length > 0 && (
        <div className="climate-proposal">
          <p>
            Your interval width:{" "}
            <strong>{values.width || "Not entered"}</strong> °C
            {values.width && readNumber(values.width) === null
              ? " — not a readable number"
              : ""}
          </p>
          <p>
            Your interpretation:{" "}
            {values.meaning ? climateLabels[values.meaning] : "Not chosen"}
          </p>
        </div>
      )}
    </figure>
  );
}
function GasInventory({ data }: { data: NonNullable<ClimateGiven["gases"]> }) {
  return (
    <div className="climate-table-wrap">
      <table>
        <caption>Supplied greenhouse-gas inventory</caption>
        <thead>
          <tr>
            <th scope="col">Gas</th>
            <th scope="col">Mass / kg</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">CO₂</th>
            <td>{data.co2}</td>
          </tr>
          <tr>
            <th scope="row">CH₄</th>
            <td>{data.methane}</td>
          </tr>
        </tbody>
      </table>
      <p className="climate-note">
        Supplied CH₄ factor: {data.factor} kg CO₂e per kg CH₄; CO₂ factor: 1 kg
        CO₂e per kg CO₂. {data.horizon}. These are exercise values.
      </p>
    </div>
  );
}
function ServiceInventory({
  data,
}: {
  data: NonNullable<ClimateGiven["comparison"]>;
}) {
  return (
    <div className="climate-table-wrap climate-services">
      <table>
        <caption>One service: {data.service}</caption>
        <thead>
          <tr>
            <th scope="col">Option</th>
            <th scope="col">Lifetime total / kg CO₂e</th>
            <th scope="col" aria-label="Completed services">
              Uses
            </th>
          </tr>
        </thead>
        <tbody>
          {(["a", "b"] as const).map((k) => (
            <tr key={k}>
              <th scope="row">{k.toUpperCase()}</th>
              <td>{data[k].total}</td>
              <td>{data[k].uses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function ClimateGivenFigure({
  data,
  values = {},
}: {
  data: ClimateGiven;
  values?: Record<string, string>;
}) {
  return (
    <div className="climate-original">
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
      {data.graph && <ClimateTrend data={data.graph} values={values} />}{" "}
      {data.range && <Range data={data.range} />}{" "}
      {data.stages && <Inventory data={data.stages} />}{" "}
      {data.gases && <GasInventory data={data.gases} />}{" "}
      {data.comparison && <ServiceInventory data={data.comparison} />}
    </div>
  );
}
function Proposal({
  fields,
  board,
}: {
  fields: readonly string[];
  board: ClimateBoard;
}) {
  return (
    <div className="climate-proposal" aria-label="Your constructed proposal">
      {fields.map((f) => (
        <p key={f}>
          <strong>{climateLabels[f]}:</strong>{" "}
          {board[f]
            ? climateNumeric.includes(f)
              ? board[f]
              : climateLabels[board[f]]
            : "Not entered"}
          {board[f] &&
          climateNumeric.includes(f) &&
          readNumber(board[f]) === null
            ? " — not a readable number"
            : ""}
        </p>
      ))}
    </div>
  );
}
export function ClimateWorkbench({
  mode,
  record,
  history,
  onChange,
}: {
  mode: ClimateMode;
  record: string;
  history: ClimateBoard[];
  onChange: (h: ClimateBoard[]) => void;
}) {
  const uid = useId(),
    [checked, setChecked] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    r = climateRecord(mode, record);
  if (!r || !validClimateHistory(mode, record, history))
    return (
      <p role="status">
        This saved climate proposal is unreadable; its raw entries are retained.
      </p>
    );
  const b = history.at(-1)!,
    full = history.length >= 500;
  function change(h: ClimateBoard[]) {
    onChange(h);
    setChecked(null);
  }
  function edit(f: string, v: string) {
    if (full || b[f] === v) return;
    const h = [...history, { ...b, [f]: v }];
    if (validClimateHistory(mode, record, h)) change(h);
  }
  return (
    <section
      className="climate-workbench"
      data-record={record}
      aria-label="Task model"
    >
      <h3 className="climate-model-title">{r.title}</h3>
      <div className="climate-fields">
        {climateFields[mode].map((f) => (
          <label key={f} htmlFor={uid + f}>
            {climateLabels[f]}
            {climateNumeric.includes(f) ? (
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
                {climateChoices[f].map((v) => (
                  <option key={v} value={v}>
                    {climateLabels[v]}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>
      <div className="climate-original">
        <p>{r.note}</p>
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
      {r.graph && <ClimateTrend data={r.graph} values={b} />}{" "}
      {r.range && <Range data={r.range} values={b} />}{" "}
      {r.stages && <Inventory data={r.stages} omitted={b.omitted} />}{" "}
      {r.gases && (
        <>
          <GasInventory data={r.gases} />
          <Proposal fields={climateFields[mode]} board={b} />
        </>
      )}{" "}
      {r.comparison && (
        <>
          <ServiceInventory data={r.comparison} />
          <Proposal fields={climateFields[mode]} board={b} />
        </>
      )}
      {mode === "report" && (
        <Proposal fields={climateFields.report} board={b} />
      )}{" "}
      {mode === "boundary" && (
        <Proposal fields={climateFields.boundary} board={b} />
      )}{" "}
      {mode === "reduction" && (
        <ol
          className="climate-chain"
          aria-label="Your action to emissions and limitation route"
        >
          {climateFields.reduction.map((f) => (
            <li key={f}>
              <strong>{climateLabels[f]}:</strong>{" "}
              {b[f] ? climateLabels[b[f]] : "Not chosen"}
            </li>
          ))}
        </ol>
      )}
      <div className="climate-actions">
        <button
          type="button"
          className="button"
          onClick={() => setChecked(checkClimate(mode, b))}
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
          onClick={() => change([initialClimate(mode, record)])}
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
