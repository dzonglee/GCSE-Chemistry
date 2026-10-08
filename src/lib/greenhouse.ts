export type GreenhouseMode =
  "wave" | "mechanism" | "budget" | "change" | "source" | "critique";
export type GreenhouseBoard = Record<string, string>;
export type GreenhouseGiven = {
  title: string;
  note: string;
  rows?: readonly { label: string; text: string }[];
  budget?: { incoming: number; reflected: number; escaping: number };
  diagram?: "radiation" | "wave";
};
export type GreenhouseRecord = GreenhouseGiven & {
  mode: GreenhouseMode;
  expected: GreenhouseBoard;
  feedback: string;
};
export const greenhouseFields: Record<GreenhouseMode, readonly string[]> = {
  wave: ["incoming", "outgoing"],
  mechanism: ["entry", "surface", "gas", "release"],
  budget: ["absorbed", "net"],
  change: ["loss", "trend", "equilibrium"],
  source: ["emission", "process"],
  critique: ["verdict", "repair"],
};
export const greenhouseNumeric = ["absorbed", "net"];
export const greenhouseChoices: Record<string, readonly string[]> = {
  incoming: ["short", "long", "sound"],
  outgoing: ["short", "long", "sound"],
  entry: ["transmit", "blockAll", "convert"],
  surface: ["absorbEmit", "reflectOnly", "emitVisible"],
  gas: ["absorbIR", "reflectIR", "absorbAllSun"],
  release: ["allDirections", "downOnly", "never"],
  loss: ["reduced", "unchanged", "increased"],
  trend: ["warms", "stable", "cools"],
  equilibrium: ["rebalance", "forever", "stopEmitting"],
  emission: ["co2", "ch4", "n2", "o2"],
  process: ["burn", "forest", "digest", "decay", "photo", "oxygenMade"],
  verdict: ["wrong", "right"],
  repair: ["absorbEmitIR", "notOzone", "moreOzone", "mirror", "permanent"],
};
export const greenhouseLabels: Record<string, string> = {
  incoming: "Incoming solar radiation",
  outgoing: "Outgoing surface radiation",
  short: "Shorter wavelength (mainly visible)",
  long: "Longer wavelength (infrared)",
  sound: "Sound waves",
  entry: "Solar path through atmosphere",
  transmit: "Much short-wave radiation passes through",
  blockAll: "All sunlight is blocked",
  convert: "All sunlight becomes methane",
  surface: "What the surface does",
  absorbEmit: "Absorbs solar energy and emits infrared",
  reflectOnly: "Only reflects; never absorbs",
  emitVisible: "Emits only visible light",
  gas: "Greenhouse gas interaction",
  absorbIR: "Absorbs some outgoing infrared",
  reflectIR: "Reflects infrared like a mirror",
  absorbAllSun: "Absorbs all incoming sunlight",
  release: "Emission from warmed gases",
  allDirections: "Infrared emitted in all directions",
  downOnly: "All radiation emitted downwards only",
  never: "Energy never leaves again",
  absorbed: "Absorbed solar energy / units",
  net: "Net energy gain / units",
  loss: "Initial energy escape at the same temperature",
  reduced: "Less outgoing energy escapes",
  unchanged: "Outgoing energy is unchanged",
  increased: "More outgoing energy escapes",
  trend: "Initial temperature tendency",
  warms: "Warming",
  stable: "No net warming or cooling",
  cools: "Cooling",
  equilibrium: "Longer-term energy balance",
  rebalance: "Outgoing rises as Earth warms towards balance",
  forever: "Energy is trapped forever",
  stopEmitting: "Earth stops emitting radiation",
  emission: "Gas linked to this activity",
  co2: "Carbon dioxide (CO₂)",
  ch4: "Methane (CH₄)",
  n2: "Nitrogen (N₂)",
  o2: "Oxygen (O₂)",
  process: "How the activity changes emissions or uptake",
  burn: "Fuel carbon is oxidised during combustion",
  forest: "Carbon released; fewer trees take up CO₂",
  digest: "Microbes during cattle digestion release methane",
  decay: "Organic waste decomposes with limited oxygen",
  photo: "Photosynthesis adds methane",
  oxygenMade: "Oxygen turns into carbon dioxide",
  verdict: "Judgement of the claim",
  wrong: "The claim gives the wrong mechanism",
  right: "The claim gives the correct mechanism",
  repair: "Scientific repair",
  absorbEmitIR: "Gases absorb and emit infrared; some reaches the surface",
  notOzone: "Enhanced greenhouse absorption differs from ozone loss",
  moreOzone: "An ozone hole is the cause of enhanced greenhouse warming",
  mirror: "Greenhouse gases are mirrors",
  permanent: "All radiation remains trapped forever",
};
export const greenhouseRecords: Record<string, GreenhouseRecord> = {
  wave: {
    mode: "wave",
    title: "Two radiation paths",
    note: "Compare the wavelengths.",
    diagram: "wave",
    expected: { incoming: "short", outgoing: "long" },
    feedback:
      "Much incoming solar radiation has shorter wavelengths, including visible light. The cooler surface emits longer-wavelength infrared. These are ranges, not two exact wavelengths.",
  },
  pathway: {
    mode: "mechanism",
    title: "From sunlight to infrared",
    note: "Construct the energy pathway.",
    diagram: "radiation",
    expected: {
      entry: "transmit",
      surface: "absorbEmit",
      gas: "absorbIR",
      release: "allDirections",
    },
    feedback:
      "Much short-wave sunlight passes through the atmosphere. The surface absorbs energy and emits long-wave infrared. Greenhouse gases absorb some infrared and emit it in all directions; some returns towards the surface. Absorption and emission are not mirror reflection.",
  },
  natural: {
    mode: "mechanism",
    title: "A naturally warm Earth",
    note: "Greenhouse gases occur naturally.",
    diagram: "radiation",
    expected: {
      entry: "transmit",
      surface: "absorbEmit",
      gas: "absorbIR",
      release: "allDirections",
    },
    feedback:
      "Water vapour, carbon dioxide and methane contribute to the natural greenhouse effect, maintaining temperatures suitable for current life. Infrared still escapes to space; a balanced planet can have greenhouse gases.",
  },
  balance: {
    mode: "budget",
    title: "A balanced whole-Earth ledger",
    note: "Original teaching units per equal interval.",
    budget: { incoming: 100, reflected: 30, escaping: 70 },
    expected: { absorbed: "70", net: "0" },
    feedback:
      "100−30=70 units of solar energy are absorbed. 70−70=0 net gain: no net warming or cooling. Internal back radiation does not create extra solar energy.",
  },
  gain: {
    mode: "budget",
    title: "Immediately after reduced escape",
    note: "Same sunlight and starting temperature.",
    budget: { incoming: 100, reflected: 30, escaping: 60 },
    expected: { absorbed: "70", net: "10" },
    feedback:
      "70 units are absorbed but only 60 escape in the same interval: net +10. Earth gains energy and initially warms. These units cannot determine an exact temperature rise.",
  },
  loss: {
    mode: "budget",
    title: "A cooling comparison",
    note: "Use the stated outgoing value.",
    budget: { incoming: 120, reflected: 24, escaping: 102 },
    expected: { absorbed: "96", net: "-6" },
    feedback:
      "120−24=96 absorbed; 96−102=−6 net units. More energy leaves than enters after reflection, so Earth loses stored energy and initially cools. A negative result is meaningful.",
  },
  enhanced: {
    mode: "change",
    title: "More greenhouse absorption",
    note: "Hold sunlight and starting temperature fixed.",
    rows: [
      {
        label: "Change",
        text: "An increase in greenhouse gases reduces initial outgoing infrared to space.",
      },
    ],
    expected: { loss: "reduced", trend: "warms", equilibrium: "rebalance" },
    feedback:
      "At the same initial temperature, reduced escape produces a positive energy imbalance. Earth warms, increasing outgoing radiation towards a new balance. This model supplies no exact final temperature or timescale.",
  },
  adjustment: {
    mode: "change",
    title: "Towards a new balance",
    note: "Compare immediately after the change with later.",
    rows: [
      {
        label: "Conditions",
        text: "Sunlight remains unchanged. Additional greenhouse absorption initially reduces escaping energy.",
      },
    ],
    expected: { loss: "reduced", trend: "warms", equilibrium: "rebalance" },
    feedback:
      "Warming is the initial response to reduced energy escape. A warmer Earth emits more infrared, allowing outgoing and absorbed incoming energy to balance again. Energy is not imprisoned permanently.",
  },
  fossil: {
    mode: "source",
    title: "Burning more fossil fuel",
    note: "Link this activity to its gas and process.",
    expected: { emission: "co2", process: "burn" },
    feedback:
      "Burning coal, oil or natural gas oxidises fuel carbon, producing carbon dioxide. More fossil-fuel use adds CO₂; complete methane combustion makes CO₂ and water rather than releasing all fuel unchanged.",
  },
  forest: {
    mode: "source",
    title: "Clearing and burning a forest",
    note: "Consider release and reduced uptake.",
    expected: { emission: "co2", process: "forest" },
    feedback:
      "Burning or decomposition of cleared biomass releases carbon dioxide. Fewer trees also remove less CO₂ by photosynthesis. Both affect the carbon balance; oxygen does not turn into carbon.",
  },
  cattle: {
    mode: "source",
    title: "Increasing cattle production",
    note: "Link the activity to its gas and process.",
    expected: { emission: "ch4", process: "digest" },
    feedback:
      "Microbes involved in cattle digestion produce methane. More cattle production can increase methane emissions. Methane is not made by photosynthesis or just by cattle breathing carbon dioxide.",
  },
  landfill: {
    mode: "source",
    title: "More organic waste in landfill",
    note: "Waste decomposes with limited oxygen.",
    expected: { emission: "ch4", process: "decay" },
    feedback:
      "Microbial decomposition of organic waste with limited oxygen can produce methane. More such landfill waste can increase CH₄ emissions; not every material in landfill produces methane.",
  },
  mirror: {
    mode: "critique",
    title: "A student's explanation",
    note: "Claim: greenhouse gases reflect infrared like mirrors.",
    expected: { verdict: "wrong", repair: "absorbEmitIR" },
    feedback:
      "Greenhouse gases absorb and emit infrared radiation; some emitted radiation travels towards the surface. Reflection changes direction without this absorption-and-emission mechanism.",
  },
  ozone: {
    mode: "critique",
    title: "A second student's explanation",
    note: "Claim: an ozone hole is the cause of the enhanced greenhouse effect.",
    expected: { verdict: "wrong", repair: "notOzone" },
    feedback:
      "Ozone depletion concerns reduced absorption of ultraviolet. Enhanced greenhouse warming concerns gases absorbing and emitting outgoing infrared. They are different processes; this does not mean ozone has no climate effects.",
  },
};
export const greenhouseRecord = (mode: GreenhouseMode, record: string) =>
  greenhouseRecords[record]?.mode === mode ? greenhouseRecords[record] : null;
