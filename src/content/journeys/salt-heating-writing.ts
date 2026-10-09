import type { LearningTask, LessonJourney } from "../types";
import { choice } from "./helpers";

const id = (suffix: string) => `ss-v1-heating-${suffix}`;
const heaterAnswer =
  "In AQA's supervised soluble-salt preparation, gently heat the dilute acid in a beaker supported on tripod and gauze above a heatproof mat using a Bunsen burner. Switch the burner off before adding the insoluble oxide in small portions and stirring until some excess solid remains. Allow the reacting mixture to cool, then filter off the excess oxide. After filtration, concentrate the filtrate in an evaporating basin using a water bath or electric heater. Stop before complete dryness, allow crystallisation on cooling, recover the crystals and gently pat them dry. A Bunsen burner can heat the water bath; the distinction is the bath's controlled heating of the salt solution, not a ban on using a burner anywhere near evaporation.";
const heaterCriteria = [
  "Distinguish Bunsen heating of the dilute acid from water-bath/electric heating of the filtrate.",
  "Switch off the initial burner before adding and stirring the oxide; explain excess and filtration.",
  "Concentrate without complete dryness, cool to crystallise, recover and gently dry the crystals.",
];
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
    hint: "Match each heating device to its stage; retain the preparation's logical order.",
    conciseHeading: true,
  };
}
function methodAnswer(oxide: string, acid: string, salt: string) {
  return `Use ${oxide} and dilute ${acid} to make ${salt}. ${heaterAnswer} Excess insoluble ${oxide} consumes the acid and is retained by the filter; ${salt} remains dissolved in the filtrate. Drying surface liquid does not mean strongly heating hydrated crystals to remove their crystal water.`;
}
export function extendSaltHeating(j: LessonJourney) {
  const recovery: LearningTask = {
    ...choice(
      id("r-devices"),
      "Which pair matches AQA's soluble-salt practical?",
      "Bunsen: warm dilute acid; water bath/electric heater: concentrate filtrate",
      {
        "Filter paper: heat acid; Bunsen: dry all crystals strongly":
          "Filter paper separates or absorbs material; strong heating can alter hydrated crystals.",
        "Water bath: remove excess oxide; filter paper: evaporate water":
          "Excess insoluble oxide is filtered off. A heating device concentrates the filtrate.",
      },
      heaterAnswer,
      "Choose the heating stage before choosing its apparatus.",
      "Recover the two heating stages",
    ),
    title: "Match device to stage",
    conciseHeading: true,
  };
  j.refresher.push(recovery);
  j.guided.push({
    ...choice(
      id("g-devices"),
      "The acid is warmed; later the filtered salt solution is concentrated. Select the correct heating pair.",
      "Bunsen for acid; water bath/electric heater for filtrate",
      {
        "Direct strong flame until every drop of filtrate is gone":
          "The preparation concentrates the solution before cooling to crystallise; it does not drive it completely dry.",
        "Heat recovered crystals strongly instead of warming acid":
          "These are different stages. Strong heating can remove water of crystallisation from the intended hydrated crystals.",
      },
      heaterAnswer,
      "There are two heating stages with different purposes.",
      "Choose the practical heating pair",
    ),
    title: "Two heating stages",
    conciseHeading: true,
  });
  j.practice.push(
    {
      ...written(
        "p-copper",
        "Write the full preparation",
        "Plan a supervised preparation of pure, dry copper sulfate crystals from CuO and dilute acid. Name both heating arrangements and explain the sequence.",
        methodAnswer("copper(II) oxide", "sulfuric acid", "copper sulfate"),
        ["Choose copper(II) oxide and sulfuric acid.", ...heaterCriteria],
      ),
      followUp: recovery.id,
    },
    {
      ...written(
        "p-bath",
        "Explain the bath",
        "A burner heats the water bath under an evaporating basin. Sam says no Bunsen burner is allowed during evaporation. Explain why Sam is wrong and when to stop heating.",
        "The burner heats the water bath, which gently heats the filtrate in the basin. This is water-bath evaporation, not direct strong heating of the salt solution to dryness. Stop concentration before all solvent disappears, then allow crystals to form on cooling. Recover and gently dry the crystals; strong heating is not a substitute for cooling or removal of surface liquid.",
        [
          "Explain that a burner can supply heat to the water bath.",
          "Distinguish gentle bath heating from directly driving the salt solution completely dry.",
          "Stop concentration, cool to crystallise, then recover and gently dry.",
        ],
      ),
      followUp: recovery.id,
    },
  );
  j.checkForms.push(
    [
      written(
        "ca-magnesium",
        "Plan magnesium sulfate",
        "Make pure, dry magnesium sulfate crystals from supplied insoluble MgO and dilute acid. Write the supervised method, including both heating arrangements and each separation stage.",
        methodAnswer("magnesium oxide", "sulfuric acid", "magnesium sulfate"),
        ["Choose MgO and sulfuric acid.", ...heaterCriteria],
      ),
    ],
    [
      written(
        "cb-repair",
        "Repair the preparation",
        "A copper sulfate plan adds CuO to cold sulfuric acid, filters, then drives the filtrate completely dry over a strong flame. Rewrite the supervised heating and separation sequence to obtain crystals.",
        methodAnswer("copper(II) oxide", "sulfuric acid", "copper sulfate"),
        [
          "Warm the dilute sulfuric acid first; retain CuO as the supplied insoluble reactant.",
          ...heaterCriteria,
        ],
      ),
    ],
  );
  j.reviewForms.push(
    [
      written(
        "ra-stages",
        "Retrieve the heating distinction",
        "For a supervised oxide-to-soluble-salt preparation, explain the two heating stages. Can a Bunsen burner heat the water bath? Explain the filtration, crystallisation and drying order.",
        heaterAnswer,
        [
          ...heaterCriteria,
          "Allow a Bunsen-heated water bath; do not invent a blanket burner ban.",
        ],
      ),
    ],
    [
      written(
        "rb-zinc-sulfate",
        "Retrieve a changed salt",
        "Supplied ZnO is insoluble; zinc sulfate is soluble and its concentrated solution forms crystals on cooling. Write a supervised preparation, including reagents, both heating stages, separation and gentle drying.",
        methodAnswer("zinc oxide", "sulfuric acid", "zinc sulfate"),
        ["Choose zinc oxide and sulfuric acid.", ...heaterCriteria],
      ),
    ],
  );
  const added = [
    ...j.refresher,
    ...j.guided,
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ].filter((q) => q.id.startsWith("ss-v1-heating-"));
  const family = [...added.map((q) => q.id), "ss-v1-p-method-write"];
  for (const q of added)
    q.exposureAliases = family.filter((other) => other !== q.id);
}
