/** Integer-hundredths arithmetic preserves exact protocol thresholds. */
export type TitreReading = {
  id: string;
  hundredths: number;
  rough: boolean;
};
export function readingHundredths(reading: number): number {
  if (!Number.isFinite(reading) || reading < 0 || reading > 50)
    throw new Error("A burette reading must lie between 0 and 50 cm³.");
  const integer = Math.round(reading * 100);
  if (Math.abs(reading * 100 - integer) > 1e-7)
    throw new Error("This record uses readings to hundredths of a cm³.");
  return integer;
}
export function techniqueTitre(initial: number, final: number): number {
  const start = readingHundredths(initial);
  const end = readingHundredths(final);
  if (end <= start)
    throw new Error("Use increasing readings on the same burette.");
  return (end - start) / 100;
}
export function selectedTitres(
  readings: readonly TitreReading[],
  selectedIds: readonly string[],
  maximumSpanHundredths: number,
) {
  if (!Number.isInteger(maximumSpanHundredths) || maximumSpanHundredths < 0)
    throw new Error(
      "State a non-negative whole hundredths protocol threshold.",
    );
  const ids = new Set<string>();
  for (const r of readings) {
    if (
      !r.id ||
      ids.has(r.id) ||
      !Number.isInteger(r.hundredths) ||
      r.hundredths <= 0 ||
      r.hundredths > 5000
    )
      throw new Error("Use distinct positive titres within burette capacity.");
    ids.add(r.id);
  }
  if (new Set(selectedIds).size !== selectedIds.length)
    throw new Error("A reading cannot be selected twice.");
  if (selectedIds.some((id) => !ids.has(id)))
    throw new Error("Selected reading is not in this supplied record.");
  const selected = readings.filter((r) => selectedIds.includes(r.id));
  const count = selected.length;
  const sumHundredths = selected.reduce((sum, r) => sum + r.hundredths, 0);
  const spanHundredths = count
    ? Math.max(...selected.map((r) => r.hundredths)) -
      Math.min(...selected.map((r) => r.hundredths))
    : null;
  const includesRough = selected.some((r) => r.rough);
  const usable =
    count >= 2 &&
    !includesRough &&
    spanHundredths !== null &&
    spanHundredths <= maximumSpanHundredths;
  return {
    count,
    sumHundredths,
    meanCm3: count ? sumHundredths / (100 * count) : null,
    spanCm3: spanHundredths === null ? null : spanHundredths / 100,
    includesRough,
    usable,
    reason: !count
      ? "Select readings first."
      : count < 2
        ? "One reading is not a repeated group."
        : includesRough
          ? "This protocol excludes the labelled rough estimate."
          : spanHundredths! > maximumSpanHundredths
            ? "The largest-minus-smallest span exceeds the stated limit."
            : "At least two careful readings fit the stated maximum span.",
  };
}
export const techniqueRepeatRecords = {
  initial: {
    label:
      "Original supplied titres; use at least two careful readings within 0.10 cm³.",
    maximumSpanHundredths: 10,
    readings: [
      { id: "rough", hundredths: 2480, rough: true },
      { id: "a", hundredths: 2410, rough: false },
      { id: "b", hundredths: 2415, rough: false },
      { id: "c", hundredths: 2410, rough: false },
      { id: "d", hundredths: 2370, rough: false },
    ],
  },
  edge: {
    label:
      "Original supplied boundary case; maximum careful-group span 0.10 cm³.",
    maximumSpanHundredths: 10,
    readings: [
      { id: "rough", hundredths: 1890, rough: true },
      { id: "a", hundredths: 1845, rough: false },
      { id: "b", hundredths: 1855, rough: false },
      { id: "c", hundredths: 1850, rough: false },
    ],
  },
  chain: {
    label:
      "Original supplied overlapping pairs; maximum careful-group span 0.10 cm³.",
    maximumSpanHundredths: 10,
    readings: [
      { id: "a", hundredths: 1990, rough: false },
      { id: "b", hundredths: 2000, rough: false },
      { id: "c", hundredths: 2010, rough: false },
    ],
  },
  wider: {
    label:
      "Different supplied protocol: use at least two careful readings within 0.20 cm³.",
    maximumSpanHundredths: 20,
    readings: [
      { id: "rough", hundredths: 1640, rough: true },
      { id: "a", hundredths: 1525, rough: false },
      { id: "b", hundredths: 1545, rough: false },
    ],
  },
  identicalRough: {
    label:
      "A rough estimate happens to match; this protocol still excludes rough trials.",
    maximumSpanHundredths: 10,
    readings: [
      { id: "rough", hundredths: 2210, rough: true },
      { id: "a", hundredths: 2210, rough: false },
      { id: "b", hundredths: 2215, rough: false },
    ],
  },
} as const;

