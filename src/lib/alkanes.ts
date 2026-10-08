export type AlkaneMode =
  "kit" | "formula" | "classify" | "equation" | "oxygen" | "evidence";
export type KitRecord = {
  title: string;
  n: number;
  name: string;
  note: string;
};
export const alkaneKits: Record<string, KitRecord> = {
  initial: {
    title: "Methane: one carbon",
    n: 1,
    name: "methane",
    note: "Build methane by attaching hydrogen atoms. A neutral carbon has four covalent bonds; each hydrogen has one. The first four alkane names and formulas are required.",
  },
  ethane: {
    title: "Ethane: two carbons",
    n: 2,
    name: "ethane",
    note: "The supplied carbon scaffold contains one C–C single bond. Complete the hydrogen attachments without giving a carbon more than four bonds.",
  },
  propane: {
    title: "Propane: three carbons",
    n: 3,
    name: "propane",
    note: "Count each carbon's existing C–C bonds before completing its hydrogen attachments. The middle and end carbons differ.",
  },
  butane: {
    title: "Butane: four carbons",
    n: 4,
    name: "butane",
    note: "Construct the supplied straight-chain butane structure, showing every C–H bond as well as the three C–C single bonds.",
  },
  pentane: {
    title: "Supplied extension: pentane",
    n: 5,
    name: "pentane",
    note: "The name pentane is supplied for this five-carbon extension. AQA requires recall of only the first four specific alkane names; apply the bonding rule to this unfamiliar size.",
  },
  hexane: {
    title: "Supplied extension: hexane",
    n: 6,
    name: "hexane",
    note: "The name hexane is supplied. The same carbon/hydrogen bonding rules apply; use the diagram's horizontal scroll area if needed rather than shrinking its labels.",
  },
};
export type FormulaRecord = {
  title: string;
  n: number;
  given: "carbon" | "hydrogen";
  name: string;
  note: string;
};
export const alkaneFormulae: Record<string, FormulaRecord> = {
  initial: {
    title: "Butane from four carbons",
    n: 4,
    given: "carbon",
    name: "butane",
    note: "Use the supplied carbon count in CₙH₂ₙ₊₂. Choose n, construct 2n and then the total hydrogen count. Compare the next member's additional CH₂.",
  },
  methane: {
    title: "Methane, including no C–C bond",
    n: 1,
    given: "carbon",
    name: "methane",
    note: "Methane is still a saturated alkane even though it has no C–C bond. Its carbon has four C–H single bonds.",
  },
  ethane: {
    title: "Ethane from two carbons",
    n: 2,
    given: "carbon",
    name: "ethane",
    note: "The subscript n counts carbon atoms in ONE molecule. 2n + 2 counts its hydrogen atoms; it is not the number of molecules.",
  },
  propane: {
    title: "Propane from three carbons",
    n: 3,
    given: "carbon",
    name: "propane",
    note: "Use multiplication before adding the terminal contribution of two. The name propane belongs to the three-carbon member.",
  },
  inverse: {
    title: "Fourteen hydrogens: recover n",
    n: 6,
    given: "hydrogen",
    name: "hexane",
    note: "The hydrogen count is supplied instead of the carbon count. Recover n from 2n + 2. The extension name hexane is supplied; no additional name recall is assumed.",
  },
  unfamiliar: {
    title: "Eleven-carbon supplied extension",
    n: 11,
    given: "carbon",
    name: "undecane",
    note: "The name undecane is supplied for this unfamiliar carbon count. Apply the general formula and neighbouring-member change, rather than guessing a memorised formula.",
  },
};
export type GraphAtom = { element: "C" | "H" | "O"; x: number; y: number };
export type GraphBond = [number, number, 1 | 2];
export type SuppliedGraph = {
  title: string;
  atoms: GraphAtom[];
  bonds: GraphBond[];
  reasons: string[];
  note: string;
};
function graph(
  title: string,
  heavy: GraphAtom[],
  bonds: GraphBond[],
  hydrogens: [number, number, number][],
  reasons: string[],
  note: string,
): SuppliedGraph {
  const atoms = heavy.slice(),
    edges = bonds.slice();
  for (const [carbon, x, y] of hydrogens) {
    edges.push([carbon, atoms.length, 1]);
    atoms.push({ element: "H", x, y });
  }
  return { title, atoms, bonds: edges, reasons, note };
}
export const alkaneGraphs: Record<string, SuppliedGraph> = {
  initial: graph(
    "Supplied propane graph",
    [
      { element: "C", x: 90, y: 180 },
      { element: "C", x: 200, y: 180 },
      { element: "C", x: 310, y: 180 },
    ],
    [
      [0, 1, 1],
      [1, 2, 1],
    ],
    [
      [0, 35, 180],
      [0, 90, 100],
      [0, 90, 260],
      [1, 200, 100],
      [1, 200, 260],
      [2, 365, 180],
      [2, 310, 100],
      [2, 310, 260],
    ],
    ["singleOpen"],
    "Every line shown is a covalent bond. Count all labelled atoms and inspect the C–C bonds before classifying the supplied molecule. The planar drawing does not assert planar geometry.",
  ),
  double: graph(
    "Supplied ethene graph",
    [
      { element: "C", x: 140, y: 180 },
      { element: "C", x: 260, y: 180 },
    ],
    [[0, 1, 2]],
    [
      [0, 140, 100],
      [0, 140, 260],
      [1, 260, 100],
      [1, 260, 260],
    ],
    ["multipleCarbon"],
    "The two parallel lines between the carbon atoms represent one C=C double bond, not two separate single bonds between different atoms. Its name is supplied; detailed alkene reactions follow separately.",
  ),
  oxygen: graph(
    "Supplied oxygen-containing molecule",
    [
      { element: "C", x: 90, y: 180 },
      { element: "C", x: 200, y: 180 },
      { element: "O", x: 310, y: 180 },
    ],
    [
      [0, 1, 1],
      [1, 2, 1],
    ],
    [
      [0, 35, 180],
      [0, 90, 100],
      [0, 90, 260],
      [1, 200, 100],
      [1, 200, 260],
      [2, 365, 180],
    ],
    ["otherElement"],
    "The supplied molecule also contains oxygen. Carbon and hydrogen being present does not mean that those are the ONLY elements.",
  ),
  ring: graph(
    "Provided all-single-bond ring",
    [
      { element: "C", x: 120, y: 100 },
      { element: "C", x: 280, y: 100 },
      { element: "C", x: 280, y: 260 },
      { element: "C", x: 120, y: 260 },
    ],
    [
      [0, 1, 1],
      [1, 2, 1],
      [2, 3, 1],
      [3, 0, 1],
    ],
    [
      [0, 50, 100],
      [0, 120, 35],
      [1, 350, 100],
      [1, 280, 35],
      [2, 350, 260],
      [2, 280, 325],
      [3, 50, 260],
      [3, 120, 325],
    ],
    ["ring"],
    "This additional supplied example is a saturated cyclic hydrocarbon. Its all-single-bond ring changes the formula relative to the OPEN-CHAIN alkane series. CₙH₂ₙ alone does not prove that a molecule has a C=C bond; no cyclic-compound naming is required.",
  ),
  branch: graph(
    "Provided branched C₄H₁₀",
    [
      { element: "C", x: 200, y: 180 },
      { element: "C", x: 90, y: 180 },
      { element: "C", x: 310, y: 180 },
      { element: "C", x: 200, y: 80 },
    ],
    [
      [0, 1, 1],
      [0, 2, 1],
      [0, 3, 1],
    ],
    [
      [0, 200, 260],
      [1, 35, 180],
      [1, 90, 100],
      [1, 90, 260],
      [2, 365, 180],
      [2, 310, 100],
      [2, 310, 260],
      [3, 200, 25],
      [3, 140, 65],
      [3, 260, 65],
    ],
    ["branchAllowed", "singleOpen"],
    "This supplied branched structure is still an acyclic alkane. Open-chain means no ring, not necessarily a straight unbranched drawing. No extra isomer name is required.",
  ),
  hydrogen: graph(
    "Supplied hydrogen-only molecule",
    [
      { element: "H", x: 140, y: 180 },
      { element: "H", x: 260, y: 180 },
    ],
    [[0, 1, 1]],
    [],
    ["noCarbon"],
    "A hydrocarbon requires both carbon and hydrogen, with no other elements. This supplied molecule contains hydrogen but no carbon.",
  ),
};
export function graphFacts(g: SuppliedGraph) {
  const carbons = g.atoms.filter((a) => a.element === "C").length,
    hydrogens = g.atoms.filter((a) => a.element === "H").length;
  const carbonBonds = g.bonds.filter(
    ([a, b]) => g.atoms[a].element === "C" && g.atoms[b].element === "C",
  );
  const hydrocarbon =
    carbons > 0 &&
    hydrogens > 0 &&
    g.atoms.every((a) => a.element === "C" || a.element === "H");
  const multiple = carbonBonds.filter(([, , order]) => order === 2).length;
  const visited = new Set<number>();
  let cyclic = false;
  function visit(i: number, parent: number) {
    visited.add(i);
    for (const [a, b] of carbonBonds) {
      const next = a === i ? b : b === i ? a : -1;
      if (next < 0 || next === parent) continue;
      if (visited.has(next)) cyclic = true;
      else visit(next, i);
    }
  }
  for (let i = 0; i < g.atoms.length; i++)
    if (g.atoms[i].element === "C" && !visited.has(i)) visit(i, -1);
  return {
    carbons,
    hydrogens,
    multiple,
    hydrocarbon,
    cyclic,
    saturated: hydrocarbon && multiple === 0,
    openAlkane:
      hydrocarbon && multiple === 0 && !cyclic && hydrogens === 2 * carbons + 2,
  };
}
export type EquationRecord = { title: string; n: number; note: string };
export const alkaneEquations: Record<string, EquationRecord> = {
  initial: {
    title: "Complete combustion of methane",
    n: 1,
    note: "Choose BOTH products of complete hydrocarbon combustion, then balance the original methane formula. Subscripts stay fixed. Positive whole-number balanced multiples are valid.",
  },
  ethane: {
    title: "Complete combustion of ethane",
    n: 2,
    note: "A whole-number equation may require more than one fuel molecule. Change coefficients, not the fixed ethane formula.",
  },
  propane: {
    title: "Complete combustion of propane",
    n: 3,
    note: "Track carbon and hydrogen into their fully oxidised products, then count the oxygen atoms needed in BOTH products.",
  },
  butane: {
    title: "Complete combustion of butane",
    n: 4,
    note: "Oxygen is diatomic O₂. Balance whole molecules using the supplied formula; an O atom is not one O₂ molecule.",
  },
  pentane: {
    title: "Given C₅H₁₂",
    n: 5,
    note: "The unfamiliar fuel formula is supplied. A complete equation requires product identities as well as correct coefficients.",
  },
  nonane: {
    title: "Given C₉H₂₀",
    n: 9,
    note: "Apply conservation to the supplied larger formula. The genuine AQA Higher example accepts balanced multiples; the app follows that principle rather than treating only one scale as chemically valid.",
  },
};
export function completeRatio(n: number) {
  const fuel = n % 2 ? 1 : 2;
  return {
    fuel,
    oxygen: (fuel * (3 * n + 1)) / 2,
    carbon: fuel * n,
    water: fuel * (n + 1),
  };
}
export type OxygenRecord = {
  title: string;
  n: number;
  fuel: number;
  available: number;
  condition: "limited" | "complete";
  example: [number, number, number, number, number, number];
  note: string;
};
export const alkaneOxygen: Record<string, OxygenRecord> = {
  initial: {
    title: "Two methane molecules, three O₂",
    n: 1,
    fuel: 2,
    available: 3,
    condition: "limited",
    example: [0, 2, 0, 4, 3, 0],
    note: "Construct ANY atom-balanced permitted carbon-product allocation within the supplied oxygen inventory. In this stated teaching model all fuel hydrogen is represented as water; oxygen alone does not uniquely determine the CO₂/CO/soot mixture.",
  },
  propane: {
    title: "Propane with four O₂",
    n: 3,
    fuel: 1,
    available: 4,
    condition: "limited",
    example: [1, 2, 0, 4, 4, 0],
    note: "The supplied oxygen is below the complete-combustion requirement. More than one carbon allocation can satisfy the stated simple balance; real flames may contain additional products and unburned fuel.",
  },
  ethane: {
    title: "Two ethane molecules, six O₂",
    n: 2,
    fuel: 2,
    available: 6,
    condition: "limited",
    example: [2, 2, 0, 6, 6, 0],
    note: "Preserve both original ethane molecules' carbon and hydrogen. CO₂, CO and solid carbon counts can be mixed when the stated oxygen balance permits it.",
  },
  soot: {
    title: "Hydrogen-to-water boundary",
    n: 1,
    fuel: 2,
    available: 2,
    condition: "limited",
    example: [0, 0, 2, 4, 2, 0],
    note: "For this PARTICULAR simple model, converting all hydrogen to water uses all supplied oxygen. Construct the remaining carbon inventory. This is an atom-balance example, not a claim that a real burner produces only these substances.",
  },
  butane: {
    title: "Two butane molecules, eleven O₂",
    n: 4,
    fuel: 2,
    available: 11,
    condition: "limited",
    example: [4, 4, 0, 10, 11, 0],
    note: "Use the supplied whole-entity inventory, not one fuel molecule by habit. Count oxygen in both carbon products and water. Balanced alternative mixtures remain valid.",
  },
  excess: {
    title: "Declared complete combustion with excess O₂",
    n: 1,
    fuel: 2,
    available: 5,
    condition: "complete",
    example: [2, 0, 0, 4, 4, 1],
    note: "This record explicitly states COMPLETE combustion with adequate oxygen. All fuel carbon is represented as CO₂; calculate used and unused O₂ separately. Available oxygen need not all be consumed.",
  },
};
export type EvidenceRecord = {
  title: string;
  observations: string[];
  conclusion: "incomplete" | "complete" | "insufficient";
  evidence: string;
  limitation: string;
  note: string;
};
export const alkaneEvidence: Record<string, EvidenceRecord> = {
  initial: {
    title: "Positive CO report",
    observations: [
      "A supplied analysis detects CO in the exhaust.",
      "CO₂ and water are also reported.",
      "These are supplied observations from a supervised analysis.",
    ],
    conclusion: "incomplete",
    evidence: "coPositive",
    limitation: "noSmellTest",
    note: "CO is colourless and odourless. Positive CO evidence supports incomplete combustion; the presence of CO₂ and water does not cancel that evidence.",
  },
  soot: {
    title: "Carbon particulate report",
    observations: [
      "The supplied report identifies solid carbon particles in the exhaust.",
      "Some CO₂ is also detected.",
      "CO was not tested.",
    ],
    conclusion: "incomplete",
    evidence: "carbonPositive",
    limitation: "coUnknown",
    note: "Identified carbon soot supports incomplete combustion. The report does not establish whether CO is present or absent.",
  },
  partial: {
    title: "Only two products were reported",
    observations: [
      "CO₂ and water are reported.",
      "No CO result or particulate analysis is supplied.",
      "No complete carbon balance is given.",
    ],
    conclusion: "insufficient",
    evidence: "partialProducts",
    limitation: "othersNotExcluded",
    note: "These products can be present alongside incomplete-combustion products. An incomplete report does not prove complete combustion.",
  },
  accounted: {
    title: "Declared full carbon balance",
    observations: [
      "The supplied complete analysis accounts for ALL fuel carbon in CO₂.",
      "All fuel hydrogen is represented in water.",
      "Under the stated analysis, no fuel carbon remains in CO, soot or unburned fuel.",
    ],
    conclusion: "complete",
    evidence: "allCarbonCo2",
    limitation: "statedAnalysis",
    note: "The full supplied carbon account supports the stated conclusion. This is stronger evidence than simply seeing a blue flame or reporting two products.",
  },
  flame: {
    title: "Flame colour only",
    observations: [
      "Only a blue flame is reported.",
      "No gas analysis or carbon balance is supplied.",
      "No CO/particulate measurement is given.",
    ],
    conclusion: "insufficient",
    evidence: "flameOnly",
    limitation: "notGasAnalysis",
    note: "A flame observation is not a complete gas analysis or proof that CO is absent. Do not invent a measured product composition.",
  },
  appearance: {
    title: "No smell or colour reported",
    observations: [
      "The supplied exhaust observation says no obvious smell or colour.",
      "There is no CO test result.",
      "No carbon-product inventory is supplied.",
    ],
    conclusion: "insufficient",
    evidence: "appearanceOnly",
    limitation: "noSmellTest",
    note: "CO can be present without a detectable smell or colour. Its binding to haemoglobin reduces oxygen carriage; appearance is not a safety test.",
  },
};
export const alkaneRecords: Record<
  AlkaneMode,
  Record<string, { title: string }>
> = {
  kit: alkaneKits,
  formula: alkaneFormulae,
  classify: alkaneGraphs,
  equation: alkaneEquations,
  oxygen: alkaneOxygen,
  evidence: alkaneEvidence,
};
export const attachmentNames = ["upper", "lower", "left", "right"] as const;
export function attachmentRequired(n: number, c: number, slot: number) {
  return slot < 2 || (slot === 2 && c === 0) || (slot === 3 && c === n - 1);
}
export const alkaneHydrogens = (n: number) => 2 * n + 2;
export function subscript(n: number) {
  return String(n).replace(/\d/g, (x) => "₀₁₂₃₄₅₆₇₈₉"[Number(x)]);
}
export function alkaneFormula(n: number) {
  return (
    (n === 1 ? "C" : "C" + subscript(n)) + "H" + subscript(alkaneHydrogens(n))
  );
}
