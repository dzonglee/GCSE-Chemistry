import { test, expect } from "@playwright/test";
import { ocrPaper1FoundationFull as paper } from "../src/content/ocr-paper1-foundation-full";
import { fullPapers } from "../src/content/full-assessments";
import { questionById } from "../src/content/curriculum";
import { mark, displayResponse } from "../src/lib/marking";
import { reviewPart, paperReviewKey } from "../src/lib/exam-paper-review";
import { exposureIds, type Response } from "../src/lib/progress";
import { chromaGivenSources } from "../src/lib/chromatography-givens";
import { drawingLevels } from "../src/lib/reaction-profiles";
import { execFileSync } from "node:child_process";
const part = (number: string) => paper.parts.find((p) => p.number === number)!;
const response = (answer: string): Response => ({
  answer,
  correct: false,
  fresh: true,
  helped: false,
  at: 2,
});

test("submitted electron diagrams show actual errors without entry forms or invented replacements", () => {
  // Real React rendering needs Node; Playwright transforms JSX into test descriptors.
  const records: { number: string; html: string; bad: string[] }[] = JSON.parse(
    execFileSync(
      process.execPath,
      [
        "-e",
        String.raw`
    const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
    const root=process.cwd(),resolve=Module._resolveFilename;
    Module._resolveFilename=function(request,...args){return resolve.call(this,request.startsWith('@/')?path.join(root,'src',request.slice(2)):request,...args)};
    for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
    const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{PaperDrawingReview}=require('./src/components/PaperDrawingReview.tsx'),{ocrPaper1FoundationFull:paper}=require('./src/content/ocr-paper1-foundation-full.ts');
    const rows=['17(a)','17(b)'].map(number=>{
      const p=paper.parts.find(p=>p.number===number),wrong=JSON.parse(p.referenceConstruction);
      if(number==='17(a)')wrong.unsharedCentre='0';else{wrong.charge='-1';wrong.brackets='0'}
      const render=value=>renderToStaticMarkup(React.createElement(PaperDrawingReview,{question:p.question,value,contextLabel:'Retained test response'}));
      return {number,html:render(JSON.stringify(wrong)),bad:['{broken','null','[]','{}',JSON.stringify({...wrong,[number==='17(a)'?'unsharedCentre':'dots']:' '})].map(render)};
    });
    process.stdout.write(JSON.stringify(rows));
  `,
      ],
      { encoding: "utf8" },
    ),
  );
  for (const { number, html, bad } of records) {
    expect(html).toContain("Retained test response");
    expect(html).toContain("<svg");
    expect(html).not.toMatch(/<(input|select|textarea|button)\b/);
    if (number === "17(b)") {
      expect(html).toContain('data-charge="-1"');
      expect(html).toContain('data-brackets="false"');
    }
    for (const malformed of bad) {
      expect(malformed).not.toContain("<svg");
      expect(malformed).toContain("original response is retained");
    }
  }
});

