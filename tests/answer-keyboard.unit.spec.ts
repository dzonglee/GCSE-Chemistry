import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";

const cases = [
  ["greenhouse-v1-r-loss", "-6"],
  ["greenhouse-v1-p-loss", "-8"],
  ["greenhouse-v1-vB-loss", "-5"],
  ["climate-v1-r-cooling", "-0.3"],
  ["cycle-v1-w-net", "-3"],
  ["cycle-v1-r-source", "-3"],
  ["cycle-v1-r-seasonDown", "-2"],
  ["cycle-v1-cB-endpoints", "-4"],
  ["water-v1-r-heatReuse", "-2"],
  ["lca-v1-r-signed", "-60"],
];
let rendered: Record<string, string>;
test.beforeAll(() => {
  // Playwright transforms JSX into component-test descriptors. Render the real
  // React output in a separate Node process with TypeScript's React JSX runtime.
  const requests = [
    ...cases,
    ["rm-v1-cb-working", JSON.stringify({ requested: "0.3", mass: "5.1" })],
    ...["-1220", "1220", "1..2", "1e3", "1/2", ""].map((value) => [
      "bond-v1-b-change",
      value,
    ]),
    ["greenhouse-v1-cB-ledger", JSON.stringify({ absorbed: "999", net: "12" })],
    [
      "greenhouse-v1-cB-ledger",
      JSON.stringify({ absorbed: "999", net: "12" }),
      true,
    ],
  ];
  rendered = JSON.parse(
    execFileSync(
      process.execPath,
      [
        "-e",
        String.raw`
          const fs = require('node:fs'), path = require('node:path');
          const ts = require('typescript'), Module = require('node:module');
          const root = process.cwd(), resolve = Module._resolveFilename;
          Module._resolveFilename = function(request, ...args) {
            return resolve.call(this, request.startsWith('@/')
              ? path.join(root, 'src', request.slice(2)) : request, ...args);
          };
          for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => {
            module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
              compilerOptions: { module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
            }).outputText, file);
          };
          const React = require('react');
          const { renderToStaticMarkup } = require('react-dom/server');
          const { QuestionInput } = require('./src/components/QuestionInput.tsx');
          const { questionById } = require('./src/content/curriculum.ts');
          const output = {};
          for (const [id, value, compactAssessment] of JSON.parse(process.argv[1])) {
            const question = questionById(id);
            if (!question) throw Error('Missing original task: ' + id);
            const html = renderToStaticMarkup(React.createElement(QuestionInput,
              { question, value, compactAssessment, onChange: () => {} }));
            output[id + '\0' + value + (compactAssessment ? ':assessment' : '')] = html;
          }
          process.stdout.write(JSON.stringify(output));
        `,
        JSON.stringify(requests),
      ],
      { encoding: "utf8" },
    ),
  );
});

function inputs(id: string, value: string) {
  const html = rendered[id + "\0" + value];
  expect(html, id).toBeTruthy();
  return html.match(/<input\b[^>]*>/g)!;
}

test("actual signed climate, carbon, water and recycling responses request a keyboard with minus and decimal characters", () => {
  for (const [id, value] of cases) {
    const input = inputs(id, value)[0];
    expect(input, id).toContain('inputMode="text"');
    expect(input, id).toContain(`value="${value}"`);
  }
});

test("an unsubmitted cumulative energy proposal retains its raw values without giving scientific correction", () => {
  const key =
    "greenhouse-v1-cB-ledger\0" +
    JSON.stringify({ absorbed: "999", net: "12" });
  expect(rendered[key]).toContain("outside the supplied incoming total");
  expect(rendered[key + ":assessment"]).not.toContain(
    "outside the supplied incoming total",
  );
  expect(rendered[key + ":assessment"]).toContain('value="999"');
});

test("multipart mol and mass responses retain decimals and request text without revealing the expected sign", () => {
  const value = JSON.stringify({ requested: "0.3", mass: "5.1" });
  const fields = inputs("rm-v1-cb-working", value);
  expect(fields).toHaveLength(2);
  expect(fields[0]).toContain('value="0.3"');
  expect(fields[1]).toContain('value="5.1"');
  for (const field of fields) expect(field).toContain('inputMode="text"');
  for (const value of ["-1220", "1220", "1..2", "1e3", "1/2", ""]) {
    const field = inputs("bond-v1-b-change", value)[0];
    expect(field).toContain('inputMode="text"');
    expect(field).toContain(`value="${value}"`);
  }
});
