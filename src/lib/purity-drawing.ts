export type PurityDrawingData = {
  mode: "filtration" | "distillation";
  record: string;
};
export type PurityDrawingBoard = Record<string, string>;
export const separationSources = {
  filterPractice: {
    mode: "filtration",
    title: "Fully dissolved salt with insoluble sand",
    source:
      "The supplied feed contains 8 g insoluble sand,2 g salt fully dissolved in 40 g water. The ideal filtration retains no mother liquor. Draw the proposed arrangement and the two output compositions.",
  },
  filterCheckA: {
    mode: "filtration",
    title: "An unfamiliar dissolved-salt mixture",
    source:
      "The supplied feed contains 9 g insoluble solid Z and 4 g salt fully dissolved in 60 g water. Z grains are larger than the filter pores. The ideal filtration retains no mother liquor. Independently propose the apparatus path and output compositions.",
  },
  filterReview: {
    mode: "filtration",
    title: "A fresh solid/solution separation",
    source:
      "The supplied feed contains 6 g insoluble solid Z and 5 g salt fully dissolved in 50 g water. Z grains are larger than the filter pores. The ideal filter retains no mother liquor. Propose the path and outputs without a worked model.",
  },
  distilPractice: {
    mode: "distillation",
    title: "Collect a nonvolatile-solute solvent",
    source:
      "The supplied feed contains 4 g nonvolatile salt dissolved in 30 g water. No other volatile substances are supplied. Propose a simple-distillation apparatus and identify materials in vapour, receiver and original flask at the ideal endpoint when all the water is collected.",
  },
  distilCheckB: {
    mode: "distillation",
    title: "A nonvolatile soluble material",
    source:
      "The supplied feed contains 7 g nonvolatile soluble solid X dissolved in 45 g water, with no other volatile substances. Independently propose how water reaches a receiver as a liquid and where X remains at the ideal endpoint when all water is collected.",
  },
  distilReview: {
    mode: "distillation",
    title: "Fresh solvent-collection proposal",
    source:
      "The supplied feed contains 3 g nonvolatile soluble solid X dissolved in 35 g water, with no other volatile substances. Propose the apparatus path and identify endpoint materials after all water has been collected.",
  },
} as const;
export const drawingChoices = {
  filtration: {
    paper: ["", "funnel", "spout", "receiver", "absent"],
    residue: ["", "insoluble", "dissolved", "both", "none"],
    filtrate: ["", "solution", "water", "solidWater", "none"],
    dissolved: ["", "ions", "saltMolecules", "sand", "changedWater"],
    path: ["", "through", "around", "blocked"],
    process: ["", "physical", "chemical"],
  },
  distillation: {
    source: ["", "solution", "drySolid", "water"],
    vapour: ["", "water", "solute", "both", "none"],
    cooling: ["", "lowerUpper", "upperLower", "none"],
    receiver: ["", "liquidWater", "waterGas", "solution", "none"],
    flask: ["", "solute", "water", "empty"],
    process: ["", "physical", "chemical"],
  },
} as const;
export function initialPurityDrawing(
  data: PurityDrawingData,
): PurityDrawingBoard {
  const source =
    separationSources[data.record as keyof typeof separationSources];
  if (!source || source.mode !== data.mode)
    throw new Error("Unknown original separation drawing.");
  return Object.fromEntries([
    ["record", data.record],
    ...Object.keys(drawingChoices[data.mode]).map((k) => [k, ""]),
  ]);
}
export function validPurityDrawing(
  data: PurityDrawingData,
  v: unknown,
): v is PurityDrawingBoard {
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(v))
  )
    return false;
  const b = v as Record<string, unknown>;
  if (
    b.record !== data.record ||
    !Object.hasOwn(separationSources, data.record) ||
    separationSources[data.record as keyof typeof separationSources].mode !==
      data.mode
  )
    return false;
  const wanted = ["record", ...Object.keys(drawingChoices[data.mode])];
  if (
    Reflect.ownKeys(b).length !== wanted.length ||
    wanted.some((k) => !Object.hasOwn(b, k))
  )
    return false;
  return Object.entries(drawingChoices[data.mode]).every(
    ([k, values]) =>
      typeof b[k] === "string" &&
      (values as readonly string[]).includes(b[k] as string),
  );
}
export function readPurityDrawing(
  data: PurityDrawingData,
  raw: string,
): PurityDrawingBoard | null {
  try {
    const b = JSON.parse(raw);
    return validPurityDrawing(data, b) ? b : null;
  } catch {
    return null;
  }
}
export function referencePurityDrawing(
  data: PurityDrawingData,
): PurityDrawingBoard {
  initialPurityDrawing(data);
  return data.mode === "filtration"
    ? {
        record: data.record,
        paper: "funnel",
        residue: "insoluble",
        filtrate: "solution",
        dissolved: "ions",
        path: "through",
        process: "physical",
      }
    : {
        record: data.record,
        source: "solution",
        vapour: "water",
        cooling: "lowerUpper",
        receiver: "liquidWater",
        flask: "solute",
        process: "physical",
      };
}
export const drawingLabels: Record<string, string> = {
  funnel: "In the funnel",
  spout: "In the outlet spout",
  receiver: "In the receiver",
  absent: "No filter paper",
  insoluble: "Insoluble solid",
  dissolved: "Dissolved material",
  both: "Both stated materials",
  none: "None",
  solution: "Water with dissolved material",
  water: "Water",
  solidWater: "Insoluble solid and water",
  ions: "Dissolved ions",
  saltMolecules: "Separate salt molecules",
  sand: "Sand grains",
  changedWater: "Changed into water",
  through: "Through the filter paper",
  around: "Around the paper",
  blocked: "Blocked",
  physical: "Physical separation",
  chemical: "Chemical reaction",
  drySolid: "Dry solid only",
  solute: "The stated nonvolatile solute",
  lowerUpper: "Lower cooling port to upper cooling port",
  upperLower: "Upper cooling port to lower cooling port",
  liquidWater: "Liquid water",
  waterGas: "Water vapour",
  empty: "Nothing remains",
};
export function describePurityDrawing(
  data: PurityDrawingData,
  raw: string,
): string {
  const b = readPurityDrawing(data, raw);
  if (!b)
    return "The retained raw structure could not be read; no proposed fields were repaired.";
  const names: Record<string, string> = {
    paper: "Paper position",
    residue: "Residue",
    filtrate: "Filtrate",
    dissolved: "Dissolved-material account",
    path: "Flow path",
    process: "Process",
    source: "Original flask",
    vapour: "Vapour",
    cooling: "Cooling-water direction",
    receiver: "Receiver",
    flask: "Endpoint flask",
  };
  return (
    Object.keys(drawingChoices[data.mode])
      .map((k) => `${names[k]}: ${b[k] ? drawingLabels[b[k]] : "not chosen"}`)
      .join("; ") +
    ". Inspect your actual retained arrangement and flows; no automatic examiner drawing mark is awarded."
  );
}
