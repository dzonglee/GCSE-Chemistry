import type { LearningTask, LessonJourney } from "../types";
import {
  climateRecords,
  type ClimateGiven,
  type ClimateGraph,
} from "../../lib/climate";
const id = (s: string) => "climate-v1-" + s;
function model(record?: string) {
  return record
    ? {
        model: {
          kind: "climate-investigation" as const,
          mode: climateRecords[record].mode,
          record,
        },
      }
    : {};
}
function choice(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  record?: string,
  given?: ClimateGiven,
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
    ...model(record),
    ...(given ? { climateGiven: given } : {}),
  };
}
function numeric(
  s: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  record?: string,
  given?: ClimateGiven,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: String(answer),
    unit,
    inputMode: "decimal",
    tolerance: 0.000001,
    explanation,
    hint,
    ...model(record),
    ...(given ? { climateGiven: given } : {}),
  };
}
function written(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
  given?: ClimateGiven,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    referenceResponse: answer,
    rubric,
    hint,
    ...(given ? { climateGiven: given } : {}),
  };
}
function construction(
  s: string,
  title: string,
  prompt: string,
  refs: readonly (readonly [string, string, number])[],
  given: ClimateGiven,
  explanation: string,
  hint: string,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: JSON.stringify(
      Object.fromEntries(refs.map(([f, , n]) => [f, String(n)])),
    ),
    parts: refs.map(([f, label, n]) => ({
      id: f,
      label,
      answer: n,
      inputMode: "decimal",
    })),
    partLegend: "Construct your values",
    climateGiven: given,
    explanation,
    hint,
  };
}
function graphTask(
  s: string,
  title: string,
  graph: ClimateGraph,
): LearningTask {
  const a = graph.points[0].anomaly,
    b = graph.points.at(-1)!.anomaly;
  return construction(
    s,
    title,
    "Read the first and last anomalies and construct their signed change.",
    [
      ["start", "Starting anomaly / °C", a],
      ["end", "Ending anomaly / °C", b],
      ["change", "Change in anomaly / °C", Number((b - a).toFixed(6))],
    ],
    {
      title: "Supplied temperature series",
      note: "Original teaching values for the labelled period, not measured global observations.",
      graph,
    },
    `${b}−(${a})=${Number((b - a).toFixed(6))}°C. An anomaly is a difference from the stated reference average, not an absolute air temperature.`,
    "Use ending minus starting value; retain negative signs.",
  );
}
function gasTask(
  s: string,
  title: string,
  co2: number,
  methane: number,
  factor: number,
): LearningTask {
  return construction(
    s,
    title,
    "Calculate the methane contribution and total on the supplied warming basis.",
    [
      [
        "methaneEquivalent",
        "CH₄ contribution / kg CO₂e",
        Number((methane * factor).toFixed(6)),
      ],
      [
        "totalEquivalent",
        "Total footprint / kg CO₂e",
        Number((co2 + methane * factor).toFixed(6)),
      ],
    ],
    {
      title: "Supplied full-lifetime inventory",
      note: "Original exercise values; all listed gases use the same boundary.",
      gases: { co2, methane, factor, horizon: "100-year exercise basis" },
    },
    `${methane}×${factor}=${methane * factor} kg CO₂e from CH₄; add ${co2} kg CO₂ for ${co2 + methane * factor} kg CO₂e. Equivalence compares warming, not chemical identity.`,
    "Apply the supplied methane factor before adding CO₂.",
  );
}
function serviceTask(
  s: string,
  title: string,
  a: number,
  ua: number,
  b: number,
  ub: number,
): LearningTask {
  const pa = a / ua,
    pb = b / ub,
    red = Number((((pa - pb) / pa) * 100).toFixed(6));
  return construction(
    s,
    title,
    "Calculate each lifetime footprint per completed service and the percentage reduction from A to B.",
    [
      ["perA", "A per completed service / kg CO₂e", pa],
      ["perB", "B per completed service / kg CO₂e", pb],
      ["reductionPercent", "Reduction from A to B / %", red],
    ],
    {
      title: "Equal completed services",
      note: "Original full-lifetime estimates on the same 100-year warming basis. Counts are achieved uses with equal performance.",
      comparison: {
        a: { total: a, uses: ua },
        b: { total: b, uses: ub },
        service: "one equal completed service",
      },
    },
    `A=${a}/${ua}=${pa}; B=${b}/${ub}=${pb} kg CO₂e per service. (${pa}−${pb})/${pa}×100=${red}% reduction relative to A.`,
    "Use equal service units, then divide the saving by the original A value.",
  );
}
const effects =
  "Sea level can rise as land ice melts and seawater expands with warming, increasing coastal flood risk. Changed rainfall can increase drought or inland flood risk. Some extreme weather events can become more frequent or severe. Habitats and species or crop ranges can shift, affecting ecosystems and food production. The magnitude and consequences vary by region and depend on exposure and adaptation; one event alone is not proof of the global trend.";
