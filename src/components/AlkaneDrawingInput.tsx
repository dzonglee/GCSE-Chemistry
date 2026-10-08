"use client";
import { useId } from "react";
import { AlkaneDisplayed, AttachmentButtons } from "./AlkaneDisplayed";
import {
  emptyAlkaneDrawing,
  readAlkaneDrawing,
  drawingHydrogens,
  type AlkaneDrawingData,
} from "../lib/alkane-drawing";
export function AlkaneDrawingInput({
  value,
  onChange,
  drawing,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  drawing: AlkaneDrawingData;
  disabled?: boolean;
}) {
  const uid = useId(),
    b = readAlkaneDrawing(value);
  if (!b)
    return (
      <div role="status">
        <p>
          Your saved drawing cannot be displayed in this format. The original
          response is retained.
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(JSON.stringify(emptyAlkaneDrawing()))}
        >
          Start a new molecular drawing
        </button>
      </div>
    );
  const save = (key: string, v: string) =>
    onChange(JSON.stringify({ ...b, [key]: v }));
  return (
    <section
      className="alkane-drawing"
      aria-label="Molecular structure construction"
    >
      <p>{drawing.note}</p>
      <label htmlFor={uid + "-n"}>
        Choose the number of carbon atoms in your scaffold
      </label>
      <select
        id={uid + "-n"}
        value={b.n}
        disabled={disabled}
        onChange={(e) => save("n", e.target.value)}
      >
        <option value="">Choose your carbon count</option>
        {Array.from({ length: drawing.maxCarbons }, (_, i) => (
          <option key={i} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
      <p>
        Construct every hydrogen attachment and covalent bond. Positions in the
        displayed drawing are schematic; the response receives no automatic
        examiner mark. Changing carbon count retains your saved attachment
        choices, including hidden choices for later carbons.
      </p>
      {b.n ? (
        <>
          <AlkaneDisplayed
            n={Number(b.n)}
            flags={b}
            onToggle={
              disabled
                ? undefined
                : (key) => save(key, b[key] === "yes" ? "no" : "yes")
            }
          />
          <AttachmentButtons
            n={Number(b.n)}
            flags={b}
            onToggle={(key) => save(key, b[key] === "yes" ? "no" : "yes")}
            disabled={disabled}
          />
          <p>
            Your active drawing contains {b.n} carbon atoms and{" "}
            {drawingHydrogens(b)} attached hydrogen atoms.
          </p>
        </>
      ) : (
        <p>No carbon scaffold chosen.</p>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(JSON.stringify(emptyAlkaneDrawing()))}
      >
        Clear this molecular construction
      </button>
    </section>
  );
}
