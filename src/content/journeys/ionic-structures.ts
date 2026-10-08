import { extendIonicStructureWriting } from "./ionic-structure-writing";
import type { LearningTask, LessonJourney } from "../types";
import { choice } from "./helpers";
const q = (
  id: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
): LearningTask =>
  choice(
    `is-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    `Ionic structure and property reasoning: ${id}.`,
  );
const lattice = q(
  "g-lattice",
  "Inspect an interior ion of solid sodium chloride. How many nearest opposite ions surround it?",
  "Six, arranged in three dimensions",
  {
    "Four, all in a flat plane":
      "This misses the neighbours in front and behind.",
    "One, as an isolated NaCl molecule":
      "The crystal is a giant repeating lattice, not separate NaCl molecules.",
  },
  "Each interior ion of this sodium chloride structure has six nearest neighbours of opposite charge. Attraction acts in all directions. This coordination number is not universal for all ionic compounds.",
  "Rotate the fragment; inspect both sides of three perpendicular directions.",
);
lattice.title = "Look beyond the front layer";
lattice.openingHint = true;
lattice.model = {
  kind: "ionic-lattice",
  instruction:
    "Select an interior ion; predict its nearest opposite neighbours.",
};
const solid = q(
  "g-solid",
  "Predict whether solid sodium chloride conducts, and explain the charged particles.",
  "No: its charged ions are fixed in lattice positions",
  {
    "Yes: any charged ion can carry current while fixed":
      "Charge must be able to move through the substance.",
    "No: the solid has no charged particles":
      "Na⁺ and Cl⁻ are still charged in the solid.",
  },
  "Solid sodium chloride contains ions, but those ions cannot move freely through the lattice. It does not conduct electricity.",
  "Distinguish having charge from carrying charge through a substance.",
);
solid.title = "Charged does not mean mobile";
solid.model = {
  kind: "ionic-conduction",
  phase: "solid",
  instruction:
    "Predict conductivity AND the particle explanation for solid NaCl.",
};
const molten = q(
  "g-molten",
  "What carries charge through molten sodium chloride?",
  "Mobile sodium and chloride ions",
  {
    "Delocalised electrons like a metal":
      "Molten salt conducts by ion movement, not free electrons.",
    "Neutral NaCl molecules moving as pairs":
      "The liquid contains charged ions, not isolated neutral NaCl molecules.",
  },
  "Melting breaks down the fixed regular arrangement. Charged sodium and chloride ions can move through the liquid and carry current.",
  "The particles remain ions after melting.",
);
molten.title = "Explain the molten change";
molten.model = {
  kind: "ionic-conduction",
  phase: "molten",
  instruction:
    "Predict conductivity AND the carrier explanation for molten NaCl.",
};
const solution = q(
  "g-solution",
  "Sodium chloride has dissolved in water. Why can the solution conduct?",
  "Dissolved charged ions can move through the water",
  {
    "Water turns every ion into a neutral atom":
      "Dissolved sodium and chloride particles remain ions.",
    "The ions remain locked in a solid lattice":
      "Dissolution separates ions from that fixed lattice.",
  },
  "Sodium chloride supplies mobile Na⁺ and Cl⁻ ions when dissolved in water. This example does not imply that all ionic compounds are soluble.",
  "Ask which charged particles can move in the solution.",
);
solution.title = "Follow the dissolved ions";
solution.model = {
  kind: "ionic-conduction",
  phase: "solution",
  instruction:
    "Predict conductivity AND the carrier explanation for dissolved NaCl.",
};
const slice = q(
  "p-slice",
  "Deduce the simplest sodium-to-chloride ratio and formula from this finite lattice slice.",
  "1:1, NaCl",
  {
    "8:8, Na₈Cl₈ molecules":
      "Eight of each reduces to 1:1; this is not a molecular structure.",
    "1:2, NaCl₂": "Count both ion types rather than infer a different ratio.",
  },
  "The slice contains eight sodium and eight chloride ions. The simplest ratio is 1:1, giving NaCl; the lattice extends in three dimensions.",
  "Count both species and simplify their ratio.",
);
slice.title = "Read a formula from a slice";
slice.ionicSlice = true;
const written: LearningTask = {
  id: "is-v1-p-explain",
  title: "Explain two linked properties",
  prompt:
    "Explain why sodium chloride has a high melting point but conducts only when molten or dissolved, rather than as a solid.",
  answer:
    "Strong electrostatic attraction between opposite ions needs much energy to overcome. Ions are fixed in the solid but mobile when molten or dissolved, so charge can flow.",
  explanation:
    "Link high melting point to energy overcoming strong ionic attractions, then conductivity to movement of charged ions. Do not substitute moving electrons or uncharged solid particles.",
  hint: "Name the particles, forces, energy demand and change in mobility.",
  purpose:
    "Construct independent causal explanations linking lattice forces and charge transport.",
  rubric: [
    "Strong electrostatic attractions between oppositely charged ions throughout a giant lattice",
    "Much energy is needed to overcome these attractions on melting",
    "Ions are fixed in the solid and cannot carry charge through it",
    "Molten or dissolved ions can move and carry charge",
  ],
};
export const ionicStructuresJourney: LessonJourney = {
  version: 1,
  introduction:
    "Look beyond isolated ion pairs: interpret a repeating 3D lattice, then explain how strong attractions and ion movement determine its properties.",
  warmup: [
    q(
      "w-charge",
      "Which particles attract in an ionic bond?",
      "Oppositely charged ions",
      {
        "Two neutral atoms only": "Ionic attraction involves charged ions.",
        "Two positive ions": "Like charges repel.",
      },
      "Opposite charges attract electrostatically.",
      "Retrieve the force, not just the transfer step.",
    ),
    q(
      "w-ratio",
      "A compound contains Na⁺ and Cl⁻ ions. Which ratio balances charge?",
      "One of each",
      {
        "Two sodium ions for each chloride":
          "That gives a net positive charge.",
        "One sodium ion for two chlorides": "That gives a net negative charge.",
      },
      "Equal numbers of singly charged opposite ions balance total charge.",
      "Add the signed charges.",
    ),
  ],
  refresher: [
    q(
      "r-giant",
      "What does giant ionic lattice mean?",
      "A repeating 3D arrangement of ions",
      {
        "One large NaCl molecule":
          "There are no separate NaCl molecules in the crystal.",
        "A flat layer with no depth":
          "The arrangement continues through three dimensions.",
      },
      "The regular structure repeats through the crystal.",
      "Think beyond a drawing's page.",
    ),
    q(
      "r-force",
      "What links ionic attraction to a high melting point?",
      "Much energy is needed to overcome strong attractions",
      {
        "Only weak forces need little energy":
          "This does not explain a high melting point.",
        "Each ion must become an uncharged atom":
          "Melting does not neutralise the ions.",
      },
      "Strong electrostatic attractions require substantial energy to overcome.",
      "Connect force strength to energy demand.",
    ),
    q(
      "r-solid",
      "Are sodium chloride ions uncharged in the solid?",
      "No: they are charged but fixed in place",
      {
        "Yes: otherwise the solid would conduct":
          "Conductivity also requires particle movement.",
        "No: they are free electrons": "Ions are charged atoms, not electrons.",
      },
      "Charge is present but not mobile through the lattice.",
      "Separate charge and mobility.",
    ),
    q(
      "r-mobile",
      "Which carriers explain molten ionic conduction?",
      "Mobile charged ions",
      {
        "Mobile neutral molecules":
          "Neutral movement alone cannot carry net charge.",
        "Delocalised electrons":
          "That describes metallic conduction, not this salt.",
      },
      "Ions carry charge when they can move.",
      "Name the charged particles.",
    ),
    q(
      "r-limits",
      "What is a limitation of a finite 2D lattice diagram?",
      "It omits depth and the rest of the crystal",
      {
        "It proves the actual crystal is flat":
          "The diagram flattens a 3D structure.",
        "It proves every ion is the printed colour":
          "Colours identify species, not bulk appearance.",
      },
      "Representations simplify the extended 3D structure.",
      "Distinguish the model from the substance.",
    ),
  ],
  guided: [lattice, solid, molten, solution],
  practice: [
    slice,
    q(
      "p-classify",
      "A solid has regularly alternating + and − ions extending in three dimensions. Which structure fits?",
      "Giant ionic",
      {
        "Simple molecular":
          "The described charged repeating lattice is not separate molecules.",
        "A collection of neutral noble-gas atoms":
          "Those are not alternating opposite ions.",
      },
      "Charged ions in an extended regular array identify a giant ionic structure.",
      "Use particle identity and extent.",
    ),
    q(
      "p-all-directions",
      "Why is calling each neighbouring Na⁺/Cl⁻ pair a separate NaCl molecule misleading?",
      "Each ion interacts with surrounding ions throughout the lattice",
      {
        "Only its original electron donor can attract it":
          "Electrostatic attraction is not restricted by the electron's origin.",
        "Ions are neutral after forming the solid":
          "The ions retain their charges.",
      },
      "Attraction acts in all directions; a formula gives a ratio, not an isolated pair.",
      "Use the 3D environment of an interior ion.",
    ),
    q(
      "p-melting",
      "Explain the high melting point of an ionic solid.",
      "Much energy overcomes strong attractions between opposite ions",
      {
        "Little energy breaks weak forces between NaCl molecules":
          "This invents molecules and weak intermolecular forces.",
        "Covalent shared pairs between every sodium and chlorine atom break":
          "The bonding here is ionic attraction.",
      },
      "Many strong ionic attractions require substantial energy to overcome.",
      "Name the correct force and particles.",
    ),
    q(
      "p-solid-error",
      "A student says solid salt does not conduct because its ions have no charge. What repairs the explanation?",
      "The ions are charged but cannot move freely through the solid",
      {
        "The ions are neutral until a battery is connected":
          "The ions are already charged.",
        "The solid contains no particles": "A solid still contains particles.",
      },
      "The missing condition is mobility, not charge.",
      "Ask what a carrier must do.",
    ),
    q(
      "p-molten-error",
      "Which explanation should be rejected for molten sodium chloride conductivity?",
      "Delocalised electrons flow through the molten salt",
      {
        "Sodium ions can move": "Moving charged sodium ions can carry current.",
        "Chloride ions can move":
          "Moving charged chloride ions can also carry current.",
      },
      "Both kinds of ion move and carry charge. The exam explanation is not delocalised electrons.",
      "Distinguish ionic and metallic carriers.",
    ),
    q(
      "p-solution-limit",
      "Does sodium chloride solution conducting prove every ionic compound dissolves in water?",
      "No: conduction of a solution does not prove universal solubility",
      {
        "Yes: all ionic lattices dissolve equally":
          "Solubility differs among ionic compounds.",
        "Yes: the solution must be pure liquid salt":
          "An aqueous solution contains water.",
      },
      "If an ionic compound dissolves, its mobile ions can conduct; not every ionic compound is soluble.",
      "Separate a conditional property from an absolute claim.",
    ),
    q(
      "p-evidence",
      "A supplied substance has high melting point, does not conduct when solid, and conducts when molten. Which explanation best fits?",
      "A giant ionic solid with mobile ions after melting",
      {
        "A solid with mobile ions in every state":
          "That would not explain the non-conducting solid.",
        "Neutral molecules carry the current when molten":
          "Neutral molecules do not provide these charged carriers.",
      },
      "The combined evidence is consistent with strong ionic attractions and state-dependent ion mobility; one property alone is less informative.",
      "Account for all three observations.",
    ),
    q(
      "p-size",
      "A ball-and-stick lattice drawing leaves gaps between coloured spheres. What can you safely conclude?",
      "The representation simplifies positions and uses illustrative sizes",
      {
        "Real ionic solids contain exactly those empty gaps and colours":
          "The visual aids are not measured dimensions or bulk colour.",
        "Every stick must be a shared electron pair":
          "A lattice guide is not a covalent shared pair.",
      },
      "Models can represent positions without being to scale or depicting every force.",
      "Read the representation's limitations.",
    ),
    q(
      "p-six-limit",
      "An interior NaCl ion has six nearest opposite neighbours. Must every ionic compound have six?",
      "No: different ionic structures can have different arrangements",
      {
        "Yes: six defines all ionic bonding":
          "Ionic bonding is electrostatic attraction, not a universal count.",
        "No: sodium chloride is not ionic":
          "NaCl is the specified ionic example.",
      },
      "Use the familiar NaCl structure without extending its exact geometry to all compounds.",
      "Separate bonding definition from one structure.",
    ),
    written,
  ],
  checkForms: [
    [
      q(
        "ca-force",
        "Why does a giant ionic lattice generally need much energy to melt?",
        "Strong electrostatic attractions between opposite ions",
        {
          "Weak forces between separate NaCl molecules":
            "The crystal is not made of those molecules.",
          "The ions have no attraction": "Opposite ions attract strongly.",
        },
        "Energy must overcome strong lattice attractions.",
        "Link force and energy.",
      ),
      q(
        "ca-solid",
        "A solid ionic sample does not conduct. Which ion explanation is valid?",
        "Its charged ions are fixed in place",
        {
          "Its ions are uncharged": "Ions have charge by definition.",
          "Its ions move freely but cannot carry charge":
            "Mobile charged ions can carry current.",
        },
        "Fixed positions prevent ion transport through the solid.",
        "Identify the missing mobility.",
      ),
      q(
        "ca-liquid",
        "The same sample conducts when molten. What moves to carry charge?",
        "Charged ions",
        {
          "Delocalised electrons": "Not the explanation for ionic conduction.",
          "Only neutral molecules": "They do not carry the required charge.",
        },
        "Melting permits charged ion movement.",
        "Keep the particle identity.",
      ),
      q(
        "ca-model",
        "A flat NaCl drawing ends at its edge. Which limitation should you state?",
        "The 3D repeating crystal extends beyond the drawing",
        {
          "The real crystal must end at that printed edge":
            "The illustration is a fragment.",
          "Its ions cannot attract out of the page":
            "Attraction acts in three dimensions.",
        },
        "The drawing omits extent and depth.",
        "Separate representation from crystal.",
      ),
    ],
    [
      q(
        "cb-structure",
        "Which description identifies an ionic crystal?",
        "A giant regular arrangement of positive and negative ions",
        {
          "Separate uncharged two-atom molecules only":
            "That is not a giant ionic array.",
          "Only freely moving electrons, no ions":
            "An ionic crystal contains ions.",
        },
        "An extended regular ion arrangement is a lattice.",
        "Name its particles and extent.",
      ),
      q(
        "cb-boiling",
        "Why do ionic compounds generally have high boiling points?",
        "Much energy is needed to overcome strong ionic attractions",
        {
          "Their NaCl molecules have weak attractions":
            "This invents molecular particles in the lattice.",
          "Their ions become neutral with no energy":
            "This does not explain the energy demand.",
        },
        "Strong attraction accounts for the large energy requirement.",
        "Use the bonding explanation.",
      ),
      q(
        "cb-water",
        "A soluble ionic compound has dissolved in water and its solution conducts. Why?",
        "Its charged ions can move through the solution",
        {
          "All its ions become neutral atoms":
            "That removes the stated charge carriers.",
          "All its ions remain fixed in a solid lattice":
            "The dissolved ions are mobile.",
        },
        "Dissolved ions can carry charge.",
        "Describe both charge and movement.",
      ),
      q(
        "cb-ratio",
        "A representative NaCl fragment contains 24 Na⁺ and 24 Cl⁻ ions. What does NaCl describe?",
        "The simplest 1:1 ion ratio, not a separate molecule",
        {
          "A molecule containing all 48 ions":
            "A giant lattice has no such discrete molecules.",
          "A 1:24 ratio": "Both species have the same count.",
        },
        "24:24 simplifies to 1:1.",
        "Simplify both counts.",
      ),
    ],
  ],
  reviewForms: [
    [
      q(
        "ra-solid",
        "Retrieve the reason solid ionic compounds do not conduct.",
        "Their charged ions cannot move freely through the lattice",
        {
          "They contain no charged particles": "The particles are ions.",
          "Their mobile electrons have stopped being electrons":
            "Ionic carriers are ions.",
        },
        "Fixed ions cannot transport charge through the solid.",
        "Retrieve charge plus mobility.",
      ),
      q(
        "ra-mp",
        "Retrieve the force-and-energy explanation for a high ionic melting point.",
        "Much energy overcomes strong electrostatic attractions",
        {
          "Little energy breaks weak intermolecular forces":
            "This is not the giant ionic explanation.",
          "No energy is needed because ions are charged":
            "Strong attractions require energy to overcome.",
        },
        "Strong lattice attraction requires substantial energy.",
        "Connect the causal steps.",
      ),
    ],
    [
      q(
        "rb-liquid",
        "Retrieve the charge carriers in molten sodium chloride.",
        "Mobile Na⁺ and Cl⁻ ions",
        {
          "Only neutral NaCl molecules": "The liquid salt contains ions.",
          "Free electrons like a metal": "The carriers here are ions.",
        },
        "Both ion species carry charge through the liquid.",
        "Retrieve the particle names.",
      ),
      q(
        "rb-lattice",
        "Retrieve what NaCl's formula means in its giant crystal.",
        "A simplest 1:1 ion ratio",
        {
          "Separate NaCl molecules": "The crystal is a giant ionic structure.",
          "One fixed total number of ions in every crystal":
            "Crystal size varies while the ratio stays 1:1.",
        },
        "The empirical formula expresses a ratio.",
        "Distinguish ratio from particle grouping.",
      ),
    ],
  ],
};
for (const task of [
  ...ionicStructuresJourney.guided,
  ...ionicStructuresJourney.practice,
])
  task.followUp = task.id.includes("solid")
    ? "is-v1-r-solid"
    : task.id.includes("molten") ||
        task.id.includes("solution") ||
        task.id.includes("evidence")
      ? "is-v1-r-mobile"
      : task.id.includes("melting") || task.id.includes("explain")
        ? "is-v1-r-force"
        : task.id.includes("size") || task.id.includes("limit")
          ? "is-v1-r-limits"
          : "is-v1-r-giant";
const titles: Record<string, string> = {
  "p-classify": "Identify the structure",
  "p-all-directions": "Pairs or a giant lattice?",
  "p-melting": "Explain the energy demand",
  "p-solid-error": "Repair the solid explanation",
  "p-molten-error": "Choose the correct carriers",
  "p-solution-limit": "Avoid a solubility assumption",
  "p-evidence": "Use all the property evidence",
  "p-size": "Read model limitations",
  "p-six-limit": "Know the limit of this example",
};
for (const task of ionicStructuresJourney.practice)
  task.title ??= titles[task.id.replace("is-v1-", "")];

extendIonicStructureWriting(ionicStructuresJourney);
