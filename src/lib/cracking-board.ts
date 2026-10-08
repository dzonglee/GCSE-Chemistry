import {
  crackingRecords,
  rearrangements,
  alkeneStructures,
  crackingBalances,
  bromineReports,
  crackingProcesses,
  carbonBondOrder,
  canonicalHydrogens,
  mirroredDouble,
  type CrackingMode,
} from "./cracking";
export type CrackingBoard = Record<string, string>;
function fields(mode: CrackingMode, id: string) {
  if (mode === "rearrange")
    return [
      "record",
      "cut",
      "phase",
      "molecules",
      "carbon",
      "hydrogen",
      "change",
    ];
  if (mode === "structure")
    return [
      "record",
      "double",
      ...Array.from({ length: alkeneStructures[id].n * 4 }, (_, i) => "h" + i),
      "hydrogens",
      "name",
      "saturated",
    ];
  if (mode === "balance")
    return crackingBalances[id].kind === "formula"
      ? ["record", "carbons", "hydrogens"]
      : ["record", "feed", "alkane", "alkene"];
  if (mode === "bromine")
    return [
      "record",
      "showBlank",
      "showPositive",
      "showSample",
      "sampleAfter",
      "verdict",
      "evidence",
      "limitation",
    ];
  return ["record", "process", "heat", "contact", "change", "reason", "use"];
}
export function initialCrackingBoard(
  mode: CrackingMode,
  id = "initial",
): CrackingBoard {
  if (!Object.hasOwn(crackingRecords[mode], id))
    throw Error("Unknown supplied case");
  const b = Object.fromEntries(fields(mode, id).map((k) => [k, ""]));
  b.record = id;
  if (mode === "rearrange") {
    b.cut = "1";
    b.phase = "before";
  }
  if (mode === "structure")
    for (const k of Object.keys(b)) if (/^h\d+$/.test(k)) b[k] = "no";
  if (mode === "bromine")
    for (const k of ["showBlank", "showPositive", "showSample"]) b[k] = "no";
  return b;
}
function choices(mode: CrackingMode, id: string): Record<string, string[]> {
  if (mode === "rearrange")
    return {
      cut: Array.from({ length: rearrangements[id].n - 2 }, (_, i) =>
        String(i + 1),
      ),
      phase: ["before", "after"],
      change: ["", "physical", "chemical"],
    };
  if (mode === "structure")
    return {
      double: [
        "",
        ...Array.from({ length: alkeneStructures[id].n - 1 }, (_, i) =>
          String(i),
        ),
      ],
      ...Object.fromEntries(
        Array.from({ length: alkeneStructures[id].n * 4 }, (_, i) => [
          "h" + i,
          ["yes", "no"],
        ]),
      ),
      name: ["", "ethene", "propene", "butene", "pentene"],
      saturated: ["", "yes", "no"],
    };
  if (mode === "bromine")
    return {
      showBlank: ["yes", "no"],
      showPositive: ["yes", "no"],
      showSample: ["yes", "no"],
      sampleAfter: ["", "orange", "colourless"],
      verdict: [
        "",
        "alkeneSupported",
        "alkaneSupported",
        "unsaturationPresent",
        "unreliable",
      ],
      evidence: [
        "",
        "sampleLosesColour",
        "sampleKeepsColour",
        "blankLosesColour",
        "knownAlkeneKeepsColour",
        "initialColourless",
      ],
      limitation: [
        "",
        "suppliedCandidateClasses",
        "notEveryMolecule",
        "reagentChangedWithoutSample",
        "failedPositiveControl",
        "noOriginalBromineColour",
      ],
    };
  if (mode === "process")
    return {
      process: ["", "cracking", "distillation", "polymerisation", "combustion"],
      heat: [
        "",
        "high",
        "room",
        "warm",
        "heatAndCool",
        "ignition",
        "notSpecified",
      ],
      contact: ["", "catalyst", "steam", "none", "oxygen", "notSpecified"],
      change: ["", "physical", "chemical"],
      reason: [
        "",
        "bondsRearranged",
        "sameMolecules",
        "joinMolecules",
        "oxidisedProducts",
        "atomsCreated",
      ],
      use: [
        "",
        "fuel",
        "chemicalFeedstock",
        "collectFraction",
        "material",
        "energy",
      ],
    };
  return {};
}
export function validCrackingBoard(
  mode: CrackingMode,
  value: unknown,
): value is CrackingBoard {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as CrackingBoard;
  if (
    typeof b.record !== "string" ||
    !Object.hasOwn(crackingRecords[mode], b.record)
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
export function crackingHistoryStep(
  mode: CrackingMode,
  previous: unknown,
  next: unknown,
) {
  if (!validCrackingBoard(mode, previous) || !validCrackingBoard(mode, next))
    return false;
  if (previous.record !== next.record)
    return Object.entries(initialCrackingBoard(mode, next.record)).every(
      ([k, v]) => next[k] === v,
    );
  const changed = Object.keys(previous).filter((k) => previous[k] !== next[k]);
  if (changed.length === 1) return true;
  if (
    mode === "balance" &&
    crackingBalances[next.record].kind === "coefficients" &&
    changed.length === 3 &&
    changed.every((k) => ["feed", "alkane", "alkene"].includes(k))
  ) {
    for (const factor of [2, 0.5])
      if (
        ["feed", "alkane", "alkene"].every(
          (k) =>
            previous[k] !== "" &&
            Number(previous[k]) > 0 &&
            next[k] === String(Number(previous[k]) * factor) &&
            Number.isInteger(Number(next[k])) &&
            Number(next[k]) > 0,
        )
      )
        return true;
  }
  return false;
}
export function expectedCrackingBoard(
  mode: CrackingMode,
  id = "initial",
): CrackingBoard {
  const b = initialCrackingBoard(mode, id);
  if (mode === "rearrange") {
    const r = rearrangements[id];
    return {
      ...b,
      cut: String(r.k),
      phase: "after",
      molecules: "2",
      carbon: String(r.n),
      hydrogen: String(2 * r.n + 2),
      change: "chemical",
    };
  }
  if (mode === "structure") {
    const r = alkeneStructures[id];
    b.double = String(r.double);
    for (let c = 0; c < r.n; c++)
      for (const slot of canonicalHydrogens(r.n, r.double, c))
        b["h" + (c * 4 + slot)] = "yes";
    return { ...b, hydrogens: String(2 * r.n), name: r.name, saturated: "no" };
  }
  if (mode === "balance") {
    const r = crackingBalances[id];
    return r.kind === "formula"
      ? { ...b, carbons: String(r.alkene[0]), hydrogens: String(r.alkene[1]) }
      : {
          ...b,
          feed: String(r.ratio[0]),
          alkane: String(r.ratio[1]),
          alkene: String(r.ratio[2]),
        };
  }
  if (mode === "bromine") {
    const r = bromineReports[id];
    return {
      ...b,
      showBlank: "yes",
      showPositive: "yes",
      showSample: "yes",
      sampleAfter: r.sample,
      verdict: r.verdict,
      evidence: r.evidence,
      limitation: r.limitation,
    };
  }
  const r = crackingProcesses[id];
  return {
    ...b,
    process: r.process,
    heat: r.heat,
    contact: r.contacts[0],
    change: r.change,
    reason: r.reason,
    use: r.use,
  };
}
export function structureValences(n: number, b: CrackingBoard) {
  const double = b.double === "" ? null : Number(b.double);
  return Array.from({ length: n }, (_, c) => {
    const hydrogens = [0, 1, 2, 3].filter(
        (slot) => b["h" + (c * 4 + slot)] === "yes",
      ).length,
      carbon = carbonBondOrder(n, double, c);
    return { carbon: carbon, hydrogens, total: carbon + hydrogens };
  });
}
export function crackingBalanceTotals(id: string, b: CrackingBoard) {
  const r = crackingBalances[id],
    ratio =
      r.kind === "formula"
        ? r.ratio
        : [Number(b.feed), Number(b.alkane), Number(b.alkene)],
    alkene =
      r.kind === "formula"
        ? [Number(b.carbons), Number(b.hydrogens)]
        : r.alkene;
  return {
    before: [r.feed[0] * ratio[0], r.feed[1] * ratio[0]],
    after: [
      r.alkane[0] * ratio[1] + alkene[0] * ratio[2],
      r.alkane[1] * ratio[1] + alkene[1] * ratio[2],
    ],
  };
}
export function checkCrackingBoard(
  mode: CrackingMode,
  value: unknown,
): { correct: boolean; message: string } {
  if (!validCrackingBoard(mode, value))
    return {
      correct: false,
      message:
        "Keep your original proposal. Enter the supplied whole-number counts and known choices; fractions, exponents or incomplete raw entries cannot replace accepted atom counts.",
    };
  const b = value,
    id = b.record,
    e = expectedCrackingBoard(mode, id);
  let correct = false;
  if (mode === "structure") {
    const r = alkeneStructures[id],
      counts = structureValences(r.n, b),
      h = counts.reduce((sum, x) => sum + x.hydrogens, 0);
    correct =
      b.double !== "" &&
      [r.double, mirroredDouble(r.n, r.double)].includes(Number(b.double)) &&
      counts.every((x) => x.total === 4) &&
      h === 2 * r.n &&
      b.hydrogens === String(h) &&
      b.name === r.name &&
      b.saturated === "no";
  } else if (
    mode === "balance" &&
    crackingBalances[id].kind === "coefficients"
  ) {
    const t = crackingBalanceTotals(id, b);
    correct =
      [b.feed, b.alkane, b.alkene].every((x) => x !== "" && Number(x) > 0) &&
      t.before.every((v, i) => v === t.after[i]);
  } else
    correct = Object.entries(e).every(([k, v]) =>
      mode === "process" && k === "contact"
        ? crackingProcesses[id].contacts.includes(b[k])
        : b[k] === v,
    );
  const success: Record<CrackingMode, string> = {
    rearrange:
      "The requested complete before/after structures preserve every original C/H atom while changing bonds and producing two represented molecules. Other real cracking routes can differ.",
    structure:
      "The supplied C=C position (or its reversed-chain equivalent), every local carbon valence, total hydrogen count and provided name agree. Displayed H orientations are conventions, not a unique molecular geometry.",
    balance:
      "Your supplied cracking equation conserves C and H. Coefficients multiply whole formulas; valid balanced multiples remain valid and a repeated alkene coefficient represents separate molecules.",
    bromine:
      "Your colour result and conclusion match the original supplied observations and their limits. A positive mixture result identifies unsaturation being present, not every molecule or a unique product formula.",
    process:
      "Your selected process, general conditions, type of change and purpose match the original stated goal. Cracking changes bonding; distillation preserves the existing molecules.",
  };
  const repair: Record<CrackingMode, string> = {
    rearrange:
      "Keep the proposal. Match the requested alkane carbon count, compare AFTER, preserve the total C/H inventory and distinguish a bond rearrangement from physical separation. A cut alone leaves incomplete valences.",
    structure:
      "Keep the drawing. A double C–C bond counts twice at EACH carbon; complete every neutral carbon to four and each H to one. Match the supplied double-bond position (either reversed-chain orientation is valid), not just the total H count.",
    balance:
      "Keep the original formulas. Count BOTH products’ C and H atoms, include repeated molecules, and change coefficients rather than subscripts when formulas are supplied. For missing formulas, use the stated reaction amounts.",
    bromine:
      "Use the ORIGINAL reagent colour, matched blank, known alkene reference and sample observations. Distinguish a demonstrated orange→colourless change, an unreliable control and a limited mixture inference.",
    process:
      "Return to the ORIGINAL target. Separation preserves molecules; cracking needs high temperature with the permitted catalyst/steam route and forms new smaller hydrocarbons. Joining molecules and burning fuel serve different purposes.",
  };
  return { correct, message: correct ? success[mode] : repair[mode] };
}
