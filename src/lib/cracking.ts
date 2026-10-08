export type CrackingMode =
  "rearrange" | "structure" | "balance" | "bromine" | "process";
export const subscript = (n: number) =>
  String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]);
export const hydrocarbon = (c: number, h: number) =>
  (c === 1 ? "C" : "C" + subscript(c)) +
  (h ? "H" + (h === 1 ? "" : subscript(h)) : "");
export type Rearrangement = {
  title: string;
  n: number;
  k: number;
  note: string;
};
export const rearrangements: Record<string, Rearrangement> = {
  initial: {
    title: "Six-carbon feed: supplied four-carbon alkane",
    n: 6,
    k: 4,
    note: "Compare C₆H₁₄ with the requested C₄H₁₀ + C₂H₄ pair. This is one possible net cracking balance, not a unique prediction of industrial product mixtures or an actual reaction mechanism.",
  },
  decane: {
    title: "Ten-carbon feed: supplied eight-carbon alkane",
    n: 10,
    k: 8,
    note: "Original C₁₀H₂₂; requested alkane product C₈H₁₈. Choose a cut, then compare complete before/after structures while following the same atoms.",
  },
  octane: {
    title: "Eight-carbon feed: supplied five-carbon alkane",
    n: 8,
    k: 5,
    note: "Original C₈H₁₈; requested alkane product C₅H₁₂. The other represented product is an open-chain one-C=C alkene.",
  },
  nonane: {
    title: "Nine-carbon feed: supplied five-carbon alkane",
    n: 9,
    k: 5,
    note: "Original C₉H₂₀; requested alkane product C₅H₁₂. A new bond arrangement preserves all original C/H atoms.",
  },
  dodecane: {
    title: "Twelve-carbon feed: supplied six-carbon alkane",
    n: 12,
    k: 6,
    note: "Original C₁₂H₂₆; requested alkane product C₆H₁₄. Extension names are supplied; use the original formulas rather than extra name recall.",
  },
  methane: {
    title: "Six-carbon feed: methane as supplied product",
    n: 6,
    k: 1,
    note: "Original C₆H₁₄; requested alkane product CH₄. Even a one-carbon product needs four C–H bonds: a cut alone does not complete its valence.",
  },
};
export type AlkeneStructure = {
  title: string;
  n: number;
  double: number;
  name: string;
  note: string;
};
export const alkeneStructures: Record<string, AlkeneStructure> = {
  initial: {
    title: "Ethene: name supplied, two carbons",
    n: 2,
    double: 0,
    name: "ethene",
    note: "Build the supplied ethene structure. The one-C=C open-chain series starts with two carbons. First-four names/structures are a separate-Chemistry extension; names are supplied here for Combined students.",
  },
  propene: {
    title: "Propene: name supplied, three carbons",
    n: 3,
    double: 0,
    name: "propene",
    note: "Construct the supplied three-carbon alkene. A double bond contributes TWO to each connected carbon’s bond-order total.",
  },
  but1: {
    title: "Butene: supplied but-1-ene representation",
    n: 4,
    double: 0,
    name: "butene",
    note: "Use an end C=C in this supplied four-carbon structure. Reversing the same chain gives an equivalent displayed structure; no arbitrary drawing orientation is marked wrong.",
  },
  but2: {
    title: "Butene: supplied but-2-ene representation",
    n: 4,
    double: 1,
    name: "butene",
    note: "Use the MIDDLE C=C in this supplied four-carbon structure. Pearson separate Chemistry explicitly includes but-1-ene and but-2-ene; both share C₄H₈.",
  },
  pent1: {
    title: "Pentene: supplied pent-1-ene representation",
    n: 5,
    double: 0,
    name: "pentene",
    note: "The supplied five-carbon example is an end-C=C pentene. Pentene is AQA’s fourth named alkene; Pearson’s listed first-three recall scope differs.",
  },
  pent2: {
    title: "Supplied pentene extension: internal C=C",
    n: 5,
    double: 1,
    name: "pentene",
    note: "This internal-C=C variant is supplied, not an additional name-recall requirement. Inspect connectivity and complete each carbon’s bond-order total.",
  },
};
export function carbonBondOrder(n: number, double: number | null, c: number) {
  return (
    Number(c > 0) +
    Number(c < n - 1) +
    Number(double !== null && (double === c || double === c - 1))
  );
}
export function canonicalHydrogens(
  n: number,
  double: number | null,
  c: number,
) {
  const need = 4 - carbonBondOrder(n, double, c),
    slots = [0, 1, ...(c === 0 ? [2] : c === n - 1 ? [3] : [])];
  return slots.slice(0, need);
}
export function mirroredDouble(n: number, d: number) {
  return n - 2 - d;
}
export type CrackingBalance = {
  title: string;
  kind: "formula" | "coefficients";
  feed: [number, number];
  alkane: [number, number];
  alkene: [number, number];
  ratio: [number, number, number];
  note: string;
};
export const crackingBalances: Record<string, CrackingBalance> = {
  initial: {
    title: "Missing formula: ten-carbon feed",
    kind: "formula",
    feed: [10, 22],
    alkane: [8, 18],
    alkene: [2, 4],
    ratio: [1, 1, 1],
    note: "Original C₁₀H₂₂ → C₈H₁₈ + one unknown one-C=C open-chain alkene. Both missing subscripts must conserve the original atoms.",
  },
  twoAlkenes: {
    title: "Missing formula: TWO alkene molecules",
    kind: "formula",
    feed: [12, 26],
    alkane: [4, 10],
    alkene: [4, 8],
    ratio: [1, 1, 2],
    note: "Original C₁₂H₂₆ → C₄H₁₀ + TWO identical unknown alkene molecules. Divide the remaining C and H atom counts by two; do not assign the whole remainder to each molecule.",
  },
  nineCarbon: {
    title: "Missing formula: nine-carbon feed",
    kind: "formula",
    feed: [9, 20],
    alkane: [5, 12],
    alkene: [4, 8],
    ratio: [1, 1, 1],
    note: "Original C₉H₂₀ → C₅H₁₂ + one unknown open-chain one-C=C alkene. The name of the larger feed is not required.",
  },
  sixCarbon: {
    title: "Given formulas: six-carbon feed",
    kind: "coefficients",
    feed: [6, 14],
    alkane: [4, 10],
    alkene: [2, 4],
    ratio: [1, 1, 1],
    note: "All three molecular formulas are supplied. Balance positive whole-number coefficients without changing any subscript. Balanced multiples are valid.",
  },
  tenCarbon: {
    title: "Given formulas: two propene molecules",
    kind: "coefficients",
    feed: [10, 22],
    alkane: [4, 10],
    alkene: [3, 6],
    ratio: [1, 1, 2],
    note: "Balance C₁₀H₂₂ → C₄H₁₀ + C₃H₆. More than one alkene molecule can form per feed molecule. All formulas remain fixed.",
  },
  sixteenCarbon: {
    title: "Given formulas: larger supplied feed",
    kind: "coefficients",
    feed: [16, 34],
    alkane: [8, 18],
    alkene: [4, 8],
    ratio: [1, 1, 2],
    note: "Balance C₁₆H₃₄ → C₈H₁₈ + C₄H₈. Apply conservation to the unfamiliar supplied sizes; doubling ALL coefficients keeps a valid balance valid.",
  },
};
export type BromineColour = "orange" | "colourless";
export type BromineReport = {
  title: string;
  initial: BromineColour;
  blank: BromineColour;
  positive: BromineColour;
  sample: BromineColour;
  verdict: string;
  evidence: string;
  limitation: string;
  note: string;
  sampleGiven: string;
};
export const bromineReports: Record<string, BromineReport> = {
  initial: {
    title: "Unknown sample and matched controls",
    initial: "orange",
    blank: "orange",
    positive: "colourless",
    sample: "colourless",
    verdict: "alkeneSupported",
    evidence: "sampleLosesColour",
    limitation: "suppliedCandidateClasses",
    sampleGiven:
      "An unknown pure hydrocarbon: an ordinary alkane or alkene candidate under the supplied matched conditions.",
    note: "Use the supplied standard-test observations. The controls are supplied for this comparison, not an extra unstated requirement in every exam question.",
  },
  alkane: {
    title: "Supplied saturated sample",
    initial: "orange",
    blank: "orange",
    positive: "colourless",
    sample: "orange",
    verdict: "alkaneSupported",
    evidence: "sampleKeepsColour",
    limitation: "suppliedCandidateClasses",
    sampleGiven:
      "A pure hydrocarbon from the supplied alkane/one-C=C-alkene comparison; it is C₆H₁₄ with only single bonds.",
    note: "The stated ordinary test has no UV-driven substitution condition. Compare the pure supplied candidates and actual observations.",
  },
  mixture: {
    title: "Collected cracking mixture",
    initial: "orange",
    blank: "orange",
    positive: "colourless",
    sample: "colourless",
    verdict: "unsaturationPresent",
    evidence: "sampleLosesColour",
    limitation: "notEveryMolecule",
    sampleGiven:
      "A collected cracking-gas mixture with no exhaustive composition analysis supplied.",
    note: "A positive mixture result supports unsaturated molecules being present. It does not establish a pure named alkene or that EVERY product molecule has C=C.",
  },
  blankFailed: {
    title: "Blank also loses bromine colour",
    initial: "orange",
    blank: "colourless",
    positive: "colourless",
    sample: "colourless",
    verdict: "unreliable",
    evidence: "blankLosesColour",
    limitation: "reagentChangedWithoutSample",
    sampleGiven:
      "An unknown hydrocarbon sample; the matched no-sample blank is included.",
    note: "A colour loss without the sample creates an alternative explanation. Use the original controls instead of attributing every colour change to the unknown.",
  },
  positiveFailed: {
    title: "Known alkene reference fails",
    initial: "orange",
    blank: "orange",
    positive: "orange",
    sample: "orange",
    verdict: "unreliable",
    evidence: "knownAlkeneKeepsColour",
    limitation: "failedPositiveControl",
    sampleGiven:
      "An unknown hydrocarbon; the stated known ethene reference is tested under the same supplied conditions.",
    note: "The supplied known alkene reference should remove bromine colour. Its failure makes a negative unknown result unreliable in this comparison.",
  },
  spent: {
    title: "Reagent was colourless at the start",
    initial: "colourless",
    blank: "colourless",
    positive: "colourless",
    sample: "colourless",
    verdict: "unreliable",
    evidence: "initialColourless",
    limitation: "noOriginalBromineColour",
    sampleGiven:
      "An unknown hydrocarbon; the original reagent was already colourless.",
    note: "No original bromine colour was available to lose. A final colourless sample is not a demonstrated orange→colourless change.",
  },
};
export type ProcessRecord = {
  title: string;
  before: string;
  target: string;
  process: string;
  heat: string;
  contacts: string[];
  change: string;
  reason: string;
  use: string;
  note: string;
};
export const crackingProcesses: Record<string, ProcessRecord> = {
  initial: {
    title: "Catalytic route to smaller fuels",
    before:
      "A large saturated hydrocarbon fraction, with surplus larger molecules.",
    target: "New smaller hydrocarbon molecules to meet a short-fuel demand.",
    process: "cracking",
    heat: "high",
    contacts: ["catalyst"],
    change: "chemical",
    reason: "bondsRearranged",
    use: "fuel",
    note: "The requested route is catalytic cracking. High temperature and contact with a catalyst are general conditions; no universal precise temperature is demanded.",
  },
  steam: {
    title: "Steam route to smaller molecules",
    before:
      "Large saturated hydrocarbon molecules; the requested route uses steam.",
    target: "New smaller hydrocarbons, including alkenes.",
    process: "cracking",
    heat: "high",
    contacts: ["steam"],
    change: "chemical",
    reason: "bondsRearranged",
    use: "chemicalFeedstock",
    note: "Steam cracking also uses high temperature. Steam is not a claim that fuel carbon becomes water, nor does it create carbon atoms.",
  },
  either: {
    title: "Alkene feedstock from larger hydrocarbons",
    before: "A supply of larger saturated hydrocarbons.",
    target: "Smaller alkene starting materials for a chemical manufacturer.",
    process: "cracking",
    heat: "high",
    contacts: ["catalyst", "steam"],
    change: "chemical",
    reason: "bondsRearranged",
    use: "chemicalFeedstock",
    note: "Either stated general cracking method is permitted. Smaller fuels and alkene chemical/polymer starting materials illustrate why cracking is useful.",
  },
  separate: {
    title: "Separate existing molecules",
    before:
      "A mixture already containing different hydrocarbons and supplied boiling ranges.",
    target:
      "Collect an existing larger-hydrocarbon fraction, without changing its molecules.",
    process: "distillation",
    heat: "heatAndCool",
    contacts: ["none"],
    change: "physical",
    reason: "sameMolecules",
    use: "collectFraction",
    note: "Heating/vaporisation and condensation can physically separate the original mixture. That is fractional distillation, not creation of new smaller molecules.",
  },
  join: {
    title: "Join supplied alkene molecules",
    before: "Small supplied alkene molecules, already produced.",
    target: "A polymer material made by joining many small molecules.",
    process: "polymerisation",
    heat: "notSpecified",
    contacts: ["notSpecified"],
    change: "chemical",
    reason: "joinMolecules",
    use: "material",
    note: "Identify the downstream stage and purpose only. Detailed polymerisation conditions and repeating units belong to the dedicated later lesson; no condition recall is asked here.",
  },
  burn: {
    title: "Release energy from a supplied fuel",
    before: "A supplied hydrocarbon fuel and sufficient oxygen.",
    target: "Carbon dioxide, water and transfer of energy to the surroundings.",
    process: "combustion",
    heat: "ignition",
    contacts: ["oxygen"],
    change: "chemical",
    reason: "oxidisedProducts",
    use: "energy",
    note: "Combustion releases energy and forms different oxygen-containing products. It is not the cracking route that supplies new smaller hydrocarbons.",
  },
};
export const crackingRecords = {
  rearrange: rearrangements,
  structure: alkeneStructures,
  balance: crackingBalances,
  bromine: bromineReports,
  process: crackingProcesses,
};
