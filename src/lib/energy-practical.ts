/** Individually researched lesson61 draft. No application integration yet. */
export type PracticalMode =
  "plan" | "observe" | "repeat" | "graph" | "fit" | "evaluate";
export const practicalRecords = {
  plan: {
    initial: {
      label:
        "Investigate how sodium carbonate mass affects the highest temperature reached. Use fresh acid for each mass.",
      independent: "carbonate-mass",
      dependent: "highest-temperature",
      instrument: "balance",
      controls: "acid-volume-concentration-start",
      sequence: "initial-add-stir-peak-repeat",
    },
    volume: {
      label:
        "Investigate how the volume of sodium hydroxide added affects the maximum temperature of a fixed initial acid sample. Each run starts with fresh acid. Use the same supplied alkali stock at the same starting temperature in every run.",
      independent: "alkali-volume",
      dependent: "highest-temperature",
      instrument: "measuring-cylinder",
      controls: "acid-volume-concentration-start",
      sequence: "initial-add-stir-peak-repeat",
    },
    displacement: {
      label:
        "Compare temperature changes produced by different metals added to the same specified copper sulfate solution under a supplied protocol.",
      independent: "metal-identity",
      dependent: "temperature-change",
      instrument: "thermometer",
      controls: "solution-volume-concentration-start-and-metal-amount",
      sequence: "initial-add-stir-peak-repeat",
    },
    insulation: {
      label:
        "Compare identical reactions in otherwise matched cups with different supplied insulating covers.",
      independent: "insulation",
      dependent: "temperature-change",
      instrument: "thermometer",
      controls: "reactant-amounts-concentrations-start",
      sequence: "initial-add-stir-peak-repeat",
    },
  },
  observe: {
    initial: {
      label:
        "Mix immediately after 60 s; no external heater. Select the last pre-mixing reading and the highest reaction-stage reading.",
      times: [0, 30, 60, 90, 120, 150, 180],
      temperatures: [21, 21, 21, 26, 29.5, 28, 26.5],
      baseline: 2,
      extreme: 4,
    },
    cooling: {
      label:
        "Mix immediately after 60 s. Select the last pre-mixing reading and the lowest reaction-stage reading.",
      times: [0, 30, 60, 90, 120, 150, 180],
      temperatures: [23, 23, 23, 19, 16.5, 17.5, 19],
      baseline: 2,
      extreme: 4,
    },
    decimal: {
      label:
        "Mix immediately after 40 s; no external heater. Select the last pre-mixing reading and the highest reaction-stage reading.",
      times: [0, 20, 40, 60, 80, 100, 120],
      temperatures: [20.4, 20.4, 20.4, 24.8, 28.6, 27.8, 26.6],
      baseline: 2,
      extreme: 4,
    },
    late: {
      label:
        "Mix immediately after 30 s. The last reading is after cooling; select the last pre-mixing reading and reaction-stage maximum.",
      times: [0, 30, 60, 90, 120, 150, 180],
      temperatures: [19.5, 19.5, 25, 27, 24, 22, 20.5],
      baseline: 1,
      extreme: 3,
    },
    negative: {
      label:
        "A specified non-freezing solution is mixed immediately after 20 s. Select the pre-mixing reading and highest reaction-stage reading.",
      times: [0, 20, 40, 60, 80, 100, 120],
      temperatures: [-4, -4, -1, 2, 1, 0, -1],
      baseline: 1,
      extreme: 3,
    },
  },
  repeat: {
    initial: {
      label:
        "Three matching trials: temperature rises 8.2,8.6,8.4 °C. No procedural failures are recorded.",
      values: [8.2, 8.6, 8.4],
      retained: "all",
      reason: "ordinary-spread",
      mean: 8.4,
    },
    failed: {
      label:
        "Temperature rises 7.8,7.9,2.0 °C. In trial 3 the probe was lifted clear of the solution before its peak; this failure was recorded.",
      values: [7.8, 7.9, 2],
      retained: "first-two",
      reason: "documented-failure",
      mean: 7.85,
    },
    low: {
      label:
        "Three matching trials: temperature rises 3.4,3.8,3.6 °C. No procedural failures are recorded.",
      values: [3.4, 3.8, 3.6],
      retained: "all",
      reason: "ordinary-spread",
      mean: 3.6,
    },
    spread: {
      label:
        "Three matching trials: temperature rises 6.0,7.0,8.0 °C. No procedural failures are recorded. Retain the observations; investigate the larger spread rather than silently deleting one.",
      values: [6, 7, 8],
      retained: "all",
      reason: "retain-and-investigate",
      mean: 7,
    },
    baseline: {
      label:
        "Trial 1 initial 20.0 °C and peak 28.0 °C; trial 2 initial 22.0 °C and peak 30.0 °C. Supplied values below are the two temperature rises. Averaging peaks would not give a rise.",
      values: [8, 8],
      retained: "all",
      reason: "compare-changes-not-peaks",
      mean: 8,
    },
  },
  graph: {
    initial: {
      label:
        "Original best-fit graph of highest temperature against carbonate mass. Select two supplied points on the fitted line; calculate its gradient and extrapolated zero-mass temperature.",
      points: [
        [1, 23],
        [2, 25],
        [3, 27],
        [4, 29],
        [5, 31],
      ],
      slope: 2,
      intercept: 21,
      unit: "degree-per-gram",
    },
    decimal: {
      label:
        "Original best-fit graph of highest temperature against carbonate mass. The y-axis starts at 20 °C, not 0 °C.",
      points: [
        [1, 22.7],
        [2, 24.2],
        [3, 25.7],
        [4, 27.2],
        [5, 28.7],
      ],
      slope: 1.5,
      intercept: 21.2,
      unit: "degree-per-gram",
    },
    shallow: {
      label:
        "Original fitted temperature-versus-mass line. Use coordinate differences; a single temperature divided by its mass is not the gradient.",
      points: [
        [1, 21.4],
        [2, 22.2],
        [3, 23],
        [4, 23.8],
        [5, 24.6],
      ],
      slope: 0.8,
      intercept: 20.6,
      unit: "degree-per-gram",
    },
    volume: {
      label:
        "Original ascending section of a temperature-versus-added-volume best-fit graph. The horizontal unit iscm³, so the gradient unit must change.",
      points: [
        [5, 23],
        [10, 25],
        [15, 27],
        [20, 29],
        [25, 31],
      ],
      slope: 0.4,
      intercept: 21,
      unit: "degree-per-cubic-centimetre",
    },
  },
  fit: {
    initial: {
      label:
        "Original neutralisation data: fit lines through the ascending and descending trends. Estimate where the supplied fitted lines meet. Added volume is cumulative and total solution volume changes.",
      points: [
        [0, 20],
        [5, 22],
        [10, 24],
        [15, 26],
        [20, 28],
        [25, 30],
        [30, 30],
        [35, 29],
        [40, 28],
      ],
      rising: [
        [0, 20],
        [25, 30],
      ],
      falling: [
        [30, 30],
        [40, 28],
      ],
      volume: 80 / 3,
      temperature: 92 / 3,
    },
    second: {
      label:
        "Original neutralisation data: estimate the intersection of the two supplied best-fit lines. This is an estimate of the maximum, not a new measured trial.",
      points: [
        [0, 21],
        [5, 24],
        [10, 27],
        [15, 30],
        [20, 30],
        [25, 28.5],
        [30, 27],
        [35, 25.5],
        [40, 24],
      ],
      rising: [
        [0, 21],
        [15, 30],
      ],
      falling: [
        [20, 30],
        [40, 24],
      ],
      volume: 50 / 3,
      temperature: 31,
    },
  },
  evaluate: {
    initial: {
      label:
        "A matched exothermic reaction is measured in an open cup and an insulated cup with a lid. Reactant amounts and starting temperatures are identical.",
      claim: "insulation-reduces-transfer",
      reason: "smaller-unwanted-heat-exchange",
    },
    stir: {
      label:
        "A thermometer measures the temperature near its bulb. The solution has not been stirred.",
      claim: "stir-for-representative-temperature",
      reason: "reduce-spatial-temperature-differences",
    },
    repetitions: {
      label:
        "The same well-controlled method gives slightly different temperature rises on repeated trials.",
      claim: "repeat-estimate-mean-and-spread",
      reason: "random-variation-remains",
    },
    bias: {
      label:
        "The apparatus consistently loses energy to the room during an exothermic reaction. The same apparatus and timing are used for repeated trials.",
      claim: "repetition-does-not-remove-bias",
      reason: "same-systematic-effect-remains",
    },
    volume: {
      label:
        "A neutralisation investigation adds successive alkali volumes to the SAME initial acid sample.",
      claim: "total-volume-increases",
      reason: "added-volume-is-not-constant-total-volume",
    },
    energy: {
      label:
        "Two investigations have different solution amounts and unspecified heat capacities; one gives a larger temperature rise.",
      claim: "temperature-alone-insufficient-energy",
      reason: "amount-and-heat-capacity-not-controlled",
    },
    peak: {
      label:
        "The solution warmed during a reaction then cooled towards room temperature before the final reading.",
      claim: "record-reaction-stage-maximum",
      reason: "final-cooling-misses-peak",
    },
    excess: {
      label:
        "A fixed acid sample reacts with increasing carbonate masses. Eventually the acid is used up and carbonate is in excess. Consider the idealised highest-temperature trend, with other effects neglected.",
      claim: "rise-then-level",
      reason: "acid-limits-further-reaction",
    },
    tied: {
      label:
        "Two sampled added volumes have the same highest mean temperature. The fitted-line intersection lies between the sampled volumes.",
      claim: "sampled-maximum-tied",
      reason: "fit-estimate-distinct-from-observation",
    },
    resolution: {
      label:
        "Two supplied thermometers have divisions of 0.1 °C and 0.5 °C. No calibration or accuracy evidence is supplied.",
      claim: "finer-resolution-not-guaranteed-accuracy",
      reason: "smaller-division-not-calibration-proof",
      explanation:
        "Smaller divisions allow a finer reading. They do not establish calibration, remove heat loss or guarantee closeness to the true temperature.",
    },
    risk: {
      label:
        "A supplied school risk assessment identifies eye-splash risk while mixing reaction solutions; its protocol prescribes splash-protective goggles under supervision.",
      claim: "follow-prescribed-eye-protection",
      reason: "address-supplied-eye-splash-risk",
      explanation:
        "Follow the supplied school's risk assessment, prescribed splash-protective goggles and supervision. The precaution addresses the identified eye-splash risk; more repeats or a balance do not replace it. This app does not establish a safe unsupervised procedure.",
    },
    zero: {
      label:
        "A fitted line is extended to zero added mass, outside the observed mass range.",
      claim: "intercept-is-estimate",
      reason: "extrapolation-not-direct-observation",
    },
  },
} as const;
export const practicalOptions: Record<
  PracticalMode,
  Record<string, readonly string[]>
