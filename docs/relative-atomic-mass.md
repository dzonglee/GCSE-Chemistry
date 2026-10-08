# Relative atomic mass — individual lesson review

## Decisions before implementation

**Maths standard?** The actual Maths mean and frequency-table sources were read. They distinguish totalling values, total frequency and dividing to obtain a mean, and use models for guided learning rather than supply a formula alone. Chemistry needs an isotope population with unequal weights, not the old particle-count sandbox or a bare two-number mean.

**Interesting/interactive?** A keyboard/touch abundance slider changes one isotope percentage; the other remains its complement to 100%. Isotope masses remain fixed. The stacked bar shows abundance, the number-line marker shows the mean moving toward the more abundant isotope, and the contribution table explains why. The next guided task reverses abundance without changing masses, then transfers to a different pair.

**Assets?** Original SVG abundance bar and weighted-mean marker, a live contribution table and independently supplied isotope tables. A 3D nucleus would not make population weighting clearer. The existing real 3D asset remains relevant to earlier particle-count lessons.

**Distinct lesson demands?** Weighted average versus equal average, mass number versus population average, missing abundance, count frequencies, three isotopes, decimal abundances, final rounding, units and checking the result's range. Relative formula mass is a separate later lesson.

**Template?** Same Maths-derived card/stage layout, with an abundance slider before the large asset. Practice removes the model. Tables remain as question data without computed totals or answers. Rounding instructions and input feedback preserve required trailing zeros. Written reasoning uses self-review marking points.

## Actual research

- [AQA Chemistry specification](https://filestore.aqa.org.uk/resources/chemistry/specifications/AQA-8462-SP-2016.PDF), 4.1.1.6, and corresponding introductory Trilogy scope: averages account for isotope abundance and must be calculable from percentages.
- [Pearson Chemistry specification](https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-chemistry-spec.pdf), March 2024, 1.11–1.12: non-whole relative atomic masses explained by isotopes; calculation from relative isotope masses and abundances.
- [AQA June 2022 Foundation paper](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621F-QP-JUN22.PDF) and [scheme](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621F-MS-JUN22.PDF), 01.3: supplied equation, percentage table, unrounded weighted calculation and three significant figures. Actual scheme awards working, unrounded result and final rounding, with stated error-carried-forward allowances.
- [AQA June 2023 Foundation paper](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-84621F-QP-JUN23.PDF)/[scheme](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-84621F-MS-JUN23.PDF), 09.5, and [Higher paper](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-84621H-QP-JUN23.PDF)/[scheme](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-84621H-MS-JUN23.PDF), 01.5: actual common calculation with decimal abundances and one decimal place, without the earlier supplied equation.
- [OpenStax Atomic Structure and Symbolism](https://github.com/openstax/osbooks-chemistry-bundle/blob/db0a8e6027100ce082e67fc8879faab86f9a58a7/modules/m68692/index.cnxml): publisher paragraphs on the weighted isotope average, individual atom versus average, carbon-12 reference, percentage/fraction weighting, three-isotope data and sample variation. Advanced mass spectrometry and inverse natural-abundance algebra were not imported as core requirements.
- Neighbouring Maths: `src/content/course/the-mean.ts` and `frequency-tables.ts`, actually read. Their source remains unchanged.

Questions and assets are original. Supplied examples are not asserted exact natural compositions. Mass numbers approximate the relative isotope masses for these GCSE-style calculations; the textbook's precise measured isotope masses differ slightly.

## Individual task audit

Each prompt, value, answer, hint, misconception, diagram and explanation was reviewed.

| Stage         | Reviewed demands and answers                                                                                                                                                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Warm-up (3)   | Isotopes differ in neutrons; complementary abundance 25%; equal-frequency mean 12.                                                                                                                                                                                         |
| Refresher (7) | 31.042 → 31.0 to 3 s.f.; majority pulls mean toward its mass; missing abundance 65%; contribution 22 × 40 = 880; 36.584 → 36.6; average is not fractional neutron; relative mass has no unit.                                                                              |
| Guided (3)    | 35/37 at 75/25 gives 35.5; reversing weights gives 36.5; 63/65 at 40/60 gives 64.2.                                                                                                                                                                                        |
| Practice (10) | Two isotopes 20.4; missing percentage 35.8; ten atom counts 14.3; three-isotope table 24.4; 63.634 → 63.6; 24.01 → 24.0; written fractional-neutron correction; carbon-12 ratio/unit explanation; visible contributions 4860/560 and mean 54.2; reject mean outside 10–11. |
| Check A (4)   | 10.7; three isotopes 16.35; 58.532 → 58.5; non-integer average explained.                                                                                                                                                                                                  |
| Check B (4)   | Missing abundance gives 28.3; twelve-atom frequencies give 40.5; 12.04 → 12.0; majority/range plausibility.                                                                                                                                                                |
| Review A (3)  | 20.7; 47.286 → 47.3; weighted dimensionless ratio.                                                                                                                                                                                                                         |
| Review B (3)  | Three isotopes 24.5; twenty atom counts 54.4; average does not change individual mass number.                                                                                                                                                                              |

## Questions after implementation

**Mistakes?** Unweighted averaging, forgetting the divisor, treating counts as percentages, dropping a third isotope, premature rounding and fractional-neutron reasoning each receive specific repair. Significant figures have a separate refresher from decimal places. Tables and model means are checked against independently calculated values. The model's state permits only supplied abundance steps and preserves isotope masses.

**Exam gaps?** The original questions address the reviewed calculation/explanation demand. App checks use final correctness and do not claim the official paper's three-mark or error-carried-forward scoring. Written marking points are self-reviewed. Decimal-format enforcement is an app exercise instruction for demonstrating precision; it is not asserted to reproduce every examiner acceptance rule. Actual mass spectrometry, isotope-abundance measurement and full mock-paper marking are outside this lesson.

**Useful for learners?** Reversing abundance makes the difference between mass and frequency visible. Contribution working, independent cold tables, count-based transfer and checking the weighted mean's range support understanding beyond formula recall. No measured learner-effectiveness or exam-readiness claim follows from software tests.

Types, lint, formatting, build and 43 unit checks passed. The full browser baseline passed 128 desktop/mobile checks. After shortening redundant table headings and correcting precision wording, all 10 lesson-specific desktop/mobile checks passed again. The first targeted run had two trace-output failures because concurrent unit tests cleared the shared output directory; separate browser/unit output directories corrected the runner issue, with no assertion disabled. Actual desktop/mobile mixture and table-rounding screenshots were inspected and sent before proceeding.
