import { paper1FoundationFull } from "./paper1-foundation-full";
import { paper2FoundationFull } from "./paper2-foundation-full";
import {
  haberJourney,
  haberExposureFamilies,
} from "./journeys/haber-and-fertilisers";
import {
  materialsJourney,
  materialsExposureFamilies,
} from "./journeys/materials-and-corrosion";
import {
  lcaJourney,
  lcaExposureFamilies,
} from "./journeys/life-cycle-assessment";
import { bioJourney, bioExposureFamilies } from "./journeys/extracting-metals";
import { wasteJourney, wasteExposureFamilies } from "./journeys/wastewater";
import { waterJourney, waterExposureFamilies } from "./journeys/potable-water";
import { cycleJourney, cycleExposureFamilies } from "./journeys/carbon-cycle";
import {
  pollutionJourney,
  pollutionExposureFamilies,
} from "./journeys/air-pollutants";
import {
  climateJourney,
  climateExposureFamilies,
} from "./journeys/climate-evidence";
import {
  greenhouseJourney,
  greenhouseExposureFamilies,
} from "./journeys/greenhouse-effect";
import {
  atmosphereJourney,
  atmosphereExposureFamilies,
} from "./journeys/early-atmosphere";
import {
  separationJourney,
  separationExposureFamilies,
} from "./journeys/separation-practical";
import {
  instrumentalJourney,
  instrumentalExposureFamilies,
} from "./journeys/instrumental-analysis";
import { ionTestsJourney, ionExposureFamilies } from "./journeys/ion-tests";
import {
  gasTestsJourney,
  gasExposureFamilies,
} from "./journeys/gas-tests-journey";
import {
  chromatographyJourney,
  chromatographyExposureFamilies,
} from "./journeys/chromatography-journey";
import {
  purityJourney,
  purityExposureFamilies,
} from "./journeys/purity-journey";
import {
  naturalJourney,
  naturalExposureFamilies,
} from "./journeys/natural-journey";
import {
  pathwaysJourney,
  pathwaysExposureFamilies,
} from "./journeys/pathways-journey";
import {
  polymerisationJourney,
  polymerisationExposureFamilies,
} from "./journeys/polymerisation";
import { alcoholJourney, alcoholExposureFamilies } from "./journeys/alcohols";
import { crackingJourney, crackingExposureFamilies } from "./journeys/cracking";
import { alkanesJourney, alkaneExposureFamilies } from "./journeys/alkanes";
import { crudeOilJourney, oilExposureFamilies } from "./journeys/crude-oil";
import {
  ratesPracticalJourney,
  ratesPracticalExposureFamilies,
} from "./journeys/rates-practical";
import {
  equilibriumShiftJourney,
  equilibriumShiftExposureFamilies,
} from "./journeys/changing-equilibrium";
import {
  reversibleJourney,
  reversibleExposureFamilies,
} from "./journeys/reversible-reactions";
import {
  temperatureJourney,
  temperatureExposureFamilies,
} from "./journeys/temperature-and-catalysts";
import { collisionJourney } from "./journeys/collision-theory";
import { tangentJourney } from "./journeys/tangent-rates";
import { ratesJourney } from "./journeys/reaction-rates";
import { voltageJourney } from "./journeys/cell-voltage";
import { fuelHalfJourney } from "./journeys/fuel-half";
import { practicalJourney } from "./journeys/energy-practical";
import { bondEnergyJourney } from "./journeys/bond-energy";
import { titrationTechniqueJourney } from "./journeys/titration-technique";
import { profileJourney } from "./journeys/reaction-profiles";
import { energyJourney } from "./journeys/energy-transfer";
import { displacementJourney } from "./journeys/displacement";
import { acidStrengthJourney } from "./journeys/acid-strength";
import { phJourney } from "./journeys/ph";
import { halfEquationsJourney } from "./journeys/half-equations";
import { aqueousProductsJourney } from "./journeys/aqueous-products";
import { electrolysisJourney } from "./journeys/electrolysis";
import { solubleSaltsJourney } from "./journeys/making-soluble-salts";
import { acidNeutralisationJourney } from "./journeys/acids-and-neutralisation";
import { metalExtractionJourney } from "./journeys/metal-extraction";
import { oxygenRedoxJourney } from "./journeys/oxygen-redox";
import { metalReactivityJourney } from "./journeys/metal-reactivity";
import { titrationCalculationsJourney } from "./journeys/titration-calculations";
import { empiricalFormulaeJourney } from "./journeys/empirical-formulae";
import { gasVolumesJourney } from "./journeys/gas-volumes";
import { molarConcentrationJourney } from "./journeys/molar-concentration";
import { productionPathwaysJourney } from "./journeys/production-pathways";
import { theoreticalYieldJourney } from "./journeys/theoretical-yield";
import { atomEconomyJourney } from "./journeys/atom-economy";
import { percentageYieldJourney } from "./journeys/percentage-yield";
import { limitingReactantsJourney } from "./journeys/limiting-reactants";
import { balancingMassesJourney } from "./journeys/balancing-masses";
import { reactingMassesJourney } from "./journeys/reacting-masses";
import { molesJourney } from "./journeys/moles";
import { changingConcentrationJourney } from "./journeys/changing-concentration";
import { concentrationJourney } from "./journeys/concentration";
import { measurementJourney } from "./journeys/measurement-uncertainty";
import { massConservationJourney } from "./journeys/conservation-of-mass";
import { balancingJourney } from "./journeys/balancing-equations";
import { compositionJourney } from "./journeys/percentage-composition";
import { formulaMassJourney } from "./journeys/formulae-and-mass";
import { nanoparticlesJourney } from "./journeys/nanoparticles";
import { statesJourney } from "./journeys/states-of-matter";
import { polymerStructureJourney } from "./journeys/polymer-structures";
import { nanotubeJourney } from "./journeys/nanotubes";
import { fullereneJourney } from "./journeys/fullerenes";
import { grapheneJourney } from "./journeys/graphene";
import { graphiteJourney } from "./journeys/graphite";
import { diamondStructuresJourney } from "./journeys/diamond-structures";
import { metallicBondingJourney } from "./journeys/metallic-bonding";
import { smallMoleculesPropertiesJourney } from "./journeys/small-molecules-properties";
import type { Lesson, ModelKind, Question, Topic, Tier, Course } from "./types";
import { atomicJourneys } from "./journeys/atomic";
import { isotopeJourney } from "./journeys/isotopes";
import { shellJourney } from "./journeys/shells";
import { atomicModelJourney } from "./journeys/atomic-models";
import { atomicScaleJourney } from "./journeys/atomic-scale";
import { relativeAtomicMassJourney } from "./journeys/relative-atomic-mass";
import { periodicTableJourney } from "./journeys/periodic-table";
import { periodicDevelopmentJourney } from "./journeys/periodic-development";
import { groupOneJourney } from "./journeys/group-one";
import { ionicBondingJourney } from "./journeys/ionic-bonding";
import { ionicStructuresJourney } from "./journeys/ionic-structures";
import { ionicFormulaeJourney } from "./journeys/ionic-formulae";
import { covalentBondingJourney } from "./journeys/covalent-bonding";
import { transitionMetalsJourney } from "./journeys/transition-metals";
import { groupZeroJourney } from "./journeys/group-zero";
import { groupSevenJourney } from "./journeys/group-seven";
import { tasks } from "./journeys/helpers";
export const topics: Topic[] = [
  {
    slug: "atomic-structure",
    title: "Atomic structure",
    symbol: "Na",
    description: "Particles, elements and the patterns in the periodic table.",
    colour: "blue",
  },
  {
    slug: "bonding",
    title: "Bonding & materials",
    symbol: "C",
    description: "Use structure and bonding to explain how substances behave.",
    colour: "teal",
  },
  {
    slug: "quantitative",
    title: "Chemical calculations",
    symbol: "mol",
    description: "Track atoms and mass, then connect amounts to reactions.",
    colour: "purple",
  },
  {
    slug: "chemical-changes",
    title: "Chemical changes",
    symbol: "H⁺",
    description: "Metals, acids, salts and the movement of electrons.",
    colour: "orange",
  },
  {
    slug: "energy",
    title: "Energy changes",
    symbol: "ΔH",
    description: "Follow energy transfers and explain reaction profiles.",
    colour: "pink",
  },
  {
    slug: "rates",
    title: "Rates & equilibrium",
    symbol: "⇌",
    description: "Explore collisions, catalysts and reversible reactions.",
    colour: "teal",
  },
  {
    slug: "organic",
    title: "Organic chemistry",
    symbol: "CH₄",
    description: "Carbon compounds, fuels, reactions and polymers.",
    colour: "purple",
  },
  {
    slug: "analysis",
    title: "Chemical analysis",
    symbol: "Rf",
    description:
      "Separate mixtures, identify substances and evaluate evidence.",
    colour: "blue",
  },
  {
    slug: "atmosphere",
    title: "The atmosphere",
    symbol: "CO₂",
    description: "Earth’s changing atmosphere, climate and air pollutants.",
    colour: "orange",
  },
  {
    slug: "resources",
    title: "Using resources",
    symbol: "H₂O",
    description: "Water, materials and the chemistry of sustainable choices.",
    colour: "teal",
  },
];
// Compact authoring helpers: the prompts, distractors and explanations below are authored.
// Option order is rotated deterministically so correct answers are not always first.
let active = "";
function c(
  prompt: string,
  answer: string,
  wrong: string[],
  explanation: string,
  hint: string,
): Question {
  const index = counter++;
  const all = [answer, ...wrong];
  const shift = index % all.length;
  const options = [...all.slice(shift), ...all.slice(0, shift)];
  return {
    id: `${active}-${index}`,
    prompt,
    answer,
    options,
    explanation,
    hint,
  };
}
function n(
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  tolerance = 0.000001,
): Question {
  return {
    id: `${active}-${counter++}`,
    prompt,
    answer: String(answer),
    unit,
    explanation,
    hint,
    tolerance,
  };
}
let counter = 0;
function lesson(
  slug: string,
  topic: string,
  title: string,
  goal: string,
  model: ModelKind,
  concept: string,
  author: () => Question[],
  tier: Tier = "foundation",
  course: Course = "combined",
  prerequisite?: string,
): Lesson {
  active = slug;
  counter = 0;
  const questions = author();
  return {
    slug,
    topic,
    title,
    goal,
    model,
    concept,
    tier,
    course,
    prerequisite,
    questions: questions.slice(0, 4),
    checks: questions.slice(4),
  };
}
export const lessons: Lesson[] = [
  lesson(
    "inside-an-atom",
    "atomic-structure",
    "Inside an atom",
    "Use particle charges and numbers to describe an atom.",
    "atom",
    "Protons and neutrons are in the nucleus. Electrons occupy shells. Atomic number counts protons; mass number counts protons plus neutrons.",
    () => [
      c(
        "Which particle has a relative charge of −1?",
        "Electron",
        ["Proton", "Neutron"],
        "An electron has charge −1; protons are +1 and neutrons have no charge.",
        "Think about the particle outside the nucleus.",
      ),
      n(
        "A neutral carbon atom has 6 protons. How many electrons does it have?",
        6,
        "electrons",
        "Equal numbers of positive protons and negative electrons give no overall charge.",
        "A neutral atom has balanced positive and negative charges.",
      ),
      n(
        "An atom has atomic number 11 and mass number 23. How many neutrons?",
        12,
        "neutrons",
        "23 − 11 = 12. The mass number includes protons and neutrons.",
        "Subtract atomic number from mass number.",
      ),
      c(
        "Where is almost all the mass of an atom?",
        "In the nucleus",
        ["In the electron shells", "Equally spread throughout"],
        "Protons and neutrons each have relative mass about 1; electron mass is much smaller.",
        "Which particles contribute most of the mass?",
      ),
      n(
        "A neutral oxygen atom has atomic number 8 and mass number 18. How many neutrons?",
        10,
        "neutrons",
        "18 − 8 = 10 neutrons.",
        "Use mass number minus proton number.",
      ),
      n(
        "A neutral magnesium atom has 12 protons. How many electrons?",
        12,
        "electrons",
        "Neutral atoms have equal proton and electron numbers.",
        "Balance the charges.",
      ),
    ],
  ),
  lesson(
    "isotopes-and-ions",
    "atomic-structure",
    "Isotopes and ions",
    "Distinguish changing neutrons from gaining or losing electrons.",
    "atom",
    "Isotopes have the same number of protons but different numbers of neutrons. Ions form by electron transfer; the element is unchanged.",
    () => [
      c(
        "Carbon-12 and carbon-14 are isotopes because they have…",
        "The same proton number, different neutron numbers",
        ["Different proton numbers", "Different electron charges"],
        "Both have 6 protons, but 6 and 8 neutrons respectively.",
        "The element is determined by proton number.",
      ),
      n(
        "An ion has 11 protons and 10 electrons. What is its charge? Enter a signed number.",
        1,
        "",
        "11 positive charges and 10 negative charges leave +1.",
        "Subtract electrons from protons.",
      ),
      c(
        "A chlorine atom forms Cl⁻ by…",
        "Gaining one electron",
        ["Losing one electron", "Gaining one proton"],
        "Gaining an electron produces a negative ion without changing the element.",
        "A negative ion has extra negative charge.",
      ),
      n(
        "Chlorine-37 has 17 protons. How many neutrons?",
        20,
        "neutrons",
        "37 − 17 = 20.",
        "Mass number includes both nuclear particles.",
      ),
      c(
        "Which change makes an atom a different element?",
        "Changing the number of protons",
        ["Changing the number of neutrons", "Changing the number of electrons"],
        "Proton number defines the element.",
        "Compare element identity with isotope and charge.",
      ),
      n(
        "An oxide ion has 8 protons and 10 electrons. What is its charge?",
        -2,
        "",
        "8 − 10 = −2.",
        "Count the excess electrons.",
      ),
    ],
  ),
  lesson(
    "electron-shells",
    "atomic-structure",
    "Electron shells",
    "Connect electron arrangements with groups and periods.",
    "atom",
    "For the first 20 elements, the GCSE shell model fills 2 electrons in the first shell, then up to 8 in the second and third before the fourth begins. This is a simplified model.",
    () => [
      c(
        "What is the electron arrangement of sodium, atomic number 11?",
        "2,8,1",
        ["2,9", "2,7,2"],
        "The first shell holds 2, the second 8, leaving 1.",
        "Fill from the innermost shell.",
      ),
      n(
        "How many outer-shell electrons does chlorine, arrangement 2,8,7, have?",
        7,
        "electrons",
        "The final number in the arrangement is the outer-shell count.",
        "Look at the last shell.",
      ),
      c(
        "An element has electron arrangement 2,8,2. Which GCSE group is it in?",
        "Group 2",
        ["Group 3", "Group 0"],
        "For these main-group elements, group number matches outer electrons.",
        "Use the outer-shell count.",
      ),
      n(
        "An atom has arrangement 2,8,8,2. How many occupied shells?",
        4,
        "shells",
        "Each entry describes one occupied shell.",
        "Count the entries, not the electrons.",
      ),
      c(
        "Which arrangement is a noble gas?",
        "2,8",
        ["2,8,1", "2,7"],
        "A full outer shell gives very low reactivity.",
        "Find a full outer shell.",
      ),
      c(
        "An element with three occupied shells is in…",
        "Period 3",
        ["Group 3", "Period 8"],
        "Period number counts occupied electron shells.",
        "Groups and periods describe different patterns.",
      ),
    ],
  ),
  lesson(
    "periodic-patterns",
    "atomic-structure",
    "The periodic table",
    "Use periodic patterns and explain how the table developed.",
    "atom",
    "Modern elements are ordered by atomic number. Similar outer electron arrangements put elements with similar chemistry in the same group. Mendeleev left gaps and predicted undiscovered elements.",
    () => [
      c(
        "The modern periodic table is ordered by…",
        "Atomic number",
        ["Relative atomic mass only", "Date of discovery"],
        "Atomic number is the proton number and increases across the table.",
        "Which number uniquely defines an element?",
      ),
      c(
        "Why do elements in the same group often react similarly?",
        "They have similar outer electron arrangements",
        ["They have equal masses", "They have equal neutron numbers"],
        "Chemical reactions involve outer electrons.",
        "Focus on the electrons involved in bonding.",
      ),
      c(
        "Why did Mendeleev leave gaps?",
        "To allow for undiscovered elements",
        ["To omit unreactive elements", "To group all gases together"],
        "He predicted properties for elements not yet found.",
        "His table was a predictive model.",
      ),
      c(
        "Which property is usually associated with metals?",
        "Electrical conductivity",
        ["Always being a gas", "Having no free-moving electrons"],
        "Delocalised electrons carry charge in metals.",
        "Think about what carries charge.",
      ),
      c(
        "An element in Group 0 is generally…",
        "Very unreactive",
        ["A strong oxidising acid", "More reactive than Group 1"],
        "Its outer electron shell is full.",
        "Use the shell arrangement.",
      ),
      c(
        "A period is a…",
        "Horizontal row",
        ["Vertical column", "Set of isotopes"],
        "Periods run across the table; groups are columns.",
        "Think about a row across a page.",
      ),
    ],
  ),
  lesson(
    "group-reactions",
    "atomic-structure",
    "Groups 1, 7 and 0",
    "Predict trends in reactivity and displacement reactions.",
    "predict",
    "Group 1 metals lose an electron more easily down the group. Group 7 halogens gain an electron less easily down the group. A more reactive halogen displaces a less reactive halide.",
    () => [
      c(
        "Group 1 reactivity generally…",
        "Increases down the group",
        ["Decreases down the group", "Stays exactly constant"],
        "The outer electron is further from the nucleus and more shielded, so it is lost more easily.",
        "Compare the attraction to the outer electron.",
      ),
      c(
        "Chlorine is added to potassium bromide solution. What happens?",
        "Bromine is displaced",
        [
          "Potassium is displaced",
          "No reaction because bromine is more reactive",
        ],
        "Chlorine is more reactive than bromine and oxidises bromide ions.",
        "A halogen higher in Group 7 is more reactive.",
      ),
      c(
        "Group 7 reactivity generally…",
        "Decreases down the group",
        ["Increases down the group", "Is determined only by colour"],
        "Larger atoms attract an incoming electron less strongly.",
        "Consider distance and shielding.",
      ),
      c(
        "Group 0 boiling points increase down the group because…",
        "Intermolecular forces become stronger",
        ["Atoms become ionic", "Covalent bonds are broken"],
        "Larger atoms have stronger attractions between atoms, requiring more energy to separate.",
        "These are monatomic substances.",
      ),
      c(
        "Iodine is added to sodium chloride solution. What happens?",
        "No halogen displacement",
        ["Chlorine is displaced", "Sodium is formed"],
        "Iodine is less reactive than chlorine.",
        "Compare their positions in Group 7.",
      ),
      c(
        "Lithium reacting with water produces hydrogen and…",
        "Lithium hydroxide",
        ["Lithium chloride", "Lithium oxide only"],
        "An alkali metal plus water produces a metal hydroxide and hydrogen.",
        "The solution becomes alkaline.",
      ),
    ],
  ),
  lesson(
    "ionic-bonding",
    "bonding",
    "Ionic bonding",
    "Build ions and explain their electrostatic attraction.",
    "bond",
    "Ionic bonding is the strong electrostatic attraction between oppositely charged ions. Metals lose electrons; non-metals gain them. The resulting lattice is neutral overall.",
    () => [
      c(
        "A sodium atom forms Na⁺ by…",
        "Losing one electron",
        ["Gaining one electron", "Losing one proton"],
        "The nucleus remains unchanged; losing an electron leaves charge +1.",
        "Positive ions have fewer electrons than protons.",
      ),
      c(
        "What holds ions together in an ionic lattice?",
        "Electrostatic attraction between opposite charges",
        ["Shared pairs of electrons", "Gravity"],
        "Ionic bonds are strong attractions between positively and negatively charged ions.",
        "Name the force between charges.",
      ),
      c(
        "What is the formula of magnesium chloride?",
        "MgCl₂",
        ["MgCl", "Mg₂Cl"],
        "One Mg²⁺ needs two Cl⁻ ions to balance its charge.",
        "Make the total charge zero.",
      ),
      c(
        "Why is sodium chloride not a collection of separate molecules?",
        "Its ions form a giant repeating lattice",
        ["It has no bonds", "Only two ions exist in each crystal"],
        "Each ion attracts neighbours throughout the lattice.",
        "Think beyond one formula unit.",
      ),
      c(
        "What is the formula of aluminium oxide?",
        "Al₂O₃",
        ["AlO", "Al₃O₂"],
        "Two Al³⁺ ions and three O²⁻ ions give charges +6 and −6.",
        "Find the smallest balanced charge ratio.",
      ),
      c(
        "A calcium atom forms Ca²⁺ by losing…",
        "Two electrons",
        ["Two protons", "One neutron"],
        "The +2 charge comes from losing two negative electrons.",
        "Ion formation changes electrons.",
      ),
    ],
  ),
  lesson(
    "covalent-bonding",
    "bonding",
    "Covalent bonding",
    "Identify shared electrons and distinguish bonds from intermolecular forces.",
    "bond",
    "A covalent bond is a shared pair of electrons attracted to both nuclei. Simple molecular substances have strong bonds within molecules but much weaker attractions between molecules.",
    () => [
      c(
        "A single covalent bond contains…",
        "One shared pair of electrons",
        ["One transferred proton", "Two transferred neutrons"],
        "Two shared electrons form one covalent bond.",
        "Pair means two electrons.",
      ),
      n(
        "How many electrons are shared in a double covalent bond?",
        4,
        "electrons",
        "Two shared pairs contain four electrons.",
        "Each bond contributes one shared pair.",
      ),
      c(
        "Why does methane have a low boiling point?",
        "Weak forces between its molecules need little energy to overcome",
        ["Its covalent bonds are weak", "Its carbon atoms are ions"],
        "Boiling separates molecules without breaking their covalent bonds.",
        "Distinguish within a molecule from between molecules.",
      ),
      c(
        "Which substance has simple molecules?",
        "Water",
        ["Diamond", "Sodium chloride"],
        "Water consists of H₂O molecules; diamond and sodium chloride have giant structures.",
        "Find a small independent molecular unit.",
      ),
      c(
        "In a hydrogen molecule H₂, the shared electrons are attracted to…",
        "Both nuclei",
        ["Only one nucleus", "Neither nucleus"],
        "Attraction between shared electrons and both positive nuclei holds the atoms together.",
        "Each atom contributes to the bond.",
      ),
      c(
        "Boiling oxygen mainly overcomes…",
        "Intermolecular forces",
        ["The O=O covalent bond", "Nuclear forces"],
        "O₂ molecules remain intact during boiling.",
        "A change of state is not a chemical reaction.",
      ),
    ],
  ),
  lesson(
    "structure-and-properties",
    "bonding",
    "Structure and properties",
    "Explain melting points and conductivity using particles.",
    "bond",
    "Ionic solids cannot conduct because ions are fixed. Molten or dissolved ionic compounds conduct through moving ions. Metals conduct through delocalised electrons.",
    () => [
      c(
        "Why can molten sodium chloride conduct electricity?",
        "Its ions can move",
        ["Its atoms share all electrons", "Its nuclei flow alone"],
        "Mobile charged ions carry current through the liquid.",
        "A charge carrier must be able to move.",
      ),
      c(
        "Why does solid sodium chloride not conduct?",
        "Its ions are fixed in position",
        ["It has no charged particles", "It contains no electrons"],
        "The lattice prevents ions moving freely.",
        "Charge is present, but can it move?",
      ),
      c(
        "Why do many ionic compounds have high melting points?",
        "Strong attractions between ions need much energy to overcome",
        ["Their molecules are small", "Their ions have no charge"],
        "Melting disrupts many strong electrostatic attractions.",
        "Link structure, force and energy.",
      ),
      c(
        "Metals can be shaped because…",
        "Layers of atoms can slide while metallic bonding remains",
        ["All bonds disappear", "Metal atoms become gas"],
        "Non-directional attraction to delocalised electrons maintains bonding as layers move.",
        "Consider movement of layers.",
      ),
      c(
        "Which particles carry current in a metal?",
        "Delocalised electrons",
        ["Positive ions moving through a solid", "Neutrons"],
        "Electrons move through the metallic structure; metal ions remain in place.",
        "Compare metals with molten salts.",
      ),
      c(
        "A simple molecular substance usually does not conduct because…",
        "It lacks mobile charged particles",
        ["Its molecules are too small", "All its bonds are broken"],
        "Neutral molecules do not provide the mobile ions or delocalised electrons needed.",
        "Think about charge carriers.",
      ),
    ],
  ),
  lesson(
    "carbon-structures",
    "bonding",
    "Diamond, graphite and graphene",
    "Connect carbon bonding with strength and conductivity.",
    "bond",
    "Diamond has four covalent bonds per carbon in a giant 3D network. Graphite has three per carbon in layers and delocalised electrons. Graphene is a single layer of graphite.",
    () => [
      n(
        "How many covalent bonds does each carbon atom make in diamond?",
        4,
        "bonds",
        "Four bonds create a rigid three-dimensional network.",
        "Carbon has four outer electrons.",
      ),
      c(
        "Why does graphite conduct electricity?",
        "It has delocalised electrons",
        ["Its carbon atoms are ions", "Its layers are liquid"],
        "One electron per carbon is delocalised through the layers.",
        "Not all carbon electrons are in localised bonds.",
      ),
      c(
        "Why is graphite slippery?",
        "Weak attractions allow its layers to slide",
        ["Its covalent bonds are all weak", "It melts at room temperature"],
        "Strong bonds hold each layer together, but forces between layers are weak.",
        "Compare within layers with between layers.",
      ),
      c(
        "What is graphene?",
        "A single layer of carbon atoms in a hexagonal network",
        ["A sodium salt", "A small tetrahedral molecule"],
        "Graphene is one atom thick and related to graphite.",
        "Remove just one graphite layer.",
      ),
      c(
        "Diamond does not conduct because…",
        "It has no delocalised electrons",
        ["It contains no electrons", "It is a liquid"],
        "Its outer electrons are used in covalent bonds.",
        "Bonded electrons are not free charge carriers.",
      ),
      c(
        "Diamond has a high melting point because…",
        "Many strong covalent bonds must be broken",
        ["Weak molecular forces are overcome", "It is made of ions"],
        "A giant covalent network requires large energy input.",
        "Diamond is not simple molecular.",
      ),
    ],
  ),
  lesson(
    "particles-and-nanoparticles",
    "bonding",
    "Particles and nanoparticles",
    "Use particle models and surface-area reasoning.",
    "predict",
    "The particle model explains states without saying particles themselves expand. Nanoparticles are typically 1–100 nm across; their large surface-area-to-volume ratio can change their behaviour.",
    () => [
      c(
        "When a substance melts, its particles…",
        "Can move past each other while remaining close",
        ["Turn into a different element", "Become much larger"],
        "Melting changes arrangement and movement, not particle identity.",
        "Compare arrangement with particle size.",
      ),
      c(
        "Gas pressure comes from…",
        "Particles colliding with container walls",
        [
          "Particles sticking permanently to walls",
          "Particles having no motion",
        ],
        "Collisions transfer momentum to the walls.",
        "What pushes on the container?",
      ),
      c(
        "Nanoparticles generally have a higher surface-area-to-volume ratio than larger particles because…",
        "More of their atoms are at or near the surface",
        ["They contain no atoms", "Their atoms are larger"],
        "Small particles expose more surface for the same amount of material.",
        "Compare surface with bulk.",
      ),
      c(
        "Which size is in the usual nanoparticle range?",
        "50 nm",
        ["50 mm", "50 cm"],
        "The GCSE range is approximately 1 to 100 nanometres.",
        "A nanometre is one billionth of a metre.",
      ),
      c(
        "Why should nanoparticle use be assessed case by case?",
        "Benefits and possible health or environmental risks depend on the material and exposure",
        ["All nanoparticles are harmless", "All nanoparticles are identical"],
        "Size alone does not establish safety or usefulness.",
        "Think about both substance and exposure.",
      ),
      c(
        "Evaporation can occur below boiling point because…",
        "Some surface particles have enough energy to escape",
        ["Every particle has equal energy", "Particles change into atoms"],
        "Particle energies vary; higher-energy surface particles can leave.",
        "Consider the range of particle energies.",
      ),
    ],
  ),
  lesson(
    "formulae-and-mass",
    "quantitative",
    "Formulae and relative mass",
    "Read chemical formulae and calculate relative formula mass.",
    "moles",
    "Relative formula mass is the sum of relative atomic masses for every atom shown in the formula. Relative masses have no units. Brackets multiply every atom inside.",
    () => [
      n(
        "Calculate Mᵣ of H₂O. Use H = 1 and O = 16.",
        18,
        "",
        "2 × 1 + 16 = 18.",
        "Count two hydrogen atoms.",
      ),
      n(
        "Calculate Mᵣ of CO₂. Use C = 12 and O = 16.",
        44,
        "",
        "12 + 2 × 16 = 44.",
        "The subscript applies to oxygen.",
      ),
      n(
        "How many oxygen atoms are shown in Ca(OH)₂?",
        2,
        "atoms",
        "The 2 outside the bracket multiplies both O and H.",
        "Expand the bracket.",
      ),
      n(
        "Calculate Mᵣ of MgCl₂. Use Mg = 24 and Cl = 35.5.",
        95,
        "",
        "24 + 2 × 35.5 = 95.",
        "There are two chlorine atoms.",
      ),
      n(
        "Calculate Mᵣ of CaCO₃. Use Ca = 40, C = 12 and O = 16.",
        100,
        "",
        "40 + 12 + 3 × 16 = 100.",
        "Sum all five atoms.",
      ),
      n(
        "How many hydrogen atoms are shown in (NH₄)₂SO₄?",
        8,
        "atoms",
        "Two ammonium groups contain 2 × 4 = 8 hydrogen atoms.",
        "The bracket multiplier applies to the whole group.",
      ),
    ],
  ),
  lesson(
    "balancing-equations",
    "quantitative",
    "Balancing equations",
    "Conserve atoms by changing coefficients, not formulae.",
    "balance",
    "Atoms are rearranged, not created or destroyed. Balance equations using whole-number coefficients in front of formulae; changing a subscript changes the substance.",
    () => [
      n(
        "In 2H₂ + O₂ → ?H₂O, what is the missing coefficient?",
        2,
        "",
        "Four H atoms and two O atoms form two H₂O molecules.",
        "Count atoms of each element on both sides.",
      ),
      n(
        "In ?Mg + O₂ → 2MgO, what is the missing coefficient?",
        2,
        "",
        "Two MgO units contain two magnesium atoms.",
        "The right side has two Mg atoms.",
      ),
      c(
        "When balancing an equation, change…",
        "Coefficients in front of formulae",
        ["Subscripts inside formulae", "The elements involved"],
        "Coefficients change amounts without changing substances.",
        "H₂O and H₂O₂ are different substances.",
      ),
      n(
        "In N₂ + ?H₂ → 2NH₃, what coefficient is needed for H₂?",
        3,
        "",
        "Two NH₃ molecules contain six H atoms, requiring three H₂ molecules.",
        "Match six hydrogen atoms.",
      ),
      n(
        "In ?Al + 3O₂ → 2Al₂O₃, what coefficient is needed for Al?",
        4,
        "",
        "Two Al₂O₃ units contain four aluminium atoms.",
        "Count the aluminium on the right.",
      ),
      n(
        "In CH₄ + ?O₂ → CO₂ + 2H₂O, what coefficient is needed for O₂?",
        2,
        "",
        "Products contain four oxygen atoms, so two O₂ molecules are needed.",
        "Count oxygen in both products.",
      ),
    ],
  ),
  lesson(
    "conservation-and-concentration",
    "quantitative",
    "Mass and concentration",
    "Explain apparent mass changes and calculate concentration in g/dm³.",
    "moles",
    "Mass is conserved in a closed system. A gas entering or leaving an open container can change its measured mass. Concentration in g/dm³ = mass of solute ÷ volume in dm³.",
    () => [
      n(
        "A closed reaction starts with 12 g of reactants. What total mass of products forms?",
        12,
        "g",
        "In a closed system no matter enters or leaves.",
        "Conserve total mass.",
      ),
      c(
        "A carbonate reacts with acid in an open flask and its measured mass decreases. Why?",
        "Carbon dioxide escapes",
        ["Atoms are destroyed", "The balance removes matter"],
        "Gas leaves the weighed system; total mass including the gas is conserved.",
        "Follow the gas across the system boundary.",
      ),
      n(
        "10 g of solute is dissolved to make 0.5 dm³ of solution. Calculate concentration.",
        20,
        "g/dm³",
        "10 ÷ 0.5 = 20 g/dm³.",
        "Use mass divided by volume.",
      ),
      n(
        "Convert 250 cm³ to dm³.",
        0.25,
        "dm³",
        "1000 cm³ = 1 dm³, so divide by 1000.",
        "A cubic decimetre contains 1000 cubic centimetres.",
      ),
      n(
        "4 g of solute makes 200 cm³ of solution. Calculate concentration.",
        20,
        "g/dm³",
        "200 cm³ = 0.2 dm³; 4 ÷ 0.2 = 20.",
        "Convert volume before dividing.",
      ),
      n(
        "A solution has concentration 30 g/dm³ and volume 0.2 dm³. What solute mass is present?",
        6,
        "g",
        "Mass = concentration × volume = 30 × 0.2 = 6.",
        "Rearrange concentration = mass / volume.",
      ),
    ],
  ),
  lesson(
    "moles-and-reacting-masses",
    "quantitative",
    "Moles and reacting masses",
    "Convert mass to moles and use equation ratios.",
    "moles",
    "Amount in moles = mass in grams ÷ molar mass in g/mol. Balanced equation coefficients give mole ratios, not mass ratios.",
    () => [
      n(
        "How many moles are in 12 g of carbon? Use molar mass 12 g/mol.",
        1,
        "mol",
        "12 ÷ 12 = 1 mol.",
        "Divide mass by molar mass.",
      ),
      n(
        "How many moles are in 9 g of water? Use molar mass 18 g/mol.",
        0.5,
        "mol",
        "9 ÷ 18 = 0.5 mol.",
        "Use n = m/M.",
      ),
      n(
        "What mass is 0.25 mol of CO₂? Use molar mass 44 g/mol.",
        11,
        "g",
        "0.25 × 44 = 11 g.",
        "Use m = nM.",
      ),
      n(
        "For 2Mg + O₂ → 2MgO, how many moles of MgO form from 0.3 mol Mg with excess oxygen?",
        0.3,
        "mol",
        "Mg:MgO is 2:2, or 1:1.",
        "Read the coefficient ratio.",
      ),
      n(
        "For N₂ + 3H₂ → 2NH₃, how many moles of NH₃ form from 0.5 mol N₂ with excess hydrogen?",
        1,
        "mol",
        "The N₂:NH₃ ratio is 1:2, so 0.5 × 2 = 1.",
        "Scale the coefficients.",
      ),
      n(
        "Calculate the mass of 0.2 mol MgO. Use molar mass 40 g/mol.",
        8,
        "g",
        "0.2 × 40 = 8 g.",
        "Multiply amount by molar mass.",
      ),
    ],
    "higher",
  ),
  lesson(
    "yield-and-atom-economy",
    "quantitative",
    "Yield and atom economy",
    "Evaluate how much product is obtained and how efficiently atoms are used.",
    "moles",
    "Percentage yield = actual yield ÷ theoretical yield × 100. Atom economy = formula mass of desired products ÷ formula mass of all products × 100, using balanced coefficients.",
    () => [
      n(
        "The theoretical yield is 20 g and the actual yield is 15 g. Calculate percentage yield.",
        75,
        "%",
        "15 ÷ 20 × 100 = 75%.",
        "Compare actual with theoretical.",
      ),
      c(
        "Why can actual yield be lower than theoretical yield?",
        "Product can be lost during transfer or separation",
        ["Atoms are destroyed", "The balance makes new atoms"],
        "Incomplete reaction and side reactions can also reduce yield.",
        "Consider practical losses.",
      ),
      n(
        "Desired product mass is 40 out of a total product formula mass of 100. What is atom economy?",
        40,
        "%",
        "40 ÷ 100 × 100 = 40%.",
        "Use desired divided by all products.",
      ),
      c(
        "An addition reaction with one product has an atom economy of…",
        "100%",
        ["0%", "50%"],
        "All reactant atoms are in the sole product, assuming the balanced reaction stated.",
        "Where do all the atoms go?",
      ),
      n(
        "The actual yield is 8 g and theoretical yield is 10 g. Calculate percentage yield.",
        80,
        "%",
        "8 ÷ 10 × 100 = 80%.",
        "Use actual/theoretical × 100.",
      ),
      c(
        "Which statement distinguishes yield from atom economy?",
        "Yield measures product obtained; atom economy measures the share of atoms in the desired product",
        ["They are always identical", "Yield counts only catalysts"],
        "A high-atom-economy reaction can still have poor practical yield.",
        "Compare an experimental result with an equation-based measure.",
      ),
    ],
    "higher",
  ),
  lesson(
    "gas-volumes-and-solutions",
    "quantitative",
    "Gas volumes and solutions",
    "Use molar gas volume and concentration in mol/dm³.",
    "moles",
    "At the stated GCSE room temperature and pressure, one mole of gas occupies about 24 dm³. Concentration in mol/dm³ = amount in moles ÷ solution volume in dm³.",
    () => [
      n(
        "Using 24 dm³/mol at room temperature and pressure, what volume is 0.5 mol gas?",
        12,
        "dm³",
        "0.5 × 24 = 12 dm³.",
        "Multiply moles by molar volume.",
      ),
      n(
        "How many moles occupy 48 dm³ using 24 dm³/mol?",
        2,
        "mol",
        "48 ÷ 24 = 2 mol.",
        "Divide volume by molar volume.",
      ),
      n(
        "0.1 mol is dissolved to make 0.5 dm³ solution. What is its concentration?",
        0.2,
        "mol/dm³",
        "0.1 ÷ 0.5 = 0.2.",
        "Use c = n/V.",
      ),
      n(
        "A 0.4 mol/dm³ solution has volume 0.25 dm³. How many moles of solute?",
        0.1,
        "mol",
        "n = cV = 0.4 × 0.25 = 0.1.",
        "Multiply concentration and volume.",
      ),
      n(
        "What volume is 0.25 mol gas using 24 dm³/mol?",
        6,
        "dm³",
        "0.25 × 24 = 6.",
        "Use the stated conditions.",
      ),
      n(
        "0.05 mol is dissolved in 100 cm³ of solution. What is concentration?",
        0.5,
        "mol/dm³",
        "100 cm³ = 0.1 dm³; 0.05 ÷ 0.1 = 0.5.",
        "Convert the volume first.",
      ),
    ],
    "higher",
  ),
  lesson(
    "metal-reactivity",
    "chemical-changes",
    "Metals and reactivity",
    "Predict displacement and connect reactivity to electron loss.",
    "predict",
    "More reactive metals lose electrons more readily. A metal can displace a less reactive metal from its compound. The reactivity series also informs extraction routes.",
    () => [
      c(
        "Zinc is added to copper sulfate solution. What happens?",
        "Copper forms and zinc enters solution",
        [
          "Zinc forms from copper",
          "No reaction because copper is more reactive",
        ],
        "Zinc is more reactive than copper and displaces it.",
        "Compare the metal positions in the reactivity series.",
      ),
      c(
        "Copper is added to magnesium sulfate solution. What happens?",
        "No displacement",
        ["Magnesium metal forms", "Copper becomes magnesium"],
        "Copper is less reactive than magnesium.",
        "Can the added metal displace the dissolved one?",
      ),
      c(
        "A reactive metal tends to…",
        "Lose electrons readily",
        ["Gain protons", "Lose neutrons to water"],
        "Formation of positive ions involves electron loss.",
        "Focus on outer electrons.",
      ),
      c(
        "In metal + acid reactions, the gas usually formed is…",
        "Hydrogen",
        ["Oxygen", "Nitrogen"],
        "Reactive metals above hydrogen can displace it from dilute acids.",
        "Use the usual metal + acid products.",
      ),
      c(
        "Iron can displace which metal from its salt solution?",
        "Copper",
        ["Magnesium", "Potassium"],
        "Iron is more reactive than copper but less reactive than magnesium and potassium.",
        "Choose a less reactive metal.",
      ),
      c(
        "Which metal is extracted industrially by electrolysis rather than reduction with carbon?",
        "Aluminium",
        ["Iron", "Zinc"],
        "Aluminium is more reactive than carbon.",
        "Compare the metal with carbon.",
      ),
    ],
  ),
  lesson(
    "acids-and-neutralisation",
    "chemical-changes",
    "Acids and neutralisation",
    "Predict products and connect acid behaviour with hydrogen ions.",
    "ph",
    "Acids produce H⁺ ions in aqueous solution. Alkalis are soluble bases producing OH⁻. Neutralisation combines these ions to form water; the other ions form a salt.",
    () => [
      c(
        "Acid + alkali generally produces…",
        "Salt and water",
        ["Salt and hydrogen", "Carbon dioxide only"],
        "H⁺ + OH⁻ → H₂O.",
        "Neutralisation removes acid and alkali ions.",
      ),
      c(
        "Hydrochloric acid reacts with sodium hydroxide to form…",
        "Sodium chloride and water",
        ["Sodium sulfate and water", "Sodium nitrate and hydrogen"],
        "The acid supplies chloride ions; the alkali supplies sodium ions.",
        "Name the salt from the acid and base.",
      ),
      c(
        "Acid + carbonate produces a salt, water and…",
        "Carbon dioxide",
        ["Hydrogen", "Oxygen"],
        "The carbonate group forms CO₂ and water with acid.",
        "Which gas turns limewater cloudy?",
      ),
      c(
        "Which ion is produced by an alkali in aqueous solution?",
        "OH⁻",
        ["Cl⁻", "Na⁻"],
        "Hydroxide ions are responsible for alkaline behaviour.",
        "Identify the negative ion in a hydroxide.",
      ),
      c(
        "Sulfuric acid forms salts called…",
        "Sulfates",
        ["Chlorides", "Nitrates"],
        "Salt names preserve the acid-derived negative ion.",
        "Match the acid name.",
      ),
      c(
        "The net ionic equation for neutralisation is…",
        "H⁺ + OH⁻ → H₂O",
        ["H₂ + O₂ → H₂O", "Na⁺ + Cl⁻ → H₂"],
        "Hydrogen and hydroxide ions combine to form water.",
        "Spectator ions are omitted.",
      ),
    ],
  ),
  lesson(
    "making-soluble-salts",
    "chemical-changes",
    "Making soluble salts",
    "Choose a method and explain filtration and crystallisation.",
    "predict",
    "An insoluble base can be added in excess to acid. Filter off unreacted solid, gently evaporate some water, then cool to crystallise. Practical work must be supervised in a school laboratory.",
    () => [
      c(
        "Why add copper oxide until some remains unreacted?",
        "To ensure all the acid has reacted",
        ["To make the solution more acidic", "To dissolve the filter paper"],
        "Excess insoluble base indicates the acid has been used up.",
        "The unreacted solid is evidence of excess base.",
      ),
      c(
        "After adding excess insoluble base, what removes the extra solid?",
        "Filtration",
        ["Distillation", "Chromatography"],
        "The insoluble solid stays as residue; salt solution is the filtrate.",
        "Separate a solid from a liquid.",
      ),
      c(
        "Why cool a concentrated salt solution?",
        "To form crystals as solubility decreases",
        ["To change protons into neutrons", "To make a gas"],
        "Cooling can allow dissolved salt to crystallise.",
        "Consider how much solute remains dissolved.",
      ),
      c(
        "Copper oxide and sulfuric acid form…",
        "Copper sulfate and water",
        ["Copper chloride and hydrogen", "Sodium sulfate and oxygen"],
        "Metal oxide + acid → salt + water.",
        "The acid determines the salt ending.",
      ),
      c(
        "Which method makes a soluble salt from acid and a soluble alkali without excess reagent?",
        "Titration",
        ["Filtration alone", "Adding unlimited alkali"],
        "Titration finds the neutralising volumes; soluble excess cannot be filtered out.",
        "Both starting materials are in solution.",
      ),
      c(
        "Why should a hot concentrated solution not simply be heated to complete dryness?",
        "It can spit and some salts may decompose",
        ["It prevents all evaporation", "It removes protons"],
        "Gentle concentration and cooling give a controlled crystallisation method.",
        "Think about safe, controlled separation.",
      ),
    ],
  ),
  lesson(
    "electrolysis",
    "chemical-changes",
    "Electrolysis",
    "Follow mobile ions to electrodes and predict molten products.",
    "electrolysis",
    "Electrolysis decomposes an ionic substance using electricity. Positive ions move to the negative cathode and gain electrons; negative ions move to the positive anode and lose electrons.",
    () => [
      c(
        "A molten ionic compound can be electrolysed because…",
        "Its ions can move",
        ["Its nuclei split", "It contains neutral molecules only"],
        "Mobile ions carry current and reach the electrodes.",
        "Compare a molten salt with a solid salt.",
      ),
      c(
        "Positive ions move towards the…",
        "Negative cathode",
        ["Positive anode", "Container wall only"],
        "Opposite charges attract.",
        "Use the electrode charge.",
      ),
      c(
        "Molten lead bromide produces lead at the…",
        "Cathode",
        ["Anode", "Surface only"],
        "Pb²⁺ gains electrons to form lead metal.",
        "Positive metal ions gain electrons.",
      ),
      c(
        "At the anode, negative ions…",
        "Lose electrons",
        ["Gain protons", "Gain electrons"],
        "Oxidation occurs at the anode.",
        "Anode processes release electrons.",
      ),
      c(
        "Molten sodium chloride produces which substance at the anode?",
        "Chlorine",
        ["Sodium", "Hydrogen"],
        "Chloride ions lose electrons to form Cl₂.",
        "Only sodium and chloride ions are present.",
      ),
      c(
        "Why is aluminium oxide dissolved in molten cryolite during extraction?",
        "To lower the operating temperature and energy requirement",
        ["To remove all ions", "To make aluminium less reactive"],
        "The mixture melts at a lower temperature than pure aluminium oxide.",
        "Consider the very high melting point of the oxide.",
      ),
    ],
  ),
  lesson(
    "aqueous-electrolysis",
    "chemical-changes",
    "Aqueous electrolysis and redox",
    "Include water-derived ions and identify oxidation and reduction.",
    "electrolysis",
    "Water introduces competing H⁺ and OH⁻ ions. In common aqueous GCSE examples, a metal less reactive than hydrogen forms at the cathode; otherwise hydrogen forms. Anode products depend on ions, concentration and electrodes.",
    () => [
      c(
        "With inert electrodes, aqueous copper sulfate gives which cathode product?",
        "Copper",
        ["Sulfur", "Oxygen"],
        "Copper is less reactive than hydrogen and copper ions are reduced.",
        "Compare copper with hydrogen.",
      ),
      c(
        "With inert electrodes, aqueous sodium sulfate gives which cathode product?",
        "Hydrogen",
        ["Sodium", "Sulfur"],
        "Sodium is too reactive to be deposited from this aqueous solution.",
        "Water-derived ions compete.",
      ),
      c(
        "For concentrated aqueous sodium chloride and inert electrodes, the anode product is…",
        "Chlorine",
        ["Sodium", "Hydrogen"],
        "Under these stated conditions chloride ions are oxidised to chlorine.",
        "The concentration and electrodes are specified.",
      ),
      c(
        "Reduction means…",
        "Gain of electrons",
        ["Loss of electrons", "Gain of neutrons"],
        "Use OIL RIG: oxidation is loss, reduction is gain.",
        "Think about the second half of OIL RIG.",
      ),
      c(
        "Cu²⁺ + 2e⁻ → Cu is…",
        "Reduction",
        ["Oxidation", "Neutralisation"],
        "Copper ions gain electrons.",
        "Look at the side containing electrons.",
      ),
      c(
        "With inert electrodes, oxygen forms at the anode in aqueous copper sulfate mainly from…",
        "Water-derived hydroxide ions",
        ["Copper ions", "Sulfate turning into sulfur metal"],
        "Hydroxide ions are oxidised; sulfate remains in solution.",
        "The anode oxidises a negative ion.",
      ),
    ],
    "higher",
  ),
  lesson(
    "ph-and-strong-acids",
    "chemical-changes",
    "pH and acid strength",
    "Distinguish strength, concentration and logarithmic pH.",
    "ph",
    "Strength describes the extent of ionisation, not how much acid is dissolved. Strong acids ionise completely in water; weak acids partially ionise. A fall of one pH unit means ten times the hydrogen ion concentration.",
    () => [
      c(
        "A strong acid is one that…",
        "Ionises completely in water",
        ["Is always concentrated", "Has a large molecular mass"],
        "Strength is about ionisation, whereas concentration is amount per volume.",
        "Separate strength from concentration.",
      ),
      c(
        "A solution changes from pH 4 to pH 3. Its H⁺ concentration…",
        "Increases tenfold",
        ["Halves", "Increases twofold"],
        "The pH scale is logarithmic.",
        "One pH step is a factor of ten.",
      ),
      c(
        "Diluting an acidic solution with water usually makes its pH…",
        "Rise towards 7",
        ["Fall away from 7", "Become 14 immediately"],
        "Hydrogen ion concentration decreases on dilution.",
        "Less concentrated H⁺ means a higher pH.",
      ),
      c(
        "A weak acid in water is…",
        "Partially ionised",
        ["Not acidic at all", "Always less concentrated than a strong acid"],
        "Some molecules remain un-ionised at equilibrium.",
        "Weak does not mean no ions.",
      ),
      n(
        "By what factor is H⁺ concentration greater at pH 2 than at pH 4?",
        100,
        "",
        "Two pH units correspond to 10 × 10 = 100.",
        "Use a factor of ten for each step.",
      ),
      c(
        "Which statement can be true?",
        "A strong acid can be dilute",
        ["All dilute acids are weak", "All weak acids are neutral"],
        "Strength and concentration describe different properties.",
        "Ionisation fraction and amount per volume are separate.",
      ),
    ],
    "higher",
  ),
  lesson(
    "exothermic-and-endothermic",
    "energy",
    "Exothermic and endothermic",
    "Track energy between the reacting system and surroundings.",
    "energy",
    "Exothermic reactions transfer energy to the surroundings, which usually warm up. Endothermic reactions take energy from the surroundings, which usually cool down. Chemical energy changes are about a system boundary.",
    () => [
      c(
        "A reaction warms the surrounding solution. It is…",
        "Exothermic",
        ["Endothermic", "Neither, because temperature changed"],
        "Energy has been transferred from the reacting chemicals to the surroundings.",
        "Follow the energy direction.",
      ),
      c(
        "An endothermic reaction transfers energy…",
        "From surroundings to the reaction",
        ["From the reaction to surroundings", "Only between nuclei"],
        "Surroundings may cool as they supply energy.",
        "Endo means taking energy in.",
      ),
      c(
        "Which is commonly exothermic?",
        "Combustion",
        ["Thermal decomposition", "Photosynthesis"],
        "Fuel combustion releases energy to the surroundings.",
        "Think about a flame heating its surroundings.",
      ),
      n(
        "A solution starts at 20 °C and reaches 32 °C. What is its temperature increase?",
        12,
        "°C",
        "32 − 20 = 12 °C.",
        "Final minus initial.",
      ),
      c(
        "Thermal decomposition is usually…",
        "Endothermic",
        ["Exothermic", "A physical freezing change"],
        "Energy is supplied to break down the compound.",
        "Heating is required to sustain the decomposition.",
      ),
      c(
        "If surrounding temperature falls during a reaction, the reaction is usually…",
        "Endothermic",
        ["Exothermic", "Always combustion"],
        "Energy moves into the reacting system.",
        "The surroundings lose thermal energy.",
      ),
    ],
  ),
  lesson(
    "reaction-profiles",
    "energy",
    "Reaction profiles",
    "Read activation energy and overall energy change.",
    "energy",
    "A reaction profile shows relative energy along a reaction pathway. Activation energy is the rise from reactants to the peak. Overall change is product energy minus reactant energy.",
    () => [
      c(
        "In an exothermic profile, products are…",
        "Lower in energy than reactants",
        ["Higher in energy than reactants", "Always at zero energy"],
        "The energy difference is transferred to surroundings.",
        "Compare initial and final energy levels.",
      ),
      n(
        "Reactants are at 40 kJ and the peak is at 100 kJ. What is activation energy?",
        60,
        "kJ",
        "100 − 40 = 60 kJ.",
        "Measure from reactants to the peak.",
      ),
      n(
        "Reactants are at 80 kJ and products at 30 kJ. Calculate product energy minus reactant energy.",
        -50,
        "kJ",
        "30 − 80 = −50 kJ, an exothermic change.",
        "Keep the sign of final minus initial.",
      ),
      c(
        "Activation energy is…",
        "The minimum energy needed for a successful reaction",
        ["The total energy released", "Always equal to the product energy"],
        "Colliding particles must overcome an energy barrier.",
        "The peak represents a barrier.",
      ),
      n(
        "Reactants are at 20 kJ and products at 55 kJ. What is the overall energy change?",
        35,
        "kJ",
        "55 − 20 = +35 kJ; the reaction is endothermic.",
        "Use final minus initial.",
      ),
      c(
        "A catalyst changes a profile by…",
        "Providing a route with lower activation energy",
        ["Changing reactant and product energies", "Making atoms disappear"],
        "It changes the pathway, not the overall reaction energy.",
        "Distinguish the barrier from the level difference.",
      ),
    ],
  ),
  lesson(
    "bond-energy",
    "energy",
    "Bond energy calculations",
    "Calculate energy changes from bonds broken and formed.",
    "energy",
    "Breaking bonds requires energy. Forming bonds releases energy. Approximate reaction energy = total energy to break bonds − total energy released by forming bonds.",
    () => [
      c(
        "Breaking a covalent bond is…",
        "Endothermic",
        ["Exothermic", "Always energy-neutral"],
        "Energy is needed to overcome the attraction.",
        "You must supply energy to separate bonded atoms.",
      ),
      n(
        "Breaking bonds requires 600 kJ/mol and forming bonds releases 800 kJ/mol. Calculate reaction energy.",
        -200,
        "kJ/mol",
        "600 − 800 = −200 kJ/mol.",
        "Broken minus formed.",
      ),
      c(
        "A reaction is exothermic when…",
        "Bond formation releases more energy than bond breaking requires",
        ["All bonds become weaker", "Bond breaking releases energy"],
        "The extra energy is transferred to the surroundings.",
        "Compare the two energy totals.",
      ),
      n(
        "Two H–H bonds are broken, each requiring 436 kJ/mol. What is the total energy?",
        872,
        "kJ/mol",
        "2 × 436 = 872.",
        "Count every bond broken.",
      ),
      n(
        "Breaking costs 950 kJ/mol and formation releases 700 kJ/mol. What is reaction energy?",
        250,
        "kJ/mol",
        "950 − 700 = +250 kJ/mol.",
        "A positive value means net energy input.",
      ),
      c(
        "Mean bond energies give approximate reaction changes because…",
        "Bond energy varies with the chemical environment",
        ["Mass is not conserved", "All bonds have zero energy"],
        "Mean values average across different compounds.",
        "The word mean signals an average.",
      ),
    ],
    "higher",
  ),
  lesson(
    "energy-practical",
    "energy",
    "Temperature changes",
    "Control variables and evaluate temperature measurements.",
    "predict",
    "Temperature-change investigations compare controlled amounts of reactants, record the starting temperature and peak or minimum, and reduce heat exchange with surroundings. A temperature rise is not itself an energy in joules.",
    () => [
      c(
        "Which helps reduce heat loss in a school calorimetry experiment?",
        "An insulated cup with a lid",
        ["An open metal tray", "A very large uninsulated container"],
        "Insulation reduces unwanted energy transfer.",
        "Keep the system closer to thermally isolated.",
      ),
      c(
        "To compare two reactions fairly, a useful controlled variable is…",
        "The volume of solution",
        ["The final temperature by force", "The result you hope to obtain"],
        "Changing solution amount also changes its heat capacity.",
        "Hold a relevant condition constant.",
      ),
      c(
        "Why stir the solution before reading temperature?",
        "To make temperature more uniform",
        ["To create more atoms", "To lower all activation energies"],
        "Stirring reduces temperature differences within the solution.",
        "The thermometer measures only its location.",
      ),
      c(
        "Heat loss in an exothermic experiment makes the measured temperature rise…",
        "Smaller than the ideal rise",
        ["Larger than the ideal rise", "Exactly unchanged"],
        "Some released energy warms the wider surroundings.",
        "Where else can energy go?",
      ),
      n(
        "In a controlled experiment, the initial temperature is 21 °C and peak is 29.5 °C. Calculate the rise.",
        8.5,
        "°C",
        "29.5 − 21 = 8.5.",
        "Use the peak minus the start.",
      ),
      c(
        "Repeating measurements is useful because…",
        "It reveals variability and supports a more reliable mean",
        [
          "It guarantees the method has no systematic error",
          "It forces every result to match",
        ],
        "Repeats do not remove calibration or heat-loss bias.",
        "Distinguish random variation from systematic error.",
      ),
    ],
  ),
  lesson(
    "cells-and-fuel-cells",
    "energy",
    "Cells and fuel cells",
    "Explain chemical cells and compare hydrogen fuel cells with batteries.",
    "predict",
    "Chemical cells supply a potential difference from reactions. Rechargeable cells reverse their reactions using an external electrical supply. Hydrogen fuel cells react hydrogen and oxygen while reactants are supplied.",
    () => [
      c(
        "A chemical cell transfers energy from…",
        "Chemical stores to electrical work",
        ["Electrical work to a new element", "Gravity to nuclear energy"],
        "Redox reactions can drive electron flow through a circuit.",
        "Identify the energy source.",
      ),
      c(
        "A rechargeable cell is recharged by…",
        "Using electrical energy to reverse its reactions",
        ["Adding arbitrary acid every time", "Creating protons from electrons"],
        "An external supply drives the reverse chemical change.",
        "Recharge means restoring the chemical reactants.",
      ),
      c(
        "The main reaction product in a hydrogen–oxygen fuel cell is…",
        "Water",
        ["Carbon dioxide", "Methane"],
        "Hydrogen combines with oxygen to produce H₂O.",
        "Neither reactant contains carbon.",
      ),
      c(
        "Why is a hydrogen fuel cell not automatically carbon-free overall?",
        "Producing and transporting hydrogen may cause emissions",
        ["Water contains carbon", "Every fuel cell burns coal internally"],
        "Evaluate the whole supply chain, not only the cell outlet.",
        "Consider how hydrogen is made.",
      ),
      c(
        "A fuel cell continues operating while…",
        "Fuel and oxidant are supplied",
        [
          "Its reactants are never replenished",
          "It is disconnected from all chemistry",
        ],
        "Reactants are fed in and products removed.",
        "Compare fuel cells with sealed batteries.",
      ),
      c(
        "A limitation of hydrogen as a transport fuel is…",
        "Storage and distribution can be difficult",
        ["It always produces soot in a fuel cell", "It has no chemical energy"],
        "Safe storage and infrastructure matter.",
        "Consider transport and storage conditions.",
      ),
    ],
    "foundation",
    "separate",
  ),
  lesson(
    "measuring-rates",
    "rates",
    "Measuring reaction rates",
    "Calculate mean rate and interpret reaction progress graphs.",
    "rate",
    "Mean rate = amount of reactant used or product formed ÷ time. A steeper product–time graph means a faster instantaneous rate. The curve levels off when reaction stops.",
    () => [
      n(
        "A reaction makes 60 cm³ gas in 20 s. What is its mean rate?",
        3,
        "cm³/s",
        "60 ÷ 20 = 3.",
        "Amount divided by time.",
      ),
      c(
        "A gas-volume curve is steepest at the start. This means…",
        "The reaction is initially fastest",
        ["No gas is being formed", "The total gas volume is decreasing"],
        "Gradient represents the rate of product formation.",
        "Compare how much the volume changes each second.",
      ),
      c(
        "Why does the curve often flatten over time?",
        "Reactants are used up so successful collisions become less frequent",
        ["Atoms stop existing", "The measuring cylinder grows"],
        "Reactant availability decreases; eventually a limiting reactant is exhausted.",
        "Follow the changing reactant amounts.",
      ),
      n(
        "30 g of reactant is used in 15 s. Calculate mean rate.",
        2,
        "g/s",
        "30 ÷ 15 = 2.",
        "Use the units of amount per second.",
      ),
      n(
        "A reaction forms 24 cm³ gas in 8 s. Calculate mean rate.",
        3,
        "cm³/s",
        "24 ÷ 8 = 3.",
        "Divide product amount by elapsed time.",
      ),
      c(
        "On a product amount against time graph, instantaneous rate is found from…",
        "The gradient of a tangent",
        ["The final volume alone", "The area of the page"],
        "A tangent approximates the rate at one moment.",
        "Instantaneous means at a particular time.",
      ),
    ],
  ),
  lesson(
    "collision-theory",
    "rates",
    "Collision theory",
    "Explain effects of concentration, pressure and surface area.",
    "rate",
    "A successful collision needs enough energy and an appropriate orientation. Higher concentration or gas pressure brings more particles into a given volume. Smaller solid pieces expose more surface.",
    () => [
      c(
        "Increasing reactant concentration usually increases rate because…",
        "Collisions occur more frequently",
        [
          "Each particle becomes larger",
          "Activation energy automatically becomes zero",
        ],
        "More particles per unit volume increases collision frequency.",
        "Count particles in the same space.",
      ),
      c(
        "Powder reacts faster than a large lump of the same mass because…",
        "More surface is exposed",
        ["It contains different atoms", "Its mass is greater"],
        "More reactant particles are accessible at the solid surface.",
        "Compare exposed area at fixed mass.",
      ),
      c(
        "Increasing pressure speeds a gas reaction mainly by…",
        "Bringing particles closer together",
        ["Changing each particle into a solid", "Removing all collisions"],
        "There are more gas particles per unit volume.",
        "Connect pressure with concentration.",
      ),
      c(
        "Why does not every collision react?",
        "Some lack enough energy or a suitable orientation",
        ["Atoms can never rearrange", "Particles always repel completely"],
        "A collision must overcome the activation barrier and allow bond rearrangement.",
        "Use the conditions for a successful collision.",
      ),
      c(
        "Doubling concentration does not necessarily double rate because…",
        "The rate relationship depends on the reaction and conditions",
        ["Concentration is irrelevant", "Collision theory is always false"],
        "GCSE predicts a tendency; exact rate laws require more information.",
        "Do not assume an unstated mathematical law.",
      ),
      c(
        "Which variable is changed when equal masses of marble chips and powder are compared?",
        "Surface area",
        ["Chemical formula", "Total reactant mass"],
        "Particle size changes accessible surface while the mass is held constant.",
        "Identify the intended independent variable.",
      ),
    ],
  ),
  lesson(
    "temperature-and-catalysts",
    "rates",
    "Temperature and catalysts",
    "Distinguish more energetic collisions from a lower activation barrier.",
    "rate",
    "Increasing temperature raises particle energies and the fraction above activation energy. A catalyst provides an alternative reaction pathway with lower activation energy and is not consumed overall.",
    () => [
      c(
        "Raising temperature increases rate especially because…",
        "A greater fraction of collisions have enough energy",
        [
          "Every molecule becomes a new element",
          "Activation energy must increase",
        ],
        "The energy distribution shifts so more particles exceed the barrier.",
        "Think about the high-energy fraction.",
      ),
      c(
        "A catalyst increases rate by…",
        "Lowering activation energy through another pathway",
        [
          "Increasing the amount of product possible from fixed reactants",
          "Being used up as the main reactant",
        ],
        "It changes the route, not the stoichiometric amount available.",
        "Separate rate from final yield.",
      ),
      c(
        "A catalyst after a reaction is…",
        "Not consumed overall",
        ["Always destroyed", "Always converted into the product"],
        "It may participate in intermediate steps but is regenerated.",
        "Overall consumption is the key.",
      ),
      c(
        "Using a catalyst at the same reactant amounts usually changes…",
        "Time to completion, not the maximum product amount",
        [
          "The number of conserved atoms",
          "The product into an unrelated element",
        ],
        "Rate and total product amount are distinct.",
        "Ask what can alter limiting reactant quantity.",
      ),
      c(
        "Which statement about temperature is correct?",
        "Particles move faster on average and more can overcome the energy barrier",
        [
          "All particles have identical energy",
          "Only the final product mass increases",
        ],
        "Both frequency and energy of collisions can increase.",
        "Use average rather than all.",
      ),
      c(
        "A catalyst changes which quantity?",
        "Activation energy",
        ["Overall reaction energy change", "Atomic numbers"],
        "Reactant and product energy levels remain the same.",
        "Think about the alternative pathway.",
      ),
    ],
  ),
  lesson(
    "reversible-reactions",
    "rates",
    "Reversible reactions and equilibrium",
    "Explain dynamic equilibrium in a closed system.",
    "equilibrium",
    "At dynamic equilibrium in a closed system, forward and reverse reactions continue at equal rates. Concentrations stay constant but need not be equal.",
    () => [
      c(
        "Dynamic equilibrium requires…",
        "A closed system with equal forward and reverse rates",
        ["No particle movement", "Equal masses of all substances"],
        "Both directions continue and balance one another.",
        "Dynamic means processes continue.",
      ),
      c(
        "At equilibrium, reactant and product concentrations are…",
        "Constant but not necessarily equal",
        ["Always exactly equal", "Both zero"],
        "Equal rates mean no net concentration change.",
        "Rates and concentrations are different quantities.",
      ),
      c(
        "What does ⇌ indicate?",
        "A reaction can proceed in both directions",
        ["No reaction is possible", "Electrons are destroyed"],
        "Products can react to regenerate reactants.",
        "Read the two arrows.",
      ),
      c(
        "Opening a closed gas reaction vessel can disrupt equilibrium because…",
        "Matter can enter or leave",
        ["Atoms lose mass", "Reversibility disappears from every reaction"],
        "The system boundary and concentrations have changed.",
        "Equilibrium needs specified conditions.",
      ),
      c(
        "If the forward rate exceeds the reverse rate, the system is…",
        "Not yet at equilibrium",
        ["At equilibrium by definition", "Unable to make products"],
        "There is a net change towards products.",
        "Compare the two rates.",
      ),
      c(
        "At equilibrium, adding a catalyst makes…",
        "Both directions faster without changing equilibrium position",
        ["Only the forward direction faster", "The equilibrium stop"],
        "Both pathways have lower activation barriers.",
        "Catalysts do not favour one equilibrium side.",
      ),
    ],
  ),
  lesson(
    "changing-equilibrium",
    "rates",
    "Changing equilibrium",
    "Predict responses to concentration, pressure and temperature.",
    "equilibrium",
    "An equilibrium responds to a change in conditions in the direction that opposes that change. Pressure matters for gases when the two sides have different numbers of gas molecules.",
    () => [
      c(
        "For N₂ + 3H₂ ⇌ 2NH₃, increasing pressure favours…",
        "Ammonia",
        [
          "Nitrogen and hydrogen",
          "Neither, because both sides have equal gas counts",
        ],
        "The product side has 2 gas molecules compared with 4 on the reactant side.",
        "Count gaseous coefficients.",
      ),
      c(
        "The forward reaction is exothermic. Increasing temperature favours…",
        "The reverse, endothermic direction",
        ["The forward direction", "Neither direction ever"],
        "The equilibrium responds by absorbing added thermal energy.",
        "Choose the direction that takes energy in.",
      ),
      c(
        "Adding a reactant usually shifts an equilibrium towards…",
        "Products",
        ["More of that reactant", "No possible change"],
        "The system tends to use up some of the added reactant.",
        "Oppose the concentration change.",
      ),
      c(
        "Removing a product generally favours…",
        "More product formation",
        ["Reactant formation only", "Complete cessation"],
        "The system tends to replace some removed product.",
        "Respond to removal.",
      ),
      c(
        "For H₂ + I₂ ⇌ 2HI, all gaseous, changing pressure does not shift position because…",
        "Both sides have two gas molecules",
        ["No gases are present", "HI is not a substance"],
        "The total gaseous coefficient is equal on both sides.",
        "Count particles per balanced equation.",
      ),
      c(
        "For an exothermic forward reaction, lowering temperature increases equilibrium product yield but can…",
        "Slow the rate",
        ["Remove the need for reactants", "Increase all molecular speeds"],
        "Yield and practical rate can pull in opposite directions.",
        "Equilibrium position is not reaction speed.",
      ),
    ],
    "higher",
  ),
  lesson(
    "crude-oil-and-fractions",
    "organic",
    "Crude oil and fractions",
    "Explain fractional distillation and trends in hydrocarbon fractions.",
    "organic",
    "Crude oil is a mixture of hydrocarbons. Fractional distillation separates groups with different boiling ranges. Longer-chain hydrocarbons generally have higher boiling points and viscosity and lower flammability.",
    () => [
      c(
        "Crude oil is…",
        "A mixture of hydrocarbons",
        ["One pure compound", "A metal lattice"],
        "It contains many molecules made mainly from carbon and hydrogen.",
        "Mixture means more than one substance.",
      ),
      c(
        "Fractional distillation separates substances by differences in…",
        "Boiling point",
        ["Atomic number", "Electrical charge only"],
        "Fractions vaporise and condense over different temperature ranges.",
        "A change of state is used.",
      ),
      c(
        "Longer-chain hydrocarbons generally have…",
        "Higher boiling points",
        ["Lower boiling points", "No intermolecular forces"],
        "Larger molecules generally have stronger intermolecular attractions.",
        "Compare the energy needed to separate molecules.",
      ),
      c(
        "Short-chain fractions are generally…",
        "More flammable and less viscous",
        ["Less flammable and more viscous", "Always ionic"],
        "They ignite more readily and flow more easily.",
        "Recall trends with chain length.",
      ),
      c(
        "A fraction is…",
        "A mixture with a similar boiling range",
        ["Always one pure molecule", "A reaction product of a catalyst"],
        "Fractional distillation groups substances; it does not usually isolate one compound.",
        "A fraction still contains several hydrocarbons.",
      ),
      c(
        "Fractional distillation is primarily a…",
        "Physical separation",
        ["Nuclear reaction", "Reaction changing every formula"],
        "Molecules are separated without changing their identities.",
        "No new substances are required.",
      ),
    ],
  ),
  lesson(
    "alkanes-and-combustion",
    "organic",
    "Alkanes and combustion",
    "Use alkane formulae and distinguish complete from incomplete combustion.",
    "organic",
    "Alkanes are saturated hydrocarbons with formula CₙH₂ₙ₊₂. Complete combustion produces CO₂ and H₂O. Incomplete combustion can produce toxic CO and soot when oxygen is limited.",
    () => [
      n(
        "An alkane has 3 carbon atoms. How many hydrogen atoms does its formula contain?",
        8,
        "atoms",
        "2 × 3 + 2 = 8, so propane is C₃H₈.",
        "Use 2n + 2.",
      ),
      c(
        "A saturated hydrocarbon contains…",
        "Only single carbon–carbon bonds",
        ["At least one C=C bond", "A metal ion"],
        "Alkanes have no carbon–carbon double bonds.",
        "Saturated describes bonding, not concentration.",
      ),
      c(
        "Complete combustion of a hydrocarbon forms…",
        "Carbon dioxide and water",
        ["Carbon monoxide only", "Hydrogen and oxygen"],
        "Carbon and hydrogen are fully oxidised when oxygen is sufficient.",
        "Track the two elements in the fuel.",
      ),
      c(
        "Carbon monoxide is dangerous because it…",
        "Reduces the blood’s ability to carry oxygen",
        ["Is strongly coloured", "Always has a sharp smell"],
        "It binds strongly to haemoglobin and is colourless and odourless.",
        "A lack of smell does not mean safety.",
      ),
      n(
        "An alkane has 5 carbon atoms. How many hydrogen atoms?",
        12,
        "atoms",
        "2 × 5 + 2 = 12, so pentane is C₅H₁₂.",
        "Substitute n = 5.",
      ),
      c(
        "Soot forms particularly when combustion has…",
        "Insufficient oxygen",
        ["Unlimited oxygen", "No carbon-containing fuel"],
        "Incomplete oxidation can leave solid carbon particles.",
        "Consider oxygen supply.",
      ),
    ],
  ),
  lesson(
    "cracking-and-alkenes",
    "organic",
    "Cracking and alkenes",
    "Conserve atoms during cracking and test for unsaturation.",
    "organic",
    "Cracking breaks long hydrocarbons into smaller, more useful molecules using high temperature and a catalyst or steam. Alkenes contain a carbon–carbon double bond and decolourise bromine water.",
    () => [
      c(
        "Cracking converts long-chain hydrocarbons into…",
        "Smaller alkanes and alkenes",
        ["Only water", "Larger metal ions"],
        "Products often include a saturated and an unsaturated hydrocarbon.",
        "The carbon chain is broken.",
      ),
      c(
        "Which formula is an alkene in the simple one-double-bond series?",
        "C₂H₄",
        ["C₂H₆", "CH₄"],
        "Alkenes in this series have formula CₙH₂ₙ.",
        "Compare 2n with 2n + 2.",
      ),
      c(
        "Ethene added to bromine water makes it…",
        "Change from orange to colourless",
        ["Become purple", "Stay orange in a successful test"],
        "Bromine adds across the carbon–carbon double bond.",
        "This tests unsaturation.",
      ),
      n(
        "In C₁₀H₂₂ → C₈H₁₈ + C₂H?, what hydrogen subscript is missing?",
        4,
        "",
        "22 − 18 = 4, giving ethene C₂H₄.",
        "Conserve hydrogen atoms.",
      ),
      c(
        "An alkene is unsaturated because it…",
        "Contains a carbon–carbon double bond",
        ["Contains no hydrogen", "Cannot burn"],
        "The double bond permits addition reactions.",
        "Identify the bonding feature.",
      ),
      c(
        "Why is cracking useful?",
        "It makes shorter fuels and alkenes for chemical manufacture",
        ["It creates carbon atoms", "It removes every pollutant automatically"],
        "Demand for smaller fuels and polymer feedstocks can exceed natural supply.",
        "Connect products with their uses.",
      ),
    ],
  ),
  lesson(
    "alcohols-and-acids",
    "organic",
    "Alcohols and carboxylic acids",
    "Recognise functional groups and characteristic reactions.",
    "organic",
    "Alcohols contain an –OH group. Carboxylic acids contain –COOH and are weak acids in water. Ethanol can be oxidised to ethanoic acid. Different functional groups give different chemistry.",
    () => [
      c(
        "Which functional group identifies an alcohol?",
        "–OH",
        ["–COOH", "C=C"],
        "The hydroxyl group is attached to a carbon atom.",
        "Compare the group labels.",
      ),
      c(
        "Which group identifies a carboxylic acid?",
        "–COOH",
        ["–OH only", "–Cl"],
        "The carboxyl group contains both C=O and O–H.",
        "Find the complete acid group.",
      ),
      c(
        "Oxidation of ethanol can form…",
        "Ethanoic acid",
        ["Methane", "Sodium chloride"],
        "The carbon skeleton remains two carbons while the functional group is oxidised.",
        "Match ethanol with its corresponding acid.",
      ),
      c(
        "A carboxylic acid reacts with a carbonate to produce…",
        "Salt, water and carbon dioxide",
        ["Salt and oxygen only", "A metal and hydrogen"],
        "It shows typical acid behaviour.",
        "Use acid + carbonate products.",
      ),
      c(
        "Ethanol burns completely to form…",
        "Carbon dioxide and water",
        ["Only oxygen", "Only ethanoic acid"],
        "Combustion oxidises the carbon and hydrogen fully with sufficient oxygen.",
        "Distinguish combustion from controlled oxidation.",
      ),
      c(
        "Ethanoic acid is weak because in water it…",
        "Only partially ionises",
        ["Cannot react with carbonates", "Is always dilute"],
        "The extent of ionisation defines acid strength.",
        "Strength is not concentration.",
      ),
    ],
    "foundation",
    "separate",
  ),
  lesson(
    "polymers",
    "organic",
    "Polymers",
    "Connect monomers, repeating units and material properties.",
    "organic",
    "Addition polymerisation opens alkene double bonds to join monomers without another product. Condensation polymerisation uses monomers with two reactive groups and eliminates a small molecule.",
    () => [
      c(
        "The monomer for poly(ethene) is…",
        "Ethene",
        ["Ethane", "Methane"],
        "Ethene has the double bond needed for addition polymerisation.",
        "Remove the poly prefix.",
      ),
      c(
        "In addition polymerisation, the C=C bond…",
        "Opens to form single bonds linking monomers",
        [
          "Turns into a metal bond",
          "Remains a double bond between each monomer",
        ],
        "The polymer backbone links many carbon units.",
        "The second bond allows chain growth.",
      ),
      c(
        "A monomer is…",
        "A small molecule that can join into a polymer",
        ["Always a giant ionic lattice", "A catalyst that never reacts"],
        "Many monomer units combine into a large molecule.",
        "Mono means one unit.",
      ),
      c(
        "Addition polymerisation usually makes…",
        "Only the polymer as the reaction product",
        ["The polymer plus water every time", "Only hydrogen gas"],
        "No small molecule is eliminated in addition polymerisation.",
        "Contrast addition with condensation.",
      ),
      c(
        "Why can polymers have different properties?",
        "Chain structure and forces between chains differ",
        ["All polymers are identical", "Polymers have no atoms"],
        "Branching, crosslinks and intermolecular attractions affect behaviour.",
        "Connect structure to material use.",
      ),
      c(
        "Breaking a polymer into monomers is a chemical change because…",
        "Covalent bonds are broken and substances change",
        ["Only the colour changes", "No bonds are involved"],
        "Polymer chains are chemically linked.",
        "Consider what must change in the chain.",
      ),
    ],
  ),
  lesson(
    "organic-reactions",
    "organic",
    "Organic reaction pathways",
    "Predict addition and condensation products.",
    "organic",
    "Alkenes undergo addition with hydrogen, water or halogens. Alcohol plus carboxylic acid can form an ester and water. Condensation polymers form through repeated reactions of two functional groups.",
    () => [
      c(
        "Adding hydrogen to ethene forms…",
        "Ethane",
        ["Ethanol", "Ethanoic acid"],
        "Hydrogen adds across C=C to make a saturated molecule.",
        "Add two hydrogen atoms.",
      ),
      c(
        "Adding steam to ethene under suitable catalytic conditions forms…",
        "Ethanol",
        ["Methane", "Sodium ethanoate"],
        "Hydration adds H and OH across the double bond.",
        "Water supplies H and OH.",
      ),
      c(
        "Ethene reacting with bromine forms…",
        "A dibromo compound with no carbon–carbon double bond",
        ["A longer polymer every time", "A carbon-free gas"],
        "One Br atom bonds to each carbon of the former double bond.",
        "Both bromine atoms are added.",
      ),
      c(
        "Ethanol and ethanoic acid can form an ester and…",
        "Water",
        ["Carbon dioxide only", "Hydrogen only"],
        "Esterification is a condensation reaction.",
        "A small molecule is removed.",
      ),
      c(
        "A monomer for condensation polymerisation needs…",
        "Two reactive functional groups",
        ["No reactive groups", "Only one carbon atom"],
        "Two groups allow it to link at both ends into a chain.",
        "Think about joining to two neighbours.",
      ),
      c(
        "An ester commonly contains the linkage…",
        "–COO–",
        ["–O–O– only", "–Na–"],
        "The ester linkage connects the acid-derived and alcohol-derived parts.",
        "Compare the ester with its starting functional groups.",
      ),
    ],
    "higher",
    "separate",
  ),
  lesson(
    "purity-and-separation",
    "analysis",
    "Purity and separation",
    "Choose a separation method and interpret melting-point evidence.",
    "predict",
    "A pure substance has characteristic melting and boiling points at stated pressure. Mixtures often melt over a range. Filtration separates insoluble solids; distillation can recover a solvent.",
    () => [
      c(
        "A pure substance usually melts…",
        "At a sharp characteristic temperature",
        ["Over every possible temperature", "Only above 1000 °C"],
        "At fixed pressure, a pure substance has a characteristic melting point.",
        "Compare pure with mixed.",
      ),
      c(
        "Which separates sand from water?",
        "Filtration",
        ["Simple distillation only", "Chromatography only"],
        "Sand is insoluble and remains on the filter.",
        "Separate an insoluble solid.",
      ),
      c(
        "Which recovers water from a salt solution?",
        "Simple distillation",
        ["Filtration", "Using a magnet"],
        "Water evaporates then condenses; dissolved salt remains behind.",
        "Recover the solvent, not just the solid.",
      ),
      c(
        "A formulation is…",
        "A mixture designed to have useful properties",
        ["Always a pure element", "A molecule with no atoms"],
        "Ingredients are chosen in measured proportions for a purpose.",
        "Think about paints or medicines.",
      ),
      c(
        "Why does filtration not remove dissolved salt from water?",
        "The dissolved particles pass through the filter with water",
        ["Salt cannot dissolve", "The filter changes salt into gas"],
        "Ordinary filters retain larger insoluble particles.",
        "Compare dissolved ions with solid grains.",
      ),
      c(
        "A sample melts over a range rather than sharply. This suggests…",
        "It may contain impurities",
        ["It must be a single isotope", "It contains no particles"],
        "A mixture can alter and broaden melting behaviour.",
        "Treat it as evidence, not absolute proof from one observation.",
      ),
    ],
  ),
  lesson(
    "chromatography",
    "analysis",
    "Chromatography",
    "Read chromatograms and calculate Rf values.",
    "chromatography",
    "Components move at different rates because of different attractions to the mobile solvent and stationary phase. Rf = distance moved by a spot ÷ distance moved by the solvent front, both measured from the baseline.",
    () => [
      c(
        "The starting line is drawn in pencil because…",
        "Graphite does not dissolve and travel with the solvent",
        ["Pencil is always invisible", "Ink cannot contain mixtures"],
        "Ink could dissolve and add extra spots.",
        "Avoid introducing another soluble dye.",
      ),
      c(
        "Why must the starting spots be above the initial solvent level?",
        "To stop samples dissolving directly into the solvent reservoir",
        ["To stop all solvent movement", "To make Rf exceed 1"],
        "The solvent should carry components up from their initial spots.",
        "Think about immersion of the sample.",
      ),
      n(
        "A spot moves 3 cm and the solvent front moves 6 cm from the baseline. Calculate Rf.",
        0.5,
        "",
        "3 ÷ 6 = 0.5.",
        "Divide spot distance by solvent distance.",
      ),
      c(
        "A sample produces three separated spots. It contains at least…",
        "Three separated components",
        ["One pure component", "No soluble material"],
        "Each resolved spot suggests a component; some components could overlap.",
        "Count spots while recognising co-migration.",
      ),
      n(
        "A spot moves 4 cm and the solvent front 10 cm. Calculate Rf.",
        0.4,
        "",
        "4 ÷ 10 = 0.4.",
        "Use the same starting baseline.",
      ),
      c(
        "Matching Rf values support identification only when…",
        "Conditions such as solvent and stationary phase are the same",
        ["Any solvent is used", "The baseline is ignored"],
        "Rf depends on the experimental conditions and is not unique proof alone.",
        "Control the conditions used for comparison.",
      ),
    ],
  ),
  lesson(
    "gas-tests",
    "analysis",
    "Testing gases",
    "Interpret characteristic test observations.",
    "predict",
    "Gas tests combine an action with a characteristic observation: hydrogen gives a squeaky pop with a lit splint; oxygen relights a glowing splint; CO₂ clouds limewater; chlorine bleaches damp litmus.",
    () => [
      c(
        "A gas gives a squeaky pop with a lit splint. It is likely…",
        "Hydrogen",
        ["Oxygen", "Carbon dioxide"],
        "Hydrogen combusts rapidly with oxygen.",
        "Match the action and observation.",
      ),
      c(
        "A glowing splint relights in a gas. The gas is…",
        "Oxygen",
        ["Hydrogen", "Nitrogen"],
        "Oxygen supports combustion.",
        "Glowing is different from already lit.",
      ),
      c(
        "Carbon dioxide turns limewater…",
        "Cloudy",
        ["Purple", "Orange"],
        "A calcium carbonate precipitate forms.",
        "Look for a white suspension.",
      ),
      c(
        "Chlorine tested with damp blue litmus typically…",
        "Turns it red then bleaches it",
        ["Turns it permanently green", "Does nothing"],
        "Dampness enables the chemistry; bleaching is characteristic.",
        "Remember both the acid effect and bleaching.",
      ),
      c(
        "Which test distinguishes CO₂ from oxygen?",
        "CO₂ clouds limewater; oxygen relights a glowing splint",
        ["Both give a squeaky pop", "Both turn dry paper blue"],
        "Different reagents and observations distinguish the gases.",
        "Pair each gas with its own test.",
      ),
      c(
        "Why are gas tests carried out only under suitable school supervision?",
        "Some gases and flame tests present serious hazards",
        ["All gases are harmless", "Small amounts never pose risk"],
        "Toxic gases, pressure and ignition hazards require approved controls.",
        "A simulation is not an instruction to try it at home.",
      ),
    ],
  ),
  lesson(
    "ion-tests",
    "analysis",
    "Testing ions",
    "Connect flame, precipitate and anion observations to identities.",
    "predict",
    "Ion tests use characteristic observations with suitable controls. Flame tests identify some metal ions. Hydroxide precipitates and tests for carbonate, sulfate and halides provide further evidence.",
    () => [
      c(
        "A sodium ion flame test gives a characteristic…",
        "Yellow flame",
        ["Lilac flame", "Green flame"],
        "Sodium gives a strong yellow emission.",
        "Compare sodium with potassium.",
      ),
      c(
        "A potassium ion flame test gives a characteristic…",
        "Lilac flame",
        ["Yellow flame", "Brick-red flame"],
        "Potassium gives a lilac colour.",
        "Recall the alkali metal flame colours.",
      ),
      c(
        "Copper(II) ions with sodium hydroxide form a…",
        "Blue precipitate",
        ["White precipitate", "Colourless gas"],
        "Copper(II) hydroxide is a blue insoluble solid.",
        "Name the solid observation.",
      ),
      c(
        "Acidified barium chloride gives a white precipitate with…",
        "Sulfate ions",
        ["Sodium ions", "Nitrate ions"],
        "Insoluble barium sulfate forms; acidification removes some interferences.",
        "Think about barium sulfate.",
      ),
      c(
        "Acidified silver nitrate gives a white precipitate with…",
        "Chloride ions",
        ["Sulfate ions", "Potassium ions"],
        "Silver chloride is white; bromide is cream and iodide yellow.",
        "Match the halide precipitate colour.",
      ),
      c(
        "Adding dilute acid to carbonate ions produces a gas that…",
        "Turns limewater cloudy",
        ["Relights a glowing splint", "Gives chlorine bleaching"],
        "Carbon dioxide is formed.",
        "Connect carbonate chemistry with the gas test.",
      ),
    ],
    "foundation",
    "separate",
  ),
  lesson(
    "instrumental-analysis",
    "analysis",
    "Instrumental analysis",
    "Evaluate evidence, sensitivity and calibration.",
    "predict",
    "Instrumental methods can identify substances rapidly and sensitively. Flame emission spectra contain characteristic lines. Reliable identification needs calibration, comparison and attention to interferences.",
    () => [
      c(
        "A flame emission spectrum can identify a metal ion using…",
        "Characteristic wavelengths of emitted light",
        ["Its sample container colour", "Only the mass of the beaker"],
        "Different electronic transitions give distinctive line patterns.",
        "Compare spectral lines with a reference.",
      ),
      c(
        "An advantage of an instrumental method can be…",
        "High sensitivity to small amounts",
        ["Never needing calibration", "Being immune to every interference"],
        "Instruments can detect low concentrations but still need reliable procedures.",
        "Advantage does not mean infallibility.",
      ),
      c(
        "Calibration compares an instrument response with…",
        "Known standards",
        ["Unknown guesses", "The room’s paint colour"],
        "Standards allow response to be related to concentration or identity.",
        "Use known samples as references.",
      ),
      c(
        "Why analyse a blank?",
        "To check background or contamination from the method",
        ["To force a positive result", "To replace all standards"],
        "A blank helps distinguish the sample signal from background.",
        "What signal exists without the analyte?",
      ),
      c(
        "Several matching spectral lines provide…",
        "Evidence for an identity, subject to conditions and interferences",
        ["Absolute proof with no uncertainty", "A melting-point measurement"],
        "Multiple consistent observations strengthen identification.",
        "Use evidence-based language.",
      ),
      c(
        "A limitation of instrumental analysis can be…",
        "Expensive equipment and need for trained interpretation",
        [
          "Inability to measure anything",
          "Absence of all scientific principles",
        ],
        "Practical costs and skill requirements matter.",
        "Compare benefits with resources needed.",
      ),
    ],
    "foundation",
    "separate",
  ),
  lesson(
    "early-atmosphere",
    "atmosphere",
    "Earth’s early atmosphere",
    "Use geological and biological evidence to explain atmospheric change.",
    "predict",
    "Models of the early atmosphere involve volcanic gases, abundant CO₂ and water vapour, with little oxygen. Cooling formed oceans; carbon became stored in rocks and organisms. Photosynthesis later increased oxygen.",
    () => [
      c(
        "The early atmosphere is often modelled as having much…",
        "Carbon dioxide and water vapour",
        ["Oxygen from human industry", "Argon only"],
        "Volcanic outgassing supplied gases; exact proportions are uncertain.",
        "Consider gases from volcanic activity.",
      ),
      c(
        "Oceans formed mainly when…",
        "Earth cooled and water vapour condensed",
        ["Oxygen became metal", "All rocks evaporated"],
        "Cooling allowed liquid water to persist.",
        "Link cooling with condensation.",
      ),
      c(
        "Which process increased atmospheric oxygen?",
        "Photosynthesis",
        ["Combustion", "Respiration only"],
        "Photosynthetic organisms release oxygen while using carbon dioxide.",
        "Think about early algae and later plants.",
      ),
      c(
        "Carbon dioxide decreased partly because it…",
        "Dissolved in oceans and became stored in carbonate rocks",
        ["Changed into protons", "Could no longer react"],
        "Long-term geological and biological processes removed carbon from the atmosphere.",
        "Find carbon stores.",
      ),
      c(
        "Why are early-atmosphere models uncertain?",
        "Direct measurements from billions of years ago are unavailable",
        ["There is no geological evidence", "All models must be exact"],
        "Scientists infer from rocks and other evidence; ancient rocks may have changed.",
        "Distinguish inference from direct measurement.",
      ),
      c(
        "Today’s atmosphere contains about…",
        "78% nitrogen and 21% oxygen",
        ["78% oxygen and 21% carbon dioxide", "50% hydrogen"],
        "Nitrogen dominates, oxygen is next, and other gases make up about 1%.",
        "Recall the two largest components.",
      ),
    ],
  ),
  lesson(
    "greenhouse-effect",
    "atmosphere",
    "The greenhouse effect",
    "Explain how greenhouse gases change energy transfer.",
    "predict",
    "The surface absorbs solar radiation and emits infrared radiation. Greenhouse gases absorb and re-emit some infrared, reducing net energy escape. The natural greenhouse effect supports habitable temperatures; increased concentrations can warm the climate.",
    () => [
      c(
        "Greenhouse gases absorb some outgoing…",
        "Infrared radiation",
        ["All incoming visible light", "Only sound"],
        "The warmed surface emits infrared radiation.",
        "Distinguish incoming sunlight from outgoing radiation.",
      ),
      c(
        "Which is a greenhouse gas?",
        "Methane",
        ["Nitrogen", "Argon"],
        "Methane, CO₂ and water vapour absorb relevant infrared wavelengths.",
        "Not every atmospheric gas absorbs infrared strongly.",
      ),
      c(
        "The natural greenhouse effect is…",
        "An important reason Earth is warm enough for current life",
        ["Always entirely harmful", "Caused only by humans"],
        "Human increases in some gases enhance an existing natural effect.",
        "Separate the natural effect from enhancement.",
      ),
      c(
        "Carbon dioxide concentration has increased partly because of…",
        "Burning fossil fuels and deforestation",
        ["Using solar panels alone", "Making oxygen from water only"],
        "Combustion adds carbon and forest loss can reduce uptake.",
        "Follow carbon sources and sinks.",
      ),
      c(
        "Water vapour is…",
        "A greenhouse gas",
        ["Not part of the atmosphere", "A metal aerosol only"],
        "Its concentration also responds to temperature and other conditions.",
        "Consider absorption of infrared.",
      ),
      c(
        "Greenhouse gas molecules warming the surface do so by…",
        "Absorbing and re-emitting infrared radiation",
        [
          "Reflecting every photon like a mirror",
          "Destroying atmospheric nitrogen",
        ],
        "The process changes the balance of incoming and outgoing energy.",
        "Use the radiation mechanism.",
      ),
    ],
  ),
  lesson(
    "climate-evidence",
    "atmosphere",
    "Climate evidence and footprints",
    "Interpret uncertainty and evaluate carbon-footprint claims.",
    "predict",
    "Climate evidence combines measurements and models over long timescales. A carbon footprint estimates greenhouse gas emissions over a defined activity or product life cycle, often as CO₂ equivalents.",
    () => [
      c(
        "Weather differs from climate because climate describes…",
        "Long-term patterns and statistics",
        ["Only today’s temperature", "No measurements"],
        "A single day is not the long-term distribution of conditions.",
        "Compare timescales.",
      ),
      c(
        "A product carbon footprint should state…",
        "Its system boundary and assumptions",
        ["Only its colour", "A guaranteed exact value without uncertainty"],
        "Manufacture, use and disposal may be included differently.",
        "Ask what stages were counted.",
      ),
      c(
        "CO₂ equivalents allow comparison of…",
        "Different greenhouse gases using a stated warming basis",
        ["All gases as if chemically identical", "Only oxygen concentrations"],
        "Different gases have different effects over specified timescales.",
        "Equivalence is a comparison metric, not chemical identity.",
      ),
      c(
        "An unusually cold day disproves long-term warming…",
        "No; one day does not determine a long-term trend",
        ["Yes, automatically", "Only if it is a Monday"],
        "Climate trends require many measurements over time.",
        "Use sufficient temporal evidence.",
      ),
      c(
        "Reducing fossil-fuel electricity use can reduce a footprint, but the size depends on…",
        "The electricity source and life-cycle boundary",
        ["Only the socket shape", "No conditions at all"],
        "Different generation mixes have different associated emissions.",
        "Ask where the electricity comes from.",
      ),
      c(
        "Uncertainty in a model means…",
        "There is a range of supported estimates, not no knowledge",
        ["All results are worthless", "Every output is exact"],
        "Uncertainty should be communicated and tested against evidence.",
        "Avoid confusing uncertainty with ignorance.",
      ),
    ],
  ),
  lesson(
    "air-pollutants",
    "atmosphere",
    "Air pollutants",
    "Explain sources and effects of combustion pollutants.",
    "predict",
    "Incomplete combustion can produce CO and particulates. Sulfur impurities can form SO₂; high temperatures allow nitrogen and oxygen to form nitrogen oxides. These pollutants have effects distinct from greenhouse warming.",
    () => [
      c(
        "Sulfur dioxide from burning fuels is linked with…",
        "Acid rain and respiratory problems",
        ["Making water completely pure", "Removing every greenhouse gas"],
        "SO₂ can form acidic substances in the atmosphere.",
        "Follow sulfur impurities in fuel.",
      ),
      c(
        "Nitrogen oxides form in engines partly because…",
        "High temperatures allow nitrogen and oxygen in air to react",
        ["Fuel must contain nitrogen always", "Nitrogen is already a solid"],
        "Air gases react under hot combustion conditions.",
        "Consider the intake air as a source.",
      ),
      c(
        "Particulates can cause…",
        "Respiratory harm and global dimming",
        [
          "Only a beneficial increase in oxygen",
          "No effect because they are solids",
        ],
        "Suspended particles affect health and can scatter or absorb radiation.",
        "Solid particles can remain airborne.",
      ),
      c(
        "Carbon monoxide forms particularly during…",
        "Incomplete combustion",
        [
          "Complete combustion with unlimited oxygen",
          "Evaporation of pure water",
        ],
        "Limited oxygen allows carbon to be incompletely oxidised.",
        "Compare CO with CO₂.",
      ),
      c(
        "Which reduces sulfur dioxide emissions from a fuel?",
        "Removing sulfur impurities",
        ["Adding more sulfur", "Removing all exhaust monitoring"],
        "Less sulfur means less sulfur oxide can form; exhaust treatment is another route.",
        "Control the pollutant source.",
      ),
      c(
        "Why distinguish CO₂ from CO in an emissions discussion?",
        "They have different health and climate effects",
        ["Their formulae are interchangeable", "Neither contains carbon"],
        "CO is acutely toxic; CO₂ is a major greenhouse gas.",
        "A different subscript means a different substance.",
      ),
    ],
  ),
  lesson(
    "carbon-cycle",
    "atmosphere",
    "The carbon cycle",
    "Track carbon between atmospheric, biological and geological stores.",
    "predict",
    "Photosynthesis moves carbon from CO₂ into biomass. Respiration and decay can return it. Fossilisation and carbonate formation create long-term stores; combustion releases stored carbon rapidly.",
    () => [
      c(
        "Photosynthesis moves carbon from…",
        "Atmospheric CO₂ into plant biomass",
        ["Plant biomass into pure oxygen", "Rocks into nitrogen"],
        "Carbon atoms are incorporated into organic molecules.",
        "Track carbon atoms, not only oxygen.",
      ),
      c(
        "Aerobic respiration releases…",
        "Carbon dioxide",
        ["Only helium", "Carbon-free solids"],
        "Organisms transfer some carbon from food back to CO₂.",
        "Recall respiration products.",
      ),
      c(
        "Fossil fuels are…",
        "Long-term carbon stores formed from ancient biological material",
        ["Carbon-free energy sources", "Made instantly by every leaf"],
        "Geological processes form them over very long timescales.",
        "Compare formation with human use rates.",
      ),
      c(
        "Deforestation can affect the carbon cycle by…",
        "Releasing stored carbon and reducing future uptake",
        ["Creating a new element", "Preventing all respiration"],
        "Burning or decay releases carbon; fewer trees may absorb less CO₂.",
        "Consider both stock and ongoing flow.",
      ),
      c(
        "Carbon in limestone is held mainly as…",
        "Carbonate",
        ["Free hydrogen", "Chloride"],
        "Limestone contains calcium carbonate.",
        "Read CaCO₃.",
      ),
      c(
        "Why does fossil-fuel combustion alter atmospheric carbon balance?",
        "It releases geological carbon much faster than it is stored again",
        ["It creates new carbon atoms", "It stops all photosynthesis"],
        "Rates of movement between stores matter.",
        "Conservation of atoms does not guarantee unchanged concentrations.",
      ),
    ],
  ),
  lesson(
    "potable-water",
    "resources",
    "Potable water",
    "Distinguish safe drinking water from chemically pure water.",
    "predict",
    "Potable water is safe to drink but can contain dissolved minerals. Treatment commonly removes solids and microorganisms. Pure water contains only H₂O; purity alone is not the same description as a drinking-water standard.",
    () => [
      c(
        "Potable water means water that is…",
        "Safe to drink",
        [
          "Only H₂O with no dissolved substances",
          "Always salt-free by definition",
        ],
        "Safe water can contain acceptable dissolved minerals.",
        "Separate potability from chemical purity.",
      ),
      c(
        "Filtration in water treatment mainly removes…",
        "Suspended solids",
        ["All dissolved ions", "Every virus with any filter"],
        "Appropriate filters remove solid particles; disinfection addresses microbes.",
        "Use each stage for its purpose.",
      ),
      c(
        "Disinfection is used to…",
        "Reduce harmful microorganisms",
        ["Remove every dissolved mineral", "Create new water atoms"],
        "Methods may use chlorine, ozone or ultraviolet light.",
        "Think about biological contamination.",
      ),
      c(
        "Why is desalination often energy-intensive?",
        "Separating water from dissolved salts requires energy",
        ["Salt is an element that cannot move", "Water has no boiling point"],
        "Distillation and membrane processes have energy costs.",
        "Consider the separation process.",
      ),
      c(
        "Reverse osmosis uses…",
        "Pressure and a selective membrane",
        ["Only a magnet", "A reaction creating hydrogen"],
        "Water passes through a membrane while much dissolved salt is rejected.",
        "Think about a barrier selective to water.",
      ),
      c(
        "A clear-looking water sample is necessarily safe to drink…",
        "No; invisible contaminants may remain",
        ["Yes; clarity proves potability", "Yes; all bacteria are visible"],
        "Chemical and biological tests are needed.",
        "Appearance is not a full safety test.",
      ),
    ],
  ),
  lesson(
    "wastewater-and-treatment",
    "resources",
    "Wastewater treatment",
    "Explain separation and biological stages of treatment.",
    "predict",
    "Wastewater treatment separates solids and treats organic material before discharge. Screening and sedimentation are physical stages; biological treatment uses microorganisms. Sludge can undergo anaerobic digestion.",
    () => [
      c(
        "Screening removes…",
        "Large objects and debris",
        ["All dissolved chemicals", "Every microorganism"],
        "A screen retains material larger than its openings.",
        "Think about the first physical barrier.",
      ),
      c(
        "Sedimentation separates solids because…",
        "They settle under gravity",
        ["They all become gases", "Water becomes a metal"],
        "Heavier suspended material settles as sludge.",
        "Allow particles time to sink.",
      ),
      c(
        "Aerobic biological treatment needs…",
        "Oxygen",
        ["No microorganisms", "Only carbon monoxide"],
        "Aerobic microbes use oxygen while breaking down organic matter.",
        "Aero relates to air/oxygen.",
      ),
      c(
        "Anaerobic digestion of sludge can produce…",
        "Biogas containing methane",
        ["Pure oxygen only", "Metallic sodium"],
        "Microbes work without oxygen and generate a fuel-containing gas mixture.",
        "Anaerobic means without oxygen.",
      ),
      c(
        "Why treat sewage before releasing it to a river?",
        "To reduce pollutants and biological harm",
        ["To make all river water sterile forever", "To remove every atom"],
        "Untreated sewage can damage ecosystems and spread disease.",
        "Consider oxygen demand and pathogens.",
      ),
      c(
        "Treated wastewater is automatically potable…",
        "No; drinking standards require further controls and testing",
        ["Yes in every system", "Only if it is warm"],
        "Discharge standards and potable standards differ.",
        "Different end uses require different quality criteria.",
      ),
    ],
  ),
  lesson(
    "extracting-metals",
    "resources",
    "Extracting metals",
    "Choose extraction routes and compare low-grade-ore methods.",
    "predict",
    "Metals less reactive than carbon may be extracted by carbon reduction. More reactive metals generally require electrolysis. Phytomining and bioleaching can concentrate metals from low-grade sources.",
    () => [
      c(
        "Iron oxide can be reduced using carbon because iron is…",
        "Less reactive than carbon",
        ["More reactive than potassium", "A noble gas"],
        "Carbon can remove oxygen from the oxide of a less reactive metal.",
        "Compare positions relative to carbon.",
      ),
      c(
        "Aluminium extraction commonly uses…",
        "Electrolysis",
        ["Carbon reduction alone", "Filtration of pure metal"],
        "Aluminium is more reactive than carbon, so electricity drives its extraction.",
        "Its oxide is very stable.",
      ),
      c(
        "Phytomining uses…",
        "Plants to take up metal compounds",
        ["Only a magnetic field", "Animals to make new metals"],
        "Harvested plant material can be processed to concentrate the metal.",
        "Phyto means plant.",
      ),
      c(
        "Bioleaching uses…",
        "Microorganisms to release metal compounds into solution",
        ["High-pressure oxygen to make gold", "Only sand filtration"],
        "Microbial processes make metal-containing leachate for further recovery.",
        "Bio means living organisms.",
      ),
      c(
        "Why consider low-grade-ore methods?",
        "High-grade sources are limited and lower-temperature routes may reduce some impacts",
        [
          "They always have zero environmental cost",
          "They create unlimited metal atoms",
        ],
        "Yield, speed, pollution and energy must all be evaluated.",
        "Compare benefits and trade-offs.",
      ),
      c(
        "Recycling aluminium saves energy mainly because…",
        "Remelting needs much less energy than extracting new metal from ore",
        ["Recycled aluminium has no atoms", "No transport is ever needed"],
        "Primary electrolysis is energy-intensive.",
        "Compare remelting with oxide decomposition.",
      ),
    ],
  ),
  lesson(
    "life-cycle-and-recycling",
    "resources",
    "Life-cycle assessment",
    "Compare products across extraction, manufacture, use and disposal.",
    "predict",
    "Life-cycle assessment examines environmental effects over a defined product life. Choices of boundaries, data and weighting influence comparisons. Recycling can save resources but also needs collection, transport and processing.",
    () => [
      c(
        "Which stage belongs in a product life-cycle assessment?",
        "Raw-material extraction",
        ["Only shop price", "Only colour selection"],
        "Manufacture, use and disposal are also relevant.",
        "Start before the product reaches the shop.",
      ),
      c(
        "Why can two life-cycle assessments disagree?",
        "They may use different boundaries, data or weightings",
        ["Chemistry has no evidence", "Every assessment must be dishonest"],
        "Comparisons require clear assumptions and methods.",
        "Ask which impacts were included.",
      ),
      c(
        "An advantage of recycling metals is…",
        "Reduced need for new ore extraction",
        ["No energy use at any stage", "Unlimited creation of metal"],
        "It can also lower energy use compared with primary production.",
        "Conserve material already available.",
      ),
      c(
        "Reusable packaging is always better regardless of use count…",
        "No; production, washing and number of reuses matter",
        ["Yes in every situation", "Only the label matters"],
        "Impacts per use depend on the complete life cycle.",
        "Compare equivalent service over time.",
      ),
      c(
        "Which makes an environmental comparison fairer?",
        "Comparing equal functions with consistent boundaries",
        [
          "Comparing one bag with an entire factory",
          "Ignoring disposal for one option",
        ],
        "Use the same service and include matching stages.",
        "Compare like with like.",
      ),
      c(
        "A limitation of recycling mixed materials can be…",
        "Difficulty separating them into suitable streams",
        ["Atoms cannot be reused", "All mixtures are radioactive"],
        "Contamination and separation affect product quality and processing.",
        "Consider recovery and sorting.",
      ),
    ],
  ),
  lesson(
    "materials-and-corrosion",
    "resources",
    "Materials and corrosion",
    "Choose materials and explain rust prevention.",
    "predict",
    "Rusting needs both oxygen and water. Barrier methods exclude them; sacrificial protection uses a more reactive metal. Alloys and composites combine components to obtain useful properties.",
    () => [
      c(
        "Iron rusts when exposed to…",
        "Both oxygen and water",
        ["Only nitrogen", "Dry oxygen with no moisture only"],
        "Both are needed for typical rust formation.",
        "Think about the controlled rusting experiment.",
      ),
      c(
        "Painting iron helps prevent rust by…",
        "Providing a barrier to water and oxygen",
        ["Changing iron into gold", "Removing all electrons"],
        "A continuous coating excludes reactants.",
        "Protect the surface.",
      ),
      c(
        "Zinc can protect iron sacrificially because it is…",
        "More reactive than iron",
        ["Less reactive than copper", "A noble gas"],
        "Zinc oxidises preferentially, even if a coating is scratched.",
        "Which metal loses electrons more readily?",
      ),
      c(
        "Alloys are often harder than pure metals because…",
        "Different-sized atoms disrupt sliding layers",
        ["They contain no atoms", "Every bond becomes ionic"],
        "The regular lattice is distorted.",
        "Compare layer movement.",
      ),
      c(
        "A composite material has…",
        "A matrix and reinforcement with combined useful properties",
        ["Only one element by definition", "No bonding"],
        "The components retain distinguishable roles in the material.",
        "Think about reinforced concrete or fibre composites.",
      ),
      c(
        "Which protection can continue after a small scratch exposing iron?",
        "Sacrificial zinc protection",
        ["Paint alone with no sacrificial metal", "A paper label"],
        "The more reactive zinc can still oxidise instead of iron.",
        "Barrier and sacrificial mechanisms differ.",
      ),
    ],
  ),
  lesson(
    "haber-and-fertilisers",
    "resources",
    "The Haber process and fertilisers",
    "Explain industrial compromises and fertiliser chemistry.",
    "equilibrium",
    "The Haber process uses N₂ + 3H₂ ⇌ 2NH₃, an exothermic reversible reaction. Moderate temperature, high pressure and an iron catalyst balance rate, yield, cost and safety. NPK fertilisers supply nitrogen, phosphorus and potassium.",
    () => [
      c(
        "The Haber process produces…",
        "Ammonia",
        ["Sulfuric acid", "Methane"],
        "Nitrogen reacts with hydrogen to form NH₃.",
        "Read N₂ + 3H₂ ⇌ 2NH₃.",
      ),
      c(
        "An iron catalyst in the Haber process mainly…",
        "Speeds up approach to equilibrium",
        ["Raises equilibrium yield by itself", "Changes nitrogen into oxygen"],
        "It lowers activation energy in both directions.",
        "Separate rate from position.",
      ),
      c(
        "Very high pressure is not used without limit because…",
        "Equipment, energy and safety costs increase",
        ["Pressure never affects yield", "Ammonia contains no atoms"],
        "A useful yield must be weighed against practical operating costs.",
        "Industry optimises rather than maximises one variable.",
      ),
      c(
        "NPK fertilisers supply…",
        "Nitrogen, phosphorus and potassium",
        ["Nitrogen, platinum and krypton", "Neon, phosphorus and calcium"],
        "The symbols N, P and K name essential plant nutrients.",
        "K is potassium, not krypton.",
      ),
      c(
        "Unreacted nitrogen and hydrogen are commonly…",
        "Recycled through the process",
        ["Always released untreated", "Converted into iron"],
        "Recycling improves overall use of feedstocks.",
        "One pass need not consume all reactants.",
      ),
      c(
        "Ammonia reacting with nitric acid forms…",
        "Ammonium nitrate",
        ["Sodium chloride", "Calcium carbonate"],
        "An ammonium salt can supply nitrogen as fertiliser.",
        "Combine the ammonia-derived cation and acid-derived anion.",
      ),
    ],
    "higher",
    "separate",
  ),
  lesson(
    "transition-metals",
    "atomic-structure",
    "Transition metals",
    "Compare transition metals with Group 1 and identify characteristic chemistry.",
    "predict",
    "Many transition metals have high melting points and densities, form coloured compounds and act as catalysts. Unlike Group 1 metals, many form ions with different charges.",
    () => [
      c(
        "Compared with Group 1 metals, many transition metals are…",
        "Less reactive with water",
        [
          "Always more reactive with cold water",
          "All gases at room temperature",
        ],
        "Group 1 metals react readily with water; many transition metals do not.",
        "Compare iron or copper with sodium.",
      ),
      c(
        "A common transition-metal feature is…",
        "Formation of coloured compounds",
        ["Always colourless compounds only", "Only one possible ionic charge"],
        "Transition metals often form coloured compounds and ions with different charges.",
        "Think about copper(II) sulfate.",
      ),
      c(
        "Iron(II) and iron(III) ions show that iron can…",
        "Form more than one ion charge",
        [
          "Change its atomic number during every reaction",
          "Only form neutral atoms",
        ],
        "Fe²⁺ and Fe³⁺ have different electron counts but the same proton number.",
        "Read the Roman numerals as ionic charge.",
      ),
      c(
        "Iron in the Haber process is used as…",
        "A catalyst",
        ["The nitrogen source", "A fuel"],
        "It speeds the reaction through an alternative pathway.",
        "The iron is not consumed overall.",
      ),
      c(
        "Copper(II) sulfate solution is typically…",
        "Blue",
        ["Always colourless", "Bright orange"],
        "The blue colour is associated with hydrated copper(II) ions.",
        "Recall a common copper salt solution.",
      ),
      c(
        "Which statement is more accurate?",
        "Many transition metals have high melting points, but there are exceptions",
        [
          "Every transition metal has identical properties",
          "All transition metals react violently with water",
        ],
        "Trends are generalisations. Use evidence for the named metal rather than assuming every metal has identical properties.",
        "Avoid turning a common property into an absolute rule.",
      ),
    ],
    "foundation",
    "separate",
  ),
  lesson(
    "empirical-formulae",
    "quantitative",
    "Empirical formulae",
    "Find the simplest whole-number ratio using mole amounts.",
    "moles",
    "Empirical formulae show the simplest whole-number atom ratio. Convert element masses to moles, divide by the smallest amount, then multiply if needed to obtain whole numbers. Molecular formulae may be multiples.",
    () => [
      c(
        "The empirical formula of C₂H₆ is…",
        "CH₃",
        ["C₂H₆ only", "CH₂"],
        "Divide both subscripts by 2.",
        "Find the simplest whole-number ratio.",
      ),
      n(
        "A compound contains 24 g carbon, Aᵣ 12. How many moles of carbon atoms?",
        2,
        "mol",
        "24 ÷ 12 = 2 mol.",
        "Convert mass before comparing ratios.",
      ),
      c(
        "A sample contains 1 mol Mg atoms and 1 mol O atoms. Its empirical formula is…",
        "MgO",
        ["Mg₂O", "MgO₂"],
        "The simplest ratio is 1:1.",
        "Use the ratio of amounts.",
      ),
      c(
        "A compound has mole ratio C:H = 1:2. Its empirical formula is…",
        "CH₂",
        ["C₂H", "C₂H₂"],
        "One carbon to two hydrogens gives CH₂.",
        "Put the atom ratio into subscripts.",
      ),
      c(
        "A compound’s empirical formula is CH₂ and molecular Mᵣ is 56. Use C = 12, H = 1. Its molecular formula is…",
        "C₄H₈",
        ["C₂H₄", "CH₂"],
        "Empirical mass is 14; 56 ÷ 14 = 4, so multiply every subscript by 4.",
        "Find the molecular-to-empirical mass ratio.",
      ),
      c(
        "Mole amounts C = 0.5 and O = 1 give empirical formula…",
        "CO₂",
        ["C₂O", "CO"],
        "Divide both by 0.5 to get 1:2.",
        "Divide by the smallest amount.",
      ),
    ],
    "higher",
    "separate",
  ),
  lesson(
    "titration-practical",
    "chemical-changes",
    "Titration technique",
    "Explain endpoint measurement and compare repeat titres.",
    "predict",
    "In supervised acid–alkali titration, a pipette measures a fixed volume and a burette delivers measured volumes. An indicator signals an endpoint. Use a rough trial followed by careful repeats; concordance is judged by the stated protocol.",
    () => [
      c(
        "A pipette is used mainly to…",
        "Measure a fixed volume accurately",
        ["Collect an unknown gas volume", "Make a salt insoluble"],
        "A volumetric pipette delivers a specified measured volume.",
        "Compare the jobs of pipette and burette.",
      ),
      c(
        "A burette allows you to measure…",
        "The volume delivered from initial and final readings",
        ["Only solution colour", "Only the flask mass"],
        "Titre = final reading − initial reading.",
        "Read both levels.",
      ),
      n(
        "A burette starts at 1.20 cm³ and finishes at 23.60 cm³. Calculate the titre.",
        22.4,
        "cm³",
        "23.60 − 1.20 = 22.40 cm³.",
        "Subtract the initial reading.",
      ),
      c(
        "Near the endpoint, solution should be added…",
        "Dropwise while mixing",
        [
          "As fast as possible without mixing",
          "Only after discarding the indicator",
        ],
        "Careful addition reduces overshooting.",
        "Control the last small volume.",
      ),
      n(
        "Two accepted concordant titres are 20.10 and 20.20 cm³. Calculate their mean.",
        20.15,
        "cm³",
        "(20.10 + 20.20) ÷ 2 = 20.15.",
        "Average the accepted repeat titres.",
      ),
      c(
        "Why is a rough titre not usually included with careful concordant titres?",
        "It estimates the endpoint and may be less precise",
        ["It contains no chemicals", "Its number must be zero"],
        "Use the stated method to select appropriate repeats.",
        "The first trial guides later precision.",
      ),
    ],
    "foundation",
    "separate",
  ),
  lesson(
    "titration-calculations",
    "quantitative",
    "Titration calculations",
    "Use concentration, volume and balanced mole ratios.",
    "moles",
    "Titration calculations connect n = cV with the balanced equation. Volumes must be in dm³ for concentrations in mol/dm³. Different reactions may have different mole ratios.",
    () => [
      n(
        "25 cm³ of 0.2 mol/dm³ NaOH contains how many moles?",
        0.005,
        "mol",
        "25 cm³ = 0.025 dm³; 0.2 × 0.025 = 0.005 mol.",
        "Convert cm³ to dm³, then multiply.",
      ),
      n(
        "HCl + NaOH → NaCl + H₂O. How many moles HCl react with 0.005 mol NaOH?",
        0.005,
        "mol",
        "The ratio is 1:1.",
        "Read the coefficients.",
      ),
      n(
        "0.005 mol HCl is present in 20 cm³ solution. What is its concentration?",
        0.25,
        "mol/dm³",
        "0.005 ÷ 0.020 = 0.25.",
        "Divide moles by volume in dm³.",
      ),
      n(
        "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O. How many moles acid react with 0.01 mol NaOH?",
        0.005,
        "mol",
        "The acid:alkali ratio is 1:2.",
        "Do not assume every neutralisation is 1:1.",
      ),
      n(
        "10 cm³ of 0.3 mol/dm³ solution contains how many moles solute?",
        0.003,
        "mol",
        "0.3 × 0.010 = 0.003.",
        "Convert the volume first.",
      ),
      n(
        "0.004 mol solute is in 16 cm³ solution. Calculate concentration.",
        0.25,
        "mol/dm³",
        "0.004 ÷ 0.016 = 0.25.",
        "Use n/V.",
      ),
    ],
    "higher",
    "separate",
  ),
  lesson(
    "half-equations",
    "chemical-changes",
    "Ionic half-equations",
    "Conserve charge as well as atoms in electron-transfer equations.",
    "electrolysis",
    "Half-equations show one oxidation or reduction process. Electrons balance charge: they appear on the reactant side for reduction and product side for oxidation. Charges and atom counts must both balance.",
    () => [
      n(
        "In Mg²⁺ + ?e⁻ → Mg, how many electrons are needed?",
        2,
        "electrons",
        "Two electrons cancel the +2 ion charge.",
        "Balance charge as well as magnesium atoms.",
      ),
      c(
        "Which is the oxidation half-equation for sodium?",
        "Na → Na⁺ + e⁻",
        ["Na + e⁻ → Na⁺", "Na⁺ → Na + e⁻"],
        "A neutral sodium atom loses one electron.",
        "Oxidation is loss of electrons.",
      ),
      n(
        "In 2Cl⁻ → Cl₂ + ?e⁻, what electron coefficient is needed?",
        2,
        "",
        "The left charge is −2; two electrons on the right preserve it.",
        "Chlorine gas is diatomic.",
      ),
      c(
        "Which half-equation is balanced for copper(II) reduction?",
        "Cu²⁺ + 2e⁻ → Cu",
        ["Cu²⁺ + e⁻ → Cu", "Cu → Cu²⁺ + e⁻"],
        "Two electrons are gained and total charge becomes zero.",
        "Cu²⁺ has charge +2.",
      ),
      n(
        "In Al³⁺ + ?e⁻ → Al, what electron coefficient is needed?",
        3,
        "",
        "Three electrons balance a +3 charge.",
        "Reduction cancels the ionic charge.",
      ),
      c(
        "2Br⁻ → Br₂ + 2e⁻ is…",
        "Oxidation",
        ["Reduction", "Neutralisation"],
        "Bromide ions lose electrons to form bromine molecules.",
        "Electrons are products.",
      ),
    ],
    "higher",
  ),
  lesson(
    "natural-polymers",
    "organic",
    "Natural and condensation polymers",
    "Identify repeating units and distinguish polymerisation mechanisms.",
    "predict",
    "Proteins are polymers of amino acids; starch and cellulose are carbohydrate polymers; DNA has nucleotide units. Condensation reactions join functional groups while eliminating a small molecule. These structures and properties depend on their sequence and bonding.",
    () => [
      c(
        "Proteins are built from…",
        "Amino acid units",
        ["Only ethene units", "Sodium ions"],
        "Amino acids join into polypeptide chains.",
        "Think about peptide bonds.",
      ),
      c(
        "DNA is a polymer with repeating units called…",
        "Nucleotides",
        ["Only glucose molecules", "Metal atoms"],
        "Its sequence of nucleotide bases carries information.",
        "Recall the units of a nucleic acid.",
      ),
      c(
        "Starch and cellulose are both…",
        "Polymers based on glucose units",
        ["Pure metals", "Identical in structure and function"],
        "Different linking arrangements give different properties.",
        "The same monomer can give different structures.",
      ),
      c(
        "Condensation polymerisation differs from addition because it…",
        "Eliminates a small molecule while linking reactive groups",
        ["Never forms covalent bonds", "Always uses only ethene"],
        "Suitable monomers have reactive groups that can join repeatedly.",
        "Condensation removes a small molecule.",
      ),
      c(
        "A polyester contains repeating…",
        "Ester linkages",
        ["Ionic Na–Cl pairs", "Only carbon–carbon double bonds"],
        "The ester linkage joins monomer-derived units.",
        "Use the polymer name.",
      ),
      c(
        "Protein properties depend partly on…",
        "The amino acid sequence and resulting structure",
        ["Only the total beaker volume", "No chemical bonds"],
        "Sequence influences folding and interactions.",
        "Structure relates to function.",
      ),
    ],
    "higher",
    "separate",
  ),
  lesson(
    "rates-practical",
    "rates",
    "Investigating rates fairly",
    "Choose variables, plot observations and handle anomalous results.",
    "rate",
    "A fair rate investigation changes one independent variable, measures product or reactant change over time and controls relevant conditions. Use repeats to assess variation, investigate anomalies and choose a measurement appropriate to the reaction.",
    () => [
      c(
        "When comparing acid concentrations, the independent variable is…",
        "Acid concentration",
        ["Gas volume collected", "Elapsed time by itself"],
        "The independent variable is deliberately changed.",
        "Separate changed and measured quantities.",
      ),
      c(
        "For a fair comparison of concentration, keep solid reactant conditions the same including…",
        "Mass and particle size",
        ["Only the table colour", "Only the final graph height"],
        "Both amount and surface area influence the reaction.",
        "Avoid changing a second factor.",
      ),
      c(
        "A gas syringe measures…",
        "Gas volume formed",
        ["Only the reaction colour", "Only activation energy"],
        "Volume can be recorded at timed intervals to estimate rate.",
        "Choose the observed quantity.",
      ),
      c(
        "A single anomalous reading should be…",
        "Investigated and repeated where possible",
        [
          "Automatically changed to the desired result",
          "Always included without thought",
        ],
        "Check method and measurement before deciding how to treat it.",
        "Keep the original evidence and examine the cause.",
      ),
      n(
        "Gas volume changes from 18 to 30 cm³ between 10 and 14 s. Calculate mean rate over that interval.",
        3,
        "cm³/s",
        "(30 − 18) ÷ (14 − 10) = 12/4 = 3.",
        "Use changes in both axes.",
      ),
      c(
        "Why can a disappearing-cross timing method be less objective?",
        "Judging the disappearance depends on the observer and conditions",
        ["Time cannot be measured", "No particles are involved"],
        "Lighting and viewing conditions should be controlled.",
        "Consider how the endpoint is decided.",
      ),
    ],
  ),
  lesson(
    "separation-practical",
    "analysis",
    "Separation investigations",
    "Select methods and evaluate recovery and purity.",
    "chromatography",
    "Separation depends on physical differences: insolubility, boiling point and attractions to stationary and mobile phases. Good investigations specify what is being recovered and check purity or identity rather than assuming a separated sample is perfect.",
    () => [
      c(
        "A mixture contains sand and dissolved salt in water. The first useful step to remove sand is…",
        "Filtration",
        ["Immediate chromatography", "Adding a magnet"],
        "Sand is insoluble; salt solution passes into the filtrate.",
        "Separate the insoluble material first.",
      ),
      c(
        "To obtain salt crystals from the filtrate, use…",
        "Concentration by evaporation followed by cooling",
        ["A magnet", "Another ordinary filter only"],
        "Removing some solvent can allow crystallisation on cooling.",
        "Dissolved particles pass through ordinary filter paper.",
      ),
      c(
        "To recover the solvent instead of the salt, choose…",
        "Distillation",
        ["Only crystallisation", "Only sedimentation"],
        "Evaporated solvent is condensed and collected.",
        "Collect the vapour after cooling it.",
      ),
      n(
        "A spot travels 1.5 cm while the solvent front travels 5 cm. Calculate Rf.",
        0.3,
        "",
        "1.5 ÷ 5 = 0.3.",
        "Both distances start at the baseline.",
      ),
      c(
        "One chromatogram spot proves a sample contains exactly one substance…",
        "No; components may overlap or be undetected",
        ["Yes in every solvent", "Only if it is blue"],
        "One resolved spot is limited evidence; conditions and detection matter.",
        "Think about co-migration.",
      ),
      c(
        "Why check the recovered sample’s melting range?",
        "It gives evidence about purity",
        ["It measures electrical current", "It identifies all isotopes"],
        "A sharp characteristic melting point supports purity under stated conditions.",
        "Connect physical data with sample quality.",
      ),
    ],
  ),
];
// New source-identified lessons have their own journey, not a generated legacy bank.
lessons.splice(1, 0, {
  slug: "atomic-models",
  topic: "atomic-structure",
  title: "How atomic models changed",
  goal: "Use evidence to explain how and why models of the atom changed.",
  tier: "foundation",
  course: "combined",
  model: "predict",
  concept:
    "New observations can challenge a model's predictions. Scattering evidence led to a tiny massive positive nucleus; Bohr and Chadwick supplied distinct later refinements.",
  questions: [],
  checks: [],
  prerequisite: "inside-an-atom",
  journey: atomicModelJourney,
});
// Existing legacy identities remain available for saved-work compatibility.
lessons.splice(2, 0, {
  slug: "atomic-scale",
  topic: "atomic-structure",
  title: "Atomic size and scale",
  goal: "Convert tiny lengths and compare atom and nucleus size using supplied radii.",
  tier: "foundation",
  course: "combined",
  model: "predict",
  concept:
    "Nano means 10⁻⁹. Atomic and nuclear radii differ by orders of magnitude; enlarging both equally preserves their ratio.",
  questions: [],
  checks: [],
  prerequisite: "atomic-models",
  journey: atomicScaleJourney,
});
lessons.splice(4, 0, {
  slug: "relative-atomic-mass",
  topic: "atomic-structure",
  title: "Relative atomic mass",
  goal: "Calculate and explain an abundance-weighted isotope average, with required rounding.",
  tier: "foundation",
  course: "combined",
  model: "predict",
  concept:
    "Isotope abundance weights the average mass; a non-integer average does not give any atom a fractional neutron.",
  questions: [],
  checks: [],
  prerequisite: "isotopes-and-ions",
  journey: relativeAtomicMassJourney,
});
lessons.find((lesson) => lesson.slug === "inside-an-atom")!.journey =
  atomicJourneys["inside-an-atom"];
