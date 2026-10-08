/** Original rolled honeycomb wall. Periodic circumferential coordinates join
 * the seam; open cut ends omit continuation and termination chemistry.
 * Coordinates are idealised, not measured atom sizes or tube dimensions. */
const root3 = Math.sqrt(3);
const circumference = 6 * root3;
const radius = circumference / (2 * Math.PI);
export const nanotubeAtoms = Array.from({ length: 6 }, (_, row) =>
  Array.from({ length: 6 }, (_, column) =>
    [0, 1].map((basis) => {
      const k = column * 2 + (row % 2);
      const angle = (2 * Math.PI * k) / 12;
      return {
        row,
        column,
        k,
        basis,
        position: [
          radius * Math.cos(angle) * 0.45,
          (1.5 * row + basis - 4.25) * 0.45,
          radius * Math.sin(angle) * 0.45,
        ] as [number, number, number],
      };
    }),
  ),
)
  .flat(2)
  .map((a, id) => ({ ...a, id }));
export const nanotubeBonds = nanotubeAtoms.flatMap((a) => {
  if (a.basis !== 0) return [];
  return nanotubeAtoms
    .filter(
      (b) =>
        b.basis === 1 &&
        ((b.row === a.row && b.k === a.k) ||
          (b.row === a.row - 1 &&
            [(a.k + 1) % 12, (a.k + 11) % 12].includes(b.k))),
    )
    .map((b) => ({ a: a.id, b: b.id }));
});
export function nanotubeNeighbours(id: number) {
  return nanotubeBonds
    .filter((b) => b.a === id || b.b === id)
    .map((b) => nanotubeAtoms[b.a === id ? b.b : b.a]);
}
export const nanotubeFocusSites = [24, 30, 36].map((id) => {
  const atom = nanotubeAtoms[id];
  if (nanotubeNeighbours(id).length !== 3)
    throw Error("Tube interior must have three neighbours");
  return atom;
});
export type NanotubeMode = "tube" | "ratio" | "reinforcement" | "electronics";
export const nanotubeMaterials = [
  {
    id: "A",
    material: "Plain polymer",
    density: 1.1,
    strength: 12,
    stiffness: 8,
  },
  {
    id: "B",
    material: "Nanotube composite",
    density: 1.4,
    strength: 40,
    stiffness: 30,
  },
  {
    id: "C",
    material: "Metal alloy",
    density: 2.8,
    strength: 45,
    stiffness: 36,
  },
] as const;
export function initialNanotubeBoard(
  mode: NanotubeMode,
): Record<string, string | number> {
  switch (mode) {
    case "tube":
      return { shape: "unset", neighbours: 0 };
    case "ratio":
      return { length: 1000, diameter: 2, ratio: 0 };
    case "reinforcement":
      return { material: "unset", cause: "unset" };
    case "electronics":
      return { carrier: "unset", mobility: "unset" };
  }
}
export function validNanotubeBoard(mode: NanotubeMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    initial = initialNanotubeBoard(mode);
  if (
    Object.keys(b).length !== Object.keys(initial).length ||
    Object.keys(initial).some((k) => !(k in b))
  )
    return false;
  const member = (key: string, values: unknown[]) => values.includes(b[key]);
  switch (mode) {
    case "tube":
      return (
        member("shape", ["unset", "tube", "sphere", "rod"]) &&
        member("neighbours", [0, 2, 3, 4, 6])
      );
    case "ratio":
      return (
        member("length", [500, 1000, 2000]) &&
        member("diameter", [1, 2, 4]) &&
        member("ratio", [0, 125, 250, 500, 1000, 2000])
      );
    case "reinforcement":
      return (
        member("material", ["unset", "A", "B", "C"]) &&
        member("cause", ["unset", "covalent", "sliding", "electrons"])
      );
    case "electronics":
      return (
        member("carrier", ["unset", "electrons", "ions", "nuclei"]) &&
        member("mobility", ["unset", "mobile", "fixed"])
      );
  }
}
export function nanotubePrediction(
  mode: NanotubeMode,
  b: Record<string, string | number>,
) {
  const correct =
    mode === "tube"
      ? b.shape === "tube" && b.neighbours === 3
      : mode === "ratio"
        ? b.ratio === Number(b.length) / Number(b.diameter)
        : mode === "reinforcement"
          ? b.material === "B" && b.cause === "covalent"
          : b.carrier === "electrons" && b.mobility === "mobile";
  const feedback =
    mode === "tube"
      ? "The wall is a joined hollow carbon cylinder. Three covalent neighbours meet each interior carbon; the cut ends omit continuation and termination, not a real fixed molecular formula."
      : mode === "ratio"
        ? `${b.length} nm ÷ ${b.diameter} nm = ${Number(b.length) / Number(b.diameter)}. The units cancel. Doubling length doubles the ratio; doubling diameter halves it. This dimensional sketch is separate from the short atomic crop.`
        : mode === "reinforcement"
          ? "B meets all supplied limits: density 1.4 g/cm³ ≤ 1.8, strength 40 ≥ 30 and stiffness 30 ≥ 25. Strong covalent bonding can support reinforcement. A fails strength and stiffness; C exceeds the density limit. These are illustrative finished-material results."
          : "In the supplied conducting nanotube, mobile delocalised electrons carry charge through the structure. Fixed electrons, carbon nuclei and moving ions do not explain this conduction. Actual nanotube conductivity varies with structure.";
  return {
    correct,
    feedback: correct ? feedback : `Your predictions are retained. ${feedback}`,
  };
}

export type NanotubeMaterialGiven = {
  maxDensity: number;
  minStrength: number;
  minStiffness: number;
  materials: readonly {
    id: string;
    material: string;
    density: number;
    strength: number;
    stiffness: number;
  }[];
};
