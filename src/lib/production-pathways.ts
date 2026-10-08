const finite = (n: number, label: string) => {
  if (!Number.isFinite(n)) throw Error(`${label} must be finite`);
};
const nonnegative = (n: number, label: string) => {
  finite(n, label);
  if (n < 0) throw Error(`${label} cannot be negative`);
};
const positive = (n: number, label: string) => {
  finite(n, label);
  if (n <= 0) throw Error(`${label} must be positive`);
};
const percentage = (n: number, label: string) => {
  nonnegative(n, label);
  if (n > 100) throw Error(`${label} cannot exceed 100`);
};
/** These are supplied comparable process records, not an inferred actual waste inventory. */
export function compareOutput(theoreticalProduct: number, actualYield: number) {
  positive(theoreticalProduct, "Theoretical product");
  percentage(actualYield, "Comparable yield");
  return (theoreticalProduct * actualYield) / 100;
}
export function outputPerHour(
  collectedProduct: number,
  completeBatchHours: number,
) {
  nonnegative(collectedProduct, "Collected product");
  positive(completeBatchHours, "Complete batch time");
  return collectedProduct / completeBatchHours;
}
export function netCost({
  product,
  baseCost,
  otherProduct,
  sold,
  price,
  disposal,
}: {
  product: number;
  baseCost: number;
  otherProduct: number;
  sold: number;
  price: number;
  disposal: number;
}) {
  positive(product, "Desired product");
  for (const [label, n] of Object.entries({
    baseCost,
    otherProduct,
    sold,
    price,
    disposal,
  }))
    nonnegative(n, label);
  if (sold > otherProduct)
    throw Error("Cannot sell more by-product than available");
  const waste = otherProduct - sold,
    credit = sold * price,
    disposalCost = waste * disposal;
  return {
    waste,
    credit,
    disposalCost,
    total: baseCost + disposalCost - credit,
    perKg: (baseCost + disposalCost - credit) / product,
  };
}
export type RouteRecord = {
  id: string;
  economy: number;
  yield: number;
  rate: number;
  energy: number;
};
export function eligibleRoutes(
  routes: readonly RouteRecord[],
  minimumRate: number,
  maximumEnergy: number,
) {
  nonnegative(minimumRate, "Minimum rate");
  nonnegative(maximumEnergy, "Maximum energy");
  const ids = new Set<string>();
  for (const r of routes) {
    if (!r.id || ids.has(r.id))
      throw Error("Distinct route identifiers required");
    ids.add(r.id);
    percentage(r.economy, "Atom economy");
    percentage(r.yield, "Yield");
    nonnegative(r.rate, "Rate");
    nonnegative(r.energy, "Energy");
  }
  return routes.filter(
    (r) => r.rate >= minimumRate && r.energy <= maximumEnergy,
  );
}
export function bestRoutes(
  routes: readonly RouteRecord[],
  goal: "economy" | "rate",
) {
  if (!routes.length) return [];
  const key = goal === "economy" ? "economy" : "rate",
    best = Math.max(...routes.map((r) => r[key]));
  return routes.filter((r) => r[key] === best).map((r) => r.id);
}
export const pathwayOutputRecords = {
  standard: {
    label: "Equal 100 kg reactant feeds",
    aTheory: 80,
    bTheory: 60,
    aYield: 50,
    bYield: 90,
  },
  double: {
    label: "Equal 200 kg reactant feeds",
    aTheory: 160,
    bTheory: 120,
    aYield: 50,
    bYield: 90,
  },
  changed: {
    label: "100 kg reactant feeds; collection performance changes",
    aTheory: 80,
    bTheory: 60,
    aYield: 100,
    bYield: 50,
  },
} as const;
export const throughputRecords = {
  standard: {
    label: "Standard complete batch times",
    aMass: 90,
    aTime: 3,
    bMass: 64,
    bTime: 1,
  },
  delayed: {
    label: "Route B separation delay included",
    aMass: 90,
    aTime: 3,
    bMass: 64,
    bTime: 4,
  },
  scaled: {
    label: "Twice the batch masses and times",
    aMass: 180,
    aTime: 6,
    bMass: 128,
    bTime: 2,
  },
} as const;
export const byproductRecords = {
  sold: { label: "All B co-product has a buyer", sold: 25 },
  noBuyer: { label: "No buyer for B co-product", sold: 0 },
  limitedBuyer: { label: "Buyer accepts only 10 kg of B co-product", sold: 10 },
} as const;
export const conditionRecords = {
  cool: {
    label: "Cooler process",
    equilibrium: 60,
    mass: 40,
    time: 4,
    energy: 15,
  },
  warm: {
    label: "Warmer process",
    equilibrium: 45,
    mass: 45,
    time: 1,
    energy: 20,
  },
  hot: {
    label: "Hottest process",
    equilibrium: 30,
    mass: 30,
    time: 0.5,
    energy: 35,
  },
  catalysed: {
    label: "Warmer process with catalyst",
    equilibrium: 45,
    mass: 45,
    time: 0.5,
    energy: 20,
  },
} as const;
export const decisionRoutes: readonly RouteRecord[] = [
  { id: "A", economy: 90, yield: 95, rate: 20, energy: 12 },
  { id: "B", economy: 70, yield: 85, rate: 40, energy: 8 },
  { id: "C", economy: 85, yield: 90, rate: 30, energy: 10 },
];
export type PathwayMode =
  "output" | "throughput" | "byproducts" | "conditions" | "decision";
