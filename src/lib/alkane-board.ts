import {
  alkaneRecords,
  alkaneKits,
  alkaneFormulae,
  alkaneGraphs,
  alkaneEquations,
  alkaneOxygen,
  alkaneEvidence,
  attachmentRequired,
  graphFacts,
  completeRatio,
  type AlkaneMode,
} from "./alkanes";
export type AlkaneBoard = Record<string, string>;
function fields(mode: AlkaneMode, id: string) {
  if (mode === "kit")
    return [
      "record",
      ...Array.from({ length: alkaneKits[id].n * 4 }, (_, i) => "h" + i),
      "hydrogens",
      "name",
      "saturated",
    ];
  if (mode === "formula")
    return [
      "record",
      "n",
      "twice",
      "hydrogens",
      "nextHydrogens",
      "difference",
      "name",
    ];
  if (mode === "classify")
    return [
      "record",
      "carbons",
      "hydrogens",
      "multiple",
      "classification",
      "openSeries",
      "reason",
    ];
  if (mode === "equation")
    return [
      "record",
      "carbonProduct",
      "hydrogenProduct",
      "fuel",
      "oxygen",
      "carbon",
      "water",
    ];
  if (mode === "oxygen")
    return ["record", "co2", "co", "soot", "water", "used", "left"];
  return ["record", "conclusion", "evidence", "limitation", "coEffect"];
}
export function initialAlkaneBoard(
  mode: AlkaneMode,
  id = "initial",
): AlkaneBoard {
  if (!Object.hasOwn(alkaneRecords[mode], id))
    throw Error("Unknown supplied record");
  const b = Object.fromEntries(fields(mode, id).map((k) => [k, ""]));
  b.record = id;
  if (mode === "kit")
    for (const k of Object.keys(b)) if (/^h\d+$/.test(k)) b[k] = "no";
  return b;
}
function choices(mode: AlkaneMode, id: string): Record<string, string[]> {
  if (mode === "kit")
    return {
      ...Object.fromEntries(
        Array.from({ length: alkaneKits[id].n * 4 }, (_, i) => [
          "h" + i,
          ["yes", "no"],
        ]),
      ),
      name: ["", "methane", "ethane", "propane", "butane", "pentane", "hexane"],
      saturated: ["", "yes", "no"],
    };
  if (mode === "formula")
    return {
      name: [
        "",
        "methane",
        "ethane",
        "propane",
        "butane",
        "hexane",
        "undecane",
      ],
    };
  if (mode === "classify")
    return {
      classification: ["", "saturated", "unsaturated", "notHydrocarbon"],
      openSeries: ["", "yes", "no"],
      reason: [
        "",
        "singleOpen",
        "multipleCarbon",
        "otherElement",
        "ring",
        "branchAllowed",
        "noCarbon",
      ],
    };
  if (mode === "equation")
    return {
      carbonProduct: ["", "CO2", "CO", "C"],
      hydrogenProduct: ["", "H2O", "H2"],
    };
  if (mode === "evidence")
    return {
      conclusion: ["", "complete", "incomplete", "insufficient"],
      evidence: [
        "",
        "coPositive",
        "carbonPositive",
        "partialProducts",
        "allCarbonCo2",
        "flameOnly",
        "appearanceOnly",
      ],
      limitation: [
        "",
        "noSmellTest",
        "coUnknown",
        "othersNotExcluded",
        "statedAnalysis",
        "notGasAnalysis",
      ],
      coEffect: [
        "",
        "oxygenCarriage",
        "carbonDioxideOnly",
        "smellWarns",
        "createsOxygen",
      ],
    };
  return {};
}
export function validAlkaneBoard(
  mode: AlkaneMode,
  value: unknown,
): value is AlkaneBoard {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as AlkaneBoard;
  if (
    typeof b.record !== "string" ||
    !Object.hasOwn(alkaneRecords[mode], b.record)
  )
    return false;
  const keys = fields(mode, b.record);
  if (
    Object.keys(b).length !== keys.length ||
    !keys.every((k) => Object.hasOwn(b, k) && typeof b[k] === "string")
  )
    return false;
  const allowed = choices(mode, b.record);
  for (const k of keys) {
    if (k === "record") continue;
    if (allowed[k]) {
      if (!allowed[k].includes(b[k])) return false;
    } else if (
      b[k] !== "" &&
      (!/^(?:0|[1-9]\d*)$/.test(b[k]) || Number(b[k]) > 1000)
    )
      return false;
  }
  return true;
}
export function alkaneHistoryStep(
  mode: AlkaneMode,
  previous: unknown,
  next: unknown,
) {
  if (!validAlkaneBoard(mode, previous) || !validAlkaneBoard(mode, next))
    return false;
  if (previous.record !== next.record)
    return Object.entries(initialAlkaneBoard(mode, next.record)).every(
      ([k, v]) => next[k] === v,
    );
  return Object.keys(next).filter((k) => next[k] !== previous[k]).length === 1;
}
export function expectedAlkaneBoard(
  mode: AlkaneMode,
  id = "initial",
): AlkaneBoard {
  const b = initialAlkaneBoard(mode, id);
  if (mode === "kit") {
    const r = alkaneKits[id];
    for (let c = 0; c < r.n; c++)
      for (let slot = 0; slot < 4; slot++)
        b["h" + (c * 4 + slot)] = attachmentRequired(r.n, c, slot)
          ? "yes"
          : "no";
    return {
      ...b,
      hydrogens: String(2 * r.n + 2),
      name: r.name,
      saturated: "yes",
    };
  }
  if (mode === "formula") {
    const r = alkaneFormulae[id];
    return {
      ...b,
      n: String(r.n),
      twice: String(2 * r.n),
      hydrogens: String(2 * r.n + 2),
      nextHydrogens: String(2 * r.n + 4),
      difference: "2",
      name: r.name,
    };
  }
  if (mode === "classify") {
    const r = alkaneGraphs[id],
      f = graphFacts(r);
    return {
      ...b,
      carbons: String(f.carbons),
      hydrogens: String(f.hydrogens),
      multiple: String(f.multiple),
      classification: !f.hydrocarbon
        ? "notHydrocarbon"
        : f.saturated
          ? "saturated"
          : "unsaturated",
      openSeries: f.openAlkane ? "yes" : "no",
      reason: r.reasons[0],
    };
  }
  if (mode === "equation") {
    const r = completeRatio(alkaneEquations[id].n);
    return {
      ...b,
      carbonProduct: "CO2",
      hydrogenProduct: "H2O",
      fuel: String(r.fuel),
      oxygen: String(r.oxygen),
      carbon: String(r.carbon),
      water: String(r.water),
    };
  }
  if (mode === "oxygen") {
    const e = alkaneOxygen[id].example;
    return {
      ...b,
      co2: String(e[0]),
      co: String(e[1]),
      soot: String(e[2]),
      water: String(e[3]),
      used: String(e[4]),
      left: String(e[5]),
    };
  }
  const r = alkaneEvidence[id];
  return {
    ...b,
    conclusion: r.conclusion,
    evidence: r.evidence,
    limitation: r.limitation,
    coEffect: "oxygenCarriage",
  };
}
export function equationTotals(n: number, b: AlkaneBoard) {
  const fuel = Number(b.fuel),
    oxygen = Number(b.oxygen),
    carbon = Number(b.carbon),
    water = Number(b.water);
  return {
    before: [n * fuel, (2 * n + 2) * fuel, 2 * oxygen],
    after: [
      carbon,
      b.hydrogenProduct === "H2" || b.hydrogenProduct === "H2O" ? 2 * water : 0,
      (b.carbonProduct === "CO2" ? 2 : b.carbonProduct === "CO" ? 1 : 0) *
        carbon +
        (b.hydrogenProduct === "H2O" ? water : 0),
    ],
  };
}
export function oxygenTotals(id: string, b: AlkaneBoard) {
  const r = alkaneOxygen[id];
  return {
    before: [r.n * r.fuel, (2 * r.n + 2) * r.fuel, 2 * r.available],
    after: [
      Number(b.co2) + Number(b.co) + Number(b.soot),
      2 * Number(b.water),
      2 * Number(b.co2) + Number(b.co) + Number(b.water) + 2 * Number(b.left),
    ],
    usedOxygenAtoms: 2 * Number(b.co2) + Number(b.co) + Number(b.water),
  };
}
export function checkAlkaneBoard(
  mode: AlkaneMode,
  value: unknown,
): { correct: boolean; message: string } {
  if (!validAlkaneBoard(mode, value))
    return {
      correct: false,
      message:
        "Keep the raw draft and enter ordinary non-negative whole numbers or the labelled choices. Fractions, signs, leading zeroes and scientific notation are not saved molecule counts.",
    };
  const b = value,
    id = b.record,
    expected = expectedAlkaneBoard(mode, id);
  let correct = false;
  if (mode === "equation") {
    const totals = equationTotals(alkaneEquations[id].n, b);
    correct =
      b.carbonProduct === "CO2" &&
      b.hydrogenProduct === "H2O" &&
      [b.fuel, b.oxygen, b.carbon, b.water].every(
        (x) => x !== "" && Number(x) > 0,
      ) &&
      totals.before.every((v, i) => v === totals.after[i]);
  } else if (mode === "oxygen") {
    const r = alkaneOxygen[id],
      totals = oxygenTotals(id, b);
    correct =
      [b.co2, b.co, b.soot, b.water, b.used, b.left].every((x) => x !== "") &&
      totals.before.every((v, i) => v === totals.after[i]) &&
      Number(b.used) + Number(b.left) === r.available &&
      2 * Number(b.used) === totals.usedOxygenAtoms &&
      (r.condition !== "complete" ||
        (Number(b.co) === 0 && Number(b.soot) === 0));
  } else
    correct = Object.entries(expected).every(([k, v]) =>
      k === "reason" && mode === "classify"
        ? alkaneGraphs[id].reasons.includes(b[k])
        : b[k] === v,
    );
  const messages: Record<AlkaneMode, [string, string]> = {
    kit: [
      "The proposed neutral alkane gives every carbon four single covalent bonds and each attached hydrogen one. The count and required/supplied name agree.",
      "Count C–C bonds already used by each carbon, then repair its H attachments. A neutral carbon needs FOUR bonds; do not attach an extra H along an existing C–C direction. Count the proposed atoms, name the first four correctly and distinguish saturated from concentrated.",
    ],
    formula: [
      "The chosen n, 2n and 2n + 2 agree with the original givens. Neighbouring members add CH₂: two more hydrogens for one more carbon.",
      "n is the carbon count in ONE molecule. For an inverse case subtract two hydrogens, then divide by two. Multiply before adding, and compare neighbouring formulas rather than entire different molecules.",
    ],
    classify: [
      "The classifications use the actual elements, C–C bonds and ring/open-chain evidence. A provided branch is allowed; a supplied all-single-bond ring is saturated but outside CₙH₂ₙ₊₂.",
      "Inspect ALL elements and every C–C bond. No carbon means no hydrocarbon. Oxygen-containing molecules are not hydrocarbons. Saturated does not mean unbranched, and a ring can alter the formula without adding a C=C bond.",
    ],
    equation: [
      "Both complete-combustion products and every C/H/O total balance. Positive balanced multiples are chemically valid; the original molecular subscripts stay fixed.",
      "Complete hydrocarbon combustion forms BOTH CO₂ and water. Choose those identities, then balance C, H and finally oxygen in BOTH products. One O₂ contains two O atoms. Use coefficients, not changed fuel subscripts.",
    ],
    oxygen: [
      "This allocation conserves the stated C/H/O inventory and accounts separately for used and unused O₂. Where information permits, other balanced carbon-product mixtures are also valid. It is a simple teaching balance, not a unique prediction of real exhaust.",
      "Count all fuel molecules. In this stated model all their hydrogen is represented as water. Carbon may be allocated among CO₂, CO and soot when oxygen is limited; total C/H/O must be conserved and used + unused O₂ must equal the original supply. The complete record specifically requires all carbon in CO₂.",
    ],
    evidence: [
      "The conclusion matches the supplied evidence and its limits. CO binds haemoglobin and reduces oxygen carriage; colour/smell cannot show it is absent. Written scientific explanations still need self-review.",
      "Positive CO or identified carbon soot supports incomplete combustion. CO₂ and water alone, a flame colour, or no smell do not exclude other products. Only the declared full carbon account supports the complete case. CO is colourless, odourless and toxic.",
    ],
  };
  return { correct, message: messages[mode][correct ? 0 : 1] };
}
