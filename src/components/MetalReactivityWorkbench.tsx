"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialMetalBoard,
  metalRecords,
  metalChoices,
  metalPrediction,
  metalExpected,
  reactivityReference,
  type MetalMode,
} from "@/lib/metal-reactivity";
import { MetalDisplacement3D } from "./MetalDisplacement3D";
const labels: Record<string, string> = {
  hydrogen: "Hydrogen",
  oxygen: "Oxygen",
  none: "No hydrogen evolves",
  "not-detected": "No gas detected in this brief record",
  "salt-and-hydrogen": "Metal chloride and hydrogen",
  "hydroxide-and-hydrogen": "Metal hydroxide and hydrogen",
  "below-hydrogen": "Below hydrogen: no displacement from dilute HCl",
  "short-observation-not-no-reaction":
    "A short observation does not establish zero reaction",
  "all-metals-instantly-react": "Every metal reacts instantly",
  "all-gas-is-oxygen": "Any gas must be oxygen",
  displacement: "Displacement occurs",
  "no-displacement": "No displacement",
  unchanged: "No new deposited metal",
  "added-metal-more-reactive":
    "Added metal is more reactive than dissolved metal",
  "added-metal-not-more-reactive":
    "Added metal is not more reactive than dissolved metal",
  "every-metal-displaces": "Every metal displaces every other metal",
  "elements-transform": "One element transforms into another",
  "A>B>C": "A > B > C",
  "B>A>C": "B > A > C",
  "A/B-undetermined-C-last": "A and B are above C; A/B order unknown",
  inconsistent: "Results conflict under the supplied conditions",
  "chain-transitive": "Use both linked comparisons",
  "missing-comparison": "A/B comparison is missing",
  "check-conflicting-data": "Check contradictory observations and conditions",
  "force-a-complete-order": "Always force a complete order",
  "unfair-comparison": "These trials do not establish a fair ranking",
  "Mg-more-reactive-in-given-test":
    "Mg shows more progress in this supplied comparable test",
  "cannot-rank-final-yield": "Final yield alone cannot establish a ranking",
  "equal-final-volume-equal-reactivity":
    "Equal final gas means equal reactivity",
  "control-metal-amount-and-division":
    "Control metal amount and exposed surface, plus acid conditions",
  "comparable-progress-over-time":
    "Compare progress over the same time under the supplied controls",
  "yield-does-not-measure-rate":
    "Final quantity does not measure reaction rate",
  "bigger-final-volume-always-reactive":
    "Larger final yield always means greater reactivity",
};
const fields: Record<MetalMode, [string, string][]> = {
  series: [],
  observations: [
    ["gas", "Your gas prediction"],
    ["interpretation", "Your interpretation"],
  ],
  displacement: [
    ["outcome", "Your reaction prediction"],
    ["solid", "Your deposited metal"],
    ["reason", "Your reason"],
  ],
  evidence: [
    ["conclusion", "Your supported conclusion"],
    ["reason", "Your evidence rule"],
  ],
  fair: [
    ["conclusion", "Your comparison conclusion"],
    ["reason", "Your comparison rule"],
  ],
};
const headings: Record<MetalMode, string> = {
  series: "Most → least reactive",
  observations: "Distinguish conditions and observations",
  displacement: "Predict what changes",
  evidence: "Use only the supplied evidence",
  fair: "Compare like with like",
};
export function MetalReactivityWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: MetalMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialMetalBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  const records = metalRecords[mode] as Record<string, { label: string }>,
    key = String(b.record);
  function change(field: string, value: string) {
    if (b[field] === value) return;
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    const next = { ...b, [field]: value };
    if (mode === "series" && field === "record")
      next.order =
        metalRecords.series[
          value as keyof typeof metalRecords.series
        ].metals.join(",");
    setFeedback("");
    onChange([...history, next]);
  }
  function select(field: string, label: string) {
    return (
      <label key={field}>
        {label}
        <select
          aria-label={label}
          value={b[field]}
          onChange={(e) => change(field, e.target.value)}
        >
          {metalChoices[mode][field].map((v) => (
            <option key={v} value={v}>
              {v === "unset"
                ? "Predict"
                : field === "record"
                  ? records[v].label
                  : (labels[v] ?? v)}
            </option>
          ))}
        </select>
        {b[field] !== "unset" && field !== "record" && (
          <span className="metal-selected">
            Selected: {labels[String(b[field])] ?? String(b[field])}
          </span>
        )}
      </label>
    );
  }
  function check() {
    const p = metalPrediction(mode, b);
    setCorrect(p.correct);
    setFeedback(
      !p.complete
        ? "Complete every prediction before checking."
        : p.correct
          ? `That's right. ${Object.values(metalExpected(mode, b))
              .map((v) => labels[v] ?? v.replaceAll(",", " > "))
              .join("; ")}.`
          : mode === "series"
            ? "Not yet. Move the metals from most to least reactive; positions are an order, not numerical reaction strengths."
            : mode === "observations"
              ? "Not yet. Use the named medium and observation. Water gives hydroxide and hydrogen; suitable dilute HCl gives chloride and hydrogen. A brief absence of bubbles is not proof of zero reaction."
              : mode === "displacement"
                ? "Not yet. A more reactive added metal displaces a less reactive dissolved metal. Elements retain their identities; the sulfate ions remain unchanged."
                : mode === "evidence"
                  ? "Not yet. Link only supported comparisons. Leave untested relative positions unknown and check conflicting results."
                  : "Not yet. Check amount, exposed surface, acid conditions and elapsed time. Final gas yield alone does not measure rate.",
    );
  }
  const order = String(b.order ?? "").split(",");
  const displacement =
    mode === "displacement"
      ? metalRecords.displacement[key as keyof typeof metalRecords.displacement]
      : null;
  return (
    <section
      className="model task-workbench metal-reactivity-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      {mode === "series" ? (
        <>
          <div className="metal-order">
            {order.map((metal, i) => (
              <div className="metal-order-card" key={metal}>
                <header>
                  <strong>{metal}</strong>
                  <span>#{i + 1}</span>
                </header>
                <div>
                  {[1, -1].map((delta) => (
                    <button
                      key={delta}
                      className="particle-choice"
                      aria-label={`Move ${metal} ${delta === 1 ? "right" : "left"}`}
                      disabled={i + delta < 0 || i + delta >= order.length}
                      onClick={() => {
                        const next = [...order];
                        [next[i], next[i + delta]] = [next[i + delta], next[i]];
                        change("order", next.join(","));
                      }}
                    >
                      {delta === 1 ? "Right →" : "← Left"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="metal-predictions">
          {fields[mode].map(([field, label]) => select(field, label))}
        </div>
      )}
      {select("record", "Explore a supplied record")}
      <p className="metal-record">{records[key].label}.</p>
      <p className="position-caption">
        The answer task uses its stated initial record. This model explores
        other supplied records.
      </p>
      {mode === "evidence" && (
        <ul>
          {metalRecords.evidence[
            key as keyof typeof metalRecords.evidence
          ].edges.map(([a, c], i) => (
            <li key={i}>
              {a} displaces {c}: {a} is more reactive than {c}.
            </li>
          ))}
        </ul>
      )}
      {displacement && (
        <MetalDisplacement3D
          added={displacement.added}
          dissolved={displacement.dissolved}
        />
      )}
      <div className="bench-actions">
        <button className="button primary" onClick={check}>
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
          className={correct ? "feedback correct" : "feedback retry"}
        >
          {feedback}
        </p>
      )}
      <details>
        <summary>About this model</summary>
        <p>{instruction}</p>
        <p>
          Reference, most to least reactive: {reactivityReference.join(" > ")}.
          Carbon and hydrogen are nonmetal reference points. AQA and Pearson
          specify different subsets. These positions are ordinal; gaps do not
          measure reaction strength. Water observations here are at room
          temperature, without steam. Acid examples use dilute non-oxidising
          HCl. Supplied practical records support interpretation, not
          unsupervised experiments.
        </p>
        <p>
          Greater tendency to form positive ions supports the metal series. Full
          electron half-equations and extraction require their separate lessons.
          A supplied comparable-test criterion does not make observed rate a
          universal numerical definition of reactivity.
        </p>
      </details>
    </section>
  );
}
