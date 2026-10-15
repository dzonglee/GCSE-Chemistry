# Submitted organic-structure review

Read-only organic drawing reviews now show the atom count beside each visual. The saved incorrect two-carbon structure remains 2 C, 1 H and 1 O; the separate ethanol reference remains 2 C, 6 H and 1 O. The drawing, original response, reference, marks and exposure are preserved. This restores the local count summary previously present in the editable renderer; the existing external response description remains available.

The original AQA Paper 2 Foundation assertion exposed the omission during the full run: 732 passed, one failed, one interrupted, 2,908 not run, actual runner/owner 1. That attempt is incomplete, as are the earlier infrastructure/session attempts. [Failure receipt](../attempt-3-organic-review-summary.json). The application was changed after all owners closed, 2,451 fingerprints matched and port 3201 was released. No browser assertion, deadline, viewport, accessibility threshold, worker count or retry setting changed.

Types, full lint, all 1,157 units and build pass. All 20 focused original browser checks pass in one run: 10 desktop / 10 mobile across the six affected AQA/Pearson/OCR Paper 2 components, including all six original failing-review width/project combinations. [Current preflight](../preflight.json). These checks are separate from the still-pending complete 3,642-case run.

All nine final native original PNGs were personally reviewed. Full-page previews were resized by the viewer to 2,048 px in height, so readable detail was assessed in the six original viewport images at 720 px in height. Captures use actual scroll positions, with no image post-editing or DOM/style hiding. An initial tall element capture with fixed-header overlap was rejected; the final viewport captures assert that each complete visual sits below the actual header. [Capture manifest](capture-manifest.json) · [Inspection, dimensions and hashes](inspection.json) · [Content preservation](content-preservation.json). Capture exited 0; the manual server was intentionally closed with exit 130; all 2,451 fingerprints match and port 3201 is released.

| Viewport | Saved wrong structure | Separate reference | Page context |
| --- | --- | --- | --- |
|320px|[Retained](320-organic-review-retained.png)|[Reference](320-organic-review-reference.png)|[Full page](320-organic-review-full.png)|
|390px|[Retained](390-organic-review-retained.png)|[Reference](390-organic-review-reference.png)|[Full page](390-organic-review-full.png)|
|1280px|[Retained](1280-organic-review-retained.png)|[Reference](1280-organic-review-reference.png)|[Full page](1280-organic-review-full.png)|

Updated samples were explicitly delivered before restarting the whole-course regression. [Renderer](../../../../../src/components/PaperDrawingReview.tsx).
