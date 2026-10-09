import type { ExamPart } from "@/content/exam-paper-types";
import type { Response } from "./progress";
import { mark } from "./marking";

export const paperReviewKey = (
  started: number,
  id: string,
  criterion: string,
) => `paper-review:${started}:${id}:${criterion}`;

/** Empty, malformed and out-of-range saved decisions remain pending. */
export function readReviewMark(
  raw: string | undefined,
  maximum: number,
): number | null {
  if (raw === undefined || !/^(0|[1-9]\d*)$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value <= maximum ? value : null;
}

export function reviewPart(
  part: ExamPart,
  response: Response | undefined,
  drafts: Record<string, string>,
  started: number,
) {
  const key = (point: string) =>
    paperReviewKey(started, part.question.id, point);
  const finalCorrect =
    !!response && mark(part.question, response.answer).correct;
  // A correct numerical answer with contradictory working is not full credit.
  // Retained working must be reviewed before the final-answer point is included.
  const automatic =
    part.automaticMarks && finalCorrect
      ? response?.working?.trim()
        ? readReviewMark(
            drafts[key("answer-with-working")],
            part.automaticMarks,
          )
        : part.automaticMarks
      : 0;
  const decisions = part.levels
    ? [readReviewMark(drafts[key("whole-response")], part.marks)]
    : part.criteria.map((c) => readReviewMark(drafts[key(c.id)], c.marks));
  return {
    finalCorrect,
    automatic,
    pending: automatic === null || decisions.some((value) => value === null),
    marks:
      (automatic ?? 0) +
      decisions.reduce<number>((sum, value) => sum + (value ?? 0), 0),
  };
}
