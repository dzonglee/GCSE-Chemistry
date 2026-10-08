import { graphiteAtoms, graphiteBonds } from "./graphite";
export const grapheneAtoms = graphiteAtoms
  .filter((a) => a.layer === 0)
  .map((a) => ({
    ...a,
    position: [a.position[0], a.position[1], 0] as [number, number, number],
  }));
export const grapheneBonds = graphiteBonds.filter((b) => b.a < 32 && b.b < 32);
export function grapheneNeighbours(id: number) {
  return grapheneBonds
    .filter((b) => b.a === id || b.b === id)
    .map((b) => grapheneAtoms[b.a === id ? b.b : b.a]);
}
export const grapheneFocusSites = [10, 12, 18].map((id) => {
  const atom = grapheneAtoms[id];
  if (grapheneNeighbours(id).length !== 3)
    throw Error("Graphene focus must have three neighbours");
  return atom;
});
export type GrapheneMode = "sheet" | "electronics" | "composite";
export const graphenePanels = [
  { id: "A", material: "Plain polymer panel", mass: 10, load: 8 },
  {
    id: "B",
    material: "Graphene-reinforced polymer panel",
    mass: 12,
    load: 18,
  },
  { id: "C", material: "Metal panel", mass: 20, load: 30 },
] as const;
export function initialGrapheneBoard(
  mode: GrapheneMode,
): Record<string, string | number> {
  switch (mode) {
    case "sheet":
      return { layers: 0, extent: "unset" };
    case "electronics":
      return { property: "unset", carrier: "unset" };
    case "composite":
      return { panel: "unset", cause: "unset" };
  }
}
export function validGrapheneBoard(mode: GrapheneMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    initial = initialGrapheneBoard(mode);
  if (
    Object.keys(b).length !== Object.keys(initial).length ||
    Object.keys(initial).some((k) => !(k in b))
  )
    return false;
  const member = (key: string, values: unknown[]) => values.includes(b[key]);
  switch (mode) {
    case "sheet":
      return (
        member("layers", [0, 1, 3, 4]) &&
        member("extent", ["unset", "network", "molecule"])
      );
    case "electronics":
      return (
        member("property", [
          "unset",
          "thin-conducting",
          "insulating",
          "layer-sliding",
        ]) && member("carrier", ["unset", "mobile", "fixed", "nuclei"])
      );
    case "composite":
      return (
        member("panel", ["unset", "A", "B", "C"]) &&
        member("cause", ["unset", "covalent", "weak", "mobile"])
      );
  }
}
export function graphenePrediction(
  mode: GrapheneMode,
  b: Record<string, string | number>,
) {
  switch (mode) {
    case "sheet":
      return {
        correct: b.layers === 1 && b.extent === "network",
        feedback:
          b.layers === 1 && b.extent === "network"
            ? "Graphene is one atom-layer thick. Its strong covalent links extend through a connected sheet, not a separate 32-carbon molecule. Each selected interior carbon has three bonded neighbours."
            : "Your predictions are retained. Rotate edge-on to count layers, then follow links through the crop. One layer is not one bonded neighbour; a finite asset is not a molecule formula.",
      };
    case "electronics":
      return {
        correct: b.property === "thin-conducting" && b.carrier === "mobile",
        feedback:
          b.property === "thin-conducting" && b.carrier === "mobile"
            ? "A one-atom-thick conducting sheet can suit a thin electrical component. Mobile delocalised electrons carry charge through the sheet; mere presence of fixed electrons is insufficient."
            : "Your choices are retained. This design needs a thin conductor, with mobile delocalised-electron carriers. Graphite-style sliding does not explain electrical conduction.",
      };
    case "composite":
      return {
        correct: b.panel === "B" && b.cause === "covalent",
        feedback:
          b.panel === "B" && b.cause === "covalent"
            ? "Panel B meets both supplied requirements: 12 g ≤ 15 g and 18 N ≥ 15 N. Strong covalent bonding in graphene can support reinforcement; these illustrative results support this supplied panel, not every graphene composite."
            : "Your proposal is retained. Compare both mass and supported load: A is light but fails the load requirement; C supports the load but exceeds the mass limit. Strong in-sheet covalent bonds, not weak interlayer attractions or electrical carriers, explain graphene’s strength.",
      };
  }
}

/** Supplied finished-panel evidence, never measured graphene-film constants. */
export type GraphenePanelGiven = {
  maxMass: number;
  minLoad: number;
  panels: readonly { id: string; mass: number; load: number }[];
};
