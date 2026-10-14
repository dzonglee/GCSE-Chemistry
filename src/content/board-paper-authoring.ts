import type { ExamPart, PaperCriterion } from "./exam-paper-types";
import type { Question, Tier } from "./types";

/** Formatting only: prompts, references, allocations and aliases are authored per part. */
export function boardPaperAuthor(prefix: string, tier: Tier) {
  return (context: string, topic: string) =>
    (
      number: string,
      specification: string[],
      title: string,
      prompt: string,
      reference: string,
      marks: number,
      ao: [number, number, number],
      review: [string, number][],
      response: "written" | "scalar" | "native" | "choice",
      extra: {
        question?: Partial<Question>;
        automaticMarks?: number;
        mathematics?: boolean;
        practical?: number;
        levels?: ExamPart["levels"];
        referenceConstruction?: string;
      } = {},
    ): ExamPart => {
      const criteria: PaperCriterion[] = review.map(([text, value], index) => ({
        id: `point-${index + 1}`,
        text,
        marks: value,
      }));
      const question: Question = {
        id: prefix + number.replace(/[()]/g, ""),
        tier,
        title,
        conciseHeading: true,
        prompt,
        answer: reference,
        explanation: reference,
        hint: "Work independently. Review only after submitting the whole paper.",
        ...(response === "written"
          ? {
              rubric: review.length
                ? review.map(([text]) => text)
                : [
                    "Judge the complete response using the whole-response levels.",
                  ],
              referenceResponse: reference,
            }
          : {}),
        ...extra.question,
      };
      return {
        number,
        context,
        topic,
        specification,
        question,
        marks,
        ao,
        automaticMarks: extra.automaticMarks ?? 0,
        criteria,
        mathematics: extra.mathematics,
        practical: extra.practical,
        levels: extra.levels,
        referenceConstruction: extra.referenceConstruction,
      };
    };
}
