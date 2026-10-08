# Lesson 56: Titration technique — individual design review

The following before-review records the individually researched private draft. Final implementation and validation are recorded at the end; this lesson is now integrated.

## What must this particular lesson teach?

Read the bottom of a concave meniscus at eye level; the burette scale increases downwards. Record initial and final readings and subtract, rather than treating the final reading as the delivered volume. Select suitable careful repeats under an explicitly stated protocol before calculating their mean. Explain fixed accurate pipette aliquots versus variable accurately measured burette delivery. Explain rinsing, removing the filling funnel, filling the jet, controlled dropwise addition, swirling and a white tile. Distinguish a suitable sharp indicator endpoint from universal indicator's broad sequence of colours and from exact equivalence. Explain systematic errors and comparative investigation controls. Transfer an established reacting-volume ratio to an indicator-free salt preparation.

## What makes the lesson interactive and useful?

Five independent workbench decisions are proposed: read/subtract a burette; select/evaluate repeats; diagnose equipment/rinsing errors; choose controlled endpoint actions using supplied observations; repair method sequencing and comparative controls. Avoid presenting a decorative apparatus as the learning task. Each manipulated record must have a checkable prediction and a reason-specific response. Fixed written questions retain their own stated data regardless of model changes.

The repeat selector evaluates any selected group rather than inventing a unique concordant cluster. A user can correctly diagnose an unsuitable selection; that is not acceptance of those titres. Display selected count, spread and mean with explicit provisional labels. Protocol requires at least two careful readings, excludes the labelled rough estimate, and states a maximum span. Compare largest minus smallest; adjacent close readings can form an unacceptable chain. Use integer hundredths to include the exact threshold without floating-point accidents. Repeatability is not proof of accuracy.

## Actual materials read and inspected

- AQA 8462 specification 4.4.2.5 and required practical 2: practical reacting-volume measurement is Foundation/separate; unknown concentration calculations are Higher.
- AQA practical handbook, https://filestore.aqa.org.uk/resources/chemistry/AQA-8462-PRACTICALS-HB.PDF : downloaded successfully as PDF, teacher practical 2 pages 10–11 (PDF 11–12) read and images inspected. Its illustrative careful titres 15.55 and 15.35 average 15.45; do not impose a universal 0.10 cm³ concordance rule on this handbook pair. Technician/student simplifications do not eliminate teacher notes on nonzero initial readings, meniscus, rinsing, pipette draining and rough trials.
- AQA June 2018 Higher paper 1 questions 09.3–09.4 and paired mark scheme read: selected 22.10, 22.15, 22.15 average 22.13; excluded 23.50/21.10; accurate fixed pipette versus variable burette. The question's stated criterion matters.
- AQA June 2022 Higher paper 1 question 08.2 and paired scheme read: 23.90 excluded; 23.45, 23.55, 23.55, 23.45 average 23.50. Scheme supports readings within its stated 0.10 criterion.
- AQA June 2019 Foundation paper 1 question 09.5 and paired scheme read AND actual question PDF37/scheme PDF20 visually inspected: valid logically sequenced comparative acid method, fixed aliquot, indicator, swirling/white tile, rough/accurate titrations, dropwise endpoint, repeats/mean, comparison. Reversing acid/alkali orientation can be valid. Written work must stay self-reviewed; no automated six-mark award.
- Pearson Combined specification printed page 42 (PDF46), actual image inspected this turn: 3.16 and 3.18 are plain type, not Higher-only bold. Combined includes titration for a pure dry salt.
- Pearson separate Chemistry specification printed page 25 (PDF29), actual image inspected: 5.9C accurate acid/alkali titration is plain italic core practical; 5.10C concentration/volume calculation is bold Higher. Existing AQA separate course tag requires a scope explanation of the Pearson Combined overlap, not a claim of uniform board scope.
- OpenStax titration/indicator chapter was read for lesson54. Do not claim a new lesson56 fetch yet. Its actual indicator figure was inspected previously; erroneous duplicated methyl-orange alternative text was rejected. Named indicator transition intervals are not a claim that every endpoint is exactly pH7.

## Actual Maths comparison

Read reading-scales.ts and the-mean.ts teaching/refresher material. Visited both lessons live on desktop 1440×1000 and mobile 390×844; all four captures inspected. Copy concise task-first sequencing, meaningful manipulation, fair-share reasoning and explanatory mistakes. Add the Chemistry prerequisite of selecting repeats. Keep the first meaningful 44px control entirely above y664 on mobile, rather than a large apparatus pushing the actual task below the fold.

## Should this lesson have a 3D asset?

Yes, a real macroscopic apparatus can teach scale direction, location of the meniscus and the relationship of stopcock, jet, flask and white tile. It must support the reading workbench rather than replacing it. The prior calculation lesson has an actual calibrated burette factory; inspect/reuse appropriate geometry, add a physically open flask and full assembly only after reviewing dimensions. The apparatus is not molecular solution imagery. Readable 2D numerical scales remain necessary because 1 cm³ schematic 3D ticks cannot claim 0.05 cm³ reading precision. Export must preserve actual reading metadata and volumetric geometry; inspect the downloaded GLB independently.

## Risks to check before release

