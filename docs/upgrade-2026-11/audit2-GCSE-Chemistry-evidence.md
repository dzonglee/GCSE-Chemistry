# Audit 2 — GCSE Chemistry — supporting evidence

This report supports [audit2-GCSE-Chemistry.md](audit2-GCSE-Chemistry.md). Audit date: 10 November 2026, Australia/Sydney. Commands ran on 9 November UTC. Source line references are to the immutable integration below; audit findings concern that source, not the later report-only commit.

## Audited snapshots and method

- Integration: `3589f2ab7e183198b8c21391d942fd27d2589ddb`; source tree `3858f608565e3321c93181c7e57fe9cb3f0eb7ff`.
- Main: `88b19e2801b0f506e89c9eb76925619280ce67bf`.
- Branch: `gpt/audit2-2026-11-10`, created locally from the audited integration.
- One shallow, no-LFS checkout shared by root and three in-chat reviewers; no whole-history/tree API enumeration.
- Root reviewed storage/assessment integration, dependencies/security, performance implications and ran installation, types, lint, all units, production build, audit and browser capability checks.
- `chemistry_review` independently reviewed both complete route task banks, new examples and diagrams, using Decimal arithmetic and explicit answer expectations.
- `ui_review` reviewed every changed UI/style/test file, keyboard/focus/phone contracts and test scope.
- `acceptance_review` read Drive acceptance sources, reviewed preservation semantics, independently rechecked every retained finding and rejected unsupported candidates.
- Product/test files were not edited. The only intended committed paths are the primary report and this evidence report. No merge, rebase, force-push, pull request or deployment is part of this audit.

## Acceptance sources

AGENTS.md and README protective rules, docs/build-plan.md acceptance rules, docs/validation.md evidence limits and docs/upgrade-2026-11/T17.md were read in the checkout. Earlier historical passes were not counted as fresh audit passes.

