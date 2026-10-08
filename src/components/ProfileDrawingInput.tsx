"use client";
import {
  emptyProfileDrawing,
  readProfileDrawing,
  drawingLevels,
  profileChoices,
  type ProfileDrawing,
} from "@/lib/reaction-profiles";
import { ReactionProfile } from "./ReactionProfile";
const labels: Record<string, string> = {
  "reactants-peak": "Reactants → peak",
  "products-peak": "Products → peak",
  "zero-peak": "Zero reference → peak",
  "reactants-products": "Reactants → products",
  "products-reactants": "Products → reactants",
  "peak-products": "Peak → products",
  unset: "Choose an arrow",
};
export function ProfileDrawingInput({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const b = readProfileDrawing(value) ?? emptyProfileDrawing(),
    levels = drawingLevels(b);
  const change = (key: keyof ProfileDrawing, v: string) =>
    onChange(JSON.stringify({ ...b, [key]: v }));
  return (
    <fieldset className="profile-drawing-input" disabled={disabled}>
      <legend>Your constructed energy diagram</legend>
      <p>
        Enter your three levels and choose both arrow spans. The curve and
        labels follow your entries. No answer is checked here.
      </p>
      {(["reactant", "product", "peak"] as const).map((k) => (
        <label key={k}>
          Your drawn{" "}
          {k === "reactant" ? "reactant" : k === "product" ? "product" : "peak"}{" "}
          level / kJ
          <input
            aria-label={
              "Your drawn " +
              (k === "reactant"
                ? "reactant"
                : k === "product"
                  ? "product"
                  : "peak") +
              " level / kJ"
            }
            inputMode="numeric"
            value={b[k]}
            onChange={(e) => change(k, e.target.value)}
            autoComplete="off"
          />
        </label>
      ))}
      {(["activationArrow", "overallArrow"] as const).map((k) => (
        <label key={k}>
          {k === "activationArrow"
            ? "Your drawn activation arrow"
            : "Your drawn overall-change arrow"}
          <select
            aria-label={
              k === "activationArrow"
                ? "Your drawn activation arrow"
                : "Your drawn overall-change arrow"
            }
            value={b[k]}
            onChange={(e) => change(k, e.target.value)}
          >
            {profileChoices.arrows[k].map((v) => (
              <option key={v} value={v}>
                {labels[v]}
              </option>
            ))}
          </select>
          <span className="metal-selected">
            Selected: {labels[b[k]] ?? "Unrecognised saved choice"}
          </span>
        </label>
      ))}
      {levels ? (
        <ReactionProfile
          profile={{ ...levels, max: 240, step: 40 }}
          constructed
          activationArrow={b.activationArrow}
          overallArrow={b.overallArrow}
        />
      ) : (
        <p className="position-caption">
          The preview needs three levels on this 0–240 kJ scale, in steps of 5
          kJ. Your entries are retained.
        </p>
      )}
    </fieldset>
  );
}
