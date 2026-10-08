export type PathwayMode =
  "addition" | "conditions" | "infer" | "ledger" | "process" | "map";
export type Reagent = "hydrogen" | "water" | "chlorine" | "bromine" | "iodine";
export type Element = "C" | "H" | "O" | "Cl" | "Br" | "I";
export type AtomCounts = Record<Element, number>;
export type NewGroup = "none" | "H" | "OH" | "O" | "Cl" | "Br" | "I";
export interface AdditionCase {
  title: string;
  n: number;
  double: number;
  reagent: Reagent;
  name: string;
  product: string;
  reason: string;
  ohIndex?: number;
}
function caseOf(
  title: string,
  n: number,
  double: number,
  reagent: Reagent,
  name: string,
  product: string,
  reason: string,
  ohIndex?: number,
): AdditionCase {
  return {
    title,
    n,
    double,
    reagent,
    name,
    product,
    reason,
    ...(ohIndex === undefined ? {} : { ohIndex }),
  };
}
export const additionCases: Record<string, AdditionCase> = {
  initial: caseOf(
    "Ethene + hydrogen",
    2,
    0,
    "hydrogen",
    "Ethene",
    "Ethane",
    "Retain all four original H atoms; add one new H to each former double-bond carbon.",
  ),
  etheneWater: caseOf(
    "Ethene + steam",
    2,
    0,
    "water",
    "Ethene",
    "Ethanol",
    "Water supplies H and OH, including the H bonded to O. The two ethene carbons are equivalent.",
    1,
  ),
  etheneCl: caseOf(
    "Ethene + chlorine",
    2,
    0,
    "chlorine",
    "Ethene",
    "Supplied saturated chlorine-containing product",
    "Add one Cl to each reacting carbon; retain all four original H. This product contains Cl and is not a hydrocarbon.",
  ),
  etheneBr: caseOf(
    "Ethene + bromine",
    2,
    0,
    "bromine",
    "Ethene",
    "Supplied saturated bromine-containing product",
    "Both Br atoms are retained, one on each original reacting carbon; no H is replaced.",
  ),
  etheneI: caseOf(
    "Ethene + iodine",
    2,
    0,
    "iodine",
    "Ethene",
    "Supplied saturated iodine-containing product",
    "Account for both I atoms. This is structural addition accounting, not a prediction that every halogen reacts at an identical rate.",
  ),
  propeneH: caseOf(
    "Propene + hydrogen",
    3,
    0,
    "hydrogen",
    "Propene",
    "Propane",
    "Keep the original third carbon and its three H atoms; hydrogen adds only at the C=C pair.",
  ),
  propeneWater: caseOf(
    "Propene + steam: specified OH site",
    3,
    0,
    "water",
    "Propene",
    "Supplied propanol connectivity",
    "For this mapped structure OH attaches to carbon 2 and H to carbon 1. Preserve the original methyl end; isomer selectivity is not being assessed.",
    1,
  ),
  propeneCl: caseOf(
    "Propene + chlorine",
    3,
    0,
    "chlorine",
    "Propene",
    "Supplied saturated chlorine-containing product",
    "Only the original double-bond carbons each gain Cl; the third carbon retains its original H atoms.",
  ),
  propeneBr: caseOf(
    "Propene + bromine",
    3,
    0,
    "bromine",
    "Propene",
    "Supplied saturated bromine-containing product",
    "Do not replace a methyl H with Br: attach one Br to each former double-bond carbon.",
  ),
  propeneI: caseOf(
    "Propene + iodine",
    3,
    0,
    "iodine",
    "Propene",
    "Supplied saturated iodine-containing product",
    "Three original C and six original H remain; two I atoms are added across the original C=C.",
  ),
  buteneH: caseOf(
    "Butene + hydrogen",
    4,
    0,
    "hydrogen",
    "Butene; supplied terminal C=C",
    "Butane",
    "The four-carbon chain remains intact while one H is added at each original double-bond carbon.",
  ),
  buteneWater: caseOf(
    "Butene + steam: specified OH site",
    4,
    0,
    "water",
    "Butene; supplied terminal C=C",
    "Supplied butanol connectivity",
    "OH is mapped to carbon 2 here. An O without its bonded H is not the supplied OH group.",
    1,
  ),
  buteneCl: caseOf(
    "Butene + chlorine",
    4,
    0,
    "chlorine",
    "Butene; supplied terminal C=C",
    "Supplied saturated chlorine-containing product",
    "Keep all eight original H and the unreacted C–C bonds; two Cl atoms add at the original C=C.",
  ),
  buteneBr: caseOf(
    "Butene + bromine",
    4,
    0,
    "bromine",
    "Butene; supplied terminal C=C",
    "Supplied saturated bromine-containing product",
    "Eight original H stay on their original carbons; this is addition rather than replacement of H.",
  ),
  buteneI: caseOf(
    "Butene + iodine",
    4,
    0,
    "iodine",
    "Butene; supplied terminal C=C",
    "Supplied saturated iodine-containing product",
    "Count the iodine pair independently of chain length; a longer alkene does not require one I on every carbon.",
  ),
  penteneH: caseOf(
    "Pentene + hydrogen",
    5,
    0,
    "hydrogen",
    "Pentene",
    "Pentane",
    "Five carbons remain; the original ten H plus two supplied H give twelve H in one product molecule.",
  ),
  penteneWater: caseOf(
    "Pentene + steam: specified OH site",
    5,
    0,
    "water",
    "Pentene",
    "Pentanol; supplied carbon-2 OH connectivity",
    "OH is mapped to carbon 2; H joins carbon 1. Its name is provided rather than added to the required first-four alcohol recall.",
    1,
  ),
  penteneCl: caseOf(
    "Pentene + chlorine",
    5,
    0,
    "chlorine",
    "Pentene",
    "Supplied saturated chlorine-containing product",
    "The whole five-carbon chain stays. Add two Cl at the original pair, preserving every other bond and H.",
  ),
  penteneBr: caseOf(
    "Pentene + bromine",
    5,
    0,
    "bromine",
    "Pentene",
    "Supplied saturated bromine-containing product",
    "No polymer n or continuation bonds belong to this individual addition-product molecule.",
  ),
  penteneI: caseOf(
    "Pentene + iodine",
    5,
    0,
    "iodine",
    "Pentene",
    "Supplied saturated iodine-containing product",
    "A single I2 molecule supplies exactly two I atoms for the stated addition, not a new carbon-containing side chain.",
  ),
  internalH: caseOf(
    "Supplied internal butene + hydrogen",
    4,
    1,
    "hydrogen",
    "Butene; supplied C2=C3",
    "Butane",
    "Place the two new H at carbons2/3; the terminal methyl carbons remain unchanged.",
  ),
  internalBr: caseOf(
    "Supplied internal butene + bromine",
    4,
    1,
    "bromine",
    "Butene; supplied C2=C3",
    "Supplied saturated bromine-containing product",
    "Locate the actual internal C=C, not the leftmost C–C. One Br joins each of carbons2/3.",
  ),
  internalWater: caseOf(
    "Supplied internal butene + steam",
    4,
    1,
    "water",
    "Butene; supplied C2=C3",
    "Supplied butanol connectivity",
    "H/OH add at the original internal pair. OH is supplied on carbon 3 here; the mirrored central OH placement describes the same unlabelled connectivity.",
    2,
  ),
};
export function emptyCounts(): AtomCounts {
  return { C: 0, H: 0, O: 0, Cl: 0, Br: 0, I: 0 };
}
export function originalHydrogens(r: AdditionCase) {
  return Array.from(
    { length: r.n },
    (_, i) =>
      4 -
      (i > 0 ? (i - 1 === r.double ? 2 : 1) : 0) -
      (i < r.n - 1 ? (i === r.double ? 2 : 1) : 0),
  );
}
export function originalCounts(r: AdditionCase): AtomCounts {
  return { ...emptyCounts(), C: r.n, H: 2 * r.n };
}
export function reagentCounts(reagent: Reagent): AtomCounts {
  const a = emptyCounts();
  if (reagent === "hydrogen") a.H = 2;
  else if (reagent === "water") {
    a.H = 2;
    a.O = 1;
  } else
    a[reagent === "chlorine" ? "Cl" : reagent === "bromine" ? "Br" : "I"] = 2;
  return a;
}
export function productCounts(r: AdditionCase): AtomCounts {
  const a = originalCounts(r),
    b = reagentCounts(r.reagent);
  return Object.fromEntries(
    Object.keys(a).map((k) => [k, a[k as Element] + b[k as Element]]),
  ) as AtomCounts;
}
export function formula(a: AtomCounts) {
  return (
    (["C", "H", "O", "Cl", "Br", "I"] as Element[])
      .filter((e) => a[e] > 0)
      .map((e) => e + (a[e] === 1 ? "" : a[e]))
      .join("") || "No atoms chosen"
  );
}
export function relativeMass(a: AtomCounts) {
  return a.C * 12 + a.H + a.O * 16 + a.Cl * 35.5 + a.Br * 80 + a.I * 127;
}
export function expectedGroups(r: AdditionCase): [NewGroup, NewGroup] {
  if (r.reagent === "hydrogen") return ["H", "H"];
  if (r.reagent === "water")
    return r.ohIndex === r.double ? ["OH", "H"] : ["H", "OH"];
  const x =
    r.reagent === "chlorine" ? "Cl" : r.reagent === "bromine" ? "Br" : "I";
  return [x, x];
}
export function hydrationSites(r: AdditionCase) {
  return r.n === 2 || (r.n === 4 && r.double === 1)
    ? [r.double, r.double + 1]
    : [r.ohIndex!];
}
export const conditionCases: Record<
  string,
  {
    title: string;
    addition?: string;
    reaction: string;
    catalyst: string;
    thermal: string;
    pressure: string;
    observation: string;
    reason: string;
  }
