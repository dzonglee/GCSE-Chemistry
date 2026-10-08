"use client";
import { useId, useState } from "react";
import {
  chromatographyCase,
  initialChroma,
  chromaTargets,
  chromaChoices,
  compatibleChromaCases,
  validChromaHistory,
  updateChroma,
  checkChroma,
  readChromaNumber,
  type ChromaBoard,
  type ChromaFocus,
} from "@/lib/chromatography-domain";
import type { ChromatographyMode } from "@/lib/chromatography-cases";
import { ChromaMeasurement } from "./ChromaMeasurement";
import { ChromaOriginalPlot } from "./ChromaGiven";
import { ChromaSetup2D } from "./ChromaSetup2D";
import { ChromaRatioProposal } from "./ChromaRatioProposal";
import { ChromaScene3D } from "./ChromaScene3D";
const labels: Record<string, string> = {
  solventLevel: "Proposed solvent height above beaker base",
  lineMaterial: "Proposed origin-line material",
  stationary: "Stationary phase",
  mobile: "Mobile phase",
  rulerZero: "Ruler zero above paper bottom",
  spotDistance: "Spot travel from the origin",
  frontDistance: "Solvent-front travel from the origin",
  conclusion: "What does the record support?",
  rf: "Rf",
  moreStationaryRetention:
    "Greater stationary retention in the supplied comparison",
  greaterRelativeTravel: "Greater travel relative to the solvent front",
  composition: "Composition supported by the supplied evidence",
  matches: "Match supported among the supplied references",
  minimumComponents: "Minimum detected component count",
  choice: "Choice supported by the observations",
  newRf: "Proposed Rf after the stated change",
};
const words: Record<string, string> = {
  pencil: "Pencil",
  ink: "Soluble ink",
  paper: "Paper",
  silica: "Silica layer",
  alumina: "Alumina layer",
  glass: "Glass support",
  solvent: "Solvent",
  sample: "Sample",
  water: "Water",
  ethanol: "Ethanol",
  saltSolution: "Salt solution",
  ethylEthanoate: "Ethyl ethanoate",
  recorded: "Both original travel distances can be recorded",
  missingFront: "Front missing: Rf unavailable",
  consistent: "Consistent with an ordinary physical record",
  inconsistent: "Measurements or labels need checking",
  resolved: "The supplied candidates are resolved",
  "not-comparable": "The reference conditions differ",
  "same-relative-travel": "The relative travel remains the same",
  "mobile-in-chosen-solvent": "Mobile in the supplied chosen solvent",
  A: "A",
  B: "B",
  insufficient: "Insufficient evidence",
  pure: "Pure substance from the supplied complete inventory",
  mixture: "Mixture",
  "P+Q": "P and Q candidates",
  Q: "Q candidate",
  "A-or-B-or-both": "A, B or both unresolved",
  "no-reference": "No identifying reference supplied",
  "not-this-reference": "The proposed reference is not supported",
  "P+unidentified": "P candidate and an unidentified component",
  P: "P candidate",
  S1: "Solvent S1",
  S2: "Solvent S2",
  unchanged: "Unchanged relative travel",
  increased: "Greater relative travel",
  decreased: "Smaller relative travel",
};
export function ChromaWorkbench({
  mode,
  record,
  focus = "all",
  history: retained,
  onChange,
}: {
  mode: ChromatographyMode;
  record: string;
  focus?: ChromaFocus;
  history?: ChromaBoard[];
  onChange?: (history: ChromaBoard[]) => void;
}) {
  const uid = useId(),
    [localHistory, setLocalHistory] = useState<ChromaBoard[]>(() => [
      initialChroma(mode, record),
    ]),
    [feedback, setFeedback] = useState(""),
    [fallback, setFallback] = useState(false);
  const history = retained ?? localHistory;
  if (!validChromaHistory(mode, record, history, focus))
    return (
      <section className="chroma-workbench" aria-label="Task model">
        <p role="alert">
          The retained model history cannot be read. Its original bytes are
          preserved. Use the task’s explicit new-model action to replace this
          model.
        </p>
      </section>
    );
  const board = history[history.length - 1],
    source = chromatographyCase(mode, board.record)!,
    targets = chromaTargets(mode, board.record, focus),
    comparisons = compatibleChromaCases(mode, focus);
  const setHistory = (next: ChromaBoard[]) => {
    if (onChange) onChange(next);
    else setLocalHistory(next);
    setFeedback("");
  };
  const append = (next: ChromaBoard) => {
    if (history.length >= 500) {
      setFeedback(
        "This model has 500 retained steps. Undo before adding another step; your history is preserved.",
      );
      return;
    }
    setHistory([...history, next]);
  };
  const change = (key: string, value: string) =>
    append(updateChroma(mode, board, key, value));
  const unit = (key: string) =>
    (mode === "setup" && key === "solventLevel") ||
    (mode === "measurement" && key !== "conclusion")
      ? "mm"
      : mode === "ratio" && key === "spotDistance"
        ? chromatographyCase("ratio", board.record)?.spotUnit
        : mode === "ratio" && key === "frontDistance"
          ? chromatographyCase("ratio", board.record)?.frontUnit
          : undefined;
  const original = chromatographyCase(mode, record)!;
  const compactSource = () => {
    if (mode === "setup") {
      const s = chromatographyCase("setup", board.record)!;
      return `Heights above base: paper bottom ${s.paperBottom} mm; sample origin ${s.origin} mm; original water ${s.suppliedLevel} mm; original line ${words[s.suppliedLine]}.`;
    }
    if (mode === "phases") {
      const s = chromatographyCase("phases", board.record)!;
      return `Fixed support or layer: ${s.support}. Moving solvent: ${words[s.mobile]}.`;
    }
    if (mode === "measurement") {
      const s = chromatographyCase("measurement", board.record)!;
      return `Original paper-bottom coordinates: origin ${s.origin} mm; centre ${s.spot} mm; ${s.front === null ? "front unrecorded" : `front ${s.front} mm`}. Spot radius ${s.radius} mm.`;
    }
    if (mode === "ratio") {
      const s = chromatographyCase("ratio", board.record)!;
      return (
        [
          s.spot !== null ? `Spot travel ${s.spot} ${s.spotUnit}` : null,
          s.front !== null ? `front travel ${s.front} ${s.frontUnit}` : null,
          s.rf !== null ? `Rf ${s.rf}` : null,
        ]
          .filter(Boolean)
          .join(" · ") + ". Both travel distances start at the original origin."
      );
    }
    if (mode === "affinity") {
      const s = chromatographyCase("affinity", board.record)!;
      return `Original Rf: A ${s.a}; B ${s.b}. ${s.conditions}`;
    }
    if (mode === "interpretation") {
      const s = chromatographyCase("interpretation", board.record)!;
      return `Original source: origin ${s.origin} mm; front ${s.front} mm above the paper bottom. The unchanged reference lanes are shown below.`;
    }
    return chromatographyCase("conditions", board.record)!.observations;
  };
  const selectedSource = () => {
    if (mode === "setup") {
      const s = chromatographyCase("setup", board.record)!;
      return (
        <>
          <p>
            Fixed paper bottom: {s.paperBottom} mm · fixed sample origin:{" "}
            {s.origin} mm · supplied water level: {s.suppliedLevel} mm ·
            original line: {words[s.suppliedLine]}.
          </p>
          <p>
            All heights are above the beaker base. The paper and sample stay
            fixed; choose your own water level and line material.
          </p>
        </>
      );
    }
    if (mode === "phases") {
      const s = chromatographyCase("phases", board.record)!;
      return (
        <>
          <p>
            Supplied fixed support or layer: {s.support}. Supplied moving
            solvent: {words[s.mobile]}.
          </p>
          <div className="chroma-phase-proposal">
            <article>
              <h4>Your stationary-phase assignment</h4>
              <p>{board.stationary ? words[board.stationary] : "Not chosen"}</p>
            </article>
            <article>
              <h4>Your mobile-phase assignment</h4>
              <p>{board.mobile ? words[board.mobile] : "Not chosen"}</p>
            </article>
          </div>
        </>
      );
    }
    if (mode === "measurement") {
      const s = chromatographyCase("measurement", board.record)!;
      return (
        <>
          <p>
            Original coordinates above paper bottom: origin {s.origin} mm; spot
            centre {s.spot} mm;{" "}
            {s.front === null ? "front not recorded" : `front ${s.front} mm`}.
            Spot radius {s.radius} mm.
          </p>
          <ChromaMeasurement
            source={s}
            board={board}
            onZero={(value) => change("rulerZero", value)}
          />
        </>
      );
    }
    if (mode === "ratio") {
      const s = chromatographyCase("ratio", board.record)!;
      return (
        <>
          <dl className="chroma-source-ledger">
            <div>
              <dt>Original spot travel</dt>
              <dd>
                {s.spot === null ? "Not supplied" : `${s.spot} ${s.spotUnit}`}
              </dd>
            </div>
            <div>
              <dt>Original front travel</dt>
              <dd>
                {s.front === null
                  ? "Not supplied"
                  : `${s.front} ${s.frontUnit}`}
              </dd>
            </div>
            <div>
              <dt>Original Rf</dt>
              <dd>{s.rf === null ? "Not supplied" : s.rf}</dd>
            </div>
          </dl>
          <p>
            Both supplied travel distances start at the same original origin.{" "}
            {s.rounding
              ? `Report the ratio to ${s.rounding.digits} significant figures.`
              : ""}
          </p>
          <p>
            Original measured values remain fixed. Your fields below are
            proposals, not new observations.
          </p>
        </>
      );
    }
    if (mode === "affinity") {
      const s = chromatographyCase("affinity", board.record)!;
      return (
        <>
          <p>{s.conditions}</p>
          <div className="chroma-relative-comparison">
            {[
              ["A", s.a],
              ["B", s.b],
            ].map(([label, value]) => (
              <article key={String(label)}>
                <h4>
                  Original {label}: Rf {value}
                </h4>
                <div
                  role="img"
                  aria-label={`Original ${label}: relative travel ${value}`}
                  className="chroma-relative-bar"
                >
                  <span style={{ width: Number(value) * 100 + "%" }} />
                </div>
              </article>
            ))}
          </div>
          <p>
            These bars show the supplied relative travel, not an absolute
            distance or simulated molecular force.
          </p>
        </>
      );
    }
    if (mode === "interpretation") {
      const s = chromatographyCase("interpretation", board.record)!;
      return (
        <ChromaOriginalPlot
          source={{
            title: s.title,
            origin: s.origin,
            front: s.front,
            top: s.front + 15,
            unit: "mm",
            phaseNote:
              "Original same-condition lanes: same paper, solvent and temperature.",
            lanes: s.lanes.map((l) => ({
              label: l.label,
              centres: l.positions,
              colour: l.colour,
            })),
            note: s.givenNote,
          }}
        />
      );
    }
    const s = chromatographyCase("conditions", board.record)!;
    return <p>{s.observations}</p>;
  };
  return (
    <section className="chroma-workbench" aria-label="Task model">
      {board.record !== record && (
        <p className="chroma-comparison-notice">
          You are exploring a comparison. The original task still asks about “
          {original.title}”. Reset the model to return to that original source.
        </p>
      )}
      <div className="chroma-drawing-fields">
        {targets.map((key) => {
          const options = chromaChoices(mode, key),
            suffix = unit(key);
          return (
            <label key={key} htmlFor={uid + "-" + key}>
              <span>
                {labels[key]}
                {suffix ? ` (${suffix})` : ""}
              </span>
              {options.length ? (
                <>
                  <select
                    id={uid + "-" + key}
                    data-field={key}
                    value={board[key]}
                    onChange={(e) => change(key, e.target.value)}
                  >
                    <option value="">Choose…</option>
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {words[option] ?? option}
                      </option>
                    ))}
                  </select>
                  {board[key] && (
                    <span className="chroma-selected-proposal">
                      Your proposal: {words[board[key]] ?? board[key]}
                    </span>
                  )}
                </>
              ) : (
                <input
                  id={uid + "-" + key}
                  data-field={key}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  maxLength={24}
                  value={board[key]}
                  onChange={(e) => change(key, e.target.value)}
                />
              )}
            </label>
          );
        })}
      </div>
      <h3>{source.title}</h3>
      <div className="chroma-compact-source">
        <p>{compactSource()}</p>
      </div>
      {mode !== "setup" && mode !== "ratio" && mode !== "conditions" && (
        <div className="chroma-original-source">{selectedSource()}</div>
      )}
      {mode === "setup" && (
        <>
          <ChromaScene3D
            source={chromatographyCase("setup", board.record)!}
            board={board}
            onUnavailable={setFallback}
          />
          <details open={fallback}>
            <summary>Inspect the calibrated 2D apparatus</summary>
            <ChromaSetup2D
              source={chromatographyCase("setup", board.record)!}
              board={board}
            />
          </details>
        </>
      )}
      {mode === "ratio" && (
        <ChromaRatioProposal
          source={chromatographyCase("ratio", board.record)!}
          board={board}
        />
      )}
      {mode === "ratio" && board.rf && readChromaNumber(board.rf) === null && (
        <p>Unfinished or nonnumeric Rf entry “{board.rf}” is retained.</p>
      )}
      <div className="chroma-model-actions">
        <button
          type="button"
          onClick={() => setFeedback(checkChroma(mode, board, focus).message)}
        >
          Check model
        </button>
        <button
          type="button"
          disabled={history.length <= 1}
          onClick={() => setHistory(history.slice(0, -1))}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => append(initialChroma(mode, record))}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p role="status" className="chroma-model-feedback">
          {feedback}
        </p>
      )}
      <label className="chroma-comparison-picker" htmlFor={uid + "-source"}>
        <span>Explore a supplied comparison</span>
        <select
          id={uid + "-source"}
          data-field="record"
          value={board.record}
          onChange={(e) => append(initialChroma(mode, e.target.value))}
        >
          {comparisons.map((r) => (
            <option key={r} value={r}>
              {chromatographyCase(mode, r)!.title}
            </option>
          ))}
        </select>
      </label>
      <details>
        <summary>About this model</summary>
        <p>
          Original observations are supplied, not generated by the model. You
          propose the asked quantities and conclusions. Comparing another source
          resets only its model fields; it does not change the original
          question. An answer outside a physical range is retained rather than
          moved to a valid position.
        </p>
      </details>
    </section>
  );
}