lessons.find((lesson) => lesson.slug === "isotopes-and-ions")!.journey =
  isotopeJourney;
lessons.find((lesson) => lesson.slug === "electron-shells")!.journey =
  shellJourney;
const periodicLesson = lessons.find(
  (lesson) => lesson.slug === "periodic-patterns",
)!;
periodicLesson.journey = periodicTableJourney;
periodicLesson.goal =
  "Use atomic number, outer electrons and evidence to interpret periodic positions.";
periodicLesson.concept =
  "Modern proton-number order and outer-electron arrangements explain periodic positions and similar main-group chemistry. Physical and chemical evidence support metal/non-metal predictions, with exceptions and boundary cases.";
periodicLesson.prerequisite = "electron-shells";
const groupOneLesson = lessons.find(
  (lesson) => lesson.slug === "group-reactions",
)!;
groupOneLesson.journey = groupOneJourney;
groupOneLesson.title = "Group 1: alkali metals";
groupOneLesson.goal =
  "Use reaction evidence and outer-electron structure to explain alkali-metal chemistry and trends.";
groupOneLesson.concept =
  "Lithium, sodium and potassium form +1 ions by losing one outer electron. Increased distance and shielding down the group make loss easier; different reactants give different products.";
groupOneLesson.prerequisite = "periodic-patterns";
lessons.splice(lessons.indexOf(groupOneLesson) + 1, 0, {
  slug: "group-seven",
  topic: "atomic-structure",
  title: "Group 7: halogens",
  goal: "Distinguish molecules and ions, interpret physical states and test displacement predictions.",
  tier: "foundation",
  course: "combined",
  model: "predict",
  questions: [],
  checks: [],
  prerequisite: "group-reactions",
  journey: groupSevenJourney,
  concept:
    "Halogens are diatomic non-metals with seven outer electrons. Increasing distance and shielding make electron gain harder down the group; a more reactive halogen displaces a less reactive one from aqueous halide ions.",
});
lessons.splice(
  lessons.findIndex((lesson) => lesson.slug === "group-seven") + 1,
  0,
  {
    slug: "group-zero",
    topic: "atomic-structure",
    title: "Group 0: noble gases",
    goal: "Explain stable full shells and use property evidence to interpret noble-gas particles, trends and uses.",
    tier: "foundation",
    course: "combined",
    model: "predict",
    questions: [],
    checks: [],
    prerequisite: "group-seven",
    journey: groupZeroJourney,
    concept:
      "Noble gases have stable full outer shells: helium has two outer electrons, the others eight. They ordinarily occur as individual atoms. Boiling points increase down the group; different uses depend on inertness, density or non-flammability.",
  },
);
lessons.splice(lessons.indexOf(periodicLesson) + 1, 0, {
  slug: "periodic-development",
  topic: "atomic-structure",
  title: "How the periodic table developed",
  goal: "Explain how chemical evidence, gaps and testable predictions improved periodic classification.",
  tier: "foundation",
  course: "combined",
  model: "predict",
  concept:
    "Mendeleev preserved chemical families using gaps and departures from strict weight order. Later discoveries tested predictions; isotope abundance explains why average mass need not follow modern proton-number order.",
  questions: [],
  checks: [],
  prerequisite: "periodic-patterns",
  journey: periodicDevelopmentJourney,
});
const transitionLesson = lessons.find(
  (lesson) => lesson.slug === "transition-metals",
)!;
transitionLesson.journey = transitionMetalsJourney;
transitionLesson.prerequisite = "group-zero";
transitionLesson.goal =
  "Compare physical evidence, account for variable ion charges and distinguish catalyst rate from final amount.";
