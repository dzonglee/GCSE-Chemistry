import { formulaCounts } from "./formula-mass";

export const ionWritingPrefix = "ion-tests-v1-write-";
export const ionEquationDraftMessage =
  "Write a readable symbol equation with an arrow and formulas on both sides. Your raw draft stays saved; incomplete syntax cannot be recorded.";

/** Syntax only: a readable but scientifically wrong equation must remain recordable.
 * No balance, product, state or spectator answer is automatically marked here.
 * Additional written interpretation is reviewed manually, not parsed as a score.
 */
export function readableIonEquation(raw: string): boolean {
  if (!raw.trim() || raw.length > 4096) return false;
  const subscripts = "₀₁₂₃₄₅₆₇₈₉";
  const line = raw
    .split(/\r?\n/)
    .find((line) => /→|->/.test(line))
    ?.trim()
    .replace(/^(?:Molecular|Equation):\s*/i, "")
    .replace(/[₀-₉]/g, (digit) => String(subscripts.indexOf(digit)))
    .replace(/[²³]/g, (charge) => (charge === "²" ? "^2" : "^3"))
    .replace(/[⁺⁻−]/g, (sign) => (sign === "⁺" ? "+" : "-"))
    .split(/[.;]\s+(?=[A-Za-z])/)[0]
    .replace(/[.;]\s*$/, "");
  if (!line) return false;
  const sides = line.split(/→|->/);
  if (sides.length !== 2) return false;
  try {
    for (const side of sides) {
      // Protect an adjacent positive ion charge, without consuming a reactant
      // separator. A readable ionic answer is recordable for manual review even
      // when the question requested a complete molecular representation.
      const terms = side
        .replace(/(?<=[A-Za-z0-9])\+(?=\s*(?:\((?:aq|s|l|g)\)|\+|$))/g, "@")
        .split("+")
        .map((term) => term.replaceAll("@", "+"));
      for (const term of terms) {
        const match = term.trim().match(/^(\d+(?:\.\d+)?(?:\/\d+)?\s*)?(.*)$/);
        if (!match || !match[2]) return false;
        if (match[1]) {
          const numbers = match[1].trim().split("/").map(Number);
          const coefficient = numbers[0] / (numbers[1] ?? 1);
          if (!Number.isFinite(coefficient)) return false;
        }
        const formula = match[2]
          .trim()
          .replace(/\((?:aq|s|l|g)\)$/, "")
          .replace(/\^?\d*[+-]$/, "");
        formulaCounts(formula);
      }
    }
    return true;
  } catch {
    return false;
  }
}
