import type { LearningTask, LessonJourney, Tier } from "../types";
import { emptyHaberDrawing } from "../../lib/haber-drawing";
import { haberRecords as R, type HaberGiven } from "../../lib/haber";
const id = (s: string) => "haber-v1-" + s;
function choice(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  record?: string,
  data?: HaberGiven,
): LearningTask {
  const opts = [answer, ...Object.keys(errors)],
    n = [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % opts.length;
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    options: [...opts.slice(n), ...opts.slice(0, n)],
    misconceptions: errors,
    explanation,
    hint,
    ...(record
      ? {
          model: {
            kind: "haber-investigation" as const,
            mode: R[record].mode,
            record,
          },
          ...(R[record].higher ? { tier: "higher" as const } : {}),
        }
      : {}),
    ...(data ? { haberGiven: data } : {}),
  };
}
function num(
  s: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  data?: HaberGiven,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: String(answer),
    unit,
    inputMode: "decimal",
    tolerance: 1e-6,
    explanation,
    hint,
    ...(data ? { haberGiven: data } : {}),
  };
}
function construct(
  s: string,
  title: string,
  prompt: string,
  refs: readonly (readonly [string, string, number])[],
  data: HaberGiven,
  explanation: string,
  hint: string,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: JSON.stringify(
      Object.fromEntries(refs.map(([f, , v]) => [f, String(v)])),
    ),
    partLegend: "Construct your quantities",
    parts: refs.map(([f, label, answer]) => ({
      id: f,
      label,
      answer,
      inputMode: "decimal" as const,
      tolerance: 1e-6,
    })),
    haberGiven: data,
    explanation,
    hint,
  };
}
function write(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
  data?: HaberGiven,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    rubric,
    referenceResponse: answer,
    explanation:
      "Compare your saved explanation with the criteria. Written responses require manual review; no exam marks are automatically awarded.",
    hint,
    ...(data ? { haberGiven: data } : {}),
  };
}
const higher = (q: LearningTask): LearningTask => ({ ...q, tier: "higher" });
const data = (
  title: string,
  note: string,
  rows?: HaberGiven["rows"],
): HaberGiven => ({ title, note, ...(rows ? { rows } : {}) });
const warmup = [
  choice(
    "w-reversible",
    "Read the reversible symbol",
    "What does ⇌ mean in a chemical equation?",
    "The reaction can proceed in both directions",
    {
      "The reaction stops forever": "Both directions can proceed.",
      "Every reactant converts completely":
        "Reversibility does not guarantee complete conversion.",
    },
    "Products can react to form reactants again.",
    "Read both arrows.",
  ),
  num(
    "w-percent",
    "Apply a mass percentage",
    "Find 12% of a 25 kg sample.",
    3,
    "kg",
    "0.12×25=3 kg.",
    "Use the whole 25 kg.",
  ),
  choice(
    "w-charge",
    "Balance ammonium and sulfate",
    "NH₄⁺ has charge+1; SO₄²⁻ has charge−2. How many ammonium ions balance one sulfate ion?",
    "Two",
    { One: "+1−2 is not neutral.", Three: "+3−2 is not neutral." },
    "Two+1 ions balance one−2 ion.",
    "The total charge must be zero.",
  ),
  higher(
    choice(
      "w-rate",
      "Separate rate and amount",
      "Does a faster initial reaction necessarily give more product at equilibrium?",
      "No",
      { Yes: "Rate and equilibrium amount are different quantities." },
      "Kinetics describes how quickly a reaction proceeds; equilibrium describes eventual composition at fixed conditions.",
      "Distinguish how fast from how much.",
    ),
  ),
];
const refresher = [
  choice(
    "r-feed2",
    "Build the feed",
    "Choose the raw-material sources and scale the equation.",
    "6 mol H₂ for 2 mol N₂",
    {
      "2 mol H₂ for 2 mol N₂": "The reacting ratio is 1:3.",
      "6 g H₂ for 2 g N₂":
        "Coefficients compare molecules or moles, not masses.",
    },
    R.feed2.feedback,
    "Multiply every coefficient by two.",
    "feed2",
  ),
  choice(
    "r-feed5",
    "Scale the whole equation",
    "Supply the reacting feed for 5 mol N₂ and its theoretical maximum product.",
    "10 mol NH₃",
    {
      "5 mol NH₃": "The product coefficient is 2.",
      "15 mol NH₃": "15 mol is the hydrogen feed.",
    },
    R.feed5.feedback,
    "Scale 1:3:2 together.",
    "feed5",
  ),
  choice(
    "r-loop",
    "Follow ammonia through the plant",
    "Predict what cooling separates and which stream returns.",
    "Liquid ammonia leaves; nitrogen and hydrogen return",
    {
      "All three gases are filtered":
        "Ordinary filtration does not separate gases.",
      "The catalyst becomes ammonia": "Iron is not consumed overall.",
    },
    R.loop.feedback,
    "Use the different condensation behaviour.",
    "loop",
  ),
  choice(
    "r-hot",
    "Higher: increase temperature",
    "Compare rate and equilibrium yield at higher temperature.",
    "Faster rate but lower equilibrium ammonia yield",
    {
      "Both rate and yield rise": "The forward reaction is exothermic.",
      "Both rate and yield fall": "Higher temperature increases reaction rate.",
    },
    R.hot.feedback,
    "Keep rate and equilibrium separate.",
    "hot",
  ),
  choice(
    "r-cold",
    "Higher: decrease temperature",
    "Predict the cooler reactor's rate and equilibrium amount.",
    "Slower rate but higher equilibrium ammonia yield",
    {
      "Faster and more ammonia": "Lower temperature slows the reaction.",
      "No reaction can ever occur": "Slower does not mean impossible.",
    },
    R.cold.feedback,
    "Cooling favours the heat-releasing direction.",
    "cold",
  ),
  choice(
    "r-pressure",
    "Higher: increase pressure",
    "Compress the gas mixture at fixed temperature.",
    "Faster rate and higher equilibrium ammonia yield",
    {
      "More ammonia because more atoms appear": "Compression creates no atoms.",
      "Lower yield because there are more product molecules":
        "There are 2 product versus 4 reactant gas molecules.",
    },
    R.pressure.feedback,
    "Count gas coefficients and distinguish energy costs.",
    "pressure",
  ),
  choice(
    "r-catalyst",
    "Higher: add iron",
    "Predict rate and equilibrium after adding an iron catalyst.",
    "Faster rate; same equilibrium yield",
    {
      "Higher equilibrium yield": "Both reaction directions accelerate.",
      "Iron supplies nitrogen atoms":
        "Iron is the catalyst, not the nitrogen feed.",
    },
    R.catalyst.feedback,
    "Does the catalyst change equilibrium or time to reach it?",
    "catalyst",
  ),
  choice(
    "r-pressureGraph",
    "Higher: read pressure and yield",
    "Read the fixed source graph, keeping its axes and units.",
    "Pressure is the horizontal variable",
    {
      "Production rate is the vertical variable":
        "The y-axis is equilibrium percentage yield.",
      "The graph gives reactor cost": "Cost is not plotted.",
    },
    R.pressureGraph.feedback,
    "Check both axis labels.",
    "pressureGraph",
  ),
  choice(
    "r-betweenGraph",
    "Higher: estimate between observations",
    "Read the straight segments between supplied points.",
    "Interpolation within the supplied range",
    {
      "Extrapolation beyond observations":
        "The requested values lie between plotted pressures.",
      "Exact experimentally measured yields":
        "Intermediate points are estimates.",
    },
    R.betweenGraph.feedback,
    "Find halfway positions.",
    "betweenGraph",
  ),
  choice(
    "r-rateGraph",
    "Higher: read a rate graph",
    "Read initial rates without converting the units to percentage yield.",
    "mol min⁻¹",
    {
      "% equilibrium yield": "That is a different quantity.",
      Atmospheres: "That is a pressure unit.",
    },
    R.rateGraph.feedback,
    "Read the vertical-axis unit.",
    "rateGraph",
  ),
  choice(
    "r-mix20",
    "Calculate an NPK formulation",
    "Construct all four element masses from the supplied formulation.",
    "The stated percentages use the whole formulation mass",
    {
      "Only N+P+K form the denominator": "Other atoms also have mass.",
      "NPK consists of pure N, P and K":
        "The fertiliser contains compounds of these elements.",
    },
    R.mix20.feedback,
    "Multiply each percentage by 20 kg.",
    "mix20",
  ),
  choice(
    "r-mix50",
    "Account for other atoms",
    "Calculate masses and account for the rest of the formulation.",
    "Other elements have 32 kg total mass",
    {
      "The missing mass is empty space":
        "Other elements include oxygen and hydrogen.",
      "The missing mass is always pure nitrogen":
        "The nitrogen percentage is already specified.",
    },
    R.mix50.feedback,
    "Subtract the three nutrient masses from 50 kg.",
    "mix50",
  ),
  choice(
    "r-nitricRock",
    "Make soluble products from rock",
    "Select the product of nitric acid treatment.",
    "Calcium nitrate",
    {
      "Calcium chloride": "A chloride requires a chloride source.",
      "Calcium metal": "Acid treatment does not reduce calcium ions to metal.",
    },
    R.nitricRock.feedback,
    "Match nitrate to nitric acid.",
    "nitricRock",
  ),
  choice(
    "r-sulfuricRock",
    "Distinguish a mixture from one salt",
    "Identify the phosphorus-containing product mixture of sulfuric acid treatment.",
    "Single superphosphate",
    {
      "Pure calcium sulfate only": "Calcium sulfate has no phosphorus.",
      "Triple superphosphate only":
        "That is associated with phosphoric acid treatment.",
    },
    R.sulfuricRock.feedback,
    "A phosphate fertiliser must supply phosphorus.",
    "sulfuricRock",
  ),
  choice(
    "r-phosphoricRock",
    "Name the phosphate product",
    "Identify the product of phosphoric acid treatment.",
    "Triple superphosphate",
    {
      "Untreated insoluble rock":
        "Acid treatment changes the useful chemical form.",
      "Potassium chloride": "There is no supplied potassium source.",
    },
    R.phosphoricRock.feedback,
    "Triple superphosphate supplies calcium dihydrogenphosphate.",
    "phosphoricRock",
  ),
  choice(
    "r-nitrateSalt",
    "Choose a nitrogen-fertiliser acid",
    "Build ammonium nitrate from ammonia and an acid.",
    "Nitric acid",
    {
      "Sulfuric acid": "It makes ammonium sulfate.",
      "Hydrochloric acid": "It makes ammonium chloride.",
    },
    R.nitrateSalt.feedback,
    "Read the nitrate name.",
    "nitrateSalt",
  ),
  choice(
    "r-sulfateSalt",
    "Balance ions in a fertiliser salt",
    "Choose ammonium sulfate's acid and neutral formula.",
    "(NH₄)₂SO₄",
    {
      "NH₄SO₄": "Its total ionic charge is not zero.",
      "NH₄NO₃": "This is ammonium nitrate.",
    },
    R.sulfateSalt.feedback,
    "Two ammonium ions balance one sulfate.",
    "sulfateSalt",
  ),
  choice(
    "r-chlorideSalt",
    "Link an acid to its anion",
    "Use hydrochloric acid in a simulated salt comparison.",
    "Ammonium chloride",
    {
      "Ammonium nitrate": "Nitric acid provides nitrate.",
      "Sodium chloride": "The ammonia supplies ammonium, not sodium.",
    },
    R.chlorideSalt.feedback,
    "Combine ammonium and chloride.",
    "chlorideSalt",
  ),
  choice(
    "r-preparation",
    "Compare laboratory and industrial methods",
    "Build the simulated pure-salt preparation and choose for sustained large output.",
    "Continuous industrial streams and collection",
    {
      "One unmeasured laboratory batch":
        "Unknown excess reagent contaminates product and batch output is limited.",
      "Proven lowest energy cost": "No energy dataset is supplied.",
    },
    R.preparation.feedback,
    "Use the actual process facts, not invented cost evidence.",
    "preparation",
  ),
  num(
    "r-application",
    "Work out application per area",
    "Worked method:24 bags each 400 kg are spread across 320000 m². Calculate fertiliser mass per m².",
    0.03,
    "kg/m²",
    "Total mass 24×400=9600 kg. Divide by the full 320000 m²:9600/320000=0.03 kg/m²=30 g/m². This is fertiliser mass, not nitrogen mass.",
    "Multiply bags by mass per bag, then divide by area.",
    data("Application quantities", "Original worked dataset.", [
      { label: "Bags", text: "24" },
      { label: "Each bag", text: "400 kg" },
      { label: "Area", text: "320000 m²" },
    ]),
  ),
  num(
    "r-nitrogenPercent",
    "Find nitrogen's formula-mass fraction",
    "For NH₄NO₃, Ar: N 14, H 1, O 16. Calculate the nitrogen mass percentage.",
    35,
    "%",
    "Mr=2×14+4×1+3×16=80. Nitrogen mass=28, so 28/80×100=35%. Count both nitrogen atoms; total compound mass includes H and O.",
    "Find the whole formula mass before dividing.",
    data("Formula data", "NH₄NO₃ has 2N,4H,3O; Ar: N 14, H 1, O 16."),
  ),
  higher(
    construct(
      "r-plot",
      "Higher: construct a yield graph",
      "Plot the three original observations at 100,200,300 atm by entering their yields. Join them with straight segments. This explicitly defined construction teaches plotting; it is not a fitted physical law.",
      [
        ["y1", "Yield at 100 atm / %", 10],
        ["y2", "Yield at 200 atm / %", 18],
        ["y3", "Yield at 300 atm / %", 24],
      ],
      {
        title: "Original plotting data",
        note: "Use the labelled pressure axis 0–400 atm and yield axis 0–40%. Each 100 atm and 10% major interval is equal.",
        table: {
          caption: "Observed illustrative yields",
          head: ["Pressure / atm", "Yield / %"],
          rows: [
            ["100", "10"],
            ["200", "18"],
            ["300", "24"],
          ],
        },
        graph: {
          xLabel: "Pressure / atm",
          yLabel: "Equilibrium yield / %",
          xMax: 400,
          yMax: 40,
          points: [],
          draft: [
            { x: 100, field: "y1" },
            { x: 200, field: "y2" },
            { x: 300, field: "y3" },
          ],
          joinDraft: true,
        },
      },
      "Plot(100,10),(200,18),(300,24). Check axis units and equal spacing. Lines here are the instructed straight joins, not a smooth fitted curve. Real examination graphs may require choosing the scale and drawing a smooth best-fit line.",
      "Match each pressure row to its yield coordinate.",
    ),
  ),
];
const guided = [
  {
    ...choice(
      "g-feed",
      "Build the gas feed",
      "Supply 2 mol N₂. Predict maximum NH₃.",
      "4 mol",
      {
        "2 mol": "The product coefficient is 2.",
        "6 mol": "That is the H₂ feed.",
      },
      R.feed2.feedback,
      "Scale 1:3:2 together.",
      "feed2",
    ),
    openingHint: true,
  },
  choice(
    "g-loop",
    "Separate, then recycle",
    "Operate the separator. What happens to unreacted N₂ and H₂?",
    "Returned to the reactor",
    {
      "Both liquefy with ammonia":
        "Under these cooling conditions only ammonia condenses.",
      "Destroyed by cooling": "Cooling is a physical change.",
    },
    R.loop.feedback,
    "Follow the return stream.",
    "loop",
  ),
  choice(
    "g-nutrients",
    "Convert percentages to masses",
    "Calculate the 20 kg formulation. What is its nitrogen mass?",
    "3 kg",
    {
      "15 kg": "15 is the percentage, not kilograms.",
      "20 kg": "The whole formulation is not pure nitrogen.",
    },
    R.mix20.feedback,
    "15%×20 kg.",
    "mix20",
  ),
  choice(
    "g-rock",
    "Treat phosphate rock",
    "Predict sulfuric acid treatment. Why is calcium sulfate alone an incomplete product description?",
    "It contains no phosphorus",
    {
      "It contains only phosphorus": "Its formula is CaSO₄.",
      "It is pure nitrogen": "There is no nitrogen in CaSO₄.",
    },
    R.sulfuricRock.feedback,
    "Identify where phosphorus remains.",
    "sulfuricRock",
  ),
  choice(
    "g-salt",
    "Make an ammonium fertiliser",
    "Build ammonium sulfate's formula. Which ion requires two ammonium ions?",
    "Sulfate",
    { Chloride: "Chloride has charge−1.", Nitrate: "Nitrate has charge−1." },
    R.sulfateSalt.feedback,
    "Balance+1 with−2.",
    "sulfateSalt",
  ),
  choice(
    "g-preparation",
    "Compare continuous and batch output",
    "Use the stated processes. Which one continuously collects product?",
    "The industrial warm-column process",
    {
      "The laboratory cooling flask":
        "Laboratory crystallisation is batchwise.",
      "Both are automatically continuous":
        "A repeated batch is not a continuous flow.",
    },
    R.preparation.feedback,
    "Find the continuous streams and collection.",
    "preparation",
  ),
  choice(
    "g-hot",
    "Higher: balance rate and yield",
    "Compare higher temperature with 450 °C. Why is 450 °C a compromise?",
    "Higher temperature is faster but lowers equilibrium yield",
    {
      "Higher temperature always maximises yield":
        "The forward reaction is exothermic.",
      "Lower temperature is always commercially fastest":
        "Lower temperature slows reaction.",
    },
    R.hot.feedback,
    "Compare rate with amount.",
    "hot",
  ),
  choice(
    "g-graph",
    "Higher: read a pressure–yield curve",
    "At fixed 450 °C, what is the plotted yield at 300 atm?",
    "30%",
    {
      "300%": "That is the pressure coordinate.",
      "30 mol min⁻¹": "The vertical unit is percentage yield.",
    },
    R.pressureGraph.feedback,
    "Locate 300 on x, then read y.",
    "pressureGraph",
  ),
];
const practice = [
  choice(
    "p-sources",
    "Recall the feed sources",
    "Choose the normal paired sources for nitrogen and hydrogen in the conventional Haber process.",
    "Air and natural gas",
    {
      "Natural gas and air": "The order is reversed.",
      "Sand and limestone":
        "These are glass/construction feedstocks, not Haber gases.",
    },
    "Air provides N₂; processed methane/natural gas provides H₂. Water/steam is also an accepted hydrogen-source context when appropriately processed.",
    "Recall each gas separately.",
  ),
  construct(
    "p-feed",
    "Scale an unfamiliar gas feed",
    "For N₂+3H₂⇌2NH₃, supply 7 mol N₂. Construct the required H₂ and theoretical maximum NH₃ amounts.",
    [
      ["h", "Hydrogen required / mol", 21],
      ["a", "Maximum ammonia / mol", 14],
    ],
    data(
      "Reacting amounts",
      "The coefficients compare moles, not masses. Assume complete forward conversion only for this theoretical maximum.",
    ),
    "7×3=21 mol H₂;7×2=14 mol NH₃. Actual per-pass conversion is partial.",
    "Scale all coefficients by seven.",
  ),
  choice(
    "p-conditions",
    "Recall actual reactor conditions",
    "Which combination describes the conventional industrial Haber reactor?",
    "About 450 °C, about 200 atm, iron catalyst",
    {
      "450 atm,200 °C, chlorine catalyst":
        "Temperature/pressure units and catalyst are wrong.",
      "Room temperature,1 atm, no catalyst":
        "That gives an unsuitable production rate/yield.",
    },
    "Purified gases pass over iron at about 450 °C and 200 atmospheres. These are approximate operating conditions.",
    "Keep units attached.",
  ),
  write(
    "p-cooling",
    "Explain separation and recycling",
    "Explain how the mixed reactor outlet gives liquid ammonia and what happens to the remaining feed gases.",
    "Cool the mixture so ammonia condenses/liquefies and is removed. Nitrogen and hydrogen remain gases and are recycled to the reactor. The reversible reaction only partly converts the feed in one pass.",
    [
      "Cooling causes ammonia to liquefy/condense.",
      "Liquid ammonia is removed.",
      "Unreacted nitrogen and hydrogen are recycled.",
      "Partial conversion reflects reversibility.",
    ],
    "Name the physical change and both destinations.",
  ),
  choice(
    "p-economy",
    "Separate atom economy from yield",
    "The forward equation makes only NH₃ as product. Does 100% atom economy imply 100% per-pass yield?",
    "No: one desired product does not imply complete conversion",
    {
      "Yes: all reactants must become ammonia": "The reaction is reversible.",
      "No: iron is an unwanted coproduct":
        "The catalyst is not a reaction coproduct.",
    },
    "Atom economy concerns atoms in desired versus all stoichiometric products; the forward equation has only ammonia. Actual yield/conversion concerns how much is obtained.",
    "Distinguish equation products from actual conversion.",
  ),
  construct(
    "p-pass",
    "Account for a partial pass",
    "Feed 10 mol N₂ and 30 mol H₂;30% of the N₂ reacts in this pass. Construct N₂ remaining, H₂ remaining, NH₃ formed.",
    [
      ["n", "Nitrogen remaining / mol", 7],
      ["h", "Hydrogen remaining / mol", 21],
      ["a", "Ammonia formed / mol", 6],
    ],
    data(
      "Partial conversion",
      "N₂+3H₂⇌2NH₃. The 30% refers to starting nitrogen converted, not mole fraction of the final gas mixture. Ignore losses for this account.",
    ),
    "3 mol N₂ reacts with 9 mol H₂ to make 6 mol NH₃;7 and 21 mol remain. Nitrogen atoms 20=14+6; hydrogen atoms 60=42+18. Gas-molecule/mole totals change without atom loss.",
    "Find nitrogen consumed, then use 1:3:2.",
  ),
  choice(
    "p-npk",
    "Define an NPK fertiliser",
    "Which description is correct?",
    "A formulation containing compounds of nitrogen, phosphorus and potassium",
    {
      "A mixture of pure nitrogen, phosphorus and potassium":
        "Fertilisers contain compounds.",
      "A single compound containing no other elements":
        "Formulations combine compounds in chosen proportions.",
    },
    "NPK salts supply essential elements to improve agricultural productivity; the formulation proportions match the intended use.",
    "Distinguish elements supplied from chemical forms.",
  ),
  choice(
    "p-formula",
    "Read nutrient elements from a formula",
    "Which pair of essential NPK elements occurs in KNO₃?",
    "Nitrogen and potassium",
    {
      "Nitrogen and phosphorus": "There is no P in KNO₃.",
      "Phosphorus and potassium": "The formula has N, not P.",
    },
    "K=potassium, N=nitrogen, O=oxygen. One compound can supply more than one nutrient.",
    "Read each symbol.",
  ),
  construct(
    "p-masses",
    "Calculate all element masses",
    "A 30 kg original NPK formulation contains elemental N 18%, P 6%, K 12%. Construct masses of each and all other elements.",
    [
      ["n", "Nitrogen mass / kg", 5.4],
      ["p", "Phosphorus mass / kg", 1.8],
      ["k", "Potassium mass / kg", 3.6],
      ["o", "Other element mass / kg", 19.2],
    ],
    data(
      "Elemental mass analysis",
      "Original percentages explicitly refer to elements, not P₂O₅/K₂O commercial label conventions. Every percentage uses the whole 30 kg.",
    ),
    "0.18×30=5.4;0.06×30=1.8;0.12×30=3.6 kg. Nutrients total 10.8 kg; others 19.2 kg. The four masses sum 30 kg.",
    "Calculate from the whole, then subtract the nutrient total.",
  ),
  write(
    "p-other",
    "Explain missing percentage mass",
    "A formulation has N 16%, P 4%, K 10% by elemental mass. Explain why this does not show that 70% of the fertiliser has vanished.",
    "The fertiliser contains compounds, including other elements such as oxygen and hydrogen. The three nutrient percentages total 30%; the remaining 70% is other elemental mass in the formulation. It is not empty space or lost atoms.",
    [
      "NPK are supplied in compounds.",
      "Other elements also contribute mass.",
      "30% nutrient total leaves 70% other elemental mass.",
    ],
    "Use conservation and compound formulas.",
  ),
  num(
    "p-application",
    "Calculate fertiliser application",
    "18 bags each 250 kg cover 150000 m². Find fertiliser mass spread per m².",
    0.03,
    "kg/m²",
    "18×250=4500 kg;4500/150000=0.03 kg/m²=30 g/m². This is total fertiliser, not nitrogen alone.",
    "Total bag mass divided by area.",
    data("Original application data", "18 bags,250 kg per bag,150000 m²."),
  ),
  num(
    "p-nutrientRate",
    "Calculate nitrogen application",
    "A farmer spreads 0.04 kg fertiliser per m². It contains elemental nitrogen 15% by mass. Find nitrogen mass per m² in grams.",
    6,
    "g/m²",
    "0.04×0.15=0.006 kg/m²;×1000=6 g/m². Do not report 40 g/m² as nitrogen.",
    "Apply the nitrogen fraction, then convert kg to g.",
    data(
      "Original element fraction",
      "Fertiliser application 0.04 kg/m²; nitrogen 15%.",
    ),
  ),
  choice(
    "p-mining",
    "Recall mined fertiliser feedstocks",
    "Which pair are mined potassium compounds used in fertiliser production?",
    "Potassium chloride and potassium sulfate",
    {
      "Iron and copper": "These are not the specified potassium feedstocks.",
      "Hydrogen and nitrogen": "These are the Haber gaseous feeds.",
    },
    "Potassium chloride, potassium sulfate and phosphate rock are obtained by mining. Phosphate rock requires treatment for useful soluble products.",
    "Look for named potassium salts.",
  ),
  choice(
    "p-rock",
    "Explain direct-rock limitation",
    "Why is phosphate rock unsuitable for direct use as the specified fertiliser?",
    "Its phosphorus compounds are too insoluble for useful uptake",
    {
      "It contains no phosphorus": "Phosphate compounds contain phosphorus.",
      "It creates potassium metal": "There is no such process here.",
    },
    "Plants take up dissolved compounds; acid treatment makes suitable useful products.",
    "Think about dissolved uptake.",
  ),
  choice(
    "p-nitricRock",
    "Recall nitric-acid treatment",
    "Name the calcium salt produced when phosphate rock is treated with nitric acid.",
    "Calcium nitrate",
    {
      "Calcium sulfate": "Sulfuric acid supplies sulfate.",
      "Calcium metal": "Acid treatment does not produce metallic calcium.",
    },
    "Calcium nitrate is formed, with phosphoric acid as another product. The acid is not itself a salt.",
    "Match nitrate and nitric.",
  ),
  write(
    "p-superphosphate",
    "Distinguish the acid products",
    "Compare sulfuric and phosphoric acid treatment of phosphate rock. Name both fertiliser products and distinguish their compositions.",
    "Sulfuric acid makes single superphosphate, a mixture of calcium dihydrogenphosphate and calcium sulfate. Phosphoric acid makes triple superphosphate, containing calcium dihydrogenphosphate without that calcium sulfate coproduct. The useful phosphate compound supplies soluble phosphorus; calcium sulfate alone contains no phosphorus.",
    [
      "Sulfuric acid→single superphosphate.",
      "Single includes calcium dihydrogenphosphate and calcium sulfate.",
      "Phosphoric acid→triple superphosphate/calcium dihydrogenphosphate.",
      "Calcium sulfate alone supplies no phosphorus.",
    ],
    "Keep acid, mixture name and phosphate compound distinct.",
  ),
  choice(
    "p-acid",
    "Choose the acid for ammonium nitrate",
    "Ammonia is neutralised to make NH₄NO₃. Which acid is required?",
    "Nitric acid",
    {
      "Sulfuric acid": "That supplies sulfate.",
      "Hydrochloric acid": "That supplies chloride.",
    },
    "NH₃+HNO₃→NH₄NO₃. Ammonia can also be used industrially to manufacture nitric acid.",
    "The nitrate anion identifies the acid.",
  ),
  num(
    "p-nitrogenPercent",
    "Calculate a fertiliser's nitrogen fraction",
    "Find the nitrogen percentage by mass in(NH₄)₂SO₄. Ar: N 14, H 1, S 32, O 16.",
    21.2121212121,
    "%",
    "Mr=2×14+8×1+32+4×16=132. Nitrogen contributes 28, so 28/132×100≈21.2121%. A 21.2% three-significant-figure answer is accepted.",
    "Expand the ammonium parentheses before calculating Mr.",
    data("Formula and atomic masses", "(NH₄)₂SO₄; Ar: N 14, H 1, S 32, O 16."),
  ),
  write(
    "p-preparation",
    "Explain pure salt preparation",
    "In this supervised-school simulation, ammonia solution and sulfuric acid are both soluble. Explain how known neutralising volumes and pure dry crystals can be obtained.",
    "Use titration with an appropriate indicator to find reacting volumes. Repeat the measured volumes without indicator so the product is not coloured/contaminated. Gently concentrate the solution, allow it to cool and crystallise, filter the crystals and dry them. Do not attempt this unsupervised.",
    [
      "Titration determines neutralising volumes.",
      "Repeat without indicator for uncontaminated product.",
      "Concentrate then cool/crystallise.",
      "Filter and dry crystals.",
      "Simulation does not establish supervised practical technique.",
    ],
    "Unknown excess acid cannot be removed by ordinary filtering.",
  ),
  write(
    "p-industrial",
    "Evaluate production using supplied facts",
    "Using the supplied processes, justify which suits sustained large output. Include a limitation of what can be concluded.",
    "The industrial process has continuously reacting streams and continuously collects dry crystals, so it avoids repeating small batch operations and suits sustained large output. The laboratory process requires separate concentrating, cooling, filtering and drying steps in repeated batches. No quantified cost, energy or purity data are supplied, so it cannot be called cheaper, less energy-intensive or purer from these facts alone.",
    [
      "Use continuous reacting streams and collection as evidence.",
      "Contrast repeated laboratory batches and separate operations.",
      "Connect evidence to sustained large-scale output.",
      "Do not invent cost, energy or purity evidence.",
    ],
    "Use the given method rather than a memorised advantage.",
    data("Matched ammonium sulfate processes", R.preparation.note),
  ),
  write(
    "p-bias",
    "Evaluate fertiliser evidence",
    "A company-funded study claims its fertiliser always grows the most crop. Only one field and no independent repeat are reported. Explain why the claim needs more evidence.",
    "Funding may create a conflict of interest, but does not itself prove fraud. One field may differ in soil, nutrient deficiency, weather, crop or dose. Controlled comparisons with matched doses/conditions, repeats and independent scrutiny would test the claim; one result does not prove universal superiority.",
    [
      "Possible interest/bias does not itself prove a false result.",
      "Identify a relevant uncontrolled variable or lack of repeats.",
      "Suggest matched comparisons, repeats or independent scrutiny.",
      "Limit an always claim.",
    ],
    "Separate a possible source of bias from evidence of dishonesty.",
  ),
  higher(
    choice(
      "p-dynamic",
      "Higher: explain dynamic equilibrium",
      "In a closed reactor at fixed conditions, equilibrium is reached. Which statement is true?",
      "Forward and reverse rates are equal; concentrations stay constant",
      {
        "Both reactions have stopped": "Equilibrium is dynamic.",
        "Reactant and product concentrations must be equal":
          "Equal rates do not imply equal amounts.",
      },
      "Both reaction directions continue with equal rates. Equilibrium composition depends on conditions; constant does not mean equal concentrations.",
      "Distinguish rates from concentrations.",
    ),
  ),
  higher(
    choice(
      "p-hot",
      "Higher: predict temperature effects",
      "At the same pressure, raise Haber temperature. What happens to reaction rate and equilibrium NH₃ yield?",
      "Rate increases; equilibrium yield decreases",
      {
        "Both increase": "Forward formation is exothermic.",
        "Rate decreases; yield increases": "Those are the effects of cooling.",
      },
      R.hot.feedback,
      "Use collision theory and the heat-releasing forward direction.",
    ),
  ),
  higher(
    write(
      "p-pressure",
      "Higher: explain pressure and cost",
      "Explain why increasing pressure favours ammonia and speeds reaction, but does not make the highest technically possible pressure the automatic commercial choice.",
      "N₂+3H₂⇌2NH₃ has 4 gas molecules on the reactant side and 2 on the product side. Compression favours the fewer-gas-molecule side and increases collision frequency. Higher-pressure compression uses more energy and requires stronger costly vessels, so yield/rate benefits are balanced against costs.",
      [
        "Count 4 reactant versus 2 product gas molecules.",
        "Increased pressure favours ammonia.",
        "Greater collision frequency increases rate.",
        "Compression energy/stronger-vessel costs require a compromise.",
      ],
      "Separate equilibrium, rate and cost.",
    ),
  ),
  higher(
    write(
      "p-catalyst",
      "Higher: explain iron's effect",
      "Explain what an iron catalyst changes and what it leaves unchanged at fixed temperature/pressure.",
      "It provides a lower-activation-energy pathway and increases both forward and reverse rates. Equilibrium is reached sooner, but its position and equilibrium yield remain unchanged. It is not consumed overall and can allow useful production rates at a lower temperature than an uncatalysed route.",
      [
        "Alternative pathway/lower activation energy.",
        "Speeds both directions and reaches equilibrium sooner.",
        "No equilibrium-position/yield change at fixed conditions.",
        "Not consumed overall.",
      ],
      "Speed and equilibrium composition are distinct.",
    ),
  ),
  higher(
    num(
      "p-interpolate",
      "Higher: interpolate within observations",
      "The fixed original graph has straight segments. Estimate the yield at 250 atm.",
      26,
      "%",
      "250 lies halfway between 200 atm 22% and 300 atm 30%:22+(30−22)/2=26%. This is an interpolation estimate.",
      "Find halfway on the joining segment.",
      {
        title: "Original pressure–yield graph",
        note: R.betweenGraph.note,
        graph: R.betweenGraph.graph,
      },
    ),
  ),
  higher(
    construct(
      "p-plot",
      "Higher: construct new yield points",
      "Plot the original observations at 100,200,300 atm by entering their yields, then join them with straight segments as specified.",
      [
        ["y1", "Yield at 100 atm / %", 8],
        ["y2", "Yield at 200 atm / %", 15],
        ["y3", "Yield at 300 atm / %", 21],
      ],
      {
        title: "Independent original plotting dataset",
        note: "Use the labelled 0–400 atm x-axis and 0–40% y-axis. No correct markers are prefilled. This instruction specifies straight joins rather than a fitted real-process curve.",
        table: {
          caption: "Illustrative observations",
          head: ["Pressure / atm", "Yield / %"],
          rows: [
            ["100", "8"],
            ["200", "15"],
            ["300", "21"],
          ],
        },
        graph: {
          xLabel: "Pressure / atm",
          yLabel: "Equilibrium yield / %",
          xMax: 400,
          yMax: 40,
          points: [],
          draft: [
            { x: 100, field: "y1" },
            { x: 200, field: "y2" },
            { x: 300, field: "y3" },
          ],
          joinDraft: true,
        },
      },
      "Points are(100,8),(200,15),(300,21); major ticks are 100 atm and 10%. The connected graph shows the entered points; it does not automatically correct a wrong entry.",
      "Pair each pressure with its own observed yield.",
    ),
  ),
  higher(
    write(
      "p-extrapolate",
      "Higher: limit an extrapolation",
      "Only observations up to 400 atm are given. Explain why a yield estimate at 600 atm is less secure than at 250 atm.",
      "600 atm is outside the observed pressure range, so extrapolation assumes the trend continues.250 atm is between observations and uses interpolation. Real equilibrium curves may flatten; an extrapolated percentage must remain physically meaningful and requires more data.",
      [
        "600 atm is outside observations/extrapolation.",
        "250 atm is within observations/interpolation.",
        "Unverified trend continuation increases uncertainty.",
        "More observations would test the extension.",
      ],
      "Locate each pressure relative to the actual data range.",
    ),
  ),
  higher(
    write(
      "p-compromise",
      "Higher: write a linked commercial explanation",
      "Explain the conventional 450 °C,200 atm and iron conditions. Link rate, equilibrium, energy/equipment costs and raw-material supply.",
      "About 450 °C balances a sufficiently rapid reaction against the lower equilibrium ammonia yield at higher temperature because the forward reaction is exothermic. About 200 atm improves rate and favours the 2-molecule product side over 4 reactant molecules, while greater compression and stronger vessels raise costs. Iron lowers activation energy, speeding both directions without shifting equilibrium, and reduces the temperature needed for useful rates. Air supplies nitrogen; processed natural gas commonly supplies hydrogen, whose availability/processing cost and energy supply affect economics. Cooling/removal and recycling recover product from partial per-pass conversion.",
      [
        "Temperature: rate rises but exothermic equilibrium yield falls.",
        "Pressure: collision frequency and 4→2 equilibrium effect.",
        "Energy/compression/stronger-vessel cost links.",
        "Iron: lower activation energy, both rates, no equilibrium shift.",
        "Feedstock availability/processing and energy costs matter.",
        "Link the factors into a compromise rather than just naming conditions.",
      ],
      "Write connected because statements for each condition.",
    ),
  ),
];
practice.find((q) => q.id === id("p-nitrogenPercent"))!.tolerance = 0.02;
const checkForms: LearningTask[][] = [
  [
    choice(
      "cA-source",
      "Recall a feedstock",
      "Which source supplies the conventional Haber nitrogen feed?",
      "Air",
      {
        "Phosphate rock": "That supplies phosphorus compounds.",
        "Natural gas": "It commonly supplies processed hydrogen.",
      },
      "Air contains nitrogen.",
      "Identify the gas separately.",
    ),
    construct(
      "cA-pass",
      "Account for a new partial pass",
      "Feed 8 mol N₂ and 24 mol H₂;25% of N₂ reacts. Find remaining N₂, remaining H₂, NH₃ formed.",
      [
        ["n", "Nitrogen left / mol", 6],
        ["h", "Hydrogen left / mol", 18],
        ["a", "Ammonia formed / mol", 4],
      ],
      data(
        "Reserved partial pass",
        "N₂+3H₂⇌2NH₃; ignore losses.25% applies to starting nitrogen converted.",
      ),
      "2 mol N₂+6 mol H₂→4 mol NH₃;6 and 18 mol remain.",
      "Use consumed nitrogen then 1:3:2.",
    ),
    write(
      "cA-cool",
      "Explain the outlet streams",
      "The outlet from a Haber reactor contains ammonia and unreacted nitrogen and hydrogen. Explain why it is cooled and the remaining gases are recycled.",
      "Cooling liquefies ammonia so it can be removed. Unreacted gaseous N₂ and H₂ are recycled because reversible conversion is partial per pass.",
      [
        "Cooling liquefies ammonia.",
        "Remove liquid product.",
        "Recycle unreacted gases after partial conversion.",
      ],
      "Name both streams.",
    ),
    construct(
      "cA-mix",
      "Calculate a reserved formulation",
      "40 kg original formulation: elemental N 10%, P 5%, K 15%. Find all four masses.",
      [
        ["n", "Nitrogen / kg", 4],
        ["p", "Phosphorus / kg", 2],
        ["k", "Potassium / kg", 6],
        ["o", "Other elements / kg", 28],
      ],
      data(
        "Reserved element analysis",
        "Use all 40 kg as denominator; remaining mass is other elements.",
      ),
      "4+2+6=12 kg nutrient elements; others 28 kg.",
      "Apply each fraction to the whole.",
    ),
    choice(
      "cA-rock",
      "Name phosphoric treatment product",
      "What fertiliser product follows phosphoric acid treatment of phosphate rock?",
      "Triple superphosphate",
      {
        "Untreated phosphate rock": "Treatment changes its useful form.",
        "Potassium sulfate": "There is no potassium source here.",
      },
      "Triple superphosphate supplies calcium dihydrogenphosphate.",
      "Recall the acid-product link.",
    ),
    write(
      "cA-prep",
      "Explain indicator-free product",
      "Why repeat the neutralising volumes without indicator before crystallisation?",
      "Indicator helped find the endpoint but would contaminate/colour the salt. Repeating known reacting volumes without it leaves a cleaner product solution for concentrating, cooling, filtering and drying crystals.",
      [
        "Known neutralising volumes from titration.",
        "Indicator would contaminate/colour product.",
        "Repeat without indicator before crystallisation.",
      ],
      "Distinguish finding volumes from preparing pure product.",
    ),
    higher(
      choice(
        "cA-rate",
        "Higher: separate iron's effects",
        "Adding iron at fixed temperature/pressure changes which quantities?",
        "Reaction rates increase; equilibrium yield stays unchanged",
        {
          "Equilibrium yield increases": "Catalysts speed both directions.",
          "Iron is used up as ammonia": "Iron is not a reactant.",
        },
        R.catalyst.feedback,
        "Separate time from composition.",
      ),
    ),
    higher(
      write(
        "cA-compromise",
        "Higher: explain the temperature choice",
        "Why choose a moderate high temperature rather than the lowest possible temperature for an exothermic Haber reaction?",
        "A lower temperature favours ammonia at equilibrium but slows reaction; fewer particles have activation energy. About 450 °C gives a commercially useful rate while limiting the equilibrium-yield loss and energy cost of still higher temperatures.",
        [
          "Cooling favours exothermic formation.",
          "Cooling slows rate.",
          "Moderate temperature balances useful rate, yield and energy cost.",
        ],
        "Link both rate and equilibrium.",
      ),
    ),
    higher(
      construct(
        "cA-plot",
        "Higher: plot a reserved dataset",
        "Enter yields for 100,200,300 atm; join the three points with straight segments.",
        [
          ["y1", "Yield at 100 atm / %", 9],
          ["y2", "Yield at 200 atm / %", 17],
          ["y3", "Yield at 300 atm / %", 23],
        ],
        {
          title: "Reserved original graph dataA",
          note: "Axes 0–400 atm,0–40%; gold crosses are your submitted coordinates only.",
          table: {
            caption: "Original observations",
            head: ["Pressure / atm", "Yield / %"],
            rows: [
              ["100", "9"],
              ["200", "17"],
              ["300", "23"],
            ],
          },
          graph: {
            xLabel: "Pressure / atm",
            yLabel: "Equilibrium yield / %",
            xMax: 400,
            yMax: 40,
            points: [],
            draft: [
              { x: 100, field: "y1" },
              { x: 200, field: "y2" },
              { x: 300, field: "y3" },
            ],
            joinDraft: true,
          },
        },
        "Plot(100,9),(200,17),(300,23) with equal-axis intervals and the specified joins.",
        "Match rows to coordinates.",
      ),
    ),
  ],
  [
    choice(
      "cB-condition",
      "Recall the conventional catalyst",
      "Which material catalyses the Haber process?",
      "Iron",
      {
        Chlorine: "This is not the specified catalyst.",
        "Calcium phosphate": "This is a phosphate feedstock.",
      },
      "Purified gases pass over an iron catalyst.",
      "Recall the reactor catalyst.",
    ),
    construct(
      "cB-feed",
      "Scale a reserved reacting feed",
      "For 6 mol N₂, calculate H₂ required and maximum NH₃ if forward conversion were complete.",
      [
        ["h", "Hydrogen required / mol", 18],
        ["a", "Maximum ammonia / mol", 12],
      ],
      data(
        "Reserved reacting feed",
        "N₂+3H₂⇌2NH₃; mole ratios, not mass ratios.",
      ),
      "6×3=18;6×2=12 mol. Actual per-pass conversion is not complete.",
      "Scale all coefficients.",
    ),
    choice(
      "cB-economy",
      "Separate yield and atom economy",
      "Why can forward atom economy be 100% while actual yield is below 100%?",
      "Only ammonia is a product, but conversion is partial",
      {
        "There are no reactants": "Nitrogen and hydrogen are reactants.",
        "Iron becomes waste nitrogen": "Iron is a catalyst.",
      },
      "Equation-product atom economy and experimental conversion/yield answer different questions.",
      "Compare equation and actual output.",
    ),
    num(
      "cB-rate",
      "Calculate a reserved application rate",
      "12 bags each 350 kg cover 210000 m². Find fertiliser mass per square metre.",
      0.02,
      "kg/m²",
      "12×350=4200;4200/210000=0.02 kg/m².",
      "Total mass divided by area.",
      data("Reserved application data", "12 bags;350 kg each;210000 m²."),
    ),
    choice(
      "cB-rock",
      "Name sulfuric treatment mixture",
      "Which named fertiliser mixture contains calcium dihydrogenphosphate and calcium sulfate from treated phosphate rock?",
      "Single superphosphate",
      {
        "Triple superphosphate": "That does not have this sulfate coproduct.",
        "Pure calcium sulfate":
          "That omits the phosphorus-containing component.",
      },
      "Sulfuric acid treatment makes single superphosphate.",
      "Identify the mixture, not just one compound.",
    ),
    write(
      "cB-production",
      "Judge sustained output",
      "Use the supplied continuous-stream and repeated-batch methods to judge sustained large output. State one unsupported claim.",
      "Continuous reacting streams and dry-crystal collection suit sustained large output without repeated separate batch operations. Laboratory concentrating, cooling, filtering and drying require repeated batches. No supplied data establish lower cost, energy use or better purity.",
      [
        "Use continuous streams/collection as evidence.",
        "Contrast repeated batch steps.",
        "State cost, energy or purity evidence is absent.",
      ],
      "Justify using the given method.",
      data("Reserved method comparison", R.preparation.note),
    ),
    higher(
      choice(
        "cB-pressure",
        "Higher: predict compression",
        "At fixed temperature, increased pressure favours which side of N₂+3H₂⇌2NH₃?",
        "Ammonia:2 gas molecules instead of 4",
        {
          "Reactants:4 instead of 2":
            "Higher pressure favours fewer gas molecules.",
          "Neither because gas molecules are atoms":
            "Molecules and atoms are distinct.",
        },
        "Pressure favours ammonia and increases collision frequency; cost still matters.",
        "Count gaseous coefficients.",
      ),
    ),
    higher(
      write(
        "cB-equilibrium",
        "Higher: explain equal rates",
        "At dynamic equilibrium, ammonia concentration is constant. Explain why that does not mean equal concentrations or no reaction.",
        "Forward formation and reverse breakdown continue at equal rates, so concentrations are constant. Equal rates do not require equal reactant/product concentrations. The equilibrium position depends on fixed conditions.",
        [
          "Both directions continue.",
          "Equal forward/reverse rates.",
          "Constant but not necessarily equal concentrations.",
        ],
        "Separate rates and amounts.",
      ),
    ),
    higher(
      construct(
        "cB-plot",
        "Higher: plot another reserved dataset",
        "Enter yields at 100,200,300 atm and join the points with the specified straight segments.",
        [
          ["y1", "Yield at 100 atm / %", 11],
          ["y2", "Yield at 200 atm / %", 20],
          ["y3", "Yield at 300 atm / %", 27],
        ],
        {
          title: "Reserved original graph dataB",
          note: "Axes 0–400 atm,0–40%; no correct markers are prefilled.",
          table: {
            caption: "Original observations",
            head: ["Pressure / atm", "Yield / %"],
            rows: [
              ["100", "11"],
              ["200", "20"],
              ["300", "27"],
            ],
          },
          graph: {
            xLabel: "Pressure / atm",
            yLabel: "Equilibrium yield / %",
            xMax: 400,
            yMax: 40,
            points: [],
            draft: [
              { x: 100, field: "y1" },
              { x: 200, field: "y2" },
              { x: 300, field: "y3" },
            ],
            joinDraft: true,
          },
        },
        "Plot(100,11),(200,20),(300,27) on equal intervals.",
        "Use each supplied pressure-yield pair.",
      ),
    ),
  ],
];
const reviewForms: LearningTask[][] = [
  [
    choice(
      "vA-cool",
      "Retrieve the separated state",
      "After suitable cooling, what state is removed ammonia in?",
      "Liquid",
      {
        Gas: "Ammonia condenses.",
        Solid: "The specified separation liquefies ammonia.",
      },
      "Cooling liquefies ammonia; unreacted gases are recycled.",
      "Recall the phase change.",
    ),
    construct(
      "vA-mix",
      "Retrieve a new mass composition",
      "A 25 kg formulation has elemental N 20%, P 4%, K 8%. Find nutrient masses and other elemental mass.",
      [
        ["n", "Nitrogen / kg", 5],
        ["p", "Phosphorus / kg", 1],
        ["k", "Potassium / kg", 2],
        ["o", "Other elements / kg", 17],
      ],
      data("Delayed new formulation", "Every percentage uses the full 25 kg."),
      "5+1+2=8 kg nutrient elements; others 17 kg.",
      "Apply each percentage then account for all 25 kg.",
    ),
    choice(
      "vA-acid",
      "Retrieve an ammonium acid",
      "Which acid makes ammonium nitrate with ammonia?",
      "Nitric acid",
      {
        "Hydrochloric acid": "Makes chloride.",
        "Sulfuric acid": "Makes sulfate.",
      },
      "NH₃+HNO₃→NH₄NO₃.",
      "Read the anion.",
    ),
    higher(
      write(
        "vA-compromise",
        "Higher: retrieve the temperature compromise",
        "Explain why increasing Haber temperature can increase rate while lowering equilibrium ammonia yield.",
        "Higher temperature increases collision frequency and the fraction exceeding activation energy. The forward reaction is exothermic, so higher temperature favours the endothermic reverse reaction and lowers equilibrium ammonia yield.",
        [
          "Collision/activation-energy explanation of faster rate.",
          "Exothermic forward/endothermic reverse.",
          "Lower equilibrium ammonia yield.",
        ],
        "Keep rate and composition separate.",
      ),
    ),
  ],
  [
    choice(
      "vB-sources",
      "Retrieve the processed gas source",
      "Which conventional feedstock is processed to produce Haber hydrogen?",
      "Natural gas",
      {
        Air: "Normally supplies nitrogen.",
        Sand: "Does not supply this hydrogen feed.",
      },
      "Methane/natural gas is commonly processed with steam; purified hydrogen is fed to the reactor.",
      "Recall the feedstock, not the catalyst.",
    ),
    num(
      "vB-application",
      "Retrieve a new application calculation",
      "15 bags each 240 kg cover 180000 m². Find fertiliser mass per square metre.",
      0.02,
      "kg/m²",
      "15×240=3600;3600/180000=0.02 kg/m².",
      "Multiply then divide.",
      data("Delayed application data", "15 bags;240 kg each;180000 m²."),
    ),
    write(
      "vB-rock",
      "Retrieve phosphate treatments",
      "Name the fertiliser products of sulfuric and phosphoric acid treatment of phosphate rock.",
      "Sulfuric acid: single superphosphate(calcium dihydrogenphosphate plus calcium sulfate). Phosphoric acid: triple superphosphate/calcium dihydrogenphosphate without that sulfate coproduct.",
      [
        "Sulfuric→single superphosphate.",
        "Phosphoric→triple superphosphate.",
        "Distinguish the sulfate coproduct.",
      ],
      "Keep both acids distinct.",
    ),
    higher(
      choice(
        "vB-catalyst",
        "Higher: retrieve equilibrium and catalyst",
        "At the same temperature/pressure, iron changes equilibrium yield how?",
        "It does not change it",
        {
          "It necessarily doubles yield": "It speeds both directions.",
          "It removes all reactants": "Partial equilibrium conversion remains.",
        },
        "Iron lowers activation energy and accelerates arrival at equilibrium without changing its position.",
        "Rate versus eventual amount.",
      ),
    ),
  ],
];

