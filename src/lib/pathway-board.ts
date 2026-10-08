import {
  additionCases,
  conditionCases,
  inferCases,
  ledgerCases,
  processCases,
  mapCases,
  pathwayRecords,
  originalCounts,
  originalHydrogens,
  reagentCounts,
  productCounts,
  expectedGroups,
  hydrationSites,
  relativeMass,
  emptyCounts,
  type PathwayMode,
  type AtomCounts,
  type Element,
  type AdditionCase,
  type NewGroup,
} from "./pathways";
export type PathwayBoard = Record<string, string>;
export function pathwayNumber(raw: string): number | null {
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
const groups: NewGroup[] = ["none", "H", "OH", "O", "Cl", "Br", "I"];
function enums(mode: PathwayMode): Record<string, string[]> {
  if (mode === "addition")
    return {
      site: ["", "0", "1", "2", "3"],
      bond: ["0", "1", "2"],
      leftNew: groups,
      rightNew: groups,
      ohH0: ["0", "1"],
      ohH1: ["0", "1"],
      byproduct: [
        "",
        "none",
        "water",
        "hydrogen",
        "carbonDioxide",
        "hydrogenBromide",
      ],
      extent: ["", "molecule", "polymer"],
      brackets: ["0", "1"],
      countMark: ["none", "n", "N", "inside"],
    };
  if (mode === "conditions")
    return {
      reaction: [
        "",
        "hydrogenation",
        "hydration",
        "halogenAddition",
        "noAddition",
        "fermentation",
        "substitution",
      ],
      catalyst: [
        "",
        "nickel",
        "phosphoricAcid",
        "yeast",
        "notRequired",
        "notSpecified",
      ],
      thermal: [
        "",
        "warmed",
        "heatedSteam",
        "ordinaryRoom",
        "UV",
        "notSpecified",
      ],
      pressure: ["", "pressurised", "ordinary", "notSpecified"],
      observation: [
        "",
        "orangeToColourless",
        "staysOrange",
        "colourlessToOrange",
        "notSpecified",
      ],
    };
  if (mode === "infer")
    return {
      reagent: [
        "",
        "hydrogen",
        "water",
        "chlorine",
        "bromine",
        "iodine",
        "hydrogenBromide",
      ],
      kind: [
        "",
        "addition",
        "substitution",
        "combustion",
        "polymerisation",
        "physical",
      ],
    };
  if (mode === "ledger")
    return {
      extent: ["", "molecule", "batch", "polymer"],
      family: [
        "",
        "saturatedHydrocarbon",
        "alcohol",
        "saturatedHalogenCompound",
        "alkene",
      ],
    };
  if (mode === "process")
    return {
      gas: ["", "ethene", "ethanol", "water", "allFeeds", "noGas"],
      liquid: ["", "ethanolAndWater", "ethanolOnly", "waterOnly", "none"],
      destination: ["", "reactor", "liquidProduct", "discard", "noStream"],
      cooling: [
        "",
        "physicalChange",
        "condensationReaction",
        "additionReaction",
      ],
      waterOrigin: ["", "unreactedFeed", "newByproduct", "carbonDioxide"],
    };
  return {
    product: [
      "",
      "ethanol",
      "ethane",
      "ethanoicAcid",
      "ethylEthanoate",
      "polyethene",
      "polyester",
      "carbonDioxide",
    ],
    method: [
      "",
      "hydration",
      "hydrogenation",
      "oxidation",
      "esterification",
      "fermentation",
      "additionPolymerisation",
      "condensationPolymerisation",
    ],
    feed: [
      "",
      "steam",
      "hydrogen",
      "oxidisingAgent",
      "ethanol",
      "yeast",
      "moreMonomers",
      "diol",
      "bromine",
    ],
    byproduct: ["", "none", "water", "carbonDioxide", "hydrogen"],
  };
}
function numericalKeys(mode: PathwayMode) {
  return mode === "infer"
    ? ["C", "H", "O", "Cl", "Br", "I"]
    : mode === "ledger"
      ? ["C", "H", "O", "Cl", "Br", "I", "Mr"]
      : mode === "process"
        ? ["etheneLeft", "waterLeft", "ethanol", "maximum"]
        : [];
}
export function initialPathwayBoard(
  mode: PathwayMode,
  record = "initial",
): PathwayBoard {
  return {
    record,
    ...Object.fromEntries(
      Object.entries(enums(mode)).map(([k, v]) => [k, v[0]]),
    ),
    ...Object.fromEntries(numericalKeys(mode).map((k) => [k, ""])),
  };
}
export function validPathwayBoard(
  mode: PathwayMode,
  value: unknown,
): value is PathwayBoard {
  if (
    !Object.hasOwn(pathwayRecords, mode) ||
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  )
    return false;
  const b = value as PathwayBoard,
    choices = enums(mode),
    nums = numericalKeys(mode),
    keys = ["record", ...Object.keys(choices), ...nums];
  return (
    Object.keys(b).length === keys.length &&
    keys.every((k) => Object.hasOwn(b, k) && typeof b[k] === "string") &&
    Object.hasOwn(pathwayRecords[mode], b.record) &&
    Object.entries(choices).every(([k, v]) => v.includes(b[k])) &&
    nums.every((k) => b[k].length <= 24) &&
    (mode !== "addition" ||
      b.site === "" ||
      Number(b.site) < additionCases[b.record].n - 1)
  );
}
export function pathwayHistoryStep(
  mode: PathwayMode,
  before: PathwayBoard,
  after: PathwayBoard,
) {
  if (!validPathwayBoard(mode, before) || !validPathwayBoard(mode, after))
    return false;
  const changed = Object.keys(before).filter(
    (k) => before[k] !== after[k],
  ).length;
  const pristine = Object.entries(
    initialPathwayBoard(mode, after.record),
  ).every(([k, v]) => after[k] === v);
  if (before.record !== after.record) return pristine;
  return changed === 1 || (changed > 0 && pristine);
}
export function validPathwayHistory(
  mode: PathwayMode,
  history: unknown,
): history is PathwayBoard[] {
  return (
    Array.isArray(history) &&
    history.length > 0 &&
    history.length <= 500 &&
    history.every(
      (b, i) =>
        validPathwayBoard(mode, b) &&
        (i === 0 || pathwayHistoryStep(mode, history[i - 1], b)),
    )
  );
}
export function expectedPathwayBoard(
  mode: PathwayMode,
  record = "initial",
): PathwayBoard {
  const b = initialPathwayBoard(mode, record);
  if (mode === "addition") {
    const r = additionCases[record],
      [leftNew, rightNew] = expectedGroups(r);
    return {
      ...b,
      site: String(r.double),
      bond: "1",
      leftNew,
      rightNew,
      ohH0: leftNew === "OH" ? "1" : "0",
      ohH1: rightNew === "OH" ? "1" : "0",
      byproduct: "none",
      extent: "molecule",
    };
  }
  if (mode === "conditions") {
    const r = conditionCases[record];
    return {
      ...b,
      reaction: r.reaction,
      catalyst: r.catalyst,
      thermal: r.thermal,
      pressure: r.pressure,
      observation: r.observation,
    };
  }
  if (mode === "infer") {
    const r = additionCases[inferCases[record].addition];
    return {
      ...b,
      ...Object.fromEntries(
        Object.entries(reagentCounts(r.reagent)).map(([k, v]) => [
          k,
          String(v),
        ]),
      ),
      reagent: r.reagent,
      kind: "addition",
    };
  }
  if (mode === "ledger") {
    const r = additionCases[ledgerCases[record].addition],
      a = productCounts(r);
    return {
      ...b,
      ...Object.fromEntries(Object.entries(a).map(([k, v]) => [k, String(v)])),
      Mr: String(relativeMass(a)),
      extent: "molecule",
      family:
        r.reagent === "hydrogen"
          ? "saturatedHydrocarbon"
          : r.reagent === "water"
            ? "alcohol"
            : "saturatedHalogenCompound",
    };
  }
  if (mode === "process") {
    const r = processCases[record],
      e = r.ethene - r.reacted,
      w = r.steam - r.reacted,
      p = r.reacted;
    return {
      ...b,
      etheneLeft: String(e),
      waterLeft: String(w),
      ethanol: String(p),
      maximum: String(Math.min(r.ethene, r.steam)),
      gas: e > 0 ? "ethene" : "noGas",
      liquid:
        p > 0
          ? w > 0
            ? "ethanolAndWater"
            : "ethanolOnly"
          : w > 0
            ? "waterOnly"
            : "none",
      destination: e > 0 ? "reactor" : "noStream",
      cooling: "physicalChange",
      waterOrigin: "unreactedFeed",
    };
  }
  const r = mapCases[record];
  return {
    ...b,
    product: r.goal,
    method: r.method,
    feed: r.feed,
    byproduct: r.byproduct,
  };
}
export function additionNewCounts(r: AdditionCase, b: PathwayBoard) {
  const a = emptyCounts();
  if (b.site === "" || Number(b.site) < 0 || Number(b.site) >= r.n - 1)
    return a;
  for (const [i, k] of ["leftNew", "rightNew"].entries()) {
    const g = b[k];
    if (g === "H") a.H++;
    else if (g === "OH" || g === "O") {
      a.O++;
      if (g === "OH" && b["ohH" + i] === "1") a.H++;
    } else if (g === "Cl" || g === "Br" || g === "I") a[g]++;
  }
  return a;
}
export function additionProposalCounts(r: AdditionCase, b: PathwayBoard) {
  const a = originalCounts(r),
    extra = additionNewCounts(r, b);
  for (const k of Object.keys(a) as Element[]) a[k] += extra[k];
  return a;
}
export function checkPathwayBoard(
  mode: PathwayMode,
  b: PathwayBoard,
): { correct: boolean; message: string } {
  if (!validPathwayBoard(mode, b))
    return {
      correct: false,
      message:
        "The original model state cannot be read. Its original bytes should be preserved; reset explicitly to start a new model.",
    };
  const id = b.record,
    e = expectedPathwayBoard(mode, id);
  if (mode === "addition") {
    const r = additionCases[id];
    if (b.site !== String(r.double))
      return {
        correct: false,
        message:
          "Locate the actual original C=C pair. A different C–C pair is not the addition site; retain all unreacted chain bonds.",
      };
    if (b.bond !== "1")
      return {
        correct: false,
        message:
          "In this addition, the original C=C becomes C–C. Keeping the double while adding new attachments can overfill carbon; deleting the carbon bond loses the original chain.",
      };
    const wanted = expectedGroups(r),
      chosen = [b.leftNew, b.rightNew];
    let right = chosen[0] === wanted[0] && chosen[1] === wanted[1];
    if (r.reagent === "water")
      right =
        chosen.filter((g) => g === "H").length === 1 &&
        chosen.filter((g) => g === "OH").length === 1 &&
        hydrationSites(r).includes(r.double + chosen.indexOf("OH"));
    if (!right)
      return {
        correct: false,
        message:
          r.reagent === "water"
            ? "Map one H and one OH across the original C=C pair, using the OH landing site specified for this structure. Two OH groups add an extra O; oxygen alone omits its H."
            : "Use the actual supplied atom pair: one new attachment belongs on each original C=C carbon. Original H and unreacted chain bonds stay.",
      };
    if (chosen.some((g, i) => g === "OH" && b["ohH" + i] !== "1"))
      return {
        correct: false,
        message:
          "The OH group includes its own O–H bond. Retain that H from water as well as the new H attached to the other carbon.",
      };
    if (b.byproduct !== "none")
      return {
        correct: false,
        message:
          "This small-molecule addition forms one product with all supplied atoms retained. Do not invent a water, H2 or carbon-dioxide byproduct.",
      };
    if (b.extent !== "molecule" || b.brackets !== "0" || b.countMark !== "none")
      return {
        correct: false,
        message:
          "The stated product is one discrete molecule with its terminal H atoms. Polymer repeat brackets/n are a different claim.",
      };
    return {
      correct: true,
      message:
        r.reason +
        " The actual selected product retains the supplied atoms and single C–C backbone.",
    };
  }
  const wrong = Object.keys(e).find(
    (k) =>
      k !== "record" &&
      (numericalKeys(mode).includes(k)
        ? pathwayNumber(b[k]) !== Number(e[k])
        : b[k] !== e[k]),
  );
  if (!wrong)
    return { correct: true, message: pathwayRecords[mode][id].reason };
  if (numericalKeys(mode).includes(wrong) && pathwayNumber(b[wrong]) === null)
    return {
      correct: false,
      message:
        "Keep your original entry, then enter an ordinary decimal number. Blank, unfinished and exponent strings are not silently counted as zero.",
    };
  if (mode === "infer")
    return {
      correct: false,
      message:
        "Compare the actual product with the original atom inventory, including O–H hydrogen. Infer the supplied reagent from that difference; do not invent a carbon loss or substitution.",
    };
  if (mode === "ledger")
    return {
      correct: false,
      message:
        wrong === "Mr"
          ? "Use every shown atom and the supplied Ar values, including both halogen atoms and any O–H hydrogen. This is Mr of one molecule."
          : wrong === "family"
            ? "A saturated alcohol or halogen-containing product is not a hydrocarbon. Losing C=C does not make every product an alkane."
            : "Count the shown original and added atoms, and keep this one-molecule claim separate from batch or polymer amounts.",
    };
  if (mode === "process")
    return {
      correct: false,
      message:
        wrong === "maximum"
          ? "The supply maximum is the smaller feed amount, but the observed reacted amount is separately given."
          : wrong === "waterOrigin" || wrong === "cooling"
            ? "Water in the cooled outlet can be unused steam. Physical condensation during cooling is different from a chemical condensation reaction producing new water."
            : "Use the reported single-pass reacted count: one ethene and one water produce one ethanol. Return unreacted ethene to the reactor; preserve the actual remaining water in the liquid.",
    };
  if (mode === "conditions")
    return { correct: false, message: conditionCases[id].reason };
  return {
    correct: false,
    message:
      mapCases[id].reason +
      " Check the supplied source, necessary extra feed, chosen product and any separately formed small molecule.",
  };
}
export interface PathwayDrawingData {
  caseId: string;
  note: string;
}
export function emptyPathwayDrawing(): PathwayBoard {
  return {
    n: "",
    ...Object.fromEntries(Array.from({ length: 4 }, (_, i) => ["b" + i, "0"])),
    ...Object.fromEntries(Array.from({ length: 5 }, (_, i) => ["h" + i, "0"])),
    ...Object.fromEntries(
      Array.from({ length: 5 }, (_, i) => ["x" + i, "none"]),
    ),
    ...Object.fromEntries(Array.from({ length: 5 }, (_, i) => ["o" + i, "0"])),
    ...Object.fromEntries(Array.from({ length: 5 }, (_, i) => ["oh" + i, "0"])),
    brackets: "0",
    countMark: "none",
  };
}
export function readPathwayDrawing(raw: string): PathwayBoard | null {
  try {
    const b = JSON.parse(raw),
      keys = Object.keys(emptyPathwayDrawing());
    if (
      !b ||
      typeof b !== "object" ||
      Array.isArray(b) ||
      Object.keys(b).length !== keys.length ||
      !keys.every((k) => Object.hasOwn(b, k) && typeof b[k] === "string")
    )
      return null;
    return keys.every((k) =>
      (k === "n"
        ? ["", "2", "3", "4", "5"]
        : k === "countMark"
          ? ["none", "n", "N", "inside"]
          : k === "brackets" || k.startsWith("o")
            ? ["0", "1"]
            : k.startsWith("b")
              ? ["0", "1", "2"]
              : k.startsWith("h")
                ? ["0", "1", "2", "3", "4"]
                : ["none", "Cl", "Br", "I", "Cl2", "Br2", "I2"]
      ).includes(b[k]),
    )
      ? b
      : null;
  } catch {
    return null;
  }
}
export function sourcePathwayDrawing(caseId: string): PathwayBoard {
  const r = additionCases[caseId],
    b = emptyPathwayDrawing();
  b.n = String(r.n);
  originalHydrogens(r).forEach((h, i) => (b["h" + i] = String(h)));
  for (let i = 0; i < r.n - 1; i++) b["b" + i] = i === r.double ? "2" : "1";
  return b;
}
export function referencePathwayDrawing(caseId: string): PathwayBoard {
  const r = additionCases[caseId],
    b = emptyPathwayDrawing(),
    hydrogen = Array.from({ length: r.n }, (_, i) =>
      i === 0 || i === r.n - 1 ? 3 : 2,
    );
  b.n = String(r.n);
  for (let i = 0; i < r.n - 1; i++) b["b" + i] = "1";
  if (r.reagent === "water") {
    const i = r.ohIndex!;
    hydrogen[i]--;
    b["o" + i] = "1";
    b["oh" + i] = "1";
  } else if (r.reagent !== "hydrogen") {
    const x =
      r.reagent === "chlorine" ? "Cl" : r.reagent === "bromine" ? "Br" : "I";
    for (const i of [r.double, r.double + 1]) {
      hydrogen[i]--;
      b["x" + i] = x;
    }
  }
  for (let i = 0; i < r.n; i++) b["h" + i] = String(hydrogen[i]);
  return b;
}
export function pathwayDrawingAtoms(b: PathwayBoard): AtomCounts {
  const a = emptyCounts();
  a.C = Number(b.n);
  for (let i = 0; i < a.C; i++) {
    a.H += Number(b["h" + i]);
    if (b["o" + i] === "1") {
      a.O++;
      if (b["oh" + i] === "1") a.H++;
    }
    const x = b["x" + i];
    if (x !== "none") {
      const element = x.replace("2", "") as Element;
      a[element] += x.endsWith("2") ? 2 : 1;
    }
  }
  return a;
}
export function describePathwayDrawing(raw: string) {
  const b = readPathwayDrawing(raw);
  if (!b)
    return "Original saved structure cannot be read; it remains retained.";
  return `Your chosen scaffold: ${b.n || "no"} carbons; chosen atom inventory ${
    Object.entries(pathwayDrawingAtoms(b))
      .filter(([, v]) => v)
      .map(([e, v]) => v + " " + e)
      .join(", ") || "none"
  }. Inspect the actual retained drawing and notation.`;
}
