export const halogens = {
  chlorine: {
    name: "Chlorine",
    symbol: "Cl",
    halide: "chloride",
    mass: 35.5,
    shells: 3,
    melting: -102,
    boiling: -34,
    bulk: "Yellow-green gas",
    solution: "Pale yellow-green",
    colour: "#d8e984",
  },
  bromine: {
    name: "Bromine",
    symbol: "Br",
    halide: "bromide",
    mass: 80,
    shells: 4,
    melting: -7,
    boiling: 59,
    bulk: "Red-brown liquid",
    solution: "Orange",
    colour: "#eaae58",
  },
  iodine: {
    name: "Iodine",
    symbol: "I",
    halide: "iodide",
    mass: 127,
    shells: 5,
    melting: 114,
    boiling: 184,
    bulk: "Grey-black solid; purple vapour",
    solution: "Brown",
    colour: "#bd8b67",
  },
} as const;
export type Halogen = keyof typeof halogens;
export type Halide = (typeof halogens)[Halogen]["halide"];
export type HalogenRepresentation = "atom" | "molecule" | "ion";
export function halogenParticle(
  halogen: Halogen,
  representation: HalogenRepresentation,
) {
  const atomCount = representation === "molecule" ? 2 : 1;
  return {
    atomCount,
    charge: representation === "ion" ? -1 : 0,
    formula:
      halogens[halogen].symbol +
      (representation === "molecule"
        ? "₂"
        : representation === "ion"
          ? "⁻"
          : ""),
  };
}
const order: Halogen[] = ["chlorine", "bromine", "iodine"];
export function halogenFromHalide(halide: Halide): Halogen {
  return order.find((h) => halogens[h].halide === halide)!;
}
export function displacement(added: Halogen, halide: Halide) {
  const dissolved = halogenFromHalide(halide),
    reacts = order.indexOf(added) < order.indexOf(dissolved);
  const a = halogens[added],
    b = halogens[dissolved];
  return {
    reacts,
    liberated: reacts ? dissolved : null,
    before: `${a.symbol}₂ + 2 ${b.symbol}⁻`,
    after: reacts
      ? `2 ${a.symbol}⁻ + ${b.symbol}₂`
      : `${a.symbol}₂ + 2 ${b.symbol}⁻`,
    equation: reacts
      ? `${a.symbol}₂ + 2 ${b.symbol}⁻ → 2 ${a.symbol}⁻ + ${b.symbol}₂`
      : "No net displacement",
    appearance: reacts ? b.solution : a.solution,
  };
}
export function halogenPhase(halogen: Halogen, temperature: number) {
  if (!Number.isFinite(temperature))
    throw new RangeError("Use a finite temperature.");
  const h = halogens[halogen];
  return temperature < h.melting
    ? "solid"
    : temperature === h.melting
      ? "solid/liquid"
      : temperature < h.boiling
        ? "liquid"
        : temperature === h.boiling
          ? "liquid/gas"
          : "gas";
}
