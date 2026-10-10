import { extendAlkaneEquationWriting } from "./alkane-equation-writing";
import type { LearningTask as Task, LessonJourney } from "../types";
import type { AlkaneMode } from "../../lib/alkanes";
const model = (
  mode: AlkaneMode,
  instruction: string,
  record = "initial",
): Task["model"] => ({ kind: "alkanes", mode, record, instruction });
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
    offset =
      [...id].reduce((sum, x) => sum + x.charCodeAt(0), 0) % options.length;
  return {
    id: "alk-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    ...(m ? { model: m } : {}),
  };
}
function n(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  unit: string,
  explanation: string,
  hint: string,
  m?: Task["model"],
): Task {
  return {
    id: "alk-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    ...(m ? { model: m } : {}),
  };
}
function w(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
): Task {
  return {
    id: "alk-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    rubric,
    explanation: answer,
    hint,
  };
}
function drawing(id: string, name: string, answer: string): Task {
  return {
    ...w(
      id,
      "Construct " + name,
      "Construct a displayed structure of straight-chain " +
        name +
        ". Choose your own carbon count and show every hydrogen atom and covalent bond.",
      answer,
      [
        "Correct number of carbon atoms connected by single bonds.",
        "Correct number of hydrogen atoms; each H has one bond.",
        "Each neutral carbon has four bonds; every C–H and C–C bond is shown.",
      ],
      "Start with the carbon count implied by the name; complete each carbon to four bonds.",
    ),
    alkaneDrawing: {
      maxCarbons: 4,
      note: "Choose a carbon scaffold and add each hydrogen attachment. This structure is reviewed using the criteria after submission.",
    },
  };
}
const warmup: Task[] = [
  c(
    "w-hydrocarbon",
    "Identify a hydrocarbon",
    "Which formula is a hydrocarbon?",
    "C₂H₆",
    {
      "C₂H₆O": "Oxygen makes this a different type of carbon compound.",
      "H₂": "Hydrogen alone contains no carbon.",
    },
    "A hydrocarbon contains carbon and hydrogen only, with both elements present.",
    "Inspect the element symbols.",
  ),
  n(
    "w-oxygen",
    "Count oxygen atoms",
    "How many oxygen atoms are represented by 3 O₂ molecules?",
    "6",
    "atoms",
    "3 × 2 = 6 oxygen atoms. A coefficient multiplies the whole formula.",
    "Each O₂ molecule contains two O atoms.",
  ),
];
const refresher: Task[] = [
  c(
    "r-elements",
    "Both elements, only these elements",
    "What does hydrocarbon mean?",
    "A compound containing carbon and hydrogen only",
    {
      "Any compound containing carbon":
        "A carbon compound may also contain oxygen or other elements.",
      "Any fuel": "Fuel use is not the definition.",
    },
    "The name specifies composition, not use.",
    "Check both required elements.",
  ),
  n(
    "r-carbon",
    "Carbon bonding capacity",
    "How many ordinary covalent bonds does one neutral carbon form in these alkane structures?",
    "4",
    "bonds",
    "Carbon completes four covalent bonds in these neutral molecules.",
    "Count the four attachment directions.",
  ),
  n(
    "r-hydrogen",
    "Hydrogen bonding capacity",
    "How many ordinary covalent bonds does one hydrogen form?",
    "1",
    "bond",
    "One hydrogen connects by one single covalent bond.",
    "Hydrogen completes its first shell with a shared pair.",
  ),
  c(
    "r-saturation",
    "Meaning of saturated",
    "Saturated in this lesson describes what?",
    "No carbon–carbon multiple bonds",
    {
      "A solution holding the most solute":
        "That is another use of the word, unrelated to molecular bonding here.",
      "A large molecule": "Size alone does not establish saturation.",
    },
    "An alkane has single bonds and no C=C or C≡C bond. Methane qualifies despite having no C–C bond.",
    "Inspect bond types, not size.",
  ),
  n(
    "r-formula",
    "Substitute the carbon count",
    "For an open-chain alkane with n = 3, calculate 2n + 2.",
    "8",
    "H atoms",
    "2 × 3 + 2 = 8, giving C₃H₈.",
    "Multiply before adding.",
  ),
  n(
    "r-inverse",
    "Recover the carbon count",
    "An open-chain alkane has 14 H atoms. Solve 2n + 2 = 14 for n.",
    "6",
    "C atoms",
    "14 − 2 = 12; 12 ÷ 2 = 6.",
    "Undo the addition, then the multiplication.",
  ),
  c(
    "r-names",
    "First four names",
    "Which list orders the first four alkanes by increasing carbon count?",
    "Methane, ethane, propane, butane",
    {
      "Methane, propane, ethane, butane":
        "Ethane has two carbons and propane three.",
      "Methane, ethene, propane, butene":
        "The -ene members have different bonding.",
    },
    "Their formulas are CH₄, C₂H₆, C₃H₈ and C₄H₁₀.",
    "Match one, two, three and four carbons.",
  ),
  n(
    "r-middle",
    "Existing bonds use capacity",
    "A middle carbon already has two C–C single bonds. How many H atoms complete its four bonds?",
    "2",
    "H atoms",
    "4 − 2 = 2 C–H bonds.",
    "Subtract existing bond count from four.",
  ),
  c(
    "r-products",
    "Both complete-combustion products",
    "Choose both products of complete hydrocarbon combustion.",
    "Carbon dioxide and water",
    {
      "Carbon monoxide only":
        "Carbon monoxide indicates incomplete oxidation; the hydrogen also needs accounting for.",
      "Carbon dioxide only": "The fuel hydrogen forms water.",
    },
    "With sufficient oxygen, fuel carbon forms CO₂ and hydrogen forms H₂O.",
    "Track both fuel elements.",
  ),
  n(
    "r-coefficient",
    "Coefficient scales the formula",
    "How many H atoms are represented by 2 C₄H₁₀ molecules?",
    "20",
    "atoms",
    "2 × 10 = 20 H atoms; the subscript stays ten.",
    "Multiply all atoms by the coefficient.",
  ),
  n(
    "r-product-oxygen",
    "Oxygen in both products",
    "How many O atoms are represented by 3 CO₂ + 4 H₂O?",
    "10",
    "atoms",
    "3 × 2 + 4 × 1 = 10 O atoms.",
    "Count oxygen in water too.",
  ),
  c(
    "r-subscript",
    "Preserve chemical identities",
    "What can be changed while balancing a supplied equation?",
    "Coefficients in front of formulas",
    {
      "Subscripts inside formulas": "That changes the chemical substance.",
      "Element symbols": "That changes the substances and elements.",
    },
    "Coefficients change the relative amounts of intact substances.",
    "Preserve each supplied molecular formula.",
  ),
  c(
    "r-limited",
    "Limited oxygen",
    "What can incomplete combustion of a hydrocarbon produce?",
    "CO and/or soot, alongside other possible products",
    {
      "Only CO in every case":
        "Oxygen supply alone does not specify a unique exhaust mixture.",
      "No water in any case":
        "Incomplete oxidation of carbon does not mean the fuel hydrogen cannot form water.",
    },
    "Incomplete combustion can produce CO and carbon particles; real mixtures can also contain CO₂, water and unburned fuel.",
    "Avoid treating one simplified equation as every real flame.",
  ),
  c(
    "r-co",
    "CO and oxygen carriage",
    "Why is carbon monoxide toxic?",
    "It binds haemoglobin and reduces oxygen carriage",
    {
      "A sharp smell harms the nose": "CO is odourless.",
      "It is visibly dark": "CO is colourless; soot is a different substance.",
    },
    "Binding haemoglobin reduces the blood’s ability to carry oxygen.",
    "Think of transport in blood.",
  ),
  c(
    "r-evidence",
    "Evidence versus appearance",
    "A fuel flame looks blue. What does this observation alone establish about CO?",
    "It does not establish that CO is absent",
    {
      "CO is definitely absent":
        "Flame appearance is not a complete gas analysis.",
      "CO must be the only product":
        "A colour observation does not identify every product.",
    },
    "Use actual supplied gas analysis; CO is colourless and odourless.",
    "An appearance is not a measurement of CO.",
  ),
  c(
    "r-energy",
    "Energy transfer",
    "Complete combustion is normally what kind of energy change?",
    "Exothermic",
    {
      "Endothermic overall":
        "Combustion transfers energy to the surroundings overall.",
      "No energy transfer": "Fuel combustion releases energy.",
    },
    "Bond breaking requires energy, but forming product bonds releases more in the overall combustion reaction.",
    "Consider the surroundings overall.",
  ),
  c(
    "r-series",
    "Neighbouring members",
    "Which statement describes neighbouring members of the alkane homologous series?",
    "They differ by CH₂",
    {
      "They differ by H₂ only": "Each successive member also adds one carbon.",
      "They have identical physical properties":
        "Their physical properties vary gradually.",
    },
    "They share a general formula and similar chemical properties, with a gradual physical-property trend.",
    "Compare C₂H₆ with C₃H₈.",
  ),
  c(
    "r-graph",
    "Formula does not specify every bond",
    "A supplied four-carbon ring has formula C₄H₈ and all single bonds. Is C=C proved by this formula?",
    "No; inspect the supplied structure",
    {
      "Yes; every CₙH₂ₙ formula proves a double bond":
        "A ring can have this formula without a double bond.",
      "No; it must be an open-chain alkane":
        "The ring does not satisfy the open-chain CₙH₂ₙ₊₂ formula.",
    },
    "Use the graph to distinguish a saturated ring from an open-chain alkene. The ring name is supplied; no ring-name recall is required.",
    "Composition and connectivity are different information.",
  ),
];
const guided: Task[] = [
  n(
    "g-kit",
    "Build methane",
    "Build methane. How many H atoms are attached?",
    "4",
    "H atoms",
    "Four C–H single bonds give CH₄; each hydrogen has one bond.",
    "Use the attachment controls, then inspect the bond inventory.",
    model(
      "kit",
      "Attach the individual H atoms and check each atom’s valence.",
    ),
  ),
  n(
    "g-formula",
    "Use the general formula",
    "Use the original four-carbon given. What is the hydrogen count in the next member, with five carbons?",
    "12",
    "H atoms",
    "Butane has ten H; the next member adds CH₂, so it has twelve H.",
    "Calculate 2 × 5 + 2.",
    model(
      "formula",
      "Choose n, construct the substitution, then predict the neighbouring member.",
    ),
  ),
  c(
    "g-classify",
    "Inspect actual bonds",
    "Which classification fits the original supplied propane graph?",
    "Saturated hydrocarbon in the open-chain alkane series",
    {
      "Unsaturated hydrocarbon": "The supplied C–C bonds are all single.",
      "Not a hydrocarbon": "The graph contains only carbon and hydrogen.",
    },
    "The supplied graph is C₃H₈, with only single bonds and no carbon ring.",
    "Count and inspect the original graph.",
    model(
      "classify",
      "Use the supplied atoms and bonds to justify the classification.",
    ),
  ),
  n(
    "g-equation",
    "Balance methane combustion",
    "Choose both complete-combustion products. With a fuel coefficient of 1, what O₂ coefficient balances CH₄ combustion?",
    "2",
    "O₂",
    "CH₄ + 2 O₂ → CO₂ + 2 H₂O. Four oxygen atoms require two O₂ molecules.",
    "Count oxygen in both CO₂ and H₂O.",
    model(
      "equation",
      "Choose product identities and balance all three elements.",
    ),
  ),
  n(
    "g-oxygen",
    "Construct one possible limited-oxygen balance",
    "Original inventory: 2 CH₄ and 3 O₂. In the stated model all eight H atoms form water. How many H₂O molecules are required?",
    "4",
    "H₂O",
    "Eight H atoms require four H₂O molecules; the remaining oxygen constrains the carbon-product allocation.",
    "Water has two H atoms.",
    model(
      "oxygen",
      "Construct any permitted allocation; distinguish a balance from a unique exhaust prediction.",
    ),
  ),
  c(
    "g-evidence",
    "Interpret actual analysis",
    "The original report positively identifies CO. What conclusion does this support?",
    "Incomplete combustion occurred",
    {
      "Every carbon atom formed CO₂":
        "The positive CO result contradicts that claim.",
      "The fuel contains no carbon": "CO contains carbon.",
    },
    "CO is an incompletely oxidised carbon product. This positive result supports incomplete combustion without specifying every product amount.",
    "Use the actual positive observation.",
    model(
      "evidence",
      "Choose a conclusion and evidence without inventing an unreported gas result.",
    ),
  ),
];
const practice: Task[] = [
  c(
    "p-methane-name",
    "Name CH₄",
    "What is the name of CH₄?",
    "Methane",
    {
      Ethane: "Ethane has two carbons.",
      Propane: "Propane has three carbons.",
    },
    "Methane is the one-carbon alkane.",
    "Recall the first member.",
  ),
  c(
    "p-ethane-name",
    "Name C₂H₆",
    "What is the name of C₂H₆?",
    "Ethane",
    { Methane: "Methane has one carbon.", Butane: "Butane has four carbons." },
    "Ethane has two carbons and six hydrogens.",
    "Recall the two-carbon member.",
  ),
  c(
    "p-propane-name",
    "Name C₃H₈",
    "What is the name of C₃H₈?",
    "Propane",
    { Ethane: "Ethane has two carbons.", Butane: "Butane has four carbons." },
    "Propane is the three-carbon member.",
    "Match the carbon subscript.",
  ),
  c(
    "p-butane-name",
    "Name C₄H₁₀",
    "What is the name of C₄H₁₀?",
    "Butane",
    {
      Propane: "Propane has three carbons.",
      Ethane: "Ethane has two carbons.",
    },
    "Butane has four carbons and ten hydrogens.",
    "Recall the fourth member.",
  ),
  drawing(
    "p-draw-methane",
    "methane",
    "CH₄: one carbon with four C–H single bonds.",
  ),
  drawing(
    "p-draw-ethane",
    "ethane",
    "C₂H₆: one C–C single bond; three H attached to each carbon.",
  ),
  drawing(
    "p-draw-propane",
    "propane",
    "C₃H₈: two C–C single bonds; three H on each end carbon and two on the middle carbon.",
  ),
  drawing(
    "p-draw-butane",
    "butane",
    "Straight-chain C₄H₁₀: three C–C single bonds; three H on each end and two on each middle carbon.",
  ),
  n(
    "p-end",
    "Complete an end carbon",
    "In the supplied ethane scaffold, an end carbon already has one C–C bond. How many H attachments complete it?",
    "3",
    "H atoms",
    "4 − 1 = 3 C–H bonds.",
    "Inspect one end carbon.",
    model(
      "kit",
      "Build both carbon valences, not just the total H count.",
      "ethane",
    ),
  ),
  n(
    "p-bonds",
    "Count every displayed bond",
    "How many total single covalent bonds are shown in a correct propane displayed structure?",
    "10",
    "bonds",
    "Eight C–H bonds + two C–C bonds = ten bonds. Counting carbon valences twice would double-count C–C connections.",
    "Count each drawn line once.",
    model(
      "kit",
      "Complete propane and count the actual connections.",
      "propane",
    ),
  ),
  n(
    "p-overbond",
    "Repair excessive attachment",
    "A middle carbon in straight-chain butane has two C–C bonds and three attached H atoms. How many H attachments must be removed to give four bonds?",
    "1",
    "H attachment",
    "2 + 3 = 5 bonds; remove one C–H attachment.",
    "Inspect that carbon’s local total.",
    model(
      "kit",
      "Keep the wrong proposal visible, then repair the specific carbon.",
      "butane",
    ),
  ),
  c(
    "p-methane-saturated",
    "Methane has no C–C bond",
    "Does methane belong to the saturated alkane series?",
    "Yes; it has no carbon–carbon multiple bonds",
    {
      "No; a C–C bond is compulsory":
        "Methane is the first alkane despite having only one carbon.",
      "No; CH₄ has too many hydrogens":
        "Four H atoms complete carbon’s four bonds.",
    },
    "Methane is CH₄ and is a saturated hydrocarbon.",
    "No C=C is present.",
  ),
  n(
    "p-formula-seven",
    "Apply a supplied unfamiliar size",
    "An open-chain alkane has seven carbon atoms. How many H atoms are in one molecule?",
    "16",
    "H atoms",
    "2 × 7 + 2 = 16, giving C₇H₁₆. The name is not needed.",
    "Apply 2n + 2.",
  ),
  n(
    "p-formula-eleven",
    "Apply the general formula",
    "An open-chain alkane has eleven carbon atoms. How many H atoms are in one molecule?",
    "24",
    "H atoms",
    "2 × 11 + 2 = 24, giving C₁₁H₂₄.",
    "Use the supplied carbon count.",
    model(
      "formula",
      "Apply the same formula beyond the first four members.",
      "unfamiliar",
    ),
  ),
  n(
    "p-inverse",
    "Infer carbon from hydrogen",
    "An open-chain alkane has eighteen H atoms per molecule. How many C atoms does it have?",
    "8",
    "C atoms",
    "(18 − 2) ÷ 2 = 8.",
    "Solve 2n + 2 = 18.",
  ),
  c(
    "p-series",
    "Homologous-series relationship",
    "Which describes alkane-series members?",
    "Same general formula, similar chemical properties and gradual physical-property changes",
    {
      "Identical boiling points":
        "Physical properties change gradually with size.",
      "Identical molecular formulas":
        "Each neighbouring member differs by CH₂.",
    },
    "All members follow CₙH₂ₙ₊₂; their shared bonding gives similar chemical behaviour.",
    "Separate general formula from a particular molecular formula.",
  ),
  c(
    "p-ethanol",
    "Carbon compound versus hydrocarbon",
    "The original supplied structure contains C, H and O. Is it a hydrocarbon?",
    "No, because oxygen is also present",
    {
      "Yes, because it contains carbon":
        "Carbon alone is insufficient for the hydrocarbon definition.",
      "Yes, because it contains hydrogen": "Only C and H are permitted.",
    },
    "The supplied ethanol graph is a carbon compound but not a hydrocarbon. Its name is supplied.",
    "Inspect every element shown.",
    model("classify", "Use actual atom labels to check composition.", "oxygen"),
  ),
  c(
    "p-double",
    "Inspect a double bond",
    "What makes the original supplied ethene graph unsaturated?",
    "Its carbon–carbon double bond",
    {
      "Its small carbon count": "Size does not define saturation.",
      "The presence of hydrogen":
        "Both saturated and unsaturated hydrocarbons contain hydrogen.",
    },
    "Two parallel lines between carbons denote C=C.",
    "Inspect the line multiplicity.",
    model("classify", "Classify from the supplied bonds.", "double"),
  ),
  c(
    "p-ring",
    "Single-bond ring counterexample",
    "The supplied C₄H₈ ring has only single bonds. Which conclusion is justified?",
    "It is saturated but outside the open-chain alkane formula",
    {
      "It must contain C=C because it is C₄H₈":
        "The actual supplied graph shows no C=C.",
      "It is an open-chain C₄H₁₀ alkane":
        "The graph contains a ring and eight H atoms.",
    },
    "Connectivity matters. The open-chain formula is not a rule for every saturated carbon structure.",
    "Inspect the ring, not only the subscripts.",
    model(
      "classify",
      "Test the formula shortcut against the supplied actual ring.",
      "ring",
    ),
  ),
  c(
    "p-branch",
    "A branch does not create unsaturation",
    "The supplied branched C₄H₁₀ structure has only single bonds and no ring. Does it belong to the open-chain alkane series?",
    "Yes; an open chain can be branched",
    {
      "No; any branch is a C=C bond":
        "Branching describes connectivity, not bond order.",
      "No; alkanes must be drawn in one straight line":
        "The series includes branched open-chain structures.",
    },
    "The supplied structure satisfies the open-chain formula and has no multiple C–C bond. No additional name recall is required.",
    "Check composition, bond order and absence of a ring.",
    model("classify", "Separate branching from double bonds.", "branch"),
  ),
  c(
    "p-products",
    "Track both fuel elements",
    "Complete combustion of C₆H₁₄ in sufficient O₂ produces which pair?",
    "CO₂ and H₂O",
    {
      "CO and H₂O": "CO is incompletely oxidised carbon.",
      "CO₂ and H₂": "Fuel hydrogen forms water in complete combustion.",
    },
    "Carbon forms carbon dioxide; hydrogen forms water.",
    "Track C and H separately.",
  ),
  n(
    "p-ethane-oxygen",
    "Balance an even-carbon fuel",
    "For 2 C₂H₆ → 4 CO₂ + 6 H₂O, how many O₂ molecules must be supplied?",
    "7",
    "O₂",
    "Products contain 8 + 6 = 14 O atoms; 14 ÷ 2 = 7 O₂.",
    "Count BOTH products’ oxygen.",
    model(
      "equation",
      "Choose complete products and balance the supplied ethane.",
      "ethane",
    ),
  ),
  n(
    "p-propane-water",
    "Hydrogen into water",
    "Complete combustion of one C₃H₈ molecule gives how many H₂O molecules?",
    "4",
    "H₂O",
    "Eight H atoms form four water molecules.",
    "Each water contains two H atoms.",
    model(
      "equation",
      "Check hydrogen before finishing the oxygen balance.",
      "propane",
    ),
  ),
  n(
    "p-butane-oxygen",
    "Balance butane without changing subscripts",
    "For complete combustion of 2 C₄H₁₀, what O₂ coefficient gives 8 CO₂ + 10 H₂O?",
    "13",
    "O₂",
    "16 + 10 = 26 O atoms; 26 ÷ 2 = 13 O₂.",
    "Keep C₄H₁₀ fixed.",
    model(
      "equation",
      "Balance whole formulas and inspect all three atom totals.",
      "butane",
    ),
  ),
  n(
    "p-nonane",
    "Balance a supplied larger formula",
    "For complete combustion of 1 C₉H₂₀, giving 9 CO₂ + 10 H₂O, what is the O₂ coefficient?",
    "14",
    "O₂",
    "18 + 10 = 28 oxygen atoms; 28 ÷ 2 = 14 O₂.",
    "Count oxygen in the water as well.",
    model(
      "equation",
      "Apply conservation to an unfamiliar supplied fuel.",
      "nonane",
    ),
  ),
  c(
    "p-multiple",
    "Valid balanced scale",
    "Which is a valid balanced complete-combustion equation?",
    "2 CH₄ + 4 O₂ → 2 CO₂ + 4 H₂O",
    {
      "2 CH₄ + 2 O₂ → 2 CO₂ + 4 H₂O":
        "The products contain eight O atoms but the reactants only four.",
      "CH₄ + O₂ → CO₂ + H₂O": "Hydrogen and oxygen counts are not balanced.",
    },
    "A balanced equation remains valid when every coefficient is multiplied by the same factor.",
    "Count all C, H and O atoms.",
  ),
  n(
    "p-limited-water",
    "Preserve hydrogen under limited oxygen",
    "In the stated simple model, 2 C₂H₆ use limited O₂ and all H is represented as water. How many H₂O molecules are needed?",
    "6",
    "H₂O",
    "Twelve H atoms form six H₂O molecules.",
    "Limited carbon oxidation does not remove hydrogen atoms.",
    model(
      "oxygen",
      "Construct a permitted limited-oxygen inventory.",
      "ethane",
    ),
  ),
  n(
    "p-unused",
    "Keep unused oxygen in the inventory",
    "Declared complete combustion: 2 CH₄ are supplied with 5 O₂. How many O₂ molecules remain unused?",
    "1",
    "O₂",
    "Complete combustion uses four O₂, leaving one of the original five.",
    "Compare the actual complete requirement with supply.",
    model(
      "oxygen",
      "Account for products AND unused original oxygen.",
      "excess",
    ),
  ),
  c(
    "p-alternative",
    "A balance does not prove a unique exhaust",
    "For 2 CH₄ + 3 O₂ in the stated all-H-to-water model, both 2 CO + 4 H₂O and CO₂ + C + 4 H₂O conserve atoms. What follows?",
    "The supplied atom balance permits more than one allocation",
    {
      "Every real flame must produce exactly 2 CO":
        "The alternative balanced allocation already disproves uniqueness within the stated model.",
      "Atoms need not be conserved":
        "Both allocations conserve the same atoms.",
    },
    "A possible balanced equation is not a unique prediction of real product composition.",
    "Check both allocations rather than assuming one canonical exhaust.",
  ),
  c(
    "p-soot",
    "Soot as a carbon product",
    "What is represented by soot in these supplied combustion balances?",
    "Solid carbon particles",
    {
      "Carbon monoxide molecules":
        "CO is a gas, not the solid carbon allotment.",
      "Water droplets": "Water contains no carbon.",
    },
    "Soot contains carbon particles formed during incomplete combustion. Real particulate mixtures can be more complex.",
    "Distinguish C from CO.",
  ),
  c(
    "p-water-not-proof",
    "Incomplete products can include water",
    "A report identifies CO₂ and H₂O but does not test for CO or particulates. What can be concluded?",
    "Those products alone do not establish complete combustion",
    {
      "Complete combustion is proved":
        "Additional incompletely oxidised carbon products were not excluded.",
      "Incomplete combustion is proved solely by water":
        "Water occurs in both complete and many incomplete combustion balances.",
    },
    "Two identified products do not establish an exhaustive product list.",
    "Consider what the analysis did NOT determine.",
    model(
      "evidence",
      "Keep the limits of the actual report visible.",
      "partial",
    ),
  ),
  c(
    "p-positive-soot",
    "Positive soot evidence",
    "A supplied analysis positively identifies carbon soot from the fuel. What does it support?",
    "Incomplete combustion",
    {
      "All carbon formed CO₂": "Some fuel carbon remains as solid particles.",
      "No carbon was present in the fuel": "Carbon particles contain carbon.",
    },
    "Positive identification of a reduced carbon product supports incomplete oxidation.",
    "Use the observed carbon product.",
    model(
      "evidence",
      "Base the conclusion on the supplied positive evidence.",
      "soot",
    ),
  ),
  c(
    "p-co-detection",
    "Colour and smell",
    "Why can appearance or smell fail to warn of CO?",
    "CO is colourless and odourless",
    {
      "CO is always visibly black":
        "Black soot and colourless CO are different substances.",
      "CO has a strong warning smell": "CO is odourless.",
    },
    "Use actual appropriate analysis; the absence of colour or smell is not evidence of absent CO.",
    "Recall the properties of CO.",
    model(
      "evidence",
      "Avoid turning sensory appearance into a gas measurement.",
      "appearance",
    ),
  ),
  w(
    "p-co-written",
    "Explain CO toxicity",
    "Explain why CO produced in incomplete combustion is dangerous, including why it may not be noticed.",
    "CO binds haemoglobin and reduces oxygen carriage. It is colourless and odourless, so appearance and smell do not reliably warn of its presence.",
    [
      "Links CO to haemoglobin binding.",
      "Explains reduced oxygen carriage in blood.",
      "States colourless and odourless; does not claim a warning smell.",
    ],
    "Link its molecular effect to oxygen transport; then explain detection limits.",
  ),
  w(
    "p-energy-written",
    "Explain the overall energy change",
    "Combustion requires energy to break reactant bonds. Explain why it can still heat the surroundings.",
    "Breaking reactant bonds requires energy; forming product bonds releases energy. In an exothermic combustion reaction, the energy released by bond formation exceeds the energy required by bond breaking, transferring energy to the surroundings.",
    [
      "Bond breaking requires energy.",
      "Bond formation releases energy.",
      "Compares their amounts and links the excess release to the surroundings.",
    ],
    "Compare both bond-energy contributions rather than saying breaking bonds releases energy.",
  ),
  w(
    "p-model-written",
    "Evaluate the simplified oxygen model",
    "Explain one useful feature and one limitation of the supplied CO₂/CO/soot atom-balance model.",
    "It preserves the original C, H and O inventory and includes unused O₂. It does not predict a unique real exhaust: it assumes all hydrogen forms water and allocates carbon among only three represented products, whereas real flames can also contain unburned fuel and other species.",
    [
      "States conservation or explicit unused-O₂ accounting as a useful feature.",
      "Identifies a stated model assumption.",
      "Does not claim that a valid balance uniquely predicts real exhaust.",
    ],
    "Separate atom bookkeeping from experimental product prediction.",
  ),
];
const checkForms: Task[][] = [
  [
    c(
      "a-name",
      "Recall the two-carbon member",
      "Which formula is ethane?",
      "C₂H₆",
      { "C₃H₈": "That is propane.", "C₂H₄": "That is not an alkane formula." },
      "Ethane has two carbon atoms and six hydrogen atoms.",
      "Use first-four recall.",
    ),
    n(
      "a-formula",
      "Apply the series formula",
      "An open-chain alkane has nine C atoms. How many H atoms are in one molecule?",
      "20",
      "H atoms",
      "2 × 9 + 2 = 20.",
      "Use 2n + 2.",
    ),
    drawing(
      "a-draw",
      "propane",
      "C₃H₈: three carbons in an open chain, two C–C bonds, three H on each end and two on the middle carbon.",
    ),
    c(
      "a-bonds",
      "Saturation criterion",
      "What excludes an open-chain hydrocarbon from the alkane series?",
      "A carbon–carbon double bond",
      {
        "A branch with only single bonds":
          "Branching is compatible with alkanes.",
        "A single C–C bond": "Single C–C bonds occur in alkanes.",
      },
      "Alkanes contain no C–C multiple bond.",
      "Use the bond definition.",
    ),
    n(
      "a-balance",
      "Oxygen coefficient from fixed fuel scale",
      "Complete combustion of 1 C₇H₁₆ gives 7 CO₂ + 8 H₂O. What O₂ coefficient balances the equation?",
      "11",
      "O₂",
      "14 + 8 = 22 O atoms; 22 ÷ 2 = 11 O₂.",
      "Count both products.",
    ),
    c(
      "a-limited",
      "Limited-oxygen products",
      "Which product positively supports incomplete hydrocarbon combustion?",
      "Carbon monoxide",
      {
        "Water alone": "Water can also be a complete-combustion product.",
        "Carbon dioxide alone":
          "It can appear alongside incomplete-combustion products.",
      },
      "CO is incompletely oxidised carbon.",
      "Choose positive evidence of incomplete oxidation.",
    ),
    n(
      "a-unused",
      "Unused oxygen in complete combustion",
      "Declared complete combustion of 1 C₃H₈ is supplied with 7 O₂ molecules. How many O₂ molecules are left?",
      "2",
      "O₂",
      "C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O; 7 − 5 = 2.",
      "Calculate the actual complete requirement first.",
    ),
    w(
      "a-explain",
      "Explain an evidence limit",
      "A report lists CO₂ and H₂O but contains no CO measurement. Explain why it does not by itself prove complete combustion.",
      "Those products can be present during incomplete combustion too. The report does not exclude CO, soot or other carbon-containing products; an exhaustive analysis or stated full carbon account is needed for the complete-product conclusion.",
      [
        "States that CO₂/water can coexist with incomplete products.",
        "Identifies missing evidence rather than inventing a negative CO result.",
        "Explains why the product list is not necessarily exhaustive.",
      ],
      "Distinguish a reported observation from a complete analysis.",
    ),
  ],
  [
    c(
      "b-name",
      "Recall the four-carbon member",
      "Which name belongs to C₄H₁₀?",
      "Butane",
      {
        Propane: "Propane has three carbons.",
        Ethane: "Ethane has two carbons.",
      },
      "Butane is the four-carbon alkane.",
      "Use first-four recall.",
    ),
    n(
      "b-formula",
      "Recover a carbon count",
      "An open-chain alkane contains 22 H atoms per molecule. How many C atoms does it contain?",
      "10",
      "C atoms",
      "(22 − 2) ÷ 2 = 10.",
      "Rearrange 2n + 2.",
    ),
    drawing(
      "b-draw",
      "ethane",
      "C₂H₆: two carbons joined by one single bond; each carbon has three C–H bonds.",
    ),
    c(
      "b-bonds",
      "Branching and saturation",
      "A supplied open-chain hydrocarbon is branched and has only single bonds. What follows?",
      "Branching does not exclude it from the alkane series",
      {
        "Every branch is a double bond": "Connectivity and bond order differ.",
        "It must contain oxygen": "A branch supplies no new element.",
      },
      "Open-chain alkanes can have branches; they remain saturated.",
      "Inspect bond types and composition.",
    ),
    n(
      "b-balance",
      "Oxygen coefficient at a specified whole-number scale",
      "Complete combustion of 2 C₆H₁₄ gives 12 CO₂ + 14 H₂O. What O₂ coefficient balances the equation?",
      "19",
      "O₂",
      "24 + 14 = 38 O atoms; 38 ÷ 2 = 19 O₂.",
      "Keep the supplied fuel scale of two.",
    ),
    c(
      "b-limited",
      "Soot evidence",
      "Carbon particles from the fuel are positively identified. Which conclusion is supported?",
      "Incomplete combustion",
      {
        "All fuel carbon formed CO₂": "The carbon particles contradict this.",
        "The fuel contained no carbon":
          "The observed particles contain carbon.",
      },
      "Soot is incompletely oxidised fuel carbon.",
      "Use the positive observation.",
    ),
    n(
      "b-unused",
      "Original supply and unused oxygen",
      "Declared complete combustion of 2 C₂H₆ is supplied with 9 O₂ molecules. How many O₂ molecules remain?",
      "2",
      "O₂",
      "2 C₂H₆ uses 7 O₂, leaving 9 − 7 = 2.",
      "Count oxygen required by four CO₂ and six H₂O.",
    ),
    w(
      "b-explain",
      "Explain CO harm and detection limits",
      "Explain why CO is dangerous and why absence of a smell does not establish its absence.",
      "CO binds haemoglobin and reduces the blood’s oxygen carriage. It is colourless and odourless, so there is no reliable smell warning.",
      [
        "Links CO to haemoglobin binding.",
        "Explains reduced oxygen carriage.",
        "States odourless and does not treat absent smell as a negative measurement.",
      ],
      "Link blood transport and CO properties.",
    ),
  ],
];
const reviewForms: Task[][] = [
  [
    n(
      "ra-formula",
      "Retrieve the general formula",
      "An open-chain alkane has twelve carbon atoms per molecule. How many H atoms?",
      "26",
      "H atoms",
      "2 × 12 + 2 = 26.",
      "Use the same general rule at the new size.",
    ),
    n(
      "ra-balance",
      "Retrieve atom conservation",
      "With fuel coefficient 1, complete combustion of C₅H₁₂ gives 5 CO₂ and 6 H₂O. What O₂ coefficient is needed?",
      "8",
      "O₂",
      "10 + 6 = 16 oxygen atoms; 16 ÷ 2 = 8 O₂.",
      "Include oxygen in water.",
    ),
    w(
      "ra-evidence",
      "Retrieve the incomplete-product explanation",
      "Explain why positively identified CO supports incomplete combustion, without claiming CO is the only exhaust product.",
      "CO contains carbon that has not been fully oxidised to CO₂. Its positive identification therefore supports incomplete combustion. Other gases, water, soot or unburned fuel can also be present; the observation does not supply their quantities.",
      [
        "Links CO to incomplete carbon oxidation.",
        "Uses the positive observation.",
        "Avoids an unsupported exclusive-product or quantitative claim.",
      ],
      "State what is supported and where the evidence stops.",
    ),
  ],
  [
    c(
      "rb-series",
      "Retrieve homologous-series features",
      "How do neighbouring open-chain alkane formulas differ?",
      "By CH₂",
      {
        "By H₂ only": "The next member also adds one carbon.",
        "By O₂": "The series contains carbon and hydrogen only.",
      },
      "Neighbouring members add one carbon and two hydrogens.",
      "Compare the first-four formulas.",
    ),
    n(
      "rb-valence",
      "Retrieve local bond counting",
      "An end carbon in an open-chain alkane has one C–C single bond. How many C–H bonds complete its normal valence?",
      "3",
      "bonds",
      "Four total bonds minus one existing C–C bond leaves three.",
      "Count the carbon locally.",
    ),
    w(
      "rb-energy",
      "Retrieve combustion energy",
      "Explain why breaking fuel bonds is not itself the source of released combustion energy.",
      "Bond breaking requires energy. Forming product bonds releases energy; overall combustion is exothermic when that release exceeds the energy required to break reactant bonds.",
      [
        "States breaking bonds requires energy.",
        "States forming bonds releases energy.",
        "Compares the amounts for an overall exothermic reaction.",
      ],
      "Consider breaking and forming separately.",
    ),
  ],
];
const recovery: Record<string, string[]> = {
  "p-methane-name": ["r-names"],
  "p-ethane-name": ["r-names"],
  "p-propane-name": ["r-names"],
  "p-butane-name": ["r-names"],
  "p-draw-methane": ["r-names", "r-carbon", "r-hydrogen"],
  "p-draw-ethane": ["r-names", "r-carbon", "r-hydrogen"],
  "p-draw-propane": ["r-names", "r-middle", "r-hydrogen"],
  "p-draw-butane": ["r-names", "r-middle", "r-hydrogen"],
  "p-end": ["r-carbon", "r-hydrogen"],
  "p-bonds": ["r-carbon", "r-middle"],
  "p-overbond": ["r-carbon", "r-middle"],
  "p-methane-saturated": ["r-saturation"],
  "p-formula-seven": ["r-formula"],
  "p-formula-eleven": ["r-formula"],
  "p-inverse": ["r-inverse"],
  "p-series": ["r-series"],
  "p-ethanol": ["r-elements"],
  "p-double": ["r-saturation"],
  "p-ring": ["r-graph"],
  "p-branch": ["r-graph", "r-saturation"],
  "p-products": ["r-products"],
  "p-ethane-oxygen": ["r-product-oxygen", "r-coefficient"],
  "p-propane-water": ["r-products", "r-coefficient"],
  "p-butane-oxygen": ["r-product-oxygen", "r-subscript"],
  "p-nonane": ["r-product-oxygen"],
  "p-multiple": ["r-coefficient", "r-subscript"],
  "p-limited-water": ["r-limited", "r-coefficient"],
  "p-unused": ["r-products", "r-product-oxygen"],
  "p-alternative": ["r-limited"],
  "p-soot": ["r-limited"],
  "p-water-not-proof": ["r-evidence", "r-limited"],
  "p-positive-soot": ["r-limited"],
  "p-co-detection": ["r-co", "r-evidence"],
  "p-co-written": ["r-co"],
  "p-energy-written": ["r-energy"],
  "p-model-written": ["r-limited", "r-coefficient"],
};
for (const t of practice)
  t.followUp = "alk-v1-" + recovery[t.id.replace("alk-v1-", "")][0];
