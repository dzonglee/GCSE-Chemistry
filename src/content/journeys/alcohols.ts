import type { AlcoholMode } from "../../lib/alcohols";
import { fuelPlots } from "../../lib/alcohols";
import type { LearningTask as AlcoholTask, LessonJourney } from "../types";
const prefix = "alc-v1-";
function c(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  mode?: AlcoholMode,
  record = "initial",
): AlcoholTask {
  const options = [answer, ...Object.keys(errors)],
    offset = [...id].reduce((s, x) => s + x.charCodeAt(0), 0) % options.length;
  return {
    id: prefix + id,
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    ...(mode
      ? { model: { kind: "alcohol", mode, record, instruction: title } }
      : {}),
  };
}
function n(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  unit: string,
  explanation: string,
  hint: string,
  mode?: AlcoholMode,
  record = "initial",
): AlcoholTask {
  return {
    id: prefix + id,
    title,
    purpose: title,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    ...(mode
      ? { model: { kind: "alcohol", mode, record, instruction: title } }
      : {}),
  };
}
function w(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
): AlcoholTask {
  return {
    id: prefix + id,
    title,
    purpose: title,
    prompt,
    answer,
    rubric,
    explanation: answer,
    hint,
  };
}
function draw(
  id: string,
  title: string,
  prompt: string,
  answer: string,
): AlcoholTask {
  return {
    ...w(
      id,
      title,
      prompt,
      answer,
      [
        "Requested carbon count, including the carboxyl carbon where present.",
        "Every atom and bond displayed; correct whole C–O–H or C(=O)–O–H group.",
        "Each neutral C has bond-order total four, O two and H one; total formula agrees.",
      ],
      "Start from your own carbon count and attach each O and H.",
    ),
    organicDrawing: {
      maxCarbons: 4,
      note: "Build your requested structure from a blank scaffold. Saved structures require self-review; the app does not award an examiner drawing mark.",
    },
  };
}
export const warmup: AlcoholTask[] = [
  c(
    "w-oxygen",
    "Recall oxygen bonding",
    "What bond-order total does a neutral oxygen atom normally have in these molecules?",
    "2",
    { "1": "One is normal for hydrogen.", "4": "Four is normal for carbon." },
    "A single bond counts one; a double bond counts two. Neutral oxygen normally totals two.",
    "Count bonding units, not only neighbouring atoms.",
  ),
  n(
    "w-mass",
    "Measure fuel actually used",
    "A burner and fuel weigh 28.6 g before and 27.4 g after burning. How much fuel was consumed?",
    "1.2",
    "g",
    "28.6 − 27.4 = 1.2 g. The burner is present in both measurements.",
    "Subtract after from before.",
  ),
];
export const refresher: AlcoholTask[] = [
  c(
    "r-name-stems",
    "Learn the first-four carbon stems",
    "For the reviewed first-four straight-chain examples, which mapping counts ALL carbons, including the carboxyl carbon?",
    "1 meth-, 2 eth-, 3 prop-, 4 but-",
    {
      "1 eth-, 2 meth-, 3 but-, 4 prop-":
        "Those familiar stems are attached to the wrong carbon counts.",
      "Count only carbons outside COOH":
        "The carboxyl carbon is part of the acid's total carbon count.",
    },
    "The first-four carbon counts use meth-, eth-, prop-, but-. In these straight-chain examples count every C, including the C in COOH.",
    "Count all C atoms before choosing the stem.",
  ),
  c(
    "r-name-suffix",
    "Connect names and functional groups",
    "Which suffix distinction fits these saturated first-four alcohol and carboxylic-acid examples?",
    "Alcohol: -ol; carboxylic acid: -oic acid",
    {
      "Alcohol: -oic acid; carboxylic acid: -ol":
        "Those suffixes reverse the functional-group classes.",
      "Both classes end in -ene":
        "That ending belongs to alkene names, not these oxygen-containing groups.",
    },
    "Alcohol examples: methanol, ethanol, propanol, butanol. Acid examples: methanoic, ethanoic, propanoic, butanoic acid. The supplied end-OH Pearson examples are propan-1-ol and butan-1-ol; their suffix remains -ol.",
    "Identify the whole C–O–H or C(=O)–O–H group before choosing the name ending.",
  ),
  c(
    "r-oh",
    "Recognise a covalent alcohol group",
    "An alcohol has C–O–H. What is the OH here?",
    "A covalently bonded group in the molecule",
    {
      "A free hydroxide ion": "A covalent OH group is not automatically OH⁻.",
      "An oxygen molecule": "The O is connected to C and H.",
    },
    "Alcohol oxygen makes a C–O bond and an O–H bond.",
    "Read both connections.",
  ),
  c(
    "r-cooh",
    "Recognise the whole acid group",
    "Which displayed connections define a carboxyl group?",
    "C(=O)–O–H",
    {
      "C–O–H only": "That omits the separate carbonyl oxygen.",
      "C=C": "That is an alkene bond.",
    },
    "The same carboxyl carbon is attached to both oxygens.",
    "Find both C=O and C–O–H.",
  ),
  n(
    "r-acid-carbon",
    "Count the acid carbon",
    "CH₃–C(=O)–O–H contains how many carbon atoms?",
    "2",
    "carbon atoms",
    "The methyl carbon and carboxyl carbon both count.",
    "The C inside COOH belongs to the chain.",
  ),
  n(
    "r-methanol-h",
    "Count oxygen-bound hydrogen",
    "CH₃–O–H contains how many hydrogen atoms in total?",
    "4",
    "H atoms",
    "Three on carbon plus one on oxygen gives four.",
    "Include the H on O.",
  ),
  c(
    "r-family",
    "Use structure rather than formula alone",
    "A supplied C₂H₆O molecule is drawn C–O–C, with no O–H bond. Does its formula alone establish that it is an alcohol?",
    "No; its connectivity lacks the alcohol O–H bond",
    {
      "Yes; any C₂H₆O must be ethanol":
        "Different structures can share a molecular formula.",
      "Yes; any molecule containing O is an alcohol":
        "Many functional groups contain oxygen.",
    },
    "The supplied connectivity, not formula alone, determines the functional group. No extra compound name is required.",
    "Look for the actual O–H connection.",
  ),
  c(
    "r-water",
    "Interpret dissolving",
    "Methanol mixes with water without reacting. What happens to the alcohol’s molecular identity?",
    "It remains methanol",
    {
      "It becomes a hydroxide salt":
        "Covalent alcohol OH is not a free hydroxide ion.",
      "It becomes ethanoic acid": "Dissolving is not controlled oxidation.",
    },
    "Mixing/dissolving retains the alcohol molecules; methanol solution is neutral in the GCSE model.",
    "Separate mixing from reaction.",
  ),
  c(
    "r-solubility",
    "Avoid an unlimited-solubility rule",
    "Which statement is appropriate for the first four alcohols?",
    "Smaller alcohols mix readily with water; solubility becomes more limited as the chain grows",
    {
      "All four mix in every proportion":
        "Butanol has limited water solubility.",
      "None can dissolve in water":
        "Methanol, ethanol and propanol mix readily.",
    },
    "Do not infer unlimited miscibility for every larger alcohol from the first examples.",
    "Compare chain length.",
  ),
  c(
    "r-combustion",
    "Recall complete combustion",
    "With sufficient oxygen, what are an alcohol’s complete-combustion products?",
    "Carbon dioxide and water",
    {
      "Carboxylic acid only":
        "That describes controlled oxidation to an acid, not complete combustion.",
      "Hydrogen and sodium salt":
        "Sodium reacting with an alcohol is a different process.",
    },
    "Carbon becomes CO₂ and hydrogen becomes H₂O. Include the alcohol’s oxygen in balancing.",
    "Use the stated sufficient oxygen.",
  ),
  c(
    "r-sodium",
    "Use an actual gas test",
    "An alcohol reacts with sodium. The collected gas gives a squeaky pop with a lighted splint. Which gas is supported?",
    "Hydrogen",
    {
      "Carbon dioxide": "CO₂ is supported by limewater becoming milky.",
      Oxygen: "Oxygen relights a glowing splint.",
    },
    "The observation identifies hydrogen; the salt product is provided rather than requiring an alkoxide equation.",
    "Use the reported test, not bubbles alone.",
  ),
  c(
    "r-carbonate",
    "Recall acid–carbonate products",
    "A carboxylic acid reacts with a carbonate. What product set is expected?",
    "Salt, water and carbon dioxide",
    {
      "Salt and hydrogen": "Acid + metal is a different reaction.",
      "Alcohol and oxygen": "Those are not acid–carbonate products.",
    },
    "Carboxylic acids show the usual acid–carbonate reaction.",
    "Distinguish carbonate from sodium metal.",
  ),
  c(
    "r-oxidation",
    "Preserve the carbon count",
    "Controlled oxidation of ethanol forms which corresponding acid?",
    "Ethanoic acid",
    {
      "Methanoic acid":
        "The two-carbon skeleton is retained in this transformation.",
      "Propanoic acid": "Oxidation does not add a carbon here.",
    },
    "Ethanol and ethanoic acid both have two carbons.",
    "Match the name stem.",
  ),
  c(
    "r-ester",
    "Know the required ester example",
    "Ethanoic acid reacts with ethanol to form which named ester?",
    "Ethyl ethanoate",
    {
      "Ethanoic acid": "That is a starting material.",
      Ethene: "Alcohol dehydration is a different transformation.",
    },
    "The products are ethyl ethanoate and water. Further ester naming is not needed for the reviewed AQA scope.",
    "Keep both reactants in view.",
  ),
  c(
    "r-ferment",
    "Explain the yeast role",
    "Why is yeast supplied for glucose fermentation?",
    "Its enzymes catalyse the process",
    {
      "It supplies the product’s carbon atoms":
        "Glucose supplies the carbon in the intended equation.",
      "It replaces the need for sugar":
        "The feed is an aqueous sugar solution.",
    },
    "Yeast provides enzyme catalysts; suitable conditions allow glucose to form ethanol and CO₂.",
    "Separate catalyst from feedstock.",
  ),
  c(
    "r-stage",
    "Separate production from collection",
    "An existing ethanol–water mixture is enriched by fractional distillation. Is this fermentation?",
    "No; it is physical collection using different boiling behaviour",
    {
      "Yes; it makes ethanol molecules": "The ethanol molecules already exist.",
      "Yes; all heating is fermentation":
        "The process purpose and molecular change determine the classification.",
    },
    "Fermentation chemically produces ethanol; distillation separates an existing mixture.",
    "Ask whether new molecules are made.",
  ),
  c(
    "r-units",
    "Keep measurement units honest",
    "A flame raises water temperature by 10 °C for each gram burned. What has been calculated?",
    "An observed temperature rise of 10 °C/g",
    {
      "A combustion energy of 10 kJ/g": "Temperature is not energy.",
      "A universal fuel constant": "Apparatus heat loss and water mass matter.",
    },
    "A temperature-response normalization is not automatically a true combustion-energy measurement.",
    "Read the stated units.",
  ),
  c(
    "r-weak",
    "Higher extension: define weak acid",
    "In water, why is a carboxylic acid described as weak?",
    "Only a proportion of its molecules ionise",
    {
      "It is always dilute": "Concentration and strength are different.",
      "It cannot react with a carbonate":
        "Weak acids still react with carbonates.",
    },
    "Higher extension: partial ionisation defines acid strength; equal-concentration comparisons are needed when interpreting pH.",
    "Distinguish extent of ionisation from amount per volume.",
  ),
];
export const guided: AlcoholTask[] = [
  n(
    "g-structure",
    "Build methanol",
    "Construct all bonds of methanol. How many H atoms does the COMPLETE molecule have?",
    "4",
    "H atoms",
    "The carbon has three C–H bonds and one C–O bond; O also bonds to H.",
    "Complete C to four and O to two.",
    "structure",
  ),
  c(
    "g-reaction",
    "Use sodium reaction evidence",
    "Reveal the original ethanol/sodium report. Which gas is identified by its supplied test?",
    "Hydrogen",
    {
      "Carbon dioxide": "This is not an acid–carbonate reaction.",
      "Not established": "The supplied squeaky-pop test provides gas evidence.",
    },
    "Ethanol and sodium produce the provided sodium alkoxide and hydrogen.",
    "Read the original test.",
    "reaction",
  ),
  n(
    "g-combustion",
    "Include the fuel oxygen",
    "Balance 2 CH₃OH + ? O₂ → 2 CO₂ + 4 H₂O. What O₂ coefficient is required?",
    "3",
    "",
    "Products have eight O atoms; two come from methanol, leaving six from three O₂.",
    "Count oxygen already inside the fuel.",
    "combustion",
  ),
  c(
    "g-ferment",
    "Distinguish the product mixture",
    "Reveal the original warm glucose/yeast report. What is collected before distillation?",
    "An aqueous mixture containing ethanol",
    {
      "Absolutely pure ethanol": "Water remains in the fermentation mixture.",
      "Ethanoic acid only": "That is not the reported fermentation product.",
    },
    "The intended fermentation forms ethanol and CO₂ under suitable warm anaerobic conditions; ethanol remains in solution.",
    "Read feed and collection together.",
    "fermentation",
  ),
  n(
    "g-fuel",
    "Normalize consumed fuel",
    "For supplied fuel A, burner mass falls 20.4→19.2 g and water rises 20→32 °C. Calculate rise per gram consumed.",
    "10",
    "°C/g",
    "Mass used = 1.2 g; rise = 12 °C; 12÷1.2 = 10 °C/g.",
    "Use differences before dividing.",
    "fuel",
  ),
  c(
    "g-plot",
    "Interpret an extrapolation",
    "Plot the original observations. The target x=8 lies beyond the largest supplied x=7. What is its status?",
    "An extrapolated estimate",
    {
      "A measured value": "No original measurement at x=8 is supplied.",
      "An interpolated estimate":
        "Interpolation lies within the observed x range.",
    },
    "A drawn trend can suggest a value outside the data, with increased uncertainty. Its curve and value require self-review.",
    "Compare target with the original range.",
    "plot",
  ),
];
export const practice: AlcoholTask[] = [
  draw(
    "p-methanol",
    "Draw methanol",
    "Construct methanol with every atom and bond displayed.",
    "CH₃–O–H: C makes three C–H bonds and one C–O bond; O makes C–O and O–H. Formula CH₄O.",
  ),
  draw(
    "p-ethanol",
    "Draw ethanol",
    "Construct ethanol with every atom and bond displayed.",
    "CH₃–CH₂–O–H: the carbon H counts are three and two, plus one oxygen-bound H. Formula C₂H₆O.",
  ),
  draw(
    "p-propanol",
    "Draw the supplied three-carbon alcohol",
    "Construct propan-1-ol, the straight-chain alcohol with OH at the end carbon.",
    "CH₃–CH₂–CH₂–O–H, with all atoms/bonds: carbon H counts 3,2,2 and one O–H. Formula C₃H₈O.",
  ),
  draw(
    "p-butanol",
    "Draw the supplied four-carbon alcohol",
    "Construct butan-1-ol, the straight-chain alcohol with OH at the end carbon.",
    "CH₃–CH₂–CH₂–CH₂–O–H, with all atoms/bonds; formula C₄H₁₀O.",
  ),
  draw(
    "p-methanoic",
    "Draw methanoic acid",
    "Construct methanoic acid, including both oxygen atoms and both hydrogen atoms.",
    "H–C(=O)–O–H. The carboxyl carbon is the only carbon; formula CH₂O₂.",
  ),
  draw(
    "p-ethanoic",
    "Draw ethanoic acid",
    "Construct ethanoic acid with every atom and bond displayed.",
    "CH₃–C(=O)–O–H, fully displayed. Both oxygens attach to the second carbon; formula C₂H₄O₂.",
  ),
  draw(
    "p-propanoic",
    "Draw propanoic acid",
    "Construct propanoic acid with every atom and bond displayed.",
    "CH₃–CH₂–C(=O)–O–H, fully displayed; formula C₃H₆O₂.",
  ),
  draw(
    "p-butanoic",
    "Draw butanoic acid",
    "Construct butanoic acid with every atom and bond displayed.",
    "CH₃–CH₂–CH₂–C(=O)–O–H, fully displayed; formula C₄H₈O₂.",
  ),
  n(
    "p-name-alcohol",
    "Count butanol hydrogen",
    "How many H atoms are in a butanol molecule, C₄H₉OH?",
    "10",
    "H atoms",
    "Nine in C₄H₉ plus one in OH gives ten.",
    "Include oxygen-bound H.",
  ),
  n(
    "p-name-acid",
    "Count propanoic hydrogen",
    "How many H atoms are in CH₃CH₂COOH?",
    "6",
    "H atoms",
    "3+2+1=6; the COOH carbon has no extra carbon-bound H.",
    "Read every group.",
  ),
  c(
    "p-name-from-alcohol",
    "Name a supplied alcohol structure",
    "An original straight-chain structure is CH₃–CH₂–CH₂–CH₂–O–H. Which first-four alcohol name matches?",
    "Butanol",
    {
      Propanol: "The supplied structure has four carbons, not three.",
      "Butanoic acid":
        "The whole COOH group is absent; this structure has the alcohol C–O–H group.",
    },
    "Four carbons give the but- stem and the alcohol group gives the -ol ending: butanol. The end-OH structure is explicitly butan-1-ol in the reviewed Pearson terminology.",
    "Count all four C atoms and identify the actual oxygen connections.",
  ),
  c(
    "p-name-from-acid",
    "Name a supplied one-carbon acid",
    "An original structure is H–C(=O)–O–H. Which first-four acid name matches?",
    "Methanoic acid",
    {
      Methanol:
        "The separate C=O makes the whole COOH group, rather than an alcohol group alone.",
      "Ethanoic acid":
        "The carboxyl carbon is the only carbon here; do not add another for the word acid.",
    },
    "The one carboxyl carbon gives meth-; C(=O)–O–H gives the carboxylic-acid class. This is methanoic acid, CH₂O₂.",
    "Count the C inside COOH once, then choose the acid name.",
  ),
  c(
    "p-neutral",
    "Classify alcohol in water",
    "A clean ethanol–water mixture is reported neutral. Which explanation fits?",
    "Covalent OH in ethanol does not make the solution an alkali",
    {
      "The OH group is necessarily a hydroxide ion":
        "Its covalent bonds do not imply OH⁻.",
      "Neutral means ethanol is insoluble":
        "Dissolution and pH are different properties.",
    },
    "Ethanol mixes with water and the GCSE neutral-solution description does not imply hydroxide ions.",
    "Distinguish OH connectivity from ionic charge.",
    "reaction",
    "water",
  ),
  c(
    "p-water-limit",
    "Use the actual water observation",
    "A supplied large-chain alcohol leaves a second layer after mixing with water. What is justified?",
    "It has limited solubility under the reported conditions",
    {
      "No alcohol ever dissolves in water": "Small alcohols mix readily.",
      "It must have become an acid": "Layering is not proof of oxidation.",
    },
    "The original observation limits a blanket water-miscibility rule.",
    "Use the stated layer evidence.",
  ),
  c(
    "p-sodium",
    "Infer hydrogen from sodium",
    "A sodium/alcohol reaction yields a gas giving a squeaky pop. Which product class is supported?",
    "The provided sodium alkoxide and hydrogen",
    {
      "Salt, water and carbon dioxide":
        "That is the acid–carbonate product set.",
      "Ethyl ethanoate and water":
        "Ester formation requires an acid and alcohol.",
    },
    "Sodium replaces the alcohol’s OH hydrogen; the provided salt structure is sufficient here.",
    "Use partner and gas test.",
    "reaction",
  ),
  c(
    "p-bubbles",
    "Respect missing gas evidence",
    "An unidentified reagent produces bubbles with a sample. No gas test or product analysis is supplied. Which gas identity follows?",
    "None is established from bubbles alone",
    {
      "Hydrogen is proved": "A suitable identification test is missing.",
      "Carbon dioxide is proved": "The limewater observation is missing.",
    },
    "Bubbles establish gas evolution; they do not distinguish H₂ from CO₂ or other gases.",
    "Do not invent an observation.",
  ),
  c(
    "p-oxidise",
    "Use acid-forming oxidation",
    "Ethanol is oxidised under the supplied acid-forming conditions. Which carbon count and product fit?",
    "Two carbons; ethanoic acid",
    {
      "One carbon; methanoic acid":
        "The corresponding transformation retains the carbon skeleton.",
      "Two carbons; water only":
        "Water does not contain the retained carbon atoms.",
    },
    "The OH alcohol group is transformed into COOH without adding a carbon.",
    "Match the stem and group.",
    "reaction",
    "oxidise",
  ),
  c(
    "p-carbonate",
    "Identify carbonate gas",
    "Ethanoic acid and sodium carbonate produce a gas that makes limewater milky. Which gas is established?",
    "Carbon dioxide",
    {
      Hydrogen: "That would need the relevant hydrogen test.",
      Oxygen: "That would relight a glowing splint.",
    },
    "Acid + carbonate produces salt, water and CO₂.",
    "Read the supplied limewater result.",
    "reaction",
    "carbonate",
  ),
  c(
    "p-ester",
    "Identify both esterification products",
    "Ethanoic acid reacts with ethanol. Which products fit the required example?",
    "Ethyl ethanoate and water",
    {
      "Ethene and water": "That is the supplied alcohol-dehydration example.",
      "Ethanoic acid and hydrogen":
        "Those are not the esterification products.",
    },
    "The named required ester is ethyl ethanoate; no wider ester-naming demand is added.",
    "Keep acid + alcohol as the starting pair.",
    "reaction",
    "ester",
  ),
  c(
    "p-dehydrate",
    "Pearson extension: lose water",
    "The provided equation is C₂H₅OH → C₂H₄ + H₂O. Which transformation is represented?",
    "Dehydration to an alkene",
    {
      "Complete combustion": "O₂ reactant and CO₂ products are absent.",
      Fermentation: "The feed is ethanol rather than glucose.",
    },
    "Pearson extension: ethanol loses the elements of water and forms ethene. Detailed pathways follow later.",
    "Use the supplied equation.",
    "reaction",
    "dehydrate",
  ),
  n(
    "p-ethanol-o",
    "Balance ethanol combustion",
    "Balance C₂H₅OH + ? O₂ → 2 CO₂ + 3 H₂O. Give the O₂ coefficient.",
    "3",
    "",
    "Seven product O atoms minus one in ethanol leaves six: three O₂.",
    "Keep the molecular formula unchanged.",
    "combustion",
    "ethanol",
  ),
  n(
    "p-propanol-o",
    "Balance propanol combustion",
    "Balance 2 C₃H₇OH + ? O₂ → 6 CO₂ + 8 H₂O. Give the O₂ coefficient.",
    "9",
    "",
    "Products contain 20 O atoms; two are in the fuel, leaving 18 from nine O₂.",
    "Count the fuel oxygen.",
    "combustion",
    "propanol",
  ),
  n(
    "p-butanol-water",
    "Conserve butanol hydrogen",
    "Complete C₄H₉OH + 6 O₂ → 4 CO₂ + ? H₂O. Give the water coefficient.",
    "5",
    "",
    "Ten H atoms require five H₂O molecules.",
    "Each water contains two H.",
    "combustion",
    "butanol",
  ),
  c(
    "p-multiple",
    "Accept balanced whole multiples",
    "2 C₂H₅OH + 6 O₂ → 4 CO₂ + 6 H₂O is supplied. Is it balanced?",
    "Yes; it is twice a balanced equation",
    {
      "No; every balanced equation must use the smallest numbers":
        "Whole-number balanced multiples still conserve atoms.",
      "No; change ethanol to C₄H₁₂O₂":
        "Scaling coefficients does not change molecule identity.",
    },
    "Each C,H,O inventory doubles consistently.",
    "Count both sides.",
    "combustion",
    "repeated",
  ),
  c(
    "p-ferment",
    "Choose intended fermentation conditions",
    "Which conditions support the intended glucose-to-ethanol fermentation using yeast?",
    "Suitable warm conditions with oxygen excluded",
    {
      "Boiling with unrestricted oxygen":
        "High heat damages the enzyme preparation; intended ethanol fermentation is anaerobic.",
      "Cold always guarantees exactly zero reaction":
        "Cold often slows reaction rather than universally preventing it.",
    },
    "Yeast enzymes work under suitable conditions; an optimum depends on the preparation rather than one universal temperature.",
    "Think enzyme activity and oxygen condition.",
    "fermentation",
  ),
  c(
    "p-cold",
    "Interpret the supplied cold result",
    "The supplied fresh yeast preparation produces a smaller, nonzero CO₂ volume at 8 °C than at 35 °C in the same time. What follows?",
    "The reported cold process is slower",
    {
      "Cold caused exactly zero fermentation":
        "The original CO₂ result is nonzero.",
      "The cold process became distillation":
        "The feed and apparatus purpose are fermentation.",
    },
    "The report supports a rate comparison; it does not establish a universal cutoff.",
    "Use nonzero measured gas.",
    "fermentation",
    "cold",
  ),
  c(
    "p-hot",
    "Use the stated enzyme damage",
    "The supplied 70 °C preparation has independently confirmed enzyme damage and no measurable fermentation. What explains this case?",
    "The reported heat damage prevents effective enzyme catalysis",
    {
      "Every fermentation must be boiled":
        "That conflicts with the original enzyme evidence.",
      "All enzymes everywhere fail at exactly 70 °C":
        "One supplied preparation cannot establish a universal threshold.",
    },
    "Denaturation in the original report is the relevant mechanism, with the temperature treated as this case’s condition.",
    "Use the actual enzyme analysis.",
    "fermentation",
    "hot",
  ),
  c(
    "p-no-yeast",
    "Keep feed and catalyst distinct",
    "Glucose solution at 35 °C has no yeast or other supplied fermentation enzyme and no detected ethanol. What is the relevant missing input?",
    "The specified active enzyme catalyst",
    {
      "Oxygen for intended ethanol fermentation":
        "Intended ethanol fermentation is anaerobic.",
      "A pre-existing ethanol molecule":
        "The intended process produces ethanol from glucose.",
    },
    "Glucose and warmth alone do not supply the intended enzyme catalyst.",
    "Read what is absent.",
    "fermentation",
    "noYeast",
  ),
  c(
    "p-distil",
    "Collect without changing identity",
    "An already formed ethanol–water mixture undergoes fractional distillation. What is the result described most carefully?",
    "An ethanol-enriched fraction, not proved absolutely pure",
    {
      "New ethanol created from glucose":
        "This is physical separation of existing molecules.",
      "Guaranteed absolutely pure ethanol":
        "The supplied separation does not prove that.",
    },
    "Different boiling behaviour enables enrichment. Pure-component boiling points do not imply exact mixture cutoffs or guaranteed purity.",
    "Separate identity, concentration and purity.",
    "fermentation",
    "separate",
  ),
  w(
    "p-ferment-plan",
    "Explain fermentation and collection",
    "Explain the roles of sugar, yeast, warmth and anaerobic conditions, and why distillation is a separate stage.",
    "Aqueous glucose is the feed. Yeast enzymes catalyse formation of ethanol and CO₂ in suitable warm anaerobic conditions. Excessive heat can damage enzymes; cold can slow the process. Fermentation leaves ethanol in an aqueous mixture; fractional distillation later enriches it physically using different boiling behaviour.",
    [
      "Glucose feed and yeast-enzyme catalyst distinguished.",
      "Suitable warm anaerobic conditions; heat damage rather than a universal number.",
      "Aqueous ethanol product and later physical enrichment; no guaranteed absolute purity.",
    ],
    "Organise by feed, catalyst, conditions, products and collection.",
  ),
  n(
    "p-fuel-a",
    "Use actual consumed mass",
    "The supplied A burner falls from 20.4 to 19.2 g. What fuel mass was consumed?",
    "1.2",
    "g",
    "20.4−19.2 = 1.2 g.",
    "Subtract the original readings.",
    "fuel",
  ),
  n(
    "p-fuel-b",
    "Use temperature differences",
    "The supplied B water rises from 20 to 34 °C. What is its temperature rise?",
    "14",
    "°C",
    "34−20 = 14 °C.",
    "A final reading is not a rise.",
    "fuel",
  ),
  c(
    "p-fuel-reverse",
    "Normalize unequal fuel amounts",
    "In the supplied comparison A gives 20 °C from 2.0 g and B gives 10 °C from 0.8 g, with matched water/apparatus. Which greater observed rise per gram follows?",
    "B: 12.5 °C/g compared with A: 10 °C/g",
    {
      "A because its raw rise is larger":
        "Different fuel masses require normalization.",
      "A because 2.0 g is larger": "Consumed mass is the denominator.",
    },
    "A:20÷2=10; B:10÷0.8=12.5. This is an observed response, not guaranteed true combustion energy.",
    "Calculate both per-gram values.",
    "fuel",
    "reversed",
  ),
  c(
    "p-fuel-start",
    "Subtract different starting temperatures",
    "A water reading goes 25→35 °C; B goes 15→29 °C. Equal fuel/water masses and apparatus are supplied. Which rise is greater?",
    "B: 14 °C compared with A: 10 °C",
    {
      "A because 35 °C is the higher final reading":
        "The starting temperatures differ.",
      "They are equal because the fuel mass is equal":
        "Equal fuel mass does not force equal observed rises.",
    },
    "Subtract each original starting temperature before comparing.",
    "Calculate two differences.",
    "fuel",
    "differentStarts",
  ),
  c(
    "p-fuel-water",
    "Keep heated water controlled",
    "Equal fuel masses heat 200 g water for A and 100 g for B. A has the larger raw rise. Can rise alone fairly rank energy released per gram?",
    "No; unequal heated-water masses limit that comparison",
    {
      "Yes; raw rise always equals energy":
        "Water amount affects the temperature response.",
      "Yes; normalization to fuel mass controls water mass":
        "A fuel denominator cannot remove unequal water quantities.",
    },
    "Compare matched heated-water masses and apparatus, or use an appropriate energy calculation with the needed data. No hidden q=mcΔT requirement is added here.",
    "Check the original control report.",
    "fuel",
    "unequalWater",
  ),
  c(
    "p-fuel-repeats",
    "Distinguish repeatability from heat loss",
    "Repeated fuel trials give close rises but the original apparatus loses heat. What do repeats establish?",
    "Repeatability improves; systematic heat loss can remain",
    {
      "Repeats guarantee the true combustion energy":
        "Repeated bias can remain.",
      "Close repeats prove no heat is lost":
        "Precision and systematic error differ.",
    },
    "Repeat measurements can reduce random uncertainty without automatically correcting heat escaping the apparatus.",
    "Ask whether the same bias repeats.",
    "fuel",
    "heatLoss",
  ),
  n(
    "p-energy",
    "Use a supplied energy-per-gram value",
    "A supplied illustrative fuel releases 28 kJ/g. What fuel mass would release 35 kJ using that supplied value?",
    "1.25",
    "g",
    "35÷28=1.25 g. The value is given for this question, not claimed universal for ethanol.",
    "Divide requested energy by energy per gram.",
    "fuel",
    "equalEnergy",
  ),
  n(
    "p-percent",
    "Calculate original solution alcohol volume",
    "An original solution volume is 700 cm³ and its ethanol volume fraction is 45%. Calculate the ethanol volume.",
    "315",
    "cm³",
    "0.45×700=315 cm³. Check that 45% is slightly less than half of 700; 31.5 would be ten times too small.",
    "Convert percent to a decimal.",
  ),
  n(
    "p-ferment-percent",
    "Calculate a mass percentage",
    "A 4.4 kg product mixture contains 5% ethanol by mass. What ethanol mass is present, in grams?",
    "220",
    "g",
    "0.05×4.4 kg=0.22 kg=220 g.",
    "Apply percent, then convert kg to g.",
  ),
  c(
    "p-plot-trend",
    "Describe the observed trend",
    "In the supplied carbon-count table, supplied energy per gram increases but successive gains become smaller. Which trend is supported?",
    "Increasing with smaller successive gains",
    {
      "Exactly proportional to carbon count":
        "The increments are not constant and proportionality is stronger.",
      "A universal true-energy law":
        "The response depends on the supplied apparatus and data.",
    },
    "Describe the actual original observations rather than imposing a straight-line or universal law.",
    "Compare successive y differences.",
    "plot",
  ),
  w(
    "p-plot",
    "Construct and review a graph",
    "Plot the supplied carbon-count/energy-per-gram values, draw your own suitable smooth fit and estimate the supplied energy per gram at carbon count 8.",
    "Original points are (2,30),(3,34),(4,36.5),(5,38),(6,39),(7,39.7), with supplied energy per gram in kJ/g. A reasonable smooth increasing fit should reflect diminishing gains. The target at 8 is an extrapolated estimate, not an observation or universal fuel constant. Review your estimate against your own suitable fit; no single exact extrapolation mark is awarded automatically.",
    [
      "All six original x,y points and fixed scales correctly used; plot positions within half a small square.",
      "Suitable smooth fit represents increasing values with smaller gains; do not force a straight line or join noisy points blindly.",
      "Target at 8 is outside original x range; estimate read consistently from your proposed trend with stated uncertainty.",
    ],
    "Read the original table and distinguish observation from a proposed trend.",
  ),
  w(
    "p-practical",
    "Evaluate a fuel comparison",
    "Explain how to compare observed heating responses of two alcohols fairly and why the result may differ from true combustion energies.",
    "Measure burner+fuel before and after to obtain mass consumed. Measure water initial and final temperatures for the rise. Keep heated-water mass and relevant apparatus/conditions matched; normalize rise to actual fuel consumed. Use repeats to assess variation. Heat loss, incomplete combustion or evaporation can affect interpretation; repeats do not guarantee removal of systematic bias. °C/g is not automatically kJ/g.",
    [
      "Actual consumed-mass and temperature differences.",
      "Matched water/apparatus and a per-consumed-mass comparison.",
      "Relevant losses/limitations; repeats improve repeatability rather than guaranteeing accuracy.",
    ],
    "Separate the measured differences, fair controls and interpretation.",
  ),
  c(
    "p-use",
    "Connect ethanol to use",
    "Why can ethanol be used both as a fuel and as a solvent in relevant applications?",
    "It burns and can dissolve suitable substances",
    {
      "Its OH is a free hydroxide ion":
        "That does not describe alcohol bonding.",
      "It must be an absolutely pure liquid in every application":
        "Uses do not establish universal purity requirements.",
    },
    "Combustion underlies the fuel use; dissolution underlies solvent use. Its suitable properties depend on the application.",
    "Connect each use with a property.",
  ),
  c(
    "p-acid-water",
    "Identify carboxylic acid behaviour",
    "An ethanoic acid solution reacts with carbonate and has acidic pH. Which statement follows?",
    "It shows acidic behaviour in water",
    {
      "Weak acid means it cannot release any H⁺":
        "Weak acids partially ionise.",
      "Any acidic pH proves the acid is strong":
        "pH depends on concentration and acid strength.",
    },
    "The foundation-level behaviour is acidic solution and characteristic reactions; detailed partial-ionisation explanation is labelled Higher.",
    "Separate behaviour from strength.",
  ),
  c(
    "p-higher-pH",
    "Higher extension: compare equal concentrations",
    "Equal-concentration aqueous ethanoic acid and hydrochloric acid are compared under matched conditions. Why does the weak acid normally have the higher pH?",
    "Partial ionisation gives fewer hydrogen ions",
    {
      "Weak means the concentration must be lower":
        "The concentrations are stated equal.",
      "Indicator colour alone proves ionisation percentage":
        "A colour observation does not measure a universal fraction.",
    },
    "Higher extension: HCl ionises essentially completely; ethanoic acid only partially, so equal original concentrations produce different H⁺ concentrations.",
    "Keep the concentration control explicit.",
  ),
];
practice.find((t) => t.id === prefix + "p-plot")!.fuelDrawing = {
  data: fuelPlots.initial,
  note: "Original data: carbon counts 2,3,4,5,6,7; supplied energy values 30,34,36.5,38,39,39.7 kJ/g. Construct your own points, fit and estimate at carbon count 8.",
};
export const checkForms: AlcoholTask[][] = [
  [
    draw(
      "a-draw",
      "Independent alcohol construction",
      "Construct ethanol with every atom and bond displayed.",
      "CH₃–CH₂–O–H fully displayed; five carbon-bound H plus one oxygen-bound H; formula C₂H₆O.",
    ),
    c(
      "a-carbonate",
      "Independent reaction evidence",
      "A carboxylic acid reacts with a carbonate. The gas makes limewater milky. What gas is supported?",
      "Carbon dioxide",
      {
        Hydrogen: "The supplied test supports CO₂, not H₂.",
        Oxygen: "The reported gas does not relight a glowing splint.",
      },
      "Acid–carbonate reaction produces salt, water and CO₂; the supplied gas test supports CO₂.",
      "Read partner and test.",
    ),
    n(
      "a-o",
      "Independent oxygen balance",
      "For C₂H₅OH + ? O₂ → 2 CO₂ + 3 H₂O, give the missing coefficient.",
      "3",
      "",
      "Products have seven O atoms; one is supplied by ethanol, leaving six from three O₂.",
      "Include the O inside ethanol.",
    ),
    c(
      "a-ferment",
      "Independent collection judgement",
      "Yeast ferments an aqueous glucose solution. Before any distillation, which product description is most careful?",
      "An aqueous mixture containing ethanol",
      {
        "Absolutely pure ethanol": "The starting water remains.",
        "No ethanol until distillation":
          "Fermentation chemically forms ethanol; distillation separates it.",
      },
      "Ethanol is produced chemically in solution, with CO₂ also formed.",
      "Separate chemical production and physical collection.",
    ),
    n(
      "a-fuel",
      "Independent normalized heating",
      "Matched apparatus and 100 g water are used. Burner+fuel mass falls 24.7→23.9 g, and water rises 18→30 °C. Find observed rise per gram consumed.",
      "15",
      "°C/g",
      "Mass 0.8 g; rise 12 °C; 12÷0.8=15 °C/g.",
      "Calculate both differences before dividing.",
    ),
    c(
      "a-graph",
      "Independent graph limit",
      "Original measured x values span 2–7. A fit is used to propose y at x=8. What is this value?",
      "An extrapolated estimate",
      {
        "A measured observation": "No original x=8 observation is supplied.",
        "An interpolation": "8 lies outside the data range.",
      },
      "Outside-range predictions are extrapolations, with uncertainty.",
      "Compare the target and original x range.",
    ),
    n(
      "a-percent",
      "Independent alcohol fraction",
      "A 600 cm³ solution contains 35% ethanol by volume. Calculate ethanol volume.",
      "210",
      "cm³",
      "0.35×600=210 cm³.",
      "Check that the result is a little over one third of the total.",
    ),
    w(
      "a-explain",
      "Independent enzyme explanation",
      "Explain why suitable warmth supports yeast fermentation but strong heating may prevent it.",
      "Yeast supplies enzyme catalysts. Suitable warmth supports their activity; lower temperature can slow the process. Excessive heating can damage/denature the enzyme preparation so effective fermentation is prevented. An exact universal threshold is not established.",
      [
        "Yeast supplies enzymes, rather than sugar or product atoms.",
        "Suitable warmth and slower cold distinguished.",
        "Excessive heat damages enzymes; no universal temperature claimed.",
      ],
      "Explain enzyme activity rather than saying only “heat speeds everything”.",
    ),
  ],
  [
    draw(
      "b-draw",
      "Independent acid construction",
      "Construct ethanoic acid with every atom and bond displayed.",
      "CH₃–C(=O)–O–H fully displayed; the COOH carbon is the second carbon. Formula C₂H₄O₂.",
    ),
    c(
      "b-oxidise",
      "Independent product classification",
      "Under supplied acid-forming conditions, ethanol is oxidised. Which product is expected?",
      "Ethanoic acid",
      {
        "Only carbon dioxide and water": "That describes complete combustion.",
        "Methanoic acid": "The corresponding product retains two carbons.",
      },
      "Controlled acid-forming oxidation changes the functional group while retaining the two-carbon skeleton.",
      "Read the reaction conditions.",
    ),
    n(
      "b-o",
      "Independent methanol balance",
      "For 2 CH₃OH + ? O₂ → 2 CO₂ + 4 H₂O, give the missing coefficient.",
      "3",
      "",
      "Eight product O atoms minus two in the methanol leaves six from three O₂.",
      "Count all oxygen sources.",
    ),
    c(
      "b-stage",
      "Independent physical separation",
      "Existing ethanol and water are fractionally distilled. Which description fits?",
      "Physical enrichment of an existing mixture",
      {
        "New ethanol molecules formed from glucose":
          "That is fermentation, not this separation.",
        "Guaranteed absolutely pure ethanol":
          "That conclusion needs further evidence.",
      },
      "Vaporisation/condensation uses different boiling behaviour; original molecules retain their identity.",
      "Ask whether molecules are newly made.",
    ),
    n(
      "b-fuel",
      "Independent rise per gram",
      "Matched apparatus and water are used. Burner+fuel mass falls 31.5→30.3 g and water rises 17→26 °C. Calculate rise per gram consumed.",
      "7.5",
      "°C/g",
      "Mass 1.2 g; rise 9 °C; 9÷1.2=7.5 °C/g.",
      "Use consumed mass and rise, not final values.",
    ),
    c(
      "b-fair",
      "Independent control judgement",
      "Two trials burn equal fuel masses but heat different water masses. Does the higher temperature rise alone prove greater energy per gram?",
      "No; unequal water masses limit the direct rise comparison",
      {
        "Yes; equal fuel mass controls everything":
          "Heated-water mass remains different.",
        "Yes; degrees and kilojoules are interchangeable":
          "Temperature and energy are different quantities.",
      },
      "Heating a different water quantity changes the temperature response.",
      "Check both fuel and water quantities.",
    ),
    c(
      "b-ester",
      "Independent ester example",
      "Ethanoic acid reacts with ethanol. Which named ester is formed?",
      "Ethyl ethanoate",
      {
        Ethene: "That belongs to alcohol dehydration.",
        Ethanol: "That is one of the reactants.",
      },
      "The required named ester example is ethyl ethanoate; water is also formed.",
      "Use the supplied acid/alcohol pair.",
    ),
    w(
      "b-explain",
      "Independent graph explanation",
      "A temperature-response graph rises with diminishing gains. Explain why forcing proportionality or claiming a universal true-energy value is inappropriate.",
      "The original y increments diminish, so exact proportionality is not supported. The graph describes the supplied observed heating response, which depends on water/apparatus and losses. A fitted or extrapolated value is an estimate, not an original measurement or universal combustion-energy constant.",
      [
        "Actual trend described from increments.",
        "Observed response distinguished from true combustion energy.",
        "Fit/extrapolation treated as estimated, with uncertainty.",
      ],
      "Separate original observations from stronger claims.",
    ),
  ],
];
export const reviewForms: AlcoholTask[][] = [
  [
    n(
      "ra-h",
      "Delayed molecule count",
      "Methanoic acid is H–C(=O)–O–H. How many H atoms are present?",
      "2",
      "H atoms",
      "One H bonds to C and one to O.",
      "Count both positions.",
    ),
    c(
      "ra-gas",
      "Delayed gas distinction",
      "An alcohol reacts with sodium and the gas gives a squeaky pop. Which gas is supported?",
      "Hydrogen",
      {
        "Carbon dioxide": "That requires different reactant/test evidence.",
        Oxygen: "That is not the squeaky-pop result.",
      },
      "The supplied test supports H₂.",
      "Use the original test.",
    ),
    n(
      "ra-fuel",
      "Delayed fuel calculation",
      "A burner falls 22.8→22.3 g and water rises 21→29 °C. With matched apparatus/water, calculate rise per gram consumed.",
      "16",
      "°C/g",
      "Mass 0.5 g; rise 8 °C; 8÷0.5=16 °C/g.",
      "Subtract, then divide.",
    ),
  ],
  [
    n(
      "rb-carbon",
      "Delayed acid carbon count",
      "CH₃CH₂CH₂COOH contains how many carbon atoms?",
      "4",
      "carbon atoms",
      "Three carbons before COOH plus the carboxyl carbon gives four.",
      "Include the acid-group carbon.",
    ),
    c(
      "rb-stage",
      "Delayed fermentation distinction",
      "Which process chemically forms ethanol from aqueous glucose using yeast?",
      "Fermentation",
      {
        "Fractional distillation":
          "That physically separates an existing mixture.",
        "Complete combustion": "That consumes alcohol to form CO₂ and water.",
      },
      "Yeast enzymes catalyse fermentation under suitable conditions.",
      "Compare feed and molecular change.",
    ),
    c(
      "rb-limits",
      "Delayed measurement evaluation",
      "Close repeated fuel-heating results are obtained while the apparatus loses heat. Which statement is careful?",
      "Results are repeatable; systematic heat loss may remain",
      {
        "Repeats guarantee exact true energies":
          "Repeating the same bias does not remove it.",
        "Close repeats prove no heat escaped":
          "Precision does not establish absence of bias.",
      },
      "Repeats assess consistency; losses still limit energy interpretation.",
      "Separate repeatability from accuracy.",
    ),
  ],
];
export const alcoholRecovery: Record<string, string[]> = {};
const recoveryGroups: [string[], string[]][] = [
  [
    ["p-name-from-alcohol", "p-name-from-acid"],
    ["r-name-stems", "r-name-suffix"],
  ],
  [
    ["p-methanol", "p-ethanol", "p-propanol", "p-butanol", "p-name-alcohol"],
    ["r-oh", "r-methanol-h", "g-structure"],
  ],
  [
    ["p-methanoic", "p-ethanoic", "p-propanoic", "p-butanoic", "p-name-acid"],
    ["r-cooh", "r-acid-carbon", "g-structure"],
  ],
  [
    ["p-neutral", "p-water-limit"],
    ["r-water", "r-solubility"],
  ],
  [
    ["p-sodium", "p-bubbles"],
    ["r-sodium", "g-reaction"],
  ],
  [["p-oxidise"], ["r-oxidation", "g-reaction"]],
  [["p-carbonate"], ["r-carbonate", "g-reaction"]],
  [["p-ester"], ["r-ester", "g-reaction"]],
  [["p-dehydrate"], ["r-combustion", "g-reaction"]],
  [
    ["p-ethanol-o", "p-propanol-o", "p-butanol-water", "p-multiple"],
    ["r-combustion", "g-combustion"],
  ],
  [
    ["p-ferment", "p-cold", "p-hot", "p-no-yeast", "p-ferment-plan"],
    ["r-ferment", "g-ferment"],
  ],
  [["p-distil"], ["r-stage", "g-ferment"]],
  [
    ["p-fuel-a", "p-fuel-b", "p-fuel-reverse", "p-fuel-start"],
    ["w-mass", "g-fuel"],
  ],
  [
    ["p-fuel-water", "p-fuel-repeats", "p-practical"],
    ["r-units", "g-fuel"],
  ],
  [
    ["p-energy", "p-percent", "p-ferment-percent"],
    ["w-mass", "r-units"],
  ],
  [
    ["p-plot-trend", "p-plot"],
    ["g-plot", "r-units"],
  ],
  [["p-use"], ["r-combustion", "r-water"]],
  [
    ["p-acid-water", "p-higher-pH"],
    ["r-weak", "r-carbonate"],
  ],
];
for (const [ids, targets] of recoveryGroups)
  for (const id of ids) {
    const t = practice.find((x) => x.id === prefix + id);
    if (!t) throw Error("Missing recovery source " + id);
    const refs = targets.map((x) => prefix + x);
    alcoholRecovery[t.id] = refs;
    t.followUp = refs[0];
  }
