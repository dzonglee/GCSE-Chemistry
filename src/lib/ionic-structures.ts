export type LatticeIon = {
  id: string;
  index: [number, number, number];
  position: [number, number, number];
  species: "Na+" | "Cl-";
  charge: 1 | -1;
};
/** Finite rock-salt fragment, not an isolated molecule or a crystallographic unit cell. */
export const sodiumChlorideFragment: LatticeIon[] = [];
for (let x = 0; x < 4; x++)
  for (let y = 0; y < 4; y++)
    for (let z = 0; z < 4; z++) {
      const positive = (x + y + z) % 2 === 0;
      sodiumChlorideFragment.push({
        id: `ion-${x}-${y}-${z}`,
        index: [x, y, z],
        position: [x - 1.5, y - 1.5, z - 1.5],
        species: positive ? "Na+" : "Cl-",
        charge: positive ? 1 : -1,
      });
    }
export function interiorIon(species: "Na+" | "Cl-") {
  return sodiumChlorideFragment.find(
    (ion) => ion.id === (species === "Na+" ? "ion-1-1-2" : "ion-1-1-1"),
  )!;
}
export function nearestNeighbours(centre: LatticeIon) {
  return sodiumChlorideFragment.filter(
    (ion) =>
      ion.index.reduce(
        (sum, n, axis) => sum + (n - centre.index[axis]) ** 2,
        0,
      ) === 1,
  );
}
export const ionicPhaseEvidence = {
  solid: {
    conducts: "no",
    carrier: "fixed",
    text: "Charged sodium and chloride ions occupy fixed lattice positions. They cannot move through the solid to carry charge.",
  },
  molten: {
    conducts: "yes",
    carrier: "mobile",
    text: "The regular solid lattice has broken down. Sodium and chloride ions can move through the liquid and carry charge.",
  },
  solution: {
    conducts: "yes",
    carrier: "mobile",
    text: "Dissolved sodium chloride supplies mobile sodium and chloride ions in water. These charged ions carry current; they are not free electrons.",
  },
} as const;
export type IonicPhase = keyof typeof ionicPhaseEvidence;