| Authorised Drive source | File |
|---|---|
| T20-acceptance-matrix-2026-11-10.md | [1B64cUsPnsEA8P6NgBPFcRSBTicRPjBRB](https://drive.google.com/file/d/1B64cUsPnsEA8P6NgBPFcRSBTicRPjBRB/view?usp=drivesdk) |
| acceptance-checklist.txt | [1Lfzq4KW6MJwf8CS6i0QntlIFFVDu6AkG](https://drive.google.com/file/d/1Lfzq4KW6MJwf8CS6i0QntlIFFVDu6AkG/view?usp=drivesdk) |
| X01-T17-chemistry-pilot-review.md | [1DsqYNE_VAZ_tnTwZXmp5TCvmcVJIuBvB](https://drive.google.com/file/d/1DsqYNE_VAZ_tnTwZXmp5TCvmcVJIuBvB/view?usp=drivesdk) |

T17 is the only repository-specific ticket. T20 is reviewed only for its GCSE-Chemistry row and shared claims. The other tickets belong to other repositories. The matrix says Verified means scoped automated Chrome verification and explicitly states that no novice trials took place. Its source head matches this audit.

| T17 criterion | Source/observed evidence | Acceptance limit |
|---|---|---|
| Learner explains why before independent assessment | Visible glossary, current causal steps and original transfer tasks; complete subject review found no incorrect reasoning. | No novice explanation session is recorded or newly performed. |
| Concept-specific visuals and a difficult variant | Live isotope weights/count tiles; staged carbon/aluminium particles; independent recomputation below. | Actual rendered layout cannot be signed off from source alone. |
| Existing storage/exposure/marking/mobile/keyboard checks pass | 1,174 observed unit passes; original marker/session paths unchanged; coordinator reports 92 scoped browser passes. | This audit cannot launch Chromium; required extra 24 titration cases are absent from that 92-case scope. |

No claim is made that the coordinator invented its 92 passes. Their scope can be independently reconciled through test discovery, while the result itself remains reported evidence. Full ticket acceptance still needs novice evidence and the remaining runtime gate.

## Checkout and preservation commands

Working directory unless stated otherwise: `/workspace/scratch/38187d036459/GCSE-Chemistry`.

| Exact command | Result |
|---|---|
| `GIT_LFS_SKIP_SMUDGE=1 GIT_TERMINAL_PROMPT=0 git clone --depth 1 --single-branch --branch claude/integration-2026-11 --filter=blob:none --no-tags https://github.com/dzonglee/GCSE-Chemistry.git /workspace/scratch/38187d036459/GCSE-Chemistry` | Exit 0; 3,006 working-tree files, integration head as above. |
| `git fetch --depth 1 --no-tags origin main:refs/remotes/origin/main` | Exit 0; fetched only main. |
| `git switch -c gpt/audit2-2026-11-10` | Exit 0; based on integration. |
| `git rev-parse HEAD origin/main` | Exit 0; pinned both audited hashes. |
| `git diff --stat origin/main HEAD` | Exit 0; 19 files, 3,232 insertions / 178 deletions. |
| `git diff --name-status origin/main HEAD` | Exit 0; full changed-file inventory below. |
| `git diff --exit-code origin/main HEAD -- src/content src/lib/marking.ts src/lib/workbench.ts src/lib/model-state.ts src/components/AssessmentSession.tsx AGENTS.md README.md playwright.config.ts playwright.unit.config.ts tsconfig.json tests/relative-atomic-mass.browser.spec.ts tests/atomic-foundations.browser.spec.ts tests/atom-3d.browser.spec.ts tests/task-navigation.browser.spec.ts tests/titration-calculations.browser.spec.ts` | Exit 0; protected source and existing named tests unchanged. |
| `git diff --exit-code` | Exit 0 before report creation; checks did not alter tracked files. |
| `git diff --check` | Exit 0 before and after writing the primary report. |
| `git ls-remote --heads origin refs/heads/gpt/audit2-2026-11-10` | Exit 0, no matching remote branch at pre-publication check. |

```text
A	docs/upgrade-2026-11/T17.md
M	package-lock.json
M	package.json
M	src/app/sample-lesson.css
M	src/components/DetailedLesson.tsx
A	src/components/InsideAtomWorkedSteps.tsx
A	src/components/RelativeAtomicMassWorkedSteps.tsx
A	src/components/WorkedStepsFrame.module.css
A	src/components/WorkedStepsFrame.tsx
A	src/lib/inside-atom-worked.ts
M	src/lib/progress.ts
A	src/lib/relative-atomic-mass-worked.ts
A	src/lib/worked-cursor.ts
A	tests/inside-atom-worked.unit.spec.ts
A	tests/relative-atomic-mass-worked.unit.spec.ts
A	tests/worked-cursor.unit.spec.ts
A	tests/worked-pilots-marking.unit.spec.ts
A	tests/worked-pilots-storage.browser.spec.ts
A	tests/worked-pilots.browser.spec.ts
```

Read-only source inspection additionally used bounded `rg`, `nl -ba`, `sed -n`, `cat` and scoped `git diff` on the listed files and their direct dependencies. Those inspections are not presented as runtime tests.

## Observed validation receipts

Node `24.22.1`; npm `11.9.0`; Next.js `16.4.5`; production build ID **`9iSgjY5fRUeiM128giqbE`**. Production build generated 143 pages and exited 0. Application source stayed at the audited integration throughout validation.

Commands below are the exact child commands passed to a scratch Python logging wrapper; the wrapper only redirected stdout/stderr, recorded monotonic elapsed time and returned the actual exit code.

| Label | Exact command | Exit | Seconds |
|---|---|---:|---:|
| npm-ci | `npm_config_cache=/workspace/.npm-cache npm ci` | 0 | 18.405 |
| npm-audit | `npm audit --omit=dev --json` | 0 | 5.812 |
| typecheck | `npm run typecheck` | 0 | 42.273 |
| lint | `npm run lint` | 0 | 43.764 |
| browser-probe | `node -e 'const { chromium } = require("@playwright/test"); (async () => { const browser = await chromium.launch({ executablePath: "/usr/bin/chromium" }); console.log("Chromium", browser.version()); const page = await browser.newPage(); await page.setContent("<h1>Audit browser capability</h1>"); console.log(await page.textContent("h1")); await browser.close(); })().catch(error => { console.error(error); process.exit(1); });'` | 1 | 0.542 |
| npm-audit-all | `npm audit --json` | 1 | 68.147 |
| unit | `npm run test:unit` | 0 | 103.109 |
| e2e-discovery | `npm run test:e2e -- tests/worked-pilots.browser.spec.ts tests/worked-pilots-storage.browser.spec.ts tests/relative-atomic-mass.browser.spec.ts tests/atomic-foundations.browser.spec.ts tests/atom-3d.browser.spec.ts tests/task-navigation.browser.spec.ts tests/titration-calculations.browser.spec.ts --list` | 0 | 6.213 |
| build | `NEXT_TELEMETRY_DISABLED=1 npm run build` | 0 | 83.191 |

Observed unit-suite terminal result: **`1174 passed (1.7m)`**. There were no reported failures or skips. Typecheck and lint each exited 0. Install used the committed lockfile; no dependency update or audit fix was run.

### Browser limitation

The standard installed Playwright/system-Chromium launch aborted before a page was created. The probe exited 1 in 0.542 seconds; Chromium exited via SIGABRT. The subsequent app E2E suite was **not run**, rather than repeatedly triggering the same environment failure. No application assertion, screenshot, keyboard action or geometry measurement ran. There was no permission escalation or sandbox workaround.

```text
FATAL:chrome/browser/process_singleton_posix.cc:297
Check failed: . socket() failed: Operation not permitted (1)
ERROR:third_party/crashpad/crashpad/util/linux/scoped_ptrace_attach.cc:27
ptrace: Operation not permitted (1)
```

Test discovery exited 0: **116 tests in seven files**. `--list` is discovery only. Supported engines, zoom, runtime accessibility, actual 44px/320px geometry, 3D fallback, browser storage conflicts and novice comprehension are not newly verified here. The full course browser suite is also not run.

## Root preservation, security and performance checks

- The only existing persistence-code edits are optional `Work.worked`, lesson/cursor validation, and `saveWorkedCursor`; existing raw-data/journal/exclusive-lock/conflict/export paths remain unchanged.
- `saveWorkedCursor` validates exactly two lesson IDs, three allowed cursor fields, the schema version, two example IDs and integral step bounds 0–2; it spreads prior work before saving. `lastSubmission`/`dueReview` are unchanged and do not derive eligibility from cursor updates.
- `DetailedLesson` gates the players to the intended guided tasks. Original raw drafts, wrong model histories and sealed assessment components are retained; new cursor fields do not award fresh evidence or automatic written marks.
- All six changed test files are additions. Existing tests, strict TypeScript, browser projects, 44px/viewport thresholds and retries remain unchanged.
- Changed application files were scanned for unsafe HTML/eval, remote request creation, private-key blocks and common credential literals; no matches. All HTTPS-resolved lock entries retain integrity metadata. This bounded scan is not a claim that a complete secret history audit took place.
- New visuals use bounded local DOM/SVG state; no new remote media, analytics, paid API or service path appears. Production build passes. No measured browser performance result is claimed.

### Current dependency-audit scope

Production-only audit: `{"info":0,"low":0,"moderate":0,"high":0,"critical":0,"total":0}`.
Full audit: `{"info":0,"low":0,"moderate":8,"high":1,"critical":0,"total":9}`.
Both reports are actual registry audit responses from this run, not inherited matrix counts. The nine affected nodes below collapse to two upstream advisory roots.

| Affected node | Installed version | dev | Upstream advisory root / effect |
|---|---|---|
| `node_modules/@typescript-eslint/eslint-plugin` | 8.70.0 | True | @typescript-eslint/parser; @typescript-eslint/type-utils; @typescript-eslint/utils |
| `node_modules/@typescript-eslint/parser` | 8.70.0 | True | @typescript-eslint/typescript-estree |
| `node_modules/@typescript-eslint/type-utils` | 8.70.0 | True | @typescript-eslint/typescript-estree; @typescript-eslint/utils |
| `node_modules/@typescript-eslint/typescript-estree` | 8.70.0 | True | minimatch |
| `node_modules/@typescript-eslint/utils` | 8.70.0 | True | @typescript-eslint/typescript-estree |
| `node_modules/eslint-config-next` | 16.4.5 | True | typescript-eslint |
| `node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch` | 10.2.6 | True | [minimatch has potential denial of service via globparts amplification](https://github.com/advisories/GHSA-g3hv-75wg-m249) |
| `node_modules/typescript-eslint` | 8.70.0 | True | @typescript-eslint/eslint-plugin; @typescript-eslint/parser; @typescript-eslint/typescript-estree; @typescript-eslint/utils |
| `node_modules/zod` | 4.6.5 | True | [Zod can exhaust memory while validating oversized constrained collections](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) |

## Independent security recheck (the sole retained finding)

### Decision

**Accept one LOW finding**, grouped as unresolved development-tool dependency advisories. Do not describe it as a learner-facing runtime vulnerability, a newly introduced regression, nine independent flaws, or a contradiction of the matrix's production-only audit claim.

The root reviewer's actual `npm audit --json` output has nine affected package nodes: two direct advisory roots and seven dependency-path effects. I independently parsed that output, inspected every affected lock node, inspected installed package use, resolved the ESLint configuration, and compared versions against `origin/main`.

### Exact repository locations

| Location | Evidence |
|---|---|
| `package-lock.json:6322` | Zod 4.6.5; `dev: true` at 6325. Registry advisory `GHSA-mrhx-c7xc-m3w5` reports memory exhaustion on oversized constrained collections for versions `<4.6.6` (package-level high rating). |
| `package-lock.json:1732` | Nested minimatch 10.2.6; `dev: true` at 1735. Registry advisory `GHSA-g3hv-75wg-m249` reports globparts amplification for `>=7.0.0 <11.0.1` (package-level moderate rating). |
| `package-lock.json:3131` / `3350–3361` | `eslint-config-next` 16.4.5 -> `eslint-plugin-react-hooks` 7.1.1 -> Zod, with dependency range `^3.25.0 || ^4.0.0`. |
| `package-lock.json:3133` / `1680–1693` | `eslint-config-next` -> `typescript-eslint` 8.70.0 -> `@typescript-eslint/typescript-estree` 8.70.0 -> minimatch `^10.2.2`. |

All nine audit nodes have `dev: true`. Both vulnerable leaf versions are identical on `origin/main`; the new Next/ESLint-config bump did not introduce them. The root's actual `npm audit --omit=dev --json` has zero vulnerabilities.

### Reachability and severity

- `rg` found no Zod/minimatch references in application `src`, `next.config.ts` or direct dependencies.
- Installed React Hooks plugin imports `zod/v4` and uses it for React compiler/environment/type configuration. No public learner-input path was identified. Its collection schemas were inspected; no relevant Zod `.max(...)` constrained-collection use was found. A concrete exploit was not demonstrated.
- Installed `@typescript-eslint/typescript-estree/dist/useProgramFromProjectService.js:204` calls minimatch for `allowDefaultProject` patterns. `ESLint.calculateConfigForFile('src/components/DetailedLesson.tsx')` shows no `projectService` or `allowDefaultProject` option. The dangerous pattern input is therefore not established in the current configuration, and no learner input reaches it.
- LOW reflects outstanding vulnerable development dependencies and audit failure, with limited/no demonstrated current reachability. The upstream high/moderate advisory labels must not be confused with application-specific severity.

### Concrete remediation

Refresh the Zod lock resolution to **4.6.6 or later**, within the existing allowed major-version range. For minimatch, use a parent-supported patched dependency chain when available, or a **scoped 11.0.1-or-later override only after API/Node compatibility review and clean lint/unit validation**. Keep Next and `eslint-config-next` aligned at their patched major version; do not blindly accept npm's proposed `eslint-config-next@15.5.29` downgrade or use `npm audit fix --force`.

Availability check matters: `npm view @typescript-eslint/typescript-estree@latest version dependencies.minimatch engines --json` returned **8.72.2** with **`minimatch: ^10.2.2`**, so merely updating to the presently reported latest parent is not shown to remove this advisory. `npm view zod@4.6.6 version --json` returned `4.6.6`. No dependency was changed and no proposed override was installed or tested in this audit.

### Commands and evidence

- `npm ls zod minimatch --all` — exit 0; dependency chains confirmed.
- `git show origin/main:package-lock.json` with JSON extraction — exit 0; both vulnerable leaf versions unchanged.
- Python parsing of the root's two actual audit logs and lock metadata — exit 0; every affected node is a development dependency. Result saved as `security-dependency-recheck.json`.
- `ESLint.calculateConfigForFile('src/components/DetailedLesson.tsx')` via Node — exit 0; parser options saved as `security-lint-config.json`.
- `npm view @typescript-eslint/typescript-estree@latest version dependencies.minimatch engines --json; npm view zod@4.6.6 version --json` — exit 0; outputs as above.
- Numbered lockfile reads and bounded `rg` inspection of installed call sites — performed; no product edits, exploit payload or runtime vulnerability claim.

The audit summary and dependency rows above preserve the relevant results from root's actual executions; this reviewer independently parsed those responses rather than rerunning the same registry query.

## Independent UI and test-scope review

Reviewed integration `3589f2ab7e183198b8c21391d942fd27d2589ddb` against main `88b19e2801b0f506e89c9eb76925619280ce67bf` in the shared checkout. Review-only; no product or test changes, servers, browser launches, commits or pushes by this reviewer.

### Outcome

No independently reportable UI regression, accessibility defect or weakened-test finding found in the changed source. This is a source review plus successful test discovery, **not an observed browser pass**. Browser execution and dependency/release commands are owned by the root reviewer.

### Coverage and supporting evidence

- Read AGENTS.md protective opening rules, README, build-plan acceptance/protective rules, validation history relevant to the two lessons, complete T17 handoff and supplied acceptance checklist/X01 review.
- Reviewed all changed UI/style files: `DetailedLesson.tsx`, `InsideAtomWorkedSteps.tsx`, `RelativeAtomicMassWorkedSteps.tsx`, `WorkedStepsFrame.tsx`, `WorkedStepsFrame.module.css`, `sample-lesson.css`.
- Reviewed all six added test files, plus `worked-cursor.ts`, `progress.ts` diff and related native workbench/assessment navigation. No pre-existing test/config/threshold was removed, weakened or skipped in this branch.
- `DetailedLesson.tsx:88–104,555–640`: explicit lesson, guided-stage and task gates; glossary and 44px jump link before model; original TaskWorkbench still owns its raw model history. Practice/check/review do not render a worked frame.
- `WorkedStepsFrame.tsx:47–54,70–98,104–138`: cursor change focuses the current heading; selector resets to step 0; one current before/action/after/why is rendered; Back/Next disabled at boundaries; prior-only history resets collapsed after movement; independent practice is directly available.
- `WorkedStepsFrame.module.css:21–37,84–108,224–232`: 44px select/buttons/summary; keyboard focus outlines; flexible wrapping and narrow single-column explanation. New diagrams expose text/count descriptions and symbol/double-outline differences rather than colour alone.
- `RelativeAtomicMassWorkedSteps.tsx:140–146,160–245`: current diagrams derive from current live population or count variant; current products/mean are gated by stage. `InsideAtomWorkedSteps.tsx:12–103,116–135` explicitly labels separate worked constructions and draws the exact current step counts.
- New tests cover real DOM particle counts and arithmetic, live slider/Undo/Reset, bounded keyboard navigation and focus, six restored cursor positions per pilot, stage gating, three viewport sizes, explicit target dimensions, axe, old-schema retention, corrupt/invalid nested records, denied/quota storage, held locks and conflicting/disjoint stale tabs.
- The invalid-cursor unit's reparse of an unchanged input string is trivial on its own, but the browser suite also checks actual localStorage bytes and downloaded recovery contents; there is no material false storage guarantee from that one assertion.
- Worked navigation does not award attempts or fresh evidence; existing guided/practice submissions remain `fresh:false`. No concrete duplicate reserved item exposed by the fixed worked cases was identified here. Broad shared concepts are not treated as identical assessment demands.
- Separate atom worked versus learner models was considered and rejected as a finding: both are explicitly labelled, the staged diagram matches its own current state, and retaining wrong learner work is intentional.

### Browser coverage reconciliation

Observed discovery on the audited integration:

| File | Desktop + mobile cases |
| --- | ---: |
| `tests/worked-pilots.browser.spec.ts` | 28 |
| `tests/worked-pilots-storage.browser.spec.ts` | 18 |
| `tests/task-navigation.browser.spec.ts` | 22 |
| `tests/relative-atomic-mass.browser.spec.ts` | 10 |
| `tests/atomic-foundations.browser.spec.ts` | 10 |
| `tests/atom-3d.browser.spec.ts` | 4 |
| Matrix's described set | 92 |
| `tests/titration-calculations.browser.spec.ts` (additional handoff gate) | 24 |
| Full named handoff set | 116 |

The matrix's 92 count accurately describes its six-file scope. It does not establish the extra required titration pass; absent an observed later run, record that as a coverage limitation rather than a numerical contradiction. Novice sign-off likewise remains separate from runtime/source review.

### Exact verification commands and observed results

Working directory: `/workspace/scratch/38187d036459/GCSE-Chemistry`.

```sh
npx playwright test tests/worked-pilots.browser.spec.ts tests/worked-pilots-storage.browser.spec.ts tests/task-navigation.browser.spec.ts tests/relative-atomic-mass.browser.spec.ts tests/atomic-foundations.browser.spec.ts tests/atom-3d.browser.spec.ts --list > /workspace/scratch/38187d036459/audit-evidence/ui-browser-discovery.log 2>&1
```

Exit 0; **92 tests in 6 files discovered**, no browser started.

```sh
npx playwright test tests/titration-calculations.browser.spec.ts --list > /workspace/scratch/38187d036459/audit-evidence/ui-titration-discovery.log 2>&1
```

Exit 0; **24 tests in 1 file discovered**, no browser started.

Read-only source inspection used `git diff --name-status origin/main HEAD`, scoped `git diff origin/main HEAD -- <paths>`, `rg -n`, `nl -ba`, and `sed -n` on the files enumerated above. No mutations resulted.

## Independent full chemistry review

Integration `3589f2ab7e183198b8c21391d942fd27d2589ddb` compared with main `88b19e2801b0f506e89c9eb76925619280ce67bf`.

### Scope and verdict

No subject-content error confirmed. All 83 authored tasks on the two amended lesson routes were reviewed: relative atomic mass 37 and inside an atom 46, including atomic-foundations additions. All answers, numerical working, supplied tables, scientific explanations, hints and distractor feedback were read. All 79 automatic answer records agree with independently derived expectations; the four written tasks retain scientifically sound manual rubrics. The original content files are unchanged from main.

The new worked material was reviewed independently of its unit-test assertions: 21 reachable slider values (0–100 in steps of 5), four extra fractional helper inputs, five invalid inputs, both three-step atom examples, and the six-versus-four atom-count example. No incorrect numerical statement, unit, particle count, sign, shell grouping or figure-data mapping was found. Source-level figure review does not establish rendered layout or novice comprehension.

### New worked examples

For percentage x of mass-35 atoms, independent simplification gives Aᵣ = 37 − x/50; total contribution = 3700 − 2x. The bar widths are 3.2x and 3.2(100−x), summing to 320. The mean marker maps 35 to x=12, 36 to x=160 and 37 to x=308; positive-weight interior states lie between those endpoints. Count mode uses six mass-30 and four mass-32 tiles, 180+128=308 and denominator 10, hence 30.8; 308/100=3.08 is explicitly diagnosed as implausible.

| Mass-35 percentage | Mass-35 contribution | Mass-37 contribution | Mean |
|---:|---:|---:|---:|
| 0 | 0 | 3700 | 37 |
| 5 | 175 | 3515 | 36.9 |
| 10 | 350 | 3330 | 36.8 |
| 15 | 525 | 3145 | 36.7 |
| 20 | 700 | 2960 | 36.6 |
| 25 | 875 | 2775 | 36.5 |
| 30 | 1050 | 2590 | 36.4 |
| 35 | 1225 | 2405 | 36.3 |
| 40 | 1400 | 2220 | 36.2 |
| 45 | 1575 | 2035 | 36.1 |
| 50 | 1750 | 1850 | 36 |
| 55 | 1925 | 1665 | 35.9 |
| 60 | 2100 | 1480 | 35.8 |
| 65 | 2275 | 1295 | 35.7 |
| 70 | 2450 | 1110 | 35.6 |
| 75 | 2625 | 925 | 35.5 |
| 80 | 2800 | 740 | 35.4 |
| 85 | 2975 | 555 | 35.3 |
| 90 | 3150 | 370 | 35.2 |
| 95 | 3325 | 185 | 35.1 |
| 100 | 3500 | 0 | 35 |
| 0.5 | 17.5 | 3681.5 | 36.99 |
| 33.3 | 1165.5 | 2467.9 | 36.334 |
| 73.4 | 2569 | 984.2 | 35.532 |
| 99.9 | 3496.5 | 3.7 | 35.002 |

Carbon steps: (p,n,e)=(6,6,0) → (6,6,6) → (6,6,6); Z=6, A=12 throughout; charges +6,0,0; shell counts empty,2+4,2+4. Aluminium steps: (13,13,13) → (13,14,13) → (13,14,13); Z=13, A=26→27→27; charge 0 throughout; shells 2+8+3. One added electron to the aluminium starting construction would give A26 and charge−1; one added proton would change element identity, A27 and charge+1. Carbon neutron addition changes A without cancelling +6. All match the authored explanations.

New diagrams are explicitly schematic and not electron paths; mass-number approximations and the dimensionless relative-mass convention are stated. Neutrality uses equal protons/electrons and is correctly kept separate from neutron inference. New glossary content is correct. The atomic worked construction is separate from the original learner model and explicitly labelled; the independent acceptance reviewer and subject reviewer rejected treating that intentional separation alone as a defect.

### Full route task audit

Locations identify authored task declarations; final runtime inventory also includes later notation/table/prompt additions in the same source files. IDs and contents were not edited.

| Task | Source | Independent derivation or reasoning | Result |
|---|---|---|---|
| `ram-v1-w-isotope` | `src/content/journeys/relative-atomic-mass.ts:38` | Same element fixes proton count; isotope identity changes neutron count. | confirmed |
| `ram-v1-w-complement` | `src/content/journeys/relative-atomic-mass.ts:52` | 100 − 75 = 25%. | confirmed |
| `ram-v1-w-mean` | `src/content/journeys/relative-atomic-mass.ts:61` | (10 + 14) ÷ 2 = 12. | confirmed |
| `ram-v1-r-significant` | `src/content/journeys/relative-atomic-mass.ts:73` | 31.042 rounded to three significant figures is 31.0; trailing zero is required. | confirmed |
| `ram-v1-r-weight` | `src/content/journeys/relative-atomic-mass.ts:86` | Two positive weights: majority lighter atoms place the weighted mean nearer their mass. | confirmed |
| `ram-v1-r-percent` | `src/content/journeys/relative-atomic-mass.ts:100` | 100 − 35 = 65%. | confirmed |
| `ram-v1-r-product` | `src/content/journeys/relative-atomic-mass.ts:109` | 22 × 40 = 880. | confirmed |
| `ram-v1-r-round` | `src/content/journeys/relative-atomic-mass.ts:119` | 36.584 → 36.6 to one decimal place. | confirmed |
| `ram-v1-r-meaning` | `src/content/journeys/relative-atomic-mass.ts:132` | An average can be fractional while every nuclear particle count is integral. | confirmed |
| `ram-v1-r-units` | `src/content/journeys/relative-atomic-mass.ts:146` | A mass ratio cancels its units. | confirmed |
| `ram-v1-g-light` | `src/content/journeys/relative-atomic-mass.ts:161` | 2625 + 925 = 3550; ÷100 = 35.5. | confirmed |
| `ram-v1-g-heavy` | `src/content/journeys/relative-atomic-mass.ts:180` | 875 + 2775 = 3650; ÷100 = 36.5. | confirmed |
| `ram-v1-g-transfer` | `src/content/journeys/relative-atomic-mass.ts:197` | 2520 + 3900 = 6420; ÷100 = 64.2. | confirmed |
| `ram-v1-p-two` | `src/content/journeys/relative-atomic-mass.ts:215` | 1600 + 440 = 2040; ÷100 = 20.4. | confirmed |
| `ram-v1-p-missing` | `src/content/journeys/relative-atomic-mass.ts:225` | 40% missing; 2100 + 1480 = 3580; ÷100 = 35.8. | confirmed |
| `ram-v1-p-counts` | `src/content/journeys/relative-atomic-mass.ts:234` | 98 + 45 = 143; ÷10 = 14.3. | confirmed |
| `ram-v1-p-three` | `src/content/journeys/relative-atomic-mass.ts:247` | 1680 + 500 + 260 = 2440; ÷100 = 24.4. | confirmed |
| `ram-v1-p-dp` | `src/content/journeys/relative-atomic-mass.ts:257` | 4302.9 + 2060.5 = 6363.4; ÷100 = 63.634 → 63.6. | confirmed |
| `ram-v1-p-sf` | `src/content/journeys/relative-atomic-mass.ts:272` | (2376 + 25) ÷100 = 24.01 → 24.0 to three significant figures. | confirmed |
| `ram-v1-p-explain` | `src/content/journeys/relative-atomic-mass.ts:286` | Manual rubric correctly distinguishes isotope mixture average from integer particle counts. | manual rubric reviewed |
| `ram-v1-p-units` | `src/content/journeys/relative-atomic-mass.ts:303` | The average mass/reference mass ratio is dimensionless. | confirmed |
| `ram-v1-p-working` | `src/content/journeys/relative-atomic-mass.ts:317` | 4860 + 560 = 5420; ÷100 = 54.2, below equal-weight 55. | confirmed |
| `ram-v1-p-bound` | `src/content/journeys/relative-atomic-mass.ts:339` | 12 exceeds both supplied masses and cannot be their positive weighted mean. | confirmed |
| `ram-v1-ca-two` | `src/content/journeys/relative-atomic-mass.ts:356` | 300 + 770 = 1070; ÷100 = 10.7. | confirmed |
| `ram-v1-ca-three` | `src/content/journeys/relative-atomic-mass.ts:365` | 1280 + 85 + 270 = 1635; ÷100 = 16.35. | confirmed |
| `ram-v1-ca-round` | `src/content/journeys/relative-atomic-mass.ts:375` | 4257.2 + 1596 = 5853.2; ÷100 = 58.532 → 58.5. | confirmed |
| `ram-v1-ca-meaning` | `src/content/journeys/relative-atomic-mass.ts:388` | Fractional average does not imply fractional nuclei. | confirmed |
| `ram-v1-cb-missing` | `src/content/journeys/relative-atomic-mass.ts:404` | 15% missing; 2380 + 450 = 2830; ÷100 = 28.3. | confirmed |
| `ram-v1-cb-count` | `src/content/journeys/relative-atomic-mass.ts:413` | 360 + 126 = 486; ÷12 = 40.5. | confirmed |
| `ram-v1-cb-round` | `src/content/journeys/relative-atomic-mass.ts:423` | (1152 + 52) ÷100 = 12.04 → 12.0 to three significant figures. | confirmed |
| `ram-v1-cb-check` | `src/content/journeys/relative-atomic-mass.ts:436` | More light atoms place the average inside the endpoints, nearer 50. | confirmed |
| `ram-v1-ra-two` | `src/content/journeys/relative-atomic-mass.ts:453` | 1300 + 770 = 2070; ÷100 = 20.7. | confirmed |
| `ram-v1-ra-round` | `src/content/journeys/relative-atomic-mass.ts:463` | 47.286 → 47.3. | confirmed |
| `ram-v1-ra-unit` | `src/content/journeys/relative-atomic-mass.ts:476` | Relative mass is a ratio; abundance determines weighting. | confirmed |
| `ram-v1-rb-three` | `src/content/journeys/relative-atomic-mass.ts:491` | 1440 + 750 + 260 = 2450; ÷100 = 24.5. | confirmed |
| `ram-v1-rb-counts` | `src/content/journeys/relative-atomic-mass.ts:500` | 864 + 224 = 1088; ÷20 = 54.4. | confirmed |
| `ram-v1-rb-half` | `src/content/journeys/relative-atomic-mass.ts:509` | Averaging leaves individual nuclear composition unchanged. | confirmed |
| `atom-v2-w-location` | `src/content/journeys/atomic.ts:21` | Nucleons occupy the nucleus; electrons occupy the surrounding region. | confirmed |
| `atom-v2-w-charge` | `src/content/journeys/atomic.ts:34` | +1 + (−1) = 0. | confirmed |
| `atom-found-v1-w-unit` | `src/content/journeys/atomic-foundations.ts:71` | Elemental unit is an atom; subatomic electrons are not atoms of an element. | confirmed |
| `atom-found-v1-w-element` | `src/content/journeys/atomic-foundations.ts:85` | Element identity follows atomic number; molecular bonding does not create an extra element. | confirmed |
| `atom-v2-r-particles` | `src/content/journeys/atomic.ts:48` | Relative charges are proton +1, neutron 0, electron −1. | confirmed |
| `atom-v2-r-neutral` | `src/content/journeys/atomic.ts:372` | Neutral oxygen with p=8 requires e=8; n has no charge. | confirmed |
| `atom-v2-r-mass` | `src/content/journeys/atomic.ts:387` | Lithium-7: n = A − Z = 7 − 3 = 4. | confirmed |
| `atom-found-v1-r-symbol` | `src/content/journeys/atomic-foundations.ts:101` | Sodium symbol Na; N is nitrogen; second letter lower-case. | confirmed |
| `atom-found-v1-r-state` | `src/content/journeys/atomic-foundations.ts:115` | Boiling preserves chemical identity and composition. | confirmed |
| `atom-found-v1-r-element` | `src/content/journeys/atomic-foundations.ts:129` | He atoms and N₂ molecules each contain one elemental identity. | confirmed |
| `atom-found-v1-r-count` | `src/content/journeys/atomic-foundations.ts:143` | H₂O has H and O: two elements, three atoms. | confirmed |
| `atom-v2-g-place` | `src/content/journeys/atomic.ts:64` | Nucleons have relative mass about 1; an electron has about 1/1836. | confirmed |
| `atom-v2-g-neutral` | `src/content/journeys/atomic.ts:81` | Neutral carbon p=6 requires e=6; A12 also gives n=6. | confirmed |
| `atom-v2-g-mass` | `src/content/journeys/atomic.ts:98` | Aluminium-27: n=27−13=14; neutral e=13. | confirmed |
| `atom-found-v1-g-symbol` | `src/content/journeys/atomic-foundations.ts:162` | Z11 is sodium; Na23 neutral has p11,n12,e11. | confirmed |
| `atom-found-v1-g-ratio` | `src/content/journeys/atomic-foundations.ts:181` | Each H₂O has two H and one O; scaling molecule count preserves 2:1. | confirmed |
| `atom-found-v1-g-decompose` | `src/content/journeys/atomic-foundations.ts:200` | Filtering and boiling/condensing do not decompose H₂O. | confirmed |
| `atom-v2-p-neon` | `src/content/journeys/atomic.ts:118` | Neon-22: n=22−10=12. | confirmed |
| `atom-v2-p-sulfur` | `src/content/journeys/atomic.ts:129` | Sulfur mass number A=16+18=34; electrons excluded. | confirmed |
| `atom-v2-p-error` | `src/content/journeys/atomic.ts:146` | Neutrality relates positive protons to negative electrons, not neutron count. | confirmed |
| `atom-v2-p-inverse` | `src/content/journeys/atomic.ts:160` | Neutrality gives p=e=19; n=39−19=20. | confirmed |
| `atom-v2-p-symbol` | `src/content/journeys/atomic.ts:324` | Argon-40 Z18 gives (p,n,e)=(18,22,18). | confirmed |
| `atom-v2-p-explain` | `src/content/journeys/atomic.ts:338` | Manual rubric correctly links heavy central nucleons and very small electron mass to mass distribution. | manual rubric reviewed |
| `atom-found-v1-p-element` | `src/content/journeys/atomic-foundations.ts:221` | N₂ contains only nitrogen; joined atoms of one element do not form a compound. | confirmed |
| `atom-found-v1-p-symbol` | `src/content/journeys/atomic-foundations.ts:235` | Silicon Si differs from sulfur S and case-invalid SI. | confirmed |
| `atom-found-v1-p-count` | `src/content/journeys/atomic-foundations.ts:249` | NO₂ has N1,O2: three atoms, two elemental types. | confirmed |
| `atom-found-v1-p-reaction` | `src/content/journeys/atomic-foundations.ts:260` | Chemical reaction retains elemental identities but changes bonding; heating alone is insufficient evidence. | confirmed |
| `atom-found-v1-p-boiling` | `src/content/journeys/atomic-foundations.ts:274` | Manual rubric correctly retains H₂O and H:O=2:1 on boiling; no elemental gases. | manual rubric reviewed |
| `atom-v2-ca-neutrons` | `src/content/journeys/atomic.ts:173` | Boron-11 Z5 gives (5,6,5). | confirmed |
| `atom-v2-ca-electrons` | `src/content/journeys/atomic.ts:182` | Neutral phosphorus p=15 requires e=15 irrespective of n16. | confirmed |
| `atom-v2-ca-mass` | `src/content/journeys/atomic.ts:191` | Mass distribution follows particle mass, not diagram volume. | confirmed |
| `atom-v2-cb-neutrons` | `src/content/journeys/atomic.ts:206` | Potassium-41 Z19 gives (19,22,19). | confirmed |
| `atom-v2-cb-mass` | `src/content/journeys/atomic.ts:215` | A=p+n=7+8=15. | confirmed |
| `atom-v2-cb-neutral` | `src/content/journeys/atomic.ts:224` | N(+1)+N(−1)=0; neutrons contribute zero. | confirmed |
| `atom-found-v1-ca-unit` | `src/content/journeys/atomic-foundations.ts:288` | O₂ contains two oxygen atoms; an electron is not an elemental atom. | confirmed |
| `atom-found-v1-ca-table` | `src/content/journeys/atomic-foundations.ts:302` | Z3 is lithium; He2 and Be4 are different elements. | confirmed |
| `atom-found-v1-ca-count` | `src/content/journeys/atomic-foundations.ts:316` | NH₃ has N1,H3: four atoms, two elements. | confirmed |
| `atom-found-v1-ca-mixture` | `src/content/journeys/atomic-foundations.ts:327` | CH₄ and CO₂ are distinct compounds; the stated complete unreacted sample contains both. | confirmed |
| `atom-found-v1-ca-state` | `src/content/journeys/atomic-foundations.ts:341` | Manual rubric correctly keeps pure molecular HCl through vaporisation; H:Cl remains 1:1. | manual rubric reviewed |
| `atom-v2-ra-inverse` | `src/content/journeys/atomic.ts:241` | Neutral e12 gives p12; A=12+13=25. | confirmed |
| `atom-v2-ra-location` | `src/content/journeys/atomic.ts:250` | All three locations agree with the schematic atom model. | confirmed |
| `atom-v2-rb-number` | `src/content/journeys/atomic.ts:266` | Z is p=14, independent of n15 and e14. | confirmed |
| `atom-v2-rb-neutrons` | `src/content/journeys/atomic.ts:275` | Neutral fluorine e9 gives p9; n=19−9=10. | confirmed |
| `atom-found-v1-ra-element` | `src/content/journeys/atomic-foundations.ts:355` | Pure N₂ contains one substance and one elemental identity. | confirmed |
| `atom-found-v1-ra-table` | `src/content/journeys/atomic-foundations.ts:368` | Z12 is magnesium; adjacent Na11 and Al13 differ. | confirmed |
| `atom-found-v1-ra-count` | `src/content/journeys/atomic-foundations.ts:383` | Three CO₂ molecules have 3×2=6 oxygen atoms. | confirmed |

### Checks actually executed

`node /workspace/scratch/38187d036459/audit-evidence/chemistry-probe.cjs` — exit 0; extracted final runtime data for 83 authored tasks, 25 live population states, five invalid-state rejections and six atom stages.

`python /workspace/scratch/38187d036459/audit-evidence/chemistry-check.py` — exit 0; Decimal-derived formula/rounding comparisons and all 83 task expectations agree (79 answer records plus four manual rubric presence checks; manual scientific review completed separately).

`git diff --exit-code origin/main HEAD -- src/content/journeys/atomic.ts src/content/journeys/atomic-foundations.ts src/content/journeys/relative-atomic-mass.ts` — checked separately by the reviewer; unchanged files are context for lingering defects, not introduced changes.

No product, test, media, branch or commit changes made by this reviewer. Browser execution and actual novice acceptance belong to the main audit runtime record; no pass inferred here.

## Reproduction logic for the independent chemistry calculations

These scratch-only probes were used by the chemistry reviewer. They are reproduced here as audit evidence, not added to the product test suite. The complete task-by-task expectations and numerical derivations above are also readable without executing code. The Python reproduction below omits only its Markdown-report generation tail.

### Runtime extraction (chemistry-probe.cjs)

```javascript
const fs = require('fs');
const path = require('path');
const Module = require('module');
const repo = '/workspace/scratch/38187d036459/GCSE-Chemistry';
const ts = require(path.join(repo, 'node_modules/typescript'));
const original = Module._resolveFilename;
Module._resolveFilename = function(id, parent, ...rest) {
  if (id.startsWith('@/')) id = path.join(repo, 'src', id.slice(2));
  return original.call(this, id, parent, ...rest);
};
require.extensions['.ts'] = (module, name) => module._compile(ts.transpileModule(fs.readFileSync(name, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText, name);
const ram = require(path.join(repo, 'src/lib/relative-atomic-mass-worked.ts'));
const atom = require(path.join(repo, 'src/lib/inside-atom-worked.ts'));
const inputs = Array.from({ length: 21 }, (_, i) => i * 5).concat([0.5, 33.3, 73.4, 99.9]);
const live = inputs.map(percent => ({ percent, ...ram.liveRelativeMassPopulation(percent), steps: ram.relativeMassMainSteps(percent), position: ram.relativeMassPosition(percent) }));
const invalid = [NaN, Infinity, -Infinity, -5, 105].map(value => {
  try { ram.liveRelativeMassPopulation(value); return {value: String(value), rejected: false}; }
  catch(e) { return {value: String(value), rejected: true, message: e.message}; }
});
const atoms = Object.entries(atom.insideAtomWorkedExamples).map(([id, example]) => ({id, ...example, states: example.steps.map(step => ({...step, summary: atom.workedAtomSummary(step.counts), shells: atom.workedAtomShells(step.counts.electrons)}))}));
const journeys = {
  ram: require(path.join(repo, 'src/content/journeys/relative-atomic-mass.ts')).relativeAtomicMassJourney,
  atom: require(path.join(repo, 'src/content/journeys/atomic.ts')).atomicJourneys['inside-an-atom'],
};
const inventory = {};
for (const [lesson, journey] of Object.entries(journeys)) {
  inventory[lesson] = [];
  for (const stage of ['warmup','refresher','guided','practice','checkForms','reviewForms']) {
    for (const q of journey[stage].flat()) inventory[lesson].push({...q,auditStage:stage});
  }
}
fs.writeFileSync('/workspace/scratch/38187d036459/audit-evidence/chemistry-probe.json', JSON.stringify({live,invalid,atoms,countPopulation:ram.relativeMassCountPopulation,countSteps:ram.relativeMassCountSteps,inventory}, null, 2));
console.log(JSON.stringify({liveStates: live.length,invalidRejected:invalid.filter(x=>x.rejected).length,atomStates:atoms.reduce((sum,x)=>sum+x.states.length,0),taskCounts:Object.fromEntries(Object.entries(inventory).map(([key,value])=>[key,value.length]))},null,2));
```

### Independent arithmetic and answer checks (chemistry-check.py)

```python
from decimal import Decimal as D, ROUND_HALF_UP
from pathlib import Path
import json
root=Path('/workspace/scratch/38187d036459')
repo=root/'GCSE-Chemistry'
data=json.loads((root/'audit-evidence/chemistry-probe.json').read_text())
checks=[]
def avg(masses,counts):
    return sum(D(str(m))*D(str(c)) for m,c in zip(masses,counts))/sum(D(str(c)) for c in counts)
def fmt(n):
    return format(n,'f').rstrip('0').rstrip('.') if '.' in format(n,'f') else format(n,'f')
for state in data['live']:
    p=D(str(state['percent']))
    expected=D(37)-p/D(50)
    assert abs(D(str(state['mean']))-expected)<D('1e-12')
    assert D(str(state['totalContribution']))==D(3700)-D(2)*p
    assert D(str(sum(state['counts'])))==D(100)
    assert all(abs(D(str(v))-e)<D('1e-10') for v,e in zip(state['contributions'],[D(35)*p,D(37)*(D(100)-p)]))
    assert D(35)<=expected<=D(37)
    if p==0: assert 'equals 37' in state['position']
    elif p==100: assert 'equals 35' in state['position']
    elif p==50: assert 'halfway value, 36' in state['position']
    else: assert ('closer to 35' if p>50 else 'closer to 37') in state['position']
    checks.append((str(state['percent']),fmt(D(35)*p),fmt(D(37)*(D(100)-p)),fmt(expected)))
assert all(x['rejected'] for x in data['invalid'])
for example in data['atoms']:
    for state in example['states']:
        p,n,e=(state['counts'][k] for k in ['protons','neutrons','electrons'])
        assert state['summary']==dict(atomicNumber=p,massNumber=p+n,charge=p-e)
        assert sum(state['shells'])==e
        assert state['shells']==([] if e==0 else [2,4] if e==6 else [2,8,3])
    assert example['target']['protons']==example['start']['protons']
assert data['countPopulation']['mean']==float(avg([30,32],[6,4]))==30.8
assert sum([30]*6+[32]*4)==308
# Independently derived expectations, attached to the authored task IDs only for comparison.
expected={}
def add(prefix, rows):
    for suffix,answer,why in rows: expected[prefix+suffix]=(answer,why)
add('ram-v1-',[
 ('w-isotope','Number of neutrons','Same element fixes proton count; isotope identity changes neutron count.'),
 ('w-complement',100-75,'100 − 75 = 25%.'),
 ('w-mean',(10+14)//2,'(10 + 14) ÷ 2 = 12.'),
 ('r-significant','31.0','31.042 rounded to three significant figures is 31.0; trailing zero is required.'),
 ('r-weight',"Closer to the light isotope's mass",'Two positive weights: majority lighter atoms place the weighted mean nearer their mass.'),
 ('r-percent',100-35,'100 − 35 = 65%.'),
 ('r-product',22*40,'22 × 40 = 880.'),
 ('r-round',D('36.584').quantize(D('0.1'),rounding=ROUND_HALF_UP),'36.584 → 36.6 to one decimal place.'),
 ('r-meaning','No: it is an average across different isotopes','An average can be fractional while every nuclear particle count is integral.'),
 ('r-units','No unit','A mass ratio cancels its units.'),
 ('g-light',avg([35,37],[75,25]),'2625 + 925 = 3550; ÷100 = 35.5.'),
 ('g-heavy',avg([35,37],[25,75]),'875 + 2775 = 3650; ÷100 = 36.5.'),
 ('g-transfer',avg([63,65],[40,60]),'2520 + 3900 = 6420; ÷100 = 64.2.'),
 ('p-two',avg([20,22],[80,20]),'1600 + 440 = 2040; ÷100 = 20.4.'),
 ('p-missing',avg([35,37],[60,40]),'40% missing; 2100 + 1480 = 3580; ÷100 = 35.8.'),
 ('p-counts',avg([14,15],[7,3]),'98 + 45 = 143; ÷10 = 14.3.'),
 ('p-three',avg([24,25,26],[70,20,10]),'1680 + 500 + 260 = 2440; ÷100 = 24.4.'),
 ('p-dp',avg([63,65],[68.3,31.7]).quantize(D('0.1'),rounding=ROUND_HALF_UP),'4302.9 + 2060.5 = 6363.4; ÷100 = 63.634 → 63.6.'),
 ('p-sf','24.0','(2376 + 25) ÷100 = 24.01 → 24.0 to three significant figures.'),
 ('p-explain',None,'Manual rubric correctly distinguishes isotope mixture average from integer particle counts.'),
 ('p-units',"It is a mass ratio relative to one twelfth of a carbon-12 atom's mass",'The average mass/reference mass ratio is dimensionless.'),
 ('p-working',dict(light=str(54*90),heavy=str(56*10),mean=fmt(avg([54,56],[90,10]))),'4860 + 560 = 5420; ÷100 = 54.2, below equal-weight 55.'),
 ('p-bound','The calculation is inconsistent: a positive weighted mean must lie between 10 and 11','12 exceeds both supplied masses and cannot be their positive weighted mean.'),
 ('ca-two',avg([10,11],[30,70]),'300 + 770 = 1070; ÷100 = 10.7.'),
 ('ca-three',avg([16,17,18],[80,5,15]),'1280 + 85 + 270 = 1635; ÷100 = 16.35.'),
 ('ca-round',avg([58,60],[73.4,26.6]).quantize(D('0.1'),rounding=ROUND_HALF_UP),'4257.2 + 1596 = 5853.2; ÷100 = 58.532 → 58.5.'),
 ('ca-meaning','It is an abundance-weighted average across different isotopes','Fractional average does not imply fractional nuclei.'),
 ('cb-missing',avg([28,30],[85,15]),'15% missing; 2380 + 450 = 2830; ÷100 = 28.3.'),
 ('cb-count',avg([40,42],[9,3]),'360 + 126 = 486; ÷12 = 40.5.'),
 ('cb-round','12.0','(1152 + 52) ÷100 = 12.04 → 12.0 to three significant figures.'),
 ('cb-check','An average between 50 and 52, closer to 50','More light atoms place the average inside the endpoints, nearer 50.'),
 ('ra-two',avg([20,22],[65,35]),'1300 + 770 = 2070; ÷100 = 20.7.'),
 ('ra-round',D('47.286').quantize(D('0.1'),rounding=ROUND_HALF_UP),'47.286 → 47.3.'),
 ('ra-unit','A weighted mass ratio with no unit','Relative mass is a ratio; abundance determines weighting.'),
 ('rb-three',avg([24,25,26],[60,30,10]),'1440 + 750 + 260 = 2450; ÷100 = 24.5.'),
 ('rb-counts',avg([54,56],[16,4]),'864 + 224 = 1088; ÷20 = 54.4.'),
 ('rb-half','No: it averages a mixture whose atoms have whole mass numbers','Averaging leaves individual nuclear composition unchanged.'),
])
add('atom-v2-',[
 ('w-location','Protons and neutrons','Nucleons occupy the nucleus; electrons occupy the surrounding region.'),
 ('w-charge',1-1,'+1 + (−1) = 0.'),
 ('r-particles','Neutron','Relative charges are proton +1, neutron 0, electron −1.'),
 ('r-neutral',8,'Neutral oxygen with p=8 requires e=8; n has no charge.'),
 ('r-mass',7-3,'Lithium-7: n = A − Z = 7 − 3 = 4.'),
 ('g-place','The nucleus','Nucleons have relative mass about 1; an electron has about 1/1836.'),
 ('g-neutral',6,'Neutral carbon p=6 requires e=6; A12 also gives n=6.'),
 ('g-mass',27-13,'Aluminium-27: n=27−13=14; neutral e=13.'),
 ('p-neon',22-10,'Neon-22: n=22−10=12.'),
 ('p-sulfur',16+18,'Sulfur mass number A=16+18=34; electrons excluded.'),
 ('p-error','It must have 9 electrons; neutron number may differ','Neutrality relates positive protons to negative electrons, not neutron count.'),
 ('p-inverse',19,'Neutrality gives p=e=19; n=39−19=20.'),
 ('p-symbol',dict(p='18',n=str(40-18),e='18'),'Argon-40 Z18 gives (p,n,e)=(18,22,18).'),
 ('p-explain',None,'Manual rubric correctly links heavy central nucleons and very small electron mass to mass distribution.'),
 ('ca-neutrons',dict(p='5',n=str(11-5),e='5'),'Boron-11 Z5 gives (5,6,5).'),
 ('ca-electrons',15,'Neutral phosphorus p=15 requires e=15 irrespective of n16.'),
 ('ca-mass','Protons and neutrons are much heavier than electrons','Mass distribution follows particle mass, not diagram volume.'),
 ('cb-neutrons',dict(p='19',n=str(41-19),e='19'),'Potassium-41 Z19 gives (19,22,19).'),
 ('cb-mass',7+8,'A=p+n=7+8=15.'),
 ('cb-neutral','Equal numbers of protons and electrons have opposite charges','N(+1)+N(−1)=0; neutrons contribute zero.'),
 ('ra-inverse',12+13,'Neutral e12 gives p12; A=12+13=25.'),
 ('ra-location','Protons and neutrons in the nucleus; electrons in shells','All three locations agree with the schematic atom model.'),
 ('rb-number',14,'Z is p=14, independent of n15 and e14.'),
 ('rb-neutrons',19-9,'Neutral fluorine e9 gives p9; n=19−9=10.'),
])
add('atom-found-v1-',[
 ('w-unit','An atom','Elemental unit is an atom; subatomic electrons are not atoms of an element.'),
 ('w-element','It contains only one type of atom','Element identity follows atomic number; molecular bonding does not create an extra element.'),
 ('r-symbol','Na','Sodium symbol Na; N is nitrogen; second letter lower-case.'),
 ('r-state','H₂O molecules','Boiling preserves chemical identity and composition.'),
 ('r-element','Neither: each contains one element','He atoms and N₂ molecules each contain one elemental identity.'),
 ('r-count','2','H₂O has H and O: two elements, three atoms.'),
 ('g-symbol','Na','Z11 is sodium; Na23 neutral has p11,n12,e11.'),
 ('g-ratio','2:1','Each H₂O has two H and one O; scaling molecule count preserves 2:1.'),
 ('g-decompose','A chemical reaction that decomposes water','Filtering and boiling/condensing do not decompose H₂O.'),
 ('p-element','One element','N₂ contains only nitrogen; joined atoms of one element do not form a compound.'),
 ('p-symbol','Si','Silicon Si differs from sulfur S and case-invalid SI.'),
 ('p-count',dict(nitrogen='1',oxygen='2',types='2'),'NO₂ has N1,O2: three atoms, two elemental types.'),
 ('p-reaction','Atoms are chemically rearranged to form a new substance','Chemical reaction retains elemental identities but changes bonding; heating alone is insufficient evidence.'),
 ('p-boiling',None,'Manual rubric correctly retains H₂O and H:O=2:1 on boiling; no elemental gases.'),
 ('ca-unit','One oxygen atom','O₂ contains two oxygen atoms; an electron is not an elemental atom.'),
 ('ca-table','Li','Z3 is lithium; He2 and Be4 are different elements.'),
 ('ca-count',dict(nitrogen='1',hydrogen='3',types='2'),'NH₃ has N1,H3: four atoms, two elements.'),
 ('ca-mixture','A mixture of two compounds','CH₄ and CO₂ are distinct compounds; the stated complete unreacted sample contains both.'),
 ('ca-state',None,'Manual rubric correctly keeps pure molecular HCl through vaporisation; H:Cl remains 1:1.'),
 ('ra-element','An element','Pure N₂ contains one substance and one elemental identity.'),
 ('ra-table','Mg','Z12 is magnesium; adjacent Na11 and Al13 differ.'),
 ('ra-count',3*2,'Three CO₂ molecules have 3×2=6 oxygen atoms.'),
])
assert len(expected)==83,len(expected)
rows=[]
manual=0
for lesson,tasks in data['inventory'].items():
    for task in tasks:
        answer,reason=expected[task['id']]
        actual=task['answer']
        if answer is None:
            assert task.get('rubric')
            manual+=1
            verdict='manual rubric reviewed'
        elif isinstance(answer,dict):
            assert json.loads(actual)==answer,(task['id'],actual,answer)
            assert {p['id']:str(p['answer']) for p in task['parts']}==answer,(task['id'],'parts')
            verdict='confirmed'
        elif isinstance(answer,(int,D)):
            assert D(actual)==D(answer),(task['id'],actual,answer)
            verdict='confirmed'
        else:
            assert actual==answer,(task['id'],actual,answer)
            verdict='confirmed'
        if task['id'].startswith('ram-'):
            src='src/content/journeys/relative-atomic-mass.ts'; needle='"'+task['id']+'"'
        elif task['id'].startswith('atom-found-'):
            src='src/content/journeys/atomic-foundations.ts';needle='"'+task['id'].removeprefix('atom-found-v1-')+'"'
        else:
            src='src/content/journeys/atomic.ts';needle='"'+task['id']+'"'
        line=next(i for i,l in enumerate((repo/src).read_text().splitlines(),1) if needle in l)
        rows.append(f"| `{task['id']}` | `{src}:{line}` | {reason} | {verdict} |")
```

## Decisions not escalated into findings

- Separate atom worked and learner models: accurate, explicitly labelled separation preserves wrong learner work; there is no demonstrated criterion breach. Both subject and acceptance reviewers rejected a coupling-only complaint.
- Pending novice trial: a real acceptance limit explicitly disclosed by both source records; it is reflected in the T17 partly verdict, not misrepresented as a hidden code defect.
- Matrix 92 versus required 116: a verified scope difference; the 92 count is truthful and does not include the 24 titration cases. The latter remain a closure requirement, not proof that the reported 92 failed.
- Browser environment failure: no product-failure inference or pass claim. No attempts were made to bypass it.
- One trivial raw-string reparse unit assertion: not a material vacuity finding because independent browser tests check actual storage bytes and recovery downloads; these browser tests remain unexecuted here.

## Handoff boundary

This audit proposes no application or test implementation. It retains one independently rechecked LOW inherited development-dependency finding, and records the unresolved novice/runtime acceptance gates separately. Full subject review of other routes, human teacher/novice sign-off, deployment and owner merge decisions are outside this audit.

## Final independent report review

The acceptance reviewer re-read the 72-line primary report and supporting evidence, matched the stated outcomes to actual command receipts and log tails, and approved publication with no factual correction. The sole LOW finding, T17/T20 partly verdicts, 92/116 scope distinction and browser-not-run wording were independently accepted.

Pre-publication commands `git add -- docs/upgrade-2026-11/audit2-GCSE-Chemistry.md docs/upgrade-2026-11/audit2-GCSE-Chemistry-evidence.md`, `git diff --cached --check`, `git diff --cached --name-status`, `git diff --name-only`, `git write-tree` and `git rev-parse HEAD` all exited 0. The staged inventory contained exactly the two added Markdown reports; no unstaged tracked change was present. The primary report has fewer than 150 lines and both reports have balanced Markdown code fences.
