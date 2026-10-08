export type InstrumentalMode =
  "path" | "spectrum" | "calibration" | "quality" | "advantage";
export type InstrumentalBoard = Record<string, string>;
export const metalKeys = ["li", "na", "k", "ca", "cu"] as const;
export const metalNames: Record<string, string> = {
  li: "Lithium ions, Li⁺",
  na: "Sodium ions, Na⁺",
  k: "Potassium ions, K⁺",
  ca: "Calcium ions, Ca²⁺",
  cu: "Copper(II) ions, Cu²⁺",
};
// Original schematic positions. These are not real wavelength data.
export const referenceLines: Record<string, readonly number[]> = {
  li: [1, 4, 10],
  na: [2, 6, 9],
  k: [3, 6, 11],
  ca: [1, 5, 8],
  cu: [4, 7, 12],
};
export type SpectrumData = {
  lines: readonly number[];
  conditions: string;
  table?: boolean;
};
export type CalibrationData = {
  ion: string;
  standards: readonly { concentration: number; response: number }[];
  unknown: number;
  conditions: string;
  maxResponse: number;
};
export type InstrumentalGiven = {
  title: string;
  spectrum?: SpectrumData;
  calibration?: CalibrationData;
  rows?: readonly { label: string; text: string }[];
};
export type InstrumentalRecord = InstrumentalGiven & {
  mode: InstrumentalMode;
  given: string;
  expected: Record<string, string>;
  feedback: string;
};
export const instrumentalFields: Record<InstrumentalMode, readonly string[]> = {
  path: ["sample", "light", "output"],
  spectrum: ["ions", "basis"],
  calibration: ["concentration", "claim"],
  quality: ["decision", "reason"],
  advantage: ["feature", "reason"],
};
export const instrumentalChoices: Record<string, readonly string[]> = {
  sample: ["flame", "cold", "precipitate"],
  light: ["emission", "absorption", "solution"],
  output: ["lines", "colour", "mass"],
  basis: ["positions", "height", "count", "flameColour"],
  claim: ["calibrated", "identityOnly", "extrapolate", "pure"],
  decision: ["blank", "freshStandards", "extendRange", "repeat", "report"],
  reason: [
    "background",
    "conditions",
    "outside",
    "precision",
    "sensitive",
    "accurate",
    "rapid",
    "immune",
  ],
  feature: ["sensitive", "accurate", "rapid", "precision", "immune"],
};
export const instrumentalLabels: Record<string, string> = {
  concentration: "Concentration",
  sample: "Sample stage",
  light: "Light reaching the spectroscope",
  output: "Instrument output",
  basis: "Evidence used for identity",
  claim: "What the concentration result supports",
  decision: "Next decision",
  reason: "Reason for this decision",
  feature: "Feature supported by the comparison",
  flame: "Put the solution sample into a flame",
  cold: "Inspect the cold solution only",
  precipitate: "Add sodium hydroxide to make a precipitate",
  emission: "Light given out by the sample in the flame",
  absorption: "Measure light absorbed from a separate source",
  solution: "Use the colour of the solution alone",
  lines: "A line spectrum",
  colour: "One overall flame colour only",
  mass: "The mass of the whole beaker",
  positions: "Matching line positions with supplied references",
  height: "Only line brightness",
  count: "Only the number of lines",
  flameColour: "Only overall flame colour",
  calibrated: "Concentration from the supplied matched-ion standards",
  identityOnly: "Line positions alone give the concentration",
  extrapolate: "An exact concentration outside the standards is established",
  pure: "The whole solution is proven pure",
  blank: "Check a blank alongside the standards",
  freshStandards: "Obtain standards under the new conditions",
  extendRange: "Obtain suitable standards covering this response",
  repeat: "Repeat and investigate the disagreement",
  report: "Report an exact value without more evidence",
  background: "The method may contribute a background signal",
  conditions: "The old calibration may not apply to changed conditions",
  outside: "The response is outside the supplied calibrated range",
  precision: "Agreement of repeated readings concerns precision",
  sensitive: "Small concentrations can be detected",
  accurate: "Measurements are closer to the accepted reference",
  rapid: "Results take less time",
  immune: "Instruments are immune to every error",
};
const single =
  "The solution contains one of the five supplied metal ions. All three reference lines are detectable under these conditions.";
