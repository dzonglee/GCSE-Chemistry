"use client";
import { useId, useState, useRef, useEffect } from "react";
import { readNumber } from "@/lib/marking";
import {
  atmosphereGraphs,
  atmosphereNumber,
  atmosphereFields,
  atmosphereChoices,
  atmosphereLabels,
  atmosphereNumeric,
  atmosphereRecord,
  initialAtmosphere,
  validAtmosphereHistory,
  checkAtmosphere,
  type AtmosphereGiven,
  type AtmosphereMode,
  type AtmosphereBoard,
} from "@/lib/early-atmosphere";
export function AtmosphereGraph({
  record,
  age = "",
}: {
  record: string;
  age?: string;
}) {
  const pan = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const graph = atmosphereGraphs[record],
      n = atmosphereNumber(age),
      el = pan.current;
    if (
      !graph ||
      n === null ||
      n < 0 ||
      n > graph.ages[0] ||
      !el ||
      el.scrollWidth <= el.clientWidth
    )
      return;
    const markerX = 65 + ((graph.ages[0] - n) / graph.ages[0]) * 480;
    el.scrollTo({
      left: Math.max(0, markerX - el.clientWidth / 2),
      behavior: "auto",
    });
  }, [record, age]);
  const g = atmosphereGraphs[record];
  if (!g) return null;
  const max = g.ages[0],
    x = (v: number) => 65 + ((max - v) / max) * 480,
    y = (v: number) => 300 - v * 2.5,
    marker = atmosphereNumber(age),
    inside = marker !== null && marker >= 0 && marker <= max;
  return (
    <figure className="atmosphere-graph">
      <p className="atmosphere-axis">Gas in atmosphere / %</p>
      <div
        className="atmosphere-pan"
        tabIndex={0}
        role="region"
        ref={pan}
        aria-label="Atmospheric time graph; scroll horizontally on small screens"
      >
        <svg
          viewBox="0 0 590 350"
          role="img"
          aria-label={
            g.name +
            ": nitrogen dashed, oxygen solid, carbon dioxide dotted; original reconstructed teaching data"
          }
        >
          {[0, 20, 40, 60, 80, 100].map((v) => (
            <g key={v}>
              <line x1="65" x2="545" y1={y(v)} y2={y(v)} stroke="#dbe2ed" />
              <text x="53" y={y(v) + 5} textAnchor="end">
                {v}
              </text>
            </g>
          ))}
          {g.ages.map((v) => (
            <g key={v}>
              <line x1={x(v)} x2={x(v)} y1="50" y2="300" stroke="#e5e9f0" />
              <text x={x(v)} y="327" textAnchor="middle">
                {v}
              </text>
            </g>
          ))}
          <path
            d="M 65 50 V 300 H 545"
            fill="none"
            stroke="#35415b"
            strokeWidth="2"
          />
          {[
            { values: g.nitrogen, color: "#5862ba", dash: "10 5" },
            { values: g.oxygen, color: "#168577", dash: undefined },
            { values: g.dioxide, color: "#b15c18", dash: "2 5" },
          ].map((a, i) => (
            <polyline
              key={i}
              points={a.values
                .map((v, j) => `${x(g.ages[j])},${y(v)}`)
                .join(" ")}
              fill="none"
              stroke={a.color}
              strokeWidth="3"
              strokeDasharray={a.dash}
            />
          ))}
          {inside && (
            <g data-age-marker={age}>
              <line
                x1={x(marker!)}
                x2={x(marker!)}
                y1="40"
                y2="300"
                stroke="#bd2541"
                strokeWidth="2"
              />
              <path d={`M${x(marker!) - 6} 32l6 8 6-8Z`} fill="#bd2541" />
            </g>
          )}
        </svg>
      </div>
      <p className="atmosphere-axis">Millions of years ago → today</p>
      <p className="atmosphere-scroll-note">
        On a narrow screen, scroll the graph sideways or open its data table.
      </p>
      <ul className="atmosphere-key">
        <li>Nitrogen: purple dashed</li>
        <li>Oxygen: green solid</li>
        <li>Carbon dioxide: brown dotted</li>
      </ul>
      {age && (
        <p className="atmosphere-marker-note">
          Your marker: {age} million years ago
          {!inside
            ? " — outside this axis or not a readable number; entry retained."
            : "."}
        </p>
      )}
      <figcaption>
        Original teaching reconstruction; percentages and timing are
        illustrative, not direct ancient measurements. Lines join supplied
        points. Other gases are included in the table but are not drawn as a
        separate curve. The present endpoint uses 78% N₂, 21% O₂, 0.04% CO₂ and
        0.96% other gases.
      </figcaption>
      <details>
        <summary>Read the original graph as a table</summary>
        <div className="atmosphere-pan">
          <table>
            <thead>
              <tr>
                <th>Million years ago</th>
                <th>Nitrogen / %</th>
                <th>Oxygen / %</th>
                <th>CO₂ / %</th>
                <th>Other / %</th>
              </tr>
            </thead>
            <tbody>
              {g.ages.map((a, i) => (
                <tr key={a}>
                  <th scope="row">{a}</th>
                  <td>{g.nitrogen[i]}</td>
                  <td>{g.oxygen[i]}</td>
                  <td>{g.dioxide[i]}</td>
                  <td>{g.other[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
export function AtmosphereBar({
  data,
  values = {},
}: {
  data: NonNullable<AtmosphereGiven["bar"]>;
  values?: Record<string, string>;
}) {
  const height = readNumber(values.height ?? ""),
    inside = height !== null && height >= 0 && height <= data.max,
    y = (n: number) => 270 - (n / data.max) * 220;
  return (
    <figure className="atmosphere-bar">
      <p className="atmosphere-axis">Gas in atmosphere / %</p>
      <p className="atmosphere-scroll-note">
        Scroll sideways on a narrow screen to compare both gas bars.
      </p>
      <div
        className="atmosphere-pan"
        tabIndex={0}
        role="region"
        aria-label="Percentage bar chart; scroll horizontally on small screens"
      >
        <svg
          viewBox="0 0 400 325"
          role="img"
          aria-label="Your proposed scale labels and oxygen bar; supplied carbon dioxide bar remains unchanged"
        >
          {Array.from({ length: 21 }, (_, i) => (
            <line
              key={i}
              x1="65"
              x2="365"
              y1={270 - i * 11}
              y2={270 - i * 11}
              stroke={i % 5 === 0 ? "#c6cddd" : "#e7ebf2"}
            />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <text x="52" y={270 - i * 55 + 5} textAnchor="end">
                {i === 0
                  ? "0"
                  : i === 4
                    ? data.max
                    : values["scale" + i] || "?"}
              </text>
            </g>
          ))}
          <path
            d="M 65 50 V 270 H 365"
            fill="none"
            stroke="#35415b"
            strokeWidth="2"
          />
          <rect
            x="255"
            y={y(data.dioxide)}
            width="65"
            height={270 - y(data.dioxide)}
            fill="#bac1d2"
            data-supplied-bar="dioxide"
          />
          {inside && (
            <rect
              x="105"
              y={y(height!)}
              width="65"
              height={270 - y(height!)}
              fill="#414dc4"
              data-oxygen-height={values.height}
            />
          )}
          <text x="137" y="299" textAnchor="middle">
            Oxygen
          </text>
          <text x="287" y="299" textAnchor="middle">
            CO₂
          </text>
        </svg>
      </div>
      <figcaption>
        Oxygen: {values.height || "not plotted"}%
        {values.height && !inside
          ? " — outside the supplied axis or unreadable; retained without snapping."
          : "."}{" "}
        Your scale labels:{" "}
        {[1, 2, 3].map((i) => values["scale" + i] || "?").join(", ")}. Supplied
        CO₂: {data.dioxide}%. Four equal major intervals, five minor
        subdivisions per interval.
      </figcaption>
    </figure>
  );
}
export function AtmosphereEvidence({ data }: { data: AtmosphereGiven }) {
  return (
    <section
      className="atmosphere-evidence"
      aria-label="Supplied atmosphere evidence"
    >
      <h3>{data.title}</h3>
      <p>{data.note}</p>
      {data.rows && (
        <dl>
          {data.rows.map((r, i) => (
            <div key={i}>
              <dt>{r.label}</dt>
              <dd>{r.text}</dd>
            </div>
          ))}
        </dl>
      )}
      {data.graph && <AtmosphereGraph record={data.graph} />}
    </section>
  );
}
export function AtmosphereWorkbench({
  mode,
  record,
  history: retained,
  onChange,
}: {
  mode: AtmosphereMode;
  record: string;
  history?: AtmosphereBoard[];
  onChange?: (h: AtmosphereBoard[]) => void;
}) {
  const uid = useId(),
    [local, setLocal] = useState(() => [initialAtmosphere(mode, record)]),
    [checked, setChecked] = useState<ReturnType<typeof checkAtmosphere> | null>(
      null,
    ),
    history = retained ?? local;
  function change(h: AtmosphereBoard[]) {
    if (onChange) onChange(h);
    else setLocal(h);
    setChecked(null);
  }
  if (!validAtmosphereHistory(mode, record, history))
    return (
      <section className="atmosphere-workbench" aria-label="Task model">
        <p role="alert">
          The retained proposal cannot be read. Its entries are preserved.
        </p>
        <button onClick={() => change([initialAtmosphere(mode, record)])}>
          Start a new proposal for this task
        </button>
      </section>
    );
  const b = history.at(-1)!,
    r = atmosphereRecord(mode, record)!,
    full = history.length >= 500;
  function field(f: string, v: string) {
    if (!full && b[f] !== v) change([...history, { ...b, [f]: v }]);
  }
  const amounts = [b.nitrogen, b.oxygen, b.other].map(atmosphereNumber),
    valid = amounts.every((n) => n !== null && n >= 0 && n <= 100),
    total = valid ? amounts.reduce<number>((a, n) => a + n!, 0) : null;
  return (
    <section
      className="atmosphere-workbench"
      aria-label="Task model"
      data-atmosphere-mode={mode}
      data-atmosphere-record={record}
    >
      <div className="atmosphere-original">
        <AtmosphereEvidence data={{ ...r, graph: undefined }} />
      </div>
      <fieldset className="atmosphere-fields">
        <legend>Your proposal</legend>
        {atmosphereFields[mode].map((f) => (
          <div key={f}>
            <label htmlFor={uid + f}>{atmosphereLabels[f]}</label>
            {atmosphereNumeric.includes(f) ? (
              <input
                id={uid + f}
                data-field={f}
                type="text"
                inputMode="decimal"
                value={b[f]}
                maxLength={16}
                disabled={full}
                onChange={(e) => field(f, e.target.value)}
              />
            ) : (
              <>
                <select
                  id={uid + f}
                  data-field={f}
                  value={b[f]}
                  disabled={full}
                  onChange={(e) => field(f, e.target.value)}
                >
                  <option value="">Choose…</option>
                  {atmosphereChoices[f].map((v) => (
                    <option key={v} value={v}>
                      {atmosphereLabels[v]}
                    </option>
                  ))}
                </select>
                {b[f] && atmosphereLabels[b[f]].length > 24 && (
                  <p className="atmosphere-selected">
                    {atmosphereLabels[b[f]]}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </fieldset>
      {mode === "composition" && (
        <div className="atmosphere-composition">
          <p>
            Your total:{" "}
            {total === null
              ? "not yet a readable set of percentages"
              : total.toFixed(2).replace(/\.00$/, "") + "%"}
            . The whole is 100%.
          </p>
          <div
            className="atmosphere-proportions"
            role="img"
            aria-label={
              total === null
                ? "Percentages not plotted"
                : `Your gas percentages: nitrogen ${b.nitrogen}, oxygen ${b.oxygen}, other ${b.other}; each uses the same 100% whole`
            }
          >
            {total !== null &&
              amounts.map((n, i) => (
                <div key={i} className={"atmosphere-gas gas" + i}>
                  <span style={{ width: n! + "%" }} />
                  <strong>
                    {["N₂", "O₂", "Other"][i]} {n}%
                  </strong>
                </div>
              ))}
          </div>
          <p>
            The bars use a fixed 100% whole; they do not renormalise a wrong
            total.
          </p>
        </div>
      )}
      {mode === "sequence" && (
        <ol
          className="atmosphere-flow"
          aria-label="Your proposed physical sequence"
        >
          {["first", "second", "third"].map((f, i) => (
            <li key={f}>
              <strong>{i + 1}</strong>
              <span>{b[f] ? atmosphereLabels[b[f]] : "Stage not chosen"}</span>
            </li>
          ))}
        </ol>
      )}
      {mode === "photosynthesis" && (
        <div
          className="atmosphere-equation"
          aria-label="Your proposed photosynthesis equation"
        >
          <p>
            {b.inputs ? atmosphereLabels[b.inputs] : "Reactants not chosen"}
          </p>
          <p>
            →{" "}
            <small>
              {b.energy ? atmosphereLabels[b.energy] : "Energy not chosen"}
            </small>
          </p>
          <p>
            {b.outputs ? atmosphereLabels[b.outputs] : "Products not chosen"}
          </p>
        </div>
      )}
      {mode === "stores" && (
        <ol className="atmosphere-flow" aria-label="Your proposed carbon route">
          {["origin", "process", "store"].map((f, i) => (
            <li key={f}>
              <strong>{i + 1}</strong>
              <span>{b[f] ? atmosphereLabels[b[f]] : "Not assigned"}</span>
            </li>
          ))}
        </ol>
      )}
      {r.graph && <AtmosphereGraph record={r.graph} age={b.age} />}
      {r.bar && <AtmosphereBar data={r.bar} values={b} />}
      <div className="atmosphere-actions">
        <button
          type="button"
          className="button"
          onClick={() => setChecked(checkAtmosphere(mode, b))}
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
          onClick={() => change([initialAtmosphere(mode, record)])}
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