transitionLesson.concept =
  "The selected transition metals generally have higher melting points and densities, greater hardness and strength, and lower reactivity than Group 1. Many form coloured compounds and ions with different charges, and metals or compounds can act as catalysts.";
const ionicLesson = lessons.find((lesson) => lesson.slug === "ionic-bonding")!;
ionicLesson.journey = ionicBondingJourney;
ionicLesson.prerequisite = "group-zero";
lessons.splice(
  lessons.findIndex((lesson) => lesson.slug === "ionic-bonding") + 1,
  0,
  {
    slug: "ionic-structures",
    topic: "bonding",
    title: "Ionic structures and properties",
    goal: "Interpret a giant ionic lattice and explain energy demands and state-dependent conductivity.",
    tier: "foundation",
    course: "combined",
    model: "predict",
    concept:
      "Strong electrostatic attraction acts in all directions between opposite ions in a giant lattice. High melting points need an energy explanation; conductivity needs mobile charged ions, which are fixed in the solid but mobile when molten or dissolved.",
    questions: [],
    checks: [],
    prerequisite: "ionic-bonding",
    journey: ionicStructuresJourney,
  },
);
lessons.splice(
  lessons.findIndex((lesson) => lesson.slug === "ionic-structures") + 1,
  0,
  {
    slug: "ionic-formulae",
    topic: "bonding",
    title: "Naming and ionic formulas",
    goal: "Name common ionic compounds and construct their simplest formulas from given ions, keeping polyatomic groups intact.",
    tier: "foundation",
    course: "combined",
    model: "predict",
    concept:
      "Neutral formulas balance given positive and negative ion charges in the simplest whole-ion ratio. Repeated polyatomic groups need parentheses. Nitrate, carbonate and sulfate are common oxygen-containing -ate ions, but oxide and hydroxide prevent an absolute oxygen naming rule.",
    questions: [],
    checks: [],
    prerequisite: "ionic-structures",
    journey: ionicFormulaeJourney,
  },
);
ionicLesson.goal =
  "Transfer electrons, represent ion diagrams and distinguish electrostatic attraction from ion formation.";