> = {
  plan: {
    record: Object.keys(practicalRecords.plan),
    independent: [
      "unset",
      "carbonate-mass",
      "alkali-volume",
      "metal-identity",
      "insulation",
      "highest-temperature",
      "acid-start",
    ],
    dependent: [
      "unset",
      "highest-temperature",
      "temperature-change",
      "carbonate-mass",
      "desired-result",
    ],
    instrument: [
      "unset",
      "balance",
      "measuring-cylinder",
      "thermometer",
      "stopwatch",
    ],
    controls: [
      "unset",
      "acid-volume-concentration-start",
      "solution-volume-concentration-start-and-metal-amount",
      "reactant-amounts-concentrations-start",
      "force-final-temperature",
      "nothing",
    ],
    sequence: [
      "unset",
      "initial-add-stir-peak-repeat",
      "add-read-final-only",
      "peak-before-addition",
    ],
  },
  observe: {
    record: Object.keys(practicalRecords.observe),
    baseline: ["unset", "0", "1", "2", "3", "4", "5", "6"],
    extreme: ["unset", "0", "1", "2", "3", "4", "5", "6"],
  },
  repeat: {
    record: Object.keys(practicalRecords.repeat),
    retained: ["unset", "all", "first-two", "last-two", "first-only"],
    reason: [
      "unset",
      "ordinary-spread",
      "documented-failure",
      "retain-and-investigate",
      "compare-changes-not-peaks",
      "delete-highest",
      "repeat-removes-all-error",
    ],
  },
  graph: {
    record: Object.keys(practicalRecords.graph),
    first: ["unset", "0", "1", "2", "3", "4"],
    second: ["unset", "0", "1", "2", "3", "4"],
    unit: [
      "unset",
      "degree-per-gram",
      "degree-per-cubic-centimetre",
      "gram-per-degree",
      "degrees-only",
    ],
  },
  fit: { record: Object.keys(practicalRecords.fit) },
  evaluate: {
    record: Object.keys(practicalRecords.evaluate),
    claim: [
      "unset",
      ...Object.values(practicalRecords.evaluate).map((r) => r.claim),
      "insulation-stops-all-transfer",
      "repeat-removes-bias",
      "largest-rise-always-largest-energy",
      "reaction-reversed",
    ],
    reason: [
      "unset",
      ...Object.values(practicalRecords.evaluate).map((r) => r.reason),
      "energy-created-by-stirring",
      "all-errors-average-away",
      "temperature-equals-joules",
    ],
  },
};
const numericFields: Record<PracticalMode, string[]> = {
  plan: [],
  observe: ["change"],
  repeat: ["mean"],
  graph: ["rise", "run", "gradient", "intercept"],
  fit: ["volume", "temperature"],
  evaluate: [],
};
export function initialPracticalBoard(
  mode: PracticalMode,
  record = "initial",
): Record<string, string> {
  if (!practicalOptions[mode].record.includes(record))
    throw Error("Unknown practical record");
  return Object.fromEntries([
    ...Object.keys(practicalOptions[mode]).map((k) => [
      k,
      k === "record" ? record : "unset",
    ]),
    ...numericFields[mode].map((k) => [k, "0"]),
  ]);
}
export function validPracticalNumber(s: unknown): s is string {
  return (
    typeof s === "string" &&
    /^-?(?:0|[1-9]\d*)(?:\.\d{1,3})?$/.test(s) &&
    s !== "-0" &&
    Math.abs(Number(s)) <= 10000
  );
}
export function validPracticalBoard(
  mode: PracticalMode,
  b: unknown,
): b is Record<string, string> {
  if (!b || typeof b !== "object" || Array.isArray(b)) return false;
  const v = b as Record<string, unknown>;
  return (
    Object.keys(v).length === Object.keys(initialPracticalBoard(mode)).length &&
    Object.entries(practicalOptions[mode]).every(
      ([k, opts]) => typeof v[k] === "string" && opts.includes(v[k] as string),
    ) &&
    numericFields[mode].every((k) => validPracticalNumber(v[k]))
  );
}
const close = (a: unknown, b: number) =>
  typeof a === "string" &&
  validPracticalNumber(a) &&
  Math.abs(Number(a) - b) < 1e-7;
