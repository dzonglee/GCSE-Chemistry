# Energy-practical equation review

Working baseline: AQA Chemistry8462, common Foundation/Higher mathematical requirements. Handoff commit `fcd8c8293c70105095a6d3638f4d3b264e6d2e07`. Scope is the existing `energy-practical` lesson's equation interpretation, not another graph construction, practical redesign or whole-course mathematics audit.

## Inspection and the confirmed narrow gap

Read the actual59-task journey, all graph-related task prompts/feedback, native practical records, gradient/intercept workbench, PracticalPlot, scatter data, plot editor and deferred graph reference. Viewed the **actual** Chemistry gradient and scatter UI at320/390/1280, including a saved malformed `1..2` gradient after reload. The existing journey has six working practical modes, supplied fitted coordinates, matching gradient triangles and units, extrapolated initial-temperature estimates, fitted maxima, full editable scatter/line/extrapolation work, separate raw observations and retained proposals. These are useful and already meet substantial numerical/graphical demands. A literal-string search alone would not justify changing them.

The learner-facing controls and feedback identify slopes/intercepts and calculate matching differences, but do not represent them as `y=mx+c`, explain the roles of its letters, or elicit coefficient interpretation from a supplied equation. The plot code internally computes slope/intercept; that implementation detail is not learner teaching. Comparing the actual Maths gradient/intercept source and guided/independent UI confirms the missing bridge. Hence the correction is explicit symbolic interpretation **only**, not a claim that graphical slope/intercept work was absent.

## Actual authoritative sources and inspected figures

