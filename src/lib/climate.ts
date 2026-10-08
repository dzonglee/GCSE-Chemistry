export type ClimateMode =
  | "trend"
  | "report"
  | "range"
  | "boundary"
  | "equivalents"
  | "comparison"
  | "reduction";
export type ClimateBoard = Record<string, string>;
export type ClimateGraph = {
  baseline: string;
  points: readonly { year: number; anomaly: number }[];
  min: number;
  max: number;
};
export type ClimateGiven = {
  title: string;
  note: string;
  rows?: readonly { label: string; text: string }[];
  graph?: ClimateGraph;
  range?: { low: number; high: number; unit: string; context: string };
  stages?: readonly { stage: string; amount: number }[];
  gases?: { co2: number; methane: number; factor: number; horizon: string };
  comparison?: {
    a: { total: number; uses: number };
    b: { total: number; uses: number };
    service: string;
  };
};
export type ClimateRecord = ClimateGiven & {
  mode: ClimateMode;
  expected: ClimateBoard;
  feedback: string;
};
export const climateFields: Record<ClimateMode, readonly string[]> = {
  trend: ["start", "end", "change", "direction"],
  report: ["quality", "inference", "nextCheck"],
  range: ["width", "meaning"],
  boundary: ["scope", "omitted", "verdict"],
  equivalents: ["methaneEquivalent", "totalEquivalent"],
  comparison: ["perA", "perB", "reductionPercent"],
  reduction: ["action", "gas", "process", "limit"],
};
export const climateNumeric = [
  "start",
  "end",
  "change",
  "width",
  "methaneEquivalent",
  "totalEquivalent",
  "perA",
  "perB",
  "reductionPercent",
];
export const climateChoices: Record<string, readonly string[]> = {
  direction: ["up", "down", "flat"],
  quality: ["limited", "stronger", "association", "conflict"],
  inference: [
    "tooNarrow",
    "supportedTrend",
    "notCauseAlone",
    "scrutinise",
    "noWarming",
    "certainCause",
    "automaticallyFalse",
  ],
  nextCheck: [
    "broadRecord",
    "independentMethods",
    "mechanism",
    "disclose",
    "oneDay",
    "popular",
  ],
  meaning: [
    "supportedRange",
    "exactMidpoint",
    "noKnowledge",
    "equalProbability",
  ],
  scope: ["allGHG", "co2Only", "carbonMass"],
  omitted: [
    "useStage",
    "none",
    "manufacturingStage",
    "transportStage",
    "disposalStage",
  ],
  verdict: ["partial", "full", "zero"],
  action: ["solarAction", "captureAction", "burnMore", "nothing"],
  gas: ["co2", "ch4", "o2"],
  process: ["lessCombustion", "captureMethane", "noLifecycle", "makeOxygen"],
  limit: ["variableSupply", "leaks", "guaranteedZero", "colour"],
};
export const climateLabels: Record<string, string> = {
  start: "Starting anomaly / °C",
  end: "Ending anomaly / °C",
  change: "Change in anomaly / °C",
  direction: "Overall trend",
  up: "Increase overall",
  down: "Decrease overall",
  flat: "No overall change",
  quality: "Evidence quality",
  inference: "Supported interpretation",
  nextCheck: "A useful further check",
  limited: "One place or short period",
  stronger: "Broad record with documented methods",
  association: "An association without causal testing",
  conflict: "A possible conflict to examine",
  tooNarrow: "Insufficient to decide a global long-term trend",
  supportedTrend: "Supports a trend, with stated uncertainty",
  notCauseAlone: "Correlation alone does not establish cause",
  scrutinise: "Scrutinise methods; funding alone is not a verdict",
  noWarming: "Proves there is no global warming",
  certainCause: "Proves a cause without other evidence",
  automaticallyFalse: "The result must be false",
  broadRecord: "Check many places over a long period",
  independentMethods: "Compare independently checked methods and results",
  mechanism: "Check a mechanism and other independent evidence",
  disclose: "Check disclosure, methods and independent replication",
  oneDay: "Use one more local afternoon",
  popular: "Count social-media likes",
  width: "Width of the supplied range / °C",
  meaning: "Meaning of the stated range",
  supportedRange: "Supported estimates under the stated assumptions",
  exactMidpoint: "An exact future outcome at the midpoint",
  noKnowledge: "No useful knowledge at all",
  equalProbability: "Every value is equally likely",
  scope: "Gases a full footprint accounts for",
  allGHG: "CO₂ and other emitted greenhouse gases",
  co2Only: "CO₂ only, whatever else is emitted",
  carbonMass: "Mass of carbon atoms only",
  omitted: "Stage omitted from the supplied claim",
  useStage: "Use",
  none: "No listed stage is omitted",
  manufacturingStage: "Manufacture",
  transportStage: "Transport",
  disposalStage: "End of life",
  verdict: "Judgement of the claimed coverage",
  partial: "A partial inventory",
  full: "Covers the supplied full life cycle",
  zero: "A zero footprint",
  methaneEquivalent: "CH₄ contribution / kg CO₂e",
  totalEquivalent: "Total footprint / kg CO₂e",
  perA: "A per completed service / kg CO₂e",
  perB: "B per completed service / kg CO₂e",
  reductionPercent: "Reduction from A to B / %",
  action: "Proposed action",
  solarAction: "Replace some fossil generation with solar",
  captureAction: "Capture landfill methane",
  burnMore: "Burn more fossil fuel",
  nothing: "Make no change",
  gas: "Main gas targeted here",
  co2: "Carbon dioxide (CO₂)",
  ch4: "Methane (CH₄)",
  o2: "Oxygen (O₂)",
  process: "Why emissions can fall",
  lessCombustion: "Less fossil carbon is burned",
  captureMethane: "Less methane escapes; captured gas may be used",
  noLifecycle: "Every life-cycle emission becomes zero",
  makeOxygen: "Oxygen becomes carbon",
  limit: "A relevant practical limitation",
  variableSupply: "Variable sunshine needs storage or other supply",
  leaks: "Leaks and incomplete collection reduce the benefit",
  guaranteedZero: "There can be no limitation",
  colour: "The equipment’s colour alone",
};
export const climateRecords: Record<string, ClimateRecord> = {
  trend: {
    mode: "trend",
    title: "Climate graph",
    note: "Original teaching data; not measured global observations.",
    graph: {
      baseline: "Difference from a stated 1981–2010 reference average",
      min: -0.4,
      max: 0.8,
      points: [
        { year: 1980, anomaly: -0.2 },
        { year: 1990, anomaly: 0 },
        { year: 2000, anomaly: -0.1 },
        { year: 2010, anomaly: 0.3 },
        { year: 2020, anomaly: 0.6 },
      ],
    },
    expected: { start: "-0.2", end: "0.6", change: "0.8", direction: "up" },
    feedback:
      "0.6−(−0.2)=+0.8 °C overall. The intermediate dip does not remove the overall increase. Anomaly means difference from the stated reference average, not the actual air temperature; this original dataset is only for learning graph interpretation.",
  },
  fluctuations: {
    mode: "trend",
    title: "A fluctuating series",
    note: "Original teaching anomalies relative to a fixed reference.",
    graph: {
      baseline: "Difference from a fixed teaching reference average",
      min: -0.4,
      max: 0.8,
      points: [
        { year: 1960, anomaly: -0.1 },
        { year: 1980, anomaly: 0.3 },
        { year: 2000, anomaly: 0.2 },
        { year: 2020, anomaly: 0.7 },
      ],
    },
    expected: { start: "-0.1", end: "0.7", change: "0.8", direction: "up" },
    feedback:
      "The series fluctuates but ends 0.8 °C higher: 0.7−(−0.1). A selected short dip cannot alone decide the full-period trend. The stated reference is essential to interpreting an anomaly.",
  },
  cooling: {
    mode: "trend",
    title: "A regional comparison",
    note: "Original regional teaching values; not a global record.",
    graph: {
      baseline: "Difference from a fixed regional reference average",
      min: 0,
      max: 0.6,
      points: [
        { year: 1990, anomaly: 0.4 },
        { year: 2000, anomaly: 0.2 },
        { year: 2010, anomaly: 0.3 },
        { year: 2020, anomaly: 0.1 },
      ],
    },
    expected: { start: "0.4", end: "0.1", change: "-0.3", direction: "down" },
    feedback:
      "0.1−0.4=−0.3 °C: an overall decrease in this supplied regional series. One regional period cannot establish the global trend; a signed negative change is meaningful.",
  },
  weather: {
    mode: "report",
    title: "A cold-week headline",
    note: "Claim: one cold week in one town proves global warming has ended.",
    rows: [
      {
        label: "Sampling",
        text: "Seven days at one local station; no wider series supplied.",
      },
    ],
    expected: {
      quality: "limited",
      inference: "tooNarrow",
      nextCheck: "broadRecord",
    },
    feedback:
      "One cold week describes local weather, not global long-term climate. Check many locations over a long period with consistent methods; a cherry-picked interval does not overturn a broader trend.",
  },
  transparent: {
    mode: "report",
    title: "A documented report",
    note: "A report describes a long-term average rise and states uncertainty.",
    rows: [
      {
        label: "Methods",
        text: "Many sites and decades, corrections documented, methods/data available, peer reviewed and independently checked.",
      },
    ],
    expected: {
      quality: "stronger",
      inference: "supportedTrend",
      nextCheck: "independentMethods",
    },
    feedback:
      "Broad sampling, transparent methods, peer review and independent checks strengthen confidence in the reported trend. Peer review can detect problems but is not a guarantee of infallibility. Communicate the trend, units, coverage and uncertainty clearly.",
  },
  correlation: {
    mode: "report",
    title: "Two quantities rise together",
    note: "A graph shows CO₂ concentration and mean temperature rising over the same period.",
    rows: [
      {
        label: "Claim",
        text: "This correlation alone proves the cause; no mechanism or other evidence is discussed.",
      },
    ],
    expected: {
      quality: "association",
      inference: "notCauseAlone",
      nextCheck: "mechanism",
    },
    feedback:
      "Correlation alone does not establish causation. Greenhouse absorption has a physical mechanism; causal evaluation also draws on multiple independently checked measurements and models. Uncertainty about precise future impacts does not make every explanation equally supported.",
  },
  funding: {
    mode: "report",
    title: "A funding disclosure",
    note: "An organisation with a financial interest paid for a study.",
    rows: [
      {
        label: "Available information",
        text: "Funding is disclosed, but methods, data and independent replication still need checking.",
      },
    ],
    expected: {
      quality: "conflict",
      inference: "scrutinise",
      nextCheck: "disclose",
    },
    feedback:
      "A financial interest is a reason for scrutiny, not proof that a result is false. Check disclosure, sampling, transparent methods, peer review and independent replication before judging the evidence.",
  },
  projection: {
    mode: "range",
    title: "A supplied scenario interval",
    note: "Original teaching projection, not a real forecast.",
    range: {
      low: 1.4,
      high: 2.2,
      unit: "°C",
      context:
        "Change by 2050 relative to 2020, under a stated emissions scenario; range is not a probability distribution.",
    },
    expected: { width: "0.8", meaning: "supportedRange" },
    feedback:
      "2.2−1.4=0.8 °C wide. The range expresses supported estimates under the stated assumptions, not an exact midpoint or no knowledge. No probabilities are given, so equal likelihood cannot be inferred; different emissions scenarios can produce different ranges.",
  },
  historical: {
    mode: "range",
    title: "A reconstruction interval",
    note: "Original teaching historical estimate, not a future projection.",
    range: {
      low: 0.3,
      high: 0.5,
      unit: "°C",
      context:
        "Estimated past temperature change from limited historical measurements; no probability distribution supplied.",
    },
    expected: { width: "0.2", meaning: "supportedRange" },
    feedback:
      "0.5−0.3=0.2 °C. Limited older measurements, changing instruments and uneven locations can contribute uncertainty. Corrections and independent comparisons improve estimates; uncertainty is not the absence of evidence.",
  },
  advertisement: {
    mode: "boundary",
    title: "A product’s advertised claim",
    note: "Claim: full footprint 20 kg CO₂e. Listed claim counts manufacture, transport and end of life only; all emitted GHGs are converted to CO₂e.",
    stages: [
      { stage: "Manufacture", amount: 12 },
      { stage: "Transport", amount: 3 },
      { stage: "Use", amount: 60 },
      { stage: "End of life", amount: 5 },
    ],
    expected: { scope: "allGHG", omitted: "useStage", verdict: "partial" },
    feedback:
      "12+3+5=20 kg CO₂e excludes 60 kg from use. The supplied full lifetime is 80 kg CO₂e. A carbon footprint accounts for CO₂ and other emitted greenhouse gases over the full life cycle of a product, service or event; a partial inventory must be labelled clearly.",
  },
  kettle: {
    mode: "boundary",
    title: "A complete supplied inventory",
    note: "Claim: 115 kg CO₂e over one product’s full stated lifetime. The inventory converts all emitted greenhouse gases on the same basis.",
    stages: [
      { stage: "Manufacture", amount: 20 },
      { stage: "Transport", amount: 2 },
      { stage: "Use", amount: 90 },
      { stage: "End of life", amount: 3 },
    ],
    expected: { scope: "allGHG", omitted: "none", verdict: "full" },
    feedback:
      "20+2+90+3=115 kg CO₂e and every supplied stage is counted. This covers the stated lifetime and gas scope. The estimate still depends on electricity source, lifetime and other assumptions; full coverage does not guarantee perfect precision.",
  },
  delivery: {
    mode: "equivalents",
    title: "One delivery service",
    note: "Original full-lifetime gas inventory for one stated service; exercise factor is supplied, not a universal constant.",
    gases: {
      co2: 50,
      methane: 0.5,
      factor: 28,
      horizon: "100-year exercise basis",
    },
    expected: { methaneEquivalent: "14", totalEquivalent: "64" },
    feedback:
      "0.5×28=14 kg CO₂e from methane; 50+14=64 kg CO₂e total. The factor compares warming over the supplied 100-year basis; methane does not chemically become carbon dioxide. Other emitted GHGs would also require accounting.",
  },
  waste: {
    mode: "equivalents",
    title: "One waste-treatment service",
    note: "Original full-lifetime gas inventory; use the supplied exercise factor.",
    gases: {
      co2: 12,
      methane: 0.25,
      factor: 28,
      horizon: "100-year exercise basis",
    },
    expected: { methaneEquivalent: "7", totalEquivalent: "19" },
    feedback:
      "0.25×28=7 kg CO₂e; 12+7=19 kg CO₂e for the stated service. Add gas contributions only after converting to the same mass and warming basis; 0.25 kg methane is 250 g, not 250 kg.",
  },
  cups: {
    mode: "comparison",
    title: "Compare drink services",
    note: "Original full-lifetime totals on the same 100-year CO₂e basis. Supplied service counts are achieved, not promised.",
    comparison: {
      a: { total: 20, uses: 100 },
      b: { total: 12, uses: 200 },
      service: "one drink served, with equal capacity and performance",
    },
    expected: { perA: "0.2", perB: "0.06", reductionPercent: "70" },
    feedback:
      "A: 20/100=0.20 kg CO₂e per drink; B: 12/200=0.06. Reduction=(0.20−0.06)/0.20×100=70%. Compare the same service and full boundary. Actual reuse and washing assumptions matter; lowest carbon need not mean lowest every environmental impact.",
  },
  bags: {
    mode: "comparison",
    title: "Compare carrying services",
    note: "Original full-lifetime totals on the same warming basis; same load capacity and completed trips.",
    comparison: {
      a: { total: 6, uses: 30 },
      b: { total: 8, uses: 80 },
      service: "one equal shopping load carried",
    },
    expected: { perA: "0.2", perB: "0.1", reductionPercent: "50" },
    feedback:
      "A: 6/30=0.20 kg CO₂e per load; B: 8/80=0.10, a 50% reduction relative to A. B has the larger product total but the lower per-service footprint at the achieved reuse counts. Fewer actual uses could change the comparison.",
  },
  solar: {
    mode: "reduction",
    title: "Reducing fossil generation",
    note: "A town proposes supplying some electricity using solar instead of fossil-fuel combustion.",
    expected: {
      action: "solarAction",
      gas: "co2",
      process: "lessCombustion",
      limit: "variableSupply",
    },
    feedback:
      "Replacing some fossil generation can reduce CO₂ by burning less fossil carbon. Sunshine varies, so matching demand can need storage or other supply. Manufacturing equipment still has emissions; renewable generation does not imply a zero full-life-cycle footprint.",
  },
  landfill: {
    mode: "reduction",
    title: "Reducing landfill escape",
    note: "A site proposes collecting methane from organic waste and using captured gas as fuel.",
    expected: {
      action: "captureAction",
      gas: "ch4",
      process: "captureMethane",
      limit: "leaks",
    },
    feedback:
      "Collection reduces methane escape, but incomplete collection and leaks limit the benefit. Burning captured methane makes CO₂ and water; it does not eliminate all greenhouse gases. The supplied warming basis and displaced energy source matter when quantifying benefit.",
  },
};
export const climateRecord = (mode: ClimateMode, record: string) =>
  climateRecords[record]?.mode === mode ? climateRecords[record] : null;
