# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ion-equations.browser.spec.ts >> all original manual practice controls fit and retain malformed and wrong work without automatic marks
- Location: tests/ion-equations.browser.spec.ts:507:5

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 664
Received:    690.4375
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to main content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=e4]:
      - link "Atelier GCSE Chemistry" [ref=e5] [cursor=pointer]:
        - /url: /
        - text: Atelier
        - generic [ref=e6]: GCSE Chemistry
      - button "Course map" [ref=e7] [cursor=pointer]
    - generic [ref=e8]:
      - main [ref=e9]:
        - article [ref=e10]:
          - generic [ref=e11]:
            - link "‹ Chemical analysis" [ref=e12] [cursor=pointer]:
              - /url: /topics/analysis
            - strong [ref=e13]: Chemistry only
          - generic [ref=e14]:
            - generic [aria-hidden] [ref=e15]: "8"
            - heading "Testing ions" [level=1] [ref=e16]
          - paragraph [ref=e18]:
            - text: "Whole lesson:"
            - strong [ref=e19]: 0 of 48 learning tasks tried
          - navigation "Lesson stages" [ref=e20]:
            - button "Warm-up" [ref=e21] [cursor=pointer]:
              - generic [aria-hidden] [ref=e22]: "01"
              - text: Warm-up
            - button "Learn" [ref=e23] [cursor=pointer]:
              - generic [aria-hidden] [ref=e24]: "02"
              - text: Learn the method
            - button "Practise" [ref=e25] [cursor=pointer]:
              - generic [aria-hidden] [ref=e26]: "03"
              - text: Practice
            - button "Check" [ref=e27] [cursor=pointer]:
              - generic [aria-hidden] [ref=e28]: "04"
              - text: Check your understanding
            - button "Review" [ref=e29] [cursor=pointer]:
              - generic [aria-hidden] [ref=e30]: "05"
              - text: Review later
          - region "Current learning task" [ref=e31]:
            - generic [ref=e32]:
              - generic [ref=e33]: Task 26 of 35
              - generic [ref=e34]:
                - generic [ref=e35]: Choose a practice task
                - combobox "Choose a practice task" [ref=e36]:
                  - option "1. Distinguish red flame names"
                  - option "2. Read yellow correctly"
                  - option "3. Use orange-red"
                  - option "4. Separate two copper tests"
                  - option "5. Identify a blue solid"
                  - option "6. Keep iron(II) distinct"
                  - option "7. Keep iron(III) distinct"
                  - option "8. Use dissolution"
                  - option "9. Keep unresolved pairs"
                  - option "10. Match chloride conditions"
                  - option "11. Match bromide conditions"
                  - option "12. Match iodide conditions"
                  - option "13. Protect sulfate evidence"
                  - option "14. Require the gas result"
                  - option "15. Repair a false flame conclusion"
                  - option "16. Repair the chloride plan"
                  - option "17. Repair the sulfate plan"
                  - option "18. Keep fresh samples separate"
                  - option "19. Reject a premature identity"
                  - option "20. Keep observation and inference distinct"
                  - option "21. Construct magnesium coefficients"
                  - option "22. Construct aluminium coefficients"
                  - option "23. Use both ions and charges"
                  - option "24. Use calcium's second evidence"
                  - option "25. Leave the unknown anion unknown"
                  - option "26. Write a sequenced two-ion method" [selected]
                  - option "27. Write a balanced molecular equation"
                  - option "28. Explain the remaining pair"
                  - option "29. Construct iron(II) coefficients"
                  - option "30. Construct calcium coefficients"
                  - option "31. Combine copper and sulfate"
                  - option "32. Combine sodium and carbonate"
                  - option "33. Magnesium chloride"
                  - option "34. Initial aluminium precipitate"
                  - option "35. Calcium under supplied conditions"
            - heading "Write a sequenced two-ion method" [active] [level=2] [ref=e37]
            - paragraph [ref=e38]: A school technician must test a soluble suspected sodium iodide sample using a burner, clean wire, distilled water, dilute nitric acid and silver nitrate. Describe the two tests, their positive results and conclusions. This is an interpretation task, not instructions to try an experiment at home.
            - generic [ref=e40]:
              - generic [ref=e41]:
                - generic [ref=e42]:
                  - text: Your explanation
                  - textbox "Your explanation" [ref=e43]
                  - generic [ref=e44]: Write in your own words. Use the marking points for self-review when feedback appears.
                - button "Save and review explanation" [ref=e45] [cursor=pointer]
              - paragraph [ref=e46]: Try your own answer first. Use support if you need it.
              - generic [ref=e47]:
                - button "Give me a hint" [ref=e48] [cursor=pointer]
                - button "Next task →" [ref=e49] [cursor=pointer]
              - generic [ref=e50]:
                - button "← Previous task" [ref=e51] [cursor=pointer]
                - button "Clear answer" [ref=e52] [cursor=pointer]
            - group [ref=e53]:
              - generic "Why does this work?" [ref=e54] [cursor=pointer]
          - generic [ref=e55]:
            - group [ref=e56]:
              - generic "What am I learning?" [ref=e57] [cursor=pointer]
            - group [ref=e58]:
              - generic "How this lesson is checked" [ref=e59] [cursor=pointer]
          - generic [ref=e60]:
            - link "← All chemical analysis lessons" [ref=e61] [cursor=pointer]:
              - /url: /topics/analysis
            - 'link "Next: Instrumental analysis →" [ref=e62] [cursor=pointer]':
              - /url: /lessons/instrumental-analysis
      - contentinfo [ref=e63]:
        - generic [ref=e64]: Atelier Academy · Chemistry, understood.
        - generic [ref=e65]:
          - link "Privacy" [ref=e66] [cursor=pointer]:
            - /url: /privacy
          - link "Terms" [ref=e67] [cursor=pointer]:
            - /url: /terms
          - link "Accessibility" [ref=e68] [cursor=pointer]:
            - /url: /accessibility
  - alert [ref=e69]
