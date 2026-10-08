"use client";
import Link from "next/link";
import { useState } from "react";
import { nextStep } from "@/lib/overview";
import { lessons, topics, topicLessons } from "@/content/curriculum";
import {
  useProgress,
  lessonStatus,
  dueReview,
  observedResults,
  setWork,
} from "@/lib/progress";
import type { Lesson } from "@/content/types";
export function LessonCard({ lesson }: { lesson: Lesson }) {
  const { data } = useProgress();
  const status = lessonStatus(lesson.slug, data);
  return (
    <Link className="lesson-card" href={`/lessons/${lesson.slug}`}>
      <span className="lesson-icon" aria-hidden="true">
        {lesson.model === "atom"
          ? "⊙"
          : lesson.model === "balance"
            ? "⇌"
            : lesson.model === "moles"
              ? "n"
              : lesson.model === "organic"
                ? "C"
                : "↗"}
      </span>
      <div>
        <h3>{lesson.title}</h3>
        <p>{lesson.goal}</p>
        <div className="tags">
          {lesson.tier === "higher" && <span>Higher</span>}
          {lesson.course === "separate" && <span>Separate Chemistry</span>}
          <span className={status === "Check completed" ? "status-done" : ""}>
            {status}
          </span>
        </div>
      </div>
      <span className="arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}
export function CourseContents() {
  const [search, setSearch] = useState("");
  const { data } = useProgress();
  const matching = lessons.filter((l) =>
    (l.title + " " + l.goal + " " + l.concept)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your Chemistry course</p>
          <h1>
            Small discoveries.
            <br />
            <span className="muted-heading">A bigger understanding.</span>
          </h1>
          <p className="lede">
            Move the particles. Test a prediction. Make the chemistry make
            sense—one focused lesson at a time.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/lessons/inside-an-atom">
              Start with atoms <span aria-hidden="true">→</span>
            </Link>
            <Link className="button" href="/diagnostics">
              Find my starting point
            </Link>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit-ring ring-1" />
            <div className="orbit-ring ring-2" />
            <div className="hero-nucleus">
              O<small>8 protons</small>
            </div>
            <i className="hero-electron one" />
            <i className="hero-electron two" />
            <i className="hero-electron three" />
          </div>
          <p>
            Not just what happens.
            <br />
            <strong>Understand why.</strong>
          </p>
          <span className="caption">
            Interactive models · Clear feedback · Saved progress
          </span>
        </div>
      </div>
      <div className="course-toolbar">
        <div>
          <h2>Explore the course</h2>
          <p>
            {topics.length} topic areas · {lessons.length} interactive lessons ·{" "}
            {lessons.reduce(
              (n, l) => n + l.questions.length + l.checks.length,
              0,
            )}{" "}
            lesson questions
          </p>
        </div>
        <label className="search-label">
          <span className="sr-only">Search lessons</span>
          <input
            type="search"
            placeholder="Find a lesson…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {search ? (
        <div className="search-results" aria-live="polite">
          <p>{matching.length} matching lessons</p>
          <div className="lesson-grid">
            {matching.map((l) => (
              <LessonCard key={l.slug} lesson={l} />
            ))}
          </div>
        </div>
      ) : (
        <div className="topic-grid">
          {topics.map((t, i) => (
            <Link
              className="topic-card"
              data-colour={t.colour}
              key={t.slug}
              href={`/topics/${t.slug}`}
            >
              <div className="topic-card-head">
                <span className="topic-symbol">{t.symbol}</span>
                <span className="topic-count">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3>{t.title}</h3>
              <p>{t.description}</p>
              <div className="topic-card-foot">
                <span>{topicLessons(t.slug).length} lessons</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="course-bottom">
        <section className="panel">
          <span className="eyebrow">Make it stick</span>
          <h2>A little practice. Often.</h2>
          <p>
            Bring topics together with mixed retrieval practice. Your answers
            guide what to revisit without predicting a grade.
          </p>
          <Link href="/practice" className="text-link">
            Open mixed practice →
          </Link>
        </section>
        <section className="panel">
          <span className="eyebrow">Your route</span>
          <h2>
            {data.preferences.tier === "higher" ? "Higher" : "Foundation"} ·{" "}
            {data.preferences.course === "combined"
              ? "Combined Science"
              : "Separate Chemistry"}
          </h2>
          <p>
            The complete map stays visible. Set your preferences to focus
            revision on your course.
          </p>
          <Link href="/preferences" className="text-link">
            Change preferences →
          </Link>
        </section>
      </div>
      <p className="scope-note">
        Original study content for UK GCSE Chemistry. Foundation/Higher and
        combined/separate labels guide study; detailed AQA, Pearson Edexcel and
        OCR specification mapping is not yet independently verified.{" "}
        <Link href="/coverage">See coverage and limitations</Link>.
      </p>
    </>
  );
}
export function TopicPage({ slug }: { slug: string }) {
  const topic = topics.find((t) => t.slug === slug)!;
  const { data } = useProgress();
  return (
    <>
      <Link href="/" className="breadcrumb">
        Contents /
      </Link>
      <div className="page-heading compact" data-colour={topic.colour}>
        <div>
          <span className="topic-symbol large">{topic.symbol}</span>
          <h1>{topic.title}</h1>
          <p className="lede">{topic.description}</p>
        </div>
        <div className="topic-summary">
          {topicLessons(slug).length}
          <span>interactive lessons</span>
        </div>
      </div>
      <div className="section-heading">
        <h2>Your lesson path</h2>
        <p>
          Start in order or choose what you need. All lessons are available.
        </p>
      </div>
      <div className="lesson-grid single">
        {topicLessons(slug).map((l, i) => (
          <div key={l.slug}>
            <p className="lesson-step">
              {String(i + 1).padStart(2, "0")}
              {(l.tier === "higher" &&
                data.preferences.tier === "foundation") ||
              (l.course === "separate" &&
                data.preferences.course === "combined")
                ? " · Extends your selected route"
                : ""}
            </p>
            <LessonCard lesson={l} />
          </div>
        ))}
      </div>
    </>
  );
}
export function ProgressPage() {
  const { data, ready } = useProgress();
  if (!ready) return <p role="status">Loading saved learning…</p>;
  const started = lessons.filter((l) => data.work[l.slug]);
  const recent = [...started].sort(
    (a, b) => data.work[b.slug].updated - data.work[a.slug].updated,
  );
  const reviews = started.filter((l) => dueReview(data.work[l.slug]));
  const support = started.filter((l) =>
    observedResults(l.slug, data)?.some(
      (r) => !r.question.rubric && !r.correct,
    ),
  );
  const recommendation = nextStep(data);
  const checked = started.filter(
    (l) => lessonStatus(l.slug, data) === "Check completed",
  );
  return (
    <>
      <p className="eyebrow">Your learning, on this device</p>
      <h1>My progress</h1>
      <p className="lede">
        Keep going from where you left off. A completed check records what you
        answered; it is not a claim of mastery.
      </p>
      <div className="stat-grid">
        <div className="stat">
          <strong>{started.length}</strong>
          <span>Lessons started</span>
        </div>
        <div className="stat">
          <strong>{checked.length}</strong>
          <span>Checks completed</span>
        </div>
        <div className="stat">
          <strong>{reviews.length}</strong>
          <span>Reviews due</span>
        </div>
      </div>
      <section className="panel next-step">
        <span className="eyebrow">Your next step</span>
        <h2>{recommendation.title}</h2>
        <p>{recommendation.reason}</p>
        <Link
          className="button primary"
          href={recommendation.href}
          onClick={() => {
            if (recommendation.reviewSlug)
              setWork(recommendation.reviewSlug, (w) => ({
                ...w,
                section: "review",
              }));
          }}
        >
          {recommendation.href === "/diagnostics"
            ? "Choose a starting check"
            : recommendation.href.startsWith("/topics/")
              ? "Explore this topic"
              : recommendation.href === "/practice"
                ? "Open mixed practice"
                : "Open lesson"}{" "}
          →
        </Link>
      </section>
      {support.length > 0 && (
        <section>
          <h2>Topics to revisit</h2>
          <p>
            Suggested from incorrect responses in your latest submitted lesson
            checks.
          </p>
          <div className="lesson-grid">
            {support.map((l) => (
              <LessonCard key={l.slug} lesson={l} />
            ))}
          </div>
        </section>
      )}
      <section>
        <h2>
          {started.length ? "Your started lessons" : "No lessons started yet"}
        </h2>
        {started.length ? (
          <div className="lesson-grid">
            {recent.map((l) => (
              <LessonCard key={l.slug} lesson={l} />
            ))}
          </div>
        ) : (
          <p>
            Nothing has been inferred about your knowledge.{" "}
            <Link className="text-link" href="/">
              Explore the course map
            </Link>
            .
          </p>
        )}
      </section>
    </>
  );
}
