export interface PolyesterDrawingData {
  note: string;
  diolC: number;
  acidSpacerC: number;
}
export const polyesterRecords: Record<
  string,
  {
    title: string;
    diolC: number;
    acidSpacerC: number;
    diol: string;
    diacid: string;
  }
> = {
  initial: {
    title: "Higher: build the diol/diacid repeating unit",
    diolC: 2,
    acidSpacerC: 2,
    diol: "HO–CH2–CH2–OH",
    diacid: "HOOC–CH2–CH2–COOH",
  },
  longDiol: {
    title: "Higher: retain three diol carbons",
    diolC: 3,
    acidSpacerC: 1,
    diol: "HO–CH2–CH2–CH2–OH",
    diacid: "HOOC–CH2–COOH",
  },
  longAcid: {
    title: "Higher: count four acid spacer carbons plus both carboxyl carbons",
    diolC: 2,
    acidSpacerC: 4,
    diol: "HO–CH2–CH2–OH",
    diacid: "HOOC–CH2–CH2–CH2–CH2–COOH",
  },
  bothLong: {
    title: "Higher: distinguish the two supplied spacers",
    diolC: 3,
    acidSpacerC: 4,
    diol: "HO–CH2–CH2–CH2–OH",
    diacid: "HOOC–CH2–CH2–CH2–CH2–COOH",
  },
  butanediol: {
    title: "Higher: retain a four-carbon diol spacer",
    diolC: 4,
    acidSpacerC: 2,
    diol: "HO–CH2–CH2–CH2–CH2–OH",
    diacid: "HOOC–CH2–CH2–COOH",
  },
};
export const polyesterChoices: Record<string, string[]> = {
  diolC: ["0", "1", "2", "3", "4"],
  acidSpacerC: ["0", "1", "2", "3", "4"],
  leftO: ["0", "1"],
  middleO: ["0", "1"],
  carbonyl1: ["0", "1", "2"],
  carbonyl2: ["0", "1", "2"],
  left: ["0", "1"],
  right: ["0", "1"],
  brackets: ["0", "1"],
  countMark: ["none", "n", "N", "inside"],
};
export function blankPolyesterDrawing(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(polyesterChoices).map(([k, v]) => [k, v[0]]),
  );
}
export function readPolyesterDrawing(
  raw: string,
): Record<string, string> | null {
  try {
    const b = JSON.parse(raw);
    if (
      !b ||
      typeof b !== "object" ||
      Array.isArray(b) ||
      Object.keys(b).length !== Object.keys(polyesterChoices).length
    )
      return null;
    return Object.entries(polyesterChoices).every(
      ([k, v]) =>
        Object.hasOwn(b, k) && typeof b[k] === "string" && v.includes(b[k]),
    )
      ? b
      : null;
  } catch {
    return null;
  }
}
export function polyesterRepeatAtoms(b: Record<string, string>) {
  const spacer = Number(b.diolC) + Number(b.acidSpacerC);
  return {
    C: spacer + 2,
    H: spacer * 2,
    O:
      Number(b.leftO) +
      Number(b.middleO) +
      (b.carbonyl1 !== "0" ? 1 : 0) +
      (b.carbonyl2 !== "0" ? 1 : 0),
  };
}
