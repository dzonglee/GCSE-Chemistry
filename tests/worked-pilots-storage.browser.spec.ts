import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { lessons } from "../src/content/curriculum";
import {
  STORAGE_KEY,
  REVIEW_DELAY,
  decode,
  dueReview,
  emptyProgress,
  emptyWork,
  exposureIds,
  lessonStatus,
  observedResults,
  type Progress,
  type Run,
} from "../src/lib/progress";
import { initialBoard } from "../src/lib/workbench";

const PENDING_KEY = "gcse-chemistry.pending.v1";
const CONFLICT_KEY = "gcse-chemistry.conflict.v1";
const pilots = [
  {
    slug: "relative-atomic-mass",
    frame: "relative-atomic-mass-worked",
    modelTask: "ram-v1-g-light",
  },
  {
    slug: "inside-an-atom",
    frame: "inside-atom-worked",
    modelTask: "atom-v2-g-neutral",
  },
] as const;
type Pilot = (typeof pilots)[number];

function retainedProgress(now = Date.now()): Progress {
  const progress = emptyProgress();
  progress.revision = 8;
  for (const pilot of pilots) {
    const journey = lessons.find(
      (lesson) => lesson.slug === pilot.slug,
    )!.journey!;
    const current = journey.guided[0];
    const task = journey.guided.find(
      (question) => question.id === pilot.modelTask,
    )!;
    const board = initialBoard(task.model!);
    const previous = now - REVIEW_DELAY - 60000;
    const oldIds = journey.checkForms[0].map((question) => question.id);
    const nextIds = journey.checkForms[1].map((question) => question.id);
    const history: Run = {
      kind: "check",
      ids: oldIds,
      index: oldIds.length - 1,
      started: previous - 1000,
      submitted: previous,
      responses: Object.fromEntries(
        oldIds.map((id) => [
          id,
          {
            answer: "retained wrong answer",
            working: "My original unfinished explanation",
            correct: false,
            helped: false,
            fresh: false,
            at: previous,
          },
        ]),
      ),
    };
    progress.work[pilot.slug] = {
      ...emptyWork(),
      updated: previous,
      learning: { version: 1, stage: "guided", index: 0 },
      drafts: {
        [pilot.modelTask]: "1..2",
        [nextIds[1]]: "27e + unfinished",
        ["working:" + nextIds[0]]: "Do not replace my raw working.",
        ["fresh:" + nextIds[0]]: "false",
      },
      hints: [pilot.modelTask, "model:" + pilot.modelTask],
      attempts: {
        [pilot.modelTask]: [
          {
            answer: "36",
            correct: false,
            helped: true,
            fresh: false,
            at: previous,
          },
        ],
      },
      taskModels: {
        [pilot.modelTask]: [
          board,
          pilot.slug === "relative-atomic-mass"
            ? { lightPercent: 55 }
            : { p: 6, n: 6, e: 1 },
        ],
      },
      history: [history],
      run: {
        kind: "check",
        ids: nextIds,
        index: 1,
        started: now - 1000,
        responses: {
          [nextIds[0]]: {
            answer: "retained first sealed answer",
            working: "Sealed original working",
            correct: false,
            helped: false,
            fresh: false,
            at: now - 500,
          },
        },
      },
    };
    for (const id of exposureIds([current.id, task.id, ...oldIds, ...nextIds]))
      progress.seen[id] = previous;
  }
  expect(decode(JSON.stringify(progress))).toEqual(progress);
  return progress;
}

async function seed(page: Page, raw: string) {
  await page.addInitScript(
    ({ key, raw }) => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, raw);
      if (localStorage.getItem("gcse-maths.keep") === null)
        localStorage.setItem("gcse-maths.keep", "unrelated original data");
    },
    { key: STORAGE_KEY, raw },
  );
}

async function settled(page: Page) {
  await expect
    .poll(() =>
      page.evaluate((key) => sessionStorage.getItem(key), PENDING_KEY),
    )
    .toBeNull();
}

async function saved(page: Page): Promise<Progress> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
}

async function openPilot(page: Page, pilot: Pilot) {
  await page.goto(`/lessons/${pilot.slug}`);
  await expect(page.locator(`#${pilot.frame}`)).toBeVisible();
}

function withoutWorkedNavigation(progress: Progress): Progress {
  const copy: Progress = JSON.parse(JSON.stringify(progress));
  copy.revision = 0;
  for (const work of Object.values(copy.work)) {
    delete work.worked;
    work.updated = 0;
  }
  return copy;
}

