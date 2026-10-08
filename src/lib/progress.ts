import { useSyncExternalStore } from "react";
import { lessons, questionById } from "@/content/curriculum";
import { assessmentExposureIds } from "@/content/assessment-exposure";
import { mark } from "./marking";
import { validModel } from "./model-state";
import { validTaskModels } from "./workbench";
import { tasks } from "@/content/journeys/helpers";
import type { LearningStage, WorkbenchState } from "@/content/types";
export const STORAGE_KEY = "gcse-chemistry.progress.v1";
export const REVIEW_DELAY = 7 * 24 * 60 * 60 * 1000;
export interface Response {
  answer: string;
  working?: string;
  correct: boolean;
  helped: boolean;
  fresh: boolean;
  at: number;
}
export interface Run {
  kind: "check" | "review" | "diagnostic" | "paper";
  ids: string[];
  index: number;
  responses: Record<string, Response>;
  submitted?: number;
  started: number;
}
export interface Work {
  index: number;
  section: "explore" | "practice" | "check" | "review";
  drafts: Record<string, string>;
  hints: string[];
  attempts: Record<string, Response[]>;
  run?: Run;
  updated: number;
  history?: Run[];
  archivedRuns?: Run[];
  model?: Record<string, number | string>;
  learning?: { version: 1; stage: LearningStage; index: number };
  taskModels?: Record<string, WorkbenchState[]>;
}
export interface Progress {
  version: 1;
  revision: number;
  preferences: {
    tier: "foundation" | "higher";
    course: "combined" | "separate";
    board: "AQA" | "Edexcel" | "OCR";
  };
  work: Record<string, Work>;
  seen: Record<string, number>;
}
export interface Snapshot {
  data: Progress;
  warning: string;
  ready: boolean;
  blocked: boolean;
}
export const emptyProgress = (): Progress => ({
  version: 1,
  revision: 0,
  preferences: { tier: "foundation", course: "combined", board: "AQA" },
  work: {},
  seen: {},
});
export const emptyWork = (): Work => ({
  index: 0,
  section: "explore",
  drafts: {},
  hints: [],
  attempts: {},
  updated: 0,
});
const isObject = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const nonnegative = (x: unknown) =>
  typeof x === "number" && Number.isFinite(x) && x >= 0;
const response = (x: unknown) =>
  isObject(x) &&
  typeof x.answer === "string" &&
  (x.working === undefined ||
    (typeof x.working === "string" && x.working.length <= 3000)) &&
  typeof x.correct === "boolean" &&
  typeof x.helped === "boolean" &&
  typeof x.fresh === "boolean" &&
  nonnegative(x.at);
