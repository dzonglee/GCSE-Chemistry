import type { LearningTask } from "../types";
import type { PurityDrawingData } from "../../lib/purity-drawing";
import type { PurityMode, PurityFocus } from "../../lib/purity-domain";
export type PurityTask = Omit<LearningTask, "model"> & {
  purityDrawing?: PurityDrawingData;
  model?: {
    kind: "purity-separation";
    mode: PurityMode;
    record: string;
    focus: PurityFocus;
    instruction: string;
  };
};
export function choice(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: { mode: PurityMode; record: string; focus: PurityFocus },
): PurityTask {
  const options = [answer, ...Object.keys(errors)],
    offset =
      [...id].reduce((sum, c) => sum + c.charCodeAt(0), 0) % options.length;
  return {
    id: "purity-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    ...(model
      ? { model: { kind: "purity-separation", ...model, instruction: title } }
      : {}),
  };
}
export function number(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  unit: string,
  explanation: string,
  hint: string,
  model?: { mode: PurityMode; record: string; focus: PurityFocus },
): PurityTask {
  return {
    id: "purity-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    unit,
    tolerance: 0,
    explanation,
    hint,
    ...(model
      ? { model: { kind: "purity-separation", ...model, instruction: title } }
      : {}),
  };
}

export function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
): PurityTask {
  return {
    id: "purity-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    rubric,
    hint,
  };
}
export function drawing(
  id: string,
  title: string,
  prompt: string,
  data: PurityDrawingData,
  answer: string,
  rubric: string[],
): PurityTask {
  return {
    ...written(
      id,
      title,
      prompt,
      answer,
      rubric,
      "Use the original supplied properties to propose each component and output. Preserve your own arrangement before comparing a separate reference.",
    ),
    purityDrawing: data,
  };
}
export function ratio(
  id: string,
  title: string,
  prompt: string,
  leftLabel: string,
  rightLabel: string,
  left: number,
  right: number,
  explanation: string,
  hint: string,
): PurityTask {
  return {
    id: "purity-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer: JSON.stringify({ left: String(left), right: String(right) }),
    explanation,
    hint,
    parts: [
      { id: "left", label: leftLabel, answer: left, inputMode: "numeric" },
      { id: "right", label: rightLabel, answer: right, inputMode: "numeric" },
    ],
    partLegend: "Give the simplest whole-number ratio in the stated order.",
  };
}
