"use client";
import { useId } from "react";
import { AlkeneDisplayed, AttachmentButtons } from "./AlkeneDisplayed";
import {
  readAlkeneDrawing,
  emptyAlkeneDrawing,
  activeAlkeneDouble,
  alkeneDrawingHydrogens,
  type AlkeneDrawingData,
} from "@/lib/alkene-drawing";
export function AlkeneDrawingInput({
  value,
  onChange,
  drawing,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  drawing: AlkeneDrawingData;
  disabled?: boolean;
}) {
  const uid = useId(),
    b = readAlkeneDrawing(value);
  if (!b)
    return (
      <div role="status">
        <p>
          Your saved alkene drawing cannot be displayed in this format. The
          original response is retained.
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(JSON.stringify(emptyAlkeneDrawing()))}
        >
          Start a new alkene drawing
        </button>
      </div>
    );
  const save = (k: string, v: string) =>
      onChange(JSON.stringify({ ...b, [k]: v })),
    n = Number(b.n),
    d = activeAlkeneDouble(b);
  return (
    <section
      className="alkene-drawing"
      aria-label="Alkene structure construction"
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
        {Array.from({ length: drawing.maxCarbons - 1 }, (_, i) => (
          <option key={i} value={i + 2}>
            {i + 2}
          </option>
        ))}
      </select>
      <label htmlFor={uid + "-double"}>
        Choose your carbon–carbon double-bond position
      </label>
      <select
        id={uid + "-double"}
        disabled={disabled || !n}
        value={b.double}
        onChange={(e) => save("double", e.target.value)}
      >
        <option value="">No C=C chosen</option>
        {Array.from({ length: Math.max(0, n - 1) }, (_, i) => (
          <option key={i} value={i}>
            C{i + 1}–C{i + 2}
          </option>
        ))}
        {b.double !== "" && Number(b.double) >= n - 1 && (
          <option value={b.double}>
            Retained C{Number(b.double) + 1}–C{Number(b.double) + 2}, outside
            this scaffold
          </option>
        )}
      </select>
      <p>
        Choose the scaffold, C=C and every H attachment yourself. All bond lines
        are shown. Displayed positions are conventions, not bond angles. Your
        structure is self-reviewed after submission, with no automatic examiner
        mark. Changing scaffold size retains hidden H and double-bond choices.
      </p>
      {n ? (
        <>
          <AlkeneDisplayed
            n={n}
            double={d}
            flags={b}
            onToggle={
              disabled
                ? undefined
                : (k) => save(k, b[k] === "yes" ? "no" : "yes")
            }
          />
          <AttachmentButtons
            n={n}
            flags={b}
            onToggle={(k) => save(k, b[k] === "yes" ? "no" : "yes")}
            disabled={disabled}
          />
          <p>
            Your active proposal contains {n} carbon atoms and{" "}
            {alkeneDrawingHydrogens(b)} attached H atoms.
          </p>
          {b.double !== "" && d === null && (
            <p role="status">
              Your saved C=C choice is outside this smaller scaffold. Choose a
              location here or restore its original size; the saved choice is
              retained.
            </p>
          )}
        </>
      ) : (
        <p>No carbon scaffold chosen.</p>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(JSON.stringify(emptyAlkeneDrawing()))}
      >
        Clear this alkene construction
      </button>
    </section>
  );
}
