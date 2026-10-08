import type { ThermalMode } from "../../lib/temperature-catalysts";
import type { LearningTask, LessonJourney } from "../types";
type Task = LearningTask;
const m = (
  mode: ThermalMode,
  instruction: string,
  record = "initial",
): Task["model"] => ({
  kind: "temperature-catalysts",
  mode,
  record,
  instruction,
});
function n(
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  model?: Task["model"],
): Task {
  return {
    id: "tc-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer: String(answer),
    unit,
    tolerance: 1e-8,
    explanation,
    hint,
    model,
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
  model?: Task["model"],
): Task {
  const options = [answer, ...Object.keys(errors)],
    offset = [...id].reduce((s, x) => s + x.charCodeAt(0), 0) % options.length;
  return {
    id: "tc-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    model,
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
    id: "tc-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    hint: rubric[0],
    rubric,
  };
}
function d(
  id: string,
  title: string,
  prompt: string,
  reactant: number,
  product: number,
  peak: number,
): Task {
  return {
    id: "tc-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer: JSON.stringify({
      reactant: String(reactant),
      product: String(product),
      peak: String(peak),
      activationArrow: "reactants-peak",
      overallArrow: "reactants-products",
    }),
    explanation: `Reactant level ${reactant} kJ, product level ${product} kJ, peak ${peak} kJ. Forward activation energy ${peak - reactant} kJ; overall change ${product - reactant} kJ.`,
    hint: "Keep the endpoint levels; build peak = reactants + activation energy.",
    profileDrawing: true,
  };
}
export const warmup: Task[] = [
  c(
    "w-contact",
    "Recall an energetic collision",
    "For a reaction to occur, reacting particles must collide and…",
    "Have sufficient energy",
    {
      "All have identical energies":
        "Particles at one temperature have different energies.",
      "Release energy in every collision":
        "Collisions can fail to produce a reaction; having sufficient energy is a condition for reaction.",
    },
    "Collision contact and sufficient energy are both needed.",
    "Recall the energy minimum.",
  ),
  n(
    "w-barrier",
    "Measure from reactants",
    "Reactants are at 30 kJ and the peak at 80 kJ for a stated reaction amount. What is the forward activation energy?",
    50,
    "kJ",
    "80 − 30 = 50 kJ. Activation energy is measured from the reactant level.",
    "Subtract reactants from peak.",
  ),
];
export const guided: Task[] = [
  n(
    "g-heat",
    "Heat without moving the barrier",
    "Select the warmer supplied snapshot. The minimum is 30 illustrative units. How many of its 12 encounters meet the energy condition?",
    7,
    "encounters",
    "The warmer energies at least 30 are 30, 34, 38, 42, 46, 50 and 60: seven encounters. Heating changes particle energies, not the unchanged pathway barrier.",
    "Include an energy exactly equal to the minimum.",
    m(
      "heating",
      "Choose Warmer, count adequate encounters and predict what stays fixed.",
    ),
  ),
  n(
    "g-catalyst",
    "Lower the minimum without heating",
    "Select the catalysed pathway. The same encounter energies are retained; its minimum is 18 illustrative units. How many of the 12 encounters meet it?",
    6,
    "encounters",
    "18, 20, 22, 26, 30 and 40 meet the lower minimum. Their energies have not increased; the pathway has changed.",
    "Hold the energy dots fixed and move the minimum.",
    m(
      "threshold",
      "Select Catalysed; compare the minimum while retaining the same energy sample.",
    ),
  ),
  n(
    "g-profile",
    "Build a lower peak",
    "Reactants are at 40 kJ and products at 10 kJ. Construct a catalysed pathway with forward activation energy 25 kJ. What is its peak?",
    65,
    "kJ",
    "40 + 25 = 65 kJ. The overall change stays 10 − 40 = −30 kJ; the catalyst does not change the endpoints.",
    "Add activation energy to the reactant level.",
    m(
      "profile",
      "Set the proposed peak, then predict activation energy and signed overall change.",
    ),
  ),
  c(
    "g-identify",
    "Use all the observations",
    "Additive X speeds a matched reaction, is recovered with the same chemical identity and dry mass, and does not change the products. Which classification fits?",
    "Supports catalyst identification",
    {
      "It must be a consumed reactant":
        "The supplied observation says it is regenerated chemically unchanged overall.",
      "The unchanged mass alone proves catalysis":
        "Mass alone is insufficient; rate, chemical identity and controls also matter.",
    },
    "The controlled rate increase and recovery of the same material support identifying X as a catalyst. It may participate during the reaction.",
    "Use rate, identity and controls together.",
    m(
      "identification",
      "Classify the supplied observations and select the supporting reason.",
    ),
  ),
  n(
    "g-rate",
    "Separate speed from final amount",
    "The catalysed trial collects 24 cm³ in 30 s. What is its mean rate to that endpoint?",
    0.8,
    "cm³/s",
    "24 ÷ 30 = 0.8 cm³/s. Both stated complete reactions finally give 48 cm³; faster collection does not create extra available product.",
    "Amount collected divided by time.",
    m(
      "comparison",
      "Calculate both measured means and compare the final amounts separately.",
    ),
  ),
  c(
    "g-evidence",
    "Explain the pathway",
    "At unchanged temperature a catalyst is added. Which claim is supported?",
    "A different pathway lowers activation energy",
    {
      "Every particle gains kinetic energy":
        "At fixed temperature the energy distribution stays unchanged.",
      "The final reactant-limited product amount doubles":
        "The same reactant amounts and overall products limit the final amount.",
    },
    "A catalyst provides another pathway with a lower activation energy. More encounters can meet the energy condition without heating.",
    "Distinguish the barrier from particle energies.",
    m(
      "evidence",
      "Select the supported claim and the reason at fixed temperature.",
    ),
  ),
];
export const practice: Task[] = [
  c(
    "p-heat-frequency",
    "Explain heating",
    "The same uncatalysed reaction is warmed with reactant concentrations controlled. What happens to particle motion and expected collision frequency?",
    "Faster average motion and more frequent collisions",
    {
      "Slower motion and more frequent collisions":
        "Higher temperature raises average kinetic energy.",
      "Faster motion but the barrier must fall":
        "Heating does not lower the activation energy of the unchanged pathway.",
    },
    "Higher temperature increases average kinetic energy and particle speed, so expected collision frequency increases. It also increases the sufficiently energetic fraction.",
    "Separate motion from pathway.",
    m("heating", "Compare cooler and warmer snapshots."),
  ),
  c(
    "p-not-all",
    "Avoid “every particle”",
    "Why is “all particles have the same energy at one temperature” wrong?",
    "Particle energies vary around an average",
    {
      "Temperature makes all energies identical":
        "Temperature characterises average kinetic energy, not identical individual energies.",
      "Particles have no energy until a catalyst is added":
        "Particles already have kinetic energy.",
    },
    "Particles at one temperature have a range of energies. Heating increases average kinetic energy and the fraction able to overcome the barrier.",
    "An average does not mean every value is equal.",
    m("heating", "Inspect the different dot positions."),
  ),
  n(
    "p-high-count",
    "Count a warmer sample",
    "In the high-barrier comparison, the warmer energies are 10, 15, 25, 30, 40, 45, 50, 60, 65, 70, 80 and 90 units. The minimum is 60. How many meet it?",
    5,
    "encounters",
    "60, 65, 70, 80 and 90 meet the minimum: five. The other encounters fall below it.",
    "Include equality at 60.",
    m(
      "heating",
      "Select the warmer snapshot and count energies at least 60.",
      "highBarrier",
    ),
  ),
  n(
    "p-fraction",
    "Convert the stated sample fraction",
    "A constructed sample has 5 adequate encounters out of 20. What percentage meets the stated energy condition?",
    25,
    "%",
    "5 ÷ 20 × 100 = 25%. This is the fraction of this supplied sample, not a measured universal reaction yield.",
    "Use adequate encounters divided by total encounters.",
  ),
  c(
    "p-cooling",
    "Explain cooling",
    "At fixed count and occupied volume, cooling an ordinary reaction usually slows it because…",
    "Average motion is slower and fewer collisions have sufficient energy",
    {
      "There must be fewer particles per unit volume":
        "Count and occupied volume were held fixed.",
      "Activation energy must increase":
        "Cooling changes particle energies, not the pathway barrier.",
    },
    "Cooling lowers average particle kinetic energy and speed; collisions are less frequent and a smaller fraction have sufficient energy.",
    "The particle count and volume are controlled.",
    m("heating", "Compare the cooler and warmer states."),
  ),
  w(
    "p-heat-written",
    "Write the full heating explanation",
    "Explain why warming the same reacting mixture usually increases its rate. Distinguish frequency from sufficiently energetic collisions.",
    "Particles have more kinetic energy and move faster on average, giving more frequent collisions. A larger fraction of collisions has energy at least the activation energy, so successful collisions occur more often. Heating does not lower the activation energy of the unchanged pathway.",
    [
      "State greater average kinetic energy/faster average motion.",
      "Connect motion with more frequent collisions.",
      "State a larger fraction of sufficiently energetic collisions.",
      "Do not say the pathway barrier is lowered by heating.",
    ],
  ),
  c(
    "p-fixed-temperature",
    "Keep kinetic energy fixed",
    "A catalyst is added without changing temperature. What happens to average particle kinetic energy?",
    "It stays unchanged",
    {
      "It must increase":
        "A catalyst changes the pathway, not the thermal energy distribution.",
      "It must become zero":
        "Particles retain motion at the stated temperature.",
    },
    "At unchanged temperature the average kinetic energy is unchanged. The catalysed pathway has a lower activation energy.",
    "Which condition controls average kinetic energy?",
    m("threshold", "Change pathway while retaining the dot positions."),
  ),
  n(
    "p-threshold-equality",
    "Count the new minimum",
    "Energies are 5, 10, 15, 20, 25, 30, 35 and 40 units. A catalyst changes the minimum from 35 to 20. How many meet the catalysed minimum?",
    5,
    "encounters",
    "20, 25, 30, 35 and 40 meet the catalysed minimum, giving five. Energy exactly 20 is included.",
    "Use at least, not greater than.",
    m(
      "threshold",
      "Select the catalysed pathway at the same temperature.",
      "equality",
    ),
  ),
  c(
    "p-no-proof-zero",
    "Interpret a finite snapshot",
    "No dot in a small constructed energy sample meets either minimum. What can this show?",
    "Only that this finite sample contains no adequate encounter",
    {
      "The real reaction can never occur":
        "A finite illustrative sample does not establish the whole real energy distribution.",
      "The catalyst must raise the barrier":
        "The supplied catalyst still lowers the barrier.",
    },
    "The snapshot is a teaching sample, not exhaustive evidence about a real reaction or its exact rate.",
    "Do not infer a universal rate from a few illustrative dots.",
    m(
      "threshold",
      "Compare both minima for the same small sample.",
      "noneEither",
    ),
  ),
  c(
    "p-energy-condition",
    "Avoid guaranteed reactions",
    "A supplied encounter meets the energy minimum. Which conclusion is justified?",
    "It meets the energy condition; other reaction requirements still matter",
    {
      "Every real collision must make product":
        "Reacting partners/contact and, where relevant, orientation still matter.",
      "It has no activation energy":
        "The minimum requirement remains; the encounter meets it.",
    },
    "Sufficient energy is one necessary condition. Meeting it alone does not guarantee every real encounter produces the required product.",
    "Recall the earlier collision conditions.",
    m(
      "threshold",
      "Compare the same adequate energies without inventing a guaranteed rate.",
      "all",
    ),
  ),
  w(
    "p-catalyst-written",
    "Explain catalytic action",
    "Explain how a catalyst increases the rate at unchanged temperature. Do not answer only “it speeds it up”.",
    "The catalyst provides an alternative reaction pathway with a lower activation energy. A greater fraction of encounters can have sufficient energy for reaction at the same temperature, so successful reactions occur more frequently.",
    [
      "Name an alternative or different reaction pathway.",
      "State that this pathway has lower activation energy.",
      "Connect it with more sufficiently energetic encounters at unchanged temperature.",
      "Do not claim every particle is heated by the catalyst.",
    ],
  ),
  n(
    "p-peak-offset",
    "Construct above a nonzero reference",
    "Reactants are at 140 kJ and catalysed forward activation energy is 25 kJ. What is the catalysed peak?",
    165,
    "kJ",
    "140 + 25 = 165 kJ. A changed energy reference does not alter the activation-energy difference.",
    "The peak is not 25 above zero.",
    m(
      "profile",
      "Construct the peak from the shifted reactant level.",
      "offset",
    ),
  ),
  n(
    "p-ea-original",
    "Read the original barrier",
    "Reactants are at 20 kJ and the original peak at 100 kJ. What is the original forward activation energy?",
    80,
    "kJ",
    "100 − 20 = 80 kJ. The catalysed pathway can have a smaller barrier while retaining the same endpoints.",
    "Peak minus reactants.",
    m(
      "profile",
      "Compare original and catalysed pathways for the endothermic case.",
      "endothermic",
    ),
  ),
  n(
    "p-signed-change",
    "Preserve the overall change",
    "Reactants are at 70 kJ and products at 25 kJ. What is the signed overall energy change, with or without a catalyst?",
    -45,
    "kJ",
    "25 − 70 = −45 kJ. The reaction releases 45 kJ for the stated amount; the catalyst does not change the overall energy change.",
    "Products minus reactants, keeping the sign.",
    m("profile", "Hold both endpoint levels fixed.", "inverse"),
  ),
  c(
    "p-endothermic",
    "Keep an endothermic reaction endothermic",
    "A catalyst lowers the peak for the same reaction with products above reactants. The overall reaction…",
    "Remains endothermic",
    {
      "Becomes exothermic because the peak falls":
        "Overall change depends on endpoints, not the peak.",
      "Has no activation energy": "A lower positive barrier remains.",
    },
    "The product level remains above the reactant level. Lower activation energy does not reverse the overall energy change.",
    "Compare endpoint levels.",
    m("profile", "Build the lower peak without changing products.", "absorbed"),
  ),
  d(
    "p-draw-profile",
    "Draw the catalysed profile",
    "Draw a profile for reactants 40 kJ, products 10 kJ and catalysed forward activation energy 25 kJ. Retain both endpoints and show the peak.",
    40,
    10,
    65,
  ),
  c(
    "p-zero-change",
    "Separate net change from barrier",
    "Reactants and products have the same energy, but a peak lies above them. Which statement is correct?",
    "Overall change is zero; activation energy can be positive",
    {
      "No net change means no barrier":
        "Activation energy concerns the peak above reactants.",
      "A catalyst must change the final product energy":
        "The same overall reaction retains its endpoints.",
    },
    "Zero overall energy change does not mean zero activation energy. Both quantities are differences between different levels.",
    "Identify the start and end of each difference.",
    m(
      "profile",
      "Inspect equal endpoint levels and the higher peak.",
      "equalEnds",
    ),
  ),
  c(
    "p-not-inert",
    "Read the overall equation",
    "In 2 H₂O₂ → 2 H₂O + O₂, catalyst X is written above the reaction arrow rather than among the overall reactants or products. Which explanation fits its possible participation?",
    "It is regenerated rather than consumed",
    {
      "It can never participate in any step":
        "Catalysts can participate and be regenerated.",
      "It must be a final product":
        "A catalyst is not consumed to become the overall product.",
    },
    "X is not a consumed reactant or an overall product in the supplied equation. It can participate during the reaction and be regenerated overall; not consumed does not mean always inert.",
    "Think about the whole reaction, not a single instant.",
    m(
      "evidence",
      "Repair the claim that a catalyst cannot participate.",
      "inert",
    ),
  ),
  c(
    "p-mass-alone",
    "Reject incomplete identification",
    "An additive is recovered with the same dry mass after a faster matched reaction, but its chemical identity was not checked. What conclusion is justified?",
    "The observations are insufficient to establish catalysis",
    {
      "Unchanged mass alone proves it is a catalyst":
        "Different substances can have the same total mass.",
      "Same recovered mass proves it was entirely inert":
        "It could have participated or changed chemically.",
    },
    "Catalyst identification needs the rate effect, relevant controls and evidence that the same chemical substance is regenerated overall.",
    "Mass and chemical identity are different evidence.",
    m(
      "identification",
      "Classify the missing chemical-identity evidence.",
      "massOnly",
    ),
  ),
  c(
    "p-consumed",
    "Distinguish a reactant",
    "An additive speeds product formation but is consumed and becomes a different substance. It is best classified as…",
    "A reactant in the stated overall reaction",
    {
      "A catalyst because any added substance is a catalyst":
        "Catalysts are not consumed overall.",
      "A catalyst because faster always proves catalysis":
        "A reactant can increase rate or product formation too.",
    },
    "Being consumed to make another substance is reactant behaviour, not regeneration of a catalyst overall.",
    "Check what remains at the end.",
    m("identification", "Use the recovery and identity evidence.", "consumed"),
  ),
  c(
    "p-confounded",
    "Spot an unfair comparison",
    "A trial with an additive is faster, but it also used a higher temperature. Does this isolate the additive’s catalytic effect?",
    "No; temperature also changed",
    {
      "Yes; any faster trial proves catalysis":
        "Temperature is a separate rate factor.",
      "Yes; recovery controls the temperature":
        "Recovery evidence does not hold temperature constant.",
    },
    "Use the same temperature and other relevant conditions to isolate the additive’s effect. This confounded comparison is insufficient.",
    "Identify the second changed variable.",
    m(
      "identification",
      "Classify the trial with two changed conditions.",
      "confounded",
    ),
  ),
  c(
    "p-enzyme",
    "Recognise biological catalysts",
    "Under suitable conditions an enzyme is regenerated while speeding a specific substrate reaction. It is…",
    "A biological catalyst",
    {
      "A universal reactant for every substance":
        "Enzymes act on suitable substrates and are not consumed overall.",
      "A substance that must be consumed to accelerate reaction":
        "A biological catalyst is regenerated overall, rather than consumed as the main reactant.",
    },
    "Enzymes are biological catalysts. Their suitable substrates and conditions matter; heating without limit is not guaranteed to increase enzyme activity.",
    "Connect biological identity with catalytic action.",
    m(
      "identification",
      "Read the suitable-condition enzyme evidence.",
      "enzyme",
    ),
  ),
  w(
    "p-controls",
    "Design the fair catalyst comparison",
    "In a school simulation, compare an additive with no additive to investigate its effect on oxygen-production rate. State important controlled conditions and what to measure.",
    "Use the same hydrogen peroxide concentration and volume, temperature, vessel and collection setup. Change only the additive condition; keep the supplied additive dose consistent when comparing additives. Measure gas volume over time or time to the same gas-volume endpoint, repeat comparable trials, and check recovered chemical identity if claiming catalyst regeneration.",
    [
      "Control reactant concentration and volume.",
      "Control temperature and collection conditions.",
      "Measure a rate-related quantity consistently and repeat.",
      "Separate rate evidence from evidence of regeneration.",
    ],
  ),
  n(
    "p-rate-heat",
    "Calculate the warmer mean",
    "A warmer trial collects 30 cm³ in 30 s. What is the mean rate?",
    1,
    "cm³/s",
    "30 ÷ 30 = 1 cm³/s. Compare with the cooler supplied trial 30 ÷ 75 = 0.4 cm³/s; these are measured means, not a universal heating law.",
    "Use the trial’s own collected amount and time.",
    m("comparison", "Calculate both supplied heating-trial means.", "heating"),
  ),
  n(
    "p-rate-nondouble",
    "Do not assume doubling",
    "With catalyst 20 cm³ is collected in 40 s. What is the measured mean rate?",
    0.5,
    "cm³/s",
    "20 ÷ 40 = 0.5 cm³/s. The uncatalysed mean is 0.4 cm³/s, so these measured data do not show doubling.",
    "Calculate from the supplied numbers.",
    m(
      "comparison",
      "Compare the actual data rather than assuming a multiplier.",
      "nonDouble",
    ),
  ),
  n(
    "p-rate-mass",
    "Retain mass-rate units",
    "A catalysed trial loses 0.60 g in 40 s. What is the mean mass-loss rate?",
    0.015,
    "g/s",
    "0.60 ÷ 40 = 0.015 g/s. The gas escaping causes mass loss; the catalyst is not necessarily being consumed.",
    "Mass lost divided by time.",
    m("comparison", "Use the mass-loss data and g/s units.", "mass"),
  ),
  c(
    "p-different-endpoint",
    "Compare amount and time",
    "Trial A collects 15 cm³ in 15 s; trial B 30 cm³ in 25 s. Which has the greater mean rate?",
    "Trial B",
    {
      "Trial A because its time is shorter":
        "Different amounts were collected; compare amount/time.",
      "They must be equal because both form gas":
        "A gives 1 cm³/s and B gives 1.2 cm³/s.",
    },
    "A: 15 ÷ 15 = 1 cm³/s. B: 30 ÷ 25 = 1.2 cm³/s. Time alone can compare rates only with a matched endpoint amount.",
    "Calculate both ratios.",
    m(
      "comparison",
      "Compare measured means for different endpoint amounts.",
      "differentEndpoint",
    ),
  ),
  c(
    "p-final-amount",
    "Keep available product fixed",
    "Same fixed reactant amounts, same products and complete reaction: adding a catalyst changes…",
    "Time to completion, while final amount stays the same",
    {
      "The overall energy change of the same reaction":
        "The reactant/product energy difference stays unchanged for the same overall reaction.",
      "The final amount must double":
        "The supplied fixed reactants limit the final amount.",
    },
    "Under the stated completion assumptions the catalyst changes how quickly product forms, not the stoichiometric product available.",
    "Read the completion and fixed-amount conditions.",
    m("evidence", "Separate speed from final available amount.", "final"),
  ),
  c(
    "p-ten-degree",
    "Reject a universal temperature rule",
    "A student says every 10°C rise exactly doubles every reaction rate. Is this a universal GCSE rule?",
    "No; an exact multiplier needs relevant evidence",
    {
      "Yes; temperature always has the same rate multiplier":
        "Different reactions and conditions have different responses.",
      "No; temperature never affects reaction rate":
        "Temperature usually affects rate; the claimed exact factor is the problem.",
    },
    "GCSE collision theory predicts the usual direction under suitable fixed conditions. A universal exact temperature multiplier is not justified.",
    "Direction is different from an exact numerical factor.",
    m("evidence", "Repair the universal doubling claim.", "factor"),
  ),
  c(
    "p-enzyme-limits",
    "Use suitable enzyme conditions",
    "Why can excessive heating fail to increase an enzyme-catalysed reaction rate?",
    "The enzyme may lose its functional shape and activity",
    {
      "The catalyst must change the overall reaction energy at high temperature":
        "The temperature limit here concerns enzyme structure and activity, not a new overall energy change caused by catalysis.",
      "Every enzyme works identically at every temperature":
        "Enzymes have suitable conditions and specific substrates.",
    },
    "Enzymes are biological catalysts with condition-sensitive structure and suitable substrates. Ordinary heating trends do not justify unlimited heating of enzymes.",
    "A biological catalyst must retain a functioning structure.",
    m("evidence", "Repair the unlimited-heating enzyme claim.", "enzyme"),
  ),
  w(
    "p-compare-mechanisms",
    "Contrast the two causes",
    "Explain the difference between warming a reaction and adding a catalyst at fixed temperature. Include the barrier, particle energies and overall products.",
    "Warming raises average particle kinetic energy and collision frequency; more collisions have sufficient energy for the unchanged pathway barrier. At fixed temperature a catalyst changes the pathway to one with lower activation energy, without raising average particle energy. For the same overall reaction it preserves the products and overall energy change.",
    [
      "Heating changes average energy and frequency.",
      "Catalysis changes the pathway and lowers activation energy.",
      "Fixed-temperature catalysis does not heat the particles.",
      "The same overall reaction retains products and overall energy change.",
    ],
  ),
  w(
    "p-evidence-written",
    "Assess a catalyst claim",
    "A student says an unchanged recovered mass proves an additive is a catalyst. Explain what evidence is missing.",
    "Unchanged mass alone does not show the same chemical substance was regenerated or that it caused a rate increase. Check recovered chemical identity and compare rate under matched temperature, reactant amounts and measurement conditions. A substance recovered unchanged but having no rate effect is not established as a catalyst by these data.",
    [
      "Same mass is not the same as same chemical identity.",
      "Need a rate effect under a fair comparison.",
      "Identify relevant controlled conditions.",
      "Do not identify every inert recovered additive as a catalyst.",
    ],
  ),
];
export const checkForms: Task[][] = [
  [
    c(
      "a1",
      "Explain a fresh heating case",
      "A reaction is warmed without changing its pathway or reacting-particle concentration. Which explanation fits?",
      "Average energy and sufficiently energetic fraction increase",
      {
        "The catalyst barrier is lowered":
          "No catalyst or new pathway was introduced.",
        "Every particle has exactly the same energy":
          "An average is not a single energy for all particles.",
      },
      "Heating raises average kinetic energy and the fraction able to overcome the unchanged barrier.",
      "Distinguish thermal state from pathway.",
    ),
    n(
      "a2",
      "Fresh catalysed peak",
      "Reactants are at 35 kJ, products at 15 kJ and catalysed activation energy is 30 kJ. What is the catalysed peak?",
      65,
      "kJ",
      "35 + 30 = 65 kJ. Activation energy starts at the reactant level.",
      "Add the barrier to reactants.",
    ),
    d(
      "a3",
      "Fresh endothermic profile",
      "Construct a catalysed profile with reactants 15 kJ, products 45 kJ and forward activation energy 50 kJ. Show the endpoint levels and peak.",
      15,
      45,
      65,
    ),
    n(
      "a4",
      "Fresh measured mean",
      "A catalyst trial collects 21 cm³ of gas in 35 s. What is its mean rate?",
      0.6,
      "cm³/s",
      "21 ÷ 35 = 0.6 cm³/s. This is a measured mean over the supplied interval.",
      "Amount divided by time.",
    ),
    w(
      "a5",
      "Independent catalytic explanation",
      "Explain why a catalyst can increase reaction rate without increasing particle kinetic energy at fixed temperature.",
      "It provides a different reaction pathway with a lower activation energy. More encounters can meet this lower energy requirement at the same temperature; their average kinetic energy is unchanged. The catalyst is not consumed overall.",
      [
        "A different or alternative pathway.",
        "Lower activation energy.",
        "More sufficiently energetic encounters at unchanged temperature.",
        "Do not claim the catalyst heats every particle.",
      ],
    ),
  ],
  [
    c(
      "b1",
      "Fresh controlled evidence",
      "Two trials use the same reactants but the trial with an additive is also warmer. It produces gas faster. What follows?",
      "The additive’s catalytic effect has not been isolated",
      {
        "Faster gas production proves it is a catalyst":
          "Temperature also changed.",
        "The additive must be consumed":
          "The given rate evidence does not show consumption.",
      },
      "Temperature is a separate rate factor. The comparison cannot isolate the additive’s contribution.",
      "Check whether only one variable changed.",
    ),
    n(
      "b2",
      "Fresh activation energy",
      "Reactants are at 55 kJ and the catalysed peak at 95 kJ. What is the forward activation energy?",
      40,
      "kJ",
      "95 − 55 = 40 kJ. The zero reference does not replace the reactant level.",
      "Peak minus reactants.",
    ),
    c(
      "b3",
      "Fresh final-product comparison",
      "Same fixed reactant amounts undergo the same reaction to completion, one trial with catalyst. Which outcome is expected?",
      "Same final amount; catalysed trial reaches it sooner",
      {
        "More final product because the barrier is lower":
          "The fixed reactant amounts still limit the available product.",
        "The catalysed trial must have a different overall energy change":
          "The same overall reaction retains its reactant/product energy difference.",
      },
      "A catalyst changes speed, not the available stoichiometric amount under these conditions.",
      "Keep fixed amount and completion separate from speed.",
    ),
    n(
      "b4",
      "Fresh energy-condition count",
      "A constructed sample has encounter energies 6, 12, 18, 24, 30, 36, 42, 48, 54 and 60 units. The stated minimum is 36. How many meet it?",
      5,
      "encounters",
      "36, 42, 48, 54 and 60 meet the minimum: five. Equality counts.",
      "Count energies at least 36.",
    ),
    w(
      "b5",
      "Independent full heating explanation",
      "Explain why cooling a reaction usually reduces its rate when reacting-particle count and occupied volume are controlled.",
      "Cooling reduces average particle kinetic energy and speed, so collisions are less frequent and a smaller fraction have energy at least the activation energy. Successful reactions occur less frequently. The controlled count and volume mean this is not a concentration decrease, and the unchanged pathway does not gain a different activation energy.",
      [
        "Lower average kinetic energy and slower average motion.",
        "Less frequent collisions.",
        "Smaller sufficiently energetic fraction.",
        "Do not claim fewer particles per unit volume or a changed pathway barrier.",
      ],
    ),
  ],
];
export const reviewForms: Task[][] = [
  [
    n(
      "ra1",
      "Delayed barrier retrieval",
      "Reactants are at 25 kJ and catalysed peak at 70 kJ. What is forward activation energy?",
      45,
      "kJ",
      "70 − 25 = 45 kJ. Measure the barrier from reactants.",
      "Peak minus reactants.",
    ),
    c(
      "ra2",
      "Delayed biological retrieval",
      "Which statement about enzymes is correct?",
      "They are biological catalysts with suitable substrates and conditions",
      {
        "They must be used up as the main product":
          "Catalysts are regenerated overall.",
        "They catalyse every possible reaction equally":
          "Different reactions need appropriate catalysts; enzymes are specific.",
      },
      "Enzymes are biological catalysts, with suitable substrates and conditions.",
      "Recall specificity and regeneration.",
    ),
    w(
      "ra3",
      "Delayed contrast",
      "Explain why adding a catalyst at fixed temperature is different from heating the same reaction.",
      "A catalyst provides an alternative pathway with lower activation energy while the particle-energy distribution remains unchanged at fixed temperature. Heating raises average kinetic energy and the fraction able to meet the unchanged pathway barrier, as well as collision frequency.",
      [
        "Catalyst: alternative pathway and lower activation energy.",
        "Fixed temperature: unchanged particle kinetic energy.",
        "Heating: higher average energy and more frequent/sufficiently energetic collisions.",
      ],
    ),
  ],
  [
    n(
      "rb1",
      "Delayed measured rate",
      "A reaction forms 28 cm³ gas in 40 s. What is its mean rate?",
      0.7,
      "cm³/s",
      "28 ÷ 40 = 0.7 cm³/s. The data give an interval mean.",
      "Collected amount divided by time.",
    ),
    d(
      "rb2",
      "Delayed profile construction",
      "Draw a catalysed profile with reactants 60 kJ, products 20 kJ and forward activation energy 30 kJ. Show fixed endpoints and peak.",
      60,
      20,
      90,
    ),
    w(
      "rb3",
      "Delayed catalyst evidence",
      "An additive is recovered chemically unchanged but no matched trial measured its rate effect. Explain why identifying it as a catalyst is premature.",
      "Recovery supports lack of overall chemical consumption, but catalyst identification also needs evidence that it changes the reaction rate under a controlled comparison. An unchanged recovered substance may simply be inert.",
      [
        "Recovery alone does not demonstrate a rate effect.",
        "Need a matched controlled rate comparison.",
        "Not every unchanged substance is a catalyst.",
      ],
    ),
  ],
];
export const refresher: Task[] = [
  c(
    "r-thermal",
    "Thermal quantities",
    "At a higher temperature, average particle kinetic energy is…",
    "Higher",
    {
      "Necessarily identical for every particle":
        "Temperature relates to an average, not identical individual energies.",
      Lower: "Heating usually increases average kinetic energy.",
    },
    "A higher temperature means higher average particle kinetic energy.",
    "Compare the thermal condition.",
  ),
  c(
    "r-frequency",
    "Motion and encounters",
    "For controlled reacting-particle density, faster average motion usually means…",
    "More frequent collisions",
    {
      "Fewer collisions because particles vanish":
        "The particle count is controlled.",
      "A lower activation energy for the same pathway":
        "Faster motion changes encounter frequency; it does not lower the pathway barrier.",
    },
    "Faster average motion increases encounter frequency under these controlled conditions.",
    "Think about travel and encounters.",
  ),
  c(
    "r-minimum",
    "At least the minimum",
    "An encounter has exactly the stated activation-energy minimum. It…",
    "Meets the energy condition",
    {
      "Falls below the minimum": "Equality is included in at least.",
      "Automatically guarantees every possible reaction":
        "Other relevant reaction conditions still matter.",
    },
    "Exactly the minimum is sufficient for the energy condition alone.",
    "Use at least, including equality.",
  ),
  n(
    "r-fraction",
    "Fraction to percent",
    "3 of 12 supplied encounters meet a minimum. What percentage is this?",
    25,
    "%",
    "3 ÷ 12 × 100 = 25%.",
    "Adequate divided by total.",
  ),
  c(
    "r-pathway",
    "Catalytic pathway",
    "A catalyst increases rate by providing…",
    "Another pathway with lower activation energy",
    {
      "More kinetic energy at unchanged temperature":
        "Fixed-temperature catalysis changes the barrier, not particle energies.",
      "The same pathway at a higher temperature":
        "A catalyst provides a different pathway; heating is a separate change.",
    },
    "Alternative pathway plus lower activation energy is the causal explanation.",
    "Name the pathway and its barrier.",
  ),
  c(
    "r-fixed",
    "Fixed temperature",
    "At unchanged temperature, average kinetic energy is…",
    "Unchanged",
    {
      "Higher just because a catalyst is present":
        "Catalysis changes the pathway.",
      Zero: "Particles retain motion at the stated temperature.",
    },
    "The thermal condition is unchanged.",
    "Do not confuse energy distribution with barrier.",
  ),
  n(
    "r-peak",
    "Peak from activation energy",
    "Reactants 20 kJ; forward activation energy 35 kJ. What peak is required?",
    55,
    "kJ",
    "20 + 35 = 55 kJ.",
    "Add the energy difference to reactants.",
  ),
  n(
    "r-ea",
    "Activation from levels",
    "Reactants 45 kJ; peak 100 kJ. What is forward activation energy?",
    55,
    "kJ",
    "100 − 45 = 55 kJ.",
    "Subtract reactants from peak.",
  ),
  n(
    "r-change",
    "Signed overall change",
    "Reactants 50 kJ; products 20 kJ. What is signed overall change?",
    -30,
    "kJ",
    "20 − 50 = −30 kJ.",
    "Products minus reactants.",
  ),
  c(
    "r-endpoints",
    "Catalyst endpoints",
    "For the same overall reaction a catalyst changes the peak, while endpoint energy levels…",
    "Stay unchanged",
    {
      "Must reverse order": "The overall reaction energy change is unchanged.",
      "Must both become zero":
        "An energy reference is not determined by adding a catalyst.",
    },
    "Same reactants/products retain their levels and overall energy change.",
    "Keep overall reaction separate from pathway.",
  ),
  c(
    "r-overall",
    "Regeneration overall",
    "A catalyst is…",
    "Not consumed overall",
    {
      "Unable to participate at any stage":
        "It can participate and be regenerated.",
      "Always converted into the final product":
        "That would be overall consumption.",
    },
    "Regeneration overall is compatible with participating during catalytic action.",
    "Focus on the overall outcome.",
  ),
  c(
    "r-identity",
    "Mass versus identity",
    "Same recovered mass means chemical identity is…",
    "Not established by mass alone",
    {
      "Automatically identical": "Different substances can have the same mass.",
      "Always different": "Mass alone also does not prove a chemical change.",
    },
    "Check identity separately from mass.",
    "Different observations answer different questions.",
  ),
  c(
    "r-controls",
    "Single-variable comparison",
    "To isolate an additive’s rate effect, temperature should be…",
    "Held the same",
    {
      "Raised only in the additive trial": "That confounds two rate factors.",
      Ignored: "Temperature affects rate.",
    },
    "Hold relevant conditions fixed while changing the additive condition.",
    "Change one factor at a time.",
  ),
  c(
    "r-enzyme",
    "Biological catalyst",
    "An enzyme is best described as…",
    "A biological catalyst",
    {
      "A reactant consumed to supply the product":
        "Enzymes are regenerated overall rather than consumed as the main reactant.",
      "A catalyst that is effective under every possible condition":
        "Enzymes need suitable conditions to retain their activity.",
    },
    "Enzymes are biological catalysts with appropriate substrates/conditions.",
    "Recall biological catalysis.",
  ),
  n(
    "r-rate",
    "Mean rate",
    "18 cm³ is collected in 45 s. What is mean rate?",
    0.4,
    "cm³/s",
    "18 ÷ 45 = 0.4 cm³/s.",
    "Collected amount divided by time.",
  ),
  c(
    "r-extent",
    "Rate versus amount",
    "Same fixed reactants and complete reaction: faster rate implies…",
    "Sooner completion, not automatically more final product",
    {
      "A greater final product amount from the same limiting reactant":
        "With the same reaction and completion, the fixed reactant amount limits final product.",
      "A guaranteed universal rate factor":
        "An exact factor needs relevant measured data.",
    },
    "Under the stated conditions final available amount and speed are distinct.",
    "Separate how quickly from how much.",
  ),
];
const recovery: Record<string, string> = {
  "p-heat-frequency": "frequency",
  "p-not-all": "thermal",
  "p-high-count": "minimum",
  "p-fraction": "fraction",
  "p-cooling": "thermal",
  "p-heat-written": "frequency",
  "p-fixed-temperature": "fixed",
  "p-threshold-equality": "minimum",
  "p-no-proof-zero": "minimum",
  "p-energy-condition": "minimum",
  "p-catalyst-written": "pathway",
  "p-peak-offset": "peak",
  "p-ea-original": "ea",
  "p-signed-change": "change",
  "p-endothermic": "endpoints",
  "p-draw-profile": "peak",
  "p-zero-change": "change",
  "p-not-inert": "overall",
  "p-mass-alone": "identity",
  "p-consumed": "overall",
  "p-confounded": "controls",
  "p-enzyme": "enzyme",
  "p-controls": "controls",
  "p-rate-heat": "rate",
  "p-rate-nondouble": "rate",
  "p-rate-mass": "rate",
  "p-different-endpoint": "rate",
  "p-final-amount": "extent",
  "p-ten-degree": "extent",
  "p-enzyme-limits": "enzyme",
  "p-compare-mechanisms": "pathway",
  "p-evidence-written": "identity",
};
for (const task of practice) {
  const target = recovery[task.id.slice(6)];
  if (!target) throw Error("Missing individual targeted recovery.");
  task.followUp = "tc-v1-r-" + target;
}
export const temperatureJourney: LessonJourney = {
  version: 1 as const,
  introduction:
    "Change temperature and catalytic pathway separately, then explain which quantities changed and which stayed fixed.",
  scopeNote:
    "Foundation/common AQA thermal collision theory and catalysis, with limited Pearson comparison. Higher temperature raises average particle kinetic energy and collision frequency under suitable controlled conditions; a catalyst provides a different pathway with lower activation energy and is regenerated overall. Energy snapshots are constructed, stationary teaching samples, not measured distributions or exact rate laws. Profile energies refer to the stated reaction amount; energy is not physical height, and progress is not time. Same reactants/products preserve overall energy change. Final amount comparisons require the stated fixed reactant amounts and complete reaction; equilibrium is taught separately. Enzymes are biological catalysts with suitable conditions and substrates. No Arrhenius equations, quantitative Maxwell–Boltzmann curves or universal temperature multiplier. Written responses are self-reviewed; entered levels and arrows do not certify freehand exam drawing competence.",
  outcomes: [
    "Explain heating using average energy, collision frequency and sufficiently energetic fraction.",
    "Explain catalysis through a different pathway with lower activation energy at unchanged temperature.",
    "Construct a lower-barrier profile while preserving endpoints and overall energy change.",
    "Evaluate catalyst identity, controlled observations and biological specificity.",
    "Separate measured rate, complete-reaction amount and unsupported exact multiplier claims.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
};

export const temperatureAllTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const temperatureExposureFamilies: Record<string, string[]> = {
  heat: [
    "w-contact",
    "g-heat",
    "p-heat-frequency",
    "p-not-all",
    "p-high-count",
    "p-fraction",
    "p-cooling",
    "p-heat-written",
    "p-ten-degree",
    "p-compare-mechanisms",
    "a1",
    "b4",
    "b5",
    "ra3",
    "r-thermal",
    "r-frequency",
    "r-minimum",
    "r-fraction",
  ],
  catalyst: [
    "g-catalyst",
    "g-evidence",
    "p-fixed-temperature",
    "p-threshold-equality",
    "p-no-proof-zero",
    "p-energy-condition",
    "p-catalyst-written",
    "p-compare-mechanisms",
    "a5",
    "ra3",
    "r-pathway",
    "r-fixed",
    "r-minimum",
  ],
  profile: [
    "w-barrier",
    "g-profile",
    "p-peak-offset",
    "p-ea-original",
    "p-signed-change",
    "p-endothermic",
    "p-draw-profile",
    "p-zero-change",
    "a2",
    "a3",
    "b2",
    "ra1",
    "rb2",
    "r-peak",
    "r-ea",
    "r-change",
    "r-endpoints",
  ],
  identity: [
    "g-identify",
    "p-not-inert",
    "p-mass-alone",
    "p-consumed",
    "p-confounded",
    "p-enzyme",
    "p-controls",
    "p-enzyme-limits",
    "p-evidence-written",
    "b1",
    "ra2",
    "rb3",
    "r-overall",
    "r-identity",
    "r-controls",
    "r-enzyme",
  ],
  rate: [
    "g-rate",
    "p-rate-heat",
    "p-rate-nondouble",
    "p-rate-mass",
    "p-different-endpoint",
    "p-final-amount",
    "a4",
    "b3",
    "rb1",
    "r-rate",
    "r-extent",
  ],
};
for (const members of Object.values(temperatureExposureFamilies)) {
  const ids = members.map((id) => "tc-v1-" + id);
  for (const task of temperatureAllTasks)
    if (ids.includes(task.id))
      task.exposureAliases = [
        ...new Set([
          ...(task.exposureAliases ?? []),
          ...ids.filter((id) => id !== task.id),
        ]),
      ];
}
