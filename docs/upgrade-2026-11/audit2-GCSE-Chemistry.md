# Audit 2 — GCSE Chemistry — 10 November 2026

**Overall: T17 partly complete; one LOW inherited dependency finding.** No chemistry error, saved-data regression, assessment-sealing defect or weakened existing test was confirmed. Browser behaviour and novice acceptance are not independently signed off by this audit.

- Audited integration: `3589f2ab7e183198b8c21391d942fd27d2589ddb` (`claude/integration-2026-11`).
- Compared main: `88b19e2801b0f506e89c9eb76925619280ce67bf`; report branch: `gpt/audit2-2026-11-10`.
- Scope: all 19 changed files; both pilot routes, including all 83 existing tasks and four new worked examples. AGENTS.md, README, protective build/validation rules, T17 handoff and the three authorised Drive acceptance documents were read.
- Evidence and complete calculations: [audit2-GCSE-Chemistry-evidence.md](audit2-GCSE-Chemistry-evidence.md). Only these two report files are delivered; application code, tests and dependencies are unchanged.

## Verdict per applicable ticket

| Ticket | Verdict | Evidence |
|---|---|---|
| T17 — novice-path pilots | **partly** | Both gated players, difficult variants, navigation and additive cursor are implemented (`src/components/DetailedLesson.tsx:88`, `src/lib/progress.ts:418`); 83-task subject review and 1,174 units pass, but the novice explanation criterion at `docs/upgrade-2026-11/T17.md:21` remains unverified and this audit could not run browsers. |
| T20 — acceptance matrix, this repository only | **partly** | Unit/lint/build and zero production-advisory claims reproduced; discovery confirms the reported 92-case scope, but the additional 24 titration cases required at `docs/upgrade-2026-11/T17.md:184` lack current passing evidence in the supplied record; novice/owner sign-off remains outstanding. |

T01–T16, T18–T19 and T21 belong to other repositories. The cross-cutting production security update is **confirmed**: Next.js and eslint-config-next resolve to 16.4.5, and `npm audit --omit=dev --json` exits 0. L1 concerns development dependencies outside that claim.

The matrix explicitly defines “Verified” as scoped automated Chrome evidence and lists novice review as pending. Its 92 count is accurate; neither the earlier worker's browser failures nor this environment's launch failure disproves the coordinator's later run. This audit does not convert that reported run into an independently observed pass or complete ticket acceptance.

## Findings, ordered by severity

**Critical: 0. High: 0. Medium: 0. Low: 1.** Every published finding was rechecked by a separate reviewer.

### L1 — LOW — inherited vulnerable dependencies remain in lint tooling

- **Locations / defect:** `package-lock.json:6322` retains Zod **4.6.5** and `package-lock.json:1732` retains nested minimatch **10.2.6**. The actual full `npm audit --json` exits 1 for [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) and [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249): two advisory roots affecting nine dependency nodes, not nine independent flaws.
- **Why it matters / scope:** contributor and CI installs retain dependencies with memory-exhaustion / pattern-amplification advisories. Both leaves are unchanged from main and all affected nodes are development-only. No learner-input exploit path was established; the current ESLint configuration does not enable the identified minimatch path. LOW is the application-specific rating, despite the upstream Zod high rating. The production audit remains clean.
- **Concrete fix:** refresh Zod to **4.6.6 or later** within its existing range; remediate minimatch with a parent-supported patched chain, or a scoped **11.0.1-or-later** override after API/Node compatibility and lint/unit validation. The presently checked latest TypeScript-ESLint parent still requests minimatch 10; do not blindly downgrade eslint-config-next or use a forced blanket audit fix. Rerun full audit and affected checks.
- **Independent recheck:** a second reviewer verified both lock lines, main-version equality, installed dependency chains, actual audit output and resolved ESLint configuration; accepted this single LOW finding. No exploit or product fix was attempted.

## Acceptance limits and clean coverage