> = {
  initial: {
    title: "Ethene and hydrogen: choose conditions",
    addition: "initial",
    reaction: "hydrogenation",
    catalyst: "nickel",
    thermal: "warmed",
    pressure: "notSpecified",
    observation: "notSpecified",
    reason:
      "Use hydrogen with a nickel catalyst and suitable heating. 150°C is one suitable example, not a universal exact-temperature rule for every alkene.",
  },
  steam: {
    title: "Industrial ethene hydration",
    addition: "etheneWater",
    reaction: "hydration",
    catalyst: "phosphoricAcid",
    thermal: "heatedSteam",
    pressure: "pressurised",
    observation: "notSpecified",
    reason:
      "Industrial hydration uses heated steam, pressure and a phosphoric-acid catalyst. Simply mixing cold ethene and water is not the stated route.",
  },
  bromine: {
    title: "Bromine-water evidence",
    addition: "etheneBr",
    reaction: "halogenAddition",
    catalyst: "notRequired",
    thermal: "ordinaryRoom",
    pressure: "ordinary",
    observation: "orangeToColourless",
    reason:
      "Under these supplied ordinary conditions bromine water is decolourised by the alkene. UV is not needed for this addition test.",
  },
  chlorine: {
    title: "Chlorine addition differs from substitution",
    addition: "propeneCl",
    reaction: "halogenAddition",
    catalyst: "notRequired",
    thermal: "ordinaryRoom",
    pressure: "ordinary",
    observation: "notSpecified",
    reason:
      "The supplied chlorine adds across C=C; do not invent UV-dependent replacement of an H atom.",
  },
  iodine: {
    title: "Provided iodine-addition transformation",
    addition: "penteneI",
    reaction: "halogenAddition",
    catalyst: "notSpecified",
    thermal: "notSpecified",
    pressure: "notSpecified",
    observation: "notSpecified",
    reason:
      "This case supplies structural addition only, without an experimental catalyst, heating or pressure record. Do not infer complete conversion, an identical reaction rate or bromine-specific colour behaviour for iodine.",
  },
  saturated: {
    title: "Saturated control under the bromine test",
    reaction: "noAddition",
    catalyst: "notRequired",
    thermal: "ordinaryRoom",
    pressure: "ordinary",
    observation: "staysOrange",
    reason:
      "The supplied propane has no C=C. Under the stated bromine-water conditions no alkene addition is expected; this is not a claim that propane never reacts.",
  },
};
export const inferCases: Record<
  string,
  { title: string; addition: string; reason: string }
