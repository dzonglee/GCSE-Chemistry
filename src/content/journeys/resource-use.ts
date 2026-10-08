import type { LearningTask } from "../types";

// AQA 8462 4.10.1.1 supplement. Append only: saved LCA indices/forms stay valid.
const id = (suffix: string) => `lca-v1-resource-${suffix}`;
function choice(
  suffix: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
): LearningTask {
  const options = [answer, ...Object.keys(errors)];
  const offset =
    [...suffix].reduce((n, c) => n + c.charCodeAt(0), 0) % options.length;
  return {
    id: id(suffix),
    title,
    purpose: title,
    conciseHeading: true,
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
  };
}
function short(
  suffix: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
): LearningTask {
  return {
    id: id(suffix),
    title,
    purpose: title,
    conciseHeading: true,
    prompt,
    answer,
    referenceResponse: answer,
    rubric,
    hint,
    explanation:
      "Compare your short response with the criteria. Your original words remain saved; this is manual review, not an automatic examiner mark.",
  };
}

export const resourceRefresher: LearningTask[] = [
  choice(
    "r-needs",
    "Current and future needs",
    "Sustainable development meets current needs without compromising future generations' ability to meet theirs. A town needs timber for homes. Which plan follows this principle?",
    "Build needed homes and harvest within the forest's regrowth rate",
    {
      "Cut all the forest now":
        "That meets present demand but removes the future timber supply.",
      "Stop building all homes":
        "The principle also includes meeting current needs.",
    },
    "Humans use resources for warmth, shelter, food and transport. Timber provides shelter now. Managed harvesting and regrowth preserve future supply. Other environmental effects still need investigation.",
    "Check both today's need and tomorrow's ability to meet it.",
  ),
  short(
    "r-products",
    "Natural, agricultural and synthetic",
    "Natural products can be supplemented or replaced by farmed or synthetic products. Sheep farming supplies wool for clothing; synthetic polyester can supplement it. Name the synthetic product in this example. One name is enough.",
    "Polyester",
    [
      "Name polyester, a manufactured synthetic fibre; wool is supplied by agriculture.",
    ],
    "A synthetic product is made through chemical manufacture.",
  ),
  choice(
    "r-renewable",
    "Replenishment is the distinction",
    "A stock of mineral ore forms over millions of years. A timber crop regrows in decades under suitable management. Which classification follows this information?",
    "Ore is finite; timber is renewable",
    {
      "Both are renewable because both are natural":
        "Natural origin does not establish replenishment on human timescales.",
      "Both are finite because both can run out locally":
        "A renewable resource can still be depleted by excessive use.",
    },
    "Ore is not replenished on the timescale of use. Timber can regrow, so it is renewable; harvesting too quickly can still be unsustainable.",
    "Compare replenishment with the timescale of use.",
  ),
];
// Concrete source/product teaching follows the one-name response, not an essay demand.
resourceRefresher[1].explanation +=
  " Agriculture supplements natural supplies: orchards grow food, plantations grow timber, sheep/cotton farms supply clothing fibres and crops can supply fuels. Synthetic fibres can supplement or replace natural fibres. Chemistry can improve agricultural and industrial processes and develop useful substitutes; lower overall impact still needs evidence.";

