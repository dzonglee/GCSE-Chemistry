import type { LearningTask, LessonJourney } from "../types";
import type { ShiftMode } from "../../lib/equilibrium-shifts";
type Task = LearningTask;
const model = (
  mode: ShiftMode,
  instruction: string,
  record = "initial",
): Task["model"] => ({ kind: "equilibrium-shift", mode, record, instruction });
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
    id: "es-v1-" + id,
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
    id: "es-v1-" + id,
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
    id: "es-v1-" + id,
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
    "w-gas",
    "Count gas coefficients",
    "In N₂(g) + 3H₂(g) ⇌ 2NH₃(g), what is the total gaseous coefficient on the left?",
    4,
    "",
    "1 + 3 = 4. This is a coefficient total, not a measurement of the current mixture.",
    "Add the coefficients of the two gases.",
  ),
  c(
    "w-energy",
    "Recall energy directions",
    "A forward reaction releases energy to the surroundings. Its reverse reaction is…",
    "Endothermic",
    {
      Exothermic: "Reversing the change reverses the energy transfer.",
      "Neither direction transfers energy":
        "The stated forward change releases energy.",
    },
    "The reverse reaction takes in energy and is endothermic.",
    "Reverse the energy transfer.",
  ),
];
export const guided: Task[] = [
  n(
    "g-compression",
    "Separate volume and reaction",
    "The first supplied ammonia mixture contains 4 N₂, 12 H₂ and 8 NH₃ molecules. Immediately after compression, before a net reaction changes composition, how many gas molecules remain?",
    24,
    "molecules",
    "4 + 12 + 8 = 24. Changing volume does not itself create or remove molecules.",
    "Inspect the before and immediate stages.",
    model(
      "compression",
      "Change the volume first; then inspect the supplied later composition.",
    ),
  ),
  n(
    "g-pressure",
    "Read the phase symbols",
    "For CaCO₃(s) ⇌ CaO(s) + CO₂(g), how many gaseous coefficients are on the reactant side?",
    0,
    "",
    "CaCO₃ is solid, so the gas coefficient total on the left is zero.",
    "Count only (g), not (s).",
    model(
      "pressure",
      "Count gaseous coefficients, then predict the pressure response.",
      "carbonate",
    ),
  ),
  c(
    "g-temperature",
    "Follow the supplied forward direction",
    "For the displayed exothermic forward ammonia reaction, heating favours…",
    "The reverse, endothermic direction",
    {
      "The forward direction because reactions get faster":
        "Rate is separate from equilibrium position.",
      "Neither direction because a catalyst is absent":
        "Temperature can alter position without a catalyst.",
    },
    "Heating favours the energy-absorbing reverse direction.",
    "Identify which direction takes energy in.",
    model(
      "temperature",
      "Use the forward energy direction and decide position separately from rate.",
    ),
  ),
  n(
    "g-concentration",
    "Read the later partial response",
    "In the supplied P ⇌ Q example, adding P changes its amount from 6 to 11 mmol. The later mixture contains 9 mmol P and 6 mmol Q. How much Q is present at the later equilibrium?",
    6,
    "mmol",
    "The supplied later Q amount is 6 mmol; it has risen from the immediate 4 mmol.",
    "Read the later product entry.",
    model(
      "concentration",
      "Compare the original, immediate and supplied later amounts.",
    ),
  ),
  c(
    "g-combined",
    "Leave opposing effects unresolved",
    "For exothermic N₂(g) + 3H₂(g) ⇌ 2NH₃(g), pressure and temperature are both increased. With no quantitative data, the overall ammonia-yield change is…",
    "Not determined from these opposing effects",
    {
      "Definitely higher":
        "Pressure favours ammonia, but heating favours reactants.",
      "Definitely lower":
        "Heating favours reactants, but compression favours ammonia.",
      "Exactly zero": "Opposing effects need not cancel exactly.",
    },
    "Pressure favours fewer gas molecules, while heating favours the endothermic reverse direction. Their relative effects are not supplied.",
    "Determine each effect separately.",
    model(
      "combined",
      "Predict pressure and temperature effects before drawing an overall conclusion.",
    ),
  ),
  n(
    "g-evidence",
    "Read sampled arrival time",
    "In the supplied catalyst comparison, at what sampled time does the changed run first reach its continuing final plateau?",
    2,
    "min",
    "The changed run is 0.8 mol/dm³ from the 2-minute sample onwards. Its final concentration matches the control.",
    "Find the first value that remains at the final level.",
    model(
      "evidence",
      "Compare final concentration and first plateau sample independently.",
    ),
  ),
];
export const refresher: Task[] = [
  c(
    "r-inventory",
    "Compression conserves molecules immediately",
    "Before any net reaction, compression of a sealed mixture at fixed temperature changes…",
    "Occupied volume, not molecule inventory",
    {
      "The identities of all molecules immediately":
        "Volume change is distinct from the later chemical response.",
      "The number of atoms in the sealed mixture":
        "Compression does not remove atoms.",
    },
    "The same molecules occupy less volume immediately after compression.",
    "Separate physical volume change from reaction.",
  ),
  c(
    "r-partial",
    "Counteraction need not be complete",
    "A system responds to compression and reaches a new equilibrium. Must its pressure return to the original value?",
    "Not necessarily; the reaction can partially oppose the change",
    {
      "Yes, equilibrium means original pressure":
        "Equilibrium means balanced rates under the new conditions.",
      "Yes, all added pressure disappears":
        "The imposed volume change remains.",
    },
    "The new state can retain higher pressure than before compression.",
    "The imposed smaller volume remains.",
  ),
  n(
    "r-coefficients",
    "Count coefficients and phases",
    "For 2A(g) + B(s) ⇌ C(l) + 3D(g), what is the product-side gaseous coefficient total?",
    3,
    "",
    "Only 3D(g) contributes. C(l) is liquid; an extra substance name is not an extra gaseous coefficient.",
    "Read the (g) labels, then their coefficients.",
  ),
  n(
    "r-atoms",
    "Count nitrogen atoms",
    "A supplied mixture contains 2 N₂ and 5 NH₃ molecules. How many nitrogen atoms are present?",
    9,
    "atoms",
    "2 × 2 + 5 × 1 = 9 nitrogen atoms.",
    "Multiply each molecule count by its nitrogen atoms per molecule.",
  ),
  c(
    "r-equal",
    "Recognise the pressure exception",
    "H₂(g) + I₂(g) ⇌ 2HI(g). Compression at fixed temperature…",
    "Does not favour either side",
    {
      "Favours HI because there is one product name":
        "The product coefficient is 2.",
      "Favours reactants because they are heavier":
        "Use gaseous coefficients, not mass.",
    },
    "Both sides total two gaseous molecules per balanced event.",
    "Add the gas coefficients on each side.",
  ),
  c(
    "r-heating",
    "Heating favours endothermic",
    "Which energy direction is favoured when an equilibrium mixture is heated?",
    "Endothermic",
    {
      Exothermic: "That releases rather than absorbs energy.",
      "Always forward": "Forward can be either energy direction.",
    },
    "The response favours taking in energy.",
    "Consider the direction that absorbs energy.",
  ),
  c(
    "r-rate",
    "Distinguish speed and yield",
    "Cooling an equilibrium with an exothermic forward reaction can give…",
    "More products at equilibrium but a slower approach",
    {
      "Fewer products solely because collisions are slower":
        "Collision speed describes rate, not the equilibrium preference.",
      "No ongoing reverse reaction":
        "Dynamic equilibrium still has both directions.",
    },
    "Cooling favours the exothermic forward direction, while lower temperature generally slows reactions.",
    "Answer position and rate separately.",
  ),
  c(
    "r-add",
    "Use the side that was added",
    "For A ⇌ B initially at equilibrium, with temperature and volume fixed, which pair correctly describes the separate additions?",
    "Add A: net forward; add B: net reverse",
    {
      "Either addition always favours products":
        "Adding a product instead favours its consumption by reverse reaction.",
      "Add A: net reverse; add B: net forward":
        "Those responses would reinforce each concentration increase.",
    },
    "Adding reactant favours product formation; adding product favours reactant formation. Each response consumes some of the substance added.",
    "Locate the added substance on the displayed equation.",
  ),
  c(
    "r-remove",
    "Use the side that was removed",
    "For A ⇌ B initially at equilibrium, with temperature and volume fixed, which pair correctly describes the separate removals?",
    "Remove B: net forward; remove A: net reverse",
    {
      "Either removal always favours products":
        "Removing a reactant instead favours its formation by reverse reaction.",
      "Remove B: net reverse; remove A: net forward":
        "Those responses would consume more of the removed substance.",
    },
    "Removing product favours forward replenishment; removing reactant favours reverse replenishment.",
    "Find the direction that forms the removed substance.",
  ),
  c(
    "r-opposed",
    "Opposing conditions need data",
    "Two simultaneous changes favour opposite directions. Without relative effect sizes, their net effect is…",
    "Not determined",
    {
      "Exactly zero": "Opposing does not mean equal effects.",
      "Always the pressure effect": "There is no universal dominance rule.",
    },
    "Additional suitable data are needed.",
    "Do not invent a numerical yield score.",
  ),
  c(
    "r-agree",
    "Agreeing conditions",
    "For an exothermic forward reaction with fewer gas molecules on the product side, cooling and compression both favour…",
    "The displayed products",
    {
      "The displayed reactants":
        "Cooling favours exothermic; compression favours fewer gases.",
      "Opposite directions": "These two supplied effects agree.",
    },
    "Both changes favour the forward direction.",
    "Apply each rule separately.",
  ),
  c(
    "r-catalyst",
    "Catalyst leaves position unchanged",
    "At unchanged temperature, adding a catalyst changes…",
    "Time to equilibrium, not the equilibrium composition",
    {
      "The equilibrium yield because more collisions occur":
        "A catalyst accelerates both directions.",
      "Only the forward reaction":
        "Both forward and reverse pathways are catalysed.",
    },
    "The same equilibrium can be reached sooner.",
    "Distinguish final state from approach.",
  ),
  n(
    "r-plateau",
    "Find a sampled plateau",
    "Supplied product concentrations at 0, 2, 4, 6 and 8 minutes are 0, 0.3, 0.6, 0.8 and 0.8 mol/dm³. What is the first sampled time at the continuing final plateau?",
    6,
    "min",
    "The 6- and 8-minute readings are both the final 0.8; the 4-minute reading is lower.",
    "Find the first repeated final value.",
  ),
];
export const practice: Task[] = [
  n(
    "p-immediate",
    "Expansion before reaction",
    "A sealed mixture has 3 N₂, 9 H₂ and 6 NH₃ molecules. Its volume is increased at fixed temperature. Before any net reaction, how many gas molecules are present?",
    18,
    "molecules",
    "3 + 9 + 6 = 18; increasing occupied volume does not itself remove molecules.",
    "Count the unchanged inventory.",
  ),
  n(
    "p-conserved",
    "Conserve atoms through reaction",
    "A supplied later ammonia mixture contains 3 N₂ and 10 NH₃ molecules, plus hydrogen gas. How many nitrogen atoms does it contain?",
    16,
    "atoms",
    "3 × 2 + 10 × 1 = 16 nitrogen atoms.",
    "N₂ has two N atoms; NH₃ has one.",
  ),
  w(
    "p-compression-written",
    "Explain the two stages",
    "Explain why compression of a sealed gaseous equilibrium can change pressure immediately but composition only through the subsequent net reaction.",
    "The same molecules immediately occupy a smaller volume, so pressure rises at fixed temperature. The imbalance in reactions then gives a net change towards fewer gas molecules where the gaseous coefficients differ. At the later equilibrium, both directions again have equal rates; the response need not restore the original pressure.",
    [
      "Separate the immediate volume change from later reaction.",
      "State the unchanged immediate inventory and fixed temperature.",
      "Use fewer gaseous coefficients and a later new equilibrium.",
    ],
  ),
  c(
    "p-ammonia",
    "Compression with unequal totals",
    "N₂(g) + 3H₂(g) ⇌ 2NH₃(g). Higher pressure by compression at fixed temperature favours…",
    "Ammonia",
    {
      "Nitrogen and hydrogen":
        "They total four gaseous coefficients, rather than two.",
      "Neither because the equation is balanced":
        "Balanced atoms do not imply equal numbers of gas molecules.",
    },
    "The forward side has fewer gaseous molecules: 2 versus 4.",
    "Count gas coefficients.",
  ),
  c(
    "p-expansion",
    "Expansion with unequal totals",
    "2NO₂(g) ⇌ N₂O₄(g). Lower pressure by expansion at fixed temperature favours…",
    "NO₂",
    {
      "N₂O₄": "That is the side with fewer gas molecules.",
      "Neither because nitrogen atoms are conserved":
        "Atom conservation does not make gas molecule counts equal.",
    },
    "Lower pressure favours the side with more gas molecules: two NO₂.",
    "Use more gas molecules for lower pressure.",
  ),
  c(
    "p-equal",
    "Equal gaseous coefficients",
    "2HI(g) ⇌ H₂(g) + I₂(g). Increasing pressure by compression at fixed temperature…",
    "Does not shift the equilibrium position",
    {
      "Favours the right because there are two product names":
        "There are two gaseous coefficients on both sides.",
      "Favours the left because HI has more atoms":
        "Atoms per molecule do not replace gas coefficient totals.",
    },
    "Two gaseous coefficients occur on each side.",
    "Count coefficients, including 2HI.",
  ),
  n(
    "p-unfamiliar-count",
    "Read an unfamiliar equation",
    "For 3A(g) + B(s) ⇌ 2C(g) + D(l), what is the gaseous coefficient total on the right?",
    2,
    "",
    "Only 2C(g) contributes; D is liquid.",
    "Count only the species marked (g).",
  ),
  c(
    "p-phase",
    "Pressure and solid phases",
    "CaCO₃(s) ⇌ CaO(s) + CO₂(g). Higher pressure by compression favours…",
    "The reverse direction",
    {
      "The forward direction because the product side has two names":
        "Only CO₂ is a gas, so the gaseous totals are 0 versus 1.",
      "Neither because solids are present":
        "A gaseous product makes pressure relevant.",
    },
    "The reverse direction has fewer gaseous molecules.",
    "Exclude both solids from the gas count.",
  ),
  w(
    "p-pressure-written",
    "Justify the pressure exception",
    "Explain why changing pressure by changing volume does not shift H₂(g) + I₂(g) ⇌ 2HI(g) at fixed temperature.",
    "There are two gaseous coefficients on each side: 1 + 1 on the left and 2 on the right. Changing pressure therefore favours neither side, so the equilibrium position is unchanged.",
    [
      "State equal gas coefficient totals.",
      "Give 2 on each side.",
      "Conclude no position shift, rather than no pressure change.",
    ],
  ),
  c(
    "p-heat-endo",
    "Use an endothermic forward direction",
    "The forward reaction N₂(g) + O₂(g) ⇌ 2NO(g) is endothermic. Heating favours…",
    "NO formation",
    {
      "N₂ and O₂ formation": "The reverse direction is exothermic.",
      "No change because gas coefficients are equal":
        "Equal gas totals concern pressure, not temperature.",
    },
    "Heating favours the endothermic forward direction.",
    "Use the supplied energy direction.",
  ),
  c(
    "p-cool-endo",
    "Cooling an endothermic reaction",
    "For an endothermic forward A ⇌ B, lowering temperature favours…",
    "The reverse, exothermic direction",
    {
      "The forward direction because B is a product":
        "Products are not always favoured by cooling.",
      "No change because the equation is reversible":
        "Reversible equilibria can respond to temperature.",
    },
    "Cooling favours release of energy.",
    "The reverse energy direction is opposite to forward.",
  ),
  c(
    "p-reversed",
    "Reverse the written equation",
    "N₂O₄(g) ⇌ 2NO₂(g) has an endothermic forward direction. Heating shifts this displayed equation…",
    "To the right",
    {
      "To the left because NO₂/N₂O₄ always shifts left on heating":
        "Direction is relative to the equation as written.",
      "Nowhere because it contains gases":
        "Temperature still affects position.",
    },
    "Heating favours the displayed endothermic forward direction.",
    "Read the actual displayed sides.",
  ),
  w(
    "p-temperature-written",
    "Connect energy and direction",
    "A forward reaction is exothermic. Explain the equilibrium response to a temperature increase.",
    "Increasing temperature favours the endothermic direction, which is the reverse reaction here. The equilibrium shifts towards the displayed reactants, reducing the relative equilibrium product amount.",
    [
      "Heating favours endothermic.",
      "Identify reverse as endothermic.",
      "Connect reverse shift to less equilibrium product.",
    ],
  ),
  w(
    "p-yield-rate-written",
    "Separate yield and rate",
    "For an exothermic forward reaction, why might cooling improve equilibrium product yield while making production slower?",
    "Cooling favours the exothermic forward reaction and increases the relative product amount at equilibrium. Lower temperature generally reduces reaction rates, so reaching that equilibrium takes longer. A higher equilibrium yield does not mean a faster reaction.",
    [
      "Explain the exothermic equilibrium preference.",
      "Explain the slower reaction rate at lower temperature.",
      "Keep final yield separate from speed.",
    ],
  ),
  c(
    "p-add-product",
    "Adding product",
    "Starting at equilibrium and keeping temperature and volume fixed, adding Q to P(aq) ⇌ Q(aq) favours…",
    "Net Q → P",
    {
      "Net P → Q": "That forms more of the substance already added.",
      "No change because the mixture was previously at equilibrium":
        "The edit disturbs the balance.",
    },
    "The reverse reaction consumes some added product Q.",
    "Oppose the increase in Q.",
  ),
  c(
    "p-remove-reactant",
    "Removing reactant",
    "Starting at equilibrium, removing some P from P(aq) ⇌ Q(aq), at fixed temperature and volume, favours…",
    "Net Q → P",
    {
      "Net P → Q": "That would consume more of the removed reactant.",
      "The disappearance of both substances":
        "The system reaches a new equilibrium rather than destroying matter.",
    },
    "The reverse reaction replenishes some P.",
    "Find the direction that forms P.",
  ),
  n(
    "p-add-account",
    "Account for added material",
    "Before an edit, P and Q amounts are 8 and 2 mmol. Adding 5 mmol P gives 13 and 2 mmol immediately. The supplied later mixture contains 12 mmol P. How much Q must it contain for P ⇌ Q?",
    3,
    "mmol",
    "The edited total is 15 mmol; 15 − 12 = 3 mmol Q.",
    "Conserve the edited total, not the pre-edit total.",
  ),
  n(
    "p-removal-account",
    "Account for removed material",
    "Before removal, P and Q are 8 and 2 mmol. Removing 1 mmol Q leaves a 9 mmol total. The supplied later P amount is 7.2 mmol. What is the later Q amount for P ⇌ Q?",
    1.8,
    "mmol",
    "9 − 7.2 = 1.8 mmol. Some Q is replaced, but the removed matter is no longer in the system.",
    "Use the post-removal total.",
  ),
  c(
    "p-colour",
    "Apply a supplied colour equilibrium",
    "A supplied aqueous equilibrium is blue compound A + acid ⇌ yellow compound B + water. Increasing acid concentration favours…",
    "More yellow compound B",
    {
      "More blue compound A": "Added reactant acid favours forward reaction.",
      "No colour change because equilibrium means equal amounts":
        "Equal rates do not require equal amounts.",
    },
    "Added reactant favours products, including the supplied yellow compound. This uses the stated colours, not a simulated optical model.",
    "Locate acid on the reactant side.",
  ),
  w(
    "p-partial-written",
    "Explain partial replenishment",
    "For P ⇌ Q, removing Q changes its amount from 4 to 2 mmol immediately. At the new equilibrium Q is 3.2 mmol. Explain the direction and why “opposes” does not mean “undoes”.",
    "Q rises from 2 to 3.2 mmol through net forward reaction, so some removed product is replenished. It remains below the original 4 mmol. The response partially counteracts the removal; a new equilibrium need not restore the original amount.",
    [
      "Compare 3.2 with the immediate 2.",
      "Identify forward product formation.",
      "Compare 3.2 with the original 4.",
    ],
  ),
  c(
    "p-both-forward",
    "Two agreeing changes",
    "Exothermic N₂(g) + 3H₂(g) ⇌ 2NH₃(g) is cooled and compressed. Both changes favour…",
    "Ammonia formation",
    {
      "Nitrogen and hydrogen formation":
        "Both supplied preferences favour the forward direction.",
      "Opposite directions":
        "Cooling favours exothermic; compression favours fewer gas molecules.",
    },
    "Cooling favours exothermic forward; compression favours 2 rather than 4 gas coefficients.",
    "Determine both effects separately.",
  ),
  c(
    "p-both-reverse",
    "Two reverse preferences",
    "Exothermic N₂(g) + 3H₂(g) ⇌ 2NH₃(g) is heated and expanded. Both changes favour…",
    "Nitrogen and hydrogen formation",
    {
      "Ammonia formation":
        "Heating favours endothermic reverse; expansion favours more gases.",
      "No shift because two conditions change": "Multiple changes can agree.",
    },
    "Both changes favour the reverse direction.",
    "Heating and lower pressure each favour which side?",
  ),
  c(
    "p-neutral-pressure",
    "One neutral effect",
    "N₂(g) + O₂(g) ⇌ 2NO(g) is endothermic forwards. Pressure and temperature increase. What position change is supported?",
    "Towards NO",
    {
      "Towards N₂ and O₂": "Heating favours the endothermic forward reaction.",
      "Undetermined because pressure always opposes heating":
        "The gas totals are equal, so pressure is neutral.",
    },
    "Pressure gives no shift with equal gas totals; heating favours NO.",
    "Check whether pressure has any directional effect.",
  ),
  w(
    "p-opposed-written",
    "Refuse an invented net yield",
    "Exothermic N₂(g) + 3H₂(g) ⇌ 2NH₃(g) is cooled while pressure decreases. Explain whether the overall ammonia-yield change can be determined from only these facts.",
    "Cooling favours the exothermic forward reaction and ammonia. Lower pressure favours the side with more gaseous molecules, nitrogen and hydrogen. These effects oppose each other, and their relative sizes are not supplied, so the overall ammonia-yield change cannot be determined.",
    [
      "Explain cooling using exothermic forward.",
      "Explain lower pressure using 4 versus 2 gas coefficients.",
      "State opposing effects and insufficient quantitative information.",
    ],
  ),
  c(
    "p-catalyst",
    "Position versus catalyst",
    "A catalyst is added to an existing equilibrium at unchanged temperature and volume. The equilibrium product yield…",
    "Stays the same",
    {
      "Increases because the forward rate rises":
        "The reverse reaction is also accelerated.",
      "Decreases because the catalyst consumes product":
        "A catalyst is not a consumed equilibrium product.",
    },
    "A catalyst changes rates and approach time, not equilibrium position.",
    "Consider both reaction directions.",
  ),
  n(
    "p-control-time",
    "Read the comparison honestly",
    "A control has product readings 0, 0.25, 0.5, 0.75, 0.75 at 0, 3, 6, 9, 12 min. What is its first sampled time at the continuing final plateau?",
    9,
    "min",
    "The final 0.75 first appears at 9 min and remains at 12 min.",
    "Use the first continuing final reading.",
  ),
  c(
    "p-faster-less",
    "Faster does not mean more",
    "A hotter exothermic run reaches 0.4 mol/dm³ at 2 min and stays there. The cooler control reaches 0.7 mol/dm³ at 6 min and stays there. The hotter run has…",
    "An earlier sampled plateau but lower final concentration",
    {
      "An earlier plateau and greater final yield":
        "The supplied final value is lower.",
      "The same final concentration because both have plateaus":
        "Compare 0.4 with 0.7.",
    },
    "Arrival time and final concentration describe different properties.",
    "Compare the two times and two final values separately.",
  ),
  c(
    "p-sampled",
    "Limit a graph conclusion",
    "Two runs first have their continuing final values at the 4-minute sample. Can we conclude their exact equilibrium arrival times were identical?",
    "No; only the sampled arrival time is the same",
    {
      "Yes, both arrived at exactly 4 minutes":
        "The observations do not give an exact between-sample time.",
      "Yes, their entire rate histories must match":
        "Different curves can share a sampled plateau time.",
    },
    "Discrete samples support a sampled comparison, not exact continuous arrival times.",
    "Keep the observation precision in the conclusion.",
  ),
  w(
    "p-catalyst-written",
    "Explain a catalyst comparison",
    "A catalysed and uncatalysed run have identical initial conditions and reach the same equilibrium product concentration, but the catalysed run reaches it sooner. Explain this result.",
    "The catalyst lowers activation energy for both reaction directions, increasing their rates. Equilibrium is reached sooner, but at the same temperature and other conditions its position and final composition are unchanged.",
    [
      "Refer to both reaction directions.",
      "Connect lower activation energy to faster approach.",
      "State unchanged equilibrium composition at the same conditions.",
    ],
  ),
];
practice.push(
  c(
    "p-pressure-appearance",
    "Connect a supplied gas observation",
    "2NO₂(g) ⇌ N₂O₄(g): NO₂ is brown and N₂O₄ is colourless. A supplied sealed-syringe experiment reports a lighter brown mixture after compression and re-equilibration at constant temperature. Which equilibrium response does the gas-coefficient rule predict?",
    "Net conversion of NO₂ into N₂O₄",
    {
      "Net conversion of N₂O₄ into NO₂":
        "Higher pressure favours the side with one gas molecule rather than two.",
      "No position shift because both substances contain nitrogen":
        "Conserved atoms do not imply equal gas molecule coefficients.",
    },
    "Compression favours the right-hand side with fewer gas molecules: brown NO₂ is converted into colourless N₂O₄. The supplied observation is interpreted alongside the equation; this is not a simulated optical-intensity measurement.",
    "Count two gaseous molecules on the left and one on the right.",
  ),
);
export const checkForms: Task[][] = [
  [
    n(
      "a-phase",
      "Count the supplied gaseous side",
      "A supplied balanced equilibrium is A(s) ⇌ B(s) + C(g). What is the gaseous coefficient total on the product side?",
      1,
      "",
      "Only C is gaseous and its coefficient is 1.",
      "Count the state symbols marked (g).",
    ),
    c(
      "a-temperature",
      "Apply supplied endothermic information",
      "A forward reaction R ⇌ S is endothermic. Temperature is increased. The relative equilibrium amount of S…",
      "Increases",
      {
        Decreases: "Heating favours the stated endothermic forward direction.",
        "Cannot change because it is equilibrium":
          "A temperature change can alter the equilibrium position.",
      },
      "Heating favours the endothermic forward direction and more S at equilibrium.",
      "Identify the energy-absorbing direction.",
    ),
    n(
      "a-add",
      "Account for the edited total",
      "An equilibrium R ⇌ S initially has 9 mmol R and 6 mmol S. Add 5 mmol R at fixed temperature and solution volume. A supplied later equilibrium has 12 mmol R. How much S does it contain?",
      8,
      "mmol",
      "The total after addition is 9 + 6 + 5 = 20 mmol. Later S is 20 − 12 = 8 mmol.",
      "Conserve the total after addition.",
    ),
    w(
      "a-conflict",
      "Explain opposing conditions",
      "For the supplied endothermic forward reaction 2X(g) ⇌ Y(g), pressure increases while temperature decreases. Explain whether these facts determine the overall change in equilibrium Y yield.",
      "Higher pressure favours the side with fewer gaseous molecules, Y. Cooling favours the exothermic reverse direction, X. The effects oppose each other and their relative sizes are not supplied, so the overall Y-yield change cannot be determined.",
      [
        "Use 2 versus 1 gas coefficients to explain the pressure preference.",
        "Use endothermic forward to explain the cooling preference.",
        "State opposite effects and insufficient information about their relative sizes.",
      ],
    ),
    c(
      "a-catalyst",
      "Predict the fixed-condition final state",
      "Two runs start with the same amounts of each substance at the same temperature and volume. Only one has a suitable catalyst. At equilibrium their product compositions are…",
      "The same",
      {
        "Higher in the catalysed run":
          "A catalyst accelerates the reverse reaction too.",
        "Zero in the uncatalysed run":
          "A slow reaction can still reach equilibrium.",
      },
      "A catalyst changes approach time without shifting the equilibrium at the same conditions.",
      "Consider both directions.",
    ),
  ],
  [
    n(
      "b-coefficients",
      "Count a different balanced gas equation",
      "For the supplied balanced equation 2M(g) + 3N(g) ⇌ 2P(g), what is the reactant-side gaseous coefficient total?",
      5,
      "",
      "2 + 3 = 5 gaseous coefficients.",
      "Count coefficients rather than substance names.",
    ),
    c(
      "b-temperature",
      "Apply cooling to the written direction",
      "For U ⇌ V the displayed forward reaction is exothermic. Cooling favours…",
      "The displayed forward reaction",
      {
        "The displayed reverse reaction": "That direction is endothermic.",
        "No shift because lower temperature slows reaction":
          "A rate change does not remove the equilibrium preference.",
      },
      "Cooling favours the exothermic forward direction, increasing relative equilibrium V.",
      "Use the supplied forward energy direction.",
    ),
    n(
      "b-removal",
      "Conserve what remains",
      "An equilibrium U ⇌ V initially has 15 mmol U and 5 mmol V. Remove 4 mmol V at fixed temperature and solution volume. A supplied later equilibrium has 12 mmol U. What is its V amount?",
      4,
      "mmol",
      "After removal the total is 15 + 5 − 4 = 16 mmol. Later V is 16 − 12 = 4 mmol.",
      "Subtract removed material before using conservation.",
    ),
    w(
      "b-equal",
      "Explain an equal-gas exception",
      "For 2HI(g) ⇌ H₂(g) + I₂(g), explain the equilibrium-position effect of decreasing pressure by increasing volume at fixed temperature.",
      "Both sides have two gaseous coefficients: 2 on the left and 1 + 1 on the right. Lower pressure favours neither side because the gaseous totals are equal, so the equilibrium position does not shift.",
      [
        "Count 2 gas coefficients on each side.",
        "Explain that neither side has more gaseous molecules.",
        "Conclude no equilibrium-position change, not no pressure change.",
      ],
    ),
    c(
      "b-evidence",
      "Compare two independent observations",
      "A changed run first reaches its final 0.3 mol/dm³ at the 3-minute sample. The control first reaches its final 0.6 mol/dm³ at the 9-minute sample. The changed run has…",
      "An earlier sampled plateau and lower final concentration",
      {
        "A later plateau and higher final concentration":
          "Compare 3 with 9 minutes and 0.3 with 0.6.",
        "The same final concentration because both reach equilibrium":
          "Different conditions can have different equilibrium compositions.",
      },
      "The arrival-time comparison and final-concentration comparison are distinct.",
      "Compare times and concentrations separately.",
    ),
  ],
];
export const reviewForms: Task[][] = [
  [
    n(
      "ra-atoms",
      "Retrieve atom accounting",
      "A supplied ammonia mixture contains 2 N₂ and 9 NH₃ molecules. How many nitrogen atoms are present?",
      13,
      "atoms",
      "2 × 2 + 9 = 13 nitrogen atoms.",
      "Count atoms per molecule.",
    ),
    c(
      "ra-pressure",
      "Retrieve expansion preference",
      "For the supplied gas equilibrium 2A(g) ⇌ 3B(g), lower pressure by expansion at fixed temperature favours…",
      "B formation",
      {
        "A formation":
          "Lower pressure favours the larger gas coefficient total.",
        "Neither side because there is one substance name per side":
          "The coefficients are 2 and 3.",
      },
      "Lower pressure favours the side with more gas molecules, 3B.",
      "Use coefficients rather than names.",
    ),
    w(
      "ra-partial",
      "Explain replenishment from new givens",
      "Removing product S from R ⇌ S lowers its amount from 2 to 1 mmol immediately. The supplied later equilibrium contains 1.6 mmol S. Explain the reaction direction and the extent of counteraction.",
      "Net forward reaction forms S, increasing its amount from 1 to 1.6 mmol. The later value remains below the original 2 mmol, so the reaction partly replenishes the removed product rather than exactly undoing removal.",
      [
        "Compare later with immediate amount.",
        "Identify forward formation of S.",
        "Compare later with the original amount to establish partial response.",
      ],
    ),
  ],
  [
    n(
      "rb-time",
      "Retrieve a sampled arrival",
      "Product readings at 0, 4, 8 and 12 minutes are 0, 0.2, 0.5 and 0.5 mol/dm³. What is the first sampled time at the continuing final plateau?",
      8,
      "min",
      "The final 0.5 begins at the 8-minute sample and remains at 12 minutes.",
      "Locate the first continuing final value.",
    ),
    c(
      "rb-temperature",
      "Retrieve cooling direction",
      "A forward reaction L ⇌ M is endothermic. Cooling favours…",
      "L formation by the exothermic reverse reaction",
      {
        "M formation by the endothermic forward reaction":
          "Cooling favours exothermic, not endothermic.",
        "No shift because slower reactions stop all equilibrium change":
          "A slower approach does not imply an unchanged equilibrium preference.",
      },
      "The reverse direction is exothermic, so cooling favours L.",
      "Reverse the supplied forward energy direction.",
    ),
    w(
      "rb-catalyst",
      "Explain the unchanged final state",
      "Explain why a catalyst can shorten the time to equilibrium without increasing equilibrium product yield at unchanged temperature and other conditions.",
      "The catalyst lowers activation energy for both forward and reverse reactions and accelerates both. This allows equilibrium to be reached sooner but leaves the equilibrium position and product yield unchanged at the same conditions.",
      [
        "Include both reaction directions.",
        "Link lower activation energy to shorter approach time.",
        "State unchanged position and yield at fixed conditions.",
      ],
    ),
  ],
];
const recovery: Record<string, string> = {
  "p-immediate": "r-inventory",
  "p-conserved": "r-atoms",
  "p-compression-written": "r-partial",
  "p-ammonia": "r-coefficients",
  "p-expansion": "r-coefficients",
  "p-equal": "r-equal",
  "p-unfamiliar-count": "r-coefficients",
  "p-phase": "r-coefficients",
  "p-pressure-written": "r-equal",
  "p-heat-endo": "r-heating",
  "p-cool-endo": "r-heating",
  "p-reversed": "r-heating",
  "p-temperature-written": "r-heating",
  "p-yield-rate-written": "r-rate",
  "p-add-product": "r-add",
  "p-remove-reactant": "r-remove",
  "p-add-account": "r-add",
  "p-removal-account": "r-remove",
  "p-colour": "r-add",
  "p-partial-written": "r-remove",
  "p-both-forward": "r-agree",
  "p-both-reverse": "r-agree",
  "p-neutral-pressure": "r-equal",
  "p-opposed-written": "r-opposed",
  "p-catalyst": "r-catalyst",
  "p-control-time": "r-plateau",
  "p-faster-less": "r-rate",
  "p-sampled": "r-plateau",
  "p-catalyst-written": "r-catalyst",
  "p-pressure-appearance": "r-coefficients",
};
for (const task of practice)
  task.followUp = "es-v1-" + recovery[task.id.slice(6)];
