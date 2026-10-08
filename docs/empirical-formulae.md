# Empirical formulae: individual lesson 44

Source/design work began only after Gas volumes' final inspected desktop/mobile, independent and actual 3D samples were explicitly sent. All 672 previous whole-app browser checks subsequently passed in 18.1 minutes. Final revised desktop/mobile, independent and actual 3D samples were inspected and explicitly sent before lesson 45 research.

## Sources actually read

Fresh Pearson [Chemistry specification](https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-chemistry-spec.pdf), HTTP 200, 2588718 bytes, issue 4 March 2024; actual PDF page 19 viewed. Requirements 1.44–1.46 cover formulae from element masses/percentages, empirical from molecular formula, molecular from empirical formula and relative molecular mass, and magnesium-oxide experimental interpretation. These requirements are plain Foundation text, unlike the following bold Higher mole-definition requirement.

Fresh Pearson [Combined Science specification](https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-combinedscience-spec.pdf), HTTP 200, 2783452 bytes, issue 6 March 2024; actual PDF page 41 viewed. The same 1.44–1.46 requirements are shared and plain Foundation text. The old Higher/separate-only route label is therefore corrected to Foundation/shared content. The lesson's prerequisite is formulae and relative mass, not an inaccessible Higher-only mole-definition lesson; relative element amounts can be calculated from mass/Ar without Avogadro work.

AQA specification 4.2.1.2 and 4.3.2.3 actually read: simple ionic empirical formula from ion ratios; Higher use of measured masses/amounts to derive equation ratios. This is related scope, not a claim that AQA explicitly requires the complete Pearson empirical/molecular sequence.

Actually read and viewed paired [AQA 2019 Higher Paper 1](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2019/june/AQA-84621H-QP-JUN19.PDF) page 27, 08.3–08.4, and [mark scheme](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2019/june/AQA-84621H-W-MS-JUN19.PDF): subtract apparatus and mass differences; 2.54 g Cu /63.5 and .72 g water /18 both .04 mol; 1:1 selects the supplied CuO equation. Alternative coefficient-weighted mass methods are accepted. This supports mass-to-amount and ratio/evidence work. It is **not** a direct Pearson molecular-formula question or complete empirical-formula exam validation.

