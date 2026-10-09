"use client";
import { useId } from "react";
import {
  emptyPathwayDrawing,
  readPathwayDrawing,
  type PathwayDrawingData,
} from "../lib/pathway-board";
import { PathwayGiven } from "./PathwayReview";
import { PathwayDisplayed } from "./PathwayDisplayed";
export function PathwayDrawingInput({
  value,
  onChange,
  drawing,
  disabled = false,
  showGiven = false,
}: {
  value: string;
  onChange: (s: string) => void;
  drawing: PathwayDrawingData;
  disabled?: boolean;
  showGiven?: boolean;
}) {
  const id = useId(),
    saved = value ? readPathwayDrawing(value) : null,
    b = saved ?? emptyPathwayDrawing();
  if (value && !saved)
    return (
      <section className="pathway-drawing">
        <p role="status">
          Your original saved structure cannot be read. Its bytes are retained
          until you explicitly start a new construction.
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(JSON.stringify(emptyPathwayDrawing()))}
        >
          Start a new addition construction
        </button>
      </section>
    );
  function field(key: string, label: string, options: [string, string][]) {
    return (
      <div key={key} style={{ display: "grid", gap: 6 }}>
        <label htmlFor={id + key}>{label}</label>
        <select
          id={id + key}
          data-drawing-field={key}
          disabled={disabled}
          value={b[key]}
          onChange={(e) =>
            onChange(JSON.stringify({ ...b, [key]: e.target.value }))
          }
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
    <section className="pathway-drawing">
      {field("n", "Number of carbon atoms", [
        ["", "Choose"],
        ...["2", "3", "4", "5"].map((v) => [v, v] as [string, string]),
      ])}
      <p>{drawing.note}</p>
      <p>
        Build the full product from blank choices. Your drawing is saved for
        your own review; the app does not award an examiner drawing mark.
      </p>
      {showGiven && <PathwayGiven caseId={drawing.caseId} />}
      <PathwayDisplayed board={b} />
      {Array.from({ length: Number(b.n) }, (_, i) => (
        <fieldset key={i}>
          <legend>Carbon {i + 1}</legend>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
              gap: 12,
            }}
          >
            {field(
              "h" + i,
              "Individual C–H bonds",
              ["0", "1", "2", "3", "4"].map((v) => [v, v]),
            )}
            {field(
              "x" + i,
              "Halogen attachments",
              ["none", "Cl", "Br", "I", "Cl2", "Br2", "I2"].map((v) => [
                v,
                v === "none"
                  ? "Absent"
                  : v.endsWith("2")
                    ? "Two " + v.slice(0, -1) + " atoms on this carbon"
                    : v,
              ]),
            )}
            {field("o" + i, "C–O bond", [
              ["0", "Absent"],
              ["1", "Present"],
            ])}
            {field("oh" + i, "Hydrogen bonded to that oxygen", [
              ["0", "Absent"],
              ["1", "Present"],
            ])}
            {i < Number(b.n) - 1 &&
              field("b" + i, `Bond to carbon ${i + 2}`, [
                ["0", "Absent"],
                ["1", "Single"],
                ["2", "Double"],
              ])}
          </div>
        </fieldset>
      ))}
      <div style={{ display: "grid", gap: 12 }}>
        {field("brackets", "Polymer brackets", [
          ["0", "Absent"],
          ["1", "Present"],
        ])}
        {field("countMark", "Repeat-count notation", [
          ["none", "Absent"],
          ["n", "Lower-case n outside"],
          ["N", "Upper-case N outside"],
          ["inside", "n inside"],
        ])}
      </div>
    </section>
  );
}