function validRun(value: unknown, finished = false): boolean {
  if (
    !isObject(value) ||
    !["check", "review", "diagnostic", "paper"].includes(String(value.kind)) ||
    !Array.isArray(value.ids) ||
    !value.ids.length ||
    !value.ids.every((id) => typeof id === "string" && id.length > 0) ||
    new Set(value.ids).size !== value.ids.length ||
    !Number.isSafeInteger(value.index) ||
    Number(value.index) < 0 ||
    Number(value.index) >= value.ids.length ||
    !nonnegative(value.started) ||
    !isObject(value.responses) ||
    !Object.values(value.responses).every(response) ||
    Object.keys(value.responses).some(
      (id) => !(value.ids as string[]).includes(id),
    )
  )
    return false;
  if (finished && value.submitted === undefined) return false;
  if (
    value.submitted !== undefined &&
    (!nonnegative(value.submitted) ||
      Object.keys(value.responses).length !== value.ids.length)
  )
    return false;
  return true;
}
export function decode(raw: string | null): Progress | null {
  if (raw === null) return emptyProgress();
  try {
    const p: unknown = JSON.parse(raw);
    if (
      !isObject(p) ||
      p.version !== 1 ||
      !Number.isSafeInteger(p.revision) ||
      Number(p.revision) < 0 ||
      !isObject(p.preferences) ||
      !["foundation", "higher"].includes(String(p.preferences.tier)) ||
      !["combined", "separate"].includes(String(p.preferences.course)) ||
      !["AQA", "Edexcel", "OCR"].includes(String(p.preferences.board)) ||
      !isObject(p.work) ||
      !isObject(p.seen) ||
      !Object.values(p.seen).every(nonnegative)
    )
      return null;
    for (const [id, w] of Object.entries(p.work)) {
      if (
        !id ||
        !isObject(w) ||
        !Number.isSafeInteger(w.index) ||
        Number(w.index) < 0 ||
        !["explore", "practice", "check", "review"].includes(
          String(w.section),
        ) ||
        !isObject(w.drafts) ||
        !Object.values(w.drafts).every((x) => typeof x === "string") ||
        !Array.isArray(w.hints) ||
        !w.hints.every((x) => typeof x === "string") ||
        !isObject(w.attempts) ||
        !Object.values(w.attempts).every(
          (a) => Array.isArray(a) && a.every(response),
        ) ||
        !nonnegative(w.updated)
      )
        return null;
      if (
        w.model !== undefined &&
        (!isObject(w.model) ||
          !Object.values(w.model).every(
            (x) =>
              typeof x === "string" ||
              (typeof x === "number" && Number.isFinite(x)),
          ))
      )
        return null;
      const lesson = lessons.find((lesson) => lesson.slug === id);
      if (
        lesson &&
        (lesson.questions.length
          ? Number(w.index) >= lesson.questions.length
          : !lesson.journey || Number(w.index) !== 0)
      )
        return null;
      if (lesson && isObject(w.model) && !validModel(lesson, w.model))
        return null;
      if (w.learning !== undefined) {
        if (
          !lesson?.journey ||
          !isObject(w.learning) ||
          w.learning.version !== 1 ||
          !["warmup", "refresher", "guided", "practice"].includes(
            String(w.learning.stage),
          ) ||
          !Number.isSafeInteger(w.learning.index) ||
          Number(w.learning.index) < 0 ||
          Number(w.learning.index) >=
            lesson.journey[w.learning.stage as LearningStage].length
        )
          return null;
      }
      if (
        w.taskModels !== undefined &&
        (!lesson?.journey || !validTaskModels(lesson.journey, w.taskModels))
      )
        return null;
      if (
        w.history !== undefined &&
        (!Array.isArray(w.history) ||
          !w.history.every((r) => validRun(r, true)))
      )
        return null;
      if (w.run !== undefined && !validRun(w.run)) return null;
      if (
        w.archivedRuns !== undefined &&
        (!Array.isArray(w.archivedRuns) ||
          !w.archivedRuns.every((r) => validRun(r)))
      )
        return null;
    }
    return p as unknown as Progress;
  } catch {
    return null;
  }
}
const server: Snapshot = {
  data: emptyProgress(),
  warning: "",
  ready: false,
  blocked: false,
};
const JOURNAL_KEY = "gcse-chemistry.pending.v1";
const CONFLICT_KEY = "gcse-chemistry.conflict.v1";
let snapshot: Snapshot = server;
let rawBase: string | null = null;
let initialized = false;
let queued = false;
let pending = false;
let epoch = 0;
const listeners = new Set<() => void>();
function emit() {
  for (const fn of listeners) fn();
}
function flush() {
  if (queued || !pending || snapshot.blocked) return;
  if (!navigator.locks) {
    snapshot = {
      ...snapshot,
      blocked: true,
      warning:
        "This browser cannot coordinate safe saves between tabs. Work is kept for this visit. Use a current browser over HTTPS to save progress.",
    };
    emit();
    return;
  }
  queued = true;
  const generation = epoch;
  void navigator.locks
    .request(STORAGE_KEY, { mode: "exclusive" }, () => {
      if (generation !== epoch || snapshot.blocked || !pending) return;
      const actual = localStorage.getItem(STORAGE_KEY);
      if (actual !== rawBase) {
        snapshot = {
          ...snapshot,
          blocked: true,
          warning:
            "Newer saved progress was found in another tab. Your pending work has been retained separately without overwriting it. Reload to use the latest saved record.",
        };
        emit();
        return;
      }
      const raw = JSON.stringify(snapshot.data);
      localStorage.setItem(STORAGE_KEY, raw);
      rawBase = raw;
      pending = false;
      sessionStorage.removeItem(JOURNAL_KEY);
    })
    .catch(() => {
      snapshot = {
        ...snapshot,
        blocked: true,
        warning:
          "Progress could not be committed. Your work remains available for this visit and any pending recovery record has been retained.",
      };
      emit();
    })
    .finally(() => {
      queued = false;
      if (generation === epoch && pending && !snapshot.blocked) flush();
    });
}
function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    rawBase = localStorage.getItem(STORAGE_KEY);
    const data = decode(rawBase);
    snapshot = {
      data: data ?? emptyProgress(),
      ready: true,
      blocked: !data,
      warning: data
        ? ""
        : "Saved data is unreadable. Its original contents have been preserved. Work is available for this visit; export or explicitly delete data in preferences to recover.",
    };
    const journalRaw = sessionStorage.getItem(JOURNAL_KEY);
    if (data && journalRaw) {
      try {
        const journal = JSON.parse(journalRaw);
        const recovered = decode(JSON.stringify(journal.next));
        if (!recovered) throw Error();
        if (journal.base === rawBase) {
          snapshot = { ...snapshot, data: recovered };
          pending = true;
          flush();
        } else {
          sessionStorage.setItem(CONFLICT_KEY, journalRaw);
          sessionStorage.removeItem(JOURNAL_KEY);
          snapshot = {
            ...snapshot,
            warning:
              "A previous pending draft conflicted with newer saved work and was retained separately for export. This tab now uses the latest saved record.",
          };
        }
      } catch {
        snapshot = {
          ...snapshot,
          blocked: true,
          warning:
            "A pending recovery record is unreadable. It has been preserved. Export or explicitly delete Chemistry data to recover.",
        };
      }
    }
  } catch {
    snapshot = {
      data: emptyProgress(),
      ready: true,
      blocked: true,
      warning:
        "Browser storage is unavailable. You can study, but progress will only last for this visit.",
    };
  }
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      snapshot = {
        ...snapshot,
        blocked: true,
        warning:
          "Progress changed in another tab. This tab is keeping your current work for this visit without overwriting the other tab. Reload to use the latest saved data.",
      };
      emit();
    }
  });
}
function subscribe(fn: () => void) {
  init();
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
function getSnapshot() {
  init();
  return snapshot;
}
export const useProgress = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => server);
export function update(change: (p: Progress) => Progress): boolean {
  init();
  const next = change(snapshot.data);
  next.revision = snapshot.data.revision + 1;
  if (snapshot.blocked) {
    snapshot = { ...snapshot, data: next };
    emit();
    return false;
  }
  try {
    if (localStorage.getItem(STORAGE_KEY) !== rawBase) {
      snapshot = {
        data: next,
        ready: true,
        blocked: true,
        warning:
          "Newer progress was found in another tab. Your work is kept for this visit, and the newer saved record has not been overwritten. Reload to continue saving.",
      };
      emit();
      return false;
    }
    // Synchronous per-tab journal protects immediate refresh before the async lock commits.
    sessionStorage.setItem(
      JOURNAL_KEY,
      JSON.stringify({ base: rawBase, next }),
    );
    pending = true;
    snapshot = { data: next, ready: true, blocked: false, warning: "" };
    emit();
    flush();
    return true;
  } catch {
    snapshot = {
      data: next,
      ready: true,
      blocked: true,
      warning:
        "Progress could not be saved. Your work is still available for this visit.",
    };
    emit();
    return false;
  }
}
export function setWork(id: string, change: (w: Work) => Work) {
  return update((p) => ({
    ...p,
    work: {
      ...p.work,
      [id]: { ...change(p.work[id] ?? emptyWork()), updated: Date.now() },
    },
  }));
}
export function exposureIds(ids: string[]) {
  const bank = lessons.flatMap((l) => [
    ...l.questions,
    ...l.checks,
    ...(l.journey ? tasks(l.journey) : []),
  ]);
  return [
    ...new Set(
      ids.flatMap((id) => [
        id,
        ...assessmentExposureIds(id),
        ...(questionById(id)?.exposureAliases ?? []),
        ...bank.filter((q) => q.exposureAliases?.includes(id)).map((q) => q.id),
      ]),
    ),
  ];
}
export function expose(ids: string[]) {
  ids = exposureIds(ids);
  if (ids.every((id) => snapshot.data.seen[id] !== undefined)) return;
  update((p) => ({
    ...p,
    seen: {
      ...p.seen,
      ...Object.fromEntries(
        ids
          .filter((id) => p.seen[id] === undefined)
          .map((id) => [id, Date.now()]),
      ),
    },
  }));
}
export function startRun(id: string, kind: Run["kind"], ids: string[]) {
  update((p) => {
    const w = p.work[id] ?? emptyWork();
    // Starting another delayed form must respect the latest actual submission.
    // Guard before recording exposure or replacing the current run/drafts.
    if (kind === "review" && !dueReview(w)) return p;
    const fresh = Object.fromEntries(
      ids.map((q) => [
        q,
        exposureIds([q]).every((alias) => p.seen[alias] === undefined),
      ]),
    );
    // Freshness is captured before the assessment display is registered.
    const draftMarkers = Object.fromEntries(
      ids.map((q) => ["fresh:" + q, String(fresh[q])]),
    );
    return {
      ...p,
      seen: {
        ...p.seen,
        ...Object.fromEntries(
          exposureIds(ids).map((q) => [q, p.seen[q] ?? Date.now()]),
        ),
      },
      work: {
        ...p.work,
        [id]: {
          ...w,
          section: kind === "review" ? "review" : "check",
          drafts: {
            ...w.drafts,
            ...draftMarkers,
            ...Object.fromEntries(
              ids.flatMap((q) => [
                [q, ""],
                ["working:" + q, ""],
              ]),
            ),
          },
          run: { kind, ids, index: 0, responses: {}, started: Date.now() },
          updated: Date.now(),
        },
      },
    };
  });
}
export function lastSubmission(w: Work | undefined) {
  return w?.history?.at(-1)?.submitted ?? w?.run?.submitted;
}
export function dueReview(w: Work | undefined, now = Date.now()) {
  const submitted = lastSubmission(w);
  return submitted !== undefined && now - submitted >= REVIEW_DELAY;
}
export function lessonStatus(slug: string, p: Progress) {
  const w = p.work[slug];
  if (!w) return "Not started";
  const lesson = lessons.find((l) => l.slug === slug);
  if (!lesson) return "In progress";
  if (
    w.history?.some(
      (r) =>
        r.kind === "check" &&
        r.submitted !== undefined &&
        [lesson.checks, ...(lesson.journey?.checkForms ?? [])].some((form) =>
          form.every((q) => r.responses[q.id]),
        ),
    ) ||
    (w.run?.submitted &&
      [lesson.checks, ...(lesson.journey?.checkForms ?? [])].some((form) =>
        form.every((q) => w.run?.responses[q.id]),
      ))
  )
    return "Check completed";
  return "In progress";
}
export function observedResults(slug: string, p: Progress) {
  const w = p.work[slug];
  const lesson = lessons.find((l) => l.slug === slug);
  const run =
    w?.history?.filter((r) => r.kind === "check").at(-1) ??
    (w?.run?.kind === "check" ? w.run : undefined);
  if (!run?.submitted || !lesson) return null;
  const bank = [
    ...lesson.checks,
    ...(lesson.journey ? tasks(lesson.journey) : []),
  ];
  return run.ids
    .map((id) => bank.find((q) => q.id === id))
    .filter((q) => q !== undefined)
    .map((q) => {
      const r = run.responses[q.id];
      return {
        question: q,
        response: r,
        correct: r ? mark(q, r.answer).correct : false,
      };
    });
}
export function deleteProgress() {
  try {
    epoch++;
    pending = false;
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(JOURNAL_KEY);
    sessionStorage.removeItem(CONFLICT_KEY);
    rawBase = null;
    snapshot = {
      data: emptyProgress(),
      ready: true,
      blocked: false,
      warning: "",
    };
    emit();
    return true;
  } catch {
    return false;
  }
}
export function exportData() {
  let raw: string | null = null,
    journal: string | null = null,
    conflict: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {}
  try {
    journal = sessionStorage.getItem(JOURNAL_KEY);
    conflict = sessionStorage.getItem(CONFLICT_KEY);
  } catch {}
  return snapshot.blocked || journal || conflict
    ? JSON.stringify(
        {
          savedRaw: raw,
          pendingRaw: journal,
          conflictingDraftRaw: conflict,
          session: snapshot.data,
        },
        null,
        2,
      )
    : (raw ?? JSON.stringify(snapshot.data));
}