const effectRubric = [
  "Describe sea-level rise and a consequence, using land ice and/or thermal expansion rather than only floating sea ice.",
  "Describe changed rainfall and drought or inland flood risk.",
  "Describe changes to the frequency/severity of some extreme weather.",
  "Describe habitat/species/crop-range changes and an ecological or food-production consequence.",
  "Keep the four effects distinct and qualify region, exposure or adaptation; avoid acid rain/ozone as the same process.",
];
const warmup: LearningTask[] = [
  choice(
    "w-weather",
    "Separate timescales",
    "A cold afternoon at one town is mainly a measurement of…",
    "Local weather",
    {
      "Global long-term climate":
        "One afternoon and one town do not describe global long-term statistics.",
      "No atmospheric condition":
        "Temperature is a measured atmospheric condition.",
    },
    "Weather describes short-term local conditions; climate describes long-term patterns and statistics.",
    "Compare the place and duration.",
  ),
  numeric(
    "w-mass",
    "Convert a gas mass",
    "Convert 500 g of methane to kilograms.",
    0.5,
    "kg",
    "500/1000=0.5 kg. Apply warming factors only after using consistent mass units.",
    "1000 g equals 1 kg.",
  ),
  numeric(
    "w-change",
    "Subtract signed differences",
    "A difference from a reference changes from−0.1 °C to+0.3 °C. What is the increase?",
    0.4,
    "°C",
    "0.3−(−0.1)=0.4 °C; subtracting a negative adds its magnitude.",
    "Use final minus initial.",
  ),
  choice(
    "w-gas",
    "Retrieve gas scope",
    "A methane-emitting service has a carbon footprint. Which gases must be considered?",
    "CO₂ and other emitted greenhouse gases",
    {
      "Only carbon dioxide":
        "Other greenhouse gases such as methane also contribute.",
      "Only nitrogen and oxygen":
        "These abundant gases are not the required footprint inventory.",
    },
    "A footprint includes CO₂ and other greenhouse gases emitted over the full life cycle.",
    "Recall methane’s greenhouse role.",
  ),
];
const refresher: LearningTask[] = [
  numeric(
    "r-fluctuations",
    "Read through fluctuations",
    "Construct the overall change in the supplied fluctuating series.",
    0.8,
    "°C",
    climateRecords.fluctuations.feedback,
    "Compare the first and last points, not just one dip.",
    "fluctuations",
  ),
  numeric(
    "r-cooling",
    "Retain a negative change",
    "Construct the change for this regional series.",
    -0.3,
    "°C",
    climateRecords.cooling.feedback,
    "Ending minus starting; do not drop the sign.",
    "cooling",
  ),
  choice(
    "r-weather",
    "Test a cold-week claim",
    "Does the supplied cold week decide a global long-term trend?",
    "No; use a wider long-term record",
    {
      "Yes; one town settles it":
        "The claim confuses local short-term weather with global climate.",
      "No temperature can be measured":
        "Measurements are possible; the sampling is insufficient.",
    },
    climateRecords.weather.feedback,
    "Check sampling over time and place.",
    "weather",
  ),
  choice(
    "r-correlation",
    "Test causal support",
    "Does the supplied correlation alone prove its claimed cause?",
    "No; a mechanism and independent evidence are also needed",
    {
      "Yes; all correlation proves cause":
        "Two variables can change together for reasons not established by the graph.",
      "No evidence can ever support a cause":
        "Mechanisms and multiple independently checked lines of evidence can support causal conclusions.",
    },
    climateRecords.correlation.feedback,
    "Separate an association from a causal explanation.",
    "correlation",
  ),
  choice(
    "r-funding",
    "Scrutinise a disclosure",
    "How should the disclosed financial interest be treated?",
    "Scrutinise methods and independent checks",
    {
      "Automatically reject every result":
        "Funding alone cannot establish whether a measured result is false.",
      "Ignore methods and trust popularity":
        "Popularity does not establish scientific quality.",
    },
    climateRecords.funding.feedback,
    "Look for possible bias and actual methods.",
    "funding",
  ),
  numeric(
    "r-history",
    "Quantify historical uncertainty",
    "Find the width of the supplied historical estimate interval.",
    0.2,
    "°C",
    climateRecords.historical.feedback,
    "Upper limit minus lower limit.",
    "historical",
  ),
  numeric(
    "r-inventory",
    "Count a full lifetime",
    "Sum all the supplied product stages.",
    115,
    "kg CO₂e",
    climateRecords.kettle.feedback,
    "Keep manufacture, transport, use and end of life.",
    "kettle",
  ),
  numeric(
    "r-gas",
    "Weight emitted methane",
    "Construct the total footprint of the waste service.",
    19,
    "kg CO₂e",
    climateRecords.waste.feedback,
    "Multiply methane mass by the given factor, then add CO₂.",
    "waste",
  ),
  numeric(
    "r-service",
    "Compare achieved services",
    "Construct the percentage reduction per equal load from A to B.",
    50,
    "%",
    climateRecords.bags.feedback,
    "Divide each total by achieved uses before comparing.",
    "bags",
  ),
  choice(
    "r-landfill",
    "Build a methane reduction",
    "What limitation directly affects the supplied collection proposal?",
    "Leaks and incomplete collection",
    {
      "Every emission becomes zero":
        "Captured methane combustion still makes CO₂ and collection can be incomplete.",
      "Only the equipment’s colour":
        "Colour does not establish collection efficiency or leakage.",
    },
    climateRecords.landfill.feedback,
    "Follow what escapes and what is collected.",
    "landfill",
  ),
  written(
    "r-effects",
    "Retrieve distinct consequences",
    "Describe four potential effects and one reason local risk differs.",
    effects,
    effectRubric,
    "Separate sea level, rainfall, some extremes and habitats or crop ranges.",
  ),
  choice(
    "r-solar",
    "Match a source and a limit",
    "Why can solar replacement lower CO₂ yet need storage or other supply?",
    "Less fossil combustion, but sunshine varies",
    {
      "Solar removes every lifetime emission":
        "Equipment manufacture can still emit greenhouse gases.",
      "Sunshine always matches demand":
        "Time of day and weather can make solar supply differ from demand.",
    },
    climateRecords.solar.feedback,
    "Consider both the fossil process and variable supply.",
    "solar",
  ),
  choice(
    "r-review",
    "Evaluate scrutiny",
    "Which statement about the documented report is justified?",
    "Peer review adds scrutiny; independent checking still matters",
    {
      "Peer review guarantees perfection":
        "Specialists can miss errors and later evidence can alter conclusions.",
      "No methods need to be disclosed":
        "Transparent methods support checking and replication.",
    },
    climateRecords.transparent.feedback,
    "Distinguish stronger evidence from infallibility.",
    "transparent",
  ),
  choice(
    "r-projection",
    "Check projection assumptions",
    "Why should a projection state emissions assumptions and its data range?",
    "Future scenarios and model limits affect the estimate",
    {
      "A straight trend must continue exactly forever":
        "Future emissions and physical interactions can change the outcome.",
      "A scenario range proves no knowledge":
        "Useful ranges can be supported under explicit assumptions.",
    },
    climateRecords.projection.feedback,
    "Check extrapolation, future emissions and physical model assumptions.",
    "projection",
  ),

  numeric(
    "r-efficiency",
    "Calculate a supplied intensity",
    "Saving 40 kWh at a supplied 0.25 kg CO₂e/kWh avoids how many kg CO₂e?",
    10,
    "kg CO₂e",
    "40×0.25=10 kg CO₂e under the supplied full-boundary intensity. A different electricity source or boundary can change the intensity.",
    "Multiply energy saved by the supplied emissions per kWh.",
  ),
];
const guided: LearningTask[] = [
  numeric(
    "g-trend",
    "Read a trend",
    "Construct the overall change.",
    0.8,
    "°C",
    climateRecords.trend.feedback,
    "Read both endpoints, then subtract.",
    "trend",
  ),
  choice(
    "g-report",
    "Evaluate a report",
    "Which judgement fits the supplied documented report?",
    "Supports its trend with stated uncertainty",
    {
      "Peer review guarantees perfection":
        "Peer review improves scrutiny but can miss errors.",
      "A range makes every result worthless":
        "Uncertainty does not remove all useful evidence.",
    },
    climateRecords.transparent.feedback,
    "Check coverage, methods and independent scrutiny.",
    "transparent",
  ),
  numeric(
    "g-range",
    "Read a scenario interval",
    "Construct the width of the supplied projection interval.",
    0.8,
    "°C",
    climateRecords.projection.feedback,
    "Subtract the lower limit from the upper limit.",
    "projection",
  ),
  numeric(
    "g-boundary",
    "Audit a claimed lifetime",
    "Find the footprint including every supplied stage.",
    80,
    "kg CO₂e",
    climateRecords.advertisement.feedback,
    "Compare the advertised stages with the complete inventory.",
    "advertisement",
  ),
  numeric(
    "g-equivalents",
    "Compare gas contributions",
    "Construct the full supplied service footprint.",
    64,
    "kg CO₂e",
    climateRecords.delivery.feedback,
    "Use the supplied factor and consistent kilograms.",
    "delivery",
  ),
  numeric(
    "g-comparison",
    "Compare the same service",
    "Construct the percentage reduction from A to B per drink.",
    70,
    "%",
    climateRecords.cups.feedback,
    "Use the original per-drink A value as the percentage denominator.",
    "cups",
  ),
  choice(
    "g-reduction",
    "Link an action and a limit",
    "Which specific limitation applies to the solar proposal?",
    "Variable sunshine requires storage or other supply",
    {
      "Solar guarantees zero lifetime emissions":
        "Manufacturing and installation can still have emissions.",
      "Burning more fossil carbon lowers CO₂":
        "Burning more fossil carbon generally adds CO₂ rather than reducing it.",
    },
    climateRecords.solar.feedback,
    "Match supply to electricity demand.",
    "solar",
  ),
];
const practice: LearningTask[] = [
  choice(
    "p-weather",
    "Challenge a headline",
    "One exceptionally cold day is used to claim the long-term global trend is false. What is the problem?",
    "A local day cannot decide a global long-term trend",
    {
      "Cold days cannot occur during warming":
        "Short-term variability can occur around a rising long-term average.",
      "No climate data are needed":
        "A climate claim needs a sufficiently broad long-term evidence base.",
    },
    "Use many locations and a long period; weather still varies when the climate changes.",
    "Check time and spatial coverage.",
  ),
  choice(
    "p-climate",
    "Define the climate comparison",
    "Which describes climate rather than one weather observation?",
    "Long-term patterns and statistics of conditions",
    {
      "Today’s rain alone":
        "A single day is a weather observation rather than a long-term distribution.",
      "One thermometer error": "An isolated error does not define the climate.",
    },
    "Climate describes long-term distributions and averages, including variation, over stated regions.",
    "Look for long-term statistics.",
  ),
  graphTask("p-graph", "Construct an independent graph reading", {
    baseline: "Difference from a fixed teaching reference average",
    min: -0.4,
    max: 0.8,
    points: [
      { year: 1980, anomaly: -0.3 },
      { year: 2000, anomaly: 0.1 },
      { year: 2020, anomaly: 0.5 },
    ],
  }),
  choice(
    "p-anomaly",
    "Interpret a negative anomaly",
    "A graph reports−0.2 °C relative to its stated reference average. What does this mean?",
    "0.2 °C below that reference average",
    {
      "Actual air temperature is−0.2 °C":
        "An anomaly is a difference from the reference, not an absolute temperature.",
      "No temperature can be interpreted":
        "The stated baseline makes the difference interpretable.",
    },
    "Negative anomalies can occur while actual temperatures remain above 0 °C; the reference value matters.",
    "Distinguish temperature from a temperature difference.",
  ),
  choice(
    "p-correlation",
    "Assess a correlation",
    "CO₂ and temperature both rise in a supplied graph. What can this graph alone establish?",
    "An association, requiring other evidence for cause",
    {
      "The cause is proven solely by correlation":
        "Correlation alone does not distinguish causal links from other relationships.",
      "CO₂ cannot affect temperature":
        "The absence of a graph-only proof does not negate the greenhouse mechanism.",
    },
    "Physical greenhouse mechanisms and multiple independent observations/models strengthen causal evaluation; correlation alone is insufficient.",
    "Do not confuse association with a complete explanation.",
  ),
  written(
    "p-report",
    "Evaluate two reports",
    "ReportA uses one local winter and hides methods. ReportB combines many decades/sites, documents corrections and is peer reviewed. Evaluate their quality and one useful further check.",
    "B has stronger coverage and transparent methods, reducing sampling/cherry-picking concerns. Peer review adds scrutiny but is not a guarantee. Compare independent methods/results and communicate the stated uncertainty. A’s short local sample cannot decide the long-term global trend.",
    [
      "Compare temporal and geographical coverage rather than report popularity.",
      "Explain the value and limits of transparent methods and peer review.",
      "Suggest independent comparison/replication and communicate uncertainty; do not claim perfection.",
    ],
    "Compare coverage, methods and independent scrutiny.",
  ),
  choice(
    "p-review",
    "Explain peer review",
    "What is the main purpose of peer review?",
    "Other specialists scrutinise methods, reasoning and evidence",
    {
      "Guarantees every conclusion forever":
        "Peer review can miss errors and evidence can change.",
      "Makes results true by majority vote":
        "Scientific confidence depends on evidence and methods, not voting alone.",
    },
    "Specialist scrutiny can identify weaknesses; independent replication and further evidence remain valuable.",
    "Ask what reviewers can examine.",
  ),
  choice(
    "p-funding",
    "Avoid an automatic verdict",
    "A sponsor may benefit from a result. What follows from this alone?",
    "A potential bias to examine, not proof of falsehood",
    {
      "Every result is automatically false":
        "A conflict of interest warrants scrutiny but cannot by itself establish false measurements.",
      "The methods no longer matter":
        "Methods and independent checks remain central to judging the evidence.",
    },
    "Check disclosure, representative sampling, transparent methods and independently checked results.",
    "Evaluate evidence as well as incentives.",
  ),
  numeric(
    "p-range",
    "Calculate a supplied width",
    "A supplied scenario interval is 1.1–2.0 °C. Find its width.",
    0.9,
    "°C",
    "2.0−1.1=0.9 °C wide; the interval does not specify probabilities or an exact outcome.",
    "Upper minus lower; preserve units.",
  ),
  choice(
    "p-extrapolate",
    "Evaluate an exact forecast",
    "A student extends a short straight trend far beyond its measured years and claims an exact future temperature. Which is the best criticism?",
    "Extrapolation and scenario assumptions need checking",
    {
      "Every trend continues exactly forever":
        "Physical conditions and future emissions can change; exact continuation is unsupported.",
      "No model can provide useful estimates":
        "Models can give useful estimates when assumptions and uncertainty are evaluated.",
    },
    "Outside-range projections depend on model and scenario assumptions; a straight-line extension alone cannot give an exact future temperature.",
    "Check the data range and missing assumptions.",
  ),
  written(
    "p-uncertainty",
    "Explain useful uncertainty",
    "Explain why uncertainty in climate estimates does not mean no useful knowledge, and give two reasons estimates can differ.",
    "Finite historical measurements and uneven locations/instruments can affect reconstructions. Complex interactions and uncertain future emissions affect projections. Models can still support trends and ranges tested against evidence. State assumptions and limitations; do not claim every explanation is equally supported.",
    [
      "Distinguish supported estimates/ranges from exact outcomes or no knowledge.",
      "Give two relevant sources, such as historical measurement/location limits and complex model/future-emission assumptions.",
      "Explain scrutiny against independent evidence and communication of assumptions; avoid equal-support false balance.",
    ],
    "Separate past measurement limits from future scenario assumptions.",
  ),
  written(
    "p-effects",
    "Explain four distinct effects",
    "Describe four potential climate-change effects and discuss how risk or consequences vary by place.",
    effects,
    effectRubric,
    "Give distinct outcomes with consequences, not four restatements of warming.",
  ),
  choice(
    "p-landice",
    "Explain a sea-level mechanism",
    "Which explanation directly supports rising sea level as temperatures increase?",
    "Melting land ice and expansion of warming seawater",
    {
      "Only floating sea ice directly adds the same volume":
        "Floating sea ice already displaces water; it is not the same direct mechanism as adding land-ice meltwater.",
      "Only an ozone hole creates extra water":
        "Ozone depletion is not a mechanism creating ocean water.",
    },
    "Land ice adds water to the sea, and thermal expansion increases seawater volume. Coastal risk also depends on exposure and adaptation.",
    "Ask whether extra water is added or existing seawater expands.",
  ),
  choice(
    "p-risk",
    "Qualify a regional consequence",
    "Why can the same global average increase have different local consequences?",
    "Exposure, regional changes and adaptation differ",
    {
      "All regions have identical rainfall and coastlines":
        "Regions differ in rainfall, coastline, infrastructure and vulnerability.",
      "One storm proves every global claim":
        "An individual event alone cannot establish a global long-term trend.",
    },
    "Global averages do not imply uniform regional weather, impacts or risk; assess place and scale.",
    "Consider where people/ecosystems are exposed.",
  ),
  choice(
    "p-footprint",
    "Define full carbon scope",
    "Which defines a carbon footprint?",
    "CO₂ and other greenhouse gases over a full product, service or event life cycle",
    {
      "Only CO₂ emitted during use":
        "This excludes other emitted gases and earlier/later stages.",
      "The mass of carbon atoms in a product":
        "Stored carbon-atom mass is not a full emitted-greenhouse-gas inventory.",
    },
    "A full footprint states its lifetime boundary and accounts for CO₂ and other emitted greenhouse gases, often on a specified CO₂e basis.",
    "Include gases, stages and the stated activity.",
  ),
  choice(
    "p-equivalence",
    "Interpret the comparison metric",
    "What does CO₂e compare?",
    "Different greenhouse gases on a stated warming basis",
    {
      "Methane chemically changes into CO₂":
        "Equivalence is a comparison of warming effects, not a chemical reaction.",
      "Only the mass of carbon atoms":
        "CO₂e is a greenhouse-gas warming metric, not the mass of carbon atoms.",
    },
    "A stated factor and timescale allow comparison of emitted gases; the molecules retain their chemical identities.",
    "Distinguish a warming metric from a chemical conversion.",
  ),
  numeric(
    "p-boundary",
    "Add every supplied stage",
    "A full lifetime inventory gives manufacture 16, transport 4, use 58, end of life 6 kg CO₂e on one basis. Find the total.",
    84,
    "kg CO₂e",
    "16+4+58+6=84 kg CO₂e. Counting only the first, second and final stages would omit use emissions.",
    "Use all four stages.",
  ),
  gasTask("p-gases", "Construct gas equivalents", 10, 0.4, 25),
  numeric(
    "p-units",
    "Convert before weighting",
    "An original inventory has 1.2 tonnes CO₂ and 300 g CH₄. The supplied 100-year methane factor is 20 kg CO₂e per kg CH₄. Find total kg CO₂e.",
    1206,
    "kg CO₂e",
    "1.2 t=1200 kg; 300 g=0.3 kg; 0.3×20=6 kg CO₂e. Total 1206 kg CO₂e. The supplied factor is an exercise value, not a universal constant.",
    "Convert both gas masses to kilograms first.",
  ),
  serviceTask("p-service", "Construct a fair comparison", 18, 90, 15, 150),
  numeric(
    "p-percent",
    "Use the original denominator",
    "A footprint per service falls from 0.25 to 0.10 kg CO₂e. Calculate percentage reduction relative to the original.",
    60,
    "%",
    "(0.25−0.10)/0.25×100=60%. Dividing by the final value would give a different, inappropriate baseline.",
    "Saving divided by original, times 100.",
  ),
  written(
    "p-solar",
    "Evaluate a solar proposal",
    "Explain how replacing some fossil generation with solar can reduce CO₂, then give two specific reasons solar alone may not meet all demand.",
    "Less fossil carbon is burned, reducing CO₂ from combustion. Sunshine varies and is absent at night, so demand matching needs storage or other supply. Available space/capacity can limit the amount generated. Manufacturing equipment still contributes to the full lifetime footprint.",
    [
      "Link reduced fossil combustion to lower CO₂ rather than asserting every emission is zero.",
      "Give two distinct context-relevant limitations, such as variable sunshine/demand matching and available space/capacity.",
      "Explain how the limits affect supply and retain the equipment life-cycle boundary.",
    ],
    "Connect the chemical source and practical electricity demand.",
  ),
  numeric(
    "p-efficiency",
    "Quantify a supplied saving",
    "An efficiency change saves 30 kWh. The given full-boundary intensity is 0.3 kg CO₂e/kWh. How much is saved?",
    9,
    "kg CO₂e",
    "30×0.3=9 kg CO₂e under the supplied intensity and boundary. The value changes if the electricity source or intensity changes.",
    "Multiply energy saved by emissions per energy unit.",
  ),
  written(
    "p-landfill",
    "Evaluate methane collection",
    "Explain how collecting landfill methane can reduce a footprint and two things needed before claiming an exact saving.",
    "Collection reduces methane escape; burning captured gas produces CO₂ and water and may replace another fuel. The saving depends on actual collection/leakage and the specified warming basis, plus displaced energy and other life-cycle emissions. It does not make every emission zero.",
    [
      "Link collection to less CH₄ escaping and distinguish subsequent combustion producing CO₂.",
      "Identify collection/leakage as an assumption affecting the saving.",
      "Identify a second relevant factor such as warming timescale, displaced energy or life-cycle emissions; avoid a guaranteed exact saving.",
    ],
    "Follow collected gas, escaping gas and the comparison basis.",
  ),
  choice(
    "p-limit",
    "Distinguish low from zero",
    "Why should a renewable-electricity proposal still state a life-cycle boundary?",
    "Equipment manufacture and installation can still emit greenhouse gases",
    {
      "Renewable means every stage is zero":
        "A renewable energy source can still require emission-producing equipment manufacture.",
      "Only socket shape determines emissions":
        "Electricity source, equipment and the boundary matter, not socket geometry.",
    },
    "Use-stage fuel emissions may be low while other lifetime stages contribute; compare on a stated full boundary.",
    "Look beyond operation.",
  ),
  written(
    "p-reuse",
    "Question a reuse claim",
    "ProductA emits 6 kg CO₂e over 30 achieved equal services; B emits 8 kg over 80. Explain the fair comparison and why promised reuse alone is insufficient.",
    "A=0.20 kg CO₂e per service; B=0.10 at the stated achieved uses, so B is lower despite its larger total. Compare the same capacity/performance and full boundary. If actual B uses are fewer, its per-service footprint can be higher; include washing and end-of-life assumptions. Other environmental impacts can differ.",
    [
      "Calculate and compare 0.20 and 0.10 kg CO₂e per equal service rather than total product mass alone.",
      "State equal performance and full boundaries, including relevant use/washing assumptions.",
      "Distinguish achieved from promised reuse and qualify the effect of fewer uses; carbon alone is not every environmental impact.",
    ],
    "Divide totals by actual equal services.",
  ),
  written(
    "p-communication",
    "Communicate without overclaiming",
    "A report gives a scenario range of 1.4–2.2 °C. Draft a short accurate explanation for a public audience, including what the range does not mean.",
    "Under the stated emissions scenario and reference period, the model supports a range of 1.4–2.2 °C change. The outcome is not guaranteed to be the midpoint; probabilities are not supplied, and different emissions assumptions may change the projection. Describe methods/uncertainty clearly and invite independent scrutiny.",
    [
      "Give the range with units and stated scenario/reference context.",
      "Avoid claiming an exact midpoint, equal probabilities or no knowledge.",
      "State assumptions/limitations clearly for the audience and value evidence scrutiny.",
    ],
    "State estimate, basis and limits in plain language.",
  ),
];
const checkForms: LearningTask[][] = [
  [
    choice(
      "cA-weather",
      "Assess an isolated winter",
      "One town’s cold winter is used to reject a multi-decade global trend. Which judgement is justified?",
      "The sample alone cannot decide the global long-term trend",
      {
        "A global trend forbids cold winters":
          "Local/short-term variability can coexist with a changing global average.",
        "One town represents every location":
          "A single locality lacks global spatial coverage.",
      },
      "Compare consistent long-term measurements from many locations.",
      "Check temporal and spatial scope.",
    ),
    graphTask("cA-graph", "Read a new series", {
      baseline: "Difference from a stated fixed teaching reference average",
      min: -0.4,
      max: 1,
      points: [
        { year: 1970, anomaly: -0.3 },
        { year: 1990, anomaly: 0.2 },
        { year: 2005, anomaly: 0.1 },
        { year: 2020, anomaly: 0.8 },
      ],
    }),
    written(
      "cA-report",
      "Evaluate evidence independently",
      "Explain how coverage, peer review and independent checks affect confidence in a climate report.",
      "Many locations and long periods reduce unrepresentative sampling. Transparent methods let others scrutinise corrections and reasoning; peer review can reveal problems but is not infallible. Independent methods/replication can strengthen confidence, while assumptions and uncertainty should be communicated.",
      [
        "Explain temporal and geographical coverage.",
        "Explain method transparency and peer review without claiming certainty.",
        "Explain independent checks and communicate uncertainty.",
      ],
      "Compare coverage, scrutiny and corroboration.",
    ),
    choice(
      "cA-range",
      "Interpret a supplied interval",
      "A scenario range is reported with no probability distribution. Which inference is supported?",
      "It represents estimates under stated assumptions",
      {
        "Every value is equally probable":
          "A range alone does not provide probabilities.",
        "The midpoint is guaranteed":
          "No exact future outcome follows from the interval.",
      },
      "Communicate the assumptions and limits without inventing probabilities.",
      "Check what information the interval supplies.",
    ),
    written(
      "cA-effects",
      "Describe potential consequences",
      "Describe four distinct potential climate-change effects and explain why local risk can differ.",
      effects,
      effectRubric,
      "Use consequences and location, not only the phrase global warming.",
    ),
    numeric(
      "cA-gases",
      "Calculate on a supplied basis",
      "An original full-lifetime inventory contains 24 kg CO₂ and 0.75 kg CH₄. The given 100-year methane factor is 20 kg CO₂e/kg CH₄. Find the total.",
      39,
      "kg CO₂e",
      "0.75×20=15; 24+15=39 kg CO₂e on the supplied exercise basis.",
      "Weight methane and add CO₂.",
    ),
    choice(
      "cA-boundary",
      "Evaluate advertised coverage",
      "A footprint claim counts manufacture and transport but excludes use and disposal. Is it a full lifetime footprint?",
      "No; it is a partial inventory",
      {
        "Yes; the first two stages are always enough":
          "Use and disposal may emit greenhouse gases and belong to the full life cycle.",
        "Yes; CO₂e removes the need for a boundary":
          "A warming metric does not define which stages were counted.",
      },
      "Report the omitted stages and compare the same full boundary.",
      "Check all lifetime stages.",
    ),
    written(
      "cA-reduce",
      "Explain an action and limits",
      "Describe how solar replacement can reduce fossil CO₂ and explain two limitations on supplying all electricity demand.",
      "Less fossil carbon is burned, reducing CO₂. Variable sunshine/time of day requires storage or another supply; space/capacity and rising demand can limit coverage. Equipment manufacture still contributes life-cycle emissions.",
      [
        "Link reduced fossil combustion to CO₂ reduction.",
        "Explain two distinct relevant limitations on meeting demand.",
        "Retain the full life cycle and avoid guaranteed zero emissions.",
      ],
      "Link gas production, electricity supply and constraints.",
    ),
  ],
  [
    choice(
      "cB-cause",
      "Evaluate a causal statement",
      "A graph correlates CO₂ and temperature. Which extra evidence would strengthen causal interpretation?",
      "A physical mechanism plus independent measurements and models",
      {
        "Only more social-media agreement":
          "Popularity is not an independent chemical mechanism or evidence test.",
        "No further evidence can matter":
          "Mechanisms and independent observations can strengthen causal evaluation.",
      },
      "A graph-only association is insufficient; the greenhouse mechanism and wider checked evidence matter.",
      "Distinguish the graph from the full causal evidence.",
    ),
    serviceTask("cB-service", "Compare new equal services", 16, 80, 9, 150),
    written(
      "cB-quality",
      "Evaluate a biased-looking report",
      "A sponsored report selects only a recent local dip and hides methods. Evaluate it without claiming funding alone proves falsehood.",
      "The short local sample can be cherry-picked and cannot decide a global long-term trend. Hidden methods prevent scrutiny. Funding is a possible conflict, not an automatic verdict; request disclosure, broad records, peer review and independent methods/results.",
      [
        "Identify temporal/spatial selection as a weakness.",
        "Explain why hidden methods weaken scrutiny and give a useful check.",
        "Treat funding as a potential conflict rather than proof; seek independent evidence.",
      ],
      "Evaluate both sampling and methods.",
    ),
    numeric(
      "cB-width",
      "Calculate a new range width",
      "A supplied scenario interval is 0.9–2.0 °C. What is its width?",
      1.1,
      "°C",
      "2.0−0.9=1.1 °C wide. The width alone supplies no exact outcome or probabilities.",
      "Upper minus lower.",
    ),
    written(
      "cB-effects",
      "Explain four different effects",
      "Explain four distinct possible climate-change consequences, with at least one qualification about regional risk.",
      effects,
      effectRubric,
      "Give four different outcomes rather than duplicate sea-level statements.",
    ),
    gasTask("cB-gases", "Construct a new gas inventory", 30, 0.2, 30),
    choice(
      "cB-footprint",
      "Identify complete scope",
      "Which scope is required for a full carbon footprint?",
      "All emitted greenhouse gases across the full stated lifetime",
      {
        "Only the use-stage CO₂":
          "That excludes other gases and earlier/later lifetime stages.",
        "Only the product’s stored carbon":
          "Stored carbon mass is not total lifetime greenhouse-gas emissions.",
      },
      "State product/service/event, gases, functional unit, full boundary and assumptions.",
      "Think gases and stages.",
    ),
    written(
      "cB-collection",
      "Evaluate an emissions action",
      "Explain methane collection at landfill, its chemical consequence if burned and one practical limitation.",
      "Collection can reduce escaped CH₄; combustion of captured methane produces CO₂ and water and may displace another fuel. Incomplete collection/leaks limit the benefit. Quantification requires a stated warming basis and full-boundary comparison.",
      [
        "Explain reduced CH₄ escape through collection.",
        "State CO₂ and water after combustion; do not claim every GHG disappears.",
        "Explain leaks/incomplete collection and the need for a defined comparison.",
      ],
      "Trace capture, combustion and remaining escape.",
    ),
  ],
];
const reviewForms: LearningTask[][] = [
  [
    gasTask("vA-gases", "Retrieve gas weighting", 18, 0.3, 20),
    choice(
      "vA-baseline",
      "Retrieve an anomaly meaning",
      "An anomaly is−0.4 °C. Which statement is supported?",
      "It is 0.4 °C below the stated reference average",
      {
        "Actual temperature must be−0.4 °C":
          "Anomaly is a relative difference, not an absolute temperature.",
        "There is no reference involved":
          "An anomaly needs a stated comparison baseline.",
      },
      "The reference determines the meaning of the relative value.",
      "Recall what anomaly compares.",
    ),
    choice(
      "vA-boundary",
      "Retrieve the full boundary",
      "Which lifetime stage can be omitted without checking its emissions?",
      "None of the stages can be assumed irrelevant",
      {
        "Use can always be omitted":
          "Use emissions can dominate some product footprints.",
        "Manufacture can always be omitted":
          "Manufacture can produce greenhouse gases even for renewable equipment.",
      },
      "Account for relevant emissions over manufacture, transport, use and end of life.",
      "Recall the full lifetime.",
    ),
    written(
      "vA-report",
      "Retrieve evidence evaluation",
      "Explain why one cold week and an undisclosed method are weak support for a global climate claim, and give two improvements.",
      "A week at one location lacks temporal and geographical coverage. Undisclosed methods prevent scrutiny. Use representative long-term broad records and transparent peer-reviewed methods with independent checking; state uncertainty.",
      [
        "Explain both sampling and method weaknesses.",
        "Suggest broad long-term coverage and transparent scientific scrutiny.",
        "Include independent checking and clear uncertainty communication.",
      ],
      "Recall place, time, methods and scrutiny.",
    ),
  ],
  [
    numeric(
      "vB-percent",
      "Retrieve a fair reduction",
      "A full footprint per equal service falls from 0.30 to 0.12 kg CO₂e. Find percentage reduction from the original.",
      60,
      "%",
      "(0.30−0.12)/0.30×100=60%.",
      "Use the original per-service denominator.",
    ),
    numeric(
      "vB-range",
      "Retrieve range width",
      "A supplied historical estimate is 0.2–0.7 °C. What is its width?",
      0.5,
      "°C",
      "0.7−0.2=0.5 °C. It is a supported interval, not an exact midpoint.",
      "Subtract limits.",
    ),
    choice(
      "vB-zero",
      "Retrieve life-cycle reasoning",
      "Does renewable generation guarantee zero lifetime greenhouse emissions?",
      "No; equipment and other lifetime stages still matter",
      {
        "Yes; renewable always means zero":
          "The energy source’s renewability does not remove equipment manufacture emissions.",
        "Yes; boundaries no longer matter":
          "Comparable footprints still need stated boundaries and assumptions.",
      },
      "Assess every relevant lifetime stage on a consistent functional unit and warming basis.",
      "Think beyond operation.",
    ),
    written(
      "vB-effects",
      "Retrieve effects and risk",
      "Describe four distinct potential climate-change effects, including why consequences vary by region.",
      effects,
      effectRubric,
      "Recall sea level, rainfall, some extreme weather and habitats/ranges.",
    ),
  ],
];
const recovery = [
  "r-weather",
  "r-weather",
  "r-fluctuations",
  "r-fluctuations",
  "r-correlation",
  "r-review",
  "r-review",
  "r-funding",
  "r-history",
  "r-projection",
  "r-projection",
  "r-effects",
  "r-effects",
  "r-effects",
  "r-inventory",
  "r-gas",
  "r-inventory",
  "r-gas",
  "r-gas",
  "r-service",
  "r-service",
  "r-solar",
  "r-efficiency",
  "r-landfill",
  "r-inventory",
  "r-service",
  "r-projection",
];
export const climateRecoveryRoutes: Record<string, string> = {};
practice.forEach((q, i) => {
  q.followUp = id(recovery[i]);
  climateRecoveryRoutes[q.id] = q.followUp;
});
export const allClimateTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const climateExposureFamilies = {
  weather: ["w-weather", "r-weather", "p-weather", "cA-weather"],
  climate: ["p-climate", "w-weather"],
  metric: ["p-equivalence"],
  scope: ["w-gas", "p-footprint", "cB-footprint"],
  boundary: ["p-footprint", "cA-boundary", "vA-boundary"],
  correlation: ["r-correlation", "p-correlation", "cB-cause"],
  funding: ["r-funding", "p-funding"],
  review: ["p-review", "g-report", "r-review"],
  uncertainty: [
    "g-range",
    "r-projection",
    "p-uncertainty",
    "cA-range",
    "p-communication",
  ],
  anomaly: ["p-anomaly", "vA-baseline"],
  effects: ["p-effects", "r-effects", "cA-effects", "cB-effects", "vB-effects"],
  reports: ["p-report", "cA-report", "vA-report", "cB-quality"],
  solar: ["g-reduction", "r-solar", "p-solar", "cA-reduce"],
  collection: ["r-landfill", "p-landfill", "cB-collection"],
  lifetime: ["p-limit", "vB-zero"],
  reuse: ["r-service", "p-reuse"],
};
// Connected exposure is transitive: sharing an overlapping family must never produce fresh evidence.
const groups = Object.values(climateExposureFamilies).map((v) => new Set(v));
let merged = true;
while (merged) {
  merged = false;
  outer: for (let a = 0; a < groups.length; a++)
    for (let b = a + 1; b < groups.length; b++)
      if ([...groups[a]].some((s) => groups[b].has(s))) {
        groups[a] = new Set([...groups[a], ...groups[b]]);
        groups.splice(b, 1);
        merged = true;
        break outer;
      }
}
for (const group of groups)
  for (const s of group) {
    const q = allClimateTasks.find((q) => q.id === id(s))!;
    q.exposureAliases = [...group].filter((o) => o !== s).map(id);
  }