ionicLesson.concept =
  "Group 1/2 metals lose outer electrons and Group 6/7 non-metals gain them. The resulting opposite ion charges attract electrostatically. Dot-and-cross origins, ion brackets and charge-balanced ratios describe the formation without implying isolated molecules.";
const covalentLesson = lessons.find(
  (lesson) => lesson.slug === "covalent-bonding",
)!;
covalentLesson.journey = covalentBondingJourney;
covalentLesson.prerequisite = "ionic-formulae";
covalentLesson.goal =
  "Construct complete shared and unshared outer-electron diagrams, interpret molecular models and distinguish bonding from structural extent.";
covalentLesson.concept =
  "Covalent bonds share electron pairs between atoms. Shared electrons count around both atoms but once in a conserved inventory. Selected small molecules have single, double or triple bonds and specific lone-pair counts; strong covalent bonding also occurs in polymers and giant structures.";
lessons.splice(lessons.indexOf(covalentLesson) + 1, 0, {
  slug: "small-molecules-properties",
  topic: "bonding",
  title: "Small molecules and properties",
  goal: "Explain boiling and electrical conduction using molecular attractions and charged carriers.",
  tier: "foundation",
  course: "combined",
  model: "predict",
  concept:
    "Strong covalent bonds remain within small molecules during melting and boiling. Weaker attractions between molecules are overcome. Neutral molecular samples lack mobile charged carriers; similar-family boiling trends depend on attraction strength and energy demand.",
  questions: [],
  checks: [],
  prerequisite: "covalent-bonding",
  journey: smallMoleculesPropertiesJourney,
});

const metallicLesson = lessons.find(
  (l) => l.slug === "structure-and-properties",
)!;
metallicLesson.title = "Metallic bonding and properties";
metallicLesson.journey = metallicBondingJourney;
metallicLesson.prerequisite = "small-molecules-properties";
metallicLesson.goal =
  "Explain metallic attraction, solid charge transport, malleability and alloy hardness using particle structure.";