> = {
  initial: {
    title: "Compare ethene with the supplied ethane product",
    addition: "initial",
    reason:
      "Work backwards from the atom difference; this is inference, not a claim that the reaction reverses spontaneously.",
  },
  water: {
    title: "Compare propene with the supplied alcohol product",
    addition: "propeneWater",
    reason:
      "An alcohol product has one added O and two added H: water supplies H plus OH.",
  },
  chlorine: {
    title: "Compare butene with the supplied chlorine-containing product",
    addition: "buteneCl",
    reason: "No C or H is gained or lost; the two added Cl come from one Cl2.",
  },
  bromine: {
    title: "Compare ethene with the supplied bromine-containing product",
    addition: "etheneBr",
    reason:
      "The supplied product retains every original H. HBr would supply only one Br and a new H.",
  },
  iodine: {
    title: "Compare pentene with the supplied iodine-containing product",
    addition: "penteneI",
    reason: "Chain length does not alter the added I2 atom pair.",
  },
  internal: {
    title: "Compare the supplied internal alkene with its product",
    addition: "internalH",
    reason:
      "The terminal methyl groups remain; the original internal carbons each gain one H.",
  },
};
export const ledgerCases: Record<
  string,
  { title: string; addition: string; reason: string }
> = {
  initial: {
    title: "One ethanol molecule, including O–H",
    addition: "etheneWater",
    reason:
      "Include the H attached to O: C2H6O has relative molecular mass 46.",
  },
  bromine: {
    title: "Heavy bromine atoms remain in the product",
    addition: "etheneBr",
    reason: "Use the supplied Ar(Br)=80 for both Br atoms, not just one.",
  },
  chlorine: {
    title: "Two chlorine atoms with supplied fractional Ar",
    addition: "etheneCl",
    reason: "Each Cl contributes 35.5; the Cl2 contribution is 71.",
  },
  iodine: {
    title: "Both iodine atoms with supplied Ar 127",
    addition: "etheneI",
    reason:
      "This is one small addition product, not a polymer repeat or an exact mass of an entire batch.",
  },
  propane: {
    title: "Hydrogenation changes H count, not C count",
    addition: "propeneH",
    reason: "C3H8 has Mr 44; two H atoms were added to C3H6.",
  },
  pentanol: {
    title: "Provided five-carbon alcohol, counting every H",
    addition: "penteneWater",
    reason:
      "C5H12O has Mr 88; naming unfamiliar alcohols is not required for this provided structure.",
  },
};
export const processCases: Record<
  string,
  {
    title: string;
    ethene: number;
    steam: number;
    reacted: number;
    reason: string;
  }
