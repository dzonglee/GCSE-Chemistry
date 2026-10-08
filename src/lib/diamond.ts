/** Diamond-cubic connectivity from two interpenetrating FCC sublattices.
 * Integer coordinates are quarters of a conventional cubic cell edge.
 * This 2×2×2-cell cutout is a finite visual fragment, not a C64 molecule. */
const fccBasis = [
  [0, 0, 0],
  [0, 2, 2],
  [2, 0, 2],
  [2, 2, 0],
] as const;
export const diamondAtoms = Array.from({ length: 8 }, (_, cell) => {
  const origin = [
    (cell % 2) * 4,
    (Math.floor(cell / 2) % 2) * 4,
    Math.floor(cell / 4) * 4,
  ];
  return fccBasis.flatMap((basis) =>
    [0, 1].map((offset) => {
      const quarters = basis.map((v, axis) => v + origin[axis] + offset) as [
        number,
        number,
        number,
      ];
      return {
        quarters,
        position: quarters.map((v) => (v - 3.5) / 2) as [
          number,
          number,
          number,
        ],
      };
    }),
  );
})
  .flat()
  .map((atom, id) => ({ ...atom, id }));
export const diamondBonds = diamondAtoms.flatMap((a, i) =>
  diamondAtoms
    .slice(i + 1)
    .filter(
      (b) =>
        a.quarters.reduce(
          (sum, v, axis) => sum + (v - b.quarters[axis]) ** 2,
          0,
        ) === 3,
    )
    .map((b) => ({ a: a.id, b: b.id })),
);
export function diamondNeighbours(id: number) {
  return diamondBonds
    .flatMap((b) => (b.a === id ? [b.b] : b.b === id ? [b.a] : []))
    .map((n) => diamondAtoms[n]);
}
export const interiorDiamondAtoms = diamondAtoms.filter(
  (atom) => diamondNeighbours(atom.id).length === 4,
);
export const diamondFocusSites = [
  [3, 3, 1],
  [3, 3, 5],
  [5, 5, 5],
].map((q) => {
  const atom = diamondAtoms.find((a) => a.quarters.every((v, i) => v === q[i]));
  if (!atom || diamondNeighbours(atom.id).length !== 4)
    throw Error("Diamond focus must retain all four bonded neighbours");
  return atom;
});

export type NetworkMode = "diamond" | "energy" | "carriers" | "silica";
export function initialNetworkBoard(
  mode: NetworkMode,
): Record<string, string | number> {
  if (mode === "diamond") return { site: 0, neighbours: 0 };
  if (mode === "energy")
    return { force: "unset", extent: "unset", energy: "unset" };
  if (mode === "carriers") return { conducts: "unset", carrier: "unset" };
  return { extent: "unset", bond: "unset" };
}
export function validNetworkBoard(
  mode: NetworkMode,
  b: Record<string, unknown>,
) {
  const keys = Object.keys(initialNetworkBoard(mode));
  if (Object.keys(b).length !== keys.length || !keys.every((k) => k in b))
    return false;
  const pick = (v: unknown, allowed: (string | number)[]) =>
    allowed.includes(v as string | number);
  if (mode === "diamond")
    return pick(b.site, [0, 1, 2]) && pick(b.neighbours, [0, 2, 3, 4, 6]);
  if (mode === "energy")
    return (
      pick(b.force, ["unset", "covalent", "intermolecular"]) &&
      pick(b.extent, ["unset", "many", "one"]) &&
      pick(b.energy, ["unset", "high", "low"])
    );
  if (mode === "carriers")
    return (
      pick(b.conducts, ["unset", "yes", "no"]) &&
      pick(b.carrier, ["unset", "none", "electrons", "ions"])
    );
  return (
    pick(b.extent, ["unset", "giant", "molecules"]) &&
    pick(b.bond, ["unset", "covalent", "ionic", "weak"])
  );
}
export function networkPrediction(
  mode: NetworkMode,
  b: Record<string, string | number>,
) {
  if (mode === "diamond")
    return {
      correct: b.neighbours === 4,
      feedback:
        b.neighbours === 4
          ? "The selected interior carbon is covalently bonded to four other carbons in three dimensions. These neighbours continue into the connected giant network; the highlighted local motif is not a separate molecule. Cut-edge bonds are omitted in the finite fragment."
          : "Your count is retained. Rotate the network and inspect bonds in front and behind the selected interior carbon. A flat view can conceal a direction. The network's cut edges do not change the selected interior carbon's four-neighbour coordination.",
    };
  if (mode === "energy")
    return {
      correct:
        b.force === "covalent" && b.extent === "many" && b.energy === "high",
      feedback:
        b.force === "covalent" && b.extent === "many" && b.energy === "high"
          ? "Diamond is a giant covalent network. Many strong covalent bonds must be overcome to disrupt that structure, requiring much energy. This explains its very high melting point; there are no separate small molecules to pull apart by overcoming only weak intermolecular attractions."
          : "Your explanation is retained. Name strong COVALENT bonds, say MANY must be overcome, and connect this to MUCH energy. Weak between-molecule reasoning belongs to small molecular substances; diamond is a giant connected network.",
    };
  if (mode === "carriers")
    return {
      correct: b.conducts === "no" && b.carrier === "none",
      feedback:
        b.conducts === "no" && b.carrier === "none"
          ? "Pure diamond has no delocalised electrons or mobile ions to carry charge through the structure. Carbon's outer electrons are involved in its four covalent bonds. Electrons exist, but are not freely moving charge carriers throughout this network."
          : "Your prediction is retained. Overall neutrality alone is insufficient: metals are also neutral and conduct. Pure diamond lacks MOBILE charged carriers; its bonding electrons are not delocalised through the structure and it has no mobile ions.",
    };
  return {
    correct: b.extent === "giant" && b.bond === "covalent",
    feedback:
      b.extent === "giant" && b.bond === "covalent"
        ? "Silicon dioxide is a compound with a giant covalent network, not separate small SiO2 molecules in this solid. Each selected silicon links to four oxygens, and each bridging oxygen links two silicons. The bulk Si:O ratio is 1:2; a cropped local fragment is not the whole-formula inventory."
        : "Your classification is retained. Silicon and oxygen are linked throughout a giant covalent network. Two element types do not by themselves imply ionic bonding, and a finite drawn fragment does not imply separate small molecules.",
  };
}