refresher.push(
  construct(
    "r-pass",
    "Account for a worked partial pass",
    "Feed 4 mol N₂ and 12 mol H₂;25% of starting nitrogen reacts. Construct the remaining gases and formed ammonia.",
    [
      ["n", "Nitrogen left / mol", 3],
      ["h", "Hydrogen left / mol", 9],
      ["a", "Ammonia formed / mol", 2],
    ],
    data(
      "Worked partial conversion",
      "N₂+3H₂⇌2NH₃. Convert 0.25×4=1 mol N₂, consuming 3 mol H₂ and forming 2 mol NH₃. Subtract consumed amounts from the starting feed.",
    ),
    "N₂ remaining 4−1=3; H₂ remaining 12−3=9; NH₃ formed 2 mol. Nitrogen atoms 8=6+2; hydrogen atoms 24=18+6. Mole totals change but atoms remain.",
    "Find consumed N₂ before applying 1:3:2.",
  ),
  num(
    "r-nutrientRate",
    "Convert a nutrient application rate",
    "Worked transfer: fertiliser 0.03 kg/m² contains elemental N 12%. Find nitrogen application in g/m².",
    3.6,
    "g/m²",
    "0.03×0.12=0.0036 kg N/m². Multiply by 1000 for 3.6 g/m². Total fertiliser 30 g/m² is not nitrogen mass.",
    "Apply the element fraction then convert kg to g.",
    data(
      "Worked nitrogen application",
      "Total fertiliser 0.03 kg/m²; nitrogen 12% of its mass.",
    ),
  ),
  choice(
    "r-economy",
    "Distinguish equation and actual conversion",
    "The forward Haber equation makes only NH₃. Can atom economy be 100% while a reversible pass converts only part of the feed?",
    "Yes",
    { No: "Equation-product atom economy and actual conversion differ." },
    "All product atoms in the forward stoichiometric equation belong to ammonia, so atom economy is 100%. Reversibility means per-pass conversion and actual yield can be lower.",
    "Separate theoretical equation products from actual recovery.",
  ),
  choice(
    "r-mining",
    "Name mined fertiliser compounds",
    "Which feedstock group is obtained by mining?",
    "Potassium chloride, potassium sulfate and phosphate rock",
    {
      "Purified nitrogen, hydrogen and ammonia":
        "These are Haber process gases.",
      "Pure potassium metal only": "Potassium is supplied in compounds.",
    },
    "KCl and K₂SO₄ supply potassium compounds. Phosphate rock supplies phosphorus compounds but is too insoluble for direct useful uptake; acid treatment makes suitable products.",
    "Recall compound names, not pure nutrient elements.",
  ),
);
function freeGraph(
  s: string,
  title: string,
  points: readonly (readonly [number, number])[],
): LearningTask {
  const b = emptyHaberDrawing();
  Object.assign(b, { xMax: "500", xStep: "100", yMax: "50", yStep: "10" });
  points.forEach(([x, y], i) =>
    Object.assign(b, {
      ["p" + i + "x"]: String(x),
      ["p" + i + "y"]: String(y),
      ["c" + i]: String(y),
    }),
  );
  return higher({
    ...write(
      s,
      title,
      "Choose equal axis scales. Plot all seven observations and draw a separate smooth best-fit curve. Keep observations separate from your fit.",
      JSON.stringify(b),
      [
        "Pressure on x with atmospheres; equilibrium yield on y with%.",
        "Equal intervals with a scale covering every observation and using the plotting area effectively.",
        "All seven observations at their correct pressure/yield coordinates; keep original points even if the fitted trend differs.",
        "A separate smooth curve supported by the overall trend, not a jagged dot-to-dot line.",
        "Manual review: no automatic examiner graph mark or claimed physical-law fit.",
      ],
      "A pressure maximum of 500 atm and yield maximum of 50% are possible choices; other suitable scales may be valid.",
    ),
    haberDrawing: {
      points,
      note: "Original illustrative dataset at fixed temperature. Choose scales before plotting. Enter each point by coordinates or touch; use the green curve controls to construct a separate smooth trend. A suitable curve need not pass through every observation.",
    },
    referenceResponse:
      "One usable scale is 0–500 atm in 100-atm major steps and 0–50% in 10-percentage-point major steps. Plot every original observation and draw a smooth supported curve through or near them, rather than forcibly changing observations to lie on a curve.",
  });
}
refresher.push(
  freeGraph("r-freeGraph", "Higher: choose scales and draw a best-fit curve", [
    [60, 5],
    [120, 13],
    [180, 20],
    [240, 27],
    [300, 33],
    [360, 38],
    [420, 42],
  ]),
);
practice.push(
  freeGraph(
    "p-freeGraph",
    "Higher: construct a complete pressure–yield graph",
    [
      [60, 7],
      [120, 15],
      [180, 22],
      [240, 28],
      [300, 33],
      [360, 37],
      [420, 40],
    ],
  ),
);
checkForms[0].push(
  freeGraph("cA-freeGraph", "Higher: independently choose scales and fit", [
    [60, 8],
    [120, 16],
    [180, 23],
    [240, 29],
    [300, 34],
    [360, 38],
    [420, 41],
  ]),
);
checkForms[1].push(
  freeGraph("cB-freeGraph", "Higher: independently plot and fit new data", [
    [60, 4],
    [120, 11],
    [180, 17],
    [240, 22],
    [300, 26],
    [360, 29],
    [420, 31],
  ]),
);