export const resourceGuided: LearningTask[] = [
  choice(
    "g-needs",
    "Sustainable timber",
    "A village needs 40 tonnes of timber/year; its forest regrows 50 tonnes/year. Which harvest meets current needs and protects future supply?",
    "Harvest 40 tonnes/year; maintain regrowth",
    {
      "Harvest 80 tonnes a year":
        "This exceeds regrowth and reduces the future stock.",
      "Harvest none and provide no replacement supply":
        "The village's current shelter and fuel needs remain unmet.",
    },
    "40 tonnes meets the stated need and does not exceed 50 tonnes of annual regrowth. Sustainable development considers present needs and future capacity; this supply comparison is not a complete LCA.",
    "Compare the need, annual harvest and annual regrowth.",
  ),
  choice(
    "g-products",
    "Product sources",
    "Farmed cotton and manufactured polyester supply clothing. Classify these products.",
    "Cotton is agricultural; polyester is synthetic",
    {
      "Cotton is synthetic; polyester is agricultural":
        "Cotton is grown as a crop; polyester is manufactured chemically.",
      "Both are synthetic":
        "Farming cotton supplies a natural fibre through agriculture.",
    },
    "Cotton is an agricultural product. Synthetic polyester can supplement or replace it. Useful substitutes do not automatically have a lower lifecycle impact.",
    "Distinguish the grown crop from chemical manufacture.",
  ),
  choice(
    "g-renewable",
    "Renewable, overused",
    "Reeds regrow yearly; oil forms over millions of years. A factory harvests reeds faster than regrowth. Which statement follows?",
    "Reeds are renewable but this harvest is unsustainable; oil is finite",
    {
      "Reeds become a finite resource whenever harvesting is too fast":
        "The resource can renew; the chosen harvesting rate depletes its stock.",
      "Oil is renewable because it forms naturally":
        "Its formation is too slow to replace use on human timescales.",
    },
    "Renewability describes replenishment, not a promise of unlimited supply. Harvesting faster than regrowth can compromise future generations' needs even for a renewable resource.",
    "Separate the resource's replenishment from the way it is used.",
  ),
];
export const resourcePractice: LearningTask[] = [
  short(
    "p-needs",
    "Give two sustainability reasons",
    "A town still needs metal for water pipes. Recycling used copper reduces demand for newly mined ore. Give two short reasons why this helps sustainable development: one about current needs and one about future resources.",
    "Recycled copper supplies pipes needed now; reduced extraction conserves finite copper ore for future generations.",
    [
      "Link the recycled material to meeting the town's current need for pipes.",
      "Link lower extraction to conserving finite ore for future generations.",
    ],
    "Address current needs and future resources separately.",
  ),
  short(
    "p-products",
    "Give a synthetic replacement",
    "Wool from farmed sheep is used for clothing. Name one synthetic fibre that can replace or supplement wool. One name is enough; no environmental evaluation is needed.",
    "Polyester (also accept nylon or acrylic)",
    [
      "Name a suitable synthetic fibre, for example polyester, nylon or acrylic; cotton is agricultural, not synthetic.",
    ],
    "Choose a manufactured fibre rather than another farmed fibre.",
  ),
  choice(
    "p-renewable",
    "Classify from supplied information",
    "Willow for baskets regrows in a few years. A sand deposit forms much more slowly than it is extracted. Which classification follows this information?",
    "Willow is renewable; this sand deposit is finite",
    {
      "Both are renewable because they occur naturally":
        "The sand is not replaced on the extraction timescale.",
      "Willow is finite; sand is renewable":
        "Willow regrowth replaces the resource; this deposit does not replenish fast enough.",
    },
    "The supplied rates support renewable willow and a finite sand deposit. Natural origin alone is insufficient; sustainable use also depends on harvest rate and other impacts.",
    "Use the given replenishment times, not just natural origin.",
  ),
  choice(
    "p-lca",
    "A substitute needs evidence",
    "A synthetic fibre supplements farmed cotton. Which conclusion is justified before comparing their life cycles?",
    "It provides an alternative supply, but its overall environmental impact needs LCA evidence",
    {
      "Synthetic always means more sustainable":
        "Manufacture, feedstock, use and disposal all matter.",
      "Agricultural always means impact-free":
        "Farming can use land, water, energy and other inputs.",
    },
    "Chemistry can develop useful substitutes and improve agricultural or industrial processes. A substitute alone does not prove lower impact: preserve the existing LCA comparison across stages and equal service.",
    "Distinguish meeting a need from proving a lower overall impact.",
  ),
];

