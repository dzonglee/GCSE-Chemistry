import type { LearningTask, LessonJourney, TaskModel } from "../types";
import type { PhMode } from "../../lib/ph-evidence";
import { choice, number } from "./helpers";
import { addPhMethodWriting } from "./ph-method-writing";
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
    "ph-v1-" + id,
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
    "ph-v1-" + id,
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
  rubric: string[],
): LearningTask => ({
  id: "ph-v1-" + id,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: rubric[0],
  purpose: title,
  rubric,
});
const m = (mode: PhMode, instruction: string): TaskModel => ({
  kind: "ph-evidence",
  mode,
  instruction,
});
const data = (
  quantity: string,
  unit: string,
  points: { amount: number; ph: number }[],
) => ({ quantity, unit, points });
export const phJourney: LessonJourney = {
  version: 1,
  introduction:
    "Read pH, compare indicator evidence and follow supplied neutralisation data.",
  scopeNote:
    "Foundation/shared AQA4.4.2.4 and Trilogy5.4.2.4: H+ in acidic aqueous solutions, OH− in alkalis, the usual GCSE 0–14 pH scale, pH 7 neutral, universal/wide-range indicators, approximate pH measurement, a pH probe and acid–alkali neutralisation. Pearson Combined printed 41/PDF45 has plain 3.1–3.3 and 3.6, including litmus, methyl orange, phenolphthalein and supplied pH changes with calcium hydroxide/calcium oxide. Its bold 3.4–3.5 and 3.7–3.8 correspond to Higher ion-concentration factors and strength/concentration; those and AQA4.4.2.6 remain a separate Higher lesson. All samples here are at 25 °C. pH is dimensionless;0–14 is the usual GCSE range, not a universal physical limit. Acidic pH is below 7 and alkaline above 7; decimal 6.8 is acidic and 7.2 alkaline. pH 0 does not mean no acidity. Neutral solution still contains hydrogen and hydroxide ions; neutrality is not the absence of ions. H+ is hydrated in water; the familiar net shorthand H+ +OH− → H2O accounts for acid–alkali neutralisation. More alkali after the neutral point can leave an alkaline mixture. Numerical pH spacing is not a linear hydrogen-ion concentration scale; do not use subtraction or a pH ratio to invent an ion-concentration factor. The supplied universal chart is illustrative: red0–2, orange3–4, yellow5–6, green near 7, blue-green near 8, blue9–10 and purple11–14. Real formulations/colour judgements vary; compare with the supplied chart and give an approximate reading, not an exact decimal from a colour. Actual AQA2022F03.4 links pH 1/red and pH 7/green;2018F07.3 selects 13 from alternatives after purple, not proof that every purple sample is exactly 13. Named indicators have their own colour-change intervals. At supplied pH 2/7/12, litmus is red/purple/blue; methyl orange red/yellow/yellow; phenolphthalein colourless/colourless/pink. Methyl orange may remain yellow in an acidic pH 5 sample. Colourless phenolphthalein does not prove neutrality: acidic, neutral and some mildly alkaline samples are colourless. Indicator ranges are supplied for interpretation, not required threshold memorisation. OpenStax actual indicator diagram and prose were read; its erroneous methyl-orange figure alt text was not used. A probe can report numerical pH with finer resolution, but many digits or repeat agreement alone do not establish accuracy. Check reference-buffer/calibration evidence; do not invent an exact reading from litmus. The true 3D reference shows macroscopic clear solution, immersed probe tip, electronic lead and actual seven-segment supplied display. A probe alone does not colour the liquid. This is selected apparatus, not atomic particles or a pH calculation from mesh counts. All curve/table data are original supplied data for supervised-practical interpretation, not an experimental procedure to perform alone. Measurements refer to mixed/equilibrated samples at comparable temperature. Calcium-hydroxide powder and alkali-solution axes have different quantities and units. This lesson does not certify laboratory skills, full board alignment or exam readiness. Six written explanations remain self-reviewed.",
  outcomes: [
    "Classify supplied integer and decimal pH readings without reversing acidity.",
    "Use universal and named indicators while respecting their measurement limits.",
    "Interpret original acid–alkali and powdered-base pH data, including excess alkali.",
    "Distinguish numerical resolution and repeat agreement from calibration-supported accuracy.",
  ],
  warmup: [
    n(
      "w-neutral",
      "Recall the neutral value",
      "At 25 °C in the usual GCSE aqueous model, what pH is neutral?",
      7,
      "pH",
      "Neutral pH is 7 at the stated temperature.",
      "Compare with the neutral boundary.",
    ),
    c(
      "w-compare",
      "Compare a decimal reading",
      "Is pH 8.4 below, equal to, or above 7?",
      "Above 7",
      {
        "Below 7": "Compare whole-number parts first.",
        "Equal to 7": "8.4 is not 7.",
      },
      "8.4 is greater than 7.",
      "Compare 8.4 with 7.0.",
    ),
  ],
  refresher: [
    c(
      "r-boundary",
      "Restore the acid boundary",
      "A supplied calibrated probe reads pH 3.0. How is the solution classified?",
      "Acidic",
      {
        Neutral: "Neutral is 7 at 25 °C.",
        Alkaline: "Alkaline readings exceed 7.",
      },
      "3.0 is below 7.",
      "Do not reverse the scale.",
      m("classification", "Compare supplied readings with 7."),
    ),
    c(
      "r-range",
      "Respect a colour estimate",
      "The supplied universal chart labels orange as pH 3–4. What does an orange result support?",
      "An approximate pH in that range",
      {
        "Exactly pH 3.000":
          "The colour does not establish that numerical precision.",
        "A neutral solution": "Both chart values are below 7.",
      },
      "Match the supplied range; colours estimate pH.",
      "Use the chart.",
      m("colour", "Move your reading guess one pH step at a time."),
    ),
    c(
      "r-named",
      "Use the specified indicator",
      "Phenolphthalein is used at supplied pH 2. What colour is expected?",
      "Colourless",
      {
        Pink: "Pink is its sufficiently alkaline response.",
        Green: "Green near 7 belongs to universal indicator.",
      },
      "At pH 2 phenolphthalein is colourless.",
      "Indicator names matter.",
      m("indicator", "Predict the named indicator's response."),
    ),
    {
      ...n(
        "r-data",
        "Find a neutral reading",
        "The supplied table gives pH 2 at 0 cm³, pH 2.4 at 10 cm³ and pH 7 at 20 cm³ alkali added. What listed volume gives a neutral mixture?",
        20,
        "cm³",
        "The 20 cm³ row has pH 7.",
        "Read the pH 7 row.",
      ),
      phMeasurements: data("Alkali volume", "cm³", [
        { amount: 0, ph: 2 },
        { amount: 10, ph: 2.4 },
        { amount: 20, ph: 7 },
      ]),
    },
    c(
      "r-accuracy",
      "Do not trust digits alone",
      "A pH probe shows four decimal places, with no calibration evidence. What can you conclude?",
      "Extra displayed digits do not establish accuracy",
      {
        "It must be more accurate than every other method":
          "Display resolution is not accuracy.",
        "It is definitely neutral": "No sample pH has been supplied.",
      },
      "A reference check is needed to assess accuracy.",
      "Separate precision of display from accuracy.",
      m(
        "measurement",
        "Compare reference checks with digits and repeat readings.",
      ),
    ),
    c(
      "r-ions",
      "Retain the neutralisation product",
      "In acid–alkali neutralisation, H+ andOH− react to form…",
      "Water",
      {
        "Hydrogen gas": "Neutralisation is not the metal/acid gas reaction.",
        "No matter": "Atoms are retained.",
      },
      "The net shorthand isH+ +OH− →H2O.",
      "Retain the atoms.",
    ),
  ],
  guided: [
    {
      ...c(
        "g-reading",
        "Read the pH",
        "Calibrated probe: pH 4.2 at 25 °C. Classify the solution.",
        "Acidic",
        { Neutral: "Neutral is pH 7.", Alkaline: "4.2 is below 7." },
        "4.2<7, so this sample is acidic.",
        "Compare 4.2 with 7.",
        m("classification", "Read the supplied probe value and predict."),
      ),
      openingHint: true,
    },
    {
      ...n(
        "g-colour",
        "Estimate from a chart",
        "An orange result matches the supplied universal chart's pH 3–4 range. Enter a possible approximate pH.",
        3,
        "pH",
        "Any value from 3 to 4 agrees with this supplied colour range; it is approximate.",
        "Use the orange range.",
        m(
          "colour",
          "Keep your wrong guess until you change it; do not claim exact precision.",
        ),
      ),
      acceptedRange: { min: 3, max: 4, exclusive: false },
    },
    c(
      "g-indicator",
      "Predict phenolphthalein",
      "At supplied pH 2, what colour is phenolphthalein?",
      "Colourless",
      {
        Pink: "The supplied sample is acidic.",
        Green: "Do not substitute the universal-indicator colour.",
      },
      "Phenolphthalein is colourless in this acidic sample.",
      "Use this indicator's response.",
      m(
        "indicator",
        "Compare named indicators and test what their colours can establish.",
      ),
    ),
    n(
      "g-neutralisation",
      "Find the neutral point",
      "In the initial HCl/NaOH solution data, what listed alkali volume gives pH 7?",
      25,
      "cm³",
      "The 25 cm³ row is neutral; the 30 cm³ row is alkaline.",
      "Read the row rather than assuming every addition ends at neutral.",
      m(
        "neutralisation",
        "Move through original measurements and identify any excess.",
      ),
    ),
    c(
      "g-measurement",
      "Use calibration evidence",
      "A probe displays 5.2 and its reference-buffer checks agree with their labels. What is the supported reported sample reading?",
      "pH 5.2",
      {
        "Exactly pH 5.20000":
          "The supplied display does not justify extra digits.",
        "pH 7 because a buffer is neutral":
          "The buffer and sample are different measurements.",
      },
      "Report the supplied 5.2 reading, with the stated calibration evidence.",
      "Do not copy the reference-buffer pH.",
      m(
        "measurement",
        "Select the conclusion that the supplied evidence supports.",
      ),
    ),
  ],
  practice: [
    c(
      "p-decimal",
      "Compare near neutrality",
      "A calibrated sample at 25 °C has pH 6.8. Classify it.",
      "Acidic",
      {
        Neutral: "6.8 is close to 7 but remains below it.",
        Alkaline: "Alkaline pH exceeds 7.",
      },
      "Compare 6.8 and 7.0.",
      "Keep the decimal reading.",
      m("classification", "Use the near-boundary record."),
    ),
    c(
      "p-zero",
      "Interpret the scale endpoint",
      "A supplied sample has pH 0. Which statement fits the usual GCSE scale?",
      "It is acidic",
      {
        "It has no acidity": "Zero is the low-pH endpoint, not zero acidity.",
        "It is neutral": "Neutral is pH 7.",
      },
      "0<7; do not confuse pH with a direct amount scale.",
      "Use the boundary.",
    ),
    c(
      "p-order",
      "Order acidity from readings",
      "Samples at the same temperature have pH 5.5,3.0 and 6.2. Which listed sample has the lowest pH?",
      "pH 3.0",
      { "pH 6.2": "That is the largest reading.", "pH 5.5": "3.0 is lower." },
      "3.0 is the lowest pH and most acidic of these readings.",
      "Compare numerical values without inventing a concentration factor.",
    ),
    c(
      "p-green",
      "Use universal indicator",
      "At supplied pH 7, what standard universal-indicator colour is expected?",
      "Green",
      {
        Red: "Red indicates low pH in the supplied chart.",
        Purple: "Purple is the high-pH region.",
      },
      "Green is the neutral colour in the usual chart.",
      "Name the universal indicator, not phenolphthalein.",
    ),
    c(
      "p-purple",
      "Choose a compatible reading",
      "A purple universal result is reported. Which listed value agrees with the supplied chart:1,4,7 or 12?",
      "12",
      {
        "1": "The chart is red at 1.",
        "4": "The chart is orange at 4.",
        "7": "The chart is green near 7.",
      },
      "12 is in this chart's purple alkaline region; this choice does not prove every purple sample is exactly 12.",
      "Compare with the chart.",
      m(
        "colour",
        "Explore the purple record, keeping approximate interpretation.",
      ),
    ),
    {
      ...n(
        "p-orange",
        "Retain a range of valid estimates",
        "The supplied chart's orange range is pH 3–4. Enter any compatible approximate decimal value.",
        3.5,
        "pH",
        "Any value within 3–4 is accepted as a compatible estimate.",
        "Do not overstate precision.",
      ),
      acceptedRange: { min: 3, max: 4, exclusive: false },
    },
    {
      ...n(
        "p-yellow",
        "Transfer the chart range",
        "Yellow matches the supplied chart's pH 5–6 range. Enter a possible approximate pH.",
        6,
        "pH",
        "Values from 5 to 6 agree with the stated range.",
        "Compare the supplied colour band.",
        m("colour", "Select yellow and retain a one-step guess."),
      ),
      acceptedRange: { min: 5, max: 6, exclusive: false },
    },
    c(
      "p-trailing-zero",
      "Compare reported numerical values",
      "As numerical values, how do pH 9.40 and pH 9.4 compare?",
      "They are equal",
      {
        "9.40 is larger": "A trailing zero does not change the value.",
        "9.40 is ten times 9.4": "Do not infer a ratio from digit count.",
      },
      "The numerical values match; writing more digits does not independently prove accuracy.",
      "Align decimal places.",
    ),
    c(
      "p-neutral-phenol",
      "Do not assign universal green to another indicator",
      "Phenolphthalein is in supplied pH 7 water. What colour is expected?",
      "Colourless",
      {
        Green: "That is universal indicator's usual neutral response.",
        Pink: "pH 7 is below the phenolphthalein transition.",
      },
      "Neutral phenolphthalein is colourless in this supplied case.",
      "Keep the indicator name.",
      m("indicator", "Choose the neutral phenolphthalein record."),
    ),
    c(
      "p-methyl-acid",
      "Respect the named indicator's interval",
      "Methyl orange is supplied in pH 5 solution. What colour is expected?",
      "Yellow",
      {
        Red: "Methyl orange can already be yellow while pH is below 7.",
        Green: "Green is not its supplied response.",
      },
      "A yellow methyl-orange result does not by itself mean alkaline.",
      "Indicator transitions are not all at 7.",
      m("indicator", "Use the pH 5 methyl-orange record."),
    ),
    c(
      "p-litmus-acid",
      "Recall the acidic litmus response",
      "Litmus is in a supplied pH 2 solution. What colour is expected?",
      "Red",
      {
        Blue: "Blue is its alkaline response.",
        Colourless: "Do not substitute phenolphthalein.",
      },
      "Litmus is red in the supplied acidic sample.",
      "Name both sample and indicator.",
    ),
    c(
      "p-litmus-alkali",
      "Recall the alkaline litmus response",
      "Litmus is in supplied pH 12 solution. What colour is expected?",
      "Blue",
      {
        Red: "Red is its acidic response.",
        Green: "Universal green does not describe litmus.",
      },
      "Litmus is blue in the supplied alkaline sample.",
      "Use the named response.",
    ),
    c(
      "p-unknown",
      "Limit the colour conclusion",
      "An unknown sample leaves phenolphthalein colourless. Which conclusion is justified?",
      "Neutrality is not established by that colour",
      {
        "It must have exactly pH 7":
          "Acidic and some mildly alkaline samples are also colourless.",
        "It contains no ions": "Colour does not establish ion absence.",
      },
      "Colourless phenolphthalein is not a neutral-pH test.",
      "Consider more than one compatible pH.",
      m("indicator", "Use the unknown record, with no supplied probe reading."),
    ),
    {
      ...n(
        "p-excess-volume",
        "Read the alkaline row",
        "Original supplied data:20 cm³ gives pH 2,25 cm³ gives pH 7,30 cm³ gives pH 12. What listed volume gives the alkaline mixture?",
        30,
        "cm³",
        "The 30 cm³ row is above 7.",
        "Read the supplied measurements.",
        m("neutralisation", "Move beyond the neutral point."),
      ),
      phMeasurements: data("Alkali volume", "cm³", [
        { amount: 20, ph: 2 },
        { amount: 25, ph: 7 },
        { amount: 30, ph: 12 },
      ]),
    },
    c(
      "p-residual",
      "Identify acid remaining",
      "The supplied mixed solution at 20 cm³ alkali addition has pH 2. Which neutralisation reactant remains in excess in this model?",
      "Hydrogen ions, H+",
      {
        "Hydroxide ions, OH−":
          "Excess hydroxide would give an alkaline result.",
        "Neither reactant can ever remain":
          "Neutralisation can stop with one reactant left.",
      },
      "An acidic result shows acid remains in excess.",
      "Do not assume every mixture is neutral.",
      m("neutralisation", "Classify the selected row and its excess."),
    ),
    {
      ...n(
        "p-powder",
        "Change the axis quantity",
        "The original powder table has pH 7 at 0.100 g calcium hydroxide. What powder mass gives that neutral reading?",
        0.1,
        "g",
        "The mass axis is ing, notcm³.",
        "Use the table's quantity and units.",
        m("neutralisation", "Select the calcium-hydroxide powder record."),
      ),
      phMeasurements: data("Calcium hydroxide mass", "g", [
        { amount: 0, ph: 1.9 },
        { amount: 0.05, ph: 2.2 },
        { amount: 0.1, ph: 7 },
        { amount: 0.15, ph: 11.8 },
      ]),
    },
    c(
      "p-reference",
      "Question an unchecked probe",
      "A buffer labelled pH 7.0 is read as 7.5 by a probe that gives many sample digits. What should the evidence prompt?",
      "Check calibration before relying on accuracy",
      {
        "Trust the digits without checking": "The reference check disagrees.",
        "Declare every sample neutral": "The buffer is not the sample.",
      },
      "Displayed resolution does not cure a failed reference check.",
      "Compare a known reference.",
      m("measurement", "Use the failed-buffer record."),
    ),
    c(
      "p-unit",
      "Report the right quantity",
      "A calibrated probe displays pH 5.2. Which reporting statement is correct?",
      "pH is dimensionless",
      {
        "The value is 5.2g/dm³": "That is mass concentration, not pH.",
        "The value is 5.2 cm³": "That is a volume.",
      },
      "pH has no mass or volume unit.",
      "Keep measurement quantities distinct.",
    ),
    w(
      "p-colour-explain",
      "Explain the approximate reading",
      "Explain why a universal-indicator colour should be compared with its chart rather than reported as an exact many-decimal pH.",
      "The chart maps a colour to an approximate pH or range. Real colour judgement and indicator formulations limit resolution. The colour does not establish an exact many-decimal reading; a suitably checked probe provides a numerical measurement.",
      [
        "Use the supplied chart.",
        "State approximate/range rather than exact precision.",
        "Distinguish numerical display from colour.",
      ],
    ),
    w(
      "p-neutral-ions",
      "Explain neutral solution",
      "A student says pH 7 means there are no hydrogen or hydroxide ions. Explain the mistake in the stated 25 °C model.",
      "Neutral solution still contains hydrogen and hydroxide ions, with neither in excess in the neutral comparison. Neutrality does not mean zero ions or no water; H+ andOH− react to produce water during acid–alkali neutralisation.",
      [
        "Neutral does not mean no ions.",
        "State the neutral comparison rather than an acidic/alkaline excess.",
        "Retain water as the neutralisation product.",
      ],
    ),
  ],
  checkForms: [
    [
      c(
        "a-reading",
        "Independent decimal classification",
        "A supplied calibrated sample at 25 °C has pH 6.4. How is it classified?",
        "Acidic",
        {
          Neutral: "6.4 remains below 7.",
          Alkaline: "Alkaline readings exceed 7.",
        },
        "6.4<7.",
        "Use the stated boundary.",
      ),
      c(
        "a-colour",
        "Independent universal response",
        "At supplied pH 1, which standard universal-indicator colour is expected?",
        "Red",
        {
          Green: "Green is near neutral pH 7.",
          Blue: "Blue is in the alkaline region.",
        },
        "The usual chart is red at pH 1.",
        "Use the universal indicator.",
      ),
      {
        ...n(
          "a-curve",
          "Independent neutralisation data",
          "Read the supplied original data. What listed alkali volume gives a neutral mixture?",
          12,
          "cm³",
          "The 12 cm³ row has pH 7.",
          "Use the provided pH readings.",
        ),
        phMeasurements: data("Alkali volume", "cm³", [
          { amount: 0, ph: 2 },
          { amount: 4, ph: 2.2 },
          { amount: 8, ph: 2.5 },
          { amount: 12, ph: 7 },
          { amount: 16, ph: 11.4 },
        ]),
      },
      c(
        "a-calibration",
        "Independent reference evidence",
        "A probe reads 7.3 in a buffer labelled 7.0. Which conclusion is supported?",
        "Its calibration/accuracy needs checking",
        {
          "More sample digits guarantee accuracy":
            "Reference disagreement is evidence against that inference.",
          "The buffer measurement proves every sample pH 7.3":
            "Reference and sample are different.",
        },
        "Check the instrument against references.",
        "Separate sample data from reference data.",
      ),
      w(
        "a-explain",
        "Independent neutralisation explanation",
        "Explain what happens to H+ andOH− during acid–alkali neutralisation.",
        "Hydrogen and hydroxide ions react to make water. Their reactant atoms are retained. Mixing some acid and alkali does not guarantee neutrality if one remains in excess.",
        [
          "Name both ions.",
          "Name water as the product.",
          "Do not assume arbitrary mixing guarantees a neutral endpoint.",
        ],
      ),
    ],
    [
      c(
        "b-order",
        "Independent ordering",
        "At the same temperature, samples have pH 2.8 and 6.2. Which reading is lower?",
        "pH 2.8",
        {
          "pH 6.2": "Compare whole-number parts.",
          "Both are the same": "2.8 and 6.2 differ.",
        },
        "2.8 is lower.",
        "Compare the readings.",
      ),
      c(
        "b-range",
        "Independent compatible colour estimate",
        "The supplied chart labels orange as pH 3–4. Which value is compatible with an orange unknown?",
        "pH 3.7",
        {
          "pH 7": "That is the neutral chart region.",
          "pH 12": "That is the purple chart region.",
        },
        "3.7 lies in the stated approximate interval.",
        "Use the supplied interval.",
      ),
      c(
        "b-named",
        "Independent indicator interpretation",
        "A supplied table says phenolphthalein is colourless below pH 8.3. A calibrated sample at 25 °C has pH 7.6. Which combination fits?",
        "Alkaline and colourless",
        {
          "Neutral and pink": "7.6 is above 7 and below the given transition.",
          "Acidic and colourless": "Colourless does not make pH 7.6 acidic.",
        },
        "7.6>7, but below the stated indicator transition.",
        "Use both supplied boundaries.",
      ),
      {
        ...n(
          "b-powder",
          "Independent powder data",
          "Read the supplied original powder data. What listed calcium-hydroxide mass gives a neutral mixture?",
          0.12,
          "g",
          "The 0.12 g row has pH 7.",
          "Use the supplied mass axis.",
        ),
        phMeasurements: data("Calcium hydroxide mass", "g", [
          { amount: 0, ph: 1.8 },
          { amount: 0.04, ph: 2 },
          { amount: 0.08, ph: 2.3 },
          { amount: 0.12, ph: 7 },
          { amount: 0.16, ph: 11.7 },
        ]),
      },
      w(
        "b-explain",
        "Independent measurement limit",
        "Explain why a green universal-indicator result alone does not justify reporting pH 7.0000.",
        "Green is consistent with the neutral region of the chart, but indicator colour is an approximate observation. It does not support four decimal places or verify a probe calibration. Use an appropriate numerical measurement for that reporting demand.",
        [
          "Use approximate colour interpretation.",
          "Do not invent decimal precision.",
          "Distinguish calibration from colour.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      c(
        "ra-reading",
        "Delayed decimal comparison",
        "Which supplied pH reading is numerically lower:3.4 or 3.8?",
        "pH 3.4",
        {
          "pH 3.8": "Compare tenths.",
          "They are equal": "Their tenths differ.",
        },
        "3.4<3.8.",
        "Compare matching decimal places.",
      ),
      {
        ...n(
          "ra-curve",
          "Delayed neutral row",
          "Read the supplied original neutralisation data. What listed alkali volume gives pH 7?",
          18,
          "cm³",
          "The 18 cm³ row is neutral.",
          "Read the provided table.",
        ),
        phMeasurements: data("Alkali volume", "cm³", [
          { amount: 0, ph: 2 },
          { amount: 6, ph: 2.2 },
          { amount: 12, ph: 2.5 },
          { amount: 18, ph: 7 },
          { amount: 24, ph: 11.4 },
        ]),
      },
      w(
        "ra-explain",
        "Delayed excess explanation",
        "Explain why adding more alkali after the neutral point can give an alkaline mixture.",
        "At the neutral point the supplied acid has been neutralised. Additional alkali can leave hydroxide ions in excess, giving pH above 7 in the stated 25 °C model. Neutralisation does not force every later mixture to stay pH 7.",
        [
          "Distinguish the neutral point from further addition.",
          "Name excess hydroxide.",
          "Connect the excess to pH above 7.",
        ],
      ),
    ],
    [
      c(
        "rb-reading",
        "Delayed near-boundary reading",
        "A calibrated sample at 25 °C has pH 7.5. How is it classified?",
        "Alkaline",
        { Neutral: "7.5 is above 7.", Acidic: "It is not below 7." },
        "7.5>7.",
        "Use the reading rather than proximity alone.",
      ),
      c(
        "rb-indicator",
        "Delayed methyl-orange limit",
        "The supplied methyl-orange table is yellow above pH 4.4. At pH 6.0, which statement fits?",
        "Acidic with yellow methyl orange",
        {
          "Alkaline because the indicator is yellow": "pH 6 is below 7.",
          "Neutral because all indicators change at 7":
            "This transition is supplied below 7.",
        },
        "The pH boundary and indicator interval are different.",
        "Use both supplied values.",
      ),
      w(
        "rb-explain",
        "Delayed accuracy judgement",
        "Repeated sample readings agree, but a probe reads 6.9 for a buffer labelled 7.0. Explain why agreement alone does not establish accuracy.",
        "Repeat readings can be consistent while a systematic error remains. The reference disagreement requires checking calibration and measurement conditions. Displayed digits and repetition alone do not establish closeness to the correct value.",
        [
          "Distinguish repeat agreement from accuracy.",
          "Use the known-reference disagreement.",
          "Do not declare accuracy from digits alone.",
        ],
      ),
    ],
  ],
};
const follow: Record<string, string> = {
  "p-decimal": "r-boundary",
  "p-zero": "r-boundary",
  "p-order": "r-boundary",
  "p-green": "r-range",
  "p-purple": "r-range",
  "p-orange": "r-range",
  "p-yellow": "r-range",
  "p-trailing-zero": "r-accuracy",
  "p-neutral-phenol": "r-named",
  "p-methyl-acid": "r-named",
  "p-litmus-acid": "r-named",
  "p-litmus-alkali": "r-named",
  "p-unknown": "r-named",
  "p-excess-volume": "r-data",
  "p-residual": "r-ions",
  "p-powder": "r-data",
  "p-reference": "r-accuracy",
  "p-unit": "r-accuracy",
  "p-colour-explain": "r-range",
  "p-neutral-ions": "r-ions",
};
for (const q of phJourney.practice)
  q.followUp = "ph-v1-" + follow[q.id.replace("ph-v1-", "")];
const repetitions = [
  ["ph-v1-r-named", "ph-v1-g-indicator"],
  ["ph-v1-r-range", "ph-v1-g-colour", "ph-v1-p-orange"],
];
for (const group of repetitions)
  for (const q of [
    ...phJourney.refresher,
    ...phJourney.guided,
    ...phJourney.practice,
  ])
    if (group.includes(q.id))
      q.exposureAliases = group.filter((id) => id !== q.id);
addPhMethodWriting(phJourney);
