# Isotopes and ions — individual lesson review

Status: the second individually rebuilt lesson. Scientific review is complete for its stated scope. The [official source review](official-atomic-structure-review.md) now records actual AQA specification and paired question/mark-scheme reading, plus a limited Pearson comparison. This is introductory particle/count coverage, not complete ionic-bonding coverage or exam readiness.

## Before building: the user's questions

**Is the material at Maths's standard?** The previous version was a generic atom sandbox with four short practice questions and two checks. It did not demonstrate isotope identity separately from ion formation. Maths's reviewed fraction and equation journeys tie model operations to the current question, fade help, reserve assessments and preserve work. This rebuild follows those principles and adds 32 original tasks, but it does not claim teacher acceptance or board coverage.

**How can the lesson be interesting and interactive?** Make students compare invariant and changed quantities. The isotope workbench permits neutron changes while locking protons and electrons. The ion workbench permits electron transfer while locking the nucleus. Before/after symbols and particle counts show why one operation changes mass number while the other changes charge.

**What assets can be built?** Reuse the verified original 3D atom meshes to inspect the current nucleus and electron count, paired with original before/after nuclear-symbol cards, count comparisons and a mass/charge ledger. Rotation, nucleus focus, 2D fallback and GLB export are retained. No external artwork was copied. A second large 3D viewer would add visual bulk without clarifying the invariant counts, so the baseline remains a compact symbolic comparison.

**What differs from other lessons?** Inside an atom establishes particle locations, counts and neutrality. Here, students must discriminate two different causes of change and infer missing electron counts from signed ion charge. Chemical-property reasoning and correction of an incorrect ion-formation mechanism need written/conceptual tasks, not only sums.

**Is a generic template appropriate?** The reviewed task/answer layout and staged journey are reusable. The unrestricted atom sandbox is unsuitable here: fixed quantities must be visible and enforced. The first isotope task and first ion task open with a hint; later tasks in each concept fade support. Practice starts without a model. The single route keeps these two introductory concepts together, but detailed shell arrangements, ionic bonding, abundance-weighted relative mass and nuclear decay remain separate outcomes.

## Actual material read

