"use client";
import type { Question } from "@/content/types";
import { covalentMolecules } from "@/lib/covalent";
import { CovalentDiagram } from "./CovalentDiagram";
export function CovalentConstructionInput({
  question,
  value,
  onChange,
  disabled = false,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const molecule = question.drawCovalent!.molecule,
    spec = covalentMolecules[molecule],
    values: Record<string, string> = {};
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
  const count = (key: string) =>
    values[key]?.trim() ? Number(values[key]) : NaN;
  const drawable = question.parts!.every(
    (part) =>
      Number.isInteger(count(part.id)) &&
      count(part.id) >= 0 &&
      count(part.id) <= (part.id.startsWith("unshared") ? 8 : 3),
  );
  const field = (id: string) => {
    const part = question.parts!.find((part) => part.id === id)!;
    return (
      <label key={part.id} data-field={part.id}>
        {part.label}
        <input
          type="number"
          inputMode="numeric"
          min="0"
          max={part.id.startsWith("unshared") ? 8 : 3}
          step="1"
          aria-label={part.label}
          value={values[part.id] ?? ""}
          onChange={(e) =>
            onChange(JSON.stringify({ ...values, [part.id]: e.target.value }))
          }
        />
      </label>
    );
  };
  return (
    <>
      <fieldset className="covalent-construction-controls" disabled={disabled}>
        <legend>Construct outer-electron diagram</legend>
        <p className="position-caption">
          Enter electron counts, not pairs. Dots and crosses show origins.
        </p>
        {field("unsharedCentre")}
        {spec.partners.map((atom, i) => (
          <div
            key={i}
            className="covalent-construction-bond"
            role="group"
            aria-label={`Bond ${i + 1} electron counts`}
          >
            <h3>
              Bond {i + 1}: {spec.centre.symbol} and {atom.symbol}
            </h3>
            {field(`centre${i}`)}
            {field(`partner${i}`)}
            {field(`unsharedPartner${i}`)}
          </div>
        ))}
      </fieldset>
      {drawable ? (
        <CovalentDiagram
          molecule={molecule}
          own={spec.partners.map((_, i) => count(`centre${i}`))}
          other={spec.partners.map((_, i) => count(`partner${i}`))}
          unshared={count("unsharedCentre")}
          partnerUnshared={spec.partners.map((_, i) =>
            count(`unsharedPartner${i}`),
          )}
        />
      ) : (
        <p className="position-caption">
          Enter every whole count, including zeros, to show your proposed
          diagram. Wrong counts will remain visible rather than being corrected
          automatically.
        </p>
      )}
    </>
  );
}