- **Subject:** all 37 relative-mass tasks and 46 atom tasks, 79 automatic answer records and four manual rubrics reviewed. All 21 reachable slider settings, four extra fractional helper probes, five invalid-input rejections and six atom stages checked. Count variant: `(6×30 + 4×32)÷10 = 30.8`; carbon charge `+6→0` with `A=12`; aluminium `A=26→27` with charge 0. No error found.
- **Preservation:** all original content/IDs, marking, model-validation/workbench and assessment-session files are byte-unchanged. The optional bounded cursor spreads existing work and uses the established journal/lock/conflict mechanism. Strict TypeScript remains enabled; original tests and thresholds were not weakened or skipped.
- **Teaching/accessibility:** source supports before/action/after/why, matched figures, collapsed history, direct practice access, labels, focus and 44px rules. The separate atom worked construction is accurately labelled. Actual keyboard, 320px/phone geometry, axe, zoom, 3D fallback and cross-tab browser outcomes are **not run** here.
- **Required closure:** record a novice explaining the four causal ideas from the rendered players; supply final-source runtime receipts for the full named 116-case set, including isolated titration. The coordinator's 92-case result covers 46 pilot/storage + 22 navigation + 10 relative-mass + 10 atomic-foundations + 4 atom-3D cases. The full course browser suite and novice trial are not claimed.
- **Security/performance:** no new unsafe HTML/eval, remote request or credential literal was found in the changed application files. New diagrams are bounded and local; no browser performance measurement was possible. Review of unchanged content was limited to the two pilot lessons, not a fresh subject audit of all 95 routes.

## Exact validation commands and observed results

Commands ran in the shared checkout using Node **24.22.1**, npm **11.9.0**; reviewer-owned probes are identified in the evidence file. Shell logging wrappers only captured output and exit status.

| Exact command | Observed result |
|---|---|
| `npm_config_cache=/workspace/.npm-cache npm ci` | Exit 0; 361 packages installed from the lockfile. |
| `npm run typecheck` | Exit 0; generated route types and strict TypeScript passed. |
| `npm run lint` | Exit 0. |
| `npm run test:unit` | Exit 0; **1,174 passed**, 1.7 minutes. |
| `NEXT_TELEMETRY_DISABLED=1 npm run build` | Exit 0; Next.js 16.4.5, **143 pages**; build ID recorded in evidence. |
| `npm audit --omit=dev --json` | Exit 0; **0** vulnerabilities. |
| `npm audit --json` | Exit 1; **1 high / 8 moderate affected dependency nodes**, all development-only; see L1. |
| `npm ls zod ajv --all` | Exit 0; Zod's lint-tool dependency path confirmed. |
| `npm ls zod minimatch --all` | Exit 0; second reviewer confirmed both paths. |
| `npm view @typescript-eslint/typescript-estree@latest version dependencies.minimatch engines --json` | Exit 0; 8.72.2 still requires minimatch `^10.2.2`. |
| `npm view zod@4.6.6 version --json` | Exit 0; patched version exists. |
| `node /workspace/scratch/38187d036459/audit-evidence/chemistry-probe.cjs` | Exit 0; extracted all 83 route tasks and new worked states. |
| `python /workspace/scratch/38187d036459/audit-evidence/chemistry-check.py` | Exit 0; independent Decimal calculations/answer comparisons agree; manual rubrics separately reviewed. |
| `git diff --exit-code origin/main HEAD -- src/content src/lib/marking.ts src/lib/workbench.ts src/lib/model-state.ts src/components/AssessmentSession.tsx AGENTS.md README.md playwright.config.ts playwright.unit.config.ts tsconfig.json tests/relative-atomic-mass.browser.spec.ts tests/atomic-foundations.browser.spec.ts tests/atom-3d.browser.spec.ts tests/task-navigation.browser.spec.ts tests/titration-calculations.browser.spec.ts` | Exit 0; protected sources/configuration/existing regression files unchanged at audited head. |
| `git diff --check` | Exit 0. |

```sh
npm run test:e2e -- tests/worked-pilots.browser.spec.ts tests/worked-pilots-storage.browser.spec.ts tests/relative-atomic-mass.browser.spec.ts tests/atomic-foundations.browser.spec.ts tests/atom-3d.browser.spec.ts tests/task-navigation.browser.spec.ts tests/titration-calculations.browser.spec.ts --list
```

Exit 0; **116 tests in seven files discovered**, no browser assertions executed.

```sh
node -e 'const { chromium } = require("@playwright/test"); (async () => { const browser = await chromium.launch({ executablePath: "/usr/bin/chromium" }); console.log("Chromium", browser.version()); const page = await browser.newPage(); await page.setContent("<h1>Audit browser capability</h1>"); console.log(await page.textContent("h1")); await browser.close(); })().catch(error => { console.error(error); process.exit(1); });'
```

Exit 1 before page creation: `process_singleton_posix.cc:297`, `socket() failed: Operation not permitted (1)`; Chromium terminated with SIGABRT. Application E2E: **not run**. No escalation, media render, screenshots, deployment or paid API use. Exact checkout commands, additional reviewer commands, audit metadata, calculations and recheck rationale are in the companion evidence report.
