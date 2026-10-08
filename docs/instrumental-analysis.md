# Instrumental analysis — lesson 83 individual review

## Problem and resulting behaviour

The preliminary route contained six mostly verbal selections about identification, sensitivity, calibration, blanks and costs. It had no actual reference-spectrum comparison, mixture interpretation or concentration plot. Its individually authored journey now has **73 tasks**: four warm-up, eleven targeted refreshers, ten guided, twenty-four practice, two eight-question independent forms and two four-question delayed forms. Nine written responses are explicitly self-reviewed, without automatic examiner marks. The visible learning counter tracks guided/practice attempts separately; it is not the total task or lesson count.

Five native modes use 21 immutable original records: emission sequence, spectrum interpretation, calibration, method quality and advantage comparison. A wrong selected ion set remains separate from the original unknown. Combined reference positions appear in a separate proposal row; choosing an incorrect ion does not rewrite evidence. A shared partial position leaves identification unresolved. Concentration markers can be placed with pointer input, typed, or moved with keyboard-accessible 0.5 mg/dm³ buttons. Out-of-scale and malformed numeric entries are retained, not clamped to a correct value. Undo, scoped clear, reload and foreign-record validation use the existing conservative progress system.

## Actual online source reading

Fresh request records and downloaded PDFs/text/rendered pages are preserved in `/workspace/lesson-drafts/instrumental-analysis/sources`.

