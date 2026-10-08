import {
  practicalRecords,
  practicalPlans,
  practicalApparatus,
  practicalDilutions,
  practicalEndpoints,
  practicalPlots,
  practicalRepeats,
  dilutionWater,
  premixConcentration,
  repeatMean,
  repeatRange,
  intervalRate,
  sampledEndpoint,
  type PracticalMode,
} from "./rates-practical";
export type PracticalBoard = Record<string, string>;
export const practicalFields: Record<PracticalMode, string[]> = {
  plan: [
    "record",
    "independent",
    "dependent",
    "confound",
    "repair",
    "hypothesis",
  ],
  apparatus: [
    "record",
    "fault",
    "correction",
    "signal",
    "reading",
    "consequence",
  ],
  dilution: ["record", "stock", "water", "premix", "combinedVolume", "label"],
  endpoint: [
    "record",
    "sample",
    "lower",
    "upper",
    "proxy",
    "ratio",
    "interpretation",
  ],
  plot: [
    "record",
    "selected",
    "x0",
    "y0",
    "x1",
    "y1",
    "x2",
    "y2",
    "x3",
    "y3",
    "x4",
    "y4",
    "x5",
    "y5",
    "placed0",
    "placed1",
    "placed2",
    "placed3",
    "placed4",
    "placed5",
    "fit",
    "fitView",
    "rate",
  ],
  repeats: ["record", "selection", "mean", "range", "decision", "improvement"],
};
export const practicalChoices: Partial<
  Record<PracticalMode, Record<string, string[]>>
