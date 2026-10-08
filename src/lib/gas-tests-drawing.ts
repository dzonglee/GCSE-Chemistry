export type GasDrawingData = {
  mode: "splint" | "liquid" | "litmus";
  record: string;
};
type Source = GasDrawingData & {
  title: string;
  given: string;
  reference: {
    placement: string;
    material: string;
    observation: string;
    conclusion: string;
  };
};
export const gasDrawingSources: Record<string, Source> = {
  oxygenPractice: {
    mode: "splint",
    record: "oxygenPractice",
    title: "Annotate an oxygen test",
    given:
      "A collected school sample is to be tested for oxygen. Add the starting splint condition and its position, then label the positive observation and conclusion.",
    reference: {
      placement: "inside",
      material: "Glowing splint: hot glowing end, no initial flame",
      observation: "The glowing splint relights",
      conclusion: "Oxygen is present; oxygen supports burning",
    },
  },
  co2Practice: {
    mode: "liquid",
    record: "co2Practice",
    title: "Construct the bubbling test",
    given:
      "A collected sample is to be tested for carbon dioxide by bubbling it through a receiving liquid. Add the reagent and outlet position, positive result and conclusion.",
    reference: {
      placement: "belowLiquid",
      material: "Fresh limewater: aqueous calcium hydroxide",
      observation: "Limewater becomes milky/cloudy; a white precipitate forms",
      conclusion: "Carbon dioxide is present",
    },
  },
  hydrogenCheckA: {
    mode: "splint",
    record: "hydrogenCheckA",
    title: "Independently annotate the pop test",
    given:
      "A school technician asks for a labelled test for hydrogen in a collected sample. Add the starting splint state, its position, the positive observation and identification.",
    reference: {
      placement: "mouth",
      material: "Burning splint: visible initial flame",
      observation: "Hydrogen burns with a pop sound",
      conclusion: "Hydrogen is present",
    },
  },
  chlorineCheckB: {
    mode: "litmus",
    record: "chlorineCheckB",
    title: "Independently annotate the litmus test",
    given:
      "A collected sample is to be tested for chlorine. Add a labelled paper condition and contact position. State the identifying change and conclusion; give the full change if starting with blue litmus.",
    reference: {
      placement: "gasContact",
      material: "Damp blue litmus in contact with the gas",
      observation: "The paper may first turn red, then is bleached white",
      conclusion:
        "Chlorine is present; red alone would not uniquely identify it",
    },
  },
  co2ReviewA: {
    mode: "liquid",
    record: "co2ReviewA",
    title: "A fresh gas mixture",
    given:
      "An unfamiliar school combustion sample is a mixture. Construct a bubbling test showing carbon dioxide present. Label the reagent, outlet, positive change and a conclusion respecting the mixture.",
    reference: {
      placement: "belowLiquid",
      material: "Fresh limewater: aqueous calcium hydroxide",
      observation: "Limewater becomes cloudy/milky",
      conclusion:
        "Carbon dioxide is present; this does not establish that the mixture is pure CO2",
    },
  },
  oxygenReviewB: {
    mode: "splint",
    record: "oxygenReviewB",
    title: "A fresh oxygen-test diagram",
    given:
      "A new collected sample is to be tested for oxygen. Add the starting splint condition, position, positive observation and what it means about oxygen’s role in burning.",
    reference: {
      placement: "inside",
      material: "A glowing splint, not a cold unlit splint",
      observation: "The initially glowing splint relights",
      conclusion:
        "Oxygen is present and supports combustion; it is not the burning fuel",
    },
  },
};
function freeze(value: unknown) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
}
freeze(gasDrawingSources);
export type GasDrawingBoard = {
  record: string;
  placement: string;
  material: string;
  observation: string;
  conclusion: string;
};
export const gasDrawingPlacements = [
  "",
  "mouth",
  "inside",
  "belowLiquid",
  "aboveLiquid",
  "gasContact",
  "away",
] as const;
const labels = ["material", "observation", "conclusion"] as const;
function source(data: GasDrawingData) {
  const value = gasDrawingSources[data.record];
  if (!value || value.mode !== data.mode)
    throw Error("Unknown gas-test drawing source.");
  return value;
}
export function initialGasDrawing(data: GasDrawingData): GasDrawingBoard {
  source(data);
  return {
    record: data.record,
    placement: "",
    material: "",
    observation: "",
    conclusion: "",
  };
}
export function referenceGasDrawing(data: GasDrawingData): GasDrawingBoard {
  return { record: data.record, ...source(data).reference };
}
const plain = (value: unknown): value is Record<string, unknown> =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;
export function validGasDrawing(
  data: GasDrawingData,
  value: unknown,
): value is GasDrawingBoard {
  try {
    source(data);
  } catch {
    return false;
  }
  const keys = ["record", "placement", ...labels];
  return (
    plain(value) &&
    Object.keys(value).length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key)) &&
    value.record === data.record &&
    typeof value.placement === "string" &&
    (gasDrawingPlacements as readonly string[]).includes(value.placement) &&
    labels.every(
      (key) => typeof value[key] === "string" && value[key].length <= 300,
    )
  );
}
export function writeGasDrawing(
  data: GasDrawingData,
  board: GasDrawingBoard,
): string {
  if (!validGasDrawing(data, board))
    throw Error("Unreadable drawing proposal.");
  return JSON.stringify({ version: 1, kind: "gas-test-drawing", board });
}
export function readGasDrawing(
  raw: string,
  data: GasDrawingData,
): GasDrawingBoard | null {
  if (!raw) return initialGasDrawing(data);
  if (raw.length > 6000) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return plain(value) &&
      Object.keys(value).length === 3 &&
      value.version === 1 &&
      value.kind === "gas-test-drawing" &&
      validGasDrawing(data, value.board)
      ? value.board
      : null;
  } catch {
    return null;
  }
}
export function attemptedGasDrawing(
  raw: string,
  data: GasDrawingData,
): boolean {
  const board = readGasDrawing(raw, data);
  return (
    !!board &&
    (!!board.placement || labels.some((key) => board[key].trim().length > 0))
  );
}
export function markGasDrawing(
  raw: string,
  data: GasDrawingData,
): {
  correct: false;
  empty: boolean;
  invalid?: boolean;
  selfReview?: boolean;
  feedback: string;
} {
  const board = readGasDrawing(raw, data);
  if (!board)
    return {
      correct: false,
      empty: false,
      invalid: true,
      feedback:
        "The retained diagram cannot be read. Its original bytes are preserved; explicitly clear only this construction if needed.",
    };
  if (!attemptedGasDrawing(raw, data))
    return {
      correct: false,
      empty: true,
      feedback:
        "No construction has been attempted. Add your placement and labels before comparing a reference.",
    };
  return {
    correct: false,
    empty: false,
    selfReview: true,
    feedback:
      "Compare your retained placement and labels with the separate reference and criteria. This drawing is self-reviewed, not automatically marked correct.",
  };
}
export function describeGasDrawing(raw: string, data: GasDrawingData): string {
  const board = readGasDrawing(raw, data);
  return board
    ? `Placement: ${board.placement || "not chosen"}. Initial test material: ${board.material || "not labelled"}. Observation: ${board.observation || "not labelled"}. Conclusion: ${board.conclusion || "not labelled"}. Retained for self-review; no automatic drawing mark.`
    : "Unreadable retained gas-test diagram; exact bytes are preserved.";
}
