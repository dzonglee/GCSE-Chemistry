"use client";
import type { Question } from "@/content/types";
import { FuelDrawingInput } from "./FuelDrawingInput";
import { PolymerisationDrawingInput } from "./PolymerisationDrawingInput";
import type { ExamPaper } from "@/content/exam-paper-types";
import type { Run, Work } from "@/lib/progress";
import { setWork, startRun } from "@/lib/progress";
import {
  paperReviewKey,
  readReviewMark,
  reviewPart,
} from "@/lib/exam-paper-review";
import { canonicalAnswer, displayResponse } from "@/lib/marking";
import { QuestionInput } from "./QuestionInput";
import { TemperatureGraphReference } from "./TemperatureGraphReference";
import { IonicSlice } from "./IonicSlice";
import Link from "next/link";

function ReviewConstruction({
  question,
  value,
  contextLabel,
}: {
  question: Question;
  value: string;
  contextLabel: string;
}) {
  if (question.fuelDrawing)
    return (
      <FuelDrawingInput
        value={value}
        drawing={question.fuelDrawing}
        contextLabel={contextLabel}
        onChange={() => {}}
        disabled
        reviewOnly
      />
    );
  if (question.polymerisationDrawing)
    return (
      <PolymerisationDrawingInput
        value={value}
        drawing={question.polymerisationDrawing}
        contextLabel={contextLabel}
        onChange={() => {}}
        disabled
        reviewOnly
      />
    );
  return (
    <QuestionInput
      question={question}
      value={value}
      contextLabel={contextLabel}
      onChange={() => {}}
      disabled
      compactAssessment
    />
  );
}

