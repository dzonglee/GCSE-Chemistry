export type NaturalMode =
  | "identify"
  | "repeat"
  | "dna"
  | "sequence"
  | "peptide"
  | "mass"
  | "core"
  | "peptideUnit";
export type NaturalBoard = Record<string, string>;
export type NaturalFocus =
  "all" | "unit" | "count" | "types" | "shape" | "Mr" | "H" | "ends" | "core";
export type NaturalDiagramData = {
  mode: "dna" | "repeat" | "peptide" | "peptideUnit";
  record: string;
};
export const aminoAcids = {
  glycine: {
    name: "Glycine",
    formula: "H₂N–CH₂–COOH",
    mr: 75,
    C: 2,
    H: 5,
    N: 1,
    O: 2,
    core: "CH₂",
  },
  alanine: {
    name: "Alanine",
    formula: "H₂N–CH(CH₃)–COOH",
    mr: 89,
    C: 3,
    H: 7,
    N: 1,
    O: 2,
    core: "CH(CH₃)",
  },
  beta: {
    name: "Beta-alanine",
    formula: "H₂N–CH₂–CH₂–COOH",
    mr: 89,
    C: 3,
    H: 7,
    N: 1,
    O: 2,
    core: "CH₂–CH₂",
  },
} as const;
export type AminoId = keyof typeof aminoAcids;
export const identifyCases = {
  initial: {
    title: "One unit on a DNA strand",
    polymer: "DNA",
    clue: "Two long chains wind around one another. Each marked strand unit is one nucleotide.",
    monomer: "nucleotides",
  },
  protein: {
    title: "A protein chain",
    polymer: "Protein",
    clue: "The supplied chain contains different amino-acid contributions joined by peptide links.",
    monomer: "aminoAcids",
  },
  starch: {
    title: "Starch in a plant",
    polymer: "Starch",
    clue: "This named plant storage polymer is built from glucose-derived units.",
    monomer: "glucose",
  },
  cellulose: {
    title: "Cellulose in a cell wall",
    polymer: "Cellulose",
    clue: "This named plant cell-wall polymer is built from glucose-derived units. Its linking arrangement differs from starch.",
    monomer: "glucose",
  },
  mixed: {
    title: "Different units in one chain",
    polymer: "Protein",
    clue: "The supplied protein excerpt contains glycine and alanine contributions. A protein need not use identical amino acids throughout.",
    monomer: "aminoAcids",
  },
  fragment: {
    title: "A supplied glucose-derived crop",
    polymer: "Glucose-based polymer",
    clue: "The crop shows glucose-derived rings. This alone is insufficient here to choose uniquely between starch and cellulose.",
    monomer: "glucose",
  },
} as const;
export const repeatCases = {
  initial: { title: "Three glucose-derived units", rings: 3, start: 0 },
  four: { title: "Four glucose-derived units", rings: 4, start: 0 },
  shifted: {
    title: "A crop beginning with the bridge oxygen",
    rings: 3,
    start: 1,
  },
  cellulose: { title: "Named cellulose excerpt", rings: 4, start: 0 },
  middle: {
    title: "Select a complete middle contribution",
    rings: 5,
    start: 0,
  },
  short: { title: "Two glucose-derived units", rings: 2, start: 0 },
} as const;
export const dnaCases = {
  initial: { title: "Read a four-position excerpt", source: "ACGT" },
  two: { title: "A short two-position excerpt", source: "AT" },
  repeated: { title: "Repeated units are still nucleotides", source: "AAAA" },
  six: { title: "Six positions on each strand", source: "GATTAC" },
  eight: {
    title: "Eight positions, not eight whole DNA molecules",
    source: "ACGTACGT",
  },
  cg: {
    title: "An excerpt containing only two of the four possible types",
    source: "CGCG",
  },
} as const;
export const sequenceCases = {
  initial: {
    title: "Same composition, changed order",
    first: ["glycine", "alanine", "glycine"],
    second: ["alanine", "glycine", "glycine"],
  },
  same: {
    title: "Identical supplied sequence",
    first: ["glycine", "alanine"],
    second: ["glycine", "alanine"],
  },
  different: {
    title: "A changed contribution",
    first: ["glycine", "alanine"],
    second: ["alanine", "alanine"],
  },
  long: {
    title: "A four-unit rearrangement",
    first: ["glycine", "alanine", "glycine", "alanine"],
    second: ["alanine", "glycine", "alanine", "glycine"],
  },
  beta: {
    title: "Same formula, different supplied connectivity",
    first: ["glycine", "alanine"],
    second: ["glycine", "beta"],
  },
  gly: {
    title: "Two identical glycine excerpts",
    first: ["glycine", "glycine", "glycine"],
    second: ["glycine", "glycine", "glycine"],
  },
} satisfies Record<
  string,
  { title: string; first: AminoId[]; second: AminoId[] }
