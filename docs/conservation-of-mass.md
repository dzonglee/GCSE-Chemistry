# Conservation of mass: individual source study and design

Thirtieth individually reviewed lesson. Research began after balancing desktop/mobile samples, independent construction and the actual reaction GLB were inspected and sent. Conservation is being separated from the original combined mass/concentration route; concentration receives its own later treatment. No imported route change during balancing regression.

## Before building

**Interesting/interactive?** Select a weighed boundary, retain apparatus mass separately, account for unreacted material, let supplied CO₂ amounts cross an open boundary, and compare magnesium-only mass with magnesium-plus-oxygen accounting. Connect conserved element counts with coefficient-weighted relative formula masses. Preserve wrong readings and causal explanations.

**Assets?** A readable mass inventory; boundary diagram with retained and escaped gas; an actual 3D container with stable CO₂ parcel identities; explicit before/after oxidation contributions and weighted species ledger. Gas glyphs represent labelled macroscopic parcels, not grams per individual molecule. The asset moves parcels between the vessel and surroundings without destroying them. It is an accounting simulation, not practical instructions or a reaction mechanism.

**Generic template?** A conserved total alone does not identify what was weighed. Students need apparatus versus contents, product versus unreacted material, gas exiting versus oxygen entering, and closed versus non-enclosed accounting. Concentration and measurement uncertainty are separate demands.

## Actual source reading

- AQA Chemistry 4.3.1.1/.2/.3 and Trilogy 5.3.1.1/.2/.3: atoms retained, coefficient-weighted formula masses, gas entering/escaping explaining non-enclosed measured mass. Pearson 1.47(a/b) explicitly distinguishes a closed precipitation flask and an open reaction taking in/giving out gas.
- OpenStax m68667 fetched HTTP 200, 49,610 bytes at pinned commit db0a8e6027100ce082e67fc8879faab86f9a58a7. Actual conservation paragraphs describe accounting for all matter; exercises distinguish an iron nail gaining oxygen, magnesium oxide formation, a sealed tin/air system and open fermentation losing CO₂. Its actual conservation figure was fetched HTTP 200, 591,435 bytes and inspected. Its simplified rust description is not copied as an exact formula for all real rust.
- Actual paired AQA 2019 Foundation Paper 1 05.2: open acid/calcium-carbonate flask loses mass because gas escapes. Actual page 19/table inspected; scheme confirms gas escapes. Adjacent anomaly/mean questions illustrate a separate measurement demand, not covered by simple conservation alone.
- Actual paired AQA 2018 Foundation Paper 1 05.2: heated copper carbonate contents lose mass because gas/CO₂ escapes; scheme explicitly accepts CO₂ escapes.
- Additional official AQA 2021 Foundation paper/scheme fetched HTTP 200, 2,631,162 and 401,805 bytes. They are served at NOV21 filenames but printed June 2021. Actual 10.1 gives 3H₂ + RO₃ → R + 3H₂O and total weighted reactant relative mass 150; scheme uses 3×18=54 and 150−54=96, or subtracts reactant hydrogen contribution first. This supports explicit coefficient weighting; it is not a claim that Mᵣ totals are measured grams.
- Actual Maths formulae-with-units content and using-formulae mobile screenshot inspected: labelled quantities, explicit unit conversion, meaningful answer construction and retained error recovery. The Chemistry model needs to define the physical boundary before applying arithmetic.

## Review questions

What exactly is weighed? Is apparatus mass included on both occasions? Does gas actually leave, or remain within the weighed collection? Is oxygen supplied from outside the original solid sample? Does unreacted material remain without being called product? Are all element identities retained? Are equation coefficients applied to complete Mᵣ and distinguished from gram ratios? Are representative gas parcel masses explicit? Inspect and send actual desktop/mobile samples before the next lesson’s research.

## Current Maths screen comparison

The current live Maths lesson, “Substituting into unfamiliar formulae”, was captured at desktop and mobile sizes. The mobile screen uses a visible course-map control, topic breadcrumb, large readable lesson heading, numbered learning stages, a short task counter and one explicit calculation task in a white card. Conservation retains these shared navigation and learning components while replacing the calculation model with a physical boundary and retained-material ledger. The first task must expose a useful control within the original mobile viewport; long source explanations belong below the task. Reference captures: `docs/qa/maths-reference-conservation-current-desktop.png` and `docs/qa/maths-reference-conservation-current-mobile.png`. The Maths checkout remains unchanged.

The separate draft passed four science checks and a strict TypeScript check of its six production files. These are draft checks, not completed route, storage or browser validation. Registration and full checks follow the balancing regression.

## Individual content and model review

All 49 original tasks were reviewed: 2 warm-up, 5 refresher, 4 guided, 22 practice, two five-question reserved checks and two three-question delayed reviews. Named oxide examples use stoichiometrically consistent masses: magnesium/oxygen 12:8, aluminium/oxygen 13.5:12, calcium/oxygen 10:4. The gas workbench uses supplied generic mass accounting, rather than claiming that its 25 g mixture/4.5 g gas is a particular acid-carbonate experiment. The acid-carbonate explanation question names CO₂ where reaction evidence supports it; an unknown mass loss does not establish CO₂.

**Mistakes found?** The initial integration required updating the explicit journey inventory. A new storage/exposure check found that overlapping alias groups did not connect a repeated reserved gas fact directly to the older gas question. The mapping now includes the full relevant group, without changing the shared decoder or treating new numerical calculations as repeated. Strict storage rejects wrong stage types, duplicate histories and empty histories; reset retains the canonical initial board through the shared fix. The initial front-on 3D image hid vessel depth, so the camera was elevated and captions shortened. No viewport, label-size or accessibility assertion was relaxed.

**Board deviations?** Closed versus non-enclosed systems, gas entering/leaving and coefficient-weighted relative masses follow the read AQA/Pearson demands. Apparatus and unreacted material make the conserved system explicit. Higher mole calculations, concentration and experimental uncertainty are excluded from this lesson and remain separate work. Relative formula-mass contributions are not labelled measured grams. This selected source comparison does not certify OCR or full-course coverage.

**Useful for students?** The four models require both numerical and causal predictions, retain wrong answers after reload, offer undo/reset, and distinguish gas formation from escape. Independent practice removes the workbench and includes a three-field constructed inventory; written causal explanations remain self-reviewed. Reserved checks defer all feedback until submission; separate retrieval uses the real seven-day delay. Actual binary assets contain the same three parcel identities, three carbon and six oxygen atoms inside or outside the boundary. Each glyph represents a labelled macroscopic parcel, not a single molecule with gram-scale mass.

Types, lint, production build and all 145 unit checks passed. The initial 18 desktop/mobile lesson checks passed; all 18 final camera/caption checks passed. Desktop/mobile inventory, independent construction and actual 3D asset were inspected and sent before measurement-uncertainty research. All 420 whole-app desktop/mobile browser checks passed. This is not a whole-course readiness claim.
