/** Supplied teaching comparisons. Ranges are examples, not refinery constants. */
export type OilMode =
  "inventory" | "column" | "trace" | "trends" | "uses" | "yield";
export type Component = { formula: string; elements: string[]; count: number };
export type Inventory = {
  title: string;
  note: string;
  components: Component[];
};
export const oilInventories: Record<string, Inventory> = {
  initial: {
    title: "Model crude mixture with an impurity",
    note: "A small supplied sample represents several compounds; it is not a complete composition of actual crude oil.",
    components: [
      { formula: "C₅H₁₂", elements: ["C", "H"], count: 2 },
      { formula: "C₈H₁₈", elements: ["C", "H"], count: 3 },
      { formula: "C₁₂H₂₆", elements: ["C", "H"], count: 1 },
      { formula: "C₆H₆O", elements: ["C", "H", "O"], count: 1 },
    ],
  },
  fraction: {
    title: "A collected fraction",
    note: "The collected sample still contains different hydrocarbons with similar supplied boiling behaviour.",
    components: [
      { formula: "C₇H₁₆", elements: ["C", "H"], count: 2 },
      { formula: "C₈H₁₈", elements: ["C", "H"], count: 2 },
      { formula: "C₉H₂₀", elements: ["C", "H"], count: 2 },
    ],
  },
  pure: {
    title: "One isolated compound",
    note: "This ideal comparison sample contains one distinct compound; do not call every collected refinery fraction this pure.",
    components: [{ formula: "C₈H₁₈", elements: ["C", "H"], count: 5 }],
  },
  impurity: {
    title: "Carbon and hydrogen are not sufficient",
    note: "Select compounds containing carbon and hydrogen ONLY. Having some carbon and hydrogen does not make every compound a hydrocarbon.",
    components: [
      { formula: "C₆H₁₄", elements: ["C", "H"], count: 2 },
      { formula: "C₃H₈O", elements: ["C", "H", "O"], count: 3 },
      { formula: "S₈", elements: ["S"], count: 1 },
    ],
  },
  rings: {
    title: "Hydrocarbons need not all have one formula pattern",
    note: "These supplied formulas all contain only carbon and hydrogen. Classification here uses elements, not the alkane formula from the next lesson.",
    components: [
      { formula: "C₆H₆", elements: ["C", "H"], count: 1 },
      { formula: "C₆H₁₂", elements: ["C", "H"], count: 2 },
      { formula: "C₇H₁₆", elements: ["C", "H"], count: 3 },
    ],
  },
  repeated: {
    title: "Many molecules of one compound",
    note: "The number of molecules is different from the number of distinct compounds.",
    components: [{ formula: "C₃H₈", elements: ["C", "H"], count: 8 }],
  },
};
export const isHydrocarbon = (c: Component) =>
  c.elements.length === 2 &&
  c.elements.includes("C") &&
  c.elements.includes("H");
export const hydrocarbonCount = (r: Inventory) =>
  r.components.filter(isHydrocarbon).reduce((n, c) => n + c.count, 0);