function bars(
  s: string,
  title: string,
  ns: readonly [number, number, number],
): LearningTask {
  return construct(
    s,
    title,
    "Construct a bar chart of the three supplied elemental percentages. Enter each height on the common 0–50% scale; retain a wrong height until you choose to edit it.",
    [
      ["n", "Nitrogen bar height / %", ns[0]],
      ["p", "Phosphorus bar height / %", ns[1]],
      ["k", "Potassium bar height / %", ns[2]],
    ],
    {
      title: "Original elemental bar-chart data",
      note: "Percentages refer to N, P, K elemental mass, not P₂O₅/K₂O equivalents. The rest is other elemental mass in compounds.",
      table: {
        caption: "Elemental percentages",
        head: ["Element", "Mass / %"],
        rows: [
          ["Nitrogen", String(ns[0])],
          ["Phosphorus", String(ns[1])],
          ["Potassium", String(ns[2])],
        ],
      },
      bars: [
        { label: "Nitrogen", field: "n" },
        { label: "Phosphorus", field: "p" },
        { label: "Potassium", field: "k" },
      ],
    },
    "Use the same scale for all bars. The plotted heights match each supplied percentage; missing mass belongs to other elements in the compounds. No incorrect entry is automatically replaced.",
    "Match each element to its own percentage and the common scale.",
  );
}
refresher.push(bars("r-bars", "Construct an elemental bar chart", [10, 4, 12]));
practice.splice(
  21,
  0,
  bars("p-bars", "Independently plot nutrient percentages", [14, 6, 18]),
);
checkForms[1].splice(
  6,
  0,
  bars("cB-bars", "Plot reserved nutrient percentages", [12, 7, 16]),
);

