/** Qualitative metallic fragment. Positive cores include nuclei and inner
 * electrons; M+ and one delocalised electron per core are an illustrative
 * monovalent example, not a universal metal charge or measured unit cell. */
export const metalCorePositions = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  row: Math.floor(i / 4),
  x: 65 + (i % 4) * 75,
  y: 70 + Math.floor(i / 4) * 75,
}));
export function metallicLedger() {
  return {
    cores: 12,
    coreCharge: 12,
    delocalisedElectrons: 12,
    electronCharge: -12,
    netCharge: 0,
  };
}
export function metallicCarrierPrediction(
  carrier: "electrons" | "cores" | "neutral",
) {
  return carrier === "electrons"
    ? {
        correct: true,
        feedback:
          "Delocalised electrons carry electrical charge through the solid metal. Positive cores remain in lattice positions during conduction. Strong electrostatic attraction between the positive cores and delocalised electrons holds the giant structure together.",
      }
    : {
        correct: false,
        feedback:
          carrier === "cores"
            ? "Your core-carrier prediction is retained. In a solid metal, positive cores do not travel through the structure to carry current. Delocalised electrons move through the metal and carry charge."
            : "Your neutral-carrier prediction is retained. Current needs mobile charged carriers: delocalised electrons, not neutral moving molecules.",
      };
}
export function alloyLayerPrediction(
  size: "different" | "same",
  sliding: "harder" | "easier",
) {
  const correct = size === "different" && sliding === "harder";
  return {
    correct,
    feedback: correct
      ? "Different-sized atoms distort the regular layers, making sliding more difficult. This explains why the illustrated alloy is harder than the pure metal. Metallic bonding and delocalised electrons remain; harder does not mean unable to conduct."
      : "Your explanation is retained. Use different ATOM SIZES, not shapes or absent electrons: the distorted layers cannot slide as easily. Do not infer a melting point or complete loss of conductivity from hardness.",
  };
}

export type MetallicMode = "attraction" | "conduction" | "layers" | "alloy";
export function initialMetallicBoard(
  mode: MetallicMode,
): Record<string, string | number> {
  if (mode === "attraction") return { attraction: "unset" };
  if (mode === "conduction") return { carrier: "unset", drift: 0 };
  if (mode === "layers") return { shift: 0, bonding: "unset" };
  return { sample: "pure", size: "unset", sliding: "unset" };
}
export function validMetallicBoard(
  mode: MetallicMode,
  b: Record<string, unknown>,
) {
  const keys = Object.keys(initialMetallicBoard(mode));
  if (Object.keys(b).length !== keys.length || !keys.every((k) => k in b))
    return false;
  const pick = (v: unknown, allowed: string[]) =>
    typeof v === "string" && allowed.includes(v);
  const integer = (v: unknown, max: number) =>
    typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= max;
  if (mode === "attraction")
    return pick(b.attraction, [
      "unset",
      "core-electron",
      "core-core",
      "molecules",
    ]);
  if (mode === "conduction")
    return (
      pick(b.carrier, ["unset", "electrons", "cores", "neutral"]) &&
      integer(b.drift, 4)
    );
  if (mode === "layers")
    return (
      pick(b.bonding, ["unset", "remains", "vanishes"]) && integer(b.shift, 3)
    );
  return (
    pick(b.sample, ["pure", "alloy"]) &&
    pick(b.size, ["unset", "different", "same"]) &&
    pick(b.sliding, ["unset", "harder", "easier"])
  );
}
export function metallicPrediction(
  mode: MetallicMode,
  b: Record<string, string | number>,
) {
  if (mode === "attraction")
    return {
      correct: b.attraction === "core-electron",
      feedback:
        b.attraction === "core-electron"
          ? "Strong electrostatic attraction between positive metal cores and negative delocalised electrons holds the giant metal structure together. Electrons are shared through the structure, not only within separate atom pairs."
          : "Your selected attraction is retained. Positive cores repel one another; metallic bonding is attraction between positive cores and delocalised negative electrons, not weak forces between neutral molecules.",
    };
  if (mode === "conduction")
    return b.carrier === "unset"
      ? {
          correct: false,
          feedback:
            "Choose the particles that carry charge through the solid metal.",
        }
      : metallicCarrierPrediction(
          b.carrier as "electrons" | "cores" | "neutral",
        );
  if (mode === "layers")
    return {
      correct: b.bonding === "remains",
      feedback:
        b.bonding === "remains"
          ? "Layers can slide as a pure metal is shaped while attraction to delocalised electrons remains. This allows malleability without breaking apart the whole metal structure."
          : "Your explanation is retained. Shaping a pure metal does not make every metallic attraction disappear. Positive cores remain attracted to the delocalised electrons while layers change position.",
    };
  if (b.size === "unset" || b.sliding === "unset")
    return {
      correct: false,
      feedback:
        "Compare the samples, then select atom-size difference and its consequence for sliding.",
    };
  return alloyLayerPrediction(
    b.size as "different" | "same",
    b.sliding as "harder" | "easier",
  );
}
