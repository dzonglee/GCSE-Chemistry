import { extendStatesWriting } from "./states-writing";
import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
const q = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  purpose: string,
  model?: TaskModel,
) => ({
  ...choice(
    `st-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    purpose,
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
  purpose: string,
  errors: Record<string, string> = {},
) => ({
  ...number(
    `st-v1-${id}`,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    purpose,
    errors,
  ),
  title,
});
const solid = q(
  "g-solid",
  "Inspect a solid",
  "How are particles arranged and moving in the shown crystalline solid?",
  "Close and regular; vibrating about fixed positions",
  {
    "Widely separated and completely still":
      "Particles in this model are close and continue moving.",
    "Close but continuously flowing past one another":
      "That is the liquid distinction, not fixed-position vibration.",
  },
  "Particles vibrate about fixed positions in the solid; they are not motionless. This crystalline model shows regular close arrangement, not every possible solid structure.",
  "Advance a frame and track the gold particle.",
  "Solid arrangement and actual illustrative vibration.",
  {
    kind: "state-properties",
    mode: "solid",
    instruction:
      "Predict arrangement and movement, then inspect a motion frame.",
  },
);
const liquidGas = q(
  "g-liquid-gas",
  "Compare liquid and gas",
  "What is the key particle distinction between a liquid and a gas?",
  "Liquid particles are close and move past one another; gas particles are widely spaced and move rapidly/randomly",
  {
    "Both have fixed particles with no motion":
      "Both phases have moving particles.",
    "Gas particles themselves become much larger":
      "Greater spacing is not growth of individual particles.",
  },
  "Liquid particles remain close and disordered while changing neighbours. Gas particles occupy available space with wide separations and rapid random movement. Circle size and particle count remain unchanged.",
  "Inspect both states and track the same gold particle.",
  "Liquid/gas movement and spacing kept distinct from particle size.",
  {
    kind: "state-properties",
    mode: "liquid-gas",
    instruction:
      "Predict the inspected state, then compare another motion frame.",
  },
);
const forecast = q(
  "g-forecast",
  "Predict a state from data",
  "For the initial −40 °C setting, substance X melts at −20 °C and boils at 60 °C at fixed pressure. What state is predicted?",
  "Solid",
  {
    Liquid: "−40 °C is below the melting point.",
    Gas: "It is far below the boiling point.",
  },
  "Below melting: solid; between melting and boiling: liquid; above boiling: gas. Exact thresholds are transition boundaries where two phases may coexist. X is an illustrative supplied pure substance.",
  "Compare signed temperature with both thresholds.",
  "Signed threshold prediction with equality cases.",
  {
    kind: "state-properties",
    mode: "forecast",
    instruction: "Predict a state, then change the supplied temperature.",
  },
);
const transition = q(
  "g-transition",
  "Follow a physical change",
  "For the initial melting change, what happens to energy transfer and particle chemical identity?",
  "Energy enters the substance; particle chemical identity is retained",
  {
    "Energy leaves while particles become a different element":
      "This reverses melting energy direction and invents a chemical change.",
    "Energy enters because each particle grows larger":
      "Individual particle size is not the cause of bulk state change.",
  },
  "Melting absorbs energy to overcome relevant attractions and allow particles to move past one another. Freezing and condensing transfer energy to the surroundings; boiling absorbs energy. These are physical changes.",
  "Compare before/after arrangement and the direction of energy transfer.",
  "Physical interconversion and conserved identity.",
  {
    kind: "state-properties",
    mode: "transition",
    instruction:
      "Predict energy direction and particle identity for the chosen change.",
  },
);
const written: LearningTask = {
  id: "st-v1-p-explain",
  title: "Explain melting without new atoms",
  prompt:
    "Explain melting of the supplied pure substance in terms of energy, forces, arrangement and movement. State what happens to particle chemical identity and individual size.",
  answer:
    "Energy enters the substance and overcomes relevant attractions holding particles in fixed positions. Particles remain close but can move past one another in the liquid. Their chemical identities and individual sizes do not change into new or larger particles. The relevant attractions depend on the material’s bonding and structure.",
  rubric: [
    "Energy transferred into the substance.",
    "Relevant attractions overcome rather than claiming every material has only weak intermolecular forces.",
    "Fixed-position vibration becomes close particles moving past one another.",
    "Particle identity/size retained; this is a physical change.",
  ],
  explanation:
    "The explanation links supplied energy and particle movement without inventing a chemical change.",
  hint: "Explain what changes between particles and what stays the same about them.",
  purpose: "Written physical-change explanation; self-review only.",
};
const compare: LearningTask = {
  id: "st-v1-p-compare",
  title: "Explain three bulk behaviours",
  prompt:
    "Use particles to explain why a solid has fixed shape, a liquid flows while retaining nearly fixed volume, and a gas fills the available container volume. Explain why saying solid particles do not move is wrong.",
  answer:
    "In a solid, close particles vibrate about fixed positions, retaining the bulk shape. Liquid particles are close but can move past one another, allowing flow with nearly fixed volume. Gas particles have large separations and move rapidly/randomly through the available space, so the gas takes the container’s shape and volume. Solid particles still vibrate.",
  rubric: [
    "Solid particles remain in fixed positions while vibrating.",
    "Liquid particles stay close and move past each other.",
    "Gas particles are widely spaced and move through available volume.",
    "Bulk behaviour follows arrangement/movement, not individual particles gaining bulk shape.",
  ],
  explanation:
    "Arrangement and movement explain bulk behaviour; single particles do not inherit the material’s bulk properties.",
  hint: "Compare position freedom and spacing in all three states.",
  purpose: "Written three-state comparison; self-review only.",
};
export const statesJourney: LessonJourney = {
  version: 1,
  introduction:
    "Track particles, predict states from signed temperature data and explain physical changes through arrangement, movement and energy.",
  scopeNote:
    "Common Foundation/combined states and state-symbol reasoning. Schematic particles may stand for atoms, ions or molecules in different materials; illustrative frames do not calculate real speed, pressure or forces. The explicitly labelled Higher model-limits task is extension work and is excluded from common reserved checks.",
  outcomes: [
    "Distinguish arrangement and movement in solid, liquid and gas.",
    "Use melting/boiling data including signed temperatures and exact transition boundaries.",
    "Explain heating/cooling interconversions with conserved particle identity.",
    "Distinguish bulk properties from individual-particle properties and (l) from (aq).",
  ],
  warmup: [
    q(
      "w-identity",
      "Recall a physical change",
      "When unchanged molecules physically move farther apart, what must remain the same?",
      "Their chemical identity",
      {
        "They must become new elements":
          "Physical separation does not change nuclei or composition.",
        "Their atoms must all grow larger":
          "Spacing is not individual atom size.",
      },
      "Physical state changes do not create a new substance.",
      "Separate chemical composition from arrangement.",
      "Prerequisite physical-change retrieval.",
    ),
    q(
      "w-matter",
      "Recall gas as matter",
      "Is a gas matter even when you cannot see it?",
      "Yes: it has mass and occupies space",
      {
        "No: only visible solids have mass":
          "Visibility does not determine whether something is matter.",
        "No: gases never occupy volume":
          "A gas occupies the available container volume.",
      },
      "Gases are matter, just as solids and liquids are.",
      "Use mass and occupied space rather than visibility.",
      "Prerequisite matter/property retrieval.",
    ),
  ],
  refresher: [
    q(
      "r-solid",
      "Solid particles still move",
      "What motion occurs in a crystalline solid?",
      "Vibration about fixed positions",
      {
        "Absolutely no particle movement": "Particles are not motionless.",
        "Continuous flow past neighbouring particles":
          "That is a liquid-style freedom.",
      },
      "Close regularly arranged particles vibrate without continuously exchanging positions.",
      "Separate fixed average position from no movement.",
      "Targeted solid movement recovery.",
    ),
    q(
      "r-spacing",
      "Spacing is not particle size",
      "What changes when the same sample becomes a gas?",
      "Particles become much farther apart; individual particle sizes remain unchanged",
      {
        "Every particle grows into a larger sphere":
          "Bulk expansion is not growth of atoms or molecules.",
        "Half the particles disappear":
          "Particle count is retained in the closed sample.",
      },
      "Greater spacing explains bulk expansion; count and identity stay the same.",
      "Compare the space between particles.",
      "Targeted spacing/conservation recovery.",
    ),
    q(
      "r-data",
      "Compare two thresholds",
      "X melts at −20 °C and boils at 60 °C. What state is predicted at 0 °C at fixed pressure?",
      "Liquid",
      { Solid: "0 is above −20.", Gas: "0 is below 60." },
      "0 lies between melting and boiling. At the exact thresholds, a transition can involve two phases.",
      "Order the three signed temperatures.",
      "Targeted supplied-data recovery.",
    ),
    q(
      "r-energy",
      "Track heating and cooling",
      "Which energy directions fit melting and freezing?",
      "Melting absorbs energy; freezing transfers energy to the surroundings",
      {
        "Both necessarily absorb energy":
          "Freezing releases energy to the surroundings.",
        "Both necessarily make larger particles":
          "The individual particles do not grow.",
      },
      "At a pure-substance transition, added energy changes arrangement by overcoming attractions; temperature can remain constant until the transition is complete.",
      "Identify the substance and its surroundings.",
      "Targeted energy-direction recovery.",
    ),
    q(
      "r-symbol",
      "Liquid or aqueous?",
      "What is the state symbol for a molten substance?",
      "(l)",
      {
        "(aq)": "Aqueous means dissolved in water, not merely liquid.",
        "(s)": "Molten means the substance is liquid.",
      },
      "Use (s), (l), (g) for physical states; (aq) means an aqueous solution.",
      "Distinguish molten from dissolved.",
      "Targeted state-symbol recovery.",
    ),
  ],
  guided: [solid, liquidGas, forecast, transition],
  practice: [
    q(
      "p-solid",
      "Recognise the solid drawing",
      "Which description fits the supplied particle pattern?",
      "Close regular particles vibrating about fixed positions",
      {
        "Particles are necessarily motionless":
          "The snapshot does not mean motion stops.",
        "Widely spaced particles filling all available volume":
          "The supplied pattern is a close ordered group.",
      },
      "This is the simple crystalline-solid model; movement is vibration, not continuous flow.",
      "Read arrangement separately from movement.",
      "Independent solid recognition.",
    ),
    q(
      "p-liquid",
      "Recognise a liquid drawing",
      "Which description fits the supplied close disordered particles?",
      "A liquid: particles can move past one another",
      {
        "A solid with completely motionless particles":
          "Close disorder and flow fit this supplied liquid model.",
        "A gas whose particles have grown larger":
          "The circles do not change size.",
      },
      "Liquid particles remain close while positions/neighbours can change.",
      "Compare closeness with freedom to move.",
      "Independent liquid recognition.",
    ),
    q(
      "p-gas",
      "Recognise the gas drawing",
      "Why does the supplied gas occupy the available container volume?",
      "Widely spaced moving particles spread through available space",
      {
        "Each particle has the whole container’s shape":
          "Bulk shape is not a single-particle property.",
        "There is no particle movement": "Gas particles move rapidly/randomly.",
      },
      "The gas takes the container’s volume because particles move through available space.",
      "Use movement and spacing together.",
      "Independent gas bulk behaviour.",
    ),
    q(
      "p-size",
      "Explain bulk expansion",
      "A sample expands on becoming a gas. What is the particle explanation?",
      "More space between particles, not larger individual particles",
      {
        "Every atom becomes physically much larger":
          "This confuses spacing with particle size.",
        "The number of protons doubles":
          "A physical change does not alter nuclei.",
      },
      "Particle identity and size are retained; separation increases.",
      "Compare centres and radii separately.",
      "Independent expansion misconception.",
    ),
    n(
      "p-conserve",
      "Conserve particles in a closed sample",
      "A closed sample contains 12 unchanged molecules before a physical state change. How many molecules remain afterward?",
      12,
      "molecules",
      "Physical change preserves these 12 unchanged molecules in the closed sample.",
      "No molecules enter, leave or react.",
      "Independent conservation transfer.",
      { "24": "A change of state does not duplicate molecules." },
    ),
    q(
      "p-between",
      "Predict between thresholds",
      "X melts at −20 °C and boils at 60 °C at fixed pressure. Predict its state at 30 °C.",
      "Liquid",
      {
        Solid: "30 exceeds the melting threshold.",
        Gas: "30 remains below the boiling threshold.",
      },
      "−20 < 30 < 60, so the pure substance is liquid under the supplied conditions.",
      "Compare with both temperatures.",
      "Independent intermediate state prediction.",
    ),
    q(
      "p-below",
      "Predict a negative temperature",
      "X melts at −20 °C and boils at 60 °C. Predict its state at −30 °C at fixed pressure.",
      "Solid",
      {
        Liquid: "−30 is below −20, not above it.",
        Gas: "It is also below the boiling point.",
      },
      "−30 < −20, so it is below melting.",
      "Place negative values on a number line.",
      "Independent signed comparison.",
    ),
    q(
      "p-above",
      "Predict above boiling",
      "X melts at −20 °C and boils at 60 °C. Predict its state at 80 °C at fixed pressure.",
      "Gas",
      {
        Liquid: "80 is above the boiling threshold.",
        Solid: "It is above both thresholds.",
      },
      "80 > 60, so the supplied pure substance is gas.",
      "Compare with boiling.",
      "Independent upper interval prediction.",
    ),
    q(
      "p-melt-boundary",
      "Handle exact melting",
      "At exactly X’s −20 °C melting point at fixed pressure, what is the correct boundary statement?",
      "Solid and liquid may coexist; temperature alone does not give their proportions",
      {
        "It must instantly be 100% liquid in every situation":
          "Temperature alone does not tell how far the transition has progressed.",
        "It must be gas": "The boiling threshold is 60 °C.",
      },
      "A pure-substance transition can have both phases at the threshold; energy/progression determines the amount of each.",
      "Avoid assigning a fraction from temperature alone.",
      "Independent equality-case reasoning.",
    ),
    q(
      "p-boil-boundary",
      "Handle exact boiling",
      "At exactly X’s 60 °C boiling point at fixed pressure, what is the correct boundary statement?",
      "Liquid and gas may coexist; proportions are not determined by temperature alone",
      {
        "All particles must disappear":
          "Particles remain present through the physical change.",
        "It must still be solid": "The melting point is −20 °C.",
      },
      "Liquid/gas coexistence is possible at the supplied transition point.",
      "Distinguish a transition boundary from a whole interval.",
      "Independent upper equality case.",
    ),
    q(
      "p-melt-freeze",
      "Name two reverse changes",
      "Name solid → liquid and liquid → solid.",
      "Melting and freezing",
      {
        "Boiling and condensing": "Those are liquid/gas interconversions.",
        "Melting and chemical decomposition":
          "Freezing is a physical reverse change.",
      },
      "Melting and freezing occur at the same pure-substance transition temperature under the same pressure.",
      "Follow the start and end states.",
      "Independent lower interconversion names.",
    ),
    q(
      "p-boil-condense",
      "Name liquid/gas changes",
      "Name liquid → gas during boiling and gas → liquid.",
      "Boiling and condensing",
      {
        "Freezing and melting": "Those link liquid and solid.",
        "Boiling and creation of a new element":
          "Condensing retains chemical identity.",
      },
      "Boiling/condensing connect liquid and gas and are physical changes.",
      "Follow the direction arrows.",
      "Independent upper interconversion names.",
    ),
    q(
      "p-energy",
      "Match energy direction",
      "Which pair describes boiling and condensing?",
      "Boiling absorbs energy; condensing transfers energy to the surroundings",
      {
        "Both require particle growth":
          "Individual size does not explain the changes.",
        "Boiling releases and condensing absorbs energy":
          "This reverses the supplied directions.",
      },
      "Heating changes overcome attractions; the reverse changes transfer energy out of the substance.",
      "State the reference substance and surroundings.",
      "Independent energy-direction transfer.",
    ),
    q(
      "p-plateau",
      "Energy during melting",
      "Why can the temperature remain constant while a pure substance melts, despite continued energy input?",
      "Energy overcomes relevant attractions and changes arrangement during the transition",
      {
        "Added energy must enlarge each atom":
          "Particle size does not grow this way.",
        "No energy is entering":
          "Energy can enter without increasing temperature during the transition.",
      },
      "During the transition, energy changes particle separation/arrangement rather than necessarily increasing temperature.",
      "Distinguish a temperature rise from the energy used in a phase change.",
      "Independent transition-energy explanation.",
    ),
    q(
      "p-forces",
      "Compare attraction strength",
      "For comparable supplied structures, why can stronger attractions require a higher state-change temperature?",
      "More energy is needed to overcome the stronger attractions",
      {
        "Strong attractions always need no energy":
          "Overcoming stronger attraction requires energy.",
        "Particle identity must change into another element":
          "The comparison concerns physical state change.",
      },
      "Relate force strength to energy, using the actual bonding/structure rather than assuming only weak molecular forces.",
      "Name the energy requirement.",
      "Independent strength/energy relation.",
    ),
    q(
      "p-molten",
      "Use the molten state symbol",
      "What state symbol represents molten sodium chloride?",
      "(l)",
      {
        "(aq)": "Aqueous means dissolved in water.",
        "(s)": "Molten means liquid.",
      },
      "A molten substance is liquid, so use (l).",
      "Separate melting from dissolving.",
      "Independent state-symbol demand from the actual paired exam requirement.",
    ),
    q(
      "p-aqueous",
      "Interpret an aqueous symbol",
      "What does (aq) mean in a chemical equation?",
      "The substance is dissolved in water",
      {
        "Every liquid regardless of solvent":
          "(l) is the physical liquid symbol.",
        "The substance is a gas": "The gas symbol is (g).",
      },
      "An aqueous solution is a water-based solution.",
      "Read aqueous rather than merely liquid.",
      "Independent solution/state distinction.",
    ),
    q(
      "p-bulk",
      "Avoid bulk properties for one particle",
      "Can a single atom itself have the bulk property of flowing as a liquid sample?",
      "No: liquid behaviour is a collective bulk property",
      {
        "Yes: every atom has a liquid container shape":
          "Single particles do not acquire the bulk sample shape.",
        "No: real atoms do not exist":
          "Atoms exist; the issue is the property’s scale.",
      },
      "Flow, fixed bulk shape and similar material properties arise from many particles and their interactions.",
      "Distinguish a particle from a macroscopic sample.",
      "Independent particle/bulk distinction.",
    ),
    q(
      "p-higher-limits",
      "Higher: what spheres omit",
      "Higher extension: why can a solid-sphere particle diagram alone fail to explain different melting points?",
      "It omits relevant forces and represents all particles as solid spheres",
      {
        "The diagram proves that no real forces exist":
          "Forces omitted from a model can still exist in the substance.",
        "Every drawn sphere proves each atom is a bulk solid":
          "Particle representation does not assign bulk solid properties.",
      },
      "AQA Higher limitations include omitted forces and solid-sphere representation. Real particles/bonding are more varied; model omissions are not proof of absent forces.",
      "Explain what the model leaves out.",
      "Explicitly Higher-only model-limits extension; excluded from common checks.",
    ),
    written,
    compare,
  ],
  checkForms: [
    [
      q(
        "ca-solid",
        "Retrieve solid movement",
        "Which movement occurs in the simple solid model?",
        "Vibration about fixed positions",
        {
          "Absolutely no motion": "Solid particles still vibrate.",
          "Continuous flow past neighbours":
            "That is not the solid movement model.",
        },
        "Fixed positions do not mean zero motion.",
        "Recall movement, not a still image.",
        "Reserved solid movement.",
      ),
      q(
        "ca-data",
        "Apply unfamiliar supplied data",
        "Y melts at −10 °C and boils at 30 °C at fixed pressure. Predict its state at 5 °C.",
        "Liquid",
        { Solid: "5 is above −10.", Gas: "5 is below 30." },
        "−10 < 5 < 30, so Y is liquid.",
        "Use this supplied dataset, not X’s values.",
        "Reserved unfamiliar state transfer.",
      ),
      q(
        "ca-cooling",
        "Retrieve a cooling change",
        "What happens during freezing of the supplied substance?",
        "Liquid becomes solid and energy transfers to the surroundings",
        {
          "Solid becomes gas and absorbs energy": "That is not freezing.",
          "The substance necessarily changes into a new element":
            "The change is physical.",
        },
        "Freezing reverses melting.",
        "Track direction and energy.",
        "Reserved physical/energy retrieval.",
      ),
      q(
        "ca-size",
        "Retrieve bulk expansion",
        "When the same particles occupy a larger gas volume, what changes?",
        "Spacing increases while individual particle size remains unchanged",
        {
          "Every particle grows to fill the container":
            "Spacing is not atom size.",
          "The particles must vanish": "They remain present.",
        },
        "Expansion concerns distances between particles.",
        "Compare spacing and radius separately.",
        "Reserved size/spacing distinction.",
      ),
      q(
        "ca-symbol",
        "Retrieve a molten symbol",
        "Which state symbol means liquid, including a molten substance?",
        "(l)",
        { "(aq)": "That means dissolved in water.", "(g)": "That means gas." },
        "Use (l) for the liquid state.",
        "Recall the state-symbol distinction.",
        "Reserved molten-state retrieval.",
      ),
    ],
    [
      q(
        "cb-liquid",
        "Recognise a new particle pattern",
        "Which state matches the supplied close disordered particle drawing?",
        "Liquid",
        {
          "A motionless solid":
            "The pattern is close and disordered; liquid particles can move past neighbours.",
          "A gas with widely separated particles":
            "That does not fit the supplied closeness.",
        },
        "Close disordered particles support this liquid model.",
        "Read arrangement and movement.",
        "Alternative reserved diagram recognition.",
      ),
      q(
        "cb-boundary",
        "Transfer an equality case",
        "Y melts at −10 °C and boils at 30 °C. At exactly −10 °C under the supplied fixed pressure, what can be stated?",
        "Solid and liquid may coexist; the temperature does not establish proportions",
        {
          "It is necessarily exactly 50% solid":
            "Temperature alone does not supply a fraction.",
          "It must be gas":
            "This is the melting boundary, not the boiling boundary.",
        },
        "A transition boundary is different from being strictly above or below a threshold.",
        "Check equality, then avoid an invented fraction.",
        "Alternative reserved boundary transfer.",
      ),
      q(
        "cb-heat",
        "Retrieve boiling energy",
        "What is the energy direction during boiling of the supplied liquid?",
        "Energy enters the substance",
        {
          "Energy only leaves the substance":
            "That describes the reverse cooling change.",
          "Atoms must expand in size": "Particle size is retained.",
        },
        "Energy is supplied to overcome attractions.",
        "Track the reference substance.",
        "Alternative reserved heating mechanism.",
      ),
      q(
        "cb-bulk",
        "Retrieve scale of properties",
        "Why should the material’s liquid flow not be assigned to one atom?",
        "It is a collective property of many interacting particles",
        {
          "An atom must take the container’s shape":
            "That is a bulk sample property.",
          "It proves all particles are solid balls":
            "The representation is schematic.",
        },
        "Particles and macroscopic material properties are different scales.",
        "Separate one particle from many.",
        "Alternative reserved bulk reasoning.",
      ),
      q(
        "cb-aqueous",
        "Retrieve a solution symbol",
        "What does (aq) indicate?",
        "Dissolved in water",
        {
          "Any molten pure substance": "Molten uses (l).",
          "Always a gas": "Gas uses (g).",
        },
        "Aqueous means a water-based solution.",
        "Recall the solvent context.",
        "Alternative reserved symbol distinction.",
      ),
    ],
  ],
  reviewForms: [
    [
      q(
        "ra-solid",
        "Retrieve after the delay",
        "How do particles move in the simple crystalline-solid model?",
        "They vibrate about fixed positions",
        {
          "They do not move at all": "Vibration continues.",
          "They all flow past one another": "That is liquid-style movement.",
        },
        "Fixed average positions coexist with vibration.",
        "Recall the tracked particle.",
        "Delayed movement retrieval.",
      ),
      q(
        "ra-data",
        "Retrieve a new interval",
        "Z melts at −5 °C and boils at 45 °C at fixed pressure. Predict its state at 20 °C.",
        "Liquid",
        { Solid: "20 exceeds −5.", Gas: "20 remains below 45." },
        "The supplied temperature lies between both thresholds.",
        "Compare this dataset’s values.",
        "Delayed unfamiliar data transfer.",
      ),
      q(
        "ra-symbol",
        "Retrieve the liquid symbol",
        "What state symbol represents a molten substance?",
        "(l)",
        {
          "(aq)": "Aqueous means dissolved in water.",
          "(s)": "Molten is not solid.",
        },
        "Melting yields the liquid state.",
        "Distinguish melting and dissolving.",
        "Delayed molten-state retrieval.",
      ),
    ],
    [
      q(
        "rb-spacing",
        "Retrieve gas expansion",
        "Why can the gas occupy more volume without changing its particle identities?",
        "There is much more space between particles",
        {
          "Each atom changes into a larger element":
            "Nuclei/chemical identities are retained.",
          "Every particle disappears": "They remain in the sample.",
        },
        "Spacing changes, not individual atom size.",
        "Compare distances rather than radii.",
        "Alternative delayed expansion retrieval.",
      ),
      q(
        "rb-condense",
        "Retrieve reverse change",
        "What is condensing?",
        "Gas becomes liquid and transfers energy to the surroundings",
        {
          "Liquid becomes gas while energy enters":
            "That is the reverse change.",
          "A physical change creates a new element":
            "Condensing retains chemical identity.",
        },
        "Condensing is a cooling physical change.",
        "Follow direction and energy.",
        "Alternative delayed interconversion.",
      ),
      q(
        "rb-boundary",
        "Retrieve an upper boundary",
        "Z boils at 45 °C at fixed pressure. What is possible at exactly 45 °C?",
        "Liquid and gas may coexist; fractions need further information",
        {
          "It must be exactly half liquid": "No phase fraction is supplied.",
          "Every atom becomes bigger":
            "Particle sizes do not cause the transition.",
        },
        "The transition temperature alone does not specify proportions.",
        "Treat equality separately from the interval above boiling.",
        "Alternative delayed equality reasoning.",
      ),
    ],
  ],
};
const learning = [
  ...statesJourney.warmup,
  ...statesJourney.refresher,
  ...statesJourney.guided,
  ...statesJourney.practice,
];
for (const task of learning) {
  if (
    task.id.includes("symbol") ||
    task.id.includes("molten") ||
    task.id.includes("aqueous")
  )
    task.followUp = "st-v1-r-symbol";
  else if (
    task.id.includes("data") ||
    task.id.includes("forecast") ||
    task.id.includes("between") ||
    task.id.includes("below") ||
    task.id.includes("above") ||
    task.id.includes("boundary")
  )
    task.followUp = "st-v1-r-data";
  else if (
    task.id.includes("energy") ||
    task.id.includes("force") ||
    task.id.includes("plateau") ||
    task.id.includes("transition") ||
    task.id.includes("explain")
  )
    task.followUp = "st-v1-r-energy";
  else if (task.id.includes("solid")) task.followUp = "st-v1-r-solid";
  else task.followUp = "st-v1-r-spacing";
}
for (const task of [
  ...statesJourney.practice,
  ...statesJourney.checkForms.flat(),
]) {
  if (task.id === "st-v1-p-solid") task.stateParticleDiagram = "solid";
  if (["st-v1-p-liquid", "st-v1-cb-liquid"].includes(task.id))
    task.stateParticleDiagram = "liquid";
  if (task.id === "st-v1-p-gas") task.stateParticleDiagram = "gas";
}

extendStatesWriting(statesJourney);
