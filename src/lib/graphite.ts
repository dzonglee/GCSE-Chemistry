/** Original honeycomb cutout: two basis atoms per planar primitive cell.
 * The middle sheet is translated by one in-plane bond vector (AB stacking).
 * Unit bond length is schematic; stacked layer spacing is not physical scale. */
const root3 = Math.sqrt(3);
export const graphiteAtoms = Array.from({ length: 3 }, (_, layer) =>
  Array.from({ length: 16 }, (_, cell) =>
    [0, 1].map((basis) => {
      const i = cell % 4,
        j = Math.floor(cell / 4);
      return {
        layer,
        cell,
        basis,
        position: [
          ((root3 * (i + j)) / 2 - root3 * 1.5) / 2,
          (1.5 * (i - j) + basis - 0.5) / 2 + (layer === 1 ? 0.5 : 0),
          (layer - 1) * 1.2,
        ] as [number, number, number],
      };
    }),
  ),
)
  .flat(2)
  .map((a, id) => ({ ...a, id }));
export const graphiteBonds = graphiteAtoms.flatMap((a, i) =>
  graphiteAtoms
    .slice(i + 1)
    .filter(
      (b) =>
        a.layer === b.layer &&
        Math.abs(
          a.position.reduce((s, v, k) => s + (v - b.position[k]) ** 2, 0) -
            0.25,
        ) < 1e-9,
    )
    .map((b) => ({ a: a.id, b: b.id })),
);
export function graphiteNeighbours(id: number) {
  return graphiteBonds
    .filter((b) => b.a === id || b.b === id)
    .map((b) => graphiteAtoms[b.a === id ? b.b : b.a]);
}
export const graphiteFocusSites = [0, 1, 2].map((layer) => {
  const atom = graphiteAtoms.find(
    (a) => a.layer === layer && a.cell === 5 && a.basis === 0,
  )!;
  if (graphiteNeighbours(atom.id).length !== 3)
    throw Error("Graphite interior site must have three neighbours");
  return atom;
});
export function graphitePositions(shift = 0) {
  return graphiteAtoms.map((a) => ({
    ...a,
    position: [
      a.position[0] + (a.layer === 2 ? shift * 0.22 : 0),
      a.position[1],
      a.position[2],
    ] as [number, number, number],
  }));
}
export type GraphiteMode = "coordination" | "sliding" | "carriers" | "melting";
export function initialGraphiteBoard(
  mode: GraphiteMode,
): Record<string, string | number> {
  switch (mode) {
    case "coordination":
      return { site: 0, neighbours: 0 };
    case "sliding":
      return { force: "unset", effect: "unset", shift: 0 };
    case "carriers":
      return { carrier: "unset", mobility: "unset", drift: 0 };
    case "melting":
      return { force: "unset", energy: "unset" };
  }
}
export function validGraphiteBoard(mode: GraphiteMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    initial = initialGraphiteBoard(mode);
  if (
    Object.keys(b).length !== Object.keys(initial).length ||
    Object.keys(initial).some((k) => !(k in b))
  )
    return false;
  const member = (key: string, values: unknown[]) => values.includes(b[key]);
  switch (mode) {
    case "coordination":
      return member("site", [0, 1, 2]) && member("neighbours", [0, 2, 3, 4, 6]);
    case "sliding":
      return (
        member("force", ["unset", "interlayer", "covalent"]) &&
        member("effect", ["unset", "intact", "break"]) &&
        member("shift", [0, 1, 2, 3])
      );
    case "carriers":
      return (
        member("carrier", ["unset", "electrons", "nuclei", "ions"]) &&
        member("mobility", ["unset", "mobile", "fixed"]) &&
        member("drift", [0, 1, 2, 3])
      );
    case "melting":
      return (
        member("force", ["unset", "covalent", "interlayer"]) &&
        member("energy", ["unset", "high", "low"])
      );
  }
}
export function graphitePrediction(
  mode: GraphiteMode,
  b: Record<string, string | number>,
) {
  let correct = false,
    feedback = "";
  switch (mode) {
    case "coordination":
      correct = b.neighbours === 3;
      feedback = correct
        ? "Three strong covalent bonds connect each interior carbon to three coplanar neighbours in an extended hexagonal sheet. The stacked sheets have no covalent links between them."
        : "Your count is retained. Inspect direct links within the selected sheet: layer stacking does not add a fourth or sixth covalent neighbour. Cut-edge continuation is omitted.";
      break;
    case "sliding":
      correct = b.force === "interlayer" && b.effect === "intact";
      feedback = correct
        ? "Weak attractions between sheets are overcome as layers slide. Strong covalent bonds within each moving sheet remain intact; this explains softness and lubrication."
        : "Your predictions are retained. Sliding moves a sheet with its strong internal bonds intact. Do not explain softness by weak carbon–carbon covalent bonds.";
      break;
    case "carriers":
      correct = b.carrier === "electrons" && b.mobility === "mobile";
      feedback = correct
        ? "Delocalised electrons move through the layers and carry charge. One outer electron per carbon contributes to this mobile pool in the GCSE model. Carbon positions do not have to drift."
        : "Your predictions are retained. Electrons must be mobile carriers through the material; fixed nuclei, hypothetical carbon ions or merely having electrons do not explain graphite conduction.";
      break;
    case "melting":
      correct = b.force === "covalent" && b.energy === "high";
      feedback = correct
        ? "Changing the giant covalent structure requires overcoming many strong covalent bonds within sheets, requiring much energy. Easier layer sliding does not mean low melting."
        : "Your predictions are retained. Separate sliding sheets from changing the giant covalent structure: strong in-layer bonds explain the very high melting temperature.";
      break;
  }
  return { correct, feedback };
}