> = {
  plan: {
    independent: [
      "",
      "concentration",
      "temperature",
      "particleSize",
      "gasVolume",
      "endpointTime",
    ],
    dependent: ["", "gasVolumeTime", "massTime", "endpointTime", "temperature"],
    confound: [
      "",
      "temperature",
      "particleSize",
      "solidMass",
      "concentration",
      "lighting",
      "none",
    ],
    repair: [
      "",
      "sameTemperature",
      "sameParticleSize",
      "sameSolidMass",
      "sameConcentration",
      "sameLighting",
      "retainControls",
    ],
    hypothesis: [
      "",
      "higherConcentrationFaster",
      "smallerParticlesFaster",
      "higherTemperatureFaster",
      "higherConcentrationShorter",
      "higherConcentrationSlower",
    ],
  },
  apparatus: {
    fault: ["", "leak", "stuckPiston", "delay", "sealedMass", "none"],
    correction: [
      "",
      "sealConnection",
      "freePiston",
      "startWithMixing",
      "allowGasEscape",
      "retainSetup",
    ],
    signal: ["", "volumeTime", "massTime", "endpointTime"],
    consequence: [
      "",
      "gasUnderestimated",
      "unreliableVolume",
      "earlyEvidenceLost",
      "gasDisplacesWater",
      "gasEscapesMassFalls",
      "sealedMassUnchanged",
      "gasCreatesMass",
    ],
  },
  dilution: { label: ["", "beforeAcid", "afterAcid", "sameBoth"] },
  endpoint: {
    interpretation: [
      "",
      "sampleInterval",
      "recordedEndpoint",
      "exactSampleEndpoint",
      "productVolumeRate",
    ],
  },
  plot: {
    fitView: ["", "yes"],
    placed0: ["", "yes"],
    placed1: ["", "yes"],
    placed2: ["", "yes"],
    placed3: ["", "yes"],
    placed4: ["", "yes"],
    placed5: ["", "yes"],
    fit: [
      "",
      "smoothPlateau",
      "smoothFalling",
      "investigateSmooth",
      "joinEveryPoint",
      "straightRising",
    ],
    selected: ["0", "1", "2", "3", "4", "5"],
  },
  repeats: {
    selection: ["", "all", "omit0", "omit1", "omit2"],
    decision: [
      "",
      "excludeDocumented",
      "excludeIdentified",
      "investigateRetain",
      "retainAll",
      "systematicFault",
      "discardInconvenient",
    ],
    improvement: [
      "",
      "synchroniseStart",
      "investigateRepeat",
      "repeatCompare",
      "repairLeak",
      "preventSpray",
      "reproducibility",
    ],
  },
};
const ordinary = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
export function initialPracticalBoard(
  mode: PracticalMode,
  record = "initial",
): PracticalBoard {
  return Object.fromEntries(
    practicalFields[mode].map((k) => [
      k,
      k === "record"
        ? record
        : k === "selected"
          ? "0"
          : practicalChoices[mode]?.[k]
            ? ""
            : "0",
    ]),
  );
}
export function validPracticalBoard(
  mode: PracticalMode,
  v: unknown,
): v is PracticalBoard {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const b = v as PracticalBoard;
  return (
    Object.keys(b).length === practicalFields[mode].length &&
    typeof b.record === "string" &&
    Object.hasOwn(practicalRecords[mode], b.record) &&
    practicalFields[mode].every(
      (k) =>
        typeof b[k] === "string" &&
        (k === "record" ||
          (practicalChoices[mode]?.[k]
            ? practicalChoices[mode]![k].includes(b[k])
            : ordinary.test(b[k]) && Number(b[k]) <= 100000)),
    )
  );
}
export function expectedPracticalBoard(
  mode: PracticalMode,
  id = "initial",
): PracticalBoard {
  const b = initialPracticalBoard(mode, id);
  if (mode === "plan") {
    const r = practicalPlans[id];
    Object.assign(b, {
      independent: r.independent,
      dependent: r.dependent,
      confound: r.confound,
      repair: r.repair,
      hypothesis: r.hypothesis,
    });
  }
  if (mode === "apparatus") {
    const r = practicalApparatus[id];
    Object.assign(b, {
      fault: r.fault,
      correction: r.correction,
      signal: r.signal,
      reading: String(r.gasReading),
      consequence: r.consequence,
    });
  }
  if (mode === "dilution") {
    const r = practicalDilutions[id];
    Object.assign(b, {
      stock: String(r.stockVolume),
      water: String(dilutionWater(r)),
      premix: String(premixConcentration(r)),
      combinedVolume: String(r.total + r.acid),
      label: "beforeAcid",
    });
  }
  if (mode === "endpoint") {
    const r = practicalEndpoints[id];
    Object.assign(b, {
      sample: String(sampledEndpoint(r)),
      lower: String(r.start),
      upper: String(r.stop),
      proxy: String(1 / r.stop),
      ratio: String(r.comparisonTime / r.stop),
      interpretation:
        r.issue === "recorded" ? "recordedEndpoint" : "sampleInterval",
    });
  }
  if (mode === "plot") {
    const r = practicalPlots[id];
    r.times.forEach((t, i) => {
      b["x" + i] = String(t);
      b["y" + i] = String(r.readings[i]);
      b["placed" + i] = "yes";
    });
    Object.assign(b, {
      fit: r.fit,
      fitView: "yes",
      rate: String(intervalRate(r)),
    });
  }
  if (mode === "repeats") {
    const r = practicalRepeats[id];
    Object.assign(b, {
      selection: r.exclude < 0 ? "all" : "omit" + r.exclude,
      mean: String(repeatMean(r)),
      range: String(repeatRange(r)),
      decision: r.decision,
      improvement: r.improvement,
    });
  }
  return b;
}
export function checkPracticalBoard(mode: PracticalMode, b: unknown) {
  if (!validPracticalBoard(mode, b)) return false;
  const e = expectedPracticalBoard(mode, b.record);
  return practicalFields[mode].every(
    (k) =>
      k === "selected" ||
      (practicalChoices[mode]?.[k] || k === "record"
        ? b[k] === e[k]
        : Math.abs(Number(b[k]) - Number(e[k])) <= 1e-6),
  );
}
export function practicalHistoryStep(
  mode: PracticalMode,
  a: unknown,
  b: unknown,
) {
  if (!validPracticalBoard(mode, a) || !validPracticalBoard(mode, b))
    return false;
  const changed = practicalFields[mode].filter((k) => a[k] !== b[k]);
  if (!changed.length) return false;
  if (a.record !== b.record) {
    const init = initialPracticalBoard(mode, b.record);
    return practicalFields[mode].every((k) => b[k] === init[k]);
  }
  if (changed.length === 1) return true;
  if (mode === "plot" && a.selected === b.selected) {
    const n = a.selected;
    return (
      b["placed" + n] === "yes" &&
      changed.every((k) => ["x" + n, "y" + n, "placed" + n].includes(k))
    );
  }
  return false;
}