export const techniqueReadingRecords = {
  initial: {
    label: "Same burette: initial 1.20 cm³; final 23.60 cm³",
    initial: 1.2,
    final: 23.6,
  },
  nonzero: {
    label: "Same burette: initial 4.35 cm³; final 29.40 cm³",
    initial: 4.35,
    final: 29.4,
  },
  shifted: {
    label: "Same delivered amount with a different start: 6.20 to 28.60 cm³",
    initial: 6.2,
    final: 28.6,
  },
  zero: {
    label: "Same burette: initial 0.00 cm³; final 18.75 cm³",
    initial: 0,
    final: 18.75,
  },
} as const;

/** Every direction claim states the orientation and what is controlled. */
export const techniqueErrorRecords = {
  initial: {
    label:
      "NaOH in the burette is diluted by remaining water; fixed HCl aliquot and correct endpoint.",
    direction: "larger",
    reason: "diluted-titrant",
    explanation:
      "Water dilutes the NaOH placed in the burette. More of that solution is required to neutralise the same amount of HCl, so the measured titre is larger.",
  },
  pipetteWater: {
    label:
      "NaOH in burette. A volumetric pipette containing distilled-water droplets is filled with HCl to its mark; endpoint otherwise correct.",
    direction: "smaller",
    reason: "diluted-aliquot",
    explanation:
      "Water in the pipette dilutes the HCl before the fixed volume is measured. The delivered aliquot contains less acid, so less NaOH is required.",
  },
  flaskWater: {
    label:
      "NaOH in burette. After the correct measured HCl aliquot enters the flask, a little distilled water rinses the flask walls.",
    direction: "unchanged",
    reason: "same-aliquot-amount",
    explanation:
      "The added water changes the acid concentration and total mixture volume, but not the amount of acid already pipetted. The required NaOH amount is unchanged, within the suitable-endpoint model.",
  },
  bubble: {
    label:
      "The burette jet starts with an air bubble. During titration the bubble leaves and the jet fills with titrant. The final endpoint in the flask is otherwise correct.",
    direction: "larger",
    reason: "jet-filling-counted",
    explanation:
      "Part of the decrease in the calibrated column fills the initially empty jet rather than reaching the flask. The recorded final-minus-initial volume overstates delivery to the flask.",
  },
  overshoot: {
    label:
      "NaOH in burette, HCl in flask. The student continues adding NaOH after the specified endpoint colour first persists.",
    direction: "larger",
    reason: "extra-titrant",
    explanation:
      "Continuing beyond the endpoint adds an unnecessary extra titrant volume, so the recorded titre is too large.",
  },
  funnel: {
    label:
      "A filling funnel is left in the burette. After the initial reading, an unmeasured drop enters the burette from the funnel and is subsequently delivered to the flask.",
    direction: "smaller",
    reason: "unrecorded-topup",
    explanation:
      "The flask receives titrant that did not come from the recorded initial column amount. The final-minus-initial reading undercounts the actual total delivery.",
  },
} as const;

export const techniqueEndpointRecords = {
  initial: {
    label:
      "HCl in flask; NaOH added with phenolphthalein. Endpoint: first faint pink persisting after swirling.",
    action: "dropwise-swirl",
    colour: "faint-pink",
    reason: "control-final-volume",
  },
  reverse: {
    label:
      "NaOH in flask; HCl added. Phenolphthalein: pink before the endpoint; the method specifies the first colourless solution that persists after swirling.",
    action: "dropwise-swirl",
    colour: "colourless",
    reason: "control-final-volume",
  },
  methyl: {
    label:
      "NaOH in flask; HCl added. Methyl orange: yellow initially; this supplied protocol specifies the first persistent orange endpoint.",
    action: "dropwise-swirl",
    colour: "orange",
    reason: "control-final-volume",
  },
  temporary: {
    label:
      "HCl in flask; NaOH added with phenolphthalein. A local pink patch disappears completely after swirling; the protocol requires persistent faint pink.",
    action: "continue-dropwise",
    colour: "not-yet-persistent",
    reason: "local-not-mixed",
  },
  overshot: {
    label:
      "HCl in flask; NaOH added with phenolphthalein. A large addition produces a deep pink solution beyond the specified first faint persistent pink.",
    action: "repeat-carefully",
    colour: "beyond-specified-endpoint",
    reason: "cannot-recover-delivered-volume",
  },
  broad: {
    label:
      "The method needs a sharp colour endpoint. Universal indicator changes through several colours over a broad pH range.",
    action: "choose-suitable-single-indicator",
    colour: "sharp-transition",
    reason: "broad-colour-range",
  },
} as const;

