import {
  readableIonEquation,
  ionEquationDraftMessage,
  ionWritingPrefix,
} from "./ion-equation-writing";
import { markGasDrawing, describeGasDrawing } from "./gas-tests-drawing";
import {
  markChromaDrawing,
  describeChromaDrawing,
} from "./chromatography-drawing";
import { readPurityDrawing, describePurityDrawing } from "./purity-drawing";
import { readNaturalDrawing, describeNaturalDrawing } from "./natural";
import { readPathwayDrawing, describePathwayDrawing } from "./pathway-board";
import {
  readPolymerisationDrawing,
  blankPolymerisationDrawing,
} from "./polymerisation-board";
import {
  readPolyesterResponse,
  blankPolyesterResponse,
  describePolyesterResponse,
} from "./condensation-drawing";
import {
  describeOrganicDrawing,
  readOrganicDrawing,
  emptyOrganicDrawing,
} from "./organic-drawing";
import { readTangentDrawing } from "./tangent-drawing";
import { describeFuelDrawing, readFuelDrawing } from "./fuel-drawing";
import { describeAlkeneDrawing } from "./alkene-drawing";
import { describeAlkaneDrawing } from "./alkane-drawing";
import { readOilBarDrawing } from "./oil-bar-drawing";
import {
  readProfileDrawing,
  drawingLevels,
  markProfileDrawing,
  profileChoices,
} from "./reaction-profiles";
import { markHalfEquation } from "./half-equations";
import { readPolymerDrawing } from "./polymer-structures";
import type { Question } from "@/content/types";
import { readHaberDrawing } from "./haber-drawing";
import { readArrangement } from "./shells";
import { normaliseFormula } from "./ionic-formulae";
export const roundingLabel = (rounding: NonNullable<Question["rounding"]>) =>
  `${rounding.digits} ${rounding.kind === "decimal-places" ? "decimal place" : "significant figure"}${rounding.digits === 1 ? "" : "s"}`;
