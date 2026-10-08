"use client";
import { useId, useState } from "react";
import {
  additionCases,
  originalHydrogens,
  originalCounts,
  formula,
  type AdditionCase,
} from "../lib/pathways";
import {
  initialPathwayBoard,
  emptyPathwayDrawing,
  checkPathwayBoard,
  type PathwayBoard,
} from "../lib/pathway-board";
import { PathwayDisplayed } from "./PathwayDisplayed";
import { PathwayScene3D } from "./PathwayScene3D";
function sourceDrawing(r: AdditionCase) {
  const b = emptyPathwayDrawing();
  b.n = String(r.n);
  originalHydrogens(r).forEach((h, i) => (b["h" + i] = String(h)));
  for (let i = 0; i < r.n - 1; i++) b["b" + i] = i === r.double ? "2" : "1";
  return b;
}
function proposalDrawing(r: AdditionCase, b: PathwayBoard) {
  const d = sourceDrawing(r);
  if (b.site === "") return d;
  const site = Number(b.site);
  d["b" + site] = b.bond;
  for (let j = 0; j < 2; j++) {
    const i = site + j,
      g = b[j === 0 ? "leftNew" : "rightNew"];
    if (g === "H") d["h" + i] = String(Number(d["h" + i]) + 1);
    else if (g === "O" || g === "OH") {
      d["o" + i] = "1";
      d["oh" + i] = g === "OH" ? b["ohH" + j] : "0";
    } else if (g !== "none") d["x" + i] = g;
  }
  d.brackets = b.brackets;
  d.countMark = b.countMark;
  return d;
}
export function PathwayAddition({
  board: b,
  onChange: setB,
}: {
  board: PathwayBoard;
  onChange: (next: PathwayBoard) => void;
}) {
  const id = useId(),
    [result, setResult] = useState<{ key: string; message: string } | null>(
      null,
    ),
    r = additionCases[b.record];
  const feedback = result?.key === JSON.stringify(b) ? result.message : "";
  function setFeedback(message: string) {
    setResult(message ? { key: JSON.stringify(b), message } : null);
  }
  function field(k: string, label: string, options: [string, string][]) {
    return (
      <div style={{ display: "grid", gap: 6 }}>
        <label htmlFor={id + k}>{label}</label>
        <select
          id={id + k}
          data-field={k}
          value={b[k]}
          onChange={(e) => {
            if (k === "record" && e.target.value === b.record) return;
            setB(
              k === "record"
                ? initialPathwayBoard("addition", e.target.value)
                : { ...b, [k]: e.target.value },
            );
            setFeedback("");
          }}
        >
          {options.map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <section className="addition">
      {field("site", "Which C–C bond reacts?", [
        ["", "Choose a bond"],
        ...Array.from(
          { length: r.n - 1 },
          (_, i) =>
            [String(i), `Carbon ${i + 1} to carbon ${i + 2}`] as [
              string,
              string,
            ],
        ),
      ])}
      <p className="pathway-current-source">
        <strong>{r.title}.</strong> Keep every original C and H.
        {r.reagent === "water" && r.n > 2
          ? ` For this task, put OH on carbon ${r.ohIndex! + 1}.`
          : ""}
      </p>
      <details>
        <summary>Inspect the original molecule</summary>
        <p>
          {r.name}:{" "}
          {formula(originalCounts(r)).replace(
            /[0-9]/g,
            (c) => "₀₁₂₃₄₅₆₇₈₉"[Number(c)],
          )}
          .
        </p>
        <PathwayDisplayed board={sourceDrawing(r)} label="Original alkene" />
      </details>
      <div className="construction">
        <div className="controls">
          {field("bond", "Your replacement bond", [
            ["0", "Absent"],
            ["1", "Single"],
            ["2", "Double"],
          ])}
          <div className="pair">
            {field(
              "leftNew",
              "New attachment on first selected carbon",
              ["none", "H", "OH", "O", "Cl", "Br", "I"].map((v) => [
                v,
                v === "none" ? "Nothing added" : v,
              ]),
            )}
            {field(
              "rightNew",
              "New attachment on second selected carbon",
              ["none", "H", "OH", "O", "Cl", "Br", "I"].map((v) => [
                v,
                v === "none" ? "Nothing added" : v,
              ]),
            )}
          </div>
          {b.leftNew === "OH" &&
            field("ohH0", "H bonded to first new oxygen", [
              ["0", "Absent"],
              ["1", "Present"],
            ])}
          {b.rightNew === "OH" &&
            field("ohH1", "H bonded to second new oxygen", [
              ["0", "Absent"],
              ["1", "Present"],
            ])}
          {field("byproduct", "Small by-product released?", [
            ["", "Choose"],
            ["none", "None"],
            ["water", "Water"],
            ["hydrogen", "Hydrogen"],
          ])}
          {field("extent", "Product extent", [
            ["", "Choose"],
            ["molecule", "One discrete molecule"],
            ["polymer", "Repeating chain"],
          ])}
        </div>
        <div>
          <PathwayScene3D reaction={r} board={b} />
          <details>
            <summary>Inspect your fully displayed proposal</summary>
            <PathwayDisplayed board={proposalDrawing(r, b)} />
          </details>
        </div>
      </div>
      <div className="model-controls">
        <button
          type="button"
          onClick={() => setFeedback(checkPathwayBoard("addition", b).message)}
        >
          Check this construction
        </button>
        <button
          type="button"
          onClick={() => {
            setB(initialPathwayBoard("addition", b.record));
            setFeedback("");
          }}
        >
          Reset this reaction
        </button>
      </div>
      <details>
        <summary>Try another supplied reaction</summary>
        {field(
          "record",
          "Reaction to investigate",
          Object.entries(additionCases).map(([v, r]) => [v, r.title]),
        )}
      </details>
      {feedback && <p role="status">{feedback}</p>}
    </section>
  );
}