test("Gateway01 uses its own two-section90-mark component and current Foundation boundaries", () => {
  expect(paper.basis).toMatchObject({
    board: "OCR",
    qualification: "Gateway Science A J248",
    component: "J248/01",
  });
  expect([paper.totalMarks, paper.minutes, paper.parts.length]).toEqual([
    90, 105, 47,
  ]);
  expect(paper.parts.slice(0, 15).reduce((s, p) => s + p.marks, 0)).toBe(15);
  expect(paper.parts.slice(15).reduce((s, p) => s + p.marks, 0)).toBe(75);
  expect(
    [0, 1, 2].map((i) => paper.parts.reduce((s, p) => s + p.ao[i], 0)),
  ).toEqual([36, 36, 18]);
  expect(
    paper.parts.filter((p) => p.mathematics).reduce((s, p) => s + p.marks, 0),
  ).toBe(24);
  expect(paper.parts.reduce((s, p) => s + (p.practical ?? 0), 0)).toBe(20);
  const ids = fullPapers.flatMap((p) => p.questions.map((q) => q.id));
  expect(new Set(ids).size).toBe(ids.length);
  for (const p of paper.parts) {
    expect(p.question.tier).toBe("foundation");
    expect(questionById(p.question.id)).toBe(p.question);
    expect(
      p.ao.reduce((s, n) => s + n, 0),
      p.number,
    ).toBe(p.marks);
    if (!p.levels)
      expect(p.criteria.reduce((s, c) => s + c.marks, p.automaticMarks)).toBe(
        p.marks,
      );
    for (const clause of p.specification) {
      expect(/^(C[1237]|CM[123]|WS)/.test(clause), clause).toBe(true);
      expect([
        "C3.1e",
        "C3.1g",
        "C3.1h",
        "C3.1k",
        "C3.1l",
        "C3.2d",
        "C3.3b",
        "C3.3g",
        "C3.3i",
        "C3.3j",
      ]).not.toContain(clause);
      expect(/^C1\.2[fg]/.test(clause)).toBe(false);
    }
  }
  expect(part("19(a)").levels?.map((l) => [l.min, l.max])).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
  ]);
  expect(part("19(a)").criteria).toHaveLength(0);
});

test("Section A single choices earn exactly15 automatic points and no method credit", () => {
  for (const p of paper.parts.slice(0, 15)) {
    expect(p.question.options).toHaveLength(4);
    expect(new Set(p.question.options).size).toBe(4);
    expect(
      p.question.options!.filter((o) => o === p.question.answer),
    ).toHaveLength(1);
    const correct = reviewPart(p, response(p.question.answer), {}, 1);
    expect([correct.pending, correct.marks]).toEqual([false, 1]);
    for (const wrong of p.question.options!.filter(
      (o) => o !== p.question.answer,
    ))
      expect(reviewPart(p, response(wrong), {}, 1).marks).toBe(0);
    expect(mark(p.question, "unrecognised choice").correct).toBe(false);
  }
  expect(paper.parts.slice(15).every((p) => p.automaticMarks === 0)).toBe(true);
});

test("independent arithmetic measures from the origin, honours brackets and conserves the boundary", () => {
  const c = chromaGivenSources.ocr1fOrigin;
  const rf = (c.lanes[0].centres[0] - c.origin) / (c.front! - c.origin);
  expect(rf).toBe(0.6);
  expect(c.lanes[0].centres[0] / c.front!).not.toBeCloseTo(rf, 2);
  const calculations: Record<string, number> = {
    "18(c)": rf,
    "18(f)": (3.6 / 12) * 25,
    "19(b)": 24 + 2 * (14 + 3 * 16),
    "20(a)": 23.4 - 16.8,
    "22(b)": (6 * 20 ** 2) / 20 ** 3,
  };
  for (const [number, value] of Object.entries(calculations))
    expect(Number(part(number).question.answer), number).toBeCloseTo(value, 10);
  expect(mark(part("18(c)").question, "0.60").correct).toBe(true);
  expect(mark(part("18(c)").question, "0.6").correct).toBe(false);
  expect(84.65 - 83.37).toBeCloseTo(1.28, 10);
  expect(part("21(e)").question.answer).toContain("1.28");
  // A later question must not disclose the earlier numerical result.
  expect(part("18(e)").question.prompt).toContain("V, P and Q");
  expect(part("18(e)").question.prompt).not.toContain("0.60");
});