async function holdSaveLock(page: Page) {
  await page.evaluate(
    (key) =>
      new Promise<void>((held) => {
        void navigator.locks.request(
          key,
          () =>
            new Promise<void>((release) => {
              (
                window as unknown as { releaseWorkedSave: () => void }
              ).releaseWorkedSave = release;
              held();
            }),
        );
      }),
    STORAGE_KEY,
  );
}

async function releaseSaveLock(page: Page) {
  await page.evaluate(() => {
    (
      window as unknown as { releaseWorkedSave: () => void }
    ).releaseWorkedSave();
  });
}

interface RecoveryExport {
  savedRaw: string | null;
  pendingRaw: string | null;
  conflictingDraftRaw: string | null;
  session: Progress;
}

async function recoveryExport(page: Page): Promise<RecoveryExport> {
  await page.getByRole("link", { name: "Data settings", exact: true }).click();
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download my data", exact: true })
    .click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("gcse-chemistry-progress.json");
  return JSON.parse(await readFile((await download.path())!, "utf8"));
}

for (const pilot of pilots) {
  test(`${pilot.slug}: saving worked navigation preserves old v1 work and all assessment evidence`, async ({
    page,
  }) => {
    const now = Date.now();
    const before = retainedProgress(now);
    await seed(page, JSON.stringify(before));
    await openPilot(page, pilot);
    await settled(page);
    expect(await saved(page)).toEqual(before);
    const frame = page.locator(`#${pilot.frame}`);
    await frame.getByRole("button", { name: "Next", exact: true }).click();
    await frame.getByRole("button", { name: "Next", exact: true }).click();
    await frame
      .getByRole("combobox", { name: "Worked example", exact: true })
      .selectOption("difficult");
    await frame.getByRole("button", { name: "Next", exact: true }).click();
    await settled(page);
    const after = await saved(page);
    expect(after.work[pilot.slug].worked).toEqual({
      version: 1,
      example: "difficult",
      step: 1,
    });
    expect(after.revision).toBe(before.revision + 4);
    expect(withoutWorkedNavigation(after)).toEqual(
      withoutWorkedNavigation(before),
    );
    expect(after.work[pilot.slug].updated).toBeGreaterThan(
      before.work[pilot.slug].updated,
    );
    for (const item of pilots) {
      expect(dueReview(after.work[item.slug], now)).toBe(
        dueReview(before.work[item.slug], now),
      );
      expect(lessonStatus(item.slug, after)).toBe(
        lessonStatus(item.slug, before),
      );
      expect(observedResults(item.slug, after)).toEqual(
        observedResults(item.slug, before),
      );
    }
    expect(
      await page.evaluate(() => localStorage.getItem("gcse-maths.keep")),
    ).toBe("unrelated original data");
    await page.reload();
    await expect(frame).toHaveAttribute("data-worked-example", "difficult");
    await expect(frame).toHaveAttribute("data-worked-step", "1");
    await settled(page);
    expect(await saved(page)).toEqual(after);
    await frame.getByRole("button", { name: "Back", exact: true }).click();
    await settled(page);
    expect(withoutWorkedNavigation(await saved(page))).toEqual(
      withoutWorkedNavigation(before),
    );
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await expect(frame).toHaveCount(0);
    await expect(
      page.locator(".assessment-results,.assessment-review-criteria"),
    ).toHaveCount(0);
    expect((await saved(page)).work[pilot.slug].run).toEqual(
      before.work[pilot.slug].run,
    );
  });
}

test("corrupt saved JSON remains byte-for-byte exportable while worked steps still operate", async ({
  page,
}) => {
  const original = '{"unfinished original data":';
  await seed(page, original);
  await openPilot(page, pilots[0]);
  await expect(page.locator(".storage-warning")).toContainText(
    "original contents have been preserved",
  );
  const frame = page.locator(`#${pilots[0].frame}`);
  await frame.getByRole("button", { name: "Next", exact: true }).click();
  await expect(frame).toHaveAttribute("data-worked-step", "1");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(original);
  const exported = await recoveryExport(page);
  expect(exported.savedRaw).toBe(original);
  expect(exported.session.work[pilots[0].slug].worked?.step).toBe(1);
  expect(
    await page.evaluate(() => localStorage.getItem("gcse-maths.keep")),
  ).toBe("unrelated original data");
});

