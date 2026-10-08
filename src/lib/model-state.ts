import type { Lesson } from "@/content/types";
const integer = (x: unknown, min: number, max: number) =>
  typeof x === "number" && Number.isInteger(x) && x >= min && x <= max;
const number = (x: unknown, min: number, max: number) =>
  typeof x === "number" && Number.isFinite(x) && x >= min && x <= max;
const choice = (x: unknown, allowed: string[]) =>
  typeof x === "string" && allowed.includes(x);
export function validModel(
  lesson: Lesson,
  state: Record<string, unknown>,
): boolean {
  let rules: Record<string, (x: unknown) => boolean>;
  switch (lesson.model) {
    case "atom":
      rules = {
        p: (x) => integer(x, 1, 20),
        n: (x) => integer(x, 0, 24),
        e: (x) => integer(x, 0, 20),
      };
      break;
    case "balance":
      rules = {
        h: (x) => integer(x, 1, 6),
        o: (x) => integer(x, 1, 6),
        w: (x) => integer(x, 1, 6),
      };
      break;
    case "bond":
      rules = {
        material: (x) =>
          choice(x, [
            "sodium-chloride",
            "copper",
            "diamond",
            "graphite",
            "methane",
          ]),
        melted: (x) => integer(x, 0, 1),
      };
      break;
    case "moles":
      rules = { a: (x) => number(x, 0.1, 60), b: (x) => number(x, 1, 1000) };
      break;
    case "ph":
      rules = { ph: (x) => integer(x, 0, 14) };
      break;
    case "energy":
      rules = {
        react: (x) => integer(x, 10, 90),
        product: (x) => integer(x, 10, 90),
        activation: (x) => integer(x, 20, 70),
        catalyst: (x) => integer(x, 0, 1),
      };
      break;
    case "rate":
      rules = {
        concentration: (x) => integer(x, 1, 4),
        surface: (x) => integer(x, 1, 4),
        temperature: (x) => integer(x, 20, 60),
        catalyst: (x) => integer(x, 0, 1),
      };
      break;
    case "equilibrium":
      rules = {
        pressure: (x) => choice(x, ["same", "high", "low"]),
        temp: (x) => choice(x, ["same", "high", "low"]),
        reactant: (x) => choice(x, ["same", "add"]),
      };
      break;
    case "organic":
      rules = {
        carbon: (x) => integer(x, 2, 8),
        group: (x) => choice(x, ["alkane", "alkene", "alcohol", "acid"]),
      };
      break;
    case "chromatography":
      rules = {
        distance: (x) => number(x, 0, 10),
        front: (x) => integer(x, 1, 10),
      };
      if (Number(state.distance ?? 3) > Number(state.front ?? 6)) return false;
      break;
    case "electrolysis":
      rules = {
        substance: (x) =>
          choice(x, ["molten-nacl", "molten-pbbr", "aqueous-cuso", "brine"]),
      };
      break;
    case "predict":
      rules = { prediction: (x) => typeof x === "string" };
      break;
  }
  return Object.entries(state).every(
    ([key, value]) => rules[key]?.(value) === true,
  );
}
