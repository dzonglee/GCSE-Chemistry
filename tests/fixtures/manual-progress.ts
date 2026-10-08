import { lessons } from "../../src/content/curriculum";
import { emptyProgress, emptyWork, decode } from "../../src/lib/progress";
import { mark } from "../../src/lib/marking";

export function manualProgress(now: number, automaticWrong = false) {
  const lesson = lessons.find((l) => l.slug === "reaction-profiles")!;
  const form = lesson.journey!.checkForms[0];
  const automatic = form.find((q) => !q.rubric)!;
  const progress = emptyProgress();
  progress.work[lesson.slug] = {
    ...emptyWork(),
    section: "check",
    updated: now,
    run: {
      kind: "check",
      ids: form.map((q) => q.id),
      index: form.length - 1,
      started: now - 1000,
      submitted: now,
      responses: Object.fromEntries(
        form.map((q) => {
          const answer =
            automaticWrong && q.id === automatic.id ? "wrong" : q.answer;
          return [
            q.id,
            {
              answer,
              correct: mark(q, answer).correct,
              helped: false,
              fresh: true,
              at: now,
            },
          ];
        }),
      ),
    },
  };
  if (!decode(JSON.stringify(progress)))
    throw Error("Invalid progress fixture");
  return { progress, lesson, form };
}
