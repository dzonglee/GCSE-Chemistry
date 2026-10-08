export type EnergyMode =
  "transfer" | "temperature" | "trace" | "use" | "evidence";
export const energyRecords = {
  transfer: {
    initial: {
      label:
        "Supplied neutralisation transfers energy to the surrounding solution, whose temperature rises.",
      classification: "exothermic",
      direction: 1,
      kind: "reaction",
    },
    cooling: {
      label:
        "Supplied citric acid/sodium hydrogencarbonate reaction takes energy from the surrounding solution, whose temperature falls.",
      classification: "endothermic",
      direction: -1,
      kind: "reaction",
    },
    oxidation: {
      label:
        "Specified iron oxidation hand warmer gives energy to the hand and surrounding air.",
      classification: "exothermic",
      direction: 1,
      kind: "reaction",
    },
    dissolving: {
      label:
        "Specified salt dissolution absorbs energy from surrounding water. It is described as a process, without asserting new chemical substances.",
      classification: "endothermic",
      direction: -1,
      kind: "process",
    },
    decomposition: {
      label:
        "Specified thermal decomposition continuously takes in energy from its surroundings.",
      classification: "endothermic",
      direction: -1,
      kind: "reaction",
    },
  },
  temperature: {
    initial: {
      label:
        "Surrounding solution: initial 20.0 °C; reaction-stage maximum 32.0 °C; no external heater.",
      initial: 20,
      extreme: 32,
      classification: "exothermic",
      quantity: "signed-change",
    },
    cooling: {
      label:
        "Surrounding solution: initial 22.0 °C; reaction-stage minimum 15.5 °C; no external cooler.",
      initial: 22,
      extreme: 15.5,
      classification: "endothermic",
      quantity: "signed-change",
    },
    decrease: {
      label:
        "Initial 24.0 °C; reaction-stage minimum 18.5 °C. Predict the positive SIZE of the temperature decrease.",
      initial: 24,
      extreme: 18.5,
      classification: "endothermic",
      quantity: "decrease-size",
    },
    decimal: {
      label:
        "Initial 23.6 °C; reaction-stage maximum 31.9 °C; no external heater. Predict signed change.",
      initial: 23.6,
      extreme: 31.9,
      classification: "exothermic",
      quantity: "signed-change",
    },
    nonfreezing: {
      label:
        "Supplied surrounding liquid remains liquid throughout: initial −6.0 °C; reaction-stage maximum −2.0 °C. No external heater.",
      initial: -6,
      extreme: -2,
      classification: "exothermic",
      quantity: "signed-change",
    },
    same: {
      label:
        "Readings 21.0 °C and 21.0 °C; no detectable temperature change. No independent energy-transfer evidence is supplied.",
      initial: 21,
      extreme: 21,
      classification: "not-established",
      quantity: "signed-change",
    },
  },
  trace: {
    initial: {
      label:
        "Reactants mixed after minute 1. Reaction-stage maximum is recorded; subsequent cooling is heat exchange with the room.",
      times: [0, 1, 2, 3, 4, 5],
      temperatures: [20, 20, 27, 32, 29, 26],
      baseline: 1,
      extreme: 3,
      classification: "exothermic",
      quantity: "signed-change",
      late: "cooling-after-reaction",
    },
    cooling: {
      label:
        "Reactants mixed after minute 2. Reaction-stage minimum is recorded; later warming is heat exchange with the room.",
      times: [0, 1, 2, 3, 4, 5, 6],
      temperatures: [23, 23, 23, 19, 16, 18, 20],
      baseline: 2,
      extreme: 4,
      classification: "endothermic",
      quantity: "signed-change",
      late: "warming-after-reaction",
    },
    delayed: {
      label:
        "Reaction begins after minute 2. Use the pre-mixing baseline and reaction-stage maximum, not the final room-cooling point.",
      times: [0, 1, 2, 3, 4, 5, 6],
      temperatures: [18, 18, 18, 25, 30, 27, 22],
      baseline: 2,
      extreme: 4,
      classification: "exothermic",
      quantity: "signed-change",
      late: "cooling-after-reaction",
    },
    minimumSize: {
      label:
        "Reaction begins after minute 1. Predict the positive size of the fall to the reaction-stage minimum.",
      times: [0, 1, 2, 3, 4, 5],
      temperatures: [24, 24, 21, 18, 20, 22],
      baseline: 1,
      extreme: 3,
      classification: "endothermic",
      quantity: "decrease-size",
      late: "warming-after-reaction",
    },
    stable: {
      label:
        "Reactants mixed after minute 1. No external heating/cooling; all readings are equal, and no other transfer evidence is supplied.",
      times: [0, 1, 2, 3, 4],
      temperatures: [20, 20, 20, 20, 20],
      baseline: 1,
      extreme: null,
      classification: "not-established",
      quantity: "signed-change",
      late: "not-established",
    },
  },
  use: {
    initial: {
      label:
        "Original product comparison: warming required, final contact temperature ≤45 °C, duration ≥30 min. A: 42 °C/40 min; B: 52 °C/50 min. Both are supplied exothermic processes.",
      goal: "warming",
      max: 45,
      minDuration: 30,
      options: [
        { id: "A", temperature: 42, duration: 40 },
        { id: "B", temperature: 52, duration: 50 },
      ],
      acceptable: ["A"],
    },
    cooler: {
      label:
        "Cooling required, final temperature ≤12 °C and ≥5 °C, duration ≥20 min. A: 10 °C/25 min; B: 2 °C/35 min.",
      goal: "cooling",
      min: 5,
      max: 12,
      minDuration: 20,
      options: [
        { id: "A", temperature: 10, duration: 25 },
        { id: "B", temperature: 2, duration: 35 },
      ],
      acceptable: ["A"],
    },
    neither: {
      label:
        "Warming required, contact temperature ≤44 °C, duration ≥45 min. A: 46 °C/50 min; B: 42 °C/30 min.",
      goal: "warming",
      max: 44,
      minDuration: 45,
      options: [
        { id: "A", temperature: 46, duration: 50 },
        { id: "B", temperature: 42, duration: 30 },
      ],
      acceptable: [],
    },
    both: {
      label:
        "Warming required, contact temperature ≤43 °C, duration ≥20 min. A: 40 °C/25 min; B: 42 °C/30 min. No further ranking criterion is given.",
      goal: "warming",
      max: 43,
      minDuration: 20,
      options: [
        { id: "A", temperature: 40, duration: 25 },
        { id: "B", temperature: 42, duration: 30 },
      ],
      acceptable: ["A", "B"],
    },
    activation: {
      label:
        "An air-activated iron warmer and an electrically heated pad both meet temperature/duration limits. Supplied task requires operation with no electrical supply: A is iron oxidation; B needs mains power.",
      goal: "warming",
      max: 45,
      minDuration: 30,
      options: [
        { id: "A", temperature: 42, duration: 40 },
        { id: "B", temperature: 42, duration: 40 },
      ],
      acceptable: ["A"],
    },
  },
  evidence: {
    initial: {
      label:
        "Surrounding solution warms during reaction; matched starting temperatures and no external heater. Student says it must be endothermic because heat is involved.",
      claim: "exothermic-supported",
      reason: "energy-to-surroundings",
      explanation:
        "The surroundings gain energy and warm. The reaction transfers energy out; heat involvement alone does not make it endothermic.",
    },
    spark: {
      label:
        "A spark starts combustion; afterwards the supplied reaction gives out energy to its surroundings.",
      claim: "exothermic-supported",
      reason: "initial-input-not-overall",
      explanation:
        "Energy needed to start a reaction does not establish its overall energy direction. Supplied combustion gives out energy.",
    },
    heater: {
      label:
        "A reaction mixture warms while an external heater runs. No comparison or independent reaction-energy evidence is provided.",
      claim: "not-established",
      reason: "external-input-confounds",
      explanation:
        "Warming may be supplied by the heater. This observation alone cannot classify the reaction's energy transfer.",
    },
    hotStart: {
      label:
        "One reactant begins much hotter than the other. Mixing warms the colder liquid. No controlled reaction-energy evidence is supplied.",
      claim: "not-established",
      reason: "unequal-starting-temperature",
      explanation:
        "Heat can transfer from the hotter reactant to the colder liquid. Equal initial conditions or other reaction evidence are needed.",
    },
    salt: {
      label:
        "A specified salt dissolves, taking energy from water. No evidence of forming new chemical substances is supplied.",
      claim: "endothermic-process",
      reason: "process-not-new-substance-proof",
      explanation:
        "The energy-absorbing change is endothermic. Dissolution does not by itself establish a new-substance chemical reaction.",
    },
    electric: {
      label:
        "A specified resistive electric pad heats using supplied electricity. No chemical reaction in the pad is given.",
      claim: "electrical-heating",
      reason: "no-reaction-evidence",
      explanation:
        "This is the supplied electrical energy conversion, not evidence that chemicals in the pad react exothermically.",
    },
    conservation: {
      label:
        "The reaction transfers energy to its surroundings. A student says that this creates extra energy overall.",
      claim: "conserved",
      reason: "transfer-not-creation",
      explanation:
        "Energy transferred out of the reacting system is gained by the surroundings. Transfer does not create or destroy total energy.",
    },
    capacity: {
      label:
        "Process A gives a 4 °C rise and B an 8 °C rise, but solution masses, heat capacities and reacted amounts differ. Is greater total reaction-energy transfer established for B?",
      claim: "not-established",
      reason: "uncontrolled-thermal-context",
      explanation:
        "Temperature change alone is not a universal measure of total energy transfer. Different solution masses, heat capacities and reacted amounts prevent this comparison without further controlled evidence.",
    },
    late: {
      label:
        "The reacting mixture rises from 20 °C to 32 °C, then cools toward room temperature after the reaction. Student calls the reaction endothermic from the last cooling segment.",
      claim: "exothermic-supported",
      reason: "use-reaction-stage",
      explanation:
        "The reaction-stage rise supports energy transfer out. Later heat loss to the room does not reverse the classification of that reaction.",
    },
  },
} as const;
const signedTenths = (initial: number, final: number) =>
  Math.round(final * 10) - Math.round(initial * 10);
