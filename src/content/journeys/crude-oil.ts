import type { LearningTask as Task, LessonJourney } from "../types";
import type { OilMode } from "../../lib/crude-oil";
import type { OilBarDrawingData } from "../../lib/oil-bar-drawing";
const model = (
  mode: OilMode,
  instruction: string,
  record = "initial",
): Task["model"] => ({ kind: "crude-oil", mode, record, instruction });
function c(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  m?: Task["model"],
): Task {
  const options = [answer, ...Object.keys(errors)],
    offset = [...id].reduce((s, x) => s + x.charCodeAt(0), 0) % options.length;
  return {
    id: "oil-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    ...(m ? { model: m } : {}),
  };
}
function n(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  unit: string,
  explanation: string,
  hint: string,
  m?: Task["model"],
): Task {
  return {
    id: "oil-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    ...(m ? { model: m } : {}),
  };
}
function w(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
): Task {
  return {
    id: "oil-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    rubric,
    explanation: answer,
    hint,
  };
}
const warmup: Task[] = [
  c(
    "w-mixture",
    "Compounds and mixtures",
    "A sample contains two different compounds. What describes the sample?",
    "A mixture",
    {
      "One element":
        "Compounds contain combined elements; two compounds do not become an element.",
      "One pure compound": "There is more than one compound.",
    },
    "A mixture contains different substances together; each compound retains its own identity.",
    "Count different substances, not atoms.",
  ),
  n(
    "w-temperature",
    "Compare temperatures",
    "A vessel is at 310 °C and an upper outlet at 40 °C. What is the temperature difference?",
    "270",
    "°C",
    "310−40=270 °C. A temperature difference uses the same degree size.",
    "Subtract the lower reading from the higher.",
  ),
];
const refresher: Task[] = [
  c(
    "r-hydrocarbon",
    "Use the element criterion",
    "Which supplied formula describes a hydrocarbon?",
    "C₆H₁₄",
    {
      "C₂H₆O": "Oxygen makes this more than carbon and hydrogen only.",
      "CO₂": "There is oxygen and no hydrogen.",
    },
    "C₆H₁₄ contains carbon and hydrogen only.",
    "Hydrocarbon means carbon and hydrogen ONLY.",
  ),
  n(
    "r-compounds",
    "Count distinct compounds",
    "A model has six identical C₅H₁₂ molecules. How many distinct compounds are present?",
    "1",
    "compound",
    "Copies of the same molecule are one distinct compound.",
    "Distinguish copies from different formulas.",
  ),
  c(
    "r-fraction",
    "A fraction can still be a mixture",
    "A collected fraction contains C₇H₁₆ and C₈H₁₈. Is it pure?",
    "No: it contains different compounds",
    {
      "Yes: collection makes it pure":
        "Fractional distillation collects groups, not necessarily one compound.",
      "No: every molecule is an element": "Each formula describes a compound.",
    },
    "Similar boiling behaviour can place different hydrocarbons in one fraction.",
    "Count distinct compounds in the collected sample.",
  ),
  n(
    "r-gradient",
    "Read a temperature gradient",
    "The top is 60 °C and the bottom 360 °C. How much cooler is the top?",
    "300",
    "°C",
    "360−60=300 °C; the column becomes cooler upwards.",
    "Compare bottom and top.",
  ),
  c(
    "r-condense",
    "Condensation criterion",
    "In a fixed-pressure threshold model, vapour with supplied boiling point 120 °C reaches an 80 °C tray. What happens?",
    "It condenses in this model",
    {
      "It cracks into smaller molecules":
        "Cooling and condensation do not imply cracking.",
      "It becomes an element": "Its molecular identity remains unchanged.",
    },
    "The tray is cooler than the supplied boiling point, so this teaching model collects liquid.",
    "Compare the tray temperature with the supplied boiling point.",
  ),
  c(
    "r-physical",
    "Preserve molecular identity",
    "A hydrocarbon is collected by fractional distillation. What happens to its formula?",
    "It remains unchanged",
    {
      "It always loses carbon atoms":
        "That would require a chemical change such as cracking.",
      "It becomes water": "No new substance is made by physical separation.",
    },
    "Vaporisation and condensation are physical changes; the molecule is retained.",
    "Separate molecules rather than break their covalent bonds.",
  ),
  c(
    "r-residue",
    "Not all components vaporise",
    "A model heats its feed to 320 °C. A component has supplied boiling point 410 °C. What is retained?",
    "Liquid residue in this threshold model",
    {
      "Top gas": "The feed is below its supplied boiling point.",
      "A smaller molecule": "The model does not crack molecules.",
    },
    "In this simplified model it does not vaporise and remains as residue.",
    "Compare feed temperature first.",
  ),
  c(
    "r-gas",
    "Not all vapours condense inside",
    "A component boils at −10 °C; the coolest tray is 30 °C. What can leave the top?",
    "Gas that has not condensed",
    {
      "Every component must collect as liquid":
        "No tray here is below the supplied boiling point.",
      "Carbon atoms only": "Physical separation preserves the molecule.",
    },
    "Very low-boiling material can remain gas at the top.",
    "Look for a tray cooler than −10 °C.",
  ),
  c(
    "r-trend",
    "Recall the general trends",
    "For comparable hydrocarbons, increasing molecular size generally makes ignition…",
    "Less easy",
    {
      Easier: "Ease of ignition generally decreases with size.",
      Impossible:
        "Longer-chain fractions can still burn under appropriate conditions.",
    },
    "Larger comparable hydrocarbons generally have higher boiling point and viscosity and lower ease of ignition.",
    "Flammability goes opposite to boiling point and viscosity.",
  ),
  c(
    "r-viscosity",
    "What viscosity describes",
    "A more viscous liquid generally…",
    "Flows less readily",
    {
      "Flows more readily": "That describes lower viscosity.",
      "Has a larger atomic number for each carbon":
        "Carbon atoms do not change identity with chain length.",
    },
    "Viscosity describes resistance to flow.",
    "Think of a liquid that flows with more difficulty.",
  ),
  c(
    "r-uses",
    "Retrieve a named fraction",
    "Which listed fraction is used as aircraft fuel?",
    "Kerosene",
    {
      Bitumen: "Bitumen is used on roads and roofs.",
      "Petroleum gases": "A listed use is domestic heating and cooking.",
    },
    "Kerosene is an aircraft-fuel fraction; names and uses are explicitly required by Pearson.",
    "Keep fraction use separate from a claim about a pure compound.",
  ),
  c(
    "r-purpose",
    "Different purposes for a fraction",
    "A hydrocarbon stream is processed into detergent ingredients rather than burned. What purpose is stated?",
    "Chemical feedstock",
    {
      "Fuel burned for energy":
        "The stated use is chemical processing, not combustion.",
      "Direct road-surface material":
        "That describes a different supplied use.",
    },
    "Feedstock supplies starting substances for making useful chemical products.",
    "Ask what is done with the supplied stream.",
  ),
  n(
    "r-percentage",
    "Convert a mass percentage",
    "A 600 kg feed gives 15% of its mass as a desired fraction. How much fraction is obtained?",
    "90",
    "kg",
    "15÷100×600=90 kg.",
    "Multiply the fraction of the total by the feed mass.",
  ),
  n(
    "r-scale",
    "Read bar-chart intervals",
    "A percentage axis goes from 0% to 40% in eight equal major intervals. How much is each interval?",
    "5",
    "percentage points",
    "40÷8=5 percentage points per interval.",
    "Count spaces rather than tick marks.",
  ),
];
const guided: Task[] = [
  n(
    "g-inventory",
    "Inspect the sample",
    "Count the model’s hydrocarbon molecules.",
    "6",
    "molecules",
    "The selected carbon-and-hydrogen-only rows contain 2+3+1=6 molecules. The oxygen-containing compound is excluded.",
    "Select by elements first, then add the molecule counts.",
    model(
      "inventory",
      "Classify the supplied components and distinguish molecules from compounds.",
    ),
  ),
  c(
    "g-column",
    "Build the column",
    "Which initial group belongs at the lowest of the three labelled collection positions?",
    "Group A",
    {
      "Group B": "Its supplied boiling range is intermediate.",
      "Group C": "Its very low boiling range puts it at the top outlet.",
    },
    "A has the highest supplied boiling range,240–290 °C. Higher-boiling groups collect lower in a cooler-upwards column.",
    "Use the supplied boiling ranges, not alphabetical order.",
    model(
      "column",
      "Construct the temperature order and place the supplied groups.",
    ),
  ),
  n(
    "g-trace",
    "Follow one component",
    "In the initial threshold model, which numbered tray first collects the component? Trays are numbered bottom upwards.",
    "4",
    "tray",
    "C₈H₁₈ has supplied boiling point 126 °C. Trays 320, 240, 160 are warmer; tray 4 at 100 °C is the first cooler tray.",
    "Compare each tray from bottom upwards.",
    model("trace", "Follow a supplied molecule without changing its formula."),
  ),
  n(
    "g-trends",
    "Construct the size order",
    "What is the carbon-count difference between the largest and smallest initial example molecules?",
    "16",
    "carbon atoms",
    "20−4=16. Boiling point and viscosity generally increase with comparable molecular size; ease of ignition decreases.",
    "Construct the order before comparing its ends.",
    model(
      "trends",
      "Arrange the given sizes and predict all three property trends.",
    ),
  ),
  c(
    "g-uses",
    "Match useful fractions",
    "In the initial supplied target use, petroleum gas is…",
    "Burned as fuel for cooking",
    {
      "Applied directly as a road surface": "That is a stated bitumen use.",
      "Guaranteed to be one pure compound":
        "A fraction can contain several hydrocarbons.",
    },
    "The supplied use burns petroleum gas for energy. A fraction's purpose depends on what is done with it.",
    "Read the target use and match all six fraction names.",
    model(
      "uses",
      "Match named fractions to uses and justify the stated target purpose.",
    ),
  ),
  n(
    "g-yield",
    "Construct the yield evidence",
    "How much kerosene is obtained from source A's 1000 kg feed at 18% by mass?",
    "180",
    "kg",
    "18÷100×1000=180 kg. Source B gives 70 kg from an equal feed; the stated mass-yield criterion favours A.",
    "Plot the original percentages, then calculate kilograms separately.",
    model(
      "yield",
      "Plot both original percentages and compare sources under the stated criterion.",
    ),
  ),
];
const practice: Task[] = [
  c(
    "p-origin",
    "Where crude oil comes from",
    "Which description matches the origin of crude oil in the AQA specification?",
    "Ancient biomass, mainly plankton, buried in mud",
    {
      "Only recently manufactured plastics":
        "The specification describes ancient biomass.",
      "A renewable supply formed instantly":
        "Crude oil is finite and forms over geological timescales.",
    },
    "Crude oil is a finite resource found in rocks, formed from ancient biomass consisting mainly of plankton buried in mud.",
    "Recall ancient biomass and geological formation.",
  ),
  c(
    "p-only",
    "Hydrocarbon impurities",
    "A compound has carbon, hydrogen and sulfur. Is it a hydrocarbon?",
    "No: it contains another element",
    {
      "Yes: some carbon and hydrogen is enough":
        "Only carbon and hydrogen are permitted by the definition.",
      "No: hydrocarbons contain no hydrogen":
        "Hydrocarbons contain hydrogen and carbon.",
    },
    "Hydrocarbon is an element-content definition; sulfur excludes this compound.",
    "Apply the word ONLY.",
  ),
  n(
    "p-count",
    "Copies and compounds",
    "A supplied sample has four C₆H₁₄, two C₇H₁₆ and three C₈H₁₈ molecules. How many distinct compounds?",
    "3",
    "compounds",
    "There are three distinct formulas, despite nine molecules in total.",
    "Count different formulas, not copies.",
  ),
  n(
    "p-hc-number",
    "Exclude an oxygen-containing row",
    "A sample has three C₅H₁₂, four C₈H₁₈ and two C₂H₆O molecules. How many hydrocarbon molecules?",
    "7",
    "molecules",
    "3+4=7; C₂H₆O contains oxygen and is not a hydrocarbon.",
    "Select by element content before adding counts.",
  ),
  c(
    "p-fraction",
    "Purity of a fraction",
    "A fraction contains three different hydrocarbons with similar boiling ranges. What is it?",
    "A mixture",
    {
      "One pure hydrocarbon": "There are three different compounds.",
      "A new element": "No element is made by separation.",
    },
    "A fraction usually groups hydrocarbons with similar boiling behaviour and molecular sizes; it need not be pure.",
    "Different compounds remain different compounds.",
  ),
  w(
    "p-mixture-written",
    "Correct the one-molecule claim",
    "A student says crude oil is one enormous molecule and distillation breaks it into smaller pure molecules. Correct both claims.",
    "Crude oil is a mixture of many compounds, mostly hydrocarbons. Fractional distillation physically separates groups by boiling behaviour, using vaporisation and condensation. It preserves molecular identities and does not require breaking covalent bonds. A collected fraction can still be a mixture.",
    [
      "Mixture of many compounds, mostly hydrocarbons.",
      "Physical separation by boiling behaviour and changes of state.",
      "Molecules retained; cracking is a different chemical process.",
      "Fractions need not be pure.",
    ],
    "Separate mixture, molecule and fraction meanings.",
  ),
  n(
    "p-gradient",
    "Changed temperatures",
    "A column bottom is 390 °C and its top 30 °C. What is the temperature difference?",
    "360",
    "°C",
    "390−30=360 °C; the top is cooler.",
    "Subtract top from bottom.",
  ),
  c(
    "p-position",
    "New relative boiling ranges",
    "Groups K,L,M have ranges 60–110, 220–280 and below 20 °C respectively. Which top-to-bottom order is appropriate?",
    "M, K, L",
    {
      "L, K, M": "That places the highest-boiling group at the coolest top.",
      "K, L, M": "The very low-boiling group belongs at the top outlet.",
    },
    "Lower-boiling material reaches higher levels in a cooler-upwards column. The supplied groups order M,K,L.",
    "Order the supplied boiling ranges rather than letters.",
  ),
  c(
    "p-gradient-repair",
    "Repair a wrong column",
    "A model is hotter at the top than at the bottom. What change makes its temperature pattern appropriate?",
    "Make the column cooler upwards",
    {
      "Keep it hotter upwards": "That reverses the useful gradient.",
      "Make molecular formulas shorter by cooling":
        "Cooling does not crack molecules.",
    },
    "A conventional fractionating column is hotter low down and cooler higher up.",
    "Higher-boiling material collects lower.",
  ),
  w(
    "p-method-written",
    "Explain fractional distillation",
    "Explain how a heated crude mixture gives groups with different boiling ranges at different collection heights.",
    "Heating vaporises suitable components. Vapours enter a column that is hotter at the bottom and cooler upwards. Components with different boiling behaviour condense at different levels, so higher-boiling material collects lower and lower-boiling material higher. Very low-boiling material can leave as gas and material not vaporised can remain as residue. The separation is physical.",
    [
      "Heating/vaporisation of suitable components.",
      "Temperature gradient: cooler upwards.",
      "Different boiling behaviour causes different condensation levels.",
      "Physical separation; appropriate top gas/residue exceptions.",
    ],
    "Link heating, gradient, boiling behaviour and collection.",
  ),
  n(
    "p-tray",
    "Changed component threshold",
    "A vaporised component boils at 190 °C. Trays 1–4 bottom upwards are 300, 230, 170, 80 °C. In the stated first-cooler-tray model, which tray collects it?",
    "3",
    "tray",
    "300 and 230 are above 190;170 °C at tray 3 is the first cooler temperature.",
    "Inspect trays in the specified bottom-up order.",
  ),
  c(
    "p-residue",
    "A high-boiling remainder",
    "The feed is 350 °C; a component's supplied boiling point is 430 °C. What does the threshold model retain?",
    "Liquid residue",
    {
      "Top gas": "The feed has not reached the supplied boiling point.",
      "A different formula": "The model performs no cracking.",
    },
    "Not every component vaporises in the specified simplified model.",
    "Compare feed and boiling temperatures first.",
  ),
  c(
    "p-gas",
    "Top outlet without condensation",
    "A gas component has supplied boiling point −25 °C. The top tray is 20 °C. What conclusion is supported?",
    "It can leave the top as gas",
    {
      "It must condense on the top tray": "20 °C is above −25 °C.",
      "Its carbon atoms are removed": "No molecular breaking is specified.",
    },
    "A low-boiling component can remain gas through the column.",
    "No supplied tray is colder than the boiling point.",
  ),
  c(
    "p-identity",
    "Distillation versus cracking",
    "A component enters as C₁₀H₂₂ and is collected by physical distillation. Which formula should its molecules retain?",
    "C₁₀H₂₂",
    {
      "C₅H₁₂ only": "Making smaller molecules would be a chemical process.",
      "CO₂ only": "No combustion is specified.",
    },
    "Physical changes of state preserve the molecular formula.",
    "Distillation separates; cracking changes molecules.",
  ),
  w(
    "p-exceptions-written",
    "Avoid an absolute claim",
    "Why is 'every hydrocarbon vaporises and then condenses inside the column' too absolute for the supplied threshold examples?",
    "The highest-boiling example may not vaporise at the feed temperature and can remain as liquid residue. A very low-boiling component may remain above its boiling point even at the top and leave as gas. Components that condense do so at suitable cooler levels. The supplied model is simplified and does not uniquely describe every industrial mixture.",
    [
      "Feed below a supplied boiling point can leave residue.",
      "Coolest tray above a supplied boiling point permits top gas.",
      "Condensation applies to suitable components/temperatures.",
      "Model limitations acknowledged.",
    ],
    "Use both boundary cases rather than asserting all components behave alike.",
  ),
  n(
    "p-size",
    "Use molecular-size data",
    "Comparable examples have 8 and 21 carbon atoms. What is the difference in carbon count?",
    "13",
    "carbon atoms",
    "21−8=13; use that evidence to identify the larger molecule.",
    "Subtract the two supplied counts.",
  ),
  c(
    "p-viscosity",
    "Predict viscosity from size",
    "Fraction X contains generally larger hydrocarbons than Y. Which supported comparison is appropriate?",
    "X is generally more viscous",
    {
      "X always flows more easily": "That reverses the usual viscosity trend.",
      "X has carbon atoms of a larger atomic number":
        "Each carbon atom remains carbon.",
    },
    "Larger comparable hydrocarbons generally form more viscous liquids.",
    "More viscous means flows less readily.",
  ),
  c(
    "p-ignition",
    "Reverse the requested direction",
    "Moving from larger to smaller comparable hydrocarbon molecules, ease of ignition generally…",
    "Increases",
    {
      Decreases: "That is the increasing-size direction.",
      "Becomes zero": "Smaller hydrocarbons can readily ignite.",
    },
    "The decreasing-size direction reverses the usual flammability trend.",
    "Read the direction before applying the trend.",
  ),
  c(
    "p-boiling",
    "Explain a boiling-point trend",
    "Why do larger comparable hydrocarbon molecules generally have higher boiling points?",
    "More energy is needed to overcome intermolecular attractions",
    {
      "Their carbon atoms change element":
        "The atom identities remain unchanged.",
      "Boiling breaks every carbon–carbon bond":
        "Boiling separates molecules; it does not normally break their covalent bonds.",
    },
    "The trend concerns attractions between molecules and the energy required to separate them.",
    "Distinguish between-molecule attractions from within-molecule bonds.",
  ),
  w(
    "p-trends-written",
    "Use supplied range evidence",
    "A supplied table gives X molecules 11–15 carbon atoms and Y molecules 22–35. Compare their viscosity, boiling behaviour and ease of ignition, explaining the size evidence.",
    "Y contains generally larger molecules. Comparable larger hydrocarbons generally have higher boiling points and viscosity and are less easy to ignite than smaller hydrocarbons. Boiling separates molecules by overcoming intermolecular attractions, rather than breaking their covalent carbon–carbon bonds. These are general trends for the comparison, not exact universal cut boundaries.",
    [
      "Uses the supplied carbon-count evidence.",
      "Higher boiling point and viscosity for larger molecules.",
      "Lower ease of ignition for larger molecules.",
      "Intermolecular versus covalent distinction and general-trend limitation.",
    ],
    "Link each trend to the same size direction.",
  ),
  c(
    "p-kerosene",
    "Named fraction use",
    "Which supplied fraction-use pair is appropriate?",
    "Kerosene — aircraft fuel",
    {
      "Bitumen — domestic cooking gas": "Bitumen is used on roads/roofs.",
      "Petroleum gases — road surfacing":
        "Petroleum gases can be domestic heating/cooking fuels.",
    },
    "Kerosene is an aircraft-fuel fraction; the listed uses are examples rather than a purity claim.",
    "Recall the named fraction's stated application.",
  ),
  c(
    "p-diesel",
    "Keep two car fuels distinct",
    "Which description of petrol and diesel oil is appropriate?",
    "Both can fuel cars with suitable different engines",
    {
      "Only petrol can ever fuel a car":
        "Diesel engines in some cars use diesel oil.",
      "The fractions are always the same pure molecule":
        "They are different useful mixtures.",
    },
    "Pearson lists petrol for cars and diesel oil for some cars and trains; engine suitability matters.",
    "Do not make 'car fuel' exclusive to one fraction.",
  ),
  c(
    "p-bitumen",
    "Direct material use",
    "Bitumen is applied to a road surface rather than burned. Which purpose is stated?",
    "Direct material use",
    {
      "Fuel burned for energy": "The described use does not burn it.",
      "Necessarily chemical feedstock for detergents":
        "That is not the stated processing route.",
    },
    "A fraction used directly as a material has a different purpose from fuel or feedstock for making chemicals.",
    "Describe what is done in this example.",
  ),
  c(
    "p-feedstock",
    "Useful petrochemical products",
    "Which supplied pair is an appropriate example of petrochemical products?",
    "Detergents and polymers",
    {
      "Pure iron and sodium nuclei":
        "These are not the specified petrochemical examples.",
      "Only unprocessed crude oil":
        "Processing makes a range of useful products.",
    },
    "The specifications list useful products such as solvents, lubricants, polymers and detergents.",
    "Feedstock supplies chemical starting substances.",
  ),
  w(
    "p-purpose-written",
    "Use rather than name determines purpose",
    "The same hydrocarbon stream could be burned in one process or processed into chemical products in another. Explain fuel versus feedstock; distinguish bitumen applied directly to a roof.",
    "Burning the stream releases energy, so that stated use is fuel. Processing it as starting substances to make other chemical products uses it as feedstock. Bitumen applied directly to a roof is a material use; it is not automatically chemical feedstock merely because it was not burned. A fraction name alone does not determine all possible purposes.",
    [
      "Fuel: burned for energy.",
      "Feedstock: starting substances for producing other products.",
      "Direct bitumen material use distinguished.",
      "Purpose depends on supplied process.",
    ],
    "Classify the action performed rather than only the fraction name.",
  ),
  n(
    "p-percent",
    "Changed fraction-mass calculation",
    "A 900 kg feed gives 16% kerosene by mass. How much kerosene?",
    "144",
    "kg",
    "16÷100×900=144 kg.",
    "Apply the percentage to this feed mass.",
  ),
  n(
    "p-bar-scale",
    "Construct a percentage scale",
    "An axis from 0% to 60% has six equal major intervals. How much is one interval?",
    "10",
    "percentage points",
    "60÷6=10 percentage points per major interval.",
    "Divide the displayed range by its number of intervals.",
  ),
  n(
    "p-mass-difference",
    "Compare equal feeds",
    "Two 800 kg feeds give 20% and 15% of the desired fraction. How much more does the first give?",
    "40",
    "kg",
    "160−120=40 kg. The five-percentage-point difference applies to 800 kg.",
    "Calculate both masses or apply their percentage-point difference.",
  ),
  c(
    "p-unequal",
    "Do not compare percentages alone",
    "Source A gives 20% from 400 kg; B gives 12% from 1000 kg. Which gives more kilograms of the desired fraction?",
    "B",
    { A: "A gives 80 kg; B gives 120 kg.", Equal: "80 and 120 kg differ." },
    "Percentage yield alone does not determine absolute yield when total feed masses differ.",
    "Calculate percentage × feed mass ÷100 for both.",
  ),
  n(
    "p-equal",
    "Different percentages, equal mass",
    "A gives 18% from 500 kg. B gives 12% from 750 kg. How many kilograms does each give?",
    "90",
    "kg",
    ".18×500=.12×750=90 kg.",
    "Check both absolute yields before deciding equality.",
  ),
  w(
    "p-data-written",
    "Make a conditional source judgement",
    "Two matched 1000 kg feeds give 24% and 9% kerosene. Kerosene is stated to be in higher demand. Explain the supported source comparison and what this does not establish.",
    "The first source gives 240 kg kerosene while the second gives 90 kg, so under the stated desired-kerosene yield criterion the first is preferable. Equal feed masses make the percentage comparison directly comparable. This is not a full profit or environmental judgement: prices, processing costs, other fractions and impacts are not supplied.",
    [
      "Uses 24% versus 9% and/or 240 versus 90 kg.",
      "Matches total feed masses.",
      "Conclusion conditional on desired-kerosene criterion.",
      "No unsupported full economic/environmental ranking.",
    ],
    "State the criterion and the data supporting it.",
  ),
];
const draw = (
  id: string,
  title: string,
  prompt: string,
  data: OilBarDrawingData,
): Task => ({
  ...w(
    id,
    title,
    prompt,
    `Construct an axis from 0 to ${data.max}% with ${data.intervals} equal intervals, so each major interval is ${data.max / data.intervals} percentage points. Plot source A at ${data.percentages[0]}% and B at ${data.percentages[1]}%, keeping categories separate and using the supplied original values. Label percentage and source. This construction is self-reviewed, without examiner marks.`,
    [
      "Review the zero baseline, stated maximum and equal scale intervals.",
      "Compare each separately placed bar against its original percentage.",
      "Keep source categories and percentage units explicit; do not substitute kilograms.",
    ],
    "Read the original observations and construct the scale before placing bars.",
  ),
  oilBarDrawing: data,
});
refresher.push(
  c(
    "r-origin",
    "Retrieve the formation and resource limits",
    "Which pair correctly describes crude oil?",
    "Ancient biomass; finite resource",
    {
      "Newly formed daily; unlimited":
        "Its geological formation does not replenish it at the rate of use.",
      "One manufactured pure compound; renewable":
        "Crude oil is a mixture and finite.",
    },
    "The AQA specification describes ancient biomass, mainly plankton buried in mud; crude oil is finite.",
    "Link origin and replenishment timescale.",
  ),
  n(
    "r-hc-sum",
    "Sum selected molecule counts",
    "A supplied sample has two C₄H₁₀, three C₆H₁₄ and four C₂H₆O molecules. How many hydrocarbon molecules?",
    "5",
    "molecules",
    "Only the first two formulas contain carbon and hydrogen only:2+3=5.",
    "Exclude oxygen-containing molecules before adding.",
  ),
  c(
    "r-column",
    "Place relative collection groups",
    "Supplied groups A,B,C boil at below 10, 80–130 and 230–290 °C. Which top-to-bottom order is appropriate?",
    "A, B, C",
    {
      "C, B, A":
        "Higher-boiling material belongs lower in the cooler-upwards column.",
      "B, A, C": "The lowest-boiling group belongs at the top outlet.",
    },
    "Relative boiling behaviour determines collection order in the temperature gradient.",
    "Order the ranges from lower to higher boiling behaviour.",
  ),
  n(
    "r-trace",
    "Find the first cooler tray",
    "A vaporised component has supplied boiling point 135 °C. Bottom-up trays are 250, 180, 120, 40 °C. Which numbered tray is first cooler?",
    "3",
    "tray",
    "The first two trays exceed 135; tray 3 at 120 °C is cooler.",
    "Start at the bottom and stop at the first cooler tray.",
  ),
  n(
    "r-size",
    "Calculate the size span",
    "The smallest supplied hydrocarbon has 5 carbon atoms and the largest 14. What is the difference?",
    "9",
    "carbon atoms",
    "14−5=9 carbon atoms.",
    "Subtract the supplied counts.",
  ),
  c(
    "r-attractions",
    "Between molecules, not within",
    "What is overcome when hydrocarbon molecules boil without reacting?",
    "Intermolecular attractions",
    {
      "All carbon–carbon covalent bonds":
        "Breaking these would change molecules.",
      "Every atomic nucleus": "Boiling is not a nuclear process.",
    },
    "Molecules separate while their identities are retained.",
    "Distinguish interactions between molecules from bonds within them.",
  ),
  c(
    "r-cars",
    "Retrieve the engine condition",
    "Which pair is appropriate?",
    "Petrol for suitable petrol engines; diesel oil for suitable diesel engines",
    {
      "Petrol is the only possible car fuel": "Some cars have diesel engines.",
      "The two fractions are always identical":
        "They are different useful mixtures.",
    },
    "Engine suitability matters; both fraction names have legitimate stated vehicle uses.",
    "Read the engine rather than treating 'cars' as exclusive.",
  ),
  c(
    "r-material",
    "Direct material use is a separate purpose",
    "Bitumen is placed on a roof without burning or converting it into another product. What is the stated purpose?",
    "Direct material use",
    {
      Fuel: "The described process does not burn it for energy.",
      "Necessarily chemical feedstock":
        "No chemical-production route is stated.",
    },
    "Fuel, direct material use and chemical feedstock describe different processes.",
    "Classify the stated action.",
  ),
  c(
    "r-yield",
    "Compare unequal feed masses",
    "A gives 10% from 400 kg; B gives 8% from 1000 kg. Which supplies more kilograms of the desired fraction?",
    "B",
    {
      A: "A gives 40 kg; B gives 80 kg.",
      Equal: "40 and 80 kg are different.",
    },
    "The smaller percentage can give more kilograms when applied to a larger feed.",
    "Calculate absolute yields before comparing them.",
  ),
  draw(
    "r-bars",
    "Rebuild a bar construction",
    "Construct the supplied percentage bars on an axis 0–30% with six equal major intervals.",
    {
      fraction: "Kerosene",
      percentages: [12, 23],
      max: 30,
      intervals: 6,
      note: "Recovery data, percentage by mass. Construct each original value; no automatic marking.",
    },
  ),
);
practice.push(
  draw(
    "p-bars",
    "Construct a new percentage chart",
    "Construct separate source bars for the original petrol percentages. Use an axis 0–50% with five equal major intervals.",
    {
      fraction: "Petrol",
      percentages: [27, 39],
      max: 50,
      intervals: 5,
      note: "Original supplied percentage-by-mass observations. No correctness feedback until self-review.",
    },
  ),
);
const checkForms: Task[][] = [
  [
    n(
      "a-inventory",
      "Reserved distinct-compound count",
      "A supplied sample contains five C₆H₁₄, two C₈H₁₈ and three C₆H₆O molecules. How many distinct compounds are present?",
      "3",
      "compounds",
      "The three distinct formulas represent three compounds; counts of molecules do not change that.",
      "Distinguish copies from different compounds.",
    ),
    w(
      "a-column",
      "Reserved separation explanation",
      "Explain how a heated crude mixture produces a lower collection with supplied range 260–320 °C and a higher collection with 80–140 °C. Include changes of state and molecular identity.",
      "Heating vaporises suitable components. A column is hotter at the bottom and cooler upwards. Different boiling behaviour causes condensation at different levels, so the higher-boiling group collects lower and the lower-boiling group higher. This is physical separation: molecular identities are retained; fractions need not be pure.",
      [
        "Suitable components vaporise when heated.",
        "Column is cooler upwards.",
        "Different boiling behaviour explains the stated relative heights.",
        "Physical separation and retained molecules.",
      ],
      "Connect the supplied ranges to gradient and condensation.",
    ),
    n(
      "a-trace",
      "Reserved changed-threshold trace",
      "A vaporised component has supplied boiling point 156 °C. Bottom-up trays are 300, 210, 180, 130, 60 °C. Which numbered tray is first cooler?",
      "4",
      "tray",
      "130 °C at tray 4 is the first temperature below 156 °C.",
      "Inspect the given profile bottom upwards.",
    ),
    c(
      "a-trends",
      "Reserved size comparison",
      "Comparable molecules X and Y contain 6 and 17 carbon atoms respectively. Which statement is supported?",
      "Y generally has higher boiling point and viscosity and lower ease of ignition",
      {
        "Y generally has lower boiling point and viscosity":
          "That reverses the increasing-size trends.",
        "Y's carbon atoms have become a different element":
          "Only the molecular size differs.",
      },
      "The supplied carbon counts identify Y as larger; use all three trends consistently.",
      "Use molecular rather than atomic size.",
    ),
    c(
      "a-uses",
      "Reserved named-material use",
      "Which pair matches a named fraction and an appropriate direct use?",
      "Bitumen — roads and roofs",
      {
        "Kerosene — domestic cooking gas":
          "That is a listed petroleum-gas use.",
        "Petroleum gases — road surfacing":
          "Bitumen is the appropriate listed material.",
      },
      "Pearson explicitly lists bitumen for roads and roofs.",
      "Match the stated application.",
    ),
    n(
      "a-yield",
      "Reserved changed feed mass",
      "A 650 kg feed gives 18% of its mass as kerosene. How much kerosene is obtained?",
      "117",
      "kg",
      ".18×650=117 kg.",
      "Apply the percentage to the given total mass.",
    ),
    draw(
      "a-bars",
      "Reserved percentage construction",
      "Construct both original heavy-fuel-oil percentage bars. Use an axis 0–60% with six equal major intervals.",
      {
        fraction: "Heavy fuel oil",
        percentages: [34, 47],
        max: 60,
        intervals: 6,
        note: "Reserved supplied original observations, percentages by mass. Feedback is deferred until whole-set submission.",
      },
    ),
  ],
  [
    c(
      "b-inventory",
      "Reserved element-content definition",
      "A compound's molecules contain carbon, hydrogen and nitrogen. Which classification is correct?",
      "Not a hydrocarbon: another element is present",
      {
        "A hydrocarbon because carbon and hydrogen occur":
          "The definition requires ONLY carbon and hydrogen.",
        "A mixture merely because it has three elements":
          "A compound can contain multiple chemically combined elements.",
      },
      "The element criterion excludes nitrogen-containing compounds; that alone does not make a substance a mixture.",
      "Separate element content from sample purity.",
    ),
    c(
      "b-column",
      "Reserved new collection order",
      "Groups R,S,T have supplied boiling ranges 200–270,below 15 and 70–120 °C. Which top-to-bottom collection order is appropriate?",
      "S, T, R",
      {
        "R, T, S": "That places higher-boiling material highest.",
        "T, S, R": "The lowest-boiling group belongs at the top outlet.",
      },
      "The ranges increase S,T,R; the conventional column is cooler upwards.",
      "Use the new givens rather than remembering letters.",
    ),
    c(
      "b-trace",
      "Reserved top-gas boundary",
      "A vaporised component has supplied boiling point −18 °C; every tray is at least 25 °C. Which conclusion follows in the threshold model?",
      "It can leave as top gas without condensing",
      {
        "It must collect as liquid at the top":
          "No supplied tray is cooler than −18 °C.",
        "It must become carbon dioxide":
          "No combustion or chemical reaction is specified.",
      },
      "No cooler tray is available for this supplied component.",
      "Compare even the coolest tray with the boiling point.",
    ),
    n(
      "b-trends",
      "Reserved size span",
      "The largest example has 22 carbon atoms and the smallest 7. What is the carbon-count difference?",
      "15",
      "carbon atoms",
      "22−7=15 carbon atoms.",
      "Use the supplied counts.",
    ),
    w(
      "b-uses",
      "Reserved purpose explanation",
      "A fraction is processed to produce polymer starting substances. Explain why that purpose is chemical feedstock rather than fuel, and name a distinct direct-material use of another fraction.",
      "The supplied stream is a chemical starting material used to make other products, so its stated purpose is feedstock. Fuel would mean burning it for energy. Bitumen applied to roads or roofs is a direct material use, distinct from both burning and the stated chemical-production route.",
      [
        "Starting substances for making products: feedstock.",
        "Fuel requires the stated burning-for-energy use.",
        "Bitumen roads/roofs gives a separate material use.",
      ],
      "Classify what happens to each stream.",
    ),
    c(
      "b-yield",
      "Reserved unequal-source comparison",
      "A gives 15% of 600 kg; B gives 10% of 1000 kg. Under a desired-fraction mass criterion, which is preferable?",
      "B: 100 kg rather than 90 kg",
      {
        "A: its percentage is larger":
          "A's absolute fraction mass is 90 kg; B's is 100 kg.",
        "Equal: both percentages are below 20":
          "That is not a mass calculation.",
      },
      "Feed masses differ, so compare 90 and 100 kg rather than percentages alone.",
      "Calculate the desired fraction's mass for each source.",
    ),
    draw(
      "b-bars",
      "Reserved changed chart scale",
      "Construct both original diesel-oil bars on an axis 0–40% with eight equal major intervals.",
      {
        fraction: "Diesel oil",
        percentages: [19, 28],
        max: 40,
        intervals: 8,
        note: "Second reserved form with new data and scale. Percentage by mass; no model checks or hints in this construction.",
      },
    ),
  ],
];
const reviewForms: Task[][] = [
  [
    n(
      "ra-inventory",
      "Delayed compounds versus copies",
      "A sample has three C₇H₁₆ and five C₉H₂₀ molecules. How many distinct compounds?",
      "2",
      "compounds",
      "The two different formulas represent two compounds.",
      "Count distinct formulas.",
    ),
    w(
      "ra-trace",
      "Delayed boundary explanation",
      "In supplied threshold examples, one component boils above the feed temperature and another below every tray temperature. Explain their different possible paths without changing either formula.",
      "The first can remain as liquid residue because it is not vaporised in the supplied model. The second can leave as gas at the top because no tray is cool enough to condense it. Physical separation preserves molecular identity; neither case implies cracking.",
      [
        "High-boiling component/feed comparison supports residue.",
        "Very low-boiling component/tray comparison supports top gas.",
        "Formulas retained; no automatic cracking.",
      ],
      "Compare feed first, then trays.",
    ),
    n(
      "ra-yield",
      "Delayed percentage mass",
      "A 900 kg feed gives 7% of its mass as the desired fraction. What mass is obtained?",
      "63",
      "kg",
      ".07×900=63 kg.",
      "Apply the percentage to this feed.",
    ),
  ],
  [
    c(
      "rb-column",
      "Delayed changed range order",
      "Supplied groups A,B,C boil at 150–200, 280–340 and below 30 °C. Which top-to-bottom order is appropriate?",
      "C, A, B",
      {
        "B, A, C": "Higher-boiling material collects lower.",
        "A, B, C": "The lowest-boiling group belongs at the top outlet.",
      },
      "The supplied ranges increase C,A,B in a cooler-upwards column.",
      "Order the given boiling ranges.",
    ),
    w(
      "rb-trends",
      "Delayed size and bonding explanation",
      "Compare similar hydrocarbons with 8 and 18 carbon atoms: boiling point, viscosity and ease of ignition. Explain what is overcome on boiling without changing a molecule.",
      "The 18-carbon example is generally larger, with higher boiling point and viscosity and lower ease of ignition. Boiling requires overcoming intermolecular attractions to separate molecules, not breaking their carbon–carbon covalent bonds. These are general comparable-hydrocarbon trends.",
      [
        "Supplied size evidence used.",
        "All three trends consistent.",
        "Intermolecular separation distinguished from covalent-bond breaking.",
      ],
      "Keep molecular size and atom identity separate.",
    ),
    c(
      "rb-uses",
      "Delayed named use",
      "Which named fraction has a listed use as aircraft fuel?",
      "Kerosene",
      {
        Bitumen: "Bitumen is a roads/roofs material.",
        "Petroleum gases": "A listed use is domestic heating/cooking.",
      },
      "Kerosene is the listed aircraft-fuel fraction.",
      "Recall the named use.",
    ),
  ],
];
refresher.push(
  c(
    "r-fuel-names",
    "Retrieve both end-of-range fuel uses",
    "Which pair of named uses is appropriate?",
    "Petroleum gases — domestic heating/cooking; fuel oil — large ships/some power stations",
    {
      "Petroleum gases — road surfacing; fuel oil — domestic cooking gas":
        "These swap the stated uses with inappropriate fractions.",
      "Both are always unburnable because they are mixtures":
        "Fractions can be mixtures and useful fuels.",
    },
    "Pearson lists these distinct applications. The examples do not imply exclusive possible uses or pure compounds.",
    "Match each fraction to a suitable stated application.",
  ),
);
practice.push(
  c(
    "p-petroleum-gas",
    "Practice the gas-fraction use",
    "A supplied fuel is burned for domestic heating and cooking. Which listed fraction has this use?",
    "Petroleum gases",
    {
      Bitumen: "Bitumen has listed roads/roofs uses.",
      "Kerosene only":
        "The listed gas-fraction domestic use is petroleum gases.",
    },
    "Petroleum gases are a listed domestic heating/cooking fuel; the fraction can contain several hydrocarbons.",
    "Recall the gas-fraction's named use.",
  ),
  c(
    "p-fuel-oil",
    "Practice the heavy-fuel use",
    "Which named fraction has listed uses in large ships and some power stations?",
    "Fuel oil",
    {
      Bitumen: "The listed bitumen use is roads/roofs.",
      "Only petrol":
        "Petrol is listed for suitable car engines; the stated larger installations use fuel oil.",
    },
    "Fuel oil can be burned in suitable large ships and some power stations. A high boiling range does not mean it cannot burn.",
    "Match the stated installation to the named fraction.",
  ),
);
checkForms[0].splice(
  6,
  0,
  c(
    "a-gas-use",
    "Reserved gas-fraction use",
    "Which supplied pair is an appropriate named-fraction application?",
    "Petroleum gases — domestic heating and cooking",
    {
      "Petroleum gases — road surfacing":
        "That is a listed bitumen application.",
      "Petroleum gases — guaranteed pure kerosene":
        "These are distinct fraction names; a fraction need not be pure.",
    },
    "The gas fraction has listed domestic fuel uses.",
    "Recall the named application.",
  ),
);
checkForms[1].splice(
  6,
  0,
  c(
    "b-fuel-use",
    "Reserved heavy-fuel use",
    "Which listed fraction-use pairing is appropriate?",
    "Fuel oil — large ships and some power stations",
    {
      "Bitumen — domestic cooking gas":
        "Bitumen has a roads/roofs application.",
      "Kerosene — only road surfacing": "Kerosene is a listed aircraft fuel.",
    },
    "Fuel oil has the stated suitable large-installation fuel uses.",
    "Match the named fraction and stated use.",
  ),
);
const recovery: Record<string, string> = {
  "p-petroleum-gas": "r-fuel-names",
  "p-fuel-oil": "r-fuel-names",
  "p-origin": "r-origin",
  "p-only": "r-hydrocarbon",
  "p-count": "r-compounds",
  "p-hc-number": "r-hc-sum",
  "p-fraction": "r-fraction",
  "p-mixture-written": "r-physical",
  "p-gradient": "r-gradient",
  "p-position": "r-column",
  "p-gradient-repair": "r-column",
  "p-method-written": "r-column",
  "p-tray": "r-trace",
  "p-residue": "r-residue",
  "p-gas": "r-gas",
  "p-identity": "r-physical",
  "p-exceptions-written": "r-residue",
  "p-size": "r-size",
  "p-viscosity": "r-viscosity",
  "p-ignition": "r-trend",
  "p-boiling": "r-attractions",
  "p-trends-written": "r-attractions",
  "p-kerosene": "r-uses",
  "p-diesel": "r-cars",
  "p-bitumen": "r-material",
  "p-feedstock": "r-purpose",
  "p-purpose-written": "r-purpose",
  "p-percent": "r-percentage",
  "p-bar-scale": "r-scale",
  "p-mass-difference": "r-percentage",
  "p-unequal": "r-yield",
  "p-equal": "r-yield",
  "p-data-written": "r-yield",
  "p-bars": "r-bars",
};
for (const task of practice)
  task.followUp = "oil-v1-" + recovery[task.id.slice(7)];