export function initialClimate(
  mode: ClimateMode,
  record: string,
): ClimateBoard {
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(climateFields[mode].map((f) => [f, ""])),
  };
}
export function climateNumber(raw: string): number | null {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
export function validClimate(
  mode: ClimateMode,
  value: unknown,
  record?: string,
): value is ClimateBoard {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  )
    return false;
  const b = value as ClimateBoard,
    fields = climateFields[mode];
  return (
    !!fields &&
    b.version === "1" &&
    b.mode === mode &&
    !!climateRecord(mode, b.record) &&
    (record === undefined || record === b.record) &&
    Object.keys(b).length === fields.length + 3 &&
    fields.every(
      (f) =>
        typeof b[f] === "string" &&
        (!b[f] ||
          (climateNumeric.includes(f)
            ? b[f].length <= 16
            : climateChoices[f]?.includes(b[f]))),
    )
  );
}
export function validClimateHistory(
  mode: ClimateMode,
  record: string,
  h: unknown,
): h is ClimateBoard[] {
  if (
    !Array.isArray(h) ||
    h.length < 1 ||
    h.length > 500 ||
    !h.every((b) => validClimate(mode, b, record))
  )
    return false;
  const first = initialClimate(mode, record);
  return (
    Object.keys(first).every((k) => h[0][k] === first[k]) &&
    h.every(
      (b, i) =>
        i === 0 ||
        climateFields[mode].filter((f) => b[f] !== h[i - 1][f]).length === 1,
    )
  );
}
export function checkClimate(mode: ClimateMode, b: ClimateBoard) {
  if (!validClimate(mode, b))
    return {
      correct: false,
      message:
        "This proposal is unreadable. Its original entries are retained.",
    };
  if (climateFields[mode].some((f) => !b[f]))
    return {
      correct: false,
      message: "Complete each part. Blank entries remain unknown.",
    };
  const r = climateRecord(mode, b.record)!,
    wrong = climateFields[mode].filter((f) =>
      climateNumeric.includes(f)
        ? climateNumber(b[f]) === null ||
          Math.abs(climateNumber(b[f])! - Number(r.expected[f])) > 0.000001
        : b[f] !== r.expected[f],
    );
  return {
    correct: wrong.length === 0,
    message:
      (wrong.length
        ? "Reconsider " +
          wrong.map((f) => climateLabels[f].toLowerCase()).join(" and ") +
          ". "
        : "") +
      r.feedback +
      (wrong.length ? " Your proposal remains as entered." : ""),
  };
}
