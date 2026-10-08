import type { GasMode } from "../../lib/gas-tests-cases";
import type { GasFocus } from "../../lib/gas-tests-domain";
import type { GasDrawingData } from "../../lib/gas-tests-drawing";
import type { GasGivenData } from "../../lib/gas-tests-givens";
export type GasTask = {
  id: string;
  title: string;
  purpose: string;
  prompt: string;
  answer: string;
  explanation: string;
  hint: string;
  options?: string[];
  misconceptions?: Record<string, string>;
  rubric?: string[];
  exposureAliases?: string[];
  followUp?: string;
  gasDrawing?: GasDrawingData;
  gasGiven?: GasGivenData;
  model?: {
    kind: "gas-test-investigation";
    mode: GasMode;
    record: string;
    focus: GasFocus;
    instruction: string;
  };
};
type Model = { mode: GasMode; record: string; focus: GasFocus };
function base(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  explanation: string,
  hint: string,
  model?: Model,
): GasTask {
  return {
    id: "gas-tests-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    explanation,
    hint,
    ...(model
      ? {
          model: {
            kind: "gas-test-investigation",
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
): GasTask {
  const options = [answer, ...Object.keys(errors)],
    offset =
      [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      options.length;
  return {
    ...base(id, title, prompt, answer, explanation, hint, model),
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
  };
}
export function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
): GasTask {
  return { ...base(id, title, prompt, answer, answer, hint), rubric };
}
export function drawing(
  id: string,
  title: string,
  prompt: string,
  data: GasDrawingData,
  answer: string,
  rubric: string[],
): GasTask {
  return {
    ...written(
      id,
      title,
      prompt,
      answer,
      rubric,
      "Add your own placement and labels. A separate reference appears only after checking or whole-set submission.",
    ),
    gasDrawing: data,
  };
}
