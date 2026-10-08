export type ProfileMode = "build" | "read" | "arrows" | "catalyst" | "evidence";
type Board = Record<string, string | number>;
type Levels = {
  reactant: number;
  product: number;
  peak: number;
  wide?: boolean;
};
const levels = (reactant: number, product: number, peak: number): Levels => ({
  reactant,
  product,
  peak,
});
export const profileRecords = {
  build: {
    initial: {
      label:
        "Construct the supplied exothermic profile: reactants 80 kJ; products 30 kJ; forward activation energy 40 kJ. Use the stated reaction amount.",
      ...levels(80, 30, 120),
    },
    endothermic: {
      label:
        "Construct the supplied endothermic profile: reactants 20 kJ; products 55 kJ; forward activation energy 70 kJ.",
      ...levels(20, 55, 90),
    },
    shifted: {
      label:
        "New energy reference for the same model: reactants 140 kJ; products 90 kJ; forward activation energy 40 kJ.",
      ...levels(140, 90, 180),
    },
    fromRelease: {
      label:
        "Reactants 70 kJ; 25 kJ released to surroundings overall; forward activation energy 50 kJ. Construct all three levels.",
      ...levels(70, 45, 120),
    },
    fromAbsorb: {
      label:
        "Reactants 35 kJ; 40 kJ absorbed overall; forward activation energy 60 kJ. Construct all three levels.",
      ...levels(35, 75, 95),
    },
  },
  read: {
    initial: {
      label:
        "Supplied profile for the stated reaction amount: reactants 40 kJ, products 20 kJ, peak 90 kJ. Predict forward activation and SIGNED overall change.",
      ...levels(40, 20, 90),
    },
    endothermic: {
      label:
        "Supplied profile: reactants 25 kJ, products 60 kJ, peak 100 kJ. Predict forward activation and SIGNED overall change.",
      ...levels(25, 60, 100),
    },
    releaseSize: {
      label:
        "Reactants 80 kJ, products 30 kJ, peak 120 kJ. Predict forward activation and POSITIVE SIZE of energy released.",
      ...levels(80, 30, 120),
      quantity: "release-size",
    },
    offset: {
      label:
        "Reactants 140 kJ, products 120 kJ, peak 190 kJ. Predict forward activation and SIGNED overall change with this changed zero reference.",
      ...levels(140, 120, 190),
    },
    zero: {
      label:
        "Reactants and products are both 50 kJ; peak 100 kJ. No net energy difference, but a barrier remains. Predict activation and SIGNED overall change.",
      ...levels(50, 50, 100),
    },
    highProduct: {
      label:
        "Reactants 10 kJ, products 85 kJ, peak 100 kJ. Predict forward activation and SIGNED overall change.",
      ...levels(10, 85, 100),
    },
  },
  arrows: {
    initial: {
      label:
        "Exothermic profile: reactants 80 kJ, products 30 kJ, peak 120 kJ. Place forward activation and overall-change arrows.",
      ...levels(80, 30, 120),
    },
    endothermic: {
      label:
        "Endothermic profile: reactants 20 kJ, products 55 kJ, peak 90 kJ. Place the two forward-reaction arrows.",
      ...levels(20, 55, 90),
    },
    shifted: {
      label:
        "Reactants 140 kJ, products 90 kJ, peak 180 kJ. The energy reference changed; select the correct arrow spans.",
      ...levels(140, 90, 180),
    },
    highProduct: {
      label:
        "Reactants 10 kJ, products 85 kJ, peak 100 kJ. Do not substitute the short product-to-peak arrow for forward activation.",
      ...levels(10, 85, 100),
    },
    wide: {
      label:
        "A wider schematic profile uses reactants 60 kJ, products 25 kJ and peak 110 kJ. Horizontal width does not change the required vertical energy spans.",
      ...levels(60, 25, 110),
      wide: true,
    },
  },
  catalyst: {
    initial: {
      label:
        "Same exothermic reaction: original reactants 80 kJ, products 30 kJ, peak 120 kJ. Construct any valid lower-barrier single-hump alternative.",
      ...levels(80, 30, 120),
    },
    endothermic: {
      label:
        "Same endothermic reaction: original reactants 20 kJ, products 55 kJ, peak 90 kJ. Keep both endpoints and a positive barrier above both.",
      ...levels(20, 55, 90),
    },
    highProduct: {
      label:
        "Original reactants 10 kJ, products 85 kJ, peak 110 kJ. Lower the barrier while keeping the proposed peak above BOTH endpoint levels.",
      ...levels(10, 85, 110),
    },
    shifted: {
      label:
        "Original reactants 140 kJ, products 90 kJ, peak 180 kJ. Changed energy reference does not permit changing endpoints.",
      ...levels(140, 90, 180),
    },
    unchanged: {
      label:
        "Original reactants 50 kJ, products 20 kJ, peak 100 kJ. A curve with the identical peak has not demonstrated a lower barrier; construct an alternative.",
      ...levels(50, 20, 100),
    },
  },
  evidence: {
    initial: {
      label:
        "An exothermic profile ends below its reactant level but has a peak above the reactants. A student says that energy release means no starting barrier.",
      claim: "barrier-and-release",
      reason: "different-spans",
      explanation:
        "Activation energy is the reactant-to-peak barrier. Overall release is the reactant/product difference; an exothermic reaction can still need starting energy.",
    },
    axis: {
      label:
        "The horizontal axis is progress of reaction, with no time calibration. A student reads the peak at 3 seconds.",
      claim: "time-not-established",
      reason: "progress-not-time",
      explanation:
        "Progress of reaction describes the sequence/pathway. Without a time axis, the graph does not give seconds, duration or rate.",
    },
    catalyst: {
      label:
        "An alleged catalyst profile lowers the product energy while keeping reactants unchanged.",
      claim: "not-same-catalysed-reaction",
      reason: "endpoints-must-remain",
      explanation:
        "For the same overall reaction, a catalyst gives an alternative pathway with a lower activation barrier, without changing the reactant/product energy difference.",
    },
    peak: {
      label:
        "A proposed simple single-peak profile has reactants 20 kJ, products 80 kJ and labelled peak 60 kJ.",
      claim: "invalid-simple-profile",
      reason: "peak-above-both",
      explanation:
        "The stated peak is below the products. This cannot be the maximum of a simple curve connecting both supplied endpoints.",
    },
    zero: {
      label:
        "Every level in a profile is shifted upwards by the same 100 kJ. A student claims the overall energy difference must change.",
      claim: "differences-unchanged",
      reason: "same-offset-cancels",
      explanation:
        "Subtracting shifted levels cancels the shared offset. The forward barrier and overall energy difference are unchanged.",
    },
    slope: {
      label:
        "Two schematics have identical reactant/product/peak energies but different horizontal widths. No reaction-time or kinetic evidence is supplied.",
      claim: "rate-not-established",
      reason: "width-not-time",
      explanation:
        "The same vertical differences are shown. Horizontal width or steepness on an uncalibrated reaction-progress axis does not independently give reaction rate.",
    },
    collision: {
      label:
        "A colliding pair has enough energy to reach the barrier. No suitable molecular orientation is supplied. A student claims reaction is guaranteed.",
      claim: "not-guaranteed",
      reason: "orientation-also-matters",
      explanation:
        "Sufficient collision energy is necessary, but a suitable encounter/orientation is also needed. The energy condition alone does not guarantee every collision reacts.",
    },
    temperature: {
      label:
        "The vertical axis is relative energy for a stated reaction amount, in kJ. A student calls a peak labelled 120 kJ a temperature of 120 °C.",
      claim: "not-temperature",
      reason: "read-axis-unit",
      explanation:
        "This is an energy-level diagram, not a thermometer or temperature-time plot. Read the named quantity and units.",
    },
    multistep: {
      label:
        "A publisher diagram has a two-hump catalysed pathway with the same endpoints and lower controlling barrier. A student rejects it because all catalyst paths must have one hump.",
      claim: "single-hump-not-universal",
      reason: "schematic-not-mechanism-proof",
      explanation:
        "A single-hump GCSE profile is a simplified representation. Actual alternative mechanisms can contain several steps; the simple drawing does not prove every real pathway has one hump.",
    },
  },
} as const;
const range = (a: number, b: number, step = 1) =>
  Array.from({ length: (b - a) / step + 1 }, (_, i) => String(a + i * step));