export const alcoholExposureFamilies: Record<string, string[]> = {
  naming: [
    "r-name-stems",
    "r-name-suffix",
    "p-name-from-alcohol",
    "p-name-from-acid",
  ],
  alcoholStructure: [
    "r-oh",
    "r-methanol-h",
    "g-structure",
    "p-methanol",
    "p-ethanol",
    "p-propanol",
    "p-butanol",
    "p-name-alcohol",
    "p-name-from-alcohol",
    "a-draw",
  ],
  acidStructure: [
    "r-cooh",
    "r-acid-carbon",
    "p-methanoic",
    "p-ethanoic",
    "p-propanoic",
    "p-butanoic",
    "p-name-acid",
    "p-name-from-acid",
    "b-draw",
    "ra-h",
    "rb-carbon",
  ],
  sodium: ["r-sodium", "g-reaction", "p-sodium", "p-bubbles", "ra-gas"],
  carbonate: ["r-carbonate", "p-carbonate", "a-carbonate"],
  oxidation: ["r-oxidation", "p-oxidise", "b-oxidise"],
  ester: ["r-ester", "p-ester", "b-ester"],
  combustion: [
    "r-combustion",
    "g-combustion",
    "p-ethanol-o",
    "p-propanol-o",
    "p-butanol-water",
    "p-multiple",
    "a-o",
    "b-o",
  ],
  enzymes: [
    "r-ferment",
    "p-ferment",
    "p-cold",
    "p-hot",
    "p-no-yeast",
    "p-ferment-plan",
    "a-explain",
    "rb-stage",
  ],
  collection: [
    "r-stage",
    "g-ferment",
    "p-distil",
    "p-ferment-plan",
    "a-ferment",
    "b-stage",
    "rb-stage",
  ],
  measuredFuel: [
    "w-mass",
    "g-fuel",
    "p-fuel-a",
    "p-fuel-b",
    "p-fuel-reverse",
    "p-fuel-start",
    "a-fuel",
    "b-fuel",
    "ra-fuel",
  ],
  fuelLimits: [
    "r-units",
    "p-fuel-water",
    "p-fuel-repeats",
    "p-practical",
    "b-fair",
    "rb-limits",
  ],
  percentages: ["p-percent", "p-ferment-percent", "a-percent"],
  graph: ["g-plot", "p-plot-trend", "p-plot", "a-graph", "b-explain"],
  higherStrength: ["r-weak", "p-acid-water", "p-higher-pH"],
};
const all = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
for (const ids of Object.values(alcoholExposureFamilies)) {
  const aliases = ids.map((x) => prefix + x);
  for (const t of all)
    if (aliases.includes(t.id))
      t.exposureAliases = [
        ...new Set([
          ...(t.exposureAliases ?? []),
          ...aliases.filter((x) => x !== t.id),
        ]),
      ];
}
export const alcoholJourney: LessonJourney = {
  practiceGroups: [
    {
      label: "Alcohol and acid structures",
      taskIds: [
        "p-methanol",
        "p-ethanol",
        "p-propanol",
        "p-butanol",
        "p-methanoic",
        "p-ethanoic",
        "p-propanoic",
        "p-butanoic",
        "p-name-alcohol",
        "p-name-acid",
        "p-name-from-alcohol",
        "p-name-from-acid",
      ].map((id) => prefix + id),
    },
    {
      label: "Water and reaction evidence",
      taskIds: [
        "p-neutral",
        "p-water-limit",
        "p-sodium",
        "p-bubbles",
        "p-oxidise",
        "p-carbonate",
        "p-ester",
        "p-dehydrate",
      ].map((id) => prefix + id),
    },
    {
      label: "Complete combustion",
      taskIds: [
        "p-ethanol-o",
        "p-propanol-o",
        "p-butanol-water",
        "p-multiple",
      ].map((id) => prefix + id),
    },
    {
      label: "Fermentation and collection",
      taskIds: [
        "p-ferment",
        "p-cold",
        "p-hot",
        "p-no-yeast",
        "p-distil",
        "p-ferment-plan",
      ].map((id) => prefix + id),
    },
    {
      label: "Fuel measurements and calculations",
      taskIds: [
        "p-fuel-a",
        "p-fuel-b",
        "p-fuel-reverse",
        "p-fuel-start",
        "p-fuel-water",
        "p-fuel-repeats",
        "p-energy",
        "p-percent",
        "p-ferment-percent",
        "p-practical",
      ].map((id) => prefix + id),
    },
    {
      label: "Graphs and estimates",
      taskIds: ["p-plot-trend", "p-plot"].map((id) => prefix + id),
    },
    {
      label: "Uses and acidic behaviour",
      taskIds: ["p-use", "p-acid-water", "p-higher-pH"].map(
        (id) => prefix + id,
      ),
    },
  ],
  version: 1 as const,
  introduction:
    "Construct alcohols and acids, distinguish reactions from their actual evidence, and evaluate fermentation and measured fuel-heating responses.",
  scopeNote:
    "Separate Chemistry: actual AQA8462 4.7.2.3–4 and limited Pearson9.26C–34C, paired2023 Foundation09/Higher02 and2022 Foundation04 questions/mark schemes, and actual RSC/Nuffield materials informed this individually authored lesson. First four alcohol/acid names and full structures are included. Propan-1-ol/butan-1-ol end-OH positions are supplied explicitly. Pearson dehydration and fuel-combustion core-practical context are labelled; detailed pathways follow later. Partial acid ionisation/equal-concentration pH explanation is Higher extension. No alcohol/acid equations beyond required alcohol combustion are demanded; the only required ester name here is ethyl ethanoate. All written, drawn, fit-curve and estimate answers require self-review. Full board coverage, Maths parity and whole-course exam readiness remain unfinished.",
  outcomes: [
    "Construct and interpret the first four alcohols and carboxylic acids with every atom/bond and correct whole functional groups.",
    "Use alcohol sodium/water/combustion/oxidation behaviour and acid carbonate/alcohol reactions, distinguishing supplied gas evidence.",
    "Explain ethanol uses and yeast-enzyme fermentation conditions, mixtures and later physical enrichment.",
    "Balance complete alcohol combustion while counting fuel oxygen and accepting balanced whole multiples.",
    "Calculate consumed fuel mass, temperature rise and observed rise per gram; evaluate controls, repeats and loss limitations.",
    "Plot actual original observations with fixed axes and construct a self-reviewed fit/estimate.",
    "Higher extension: distinguish partial ionisation from dilution and compare equal-concentration weak/strong acid solutions.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
};
