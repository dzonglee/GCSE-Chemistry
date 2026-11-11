# Audit 3 — GCSE Chemistry code

Date: 11 November 2026. Audit only; product code and tests unchanged.
Audited head: `3589f2ab7e183198b8c21391d942fd27d2589ddb` (`claude/integration-2026-11`).
Base: `88b19e2801b0f506e89c9eb76925619280ce67bf` (`codex/chemistry-courseware-handoff-20261008`).
Delivery branch: `gpt/audit3-code-chem`. Scope: the 19-file comparison and relevant imports; no tree/history enumeration.
Reviewers: `chemistry_review` (chemistry/sealing), `components_review` (components/accessibility/tests); separate `verifier` independently checked candidate concerns, calculations and persistence. Primary reviewer checked persistence and integrated the evidence.

## Confirmed findings

**High: 0. Medium: 0. Low: 0.** No candidate met the required standard for a demonstrated defect on this head.
In particular, invalid-cursor recovery is not deletion, teaching a guided answer is not a breached assessment seal, and a bare radio's dimensions do not establish its clickable label's dimensions.
This is a scoped source/Node audit, not browser or novice acceptance.

## Concrete improvements (not defect findings)

1. **Introduce vocabulary in smaller steps** — `src/components/DetailedLesson.tsx:569–575` (new). For a novice 14-year-old, five symbols, signed charges and several relationships in one paragraph are a compressed reference, not a sufficient first explanation. Present particle properties in a small table; introduce Z, A and charge alongside the task that needs each.
2. **Restore the intended fading of support** — `src/lib/inside-atom-worked.ts:119–123`, `src/components/DetailedLesson.tsx:93–97`; `src/content/journeys/atomic.ts:104` (new player, old task). The aluminium task says support fades, but its identical solved construction remains available. Consider a separate worked example or an optional reveal after a prediction; retain the existing assisted-attempt classification.
3. **Cover the surrounding controls** — `tests/worked-pilots.browser.spec.ts:529–534` (new). Its 44px loop is scoped to the worked frame. Extend coverage to the whole pilot's old warm-up, Undo, Clear answer and summary controls; measure radio labels. Fix the old rules identified below when those controls are in scope.
4. **Strengthen the sealing test** — `tests/inside-atom-worked.unit.spec.ts:107–129` (new). Different IDs and exact non-equality of reserved prompts to `before`/`action` do not prove semantic independence; `after`, `why` and diagrams are not checked there. Compare independently enumerated reserved givens/demands, alongside the existing route-gating browser tests.
5. **Design explicit cursor recovery/versioning before editing example length** — `src/lib/worked-cursor.ts:8,20–29`, `src/lib/progress.ts:200–204`, `src/components/WorkedStepsFrame.tsx:50` (new). Preserve raw data and expose an explicit recovery choice for presentation metadata; avoid hiding unrelated valid lessons. A saved step 2 needs a migration if an example becomes two steps: leaving the constant at 3 permits an undefined rendered step; lowering it to 2 rejects the record. Neither change exists on this head.
6. **Make the browser default portable** — `playwright.config.ts:14` (already on base, byte-identical): `executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium"`. On a machine without that Linux path, an unset override selects a nonexistent executable. Prefer the supplied override when set and otherwise Playwright's managed executable. README already documents the override; no launch was attempted here.

## Saved-data investigation

The new rejection is at `src/lib/progress.ts:200–204`:
```ts
      if (
        w.worked !== undefined &&
        (!isWorkedLesson(id) || !validWorkedCursor(w.worked))
      )
        return null;
```