export const equilibriumShiftJourney: LessonJourney = {
  version: 1,
  introduction:
    "Distinguish an immediate change in conditions from the later equilibrium response. Count gas coefficients, use the supplied energy direction, and separate final composition from reaction speed.",
  scopeNote:
    "Higher-tier AQA Chemistry and Trilogy qualitative equilibrium changes, with limited Pearson comparison. Predict changes only from the stated equation, phase symbols, forward energy direction and controlled conditions. Compression and expansion comparisons keep temperature fixed; numerical later compositions and approach curves are supplied illustrative data, not exact yield predictions from a qualitative rule or a simulated kinetic mechanism. Molecule counts are schematic, while solution amounts are macroscopic mmol. The 3D scenes are stationary chemical inventories with fixed atom and bond sizes. Opposing simultaneous changes need additional data to determine the overall effect. A catalyst changes approach rates, not equilibrium composition at fixed conditions. Industrial Haber optimisation is treated separately. Observation interpretation does not instruct unsupervised chemical experimentation. Written reasoning is self-reviewed, not examiner-marked. This lesson does not certify complete board coverage or course exam readiness.",
  outcomes: [
    "Predict pressure responses using gaseous coefficients and phase symbols.",
    "Use the supplied forward energy direction to predict temperature response.",
    "Explain concentration edits and partial later counteraction.",
    "Distinguish immediate compression from subsequent net reaction and conserved atoms.",
    "Separate equilibrium composition from approach time and catalyst effects.",
    "Identify when simultaneous changes agree, oppose or supply insufficient information.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
};
export const equilibriumShiftAllTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const equilibriumShiftExposureFamilies: Record<string, string[]> = {
  gas: [
    "p-pressure-appearance",
    "w-gas",
    "g-compression",
    "g-pressure",
    "r-inventory",
    "r-partial",
    "r-coefficients",
    "r-atoms",
    "r-equal",
    "p-immediate",
    "p-conserved",
    "p-compression-written",
    "p-ammonia",
    "p-expansion",
    "p-equal",
    "p-unfamiliar-count",
    "p-phase",
    "p-pressure-written",
    "a-phase",
    "b-coefficients",
    "b-equal",
    "ra-atoms",
    "ra-pressure",
  ],
  energy: [
    "w-energy",
    "g-temperature",
    "r-heating",
    "r-rate",
    "p-heat-endo",
    "p-cool-endo",
    "p-reversed",
    "p-temperature-written",
    "p-yield-rate-written",
    "a-temperature",
    "b-temperature",
    "rb-temperature",
  ],
  concentration: [
    "g-concentration",
    "r-add",
    "r-remove",
    "p-add-product",
    "p-remove-reactant",
    "p-add-account",
    "p-removal-account",
    "p-colour",
    "p-partial-written",
    "a-add",
    "b-removal",
    "ra-partial",
  ],
  combined: [
    "g-combined",
    "r-opposed",
    "r-agree",
    "p-both-forward",
    "p-both-reverse",
    "p-neutral-pressure",
    "p-opposed-written",
    "a-conflict",
  ],
  evidence: [
    "g-evidence",
    "r-plateau",
    "p-control-time",
    "p-faster-less",
    "p-sampled",
    "b-evidence",
    "rb-time",
  ],
  catalyst: [
    "r-catalyst",
    "p-catalyst",
    "p-catalyst-written",
    "a-catalyst",
    "rb-catalyst",
  ],
};