const families: Record<string, string[]> = {
  inventory: [
    "w-mixture",
    "r-hydrocarbon",
    "r-compounds",
    "r-fraction",
    "r-origin",
    "r-hc-sum",
    "g-inventory",
    "p-origin",
    "p-only",
    "p-count",
    "p-hc-number",
    "p-fraction",
    "p-mixture-written",
    "a-inventory",
    "b-inventory",
    "ra-inventory",
  ],
  column: [
    "w-temperature",
    "r-gradient",
    "r-column",
    "r-physical",
    "g-column",
    "p-gradient",
    "p-position",
    "p-gradient-repair",
    "p-method-written",
    "p-mixture-written",
    "p-identity",
    "a-column",
    "b-column",
    "rb-column",
  ],
  trace: [
    "r-condense",
    "r-physical",
    "r-residue",
    "r-gas",
    "r-trace",
    "g-trace",
    "p-tray",
    "p-residue",
    "p-gas",
    "p-identity",
    "p-exceptions-written",
    "a-trace",
    "b-trace",
    "ra-trace",
  ],
  trends: [
    "r-trend",
    "r-viscosity",
    "r-size",
    "r-attractions",
    "g-trends",
    "p-size",
    "p-viscosity",
    "p-ignition",
    "p-boiling",
    "p-trends-written",
    "a-trends",
    "b-trends",
    "rb-trends",
  ],
  uses: [
    "r-fuel-names",
    "p-petroleum-gas",
    "p-fuel-oil",
    "a-gas-use",
    "b-fuel-use",
    "r-uses",
    "r-purpose",
    "r-cars",
    "r-material",
    "g-uses",
    "p-kerosene",
    "p-diesel",
    "p-bitumen",
    "p-feedstock",
    "p-purpose-written",
    "a-uses",
    "b-uses",
    "rb-uses",
  ],
  yield: [
    "r-percentage",
    "r-scale",
    "r-yield",
    "r-bars",
    "g-yield",
    "p-percent",
    "p-bar-scale",
    "p-mass-difference",
    "p-unequal",
    "p-equal",
    "p-data-written",
    "p-bars",
    "a-yield",
    "b-yield",
    "a-bars",
    "b-bars",
    "ra-yield",
  ],
};
const all = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
for (const ids of Object.values(families)) {
  const aliases = ids.map((x) => "oil-v1-" + x);
  for (const task of all)
    if (aliases.includes(task.id))
      task.exposureAliases = [
        ...new Set([
          ...(task.exposureAliases ?? []),
          ...aliases.filter((x) => x !== task.id),
        ]),
      ];
}
export const crudeOilJourney: LessonJourney = {
  version: 1,
  introduction:
    "Crude oil is a finite mixture, mostly hydrocarbons. Use supplied evidence to explain its physical separation and why different useful fractions behave differently.",
  scopeNote:
    "Foundation/shared core. Actual AQA8462 4.7.1.1–3, Trilogy5.7.1.1–3, limited Pearson8.1–5, genuine2022F Q02.1–4 and fresh2022H Q04.1/2/5 with paired mark schemes reviewed. Pearson explicitly requires six fraction names/uses. All ranges and simple threshold traces are supplied examples, not universal refinery boundaries or an industrial simulation. Very high-boiling residue and low-boiling top gas are included; molecular identity is preserved. Original percentage chart constructions and written explanations are self-reviewed without automatic examiner marks. Fraction-mass calculations use supplied mass percentages and matched or unequal feed masses under stated criteria. Detailed alkanes/combustion and cracking follow in separate lessons. Full Pearson/OCR course audit, whole-course Maths parity and exam readiness remain unfinished.",
  outcomes: [
    "Distinguish a compound, hydrocarbon, mixture and collected fraction.",
    "Construct a cooler-upwards column and explain vaporisation/condensation using supplied boiling ranges.",
    "Trace suitable components, residue and top gas without changing molecular identity.",
    "Use molecular-size evidence for boiling point, viscosity and ease-of-ignition trends.",
    "Match named fractions to appropriate uses and distinguish fuel, material and feedstock purposes.",
    "Construct percentage bars and make conditional source-yield comparisons.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
};
export const oilRecovery = recovery;
export const oilExposureFamilies = families;
export { warmup, refresher, guided, practice, checkForms, reviewForms };
