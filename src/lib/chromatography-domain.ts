import {
  chromatographyCases,
  type ChromatographyMode,
  type ChromatographyCase,
} from "./chromatography-cases";
export type ChromaBoard = Record<string, string>;
export const chromaFields = {
  setup: ["solventLevel", "lineMaterial"],
  phases: ["stationary", "mobile"],
  measurement: ["rulerZero", "spotDistance", "frontDistance", "conclusion"],
  ratio: ["spotDistance", "frontDistance", "rf", "conclusion"],
  affinity: ["moreStationaryRetention", "greaterRelativeTravel"],
  interpretation: ["composition", "matches", "minimumComponents"],
  conditions: ["choice", "conclusion", "newRf"],
} as const;
export type ChromaField = (typeof chromaFields)[ChromatographyMode][number];
export type ChromaFocus = "all" | ChromaField;
const numeric = new Set<string>([
  "solventLevel",
  "rulerZero",
  "spotDistance",
  "frontDistance",
  "rf",
  "minimumComponents",
  "newRf",
]);
const enumValues: Record<string, readonly string[]> = {
  lineMaterial: ["pencil", "ink"],
  stationary: ["paper", "silica", "alumina", "glass", "solvent", "sample"],
  mobile: [
    "water",
    "ethanol",
    "saltSolution",
    "ethylEthanoate",
    "paper",
    "sample",
    "glass",
  ],
  conclusion: [
    "recorded",
    "missingFront",
    "consistent",
    "inconsistent",
    "resolved",
    "not-comparable",
    "same-relative-travel",
    "mobile-in-chosen-solvent",
  ],
  moreStationaryRetention: ["A", "B", "insufficient"],
  greaterRelativeTravel: ["A", "B"],
  composition: ["pure", "mixture", "insufficient"],
  matches: [
    "P+Q",
    "Q",
    "A-or-B-or-both",
    "no-reference",
    "not-this-reference",
    "P+unidentified",
    "P",
    "A",
    "B",
  ],
  choice: [
    "S1",
    "S2",
    "water",
    "ethanol",
    "insufficient",
    "unchanged",
    "increased",
    "decreased",
  ],
};
export function chromaChoices(
  mode: ChromatographyMode,
  key: string,
): readonly string[] {
  if (key === "conclusion") {
    if (mode === "measurement") return ["recorded", "missingFront"];
    if (mode === "ratio") return ["consistent", "inconsistent"];
    if (mode === "conditions")
      return [
        "resolved",
        "not-comparable",
        "same-relative-travel",
        "mobile-in-chosen-solvent",
      ];
    return [];
  }
  return enumValues[key] ?? [];
}
export function chromatographyCase<K extends ChromatographyMode>(
  mode: K,
  id: string,
): (typeof chromatographyCases)[K][number] | undefined {
  const bank: readonly ChromatographyCase[] = chromatographyCases[mode];
  return bank?.find((c) => c.id === id) as
    (typeof chromatographyCases)[K][number] | undefined;
}
export function readChromaNumber(raw: string, signed = false): number | null {
  const s = raw.replace(/−/g, "-");
  const pattern = signed
    ? /^-?(?:\d+(?:\.\d+)?|\.\d+)$/
    : /^(?:\d+(?:\.\d+)?|\.\d+)$/;
  if (!pattern.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) && Math.abs(n) <= 1e12 ? n : null;
}
export function initialChroma(
  mode: ChromatographyMode,
  record: string,
): ChromaBoard {
  if (!chromatographyCase(mode, record))
    throw Error("Unknown original chromatographic source.");
  return {
    record,
    ...Object.fromEntries(
      chromaFields[mode].map((k) => [k, k === "rulerZero" ? "0" : ""]),
    ),
  };
}
export function expectedChroma(
  mode: ChromatographyMode,
  record: string,
): Record<string, string> {
  if (!chromatographyCase(mode, record))
    throw Error("Unknown chromatographic comparison.");
  switch (mode) {
    case "setup": {
      const c = chromatographyCase("setup", record)!;
      return {
        solventLevel: String((c.paperBottom + c.origin) / 2),
        lineMaterial: "pencil",
      };
    }
    case "phases": {
      const c = chromatographyCase("phases", record)!;
      return { stationary: c.stationary, mobile: c.mobile };
    }
    case "measurement": {
      const c = chromatographyCase("measurement", record)!;
      return {
        rulerZero: String(c.origin),
        spotDistance: String(c.spotDistance),
        ...(c.frontDistance === null
          ? {}
          : { frontDistance: String(c.frontDistance) }),
        conclusion: c.front === null ? "missingFront" : "recorded",
      };
    }
    case "ratio": {
      const c = chromatographyCase("ratio", record)!;
      return {
        [c.kind === "inverse"
          ? "spotDistance"
          : c.kind === "front"
            ? "frontDistance"
            : "rf"]: c.answer,
        conclusion: c.conclusion,
      };
    }
    case "affinity": {
      const c = chromatographyCase("affinity", record)!;
      return {
        moreStationaryRetention: c.moreStationaryRetention,
        greaterRelativeTravel: c.greaterRelativeTravel,
      };
    }
    case "interpretation": {
      const c = chromatographyCase("interpretation", record)!;
      return {
        composition: c.composition,
        matches: c.matches,
        ...(c.minimumComponents === null
          ? {}
          : { minimumComponents: String(c.minimumComponents) }),
      };
    }
    case "conditions": {
      const c = chromatographyCase("conditions", record)!;
      return {
        choice: c.choice,
        conclusion: c.conclusion,
        ...(c.newRf === undefined ? {} : { newRf: c.newRf }),
      };
    }
  }
}
export function chromaTargets(
  mode: ChromatographyMode,
  record: string,
  focus: ChromaFocus = "all",
): string[] {
  const expected = expectedChroma(mode, record);
  return focus === "all"
    ? Object.keys(expected)
    : Object.hasOwn(expected, focus)
      ? [focus]
      : [];
}
export function compatibleChromaCases(
  mode: ChromatographyMode,
  focus: ChromaFocus = "all",
): string[] {
  return chromatographyCases[mode]
    .filter(
      (c) =>
        chromaTargets(mode, c.id, focus).length > 0 &&
        !(mode === "ratio" && c.id === "past-front" && focus === "rf"),
    )
    .map((c) => c.id);
}
function plain(value: unknown): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}
export function validChroma(
  mode: ChromatographyMode,
  value: unknown,
): value is ChromaBoard {
  if (
    !Object.hasOwn(chromaFields, mode) ||
    !plain(value) ||
    typeof value.record !== "string" ||
    !chromatographyCase(mode, value.record)
  )
    return false;
  const keys = ["record", ...chromaFields[mode]];
  if (
    Object.keys(value).length !== keys.length ||
    !keys.every(
      (k) =>
        Object.hasOwn(value, k) &&
        typeof value[k] === "string" &&
        (value[k] as string).length <= 24,
    )
  )
    return false;
  return chromaFields[mode].every(
    (k) =>
      numeric.has(k) ||
      value[k] === "" ||
      chromaChoices(mode, k).includes(value[k] as string),
  );
}
export function updateChroma(
  mode: ChromatographyMode,
  board: ChromaBoard,
  key: string,
  value: string,
  focus: ChromaFocus = "all",
): ChromaBoard {
  if (!validChroma(mode, board))
    throw Error("Unreadable retained chromatography proposal.");
  if (key === "record") {
    if (!compatibleChromaCases(mode, focus).includes(value))
      throw Error("This comparison cannot supply the asked quantity.");
    return initialChroma(mode, value);
  }
  if (!(chromaFields[mode] as readonly string[]).includes(key))
    throw Error("Unknown proposal field.");
  const next = { ...board, [key]: value };
  if (!validChroma(mode, next)) throw Error("Invalid proposal schema.");
  return next;
}
const same = (a: ChromaBoard, b: ChromaBoard) =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.keys(a).every((k) => a[k] === b[k]);
export function validChromaHistory(
  mode: ChromatographyMode,
  originalRecord: string,
  value: unknown,
  focus: ChromaFocus = "all",
): value is ChromaBoard[] {
  if (
    !chromatographyCase(mode, originalRecord) ||
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > 500 ||
    !value.every(
      (v) =>
        validChroma(mode, v) &&
        compatibleChromaCases(mode, focus).includes(v.record),
    )
  )
    return false;
  if (!same(value[0], initialChroma(mode, originalRecord))) return false;
  for (let i = 1; i < value.length; i++) {
    const next = value[i],
      previous = value[i - 1];
    if (same(next, initialChroma(mode, next.record))) continue;
    if (next.record !== previous.record) return false;
    if (Object.keys(next).filter((k) => next[k] !== previous[k]).length > 1)
      return false;
  }
  return true;
}
export type ChromaCheck = {
  correct: boolean;
  invalid: boolean;
  fields: string[];
  message: string;
};
function precision(raw: string, digits: number): boolean {
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw)) return false;
  return raw.replace(".", "").replace(/^0+/, "").length === digits;
}
export function checkChroma(
  mode: ChromatographyMode,
  board: ChromaBoard,
  focus: ChromaFocus = "all",
): ChromaCheck {
  if (!validChroma(mode, board))
    return {
      correct: false,
      invalid: true,
      fields: [],
      message:
        "This retained proposal could not be read. Preserve it and explicitly reset only this model if needed.",
    };
  const fields = chromaTargets(mode, board.record, focus);
  if (!fields.length)
    return {
      correct: false,
      invalid: true,
      fields,
      message:
        "This supplied record does not contain the quantity requested by the original task. Reset to its source.",
    };
  const expected = expectedChroma(mode, board.record),
    missing = fields.filter((k) =>
      numeric.has(k)
        ? readChromaNumber(board[k], k === "rulerZero") === null
        : !board[k],
    );
  if (missing.length)
    return {
      correct: false,
      invalid: true,
      fields: missing,
      message:
        "Choose or enter each asked field. Numeric fields take ordinary decimal numbers; unfinished entries are retained.",
    };
  const wrong = fields.filter((k) => {
    if (mode === "setup" && k === "solventLevel") {
      const c = chromatographyCase("setup", board.record)!,
        n = readChromaNumber(board[k])!;
      return n < c.paperBottom || n >= c.origin;
    }
    if (numeric.has(k))
      return (
        readChromaNumber(board[k], k === "rulerZero") !== Number(expected[k])
      );
    return board[k] !== expected[k];
  });
  if (mode === "ratio" && fields.includes("rf")) {
    const c = chromatographyCase("ratio", board.record)!;
    if (
      c.rounding &&
      !precision(board.rf, c.rounding.digits) &&
      !wrong.includes("rf")
    )
      wrong.push("rf");
  }
  const source = chromatographyCase(mode, board.record)!;
  const details: Record<ChromatographyMode, string> = {
    setup:
      "The proposed solvent must contact the paper bottom while staying strictly below the original sample origin. A soluble ink baseline introduces extra material; use pencil for this supplied experiment.",
    phases:
      "Separate the stationary paper/coating, its support, the moving solvent and the sample. Changing solvent does not make the support or ink the mobile phase.",
    measurement:
      "Read from the original origin to the spot centre and the recorded front. Aligning the ruler zero or subtracting the two endpoint readings avoids a paper-bottom offset. The model alignment step is checked only when requested.",
    ratio:
      "Use equal distance units. Rf is spot travel divided by solvent-front travel; rearrange for an unknown distance. An arithmetic ratio beyond1 diagnoses an inconsistent ordinary chromatographic record rather than a valid Rf. Retain requested significant figures.",
    affinity:
      "Link relative travel to distribution between both phases. A lower Rf with only paper changed supports more attraction and residence in that stationary phase. If both phases change, paper alone is not an established cause.",
    interpretation:
      "Compare resolved spot centres and references under the same conditions. Several uncontaminated resolved spots support a mixture; one spot can conceal co-elution. Report supported matches and a minimum component count without inventing names.",
    conditions:
      "Use the supplied observations and keep solvent, stationary phase and other conditions comparable. Changes in dilute dye proportions or proportional running distances do not themselves change the stated Rf.",
  };
  return {
    correct: wrong.length === 0,
    invalid: false,
    fields: wrong,
    message:
      (wrong.length
        ? "Your proposal is retained. "
        : "Your asked fields match this supplied case. Unasked fields remain unchecked. ") +
      details[mode] +
      " " +
      source.note,
  };
}