export const techniqueSequenceRecords = {
  initial: {
    label:
      "Conceptual sequence: known NaOH in burette, measured HCl in flask; indicator is suitable for this reaction.",
    steps: [
      "Rinse the volumetric pipette with HCl, then use a pipette filler to measure the fixed aliquot into the flask.",
      "Rinse the burette with NaOH, fill it and its jet, remove the funnel and record the initial reading.",
      "Add a few drops of suitable indicator to the flask; use a white tile.",
      "Perform a rough trial to locate the approximate endpoint.",
      "Use fresh equal HCl aliquots for careful trials; add dropwise near the endpoint while swirling.",
      "Record final readings, subtract initial readings, and select repeat titres under the stated protocol.",
    ],
    order: [1, 0, 2, 4, 3, 5],
    requiredPairs: [
      [0, 3],
      [1, 3],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    explanation:
      "Pipette and burette preparation may be done in either order, but both and the indicator precede the rough trial. The rough estimate precedes careful repeat trials; the readings then support titre selection.",
  },
  salt: {
    label:
      "A suitable reacting-volume ratio has been established for an acid and a soluble alkali; prepare an uncontaminated salt solution.",
    steps: [
      "Establish the acid–alkali reacting-volume ratio using a suitable indicator and reliable titres.",
      "Measure fresh solutions in that established ratio without indicator.",
      "Gently concentrate the resulting salt solution.",
      "Allow the concentrated solution to cool and crystallise.",
      "Separate the crystals from the mother liquor.",
      "Dry the separated crystals using the stated suitable method.",
    ],
    order: [1, 0, 3, 2, 5, 4],
    requiredPairs: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    explanation:
      "Indicator is used to establish the reacting ratio, then omitted from a fresh salt preparation. Concentration precedes cooling; crystals are separated before drying.",
  },
  compare: {
    label:
      "Compare the reacting acid amounts per equal volume of samples P and Q using the same NaOH and suitable indicator.",
    steps: [
      "Choose equal accurately measured acid aliquots and the same NaOH titrant for P and Q.",
      "Use a rough trial for each acid to estimate its endpoint volume.",
      "Perform careful repeats for each acid with the same endpoint criterion.",
      "Calculate each accepted mean titre using the stated selection rule.",
      "Compare the accepted means under the controlled conditions.",
    ],
    order: [0, 2, 1, 4, 3],
    requiredPairs: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    explanation:
      "Compare selected mean titres after establishing reliable endpoints for equal acid aliquots with the same titrant. Different volumes, titrant concentrations or endpoint criteria undermine the comparison.",
  },
} as const;

export function validTechniqueOrder(
  order: unknown,
  size: number,
): order is number[] {
  return (
    Array.isArray(order) &&
    order.length === size &&
    order.every((v) => Number.isInteger(v) && v >= 0 && v < size) &&
    new Set(order).size === size
  );
}
export function techniqueSequenceAccepted(
  order: readonly number[],
  requiredPairs: readonly (readonly number[])[],
) {
  if (!validTechniqueOrder(order, order.length)) return false;
  return requiredPairs.every(
    ([before, after]) =>
      order.indexOf(before) >= 0 &&
      order.indexOf(after) >= 0 &&
      order.indexOf(before) < order.indexOf(after),
  );
}

export type TechniqueMode =
  "reading" | "repeats" | "errors" | "endpoint" | "sequence";
export const techniqueRecords = {
  reading: techniqueReadingRecords,
  repeats: techniqueRepeatRecords,
  errors: techniqueErrorRecords,
  endpoint: techniqueEndpointRecords,
  sequence: techniqueSequenceRecords,
};
export const techniqueChoices: Record<
  TechniqueMode,
  Record<string, string[]>
> = {
  reading: {
    record: Object.keys(techniqueReadingRecords),
    guess: Array.from({ length: 5001 }, (_, i) => String(i)),
    meniscus: ["unset", "bottom-eye-level", "top-above", "bottom-below"],
  },
  repeats: {
    record: Object.keys(techniqueRepeatRecords),
    selected: [],
    decision: ["unset", "yes", "no"],
  },
  errors: {
    record: Object.keys(techniqueErrorRecords),
    direction: ["unset", "larger", "smaller", "unchanged"],
    reason: [
      "unset",
      "diluted-titrant",
      "diluted-aliquot",
      "same-aliquot-amount",
      "jet-filling-counted",
      "extra-titrant",
      "unrecorded-topup",
      "more-water-always-more-titrant",
    ],
  },
  endpoint: {
    record: Object.keys(techniqueEndpointRecords),
    action: [
      "unset",
      "dropwise-swirl",
      "continue-dropwise",
      "repeat-carefully",
      "choose-suitable-single-indicator",
      "add-fast",
      "claim-exact-ph7",
    ],
    colour: [
      "unset",
      "faint-pink",
      "colourless",
      "orange",
      "not-yet-persistent",
      "beyond-specified-endpoint",
      "sharp-transition",
      "deep-pink",
    ],
    reason: [
      "unset",
      "control-final-volume",
      "local-not-mixed",
      "cannot-recover-delivered-volume",
      "broad-colour-range",
      "all-endpoints-neutral",
    ],
  },
  sequence: { record: Object.keys(techniqueSequenceRecords), order: [] },
};
export function initialTechniqueBoard(
  mode: TechniqueMode,
  record = "initial",
): Record<string, string> {
  if (!Object.keys(techniqueRecords[mode]).includes(record))
    throw new Error("Unknown record.");
  const b = Object.fromEntries(
    Object.keys(techniqueChoices[mode]).map((k) => [
      k,
      k === "record"
        ? record
        : k === "guess"
          ? "0"
          : k === "selected"
            ? ""
            : "unset",
    ]),
  );
  if (mode === "sequence") {
    const r =
      techniqueSequenceRecords[record as keyof typeof techniqueSequenceRecords];
    b.order = r.order.join(",");
  }
  return b;
}
export function validTechniqueBoard(
  mode: TechniqueMode,
  b: unknown,
): b is Record<string, string> {
  if (!b || typeof b !== "object" || Array.isArray(b)) return false;
  const v = b as Record<string, unknown>;
  if (Object.keys(v).length !== Object.keys(techniqueChoices[mode]).length)
    return false;
  if (
    !Object.entries(techniqueChoices[mode]).every(
      ([k, values]) =>
        typeof v[k] === "string" &&
        (k === "selected" || k === "order" || values.includes(v[k] as string)),
    )
  )
    return false;
  if (mode === "repeats") {
    const r =
      techniqueRepeatRecords[v.record as keyof typeof techniqueRepeatRecords];
    const selected = v.selected === "" ? [] : String(v.selected).split(",");
    const canonical = r.readings
      .filter((x) => selected.includes(x.id))
      .map((x) => x.id)
      .join(",");
    if (v.selected !== canonical || new Set(selected).size !== selected.length)
      return false;
  }
  if (mode === "sequence") {
    const r =
      techniqueSequenceRecords[
        v.record as keyof typeof techniqueSequenceRecords
      ];
    const text = String(v.order),
      order = text.split(",").map(Number);
    if (!validTechniqueOrder(order, r.steps.length) || order.join(",") !== text)
      return false;
  }
  return true;
}
export function techniquePrediction(
  mode: TechniqueMode,
  b: Record<string, string | number>,
) {
  if (!validTechniqueBoard(mode, b))
    return {
      complete: false,
      correct: false,
      explanation: "Saved prediction is invalid.",
    };
  if (mode === "reading") {
    const r =
      techniqueReadingRecords[b.record as keyof typeof techniqueReadingRecords];
    const expected = Math.round(techniqueTitre(r.initial, r.final) * 100);
    return {
      complete: b.meniscus !== "unset",
      correct:
        Number(b.guess) === expected && b.meniscus === "bottom-eye-level",
      explanation:
        r.final.toFixed(2) +
        " − " +
        r.initial.toFixed(2) +
        " = " +
        (expected / 100).toFixed(2) +
        " cm³. Read the bottom of the concave meniscus at eye level.",
    };
  }
  if (mode === "repeats") {
    const r =
      techniqueRepeatRecords[b.record as keyof typeof techniqueRepeatRecords];
    const s = selectedTitres(
      r.readings,
      b.selected ? b.selected.split(",") : [],
      r.maximumSpanHundredths,
    );
    return {
      complete: s.count > 0 && b.decision !== "unset",
      correct: s.count > 0 && b.decision === (s.usable ? "yes" : "no"),
      explanation:
        s.reason +
        (s.usable
          ? " This selected group's mean is " + s.meanCm3!.toFixed(2) + " cm³."
          : " This selection is not an accepted mean under this protocol."),
    };
  }
  if (mode === "errors") {
    const r =
      techniqueErrorRecords[b.record as keyof typeof techniqueErrorRecords];
    return {
      complete: b.direction !== "unset" && b.reason !== "unset",
      correct: b.direction === r.direction && b.reason === r.reason,
      explanation: r.explanation,
    };
  }
  if (mode === "endpoint") {
    const r =
      techniqueEndpointRecords[
        b.record as keyof typeof techniqueEndpointRecords
      ];
    return {
      complete:
        b.action !== "unset" && b.colour !== "unset" && b.reason !== "unset",
      correct:
        b.action === r.action && b.colour === r.colour && b.reason === r.reason,
      explanation:
        "Use this record's direction of addition and stated observation. A suitable indicator endpoint is not a universal claim of exact pH 7.",
    };
  }
  const r =
    techniqueSequenceRecords[b.record as keyof typeof techniqueSequenceRecords];
  return {
    complete: true,
    correct: techniqueSequenceAccepted(
      b.order.split(",").map(Number),
      r.requiredPairs,
    ),
    explanation: r.explanation,
  };
}
