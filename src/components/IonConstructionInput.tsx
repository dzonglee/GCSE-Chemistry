"use client";
import type { Question } from "@/content/types";
import { IonDotCross } from "./IonDotCross";
export function IonConstructionInput({
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
  const values: Record<string, string> = {};
  try {
    const parsed = JSON.parse(value || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [key, entry] of Object.entries(parsed)) {
        if (
          ["dots", "crosses", "charge", "brackets"].includes(key) &&
          typeof entry === "string"
        )
          values[key] = entry;
      }
    }
  } catch {}
  const set = (key: string, next: string) =>
    onChange(JSON.stringify({ brackets: "0", ...values, [key]: next }));
  const dots = values.dots?.trim() ? Number(values.dots) : NaN,
    crosses = values.crosses?.trim() ? Number(values.crosses) : NaN,
    charge = values.charge?.trim() ? Number(values.charge) : NaN;
  const drawable =
    Number.isInteger(dots) &&
    dots >= 0 &&
    dots <= 12 &&
    Number.isInteger(crosses) &&
    crosses >= 0 &&
    crosses <= 12 &&
    Number.isInteger(charge) &&
    Math.abs(charge) <= 3;
  return (
    <>
      <fieldset className="ion-construction-controls" disabled={disabled}>
        <legend>Construct your own ion diagram</legend>
        <label>
          Original non-metal electrons (dots)
          <input
            type="number"
            min="0"
            max="12"
            step="1"
            inputMode="numeric"
            value={values.dots ?? ""}
            onChange={(e) => set("dots", e.target.value)}
          />
        </label>
        <label>
          Transferred metal electrons (crosses)
          <input
            type="number"
            min="0"
            max="12"
            step="1"
            inputMode="numeric"
            value={values.crosses ?? ""}
            onChange={(e) => set("crosses", e.target.value)}
          />
        </label>
        <label>
          Ion charge
          <select
            aria-label="Ion charge"
            value={values.charge ?? ""}
            onChange={(e) => set("charge", e.target.value)}
          >
            <option value="">Choose a charge</option>
            {[-3, -2, -1, 0, 1, 2, 3].map((c) => (
              <option key={c} value={c}>
                {c === 0 ? "0 (neutral)" : `${Math.abs(c)}${c > 0 ? "+" : "−"}`}
              </option>
            ))}
          </select>
        </label>
        <label className="ion-bracket-choice">
          <input
            type="checkbox"
            checked={values.brackets === "1"}
            onChange={(e) => set("brackets", e.target.checked ? "1" : "0")}
          />
          Draw square brackets
        </label>
      </fieldset>
      <div
        className="ion-construction-preview"
        aria-label="Your proposed diagram"
      >
        {drawable ? (
          <IonDotCross
            symbol={question.drawDotCross!.symbol}
            charge={charge}
            dots={dots}
            crosses={crosses}
            proposed
            showBrackets={values.brackets === "1"}
          />
        ) : (
          <p>
            Enter your dot and cross counts and choose a charge to draw your
            proposed diagram. It shows your choices, including mistakes.
          </p>
        )}
      </div>
    </>
  );
}
