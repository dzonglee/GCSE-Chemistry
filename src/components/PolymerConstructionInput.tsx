"use client";
import { readPolymerDrawing } from "@/lib/polymer-structures";
import { PolymerRepeatDiagram } from "./PolymerRepeatDiagram";
export function PolymerConstructionInput({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const values = readPolymerDrawing(value) ?? {};
  const set = (key: string, v: string) =>
    onChange(
      JSON.stringify({
        bondOrder: "0",
        hydrogens: "0",
        continuation: "0",
        countMark: "0",
        ...values,
        [key]: v,
      }),
    );
  const select = (label: string, key: string, options: [string, string][]) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={values[key] ?? "0"}
        onChange={(e) => set(key, e.target.value)}
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <>
      {value.trim() && !readPolymerDrawing(value) && (
        <p role="status">
          Some saved diagram choices are invalid. Choose the four fields to
          rebuild your drawing.
        </p>
      )}
      <fieldset className="polymer-construction-controls" disabled={disabled}>
        <legend>Construct your repeat-unit diagram</legend>
        {select("Joining carbon bond", "bondOrder", [
          ["0", "Choose bond"],
          ["1", "Single"],
          ["2", "Double"],
        ])}
        {select("Hydrogens at each carbon", "hydrogens", [
          ["0", "Choose count"],
          ["1", "One"],
          ["2", "Two"],
          ["3", "Three"],
        ])}
        {select("Bonds crossing bracket sides", "continuation", [
          ["0", "No outside bonds"],
          ["1", "Both sides continue"],
        ])}
        {select("Outside repeat-count marker", "countMark", [
          ["0", "No count marker"],
          ["1", "Lower-case n"],
          ["2", "Upper-case N"],
        ])}
      </fieldset>
      <div aria-label="Your proposed repeat-unit diagram">
        <PolymerRepeatDiagram
          backbone={
            values.bondOrder === "1"
              ? "single"
              : values.bondOrder === "2"
                ? "double"
                : "unset"
          }
          hydrogens={
            ["1", "2", "3"].includes(values.hydrogens)
              ? Number(values.hydrogens)
              : 0
          }
          continuation={values.continuation === "1" ? "yes" : "no"}
          countMark={
            values.countMark === "1"
              ? "n"
              : values.countMark === "2"
                ? "N"
                : "unset"
          }
        />
      </div>
    </>
  );
}