1. OpenStax **Chemistry 2e, 2.3 Atomic Structure and Symbolism**: the proton-number definition, neutrality/charge equations, ion gain/loss examples, isotope discussion, nuclear notation, worked particle composition and build/count exercises. Read from the publisher's repository at `db0a8e6027100ce082e67fc8879faab86f9a58a7`: [exact chapter](https://github.com/openstax/osbooks-chemistry-bundle/blob/db0a8e6027100ce082e67fc8879faab86f9a58a7/modules/m68692/index.cnxml).
2. **ExpertGuidanceGCSE Atomic Structure revision notes**, six pages, from its public GCSE Science Revision repository at `0274f9fb26223b6034ca4706839d81e2b403501b`: [actual teaching PDF](https://github.com/ExpertGuidanceGCSE/GCSE-Science-Revision/blob/0274f9fb26223b6034ca4706839d81e2b403501b/Physics/Atomic-Structur-Revision-Notes.pdf). Read its particle table, atomic/mass numbers, carbon isotope example, chemical-property explanation, sodium electron-loss example and misconception discussion. The pack is labelled AQA GCSE Physics and is a third-party resource; it is not an awarding-body Chemistry specification, official paper or official mark scheme. Its third-shell shorthand and historical-model content were not imported into this lesson. Original questions and feedback were authored independently.

Research also inspected public candidate specification/paper repositories. A claimed specification JSON project explicitly disclosed LLM generation and contained no specification data; a claimed GCSE paper repository was empty; other apps contained authored summaries or links to the still-blocked official sites. None was accepted as an official specification or mark scheme.

## Scientific review, task by task

Use p = Z, n = A − Z, and charge = p − e. Thus e = Z − charge, including a negative charge. Isotopes retain proton number and differ in neutron number. Comparisons here are between neutral atoms, so their electron arrangements also match. Ordinary ion formation changes electrons, not nuclear particles. Electron loss preserves mass number; it does not claim the ion's exact physical mass is unchanged.

| Task          | Reviewed result or reasoning                                    | Purpose                                             |
| ------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| w-element     | p8/n8 and p8/n10 are both oxygen                                | Retrieve element identity independently of neutrons |
| w-charge      | 10 − 10 = 0                                                     | Signed-charge prerequisite                          |
| w-neutrons    | C-13: 13 − 6 = 7                                                | Isotope-count prerequisite                          |
| r-neutrons    | B-11: p5/n6/e5                                                  | Repair mass-number counting                         |
| r-positive    | Li loses one electron: 3 − 2 = +1                               | Repair the sign after electron loss                 |
| r-negative    | F gains one electron: 9 − 10 = −1                               | Repair the sign after gain                          |
| g-carbon      | C-12/C-13 share p6; n6/n7 differ                                | Controlled isotope comparison                       |
| g-chlorine    | Cl-37: n20; two is only the increase from Cl-35                 | Distinguish total and changed quantities            |
| g-sodium      | Na-23 loses one electron: p11/n12/e10, +1                       | Separate ion formation from nucleus change          |
| g-chloride    | Cl-35 gains one electron: p17/n18/e18, −1                       | Contrast gain with loss                             |
| p-pair        | p12/n12 and p12/n13 are different isotopes                      | Apply both conditions of the definition             |
| p-silicon     | Si-30: n = 30 − 14 = 16                                         | Transfer nuclear counting                           |
| p-magnesium   | p12/e10: +2                                                     | Multiply charged positive ion                       |
| p-sulfide     | p16/e18: −2                                                     | Negative charge and subtraction order               |
| p-inverse     | Na+ symbol: e = 11 − 1 = 10                                     | Inverse charged-symbol reading                      |
| p-table       | Mg-24 2+: p12/n12/e10                                           | Three separately entered counts                     |
| p-chemistry   | Neutral Cl isotopes have the same electron arrangement          | Causal chemical-property reasoning                  |
| p-explanation | Proton gain changes element; electron loss forms a positive ion | Written mechanism correction, self-review only      |
| ca-pair       | Neutral p8/n8 and p8/n9: different oxygen isotopes              | Reserved classification                             |
| ca-electrons  | Ca2+: e18                                                       | Reserved inverse charge calculation                 |
| ca-table      | Cl-37 −: p17/n20/e18                                            | Reserved negative charged-symbol table              |
| ca-gain       | Electron gain creates a negative ion                            | Reserved mechanism discrimination                   |
| cb-pair       | Neutral p11/n12 and p11/n13: different sodium isotopes          | Alternate classification                            |
| cb-electrons  | K+: e18                                                         | Alternate inverse calculation                       |
| cb-table      | Al-27 3+: p13/n14/e10                                           | Alternate positive charged-symbol table             |
| cb-loss       | Electron loss leaves more protons than electrons                | Alternate causal explanation                        |
| ra-neutrons   | N-15: n8                                                        | Delayed nuclear-count retrieval                     |
| ra-electrons  | p12, +2: e10                                                    | Delayed inverse ion reasoning                       |
| ra-chemistry  | Same neutral isotope electron arrangement                       | Delayed causal property reasoning                   |
| rb-neutrons   | S-34: n18                                                       | Alternate delayed nuclear calculation               |
| rb-electrons  | O2−: e = 8 − (−2) = 10                                          | Delayed negative-charge inverse reasoning           |
| rb-element    | A proton-number change changes the element                      | Delayed distinction from ordinary ion formation     |

## After building: the user's questions

**Did I make mistakes?** The review distinguishes total neutron count from the isotope-to-isotope difference, treats electron charge as negative, excludes electrons from mass number and avoids describing isotope comparison as a chemical reaction. Positive and negative charged symbols label the ion correctly. Written keywords are not automatically marked correct. Model history validation rejects a nucleus change in the ion model or electron change in the isotope model. Verification results and visual refinements are recorded below after execution.

**Does anything differ from exam-board requirements?** AQA 4.1.1.5 requires isotope and atom/ion counting; these are addressed by the reviewed tasks. AQA 4.2.1.2 also requires ionic transfer diagrams, resulting noble-gas arrangements and bonding outcomes that this introductory lesson does not finish. Actual questions and schemes confirm isotope distinction and require later ion/atom arrangement comparison. Relative atomic mass from abundance, detailed ionic bonding and complete atomic scale/history need separate lessons; shell arrangements now have their own journey. Pearson's wording has a limited comparison and OCR remains unverified. The complete course must map every applicable requirement. The third-party pack is not official marking guidance.

**Would a student find it useful?** The learner can see why neutron changes preserve the element, why electron transfer preserves the nucleus and why the sign follows p − e. Practice includes error correction, inverse reasoning and symbols, with recovery after mistakes. That is a reasoned design assessment; learner/teacher acceptance has not been measured. Written answers still need self-review or external feedback.

## UI comparison and improvements

Maths uses one focused task card, the model and answer beside each other on desktop, nearby gold hints, a clear numbered stage strip and mobile task navigation after the answer. This lesson uses that layout. Its before/after cards replace an undirected slider panel. Outcomes and scope are now lesson-specific; the nested active-topic lesson map is available beyond the first sample. The rest of the app still contains preliminary lesson layouts, so this is not a claim of whole-app visual parity.

## Current limits and next gate

The complete app is not yet at Maths's standard. Three of 62 routes now have individually authored journeys. Selected official AQA specifications, questions and schemes have been reviewed for the stated particle/count scope, with remaining section-level gaps explicitly recorded. Full coverage, other-board acceptance, teacher/learner review and exam readiness remain unfinished. Actual source requests succeeded despite stale environment-status metadata; the old network blocker is not used to pause this work.

## Executed verification and visual review

Final type checking, lint and production build passed. The unit suite executed 24 tests and the full browser suite executed 86 tests across desktop and mobile, all passing. The 12 new browser checks exercise the two transformation types, wrong charge direction and recovery, undo/reset/reload, charged symbols, all practice formats, written self-review, locked deferred checks, retained exposure and seven-day separate review forms. Automated accessibility and reflow checks passed at representative stages. Existing storage failure/corruption/conflict checks remain passing.

The first new browser run caught a display mismatch between ASCII minus in model feedback and the mathematical minus in nuclear notation. It was corrected in the feedback, comparison cards and ledger; the failing assertion was retained and passes. The model boundary now also states that not every count the controls permit is a stable isotope or common ion.

Inspected desktop and mobile screenshots show the first particle operation within the tested initial viewport, compact before/current symbol cards, a functioning 3D scene and nearby answer feedback on desktop. Mobile keeps the meaningful particle control before the larger asset and places task navigation after the response. Charged-symbol practice uses an independent multipart answer card without a default model. These were compared with the previously inspected Maths task/answer and mobile layouts. The long mobile model still requires scrolling to its model check and answer; it is not claimed to have been learner-tested.

Review artifacts: `docs/qa/isotopes-and-ions-{desktop,mobile}-{isotopes,positive-ion,negative-ion,charged-symbol}.png`. Screenshots were sent before another lesson was built. No claim of full exam preparation follows from this verification.
