export type CovalentAtom = { symbol: string; outer: number; full: 2 | 8 };
const H: CovalentAtom = { symbol: "H", outer: 1, full: 2 },
  C: CovalentAtom = { symbol: "C", outer: 4, full: 8 },
  N: CovalentAtom = { symbol: "N", outer: 5, full: 8 },
  O: CovalentAtom = { symbol: "O", outer: 6, full: 8 },
  Cl: CovalentAtom = { symbol: "Cl", outer: 7, full: 8 };
/** Dot-and-cross bookkeeping for selected GCSE molecules; not a universal valence algorithm. */
export const covalentMolecules = {
  H2: {
    name: "hydrogen",
    centre: H,
    partners: [H],
    orders: [1],
    geometry: "linear",
  },
  Cl2: {
    name: "chlorine",
    centre: Cl,
    partners: [Cl],
    orders: [1],
    geometry: "linear",
  },
  HCl: {
    name: "hydrogen chloride",
    centre: Cl,
    partners: [H],
    orders: [1],
    geometry: "linear",
  },
  O2: {
    name: "oxygen",
    centre: O,
    partners: [O],
    orders: [2],
    geometry: "linear",
  },
  N2: {
    name: "nitrogen",
    centre: N,
    partners: [N],
    orders: [3],
    geometry: "linear",
  },
  H2O: {
    name: "water",
    centre: O,
    partners: [H, H],
    orders: [1, 1],
    geometry: "bent",
  },
  NH3: {
    name: "ammonia",
    centre: N,
    partners: [H, H, H],
    orders: [1, 1, 1],
    geometry: "pyramidal",
  },
  CH4: {
    name: "methane",
    centre: C,
    partners: [H, H, H, H],
    orders: [1, 1, 1, 1],
    geometry: "tetrahedral",
  },
  CO2: {
    name: "carbon dioxide",
    centre: C,
    partners: [O, O],
    orders: [2, 2],
    geometry: "linear",
  },
} as const;
export type CovalentMolecule = keyof typeof covalentMolecules;
export function moleculePositions(
  molecule: CovalentMolecule,
): [number, number, number][] {
  if (molecule === "CH4")
    return [
      [0, 0, 0],
      [0.85, 0.85, 0.85],
      [-0.85, -0.85, 0.85],
      [-0.85, 0.85, -0.85],
      [0.85, -0.85, -0.85],
    ];
  if (molecule === "NH3")
    return [
      [0, 0.48, 0],
      [1.2, 0, 0],
      [-0.6, 0, 1.039],
      [-0.6, 0, -1.039],
    ];
  if (molecule === "H2O")
    return [
      [0, 0, 0],
      [0.99, -0.765, 0],
      [-0.99, -0.765, 0],
    ];
  if (molecule === "CO2")
    return [
      [0, 0, 0],
      [1.4, 0, 0],
      [-1.4, 0, 0],
    ];
  return [
    [-0.75, 0, 0],
    [0.75, 0, 0],
  ];
}
export function covalentKeys(molecule: CovalentMolecule) {
  return covalentMolecules[molecule].partners.flatMap((_, i) => [
    `centre${i}`,
    `partner${i}`,
  ]);
}
export function covalentLedger(
  molecule: CovalentMolecule,
  donations: Record<string, string | number>,
) {
  const spec = covalentMolecules[molecule],
    own = spec.partners.map((_, i) => Number(donations[`centre${i}`] ?? 0)),
    other = spec.partners.map((_, i) => Number(donations[`partner${i}`] ?? 0)),
    centreRemaining = spec.centre.outer - own.reduce((a, b) => a + b, 0),
    partnerRemaining = spec.partners.map((atom, i) => atom.outer - other[i]),
    shared = own.map((count, i) => count + other[i]);
  return {
    own,
    other,
    shared,
    centreRemaining,
    partnerRemaining,
    centreAround: spec.centre.outer + other.reduce((a, b) => a + b, 0),
    partnerAround: spec.partners.map((atom, i) => atom.outer + own[i]),
    total:
      spec.centre.outer +
      spec.partners.reduce((total, atom) => total + atom.outer, 0),
    displayedTotal:
      centreRemaining +
      partnerRemaining.reduce((a, b) => a + b, 0) +
      shared.reduce((a, b) => a + b, 0),
    correct: spec.orders.every(
      (order, i) => own[i] === order && other[i] === order,
    ),
  };
}
