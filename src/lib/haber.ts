export type HaberMode =
  | "feed"
  | "loop"
  | "conditions"
  | "graph"
  | "nutrients"
  | "rock"
  | "salt"
  | "preparation";
export type HaberBoard = Record<string, string>;
export type HaberGiven = {
  title: string;
  note: string;
  rows?: readonly { label: string; text: string }[];
  table?: {
    caption: string;
    head: readonly string[];
    rows: readonly (readonly string[])[];
  };
  flow?: boolean;
  feedNitrogen?: number;
  bars?: { label: string; field: string }[];
  graph?: {
    xLabel: string;
    yLabel: string;
    xMax: number;
    yMax: number;
    points: readonly (readonly [number, number])[];
    draft?: { x: number; field: string }[];
    joinDraft?: boolean;
  };
};
export type HaberRecord = HaberGiven & {
  mode: HaberMode;
  expected: HaberBoard;
  feedback: string;
  higher?: boolean;
};
export const haberFields: Record<HaberMode, readonly string[]> = {
  feed: ["nitrogenSource", "hydrogenSource", "hydrogenAmount", "ammoniaAmount"],
  loop: ["action", "productState", "remaining"],
  conditions: ["rate", "yield", "reason"],
  graph: ["first", "second", "third"],
  nutrients: ["nitrogenMass", "phosphorusMass", "potassiumMass", "otherMass"],
  rock: ["product", "usefulness"],
  salt: ["acid", "saltName", "formula"],
  preparation: ["endpoint", "indicator", "crystals", "scale"],
};
export const haberNumeric = [
  "hydrogenAmount",
  "ammoniaAmount",
  "first",
  "second",
  "third",
  "nitrogenMass",
  "phosphorusMass",
  "potassiumMass",
  "otherMass",
];
export const haberLabels: Record<string, string> = {
  nitrogenSource: "Nitrogen source",
  hydrogenSource: "Hydrogen source",
  hydrogenAmount: "Hydrogen feed / mol",
  ammoniaAmount: "Maximum ammonia / mol",
  action: "Separator action",
  productState: "Removed ammonia state",
  remaining: "Unreacted nitrogen and hydrogen",
  rate: "Reaction rate",
  yield: "Equilibrium ammonia yield",
  reason: "Chemical explanation",
  first: "First graph reading",
  second: "Second graph reading",
  third: "Third graph reading",
  nitrogenMass: "Nitrogen / kg",
  phosphorusMass: "Phosphorus / kg",
  potassiumMass: "Potassium / kg",
  otherMass: "Other elements / kg",
  product: "Phosphate treatment product",
  usefulness: "Why treatment helps",
  acid: "Acid required",
  saltName: "Ammonium salt",
  formula: "Salt formula",
  endpoint: "Find reacting volumes",
  indicator: "Repeat for pure product",
  crystals: "Obtain crystals",
  scale: "Choose for large-scale output",
  air: "Air",
  naturalGas: "Natural gas",
  sand: "Sand",
  limestone: "Limestone",
  cool: "Cool the mixture",
  filter: "Filter the mixture",
  heat: "Heat the mixture",
  liquid: "Liquid",
  gas: "Gas",
  solid: "Solid",
  recycle: "Recycle to the reactor",
  discard: "Discard all gases",
  allReact: "Assume all reacted",
  faster: "Faster",
  slower: "Slower",
  same: "Unchanged",
  higher: "Higher",
  lower: "Lower",
  exo: "Forward exothermic",
  fewer: "Fewer gas molecules",
  activation: "Lower activation energy",
  spent: "Catalyst is consumed",
  nitrate: "Calcium nitrate",
  single: "Single superphosphate",
  triple: "Triple superphosphate",
  rawRock: "Raw phosphate rock",
  soluble: "Soluble products",
  destroy: "Creates P atoms",
  insoluble: "Insoluble products",
  nitric: "Nitric acid",
  sulfuric: "Sulfuric acid",
  hydrochloric: "Hydrochloric acid",
  amNitrate: "Ammonium nitrate",
  amSulfate: "Ammonium sulfate",
  amChloride: "Ammonium chloride",
  fNitrate: "NH₄NO₃",
  fSulfate: "(NH₄)₂SO₄",
  fChloride: "NH₄Cl",
  titrate: "Use titration",
  excess: "Unknown excess acid",
  noIndicator: "Without indicator",
  keepIndicator: "With indicator",
  concentrate: "Crystallise, filter, dry",
  dryBoil: "Boil completely dry",
  continuous: "Continuous industry",
  batch: "Laboratory batches",
};
export const haberChoices: Record<string, readonly string[]> = {
  nitrogenSource: ["air", "naturalGas", "sand"],
  hydrogenSource: ["naturalGas", "air", "limestone"],
  action: ["cool", "filter", "heat"],
  productState: ["gas", "liquid", "solid"],
  remaining: ["recycle", "discard", "allReact"],
  rate: ["faster", "slower", "same"],
  yield: ["higher", "lower", "same"],
  reason: ["exo", "fewer", "activation", "spent"],
  product: ["nitrate", "single", "triple", "rawRock"],
  usefulness: ["soluble", "destroy", "insoluble"],
  acid: ["nitric", "sulfuric", "hydrochloric"],
  saltName: ["amNitrate", "amSulfate", "amChloride"],
  formula: ["fNitrate", "fSulfate", "fChloride"],
  endpoint: ["titrate", "excess"],
  indicator: ["noIndicator", "keepIndicator"],
  crystals: ["concentrate", "dryBoil"],
  scale: ["continuous", "batch"],
};
const equation =
  "N₂(g) + 3H₂(g) ⇌ 2NH₃(g). Maximum assumes complete forward conversion; actual per-pass conversion is smaller.";
