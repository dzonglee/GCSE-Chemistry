"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialTheoryBoard,
  theoryChoices,
  theoryPrediction,
  maximumSamples,
  productYieldSamples,
  collectedSamples,
  requiredSamples,
  limitedYieldSamples,
  type TheoryMode,
} from "@/lib/theoretical-yield";
import { TheoreticalInventory3D } from "./TheoreticalInventory3D";
const configs = {
  maximum: {
    equation: "N2 + 3H2 → 2NH3",
    masses: "M(N2) = 28; M(H2) = 2; M(NH3) = 17 g/mol.",
    assumption: "Use the limiting nitrogen. Check that hydrogen is sufficient.",
    fields: [
      ["grams", "Your N2 mass in grams", " g"],
      ["reactantAmount", "Your amount of N2", " mol"],
      ["productAmount", "Your amount of NH3", " mol"],
      ["theoretical", "Your theoretical NH3 mass", " g"],
    ],
  },
  percentage: {
    equation: "Fe2O3 + 3CO → 2Fe + 3CO2",
    masses: "M(Fe2O3) = 160; M(Fe) = 56 g/mol.",
    assumption:
      "CO is sufficient. Construct the maximum iron mass before finding yield.",
    fields: [
      ["reactantAmount", "Your amount of Fe2O3", " mol"],
      ["productAmount", "Your amount of Fe", " mol"],
      ["theoretical", "Your theoretical Fe mass", " g"],
      ["percentage", "Your percentage yield", "%"],
    ],
  },
  collected: {
    equation: "CaCO3 → CaO + CO2",
    masses: "M(CaCO3) = 100; M(CaO) = 56 g/mol.",
    assumption:
      "Apply the supplied yield to the theoretical calcium oxide mass.",
    fields: [
      ["reactantAmount", "Your amount of CaCO3", " mol"],
      ["theoretical", "Your theoretical CaO mass", " g"],
      ["factor", "Your yield multiplier", ""],
      ["actual", "Your collected CaO mass", " g"],
    ],
  },
  required: {
    equation: "Mg + 2HCl → MgCl2 + H2",
    masses: "M(Mg) = 24; M(MgCl2) = 95 g/mol.",
    assumption:
      "HCl is sufficient. Assume this supplied yield applies to the proposed batch.",
    fields: [
      ["factor", "Your yield multiplier", ""],
      ["theoretical", "Your theoretical MgCl2 mass", " g"],
      ["productAmount", "Your amount of MgCl2", " mol"],
      ["reactantMass", "Your required starting Mg mass", " g"],
    ],
  },
  limited: {
    equation: "2Al + Fe2O3 → 2Fe + Al2O3",
    masses: "M(Al) = 27; M(Fe2O3) = 160; M(Fe) = 56 g/mol.",
    assumption:
      "Calculate possible iron from each supply. Use the smaller product amount.",
    fields: [
      ["fromAl", "Your possible Fe from Al", " mol"],
      ["fromOxide", "Your possible Fe from oxide", " mol"],
      ["limiting", "Your limiting supply", ""],
      ["theoretical", "Your theoretical Fe mass", " g"],
      ["percentage", "Your percentage yield", "%"],
    ],
  },
} as const;
export function TheoreticalWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: TheoryMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialTheoryBoard(mode);
  const [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [show3D, setShow3D] = useState(false);
  const config = configs[mode],
    result = theoryPrediction(mode, b);
  const samples =
    mode === "maximum"
      ? maximumSamples
      : mode === "percentage"
        ? productYieldSamples
        : mode === "collected"
          ? collectedSamples
          : mode === "required"
            ? requiredSamples
            : limitedYieldSamples;
  const sampleMap = samples as Record<string, { label: string }>;
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
  const select = (key: string, label: string, unit = "") => (
    <label>
      {label}
      <select
        aria-label={label}
        value={b[key]}
        onChange={(e) => change(key, e.target.value)}
      >
        {(theoryChoices[mode] as Record<string, readonly string[]>)[key].map(
          (v) => (
            <option key={v} value={v}>
              {v === "unset"
                ? "Predict"
                : key === "sample"
                  ? sampleMap[v].label
                  : v === "both"
                    ? "Both exactly used"
                    : `${v}${unit}`}
            </option>
          ),
        )}
      </select>
    </label>
  );
  const proposed = (key: string) =>
    b[key] === "unset" ? null : Number(b[key]);
  const rows: { label: string; value: number | null; student: boolean }[] =
    mode === "maximum"
      ? [
          {
            label: "Supplied nitrogen / g",
            value:
              maximumSamples[b.sample as keyof typeof maximumSamples].grams,
            student: false,
          },
          {
            label: "Your maximum ammonia / g",
            value: proposed("theoretical"),
            student: true,
          },
        ]
      : mode === "collected"
        ? [
            {
              label: "Your maximum CaO / g",
              value: proposed("theoretical"),
              student: true,
            },
            {
              label: "Your collected CaO / g",
              value: proposed("actual"),
              student: true,
            },
          ]
        : mode === "required"
          ? [
              {
                label: "Target collected MgCl2 / g",
                value:
                  requiredSamples[b.sample as keyof typeof requiredSamples]
                    .actual,
                student: false,
              },
              {
                label: "Your maximum MgCl2 / g",
                value: proposed("theoretical"),
                student: true,
              },
              {
                label: "Your starting magnesium / g",
                value: proposed("reactantMass"),
                student: true,
              },
            ]
          : [
              {
                label:
                  mode === "percentage" && b.sample === "suspect"
                    ? "Apparent iron sample / g"
                    : "Collected iron / g",
                value:
                  mode === "percentage"
                    ? productYieldSamples[
                        b.sample as keyof typeof productYieldSamples
                      ].actual
                    : limitedYieldSamples[
                        b.sample as keyof typeof limitedYieldSamples
                      ].actual,
                student: false,
              },
              {
                label: "Your maximum iron / g",
                value: proposed("theoretical"),
                student: true,
              },
            ];
  const maximum = Math.max(1, ...rows.map((r) => r.value ?? 0)),
    axisY = rows.length * 52 + 30;
  return (
    <section
      className="model task-workbench theoretical-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">
        <strong>{config.equation}</strong>
      </p>
      <div className="theoretical-fields">
        {select(
          "sample",
          mode === "maximum" ? "Nitrogen record" : "Batch record",
        )}
        {mode === "maximum" &&
          select(config.fields[0][0], config.fields[0][1], config.fields[0][2])}
      </div>
      <p className="theoretical-context">
        <strong>{sampleMap[String(b.sample)].label}.</strong> {config.masses}{" "}
        {config.assumption}
      </p>
      <div className="theoretical-fields">
        {config.fields
          .slice(mode === "maximum" ? 1 : 0)
          .map(([key, label, unit]) => (
            <span key={key}>{select(key, label, unit)}</span>
          ))}
      </div>
      <svg
        className="theoretical-mass-chart"
        viewBox={`0 0 420 ${rows.length * 52 + 79}`}
        role="img"
        aria-label={rows
          .map(
            (r) => `${r.label}: ${r.value === null ? "not entered" : r.value}`,
          )
          .join("; ")}
      >
        {rows.map((r, i) => (
          <g key={r.label}>
            <text x="20" y={26 + i * 52}>
              {r.label}
            </text>
            <text x="400" y={26 + i * 52} textAnchor="end">
              {r.value === null ? "?" : r.value}
            </text>
            <rect
              x="20"
              y={34 + i * 52}
              width="380"
              height="16"
              fill="#e9edf6"
            />
            {r.value !== null && (
              <rect
                x="20"
                y={34 + i * 52}
                width={(r.value / maximum) * 380}
                height="16"
                fill={r.student ? "#c7972a" : "#3345c8"}
              />
            )}
          </g>
        ))}
        <line x1="20" x2="400" y1={axisY} y2={axisY} stroke="currentColor" />
        <text x="20" y={axisY + 18}>
          0
        </text>
        <text x="400" y={axisY + 18} textAnchor="end">
          {maximum}
        </text>
        <text x="210" y={axisY + 36} textAnchor="middle">
          Mass / g
        </text>
      </svg>
      <p className="position-caption">
        Blue: supplied mass. Gold: your predictions, retained when wrong. All
        bars use the same gram scale.{" "}
        {mode === "maximum"
          ? "Nitrogen and ammonia are different substances; consumed hydrogen also contributes to ammonia mass."
          : mode === "required"
            ? "These are different substances and stages; do not add these bars as a final inventory."
            : "Compare actual and theoretical mass of the same product."}
      </p>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            setCorrect(result.correct);
            setFeedback(
              result.correct ? result.feedback : `Not yet. ${result.feedback}`,
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
          role="status"
          className={`feedback ${correct ? "correct" : "retry"}`}
        >
          {feedback}
        </p>
      )}
      <p className="position-caption">
        The answer task uses its stated initial record. Change this model to
        explore other batches.
      </p>
      {mode === "maximum" && (
        <>
          <button
            className="button"
            aria-expanded={show3D}
            onClick={() => setShow3D((v) => !v)}
          >
            {show3D
              ? "Hide excess hydrogen in 3D"
              : "Inspect excess hydrogen in 3D"}
          </button>
          {show3D && <TheoreticalInventory3D />}
        </>
      )}
      <details>
        <summary>About this model</summary>
        <p>
          {instruction} Convert starting mass to moles, use balanced-equation
          coefficients, then convert the requested product amount to mass. A
          theoretical maximum assumes the stated active amounts and complete
          limiting-reactant conversion. Collection losses, incomplete or
          reversible reaction and competing reactions can reduce actual yield.
          Keep intermediate precision and round only the requested final answer.
        </p>
      </details>
    </section>
  );
}
