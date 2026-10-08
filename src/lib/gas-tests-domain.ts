import { gasTestCases, type GasMode } from "./gas-tests-cases";
export const gasFields = {
  procedure: ["material", "placement"],
  observation: ["observation", "gas"],
  identification: ["material", "result", "gas", "claim"],
  comparison: ["difference", "usefulRecord"],
  faults: ["limitation", "correction", "ruledOut"],
  evidence: ["material", "placement", "result", "conclusion"],
  wording: ["focus", "replacement"],
} as const;
export type GasField = (typeof gasFields)[GasMode][number];
export type GasFocus = "all" | GasField;
export type GasBoard = Record<string, string>;
const materials = [
  "burningSplint",
  "glowingSplint",
  "unlitSplint",
  "limewater",
  "water",
  "dampBlueLitmus",
  "dryBlueLitmus",
];
const placements = [
  "mouth",
  "inside",
  "belowLiquid",
  "aboveLiquid",
  "gasContact",
  "away",
];
const results = [
  "pop",
  "relights",
  "limewaterCloudy",
  "litmusBleached",
  "bubblesOnly",
  "litmusRedOnly",
  "noVisibleChange",
];
const choices: Record<string, readonly string[]> = {
  material: materials,
  placement: placements,
  observation: results,
  result: results,
  gas: ["hydrogen", "oxygen", "carbonDioxide", "chlorine"],
  claim: ["present", "singleGas", "pureMixture"],
  difference: [
    "dampness",
    "splintState",
    "reagent",
    "contact",
    "contactMethod",
    "gasIdentity",
  ],
  usefulRecord: ["A", "B", "both", "neither"],
  limitation: [
    "dryPaper",
    "noLiquidContact",
    "wrongReagent",
    "wrongSplintState",
    "lostSample",
    "missingBleachingObservation",
    "validNegative",
  ],
  correction: [
    "dampenPaper",
    "submergeOutlet",
    "useLimewater",
    "useGlowingSplint",
    "testFreshCollectedSample",
    "recordCompleteLitmusChange",
    "identifyAnotherGas",
  ],
  ruledOut: ["yes", "no"],
  conclusion: [
    "hydrogenSingleGas",
    "oxygenSingleGas",
    "carbonDioxideSingleGas",
    "chlorineSingleGas",
    "carbonDioxidePresent",
    "pureCarbonDioxideMixture",
    "cannotIdentify",
  ],
  focus: [
    "splintStateAndChange",
    "observedObject",
    "bleaching",
    "combustionRole",
    "reagentIdentity",
    "methodAndResult",
    "noCorrectionNeeded",
  ],
  replacement: [
    "Insert a glowing splint; it relights.",
    "The limewater turns milky or cloudy.",
    "Damp litmus is bleached white; damp blue litmus may first turn red.",
    "Oxygen supports burning, so the glowing splint relights.",
    "Limewater is an aqueous solution of calcium hydroxide.",
    "Hold a burning splint at the open end of the test tube; hydrogen burns with a pop.",
    "The gas itself turns white.",
    "Oxygen is the fuel that burns.",
    "Red litmus alone proves that chlorine is present.",
  ],
};
export const gasChoiceLabels: Record<string, string> = {
  burningSplint: "Burning splint (visible flame)",
  glowingSplint: "Glowing splint (hot glow, no flame)",
  unlitSplint: "Cold unlit splint",
  limewater: "Limewater — aqueous calcium hydroxide",
  water: "Pure water",
  dampBlueLitmus: "Damp blue litmus",
  dryBlueLitmus: "Dry blue litmus",
  mouth: "At the open end of the test tube",
  inside: "Inserted into the gas sample",
  belowLiquid: "Delivery outlet below the liquid surface",
  aboveLiquid: "Delivery outlet above the liquid surface",
  gasContact: "In contact with the gas sample",
  away: "Away from the sample or receiving liquid",
  hydrogen: "Hydrogen",
  oxygen: "Oxygen",
  carbonDioxide: "Carbon dioxide",
  chlorine: "Chlorine",
  pop: "A pop is heard",
  relights: "The initially glowing splint relights",
  limewaterCloudy: "The limewater becomes milky/cloudy",
  litmusBleached: "The litmus is bleached white",
  bubblesOnly: "Bubbles pass through the liquid",
  litmusRedOnly: "Blue litmus becomes red; no later change recorded",
  noVisibleChange: "No visible change is recorded",
  present: "The identified gas is present",
  singleGas: "Identify the single gas within the stated candidate set",
  pureMixture: "The whole mixture must be this pure gas",
  dampness: "Whether the paper is damp",
  splintState: "The initial state of the splint",
  reagent: "The receiving reagent",
  contact: "Whether gas passes through the liquid",
  contactMethod: "Shaking with the gas versus bubbling through",
  gasIdentity: "A different gas was used",
  A: "Record A",
  B: "Record B",
  both: "Both records",
  neither: "Neither record",
  dryPaper: "The specified test needs damp paper",
  noLiquidContact: "Gas never passes through the reagent",
  wrongReagent: "The specified reagent was not used",
  wrongSplintState: "The splint starts in the wrong state",
  lostSample: "The collected sample was lost before testing",
  missingBleachingObservation:
    "The decisive later litmus observation is missing",
  validNegative: "The method is a valid negative test",
  dampenPaper: "Use damp litmus in contact with the sample",
  submergeOutlet: "Place the delivery outlet below the limewater surface",
  useLimewater: "Use fresh limewater instead of water",
  useGlowingSplint: "Start with a glowing splint",
  testFreshCollectedSample: "Test a freshly collected sample",
  recordCompleteLitmusChange: "Record whether the damp litmus is bleached",
  identifyAnotherGas: "Name another gas without further evidence",
  yes: "Yes — the target is ruled out",
  no: "No — this record cannot rule it out",
  hydrogenSingleGas: "Hydrogen, within the stated single-gas set",
  oxygenSingleGas: "Oxygen, within the stated single-gas set",
  carbonDioxideSingleGas: "Carbon dioxide, within the stated single-gas set",
  chlorineSingleGas: "Chlorine, within the stated single-gas set",
  carbonDioxidePresent:
    "Carbon dioxide is present; other components are undetermined",
  pureCarbonDioxideMixture: "The entire mixture is pure carbon dioxide",
  cannotIdentify: "The record cannot identify a gas",
  splintStateAndChange: "Specify the initial glow and subsequent relighting",
  observedObject: "Name the liquid that changes appearance",
  bleaching: "Give the bleaching observation",
  combustionRole: "Distinguish supporting burning from being the fuel",
  reagentIdentity: "Correct the dissolved substance",
  methodAndResult: "Add the procedure as well as the result",
  noCorrectionNeeded: "The supplied answer needs no correction",
};
export function gasRecord(mode: GasMode, id: string) {
  return gasTestCases[mode]?.find((record) => record.id === id);
}
export function gasChoices(
  mode: GasMode,
  field: string,
  record?: string,
): readonly string[] {
  if (!(gasFields[mode] as readonly string[]).includes(field)) return [];
  if (field === "placement" && record) {
    const material = gasRecord(mode, record)?.expected.material;
    if (material === "limewater" || material === "water")
      return ["belowLiquid", "aboveLiquid", "away"];
    if (material === "dampBlueLitmus" || material === "dryBlueLitmus")
      return ["gasContact", "away"];
    if (material?.endsWith("Splint")) return ["mouth", "inside", "away"];
  }
  return choices[field] ?? [];
}
export function gasTargets(mode: GasMode, focus: GasFocus = "all"): string[] {
  return focus === "all"
    ? [...gasFields[mode]]
    : (gasFields[mode] as readonly string[]).includes(focus)
      ? [focus]
      : [];
}
export function initialGas(mode: GasMode, record: string): GasBoard {
  if (!gasRecord(mode, record)) throw Error("Unknown gas-test record.");
  return {
    record,
    ...Object.fromEntries(gasFields[mode].map((field) => [field, ""])),
  };
}
export function expectedGas(
  mode: GasMode,
  record: string,
): Record<string, string> {
  const source = gasRecord(mode, record);
  if (!source) throw Error("Unknown gas-test record.");
  return { ...source.expected };
}
const plain = (value: unknown): value is Record<string, unknown> =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;
export function validGas(
  mode: GasMode,
  value: unknown,
  lockedRecord?: string,
): value is GasBoard {
  if (
    !Object.hasOwn(gasFields, mode) ||
    !plain(value) ||
    typeof value.record !== "string" ||
    !gasRecord(mode, value.record) ||
    (lockedRecord !== undefined && value.record !== lockedRecord)
  )
    return false;
  const keys = ["record", ...gasFields[mode]];
  return (
    Object.keys(value).length === keys.length &&
    keys.every(
      (key) =>
        Object.hasOwn(value, key) &&
        typeof value[key] === "string" &&
        value[key].length <= 160,
    ) &&
    gasFields[mode].every(
      (field) =>
        value[field] === "" ||
        gasChoices(mode, field, value.record as string).includes(
          value[field] as string,
        ),
    )
  );
}
export function updateGas(
  mode: GasMode,
  board: GasBoard,
  field: string,
  value: string,
): GasBoard {
  if (
    !validGas(mode, board) ||
    !(gasFields[mode] as readonly string[]).includes(field)
  )
    throw Error("Unreadable gas-test proposal or unknown field.");
  const next = { ...board, [field]: value };
  if (!validGas(mode, next, board.record))
    throw Error("Invalid gas-test choice.");
  return next;
}
export function writeGas(mode: GasMode, board: GasBoard): string {
  if (!validGas(mode, board)) throw Error("Invalid gas-test proposal.");
  return JSON.stringify({ version: 1, mode, board });
}
export function readGas(
  raw: string,
  mode: GasMode,
  record: string,
): GasBoard | null {
  if (!raw) return initialGas(mode, record);
  if (raw.length > 4000) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return plain(value) &&
      Object.keys(value).length === 3 &&
      value.version === 1 &&
      value.mode === mode &&
      validGas(mode, value.board, record)
      ? value.board
      : null;
  } catch {
    return null;
  }
}
export function attemptedGas(
  raw: string,
  mode: GasMode,
  record: string,
  focus: GasFocus = "all",
): boolean {
  const board = readGas(raw, mode, record);
  return (
    !!board && gasTargets(mode, focus).some((field) => board[field] !== "")
  );
}
export type GasCheck = {
  correct: boolean;
  invalid: boolean;
  missing: string[];
  wrong: string[];
  message: string;
};
export function checkGas(
  mode: GasMode,
  board: GasBoard,
  focus: GasFocus = "all",
): GasCheck {
  const fields = gasTargets(mode, focus);
  if (!validGas(mode, board) || !fields.length)
    return {
      correct: false,
      invalid: true,
      missing: [],
      wrong: [],
      message:
        "This retained proposal cannot be read. Preserve it; explicitly clear only this proposal to start again.",
    };
  const expected = expectedGas(mode, board.record),
    missing = fields.filter((field) => board[field] === ""),
    wrong = fields.filter(
      (field) => board[field] !== "" && board[field] !== expected[field],
    ),
    correct = !missing.length && !wrong.length;
  return {
    correct,
    invalid: false,
    missing,
    wrong,
    message: correct
      ? gasRecord(mode, board.record)!.note
      : missing.length
        ? "Complete the asked choices before checking the full reasoning."
        : "The retained choices do not yet form the required test–observation–conclusion. Compare each choice with the original record.",
  };
}
export function validGasHistory(
  mode: GasMode,
  record: string,
  value: unknown,
): value is GasBoard[] {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > 500 ||
    !value.every((board) => validGas(mode, board, record))
  )
    return false;
  const equal = (a: GasBoard, b: GasBoard) =>
    Object.keys(a).every((key) => a[key] === b[key]);
  if (!equal(value[0], initialGas(mode, record))) return false;
  for (let index = 1; index < value.length; index++) {
    if (equal(value[index], initialGas(mode, record))) continue;
    if (
      gasFields[mode].filter(
        (field) => value[index][field] !== value[index - 1][field],
      ).length > 1
    )
      return false;
  }
  return true;
}