>;
export const peptideCases = {
  initial: {
    title: "Join two glycine molecules",
    units: ["glycine", "glycine"],
  },
  three: {
    title: "A finite three-glycine chain",
    units: ["glycine", "glycine", "glycine"],
  },
  four: {
    title: "A finite four-glycine chain",
    units: ["glycine", "glycine", "glycine", "glycine"],
  },
  mixed: { title: "Join glycine then alanine", units: ["glycine", "alanine"] },
  beta: {
    title: "Join two supplied beta-alanine molecules",
    units: ["beta", "beta"],
  },
  mixedThree: {
    title: "Preserve the given glycine–alanine–glycine order",
    units: ["glycine", "alanine", "glycine"],
  },
} satisfies Record<string, { title: string; units: AminoId[] }>;
export const massCases = {
  initial: {
    title: "Two glycines, one actual link",
    units: ["glycine", "glycine"],
    links: 1,
    water: 1,
    mr: 132,
    C: 4,
    H: 8,
    N: 2,
    O: 3,
  },
  three: {
    title: "Three glycines, two actual links",
    units: ["glycine", "glycine", "glycine"],
    links: 2,
    water: 2,
    mr: 189,
    C: 6,
    H: 11,
    N: 3,
    O: 4,
  },
  four: {
    title: "Four glycines, three actual links",
    units: ["glycine", "glycine", "glycine", "glycine"],
    links: 3,
    water: 3,
    mr: 246,
    C: 8,
    H: 14,
    N: 4,
    O: 5,
  },
  mixed: {
    title: "Glycine and alanine in one dipeptide",
    units: ["glycine", "alanine"],
    links: 1,
    water: 1,
    mr: 146,
    C: 5,
    H: 10,
    N: 2,
    O: 3,
  },
  mixedThree: {
    title: "Glycine–alanine–glycine open chain",
    units: ["glycine", "alanine", "glycine"],
    links: 2,
    water: 2,
    mr: 203,
    C: 7,
    H: 13,
    N: 3,
    O: 4,
  },
  alanine: {
    title: "Three alanines with terminal groups retained",
    units: ["alanine", "alanine", "alanine"],
    links: 2,
    water: 2,
    mr: 231,
    C: 9,
    H: 17,
    N: 3,
    O: 4,
  },
} satisfies Record<
  string,
  {
    title: string;
    units: AminoId[];
    links: number;
    water: number;
    mr: number;
    C: number;
    H: number;
    N: number;
    O: number;
  }
>;
export const coreCases = {
  initial: {
    title: "Unknown section in a monomer of Mr 75",
    wholeMr: 75,
    aminoMr: 16,
    acidMr: 45,
    endsMr: 61,
    coreMr: 14,
  },
  larger: {
    title: "Unknown section in a monomer of Mr 89",
    wholeMr: 89,
    aminoMr: 16,
    acidMr: 45,
    endsMr: 61,
    coreMr: 28,
  },
  unfamiliar: {
    title: "Unknown section in an unfamiliar monomer of Mr 103",
    wholeMr: 103,
    aminoMr: 16,
    acidMr: 45,
    endsMr: 61,
    coreMr: 42,
  },
} as const;
export const peptideUnitCases = {
  initial: { title: "Glycine: preserve the CH₂ section", amino: "glycine" },
  beta: { title: "Beta-alanine: preserve both CH₂ groups", amino: "beta" },
  alanine: {
    title: "Alanine: preserve the supplied side group",
    amino: "alanine",
  },
} satisfies Record<string, { title: string; amino: AminoId }>;
export const naturalRecords = {
  peptideUnit: peptideUnitCases,
  core: coreCases,
  identify: identifyCases,
  repeat: repeatCases,
  dna: dnaCases,
  sequence: sequenceCases,
  peptide: peptideCases,
  mass: massCases,
};
export const complement = { A: "T", T: "A", C: "G", G: "C" } as const;
export const naturalFields: Record<
  NaturalMode,
  Record<string, readonly string[] | null>
