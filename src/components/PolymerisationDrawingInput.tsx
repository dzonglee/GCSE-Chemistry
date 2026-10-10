"use client";
import { useId } from "react";
import { sideGroups } from "../lib/polymerisation";
import {
  blankPolymerisationDrawing,
  readPolymerisationDrawing,
  boardGroups,
  type PolymerisationDrawing,
} from "../lib/polymerisation-board";
import { PolymerisationDisplayed } from "./PolymerisationDisplayed";
export function PolymerisationDrawingInput({
  value,
  onChange,
  drawing,
  disabled = false,
  compact = false,
  contextLabel,
  reviewOnly = false,
}: {
  value: string;
  onChange: (value: string) => void;
  drawing: PolymerisationDrawing;
  disabled?: boolean;
  compact?: boolean;
  contextLabel?: string;
  reviewOnly?: boolean;
}) {
  const id = useId(),
    saved = value ? readPolymerisationDrawing(value) : null,
    b = saved ?? blankPolymerisationDrawing();
  if (reviewOnly)
    return (
      <section
        className="polymerisation-drawing"
        aria-label={`${contextLabel ?? "Saved response"}: polymer construction`}
      >
        {value && !saved ? (
          <p role="status">
            The original saved structure cannot be displayed. Its raw response
            is retained.
          </p>
        ) : (
          <>
            <PolymerisationDisplayed
              groups={boardGroups(b)}
              {...b}
              label={`${contextLabel ?? "Saved response"}: displayed polymerisation construction`}
            />
            <dl className="construction-review-values">
              {[0, 1, 2, 3].map((i) => (
                <div key={i}>
                  <dt>
                    Carbon {i < 2 ? 1 : 2}: {i % 2 === 0 ? "above" : "below"}{" "}
                    attachment
                  </dt>
                  <dd>
                    {b["s" + i] === "none" ? "Empty attachment" : b["s" + i]}
                  </dd>
                </div>
              ))}
              <div>
                <dt>Joining bond</dt>
                <dd>
                  {b.bond === "0"
                    ? "Absent"
                    : b.bond === "1"
                      ? "Single C–C"
                      : "Double C=C"}
                </dd>
              </div>
              <div>
                <dt>Continuation bonds</dt>
                <dd>
                  Left: {b.left === "1" ? "present" : "absent"}; right:{" "}
                  {b.right === "1" ? "present" : "absent"}
                </dd>
              </div>
              <div>
                <dt>Brackets</dt>
                <dd>{b.brackets === "1" ? "Present" : "Absent"}</dd>
              </div>
              <div>
                <dt>Repeat-count notation</dt>
                <dd>
                  {b.countMark === "none"
                    ? "Absent"
                    : b.countMark === "n"
                      ? "Lower-case n outside"
                      : b.countMark === "N"
                        ? "Upper-case N outside"
                        : "n inside brackets"}
                </dd>
              </div>
            </dl>
          </>
        )}
        <details>
          <summary>Original saved response</summary>
          <pre>{value || "Left unanswered"}</pre>
        </details>
      </section>
    );
  if (value && !saved)
    return (
      <section className="polymerisation-drawing">
        <p role="status">
          The original saved structure cannot be read. It is retained until you
          explicitly start a new construction.
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(JSON.stringify(blankPolymerisationDrawing()))}
        >
          Start a new polymerisation construction
        </button>
      </section>
    );
  function select(k: string, label: string, options: [string, string][]) {
    return (
      <div className="polymerisation-field" key={k}>
        <label htmlFor={id + k}>{label}</label>
        <select
          id={id + k}
          value={b[k]}
          disabled={disabled}
          onChange={(e) =>
            onChange(JSON.stringify({ ...b, [k]: e.target.value }))
          }
        >
          {options.map(([v, t]) => (
            <option value={v} key={v}>
              {t}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <section className="polymerisation-drawing">
      {!compact && <p>{drawing.note}</p>}
      {!compact && (
        <p>
          Construct each substituent, bond and notation from blank choices. Your
          structure is saved for review; the app does not award an examiner
          drawing mark.
        </p>
      )}
      <div className="polymerisation-fields">
        {[0, 1, 2, 3].map((i) =>
          select(
            "s" + i,
            `Carbon ${i < 2 ? 1 : 2}: ${i % 2 === 0 ? "above" : "below"} attachment`,
            sideGroups.map((g) => [g, g === "none" ? "Empty attachment" : g]),
          ),
        )}
        {select("bond", "Bond joining the two backbone/reacting carbons", [
          ["0", "No bond"],
          ["1", "Single C–C"],
          ["2", "Double C=C"],
        ])}
        {select("left", "Left continuation bond", [
          ["0", "Absent"],
          ["1", "Present"],
        ])}
        {select("right", "Right continuation bond", [
          ["0", "Absent"],
          ["1", "Present"],
        ])}
        {select("brackets", "Polymer brackets", [
          ["0", "Absent"],
          ["1", "Present"],
        ])}
        {select("countMark", "Repeat-count notation", [
          ["none", "Absent"],
          ["n", "Lower-case n, outside lower right"],
          ["N", "Upper-case N, outside"],
          ["inside", "n inside brackets"],
        ])}
      </div>
      <PolymerisationDisplayed
        groups={boardGroups(b)}
        {...b}
        label={
          contextLabel
            ? `${contextLabel}: displayed polymerisation construction`
            : undefined
        }
      />
      {compact && (
        <p>{drawing.note} Your construction is saved for manual review.</p>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(JSON.stringify(blankPolymerisationDrawing()))}
      >
        Clear this polymerisation construction
      </button>
    </section>
  );
}
