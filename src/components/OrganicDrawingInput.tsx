"use client";
import { useId } from "react";
import { OrganicDisplayed, OrganicHydrogens } from "./OrganicDisplayed";
import {
  emptyOrganicDrawing,
  readOrganicDrawing,
  drawingOrganicCounts,
  type OrganicDrawingData,
} from "../lib/organic-drawing";
export function OrganicDrawingInput({
  value,
  onChange,
  drawing,
  disabled = false,
  contextLabel,
}: {
  value: string;
  onChange: (s: string) => void;
  drawing: OrganicDrawingData;
  disabled?: boolean;
  contextLabel?: string;
}) {
  const uid = useId(),
    d = readOrganicDrawing(value);
  if (!d)
    return (
      <div role="status">
        <p>
          Your saved drawing cannot be displayed in the current format. Its
          original answer is retained.
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(JSON.stringify(emptyOrganicDrawing()))}
        >
          Start a new organic construction
        </button>
      </div>
    );
  const update = (key: string, val: string) =>
      onChange(JSON.stringify({ ...d, [key]: val })),
    toggle = (key: string) => update(key, d[key] === "yes" ? "no" : "yes"),
    count = drawingOrganicCounts(d);
  return (
    <section
      className="organic-drawing-input"
      aria-label={
        contextLabel
          ? `${contextLabel}: organic structure construction`
          : "Organic structure construction"
      }
    >
      <p>{drawing.note}</p>
      <label htmlFor={uid + "-n"}>
        Choose the number of carbon atoms in your scaffold
      </label>
      <select
        id={uid + "-n"}
        value={d.n}
        disabled={disabled}
        onChange={(e) => update("n", e.target.value)}
      >
        <option value="">Choose your carbon count</option>
        {[1, 2, 3, 4].map((n) => (
          <option key={n} value={n}>
            {n} carbon atom{n === 1 ? "" : "s"}
          </option>
        ))}
      </select>
      <p>
        Choose each oxygen connection and H attachment yourself. The terminal
        attachments move to the current end carbon when you change the scaffold;
        hidden H choices are retained and restored. This response is
        self-reviewed after submission, without automatic examiner marks.
      </p>
      {d.n ? (
        <>
          <div className="model-controls">
            <button
              type="button"
              disabled={disabled}
              aria-pressed={d.hydroxyl === "yes"}
              onClick={() => toggle("hydroxyl")}
            >
              Terminal C–O attachment:{" "}
              {d.hydroxyl === "yes" ? "present" : "absent"}
            </button>
            <button
              type="button"
              disabled={disabled}
              aria-pressed={d.oxygenH === "yes"}
              onClick={() => toggle("oxygenH")}
            >
              H attached to that O:{" "}
              {d.oxygenH === "yes" ? "chosen" : "not chosen"}
            </button>
          </div>
          <label htmlFor={uid + "-carbonyl"}>
            Separate terminal C–O connection and bond order
          </label>
          <select
            id={uid + "-carbonyl"}
            value={d.carbonyl}
            disabled={disabled}
            onChange={(e) => update("carbonyl", e.target.value)}
          >
            <option value="0">No separate O chosen</option>
            <option value="1">Separate O with single C–O bond</option>
            <option value="2">Separate O with double C=O bond</option>
          </select>
          {d.hydroxyl === "no" && d.oxygenH === "yes" && (
            <p role="status">
              The chosen oxygen H is retained while its oxygen is absent; it is
              not counted as an attached atom until you restore that C–O
              attachment.
            </p>
          )}
          <OrganicDisplayed
            contextLabel={contextLabel}
            n={Number(d.n)}
            board={d}
            onToggle={disabled ? undefined : toggle}
          />
          <OrganicHydrogens
            n={Number(d.n)}
            board={d}
            onToggle={toggle}
            disabled={disabled}
          />
          <p>
            Your active proposal contains {count.C} C, {count.H} H and {count.O}{" "}
            O atoms. Check every local bond order and the requested functional
            group using the review criteria.
          </p>
        </>
      ) : (
        <p>No carbon scaffold chosen.</p>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(JSON.stringify(emptyOrganicDrawing()))}
      >
        Clear this organic construction
      </button>
    </section>
  );
}
