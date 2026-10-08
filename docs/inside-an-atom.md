# Inside an atom — individual sample review

Status on 2026-10-03: individually authored sample. Scientific content has been checked against OpenStax and its stated scope has now been compared with actual AQA specifications and paired questions/mark schemes, with a limited Pearson comparison. See [the official-source findings](official-atomic-structure-review.md). This does not certify exam readiness or complete section 4.1.1.5: atomic scale remains missing. Isotopes and ions and Electron shells now have individual journeys as well; other routes remain preliminary.

## What was learned from Maths

Read the complete adding-fractions bank, fraction workbench, journey/evidence operations and relevant CourseLesson rendering, plus the equation lesson's chapter/question bank and release documentation. The reference is `/workspace/GCSE-Maths/docs/fraction-lesson.md`, `docs/phase-2.md`, `src/content/course/adding-fractions.ts`, `src/components/FractionWorkbench.tsx`, and `src/lib/course/journey.ts`.

| Requirement             | Original Chemistry lesson           | Individual sample                                                                                                             |
| ----------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| First meaningful action | Free atom-count sandbox             | Place particle types to support a specific mass-distribution question                                                         |
| Prerequisites           | None                                | Locate nuclear particles and balance signed charges                                                                           |
| Guided progression      | Sandbox disconnected from questions | Particle locations/masses → neutral carbon → aluminium neutron inference                                                      |
| Support fading          | Same model for all questions        | Opening hint only on first guided task; later hints requested                                                                 |
| Mistake recovery        | Generic hint                        | Particle-location, neutrality or mass-number refresher selected for the task                                                  |
| Model integrity         | One lesson-wide slider state        | Per-task bounded operation histories; undo/reset and reload preserve work                                                     |
| Practice                | Four short items                    | Six tasks: neutron inference, mass summation, error correction, inverse neutrality, nuclear-symbol table, written explanation |
| Independent check       | Two questions repeated              | Two reserved three-question forms; hidden support and whole-set feedback                                                      |
| Delayed review          | Repeats checks                      | Two separate two-question forms after seven days; exposure retained                                                           |
| Written reasoning       | Choices only                        | Student explanation followed by explicit self-review marking points                                                           |

Maths includes other models and broader evidence rules. Matching these selected journey behaviours does not imply complete parity, educational effectiveness, or full exam coverage.

The revised screen was compared directly with Maths's desktop fraction, guided-learning and mobile fraction screenshots. It uses one task card, the model and answer beside each other on desktop, a yellow stage marker, a nearby gold hint and the same local heading/body fonts. Mobile stacks these in teaching order and puts task navigation below the answer. The first generic slider design was rejected by the user and replaced with individual particle operations.

## Decisions for this lesson

Keep isotope changes, charged-ion electron counts and detailed electron filling in their own later lessons. Here, the target is neutral atoms: p = Z, n = A − Z, e = Z. Show particle charges and relative masses before asking for a causal explanation. Use nuclear notation and a complete particle table so learners practise the representation they may meet in exams.

Guided task 1 sorts particle types, then explains where mass lies. Guided task 2 starts carbon with no electrons, requiring charge balance. Guided task 3 starts aluminium with the wrong neutron count, requiring A − Z. The models accept experimentation and diagnose element identity, mass number and charge separately. Diagrams are labelled schematic and not to scale; unusual count combinations are not claimed to be stable isotopes or ions.

Correct arithmetic alone does not assess an explanation. The written task reveals marking points only after a response is saved, retains the draft, and awards no automatic correctness. The whole atom is not drawn at a physical scale because a visible nucleus in a classroom diagram is magnified; explaining actual atom/nucleus size belongs in a separate atomic-model-and-scale lesson that is currently missing from the preliminary course.

## 3D asset

The atom-building tasks now use a real Three.js scene: blue proton spheres, gold neutron spheres, purple electron spheres and translucent shell boundaries. The particle controls update the actual scene objects. The nucleus cluster interleaves particle types instead of suggesting separate proton/neutron layers. Drag, arrow keys and native rotation buttons turn the scene; nucleus focus changes the view without changing the scientific state. Reset view is separate from reset model. Rendering runs on interactions rather than an idle animation loop, and mobile pixel density is capped.

These are original procedural meshes. No external artwork is used. GLB export includes the current particle counts, named particle meshes and an explicit schematic/not-to-scale note. The same particle model and text interpretation remain available in 2D when WebGL fails or the learner chooses a diagram. A 3D shell boundary is not an electron orbit, and the cluster is not a claim about nuclear packing or stability. The size distortion is labelled beside the view.

## Actual online material reviewed

Read OpenStax, **Chemistry 2e, section 2.3, Atomic Structure and Symbolism**, from the publisher's public repository, fetched over HTTPS on 2026-10-03 at commit `db0a8e6027100ce082e67fc8879faab86f9a58a7`:

- [Publisher's repository and textbook description](https://github.com/openstax/osbooks-chemistry-bundle)
- [Exact chapter source](https://github.com/openstax/osbooks-chemistry-bundle/blob/db0a8e6027100ce082e67fc8879faab86f9a58a7/modules/m68692/index.cnxml)
- [Reader-facing section](https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism) — section identified through the publisher's collection; the reader-facing site itself was not fetched.

Read the opening atomic-structure discussion, particle-properties table, definitions of Z and A, neutrality/charge relations, nuclear-symbol explanation, worked composition example, summary and relevant count/build-an-atom exercises. This is a general chemistry textbook, not a GCSE specification or exam mark scheme. Its broader ion, isotope-abundance, atomic-mass-unit and mass-spectrometry content is outside this sample's scope. Questions and visuals here are authored independently; no textbook passages, exercises or images were copied into the app.

The review confirmed that p = Z; A = p + n; n = A − Z; and for a neutral atom e = p. Proton and neutron relative masses are approximately 1, whereas electron mass is very small; zero electron mass is not claimed. The approximate 1/1836 ratio is supporting context, not a demand to memorise that denominator. It also confirmed mass number is a count rather than a physical mass, and changing proton count changes element identity. Definitions are now stated directly below the count model. Ion formation through electron gain/loss is distinguished from experimental changes to protons.

### Task-by-task scientific and teaching review

Each row was reviewed for the prompt, given data, answer, explanation, hint and intended misconception. Reserved forms give no hint or model during the check.

| Task ID suffix | Reasoning and verified result                                  | Teaching decision                                                          |
| -------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| w-location     | Nuclear particles are protons and neutrons                     | Warm-up separates nucleus from electron region                             |
| w-charge       | +1 + (−1) = 0                                                  | Signed-charge prerequisite supplied in the question                        |
| r-particles    | Neutron has charge zero and belongs in the nucleus             | Repair charge/location through placement                                   |
| r-neutral      | O-16: p8, n8, e8                                               | Charge repair starts with e7; nuclear counts retained                      |
| r-mass         | Li-7: p3, n4, e3                                               | Small-count repair of A − Z                                                |
| g-place        | Nearly all mass is in the nucleus because p/n are much heavier | Particle labels are types, not a complete atom's counts; one opening hint  |
| g-neutral      | C-12: p6, n6, e6                                               | Add electrons to balance charge; annotated notation                        |
| g-mass         | Al-27: p13, n14, e13                                           | Adjust neutrons after hint fades; exclude electrons from A                 |
| p-neon         | Ne-22: n = 22 − 10 = 12                                        | Transfer; optional model records support                                   |
| p-sulfur       | p16 + n18 gives A34                                            | Reverse calculation; reject including electrons                            |
| p-error        | Neutral p9 requires e9, not n9                                 | Correct a reasoning error rather than another sum                          |
| p-inverse      | Neutral e19 implies p19                                        | Ignore distracting A39 when asked for protons                              |
| p-symbol       | Ar-40: p18, n22, e18                                           | Unannotated nuclear notation and three separately entered counts           |
| p-explain      | Heavy nuclear particles account for almost all mass            | Original written explanation, then explicit self-review; no automatic mark |
| ca-neutrons    | B-11: p5, n6, e5                                               | Reserved nuclear-symbol table                                              |
| ca-electrons   | Neutral p15/n16 gives e15                                      | Neutron count is irrelevant to neutrality                                  |
| ca-mass        | Nuclear particles are much heavier than electrons              | Mass explanation distinguished from nucleus volume                         |
| cb-neutrons    | K-41: p19, n22, e19                                            | Alternate reserved nuclear-symbol table                                    |
| cb-mass        | p7 + n8 gives A15                                              | Independent reverse calculation                                            |
| cb-neutral     | Equal opposite charged particles cancel                        | Independent explanation of zero overall charge                             |
| ra-inverse     | Neutral e12/n13 implies p12 and A25                            | Delayed two-step inference                                                 |
| ra-location    | p/n central, electrons outside                                 | Delayed structural retrieval                                               |
| rb-number      | p14/n15/e14 gives Z14                                          | Atomic number distinguished from mass number                               |
| rb-neutrons    | Neutral F-19 with e9 gives p9 and n10                          | Delayed inverse neutron inference                                          |

The two check forms are finite, short samples of these outcomes. Repeated forms retain exposure and cannot produce fresh evidence. This scientific review does not establish GCSE marking language, assessment-objective balance or independent educational effectiveness.

## Earlier GCSE source queue — historical blocker

Earlier requests to the following sites were rejected by the outbound proxy. Following the user's network change, the actual AQA Chemistry/Trilogy specifications, paired 2023 Foundation/Higher papers and schemes, and Pearson's specification were obtained and read. [The official review](official-atomic-structure-review.md) records the exact successful sources and missing outcomes; the previous blocker is not the current status for those sources.

- AQA Chemistry atomic structure specification: https://www.aqa.org.uk/subjects/chemistry/gcse/chemistry-8462/specification/subject-content/atomic-structure-and-the-periodic-table
- AQA Combined Science Chemistry specification: https://www.aqa.org.uk/subjects/science/gcse/combined-science-trilogy-8464/specification/subject-content/chemistry
- Official questions/mark schemes through https://filestore.aqa.org.uk/
- Royal Society of Chemistry teaching resources: https://edu.rsc.org/
- BBC Bitesize GCSE Chemistry: https://www.bbc.co.uk/bitesize/

The neutral-atom scope matches the introductory requirements reviewed. AQA's mass table specifies a very small electron mass; the app's about 1/1836 is context, not an additional memorisation requirement. Diagram construction and shell distributions are now treated separately in Electron shells. Atomic history/scale and complete course coverage are still open.

## Required content review after access is available

For every task, verify the science, vocabulary, provided data, representation, answer, misconception feedback, hint and intended reasoning against the chosen specification. Read relevant exam questions and mark schemes to identify the required demand and marking language; author original questions rather than copying papers. Check that independent forms cover different representations and do not merely change numbers. Add any missing assessable requirements, and identify where prerequisite content is taught.

Course-level exam readiness additionally requires a statement-by-statement coverage map, all remaining individually reviewed lessons, practical/data reasoning, extended written answers, timed papers reflecting the board's format and assessment objectives, and content/exam review beyond software tests. The existing short papers and preliminary lesson count do not establish this.