export function ExamPaperReview({
  id,
  paper,
  run,
  work,
}: {
  id: string;
  paper: ExamPaper;
  run: Run;
  work: Work;
}) {
  const reviews = paper.parts.map((part) =>
    reviewPart(part, run.responses[part.question.id], work.drafts, run.started),
  );
  const pending = reviews.filter((review) => review.pending).length;
  const total = reviews.reduce((sum, review) => sum + review.marks, 0);
  const decision = (
    questionId: string,
    point: string,
    maximum: number,
    label: string,
  ) => {
    const key = paperReviewKey(run.started, questionId, point);
    const value = readReviewMark(work.drafts[key], maximum);
    return (
      <label className="paper-mark-decision">
        {label}
        <select
          aria-label={label}
          value={value ?? ""}
          onChange={(event) => {
            const raw = event.target.value;
            setWork(id, (w) => ({ ...w, drafts: { ...w.drafts, [key]: raw } }));
          }}
        >
          <option value="">Not reviewed</option>
          {Array.from({ length: maximum + 1 }, (_, mark) => (
            <option key={mark} value={mark}>
              {mark} / {maximum}
            </option>
          ))}
        </select>
      </label>
    );
  };
  return (
    <section className="assessment-results full-paper-results">
      <div className="results-banner">
        {work.drafts["paper-timer:" + run.started] ===
          String(paper.minutes) && (
          <p>
            {run.submitted &&
            run.submitted - run.started > paper.minutes * 60000
              ? "Submitted after the practice time limit; this attempt includes a time overrun."
              : "Submitted within the practice timer."}
          </p>
        )}
        <span className="eyebrow">
          Whole paper submitted · {paper.totalMarks} allocated marks
        </span>
        <h2>
          {pending
            ? `${pending} parts still need review`
            : `Your reviewed result: ${total} / ${paper.totalMarks}`}
        </h2>
        <p>
          {pending
            ? `${total} points currently included. Finish the pending decisions before treating this as a whole-paper result.`
            : "This combines checked answer points with your own method, drawing and writing decisions."}{" "}
          It is a practice self-review, with no examiner grade.
        </p>
        <p>
          A correct numerical result with no contradictory working can justify
          its associated calculation-method credit; this does not imply separate
          explanation or drawing points. For calculations, review working for
          contradictions and valid method credit, including a valid later step
          after an earlier error where the criterion allows it. For responses
          marked using levels, judge the complete response using the level
          descriptions rather than counting isolated keywords.
        </p>
        {Object.values(run.responses).some(
          (response) => !response.fresh || response.helped,
        ) && (
          <p>
            Some responses were previously exposed or helped. Restarting retains
            that history.
          </p>
        )}
      </div>
      <div className="results-list">
        {paper.parts.map((part, index) => {
          const q = part.question,
            response = run.responses[q.id],
            review = reviews[index];
          return (
            <details key={q.id} className="panel result-question">
              <summary>
                {part.number} · {q.title} ·{" "}
                {review.pending
                  ? "Review needed"
                  : `${review.marks} / ${part.marks}`}
              </summary>
              <div className="result-body">
                <p>{q.prompt}</p>
                <h3>Your retained response</h3>
                <p className="paper-retained-response">
                  {response?.answer
                    ? displayResponse(q, response.answer)
                    : "Left unanswered"}
                </p>
                {q.ionicSlice && (
                  <div className="paper-review-lattice">
                    <IonicSlice assessment />
                  </div>
                )}
                {response?.answer &&
                  (q.parts ||
                    q.arrangement ||
                    q.profileDrawing ||
                    q.fuelDrawing ||
                    q.organicDrawing ||
                    q.polymerisationDrawing ||
                    q.tangentGraph ||
                    q.haberGiven ||
                    q.chromatographyGiven ||
                    q.isotopeData) && (
                    <ReviewConstruction
                      question={q}
                      value={response.answer}
                      contextLabel={`Retained ${part.number} response`}
                    />
                  )}
                {response?.working && (
                  <section className="assessment-working-review">
                    <h3>Your retained working</h3>
                    <p>{response.working}</p>
                  </section>
                )}
                <details className="paper-reference">
                  <summary>Reference and review criteria</summary>
                  <p>
                    {q.referenceResponse ?? q.explanation ?? canonicalAnswer(q)}
                  </p>
                  {q.fuelDrawing && (
                    <TemperatureGraphReference drawing={q.fuelDrawing} />
                  )}
                  {part.referenceConstruction && (
                    <section
                      className="paper-worked-construction"
                      aria-label={`Worked visual reference for ${part.number}`}
                    >
                      <h3>Worked visual reference</h3>
                      <p>
                        One valid construction; equivalent structures or other
                        suitable smooth fits can also earn the described marks.
                      </p>
                      <ReviewConstruction
                        question={q}
                        value={part.referenceConstruction}
                        contextLabel={`Worked ${part.number} reference`}
                      />
                    </section>
                  )}
                  {(q.profileDrawing ||
                    q.drawArrangement ||
                    q.drawDotCross ||
                    q.drawCovalent) && (
                    <QuestionInput
                      question={q}
                      value={q.answer}
                      disabled
                      onChange={() => {}}
                      compactAssessment
                    />
                  )}
                  {part.automaticMarks > 0 && (
                    <p>
                      {review.finalCorrect
                        ? "Final answer matches the checked answer."
                        : "No checked final-answer point. Review any valid method separately."}{" "}
                      {review.automatic !== null &&
                        `${review.automatic} answer point(s) included.`}
                    </p>
                  )}
                  {part.automaticMarks > 0 &&
                    review.finalCorrect &&
                    response?.working?.trim() &&
                    decision(
                      q.id,
                      "answer-with-working",
                      part.automaticMarks,
                      `${part.number}: final-answer credit after checking working for contradictions`,
                    )}
                  {part.levels ? (
                    <>
                      <ul>
                        {part.levels.map((level) => (
                          <li key={level.min}>
                            <strong>
                              {level.min === level.max
                                ? level.min
                                : `${level.min}–${level.max}`}{" "}
                              marks:
                            </strong>{" "}
                            {level.text}
                          </li>
                        ))}
                      </ul>
                      {decision(
                        q.id,
                        "whole-response",
                        part.marks,
                        `${part.number}: whole-response mark using the levels`,
                      )}
                    </>
                  ) : (
                    part.criteria.map((criterion) => (
                      <div key={criterion.id} className="paper-criterion">
                        <p>{criterion.text}</p>
                        {decision(
                          q.id,
                          criterion.id,
                          criterion.marks,
                          `${part.number}: ${criterion.id} review mark`,
                        )}
                      </div>
                    ))
                  )}
                </details>
                <Link
                  className="text-link"
                  href={`/topics/${part.topic === "energy-changes" ? "energy" : part.topic}`}
                >
                  Revisit this topic →
                </Link>
              </div>
            </details>
          );
        })}
      </div>
      <div className="button-row">
        <button
          className="button"
          onClick={() =>
            startRun(
              id,
              "paper",
              paper.parts.map((part) => part.question.id),
              0,
            )
          }
        >
          Try again without a timer
        </button>
        <button
          className="button"
          onClick={() =>
            startRun(
              id,
              "paper",
              paper.parts.map((part) => part.question.id),
              paper.minutes,
            )
          }
        >
          Try again with a {paper.minutes}-minute timer
        </button>
      </div>
      <p className="caption">
        Each attempt keeps its own responses and review decisions. A repeated
        question remains previously exposed practice.
      </p>
    </section>
  );
}
