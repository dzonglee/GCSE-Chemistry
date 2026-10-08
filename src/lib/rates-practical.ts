/** Supplied school-practical comparisons, not a kinetic simulation. */
export type PracticalMode =
  "plan" | "apparatus" | "dilution" | "endpoint" | "plot" | "repeats";
export type PlanRecord = {
  title: string;
  question: string;
  rows: [string, string, string][];
  independent: string;
  dependent: string;
  confound: string;
  repair: string;
  hypothesis: string;
};
export const practicalPlans: Record<string, PlanRecord> = {
  initial: {
    title: "Acid concentration with magnesium",
    question:
      "Does acid concentration affect hydrogen production rate? Both acid supplies are in excess.",
    rows: [
      ["Acid concentration / mol dm⁻³", "0.5", "1.0"],
      ["Acid volume / cm³", "40", "40"],
      ["Cleaned magnesium mass / g", "0.03", "0.03"],
      ["Ribbon form", "one strip", "one strip"],
      ["Temperature / °C", "20", "30"],
    ],
    independent: "concentration",
    dependent: "gasVolumeTime",
    confound: "temperature",
    repair: "sameTemperature",
    hypothesis: "higherConcentrationFaster",
  },
  carbonate: {
    title: "Acid concentration with marble chips",
    question:
      "Does acid concentration affect carbon dioxide production rate? Acid is in excess in both runs.",
    rows: [
      ["Acid concentration / mol dm⁻³", "0.4", "0.8"],
      ["Acid volume / cm³", "50", "50"],
      ["Marble mass / g", "0.5", "0.5"],
      ["Chip size", "large chips", "powder"],
      ["Temperature / °C", "22", "22"],
    ],
    independent: "concentration",
    dependent: "gasVolumeTime",
    confound: "particleSize",
    repair: "sameParticleSize",
    hypothesis: "higherConcentrationFaster",
  },
  surface: {
    title: "Compare solid surface area",
    question:
      "Does particle size affect the rate of mass loss from marble reacting with excess acid?",
    rows: [
      ["Marble form", "large chips", "small chips"],
      ["Marble mass / g", "0.8", "1.2"],
      ["Acid concentration / mol dm⁻³", "1.0", "1.0"],
      ["Acid volume / cm³", "40", "40"],
      ["Temperature / °C", "21", "21"],
    ],
    independent: "particleSize",
    dependent: "massTime",
    confound: "solidMass",
    repair: "sameSolidMass",
    hypothesis: "smallerParticlesFaster",
  },
  heating: {
    title: "Temperature comparison",
    question:
      "Does temperature affect gas-production rate? Same reactants, acid in excess.",
    rows: [
      ["Temperature / °C", "20", "35"],
      ["Acid concentration / mol dm⁻³", "0.6", "1.2"],
      ["Acid volume / cm³", "40", "40"],
      ["Cleaned magnesium mass / g", "0.02", "0.02"],
      ["Ribbon form", "one strip", "one strip"],
    ],
    independent: "temperature",
    dependent: "gasVolumeTime",
    confound: "concentration",
    repair: "sameConcentration",
    hypothesis: "higherTemperatureFaster",
  },
  turbidity: {
    title: "Thiosulfate concentration comparison",
    question:
      "Does thiosulfate concentration affect the time to the same disappearing-cross endpoint?",
    rows: [
      ["Thiosulfate premix concentration / g dm⁻³", "8", "16"],
      ["Premix volume / cm³", "50", "50"],
      [
        "Acid volume and concentration",
        "10 cm³, same stock",
        "10 cm³, same stock",
      ],
      ["Flask shape", "same", "same"],
      ["Lighting", "bright", "dim"],
    ],
    independent: "concentration",
    dependent: "endpointTime",
    confound: "lighting",
    repair: "sameLighting",
    hypothesis: "higherConcentrationShorter",
  },
  fair: {
    title: "An already controlled comparison",
    question:
      "Does thiosulfate concentration affect time to the same endpoint?",
    rows: [
      ["Premix concentration / g dm⁻³", "12", "24"],
      ["Premix volume / cm³", "50", "50"],
      [
        "Acid volume and concentration",
        "10 cm³, same stock",
        "10 cm³, same stock",
      ],
      ["Flask / viewing conditions", "same", "same"],
      ["Temperature / °C", "23", "23"],
    ],
    independent: "concentration",
    dependent: "endpointTime",
    confound: "none",
    repair: "retainControls",
    hypothesis: "higherConcentrationShorter",
  },
};
export type ApparatusRecord = {
  title: string;
  method: "syringe" | "water" | "mass";
  reaction: string;
  gas: string;
  note: string;
  fault: string;
  correction: string;
  signal: string;
  gasReading: number;
  division: number;
  unit: string;
  consequence: string;
};
export const practicalApparatus: Record<string, ApparatusRecord> = {
  initial: {
    title: "Leaking gas connection",
    method: "syringe",
    reaction: "Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)",
    gas: "Hydrogen",
    note: "A gap is documented at the bung; some gas escapes before reaching the syringe.",
    fault: "leak",
    correction: "sealConnection",
    signal: "volumeTime",
    gasReading: 24,
    division: 2,
    unit: "cm³",
    consequence: "gasUnderestimated",
  },
  stuck: {
    title: "Syringe piston sticks",
    method: "syringe",
    reaction: "CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)",
    gas: "Carbon dioxide",
    note: "The piston is clamped so tightly it cannot move freely.",
    fault: "stuckPiston",
    correction: "freePiston",
    signal: "volumeTime",
    gasReading: 36,
    division: 2,
    unit: "cm³",
    consequence: "unreliableVolume",
  },
  delay: {
    title: "Late timing and sealing",
    method: "syringe",
    reaction: "Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)",
    gas: "Hydrogen",
    note: "Mixing begins, but the bung is fitted and the timer started 8 seconds later.",
    fault: "delay",
    correction: "startWithMixing",
    signal: "volumeTime",
    gasReading: 18,
    division: 2,
    unit: "cm³",
    consequence: "earlyEvidenceLost",
  },
  water: {
    title: "Collecting gas over water",
    method: "water",
    reaction: "Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)",
    gas: "Hydrogen",
    note: "The inverted measuring cylinder starts completely full of water; its opening stays underwater and the tube enters underneath. No fault is supplied.",
    fault: "none",
    correction: "retainSetup",
    signal: "volumeTime",
    gasReading: 32,
    division: 2,
    unit: "cm³",
    consequence: "gasDisplacesWater",
  },
  mass: {
    title: "Open gas path for a mass-loss method",
    method: "mass",
    reaction: "CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)",
    gas: "Carbon dioxide",
    note: "The flask is on a balance with cotton wool preventing spray while allowing gas to escape. Initial balance reading is 125.4 g; later reading is 125.0 g.",
    fault: "none",
    correction: "retainSetup",
    signal: "massTime",
    gasReading: 0.4,
    division: 0.1,
    unit: "g lost",
    consequence: "gasEscapesMassFalls",
  },
  sealedMass: {
    title: "Sealed flask on a balance",
    method: "mass",
    reaction: "CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)",
    gas: "Carbon dioxide",
    note: "A gas-tight bung seals the flask with no delivery path. Whole sealed apparatus is weighed: initial and later mass are both 125.4 g.",
    fault: "sealedMass",
    correction: "allowGasEscape",
    signal: "massTime",
    gasReading: 0,
    division: 0.1,
    unit: "g lost",
    consequence: "sealedMassUnchanged",
  },
};
export type DilutionRecord = {
  title: string;
  stock: number;
  stockVolume: number;
  total: number;
  acid: number;
  target: number;
  unit: string;
};
export const practicalDilutions: Record<string, DilutionRecord> = {
  initial: {
    title: "Prepare an 8 g dm⁻³ premix",
    stock: 40,
    stockVolume: 10,
    total: 50,
    acid: 10,
    target: 8,
    unit: "g dm⁻³",
  },
  sixteen: {
    title: "Prepare a 16 g dm⁻³ premix",
    stock: 40,
    stockVolume: 20,
    total: 50,
    acid: 10,
    target: 16,
    unit: "g dm⁻³",
  },
  twentyfour: {
    title: "Prepare a 24 g dm⁻³ premix",
    stock: 40,
    stockVolume: 30,
    total: 50,
    acid: 10,
    target: 24,
    unit: "g dm⁻³",
  },
  differentStock: {
    title: "Changed stock, same fixed volume",
    stock: 30,
    stockVolume: 20,
    total: 50,
    acid: 10,
    target: 12,
    unit: "g dm⁻³",
  },
  smaller: {
    title: "Smaller-volume comparison",
    stock: 20,
    stockVolume: 15,
    total: 30,
    acid: 10,
    target: 10,
    unit: "g dm⁻³",
  },
  halfStock: {
    title: "Half-strength fixed-volume premix",
    stock: 10,
    stockVolume: 20,
    total: 40,
    acid: 10,
    target: 5,
    unit: "g dm⁻³",
  },
};
export type EndpointRecord = {
  title: string;
  method: "cross" | "sensor";
  times: number[];
  visible?: boolean[];
  light?: number[];
  threshold?: number;
  start: number;
  stop: number;
  comparisonTime: number;
  issue: string;
};
export const practicalEndpoints: Record<string, EndpointRecord> = {
  initial: {
    title: "First sampled disappearance",
    method: "cross",
    times: [0, 10, 20, 30, 40, 50],
    visible: [true, true, true, true, false, false],
    start: 30,
    stop: 40,
    comparisonTime: 80,
    issue: "interval",
  },
  quick: {
    title: "A shorter endpoint interval",
    method: "cross",
    times: [0, 5, 10, 15, 20, 25],
    visible: [true, true, true, false, false, false],
    start: 10,
    stop: 15,
    comparisonTime: 30,
    issue: "interval",
  },
  slow: {
    title: "A slower sampled response",
    method: "cross",
    times: [0, 20, 40, 60, 80, 100],
    visible: [true, true, true, true, false, false],
    start: 60,
    stop: 80,
    comparisonTime: 40,
    issue: "interval",
  },
  sensor: {
    title: "Defined sensor threshold",
    method: "sensor",
    times: [0, 10, 20, 30, 40, 50],
    light: [100, 84, 65, 48, 36, 30],
    threshold: 50,
    start: 20,
    stop: 30,
    comparisonTime: 60,
    issue: "interval",
  },
  sensorLow: {
    title: "Different fixed optical threshold",
    method: "sensor",
    times: [0, 10, 20, 30, 40, 50],
    light: [100, 75, 56, 42, 32, 24],
    threshold: 35,
    start: 30,
    stop: 40,
    comparisonTime: 20,
    issue: "interval",
  },
  exact: {
    title: "Recorded continuous observation",
    method: "cross",
    times: [0, 10, 20, 30, 40, 50],
    visible: [true, true, true, false, false, false],
    start: 25,
    stop: 25,
    comparisonTime: 50,
    issue: "recorded",
  },
};
export type PlotRecord = {
  title: string;
  quantity: string;
  unit: string;
  times: number[];
  readings: number[];
  max: number;
  anomalous: number;
  note: string;
  fit: string;
  from: number;
  to: number;
  corrected?: number[];
};
export const practicalPlots: Record<string, PlotRecord> = {
  initial: {
    title: "Hydrogen volume readings",
    quantity: "Gas volume",
    unit: "cm³",
    times: [0, 10, 20, 30, 40, 50],
    readings: [0, 12, 20, 26, 30, 30],
    max: 40,
    anomalous: -1,
    note: "Supplied observations; no anomaly is documented.",
    fit: "smoothPlateau",
    from: 10,
    to: 30,
  },
  massLost: {
    title: "Carbon dioxide mass loss",
    quantity: "Mass lost",
    unit: "g",
    times: [0, 20, 40, 60, 80, 100],
    readings: [0, 0.4, 0.7, 0.9, 1, 1],
    max: 1.2,
    anomalous: -1,
    note: "Gas escapes; the mass lost increases towards a plateau.",
    fit: "smoothPlateau",
    from: 20,
    to: 60,
  },
  remaining: {
    title: "Remaining balance mass",
    quantity: "Balance mass",
    unit: "g",
    times: [0, 10, 20, 30, 40, 50],
    readings: [126, 125.6, 125.3, 125.1, 125, 125],
    max: 126.2,
    anomalous: -1,
    note: "Same reaction written as remaining mass. A falling slope does not mean a negative amount of gas was produced.",
    fit: "smoothFalling",
    from: 10,
    to: 30,
  },
  anomaly: {
    title: "Plot the original suspect point",
    quantity: "Gas volume",
    unit: "cm³",
    times: [0, 10, 20, 30, 40, 50],
    readings: [0, 12, 20, 15, 30, 30],
    max: 40,
    anomalous: 3,
    note: "The 30-second reading is inconsistent with neighbouring readings. No measurement fault has yet been confirmed; keep it visible and investigate.",
    fit: "investigateSmooth",
    from: 0,
    to: 20,
  },
  light: {
    title: "Light reaching a sensor",
    quantity: "Light reaching sensor",
    unit: "%",
    times: [0, 20, 40, 60, 80, 100],
    readings: [100, 70, 50, 38, 30, 30],
    max: 100,
    anomalous: -1,
    note: "A decreasing optical signal is supplied; it is not itself a product mass or volume measurement.",
    fit: "smoothFalling",
    from: 20,
    to: 60,
  },
  unequal: {
    title: "Unequal time intervals",
    quantity: "Gas volume",
    unit: "cm³",
    times: [0, 5, 15, 30, 50, 70],
    readings: [0, 8, 20, 30, 36, 36],
    max: 40,
    anomalous: -1,
    note: "Horizontal spacing must follow elapsed time; observations are not equally spaced.",
    fit: "smoothPlateau",
    from: 5,
    to: 30,
  },
};
export type RepeatRecord = {
  title: string;
  readings: number[];
  unit: string;
  note: string;
  exclude: number;
  decision: string;
  improvement: string;
};
export const practicalRepeats: Record<string, RepeatRecord> = {
  initial: {
    title: "Documented late timer start",
    readings: [40, 42, 20],
    unit: "s",
    note: "Trial 3 notes confirm the stopwatch was started about 20 seconds after mixing. Preserve its value and note; exclude this invalid timing from the stated mean.",
    exclude: 2,
    decision: "excludeDocumented",
    improvement: "synchroniseStart",
  },
  suspect: {
    title: "Suspect, cause unknown",
    readings: [40, 42, 20],
    unit: "s",
    note: "Trial 3 is far from the other two, but no procedural fault is documented. Calculate the mean of all original trials and investigate/repeat rather than silently discard it.",
    exclude: -1,
    decision: "investigateRetain",
    improvement: "investigateRepeat",
  },
  identified: {
    title: "Explicit exam anomaly instruction",
    readings: [31, 32, 50],
    unit: "s",
    note: "The question explicitly identifies trial 3 as anomalous and asks for a mean excluding it. Retain the original 50 s reading and report that stated exclusion; a cause has not been established.",
    exclude: 2,
    decision: "excludeIdentified",
    improvement: "investigateRepeat",
  },

  leak: {
    title: "Repeated gas leak",
    readings: [22, 23, 22.5],
    unit: "cm³",
    note: "All three runs have the same documented leaking bung. Calculate their recorded mean, but do not treat close agreement as accurate gas recovery.",
    exclude: -1,
    decision: "systematicFault",
    improvement: "repairLeak",
  },
  splash: {
    title: "Documented spray loss",
    readings: [0.8, 0.82, 1.4],
    unit: "g lost",
    note: "Trial 3 notes confirm liquid splashed out of the flask. Keep the raw result; exclude it from the stated gas mass-loss mean.",
    exclude: 2,
    decision: "excludeDocumented",
    improvement: "preventSpray",
  },
  groups: {
    title: "Different groups",
    readings: [35, 37, 36],
    unit: "s",
    note: "Three groups followed the same method using equivalent apparatus. Comparing their results examines reproducibility; each value is valid.",
    exclude: -1,
    decision: "retainAll",
    improvement: "reproducibility",
  },
};
export const practicalRecords = {
  plan: practicalPlans,
  apparatus: practicalApparatus,
  dilution: practicalDilutions,
  endpoint: practicalEndpoints,
  plot: practicalPlots,
  repeats: practicalRepeats,
};
export const dilutionWater = (r: DilutionRecord) => r.total - r.stockVolume;
export const premixConcentration = (r: DilutionRecord) =>
  (r.stock * r.stockVolume) / r.total;
export const combinedConcentration = (r: DilutionRecord) =>
  (r.stock * r.stockVolume) / (r.total + r.acid);
export const selectedRepeats = (r: RepeatRecord) =>
  r.readings.filter((_, i) => i !== r.exclude);
export const repeatMean = (r: RepeatRecord) =>
  selectedRepeats(r).reduce((a, b) => a + b, 0) / selectedRepeats(r).length;
export const repeatRange = (r: RepeatRecord) =>
  Math.max(...selectedRepeats(r)) - Math.min(...selectedRepeats(r));
export const intervalRate = (r: PlotRecord) => {
  const a = r.times.indexOf(r.from),
    b = r.times.indexOf(r.to);
  return Math.abs(r.readings[b] - r.readings[a]) / (r.to - r.from);
};
export const sampledEndpoint = (r: EndpointRecord) =>
  r.method === "sensor"
    ? r.times[r.light!.findIndex((x) => x <= r.threshold!)]
    : r.times[r.visible!.findIndex((x) => !x)];