```

# Test source

```ts
  1   | import { test, expect, devices, type Page } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import fs from "node:fs";
  4   | import path from "node:path";
  5   | import { ionTestsJourney as j } from "../src/content/journeys/ion-tests";
  6   | import {
  7   |   ionWritingGuided as g,
  8   |   ionWritingPractice as p,
  9   |   ionWritingChecks as c,
  10  |   ionWritingReviews as v,
  11  |   ionWritingRefresher as r,
  12  | } from "../src/content/journeys/ion-equation-writing";
  13  | import {
  14  |   emptyProgress,
  15  |   emptyWork,
  16  |   STORAGE_KEY,
  17  |   REVIEW_DELAY,
  18  |   exposureIds,
  19  | } from "../src/lib/progress";
  20  | const route = "/lessons/ion-tests",
  21  |   slug = "ion-tests";
  22  | const dir = path.join(process.cwd(), "test-results/qa/ion-equations");
  23  | async function saved(page: Page) {
  24  |   await expect
  25  |     .poll(() =>
  26  |       page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
  27  |     )
  28  |     .toBeNull();
  29  | }
  30  | async function ready(page: Page) {
  31  |   await page.evaluate(async () => {
  32  |     await document.fonts.ready;
  33  |     scrollTo(0, 0);
  34  |     await new Promise<void>((r) =>
  35  |       requestAnimationFrame(() => requestAnimationFrame(() => r())),
  36  |     );
  37  |   });
  38  | }
  39  | async function layout(page: Page, selector?: string) {
  40  |   await ready(page);
  41  |   const box = (await (
  42  |     selector
  43  |       ? page.locator(selector).first()
  44  |       : page.getByLabel("Your equations", { exact: true })
  45  |   ).boundingBox())!;
  46  |   fs.mkdirSync(dir, { recursive: true });
  47  |   fs.appendFileSync(
  48  |     path.join(dir, "geometry.jsonl"),
  49  |     JSON.stringify({
  50  |       viewport: page.viewportSize(),
  51  |       native: await page.evaluate(() => ({
  52  |         touch: navigator.maxTouchPoints > 0,
  53  |         dpr: devicePixelRatio,
  54  |       })),
  55  |       selector: selector ?? "Your equations",
  56  |       title: await page
  57  |         .locator(".sample-task-panel h2,.assessment-session h2")
  58  |         .first()
  59  |         .textContent(),
  60  |       height: box.height,
  61  |       bottom: box.y + box.height,
  62  |     }) + "\n",
  63  |   );
  64  |   for (const font of await page.locator("svg text").evaluateAll((nodes) =>
  65  |     nodes.map((node) => {
  66  |       const text = node as SVGTextElement,
  67  |         matrix = text.getScreenCTM();
  68  |       return (
  69  |         Number.parseFloat(getComputedStyle(text).fontSize) *
  70  |         (matrix ? Math.hypot(matrix.a, matrix.b) : 1)
  71  |       );
  72  |     }),
  73  |   ))
  74  |     expect(font).toBeGreaterThanOrEqual(12);
  75  |   expect(box.height).toBeGreaterThanOrEqual(44);
> 76  |   expect(box.y + box.height).toBeLessThanOrEqual(664);
      |                              ^ Error: expect(received).toBeLessThanOrEqual(expected)
  77  |   expect(
  78  |     await page.evaluate(
  79  |       () => document.documentElement.scrollWidth <= innerWidth,
  80  |     ),
  81  |   ).toBe(true);
  82  |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  83  | }
  84  | async function shot(page: Page, name: string) {
  85  |   await ready(page);
  86  |   await page.evaluate(() => {
  87  |     (document.activeElement as HTMLElement)?.blur();
  88  |     const nav = document.querySelector<HTMLElement>(".sample-stages"),
  89  |       active = nav?.querySelector<HTMLElement>('[aria-current="step"]');
  90  |     if (nav && active)
  91  |       nav.scrollLeft =
  92  |         active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  93  |     document.querySelector<HTMLElement>(".sidebar")?.scrollTo(0, 0);
  94  |   });
  95  |   fs.mkdirSync(dir, { recursive: true });
  96  |   // Capture the native viewport first: full-page capture can resize sticky
  97  |   // containers while collecting the taller image.
  98  |   await page.screenshot({
  99  |     path: path.join(dir, name + "-viewport.png"),
  100 |     fullPage: false,
  101 |     scale: "css",
  102 |   });
  103 |   await page.screenshot({
  104 |     path: path.join(dir, name + ".png"),
  105 |     fullPage: true,
  106 |     scale: "css",
  107 |   });
  108 | }
  109 | async function state(page: Page) {
  110 |   await saved(page);
  111 |   return page.evaluate(
  112 |     (key) => JSON.parse(localStorage.getItem(key)!).work["ion-tests"],
  113 |     STORAGE_KEY,
  114 |   );
  115 | }
  116 | async function practice(page: Page, index: number) {
  117 |   await page.getByRole("button", { name: "Practise", exact: true }).click();
  118 |   await page
  119 |     .getByLabel("Choose a practice task", { exact: true })
  120 |     .selectOption(String(index));
  121 | }
  122 | const malformed = "1..2 — {unfinished";
  123 | const wrong = "FeCl2(aq) + NaOH(aq) -> FeOH(s) + NaCl(aq)";
  124 | test("complete writing at fonts-ready320/390/1280 retains malformed drafts, recordable wrong chemistry and recovery", async ({
  125 |   page,
  126 | }, info) => {
  127 |   test.setTimeout(120000);
  128 |   for (const width of [320, 390, 1280]) {
  129 |     await page.setViewportSize({ width, height: 664 });
  130 |     await page.goto(route);
  131 |     await page.getByRole("button", { name: "Learn", exact: true }).click();
  132 |     await page
  133 |       .getByRole("button", { name: "Task 13", exact: true })
  134 |       .first()
  135 |       .click();
  136 |     await layout(page);
  137 |     const previousAttempts = (await state(page)).attempts[g.id];
  138 |     await page.getByLabel("Your equations", { exact: true }).fill(malformed);
  139 |     await page.locator(".sample-check-answer").click();
  140 |     await expect(page.locator(".question-panel .feedback")).toContainText(
  141 |       "incomplete syntax cannot be recorded",
  142 |     );
  143 |     await saved(page);
  144 |     await page.reload();
  145 |     await expect(
  146 |       page.getByLabel("Your equations", { exact: true }),
  147 |     ).toHaveValue(malformed);
  148 |     expect((await state(page)).attempts[g.id]).toEqual(previousAttempts);
  149 |     await page.getByLabel("Your equations", { exact: true }).fill(g.answer);
  150 |     await page.locator(".sample-check-answer").click();
  151 |     await expect(page.locator(".question-panel .feedback")).toContainText(
  152 |       "no automatic mark",
  153 |     );
  154 |     await shot(page, `${info.project.name}-guided-${width}`);
  155 |     await practice(page, 32);
  156 |     await layout(page);
  157 |     await page.getByLabel("Your equations", { exact: true }).fill(malformed);
  158 |     await saved(page);
  159 |     await page.reload();
  160 |     await expect(
  161 |       page.getByLabel("Your equations", { exact: true }),
  162 |     ).toHaveValue(malformed);
  163 |     await page.getByLabel("Your equations", { exact: true }).fill(wrong);
  164 |     await page.locator(".sample-check-answer").click();
  165 |     await expect(page.locator(".question-panel .feedback")).toContainText(
  166 |       "no automatic mark",
  167 |     );
  168 |     await saved(page);
  169 |     await page.reload();
  170 |     await expect(
  171 |       page.getByLabel("Your equations", { exact: true }),
  172 |     ).toHaveValue(wrong);
  173 |     await shot(page, `${info.project.name}-practice-wrong-${width}`);
  174 |     await page
  175 |       .getByRole("button", { name: "Revisit the key idea", exact: true })
  176 |       .click();
```
