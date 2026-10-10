# Ionic bonding: optional visual experiment

Route: `/experiments/ionic-bonding`. Branch: `codex/chemistry-ionic-bonding-experiment`, based on `8f77886f8e0f604c57e04a87f2d0eb6ffd41ae54`.

This is a separate presentation experiment for one lesson. The existing ionic-bonding journey already contains52 tasks and independent construction; none is replaced. No pre-existing shared application/component/stylesheet, dependency, public asset or configuration file is edited. This refinement remains entirely within files added by the experimental branch.

## Research and response demands

- [AQA8462 specification](https://filestore.aqa.org.uk/resources/chemistry/specifications/AQA-8462-SP-2016.PDF), printed pages27–28, §4.2.1.2: transfer, unchanged nuclei, electron counts, dot/cross origins, ion charges and brackets. The first prediction withholds charge labels until checking, including the enlarged view.
- Same, §4.2.1.3: magnesium/chloride ratio; flat NaCl slice versus a turnable projected lattice, showing attraction in all directions. Six neighbours describe this displayed NaCl structure and are supporting visualisation, not a universal salt recall requirement. Captions distinguish model limitations and extended structures from molecules.
- [2022 Higher Paper1](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621H-QP-JUN22.PDF), p4, Q01.7, and [mark scheme](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621H-MS-JUN22.PDF), p9: describe Mg/O electron transfer, the number of electrons and resulting ions/full shells. [Foundation paper](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621F-QP-JUN22.PDF), p34, Q09.7, and [scheme](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-84621F-MS-JUN22.PDF), p26, confirm the same demand at both tiers. Full explanation/diagram review remains manual; no examiner marks are awarded.
- [OpenStax Chemistry2e, §7.1](https://openstax.org/books/chemistry-2e/pages/7-1-ionic-bonding): fixed nuclei, electron transfer versus electrostatic bonding, extended NaCl structure. The actual publisher lattice figure was downloaded and personally inspected. College-level extensions were not imposed as GCSE recall.
- [Brilliant public science demonstrations](https://brilliant.org/) and its publisher article [Hand-crafted, machine-made](https://blog.brilliant.org/hand-crafted-machine-made/): public circuit/optics demonstrations were obtained and personally viewed, and the article read. The useful comparison is an object that responds directly to a purposeful action, precise art and a deliberate progression. This is not a claimed inspection of authenticated paid lessons, copying of their art or measured learning parity.

The actual specification pages and paired exam pages were personally inspected. Actual GCSE Maths roots-and-reciprocals-priority source and fresh guided/independent production views at1280/390/320 were compared, including wrong-work reload and sealed responses. Reference commit: `32342d38e6c5d5436e472c56a97161eb272796e9`. Existing chemistry tasks were inspected before the experiment; no invented missing-content gap is claimed.

## Why each chapter helps

Transfer makes charge a consequence of changing electron count. Balance permits an incorrect two-to-one-chlorine distribution, retains it and requires reversal/repair before the formula response. Connect exposes the missing depth of a flat lattice. Challenge uses supported MgO construction, short force recall and a bounded explanation. Revisit changes the donor arrangement to Na2O after seven days. A generic text-and-choice template would poorly represent transfer/conservation and an extended spatial lattice.

The focused optional shell uses local Archivo/Atkinson fonts, navy/teal controls, consistent coral/cobalt electron origins and original vector shell/core art. Desktop pairs the model with prediction/ion labels; mobile keeps the model, action and first choices contiguous. Active assessment leads with the actual scientific question. The enlarged atom inspector, exact count ledger, model limitations and explicit course exit remain available. The lattice keeps all64 sites and its actual geometry while muting background spheres so the selected ion and six nearest neighbours are readable.

Learners move the actual outer-shell cross with mouse/pen/touch drag, donor/receiver taps or keyboard; labelled transfer/undo controls remain an alternative. Outside release, cancellation and second-tap deselection change no chemical work. The HTML pickup replaces one SVG marker, so a held electron is never counted or drawn twice. Nuclei and element identities never change. Motion follows actual send/return actions and respects reduced motion. No publisher art, external runtime service or new dependency is shipped.

## Persistence and assessment

Only the existing `gcse-chemistry.progress.v1` namespace is used. Experimental work occupies `experiment-ionic-bonding`, draft `ionic-lab-v1`, version1. Old tasks, forms, indices, drafts and histories are untouched. Opening guidance conservatively exposes all52 original ionic equivalents; it can affect their freshness but never records correctness or mastery.

Every experimental run is `helped:true,fresh:false`, including delayed runs. All three responses must be recorded before whole submission reveals criteria/references. Wrong/partial work survives reload; edits invalidate recording. Unreadable experimental bytes survive untouched, and explicit recovery archives them while preserving sibling work. Existing corrupt/blocked-storage and stale-tab protections are reused. Seven days means168hours from the latest submission; previous runs remain.

## Validation and reproducibility

Own checkout and production port3202 were used; actual Maths reference ran on3300. Main-session servers were not reused or stopped. Source/test/config/public/build fingerprints were unchanged throughout production browser/manual runs; real drivers/servers exited before edits or rebuilds.

- `npm run typecheck`, clean `npm run lint -- --max-warnings=0`, and real `npm run build`: pass on the final compact-label application.
- `npm run test:unit`:1,032 pass. The scientific/state libraries remained unchanged throughout later UI refinements. Final affected nine checks also pass; these cover literal arrangements, all permitted transfers, wrong-work repair, schema rejection, recording/submission, the exact review gate and lattice geometry.
- Final production native browser:33 experimental cases across1280/390/320,20 retained original-lesson cases and10 shared-storage cases across desktop/mobile pass, zero retries. Coverage includes direct native manipulation, fixed nuclei, rendered conservation, wrong reload, whole-submission secrecy, exact168h gate, malformed draft archival, blocked storage and simultaneous/stale tabs.
- Final main capture:69 states/87PNGs. Zero horizontal overflow, axe violations or page errors. Active first complete answer/action: minimum46px high, maximum bottom660.765625px in a664px viewport. All first transfer charge choices fit by653.171875px. Rendered SVG text minimum14.458333333333334px. Submitted read-only comparisons are scrollable and excluded from the new-response control gate.
- Final native gesture capture:15 states/15PNGs. Seventy-five final images have personal inspection receipts:46 previously viewed images proved SHA256-identical after the last two control-label edits;14 changed main images and15 final gesture images were viewed again. This does not claim all102 captured images were personally inspected.

Native mobile Chromium reports touch1/DPR3. Context timezone is Australia/Sydney; the gate is absolute elapsed time. The native harness waits500ms after CDP drag end/cancel before its first subsequent tap because an isolated plain-HTML no-handler baseline reproduced Chromium's gesture-window suppression. It does not retry taps, debounce the application or weaken expected values. Physical iOS Safari remains unverified.

The external configs use `/usr/bin/chromium`, `reuseExistingServer:false`, own port3202 and native device descriptors. Existing default test config still uses the main-session port; use the isolated override when reproducing concurrently.

Initial evidence is in `/workspace/course-audit/brilliant-ionic-experiment/`. This refinement's research, source mapping, failures/fixes, exact file list, unified patches, final logs, frozen manifests, raw metrics and personally inspected final screenshots are in `/workspace/course-audit/brilliant-ionic-refinement/`, especially `DESIGN-RESEARCH.md`, `VALIDATION.md`, `SCREENSHOTS.md` and `PERSONAL-INSPECTION.json`. Failures were retained; geometry assertions were preserved or strengthened.

## Limits

This is scaffolded diagram manipulation, not freehand drawing or fresh unassisted assessment. It has not received independent learner/reviewer acceptance, an entire-course browser regression, physical iOS Safari/assistive-technology user testing, grade/readiness certification or complete Pearson/OCR alignment. No shared-component patch is needed. It is not merged, deployed or published.
