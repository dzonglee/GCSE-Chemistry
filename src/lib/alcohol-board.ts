import {
  alcoholRecords,
  organicStructures,
  organicReactions,
  alcoholCombustions,
  fermentationCases,
  fuelComparisons,
  fuelPlots,
  fuelPlotTolerance,
  carbonOrder,
  targetCarbonHydrogens,
  type AlcoholMode,
} from "./alcohols";
export type AlcoholBoard = Record<string, string>;
const rounded = (n: number, d = 6) => String(Number(n.toFixed(d)));
function fields(mode: AlcoholMode, id: string) {
  if (mode === "structure")
    return [
      "record",
      "hydroxyl",
      "carbonyl",
      "oxygenH",
      ...Array.from({ length: organicStructures[id].n * 4 }, (_, i) => "h" + i),
      "hTotal",
      "oTotal",
      "family",
      "name",
    ];
  if (mode === "reaction")
    return [
      "record",
      "reveal",
      "result",
      "gas",
      "change",
      "beforeGroup",
      "afterGroup",
    ];
  if (mode === "combustion")
    return [
      "record",
      "carbonProduct",
      "hydrogenProduct",
      "fuel",
      "oxygen",
      "carbon",
      "water",
    ];
  if (mode === "fermentation")
    return [
      "record",
      "reveal",
      "stage",
      "feed",
      "yeast",
      "temperature",
      "oxygen",
      "products",
      "reason",
      "collection",
    ];
  if (mode === "fuel")
    return fuelComparisons[id].kind === "specifiedEnergy"
      ? ["record", "mass", "unit", "basis"]
      : [
          "record",
          "massA",
          "massB",
          "riseA",
          "riseB",
          "normA",
          "normB",
          "judgement",
          "limitation",
        ];
  return [
    "record",
    ...fuelPlots[id].points.flatMap((_, i) => [
      "p" + i + "x",
      "p" + i + "y",
      "c" + i,
    ]),
    "estimate",
    "trend",
    "limit",
  ];
}
function choices(mode: AlcoholMode): Record<string, string[]> {
  if (mode === "structure")
    return {
      hydroxyl: ["yes", "no"],
      carbonyl: ["0", "1", "2"],
      oxygenH: ["yes", "no"],
      family: ["", "alcohol", "acid", "alkane"],
      name: [
        "",
        "methanol",
        "ethanol",
        "propanol",
        "butanol",
        "methanoic acid",
        "ethanoic acid",
        "propanoic acid",
        "butanoic acid",
      ],
    };
  if (mode === "reaction")
    return {
      reveal: ["yes", "no"],
      result: [
        "",
        "alkoxideAndHydrogen",
        "sameDissolvedAlcohol",
        "correspondingAcid",
        "saltWaterCarbonDioxide",
        "esterAndWater",
        "alkeneAndWater",
        "carbonDioxideAndWater",
      ],
      gas: [
        "",
        "hydrogen",
        "carbonDioxide",
        "oxygen",
        "none",
        "notEstablished",
      ],
      change: ["", "chemical", "physical"],
      beforeGroup: ["", "OH", "COOH", "CCdouble", "none"],
      afterGroup: [
        "",
        "OH",
        "COOH",
        "alkoxide",
        "carboxylate",
        "ester",
        "CCdouble",
        "none",
      ],
    };
  if (mode === "combustion")
    return {
      carbonProduct: ["", "carbonDioxide", "carbonMonoxide", "carbon"],
      hydrogenProduct: ["", "water", "hydrogen"],
    };
  if (mode === "fermentation")
    return {
      reveal: ["yes", "no"],
      stage: [
        "",
        "fermentation",
        "fractionalDistillation",
        "combustion",
        "cracking",
      ],
      feed: ["", "sugarSolution", "ethanolWaterMixture", "pureEthanol"],
      yeast: [
        "",
        "enzymes",
        "damagedEnzymes",
        "absentEnzymes",
        "notRequiredForSeparation",
      ],
      temperature: [
        "",
        "warm",
        "slowerCold",
        "damagedHighHeat",
        "vaporiseAndCondense",
        "alwaysBoiling",
      ],
      oxygen: ["", "anaerobic", "notRequiredForSeparation", "oxygenRequired"],
      products: [
        "",
        "ethanolAndCarbonDioxide",
        "notDemonstrated",
        "sameMolecules",
        "carbonDioxideAndWater",
      ],
      reason: [
        "",
        "enzymeCatalysis",
        "lowerRate",
        "enzymeDamage",
        "missingCatalyst",
        "differentBoilingBehaviour",
        "createsAtoms",
      ],
      collection: [
        "",
        "aqueousMixture",
        "unreactedMixture",
        "enrichedMixture",
        "pureEthanol",
      ],
    };
  if (mode === "fuel")
    return {
      unit: ["", "g", "kg", "kJ", "°C/g"],
      basis: [
        "",
        "suppliedEnergyPerGram",
        "temperatureIsEnergy",
        "containerMass",
      ],
      judgement: [
        "",
        "AgreaterPerGram",
        "BgreaterPerGram",
        "equalObservedResponse",
        "notComparableFromRiseAlone",
      ],
      limitation: [
        "",
        "observedNotTrueCombustionEnergy",
        "unequalWaterMass",
        "heatLossNotRemovedByRepeats",
        "guaranteedTrueEnergy",
      ],
    };
  return {
    trend: [
      "",
      "increasesWithSmallerGains",
      "approximatelyProportional",
      "decreases",
      "constantObserved",
    ],
    limit: [
      "",
      "extrapolatedEstimate",
      "interpolatedEstimate",
      "measuredValue",
      "universalConstant",
    ],
  };
}
export function initialAlcoholBoard(
  mode: AlcoholMode,
  id = "initial",
): AlcoholBoard {
  if (!Object.hasOwn(alcoholRecords[mode], id))
    throw Error("Unknown original case");
  const b = Object.fromEntries(fields(mode, id).map((k) => [k, ""]));
  b.record = id;
  if (mode === "structure") {
    b.hydroxyl = "no";
    b.carbonyl = "0";
    b.oxygenH = "no";
    for (const k of Object.keys(b)) if (/^h\d+$/.test(k)) b[k] = "no";
  }
  if (mode === "reaction" || mode === "fermentation") b.reveal = "no";
  return b;
}
export function validAlcoholBoard(
  mode: AlcoholMode,
  value: unknown,
): value is AlcoholBoard {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as AlcoholBoard;
  if (
    typeof b.record !== "string" ||
    !Object.hasOwn(alcoholRecords[mode], b.record)
  )
    return false;
  const keys = fields(mode, b.record),
    options = choices(mode);
  if (
    Object.keys(b).length !== keys.length ||
    !keys.every((k) => Object.hasOwn(b, k) && typeof b[k] === "string")
  )
    return false;
  for (const k of keys) {
    if (k === "record") continue;
    if (/^h\d+$/.test(k)) {
      if (!["yes", "no"].includes(b[k])) return false;
    } else if (options[k]) {
      if (!options[k].includes(b[k])) return false;
    } else if (
      b[k] !== "" &&
      (!(
        mode === "structure" || mode === "combustion"
          ? /^(?:0|[1-9]\d*)$/
          : /^(?:0|[1-9]\d*)(?:\.\d+)?$/
      ).test(b[k]) ||
        Number(b[k]) > 1000 ||
        b[k].length > 20)
    )
      return false;
  }
  return true;
}
export function alcoholHistoryStep(
  mode: AlcoholMode,
  previous: unknown,
  next: unknown,
) {
  if (!validAlcoholBoard(mode, previous) || !validAlcoholBoard(mode, next))
    return false;
  if (previous.record !== next.record)
    return Object.entries(initialAlcoholBoard(mode, next.record)).every(
      ([k, v]) => next[k] === v,
    );
  const changed = Object.keys(previous).filter((k) => previous[k] !== next[k]);
  if (changed.length === 1) return true;
  if (mode === "plot" && changed.length === 2) {
    const a = /^p(\d+)(x|y)$/.exec(changed[0]),
      b = /^p(\d+)(x|y)$/.exec(changed[1]);
    if (
      a &&
      b &&
      a[1] === b[1] &&
      a[2] !== b[2] &&
      changed.every((k) => next[k] !== "")
    )
      return true;
  }
  if (
    mode === "combustion" &&
    changed.length === 4 &&
    changed.every((k) => ["fuel", "oxygen", "carbon", "water"].includes(k))
  )
    return [2, 0.5].some((f) =>
      ["fuel", "oxygen", "carbon", "water"].every(
        (k) =>
          previous[k] !== "" &&
          Number(previous[k]) > 0 &&
          next[k] === String(Number(previous[k]) * f) &&
          Number.isInteger(Number(next[k])) &&
          Number(next[k]) > 0,
      ),
    );
  return false;
}
export function organicProposal(n: number, b: AlcoholBoard) {
  const hydroxyl = b.hydroxyl === "yes",
    carbonyl = Number(b.carbonyl),
    carbons = Array.from({ length: n }, (_, c) => {
      const h = [0, 1, 2, 3].filter(
          (slot) => b["h" + (4 * c + slot)] === "yes",
        ).length,
        other = carbonOrder(n, c, hydroxyl, carbonyl);
      return { hydrogens: h, other, total: h + other };
    });
  return {
    carbons,
    carbonHydrogens: carbons.reduce((sum, c) => sum + c.hydrogens, 0),
    hydroxylHydrogen: hydroxyl && b.oxygenH === "yes" ? 1 : 0,
    hydroxylOxygen: hydroxyl ? 1 : 0,
    carbonylOxygen: carbonyl > 0 ? 1 : 0,
    hydroxylValence: hydroxyl ? 1 + (b.oxygenH === "yes" ? 1 : 0) : 0,
    carbonylValence: carbonyl,
  };
}
export function alcoholAtomTotals(id: string, b: AlcoholBoard) {
  const r = alcoholCombustions[id],
    f = Number(b.fuel),
    o = Number(b.oxygen),
    c = Number(b.carbon),
    w = Number(b.water);
  return {
    before: [r.n * f, (2 * r.n + 2) * f, f + 2 * o],
    after: [
      c,
      2 * w,
      (b.carbonProduct === "carbonDioxide"
        ? 2
        : b.carbonProduct === "carbonMonoxide"
          ? 1
          : 0) *
        c +
        (b.hydrogenProduct === "water" ? w : 0),
    ],
  };
}
export function fuelReference(id: string): AlcoholBoard {
  const r = fuelComparisons[id];
  if (r.kind === "specifiedEnergy") return { mass: rounded(r.target / r.rate) };
  const masses = r.before.map((x, i) => x - r.after[i]),
    rises = r.final.map((x, i) => x - r.initial[i]);
  return {
    massA: rounded(masses[0]),
    massB: rounded(masses[1]),
    riseA: rounded(rises[0]),
    riseB: rounded(rises[1]),
    normA: rounded(rises[0] / masses[0], 1),
    normB: rounded(rises[1] / masses[1], 1),
  };
}
export function expectedAlcoholBoard(
  mode: AlcoholMode,
  id = "initial",
): AlcoholBoard {
  const b = initialAlcoholBoard(mode, id);
  if (mode === "structure") {
    const r = organicStructures[id];
    b.hydroxyl = "yes";
    b.oxygenH = "yes";
    b.carbonyl = r.family === "acid" ? "2" : "0";
    for (let c = 0; c < r.n; c++)
      for (let slot = 0; slot < targetCarbonHydrogens(r.n, r.family, c); slot++)
        b["h" + (4 * c + slot)] = "yes";
    return {
      ...b,
      hTotal: String(r.family === "alcohol" ? 2 * r.n + 2 : 2 * r.n),
      oTotal: r.family === "alcohol" ? "1" : "2",
      family: r.family,
      name: r.name,
    };
  }
  if (mode === "reaction") {
    const r = organicReactions[id];
    return {
      ...b,
      reveal: "yes",
      result: r.result,
      gas: r.gas,
      change: r.change,
      beforeGroup: r.beforeGroup,
      afterGroup: r.afterGroup,
    };
  }
  if (mode === "combustion") {
    const r = alcoholCombustions[id];
    return {
      ...b,
      carbonProduct: "carbonDioxide",
      hydrogenProduct: "water",
      fuel: String(r.ratio[0]),
      oxygen: String(r.ratio[1]),
      carbon: String(r.ratio[2]),
      water: String(r.ratio[3]),
    };
  }
  if (mode === "fermentation") {
    const r = fermentationCases[id];
    return {
      ...b,
      reveal: "yes",
      stage: r.stage,
      feed: r.feed,
      yeast: r.yeast,
      temperature: r.temperature,
      oxygen: r.oxygen,
      products: r.products,
      reason: r.reason,
      collection: r.collection,
    };
  }
  if (mode === "fuel") {
    const r = fuelComparisons[id];
    return r.kind === "specifiedEnergy"
      ? {
          ...b,
          mass: fuelReference(id).mass!,
          unit: "g",
          basis: "suppliedEnergyPerGram",
        }
      : {
          ...b,
          ...fuelReference(id),
          judgement: r.judgement,
          limitation: r.limitation,
        };
  }
  const r = fuelPlots[id];
  for (let i = 0; i < r.points.length; i++) {
    b["p" + i + "x"] = String(r.points[i][0]);
    b["p" + i + "y"] = String(r.points[i][1]);
  }
  return {
    ...b,
    estimate: rounded((r.estimateRange[0] + r.estimateRange[1]) / 2),
    trend: r.trend,
    limit: r.limit,
  };
}
export function checkAlcoholBoard(
  mode: AlcoholMode,
  value: unknown,
): { correct: boolean; message: string } {
  if (!validAlcoholBoard(mode, value))
    return {
      correct: false,
      message:
        "Keep your original proposal. Use the supplied choices and ordinary nonnegative numbers; incomplete raw entries do not replace accepted scientific state.",
    };
  const b = value,
    id = b.record,
    e = expectedAlcoholBoard(mode, id);
  let correct = false;
  if (mode === "structure") {
    const r = organicStructures[id],
      p = organicProposal(r.n, b);
    correct =
      b.hydroxyl === "yes" &&
      b.oxygenH === "yes" &&
      b.carbonyl === (r.family === "acid" ? "2" : "0") &&
      p.carbons.every((c) => c.total === 4) &&
      b.hTotal === e.hTotal &&
      b.oTotal === e.oTotal &&
      b.family === r.family &&
      b.name === r.name;
  } else if (mode === "combustion") {
    const totals = alcoholAtomTotals(id, b);
    correct =
      b.carbonProduct === "carbonDioxide" &&
      b.hydrogenProduct === "water" &&
      ["fuel", "oxygen", "carbon", "water"].every(
        (k) => b[k] !== "" && Number(b[k]) > 0,
      ) &&
      totals.before.every((x, i) => x === totals.after[i]);
  } else if (mode === "fuel") {
    const r = fuelComparisons[id];
    correct = Object.entries(e).every(([k, v]) =>
      ["record", "unit", "basis", "judgement", "limitation"].includes(k)
        ? b[k] === v
        : b[k] !== "" && Math.abs(Number(b[k]) - Number(v)) < 1e-7,
    );
    if (r.kind === "measurement")
      correct = correct && ["massA", "massB"].every((k) => Number(b[k]) > 0);
  } else if (mode === "plot") {
    const r = fuelPlots[id],
      tolerance = fuelPlotTolerance(r);
    correct =
      r.points.every(
        ([x, y], i) =>
          b["p" + i + "x"] !== "" &&
          b["p" + i + "y"] !== "" &&
          Math.abs(Number(b["p" + i + "x"]) - x) <= tolerance.x + 1e-9 &&
          Math.abs(Number(b["p" + i + "y"]) - y) <= tolerance.y + 1e-9,
      ) &&
      b.trend === r.trend &&
      b.limit === r.limit;
  } else correct = Object.entries(e).every(([k, v]) => b[k] === v);
  const messages: Record<AlcoholMode, [string, string]> = {
    structure: [
      "The whole requested functional group, every local valence, formula counts and first-four name agree. Displayed H orientations are conventions.",
      "Keep the construction. Alcohols need C–O–H; acids need the WHOLE C(=O)–O–H group, whose carbon is part of the carbon count. Complete every C to four, O to two and H to one.",
    ],
    reaction: [
      "Your products and gas inference agree with the ORIGINAL supplied reagent and observation; unreported gas identities remain unestablished.",
      "Use the original reagent and evidence. Sodium/alcohol hydrogen differs from carbonate/acid CO₂; controlled oxidation differs from combustion. A gas identity needs the supplied test, not bubbles alone.",
    ],
    combustion: [
      "Your positive whole-molecule coefficients preserve C,H AND O, including oxygen already present in the alcohol. Balanced multiples remain valid.",
      "Keep the fuel formula. Choose complete-combustion CO₂/H₂O products, conserve C/H/O and include the fuel’s own oxygen atoms. Change coefficients rather than molecular subscripts.",
    ],
    fermentation: [
      "The selected process, yeast-enzyme role, stated conditions and mixture/collection conclusion agree with the original report.",
      "Separate chemical production from later physical collection. Yeast supplies enzymes; cold can slow the process and stated high-heat damage can prevent it. An aqueous fermentation product or enriched fraction is not proved absolutely pure.",
    ],
    fuel: [
      "The original mass/temperature differences, per-gram basis and stated comparison limits agree. °C/g is not kJ/g.",
      "Use original before-minus-after burner mass and final-minus-initial water temperature. Normalize to actual mass consumed for matched water/apparatus; unequal water and heat-loss reports limit energy conclusions.",
    ],
    plot: [
      "Your plotted positions agree with the original observations within half a small square; your trend and interpolation/extrapolation classification agree. This check does NOT mark your proposed fit curve or estimate: self-review those against the original data and scientific limits.",
      "Keep the original table and axis scales. Plot each supplied x AND y, identify its actual trend and distinguish an estimated value from a directly supplied observation. Your fit curve and estimate require self-review.",
    ],
  };
  return { correct, message: messages[mode][correct ? 0 : 1] };
}
