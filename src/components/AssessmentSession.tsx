"use client";
import { TemperatureGraphReference } from "./TemperatureGraphReference";
import { GasDrawingReview } from "./GasDrawingInput";
import { ChromaDrawingReview } from "./ChromaDrawingInput";
import { PurityDrawingReview } from "./PurityDrawingInput";
import { NaturalReview } from "./NaturalDrawingInput";
import { PathwayReview } from "./PathwayReview";
import { PolymerisationReview } from "./PolymerisationReview";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { Question } from "@/content/types";
import { QuestionInput } from "./QuestionInput";
import { mark, canonicalAnswer, displayResponse } from "@/lib/marking";
import {
  useProgress,
  emptyWork,
  setWork,
  startRun,
  dueReview,
  type Run,
} from "@/lib/progress";
export function AssessmentSession({
  id,
  title,
  questions: initialQuestions,
  forms,
  savedForms,
  kind,
  topicIds,
  independent = true,
  navigationAfterResponse = false,
  onExit,
}: {
  id: string;
  title: string;
  questions: Question[];
  forms?: Question[][];
  savedForms?: Question[][];
  kind: Run["kind"];
  topicIds?: string[];
  independent?: boolean;
  navigationAfterResponse?: boolean;
  onExit?: () => void;
}) {
  const { data, ready } = useProgress();
  const [message, setMessage] = useState("");
  const work = data.work[id] ?? emptyWork();
  const run = work.run;
  const reviewWaiting = kind === "review" && !dueReview(work);
  const completed = (work.history ?? []).filter(
    (r) =>
      r.kind === kind &&
      forms?.some(
        (form) => form.map((q) => q.id).join("|") === r.ids.join("|"),
      ),
  ).length;
  const savedForm =
    run?.kind === kind
      ? [...(forms ?? []), ...(savedForms ?? [])].find(
          (form) => form.map((q) => q.id).join("|") === run.ids.join("|"),
        )
      : undefined;
  const questions =
    savedForm ?? (forms ? forms[completed % forms.length] : initialQuestions);
  const same =
    run &&
    run.kind === kind &&
    run.ids.join("|") === questions.map((q) => q.id).join("|");
  const heading = useRef<HTMLHeadingElement>(null),
    lastTask = useRef("");
  const taskKey = same
    ? `${run.started}:${run.index}:${run.submitted ?? "pending"}`
    : "intro";
  useEffect(() => {
    if (ready && lastTask.current && lastTask.current !== taskKey)
      heading.current?.focus();
    if (ready) lastTask.current = taskKey;
  }, [ready, taskKey]);
  if (!ready) return <p role="status">Loading your saved session…</p>;
  if (!same)
    return (
      <section className="panel assessment-intro">
        <span className="eyebrow">
          {kind === "review"
            ? "Retrieve after a gap"
            : independent
              ? "Independent response"
              : "Retrieval practice"}
        </span>
        <h2>{title}</h2>
        <p>
          {questions.length} questions.{" "}
          {independent
            ? "Models and hints are hidden."
            : "These questions may have been seen in lessons."}{" "}
          Feedback is held until you submit the whole set, so later answers are
          not cued by earlier results.
        </p>
        <p>
          Recorded answers are locked. You can revisit them before submitting,
          and resume after a refresh. This is not a grade prediction.
        </p>
        {forms && (
          <p>
            The {forms.length} reserved forms rotate before repeating. Once a
            question has been exposed, a later repeat remains practice evidence.
          </p>
        )}
        {kind === "review" && !forms && (
          <p>
            Review reuses the lesson check questions. A previously seen question
            is never fresh independent evidence.
          </p>
        )}
        <button
          className="button primary"
          disabled={reviewWaiting}
          onClick={() =>
            startRun(
              id,
              kind,
              questions.map((q) => q.id),
            )
          }
        >
          Start{" "}
          {kind === "check"
            ? "understanding check"
            : kind === "review"
              ? "review"
              : kind === "paper"
                ? "paper"
                : "starting check"}{" "}
          →
        </button>
      </section>
    );
  if (run.submitted) {
    const results = questions.map((q) => ({
      q,
      r: run.responses[q.id],
      correct: run.responses[q.id]
        ? mark(q, run.responses[q.id].answer).correct
        : false,
    }));
    const count = results.filter((r) => r.correct).length;
    const fresh = results.filter(
      (r) => r.correct && r.r.fresh && !r.r.helped,
    ).length;
    const automatic = results.filter(({ q }) => !q.rubric);
    const manual = results.filter(({ q }) => q.rubric);
    const manualSaved = manual.filter(
      ({ q, r }) => r && !mark(q, r.answer).empty,
    ).length;
    return (
      <section className="assessment-results">
        <div className="results-banner">
          <span className="eyebrow">
            {automatic.length
              ? "Automatically checked responses"
              : "Responses for self-review"}
          </span>
          <h2>
            {automatic.length
              ? `${count} of ${automatic.length} correct`
              : "Responses ready for self-review"}
          </h2>
          {manual.length > 0 && (
            <p>
              {manualSaved} of {manual.length} responses saved for self-review
              {manualSaved < manual.length
                ? `; ${manual.length - manualSaved} left unanswered`
                : ""}
              . Written responses and full drawings receive no automatic mark
              {automatic.length > 0 &&
                " and are not included in the count above"}
              .
            </p>
          )}
          {results.some(({ r }) => r?.working) && (
            <p>
              Calculation working is retained for your review.{" "}
              {automatic.length
                ? "The count above checks final answers; it awards no method marks."
                : "It receives no automatic mark."}
            </p>
          )}
          <p>
            {automatic.length === 0
              ? "Compare each written response with the criteria below; no automatic score is assigned."
              : independent
                ? `${fresh} correct on a fresh, first response. Repeated questions are practice evidence.`
                : "Retrieval practice results; no mastery or independent-evidence claim."}
          </p>
          <p>
            Submitted {new Date(run.submitted).toLocaleDateString("en-GB")}.
            {automatic.length > 0 &&
              " One point per automatically checked question; this is not an official exam mark scheme."}
          </p>
        </div>
        <div className="results-list">
          {results.map(({ q, r, correct }, i) => (
            <details key={q.id} className="result-row">
              <summary>
                <span
                  className={`result-indicator ${q.rubric ? "self-review" : correct ? "pass" : "fail"}`}
                >
                  {q.rubric ? "?" : correct ? "✓" : "↺"}
                </span>
                <span>
                  {i + 1}. {q.prompt}
                </span>
                <span className={q.rubric ? "result-self-review" : undefined}>
                  {q.rubric
                    ? r && !mark(q, r.answer).empty
                      ? "Self-review"
                      : "Not answered"
                    : correct
                      ? "Correct"
                      : "Revisit"}
                </span>
              </summary>
              <div>
                <p>
                  Your answer:{" "}
                  <strong>{displayResponse(q, r?.answer ?? "")}</strong>
                </p>
                {r?.working && (
                  <section className="assessment-working-review">
                    <h3>Your retained working</h3>
                    <p>{r.working}</p>
                    <p className="caption">
                      Compare your method with the explanation. Working receives
                      no automatic method mark.
                    </p>
                  </section>
                )}
                {(q.haberDrawing ||
                  q.tangentDrawing ||
                  q.gasDrawing ||
                  q.chromatographyDrawing ||
                  q.purityDrawing ||
                  q.naturalDrawing ||
                  q.oilBarDrawing ||
                  q.alkaneDrawing ||
                  q.alkeneDrawing ||
                  q.pathwayDrawing ||
                  q.polymerisationDrawing ||
                  q.polyesterDrawing ||
                  q.organicDrawing ||
                  q.fuelDrawing) &&
                  r && (
                    <QuestionInput
                      question={q}
                      value={r.answer}
                      disabled
                      onChange={() => {}}
                    />
                  )}
                <p>
                  Expected: <strong>{canonicalAnswer(q)}</strong>
                </p>
                <p>{q.explanation}</p>
                {q.fuelDrawing && (
                  <TemperatureGraphReference drawing={q.fuelDrawing} />
                )}
                {q.rubric && (
                  <section className="assessment-review-criteria">
                    <h3>Self-review criteria</h3>
                    <ul>
                      {q.rubric.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <p>
                      Compare each point with your retained response. These
                      criteria do not award an automatic examiner mark.
                    </p>
                    {q.writtenEquations && q.referenceResponse && (
                      <details className="sample-reference">
                        <summary>Compare a reference response</summary>
                        <p>{q.referenceResponse}</p>
                        <p>
                          Compare the complete reaction direction, substance
                          identities and atom counts with your retained
                          equations. This reference does not award an automatic
                          mark.
                        </p>
                      </details>
                    )}
                  </section>
                )}
                {q.gasDrawing && (
                  <GasDrawingReview
                    showRetained={false}
                    data={q.gasDrawing}
                    value={r?.answer ?? ""}
                  />
                )}
                {q.chromatographyDrawing && (
                  <ChromaDrawingReview
                    showRetained={false}
                    data={q.chromatographyDrawing}
                    value={r?.answer ?? ""}
                  />
                )}
                {q.purityDrawing && (
                  <PurityDrawingReview
                    showRetained={false}
                    data={q.purityDrawing}
                    value={r?.answer ?? ""}
                  />
                )}
                {q.naturalDrawing && <NaturalReview data={q.naturalDrawing} />}
                <PathwayReview question={q} />
                <PolymerisationReview question={q} />
                {topicIds?.[i] && (
                  <Link className="text-link" href={`/topics/${topicIds[i]}`}>
                    Revisit this topic →
                  </Link>
                )}
              </div>
            </details>
          ))}
        </div>
        {reviewWaiting && (
          <p>
            Next delayed review is available seven days after this submission.
          </p>
        )}
        <div className="button-row">
          <button
            className="button"
            disabled={reviewWaiting}
            onClick={() => {
              startRun(
                id,
                kind,
                (forms ? forms[completed % forms.length] : questions).map(
                  (q) => q.id,
                ),
              );
              setMessage("");
            }}
          >
            {forms ? "Try the next form" : "Try this set again"}
          </button>
          {onExit ? (
            <button className="button primary" onClick={onExit}>
              Return to the lesson
            </button>
          ) : (
            <Link href="/learn" className="button primary">
              My progress →
            </Link>
          )}
        </div>
        <p className="caption">
          Trying again retains the exposure history. Previous exposure never
          becomes fresh simply by restarting.
        </p>
      </section>
    );
  }
  const q = questions[run.index];
  const recorded = run.responses[q.id];
  const answer = work.drafts[q.id] ?? "";
  const working = work.drafts["working:" + q.id] ?? "";
  const calculation =
    !q.rubric && (q.parts || (!q.options && Number.isFinite(Number(q.answer))));
  const answered = Object.keys(run.responses).length;
  const navigate = (index: number) => {
    setMessage("");
    setWork(id, (w) => ({
      ...w,
      run: w.run ? { ...w.run, index } : undefined,
    }));
  };
  const record = () => {
    const checked = mark(q, answer);
    if (!answer.trim() || checked.empty) {
      setMessage("Choose or enter an answer, or use “Leave unanswered”.");
      return;
    }
    if (checked.invalid) {
      setMessage(
        q.writtenEquations && q.id.startsWith("ion-tests-v1-write-")
          ? checked.feedback
          : q.parts
            ? "Complete every part with a valid number before recording."
            : "Enter a valid number only; use the unit shown beside the input.",
      );
      return;
    }
    setWork(id, (w) => ({
      ...w,
      run: w.run
        ? {
            ...w.run,
            responses: {
              ...w.run.responses,
              [q.id]: {
                answer,
                ...(calculation && working.trim() ? { working } : {}),
                correct: checked.correct,
                helped: !independent,
                fresh: w.drafts["fresh:" + q.id] === "true" && independent,
                at: Date.now(),
              },
            },
          }
        : undefined,
    }));
    setMessage("");
  };
  const questionNavigation = (
    <div className="question-navigation" aria-label="Question navigation">
      {questions.map((item, i) => (
        <button
          key={item.id}
          className={i === run.index ? "current" : ""}
          aria-label={`Question ${i + 1}${run.responses[item.id] ? ", recorded" : ""}`}
          aria-current={i === run.index ? "step" : undefined}
          onClick={() => navigate(i)}
        >
          {i + 1}
          {run.responses[item.id] && <span aria-hidden="true"> ✓</span>}
        </button>
      ))}
    </div>
  );
  return (
    <section className="assessment-session">
      <div className="session-heading">
        <p className="eyebrow">
          {questions.length > 20 ? "Independent response" : title}
        </p>
        <span>
          {answered} / {questions.length} recorded
        </span>
      </div>
      <progress
        aria-label="Answers recorded"
        max={questions.length}
        value={answered}
      />
      {questions.length <= 20 && !navigationAfterResponse && questionNavigation}
      <form
        className="question-panel"
        data-written-equations={q.writtenEquations || undefined}
        onSubmit={(e) => {
          e.preventDefault();
          record();
        }}
      >
        <p className="eyebrow">
          Question {run.index + 1} of {questions.length}
        </p>
        <h2 ref={heading} tabIndex={-1}>
          {(q.writtenEquations ||
            q.conciseHeading ||
            (id === "ion-tests" && q.rubric)) &&
          q.title
            ? q.title
            : q.prompt}
        </h2>
        {(q.writtenEquations ||
          q.conciseHeading ||
          (id === "ion-tests" && q.rubric)) &&
          q.title && <p className="written-equation-prompt">{q.prompt}</p>}
        <QuestionInput
          compactAssessment={questions.length > 20}
          compactHistorical={id === "atomic-models"}
          question={q}
          value={recorded?.answer ?? answer}
          disabled={!!recorded}
          onChange={(v) => {
            setMessage("");
            setWork(id, (w) => ({ ...w, drafts: { ...w.drafts, [q.id]: v } }));
          }}
        />
        {calculation && (
          <details className="assessment-working">
            <summary>Show your working</summary>
            <label htmlFor={`working-${q.id}`}>Working for this question</label>
            <textarea
              id={`working-${q.id}`}
              rows={5}
              maxLength={3000}
              value={recorded?.working ?? working}
              disabled={!!recorded}
              onChange={(event) => {
                const value = event.target.value;
                setWork(id, (w) => ({
                  ...w,
                  drafts: { ...w.drafts, ["working:" + q.id]: value },
                }));
              }}
            />
            <p className="caption">
              Optional: record your steps, units and reasoning. Your working is
              saved, but receives no automatic method mark.
            </p>
          </details>
        )}
        {!recorded ? (
          <div className="button-row">
            <button className="button primary" type="submit">
              Record answer
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setWork(id, (w) => ({
                  ...w,
                  run: w.run
                    ? {
                        ...w.run,
                        responses: {
                          ...w.run.responses,
                          [q.id]: {
                            answer: "",
                            ...(calculation && working.trim()
                              ? { working }
                              : {}),
                            correct: false,
                            helped: !independent,
                            fresh: false,
                            at: Date.now(),
                          },
                        },
                      }
                    : undefined,
                }));
                setMessage("");
              }}
            >
              Leave unanswered
            </button>
          </div>
        ) : (
          <p className="recorded-note" role="status">
            {recorded.answer.trim()
              ? "Answer recorded and locked."
              : "Question recorded as unanswered."}{" "}
            Feedback appears after submission.
          </p>
        )}
        {message && (
          <p className="feedback" role="status">
            {message}
          </p>
        )}
      </form>
      {questions.length <= 20 && navigationAfterResponse && questionNavigation}
      {questions.length > 20 && (
        <details className="assessment-question-jump">
          <summary>
            Jump to a question · {answered} of {questions.length} recorded
          </summary>
          {questionNavigation}
        </details>
      )}
      <div className="button-row session-actions">
        {run.index > 0 && (
          <button className="button" onClick={() => navigate(run.index - 1)}>
            ← Previous
          </button>
        )}
        {run.index < questions.length - 1 ? (
          <button
            className="button primary"
            onClick={() => navigate(run.index + 1)}
          >
            Next question →
          </button>
        ) : (
          <button
            className="button primary"
            disabled={answered !== questions.length}
            onClick={() =>
              setWork(id, (w) => {
                if (!w.run) return w;
                const completed = { ...w.run, submitted: Date.now() };
                return {
                  ...w,
                  run: completed,
                  history: [...(w.history ?? []), completed],
                };
              })
            }
          >
            Submit whole set
          </button>
        )}
      </div>
      {answered !== questions.length && run.index === questions.length - 1 && (
        <p role="status">
          Record or explicitly leave unanswered every question before
          submitting.
        </p>
      )}
    </section>
  );
}