| Actual source | Selected material read | Consequence |
| --- | --- | --- |
| [AQA Chemistry 8462 specification](https://filestore.aqa.org.uk/resources/chemistry/specifications/AQA-8462-SP-2016.PDF) | Printed 75, 4.8.3.6–7; text and actual rendered page personally inspected | Separate Chemistry, both tiers. Accurate/sensitive/rapid; solution sample in flame; emitted light through a spectroscope; line output identifies metal ions and measures concentrations. Interpret supplied chart/table results with references in the same form. |
| [2023 Foundation Paper 2](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-84622F-QP-JUN23.PDF) and [paired scheme](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-84622F-MS-JUN23.PDF) | Q10.2–3, printed 41; scheme 25–26 | Name flame emission spectroscopy and give one advantage. This is shared with Higher Q03.2–3, not a second independent example. |
| [2023 Higher Paper 2](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-84622H-QP-JUN23.PDF) and [paired scheme](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-84622H-MS-JUN23.PDF) | Q03.2–3, printed 13; scheme 11–12. Question page and advantage scheme page personally inspected as images as well as text. | The actual scheme accepts more accurate, more sensitive, faster, measuring concentration and a suitable smaller-sample advantage. One valid concise advantage satisfies the original state-one demand; do not invent a required lengthy explanation. |
| [Higher specimen Paper 2](https://filestore.aqa.org.uk/resources/chemistry/AQA-84622H-SQP.PDF) and [paired scheme](https://filestore.aqa.org.uk/resources/chemistry/AQA-84622H-SMS.PDF) | Q07.5–6, printed 21; scheme printed 18. Actual spectrum figure and scheme personally inspected. | Identify calcium/sodium from supplied aligned references; explain different flame colours mixing or one masking the other. The figure supplies five references with a common horizontal alignment and no numerical wavelength axis. The scheme page header says Paper 1H despite the official 84622H-SMS URL; content, numbering and answers pair with the inspected Paper 2 figure. Record that header inconsistency rather than silently changing it. |

Selected 2022 files were freshly downloaded, but targeted searches found no instrumental question used here. Guessed 2019 URLs returned 404. A fresh Chemguide flame-page request returned proxy 403; its content was not read. These failures do not block the actual successful AQA source reading. No claim is made to have read NIST wavelength standards, an examiner report or a full set of all boards' requirements.

## Questions asked before designing this lesson

- What does the concept require the student to do? Compare reference positions, combine mixture patterns, preserve uncertainty, distinguish identity from quantity, and use supplied measurement evidence.
- Which Maths behaviour is relevant? Wrong markers and plotted points remain visible; scales and units are explicit; keyboard/touch controls, undo, clear and targeted explanations support repair.
- Which visual asset helps? Same-scale two-dimensional spectra and labelled calibration plots. Extruding their lines into 3D would add no useful chemical evidence. The neighbouring Testing ions lesson already supplies a verified 3D apparatus model; this lesson exports its actual vector comparisons instead.
- What must be independently assessed? New mixture demands and supplied concentration datasets without a working model or feedback before whole-set submission. Required reference data remain available; those data are not assistance.
- What must not become a GCSE requirement? Quantum calculations, memorised real wavelengths, IR/MS/NMR mechanisms, internal spectroscope optics or unsupported universal linear calibrations.
- What could produce false confidence? A shared line treated as unique, counting lines as ions, brightness alone treated as identity, concentration from an ion name, unsupported extrapolation, or completion treated as exam readiness.

## Actual Maths comparison

Read neighbouring `line-graphs.ts`, `coordinates-on-scaled-grids.ts`, `NumberLinePlacement.tsx`, `GridPointsAnswer.tsx` and `ScaledGridSvg.tsx`. Four fresh live desktop/mobile screenshots were captured and personally inspected. The wrong tick representing 16 for target 14 stays selected; the wrong P(0,0) stays plotted on a half-unit grid. Their feedback explains scale and coordinate reasoning. Evidence and screenshots are in the private draft's `qa/maths-reference` folder. The Maths repository was not edited.

## Scientific and content audit

Every authored task's answer, supplied values, hint, distractors and feedback were reviewed while authoring this single journey. The following contracts make the review concrete:

- Reference patterns are original schematic display positions: lithium 1/4/10; sodium 2/6/9; potassium 3/6/11; calcium 1/5/8; copper(II) 4/7/12. The app explicitly says these are not real wavelengths to memorise. All chart/table rows share the same scale.
- Sodium/calcium combines to 1/2/5/6/8/9. Lithium/copper overlaps at 4 and combines to 1/4/7/10/12. All three reference lines are detectable only because the supplied single/two-ion tasks state those conditions. Partial position 6 leaves sodium/potassium unresolved; partial position 1 leaves lithium/calcium unresolved. Unmeasured positions are not absence evidence.
- Independent and delayed pairs are individually specified: Li/K, K/Ca, Na/Cu, K/Cu, Ca/Cu, Li/Ca and Na/K. Their literal position unions are independently checked. Identifying the supplied ion set does not prove absence of every other substance or establish purity.
- Ten numerical references independently interpolate the supplied standards: 4, 4, 3, 3, 2.5, 5, 5, 6, 3 and 4 mg/dm³. Every calibration retains a non-zero zero-concentration response, labelled arbitrary response units, concentration units and its own matched ion/conditions. Lines joining standards represent the relationship specifically supplied for that teaching record; they are not a universal physical claim. Original graph-reading answers allow ±0.05 mg/dm³; this is app marking, not an official mark-scheme tolerance.
- Blank/background, changed settings, outside-range evidence and disagreement of repeats are distinct data applications. A blank is not a complete set of standards or proof of one particular contaminant. Changed flame/gain requires comparable standards. Response 85 lies outside supplied 5–65 responses; no exact extrapolated concentration is established. Repeat disagreement concerns precision, not accuracy without an accepted value.
- Detection at 0.01 rather than 1 mg/dm³ supports sensitivity. Results 10.1 versus 11.8 compared with accepted 10.0 support greater accuracy for that result. Twenty seconds versus four minutes supports speed, not sensitivity/accuracy. No comparison makes an instrument infallible.
- Written mixture explanations connect different colours to mixing/masking. One-advantage responses require one valid concise statement. Concentration plans specify known same-ion standards, matched conditions, background/range and the identity-versus-response distinction. Their explicit criteria support honest self-review.

Each of the 24 practice items has an individually chosen recovery destination. Accuracy and speed have their own refreshers rather than an unrelated generic detection-limit activity. Exact repeated patterns and numerical demands, simple repeated principles, all six legacy question identities and the previous ion lesson's masking demands are linked directly through global exposure. New spectrum unions and new calibration datasets are not indiscriminately equated with every item in the supplied reference bank.

## Verification and visual review

Initial full-unit run: 761 passed and four failed. Two failures caught a real missing concentration-field feedback label; the others were harness mistakes (nine written items, not ten; progress decode returns a record/null, not an `ok` wrapper). The first build caught a displaced client directive. These were corrected. The corrected full suite passed **765 checks in 41.4 seconds**. Thirteen subsequent affected unit checks passed in 2.2 seconds after the later opening/marking refinements.

First native browser run: 22 passed, four failed. Two failures were the genuine 320-pixel opening control below the viewport; two used the wrong storage-warning text. Shortening the opening task/record preserved fonts and 44-pixel controls; the harness now verifies the actual warning and unchanged raw storage. Native runs subsequently passed all **26 desktop/mobile cases**, including all 24 actual practice responses, both eight-question independent forms and both delayed four-question forms, honest written criteria, five-mode wrong histories, clear/undo/reload, malformed input, source substitution, direct recovery, pointer/keyboard operations, actual downloads, axe and reflow.

The broader affected suite passed **12 checks in 1.3 minutes**, including all 95 routes on both device sizes, blocked/corrupt storage, stale/simultaneous tab writers and immediate recovery while the commit lock is held. This is not a new complete whole-course browser regression.

Manual screenshot review caught spectrum labels disappearing during horizontal panning, then edge-clipped first positions and residual clipped label text. Labels now remain in a fixed column while the readable plot pans, with explicit swipe/keyboard guidance and a complete table alternative. Plot viewport margins preserve the first/last line strokes. Export expands the actual source SVG viewport to include its existing labels, with standalone dimensions; original observations and the student's actual wrong proposal remain separate. The final affected checks and screenshot gate are recorded below after completion.

Four actual downloaded SVGs are independently parsed from disk, not reconstructed from application helpers: desktop/mobile wrong mixture and concentration comparisons. The audit verifies all literal reference/original/proposed positions on their shared scale, finite coordinates, included row labels, standards and non-zero blank, actual 3.5 marker at response 45, units and absence of expected-answer/feedback metadata.

## Limits

Selected-source review and passing software checks do not establish full-board coverage, learner acceptance or exam readiness. Calibration-quality applications are original supporting tasks, not an assertion that every exam asks each extension. Written responses are self-reviewed. Supervised practical competence still requires qualified school practical work. Whole-course statement mapping, gap correction and final complete regression remain open; the course must not be described as finished or sufficient for all exam preparation yet.

## Final sample gate

Final types (`types-final-labels`), lint (`lint-final-labels`), and production build (`build-final-labels`) passed. The complete native suite passed 26 cases in 59.6 seconds before the last row-label placement refinement; eight final affected spectrum, partial-record, export, geometry and all-practice cases then passed in 28.0 seconds. Geometry assertions check both line-stroke margins and source label extents, while fixed row labels remain visible after panning. The final four actual SVG audit passes. Final representative native, mixture chart/table, calibration, written and independent/submitted samples were personally inspected on desktop/mobile and explicitly linked to the user before any lesson 84 research. Status is now 95 routes / 83 individually reviewed and delivered / 12 preliminary.