test("three reference constructions obey electron inventories and relative energy differences", () => {
  const n = JSON.parse(part("17(a)").referenceConstruction!);
  expect(
    Number(n.unsharedCentre) +
      [0, 1, 2].reduce((s, i) => s + Number(n[`centre${i}`]), 0),
  ).toBe(5);
  for (const i of [0, 1, 2]) {
    expect(Number(n[`centre${i}`]) + Number(n[`partner${i}`])).toBe(2);
    expect(Number(n[`partner${i}`]) + Number(n[`unsharedPartner${i}`])).toBe(1);
  }
  const o = JSON.parse(part("17(b)").referenceConstruction!);
  expect(Number(o.dots) + Number(o.crosses)).toBe(8);
  expect(Number(o.crosses)).toBe(-Number(o.charge));
  const potassiumElectrons = [2, 8, 8].reduce((sum, n) => sum + n, 0);
  expect(19 - potassiumElectrons).toBe(1);
  expect(2 * (19 - potassiumElectrons) + Number(o.charge)).toBe(0);
  expect(part("17(b)").question.explanation).toContain("2,8,8");
  expect(part("17(b)").criteria[2].text).toContain("In Working");
  const e = drawingLevels(JSON.parse(part("20(c)").referenceConstruction!))!;
  expect(e.product - e.reactant).toBe(25);
  expect(e.peak - e.reactant).toBe(50);
  for (const number of ["17(a)", "17(b)", "20(c)"]) {
    const p = part(number);
    expect(mark(p.question, p.referenceConstruction!).correct, number).toBe(
      true,
    );
    expect(mark(p.question, "{broken").invalid, number).toBe(true);
    expect(
      reviewPart(p, response(p.referenceConstruction!), {}, 1).pending,
    ).toBe(true);
  }
});

test("valid wrong drawings and partial working retain manual decisions rather than earning inferred method marks", () => {
  const wrongDrawings = {
    "17(a)": {
      ...JSON.parse(part("17(a)").referenceConstruction!),
      unsharedCentre: "0",
    },
    "17(b)": {
      ...JSON.parse(part("17(b)").referenceConstruction!),
      charge: "-1",
      brackets: "0",
    },
    "20(c)": {
      ...JSON.parse(part("20(c)").referenceConstruction!),
      product: "15",
      peak: "50",
    },
  };
  for (const [number, drawing] of Object.entries(wrongDrawings)) {
    const p = part(number),
      raw = JSON.stringify(drawing);
    expect(mark(p.question, raw).invalid).not.toBe(true);
    expect(mark(p.question, raw).correct).toBe(false);
    const drafts = Object.fromEntries(
      p.criteria.map((c, i) => [
        paperReviewKey(1, p.question.id, c.id),
        String(
          (
            number === "17(a)"
              ? i === 0 || i === 2
              : i === (number === "20(c)" ? 2 : 0)
          )
            ? c.marks
            : 0,
        ),
      ]),
    );
    const r = reviewPart(p, response(raw), drafts, 1);
    expect([r.pending, r.automatic, r.marks]).toEqual([
      false,
      0,
      number === "17(a)" ? 2 : 1,
    ]);
    expect(displayResponse(p.question, raw)).not.toBe(raw);
  }
  const p = part("19(a)"),
    r = response(
      "React the oxide with sulfuric acid. Filter off solid excess, collecting magnesium sulfate solution.",
    );
  expect(mark(p.question, r.answer).selfReview).toBe(true);
  expect(reviewPart(p, r, {}, 1).pending).toBe(true);
  expect(
    reviewPart(
      p,
      r,
      { [paperReviewKey(1, p.question.id, "whole-response")]: "2" },
      1,
    ).marks,
  ).toBe(2);
});

test("compared earlier disclosures propagate both directions and new numeric cases retain separate identities", () => {
  for (const p of paper.parts)
    for (const id of p.question.exposureAliases ?? []) {
      expect(questionById(id), id).toBeDefined();
      expect(exposureIds([p.question.id])).toContain(id);
      expect(exposureIds([id])).toContain(p.question.id);
    }
  expect(exposureIds([part("17(b)").question.id])).toContain(
    "ib-v1-p-draw-oxide",
  );
  expect(exposureIds([part("19(b)").question.id])).toContain(
    "chem-p1f-full-v1-05b",
  );
  for (const number of [
    "16(a)",
    "18(c)",
    "18(f)",
    "20(a)",
    "20(c)",
    "21(e)",
    "22(b)",
  ])
    expect(part(number).question.exposureAliases).toBeUndefined();
});