Concrete input: start with `emptyProgress()`; set `work["inside-an-atom"] = {...emptyWork(), worked:{version:1,example:"main",step:3}}`, `work["relative-atomic-mass"] = {...emptyWork(),drafts:{saved:"35.5"}}` and `seen.old = 1`; serialize and load.
Actual: `decode` returns null for the **entire record**, not one lesson. `init` uses `emptyProgress()` and blocks saving (`progress.ts:294–302`): all saved lessons' drafts, attempts/history, model histories, exposure and preferences are unavailable to the current UI.
The original local-storage bytes are unchanged; `exportData()` includes them as `savedRaw` (`progress.ts:592–614`). Subsequent study is visit-only unless exported. No saved answer is erased or re-marked by this rejection.
Putting an otherwise valid `worked` cursor on `titration-calculations` has the same whole-record effect. This is new validation using the existing, documented unreadable-data recovery policy; the verifier rejected a data-deletion finding.
The base decoder accepts and retains the extra `worked` field. An executed base `setWork` draft update preserved it and historical evidence; the head reread that result. Old records without the field also remain valid.
Current examples all have three steps. Next/Back bounds, example reset to step 0 and `saveWorkedCursor` validation keep normal cursors in 0–2. Two simulated tabs did not create an invalid cursor: the stale writer was blocked without replacing the newer save. Source tracing found no browser-back/forward path that changes the cursor range; browser navigation itself was not run.
Independent confirmation: the verifier executed the same source paths in its own Node VM reproduction and confirmed global unavailability, retained/exportable raw bytes, old-version compatibility and stale-writer protection.

## Coordinator leads: provenance and interpretation

The following are attribution of supplied measurements, **not additional findings or measurements made by this auditor**.

| Control | Head source and provenance |
| --- | --- |
| Warm-up link/button | `DetailedLesson.tsx:378–380`; `sample-lesson.css:1080–1083` retains the old 28px mobile minimum. |
| Undo | `TaskWorkbench.tsx:1506–1514`; `sample-lesson.css:819–823` retains 44px height, zero padding and no width minimum. |
| Clear answer | `DetailedLesson.tsx:836–848`; `sample-lesson.css:950–954` retains the old 36px minimum. |
| Old summaries | `TaskWorkbench.tsx:1535`, `DetailedLesson.tsx:877,894,911`; old CSS `:829–831,961–965` supplies no height minimum. |
| Radio inputs | Old `sample-lesson.css:914–918` sets 17px; `QuestionInput.tsx:1124–1139` wraps each input in a clickable label. Label dimensions were not measured here. |

All cited files are under `src/components/` or, for the stylesheet, `src/app/`. T17's CSS diff only adds a 69-line prefix; none of those old sizing rules changes. Its new link has a 44px height minimum (`sample-lesson.css:8–14`); frame buttons/history summaries have both 44px minima (`WorkedStepsFrame.module.css:90–94`). The verifier independently checked this attribution.
The vocabulary is chemically correct. It does **not** directly supply `atom-v2-g-place`'s answer: neither “the nucleus” nor comparative particle masses appears in that paragraph. It supplies the method for `g-neutral` and `g-mass`; the player explicitly supplies their answers 6 and 14 before an attempt. RAM's guided answer 35.5 at 75% was already displayed by `IsotopeMixtureWorkbench.tsx:168–170` on the base.
These are guided tasks: `DetailedLesson.tsx:177–182` already records their attempts as assisted and not fresh. General explanations of concepts later tested were not treated as reserved-answer leaks.

## Checked and found sound