> = {
  peptideUnit: {
    record: null,
    nitrogen: ["", "NH", "NH2", "N"],
    carbonyl: ["", "double", "single", "absent"],
    acidOH: ["", "removed", "retained"],
    core: ["", "CH2", "CH2CH2", "CHCH3"],
    continuation: ["", "both", "left", "right", "neither"],
    brackets: ["", "shown", "absent"],
    multiplier: ["", "n", "1", "2"],
    junction: ["", "CN", "CO", "CC"],
  },
  core: {
    record: null,
    aminoMr: null,
    acidMr: null,
    endsMr: null,
    coreMr: null,
  },
  identify: {
    record: null,
    monomer: ["", "nucleotides", "aminoAcids", "glucose", "ethene", "ions"],
    polymer: [
      "",
      "DNA",
      "Protein",
      "Starch",
      "Cellulose",
      "Glucose-based polymer",
    ],
  },
  repeat: {
    record: null,
    start: null,
    end: null,
    monomer: ["", "glucose", "oxygen", "ethene", "nucleotide"],
    boundary: ["", "oneRingOneBridge", "ringOnly", "bridgeOnly", "wholeCrop"],
  },
  dna: {
    record: null,
    unit: ["", "leftNucleotide", "rightNucleotide", "rung", "baseOnly"],
    strands: ["", "1", "2", "4"],
    shape: ["", "doubleHelix", "singleHelix", "flatLadder"],
    monomer: ["", "nucleotide", "glucose", "aminoAcid", "base"],
    types: null,
    total: null,
    p0: ["", "A", "T", "C", "G"],
    p1: ["", "A", "T", "C", "G"],
    p2: ["", "A", "T", "C", "G"],
    p3: ["", "A", "T", "C", "G"],
    p4: ["", "A", "T", "C", "G"],
    p5: ["", "A", "T", "C", "G"],
    p6: ["", "A", "T", "C", "G"],
    p7: ["", "A", "T", "C", "G"],
  },
  sequence: {
    record: null,
    order: ["", "same", "different"],
    composition: ["", "same", "different"],
    function: ["", "notDetermined", "mustSame", "mustDifferent"],
    s0: ["", "glycine", "alanine", "beta"],
    s1: ["", "glycine", "alanine", "beta"],
    s2: ["", "glycine", "alanine", "beta"],
    s3: ["", "glycine", "alanine", "beta"],
  },
  peptide: {
    record: null,
    link: ["", "CN", "CO", "CC", "none"],
    acidOH: ["", "retained", "removed"],
    aminoH: ["", "0", "1", "2"],
    carbonyl: ["", "single", "double", "absent"],
    water: null,
    leftEnd: ["", "NH2", "NH", "N"],
    rightEnd: ["", "COOH", "CO", "COO"],
    mechanism: ["", "condensation", "addition", "ionic"],
  },
  mass: {
    record: null,
    links: null,
    water: null,
    Mr: null,
    C: null,
    H: null,
    N: null,
    O: null,
    count: ["", "finiteOpenChain", "repeatOnly", "feedOnly"],
  },
};
export function initialNaturalBoard(
  mode: NaturalMode,
  record = "initial",
): NaturalBoard {
  if (!Object.hasOwn(naturalRecords[mode], record))
    throw Error("Unknown natural-polymer case");
  return Object.fromEntries(
    Object.keys(naturalFields[mode]).map((k) => [
      k,
      k === "record" ? record : "",
    ]),
  );
}
export function validNaturalBoard(
  mode: NaturalMode,
  value: unknown,
): value is NaturalBoard {
  if (
    !Object.hasOwn(naturalRecords, mode) ||
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  )
    return false;
  const b = value as NaturalBoard,
    f = naturalFields[mode];
  return (
    Object.keys(b).length === Object.keys(f).length &&
    Object.keys(f).every(
      (k) =>
        Object.hasOwn(b, k) &&
        typeof b[k] === "string" &&
        b[k].length <= 24 &&
        (f[k] === null || f[k]!.includes(b[k])),
    ) &&
    Object.hasOwn(naturalRecords[mode], b.record) &&
    (mode !== "dna" ||
      Object.keys(b).every(
        (k) =>
          !/^p[0-7]$/.test(k) ||
          Number(k.slice(1)) <
            dnaCases[b.record as keyof typeof dnaCases].source.length ||
          b[k] === "",
      )) &&
    (mode !== "sequence" ||
      Object.keys(b).every(
        (k) =>
          !/^s[0-3]$/.test(k) ||
          Number(k.slice(1)) <
            sequenceCases[b.record as keyof typeof sequenceCases].second
              .length ||
          b[k] === "",
      ))
  );
}
export function naturalNumber(v: string): number | null {
  return /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(v) && Number.isFinite(Number(v))
    ? Number(v)
    : null;
}
export function expectedNaturalBoard(
  mode: NaturalMode,
  id = "initial",
): NaturalBoard {
  const b = initialNaturalBoard(mode, id);
  switch (mode) {
    case "core": {
      const r = coreCases[id as keyof typeof coreCases];
      return {
        ...b,
        aminoMr: String(r.aminoMr),
        acidMr: String(r.acidMr),
        endsMr: String(r.endsMr),
        coreMr: String(r.coreMr),
      };
    }
    case "identify": {
      const r = identifyCases[id as keyof typeof identifyCases];
      return { ...b, monomer: r.monomer, polymer: r.polymer };
    }
    case "repeat":
      return {
        ...b,
        start: "0",
        end: "2",
        monomer: "glucose",
        boundary: "oneRingOneBridge",
      };
    case "dna": {
      const r = dnaCases[id as keyof typeof dnaCases];
      return {
        ...b,
        unit: "leftNucleotide",
        strands: "2",
        shape: "doubleHelix",
        monomer: "nucleotide",
        types: "4",
        total: String(2 * r.source.length),
        ...Object.fromEntries(
          [...r.source].map((x, i) => [
            "p" + i,
            complement[x as keyof typeof complement],
          ]),
        ),
      };
    }
    case "sequence": {
      const r = sequenceCases[id as keyof typeof sequenceCases];
      const inventory = (a: AminoId[]) =>
        JSON.stringify(
          a.reduce(
            (t, k) => {
              const r = aminoAcids[k];
              return [t[0] + r.C, t[1] + r.H, t[2] + r.N, t[3] + r.O];
            },
            [0, 0, 0, 0],
          ),
        );
      return {
        ...b,
        order:
          JSON.stringify(r.first) === JSON.stringify(r.second)
            ? "same"
            : "different",
        composition:
          inventory(r.first) === inventory(r.second) ? "same" : "different",
        function: "notDetermined",
        ...Object.fromEntries(r.second.map((x, i) => ["s" + i, x])),
      };
    }
    case "peptideUnit": {
      const r = peptideUnitCases[id as keyof typeof peptideUnitCases];
      return {
        ...b,
        nitrogen: "NH",
        carbonyl: "double",
        acidOH: "removed",
        core:
          r.amino === "glycine"
            ? "CH2"
            : r.amino === "beta"
              ? "CH2CH2"
              : "CHCH3",
        continuation: "both",
        brackets: "shown",
        multiplier: "n",
        junction: "CN",
      };
    }
    case "peptide": {
      const r = peptideCases[id as keyof typeof peptideCases];
      return {
        ...b,
        link: "CN",
        acidOH: "removed",
        aminoH: "1",
        carbonyl: "double",
        water: String(r.units.length - 1),
        leftEnd: "NH2",
        rightEnd: "COOH",
        mechanism: "condensation",
      };
    }
    case "mass": {
      const r = massCases[id as keyof typeof massCases];
      return {
        ...b,
        links: String(r.links),
        water: String(r.water),
        Mr: String(r.mr),
        C: String(r.C),
        H: String(r.H),
        N: String(r.N),
        O: String(r.O),
        count: "finiteOpenChain",
      };
    }
  }
}
export function checkNaturalBoard(
  mode: NaturalMode,
  b: NaturalBoard,
  focus: NaturalFocus = "all",
): { correct: boolean; message: string } {
  if (!validNaturalBoard(mode, b))
    return {
      correct: false,
      message:
        "This saved proposal cannot be read. Its original bytes must be retained until you choose a reset.",
    };
  const t = expectedNaturalBoard(mode, b.record);
  if (mode === "repeat") {
    const r = repeatCases[b.record as keyof typeof repeatCases],
      start = naturalNumber(b.start),
      end = naturalNumber(b.end);
    if (
      start === null ||
      end === null ||
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 0 ||
      end > 2 * r.rings ||
      end - start !== 2
    )
      return {
        correct: false,
        message:
          "Select two consecutive contributions: one entire glucose-derived ring and one bridge oxygen. Do not include the whole crop or an oxygen alone.",
      };
    t.start = b.start;
    t.end = b.end;
  }
  if (mode === "dna" && b.unit === "rightNucleotide")
    t.unit = "rightNucleotide";
  const numeric: Record<NaturalMode, string[]> = {
    peptideUnit: [],
    core: ["aminoMr", "acidMr", "endsMr", "coreMr"],
    identify: [],
    repeat: ["start", "end"],
    dna: ["types", "total"],
    sequence: [],
    peptide: ["water"],
    mass: ["links", "water", "Mr", "C", "H", "N", "O"],
  };
  const focusFields: Record<string, string[]> =
    mode === "dna"
      ? { unit: ["unit"], count: ["total"], types: ["types"], shape: ["shape"] }
      : mode === "mass"
        ? { Mr: ["Mr"], H: ["H"] }
        : mode === "core"
          ? { ends: ["endsMr"], core: ["coreMr"] }
          : {};
  const asked = focusFields[focus] || Object.keys(t);
  const key = asked.find((k) =>
    numeric[mode].includes(k)
      ? naturalNumber(b[k]) !== Number(t[k])
      : b[k] !== t[k],
  );
  if (key) {
    if (mode === "dna" && focus !== "all")
      return {
        correct: false,
        message:
          focus === "unit"
            ? "Select one whole nucleotide on one strand. A complete rung contains two; a base alone is only part of a nucleotide."
            : focus === "count"
              ? "Count one nucleotide at each position on each of the two supplied strands, not one for the whole rung."
              : focus === "types"
                ? "Separate the four possible nucleotide types from the labels occurring in this short excerpt."
                : "Most DNA has two polymer chains wound around one another as a double helix.",
      };
    const hints: Record<NaturalMode, string> = {
      peptideUnit:
        "Keep the supplied carbon section and C=O. Remove acid OH and one amino H, leaving NH. Enclose one contribution in brackets with n and a bond through each bracket; the next unit joins through carbonyl C to N. These are repeat boundaries, not terminal NH₂/COOH groups.",
      core: "NH₂ has Mr 14 + 2 = 16; COOH has Mr 12 + 2 × 16 + 1 = 45. The two end groups total 61. Subtract those from the supplied whole monomer Mr to find the unknown section; its mass alone does not identify its connectivity.",
      identify:
        "Match the supplied polymer to its monomer type; a glucose-derived crop alone does not uniquely name starch or cellulose.",
      repeat:
        "One complete glucose-derived contribution includes its linking oxygen. The original glucose monomer is different from the residue inside the chain.",
      dna: "One strand unit is one nucleotide; a complete rung contains two. Most DNA has two strands, four possible nucleotide types and a double helix. Use the supplied pairing key only for the shown excerpt.",
      sequence:
        "Retain the supplied target order. The same atom composition can have a different sequence or connectivity; this short excerpt does not determine an exact protein function.",
      peptide:
        "At each junction join carbonyl C to amino N, remove acid OH and one amino H as water, retain C=O and keep both terminal groups.",
      mass: "Count the actual shown links. Each uses one H₂O: subtract 2 H and 1 O from the whole feed inventory for every actual link; keep the end groups.",
    };
    return { correct: false, message: hints[mode] };
  }
  if (mode === "core")
    return {
      correct: true,
      message:
        focus === "ends"
          ? "The unchanged NH₂ and COOH groups together have relative mass 61."
          : `The unknown section has relative mass ${t.coreMr}: whole monomer minus the unchanged end groups. This does not uniquely identify the section's structure.`,
    };
  if (mode === "dna" && focus !== "all")
    return {
      correct: true,
      message:
        focus === "unit"
          ? "You selected one complete nucleotide on one strand. A whole rung contains two nucleotide units."
          : focus === "count"
            ? `The supplied two-strand excerpt contains ${t.total} whole nucleotide units.`
            : focus === "types"
              ? "Four nucleotide types are possible, even when this short excerpt does not show all four."
              : "Your double-helix identification agrees with the common two-strand DNA structure.",
    };
  if (mode === "mass" && focus !== "all")
    return {
      correct: true,
      message: `Your ${focus === "H" ? "hydrogen count" : "whole-chain relative formula mass"} agrees with the supplied actual-link account; both terminal groups remain included.`,
    };
  return {
    correct: true,
    message:
      mode === "peptideUnit"
        ? "Your bracketed contribution retains the supplied carbon section and C=O, with C–N continuation and n. It omits the ends of the complete chain. A finite open chain of n original monomers has n − 1 actual junctions."
        : mode === "peptide"
          ? "Your open chain preserves the original order and terminal groups. Each actual C–N link releases one water molecule."
          : mode === "dna"
            ? "Each selected nucleotide belongs to one strand. The shown two-strand excerpt uses the supplied pairing key; four types are possible even when this short excerpt does not show all four."
            : "Your proposal agrees with the supplied structure and its complete account.",
  };
}
export function validNaturalHistory(
  mode: NaturalMode,
  value: unknown,
  originalRecord?: string,
): value is NaturalBoard[] {
  if (
    !Array.isArray(value) ||
    !value.length ||
    value.length > 500 ||
    !value.every((x) => validNaturalBoard(mode, x))
  )
    return false;
  if (originalRecord !== undefined && value[0].record !== originalRecord)
    return false;
  const first = initialNaturalBoard(mode, value[0].record);
  if (!Object.keys(first).every((k) => value[0][k] === first[k])) return false;
  for (let i = 1; i < value.length; i++) {
    const a = value[i - 1],
      b = value[i],
      reset = initialNaturalBoard(mode, b.record),
      diff = Object.keys(b).filter((k) => a[k] !== b[k]);
    if (Object.keys(reset).every((k) => b[k] === reset[k])) continue;
    if (diff.length !== 1 || diff[0] === "record") return false;
  }
  return true;
}
export function appendNaturalBoard(
  mode: NaturalMode,
  history: NaturalBoard[],
  b: NaturalBoard,
): NaturalBoard[] {
  const a = history.at(-1);
  if (a && Object.keys(b).every((k) => a[k] === b[k])) return history;
  const next = [...history, b];
  if (!validNaturalHistory(mode, next))
    throw Error("Invalid natural-polymer history transition");
  return next;
}

