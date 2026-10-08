"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  gasChoices,
  gasRecords,
  initialGasBoard,
  gasPrediction,
  type GasMode,
} from "@/lib/gas-volumes";
import type { DryGasRecord } from "@/lib/gas-inventory-asset";
import { GasInventory3D } from "./GasInventory3D";
const names: Record<string, string> = {
  dm3: "dm³",
  cm3: "cm³",
  "moles-times24-convert": "Moles × 24, then convert volume units",
  divide24: "Divide moles by 24",
  "24cm3": "One mole is 24cm³",
  "all-conditions": "Use 24 at every temperature/pressure",
  "grams-divide-M-times24": "Grams ÷ molecular molar mass, then × 24",
  "grams-times24": "Multiply grams directly by 24",
  "use-atomic-O": "Use 16 g/mol for oxygen gas",
  "matching-gas-coefficients": "Use gas coefficients at matching T/P",
  "all-equal": "All gas volumes are equal",
  "mass-ratio": "Use molecular mass ratios",
  "regardless-conditions": "Coefficients apply even at different T/P",
  "dry-products-plus-unused": "Add gas products and unused gases",
  "product-only": "Count only newly formed CO2",
  "all-supplied-oxygen": "Keep all oxygen supplied as unused",
  "include-liquid-water": "Include collected liquid-water volume",
  "steam-and-unused-gases": "Count steam and unused gases; exclude solid",
  "solid-is-gas": "Count the solid product as a gas",
  "exclude-steam": "Exclude water even when it is (g)",
  "products-only": "Count only gases newly produced",
  CH4: "Methane",
  O2: "Oxygen",
  none: "No unused gas",
};
const headings: Record<GasMode, string> = {
  molar: "Moles to gas volume",
  mass: "Mass, then amount",
  ratio: "Scale gas coefficients",
  remaining: "Find every dry gas",
  phases: "Use the state symbols",
};
const rules: Record<GasMode, string> = {
  molar: "At stated RTP: V = n × 24 dm³/mol. 1 dm³ = 1000 cm³.",
  mass: "Convert mass to grams. n = m ÷ molecular M; then V = n × 24 at RTP.",
  ratio:
    "N₂(g) + 3H₂(g) → 2NH₃(g). Volume ratio 1:3:2 requires matching gas T and P.",
  remaining:
    "CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l). At matching initial/final gas RTP, count CO₂ and unused CH₄/O₂. Collected liquid water is excluded.",
  phases:
    "2Si₂H₆(g) + 7O₂(g) → 4SiO₂(s) + 6H₂O(g). Count steam and unused gases, not solid SiO₂. Supplied gas T/P match; 24 is not assumed.",
};
const fields: Record<GasMode, readonly [string, string, string][]> = {
  molar: [
    ["answer", "Your gas volume", ""],
    ["unit", "Volume unit", ""],
  ],
  mass: [
    ["grams", "Your gas mass", "g"],
    ["moles", "Your gas amount", "mol"],
    ["answer", "Your gas volume", "dm³"],
  ],
  ratio: [
    ["nitrogen", "Your N2 volume", "cm³"],
    ["hydrogen", "Your H2 volume", "cm³"],
    ["ammonia", "Your NH3 volume", "cm³"],
  ],
  remaining: [
    ["carbonDioxide", "Your CO2 volume", "cm³"],
    ["leftover", "Your unused gas volume", "cm³"],
    ["identity", "Unused gas identity", ""],
    ["total", "Your total dry gas", "cm³"],
  ],
  phases: [
    ["steam", "Your steam volume", "cm³"],
    ["leftover", "Your unused gas volume", "cm³"],
    ["total", "Your total gas volume", "cm³"],
  ],
};
export function GasWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: GasMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialGasBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    records = gasRecords[mode] as Record<string, { label: string }>;
  const change = (key: string, value: string) => {
    if (b[key] === value) return;
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    setFeedback("");
    onChange([...history, { ...b, [key]: value }]);
  };
  const select = (key: string, label: string, unit: string) => (
    <label key={key} className={key === "reason" ? "gas-wide" : undefined}>
      {label}
      <select
        aria-label={label}
        value={b[key]}
        onChange={(e) => change(key, e.target.value)}
      >
        {gasChoices[mode][key].map((v) => (
          <option key={v} value={v}>
            {v === "unset"
              ? "Predict"
              : key === "record"
                ? records[v].label
                : (names[v] ?? `${v} ${unit}`)}
          </option>
        ))}
      </select>
    </label>
  );
  const value = (key: string) => (b[key] === "unset" ? null : Number(b[key]));
  const rows: () => {
    label: string;
    value: number | null;
    student: boolean;
  }[] = () => {
    if (mode === "molar" || mode === "mass")
      return [
        {
          label: "1 mol reference",
          value: mode === "molar" && b.unit === "cm3" ? 24000 : 24,
          student: false,
        },
        { label: "Your selected gas", value: value("answer"), student: true },
      ];
    if (mode === "ratio") {
      const r = gasRecords.ratio[b.record as keyof typeof gasRecords.ratio];
      return [
        { label: `Given ${r.known}`, value: r.volume, student: false },
        ...[
          ["N2", "nitrogen"],
          ["H2", "hydrogen"],
          ["NH3", "ammonia"],
        ].map(([label, key]) => ({
          label: `Your ${label}`,
          value: value(key),
          student: true,
        })),
      ];
    }
    if (mode === "remaining") {
      const r = gasRecords.remaining[b.record as DryGasRecord];
      return [
        { label: "Supplied CH4", value: r.methane, student: false },
        { label: "Supplied O2", value: r.oxygen, student: false },
        { label: "Your CO2", value: value("carbonDioxide"), student: true },
        { label: "Your unused gas", value: value("leftover"), student: true },
        { label: "Your dry total", value: value("total"), student: true },
      ];
    }
    const r = gasRecords.phases[b.record as keyof typeof gasRecords.phases];
    return [
      { label: "Supplied Si2H6", value: r.fuel, student: false },
      { label: "Supplied O2", value: r.oxygen, student: false },
      { label: "Your steam", value: value("steam"), student: true },
      { label: "Your unused gas", value: value("leftover"), student: true },
      { label: "Your gas total", value: value("total"), student: true },
    ];
  };
  const bars = rows(),
    maximum = Math.max(1, ...bars.map((r) => r.value ?? 0)),
    unit =
      mode === "molar"
        ? b.unit === "cm3"
          ? "cm³"
          : "dm³"
        : mode === "mass"
          ? "dm³"
          : "cm³";
  return (
    <section
      className="model task-workbench gas-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      <div className="gas-fields">
        {fields[mode]
          .slice(0, 2)
          .map(([key, label, unit]) => select(key, label, unit))}
      </div>
      {select("record", "Explore a gas record", "")}
      <p className="gas-record">{records[String(b.record)].label}.</p>
      <p className="position-caption">
        The answer task uses its stated initial record. Changing this model
        explores another gas calculation.
      </p>
      <div className="gas-fields">
        {fields[mode]
          .slice(2)
          .map(([key, label, unit]) => select(key, label, unit))}
        {select("reason", "Your relationship", "")}
      </div>
      {b.reason !== "unset" && (
        <p>Your selected relationship: {names[String(b.reason)]}.</p>
      )}
      <figure className="gas-chart">
        <figcaption>Gas volumes on one scale / {unit}</figcaption>
        <svg
          viewBox={`0 0 420 ${bars.length * 66 + 66}`}
          role="img"
          aria-label={bars
            .map(
              (r) =>
                `${r.label}: ${r.value === null ? "not entered" : r.value} ${unit}`,
            )
            .join("; ")}
        >
          {bars.map((r, i) => (
            <g key={r.label}>
              <text x="8" y={i * 66 + 22} fontSize="20">
                {r.label}:{" "}
                {r.value === null ? "not entered" : `${r.value} ${unit}`}
              </text>
              {r.value !== null && (
                <rect
                  x="35"
                  y={i * 66 + 32}
                  height="17"
                  width={(r.value / maximum) * 330}
                  fill={r.student ? "#c7972a" : "#4056ce"}
                />
              )}
            </g>
          ))}
          <path d={`M35 ${bars.length * 66 + 2}H365`} stroke="#748096" />
          <text x="30" y={bars.length * 66 + 27} fontSize="20">
            0
          </text>
          <text x="315" y={bars.length * 66 + 27} fontSize="20">
            {maximum}
          </text>
        </svg>
        <p className="position-caption">
          Blue: supplied gas quantity or labelled 1 mol reference. Gold: your
          predictions, retained when wrong. All bars use the displayed
          gas-volume unit; the final total is not another component to add.
        </p>
      </figure>
      <p>{rules[mode]}</p>
      {mode === "remaining" && (
        <GasInventory3D
          key={String(b.record)}
          record={b.record as DryGasRecord}
        />
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = gasPrediction(mode, b);
            setCorrect(r.correct);
            setFeedback(
              !r.complete
                ? "Complete each prediction and choose a relationship before checking."
                : r.correct
                  ? `That's right. ${rules[mode]}`
                  : `Not yet. ${rules[mode]} Check units, gas coefficients and any unused reactant.`,
            );
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length < 2}
          onClick={() => {
            onChange(history.slice(0, -1));
            setFeedback("");
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            onChange([]);
            setFeedback("");
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          className={`feedback ${correct ? "correct" : "retry"}`}
          role="status"
        >
          {feedback}
        </p>
      )}
      <details>
        <summary>About this model</summary>
        <p>
          {instruction} The 24 dm³/mol reference applies only at the specified
          RTP. Direct gas coefficient ratios require matching T/P; phase records
          do not assume RTP. Ideal complete conversion is specified. Liquids and
          solids are excluded from gas totals, not from total atom/mass
          conservation. The 3D collected-water tray is schematic and not on a
          liquid-volume scale.
        </p>
      </details>
    </section>
  );
}
