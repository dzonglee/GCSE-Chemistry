# Course navigation: persistent heading and visible current lesson

Accepted shared UI correction, 9 October 2026. It does not establish whole-course content or exam readiness.

The previous automatic reveal scrolled the complete aside, including the academy heading. Actual yield screenshots showed the heading clipped at the top even with page scroll zero. Fresh 320/1280 Maths reference views were inspected; its academy identity remained visible.

The Chemistry heading and local-progress note now remain outside the scrolling course links. Automatic reveal acts on the course navigation alone, after fonts load and when its size changes. Progress changes do not reset deliberate map scrolling. Mobile keyboard opening/closing and current-link navigation remain available. The mobile bar now measures exactly 64px, matching the map's 64px start, while its button remains 44px tall.

Types, zero-warning full lint and production build pass. The full 1,023 unit checks passed in 1.2 minutes before the final one-pixel header padding correction. V1 focused checks: four passes, a real 65px-versus-64px mobile mismatch, and a monolithic all-route case reaching its 180-second deadline after 70 routes. V2 retains the deadline and every assertion, divides route verification by topic, and passes all 24 cases in 5.1 minutes. These cover all 95 routes on desktop and mobile; reload, resizing, keyboard interaction, accessibility and deliberate map scrolling also pass.

All 2,264 application/test/config/public/production fingerprints were verified after actual runner exit. Six final screenshots from build MLwFngZII5cgJxPF9Zq04 have a [build/hash manifest](qa/sidebar-final/manifest.json). Every image was personally inspected, and final representative desktop/mobile links explicitly delivered. The screenshot server stopped with actual exit143, followed by a matching fingerprint check. Sampled yield controls remain at least44px and finish at536.53px desktop/581.28px mobile, below the unchanged664px limit.

Visual review separately identified that the mobile task strip does not reveal the current task. That next shared navigation correction is not included in this acceptance. Exact content/skills/tier mapping, cumulative assessment breadth, external potable-water delivery and a complete current frozen regression remain open.
