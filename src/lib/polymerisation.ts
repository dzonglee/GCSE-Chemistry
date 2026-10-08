import { polyesterRecords } from "./polyester";
/** Original, individually selected polymerisation evidence. Displayed side groups
 * are conserved identities; cropped chains omit end groups, never a full formula. */
export type SideGroup = "none" | "H" | "CH3" | "C2H5" | "Cl" | "F";
export type FourGroups = [SideGroup, SideGroup, SideGroup, SideGroup];
export interface AlkeneRecord {
  title: string;
  monomer: string;
  polymer: string;
  groups: FourGroups;
  reason: string;
}
export const additionRecords: Record<string, AlkeneRecord> = {
  initial: {
    title: "Ethene: retain every hydrogen",
    monomer: "Ethene",
    polymer: "Poly(ethene)",
    groups: ["H", "H", "H", "H"],
    reason:
      "The two alkene carbons become two backbone carbons; all four H atoms remain.",
  },
  propene: {
    title: "Propene: preserve the methyl side group",
    monomer: "Propene",
    polymer: "Poly(propene)",
    groups: ["H", "H", "H", "CH3"],
    reason:
      "The CH3 carbon remains a side group, not a third backbone carbon in this monomer-derived repeat.",
  },
  chloro: {
    title: "Chloroethene: retain the chlorine",
    monomer: "Chloroethene (vinyl chloride)",
    polymer: "Poly(chloroethene), PVC",
    groups: ["H", "H", "H", "Cl"],
    reason: "C–Cl is retained; C=C is the reacting functional group.",
  },
  fluoro: {
    title: "Tetrafluoroethene: all four fluorines remain",
    monomer: "Tetrafluoroethene",
    polymer: "Poly(tetrafluoroethene), PTFE",
    groups: ["F", "F", "F", "F"],
    reason:
      "No H is present in this supplied monomer. Four F atoms remain attached.",
  },
  but1: {
    title: "Provided but-1-ene: keep the ethyl side group",
    monomer: "Provided but-1-ene",
    polymer: "Provided poly(but-1-ene)",
    groups: ["H", "H", "H", "C2H5"],
    reason:
      "The supplied C2H5 substituent contains two carbons; it remains beside the two-carbon backbone repeat.",
  },
  but2: {
    title: "Provided but-2-ene: one methyl on each carbon",
    monomer: "Provided but-2-ene",
    polymer: "Provided poly(but-2-ene)",
    groups: ["H", "CH3", "H", "CH3"],
    reason:
      "Both methyl substituents stay on their respective reacting carbons. This is structural deduction from the supplied formula.",
  },
  dichloro11: {
    title: "Provided 1,1-dichloroethene: both Cl on one carbon",
    monomer: "Provided 1,1-dichloroethene",
    polymer: "Provided addition polymer",
    groups: ["H", "H", "Cl", "Cl"],
    reason:
      "Two Cl on one carbon must not become one on each merely because the total formula agrees.",
  },
  dichloro12: {
    title: "Provided 1,2-dichloroethene: one Cl on each carbon",
    monomer: "Provided 1,2-dichloroethene",
    polymer: "Provided addition polymer",
    groups: ["H", "Cl", "H", "Cl"],
    reason:
      "One Cl remains on each original reacting carbon. No stereochemical recall or mechanism is required.",
  },
};
export const reverseRecords: Record<string, AlkeneRecord> = {
  initial: additionRecords.chloro,
  propene: additionRecords.propene,
  fluoro: additionRecords.fluoro,
  but1: additionRecords.but1,
  dichloro11: additionRecords.dichloro11,
  dichloro12: additionRecords.dichloro12,
};
export interface SegmentRecord {
  title: string;
  structure: AlkeneRecord;
  units: number;
  start: number;
  reason: string;
}
export const segmentRecords: Record<string, SegmentRecord> = {
  initial: {
    title: "Select one propene-derived repeat",
    structure: additionRecords.propene,
    units: 3,
    start: 0,
    reason:
      "Choose two adjacent backbone carbons with all their side groups; moving the start by one carbon gives an equivalent reversed phase.",
  },
  ethene: {
    title: "Use the specified monomer-derived unit",
    structure: additionRecords.initial,
    units: 4,
    start: 0,
    reason:
      "Here the instruction requests the unit derived from ONE C2H4 monomer. A CH2 translational motif is smaller, but does not meet this stated monomer-derived representation.",
  },
  fluoro: {
    title: "Preserve all four F in one unit",
    structure: additionRecords.fluoro,
    units: 3,
    start: 0,
    reason:
      "A selected pair of carbons includes four F atoms, with single continuation bonds crossing both brackets.",
  },
  chloro: {
    title: "Either valid phase of the chlorine pattern",
    structure: additionRecords.chloro,
    units: 4,
    start: 1,
    reason:
      "A cyclic shift of the two-carbon repeat is equivalent; a chlorine cannot disappear at a bracket.",
  },
  dichloro: {
    title: "Distinguish a repeat from a same-formula rearrangement",
    structure: additionRecords.dichloro11,
    units: 3,
    start: 0,
    reason: "The repeating sequence is CH2 then CCl2, not CHCl then CHCl.",
  },
  but2: {
    title: "Count backbone and side-chain carbons separately",
    structure: additionRecords.but2,
    units: 3,
    start: 1,
    reason:
      "Two backbone carbons and their two CH3 side groups represent four C atoms per monomer-derived repeat.",
  },
};
export interface InventoryRecord {
  title: string;
  structure: AlkeneRecord;
  units: number;
  atoms: [number, number, number, number];
  repeatMr: number;
  reason: string;
}
export const inventoryRecords: Record<string, InventoryRecord> = {
  initial: {
    title: "Five ethene-derived contributions",
    structure: additionRecords.initial,
    units: 5,
    atoms: [10, 20, 0, 0],
    repeatMr: 28,
    reason:
      "Five C2H4 repeat contributions contain C10H20; omitted chain ends prevent a complete molecular formula claim.",
  },
  propene: {
    title: "Four propene-derived contributions",
    structure: additionRecords.propene,
    units: 4,
    atoms: [12, 24, 0, 0],
    repeatMr: 42,
    reason:
      "Four C3H6 contributions include four methyl side groups; only eight C atoms are in the shown backbone.",
  },
  chloro: {
    title: "Three chlorine-containing contributions",
    structure: additionRecords.chloro,
    units: 3,
    atoms: [6, 9, 3, 0],
    repeatMr: 62.5,
    reason:
      "Three C2H3Cl contributions retain all three Cl atoms; no hydrogen chloride is eliminated in addition.",
  },
  fluoro: {
    title: "Two fluorinated contributions",
    structure: additionRecords.fluoro,
    units: 2,
    atoms: [4, 0, 0, 8],
    repeatMr: 100,
    reason:
      "Two C2F4 contributions contain no hydrogen and retain eight F atoms.",
  },
  but1: {
    title: "Six supplied ethyl-substituted contributions",
    structure: additionRecords.but1,
    units: 6,
    atoms: [24, 48, 0, 0],
    repeatMr: 56,
    reason:
      "Each C2H5 substituent contributes two additional C atoms and five H atoms.",
  },
  dichloro: {
    title: "Four supplied dichloro contributions",
    structure: additionRecords.dichloro11,
    units: 4,
    atoms: [8, 8, 8, 0],
    repeatMr: 97,
    reason:
      "Four C2H2Cl2 contributions retain eight Cl. Atom totals alone do not prove correct connectivity.",
  },
};
export interface EsterRecord {
  title: string;
  acid: string;
  alcohol: string;
  acidGroups: number;
  alcoholGroups: number;
  polymerPossible: boolean;
  small: "water" | "hydrogenChloride";
  reason: string;
}
export const esterRecords: Record<string, EsterRecord> = {
  initial: {
    title: "Higher: diacid plus diol",
    acid: "HO–C(=O)–CH2–CH2–C(=O)–OH",
    alcohol: "HO–CH2–CH2–OH",
    acidGroups: 2,
    alcoholGroups: 2,
    polymerPossible: true,
    small: "water",
    reason:
      "Acid OH and alcohol H form water at each ester link. Two reacting groups on each monomer permit further chain growth.",
  },
  longDiol: {
    title: "Higher: a longer supplied diol",
    acid: "HO–C(=O)–CH2–C(=O)–OH",
    alcohol: "HO–CH2–CH2–CH2–OH",
    acidGroups: 2,
    alcoholGroups: 2,
    polymerPossible: true,
    small: "water",
    reason:
      "Changing the supplied spacer does not change the two-functional-group requirement or water per ester link.",
  },
  monoAlcohol: {
    title: "Higher: a monofunctional alcohol limits growth",
    acid: "HO–C(=O)–CH2–CH2–C(=O)–OH",
    alcohol: "CH3–CH2–OH",
    acidGroups: 2,
    alcoholGroups: 1,
    polymerPossible: false,
    small: "water",
    reason:
      "An ester can form, but ethanol has only one OH; these two supplied reagents alone cannot make an indefinitely alternating polyester chain.",
  },
  monoAcid: {
    title: "Higher: a monofunctional acid limits growth",
    acid: "CH3–C(=O)–OH",
    alcohol: "HO–CH2–CH2–OH",
    acidGroups: 1,
    alcoholGroups: 2,
    polymerPossible: false,
    small: "water",
    reason:
      "The supplied acid has only one COOH; ester formation alone does not establish polymer formation.",
  },
  suppliedChloride: {
    title: "Higher supplied extension: a different leaving group",
    acid: "Cl–C(=O)–CH2–C(=O)–Cl (provided reactive acid chloride)",
    alcohol: "HO–CH2–CH2–OH",
    acidGroups: 2,
    alcoholGroups: 2,
    polymerPossible: true,
    small: "hydrogenChloride",
    reason:
      "The original reaction explicitly provides loss of Cl from the acid chloride and H from the alcohol: HCl. This provided deduction is not required acid-chloride recall; condensation does not always make water.",
  },
};
export interface LinkRecord {
  title: string;
  nodes: number;
  edges: [number, number][];
  components: number;
  smallMolecule: string;
  reason: string;
}
export const linkRecords: Record<string, LinkRecord> = {
  initial: {
    title: "Higher: six monomers in one open chain",
    nodes: 6,
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    components: 1,
    smallMolecule: "water",
    reason:
      "Six nodes need five connecting links in one open chain. One water is formed per supplied condensation link.",
  },
  sixteen: {
    title: "Higher: sixteen monomers in one open chain",
    nodes: 16,
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 10],
      [10, 11],
      [11, 12],
      [12, 13],
      [13, 14],
      [14, 15],
    ],
    components: 1,
    smallMolecule: "water",
    reason:
      "The exact finite open diagram has15 links, not16. Do not count a hypothetical omitted terminal reaction.",
  },
  twoChains: {
    title: "Higher: eight monomers remain in two chains",
    nodes: 8,
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [4, 5],
      [5, 6],
      [6, 7],
    ],
    components: 2,
    smallMolecule: "water",
    reason:
      "Two separate four-node open chains have three links each; six actual links produce six waters.",
  },
  partial: {
    title: "Higher: count only the three supplied links",
    nodes: 6,
    edges: [
      [0, 1],
      [1, 2],
      [3, 4],
    ],
    components: 3,
    smallMolecule: "water",
    reason:
      "One three-node chain, one two-node chain and one unlinked monomer remain. Only three observed links have formed.",
  },
  chloride: {
    title: "Higher provided extension: count HCl-producing links",
    nodes: 4,
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
    components: 1,
    smallMolecule: "hydrogen chloride",
    reason:
      "The supplied acid-chloride/diol report identifies HCl. Four nodes in this open chain have three links and three HCl molecules.",
  },
};
export type PolymerisationMode =
  | "addition"
  | "reverse"
  | "segment"
  | "inventory"
  | "ester"
  | "links"
  | "polyester";