export function readNumber(raw: string): number | null {
  const text = raw.trim().replace(/−/g, "-");
  const numeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
  if (numeric.test(text)) {
    const value = Number(text);
    return Number.isFinite(value) ? value : null;
  }
  const parts = text.split("/");
  if (parts.length === 2 && parts.every((p) => numeric.test(p.trim()))) {
    const den = Number(parts[1]);
    const result = Number(parts[0]) / den;
    return den !== 0 && Number.isFinite(result) ? result : null;
  }
  return null;
}
export function reviewSubject(q: Question) {
  if (q.writtenEquations) return "equations";
  if (q.tangentDrawing) return "tangent";
  return q.gasDrawing
    ? "gas-test diagram"
    : q.chromatographyDrawing
      ? "chromatography proposal"
      : q.purityDrawing
        ? "separation proposal"
        : q.fuelDrawing || q.haberDrawing
          ? "graph"
          : q.naturalDrawing ||
              q.pathwayDrawing ||
              q.organicDrawing ||
              q.polymerisationDrawing ||
              q.polyesterDrawing
            ? "structure"
            : "explanation";
}
export function mark(
  q: Question,
  raw: string,
): {
  correct: boolean;
  feedback: string;
  empty: boolean;
  invalid?: boolean;
  selfReview?: boolean;
} {
  if (!raw.trim())
    return {
      correct: false,
      feedback: "Enter or choose an answer before checking.",
      empty: true,
    };
  if (
    q.writtenEquations &&
    q.id.startsWith(ionWritingPrefix) &&
    !readableIonEquation(raw)
  )
    return {
      correct: false,
      empty: false,
      invalid: true,
      feedback: ionEquationDraftMessage,
    };
  if (q.gasDrawing) return markGasDrawing(raw, q.gasDrawing);
  if (q.tangentDrawing) {
    const drawing = readTangentDrawing(raw);
    if (!drawing)
      return {
        correct: false,
        empty: false,
        invalid: true,
        feedback:
          "Saved tangent cannot be read. Its original response is retained; clear explicitly to start again.",
      };
    if (Object.values(drawing).every((value) => !value.trim()))
      return {
        correct: false,
        empty: true,
        feedback: "Enter a tangent coordinate before saving your construction.",
      };
  }
  for (const [drawing, blank] of [
    q.organicDrawing ? [readOrganicDrawing(raw), emptyOrganicDrawing()] : [],
    q.polymerisationDrawing
      ? [readPolymerisationDrawing(raw), blankPolymerisationDrawing()]
      : [],
    q.polyesterDrawing
      ? [
          readPolyesterResponse(raw, q.polyesterDrawing),
          blankPolyesterResponse(q.polyesterDrawing),
        ]
      : [],
  ]) {
    if (
      drawing &&
      blank &&
      Object.entries(blank).every(([key, value]) => drawing[key] === value)
    )
      return {
        correct: false,
        empty: true,
        feedback: "Make a structure choice before saving your construction.",
      };
  }
  if (q.chromatographyDrawing)
    return markChromaDrawing(raw, q.chromatographyDrawing);
  if (q.fuelDrawing) {
    const b = readFuelDrawing(raw, q.fuelDrawing.data);
    if (!b)
      return {
        correct: false,
        empty: false,
        invalid: true,
        feedback:
          "Saved graph cannot be read. Its original response is retained; clear explicitly to start again.",
      };
    if (Object.values(b).every((v) => !v.trim()))
      return {
        correct: false,
        empty: true,
        feedback:
          "Enter an observation coordinate or fit proposal before saving.",
      };
  }
  if (q.haberDrawing) {
    const b = readHaberDrawing(raw);
    if (!b)
      return {
        correct: false,
        empty: false,
        invalid: true,
        feedback:
          "Saved graph construction cannot be read. Its original bytes are retained; clear explicitly to start again.",
      };
    if (Object.values(b).every((v) => !v.trim()))
      return {
        correct: false,
        empty: true,
        feedback: "Choose a scale or enter a graph point before saving.",
      };
    return {
      correct: false,
      empty: false,
      selfReview: true,
      feedback:
        "Graph saved for manual review. Compare axes, plotted observations and your separate smooth best-fit curve with the criteria; no automatic exam mark is awarded.",
    };
  }
  if (q.purityDrawing) {
    const drawing = readPurityDrawing(q.purityDrawing, raw);
    if (!drawing)
      return {
        correct: false,
        empty: false,
        invalid: true,
        feedback:
          "The retained separation proposal cannot be read. Its original bytes have not been repaired.",
      };
    if (
      Object.entries(drawing)
        .filter(([key]) => key !== "record")
        .every(([, value]) => value === "")
    )
      return {
        correct: false,
        empty: true,
        feedback:
          "Make a proposal before saving; unchosen fields do not constitute a drawing response.",
      };
  }
  if (
    (q.naturalDrawing && !readNaturalDrawing(raw, q.naturalDrawing)) ||
    (q.pathwayDrawing && !readPathwayDrawing(raw)) ||
    (q.polymerisationDrawing && !readPolymerisationDrawing(raw)) ||
    (q.polyesterDrawing && !readPolyesterResponse(raw, q.polyesterDrawing))
  )
    return {
      correct: false,
      empty: false,
      invalid: true,
      feedback:
        "The saved structure cannot be read. Its original bytes are retained; start a new construction explicitly to continue.",
    };
  if (q.rubric)
    return {
      correct: false,
      empty: false,
      selfReview: true,
      feedback:
        q.writtenEquations ||
        q.purityDrawing ||
        q.tangentDrawing ||
        q.naturalDrawing ||
        q.pathwayDrawing ||
        q.organicDrawing ||
        q.fuelDrawing ||
        q.polymerisationDrawing ||
        q.polyesterDrawing
          ? `Response saved. Compare your ${reviewSubject(q)} with the review criteria below, then correct any missing or misplaced features. This is self-review; no automatic mark is awarded.`
          : "Response saved. Compare your explanation with the marking points below, then improve any missing points. This is self-review, not an automatic mark.",
    };
  if (q.profileDrawing) {
    const drawing = readProfileDrawing(raw),
      levels = drawing && drawingLevels(drawing);
    const valid =
      !!drawing &&
      !!levels &&
      drawing.activationArrow !== "unset" &&
      drawing.overallArrow !== "unset" &&
      profileChoices.arrows.activationArrow.includes(drawing.activationArrow) &&
      profileChoices.arrows.overallArrow.includes(drawing.overallArrow);
    const correct = valid && markProfileDrawing(raw, q.answer);
    return {
      correct,
      empty: false,
      invalid: !valid,
      feedback: correct
        ? q.explanation
        : !valid
          ? "Enter all three levels on the stated scale and choose both arrows. Your entries are retained."
          : "Check your endpoint levels, peak and selected arrow spans. " +
            q.hint,
    };
  }
  if (q.electronEquation) {
    const result = markHalfEquation(
      q.electronEquation.reaction,
      raw,
      q.electronEquation.simplest,
    );
    return {
      ...result,
      empty: false,
      feedback: result.correct ? q.explanation : result.feedback,
    };
  }
  if (q.chemicalFormula) {
    const formula = normaliseFormula(raw);
    const correct = formula === normaliseFormula(q.answer);
    const valid = /^[A-Za-z0-9()]+$/.test(formula);
    return {
      correct,
      empty: false,
      invalid: !valid,
      feedback: correct
        ? q.explanation
        : (q.misconceptions?.[formula] ??
          (valid
            ? "Check chemical capitals, whole-ion groups and the simplest ratio. " +
              q.hint
            : "Write the neutral compound formula using element symbols, numbers and parentheses. Preserve capitals, for example Ca(NO3)2; subscripts are also accepted.")),
    };
  }
  if (q.arrangement) {
    const counts = readArrangement(raw);
    if (!counts)
      return {
        correct: false,
        empty: false,
        invalid: true,
        feedback:
          "Enter whole electron counts from the inner shell outward, such as 2,8,1 or 2.8.1. This lesson covers at most 20 electrons.",
      };
    const correct =
      counts.length === q.arrangement.length &&
      counts.every((n, i) => n === q.arrangement![i]);
    return {
      correct,
      empty: false,
      feedback: correct
        ? q.explanation
        : (q.misconceptions?.[counts.join(",")] ??
          `Your counts contain ${counts.reduce((a, b) => a + b, 0)} electrons. ${q.hint}`),
    };
  }
  if (q.polymerRepeatDrawing) {
    const b = readPolymerDrawing(raw);
    if (!b)
      return {
        correct: false,
        empty: false,
        invalid: true,
        feedback:
          "Complete the four diagram choices using the available options.",
      };
    const correct =
      b.bondOrder === "1" &&
      b.hydrogens === "2" &&
      b.continuation === "1" &&
      b.countMark === "1";
    return {
      correct,
      empty: false,
      feedback: correct
        ? q.explanation
        : "Your proposed drawing is retained. " + q.hint,
    };
  }
  if (q.parts) {
    let values: Record<string, string>;
    try {
      values = JSON.parse(raw);
    } catch {
      return {
        correct: false,
        empty: false,
        invalid: true,
        feedback: "Complete each answer field with a number.",
      };
    }
    if (
      !values ||
      typeof values !== "object" ||
      Array.isArray(values) ||
      Object.entries(values).some(
        ([key, value]) =>
          !q.parts!.some((part) => part.id === key) ||
          typeof value !== "string",
      ) ||
      q.parts.some(
        (part) =>
          typeof values[part.id] !== "string" ||
          readNumber(values[part.id]) === null,
      )
    )
      return {
        correct: false,
        empty: false,
        invalid: true,
        feedback: "Complete each answer field with a number.",
      };
    const wrong = q.parts.find(
      (part) => readNumber(values[part.id]) !== part.answer,
    );
    return {
      correct: !wrong,
      empty: false,
      feedback: wrong ? `Revisit ${wrong.label}. ${q.hint}` : q.explanation,
    };
  }
  const value = q.options ? null : readNumber(raw);
  const numericCorrect = q.options
    ? raw === q.answer
    : value !== null &&
      (q.acceptedRange
        ? Number.isFinite(q.acceptedRange.min) &&
          Number.isFinite(q.acceptedRange.max) &&
          q.acceptedRange.min < q.acceptedRange.max &&
          (q.acceptedRange.exclusive
            ? value > q.acceptedRange.min && value < q.acceptedRange.max
            : value >= q.acceptedRange.min && value <= q.acceptedRange.max)
        : Math.abs(value - Number(q.answer)) <= (q.tolerance ?? 0.000001));
  let precisionCorrect = true;
  if (q.rounding) {
    const decimal = raw.trim().replace(/−/g, "-");
    const plain = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(decimal);
    const digits =
      q.rounding.kind === "decimal-places"
        ? (decimal.split(".")[1]?.length ?? 0)
        : decimal.replace(/[+\-.]/g, "").replace(/^0+/, "").length;
    precisionCorrect = plain && digits === q.rounding.digits;
  }
  const correct = numericCorrect && precisionCorrect;
  if (numericCorrect && !precisionCorrect)
    return {
      correct: false,
      empty: false,
      feedback: `Your numerical value is right. Write a decimal number to ${roundingLabel(q.rounding!)}, retaining any required trailing zero.`,
    };
  const feedback = correct
    ? q.explanation
    : (q.misconceptions?.[raw] ??
      (!q.options && value !== null
        ? Object.entries(q.misconceptions ?? {}).find(
            ([candidate]) => readNumber(candidate) === value,
          )?.[1]
        : undefined) ??
      (q.options
        ? "That choice does not match the chemistry. " + q.hint
        : value === null
          ? "Enter a number only, such as 0.5, 1/2 or 5e-1. The unit is shown beside the input."
          : "Check the quantities and their units. " + q.hint));
  return {
    correct,
    feedback,
    empty: false,
    invalid: !q.options && value === null,
  };
}
const diagramPartValue = (q: Question, id: string, value: unknown) => {
  if (value === undefined || value === null || value === "") return "No answer";
  if (
    q.drawDotCross &&
    id === "brackets" &&
    (String(value) === "0" || String(value) === "1")
  )
    return String(value) === "1" ? "included" : "omitted";
  if (q.drawDotCross && id === "charge") {
    const charge = readNumber(String(value));
    if (charge !== null)
      return charge === 0
        ? "0"
        : `${Math.abs(charge)}${charge > 0 ? "+" : "−"}`;
  }
  return String(value);
};
export const canonicalAnswer = (q: Question) =>
  q.parts
    ? q.parts
        .map(
          (part) =>
            `${part.label}: ${diagramPartValue(q, part.id, part.answer)}`,
        )
        .join("; ")
    : q.rubric
      ? "Compare your response with the marking points."
      : q.acceptedRange
        ? `Any value ${q.acceptedRange.exclusive ? "strictly between" : "from"} ${q.acceptedRange.min} ${q.acceptedRange.exclusive ? "and" : "to"} ${q.acceptedRange.max}${q.unit ? " " + q.unit : ""}; for example, ${q.answer}${q.unit ? " " + q.unit : ""}.`
        : q.answer + (q.unit ? " " + q.unit : "");