const evidence = Object.values(profileRecords.evidence);
export const profileChoices: Record<ProfileMode, Record<string, string[]>> = {
  build: {
    record: Object.keys(profileRecords.build),
    reactant: range(0, 240, 5),
    product: range(0, 240, 5),
    peak: range(0, 240, 5),
  },
  read: {
    record: Object.keys(profileRecords.read),
    activation: range(-240, 240),
    overall: range(-240, 240),
    classification: ["unset", "exothermic", "endothermic", "no-net-difference"],
  },
  arrows: {
    record: Object.keys(profileRecords.arrows),
    activationArrow: [
      "unset",
      "reactants-peak",
      "products-peak",
      "zero-peak",
      "reactants-products",
    ],
    overallArrow: [
      "unset",
      "reactants-products",
      "products-reactants",
      "reactants-peak",
      "peak-products",
    ],
  },
  catalyst: {
    record: Object.keys(profileRecords.catalyst),
    reactant: range(0, 240, 5),
    product: range(0, 240, 5),
    peak: range(0, 240, 5),
  },
  evidence: {
    record: Object.keys(profileRecords.evidence),
    claim: [
      "unset",
      ...new Set(evidence.map((r) => r.claim)),
      "all-reactions-immediate",
      "energy-created",
    ],
    reason: [
      "unset",
      ...new Set(evidence.map((r) => r.reason)),
      "peak-is-overall",
      "hot-means-energy-created",
    ],
  },
};
export function initialProfileBoard(
  mode: ProfileMode,
  record = "initial",
): Board {
  if (!profileChoices[mode].record.includes(record))
    throw Error("Unknown supplied profile.");
  const b: Board = { record };
  for (const field of Object.keys(profileChoices[mode]))
    if (field !== "record")
      b[field] = [
        "reactant",
        "product",
        "peak",
        "activation",
        "overall",
      ].includes(field)
        ? "0"
        : "unset";
  if (mode === "catalyst") {
    const r =
      profileRecords.catalyst[record as keyof typeof profileRecords.catalyst];
    b.reactant = String(r.reactant);
    b.product = String(r.product);
    b.peak = String(r.peak);
  }
  return b;
}
export function validProfileBoard(mode: ProfileMode, b: Board): boolean {
  const fields = Object.keys(profileChoices[mode]);
  return (
    Object.keys(b).length === fields.length &&
    fields.every(
      (f) =>
        typeof b[f] === "string" &&
        profileChoices[mode][f].includes(String(b[f])),
    )
  );
}
export function profileDifferences(r: Levels) {
  return {
    activation: r.peak - r.reactant,
    overall: r.product - r.reactant,
    classification:
      r.product < r.reactant
        ? "exothermic"
        : r.product > r.reactant
          ? "endothermic"
          : "no-net-difference",
  };
}
export function validSimpleProfile(r: Levels) {
  return r.peak > Math.max(r.reactant, r.product);
}
export function profilePrediction(
  mode: ProfileMode,
  b: Board,
): { correct: boolean; explanation: string } {
  if (!validProfileBoard(mode, b))
    return {
      correct: false,
      explanation: "Use the known fields and supplied record.",
    };
  const record = String(b.record);
  if (mode === "evidence") {
    const r =
      profileRecords.evidence[record as keyof typeof profileRecords.evidence];
    return {
      correct: b.claim === r.claim && b.reason === r.reason,
      explanation: r.explanation,
    };
  }
  if (mode === "build") {
    const r = profileRecords.build[record as keyof typeof profileRecords.build],
      p = {
        reactant: Number(b.reactant),
        product: Number(b.product),
        peak: Number(b.peak),
      };
    return {
      correct:
        p.reactant === r.reactant &&
        p.product === r.product &&
        p.peak === r.peak &&
        validSimpleProfile(p),
      explanation:
        "Construct the stated reactant/product levels and add the forward activation barrier to reactants to find the peak. Keep a curved connection and a peak above both plateaus; absolute peak height is not itself activation energy.",
    };
  }
  if (mode === "read") {
    const r = profileRecords.read[record as keyof typeof profileRecords.read],
      d = profileDifferences(r),
      overall =
        "quantity" in r && r.quantity === "release-size"
          ? Math.abs(d.overall)
          : d.overall;
    return {
      correct:
        Number(b.activation) === d.activation &&
        Number(b.overall) === overall &&
        b.classification === d.classification,
      explanation:
        "Forward activation is peak minus reactants. Signed overall change is products minus reactants. Positive SIZE of released energy is the magnitude of the decrease. The common energy reference cancels; a zero overall difference can still have a barrier.",
    };
  }
  if (mode === "arrows")
    return {
      correct:
        b.activationArrow === "reactants-peak" &&
        b.overallArrow === "reactants-products",
      explanation:
        "Forward activation points from the reactant level to the peak. Overall change spans reactants to products, down for exothermic and up for endothermic. Product-to-peak is a different barrier; zero-to-peak is an absolute height, not the forward activation difference.",
    };
  const r =
      profileRecords.catalyst[record as keyof typeof profileRecords.catalyst],
    p = {
      reactant: Number(b.reactant),
      product: Number(b.product),
      peak: Number(b.peak),
    };
  return {
    correct:
      p.reactant === r.reactant &&
      p.product === r.product &&
      p.peak < r.peak &&
      validSimpleProfile(p),
    explanation:
      "For the same reaction, keep reactant/product energies unchanged and draw a distinct lower-barrier alternative. This simple one-hump construction must still have its maximum above both endpoints. Real mechanisms can have multiple steps; no single-hump universality or time/rate measurement follows from this schematic.",
  };
}
export function profileHistoryStep(mode: ProfileMode, a: Board, b: Board) {
  if (!validProfileBoard(mode, a) || !validProfileBoard(mode, b)) return false;
  if (a.record !== b.record) {
    const expected = initialProfileBoard(mode, String(b.record));
    return Object.keys(expected).every((f) => b[f] === expected[f]);
  }
  const changed = Object.keys(a).filter((f) => a[f] !== b[f]);
  if (changed.length !== 1) return false;
  const field = changed[0];
  if (["reactant", "product", "peak"].includes(field))
    return Math.abs(Number(a[field]) - Number(b[field])) === 5;
  return true;
}
/** Equal energy reference; schematic progress, never elapsed time. Flat plateaus and smooth joins. */
export function profileHeight(t: number, r: Levels): number {
  if (!Number.isFinite(t) || t < 0 || t > 1)
    throw Error("Progress outside the drawing.");
  const smooth = (v: number) => (1 - Math.cos(Math.PI * v)) / 2;
  const start = r.wide ? 0.12 : 0.2,
    end = r.wide ? 0.88 : 0.8;
  if (t <= start) return r.reactant;
  if (t >= end) return r.product;
  if (t <= 0.5)
    return (
      r.reactant + (r.peak - r.reactant) * smooth((t - start) / (0.5 - start))
    );
  return r.peak + (r.product - r.peak) * smooth((t - 0.5) / (end - 0.5));
}
export type ProfileDrawing = {
  reactant: string;
  product: string;
  peak: string;
  activationArrow: string;
  overallArrow: string;
};
export const emptyProfileDrawing = (): ProfileDrawing => ({
  reactant: "",
  product: "",
  peak: "",
  activationArrow: "unset",
  overallArrow: "unset",
});
export function readProfileDrawing(raw: string): ProfileDrawing | null {
  try {
    const b: unknown = JSON.parse(raw);
    if (!b || typeof b !== "object" || Array.isArray(b)) return null;
    const r = b as Record<string, unknown>,
      keys = Object.keys(emptyProfileDrawing());
    if (
      Object.keys(r).length !== keys.length ||
      !keys.every((k) => typeof r[k] === "string")
    )
      return null;
    return r as ProfileDrawing;
  } catch {
    return null;
  }
}
export function drawingLevels(d: ProfileDrawing): Levels | null {
  const values = [d.reactant, d.product, d.peak].map((v) =>
    /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(v.trim())
      ? Number(v.trim())
      : NaN,
  );
  if (
    !values.every(
      (v) => Number.isInteger(v) && v >= 0 && v <= 240 && v % 5 === 0,
    )
  )
    return null;
  return { reactant: values[0], product: values[1], peak: values[2] };
}
export function markProfileDrawing(raw: string, expected: string): boolean {
  const entered = readProfileDrawing(raw),
    target = readProfileDrawing(expected);
  if (!entered || !target) return false;
  const p = drawingLevels(entered),
    t = drawingLevels(target);
  return (
    !!p &&
    !!t &&
    validSimpleProfile(p) &&
    validSimpleProfile(t) &&
    p.reactant === t.reactant &&
    p.product === t.product &&
    p.peak === t.peak &&
    entered.activationArrow === "reactants-peak" &&
    entered.overallArrow === "reactants-products" &&
    entered.activationArrow === target.activationArrow &&
    entered.overallArrow === target.overallArrow
  );
}