> = {
  initial: {
    title: "Reported partial single-pass conversion",
    ethene: 10,
    steam: 18,
    reacted: 6,
    reason:
      "The reported six reactions produce six ethanol molecules. Four ethene and twelve water molecules remain unreacted.",
  },
  equalFeed: {
    title: "Equal feeds do not imply complete conversion",
    ethene: 8,
    steam: 8,
    reacted: 4,
    reason:
      "Use the reported four reactions, not an unsupported assumption that every feed molecule reacts.",
  },
  excessEthene: {
    title: "Excess ethene with measured conversion",
    ethene: 12,
    steam: 8,
    reacted: 6,
    reason:
      "Unreacted ethene remains in the cooled gas stream; excess water contributes to the liquid mixture.",
  },
  waterLimited: {
    title: "A supply bound differs from an observed amount",
    ethene: 9,
    steam: 3,
    reacted: 2,
    reason:
      "Three waters set a maximum of three additions, but this record reports only two. Do not replace observation by a theoretical maximum.",
  },
  complete: {
    title: "Complete ethene use with water left over",
    ethene: 4,
    steam: 9,
    reacted: 4,
    reason:
      "No ethene remains to recycle; five unreacted water molecules join the collected liquid.",
  },
  zero: {
    title: "Supplied zero-conversion record",
    ethene: 4,
    steam: 6,
    reacted: 0,
    reason:
      "Zero observed reactions produce no ethanol. All ethene and water remain; the collected liquid is water only in this stated cooling model.",
  },
};
export const mapCases: Record<
  string,
  {
    title: string;
    source: string;
    sourceFormula: string;
    goal: string;
    method: string;
    feed: string;
    byproduct: string;
    reason: string;
    higher?: boolean;
    given?: string;
  }