export const haberRecords: Record<string, HaberRecord> = {
  feed2: {
    feedNitrogen: 2,
    mode: "feed",
    title: "Build the feed",
    note: "Purified gas feed: 2 mol N₂. Supply the reacting ratio, then predict the theoretical maximum NH₃.",
    rows: [{ label: "Equation", text: equation }],
    expected: {
      nitrogenSource: "air",
      hydrogenSource: "naturalGas",
      hydrogenAmount: "6",
      ammoniaAmount: "4",
    },
    feedback:
      "Nitrogen comes from air; a common hydrogen source is methane in natural gas (processed with steam). N₂: H₂: NH₃ amounts are 1:3:2, so 2 mol N₂ needs 6 mol H₂ and could make 4 mol NH₃. These are mole ratios, not mass ratios. Purification protects the catalyst from contaminants.",
  },
  feed5: {
    feedNitrogen: 5,
    mode: "feed",
    title: "Scale all coefficients",
    note: "Purified feed: 5 mol N₂. Supply H₂ and the maximum NH₃ amount.",
    rows: [{ label: "Equation", text: equation }],
    expected: {
      nitrogenSource: "air",
      hydrogenSource: "naturalGas",
      hydrogenAmount: "15",
      ammoniaAmount: "10",
    },
    feedback:
      "Multiply every coefficient by five: 5 mol N₂ +15 mol H₂ →10 mol NH₃ at complete theoretical conversion. The reversible reactor does not achieve that in one pass.",
  },
  loop: {
    mode: "loop",
    title: "Separate and return",
    note: "Reactor outlet contains N₂, H₂ and NH₃. Choose the separator operation and the destination of the unreacted gases.",
    flow: true,
    expected: { action: "cool", productState: "liquid", remaining: "recycle" },
    feedback:
      "Cool the outlet so ammonia condenses to a liquid and is removed. Nitrogen and hydrogen remain gaseous under the separator conditions and return to the reactor. Filtration alone cannot separate this gas mixture. The reversible reaction only converts part of the feed per pass.",
  },
  hot: {
    mode: "conditions",
    higher: true,
    title: "Raise temperature",
    note: "Higher: raise temperature from 450 to 550 °C at fixed pressure, feed and catalyst. The forward reaction is exothermic.",
    expected: { rate: "faster", yield: "lower", reason: "exo" },
    feedback:
      "Higher temperature makes collisions more frequent and increases the fraction with enough activation energy, so reaction rate increases. Equilibrium shifts towards the endothermic reverse reaction, so equilibrium NH₃ yield falls. Rate and equilibrium amount are different quantities.",
  },
  cold: {
    mode: "conditions",
    higher: true,
    title: "Lower temperature",
    note: "Higher: lower temperature from 450 to 350 °C at fixed pressure and feed. The forward reaction releases heat.",
    expected: { rate: "slower", yield: "higher", reason: "exo" },
    feedback:
      "Cooling favours exothermic ammonia formation at equilibrium, but fewer collisions have enough activation energy and the rate falls. A high equilibrium yield may take commercially unacceptable time.",
  },
  pressure: {
    mode: "conditions",
    higher: true,
    title: "Raise pressure",
    note: "Higher: increase pressure by compression at fixed temperature. N₂ +3H₂ ⇌2NH₃; all species are gases in the reactor.",
    expected: { rate: "faster", yield: "higher", reason: "fewer" },
    feedback:
      "Compression increases collision frequency, increasing rate. Four reactant gas molecules form two product molecules, so increased pressure favours ammonia at equilibrium. Compression uses energy and stronger vessels cost more; the maximum possible pressure is not automatically economical.",
  },
  catalyst: {
    mode: "conditions",
    higher: true,
    title: "Add an iron catalyst",
    note: "Higher: compare identical fixed temperature, pressure and feed with and without iron. Compare the eventual equilibrium amounts.",
    expected: { rate: "faster", yield: "same", reason: "activation" },
    feedback:
      "Iron provides a pathway with lower activation energy. Both forward and reverse reactions speed up; equilibrium is reached sooner but its position and eventual yield are unchanged at the same temperature and pressure. The catalyst is not consumed overall. Useful rates at lower temperatures than an uncatalysed route can reduce heating energy costs.",
  },
  pressureGraph: {
    mode: "graph",
    higher: true,
    title: "Read a pressure–yield graph",
    note: "Higher: original illustrative equilibrium data at fixed 450 °C. Read yield at 100, 200 and 300 atm respectively. Lines join data; they are not a universal Haber law.",
    graph: {
      xLabel: "Pressure / atm",
      yLabel: "Equilibrium yield / %",
      xMax: 400,
      yMax: 40,
      points: [
        [100, 12],
        [200, 22],
        [300, 30],
        [400, 36],
      ],
    },
    table: {
      caption: "Fixed-temperature data",
      head: ["Pressure / atm", "Yield / %"],
      rows: [
        ["100", "12"],
        ["200", "22"],
        ["300", "30"],
        ["400", "36"],
      ],
    },
    expected: { first: "12", second: "22", third: "30" },
    feedback:
      "Read pressure on x and equilibrium percentage yield on y: 12%, 22%, 30%. Across the observed 100–400 atm range, successive 100-atm increases add 10, 8 and 6 percentage points. These data describe equilibrium amounts, not production rate.",
  },
  betweenGraph: {
    mode: "graph",
    higher: true,
    title: "Interpolate, then distinguish",
    note: "Higher: original fixed-temperature graph. Estimate yields at 150, 250 and 350 atm using the drawn straight segments. Do not claim exact measured values between observations.",
    graph: {
      xLabel: "Pressure / atm",
      yLabel: "Equilibrium yield / %",
      xMax: 400,
      yMax: 40,
      points: [
        [100, 12],
        [200, 22],
        [300, 30],
        [400, 36],
      ],
    },
    expected: { first: "17", second: "26", third: "33" },
    feedback:
      "Halfway on each straight segment gives 17%,26%,33%. These are interpolation estimates under the supplied graph convention. Extending beyond 400 atm would be extrapolation and less secure.",
  },
  rateGraph: {
    mode: "graph",
    higher: true,
    title: "Read rate, not equilibrium",
    note: "Higher: original illustrative INITIAL rates under matched feed, pressure and catalyst. Read rate at 350,450,550 °C respectively; this is not an equilibrium-yield graph.",
    graph: {
      xLabel: "Temperature / °C",
      yLabel: "Initial rate / mol min⁻¹",
      xMax: 600,
      yMax: 40,
      points: [
        [350, 4],
        [450, 16],
        [550, 36],
      ],
    },
    table: {
      caption: "Initial rate at matched conditions",
      head: ["Temperature / °C", "Rate / mol min⁻¹"],
      rows: [
        ["350", "4"],
        ["450", "16"],
        ["550", "36"],
      ],
    },
    expected: { first: "4", second: "16", third: "36" },
    feedback:
      "The initial rates are 4,16,36 mol min⁻¹. Faster reaction at higher temperature does not mean more ammonia at equilibrium. For the exothermic forward reaction, equilibrium ammonia yield falls as temperature rises.",
  },
  mix20: {
    mode: "nutrients",
    title: "Read an NPK formulation",
    note: "20 kg original formulation contains elemental mass percentages N 15%, P 5%, K 10%. The rest is other elements in its compounds. These are ELEMENT percentages, not commercial P₂O₅/K₂O label equivalents.",
    table: {
      caption: "Elemental analysis",
      head: ["Element", "Mass / %"],
      rows: [
        ["Nitrogen", "15"],
        ["Phosphorus", "5"],
        ["Potassium", "10"],
      ],
    },
    expected: {
      nitrogenMass: "3",
      phosphorusMass: "1",
      potassiumMass: "2",
      otherMass: "14",
    },
    feedback:
      "Each percentage uses the full 20 kg: N 3 kg, P 1 kg, K 2 kg. Other elements are 70%=14 kg. NPK compounds also contain atoms such as oxygen and hydrogen; nutrient percentages need not add to 100. A formulation combines salts in deliberately fixed proportions.",
  },
  mix50: {
    mode: "nutrients",
    title: "Keep the same denominator",
    note: "50 kg original formulation: elemental N 12%, P 8%, K 16%; rest other elements. Calculate all four masses.",
    expected: {
      nitrogenMass: "6",
      phosphorusMass: "4",
      potassiumMass: "8",
      otherMass: "32",
    },
    feedback:
      "Apply each fraction to 50 kg:6,4,8 kg. N+P+K total 18 kg, so other elements 32 kg. The whole formulation contains 50 kg of compounds, not 18 kg of pure elements mixed with empty space.",
  },
  nitricRock: {
    mode: "rock",
    title: "Treat rock with nitric acid",
    note: "Mined phosphate rock is too insoluble for direct use. It is treated with nitric acid. Identify the calcium salt and why acid treatment helps.",
    expected: { product: "nitrate", usefulness: "soluble" },
    feedback:
      "Nitric acid treatment produces calcium nitrate and phosphoric acid. Calcium nitrate is a salt; phosphoric acid is an acid and a phosphorus source for further integrated production. Treatment makes useful soluble compounds; it does not create phosphorus atoms.",
  },
  sulfuricRock: {
    mode: "rock",
    title: "Treat rock with sulfuric acid",
    note: "Phosphate rock is treated with sulfuric acid. Identify the fertiliser mixture, not a pure single salt.",
    expected: { product: "single", usefulness: "soluble" },
    feedback:
      "Single superphosphate contains calcium dihydrogenphosphate, Ca(H₂PO₄)₂, and calcium sulfate, CaSO₄. The dihydrogenphosphate supplies soluble phosphorus. The mixture is not pure calcium sulfate; calcium sulfate contains no phosphorus.",
  },
  phosphoricRock: {
    mode: "rock",
    title: "Treat rock with phosphoric acid",
    note: "Phosphate rock is treated with phosphoric acid. Name the fertiliser product and its useful change.",
    expected: { product: "triple", usefulness: "soluble" },
    feedback:
      "Triple superphosphate supplies calcium dihydrogenphosphate, Ca(H₂PO₄)₂. It is different from the poorly soluble untreated phosphate rock and does not include the calcium sulfate coproduct of sulfuric acid treatment. The 2021 AQA scheme accepts calcium dihydrogenphosphate or triple superphosphate.",
  },
  nitrateSalt: {
    mode: "salt",
    title: "Make ammonium nitrate",
    note: "React aqueous ammonia with a suitable acid to make ammonium nitrate. Choose the acid, name and formula.",
    expected: { acid: "nitric", saltName: "amNitrate", formula: "fNitrate" },
    feedback:
      "NH₃ +HNO₃ →NH₄NO₃. Nitric acid supplies nitrate; ammonia becomes ammonium. Ammonium nitrate supplies nitrogen but contains no phosphorus or potassium. Ammonia also provides a feedstock for industrial nitric-acid manufacture.",
  },
  sulfateSalt: {
    mode: "salt",
    title: "Make ammonium sulfate",
    note: "Choose the acid and formula for ammonium sulfate. Ammonium ions have charge+1; sulfate ions have charge−2.",
    expected: { acid: "sulfuric", saltName: "amSulfate", formula: "fSulfate" },
    feedback:
      "2NH₃ +H₂SO₄ →(NH₄)₂SO₄. Two ammonium ions balance one sulfate ion; parentheses group NH₄. This nitrogen fertiliser contains no potassium or phosphorus.",
  },
  chlorideSalt: {
    mode: "salt",
    title: "Name the acid's salt",
    note: "Aqueous ammonia reacts with hydrochloric acid. Predict the ammonium salt and formula.",
    expected: {
      acid: "hydrochloric",
      saltName: "amChloride",
      formula: "fChloride",
    },
    feedback:
      "NH₃ +HCl →NH₄Cl. Hydrochloric acid makes a chloride, not a nitrate or sulfate. This is a simulated salt-preparation comparison, not unsupervised laboratory instruction.",
  },
  preparation: {
    mode: "preparation",
    title: "Compare salt production",
    note: "School simulation: two soluble reactants, ammonia solution and sulfuric acid. Industrial case: continuously react solution streams, evaporate in a warm column, continuously collect dry crystals. Laboratory case: react measured volumes, concentrate, cool, filter and dry crystals in repeated batches.",
    expected: {
      endpoint: "titrate",
      indicator: "noIndicator",
      crystals: "concentrate",
      scale: "continuous",
    },
    feedback:
      "Titrate to find neutralising volumes, then repeat those volumes without indicator to avoid contaminating the product. Concentrate the solution, allow cooling/crystallisation, filter and dry. The supplied industrial continuous streams/collection suit large-scale sustained production; the laboratory batch requires repeated operations. Given facts do not prove lower cost, energy or better purity. Real technique requires supervised practical work.",
  },
};
export function haberRecord(mode: HaberMode, id: string) {
  return Object.hasOwn(haberRecords, id) && haberRecords[id].mode === mode
    ? haberRecords[id]
    : null;
}
export function initialHaber(mode: HaberMode, record: string): HaberBoard {
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(haberFields[mode].map((f) => [f, ""])),
  };
}
export function haberNumber(s: string) {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
export function validHaber(
  mode: HaberMode,
  v: unknown,
  record?: string,
): v is HaberBoard {
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    Object.getPrototypeOf(v) !== Object.prototype
  )
    return false;
  const b = v as HaberBoard,
    fields = haberFields[mode];
  return (
    !!fields &&
    b.version === "1" &&
    b.mode === mode &&
    !!haberRecord(mode, b.record) &&
    (record === undefined || b.record === record) &&
    Object.keys(b).length === fields.length + 3 &&
    fields.every(
      (f) =>
        typeof b[f] === "string" &&
        (!b[f] ||
          (haberNumeric.includes(f)
            ? b[f].length <= 16
            : haberChoices[f]?.includes(b[f]))),
    )
  );
}
export function validHaberHistory(
  mode: HaberMode,
  record: string,
  h: unknown,
): h is HaberBoard[] {
  if (
    !Array.isArray(h) ||
    !h.length ||
    h.length > 500 ||
    !h.every((b) => validHaber(mode, b, record))
  )
    return false;
  const first = initialHaber(mode, record);
  return (
    Object.keys(first).every((k) => h[0][k] === first[k]) &&
    h.every(
      (b, i) =>
        !i ||
        haberFields[mode].filter((f) => b[f] !== h[i - 1][f]).length === 1,
    )
  );
}
export function checkHaber(mode: HaberMode, b: HaberBoard) {
  if (!validHaber(mode, b))
    return {
      correct: false,
      message: "Saved Haber proposal is unreadable; raw entries retained.",
    };
  const r = haberRecord(mode, b.record)!,
    fields = haberFields[mode];
  if (fields.some((f) => !b[f]))
    return {
      correct: false,
      message: "Complete each prediction. Blank entries remain unknown.",
    };
  const wrong = fields.filter((f) =>
    haberNumeric.includes(f)
      ? haberNumber(b[f]) === null ||
        Math.abs(haberNumber(b[f])! - Number(r.expected[f])) > 1e-6
      : b[f] !== r.expected[f],
  );
  return {
    correct: !wrong.length,
    message:
      (wrong.length
        ? "Reconsider " +
          wrong.map((f) => haberLabels[f].toLowerCase()).join(" and ") +
          ". "
        : "") +
      r.feedback +
      (wrong.length ? " Your entries remain as typed." : ""),
  };
}