- **Atomic arithmetic and diagrams:** `inside-atom-worked.ts:28–46,52–141` and its component. Carbon states give (Z,A,charge)=(6,12,+6), then (6,12,0); shells 2,4. Aluminium gives (13,26,0), then (13,27,0); shells 2,8,3. Neutrons needed: 27−13=14, one added. Adding six neutrons instead leaves carbon charge +6 and makes A=18; adding an electron instead leaves aluminium A=26 and makes charge −1.
- **Weighted means:** `relative-atomic-mass-worked.ts:22–124`. Independently checked every integer percentage 0–100, including all 21 legal slider positions: mean=37−0.02p. At 75%, 2625+925=3550 and mean=35.5; at 50%, 1750+1850=3600 and mean=36. Count case: 180+128=308; 308/10=30.8; the stated wrong denominator gives 3.08.
- **Units/notation/rounding:** Aᵣ has no unit; mass numbers are explicitly approximate relative isotope masses. Carbon-12 and aluminium-27 naming matches the counts. All permitted worked calculations have exact displayed values; no contradictory rounding instruction was found.
- **Input extremes:** 0%→37 and 100%→35 are handled explicitly. Missing state uses `Number(undefined ?? 50)=50` (`DetailedLesson.tsx:622–625`). NaN is not repaired by `??`: a direct NaN prop throws the helper's guard. Persisted invalid values are rejected by `validTaskModels → validHistory → validBoard` (`workbench.ts:918–921,1007–1013,1286–1292`); the slider supplies numeric multiples of 5. No normal-use NaN path was found.
- **No zero denominator or excessive percentage for legal inputs:** population denominators are 100 or 10; scale denominators are 37−35 or 32−30. Independently calculated markers stay within 12–308 and represented abundances total 100.
- **Sealing:** `DetailedLesson.tsx:88–97,422` gates players to guided exploration, outside check/review. Reviewers compared all 11 atom check/7 review and 8 RAM check/6 review tasks, plus the atom legacy checks; no reserved numerical givens were copied by T17. Existing marking, assessment code, content and item IDs are unchanged in the comparison.
- **Component state/accessibility, source only:** `WorkedStepsFrame.tsx:47–54,65–95,99–138` focuses the current h4 on position changes, uses native labelled controls and a named navigation group, and renders only previous steps in collapsed history. Heading sequence h3/h4/h5 is coherent. Diagrams have text/count equivalents and non-colour additions; no new animation/transition requires reduced-motion handling. Existing RAM live regions remain at `IsotopeMixtureWorkbench.tsx:55,168`.
- **Tests/claims/leftovers:** all six changed test files are additions; no existing test is weakened. No skip/only/fixme or TODO/FIXME marker was found in the changed source/tests, and no actionable dead runtime code was identified. The sealing heuristic above is insufficient proof, not evidence of a leak. `T17.md:5,16–22,35` explicitly leaves final corrected browser and novice acceptance outstanding. Strict TypeScript configuration is unchanged.
- **Dependency delta:** package/lock changes align Next.js and eslint-config-next at 16.4.5, from locked 16.3.5, with corresponding lockfile updates. Dependency runtime compatibility was not independently established.

## Executed verification and limits

Node version: `v24.22.1`. Commands below ran from `/workspace/scratch/993d3ed7a070`; reproduction scripts are temporary audit scratch, not product tests or committed files.

| Command | Actual result |
| --- | --- |
| `node audit-repros/chemistry-values.mjs` | Exit 0: six atom ledgers/shells, all integer abundance settings, endpoints and mistake arithmetic passed. |
| `node audit-repros/verifier-chemistry.mjs` | Exit 0: independent arithmetic, markers, fallback and invalid-input guards passed. |
| `node audit-repros/root-storage.mjs` | Exit 0: base read/write compatibility, six legal cursor saves, invalid writes rejected, stale-writer protection and whole-record recovery passed. |
| `node audit-repros/verifier-persistence.mjs` | Exit 0: independent decoder/recovery, old-writer retention and separate-tab-context checks passed. |

Chemistry scripts imported actual TypeScript modules. Persistence scripts executed actual stripped progress/cursor source in separate Node VM contexts, with synthetic storage/lock APIs and unrelated imports stubbed; they did not execute browser events.
**Not run:** browsers, browser back/forward, focus/keyboard/screen-reader runtime, measured layout/reduced-motion behaviour, novice testing, full project typecheck/lint/build/unit/e2e suites. Only file snapshots were available after the single shallow-clone attempt was interrupted; no complete dependency-installed checkout was used.
The coordinator's 33 non-pilot browser failures were not investigated, reproduced or counted as findings. No browser result from T17.md or the coordinator is claimed as this auditor's execution.
