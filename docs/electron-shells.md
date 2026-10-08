# Electron shells — individual lesson review

Third individually authored journey: 34 original tasks. Working baseline: AQA Chemistry 4.1.1.7 and corresponding Trilogy 5.1.1.7; introductory position reasoning also draws on 4.1.2.1/4.1.2.4. Pearson 1.19/1.20 has been compared. Read sources and exam decisions are recorded in [the official review](official-atomic-structure-review.md). OCR and full-course alignment remain unverified.

## Before building: the user's questions

**Is the material at Maths's standard?** The previous lesson provided an auto-filled atom graphic and six short questions. A student could obtain a picture without deciding where any electron belonged. The new sequence follows the inspected Maths journeys' task-specific construction, recovery, faded support, independent work and reserved retrieval. That establishes concrete design improvements; it does not establish whole-app parity or student acceptance.

**How can this lesson be interesting and interactive?** Give students an electron budget and let them decide where to place it. Distinguish a missing electron from a correct total in the wrong shells. A deliberately incorrect fluorine construction forces removal and replacement while conserving the total. Sodium and potassium introduce shell boundaries with fewer operations after the rule has been practised.

**What assets can be built?** Original count-preserving SVG shell diagrams, a live independent answer diagram, and an optional actual 3D construction. The 3D scene receives the student's distribution rather than automatically correcting it. Export preserves the chosen shell counts, including a wrong distribution. The exam-oriented 2D diagram is the default because reading and constructing its representation is an explicit assessment demand; spatial inspection remains available.

**What makes its needs different?** Counting nine electrons is insufficient if they are placed 1,8. Students must reason about energy-level order, convert diagrams and numbers in both directions, recognise helium's full two-electron shell, handle the nineteenth/twentieth electrons and separate outer count from occupied-shell count. These require a placement model and an arrangement parser, not the previous unrestricted particle counter.

**Is the generic layout suitable?** Reuse the reviewed one-task layout, stage navigation and nearby answer/hint area. Put the electron bank, shell controls and model check before the diagram so the meaningful action and recovery are reachable on mobile. Independent practice initially hides support. A constructed answer diagram follows the student's input without marking it or filling the correct counts.

## Scope and notation decisions

For neutral ground-state atoms 1–20, the simplified pattern is 2,8,8,2. The third shell is not universally limited to eight electrons; this lesson excludes subshell and transition-metal arrangements. Comma and dot separators are both accepted; a trailing empty shell does not change an arrangement. Negative counts, units, exponent/fraction syntax and more than four counts are rejected as notation input. The nucleus remains schematic and magnified.

GCSE Groups 1–7 use outer-electron counts; Group 0 has a full outer shell. Modern labels 13–17 correspond to GCSE Groups 3–7, and Group 18 to Group 0. Questions explicitly ask for the GCSE convention when needed. Period is the number of occupied shells, not empty guide rings. Helium has one full occupied shell containing two electrons.

## Task-by-task scientific and teaching review

| ID suffix     | Reviewed reasoning                                        | Purpose                                                        |
| ------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| w-neutral     | Neutral F: 9 electrons                                    | Retrieve neutrality before placement                           |
| w-read        | Diagram 2,3 has 5 electrons                               | Count an original diagram                                      |
| w-order       | Lowest available level first                              | Retrieve the distribution rule                                 |
| r-count       | Be: 2,2                                                   | Repair electron budget and construction                        |
| r-fill        | Li: move 1,2 to 2,1                                       | Repair a right total in wrong shells                           |
| r-position    | Mg 2,8,2: Group 2, period 3                               | Repair group/period confusion                                  |
| g-oxygen      | O: 2,6                                                    | Link deliberate placement and notation                         |
| g-sodium      | Na: 2,8,1                                                 | Cross the third-shell boundary with faded support              |
| g-fluorine    | F: correct 1,8 to 2,7                                     | Require conservation and redistribution                        |
| g-potassium   | K: 2,8,8,1                                                | Start the fourth shell with a bounded rule                     |
| p-helium      | He: 2, full first shell                                   | Handle the noble-gas exception                                 |
| p-hydrogen    | H: 1                                                      | Construct the simplest atom independently                      |
| p-carbon      | C: 2,4                                                    | Construct numbers and a diagram without default support        |
| p-sulfur      | S diagram: 2,8,6                                          | Read three-shell representation                                |
| p-aluminium   | Al 2,8,3: GCSE Group 3                                    | Separate total/modern label from requested convention          |
| p-calcium     | Ca: 2,8,8,2                                               | Construct the model's upper boundary                           |
| p-nitrogen    | Proposed 2,4,1 is wrong; ground state 2,5                 | Apply energy order despite a correct total                     |
| p-neon        | Ne 2,8: full outer shell; does not readily transfer/share | Link arrangement and chemistry                                 |
| p-phosphorus  | Diagram 2,8,5 implies neutral Z15                         | Invert diagram counts and neutrality                           |
| p-explanation | B 2,3: period 2, GCSE Group 3                             | Written mechanism correction, self-reviewed                    |
| ca-beryllium  | Z4: 2,2 and diagram                                       | Reserved construction; aliases the identical refresher demand  |
| ca-chlorine   | Diagram: 2,8,7                                            | Reserved diagram reading                                       |
| ca-magnesium  | Diagram: Group 2, period 3                                | Reserved two-part position inference                           |
| ca-argon      | Full outer shell linked to electron transfer/sharing      | Reserved causal explanation                                    |
| cb-lithium    | Neutral p3: 2,1 and diagram                               | Alternate construction from neutrality                         |
| cb-silicon    | Diagram: 2,8,4                                            | Alternate representation conversion                            |
| cb-sodium     | Diagram: Group 1, period 3                                | Alternate two-part position inference                          |
| cb-calcium    | Diagram 2,8,8,2 implies Z20                               | Alternate inverse reasoning                                    |
| ra-hydrogen   | Neutral p1: 1                                             | Delayed construction; aliases identical practice demand        |
| ra-oxygen     | Diagram 2,6 implies Z8                                    | Delayed inverse reasoning                                      |
| ra-argon      | Three occupied shells: period 3                           | Delayed period reasoning                                       |
| rb-helium     | Neutral p2: 2                                             | Delayed helium construction; aliases identical practice demand |
| rb-sodium     | Diagram 2,8,1 implies Z11                                 | Alternate delayed inverse reasoning                            |
| rb-phosphorus | Diagram: Group 5, period 3                                | Alternate delayed position reasoning                           |

