import type { LearningTask, LessonJourney, TaskModel } from "../types";
export function choice(
  id: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  purpose: string,
  model?: TaskModel,
): LearningTask {
  const options = [answer, ...Object.keys(errors)];
  const offset =
    [...id].reduce((total, char) => total + char.charCodeAt(0), 0) %
    options.length;
  return {
    id,
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    purpose,
    model,
  };
}
export function number(
  id: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  purpose: string,
  errors: Record<string, string> = {},
  model?: TaskModel,
): LearningTask {
  return {
    id,
    prompt,
    answer: String(answer),
    unit,
    explanation,
    hint,
    purpose,
    misconceptions: errors,
    model,
  };
}
export function tasks(journey: LessonJourney): LearningTask[] {
  return [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
}
