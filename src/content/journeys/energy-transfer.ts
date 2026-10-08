import type { LearningTask, LessonJourney, TaskModel } from "../types";
import type { EnergyMode } from "../../lib/energy-transfer";
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
    "heat-v1-" + id,
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
    "heat-v1-" + id,
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
  id: "heat-v1-" + id,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: rubric[0],
  purpose: title,
  rubric,
});
const m = (
  mode: EnergyMode,
  instruction: string,
  record?: string,
): TaskModel => ({ kind: "thermal-transfer", mode, instruction, record });
const graph = (
  times: number[],
  temperatures: number[],
  mixedAfter: number,
) => ({
  points: times.map((time, i) => ({ time, temperature: temperatures[i] })),
  mixedAfter,
});
export const energyJourney: LessonJourney = {
  version: 1,
  introduction:
    "Follow energy across the reaction boundary and use temperature evidence to justify the direction.",
  scopeNote:
    "Foundation/shared AQA 4.5.1.1 and limited Pearson Combined 7.9–7.11. Energy is conserved: transfer is not creation or destruction. For the same represented reaction amount, products have lower overall energy than reactants in an exothermic reaction, and higher overall energy in an endothermic reaction. Exothermic reactions transfer energy to their surroundings; endothermic reactions take energy in. For a supplied reaction in solution, the reacting chemical process is the system and the solution's thermal store, cup, probe and other apparatus act as measured surroundings. They need not occupy separate physical vessels. Under the stated controlled conditions, a surrounding-solution temperature rise supports exothermic transfer and a fall supports endothermic transfer. Use reaction-stage maximum/minimum minus the pre-mixing baseline for a signed temperature change; the positive size of a decrease is a separate wording. Later return towards room temperature does not reverse the completed reaction's classification. A spark or initial heating does not alone establish the overall transfer direction. Unequal starting temperatures or an external heater can confound a classification from temperature alone; no measurable change without other evidence does not prove no reaction or no energy transfer. Temperature change alone is not a universal measure of total released energy when mass, heat capacity and reacted amount differ. AQA examples include combustion, many oxidation reactions and neutralisation as exothermic, and specified thermal decompositions and citric-acid/sodium-hydrogencarbonate reactions as endothermic. Physical changes and dissolution processes may also release or absorb energy: endothermic process is not automatically proof of forming new chemical substances. A supplied iron-oxidation hand warmer differs from a resistive electrical pad. Apply every supplied temperature/duration/activation constraint; both or neither may qualify. The symbolic transfer markers represent arbitrary energy shares, not atoms, ions, measured joules, thermometers or a calculation of ΔH. The real 3D reference is macroscopic nested insulating cups, a cutaway cover, immersed temperature probe and stirrer. Its display temperatures are supplied observations, not calculated from mesh counts; the cutaway/blue visibility tint are representation aids. Temperature units are °C. AQA explicitly limits this clause to temperature change, without mandatory ΔH or q=mcΔT calculation. Reaction profiles, activation-energy diagrams, Higher bond-energy calculation and the full required-practical investigation are taught in separate lessons. Actual AQA 2018Foundation 06.4 QP 24–25/MS 16 were inspected: naming exothermic alone is ignored; justify with the temperature increase or energy transfer to surroundings. These original questions do not give official examiner marks, certify laboratory competence or establish whole-course exam readiness. Seven written responses remain self-reviewed; checks and real delayed review defer marking. Repeated demands share global exposure.",
  outcomes: [
    "Explain conserved energy transfer between the reacting system and surroundings.",
    "Calculate signed temperature change and positive rise/fall magnitudes.",
    "Use pre-mixing and reaction-stage temperature evidence rather than a late segment alone.",
    "Evaluate supplied applications and distinguish evidence from unsupported energy claims.",
  ],
  warmup: [
    n(
      "w-change",
      "Read a temperature rise",
      "A reading changes from 18 °C to 23 °C. What is final minus initial?",
      5,
      "°C",
      "23−18=+5 °C.",
      "Subtract the starting reading.",
    ),
    c(
      "w-boundary",
      "Name the surroundings",
      "In the supplied cup model, the reacting process transfers energy to the solution's thermal store. Which is a measured surrounding component?",
      "The solution and temperature probe",
      {
        "Only the newly formed chemical bonds":
          "Those belong to the represented reacting system.",
        "Nothing outside the universe":
          "Surroundings are defined relative to the system.",
      },
      "The solution and apparatus receive or provide energy in this calorimetry boundary.",
      "Identify what the probe measures.",
    ),
  ],
  refresher: [
    c(
      "r-transfer",
      "Give energy out",
      "The controlled surrounding solution warms during neutralisation. Which transfer is supported?",
      "From reacting system to surroundings",
      {
        "From surroundings to reacting system":
          "That would support cooling in the stated case.",
        "Energy is created": "Transfer conserves total energy.",
      },
      "The surroundings gain energy, so the reaction is exothermic.",
      "Follow the gain of energy.",
      m(
        "transfer",
        "Move symbolic energy across the stated boundary, then classify the transfer.",
      ),
    ),
    n(
      "r-signed",
      "Retain the sign",
      "Initial 22.0 °C; reaction-stage minimum 15.5 °C. What is the SIGNED temperature change?",
      -6.5,
      "°C",
      "15.5−22.0=−6.5 °C.",
      "Final reading minus initial.",
      m(
        "temperature",
        "Predict the signed difference and the supported classification.",
        "cooling",
      ),
    ),
    c(
      "r-extreme",
      "Choose the relevant stage",
      "A reacting mixture starts 20 °C, reaches 32 °C, then cools to 26 °C after completion. Which reading measures its recorded reaction-stage maximum?",
      "32 °C",
      {
        "26 °C": "That is the later cooling reading.",
        "20 °C": "That is the initial baseline.",
      },
      "The maximum during reaction is 32 °C; later cooling is heat exchange with the room.",
      "Use the reaction-stage extreme.",
      m("trace", "Select the pre-mixing baseline and reaction-stage extreme."),
    ),
    c(
      "r-use",
      "Apply both constraints",
      "A warming comparison requires ≤45 °C and ≥30 min. A gives 42 °C/40 min; B gives 52 °C/50 min. Which meets BOTH conditions?",
      "A",
      {
        B: "Its temperature exceeds the supplied limit.",
        Both: "Both duration and temperature must pass.",
      },
      "Only A meets both the temperature and duration constraints.",
      "Test every stated condition.",
      m("use", "Choose using every supplied constraint."),
    ),
    c(
      "r-evidence",
      "Separate input and overall transfer",
      "A spark starts a supplied combustion reaction that then gives energy out. What does the spark alone establish?",
      "Starting input, not an endothermic overall reaction",
      {
        "Every started reaction is endothermic":
          "An exothermic reaction can need starting energy.",
        "No energy transfer can follow":
          "The supplied reaction releases energy afterwards.",
      },
      "The stated overall reaction still gives out energy.",
      "Distinguish starting input from overall transfer.",
      m("evidence", "Use the supplied overall-transfer evidence.", "spark"),
    ),
    c(
      "r-conservation",
      "Retain total energy",
      "When a reaction transfers energy to its surroundings, what happens to total energy of the system plus surroundings?",
      "It is conserved",
      {
        "It increases because heat is made":
          "Energy is transferred, not created.",
        "It decreases because reactants lose energy":
          "The surroundings gain that transfer.",
      },
      "The reacting system's loss accompanies the surroundings' gain.",
      "Consider both sides of the boundary.",
      m(
        "transfer",
        "Compare both symbolic energy stores before and after movement.",
      ),
    ),
  ],
  guided: [
    c(
      "g-transfer",
      "Build the warming transfer",
      "Given neutralisation warms its surrounding solution, which combination fits?",
      "System transfers energy out; exothermic",
      {
        "System takes energy in; exothermic":
          "The direction contradicts exothermic transfer.",
        "System transfers energy out; endothermic":
          "Endothermic means energy taken in.",
      },
      "Energy leaves the reacting system and enters surroundings.",
      "Move energy towards the measured surroundings.",
      m(
        "transfer",
        "Choose the energy direction and classification from the warming observation.",
      ),
    ),
    n(
      "g-temperature",
      "Find the measured rise",
      "Initial 20.0 °C; reaction-stage maximum 32.0 °C. What is the temperature increase?",
      12,
      "°C",
      "32.0−20.0=12.0 °C.",
      "Use maximum minus initial.",
      m("temperature", "Predict the difference from these supplied readings."),
    ),
    {
      ...n(
        "g-trace",
        "Use the reaction-stage maximum",
        "Use the graph: find the rise from pre-mixing temperature to reaction-stage maximum.",
        12,
        "°C",
        "The baseline is 20 °C at minute 1 and maximum 32 °C at minute 3, giving 12 °C.",
        "Select the baseline and maximum before subtracting.",
        m(
          "trace",
          "Select the relevant graph points; distinguish later cooling.",
        ),
      ),
      temperatureTrace: graph([0, 1, 2, 3, 4, 5], [20, 20, 27, 32, 29, 26], 1),
    },
    c(
      "g-use",
      "Allow neither",
      "Warming requires ≤44 °C and ≥45 min. A gives 46 °C/50 min; B gives 42 °C/30 min. Which meets every constraint?",
      "Neither",
      { A: "A is too hot by the supplied limit.", B: "B lasts too briefly." },
      "Each fails a different required condition.",
      "Check every row against both limits.",
      m(
        "use",
        "Test each option rather than select the largest temperature.",
        "neither",
      ),
    ),
    c(
      "g-evidence",
      "Control the explanation",
      "A mixture warms while an external heater runs. No comparison or other reaction-energy evidence is given. What is established?",
      "The reaction's energy type is not established",
      {
        "The reaction must be exothermic":
          "The heater could supply the warming.",
        "The reaction must be endothermic":
          "The heater alone does not establish that either.",
      },
      "Temperature evidence is confounded by the external input.",
      "Ask where the measured energy could come from.",
      m("evidence", "Use only the supplied controlled evidence.", "heater"),
    ),
  ],
  practice: [
    c(
      "p-products",
      "Compare the reacting system",
      "For the supplied exothermic reaction amount, energy is transferred to surroundings. How does the products' overall energy compare with that of the reactants?",
      "Lower",
      {
        Higher: "Energy has been transferred out of the reacting system.",
        "Equal because energy is conserved":
          "The combined system and surroundings conserve energy; the reacting system alone loses the transfer.",
      },
      "The products have less overall energy by the amount transferred to the surroundings.",
      "Keep the reacting system separate from the combined conserved total.",
    ),

    n(
      "p-rise",
      "Calculate a decimal rise",
      "Initial 23.6 °C; reaction-stage maximum 31.9 °C. Determine the temperature increase.",
      8.3,
      "°C",
      "31.9−23.6=8.3 °C.",
      "Subtract initial from maximum.",
    ),
    n(
      "p-fall-signed",
      "Keep a cooling sign",
      "Initial 24.0 °C; reaction-stage minimum 18.5 °C. Give the SIGNED change.",
      -5.5,
      "°C",
      "18.5−24.0=−5.5 °C.",
      "Do not turn the signed change into a positive magnitude.",
    ),
    n(
      "p-fall-size",
      "Read decrease wording",
      "Initial 24.0 °C; reaction-stage minimum 18.5 °C. What is the positive SIZE of the decrease?",
      5.5,
      "°C",
      "24.0−18.5=5.5 °C; the signed change would be −5.5 °C.",
      "A decrease size is positive.",
    ),
    n(
      "p-negative",
      "Compare negative readings",
      "The supplied surrounding liquid stays liquid: −6.0 °C initially and −2.0 °C at reaction-stage maximum. What is the temperature rise?",
      4,
      "°C",
      "−2−(−6)=+4 °C.",
      "A less negative final reading can be warmer.",
    ),
    c(
      "p-exo",
      "Identify energy transfer",
      "A supplied reaction transfers energy to its surroundings. It is…",
      "Exothermic",
      {
        Endothermic: "Endothermic takes energy from surroundings.",
        "Neither because energy is conserved":
          "Energy conservation applies to both types.",
      },
      "Energy is transferred out of the reacting system.",
      "Use direction, not the word heat alone.",
    ),
    c(
      "p-endo",
      "Identify energy taken in",
      "A supplied reacting system takes energy from its surroundings. What happens to that surrounding thermal store in the stated insulated comparison?",
      "It loses energy and tends to cool",
      {
        "It gains energy and warms": "The energy direction is reversed.",
        "It creates extra energy": "Transfer does not create energy.",
      },
      "The surroundings supply energy to the endothermic process.",
      "Follow the source of the transferred energy.",
    ),
    c(
      "p-combustion",
      "Use a specification example",
      "Which supplied process is a standard exothermic reaction example?",
      "Fuel combustion",
      {
        "Specified endothermic thermal decomposition":
          "That takes in energy in the stated example.",
        "An electric pad proves a reaction":
          "Electrical heating does not by itself prove chemical change.",
      },
      "Fuel combustion transfers energy to surroundings.",
      "Distinguish the specified processes.",
    ),
    c(
      "p-decomposition",
      "Use a stated endothermic example",
      "A specified thermal decomposition continuously takes energy from surroundings. Its classification is…",
      "Endothermic",
      {
        Exothermic: "The stated direction is energy taken in.",
        "No energy transfer": "Continuous input is stated.",
      },
      "This reaction takes energy in.",
      "Use the given direction.",
    ),
    {
      ...n(
        "p-trace-fall",
        "Read a cooling trace",
        "From the supplied graph, give the SIGNED temperature change from the pre-mixing baseline to reaction-stage minimum.",
        -7,
        "°C",
        "23 °C at minute 2 falls to 16 °C at minute 4:16−23=−7 °C.",
        "Use the minimum during reaction.",
      ),
      temperatureTrace: graph(
        [0, 1, 2, 3, 4, 5, 6],
        [23, 23, 23, 19, 16, 18, 20],
        2,
      ),
    },
    c(
      "p-late",
      "Avoid the last-point trap",
      "A reaction-stage rise from 20 °C to 32 °C is followed by cooling after completion. Does the last cooling segment make that completed reaction endothermic?",
      "No",
      {
        Yes: "Later loss to room air does not reverse the reaction-stage transfer.",
        "It proves the reaction reversed":
          "A temperature slope alone does not establish reversal.",
      },
      "The reaction-stage rise supports exothermic transfer; later cooling is exchange with the room.",
      "Separate the reaction from its later cooling.",
    ),
    c(
      "p-nochange",
      "Recognise insufficient evidence",
      "No temperature change is detectable and no other energy-transfer evidence is provided. What is established?",
      "The energy classification is not established",
      {
        "No chemical reaction could have occurred":
          "A reaction may occur without a detectable temperature change.",
        "The reaction must be endothermic":
          "There is no supporting direction evidence.",
      },
      "A lack of measurable change alone does not establish the energy direction.",
      "Do not invent evidence from an unchanged reading.",
    ),
    c(
      "p-both",
      "Avoid an invented ranking",
      "A and B both meet every supplied warming/duration constraint. No additional preference is stated. Which meets the specification?",
      "Both",
      {
        "Always the hotter one": "No extra ranking criterion was given.",
        "Always the longer-lasting one":
          "No extra ranking criterion was given.",
      },
      "Both satisfy the stated requirements.",
      "Use the actual decision question.",
    ),
    c(
      "p-power",
      "Use the activation constraint",
      "A specified iron-oxidation warmer and an electric pad meet temperature/duration limits. Operation must require no electrical supply. Which fits?",
      "Iron-oxidation warmer",
      {
        "Electric pad": "It requires the prohibited supply.",
        Both: "One fails the activation condition.",
      },
      "The given oxidation warmer does not need that electrical supply.",
      "Apply activation as well as temperature and duration.",
    ),
    c(
      "p-process",
      "Distinguish process and reaction evidence",
      "A specified salt dissolves, taking energy from water. No evidence of new chemical substances is given. Which claim is supported?",
      "Endothermic process",
      {
        "A new-substance chemical reaction is proved":
          "Dissolution alone is insufficient for that claim.",
        "It must be exothermic": "The direction supplied is energy taken in.",
      },
      "Its energy-absorbing process is endothermic without automatically proving new substances.",
      "Keep energy direction separate from evidence of chemical change.",
    ),
    c(
      "p-hot-start",
      "Control the starting temperatures",
      "One hot reactant warms a colder liquid on mixing. No controlled reaction-energy evidence is given. Does warming alone prove an exothermic chemical reaction?",
      "No",
      {
        Yes: "Heat may come from the hot starting material.",
        "It proves endothermic transfer":
          "That direction is also not established.",
      },
      "Unequal initial thermal conditions confound the explanation.",
      "Identify other sources of heat.",
    ),
    c(
      "p-energy-size",
      "Do not rank energy from uncontrolled rises",
      "A gives 4 °C and B 8 °C temperature rises, but masses, heat capacities and reacted amounts differ. Is greater TOTAL energy transfer proved for B?",
      "No",
      {
        "Yes, a doubled rise always doubles energy":
          "The thermal context and amount are uncontrolled.",
        "A must release more": "The comparison does not establish that either.",
      },
      "A temperature rise is not a universal total-energy measurement.",
      "Check the controlled comparison.",
    ),
    w(
      "p-explain-warming",
      "Explain using evidence",
      "A controlled reacting mixture rises from 21 °C to 30 °C. Explain its classification using temperature evidence and energy direction.",
      "The surrounding solution temperature increases by 9 °C. It gains energy transferred from the reacting system, so the reaction is exothermic. Energy is transferred rather than created.",
      [
        "State the observed temperature increase.",
        "Give energy direction from system to surroundings.",
        "Name exothermic and retain energy conservation.",
      ],
    ),
    w(
      "p-explain-cooling",
      "Explain an endothermic observation",
      "A controlled surrounding solution falls from 25 °C to 18 °C during reaction. Explain the energy direction.",
      "The surroundings cool and lose thermal energy. The reacting system takes energy from them, so this is endothermic. The signed change is −7 °C; the positive size of the drop is 7 °C.",
      [
        "Use the cooling observation.",
        "State surroundings-to-system transfer.",
        "Distinguish the signed change from the drop size.",
      ],
    ),
    w(
      "p-explain-late",
      "Explain late cooling",
      "A reacting mixture reaches an exothermic maximum then cools towards room temperature after completion. Explain why the late fall does not make the completed reaction endothermic.",
      "The reaction-stage increase shows energy transferred to surroundings. After completion the warmer mixture transfers energy to room air and cools; that later exchange is not the energy change of the completed reaction.",
      [
        "Use the reaction-stage evidence.",
        "Identify later exchange with room air.",
        "Do not reverse classification from the final slope.",
      ],
    ),
  ],
  checkForms: [
    [
      {
        ...n(
          "a-graph",
          "Independent cooling graph",
          "Use the supplied graph to give the SIGNED change from pre-mixing baseline to reaction-stage minimum.",
          -6,
          "°C",
          "23 °C before mixing falls to 17 °C at the minimum:−6 °C.",
          "Use initial and minimum readings.",
        ),
        temperatureTrace: graph(
          [0, 1, 2, 3, 4, 5],
          [23, 23, 20, 17, 19, 21],
          1,
        ),
      },
      c(
        "a-direction",
        "Independent direction",
        "Under the supplied controlled conditions, the reacting mixture's surrounding solution warms. Which direction is supported?",
        "System to surroundings",
        {
          "Surroundings to system": "This reverses the observed transfer.",
          "No energy transfer because totals match":
            "Conservation does not prevent transfer.",
        },
        "The surroundings gain energy.",
        "Use the measured direction.",
      ),
      c(
        "a-use",
        "Independent product comparison",
        "Warming requires ≤43 °C and ≥35 min. A gives 41 °C/30 min; B gives 46 °C/45 min. Which meets BOTH requirements?",
        "Neither",
        {
          A: "Its duration is too short.",
          B: "Its temperature exceeds the limit.",
        },
        "Each fails a stated condition.",
        "Check both limits.",
      ),
      c(
        "a-input",
        "Independent starting input",
        "A supplied reaction needs an initial spark and then gives energy out. Is endothermic overall transfer proved by the spark?",
        "No",
        {
          Yes: "Starting energy and overall transfer are different.",
          "It proves that no reaction occurs":
            "A reaction is explicitly supplied.",
        },
        "Overall energy transfer out remains exothermic.",
        "Separate starting input from the supplied overall change.",
      ),
      w(
        "a-explain",
        "Independent evidence explanation",
        "A controlled surrounding solution temperature increases during reaction. Explain why calling it endothermic is not supported.",
        "Its temperature increase shows the surroundings gain energy from the reacting system. That direction is exothermic, while endothermic transfer would take energy from surroundings.",
        [
          "Use the measured increase.",
          "State the correct energy direction.",
          "Contrast the claimed endothermic direction.",
        ],
      ),
    ],
    [
      n(
        "b-drop",
        "Independent decrease size",
        "Initial 26.5 °C; reaction-stage minimum 19.0 °C. Give the positive SIZE of the temperature decrease.",
        7.5,
        "°C",
        "26.5−19.0=7.5 °C.",
        "Read the quantity requested.",
      ),
      {
        ...c(
          "b-late",
          "Independent trajectory",
          "Use the supplied graph. Which interpretation fits the controlled reaction-stage rise and later cooling?",
          "Exothermic reaction, then exchange with room air",
          {
            "Endothermic reaction because the final segment falls":
              "That uses only the later segment.",
            "No reaction-stage transfer because it eventually cools":
              "The reaction-stage rise still matters.",
          },
          "The reaction increases surrounding temperature before later heat loss.",
          "Separate the phases of the observation.",
        ),
        temperatureTrace: graph(
          [0, 1, 2, 3, 4, 5],
          [19, 19, 25, 28, 24, 21],
          1,
        ),
      },
      c(
        "b-use",
        "Independent cooling constraints",
        "Cooling requires a final temperature from 6 °C to 12 °C inclusive and duration ≥25 min. A gives 8 °C/30 min; B gives 10 °C/28 min. Which meets all conditions?",
        "Both",
        {
          "Only A": "B also satisfies both temperature and duration.",
          "Only B": "A also satisfies both temperature and duration.",
        },
        "Both pass all stated limits.",
        "Test each option.",
      ),
      c(
        "b-conserve",
        "Independent conservation",
        "Energy transferred out of the reacting system is gained by the surroundings. Which total-energy conclusion follows?",
        "Energy is conserved",
        {
          "Energy is created": "Transfer is not creation.",
          "Energy disappears from both": "The surroundings gain the transfer.",
        },
        "The loss and gain account for the transfer.",
        "Include both parts of the stated boundary.",
      ),
      w(
        "b-explain",
        "Independent limit explanation",
        "A mixture warms while an external heater operates. Explain why this alone does not establish the reaction's classification.",
        "The heater can transfer energy into the mixture, so the observed warming is not isolated evidence of energy from the chemical reaction. A suitable controlled comparison or other independent reaction-energy evidence is needed.",
        [
          "Identify external heat input.",
          "Do not attribute every rise to the reaction.",
          "State the missing controlled evidence.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "d-a-rise",
        "Delayed temperature change",
        "A controlled reaction has initial 21.5 °C and reaction-stage maximum 29.0 °C. Determine its temperature rise.",
        7.5,
        "°C",
        "29.0−21.5=7.5 °C.",
        "Maximum minus initial.",
      ),
      c(
        "d-a-power",
        "Delayed evidence",
        "A specified resistive electrical pad warms using electricity; no reaction in the pad is given. Does this prove an exothermic chemical reaction in it?",
        "No",
        {
          "Yes, every warm object reacts":
            "Electrical heating is a separate stated conversion.",
          "It proves an endothermic reaction":
            "Neither reaction claim follows.",
        },
        "The supplied electrical process is not evidence of a chemical reaction.",
        "Use the process actually given.",
      ),
      w(
        "d-a-explain",
        "Delayed cooling explanation",
        "Explain how an endothermic reacting system can make its surrounding solution colder without destroying energy.",
        "The reacting system takes energy from its surroundings. The surrounding thermal store loses energy and its temperature falls; energy has transferred into the system, so total energy is conserved.",
        [
          "Give surroundings-to-system direction.",
          "Explain the surrounding temperature fall.",
          "Retain total-energy conservation.",
        ],
      ),
    ],
    [
      {
        ...n(
          "d-b-graph",
          "Delayed graph",
          "Use the supplied graph to give the positive SIZE of the reaction-stage temperature decrease.",
          8,
          "°C",
          "The 25 °C baseline falls to 17 °C: a decrease size of 8 °C.",
          "Use baseline and minimum, then give a positive drop size.",
        ),
        temperatureTrace: graph(
          [0, 1, 2, 3, 4, 5],
          [25, 25, 21, 17, 20, 23],
          1,
        ),
      },
      c(
        "d-b-use",
        "Delayed simultaneous constraints",
        "A warming comparison requires ≤44 °C and ≥40 min. A gives 43 °C/45 min; B gives 47 °C/50 min. Which meets every condition?",
        "A",
        {
          B: "Its temperature exceeds the limit.",
          Both: "Only A meets both conditions.",
        },
        "A qualifies on temperature and duration.",
        "Do not choose duration alone.",
      ),
      w(
        "d-b-explain",
        "Delayed conservation explanation",
        "Explain why a reaction transferring energy to its surroundings does not create extra total energy.",
        "The reacting system loses energy while the surroundings gain that transfer. The combined energy is conserved; energy has changed distribution, not been created.",
        [
          "Identify the system's loss.",
          "Identify the surroundings' gain.",
          "State conserved total energy.",
        ],
      ),
    ],
  ],
};
energyJourney.guided[0].openingHint = true;
for (const q of energyJourney.practice)
  q.followUp =
    "heat-v1-r-" +
    (q.id.includes("products")
      ? "conservation"
      : q.id.includes("rise") ||
          q.id.includes("fall") ||
          q.id.includes("negative")
        ? "signed"
        : q.id.includes("trace") || q.id.includes("late")
          ? "extreme"
          : q.id.includes("both") || q.id.includes("power")
            ? "use"
            : q.id.includes("explain") ||
                q.id.includes("exo") ||
                q.id.includes("endo") ||
                q.id.includes("combustion") ||
                q.id.includes("decomposition")
              ? "transfer"
              : "evidence");
const all = [
  ...energyJourney.warmup,
  ...energyJourney.refresher,
  ...energyJourney.guided,
  ...energyJourney.practice,
  ...energyJourney.checkForms.flat(),
  ...energyJourney.reviewForms.flat(),
];
const aliases = [
  ["heat-v1-r-conservation", "heat-v1-b-conserve", "heat-v1-d-b-explain"],
  [
    "heat-v1-r-transfer",
    "heat-v1-g-transfer",
    "heat-v1-a-direction",
    "heat-v1-a-explain",
  ],
  ["heat-v1-r-evidence", "heat-v1-a-input"],
  ["heat-v1-g-evidence", "heat-v1-b-explain"],
  ["heat-v1-p-explain-cooling", "heat-v1-d-a-explain"],
  ["heat-v1-p-late", "heat-v1-p-explain-late", "heat-v1-b-late"],
  ["heat-v1-p-power", "heat-v1-d-a-power"],
  ["heat-v1-g-temperature", "heat-v1-g-trace"],
];
for (const group of aliases)
  for (const q of all)
    if (group.includes(q.id))
      q.exposureAliases = group.filter((id) => id !== q.id);

const legacy: Record<string, string[]> = {
  "exothermic-and-endothermic-0": [
    "heat-v1-r-transfer",
    "heat-v1-g-transfer",
    "heat-v1-a-direction",
    "heat-v1-a-explain",
  ],
  "exothermic-and-endothermic-1": ["heat-v1-p-endo", "heat-v1-d-a-explain"],
  "exothermic-and-endothermic-2": ["heat-v1-p-combustion"],
  "exothermic-and-endothermic-3": ["heat-v1-g-temperature", "heat-v1-g-trace"],
  "exothermic-and-endothermic-4": ["heat-v1-p-decomposition"],
  "exothermic-and-endothermic-5": [
    "heat-v1-p-endo",
    "heat-v1-p-explain-cooling",
  ],
};
for (const [id, group] of Object.entries(legacy))
  for (const q of all)
    if (group.includes(q.id))
      q.exposureAliases = [...(q.exposureAliases ?? []), id];