export type Column = {
  title: string;
  note: string;
  temperatures: number[];
  groups: { label: string; range: string; low: number; high: number }[];
};
export const oilColumns: Record<string, Column> = {
  initial: {
    title: "Build a cooler-upwards column",
    note: "Place the supplied temperatures from top to bottom, then place the three example boiling-range groups from upper to lower collection. The ranges are given; they are not universal fraction boundaries.",
    temperatures: [20, 120, 250, 380],
    groups: [
      { label: "A", range: "240–290 °C", low: 240, high: 290 },
      { label: "B", range: "100–160 °C", low: 100, high: 160 },
      { label: "C", range: "below 20 °C", low: -60, high: 19 },
    ],
  },
  changed: {
    title: "New temperatures and group labels",
    note: "Use relative boiling ranges rather than remembering a letter's position. Very low-boiling gases may leave through the top outlet.",
    temperatures: [15, 80, 220, 360],
    groups: [
      { label: "D", range: "below 15 °C", low: -70, high: 14 },
      { label: "E", range: "190–260 °C", low: 190, high: 260 },
      { label: "F", range: "60–110 °C", low: 60, high: 110 },
    ],
  },
  wide: {
    title: "Wider boiling ranges",
    note: "Place non-overlapping supplied range groups in relative collection order; this does not assign a unique temperature to an actual mixture.",
    temperatures: [25, 140, 270, 400],
    groups: [
      { label: "L", range: "280–350 °C", low: 280, high: 350 },
      { label: "M", range: "80–180 °C", low: 80, high: 180 },
      { label: "N", range: "below 25 °C", low: -60, high: 24 },
    ],
  },
  renamed: {
    title: "Labels do not determine the order",
    note: "Group X has an intermediate boiling range despite appearing first in the list.",
    temperatures: [10, 100, 230, 370],
    groups: [
      { label: "X", range: "90–140 °C", low: 90, high: 140 },
      { label: "Y", range: "250–320 °C", low: 250, high: 320 },
      { label: "Z", range: "below 10 °C", low: -80, high: 9 },
    ],
  },
  close: {
    title: "Separate nearby supplied groups",
    note: "Real industrial cuts can overlap. These deliberately non-overlapping teaching ranges establish a relative ordering.",
    temperatures: [30, 150, 240, 390],
    groups: [
      { label: "P", range: "160–210 °C", low: 160, high: 210 },
      { label: "Q", range: "70–120 °C", low: 70, high: 120 },
      { label: "R", range: "260–340 °C", low: 260, high: 340 },
    ],
  },
  reversedList: {
    title: "Repair a reversed listed profile",
    note: "The supplied temperatures are listed in an unhelpful order. Build the physically appropriate column yourself.",
    temperatures: [420, 280, 160, 40],
    groups: [
      { label: "U", range: "300–380 °C", low: 300, high: 380 },
      { label: "V", range: "50–100 °C", low: 50, high: 100 },
      { label: "W", range: "180–250 °C", low: 180, high: 250 },
    ],
  },
};
export const columnOrder = (r: Column) =>
  [...r.temperatures].sort((a, b) => a - b);
export const groupOrder = (r: Column) =>
  r.groups
    .map((g, i) => ({ g, i }))
    .sort((a, b) => a.g.low - b.g.low)
    .map((x) => x.i);
