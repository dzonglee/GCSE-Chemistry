import { extendSaltHeating } from "./salt-heating-writing";
import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
const c = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...choice(
    `ss-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    title,
    model,
  ),
  title,
});
const n = (
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...number(
    `ss-v1-${id}`,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    title,
    {},
    model,
  ),
  title,
});
const w = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  points: string[],
): LearningTask => ({
  id: `ss-v1-${id}`,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: points[0],
  rubric: points,
  purpose: title,
});
const m = (
  mode: "method" | "sequence" | "filter" | "cooling" | "purity",
  instruction: string,
): TaskModel => ({ kind: "soluble-salts", mode, instruction });
export const solubleSaltsJourney: LessonJourney = {
  version: 1,
  introduction:
    "Choose a salt-making method, track the separation steps and explain how pure, dry crystals are recovered.",
  scopeNote:
    "Foundation/shared AQA Chemistry 4.4.2.3 required practical 1 and Combined Trilogy 5.4.2.3 practical 8; related Pearson Combined 3.15–3.18. AQA's required preparation uses an insoluble oxide or carbonate; Pearson names hydrated copper sulfate and a water bath, and includes acid–alkali titration technique in Combined. This lesson explains why measured proportions are needed for soluble reactants; full burette/pipette/indicator technique is a separate lesson. Given solubility decides the method; the insoluble-salt contrast supplies its data and does not cover all Pearson 3.19–3.21 rules. Under supplied adequate mixing/reaction conditions, excess insoluble reactant consumes acid and is removed by filtration. Filtrate is salt solution, not pure water or dry crystals. Concentrate gently without driving completely dry, then cool and allow crystallisation; recover and gently dry crystals. Some dissolved salt stays in mother liquor. The 3D filtration apparatus represents macroscopic materials, not atoms, molecules or a microscopic filter mechanism. Solubility quantities use supplied anhydrous KNO3 data, constant water mass, complete equilibrium crystallisation and no losses; they are not copper sulfate hydrate mass calculations. Many, not all, solids become less soluble on cooling; supersaturation can delay crystals. Simulated teacher-reported practical interpretation does not certify laboratory skills. Six written responses remain self-reviewed rather than automatic examiner marks or readiness evidence.",
  outcomes: [
    "Choose a method from reactant and product solubility.",
    "Explain excess insoluble reactant and correctly ordered separation.",
    "Identify residue and filtrate at each filtration.",
    "Distinguish concentration, cooling, crystallisation and drying.",
    "Use supplied solubility to predict crystals and mother liquor.",
  ],
  warmup: [
    c(
      "w-products",
      "Recall the reaction",
      "Copper oxide reacts with sulfuric acid. Which products form?",
      "Copper sulfate and water",
      {
        "Copper chloride and hydrogen":
          "Sulfuric acid supplies sulfate; an oxide gives water.",
        "Copper metal and oxygen":
          "This is acid–base reaction, not extraction.",
      },
      "Metal oxide + acid → salt + water.",
      "Use the acid and reactant family.",
    ),
    c(
      "w-filter",
      "Recall filtration",
      "Which material is retained by suitable filter paper?",
      "An insoluble solid",
      {
        "Every dissolved ion":
          "Ordinary filtration does not remove dissolved ions.",
        "All water": "Liquid passes through suitable filter paper.",
      },
      "An insoluble solid is residue; liquid passing through is filtrate.",
      "Distinguish dissolved from suspended.",
    ),
  ],
  refresher: [
    c(
      "r-method",
      "Choose by solubility",
      "Given soluble copper sulfate and insoluble CuO, which method can remove excess reactant?",
      "Add excess CuO, then filter",
      {
        "Add excess soluble NaOH, then filter":
          "Dissolved excess alkali passes through.",
        "Filter the acid first": "Filtering acid does not consume it.",
      },
      "The excess must be removable as an insoluble solid.",
      "Use supplied solubility.",
      m(
        "method",
        "Select both the preparation method and the appropriate acid.",
      ),
    ),
    c(
      "r-excess",
      "Use up the acid",
      "Under adequate teacher-controlled mixing and reaction conditions, why continue adding CuO until some remains unreacted?",
      "To use up all the acid",
      {
        "To leave more acid": "Excess CuO is used to consume acid.",
        "To leave all added oxide dissolved":
          "The remaining excess oxide is insoluble and must be filtered off.",
      },
      "Some excess insoluble base remains after acid has reacted; filtering then removes it.",
      "Which reactant must not contaminate the final solution?",
    ),
    c(
      "r-sequence",
      "Separate in the right order",
      "The acid has reacted completely with excess CuO. What should happen before concentrating the salt solution?",
      "Filter off excess CuO",
      {
        "Evaporate everything to dryness":
          "That keeps the excess solid with the salt and may damage crystals.",
        "Filter only after the crystals form":
          "That leaves excess oxide mixed with the crystals.",
      },
      "Remove unreacted insoluble material before crystallising the salt.",
      "What impurity is still suspended?",
      m(
        "sequence",
        "Predict the next step before advancing the simulated teacher-reported process.",
      ),
    ),
    c(
      "r-filtrate",
      "Name both fractions",
      "After excess CuO is filtered from copper sulfate solution, which description is correct?",
      "Residue: CuO; filtrate: copper sulfate solution",
      {
        "Residue: all copper sulfate; filtrate: water":
          "Dissolved salt passes through with water.",
        "Residue: copper sulfate crystals; filtrate: CuO suspension":
          "Crystals have not formed yet, and insoluble CuO is retained rather than passing through.",
      },
      "The solution passes through; excess insoluble CuO remains on paper.",
      "Track whether the salt is dissolved.",
      m(
        "filter",
        "Predict both residue and filtrate; explore different supplied mixtures.",
      ),
    ),
    n(
      "r-cooling",
      "Scale the cold solubility",
      "Cold solubility is supplied as 32 g KNO3 per 100 g water. How many grams can remain dissolved in 50 g water?",
      16,
      "g",
      "32 ×50/100=16 g. This is a capacity, not the mass of crystals.",
      "Scale with the water mass.",
      m(
        "cooling",
        "Use constant water mass and supplied cold solubility; equilibrium crystallisation and no losses are assumed.",
      ),
    ),
    c(
      "r-drying",
      "Protect the crystals",
      "Why concentrate copper sulfate solution and then cool, rather than strongly heating it completely dry?",
      "To obtain crystals without driving off all water",
      {
        "To recover every dissolved gram with no mother liquor":
          "Cooling commonly leaves some salt dissolved in mother liquor.",
        "Because all solids have identical solubility":
          "Different solutes behave differently.",
      },
      "Controlled concentration and cooling allow hydrated crystals to form; strong complete drying can damage them or cause spitting.",
      "Separate crystal formation from removal of surface liquid.",
      m(
        "purity",
        "Choose the next action and its reason for this supplied practical record.",
      ),
    ),
  ],
  guided: [
    c(
      "g-method",
      "Choose the reactants",
      "Given insoluble CuO and soluble copper sulfate, choose the preparation route and acid.",
      "Excess CuO with sulfuric acid, then filtration",
      {
        "Excess CuO with hydrochloric acid":
          "That would produce copper chloride.",
        "Excess dissolved NaOH, then filter":
          "Dissolved excess alkali cannot be filtered off.",
      },
      "The acid provides sulfate; insoluble excess CuO can be removed.",
      "Check salt ending and solubility.",
      m(
        "method",
        "Predict route and acid independently; other supplied records test soluble and insoluble salts.",
      ),
    ),
    c(
      "g-sequence",
      "Predict before proceeding",
      "After complete acid consumption, the mixture contains copper sulfate solution and excess CuO. Predict the first separation step, then advance it.",
      "Filter off unreacted CuO",
      {
        "Cool the unfiltered mixture":
          "CuO would contaminate recovered crystals.",
        "Boil the unfiltered mixture dry":
          "This retains the impurity and risks damaging crystals.",
      },
      "Filter before concentration; the filtrate is copper sulfate solution.",
      "Remove the suspended impurity first.",
      m(
        "sequence",
        "Each advance changes the material state. Predict the next step at each stage.",
      ),
    ),
    c(
      "g-filter",
      "Track what passes",
      "Predict both fractions for the initial CuO/copper sulfate mixture. What is in the filtrate?",
      "Copper sulfate solution",
      {
        "Pure water": "Dissolved copper and sulfate ions pass with water.",
        "Only unreacted CuO": "Insoluble CuO stays on paper.",
      },
      "Filtration removes excess solid, not dissolved salt.",
      "Filtrate is the liquid that passes.",
      m(
        "filter",
        "The actual 3D apparatus depicts this macroscopic separation, not salt molecules.",
      ),
    ),
    n(
      "g-cooling",
      "Keep the mother liquor",
      "Supplied KNO3 record: 40 g salt initially dissolved in 50 g water; cold solubility 32 g per 100 g water. After equilibrium crystallisation without water loss, how many grams crystallise?",
      24,
      "g",
      "Cold capacity=16 g; crystals=40−16=24 g. Dissolved salt remains in mother liquor.",
      "Subtract the remaining dissolved mass.",
      m(
        "cooling",
        "Do not treat every dissolved gram as a crystal; both inventories must balance.",
      ),
    ),
    c(
      "g-purity",
      "Recover hydrated crystals",
      "For the initial filtered copper sulfate solution, choose a suitable next action and reason.",
      "Concentrate gently, then cool to form crystals",
      {
        "Strongly heat completely dry":
          "That is unsuitable for retaining hydrated crystals.",
        "Filter out dissolved sulfate ions":
          "Ordinary filtration cannot do this.",
      },
      "Concentration removes some solvent; cooling can form crystals. Recover and gently dry them separately.",
      "Do not confuse evaporation with drying the recovered crystals.",
      m(
        "purity",
        "Explore wet crystals and indicator contamination as separate supplied records.",
      ),
    ),
  ],
  practice: [
    c(
      "p-sulfate",
      "Choose the acid",
      "Which acid supplies sulfate for magnesium sulfate?",
      "Sulfuric acid",
      {
        "Hydrochloric acid": "This supplies chloride.",
        "Nitric acid": "This supplies nitrate.",
      },
      "Sulfuric acid gives sulfate salts.",
      "Use the salt ending.",
    ),
    c(
      "p-chloride",
      "Transfer the method",
      "MgO is supplied as insoluble; magnesium chloride is soluble. Which acid is suitable?",
      "Hydrochloric acid",
      {
        "Sulfuric acid": "That supplies sulfate.",
        "Nitric acid": "That supplies nitrate.",
      },
      "MgO + hydrochloric acid gives magnesium chloride and water.",
      "Match the anion.",
    ),
    c(
      "p-carbonate",
      "Another insoluble reactant",
      "An insoluble carbonate reacts with an acid to form a soluble salt. Which extra gas can form?",
      "Carbon dioxide",
      {
        Hydrogen: "That is the supplied reactive-metal pattern, not carbonate.",
        Oxygen: "Carbonate/acid does not supply this pattern.",
      },
      "Carbonate + acid → salt + water + carbon dioxide.",
      "Recall the carbonate family.",
    ),
    c(
      "p-excess",
      "Explain the excess",
      "A teacher reports adequate mixing and continued reaction; new CuO finally remains unreacted. Why is that useful?",
      "It supports that the acid has been consumed",
      {
        "It proves CuO became soluble": "The remaining solid is insoluble.",
        "It proves an exact pH of 7":
          "This observation does not give an exact pH measurement.",
      },
      "The insoluble reactant is now in excess and can be removed; do not invent an exact pH.",
      "Distinguish complete consumption from a pH reading.",
    ),
    w(
      "p-excess-write",
      "Explain the first decision",
      "Explain why excess insoluble oxide is useful and why excess soluble alkali cannot be removed in the same way.",
      "Excess insoluble oxide consumes the acid under adequate reaction conditions and remaining solid can be filtered off. Dissolved excess alkali passes through ordinary filter paper, so suitable measured reacting proportions are needed.",
      [
        "Explain acid consumption.",
        "Explain removal of insoluble excess.",
        "Contrast dissolved alkali.",
      ],
    ),
    c(
      "p-residue",
      "Identify the first residue",
      "After excess CuO is filtered from copper sulfate solution, what is retained on paper?",
      "Unreacted copper oxide",
      {
        "All dissolved copper sulfate": "Dissolved salt passes through.",
        "Pure water": "Water passes through.",
      },
      "CuO is the suspended insoluble excess.",
      "Which substance was added in excess?",
    ),
    c(
      "p-filtrate",
      "Identify the first filtrate",
      "What passes through the first filter after acid has completely reacted with excess CuO?",
      "Copper sulfate dissolved in water",
      {
        "Dry copper sulfate crystals": "Crystallisation has not yet occurred.",
        "Only water with no salt": "Dissolved salt passes through.",
      },
      "The filtrate is salt solution.",
      "The salt is still dissolved.",
    ),
    c(
      "p-early",
      "Spot premature stopping",
      "A supplied mixture contains dissolved acid and salt with no remaining oxide. Can ordinary filtration remove the dissolved acid?",
      "No, dissolved acid passes through",
      {
        "Yes, acid is always the residue":
          "Ordinary paper retains suspended insoluble solid, not dissolved acid.",
        "Yes, filtration neutralises acid":
          "Filtration is separation, not acid consumption.",
      },
      "Stopping too early can leave dissolved acid contamination.",
      "Use the physical state.",
    ),
    c(
      "p-order",
      "Explain the order",
      "Why remove excess CuO before concentrating the solution?",
      "To avoid retaining CuO with the recovered crystals",
      {
        "To remove water before any salt solution passes through":
          "Water and dissolved salt pass together through the paper.",
        "To remove every dissolved sulfate ion":
          "That would remove the desired salt; ordinary filtration does not do it.",
      },
      "Remove the impurity while it is an insoluble suspended solid.",
      "Track impurity and desired product.",
    ),
    w(
      "p-filter-write",
      "Explain both fractions",
      "Describe the first filtration and identify residue and filtrate for copper sulfate preparation.",
      "Use suitable filter paper in a funnel. Excess unreacted CuO is retained as residue; copper sulfate solution passes through as filtrate. Dissolved salt is not all trapped by paper.",
      [
        "Name funnel and filter paper.",
        "Identify CuO residue.",
        "Identify copper sulfate solution filtrate.",
      ],
    ),
    c(
      "p-evaporate",
      "Change concentration",
      "During controlled concentration, some water evaporates while the dissolved salt is retained. What changes?",
      "Less solvent remains around the retained salt",
      {
        "Copper sulfate becomes copper metal":
          "This physical step is not reduction.",
        "All salt necessarily evaporates with water":
          "This supplied salt is retained.",
      },
      "Removing some solvent increases concentration; it does not by itself mean all salt is recovered dry.",
      "Track solvent and solute separately.",
    ),
    c(
      "p-cooling",
      "Use the given solubility",
      "A supplied salt is less soluble cold than warm. Why allow a concentrated solution to cool and crystallise?",
      "Less salt can remain dissolved at the lower temperature",
      {
        "All dissolved salt must leave the solution completely":
          "Some salt can remain dissolved in the cold mother liquor.",
        "All salts have the same behaviour":
          "Solubility depends on the substance.",
      },
      "For the given salt, cooling reduces the equilibrium dissolved capacity; crystallisation may require time.",
      "Use the supplied substance's data.",
    ),
    n(
      "p-capacity",
      "Scale the water mass",
      "Supplied cold KNO3 solubility is 32 g per 100 g water. How many grams can remain dissolved in 25 g water?",
      8,
      "g",
      "32 ×25/100=8 g.",
      "One quarter of the water means one quarter of capacity.",
    ),
    n(
      "p-crystals",
      "Subtract mother liquor solute",
      "20 g KNO3 is initially dissolved in 25 g water. Cold capacity is 8 g. With equilibrium crystallisation and no losses, what mass crystallises?",
      12,
      "g",
      "20−8=12 g; 8 g remains dissolved.",
      "Subtract, do not add.",
    ),
    n(
      "p-unsaturated",
      "No compulsory crystals",
      "10 g KNO3 is dissolved in 50 g water. Cold capacity is 16 g. With no water loss, how many grams must crystallise at equilibrium?",
      0,
      "g",
      "10 g is below 16 g capacity, so all can remain dissolved.",
      "Capacity is a maximum, not extra solute.",
    ),
    n(
      "p-larger",
      "Scale and conserve",
      "60 g KNO3 is dissolved in 75 g water. Supplied cold solubility is 32 g per 100 g water. At equilibrium with no losses, what mass crystallises?",
      36,
      "g",
      "Cold capacity=24 g; 60−24=36 g.",
      "Scale capacity before subtracting.",
    ),
    w(
      "p-cooling-write",
      "Explain the two masses",
      "Explain why the 40 g KNO3 record gives 24 g crystals rather than 40 g, using the supplied cold solubility and 50 g water.",
      "The cold solution can retain 32×50/100=16 g dissolved. With no water loss and equilibrium crystallisation, 40−16=24 g crystallises; 16 g remains in mother liquor.",
      [
        "Scale the dissolved capacity to 16 g.",
        "Subtract from 40 g.",
        "Identify mother liquor and stated assumptions.",
      ],
    ),
    c(
      "p-dry",
      "Remove surface liquid",
      "Recovered hydrated copper sulfate crystals have surface droplets. Which supplied gentle drying method is suitable?",
      "Pat dry with filter paper",
      {
        "Strongly heat to drive off every water molecule":
          "This can remove water of crystallisation and damage the intended hydrated product.",
        "Add more acid": "This contaminates the recovered crystals.",
      },
      "Drying surface liquid is different from removing chemically associated crystal water.",
      "Retain the intended hydrated crystals.",
    ),
    c(
      "p-alkali",
      "Choose measured proportions",
      "Both acid and alkali are soluble. Why use titration to find reacting proportions for a pure salt?",
      "Dissolved excess reactant cannot be filtered off",
      {
        "Every alkali is insoluble": "Alkalis are soluble bases.",
        "Filtering automatically gives matching amounts":
          "Filtration does not set reacting amounts.",
      },
      "Find suitable volumes rather than leaving dissolved excess.",
      "Contrast with removable oxide.",
    ),
    w(
      "p-method-write",
      "Build a complete method",
      "Describe a logically ordered school-supervised preparation of pure, dry magnesium sulfate crystals from supplied MgO and dilute acid. Include reagents and the purposes of the main steps.",
      "Use magnesium oxide and dilute sulfuric acid. Under supervised controlled warming and stirring, add MgO until it is in excess so acid is consumed. Filter through paper/funnel to remove excess MgO. Concentrate the filtrate in an evaporating basin using a suitable water bath or electric heater under school supervision, without complete dryness. Allow cooling and crystallisation; recover crystals and pat dry with filter paper.",
      [
        "Name MgO and sulfuric acid; explain excess and stirring.",
        "Filter excess solid before concentration.",
        "Concentrate, cool, recover and gently dry in logical order.",
      ],
    ),
  ],
  checkForms: [
    [
      c(
        "a-method",
        "Choose a changed preparation",
        "Zinc oxide is supplied as insoluble; zinc nitrate is soluble. Which acid makes the required salt?",
        "Nitric acid",
        {
          "Sulfuric acid": "This gives sulfate.",
          "Hydrochloric acid": "This gives chloride.",
        },
        "Nitric acid supplies nitrate; the supplied oxide gives zinc nitrate and water.",
        "Use the anion.",
      ),
      c(
        "a-fractions",
        "Track a changed oxide",
        "Excess ZnO remains after complete reaction making zinc nitrate solution. Which fraction description is right?",
        "Residue ZnO; filtrate zinc nitrate solution",
        {
          "Residue zinc nitrate; filtrate pure water":
            "The salt is dissolved and passes through.",
          "Residue acid; filtrate zinc metal":
            "Acid has reacted; no extraction to zinc metal is described.",
        },
        "Insoluble ZnO stays; salt solution passes.",
        "Use the supplied states.",
      ),
      n(
        "a-crystals",
        "Use fresh supplied data",
        "For this original KNO3 record, 48 g is dissolved in 60 g water. Cold solubility is 30 g per 100 g water. At equilibrium with no losses, how many grams crystallise?",
        30,
        "g",
        "Cold capacity=18 g; 48−18=30 g.",
        "Scale to 60 g water.",
      ),
      c(
        "a-sequence",
        "Choose the valid order",
        "After the acid has reacted with excess insoluble oxide, choose the suitable order.",
        "Filter excess; concentrate; cool; recover and dry",
        {
          "Cool; boil dry with oxide; filter dry powder":
            "Excess oxide is not separated before crystal recovery.",
          "Concentrate with excess oxide; cool; filter both solids together; dry":
            "Filtering both solids together does not separate excess oxide from the desired crystals.",
        },
        "The order separates impurity before recovering product.",
        "Track the mixture at every stage.",
      ),
      w(
        "a-write",
        "Explain the method choice",
        "Explain why a soluble alkali needs suitable measured reacting proportions rather than adding excess and filtering.",
        "Dissolved excess alkali passes through ordinary filter paper with the salt solution, contaminating it. Titration can determine suitable reacting volumes; a pure preparation is then repeated without indicator using those volumes.",
        [
          "Identify dissolved excess.",
          "Explain filtration limitation.",
          "Explain measured volumes and avoidance of indicator contamination.",
        ],
      ),
    ],
    [
      c(
        "b-method",
        "Choose a changed salt",
        "Potassium nitrate is soluble; potassium hydroxide is a soluble alkali. Which preparation route is appropriate?",
        "Find suitable acid/alkali proportions by titration",
        {
          "Add excess KOH and filter it out":
            "The dissolved excess passes through.",
          "Use sulfuric acid to give nitrate": "Sulfuric acid gives sulfate.",
        },
        "Nitric acid and measured potassium hydroxide can provide the desired salt without dissolved excess.",
        "Use solubility and salt identity.",
      ),
      c(
        "b-fractions",
        "Track the second filtration",
        "Copper sulfate crystals have formed in mother liquor. What is the residue when crystals are recovered by filtration?",
        "Copper sulfate crystals",
        {
          "Pure water": "Water passes through with dissolved salt.",
          "The earlier excess CuO": "That should already have been removed.",
        },
        "This is crystal recovery, a different filtration from removing oxide.",
        "Identify the solid at this stage.",
      ),
      n(
        "b-crystals",
        "Use another fresh record",
        "For this original KNO3 record, 35 g is dissolved in 40 g water. Cold solubility is 25 g per 100 g water. At equilibrium with no losses, how many grams crystallise?",
        25,
        "g",
        "Cold capacity=10 g; 35−10=25 g.",
        "Scale then subtract.",
      ),
      c(
        "b-dry",
        "Choose suitable drying",
        "Why pat recovered hydrated crystals dry rather than strongly heating them completely dry?",
        "Remove surface liquid while retaining hydrated crystals",
        {
          "Recover all salt that remains dissolved in the mother liquor":
            "Drying recovered crystals does not recover dissolved salt left behind.",
          "Remove all water of crystallisation from the product":
            "That changes the intended hydrated crystals rather than just drying their surface.",
        },
        "Retain the intended hydrated product while removing surface droplets.",
        "Separate liquid droplets from crystal water.",
      ),
      w(
        "b-write",
        "Explain logical order",
        "Explain why first filtration comes before concentration and why cooling comes before recovering the crystals.",
        "First filtration removes excess insoluble reactant so it does not contaminate crystals. Concentration removes some solvent; cooling the appropriate concentrated solution allows crystals to form. The solid crystals can then be recovered and gently dried while some salt remains dissolved in mother liquor.",
        [
          "Remove impurity before crystallisation.",
          "Explain concentration and cooling.",
          "Recover formed crystals and distinguish mother liquor.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      c(
        "ra-filter",
        "Retrieve the first filtrate",
        "After complete acid reaction and removal of excess oxide, what is the filtrate?",
        "Salt solution",
        {
          "All dry salt crystals": "Crystals have not yet formed.",
          "Only excess oxide": "Excess oxide is residue.",
        },
        "Dissolved salt passes with water.",
        "Recall the state.",
      ),
      n(
        "ra-mass",
        "Retrieve scaling and subtraction",
        "Supplied KNO3 record: 27 g salt dissolved in 30 g water; cold solubility 20 g per 100 g water. At equilibrium with no losses, how many grams crystallise?",
        21,
        "g",
        "6 g remains dissolved; 27−6=21 g.",
        "Scale capacity first.",
      ),
      c(
        "ra-excess",
        "Retrieve method selection",
        "Which excess reactant can ordinary filtration remove?",
        "An insoluble oxide",
        {
          "A dissolved alkali": "Dissolved alkali passes through.",
          "Dissolved acid": "Dissolved acid passes through.",
        },
        "Use solubility to select the preparation method.",
        "Recall residue.",
      ),
    ],
    [
      c(
        "rb-recover",
        "Retrieve the second filtrate",
        "After formed crystals are filtered from their mother liquor, what can the filtrate contain?",
        "Water and still-dissolved salt",
        {
          "Only pure water in every case":
            "Some salt commonly remains dissolved.",
          "All recovered dry crystals": "Crystals are the residue.",
        },
        "Mother liquor still contains dissolved salt.",
        "Recall the solubility capacity.",
      ),
      n(
        "rb-mass",
        "Retrieve with changed data",
        "Supplied KNO3 record: 44 g dissolved in 80 g water; cold solubility 30 g per 100 g water. At equilibrium with no losses, how many grams crystallise?",
        20,
        "g",
        "24 g remains dissolved; 44−24=20 g.",
        "Scale before subtraction.",
      ),
      c(
        "rb-indicator",
        "Retrieve purity",
        "Titration using indicator finds suitable reacting volumes. For pure salt preparation, what is done with those volumes?",
        "Repeat the reaction without indicator",
        {
          "Always add extra alkali afterwards":
            "That leaves dissolved contamination.",
          "Filter dissolved indicator out completely":
            "Ordinary paper does not guarantee that separation.",
        },
        "Avoid indicator contamination in the product preparation.",
        "Use the measured proportions.",
      ),
    ],
  ],
};
const recovery: Record<string, string> = {
  "p-sulfate": "r-method",
  "p-chloride": "r-method",
  "p-carbonate": "r-method",
  "p-excess": "r-excess",
  "p-excess-write": "r-excess",
  "p-residue": "r-filtrate",
  "p-filtrate": "r-filtrate",
  "p-early": "r-filtrate",
  "p-order": "r-sequence",
  "p-filter-write": "r-filtrate",
  "p-evaporate": "r-drying",
  "p-cooling": "r-cooling",
  "p-capacity": "r-cooling",
  "p-crystals": "r-cooling",
  "p-unsaturated": "r-cooling",
  "p-larger": "r-cooling",
  "p-cooling-write": "r-cooling",
  "p-dry": "r-drying",
  "p-alkali": "r-method",
  "p-method-write": "r-sequence",
};
for (const task of solubleSaltsJourney.practice)
  task.followUp = `ss-v1-${recovery[task.id.replace("ss-v1-", "")]}`;

// Append practical heater transfer without changing original task identities/forms.
extendSaltHeating(solubleSaltsJourney);

solubleSaltsJourney.practice.find(
  (q) => q.id === "ss-v1-p-excess",
)!.optionAliases = {
  "It proves an exact pH of7": "It proves an exact pH of 7",
};