metallicLesson.concept =
  "Strong attraction between positive cores and delocalised electrons holds a giant metal structure together. Electrons carry charge through the solid; pure-metal layers can slide while bonding remains. Different-sized atoms in alloys distort layers and make sliding more difficult.";
const diamondLesson = lessons.find((l) => l.slug === "carbon-structures")!;
diamondLesson.title = "Diamond and covalent networks";
diamondLesson.journey = diamondStructuresJourney;
diamondLesson.prerequisite = "structure-and-properties";
diamondLesson.goal =
  "Inspect four-neighbour diamond geometry and explain network hardness, energy demand and charge-carrier limits.";
diamondLesson.concept =
  "Diamond is a giant covalent carbon network with four bonds per carbon in three dimensions. Many strong bonds require much energy to overcome; its rigid network is very hard. Pure diamond lacks mobile charged carriers. Silica is a compound giant covalent network; finite fragments are not molecular formulas.";
const coordinationTasks = [
  ...tasks(diamondStructuresJourney).filter((q) =>
    [
      "dn-v1-g-network",
      "dn-v1-r-four",
      "dn-v1-p-neighbours",
      "dn-v1-ca-neighbours",
      "dn-v1-ra-neighbours",
    ].includes(q.id),
  ),
  diamondLesson.questions[0],
];
for (const q of coordinationTasks)
  q.exposureAliases = [
    ...new Set([
      ...(q.exposureAliases ?? []),
      ...coordinationTasks
        .filter((other) => other !== q)
        .map((other) => other.id),
    ]),
  ];
lessons.splice(lessons.indexOf(diamondLesson) + 1, 0, {
  slug: "graphite",
  topic: "bonding",
  title: "Graphite",
  goal: "Explain graphite’s local bonding, layer sliding and mobile charge carriers.",
  tier: "foundation",
  course: "combined",
  model: "predict",
  concept:
    "Each interior graphite carbon has three strong covalent bonds within a hexagonal sheet. Weak interlayer attractions permit intact sheets to slide. Mobile delocalised electrons carry charge through layers; many strong in-layer bonds require much energy to overcome.",
  questions: [],
  checks: [],
  prerequisite: "carbon-structures",
  journey: graphiteJourney,
});
const graphiteCoordination = tasks(graphiteJourney).filter((q) =>
  [
    "gr-v1-g-coordination",
    "gr-v1-r-coordination",
    "gr-v1-p-neighbours",
    "gr-v1-ca-neighbours",
    "gr-v1-ra-neighbours",
  ].includes(q.id),
);
for (const q of graphiteCoordination)
  q.exposureAliases = [
    ...new Set([
      ...(q.exposureAliases ?? []),
      ...graphiteCoordination
        .filter((other) => other !== q)
        .map((other) => other.id),
    ]),
  ];
lessons.splice(lessons.findIndex((l) => l.slug === "graphite") + 1, 0, {
  slug: "graphene",
  topic: "bonding",
  title: "Graphene",
  goal: "Explain a single-sheet structure and evaluate electrical and composite uses.",
  tier: "foundation",
  course: "combined",
  model: "predict",
  concept:
    "Graphene is one atom-layer sheet of interconnected hexagonal carbon rings, with three covalent neighbours per interior carbon. Mobile delocalised electrons carry charge through the sheet. Strong within-sheet covalent bonds support high in-plane strength; actual device and composite suitability depends on supplied evidence and criteria.",
  questions: [],
  checks: [],
  prerequisite: "graphite",
  journey: grapheneJourney,
});
const singleLayerTasks = tasks(grapheneJourney).filter((q) =>
  [
    "ge-v1-g-sheet",
    "ge-v1-r-sheet",
    "ge-v1-p-layer",
    "ge-v1-ca-layers",
    "ge-v1-ra-layers",
  ].includes(q.id),
);
for (const q of singleLayerTasks)
  q.exposureAliases = [
    ...new Set([
      ...(q.exposureAliases ?? []),
      ...singleLayerTasks
        .filter((other) => other !== q)
        .map((other) => other.id),
    ]),
  ];
const planarCoordination = [
  ...graphiteCoordination,
  ...tasks(grapheneJourney).filter((q) =>
    ["ge-v1-p-neighbours", "ge-v1-g-sheet", "ge-v1-r-sheet"].includes(q.id),
  ),
];
for (const q of planarCoordination)
  q.exposureAliases = [
    ...new Set([
      ...(q.exposureAliases ?? []),
      ...planarCoordination
        .filter((other) => other !== q)
        .map((other) => other.id),
    ]),
  ];
lessons.splice(lessons.findIndex((l) => l.slug === "graphene") + 1, 0, {
  slug: "fullerenes",
  topic: "bonding",
  title: "Fullerenes",
  goal: "Recognise hollow carbon molecules, inspect rings and explain bounded possible carrier uses.",
  tier: "foundation",
  course: "combined",
  model: "predict",
  concept:
    "Fullerenes are hollow carbon molecules. Buckminsterfullerene C60 is a closed roughly spherical sixty-carbon cage with pentagonal and hexagonal rings joined by covalent bonds. Separating unchanged molecules preserves their internal bonds. Hollow shape supports a possible suitable carrier role but does not prove every payload fits, releases or is compatible.",
  questions: [],
  checks: [],
  prerequisite: "graphene",
  journey: fullereneJourney,
});
for (const group of [
  [
    "fu-v1-g-cage",
    "fu-v1-r-type",
    "fu-v1-p-count",
    "fu-v1-ca-count",
    "fu-v1-ra-count",
  ],
  ["fu-v1-g-carrier", "fu-v1-r-carrier", "fu-v1-ca-use", "fu-v1-ra-use"],
]) {
  const shared = tasks(fullereneJourney).filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}
lessons.splice(lessons.findIndex((l) => l.slug === "fullerenes") + 1, 0, {
  slug: "carbon-nanotubes",
  topic: "bonding",
  title: "Carbon nanotubes",
  goal: "Inspect joined carbon tubes, compare length-to-diameter ratios and evaluate electrical and reinforcing uses.",
  tier: "foundation",
  course: "combined",
  model: "predict",
  concept:
    "Carbon nanotubes are cylindrical fullerenes with very high length-to-diameter ratios. Strong covalent bonds in a joined carbon wall support reinforcement. In a supplied conducting form, mobile delocalised electrons carry charge; actual conductivity and whole-composite performance require evidence.",
  questions: [],
  checks: [],
  prerequisite: "fullerenes",
  journey: nanotubeJourney,
});
for (const group of [
  [
    "nt-v1-g-tube",
    "nt-v1-r-shape",
    "nt-v1-p-recognise",
    "nt-v1-ca-shape",
    "nt-v1-ra-shape",
  ],
  ["nt-v1-g-ratio", "nt-v1-p-ratio", "nt-v1-p-unit", "nt-v1-ca-units"],
  [
    "nt-v1-g-reinforce",
    "nt-v1-r-strength",
    "nt-v1-ca-strength",
    "nt-v1-rb-strength",
  ],
  [
    "nt-v1-g-reinforce",
    "nt-v1-p-material",
    "nt-v1-p-evaluate",
    "nt-v1-cb-data",
  ],
  [
    "nt-v1-g-electronics",
    "nt-v1-r-carriers",
    "nt-v1-p-conduction",
    "nt-v1-ca-carrier",
    "nt-v1-ra-use",
  ],
]) {
  const shared = tasks(nanotubeJourney).filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}
// Interior carbon coordination is also visibly exposed in the tube model.
const tubeCoordination = tasks(nanotubeJourney).filter((q) =>
  ["nt-v1-g-tube", "nt-v1-p-neighbours"].includes(q.id),
);
const commonCoordination = [...planarCoordination, ...tubeCoordination];
for (const q of commonCoordination)
  q.exposureAliases = [
    ...new Set([
      ...(q.exposureAliases ?? []),
      ...commonCoordination
        .filter((other) => other !== q)
        .map((other) => other.id),
    ]),
  ];
lessons.splice(lessons.findIndex((l) => l.slug === "carbon-nanotubes") + 1, 0, {
  slug: "polymer-structures",
  topic: "bonding",
  title: "Polymer structures",
  goal: "Inspect large chain molecules, construct repeat diagrams and explain between-molecule forces and room-temperature states.",
  tier: "foundation",
  course: "combined",
  model: "predict",
  concept:
    "Simple polymers have very large molecules with strong covalent bonds linking atoms within chains. Relatively strong intermolecular forces help explain solids at room temperature. Poly(ethene) repeat units show two single-bonded carbons with two hydrogens each, continuing bonds through brackets and a large-number n. Organic polymerisation reactions are a separate later lesson.",
  questions: [],
  checks: [],
  prerequisite: "small-molecules-properties",
  journey: polymerStructureJourney,
});
for (const group of [
  [
    "ps-v1-g-chain",
    "ps-v1-r-chain",
    "ps-v1-p-recognise",
    "ps-v1-ca-type",
    "ps-v1-ra-type",
  ],
  [
    "ps-v1-g-repeat",
    "ps-v1-r-repeat",
    "ps-v1-p-carbon",
    "ps-v1-p-hydrogen",
    "ps-v1-p-n",
    "ps-v1-p-crossing",
    "ps-v1-p-draw",
    "ps-v1-ca-n",
    "ps-v1-cb-draw",
    "ps-v1-ra-n",
    "ps-v1-r-count",
  ],
  [
    "ps-v1-g-phase",
    "ps-v1-r-phase",
    "ps-v1-p-state",
    "ps-v1-p-explain",
    "ps-v1-ca-state",
    "ps-v1-ra-state",
  ],
  [
    "ps-v1-g-separation",
    "ps-v1-r-forces",
    "ps-v1-p-separation",
    "ps-v1-p-physical",
    "ps-v1-ca-force",
    "ps-v1-cb-change",
    "ps-v1-rb-separation",
  ],
]) {
  const shared = tasks(polymerStructureJourney).filter((q) =>
    group.includes(q.id),
  );
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}
lessons.splice(
  lessons.findIndex((l) => l.slug === "ionic-bonding"),
  0,
  {
    slug: "states-of-matter",
    topic: "bonding",
    title: "The three states",
    goal: "Track particle movement, predict states from supplied data and explain physical changes and energy.",
    tier: "foundation",
    course: "combined",
    model: "predict",
    concept:
      "Solids have particles vibrating about fixed positions; liquid particles are close and can move past one another; gas particles are widely spaced and move rapidly/randomly through available space. Physical changes conserve particle chemical identity. Supplied melting/boiling points predict states, with possible two-phase coexistence at exact boundaries. Force and energy explanations depend on actual bonding and structure. (l) means liquid; (aq) means dissolved in water.",
    questions: [],
    checks: [],
    prerequisite: "inside-an-atom",
    journey: statesJourney,
  },
);
for (const group of [
  [
    "st-v1-g-solid",
    "st-v1-r-solid",
    "st-v1-p-solid",
    "st-v1-ca-solid",
    "st-v1-ra-solid",
  ],
  [
    "st-v1-g-solid",
    "st-v1-g-liquid-gas",
    "st-v1-r-spacing",
    "st-v1-p-size",
    "st-v1-ca-size",
    "st-v1-rb-spacing",
  ],
  [
    "st-v1-g-transition",
    "st-v1-r-energy",
    "st-v1-p-melt-freeze",
    "st-v1-p-boil-condense",
    "st-v1-p-energy",
    "st-v1-ca-cooling",
    "st-v1-cb-heat",
    "st-v1-rb-condense",
  ],
  [
    "st-v1-r-symbol",
    "st-v1-p-molten",
    "st-v1-p-aqueous",
    "st-v1-ca-symbol",
    "st-v1-cb-aqueous",
    "st-v1-ra-symbol",
  ],
  [
    "st-v1-g-forecast",
    "st-v1-r-data",
    "st-v1-p-melt-boundary",
    "st-v1-p-boil-boundary",
    "st-v1-cb-boundary",
    "st-v1-rb-boundary",
  ],
]) {
  const shared = tasks(statesJourney).filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}
lessons.sort(
  (a, b) =>
    topics.findIndex((t) => t.slug === a.topic) -
    topics.findIndex((t) => t.slug === b.topic),
);
export const lessonBySlug = (slug: string) =>
  lessons.find((l) => l.slug === slug);
export const topicLessons = (slug: string) =>
  lessons.filter((l) => l.topic === slug);
export const questionById = (id: string) =>
  lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .find((q) => q.id === id) ??
  paper1FoundationFull.parts.find((part) => part.question.id === id)
    ?.question ??
  paper2FoundationFull.parts.find((part) => part.question.id === id)?.question;

