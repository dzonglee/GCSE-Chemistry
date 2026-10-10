"use client";
import { TemperatureGraphReference } from "./TemperatureGraphReference";
import { GasDrawingReview } from "./GasDrawingInput";
import { ChromaDrawingReview } from "./ChromaDrawingInput";
import { PurityDrawingReview } from "./PurityDrawingInput";
import { NaturalReview } from "./NaturalDrawingInput";
import { PathwayReview } from "./PathwayReview";
import { PolymerisationReview } from "./PolymerisationReview";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Lesson, LessonJourney, LearningStage } from "@/content/types";
import { lessons, topics } from "@/content/curriculum";
import {
  useProgress,
  emptyWork,
  setWork,
  expose,
  dueReview,
  lastSubmission,
  REVIEW_DELAY,
} from "@/lib/progress";
import { initialBoard } from "@/lib/workbench";
import { mark, reviewSubject } from "@/lib/marking";
import { QuestionInput } from "./QuestionInput";
import { TaskWorkbench } from "./TaskWorkbench";
import { WorkbenchInputDraft } from "./WorkbenchInputDraft";
import { AssessmentSession } from "./AssessmentSession";
import { naturalForTier } from "@/content/journeys/natural-higher-assessments";
import { acidMetalForTier } from "@/content/journeys/acid-metal-writing";
import { statesForTier } from "@/content/journeys/states-writing";
import { haberForTier } from "@/content/journeys/haber-and-fertilisers";
import { polymerisationForTier } from "@/content/journeys/condensation-writing";
export function DetailedLesson({
  lesson,
  journey: fullJourney,
}: {
  lesson: Lesson;
  journey: LessonJourney;
}) {
  const { data, ready } = useProgress();
  const mixedHaber = lesson.slug === "haber-and-fertilisers";
  const mixedStates = lesson.slug === "states-of-matter";
  const mixedNatural = lesson.slug === "natural-polymers";
  const mixedAcid = lesson.slug === "acids-and-neutralisation";
  const mixedPolymer = lesson.slug === "polymers";
  const filteredLearning = mixedHaber || mixedAcid || mixedPolymer;
  const journey = mixedHaber
    ? haberForTier(data.preferences.tier)
    : mixedStates
      ? statesForTier(fullJourney, data.preferences.tier)
      : mixedAcid
        ? acidMetalForTier(fullJourney, data.preferences.tier)
        : mixedNatural
          ? naturalForTier(fullJourney, data.preferences.tier)
          : mixedPolymer
            ? polymerisationForTier(fullJourney, data.preferences.tier)
            : fullJourney;
  const work = data.work[lesson.slug] ?? emptyWork();
  const section = work.section;
  const saltLesson = lesson.slug === "making-soluble-salts";
  const organicLesson = lesson.slug === "organic-reactions";
  const materialsLesson = lesson.slug === "materials-and-corrosion";
  const warmupAfterResponse =
    saltLesson ||
    organicLesson ||
    materialsLesson ||
    (lesson.slug === "yield-and-atom-economy" &&
      (section === "check" || section === "review"));
  const stage: LearningStage =
    section === "practice" ? "practice" : (work.learning?.stage ?? "guided");
  const list = journey[stage];
  const savedPosition =
    work.learning?.stage === stage
      ? Math.min(work.learning.index, fullJourney[stage].length - 1)
      : 0;
  const index = filteredLearning
    ? Math.max(
        0,
        list.findIndex((q) => q.id === fullJourney[stage][savedPosition]?.id),
      )
    : savedPosition;
  const q = list[index];
  const compactRecallTask =
    q.id.startsWith("materials-v1-alloy-use-") ||
    q.id.startsWith("materials-v1-rust-design-") ||
    q.id.startsWith("materials-v1-composite-recall-") ||
    q.id.startsWith("haber-v1-source-recall-");
  const answer = work.drafts[q.id] ?? "";
  const attempt = work.attempts[q.id]?.at(-1);
  const feedback = attempt?.answer === answer ? mark(q, answer) : undefined;
  const modelShown =
    !!q.model &&
    (stage === "guided" ||
      stage === "refresher" ||
      work.hints.includes("model:" + q.id));
  const topic = topics.find((t) => t.slug === lesson.topic)!;
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null),
    lastTask = useRef(""),
    stages = useRef<HTMLElement>(null),
    taskNavigation = useRef<HTMLDivElement>(null),
    mobileTaskNavigation = useRef<HTMLDivElement>(null);
  const taskKey = `${section}:${q.id}`;
  useEffect(() => {
    if (ready && (section === "explore" || section === "practice"))
      expose([q.id]);
    if (ready && lastTask.current && lastTask.current !== taskKey)
      heading.current?.focus();
    if (ready) lastTask.current = taskKey;
  }, [ready, section, q.id, taskKey]);
  useEffect(() => {
    if (!ready) return;
    const nav = stages.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!nav || !active) return;
    const frame = nav.getBoundingClientRect(),
      tab = active.getBoundingClientRect();
    // Reveal the active tab horizontally without scrolling the lesson vertically.
    if (tab.left < frame.left) nav.scrollLeft += tab.left - frame.left;
    else if (tab.right > frame.right) nav.scrollLeft += tab.right - frame.right;
  }, [ready, section, stage]);
  useEffect(() => {
    if (!ready) return;
    const navs = [taskNavigation.current, mobileTaskNavigation.current].filter(
      (nav): nav is HTMLDivElement => nav !== null,
    );
    if (!navs.length) return;
    let cancelled = false;
    const reveal = () => {
      if (cancelled) return;
      for (const nav of navs) {
        if (!nav.getClientRects().length) continue;
        const active = nav.querySelector<HTMLElement>('[aria-current="step"]');
        if (!active) continue;
        const frame = nav.getBoundingClientRect(),
          tab = active.getBoundingClientRect();
        if (tab.left < frame.left)
          nav.scrollLeft += Math.floor(tab.left - frame.left);
        else if (tab.right > frame.right)
          nav.scrollLeft += Math.ceil(tab.right - frame.right);
      }
    };
    const observer = new ResizeObserver(reveal);
    for (const nav of navs) observer.observe(nav);
    void document.fonts.ready.then(reveal);
    reveal();
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [ready, lesson.slug, q.id, q.rubric, section, stage]);
  const choose = (next: LearningStage | "check" | "review", position = 0) => {
    setMessage("");
    setWork(lesson.slug, (w) =>
      next === "check" || next === "review"
        ? { ...w, section: next }
        : {
            ...w,
            section: next === "practice" ? "practice" : "explore",
            learning: {
              version: 1,
              stage: next,
              index: filteredLearning
                ? Math.max(
                    0,
                    fullJourney[next].findIndex(
                      (q) => q.id === journey[next][position]?.id,
                    ),
                  )
                : position,
            },
          },
    );
  };
  const submit = () => {
    const result = mark(q, answer);
    setMessage(result.feedback);
    if (result.empty || result.invalid) return;
    setWork(lesson.slug, (w) => ({
      ...w,
      attempts: {
        ...w.attempts,
        [q.id]: [
          ...(w.attempts[q.id] ?? []),
          {
            answer,
            correct: result.correct,
            helped:
              stage === "guided" ||
              stage === "refresher" ||
              w.hints.includes(q.id) ||
              w.hints.includes("model:" + q.id),
            fresh: false,
            at: Date.now(),
          },
        ],
      },
    }));
  };
  const revisit = () => {
    const position = Math.max(
      0,
      journey.refresher.findIndex((task) => task.id === q.followUp),
    );
    setMessage("");
    setWork(lesson.slug, (w) => ({
      ...w,
      section: "explore",
      learning: {
        version: 1,
        stage: "refresher",
        index: filteredLearning
          ? Math.max(
              0,
              fullJourney.refresher.findIndex(
                (q) => q.id === journey.refresher[position]?.id,
              ),
            )
          : position,
      },
      drafts: {
        ...w.drafts,
        "revisit:stage": stage,
        "revisit:index": String(index),
      },
    }));
  };
  const returnToTask = () => {
    const previous = work.drafts["revisit:stage"];
    const savedIndex = Number(work.drafts["revisit:index"]);
    if (
      (previous === "warmup" ||
        previous === "guided" ||
        previous === "practice") &&
      Number.isSafeInteger(savedIndex) &&
      savedIndex >= 0 &&
      savedIndex < journey[previous].length
    )
      choose(previous, savedIndex);
    else choose("guided");
  };
  const next = lessons[lessons.findIndex((l) => l.slug === lesson.slug) + 1];
  const submitted = lastSubmission(work);
  const legacyRun =
    work.run?.kind === section &&
    work.run.ids.every((id) => lesson.checks.some((q) => q.id === id));
  const learningTasks = [...journey.guided, ...journey.practice];
  const tried = learningTasks.filter(
    (task) => (work.attempts[task.id]?.length ?? 0) > 0,
  ).length;
  const hintVisible = q.openingHint || work.hints.includes(q.id);
  const nextTask = () =>
    index < list.length - 1
      ? choose(stage, index + 1)
      : stage === "refresher"
        ? returnToTask()
        : choose(
            stage === "practice"
              ? "check"
              : stage === "guided"
                ? "practice"
                : "guided",
          );
  const nextLabel =
    index < list.length - 1
      ? "Next task →"
      : stage === "practice"
        ? "Try an independent check →"
        : stage === "guided"
          ? "Practise without the model →"
          : "Return to learning →";
  const compactEquationForm =
    lesson.slug === "energy-practical" &&
    work.run?.ids.every((id) => id.startsWith("ep-v1-equation-"));
  const compactResourceReview =
    lesson.slug === "life-cycle-and-recycling" &&
    work.run?.kind === "review" &&
    work.run.ids.every((id) => id.startsWith("lca-v1-resource-"));
  const compactCondensationReview =
    mixedPolymer &&
    work.run?.kind === "review" &&
    work.run.ids.every((id) => id.startsWith("pol-cond-v1-"));
  const compactYieldReview = lesson.slug === "yield-and-atom-economy";
  const compactIonReview = [
    "ion-tests",
    "aqueous-electrolysis-products",
    "natural-polymers",
    "ph-scale-and-indicators",
    "life-cycle-and-recycling",
  ].includes(lesson.slug);
  const minorAtmosphereRun = work.run?.ids.some((id) =>
    id.startsWith("early-atmosphere-v1-minor-"),
  );
  const compactRecallRun = work.run?.ids.some(
    (id) =>
      id.startsWith("materials-v1-alloy-use-") ||
      id.startsWith("materials-v1-rust-design-") ||
      id.startsWith("materials-v1-composite-recall-") ||
      id.startsWith("haber-v1-source-recall-"),
  );
  const compactReview =
    (compactRecallRun ||
      minorAtmosphereRun ||
      compactYieldReview ||
      saltLesson ||
      organicLesson ||
      compactCondensationReview ||
      compactIonReview ||
      lesson.slug === "inside-an-atom" ||
      lesson.slug === "balancing-equations" ||
      lesson.slug === "transition-metals" ||
      lesson.slug === "atomic-models" ||
      compactResourceReview ||
      compactEquationForm ||
      [
        "periodic-development",
        "group-reactions",
        "group-seven",
        "group-zero",
        "periodic-patterns",
        "ionic-bonding",
        "ionic-structures",
        "states-of-matter",
        "covalent-bonding",
        "small-molecules-properties",
        "structure-and-properties",
        "carbon-structures",
        "graphite",
        "graphene",
        "fullerenes",
        "carbon-nanotubes",
        "polymer-structures",
        "particles-and-nanoparticles",
        "conservation-of-mass",
        "measurement-uncertainty",
        "changing-concentration",
        "metal-reactivity",
        "acids-and-neutralisation",
        "electrolysis",
      ].includes(lesson.slug)) &&
    section === "review" &&
    work.run?.kind === "review" &&
    work.run.submitted === undefined;
  const ReviewContainer = compactReview ? "details" : "section";
  const reviewScheduleAfter =
    compactReview &&
    (compactRecallRun ||
      minorAtmosphereRun ||
      compactYieldReview ||
      saltLesson ||
      organicLesson ||
      compactCondensationReview ||
      compactIonReview ||
      lesson.slug === "balancing-equations" ||
      lesson.slug === "transition-metals" ||
      lesson.slug === "atomic-models" ||
      compactResourceReview ||
      compactEquationForm ||
      [
        "periodic-development",
        "group-reactions",
        "group-seven",
        "group-zero",
        "periodic-patterns",
        "ionic-bonding",
        "ionic-structures",
        "states-of-matter",
        "covalent-bonding",
        "small-molecules-properties",
        "structure-and-properties",
        "carbon-structures",
        "graphite",
        "graphene",
        "fullerenes",
        "carbon-nanotubes",
        "polymer-structures",
        "particles-and-nanoparticles",
        "conservation-of-mass",
        "measurement-uncertainty",
        "changing-concentration",
        "metal-reactivity",
        "acids-and-neutralisation",
        "electrolysis",
      ].includes(lesson.slug));
  const reviewSchedule = (
    <ReviewContainer className={compactReview ? "review-schedule" : "panel"}>
      {compactReview && <summary>About this delayed review</summary>}
      <h2>Retrieve after a gap</h2>
      <p>
        Come back after seven days to try separate questions. Later repeats stay
        practice; one set of answers does not establish mastery.
      </p>
      <p>
        {submitted === undefined
          ? "Complete a check first to schedule your review."
          : !dueReview(work) && work.run?.kind !== "review"
            ? `Review is available from ${new Date(submitted + REVIEW_DELAY).toLocaleDateString("en-GB")}.`
            : "Your delayed review is available."}
      </p>
    </ReviewContainer>
  );
  const practicePicker = stage === "practice" && journey.practiceGroups && (
    <div className="practice-task-picker">
      <label htmlFor="choose-practice-task">Choose a practice task</label>
      <select
        id="choose-practice-task"
        value={index}
        onChange={(e) => choose(stage, Number(e.target.value))}
      >
        {journey.practiceGroups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.taskIds.map((id) => {
              const i = list.findIndex((t) => t.id === id),
                t = list[i];
              return t ? (
                <option key={id} value={i}>
                  {i + 1}. {t.title ?? t.prompt}
                </option>
              ) : null;
            })}
          </optgroup>
        ))}
      </select>
    </div>
  );
  return (
    <article className="sample-lesson" data-lesson={lesson.slug}>
      <div className="lesson-breadcrumb">
        <Link href="/">Contents</Link>
        <span>/</span>
        <Link href={`/topics/${lesson.topic}`}>{topic.title}</Link>
        {lesson.tier === "higher" && (
          <strong className="sample-tier">Higher</strong>
        )}
        {lesson.course === "separate" && (
          <strong className="sample-course-scope">Chemistry only</strong>
        )}
        <span>/</span>
        <span>{lesson.title}</span>
      </div>
      <div className="sample-title-row">
        <span
          className="sample-topic-tile"
          aria-hidden="true"
          style={{ background: `var(--${topic.colour})` }}
        >
          {topics.indexOf(topic) + 1}
        </span>
        <h1>{lesson.title}</h1>
      </div>
      <div className="sample-overview">
        <p>
          Whole lesson:{" "}
          <strong>
            {tried} of {learningTasks.length} learning tasks tried
          </strong>
        </p>
        {!warmupAfterResponse &&
          (![
            "atomic-models",
            "periodic-development",
            "group-reactions",
            "group-seven",
            "group-zero",
            "periodic-patterns",
            "ionic-bonding",
            "ionic-structures",
            "states-of-matter",
            "covalent-bonding",
            "small-molecules-properties",
            "structure-and-properties",
            "carbon-structures",
            "graphite",
            "graphene",
            "fullerenes",
            "carbon-nanotubes",
            "polymer-structures",
            "particles-and-nanoparticles",
            "conservation-of-mass",
            "measurement-uncertainty",
            "changing-concentration",
            "metal-reactivity",
            "acids-and-neutralisation",
            "electrolysis",
            "ion-tests",
            "aqueous-electrolysis-products",
            "natural-polymers",
            "ph-scale-and-indicators",
            "life-cycle-and-recycling",
          ].includes(lesson.slug) ||
            (section === "explore" && stage === "guided")) && (
            <button className="text-button" onClick={() => choose("warmup")}>
              Rusty? Try the warm-up first
            </button>
          )}
      </div>
      <nav ref={stages} className="sample-stages" aria-label="Lesson stages">
        {(
          [
            ["warmup", "Warm-up"],
            ["guided", "Learn the method"],
            ["practice", "Practice"],
            ["check", "Check your understanding"],
            ["review", "Review later"],
          ] as const
        ).map(([id, label], i) => {
          const active =
            section === id ||
            (section === "explore" &&
              (stage === id || (id === "guided" && stage === "refresher")));
          return (
            <button
              key={id}
              aria-label={
                id === "guided"
                  ? "Learn"
                  : id === "practice"
                    ? "Practise"
                    : id === "check"
                      ? "Check"
                      : id === "review"
                        ? "Review"
                        : "Warm-up"
              }
              aria-current={active ? "step" : undefined}
              onClick={() => choose(id)}
            >
              <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {label}
            </button>
          );
        })}
      </nav>
      {!ready ? (
        <p role="status">Loading your saved lesson…</p>
      ) : section === "check" || section === "review" ? (
        <>
          {section === "review" && !reviewScheduleAfter && reviewSchedule}
          {legacyRun && (
            <section className="panel">
              <p>Your earlier check is retained with its original questions.</p>
              <button
                className="button"
                onClick={() =>
                  setWork(lesson.slug, (w) => ({
                    ...w,
                    archivedRuns: w.run
                      ? [...(w.archivedRuns ?? []), w.run]
                      : w.archivedRuns,
                    run: undefined,
                  }))
                }
              >
                Use rebuilt assessment forms
              </button>
            </section>
          )}
          {(section === "check" ||
            dueReview(work) ||
            work.run?.kind === "review") && (
            <AssessmentSession
              id={lesson.slug}
              navigationAfterResponse={
                compactRecallRun ||
                minorAtmosphereRun ||
                saltLesson ||
                organicLesson ||
                mixedPolymer ||
                mixedNatural ||
                lesson.slug === "ph-scale-and-indicators" ||
                lesson.slug === "life-cycle-and-recycling" ||
                lesson.slug === "yield-and-atom-economy" ||
                lesson.slug === "aqueous-electrolysis-products" ||
                lesson.slug === "ion-tests" ||
                compactEquationForm ||
                lesson.slug === "inside-an-atom" ||
                lesson.slug === "balancing-equations" ||
                lesson.slug === "transition-metals" ||
                lesson.slug === "atomic-models" ||
                [
                  "periodic-development",
                  "group-reactions",
                  "group-seven",
                  "group-zero",
                  "periodic-patterns",
                  "ionic-bonding",
                  "ionic-structures",
                  "states-of-matter",
                  "covalent-bonding",
                  "small-molecules-properties",
                  "structure-and-properties",
                  "carbon-structures",
                  "graphite",
                  "graphene",
                  "fullerenes",
                  "carbon-nanotubes",
                  "polymer-structures",
                  "particles-and-nanoparticles",
                  "conservation-of-mass",
                  "measurement-uncertainty",
                  "changing-concentration",
                  "metal-reactivity",
                  "acids-and-neutralisation",
                  "electrolysis",
                  "ion-tests",
                ].includes(lesson.slug)
              }
              title={
                section === "check"
                  ? "Check your understanding"
                  : "Delayed retrieval review"
              }
              kind={section}
              questions={
                legacyRun
                  ? lesson.checks
                  : section === "check"
                    ? journey.checkForms[0]
                    : journey.reviewForms[0]
              }
              forms={
                legacyRun
                  ? undefined
                  : section === "check"
                    ? journey.checkForms
                    : journey.reviewForms
              }
              savedForms={
                (mixedHaber ||
                  mixedStates ||
                  mixedAcid ||
                  mixedNatural ||
                  mixedPolymer) &&
                !legacyRun
                  ? [
                      ...(section === "check"
                        ? fullJourney.checkForms
                        : fullJourney.reviewForms),
                      ...(section === "check"
                        ? (mixedNatural
                            ? naturalForTier(fullJourney, "foundation")
                            : mixedStates
                              ? statesForTier(fullJourney, "foundation")
                              : mixedAcid
                                ? acidMetalForTier(fullJourney, "foundation")
                                : mixedPolymer
                                  ? polymerisationForTier(
                                      fullJourney,
                                      "foundation",
                                    )
                                  : haberForTier("foundation")
                          ).checkForms
                        : (mixedNatural
                            ? naturalForTier(fullJourney, "foundation")
                            : mixedStates
                              ? statesForTier(fullJourney, "foundation")
                              : mixedAcid
                                ? acidMetalForTier(fullJourney, "foundation")
                                : mixedPolymer
                                  ? polymerisationForTier(
                                      fullJourney,
                                      "foundation",
                                    )
                                  : haberForTier("foundation")
                          ).reviewForms),
                    ]
                  : undefined
              }
              onExit={() => choose("guided")}
            />
          )}
          {reviewScheduleAfter && reviewSchedule}
          <div className="button-row">
            {warmupAfterResponse && (
              <button className="text-button" onClick={() => choose("warmup")}>
                Rusty? Try the warm-up first
              </button>
            )}
            <button className="button" onClick={() => choose("refresher")}>
              Revisit the key idea
            </button>
            <button className="button" onClick={() => choose("practice")}>
              Return to practice
            </button>
          </div>
        </>
      ) : (
        <section
          className="sample-task-panel"
          data-materials-recall={compactRecallTask || undefined}
          data-atmosphere-minor={
            q.id.startsWith("early-atmosphere-v1-minor-") || undefined
          }
          data-salt-heating={saltLesson || undefined}
          data-alkene-combustion={organicLesson || undefined}
          data-yield-reversible={
            q.id.startsWith("py-v1-reversible-") || undefined
          }
          data-ion-equation-writing={
            q.id.startsWith("ion-tests-v1-write-") || undefined
          }
          aria-label="Current learning task"
        >
          <div className="sample-task-topline">
            <span className="sample-task-chip">
              {stage === "refresher"
                ? "Refresher"
                : stage === "warmup"
                  ? "Warm-up"
                  : "Task"}{" "}
              {index + 1} of {list.length}
            </span>
            {stage === "practice" && journey.practiceGroups ? (
              lesson.slug !== "life-cycle-and-recycling" &&
              !organicLesson &&
              !q.id.startsWith("alc-write-v1-") &&
              !q.id.startsWith("early-atmosphere-v1-minor-") &&
              !compactRecallTask &&
              !q.polyesterDrawing &&
              practicePicker
            ) : !compactRecallTask &&
              lesson.slug !== "materials-and-corrosion" ? (
              <div
                ref={taskNavigation}
                className="question-navigation"
                aria-label="Learning task navigation"
              >
                {list.map((task, i) => (
                  <button
                    key={task.id}
                    aria-label={`Task ${i + 1}`}
                    aria-current={index === i ? "step" : undefined}
                    className={index === i ? "current" : ""}
                    onClick={() => choose(stage, i)}
                  >
                    Task {i + 1}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <h2 ref={heading} tabIndex={-1}>
            {q.title ?? q.prompt}
          </h2>
          {filteredLearning && !mixedPolymer && q.tier === "higher" && (
            <p className="sample-tier">Higher extension</p>
          )}
          {q.title && <p className="sample-task-prompt">{q.prompt}</p>}
          <div
            className={`sample-task-layout ${modelShown ? "has-model" : ""}`}
          >
            {modelShown && q.model && (
              <div className="sample-task-work">
                <WorkbenchInputDraft
                  key={q.id}
                  draft={work.drafts["model-input:" + q.id]}
                  board={
                    work.taskModels?.[q.id]?.at(-1) ?? initialBoard(q.model)
                  }
                  onSave={(draft) =>
                    setWork(lesson.slug, (w) => ({
                      ...w,
                      drafts: { ...w.drafts, ["model-input:" + q.id]: draft },
                    }))
                  }
                >
                  <TaskWorkbench
                    key={q.id}
                    model={q.model}
                    history={work.taskModels?.[q.id] ?? [initialBoard(q.model)]}
                    onChange={(history) =>
                      setWork(lesson.slug, (w) => ({
                        ...w,
                        taskModels: {
                          ...w.taskModels,
                          [q.id]: history.length
                            ? history
                            : [initialBoard(q.model!)],
                        },
                      }))
                    }
                  />
                </WorkbenchInputDraft>
              </div>
            )}
            <div className="sample-task-answer">
              {hintVisible && (
                <aside className="sample-hint">
                  <strong>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      aria-hidden="true"
                    >
                      <path d="M8 15a7 7 0 1 1 8 0l-1 3H9l-1-3Z" />
                      <path d="M9 21h6M10 18v-5l-2-2m6 7v-5l2-2" />
                    </svg>
                    Hint
                  </strong>
                  <p>{q.hint}</p>
                </aside>
              )}
              <form
                className="question-panel"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <QuestionInput
                  question={q}
                  compactHistorical={lesson.slug === "atomic-models"}
                  compactMaterials={lesson.slug === "materials-and-corrosion"}
                  value={answer}
                  onChange={(value) => {
                    setMessage("");
                    setWork(lesson.slug, (w) => ({
                      ...w,
                      drafts: { ...w.drafts, [q.id]: value },
                    }));
                  }}
                />
                <button
                  className="button primary sample-check-answer"
                  type="submit"
                >
                  {q.rubric
                    ? `Save and review ${reviewSubject(q)}`
                    : "Check answer"}
                </button>
                {(message || feedback) && (
                  <div
                    className={`feedback ${feedback?.correct ? "correct" : ""}`}
                    role="status"
                  >
                    <strong>
                      {feedback?.selfReview
                        ? `Compare your ${reviewSubject(q)}.`
                        : feedback?.correct
                          ? "That’s right."
                          : feedback
                            ? "Not yet."
                            : "Keep thinking."}
                    </strong>
                    <p>{message || feedback?.feedback}</p>
                    {feedback?.selfReview && q.rubric && (
                      <>
                        {q.fuelDrawing && (
                          <TemperatureGraphReference drawing={q.fuelDrawing} />
                        )}
                        {q.gasDrawing && (
                          <GasDrawingReview
                            showRetained={false}
                            data={q.gasDrawing}
                            value={answer}
                          />
                        )}
                        {q.chromatographyDrawing && (
                          <ChromaDrawingReview
                            showRetained={false}
                            data={q.chromatographyDrawing}
                            value={answer}
                          />
                        )}
                        {q.purityDrawing && (
                          <PurityDrawingReview
                            showRetained={false}
                            data={q.purityDrawing}
                            value={answer}
                          />
                        )}
                        {q.naturalDrawing && (
                          <NaturalReview data={q.naturalDrawing} />
                        )}
                        <PathwayReview question={q} />
                        <PolymerisationReview question={q} />
                        <ul>
                          {q.rubric.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                        {q.referenceResponse && (
                          <details className="sample-reference">
                            <summary>Compare a reference response</summary>
                            <p>{q.referenceResponse}</p>
                            <p>
                              Use the criteria to compare the reasoning, then
                              improve your own response.
                            </p>
                          </details>
                        )}
                        <p>
                          {q.gasDrawing
                            ? "Use the criteria to check the initial material, contact position, actual observation and warranted conclusion."
                            : q.chromatographyDrawing
                              ? "Use the criteria to check the original origin, centres, solvent front, phases and stated experimental conditions."
                              : q.purityDrawing
                                ? "Use the criteria to check the apparatus, material paths, phase changes and endpoint contents."
                                : q.naturalDrawing ||
                                    q.organicDrawing ||
                                    q.pathwayDrawing ||
                                    q.polymerisationDrawing ||
                                    q.polyesterDrawing
                                  ? "Use the criteria to check every atom, bond and functional group."
                                  : q.fuelDrawing
                                    ? "Use the criteria to check your points, fit and estimate."
                                    : "Improve any missing point using the marking points above. Include the reasons for your conclusion."}
                        </p>
                      </>
                    )}
                    {feedback && !feedback.correct && q.followUp && (
                      <button
                        className="text-button"
                        type="button"
                        onClick={revisit}
                      >
                        Revisit the key idea
                      </button>
                    )}
                  </div>
                )}
              </form>
              <p className="sample-learning-note">
                {stage === "practice"
                  ? "Try your own answer first. Use support if you need it."
                  : "Try a step, explain what changed, then check your answer."}
              </p>
              {q.polyesterDrawing && !organicLesson && practicePicker}
              <div className="sample-task-actions">
                {!q.openingHint && (
                  <button
                    className="button"
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
                )}
                {q.model && !modelShown && (
                  <button
                    className="button"
                    onClick={() =>
                      setWork(lesson.slug, (w) => ({
                        ...w,
                        hints: [...new Set([...w.hints, "model:" + q.id])],
                      }))
                    }
                  >
                    Use the model for support
                  </button>
                )}
                {stage === "refresher" && (
                  <button className="button" onClick={returnToTask}>
                    Return to your task →
                  </button>
                )}
                {(stage !== "refresher" || index < list.length - 1) && (
                  <button className="button" onClick={nextTask}>
                    {nextLabel}
                  </button>
                )}
              </div>
              <div className="sample-recovery">
                {index > 0 && (
                  <button
                    className="text-button"
                    onClick={() => choose(stage, index - 1)}
                  >
                    ← Previous task
                  </button>
                )}
                <button
                  className="text-button"
                  onClick={() => {
                    setWork(lesson.slug, (w) => ({
                      ...w,
                      drafts: { ...w.drafts, [q.id]: "" },
                    }));
                    setMessage(
                      "Answer cleared. Earlier attempts and exposure are retained.",
                    );
                  }}
                >
                  Clear answer
                </button>
              </div>
            </div>
          </div>
          {(lesson.slug === "life-cycle-and-recycling" ||
            organicLesson ||
            q.id.startsWith("alc-write-v1-") ||
            q.id.startsWith("early-atmosphere-v1-minor-") ||
            compactRecallTask) &&
            practicePicker}
          {(!(stage === "practice" && journey.practiceGroups) ||
            lesson.slug === "balancing-equations" ||
            lesson.slug === "transition-metals" ||
            lesson.slug === "atomic-models" ||
            [
              "periodic-development",
              "group-reactions",
              "group-seven",
              "group-zero",
              "periodic-patterns",
              "ionic-bonding",
              "ionic-structures",
              "states-of-matter",
              "covalent-bonding",
              "small-molecules-properties",
              "structure-and-properties",
              "carbon-structures",
              "graphite",
              "graphene",
              "fullerenes",
              "carbon-nanotubes",
              "polymer-structures",
              "particles-and-nanoparticles",
              "conservation-of-mass",
              "measurement-uncertainty",
              "changing-concentration",
              "metal-reactivity",
              "acids-and-neutralisation",
              "electrolysis",
            ].includes(lesson.slug)) && (
            <div
              ref={mobileTaskNavigation}
              className="sample-mobile-tasks question-navigation"
              aria-label="Learning task navigation"
            >
              {list.map((task, i) => (
                <button
                  key={task.id}
                  aria-label={`Task ${i + 1}`}
                  aria-current={index === i ? "step" : undefined}
                  className={index === i ? "current" : ""}
                  onClick={() => choose(stage, i)}
                >
                  Task {i + 1}
                </button>
              ))}
            </div>
          )}
          <details className="sample-explanation">
            <summary>Why does this work?</summary>
            <p>{lesson.concept}</p>
            <p>{journey.introduction}</p>
          </details>
        </section>
      )}
      {(saltLesson || organicLesson || materialsLesson) &&
        section !== "check" &&
        section !== "review" && (
          <p className="sample-learning-note">
            <button className="text-button" onClick={() => choose("warmup", 0)}>
              Rusty? Try the warm-up first
            </button>
          </p>
        )}
      <div className="sample-extras">
        <details>
          <summary>What am I learning?</summary>
          {(journey.outcomes ?? [lesson.goal]).map((outcome) => (
            <p key={outcome}>{outcome}</p>
          ))}
          {filteredLearning && (
            <p>
              Showing{" "}
              {data.preferences.tier === "higher"
                ? "Foundation and Higher"
                : "Foundation"}{" "}
              tasks. <Link href="/preferences">Change your study tier</Link>.
              Saved answers and started checks stay in their original forms.
            </p>
          )}
          {journey.scopeNote && <p>{journey.scopeNote}</p>}
        </details>
        <details>
          <summary>How this lesson is checked</summary>
          <p>
            Learning tasks give feedback and optional support. Checks reserve
            two different forms and hide feedback until submission. Reviews use
            separate forms after seven days. Written explanations are compared
            with marking points; they receive no automatic mark.
          </p>
        </details>
      </div>
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
    </article>
  );
}
