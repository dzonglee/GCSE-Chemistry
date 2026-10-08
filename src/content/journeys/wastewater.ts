import type { LearningTask, LessonJourney } from "../types";
import { wasteRecords as R, type WasteGiven } from "../../lib/wastewater";
const id = (s: string) => "waste-v1-" + s;
function choice(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  record?: string,
  data?: WasteGiven,
): LearningTask {
  const opts = [answer, ...Object.keys(errors)],
    n = [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % opts.length;
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    options: [...opts.slice(n), ...opts.slice(0, n)],
    misconceptions: errors,
    explanation,
    hint,
    ...(record
      ? {
          model: {
            kind: "wastewater-investigation" as const,
            mode: R[record].mode,
            record,
          },
        }
      : {}),
    ...(data ? { wasteGiven: data } : {}),
  };
}
function num(
  s: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  record?: string,
  data?: WasteGiven,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: String(answer),
    unit,
    inputMode: "decimal",
    tolerance: 1e-6,
    explanation,
    hint,
    ...(record
      ? {
          model: {
            kind: "wastewater-investigation" as const,
            mode: R[record].mode,
            record,
          },
        }
      : {}),
    ...(data ? { wasteGiven: data } : {}),
  };
}
function build(
  s: string,
  title: string,
  prompt: string,
  refs: readonly (readonly [string, string, number])[],
  data: WasteGiven,
  explanation: string,
  hint: string,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: JSON.stringify(
      Object.fromEntries(refs.map(([f, , v]) => [f, String(v)])),
    ),
    parts: refs.map(([f, label, answer]) => ({
      id: f,
      label,
      answer,
      inputMode: "decimal",
    })),
    partLegend: "Construct your wastewater analysis",
    wasteGiven: data,
    explanation,
    hint,
  };
}
function write(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
  data?: WasteGiven,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    referenceResponse: answer,
    explanation: answer,
    rubric,
    hint,
    ...(data ? { wasteGiven: data } : {}),
  };
}
const warmup = [
  choice(
    "w-suspended",
    "Recall suspended material",
    "Suspended solids are…",
    "Undissolved particles in the liquid",
    {
      "Always dissolved ions": "Suspended and dissolved are different.",
      "Only gases": "Solids need not be gases.",
    },
    "Suspended particles can be separated physically; dissolved material may remain.",
    "Recall filtration.",
  ),
  choice(
    "w-oxygen",
    "Recall oxygen conditions",
    "Anaerobic means…",
    "Without oxygen",
    {
      "With supplied oxygen": "That describes aerobic conditions.",
      "Without any microorganisms": "Anaerobic treatment uses microorganisms.",
    },
    "Anaerobic describes oxygen absence, not microbe absence.",
    "Compare aerobic and anaerobic.",
  ),
  num(
    "w-part",
    "Recall a fraction of a whole",
    "18 tonnes out of 60 tonnes is what percentage?",
    30,
    "%",
    "18÷60×100=30%.",
    "Use all 60 tonnes as the denominator.",
  ),
  num(
    "w-balance",
    "Recall a physical balance",
    "A physical separator receives 50 kg dry solids and removes 42 kg. How much remains?",
    8,
    "kg",
    "50−42=8 kg; material has changed location.",
    "Subtract the separated mass.",
  ),
];
const refresher = [
  choice(
    "r-domestic",
    "Identify two sewage targets",
    "Use the model. What two contaminant groups need removal?",
    "Organic matter and harmful microbes",
    {
      "Only grit":
        "Grit removal does not remove every organic contaminant or microbe.",
      "Every water molecule":
        "The aim is treatment, not removing the whole water supply.",
    },
    R.domestic.feedback,
    "Use the stated contaminants.",
    "domestic",
  ),
  choice(
    "r-farm",
    "Read an agricultural source",
    "What does this supplied manure-containing wastewater need?",
    "Organic matter and harmful-microbe removal",
    {
      "Salt removal alone":
        "The stated pollutants are organic material and microbes.",
      "No treatment if clear": "Microbes may be invisible.",
    },
    R.farm.feedback,
    "Appearance is insufficient.",
    "farm",
  ),
  choice(
    "r-factory",
    "Identify a chemical target",
    "Which additional target matters for this factory?",
    "The harmful dissolved metal compound",
    {
      "Only large debris": "A dissolved compound can pass a screen.",
      "Only water vapour": "That does not address the supplied contaminant.",
    },
    R.factory.feedback,
    "Read the pollutant survey.",
    "factory",
  ),
  choice(
    "r-raw",
    "Trace raw sewage",
    "After screening and grit removal, which stage creates sludge and effluent?",
    "Sedimentation",
    {
      "Boiling everything away": "That is not this sewage separation route.",
      "Aerobic treatment of both branches":
        "The branches have different biological conditions.",
    },
    R.raw.feedback,
    "Separate physically before choosing biological branches.",
    "raw",
  ),
  choice(
    "r-screened",
    "Continue a partly treated feed",
    "Which physical stage still needs doing here?",
    "Sedimentation",
    {
      "Repeat the already completed screening":
        "The prompt says screening is complete.",
      "No separation": "Suspended solids have not yet settled.",
    },
    R.screened.feedback,
    "Use the completed-stage evidence.",
    "screened",
  ),
  choice(
    "r-settled",
    "Treat both separated streams",
    "Choose the correct biological pairing.",
    "Sludge anaerobic; effluent aerobic",
    {
      "Sludge aerobic; effluent anaerobic":
        "That reverses the required pairing.",
      "Neither stream needs treatment":
        "Physical separation alone does not complete biological treatment.",
    },
    R.settled.feedback,
    "Follow each stream separately.",
    "settled",
  ),
  num(
    "r-solidsA",
    "Close a dry-solid inventory",
    "How many kilograms of dry suspended solids remain in effluent?",
    10,
    "kg",
    R.solidsA.feedback,
    "Subtract screening, grit and settled dry solids.",
    "solidsA",
  ),
  num(
    "r-solidsB",
    "Keep the mass basis fixed",
    "Find remaining dry suspended solids in this effluent.",
    14,
    "kg",
    R.solidsB.feedback,
    "Do not substitute the wet sludge mass.",
    "solidsB",
  ),
  num(
    "r-solidsC",
    "Conserve a fractional inventory",
    "Find remaining dry suspended solids.",
    7,
    "kg",
    R.solidsC.feedback,
    "42.5−2.5−5−28.",
    "solidsC",
  ),
  choice(
    "r-liquid",
    "Explain the effluent stage",
    "Why supply air to this effluent stage?",
    "Provide oxygen for aerobic microorganisms",
    {
      "Remove every dissolved chemical by air alone":
        "The evidence does not establish that.",
      "Prevent all microbial activity":
        "Microorganisms carry out this treatment.",
    },
    R.liquid.feedback,
    "Link oxygen to the biological process.",
    "liquid",
  ),
  choice(
    "r-sludge",
    "Explain sludge digestion",
    "Which condition fits this digester?",
    "Without oxygen",
    {
      "Continuous oxygen supply": "That would be aerobic.",
      "No organisms can exist": "Anaerobic microorganisms can be active.",
    },
    R.sludge.feedback,
    "The sludge branch is anaerobic.",
    "sludge",
  ),
  num(
    "r-disposeA",
    "Use the disposal whole",
    "What percentage of this year's dry sludge is burned?",
    20,
    "%",
    R.disposeA.feedback,
    "Add all categories, then divide the burned part by that total.",
    "disposeA",
  ),
  num(
    "r-disposeB",
    "Transfer a part-to-whole method",
    "What percentage of this year's dry sludge is burned?",
    15,
    "%",
    R.disposeB.feedback,
    "Keep the same year's whole in the denominator.",
    "disposeB",
  ),
  choice(
    "r-discharge",
    "Compare quality requirements",
    "Does meeting this discharge standard establish drinking quality?",
    "No; the supplied drinking limit is exceeded",
    {
      "Yes because the sample is clear":
        "Clarity is not the drinking criterion.",
      "Yes because discharge and drinking are identical":
        "The supplied limits differ.",
    },
    R.discharge.feedback,
    "Compare 12 with both 20 and 2.",
    "discharge",
  ),
  choice(
    "r-industrial",
    "Target an industrial chemical",
    "Which supplied treatment reduces the chemical below the discharge limit?",
    "The specified chemical treatment",
    {
      "Biological treatment alone": "It leaves 40 units/litre, above 5.",
      "Clear appearance alone":
        "Appearance does not reduce measured concentration.",
    },
    R.industrial.feedback,
    "Use the actual treatment results.",
    "industrial",
  ),
];
const guided = [
  choice(
    "g-targets",
    "Identify targets",
    "Choose the targets. Why treat sewage?",
    "Reduce pollution and biological harm",
    {
      "Make every river permanently sterile":
        "Treatment does not guarantee perpetual sterility.",
      "Remove every atom": "Treatment changes and separates material.",
    },
    R.domestic.feedback,
    "Account for both organic matter and harmful microbes.",
    "domestic",
  ),
  choice(
    "g-route",
    "Separate and branch",
    "Construct the full route. Which statement describes the two biological streams?",
    "Sludge anaerobic; effluent aerobic",
    {
      "Both streams are anaerobic": "The liquid effluent stage is aerobic.",
      "Both streams are aerobic": "The sludge digestion stage is anaerobic.",
    },
    R.raw.feedback,
    "Read each branch, not one linear list.",
    "raw",
  ),
  num(
    "g-solids",
    "Close the dry-solid balance",
    "Construct the physical inventory. What dry suspended-solid mass remains in effluent?",
    10,
    "kg",
    R.solidsA.feedback,
    "120−8−12−90; all masses use the same basis.",
    "solidsA",
  ),
  choice(
    "g-biology",
    "Explain supplied oxygen",
    "Construct the effluent treatment proposal. Which conclusion is supported?",
    "Oxygen supports aerobic breakdown of organic matter",
    {
      "All drinking requirements automatically pass":
        "No final quality results are supplied.",
      "Organic matter loses all its atoms":
        "Biological reactions conserve atoms.",
    },
    R.liquid.feedback,
    "A process name is not a quality certificate.",
    "liquid",
  ),
  num(
    "g-disposal",
    "Build a disposal percentage",
    "Construct total, fraction and percentage. What percentage is burned?",
    20,
    "%",
    R.disposeA.feedback,
    "180÷900×100.",
    "disposeA",
  ),
  choice(
    "g-quality",
    "Use two quality standards",
    "Construct the quality decision. What describes this product?",
    "Meets supplied discharge criterion; fails drinking requirement",
    {
      "Clear therefore pure and potable": "Clarity proves neither.",
      "Fails discharge because it fails drinking":
        "The stated criteria differ.",
    },
    R.discharge.feedback,
    "Use the actual limits.",
    "discharge",
  ),
];
const solidGiven: WasteGiven = {
  title: "Independent dry-solid inventory",
  note: "Original ideal physical separation; dry suspended solids only, before biological reaction.",
  rows: [
    {
      label: "Feed and removals",
      text: "Feed 160 kg; screened solids 15 kg; grit 25 kg; settled dry solids 96 kg. No losses.",
    },
  ],
};
const disposalGiven: WasteGiven = {
  title: "Independent disposal data",
  note: "Original table; same year, exclusive complete categories, dry sludge in tonnes.",
  rows: [],
  disposal: { fertiliser: 720, landfill: 24, burn: 216, other: 240 },
};
const trendGiven: WasteGiven = {
  title: "Compare two supplied years",
  note: "Original dry-sludge disposal totals; no cause study is supplied.",
  rows: [
    {
      label: "Year A",
      text: "Total 800 tonnes; treated material suitable for fertiliser 320 tonnes.",
    },
    {
      label: "Year B",
      text: "Total 1000 tonnes; treated material suitable for fertiliser 550 tonnes.",
    },
  ],
};
const practice = [
  choice(
    "p-targets",
    "Recall sewage targets",
    "A sewage plant removes grit. Which remaining targets still require attention?",
    "Organic matter and harmful microbes",
    {
      "Only dissolved salt": "Those are not the named sewage targets.",
      "None; grit removal completes everything":
        "Screening does not complete biological treatment.",
    },
    "Organic matter and harmful microbes require treatment beyond grit removal.",
    "Separate physical and biological targets.",
  ),
  write(
    "p-industry",
    "Explain an industrial route",
    "A factory's water contains organic matter and a toxic dissolved compound not removed by its biological stage. Explain why a sewage route alone is insufficient.",
    "Biological treatment targets the organic matter, but the stated toxic dissolved compound remains. An appropriate specified chemical-removal treatment and final concentration checks are needed before release; ordinary screening does not remove a dissolved contaminant.",
    [
      "Identify both supplied pollutant groups.",
      "Use the supplied failure of biological removal.",
      "Require appropriate targeted removal and evidence before release.",
    ],
    "Match treatment to the actual contaminant.",
  ),
  choice(
    "p-screen",
    "Distinguish physical stages",
    "Which statement correctly distinguishes screening and sedimentation?",
    "Screens retain large debris; settleable solids form sludge under gravity",
    {
      "Both destroy all microbes": "These are physical separations.",
      "Sedimentation removes all dissolved salts":
        "Dissolved salts do not all settle as suspended solids.",
    },
    "Screening retains large material; sedimentation separates settleable suspended solids into sludge and liquid effluent.",
    "Track what is retained versus settled.",
  ),
  write(
    "p-route",
    "Explain the full branching route",
    "Describe sewage treatment from incoming debris to the two biological branches. Explain why a single list saying 'all water is treated anaerobically' is wrong.",
    "Screening and grit removal remove large objects and grit. Sedimentation produces sludge and liquid effluent. Sludge undergoes anaerobic digestion without oxygen; effluent undergoes aerobic biological treatment with oxygen. Applying anaerobic conditions to all effluent reverses the required liquid-stream treatment.",
    [
      "Screening and grit removal precede sedimentation.",
      "Name sludge and effluent separately.",
      "Assign anaerobic sludge and aerobic effluent with correct oxygen conditions.",
    ],
    "Draw a split after sedimentation.",
  ),
  build(
    "p-solids",
    "Construct an independent mass inventory",
    "Calculate dry solids after screening/grit removal, then the dry suspended solids remaining in effluent.",
    [
      ["after", "Dry solids after initial removals / kg", 120],
      ["remaining", "Dry suspended solids in effluent / kg", 24],
    ],
    solidGiven,
    "160−15−25=120 kg;120−96=24 kg.15+25+96+24=160 kg dry suspended solids.",
    "Keep every term on the dry suspended-solid basis.",
  ),
  choice(
    "p-wet",
    "Avoid mixing mass bases",
    "Why can 100 kg dry suspended solids entering sedimentation produce sludge with a wet mass greater than 100 kg?",
    "The sludge also contains water",
    {
      "Atoms have been created": "Separation does not create atoms.",
      "Dry solid and wet sludge mean the same thing":
        "Wet sludge includes water.",
    },
    "Wet sludge mass includes liquid water; it cannot replace dry suspended-solid mass in the supplied balance.",
    "Check which substances each mass includes.",
  ),
  write(
    "p-effluent",
    "Explain air supply and its limit",
    "Explain why air is supplied to the biological effluent stage and why this alone does not prove potable water.",
    "Air supplies oxygen for aerobic microorganisms to break down organic matter. Naming that process does not establish removal of every harmful microbe or dissolved industrial chemical. Drinking-quality evidence and any necessary further treatment are required.",
    [
      "Air supplies oxygen.",
      "Aerobic microorganisms break down organic matter.",
      "Require drinking-quality evidence; do not guarantee total contaminant removal.",
    ],
    "Separate the process from the evidence of its outcome.",
  ),
  choice(
    "p-sludge",
    "Recall oxygen conditions",
    "Which treatment fits the separated sludge branch?",
    "Anaerobic digestion without oxygen",
    {
      "Aerobic digestion with oxygen":
        "That is not the specified sludge branch.",
      "No microorganisms": "Digestion is biological.",
    },
    "The specified sewage sludge treatment is anaerobic digestion.",
    "Anaerobic describes oxygen absence.",
  ),
  write(
    "p-biogas",
    "Use explanatory fuel context",
    "Supplied cross-science context says sludge digestion produces methane-containing biogas. Explain how it can be useful without claiming that all sludge turns into pure methane.",
    "Methane in biogas can be used as a fuel. The gas is a mixture and other material/products remain. Anaerobic microbial reactions change organic matter into other forms and conserve atoms; this is not complete conversion of wet sludge into pure methane.",
    [
      "Methane can be fuel.",
      "Biogas contains methane rather than being stipulated pure methane.",
      "Other products/material remain and atoms are conserved.",
    ],
    "Use 'contains methane' carefully.",
  ),
  build(
    "p-disposal",
    "Construct total, fraction and percentage",
    "Use the supplied same-year table. Calculate total processed dry sludge, burned fraction as a decimal, and percentage burned.",
    [
      ["total", "Total processed dry sludge / tonnes", 1200],
      ["fraction", "Burned fraction as a decimal", 0.18],
      ["percent", "Percentage burned / %", 18],
    ],
    disposalGiven,
    "720+24+216+240=1200 tonnes;216/1200=0.18=18%.",
    "Use all disposal categories in this year's whole.",
  ),
  {
    ...num(
      "p-round",
      "Round a disposal percentage",
      "A plant burns 173 tonnes out of 1120 tonnes processed. Calculate the percentage burned, to 3 significant figures.",
      15.4,
      "%",
      "173÷1120×100=15.4464…%, rounded to 3 significant figures is 15.4%.",
      "Keep intermediate precision and round at the end.",
    ),
    rounding: { kind: "significant-figures" as const, digits: 3 },
  },
  num(
    "p-wrongWhole",
    "Keep part and whole together",
    "A plant burns 84 tonnes, uses 420 tonnes as fertiliser and sends 196 tonnes elsewhere. What percentage of all processed sludge is burned?",
    12,
    "%",
    "Total=84+420+196=700;84/700×100=12%.84/420 would compare burn with fertiliser, not with all sludge.",
    "Add all three destinations.",
  ),
  build(
    "p-trend",
    "Construct proportions and their difference",
    "Use the supplied years. Calculate percentage used as fertiliser in A and B, then B−A in percentage points.",
    [
      ["a", "Year A fertiliser proportion / %", 40],
      ["b", "Year B fertiliser proportion / %", 55],
      ["points", "B minus A / percentage points", 15],
    ],
    trendGiven,
    "320/800=40%;550/1000=55%;55−40=15 percentage points. This is not 15% relative growth.",
    "Each year has its own total; subtract the percentages for percentage points.",
  ),
  num(
    "p-relative",
    "Distinguish relative percentage increase",
    "Fertiliser's share rises from 40% to 55%. What is the relative percentage increase in that share?",
    37.5,
    "%",
    "Change 15 divided by original 40,×100=37.5% relative increase; the change is 15 percentage points.",
    "Use the original share as the denominator.",
  ),
  write(
    "p-total",
    "Explain increased processing",
    "The supplied years show total processed sludge rising from 800 to 1000 tonnes. Suggest a plausible reason and explain what further evidence is needed to establish it.",
    "A larger population or more wastewater produced could increase the amount of sludge requiring treatment. Extending collection/treatment to sewage previously discharged untreated could also increase processed sludge. The disposal totals alone do not establish which cause operated; population, wastewater-volume or collection-coverage evidence would be needed.",
    [
      "Suggest a plausible population/wastewater/collection explanation.",
      "Do not claim the table proves the cause.",
      "Specify relevant additional evidence.",
    ],
    "Consider more wastewater produced or a greater proportion receiving treatment.",
    trendGiven,
  ),
  write(
    "p-cause",
    "Separate trends from causes",
    "The supplied table shows more treated sludge used as fertiliser. Suggest a reasonable possible reason and explain why the table alone does not establish it.",
    "Greater food demand or a decision to recover useful nutrients could increase use of suitable treated sludge as fertiliser. The table records disposal amounts/proportions, not population, demand, policy or suitability evidence; additional evidence is needed to establish the cause.",
    [
      "Give a plausible reason such as food demand or resource conservation.",
      "Do not equate a trend with proof of its cause.",
      "Specify additional evidence needed.",
    ],
    "Use 'could', not 'proves'.",
    trendGiven,
  ),
  choice(
    "p-discharge",
    "Keep end-use requirements separate",
    "Clear effluent meets a supplied discharge standard, but no drinking tests are available. Is potability established?",
    "No; drinking-quality evidence is missing",
    {
      "Yes because clear means safe":
        "Microbes and chemicals can be invisible.",
      "Yes because every discharge standard is a drinking standard":
        "End-use requirements differ.",
    },
    "Meeting discharge criteria does not automatically establish drinking safety or chemical purity.",
    "Ask what the supplied tests actually cover.",
  ),
  choice(
    "p-chemical",
    "Use supplied removal results",
    "A harmful dissolved chemical remains after screening and biological treatment. What follows?",
    "Use an appropriate specified chemical-removal treatment and verify the result",
    {
      "Repeat screening to remove every dissolved ion":
        "Screening does not remove every dissolved chemical.",
      "Assume microorganisms remove it eventually":
        "The supplied evidence says it remains.",
    },
    "Match treatment to measured contaminants and verify the required final quality.",
    "Use evidence rather than a universal treatment assumption.",
  ),
  write(
    "p-sources",
    "Compare potable-water sources",
    "A locality has groundwater with low salts and no supplied industrial contaminants, salty seawater and sewage with organic matter/microbes. Compare likely treatment effort and explain the limit of this comparison.",
    "The supplied groundwater may need less treatment after quality checks, for example filtration where solids are present and suitable disinfection. Seawater needs desalination using energy; sewage needs physical and biological treatment plus any further steps needed for drinking quality. Actual groundwater can be contaminated and availability matters, so this case does not establish a universal ranking.",
    [
      "Use the stated source composition.",
      "Identify energy-requiring desalination and sewage treatment stages.",
      "Require quality checks and avoid a universal groundwater advantage.",
    ],
    "Compare the stated contaminants, not source names alone.",
  ),
  num(
    "p-reduction",
    "Use a supplied industrial removal percentage",
    "A specified treatment reduces a harmful chemical from 48 to 6 units/litre. What percentage of the initial concentration is removed?",
    87.5,
    "%",
    "Removed 42;42/48×100=87.5%. This percentage alone does not establish drinking safety without a required final limit.",
    "Subtract first, then divide by the initial concentration.",
  ),
  choice(
    "p-suitability",
    "Evaluate a resource claim",
    "Which claim is justified by a disposal table listing treated sludge as fertiliser after separate suitability checks?",
    "Suitable treated material can be a resource in this stated case",
    {
      "All untreated sludge is safe fertiliser":
        "Suitability cannot be generalised to untreated material.",
      "A large fertiliser mass proves every contaminant is absent":
        "The table is not a complete contaminant analysis.",
    },
    "Resource use depends on treatment, suitability and the actual use conditions.",
    "Keep the supplied suitability condition.",
  ),
];
const checkForms = [
  [
    choice(
      "cA-pair",
      "Choose treatment branches",
      "Which biological pairing is used after sewage sedimentation?",
      "Anaerobic sludge; aerobic effluent",
      {
        "Aerobic sludge; anaerobic effluent":
          "The required pairing is reversed.",
        "No biological stages":
          "Physical separation does not complete treatment.",
      },
      "Sludge undergoes anaerobic digestion; effluent aerobic treatment.",
      "Track the two streams.",
    ),
    build(
      "cA-solids",
      "Close a reserved inventory",
      "Calculate dry solids after initial removals and remaining in effluent.",
      [
        ["after", "Dry solids after removals / kg", 150],
        ["remaining", "Dry solids in effluent / kg", 30],
      ],
      {
        title: "Reserved physical inventory",
        note: "Ideal dry suspended solids; no reaction or loss.",
        rows: [
          {
            label: "Masses",
            text: "Feed 200 kg; screens 20 kg; grit 30 kg; settled dry solids 120 kg.",
          },
        ],
      },
      "200−20−30=150;150−120=30 kg.",
      "Use one mass basis.",
    ),
    num(
      "cA-percent",
      "Calculate a reserved proportion",
      "A plant burns 231 tonnes out of 1540 tonnes processed. What percentage is burned?",
      15,
      "%",
      "231/1540×100=15%.",
      "Use all processed sludge.",
    ),
    choice(
      "cA-quality",
      "Read quality evidence",
      "A product passes the supplied discharge tests; drinking microbiological checks are unavailable. What is established?",
      "Discharge compliance in this case; potability not established",
      {
        "Potability because discharge passed":
          "Different end uses need different evidence.",
        "Chemical purity": "Discharge tests do not establish only H₂O.",
      },
      "Use the actual test scope.",
      "Separate discharge from drinking.",
    ),
    write(
      "cA-air",
      "Explain air supply",
      "Explain the purpose of supplying air in the effluent stage and one limitation of this process alone.",
      "Air supplies oxygen for aerobic microorganisms breaking down organic matter. Final harmful-microbe and chemical levels need appropriate checks; this process alone does not guarantee potable water.",
      [
        "Oxygen from air.",
        "Aerobic microbial breakdown of organic matter.",
        "A justified quality limitation.",
      ],
      "Explain mechanism and evidence separately.",
    ),
    num(
      "cA-points",
      "Compare proportions",
      "A disposal category rises from 22% to 34%. Find its increase in percentage points.",
      12,
      "percentage points",
      "34−22=12 percentage points.",
      "Subtract the proportions.",
    ),
  ],
  [
    choice(
      "cB-screen",
      "Explain screening",
      "What can a screen directly retain?",
      "Large debris exceeding its openings",
      {
        "Every dissolved chemical": "Dissolved substances can pass.",
        "All microbes in every plant": "No such guarantee follows.",
      },
      "Screening is size-based physical retention of large material.",
      "Use the physical opening size.",
    ),
    build(
      "cB-solids",
      "Close another reserved inventory",
      "Construct the two remaining dry-solid masses.",
      [
        ["after", "Dry solids after removals / kg", 60],
        ["remaining", "Dry solids in effluent / kg", 9],
      ],
      {
        title: "Second reserved dry-solid inventory",
        note: "Ideal physical separation before biological reaction.",
        rows: [
          {
            label: "Masses",
            text: "Feed 75 kg; screened solids 6 kg; grit 9 kg; settled dry solids 51 kg.",
          },
        ],
      },
      "75−6−9=60;60−51=9 kg.",
      "Account for every removal once.",
    ),
    {
      ...num(
        "cB-round",
        "Round a reserved percentage",
        "A plant burns 187 tonnes out of 1230 tonnes processed. Calculate percentage burned to 3 significant figures.",
        15.2,
        "%",
        "187/1230×100=15.20325…%; to 3 significant figures 15.2%.",
        "Round only the final result.",
      ),
      rounding: { kind: "significant-figures" as const, digits: 3 },
    },
    choice(
      "cB-industrial",
      "Evaluate biological limits",
      "A factory's harmful chemical is unchanged by its biological stage. What is needed?",
      "Appropriate specified chemical removal and final checks",
      {
        "Assume clear liquid is safe": "Clarity is insufficient.",
        "Only more screening for all dissolved material":
          "Screens do not remove all dissolved compounds.",
      },
      "Treatment must target the contaminant actually present.",
      "Use the supplied treatment failure.",
    ),
    write(
      "cB-route",
      "Explain sewage treatment",
      "Describe the physical stages and biological treatment of each separated sewage stream.",
      "Screening and grit removal precede sedimentation, which produces sludge and effluent. Sludge undergoes anaerobic digestion without oxygen; effluent undergoes aerobic biological treatment using oxygen.",
      [
        "Screening and grit removal.",
        "Sedimentation into sludge and effluent.",
        "Correct biological pairing and oxygen conditions.",
      ],
      "Make a branch after settling.",
    ),
    num(
      "cB-relative",
      "Use the original proportion",
      "A disposal share rises from 20% to 25%. Calculate its relative percentage increase.",
      25,
      "%",
      "(25−20)/20×100=25% relative increase, or 5 percentage points.",
      "Divide the change by the original 20.",
    ),
  ],
];
const reviewForms = [
  [
    choice(
      "vA-sludge",
      "Retrieve sludge conditions",
      "Separated sewage sludge undergoes…",
      "Anaerobic digestion without oxygen",
      {
        "Aerobic effluent treatment": "That is the other branch.",
        "No biological treatment": "Organic material still requires treatment.",
      },
      "Sludge digestion is anaerobic.",
      "Recall the stream split.",
    ),
    num(
      "vA-share",
      "Retrieve percentage method",
      "A plant burns 156 tonnes of 780 tonnes processed. What percentage is burned?",
      20,
      "%",
      "156/780×100=20%.",
      "Part divided by whole times 100.",
    ),
    write(
      "vA-evidence",
      "Retrieve quality reasoning",
      "Explain why a clear treated effluent that passes discharge tests is not automatically drinking water.",
      "Clear appearance does not establish absence of harmful microbes or dissolved chemicals. Discharge and drinking requirements differ; drinking-quality tests and any additional treatment are needed.",
      [
        "Clarity is insufficient.",
        "Different end-use requirements.",
        "Need appropriate drinking evidence.",
      ],
      "State what has and has not been tested.",
    ),
  ],
  [
    choice(
      "vB-effluent",
      "Retrieve liquid-stream treatment",
      "Which condition belongs to aerobic effluent treatment?",
      "Oxygen supplied to microorganisms",
      {
        "No oxygen": "That is anaerobic.",
        "No microorganisms": "This is biological treatment.",
      },
      "Aerobic microbial breakdown uses oxygen.",
      "Link air to oxygen.",
    ),
    num(
      "vB-solids",
      "Retrieve a physical balance",
      "Feed dry solids 90 kg; screens 8 kg; grit 12 kg; settled dry solids 63 kg. How much dry suspended solid remains in effluent?",
      7,
      "kg",
      "90−8−12−63=7 kg, before biological reaction.",
      "Use the common dry-solid basis.",
    ),
    write(
      "vB-sources",
      "Retrieve conditional source comparisons",
      "Explain why groundwater may be easier to make potable than salty seawater or sewage in a supplied low-contamination case, but is not always the easiest source.",
      "Low-contamination groundwater may need fewer steps after appropriate quality checks. Seawater needs desalination, requiring energy; sewage requires physical and biological treatment and suitable drinking-quality controls. Groundwater can contain harmful contaminants and may be unavailable, so composition and local context determine the comparison.",
      [
        "Use supplied groundwater quality.",
        "Compare desalination and sewage treatment.",
        "Reject universal rankings and require quality checks.",
      ],
      "Use composition and availability.",
    ),
  ],
];
const recovery = [
  "r-domestic",
  "r-factory",
  "r-raw",
  "r-raw",
  "r-solidsA",
  "r-solidsB",
  "r-liquid",
  "r-sludge",
  "r-sludge",
  "r-disposeA",
  "r-disposeB",
  "r-disposeA",
  "r-disposeB",
  "r-disposeB",
  "r-disposeB",
  "r-disposeB",
  "r-discharge",
  "r-industrial",
  "r-discharge",
  "r-industrial",
  "r-disposeB",
];
export const wasteRecoveryRoutes: Record<string, string> = {};
practice.forEach((q, i) => {
  q.followUp = id(recovery[i]);
  wasteRecoveryRoutes[q.id] = q.followUp;
});
export const allWasteTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const wasteExposureFamilies = {
  targets: ["r-domestic", "r-farm", "g-targets", "p-targets"],
  chemical: [
    "r-factory",
    "p-industry",
    "r-industrial",
    "p-chemical",
    "cB-industrial",
  ],
  screen: ["r-raw", "r-screened", "p-screen", "cB-screen"],
  branches: [
    "r-raw",
    "w-oxygen",
    "r-settled",
    "g-route",
    "p-route",
    "p-sludge",
    "cA-pair",
    "cB-route",
    "r-sludge",
    "vA-sludge",
  ],
  liquid: ["r-liquid", "g-biology", "p-effluent", "cA-air", "vB-effluent"],
  dry: ["r-solidsA", "g-solids", "r-solidsB", "r-solidsC", "p-wet"],
  disposal: ["r-disposeA", "g-disposal", "r-disposeB"],
  quality: [
    "r-discharge",
    "g-quality",
    "p-discharge",
    "cA-quality",
    "vA-evidence",
  ],
  sources: ["p-sources", "vB-sources"],
  biogas: ["p-biogas", "r-sludge"],
};
const groups = Object.values(wasteExposureFamilies).map((fs) => new Set(fs));
let merged = true;
while (merged) {
  merged = false;
  outer: for (let a = 0; a < groups.length; a++)
    for (let b = a + 1; b < groups.length; b++)
      if ([...groups[a]].some((s) => groups[b].has(s))) {
        groups[a] = new Set([...groups[a], ...groups[b]]);
        groups.splice(b, 1);
        merged = true;
        break outer;
      }
}
for (const group of groups)
  for (const s of group) {
    const q = allWasteTasks.find((q) => q.id === id(s));
    if (!q) throw Error("Unknown wastewater exposure task " + s);
    q.exposureAliases = [...group].filter((o) => o !== s).map(id);
  }
