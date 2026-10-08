import type { LearningTask, LessonJourney } from "../types";
import type { PracticalMode } from "../../lib/rates-practical";
type Task = LearningTask;
const model = (
  mode: PracticalMode,
  instruction: string,
  record = "initial",
): Task["model"] => ({ kind: "rates-practical", mode, record, instruction });
function c(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  m?: Task["model"],
): Task {
  const options = [answer, ...Object.keys(errors)],
    offset = [...id].reduce((s, x) => s + x.charCodeAt(0), 0) % options.length;
  return {
    id: "rp-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    model: m,
  };
}
function n(
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  m?: Task["model"],
): Task {
  return {
    id: "rp-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer: String(answer),
    unit,
    tolerance: 1e-8,
    explanation,
    hint,
    model: m,
  };
}
function w(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): Task {
  return {
    id: "rp-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    hint: rubric[0],
    rubric,
  };
}
export const warmup: Task[] = [
  n(
    "w-mean",
    "Calculate a simple mean",
    "Endpoint times are 28, 30 and 32 s. What is their mean?",
    30,
    "s",
    "(28+30+32)/3 = 30 s.",
    "Add the three times, then divide by three.",
  ),
  c(
    "w-variable",
    "Separate change from observation",
    "A student changes acid concentration and records gas volume every 10 s. Which quantity is deliberately changed?",
    "Acid concentration",
    {
      "Gas volume": "That is a measured outcome.",
      "Elapsed time alone":
        "Time indexes the observations; concentration is the tested factor.",
    },
    "The independent variable is the concentration being deliberately varied.",
    "Identify what distinguishes the runs.",
  ),
];
export const refresher: Task[] = [
  c(
    "r-roles",
    "Identify a measured variable",
    "To compare concentration effects, a student measures gas volume at timed intervals. Which description fits this measurement?",
    "Dependent measurement",
    {
      "Independent change": "The tested factor is concentration.",
      "A condition that must never change":
        "Gas volume is expected to change during reaction.",
    },
    "Gas volume over time supplies evidence about reaction rate.",
    "Distinguish the changed factor from the evidence.",
  ),
  c(
    "r-controls",
    "Repair a second changed factor",
    "Concentration doubles, but the second run is also 10 °C warmer. What repairs a concentration comparison?",
    "Use the same temperature",
    {
      "Keep both differences and call it fair":
        "Two changed factors prevent an isolated concentration conclusion.",
      "Change the solid mass too": "That introduces another difference.",
    },
    "Temperature also affects rate and must be controlled here.",
    "Change only the intended factor.",
  ),
  c(
    "r-gas-path",
    "Choose a gas-volume path",
    "For a gas-syringe measurement, how should gas leave the reacting flask?",
    "Through a gas-tight delivery path into a freely moving syringe",
    {
      "Through loose cotton wool into the room":
        "That supports a mass-loss method, not gas-volume recovery.",
      "Into a completely blocked tube":
        "Blocking the path prevents measurement.",
    },
    "Capture the gas without leakage or jamming the piston.",
    "Follow the gas to the measuring instrument.",
  ),
  n(
    "r-scale",
    "Read scale intervals",
    "A syringe has labelled marks at 20 and 30 cm³ with five equal spaces between them. What is one space?",
    2,
    "cm³",
    "(30−20)/5 = 2 cm³.",
    "Count spaces, not just printed numbers.",
  ),
  n(
    "r-dilution",
    "Conserve premix volume",
    "A 50 cm³ premix needs 20 cm³ stock solution. How much water completes the fixed total?",
    30,
    "cm³",
    "50−20 = 30 cm³ water.",
    "Stock plus water must equal the premix total.",
  ),
  n(
    "r-stock",
    "Calculate a stock share",
    "Make 50 cm³ of 16 g dm⁻³ premix from 32 g dm⁻³ stock. How much stock is needed?",
    25,
    "cm³",
    "Stock volume = target concentration ÷ stock concentration × total premix volume = 16/32 × 50 = 25 cm³.",
    "Use the target-to-stock ratio, then complete the total with water.",
  ),
  n(
    "r-after-acid",
    "Calculate the further dilution",
    "A 30 cm³ premix is 10 g dm⁻³. Add 20 cm³ acid. Ignoring reaction during the instant of mixing and assuming additive volumes, what is the initial diluted thiosulfate concentration?",
    6,
    "g dm⁻³",
    "10 × 30/(30+20) = 6 g dm⁻³. The same thiosulfate amount occupies a larger volume.",
    "Multiply the premix concentration by its fraction of total mixed volume.",
  ),
  c(
    "r-label",
    "Distinguish premix and reaction mixture",
    "A thiosulfate solution is labelled before a fixed volume of acid is added. What does adding acid do immediately to thiosulfate concentration, assuming additive volumes?",
    "It decreases because total volume increases",
    {
      "It stays identical because no water is named":
        "Acid solution still adds solvent volume.",
      "It increases because more liquid is present":
        "The same thiosulfate amount occupies more volume.",
    },
    "State whether concentration labels refer to before or after acid addition.",
    "Track amount and total volume separately.",
  ),
  c(
    "r-endpoint",
    "Use a consistent optical endpoint",
    "Why use the same flask, printed cross and viewing conditions for endpoint comparisons?",
    "To judge a comparable optical endpoint",
    {
      "To make every reaction take identical time":
        "Different concentrations can change the time.",
      "To remove all random error automatically":
        "Observer variation can remain.",
    },
    "Depth, lighting and the criterion affect when the cross is judged invisible.",
    "Control what makes the endpoint visible.",
  ),
  n(
    "r-proxy",
    "Calculate reciprocal time",
    "A fixed endpoint is recorded at 50 s. Calculate the relative-rate proxy 1/t.",
    0.02,
    "s⁻¹",
    "1/50 = 0.02 s⁻¹. This is an endpoint proxy, not gas volume per second.",
    "Divide one by time in seconds.",
  ),
  c(
    "r-axes",
    "Place experimental variables",
    "On a graph of collected gas volume against elapsed time, which axes are appropriate?",
    "Time on the horizontal axis; gas volume on the vertical axis",
    {
      "Gas volume horizontal; concentration vertical":
        "These are not the named graph variables.",
      "Both axes show elapsed time": "One axis must show the measured outcome.",
    },
    "Label each variable and its unit.",
    "Time indexes the measured quantity.",
  ),
  n(
    "r-interval",
    "Use differences in both readings",
    "Gas volume changes from 10 to 22 cm³ between 5 and 11 s. Find mean rate over this interval.",
    2,
    "cm³/s",
    "(22−10)/(11−5) = 12/6 = 2 cm³/s.",
    "Use both changes, not the final readings alone.",
  ),
  c(
    "r-anomaly",
    "Preserve a suspect observation",
    "One reading is far from the trend, with no confirmed fault. What should happen first?",
    "Keep the original record and investigate or repeat",
    {
      "Replace it with the value that fits": "That invents evidence.",
      "Delete it automatically":
        "A suspect pattern alone is not a documented procedural cause.",
    },
    "Anomalies need evaluation; original observations remain available. If a question explicitly identifies an anomalous value and requests a mean without it, follow that instruction transparently, even if its cause is unknown.",
    "A tidy graph is not a reason to rewrite data.",
  ),
  c(
    "r-precision",
    "Distinguish agreement from accuracy",
    "Three gas-volume repeats are close together, but the same bung leaks each time. What follows?",
    "They agree, but gas recovery may still be inaccurate",
    {
      "They must be accurate because they agree":
        "A common leak can bias all three.",
      "Repeating creates the missing gas":
        "Repeats cannot recover escaped gas.",
    },
    "Repair systematic faults as well as assessing repeat variation.",
    "Separate repeat agreement from closeness to the true value.",
  ),
];
export const guided: Task[] = [
  c(
    "g-plan",
    "Repair the comparison",
    "Control the extra factor.",
    "Temperature",
    {
      "Only the acid concentration":
        "That is the deliberately changed variable.",
      "Only gas volume after reaction":
        "Volume is evidence, not the supplied extra changed condition.",
    },
    "The runs are 20 and 30 °C; use one common temperature before attributing rate differences to concentration.",
    "Compare both condition columns.",
    model(
      "plan",
      "Choose variable roles, repair the comparison and predict a testable result.",
    ),
  ),
  n(
    "g-apparatus",
    "Read and diagnose collection",
    "Read the supplied syringe boundary. How much gas has been collected?",
    24,
    "cm³",
    "The boundary is at 24 cm³. The documented leak means this can underestimate gas actually formed.",
    "Use the two-cubic-centimetre divisions.",
    model("apparatus", "Read the scale and follow the documented gas path."),
  ),
  n(
    "g-dilution",
    "Construct the fixed-volume premix",
    "Prepare the displayed 50 cm³, 8 g dm⁻³ thiosulfate premix using 40 g dm⁻³ stock. How much water is required?",
    40,
    "cm³",
    "10 cm³ stock supplies one fifth of the stock concentration in 50 cm³; add 40 cm³ water.",
    "First find stock volume, then subtract from total.",
    model(
      "dilution",
      "Construct stock, water and the correct concentration label.",
    ),
  ),
  n(
    "g-endpoint",
    "Bound the observed disappearance",
    "From the displayed samples, what is the first sampled time when the cross is no longer visible?",
    40,
    "s",
    "First nonvisible sample is 40 s. The exact disappearance lies after 30 and at or before 40 s.",
    "Inspect consecutive supplied observations.",
    model(
      "endpoint",
      "Step through observations and distinguish a sampled bound from an exact endpoint.",
    ),
  ),
  n(
    "g-plot",
    "Plot original observations",
    "For the displayed volume data, calculate mean gas production rate from 10 to 30 s.",
    0.7,
    "cm³/s",
    "(26−12)/(30−10) = 14/20 = 0.7 cm³/s.",
    "Construct all original points, then use the two relevant readings.",
    model(
      "plot",
      "Plot all six readings and choose a justified fit treatment.",
    ),
  ),
  n(
    "g-repeats",
    "Use a documented exclusion",
    "The displayed third timing has a confirmed late-start fault. Find the stated mean of the two valid times.",
    41,
    "s",
    "Retain the raw 20 s record with its note. The declared valid mean is (40+42)/2 = 41 s.",
    "Use only trials with valid timing for this stated mean.",
    model(
      "repeats",
      "Declare included trials, calculate and justify the treatment.",
    ),
  ),
];
export const practice: Task[] = [
  c(
    "p-hypothesis",
    "Make a testable prediction",
    "For the same magnesium amount and geometry, with excess acid and other conditions fixed, which hypothesis addresses concentration?",
    "Higher acid concentration gives a faster initial hydrogen-production rate",
    {
      "Higher concentration must always create more final hydrogen":
        "Final amount depends on limiting reactant, not concentration alone.",
      "Temperature must rise in the concentrated run":
        "That would add an uncontrolled factor.",
    },
    "Compare initial rates while keeping other conditions controlled.",
    "Separate rate from final amount.",
  ),
  c(
    "p-carbonate-control",
    "Evaluate the solid comparison",
    "Two acid concentrations are compared using the same marble mass, but one run uses chips and the other powder. What is the problem?",
    "Particle size also changes",
    {
      "There is no additional difference because the masses match":
        "Same mass does not mean same surface area.",
      "Only carbon dioxide identity changes":
        "Both reactions produce carbon dioxide.",
    },
    "Use the same particle size when investigating concentration.",
    "Inspect surface area as well as mass.",
  ),
  c(
    "p-surface-mass",
    "Isolate a surface-area change",
    "A particle-size investigation uses 0.8 g large chips and 1.2 g small chips. Which condition should be repaired?",
    "Use the same marble mass",
    {
      "Use identical particle size":
        "That removes the intended independent change.",
      "Change acid concentration as well":
        "That introduces another rate factor.",
    },
    "Different solid amounts confound the surface-area comparison.",
    "Preserve the tested factor; control the extra difference.",
  ),
  c(
    "p-measurement",
    "Choose the dependent evidence",
    "A concentration investigation times the same disappearing-cross endpoint. Which is the dependent measurement?",
    "Time to the stated optical endpoint",
    {
      "The concentration deliberately chosen":
        "That is the independent variable.",
      "The brand printed on the stopwatch":
        "That is not the measured reaction outcome.",
    },
    "Endpoint time supplies comparative evidence when viewing conditions are controlled.",
    "Identify what is measured for each concentration.",
  ),
  w(
    "p-plan-written",
    "Design the gas investigation",
    "Write an exam-style plan to compare two acid concentrations using the same magnesium amount. Include a hypothesis, controlled conditions, measurement, timing and repeats. You are designing a supervised school practical, not performing it here.",
    "Predict a faster initial reaction at higher acid concentration. Keep cleaned magnesium mass and geometry, acid volume and temperature the same, with acid in excess if comparing equal limiting magnesium. Use a gas-tight path to a freely moving gas syringe, synchronise mixing/sealing/timing, record volumes at stated intervals, and repeat each concentration. Plot volume against time and compare rates; use eye protection and keep ignition sources away from hydrogen.",
    [
      "State concentration as the independent variable and a testable rate hypothesis.",
      "Specify relevant magnesium, acid-volume and temperature controls.",
      "Describe gas-tight collection, consistent starting time and timed volume readings.",
      "Use repeated trials and graph/rate evidence, with relevant practical precautions.",
    ],
  ),
  n(
    "p-mass-loss",
    "Interpret balance readings",
    "A carbonate reaction with escaping gas begins at 125.4 g and later reads 125.0 g. What mass has been lost?",
    0.4,
    "g",
    "125.4−125.0 = 0.4 g. Gas escaping accounts for the loss; matter is not destroyed.",
    "Subtract later balance mass from initial mass.",
  ),
  c(
    "p-stuck",
    "Diagnose syringe movement",
    "A gas syringe piston cannot move freely because its support is too tight. What should be done?",
    "Support it securely while allowing free piston movement",
    {
      "Call the unmoving reading proof that no reaction occurs":
        "The instrument cannot track gas correctly.",
      "Block the delivery tube too":
        "That prevents measurement and is inappropriate.",
    },
    "A working collection path needs a freely moving piston.",
    "Check the measuring apparatus before interpreting reaction rate.",
  ),
  n(
    "p-water-scale",
    "Read inverted gas collection",
    "An inverted cylinder is labelled in 10 cm³ steps with five equal divisions per step. The gas-water boundary is one division beyond 30 cm³. Read the gas volume.",
    32,
    "cm³",
    "Each division is 2 cm³; 30+2 = 32 cm³. Read collected gas, not remaining water volume.",
    "Follow the gas-volume scale from its zero.",
  ),
  c(
    "p-late-start",
    "Evaluate missing early evidence",
    "Gas begins forming before the bung is fitted and the clock is started. Which conclusion is justified?",
    "Early gas and timing evidence are missing",
    {
      "The recorded late volume must exceed all gas formed":
        "Some gas can escape before collection.",
      "A precise later stopwatch fixes the missing early evidence":
        "Precision cannot reconstruct observations that were not taken.",
    },
    "Synchronise the reaction start and measurement as closely and consistently as possible.",
    "Consider both escaped gas and the time origin.",
  ),
  w(
    "p-apparatus-written",
    "Distinguish two gas paths",
    "Explain why a gas-volume setup needs gas-tight delivery but a carbonate mass-loss setup needs gas to leave the weighed apparatus.",
    "A gas-volume method captures produced gas in a syringe or an inverted water-filled cylinder; leaks underestimate recovery. A mass-loss method detects the decrease when gas leaves the weighed apparatus, with cotton wool limiting spray while allowing gas to escape. A sealed whole apparatus retains its mass. Both methods need timed readings and appropriate practical controls.",
    [
      "Explain capture and leakage for gas volume.",
      "Explain gas escape and spray control for mass loss.",
      "State that sealing the whole weighed apparatus prevents this gas mass loss.",
    ],
  ),
  n(
    "p-stock-sixteen",
    "Calculate stock for a fixed premix",
    "Make 50 cm³ of 16 g dm⁻³ premix from 40 g dm⁻³ stock. What stock volume is needed?",
    20,
    "cm³",
    "16/40 × 50 = 20 cm³ stock; water completes the fixed total.",
    "Use target concentration as a fraction of stock concentration.",
  ),
  n(
    "p-stock-different",
    "Use a different stock",
    "Make 50 cm³ of 12 g dm⁻³ premix from 30 g dm⁻³ stock. What stock volume is needed?",
    20,
    "cm³",
    "12/30 × 50 = 20 cm³. The changed stock concentration matters.",
    "Do not reuse a volume without checking the stock.",
  ),
  n(
    "p-combined-volume",
    "Track acid addition",
    "A 50 cm³ thiosulfate premix receives 10 cm³ acid. Assuming additive volumes, what is the total immediately after mixing?",
    60,
    "cm³",
    "50+10 = 60 cm³. This affects the concentration label.",
    "Include both solutions.",
  ),
  n(
    "p-after-acid",
    "Distinguish the two concentrations",
    "A 40 cm³ premix contains thiosulfate at 5 g dm⁻³. Add 10 cm³ acid. Ignoring reaction during the instant of mixing and assuming additive volumes, what is the initial diluted thiosulfate concentration?",
    4,
    "g dm⁻³",
    "5 × 40/50 = 4 g dm⁻³. This is after acid addition, not the premix label.",
    "The thiosulfate amount is unchanged by dilution; total volume becomes 50 cm³.",
  ),
  w(
    "p-dilution-written",
    "Explain fixed-volume dilution",
    "Why replace stock solution with water to keep premix volume constant, and then add the same acid volume and concentration to each trial?",
    "Changing the stock share varies thiosulfate concentration while a fixed premix volume keeps liquid depth comparable in the same flask. Constant acid volume/concentration avoids an additional changed reactant factor and makes the final volume comparable. The premix concentration label is before acid addition; the initial reaction mixture is further diluted.",
    [
      "Link stock share to changed concentration.",
      "Link fixed volume and flask to comparable depth and optical endpoint.",
      "Control acid conditions and distinguish premix from reaction-mixture concentration.",
    ],
  ),
  c(
    "p-endpoint-interval",
    "Read a sampled interval",
    "The cross is visible at 10 s and first recorded invisible at 15 s. With no separate continuous observation, what can be said?",
    "Disappearance occurs after 10 s and at or before 15 s",
    {
      "It occurred at exactly 15 s":
        "That is a sampling time, not a proven continuous event time.",
      "It occurred before 10 s": "The cross was still visible at 10 s.",
    },
    "Discrete observations bound the event.",
    "Use both adjacent observations.",
  ),
  n(
    "p-endpoint-ratio",
    "Compare reciprocal-time proxies",
    "Under the same endpoint method, one trial has an endpoint time of 40 s and another 80 s. What is (1/40) divided by (1/80)?",
    2,
    "",
    "(1/40)/(1/80) = 80/40 = 2. This compares proxies at the same endpoint.",
    "Shorter time gives the larger reciprocal.",
  ),
  n(
    "p-endpoint-proxy",
    "Give the correct proxy unit",
    "A fixed optical endpoint is recorded at 40 s. Calculate 1/t.",
    0.025,
    "s⁻¹",
    "1/40 = 0.025 s⁻¹, a relative-rate proxy.",
    "Use one divided by seconds.",
  ),
  n(
    "p-sensor-threshold",
    "Read a defined sensor endpoint",
    "At 20 s the sensor reads 65%; at 30 s it reads 48%. The endpoint is light at or below 50%. What is the first supplied sampled time at the endpoint?",
    30,
    "s",
    "48% is at or below 50%; the preceding 65% sample is not. Exact crossing lies between these samples.",
    "Apply the stated threshold, including equality.",
  ),
  w(
    "p-endpoint-written",
    "Design comparable cross timings",
    "Explain how to compare thiosulfate concentrations by disappearing-cross timing and make the endpoint judgement comparable.",
    "Use a range of thiosulfate premix concentrations at the same total premix volume, in the same flask over the same printed cross. Keep temperature, lighting, viewing direction, observer or stated criterion, and acid volume/concentration consistent. Start timing with mixing and stop at the same disappearance criterion; repeat each concentration, retain results and compare mean times or consistently defined reciprocal-time proxies. In a supervised practical use goggles and ventilation, avoiding sulfur dioxide inhalation.",
    [
      "Vary concentration while controlling total volume and acid conditions.",
      "Control flask/depth, cross, temperature and viewing judgement.",
      "Use consistent start/stop criteria and repeats.",
      "Explain comparative time evidence and relevant sulfur-dioxide precautions.",
    ],
  ),
  n(
    "p-mass-interval",
    "Calculate a mass-loss rate",
    "Mass lost rises from 0.4 to 0.9 g between 20 and 60 s. Calculate mean rate in that interval.",
    0.0125,
    "g/s",
    "(0.9−0.4)/(60−20) = 0.5/40 = 0.0125 g/s.",
    "Use differences, including the elapsed-time difference.",
  ),
  n(
    "p-remaining-mass",
    "Use decreasing balance readings",
    "Remaining mass falls from 125.6 to 125.1 g between 10 and 30 s. What is the positive mean mass-loss rate?",
    0.025,
    "g/s",
    "(125.6−125.1)/(30−10) = 0.5/20 = 0.025 g/s. The remaining-mass graph has negative slope.",
    "Distinguish a decreasing signal from a positive amount lost.",
  ),
  n(
    "p-unequal-times",
    "Use actual time spacing",
    "Gas volume rises from 8 cm³ at 5 s to 30 cm³ at 30 s. Calculate mean rate over that interval.",
    0.88,
    "cm³/s",
    "(30−8)/(30−5) = 22/25 = 0.88 cm³/s.",
    "Do not count observation rows as equal time intervals.",
  ),
  c(
    "p-raw-point",
    "Retain an anomalous observation",
    "A supplied gas-volume reading falls below its neighbours, and its cause is unknown. How should the original graph record be handled?",
    "Plot the original point, investigate it and avoid forcing the supported fit towards it",
    {
      "Replace the point with an interpolated observation":
        "An estimate is not the original observation.",
      "Delete the raw record and forget the cause":
        "That loses evidence needed for evaluation.",
    },
    "Original points and a justified best-fit treatment are different things.",
    "Keep evidence distinct from interpretation.",
  ),
  w(
    "p-plot-written",
    "Explain a justified graph",
    "Explain how to plot gas-volume observations, handle a suspect reading and compare interval rates without inventing data.",
    "Label elapsed time in seconds horizontally and gas volume in cubic centimetres vertically. Use appropriate numerical scales and plot every original reading at its coordinates, including a suspect point. Investigate or repeat the suspect measurement; draw a justified best-fit trend without bending towards a known anomalous reading. Calculate interval rate from the change in volume divided by change in time. Keep original observations distinct from estimates or fitted values.",
    [
      "Name axes, units and appropriate spacing.",
      "Retain and investigate the original suspect observation.",
      "Distinguish a best-fit trend from rewriting observations.",
      "Use changes in both readings and time for interval rate.",
    ],
  ),
  n(
    "p-suspect-mean",
    "Use the declared original set",
    "Times are 40, 42 and 20 s. No cause for the suspect third result is confirmed; the question asks for the mean of all original trials. Calculate it.",
    34,
    "s",
    "(40+42+20)/3 = 102/3 = 34 s. State the suspect result and investigate rather than silently exclude it.",
    "Use the expressly declared set of trials.",
  ),
  n(
    "p-repeat-range",
    "Assess repeat spread",
    "Valid endpoint times are 29, 30 and 31 s. What is their range?",
    2,
    "s",
    "31−29 = 2 s. Range describes spread, not accuracy by itself.",
    "Subtract the minimum from the maximum.",
  ),
  n(
    "p-identified-mean",
    "Follow a stated anomaly instruction",
    "Times are 42, 44 and 61 s. The exam question identifies 61 s as anomalous and asks for the mean without it. Calculate the requested mean.",
    43,
    "s",
    "(42+44)/2 = 43 s. Keep the original 61 s record with the stated exclusion; do not invent a cause.",
    "Follow the stated calculation set while preserving original evidence.",
  ),
  c(
    "p-systematic",
    "Evaluate close gas repeats",
    "Collected volumes are 22, 23 and 22.5 cm³, with the same documented leak in all runs. What improvement is relevant?",
    "Repair and check the leak before repeating",
    {
      "Only average more runs with the same leak":
        "More repeats may still share the same bias.",
      "Assert the mean is the actual gas formed":
        "Escaped gas was not collected.",
    },
    "Close agreement does not establish complete gas recovery.",
    "Address the common measurement fault.",
  ),
  c(
    "p-reproducibility",
    "Compare different groups",
    "Three groups use the same method with equivalent apparatus. What does comparing their valid results help assess?",
    "Reproducibility between groups",
    {
      "Whether the apparatus can never have a systematic fault":
        "Different groups can share a limitation.",
      "Only repeatability by the same operator":
        "The operators and apparatus differ between groups.",
    },
    "Reproducibility concerns agreement when different people or equipment carry out a comparable method.",
    "Identify who obtained the results.",
  ),
  w(
    "p-exclusion-written",
    "Justify an exclusion honestly",
    "A mass-loss trial of 1.4 g has a documented liquid-splash fault; the other trials are 0.8 and 0.82 g. Explain the exclusion, remaining mean and relevant improvement.",
    "Keep the original 1.4 g reading and its splash note. It includes lost liquid as well as escaping gas, so exclude it from the stated gas-loss mean. The valid mean is (0.8+0.82)/2 = 0.81 g. Prevent spray loss while allowing gas to escape, then repeat. Do not exclude another reading merely because it looks inconvenient.",
    [
      "Retain the raw result and documented cause.",
      "Explain why splash loss invalidates a gas-loss interpretation.",
      "Use the two declared valid values for the mean.",
      "Suggest spray control and repetition without sealing the gas inside.",
    ],
  ),
];
export const checkForms: Task[][] = [
  [
    w(
      "a-plan",
      "Evaluate a changed concentration method",
      "A student compares two acid concentrations with equal cleaned magnesium mass and geometry, equal acid volume and excess acid. Run A is at 19 °C; run B is at 29 °C. Explain what can be concluded now and how to repair the comparison.",
      "Both concentration and temperature change, so the observed rate difference cannot be attributed to concentration alone. Repeat using one common temperature while keeping the listed magnesium and acid-volume conditions fixed. Record gas volume at timed intervals, repeat each concentration and compare rate evidence.",
      [
        "Identify temperature as an additional changed rate factor.",
        "Limit the causal conclusion about concentration.",
        "Specify a common temperature and appropriate controlled, repeated rate evidence.",
      ],
    ),
    c(
      "a-apparatus",
      "Choose collection for a new reaction",
      "A carbonate reaction produces carbon dioxide. To measure its volume at timed intervals, which setup is appropriate?",
      "A gas-tight delivery path to a freely moving gas syringe",
      {
        "A flask with loose cotton wool releasing all gas into the room":
          "That can support mass loss but does not collect the gas volume.",
        "A flask sealed with no delivery path and no gas measuring instrument":
          "It does not provide timed collected volumes.",
      },
      "The gas-volume measurement requires capture and a working measuring instrument.",
      "Follow the intended measured quantity to the apparatus.",
    ),
    n(
      "a-dilution",
      "Prepare changed premix givens",
      "Prepare 60 cm³ of 10 g dm⁻³ thiosulfate premix from 25 g dm⁻³ stock. What stock volume is required?",
      24,
      "cm³",
      "10/25 × 60 = 24 cm³ stock.",
      "Use the target-to-stock concentration ratio.",
    ),
    n(
      "a-endpoint",
      "Calculate an independently recorded proxy",
      "A continuous observer record gives a fixed-cross endpoint at 20 s. Calculate 1/t.",
      0.05,
      "s⁻¹",
      "1/20 = 0.05 s⁻¹. This is a relative-rate proxy for the fixed endpoint.",
      "Use the recorded time in seconds.",
    ),
    n(
      "a-plot",
      "Use an unfamiliar gas interval",
      "Collected gas rises from 7 cm³ at 15 s to 31 cm³ at 45 s. Calculate mean rate in this interval.",
      0.8,
      "cm³/s",
      "(31−7)/(45−15) = 24/30 = 0.8 cm³/s.",
      "Use changes in both quantities.",
    ),
    c(
      "a-repeats",
      "Decide without a confirmed cause",
      "Endpoint times are 52, 53 and 29 s. The third looks unusual but no fault has been confirmed. What is justified?",
      "Keep its original record and investigate or repeat",
      {
        "Rewrite 29 s as 52 s before calculating":
          "That invents a measurement.",
        "Automatically delete it without a reason":
          "Pattern alone does not document a procedural failure.",
      },
      "A suspect result requires further evidence and transparent treatment.",
      "Preserve the original observations.",
    ),
  ],
  [
    c(
      "b-plan",
      "Identify a different confound",
      "A temperature investigation changes the reaction from 20 to 35 °C but also doubles thiosulfate concentration. What repairs the intended temperature comparison?",
      "Use the same thiosulfate concentration",
      {
        "Use the same temperature in both runs":
          "That removes the intended independent change.",
        "Change the viewing light too": "That adds another difference.",
      },
      "Preserve the intended temperature change while controlling concentration.",
      "Identify the intended variable before repairing the other change.",
    ),
    w(
      "b-apparatus",
      "Interpret a sealed mass reading",
      "A carbonate reaction produces gas inside a completely sealed apparatus on a balance. Its whole-apparatus mass stays constant. A student says no reaction occurred. Explain the mistake and how a mass-loss method differs.",
      "Constant whole-apparatus mass is compatible with a reaction when all matter, including the gas, remains inside. It does not prove no reaction. A mass-loss method permits gas to leave the weighed apparatus while limiting liquid spray; time-dependent mass decrease then supplies rate evidence. A gas-volume method instead captures the gas in a measuring instrument.",
      [
        "Explain conservation of mass in the sealed whole apparatus.",
        "Reject the inference that unchanged total mass proves no reaction.",
        "Distinguish gas escape for mass loss from capture for volume measurement.",
      ],
    ),
    n(
      "b-dilution",
      "Complete a changed dilution",
      "Prepare 48 cm³ of 3 g dm⁻³ premix from 12 g dm⁻³ stock. What water volume is required?",
      36,
      "cm³",
      "Stock volume = 3/12 × 48 = 12 cm³; water = 48−12 = 36 cm³.",
      "Find stock first, then complete the fixed total.",
    ),
    c(
      "b-endpoint",
      "Bound a sensor endpoint",
      "A sensor endpoint is light at or below 30%. Light is 40% at 25 s and first sampled at 28% at 35 s. With no continuous record, when did the endpoint occur?",
      "After 25 s and at or before 35 s",
      {
        "At exactly 35 s, certainly":
          "35 s is the first reached sample, not a proven exact crossing time.",
        "At or before 25 s": "40% is above the stated threshold.",
      },
      "Use the two adjacent observations and the stated threshold.",
      "Distinguish sample time from exact crossing.",
    ),
    n(
      "b-plot",
      "Calculate a new mass interval",
      "Mass lost rises from 1.1 g at 20 s to 1.7 g at 50 s. Calculate mean mass-loss rate over the interval.",
      0.02,
      "g/s",
      "(1.7−1.1)/(50−20) = 0.6/30 = 0.02 g/s.",
      "Subtract both initial readings.",
    ),
    n(
      "b-repeats",
      "Use documented valid times",
      "Endpoint times are 36, 38 and 7 s. The third trial has a documented late stopwatch start and is excluded from the stated valid mean. Calculate that mean.",
      37,
      "s",
      "(36+38)/2 = 37 s. Keep the original third value with its documented exclusion reason.",
      "Use the two stated valid trials.",
    ),
  ],
];
export const reviewForms: Task[][] = [
  [
    c(
      "ra-control",
      "Retrieve a fair optical comparison",
      "Thiosulfate concentration is changed, with equal total volume and acid conditions. The second run uses much dimmer lighting. Why repair that difference?",
      "Lighting affects judgement of the optical endpoint",
      {
        "Lighting controls the equation coefficients":
          "It changes observation conditions, not stoichiometry.",
        "It guarantees exactly identical reaction times":
          "Concentration can still change endpoint time.",
      },
      "Keep viewing conditions comparable for a fair endpoint measurement.",
      "Separate observation conditions from reaction conditions.",
    ),
    n(
      "ra-dilution",
      "Retrieve a changed stock-water total",
      "A fixed 35 cm³ premix uses 21 cm³ stock solution. What water volume is required?",
      14,
      "cm³",
      "35−21 = 14 cm³.",
      "Stock plus water must equal the fixed total.",
    ),
    w(
      "ra-evidence",
      "Retrieve why repeats are insufficient",
      "Three gas collections agree closely, but all use the same leaking connection. Explain what the agreement does and does not establish, and what to improve.",
      "The measurements agree with one another, which indicates limited repeat spread. They can all underestimate gas because of the common leak, so agreement alone does not establish accurate recovery. Repair and test the connection before repeating; retain and report the original records and limitation.",
      [
        "Distinguish repeat agreement from accuracy.",
        "Explain the common leak and underestimated recovery.",
        "Suggest repairing/checking the connection and repeating transparently.",
      ],
    ),
  ],
  [
    n(
      "rb-interval",
      "Retrieve a new interval rate",
      "Gas volume rises from 9 to 24 cm³ between 6 and 16 s. Find mean rate in that interval.",
      1.5,
      "cm³/s",
      "(24−9)/(16−6) = 15/10 = 1.5 cm³/s.",
      "Use the volume change and time change.",
    ),
    c(
      "rb-endpoint",
      "Retrieve the meaning of reciprocal time",
      "A fixed optical endpoint is reached in 25 s. What are the units and meaning of 1/t?",
      "s⁻¹, a relative-rate proxy for the consistent endpoint",
      {
        "cm³/s, a measured gas production rate":
          "No gas volume has been measured.",
        "s, the original elapsed time":
          "The reciprocal has inverse-time units.",
      },
      "The comparison depends on a consistent endpoint and method.",
      "Invert the time unit as well as the number.",
    ),
    w(
      "rb-anomaly",
      "Retrieve honest anomaly handling",
      "A gas-volume point lies far from its neighbours, but its cause is unknown. Explain how to preserve, investigate and present the evidence.",
      "Keep the original reading and plot it at its observed coordinates. Check the method and repeat where possible rather than changing it to an expected value. Present a justified best-fit trend and state the suspect point and any exclusion decision separately, with a reason supported by evidence.",
      [
        "Retain and plot the original reading.",
        "Investigate or repeat without inventing replacement observations.",
        "Distinguish justified fit/exclusion decisions from the raw evidence.",
      ],
    ),
  ],
];
const recovery: Record<string, string> = {
  "p-hypothesis": "r-roles",
  "p-carbonate-control": "r-controls",
  "p-surface-mass": "r-controls",
  "p-measurement": "r-roles",
  "p-plan-written": "r-controls",
  "p-mass-loss": "r-gas-path",
  "p-stuck": "r-gas-path",
  "p-water-scale": "r-scale",
  "p-late-start": "r-gas-path",
  "p-apparatus-written": "r-gas-path",
  "p-stock-sixteen": "r-stock",
  "p-stock-different": "r-stock",
  "p-combined-volume": "r-label",
  "p-after-acid": "r-after-acid",
  "p-dilution-written": "r-label",
  "p-endpoint-interval": "r-endpoint",
  "p-endpoint-ratio": "r-proxy",
  "p-endpoint-proxy": "r-proxy",
  "p-sensor-threshold": "r-endpoint",
  "p-endpoint-written": "r-endpoint",
  "p-mass-interval": "r-interval",
  "p-remaining-mass": "r-interval",
  "p-unequal-times": "r-interval",
  "p-raw-point": "r-anomaly",
  "p-plot-written": "r-axes",
  "p-suspect-mean": "r-anomaly",
  "p-repeat-range": "r-precision",
  "p-identified-mean": "r-anomaly",
  "p-systematic": "r-precision",
  "p-reproducibility": "r-precision",
  "p-exclusion-written": "r-anomaly",
};
for (const t of practice) t.followUp = "rp-v1-" + recovery[t.id.slice(6)];
export const ratesPracticalJourney: LessonJourney = {
  version: 1,
  introduction:
    "Build a fair comparison and follow the evidence from apparatus to observations, graphs and conclusions. Choose controlled conditions, construct a dilution, distinguish a sampled endpoint from an exact time, and justify treatment of repeats.",
  scopeNote:
    "AQA Chemistry required practical5 and Trilogy11 require both gas-volume and colour/turbidity investigations with hypothesis development. Pearson Chemistry7.1 uses marble chips for the gas method; both magnesium/hydrogen and carbonate/carbon-dioxide examples appear here. Supplied apparatus readings and observations are illustrative data for analysis, not measured kinetic simulations. Dilution labels state the premix before acid addition. Reciprocal endpoint time is a relative-rate proxy for a consistent method, not gas-volume rate or a rate constant. A suspect result is retained and investigated; a documented invalid trial or explicitly identified anomaly can be excluded transparently from a declared mean. Repeats do not remove a common systematic fault. The 3D gas apparatus is schematic and not to scale; numerical scale work uses the separate 2D reading. Written responses use self-review rubrics, not examiner-awarded marks. School-practical context does not replace supervised laboratory skills. Full multi-board coverage and whole-course exam readiness remain under review.",
  outcomes: [
    "Plan a testable hypothesis and control relevant reaction and observation conditions.",
    "Select, read and evaluate gas-volume and mass-loss apparatus.",
    "Construct fixed-volume dilution and distinguish premix from final mixture.",
    "Use consistent optical endpoints and interpret sampled bounds.",
    "Plot original observations with units and calculate interval rates.",
    "Evaluate repeat spread, anomalies, exclusions and systematic faults honestly.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
};
export const ratesPracticalAllTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const ratesPracticalExposureFamilies: Record<string, string[]> = {
  plan: [
    "w-variable",
    "r-roles",
    "r-controls",
    "g-plan",
    "p-hypothesis",
    "p-carbonate-control",
    "p-surface-mass",
    "p-measurement",
    "p-plan-written",
    "a-plan",
    "b-plan",
    "ra-control",
  ],
  apparatus: [
    "r-gas-path",
    "r-scale",
    "g-apparatus",
    "p-mass-loss",
    "p-stuck",
    "p-water-scale",
    "p-late-start",
    "p-apparatus-written",
    "a-apparatus",
    "b-apparatus",
  ],
  dilution: [
    "r-dilution",
    "r-stock",
    "r-after-acid",
    "r-label",
    "g-dilution",
    "p-stock-sixteen",
    "p-stock-different",
    "p-combined-volume",
    "p-after-acid",
    "p-dilution-written",
    "a-dilution",
    "b-dilution",
    "ra-dilution",
  ],
  endpoint: [
    "r-endpoint",
    "r-proxy",
    "g-endpoint",
    "p-endpoint-interval",
    "p-endpoint-ratio",
    "p-endpoint-proxy",
    "p-sensor-threshold",
    "p-endpoint-written",
    "a-endpoint",
    "b-endpoint",
    "rb-endpoint",
  ],
  plot: [
    "r-anomaly",
    "a-repeats",
    "rb-anomaly",
    "r-axes",
    "r-interval",
    "g-plot",
    "p-mass-interval",
    "p-remaining-mass",
    "p-unequal-times",
    "p-raw-point",
    "p-plot-written",
    "a-plot",
    "b-plot",
    "rb-interval",
  ],
  repeats: [
    "w-mean",
    "r-anomaly",
    "r-precision",
    "g-repeats",
    "p-suspect-mean",
    "p-repeat-range",
    "p-identified-mean",
    "p-systematic",
    "p-reproducibility",
    "p-exclusion-written",
    "a-repeats",
    "b-repeats",
    "ra-evidence",
    "rb-anomaly",
  ],
};
