export type AlcoholMode =
  "structure" | "reaction" | "combustion" | "fermentation" | "fuel" | "plot";
export type OrganicFamily = "alcohol" | "acid";
export type OrganicStructure = {
  title: string;
  name: string;
  n: number;
  family: OrganicFamily;
  note: string;
};
export const organicStructures: Record<string, OrganicStructure> = {
  initial: {
    title: "Methanol: one carbon and one covalent OH",
    name: "methanol",
    n: 1,
    family: "alcohol",
    note: "Construct methanol, including the hydrogen attached to oxygen. The OH group is covalent, not a hydroxide ion.",
  },
  ethanol: {
    title: "Ethanol: two carbons and one OH",
    name: "ethanol",
    n: 2,
    family: "alcohol",
    note: "Count the OH hydrogen in the molecular formula. C₂H₅OH and C₂H₆O describe the same supplied ethanol molecule.",
  },
  propanol: {
    title: "Propan-1-ol: supplied end-OH position",
    name: "propanol",
    n: 3,
    family: "alcohol",
    note: "Build the stated propan-1-ol arrangement. Propanol is the first-four name; the supplied end position matches the reviewed Pearson structure requirement.",
  },
  butanol: {
    title: "Butan-1-ol: supplied end-OH position",
    name: "butanol",
    n: 4,
    family: "alcohol",
    note: "Build the stated butan-1-ol arrangement. Each neutral carbon needs bond-order total four; oxygen has two and hydrogen one.",
  },
  methanoic: {
    title: "Methanoic acid: the COOH carbon is the only C",
    name: "methanoic acid",
    n: 1,
    family: "acid",
    note: "The carbon within COOH belongs to the carbon count. Construct C=O and C–O–H, with one C-bound H as well as the O-bound H.",
  },
  ethanoic: {
    title: "Ethanoic acid: complete the whole COOH group",
    name: "ethanoic acid",
    n: 2,
    family: "acid",
    note: "Construct CH₃–C(=O)–O–H. The OH within COOH does not make this target an alcohol.",
  },
  propanoic: {
    title: "Propanoic acid: three-carbon acid",
    name: "propanoic acid",
    n: 3,
    family: "acid",
    note: "The terminal carboxyl carbon is one of the three carbons. Keep the entire connected COOH group.",
  },
  butanoic: {
    title: "Butanoic acid: four-carbon acid",
    name: "butanoic acid",
    n: 4,
    family: "acid",
    note: "Construct every atom and bond of the four-carbon acid. COOH contains two oxygen atoms, not one.",
  },
};
export function organicFormula(n: number, family: OrganicFamily) {
  return (
    "C" +
    (n === 1 ? "" : sub(n)) +
    "H" +
    sub(family === "alcohol" ? 2 * n + 2 : 2 * n) +
    "O" +
    (family === "acid" ? "₂" : "")
  );
}
export function sub(n: number) {
  return String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]);
}
export function carbonOrder(
  n: number,
  c: number,
  hydroxyl: boolean,
  carbonyl: number,
) {
  return (
    (c > 0 ? 1 : 0) +
    (c < n - 1 ? 1 : 0) +
    (c === n - 1 ? (hydroxyl ? 1 : 0) + carbonyl : 0)
  );
}
export function targetCarbonHydrogens(
  n: number,
  family: OrganicFamily,
  c: number,
) {
  return 4 - carbonOrder(n, c, true, family === "acid" ? 2 : 0);
}
export type ReactionRecord = {
  title: string;
  reactant: string;
  partner: string;
  originalObservation: string;
  result: string;
  gas: string;
  change: string;
  beforeGroup: string;
  afterGroup: string;
  note: string;
};
export const organicReactions: Record<string, ReactionRecord> = {
  initial: {
    title: "Alcohol and sodium: supplied hydrogen evidence",
    reactant: "Ethanol",
    partner: "Sodium",
    originalObservation:
      "Bubbles form; the supplied gas-test report records a squeaky pop with a lighted splint.",
    result: "alkoxideAndHydrogen",
    gas: "hydrogen",
    change: "chemical",
    beforeGroup: "OH",
    afterGroup: "alkoxide",
    note: "Use the supplied virtual report. The sodium ethoxide product name is provided; a balanced sodium/alcohol equation is not required.",
  },
  water: {
    title: "Alcohol added to water: neutral dissolved molecules",
    reactant: "Methanol",
    partner: "Water",
    originalObservation:
      "The liquids form one mixed liquid; the supplied indicator result is neutral. No gas evolution was observed; analysis still identifies methanol and water.",
    result: "sameDissolvedAlcohol",
    gas: "none",
    change: "physical",
    beforeGroup: "OH",
    afterGroup: "OH",
    note: "Methanol mixes with water. A covalent OH group does not mean the dissolved material is a hydroxide alkali.",
  },
  oxidise: {
    title: "Controlled oxidation to a corresponding acid",
    reactant: "Ethanol",
    partner: "A supplied oxidising agent under acid-forming conditions",
    originalObservation:
      "The original product is supplied as CH₃COOH. Its carbon skeleton still contains two carbon atoms.",
    result: "correspondingAcid",
    gas: "notEstablished",
    change: "chemical",
    beforeGroup: "OH",
    afterGroup: "COOH",
    note: "Controlled oxidation can form ethanoic acid. This is different from complete combustion to CO₂ and H₂O; do not infer an unreported gas.",
  },
  carbonate: {
    title: "Carboxylic acid and carbonate: supplied gas evidence",
    reactant: "Ethanoic acid",
    partner: "Sodium carbonate",
    originalObservation:
      "Bubbles form; the supplied gas-test report says limewater turns milky.",
    result: "saltWaterCarbonDioxide",
    gas: "carbonDioxide",
    change: "chemical",
    beforeGroup: "COOH",
    afterGroup: "carboxylate",
    note: "Typical acid + carbonate products are salt, water and CO₂. Bubble formation alone does not distinguish CO₂ from H₂; use the original test result.",
  },
  ester: {
    title: "Ethanoic acid and ethanol: named ester supplied",
    reactant: "Ethanoic acid",
    partner: "Ethanol under the supplied ester-forming conditions",
    originalObservation:
      "The supplied chemical analysis identifies ethyl ethanoate and water. No gas-test observation is given.",
    result: "esterAndWater",
    gas: "notEstablished",
    change: "chemical",
    beforeGroup: "COOH",
    afterGroup: "ester",
    note: "Ethyl ethanoate is the AQA-required ester name. This activity identifies products; detailed conditions and molecular assembly follow in the organic-reactions lesson.",
  },
  dehydrate: {
    title: "Pearson extension: alcohol dehydration",
    reactant: "Ethanol",
    partner: "The supplied dehydration treatment",
    originalObservation:
      "The product formulas supplied are C₂H₄ and H₂O; the carbon-containing product has C=C.",
    result: "alkeneAndWater",
    gas: "notEstablished",
    change: "chemical",
    beforeGroup: "OH",
    afterGroup: "CCdouble",
    note: "Pearson explicitly includes alcohol dehydration to an alkene. The treatment is provided here; do not confuse removal of water with adding water across C=C.",
  },
};
export type AlcoholCombustion = {
  title: string;
  name: string;
  n: number;
  ratio: [number, number, number, number];
  note: string;
};
export const alcoholCombustions: Record<string, AlcoholCombustion> = {
  initial: {
    title: "Methanol includes oxygen in its fuel formula",
    name: "methanol",
    n: 1,
    ratio: [2, 3, 2, 4],
    note: "Use the intact supplied fuel CH₄O. Its oxygen atom also contributes to the original inventory.",
  },
  ethanol: {
    title: "Ethanol complete combustion",
    name: "ethanol",
    n: 2,
    ratio: [1, 3, 2, 3],
    note: "The original fuel formula is C₂H₆O, also written C₂H₅OH. Sufficient oxygen is supplied.",
  },
  propanol: {
    title: "Propanol needs a whole-number equation",
    name: "propanol",
    n: 3,
    ratio: [2, 9, 6, 8],
    note: "Use positive whole-number coefficients. One fuel molecule would require a fractional O₂ amount in the simplest ratio; scale the entire equation.",
  },
  butanol: {
    title: "Butanol complete combustion",
    name: "butanol",
    n: 4,
    ratio: [1, 6, 4, 5],
    note: "Balance carbon, then hydrogen, then oxygen, including the oxygen already present in the supplied C₄H₁₀O.",
  },
  repeated: {
    title: "Two ethanol molecules: positive balanced multiple",
    name: "ethanol",
    n: 2,
    ratio: [2, 6, 4, 6],
    note: "The original reference scales all coefficients by two. Any positive whole-number balanced multiple of the same ratio is accepted.",
  },
  supplied: {
    title: "Supplied pentanol formula: no extra name recall",
    name: "pentanol",
    n: 5,
    ratio: [2, 15, 10, 12],
    note: "The extension name pentanol and formula C₅H₁₂O are supplied. This is an equation exercise, not recall beyond the first four names.",
  },
};
export type FermentationRecord = {
  title: string;
  original: string;
  yeastReport: string;
  temperatureReport: string;
  oxygenReport: string;
  productReport: string;
  stage: string;
  feed: string;
  yeast: string;
  temperature: string;
  oxygen: string;
  products: string;
  reason: string;
  collection: string;
  note: string;
};
export const fermentationCases: Record<string, FermentationRecord> = {
  initial: {
    title: "Warm sugar solution with yeast: create an aqueous product",
    original: "A glucose solution is to produce an aqueous ethanol mixture.",
    yeastReport: "Fresh yeast provides enzymes.",
    temperatureReport: "The supplied working range is 30–40°C.",
    oxygenReport:
      "The intended ethanol fermentation is under anaerobic conditions.",
    productReport:
      "Ethanol and CO₂ are the fermentation products; water remains in the mixture.",
    stage: "fermentation",
    feed: "sugarSolution",
    yeast: "enzymes",
    temperature: "warm",
    oxygen: "anaerobic",
    products: "ethanolAndCarbonDioxide",
    reason: "enzymeCatalysis",
    collection: "aqueousMixture",
    note: "Use the original conditions and product evidence to explain ethanol fermentation.",
  },
  cold: {
    title: "Cold conditions can slow fermentation",
    original:
      "Compare a glucose/yeast mixture at8°C with the supplied warm comparison.",
    yeastReport: "Both mixtures contain the same fresh yeast.",
    temperatureReport:
      "The original cold mixture is8°C; the supplied comparison is35°C.",
    oxygenReport: "Both comparisons use the stated anaerobic conditions.",
    productReport:
      "The cold mixture gives a smaller reported CO₂ volume in the same time; it is not reported as zero.",
    stage: "fermentation",
    feed: "sugarSolution",
    yeast: "enzymes",
    temperature: "slowerCold",
    oxygen: "anaerobic",
    products: "ethanolAndCarbonDioxide",
    reason: "lowerRate",
    collection: "aqueousMixture",
    note: "A slower reported rate is not a universal claim that every cold mixture stops completely.",
  },
  hot: {
    title: "Supplied high-heat enzyme damage",
    original:
      "A glucose/yeast mixture has undergone the stated high-heat treatment.",
    yeastReport:
      "The supplied analysis states that the yeast enzymes were denatured.",
    temperatureReport:
      "The stated treatment is70°C and has damaged this preparation.",
    oxygenReport: "The intended ethanol process remains anaerobic.",
    productReport:
      "The supplied original report records no measurable fermentation under this damaged preparation.",
    stage: "fermentation",
    feed: "sugarSolution",
    yeast: "damagedEnzymes",
    temperature: "damagedHighHeat",
    oxygen: "anaerobic",
    products: "notDemonstrated",
    reason: "enzymeDamage",
    collection: "unreactedMixture",
    note: "Use the supplied damage report. The one treatment is not a universal exact denaturation threshold for every yeast/enzyme.",
  },
  noYeast: {
    title: "No supplied enzyme catalyst",
    original:
      "The stated glucose solution contains no yeast or other supplied fermentation catalyst.",
    yeastReport: "No yeast or alternative active enzymes are present.",
    temperatureReport: "The original mixture is35°C.",
    oxygenReport: "The intended process is anaerobic.",
    productReport:
      "No ethanol formation is demonstrated in the supplied comparison.",
    stage: "fermentation",
    feed: "sugarSolution",
    yeast: "absentEnzymes",
    temperature: "warm",
    oxygen: "anaerobic",
    products: "notDemonstrated",
    reason: "missingCatalyst",
    collection: "unreactedMixture",
    note: "Warm sugar solution alone does not provide the specified yeast enzyme catalyst.",
  },
  separate: {
    title: "Fractional distillation after fermentation",
    original:
      "The supplied fermentation mixture already contains water and ethanol; the target is a more concentrated ethanol solution.",
    yeastReport: "New enzyme catalysis is not the separation target.",
    temperatureReport:
      "The supplied reference boiling points are ethanol78°C and water100°C; they are not guaranteed mixture cutoffs.",
    oxygenReport:
      "Oxygen exclusion is not the chemical basis of this physical separation.",
    productReport:
      "The collected solution is ethanol-enriched, not established as absolutely pure.",
    stage: "fractionalDistillation",
    feed: "ethanolWaterMixture",
    yeast: "notRequiredForSeparation",
    temperature: "vaporiseAndCondense",
    oxygen: "notRequiredForSeparation",
    products: "sameMolecules",
    reason: "differentBoilingBehaviour",
    collection: "enrichedMixture",
    note: "The fermentation creates molecules; subsequent separation preserves their identities. Lower boiling point does not promise a perfectly pure collected fraction.",
  },
  gasEvidence: {
    title: "Use supplied CO₂ evidence without proving ethanol purity",
    original:
      "A glucose/yeast process is supplied with a gas-test report and a separate product analysis.",
    yeastReport: "Fresh yeast enzymes are active.",
    temperatureReport: "The supplied warm condition is35°C.",
    oxygenReport: "The stated ethanol process is anaerobic.",
    productReport:
      "Limewater becomes milky with the collected gas; separate analysis identifies ethanol in the aqueous liquid.",
    stage: "fermentation",
    feed: "sugarSolution",
    yeast: "enzymes",
    temperature: "warm",
    oxygen: "anaerobic",
    products: "ethanolAndCarbonDioxide",
    reason: "enzymeCatalysis",
    collection: "aqueousMixture",
    note: "The gas test supports CO₂, not ethanol purity. The liquid’s ethanol identification is supplied by the separate analysis.",
  },
};
export type FuelRecord =
  | {
      title: string;
      kind: "measurement";
      before: [number, number];
      after: [number, number];
      initial: [number, number];
      final: [number, number];
      water: [number, number];
      names: [string, string];
      controls: string;
      judgement: string;
      limitation: string;
      note: string;
    }
  | {
      title: string;
      kind: "specifiedEnergy";
      rate: number;
      target: number;
      name: string;
      note: string;
    };
