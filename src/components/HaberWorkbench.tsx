"use client";
import { useId, useState } from "react";
import { readNumber } from "@/lib/marking";
import {
  haberFields,
  haberLabels,
  haberNumeric,
  haberChoices,
  haberRecord,
  haberNumber,
  initialHaber,
  validHaberHistory,
  checkHaber,
  type HaberMode,
  type HaberBoard,
  type HaberGiven,
} from "@/lib/haber";
export function HaberFlow() {
  return (
    <figure
      className="haber-flow"
      aria-label="Haber production and recycle flow"
    >
      <div className="haber-flow-feed">
        Purified N₂ + H₂ feed<span>↓</span>
      </div>
      <div className="haber-flow-reactor">
        <strong>Reactor</strong>
        <span>Iron · about 450 °C · about 200 atm</span>
      </div>
      <div className="haber-flow-outlet">↓ N₂, H₂ and NH₃</div>
      <div className="haber-flow-cool">
        <strong>Separator</strong>
        <span>Cool the outlet mixture</span>
      </div>
      <div className="haber-flow-return">
        ↶ Unreacted N₂ + H₂ return to reactor
      </div>
      <div className="haber-flow-product">↓ Liquid NH₃ removed</div>
      <figcaption>
        Schematic flow, not to scale. Cooling changes ammonia’s state; it does
        not destroy nitrogen or hydrogen atoms. Reactor gases react only partly
        per pass.
      </figcaption>
    </figure>
  );
}
export function HaberFeedDiagram({
  nitrogen,
  board,
}: {
  nitrogen: number;
  board: HaberBoard;
}) {
  const max = nitrogen * 6;
  const amounts = [
    { name: "N₂ supplied", raw: String(nitrogen), colour: "#3f4fd0" },
    { name: "H₂: your feed", raw: board.hydrogenAmount, colour: "#0f7a73" },
    { name: "NH₃: your maximum", raw: board.ammoniaAmount, colour: "#a7760c" },
  ];
  return (
    <figure className="haber-feed-diagram">
      <p>
        <strong>Your proposed reacting amounts</strong> · common 0–{max} mol
        scale
      </p>
      {amounts.map((a) => {
        const n = haberNumber(a.raw),
          valid = n !== null && n >= 0 && n <= max;
        return (
          <div key={a.name}>
            <strong>
              {a.name}: {a.raw || "Unknown"} mol
            </strong>
            <div
              className="haber-feed-track"
              role="img"
              aria-label={`${a.name}: ${a.raw || "unknown"} mol on a0–${max} mol scale`}
            >
              <span
                style={{
                  width: valid ? (n / max) * 100 + "%" : "0%",
                  background: a.colour,
                }}
              />
            </div>
          </div>
        );
      })}
      <figcaption>
        Each amount uses the same scale. The equation scales 1:3:2 together;
        these are moles, not masses or pictured molecules. Blank, malformed or
        out-of-scale entries stay in their fields and are not drawn. This is a
        theoretical forward-reaction account, not actual per-pass conversion.
      </figcaption>
    </figure>
  );
}
export function HaberGraph({
  graph,
  values = {},
}: {
  graph: NonNullable<HaberGiven["graph"]>;
  values?: Record<string, string>;
}) {
  const uid = useId(),
    w = 420,
    h = 300,
    x = (n: number) => 60 + (340 * n) / graph.xMax,
    y = (n: number) => 245 - (205 * n) / graph.yMax;
  const draft = (graph.draft ?? []).map((p) => ({
    x: p.x,
    field: p.field,
    y: readNumber(values[p.field] ?? ""),
  }));
  const valid = draft.filter(
    (p): p is { x: number; field: string; y: number } =>
      p.y !== null && p.y >= 0 && p.y <= graph.yMax,
  );
  return (
    <figure className="haber-graph">
      <div
        className="haber-graph-scroll"
        tabIndex={0}
        aria-label="Scrollable source graph"
      >
        <svg
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={
            graph.draft
              ? "Your plotted points on labelled axes"
              : "Fixed source graph: " +
                graph.xLabel +
                " against " +
                graph.yLabel
          }
        >
          <defs>
            <clipPath id={uid}>
              <rect x="60" y="40" width="340" height="205" />
            </clipPath>
          </defs>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <line
                x1={60 + 85 * i}
                y1="40"
                x2={60 + 85 * i}
                y2="245"
                stroke="#d5dbe7"
              />
              <line
                x1="60"
                y1={245 - 51.25 * i}
                x2="400"
                y2={245 - 51.25 * i}
                stroke="#d5dbe7"
              />
              <text x={60 + 85 * i} y="268" textAnchor="middle">
                {(graph.xMax * i) / 4}
              </text>
              <text x="48" y={250 - 51.25 * i} textAnchor="end">
                {(graph.yMax * i) / 4}
              </text>
            </g>
          ))}
          <path
            d="M60 40 V245 H400"
            fill="none"
            stroke="#252e46"
            strokeWidth="2"
          />
          <text x="230" y="294" textAnchor="middle">
            {graph.xLabel}
          </text>
          <text x="60" y="21">
            {graph.yLabel}
          </text>
          <g clipPath={`url(#${uid})`}>
            {graph.points.length > 1 && (
              <polyline
                className="haber-source-line"
                points={graph.points
                  .map((p) => `${x(p[0])},${y(p[1])}`)
                  .join(" ")}
                fill="none"
                stroke="#3f4fd0"
                strokeWidth="3"
              />
            )}
            {graph.points.map((p, i) => (
              <circle
                className="haber-source-point"
                key={i}
                cx={x(p[0])}
                cy={y(p[1])}
                r="5"
                fill="#3f4fd0"
              />
            ))}
            {graph.joinDraft && valid.length === draft.length && (
              <polyline
                className="haber-draft-line"
                points={valid.map((p) => `${x(p.x)},${y(p.y)}`).join(" ")}
                fill="none"
                stroke="#a7760c"
                strokeWidth="3"
              />
            )}
            {valid.map((p) => (
              <g
                className="haber-draft-point"
                key={p.field}
                data-field={p.field}
                data-x={p.x}
                data-y={p.y}
              >
                <path
                  d={`M${x(p.x) - 6} ${y(p.y) - 6} l12 12 M${x(p.x) - 6} ${y(p.y) + 6} l12 -12`}
                  stroke="#a7760c"
                  strokeWidth="3"
                />
              </g>
            ))}
          </g>
        </svg>
      </div>
      <figcaption>
        {graph.draft
          ? "Gold crosses show your entries; out-of-range or malformed entries remain in their fields and are not drawn. No correct points are prefilled."
          : "Blue data remain fixed when you change a prediction. Straight segments join the supplied observations."}{" "}
        Axes include units. {graph.xLabel}: 0–{graph.xMax}; {graph.yLabel}: 0–
        {graph.yMax}. Swipe horizontally on small screens.
      </figcaption>
      {graph.draft && (
        <p className="haber-plot-values" aria-live="polite">
          {draft
            .map((p) => `(${p.x}, ${values[p.field] || "unknown"})`)
            .join("; ")}
        </p>
      )}
    </figure>
  );
}
export function HaberGivenFigure({
  data,
  values,
  embedded = false,
}: {
  data: HaberGiven;
  values?: Record<string, string>;
  embedded?: boolean;
}) {
  return (
    <div className="haber-given" aria-label={data.title}>
      {!embedded && <h3>{data.title}</h3>}
      {data.note && <p>{data.note}</p>}
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
      {data.table && (
        <table>
          <caption>{data.table.caption}</caption>
          <thead>
            <tr>
              {data.table.head.map((v) => (
                <th key={v} scope="col">
                  {v}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.table.rows.map((row, i) => (
              <tr key={i}>
                {row.map((v, k) =>
                  k === 0 ? (
                    <th key={k} scope="row">
                      {v}
                    </th>
                  ) : (
                    <td key={k}>{v}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data.bars && (
        <figure className="haber-bars">
          <p>Elemental mass percentage / % · equal scale 0–50</p>
          <div className="haber-bar-plot">
            <div className="haber-bar-axis" aria-hidden="true">
              {[0, 10, 20, 30, 40, 50].map((n) => (
                <span key={n} style={{ bottom: n * 2 + "%" }}>
                  {n}
                </span>
              ))}
            </div>
            {data.bars.map((bar) => {
              const raw = values?.[bar.field] ?? "",
                n = readNumber(raw),
                valid = n !== null && n >= 0 && n <= 50;
              return (
                <div key={bar.field}>
                  <div
                    className="haber-bar-track"
                    role="img"
                    aria-label={`${bar.label}: ${raw || "unknown"} percent on a0–50 percent scale`}
                  >
                    <span
                      data-field={bar.field}
                      data-value={valid ? n : undefined}
                      style={{ height: valid ? (n / 50) * 100 + "%" : "0%" }}
                    />
                  </div>
                  <strong className="haber-bar-label">
                    {(
                      {
                        Nitrogen: "N",
                        Phosphorus: "P",
                        Potassium: "K",
                      } as Record<string, string>
                    )[bar.label] ?? bar.label}
                    <span>{raw || "Unknown"}%</span>
                  </strong>
                </div>
              );
            })}
          </div>
          <figcaption>
            N = nitrogen, P = phosphorus, K = potassium. Your values set the bar
            heights on a common scale. Original source percentages do not
            change. Malformed/out-of-range entries remain in fields and are not
            drawn.
          </figcaption>
        </figure>
      )}
      {data.flow && <HaberFlow />}
      {data.graph && <HaberGraph graph={data.graph} values={values} />}
    </div>
  );
}
export function HaberWorkbench({
  mode,
  record,
  history,
  onChange,
}: {
  mode: HaberMode;
  record: string;
  history: HaberBoard[];
  onChange: (h: HaberBoard[]) => void;
}) {
  const uid = useId(),
    [checked, setChecked] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    r = haberRecord(mode, record);
  if (!r || !validHaberHistory(mode, record, history))
    return (
      <p role="status">
        Saved Haber proposal is unreadable; raw entries retained.
      </p>
    );
  const b = history.at(-1)!,
    full = history.length >= 500;
  function change(h: HaberBoard[]) {
    onChange(h);
    setChecked(null);
  }
  function edit(f: string, v: string) {
    if (full || v === b[f]) return;
    const h = [...history, { ...b, [f]: v }];
    if (validHaberHistory(mode, record, h)) change(h);
  }
  return (
    <section className="haber-workbench" aria-label="Task model">
      <h3>{r.title}</h3>
      {mode !== "feed" && <HaberGivenFigure data={r} embedded />}
      {mode === "feed" && (
        <p className="haber-feed-brief">
          Purified feed: {r.feedNitrogen} mol N₂.
        </p>
      )}
      <div className="haber-fields">
        {haberFields[mode].map((f) => (
          <label key={f} htmlFor={uid + f}>
            {haberLabels[f]}
            {haberNumeric.includes(f) ? (
              <input
                id={uid + f}
                data-field={f}
                value={b[f]}
                inputMode="decimal"
                autoComplete="off"
                maxLength={16}
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
                {haberChoices[f].map((v) => (
                  <option key={v} value={v}>
                    {haberLabels[v]}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>
      {mode === "feed" && (
        <>
          <HaberGivenFigure data={{ ...r, note: "" }} embedded />
          <HaberFeedDiagram nitrogen={r.feedNitrogen!} board={b} />
        </>
      )}
      {haberFields[mode].some((f) => haberNumeric.includes(f)) && (
        <p className="haber-input-note">
          Model fields use decimal numbers. Your entries stay as typed.
        </p>
      )}
      <div className="haber-proposal" aria-label="Your Haber proposal">
        <strong>Your proposal</strong>
        <dl>
          {haberFields[mode].map((f) => (
            <div key={f}>
              <dt>{haberLabels[f]}</dt>
              <dd>
                {b[f]
                  ? haberNumeric.includes(f)
                    ? b[f]
                    : haberLabels[b[f]]
                  : "Unknown"}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="haber-actions">
        <button
          type="button"
          className="button primary"
          onClick={() => setChecked(checkHaber(mode, b))}
        >
          Check proposal
        </button>
        <button
          type="button"
          className="button"
          disabled={history.length < 2}
          onClick={() => change(history.slice(0, -1))}
        >
          Undo
        </button>
        <button
          type="button"
          className="button"
          onClick={() => change([initialHaber(mode, record)])}
        >
          Clear proposal
        </button>
      </div>
      {full && (
        <p role="status">
          History is full. Undo or clear this proposal to continue.
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
    </section>
  );
}