export const wasteJourney: LessonJourney = {
  version: 1,
  introduction:
    "Trace wastewater through physical separation and two biological streams; use supplied inventories and quality evidence.",
  scopeNote:
    "AQA Chemistry 8462 4.10.1.3 / Trilogy 8464 5.10.1.3, both tiers. Methane-containing biogas is explicitly labelled cross-science explanatory context from Biology 4.7.2.3. Original simulations/data and manual written review; this is not a required practical or proof of whole-course examination readiness.",
  outcomes: [
    "Identify organic matter, harmful microbes and industrial harmful-chemical targets.",
    "Trace screening/grit removal, sedimentation into sludge/effluent, anaerobic sludge digestion and aerobic effluent treatment.",
    "Conserve supplied dry suspended-solid inventories across physical separation without confusing wet sludge mass.",
    "Explain oxygen conditions, microbial breakdown and the limits of biological treatment.",
    "Calculate disposal proportions, final rounding, percentage points and relative change; distinguish trends from causes.",
    "Compare discharge/drinking requirements and conditional treatment effort for waste, ground and salt water.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Targets and physical separation",
      taskIds: practice.slice(0, 6).map((q) => q.id),
    },
    {
      label: "Biological branches and resource data",
      taskIds: practice.slice(6, 16).map((q) => q.id),
    },
    {
      label: "Quality evidence and source choices",
      taskIds: practice.slice(16).map((q) => q.id),
    },
  ],
};
