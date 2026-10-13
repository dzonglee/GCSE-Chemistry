# Atelier Academy · GCSE Chemistry

13 October2026 integration checkpoint: the external potable-water/RP8/RP13 delivery is integrated, both shared UI proposals are applied, and all124 AQA sections have reviewed response evidence. Types/lint/build,1105 units and48 integrated water browser checks passed;51 fresh captures passed layout/accessibility gates and representative samples were personally inspected and sent. The new3248-case/172-file whole-course restart is pending on build Aa0dIR-3w-sKBPnUmz_Ot; final acceptance is pending. Earlier counts/receipts below describe historical builds. See docs/qa/potable-integration-final/README.md and docs/final-maths-comparison.md. No merge or deployment.

An interactive GCSE Chemistry study app built from the learning and design principles of the neighbouring GCSE Maths project. It includes a visible course map, task-first models, authored questions, specific feedback, browser-local work, independent checks and delayed retrieval.

## Develop

Use Node.js 22 or newer and npm:

```sh
export npm_config_cache=/workspace/.npm-cache
npm ci
npm run dev
```

Development uses port **3001**, keeping Maths on 3000. No account, database, API key, paid service or network media is required. Fonts are local and retain their SIL Open Font licences.

```sh
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm run test:e2e
```

Browser tests start a production server on **3201** and use the installed `/usr/bin/chromium`. Set `CHROMIUM_PATH` to another compatible Chromium executable if needed. The unit configuration explicitly includes only unit specs and does not start a server. Browser screenshots, reports and failure traces are ignored generated outputs.

For production serving, run `npm run build` followed by `npm run start` (3001). Do not run development and production builds concurrently.

## Learning product

The course has **95 individually researched lesson journeys across ten topics**, with samples explicitly delivered one lesson at a time. The authored journeys contain 2,192 practice tasks; counts represent activities, not distinct assessed skills. The [current rebuild status](docs/rebuild-status.md) links to dated individual reviews and the remaining whole-course audit.

Each journey combines concept-specific teaching, purposeful models, unsupported independent practice, targeted recovery, alternate sealed checks and delayed review. Models include real interactive and exportable 3D structures where they help the chemical reasoning, alongside accessible diagrams, tables and text interpretations. Wrong constructions and raw input drafts remain available for repair.

The application includes two 20-question starting checks, eight original15-question short practice sets, two individually curated30-question Foundation cumulative sets (Paper1 and Paper2 individually reviewed and delivered), mixed retrieval, a visible curriculum, saved local work, course/tier/board context and scoped export/deletion. It also includes four original 100-mark full papers covering Foundation/Higher Papers 1 and 2:400 marks across191 parts, with sealed submission and manual method/extended-response review. Qualification/tier mapping covers all124 AQA Chemistry sections; response evidence is confirmed for all124 following water integration. The new3,248-case desktop/mobile regression is pending; these are original practice papers, not official exams.

Routes include `/`, `/topics/[slug]`, `/lessons/[slug]`, `/learn`, `/practice`, `/diagnostics`, `/exams`, `/preferences`, `/coverage` and legal/accessibility notices.

## Saved learning

Progress is stored under `gcse-chemistry.progress.v1`. A synchronous per-tab session-storage journal protects draft answers against immediate refresh before an asynchronous Web Locks commit. Writers compare the saved base inside the exclusive lock. A conflicting tab retains work for the visit and does not overwrite newer saved data. Reload uses the newer record; conflicting recovery drafts are retained separately for export. Invalid saved data is preserved and saving is blocked until explicit recovery or deletion.

Saving requires a modern browser with Web Locks over HTTPS or a trustworthy local origin. If local storage, session storage or locking is unavailable, study still works and a warning describes the limit. Recovery drafts last for the browser tab session, not indefinitely after the tab is closed. There is no account or cross-device synchronisation. Close other Chemistry tabs before deleting data; this tab cannot erase their session storage.

Assessments capture exposure before display, lock responses and defer feedback until whole-set submission. Restarting does not reset exposure. Practice and mixed questions do not count as fresh independent evidence. Reviews become due after seven days; individually authored journeys reserve separate review forms, with no remaining preliminary lesson routes. Identical demands can share exposure aliases across teaching and assessment. History is retained. A completed check does not certify mastery or predict a grade.

## Scope and review

The course contains 95 individually reviewed lessons across 10 topics, with reviewed sample screenshots sent before proceeding. The AQA Chemistry specification has a complete 124-section qualification/tier map, checked against Trilogy where applicable; all124 sections have individually reviewed response evidence. The potable-water and required-practical review is integrated. All 25 editorial follow-ups are recorded in [the publication registry](docs/editorial-publications.json). Four original Separate Chemistry Foundation/Higher papers provide 400 marks across 191 parts. See [the current qualification and response audit](docs/qualification-response-audit/README.md) and [validation](docs/validation.md). Types/lint/build,1,105 units and48 integrated water browser checks pass; final whole-course acceptance is pending. Other-board comparison is limited to the scope recorded in the reviews. Written self-review and simulated practical work do not establish independently marked performance or physical practical competence.

Written explanations and hands-on practical techniques are not machine-assessed. Models are simplified teaching representations, with their limits stated. Real experiments require qualified school supervision; the app is not a guide to home chemical experiments. Legal notices are drafts for operator review before launch. No deployment, analytics, accounts or video generation is included.

See [build plan](docs/build-plan.md) and [validation evidence](docs/validation.md). Source is organised into `src/content`, `src/lib` and `src/components`, with App Router pages in `src/app`.

- **Conservation of mass** has 49 individually authored tasks and four boundary-specific interactions, including an actual rotating/exportable 3D vessel with retained parcel identities. See [its individual review](docs/conservation-of-mass.md).

- **Measurements and uncertainty** has 48 individually authored tasks, retained repeat records, proposed mean markers, reference/bias comparison and investigator agreement. See [its individual review](docs/measurement-uncertainty.md).

Reacting masses has been individually reviewed with: forward and reverse named mole ratios, mass conversion, required reactants, weighted mass methods and conserved mass versus changed molecule amount, with a genuine ammonia equation-event asset. See [its individual review](docs/reacting-masses.md).