All 20 elements occur in reviewed examples/tasks across the journey. This is a finite task set, not exhaustive independent assessment of every arrangement or every periodic-table outcome. Equivalent construction demands share exposure aliases where identified; restarting does not make them fresh evidence.

## After building: the user's questions

**Have I made mistakes?** The science review checks every target against independent first-20 reference arrangements, fixes the scope of the third-shell shortcut, includes helium and excludes empty rings from period. Incorrect entered counts remain incorrect in both the SVG and 3D scene; a beautiful corrected asset must not conceal a wrong response. Electron budget and placement order have separate feedback. Verification and visual results will be recorded after execution.

**Does it differ from exam requirements?** The intended diagram/numerical and lower-level-first outcomes are grounded in the specifications actually read. The AQA Foundation diagram marking demand informed placement rather than auto-filling. This lesson does not finish ionic dot-and-cross diagrams, unfamiliar-element reaction predictions, atomic history/scale or isotope-abundance calculations. Those require separate reviewed lessons. Written explanations remain self-reviewed and are not official exam marks.

**Would it be useful to a student?** It gives a concrete way to see why the right total can still produce a wrong diagram, then practise without default support and retrieve later. It also prevents common helium and group/period errors. These are design reasons for usefulness, not results of learner or teacher testing.

## UI and whole-app review

The actual desktop/mobile rendering must be compared with the inspected Maths layout, including the initial useful-control viewport and recovery position. The placement controls and bank are specific to this lesson; sharing typography and the task shell does not mean sharing an undirected model. Screenshots must be sent before building another lesson.

The whole app remains below the target: three of 62 existing routes have individually authored journeys, and official research has identified missing outcomes outside them. Passing software checks is necessary but does not establish exam readiness. The next work must follow this lesson's screenshot/review gate, then address the remaining individual lessons and actual specification gaps.

## Executed verification and screenshot gate

Final type checking, lint, formatting and production build passed. Unit suite: **29 passed**. Full browser suite: **100 passed**, fifty desktop and fifty mobile Chromium checks. Fourteen new browser checks cover placement and keyboard operation, missing versus misplaced counts, reset/reload/undo, fourth-shell construction, actual 3D placement/export, failed WebGL fallback, all ten practice formats, uncorrected answer diagrams, written self-review, deferred locked assessments, repeated exposure, seven-day retrieval, automated accessibility and reflow. Existing corrupt/blocked storage and cross-tab checks remain passing.

The first full browser run found the opening's mobile control below the viewport and a test reading an incorrect storage field. The opening now starts with an empty oxygen diagram and a shorter title/instruction; its first useful add operation is at 647.34 CSS pixels in the tested 664-pixel viewport. The original all-route viewport assertion and an explicit first-useful-placement assertion pass. Written-answer verification reads the existing attempts history and confirms no automatic correctness; the storage format was not changed to satisfy the test.

The exported wrong fluorine construction was independently parsed as binary glTF: its metadata retains 1,8,0,0 and its shell groups contain one and eight electron meshes. Repair changes both the SVG and real 3D scene to 2,7,0,0. The asset does not silently substitute a correct arrangement. A fourth-shell camera margin avoids cropping the construction.

Final construction, 3D repair and independent-diagram screenshots were captured on desktop/mobile and inspected under `docs/qa/electron-shells-*`. The mobile opening screenshot records the actual first viewport. Typography, task card, stage strip, hint/answer placement and mobile task navigation were compared with the previously inspected Maths layouts. Desktop/model content remains longer than a short arithmetic task; mobile puts placement and model checking before the larger diagram. Screenshots were sent before starting the next lesson. These are software and visual observations, not learner acceptance or exam-readiness evidence.
