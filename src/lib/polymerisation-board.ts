import {
  polyesterChoices,
  polyesterRecords,
  blankPolyesterDrawing,
} from "./polyester";
import {
  additionRecords,
  reverseRecords,
  segmentRecords,
  inventoryRecords,
  esterRecords,
  linkRecords,
  polymerisationRecords,
  sideGroups,
  equivalentGroups,
  repeatInventory,
  type PolymerisationMode,
  type FourGroups,
} from "./polymerisation";
export type PolymerisationBoard = Record<string, string>;
function choices(mode: PolymerisationMode): Record<string, string[]> {
  if (mode === "polyester") return polyesterChoices;
  if (mode === "addition")
    return { ...choices("reverse"), cropUnits: ["2", "3", "4"] };
  if (mode === "reverse")
    return {
      s0: sideGroups,
      s1: sideGroups,
      s2: sideGroups,
      s3: sideGroups,
      bond: ["0", "1", "2"],
      left: ["0", "1"],
      right: ["0", "1"],
      brackets: ["0", "1"],
      countMark: ["none", "n", "N", "inside"],
      product: ["", "onlyPolymer", "water", "hydrogenChloride", "monomers"],
    };
  if (mode === "segment")
    return {
      brackets: ["0", "1"],
      left: ["0", "1"],
      right: ["0", "1"],
      countMark: ["none", "n", "N", "inside"],
    };
  if (mode === "inventory")
    return {
      product: ["", "onlyPolymer", "water", "hydrogenChloride"],
      extent: ["", "contributions", "completeMolecule"],
    };
  if (mode === "ester")
    return {
      acidPart: ["", "OH", "Cl", "wholeCOOH", "carbonylO"],
      alcoholPart: ["", "H", "wholeOH", "carbon"],
      small: ["", "water", "hydrogenChloride", "none"],
      link: ["", "ester", "carbonCarbon", "ionic"],
      growth: ["", "yes", "no"],
    };
  return {
    basis: ["", "actualLinks", "monomers", "twoPerRepeat"],
    extent: ["", "specifiedOpenDiagram", "everyPolymer"],
  };
}
export function initialPolymerisationBoard(
  mode: PolymerisationMode,
  record = "initial",
): PolymerisationBoard {
  const fixed = { record },
    c = choices(mode);
  for (const [k, v] of Object.entries(c)) Object.assign(fixed, { [k]: v[0] });
  const fields =
    mode === "segment"
      ? ["start", "length"]
      : mode === "inventory"
        ? ["C", "H", "Cl", "F", "Mr"]
        : mode === "ester"
          ? ["acidCount", "alcoholCount"]
          : mode === "links"
            ? ["links", "smallCount", "components"]
            : [];
  return { ...fixed, ...Object.fromEntries(fields.map((k) => [k, ""])) };
}
export function validPolymerisationBoard(
  mode: PolymerisationMode,
  value: unknown,
): value is PolymerisationBoard {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as PolymerisationBoard;
  if (
    typeof b.record !== "string" ||
    !Object.hasOwn(polymerisationRecords[mode], b.record)
  )
    return false;
  const initial = initialPolymerisationBoard(mode, b.record),
    c = choices(mode);
  return (
    Object.keys(b).length === Object.keys(initial).length &&
    Object.keys(initial).every(
      (k) =>
        Object.hasOwn(b, k) &&
        typeof b[k] === "string" &&
        (k === "record" || (c[k] ? c[k].includes(b[k]) : b[k].length <= 24)),
    )
  );
}
export function boardGroups(b: PolymerisationBoard): FourGroups {
  return [b.s0, b.s1, b.s2, b.s3] as FourGroups;
}
export function expectedPolymerisationBoard(
  mode: PolymerisationMode,
  record = "initial",
): PolymerisationBoard {
  const b = initialPolymerisationBoard(mode, record);
  if (mode === "polyester") {
    const r = polyesterRecords[record];
    return {
      ...b,
      ...blankPolyesterDrawing(),
      diolC: String(r.diolC),
      acidSpacerC: String(r.acidSpacerC),
      leftO: "1",
      middleO: "1",
      carbonyl1: "2",
      carbonyl2: "2",
      left: "1",
      right: "1",
      brackets: "1",
      countMark: "n",
    };
  }
  if (mode === "addition" || mode === "reverse") {
    const r = (mode === "addition" ? additionRecords : reverseRecords)[record];
    r.groups.forEach((g, i) => (b["s" + i] = g));
    Object.assign(
      b,
      mode === "addition"
        ? {
            bond: "1",
            left: "1",
            right: "1",
            brackets: "1",
            countMark: "n",
            product: "onlyPolymer",
          }
        : {
            bond: "2",
            left: "0",
            right: "0",
            brackets: "0",
            countMark: "none",
            product: "monomers",
          },
    );
  } else if (mode === "segment")
    Object.assign(b, {
      start: String(segmentRecords[record].start),
      length: "2",
      left: "1",
      right: "1",
      brackets: "1",
      countMark: "n",
    });
  else if (mode === "inventory") {
    const r = inventoryRecords[record];
    r.atoms.forEach((v, i) => (b[["C", "H", "Cl", "F"][i]] = String(v)));
    Object.assign(b, {
      Mr: String(r.repeatMr * r.units),
      product: "onlyPolymer",
      extent: "contributions",
    });
  } else if (mode === "ester") {
    const r = esterRecords[record];
    Object.assign(b, {
      acidCount: String(r.acidGroups),
      alcoholCount: String(r.alcoholGroups),
      acidPart: r.small === "water" ? "OH" : "Cl",
      alcoholPart: "H",
      small: r.small,
      link: "ester",
      growth: r.polymerPossible ? "yes" : "no",
    });
  } else {
    const r = linkRecords[record];
    Object.assign(b, {
      links: String(r.edges.length),
      smallCount: String(r.edges.length),
      components: String(r.components),
      basis: "actualLinks",
      extent: "specifiedOpenDiagram",
    });
  }
  return b;
}
export function polymerisationNumber(raw: string): number | null {
  if (!/^-?\d+(?:\.\d+)?$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
function numericEqual(raw: string, expected: string) {
  const n = polymerisationNumber(raw);
  return n !== null && n === Number(expected);
}
export function checkPolymerisationBoard(
  mode: PolymerisationMode,
  b: PolymerisationBoard,
) {
  if (!validPolymerisationBoard(mode, b))
    return {
      correct: false,
      message:
        "Keep the original saved proposal; it does not match this activity schema.",
    };
  const e = expectedPolymerisationBoard(mode, b.record),
    c = choices(mode);
  let correct = Object.entries(e).every(
    ([k, v]) => k === "record" || (c[k] ? b[k] === v : numericEqual(b[k], v)),
  );
  if (mode === "addition" || mode === "reverse")
    correct =
      equivalentGroups(boardGroups(b), boardGroups(e)) &&
      ["bond", "left", "right", "brackets", "countMark", "product"].every(
        (k) => b[k] === e[k],
      );
  if (mode === "segment") {
    const r = segmentRecords[b.record],
      start = Number(b.start),
      length = Number(b.length);
    correct =
      numericEqual(b.start, String(start)) &&
      Number.isInteger(start) &&
      start >= 0 &&
      start + 2 <= 2 * r.units &&
      length === 2 &&
      numericEqual(b.length, "2") &&
      ["left", "right", "brackets", "countMark"].every((k) => b[k] === e[k]);
  }
  const text: Record<PolymerisationMode, [string, string]> = {
    polyester: [
      "Your supplied diol/diacid spacers, both retained carbonyl oxygens, both alcohol-derived linking oxygens and continuation/bracket notation agree with this Higher repeat.",
      "Keep the supplied diol and acid spacer lengths distinct. Both carboxyl carbons remain, with C=O; alcohol oxygens form the two ester bridges. Show both single continuations and lower-right n. No terminal H is added to a cropped repeating unit.",
    ],
    addition: [
      "The reacting C=C becomes C–C; all original side groups remain on their carbons, with one outward single chain bond per backbone carbon, both bracket continuations and lower-right n. No small molecule is eliminated.",
      "Keep your proposal. Preserve the supplied substituents on their original carbon, change the C=C to C–C and show one continuation bond through each bracket. Lower-case n belongs outside at the lower right; addition makes no small-molecule by-product.",
    ],
    reverse: [
      "Your separate alkene monomer has C=C, the original polymer side groups and no chain continuation bonds or polymer brackets. Equivalent rotated/reversed displayed orientations are accepted.",
      "A two-carbon polymer-derived repeat becomes a separate C=C monomer. Keep the actual side-group attachment pattern; a matching total formula alone is insufficient. Remove polymer brackets, n and continuation bonds.",
    ],
    segment: [
      "Your two adjacent backbone carbons and all their side groups form one complete monomer-derived repeat. An equivalent shifted phase is accepted. Both single continuation bonds pass through brackets with lower-right n.",
      "Select exactly the two-carbon backbone contribution from one supplied alkene monomer, with every side group attached. This stated task requests a monomer-derived unit, not a smaller translational motif or several units. Show both continuations and proper bracket/n notation.",
    ],
    inventory: [
      "Your original repeat contributions preserve every C/H/Cl/F atom and their supplied relative-mass contribution. Addition loses no small molecule. These are cropped repeat contributions, not a full end-group molecular formula.",
      "Count each side group as well as the backbone. Multiply the original repeat inventory by the stated unit count. No small molecule is removed in addition; the omitted chain ends prevent a full molecule formula/mass claim.",
    ],
    ester: [
      "Your functional-group counts, actual leaving fragments, ester link and chain-growth judgement agree with the supplied Higher reactants.",
      "Use the actual displayed reactive groups. A diacid OH and alcohol H form water, whereas the explicitly provided acid-chloride case loses Cl and H as HCl. An ester reaction alone does not prove polymer growth when a supplied reagent has only one reactive group.",
    ],
    links: [
      "You counted the actual formed links, one specified small molecule per link, and the connected components of this finite open diagram. The result is specific to the supplied graph.",
      "Count the links that are actually shown, not every monomer or two hypothetical links per unit. For these supplied open chains, links = nodes minus connected components; unlinked monomers count as components. One stated small molecule forms per actual link.",
    ],
  };
  return { correct, message: text[mode][correct ? 0 : 1] };
}
export function polymerisationHistoryStep(
  mode: PolymerisationMode,
  before: PolymerisationBoard,
  after: PolymerisationBoard,
) {
  if (
    !validPolymerisationBoard(mode, before) ||
    !validPolymerisationBoard(mode, after)
  )
    return false;
  if (before.record !== after.record)
    return Object.entries(initialPolymerisationBoard(mode, after.record)).every(
      ([k, v]) => after[k] === v,
    );
  const changed = Object.keys(before).filter((k) => before[k] !== after[k]);
  return changed.length === 1;
}
export function proposalValences(b: PolymerisationBoard) {
  const g = boardGroups(b);
  return [0, 1].map(
    (i) =>
      Number(b.bond) +
      (g[i * 2] !== "none" ? 1 : 0) +
      (g[i * 2 + 1] !== "none" ? 1 : 0) +
      Number(i === 0 ? b.left : b.right),
  );
}
export interface PolymerisationDrawing {
  kind: "repeat" | "monomer";
  note: string;
}
export function blankPolymerisationDrawing(): Record<string, string> {
  return {
    s0: "none",
    s1: "none",
    s2: "none",
    s3: "none",
    bond: "0",
    left: "0",
    right: "0",
    brackets: "0",
    countMark: "none",
  };
}
export function readPolymerisationDrawing(
  raw: string,
): Record<string, string> | null {
  try {
    const b = JSON.parse(raw),
      blank = blankPolymerisationDrawing(),
      c = choices("addition");
    if (
      !b ||
      typeof b !== "object" ||
      Array.isArray(b) ||
      Object.keys(b).length !== Object.keys(blank).length
    )
      return null;
    return Object.keys(blank).every(
      (k) =>
        Object.hasOwn(b, k) && typeof b[k] === "string" && c[k].includes(b[k]),
    )
      ? b
      : null;
  } catch {
    return null;
  }
}
export { repeatInventory };
