# Potable-water / RP8 / RP13 delivery

Exclusive review of the existing potable-water lesson. Baseline: `a8005463d58246ed341307d0f0670dd1001fa5e1`, fetched from `codex/chemistry-main-followups-20261008`. Feature branch: `codex/chemistry-potable-review`. Authored 13 October 2026, Australia/Sydney.

The confirmed gap was interpreting pH and dissolved solids from different source samples. Thirteen appended tasks add source readings, unequal-volume concentration construction, a worked error recovery and separate independent/delayed forms. All 88 original normalised task objects, positions, original forms, version 1, metadata and aliases remain exact. The original 26 native records and ten manual written responses remain. New numerical exposure also recognises prior equivalent residue/repeat work; changed data or seven days cannot reset freshness.

**The branch deliberately leaves shared application files unchanged. Tests and screenshots describe the private integration candidate with the two proposed patches applied.** This is a reviewable lesson delivery, not a standalone whole-application acceptance or permission to merge/deploy.

- [Research, exact clause-to-task mapping and design review](RESEARCH-AND-MAPPING.md)
- [Validation, actual failures/fixes and remaining limits](VALIDATION.md)
- [Exact changed-file list](FILES.md)
- [Screenshot manifest and personal inspection](screenshots/manifest.json)
- [Source-figure inspection manifest](source-figure-manifest.json)
- [Small application/layout proposal](proposals/01-water-layout.patch)
- [Four literal inventory-count updates](proposals/02-inventory-counts.patch)
- [Baseline/candidate SHA256 for all nine proposed files](proposals/proposed-files.json)
- [Owned source/test unified patch](owned-source.patch)

## Final samples

- [Guided desktop](screenshots/1280-guided-sources.png)
- [Guided mobile](screenshots/390-guided-sources.png)
- [Independent mobile with retained wrong work](screenshots/390-independent-check-wrong.png)
- [Original distilled-water apparatus](screenshots/1280-original-distillation-apparatus.png)
- [Original manual method, reference still sealed](screenshots/320-original-written-sealed.png)
- [Delayed source response](screenshots/390-delayed-source-sealed.png)

Actual Maths comparison uses commit `1299379ad29346f3d44d5ba640dee13da06f7c70`, its ratio/concentration source and four freshly captured guided/independent desktop/mobile views in [comparison](comparison/). These were personally inspected. This does not establish whole-course parity.

## Integration and reproduction

Main owns integration. Wait for main's running server/tests to exit before applying shared proposals. Review the small patches against current main; resolve any shared-file divergence rather than replacing whole files. This branch's nine shared files are still baseline bytes. The count-only proposal changes 5916 to 5929 while retaining all full-paper science, mark and identity assertions. No global audit map, configuration, lockfile or dependency is changed.

The reproduction tools retain the actual isolated paths and assigned ports. Copy the branch without Git/build/dependencies into `/workspace/chemistry-potable-candidate`, install with its locked `npm ci`, apply both patches with `patch -p1`, then run types, lint, units and a production build. Use the supplied external Playwright configs for Chromium at 3202, never main's 3201. The capture driver additionally needs the supplied normalised `actual-journey.json` at `/workspace/course-audit/potable-review/actual-journey.json`. Its output belongs outside application source. Freeze before running and verify after actual runner/server exit. Maths reference used a separately owned 3300 server, now stopped; no main server was reused or stopped.

Main still needs to review/integrate this delivery and run its whole-course regression and final GCSE Maths comparison. App responses cannot certify supervised apparatus competence or exam readiness; full Pearson/OCR alignment and real iOS Safari/screen-reader sessions are not claimed. No merge or deployment was performed.
