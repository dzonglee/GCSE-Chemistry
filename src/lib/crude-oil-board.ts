import {
  oilRecords,
  oilInventories,
  oilColumns,
  oilTraces,
  oilTrends,
  oilUses,
  oilYields,
  isHydrocarbon,
  hydrocarbonCount,
  columnOrder,
  groupOrder,
  traceOutcome,
  trendOrder,
  fractionUses,
  fractionMass,
  yieldPreference,
  type OilMode,
} from "./crude-oil";
export type OilBoard = Record<string, string>;
const numerical = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
const number = (s: string) =>
  numerical.test(s) && Number.isFinite(Number(s)) && Number(s) <= 100000;
function fields(mode: OilMode, id: string): string[] {
  if (mode === "inventory")
    return [
      "record",
      ...oilInventories[id].components.map((_, i) => "include" + i),
      "compounds",
      "hydrocarbons",
      "purity",
      "process",
    ];
  if (mode === "column")
    return [
      "record",
      "temp0",
      "temp1",
      "temp2",
      "temp3",
      "group0",
      "group1",
      "group2",
      "gradient",
      "process",
    ];
  if (mode === "trace")
    return ["record", "step", "feedPhase", "path", "tray", "phase", "identity"];
  if (mode === "trends")
    return [
      "record",
      "order0",
      "order1",
      "order2",
      "order3",
      "boiling",
      "viscosity",
      "ignition",
      "explanation",
      "span",
    ];
  if (mode === "uses")
    return [
      "record",
      "use0",
      "use1",
      "use2",
      "use3",
      "use4",
      "use5",
      "category",
      "property",
    ];
  return [
    "record",
    "barA",
    "barB",
    "drawnA",
    "drawnB",
    "placedA",
    "placedB",
    "massA",
    "massB",
    "preference",
    "interpretation",
    "scaleStep",
    "selected",
  ];
}
export function initialOilBoard(mode: OilMode, id = "initial"): OilBoard {
  if (!Object.hasOwn(oilRecords[mode], id)) throw Error("Unknown oil record");
  const b = Object.fromEntries(fields(mode, id).map((k) => [k, ""]));
  b.record = id;
  if (mode === "inventory")
    for (const k of Object.keys(b)) if (k.startsWith("include")) b[k] = "no";
  if (mode === "trace") b.step = "0";
  if (mode === "trends") for (let i = 0; i < 4; i++) b["order" + i] = String(i);
  if (mode === "yield") {
    b.placedA = "no";
    b.placedB = "no";
    b.drawnA = "0";
    b.drawnB = "0";
    b.selected = "A";
  }
  return b;
}
function choices(mode: OilMode, id: string): Record<string, string[]> {
  if (mode === "inventory")
    return {
      ...Object.fromEntries(
        oilInventories[id].components.map((_, i) => [
          "include" + i,
          ["yes", "no"],
        ]),
      ),
      purity: ["", "mixture", "pure"],
      process: ["", "physical", "cracking", "newSubstances"],
    };
  if (mode === "column")
    return {
      ...Object.fromEntries(
        [0, 1, 2, 3].map((i) => [
          "temp" + i,
          ["", ...oilColumns[id].temperatures.map(String)],
        ]),
      ),
      ...Object.fromEntries(
        [0, 1, 2].map((i) => ["group" + i, ["", "0", "1", "2"]]),
      ),
      gradient: ["", "coolerUp", "hotterUp", "flat"],
      process: ["", "vaporCondense", "breakBonds", "filter"],
    };
  if (mode === "trace")
    return {
      step: Array.from({ length: 7 }, (_, i) => String(i)),
      feedPhase: ["", "gas", "liquid"],
      path: ["", "condensed", "topGas", "residue"],
      phase: ["", "liquid", "gas"],
      identity: ["", "unchanged", "broken", "newFormula"],
    };
  if (mode === "trends")
    return {
      ...Object.fromEntries(
        [0, 1, 2, 3].map((i) => ["order" + i, ["0", "1", "2", "3"]]),
      ),
      boiling: ["", "higher", "lower", "same"],
      viscosity: ["", "higher", "lower", "same"],
      ignition: ["", "higher", "lower", "same"],
      explanation: ["", "intermolecular", "covalentBroken", "atomsLarger"],
    };
  if (mode === "uses")
    return {
      ...Object.fromEntries(
        [0, 1, 2, 3, 4, 5].map((i) => ["use" + i, ["", ...fractionUses]]),
      ),
      category: ["", "fuel", "material", "feedstock"],
      property: [
        "",
        "ignitesReadily",
        "suitableBoilingRange",
        "viscousSurface",
        "engineSuitability",
        "burnedEnergy",
        "processedMaterials",
      ],
    };
  return {
    placedA: ["yes", "no"],
    placedB: ["yes", "no"],
    preference: ["", "A", "B", "equal"],
    interpretation: ["", "criterion", "alwaysMore", "density"],
    selected: ["A", "B"],
  };
}
export function validOilBoard(
  mode: OilMode,
  value: unknown,
): value is OilBoard {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as OilBoard;
  if (
    typeof b.record !== "string" ||
    !Object.hasOwn(oilRecords[mode], b.record)
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
    } else if (b[k] !== "" && !number(b[k])) return false;
  }
  if (
    mode === "trends" &&
    new Set([b.order0, b.order1, b.order2, b.order3]).size !== 4
  )
    return false;
  if (
    mode === "trace" &&
    b.tray !== "" &&
    (!/^\d$/.test(b.tray) || Number(b.tray) > oilTraces[b.record].trays.length)
  )
    return false;
  return true;
}
export function oilHistoryStep(
  mode: OilMode,
  previous: unknown,
  next: unknown,
): boolean {
  if (!validOilBoard(mode, previous) || !validOilBoard(mode, next))
    return false;
  if (previous.record !== next.record)
    return Object.entries(initialOilBoard(mode, next.record)).every(
      ([k, v]) => next[k] === v,
    );
  const changed = Object.keys(previous).filter((k) => previous[k] !== next[k]);
  if (mode === "yield") {
    for (const source of ["A", "B"]) {
      const drawn = "drawn" + source,
        placed = "placed" + source;
      if (
        changed.length > 0 &&
        changed.every((k) => k === drawn || k === placed)
      )
        return (
          next[placed] === "yes" &&
          previous["bar" + source] !== "" &&
          Number(previous["bar" + source]) <= oilYields[previous.record].max &&
          next[drawn] === previous["bar" + source]
        );
      if (
        changed.length === 2 &&
        changed.includes("selected") &&
        changed.includes("bar" + source)
      )
        return next.selected === source;
    }
  }
  if (changed.length === 1) return !changed[0].startsWith("order");
  if (
    mode === "trends" &&
    changed.length === 2 &&
    changed.every((k) => /^order[0-3]$/.test(k))
  ) {
    const [a, b] = changed;
    return (
      Math.abs(Number(a.slice(5)) - Number(b.slice(5))) === 1 &&
      previous[a] === next[b] &&
      previous[b] === next[a]
    );
  }
  return false;
}
export function expectedOilBoard(mode: OilMode, id = "initial"): OilBoard {
  const b = initialOilBoard(mode, id);
  if (mode === "inventory") {
    const r = oilInventories[id];
    r.components.forEach(
      (c, i) => (b["include" + i] = isHydrocarbon(c) ? "yes" : "no"),
    );
    Object.assign(b, {
      compounds: String(r.components.length),
      hydrocarbons: String(hydrocarbonCount(r)),
      purity: r.components.length > 1 ? "mixture" : "pure",
      process: "physical",
    });
  }
  if (mode === "column") {
    columnOrder(oilColumns[id]).forEach((t, i) => (b["temp" + i] = String(t)));
    groupOrder(oilColumns[id]).forEach((g, i) => (b["group" + i] = String(g)));
    b.gradient = "coolerUp";
    b.process = "vaporCondense";
  }
  if (mode === "trace") {
    const r = oilTraces[id],
      o = traceOutcome(r);
    Object.assign(b, {
      feedPhase: r.feed < r.bp ? "liquid" : "gas",
      path: o.path,
      tray: String(o.tray),
      phase: o.phase,
      identity: "unchanged",
    });
  }
  if (mode === "trends") {
    const r = oilTrends[id];
    trendOrder(r).forEach((v, i) => (b["order" + i] = String(v)));
    Object.assign(b, {
      boiling: r.direction === "increasing" ? "higher" : "lower",
      viscosity: r.direction === "increasing" ? "higher" : "lower",
      ignition: r.direction === "increasing" ? "lower" : "higher",
      explanation: "intermolecular",
      span: String(
        Math.max(...r.sizes.map((x) => x.carbons)) -
          Math.min(...r.sizes.map((x) => x.carbons)),
      ),
    });
  }
  if (mode === "uses") {
    const r = oilUses[id];
    r.order.forEach((f, i) => (b["use" + i] = fractionUses[f]));
    b.category = r.category;
    b.property = r.property;
  }
  if (mode === "yield") {
    const r = oilYields[id];
    Object.assign(b, {
      barA: String(r.percentages[0]),
      barB: String(r.percentages[1]),
      drawnA: String(r.percentages[0]),
      drawnB: String(r.percentages[1]),
      placedA: "yes",
      placedB: "yes",
      massA: String(fractionMass(r.percentages[0], r.feedMasses[0])),
      massB: String(fractionMass(r.percentages[1], r.feedMasses[1])),
      preference: yieldPreference(r),
      interpretation: "criterion",
      scaleStep: String(r.step),
    });
  }
  return b;
}
export function checkOilBoard(
  mode: OilMode,
  b: unknown,
): { correct: boolean; message: string } {
  if (!validOilBoard(mode, b))
    return {
      correct: false,
      message:
        "Keep incomplete entries visible, then commit ordinary non-negative decimal predictions. The original observations remain unchanged.",
    };
  const e = expectedOilBoard(mode, b.record),
    numericKeys = new Set([
      "compounds",
      "hydrocarbons",
      "tray",
      "span",
      "barA",
      "barB",
      "drawnA",
      "drawnB",
      "massA",
      "massB",
      "scaleStep",
    ]);
  const correct = Object.keys(e)
    .filter((k) => k !== "step" && k !== "selected")
    .every((k) =>
      numericKeys.has(k)
        ? b[k] !== "" && Math.abs(Number(b[k]) - Number(e[k])) < 1e-9
        : b[k] === e[k],
    );
  const good: Record<OilMode, string> = {
    inventory:
      "Only carbon-and-hydrogen compounds were selected. Distinct compounds and molecule counts differ; physical separation keeps molecular identity.",
    column:
      "The column becomes cooler upwards, and the supplied boiling ranges determine the relative collection order. Heating, vaporisation and condensation separate the mixture.",
    trace:
      "The supplied threshold and temperature profile support this path. Residue and top gas need not condense on a tray; the formula is unchanged.",
    trends:
      "Your constructed order and all three trends agree with the requested size direction. Boiling separates molecules through intermolecular attractions.",
    uses: "The six stated uses match their fractions. Fuel, direct material use and chemical feedstock describe different supplied purposes.",
    yield:
      "The bars preserve the original percentages. The mass calculations and source comparison follow the stated criterion, including any unequal feed masses.",
  };
  const retry: Record<OilMode, string> = {
    inventory:
      "Check the elements ONLY, the number of distinct compounds and the total selected hydrocarbon molecules. Several molecules of one compound are still one compound.",
    column:
      "Compare the supplied temperatures from top to bottom and the boiling ranges independently of their letters. The cooler upper column collects lower-boiling material; separation is physical.",
    trace:
      "Compare feed temperature with the supplied boiling point first. If vaporised, inspect trays from bottom upwards for the first cooler tray. If none is cooler, it can leave as top gas.",
    trends:
      "Read whether size increases or decreases. Boiling point and viscosity generally follow size; ease of ignition goes the opposite way. Covalent bonds within molecules are not broken by boiling.",
    uses: "Use the six named applications and the supplied target purpose. A material applied to roads is not automatically a chemical feedstock; an appropriate fraction can be processed rather than burned.",
    yield:
      "Place each original percentage on the supplied scale. Percentage × feed mass ÷100 gives kilograms; then apply the stated percentage or mass criterion, including possible equality.",
  };
  return { correct, message: correct ? good[mode] : retry[mode] };
}
