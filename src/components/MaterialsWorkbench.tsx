"use client";
import { useId, useState, useSyncExternalStore } from "react";
import {
  materialsRecord,
  materialsFields,
  materialsLabels,
  materialsChoices,
  materialsNumeric,
  initialMaterials,
  validMaterialsHistory,
  checkMaterials,
  type MaterialsMode,
  type MaterialsBoard,
  type MaterialsGiven,
} from "@/lib/materials";
const subscribeSmallScreen = (update: () => void) => {
  const media = matchMedia("(max-width: 600px)");
  media.addEventListener("change", update);
  return () => media.removeEventListener("change", update);
};
const isSmallScreen = () => matchMedia("(max-width: 600px)").matches;
export function MaterialsSource({
  data,
  embedded = false,
}: {
  data: MaterialsGiven;
  embedded?: boolean;
}) {
  const compact = useSyncExternalStore(
    subscribeSmallScreen,
    isSmallScreen,
    () => false,
  );
  return compact ? (
    <details className="materials-source">
      <summary>View case and model</summary>
      <MaterialsGivenFigure data={data} embedded={embedded} />
    </details>
  ) : (
    <MaterialsGivenFigure data={data} embedded={embedded} />
  );
}
export function MaterialsDiagram({
  kind,
}: {
  kind: NonNullable<MaterialsGiven["diagram"]>;
}) {
  const description = {
    pure: "Equal-sized atoms form regular layers in a pure metal.",
    alloy: "Different-sized atoms distort the regular layers in an alloy.",
    soft: "Separate polymer chains with no covalent crosslinks between chains.",
    set: "Polymer chains joined by covalent crosslinks.",
    branched:
      "Branched polymer chains cannot pack as closely as straight chains.",
    linear: "More-linear polymer chains pack closely.",
    concrete: "Steel reinforcement embedded in a cement-based concrete matrix.",
    fibre: "Glass-fibre reinforcement embedded in a polymer-resin matrix.",
  }[kind];
  const metal = kind === "pure" || kind === "alloy",
    composite = kind === "concrete" || kind === "fibre";
  return (
    <figure className="materials-structure">
      <svg viewBox="0 0 300 170" role="img" aria-label={description}>
        {metal ? (
          Array.from({ length: 18 }, (_, i) => {
            const mixed = kind === "alloy" && [2, 7, 14].includes(i);
            return (
              <circle
                key={i}
                cx={28 + (i % 6) * 48 + (mixed ? 3 : 0)}
                cy={35 + Math.floor(i / 6) * 50}
                r={mixed ? 23 : 16}
                fill={mixed ? "#b58114" : "#3f4fd0"}
                stroke="#fff"
                strokeWidth="2"
              />
            );
          })
        ) : composite ? (
          <>
            <rect
              x="12"
              y="12"
              width="276"
              height="145"
              rx="10"
              fill={kind === "concrete" ? "#dce1e8" : "#e4ddf7"}
            />
            {[40, 80, 120].map((y) => (
              <line
                key={y}
                x1="28"
                x2="272"
                y1={y}
                y2={y + (kind === "fibre" ? 12 : 0)}
                stroke={kind === "concrete" ? "#35466a" : "#0f7a73"}
                strokeWidth={kind === "concrete" ? 12 : 6}
              />
            ))}
          </>
        ) : (
          <>
            {(kind === "linear" ? [55, 80, 105] : [35, 80, 125]).map((y, i) => (
              <g key={y}>
                <path
                  d={`M 15 ${y} L 45 ${y - 7} L 75 ${y + 7} L 105 ${y - 7} L 135 ${y + 7} L 165 ${y - 7} L 195 ${y + 7} L 225 ${y - 7} L 255 ${y + 7} L 285 ${y}`}
                  fill="none"
                  stroke={i === 1 ? "#0f7a73" : "#3f4fd0"}
                  strokeWidth="5"
                />
                {kind === "branched" &&
                  [75, 165, 255].map((x) => (
                    <path
                      key={x}
                      d={`M ${x} ${y + (x === 165 ? -7 : 7)} l 12 ${x === 165 ? -19 : 19} l 18 ${x === 165 ? 4 : -4}`}
                      fill="none"
                      stroke={i === 1 ? "#0f7a73" : "#3f4fd0"}
                      strokeWidth="4"
                    />
                  ))}
              </g>
            ))}
            {kind === "set" &&
              [75, 165, 255].flatMap((x) =>
                [35, 80].map((y) => (
                  <line
                    key={x + "-" + y}
                    x1={x}
                    x2={x}
                    y1={y + (x === 165 ? -7 : 7)}
                    y2={y + 45 + (x === 165 ? -7 : 7)}
                    stroke="#b58114"
                    strokeWidth="5"
                  />
                )),
              )}
          </>
        )}
      </svg>
      <figcaption>
        {description}{" "}
        {metal
          ? "Circles represent atoms; electrons are omitted."
          : composite
            ? "Background is the matrix; lines are reinforcement."
            : "Lines represent chains, not individual bonds; gold joining lines are covalent crosslinks."}{" "}
        Qualitative section, not to scale.
      </figcaption>
    </figure>
  );
}
export function MaterialsGivenFigure({
  data,
  embedded = false,
}: {
  data: MaterialsGiven;
  embedded?: boolean;
}) {
  return (
    <div className="materials-given" aria-label={data.title}>
      {!embedded && <h3>{data.title}</h3>}
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
      {data.carats !== undefined && (
        <figure className="materials-carats">
          <div
            className="materials-purity"
            role="img"
            aria-label={`${data.carats} of 24 equal purity parts are gold`}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} data-gold={i < data.carats!} />
            ))}
          </div>
          <figcaption>
            {data.carats} gold parts out of 24 equal purity parts. This is
            composition by mass, not atom counts or the item mass.
          </figcaption>
        </figure>
      )}
      {data.table && (
        <table>
          <caption>{data.table.caption}</caption>
          <thead>
            <tr>
              {data.table.head.map((h) => (
                <th key={h}>{h}</th>
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
      {data.diagram && <MaterialsDiagram kind={data.diagram} />}
    </div>
  );
}
export function MaterialsWorkbench({
  mode,
  record,
  history,
  onChange,
}: {
  mode: MaterialsMode;
  record: string;
  history: MaterialsBoard[];
  onChange: (h: MaterialsBoard[]) => void;
}) {
  const uid = useId(),
    [checked, setChecked] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    r = materialsRecord(mode, record);
  if (!r || !validMaterialsHistory(mode, record, history))
    return (
      <p role="status">
        Saved materials proposal is unreadable; raw entries retained.
      </p>
    );
  const b = history.at(-1)!,
    full = history.length >= 500;
  function change(h: MaterialsBoard[]) {
    onChange(h);
    setChecked(null);
  }
  function edit(f: string, v: string) {
    if (full || b[f] === v) return;
    const h = [...history, { ...b, [f]: v }];
    if (validMaterialsHistory(mode, record, h)) change(h);
  }
  return (
    <section
      className="materials-workbench"
      data-record={record}
      aria-label="Task model"
    >
      <h3>{r.title}</h3>
      <div className="materials-context">
        <MaterialsSource data={r} embedded />
      </div>
      <div className="materials-fields">
        {materialsFields[mode].map((f) => (
          <label key={f} htmlFor={uid + f}>
            {materialsLabels[f]}
            {materialsNumeric.includes(f) ? (
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
                {materialsChoices[f].map((v) => (
                  <option key={v} value={v}>
                    {materialsLabels[v]}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>
      {mode === "composition" && (
        <p className="materials-input-note">
          Use decimal numbers in these model fields. Entries are kept as typed.
        </p>
      )}
      <div className="materials-proposal" aria-label="Your materials proposal">
        <strong>Your proposal</strong>
        <dl>
          {materialsFields[mode].map((f) => (
            <div key={f}>
              <dt>{materialsLabels[f]}</dt>
              <dd>
                {b[f]
                  ? materialsNumeric.includes(f)
                    ? b[f]
                    : materialsLabels[b[f]]
                  : "Unknown"}
              </dd>
            </div>
          ))}
        </dl>
        {mode === "composition" && (
          <p>
            Base metal + other components:{" "}
            {b.baseMass && b.otherMass
              ? `${b.baseMass} + ${b.otherMass} g (your entries)`
              : "Unknown until both masses are entered"}
            . The original alloy mass remains fixed.
          </p>
        )}
      </div>
      <div className="materials-actions">
        <button
          type="button"
          className="button primary"
          onClick={() => setChecked(checkMaterials(mode, b))}
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
          onClick={() => change([initialMaterials(mode, record)])}
        >
          Clear proposal
        </button>
      </div>
      {full && (
        <p role="status">
          History is full. Undo a step or clear this proposal to continue.
        </p>
      )}
      {checked && (
        <div
          className={"feedback " + (checked.correct ? "good" : "bad")}
          role="status"
        >
          <strong>
            {checked.correct
              ? "Proposal matches the given case."
              : "Reconsider your proposal."}
          </strong>
          <p>{checked.message}</p>
        </div>
      )}
    </section>
  );
}
