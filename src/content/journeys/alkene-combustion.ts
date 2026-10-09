import type { LearningTask, LessonJourney } from "../types";
import { choice } from "./helpers";

const id = (suffix: string) => `path-comb-v1-${suffix}`;
const burning =
  "Alkenes are hydrocarbons and burn in oxygen. Complete combustion produces carbon dioxide and water: carbon enters CO2 and hydrogen enters H2O. In air, alkenes tend to burn with smoky flames because combustion can be incomplete, producing carbon particles (soot). Restricted oxygen can also cause incomplete combustion of an alkane. The tendency is not a claim that every alkene flame is smoky, and soot alone does not identify a C=C bond. Carbon monoxide may also occur in incomplete combustion; visible smoke cannot establish its amount or absence.";
function written(
  suffix: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): LearningTask {
  return {
    id: id(suffix),
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    referenceResponse: answer,
    rubric,
    hint: "Separate the stated oxygen conditions, combustion products and identification evidence.",
    conciseHeading: true,
  };
}
function coefficients(
  suffix: string,
  title: string,
  formula: string,
  values: [number, number, number, number],
  explanation: string,
): LearningTask {
  const parts = [
    {
      id: "fuel",
      label: formula,
      answer: values[0],
      inputMode: "numeric" as const,
    },
    {
      id: "oxygen",
      label: "O₂",
      answer: values[1],
      inputMode: "numeric" as const,
    },
    {
      id: "carbonDioxide",
      label: "CO₂",
      answer: values[2],
      inputMode: "numeric" as const,
    },
    {
      id: "water",
      label: "H₂O",
      answer: values[3],
      inputMode: "numeric" as const,
    },
  ];
  return {
    id: id(suffix),
    title,
    purpose: title,
    prompt: `Complete combustion: ${formula} + O₂ → CO₂ + H₂O. Enter the smallest positive whole-number coefficients; keep every formula unchanged.`,
    parts,
    partLegend: "Equation coefficients",
    answer: JSON.stringify(
      Object.fromEntries(parts.map((p) => [p.id, String(p.answer)])),
    ),
    explanation,
    hint: "Balance carbon, then hydrogen, then oxygen. Scale the whole equation if oxygen requires a fraction.",
    conciseHeading: true,
  };
}
export function extendAlkeneCombustion(
  j: LessonJourney,
  recovery: Record<string, string[]>,
) {
  const r: LearningTask = {
    ...choice(
      id("r-products"),
      "An alkene undergoes complete combustion. Which product pair forms?",
      "Carbon dioxide and water",
      {
        "An alcohol only":
          "Adding steam to C=C is hydration; burning in oxygen is a different reaction.",
        "Carbon and hydrogen only":
          "These are not the products of complete hydrocarbon combustion.",
      },
      burning,
      "Use the carbon and hydrogen in a hydrocarbon.",
      "Retrieve alkene combustion",
    ),
    title: "Burning an alkene",
    conciseHeading: true,
  };
  j.refresher.push(r);
  j.guided.push({
    ...choice(
      id("g-smoke"),
      "Alkenes tend to burn with smoky flames in air. Why can carbon soot form?",
      "Incomplete combustion produces carbon particles",
      {
        "Complete combustion produces soot":
          "Complete alkene combustion produces carbon dioxide and water. Carbon soot comes from incomplete combustion.",
        "Every alkene molecule contains oxygen":
          "An alkene hydrocarbon contains carbon and hydrogen; oxygen comes from the reacting supply.",
      },
      burning,
      "Connect the stated carbon particles with incomplete combustion.",
      "Explain the smoky-flame tendency",
    ),
    title: "Why the flame can be smoky",
    conciseHeading: true,
  });
  const equation = coefficients(
    "p-ethene",
    "Balance complete combustion",
    "C₂H₄",
    [1, 3, 2, 2],
    "C₂H₄ + 3O₂ → 2CO₂ + 2H₂O. Each side contains 2 C, 4 H and 6 O atoms. Change coefficients rather than formula subscripts; these are the smallest positive whole-number coefficients.",
  );
  const explanation = written(
    "p-explain",
    "Explain burning and smoke",
    "Explain how ethene reacts on complete combustion. Why can an alkene burning in air give a smoky flame, and why does this not mean it always does?",
    burning,
    [
      "Name oxygen as the reacting supply and carbon dioxide plus water as complete-combustion products.",
      "Link the smoky-flame tendency in air to incomplete combustion and carbon particles.",
      "Keep the tendency conditional; sufficient oxygen and suitable complete-combustion conditions give the stated complete products.",
    ],
  );
  j.practice.push(equation, explanation);
  for (const q of [equation, explanation]) {
    q.followUp = r.id;
    recovery[q.id] = [r.id];
  }
  j.practiceGroups?.push({
    label: "Combustion products and flame evidence",
    taskIds: [equation.id, explanation.id],
  });
  j.checkForms.push(
    [
      written(
        "ca-claims",
        "Correct the reaction claims",
        "Propene undergoes complete combustion. Sam expects propane because alkenes usually add hydrogen, and claims every alkene flame is smoky. Correct both claims and name the actual products.",
        "Combustion reacts propene with oxygen and produces carbon dioxide and water under the stated complete conditions. Hydrogenation uses hydrogen to make propane and is a different reaction. Alkenes tend to give smoky flames in air when combustion is incomplete and carbon particles form; this does not say every alkene flame must be smoky. The stated complete combustion is not that incomplete case.",
        [
          "Distinguish oxygen combustion from hydrogen addition producing propane.",
          "Name carbon dioxide and water for the stated complete combustion.",
          "Explain the conditional smoky-flame tendency through incomplete combustion and carbon particles.",
        ],
      ),
    ],
    [
      coefficients(
        "cb-propene",
        "Construct a changed equation",
        "C₃H₆",
        [2, 9, 6, 6],
        "2C₃H₆ + 9O₂ → 6CO₂ + 6H₂O. Each side contains 6 C, 12 H and 18 O atoms. One propene would require 4.5 O₂; multiplying every coefficient by 2 gives the requested smallest positive whole-number coefficients without changing any formula.",
      ),
    ],
  );
  j.reviewForms.push(
    [
      {
        ...choice(
          id("ra-products"),
          "Butene undergoes complete combustion. Which products are expected?",
          "Carbon dioxide and water",
          {
            "Butane only":
              "That would come from hydrogen addition, not complete oxygen combustion.",
            "Carbon and hydrogen only":
              "Complete combustion converts hydrocarbon carbon to CO2 and hydrogen to H2O.",
          },
          burning,
          "Retrieve the complete hydrocarbon-combustion products.",
          "Retrieve a changed alkene",
        ),
        title: "Retrieve combustion products",
        conciseHeading: true,
      },
    ],
    [
      written(
        "rb-identity",
        "Smoke and identification",
        "A supplied hydrocarbon is either an ordinary alkane or alkene. It burns smokily with restricted air. Does that identify the class? Give a suitable test, its positive change and a limit.",
        "Restricted air can cause incomplete combustion of either class, producing carbon soot. Smoke alone does not establish a C=C bond. Use a separate ordinary bromine-water test with suitable reference/control evidence: an alkene changes orange bromine water to colourless, whereas the ordinary alkane does not under those test conditions. Within the supplied two-class comparison this supports an alkene, but does not identify its exact molecule or establish purity. Smoke does not measure carbon monoxide or establish its absence.",
        [
          "Explain why incomplete combustion and soot do not uniquely identify an alkene.",
          "Name bromine water and the orange-to-colourless alkene change under the stated ordinary test conditions.",
          "Limit identification to the supplied comparison; do not infer exact identity, purity or carbon-monoxide absence from smoke.",
        ],
      ),
    ],
  );
  const added = [
    ...j.refresher,
    ...j.guided,
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ].filter((q) => q.id.startsWith("path-comb-v1-"));
  const related = [
    ...added.map((q) => q.id),
    "alk-v1-a-balance",
    "alk-v1-b-balance",
    "alk-v1-a-limited",
    "alk-v1-b-limited",
    "alk-v1-a-explain",
  ];
  for (const q of added) q.exposureAliases = related.filter((x) => x !== q.id);
  j.outcomes?.push(
    "Predict complete alkene-combustion products, balance a supplied equation and explain the conditional smoky-flame tendency.",
  );
  j.scopeNote +=
    " The individual combustion follow-up explicitly covers AQA8462 4.7.2.2: complete hydrocarbon products and the tendency towards smoky flames in air because of incomplete combustion. Flame appearance is qualified evidence, distinct from the ordinary bromine-water alkene test.";
}
