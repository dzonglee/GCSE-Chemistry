/** Original idealised tetrahedral zigzag poly(ethene) crop. Cut endpoints
 * have omitted continuation: each shown carbon has two hydrogens, and the
 * crop is not a completed alkane or a universal polymer molecular formula. */
export function polymerChain(units = 3) {
  const count = units * 2,
    a = Math.sqrt(2 / 3) * 0.55,
    b = 0.55 / Math.sqrt(3);
  const carbons = Array.from({ length: count }, (_, i) => ({
    id: i,
    element: "C" as const,
    carbon: i,
    position: [(i - (count - 1) / 2) * a, ((i % 2) - 0.5) * b, 0] as [
      number,
      number,
      number,
    ],
  }));
  const hydrogens = carbons.flatMap((c) =>
    [-1, 1].map((side, j) => ({
      id: count + c.id * 2 + j,
      element: "H" as const,
      carbon: c.id,
      position: [
        c.position[0],
        c.position[1] + ((c.id % 2 ? 1 : -1) * 0.4) / Math.sqrt(3),
        side * 0.4 * Math.sqrt(2 / 3),
      ] as [number, number, number],
    })),
  );
  const atoms = [...carbons, ...hydrogens];
  const bonds = [
    ...carbons.slice(1).map((c) => ({ a: c.id - 1, b: c.id })),
    ...hydrogens.map((h) => ({ a: h.carbon, b: h.id })),
  ];
  const continuation = carbons
    .filter((c) => c.id === 0 || c.id === count - 1)
    .map((c) => ({
      from: c.id,
      position: [
        c.position[0] + (c.id === 0 ? -a : a),
        c.position[1] + (c.id % 2 ? -b : b),
        0,
      ] as [number, number, number],
    }));
  return { atoms, bonds, continuation, units };
}
export type PolymerMode = "chain" | "repeat" | "separation" | "phase";
export function initialPolymerBoard(
  mode: PolymerMode,
): Record<string, string | number> {
  switch (mode) {
    case "chain":
      return { units: 2, extent: "unset", bond: "unset" };
    case "repeat":
      return {
        backbone: "unset",
        hydrogens: 0,
        continuation: "unset",
        countMark: "unset",
      };
    case "separation":
      return { interaction: "unset", internal: "unset", gap: 0 };
    case "phase":
      return { size: "unset", forces: "unset", energy: "unset" };
  }
}
export function validPolymerBoard(mode: PolymerMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    initial = initialPolymerBoard(mode);
  if (
    Object.keys(b).length !== Object.keys(initial).length ||
    Object.keys(initial).some((k) => !(k in b))
  )
    return false;
  const member = (key: string, values: unknown[]) => values.includes(b[key]);
  switch (mode) {
    case "chain":
      return (
        member("units", [2, 3, 4]) &&
        member("extent", ["unset", "molecule", "network", "separate-units"]) &&
        member("bond", ["unset", "covalent", "between"])
      );
    case "repeat":
      return (
        member("backbone", ["unset", "single", "double"]) &&
        member("hydrogens", [0, 1, 2, 3]) &&
        member("continuation", ["unset", "yes", "no"]) &&
        member("countMark", ["unset", "n", "N"])
      );
    case "separation":
      return (
        member("interaction", ["unset", "between", "covalent"]) &&
        member("internal", ["unset", "intact", "break"]) &&
        member("gap", [0, 1, 2, 3])
      );
    case "phase":
      return (
        member("size", ["unset", "larger", "smaller"]) &&
        member("forces", ["unset", "stronger", "weaker", "covalent"]) &&
        member("energy", ["unset", "more", "less"])
      );
  }
}
export function polymerPrediction(
  mode: PolymerMode,
  b: Record<string, string | number>,
) {
  const correct =
    mode === "chain"
      ? b.extent === "molecule" && b.bond === "covalent"
      : mode === "repeat"
        ? b.backbone === "single" &&
          b.hydrogens === 2 &&
          b.continuation === "yes" &&
          b.countMark === "n"
        : mode === "separation"
          ? b.interaction === "between" && b.internal === "intact"
          : b.size === "larger" &&
            b.forces === "stronger" &&
            b.energy === "more";
  const feedback =
    mode === "chain"
      ? `The shown ${b.units} repeat units are connected through strong covalent bonds in part of one very large molecule. They contribute ${Number(b.units) * 2} carbons and ${Number(b.units) * 4} hydrogens to this crop; omitted ends prevent a complete molecular-formula claim. This is not an extended diamond-like network.`
      : mode === "repeat"
        ? "The poly(ethene) repeat unit has two singly linked carbons, each bonded to two hydrogens. Single continuation bonds cross both bracket sides; lower-case n indicates a large number of joined repeat units. It is not a disconnected ethene monomer with a double bond."
        : mode === "separation"
          ? "Separating intact polymer molecules overcomes between-molecule attractions. Strong covalent bonds within each chain remain intact; cutting the carbon backbone would be a different chemical change. This is a schematic thermoplastic-chain comparison, not all possible crosslinked polymers."
          : "Poly(ethene) has much larger molecules than methane. Its stronger intermolecular forces need more energy to overcome, giving a higher state-change temperature and the supplied solid state at room temperature. Both have strong internal covalent bonds; breaking these does not explain the physical state comparison.";
  return {
    correct,
    feedback: correct ? feedback : `Your predictions are retained. ${feedback}`,
  };
}

export function readPolymerDrawing(raw: string): Record<string, string> | null {
  try {
    const b = JSON.parse(raw);
    if (
      !b ||
      typeof b !== "object" ||
      Array.isArray(b) ||
      Object.keys(b).length !== 4
    )
      return null;
    const allowed: Record<string, string[]> = {
      bondOrder: ["0", "1", "2"],
      hydrogens: ["0", "1", "2", "3"],
      continuation: ["0", "1"],
      countMark: ["0", "1", "2"],
    };
    if (
      Object.entries(allowed).some(
        ([key, values]) =>
          typeof b[key] !== "string" || !values.includes(b[key]),
      )
    )
      return null;
    return b;
  } catch {
    return null;
  }
}