refresher.push(
  higher(
    choice(
      "r-dynamic",
      "Higher: recover dynamic equilibrium",
      "In a closed reactor at fixed conditions, NH₃ forms and breaks down at equal rates. What happens to reactant and product concentrations?",
      "They stay constant but need not be equal",
      {
        "They must all become equal":
          "Equal reaction rates do not imply equal concentrations.",
        "They fall to zero because reactions stop":
          "Both directions continue at equilibrium.",
      },
      "At dynamic equilibrium, both reactions continue with equal rates. Each substance is produced as fast as it is consumed, so concentrations stay constant. A closed system and fixed conditions are necessary for this equilibrium account; the continuous industrial recycling plant is not being treated as a sealed bottle.",
      "Separate how fast each direction proceeds from how much of each substance is present.",
    ),
  ),
  higher(
    write(
      "r-compromise",
      "Higher: recover the whole commercial account",
      "Use the stated industrial choices to write a linked explanation of temperature, pressure, iron and economic supply.",
      "About 450 °C balances a useful rate with the equilibrium-yield penalty of heating an exothermic forward reaction. About 200 atm favours the 2-molecule product side over 4 reactant molecules and increases collision frequency, but additional compression energy and stronger vessels cost more. Iron lowers activation energy in both directions, reaching equilibrium sooner without shifting it; useful rates at a lower temperature than an uncatalysed route can reduce heating costs. Air supplies nitrogen; hydrogen production from processed natural gas and energy availability/prices affect production costs. Product removal and recycling recover ammonia after partial per-pass conversion.",
      [
        "Link hotter temperature to faster rate but lower equilibrium yield.",
        "Count 4 reactant versus 2 product gas molecules for pressure.",
        "Connect pressure to collisions and compression/vessel costs.",
        "Explain lower activation energy, both reaction rates and unchanged equilibrium for iron.",
        "Connect feedstock processing/availability and energy prices to economics.",
        "Use connected reasons rather than just listing conditions.",
      ],
      "Compare each benefit with its corresponding limitation.",
      data(
        "Commercial decisions",
        "Conventional reactor: about 450 °C, about 200 atm, iron catalyst. Purified N₂ from air; H₂ commonly processed from natural gas. Forward formation is exothermic. Increasing pressure requires compression energy and stronger equipment.",
      ),
    ),
  ),
  choice(
    "r-selection",
    "Use nutrient requirements and a table",
    "Given too little phosphorus can slow growth and too little potassium can cause brown leaf edges, which supplied fertiliser contains both P and K?",
    "C",
    { A: "A has no phosphorus.", B: "B has no potassium." },
    "C supplies both required elements from compounds. Sum each elemental analysis: A 12+0+9=21%, B 16+7+0=23%, C 10+4+8=22%. B has the greatest total but still lacks required potassium. A suitable choice must satisfy both supplied deficiencies; greatest total alone is not enough. These data do not establish an optimal dose, cost or effect for every soil.",
    "Check both columns, not just one.",
    undefined,
    {
      title: "Worked original nutrient table",
      note: "Original elemental mass percentages, not commercial oxide-equivalent labels. Plant-deficiency facts are supplied for this exercise.",
      table: {
        caption: "Fertiliser element mass / %",
        head: ["Fertiliser", "N", "P", "K"],
        rows: [
          ["A", "12", "0", "9"],
          ["B", "16", "7", "0"],
          ["C", "10", "4", "8"],
        ],
      },
    },
  ),
);
const selectionGiven: HaberGiven = {
  title: "Independent original nutrient comparison",
  note: "Too little P can slow plant growth; too little K can cause brown leaf edges. These original mass percentages refer to elemental N, P, K; other atoms account for the rest.",
  table: {
    caption: "Elemental mass / %",
    head: ["Fertiliser", "N", "P", "K"],
    rows: [
      ["A", "15", "0", "10"],
      ["B", "12", "6", "8"],
      ["C", "20", "4", "0"],
      ["D", "10", "0", "0"],
    ],
  },
};
practice.splice(
  12,
  0,
  choice(
    "p-selection",
    "Select for both nutrient deficiencies",
    "Which supplied fertiliser contains both required P and K?",
    "B",
    {
      A: "A contains no phosphorus.",
      C: "C contains no potassium.",
      D: "D contains neither phosphorus nor potassium.",
    },
    "B contains P 6% and K 8%, meeting both supplied requirements. This does not prove its optimal dose or universal superiority.",
    "Check both given columns independently.",
    undefined,
    selectionGiven,
  ),
  num(
    "p-total",
    "Compare total nutrient percentages",
    "Find the greatest total elemental N+P+K percentage among the four supplied fertilisers. Enter that total percentage.",
    26,
    "%",
    "A 15+0+10=25%; B 12+6+8=26%; C 20+4+0=24%; D 10%. B has the greatest total at 26%. This sum is meaningful because all three percentages use the same whole; it does not establish a universally best fertiliser.",
    "Add N, P, K for each formulation, then compare totals.",
    selectionGiven,
  ),
);
checkForms[0].splice(
  6,
  0,
  choice(
    "cA-selection",
    "Use reserved deficiency evidence",
    "Given both phosphorus and potassium are needed to address the stated deficiencies, which original formulation supplies both?",
    "C",
    { A: "A lacks P.", B: "B lacks K." },
    "C supplies both P and K; the other candidates each lack one.",
    "Require both nutrients.",
    undefined,
    {
      title: "Reserved original nutrient comparison",
      note: "Compare elemental mass percentages. P deficiency can slow growth; K deficiency can cause brown leaf edges.",
      table: {
        caption: "Elemental mass / %",
        head: ["Fertiliser", "N", "P", "K"],
        rows: [
          ["A", "10", "0", "20"],
          ["B", "20", "10", "0"],
          ["C", "16", "7", "9"],
        ],
      },
    },
  ),
);
const recovery: Record<string, string> = {
  sources: "feed2",
  feed: "feed5",
  conditions: "feed2",
  cooling: "loop",
  economy: "economy",
  pass: "pass",
  npk: "mix20",
  formula: "mix20",
  masses: "mix50",
  other: "mix50",
  application: "application",
  nutrientRate: "nutrientRate",
  mining: "mining",
  rock: "nitricRock",
  nitricRock: "nitricRock",
  superphosphate: "sulfuricRock",
  acid: "nitrateSalt",
  nitrogenPercent: "nitrogenPercent",
  preparation: "preparation",
  industrial: "preparation",
  bias: "preparation",
  dynamic: "dynamic",
  hot: "hot",
  pressure: "pressure",
  catalyst: "catalyst",
  interpolate: "betweenGraph",
  plot: "plot",
  extrapolate: "betweenGraph",
  compromise: "compromise",
  freeGraph: "freeGraph",
  bars: "bars",
  selection: "selection",
  total: "selection",
};
for (const q of practice) {
  const suffix = q.id.slice("haber-v1-p-".length);
  q.followUp = id("r-" + recovery[suffix]);
  if (!refresher.some((r) => r.id === q.followUp))
    throw Error("Missing Haber recovery " + q.id);
}
export const allHaberTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const haberExposureFamilies = {
  sources: [
    "r-feed2",
    "r-feed5",
    "g-feed",
    "p-sources",
    "cA-source",
    "vB-sources",
  ],
  conditions: ["p-conditions"],
  loop: ["w-reversible", "r-loop", "g-loop", "p-cooling", "cA-cool", "vA-cool"],
  economy: ["p-economy", "cB-economy"],
  npk: ["r-mix20", "r-mix50", "g-nutrients", "p-npk", "p-other"],
  rock: ["r-nitricRock", "p-nitricRock", "p-rock", "p-mining"],
  superphosphate: [
    "r-sulfuricRock",
    "r-phosphoricRock",
    "g-rock",
    "p-superphosphate",
    "cA-rock",
    "cB-rock",
    "vB-rock",
  ],
  acid: ["r-nitrateSalt", "r-chlorideSalt", "p-acid", "vA-acid"],
  sulfate: ["w-charge", "r-sulfateSalt", "g-salt"],
  preparation: [
    "r-preparation",
    "g-preparation",
    "p-preparation",
    "p-industrial",
    "cA-prep",
    "cB-production",
  ],
  dynamic: ["w-rate", "p-dynamic", "cB-equilibrium"],
  hot: [
    "r-hot",
    "r-cold",
    "g-hot",
    "p-hot",
    "r-compromise",
    "p-compromise",
    "cA-compromise",
    "vA-compromise",
  ],
  pressure: [
    "r-pressure",
    "p-pressure",
    "cB-pressure",
    "p-compromise",
    "r-compromise",
  ],
  catalyst: [
    "r-catalyst",
    "p-compromise",
    "r-compromise",
    "p-catalyst",
    "cA-rate",
    "vB-catalyst",
    "cB-condition",
  ],
  graph: ["r-pressureGraph", "r-betweenGraph", "g-graph", "p-interpolate"],
  interpolation: ["p-extrapolate"],
  suppliedSelection: ["p-selection", "p-total"],
};
const groups = Object.values(haberExposureFamilies).map((fs) => new Set(fs));
let merging = true;
while (merging) {
  merging = false;
  outer: for (let a = 0; a < groups.length; a++)
    for (let b = a + 1; b < groups.length; b++)
      if ([...groups[a]].some((s) => groups[b].has(s))) {
        groups[a] = new Set([...groups[a], ...groups[b]]);
        groups.splice(b, 1);
        merging = true;
        break outer;
      }
}
for (const g of groups)
  for (const s of g) {
    const q = allHaberTasks.find((q) => q.id === id(s));
    if (!q) throw Error("Unknown Haber exposure " + s);
    q.exposureAliases = [...g].filter((o) => o !== s).map(id);
  }