test("an invalid nested worked cursor is preserved rather than repaired over old answers", async ({
  page,
}) => {
  const original = retainedProgress();
  original.work["inside-an-atom"].worked = {
    version: 1,
    example: "main",
    step: 99,
  };
  const raw = JSON.stringify(original);
  expect(decode(raw)).toBeNull();
  await seed(page, raw);
  await openPilot(page, pilots[1]);
  await expect(page.locator(".storage-warning")).toContainText(
    "Saved data is unreadable",
  );
  const frame = page.locator(`#${pilots[1].frame}`);
  await frame
    .getByRole("combobox", { name: "Worked example", exact: true })
    .selectOption("difficult");
  await frame.getByRole("button", { name: "Next", exact: true }).click();
  await expect(frame).toHaveAttribute("data-worked-example", "difficult");
  await expect(frame).toHaveAttribute("data-worked-step", "1");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(raw);
  const exported = await recoveryExport(page);
  expect(exported.savedRaw).toBe(raw);
  expect(
    JSON.parse(exported.savedRaw!).work["inside-an-atom"].drafts[
      "atom-v2-g-neutral"
    ],
  ).toBe("1..2");
});

test("denied local storage keeps both worked players usable for the visit", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (this === window.localStorage)
        throw new DOMException("Blocked", "SecurityError");
      return get.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (this === window.localStorage)
        throw new DOMException("Blocked", "SecurityError");
      return set.call(this, key, value);
    };
  });
  for (const pilot of pilots) {
    await openPilot(page, pilot);
    await expect(page.locator(".storage-warning")).toContainText(
      "Browser storage is unavailable",
    );
    const frame = page.locator(`#${pilot.frame}`);
    await frame.getByRole("button", { name: "Next", exact: true }).click();
    await expect(frame).toHaveAttribute("data-worked-step", "1");
    await frame
      .getByRole("combobox", { name: "Worked example", exact: true })
      .selectOption("difficult");
    await frame.getByRole("button", { name: "Next", exact: true }).click();
    await expect(frame).toHaveAttribute("data-worked-example", "difficult");
    await expect(frame).toHaveAttribute("data-worked-step", "1");
    await expect(page.locator(".storage-warning")).toContainText(
      "only last for this visit",
    );
  }
});

test("quota failure preserves the original record and pending worked cursor across refresh", async ({
  page,
}) => {
  const before = retainedProgress();
  const raw = JSON.stringify(before);
  await page.addInitScript(
    ({ key, raw }) => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, raw);
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (storageKey, value) {
        if (this === window.localStorage && storageKey === key)
          throw new DOMException("Full", "QuotaExceededError");
        return set.call(this, storageKey, value);
      };
    },
    { key: STORAGE_KEY, raw },
  );
  await openPilot(page, pilots[0]);
  const frame = page.locator(`#${pilots[0].frame}`);
  await frame.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".storage-warning")).toContainText(
    "Progress could not be committed",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(raw);
  const pending = await page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key)!),
    PENDING_KEY,
  );
  expect(pending.base).toBe(raw);
  expect(pending.next.work["relative-atomic-mass"].worked).toEqual({
    version: 1,
    example: "main",
    step: 1,
  });
  expect(withoutWorkedNavigation(pending.next)).toEqual(
    withoutWorkedNavigation(before),
  );
  await page.reload();
  await expect(frame).toHaveAttribute("data-worked-step", "1");
  await expect(page.locator(".storage-warning")).toContainText(
    "Progress could not be committed",
  );
  await frame.getByRole("button", { name: "Next", exact: true }).click();
  await expect(frame).toHaveAttribute("data-worked-step", "2");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(raw);
});