// These are new reserved forms, not replacements for either original LCA form.
export const resourceCheckForms: LearningTask[][] = [
  [
    short(
      "cC-needs",
      "Recycled furniture",
      "Recycled aluminium supplies furniture and reduces bauxite mining. Give two sustainable-development reasons.",
      "It supplies the school's furniture now and conserves finite bauxite for future generations.",
      [
        "Explain that recycled aluminium meets the current furniture need.",
        "Explain that reduced extraction conserves finite bauxite for future generations; cost alone is insufficient.",
      ],
      "Connect present needs and future supply.",
    ),
    short(
      "cC-products",
      "Name a synthetic supplement",
      "Cotton from agriculture provides clothing fibre. Name one synthetic fibre that can supplement cotton. One name is enough.",
      "Nylon (also accept polyester or acrylic)",
      [
        "Accept nylon, polyester, acrylic or another suitable synthetic clothing fibre; wool and cotton are not synthetic.",
      ],
      "Recall a manufactured fibre.",
    ),
    choice(
      "cC-renewable",
      "Compare replenishment times",
      "Bamboo regrows in years. A limestone deposit is replaced over geological timescales. Which classification follows this information?",
      "Bamboo is renewable; limestone is finite",
      {
        "Both are renewable because they are natural":
          "Limestone replacement is too slow on human timescales.",
        "Both are finite because extraction removes material":
          "Bamboo can regrow on the timescale of use.",
      },
      "Bamboo can replenish on human timescales; the limestone stock cannot. Renewable bamboo still requires suitable management.",
      "Compare formation and use timescales.",
    ),
  ],
  [
    short(
      "cD-needs",
      "Insulating homes",
      "Insulation keeps homes warm using less finite natural gas. Give two sustainable-development reasons.",
      "Homes still meet today's need for warmth, while lower gas use conserves a finite fuel supply for future generations.",
      [
        "Link insulation to meeting the current need for warmth.",
        "Link lower gas use to conserving finite reserves for future generations.",
      ],
      "Consider present warmth and future fuel supply.",
    ),
    short(
      "cD-products",
      "Agriculture supplements a natural supply",
      "Wild trees supply timber. Name an agricultural activity that can supplement this timber supply. One activity is enough.",
      "Growing trees in managed plantations",
      [
        "Accept cultivating/growing trees in plantations to supply timber; manufacturing plastic is a synthetic, not agricultural, supplement.",
      ],
      "Think of deliberately growing a timber crop.",
    ),
    choice(
      "cD-renewable",
      "Natural does not mean renewable",
      "Flax crops regrow each season. Iron ore deposits form far more slowly than mining removes them. Which classification follows?",
      "Flax is renewable; iron ore is finite",
      {
        "Both are renewable because both occur naturally":
          "Ore does not replenish on mining timescales.",
        "Both are finite because both are harvested":
          "Flax can be replenished by growing another crop.",
      },
      "Flax can be grown again; the iron ore stock cannot be replenished on human timescales. Recycling iron reduces demand for new ore without renewing the deposit.",
      "Compare replenishment with use.",
    ),
  ],
];
export const resourceReviewForms: LearningTask[][] = [
  [
    short(
      "vC-needs",
      "Timber supply",
      "Timber need=30 t/year; regrowth=35 t/year. Why harvest 30 t/year? Give two sustainability reasons.",
      "It meets the community's current timber need and does not harvest faster than regrowth, preserving supply for future generations.",
      [
        "Connect the 30-tonne harvest to the present 30-tonne need.",
        "Connect harvest below regrowth to maintaining future supply; this is not a complete LCA.",
      ],
      "Compare need, harvest and regrowth.",
    ),
    short(
      "vC-products",
      "A synthetic product replaces wool",
      "Silk from farmed silkworms provides fabric. Name one synthetic fibre that can replace or supplement silk. One name is enough.",
      "Polyester (also accept nylon or acrylic)",
      [
        "Name a suitable synthetic fibre, for example polyester, nylon or acrylic; silk and cotton are not synthetic.",
      ],
      "Recall a manufactured fibre.",
    ),
    choice(
      "vC-renewable",
      "Renewable but overused",
      "A grass crop regrows yearly but is cut faster than it regrows. An oil stock forms over millions of years. Which statement follows?",
      "Grass is renewable but this harvest is unsustainable; oil is finite",
      {
        "Both are finite because both stocks can fall":
          "Grass can renew even though overharvesting depletes it.",
        "Both are renewable because both form naturally":
          "Oil does not replenish on human timescales.",
      },
      "Grass is renewable; the rate of harvesting is unsustainable. Geological oil formation does not replenish current use.",
      "Distinguish replenishment from harvesting rate.",
    ),
  ],
  [
    short(
      "vD-needs",
      "Repair wiring",
      "Repairing copper wiring maintains electricity supply and reduces new copper demand. Give two sustainable-development reasons.",
      "It meets the current need for electricity and conserves finite copper ore for future generations by reducing new extraction.",
      [
        "Connect repair to maintaining the current electricity-supply need.",
        "Connect lower new-copper demand to conserving finite ore for future generations.",
      ],
      "Identify today's need and the resource saved for later.",
    ),
    short(
      "vD-products",
      "Name an agricultural supplement",
      "Wild fruit supplies food. Name an agricultural activity that supplements this supply. One activity is enough.",
      "Growing fruit in orchards",
      [
        "Accept growing fruit in orchards or cultivating a suitable food crop to supplement wild food; merely collecting wild fruit is not agriculture.",
      ],
      "Think of deliberately cultivating food.",
    ),
    choice(
      "vD-renewable",
      "A crop and a mineral stock",
      "Rapeseed for fuel can be grown each year. A coal deposit forms over millions of years. Which classification follows?",
      "Rapeseed is renewable; coal is finite",
      {
        "Both are finite because fuel is used up":
          "The rapeseed crop can be regrown.",
        "Both are renewable because both come from plants":
          "Coal formation does not replace current extraction on human timescales.",
      },
      "Regrowing rapeseed replenishes its supply; coal is a finite stock on human timescales. Renewable fuel is not automatically impact-free or sustainably produced.",
      "Use the supplied replenishment times.",
    ),
  ],
];

for (const q of resourcePractice) {
  q.followUp = id(
    q.id.endsWith("products") || q.id.endsWith("lca")
      ? "r-products"
      : q.id.endsWith("renewable")
        ? "r-renewable"
        : "r-needs",
  );
}

// The same synthetic-fibre recall is helped equivalent work, even for another natural fibre.
const equivalent = [
  resourceRefresher[1],
  resourceGuided[1],
  resourcePractice[1],
  resourceCheckForms[0][1],
  resourceReviewForms[0][1],
];
for (const q of equivalent)
  q.exposureAliases = equivalent
    .filter((other) => other !== q)
    .map((other) => other.id);
resourceGuided[2].exposureAliases = [resourceReviewForms[0][2].id];
resourceReviewForms[0][2].exposureAliases = [resourceGuided[2].id];
// Different contextual needs/replenishment evidence is transfer, not a new ID for a verbatim repeat.
export const allResourceTasks = [
  ...resourceRefresher,
  ...resourceGuided,
  ...resourcePractice,
  ...resourceCheckForms.flat(),
  ...resourceReviewForms.flat(),
];