> = {
  initial: {
    title: "Ethene to ethanol",
    source: "Ethene",
    sourceFormula: "C2H4",
    goal: "ethanol",
    method: "hydration",
    feed: "steam",
    byproduct: "none",
    reason:
      "Water is consumed in this addition; it is not a newly formed condensation byproduct.",
  },
  hydrogen: {
    title: "Ethene to ethane",
    source: "Ethene",
    sourceFormula: "C2H4",
    goal: "ethane",
    method: "hydrogenation",
    feed: "hydrogen",
    byproduct: "none",
    reason:
      "This branch reaches an alkane. A subsequent steam-addition arrow is not valid for its saturated C–C.",
  },
  oxidation: {
    title: "The supplied primary ethanol to ethanoic acid",
    source: "Ethanol",
    sourceFormula: "C2H6O",
    goal: "ethanoicAcid",
    method: "oxidation",
    feed: "oxidisingAgent",
    byproduct: "water",
    given:
      "Supplied atom accounting: C2H6O + 2[O] → C2H4O2 + H2O. Recall of this balanced oxidation equation is not required.",
    reason:
      "This route is specifically for the shown primary ethanol. Do not infer that every possible alcohol connectivity oxidises to a carboxylic acid.",
  },
  ester: {
    title: "An ester needs two carbon-containing feeds",
    source: "Ethanoic acid",
    sourceFormula: "C2H4O2",
    goal: "ethylEthanoate",
    method: "esterification",
    feed: "ethanol",
    byproduct: "water",
    reason:
      "Two acid-derived carbons plus two alcohol-derived carbons give a four-carbon ester. Acid alone does not create those additional carbons.",
  },
  ferment: {
    title: "Fermentation is an alternative ethanol route",
    source: "Glucose",
    sourceFormula: "C6H12O6",
    goal: "ethanol",
    method: "fermentation",
    feed: "yeast",
    byproduct: "carbonDioxide",
    given:
      "Supplied accounting: one glucose can form two ethanol and two carbon dioxide molecules. The diagram is a word/flow representation, not a supplied displayed glucose structure.",
    reason:
      "Yeast fermentation of aqueous glucose under suitable warm anaerobic conditions produces ethanol in solution and carbon dioxide; it is not alkene hydration.",
  },
  polymer: {
    title: "Many ethene monomers form a polymer",
    source: "Many ethene monomers",
    sourceFormula: "n C2H4",
    goal: "polyethene",
    method: "additionPolymerisation",
    feed: "moreMonomers",
    byproduct: "none",
    reason:
      "Other ethene molecules supply the chain contributions. This differs from adding one small H2, H2O or halogen molecule to make one discrete product.",
  },
  polyester: {
    title: "Higher: distinguish polyester condensation",
    source: "Supplied dicarboxylic acid",
    sourceFormula: "HOOC–CH2–CH2–COOH",
    goal: "polyester",
    method: "condensationPolymerisation",
    feed: "diol",
    byproduct: "water",
    higher: true,
    reason:
      "Two reactive groups at both ends permit continued growth. Water forms at each actual ester link; no finite-chain water count is inferred from this flow label.",
  },
};
export const pathwayRecords = {
  addition: additionCases,
  conditions: conditionCases,
  infer: inferCases,
  ledger: ledgerCases,
  process: processCases,
  map: mapCases,
};
