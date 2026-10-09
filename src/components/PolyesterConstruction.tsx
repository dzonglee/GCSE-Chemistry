"use client";
import { useId } from "react";
import { CondensationConstruction } from "./CondensationConstruction";
import {
  blankPolyesterDrawing,
  readPolyesterDrawing,
  polyesterRepeatAtoms,
} from "../lib/polyester";
export function PolyesterDisplayed({
  board: b,
  reference = false,
}: {
  board: Record<string, string>;
  reference?: boolean;
}) {
  const tokens: { label: string; carbonyl?: string }[] = [];
  if (b.leftO === "1") tokens.push({ label: "O" });
  for (let i = 0; i < Number(b.diolC); i++) tokens.push({ label: "CH₂" });
  if (b.middleO === "1") tokens.push({ label: "O" });
  tokens.push({ label: "C", carbonyl: b.carbonyl1 });
  for (let i = 0; i < Number(b.acidSpacerC); i++) tokens.push({ label: "CH₂" });
  tokens.push({ label: "C", carbonyl: b.carbonyl2 });
  const w = 130 + tokens.length * 90,
    x = (i: number) => 65 + i * 90,
    y = 120;
  return (
    <figure className="polymerisation-displayed">
      <div
        className="polymerisation-scroll"
        tabIndex={0}
        role="region"
        aria-label={
          reference
            ? "Reference polyester repeat; scroll horizontally if needed"
            : "Your polyester repeat; scroll horizontally if needed"
        }
      >
        <svg
          viewBox={`0 0 ${w} 235`}
          width={w}
          height="235"
          style={{
            width: `max(100%, ${(w * 14.1) / 22}px)`,
            height: "auto",
            maxWidth: w,
          }}
          role="img"
          aria-label={
            reference
              ? "Reference polyester repeating unit"
              : "Your constructed polyester repeating unit"
          }
        >
          {tokens.map((t, i) => (
            <g key={i}>
              <text x={x(i)} y={y + 7} textAnchor="middle">
                {t.label}
              </text>
              {i < tokens.length - 1 && (
                <line
                  x1={x(i) + (t.label === "CH₂" ? 28 : 17)}
                  y1={y}
                  x2={x(i + 1) - (tokens[i + 1].label === "CH₂" ? 28 : 17)}
                  y2={y}
                />
              )}{" "}
              {t.carbonyl && t.carbonyl !== "0" && (
                <>
                  <text x={x(i)} y="48" textAnchor="middle">
                    O
                  </text>
                  <line
                    x1={x(i) + (t.carbonyl === "2" ? -4 : 0)}
                    y1="60"
                    x2={x(i) + (t.carbonyl === "2" ? -4 : 0)}
                    y2="103"
                  />
                  {t.carbonyl === "2" && (
                    <line x1={x(i) + 4} y1="60" x2={x(i) + 4} y2="103" />
                  )}
                </>
              )}
            </g>
          ))}
          {b.left === "1" && <line x1="5" y1={y} x2={x(0) - 17} y2={y} />}{" "}
          {b.right === "1" && (
            <line x1={x(tokens.length - 1) + 17} y1={y} x2={w - 5} y2={y} />
          )}{" "}
          {b.brackets === "1" && (
            <g className="polymerisation-brackets">
              <path
                d={`M${x(0) - 30 + 8},20 h-8 v185 h8 M${x(tokens.length - 1) + 30 - 8},20 h8 v185 h-8`}
              />
            </g>
          )}{" "}
          {b.countMark !== "none" && (
            <text
              x={
                b.countMark === "inside"
                  ? x(tokens.length - 1) + 15
                  : x(tokens.length - 1) + 42
              }
              y={b.countMark === "inside" ? 165 : 210}
            >
              {b.countMark === "N" ? "N" : "n"}
            </text>
          )}
        </svg>
      </div>
      <figcaption>
        Scroll sideways if needed to inspect the complete repeat.{" "}
        {reference
          ? "Reference spacers and oxygen attachments are shown for self-review."
          : "Your chosen spacers and oxygen attachments are retained."}{" "}
        CH₂ is the provided spacer notation; both carboxyl carbons are shown
        separately. These are repeat contributions with omitted ends, not a full
        finite-chain formula.
      </figcaption>
    </figure>
  );
}
export function PolyesterChoices({
  board: b,
  onChange,
  disabled = false,
}: {
  board: Record<string, string>;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  function choice(k: string, label: string, options: [string, string][]) {
    return (
      <div className="polymerisation-field" key={k}>
        <label htmlFor={id + k}>
          {k === "diolC"
            ? "Diol CH₂ spacer carbons"
            : k === "acidSpacerC"
              ? "Diacid CH₂ spacer carbons"
              : label}
        </label>
        <select
          aria-label={label}
          id={id + k}
          value={b[k]}
          disabled={disabled}
          onChange={(e) => onChange(k, e.target.value)}
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
    <div className="polymerisation-fields">
      {choice(
        "diolC",
        "Number of CH₂ spacer carbons from the diol",
        [0, 1, 2, 3, 4].map((v) => [String(v), String(v)]),
      )}
      {choice(
        "acidSpacerC",
        "Number of acid CH₂ spacer carbons (exclude both COOH carbons)",
        [0, 1, 2, 3, 4].map((v) => [String(v), String(v)]),
      )}
      {choice("leftO", "Left alcohol-derived linking O", [
        ["0", "Absent"],
        ["1", "Present"],
      ])}
      {choice("middleO", "Other alcohol-derived linking O", [
        ["0", "Absent"],
        ["1", "Present"],
      ])}
      {choice("carbonyl1", "First carboxyl carbon: separate bond to O", [
        ["0", "No O"],
        ["1", "Single C–O"],
        ["2", "Double C=O"],
      ])}
      {choice("carbonyl2", "Second carboxyl carbon: separate bond to O", [
        ["0", "No O"],
        ["1", "Single C–O"],
        ["2", "Double C=O"],
      ])}
      {choice("left", "Left single continuation", [
        ["0", "Absent"],
        ["1", "Present"],
      ])}
      {choice("right", "Right single continuation", [
        ["0", "Absent"],
        ["1", "Present"],
      ])}
      {choice("brackets", "Repeat brackets", [
        ["0", "Absent"],
        ["1", "Present"],
      ])}
      {choice("countMark", "Repeat-count notation", [
        ["none", "Absent"],
        ["n", "Lower-case n, outside lower right"],
        ["N", "Upper-case N"],
        ["inside", "n inside brackets"],
      ])}
    </div>
  );
}
export function PolyesterDrawingInput({
  value,
  onChange,
  drawing,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  drawing: import("../lib/polyester").PolyesterDrawingData;
  disabled?: boolean;
  compact?: boolean;
}) {
  if (drawing.construction)
    return (
      <CondensationConstruction
        value={value}
        onChange={onChange}
        drawing={drawing}
        disabled={disabled}
      />
    );
  const saved = value ? readPolyesterDrawing(value) : null,
    b = saved ?? blankPolyesterDrawing();
  if (value && !saved)
    return (
      <section className="polymerisation-drawing">
        <p role="status">
          The original saved polyester structure cannot be read. It is retained
          until you explicitly start a new construction.
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(JSON.stringify(blankPolyesterDrawing()))}
        >
          Start a new polyester construction
        </button>
      </section>
    );
  const atoms = polyesterRepeatAtoms(b);
  return (
    <section
      className="polymerisation-drawing"
      data-condensation-construction="legacy-repeat"
    >
      <PolyesterChoices
        board={b}
        onChange={(k, v) => onChange(JSON.stringify({ ...b, [k]: v }))}
        disabled={disabled}
      />
      <PolyesterDisplayed board={b} />
      <p>
        {drawing.note} Your construction is saved for manual review; no
        automatic examiner drawing mark.
      </p>
      <p>
        Your current repeat contributions: {atoms.C} C, {atoms.H} H and{" "}
        {atoms.O} O atoms. Incomplete bonds and wrong spacer counts are
        retained.
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(JSON.stringify(blankPolyesterDrawing()))}
      >
        Clear this polyester construction
      </button>
    </section>
  );
}