export const pathwayChoices = {
  output: {
    record: ["standard", "double", "changed"],
    a: ["unset", "40", "54", "80", "108", "30", "160"],
    b: ["unset", "40", "54", "80", "108", "30", "120"],
    best: ["unset", "A", "B"],
  },
  throughput: {
    record: ["standard", "delayed", "scaled"],
    a: ["unset", "30", "90", "180", "15"],
    b: ["unset", "16", "32", "64", "128"],
    best: ["unset", "A", "B"],
  },
  byproducts: {
    record: ["sold", "noBuyer", "limitedBuyer"],
    waste: ["unset", "0", "10", "15", "25"],
    credit: ["unset", "0", "30", "55", "75"],
    a: ["unset", "120", "140", "1.4"],
    b: ["unset", "55", "130", "180", "0.55"],
    best: ["unset", "A", "B"],
    economy: ["unset", "unchanged", "increased", "decreased"],
  },
  conditions: {
    record: ["cool", "warm", "hot", "catalysed"],
    equilibrium: ["unset", "30", "45", "60", "90"],
    rate: ["unset", "10", "30", "45", "60", "90"],
    eligible: ["unset", "yes", "no"],
    catalyst: ["unset", "same", "higher", "lower"],
  },
  decision: {
    energy: ["9", "11", "13"],
    goal: ["economy", "rate"],
    eligible: ["unset", "B", "BC", "ABC", "none"],
    best: ["unset", "A", "B", "C", "none"],
    reason: ["unset", "objective", "largestEconomy", "averagePercentages"],
  },
} as const;
export function initialPathwayBoard(
  mode: PathwayMode,
): Record<string, string | number> {
  return Object.fromEntries(
    Object.keys(pathwayChoices[mode]).map((k) => [
      k,
      k === "record"
        ? mode === "byproducts"
          ? "sold"
          : mode === "conditions"
            ? "warm"
            : "standard"
        : k === "energy"
          ? "9"
          : k === "goal"
            ? "economy"
            : "unset",
    ]),
  );
}
export function validPathwayBoard(
  mode: PathwayMode,
  b: Record<string, unknown>,
) {
  const choices = pathwayChoices[mode] as Record<string, readonly string[]>;
  return (
    Object.keys(b).length === Object.keys(choices).length &&
    Object.keys(choices).every(
      (k) => typeof b[k] === "string" && choices[k].includes(b[k] as string),
    )
  );
}
const show = (n: number) => Number(n.toPrecision(12));
export function pathwayPrediction(
  mode: PathwayMode,
  b: Record<string, string | number>,
) {
  const chosen = (k: string, n: number) =>
    b[k] !== "unset" && Math.abs(Number(b[k]) - n) < 1e-10;
  if (mode === "output") {
    const r =
        pathwayOutputRecords[b.record as keyof typeof pathwayOutputRecords],
      a = compareOutput(r.aTheory, r.aYield),
      v = compareOutput(r.bTheory, r.bYield),
      best = a > v ? "A" : "B";
    return {
      correct: chosen("a", a) && chosen("b", v) && b.best === best,
      a,
      b: v,
      feedback: `A: theoretical ${r.aTheory} kg × ${r.aYield / 100} = ${show(a)} kg collected. B: ${r.bTheory} kg × ${r.bYield / 100} = ${show(v)} kg. Choose ${best} for greater collected mass from these equal reactant feeds. A has 80% atom economy and B 60%; that equation property alone does not decide actual collection. Actual unused/reacted/by-product inventories cannot be inferred from yield alone.`,
    };
  }
  if (mode === "throughput") {
    const r = throughputRecords[b.record as keyof typeof throughputRecords],
      a = outputPerHour(r.aMass, r.aTime),
      v = outputPerHour(r.bMass, r.bTime),
      best = a > v ? "A" : "B";
    return {
      correct: chosen("a", a) && chosen("b", v) && b.best === best,
      a,
      b: v,
      feedback: `A: ${r.aMass} kg / ${r.aTime} h = ${show(a)} kg/h. B: ${r.bMass} kg / ${r.bTime} h = ${show(v)} kg/h. ${best} has greater collected output per hour on the stated complete-batch basis. This includes separation time and assumes batches repeat without additional downtime. Neither batch mass nor percentage yield alone gives production rate.`,
    };
  }
  if (mode === "byproducts") {
    const r = byproductRecords[b.record as keyof typeof byproductRecords],
      a = netCost({
        product: 100,
        baseCost: 120,
        otherProduct: 10,
        sold: 0,
        price: 0,
        disposal: 2,
      }),
      v = netCost({
        product: 100,
        baseCost: 130,
        otherProduct: 25,
        sold: r.sold,
        price: 3,
        disposal: 2,
      }),
      best = a.total < v.total ? "A" : "B";
    return {
      correct:
        chosen("waste", v.waste) &&
        chosen("credit", v.credit) &&
        chosen("a", a.total) &&
        chosen("b", v.total) &&
        b.best === best &&
        b.economy === "unchanged",
      a: a.total,
      b: v.total,
      feedback: `Both records produce 100 kg of the specified desired product. A net cost = £120 + 10×£2 = £140. B sells ${r.sold} kg for £${v.credit}, leaving ${v.waste} kg for £${v.disposalCost} disposal: £130 + £${v.disposalCost} − £${v.credit} = £${v.total}. ${best} is cheaper on these included costs. Selling another product does not change atom economy for the specified desired product; demand and purification evidence matter.`,
    };
  }
  if (mode === "conditions") {
    const r = conditionRecords[b.record as keyof typeof conditionRecords],
      rate = outputPerHour(r.mass, r.time),
      eligible = r.energy <= 25 ? "yes" : "no";
    return {
      correct:
        chosen("equilibrium", r.equilibrium) &&
        chosen("rate", rate) &&
        b.eligible === eligible &&
        b.catalyst === "same",
      a: r.equilibrium,
      b: rate,
      feedback: `Supplied equilibrium yield: ${r.equilibrium}%; collected output ${r.mass}/${r.time} = ${show(rate)} kg/h. Energy ${r.energy} kWh/kg ${eligible === "yes" ? "meets" : "exceeds"} the 25 kWh/kg limit. Higher production rate does not establish higher equilibrium yield. The catalyst leaves the warmer equilibrium yield at 45% while shortening the supplied batch time. It speeds approach to equilibrium without shifting its position; no universal optimum follows from temperature alone.`,
    };
  }
  const eligible = eligibleRoutes(decisionRoutes, 30, Number(b.energy)),
    ids = eligible.map((r) => r.id).join("") || "none",
    best = bestRoutes(eligible, b.goal as "economy" | "rate")[0] || "none";
  return {
    correct: b.eligible === ids && b.best === best && b.reason === "objective",
    a: eligible.length,
    b: 0,
    feedback: `First require at least 30 kg/h and no more than ${b.energy} kWh/kg. Eligible routes: ${ids === "none" ? "none" : eligible.map((r) => r.id).join(", ")}. For the stated objective of ${b.goal === "economy" ? "highest atom economy" : "greatest collected output per hour"}, choose ${best}. Route A fails the minimum rate despite its high percentages. Do not average unlike percentages or invent a universal sustainability score. Different objectives can justify different choices; this rule evaluates only the supplied objective and constraints.`,
  };
}
