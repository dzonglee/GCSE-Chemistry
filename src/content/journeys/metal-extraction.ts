import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
const c = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...choice(
    `me-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    title,
    model,
  ),
  title,
});
const n = (
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...number(
    `me-v1-${id}`,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    title,
    {},
    model,
  ),
  title,
});
const w = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  points: string[],
): LearningTask => ({
  id: `me-v1-${id}`,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: points[0],
  rubric: points,
  purpose: title,
});
const m = (
  mode: "route" | "source" | "oxygen" | "grade" | "decision",
  instruction: string,
): TaskModel => ({ kind: "metal-extraction", mode, instruction });
export const metalExtractionJourney: LessonJourney = {
  version: 1,
  introduction:
    "Choose a chemically suitable extraction route, then track what the ore can actually provide.",
  scopeNote:
    "Foundation/shared extraction decisions: AQA 4.4.1.3 and related electrolysis selection in 4.4.3.3; Pearson Combined 4.4–4.7. Native gold is chemically uncombined, not necessarily pure. Ores are mixtures containing useful metal compounds; crushing or concentration does not itself reduce an oxide. Carbon can reduce suitable metal oxides of metals below carbon. Above-carbon aluminium oxide is not reduced by carbon; electrolysis is the suitable supplied alternative. This is not a universal claim that every reactive metal can only be extracted by electrolysis. Carbon reacting with the desired metal can also make a route unsuitable. Carbon products follow the given equation and may be CO or CO2. Zinc carbonate preparation to zinc oxide is distinct from obtaining zinc metal. Ore-grade arithmetic distinguishes ore, oxide, contained maximum metal and actual recovered metal; formal percentage yield is not required Combined content here. Route comparisons use the same desired metal and required purity, complete supplied batch costs and actual recovered mass. Illustrative emissions are supplied data, not lifecycle certification or universally zero for electrolysis. Detailed molten aluminium/cryolite/carbon-anode teaching belongs to its own electrolysis lesson; Higher electron and biological extraction belong to separate lessons. Real 3D appears only for the supplied CuO/carbon reaction and preserves atomic constituents; kilogram mass bars are not particles or volume fractions. No practical reaction instructions. Written explanations are self-reviewed, never automatically correct or official exam marks.",
  outcomes: [
    "Distinguish native metals, compounds and ores.",
    "Choose and justify a supplied chemically suitable extraction route.",
    "Explain oxygen removal using the supplied products.",
    "Calculate oxide and maximum contained-metal masses separately.",
    "Compare actual-output costs and apply every stated constraint.",
  ],
  warmup: [
    c(
      "w-reduction",
      "Recall oxygen removal",
      "CuO loses oxygen and forms Cu metal. What is this change?",
      "Reduction",
      {
        Oxidation: "Oxidation is oxygen gain in this context.",
        "Physical crushing":
          "Crushing does not remove chemically combined oxygen.",
      },
      "The oxide loses oxygen: reduction.",
      "Track oxygen in the oxide.",
    ),
    n(
      "w-percent",
      "Find part of a mixture",
      "A 50 kg mixture contains 20% useful compound. What mass of useful compound is present?",
      10,
      "kg",
      "50 × 20/100 = 10 kg compound, not automatically 10 kg metal.",
      "Use the whole mixture as the percentage denominator.",
    ),
  ],
  refresher: [
    c(
      "r-route",
      "Use reactivity",
      "Given C > Fe, why can carbon reduce the supplied iron oxide under suitable conditions?",
      "Carbon is more reactive than iron",
      {
        "Carbon is less reactive than iron":
          "That reverses the supplied order.",
        "Carbon is always the cheapest":
          "Cost does not establish chemical suitability.",
      },
      "Carbon can remove oxygen from the oxide of this less reactive metal.",
      "Read the given reactivity order.",
    ),
    c(
      "r-native",
      "Interpret native",
      "What does native gold mean?",
      "Gold present as the uncombined element",
      {
        "Every sample is pure gold":
          "Sand or other impurities may still be mixed with gold.",
        "Gold oxide": "An oxide is a compound, not native metal.",
      },
      "Native describes chemical identity, not guaranteed purity.",
      "Separate chemically combined from physically mixed.",
    ),
    c(
      "r-product",
      "Use the given equation",
      "Given NiO + C → Ni + CO, what carbon product forms?",
      "CO",
      {
        CO2: "Do not replace the supplied product with a memorised one.",
        Ni: "Nickel is the metal product.",
      },
      "The supplied equation states carbon monoxide, CO.",
      "Read products rather than impose one carbon oxide.",
    ),
    n(
      "r-fraction",
      "Find metal share",
      "CuO relative mass is 80; Cu contributes 64. What percentage of pure CuO mass is copper?",
      80,
      "%",
      "64/80 × 100 = 80%. This is compound composition, not the ore's CuO percentage.",
      "Divide the metal contribution by the entire compound mass.",
    ),
    n(
      "r-unit",
      "Compare recovered mass",
      "A complete batch costs £90 and produces 30 kg recovered metal. What is cost per kilogram of recovered metal?",
      3,
      "£/kg",
      "90/30 = £3/kg. The denominator is actual recovered metal.",
      "Divide cost by recovered kilograms.",
    ),
  ],
  guided: [
    c(
      "g-route",
      "Choose the route",
      "Given C > Fe, choose a supplied route to obtain Fe from iron oxide.",
      "Carbon-based reduction",
      {
        "Crushing only": "Size reduction leaves iron chemically combined.",
        "Choose only by price": "First establish a chemically suitable route.",
      },
      "Carbon is more reactive than Fe and can remove oxygen from the supplied oxide under suitable conditions.",
      "Use carbon's position before comparing costs.",
      m(
        "route",
        "Predict a route and chemical reason. The selected route must work for the supplied feed and desired product.",
      ),
    ),
    c(
      "g-source",
      "Identify what the ore contains",
      "An ore contains copper oxide mixed with unwanted rock. Which description is correct?",
      "Metal compound in a mixture",
      {
        "Pure copper metal": "Copper is chemically combined with oxygen.",
        "Only oxygen": "Copper oxide contains copper as well.",
      },
      "The ore contains a compound plus unwanted material; copper metal still requires chemical reduction.",
      "Distinguish an element, its compound and a mixture.",
      m(
        "source",
        "Compare oxide ore, native gold, concentrated ore and a supplied carbonate-to-oxide step.",
      ),
    ),
    c(
      "g-oxygen",
      "Follow oxygen removal",
      "Initial equation: 2CuO + C → 2Cu + CO2. Which substance is reduced?",
      "CuO",
      {
        C: "Carbon gains oxygen and is oxidised.",
        CO2: "This is a product, not the starting oxide.",
      },
      "CuO loses oxygen to become Cu; carbon receives that oxygen and forms the given CO2 product.",
      "Follow the original oxygen atoms.",
      m(
        "oxygen",
        "Identify the oxide reduced, stated carbon product and transferred oxygen count. Actual 3D belongs only to the initial CuO reaction.",
      ),
    ),
    n(
      "g-grade",
      "Separate compound and metal",
      "Initial ore: 100 kg contains 25% CuO. Cu contributes 64 of CuO relative mass 80. What maximum copper mass is contained?",
      20,
      "kg",
      "100 × 0.25 = 25 kg CuO; 25 × 64/80 = 20 kg contained Cu. Actual recovered Cu can be lower.",
      "First find oxide mass, then its copper share.",
      m(
        "grade",
        "Construct oxide mass and contained metal maximum. Bars share an ore-mass scale and are not added together.",
      ),
    ),
    c(
      "g-decision",
      "Choose the lower unit cost",
      "Initial supplied batches: A recovers 20 kg for £80; B recovers 25 kg for £112.50. Same metal/purity and complete costs. Which has lower cost per recovered kilogram?",
      "Route A",
      {
        "Route B": "A costs £4/kg; B costs £4.50/kg despite its larger output.",
        "Both have equal unit cost": "Compare cost divided by actual output.",
      },
      "A: 80/20 = £4/kg. B: 112.50/25 = £4.50/kg. This choice uses the stated cost priority.",
      "Use comparable actual-output denominators.",
      m(
        "decision",
        "Calculate both costs per actual recovered kg, then apply the stated priority or simultaneous constraints.",
      ),
    ),
  ],
  practice: [
    c(
      "p-al",
      "Reject unsuitable carbon",
      "Given Al > C, compare carbon reduction and electrolysis for Al2O3. Which supplied route is suitable?",
      "Electrolysis",
      {
        "Carbon reduction":
          "Carbon is less reactive and cannot remove oxygen from Al2O3.",
        "Crush the oxide": "Crushing leaves aluminium chemically combined.",
      },
      "Aluminium is more reactive than carbon; electrolysis is the suitable supplied route.",
      "Apply the given order to oxygen removal.",
    ),
    c(
      "p-cu",
      "Apply a new order",
      "Given C > Cu and suitable conditions, which route can obtain Cu from CuO?",
      "Carbon-based reduction",
      {
        "Crushing only": "Crushing is physical, not oxide reduction.",
        "Carbon cannot work for any metal":
          "The supplied order supports this oxide reduction.",
      },
      "Copper is below carbon, so carbon can remove oxygen from this oxide.",
      "Use the supplied metal rather than aluminium's result.",
    ),
    c(
      "p-carbide",
      "Consider product purity",
      "A supplied carbon route produces unwanted X carbide. A non-carbon route gives the required pure X. Which is chemically suitable?",
      "The supplied non-carbon route",
      {
        "The carbon route because it is cheaper":
          "It fails the specified pure-metal product requirement.",
        "Either because both use heat":
          "Heat alone does not establish product suitability.",
      },
      "An unwanted carbide makes carbon unsuitable for this required product; the given alternative is suitable.",
      "Check the product, not just the process price.",
    ),
    w(
      "p-explain-al",
      "Construct the chemical reason",
      "Given Al > C, explain why a cheaper carbon route cannot obtain Al from Al2O3.",
      "Aluminium is more reactive than carbon, so carbon cannot remove oxygen from aluminium oxide. A lower price does not change this chemical limitation.",
      [
        "State aluminium is more reactive than carbon.",
        "Link this to carbon being unable to remove oxygen/reduce the oxide.",
      ],
    ),
    c(
      "p-native",
      "Avoid a purity claim",
      "Native gold grains are mixed with sand. Which statement follows?",
      "Gold is uncombined; physical impurity separation may be needed",
      {
        "All the material is pure gold":
          "Native describes chemical form, not the whole mixture's purity.",
        "Gold must first be reduced from gold oxide":
          "No oxide is identified in this record.",
      },
      "Gold is already elemental but physically mixed with sand.",
      "Separate chemical identity and mixture purity.",
    ),
    c(
      "p-crush",
      "Identify an incomplete extraction",
      "CuO ore is crushed and concentrated; analysis still identifies CuO. Has CuO been reduced to Cu?",
      "No: copper remains in the oxide",
      {
        "Yes: smaller grains mean copper metal":
          "Physical size change does not remove combined oxygen.",
        "Yes: unwanted rock removal always reduces oxides":
          "Concentration and chemical reduction are distinct.",
      },
      "Concentration can enrich the feed without changing CuO into Cu.",
      "Look for chemical product identity.",
    ),
    c(
      "p-prepare",
      "Separate preparation from reduction",
      "Given ZnCO3 → ZnO + CO2, has zinc metal been obtained?",
      "No: zinc remains chemically combined in ZnO",
      {
        "Yes: gas formation guarantees zinc metal":
          "The stated solid is ZnO, not Zn.",
        "Yes: any heating extracts metal": "Use the actual supplied products.",
      },
      "This prepares oxide; a later suitable reduction is still needed for metal.",
      "Read the zinc-containing product.",
    ),
    w(
      "p-ore",
      "Explain physical versus chemical change",
      "Explain why crushing copper oxide ore can aid processing but does not itself obtain copper metal.",
      "Crushing makes smaller pieces and can assist subsequent processing. Copper remains chemically combined with oxygen in CuO; reduction is needed to remove oxygen and form copper metal.",
      [
        "Crushing is a physical size change.",
        "Copper remains in CuO until chemical reduction removes oxygen.",
      ],
    ),
    n(
      "p-cuo",
      "Count transferred atoms",
      "Given 3CuO + 3C → 3Cu + 3CO, how many oxygen atoms leave the oxide inventory?",
      3,
      "atoms",
      "Three CuO units provide three O atoms; they appear in three CO molecules.",
      "Apply the coefficient to oxygen in CuO.",
    ),
    c(
      "p-co",
      "Respect supplied carbon product",
      "Given ZnO + C → Zn + CO, which carbon oxide forms?",
      "Carbon monoxide, CO",
      {
        "Carbon dioxide, CO2": "This equation states CO.",
        "No carbon oxide": "Carbon gains oxygen in the product.",
      },
      "The supplied product is CO; not every carbon reduction forms CO2.",
      "Use the equation's product formula.",
    ),
    c(
      "p-agent",
      "Explain the reducing agent",
      "Given NiO + C → Ni + CO, what is carbon's role?",
      "It removes oxygen from NiO and is itself oxidised",
      {
        "It is reduced because nickel is reduced":
          "The agent and oxide undergo different changes.",
        "It destroys oxygen": "Oxygen is conserved in CO.",
      },
      "Carbon causes oxide reduction by taking oxygen and becomes oxidised.",
      "Track oxygen gain by carbon.",
    ),
    w(
      "p-carbon-product",
      "Explain different carbon oxides",
      "Two supplied reactions form CO and CO2 respectively. Explain why memorising CO2 for every carbon reduction is unreliable.",
      "The supplied equation determines the carbon oxide product. CO contains one oxygen per carbon atom and CO2 contains two; both can represent oxygen transferred from an oxide under the stated conditions.",
      [
        "Read the stated product rather than force CO2.",
        "Both given equations must conserve oxygen atoms.",
      ],
    ),
    n(
      "p-oxide",
      "Calculate a new ore grade",
      "150 kg ore contains 20% useful oxide. What oxide mass is present?",
      30,
      "kg",
      "150 × 20/100 = 30 kg oxide.",
      "Use the ore mass as the whole.",
    ),
    n(
      "p-metal",
      "Convert oxide to contained metal",
      "The useful oxide mass is 30 kg. Metal contributes 56 of its relative mass 80. What maximum metal mass is contained?",
      21,
      "kg",
      "30 × 56/80 = 21 kg metal contained, not necessarily recovered.",
      "Multiply oxide mass by its metal fraction.",
    ),
    n(
      "p-aloxide",
      "Read an exam-style rock fraction",
      "40 kg rock contains 38% Al2O3. What mass of Al2O3 is present? Give the unrounded value.",
      15.2,
      "kg",
      "40 × 0.38 = 15.2 kg oxide; this is not aluminium mass.",
      "The percentage refers to Al2O3.",
    ),
    n(
      "p-iron",
      "Combine two steps",
      "200 kg ore contains 30% Fe2O3. Fe contributes 112 of relative mass 160. What maximum iron mass is contained?",
      42,
      "kg",
      "200 × 0.30 = 60 kg oxide; 60 × 112/160 = 42 kg contained Fe.",
      "Use two different fractions in sequence.",
    ),
    n(
      "p-cost",
      "Use actual rather than maximum output",
      "A batch contains at most 30 kg metal but actually recovers 24 kg. Complete cost is £120. What is cost per recovered kg?",
      5,
      "£/kg",
      "120/24 = £5/kg. Dividing by the 30 kg maximum would understate actual unit cost.",
      "Use actual recovered metal.",
    ),
    n(
      "p-emission",
      "Normalise supplied emissions",
      "A supplied batch emits 18 kg CO2 and recovers 30 kg metal. What are emissions per recovered kg?",
      0.6,
      "kg CO2/kg metal",
      "18/30 = 0.60 kg CO2 per kg recovered metal.",
      "Keep numerator and denominator quantities named.",
    ),
    c(
      "p-neither",
      "Apply both constraints",
      "A costs £4/kg with 1.10 kg CO2/kg; B costs £4.50/kg with 0.64 kg CO2/kg. Require cost ≤£4.20/kg AND emissions ≤0.90 kg CO2/kg. Which qualifies?",
      "Neither route",
      {
        "Route A": "A fails the emissions limit.",
        "Route B": "B fails the cost limit.",
        "Both routes": "Each fails one required constraint.",
      },
      "A fails emissions and B fails cost, so neither meets both.",
      "AND means each route must pass both limits.",
    ),
    w(
      "p-evaluate",
      "Explain a trade-off",
      "Both supplied routes obtain the same metal and purity. A is cheaper per recovered kg; B has lower supplied CO2 per recovered kg. Explain why there is no single best route without a stated priority.",
      "The routes perform differently against cost and supplied emissions. The preferred route depends on the priority and any limits; a decision must use comparable actual output and every required constraint.",
      [
        "Name the cost/emissions trade-off.",
        "State a priority or limits are needed.",
        "Use comparable recovered-metal units.",
      ],
    ),
  ],
  checkForms: [
    [
      c(
        "a-route",
        "Fresh route decision",
        "Given C > metal M and a compatible MO oxide, which supplied method can obtain M?",
        "Carbon reduction",
        {
          "Crushing only": "M remains combined with oxygen.",
          "Carbon is always unsuitable":
            "The supplied reactivity and compatibility support reduction.",
        },
        "Carbon is more reactive than M and can remove oxygen from its compatible oxide.",
        "Use the supplied order.",
      ),
      n(
        "a-oxide",
        "Fresh ore calculation",
        "80 kg ore contains 35% useful oxide. What mass of oxide is present?",
        28,
        "kg",
        "80 × 0.35 = 28 kg oxide.",
        "Use ore as the whole.",
      ),
      n(
        "a-metal",
        "Fresh composition calculation",
        "This 28 kg oxide has metal fraction 3/4 by mass. What maximum metal mass is contained?",
        21,
        "kg",
        "28 × 3/4 = 21 kg contained metal.",
        "Use oxide mass, not total ore mass.",
      ),
      n(
        "a-cost",
        "Fresh actual-output comparison",
        "A batch actually recovers 18 kg metal and costs £81 in total. What is cost per recovered kg?",
        4.5,
        "£/kg",
        "81/18 = £4.50/kg.",
        "Divide cost by actual recovered output.",
      ),
      w(
        "a-explain",
        "Fresh chemical justification",
        "Given metal R is more reactive than carbon, explain why a cheap carbon reduction of R oxide is unsuitable among the supplied routes.",
        "R is more reactive than carbon, so carbon cannot remove oxygen from R oxide. Cheapness cannot make this chemical route suitable.",
        [
          "Use the stated reactivity order.",
          "Link it to carbon being unable to remove oxygen from the oxide.",
        ],
      ),
    ],
    [
      c(
        "b-source",
        "Fresh source identification",
        "Native silver is identified as elemental Ag grains mixed with rock. What follows?",
        "Silver is uncombined but physical impurities may remain",
        {
          "The entire sample must be pure silver":
            "Native does not guarantee mixture purity.",
          "Silver oxide must be reduced first":
            "The supplied grains are elemental silver.",
        },
        "Elemental Ag is uncombined; rock can remain as a physical impurity.",
        "Separate chemical form from purity.",
      ),
      n(
        "b-oxide",
        "Fresh ore calculation",
        "120 kg ore contains 15% useful oxide. What oxide mass is present?",
        18,
        "kg",
        "120 × 0.15 = 18 kg oxide.",
        "Use the stated percentage.",
      ),
      n(
        "b-metal",
        "Fresh composition calculation",
        "This 18 kg oxide contains 5/6 metal by mass. What maximum metal mass is contained?",
        15,
        "kg",
        "18 × 5/6 = 15 kg contained metal.",
        "Apply the fraction to oxide mass.",
      ),
      n(
        "b-cost",
        "Fresh actual-output comparison",
        "A complete batch costs £72 and actually recovers 16 kg metal. What is cost per recovered kg?",
        4.5,
        "£/kg",
        "72/16 = £4.50/kg.",
        "Use actual recovered mass.",
      ),
      w(
        "b-explain",
        "Fresh product interpretation",
        "Given MO + C → M + CO, explain how this equation supports oxide reduction and why replacing CO with CO2 without changing the equation is incorrect.",
        "MO loses oxygen and becomes M, so it is reduced. Carbon receives the oxygen and the given product is CO. Substituting CO2 would change the oxygen inventory unless the equation were changed and balanced.",
        [
          "Describe oxygen loss from MO.",
          "Use the stated CO product.",
          "Conserve oxygen atoms.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      c(
        "v-a-native",
        "Retrieve native meaning",
        "Does native gold mixed with sand need oxide reduction to become gold metal?",
        "No: it is already elemental gold",
        {
          "Yes: sand makes gold an oxide":
            "Physical mixing does not imply chemical combination.",
          "The mixture is guaranteed pure": "Impurities can remain.",
        },
        "Gold is already uncombined; impurity separation is a different issue.",
        "Recall native chemical identity.",
      ),
      n(
        "v-a-grade",
        "Retrieve two-step mass",
        "60 kg ore contains 50% oxide. The oxide is 80% metal by mass. What maximum metal mass is contained?",
        24,
        "kg",
        "60 × 0.50 × 0.80 = 24 kg.",
        "Apply both fractions.",
      ),
      c(
        "v-a-limit",
        "Retrieve constrained choice",
        "A costs £3/kg with 1.2 kg CO2/kg; B costs £5/kg with 0.5 kg CO2/kg. Require cost ≤£4/kg AND CO2 ≤0.8 kg/kg. Which qualifies?",
        "Neither",
        {
          A: "A fails emissions.",
          B: "B fails cost.",
          Both: "Each fails a limit.",
        },
        "No supplied route meets both limits.",
        "Test each route against both constraints.",
      ),
    ],
    [
      c(
        "v-b-route",
        "Retrieve chemical suitability",
        "Given Al > C, can lower carbon fuel cost make carbon reduction of Al2O3 suitable?",
        "No: carbon cannot remove the oxygen",
        {
          "Yes: cheap processes always work":
            "Price does not change reactivity.",
          "Yes: crushing makes it suitable":
            "Crushing does not change oxide identity.",
        },
        "Aluminium is more reactive than carbon; cost does not remove this limitation.",
        "Recall the chemical reason.",
      ),
      n(
        "v-b-grade",
        "Retrieve contained mass",
        "90 kg ore contains 20% oxide; the oxide contains 2/3 metal by mass. What maximum metal mass is contained?",
        12,
        "kg",
        "90 × 0.20 × 2/3 = 12 kg.",
        "Separate ore grade and compound composition.",
      ),
      n(
        "v-b-cost",
        "Retrieve actual unit cost",
        "A complete batch costs £84 and recovers 21 kg metal. What is cost per recovered kg?",
        4,
        "£/kg",
        "84/21 = £4/kg.",
        "Use recovered kilograms.",
      ),
    ],
  ],
};

const recovery: Record<string, string> = {
  "p-al": "r-route",
  "p-cu": "r-route",
  "p-carbide": "r-route",
  "p-explain-al": "r-route",
  "p-native": "r-native",
  "p-crush": "r-native",
  "p-prepare": "r-native",
  "p-ore": "r-native",
  "p-cuo": "r-product",
  "p-co": "r-product",
  "p-agent": "r-product",
  "p-carbon-product": "r-product",
  "p-oxide": "r-fraction",
  "p-metal": "r-fraction",
  "p-aloxide": "r-fraction",
  "p-iron": "r-fraction",
  "p-cost": "r-unit",
  "p-emission": "r-unit",
  "p-neither": "r-unit",
  "p-evaluate": "r-unit",
};
for (const task of metalExtractionJourney.practice)
  task.followUp = `me-v1-${recovery[task.id.replace("me-v1-", "")]}`;