export function initialGreenhouse(
  mode: GreenhouseMode,
  record: string,
): GreenhouseBoard {
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(greenhouseFields[mode].map((f) => [f, ""])),
  };
}
export function greenhouseNumber(raw: string): number | null {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
export function validGreenhouse(
  mode: GreenhouseMode,
  value: unknown,
  record?: string,
): value is GreenhouseBoard {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  )
    return false;
  const b = value as GreenhouseBoard,
    fields = greenhouseFields[mode];
  return (
    !!fields &&
    b.version === "1" &&
    b.mode === mode &&
    !!greenhouseRecord(mode, b.record) &&
    (record === undefined || record === b.record) &&
    Object.keys(b).length === fields.length + 3 &&
    fields.every(
      (f) =>
        typeof b[f] === "string" &&
        (!b[f] ||
          (greenhouseNumeric.includes(f)
            ? b[f].length <= 16
            : greenhouseChoices[f]?.includes(b[f]))),
    )
  );
}
export function validGreenhouseHistory(
  mode: GreenhouseMode,
  record: string,
  h: unknown,
): h is GreenhouseBoard[] {
  if (
    !Array.isArray(h) ||
    h.length < 1 ||
    h.length > 500 ||
    !h.every((b) => validGreenhouse(mode, b, record))
  )
    return false;
  const initial = initialGreenhouse(mode, record);
  return (
    Object.keys(initial).every((k) => h[0][k] === initial[k]) &&
    h.every(
      (b, i) =>
        i === 0 ||
        greenhouseFields[mode].filter((f) => b[f] !== h[i - 1][f]).length === 1,
    )
  );
}
export function checkGreenhouse(mode: GreenhouseMode, b: GreenhouseBoard) {
  if (!validGreenhouse(mode, b))
    return {
      correct: false,
      message:
        "This proposal is unreadable. Its original entries are retained.",
    };
  if (greenhouseFields[mode].some((f) => !b[f]))
    return {
      correct: false,
      message: "Complete each part. Blank entries remain unknown.",
    };
  const r = greenhouseRecord(mode, b.record)!,
    wrong = greenhouseFields[mode].filter((f) =>
      greenhouseNumeric.includes(f)
        ? greenhouseNumber(b[f]) === null ||
          Math.abs(greenhouseNumber(b[f])! - Number(r.expected[f])) > 0.000001
        : b[f] !== r.expected[f],
    );
  return {
    correct: wrong.length === 0,
    message:
      (wrong.length
        ? "Reconsider " +
          wrong.map((f) => greenhouseLabels[f].toLowerCase()).join(" and ") +
          ". "
        : "") +
      r.feedback +
      (wrong.length ? " Your proposal remains as entered." : ""),
  };
}