test("two pending cursor edits keep the winning save and export the conflicting tab draft", async ({
  page,
  context,
}) => {
  const before = retainedProgress();
  await seed(page, JSON.stringify(before));
  await openPilot(page, pilots[0]);
  const second = await context.newPage();
  await openPilot(second, pilots[0]);
  await settled(page);
  await settled(second);
  await holdSaveLock(page);
  const firstFrame = page.locator(`#${pilots[0].frame}`);
  const secondFrame = second.locator(`#${pilots[0].frame}`);
  await firstFrame.getByRole("button", { name: "Next", exact: true }).click();
  await secondFrame
    .getByRole("combobox", { name: "Worked example", exact: true })
    .selectOption("difficult");
  const conflicting = await second.evaluate(
    (key) => sessionStorage.getItem(key),
    PENDING_KEY,
  );
  expect(
    JSON.parse(conflicting!).next.work["relative-atomic-mass"].worked,
  ).toEqual({ version: 1, example: "difficult", step: 0 });
  await releaseSaveLock(page);
  await settled(page);
  await expect(second.locator(".storage-warning")).toContainText(/another tab/);
  const winner = await saved(page);
  expect(winner.work["relative-atomic-mass"].worked).toEqual({
    version: 1,
    example: "main",
    step: 1,
  });
  await secondFrame.getByRole("button", { name: "Next", exact: true }).click();
  await expect(secondFrame).toHaveAttribute("data-worked-example", "difficult");
  await expect(secondFrame).toHaveAttribute("data-worked-step", "1");
  expect(await saved(second)).toEqual(winner);
  const exported = await recoveryExport(second);
  expect(JSON.parse(exported.savedRaw!)).toEqual(winner);
  expect(exported.pendingRaw).toBe(conflicting);
  expect(exported.session.work["relative-atomic-mass"].worked).toEqual({
    version: 1,
    example: "difficult",
    step: 1,
  });
  expect(
    exported.session.work["relative-atomic-mass"].drafts["ram-v1-g-light"],
  ).toBe("1..2");
  await second.reload();
  await expect(second.locator(".storage-warning")).toContainText(
    "retained separately for export",
  );
  expect(
    await second.evaluate((key) => sessionStorage.getItem(key), CONFLICT_KEY),
  ).toBe(conflicting);
  expect(
    await second.evaluate((key) => sessionStorage.getItem(key), PENDING_KEY),
  ).toBeNull();
  expect(await saved(second)).toEqual(winner);
  const recoveredExport = await recoveryExport(second);
  expect(recoveredExport.conflictingDraftRaw).toBe(conflicting);
  expect(
    JSON.parse(recoveredExport.conflictingDraftRaw!).next.work[
      "relative-atomic-mass"
    ].drafts["ram-v1-g-light"],
  ).toBe("1..2");
  await second.close();
});

test("disjoint stale lesson edits stay in the visit without replacing the other lesson save", async ({
  page,
  context,
}) => {
  const before = retainedProgress();
  await seed(page, JSON.stringify(before));
  await openPilot(page, pilots[0]);
  const second = await context.newPage();
  await openPilot(second, pilots[1]);
  await page
    .locator(`#${pilots[0].frame}`)
    .getByRole("button", { name: "Next", exact: true })
    .click();
  await settled(page);
  await expect(second.locator(".storage-warning")).toContainText(
    "changed in another tab",
  );
  const winner = await saved(page);
  const secondFrame = second.locator(`#${pilots[1].frame}`);
  await secondFrame.getByRole("button", { name: "Next", exact: true }).click();
  await expect(secondFrame).toHaveAttribute("data-worked-step", "1");
  expect(await saved(second)).toEqual(winner);
  expect(winner.work["inside-an-atom"]).toEqual(before.work["inside-an-atom"]);
  const exported = await recoveryExport(second);
  expect(JSON.parse(exported.savedRaw!)).toEqual(winner);
  expect(exported.session.work["inside-an-atom"].worked?.step).toBe(1);
  expect(exported.session.work["inside-an-atom"].taskModels).toEqual(
    before.work["inside-an-atom"].taskModels,
  );
  expect(exported.session.work["inside-an-atom"].drafts).toEqual(
    before.work["inside-an-atom"].drafts,
  );
  await second.reload();
  expect(await saved(second)).toEqual(winner);
  await second.close();
});

test("the synchronous journal restores a worked cursor after refresh while its save lock is held", async ({
  page,
}) => {
  const before = retainedProgress();
  await seed(page, JSON.stringify(before));
  await openPilot(page, pilots[1]);
  await settled(page);
  await holdSaveLock(page);
  const frame = page.locator(`#${pilots[1].frame}`);
  await frame
    .getByRole("combobox", { name: "Worked example", exact: true })
    .selectOption("difficult");
  await frame.getByRole("button", { name: "Next", exact: true }).click();
  expect((await saved(page)).work["inside-an-atom"].worked).toBeUndefined();
  const pending = await page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key)!),
    PENDING_KEY,
  );
  expect(pending.next.work["inside-an-atom"].worked).toEqual({
    version: 1,
    example: "difficult",
    step: 1,
  });
  await page.reload();
  await expect(frame).toHaveAttribute("data-worked-example", "difficult");
  await expect(frame).toHaveAttribute("data-worked-step", "1");
  await settled(page);
  const after = await saved(page);
  expect(after.work["inside-an-atom"].worked).toEqual({
    version: 1,
    example: "difficult",
    step: 1,
  });
  expect(withoutWorkedNavigation(after)).toEqual(
    withoutWorkedNavigation(before),
  );
  await expect(page.locator(".storage-warning")).toHaveCount(0);
});
