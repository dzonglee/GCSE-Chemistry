# Atomic size and scale — individual lesson review

## Questions before implementation

**At the Maths standard?** The actual Maths standard-form lesson was read: it checks powers/scaling prerequisites, uses a place-value board, separates coefficient and power answers, then removes support for practice. Chemistry needs that numerical demand plus units, radius/diameter and the limitations of its magnified atom assets. A statement that atoms are small is insufficient.

**Interesting and interactive?** The first model exposes the student's proposed nano exponent and resulting metre value. The second enlarges an atom radius to 1, 10 or 100 m while preserving a supplied atom:nucleus radius ratio. Students must convert the resulting nucleus length to millimetres and transfer to other supplied ratios without the model.

**Assets?** An original SVG keeps the nucleus at the true example radius ratio, too small to see on an ordinary screen. A separate inset magnifies only the nucleus by 10 000 and labels that change. Keeping a large visible nucleus inside the main atom would teach the wrong scale. The earlier real 3D count asset is explicitly contrasted with a scale drawing.

**Specific requirements?** Nano conversion, standard-form representation, powers-of-ten ratio, inverse conversion, radius/diameter, enlargement with unlike coefficients, and size versus mass. The prefix and enlargement controls are separate models because they manipulate different quantities.

**Template?** Guided models retain the Maths-derived card/navigation arrangement. Independent standard form uses two answer fields. Negative exponents and e-notation use text keyboards; coefficient fields use decimal input. The first useful select must remain visible in the tested mobile opening.

## Actual materials reviewed

- [AQA Chemistry specification](https://filestore.aqa.org.uk/resources/chemistry/specifications/AQA-8462-SP-2016.PDF), 4.1.1.5: atomic radius about 0.1 nm = 1 × 10⁻¹⁰ m; nuclear radius less than one ten-thousandth; almost all mass in nucleus; SI nano, standard form and comparison to physical objects. Corresponding common introductory Trilogy scope was also reviewed.
- [Pearson Chemistry specification](https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-chemistry-spec.pdf), issue 4 March 2024, 1.5–1.6 and associated mathematics: small nuclear size, mass concentration and estimating/comparing atomic scale. This is a limited comparison, not complete cross-board acceptance.
- [AQA June 2022 Foundation paper](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621F-QP-JUN22.PDF) and [paired scheme](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621F-MS-JUN22.PDF), 07.5: actual comparison of nanoparticle and atom radii expressed in standard form; answer 100 times, AO2. The app uses original values and coefficient differences rather than reproducing this question.
- Neighbouring Maths source `src/content/course/standard-form.ts`: actual prerequisite, guided scaling and coefficient/exponent response designs. Its source remains unchanged.

The workbench example supplies atom radius 1 × 10⁻¹⁰ m and nucleus radius 5 × 10⁻¹⁵ m, ratio 20 000. It satisfies the reviewed nuclear-size bound and is not presented as a universal exact measurement. Other independent tasks deliberately supply different values.

## Task-by-task audit

Each prompt, numerical value, correct answer, alternative, hint, feedback, diagram label and unit was checked individually.

| Stage         | Reviewed tasks                                                                                                                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Warm-up (3)   | 20/2 radius ratio = 10; radius 3 cm gives diameter 6 cm; 10⁻¹⁰ is smaller than 10⁻⁸.                                                                                                                                 |
| Refresher (6) | Mass versus size/diagram limit; nano = 10⁻⁹; 2 × 10⁻⁹ representation; 0.004/0.000002 = 2000; 0.003 m = 3 mm; diameter 0.24 nm gives radius 0.12 nm.                                                                  |
| Guided (3)    | 0.1 nm = 1e-10 m; 100 m / 20 000 = 5 mm; 10 m / 20 000 = 0.5 mm.                                                                                                                                                     |
| Practice (8)  | 0.15 nm = 1.5e-10 m; coefficient 2.5, power −10; 3e-8 / 1.5e-10 = 200; radius 0.18 gives diameter 0.36 nm; magnified picture limit; 50 m / 25 000 = 2 mm; 2e-10 m = 0.2 nm; written correction of mass implies size. |
| Check A (4)   | 0.12 nm = 1.2e-10 m; coefficient 3, power −10; 2e-10 / 4e-15 = 50 000; radius 0.11 gives diameter 0.22 nm.                                                                                                           |
| Check B (4)   | 4e-10 m = 0.4 nm; coefficient 1.6, power −10; 60 m / 30 000 = 2 mm; magnified diagram limitation.                                                                                                                    |
| Review A (3)  | 0.28 nm = 2.8e-10 m; 6e-8 / 2e-10 = 300; diameter 0.32 gives radius 0.16 nm.                                                                                                                                         |
| Review B (3)  | coefficient 4.5, power −10; 80 m / 40 000 = 2 mm; small nucleus with almost all mass.                                                                                                                                |

## Questions after implementation

**Mistakes?** A conventional absolute tolerance would accept zero for atomic lengths. These tasks use exact numerical marking, verified with zero, wrong magnitudes, negative values and equivalent e/decimal/fraction notation. Separate coefficient/exponent fields reject an equivalent unnormalised expression. Units distinguish metres from millimetres. The true-ratio SVG uses nucleus radius 120/20 000 = 0.006 drawing units; the separate inset radius is 60, exactly 10 000 times larger. Neither silently makes the main nucleus visible.

**Specification gaps/differences?** This closes a dedicated introductory size/scale demand under the AQA working baseline. It does not establish whole atomic-structure or course coverage. Abundance-weighted relative atomic mass remains missing. Supplied example values, typical estimates and exact known numbers are distinguished. Nano is taught; no claim is made that all SI prefixes or the entire Maths standard-form curriculum are covered here.

**Useful for students?** The lesson makes a proposed conversion observable, connects tiny radii with familiar-size analogies, and requires independent transfer to new coefficients and ratios. It also corrects the misleading inference from the app's magnified 3D counting diagrams. Written correction remains self-reviewed. This is reasoned instructional design, not measured learner effectiveness.

Types, lint, formatting and build passed. Final suite: 38 unit and 118 desktop/mobile browser checks passed. Initial visual review found unreadable narrow-screen diagram labels; the main drawing and inset now stack on mobile, with explicit label-size assertions. The first complete browser run found one shell-test storage timing race; it was corrected to wait for the written record while retaining false automatic correctness. Actual desktop/mobile conversion, enlargement and standard-form screenshots were inspected and sent before further lesson implementation.
