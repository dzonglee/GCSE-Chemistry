import type { LearningTask, LessonJourney } from "../types";
import type { IonMode } from "../../lib/ion-tests";
export type IonGiven = {
  title: string;
  rows: { label: string; text: string }[];
};
const id = (s: string) => "ion-tests-v1-" + s;
type Model = { mode: IonMode; record: string };
function choice(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: Model,
  given?: IonGiven,
): LearningTask {
  const options = [answer, ...Object.keys(errors)],
    n = [...s].reduce((t, c) => t + c.charCodeAt(0), 0) % options.length;
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
    ...(model
      ? { model: { kind: "ion-test-investigation" as const, ...model } }
      : {}),
    ...(given ? { ionGiven: given } : {}),
  };
}
function written(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
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
  };
}
function equation(
  s: string,
  title: string,
  prompt: string,
  z: number,
  metal: string,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: JSON.stringify({ metal: "1", hydroxide: String(z), product: "1" }),
    explanation: `${metal}${z === 2 ? "²⁺" : "³⁺"}(aq) + ${z}OH⁻(aq) → ${metal}(OH)${z === 2 ? "₂" : "₃"}(s). Atoms and net charge balance.`,
    hint: "Keep the species fixed. Count metal, oxygen and hydrogen; match the net charge too. Use the smallest positive whole numbers.",
    partLegend: "Smallest positive whole-number coefficients",
    ionGiven: {
      title: "Fixed species",
      rows: [
        {
          label: "Equation to balance",
          text: `__ ${metal}${z === 2 ? "²⁺" : "³⁺"}(aq) + __ OH⁻(aq) → __ ${metal}(OH)${z === 2 ? "₂" : "₃"}(s)`,
        },
      ],
    },
    parts: [
      {
        id: "metal",
        label: "Coefficient of metal ion",
        answer: 1,
        inputMode: "numeric",
      },
      {
        id: "hydroxide",
        label: "Coefficient of hydroxide ion",
        answer: z,
        inputMode: "numeric",
      },
      {
        id: "product",
        label: "Coefficient of solid product",
        answer: 1,
        inputMode: "numeric",
      },
    ],
  };
}
const warmup: LearningTask[] = [
  choice(
    "w-solid",
    "Recognise a precipitate",
    "An insoluble solid appears when two solutions are mixed. What is it?",
    "A precipitate",
    {
      "A flame": "The observation is in the solutions, not a flame.",
      "An aqueous ion":
        "Aqueous ions are dissolved; this observation is an insoluble solid.",
    },
    "A precipitate is an insoluble solid formed in a reaction.",
    "Distinguish solid, solution and gas.",
  ),
  choice(
    "w-charge",
    "Recall cations",
    "Which ion is a cation?",
    "Ca²⁺",
    {
      "Cl⁻": "Chloride is a negatively charged anion.",
      "SO₄²⁻": "Sulfate is a negatively charged anion.",
    },
    "A cation carries positive charge.",
    "Read the charge sign.",
  ),
  choice(
    "w-co2",
    "Confirm carbon dioxide",
    "Which recorded result supports carbon dioxide?",
    "The gas makes limewater cloudy",
    {
      "Bubbles appear": "Bubbles show a gas evolved, not which gas.",
      "A glowing splint relights": "Relighting supports oxygen.",
    },
    "Cloudy limewater is the positive carbon-dioxide test.",
    "Use the gas test from Testing gases.",
  ),
  choice(
    "w-ratio",
    "Combine ion charges",
    "Which neutral formula combines Ca²⁺ with Cl⁻?",
    "CaCl₂",
    {
      CaCl: "One chloride does not balance 2+.",
      "Ca₂Cl": "Two calcium ions increase the positive imbalance.",
    },
    "Two chloride ions balance each calcium ion.",
    "Match total positive and negative charge.",
  ),
];
const refresher: LearningTask[] = [
  choice(
    "r-flame",
    "Read a flame result",
    "The supplied clean-wire flame is lilac. Which cation is supported?",
    "Potassium",
    {
      Sodium: "Sodium's flame is yellow.",
      Calcium: "Calcium's flame is orange-red.",
    },
    "Potassium gives a lilac flame.",
    "Name the observed flame colour first.",
    { mode: "flame", record: "flame-k" },
  ),
  choice(
    "r-white",
    "Keep unresolved candidates",
    "Only a white hydroxide precipitate is recorded. Which set remains possible?",
    "Aluminium, calcium or magnesium",
    {
      "Only aluminium": "Its excess-reagent dissolution was not observed.",
      "Only copper(II)": "Copper(II) gives a blue hydroxide precipitate.",
    },
    "All three give white; excess reagent is a separate observation.",
    "Do not invent a missing stage.",
    { mode: "hydroxide", record: "oh-white" },
  ),
  choice(
    "r-excess",
    "Use the excess result",
    "The white precipitate dissolves in excess sodium hydroxide. Which cation is supported within the specified set?",
    "Aluminium",
    {
      Calcium: "Its white precipitate remains.",
      Magnesium: "Its white precipitate remains.",
    },
    "Only aluminium's precipitate dissolves in excess among these candidates.",
    "Compare before and excess.",
    { mode: "hydroxide", record: "oh-al" },
  ),
  choice(
    "r-halide",
    "Keep reagents in order",
    "What precedes silver nitrate in the specified halide test?",
    "Dilute nitric acid",
    {
      "Dilute hydrochloric acid": "This introduces chloride.",
      "Dilute sulfuric acid":
        "Use the specified nitric acid, not sulfate-bearing acid.",
    },
    "Acidify with dilute nitric acid, then add silver nitrate.",
    "Avoid adding a halide with the acid.",
    { mode: "anion", record: "anion-cl" },
  ),
  choice(
    "r-sulfate",
    "Choose the sulfate chain",
    "Which specified chain tests for sulfate?",
    "Dilute hydrochloric acid, then barium chloride",
    {
      "Dilute sulfuric acid, then barium chloride":
        "The acid itself introduces sulfate.",
      "Dilute nitric acid, then silver nitrate": "That is the halide chain.",
    },
    "A white barium sulfate precipitate is the positive result.",
    "Match acid, test reagent and solid.",
    { mode: "anion", record: "anion-so4" },
  ),
  choice(
    "r-carbonate",
    "Confirm the evolved gas",
    "Acid produces bubbles. Which further result supports carbonate?",
    "The evolved gas makes limewater cloudy",
    {
      "The solution is colourless": "That does not identify the gas.",
      "The gas was not tested": "A missing test cannot confirm carbon dioxide.",
    },
    "Carbonate plus dilute acid evolves carbon dioxide, confirmed with limewater.",
    "Bubbles alone are insufficient.",
    { mode: "anion", record: "anion-co3" },
  ),
  choice(
    "r-charge",
    "Balance charge as well as atoms",
    "In Fe³⁺ + __ OH⁻ → Fe(OH)₃, how many hydroxide ions are required?",
    "3",
    {
      "2": "Two leaves net 1+ and too few O/H.",
      "1": "One leaves net 2+ and too few O/H.",
    },
    "Three hydroxide ions balance Fe³⁺ and supply three OH groups.",
    "Read the metal charge and product subscript.",
    { mode: "equation", record: "eq-fe3" },
  ),
  choice(
    "r-portions",
    "Protect the next test",
    "Why use separate fresh portions for different chemical tests?",
    "Previous reagents can contaminate later results",
    {
      "To change the original ion identities":
        "Each portion starts with the same original sample.",
      "To make every result positive": "A test must retain its actual result.",
    },
    "Independent portions avoid introducing chloride, sulfate or other interfering reagents from an earlier test.",
    "Track what has already been added.",
    { mode: "fault", record: "fault-portion" },
  ),
];
// Recovery records are selected individually rather than routing unlike colours
// through the potassium or white-precipitate example.
refresher.push(
  choice(
    "r-li",
    "Recover crimson",
    "Which cation matches a clean-wire crimson flame?",
    "Lithium",
    {
      Calcium: "Its specified flame is orange-red.",
      Potassium: "Its flame is lilac.",
    },
    "Lithium gives crimson; use the named distinction from calcium orange-red.",
    "Read the controlled flame result.",
    { mode: "flame", record: "flame-li" },
  ),
  choice(
    "r-na",
    "Recover yellow flame",
    "Which cation matches a clean-wire yellow flame in a single-cation set?",
    "Sodium",
    {
      Potassium: "Potassium is lilac.",
      "Copper(II)": "Copper flame is green.",
    },
    "Sodium gives yellow; distinguish a yellow flame from a yellow silver iodide precipitate.",
    "Name the observed object.",
    { mode: "flame", record: "flame-na" },
  ),
  choice(
    "r-ca",
    "Recover orange-red",
    "Which cation matches a clean-wire orange-red flame?",
    "Calcium",
    { Lithium: "Lithium gives crimson.", Sodium: "Sodium gives yellow." },
    "Calcium gives orange-red.",
    "Keep the two red descriptions distinct.",
    { mode: "flame", record: "flame-ca" },
  ),
  choice(
    "r-cu",
    "Recover copper's two tests",
    "Which pair distinguishes copper observations?",
    "Green flame; blue hydroxide precipitate",
    {
      "Blue flame; green hydroxide precipitate":
        "The colours are assigned to the wrong tests.",
      "Brown flame; white hydroxide precipitate":
        "These are not the specified copper observations.",
    },
    "Copper gives green flame; copper(II) gives blue hydroxide precipitate.",
    "Use both the test and observed object.",
    { mode: "hydroxide", record: "oh-cu" },
  ),
  choice(
    "r-fe2",
    "Recover iron(II)",
    "Which cation gives this immediate green hydroxide precipitate?",
    "Iron(II)",
    {
      "Iron(III)": "Iron(III) gives brown.",
      "Copper(II)": "Copper hydroxide is blue.",
    },
    "Immediate green precipitate supports iron(II).",
    "Read the oxidation state.",
    { mode: "hydroxide", record: "oh-fe2" },
  ),
  choice(
    "r-fe3",
    "Recover iron(III)",
    "Which cation gives this brown hydroxide precipitate?",
    "Iron(III)",
    {
      "Iron(II)": "Iron(II)'s immediate result is green.",
      Magnesium: "Its hydroxide precipitate is white.",
    },
    "Brown hydroxide precipitate supports iron(III).",
    "Read the charge distinction.",
    { mode: "hydroxide", record: "oh-fe3" },
  ),
  choice(
    "r-br",
    "Recover bromide",
    "Which halide produces a cream precipitate after nitric acid and silver nitrate?",
    "Bromide",
    {
      Chloride: "Its precipitate is white.",
      Iodide: "Its precipitate is yellow.",
    },
    "Silver bromide is cream.",
    "Compare all three named solid colours.",
    { mode: "anion", record: "anion-br" },
  ),
  choice(
    "r-i",
    "Recover iodide",
    "Which halide produces a yellow solid after nitric acid and silver nitrate?",
    "Iodide",
    {
      Sodium: "Sodium gives a yellow flame in a different test.",
      Bromide: "Silver bromide is cream.",
    },
    "Silver iodide is a yellow precipitate.",
    "Keep flame and solid distinct.",
    { mode: "anion", record: "anion-i" },
  ),
  choice(
    "r-compound",
    "Recover both-ion reasoning",
    "Only a calcium flame result is available. Which conclusion is possible?",
    "Calcium is supported; the anion and compound remain unknown",
    {
      "Calcium chloride is confirmed": "No chloride test is recorded.",
      "Calcium sulfate is confirmed": "No sulfate test is recorded.",
    },
    "A whole compound identity requires evidence for both ions.",
    "Do not invent the missing anion test.",
    { mode: "compound", record: "salt-incomplete" },
  ),
);
const guided: LearningTask[] = [
  choice(
    "g-flame",
    "Read the flame",
    "Which cation is supported?",
    "Potassium",
    {
      Sodium: "Yellow belongs to sodium.",
      Lithium: "Crimson belongs to lithium.",
    },
    "Lilac supports potassium in the supplied single-cation set.",
    "Separate flame observation from ion identity.",
    { mode: "flame", record: "flame-k" },
  ),
  choice(
    "g-mask",
    "Limit a mixture conclusion",
    "A mixture gives only a strong yellow flame. What follows?",
    "Sodium is present; other cations are not ruled out",
    {
      "The mixture is pure sodium salt": "Sodium may mask another colour.",
      "Potassium is absent":
        "No visible lilac does not establish absence in a masked mixture.",
    },
    "Flame colours can be masked in mixtures.",
    "Presence is a narrower conclusion than purity.",
    { mode: "flame", record: "flame-mixture" },
  ),
  choice(
    "g-white",
    "Stop before guessing",
    "Only the first white result is recorded. What can you identify?",
    "The cation remains among aluminium, calcium and magnesium",
    {
      "Aluminium alone": "No excess-reagent dissolution has been recorded.",
      "Iron(III)": "Its specified hydroxide precipitate is brown.",
    },
    "Keep all compatible candidates until more evidence exists.",
    "Read both recorded stages.",
    { mode: "hydroxide", record: "oh-white" },
  ),
  choice(
    "g-al",
    "Use a second stage",
    "Which cation matches white precipitate followed by dissolution in excess?",
    "Aluminium",
    {
      Calcium: "Its precipitate remains.",
      Magnesium: "Its precipitate remains.",
    },
    "The excess result distinguishes aluminium within this set.",
    "The two observations belong to the same sodium-hydroxide test.",
    { mode: "hydroxide", record: "oh-al" },
  ),
  choice(
    "g-camg",
    "Retain two candidates",
    "The white precipitate remains in excess. Which conclusion is warranted?",
    "Calcium or magnesium; more evidence is needed",
    {
      "Calcium alone":
        "The same two-stage result is compatible with magnesium.",
      Aluminium: "Its precipitate dissolves in excess.",
    },
    "Sodium hydroxide alone does not separate calcium from magnesium here.",
    "Eliminate only a candidate contradicted by the evidence.",
    { mode: "hydroxide", record: "oh-camg" },
  ),
  choice(
    "g-halide",
    "Build a halide chain",
    "Which result is positive for the requested chloride test?",
    "White precipitate after nitric acid then silver nitrate",
    {
      "White precipitate after hydrochloric acid then silver nitrate":
        "That acid supplies chloride and contaminates the conclusion.",
      "Lilac flame": "This supports potassium, not the chloride anion.",
    },
    "The method as well as the colour establishes the test meaning.",
    "Choose the fresh portion and correct ordered reagents.",
    { mode: "anion", record: "anion-cl" },
  ),
  choice(
    "g-sulfate",
    "Build the sulfate chain",
    "Which solid is the positive sulfate-test observation?",
    "A white precipitate",
    {
      "A green flame": "A flame is a different test.",
      "A colourless gas":
        "The specified sulfate test forms an insoluble solid.",
    },
    "Barium sulfate is a white precipitate after the specified acid/reagent chain.",
    "Keep the solid and flame observations distinct.",
    { mode: "anion", record: "anion-so4" },
  ),
  choice(
    "g-carbonate",
    "Include confirmation",
    "Which record confirms the gas in this carbonate test?",
    "Cloudy limewater",
    {
      "Bubbles alone": "Gas evolution does not identify the gas.",
      "No gas test": "The confirming observation is missing.",
    },
    "Use the evolved gas's limewater result as well as acid effervescence.",
    "Track the gas from the acid reaction.",
    { mode: "anion", record: "anion-co3" },
  ),
  choice(
    "g-fault",
    "Reject introduced chloride",
    "Does this hydrochloric-acid/silver-nitrate result identify chloride originally in the sample?",
    "No; the acid itself introduces chloride",
    {
      "Yes; every white precipitate proves sample chloride":
        "The reagent chain contaminates that conclusion.",
      "No; it proves sulfate instead":
        "An invalid chloride test does not identify a replacement ion.",
    },
    "Repeat on a fresh portion with dilute nitric acid.",
    "Find the source of the ion in the reagent.",
    { mode: "fault", record: "fault-hcl" },
  ),
  choice(
    "g-eq-cu",
    "Conserve atoms and charge",
    "Which smallest coefficient of OH⁻ balances this copper(II) equation?",
    "2",
    {
      "1": "Both charge and O/H fail.",
      "3": "Three supplies too many OH groups.",
    },
    "Cu²⁺ needs two OH⁻ to form Cu(OH)₂.",
    "Use the live atom/charge ledger.",
    { mode: "equation", record: "eq-cu" },
  ),
  choice(
    "g-eq-fe",
    "Distinguish iron charges",
    "Which smallest coefficient of OH⁻ balances iron(III) hydroxide formation?",
    "3",
    {
      "2": "That fits iron(II), not Fe³⁺.",
      "1": "One OH⁻ does not neutralise Fe³⁺.",
    },
    "Fe³⁺ + 3OH⁻ → Fe(OH)₃.",
    "Do not change the fixed species to force a balance.",
    { mode: "equation", record: "eq-fe3" },
  ),
  choice(
    "g-salt",
    "Use both portions",
    "Which supplied single compound matches the paired evidence?",
    "Potassium bromide, KBr",
    {
      "Potassium chloride, KCl": "The halide precipitate is cream, not white.",
      "Sodium bromide, NaBr": "The flame is lilac, not yellow.",
    },
    "Use cation and anion evidence, then combine their charges.",
    "Do not name a whole salt from one ion test.",
    { mode: "compound", record: "salt-kbr" },
  ),
];
const practice: LearningTask[] = [
  choice(
    "p-li",
    "Distinguish red flame names",
    "A controlled clean-wire flame is crimson. Which cation?",
    "Lithium",
    { Calcium: "Calcium is orange-red.", Sodium: "Sodium is yellow." },
    "Lithium gives crimson.",
    "Compare the named colours.",
    { mode: "flame", record: "flame-li" },
  ),
  choice(
    "p-na",
    "Read yellow correctly",
    "A controlled single-cation sample gives a yellow flame. Which cation?",
    "Sodium",
    {
      Potassium: "Potassium is lilac.",
      "Copper(II)": "Copper compounds give green flame.",
    },
    "Yellow flame supports sodium in this controlled record.",
    "The flame is the observed object.",
    { mode: "flame", record: "flame-na" },
  ),
  choice(
    "p-ca",
    "Use orange-red",
    "Which cation matches this controlled orange-red flame?",
    "Calcium",
    {
      Lithium: "Crimson is the lithium result.",
      "Copper(II)": "Green is the copper flame result.",
    },
    "Calcium gives orange-red.",
    "Do not collapse the two red descriptions.",
    { mode: "flame", record: "flame-ca" },
  ),
  choice(
    "p-cu-flame",
    "Separate two copper tests",
    "What is the copper flame result?",
    "Green flame",
    {
      "Blue precipitate": "That is copper(II)'s hydroxide solid.",
      "Brown precipitate": "That is iron(III)'s hydroxide solid.",
    },
    "Copper flame is green; its hydroxide precipitate is blue.",
    "Read which test was used.",
    { mode: "flame", record: "flame-cu" },
  ),
  choice(
    "p-cu-oh",
    "Identify a blue solid",
    "Which cation is supported by the supplied sodium-hydroxide record?",
    "Copper(II)",
    {
      "Iron(II)": "Its immediate precipitate is green.",
      Aluminium: "Its first precipitate is white.",
    },
    "Copper(II) gives a blue hydroxide precipitate.",
    "Name the solid observation.",
    { mode: "hydroxide", record: "oh-cu" },
  ),
  choice(
    "p-fe2",
    "Keep iron(II) distinct",
    "Which cation gives the recorded immediate green hydroxide precipitate?",
    "Iron(II)",
    {
      "Iron(III)": "Iron(III) gives brown.",
      "Copper(II)": "Copper(II) gives blue.",
    },
    "The immediate green precipitate supports Fe²⁺.",
    "Distinguish charge and precipitate colour.",
    { mode: "hydroxide", record: "oh-fe2" },
  ),
  choice(
    "p-fe3",
    "Keep iron(III) distinct",
    "Which cation gives the recorded brown hydroxide precipitate?",
    "Iron(III)",
    {
      "Iron(II)": "Its specified immediate result is green.",
      Magnesium: "Its hydroxide precipitate is white.",
    },
    "Brown supports Fe³⁺ in the specified candidate set.",
    "Use the actual reagent/result pair.",
    { mode: "hydroxide", record: "oh-fe3" },
  ),
  choice(
    "p-al",
    "Use dissolution",
    "Which cation is supported by white precipitate that dissolves in excess sodium hydroxide?",
    "Aluminium",
    {
      Calcium: "Its precipitate remains.",
      Magnesium: "Its precipitate remains.",
    },
    "This excess result distinguishes aluminium within the specified set.",
    "Use both observations.",
    { mode: "hydroxide", record: "oh-al" },
  ),
  choice(
    "p-camg",
    "Keep unresolved pairs",
    "White precipitate remains in excess. Which claim is justified?",
    "Calcium or magnesium remains possible",
    {
      "Calcium is uniquely confirmed": "Magnesium shares this result.",
      "Aluminium is confirmed": "Its precipitate dissolves in excess.",
    },
    "A further observation is needed to distinguish the pair.",
    "Avoid a stronger conclusion than the record supports.",
    { mode: "hydroxide", record: "oh-camg" },
  ),
  choice(
    "p-cl",
    "Match chloride conditions",
    "Which requested test chain supports chloride?",
    "Nitric acid, silver nitrate, white precipitate",
    {
      "Hydrochloric acid, silver nitrate, white precipitate":
        "The acid introduces chloride.",
      "Nitric acid, silver nitrate, cream precipitate":
        "Cream supports bromide.",
    },
    "Chloride gives white silver chloride after the specified reagents.",
    "The acid matters.",
    { mode: "anion", record: "anion-cl" },
  ),
  choice(
    "p-br",
    "Match bromide conditions",
    "Which precipitate supports bromide after nitric acid and silver nitrate?",
    "Cream precipitate",
    {
      "White precipitate": "White supports chloride.",
      "Yellow precipitate": "Yellow supports iodide.",
    },
    "Silver bromide is cream.",
    "Compare the named halide colours.",
    { mode: "anion", record: "anion-br" },
  ),
  choice(
    "p-i",
    "Match iodide conditions",
    "Which precipitate supports iodide after the specified halide reagents?",
    "Yellow precipitate",
    {
      "Yellow flame": "That is a different test, supporting sodium.",
      "Cream precipitate": "Cream supports bromide.",
    },
    "Silver iodide is a yellow solid precipitate.",
    "Name colour and physical observation.",
    { mode: "anion", record: "anion-i" },
  ),
  choice(
    "p-so4",
    "Protect sulfate evidence",
    "Which acid belongs before barium chloride in the specified sulfate test?",
    "Dilute hydrochloric acid",
    {
      "Dilute sulfuric acid": "This supplies sulfate itself.",
      "No acid": "Use the specified acidified test conditions.",
    },
    "Hydrochloric acid then barium chloride gives white barium sulfate if sulfate is present.",
    "Avoid introducing the target ion.",
    { mode: "anion", record: "anion-so4" },
  ),
  choice(
    "p-co3",
    "Require the gas result",
    "Which is a complete positive carbonate record in this context?",
    "Acid effervescence; the gas makes limewater cloudy",
    {
      "Acid effervescence only": "The evolved gas was not identified.",
      "Gas relights a glowing splint":
        "That supports oxygen, not the carbonate reaction gas.",
    },
    "Carbon dioxide confirmation supports carbonate.",
    "Combine the two observations.",
    { mode: "anion", record: "anion-co3" },
  ),
  choice(
    "p-wire",
    "Repair a false flame conclusion",
    "How should the contaminated-wire result be treated?",
    "Repeat with a clean wire; do not identify from the contaminated result",
    {
      "Report pure sodium salt immediately":
        "The earlier wire contamination prevents that inference.",
      "Report potassium absent": "Sodium can mask its flame colour.",
    },
    "Cleanliness and known references protect flame interpretation.",
    "Track the previous wire sample.",
    { mode: "fault", record: "fault-wire" },
  ),
  choice(
    "p-hcl",
    "Repair the chloride plan",
    "What repairs this hydrochloric-acid/halide test?",
    "Fresh portion, dilute nitric acid, then silver nitrate",
    {
      "Add more silver nitrate to the same portion":
        "The introduced chloride remains.",
      "Name sulfate from the same white precipitate":
        "The invalid test does not establish sulfate.",
    },
    "Do not try to recover an uncontaminated conclusion from a reagent-contaminated portion.",
    "Start with the original sample in a fresh portion.",
    { mode: "fault", record: "fault-hcl" },
  ),
  choice(
    "p-h2so4",
    "Repair the sulfate plan",
    "Why is the sulfuric-acid/barium result invalid for original sample sulfate?",
    "Sulfuric acid introduces sulfate",
    {
      "Barium chloride cannot precipitate sulfate":
        "Barium sulfate does precipitate.",
      "A white solid always identifies chloride":
        "Colour alone without test conditions is insufficient.",
    },
    "The sulfate may have come from the acid.",
    "Trace the target ion's source.",
    { mode: "fault", record: "fault-h2so4" },
  ),
  choice(
    "p-portions",
    "Keep fresh samples separate",
    "Which proposed plan prevents earlier-reagent interference?",
    "Separate fresh portions of the original sample",
    {
      "One tube receiving every reagent in succession":
        "Earlier reagents can interfere.",
      "Keep adding chloride before every test":
        "That contaminates later halide conclusions.",
    },
    "Use independent samples for independent evidence.",
    "A fresh portion has not received another test's reagents.",
    { mode: "fault", record: "fault-portion" },
  ),
  choice(
    "p-white",
    "Reject a premature identity",
    "A white first precipitate alone proves which cation?",
    "It does not uniquely identify aluminium, calcium or magnesium",
    {
      "Aluminium alone": "Excess dissolution is needed.",
      "Magnesium alone": "Aluminium and calcium also produce white.",
    },
    "Keep the compatible candidate set.",
    "A missing excess observation stays missing.",
    { mode: "fault", record: "fault-white" },
  ),
  choice(
    "p-bubbles",
    "Keep observation and inference distinct",
    "Bubbles appear with acid but no gas test is done. Is carbonate confirmed?",
    "No; the gas identification is missing",
    {
      "Yes; every gas bubble is carbon dioxide":
        "Different reactions can evolve gases.",
      "No; oxygen is therefore confirmed":
        "Missing evidence identifies no replacement gas.",
    },
    "Require the limewater observation.",
    "Do not fill a gap by guessing.",
    { mode: "fault", record: "fault-bubbles" },
  ),
  equation(
    "p-eq-mg",
    "Construct magnesium coefficients",
    "Balance the fixed magnesium hydroxide equation using the smallest positive whole numbers.",
    2,
    "Mg",
  ),
  equation(
    "p-eq-al",
    "Construct aluminium coefficients",
    "Balance the fixed initial aluminium hydroxide formation equation.",
    3,
    "Al",
  ),
  choice(
    "p-k2so4",
    "Use both ions and charges",
    "Which single compound matches the paired records?",
    "Potassium sulfate, K₂SO₄",
    {
      "Potassium sulfate, KSO₄": "That formula has net negative charge.",
      "Potassium bromide, KBr":
        "The anion test is barium sulfate evidence, not silver bromide.",
    },
    "Two K⁺ balance one SO₄²⁻.",
    "Infer both ions before writing the formula.",
    { mode: "compound", record: "salt-k2so4" },
  ),
  choice(
    "p-cacl2",
    "Use calcium's second evidence",
    "Which single compound matches these independent flame and halide records?",
    "Calcium chloride, CaCl₂",
    {
      "Calcium chloride, CaCl": "That ratio does not balance charge.",
      "Magnesium chloride, MgCl₂": "The orange-red flame supports calcium.",
    },
    "Flame identifies calcium; the acidified silver precipitate identifies chloride.",
    "Use both records and the ion charges.",
    { mode: "compound", record: "salt-cacl2" },
  ),
  choice(
    "p-incomplete",
    "Leave the unknown anion unknown",
    "Only the orange-red flame is known. Can the whole compound be named?",
    "No; calcium is supported but the anion is unknown",
    {
      "Yes; it must be calcium chloride": "No chloride test was recorded.",
      "Yes; it must be calcium sulfate": "No sulfate test was recorded.",
    },
    "One cation result does not identify the whole compound.",
    "Ask which evidence supports the anion.",
    { mode: "compound", record: "salt-incomplete" },
  ),
  written(
    "p-plan",
    "Write a sequenced two-ion method",
    "A school technician must test a soluble suspected sodium iodide sample using a burner, clean wire, distilled water, dilute nitric acid and silver nitrate. Describe the two tests, their positive results and conclusions. This is an interpretation task, not instructions to try an experiment at home.",
    "For the cation, a clean wire carrying the sample is placed in a blue/non-luminous Bunsen flame; yellow supports sodium. For the anion, dissolve the sample in distilled water in a fresh test-tube portion, add dilute nitric acid and then silver nitrate solution with a dropping pipette. A yellow precipitate after silver nitrate supports iodide. Distinguish yellow flame from yellow solid and keep both test chains clear.",
    [
      "Clean sample-bearing wire and blue/non-luminous flame.",
      "Yellow flame linked to sodium.",
      "Dissolve the soluble sample in distilled water in a separate portion.",
      "Dilute nitric acid before silver nitrate solution; suitable dropping pipette.",
      "Yellow precipitate linked to iodide, distinct from a yellow flame.",
      "Two clearly linked, logically sequenced test/result/conclusion chains.",
    ],
    "Write method → observation → conclusion for each ion.",
  ),
  written(
    "p-molecular",
    "Write a balanced molecular equation",
    "Write the balanced equation, with state symbols, for aqueous copper(II) chloride reacting with aqueous sodium hydroxide to form the hydroxide precipitate.",
    "CuCl₂(aq) + 2NaOH(aq) → Cu(OH)₂(s) + 2NaCl(aq). The copper hydroxide is an insoluble solid; sodium and chloride remain in solution.",
    [
      "Correct fixed formulas CuCl₂, NaOH, Cu(OH)₂ and NaCl.",
      "Smallest coefficients 1, 2, 1, 2 conserve Cu, Cl, Na, O and H.",
      "Aqueous reactants and sodium chloride; solid copper hydroxide.",
      "Do not change subscripts to balance the equation.",
    ],
    "Count each atom on both sides; show the precipitate state.",
  ),
  written(
    "p-distinguish",
    "Explain the remaining pair",
    "Explain why a white hydroxide precipitate remaining in excess cannot by itself distinguish calcium and magnesium. State what further recorded observation would support calcium within that pair.",
    "Both calcium and magnesium form white hydroxide precipitates that remain in excess sodium hydroxide. A separate clean-wire orange-red flame result supports calcium within this pair. Without that further evidence, retain both candidates.",
    [
      "Both candidates share the white/remaining hydroxide result.",
      "The sodium-hydroxide result alone is not unique.",
      "A separate clean-wire orange-red flame supports calcium.",
      "No invented additional result.",
    ],
    "Compare shared evidence with distinguishing evidence.",
  ),
];
practice.push(
  equation(
    "p-eq-fe2",
    "Construct iron(II) coefficients",
    "Balance iron(II) hydroxide formation using smallest positive whole-number coefficients.",
    2,
    "Fe",
  ),
  equation(
    "p-eq-ca",
    "Construct calcium coefficients",
    "Balance the fixed calcium hydroxide formation equation using smallest positive whole-number coefficients.",
    2,
    "Ca",
  ),
  choice(
    "p-cuso4",
    "Combine copper and sulfate",
    "Which single compound matches the separate hydroxide and sulfate records?",
    "Copper(II) sulfate, CuSO₄",
    {
      "Copper(II) chloride, CuCl₂":
        "The anion test supports sulfate, not chloride.",
      "Potassium sulfate, K₂SO₄":
        "The blue hydroxide supports copper(II), not potassium.",
    },
    "Cu²⁺ and SO₄²⁻ balance in a 1:1 formula.",
    "Use both test chains before combining charges.",
    { mode: "compound", record: "salt-cuso4" },
  ),
  choice(
    "p-na2co3",
    "Combine sodium and carbonate",
    "Which single compound matches the independent flame and confirmed-gas records?",
    "Sodium carbonate, Na₂CO₃",
    {
      "Sodium chloride, NaCl":
        "The gas evidence supports carbonate, not chloride.",
      "Potassium sulfate, K₂SO₄":
        "The flame is yellow and the anion test is carbonate confirmation.",
    },
    "Two Na⁺ balance CO₃²⁻; confirmed carbon dioxide supports the carbonate test.",
    "Read cation and anion evidence independently.",
    { mode: "compound", record: "salt-na2co3" },
  ),
);
const checkForms: LearningTask[][] = [
  [
    choice(
      "cA-pair",
      "Read two fresh records",
      "A single unknown gives a clean-wire yellow flame. A separate portion acidified with dilute nitric acid gives a yellow precipitate after silver nitrate. Which pair is supported?",
      "Sodium and iodide",
      {
        "Potassium and bromide": "Lilac/cream would support those.",
        "Sodium and chloride": "Chloride gives a white precipitate.",
      },
      "The observed object matters: yellow flame and yellow solid support different ions.",
      "Separate the cation and anion test.",
    ),
    choice(
      "cA-white",
      "Keep three candidates",
      "A new single-cation sample gives a white precipitate with sodium hydroxide. Excess was not tested. What follows?",
      "Aluminium, calcium or magnesium remains possible",
      {
        "Only aluminium": "Dissolution was not recorded.",
        "Only calcium": "Magnesium and aluminium also give white.",
      },
      "The missing excess result cannot be invented.",
      "Keep all compatible candidates.",
    ),
    choice(
      "cA-acid",
      "Protect the halide test",
      "Why does the specified halide method use nitric acid rather than hydrochloric acid?",
      "Hydrochloric acid would introduce chloride",
      {
        "Nitric acid adds the needed bromide":
          "Nitric acid is not a bromide source.",
        "Hydrochloric acid cannot be dilute":
          "It can be dilute; the introduced ion is the problem.",
      },
      "The acid must not introduce the ion whose presence is inferred.",
      "Trace reagent ions.",
    ),
    choice(
      "cA-iron",
      "Read the brown solid",
      "A fresh sodium-hydroxide test gives a brown precipitate. Which specified cation is supported?",
      "Iron(III)",
      {
        "Iron(II)": "Its immediate precipitate is green.",
        "Copper(II)": "Its precipitate is blue.",
      },
      "Brown hydroxide supports Fe³⁺.",
      "Name the correct test/result pair.",
    ),
    equation(
      "cA-eq-fe2",
      "Balance iron(II)",
      "Independently balance the fixed iron(II) hydroxide equation in the smallest positive whole numbers.",
      2,
      "Fe",
    ),
    choice(
      "cA-sulfate",
      "Read a specified white result",
      "A fresh portion receives dilute hydrochloric acid then barium chloride. A white precipitate forms. Which anion is supported?",
      "Sulfate",
      {
        Chloride: "The chloride test uses nitric acid then silver nitrate.",
        Carbonate:
          "Carbonate requires acid gas evolution and its confirmation.",
      },
      "The reagent conditions identify this as barium sulfate evidence.",
      "White alone is not a test name.",
    ),
    choice(
      "cA-carbonate",
      "Require confirmation",
      "Acid causes bubbles, and the gas makes limewater cloudy. Which anion is supported?",
      "Carbonate",
      {
        Sulfate: "Its specified test forms barium sulfate.",
        Iodide: "Its halide precipitate is yellow.",
      },
      "Carbon dioxide from dilute-acid reaction supports carbonate.",
      "Use both recorded observations.",
    ),
    choice(
      "cA-mixture",
      "Limit a flame claim",
      "A known mixture gives an intense yellow flame with no lilac resolved. What is justified?",
      "Sodium is present; potassium is not ruled out",
      {
        "Potassium is absent": "Its flame may be masked.",
        "Only sodium ions are present": "Purity does not follow.",
      },
      "Mixture flame colours can be masked.",
      "Presence differs from absence of other ions.",
    ),
    written(
      "cA-plan",
      "Independent extended plan",
      "Describe a logically sequenced school-test plan to establish lithium and chloride in a soluble suspected lithium chloride sample. Available: burner, clean wire, test tubes, distilled water, dilute nitric acid, silver nitrate and dropping pipette. Give both positive results and conclusions.",
      "Sample on a clean wire in a blue/non-luminous Bunsen flame gives crimson, supporting lithium. Dissolve the soluble sample in distilled water in a separate fresh test tube portion; add dilute nitric acid, then silver nitrate solution with the dropping pipette. A white precipitate after silver nitrate supports chloride. Link each method, result and ion clearly.",
      [
        "Clean sample-bearing wire in blue/non-luminous flame.",
        "Crimson linked to lithium.",
        "Sample dissolved in distilled water in a separate portion.",
        "Dilute nitric acid then silver nitrate; dropping pipette.",
        "White precipitate linked to chloride.",
        "Coherent sequence and explicit separate ion conclusions.",
      ],
      "Write two complete method/result chains.",
    ),
    choice(
      "cA-formula",
      "Combine both ion charges",
      "A supplied single salt's two tests support Ca²⁺ and Cl⁻. Which formula is neutral?",
      "CaCl₂",
      { CaCl: "This leaves net 1+.", "Ca₂Cl": "This leaves net 3+." },
      "Two chloride ions balance calcium's 2+ charge.",
      "Count charge, not test-tube colour.",
    ),
  ],
  [
    choice(
      "cB-pair",
      "Read an unfamiliar pair",
      "A single unknown gives an orange-red clean-wire flame. A separate portion receives dilute HCl then barium chloride and gives a white precipitate. Which pair is supported?",
      "Calcium and sulfate",
      {
        "Lithium and chloride":
          "Crimson plus acidified silver chloride would be different records.",
        "Magnesium and bromide":
          "The recorded flame and reagents contradict this pair.",
      },
      "Orange-red supports calcium; specified barium precipitate supports sulfate.",
      "Use conditions as well as colours.",
    ),
    choice(
      "cB-excess",
      "Resolve the white group",
      "A white hydroxide precipitate dissolves in excess sodium hydroxide. Which cation is supported among Al³⁺, Ca²⁺ and Mg²⁺?",
      "Aluminium",
      {
        Calcium: "Its precipitate remains.",
        Magnesium: "Its precipitate remains.",
      },
      "Dissolution distinguishes aluminium within this set.",
      "Use the second stage.",
    ),
    choice(
      "cB-acid",
      "Reject introduced sulfate",
      "A sulfate test used sulfuric acid before barium chloride. Why can a white precipitate not establish original sample sulfate?",
      "The acid introduced sulfate",
      {
        "Barium chloride has no reaction with sulfate":
          "Barium sulfate is insoluble.",
        "White precipitates uniquely mean chloride":
          "Reagents are needed to interpret colour.",
      },
      "A reagent-contaminated result cannot locate the original sulfate source.",
      "Trace the target ion.",
    ),
    choice(
      "cB-green",
      "Read the immediate green solid",
      "A sodium-hydroxide record gives an immediate green precipitate. Which cation?",
      "Iron(II)",
      {
        "Iron(III)": "Its specified precipitate is brown.",
        "Copper(II)":
          "Its hydroxide precipitate is blue, despite its green flame.",
      },
      "Immediate green hydroxide supports Fe²⁺.",
      "Do not confuse a green flame with a green solid.",
    ),
    equation(
      "cB-eq-al",
      "Balance aluminium",
      "Independently balance initial aluminium hydroxide precipitate formation.",
      3,
      "Al",
    ),
    choice(
      "cB-halide",
      "Read the cream solid",
      "A fresh portion acidified with dilute nitric acid gives a cream precipitate after silver nitrate. Which anion?",
      "Bromide",
      {
        Chloride: "Its precipitate is white.",
        Iodide: "Its precipitate is yellow.",
      },
      "Cream silver bromide supports bromide.",
      "Read the precipitate name and colour.",
    ),
    choice(
      "cB-gas",
      "Reject an incomplete gas record",
      "An unknown bubbles with dilute acid, but the gas is not tested. Is carbonate confirmed?",
      "No; the gas identification is missing",
      {
        "Yes; bubbles always identify carbonate":
          "Effervescence alone is insufficient.",
        "No; chloride is therefore confirmed":
          "Missing evidence does not identify another ion.",
      },
      "Obtain the limewater result to support carbon dioxide.",
      "Keep unknown evidence unknown.",
    ),
    choice(
      "cB-portions",
      "Track introduced chloride",
      "A barium-chloride-treated sample is reused for silver nitrate. Why is sample chloride identification unsafe?",
      "The earlier reagent introduced chloride",
      {
        "Fresh original portions contain no ions":
          "They contain the sample's ions.",
        "Silver nitrate can never form a white solid":
          "It forms white silver chloride.",
      },
      "Separate fresh portions avoid contamination from earlier tests.",
      "Track all reagents, not just the final one.",
    ),
    written(
      "cB-plan",
      "Independent extended plan",
      "Describe a logically sequenced school-test plan to establish copper(II) and sulfate in a suspected soluble copper(II) sulfate sample, using sodium hydroxide, dilute hydrochloric acid and barium chloride. State the separate portions, observations and conclusions.",
      "Use independent fresh aqueous portions. Add sodium hydroxide to one: a blue precipitate supports copper(II). Acidify a second portion with dilute hydrochloric acid, then add barium chloride solution: a white precipitate supports sulfate. Name each reagent/result/ion chain and do not reuse the first treated portion.",
      [
        "Separate fresh aqueous portions.",
        "Sodium hydroxide on one portion.",
        "Blue precipitate linked to copper(II).",
        "Dilute hydrochloric acid then barium chloride on the second portion.",
        "White precipitate linked to sulfate.",
        "Clear sequence and no unsupported whole-sample purity claim.",
      ],
      "Keep the two ion-test chains distinct.",
    ),
    choice(
      "cB-formula",
      "Combine a sulfate formula",
      "Two tests of a supplied single salt support K⁺ and SO₄²⁻. Which formula is neutral?",
      "K₂SO₄",
      { "KSO₄": "That has net 1−.", "K(SO₄)₂": "That has net 3−." },
      "Two potassium ions balance one sulfate ion.",
      "Use both charges.",
    ),
  ],
];
const reviewForms: LearningTask[][] = [
  [
    choice(
      "vA-copper",
      "Distinguish copper observations",
      "Which pair correctly separates copper flame and copper(II) hydroxide observations?",
      "Green flame; blue precipitate",
      {
        "Blue flame; green precipitate":
          "Those colour assignments are reversed.",
        "Brown flame; white precipitate":
          "Neither is the specified copper pair.",
      },
      "The test determines which physical observation is relevant.",
      "Name flame and solid separately.",
    ),
    choice(
      "vA-white",
      "Keep the unresolved pair",
      "A new white hydroxide precipitate remains in excess. Which candidates remain among Al, Ca and Mg?",
      "Calcium and magnesium",
      {
        "Only aluminium": "Its precipitate dissolves.",
        "Only calcium": "Magnesium shares this result.",
      },
      "A separate distinguishing observation is needed.",
      "Keep the evidence limit.",
    ),
    equation(
      "vA-eq-fe3",
      "Delayed iron(III) equation",
      "Construct the smallest coefficients of the fixed iron(III) hydroxide equation.",
      3,
      "Fe",
    ),
    choice(
      "vA-halide",
      "Recall iodide conditions",
      "Which test/result pair supports iodide?",
      "Dilute nitric acid then silver nitrate; yellow precipitate",
      {
        "Yellow flame only": "That is sodium evidence.",
        "Dilute HCl then barium chloride; white precipitate":
          "That is sulfate evidence.",
      },
      "The specified silver iodide precipitate is yellow.",
      "Recall both reagent order and observed solid.",
    ),
    written(
      "vA-limit",
      "Explain a masked result",
      "A mixed school sample gives a strong yellow flame and no visible lilac. Explain what can and cannot be inferred.",
      "The yellow flame supports sodium present. Sodium's intense emission can mask other flame colours, so absence of resolved lilac cannot rule out potassium and does not establish purity.",
      [
        "Yellow supports sodium presence.",
        "Mixture colours can be masked.",
        "No visible lilac does not prove potassium absence.",
        "No purity claim.",
      ],
      "Distinguish presence, absence and purity.",
    ),
  ],
  [
    choice(
      "vB-lithium",
      "Separate red flame names",
      "Which pair gives the specified lithium/calcium flame colours?",
      "Lithium crimson; calcium orange-red",
      {
        "Lithium orange-red; calcium crimson": "These are reversed.",
        "Both lilac": "Lilac supports potassium.",
      },
      "Keep the two specified red descriptions distinct.",
      "Use the named reference colours.",
    ),
    choice(
      "vB-al",
      "Recall the excess result",
      "Which recorded hydroxide sequence supports aluminium within the specified set?",
      "White precipitate, dissolves in excess sodium hydroxide",
      {
        "White precipitate, remains in excess":
          "That leaves calcium or magnesium.",
        "Blue precipitate, remains": "That supports copper(II).",
      },
      "Both stages matter.",
      "Do not identify from white alone.",
    ),
    equation(
      "vB-eq-ca",
      "Delayed calcium equation",
      "Construct the smallest coefficients of the fixed calcium hydroxide equation.",
      2,
      "Ca",
    ),
    choice(
      "vB-gas",
      "Complete a carbonate record",
      "Which acid-reaction record supports carbonate?",
      "Effervescence; evolved gas makes limewater cloudy",
      {
        "Effervescence only": "The gas identity is untested.",
        "Glowing splint relights": "That identifies oxygen instead.",
      },
      "Cloudy limewater confirms the carbon dioxide.",
      "Recall the complete gas test.",
    ),
    written(
      "vB-method",
      "Explain fresh portions",
      "Explain why hydrochloric acid is inappropriate before silver nitrate in the halide test, and why repeating on the same treated portion does not repair the inference.",
      "Hydrochloric acid supplies chloride, which can form a white silver chloride precipitate. The chloride remains in the treated portion, so the original sample's chloride cannot be established from it. Start with a fresh portion and dilute nitric acid before silver nitrate.",
      [
        "Hydrochloric acid introduces chloride.",
        "Silver chloride can form a white precipitate from that introduced ion.",
        "Same treated portion remains contaminated.",
        "Fresh original portion with dilute nitric acid then silver nitrate.",
      ],
      "Track where chloride comes from and whether it remains.",
    ),
  ],
];
export const ionRecoveryRoutes: Record<string, string[]> = {};
for (const q of warmup) {
  q.followUp = id(
    (
      {
        "w-solid": "r-white",
        "w-charge": "r-charge",
        "w-co2": "r-carbonate",
        "w-ratio": "r-charge",
      } as Record<string, string>
    )[q.id.slice("ion-tests-v1-".length)],
  );
}
// Each practice destination is explicitly selected for the reasoning it needs.
for (const [suffix, target] of [
  ["p-eq-fe2", "r-charge"],
  ["p-eq-ca", "r-charge"],
  ["p-cuso4", "r-cu"],
  ["p-na2co3", "r-carbonate"],
  ["p-li", "r-li"],
  ["p-na", "r-na"],
  ["p-ca", "r-ca"],
  ["p-cu-flame", "r-cu"],
  ["p-cu-oh", "r-cu"],
  ["p-fe2", "r-fe2"],
  ["p-fe3", "r-fe3"],
  ["p-al", "r-excess"],
  ["p-camg", "r-white"],
  ["p-cl", "r-halide"],
  ["p-br", "r-br"],
  ["p-i", "r-i"],
  ["p-so4", "r-sulfate"],
  ["p-co3", "r-carbonate"],
  ["p-wire", "r-flame"],
  ["p-hcl", "r-halide"],
  ["p-h2so4", "r-sulfate"],
  ["p-portions", "r-portions"],
  ["p-white", "r-white"],
  ["p-bubbles", "r-carbonate"],
  ["p-eq-mg", "r-charge"],
  ["p-eq-al", "r-charge"],
  ["p-k2so4", "r-sulfate"],
  ["p-cacl2", "r-charge"],
  ["p-incomplete", "r-compound"],
  ["p-plan", "r-halide"],
  ["p-molecular", "r-charge"],
  ["p-distinguish", "r-white"],
]) {
  const q = practice.find((q) => q.id === id(suffix))!;
  q.followUp = id(target);
  ionRecoveryRoutes[q.id] = [id(target)];
}
practice.find((q) => q.id === id("p-eq-mg"))!.model = {
  kind: "ion-test-investigation",
  mode: "equation",
  record: "eq-mg",
};
practice.find((q) => q.id === id("p-eq-al"))!.model = {
  kind: "ion-test-investigation",
  mode: "equation",
  record: "eq-al",
};
practice.find((q) => q.id === id("p-eq-fe2"))!.model = {
  kind: "ion-test-investigation",
  mode: "equation",
  record: "eq-fe2",
};
practice.find((q) => q.id === id("p-eq-ca"))!.model = {
  kind: "ion-test-investigation",
  mode: "equation",
  record: "eq-ca",
};
export const allIonTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const ionExposureFamilies = {
  sodium: [
    "p-na2co3",
    "r-na",
    "r-flame",
    "p-na",
    "cA-pair",
    "g-mask",
    "vA-limit",
    "cA-mixture",
    "p-plan",
  ],
  potassium: ["r-flame", "g-flame", "g-salt"],
  lithium: ["r-li", "r-ca", "p-li", "cA-plan", "vB-lithium"],
  calcium: [
    "r-ca",
    "r-li",
    "r-flame",
    "p-ca",
    "p-cacl2",
    "cB-pair",
    "vB-lithium",
    "p-distinguish",
  ],
  copperColours: [
    "p-cuso4",
    "r-cu",
    "r-na",
    "p-cu-flame",
    "p-cu-oh",
    "vA-copper",
    "cB-plan",
  ],
  ironII: ["r-fe2", "r-fe3", "r-cu", "p-fe2", "cB-green"],
  ironIII: ["r-fe3", "r-fe2", "p-fe3", "cA-iron"],
  whiteUnknown: ["r-white", "g-white", "p-white", "cA-white"],
  aluminium: ["r-excess", "g-al", "p-al", "cB-excess", "vB-al"],
  calciumMagnesium: ["g-camg", "p-camg", "p-distinguish", "vA-white"],
  halideAcid: [
    "r-halide",
    "g-halide",
    "g-fault",
    "p-cl",
    "p-br",
    "p-i",
    "p-hcl",
    "cA-acid",
    "vB-method",
    "p-plan",
    "cA-plan",
  ],
  sulfate: [
    "p-cuso4",
    "p-k2so4",
    "r-sulfate",
    "g-sulfate",
    "p-so4",
    "p-h2so4",
    "cA-sulfate",
    "cB-acid",
    "cB-plan",
  ],
  chloride: ["r-br", "r-halide", "g-halide", "p-cl", "cA-plan", "p-cacl2"],
  bromide: ["r-br", "r-i", "p-br", "g-salt", "cB-halide"],
  iodide: ["r-i", "r-br", "p-i", "p-plan", "cA-pair", "vA-halide"],
  carbonate: [
    "p-na2co3",
    "w-co2",
    "r-carbonate",
    "g-carbonate",
    "p-co3",
    "p-bubbles",
    "cA-carbonate",
    "cB-gas",
    "vB-gas",
  ],
  portions: ["r-portions", "p-portions", "cB-portions", "vB-method"],
  divalentEq: [
    "p-eq-fe2",
    "p-eq-ca",
    "g-eq-cu",
    "p-eq-mg",
    "cA-eq-fe2",
    "vB-eq-ca",
    "p-molecular",
  ],
  trivalentEq: ["r-charge", "g-eq-fe", "p-eq-al", "cB-eq-al", "vA-eq-fe3"],
  calciumFormula: ["w-ratio", "p-cacl2", "cA-formula"],
  potassiumSulfate: ["p-k2so4", "cB-formula"],
};
for (const family of Object.values(ionExposureFamilies)) {
  const ids = family.map(id);
  for (const current of ids) {
    const q = allIonTasks.find((q) => q.id === current);
    if (!q) throw Error("Unknown ion exposure identity");
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...ids.filter((other) => other !== current),
      ]),
    ];
  }
}
const group = (label: string, suffixes: string[]) => ({
  label,
  taskIds: suffixes.map(id),
});
export const ionTestsJourney: LessonJourney = {
  version: 1,
  introduction:
    "Build a precise test–observation–ion chain. Keep uncertain candidates, compare separate portions and justify the compound identity.",
  scopeNote:
    "AQA separate Chemistry, both tiers: 4.8.3.1–5 and interpretation of required practical 7. Original practice and recorded school evidence; practical competence still requires supervised practical work. Instrumental analysis is the next lesson.",
  outcomes: [
    "Interpret all five specified flame colours and masking in mixtures.",
    "Use hydroxide colour and excess reagent; retain unresolved calcium/magnesium candidates.",
    "Specify and interpret carbonate, halide and sulfate tests with suitable acids and separate portions.",
    "Construct balanced hydroxide equations, including state symbols and charge conservation.",
    "Combine cation/anion evidence and write coherent extended test methods with honest self-review.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    group(
      "Flames and hydroxide evidence",
      practice.slice(0, 9).map((q) => q.id.slice("ion-tests-v1-".length)),
    ),
    group(
      "Anion chains and flawed methods",
      practice.slice(9, 20).map((q) => q.id.slice("ion-tests-v1-".length)),
    ),
    group(
      "Equations, compounds and explanations",
      practice.slice(20).map((q) => q.id.slice("ion-tests-v1-".length)),
    ),
  ],
};