export function temperatureTarget(
  record: keyof typeof energyRecords.temperature,
) {
  const r = energyRecords.temperature[record],
    signed = signedTenths(r.initial, r.extreme);
  return {
    signedTenths: signed,
    answerTenths: r.quantity === "decrease-size" ? Math.abs(signed) : signed,
    classification: r.classification,
  };
}
export function traceTarget(record: keyof typeof energyRecords.trace) {
  const r = energyRecords.trace[record],
    signed =
      r.extreme === null
        ? 0
        : signedTenths(r.temperatures[r.baseline], r.temperatures[r.extreme]);
  return {
    baseline: r.baseline,
    extreme: r.extreme,
    answerTenths: r.quantity === "decrease-size" ? Math.abs(signed) : signed,
    classification: r.classification,
    late: r.late,
  };
}
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => String(i + from));
const unique = (a: readonly string[]) => [...new Set(a)];
export const energyChoices: Record<EnergyMode, Record<string, string[]>> = {
  transfer: {
    record: Object.keys(energyRecords.transfer),
    transfer: range(-4, 4),
    classification: ["unset", "exothermic", "endothermic", "not-established"],
  },
  temperature: {
    record: Object.keys(energyRecords.temperature),
    guess: range(-500, 500),
    classification: ["unset", "exothermic", "endothermic", "not-established"],
  },
  trace: {
    record: Object.keys(energyRecords.trace),
    baseline: ["unset", ...range(0, 6)],
    extreme: ["unset", "none", ...range(0, 6)],
    guess: range(-500, 500),
    classification: ["unset", "exothermic", "endothermic", "not-established"],
    late: [
      "unset",
      "cooling-after-reaction",
      "warming-after-reaction",
      "not-established",
      "reaction-reversed",
    ],
  },
  use: {
    record: Object.keys(energyRecords.use),
    selected: ["unset", "A", "B", "both", "neither"],
    reason: [
      "unset",
      "all-constraints",
      "largest-temperature",
      "longest-duration",
      "not-enough-evidence",
    ],
  },
  evidence: {
    record: Object.keys(energyRecords.evidence),
    claim: unique([
      "unset",
      ...Object.values(energyRecords.evidence).map((r) => r.claim),
      "always-endothermic",
      "energy-created",
    ]),
    reason: unique([
      "unset",
      ...Object.values(energyRecords.evidence).map((r) => r.reason),
      "heat-means-endothermic",
      "hot-means-reaction",
      "last-point-only",
    ]),
  },
};
export function initialEnergyBoard(mode: EnergyMode, record = "initial") {
  if (!energyChoices[mode].record.includes(record))
    throw Error("Unknown supplied record.");
  return Object.fromEntries(
    Object.keys(energyChoices[mode]).map((k) => [
      k,
      k === "record"
        ? record
        : k === "guess" || k === "transfer"
          ? "0"
          : "unset",
    ]),
  );
}
export function validEnergyBoard(
  mode: EnergyMode,
  b: unknown,
): b is Record<string, string> {
  if (!b || typeof b !== "object" || Array.isArray(b)) return false;
  const v = b as Record<string, unknown>;
  if (
    Object.keys(v).length !== Object.keys(energyChoices[mode]).length ||
    !Object.entries(energyChoices[mode]).every(
      ([k, a]) => typeof v[k] === "string" && a.includes(v[k] as string),
    )
  )
    return false;
  if (mode === "trace") {
    const r = energyRecords.trace[v.record as keyof typeof energyRecords.trace];
    for (const key of ["baseline", "extreme"])
      if (
        v[key] !== "unset" &&
        v[key] !== "none" &&
        Number(v[key]) >= r.times.length
      )
        return false;
  }
  return true;
}
export function energyPrediction(
  mode: EnergyMode,
  b: Record<string, string | number>,
) {
  const key = String(b.record);
  if (mode === "transfer") {
    const r =
        energyRecords.transfer[key as keyof typeof energyRecords.transfer],
      moved = Number(b.transfer);
    return {
      correct:
        Math.sign(moved) === r.direction &&
        b.classification === r.classification,
      explanation:
        "Energy is conserved across the stated system boundary. Exothermic transfers energy to the surroundings; endothermic takes it from them. Markers are symbolic energy, not atoms or measured joules.",
    };
  }
  if (mode === "temperature") {
    const r = temperatureTarget(key as keyof typeof energyRecords.temperature);
    return {
      correct:
        Number(b.guess) === r.answerTenths &&
        b.classification === r.classification,
      explanation:
        "Signed temperature change is reaction-stage reading minus initial reading. A positive decrease SIZE is its magnitude, not the signed difference. No measurable change alone leaves energy classification unestablished.",
    };
  }
  if (mode === "trace") {
    const r = traceTarget(key as keyof typeof energyRecords.trace);
    return {
      correct:
        String(b.baseline) === String(r.baseline) &&
        String(b.extreme) ===
          (r.extreme === null ? "none" : String(r.extreme)) &&
        Number(b.guess) === r.answerTenths &&
        b.classification === r.classification &&
        b.late === r.late,
      explanation:
        "Use the stated pre-mixing baseline and reaction-stage maximum/minimum. Later exchange with room air does not make the completed reaction change classification. If no change is detectable, do not invent a reaction peak or energy direction.",
    };
  }
  if (mode === "use") {
    const r = energyRecords.use[key as keyof typeof energyRecords.use],
      selected =
        r.acceptable.length === 0
          ? "neither"
          : r.acceptable.length === 2
            ? "both"
            : r.acceptable[0];
    return {
      correct: b.selected === selected && b.reason === "all-constraints",
      explanation:
        "Apply every supplied temperature, duration and activation constraint. The largest temperature or longest duration alone does not establish a suitable choice; both or neither may meet the stated comparison. This original data exercise does not certify real product safety.",
    };
  }
  const r = energyRecords.evidence[key as keyof typeof energyRecords.evidence];
  return {
    correct: b.claim === r.claim && b.reason === r.reason,
    explanation: r.explanation,
  };
}
export function symbolicEnergyLedger(transfer: number) {
  if (!Number.isInteger(transfer) || Math.abs(transfer) > 4)
    throw Error("Use a whole symbolic energy step from −4 to 4.");
  return { system: 6 - transfer, surroundings: 6 + transfer, total: 12 };
}