const nanoLesson = lessons.find(
  (l) => l.slug === "particles-and-nanoparticles",
)!;
Object.assign(nanoLesson, {
  title: "Nanoparticles",
  goal: "Compare nano dimensions, calculate surface and footprint areas and volume, and evaluate supplied uses, ethical issues and perceived versus measured risk.",
  course: "separate",
  prerequisite: "states-of-matter",
  concept:
    "Nanoparticles are usually 1–100 nm in size. Ideal cube surface area is 6a² and volume a³; their quotient is 6/a in inverse length units. Smaller separated particles can expose more surface for the same material quantity. Benefits and possible risks depend on material, application and exposure; performance evidence alone does not establish safety.",
  journey: nanoparticlesJourney,
});
for (const group of [
  [
    "np-v1-g-subdivide",
    "np-v1-r-volume",
    "np-v1-p-conserve",
    "np-v1-ca-conserve",
    "np-v1-rb-conserve",
  ],
  ["np-v1-r-ratio", "np-v1-p-tenfold", "np-v1-rb-factor"],
  [
    "np-v1-g-evidence",
    "np-v1-r-evidence",
    "np-v1-p-risk",
    "np-v1-ca-risk",
    "np-v1-ra-risk",
  ],
  ["np-v1-g-evidence", "np-v1-p-benefit", "np-v1-cb-benefit"],
]) {
  const shared = tasks(nanoparticlesJourney).filter((q) =>
    group.includes(q.id),
  );
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

// Preserve exposure when earlier preliminary nano questions have been seen.
for (const group of [
  [
    "particles-and-nanoparticles-2",
    "np-v1-r-ratio",
    "np-v1-p-amount",
    "np-v1-rb-factor",
  ],
  ["particles-and-nanoparticles-3", "np-v1-p-range"],
  [
    "particles-and-nanoparticles-4",
    "np-v1-g-evidence",
    "np-v1-ca-risk",
    "np-v1-ra-risk",
  ],
]) {
  const shared = [
    ...nanoLesson.questions,
    ...nanoLesson.checks,
    ...tasks(nanoparticlesJourney),
  ].filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

const formulaMassLesson = lessons.find((l) => l.slug === "formulae-and-mass")!;
Object.assign(formulaMassLesson, {
  goal: "Read formula counts, construct element contributions and calculate relative formula mass.",
  course: "combined",
  prerequisite: "relative-atomic-mass",
  concept:
    "Read each chemical symbol and following subscript; an omitted subscript means one. A subscript outside brackets multiplies every atom inside. Relative formula mass is the sum of each formula count multiplied by its supplied relative atomic mass and has no units. A coefficient counts complete formulas without changing the per-formula relative mass. Ionic formulas describe composition ratios rather than isolated molecules.",
  journey: formulaMassJourney,
});
for (const group of [
  [
    "formulae-and-mass-0",
    "fm-v1-p-water",
    "fm-v1-p-per-formula",
    "fm-v1-g-quantity",
  ],
  ["formulae-and-mass-1", "fm-v1-p-co2", "fm-v1-cb-quantity"],
  ["formulae-and-mass-2", "fm-v1-g-brackets", "fm-v1-p-ca-count"],
  ["formulae-and-mass-3", "fm-v1-g-mass", "fm-v1-p-mgcl"],
  ["formulae-and-mass-5", "fm-v1-p-ammonium-count"],
  [
    "fm-v1-g-quantity",
    "fm-v1-r-coefficient",
    "fm-v1-p-total-atoms",
    "fm-v1-p-per-formula",
    "fm-v1-ca-coefficient",
    "fm-v1-cb-quantity",
    "fm-v1-ra-coefficient",
  ],
  [
    "fm-v1-g-mass",
    "fm-v1-r-units",
    "fm-v1-p-units",
    "fm-v1-ca-units",
    "fm-v1-rb-units",
  ],
  ["fm-v1-g-brackets", "fm-v1-r-ionic", "fm-v1-p-ionic", "fm-v1-cb-ionic"],
]) {
  const shared = [
    ...formulaMassLesson.questions,
    ...formulaMassLesson.checks,
    ...tasks(formulaMassJourney),
  ].filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

lessons.splice(
  lessons.findIndex((l) => l.slug === "balancing-equations"),
  0,
  {
    slug: "percentage-composition",
    topic: "quantitative",
    title: "Percentage composition",
    goal: "Calculate named-element mass shares and scale samples using the complete compound denominator.",
    tier: "foundation",
    course: "combined",
    model: "moles",
    concept:
      "Percentage by mass = named-element count × Aᵣ ÷ complete compound Mᵣ × 100. All atoms of the named element contribute, and the denominator includes every element. Atom-count fractions need not equal mass fractions. Scaling the same pure compound changes the element and whole sample masses together, preserving their percentage. Different mixture proportions can change composition. Round only the final reported percentage.",
    questions: [],
    checks: [],
    prerequisite: "formulae-and-mass",
    journey: compositionJourney,
  },
);
for (const group of [
  [
    "pc-v1-g-contribution",
    "pc-v1-p-ca",
    "pc-v1-p-carbon",
    "pc-v1-p-carbonate-oxygen",
    "pc-v1-g-sample",
  ],
  [
    "pc-v1-g-contribution",
    "pc-v1-g-count-mass",
    "pc-v1-r-mass-not-count",
    "pc-v1-p-mgo",
    "pc-v1-p-explain",
    "pc-v1-ca-count",
  ],
  ["pc-v1-g-contribution", "pc-v1-r-denominator", "pc-v1-ca-whole"],
  [
    "pc-v1-g-contribution",
    "pc-v1-g-sample",
    "pc-v1-r-scale",
    "pc-v1-p-invariance",
    "pc-v1-cb-invariance",
    "pc-v1-rb-fraction",
  ],
  [
    "pc-v1-r-numerator",
    "pc-v1-g-compare",
    "pc-v1-p-nitrate",
    "pc-v1-p-urea",
    "pc-v1-p-sulfate",
    "pc-v1-p-evaluate",
  ],
  ["pc-v1-p-rounding", "pc-v1-cb-rounding"],
]) {
  const shared = tasks(compositionJourney).filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

const balancingLesson = lessons.find((l) => l.slug === "balancing-equations")!;
Object.assign(balancingLesson, {
  prerequisite: "formulae-and-mass",
  course: "combined",
  journey: balancingJourney,
  goal: "Construct complete chemical equations while preserving substance identity and every element count.",
  concept:
    "Keep every supplied formula fixed and change coefficients before complete formulas. Count each element using coefficient × formula subscript, including all bracketed groups and all terms on each side. Every element must balance; total molecule numbers need not match. Whole multiples of a balanced equation remain balanced. When requested, divide every coefficient by their common factor to write the smallest whole-number ratio. Fractional coefficients can be intermediate ratios, not half individual molecules. State symbols describe supplied physical states separately from counts.",
});
for (const group of [
  [
    "balancing-equations-0",
    "be-v1-g-ledger",
    "be-v1-p-water",
    "be-v1-p-multiple",
  ],
  ["balancing-equations-1", "be-v1-p-magnesium"],
  [
    "balancing-equations-2",
    "be-v1-r-identity",
    "be-v1-g-identity",
    "be-v1-p-identity",
    "be-v1-p-explain",
    "be-v1-cb-identity",
    "be-v1-rb-subscript",
  ],
  ["balancing-equations-3", "be-v1-p-ammonia"],
  ["balancing-equations-4", "be-v1-g-ledger", "be-v1-p-aluminium"],
  [
    "balancing-equations-5",
    "be-v1-g-molecules",
    "be-v1-p-methane",
    "be-v1-p-oxygen",
    "be-v1-p-evaluate",
  ],
  ["be-v1-g-ledger", "be-v1-r-every", "be-v1-p-verify"],
  ["be-v1-g-molecules", "be-v1-p-molecules", "be-v1-cb-molecules"],
  ["be-v1-r-ratio", "be-v1-p-multiple", "be-v1-ca-multiple", "be-v1-ra-ratio"],
  ["be-v1-p-ethane", "be-v1-p-fraction"],
  ["be-v1-g-words", "be-v1-p-potassium", "be-v1-r-formulas"],
]) {
  const shared = [
    ...balancingLesson.questions,
    ...balancingLesson.checks,
    ...tasks(balancingJourney),
  ].filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

lessons.splice(
  lessons.findIndex((l) => l.slug === "conservation-and-concentration"),
  0,
  {
    slug: "conservation-of-mass",
    topic: "quantitative",
    title: "Conservation of mass",
    goal: "Account for every retained or transferred substance within a clearly defined weighed boundary.",
    tier: "foundation",
    course: "combined",
    model: "moles",
    concept:
      "Chemical reactions rearrange atoms without creating or destroying them. The total mass of a closed system stays constant, including retained gas and unused reactants. A balance reading can decrease when gas leaves or increase when oxygen enters the weighed collection. Compare the same apparatus and boundary. Multiply every complete relative formula mass by its equation coefficient before summing relative contributions; these totals are not measured gram values.",
    questions: [],
    checks: [],
    prerequisite: "balancing-equations",
    journey: massConservationJourney,
  },
);
const legacyMass = lessons.find(
  (l) => l.slug === "conservation-and-concentration",
)!;
for (const group of [
  ["conservation-and-concentration-0", "mc-v1-w-total", "mc-v1-g-inventory"],
  [
    "conservation-and-concentration-1",
    "mc-v1-r-gas",
    "mc-v1-g-gas",
    "mc-v1-ca-retained",
  ],
  [
    "mc-v1-r-oxygen",
    "mc-v1-g-oxidation",
    "mc-v1-p-heating",
    "mc-v1-p-evaluate",
    "mc-v1-cb-cause",
  ],
  ["mc-v1-r-weight", "mc-v1-g-weighted", "mc-v1-rb-weighted"],
  ["mc-v1-p-incomplete", "mc-v1-cb-inference"],
  ["mc-v1-r-leftover", "mc-v1-p-leftover-rule"],
  ["mc-v1-r-boundary", "mc-v1-ra-boundary"],
]) {
  const shared = [
    ...legacyMass.questions,
    ...legacyMass.checks,
    ...tasks(massConservationJourney),
  ].filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

lessons.splice(
  lessons.findIndex((l) => l.slug === "conservation-and-concentration"),
  0,
  {
    slug: "measurement-uncertainty",
    topic: "quantitative",
    title: "Measurements and uncertainty",
    goal: "Summarise repeat measurements with justified selection, visible scatter and accurate limits on the conclusions.",
    tier: "foundation",
    course: "combined",
    model: "moles",
    concept:
      "Keep original repeat readings and explain any exclusion using measurement evidence. Mean = retained sum ÷ retained count. State whether a range refers to all recorded results or a justified retained set, and distinguish its endpoints from maximum minus minimum. Apply an explicitly supplied half-range convention as an uncertainty estimate, not a guarantee. Clustering shows precision; accuracy requires a true or accepted reference. Random variation can partly cancel in a mean, while a common systematic offset remains. Repeatability within an investigator and reproducibility across investigators or equipment require different comparisons.",
    questions: [],
    checks: [],
    prerequisite: "conservation-of-mass",
    journey: measurementJourney,
  },
);
for (const group of [
  [
    "mu-v1-r-selection",
    "mu-v1-g-selection",
    "mu-v1-p-largest",
    "mu-v1-p-investigate",
    "mu-v1-p-evaluate",
    "mu-v1-ca-select",
    "mu-v1-rb-selection",
  ],
  [
    "mu-v1-r-bias",
    "mu-v1-g-bias",
    "mu-v1-p-unknown",
    "mu-v1-ca-accuracy",
    "mu-v1-ra-reference",
  ],
  [
    "mu-v1-r-reproduce",
    "mu-v1-g-reproduce",
    "mu-v1-p-repeatable",
    "mu-v1-p-reproducible",
    "mu-v1-cb-reproduce",
  ],
  ["mu-v1-p-averaging", "mu-v1-p-explain", "mu-v1-cb-systematic"],
]) {
  const shared = tasks(measurementJourney).filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

const concentrationLesson = lessons.find(
  (l) => l.slug === "conservation-and-concentration",
)!;
Object.assign(concentrationLesson, {
  title: "Concentration of solutions",
  course: "combined",
  prerequisite: "formulae-and-mass",
  journey: concentrationJourney,
  goal: "Calculate dissolved-solute mass per final solution volume with explicit unit working and rearrangements.",
  concept:
    "Concentration in g/dm³=dissolved-solute mass in grams÷final solution volume in dm³. Use final solution volume, not initial solvent volume or vessel capacity. Solute mass differs from whole-solution mass used in density. Convert cm³ to dm³ by dividing by1000;1 L=1 dm³. Solute mass=concentration×solution volume; solution volume=solute mass÷concentration. Undissolved material does not contribute to dissolved-solute mass. Higher explanations of changing amounts and dilution receive their own separate lesson.",
});
for (const group of [
  [
    "conservation-and-concentration-2",
    "conservation-and-concentration-4",
    "sc-v1-g-unit",
  ],
  ["conservation-and-concentration-3", "sc-v1-r-convert", "sc-v1-p-error"],
  ["conservation-and-concentration-5", "sc-v1-g-mass"],
  [
    "sc-v1-r-basis",
    "sc-v1-g-basis",
    "sc-v1-p-interpret",
    "sc-v1-p-missing-final",
    "sc-v1-p-explain",
    "sc-v1-ca-basis",
    "sc-v1-cb-density",
    "sc-v1-ra-basis",
  ],
  ["sc-v1-r-dissolved", "sc-v1-p-undissolved", "sc-v1-rb-dissolved"],
]) {
  const shared = [
    ...concentrationLesson.questions,
    ...concentrationLesson.checks,
    ...tasks(concentrationJourney),
  ].filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

lessons.splice(
  lessons.findIndex((l) => l.slug === "conservation-and-concentration") + 1,
  0,
  {
    slug: "changing-concentration",
    topic: "quantitative",
    title: "Changing concentration",
    goal: "Explain combined mass and final-volume changes, retaining or transferring all solute explicitly.",
    tier: "higher",
    course: "combined",
    model: "moles",
    prerequisite: "conservation-and-concentration",
    questions: [],
    checks: [],
    journey: changingConcentrationJourney,
    concept:
      "Concentration factor=mass factor÷final solution-volume factor for the same solute. Direct proportion to dissolved mass requires fixed volume; inverse proportion to volume requires fixed dissolved mass. Dilution retains solute while increasing final volume. Removing a homogeneous solution portion removes proportional solute and volume, preserving concentration. Target final solution volume differs from solvent added; addition is calculated only with an explicit additive-volume approximation. No reaction or unaccounted solute loss is assumed.",
  },
);
for (const group of [
  [
    "cc-v1-r-fixed",
    "cc-v1-g-factors",
    "cc-v1-p-equal",
    "cc-v1-p-compete",
    "cc-v1-p-evidence",
    "cc-v1-p-justify",
    "cc-v1-cb-equal",
  ],
  ["cc-v1-r-inverse", "cc-v1-ca-condition"],
  ["cc-v1-r-retain", "cc-v1-g-dilute", "cc-v1-p-solute"],
  ["cc-v1-r-homogeneous", "cc-v1-g-portion", "cc-v1-p-explain"],
]) {
  const shared = tasks(changingConcentrationJourney).filter((q) =>
    group.includes(q.id),
  );
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

const moleLesson = lessons.find((l) => l.slug === "moles-and-reacting-masses")!;
Object.assign(moleLesson, {
  title: "Moles and particles",
  prerequisite: "formulae-and-mass",
  tier: "higher",
  course: "combined",
  journey: molesJourney,
  goal: "Convert mass, amount in mol and explicitly named entity counts with consistent units and formula composition.",
  concept:
    "Molar mass in g/mol is numerically equal to the dimensionless relative formula or atomic mass using supplied GCSE values. n=m/M with mass in grams; m=nM. N=nNₐ and n=N/Nₐ count the stated atoms, molecules, ions, electrons or formula units. Use supplied GCSE-rounded Nₐ=6.02×10²³ mol⁻¹. Formula subscripts give constituent amounts; NaCl formula units are not discrete molecules. One mole is not a fixed gram amount or fixed volume. Reaction coefficients and reacting-mass ratios receive their own individually authored next lesson.",
});
for (const group of [
  ["moles-and-reacting-masses-0", "mo-v1-r-equal"],
  ["moles-and-reacting-masses-1", "mo-v1-g-mass"],
  ["moles-and-reacting-masses-2", "mo-v1-g-reverse", "mo-v1-rb-inverse"],
  ["moles-and-reacting-masses-5", "mo-v1-r-equation"],
  ["mo-v1-r-unit", "mo-v1-p-working", "mo-v1-p-explain", "mo-v1-ca-unit"],
  [
    "mo-v1-r-entity",
    "mo-v1-g-entities",
    "mo-v1-p-chloride",
    "mo-v1-p-count-name",
    "mo-v1-r-equal",
    "mo-v1-p-justify",
    "mo-v1-cb-equal",
  ],
  ["mo-v1-r-standard", "mo-v1-p-total-ions"],
]) {
  const shared = [
    ...moleLesson.questions,
    ...moleLesson.checks,
    ...tasks(molesJourney),
  ].filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

lessons.splice(
  lessons.findIndex((l) => l.slug === "moles-and-reacting-masses") + 1,
  0,
  {
    slug: "reacting-masses",
    topic: "quantitative",
    title: "Reacting masses",
    goal: "Use balanced mole ratios and molar masses to calculate theoretical product and required-reactant masses.",
    tier: "higher",
    course: "combined",
    model: "moles",
    prerequisite: "moles-and-reacting-masses",
    questions: [],
    checks: [],
    journey: reactingMassesJourney,
    concept:
      "Balanced coefficients give mol ratios. Requested amount=given amount×requested coefficient÷given coefficient. For masses use n=m/M, then the mole ratio, then m=nM. Equivalently weight each coefficient by its molar mass to form a mass ratio. Match units explicitly. Calculations assume complete theoretical conversion of the given reactant with other reactants sufficient/in excess. Each element's atom amount and total mass are conserved; total molecular amount need not be. Separate representative before-and-after molecules are not a reaction mechanism or mole-sized population.",
  },
);
for (const group of [
  ["moles-and-reacting-masses-3", "rm-v1-p-equal"],
  ["moles-and-reacting-masses-4", "rm-v1-g-ratio"],
  ["rm-v1-r-coeff", "rm-v1-p-repair", "rm-v1-p-explain", "rm-v1-ca-quantity"],
  [
    "rm-v1-r-conservation",
    "rm-v1-p-molecules",
    "rm-v1-p-justify",
    "rm-v1-cb-conserved",
  ],
]) {
  const shared = [
    ...moleLesson.questions,
    ...moleLesson.checks,
    ...tasks(reactingMassesJourney),
  ].filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

lessons.splice(lessons.findIndex((l) => l.slug === "reacting-masses") + 1, 0, {
  slug: "balancing-from-masses",
  topic: "quantitative",
  title: "Balancing from masses",
  goal: "Derive smallest balanced coefficients from reacted masses and distinguish candidate equations using measured products.",
  tier: "higher",
  course: "combined",
  model: "moles",
  prerequisite: "reacting-masses",
  questions: [],
  checks: [],
  journey: balancingMassesJourney,
  concept:
    "Convert each consumed/produced mass to mol using its own supplied molar mass. Divide all amounts by the same smallest amount, then scale the entire ratio if a fractional entry must be made whole. Do not round away a half-integer or change supplied formulas. Check every element's atom counts and simplify common factors for the requested conventional form. Exclude measured unreacted excess from the reaction ratio but retain it in total mass. Supplied candidate equations may both conserve atoms while predicting different measured product ratios. Stated precision/uncertainty must justify interpreting approximate experimental ratios.",
});
for (const group of [
  ["bm-v1-r-mass", "bm-v1-p-explain", "rm-v1-r-coeff", "rm-v1-ca-quantity"],
  [
    "bm-v1-r-whole",
    "bm-v1-g-fraction",
    "bm-v1-p-oxygen-fraction",
    "bm-v1-p-ethane",
    "bm-v1-p-rounding",
    "bm-v1-p-multiple",
    "bm-v1-p-justify",
    "bm-v1-ca-fraction",
    "bm-v1-cb-fraction",
    "bm-v1-ca-round",
    "bm-v1-ra-factor",
    "be-v1-p-ethane",
  ],
  [
    "bm-v1-r-leftover",
    "bm-v1-g-consumed",
    "bm-v1-p-total",
    "bm-v1-cb-inventory",
  ],
  ["bm-v1-g-amounts", "bm-v1-p-ratio", "be-v1-p-magnesium"],
  ["bm-v1-p-ammonia", "be-v1-p-ammonia"],
  ["bm-v1-p-water", "be-v1-p-water"],
]) {
  const shared = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

const limitingIndex = lessons.findIndex(
  (l) => l.slug === "yield-and-atom-economy",
);
lessons.splice(limitingIndex, 0, {
  slug: "limiting-reactants",
  title: "Limiting reactants",
  goal: "Identify limiting supplies, calculate theoretical products and retain excess reactants.",
  topic: "quantitative",
  tier: "higher",
  course: "combined",
  model: "moles",
  prerequisite: "reacting-masses",
  questions: [],
  checks: [],
  journey: limitingReactantsJourney,
  concept:
    "Compare every available mol amount divided by its balanced-equation coefficient. The smaller capacity determines the theoretical maximum under complete conversion. Equal capacities consume both without excess. Convert masses using each substance’s molar mass, retain unused matter in the inventory and recompare after any change in supplies. An excess reactant alone cannot increase the maximum; actual conversion or collection may be lower.",
});

const yieldLesson = lessons.find((l) => l.slug === "yield-and-atom-economy")!;
Object.assign(yieldLesson, {
  title: "Percentage yield",
  goal: "Choose comparable product masses and distinguish theoretical formation from actual collection.",
  tier: "foundation",
  course: "separate",
  prerequisite: "percentage-composition",
  journey: percentageYieldJourney,
  concept:
    "Percentage yield compares actual desired product with the maximum theoretical amount of the same product in matching units and on the stated pure/dry basis. Multiply the theoretical amount by the yield factor to obtain actual product; divide actual by a supplied yield factor to recover the theoretical100% reference. Incomplete/reversible reactions, competing side reactions and collection losses differ. Atoms remain in all material; uncollected product is not destroyed. An apparent percentage above100 must be recorded and investigated for purity, dryness, measurements or assumptions, never silently capped. Atom economy and Higher reactant-to-theoretical-product stoichiometry are separate lessons.",
});
for (const group of [
  ["yield-and-atom-economy-0", "py-v1-g-fraction", "py-v1-p-shortfall"],
  ["yield-and-atom-economy-1", "py-v1-r-loss", "py-v1-p-explain-loss"],
  ["yield-and-atom-economy-4", "py-v1-g-collection"],
  ["yield-and-atom-economy-5", "py-v1-p-atom-economy"],
  ["py-v1-p-wet", "py-v1-p-explain-suspect", "py-v1-ca-proof"],
]) {
  const shared = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

lessons.splice(
  lessons.findIndex((l) => l.slug === "yield-and-atom-economy") + 1,
  0,
  {
    slug: "atom-economy",
    title: "Atom economy",
    topic: "quantitative",
    tier: "foundation",
    course: "separate",
    model: "moles",
    prerequisite: "formulae-and-mass",
    goal: "Weight the balanced equation, choose its desired product and distinguish economy from collected yield.",
    questions: [],
    checks: [],
    journey: atomEconomyJourney,
    concept:
      "Atom economy is coefficient-weighted relative mass of the specified desired product divided by the coefficient-weighted relative mass of all reactants, multiplied by 100. All products conserve the full relative mass, including unwanted by-products. Both numerator and denominator use their balanced coefficients. Scaling the whole equation cancels from the fraction; selecting a different desired product changes the numerator. Actual collected yield measures a separate actual/theoretical product ratio. Neither high economy nor conservation guarantees full recovery or overall sustainability. Higher production-pathway comparison is a separate lesson.",
  },
);
for (const group of [
  [
    "ae-v1-r-weight",
    "ae-v1-r-base",
    "ae-v1-g-weighted",
    "ae-v1-p-coefficients",
    "ae-v1-p-missing-coefficient",
    "ae-v1-p-missing-numerator",
  ],
  [
    "ae-v1-g-desired",
    "ae-v1-p-other-product",
    "ae-v1-p-all-products",
    "ae-v1-p-scale",
    "ae-v1-p-scale-invariant",
    "ae-v1-ca-product",
  ],
  [
    "ae-v1-g-partition",
    "ae-v1-p-methane-water",
    "ae-v1-p-atom-count",
    "ae-v1-p-partition",
  ],
  [
    "yield-and-atom-economy-3",
    "yield-and-atom-economy-5",
    "py-v1-p-atom-economy",
    "ae-v1-r-yield",
    "ae-v1-g-contrast",
    "ae-v1-p-addition",
    "ae-v1-p-economy-yield",
    "ae-v1-p-recovery",
    "ae-v1-p-explain-two-measures",
    "ae-v1-ca-measures",
    "ae-v1-cb-measures",
  ],
  ["yield-and-atom-economy-2", "ae-v1-p-explain-allocation"],
  ["ae-v1-ca-copper", "ae-v1-ca-percentage"],
  [
    "ae-v1-cb-aluminium",
    "ae-v1-cb-percentage",
    "ae-v1-cb-product",
    "ae-v1-rb-weight",
  ],
]) {
  const shared = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => group.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

lessons.splice(lessons.findIndex((l) => l.slug === "atom-economy") + 1, 0, {
  slug: "theoretical-yield",
  title: "Theoretical yield",
  topic: "quantitative",
  tier: "higher",
  course: "separate",
  model: "moles",
  prerequisite: "limiting-reactants",
  goal: "Construct theoretical product mass from reactants before using or reversing collected yield.",
  questions: [],
  checks: [],
  journey: theoreticalYieldJourney,
  concept:
    "A theoretical product maximum is constructed from active reactant mass, molar mass and balanced coefficients. Check that another reactant is sufficient or compare both possible product amounts. Actual yield compares collected and theoretical mass of the same product. To work backwards, divide collected product by the yield factor before reversing the mol ratio. Keep units consistent and round only the requested final result. Ideal complete conversion is an assumption; real conversion and recovery can be lower.",
});

for (const ids of [
  ["rm-v1-g-forward", "ty-v1-g-maximum"],
  ["rm-v1-p-ammonia", "ty-v1-ra-maximum"],
]) {
  const shared = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.includes(q.id));
  for (const q of shared)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...shared.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

lessons.splice(
  lessons.findIndex((l) => l.slug === "theoretical-yield") + 1,
  0,
  {
    slug: "production-pathways",
    title: "Choosing a production route",
    topic: "quantitative",
    tier: "higher",
    course: "separate",
    model: "moles",
    prerequisite: "atom-economy",
    goal: "Compare supplied yield, rate, equilibrium and useful by-products to justify a route for a stated purpose.",
    questions: [],
    checks: [],
    journey: productionPathwaysJourney,
    concept:
      "A route choice requires a stated purpose and comparable data. Equation atom economy, collected actual/theoretical yield, output per full batch time, equilibrium position and useful co-products are distinct. Apply required constraints before comparing an objective. A catalyst speeds approach without shifting equilibrium at fixed temperature and pressure. Co-product sales depend on evidenced demand and included costs; they do not change atom economy of the specified desired product. Partial data do not establish an overall cheapest or most sustainable process. Written decisions need linked evidence and are self-reviewed.",
  },
);

lessons.splice(
  lessons.findIndex((l) => l.slug === "production-pathways") + 1,
  0,
  {
    slug: "molar-concentration",
    title: "Molar concentration",
    topic: "quantitative",
    tier: "higher",
    course: "separate",
    model: "moles",
    prerequisite: "moles-and-reacting-masses",
    goal: "Connect dissolved amount, solute mass and final solution volume with correctly matched units.",
    questions: [],
    checks: [],
    journey: molarConcentrationJourney,
    concept:
      "Molar concentration c=n/V uses dissolved solute amount n in mol and final solution volume V in dm³. Convert cm³ by dividing by1000. Rearrange n=cV and V=n/c; solute mass m=nM uses molar mass in g/mol. Mass concentration equals molar concentration times molar mass. Homogeneous sampling keeps concentration; dilution keeps dissolved amount if no solute is lost. Reaction ratios and titration practical reasoning are taught separately.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "gas-volumes-and-solutions")!,
  {
    title: "Gas volumes",
    course: "separate",
    prerequisite: "limiting-reactants",
    goal: "Calculate gas volumes using amounts, balanced equations, matching conditions and complete final inventories.",
    journey: gasVolumesJourney,
    concept:
      "At the stated room temperature and pressure (20°C and 1 atmosphere), use the supplied 24 dm³/mol for gases. Convert mass to amount using molecular molar mass and match cubic volume units. Gaseous coefficient ratios require matching temperature and pressure. Include unused gases in final gas totals; exclude solids and liquids while conserving all atoms and total mass. Steam examples explicitly use common non-RTP conditions and coefficient ratios, without assuming 24 dm³/mol. Original saved solution questions remain recoverable; molar concentration is taught separately.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "empirical-formulae")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "formulae-and-mass",
    goal: "Build the simplest atom ratio from composition, then justify whole molecular counts and practical evidence.",
    journey: empiricalFormulaeJourney,
    concept:
      "Pearson shared Foundation requirements 1.44–1.46 cover empirical and molecular formulae. Convert each element mass using its own atomic mass, divide every amount by the same smallest value, then clear fractions through common multiplication. Percentage composition can use a convenient 100 g basis. A molecular formula additionally requires relative molecular mass and a positive integer multiplier of the entire empirical formula. Empirical ionic ratios do not imply discrete molecules. Supervised experimental data require apparatus subtraction and justified final readings; constant mass alone does not prove purity. AQA related ionic-formula and Higher measured-ratio work is not an identical board requirement.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "titration-calculations")!,
  {
    prerequisite: "molar-concentration",
    journey: titrationCalculationsJourney,
    goal: "Follow a measured titre through the balanced mole ratio to the unknown concentration or reacting volume.",
    concept:
      "A delivered titre is final minus initial burette reading. Calculate known n=cV using V in dm³, apply unknown/known coefficients from the balanced equation, then divide unknown amount by its original sample volume. Convert to g/dm³ using the named solute molar mass. For reverse questions, divide required titrant moles by its concentration. Practical technique and endpoint reliability need their separate lesson.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "metal-reactivity")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "isotopes-and-ions",
    journey: metalReactivityJourney,
    goal: "Use metal order, reaction conditions and displacement evidence to justify predictions.",
    concept:
      "More reactive metals have a greater tendency to form positive ions. Suitable room-temperature water and dilute-HCl records distinguish products and observations. A more reactive added metal displaces a less reactive dissolved metal without changing element identities. Sulfate remains a separate spectator ion. Missing comparisons leave partial orders; unfair conditions and final gas yield alone do not establish reaction-rate rankings. Oxide reduction, extraction and Higher half-equations require separate lessons.",
  },
);

lessons.splice(lessons.findIndex((l) => l.slug === "metal-reactivity") + 1, 0, {
  slug: "oxidation-and-reduction",
  topic: "chemical-changes",
  title: "Oxidation and reduction",
  tier: "foundation",
  course: "combined",
  prerequisite: "balancing-equations",
  model: "predict",
  questions: [],
  checks: [],
  journey: oxygenRedoxJourney,
  goal: "Track oxygen to justify oxidation, oxide reduction and the reducing agent's role.",
  concept:
    "Metals gain oxygen when they form oxides. Reduction of an oxide to metal removes oxygen into another product; the receiving reducing agent is oxidised in the supplied oxide reactions. Oxygen atoms and complete-system mass are conserved. Sample mass changes depend on the stated boundary. Carbon products follow the given balanced equation. Product evidence distinguishes oxide-to-metal reduction from oxide/acid neutralisation; colour alone is insufficient. Oxygen descriptions do not rule out broader redox without oxygen transfer, which requires the separate electron lesson.",
});

lessons.splice(
  lessons.findIndex((l) => l.slug === "oxidation-and-reduction") + 1,
  0,
  {
    slug: "metal-extraction",
    topic: "chemical-changes",
    title: "Extraction and reactivity",
    tier: "foundation",
    course: "combined",
    prerequisite: "oxidation-and-reduction",
    model: "predict",
    questions: [],
    checks: [],
    journey: metalExtractionJourney,
    goal: "Choose suitable extraction routes and distinguish ore, contained metal and actual recovered output.",
    concept:
      "Native metals are uncombined but may remain mixed with impurities. Carbon can reduce suitable oxides of metals below carbon; aluminium requires the supplied electrolysis alternative. Ore concentration is distinct from chemical reduction. Supplied equations determine carbon oxide products. Grade and compound composition give maximum contained metal, while actual recovered output determines comparable unit costs. Decisions must meet every stated constraint; detailed electrolysis and Higher biological extraction require their own lessons.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "acids-and-neutralisation")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "ionic-formulae",
    journey: acidNeutralisationJourney,
    goal: "Predict acid reaction products, construct salts and justify neutralisation using reacting ions and evidence.",
    concept:
      "Aqueous acids supply H+; alkalis are soluble bases supplying OH−. Insoluble oxides can neutralise acid without being alkalis. Suitable metal cases give salt and hydrogen; oxides/hydroxides give salt and water; carbonates additionally give carbon dioxide. Salt identities depend on the acid-derived ion and the other reactant's cation. H+ and OH− form water while spectator ions remain separate. Reactive excess, not complete-solution electrical charge or equal volume, determines the supplied mixture classification. Exact pH and gas identity need suitable evidence, not warming or bubbles alone. Detailed salt preparation, pH and titration require their own lessons.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "making-soluble-salts")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "acids-and-neutralisation",
    journey: solubleSaltsJourney,
    goal: "Choose a soluble-salt preparation method and explain pure, dry crystal recovery.",
    concept:
      "Use supplied solubility and salt identity to choose reactants. Excess insoluble oxide consumes acid under adequate reaction conditions; filter off its excess before concentrating the salt solution. Controlled heating removes some solvent, then cooling and crystallisation allow crystals to form. Recover and gently dry crystals; some dissolved salt remains in mother liquor. Filtration does not remove dissolved acid or alkali. Soluble reactants need suitable measured reacting proportions; full titration technique is taught separately. Simulated practical reasoning does not certify laboratory skills.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "electrolysis")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "ionic-structures",
    journey: electrolysisJourney,
    goal: "Track mobile ions, predict neutral molten products and explain aluminium extraction.",
    concept:
      "An external direct-current supply drives electrolytic decomposition. Mobile ions carry charge through molten ionic salts and ionic solutions; delocalised electrons carry charge through metal wires and graphite. Cations migrate to the negative cathode and anions to the positive anode, regardless of page side. Binary molten ionic compounds with inert electrodes give neutral metal at cathode and neutral non-metal at anode, without water-derived hydrogen. Aluminium oxide dissolved in molten cryolite operates at lower temperature but still needs heating and current. Oxygen product consumes carbon anodes, which need replacement. Aqueous competition and Higher half equations require their own lessons.",
  },
);

lessons.splice(
  lessons.findIndex((l) => l.slug === "aqueous-electrolysis"),
  0,
  {
    slug: "aqueous-electrolysis-products",
    title: "Aqueous electrolysis",
    topic: "chemical-changes",
    tier: "foundation",
    course: "combined",
    model: "electrolysis",
    prerequisite: "electrolysis",
    goal: "Predict water competition and electrode-dependent products, then evaluate practical and gas-volume evidence.",
    questions: [],
    checks: [],
    journey: aqueousProductsJourney,
    concept:
      "Water introduces competing species in aqueous electrolysis. In standard GCSE inert-electrode cases a metal below hydrogen deposits at cathode; a metal above hydrogen gives hydrogen. Stated halide cases give a neutral halogen at anode, otherwise oxygen forms in the supplied sulfate/nitrate cases. Electrode material matters: copper anodes dissolve and replenish copper ions under matched transfer, while inert anodes produce oxygen without supplying copper. A rising gas-volume graph can show positive correlation without direct proportion; direct proportion requires a straight line through the origin. Read the printed direction of inverted gas-cylinder scales. Diagnostic gas tests and controlled comparisons support practical hypotheses; bubbles alone do not identify gases. Half equations are taught separately at Higher.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "aqueous-electrolysis")!,
  {
    title: "Half equations and redox",
    tier: "higher",
    course: "combined",
    prerequisite: "aqueous-electrolysis-products",
    journey: halfEquationsJourney,
    goal: "Write electron-transfer equations that conserve atoms and charge, and explain ionic redox.",
    concept:
      "Oxidation is electron loss and reduction is electron gain. Keep nuclear identity, species formulas and ionic charges fixed while balancing coefficients. Half equations retain each element and total signed charge, including −1 per electron. Electrons are gained at the cathode and released at the anode. Hydroxide oxidation produces oxygen and water; the hydrogen atoms do not disappear. Balanced positive multiples are valid unless smallest integers are explicitly required. Net ionic displacement and the specified metal/acid equations retain reactive species while omitting unchanged spectator ions. Foundation aqueous product prediction is taught in the preceding lesson.",
  },
);

lessons.splice(
  lessons.findIndex((l) => l.slug === "ph-and-strong-acids"),
  0,
  {
    slug: "ph-scale-and-indicators",
    title: "pH and indicators",
    topic: "chemical-changes",
    tier: "foundation",
    course: "combined",
    model: "ph",
    prerequisite: "acids-and-neutralisation",
    journey: phJourney,
    questions: [],
    checks: [],
    goal: "Read pH, use named indicators and interpret neutralisation and measurement evidence.",
    concept:
      "At the stated 25 °C, acidic pH is below 7, neutral pH is 7 and alkaline pH is above 7. Compare universal-indicator colour with its supplied chart for an approximate pH. Litmus, methyl orange and phenolphthalein have different responses and transition intervals; colourless phenolphthalein does not prove neutrality. A probe gives a supplied numerical reading, but accuracy needs reference evidence rather than many digits alone. Hydrogen and hydroxide ions react to make water; further alkali after the neutral point can remain in excess. Original supplied curves and tables support practical interpretation, not laboratory certification. Higher ionisation and tenfold comparisons are taught separately.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "ph-and-strong-acids")!,
  {
    journey: acidStrengthJourney,
    prerequisite: "ph-scale-and-indicators",
    goal: "Separate acid strength from concentration, apply tenfold pH comparisons and evaluate controlled evidence.",
    concept:
      "Strong acids ionise completely in aqueous solution; weak acids partly ionise. Concentration is dissolved acid amount per unit solution volume, a separate property. HCl can be strong and dilute. Each whole-unit pH decrease multiplies hydrogen-ion concentration by ten; increases divide it by ten. Compare the pH difference rather than the ratio of pH numbers. Specified fully ionised monoprotic HCl dilution conserves acid amount while increasing volume and pH, without turning it into a weak acid. A weak acid's ionised fraction can change on dilution. Unknown acid concentrations prevent inferring strength from pH alone. The selected hydrated proton-transfer reference retains five atomic identities and total charge zero without calculating pH from particle counts.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "titration-practical")!,
  {
    journey: titrationTechniqueJourney,
    prerequisite: "ph-scale-and-indicators",
    goal: "Read burette delivery, select repeat titres and explain reliable endpoint measurement and practical errors.",
    concept:
      "A pipette measures a fixed accurate aliquot; a burette measures variable delivery from final minus initial readings. Read the bottom of a concave meniscus at eye level with the scale increasing downwards. A rough trial locates the approximate endpoint; careful repeats are selected using the stated protocol, not a universal concordance threshold. Close agreement shows repeatability without proving accuracy. Dropwise addition, swirling and a suitable indicator help control the specified endpoint, which is not universally exactly pH 7. Apparatus rinsing, air bubbles, unrecorded inputs and overshoot have different error mechanisms. For a fresh pure salt solution, establish the reacting ratio with indicator and repeat without indicator.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "half-equations")!,
  {
    title: "Displacement and ionic equations",
    goal: "Scale whole half-equations, cancel unchanged species and evaluate conservation and supplied feasibility.",
    prerequisite: "aqueous-electrolysis",
    journey: displacementJourney,
    concept:
      "Scale all terms in each half-equation to equalise electron loss and gain before adding and cancelling. Cancel only identical species with the same formula, charge and state; physical spectator ions remain present. Check each element and total signed charge independently: matching nonzero charges are valid. Use supplied reactivity and conditions to judge occurrence; balance alone does not prove a reaction occurs.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "exothermic-and-endothermic")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "states-of-matter",
    journey: energyJourney,
    goal: "Explain conserved energy transfer, use temperature evidence and evaluate supplied applications.",
    concept:
      "Exothermic reactions transfer energy to surroundings; endothermic reactions take it in. Energy is conserved. Use pre-mixing and reaction-stage readings for temperature change; later exchange with the room does not reverse the completed reaction classification. Signed temperature change and positive decrease size are distinct. External heating, unequal starting temperatures and no detectable change can leave classification unestablished. Apply every supplied use constraint, and distinguish an energy process from proof of new substances.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "reaction-profiles")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "exothermic-and-endothermic",
    journey: profileJourney,
    goal: "Construct labelled curved energy profiles, separate activation and overall change, and draw a lower-barrier alternative.",
    concept:
      "A simple profile plots energy against reaction progress, not time. Reactants and products have separate plateaus; a curved peak above both represents the starting barrier. Forward activation is peak minus reactants, while overall change compares products with reactants. Products below reactants show exothermic transfer, above show endothermic transfer. A catalyst provides a lower-barrier alternative with the same endpoint energies. Construct and label your own levels and arrows; preserve incorrect proposals for correction.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "bond-energy")!,
  {
    tier: "higher",
    course: "combined",
    prerequisite: "reaction-profiles",
    journey: bondEnergyJourney,
    goal: "Count displayed bonds, build signed energy ledgers, solve unknown values and explain the limits of an estimate.",
    concept:
      "Breaking bonds requires energy; forming bonds releases energy. Apply balanced-equation coefficients to every distinct bond connection, using the supplied single, double or triple entry. Overall change is breaking input minus formation release: negative exothermic, positive endothermic. State the reaction basis, solve unknown values with their multiplicity and cancel only equal entries on both sides. Mean gas-phase values give an approximate estimate; this accounting route does not establish the actual mechanism or activation barrier.",
  },
);

Object.assign(
  lessons.find((l) => l.slug === "energy-practical")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "exothermic-and-endothermic",
    journey: practicalJourney,
    goal: "Plan a fair temperature-change investigation and interpret measured responses, repeats and fitted graphs.",
    concept:
      "Match the measurements and controls to the stated investigation. Record a pre-mixing baseline and reaction-stage maximum or minimum. Use repeated data, matching graph differences and evidence about heat exchange; fitted estimates differ from measured observations, and temperature is not energy in joules.",
  },
);
const practicalLegacyAliases = [
  "legacy-insulation",
  "plan-model-demand",
  "practical-evidence-model-demand",
  "practical-evidence-model-demand",
  "legacy-peak-21-29.5",
  "practical-evidence-model-demand",
];
for (const q of [
  ...lessons.find((l) => l.slug === "energy-practical")!.questions,
  ...lessons.find((l) => l.slug === "energy-practical")!.checks,
])
  q.exposureAliases = [
    ...(q.exposureAliases ?? []),
    "energy-practical:" +
      practicalLegacyAliases[Number(q.id.split("-").at(-1))],
  ];
import { cellsJourney } from "./journeys/cells-and-fuel-cells";

Object.assign(
  lessons.find((l) => l.slug === "cells-and-fuel-cells")!,
  {
    tier: "foundation",
    course: "separate",
    prerequisite: "metal-reactivity",
    journey: cellsJourney,
    goal: "Construct and interpret chemical cells, calculate series voltages and evaluate hydrogen fuel cells using supplied evidence.",
    concept:
      "Chemical reactions can supply potential difference. Use different metals and an electrolyte in the stated simple-cell comparison; specific voltages are supplied measurements. Series cells add potential differences with matching polarity. Rechargeable cells reverse reactions using external electrical energy; hydrogen fuel cells require hydrogen and oxygen feeds and form water. Compare suitability and lifecycle effects using the stated use and evidence.",
  },
);

lessons.splice(
  lessons.findIndex((l) => l.slug === "cells-and-fuel-cells") + 1,
  0,
  {
    slug: "fuel-cell-half-equations",
    topic: "energy",
    title: "Fuel-cell half equations",
    goal: "Construct the supplied acidic electrode reactions, conserve atoms and charge, and combine half equations.",
    tier: "higher",
    course: "separate",
    model: "predict",
    concept:
      "In the supplied acidic fuel cell, hydrogen is oxidised at the negative anode: H₂ → 2H⁺ + 2e⁻. Oxygen is reduced at the positive cathode: O₂ + 4H⁺ + 4e⁻ → 2H₂O. Match electron counts by scaling every term, add the reactions and cancel equal opposite-side H⁺ and electrons. Electrons travel through the external circuit; H⁺ carries charge through this supplied electrolyte.",
    questions: [],
    checks: [],
    prerequisite: "cells-and-fuel-cells",
    journey: fuelHalfJourney,
  },
);

lessons.splice(
  lessons.findIndex((l) => l.slug === "fuel-cell-half-equations") + 1,
  0,
  {
    slug: "interpreting-cell-voltages",
    topic: "energy",
    title: "Interpreting cell voltages",
    goal: "Read signed cell comparisons, reconnect meter leads and infer missing readings from a common reference.",
    tier: "higher",
    course: "separate",
    model: "predict",
    concept:
      "Use the supplied metal1/metal2 sign convention and investigation conditions. Reversing meter leads changes the sign; chemical discharge remains unchanged. Infer V(A,B) by subtracting V(B,R) from V(A,R) with matching reference roles and conditions. A missing observation is not zero.",
    questions: [],
    checks: [],
    prerequisite: "cells-and-fuel-cells",
    journey: voltageJourney,
  },
);

Object.assign(
  lessons.find((l) => l.slug === "measuring-rates")!,
  {
    journey: ratesJourney,
    prerequisite: "measurement-uncertainty",
    goal: "Calculate actual interval means, interpret measurement boundaries and construct supported rate graphs.",
    concept:
      "Use the quantity changed over actual elapsed time. Positive reactant consumption differs from a negative remaining-amount slope. Preserve observed points while drawing a separately justified fit. Distinguish interval mean, tangent at a moment, indirect signal and final product amount; qualify measurement conditions and units.",
  },
);

lessons.splice(lessons.findIndex((l) => l.slug === "measuring-rates") + 1, 0, {
  slug: "rates-from-tangents",
  topic: "rates",
  title: "Rates from tangents",
  goal: "Construct a local tangent, read a gradient triangle and convert chemical amounts or calibrated signals to mol/s.",
  tier: "higher",
  course: "combined",
  model: "predict",
  concept:
    "A tangent follows the local direction of a quantity-time curve at the requested moment. Divide matching coordinate differences, converting elapsed time to seconds. A negative remaining-amount slope corresponds to positive consumption. Use an explicitly supplied amount conversion or signal-to-amount calibration before giving mol/s; graph height or an uncalibrated signal is not a chemical rate.",
  questions: [],
  checks: [],
  prerequisite: "measuring-rates",
  journey: tangentJourney,
});
// Global exposure links for shared prior teaching. The lookup is deliberately one hop.
for (const group of [
  [
    "cf-v1-warm-oxygen",
    "cf-v1-r-equation",
    "cf-v1-g-reaction",
    "cf-v1-p-double",
    "cf-v1-p-triple",
    "cf-v1-A-water",
    "cf-v1-B-oxygen",
    "cf-v1-S-balance",
    "fh-v1-p-overall",
    "fh-v1-g-combine",
    "fh-v1-p-derive",
    "fh-v1-R-combine",
  ],
  [
    "cf-v1-r-carriers",
    "cf-v1-p-carriers",
    "he-v1-r-direction",
    "he-v1-p-carriers",
    "fh-v1-r-path",
    "fh-v1-g-route",
    "fh-v1-p-proton-route",
    "fh-v1-p-explain-path",
    "fh-v1-A-path",
  ],
  [
    "cf-v1-p-identical",
    "cv-v1-r-zero",
    "cv-v1-p-identical-swap",
    "cv-v1-p-equal-reference",
    "cv-v1-p-identical-scope",
  ],
  [
    "measuring-rates-0",
    "measuring-rates-3",
    "measuring-rates-4",
    "rr-v1-r-rate",
    "rr-v1-g-interval",
    "rr-v1-p-whole",
    "rr-v1-p-late",
    "rr-v1-A-interval",
    "rr-v1-R-interval",
  ],
  [
    "measuring-rates-1",
    "measuring-rates-2",
    "rr-v1-r-slope",
    "rr-v1-g-trend",
    "rr-v1-p-trend-light",
  ],
  [
    "measuring-rates-5",
    "rr-v1-r-tangent",
    "rr-v1-p-draw-tangent",
    "rr-v1-R-tangent",
  ],
  [
    "mc-v1-r-boundary",
    "mc-v1-p-open",
    "mc-v1-p-closed",
    "mc-v1-cb-inference",
    "rr-v1-r-boundary",
    "rr-v1-g-mass",
    "rr-v1-g-evidence",
    "rr-v1-p-sealed",
    "rr-v1-p-retained-products",
    "rr-v1-p-explain-boundary",
    "rr-v1-B-explain",
  ],
  ["he-v1-w-atoms", "fh-v1-r-atoms"],
  ["he-v1-w-charge", "fh-v1-r-charge", "fh-v1-R-charge"],
]) {
  const all = lessons.flatMap((l) => [
    ...l.questions,
    ...l.checks,
    ...(l.journey ? tasks(l.journey) : []),
  ]);
  const members = all.filter((q) => group.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

const tangentTasks = tasks(tangentJourney);
const priorRates = tasks(ratesJourney);
for (const [newModes, priorIds] of [
  [
    ["construct", "gradient", "evidence"],
    [
      "measuring-rates-0",
      "measuring-rates-1",
      "measuring-rates-2",
      "measuring-rates-3",
      "measuring-rates-4",
      "measuring-rates-5",
      "rr-v1-r-rate",
      "rr-v1-r-slope",
      "rr-v1-r-consumed",
      "rr-v1-r-tangent",
      "rr-v1-g-interval",
      "rr-v1-g-trend",
      "rr-v1-p-draw-tangent",
      "rr-v1-R-tangent",
    ],
  ],
  [
    ["moles"],
    [
      "rr-v1-r-rate",
      "rr-v1-r-time",
      "rr-v1-r-consumed",
      "rr-v1-g-interval",
      "rr-v1-p-consumption",
      "rr-v1-A-interval",
      "rr-v1-B-consumption",
    ],
  ],
  [
    ["calibration", "evidence"],
    [
      "rr-v1-r-signal",
      "rr-v1-g-evidence",
      "rr-v1-p-sensor-calibration",
      "rr-v1-p-explain-signal",
      "rr-v1-A-signal",
      "rr-v1-S-signal",
    ],
  ],
] as [string[], string[]][]) {
  const seeds = tangentTasks.filter(
    (q) => q.model?.kind === "tangent-rates" && newModes.includes(q.model.mode),
  );
  const newIds = new Set(
    seeds.flatMap((q) => [q.id, ...(q.exposureAliases ?? [])]),
  );
  const members = [
    ...tangentTasks,
    ...priorRates,
    ...lessons.find((l) => l.slug === "measuring-rates")!.questions,
    ...lessons.find((l) => l.slug === "measuring-rates")!.checks,
  ].filter((q) => newIds.has(q.id) || priorIds.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "collision-theory")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "measuring-rates",
    journey: collisionJourney,
    goal: "Predict reacting collisions, compare particle density and accessible solid surfaces, and explain controlled rate changes.",
    concept:
      "Reacting particles must collide with sufficient energy; activation energy is the minimum required. Suitable molecular orientation matters in the explicitly stated molecular examples. More reacting particles per actual occupied volume, fixed-temperature gas compression and greater accessible solid surface increase collision opportunities in controlled comparisons. Fixed temperature does not increase average particle kinetic energy. Splitting conserves material amount; touching internal faces are inaccessible under the stated assumption. Expected rate direction is distinct from an exact rate factor and from final available product.",
  },
);
const collisionTasks = tasks(collisionJourney);
for (const [modes, priorIds] of [
  [["conditions"], ["collision-theory-3"]],
  [["solution"], ["collision-theory-0", "sc-v1-r-basis", "sc-v1-g-unit"]],
  [["gas"], ["collision-theory-2"]],
  [["surface"], ["collision-theory-1", "collision-theory-5"]],
  [
    ["comparison"],
    [
      "rr-v1-r-rate",
      "rr-v1-g-interval",
      "measuring-rates-0",
      "measuring-rates-1",
      "measuring-rates-4",
    ],
  ],
  [["evidence"], ["collision-theory-4", "rr-v1-g-trend"]],
] as [string[], string[]][]) {
  const seeds = collisionTasks.filter(
    (q) => q.model?.kind === "collision-theory" && modes.includes(q.model.mode),
  );
  const ids = new Set(
    seeds.flatMap((q) => [q.id, ...(q.exposureAliases ?? [])]),
  );
  const pool = lessons.flatMap((l) => [
    ...l.questions,
    ...l.checks,
    ...(l.journey ? tasks(l.journey) : []),
  ]);
  const members = pool.filter((q) => ids.has(q.id) || priorIds.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "temperature-and-catalysts")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "collision-theory",
    journey: temperatureJourney,
    goal: "Distinguish thermal energy changes from a lower-barrier catalytic pathway, construct profiles and evaluate controlled evidence.",
    concept:
      "Higher temperature raises average particle kinetic energy, collision frequency and the sufficiently energetic fraction under suitable controlled conditions. A catalyst provides a different pathway with lower activation energy at unchanged temperature and is regenerated overall. It preserves the same reactant/product energy levels and overall reaction energy change. Different reactions need suitable catalysts; enzymes are biological catalysts. Same fixed reactants undergoing the same complete reaction have the same available final product amount, even when completion is faster. Controlled rate comparisons and chemical identity evidence are needed; unchanged mass alone is insufficient.",
  },
);
for (const [family, priorIds] of [
  [
    "heat",
    [
      "temperature-and-catalysts-0",
      "temperature-and-catalysts-4",
      "ct-v1-p-cooling",
      "ct-v1-refresh-cooling",
    ],
  ],
  ["catalyst", ["temperature-and-catalysts-1"]],
  ["profile", ["temperature-and-catalysts-5"]],
  ["identity", ["temperature-and-catalysts-2"]],
  ["rate", ["temperature-and-catalysts-3", "rr-v1-r-rate", "rr-v1-g-interval"]],
] as [string, string[]][]) {
  const ids = new Set(
    temperatureExposureFamilies[family].map((id) => "tc-v1-" + id),
  );
  const pool = lessons.flatMap((l) => [
    ...l.questions,
    ...l.checks,
    ...(l.journey ? tasks(l.journey) : []),
  ]);
  const members = pool.filter((q) => ids.has(q.id) || priorIds.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "reversible-reactions")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "temperature-and-catalysts",
    journey: reversibleJourney,
    goal: "Interpret reversible changes and their energy transfers, and distinguish continuing equal rates from constant or equal amounts.",
    concept:
      "Products of a reversible reaction can react to regenerate the displayed reactants. Exactly reversed chemical changes transfer equal energy magnitudes with opposite signs for the same reacting amount. At fixed conditions a closed reacting system reaches dynamic equilibrium when both reactions continue at equal rates; concentrations remain constant but need not be equal. A flat trace alone does not establish continuing reactions, and external flow can maintain a steady inventory. At fixed conditions a catalyst accelerates both directions without changing the equilibrium position.",
  },
);
for (const [family, priorIds] of [
  ["direction", ["reversible-reactions-2"]],
  ["energy", ["tc-v1-p-signed-change", "re-v1-w-energy"]],
  [
    "dynamic",
    [
      "reversible-reactions-0",
      "reversible-reactions-1",
      "reversible-reactions-4",
    ],
  ],
  ["boundary", ["reversible-reactions-0", "reversible-reactions-3"]],
  [
    "catalyst",
    ["reversible-reactions-5", "tc-v1-p-catalyst-written", "tc-v1-r-pathway"],
  ],
  ["traces", []],
  ["appearance", []],
] as [string, string[]][]) {
  const ids = new Set(
    reversibleExposureFamilies[family].map((id) => "re-v1-" + id),
  );
  const pool = lessons.flatMap((l) => [
    ...l.questions,
    ...l.checks,
    ...(l.journey ? tasks(l.journey) : []),
  ]);
  const members = pool.filter((q) => ids.has(q.id) || priorIds.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "changing-equilibrium")!,
  {
    tier: "higher",
    course: "combined",
    prerequisite: "reversible-reactions",
    journey: equilibriumShiftJourney,
    goal: "Predict qualitative equilibrium changes using phase symbols, gas coefficients and supplied energy directions; distinguish immediate changes, later responses and reaction speed.",
    concept:
      "An equilibrium responds to a changed condition in a direction that counteracts it. At fixed temperature, compression favours fewer gaseous molecules and expansion favours more; equal gaseous coefficients give no position shift. Heating favours endothermic and cooling exothermic. Adding reactant or removing product favours net forward reaction; the opposite edits favour reverse. The later response need not restore the original amount or pressure. Catalysts change approach rates but not equilibrium position at fixed conditions. Opposing simultaneous effects need additional information to determine an overall yield change.",
  },
);
for (const [family, priorIds] of [
  ["gas", ["changing-equilibrium-0", "changing-equilibrium-4"]],
  [
    "energy",
    ["changing-equilibrium-1", "changing-equilibrium-5", "re-v1-w-energy"],
  ],
  ["concentration", ["changing-equilibrium-2", "changing-equilibrium-3"]],
  ["combined", []],
  ["evidence", []],
  [
    "catalyst",
    [
      "re-v1-p-catalyst",
      "re-v1-r-catalyst",
      "re-v1-p-evidence-catalyst",
      "tc-v1-p-catalyst-written",
      "tc-v1-r-pathway",
    ],
  ],
] as [string, string[]][]) {
  const ids = new Set(
    equilibriumShiftExposureFamilies[family].map((id) => "es-v1-" + id),
  );
  const pool = lessons.flatMap((l) => [
    ...l.questions,
    ...l.checks,
    ...(l.journey ? tasks(l.journey) : []),
  ]);
  const members = pool.filter((q) => ids.has(q.id) || priorIds.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "rates-practical")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "measuring-reaction-rates",
    journey: ratesPracticalJourney,
    goal: "Construct a fair rate investigation, read apparatus, prepare a controlled dilution, plot original observations and justify treatment of endpoints and repeated results.",
    concept:
      "A concentration investigation controls other relevant reaction and observation conditions. Gas-volume methods capture gas; mass-loss methods allow gas to escape. Fixed premix volume helps keep liquid depth comparable, and concentration labels distinguish before and after adding acid. Optical endpoint time and its reciprocal are comparative evidence for a consistent method. Original observations remain visible alongside a justified fit; suspect results are investigated and documented invalid trials or identified anomalies can be excluded transparently from a declared mean. Repeats assess variation but cannot remove a common systematic fault.",
  },
);
for (const [family, priorIds] of [
  ["plan", ["rates-practical-0", "rates-practical-1"]],
  ["apparatus", ["rates-practical-2"]],
  ["dilution", []],
  ["endpoint", ["rates-practical-5"]],
  ["plot", ["rates-practical-4"]],
  ["repeats", ["rates-practical-3"]],
] as [string, string[]][]) {
  const ids = new Set(
    ratesPracticalExposureFamilies[family].map((id) => "rp-v1-" + id),
  );
  const pool = lessons.flatMap((l) => [
    ...l.questions,
    ...l.checks,
    ...(l.journey ? tasks(l.journey) : []),
  ]);
  const members = pool.filter((q) => ids.has(q.id) || priorIds.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "crude-oil-and-fractions")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "states-of-matter",
    journey: crudeOilJourney,
    goal: "Explain fractional distillation using changes of state and supplied boiling ranges, construct hydrocarbon property trends and compare useful fractions from original yield evidence.",
    concept:
      "Crude oil is a finite mixture, mostly hydrocarbons containing only carbon and hydrogen. Heating and a cooler-upwards column separate useful fractions by vaporisation and condensation, while preserving molecules; fractions can still be mixtures, with residue and top-gas exceptions. Comparable larger hydrocarbons generally have higher boiling points and viscosity and are less easy to ignite. Named fractions have suitable fuel/material uses and petrochemical feedstock can be processed into useful products. Supplied percentage-by-mass data supports source comparisons under a stated criterion; unequal feeds require absolute-yield calculations.",
  },
);
for (const [family, priorIds] of [
  ["inventory", ["crude-oil-and-fractions-0", "crude-oil-and-fractions-4"]],
  ["column", ["crude-oil-and-fractions-1", "crude-oil-and-fractions-5"]],
  ["trace", []],
  ["trends", ["crude-oil-and-fractions-2", "crude-oil-and-fractions-3"]],
  ["uses", []],
  ["yield", []],
] as [string, string[]][]) {
  const ids = new Set(oilExposureFamilies[family].map((id) => "oil-v1-" + id)),
    pool = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ]),
    members = pool.filter((q) => ids.has(q.id) || priorIds.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "alkanes-and-combustion")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "covalent-bonding",
    journey: alkanesJourney,
    goal: "Construct and interpret alkane structures, apply the homologous-series formula and justify combustion balances and evidence.",
    concept:
      "Alkanes are saturated open-chain hydrocarbons with general formula CₙH₂ₙ₊₂. Recall methane, ethane, propane and butane and inspect every bond. Complete combustion forms CO₂ and H₂O and releases energy; balance intact formulas using coefficients. Limited oxygen can lead to CO and soot alongside other products. Atom-balanced teaching allocations do not predict a unique real exhaust. Positive incomplete-product evidence differs from an unreported measurement; CO is toxic, colourless and odourless.",
  },
);
for (const [family, priorIds] of [
  ["formula", ["alkanes-and-combustion-0", "alkanes-and-combustion-4"]],
  ["saturation", ["alkanes-and-combustion-1"]],
  ["products", ["alkanes-and-combustion-2"]],
  ["co", ["alkanes-and-combustion-3"]],
  ["limited", ["alkanes-and-combustion-5"]],
] as [string, string[]][]) {
  const ids = new Set(
      alkaneExposureFamilies[family].map((id) => "alk-v1-" + id),
    ),
    pool = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ]),
    members = pool.filter((q) => ids.has(q.id) || priorIds.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

// Explicit direct edges for actual overlapping demands already taught elsewhere.
// No alias traversal: these pairs do not inherit either endpoint’s neighbours.
for (const ids of [
  [
    "cb-v1-p-methane",
    "cb-v1-g-methane",
    "alk-v1-g-kit",
    "alk-v1-p-draw-methane",
  ],
  [
    "cb-v1-cb-formula",
    "alk-v1-g-kit",
    "alk-v1-p-methane-name",
    "alk-v1-p-draw-methane",
  ],
  [
    "be-v1-g-molecules",
    "be-v1-p-methane",
    "alk-v1-g-equation",
    "alk-v1-p-multiple",
  ],
  ["be-v1-p-ethane", "bm-v1-p-ethane", "alk-v1-p-ethane-oxygen"],
  ["heat-v1-p-combustion", "alk-v1-r-energy"],
]) {
  const pool = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ]),
    members = pool.filter((q) => ids.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "cracking-and-alkenes")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "alkanes-and-combustion",
    journey: crackingJourney,
    goal: "Interpret and construct alkene bonds, conserve cracking atoms and justify conditions, uses and actual bromine evidence.",
    concept:
      "Cracking rearranges covalent bonds in longer hydrocarbons to form smaller products, commonly useful fuels and alkene chemical starting materials. General routes use high temperature with a catalyst or steam. Alkenes contain C=C; the open-chain one-double-bond series is CₙH₂ₙ. A supplied ring may share that formula without C=C. Balance given equations by conserving C and H, including repeated product molecules. In the ordinary successful test, initially orange bromine water becomes colourless with an alkene. A positive mixture result supports unsaturation present, not purity or a unique formula.",
  },
);
for (const [family, priorIds] of [
  ["atoms", ["cracking-and-alkenes-0"]],
  ["series", ["cracking-and-alkenes-1"]],
  ["bromine", ["cracking-and-alkenes-2"]],
  ["formula", ["cracking-and-alkenes-3"]],
  ["saturation", ["cracking-and-alkenes-4"]],
  ["purpose", ["cracking-and-alkenes-5"]],
] as [string, string[]][]) {
  const ids = new Set(
      crackingExposureFamilies[family].map((id) => "crk-v1-" + id),
    ),
    pool = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ]),
    members = pool.filter((q) => ids.has(q.id) || priorIds.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}
// Direct links connect the actual overlapping demands; no transitive closure.
for (const ids of [
  [
    "alk-v1-r-saturation",
    "alk-v1-p-double",
    "crk-v1-r-saturation",
    "crk-v1-p-saturation",
  ],
  ["alk-v1-p-ring", "crk-v1-r-ring", "crk-v1-p-ring", "crk-v1-a-ring"],
  ["alk-v1-p-multiple", "crk-v1-r-scale", "crk-v1-p-multiple"],
  ["oil-v1-p-identity", "crk-v1-r-separate", "crk-v1-p-distil"],
]) {
  const pool = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ]),
    members = pool.filter((q) => ids.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "alcohols-and-acids")!,
  {
    tier: "foundation",
    course: "separate",
    prerequisite: "cracking-and-alkenes",
    journey: alcoholJourney,
    goal: "Construct alcohol/acid bonds, reason from actual reaction evidence and evaluate fermentation and fuel measurements.",
    concept:
      "Alcohols contain a covalent C–O–H group; carboxylic acids contain the whole C(=O)–O–H group whose carbon counts in the chain. Learn the first four names and full structures. Alcohols react with sodium to produce hydrogen, burn completely to CO₂/water, and can be oxidised to corresponding acids. Smaller alcohols mix readily with water; longer-chain solubility is more limited. Acids react with carbonates to produce salt/water/CO₂ and with alcohols to form esters/water; the required named example here is ethyl ethanoate. Yeast enzymes ferment aqueous glucose under suitable warm anaerobic conditions, producing ethanol in solution and CO₂. Later fractional distillation physically enriches ethanol. Calculate actual consumed fuel mass and temperature differences before a matched per-gram comparison; °C/g is not automatically kJ/g. Higher extension: weak acid partial ionisation differs from dilution.",
  },
);
for (const [family, prior] of [
  ["alcoholStructure", ["alcohols-and-acids-0"]],
  ["acidStructure", ["alcohols-and-acids-1"]],
  ["oxidation", ["alcohols-and-acids-2"]],
  ["carbonate", ["alcohols-and-acids-3"]],
  ["combustion", ["alcohols-and-acids-4"]],
  ["higherStrength", ["alcohols-and-acids-5"]],
] as [string, string[]][]) {
  const ids = new Set(
      alcoholExposureFamilies[family].map((id) => "alc-v1-" + id),
    ),
    pool = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ]),
    members = pool.filter((q) => ids.has(q.id) || prior.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}
// Actual overlapping demands only: deliberately no transitive expansion.
for (const ids of [
  ["alk-v1-p-multiple", "alc-v1-p-multiple"],
  ["oil-v1-p-identity", "alc-v1-r-stage", "alc-v1-p-distil", "alc-v1-b-stage"],
  ["acid-v1-r-ionisation", "alc-v1-r-weak", "alc-v1-p-higher-pH"],
  ["acid-v1-p-equal-ph", "alc-v1-p-higher-pH"],
]) {
  const pool = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ]),
    members = pool.filter((q) => ids.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "polymers")!,
  {
    tier: "foundation",
    course: "separate",
    prerequisite: "alcohols-and-acids",
    journey: polymerisationJourney,
    goal: "Construct addition repeats and recover monomers while preserving atoms; Higher extensions build polyester links and repeats.",
    concept:
      "Addition polymerisation joins many alkene monomers: the reacting C=C becomes a single backbone bond and each carbon gains one outward continuation bond. All original side groups remain attached to their original carbons; no small molecule is released. Polymer repeat brackets enclose the monomer-derived contribution, with continuing bonds crossing both brackets and lower-case n outside. Recover the separate alkene by restoring C=C and removing polymer notation. The drawn crop is not a full chain or a count of all polymer molecules. Higher: a diol and a dicarboxylic acid can form polyester links; acid OH and alcohol H form water while carbonyl O and alcohol-derived linking O remain. Each actual link in a stated finite open-chain diagram releases one water molecule. The conventional end-omitted repeat equation and a finite chain have different endpoint accounting. Earlier Polymer structures covers physical intermolecular forces; natural polymers and disposal follow in their own lessons.",
  },
);
for (const [family, legacy] of [
  ["etheneName", 0],
  ["addition", 1],
  ["monomers", 2],
  ["atomRetention", 3],
  ["properties", 4],
  ["chemicalChange", 5],
] as [string, number][]) {
  const ids = new Set([
    ...polymerisationExposureFamilies[family].map((id) => "pol-v1-" + id),
    "polymers-" + legacy,
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

// Direct overlapping demands only; no transitive exposure closure.
for (const ids of [
  ["ps-v1-g-repeat", "ps-v1-p-draw", "pol-v1-p-ethene"],
  ["ps-v1-p-n", "pol-v1-r-n", "pol-v1-p-n", "pol-v1-a-n", "pol-v1-ra-n"],
  ["ps-v1-p-crossing", "pol-v1-r-brackets", "pol-v1-p-end"],
  ["ps-v1-r-forces", "ps-v1-p-physical", "pol-v1-r-forces", "pol-v1-p-melt"],
  ["crk-v1-r-bromine", "crk-v1-g-bromine", "pol-v1-p-bromine"],
  [
    "alc-v1-r-ester",
    "alc-v1-p-ester",
    "alc-v1-b-ester",
    "pol-v1-r-water",
    "pol-v1-p-water",
  ],
]) {
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "organic-reactions")!,
  {
    tier: "foundation",
    course: "separate",
    prerequisite: "polymers",
    journey: pathwaysJourney,
    goal: "Construct complete alkene addition products; predict combustion products and distinguish conditions, atom inventories and organic-process routes.",
    concept:
      "An alkene C=C can become C–C during addition. Retain the whole original carbon chain and every original H: H2 adds one H at each original double-bond carbon; water adds H and OH; Cl2, Br2 or I2 supply one halogen atom at each site. A saturated alcohol or halogen-containing compound is not automatically an alkane hydrocarbon. Hydrogenation uses H2, nickel and suitable heating; industrial ethene hydration uses heated steam, pressure and phosphoric acid. Ordinary bromine-water decolourisation tests the alkene without requiring UV. Supplied structural iodine examples do not establish rates or colour observations. In hydration water is consumed; unused feed steam can physically condense in a cooler, while unreacted ethene can be recycled. Use a supplied observed conversion instead of assuming the feed maximum reacts. Primary ethanol can oxidise to ethanoic acid. Ethanoic acid and ethanol each supply carbon groups to ethyl ethanoate and form water. Glucose/yeast fermentation is a distinct ethanol route with CO2; many alkene monomers form addition polymers without a small by-product. Higher: a supplied diol and diacid can form polyester links with water eliminated. Alkenes also burn in oxygen. Complete combustion forms carbon dioxide and water; in air they tend to give smoky flames through incomplete combustion and carbon soot. This is a tendency, and smoky burning does not uniquely identify an alkene. Written/drawn explanations require self-review.",
  },
);
for (const [family, legacy] of [
  ["hydrogenAddition", 0],
  ["hydrationStructure", 1],
  ["bromineAddition", 2],
  ["esterCarbon", 3],
  ["higherCondensation", 4],
  ["esterCarbon", 5],
] as [string, number][]) {
  const ids = new Set([
    ...pathwaysExposureFamilies[family].map((id) => "path-v1-" + id),
    "organic-reactions-" + legacy,
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

// Direct, reviewed overlaps with earlier lessons; do not expand transitively.
for (const ids of [
  ["alk-v1-p-draw-ethane", "path-v1-g-hydrogen", "path-v1-p-ethene-h"],
  ["alk-v1-p-draw-propane", "path-v1-p-propene-h"],
  ["alk-v1-p-draw-butane", "path-v1-p-butene-h", "path-v1-p-internal-h"],
  ["alc-v1-p-ethanol", "path-v1-g-water", "path-v1-p-ethene-water"],
  [
    "alc-v1-r-oxidation",
    "alc-v1-p-oxidise",
    "alc-v1-b-oxidise",
    "path-v1-r-oxidation",
    "path-v1-p-oxidation-limit",
  ],
  [
    "alc-v1-r-ester",
    "alc-v1-p-ester",
    "alc-v1-b-ester",
    "path-v1-r-ester",
    "path-v1-g-ester",
    "path-v1-p-ester-explain",
    "path-v1-b-explain",
  ],
  [
    "alc-v1-r-ferment",
    "alc-v1-g-ferment",
    "alc-v1-p-ferment-plan",
    "path-v1-r-fermentation",
    "path-v1-g-ferment",
    "path-v1-p-routes-explain",
    "path-v1-a-feed",
    "path-v1-b-product",
  ],
  [
    "crk-v1-r-bromine",
    "crk-v1-g-bromine",
    "crk-v1-a-bromine",
    "crk-v1-b-bromine",
    "path-v1-r-bromine",
    "path-v1-g-evidence",
    "path-v1-p-bromine-test",
    "path-v1-d1-test",
  ],
  [
    "pol-v1-r-monomer",
    "path-v1-r-polymer",
    "path-v1-p-addition-polymer",
    "path-v1-d2-explain",
  ],
]) {
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.includes(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "natural-polymers")!,
  {
    tier: "foundation",
    course: "separate",
    prerequisite: "polymers",
    journey: naturalJourney,
    goal: "Identify complete natural-polymer contributions and DNA structure; Higher tasks construct amino-acid repeats and account for actual peptide junctions.",
    concept:
      "Proteins are polymers of amino acids; starch and cellulose use glucose-derived units; DNA uses nucleotides. Most DNA has two nucleotide chains wound as a double helix, with four possible nucleotide types and genetic instructions encoded in their sequence. A short excerpt may contain fewer than four types. One complete strand unit is one nucleotide; a whole two-sided rung contains two. Higher: amino acids have NH₂ and COOH groups; condensation removes acid OH and one amino H as water while retaining carbonyl C=O and making a C–N joining bond. A bracketed amino-acid contribution has bonds crossing both boundaries and n outside; it omits the chain ends. A stated finite open chain of n original monomers has n − 1 actual junctions and retains both terminal groups. Different amino acids can contribute to one chain, and identical atom totals do not imply identical order or connectivity.",
  },
);
// Preserve legacy identifiers and register direct repeated demands only.
for (const [family, legacy] of [
  ["proteinMonomer", 0],
  ["nucleotideUnit", 1],
  ["celluloseMonomer", 2],
] as [string, number][]) {
  const ids = new Set([
    ...naturalExposureFamilies[family].map((id) => "natural-v1-" + id),
    "natural-polymers-" + legacy,
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "purity-and-separation")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "states-of-matter",
    journey: purityJourney,
    goal: "Interpret purity evidence and choose physical separation for a stated target.",
    concept:
      "Chemical purity means one element or one compound without another substance mixed in; everyday pure can mean natural or unadulterated. Compare melting intervals and boiling temperatures with stated references and comparable conditions. Formulations are deliberately designed mixtures with measured ingredient proportions. Physical separation uses given properties without making new substances. Filtration retains insoluble grains; dissolved salt travels with water, though a damp residue can retain mother liquor. Collecting solvent requires vaporisation followed by condensation. Product recovery uses originally available product as its denominator; collected-sample product fraction includes water and contaminants in its denominator.",
  },
);
for (const [family, legacy] of [
  ["matchingReferenceInference", 0],
  ["solventCollection", 2],
  ["formulationDesign", 3],
  ["completeFilterSaltPath", 4],
  ["lowerWiderInference", 5],
] as [string, number][]) {
  const ids = new Set([
    ...purityExposureFamilies[family].map((id) => "purity-v1-" + id),
    "purity-and-separation-" + legacy,
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "chromatography")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "purity-and-separation",
    journey: chromatographyJourney,
    goal: "Diagnose chromatography arrangements, measure original records and evaluate reference evidence.",
    concept:
      "Chromatography separates soluble components because they distribute differently between a stationary phase and the moving solvent. Under otherwise comparable conditions, stronger stationary attraction means more time retained and smaller relative travel. Keep small starting samples above the reservoir while the paper contacts solvent; a soluble ink baseline can introduce extra material. Record the wet solvent front. Measure from the original origin to each spot centre and to the front, then divide matching-unit spot travel by front travel for dimensionless Rf. Rearrange for an unknown distance. Compare reference candidates under the same stationary phase, solvent and conditions. Several resolved uncontaminated spots support a mixture; one spot can conceal overlapping or undetected components. Changing dilute dye proportions alone does not change the supplied Rf. Written and drawn answers require honest self-review rather than automatic examiner marks.",
  },
);
// Direct legacy exposure links for repeated scientific conclusions. The two old
// numerical Rf records retain distinct givens and are not broad concept aliases.
for (const [legacy, suffixes] of [
  [0, chromatographyExposureFamilies.solubleOriginLine],
  [1, chromatographyExposureFamilies.sameImmersedSetup],
  [3, chromatographyExposureFamilies.sameThreeSpots],
  [
    5,
    [
      "r-reference-conditions",
      ...chromatographyExposureFamilies.sameDifferentPaperReference,
    ],
  ],
] as [number, string[]][]) {
  const ids = new Set([
    "chromatography-" + legacy,
    ...suffixes.map((s) => "chromatography-v1-" + s),
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "gas-tests")!,
  {
    tier: "foundation",
    course: "combined",
    prerequisite: "chromatography",
    journey: gasTestsJourney,
    goal: "Choose precise gas tests, interpret original observations and justify the limits of identification.",
    concept:
      "Hydrogen burns with a pop when a burning splint is held at the open end of a collected sample. Oxygen relights an initially glowing splint inserted into the gas; oxygen supports combustion and is not the splint's fuel. Carbon dioxide turns fresh limewater, aqueous calcium hydroxide, milky/cloudy; the gas may be shaken with it or bubbled through it. Chlorine bleaches damp litmus white; damp blue litmus may first turn red, but red alone does not uniquely identify chlorine. Keep method, recorded observation and warranted conclusion separate. Dry paper, a delivery outlet above liquid, water instead of limewater, cold wood, an escaped sample or an incomplete observation cannot establish the intended negative result or identify a replacement gas. A positive test for a component in a mixture establishes presence rather than purity. Written and labelled diagram responses require honest self-review. These are supplied school records, not instructions for unsupervised experiments.",
  },
);
// Preserve old IDs and directly link repeated facts, without transitive expansion.
for (const [legacy, suffixes] of [
  [0, gasExposureFamilies.hydrogenCore],
  [1, gasExposureFamilies.oxygenCore],
  [2, gasExposureFamilies.co2Result],
  [3, gasExposureFamilies.chlorineCore],
  [4, ["p-distinguish"]],
  [5, gasExposureFamilies.schoolSupervision],
] as [number, string[]][]) {
  const ids = new Set([
    "gas-tests-" + legacy,
    ...suffixes.map((s) => "gas-tests-v1-" + s),
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "ion-tests")!,
  {
    tier: "foundation",
    course: "separate",
    prerequisite: "gas-tests",
    journey: ionTestsJourney,
    goal: "Build precise ion-test chains, retain uncertain candidates and justify equations and compound identities.",
    concept:
      "AQA separate Chemistry: lithium gives a crimson flame, sodium yellow, potassium lilac, calcium orange-red and copper green. Mixture flame colours may be masked. Sodium hydroxide gives copper(II) blue, iron(II) green and iron(III) brown precipitates. Aluminium, calcium and magnesium give white precipitates; only aluminium's dissolves in excess among this set. Calcium versus magnesium remains unresolved by that test alone. Carbonates with dilute acid evolve carbon dioxide confirmed with limewater. Halides use dilute nitric acid then silver nitrate: chloride white, bromide cream, iodide yellow. Sulfate uses dilute hydrochloric acid then barium chloride: white precipitate. Use separate fresh portions; previous reagents and unsuitable acids can introduce the ion being tested. Balance hydroxide formation equations with fixed species, conserved atoms and charge. Combine both ion identities before naming a supplied single compound; presence does not establish mixture purity. These are school-record interpretation and original tasks; practical competence still requires supervised practical work. Extended responses are self-reviewed, without automatic examiner marks.",
  },
);
for (const [legacy, suffixes] of [
  [0, ionExposureFamilies.sodium],
  [1, ionExposureFamilies.potassium],
  [2, ionExposureFamilies.copperColours],
  [3, ionExposureFamilies.sulfate],
  [4, ionExposureFamilies.chloride],
  [5, ionExposureFamilies.carbonate],
] as [number, string[]][]) {
  const ids = new Set([
    "ion-tests-" + legacy,
    ...suffixes.map((s) => "ion-tests-v1-" + s),
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

// This warm-up repeats the earlier gas-result fact. Link that exact demand
// directly; do not transitively equate whole carbonate investigations with it.
{
  const ids = new Set([
    "ion-tests-v1-w-co2",
    "gas-tests-2",
    ...gasExposureFamilies.co2Result.map((s) => "gas-tests-v1-" + s),
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

// The calcium-chloride charge/formula demand also occurs in ionic formulae.
{
  const ids = new Set([
    "if-v1-p-halide",
    ...ionExposureFamilies.calciumFormula.map((s) => "ion-tests-v1-" + s),
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "instrumental-analysis")!,
  {
    journey: instrumentalJourney,
    tier: "foundation",
    course: "separate",
    prerequisite: "ion-tests",
    goal: "Interpret supplied emission spectra and standards to distinguish metal-ion identity from concentration.",
    concept:
      "Flame emission spectroscopy puts a solution sample into a flame and passes emitted light through a spectroscope. The output line spectrum identifies metal ions using supplied same-form reference charts or tables. Full line positions distinguish fingerprints; shared lines can leave uncertainty and mixture positions can overlap. Flame colours can mix or one can mask another. Concentration needs the measured response and known standards for the same ion and line under matched conditions. The original supplied calibrations retain background and measured range; extrapolation beyond them needs more evidence. Instruments can be accurate, sensitive and rapid: closeness to accepted value, detection of small concentrations and less time are different claims. Precision concerns agreement of repeats. Original diagrams use schematic positions, not memorised real wavelengths. One concise valid advantage satisfies a state-one demand. Extended writing is self-reviewed; these original tasks and selected-source reviews do not establish official course coverage or practical competence.",
  },
);
for (const [legacy, families] of [
  [0, ["positions"]],
  [1, ["sensitive", "advantage"]],
  [2, ["concentration", "conditions"]],
  [3, ["blank"]],
  [4, ["positions"]],
  [5, ["limit"]],
] as [number, string[]][]) {
  const suffixes = families.flatMap((f) =>
    f === "limit"
      ? ["p-limit"]
      : (instrumentalExposureFamilies[
          f as keyof typeof instrumentalExposureFamilies
        ] ?? []),
  );
  const ids = new Set([
    "instrumental-analysis-" + legacy,
    ...suffixes.map((s) => "instrumental-analysis-v1-" + s),
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}
{
  const ids = new Set([
    ...instrumentalExposureFamilies.masking.map(
      (s) => "instrumental-analysis-v1-" + s,
    ),
    ...["g-mask", "cA-mixture", "vA-limit"].map((s) => "ion-tests-v1-" + s),
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "separation-practical")!,
  {
    journey: separationJourney,
    tier: "foundation",
    course: "combined",
    prerequisite: "chromatography",
    goal: "Plan a separation for a stated target and evaluate recovery, measurements and purity evidence.",
    concept:
      "Physical separation uses differences in solubility, volatility and distribution between phases without forming new substances. Specify the target before choosing stages. Insoluble residue and soluble filtrate are different streams; washed and dried sand, collected crystals and condensed solvent are different products. Account for material left in solution and transfer losses. Remove vessel mass before a supplied recovery calculation. Wet or contaminated samples can give apparent recovery above100%; do not silently alter the measurements. Repeat appropriate drying, cooling and weighing to establish stable mass at the stated resolution, which does not by itself establish chemical purity. Chromatography uses pencil origins above the solvent, small separate spots, an immediately recorded front and distances measured from the same origin. Rf depends on paper/solvent conditions; controlled comparisons isolate an intended variable and explanations link attraction to time distributed between phases. A sharp melting point matching a supplied reference supports purity under matching conditions; one resolved spot or high recovered mass alone cannot prove absolute purity. Original data interpretation supplements, but does not replace, supervised practical competence.",
  },
);
for (const [legacy, families] of [
  [0, ["sand"]],
  [1, ["salt"]],
  [2, ["water"]],
  [3, []],
  [4, ["purity"]],
  [5, []],
] as [number, string[]][]) {
  const ids = new Set([
    "separation-practical-" + legacy,
    ...families
      .flatMap(
        (f) =>
          separationExposureFamilies[
            f as keyof typeof separationExposureFamilies
          ] ?? [],
      )
      .map((s) => "separation-practical-v1-" + s),
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

// Retain exposure to genuinely repeated evidence across the earlier lessons.
for (const ids of [
  ["chromatography-v1-cA-inverse", "separation-practical-v1-p-inverse"],
  [
    "chromatography-v1-r-front",
    "chromatography-v1-cB-front",
    "separation-practical-v1-p-front",
    "separation-practical-v1-cB-front",
  ],
  [
    "chromatography-v1-g-one-spot",
    "chromatography-v1-p-coelution",
    "chromatography-v1-r-coelution",
    "chromatography-v1-cA-purity",
    "chromatography-v1-vA-coelution",
    "separation-practical-v1-r-purity",
    "separation-practical-v1-p-spot",
    "separation-practical-v1-cA-purity",
    "separation-practical-4",
  ],
  ["separation-practical-5", "separation-practical-v1-p-thermal"],
]) {
  const wanted = new Set(ids),
    members = lessons
      .flatMap((l) => [
        ...l.questions,
        ...l.checks,
        ...(l.journey ? tasks(l.journey) : []),
      ])
      .filter((q) => wanted.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((other) => other !== q).map((other) => other.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "early-atmosphere")!,
  {
    journey: atmosphereJourney,
    tier: "foundation",
    course: "combined",
    goal: "Explain atmospheric evolution and evaluate composition, graphs and ancient evidence.",
    concept:
      "Modern proportions have been broadly similar for about 200 million years. Dry air is approximately 78% nitrogen, 21% oxygen and 1% other gases, including noble gases and carbon dioxide; 80/20 is a coarser approximation. Water vapour is another minor component of modern air; its proportion varies and dry-air tables exclude it. A qualified theory describes intense volcanism in Earth's first billion years supplying mainly CO₂ and water vapour, nitrogen and possible small methane/ammonia amounts, with little or no oxygen. Cooling caused water vapour to condense and form oceans. CO₂ dissolved in oceans; carbonates precipitated and accumulated in sedimentary rock, including limestone. Algae first produced oxygen about 2.7 billion years ago. Algae and later plants photosynthesise: carbon dioxide + water → glucose + oxygen, with light supplying energy. This uses CO₂ and releases O₂; oxygen accumulated gradually, enabling animals to evolve. Carbon became stored in biomass and fossil fuels: coal from buried ancient plants; crude oil and natural gas from buried marine organisms changed by heat and pressure over millions of years. Nitrogen built up from volcanic release; percentages also change when other gases are removed. Age axes labelled millions of years ago decrease towards today. Original reconstruction graphs are supplied teaching models, not exact ancient measurements. Geological and planet evidence supports and constrains theories but ancient records are limited and can be altered; absence of direct ancient gas measurements is not absence of evidence.",
  },
);
for (const [legacy, families] of [
  [0, []],
  [1, ["oceans"]],
  [2, ["photo"]],
  [3, []],
  [4, ["evidence"]],
  [5, ["modern"]],
] as [number, string[]][]) {
  const ids = new Set([
    "early-atmosphere-" + legacy,
    ...families
      .flatMap(
        (f) =>
          atmosphereExposureFamilies[
            f as keyof typeof atmosphereExposureFamilies
          ] ?? [],
      )
      .map((s) => "early-atmosphere-v1-" + s),
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "greenhouse-effect")!,
  {
    journey: greenhouseJourney,
    tier: "foundation",
    course: "combined",
    goal: "Explain greenhouse radiation, energy balance and named human gas sources.",
    concept:
      "Much shorter-wave sunlight passes through the atmosphere and is absorbed by Earth’s surface. The warmed surface emits longer-wavelength infrared. Water vapour, carbon dioxide and methane absorb relevant infrared and emit it in all directions, including towards the surface and space. Some infrared still escapes. The natural effect supports habitable temperatures. Increased greenhouse absorption initially reduces net energy escape at the same temperature; with sunlight unchanged, Earth gains energy and warms. Warming increases outgoing radiation towards a new balance; a simple energy ledger gives no precise final temperature. Whole-Earth energy gain equals incoming sunlight minus reflected sunlight minus outgoing infrared over the same interval; internal back radiation is not extra solar input. Fossil-fuel combustion produces CO₂; deforestation releases carbon and reduces photosynthetic uptake. Cattle digestion and oxygen-poor decomposition of organic landfill waste can increase methane. Water vapour can respond to warming as a feedback. Ozone depletion concerns ultraviolet and differs from enhanced greenhouse absorption of infrared. Climate evidence and footprints are developed separately.",
  },
);

for (const [legacy, families] of [
  [0, ["absorption"]],
  [1, ["methane"]],
  [2, ["natural"]],
  [3, ["co2"]],
  [4, ["water"]],
  [5, ["mechanism"]],
] as [number, (keyof typeof greenhouseExposureFamilies)[]][]) {
  const ids = new Set([
    "greenhouse-effect-" + legacy,
    ...families
      .flatMap((f) => greenhouseExposureFamilies[f])
      .map((s) => "greenhouse-v1-" + s),
  ]);
  const members = lessons
    .flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ])
    .filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "climate-evidence")!,
  {
    journey: climateJourney,
    tier: "foundation",
    course: "combined",
    goal: "Evaluate climate evidence and consequences; construct and critique full-lifetime greenhouse-gas footprints.",
    concept:
      "Weather describes short-term local conditions; climate describes long-term statistics over stated regions. Read graph axes, baseline and overall trends despite fluctuations. Temperature anomalies are differences from a reference average, not absolute temperatures. Correlation alone cannot prove cause: the greenhouse mechanism and multiple independently checked observations and models support causal evaluation. Evaluate long-term geographical sampling, transparent methods, peer review, independent checks and potential bias. Peer review is useful scrutiny, not infallibility; funding alone does not prove a result false. Historical measurements, complex interactions and future emissions scenarios can create uncertainty. Supported ranges are neither exact outcomes nor no knowledge and do not supply probabilities by themselves. Potential effects include sea-level rise from land ice and thermal expansion, changed rainfall and drought/flood risk, changes to some extreme weather and shifting habitats/species/crop ranges. Scale and local consequences depend on exposure and adaptation. A carbon footprint accounts for CO₂ and other greenhouse gases emitted over the full lifetime of a product, service or event. State the functional unit, boundary, assumptions and warming timescale. CO₂e compares warming effects, not chemical identity or carbon-atom mass. Convert gas masses to consistent units before applying supplied factors; compare totals per achieved equal service and calculate reductions relative to the original value. Reduced fossil combustion/efficiency and methane collection can lower emissions; source, variable supply, space/capacity, collection leaks and equipment lifetime emissions limit benefits. Do not claim every renewable or collection action makes all lifetime emissions zero. Original teaching graphs, scenarios and exercise warming factors are not real forecasts.",
  },
);
const climateLegacyFamilies: [
  number,
  (keyof typeof climateExposureFamilies)[],
][] = [
  [0, ["weather", "climate"]],
  [1, ["boundary"]],
  [2, ["metric"]],
  [3, ["weather"]],
  [4, ["lifetime", "solar"]],
  [5, ["uncertainty"]],
];
for (const [legacy, families] of climateLegacyFamilies) {
  const ids = new Set([
    "climate-evidence-" + legacy,
    ...families
      .flatMap((f) => climateExposureFamilies[f])
      .map((s) => "climate-v1-" + s),
  ]);
  const candidates = lessons.flatMap((l) => [
    ...l.questions,
    ...l.checks,
    ...(l.journey ? tasks(l.journey) : []),
  ]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const q of candidates)
      if (ids.has(q.id) || (q.exposureAliases ?? []).some((a) => ids.has(a))) {
        for (const a of [q.id, ...(q.exposureAliases ?? [])])
          if (!ids.has(a)) {
            ids.add(a);
            changed = true;
          }
      }
  }
  const members = candidates.filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "air-pollutants")!,
  {
    journey: pollutionJourney,
    tier: "foundation",
    course: "combined",
    goal: "Predict combustion pollutants, explain their sources and distinct effects, and evaluate supplied controls.",
    concept:
      "Use both fuel composition and combustion conditions. Complete hydrocarbon combustion forms CO₂ and water. Insufficient oxygen can produce mixtures including CO and carbon soot alongside CO₂ and water, with no universal ratio. Sulfur impurities can burn in oxygen to SO₂. Very high engine temperatures allow intake nitrogen and oxygen to react to form NOₓ; fuel need not contain nitrogen. Carbon-free hydrogen combustion can still form NOₓ in very hot air, while fuel-cell operation is a different process. Predict only products supported by the supplied element sources and conditions. Fixed reaction formulae are balanced by positive whole-number coefficients, conserving each element; never change subscripts. CO is colourless, odourless and toxic; binding haemoglobin reduces oxygen delivery. Absence of smoke or smell does not establish absence of CO. SO₂ and NOₓ can form acids through atmospheric reactions and water, contributing to acid rain, carbonate-stone erosion and ecosystem harm; they also cause respiratory problems. Particulates include carbon soot and other solid particles; unburned hydrocarbons can contribute to atmospheric particulates. They can harm health and scatter/absorb sunlight, reducing sunlight reaching the surface (global dimming). Distinguish dimming, acid damage, greenhouse infrared exchange and ozone depletion. Compare sulfur mass using both fuel mass and percentage; use supplied particle evidence separately. Equal fuel masses need not provide equal useful energy. Calculate emission reductions as decrease divided by the original matched rate. Sulfur removal, particle filters and more complete combustion target particular pathways; residual emissions and other unmeasured pollutants remain relevant. A measured percentage reduction alone cannot establish safe exposure, climate neutrality or zero pollutants. Tables are original exercise data, not real regulatory limits.",
  },
);
const pollutionLegacy: [number, (keyof typeof pollutionExposureFamilies)[]][] =
  [
    [0, ["acid"]],
    [1, ["nitrogen"]],
    [2, ["particles"]],
    [3, ["coSource", "mixture"]],
    [4, ["sulfur", "desulfur"]],
    [5, ["co"]],
  ];
for (const [legacy, families] of pollutionLegacy) {
  const ids = new Set([
    "air-pollutants-" + legacy,
    ...families
      .flatMap((f) => pollutionExposureFamilies[f])
      .map((s) => "pollution-v1-" + s),
  ]);
  const candidates = lessons.flatMap((l) => [
    ...l.questions,
    ...l.checks,
    ...(l.journey ? tasks(l.journey) : []),
  ]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const q of candidates)
      if (ids.has(q.id) || (q.exposureAliases ?? []).some((a) => ids.has(a))) {
        if (!ids.has(q.id)) {
          ids.add(q.id);
          changed = true;
        }
        for (const a of q.exposureAliases ?? [])
          if (!ids.has(a)) {
            ids.add(a);
            changed = true;
          }
      }
  }
  const members = candidates.filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "carbon-cycle")!,
  {
    journey: cycleJourney,
    tier: "foundation",
    course: "combined",
    goal: "Trace conserved carbon through stores, explain microbial recycling and compare net transfers and concentration patterns.",
    concept:
      "Photosynthesis moves carbon from CO₂ into glucose and biomass using water and light. Plants respire in both light and darkness; aerobic respiration returns some organic carbon as CO₂. Feeding moves organic carbon between organisms. Microorganisms digest dead material and waste; aerobic respiration releases CO₂, while some carbon enters microbial biomass. Plants use CO₂ carbon in photosynthesis; mineral ions returned to soil are absorbed by roots for separate functions such as protein synthesis. Carbon atoms cycle; energy flows and dissipates. Some organic material preserved under suitable burial conditions forms fossil fuels over geological time: coal chiefly from plants, much oil/gas from ancient marine organic material. Complete burning can transfer stored carbon to atmospheric CO₂ much faster than geological replacement. CO₂ dissolves in oceans, which also exchange carbon outward; carbonate shells/sediments can form limestone. Long storage is not a universal permanence claim. A specified carbonate–acid reaction can release CO₂; not all weathering has the same net carbon effect. Inventories use a stated boundary and interval: signed net is entering minus leaving, final store is starting plus net. These exercises use mass of carbon, not mass of whole CO₂. Atom conservation does not require each individual store or concentration to remain fixed. Forest clearing/burning can release stored carbon and reduce ongoing photosynthetic uptake. Regrowth can improve uptake without instantaneous, unlimited or permanent offsets. Concentration graphs use stated units; seasonal variation and longer like-season trends can coexist. Different-season endpoint comparisons answer a different question. A curve alone does not prove every cause or an exact future outcome. The explicit whole cycling diagram is cross-science Biology coverage connected to atmospheric Chemistry, not an invented Chemistry subsection.",
  },
);
const cycleLegacy: [number, (keyof typeof cycleExposureFamilies)[]][] = [
  [0, ["photo"]],
  [1, ["plantResp", "animalResp", "decay"]],
  [2, ["fossil", "coal", "oil"]],
  [3, ["forest"]],
  [4, ["carbonate"]],
  [5, ["fossil"]],
];
for (const [legacy, families] of cycleLegacy) {
  const ids = new Set([
      "carbon-cycle-" + legacy,
      ...families
        .flatMap((f) => cycleExposureFamilies[f])
        .map((s) => "cycle-v1-" + s),
    ]),
    candidates = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const q of candidates)
      if (ids.has(q.id) || (q.exposureAliases ?? []).some((a) => ids.has(a))) {
        if (!ids.has(q.id)) {
          ids.add(q.id);
          changed = true;
        }
        for (const a of q.exposureAliases ?? [])
          if (!ids.has(a)) {
            ids.add(a);
            changed = true;
          }
      }
  }
  const members = candidates.filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "potable-water")!,
  {
    journey: waterJourney,
    tier: "foundation",
    course: "combined",
    goal: "Interpret water quality, explain treatment, and analyse pH, residue, distillation and membrane data.",
    concept:
      "Potable water is safe to drink with sufficiently low dissolved salts and harmful microorganisms; it need not be chemically pure H₂O. Clear appearance, pH 7 or one residue test alone does not establish safety or purity. In the UK, rain with little dissolved matter replenishes freshwater sources. Suitable freshwater from rivers, lakes or groundwater can be filtered to remove undissolved solids, then disinfected using chlorine, ozone or UV. UV is light; ordinary filtration and disinfection do not remove all dissolved salts. Salty sources can be desalinated by distillation or reverse osmosis; both require energy. Distillation heats water into vapour and cools it to collect liquid in a clean receiver, leaving nonvolatile salts in the heated flask. H₂O identity remains: no hydrogen/oxygen decomposition. Effective receiver cooling reduces escaped vapour. In a stipulated clean nonvolatile-salt/microbe case, heating destroys microbes and the distillate can meet supplied quality without another sterilisation stage; do not generalise to unknown volatile contaminants or dirty collection. RO uses high pressure and a selective membrane, retaining most salts in concentrated brine. Apply the supplied ideal recovery/loss assumptions without inventing real efficiencies. Chemistry required practical 8 / Trilogy required practical 13 analyses pH and dissolved solids and distils salt solution. Use a suitable pH probe or universal indicator; weigh empty dry dish, measure known volume, evaporate under school supervision, cool and reweigh after reheating to constant mass for stable nonvolatile residue. Subtract empty-dish mass;1000 cm³ = 1 dm³; concentration is residue grams divided by sample dm³. Wet residue overestimates, spillage underestimates; hot weighing is unsuitable. Average equal-volume repeats accurately; consistency alone does not prove dryness. Room-temperature pure water at pH 7 and standard-pressure boiling at 100°C are stated conditions, not universal quality certificates. Compare treatment energy for equal service, volume and boundary; local suitable-source availability matters. Written method accounts are manually self-reviewed; simulations do not establish hands-on practical competence or whole-course examination readiness.",
  },
);
const waterLegacy: [number, (keyof typeof waterExposureFamilies)[]][] = [
  [0, ["quality"]],
  [1, ["fresh"]],
  [2, ["fresh"]],
  [3, ["energy"]],
  [4, ["membrane"]],
  [5, ["limited"]],
];
for (const [legacy, families] of waterLegacy) {
  const ids = new Set([
      "potable-water-" + legacy,
      ...families
        .flatMap((f) => waterExposureFamilies[f])
        .map((s) => "water-v1-" + s),
    ]),
    candidates = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const q of candidates)
      if (ids.has(q.id) || (q.exposureAliases ?? []).some((a) => ids.has(a))) {
        for (const a of [q.id, ...(q.exposureAliases ?? [])])
          if (!ids.has(a)) {
            ids.add(a);
            changed = true;
          }
      }
  }
  const members = candidates.filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "wastewater-and-treatment")!,
  {
    journey: wasteJourney,
    tier: "foundation",
    course: "combined",
    goal: "Trace physical and biological treatment, interpret dry-solid and disposal data, and judge quality evidence.",
    concept:
      "Urban and industrial wastewater require treatment before environmental release. Sewage and agricultural wastewater require organic matter and harmful-microbe removal; industrial wastewater may require organic matter and harmful-chemical removal. Screening and grit removal precede sedimentation, which produces wet sludge and liquid effluent. Sludge undergoes anaerobic digestion without oxygen; effluent undergoes aerobic biological treatment using oxygen supplied to microorganisms. Physical separation does not remove every dissolved contaminant. Biological breakdown changes matter into other forms and conserves atoms; it does not guarantee total microbe or chemical removal. Methane-containing biogas is explanatory cross-science context from Biology decay, not pure methane or an invented Chemistry yield requirement. Dry suspended-solid inventories cover only supplied physical separation before reaction, not whole wet sludge mass or liquid volume. A disposal percentage is the category mass divided by the same year's complete processed total times100; distinguish percentage points from relative percentage change and round only the final result. Disposal trends alone do not establish causes. Suitable treated sludge can be a resource under supplied suitability conditions; untreated material is not automatically safe fertiliser. Discharge and drinking quality require different evidence; clear treated effluent is not automatically potable or chemically pure. Compare waste, ground and salt water from actual contaminants and local availability: suitably low-contamination groundwater may need less treatment; seawater desalination requires energy; sewage needs physical/biological treatment and any further drinking-quality controls. Groundwater may itself be contaminated, so no universal source ranking follows. Simulated reasoning and manually reviewed explanations do not establish hands-on or whole-course exam competence.",
  },
);
const wasteLegacy: [number, (keyof typeof wasteExposureFamilies)[]][] = [
  [0, ["screen"]],
  [1, ["screen"]],
  [2, ["liquid"]],
  [3, ["biogas"]],
  [4, ["targets"]],
  [5, ["quality"]],
];
for (const [legacy, families] of wasteLegacy) {
  const ids = new Set([
      "wastewater-and-treatment-" + legacy,
      ...families
        .flatMap((f) => wasteExposureFamilies[f])
        .map((s) => "waste-v1-" + s),
    ]),
    candidates = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const q of candidates)
      if (ids.has(q.id) || (q.exposureAliases ?? []).some((a) => ids.has(a)))
        for (const a of [q.id, ...(q.exposureAliases ?? [])])
          if (!ids.has(a)) {
            ids.add(a);
            changed = true;
          }
  }
  const members = candidates.filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "extracting-metals")!,
  {
    journey: bioJourney,
    tier: "higher",
    course: "combined",
    prerequisite: "metal-extraction",
    goal: "Follow low-grade biological extraction, quantify copper inventories and evaluate final recovery and route constraints.",
    concept:
      "Higher-tier alternative extraction: finite copper ores and low-grade sources motivate phytomining and bioleaching. Plants absorb metal compounds; harvest and burn to produce ash containing copper compounds, dissolve suitable ash compounds in acid to make a copper-compound solution, then recover copper metal by scrap-iron displacement or electrolysis. Bacteria produce leachate solutions containing metal compounds, which still need final recovery. Ash, leachate and pure copper metal are distinct chemical forms. Ordinary filtering removes suspended grit, not dissolved copper ions; evaporation alone does not reduce them to metal. Given Fe>Cu>Ag, iron displaces copper from solution, but silver does not. Cu²⁺ gains electrons and is reduced to Cu; iron loses electrons to form Fe²⁺. Sulfate remains a spectator. Suitable aqueous electrolysis deposits copper at the negative electrode. These alternatives avoid some traditional digging/moving/disposal of large amounts of rock but do not eliminate all impacts. Evaluate given energy, land, time, recovery, available high-grade ores and technology. Ore mass, copper content and recovered metal mass differ; apply grade to the original source then stated recovery to its contained copper. Compound copper fractions use the complete formula mass. Ash concentration can rise without copper creation; use the actual retention result, and account for copper outside ash/product streams. Burning involves oxygen and changes other matter into products rather than destroying atoms. Energy comparisons need equal-quality recovered copper and a stated boundary/constraint; lower total energy alone may mislead. Suitable existing scrap can be separated from insulation, melted and reformed, conserving finite ores and often reducing primary-extraction energy, mining and waste impacts; collection and processing remain. Core carbon reduction and primary electrolysis are prerequisites covered in Extraction and reactivity. Original simulations/data and manually reviewed explanations do not establish hands-on or whole-course examination competence.",
  },
);

const bioLegacy: [number, string[]][] = [
  [0, ["me-v1-r-route", "me-v1-g-route"]],
  [1, ["me-v1-p-al", "me-v1-p-explain-al"]],
  [2, bioExposureFamilies.plants.map((s) => "bio-v1-" + s)],
  [3, bioExposureFamilies.bacteria.map((s) => "bio-v1-" + s)],
  [4, bioExposureFamilies.comparison.map((s) => "bio-v1-" + s)],
  [5, bioExposureFamilies.recycle.map((s) => "bio-v1-" + s)],
];
for (const [legacy, newIds] of bioLegacy) {
  const ids = new Set(["extracting-metals-" + legacy, ...newIds]),
    candidates = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const q of candidates)
      if (ids.has(q.id) || (q.exposureAliases ?? []).some((a) => ids.has(a)))
        for (const a of [q.id, ...(q.exposureAliases ?? [])])
          if (!ids.has(a)) {
            ids.add(a);
            changed = true;
          }
  }
  const members = candidates.filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "life-cycle-and-recycling")!,
  {
    journey: lcaJourney,
    tier: "foundation",
    course: "combined",
    goal: "Construct matched lifecycle boundaries, compare equivalent service and justify environmental/resource decisions.",
    concept:
      "Life cycle assessments compare extraction and processing of raw materials, manufacture and packaging, use and operation, and disposal at the end of useful life, including transport and distribution at each relevant stage. Compare the same service/capacity and consistent boundaries. Water, resource and energy quantities and some wastes can be measured, but allocating numerical values to pollutant effects and relative impact importance involves value judgements; LCA is not purely objective. Selective or abbreviated assessments can be useful if disclosed, but can be misused to support predetermined advertising conclusions. Compare original paper/plastic shopping-bag data with linked reasons, a conditional judgement and missing-evidence limits. Renewable wood is not impact-free and finite oil feedstock is not renewable on human timescales. Reuse spreads fixed production over repeated service but washing, return transport, breakage and actual service counts matter; equality is not a strictly lower result. Separate physical units rather than adding energy, litres and waste into an invented universal total. Reducing unnecessary demand, reusing products and recycling materials can reduce limited-resource use, energy demand, waste and environmental impacts. Metals, glass, building materials, clay ceramics and most plastics use limited raw materials; mining/quarrying and energy supply have impacts. Glass bottles may be reused or crushed/melted into new glass products. Metals can be melted/recast/reformed; suitable scrap steel may supplement primary iron from a blast furnace. Required separation depends on the material and properties of the final product. Collection is not usable recovery: apply supplied yield to the suitable sorted stream, account for other streams and remaining new input without creating or destroying atoms. Actual infrastructure and recovery determine whether technically recyclable material is recycled. Original simulations and manually reviewed comparisons do not certify full examination or hands-on competence.",
  },
);
const lcaLegacy: [number, string[]][] = [
  [0, lcaExposureFamilies.stages.map((s) => "lca-v1-" + s)],
  [1, lcaExposureFamilies.trade.map((s) => "lca-v1-" + s)],
  [2, lcaExposureFamilies.resources.map((s) => "lca-v1-" + s)],
  [3, lcaExposureFamilies.reuse.map((s) => "lca-v1-" + s)],
  [4, lcaExposureFamilies.boundary.map((s) => "lca-v1-" + s)],
  [5, lcaExposureFamilies.recycling.map((s) => "lca-v1-" + s)],
];
for (const [legacy, newIds] of lcaLegacy) {
  const ids = new Set(["life-cycle-and-recycling-" + legacy, ...newIds]),
    candidates = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey ? tasks(l.journey) : []),
    ]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const q of candidates)
      if (ids.has(q.id) || (q.exposureAliases ?? []).some((a) => ids.has(a)))
        for (const a of [q.id, ...(q.exposureAliases ?? [])])
          if (!ids.has(a)) {
            ids.add(a);
            changed = true;
          }
  }
  const members = candidates.filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "materials-and-corrosion")!,
  {
    journey: materialsJourney,
    tier: "foundation",
    course: "separate",
    goal: "Predict corrosion and use structures, alloy composition and property evidence to choose materials.",
    concept:
      "Corrosion is destruction by chemical reactions with environmental substances. Iron rusting requires both oxygen and water and forms hydrated iron(III) oxide. Controlled experiments isolate each reactant; ordinary water contains dissolved oxygen. Intact grease, paint and electroplated barriers exclude reactants. Aluminium has a protective oxide coating. Galvanising coats iron with zinc, which is more reactive and can protect exposed iron sacrificially while zinc remains in electrical contact in the corrosive environment. Scratched paint alone cannot; less-reactive metals do not supply sacrificial protection. Protection ends when reactive metal is consumed. Retained rust can increase sample mass as oxygen/water are incorporated; use each initial mass as its percentage denominator and distinguish percentage-point differences from relative changes. Pure-metal layers slide while metallic attraction remains; different-sized alloy atoms distort layers and impede sliding. Bronze is copper/tin (statues, medals); brass copper/zinc (instruments, fittings). Gold jewellery alloys include silver, copper and zinc; harder alloys resist wear and lower gold content may reduce material cost. Carats measure gold mass fraction out of24:24 carat pure,18 carat75%. Steels contain iron, carbon and specific other metals: high-carbon strong/brittle (cutting tools), low-carbon softer/easily shaped, chromium/nickel stainless hard/corrosion-resistant (cutlery). Aluminium alloys have low density (aircraft). Interpret unfamiliar alloy compositions by mass with a stated whole. Soda-lime glass uses sand, sodium carbonate and limestone; borosilicate uses sand and boron trioxide and melts at higher temperatures. Pottery/bricks: shape wet clay then heat in a furnace. Monomers and manufacturing conditions affect polymer properties. LD and HD poly(ethene) both come from ethene under different conditions; branching reduces close packing/density, more-linear chains pack closely. Both are thermosoftening. Thermosoftening melting overcomes between-chain attractions while covalent backbone bonds remain intact. Thermosetting covalent crosslinks prevent chains separating to melt; strong heating can decompose them. Composites have a matrix/binder surrounding/binding reinforcement, such as cement-based matrix/steel in reinforced concrete or polymer resin/glass fibres. Compare quantitative properties with matched units, meet every stated constraint and link choices to uses and missing evidence. Original simulated investigations and manually reviewed explanations do not establish supervised practical competence or whole-course exam readiness.",
  },
);
const materialsLegacy: [number, string[]][] = [
  [0, materialsExposureFamilies.rust.map((s) => "materials-v1-" + s)],
  [1, materialsExposureFamilies.barrier.map((s) => "materials-v1-" + s)],
  [2, materialsExposureFamilies.sacrifice.map((s) => "materials-v1-" + s)],
  [
    3,
    [
      ...materialsExposureFamilies.layers.map((s) => "materials-v1-" + s),
      "mb-v1-g-alloy",
      "mb-v1-p-alloy-explain",
      "mb-v1-r-alloy",
    ],
  ],
  [4, materialsExposureFamilies.composite.map((s) => "materials-v1-" + s)],
  [5, materialsExposureFamilies.sacrifice.map((s) => "materials-v1-" + s)],
];
const materialsShared = [
  [
    ...materialsExposureFamilies.thermal.map((s) => "materials-v1-" + s),
    "ps-v1-g-separation",
    "ps-v1-r-forces",
    "ps-v1-rb-separation",
  ],
];
for (const ids0 of [
  ...materialsLegacy.map(([legacy, newIds]) => [
    "materials-and-corrosion-" + legacy,
    ...newIds,
  ]),
  ...materialsShared,
]) {
  const ids = new Set(ids0),
    // New-only aliases are read in both directions by the exposure engine.
    // Keep the legacy closure byte-exact instead of rewriting old task records.
    candidates = lessons
      .flatMap((l) => [
        ...l.questions,
        ...l.checks,
        ...(l.journey ? tasks(l.journey) : []),
      ])
      .filter(
        (q) =>
          !q.id.startsWith("materials-v1-rust-design-") &&
          !q.id.startsWith("materials-v1-composite-recall-"),
      );
  let changed = true;
  while (changed) {
    changed = false;
    for (const q of candidates)
      if (ids.has(q.id) || (q.exposureAliases ?? []).some((a) => ids.has(a)))
        for (const a of [q.id, ...(q.exposureAliases ?? [])])
          if (!ids.has(a)) {
            ids.add(a);
            changed = true;
          }
  }
  const members = candidates.filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

Object.assign(
  lessons.find((l) => l.slug === "haber-and-fertilisers")!,
  {
    journey: haberJourney,
    title: "Haber process and fertilisers",
    tier: "foundation",
    course: "separate",
    prerequisite: "reversible-reactions",
    goal: "Build ammonia production and fertiliser chemistry; Higher extends rate, equilibrium and commercial compromises.",
    concept:
      "Purified nitrogen from air and hydrogen commonly processed from natural gas pass over iron at about 450 °C and 200 atmospheres. N₂+3H₂⇌2NH₃ compares molecule/mole amounts, not masses. Reversible conversion is partial per pass. Cooling liquefies ammonia for removal; unreacted gases return to the reactor. Forward atom economy is 100% because only ammonia is produced; actual conversion/yield need not be 100%. NPK fertilisers are formulations of nitrogen, phosphorus and potassium compounds in chosen proportions, with other elements also contributing mass. Ammonia is used to produce ammonium salts and nitric acid. Mined potassium chloride/sulfate and phosphate rock supply other feedstocks; untreated rock is too insoluble for useful direct uptake. Nitric acid treatment produces calcium nitrate and phosphoric acid. Sulfuric acid produces single superphosphate, including calcium dihydrogenphosphate and calcium sulfate; phosphoric acid gives triple superphosphate/calcium dihydrogenphosphate without that sulfate coproduct. Compare supplied continuous industrial salt production with repeated laboratory batches; titration determines neutralising volumes and an indicator-free repeat avoids product contamination before concentrating, cooling, filtering and drying crystals. These are simulations, not supervised practical competence. Higher: dynamic equilibrium has equal forward/reverse rates, not equal concentrations. Increasing temperature speeds reaction but favours the endothermic reverse direction, lowering equilibrium ammonia yield. Pressure increases collision frequency and favours two product gas molecules over four reactant molecules, but compression energy and stronger vessels cost more. Iron lowers activation energy for both directions and changes time to equilibrium, not its position. Explain commercial compromises using rate, equilibrium, energy/equipment and feedstock availability/cost. Read actual axis units, construct new plotted data, distinguish interpolation from uncertain extrapolation, and keep rate separate from equilibrium yield. Written work requires manual review; this lesson does not itself establish whole-course exam readiness.",
  },
);
const haberLegacy: [number, string[]][] = [
  [0, ["r-feed2", "g-feed", "p-economy"]],
  [1, haberExposureFamilies.catalyst],
  [2, haberExposureFamilies.pressure],
  [3, haberExposureFamilies.npk],
  [4, haberExposureFamilies.loop],
  [5, haberExposureFamilies.acid],
];
for (const [legacy, suffixes] of haberLegacy) {
  const ids = new Set([
      "haber-and-fertilisers-" + legacy,
      ...suffixes.map((s) => "haber-v1-" + s),
    ]),
    candidates = lessons
      .flatMap((l) => [
        ...l.questions,
        ...l.checks,
        ...(l.journey ? tasks(l.journey) : []),
      ])
      .filter((q) => !q.id.startsWith("haber-v1-source-recall-"));
  let changed = true;
  while (changed) {
    changed = false;
    for (const q of candidates)
      if (ids.has(q.id) || (q.exposureAliases ?? []).some((a) => ids.has(a)))
        for (const a of [q.id, ...(q.exposureAliases ?? [])])
          if (!ids.has(a)) {
            ids.add(a);
            changed = true;
          }
  }
  const members = candidates.filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

// Shared equilibrium facts already taught elsewhere cannot become fresh Haber evidence.
for (const initial of [
  [
    ...haberExposureFamilies.catalyst.map((s) => "haber-v1-" + s),
    "es-v1-r-catalyst",
    "es-v1-p-catalyst",
    "es-v1-p-catalyst-written",
    "es-v1-a-catalyst",
    "es-v1-rb-catalyst",
  ],
  [
    ...haberExposureFamilies.dynamic.map((s) => "haber-v1-" + s),
    "re-v1-p-dynamic-written",
    "re-v1-r-dynamic",
  ],
]) {
  const ids = new Set(initial),
    candidates = lessons
      .flatMap((l) => [
        ...l.questions,
        ...l.checks,
        ...(l.journey ? tasks(l.journey) : []),
      ])
      .filter((q) => !q.id.startsWith("haber-v1-source-recall-"));
  let changed = true;
  while (changed) {
    changed = false;
    for (const q of candidates)
      if (ids.has(q.id) || (q.exposureAliases ?? []).some((a) => ids.has(a)))
        for (const a of [q.id, ...(q.exposureAliases ?? [])])
          if (!ids.has(a)) {
            ids.add(a);
            changed = true;
          }
  }
  const members = candidates.filter((q) => ids.has(q.id));
  for (const q of members)
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...members.filter((o) => o !== q).map((o) => o.id),
      ]),
    ];
}

// Preserve reciprocal exposure for newly constructed graphite mechanisms after
// existing cross-allotrope links have been attached. Help in either direction
// must not make an equivalent demand fresh.
for (const q of tasks(graphiteJourney)) {
  for (const id of q.exposureAliases ?? []) {
    const other = questionById(id);
    if (other)
      other.exposureAliases = [
        ...new Set([...(other.exposureAliases ?? []), q.id]),
      ];
  }
}

// Keep newly constructed graphene mechanisms reciprocal after existing
// cross-allotrope coordination links, preserving those earlier identities.
for (const q of tasks(grapheneJourney)) {
  for (const id of q.exposureAliases ?? []) {
    const other = questionById(id);
    if (other)
      other.exposureAliases = [
        ...new Set([...(other.exposureAliases ?? []), q.id]),
      ];
  }
}

// Retain reciprocal links for fullerene description and brief use recall.
for (const q of tasks(fullereneJourney))
  for (const id of q.exposureAliases ?? []) {
    const other = questionById(id);
    if (other)
      other.exposureAliases = [
        ...new Set([...(other.exposureAliases ?? []), q.id]),
      ];
  }

// Retain reciprocal nanotube exposure after cross-allotrope links.
for (const q of tasks(nanotubeJourney))
  for (const id of q.exposureAliases ?? []) {
    const other = questionById(id);
    if (other)
      other.exposureAliases = [
        ...new Set([...(other.exposureAliases ?? []), q.id]),
      ];
  }

// Keep new polymer writing reciprocal after earlier cross-lesson links.
for (const q of tasks(polymerStructureJourney))
  for (const id of q.exposureAliases ?? []) {
    const other = questionById(id);
    if (other)
      other.exposureAliases = [
        ...new Set([...(other.exposureAliases ?? []), q.id]),
      ];
  }

// Preserve reciprocal exposure for new nanoparticle geometry and evidence demands.
for (const q of tasks(nanoparticlesJourney))
  for (const id of q.exposureAliases ?? []) {
    const other = questionById(id);
    if (other)
      other.exposureAliases = [
        ...new Set([...(other.exposureAliases ?? []), q.id]),
      ];
  }

// Keep new conservation writing and inventories reciprocal after earlier links.
for (const q of tasks(massConservationJourney))
  for (const id of q.exposureAliases ?? []) {
    const other = questionById(id);
    if (other)
      other.exposureAliases = [
        ...new Set([...(other.exposureAliases ?? []), q.id]),
      ];
  }

// Preserve reciprocal exposure for new measurement reasoning and frequency construction.
for (const q of tasks(measurementJourney))
  for (const id of q.exposureAliases ?? []) {
    const other = questionById(id);
    if (other)
      other.exposureAliases = [
        ...new Set([...(other.exposureAliases ?? []), q.id]),
      ];
  }

// Keep changing-concentration writing reciprocal after cross-lesson links.
for (const q of tasks(changingConcentrationJourney))
  for (const id of q.exposureAliases ?? []) {
    const other = questionById(id);
    if (other)
      other.exposureAliases = [
        ...new Set([...(other.exposureAliases ?? []), q.id]),
      ];
  }

// Preserve reciprocal exposure for metal reaction recall and independent method writing.
for (const q of tasks(metalReactivityJourney))
  for (const id of q.exposureAliases ?? []) {
    const other = questionById(id);
    if (other)
      other.exposureAliases = [
        ...new Set([...(other.exposureAliases ?? []), q.id]),
      ];
  }

// Keep newly reserved metal–acid help/exposure links reciprocal after curriculum normalization.
{
  const all = tasks(acidNeutralisationJourney);
  for (const q of all)
    for (const id of q.exposureAliases ?? []) {
      const other = all.find((item) => item.id === id);
      if (other)
        other.exposureAliases = [
          ...new Set([...(other.exposureAliases ?? []), q.id]),
        ];
    }
}
