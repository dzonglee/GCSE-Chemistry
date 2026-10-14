# AQA Foundation Paper 1 — individual basis re-audit

14 October 2026. Original paper retained; this review adds explicit board/component provenance. This is one of four tier/component papers for AQA, not one of four interchangeable versions of the same component.

## Sources actually read

- [Current AQA 8462 specification](https://filestore.aqa.org.uk/resources/chemistry/specifications/AQA-8462-SP-2016.PDF), version 1.1: assessment overview, sections 4.1–4.5 and assessment objectives. Retrieved 2026-10-14; SHA-256 `ecd869d1874091a0a52abaeb8fce238a9c1cc207698713dfb66788eb0d448d43`.
- [June 2023 8462/1F question paper](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-84621F-QP-JUN23.PDF): all eleven groups, including the supplied observations and figures. SHA-256 `38f15441702f2e6dd93203ce3cc4551e6f99dcd72ddc66be2b6aa6d6aaaac505`.
- [Paired final mark scheme](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-84621F-MS-JUN23.PDF): complete general instructions and question-specific criteria. SHA-256 `e50ac7f2768f177fe59f7c03dbd2d49d8b47284ce292b36447986492f79d62f9`.

The current official resource index was also checked. Its 2024/2025 PDFs use cdn.sanity.io, which returned a proxy tunnel 403 in this environment. Their contents were **not** read and are not claimed as evidence. The accessible authentic 2023 paired assessment and current live specification underpin this re-audit. Copyrighted source PDFs and page renders remain private research files.

Actual question-paper pages 3, 12, 20, 22 and 31 were freshly rendered and visually inspected: shell/nucleus drawing; non-monotonic alloy graph; alternating sodium-chloride lattice; hydrogen/oxygen volume axes; blank temperature graph and extrapolation demand. These checks supplement the full extracted-text reading rather than substituting for it.

## What the sources change about design decisions

The official paper assesses both familiar recall and supplied unfamiliar evidence. It includes anomaly handling, ratios, particle counts, prediction from trends, bounded material comparisons and a full practical method. It awards plotting marks separately from a best-fit line and uses holistic levels for the soluble-salt method. Its general instructions distinguish valid alternatives, ignored material, contradictions and carried errors.

Our paper therefore retains separately reviewable plot/method criteria, a single whole-response six-mark decision, and the contradiction check before awarding an automatically checked numerical answer point. A matching final number is not proof of correct working. The original paper is not copied: its ten groups, values, chemistry contexts and specific response demands differ from the eleven official groups.

| Original group          | Specific reasoning reviewed                                                                                    | Why it belongs in 8462/1F                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Neon/isotopes           | Neutrality, neutron subtraction, 2,8 construction, isotope definition, weighted mean                           | 4.1 particle structure and relative mass; no Higher mole demand                                      |
| Periodic patterns       | Historical gaps, ion formation, supplied boiling trend, transition catalyst/reaction pair, displacement        | 4.1 periodicity; supplied evidence avoids requiring unavailable data                                 |
| Ionic solid             | Chloride dot/cross, extended electrostatic attractions, mobile ions, formula ratio, drawing limitation         | 4.2 structure/property explanation; ionic substances are not described as molecules                  |
| Molecules/carbon        | Water electron construction, graphite conduction/sliding, intermolecular boiling, limited nano comparison      | 4.2 distinguishes interparticle forces from bonds within molecules; no unsupported safety conclusion |
| Mass/formulae           | Bracket multiplication, conserved matter across an open boundary, balanced equation, oxygen uptake             | 4.3 Foundation quantitative content; valid balanced multiples accepted                               |
| Measurement/recovery    | Mean, half-range, shared bias versus repeatability, percentage yield and genuine loss                          | 4.3 plus practical measurement; specified decimal places retained                                    |
| Soluble salt            | Acid choice, excess oxide, filtration, gentle concentration/cooling/drying, mother liquor                      | 4.4 salt preparation; six-mark ordered method assessed holistically                                  |
| Reactivity/electrolysis | Visible observations, infer a series, carbon extraction limit, aqueous products, cryolite/anode use            | 4.4; molten conduction uses ions, not electrons                                                      |
| Energy/data             | Energy transfer, profile construction and differences, variables, six-point graph/best fit                     | 4.5; graph intercept here has no extra mark, unlike the official extrapolation question              |
| Cells/decisions         | Recharge chemistry, continuous feed, thermal-method repairs, supplied voltage rule, conditional recommendation | 4.5 Separate Chemistry cells; series arithmetic rule is given, not an unannounced physics test       |

Allocation remains **100 marks / 105 minutes / 50 parts**, AO1/2/3 **40/40/20**, 26 mathematical-context marks and 23 practical-context marks. These context counts describe our ledger, not a promise that every mark in a mathematical context is a distinct board mathematics-skill mark. The official minimum mathematics/practical requirements apply across the qualification. See the existing [individual review](../full-paper1-foundation-review.md) for the full allocation and previous production acceptance.

## Change boundary and acceptance

The 50 question definitions, order, IDs, answers, criterion allocations and exposure links are retained. Added provenance is displayed after the start controls, so students can inspect the specification without being shown solutions. Shared introductory text now calculates the actual group count instead of assuming ten groups, and the catalogue no longer assumes every board awards 100 marks.

This document is a content review. Fresh affected test results and inspected sample screenshots are recorded in the delivery ledger before proceeding to the next paper. The earlier complete course acceptance certifies its earlier release only; it does not certify the planned twelve-paper expansion.

### Fresh accepted checkpoint

Types, lint and production build pass after the documented archived-script portability fix. All 28 existing full-paper unit checks pass (18.9 seconds). Eight fresh Foundation Paper 1 browser checks pass (1.2 minutes, actual exit 0): both start choices at 320/390/1280 in both projects, and complete native 50-part submission/manual-review/reload/restart flows on desktop and mobile. This is an affected run, not another whole-course regression.

Build `tKL0DecsXwYXZV9MYam8X`: all twelve fresh desktop/mobile captures were personally inspected and representative introduction, ionic construction, six-mark practical and graph samples explicitly delivered before Paper 2 work. See [capture manifest](../qa/board-mocks/aqa-1f/manifest.json). Capture owner exited 0; the separately owned capture server was intentionally stopped after image review. No solution appears before whole submission, and no new marking or question-content claim is inferred from empty opening captures.
