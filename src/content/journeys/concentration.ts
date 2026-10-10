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
    `sc-v1-${id}`,
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
  ...number(`sc-v1-${id}`, prompt, answer, unit, explanation, hint, title),
  title,
});
const guided = [
  c(
    "g-unit",
    "Find mass per unit volume",
    "4 g solute is dissolved in 200 cm³ final solution. Find concentration in g/dm³.",
    "20 g/dm³",
    {
      "0.02 g/dm³": "The raw quotient uses cm³, not dm³.",
      "800 g/dm³": "Multiply is not the concentration operation.",
    },
    "200 cm³=.2 dm³, so 4÷.2=20 g/dm³.",
    "Convert the final volume before division.",
    {
      kind: "solution-concentration",
      mode: "unit-rate",
      instruction: "Predict the converted volume and mass per dm³.",
    },
  ),
  c(
    "g-basis",
    "Choose the correct quantities",
    "5 g dissolved solute; final solution 250 cm³. Which quantities give concentration?",
    "5 g divided by 0.25 dm³ final solution",
    {
      "260 g whole solution divided by 0.25 dm³":
        "That is whole-solution density.",
      "5 g divided by 0.24 dm³ starting solvent":
        "Use final solution volume, not starting solvent volume.",
    },
    "The selected numerator is dissolved-solute mass and the denominator is final solution volume.5÷.25=20 g/dm³.",
    "Name what each quantity represents.",
    {
      kind: "solution-concentration",
      mode: "basis",
      instruction: "Select dissolved-solute mass and final solution volume.",
    },
  ),
  c(
    "g-mass",
    "Calculate dissolved mass",
    "A 250 cm³ homogeneous solution sample has concentration 20 g/dm³. What dissolved solute mass does it contain?",
    "5 g",
    {
      "80 g": "Multiply concentration by volume; do not divide.",
      "5000 g": "Convert cm³ to dm³ first.",
    },
    "250÷1000=.25 dm³;20×.25=5 g dissolved solute.",
    "Use mass=concentration×solution volume.",
    {
      kind: "solution-concentration",
      mode: "mass",
      instruction: "Convert the sample volume, then calculate solute mass.",
    },
  ),
  c(
    "g-volume",
    "Find final solution volume",
    "10 g dissolved solute at 40 g/dm³: find final solution volume in dm³ and cm³.",
    "0.25 dm³ =250 cm³",
    {
      "4 dm³ =4000 cm³": "Use mass÷concentration, not its reciprocal.",
      "0.25 dm³ =0.00025 cm³": "Multiply dm³ by 1000 for cm³.",
    },
    "10÷40=.25 dm³; .25×1000=250 cm³.",
    "Rearrange before converting the final volume.",
    {
      kind: "solution-concentration",
      mode: "volume",
      instruction: "Predict volume in dm³ and the equivalent cm³.",
    },
  ),
];
guided[0].openingHint = true;
export const concentrationJourney: LessonJourney = {
  version: 1,
  introduction:
    "Calculate dissolved solute per final solution volume, with units and quantity meanings made explicit.",
  scopeNote:
    "Common mass-concentration calculations in g/dm³: cm³ conversion, selecting dissolved-solute mass/final solution volume, mass and volume rearrangements and homogeneous sample amounts. This refocuses the original combined mass/concentration route while retaining legacy questions. AQA Higher explanations of changing mass/volume and dilution receive a separate next lesson; mol/dm³ and titration calculations are later. Models compare supplied quantities, not practical procedures.",
  outcomes: [
    "Use dissolved-solute mass and final solution volume rather than solution mass or initial solvent volume.",
    "Convert cm³, dm³ and litres consistently before using g/dm³.",
    "Calculate concentration, dissolved solute mass and final solution volume using the correct equation.",
    "Construct unit working and distinguish mass concentration from density.",
  ],
  warmup: [
    n(
      "w-divide",
      "Recall decimal division",
      "Calculate 4÷0.2.",
      20,
      "",
      "4÷.2=20.",
      "Check what multiplied by.2 gives 4.",
    ),
    n(
      "w-volume",
      "Recall a cubic volume conversion",
      "Convert 500 cm³ to dm³.1 dm³=1000 cm³.",
      0.5,
      "dm³",
      "500÷1000=.5 dm³.",
      "Divide by 1000.",
    ),
  ],
  refresher: [
    c(
      "r-basis",
      "Name the numerator and denominator",
      "What does concentration in g/dm³ measure?",
      "Dissolved-solute grams per dm³ of final solution",
      {
        "Whole-solution grams per dm³": "That is density.",
        "Solute grams per initial solvent volume only":
          "Use final solution volume.",
      },
      "Keep quantity identity as well as unit identity.",
      "Choose solute mass and solution volume.",
    ),
    c(
      "r-convert",
      "Match volume units",
      "How is a volume in cm³ converted to dm³?",
      "Divide by 1000",
      {
        "Multiply by 1000": "That converts dm³ to cm³.",
        "Divide by 10": "These are cubic units;1 dm³=1000 cm³.",
      },
      "The final solution amount is unchanged; its numerical unit representation changes.",
      "A dm is 10 cm; cube the factor.",
    ),
    c(
      "r-mass",
      "Choose the mass equation",
      "For concentration in g/dm³ and volume in dm³, which gives dissolved-solute grams?",
      "Concentration × solution volume",
      {
        "Concentration ÷ solution volume":
          "That would have the wrong units for mass.",
        "Solution volume ÷ concentration": "That is not mass.",
      },
      "(g/dm³)×dm³=g.",
      "Use unit cancellation.",
    ),
    c(
      "r-volume",
      "Choose the volume equation",
      "Given dissolved-solute mass and concentration, which gives final solution volume?",
      "Solute mass ÷ concentration",
      {
        "Concentration ÷ solute mass": "That inverts the required quantity.",
        "Solute mass × concentration": "That does not give volume.",
      },
      "g÷(g/dm³)=dm³.",
      "Rearrange c=m/V.",
    ),
    c(
      "r-dissolved",
      "Count what is actually dissolved",
      "Some supplied solid remains undissolved. Which mass belongs in the solution concentration?",
      "The mass actually dissolved in the final solution",
      {
        "Every gram added even if undissolved":
          "Undissolved material is not dissolved solute.",
        "The entire solvent mass": "That is not solute mass.",
      },
      "Use the stated dissolved portion, not every starting gram.",
      "Read which material is in solution.",
    ),
  ],
  guided,
  practice: [
    n(
      "p-convert",
      "Convert a supplied final volume",
      "Convert 200 cm³ to dm³.",
      0.2,
      "dm³",
      "200÷1000=.2 dm³.",
      "Divide by 1000.",
    ),
    n(
      "p-back",
      "Convert in the other direction",
      "Convert 0.375 dm³ to cm³.",
      375,
      "cm³",
      ".375×1000=375 cm³.",
      "Multiply by 1000.",
    ),
    n(
      "p-c",
      "Calculate concentration from dm³",
      "12 g dissolved solute forms 0.3 dm³ final solution. Calculate concentration.",
      40,
      "g/dm³",
      "12÷.3=40 g/dm³.",
      "Divide solute mass by final volume.",
    ),
    n(
      "p-c-cm",
      "Convert before dividing",
      "5 g solute forms 250 cm³ final solution. Calculate concentration in g/dm³.",
      20,
      "g/dm³",
      "250 cm³=.25 dm³;5÷.25=20.",
      "Use dm³ in the denominator.",
    ),
    n(
      "p-mg",
      "Convert numerator units too",
      "2500 mg solute is dissolved in 0.2 dm³ final solution. Find concentration in g/dm³.",
      12.5,
      "g/dm³",
      "2500 mg=2.5 g;2.5÷.2=12.5.",
      "Use grams, not milligrams.",
    ),
    n(
      "p-litres",
      "Use litres consistently",
      "2.4 g solute is dissolved in 0.6 L final solution.1 L=1 dm³. Find concentration.",
      4,
      "g/dm³",
      "2.4÷.6=4 g/dm³.",
      "The litre and dm³ volumes are equivalent.",
    ),
    n(
      "p-mass",
      "Find sample solute mass",
      "A 150 cm³ homogeneous sample has concentration 8 g/dm³. What solute mass is dissolved in it?",
      1.2,
      "g",
      "150 cm³=.15 dm³;8×.15=1.2 g.",
      "Convert and multiply.",
    ),
    n(
      "p-small",
      "Keep a small sample mass",
      "A 25 cm³ solution sample has concentration 0.04 g/dm³. What solute mass does it contain?",
      0.001,
      "g",
      "25 cm³=.025 dm³;.04×.025=.001 g.",
      "Do not drop the small decimal result.",
    ),
    n(
      "p-volume",
      "Rearrange for solution volume",
      "7.5 g dissolved solute is present at 30 g/dm³. Find final solution volume in dm³.",
      0.25,
      "dm³",
      "7.5÷30=.25 dm³.",
      "Use mass÷concentration.",
    ),
    n(
      "p-volume-cm",
      "Report the requested final volume unit",
      "3 g solute is dissolved at 24 g/dm³. Find final solution volume in cm³.",
      125,
      "cm³",
      "3÷24=.125 dm³;×1000=125 cm³.",
      "Rearrange, then convert.",
    ),
    {
      ...n(
        "p-working",
        "Construct concentration working",
        "8 g solute is fully dissolved. Final solution 400 cm³; original solvent 380 cm³; whole solution mass 430 g. Enter numerator grams, denominator dm³ and concentration in g/dm³.",
        0,
        "",
        "Choose 8 g and 400÷1000=.4 dm³;8÷.4=20 g/dm³.",
        "Use the concentration quantities, not every number.",
      ),
      answer: JSON.stringify({ mass: "8", volume: "0.4", concentration: "20" }),
      parts: [
        { id: "mass", label: "Solute / g", answer: 8 },
        { id: "volume", label: "Solution / dm³", answer: 0.4 },
        { id: "concentration", label: "Concentration / g/dm³", answer: 20 },
      ],
      partLegend: "Construct the mass-per-volume calculation",
    },
    c(
      "p-interpret",
      "Interpret a per-unit statement",
      "Which correctly interprets 20 g/dm³ for a homogeneous solution?",
      "Each 1 dm³ contains 20 g dissolved solute",
      {
        "Each solution sample must contain 20 g regardless of its volume":
          "The statement is per specified volume.",
        "The whole 1 dm³ solution weighs 20 g":
          "The numerator is solute mass, not all solution mass.",
      },
      "A per-unit concentration describes dissolved-solute amount in a specified solution volume.",
      "Name both units and quantities.",
    ),
    n(
      "p-unit-rate",
      "Convert a per-cm³ concentration",
      "A solution contains 0.04 g solute per cm³. What is that in g/dm³?",
      40,
      "g/dm³",
      "1000 cm³ contains 1000×.04=40 g.",
      "One dm³ contains 1000 cm³.",
    ),
    c(
      "p-error",
      "Diagnose a volume conversion",
      "A student converts 250 cm³ to 2.5 dm³. What correct volume belongs in the calculation?",
      "0.25 dm³",
      {
        "2.5 dm³": "That divides by 100 rather than 1000.",
        "250000 dm³": "That multiplies instead of dividing.",
      },
      "250÷1000=.25 dm³.",
      "Use the cubic-unit factor.",
    ),
    n(
      "p-other-rate",
      "Transfer a different concentration unit",
      "Convert 0.018 g/cm³ to g/dm³.",
      18,
      "g/dm³",
      ".018×1000=18 g/dm³.",
      "Scale the per-unit volume.",
    ),
    n(
      "p-new-sample",
      "Calculate a larger sample mass",
      "A 720 cm³ homogeneous sample has concentration 8 g/dm³. Find its dissolved solute mass.",
      5.76,
      "g",
      "720 cm³=.72 dm³;8×.72=5.76 g.",
      "Convert before multiplying.",
    ),
    n(
      "p-aliquot",
      "Calculate a specified homogeneous portion",
      "A homogeneous solution contains 16 g dissolved solute in 1 dm³. What solute mass is in a 125 cm³ sample?",
      2,
      "g",
      "125 cm³=.125 dm³;16×.125=2 g.",
      "Use the stated sample volume.",
    ),
    c(
      "p-raw-quotient",
      "Preserve the quotient's units",
      "Dividing 5 g by 250 cm³ gives 0.02. Which unit belongs to that raw quotient?",
      "g/cm³",
      {
        "g/dm³": "The denominator has not been converted.",
        "cm³/g": "That is the reciprocal unit.",
      },
      "5÷250=.02 g/cm³, equivalent to 20 g/dm³.",
      "Retain the denominator's actual unit.",
    ),
    n(
      "p-undissolved",
      "Use the dissolved portion",
      "12 g solid is supplied;3 g remains undissolved. The final solution volume is 0.5 dm³. Find concentration of the dissolved portion.",
      18,
      "g/dm³",
      "Dissolved mass 12−3=9 g;9÷.5=18 g/dm³.",
      "Undissolved material is excluded from dissolved mass.",
    ),
    c(
      "p-missing-final",
      "Recognise a missing denominator",
      "5 g solute is added to 250 cm³ solvent, but final solution volume is not supplied. Can exact g/dm³ concentration be calculated from this information alone?",
      "No; the final solution volume is required",
      {
        "Yes; starting solvent volume must equal final solution volume":
          "Do not assume equality without supplied evidence.",
        "Yes;5 g alone gives concentration":
          "Mass alone lacks the volume denominator.",
      },
      "Use the measured/given final solution volume. Starting solvent volume is a different quantity.",
      "Check whether the required denominator is known.",
    ),
    {
      ...c(
        "p-explain",
        "Distinguish concentration from density",
        "A supplied solution has 5 g dissolved solute,260 g whole-solution mass and 250 cm³ final volume. Explain why 20 g/dm³ describes its solute concentration while 1040 g/dm³ describes its density.",
        "250 cm³=.25 dm³. Solute concentration uses 5 g/.25 dm³=20 g/dm³. Density uses the whole solution's 260 g/.25 dm³=1040 g/dm³. Their units can match, but their mass numerators describe different quantities.",
        {},
        "Name the numerator for each quotient, not just its unit.",
        "Contrast dissolved solute with the whole solution.",
      ),
      options: undefined,
      rubric: [
        "Converts 250 cm³ to.25 dm³.",
        "Uses 5 g dissolved-solute mass for 20 g/dm³ concentration.",
        "Uses 260 g whole-solution mass for 1040 g/dm³ density and distinguishes the quantities.",
      ],
    },
    {
      ...c(
        "p-evaluate",
        "Explain the unit working",
        "Explain how to find dissolved-solute mass in 75 cm³ homogeneous solution at 12 g/dm³, showing the volume conversion and operation.",
        "75 cm³=.075 dm³. Mass=concentration×solution volume=12×.075=.9 g dissolved solute. The sample volume is final solution volume, and g/dm³ times dm³ gives grams.",
        {},
        "Correct working converts before multiplying.",
        "Show quantities, units and operation.",
      ),
      options: undefined,
      rubric: [
        "Converts 75 cm³ to.075 dm³.",
        "Uses mass=concentration×volume, yielding.9 g.",
        "Identifies dissolved-solute mass and uses the specified solution sample volume.",
      ],
    },
  ],
  checkForms: [
    [
      n(
        "ca-c",
        "Calculate a new concentration",
        "9 g dissolved solute is present in 300 cm³ final solution. Find concentration in g/dm³.",
        30,
        "g/dm³",
        "300 cm³=.3 dm³;9÷.3=30.",
        "Convert and divide.",
      ),
      n(
        "ca-mass",
        "Calculate a new small sample mass",
        "A 40 cm³ homogeneous sample has concentration 6 g/dm³. What dissolved solute mass is present?",
        0.24,
        "g",
        "40 cm³=.04 dm³;6×.04=.24 g.",
        "Convert and multiply.",
      ),
      n(
        "ca-volume",
        "Calculate a new final volume",
        "18 g solute is dissolved at 72 g/dm³. What final solution volume in cm³ contains this solute?",
        250,
        "cm³",
        "18÷72=.25 dm³=250 cm³.",
        "Rearrange and convert back.",
      ),
      c(
        "ca-basis",
        "Check the denominator identity",
        "Which volume belongs in mass concentration?",
        "Final solution volume",
        {
          "Original solvent volume irrespective of dissolution":
            "Use the supplied final solution volume.",
          "The empty vessel's capacity instead of actual solution volume":
            "Capacity is not the actual contained volume.",
        },
        "The denominator is solution volume.",
        "Identify what volume the solute occupies in solution.",
      ),
      n(
        "ca-mg",
        "Convert a new numerator",
        "600 mg solute is dissolved in 0.15 dm³ final solution. Find concentration in g/dm³.",
        4,
        "g/dm³",
        "600 mg=.6 g;.6÷.15=4.",
        "Convert mg to g.",
      ),
    ],
    [
      n(
        "cb-c",
        "Use a new small volume",
        "2.8 g solute is present in 70 cm³ final solution. Find concentration.",
        40,
        "g/dm³",
        "70 cm³=.07 dm³;2.8÷.07=40.",
        "Use dm³.",
      ),
      n(
        "cb-mass",
        "Use a new sample size",
        "A 350 cm³ homogeneous solution sample is 18 g/dm³. Calculate dissolved solute mass.",
        6.3,
        "g",
        "350 cm³=.35 dm³;18×.35=6.3.",
        "Multiply concentration by converted volume.",
      ),
      {
        ...n(
          "cb-working",
          "Construct new unit working",
          "11 g solute forms 550 cm³ final solution. Enter solution volume in dm³ and concentration in g/dm³.",
          0,
          "",
          "550÷1000=.55 dm³;11÷.55=20 g/dm³.",
          "Construct both stages.",
        ),
        answer: JSON.stringify({ volume: "0.55", concentration: "20" }),
        parts: [
          { id: "volume", label: "Solution volume / dm³", answer: 0.55 },
          { id: "concentration", label: "Concentration / g/dm³", answer: 20 },
        ],
        partLegend: "Construct converted volume and concentration",
      },
      c(
        "cb-density",
        "Check the numerator identity",
        "A student uses the entire solution mass per dm³. Which quantity has the student calculated?",
        "Solution density",
        {
          "Dissolved-solute mass concentration": "That needs solute-only mass.",
          "A pure element's percentage in a compound":
            "That uses a different composition quotient.",
        },
        "The identity of the numerator determines the quantity.",
        "Name what mass was used.",
      ),
      n(
        "cb-volume",
        "Rearrange for a new volume",
        "6 g dissolved solute is present at 15 g/dm³. Find final solution volume in dm³.",
        0.4,
        "dm³",
        "6÷15=.4 dm³.",
        "Use mass÷concentration.",
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "ra-c",
        "Retrieve concentration working",
        "7 g solute is dissolved in 350 cm³ final solution. Calculate concentration.",
        20,
        "g/dm³",
        "350 cm³=.35 dm³;7÷.35=20.",
        "Convert and divide.",
      ),
      n(
        "ra-mass",
        "Retrieve sample solute mass",
        "A 60 cm³ sample is 5 g/dm³. Find dissolved solute mass.",
        0.3,
        "g",
        "60 cm³=.06 dm³;5×.06=.3.",
        "Convert and multiply.",
      ),
      c(
        "ra-basis",
        "Retrieve the required quantities",
        "Which pair defines g/dm³ solute concentration?",
        "Dissolved-solute grams and final solution dm³",
        {
          "Whole-solution grams and vessel capacity":
            "Those are different quantities.",
          "Solvent grams and solute particle count":
            "That is not mass per solution volume.",
        },
        "Keep both identities and units explicit.",
        "Use solute mass and solution volume.",
      ),
    ],
    [
      n(
        "rb-volume",
        "Retrieve a solution volume",
        "14 g solute is present at 56 g/dm³. Find final solution volume in cm³.",
        250,
        "cm³",
        "14÷56=.25 dm³=250 cm³.",
        "Rearrange, then convert.",
      ),
      n(
        "rb-rate",
        "Retrieve equivalent concentration units",
        "Convert 0.025 g/cm³ to g/dm³.",
        25,
        "g/dm³",
        ".025×1000=25.",
        "Scale to one dm³.",
      ),
      c(
        "rb-dissolved",
        "Retrieve a dissolved-mass distinction",
        "Some solid remains undissolved. Which portion belongs in solution concentration?",
        "Only the mass actually dissolved",
        {
          "All solid originally added":
            "Undissolved solid is not dissolved solute.",
          "The vessel's mass": "Apparatus is not solute.",
        },
        "Use the supplied dissolved fraction.",
        "Follow which material is in solution.",
      ),
    ],
  ],
};
for (const q of [
  ...concentrationJourney.warmup,
  ...concentrationJourney.refresher,
  ...guided,
  ...concentrationJourney.practice,
])
  q.followUp =
    q.id.includes("basis") ||
    q.id.includes("working") ||
    q.id.includes("interpret") ||
    q.id.includes("density") ||
    q.id.includes("missing") ||
    q.id.includes("explain")
      ? "sc-v1-r-basis"
      : q.id.includes("dissolved")
        ? "sc-v1-r-dissolved"
        : q.id.includes("mass") ||
            q.id.includes("sample") ||
            q.id.includes("aliquot") ||
            q.id.includes("evaluate")
          ? "sc-v1-r-mass"
          : q.id.includes("volume") && !q.id.includes("w-")
            ? "sc-v1-r-volume"
            : "sc-v1-r-convert";
