import type { WorkbenchState } from "@/content/types";
const sodium = {
  name: "Sodium",
  symbol: "Na",
  protons: 11,
  outer: 1,
  shells: [2, 8, 1],
};
const magnesium = {
  name: "Magnesium",
  symbol: "Mg",
  protons: 12,
  outer: 2,
  shells: [2, 8, 2],
};
const chlorine = {
  name: "Chlorine",
  symbol: "Cl",
  protons: 17,
  outer: 7,
  shells: [2, 8, 7],
};
const oxygen = {
  name: "Oxygen",
  symbol: "O",
  protons: 8,
  outer: 6,
  shells: [2, 6],
};
export const ionicCompounds = {
  NaCl: {
    name: "Sodium chloride",
    metal: sodium,
    nonmetal: chlorine,
    donors: 1,
    acceptors: 1,
  },
  MgCl2: {
    name: "Magnesium chloride",
    metal: magnesium,
    nonmetal: chlorine,
    donors: 1,
    acceptors: 2,
  },
  MgO: {
    name: "Magnesium oxide",
    metal: magnesium,
    nonmetal: oxygen,
    donors: 1,
    acceptors: 1,
  },
  Na2O: {
    name: "Sodium oxide",
    metal: sodium,
    nonmetal: oxygen,
    donors: 2,
    acceptors: 1,
  },
};
export type IonicCompound = keyof typeof ionicCompounds;
export function transferCells(compound: IonicCompound) {
  const s = ionicCompounds[compound];
  return Array.from({ length: s.donors }, (_, d) =>
    Array.from({ length: s.acceptors }, (_, a) => ({
      key: `t${d}${a}`,
      donor: d,
      acceptor: a,
    })),
  ).flat();
}
export function ionicLedger(compound: IonicCompound, b: WorkbenchState) {
  const s = ionicCompounds[compound],
    cells = transferCells(compound);
  const lost = Array.from({ length: s.donors }, (_, d) =>
    cells
      .filter((c) => c.donor === d)
      .reduce((n, c) => n + Number(b[c.key]), 0),
  );
  const gained = Array.from({ length: s.acceptors }, (_, a) =>
    cells
      .filter((c) => c.acceptor === a)
      .reduce((n, c) => n + Number(b[c.key]), 0),
  );
  const donors = lost.map((n, i) => {
    const shells = [...s.metal.shells];
    shells[shells.length - 1] -= n;
    while (shells.at(-1) === 0) shells.pop();
    return {
      index: i,
      symbol: s.metal.symbol,
      protons: s.metal.protons,
      electrons: s.metal.protons - n,
      charge: n,
      shells,
      outer: shells.at(-1)!,
    };
  });
  const acceptors = gained.map((n, i) => {
    const shells = [...s.nonmetal.shells];
    shells[shells.length - 1] += n;
    return {
      index: i,
      symbol: s.nonmetal.symbol,
      protons: s.nonmetal.protons,
      electrons: s.nonmetal.protons + n,
      charge: -n,
      shells,
      outer: shells.at(-1)!,
      dots: s.nonmetal.outer,
      crosses: n,
    };
  });
  const particles = [...donors, ...acceptors];
  return {
    lost,
    gained,
    donors,
    acceptors,
    totalElectrons: particles.reduce((n, p) => n + p.electrons, 0),
    totalProtons: particles.reduce((n, p) => n + p.protons, 0),
    charge: particles.reduce((n, p) => n + p.charge, 0),
    correct:
      lost.every((n) => n === s.metal.outer) &&
      gained.every((n) => n === 8 - s.nonmetal.outer),
  };
}