export function displayResponse(q: Question, raw: string) {
  if (!raw.trim()) return "No answer";
  if (q.tangentDrawing) {
    const b = readTangentDrawing(raw);
    return b
      ? `Your tangent endpoints: (${b.tx0 || "unknown"} s, ${b.ty0 || "unknown"} ${q.tangentDrawing.curve.unit}); (${b.tx1 || "unknown"} s, ${b.ty1 || "unknown"} ${q.tangentDrawing.curve.unit}). Inspect your retained construction below.`
      : "Unreadable tangent; original response retained.";
  }
  if (q.haberDrawing) {
    const b = readHaberDrawing(raw);
    return b
      ? `Axes: pressure0–${b.xMax || "unknown"} atm in${b.xStep || "unknown"} atm steps; yield0–${b.yMax || "unknown"}% in${b.yStep || "unknown"} percentage-point steps. Observations: ${q.haberDrawing.points.map((_, i) => `(${b["p" + i + "x"] || "unknown"},${b["p" + i + "y"] || "unknown"})`).join("; ")}. Curve controls: ${q.haberDrawing.points.map((p, i) => `${p[0]} atm: ${b["c" + i] || "unknown"}%`).join("; ")}.`
      : "Unreadable graph; original response retained.";
  }
  if (q.gasDrawing) return describeGasDrawing(raw, q.gasDrawing);
  if (q.chromatographyDrawing)
    return describeChromaDrawing(raw, q.chromatographyDrawing);
  if (q.purityDrawing) return describePurityDrawing(q.purityDrawing, raw);
  if (q.naturalDrawing) return describeNaturalDrawing(raw, q.naturalDrawing);
  if (q.pathwayDrawing) return describePathwayDrawing(raw);
  if (q.polyesterDrawing)
    return describePolyesterResponse(raw, q.polyesterDrawing);
  if (q.polymerisationDrawing)
    return raw
      ? "Saved structure — inspect the retained drawing below."
      : "No structure saved.";
  if (q.organicDrawing) return describeOrganicDrawing(raw);
  if (q.fuelDrawing) return describeFuelDrawing(raw, q.fuelDrawing.data);
  if (q.alkeneDrawing) return describeAlkeneDrawing(raw);
  if (q.alkaneDrawing) return describeAlkaneDrawing(raw);
  if (q.oilBarDrawing) {
    const b = readOilBarDrawing(raw);
    if (!b)
      return "Saved chart cannot be displayed; original response retained";
    return `Major interval: ${b.step || "not entered"} percentage points; source A: ${b.placedA === "yes" ? b.vA + "% placed" : "not placed"}; source B: ${b.placedB === "yes" ? b.vB + "% placed" : "not placed"}. Pending edits are retained separately.`;
  }
  if (!q.parts) return raw;
  try {
    const values = JSON.parse(raw);
    return q.parts
      .map(
        (part) =>
          `${part.label}: ${diagramPartValue(q, part.id, values?.[part.id])}`,
      )
      .join("; ");
  } catch {
    return "Unreadable answer fields";
  }
}
