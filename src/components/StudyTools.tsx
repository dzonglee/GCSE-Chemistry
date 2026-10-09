"use client";
import { useState } from "react";
import Link from "next/link";
import { lessons, topics, questionById } from "@/content/curriculum";
import { diagnostics, papers, type Assessment } from "@/content/assessments";
import { extendedPapers } from "@/content/extended-assessments";
import { fullPapers } from "@/content/full-assessments";
import {
  useProgress,
  update,
  deleteProgress,
  exportData,
  dueReview,
} from "@/lib/progress";
import { AssessmentSession } from "./AssessmentSession";
export function AssessmentCatalogue({
  kind,
}: {
  kind: "diagnostic" | "paper";
}) {
  const items =
    kind === "diagnostic"
      ? diagnostics
      : [...fullPapers, ...extendedPapers, ...papers];
  const { data } = useProgress();
  return (
    <>
      <p className="eyebrow">
        {kind === "diagnostic"
          ? "A starting point, not a score to chase"
          : "Bring the topics together"}
      </p>
      <h1>{kind === "diagnostic" ? "Starting checks" : "Practice papers"}</h1>
      <p className="lede">
        {kind === "diagnostic"
          ? "Try twenty questions across the course. Use the results to choose what to study next, without a predicted grade."
          : "Choose a full 100-mark paper, a cumulative set or a short topic mix. Work independently, then review the reasoning after submitting the whole paper or set."}
      </p>
      <div className="assessment-cards">
        {items.map((item) => (
          <Link
            key={item.slug}
            className="panel assessment-card"
            href={
              kind === "diagnostic"
                ? `/diagnostics/${item.slug}`
                : `/exams/${item.slug}`
            }
          >
            <span className="eyebrow">
              {item.tier === "higher" ? "Higher" : "Foundation"} ·{" "}
              {item.course === "separate" && "Chemistry only · "}
              {item.minutes} minutes suggested
              {item.examPaper && ` · ${item.examPaper.totalMarks} marks`}
            </span>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <div className="topic-card-foot">
              <span>
                {data.work[`assessment-${item.slug}`]?.run?.submitted
                  ? "Results saved"
                  : data.work[`assessment-${item.slug}`]?.run
                    ? "Resume your set"
                    : `${item.questions.length} questions`}
              </span>
              <span aria-hidden="true">→</span>
            </div>
          </Link>
        ))}
      </div>
      <div className="panel note-panel">
        <h2>What these results can tell you</h2>
        <p>
          A response is evidence about one question under these conditions. It
          is not an exam-board grade, a diagnosis of a misconception, or proof
          of mastery. The full paper has original questions and allocated marks;
          cumulative sets and short mixes have different lengths. None is an
          official exam-board paper or a source of predicted grades.
        </p>
        <p>
          Automatic results count checked questions only. Written responses and
          full drawings need self-review against their criteria. Existing lesson
          questions retain their exposure history in cumulative sets. See{" "}
          <Link href="/coverage">coverage</Link> for limits and board links.
        </p>
      </div>
    </>
  );
}
export function AssessmentPage({ assessment }: { assessment: Assessment }) {
  const { data } = useProgress();
  const run = data.work[`assessment-${assessment.slug}`]?.run;
  const working = !!run && run.submitted === undefined;
  return (
    <div
      className={`assessment-page${working ? " working" : ""}${assessment.examPaper ? " full-paper" : ""}`}
    >
      <Link
        className="breadcrumb"
        href={assessment.kind === "diagnostic" ? "/diagnostics" : "/exams"}
      >
        ←{" "}
        {assessment.kind === "diagnostic"
          ? "Starting checks"
          : "Practice papers"}
      </Link>
      <h1>
        {working || assessment.examPaper
          ? (assessment.shortTitle ?? assessment.title)
          : assessment.title}
      </h1>
      {!working && !assessment.examPaper && (
        <p className="lede">{assessment.description}</p>
      )}
      {assessment.course === "separate" && (
        <p className="sample-course-scope">
          Chemistry only{assessment.examPaper ? " · AQA 8462" : ""}
        </p>
      )}
      {!working && assessment.structure === "extended" && (
        <details>
          <summary>About this cumulative set</summary>
          <p>
            This is a curated study set, not a 100-mark official mock. Its
            question count and suggested time do not reproduce exam-board mark
            weighting. Automatically checked answers and responses needing
            self-review are reported separately. Existing lesson questions keep
            their exposure history when used here.
          </p>
        </details>
      )}
      {!working && assessment.examPaper && (
        <p>
          {assessment.examPaper.totalMarks} marks · {assessment.minutes} minutes
          · Calculator allowed · Original practice paper
        </p>
      )}
      {!working && !assessment.examPaper && (
        <p>
          {assessment.minutes} minutes suggested ·{" "}
          {assessment.kind === "paper" ? "Calculator allowed · " : ""}No time
          limit or automatic submission · Progress saved on this device
        </p>
      )}
      <AssessmentSession
        id={`assessment-${assessment.slug}`}
        title={assessment.title}
        kind={assessment.kind}
        questions={assessment.questions}
        topicIds={assessment.topics}
        examPaper={assessment.examPaper}
      />
    </div>
  );
}
export function MixedPractice() {
  const { data, ready } = useProgress();
  const [started, setStarted] = useState(false);
  const saved = data.work["mixed"];
  const allowed = lessons.filter(
    (l) =>
      (data.preferences.tier === "higher" || l.tier === "foundation") &&
      (data.preferences.course === "separate" || l.course === "combined"),
  );
  const tried = allowed.filter((l) => data.work[l.slug]);
  const pool = tried.length ? tried : allowed;
  const ordered = [...pool].sort((a, b) => {
    const score = (slug: string) => {
      const w = data.work[slug];
      return (
        (dueReview(w) ? 10 : 0) +
        Object.entries(w?.attempts ?? {}).filter(([id, attempts]) => {
          const question = questionById(id);
          return (
            question && !question.rubric && attempts.at(-1)?.correct === false
          );
        }).length
      );
    };
    return score(b.slug) - score(a.slug);
  });
  const candidates = ordered
    .flatMap((l) =>
      (l.journey?.practice ?? l.questions)
        .filter(
          (q) =>
            !q.rubric &&
            (q.tier !== "higher" || data.preferences.tier === "higher"),
        )
        .map((q, i) => ({ q, topic: l.topic, priority: i })),
    )
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 8);
  const byId = new Map(
    lessons.flatMap((l) =>
      [...l.questions, ...(l.journey?.practice ?? [])].map(
        (q) => [q.id, { q, topic: l.topic }] as const,
      ),
    ),
  );
  const selected = saved?.run
    ? saved.run.ids
        .map((id) => byId.get(id))
        .filter((q): q is NonNullable<typeof q> => !!q)
    : candidates;
  const questions = selected.map((x) => x.q);
  return (
    <>
      <p className="eyebrow">Retrieve · Connect · Revisit</p>
      <h1>Mixed practice</h1>
      <p className="lede">
        A short set from your selected route. Started lessons, due reviews and
        recent practice errors get priority.
      </p>
      {!ready ? (
        <p role="status">Loading your saved practice…</p>
      ) : !started && !saved?.run ? (
        <section className="panel">
          <h2>
            {tried.length
              ? "Reconnect your recent learning"
              : "Explore a few starting ideas"}
          </h2>
          <p>
            {tried.length
              ? `${candidates.length} questions from lessons you have tried.`
              : "No lessons started yet: this set samples the selected course, without assuming what you know."}{" "}
            These are lesson practice questions, so previous exposure is
            retained.
          </p>
          <div className="tags">
            {[...new Set(candidates.map((x) => x.topic))].map((slug) => (
              <span key={slug}>
                {topics.find((t) => t.slug === slug)?.title}
              </span>
            ))}
          </div>
          <button className="button primary" onClick={() => setStarted(true)}>
            Prepare my set →
          </button>
        </section>
      ) : (
        <AssessmentSession
          id="mixed"
          title="Mixed retrieval practice"
          questions={questions}
          kind="check"
          topicIds={selected.map((x) => x.topic)}
          independent={false}
        />
      )}
      <p className="caption">
        Mixed practice is practice evidence. It does not certify mastery or
        award an independent-check result.
      </p>
    </>
  );
}
export function Preferences() {
  const { data, ready } = useProgress();
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const prefs = data.preferences;
  const download = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "gcse-chemistry-progress.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(
      "A copy of this app’s saved data has been downloaded. Keep it somewhere private.",
    );
  };
  return (
    <>
      <p className="eyebrow">Your learning route</p>
      <h1>Preferences</h1>
      <p className="lede">
        Choose your context. The whole course map stays visible; your selections
        focus mixed practice.
      </p>
      {!ready ? (
        <p role="status">Loading preferences…</p>
      ) : (
        <>
          <section className="panel preference-panel">
            <h2>Your course</h2>
            <label>
              Exam board
              <select
                aria-label="Exam board"
                value={prefs.board}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    preferences: {
                      ...p.preferences,
                      board: e.target.value as typeof prefs.board,
                    },
                  }))
                }
              >
                {["AQA", "Edexcel", "OCR"].map((board) => (
                  <option key={board}>{board}</option>
                ))}
              </select>
            </label>
            <p className="caption">
              Board choice records your context only. Lesson-by-lesson
              specification mapping is not yet verified.
            </p>
            <label>
              Tier
              <select
                aria-label="Tier"
                value={prefs.tier}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    preferences: {
                      ...p.preferences,
                      tier: e.target.value as typeof prefs.tier,
                    },
                  }))
                }
              >
                <option value="foundation">Foundation</option>
                <option value="higher">Higher</option>
              </select>
            </label>
            <label>
              Qualification
              <select
                aria-label="Qualification"
                value={prefs.course}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    preferences: {
                      ...p.preferences,
                      course: e.target.value as typeof prefs.course,
                    },
                  }))
                }
              >
                <option value="combined">Combined Science</option>
                <option value="separate">Separate Chemistry</option>
              </select>
            </label>
          </section>
          <section className="panel" id="your-data">
            <h2>Your data</h2>
            <p>
              Work, draft answers, question exposure and preferences stay in
              this browser. There is no account or synchronisation across
              devices. Clearing site storage removes saved learning.
            </p>
            <div className="button-row">
              <button className="button" onClick={download}>
                Download my data
              </button>
              <button
                className="button danger"
                onClick={() => setDeleting(true)}
              >
                Delete this app’s data
              </button>
            </div>
            {deleting && (
              <div
                className="delete-confirm"
                role="group"
                aria-label="Confirm data deletion"
              >
                <h3>Delete Chemistry progress?</h3>
                <p>
                  This removes only the gcse-chemistry progress and per-tab
                  recovery records in this tab. Close other Chemistry tabs
                  before deleting. It includes exposure history and cannot be
                  undone here. Maths and other websites’ data are not touched.
                </p>
                <div className="button-row">
                  <button
                    className="button danger"
                    onClick={() => {
                      const ok = deleteProgress();
                      setMessage(
                        ok
                          ? "Chemistry progress has been deleted. Other browser data was preserved."
                          : "Deletion failed because browser storage is unavailable.",
                      );
                      setDeleting(false);
                    }}
                  >
                    Yes, delete Chemistry data
                  </button>
                  <button className="button" onClick={() => setDeleting(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {message && (
              <p role="status" className="feedback">
                {message}
              </p>
            )}
            <p className="caption">
              The download is a backup for inspection; an import tool is not
              included. Unreadable saved data can also be exported before you
              choose to delete it.
            </p>
          </section>
        </>
      )}
    </>
  );
}
