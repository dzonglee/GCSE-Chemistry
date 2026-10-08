# Implementation and extension

## Content

`src/content/curriculum.ts` holds 62 lessons. Each compact authoring function supplies explicit prompts, answers, distractors, explanations and hints. Four questions are practice and two are reserved checks. Stable IDs combine a lesson slug with the authored item index: append new items rather than reordering existing ones, and plan a versioned migration if that contract changes. The topic array controls map ordering; lesson ordering is stable within topics.

`src/content/assessments.ts` contains separate diagnostic and paper banks. Paper variants are specified numerical examples in authored templates, not claims of additional distinct curriculum skills. Never duplicate a previously used prompt under a fresh ID simply to award new independent evidence.

## Marking and models

`src/lib/marking.ts` handles choices and strict numeric strings, signed values, scientific notation and simple numeric fractions. Units are shown separately and must be entered using the displayed quantity. No arbitrary expression evaluation or keyword-based essay marking is used. Content can specify tolerance and misconception feedback.

`src/lib/science.ts` provides the model calculations that have independent scientific example regressions. `Models.tsx` renders accessible native controls, readouts and schematic SVGs. Rate curves are illustrative, not an experimentally fitted law; equilibrium is directional, not a yield calculation. Organic formulae are for straight-chain representative families. Captions explain limits.

## State and evidence

`src/lib/progress.ts` is a client external store with a stable server snapshot. Work, exposure, preferences, assessment responses and history are stored together. Updates write a synchronous per-tab recovery journal, then commit under an exclusive Web Lock after checking the base record. A conflict is surfaced instead of silently merged or overwritten. Corrupt records and conflicting drafts remain exportable.

Exposure is captured before an assessment begins. All items in the set are conservatively exposed at start, even if the user stops early. The app only reports fresh first responses for previously unexposed questions; it never labels course completion as mastery. Practice is always practice evidence. Deferred feedback, locked responses and separate banks reduce cues during assessments. Delayed reviews use previous check questions and retain the original history.

## Boundaries

Board preference is not a verified crosswalk. The browser tests emulate mobile viewports in Chromium rather than validating iOS Safari. The app has no accounts or server learning database. Automated accessibility checks are not screen-reader acceptance. Recovery requires available browser storage and locking; the journal is tab-session data. Do not deploy or add tracking without revisiting privacy and terms.
