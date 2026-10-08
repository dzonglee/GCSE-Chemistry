import { lessons, topics } from "@/content/curriculum";
import { diagnostics } from "@/content/assessments";
import { mark } from "./marking";
import {
  dueReview,
  lessonStatus,
  observedResults,
  type Progress,
} from "./progress";
export function nextStep(
  progress: Progress,
  now = Date.now(),
): { title: string; reason: string; href: string; reviewSlug?: string } {
  const started = lessons
    .filter((l) => progress.work[l.slug])
    .sort(
      (a, b) => progress.work[b.slug].updated - progress.work[a.slug].updated,
    );
  const review = started.find((l) => dueReview(progress.work[l.slug], now));
  if (review)
    return {
      title: "Revisit after a gap",
      reason: `Your ${review.title.toLowerCase()} check is due for retrieval after seven days. ${review.journey ? "Reserved review forms are available; repeats remain practice evidence." : "These are previously seen questions."}`,
      href: `/lessons/${review.slug}`,
      reviewSlug: review.slug,
    };
  const resume = started.find(
    (l) => lessonStatus(l.slug, progress) === "In progress",
  );
  if (resume)
    return {
      title: "Continue your learning",
      reason: `Resume your saved work in ${resume.title.toLowerCase()}.`,
      href: `/lessons/${resume.slug}`,
    };
  const support = started.find((l) =>
    observedResults(l.slug, progress)?.some(
      (r) => !r.question.rubric && !r.correct,
    ),
  );
  if (support)
    return {
      title: "Give an idea another look",
      reason: `At least one response in your latest ${support.title.toLowerCase()} check did not match. Revisit the reasoning, then practise.`,
      href: `/lessons/${support.slug}`,
    };
  const results = diagnostics
    .map((a) => ({
      assessment: a,
      run: progress.work[`assessment-${a.slug}`]?.run,
    }))
    .filter((a) => a.run?.submitted !== undefined)
    .sort((a, b) => (b.run?.submitted ?? 0) - (a.run?.submitted ?? 0));
  if (results.length) {
    const { assessment, run } = results[0];
    const counts = topics
      .map((t) => ({
        topic: t,
        correct: assessment.questions.filter(
          (q, i) =>
            assessment.topics[i] === t.slug &&
            run?.responses[q.id] &&
            mark(q, run.responses[q.id].answer).correct,
        ).length,
      }))
      .sort((a, b) => a.correct - b.correct);
    if (counts[0].correct < 2)
      return {
        title: "Build on your starting check",
        reason: `In ${counts[0].topic.title.toLowerCase()}, ${counts[0].correct} of 2 responses matched the expected answers in your latest starting check. This suggests an area to revisit, not a grade or diagnosis.`,
        href: `/topics/${counts[0].topic.slug}`,
      };
  }
  const allowed = lessons.filter(
    (l) =>
      (progress.preferences.tier === "higher" || l.tier === "foundation") &&
      (progress.preferences.course === "separate" || l.course === "combined"),
  );
  const next = allowed.find((l) => !progress.work[l.slug]);
  if ((started.length || results.length) && next)
    return {
      title: "Explore your next idea",
      reason: `Try ${next.title.toLowerCase()} from your selected route. Finishing earlier checks does not prove prerequisite mastery.`,
      href: `/lessons/${next.slug}`,
    };
  if (started.length && !next)
    return {
      title: "Bring the topics together",
      reason:
        "Use mixed retrieval practice to revisit skills. Completed checks are records of responses, not mastery certification.",
      href: "/practice",
    };
  return {
    title: "Let’s find your starting point",
    reason: "Choose a lesson or try a low-stakes check across the ten topics.",
    href: "/diagnostics",
  };
}
