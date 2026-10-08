import type { LearningTask, LessonJourney } from "../types";
import {
  separationRecords,
  type SeparationGiven,
} from "../../lib/separation-investigation";
const id = (s: string) => "separation-practical-v1-" + s;
function choice(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  record?: string,
  given?: SeparationGiven,
): LearningTask {
  const options = [answer, ...Object.keys(errors)],
    n = [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % options.length;
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(n), ...options.slice(0, n)],
    misconceptions: errors,
    explanation,
    hint,
    ...(record
      ? {
          model: {
            kind: "separation-investigation" as const,
            mode: separationRecords[record].mode,
            record,
          },
        }
      : {}),
    ...(given ? { separationGiven: given } : {}),
  };
}
function numeric(
  s: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  given?: SeparationGiven,
  record?: string,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: String(answer),
    inputMode: "decimal",
    tolerance: 0.000001,
    unit,
    explanation,
    hint,
    ...(given ? { separationGiven: given } : {}),
    ...(record
      ? {
          model: {
            kind: "separation-investigation" as const,
            mode: separationRecords[record].mode,
            record,
          },
        }
      : {}),
  };
}
function written(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
  given?: SeparationGiven,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    rubric,
    hint,
    ...(given ? { separationGiven: given } : {}),
  };
}
function supplied(record: string): SeparationGiven {
  const r = separationRecords[record];
  return { title: r.title, note: r.note, ...(r.rows ? { rows: r.rows } : {}) };
}
const warmup = [
  choice(
    "w-dissolved",
    "Recall a solution",
    "Ordinary filter paper is used on salt solution. Where does the dissolved salt go?",
    "Through with the solvent",
    {
      "On the filter as a solid": "Dissolved salt is not an insoluble solid.",
      "It reacts to form sand": "Filtration forms no new substance.",
    },
    "Ordinary filtration cannot remove dissolved salt from water.",
    "Distinguish dissolved material from an insoluble solid.",
  ),
  choice(
    "w-change",
    "Physical or chemical?",
    "Dissolving salt and recovering it by crystallisation is primarily what kind of change?",
    "Physical",
    {
      "Chemical reaction": "These stages do not form a new substance.",
      "Nuclear change": "Atomic nuclei do not change.",
    },
    "The mixture's components retain their chemical identity.",
    "Ask whether a new substance forms.",
  ),
  numeric(
    "w-subtract",
    "Recall tare subtraction",
    "A vessel weighs 10.00 g; vessel plus sample weighs 13.50 g. What is the sample mass?",
    3.5,
    "g",
    "13.50 − 10.00 = 3.50 g.",
    "Subtract the empty vessel mass.",
  ),
  numeric(
    "w-ratio",
    "Recall a ratio",
    "A dye centre moves 2.0 cm from the origin and the solvent front moves 8.0 cm. Calculate Rf.",
    0.25,
    "",
    "2.0 ÷ 8.0 = 0.25; Rf has no unit.",
    "Use distances from the same origin, dye divided by front.",
  ),
];
const refresher = [
  choice(
    "r-target",
    "Start with the target",
    "Which plan can recover water from salt solution?",
    "Vaporise, then condense and collect",
    {
      "Let all vapour escape": "That removes water without collecting it.",
      "Filter ordinary salt solution":
        "Dissolved salt passes through filter paper.",
    },
    separationRecords["water-route"].feedback,
    "Follow the desired product through the stages.",
    "water-route",
  ),
  choice(
    "r-salt",
    "Recover the soluble product",
    "Which fraction should be concentrated to obtain salt crystals after filtering sand and salt solution?",
    "The filtrate",
    {
      "The sand residue": "This is the insoluble product.",
      "The filter paper alone": "The dissolved salt passed through it.",
    },
    separationRecords["salt-fractions"].feedback,
    "Where is the dissolved salt?",
    "salt-fractions",
  ),
  choice(
    "r-sand",
    "Recover the insoluble product",
    "Why wash the sand residue before drying it?",
    "To remove adhering salt solution",
    {
      "To create more sand": "No new sand is formed.",
      "To dissolve the sand": "Sand is insoluble in the stated system.",
    },
    separationRecords["sand-route"].feedback,
    "Consider the liquid still wetting the solid.",
    "sand-route",
  ),
  numeric(
    "r-recovery",
    "Use net mass",
    "Calculate recovery from the supplied dry-crystal weighings.",
    80,
    "%",
    separationRecords["dry-recovery"].feedback,
    "Subtract the dish, then divide by the starting salt mass and multiply by 100.",
    supplied("dry-recovery"),
    "dry-recovery",
  ),
  choice(
    "r-wet",
    "Interpret added water",
    "What can an apparent recovery above 100% suggest?",
    "Retained water or contamination",
    {
      "Extra salt was created by filtration":
        "Physical separation creates no new salt.",
      "The balance proves purity": "Mass alone cannot prove purity.",
    },
    separationRecords["wet-recovery"].feedback,
    "Ask what else contributes to the measured mass.",
    "wet-recovery",
  ),
  choice(
    "r-origin",
    "Repair the origin",
    "Which initial setup keeps the sample out of the solvent pool?",
    "Pencil origin above the solvent",
    {
      "Ink origin under the solvent":
        "Ink can dissolve; the sample may wash off.",
      "Pencil origin under the solvent":
        "The sample can dissolve into the pool.",
    },
    separationRecords["setup-repair"].feedback,
    "Distinguish paper dipping into water from the spot being submerged.",
    "setup-repair",
  ),
  choice(
    "r-paper",
    "Control a comparison",
    "To investigate paper type with the same dye, which variable should remain constant?",
    "Solvent",
    {
      "Change solvent too": "That confounds the effect of paper type.",
      "Change dye too": "A different dye can have different interactions.",
    },
    separationRecords["paper-comparison"].feedback,
    "Change one intended variable.",
    "paper-comparison",
  ),
  choice(
    "r-purity",
    "Use limited evidence",
    "One visible spot in one solvent establishes what?",
    "One resolved visible component under those conditions",
    {
      "Every substance present is identified":
        "Colourless or co-migrating components may be missed.",
      "The sample must be pure in all solvents":
        "The evidence is limited to this run.",
    },
    separationRecords["spot-limit"].feedback,
    "Distinguish what was detected from everything that might be present.",
    "spot-limit",
  ),
];
const guided = [
  choice(
    "g-salt",
    "Plan a route",
    "Plan for dry salt crystals.",
    "Dissolve → filter → concentrate and crystallise",
    {
      "Filter the dry mixture → collect sand":
        "This does not recover dissolved salt.",
      "Dissolve → filter → let water escape only":
        "The final product and collection step must be specified.",
    },
    separationRecords["salt-route"].feedback,
    "Track the salt through solution and filtrate.",
    "salt-route",
  ),
  choice(
    "g-water",
    "Change the target",
    "Choose the route that collects water from the stated mixture.",
    "Filter → vaporise solvent → condense and collect",
    {
      "Filter → cool the sand": "That does not collect water.",
      "Filter → evaporate and discard vapour":
        "Escaping vapour is not recovered solvent.",
    },
    separationRecords["water-route"].feedback,
    "The condenser must lead to a collection vessel.",
    "water-route",
  ),
  choice(
    "g-fractions",
    "Track both products",
    "After ordinary filtration, which pair describes residue and filtrate?",
    "Sand; salt solution",
    {
      "Salt; pure water": "Dissolved salt passes through.",
      "Sand; dry salt": "The filtrate is still liquid solution.",
    },
    separationRecords["sand-fractions"].feedback,
    "Read each stream separately.",
    "sand-fractions",
  ),
  numeric(
    "g-dry",
    "Calculate recovery",
    "What percentage of the starting salt is recovered in the supplied dry sample?",
    80,
    "%",
    separationRecords["dry-recovery"].feedback,
    "Remove the tare before calculating the fraction.",
    undefined,
    "dry-recovery",
  ),
  numeric(
    "g-wet",
    "Keep the surprising result",
    "Calculate the apparent recovery of the undried crystals.",
    115,
    "%",
    separationRecords["wet-recovery"].feedback,
    "Use the actual weighings; do not cap the result at 100%.",
    undefined,
    "wet-recovery",
  ),
  choice(
    "g-setup",
    "Repair apparatus decisions",
    "Which combination repairs the proposed chromatography run?",
    "Pencil; origin above solvent; mark front before evaporation",
    {
      "Ink; origin above solvent; mark after drying":
        "Ink can move; front position can disappear.",
      "Pencil; origin below solvent; mark immediately":
        "The sample can wash into the solvent pool.",
    },
    separationRecords["setup-repair"].feedback,
    "Check line material, solvent level and measurement timing separately.",
    "setup-repair",
  ),
  choice(
    "g-paper",
    "Explain a comparison",
    "Paper A gives lower Rf than B with the same dye and solvent. Which explanation fits?",
    "Greater attraction to A; more time in A",
    {
      "Greater attraction to A; less time in A":
        "Stronger stationary-phase attraction implies more time in it.",
      "Rf cannot depend on paper":
        "The supplied controlled comparison shows that it can.",
    },
    separationRecords["paper-comparison"].feedback,
    "Link attraction, time distributed between phases and distance moved.",
    "paper-comparison",
  ),
  choice(
    "g-drying",
    "Judge a measurement",
    "The supplied mass continues to fall after drying. What should happen before a dry-mass recovery is reported?",
    "Dry, cool and reweigh",
    {
      "Use the highest mass": "This can include retained water.",
      "Subtract an invented water mass": "No measured water mass was supplied.",
    },
    separationRecords["drying-check"].feedback,
    "Compare the sequence of actual measurements.",
    "drying-check",
  ),
];
guided[0].openingHint = true;
const practice = [
  choice(
    "p-sand",
    "Specify the product",
    "For the supplied mixture, which route obtains dry sand?",
    "Dissolve salt → filter → wash and dry residue",
    {
      "Dissolve → filter → collect crystals": "That targets salt, not sand.",
      "Evaporate all water from the unfiltered mixture":
        "Both solids remain together.",
    },
    separationRecords["sand-route"].feedback,
    "Your route must match the target.",
    "sand-route",
    supplied("sand-route"),
  ),
  choice(
    "p-salt",
    "Follow the soluble component",
    "Which sequence obtains salt crystals from the supplied dry mixture?",
    "Dissolve → filter → concentrate and cool filtrate",
    {
      "Filter the dry mixture only":
        "The solids first need separation by their solubility.",
      "Distil and collect water": "That selects a different product.",
    },
    separationRecords["salt-route"].feedback,
    "Use salt's solubility before filtration.",
    "salt-route",
    supplied("salt-route"),
  ),
  choice(
    "p-water",
    "Collect the solvent",
    "Which final action recovers the water vapour from the stated mixture?",
    "Cool it in a condenser and collect liquid",
    {
      "Let it leave the room": "The solvent is then lost.",
      "Catch it in ordinary dry filter paper":
        "Filter paper does not condense and collect the solvent appropriately.",
    },
    separationRecords["water-route"].feedback,
    "Distillation needs both vaporisation and collection.",
    "water-route",
    supplied("water-route"),
  ),
  choice(
    "p-fraction",
    "Locate the target",
    "Which fraction contains the dissolved salt after sand has been filtered out?",
    "Filtrate",
    {
      "Sand residue": "That is the insoluble stream.",
      "A pure-water distillate": "The dissolved salt is non-volatile here.",
    },
    separationRecords["salt-fractions"].feedback,
    "Locate the solute before choosing the next stage.",
    "salt-fractions",
    supplied("salt-fractions"),
  ),
  choice(
    "p-water-fraction",
    "Follow condensed solvent",
    "Which final fraction is the water collected from this filtration/distillation plan?",
    "Distillate",
    {
      "Sand residue": "This is the insoluble solid.",
      "Unheated filtrate": "This still contains dissolved salt.",
    },
    separationRecords["water-fractions"].feedback,
    "Name the collected product from the condenser.",
    "water-fractions",
    supplied("water-fractions"),
  ),
  choice(
    "p-fractional",
    "Select for close boiling points",
    "Two miscible liquids have boiling points of 78 °C and 82 °C at the same pressure. Which supplied technique is most appropriate for separating them?",
    "Fractional distillation",
    {
      "Ordinary filtration": "Both liquids pass through.",
      "Paper chromatography to collect litres of both":
        "That is not a suitable bulk liquid recovery method.",
    },
    "A fractionating column provides repeated vaporisation and condensation, improving separation of liquids with close boiling temperatures. No universal minimum temperature gap is assumed.",
    "Use volatility, not particle size.",
  ),
  numeric(
    "p-net",
    "Subtract the tare",
    "What is the net recovered dry-crystal mass in the supplied record?",
    4,
    "g",
    separationRecords["dry-recovery"].feedback,
    "The dish is not part of the target material.",
    supplied("dry-recovery"),
    "dry-recovery",
  ),
  numeric(
    "p-sand-recovery",
    "Calculate a different recovery",
    "Calculate the percentage sand recovery using the supplied weighings.",
    75,
    "%",
    separationRecords["sand-recovery"].feedback,
    "Subtract 16.50 g, then compare the net mass with 8.00 g.",
    supplied("sand-recovery"),
    "sand-recovery",
  ),
  numeric(
    "p-apparent",
    "Keep an over 100% result",
    "Calculate the apparent percentage recovery from the undried-crystal record.",
    115,
    "%",
    separationRecords["wet-recovery"].feedback,
    "Do not silently change or cap the supplied measurements.",
    supplied("wet-recovery"),
    "wet-recovery",
  ),
  choice(
    "p-loss",
    "Account for unrecovered solute",
    "A pure dry crystal sample is less massive than the starting solute. Which can explain a loss?",
    "Some solute remains dissolved in the mother liquor",
    {
      "Filtration creates extra solute":
        "Physical separation creates no extra solute.",
      "Crystals must be impure because recovery is low":
        "Low recovery alone does not determine purity.",
    },
    "Solute left in solution and losses during transfer can reduce recovery. A purer small sample and a contaminated larger sample are different outcomes.",
    "Track the fraction that was not collected.",
  ),
  choice(
    "p-dry-check",
    "Check drying evidence",
    "Which conclusion follows from the supplied falling mass?",
    "The dry-mass calculation is not ready",
    {
      "The first mass is certainly pure salt": "Retained water may add mass.",
      "Falling mass proves a nuclear reaction": "No such evidence is supplied.",
    },
    separationRecords["drying-check"].feedback,
    "Look for stable weighings at the stated resolution.",
    "drying-check",
    supplied("drying-check"),
  ),
  choice(
    "p-setup",
    "Spot an apparatus fault",
    "Why should the initial sample spot be above the solvent pool?",
    "To prevent it dissolving into the pool",
    {
      "To stop the solvent entering the paper":
        "The bottom still dips into solvent.",
      "To make the dye react with the paper": "The separation is physical.",
    },
    separationRecords["setup-measure"].feedback,
    "Keep the paper wet from below but the origin out of the pool.",
    "setup-measure",
    supplied("setup-measure"),
  ),
  choice(
    "p-front",
    "Preserve a measurement",
    "Why mark the solvent front immediately on removing the paper?",
    "Its location can disappear as the solvent evaporates",
    {
      "The front stays visible forever": "It may disappear during drying.",
      "To change the Rf to 1":
        "Marking records position; it does not alter the ratio.",
    },
    separationRecords["setup-measure"].feedback,
    "Think about the later denominator measurement.",
    "setup-measure",
  ),
  numeric(
    "p-rf",
    "Measure from one origin",
    "Origin is at 1.0 cm on a ruler; dye centre at 4.0 cm and solvent front at 7.0 cm. Calculate Rf.",
    0.5,
    "",
    "Dye distance =4.0−1.0=3.0 cm; front distance=7.0−1.0=6.0 cm; Rf=3.0/6.0=0.50.",
    "Subtract the origin from both ruler readings.",
  ),
  numeric(
    "p-inverse",
    "Find a missing distance",
    "Rf=0.65 and solvent distance from origin=12.0 cm. Find the dye-centre distance from origin.",
    7.8,
    "cm",
    "Dye distance=0.65×12.0=7.8 cm.",
    "Rearrange dye distance/front distance=Rf.",
  ),
  choice(
    "p-paper",
    "Control the intended comparison",
    "What changes and what stays fixed in the supplied paper comparison?",
    "Change paper; keep solvent fixed",
    {
      "Change both paper and solvent":
        "Their separate effects cannot be isolated.",
      "Change the dye for each paper": "This confounds the comparison.",
    },
    separationRecords["paper-comparison"].feedback,
    "Name the independent variable and a relevant control.",
    "paper-comparison",
    supplied("paper-comparison"),
  ),
  choice(
    "p-solvent",
    "Change the mobile phase",
    "What is the intended variable in the supplied solvent comparison?",
    "Solvent, with the same paper",
    {
      "Paper, with the same solvent": "The supplied records change solvent.",
      "Both dye and paper": "The dye and paper are fixed here.",
    },
    separationRecords["solvent-comparison"].feedback,
    "Read what the experiment actually changes.",
    "solvent-comparison",
    supplied("solvent-comparison"),
  ),
  choice(
    "p-thermal",
    "Use independent physical evidence",
    "What does the supplied melting result support?",
    "Purity under the stated conditions",
    {
      "Every isotope has been identified": "Melting is not isotope analysis.",
      "The recovery must be 100%": "Purity and recovery are separate measures.",
    },
    separationRecords["sharp-purity"].feedback,
    "Compare with the actual supplied reference.",
    "sharp-purity",
    supplied("sharp-purity"),
  ),
  choice(
    "p-spot",
    "Limit the claim",
    "What is justified by the one-spot record?",
    "Absolute purity is not established",
    {
      "All possible substances are ruled out":
        "Only resolved visible spots were detected.",
      "No useful evidence exists at all":
        "The observation still describes one resolved visible component.",
    },
    separationRecords["spot-limit"].feedback,
    "Avoid both overclaiming and discarding the observation.",
    "spot-limit",
    supplied("spot-limit"),
  ),
  written(
    "p-plan",
    "Write a separation plan",
    "Describe and explain how to recover dry sand and salt crystals from a dry mixture of sand and soluble salt. Include how you reduce contamination and loss.",
    "Add water and stir to dissolve salt; sand is insoluble. Filter, retaining both residue and filtrate. Wash sand with a small suitable amount of water and combine washings with the filtrate; dry the sand. Concentrate the filtrate gently, cool to crystallise, collect and dry crystals. Use careful transfers/rinsing and recognise that salt can remain in the mother liquor.",
    [
      "Use solubility to explain dissolution and filtration; name both fractions.",
      "Wash and dry sand; retain salt-containing washings.",
      "Concentrate and cool the filtrate, collect and dry crystals.",
      "Explain a real loss/contamination control and recognise remaining dissolved solute.",
    ],
    "Track both targets and say why each stage works.",
  ),
  written(
    "p-explain-paper",
    "Explain the changed result",
    "Explain why the same dye has lower Rf on paper A than B in this controlled comparison.",
    "The dye is more attracted to paper A than B under the same solvent conditions. It spends a greater proportion of time distributed in A, so travels less relative to the solvent front and has lower Rf.",
    [
      "Use the supplied direction: 0.30 on A is lower than 0.45 on B.",
      "Link greater attraction to A to more time in the stationary phase.",
      "Link time distribution to shorter relative travel; Rf is condition-dependent.",
    ],
    "Join observation, attraction and time spent in each phase.",
    supplied("paper-comparison"),
  ),
  written(
    "p-evaluate",
    "Evaluate recovered material",
    "A student calls the undried-crystal result '115% pure salt recovered'. Evaluate the claim and propose the next measurement.",
    "The apparent recovered mass is 4.60 g and apparent recovery 115%, but retained water or contamination contributes mass. No new salt was created. Dry appropriately, cool and reweigh to a constant mass at the balance resolution, then calculate dry-mass recovery. Use independent purity evidence rather than mass alone.",
    [
      "Keep the actual apparent calculation; explain added mass rather than extra salt.",
      "Propose drying, cooling and repeated weighing.",
      "Separate recovery from purity and request relevant independent purity evidence.",
    ],
    "Ask what the balance measures and what it cannot tell you.",
    supplied("wet-recovery"),
  ),
];
practice.push(
  choice(
    "p-repeat",
    "Investigate an unexpected repeat",
    "Three same-condition Rf measurements are 0.31,0.32 and 0.71. What is the best next step before reporting a reliable result?",
    "Repeat and investigate the disagreement",
    {
      "Delete 0.71 automatically":
        "An unexpected value needs investigation; it must not disappear without justification.",
      "Report 0.71 as certainly the true value":
        "One discordant measurement does not establish the true value.",
    },
    "Check origin/front measurements, spot contamination and whether conditions actually matched; repeat the run. State and justify any eventual exclusion rather than silently selecting convenient values.",
    "Use all the recorded evidence and check the method.",
  ),
  written(
    "p-chrom-plan",
    "Plan a chromatography investigation",
    "Describe how to compare an unknown food colouring with known colourings using paper chromatography, and how you would record and evaluate the results.",
    "Draw and label a pencil origin. Apply small separate spots of the known colourings and unknown using clean separate applicators. Dip the paper bottom into a suitable solvent while keeping the origin above it and paper away from beaker walls. Leave the run undisturbed; mark the front immediately on removal. Dry the paper, measure centre and front distances from the same origin, calculate Rf and compare unknown spots with references in matching conditions. Record unmatched spots, repeat uncertain results and recognise co-migration or undetected substances.",
    [
      "Use labelled small separate known/unknown spots and clean applicators.",
      "Keep pencil origin above solvent, with paper bottom in contact and sides away from walls.",
      "Mark front before evaporation; measure from common origin and calculate Rf.",
      "Use matching reference conditions, retain unmatched observations and limit identification/purity claims.",
    ],
    "Specify apparatus decisions, measurement records and how far the evidence supports identification.",
  ),
);
const checkForms: [LearningTask[], LearningTask[]] = [
  [
    choice(
      "cA-target",
      "Recover solvent",
      "A mixture contains insoluble chalk, water and a dissolved non-volatile solute. Target: water. Which route fits?",
      "Filter → vaporise water → condense and collect",
      {
        "Filter and collect the chalk": "This chooses the insoluble target.",
        "Evaporate and discard vapour": "This loses the target.",
      },
      "Remove chalk, then collect the condensed solvent.",
      "Follow the target.",
    ),
    choice(
      "cA-fraction",
      "Locate the solute",
      "After filtering insoluble clay from a soluble-dye solution, where is the dissolved dye?",
      "In the filtrate",
      {
        "Only on the filter":
          "An ordinary filter does not retain dissolved dye.",
        "It is converted into clay": "No new substance forms.",
      },
      "Dissolved dye passes through ordinary filter paper with solvent.",
      "Use the stated solubility.",
    ),
    numeric(
      "cA-recovery",
      "Calculate dry recovery",
      "Initial target solid 6.00 g; empty dish 18.00 g; dish+dry sample 22.50 g. Calculate recovery.",
      75,
      "%",
      "Net=4.50 g;4.50/6.00×100=75%.",
      "Remove tare, then form the ratio.",
    ),
    choice(
      "cA-origin",
      "Evaluate the initial setup",
      "The sample origin is submerged in the solvent. What is the main fault?",
      "The sample can dissolve into the solvent pool",
      {
        "The paper bottom must never touch solvent":
          "The bottom needs contact with solvent.",
        "The dye must undergo a chemical reaction":
          "This is physical separation.",
      },
      "Keep the origin above the pool while the bottom of the paper dips into it.",
      "Distinguish the sample from the paper bottom.",
    ),
    numeric(
      "cA-rf",
      "Calculate a ratio",
      "Origin-to-dye centre distance 3.6 cm; origin-to-front distance 9.0 cm. Calculate Rf.",
      0.4,
      "",
      "3.6/9.0=0.40, without units.",
      "Dye distance divided by front distance.",
    ),
    numeric(
      "cA-distance",
      "Rearrange Rf",
      "Rf=0.70; origin-to-front distance 8.0 cm. Find origin-to-dye distance.",
      5.6,
      "cm",
      "0.70×8.0=5.6 cm.",
      "Multiply the ratio by front distance.",
    ),
    written(
      "cA-comparison",
      "Evaluate the design",
      "To compare paper A and B, a student also changes water to another solvent. Explain why their conclusion about paper alone is weak, and improve the design.",
      "Two variables changed, so either paper or solvent could affect Rf. Use the same dye and solvent when changing only paper; keep other relevant conditions such as spot size and front-distance measurement comparable and repeat trials.",
      [
        "Identify the confounded paper and solvent effects.",
        "Change only paper with same dye/solvent; include a relevant control or repeated measurement.",
      ],
      "Which changed variable caused the result?",
    ),
    written(
      "cA-purity",
      "Explain an evidence limit",
      "One resolved visible chromatogram spot is reported after a separation. Explain why this alone cannot establish absolute purity.",
      "Components may co-migrate into one spot, or may not be visible/detected under those conditions. A further suitable solvent or independent physical purity measurement gives additional evidence.",
      [
        "Give a valid co-migration or detection limitation.",
        "Propose suitable further evidence without claiming automatic proof.",
      ],
      "Consider substances that the observation might miss.",
    ),
  ],
  [
    choice(
      "cB-sand",
      "Recover insoluble material",
      "A soluble solid is mixed with insoluble grit. Target: dry grit. Which plan fits?",
      "Dissolve soluble solid → filter → wash and dry residue",
      {
        "Crystallise and collect the dissolved solid":
          "This collects the other target.",
        "Evaporate the unfiltered suspension": "Both solids remain mixed.",
      },
      "Use solubility to separate, wash adhering solution and dry the retained grit.",
      "Follow the insoluble target.",
    ),
    choice(
      "cB-crystals",
      "Locate the collection stream",
      "A solution containing a soluble solid has been filtered to remove dust. Which fraction should be concentrated to obtain crystals?",
      "The filtrate",
      {
        "The dust residue": "That is the material removed.",
        "The filter paper itself": "Dissolved solid passed through.",
      },
      "Concentrate and cool the filtrate, then collect and dry the crystals.",
      "Locate the soluble solid.",
    ),
    numeric(
      "cB-recovery",
      "Calculate apparent recovery",
      "Starting target 3.00 g; empty vessel 15.00 g; vessel+undried sample 18.30 g. Calculate apparent recovery.",
      110,
      "%",
      "Net=3.30 g;3.30/3.00×100=110%. Added water/contamination can inflate apparent recovery.",
      "Keep the actual supplied measurements.",
    ),
    choice(
      "cB-front",
      "Record before evaporation",
      "A student waits until paper is dry before locating the solvent front. What should improve?",
      "Mark the front immediately on removal",
      {
        "Move the origin after the run":
          "Changing the origin invalidates the measurements.",
        "Estimate every front as 10 cm": "Use the measured front position.",
      },
      "The front position may disappear as solvent evaporates.",
      "Preserve the measurement while visible.",
    ),
    numeric(
      "cB-rf",
      "Use ruler coordinates",
      "Origin ruler reading 2.0 cm; dye centre 5.0 cm; front 10.0 cm. Calculate Rf. Give your answer to two significant figures.",
      0.38,
      "",
      "Dye distance 3.0 cm; front distance 8.0 cm; Rf=0.375, which rounds to 0.38 to two significant figures.",
      "Subtract origin from both readings.",
    ),
    numeric(
      "cB-distance",
      "Find a missing distance",
      "Rf=0.35; front moved 14.0 cm from origin. How far did the dye centre move from origin?",
      4.9,
      "cm",
      "0.35×14.0=4.9 cm.",
      "Rearrange the ratio.",
    ),
    written(
      "cB-plan",
      "Plan and explain recovery",
      "Describe how to obtain dry crystals of a soluble solid from a solution contaminated with insoluble particles. Explain why ordinary filtration alone is insufficient.",
      "Filter to remove insoluble particles. Dissolved solute passes through with solvent. Concentrate the filtrate, allow crystallisation on cooling, collect and dry crystals. Some solute remains dissolved, so 100% recovery is not assumed.",
      [
        "Name filtrate as the solution containing the dissolved target; explain filtration's limit.",
        "Concentrate, cool, collect and dry crystals; recognise remaining dissolved solute.",
      ],
      "Explain both the first separation and collection stage.",
    ),
    written(
      "cB-mass",
      "Evaluate constant mass",
      "Two successive cooled weighings agree at 0.01 g resolution. A student says this proves the sample is chemically pure. Evaluate this claim.",
      "Agreement supports no measurable further mass loss by drying under those conditions; it does not prove all contaminants are absent. Compare a suitable melting/boiling result with a supplied reference or obtain suitable chromatography evidence, acknowledging limitations.",
      [
        "Distinguish stable mass at stated resolution from absolute dryness/purity.",
        "Propose relevant independent purity evidence and avoid an absolute claim.",
      ],
      "What quantity did the repeated measurement actually test?",
    ),
  ],
];
checkForms[1][4].rounding = { kind: "significant-figures", digits: 2 };
const reviewForms: [LearningTask[], LearningTask[]] = [
  [
    choice(
      "vA-water",
      "Retrieve the target",
      "To recover water from a solution of a non-volatile solid, why is distillation preferable to letting vapour escape?",
      "It condenses and collects the solvent",
      {
        "It creates extra water": "Physical separation forms no new water.",
        "Filter paper removes the dissolved solid":
          "Ordinary filtering does not do this.",
      },
      "Recovering the solvent requires condensation and collection.",
      "Name the destination of the vapour.",
    ),
    numeric(
      "vA-recovery",
      "Retrieve recovery arithmetic",
      "Starting target 10.00 g; empty vessel 30.00 g; vessel+dry sample 38.50 g. Find recovery.",
      85,
      "%",
      "8.50/10.00×100=85%.",
      "Subtract the vessel before calculating.",
    ),
    numeric(
      "vA-rf",
      "Retrieve an inverse ratio",
      "Rf=0.55 and front distance 16.0 cm. Find dye distance from origin.",
      8.8,
      "cm",
      "0.55×16.0=8.8 cm.",
      "Multiply by the front distance.",
    ),
    written(
      "vA-wash",
      "Explain washing",
      "Explain why washing an insoluble residue can improve its purity and why salt-containing washings may be worth retaining in a two-product investigation.",
      "Washing removes adhering soluble contamination. Retaining washings with the filtrate can recover that dissolved salt later; discarding them loses some soluble target. Washing/drying alone does not prove absolute purity.",
      [
        "Link washing to removal of soluble contamination.",
        "Track the soluble target in washings and distinguish recovery from purity.",
      ],
      "Follow both components.",
    ),
  ],
  [
    choice(
      "vB-purity",
      "Retrieve evidence limits",
      "A recovered sample has high mass. What can be concluded about its purity?",
      "Mass alone is insufficient",
      {
        "It must be pure": "Contaminants can contribute mass.",
        "It cannot be pure": "A high mass does not establish impurity either.",
      },
      "Use an appropriate independent physical measurement.",
      "What substances might add mass?",
    ),
    numeric(
      "vB-recovery",
      "Retrieve apparent recovery",
      "Starting target 2.00 g; empty dish 12.00 g; dish+wet sample 14.40 g. Find apparent recovery.",
      120,
      "%",
      "2.40/2.00×100=120%; water can inflate mass.",
      "Do not cap the measured result.",
    ),
    numeric(
      "vB-rf",
      "Retrieve the common origin",
      "Origin reading 0.5 cm; spot centre 2.5 cm; front 8.5 cm. Calculate Rf.",
      0.25,
      "",
      "(2.5−0.5)/(8.5−0.5)=2.0/8.0=0.25.",
      "Measure both distances from origin.",
    ),
    written(
      "vB-paper",
      "Explain stationary-phase attraction",
      "A dye has lower Rf on paper C than D using the same solvent. Explain this using attraction and time spent in the stationary phase.",
      "The dye is more attracted to C, spending a greater proportion of time in that stationary phase. It travels less relative to the solvent front, giving lower Rf.",
      [
        "Use greater attraction to C with the solvent held constant.",
        "Link more time in the stationary phase to less relative travel.",
      ],
      "Connect observation to phase distribution.",
    ),
  ],
];
export const allSeparationTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const separationRecoveryRoutes: Record<string, string> = {};
const recovery = [
  "r-sand",
  "r-salt",
  "r-target",
  "r-salt",
  "r-target",
  "r-target",
  "r-recovery",
  "r-recovery",
  "r-wet",
  "r-salt",
  "r-wet",
  "r-origin",
  "r-origin",
  "r-origin",
  "r-origin",
  "r-paper",
  "r-paper",
  "r-purity",
  "r-purity",
  "r-salt",
  "r-paper",
  "r-wet",
  "r-paper",
  "r-origin",
];
practice.forEach((q, i) => {
  q.followUp = id(recovery[i]);
  separationRecoveryRoutes[q.id] = q.followUp;
});
export const separationExposureFamilies = {
  salt: ["r-salt", "g-salt", "p-salt", "p-fraction"],
  water: ["r-target", "g-water", "p-water", "p-water-fraction"],
  sand: ["r-sand", "g-fractions", "p-sand"],
  recovery: ["r-recovery", "g-dry", "p-net"],
  wet: ["r-wet", "g-wet", "p-apparent"],
  origin: ["r-origin", "g-setup", "p-setup", "p-front"],
  paper: ["r-paper", "g-paper", "p-paper", "p-explain-paper"],
  purity: ["r-purity", "p-spot"],
};
for (const family of Object.values(separationExposureFamilies))
  for (const s of family) {
    const q = allSeparationTasks.find((q) => q.id === id(s))!;
    q.exposureAliases = family.filter((other) => other !== s).map(id);
  }