const families: Record<string, string[]> = {
  identity: [
    "w-hydrocarbon",
    "r-elements",
    "r-names",
    "p-methane-name",
    "p-ethane-name",
    "p-propane-name",
    "p-butane-name",
    "p-ethanol",
    "a-name",
    "b-name",
  ],
  structure: [
    "r-carbon",
    "r-hydrogen",
    "r-middle",
    "g-kit",
    "p-draw-methane",
    "p-draw-ethane",
    "p-draw-propane",
    "p-draw-butane",
    "p-end",
    "p-bonds",
    "p-overbond",
    "a-draw",
    "b-draw",
    "rb-valence",
  ],
  formula: [
    "r-formula",
    "r-inverse",
    "g-formula",
    "p-formula-seven",
    "p-formula-eleven",
    "p-inverse",
    "a-formula",
    "b-formula",
    "ra-formula",
  ],
  saturation: [
    "r-saturation",
    "r-graph",
    "g-classify",
    "p-methane-saturated",
    "p-double",
    "p-ring",
    "p-branch",
    "a-bonds",
    "b-bonds",
  ],
  series: ["r-series", "g-formula", "p-series", "rb-series"],
  products: ["r-products", "g-equation", "p-products", "p-propane-water"],
  balance: [
    "w-oxygen",
    "r-coefficient",
    "r-product-oxygen",
    "r-subscript",
    "g-equation",
    "p-ethane-oxygen",
    "p-propane-water",
    "p-butane-oxygen",
    "p-nonane",
    "p-multiple",
    "a-balance",
    "b-balance",
    "ra-balance",
  ],
  limited: [
    "r-limited",
    "g-oxygen",
    "p-limited-water",
    "p-unused",
    "p-alternative",
    "p-soot",
    "p-model-written",
    "a-limited",
    "b-limited",
    "a-unused",
    "b-unused",
    "ra-evidence",
  ],
  evidence: [
    "r-evidence",
    "g-evidence",
    "p-water-not-proof",
    "p-positive-soot",
    "p-co-detection",
    "a-explain",
    "ra-evidence",
  ],
  co: ["r-co", "g-evidence", "p-co-detection", "p-co-written", "b-explain"],
  energy: ["r-energy", "p-energy-written", "rb-energy"],
};
const all = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
for (const ids of Object.values(families)) {
  const aliases = ids.map((x) => "alk-v1-" + x);
  for (const t of all)
    if (aliases.includes(t.id))
      t.exposureAliases = [
        ...new Set([
          ...(t.exposureAliases ?? []),
          ...aliases.filter((x) => x !== t.id),
        ]),
      ];
}
export const alkanesJourney: LessonJourney = {
  version: 1,
  introduction:
    "Build and interpret alkane structures, apply the homologous-series formula, then account for atoms, products, evidence and energy in combustion.",
  scopeNote:
    "Foundation/shared core with a supplied balanced larger-fuel equation. Actual AQA8462 4.7.1.1/3 and atmospheric-pollutant sections, Trilogy parallels and limited Pearson8.6–10/9.10C–11C/16C reviewed, alongside genuine2022F Q02.6–8 and2022H Q04.3 with paired mark schemes. Recall the first four alkane names/formulas; unfamiliar extension names and ring/branch structures are supplied. Pearson first-four displayed structures are a separate-Chemistry requirement; AQA includes recognition and models. Structure and written responses are self-reviewed without automatic examiner marks. The oxygen activity is a stated atom-balance model, not a prediction of unique real exhaust. Full Pearson/OCR coverage, whole-course Maths parity and exam readiness remain unfinished.",
  outcomes: [
    "Recall methane, ethane, propane and butane names and formulas, and construct every bond.",
    "Apply CₙH₂ₙ₊₂ and explain homologous-series relationships.",
    "Distinguish hydrocarbon composition, saturated bonds, branches and supplied rings.",
    "Choose both complete-combustion products and balance coefficients without altering subscripts.",
    "Account for limited and unused oxygen without claiming a unique exhaust mixture.",
    "Use actual supplied evidence and explain CO toxicity and combustion energy.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
};
extendAlkaneEquationWriting(alkanesJourney);
export const alkaneRecovery = recovery;
export const alkaneExposureFamilies = families;
export { warmup, refresher, guided, practice, checkForms, reviewForms };