export const polymerisationRecords = {
  addition: additionRecords,
  reverse: reverseRecords,
  segment: segmentRecords,
  inventory: inventoryRecords,
  ester: esterRecords,
  links: linkRecords,
  polyester: polyesterRecords,
};
export const sideGroups: SideGroup[] = ["none", "H", "CH3", "C2H5", "Cl", "F"];
export function groupInventory(g: SideGroup): [number, number, number, number] {
  switch (g) {
    case "H":
      return [0, 1, 0, 0];
    case "CH3":
      return [1, 3, 0, 0];
    case "C2H5":
      return [2, 5, 0, 0];
    case "Cl":
      return [0, 0, 1, 0];
    case "F":
      return [0, 0, 0, 1];
    default:
      return [0, 0, 0, 0];
  }
}
export function repeatInventory(g: FourGroups) {
  const a: [number, number, number, number] = [2, 0, 0, 0];
  for (const s of g) {
    const v = groupInventory(s);
    for (let i = 0; i < 4; i++) a[i] += v[i];
  }
  return a;
}
export function equivalentGroups(a: FourGroups, b: FourGroups) {
  const normalize = (g: FourGroups) =>
    [g.slice(0, 2).sort().join("/"), g.slice(2).sort().join("/")]
      .sort()
      .join("|");
  return normalize(a) === normalize(b);
}