Actual OpenStax Chemistry 2e publisher [Determining Empirical and Molecular Formulas](https://raw.githubusercontent.com/openstax/osbooks-chemistry-bundle/main/modules/m68702/index.cnxml), HTTP 200, 51917 bytes, full relevant chapter read. The actual public publisher collection (`collections/chemistry-2e.collection.xml`) was obtained through a sparse public repository checkout to identify the correct module after guessed IDs returned 404. It distinguishes atom/amount ratios from mass ratios, uses shared scaling for 1:3.5→2:7, shows hematite 34.97 g Fe and 15.03 g O→Fe2O3, percentages on a 100 g basis, CH2O with molecular mass 180→C6H12O6, and actual empirical-to-molecular examples. Supplied publisher atomic masses differ slightly from GCSE-rounded constants; original tasks specify their own constants.

The public Pearson Sciences (2016) qualification/materials pages were obtained with HTTP 200 and actual titles checked. Guessed named older paper/SAM paths returned branded HTML not-found pages despite HTTP 200; they were rejected as PDFs. Public document search and search-engine access returned gateway 403; Chromium's Pearson navigation failed certificate validation. These were not bypassed. No inaccessible Pearson paper or scheme is claimed as read. Obtaining a direct Pearson paired empirical-formula question and the full cross-board audit remain outstanding.

## Questions before designing

What should students do? Convert each element mass with its own atomic mass, preserve the proportions when simplifying, handle exact halves/thirds without arbitrary rounding, translate percentages via a convenient mass basis, multiply every molecular subscript, and judge whether practical readings actually support a final formula.

What interactions make those differences visible? Five separately authored prediction workbenches: Mg/O amounts including mixed kg/g and doubled sample; Al/O, P/O and Fe/O fractional ratios; three-element composition including rounded analysis; empirical mass and whole molecular scaling including inconsistent exact data; tare/metal/oxygen gains with stable versus still-changing cooled mass. A table retains student count predictions alongside element mass and amount. A selected relation has its complete text visible outside a clipped select. Initial question data remain explicit when the exploration record changes.

What should be 3D? One actual ethane molecule C2H6, with eight actual atom meshes and seven actual single bonds. Both carbon atoms have true tetrahedral valence four, and the hydrogens have nonplanar staggered geometry. It demonstrates why CH3 is a simplest ratio rather than replacement of the whole molecule with an isolated CH3 entity. Other records do not continue showing ethane as if it were their molecule. Ionic oxides use ratios and measured data, not invented discrete MgO/Al2O3 molecules. Rotate with keyboard/touch and export a real GLB; text remains usable without WebGL.

## Actual Maths comparison

Read neighbouring `simplifying-ratios.ts` and `equivalent-ratios.ts`, then captured and viewed both live guided activities at desktop and mobile sizes. Shared scaling, common factors and explicit unit matching inform the chemical ratio model. Chemistry first needs element-specific mass conversion. Keep the Maths task-first card hierarchy, first useful controls, explicit wrong feedback, reset/undo/reload, small-screen layout and separate reserved/retrieval stages.

## Questions after reviewing

Are the calculations and chemistry right? All numeric tasks independently recomputed. Formula-choice tests reconstruct relative element amounts and verify that the proposed subscripts preserve them, including explicit rounded-measurement tolerance. This review corrected incorrect draft percentage data before integration. Exact 1.5 ratios scale to 2:3; nearby 2.011 from one-decimal composition can be judged against the stated precision. A noninteger exact molecular multiplier is inconsistent, rather than permission for fractional atoms or silent rounding. A provisional practical Mg:O ratio 4:3 is displayed as a ratio; it is not asserted to be a real Mg4O3 compound.

Is every example physically appropriate? An equal C/H mass example was changed from a claimed compound to a mixture. Its count ratio alone does not establish a compound formula. A contrived impossible C4H12 molecular example was replaced with a valid C8H16 composition and explicit lack of unique structural information. Empirical formula alone is not evidence of a discrete molecule or a unique structure. Supervised Mg-oxide data require purity/completion/retention assumptions; constant mass alone cannot prove all of them.

Does the lesson support independent study? 49 original tasks: 2 warm-up, 5 refresh, 5 guided, 21 practice, two five-task reserved checks and two three-task delayed forms. Four written explanations stay self-reviewed and false automatic correctness. Fresh reserved starting data differ from guided/practice mass records. Preserve all six original route-bank identities, drafts, exposure and unreadable storage; use only existing progress engine. No completion-derived mastery/grade/exam-certification claim.

## Validation and delivery

Types, lint and production build pass. All 256 unit checks passed in 3.9 seconds and all 22 final desktop/mobile lesson checks passed in 34.7 seconds. Actual exported binary geometry, revised Foundation prompts, mobile tables and independent fields were inspected. Samples and the real GLB were explicitly sent before further lesson research. Six additional route/search/accessibility cases passed in 51.0 seconds. The full 694-case regression is running. This is not full-course certification or a completed Pearson practical assessment map.

## Further Foundation review before delivery

Core tasks now use relative amounts `mass ÷ Ar` with every mass in grams; they do not require a Higher definition of a mole or Avogadro work. Actual count ratios are proportional to these relative amounts. Both reserved forms ask this relative calculation, and native quantities carry no incorrect physical mole unit. The same calculated ratios and formula answers are retained. Six-significant-digit display prevents repeating values wrapping on mobile while full intermediate precision is preserved. Canonical reset/reload, recovery, three-part answer alignment and actual 3D inspection are checked. Final samples were inspected and explicitly sent.

Lesson44 final complete regression: all694 desktop/mobile browser checks passed in18.7 minutes; six additional route/search/accessibility cases passed in51.0 seconds. Lesson45 integration began only afterwards.
