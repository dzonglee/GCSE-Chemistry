import type { ChromatographyMode } from "../../lib/chromatography-cases";
import type { ChromaFocus } from "../../lib/chromatography-domain";
import type { ChromaDrawingData } from "../../lib/chromatography-drawing";
import type { ChromaGivenData } from "../../lib/chromatography-givens";
import type { LearningTask } from "../types";
export type ChromaTask = Omit<LearningTask, "model"> & {
  chromatographyDrawing?: ChromaDrawingData;
  chromatographyGiven?: ChromaGivenData;
  model?: {
    kind: "chromatography-investigation";
    mode: ChromatographyMode;
    record: string;
    focus: ChromaFocus;
    instruction: string;
  };
};
type Model = { mode: ChromatographyMode; record: string; focus: ChromaFocus };
function base(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  explanation: string,
  hint: string,
  model?: Model,
): ChromaTask {
  return {
    id: "chromatography-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    explanation,
    hint,
    ...(model
      ? {
          model: {
            kind: "chromatography-investigation",
            ...model,
            instruction: title,
          },
        }
      : {}),
  };
}
export function choice(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: Model,
): ChromaTask {
  const options = [answer, ...Object.keys(errors)],
    offset = [...id].reduce((s, c) => s + c.charCodeAt(0), 0) % options.length;
  return {
    ...base(id, title, prompt, answer, explanation, hint, model),
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
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
  model?: Model,
): ChromaTask {
  return {
    ...base(id, title, prompt, answer, explanation, hint, model),
    unit,
    tolerance: 0,
  };
}
export function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
): ChromaTask {
  return { ...base(id, title, prompt, answer, answer, hint), rubric };
}
export function drawing(
  id: string,
  title: string,
  prompt: string,
  data: ChromaDrawingData,
  answer: string,
  rubric: string[],
): ChromaTask {
  return {
    ...written(
      id,
      title,
      prompt,
      answer,
      rubric,
      "Use the fixed original dimensions and phase information. Retain your own proposal before comparing the separate reference.",
    ),
    chromatographyDrawing: data,
  };
}