- [AQA8462 specification](https://filestore.aqa.org.uk/resources/chemistry/specifications/AQA-8462-SP-2016.PDF), version1.1, printed/PDF p99: mandatory mathematical skill4b is “Understand that y = mx + c represents a linear relationship”;4d separately requires determining slope/intercept. Both are general qualification mathematics. Personally read and viewed the actual table.
- Same specification p105,8.2.4 required practical4: investigation of variables affecting temperature changes in reacting solutions, AT1/3/5/6 and opportunities MS4a/4c. This page does **not** separately list4b for this practical. Adding the general linear-equation bridge does not create a new required apparatus procedure or justify importing mandatory calorimetry/enthalpy.
- [Actual June2022 Foundation Paper1](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621F-QP-JUN22.PDF), Q10.2–3/Figure17 pp36–37, [paired MS](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621F-MS-JUN22.PDF) p28. Personally inspected the fitted ascending line and scheme: matching differences, gradient1.6°C/g, extrapolated intercept20.6°C, half-small-square tolerance/error-carried-forward in actual examiner marking. Existing app work addresses these graph demands. The new tasks do not copy the figure or claim examiner marking.
- [Actual June2023 Higher Paper1](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-84621H-QP-JUN23.PDF), Q02.2–4/Figure2 p7, [paired MS](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-84621H-MS-JUN23.PDF) p9: six plotted observations, best fit, extrapolation and a reading matched to the student's line. Personally viewed the actual graph and mark scheme. Preserve the existing common-tier construction extension and manual graph review; do not duplicate it.
- [AQA practical handbook](https://filestore.aqa.org.uk/resources/chemistry/AQA-8462-PRACTICALS-HB.PDF), student temperature-change analysis PDF p42/printed41: two fitted lines/intersection. Personally inspected the page. Its practical interpretation remains existing work, not a universal single linear law for all temperature investigations.

Downloads, source hashes and rendered pages are retained under `/workspace/course-audit/parallel-review/` and the external `.research/energy-practical` directory. Only selected clauses/questions were inspected; full Pearson/OCR certification is not claimed.

## Before/after decisions and exact mapping

What is interesting: the same constant slope that builds a triangle is the coefficient of x, while extrapolation to x=0 leaves c. A negative coefficient means a falling fitted temperature, not a negative initial temperature. Distinguish x (mass here) from m (gradient in the equation). A fitted estimate is not a new observation or a universal reaction law.

Assets: the existing apparatus and graph assets are sufficient. No new 3D asset, measurements, graph widget or construction exercise is needed. The existing choices and short numeric multipart controls are appropriate for this narrow mathematical response; essays are not.

| Clause/demand                                                         | Actual task mapping                                                                                                 | Decision                                                                                             |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| MS4b: `y=mx+c` is a linear relationship with constant gradient        | `ep-v1-equation-guided`, `ep-v1-equation-recovery`                                                                  | Identify m=1.5 and c=21.2 for the **existing** decimal fit; explain constant change per gram and x=0 |
| Interpret gradient/intercept from another supplied linear equation    | `ep-v1-equation-practice`                                                                                           | Enter m=−0.4°C/g and c=23.8°C for different supplied values; sign and both coefficients matter       |
| MS4d, numerical/graphical translation                                 | Existing `ep-v1-g-graph`, `p-gradient`, `p-intercept`, `a-gradient`, `b-intercept`, `d-a-gradient`, `d-b-intercept` | Preserve every original prompt/data/feedback and independent/delayed form                            |
| Plot, straight fit, extrapolation, own-line reading                   | Existing `ep-v1-g-scatter`, `r-scatter`, `p-scatter`                                                                | Preserve raw pairs, editable line ends, estimate, wrong work and manual review                       |
| Required practical apparatus, observation, repeat/evaluation controls | Existing plan/observe/repeat/graph/fit/evidence tasks                                                               | No changes                                                                                           |

Three tasks append to guided/recovery/practice. Original practice indices0–23 and all59 original definitions/forms are fingerprint-checked including their global exposure aliases. Journey version1 remains. Identical guided/recovery demands share exposure; practice values differ. Reserved numerical graph checks and seven-day reviews remain intact. **A separate reserved symbolic-equation form is not added**; the bounded change teaches/practises the notation and preserves existing independent graph assessment. Completion cannot establish practical competence or exam readiness.

## Actual Maths UI comparison

Read `gradient-and-intercept.ts`: guided straight-line construction and short numerical coefficient/intercept responses; actual independent question asks the gradient of `y=−3x+8`. Viewed its real guided/independent UI at320/390/1280 on the isolated reference server3300. All six selected screenshots personally inspected. Maths places the equation at the centre of the task and uses short number responses; the Chemistry bridge follows this demand while keeping its chemical units and fitted-estimate limits. The large Maths mobile construction is not a reason to weaken Chemistry's664px control requirement.

## Validation

Final logs, native screenshots, source fingerprints and failures/fixes are recorded in the external energy delivery report. The scatter unit assertions now locate their original tasks by preserved IDs rather than assuming those tasks remain last after another append; no graph/science assertion is removed or weakened. The original ten manual responses and all25 original scalar numerical references remain checked. New multipart coefficient values have separate scientific/marking checks.

Main session owns integration, shared styles/components and the final whole-course regression.

## Final production validation and integration

Types, full lint and real production build pass. Full982 units pass;27 affected units pass after the final scoped CSS/harness correction. Final native production run on3202:66 desktop/mobile cases pass in6.4minutes, including both new equation checks at fonts-ready320/390/1280, axe/no page overflow, malformed1..2 after reload, valid-wrong0.4 after recovery and correct signed coefficients. Original practical/raw-measurement/fit/scatter/manual-review controls also pass. All2436 protected application/test/config/public/build files and other non-generated files stayed hash-identical; final process exit confirmed before edits.

Personally inspected guided-correct and retained-malformed practice screenshots at all three widths. First guided option:56px high, bottom594.73/572.41/564.14px. First coefficient field:46px high, bottom597.73/597.73/650.14px. Existing graph text assertions retain at least12px readability. No threshold was relaxed.

The first unified run had64 passes and two stale harness expectations: after entering0.4 the recovery expectation incorrectly still asked for1..2. Correct only that expectation; the earlier malformed-reload assertion remains. A separate native probe found desktop bottom711.80px, corrected with27 lines in sample-lesson.css scoped to energy-practical's new multipart task. Desktop navigation remains keyboard-scrollable; original energy tasks/other lessons do not trigger the rule. No controls/data are removed.

The user's direct permission for necessary isolated lesson CSS corrections applies; main still owns sequential shared-style integration. docs/energy-equation-layout.patch is the exact small diff already included in this branch. Do not apply it twice after merging/cherry-picking; selectively integrate after main's current server/test exits, without copying the whole shared file. Main handles final integrated whole-course regression. Evidence and historical failures are under /workspace/course-audit/parallel-review/.


## Main integration review — 2026-10-09 (in progress)

The preceding delivery evidence belongs to the external worker's earlier build. Main personally read the actual AQA mathematical requirements and paired 2022 Foundation/2023 Higher temperature questions and mark schemes, inspected their figures, and compared fresh Maths guided and genuinely independent gradient/intercept screens at320 and1280. Main also downloaded the current practical handbook and inspected PDF15–16 (printed14–15): required practical4 context and the explicit two-line intersection guidance. Substitution is MS3c; MS3b concerns changing the subject.

The three-task external bridge alone did not provide independent symbolic-equation assessment. Main appended two two-question cold forms and two two-question changed-fit seven-day forms: signed m/c interpretation then substitution inside the stated1–5g fitted range. All59 original tasks and original form positions remain fingerprint-identical; version1 remains. The journey now contains70 tasks,25 practice and ten manual responses. New numeric equations have distinct values; guided/recovery equivalents retain shared exposure. This is mathematical transfer practice and does not replace the practical's non-linear/two-line contexts or certify supervised apparatus competence.

Initial main validation: types and affected lint passed,15 affected units passed. The first frozen production run passed both guided/practice cases and failed both new reserved-form cases: first coefficient field bottom714.875px at320, above the unchanged664px limit. Main verified all2226 frozen fingerprints after actual process exit, then scoped spacing/heading changes to energy assessment panels containing the new concise equation prompt. Full units and corrected production validation are pending; no acceptance claim yet.

Corrected main validation so far:990 full units passed1.2minutes, real production build exited0, all four new production cases passed2.0minutes,2226 frozen fingerprints verified after exit. The separate30-case original practical/scatter regression is still running. Private final assessment captures passed all eight320/1280 form openings; active tab strip positioned for captures. Whole-app audit should investigate restoring active tab visibility automatically on reload; capture positioning alone does not fix that UX.

### Accepted main energy integration

All30 original desktop/mobile practical/scatter cases passed2.8minutes after the final change. Together with four new cases, all34 targeted production cases passed in their two executed runs. Full990 units1.2minutes, typecheck, full lint and production build passed. Eight final assessment openings personally inspected/captured; representative guided, malformed draft, independent, changed-fit review and submitted feedback screenshots explicitly sent.2226 frozen fingerprints verified after both actual browser exits and private capture exit. No browser server owns the build now.

Catalogue95 routes/5715 tasks/2150 practice/818 honest manual responses. These are inventory counts, not an exam-readiness certificate. Exact clause/tier/WS/MS/AT maps and final whole-course regression remain open.