const pair =
  "The solution contains exactly two of the supplied metal ions. All supplied reference lines are detectable; shared positions overlap.";
export const instrumentalRecords: Record<string, InstrumentalRecord> = {
  "path-emission": {
    mode: "path",
    title: "Follow the emitted light",
    given:
      "Flame emission: choose the sample, light and output.",
    expected: { sample: "flame", light: "emission", output: "lines" },
    feedback:
      "The sample is put into a flame. Its emitted light passes through a spectroscope and produces a line spectrum. This is emission, not absorption or merely viewing solution colour.",
  },
  "path-repair": {
    mode: "path",
    title: "Repair the cold-solution plan",
    given:
      "A student proposes viewing a cold coloured solution through a spectroscope. Replace that proposal with the specified flame emission sequence.",
    expected: { sample: "flame", light: "emission", output: "lines" },
    feedback:
      "A cold solution's colour is not the specified flame emission method. The heated sample gives out light; the spectroscope resolves that light into spectral lines.",
  },
  "s-na": {
    mode: "spectrum",
    title: "Match one unknown",
    given: "Choose the supported ion and the evidence used.",
    spectrum: { lines: [2, 6, 9], conditions: single },
    expected: { ions: "na", basis: "positions" },
    feedback:
      "Positions 2, 6 and 9 match the supplied sodium reference. Position 6 alone is shared with potassium; the full pattern distinguishes them.",
  },
  "s-k": {
    mode: "spectrum",
    title: "A shared line is not the full pattern",
    given: "Identify this single-ion record.",
    spectrum: { lines: [3, 6, 11], conditions: single },
    expected: { ions: "k", basis: "positions" },
    feedback:
      "Potassium matches positions 3, 6 and 11. Sodium shares position 6 but does not explain 3 and 11.",
  },
  "s-ca": {
    mode: "spectrum",
    title: "Same count, different positions",
    given:
      "All references have three lines. Use their positions to identify this unknown.",
    spectrum: { lines: [1, 5, 8], conditions: single },
    expected: { ions: "ca", basis: "positions" },
    feedback:
      "Calcium matches positions 1, 5 and 8. Counting three lines cannot distinguish these references.",
  },
  "s-cu": {
    mode: "spectrum",
    title: "Read a supplied table",
    given: "Use the tabular reference set in the same display scale.",
    spectrum: { lines: [4, 7, 12], conditions: single, table: true },
    expected: { ions: "cu", basis: "positions" },
    feedback:
      "The table matches copper(II) at 4, 7 and 12. Lithium shares position 4 but not the complete set.",
  },
  "s-li": {
    mode: "spectrum",
    title: "Retain the original unknown",
    given:
      "Compare all three positions, even when a reference overlaps another.",
    spectrum: { lines: [1, 4, 10], conditions: single },
    expected: { ions: "li", basis: "positions" },
    feedback:
      "Lithium explains 1, 4 and 10. Calcium explains 1 only and copper explains 4 only; neither explains 10.",
  },
  "s-ca-na": {
    mode: "spectrum",
    title: "Separate a two-ion mixture",
    given:
      "Toggle the two reference patterns that explain every recorded position.",
    spectrum: { lines: [1, 2, 5, 6, 8, 9], conditions: pair },
    expected: { ions: "na,ca", basis: "positions" },
    feedback:
      "Calcium explains 1, 5 and 8; sodium explains 2, 6 and 9. Together they explain this supplied two-ion record. It does not establish absence of every other possible substance.",
  },
  "s-li-cu": {
    mode: "spectrum",
    title: "Two ions sharing a line",
    given:
      "The mixture has five visible positions rather than six. Select its two ions.",
    spectrum: { lines: [1, 4, 7, 10, 12], conditions: pair, table: true },
    expected: { ions: "li,cu", basis: "positions" },
    feedback:
      "Lithium and copper(II) overlap at position 4. Their combined positions are 1, 4, 7, 10 and 12. Five visible lines do not imply five ions.",
  },
  "s-shared": {
    mode: "spectrum",
    title: "An incomplete record",
    given:
      "Only position 6 was recorded. The other positions were not measured. Choose the evidence-based result.",
    spectrum: {
      lines: [6],
      conditions:
        "A partial single-ion record. Unrecorded lines are not evidence of absence.",
    },
    expected: { ions: "unresolved", basis: "positions" },
    feedback:
      "Position 6 is shared by sodium and potassium. The partial record does not uniquely identify either; obtain further line positions.",
  },
  "cal-4": {
    mode: "calibration",
    title: "Read the concentration",
    given:
      "The ion is already identified as sodium. Place the concentration marker using the supplied calibration.",
    calibration: {
      ion: "na",
      standards: [
        { concentration: 0, response: 5 },
        { concentration: 2, response: 25 },
        { concentration: 4, response: 45 },
        { concentration: 6, response: 65 },
      ],
      unknown: 45,
      maxResponse: 80,
      conditions:
        "Original illustrative sodium calibration: same flame, instrument settings and chosen emission line. Straight segments join the supplied standards; responses are in arbitrary units.",
    },
    expected: { concentration: "4", claim: "calibrated" },
    feedback:
      "Response 45 corresponds to 4 mg/dm³ on this calibration. Line positions identified the ion; the response and known standards determine concentration.",
  },
  "cal-3": {
    mode: "calibration",
    title: "Interpolate between standards",
    given:
      "Use the supplied potassium standards; retain the non-zero blank response.",
    calibration: {
      ion: "k",
      standards: [
        { concentration: 0, response: 3 },
        { concentration: 2, response: 13 },
        { concentration: 4, response: 23 },
        { concentration: 6, response: 33 },
      ],
      unknown: 18,
      maxResponse: 40,
      conditions:
        "Original illustrative calibration for the same potassium line under unchanged conditions. Use the straight segments between these supplied standards.",
    },
    expected: { concentration: "3", claim: "calibrated" },
    feedback:
      "18 lies halfway between 13 and 23, so concentration lies halfway between 2 and 4: 3 mg/dm³. The response is not simply divided by the slope without accounting for the intercept.",
  },
  "cal-2.5": {
    mode: "calibration",
    title: "Use a different response scale",
    given:
      "Read lithium concentration from the given standards, not from the number of spectral lines.",
    calibration: {
      ion: "li",
      standards: [
        { concentration: 0, response: 8 },
        { concentration: 2, response: 24 },
        { concentration: 4, response: 40 },
        { concentration: 6, response: 56 },
      ],
      unknown: 28,
      maxResponse: 60,
      conditions:
        "Original illustrative lithium calibration, same settings and chosen line. Use the supplied straight segments.",
    },
    expected: { concentration: "2.5", claim: "calibrated" },
    feedback:
      "28 is one quarter of the interval from 24 to 40, so concentration is 2 + ¼ × 2 = 2.5 mg/dm³. Its line pattern supplies identity, not this numerical concentration.",
  },
  "cal-5": {
    mode: "calibration",
    title: "Read above the midpoint",
    given:
      "The identified copper(II) sample has the recorded response. Use its own calibration.",
    calibration: {
      ion: "cu",
      standards: [
        { concentration: 0, response: 2 },
        { concentration: 2, response: 14 },
        { concentration: 4, response: 26 },
        { concentration: 6, response: 38 },
      ],
      unknown: 32,
      maxResponse: 40,
      conditions:
        "Original illustrative copper calibration. Same chosen line and measurement conditions; supplied standards joined by straight segments.",
    },
    expected: { concentration: "5", claim: "calibrated" },
    feedback:
      "Response 32 is halfway from 26 to 38: concentration is halfway from 4 to 6, or 5 mg/dm³. Sodium's calibration would not be a substitute.",
  },
  "q-blank": {
    mode: "quality",
    title: "A signal with no analyte",
    given:
      "Decide what should be checked before treating the full response as sample signal.",
    rows: [
      { label: "Blank, 0 mg/dm³", text: "Response 7" },
      { label: "Unknown", text: "Response 27" },
    ],
    expected: { decision: "blank", reason: "background" },
    feedback:
      "A blank checks the method's background. A non-zero blank does not by itself prove one particular contaminant, and it does not replace known concentration standards.",
  },
  "q-settings": {
    mode: "quality",
    title: "Changed instrument settings",
    given:
      "The flame conditions and instrument gain changed after the standards were measured. Choose the justified action.",
    rows: [
      { label: "Old standards", text: "Measured before the change" },
      { label: "Unknown", text: "Measured after the change" },
    ],
    expected: { decision: "freshStandards", reason: "conditions" },
    feedback:
      "Obtain standards under the new conditions. The old response-to-concentration relationship is not established for the changed flame and gain.",
  },
  "q-range": {
    mode: "quality",
    title: "Beyond the supplied standards",
    given:
      "The supplied instrument is unsaturated, but no response relation above the standards is given. Choose the justified decision.",
    rows: [
      { label: "Standard range", text: "0–6 mg/dm³; responses 5–65" },
      { label: "Unknown response", text: "85" },
    ],
    expected: { decision: "extendRange", reason: "outside" },
    feedback:
      "85 is outside the calibrated responses. Obtain suitable standards that cover it (or use a justified dilution and suitable calibration); do not report an exact extrapolated concentration from unsupported data.",
  },
  "q-repeat": {
    mode: "quality",
    title: "Repeated readings disagree",
    given:
      "These repeated concentration estimates concern agreement, not closeness to a known true value.",
    rows: [
      { label: "Repeated estimates", text: "2.0, 2.1 and 5.9 mg/dm³" },
      { label: "Accepted value", text: "Not supplied" },
    ],
    expected: { decision: "repeat", reason: "precision" },
    feedback:
      "Repeat and investigate the disagreement. Widely separated repeats indicate poor precision; no accepted value is supplied to judge accuracy.",
  },
  "a-sensitive": {
    mode: "advantage",
    title: "Detecting a small amount",
    given:
      "Both methods use matched blanks and valid procedures. Choose the feature supported by this supplied comparison.",
    rows: [
      { label: "Instrumental method", text: "Detects the ion at 0.01 mg/dm³" },
      {
        label: "Visual chemical test",
        text: "Detects the ion only at 1 mg/dm³ or above",
      },
    ],
    expected: { feature: "sensitive", reason: "sensitive" },
    feedback:
      "The instrumental method detects a lower concentration: it is more sensitive in this comparison. This does not demonstrate a shorter measurement time or universal freedom from errors.",
  },
  "a-accurate": {
    mode: "advantage",
    title: "Closer to the accepted value",
    given:
      "Compare both results with the independently accepted value, not merely with each other.",
    rows: [
      { label: "Accepted reference", text: "10.0 mg/dm³" },
      { label: "Instrument result", text: "10.1 mg/dm³" },
      { label: "Comparison method", text: "11.8 mg/dm³" },
    ],
    expected: { feature: "accurate", reason: "accurate" },
    feedback:
      "10.1 is closer to the accepted 10.0 than 11.8 is: this result is more accurate. A single result does not establish repeat precision.",
  },
  "a-rapid": {
    mode: "advantage",
    title: "Less time for a result",
    given:
      "Both methods identify this ion correctly. Interpret the timing evidence only.",
    rows: [
      { label: "Instrument", text: "20 seconds for one result" },
      { label: "Comparison method", text: "4 minutes for one result" },
    ],
    expected: { feature: "rapid", reason: "rapid" },
    feedback:
      "20 seconds is less than 240 seconds: the instrumental method is faster in this comparison. Timing alone does not demonstrate better accuracy or sensitivity.",
  },
};
function freeze(v: unknown) {
  if (v && typeof v === "object") {
    Object.values(v).forEach(freeze);
    Object.freeze(v);
  }
}
[
  instrumentalRecords,
  instrumentalFields,
  instrumentalChoices,
  instrumentalLabels,
  referenceLines,
  metalNames,
  metalKeys,
].forEach(freeze);
export function instrumentalRecord(mode: InstrumentalMode, record: string) {
  const r = instrumentalRecords[record];
  return r?.mode === mode ? r : undefined;
}
export function initialInstrumental(
  mode: InstrumentalMode,
  record: string,
): InstrumentalBoard {
  if (!instrumentalRecord(mode, record))
    throw Error("Unknown instrumental record");
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(instrumentalFields[mode].map((f) => [f, ""])),
  };
}
export function selectedMetals(value: string) {
  return value === "unresolved" || !value ? [] : value.split(",");
}
export function toggleMetal(value: string, key: string) {
  const set = new Set(selectedMetals(value));
  if (set.has(key)) set.delete(key);
  else set.add(key);
  return metalKeys.filter((k) => set.has(k)).join(",");
}
export function validInstrumental(
  mode: InstrumentalMode,
  value: unknown,
  record?: string,
): value is InstrumentalBoard {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  )
    return false;
  const b = value as InstrumentalBoard,
    fields = instrumentalFields[mode];
  return (
    !!fields &&
    b.version === "1" &&
    b.mode === mode &&
    !!instrumentalRecord(mode, b.record) &&
    (record === undefined || b.record === record) &&
    Object.keys(b).length === fields.length + 3 &&
    fields.every((f) => {
      const v = b[f];
      if (typeof v !== "string") return false;
      if (!v) return true;
      if (f === "concentration") return v.length <= 16;
      if (f === "ions")
        return (
          v === "unresolved" ||
          metalKeys.filter((k) => v.split(",").includes(k)).join(",") === v
        );
      return instrumentalChoices[f]?.includes(v);
    })
  );
}
export function validInstrumentalHistory(
  mode: InstrumentalMode,
  record: string,
  h: unknown,
): h is InstrumentalBoard[] {
  if (
    !Array.isArray(h) ||
    h.length < 1 ||
    h.length > 500 ||
    !h.every((b) => validInstrumental(mode, b, record))
  )
    return false;
  const start = initialInstrumental(mode, record);
  return (
    Object.keys(start).every((k) => h[0][k] === start[k]) &&
    h.every(
      (b, i) =>
        i === 0 ||
        instrumentalFields[mode].filter((f) => b[f] !== h[i - 1][f]).length ===
          1,
    )
  );
}
export function checkInstrumental(
  mode: InstrumentalMode,
  b: InstrumentalBoard,
) {
  if (!validInstrumental(mode, b))
    return {
      correct: false,
      message:
        "This proposal is unreadable. Its original entries have been retained.",
    };
  const r = instrumentalRecord(mode, b.record)!;
  if (instrumentalFields[mode].some((f) => !b[f]))
    return {
      correct: false,
      message:
        "Complete each part of your proposal before checking. Unchosen fields remain unknown.",
    };
  const wrong = instrumentalFields[mode].filter((f) =>
    f === "concentration"
      ? !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(b[f]) ||
        !Number.isFinite(Number(b[f])) ||
        Math.abs(Number(b[f]) - Number(r.expected[f])) > 0.000001
      : b[f] !== r.expected[f],
  );
  return {
    correct: wrong.length === 0,
    message: wrong.length
      ? "Reconsider " +
        wrong
          .map((f) =>
            f === "ions"
              ? "the selected ion set"
              : instrumentalLabels[f].toLowerCase(),
          )
          .join(" and ") +
        ". " +
        r.feedback +
        " Your proposal remains as entered."
      : r.feedback,
  };
}
export function proposalLines(ions: string) {
  return [
    ...new Set(selectedMetals(ions).flatMap((k) => referenceLines[k] ?? [])),
  ].sort((a, b) => a - b);
}
