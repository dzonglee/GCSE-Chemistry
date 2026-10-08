export type NanoMode = "subdivide" | "cube" | "scale" | "evidence";
export function cubeData(side: number) {
  if (!Number.isFinite(side) || side <= 0)
    throw Error("Use a positive finite side");
  return { side, area: 6 * side ** 2, volume: side ** 3, quotient: 6 / side };
}
/** Ideal separate cubes at fixed physical scale; gaps contain no material.
 * The coarse blocks represent chunks/particles, never individual atoms. */
export function nanoBlocks(divisions: number, separated: boolean) {
  if (![1, 2, 3].includes(divisions))
    throw Error("Use one, two or three subdivisions per edge");
  const side = 6 / divisions,
    gap = separated && divisions > 1 ? 1 : 0;
  return Array.from({ length: divisions ** 3 }, (_, id) => {
    const x = id % divisions,
      y = Math.floor(id / divisions) % divisions,
      z = Math.floor(id / divisions ** 2);
    return {
      id,
      side,
      position: [x, y, z].map(
        (i) => (i - (divisions - 1) / 2) * (side + gap),
      ) as [number, number, number],
    };
  });
}
export function subdivisionData(divisions: number, separated: boolean) {
  const blocks = nanoBlocks(divisions, separated),
    one = cubeData(6 / divisions);
  return {
    count: blocks.length,
    particleSide: one.side,
    totalVolume: blocks.length * one.volume,
    exposedArea: separated ? blocks.length * one.area : 216,
    quotient: (separated ? blocks.length * one.area : 216) / 216,
  };
}
export function initialNanoBoard(
  mode: NanoMode,
): Record<string, string | number> {
  switch (mode) {
    case "subdivide":
      return { divisions: 1, separated: "no", area: "unset", volume: "unset" };
    case "cube":
      return { side: 4, area: "unset", volume: "unset", ratio: "unset" };
    case "scale":
      return { diameter: 40, metres: "unset", comparison: "unset" };
    case "evidence":
      return { application: "coating", benefit: "unset", risk: "unset" };
  }
}
export function validNanoBoard(mode: NanoMode, v: unknown) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const b = v as Record<string, unknown>,
    initial = initialNanoBoard(mode);
  if (
    Object.keys(b).length !== Object.keys(initial).length ||
    Object.keys(initial).some((k) => !(k in b))
  )
    return false;
  const one = (k: string, values: unknown[]) => values.includes(b[k]);
  switch (mode) {
    case "subdivide":
      return (
        one("divisions", [1, 2, 3]) &&
        one("separated", ["no", "yes"]) &&
        one("area", ["unset", "same", "larger", "smaller"]) &&
        one("volume", ["unset", "same", "larger", "smaller"])
      );
    case "cube":
      return (
        one("side", [2, 4, 6]) &&
        one("area", ["unset", "24", "96", "216", "16", "64", "36"]) &&
        one("volume", ["unset", "8", "64", "216", "24", "96", "36"]) &&
        one("ratio", ["unset", "3", "1.5", "1", "6", "0.5"])
      );
    case "scale":
      return (
        one("diameter", [20, 40, 80]) &&
        one("metres", ["unset", "2e-8", "4e-8", "8e-8", "4e-7", "4e-9"]) &&
        one("comparison", ["unset", "100", "200", "400", "40"])
      );
    case "evidence":
      return (
        one("application", ["coating", "catalyst"]) &&
        one("benefit", ["unset", "less", "transparent", "never-toxic"]) &&
        one("risk", ["unset", "study", "safe", "ban"])
      );
  }
}
export function nanoPrediction(
  mode: NanoMode,
  b: Record<string, string | number>,
) {
  let correct = false,
    feedback = "";
  switch (mode) {
    case "subdivide": {
      const increased = Number(b.divisions) > 1 && b.separated === "yes";
      correct =
        b.area === (increased ? "larger" : "same") && b.volume === "same";
      feedback = correct
        ? "The material volume stays 216 illustrative units³. Separating smaller cubes exposes previously internal faces; the empty viewing gaps add no material."
        : "Keep the material quantity fixed. Touching cut faces remain internal; separating the pieces exposes them. Volume is conserved, not increased by viewing gaps.";
      break;
    }
    case "cube": {
      const d = cubeData(Number(b.side));
      correct =
        Number(b.area) === d.area &&
        Number(b.volume) === d.volume &&
        Number(b.ratio) === d.quotient;
      feedback = correct
        ? "Six square faces give 6a²; volume is a³. The numerical area-to-volume quotient is 6/a in nm⁻¹, not a dimensionless fraction."
        : "Count all six faces, square the side for area and cube it for volume. Divide area by volume using the same length unit.";
      break;
    }
    case "scale":
      correct =
        Number(b.metres) === Number(b.diameter) * 1e-9 &&
        Number(b.comparison) === Number(b.diameter) / 0.2;
      feedback = correct
        ? "1 nm = 10⁻⁹ m. Dividing by the supplied 0.2 nm atom diameter compares lengths; it does not count atoms inside a particle."
        : "Convert nanometres to metres, then divide matching length units by the supplied atom diameter. Do not turn a diameter ratio into an atom count.";
      break;
    case "evidence":
      correct = b.benefit === "less" && b.risk === "study";
      feedback = correct
        ? "The supplied test supports less material for the same effect. Investigate release and exposure before drawing a safety conclusion; neither particle size nor this performance test proves all uses safe."
        : "Use the supplied performance comparison and distinguish it from missing exposure evidence. Do not infer universal transparency or safety from nanoscale size.";
      break;
  }
  return { correct, feedback };
}