export function practicalPrediction(
  mode: PracticalMode,
  b: Record<string, string | number>,
) {
  if (!validPracticalBoard(mode, b))
    return {
      correct: false,
      explanation: "Complete your prediction using the supplied data.",
    };
  const key = b.record;
  if (mode === "plan") {
    const r = practicalRecords.plan[key as keyof typeof practicalRecords.plan];
    return {
      correct: [
        "independent",
        "dependent",
        "instrument",
        "controls",
        "sequence",
      ].every((k) => b[k] === r[k as keyof typeof r]),
      explanation:
        "Vary the specified independent variable; measure the reaction-stage response with suitable apparatus. Record the initial temperature before adding reactant, stir and record the reaction-stage extremum. Control relevant amounts, concentrations and starting conditions, and repeat. These choices support a plan, not certification of practical competence.",
    };
  }
  if (mode === "observe") {
    const r =
      practicalRecords.observe[key as keyof typeof practicalRecords.observe];
    return {
      correct:
        b.baseline === String(r.baseline) &&
        b.extreme === String(r.extreme) &&
        close(b.change, r.temperatures[r.extreme] - r.temperatures[r.baseline]),
      explanation:
        "Use the last pre-mixing reading and the appropriate reaction-stage maximum or minimum. Signed change is extremum minus initial temperature. Later heat exchange with the room can make the final reading miss the reaction-stage change.",
    };
  }
  if (mode === "repeat") {
    const r =
      practicalRecords.repeat[key as keyof typeof practicalRecords.repeat];
    return {
      correct:
        b.retained === r.retained &&
        b.reason === r.reason &&
        close(b.mean, r.mean),
      explanation:
        "Sum the retained temperature changes and divide by their number. Ordinary variation does not by itself justify deleting a trial. A documented procedural failure can justify exclusion; preserve and investigate unexplained spread. Different baselines require comparing changes, not raw peak temperatures. Calculating these changes does not restore matched starting conditions or remove heat-loss bias; a fair investigation should control the starting temperatures. Repetition does not remove a systematic bias.",
    };
  }
  if (mode === "graph") {
    const r =
      practicalRecords.graph[key as keyof typeof practicalRecords.graph];
    const i = Number(b.first),
      j = Number(b.second);
    const selected = b.first !== "unset" && b.second !== "unset" && i < j;
    const rise = selected ? r.points[j][1] - r.points[i][1] : NaN,
      run = selected ? r.points[j][0] - r.points[i][0] : NaN;
    return {
      correct:
        selected &&
        close(b.rise, rise) &&
        close(b.run, run) &&
        close(b.gradient, r.slope) &&
        close(b.intercept, r.intercept) &&
        b.unit === r.unit,
      explanation:
        "Choose two distinct points on the fitted line, left to right. Gradient is matching change in temperature divided by change in mass or volume, with the corresponding unit. A truncated y-axis still uses its labelled temperatures. Extend the fitted line to x=0 to estimate the initial temperature; this is an extrapolated estimate, not a new observation.",
    };
  }
  if (mode === "fit") {
    const r = practicalRecords.fit[key as keyof typeof practicalRecords.fit];
    return {
      correct:
        Math.abs(Number(b.volume) - r.volume) <= 0.2 &&
        Math.abs(Number(b.temperature) - r.temperature) <= 0.2,
      explanation:
        "Estimate the intersection of the supplied ascending and descending best-fit lines, reading each labelled axis. A fit can estimate a maximum between measured additions. The highest sampled mean may be tied; fitting does not create a new observation. Added alkali changes the total solution volume, so temperature is not itself released energy in joules.",
    };
  }
  const r =
    practicalRecords.evaluate[key as keyof typeof practicalRecords.evaluate];
  return {
    correct: b.claim === r.claim && b.reason === r.reason,
    explanation:
      "explanation" in r
        ? r.explanation
        : "Use the stated evidence and measurement conditions. Insulation reduces unwanted energy exchange; stirring improves temperature uniformity; repetitions show random spread without removing systematic heat loss. A temperature difference is not itself energy in joules, and cumulative additions change total solution volume.",
  };
}
export function practicalHistoryStep(
  mode: PracticalMode,
  a: unknown,
  b: unknown,
) {
  if (!validPracticalBoard(mode, a) || !validPracticalBoard(mode, b))
    return false;
  if (a.record !== b.record) {
    const expected = initialPracticalBoard(mode, b.record);
    return Object.keys(expected).every((k) => b[k] === expected[k]);
  }
  const changed = Object.keys(a).filter((k) => a[k] !== b[k]);
  return changed.length === 1 && changed[0] !== "record";
}
