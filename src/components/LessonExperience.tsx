"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { lessons, topics } from "@/content/curriculum";
import type { Lesson } from "@/content/types";
import {
  useProgress,
  emptyWork,
  setWork,
  expose,
  dueReview,
  REVIEW_DELAY,
  lastSubmission,
} from "@/lib/progress";
import { mark } from "@/lib/marking";
import { ChemistryModel } from "./Models";
import { QuestionInput } from "./QuestionInput";
import { AssessmentSession } from "./AssessmentSession";
import { DetailedLesson } from "./DetailedLesson";
export function LessonExperience({ lesson }: { lesson: Lesson }) {
  return lesson.journey ? (
    <DetailedLesson lesson={lesson} journey={lesson.journey} />
  ) : (
    <LegacyLessonExperience lesson={lesson} />
  );
}
function LegacyLessonExperience({ lesson }: { lesson: Lesson }) {
  const { data, ready } = useProgress();
  const [message, setMessage] = useState("");
  const work = data.work[lesson.slug] ?? emptyWork();
  const section = work.section;
  const index = Math.min(work.index, lesson.questions.length - 1);
  const q = lesson.questions[index];
  const topic = topics.find((t) => t.slug === lesson.topic)!;
  const answer = work.drafts[q.id] ?? "";
  const attempt = work.attempts[q.id]?.at(-1);
  const correct = attempt?.answer === answer && mark(q, answer).correct;
  const seenId =
    section === "practice"
      ? q.id
      : section === "explore" && lesson.model === "predict"
        ? lesson.questions[0].id
        : null;
  useEffect(() => {
    if (ready && seenId) expose([seenId]);
  }, [ready, seenId]);
  const choose = (next: typeof section) => {
    setMessage("");
    setWork(lesson.slug, (w) => ({ ...w, section: next }));
  };
  const submit = () => {
    const result = mark(q, answer);
    if (result.empty) {
      setMessage(result.feedback);
      return;
    }
    const helped = work.hints.includes(q.id);
    setWork(lesson.slug, (w) => ({
      ...w,
      attempts: {
        ...w.attempts,
        [q.id]: [
          ...(w.attempts[q.id] ?? []),
          {
            answer,
            correct: result.correct,
            helped,
            fresh: false,
            at: Date.now(),
          },
        ],
      },
    }));
    setMessage(result.feedback);
  };
  const next = lessons[lessons.findIndex((l) => l.slug === lesson.slug) + 1];
  return (
    <>
      <div className="lesson-breadcrumb">
        <Link href="/">Contents</Link>
        <span>/</span>
        <Link href={`/topics/${lesson.topic}`}>{topic.title}</Link>
      </div>
      <div className="lesson-title" data-colour={topic.colour}>
        <p className="eyebrow">
          {topic.title} ·{" "}
          {lesson.tier === "higher" ? "Higher" : "Foundation & Higher"}
          {lesson.course === "separate" ? " · Separate Chemistry" : ""}
        </p>
        <h1>{lesson.title}</h1>
        <p className="lede">{lesson.goal}</p>
      </div>
      <nav className="lesson-phases" aria-label="Lesson stages">
        {(
          [
            ["explore", "01", "Explore"],
            ["practice", "02", "Practise"],
            ["check", "03", "Check"],
            ["review", "04", "Review"],
          ] as const
        ).map(([id, num, label]) => (
          <button
            key={id}
            aria-label={`${num} ${label}`}
            className={section === id ? "active" : ""}
            aria-current={section === id ? "step" : undefined}
            onClick={() => choose(id)}
          >
            <span>{num}</span>
            {label}
          </button>
        ))}
      </nav>
      {!ready ? (
        <p role="status">Loading your saved lesson…</p>
      ) : section === "explore" ? (
        <>
          <ChemistryModel
            lesson={lesson}
            state={work.model ?? {}}
            onChange={(model) => setWork(lesson.slug, (w) => ({ ...w, model }))}
          />
          <details className="concept-panel">
            <summary>The idea behind the model</summary>
            <p>{lesson.concept}</p>
          </details>
          <div className="button-row">
            <button
              className="button primary"
              onClick={() => choose("practice")}
            >
              Try the practice questions →
            </button>
          </div>
        </>
      ) : section === "practice" ? (
        <>
          <div className="session-heading">
            <p>
              {index + 1} of {lesson.questions.length} practice questions
            </p>
            <span>Hints available · Feedback straight away</span>
          </div>
          <div className="question-navigation">
            {lesson.questions.map((item, i) => (
              <button
                key={item.id}
                aria-label={`Practice question ${i + 1}`}
                aria-current={i === index ? "step" : undefined}
                className={i === index ? "current" : ""}
                onClick={() => {
                  setWork(lesson.slug, (w) => ({ ...w, index: i }));
                  setMessage("");
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <form
            className="question-panel"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <h2>{q.prompt}</h2>
            <QuestionInput
              question={q}
              value={answer}
              onChange={(v) => {
                setWork(lesson.slug, (w) => ({
                  ...w,
                  drafts: { ...w.drafts, [q.id]: v },
                }));
                setMessage("");
              }}
            />
            <div className="button-row">
              <button className="button primary" type="submit">
                Check answer
              </button>
              <button
                className="button"
                type="button"
                onClick={() => {
                  setWork(lesson.slug, (w) => ({
                    ...w,
                    hints: [...new Set([...w.hints, q.id])],
                  }));
                  setMessage(q.hint);
                }}
              >
                Give me a hint
              </button>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setWork(lesson.slug, (w) => ({
                    ...w,
                    drafts: { ...w.drafts, [q.id]: "" },
                  }));
                  setMessage(
                    "Answer cleared. Your earlier attempts are retained.",
                  );
                }}
              >
                Clear answer
              </button>
            </div>
            {(message || attempt?.answer === answer) && (
              <div
                role="status"
                className={`feedback ${correct ? "correct" : ""}`}
              >
                <strong>
                  {correct
                    ? "That’s right."
                    : attempt?.answer === answer
                      ? "Try again."
                      : "Keep thinking."}
                </strong>
                <p>{message || mark(q, answer).feedback}</p>
              </div>
            )}
            {work.hints.includes(q.id) && (
              <p className="caption">
                A hint has been used for this task. This is supported practice.
              </p>
            )}
          </form>
          <div className="button-row">
            {index > 0 && (
              <button
                className="button"
                onClick={() => {
                  setWork(lesson.slug, (w) => ({ ...w, index: index - 1 }));
                  setMessage("");
                }}
              >
                ← Previous task
              </button>
            )}
            <button
              className="button primary"
              onClick={() => {
                if (index < lesson.questions.length - 1) {
                  setWork(lesson.slug, (w) => ({ ...w, index: index + 1 }));
                  setMessage("");
                } else choose("check");
              }}
            >
              {index < lesson.questions.length - 1
                ? "Next task →"
                : "Try an independent check →"}
            </button>
          </div>
        </>
      ) : section === "check" ? (
        <AssessmentSession
          id={lesson.slug}
          title="Check your understanding"
          questions={lesson.checks}
          kind="check"
          onExit={() => choose("explore")}
        />
      ) : (
        <>
          <section className="panel">
            <h2>Retrieve after a gap</h2>
            <p>
              Revisiting after seven days helps you test what you can retrieve.
              Review uses the same check questions, so it does not supply fresh
              independent evidence.
            </p>
            {lastSubmission(work) !== undefined && !dueReview(work) ? (
              <p>
                Next delayed review is available from{" "}
                {new Date(
                  (lastSubmission(work) ?? 0) + REVIEW_DELAY,
                ).toLocaleDateString("en-GB")}
                . You can return to practice now.
              </p>
            ) : lastSubmission(work) === undefined ? (
              <p>
                Complete the understanding check first to schedule a review.
              </p>
            ) : (
              <p>Your delayed review is due.</p>
            )}
            <button className="button" onClick={() => choose("practice")}>
              Return to practice
            </button>
          </section>
          {(dueReview(work) || work.run?.kind === "review") && (
            <AssessmentSession
              id={lesson.slug}
              title="Delayed retrieval review"
              questions={lesson.checks}
              kind="review"
              onExit={() => choose("explore")}
            />
          )}
        </>
      )}
      <div className="lesson-end">
        <Link className="text-link" href={`/topics/${lesson.topic}`}>
          ← All {topic.title.toLowerCase()} lessons
        </Link>
        {next && (
          <Link className="text-link" href={`/lessons/${next.slug}`}>
            Next: {next.title} →
          </Link>
        )}
      </div>
    </>
  );
}