export const haberJourney: LessonJourney = {
  version: 1,
  introduction:
    "Build the ammonia feed and recovery loop, then make and evaluate fertiliser formulations. Higher extends rate, equilibrium and commercial compromises.",
  scopeNote:
    "Separate GCSE Chemistry: AQA 8462 4.10.4.1–2. The process, feedstocks, fertiliser salts/formulations and preparation comparisons apply to Foundation and Higher. Tasks explicitly labelled Higher cover dynamic equilibrium, rate graphs and commercial conditions. Original graphs/data are illustrative and do not reproduce industrial measurements. Graph activities include supplied-scale coordinate constructions, student-chosen equal axis scales and separately constructed smooth fits. Full graph constructions require manual review. Practical activities are simulations/data interpretation; written explanations are manually reviewed.",
  outcomes: [
    "Recall purified feed sources, about 450 °C/200 atm and iron; scale 1:3:2 mole ratios without treating them as masses.",
    "Explain partial reversible conversion, cooling/liquefaction, product removal and unreacted-gas recycling.",
    "Distinguish 100% forward atom economy from actual yield and account for partial-conversion atoms.",
    "Recall NPK compounds/formulations, read chemical formulas and calculate elemental composition and application rates.",
    "Name mined potassium salts and phosphate-rock treatments, distinguishing single and triple superphosphate.",
    "Choose acids/ammonium formulas and compare given continuous industrial production with simulated laboratory pure-salt preparation.",
    "Higher: explain dynamic equilibrium and separate rate from equilibrium yield; link temperature, pressure, catalyst and cost into a commercial compromise.",
    "Higher: read pressure–yield and initial-rate graphs, interpolate, construct original plotted data and recognise extrapolation limits.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Process and conservation",
      taskIds: practice.slice(0, 6).map((q) => q.id),
    },
    {
      label: "NPK formulas and mass calculations",
      taskIds: practice.slice(6, 14).map((q) => q.id),
    },
    {
      label: "Feedstocks, salts and production evidence",
      taskIds: practice.slice(14, 24).map((q) => q.id),
    },
    {
      label: "Higher: rate, equilibrium and graphs",
      taskIds: practice.slice(24).map((q) => q.id),
    },
  ],
};
/** Only this mixed-tier lesson opts in. Previously saved full assessment runs are retained by the view. */
export function haberForTier(tier: Tier): LessonJourney {
  if (tier === "higher") return haberJourney;
  const keep = (qs: LearningTask[]) => qs.filter((q) => q.tier !== "higher");
  return {
    ...haberJourney,
    warmup: keep(warmup),
    refresher: keep(refresher),
    guided: keep(guided),
    practice: keep(practice),
    checkForms: checkForms.map(keep),
    reviewForms: reviewForms.map(keep),
    practiceGroups: haberJourney
      .practiceGroups!.map((g) => ({
        ...g,
        taskIds: g.taskIds.filter((i) =>
          practice.some((q) => q.id === i && q.tier !== "higher"),
        ),
      }))
      .filter((g) => g.taskIds.length),
  };
}