Rough titre is explicitly a rough estimate, not automatically a first reading that must always be excluded. Readings separated by exactly the permitted difference must pass. A selected chain with endpoint span above the threshold must fail. No unique-subset assumption. Wrong funnel/air-bubble/contamination direction explanations must specify what is measured and what is actually delivered. Distilled water in a conical flask changes concentration but not moles of its existing measured aliquot. Water remaining in a pipette or burette dilutes the relevant measured solution. Endpoint overshoot increases delivered titre; reversal of titration orientation must be explicit. No general phenolphthalein colourless=neutral claim. Written rubrics, independent checks and delayed review need genuinely separate demands and conservative exposure aliases.

## Remaining work

Individually author records/tasks and apparatus, check science and marking, integrate after the preceding regression completes, run required checks, capture/inspect/send actual desktop/mobile/3D samples before researching lesson57. No exam-readiness or whole-course parity claim is justified.

## Integration and review findings

The first semantic type/lint/build pass and 410 unit checks passed. Adding strict saved-history transitions brought the suite to 413 passing checks in 7.5 seconds: selected readings toggle individually, method steps move by adjacent swaps, and switching records resets all predictions to that record's own canonical state. The first 20-case browser run passed 16 and exposed four layout failures: error/endpoint controls below the unchanged y664 threshold. Shortened redundant initial scenarios and headings preserve acid/alkali orientation, controlled aliquot, indicator and endpoint conditions. Check Model/Undo/Reset now precede the actual 3D apparatus; Undo/Reset use the existing text-button style rather than an undefined class. First guided hint is explicit. All three standalone 3D views were inspected after correcting framing and shortening the support arm so it does not penetrate the burette. Downloaded final GLB still needs independent binary inspection.
Actual AQA 2018 Higher QP26/MS28–29 and 2022 Higher QP24/MS27 were also visually inspected: supplied thresholds and selected-group means agree with the reading review above. The accidentally rendered 2022 QP25 is the subsequent concentration question, not the 08.2 repeat-selection source.

The second browser pass passed 18/20 in 38.5 seconds, including all mobile scenarios, but two desktop first-control positions remained 25.7px below the deliberately retained y664 assertion. Removed the duplicate model headings for error/endpoint modes: the main task heading already identifies these decisions, and their experimental scenarios stay visible above the controls. No viewport assertion was relaxed. Added targeted final-minus-initial recovery/reload coverage. The actual downloaded mobile GLB was independently parsed from raw POSITION bytes and world matrices: twelve mesh-bearing nodes, 51 calibration marks, selected 1.20/23.60 readings and 22.40 delivery, actual column depth 0.18, an open neck with inner/outer radii 0.155/0.19, jet above flask, flask in contact with white tile, all finite positions and no invented atomic particles.

## Final content refinement

All22 browser cases passed in43.0seconds with unchanged first-control assertions, plus four broader all-route/reflow cases in1.1minutes. Before sending samples, reviewed the remaining reading-skill gap: numerical subtraction alone does not teach fine burette divisions. Added an actual 0.10 cm³ zoomed scale with concave meniscus/0.05 midpoint estimate in the learning reference and separate static practice/cold/delayed stimuli. Practice reads6.35, reserved formB reads12.70, delayed formA reads8.25; no answer is printed as a diagram readout. Accessible descriptions supply the same relative tick position. The original49-task count remains: replaced redundant numeric subtraction items with these distinct reading demands. The first fine-scale patch stopped at an unmatched indentation assertion after only the reusable component/type/rendering changes; its check process was interrupted before building. Corrected the task edits against actual formatted source; no check result is claimed for the interrupted attempt.

## Final individual review and sample delivery

49 individually authored tasks: two warm-up, six refresher, five guided, twenty practice, two five-question reserved forms and two three-question delayed forms; fifteen numerical demands, twenty-eight choices and six self-reviewed written explanations. Five workbench modes use24 records; static fine-scale stimuli distinguish precise scale reading from subtraction and preserve accessible equivalent descriptions. All six original route IDs remain. Foundation/separate AQA baseline is explicit, with Pearson Combined salt-preparation overlap and separate Higher calculations explained.

Final formatting, types, lint and production build pass; all414 unit checks in7.3seconds, all24 lesson desktop/mobile browser cases in48.4seconds, and all8 broader contents/all-route/model-family/accessibility cases in1.1minutes. The Maths checkout remains unchanged. Final desktop/mobile reading, fine-scale practice, independent fine-scale, method sequence, repeat selection, error and endpoint samples were captured and inspected. Actual downloaded mobile GLB independently rechecked after final capture:12 mesh-bearing nodes,51 scale marks, proper open neck/jet clearance/tile contact,0.18 actual liquid-column depth and selected1.20/23.60/22.40 metadata. The samples and actual GLB are being explicitly sent before lesson57 research.

The next full948-case regression will cover both this lesson and the repaired generic pH checks from55. It is pending; do not claim the previous924-case run fully passed. Whole-course Maths parity, full board coverage, supervised practical competence and exam readiness remain open.

Primary materials actually read: AQA8462 specification4.4.2.5/RPA2 and the actual practical handbook; AQA June2018 Higher QP09.3/09.4 with MS, June2019 Foundation QP09.5 with MS, June2022 Higher QP08.2 with MS; Pearson Combined printed42 and separate Chemistry printed25. The actual source pages were inspected as recorded above. The0.10/0.05 fine divisions are explicit supplied diagram data, not a claim that every burette has the same scale.


Lesson56 full regression completed: all948 desktop/mobile browser cases passed in27.8minutes, including both repaired55 pH checks. Final414unit/24own/8broader cases and types/lint/format/build passed. Inspected samples and actualGLB were explicitly sent before57 research. Whole-course parity and exam readiness remain unfinished.
