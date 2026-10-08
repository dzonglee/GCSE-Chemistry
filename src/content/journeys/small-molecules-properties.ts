import { extendMolecularWriting } from "./molecular-writing";
import type { LearningTask, LessonJourney } from "../types";
import { choice, number } from "./helpers";
const q = (
  id: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
): LearningTask =>
  choice(
    `mp-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    `Molecular bulk-property reasoning: ${id}.`,
  );
const boiling = q(
  "g-boiling",
  "When liquid chlorine boils, which attraction is overcome?",
  "Attractions between Cl₂ molecules",
  {
    "The covalent bond inside each Cl₂ molecule":
      "That would separate bonded atoms, changing the molecules chemically.",
    "Attraction holding atomic nuclei together":
      "Boiling is not a nuclear change.",
  },
  "The gas still consists of Cl₂ molecules. Strong Cl–Cl covalent bonds remain; weaker intermolecular attractions are overcome.",
  "Follow an intact bonded pair through the phase change.",
);
boiling.model = {
  kind: "molecular-properties",
  mode: "boiling",
  instruction: "Predict the force overcome, then compare liquid and gas.",
};
boiling.title = "Boiling: what changes?";
const conduction = q(
  "g-conduction",
  "Neutral Cl₂ molecules can move in the liquid. Does that make this molecular sample conduct?",
  "No: moving neutral molecules do not carry electric charge",
  {
    "Yes: movement always carries electric current":
      "The moving particles must also carry charge.",
    "Yes: every covalent electron can move freely through the sample":
      "Shared bond electrons are not freely moving charge carriers.",
  },
  "This neutral molecular sample has neither mobile ions nor delocalised electrons. It does not conduct electricity.",
  "Distinguish motion from charge transport.",
);
conduction.model = {
  kind: "molecular-properties",
  mode: "conduction",
  instruction:
    "Predict conduction and choose the particle explanation for this neutral molecular sample.",
};
conduction.title = "Moving is not enough";
const family = q(
  "g-family",
  "Similar unbranched hydrocarbons have supplied boiling points: ethane −89 °C, propane −42 °C, butane −1 °C. Which explanation fits the increasing boiling points?",
  "Larger molecules have stronger intermolecular attractions needing more energy",
  {
    "The larger molecules have weaker covalent bonds":
      "Boiling does not break those covalent bonds.",
    "−89 °C is the highest because 89 is the largest number":
      "Compare signed temperatures, not their magnitudes.",
  },
  "Within this similar family, larger molecules have stronger intermolecular attractions. More energy is needed to separate them, so boiling points rise. This is not a size-only rule across unrelated substances.",
  "Order the signed values, then connect force strength with energy.",
);
family.model = {
  kind: "molecular-properties",
  mode: "trend",
  instruction:
    "Compare butane with ethane: predict attraction strength and the energy needed to separate molecules.",
};
family.title = "Explain the supplied trend";
const written: LearningTask = {
  id: "mp-v1-p-explain",
  title: "Write the complete explanation",
  prompt:
    "Explain why a neutral small-molecule liquid can have a low boiling point despite strong covalent bonds, and why its mobile molecules do not make it conduct electricity.",
  answer:
    "Strong covalent bonds remain within molecules. Relatively weak intermolecular attractions need little energy to overcome on boiling. Neutral molecules do not carry charge; this sample lacks mobile ions and delocalised electrons.",
  rubric: [
    "Strong covalent bonds remain within molecules.",
    "Relatively weak intermolecular attractions need little energy to overcome.",
    "Connect this to the low boiling point.",
    "Neutral moving molecules are not mobile charged carriers.",
  ],
  explanation:
    "Use structure → force → energy → property, followed by a separate charge-carrier explanation.",
  hint: "Name what is within and what is between, then ask whether the moving particles carry charge.",
  purpose: "Independent constructed causal explanation; self-review only.",
};
export const smallMoleculesPropertiesJourney: LessonJourney = {
  version: 1,
  introduction:
    "Explain bulk properties by distinguishing strong bonds inside molecules from weaker attractions between them, then ask whether moving particles carry charge.",
  scopeNote:
    "Common Foundation/combined simple-molecular properties. Supplied similar-family data; giant covalent structures, polymers and ion-forming acid solutions need separate explanations.",
  outcomes: [
    "Explain boiling without breaking covalent bonds.",
    "Use supplied data to compare intermolecular attractions and energy demand.",
    "Explain poor conduction using mobile charged carriers.",
  ],
  warmup: [
    q(
      "w-pair",
      "What holds the two atoms together inside Cl₂?",
      "A strong covalent bond",
      {
        "An ionic lattice": "Cl₂ is a neutral molecule, not a salt lattice.",
        "Only the force between separate molecules":
          "This confuses inside a molecule with between molecules.",
      },
      "A shared electron pair is attracted to both nuclei within Cl₂.",
      "Recall electron sharing.",
    ),
    q(
      "w-carrier",
      "Which condition is necessary for particles to carry electrical current through a substance?",
      "They must carry charge and be able to move",
      {
        "They only need to move": "Neutral movement does not carry net charge.",
        "They only need to be charged while fixed":
          "Fixed ions do not carry current through a solid salt.",
      },
      "Electrical conduction needs mobile charged carriers.",
      "Use both charge and mobility.",
    ),
  ],
  refresher: [
    q(
      "r-force",
      "Where are intermolecular attractions?",
      "Between separate molecules",
      {
        "Between atoms inside the same molecule":
          "That is the within-molecule bond.",
        "Inside the nucleus": "Molecular forces are not nuclear forces.",
      },
      "Intermolecular means between molecules; covalent bonds hold atoms together within molecules.",
      "Read inter as between.",
    ),
    q(
      "r-energy",
      "Compared with breaking covalent bonds in small molecules, overcoming their intermolecular attractions usually needs…",
      "Much less energy",
      {
        "Much more energy":
          "Small-molecule intermolecular attractions are relatively weak.",
        "No energy at all":
          "Even relatively weak attractions require energy to overcome.",
      },
      "Relatively weak attractions need relatively little energy, not zero energy.",
      "Link force strength to energy.",
    ),
    q(
      "r-intact",
      "What particles remain after liquid oxygen boils?",
      "O₂ molecules",
      {
        "Separate oxygen atoms":
          "That would require breaking O=O covalent bonds.",
        "O²⁻ ions":
          "A physical phase change does not supply the ion-formation electrons.",
      },
      "Boiling separates molecules while the covalent bonds remain intact.",
      "Physical change versus chemical change.",
    ),
    q(
      "r-neutral",
      "Do neutral molecules contain no charged particles at all?",
      "No: their positive and negative charges balance overall",
      {
        "Yes: they contain no electrons":
          "Molecules still contain electrons and positive nuclei.",
        "No: each molecule must be an ion":
          "Having internal charges does not imply a net molecular charge.",
      },
      "Overall neutrality does not mean electrons are absent or freely moving.",
      "Separate internal charges from overall charge.",
    ),
    q(
      "r-size",
      "For a supplied similar family, why can larger molecules boil at higher temperatures?",
      "Stronger intermolecular attractions need more energy to overcome",
      {
        "Their covalent bonds must be broken on boiling":
          "Boiling leaves molecular bonds intact.",
        "Their nuclei gain extra charge when heated":
          "Heating is not a change of element identity.",
      },
      "Use the similar-family size trend, not an unrestricted rule for every substance.",
      "Follow force → energy → boiling point.",
    ),
  ],
  guided: [boiling, conduction, family],
  practice: [
    q(
      "p-melting",
      "A solid made of small neutral molecules melts without reacting. Which change describes the particles?",
      "Intact molecules leave their fixed arrangement as intermolecular attractions are partly overcome",
      {
        "Atoms detach because every covalent bond breaks":
          "The molecules remain intact during a physical change.",
        "Molecules become ions because a liquid must conduct":
          "Melting does not by itself form ions or supply mobile charged carriers.",
      },
      "Molecular melting changes arrangement and mobility while covalent bonds within each molecule remain. Relatively weak between-molecule attractions require relatively little energy to overcome; attractions still act in the liquid.",
      "Name what stays intact and what changes in the arrangement.",
    ),
    q(
      "p-location",
      "A dashed line joins two separate HCl molecules. A solid line joins H to Cl within one molecule. Which is overcome during boiling?",
      "The between-molecule dashed attraction",
      {
        "The within-molecule solid covalent bond":
          "That would break HCl chemically.",
        "Both types of line must disappear": "Strong covalent bonds remain.",
      },
      "A diagram must distinguish the two interactions. Boiling overcomes intermolecular attractions.",
      "Check what each line connects.",
    ),
    number(
      "mp-v1-p-inventory",
      "Four Cl₂ molecules boil without reacting. How many chlorine atoms are in the gas?",
      8,
      "atoms",
      "Each of the four intact molecules has two atoms: 4 × 2 = 8.",
      "Changing spacing does not change the inventory.",
      "Conserve atom counts across a physical change.",
      {
        "4": "Four counts molecules, not atoms.",
        "16": "Boiling does not double the number of atoms.",
      },
    ),
    q(
      "p-bonds",
      "Why is 'methane boils easily because its covalent bonds are weak' wrong?",
      "Boiling overcomes weaker intermolecular attractions; covalent bonds remain",
      {
        "Methane has no covalent bonds":
          "Methane has four strong C–H bonds within each molecule.",
        "Boiling must break every bond":
          "That is not a physical separation of intact molecules.",
      },
      "Low boiling point concerns attractions between molecules, not weak bonds within them.",
      "State the correct force explicitly.",
    ),
    q(
      "p-conduct",
      "A supplied neutral molecular liquid contains freely moving molecules but no ions or delocalised electrons. Predict conduction.",
      "It does not conduct: there are no mobile charged carriers",
      {
        "It conducts because all liquids conduct":
          "Being liquid is not sufficient.",
        "It conducts because molecules contain electrons":
          "Those electrons are not a freely moving carrier population.",
      },
      "Mobility plus charge is needed. The given molecules are neutral.",
      "Use every part of the supplied evidence.",
    ),
    q(
      "p-evidence",
      "Substance X has low melting and boiling points and does not conduct as a liquid. Which structure is most consistent with all this evidence?",
      "Simple molecular",
      {
        "Giant ionic":
          "Molten ionic compounds have mobile charged ions and conduct.",
        Metallic: "Metals have delocalised electrons and conduct.",
      },
      "The combined evidence supports weak between-molecule attractions and no mobile charged carriers; no single property alone proves every structure.",
      "Combine energy and conduction evidence.",
    ),
    q(
      "p-signed",
      "Ethane boils at −89 °C; propane at −42 °C. Which has the higher supplied boiling point?",
      "Propane",
      {
        Ethane: "−42 is higher than −89 on the temperature scale.",
        "Equal because both are negative":
          "Different negative temperatures are not equal.",
      },
      "Propane's −42 °C is 47 °C above ethane's −89 °C.",
      "Compare positions on a signed number line.",
    ),
    number(
      "mp-v1-p-difference",
      "Using −89 °C and −42 °C, by how many degrees is propane's boiling point higher?",
      47,
      "°C",
      "−42 − (−89) = 47 °C.",
      "Subtract the lower signed value.",
      "Interpret the magnitude of a signed-temperature difference.",
      { "131": "Adding magnitudes does not give the difference here." },
    ),
    q(
      "p-energy",
      "Two similar molecular substances need different energies to separate their molecules. Y needs more energy. What does that suggest?",
      "Y has stronger intermolecular attractions",
      {
        "Y must have weaker intermolecular attractions":
          "Weaker attractions need less energy.",
        "Y must break its covalent bonds on boiling":
          "The comparison concerns separating molecules, not breaking them.",
      },
      "Stronger attractions require more energy to overcome, tending to a higher boiling point in this comparison.",
      "Connect the supplied energy demand to force strength.",
    ),
    q(
      "p-limit",
      "May you predict every molecule's boiling point from its size alone?",
      "No: compare similar substances or use supplied evidence",
      {
        "Yes: the largest molecule always boils highest":
          "Shape and types of attraction can differ across unrelated substances.",
        "No: size can never affect attractions":
          "Size is useful within appropriate comparisons.",
      },
      "The GCSE size trend is useful for a similar family. It is not a universal numerical rule across all molecules.",
      "A trend needs an appropriate comparison.",
    ),
    q(
      "p-acid",
      "A molecular acid forms mobile ions when dissolved in water. Does the neutral-molecular-liquid rule prove that this solution cannot conduct?",
      "No: the solution contains mobile charged ions",
      {
        "Yes: every molecular solution is non-conducting":
          "The resulting particles must be considered.",
        "No: neutral molecules become delocalised electrons":
          "Ion formation is not metallic conduction.",
      },
      "Conductivity depends on the particles actually present. An ion-forming acid solution differs from the supplied neutral molecular liquid.",
      "Use the changed particle evidence.",
    ),
    q(
      "p-all-covalent",
      "Does a low-boiling simple-molecule explanation also describe diamond just because diamond is covalent?",
      "No: diamond has a giant covalent network",
      {
        "Yes: all covalent substances have low boiling points":
          "Structure matters as well as bond type.",
        "No: diamond must be ionic": "Diamond is giant covalent, not ionic.",
      },
      "Do not substitute a small-molecule explanation for a giant network. Detailed diamond properties follow separately.",
      "Check whether there are separate small molecules.",
    ),
    written,
  ],
  checkForms: [
    [
      q(
        "ca-force",
        "Liquid bromine turns to bromine vapour without reacting. Which interactions are overcome?",
        "Between Br₂ molecules",
        {
          "The Br–Br covalent bonds":
            "These remain in the intact vapour molecules.",
          "Inside bromine nuclei": "This is not a nuclear process.",
        },
        "Boiling separates intact molecules.",
        "Recall the physical-change distinction.",
      ),
      number(
        "mp-v1-ca-count",
        "Six Br₂ molecules evaporate without reacting. How many bromine atoms remain?",
        12,
        "atoms",
        "Six molecules each retain two atoms.",
        "Conserve the molecule inventory.",
        "Reserved physical-change counting.",
      ),
      q(
        "ca-carrier",
        "A liquid consists only of neutral molecules and has no mobile ions or delocalised electrons. Why does it not conduct?",
        "It has no mobile charged carriers",
        {
          "Its molecules cannot move": "Liquid molecules can move.",
          "It has no electrons inside its molecules":
            "Neutral molecules contain electrons.",
        },
        "The absence of mobile charged carriers explains the result.",
        "Recall both mobility and charge.",
      ),
      q(
        "ca-trend",
        "In a similar family, larger molecules have higher boiling points. Which causal step connects these observations?",
        "Stronger intermolecular attractions require more energy",
        {
          "Weaker covalent bonds break more easily":
            "Boiling does not break covalent bonds.",
          "Larger molecules have no forces":
            "That contradicts molecular attraction.",
        },
        "Size → attraction strength → energy demand → boiling point.",
        "Name the relevant attraction.",
      ),
    ],
    [
      q(
        "cb-intact",
        "What remains intact when liquid nitrogen boils?",
        "The N≡N bonds within N₂ molecules",
        {
          "Only the atoms' nuclei, with every N₂ bond broken":
            "The molecule remains intact too.",
          "A giant nitrogen ion lattice": "This example is molecular nitrogen.",
        },
        "Intermolecular attractions are overcome, not the strong within-molecule bonds.",
        "Recall what boiling changes.",
      ),
      number(
        "mp-v1-cb-count",
        "Five N₂ molecules become gas without reaction. How many nitrogen atoms are present?",
        10,
        "atoms",
        "Five intact diatomic molecules contain ten atoms.",
        "Count atoms, not molecules.",
        "Reserved independent inventory.",
      ),
      q(
        "cb-movement",
        "Why can moving neutral gas molecules fail to carry an electric current?",
        "Their overall charge is zero",
        {
          "All gas molecules lack electrons":
            "Molecules contain charged particles internally.",
          "Neutral means unable to move":
            "Neutrality does not prevent movement.",
        },
        "Motion alone is not charge transport.",
        "Distinguish movement and overall charge.",
      ),
      q(
        "cb-data",
        "Similar molecular substances A and B boil at −25 °C and +15 °C respectively. Which conclusion fits this comparison?",
        "B has the higher boiling point and stronger intermolecular attractions",
        {
          "A is higher because 25 is larger than 15":
            "Use signed temperature values.",
          "B must break more covalent bonds during boiling":
            "Boiling does not break those bonds.",
        },
        "+15 is above −25; the higher boiling point suggests stronger between-molecule attractions in this similar-family comparison.",
        "Use signed data and the relevant force.",
      ),
    ],
  ],
  reviewForms: [
    [
      q(
        "ra-force",
        "Retrieve why a low-boiling molecular substance can still have strong covalent bonds.",
        "Boiling overcomes weaker attractions between intact molecules",
        {
          "Every covalent bond is weak": "Strong within-molecule bonds remain.",
          "Boiling removes all electrons": "It is not electron removal.",
        },
        "Different forces explain bond strength and boiling point.",
        "Retrieve within versus between.",
      ),
      q(
        "ra-carrier",
        "Retrieve what a neutral molecular liquid lacks for electrical conduction.",
        "Mobile charged carriers",
        {
          "Any moving particles": "Molecules can move.",
          "All internal electrons":
            "Electrons exist but are not freely moving carriers.",
        },
        "Neutral movement is not current.",
        "Retrieve charge plus mobility.",
      ),
    ],
    [
      q(
        "rb-energy",
        "Retrieve the energy consequence of stronger attractions between similar molecules.",
        "More energy is needed to separate the molecules",
        {
          "Their internal bonds must be weaker":
            "This is a different interaction.",
          "They need no energy to boil":
            "Attractions require energy to overcome.",
        },
        "Stronger intermolecular attractions tend to higher boiling points within a suitable comparison.",
        "Retrieve the causal chain.",
      ),
      q(
        "rb-scope",
        "Retrieve why small-molecule low melting cannot be applied to all covalent substances.",
        "Some covalent substances have giant networks",
        {
          "Every covalent substance consists of separate small molecules":
            "Diamond is a counterexample.",
          "Covalent substances contain no bonds":
            "Covalent bonding is their defining interaction.",
        },
        "Use the actual structure, not just the bond-type name.",
        "Recall molecule versus network.",
      ),
    ],
  ],
};
for (const task of [
  ...smallMoleculesPropertiesJourney.guided,
  ...smallMoleculesPropertiesJourney.practice,
])
  task.followUp =
    task.id.includes("conduct") || task.id.includes("acid")
      ? "mp-v1-r-neutral"
      : task.id.includes("size") ||
          task.id.includes("energy") ||
          task.id.includes("limit")
        ? "mp-v1-r-size"
        : "mp-v1-r-force";

extendMolecularWriting(smallMoleculesPropertiesJourney);
