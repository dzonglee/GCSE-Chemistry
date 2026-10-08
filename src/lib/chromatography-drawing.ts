import { readChromaNumber } from "./chromatography-domain";
export type ChromaDrawingData = {
  mode: "chromatogram" | "setup";
  record: string;
};
type ChartSource = {
  mode: "chromatogram";
  title: string;
  origin: number;
  front: number;
  aRf: readonly [number, number];
  bRf: number;
  reference: readonly [number, number, number];
  note: string;
};
type SetupDrawingSource = {
  mode: "setup";
  title: string;
  bottom: number;
  top: number;
  origin: number;
  originalLevel: number;
  originalLine: "ink" | "pencil";
  referenceLevel: number;
  note: string;
};
export const chromaDrawingSources: Record<
  string,
  ChartSource | SetupDrawingSource
> = {
  plotPractice: {
    mode: "chromatogram",
    title: "Construct two supplied sample lanes",
    origin: 10,
    front: 90,
    aRf: [0.25, 0.75],
    bRf: 0.5,
    reference: [30, 70, 50],
    note: "Coordinates are millimetres above the paper bottom. The solvent is water and the stationary phase is paper. Sample A has two resolved soluble components; sample B is supplied as one soluble compound. Place the origin, front and three centres from the given Rf values. This is a schematic calibrated plot, not a life-size sheet.",
  },
  plotCheckA: {
    mode: "chromatogram",
    title: "An unfamiliar two-lane chromatogram",
    origin: 15,
    front: 115,
    aRf: [0.2, 0.7],
    bRf: 0.55,
    reference: [35, 85, 70],
    note: "Coordinates are millimetres above the paper bottom. On the same paper in water, sample A has two resolved soluble components with the supplied Rf values; sample B is one soluble compound. Independently construct the origin, front and centres; a separate reference appears only after whole-set submission.",
  },
  plotReviewA: {
    mode: "chromatogram",
    title: "A fresh delayed construction",
    origin: 20,
    front: 100,
    aRf: [0.3, 0.8],
    bRf: 0.45,
    reference: [44, 84, 56],
    note: "Coordinates are millimetres above the paper bottom. Paper and water are the two phases. Sample A contains two resolved soluble components; sample B is one soluble compound. Retain the stated origin offset when turning Rf into positions.",
  },
  setupPractice: {
    mode: "setup",
    title: "Repair a supplied chromatography arrangement",
    bottom: 3,
    top: 130,
    origin: 28,
    originalLevel: 34,
    originalLine: "ink",
    referenceLevel: 12,
    note: "All heights are millimetres above the beaker base. Keep the paper and sample origin fixed. The supplied ink baseline is soluble in water. Propose a solvent level reaching the paper but below the sample, an appropriate baseline material, phases, sample handling and when to mark the front. Several solvent levels can be valid; the reference is one example.",
  },
  setupCheckB: {
    mode: "setup",
    title: "Independently propose a valid arrangement",
    bottom: 5,
    top: 140,
    origin: 35,
    originalLevel: 42,
    originalLine: "ink",
    referenceLevel: 15,
    note: "All heights are millimetres above the beaker base. Keep the paper and sample origin fixed. The supplied baseline ink is soluble in water. Independently propose the corrected level, baseline material, phases, sample handling and front recording. A valid level is not a unique number.",
  },
  setupReviewB: {
    mode: "setup",
    title: "A fresh sample touches the reservoir",
    bottom: 4,
    top: 120,
    origin: 22,
    originalLevel: 22,
    originalLine: "pencil",
    referenceLevel: 10,
    note: "All heights are millimetres above the beaker base. Keep the paper and origin fixed. The original baseline is already pencil; do not invent another error. Propose a complete valid water/paper arrangement and recording method. The reference shows one valid solvent level.",
  },
};
function freeze(value: unknown) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
}
freeze(chromaDrawingSources);
export type ChromaDrawingBoard = {
  record: string;
  raw: Record<string, string>;
  placed: Record<string, number | null>;
  choices: Record<string, string>;
};
export const chromaDrawingChoices = {
  stationary: ["", "paper", "solvent", "sample", "beaker"],
  mobile: ["", "water", "paper", "sample", "beaker"],
  lineMaterial: ["", "pencil", "ink"],
  frontCapture: ["", "markWet", "afterDry", "notNeeded"],
  sampleHandling: ["", "smallSeparate", "reuseCapillary", "immerse"],
} as const;
export function chromaDrawingFields(data: ChromaDrawingData) {
  return data.mode === "chromatogram"
    ? {
        numbers: ["origin", "front", "a1", "a2", "b1"],
        choices: ["stationary", "mobile", "lineMaterial"],
      }
    : {
        numbers: ["solventLevel"],
        choices: [
          "stationary",
          "mobile",
          "lineMaterial",
          "frontCapture",
          "sampleHandling",
        ],
      };
}
function sourceOf(data: ChromaDrawingData) {
  const source = chromaDrawingSources[data.record];
  if (!source || source.mode !== data.mode)
    throw Error("Unknown original chromatography drawing source.");
  return source;
}
export function initialChromaDrawing(
  data: ChromaDrawingData,
): ChromaDrawingBoard {
  sourceOf(data);
  const fields = chromaDrawingFields(data);
  return {
    record: data.record,
    raw: Object.fromEntries(fields.numbers.map((k) => [k, ""])),
    placed: Object.fromEntries(fields.numbers.map((k) => [k, null])),
    choices: Object.fromEntries(fields.choices.map((k) => [k, ""])),
  };
}
export function referenceChromaDrawing(
  data: ChromaDrawingData,
): ChromaDrawingBoard {
  const source = sourceOf(data),
    board = initialChromaDrawing(data);
  const positions =
    source.mode === "chromatogram"
      ? {
          origin: source.origin,
          front: source.front,
          a1: source.reference[0],
          a2: source.reference[1],
          b1: source.reference[2],
        }
      : { solventLevel: source.referenceLevel };
  for (const [key, value] of Object.entries(positions)) {
    board.raw[key] = String(value);
    board.placed[key] = value;
  }
  board.choices = {
    stationary: "paper",
    mobile: "water",
    lineMaterial: "pencil",
    ...(source.mode === "setup"
      ? { frontCapture: "markWet", sampleHandling: "smallSeparate" }
      : {}),
  };
  return board;
}
const plain = (x: unknown): x is Record<string, unknown> =>
  !!x &&
  typeof x === "object" &&
  !Array.isArray(x) &&
  Object.getPrototypeOf(x) === Object.prototype;
