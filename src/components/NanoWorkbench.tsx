"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialNanoBoard,
  nanoPrediction,
  subdivisionData,
  type NanoMode,
} from "@/lib/nanoparticles";
import { NanoScene3D } from "./NanoScene3D";
export function NanoWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: NanoMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialNanoBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  const change = (key: string, value: string | number) => {
    if (b[key] === value) return;
    if (history.length >= 500) {
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      setCorrect(false);
      return;
    }
    setFeedback("");
    onChange([...history, { ...b, [key]: value }]);
  };
  const select = (
    label: string,
    key: string,
    values: [string | number, string][],
    numeric = false,
  ) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={b[key]}
        onChange={(e) =>
          change(key, numeric ? Number(e.target.value) : e.target.value)
        }
      >
        {values.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
  const comparison: [string, string][] = [
    ["unset", "Choose prediction"],
    ["same", "Unchanged"],
    ["larger", "Larger"],
    ["smaller", "Smaller"],
  ];
  const d = subdivisionData(Number(b.divisions ?? 1), b.separated === "yes");
  return (
    <section
      className="model task-workbench nano-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "subdivide" && (
          <>
            {select(
              "Subdivisions per edge",
              "divisions",
              [
                [1, "1: one cube"],
                [2, "2: eight smaller cubes"],
                [3, "3: twenty-seven smaller cubes"],
              ],
              true,
            )}
            {select("Expose cut faces", "separated", [
              ["no", "Keep pieces touching"],
              ["yes", "Separate the pieces"],
            ])}
            {select("Total exposed surface area", "area", comparison)}
            {select("Total material volume", "volume", comparison)}
          </>
        )}
        {mode === "cube" && (
          <>
            {select(
              "Cube side in nm",
              "side",
              [
                [2, "2 nm"],
                [4, "4 nm"],
                [6, "6 nm"],
              ],
              true,
            )}
            {select("Your six-face area in nm²", "area", [
              ["unset", "Choose area"],
              ["24", "24"],
              ["96", "96"],
              ["216", "216"],
              ["16", "16"],
              ["64", "64"],
              ["36", "36"],
            ])}
            {select("Your volume in nm³", "volume", [
              ["unset", "Choose volume"],
              ["8", "8"],
              ["64", "64"],
              ["216", "216"],
              ["24", "24"],
              ["96", "96"],
              ["36", "36"],
            ])}
            {select("Numerical area ÷ volume in nm⁻¹", "ratio", [
              ["unset", "Choose quotient"],
              ["3", "3"],
              ["1.5", "1.5"],
              ["1", "1"],
              ["6", "6"],
              ["0.5", "0.5"],
            ])}
          </>
        )}
        {mode === "scale" && (
          <>
            {select(
              "Supplied nanoparticle diameter",
              "diameter",
              [
                [20, "20 nm"],
                [40, "40 nm"],
                [80, "80 nm"],
              ],
              true,
            )}
            {select("Diameter in metres", "metres", [
              ["unset", "Choose conversion"],
              ["2e-8", "2 × 10⁻⁸ m"],
              ["4e-8", "4 × 10⁻⁸ m"],
              ["8e-8", "8 × 10⁻⁸ m"],
              ["4e-7", "4 × 10⁻⁷ m"],
              ["4e-9", "4 × 10⁻⁹ m"],
            ])}
            {select("Diameter compared with 0.2 nm atom", "comparison", [
              ["unset", "Choose multiple"],
              ["100", "100 times"],
              ["200", "200 times"],
              ["400", "400 times"],
              ["40", "40 times"],
            ])}
          </>
        )}
        {mode === "evidence" && (
          <>
            {select("Inspect supplied application", "application", [
              ["coating", "Window coating"],
              ["catalyst", "Catalyst"],
            ])}
            {select("Supported benefit", "benefit", [
              ["unset", "Choose benefit"],
              ["less", "Less material, same effect"],
              ["transparent", "Every nano material is clear"],
              ["never-toxic", "Every nano material is safe"],
            ])}
            {select("Conclusion about risk", "risk", [
              ["unset", "Choose conclusion"],
              ["study", "Investigate release and exposure"],
              ["safe", "The performance test proves all uses safe"],
              ["ban", "Size proves every nanoparticle must be banned"],
            ])}
          </>
        )}
      </div>
      {mode === "subdivide" && (
        <>
          <NanoScene3D
            divisions={Number(b.divisions)}
            separated={b.separated === "yes"}
          />
          <dl className="atom-ledger">
            <div>
              <dt>Material volume</dt>
              <dd>{d.totalVolume} units³</dd>
            </div>
            <div>
              <dt>Exposed area</dt>
              <dd>{d.exposedArea} units²</dd>
            </div>
            <div>
              <dt>Area ÷ volume</dt>
              <dd>{d.quotient} units⁻¹</dd>
            </div>
          </dl>
          <p>
            Starting cube: side 6 illustrative units. Cutting alone does not
            expose touching internal faces; compare with the original outer area
            216 units².
          </p>
        </>
      )}
      {mode === "cube" && (
        <figure className="nano-cube-data">
          <svg
            viewBox="0 0 360 260"
            role="img"
            aria-label={`Ideal cube with each edge ${b.side} nanometres. Six square faces, including hidden faces.`}
          >
            <polygon
              points="80,85 185,35 285,85 180,135"
              fill="#c3ccfb"
              stroke="#3044a0"
            />
            <polygon
              points="80,85 180,135 180,235 80,185"
              fill="#8a9ce9"
              stroke="#3044a0"
            />
            <polygon
              points="180,135 285,85 285,185 180,235"
              fill="#5168cc"
              stroke="#3044a0"
            />
            <text x="25" y="245" fontSize="32">
              Side {b.side} nm
            </text>
          </svg>
          <figcaption>
            Six square faces; volume fills the three-dimensional cube. This
            ideal shape is supplied for calculation, not an atomic structure.
          </figcaption>
        </figure>
      )}
      {mode === "scale" && (
        <p className="phase-boundary-note">
          Supplied atom diameter: 0.2 nm. 1 nm = 10⁻⁹ m. Compare diameters in
          matching units. A length ratio does not tell you how many atoms fill a
          nanoparticle.
        </p>
      )}
      {mode === "evidence" && (
        <div className="phase-boundary-note">
          <strong>
            Original illustrative test data —{" "}
            {b.application === "coating" ? "window coating" : "catalyst"}
          </strong>
          <p>
            {b.application === "coating"
              ? "At equal coated area, 2 mg of the nanoparticulate coating and 8 mg of the larger-particle coating achieved the same specified cleaning effect."
              : "In the same supplied reaction test, 1 g of the nanoparticulate catalyst and 4 g of the larger-particle catalyst achieved the same specified conversion."}
          </p>
          <p>
            Release during use, inhalation exposure and long-term environmental
            effects were not measured. Performance evidence alone does not
            establish safety. These invented data are not measurements of a
            commercial product.
          </p>
        </div>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = nanoPrediction(mode, b);
            setFeedback(r.feedback);
            setCorrect(r.correct);
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={!history.length}
          onClick={() => {
            setFeedback("");
            onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            setFeedback("");
            onChange([]);
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
    </section>
  );
}
