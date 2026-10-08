"use client";
import type { Question } from "@/content/types";
import { BondModelDiagram } from "./BondModelDiagram";
export function MolecularLineConstructionInput({
  question,
  value,
  onChange,
  disabled = false,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const values: Record<string, string> = {};
  try {
    const parsed = JSON.parse(value || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      for (const [key, entry] of Object.entries(parsed))
        if (
          question.parts!.some((p) => p.id === key) &&
          typeof entry === "string"
        )
          values[key] = entry;
  } catch {}
  const orders = question.parts!.map((p) =>
    values[p.id]?.trim() ? Number(values[p.id]) : NaN,
  );
  const drawable = orders.every((n) => Number.isInteger(n) && n >= 0 && n <= 3);
  return (
    <>
      <fieldset className="molecular-line-controls" disabled={disabled}>
        <legend>Construct your bond-line diagram</legend>
        {question.parts!.map((part) => (
          <label key={part.id}>
            {part.label}
            <input
              aria-label={part.label}
              type="text"
              inputMode="numeric"
              value={values[part.id] ?? ""}
              onChange={(e) =>
                onChange(
                  JSON.stringify({ ...values, [part.id]: e.target.value }),
                )
              }
            />
          </label>
        ))}
      </fieldset>
      {drawable ? (
        <BondModelDiagram
          molecule={question.molecularLineDrawing!.molecule}
          proposedOrders={orders}
        />
      ) : (
        <p className="position-caption">
          Enter every whole line count, including zeros, to show your proposed
          diagram. Your entries remain unchanged.
        </p>
      )}
    </>
  );
}
