# Percentage composition: individual prose and review layout

Individually reviewed pure-sample scaling: doubling both part and whole mass preserves their fraction, rather than forcing 100%. Corrected “becomes 100%” and “Compare 2m/2M”. The old wrong option string is explicitly aliased to its current wording, retaining the same wrong result and misconception feedback. Numerical references, IDs, forms, raw responses and scientific demands remain unchanged.

The initial 16 desktop/mobile native and assessment browser checks passed (1.4 minutes), but personal screenshot inspection exposed a real usability defect: the schedule and question navigation pushed the first response below the opening viewport. Percentage composition now uses the existing compact active-review schedule after the response, with question navigation after the question. Only this lesson was added to the three relevant layout lists. Delay information remains accessible, and assessment gating/marking is unchanged.

Four affected unit checks passed (8.8 seconds); affected lint and both production builds passed. The final desktop/mobile reserved-check/retrieval tests passed (28.4 seconds), exit 0, against the corrected build. They now exercise both distinct delayed-review forms, hide answer feedback before submission, preserve existing freshness/delay checks, and assert the full first answer control fits within 664 pixels and remains at least 44 pixels tall on a 320×720 phone. All 2,355 frozen fingerprints verified after each browser owner closed; port 3201 released. This is 16 pre-layout passes plus two final focused passes, not a single final 18-case course certificate.

Both corrected screenshots personally inspected: [desktop](qa/composition-prose/desktop-scaling-review.png), [mobile](qa/composition-prose/mobile-scaling-review.png).

Remaining individual prose corrections, external potable-water work and complete final regression are pending.