const exactKeys = (x: Record<string, unknown>, keys: string[]) =>
  Object.keys(x).length === keys.length &&
  keys.every((k) => Object.hasOwn(x, k));
export function validChromaDrawing(
  data: ChromaDrawingData,
  value: unknown,
): value is ChromaDrawingBoard {
  try {
    sourceOf(data);
  } catch {
    return false;
  }
  if (
    !plain(value) ||
    !exactKeys(value, ["record", "raw", "placed", "choices"]) ||
    value.record !== data.record ||
    !plain(value.raw) ||
    !plain(value.placed) ||
    !plain(value.choices)
  )
    return false;
  const { numbers, choices } = chromaDrawingFields(data),
    raw = value.raw,
    placed = value.placed,
    picks = value.choices;
  if (
    !exactKeys(raw, numbers) ||
    !exactKeys(placed, numbers) ||
    !exactKeys(picks, choices)
  )
    return false;
  for (const key of numbers) {
    if (typeof raw[key] !== "string" || raw[key].length > 24) return false;
    const n = placed[key];
    if (
      n !== null &&
      (typeof n !== "number" || !Number.isFinite(n) || Math.abs(n) > 1e12)
    )
      return false;
    const parsed = readChromaNumber(raw[key], true);
    if (raw[key] === "" && n !== null) return false;
    if (parsed !== null && parsed !== n) return false;
  }
  return choices.every(
    (key) =>
      typeof picks[key] === "string" &&
      (
        chromaDrawingChoices[
          key as keyof typeof chromaDrawingChoices
        ] as readonly string[]
      ).includes(picks[key]),
  );
}
export function readChromaDrawing(
  raw: string,
  data: ChromaDrawingData,
): ChromaDrawingBoard | null {
  if (!raw) return initialChromaDrawing(data);
  try {
    const value: unknown = JSON.parse(raw);
    return validChromaDrawing(data, value) ? value : null;
  } catch {
    return null;
  }
}
export function updateChromaDrawing(
  data: ChromaDrawingData,
  board: ChromaDrawingBoard,
  key: string,
  value: string,
): ChromaDrawingBoard {
  if (!validChromaDrawing(data, board))
    throw Error("Unreadable retained drawing.");
  const fields = chromaDrawingFields(data);
  let next: ChromaDrawingBoard;
  if (fields.numbers.includes(key)) {
    const parsed = readChromaNumber(value, true);
    next = {
      ...board,
      raw: { ...board.raw, [key]: value },
      placed: {
        ...board.placed,
        [key]: value === "" ? null : (parsed ?? board.placed[key]),
      },
    };
  } else if (fields.choices.includes(key))
    next = { ...board, choices: { ...board.choices, [key]: value } };
  else throw Error("Unknown drawing field.");
  if (!validChromaDrawing(data, next)) throw Error("Invalid drawing schema.");
  return next;
}
export function emptyChromaDrawing(board: ChromaDrawingBoard) {
  return (
    Object.values(board.raw).every((v) => v === "") &&
    Object.values(board.choices).every((v) => v === "")
  );
}
export function markChromaDrawing(
  raw: string,
  data: ChromaDrawingData,
): {
  correct: false;
  empty: boolean;
  invalid?: boolean;
  selfReview?: boolean;
  feedback: string;
} {
  const board = readChromaDrawing(raw, data);
  if (!board)
    return {
      correct: false,
      empty: false,
      invalid: true,
      feedback:
        "The retained chromatography drawing cannot be read. Its original bytes are preserved; start a new construction explicitly to continue.",
    };
  if (emptyChromaDrawing(board))
    return {
      correct: false,
      empty: true,
      feedback:
        "Make a proposal before saving. Unchosen positions and labels do not constitute a drawing response.",
    };
  return {
    correct: false,
    empty: false,
    selfReview: true,
    feedback:
      "Response saved. Compare your retained proposal with the separate criteria and reference after submission. This is self-review; no automatic examiner mark is awarded.",
  };
}
export const chromaDrawingLabels: Record<string, string> = {
  origin: "Origin position",
  front: "Solvent-front position",
  a1: "Sample A lower centre",
  a2: "Sample A upper centre",
  b1: "Sample B centre",
  solventLevel: "Proposed solvent level",
  stationary: "Stationary phase",
  mobile: "Mobile phase",
  lineMaterial: "Origin-line material",
  frontCapture: "When to mark the solvent front",
  sampleHandling: "Sample handling",
  paper: "Paper",
  solvent: "Solvent",
  sample: "Sample",
  beaker: "Beaker",
  water: "Water",
  pencil: "Pencil",
  ink: "Soluble ink",
  markWet: "Mark the front while it is still visible",
  afterDry: "Wait until the front has disappeared",
  notNeeded: "Do not record the front",
  smallSeparate: "Use small separate spots and clean applicators",
  reuseCapillary: "Reuse a contaminated applicator",
  immerse: "Immerse the sample spots in the reservoir",
};
export function describeChromaDrawing(
  raw: string,
  data: ChromaDrawingData,
): string {
  const board = readChromaDrawing(raw, data);
  if (!board)
    return "Unreadable retained chromatography drawing; exact bytes are preserved.";
  const parts = Object.entries(board.raw).map(
    ([key, value]) =>
      `${chromaDrawingLabels[key]}: ${value === "" ? "not chosen" : readChromaNumber(value, true) === null ? `unfinished entry “${value}”; last placed position ${board.placed[key] ?? "none"} mm` : value + " mm"}`,
  );
  for (const [key, value] of Object.entries(board.choices))
    parts.push(
      chromaDrawingLabels[key] +
        ": " +
        (value ? chromaDrawingLabels[value] : "not chosen"),
    );
  return (
    parts.join("; ") +
    ". Compare your actual retained proposal with the separate criteria; no automatic examiner drawing mark is awarded."
  );
}