export const separationJourney: LessonJourney = {
  version: 1,
  introduction:
    "Plan a separation for a stated target, track its fractions and evaluate recovery and purity from measurements.",
  scopeNote:
    "AQA Chemistry/Trilogy physical-separation and chromatography practical reasoning, both tiers. Supplied recovery ratios and hypothetical purity references are original data. Supervised practical competence still requires laboratory work; written explanations are self-reviewed, without examiner marks.",
  outcomes: [
    "Select and explain a sequence using solubility or volatility and the desired product.",
    "Locate residue, filtrate, crystals and condensed solvent; account for losses and contamination.",
    "Calculate net mass and supplied recovery ratios, retaining surprising apparent results.",
    "Repair chromatography setup, use a common origin and rearrange Rf.",
    "Design controlled comparisons, explain phase distribution and limit purity claims.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Targets, routes and fractions",
      taskIds: practice.slice(0, 6).map((q) => q.id),
    },
    {
      label: "Recovery and measurement quality",
      taskIds: practice.slice(6, 11).map((q) => q.id),
    },
    {
      label: "Chromatography and evidence",
      taskIds: practice.slice(11, 19).map((q) => q.id),
    },
    {
      label: "Explain and evaluate investigations",
      taskIds: practice.slice(19).map((q) => q.id),
    },
  ],
};
