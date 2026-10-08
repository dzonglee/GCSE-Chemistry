import type { LearningTask, LessonJourney } from "../types";
import { choice, tasks } from "./helpers";
function pick(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  followUp: string,
): LearningTask {
  return {
    ...choice(
      `mr-write-v1-${id}`,
      prompt,
      answer,
      errors,
      explanation,
      "Use the stated conditions and distinguish ion-formation tendency from ion charge.",
      "Explain metal reactions and valid comparisons.",
    ),
    title,
    conciseHeading: true,
    followUp,
  };
}
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  followUp: string,
): LearningTask {
  return {
    id: `mr-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare your retained response with the criteria; no automatic examiner mark is awarded.",
    hint: "Name the reaction conditions, use positive-ion tendency and justify the conclusion with relevant evidence.",
    purpose:
      "Independently recall metal reactions, explain ion-formation tendency or construct a valid investigation.",
  };
}
const ions = pick(
  "r-ions",
  "Reactivity and ions",
  "What makes a metal more reactive in this GCSE comparison?",
  "A greater tendency to form positive ions",
  {
    "It must form an ion with a larger positive charge":
      "Mg and Zn both form 2+ ions in these cases but differ in reactivity.",
    "It must change into a different element":
      "Reactions retain the metal’s proton number and element identity.",
  },
  "Reactivity concerns the tendency to form positive ions. It is not the size of the positive charge, a change in proton number or an equally spaced numerical strength.",
  "mr-write-v1-r-ions",
);
const plan = pick(
  "r-plan",
  "Plan a valid comparison",
  "Which plan can place an unknown metal using the supplied CuSO4 temperature-rise comparison?",
  "Measure its temperature rise under matched conditions and compare with the reference results",
  {
    "Compare final temperatures despite different starting temperatures":
      "Measure the change, not just the final reading.",
    "Use powder for one metal and a large chip for another without controls":
      "Surface and amount differences can confound the comparison.",
  },
  "Use the same stated comparison: suitable metal and CuSO4 solution, initial and maximum temperature, temperature rise, comparison with reference results and a relevant control such as solution volume/concentration or metal amount/state of division. A universal numerical reactivity scale is not implied; surface films can affect results.",
  "mr-write-v1-r-plan",
);
const guided = pick(
  "g-reference",
  "Compare reaction conditions",
  "Brief room-temperature water tests show no visible change for Zn, Fe and Cu. Do these observations alone rank them?",
  "No: the observations do not distinguish the three",
  {
    "Yes: all three have equal reactivity":
      "An identical short visible outcome does not prove equal ion-formation tendency.",
    "Yes: Cu must be most reactive": "The records supply no such comparison.",
  },
  "Zn, Fe and Cu cannot be ordered from these brief null water observations. Suitable dilute-HCl comparisons distinguish Zn and Fe from Cu and, under comparable conditions, Zn from Fe. Explore all eight core metals in the guided reference; do not treat steam as room-temperature water.",
  "mr-write-v1-r-ions",
);
guided.metalReactionReference = true;
export const reactivityWritingAdditions = {
  guided: [guided],
  practice: [
    pick(
      "p-charge",
      "Separate charge from tendency",
      "Mg2+ and Zn2+ have the same charge. Does this establish equal metal reactivity?",
      "No: equal charge does not establish equal tendency to form ions",
      {
        "Yes: both 2+ ions prove equal reactivity":
          "Charge size and tendency to form that ion are different quantities.",
        "Yes: the two metals are the same element":
          "Mg and Zn have different proton numbers.",
      },
      "Magnesium is above zinc in the core series despite both forming 2+ ions in these examples. Greater reactivity means greater tendency to form positive ions, not necessarily a larger charge.",
      "mr-write-v1-r-ions",
    ),
    pick(
      "p-products",
      "Use the named reagent",
      "Fe reacts with suitable dilute HCl at room temperature, forming Fe2+. Which products fit?",
      "FeCl2 and H2",
      {
        "Fe(OH)2 and H2": "Hydroxide confuses the acid with a water reaction.",
        "FeCl3 and O2":
          "The supplied ion is 2+, not 3+, and hydrogen is the gas in this case.",
      },
      "Fe + 2HCl → FeCl2 + H2. Zinc gives ZnCl2 and H2; magnesium gives MgCl2 and H2. Copper does not displace hydrogen from this dilute non-oxidising acid; this is not a claim about all acids.",
      "mr-v1-r-acid",
    ),
  ],
  check: [
    written(
      "ca-core",
      "Recall water reactions",
      "Recall the eight-metal AQA order, most reactive first. Describe the room-temperature water pattern, including Mg and Zn/Fe/Cu.",
      "K > Na > Li > Ca > Mg > Zn > Fe > Cu. K, Na and Li react with water to give the named metal hydroxide and hydrogen, with K > Na > Li in vigour; sodium may melt into a ball and potassium may ignite with a lilac flame. Calcium produces hydrogen and calcium hydroxide, with a cloudy suspension possible. Magnesium reacts very slowly with room-temperature water; no obvious bubbles in a brief test is not proof of no reaction. Zn, Fe and Cu show no visible reaction in a typical brief room-temperature water comparison, which alone cannot rank them. Steam reactions are excluded; iron rusting with oxygen and water is a different process.",
      [
        "Recall all eight in the correct order; positions are ordinal, not equal numerical strengths.",
        "Describe Group 1 water reactions: hydrogen and the named hydroxide, with K > Na > Li in vigour.",
        "Describe calcium’s hydrogen/hydroxide and possible cloudiness.",
        "Distinguish very slow Mg from brief null Zn/Fe/Cu observations; do not substitute steam or force equal reactivity.",
      ],
      "mr-v1-r-series",
    ),
    written(
      "ca-acid",
      "Explain acid reactions",
      "Describe Mg, Zn, Fe and Cu with suitable dilute HCl at room temperature. Relate their comparison to positive-ion tendency; distinguish charge from tendency.",
      "Mg, Zn and Fe react to form their chlorides and hydrogen: MgCl2, ZnCl2 and FeCl2 in the supplied 2+ cases. Copper does not displace hydrogen from dilute HCl. The core order is Mg > Zn > Fe > Cu; more reactive metals have a greater tendency to form positive ions. The same 2+ charge does not imply equal reactivity. Rate comparisons need comparable conditions, and an oxide film can affect observations. These conclusions concern suitable dilute non-oxidising HCl, not every acid.",
      [
        "Name chlorides and hydrogen for Mg/Zn/Fe, with Fe2+ giving FeCl2.",
        "State no hydrogen-producing displacement for Cu in dilute HCl.",
        "Use Mg > Zn > Fe > Cu and connect the comparison to positive-ion formation tendency.",
        "Distinguish charge size from tendency and avoid uncontrolled-rate or all-acid claims.",
      ],
      "mr-write-v1-r-ions",
    ),
    written(
      "ca-plan",
      "Place an unknown metal",
      "Comparable CuSO4 tests: Cu 0, Fe 9, Zn 17, Mg 35 °C rise. Larger rise ranks reactivity here. Plan a valid P test giving 26°C; interpret it and give a control.",
      "Add the unknown metal P to CuSO4 solution in a suitable supervised comparison using the same method as the reference trials. Measure the initial and maximum solution temperature and calculate their difference. Under the supplied comparison criterion, 35 > 26 > 17 places Mg > P > Zn, and therefore above Fe and Cu. Control a relevant variable such as CuSO4 volume/concentration or metal mass/moles/state of division, with consistent starting conditions and temperature measurement. Repeat comparable trials and investigate discrepant surface-film effects. The supplied temperature criterion is not a universal intrinsic reactivity scale.",
      [
        "Describe a suitable metal–CuSO4 comparison using the same reference method.",
        "Measure initial and maximum temperature and calculate the rise.",
        "Compare 26°C with 35°C and 17°C: Mg > P > Zn.",
        "Name a relevant control and explain that observations must be comparable, not a universal scale.",
      ],
      "mr-write-v1-r-plan",
    ),
  ],
  review: [
    written(
      "ra-water",
      "Retrieve water contrasts",
      "Recall the AQA eight-metal order. Compare K/Na/Li and Ca with room-temperature water; explain the limits of brief Mg/Zn/Fe/Cu observations.",
      "K > Na > Li > Ca > Mg > Zn > Fe > Cu. The three alkali metals give hydrogen and their named hydroxides; vigour increases Li to Na to K. Calcium gives hydrogen and calcium hydroxide, with cloudiness from limited solubility. Mg is very slow with room-temperature water; Zn, Fe and Cu show no visible reaction in the stated brief comparison. A short absence of bubbles does not establish identical reactivity, and another suitable comparison is needed to rank those metals. Steam is outside this comparison.",
      [
        "Recall the correct full core order without adding nonmetals as metals.",
        "Name Group 1 hydroxide/hydrogen products and the vigour trend.",
        "Describe calcium products/cloudiness.",
        "Distinguish slow Mg and undistinguished brief null observations; exclude steam.",
      ],
      "mr-v1-r-series",
    ),
    written(
      "ra-ions",
      "Retrieve ion tendency",
      "Comparable dilute-HCl records show Zn producing hydrogen faster than Fe; Cu produces none. Explain products, supported order and positive-ion tendency. Zn/Fe products are 2+.",
      "Zn gives zinc chloride and hydrogen; Fe gives iron(ii) chloride and hydrogen, ZnCl2 and FeCl2. Cu produces no hydrogen from this suitable dilute non-oxidising HCl. With the stated comparable conditions, the evidence supports Zn > Fe > Cu, consistent with a greater tendency to form positive ions for the more reactive metal. Zn2+ and Fe2+ having the same charge does not make their tendencies equal. Element identities and proton numbers remain unchanged.",
      [
        "Describe ZnCl2/H2 and FeCl2/H2 and the Cu non-displacement in dilute HCl.",
        "Use the supplied comparable evidence for Zn > Fe > Cu.",
        "Explain greater tendency to form positive ions, not larger charge or element transmutation.",
      ],
      "mr-write-v1-r-ions",
    ),
    written(
      "ra-plan",
      "Retrieve a valid method",
      "Comparable CuSO4 tests: Cu 0, Fe 8, Zn 16, Mg 32 °C rise. Larger rise ranks reactivity here. Plan a valid X test giving 22°C; interpret it and give a control.",
      "Use a suitable supervised CuSO4 comparison for X with the same reference procedure. Measure initial and maximum temperature and calculate the rise, rather than comparing final temperatures alone. The supplied criterion and 32 > 22 > 16 place Mg > X > Zn. Keep an appropriate variable controlled: CuSO4 volume/concentration or metal mass/moles/state of division, with consistent initial conditions and measurement method. Check repeatability and unexpected surface effects; supplied temperature rises do not define a universal numerical metal scale.",
      [
        "Construct the suitable unknown-metal/CuSO4 method.",
        "Measure initial/maximum readings and subtract for the rise.",
        "Interpret 22 between 32 and 16 as Mg > X > Zn.",
        "Name a relevant control and respect the stated comparison criterion.",
      ],
      "mr-write-v1-r-plan",
    ),
  ],
};
export function extendReactivityWriting(journey: LessonJourney) {
  journey.refresher.push(ions, plan);
  journey.guided.push(...reactivityWritingAdditions.guided);
  journey.practice.push(...reactivityWritingAdditions.practice);
  journey.checkForms.push(reactivityWritingAdditions.check);
  journey.reviewForms.push(reactivityWritingAdditions.review);
  const all = tasks(journey);
  for (const q of all) q.conciseHeading = true;
  const families = [
    [
      "mr-v1-r-series",
      "mr-v1-g-series",
      "mr-v1-p-full-order",
      guided.id,
      reactivityWritingAdditions.check[0].id,
      reactivityWritingAdditions.review[0].id,
    ],
    [
      ions.id,
      "mr-v1-p-full-order",
      "mr-v1-p-ion",
      "mr-v1-r-acid",
      "mr-v1-g-observations",
      "mr-v1-p-acid-threshold",
      "mr-v1-rb-ions",
      reactivityWritingAdditions.practice[0].id,
      reactivityWritingAdditions.practice[1].id,
      reactivityWritingAdditions.check[1].id,
      reactivityWritingAdditions.review[1].id,
    ],
    [
      plan.id,
      "mr-v1-g-fair",
      "mr-v1-p-controls",
      "mr-v1-p-temperature",
      reactivityWritingAdditions.check[2].id,
      reactivityWritingAdditions.review[2].id,
    ],
  ];
  for (const ids of families)
    for (const q of all)
      if (ids.includes(q.id))
        q.exposureAliases = [
          ...new Set([
            ...(q.exposureAliases ?? []),
            ...ids.filter((id) => id !== q.id),
          ]),
        ];
  journey.practiceGroups = [
    {
      label: "Order, reactions and evidence",
      taskIds: journey.practice.slice(0, 21).map((q) => q.id),
    },
    {
      label: "Ion tendency and acid products",
      taskIds: journey.practice.slice(21).map((q) => q.id),
    },
  ];
  journey.guided[0].followUp = "mr-v1-r-series";
}
