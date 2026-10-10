# Equilibrium regression follow-up

The interrupted 2,950-case whole-course run recorded 280 passes, two failures, two interrupted cases and 2,666 unrun cases (40.9 minutes; explicitly stopped, exit 130). Its two confirmed failures were a compression comparison test reaching its 30-second deadline and a stale pressure-input reload expectation. This is not a complete course pass.

Only compression’s six comparisons are divided into two groups of three. The original comparison callback, scientific checks, state/history validation, controls, reset, Undo, accessibility and viewport checks are retained, with the same 30-second limit. Other comparison modes remain unchanged.

The shared input-draft feature intentionally preserves invalid raw input across reload separately from validated model history. The pressure test now proves that `1/2` survives exactly as a raw draft, the complete validated history remains identical, tally decrement is disabled, and Undo clears the raw draft and restores `1` without removing a valid history entry. Original decrement, correct prediction and reset checks still follow. No product code changes were required.

Affected lint and typecheck passed. Focused desktop/mobile compression and gas-tally browser checks: six passed in 1.1 minutes, exit 0. All 2,354 frozen application/test/config/public/production fingerprints verified after closure and port 3201 was released. Whole-course regression must still be rerun after editorial corrections and external potable-water work.