export const fuelComparisons: Record<string, FuelRecord> = {
  initial: {
    title: "Equal-water comparison: normalize by actual fuel consumed",
    kind: "measurement",
    before: [20.4, 30.5],
    after: [19.2, 29.5],
    initial: [20, 20],
    final: [32, 34],
    water: [100, 100],
    names: ["ethanol", "propanol"],
    controls: "Matched water mass, apparatus, gap and supplied conditions.",
    judgement: "BgreaterPerGram",
    limitation: "observedNotTrueCombustionEnergy",
    note: "Use burner BEFORE minus AFTER and water final minus initial. For the matched apparatus compare temperature rise per gram consumed, not the larger fuel container or final reading.",
  },
  reversed: {
    title: "Larger raw rise can give a smaller per-gram response",
    kind: "measurement",
    before: [25, 26],
    after: [23, 25.2],
    initial: [20, 20],
    final: [40, 30],
    water: [100, 100],
    names: ["ethanol", "butanol"],
    controls:
      "Matched water mass and apparatus; the consumed fuel masses differ.",
    judgement: "BgreaterPerGram",
    limitation: "observedNotTrueCombustionEnergy",
    note: "Fuel A gives20°C from2.0g; fuel B gives10°C from0.8g. Normalize before claiming a per-gram ranking.",
  },
  differentStarts: {
    title: "Final water temperatures are not temperature changes",
    kind: "measurement",
    before: [21, 31],
    after: [20, 30],
    initial: [25, 15],
    final: [35, 29],
    water: [100, 100],
    names: ["propanol", "butanol"],
    controls:
      "Matched water mass/apparatus and1.0g consumed; initial temperatures differ.",
    judgement: "BgreaterPerGram",
    limitation: "observedNotTrueCombustionEnergy",
    note: "A higher final reading does not imply a larger rise. Calculate each change from its OWN original initial value.",
  },
  unequalWater: {
    title: "Unequal heated water limits the direct rise comparison",
    kind: "measurement",
    before: [22, 32],
    after: [21, 31],
    initial: [20, 20],
    final: [32, 30],
    water: [200, 100],
    names: ["ethanol", "propanol"],
    controls:
      "Water mass differs; the supplied water materials are otherwise the same.",
    judgement: "notComparableFromRiseAlone",
    limitation: "unequalWaterMass",
    note: "°C/g alone is not an energy-per-gram comparison across these unequal water masses. Match/control the heated water, or use a separately supplied energy calculation; do not label degrees as joules.",
  },
  heatLoss: {
    title: "Repeated readings do not remove systematic heat loss",
    kind: "measurement",
    before: [23, 33],
    after: [22, 32],
    initial: [20, 20],
    final: [30, 30],
    water: [100, 100],
    names: ["ethanol", "propanol"],
    controls:
      "Matched apparatus; the original report states appreciable heat transfer to surroundings in every repeat.",
    judgement: "equalObservedResponse",
    limitation: "heatLossNotRemovedByRepeats",
    note: "Equal observed normalized responses are not proof of equal true combustion energies. Repeating the same heat-loss bias does not automatically remove it.",
  },
  equalEnergy: {
    title: "A supplied energy-per-gram value determines fuel mass",
    kind: "specifiedEnergy",
    rate: 28,
    target: 35,
    name: "ethanol",
    note: "This problem SUPPLIES28kJ/g, rather than converting measured°C/g into energy. Find the mass required for35kJ; it is a stated illustrative value, not a universal ethanol constant.",
  },
};
export type FuelPlotRecord = {
  /** Existing fuel plots retain curved fits; temperature scatter uses a straight line. */
  fitKind?: "straight";
  context?: "temperature";
  title: string;
  xName: string;
  xUnit: string;
  yName: string;
  yUnit: string;
  points: [number, number][];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xTick: number;
  yTick: number;
  trend: string;
  targetX: number;
  estimateRange: [number, number];
  limit: string;
  note: string;
};
export const fuelPlots: Record<string, FuelPlotRecord> = {
  initial: {
    title: "Supplied alcohol-series energy data: flattening trend",
    xName: "Carbon atoms in one alcohol molecule",
    xUnit: "atoms",
    yName: "Supplied energy released per gram",
    yUnit: "kJ/g",
    points: [
      [2, 30],
      [3, 34],
      [4, 36.5],
      [5, 38],
      [6, 39],
      [7, 39.7],
    ],
    xMin: 1,
    xMax: 8,
    yMin: 28,
    yMax: 44,
    xTick: 1,
    yTick: 2,
    trend: "increasesWithSmallerGains",
    targetX: 8,
    estimateRange: [40, 40.6],
    limit: "extrapolatedEstimate",
    note: "Original supplied illustration, not a universal measured alcohol table. Names/formulas beyond the first four are supplied if needed. The y-axis starts at 28, not zero; the gains become smaller.",
  },
  inside: {
    title: "Interpolation within original fuel data",
    xName: "Carbon atoms in one alcohol molecule",
    xUnit: "atoms",
    yName: "Supplied energy released per gram",
    yUnit: "kJ/g",
    points: [
      [2, 29],
      [4, 35],
      [6, 38],
      [8, 39.5],
    ],
    xMin: 1,
    xMax: 9,
    yMin: 26,
    yMax: 42,
    xTick: 1,
    yTick: 2,
    trend: "increasesWithSmallerGains",
    targetX: 5,
    estimateRange: [36, 37.5],
    limit: "interpolatedEstimate",
    note: "The target lies between measured/supplied points, but a fitted estimate is still not a directly reported observation. A smooth supported curve can differ from straight point-to-point joins.",
  },
  normalized: {
    title: "Original measured responses: equal scale for per-gram data",
    xName: "Fuel A burned",
    xUnit: "g",
    yName: "Original water temperature rise",
    yUnit: "°C",
    points: [
      [0.5, 5],
      [1, 10],
      [1.5, 15],
      [2, 20],
    ],
    xMin: 0,
    xMax: 2.5,
    yMin: 0,
    yMax: 25,
    xTick: 0.5,
    yTick: 5,
    trend: "approximatelyProportional",
    targetX: 1.25,
    estimateRange: [12.25, 12.75],
    limit: "interpolatedEstimate",
    note: "This supplied matched-apparatus illustration is proportional within the stated data. It does not make all alcohol-series energy graphs straight lines.",
  },
  decreasing: {
    title: "A supplied heat-loss comparison decreases",
    xName: "Supplied burner-to-container gap",
    xUnit: "cm",
    yName: "Water temperature rise per gram",
    yUnit: "°C/g",
    points: [
      [2, 16],
      [4, 12],
      [6, 9],
      [8, 7],
    ],
    xMin: 0,
    xMax: 10,
    yMin: 0,
    yMax: 20,
    xTick: 2,
    yTick: 5,
    trend: "decreases",
    targetX: 5,
    estimateRange: [10, 11.5],
    limit: "interpolatedEstimate",
    note: "Only the stated gap changes in the original illustration. A decreasing observation trend is not an increase in the intrinsic chemical energy of the alcohol.",
  },
  equal: {
    title: "Equal observed normalized response",
    xName: "Supplied repeat number",
    xUnit: "repeat",
    yName: "Water temperature rise per gram",
    yUnit: "°C/g",
    points: [
      [1, 10],
      [2, 10],
      [3, 10],
      [4, 10],
    ],
    xMin: 0,
    xMax: 5,
    yMin: 6,
    yMax: 14,
    xTick: 1,
    yTick: 2,
    trend: "constantObserved",
    targetX: 5,
    estimateRange: [9.75, 10.25],
    limit: "extrapolatedEstimate",
    note: "Repeated equal readings can support repeatability; they do not show a systematic heat-loss error has disappeared. The y-axis starts at 6, not zero.",
  },
  scatter: {
    title: "Scattered original fuel observations",
    xName: "Fuel B burned",
    xUnit: "g",
    yName: "Original water temperature rise",
    yUnit: "°C",
    points: [
      [0.5, 5.2],
      [1, 9.8],
      [1.5, 15.4],
      [2, 19.7],
    ],
    xMin: 0,
    xMax: 2.5,
    yMin: 0,
    yMax: 25,
    xTick: 0.5,
    yTick: 5,
    trend: "approximatelyProportional",
    targetX: 1.25,
    estimateRange: [12, 13],
    limit: "interpolatedEstimate",
    note: "A supported best-fit estimate need not pass exactly through every original observation. Keep the observations unchanged when editing the proposed curve or estimate.",
  },
};
export const alcoholRecords = {
  structure: organicStructures,
  reaction: organicReactions,
  combustion: alcoholCombustions,
  fermentation: fermentationCases,
  fuel: fuelComparisons,
  plot: fuelPlots,
};

export const FUEL_GRID_SUBDIVISIONS = 5;
export function fuelPlotTolerance(data: FuelPlotRecord) {
  return {
    x: data.xTick / (2 * FUEL_GRID_SUBDIVISIONS),
    y: data.yTick / (2 * FUEL_GRID_SUBDIVISIONS),
  };
}