export function readNaturalDrawing(
  value: string,
  data: NaturalDiagramData,
): NaturalBoard | null {
  if (!value) return initialNaturalBoard(data.mode, data.record);
  try {
    const b = JSON.parse(value);
    return validNaturalBoard(data.mode, b) && b.record === data.record
      ? b
      : null;
  } catch {
    return null;
  }
}
export function describeNaturalDrawing(
  value: string,
  data: NaturalDiagramData,
): string {
  const b = readNaturalDrawing(value, data);
  if (!b)
    return "Your original saved structure cannot be read; its exact bytes remain retained.";
  const labels: Record<string, string> = {
    leftNucleotide: "one whole nucleotide on the original strand",
    rightNucleotide: "one whole nucleotide on the other strand",
    rung: "a complete two-sided rung",
    baseOnly: "one base alone",
    doubleHelix: "double helix",
    singleHelix: "single helix",
    flatLadder: "flat ladder",
    nucleotide: "nucleotide",
    aminoAcid: "amino acid",
    base: "base alone",
    oneRingOneBridge: "one ring and one linking oxygen",
    ringOnly: "ring only",
    bridgeOnly: "linking oxygen only",
    wholeCrop: "whole crop",
    CN: "carbon to nitrogen",
    CO: "carbon to oxygen",
    CC: "carbon to carbon",
    none: "no joining bond",
    CH2: "CH₂",
    CH2CH2: "CH₂–CH₂",
    CHCH3: "CH(CH₃)",
    both: "both boundaries",
    left: "left boundary only",
    right: "right boundary only",
    neither: "neither boundary",
    NH2: "NH₂",
    NH: "NH",
    COOH: "COOH",
    COO: "COO",
  };
  const field = (k: string) => labels[b[k]] || b[k] || "not selected";
  if (data.mode === "peptideUnit")
    return `Your repeat nitrogen: ${field("nitrogen")}; carbon section: ${field("core")}; carbonyl bond: ${field("carbonyl")}; acid OH: ${field("acidOH")}; continuation: ${field("continuation")}; brackets: ${field("brackets")}; multiplier: ${field("multiplier")}; joining bond: ${field("junction")}. Inspect the actual retained bracketed proposal.`;
  if (data.mode === "dna")
    return `Your selected unit: ${field("unit")}; strands: ${field("strands")}; shape: ${field("shape")}; monomer: ${field("monomer")}. Inspect the actual retained boxes and highlighted components.`;
  if (data.mode === "repeat")
    return `Your selected boundaries: ${field("start")} to ${field("end")}; contribution: ${field("boundary")}; monomer: ${field("monomer")}. Inspect the actual retained highlight.`;
  return `Your joining bond: ${field("link")}; internal acid OH: ${field("acidOH")}; internal N hydrogen count: ${field("aminoH")}; carbonyl bond: ${field("carbonyl")}; left end: ${field("leftEnd")}; right end: ${field("rightEnd")}; raw water count: ${field("water")}. Inspect the actual retained structure.`;
}
