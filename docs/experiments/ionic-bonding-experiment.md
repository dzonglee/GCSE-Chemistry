# Ionic bonding: optional visual experiment

Route: `/experiments/ionic-bonding`. Branch: `codex/chemistry-ionic-bonding-experiment`, based on `8f77886f8e0f604c57e04a87f2d0eb6ffd41ae54`.

This is a separate presentation experiment for one lesson. The existing ionic-bonding journey already contains 52 tasks and independent construction; none is replaced. No existing application, shared component, stylesheet, dependency or configuration file is edited.

## Research and response demands

- [AQA 8462 specification](https://filestore.aqa.org.uk/resources/chemistry/specifications/AQA-8462-SP-2016.PDF), printed pages 27–28, 4.2.1.2: reversible transfer, unchanged nuclei, electron counts, dot/cross origins, ion charges and brackets. The first prediction withholds charge labels until checking, including the enlarged view.
- Same, 4.2.1.3: magnesium/chloride ratio; flat NaCl slice versus a turnable projected lattice, showing attraction in all directions. Six neighbours describe this NaCl model and are supporting visualisation, not a universal salt recall requirement. Captions distinguish model limitations and extended structures from molecules.
- [2022 Higher Paper 1](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621H-QP-JUN22.PDF), page 4, Q01.7, and [mark scheme](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621H-MS-JUN22.PDF), page 9: describe Mg/O electron transfer, number of electrons and resulting ions/full shells. [Foundation paper](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621F-QP-JUN22.PDF), page 34, Q09.7, and [scheme](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621F-MS-JUN22.PDF), page 26, confirm the same demand at both tiers. Full explanation/diagram review remains manual; no examiner marks are awarded.
- [OpenStax Chemistry 2e, 7.1](https://openstax.org/books/chemistry-2e/pages/7-1-ionic-bonding): fixed nuclei, electron transfer versus electrostatic bonding, extended NaCl structure. Advanced college-level material was not imposed as GCSE recall.

The actual specification pages and paired exam pages were personally inspected. Actual GCSE Maths roots-and-reciprocals-priority source and fresh guided/independent production views at 1280/390/320 were compared, including wrong-work reload and sealed responses. Reference commit: `32342d38e6c5d5436e472c56a97161eb272796e9`.

## Why each chapter helps

Transfer makes charge a consequence of changing electron count. Balance permits an incorrect two-to-one-chlorine distribution, retains it and requires reversal/repair before the formula response. Connect exposes the missing depth of a flat lattice. Challenge uses supported MgO construction, short bonding recall and a bounded explanation. Revisit changes the donor arrangement to Na2O after seven days.

Visual design is isolated: cream/green surfaces, large headings, original local fonts, apricot/lilac vector particles, enlarged atom inspection, count ledger and responsive chapter rail. No downloaded/generated art, external runtime service or new dependency. Motion follows actual send/return actions and respects reduced motion.

## Persistence and assessment

Only the existing `gcse-chemistry.progress.v1` namespace is used. Experimental work occupies `experiment-ionic-bonding`, draft `ionic-lab-v1`, version 1. Old tasks, forms, indices, drafts and histories are untouched. Opening guidance conservatively exposes all 52 original ionic equivalents; it can affect their freshness but never records correctness or mastery.

Every experimental run is `helped: true`, `fresh: false`, including delayed runs. All three responses must be recorded before whole submission reveals references. Wrong/partial work survives reload; edits invalidate recording. Unreadable experimental bytes survive untouched, and explicit recovery archives them while preserving sibling work. Existing corrupt/blocked-storage and stale-tab protections are reused. Seven days means 168 hours from the latest submission; previous runs remain.

## Validation and reproducibility

Own checkout and production port 3202 were used; actual Maths reference ran on 3300. Main-session servers were not reused or stopped. Source/test/config/public/build fingerprints were unchanged throughout each production browser/manual run; processes exited before edits or rebuilds.

- `npm run typecheck`, clean `npm run lint -- --max-warnings=0`, and real `npm run build`: pass after the final prediction correction.
- `npm run test:unit`: 1,032 pass; nine new experiment checks cover literal atom arrangements, all permitted transfers, wrong-work repair, schema rejection, recording/submission, the exact review gate and lattice geometry. Final affected nine also pass.
- Native production browser: 27 experiment cases across 1280/390/320, zero retries, pass after the final correction. Retained original ionic lesson: 20 desktop/mobile cases pass. Existing shared storage: 10 desktop/mobile cases pass; those last two checks preceded the experiment-only icon/prediction refinements.
- Final native capture: 69 states, 87 PNGs. Fonts ready, zero horizontal overflow, zero axe violations and zero page errors. First complete answer/action controls: minimum height 48px, maximum bottom 661.703125px in a 664px viewport. SVG text minimum 12.5611px. Submitted read-only review is not treated as a new answer control. Rendered dot/cross counts equal each atom's electron count. Native touch/DPR, wrong-work reload and actual delayed submission/history were checked.

Browser config and capture helper are retained with the external evidence. They use `/usr/bin/chromium`, `reuseExistingServer: false`, own port 3202, and native device descriptors. Existing default test config still uses the main-session port; use an isolated port override when reproducing concurrently.

Detailed source mapping, baseline/design changes, failures/fixes, logs, frozen manifests, exact changed files, unified patch and personally inspected final screenshots are in `/workspace/course-audit/brilliant-ionic-experiment/`. In particular see `RESEARCH-AND-DESIGN.md`, `VALIDATION.md` and `SCREENSHOTS.md`.

## Limits

This is scaffolded diagram manipulation, not freehand drawing or fresh unassisted assessment. It has not received independent reviewer acceptance, whole-course browser regression, actual iOS Safari/assistive-technology user testing, grade/readiness certification or complete Pearson/OCR alignment. No shared-component patch is needed. It is not merged, deployed or published.