export const climateJourney: LessonJourney = {
  version: 1,
  introduction:
    "Evaluate climate evidence, interpret uncertainty and construct fair full-lifetime footprint comparisons.",
  scopeNote:
    "AQA Chemistry/Trilogy climate evidence, potential effects and footprint reduction, both tiers. Graphs, scenarios, inventories and warming factors are original supplied teaching values, not measured global datasets or real forecasts. CO₂e arithmetic extends the core scope using explicit exercise factors. Written evaluations are self-reviewed, not examiner marked. Complete board maps and final course readiness remain under review.",
  outcomes: [
    "Distinguish local weather from long-term climate and read overall graph trends, signed changes and reference anomalies.",
    "Evaluate sampling, transparent methods, peer review, independent checks, potential bias and causal evidence; communicate uncertainty accurately.",
    "Interpret historical/model/scenario ranges without inventing exact outcomes or probabilities.",
    "Describe four distinct potential climate effects and discuss regional scale, risk and environmental consequences.",
    "Account for all emitted greenhouse gases over the full product/service/event lifetime and compare equal functional units.",
    "Calculate gas equivalents on a supplied warming timescale, consistent mass units and achieved-use basis; use the original percentage denominator.",
    "Explain CO₂/CH₄ reduction actions, processes and context-specific limitations without guaranteed zero-emission claims.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Evidence, uncertainty and consequences",
      taskIds: practice.slice(0, 14).map((q) => q.id),
    },
    {
      label: "Full footprints and fair calculations",
      taskIds: practice.slice(14, 21).map((q) => q.id),
    },
    {
      label: "Actions, limitations and communication",
      taskIds: practice.slice(21).map((q) => q.id),
    },
  ],
};
