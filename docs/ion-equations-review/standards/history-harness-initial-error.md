# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ion-equations.browser.spec.ts >> every original sealed ion question has a complete first response within664px at320/390/1280
- Location: tests/ion-equations.browser.spec.ts:397:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

Expected: undefined
Received: []
```

# Test source

```ts
  399 | }, info) => {
  400 |   test.setTimeout(240000);
  401 |   for (const kind of ["check", "review"] as const)
  402 |     for (const f of [0, 1]) {
  403 |       const data = emptyProgress(),
  404 |         work = emptyWork(),
  405 |         form = (kind === "check" ? j.checkForms : j.reviewForms)[f],
  406 |         old = Date.now() - REVIEW_DELAY - 2000;
  407 |       work.section = kind;
  408 |       work.run = {
  409 |         kind,
  410 |         ids: form.map((q) => q.id),
  411 |         index: 0,
  412 |         started: Date.now(),
  413 |         responses: {},
  414 |       };
  415 |       if (kind === "review") {
  416 |         const previous = j.checkForms[f];
  417 |         work.history = [
  418 |           {
  419 |             kind: "check",
  420 |             ids: previous.map((q) => q.id),
  421 |             index: previous.length - 1,
  422 |             started: old - 1000,
  423 |             submitted: old,
  424 |             responses: Object.fromEntries(
  425 |               previous.map((q) => [
  426 |                 q.id,
  427 |                 {
  428 |                   answer: q.answer,
  429 |                   correct: !q.rubric,
  430 |                   helped: false,
  431 |                   fresh: false,
  432 |                   at: old,
  433 |                 },
  434 |               ]),
  435 |             ),
  436 |           },
  437 |         ];
  438 |         data.seen = Object.fromEntries(
  439 |           exposureIds(previous.map((q) => q.id)).map((id) => [id, old]),
  440 |         );
  441 |       }
  442 |       data.work[slug] = work;
  443 |       const context = await browser.newContext({
  444 |         ...devices[
  445 |           info.project.name === "mobile" ? "iPhone 13" : "Desktop Chrome"
  446 |         ],
  447 |         viewport: { width: 320, height: 664 },
  448 |       });
  449 |       try {
  450 |         const page = await context.newPage();
  451 |         await page.addInitScript(
  452 |           ({ key, raw }) => {
  453 |             if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
  454 |           },
  455 |           { key: STORAGE_KEY, raw: JSON.stringify(data) },
  456 |         );
  457 |         await page.goto(route);
  458 |         expect(await page.evaluate(() => navigator.maxTouchPoints > 0)).toBe(
  459 |           info.project.name === "mobile",
  460 |         );
  461 |         expect(await page.evaluate(() => devicePixelRatio)).toBe(
  462 |           info.project.name === "mobile"
  463 |             ? devices["iPhone 13"].deviceScaleFactor
  464 |             : 1,
  465 |         );
  466 |         for (const [i] of form.entries()) {
  467 |           if (i)
  468 |             await page
  469 |               .getByRole("button", { name: "Next question →", exact: true })
  470 |               .click();
  471 |           const selector =
  472 |             ".question-panel .answer-option,.question-panel input:not([type=checkbox]),.question-panel textarea,.question-panel select";
  473 |           for (const width of [320, 390, 1280]) {
  474 |             await page.setViewportSize({ width, height: 664 });
  475 |             await expect(page.locator(selector).first()).toBeVisible();
  476 |             await layout(page, selector);
  477 |             await expect(
  478 |               page.locator(
  479 |                 ".assessment-review-criteria,.results-list,.sample-reference,.task-workbench",
  480 |               ),
  481 |             ).toHaveCount(0);
  482 |             if (!i)
  483 |               await shot(
  484 |                 page,
  485 |                 `${info.project.name}-original-${kind}-${f}-${width}`,
  486 |               );
  487 |           }
  488 |           // Native layout and sealing are tested independently of answer correctness.
  489 |           await page
  490 |             .getByRole("button", { name: "Leave unanswered", exact: true })
  491 |             .click();
  492 |           await saved(page);
  493 |         }
  494 |         await page
  495 |           .getByRole("button", { name: "Submit whole set", exact: true })
  496 |           .click();
  497 |         await saved(page);
  498 |         const actual = await state(page);
> 499 |         expect(actual.history.slice(0, -1)).toEqual(work.history);
      |                                             ^ Error: expect(received).toEqual(expected) // deep equality
  500 |         expect(actual.history.at(-1).ids).toEqual(form.map((q) => q.id));
  501 |       } finally {
  502 |         await context.close();
  503 |       }
  504 |     }
  505 | });
  506 |
```
