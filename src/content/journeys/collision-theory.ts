import type { LearningTask } from "../types";
import type { CollisionMode } from "../../lib/collision-theory";
type CollisionTask = Omit<LearningTask, "model"> & {
  model?: {
    kind: "collision-theory";
    mode: CollisionMode;
    record?: string;
    instruction: string;
  };
};
const model = (
  mode: CollisionMode,
  instruction: string,
  record?: string,
): CollisionTask["model"] => ({
  kind: "collision-theory",
  mode,
  instruction,
  record,
});
function n(
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  m?: CollisionTask["model"],
): CollisionTask {
  return {
    id: "ct-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer: String(answer),
    unit,
    tolerance: 1e-10,
    explanation,
    hint,
    model: m,
  };
}
function c(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  m?: CollisionTask["model"],
): CollisionTask {
  const options = [answer, ...Object.keys(errors)],
    offset = [...id].reduce((s, x) => s + x.charCodeAt(0), 0) % options.length;
  return {
    id: "ct-v1-" + id,
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
function w(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): CollisionTask {
  return {
    id: "ct-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    hint: rubric[0],
    rubric,
  };
}
export const collisionWarmup: CollisionTask[] = [
  c(
    "warm-contact",
    "Meet before reacting",
    "Two reacting particles have sufficient energy but do not collide. Can this stated encounter produce the reaction?",
    "No",
    {
      Yes: "Sufficient energy does not remove the need for the reacting particles to collide.",
    },
    "Reacting particles must collide with sufficient energy. Without contact this encounter cannot react.",
    "Separate having energy from meeting the other reactant.",
  ),
  n(
    "warm-density",
    "Count per volume",
    "A schematic contains 12 reacting-particle symbols in 2 equal volume units. What is the reacting-symbol density?",
    6,
    "symbols/unit",
    "12 ÷ 2 = 6 symbols per volume unit. The diagram represents number density; it does not measure moles.",
    "Divide the reacting-symbol count by the occupied volume.",
  ),
];
export const collisionGuided: CollisionTask[] = [
  n(
    "guide-energy",
    "Reach the minimum",
    "Reacting atoms meet. Minimum energy: 30 units. Set collision energy to this minimum. What is the minimum?",
    30,
    "energy units",
    "Activation energy is the minimum energy required for this reaction. At the stated minimum the energy condition is met; this is not the energy released by the reaction.",
    "Match the collision energy to the stated minimum.",
    model(
      "conditions",
      "Change the collision energy and predict whether the energy condition is met.",
      "initial",
    ),
  ),
  n(
    "guide-solution",
    "Increase number density",
    "Change 12 reacting symbols in 2 volume units to 24 symbols in the same 2 units. Temperature stays fixed. What is the new density?",
    12,
    "symbols/unit",
    "24 ÷ 2 = 12 symbols/unit. More reacting particles per unit volume means more frequent collisions in this controlled comparison. Fixed temperature does not increase their average kinetic energy.",
    "Keep the volume denominator unchanged.",
    model(
      "solution",
      "Add reacting symbols without changing occupied volume or temperature.",
    ),
  ),
  n(
    "guide-gas",
    "Compress the same particles",
    "Keep 12 reacting particles and the temperature unchanged. Compress their occupied volume from 4 units to 2. What is the final reacting-symbol density?",
    6,
    "symbols/unit",
    "12 ÷ 2 = 6 symbols/unit, compared with 3 before. Compression increases reacting-particle density and gas pressure at fixed temperature; it does not add particles.",
    "Keep the count fixed and change only occupied volume.",
    model(
      "gas",
      "Compress the occupied volume while conserving reacting particles.",
    ),
  ),
  n(
    "guide-solid",
    "Expose internal faces",
    "Split an ideal 4 mm cube into 8 equal 2 mm cubes. Separate and fully wet every piece. What is the total accessible area?",
    192,
    "mm²",
    "Each 2 mm cube has 6 × 2² = 24 mm² of face area. Eight fully wetted cubes expose 8 × 24 = 192 mm². The total material volume remains 64 mm³.",
    "Count six faces on every separated piece.",
    model(
      "surface",
      "Compare touching and separated pieces; internal touching faces are inaccessible.",
    ),
  ),
  n(
    "guide-endpoint",
    "Same amount, different time",
    "Both trials collect 20 cm³ gas. Trial A takes 25 s and trial B 50 s. What is trial A’s mean rate to this endpoint?",
    0.8,
    "cm³/s",
    "20 ÷ 25 = 0.8 cm³/s. Trial B gives 0.4 cm³/s. For the same endpoint amount, a shorter time corresponds to a greater mean rate.",
    "Divide the stated amount by its matching time.",
    model(
      "comparison",
      "Compare the two measured means to the same amount of product.",
    ),
  ),
  c(
    "guide-evidence",
    "Frequency or energy?",
    "At fixed temperature, a solution has a higher reacting-particle concentration. Which explanation fits?",
    "More frequent collisions",
    {
      "Each particle has more energy":
        "The temperature is fixed; higher concentration does not give each particle more energy.",
      "The activation energy is lower":
        "Changing concentration does not by itself change the reaction pathway or activation energy.",
    },
    "More reactant particles per unit volume increase collision frequency. Fixed temperature leaves the kinetic-energy distribution unchanged.",
    "Identify what concentration changes per unit volume.",
    model(
      "evidence",
      "Select the claim and reason supported by the controlled comparison.",
    ),
  ),
];
export const collisionPractice: CollisionTask[] = [
  c(
    "p-contact",
    "Contact is necessary",
    "Reacting particles have 40 energy units; the minimum is 30. They do not meet. What prevents this encounter reacting?",
    "No collision",
    {
      "Energy below the minimum": "40 is greater than the stated minimum 30.",
      "Too many particles": "No particle-number restriction is stated.",
    },
    "The particles have sufficient energy but do not collide. Contact is a separate necessary condition.",
    "Check contact before comparing energy.",
    model(
      "conditions",
      "Change contact and retain your predicted outcome.",
      "noContact",
    ),
  ),
  c(
    "p-low-energy",
    "Below the minimum",
    "Reacting particles collide with 25 energy units. The minimum required is 30. Is the energy condition met?",
    "No",
    { Yes: "25 is below 30; collision alone is not sufficient." },
    "The collision energy is below the activation minimum. Not every collision produces a reaction.",
    "Compare the supplied energy with the minimum.",
    model("conditions", "Predict below the stated activation minimum."),
  ),
  c(
    "p-threshold",
    "At least the minimum",
    "An atomic encounter has 30 energy units and a minimum of 30. The reacting particles meet. Is the energy condition met?",
    "Yes",
    { No: "The minimum is inclusive: at least 30, not strictly more than 30." },
    "The stated minimum is met exactly. The simplified atomic encounter has no extra molecular-end restriction.",
    "What does minimum mean?",
    model(
      "conditions",
      "Set the collision energy exactly at the minimum.",
      "threshold",
    ),
  ),
  c(
    "p-inert",
    "Reacting partners",
    "A reactant collides with an inert particle with 40 energy units; minimum 30. Does this produce the specified reaction between the reacting partners?",
    "No",
    {
      Yes: "An energetic collision with an inert particle is not an encounter between the specified reacting partners.",
    },
    "The required reacting partner is absent. Count encounters between the reactants, not every encounter with every particle.",
    "Identify the collision partner.",
    model(
      "conditions",
      "Choose the collision partner and predict the stated reaction.",
      "inert",
    ),
  ),
  c(
    "p-orientation",
    "A defined molecular example",
    "For this stated molecular reaction, the reactive ends must meet. The energy minimum is met, but the ends do not meet. What is missing?",
    "Suitable molecular orientation",
    {
      "More concentration":
        "The question concerns one defined encounter, not particles per volume.",
      "A lower temperature":
        "Cooling does not repair the stated orientation condition.",
    },
    "In this particular molecular example the reactive sites must meet. Sufficient energy alone does not meet that condition.",
    "Use the explicitly stated molecular condition.",
    model(
      "conditions",
      "Change molecular orientation without changing energy.",
      "molecular",
    ),
  ),
  c(
    "p-atomic",
    "Read the stated conditions",
    "In a simplified atomic encounter the reacting particles collide with 40 energy units; minimum 30. No molecular-end condition is specified. Is that energy condition met?",
    "Yes",
    {
      "No, atoms must present a named molecular end":
        "Do not add a molecular-end requirement to this explicitly atomic example.",
    },
    "40 exceeds 30. Molecular orientation can matter for molecular reactions, but this atomic example does not have the stated molecular-end condition.",
    "Use this encounter’s givens.",
    model(
      "conditions",
      "Distinguish atomic encounters from the defined molecular example.",
      "atomic",
    ),
  ),
  n(
    "p-density",
    "Use actual volume",
    "A schematic has 18 reacting symbols in 6 equal volume units. What is its density?",
    3,
    "symbols/unit",
    "18 ÷ 6 = 3 symbols/unit. More total particles does not necessarily mean a higher concentration if the occupied volume also increases.",
    "Divide by the full occupied volume.",
    model(
      "solution",
      "Compare more total particles with lower number density.",
      "lessDespiteCount",
    ),
  ),
  c(
    "p-equal-density",
    "Different amounts, same density",
    "Compare 12 reacting symbols in 2 volume units with 24 in 4 units, at the same temperature. Which has the greater reacting-symbol density?",
    "They are equal",
    {
      "The 24-symbol sample":
        "24 is twice 12, but its occupied volume is also twice as large.",
      "The 12-symbol sample": "Both count/volume ratios equal 6.",
    },
    "12/2 = 24/4 = 6 symbols/unit. Concentration depends on count per volume, not count alone.",
    "Calculate both ratios.",
    model("solution", "Make an equal-density comparison.", "equal"),
  ),
  n(
    "p-dilution",
    "Keep count, add volume",
    "Twelve reacting symbols occupy 4 volume units after dilution. What is the final density?",
    3,
    "symbols/unit",
    "12 ÷ 4 = 3 symbols/unit. Adding solvent increases solution volume without adding the reacting solute. Temperature is unchanged in this comparison.",
    "Keep the reacting count unchanged.",
    model(
      "solution",
      "Increase actual solution volume without increasing reacting count.",
      "dilution",
    ),
  ),
  c(
    "p-flask",
    "Capacity is not concentration",
    "The same 50 cm³ solution is transferred into a larger flask, with no liquid added or lost and no temperature change. What happens to its concentration?",
    "It stays the same",
    {
      "It decreases":
        "The actual solution volume has not increased; a larger vessel is not dilution.",
      "It increases":
        "Neither reacting-particle amount nor actual solution volume has changed.",
    },
    "Concentration depends on the amount in the actual solution volume. Flask capacity alone does not change either.",
    "Compare actual solution volumes, not container capacities.",
    model(
      "solution",
      "Distinguish vessel capacity from occupied solution volume.",
      "vessel",
    ),
  ),
  w(
    "p-frequency-explain",
    "Build the causal chain",
    "Explain why a higher reacting-particle concentration usually gives a faster reaction in a controlled comparison at the same temperature.",
    "More reactant particles per unit volume means more frequent collisions between reacting particles. At the same temperature, the fraction with sufficient energy is unchanged, so more successful collisions occur per second.",
    [
      "More reacting particles per unit volume.",
      "More frequent collisions between reacting particles.",
      "More successful collisions per second, without claiming higher particle energy at fixed temperature.",
    ],
  ),
  c(
    "p-exact-factor",
    "Direction is not an exact factor",
    "A concentration doubles at fixed temperature. No measured rates are supplied. Can an exact twofold chemical-rate increase be established from that fact alone?",
    "No",
    {
      Yes: "An expected rate increase does not establish a universal exact multiplier. Exact factors require suitable measured data or a stated relationship.",
    },
    "Higher concentration supports more frequent collisions in the controlled comparison. It does not prove that every chemical reaction has an exactly proportional rate.",
    "Separate an expected direction from an exact relationship.",
  ),
  n(
    "p-compression",
    "Conserve the gas count",
    "At fixed temperature 24 reacting particles are compressed from 4 volume units into 1. What is the final density?",
    24,
    "symbols/unit",
    "24 ÷ 1 = 24 symbols/unit, compared with 6 before. The density factor is 4; this is not an asserted exact chemical-rate factor.",
    "Use the final occupied volume.",
    model(
      "gas",
      "Compress the same count into the stated final volume.",
      "stronger",
    ),
  ),
  c(
    "p-expansion",
    "Expand at fixed temperature",
    "Twelve reacting gas particles expand from 2 to 4 volume units at fixed temperature. What happens to reacting-particle density?",
    "It decreases",
    {
      "It increases":
        "The count is unchanged and the occupied volume increases.",
      "It stays the same": "12/2 = 6 whereas 12/4 = 3.",
    },
    "The same reacting particles occupy more space. Their density and gas pressure decrease at fixed temperature.",
    "Hold the reacting count fixed.",
    model("gas", "Expand and compare count per volume.", "expansion"),
  ),
  c(
    "p-compression-energy",
    "Closer is not hotter",
    "Gas is compressed while its temperature is held constant. What happens to the average kinetic energy of its particles?",
    "It stays the same",
    {
      "It increases":
        "Fixed temperature means unchanged average kinetic energy, even though particles are closer together.",
      "It decreases": "No cooling is stated.",
    },
    "Temperature determines average particle kinetic energy. This fixed-temperature compression changes density and collision frequency, not average kinetic energy.",
    "Use the stated temperature control.",
  ),
  c(
    "p-inert-transfer",
    "Optional transfer: inert addition",
    "At fixed temperature and occupied volume, 12 inert particles are added to 12 reacting particles in 2 volume units. What happens to reacting-particle density?",
    "It stays the same",
    {
      "It doubles":
        "Total particle count increases, but the reacting-particle count remains 12.",
      "It halves": "The occupied volume does not increase.",
    },
    "Reacting-particle density remains 12/2 = 6 symbols/unit. Total pressure can increase when inert particles are added without increasing reacting-particle density. This is an optional transfer beyond the simple compression comparison.",
    "Count the reacting particles separately.",
    model(
      "gas",
      "Compare reacting density with total particle count.",
      "inert",
    ),
  ),
  c(
    "p-mixed-compression",
    "Optional transfer: compress a mixture",
    "A vessel contains reacting and inert particles. Both counts and temperature remain fixed while volume halves. What happens to reacting-particle density?",
    "It doubles",
    {
      "It stays the same because inert gas is present":
        "Inert gas does not prevent the reacting particles occupying half the volume.",
      "It halves": "With fixed count, a smaller denominator increases density.",
    },
    "For the reacting particles, count/volume doubles when volume halves. This density calculation does not assert an exact chemical-rate multiplier.",
    "Keep the reacting count and halve its volume denominator.",
    model("gas", "Compress both conserved particle sets.", "inertCompression"),
  ),
  n(
    "p-eight-area",
    "Count every accessible face",
    "Eight separated ideal cubes each have 2 mm edges. Every face is wetted. What is their total accessible area?",
    192,
    "mm²",
    "8 × 6 × 2² = 192 mm². Counting only one face per cube omits five faces.",
    "Six faces per cube.",
    model("surface", "Separate eight pieces and count all accessible faces."),
  ),
  n(
    "p-fine-area",
    "Many smaller pieces",
    "Sixty-four separated ideal cubes each have 1 mm edges. Every face is wetted. What is their total accessible area?",
    384,
    "mm²",
    "64 × 6 × 1² = 384 mm². Their material volume is 64 × 1³ = 64 mm³, unchanged from the original 4 mm cube.",
    "Multiply piece count by six-face area.",
    model(
      "surface",
      "Compare finer pieces at conserved material volume.",
      "fine",
    ),
  ),
  n(
    "p-joined-area",
    "Touching faces are internal",
    "Eight 2 mm pieces remain touching as a 4 mm cube. The other reactant cannot enter the internal interfaces. What is the accessible area?",
    96,
    "mm²",
    "Only the exterior of the 4 mm cube is accessible: 6 × 4² = 96 mm². The touching interfaces are not exposed under the stated assumption.",
    "Count the exterior of the joined block.",
    model(
      "surface",
      "Keep pieces joined and exclude internal interfaces.",
      "joinedEight",
    ),
  ),
  w(
    "p-volume-explain",
    "More surface, same material",
    "A 4 mm cube is split into 64 separated 1 mm cubes. Explain how accessible area can increase while material volume stays the same.",
    "The pieces have total volume 64 × 1³ = 64 mm³, equal to 4³. Separation exposes faces that were inside the original cube. Area becomes 64 × 6 × 1² = 384 mm² rather than 96 mm²; no new material is created.",
    [
      "Compare original and total piece volume.",
      "Explain newly exposed internal faces.",
      "Distinguish increased area from creating more material.",
    ],
  ),
  n(
    "p-area-volume",
    "Area per material volume",
    "Eight separated 2 mm cubes have total area 192 mm² and volume 64 mm³. Calculate area divided by volume.",
    3,
    "mm⁻¹",
    "192/64 = 3 mm⁻¹. Area/volume has units of inverse length; it is not a chemical-rate factor.",
    "Divide the stated area by the stated volume.",
  ),
  c(
    "p-speed-amount",
    "Speed versus final amount",
    "Equal masses of the same solid react completely with the same excess acid at the same temperature. One sample is finely divided and fully wetted. Which comparison is supported?",
    "Faster reaction; same available final product",
    {
      "Faster reaction; more final product":
        "Fragmenting the same material does not create more reacting substance.",
      "Slower reaction; same final product":
        "More accessible surface gives more reacting encounters in this controlled comparison.",
    },
    "Smaller fully wetted pieces expose more area and increase collision opportunities. With the same reactant amounts and complete reaction, the available final product is unchanged.",
    "Separate how quickly from how much.",
  ),
  w(
    "p-fair-test",
    "Control the comparison",
    "Describe controls for comparing the reaction rate of large and small pieces of the same solid with acid.",
    "Keep solid mass and identity, acid concentration and volume, and temperature the same. Change piece size/accessibility and measure a consistent reaction endpoint or rate.",
    [
      "Same mass and identity of solid.",
      "Same acid concentration and volume; same temperature.",
      "Change piece size/surface area and use a consistent rate measure.",
    ],
  ),
  n(
    "p-rate",
    "Match amount and time",
    "A trial collects 30 cm³ gas in 40 s. What is its mean rate?",
    0.75,
    "cm³/s",
    "30/40 = 0.75 cm³/s.1/40 has units s⁻¹ and is not this gas-volume rate.",
    "Amount divided by time.",
  ),
  c(
    "p-shorter",
    "Read an increase in time",
    "Two trials collect the same 20 cm³ endpoint. One takes 40 s; the other 25 s. Which has the greater mean rate?",
    "The 25 s trial",
    {
      "The 40 s trial":
        "For the same amount, a longer time means a smaller mean rate.",
    },
    "20/25 = 0.8 cm³/s and 20/40 = 0.5 cm³/s. The shorter-time trial has the greater mean rate.",
    "The endpoint amount is identical.",
  ),
  c(
    "p-different-endpoint",
    "Different amounts need rates",
    "Trial A collects 20 cm³ in 20 s. Trial B collects 40 cm³ in 30 s. Which has the greater measured mean rate over its stated interval?",
    "Trial B",
    {
      TrialA:
        "Compare amount/time: 1 versus 4/3 cm³/s; shorter time alone is insufficient when amounts differ.",
      "They are equal": "The two amount/time ratios differ.",
    },
    "Trial A gives 1 cm³/s; trial B gives 4/3 cm³/s. Because endpoints differ, compare calculated means rather than times alone.",
    "Calculate both amount/time ratios.",
    model(
      "comparison",
      "Use both stated amounts and times.",
      "differentAmount",
    ),
  ),
  w(
    "p-data-limit",
    "What does a pair prove?",
    "Constructed data show concentration 1, 2, 3 units with initial rates 0.4, 0.8, 1.1 cm³/s. Explain whether these data prove rate is always exactly proportional to concentration.",
    "No. Rate doubles from 0.4 to 0.8 when concentration doubles from 1 to 2, but at concentration 3 a proportional relationship would give 1.2, not the stated 1.1. A single matching pair does not prove a universal law.",
    [
      "Compare the first pair correctly.",
      "Test the proposed relationship against the third point.",
      "Limit the conclusion to the supplied evidence.",
    ],
  ),
  c(
    "p-depletion",
    "Why a batch slows",
    "Temperature and volume remain constant while dissolved reactant is used up. Which explains a decreasing rate?",
    "Fewer reacting particles per unit volume",
    {
      "Each remaining particle becomes smaller":
        "Reactant particles do not shrink as concentration falls.",
      "The temperature must fall": "Temperature is explicitly held constant.",
    },
    "Consumption decreases reacting-particle concentration and collision frequency. The comparison does not require cooling.",
    "Track the reacting count in the fixed volume.",
    model("evidence", "Choose the depletion explanation.", "depletion"),
  ),
  c(
    "p-cooling",
    "Density or energy?",
    "A sample is cooled without changing particle count or occupied volume. Which explanation fits a slower reaction?",
    "Slower particles and fewer sufficiently energetic collisions",
    {
      "Fewer particles per unit volume":
        "Count and occupied volume are unchanged, so number density is unchanged.",
      "Higher activation energy caused by dilution":
        "Neither dilution nor a changed reaction pathway is stated.",
    },
    "Cooling reduces average speed and the fraction able to meet the activation minimum. It does not reduce number density in this stated fixed-count/volume comparison.",
    "Identify what temperature changes.",
    model(
      "evidence",
      "Distinguish cooling from concentration change.",
      "cooling",
    ),
  ),
  c(
    "p-area-barrier",
    "Area is not a lower barrier",
    "The same solid is crushed at fixed temperature. Does crushing alone lower the reaction’s activation energy?",
    "No",
    {
      Yes: "Crushing exposes more surface; it does not by itself provide an alternative lower-energy reaction pathway.",
    },
    "Greater accessible area gives more reacting encounters. Activation energy belongs to the reaction pathway and is not lowered merely by fragmenting the solid.",
    "Distinguish contact opportunities from the activation barrier.",
  ),
  w(
    "p-final-gas",
    "Critique a final-product claim",
    "The same solid mass reacts completely with the same excess acid. A student claims that making four times as much accessible surface must give four times as much final gas. Explain the error.",
    "More accessible surface changes reaction speed, not the amount of reacting substance. With the same reactant amounts and complete reaction, the available total gas is unchanged. No exact fourfold rate is established either.",
    [
      "Same solid mass means no new reacting material.",
      "Distinguish rate from final product amount.",
      "Do not assert an exact rate multiplier from surface area alone.",
    ],
  ),
];
export const collisionCheckForms: CollisionTask[][] = [
  [
    c(
      "check-a-energy",
      "A new atomic encounter",
      "Reacting atoms collide with 38 energy units; the stated minimum is 35. Is the energy condition met?",
      "Yes",
      {
        No: "38 is above 35.",
        "Only if 38 is the energy released":
          "Activation energy is the minimum required, not the energy released.",
      },
      "The reacting particles meet with energy above the stated minimum. This atomic encounter has no additional molecular-end condition.",
      "Compare the energy with the stated minimum.",
    ),
    n(
      "check-a-density",
      "Reserved density",
      "Eighteen reacting symbols occupy 3 equal volume units. Calculate the reacting-symbol density.",
      6,
      "symbols/unit",
      "18/3 = 6 symbols per occupied volume unit.",
      "Use reacting count divided by volume.",
    ),
    c(
      "check-a-compress",
      "Reserved compression",
      "At fixed temperature, 18 reacting gas particles are compressed from 6 volume units to 3. Which statement is supported?",
      "Reacting density doubles; average kinetic energy is unchanged",
      {
        "Density and average kinetic energy both double":
          "Temperature is fixed, so average kinetic energy is unchanged.",
        "Density stays the same; particles shrink":
          "The count stays fixed while volume halves; the particles do not shrink.",
      },
      "Density changes from 18/6 = 3 to 18/3 = 6. Fixed temperature leaves average kinetic energy unchanged. No exact chemical-rate factor is established.",
      "Track count/volume and temperature separately.",
    ),
    n(
      "check-a-area",
      "Reserved accessible area",
      "An ideal 6 mm cube is divided into 27 separate 2 mm cubes. Every face is wetted. Calculate their total accessible area.",
      648,
      "mm²",
      "27 × 6 × 2² = 648 mm². Material volume remains 27 × 2³ = 216 mm³ = 6³.",
      "Each cube contributes six faces.",
    ),
    w(
      "check-a-explain",
      "Reserved solid explanation",
      "Equal masses of the same solid, as powder and large chips, react completely with equal excess acid at the same temperature. Explain the expected comparison of rate and final available gas.",
      "Fully wetted powder has greater accessible surface area, allowing more collisions with acid per second and a faster reaction. The same reactant amounts give the same available final gas on complete reaction.",
      [
        "Greater accessible surface area in the powder.",
        "More reacting collisions per second and faster reaction.",
        "Same available final product from the same reactant amounts.",
      ],
    ),
  ],
  [
    c(
      "check-b-energy",
      "Another energy condition",
      "Reacting particles collide with 32 energy units. The minimum required is 35. Is the energy condition met?",
      "No",
      { Yes: "32 is below 35. A collision is necessary but not sufficient." },
      "The collision has less energy than the stated minimum.",
      "Compare 32 with 35.",
    ),
    c(
      "check-b-density",
      "Count alone can mislead",
      "SampleA has 30 reacting symbols in 6 volume units. SampleB has 20 symbols in 2 units. Which has the greater reacting-symbol density?",
      "SampleB",
      {
        SampleA:
          "30 is a larger total count, but 30/6 = 5 is less than 20/2 = 10.",
        "They are equal": "The ratios are 5 and 10, not equal.",
      },
      "SampleB has 10 symbols/unit, compared with 5 for sampleA. A smaller total count can have a higher density.",
      "Calculate both count/volume ratios.",
    ),
    c(
      "check-b-capacity",
      "Reserved vessel comparison",
      "The same 75 cm³ solution is transferred to a vessel with greater capacity. No liquid is added or lost and temperature is unchanged. What happens to concentration?",
      "It is unchanged",
      {
        "It decreases": "Actual solution volume is still 75 cm³.",
        "It increases":
          "The reacting-particle count and actual solution volume both stay unchanged.",
      },
      "Container capacity does not determine concentration. The amount and actual solution volume have not changed.",
      "Use actual occupied solution volume.",
    ),
    n(
      "check-b-rate",
      "Reserved same endpoint",
      "A trial collects 15 cm³ gas in 30 s. Calculate its mean gas-volume rate to that endpoint.",
      0.5,
      "cm³/s",
      "15/30 = 0.5 cm³/s.",
      "Divide gas volume by time.",
    ),
    w(
      "check-b-explain",
      "Reserved evidence limit",
      "Explain what can and cannot be concluded when concentration doubles at fixed temperature but no measured reaction rates are supplied.",
      "More reacting particles per unit volume support more frequent collisions and an expected faster reaction under the controlled comparison. Fixed temperature does not give particles more average energy. An exact twofold chemical-rate increase is not established without suitable data or a stated relationship.",
      [
        "More reacting particles per unit volume and more frequent collisions.",
        "Fixed temperature means no increase in average kinetic energy.",
        "No universal exact rate multiplier follows from concentration alone.",
      ],
    ),
  ],
];
export const collisionReviewForms: CollisionTask[][] = [
  [
    n(
      "review-a-density",
      "Later density retrieval",
      "Twenty-one reacting symbols occupy 3 equal volume units. What is the density?",
      7,
      "symbols/unit",
      "21/3 = 7 symbols/unit.",
      "Count divided by occupied volume.",
    ),
    n(
      "review-a-area",
      "Later surface retrieval",
      "An ideal 3 mm cube is split into 27 separated 1 mm cubes. All faces are wetted. What is their total accessible area?",
      162,
      "mm²",
      "27 × 6 × 1² = 162 mm². Volume remains 27 mm³.",
      "Count six faces per piece.",
    ),
    w(
      "review-a-explain",
      "Later compression reasoning",
      "Explain why compressing a fixed number of gas particles at constant temperature differs from heating them.",
      "Fixed-temperature compression increases number density and collision frequency without increasing average kinetic energy. Heating raises average kinetic energy and increases the fraction with sufficient energy; it is a different change.",
      [
        "Compression changes count per volume.",
        "At fixed temperature average kinetic energy is unchanged.",
        "Heating changes speed and the fraction able to meet the activation minimum.",
      ],
    ),
  ],
  [
    n(
      "review-b-rate",
      "Later endpoint retrieval",
      "A trial collects 24 cm³ gas in 80 s. What is its mean rate?",
      0.3,
      "cm³/s",
      "24/80 = 0.3 cm³/s.",
      "Use the matching volume and time.",
    ),
    c(
      "review-b-density",
      "Later equal-count comparison",
      "Two samples each have 16 reacting symbols. One occupies 2 volume units and the other 4, at the same temperature. Which statement fits?",
      "The 2-unit sample has twice the density; average kinetic energy is unchanged",
      {
        "The 2-unit sample has twice the particle energy":
          "The temperatures are the same.",
        "Both have the same density because counts match":
          "The occupied volumes differ; densities are 8 and 4.",
      },
      "16/2 = 8 whereas 16/4 = 4 symbols/unit. Temperature, not number density, determines average kinetic energy.",
      "Calculate both ratios and check the temperature control.",
    ),
    w(
      "review-b-explain",
      "Later accessible-face reasoning",
      "Explain why internal faces of pieces that remain touching are excluded from accessible surface area when the other reactant cannot enter those interfaces.",
      "Those internal faces do not contact the other reactant. Only exterior exposed faces contribute to accessible area under the stated assumption. Separating and wetting the pieces can expose the interfaces without creating more material.",
      [
        "Internal touching faces cannot contact the other reactant.",
        "Only exposed exterior faces count in the joined state.",
        "Separation exposes area without adding material.",
      ],
    ),
  ],
];
export const collisionRefreshers: CollisionTask[] = [
  c(
    "refresh-contact",
    "Contact and partner",
    "Which encounter can meet the basic contact condition for the specified reaction?",
    "Two reacting partners collide",
    {
      "They have energy but do not meet":
        "Energy does not remove the need for a collision.",
      "A reactant hits an inert particle":
        "The required reacting partner is absent.",
    },
    "The reacting partners must collide; sufficient energy is a further condition.",
    "Identify who meets whom.",
  ),
  c(
    "refresh-energy",
    "Read a minimum",
    "The minimum required energy is 30 units. Which supplied energy meets that minimum?",
    "30 units",
    {
      "29 units": "29 is below the minimum.",
      "No value can meet a minimum exactly": "At least 30 includes 30.",
    },
    "Activation energy is a minimum required for reaction, not the energy released.",
    "Read minimum as at least.",
  ),
  c(
    "refresh-molecular",
    "Use the stated encounter",
    "A particular molecular reaction requires its reactive sites to meet. What condition does this describe?",
    "Suitable molecular orientation",
    {
      "Every atom must have a named molecular end":
        "The condition concerns this molecular example, not a universal atomic end.",
    },
    "Molecular orientation can affect whether the reactive sites meet. Use it where the molecular condition is stated.",
    "Identify the reactive sites in the example.",
  ),
  n(
    "refresh-density",
    "Restore the denominator",
    "Ten reacting symbols occupy 2 units. What is the density?",
    5,
    "symbols/unit",
    "10/2 = 5 symbols/unit.",
    "Use actual occupied volume.",
  ),
  c(
    "refresh-volume",
    "Use actual solution volume",
    "A larger flask holds the same unchanged solution. Has the actual solution volume necessarily increased?",
    "No",
    {
      Yes: "Vessel capacity and actual liquid volume are different quantities.",
    },
    "Without adding or removing solution, its actual volume is unchanged.",
    "What liquid was added or removed?",
  ),
  c(
    "refresh-frequency",
    "Fixed temperature",
    "At fixed temperature, more reactant particles per volume principally gives which change in this controlled comparison?",
    "More frequent collisions",
    {
      "More energy per particle": "Temperature has not increased.",
      "A lower activation minimum": "No changed pathway is stated.",
    },
    "Concentration changes collision opportunities per volume. Temperature governs average kinetic energy.",
    "Separate density from energy.",
  ),
  c(
    "refresh-exact-rate",
    "Do not invent a factor",
    "Does an expected rate increase establish an exact numerical rate multiplier?",
    "No",
    {
      Yes: "A direction does not establish an exact relationship; use supplied data or a stated relationship.",
    },
    "Collision theory explains the expected direction under controlled conditions, but does not provide a universal exact multiplier.",
    "Ask what quantitative evidence is supplied.",
  ),
  n(
    "refresh-gas",
    "Conserve count",
    "Twelve reacting gas particles occupy 3 units. What is their number density?",
    4,
    "symbols/unit",
    "12/3 = 4 symbols/unit. Compression changes volume, not the conserved count.",
    "Reacting count divided by occupied volume.",
  ),
  c(
    "refresh-inert",
    "Optional reacting count",
    "Ten reacting and ten inert symbols share the same volume. How many reacting symbols enter the reacting-density numerator?",
    "10",
    { "20": "Twenty is the total count; ten are inert." },
    "Reacting number density uses the reacting count, while total particle density includes the inert particles too.",
    "Count species separately.",
  ),
  n(
    "refresh-face",
    "One cube first",
    "An ideal 2 mm cube has six accessible faces. What is its area?",
    24,
    "mm²",
    "6 × 2² = 24 mm². Its volume is 8 mm³, a different quantity.",
    "Six faces, each edge squared.",
  ),
  c(
    "refresh-joined",
    "Accessible interfaces",
    "The other reactant cannot enter an interface between touching solid pieces. Is that interface accessible in this stated model?",
    "No",
    {
      Yes: "A face contributes to accessible area only if it contacts the other reactant.",
    },
    "Count exposed faces, not blocked touching interfaces.",
    "Can the other reactant reach that face?",
  ),
  c(
    "refresh-material",
    "Same material",
    "Does splitting the same solid into smaller pieces create more reacting material?",
    "No",
    {
      Yes: "Splitting conserves the amount of material; it can expose more surface.",
    },
    "More area is distinct from more substance.",
    "Track the original material amount.",
  ),
  n(
    "refresh-area-volume",
    "Keep dimensions distinct",
    "Accessible area is 120 mm²; volume is 40 mm³. Calculate area divided by volume.",
    3,
    "mm⁻¹",
    "120/40 = 3 mm⁻¹. The quotient is inverse length, not a measured chemical rate.",
    "Divide area by volume and retain units.",
  ),
  n(
    "refresh-rate",
    "Amount per time",
    "Ten cm³ gas are collected in 20 s. Calculate mean rate.",
    0.5,
    "cm³/s",
    "10/20 = 0.5 cm³/s.",
    "Use amount/time.",
  ),
  c(
    "refresh-endpoint",
    "Compare matching endpoints",
    "Two trials reach the same gas amount. Which is faster on average to that endpoint?",
    "The shorter-time trial",
    {
      "The longer-time trial":
        "For the same amount, more time gives a smaller amount/time rate.",
    },
    "A shorter time to the same amount corresponds to a larger mean rate. When amounts differ, calculate both rates.",
    "Check the endpoint amounts match.",
  ),
  c(
    "refresh-cooling",
    "Temperature versus density",
    "Count and occupied volume stay unchanged while a sample cools. Does its number density decrease?",
    "No",
    {
      Yes: "Count/volume is unchanged. Cooling changes speed and energetic fraction instead.",
    },
    "Number density is unchanged in this comparison. Lower temperature reduces average speed and the fraction with sufficient energy.",
    "Compare count/volume before and after.",
  ),
];
const recovery: Record<string, string> = {
  "p-contact": "refresh-contact",
  "p-low-energy": "refresh-energy",
  "p-threshold": "refresh-energy",
  "p-inert": "refresh-contact",
  "p-orientation": "refresh-molecular",
  "p-atomic": "refresh-molecular",
  "p-density": "refresh-density",
  "p-equal-density": "refresh-density",
  "p-dilution": "refresh-density",
  "p-flask": "refresh-volume",
  "p-frequency-explain": "refresh-frequency",
  "p-exact-factor": "refresh-exact-rate",
  "p-compression": "refresh-gas",
  "p-expansion": "refresh-gas",
  "p-compression-energy": "refresh-frequency",
  "p-inert-transfer": "refresh-inert",
  "p-mixed-compression": "refresh-gas",
  "p-eight-area": "refresh-face",
  "p-fine-area": "refresh-face",
  "p-joined-area": "refresh-joined",
  "p-volume-explain": "refresh-material",
  "p-area-volume": "refresh-area-volume",
  "p-speed-amount": "refresh-material",
  "p-fair-test": "refresh-material",
  "p-rate": "refresh-rate",
  "p-shorter": "refresh-endpoint",
  "p-different-endpoint": "refresh-endpoint",
  "p-data-limit": "refresh-exact-rate",
  "p-depletion": "refresh-density",
  "p-cooling": "refresh-cooling",
  "p-area-barrier": "refresh-frequency",
  "p-final-gas": "refresh-material",
};
for (const q of collisionPractice) {
  const target = recovery[q.id.slice(6)];
  if (!target) throw Error("Missing individual recovery task.");
  q.followUp = "ct-v1-" + target;
}
collisionGuided[0].openingHint = true;
export const collisionJourney = {
  version: 1 as const,
  introduction:
    "Make a prediction about collisions, then separate changes in reacting-particle density, accessible surface and particle energy.",
  scopeNote:
    "AQA Foundation/common collision theory, reacting-particle concentration, fixed-temperature gas compression and accessible solid surface, with controlled comparisons and amount/time transfer. Detailed temperature distributions and catalysis are taught in the next lesson. Molecular orientation is used only in explicitly stated molecular examples. Inert-gas addition is optional transfer. Symbols and ideal cubes are schematic; models do not measure chemical rates. Written explanations are self-reviewed, not automatically examiner-marked.",
  outcomes: [
    "Identify reacting collisions with sufficient energy and explain activation energy as a minimum.",
    "Use reacting particles per actual occupied volume, distinguishing flask capacity and total particle count.",
    "Explain fixed-temperature gas compression without claiming greater particle energy.",
    "Compare accessible faces of joined and separated solid pieces at conserved material amount.",
    "Separate reaction speed, final available product and exact quantitative evidence.",
  ],
  warmup: collisionWarmup,
  refresher: collisionRefreshers,
  guided: collisionGuided,
  practice: collisionPractice,
  checkForms: collisionCheckForms,
  reviewForms: collisionReviewForms,
};
export const collisionAllTasks = [
  ...collisionWarmup,
  ...collisionRefreshers,
  ...collisionGuided,
  ...collisionPractice,
  ...collisionCheckForms.flat(),
  ...collisionReviewForms.flat(),
];
const families: Record<string, string[]> = {
  conditions: [
    "warm-contact",
    "guide-energy",
    "refresh-contact",
    "refresh-energy",
    "refresh-molecular",
    "p-contact",
    "p-low-energy",
    "p-threshold",
    "p-inert",
    "p-orientation",
    "p-atomic",
    "check-a-energy",
    "check-b-energy",
  ],
  density: [
    "warm-density",
    "guide-solution",
    "refresh-density",
    "refresh-volume",
    "refresh-frequency",
    "p-density",
    "p-equal-density",
    "p-dilution",
    "p-flask",
    "p-frequency-explain",
    "p-depletion",
    "check-a-density",
    "check-b-density",
    "check-b-capacity",
    "review-a-density",
    "review-b-density",
  ],
  gas: [
    "guide-gas",
    "refresh-gas",
    "refresh-inert",
    "refresh-frequency",
    "p-compression",
    "p-expansion",
    "p-compression-energy",
    "p-inert-transfer",
    "p-mixed-compression",
    "check-a-compress",
    "review-a-explain",
  ],
  surface: [
    "guide-solid",
    "refresh-face",
    "refresh-joined",
    "refresh-material",
    "refresh-area-volume",
    "p-eight-area",
    "p-fine-area",
    "p-joined-area",
    "p-volume-explain",
    "p-area-volume",
    "p-speed-amount",
    "p-fair-test",
    "p-area-barrier",
    "p-final-gas",
    "check-a-area",
    "check-a-explain",
    "review-a-area",
    "review-b-explain",
  ],
  endpoint: [
    "guide-endpoint",
    "refresh-rate",
    "refresh-endpoint",
    "p-rate",
    "p-shorter",
    "p-different-endpoint",
    "check-b-rate",
    "review-b-rate",
  ],
  evidence: [
    "guide-evidence",
    "refresh-frequency",
    "refresh-exact-rate",
    "refresh-material",
    "refresh-joined",
    "refresh-density",
    "refresh-cooling",
    "p-frequency-explain",
    "p-exact-factor",
    "p-speed-amount",
    "p-data-limit",
    "p-depletion",
    "p-cooling",
    "p-area-barrier",
    "p-final-gas",
    "check-b-explain",
    "review-a-explain",
    "review-b-explain",
  ],
};
for (const members of Object.values(families)) {
  const ids = members.map((id) => "ct-v1-" + id);
  for (const q of collisionAllTasks)
    if (ids.includes(q.id))
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...ids.filter((id) => id !== q.id),
        ]),
      ];
}