export type Trace = {
  title: string;
  formula: string;
  bp: number;
  feed: number;
  /** Tray temperatures bottom to top. */ trays: number[];
  note: string;
};
export const oilTraces: Record<string, Trace> = {
  initial: {
    title: "Follow an intermediate component",
    formula: "C₈H₁₈",
    bp: 126,
    feed: 400,
    trays: [320, 240, 160, 100, 40],
    note: "Supplied pure-component boiling point at a fixed pressure. In this threshold schematic, a vaporised component rises to the first tray cooler than its boiling point. Real fraction mixtures and industrial operation are more complex.",
  },
  gas: {
    title: "A component that remains gas at the top",
    formula: "C₃H₈",
    bp: -42,
    feed: 400,
    trays: [320, 240, 160, 100, 40],
    note: "No tray is cooler than the supplied boiling point. Top gas need not condense inside the column.",
  },
  residue: {
    title: "A component that does not vaporise in this model",
    formula: "C₃₀H₆₂",
    bp: 450,
    feed: 400,
    trays: [320, 240, 160, 100, 40],
    note: "The supplied feed temperature is below this component's boiling point. This threshold model retains it as liquid residue; do not claim that all crude oil vaporises.",
  },
  lower: {
    title: "A higher-boiling component condenses lower",
    formula: "C₁₆H₃₄",
    bp: 287,
    feed: 400,
    trays: [320, 240, 160, 100, 40],
    note: "Compare each tray with the supplied boiling point. Molecular identity is retained during physical separation.",
  },
  top: {
    title: "A component condensing at the highest tray",
    formula: "C₅H₁₂",
    bp: 36,
    feed: 380,
    trays: [300, 220, 140, 70, 20],
    note: "The cooler highest tray is below the supplied boiling point. No cracking is involved.",
  },
  changed: {
    title: "A changed profile changes the collection tray",
    formula: "C₁₀H₂₂",
    bp: 174,
    feed: 350,
    trays: [280, 210, 180, 150, 60],
    note: "Use this profile rather than copying the tray number from a previous example. Boiling points are supplied for the model.",
  },
};
export function traceOutcome(r: Trace): {
  path: string;
  tray: number;
  phase: string;
} {
  if (r.feed < r.bp) return { path: "residue", tray: 0, phase: "liquid" };
  const i = r.trays.findIndex((t) => t < r.bp);
  return i < 0
    ? { path: "topGas", tray: 0, phase: "gas" }
    : { path: "condensed", tray: i + 1, phase: "liquid" };
}
export type Trend = {
  title: string;
  sizes: { label: string; carbons: number }[];
  direction: "increasing" | "decreasing";
  note: string;
};
export const oilTrends: Record<string, Trend> = {
  initial: {
    title: "Construct increasing molecular-size order",
    sizes: [
      { label: "A", carbons: 12 },
      { label: "B", carbons: 4 },
      { label: "C", carbons: 20 },
      { label: "D", carbons: 8 },
    ],
    direction: "increasing",
    note: "Comparable hydrocarbons: use the supplied carbon counts as a size comparison. These are example molecules, not exact universal fraction boundaries.",
  },
  reverse: {
    title: "Read the requested direction",
    sizes: [
      { label: "E", carbons: 6 },
      { label: "F", carbons: 18 },
      { label: "G", carbons: 10 },
      { label: "H", carbons: 3 },
    ],
    direction: "decreasing",
    note: "Construct largest to smallest, then describe property changes in that same direction.",
  },
  close: {
    title: "Adjacent example sizes",
    sizes: [
      { label: "J", carbons: 9 },
      { label: "K", carbons: 7 },
      { label: "L", carbons: 10 },
      { label: "M", carbons: 8 },
    ],
    direction: "increasing",
    note: "More viscous means flows less readily. Ease of ignition decreases as comparable molecular size increases.",
  },
  wide: {
    title: "A broad size comparison",
    sizes: [
      { label: "N", carbons: 24 },
      { label: "P", carbons: 2 },
      { label: "Q", carbons: 16 },
      { label: "R", carbons: 5 },
    ],
    direction: "increasing",
    note: "Boiling separates molecules; it does not require breaking the carbon–carbon bonds within them.",
  },
  renamed: {
    title: "A second decreasing comparison",
    sizes: [
      { label: "S", carbons: 15 },
      { label: "T", carbons: 5 },
      { label: "U", carbons: 22 },
      { label: "V", carbons: 9 },
    ],
    direction: "decreasing",
    note: "Reverse every trend consistently when following decreasing molecular size.",
  },
  table: {
    title: "Use molecular-size evidence",
    sizes: [
      { label: "W", carbons: 11 },
      { label: "X", carbons: 6 },
      { label: "Y", carbons: 19 },
      { label: "Z", carbons: 14 },
    ],
    direction: "increasing",
    note: "A property's explanation should cite molecular size and intermolecular attraction, not larger atoms or stronger covalent bonds being broken.",
  },
};
export const trendOrder = (r: Trend) =>
  r.sizes
    .map((s, i) => ({ s, i }))
    .sort(
      (a, b) =>
        (a.s.carbons - b.s.carbons) * (r.direction === "increasing" ? 1 : -1),
    )
    .map((x) => x.i);
