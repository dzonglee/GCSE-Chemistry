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
    `mc-v1-${id}`,
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
): LearningTask => ({
  ...number(`mc-v1-${id}`, prompt, answer, unit, explanation, hint, title),
  title,
});
const guided = [
  c(
    "g-inventory",
    "Define what is weighed",
    "Closed vessel: 50 g container + 12 g and 8 g reactants. Predict the final total.",
    "70 g",
    {
      "20 g": "That is contents only, omitting the vessel.",
      "50 g": "That omits the contents.",
    },
    "The vessel remains 50 g and the retained contents total 20 g. The total reading is 70 g.",
    "Include the same apparatus on both occasions.",
    {
      kind: "mass-conservation",
      mode: "inventory",
      instruction: "Choose what is weighed.",
    },
  ),
  c(
    "g-gas",
    "Follow gas across the boundary",
    "A closed 50 g vessel has 25 g contents. Its 4.5 g CO₂ stays inside. Predict the closed reading, then explore the open model.",
    "75 g",
    {
      "70.5 g": "That requires the gas to leave the weighed vessel.",
      "25 g": "That omits apparatus.",
    },
    "Gas inside still has mass. No material crosses this closed boundary; apparatus plus contents stays 75 g.",
    "Compare the open and closed snapshots.",
    {
      kind: "mass-conservation",
      mode: "gas",
      instruction:
        "Compare closure and release stage, then predict the reading and its cause.",
    },
  ),
  c(
    "g-oxidation",
    "Account for oxygen entering",
    "A supplied complete reaction combines 12 g Mg with 8 g O₂ to form magnesium oxide. What mass of oxide forms?",
    "20 g",
    {
      "12 g": "That omits the reacting oxygen.",
      "8 g": "That omits magnesium.",
    },
    "The oxide includes both 12 g magnesium and 8 g oxygen. Compared with the original solid sample alone, its mass has risen by 8 g.",
    "Change the accounting boundary and scale separately.",
    {
      kind: "mass-conservation",
      mode: "oxidation",
      instruction:
        "Compare the original magnesium sample with the whole closed accounting.",
    },
  ),
  c(
    "g-weighted",
    "Weight every formula amount",
    "For 2H₂ + O₂ → 2H₂O, supplied Mᵣ values are H₂=2, O₂=32 and H₂O=18. Which weighted relative-mass totals agree?",
    "36 on each side",
    {
      "34 and 18": "That ignores both coefficients of 2.",
      "2:1:2 grams": "Equation coefficients are not gram ratios.",
    },
    "2×2 + 1×32 = 36; 2×18 = 36. These are relative-mass totals for the equation amounts, not measured sample grams.",
    "Multiply each complete Mᵣ by its coefficient.",
    {
      kind: "mass-conservation",
      mode: "weighted",
      instruction:
        "Balance the equation, then construct both coefficient-weighted relative-mass totals.",
    },
  ),
];
guided[0].openingHint = true;
export const massConservationJourney: LessonJourney = {
  version: 1,
  introduction:
    "Conserve all matter while defining the measured boundary: gas can move into or out of the weighed collection.",
  scopeNote:
    "Common Foundation/combined conservation and apparent gas-related mass changes. Apparatus, retained gas and leftover reactants are accounted for explicitly. Supplied mass examples avoid mole calculations. Measurement uncertainty, concentration and Higher reacting-mass calculations receive separate lessons. Models compare accounting snapshots, not practical procedures.",
  outcomes: [
    "Define the weighed boundary and include the same apparatus consistently.",
    "Account for all contents, including retained gas and unused reactants.",
    "Explain escaping gas and reacting oxygen entering without creation or destruction of atoms.",
    "Apply coefficients to complete relative formula masses while keeping quantities and units distinct.",
  ],
  warmup: [
    n(
      "w-total",
      "Recall a total",
      "Two fully consumed reactants have masses 7 g and 5 g. In a closed system, what is their total product mass?",
      12,
      "g",
      "7+5=12 g; all material is retained.",
      "Add both masses.",
    ),
    n(
      "w-difference",
      "Recall a change",
      "A vessel reading changes from 83.4 g to 82.2 g. What is the decrease?",
      1.2,
      "g",
      "83.4−82.2=1.2 g.",
      "Subtract final from initial for a decrease.",
    ),
  ],
  refresher: [
    c(
      "r-boundary",
      "Name the measured collection",
      "Why must you state whether a balance reading includes the vessel?",
      "Apparatus mass contributes when apparatus is weighed",
      {
        "Only reacting atoms can affect a reading":
          "The balance also weighs retained apparatus.",
        "A vessel has no mass":
          "The container contributes to the measured total.",
      },
      "Compare the same weighed collection before and after.",
      "Separate container from contents.",
    ),
    c(
      "r-gas",
      "Give retained gas its mass",
      "A reaction forms gas inside a closed vessel. Must the total weighed mass decrease?",
      "No; retained gas still has mass",
      {
        "Yes; all gas is weightless": "Gas is matter with mass.",
        "Yes; gas formation destroys atoms": "Atoms are rearranged.",
      },
      "Gas formation is different from gas leaving the measured boundary.",
      "Track actual transfer.",
    ),
    c(
      "r-leftover",
      "Account for unreacted matter",
      "A closed reaction leaves some reactant unused. Which mass is conserved?",
      "All retained matter, including products and unused reactant",
      {
        "New products alone must equal all starting reactants":
          "Some starting material remains unreacted.",
        "Only the gas product": "Every retained component matters.",
      },
      "Unused reactant is retained matter, but not newly formed product.",
      "Include every component still in the system.",
    ),
    c(
      "r-oxygen",
      "Identify the added material",
      "Why can the oxide from a metal reacting completely in air weigh more than the original metal sample?",
      "Oxygen from the air is incorporated",
      {
        "Heating creates the extra matter":
          "Heat is not the added chemical material.",
        "Metal atoms become heavier without adding atoms":
          "The product includes oxygen atoms.",
      },
      "The original weighed metal boundary excluded the reacting oxygen.",
      "Name the added substance.",
    ),
    c(
      "r-weight",
      "Use coefficient-weighted mass",
      "What operation is required before summing Mᵣ values for equation amounts?",
      "Multiply each complete Mᵣ by its own coefficient",
      {
        "Add unweighted Mᵣ only": "That ignores different formula amounts.",
        "Treat coefficients as grams":
          "Coefficients describe relative amounts, not gram values.",
      },
      "Keep complete formula mass and equation amount separate.",
      "Apply each coefficient to its whole formula.",
    ),
  ],
  guided,
  practice: [
    n(
      "p-closed",
      "Conserve a complete closed total",
      "A closed reaction completely consumes 9 g and 6 g reactants. What total product mass forms?",
      15,
      "g",
      "9+6=15 g.",
      "Add all fully consumed reactants.",
    ),
    n(
      "p-apparatus",
      "Retain the same apparatus",
      "An empty sealed vessel is 42 g and retained contents are 18 g before reaction. What is vessel-plus-contents mass after reaction?",
      60,
      "g",
      "42+18=60 g before and after.",
      "Include the vessel consistently.",
    ),
    n(
      "p-tare",
      "Find contents from a reading",
      "A vessel-plus-contents reading is 68.5 g. The unchanged empty vessel is 48 g. What is contents mass?",
      20.5,
      "g",
      "68.5−48=20.5 g.",
      "Subtract apparatus mass.",
    ),
    n(
      "p-product",
      "Find a second product",
      "A closed reaction completely consumes 15 g reactants and forms two products. One product is 9 g. What is the other product mass?",
      6,
      "g",
      "15−9=6 g.",
      "Account for both products.",
    ),
    n(
      "p-leftover",
      "Separate product and unused reactant",
      "A closed reaction starts with 19 g contents, produces one new product and leaves 3 g unreacted. What mass of new product is present?",
      16,
      "g",
      "19−3=16 g product; total contents still 19 g.",
      "Unused reactant remains matter but is not product.",
    ),
    n(
      "p-open",
      "Calculate escaped gas",
      "The same open vessel and contents change from 81.6 g to 79.2 g. CO₂ is the only material lost. What mass of CO₂ escaped?",
      2.4,
      "g",
      "81.6−79.2=2.4 g escaped CO₂.",
      "Use the same apparatus boundary.",
    ),
    n(
      "p-retained",
      "Account for partial gas escape",
      "A reaction produces 3.6 g CO₂; 1.2 g remains inside the weighed vessel and all other material stays there. What is the vessel’s mass loss?",
      2.4,
      "g",
      "Only 3.6−1.2=2.4 g crosses out.",
      "Gas produced is not necessarily gas escaped.",
    ),
    n(
      "p-final",
      "Predict an open reading",
      "A vessel and contents initially weigh 92 g. Only 3.5 g CO₂ leaves. What is the final reading?",
      88.5,
      "g",
      "92−3.5=88.5 g.",
      "Subtract only the escaped material.",
    ),
    n(
      "p-collected",
      "Extend the weighed boundary",
      "A flask and a connected gas collector are weighed together initially at 124 g. During reaction 2 g CO₂ moves into the collector, with no material lost from the combined collection. What is the final total reading?",
      124,
      "g",
      "The gas crosses within the weighed collection, not out of it.",
      "The collector is included on both occasions.",
    ),
    n(
      "p-oxidation",
      "Include reacting oxygen",
      "A supplied complete reaction combines 18 g magnesium with 12 g oxygen. Only magnesium oxide forms. What is its mass?",
      30,
      "g",
      "18+12=30 g.",
      "Both reactants contribute.",
    ),
    n(
      "p-gain",
      "Recover reacting oxygen mass",
      "A pure magnesium sample is 7.2 g; its complete magnesium oxide product is 12 g with no material lost. What mass of oxygen was added?",
      4.8,
      "g",
      "12−7.2=4.8 g oxygen.",
      "The original sample did not include that oxygen.",
    ),
    n(
      "p-sealed-oxidation",
      "Keep all reactants in a closed collection",
      "An ideal closed accounting includes 10 g calcium and 4 g reacting oxygen, all retained. What combined mass remains after complete oxide formation?",
      14,
      "g",
      "10+4=14 g; oxygen was included from the start.",
      "Compare the same complete collection.",
    ),
    n(
      "p-weighted-water",
      "Apply coefficients to complete Mᵣ",
      "For 2H₂ + O₂ → 2H₂O, supplied Mᵣ H₂=2,O₂=32,H₂O=18. What is the coefficient-weighted product relative-mass total?",
      36,
      "",
      "2×18=36; do not report this as a measured sample mass in grams.",
      "Use the water coefficient.",
    ),
    n(
      "p-weighted-oxide",
      "Weight both reactants",
      "For 2Mg + O₂ → 2MgO, supplied Aᵣ Mg=24 and Mᵣ O₂=32,MgO=40. What is the weighted reactant relative-mass total?",
      80,
      "",
      "2×24+32=80; products give 2×40=80.",
      "Include both magnesium atoms represented by the coefficient.",
    ),
    {
      id: "mc-v1-p-ledger",
      title: "Construct a complete gas inventory",
      prompt:
        "An unchanged 36 g vessel initially holds 14 g reaction mixture. Only 2.5 g CO₂ escapes; all other matter stays inside. Complete final contents, vessel-plus-contents and escaped gas mass.",
      answer: JSON.stringify({ contents: "11.5", reading: "47.5", gas: "2.5" }),
      parts: [
        { id: "contents", label: "Final contents / g", answer: 11.5 },
        { id: "reading", label: "Final vessel + contents / g", answer: 47.5 },
        { id: "gas", label: "Escaped CO₂ / g", answer: 2.5 },
      ],
      partLegend: "Account for every mass with the same boundary",
      explanation:
        "14−2.5=11.5 g contents; 36+11.5=47.5 g reading; 47.5+2.5=50 g including escaped gas.",
      hint: "Include apparatus in the reading and gas in the wider total.",
      purpose:
        "Requires a constructed inventory rather than one final subtraction.",
    },
    c(
      "p-cause",
      "Explain an open mass decrease",
      "An acid/carbonate reaction produces CO₂ in an open vessel whose reading decreases. Which explanation accounts for the material?",
      "CO₂ crosses out of the weighed system and remains in the surroundings",
      {
        "Carbon atoms are destroyed":
          "Carbon-containing gas leaves; its atoms remain.",
        "All gas has zero mass": "Gas has mass.",
      },
      "Include escaped gas when accounting for all matter.",
      "Name what crosses the boundary.",
    ),
    c(
      "p-heating",
      "Reject mass creation by heat",
      "A metal reacts with oxygen and its oxide sample is heavier. Why is “heat created mass” wrong here?",
      "The added oxygen accounts for the greater sample mass",
      {
        "Heating makes more metal atoms":
          "Atoms are not created by this chemical reaction.",
        "Oxygen has no mass": "Oxygen is matter with mass.",
      },
      "The relevant additional material is reacting oxygen.",
      "Account for atoms, not just temperature.",
    ),
    c(
      "p-molecule",
      "Distinguish regrouping from conservation",
      "Do different numbers of reactant and product molecules prove that total mass changed?",
      "No; atoms can regroup into a different number of molecules",
      {
        "Yes; every molecule has the same mass":
          "Different molecules have different composition and mass.",
        "Yes; atom numbers must equal molecule numbers":
          "Those are different quantities.",
      },
      "Conservation concerns all element atoms and their mass, not identical molecule totals.",
      "Keep molecule and atom counts distinct.",
    ),
    c(
      "p-incomplete",
      "Limit the inference from a reading",
      "An open vessel loses mass. Without product or transfer information, what can you conclude about the cause?",
      "The weighed collection has lost net material; the substance needs evidence",
      {
        "It must always be CO₂":
          "Different processes can lose different gases or other material.",
        "Atoms must have been destroyed":
          "Chemical accounting does not require atom destruction.",
      },
      "Name CO₂ only when the reaction/products support it. Open evaporation, spills or other gases can also change a reading.",
      "Use the supplied evidence rather than a memorised gas name.",
    ),
    c(
      "p-leftover-rule",
      "Bound reactant-to-product equality",
      "A starting mixture contains excess reactant that is not consumed. Which is valid?",
      "Products plus unreacted material equal retained starting contents in a closed system",
      {
        "New product alone must equal every starting gram":
          "That omits unused reactant.",
        "Unused material stops contributing to mass":
          "It remains in the system.",
      },
      "The conserved total includes every retained component.",
      "Separate product from unchanged material.",
    ),
    {
      ...c(
        "p-explain",
        "Explain gas loss with atoms and boundary",
        "Explain why an open carbonate/acid flask can lose measured mass while total matter is conserved.",
        "The reaction forms CO₂, which escapes from the weighed flask. Its carbon and oxygen atoms still exist in the surroundings. Including the gas with the flask and retained contents preserves the total; gas formation inside a closed weighed system would not lower its reading.",
        {},
        "Use gas identity, the boundary and retained atoms.",
        "Explain where the gas goes rather than saying it vanishes.",
      ),
      options: undefined,
      rubric: [
        "Names CO₂ as the supplied gas product.",
        "States that it crosses out of the weighed flask.",
        "Retains its atoms/mass in the wider accounting and contrasts retained gas.",
      ],
    },
    {
      ...c(
        "p-evaluate",
        "Explain apparent mass gain",
        "Explain why 12 g magnesium forming 20 g magnesium oxide does not create 8 g of matter, given complete reaction with oxygen and no material lost.",
        "The oxide contains 12 g magnesium and 8 g oxygen that came from outside the original weighed metal sample. Counting magnesium and this oxygen from the start gives 20 g before and after. The extra sample mass is oxygen, not matter created by heating.",
        {},
        "Keep solid-only and complete-system accounting separate.",
        "Identify the added 8 g and its original location.",
      ),
      options: undefined,
      rubric: [
        "Identifies 8 g reacting oxygen.",
        "States it was outside the original magnesium sample boundary.",
        "Accounts for 20 g complete reacting material before and after without mass creation.",
      ],
    },
  ],
  checkForms: [
    [
      n(
        "ca-product",
        "Calculate a new retained product",
        "A closed reaction completely consumes 11 g and 7 g reactants. One of its two products is 5 g. What is the other product mass?",
        13,
        "g",
        "11+7−5=13 g.",
        "Account for both complete reactants and products.",
      ),
      n(
        "ca-reading",
        "Use a new apparatus boundary",
        "An unchanged vessel is 31 g and its initial contents are 16 g. Only 1.8 g CO₂ escapes. What is final vessel-plus-contents mass?",
        45.2,
        "g",
        "31+16−1.8=45.2 g.",
        "Include the same vessel and subtract escaped gas.",
      ),
      n(
        "ca-oxygen",
        "Infer new reacting oxygen",
        "A 13.5 g pure aluminium sample becomes 25.5 g aluminium oxide without loss. What oxygen mass was added?",
        12,
        "g",
        "25.5−13.5=12 g.",
        "Account for the added material.",
      ),
      c(
        "ca-retained",
        "Check retained gas",
        "Gas forms inside a closed weighed collection with no material transfer. What happens to total mass?",
        "It remains unchanged",
        {
          "It decreases because gas is weightless": "Retained gas has mass.",
          "It increases because new atoms appear":
            "Chemical reactions rearrange atoms.",
        },
        "No material crosses the weighed boundary.",
        "Include the gas.",
      ),
      c(
        "ca-leftover",
        "Check all retained components",
        "A closed reaction produces 15 g new products and leaves 4 g reactant unused. What total contents mass is retained?",
        "19 g",
        {
          "15 g": "That omits unused material.",
          "11 g":
            "Unused material remains, rather than being subtracted from retained product mass.",
        },
        "15+4=19 g all retained contents.",
        "Add all components in the system.",
      ),
    ],
    [
      n(
        "cb-reading",
        "Account for a collected gas boundary",
        "A flask-plus-collector combination starts at 86 g. A 1.4 g gas moves from flask into the included collector, with no material leaving the combination. What is final total mass?",
        86,
        "g",
        "The gas remains within the weighed combination.",
        "Track the specified combined boundary.",
      ),
      n(
        "cb-leftover",
        "Separate new products from unused material",
        "A closed reaction starts with 23 g contents and leaves 5 g unchanged reactant. Only one new product forms. What is its mass?",
        18,
        "g",
        "23−5=18 g newly formed product.",
        "Unused reactant still contributes to total contents.",
      ),
      n(
        "cb-weighted",
        "Use a new weighted species amount",
        "A supplied balanced equation forms 3H₂O. Given Mᵣ H₂O=18, what relative-mass contribution do these product amounts represent?",
        54,
        "",
        "3×18=54 relative-mass units of bookkeeping, not measured grams.",
        "Apply the complete-formula coefficient.",
      ),
      c(
        "cb-cause",
        "Check a sample mass increase",
        "Which accounts for a metal sample gaining mass when completely forming its oxide in air?",
        "Oxygen from outside the original sample is incorporated",
        {
          "Heat creates new matter": "The product includes reacting oxygen.",
          "The metal alone changes mass without combining":
            "The oxide contains oxygen.",
        },
        "Include the reacting oxygen in complete accounting.",
        "Name the added chemical material.",
      ),
      c(
        "cb-inference",
        "Check evidence limits",
        "A vessel loses mass but no reaction or escaping material is identified. Is “CO₂ escaped” established?",
        "No; the escaping substance requires evidence",
        {
          "Yes; all mass losses are CO₂": "Different transfers are possible.",
          "No; mass loss always means atoms are destroyed":
            "Open boundaries can lose material without destroying it.",
        },
        "A measured change alone does not identify the gas.",
        "Use reaction and transfer evidence.",
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "ra-product",
        "Retrieve another product balance",
        "A closed reaction completely consumes 28 g reactants. One of two products is 17 g. What is the other product mass?",
        11,
        "g",
        "28−17=11 g.",
        "Retain all product masses.",
      ),
      n(
        "ra-gas",
        "Retrieve partial gas escape",
        "A reaction makes 5 g gas and 2 g remains inside the weighed flask. Only gas can leave. What mass is lost?",
        3,
        "g",
        "5−2=3 g escapes.",
        "Distinguish formed from escaped gas.",
      ),
      c(
        "ra-boundary",
        "Retrieve consistent apparatus accounting",
        "Why include the same unchanged vessel in both before and after readings?",
        "To compare the same weighed collection",
        {
          "To make gas have no mass": "Gas retains mass.",
          "To count the vessel as a reaction product":
            "Apparatus is not newly formed product.",
        },
        "Consistent boundaries make changes meaningful.",
        "Keep apparatus treatment the same.",
      ),
    ],
    [
      n(
        "rb-oxygen",
        "Retrieve an oxygen contribution",
        "A 21 g magnesium sample gives 35 g magnesium oxide with no material lost. What mass of oxygen was added?",
        14,
        "g",
        "35−21=14 g.",
        "Name the added material.",
      ),
      n(
        "rb-tare",
        "Retrieve contents from apparatus",
        "A vessel plus contents weighs 94 g; the same empty vessel weighs 62 g. What is contents mass?",
        32,
        "g",
        "94−62=32 g.",
        "Separate apparatus from contents.",
      ),
      c(
        "rb-weighted",
        "Retrieve the coefficient rule",
        "How should you total relative masses for the quantities in a balanced equation?",
        "Add each complete Mᵣ multiplied by its coefficient",
        {
          "Add only the unweighted formulas": "That ignores amounts.",
          "Read the coefficients as grams":
            "They specify relative amounts, not gram ratios.",
        },
        "Use coefficient × whole-formula relative mass.",
        "Keep formula mass and amount separate.",
      ),
    ],
  ],
};
for (const q of [
  ...massConservationJourney.warmup,
  ...massConservationJourney.refresher,
  ...guided,
  ...massConservationJourney.practice,
])
  q.followUp = q.id.includes("weighted")
    ? "mc-v1-r-weight"
    : q.id.includes("leftover") || q.id.includes("product")
      ? "mc-v1-r-leftover"
      : q.id.includes("oxygen") ||
          q.id.includes("oxidation") ||
          q.id.includes("gain") ||
          q.id.includes("heating") ||
          q.id.includes("evaluate")
        ? "mc-v1-r-oxygen"
        : q.id.includes("gas") ||
            q.id.includes("open") ||
            q.id.includes("cause") ||
            q.id.includes("collected") ||
            q.id.includes("retained") ||
            q.id.includes("explain")
          ? "mc-v1-r-gas"
          : "mc-v1-r-boundary";

import { extendMassWriting } from "./mass-writing";
extendMassWriting(massConservationJourney);
