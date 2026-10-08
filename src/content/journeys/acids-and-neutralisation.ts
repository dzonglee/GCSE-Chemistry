import { extendAcidMetalWriting } from "./acid-metal-writing";
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
    `an-v1-${id}`,
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
    `an-v1-${id}`,
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
  id: `an-v1-${id}`,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: points[0],
  rubric: points,
  purpose: title,
});
const m = (
  mode: "pairs" | "products" | "salts" | "identity" | "evidence",
  instruction: string,
): TaskModel => ({ kind: "acid-neutralisation", mode, instruction });
export const acidNeutralisationJourney: LessonJourney = {
  version: 1,
  introduction:
    "Use reacting ions, salt identities and evidence to distinguish acid reactions.",
  scopeNote:
    "Foundation/shared AQA Chemistry 4.4.2.1–4.4.2.4, Combined Trilogy 5.4.2.1–5.4.2.4 and related plain Pearson 3.1–3.3,3.9–3.14. Aqueous acids supply H+; aqueous alkalis supply OH− and are soluble bases. Insoluble metal oxides/hydroxides can be bases without being alkalis. Ordinary supplied Mg/Zn/Fe reactions with dilute hydrochloric/sulfuric acids form salts and H2; do not universally predict H2 for nitric acid with metals. Oxides/hydroxides give salt and water; carbonates additionally give CO2. AQA describes acid neutralisation by carbonates; Pearson separately lists that reaction family and defines a base through salt/water only. These descriptions are not claimed identical. Acid determines chloride/nitrate/sulfate; the positive ion and charge balance determine salt name/formula. The Foundation net ionic shorthand is H+ + OH− → H2O; Na+/Cl− spectators stay separate in solution. Real 3D represents the hydrated version H3O+ + OH− → 2H2O, including one initial water carrying the proton; it retains Na1Cl1O2H4 before/after, with trigonal-pyramidal hydronium, bent 104.5° water and unchanged aqueous spectators. This is a static representative identity mapping, not a microscopic mechanism or full solvent model. The native quantities count supplied reacting units, omitting water background/counterions, and count additional water formed in the GCSE shorthand. Stop when one reactant supply is exhausted; excess H+ or OH− determines the stated strong acid/alkali cases, not overall electrical charge. Every complete solution is electrically neutral through counterions; ion counts do not determine an exact pH. Equal volume alone does not guarantee matching reactive supply. Supplied pH < 7 acidic, pH 7 neutral, pH > 7 alkaline; a given wide-range chart gives approximate pH, whereas litmus alone does not give an exact reading. Warming alone does not prove complete neutralisation and bubbles alone do not identify a gas. Gas tests are supplied teacher-observed evidence, not unsupervised procedures. Required soluble-salt preparation, detailed pH/indicators, titration and Higher strong/weak/factor-ten reasoning need separate lessons; no completed-course/practical/exam certification. Written explanations remain self-reviewed and never automatically correct or official examiner marks.",
  outcomes: [
    "Distinguish acid, insoluble base and soluble alkali.",
    "Predict products for the supplied acid reaction families.",
    "Deduce salt names and charge-balanced formulas.",
    "Track reacting pairs, retained atoms and excess reactants.",
    "Use supplied gas and indicator evidence without unsupported conclusions.",
  ],
  warmup: [
    n(
      "w-charge",
      "Recall ionic balance",
      "Ca2+ pairs with Cl− in a neutral salt formula. How many chloride ions are needed for one calcium ion?",
      2,
      "ions",
      "One Ca2+ needs two Cl− to balance total charge.",
      "Balance +2 with two −1 charges.",
    ),
    c(
      "w-water",
      "Recall water identity",
      "Which formula represents water?",
      "H2O",
      {
        H2: "H2 is hydrogen gas, not water.",
        OH: "OH is not the water formula.",
      },
      "A water molecule contains two H atoms and one O atom.",
      "Keep molecular identity fixed.",
    ),
  ],
  refresher: [
    c(
      "r-ions",
      "Recall reacting ions",
      "Which pair reacts in the GCSE acid–alkali neutralisation equation?",
      "H+ and OH−",
      {
        "Na+ and Cl−": "These are spectators in the NaCl-forming example.",
        "H− and O2−": "These are not the stated aqueous acid/alkali ions.",
      },
      "H+ + OH− → H2O; the proton and hydroxide form water.",
      "Recall the ion supplied by each solution.",
    ),
    c(
      "r-products",
      "Recall reaction families",
      "A supplied acid reacts with a metal carbonate. Which products are expected?",
      "Salt, water and carbon dioxide",
      {
        "Salt and hydrogen":
          "Hydrogen is expected with suitable reactive metals, not this carbonate.",
        "Salt and water only": "The carbonate reaction also gives CO2.",
      },
      "The carbonate group produces CO2 and water as the metal cation forms a salt.",
      "Identify carbonate rather than metal or hydroxide.",
    ),
    c(
      "r-salt",
      "Recall acid-derived name",
      "Which salt family comes from nitric acid in the supplied neutralisation cases?",
      "Nitrates",
      {
        Chlorides: "Chlorides come from hydrochloric acid.",
        Sulfates: "Sulfates come from sulfuric acid.",
      },
      "Nitric acid supplies nitrate ions.",
      "Match acid and negative ion.",
    ),
    c(
      "r-base",
      "Recall soluble bases",
      "An insoluble metal oxide reacts with acid to form salt and water. Is it necessarily an alkali?",
      "No: it is a base, but an alkali is soluble",
      {
        "Yes: every base is soluble":
          "Solubility distinguishes alkalis from insoluble bases.",
        "No: it cannot be a base":
          "The stated neutralisation behaviour identifies a base.",
      },
      "An insoluble oxide can neutralise acid without being a soluble alkali.",
      "Separate base behaviour from solubility.",
    ),
    c(
      "r-evidence",
      "Recall gas evidence",
      "A teacher's supplied gas test reports limewater becoming cloudy. Which gas is supported?",
      "Carbon dioxide",
      {
        Hydrogen: "The supplied hydrogen test would be a squeaky pop.",
        Oxygen: "Limewater cloudiness identifies CO2 in this GCSE context.",
      },
      "The supplied observation supports CO2.",
      "Use the actual observation, not any bubbles.",
    ),
    c(
      "r-indicator",
      "Recall evidence limits",
      "Red litmus turns blue; no numerical pH measurement is supplied. Which claim is justified?",
      "The solution is alkaline; exact pH is unknown",
      {
        "It must be exactly pH 12":
          "Litmus gives a category, not that numerical pH.",
        "It must be neutral": "The stated change indicates alkaline solution.",
      },
      "Litmus supports alkaline classification. Exact pH needs suitable numerical evidence; warming alone also cannot prove final pH 7.",
      "Limit the conclusion to what was measured.",
    ),
    n(
      "r-excess",
      "Recall pair consumption",
      "An illustrative mixture supplies 6 H+ units and 4 OH− units. After all possible 1:1 reacting pairs, how many supplied H+ units remain?",
      2,
      "units",
      "Four pairs react;6−4=2 supplied H+ units remain.",
      "Stop when hydroxide supply runs out.",
    ),
  ],
  guided: [
    n(
      "g-pairs",
      "Form water",
      "4 H+ units meet 4 OH− units. How many additional H2O units form on complete neutralisation?",
      4,
      "units",
      "Four 1:1 reacting pairs form four additional water units in the GCSE shorthand. Atoms are retained, not destroyed.",
      "React one supplied pair at a time.",
      m(
        "pairs",
        "Consume each 1:1 supplied reactive pair, then predict the final residual units and classification. Real 3D is a separate one-pair hydrated reference, not a scale model of the count inventory.",
      ),
    ),
    c(
      "g-products",
      "Predict the product family",
      "Hydrochloric acid reacts with sodium hydroxide. Which products form?",
      "Sodium chloride and water",
      {
        "Sodium chloride and hydrogen":
          "Hydroxide neutralisation forms water, not H2.",
        "Sodium sulfate and water":
          "Hydrochloric acid supplies chloride, not sulfate.",
      },
      "The hydroxide neutralises acid to form water; sodium and chloride make the salt identity.",
      "Identify hydroxide and the acid-derived ion.",
      m(
        "products",
        "Select reactant family, gas and water products; compare metal, oxide, hydroxide and carbonate without treating every acid reaction alike.",
      ),
    ),
    c(
      "g-salts",
      "Deduce the salt formula",
      "Hydrochloric acid reacts with calcium hydroxide. Given Ca2+ and Cl−, which salt formula forms?",
      "CaCl2",
      {
        CaCl: "One Cl− cannot balance Ca2+.",
        "Ca(NO3)2": "This acid supplies chloride, not nitrate.",
      },
      "Two chloride ions balance one calcium ion, giving calcium chloride CaCl2.",
      "Use both acid identity and cation charge.",
      m(
        "salts",
        "Predict the salt name and formula from the supplied acid/cation. Keep polyatomic ion formulas and brackets intact.",
      ),
    ),
    c(
      "g-identity",
      "Identify acid ions",
      "Hydrochloric acid has pH 2. Which acid ion is represented in GCSE aqueous notation?",
      "H+",
      {
        "OH−": "OH− is the alkali's characteristic supplied ion.",
        "H−": "The acid notation has a positive charge.",
      },
      "Acids supply H+ in aqueous GCSE notation; the hydrated reference explains that aqueous protons are carried by water.",
      "Read the ion's charge.",
      m(
        "identity",
        "Use supplied pH and solubility evidence to distinguish acids, soluble alkalis and insoluble bases.",
      ),
    ),
    c(
      "g-evidence",
      "Use a supplied gas test",
      "A teacher reports a gas making limewater cloudy. Which conclusion is supported?",
      "Carbon dioxide is identified by the supplied test",
      {
        "Any gas must be hydrogen": "Gas production alone does not mean H2.",
        "The solution must now have pH 7":
          "A gas test does not measure solution pH.",
      },
      "The supplied test supports CO2, without establishing exact pH or complete reaction.",
      "Limit the conclusion to the evidence.",
      m(
        "evidence",
        "Interpret supplied gas/indicator records. Litmus does not give exact pH; warming alone does not prove neutralisation is complete.",
      ),
    ),
  ],
  practice: [
    c(
      "p-acid-ion",
      "Keep the charge correct",
      "Which ion do acids produce in aqueous GCSE notation?",
      "H+",
      {
        "H−": "The acid ion is positively charged.",
        "OH−": "This is the alkali ion.",
      },
      "Aqueous acids supply hydrogen ions H+.",
      "Check the sign, not just the element.",
    ),
    c(
      "p-alkali-ion",
      "Identify hydroxide",
      "Which supplied ion is characteristic of sodium hydroxide solution?",
      "OH−",
      {
        "Na−": "Sodium forms positive ions, not Na−.",
        "H+": "H+ is the acid's characteristic ion.",
      },
      "Aqueous alkalis supply hydroxide ions OH−.",
      "Separate the reacting ion from the sodium spectator.",
    ),
    c(
      "p-base",
      "Use a supplied solubility fact",
      "CuO is insoluble and reacts with acid to make salt and water. Which description fits?",
      "An insoluble base",
      {
        "An alkali because every base is soluble":
          "Alkalis are soluble bases; the given oxide is insoluble.",
        "Not a base because it is insoluble": "Bases need not all dissolve.",
      },
      "CuO has base behaviour but is not a soluble alkali.",
      "Use both behaviour and solubility.",
    ),
    w(
      "p-base-explain",
      "Explain the classification",
      "Explain why an insoluble metal oxide can neutralise an acid without being called an alkali.",
      "It can act as a base by reacting with acid to make salt and water. An alkali is a soluble base; the given oxide is insoluble.",
      [
        "State base reaction with acid gives salt and water.",
        "Link alkali specifically to solubility.",
      ],
    ),
    c(
      "p-metal",
      "Predict an acid–metal gas",
      "Dilute hydrochloric acid reacts with magnesium. Which gas forms in this ordinary supplied case?",
      "Hydrogen",
      {
        "Carbon dioxide": "No carbonate reactant supplies CO2 here.",
        Oxygen: "The acid–metal pattern produces H2.",
      },
      "Magnesium plus dilute HCl gives magnesium chloride and hydrogen.",
      "Identify metal rather than carbonate.",
    ),
    c(
      "p-oxide",
      "Keep copper in its salt",
      "Sulfuric acid reacts with copper(II) oxide. Which products are expected?",
      "Copper(II) sulfate and water",
      {
        "Copper metal and hydrogen":
          "Acid neutralisation gives a salt, not copper metal.",
        "Copper(II) chloride and water":
          "Sulfuric acid supplies sulfate, not chloride.",
      },
      "The oxide neutralises acid to form copper(II) sulfate and water; copper remains in the salt.",
      "This is not carbon reduction of CuO.",
    ),
    c(
      "p-carbonate",
      "Predict all carbonate products",
      "Nitric acid reacts with calcium carbonate. Which product set is correct?",
      "Calcium nitrate, water and carbon dioxide",
      {
        "Calcium nitrate and hydrogen":
          "A carbonate gives CO2 and water, not H2.",
        "Calcium chloride, water and carbon dioxide":
          "Nitric acid forms nitrate salts.",
      },
      "The acid supplies nitrate; carbonate additionally gives CO2 and water.",
      "Check both acid identity and reaction family.",
    ),
    w(
      "p-family-explain",
      "Explain different gas products",
      "Explain why Mg with dilute HCl and CaCO3 with dilute HCl do not produce the same gas.",
      "The magnesium case is an acid–metal reaction producing hydrogen. The carbonate case produces carbon dioxide and water as well as a salt. The other reactant's family changes the products.",
      [
        "Name H2 for the supplied magnesium case.",
        "Name CO2 for the supplied carbonate case.",
        "Link products to different reactant families.",
      ],
    ),
    c(
      "p-nitrate",
      "Keep a polyatomic ion intact",
      "Nitric acid and magnesium oxide form a salt. Given Mg2+ and NO3−, choose its formula.",
      "Mg(NO3)2",
      {
        MgNO3: "One nitrate cannot balance +2.",
        MgCl2: "Nitric acid supplies nitrate, not chloride.",
      },
      "Two whole nitrate ions balance Mg2+, so brackets give Mg(NO3)2.",
      "Do not change nitrate's internal formula.",
    ),
    c(
      "p-sulfate",
      "Balance unlike charges",
      "Sulfuric acid and aluminium oxide form a salt. Given Al3+ and SO4²−, choose the salt formula.",
      "Al2(SO4)3",
      {
        AlSO4: "+3 and −2 do not sum to zero.",
        Al3SO4: "Use two Al3+ and three sulfate ions.",
      },
      "Two aluminium ions give +6; three sulfate ions give −6.",
      "Find equal total positive and negative charge.",
    ),
    n(
      "p-sodium",
      "Count formula cations",
      "Given Na+ and SO4²−, how many sodium ions occur in one sodium sulfate formula unit?",
      2,
      "ions",
      "Two Na+ balance one SO4²−, giving Na2SO4.",
      "Balance the sulfate ion's−2 charge.",
    ),
    c(
      "p-iron",
      "Use the supplied iron charge",
      "Dilute HCl reacts with iron; the product cation is supplied as Fe2+. Which salt formula follows?",
      "FeCl2",
      {
        FeCl3: "The stated ion is Fe2+, not Fe3+.",
        FeSO4: "Hydrochloric acid supplies chloride, not sulfate.",
      },
      "One Fe2+ requires two Cl−, forming iron(II) chloride.",
      "Do not assume all iron salts use the same cation.",
    ),
    n(
      "p-pairs",
      "Count complete reacting pairs",
      "An illustrative strong-acid/alkali mixture supplies 7 H+ units and 5 OH− units. How many additional H2O units form?",
      5,
      "units",
      "Five pairs can react; two supplied H+ units remain.",
      "Use the smaller reactive supply.",
    ),
    n(
      "p-oh-left",
      "Retain excess hydroxide",
      "A supplied mixture has 3 H+ units and 8 OH− units. After complete 1:1 pair reaction, how many supplied OH− units remain?",
      5,
      "units",
      "Three pairs react;8−3=5 supplied OH− units remain.",
      "Subtract only the pairs that can actually react.",
    ),
    c(
      "p-volume",
      "Avoid equal-volume neutrality",
      "Equal 20 cm³ acid and alkali batches supply 2 H+ and 4 OH− units respectively. Is complete mixing neutral for this stated strong-acid/alkali case?",
      "No: OH− remains in excess, so it is alkaline",
      {
        "Yes: equal volumes always neutralise":
          "Equal volume does not imply equal reactive supply.",
        "No: H+ remains in excess": "Two pairs use all 2 H+ and leave 2 OH−.",
      },
      "After two pairs react, two supplied OH− units remain; equal volumes alone do not establish neutrality.",
      "Compare reacting units, not just volume.",
    ),
    w(
      "p-ion-explain",
      "Explain conservation and spectators",
      "For HCl/NaOH neutralisation, explain what happens to reacting ions and to Na+/Cl− spectators.",
      "H+ and OH− form water in the GCSE shorthand; atoms are retained. Na+ and Cl− remain separate aqueous spectator ions, rather than disappearing or bonding into individual salt molecules.",
      [
        "State H+ + OH− → H2O.",
        "Keep atoms in the water product.",
        "Identify unchanged separate Na+ and Cl− ions.",
      ],
    ),
    c(
      "p-chart",
      "Use a supplied wide-range chart",
      "A supplied universal-indicator chart maps green to approximately pH 7. The solution is green. Which conclusion follows?",
      "Approximately neutral by this chart",
      {
        "Exactly pH 12": "The supplied green chart corresponds to about 7.",
        "All green liquids are neutral without a chart":
          "Use the specified indicator/chart evidence.",
      },
      "This wide-range chart supports approximate pH 7, not a precise probe measurement.",
      "Read the supplied chart and its precision.",
    ),
    c(
      "p-litmus",
      "Limit an indicator conclusion",
      "Red litmus turns blue. No pH probe or wide-range chart is supplied. What follows?",
      "Alkaline, but exact pH is not determined",
      {
        "Exactly pH 12": "Litmus identifies a category, not that precise pH.",
        "Neutral because the colour changed":
          "The supplied change indicates alkalinity.",
      },
      "Litmus supports alkaline classification; it does not supply a numerical pH.",
      "Distinguish classification from measurement.",
    ),
    c(
      "p-warming",
      "Do not overclaim completion",
      "A reacting acid/alkali mixture becomes warmer, but final pH is unmeasured. Does warming prove final pH 7?",
      "No: heat release alone does not establish complete neutralisation",
      {
        "Yes: every temperature rise means pH 7":
          "A partially neutralised mixture can also release heat.",
        "No reaction can produce heat":
          "The observed warming is consistent with heat release.",
      },
      "Temperature evidence does not show whether excess acid or alkali remains.",
      "Ask what evidence measures final acidity.",
    ),
    w(
      "p-evidence-explain",
      "Explain gas identification",
      "A student sees bubbles in an unidentified acid reaction and claims they prove hydrogen. Explain what is missing.",
      "Bubbles show gas production but do not identify the gas. The reactant family and a supplied suitable gas-test result are needed; carbonate reactions can give CO2 while the stated reactive-metal cases give H2.",
      [
        "Bubbles alone do not identify a gas.",
        "Distinguish carbonate CO2 from metal H2.",
        "Use supplied gas-test evidence rather than carry out a test here.",
      ],
    ),
  ],
  checkForms: [
    [
      c(
        "a-missing",
        "Complete both reaction identities",
        "Potassium hydroxide + an unknown acid → potassium sulfate + an unknown product. Which acid and product complete both gaps?",
        "Sulfuric acid and water",
        {
          "Hydrochloric acid and water":
            "Hydrochloric acid forms chloride rather than sulfate.",
          "Sulfuric acid and hydrogen":
            "Hydroxide neutralisation forms water, not H2.",
        },
        "Sulfate identifies sulfuric acid; the hydroxide reaction also forms water.",
        "Use the salt family and the other reactant type.",
      ),
      n(
        "a-water",
        "Fresh pair inventory",
        "An illustrative mixture supplies 9 H+ units and 6 OH− units. How many additional water units form on complete 1:1 pair reaction?",
        6,
        "units",
        "Six pairs react; three H+ units remain.",
        "Use the smaller supply.",
      ),
      n(
        "a-left",
        "Fresh excess inventory",
        "For the same 9 H+ and 6 OH− supply, how many supplied H+ units remain?",
        3,
        "units",
        "9−6=3 supplied acid units remain.",
        "Retain unused reactants.",
      ),
      c(
        "a-formula",
        "Fresh salt formula",
        "Given Ca2+ and NO3− after calcium oxide reacts with nitric acid, choose the salt formula.",
        "Ca(NO3)2",
        {
          CaNO3: "One nitrate cannot balance Ca2+.",
          CaCl2: "The supplied acid gives nitrate, not chloride.",
        },
        "Two nitrate ions balance one calcium ion.",
        "Keep nitrate intact.",
      ),
      w(
        "a-explain",
        "Explain excess ions",
        "Two equal-volume strong-acid/alkali batches supply 5 H+ and 8 OH− units. Explain why complete reaction does not give a neutral solution in this supplied case.",
        "Only five 1:1 pairs can react. Three supplied OH− units remain in excess, so the resulting stated strong-acid/alkali mixture is alkaline. Equal volume did not mean equal reacting supply.",
        [
          "Five pairs react.",
          "Three OH− units remain.",
          "Link excess hydroxide to alkaline classification; equal volume is insufficient.",
        ],
      ),
    ],
    [
      c(
        "b-missing",
        "Complete both reaction identities",
        "Magnesium oxide + an unknown acid → magnesium chloride + an unknown product. Which pair completes the gaps?",
        "Hydrochloric acid and water",
        {
          "Nitric acid and water": "Nitric acid gives nitrate, not chloride.",
          "Hydrochloric acid and hydrogen":
            "An oxide forms water in this supplied neutralisation.",
        },
        "Chloride identifies hydrochloric acid; oxide neutralisation forms water.",
        "Use both independent clues.",
      ),
      n(
        "b-water",
        "Fresh pair inventory",
        "An illustrative mixture supplies 8 H+ units and 11 OH− units. How many additional water units form on complete 1:1 pair reaction?",
        8,
        "units",
        "Eight pairs react, leaving three supplied OH− units.",
        "The acid supply limits the pairs.",
      ),
      n(
        "b-left",
        "Fresh excess inventory",
        "For the same 8 H+ and 11 OH− supply, how many supplied OH− units remain?",
        3,
        "units",
        "11−8=3 supplied alkali units remain.",
        "Subtract the pairs from hydroxide supply.",
      ),
      c(
        "b-formula",
        "Fresh salt formula",
        "Given Mg2+ and SO4²− after magnesium oxide reacts with sulfuric acid, choose the salt formula.",
        "MgSO4",
        {
          Mg2SO4: "One Mg2+ already balances one sulfate.",
          MgCl2: "Sulfuric acid gives sulfate.",
        },
        "One 2+ cation balances one 2− sulfate ion.",
        "Balance whole ions.",
      ),
      w(
        "b-explain",
        "Fresh evidence limitation",
        "A mixture warms and produces bubbles, but reactants and gas-test results are unspecified. Explain why this does not establish hydrogen or final pH 7.",
        "Warming supports heat release, not complete neutralisation. Bubbles indicate gas but do not identify it; suitable supplied gas evidence is needed. Neither observation measures final pH or proves no acid/alkali excess remains.",
        [
          "Warming does not prove final pH 7.",
          "Bubbles do not identify H2.",
          "Use appropriate supplied gas and pH evidence.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      c(
        "v-a-ion",
        "Retrieve reacting identity",
        "Which product appears in H+ + OH− → ? in the GCSE neutralisation shorthand?",
        "H2O",
        {
          H2: "Hydrogen gas is not the neutralisation product.",
          NaCl: "Spectator ions are not part of this net reacting pair.",
        },
        "Hydrogen and hydroxide form water.",
        "Recall the net ionic equation.",
      ),
      n(
        "v-a-left",
        "Retrieve acid excess",
        "A supplied mixture has 10 H+ units and 7 OH− units. How many supplied H+ units remain after all possible pairs?",
        3,
        "units",
        "Seven pairs react;10−7=3 acid units remain.",
        "Use the 1:1 ratio.",
      ),
      c(
        "v-a-gas",
        "Retrieve carbonate products",
        "Dilute HCl reacts with a calcium carbonate sample. Which gas is expected?",
        "CO2",
        {
          H2: "Carbonate produces CO2, not the metal-reaction H2.",
          O2: "Oxygen is not the supplied carbonate product.",
        },
        "Acid plus carbonate forms salt, water and carbon dioxide.",
        "Read the reactant family.",
      ),
    ],
    [
      c(
        "v-b-salt",
        "Retrieve acid naming",
        "A nitrate salt is produced when a supplied metal oxide reacts with which acid?",
        "Nitric acid",
        {
          "Hydrochloric acid": "That gives chloride salts.",
          "Sulfuric acid": "That gives sulfate salts.",
        },
        "Nitric acid provides nitrate ions.",
        "Match salt family to acid.",
      ),
      n(
        "v-b-water",
        "Retrieve paired consumption",
        "A supplied mixture has 6 H+ and 9 OH− units. How many additional water units form after all possible reacting pairs?",
        6,
        "units",
        "Six pairs react; three alkali units remain.",
        "Use the smaller supply.",
      ),
      c(
        "v-b-litmus",
        "Retrieve evidence precision",
        "Red litmus turns blue. Does this alone show exactly pH 12?",
        "No: it supports alkalinity, not an exact pH",
        {
          "Yes: blue always means exactly 12":
            "Litmus does not give that exact number.",
          "No: it proves an acidic solution":
            "The supplied litmus change indicates alkaline.",
        },
        "A numerical pH needs suitable chart or probe evidence.",
        "Distinguish category from exact reading.",
      ),
    ],
  ],
};

const recovery: Record<string, string> = {
  "p-acid-ion": "r-ions",
  "p-alkali-ion": "r-ions",
  "p-base": "r-base",
  "p-base-explain": "r-base",
  "p-metal": "r-products",
  "p-oxide": "r-products",
  "p-carbonate": "r-products",
  "p-family-explain": "r-products",
  "p-nitrate": "r-salt",
  "p-sulfate": "r-salt",
  "p-sodium": "r-salt",
  "p-iron": "r-salt",
  "p-pairs": "r-excess",
  "p-oh-left": "r-excess",
  "p-volume": "r-excess",
  "p-ion-explain": "r-ions",
  "p-chart": "r-indicator",
  "p-litmus": "r-indicator",
  "p-warming": "r-indicator",
  "p-evidence-explain": "r-evidence",
};
for (const task of acidNeutralisationJourney.practice)
  task.followUp = `an-v1-${recovery[task.id.replace("an-v1-", "")]}`;

extendAcidMetalWriting(acidNeutralisationJourney);
