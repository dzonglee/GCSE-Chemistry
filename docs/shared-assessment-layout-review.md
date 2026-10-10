# Shared lesson assessment layout — review draft

Production browser owner 10457 completed successfully: 190 passed in 25.9 minutes. This is a focused layout validation, not a whole-course acceptance certificate.

## Problem and change

The percentage-composition review screenshot exposed schedule information and question navigation preceding the first response. DetailedLesson previously enabled compact active review and response-first navigation through multiple lesson-specific opt-in conditions. Replace those layout exceptions with consistent behavior for every lesson: active unsubmitted reviews show the answer panel first, navigation afterward, and an expandable review-schedule explanation below the assessment. Reviews before they start and after submission retain their visible scheduling information.

This does not change the shared AssessmentSession default used elsewhere, question content, assessment IDs, saved forms, exposure policies, raw response storage, or marking.

## Verification scope

The new registry exercises all 95 lesson routes on desktop and a 320 × 720 phone viewport. Each browser case checks both an active lesson check and an active delayed review: 190 cases / 380 assessment states. It checks response-before-navigation DOM order, keyboard expansion of review information, withheld whole-set criteria, actual recording, reload persistence of exact IDs and raw answers, locked recorded responses, navigation back and forth, and absence of horizontal overflow. Manual answers remain unmarked automatically.

This registry does not establish that every response control fits above a universal fold height; some essential diagrams legitimately occupy more space. Individual screenshot inspection and lesson-specific first-control checks remain necessary. It is not the final unified course browser suite.

Initial focused execution exposed an invalid test fixture: a prose reference answer was supplied to a polymer drawing field that requires encoded drawing state. The fixture was corrected to use partial drawing JSON, preserving the existing model and manual-marking behavior. The corrected polymer focus passed two desktop/phone cases; the subsequent complete registry passed all 190 cases.

Source typechecking, affected lint and production build passed before the frozen registry started. Freeze includes 2356 source/config/test/asset/production fingerprints. The owner exited 0. All 2356 fingerprints verified afterward, and port 3201 was released. Production BUILD_ID: 9DpoYOru46nXotOt2eVy3. All four actual desktop/phone screenshots were personally inspected; both phone samples were sent to the user. The source changes, registry, this review and four screenshots are the seven selected publication files.