export const fractionNames = [
  "Petroleum gases",
  "Petrol",
  "Kerosene",
  "Diesel oil",
  "Fuel oil",
  "Bitumen",
];
export const fractionUses = [
  "domestic",
  "cars",
  "aircraft",
  "dieselVehicles",
  "shipsPower",
  "roadsRoofs",
];
export type UseRecord = {
  title: string;
  order: number[];
  target: number;
  category: "fuel" | "material" | "feedstock";
  property: string;
  note: string;
};
export const oilUses: Record<string, UseRecord> = {
  initial: {
    title: "Named fractions and appropriate uses",
    order: [0, 1, 2, 3, 4, 5],
    target: 0,
    category: "fuel",
    property: "ignitesReadily",
    note: "Pearson explicitly requires these six names and uses. The examples are legitimate uses, not the only possible use of each fraction. Here the target is petroleum gas burned for cooking.",
  },
  aircraft: {
    title: "The aircraft-fuel comparison",
    order: [2, 5, 0, 4, 1, 3],
    target: 2,
    category: "fuel",
    property: "suitableBoilingRange",
    note: "Here kerosene is burned as aircraft fuel. Do not assume that simply being most flammable makes a fraction appropriate for every engine.",
  },
  bitumen: {
    title: "Properties useful without burning",
    order: [5, 4, 3, 2, 1, 0],
    target: 5,
    category: "material",
    property: "viscousSurface",
    note: "Here bitumen is a material used on roads and roofs, not burned as the stated fuel use. Distinguish burning for energy, direct material use, and chemical feedstock used to make other products.",
  },
  diesel: {
    title: "Some cars and trains",
    order: [3, 1, 4, 0, 5, 2],
    target: 3,
    category: "fuel",
    property: "engineSuitability",
    note: "Diesel oil is used in suitable diesel engines in some cars and trains; petrol is also a car fuel in appropriate engines.",
  },
  fuelOil: {
    title: "Large ships and some power stations",
    order: [4, 0, 2, 5, 3, 1],
    target: 4,
    category: "fuel",
    property: "burnedEnergy",
    note: "Fuel oil can be burned for energy in suitable large installations. A higher boiling range does not make it incapable of combustion.",
  },
  feedstock: {
    title: "A petrochemical starting material",
    order: [1, 3, 5, 0, 2, 4],
    target: 1,
    category: "feedstock",
    property: "processedMaterials",
    note: "In this supplied use, a petrol-range hydrocarbon stream is processed to make chemical products rather than burned. Uses depend on the process, not a fraction name alone. Solvents, polymers, detergents and lubricants are useful petrochemical products.",
  },
};
export type YieldRecord = {
  title: string;
  fraction: string;
  percentages: [number, number];
  feedMasses: [number, number];
  criterion: "percentage" | "mass";
  max: number;
  step: number;
  note: string;
};
export const oilYields: Record<string, YieldRecord> = {
  initial: {
    title: "Compare kerosene yield from equal feeds",
    fraction: "Kerosene",
    percentages: [18, 7],
    feedMasses: [1000, 1000],
    criterion: "mass",
    max: 50,
    step: 10,
    note: "Supplied percentages by mass; matched total crude masses. Kerosene is the desired fraction in this comparison. No prices or full economic assessment are given.",
  },
  unequal: {
    title: "Higher percentage need not mean more kilograms",
    fraction: "Kerosene",
    percentages: [20, 12],
    feedMasses: [500, 1000],
    criterion: "mass",
    max: 50,
    step: 10,
    note: "The feed masses differ. Use percentage × total mass rather than comparing percentages alone.",
  },
  heavy: {
    title: "A changed desired fraction",
    fraction: "Heavy fuel oil",
    percentages: [28, 42],
    feedMasses: [1000, 1000],
    criterion: "percentage",
    max: 60,
    step: 10,
    note: "Heavy fuel oil is explicitly the desired fraction here. Compare percentage yield, without assuming that kerosene is always the preferred product.",
  },
  scale: {
    title: "Use a five-percent graph interval",
    fraction: "Petrol",
    percentages: [23, 31],
    feedMasses: [800, 800],
    criterion: "mass",
    max: 40,
    step: 5,
    note: "Construct bars using the given original percentages and graph scale. Bar height is a percentage, not kilograms.",
  },
  equal: {
    title: "Equal masses from different percentages",
    fraction: "Diesel oil",
    percentages: [24, 16],
    feedMasses: [500, 750],
    criterion: "mass",
    max: 40,
    step: 5,
    note: "Equal absolute desired-fraction masses can occur with different feed masses and percentage yields.",
  },
  smaller: {
    title: "Percentage preference is a stated criterion",
    fraction: "Petroleum gases",
    percentages: [9, 6],
    feedMasses: [400, 1000],
    criterion: "percentage",
    max: 20,
    step: 5,
    note: "Choose under the stated percentage-yield criterion; separately calculate absolute masses. Do not silently replace the criterion with total kilograms.",
  },
};
export const fractionMass = (percent: number, total: number) =>
  (percent * total) / 100;
export const yieldPreference = (r: YieldRecord) => {
  const a =
      r.criterion === "percentage"
        ? r.percentages[0]
        : fractionMass(r.percentages[0], r.feedMasses[0]),
    b =
      r.criterion === "percentage"
        ? r.percentages[1]
        : fractionMass(r.percentages[1], r.feedMasses[1]);
  return a === b ? "equal" : a > b ? "A" : "B";
};
export const oilRecords = {
  inventory: oilInventories,
  column: oilColumns,
  trace: oilTraces,
  trends: oilTrends,
  uses: oilUses,
  yield: oilYields,
};
