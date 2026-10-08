import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
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
    `mr-v1-${id}`,
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
    `mr-v1-${id}`,
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
const w = (
  id: string,
  title: string,
  prompt: string,
  explanation: string,
  rubric: string[],
): LearningTask => ({
  id: `mr-v1-${id}`,
  title,
  prompt,
  answer: explanation,
  explanation,
  rubric,
  hint: "State what the observations establish, explain the chemical comparison and identify any missing evidence.",
  purpose: title,
});
const m = (
  mode: "series" | "observations" | "displacement" | "evidence" | "fair",
  instruction: string,
): TaskModel => ({ kind: "metal-reactivity", mode, instruction });
export const metalReactivityJourney: LessonJourney = {
  version: 1,
  introduction:
    "Use observations and positive-ion formation to predict and justify metal reactivity.",
  scopeNote:
    "Foundation/shared AQA 4.4.1.2 and Combined 5.4.1.2, related Pearson 4.1/4.3. The AQA recalled core is K, Na, Li, Ca, Mg, Zn, Fe and Cu; Pearson additionally lists Al, Ag and Au, and omits Li from its stated list. The union reference includes nonmetal C and H as useful comparisons, not metals. Positions are ordinal: gaps do not quantify reactivity. AQA water/dilute-acid observations here are at room temperature and exclude steam. Alkali metals react very vigorously with water; supplied records are interpreted, not instructions for unsupervised experiments. Mg reacts very slowly with room-temperature water, so a short record with no obvious bubbles is not proof of zero reaction. Use suitable dilute HCl, not a universal claim about every acid: oxidising acids such as nitric acid behave differently. More reactive metals have a greater tendency to form positive ions. A more reactive added metal can displace a less reactive dissolved metal; element identities remain unchanged. The actual 3D example represents one metal-surface atom, one dissolved 2+ metal cation and an intact sulfate 2− spectator before/after; water, hydration and full bulk lattices are omitted. Separate aqueous ions are not salt molecules. Detailed electron-redox/half equations and full oxide/reduction/extraction coverage require their individual lessons. Experimental ordering requires suitable conditions and complete observable outcomes; short null observations, oxide films, unequal exposed area or unequal reactant amounts can mislead. Given comparable temperature/rate data may support the stated comparison; equal final gas yield does not prove equal reactivity. Missing comparisons leave a partial order; contradictory results need review. Written explanations remain self-reviewed, never automatically correct or an official examiner mark.",
  outcomes: [
    "Recall and use the relevant metal order.",
    "Distinguish room-temperature water and dilute-HCl observations.",
    "Predict displacement without changing element identities.",
    "Deduce complete or partial orders from supplied evidence.",
    "Explain positive-ion tendency and fair comparisons.",
  ],
  warmup: [
    n(
      "w-charge",
      "Recognise a positive ion",
      "An ion has 10 protons and 9 electrons. Give its positive charge as a number.",
      1,
      "+",
      "10 positive charges minus 9 negative charges gives 1+.",
      "Compare protons and electrons.",
    ),
    c(
      "w-order",
      "Use a supplied order",
      "Given Mg > Zn > Fe > Cu, which is more reactive: Zn or Cu?",
      "Zn",
      {
        Cu: "Cu is lower in the supplied order.",
        "They must be equal":
          "Different positions indicate an order, not equality.",
      },
      "Zn is above Cu in the supplied most-to-least reactive order.",
      "Use the direction of the supplied order.",
    ),
  ],
  refresher: [
    c(
      "r-series",
      "Read the direction",
      "A list runs K, Na, Li, Ca, Mg, Zn, Fe, Cu from most to least reactive. Which listed metal is least reactive?",
      "Cu",
      {
        K: "K is at the most-reactive end.",
        Mg: "Several listed metals are below Mg.",
      },
      "Cu is last in this AQA core list.",
      "Follow most to least.",
    ),
    c(
      "r-water",
      "Identify water products",
      "A supplied sodium reaction with room-temperature water produces a metal hydroxide and a gas. Name the gas.",
      "Hydrogen",
      {
        Oxygen: "The gas in this metal–water reaction is hydrogen.",
        "Carbon dioxide": "There is no carbon-containing reactant.",
      },
      "2Na + 2H2O → 2NaOH + H2. The solution becomes alkaline.",
      "Metal + water can give hydroxide + hydrogen.",
    ),
    c(
      "r-acid",
      "Identify dilute-acid products",
      "Zinc reacts with suitable dilute hydrochloric acid. Which products are expected?",
      "Zinc chloride and hydrogen",
      {
        "Zinc hydroxide and oxygen":
          "That confuses the acid with water and gives the wrong gas.",
        "Copper and water": "No copper-containing reactant is supplied.",
      },
      "Zn + 2HCl → ZnCl2 + H2. This is a suitable dilute non-oxidising acid case.",
      "Match the salt to hydrochloric acid.",
    ),
    c(
      "r-displace",
      "Compare the two metals",
      "When can an added metal displace another metal from its salt solution under suitable conditions?",
      "When the added metal is more reactive",
      {
        "When the added metal is less reactive":
          "This reverses the displacement rule.",
        "Whenever any metal is added":
          "Same-metal and reverse pairs do not give net displacement.",
      },
      "Compare the added metal with the dissolved metal, not the counterion.",
      "Added metal must be above dissolved metal.",
    ),
    c(
      "r-evidence",
      "Keep missing evidence missing",
      "Complete suitable tests show A displaces C and B displaces C. A and B have not been compared. What follows?",
      "Both are above C; A versus B is undetermined",
      {
        "A must be above B": "No A/B comparison establishes that.",
        "C must be above both":
          "The observed displacements establish the opposite.",
      },
      "The two edges place C below A and B but do not order A and B.",
      "Do not invent a missing comparison.",
    ),
  ],
  guided: [
    n(
      "g-series",
      "Order the metals",
      "Order Cu, Mg and Zn, most reactive first. What is Zn’s position (1–3)?",
      2,
      "position",
      "The order is Mg > Zn > Cu, so Zn is second. These are ordinal positions, not equal numerical reactivity gaps.",
      "Compare each metal’s position in the reference.",
      m(
        "series",
        "Move each tile with keyboard/touch buttons; changing the record changes the set to order.",
      ),
    ),
    c(
      "g-observations",
      "Predict the products",
      "Initial record: Mg reacts with dilute HCl at room temperature. Which product combination is correct?",
      "MgCl2 and H2",
      {
        "Mg(OH)2 and O2":
          "The reagent is hydrochloric acid, and the gas is hydrogen.",
        "Cu and H2O":
          "No copper is present, and neutralisation is not the supplied reaction.",
      },
      "Mg + 2HCl → MgCl2 + H2. Compare the separate water record before assuming every condition looks the same.",
      "Use salt + hydrogen for this suitable metal–acid case.",
      m(
        "observations",
        "Compare room-temperature water and dilute-HCl records; distinguish not detected from chemically impossible.",
      ),
    ),
    c(
      "g-displacement",
      "Predict the deposited metal",
      "Initial record: Zn metal is added to CuSO4 solution under suitable conditions. Which products form?",
      "ZnSO4 solution and Cu metal",
      {
        "Cu becomes Zn metal":
          "Displacement does not change one element into another.",
        "No displacement because Cu is above Zn":
          "Zn is above Cu in the supplied GCSE order.",
      },
      "Zn has the greater tendency to form positive ions. Cu becomes deposited metal; aqueous Zn2+ replaces Cu2+, while sulfate remains unchanged.",
      "Identify the added metal and the dissolved metal.",
      m(
        "displacement",
        "Change the metal pair, retain incorrect products and inspect conserved identities in actual 3D.",
      ),
    ),
    c(
      "g-evidence",
      "Link the observations",
      "Initial record: complete suitable tests show A displaces B and B displaces C. Which order follows?",
      "A > B > C",
      {
        "C > B > A": "This reverses both observed displacements.",
        "A and B cannot be compared":
          "The A/B comparison is explicitly supplied.",
      },
      "A > B and B > C imply A > B > C. Partial or conflicting records require different conclusions.",
      "Link the two comparisons.",
      m(
        "evidence",
        "Keep incomplete evidence partial and identify contradictory comparisons rather than force an order.",
      ),
    ),
    c(
      "g-fair",
      "Check the comparison",
      "Initial record: Mg powder 0.10 g gives 30 cm³ H2 in 10 s; Zn chips 1.00 g give 18 cm³ in 10 s in the same dilute HCl. Does this establish a fair reactivity comparison?",
      "No: metal masses and exposed areas are not controlled",
      {
        "Yes: any larger gas volume proves higher reactivity":
          "Amounts and surface conditions can affect the observation.",
        "Yes: final gas volumes must be equal":
          "The record gives progress at 10 s, not final yields.",
      },
      "Different masses and powder/chip surfaces confound the comparison. Interpret a supplied matched protocol before using rate as evidence.",
      "Check the comparison conditions before ranking.",
      m(
        "fair",
        "Compare an unfair trial, supplied matched observations and equal final yield without timing data.",
      ),
    ),
  ],
  practice: [
    c(
      "p-core",
      "Order a core subset",
      "Which order runs from most to least reactive?",
      "Mg > Zn > Fe > Cu",
      {
        "Cu > Fe > Zn > Mg": "That reverses the core order.",
        "Mg > Fe > Zn > Cu": "Zn is above Fe.",
      },
      "The supplied GCSE core order places Mg above Zn, then Fe, then Cu.",
      "Most to least is the stated direction.",
    ),
    c(
      "p-alkali",
      "Order the alkali metals",
      "Which room-temperature water reactivity order is correct for these three alkali metals?",
      "K > Na > Li",
      {
        "Li > Na > K": "That reverses the observed Group 1 trend.",
        "Na > K > Li": "K is above Na.",
      },
      "The AQA recalled water comparison is potassium, sodium, lithium from most to least reactive.",
      "For these Group 1 metals, reactivity increases down the group.",
    ),
    w(
      "p-full-order",
      "Recall the full core",
      "Write the AQA core metals K, Na, Li, Ca, Mg, Zn, Fe and Cu in most-to-least reactive order. Explain what more reactive means in this lesson.",
      "K > Na > Li > Ca > Mg > Zn > Fe > Cu. More reactive metals have a greater tendency to form positive ions; the list is an order, not a numerical scale.",
      [
        "Give all eight in the correct direction.",
        "Connect reactivity with positive-ion formation.",
        "Do not claim equally spaced numerical reactivity values.",
      ],
    ),
    n(
      "p-ion",
      "Count the ion charge",
      "A Mg ion has 12 protons and 10 electrons. Give its positive charge as a number.",
      2,
      "+",
      "12−10=2+. The element is still magnesium.",
      "Element identity depends on protons, not electron count.",
    ),
    c(
      "p-nonmetals",
      "Read the reference carefully",
      "Why are carbon and hydrogen sometimes placed in a reactivity series?",
      "They are useful nonmetal comparisons for extraction and acid reactions",
      {
        "They become metals when placed in the list":
          "A list does not change element classification.",
        "They prove every entry forms the same ion":
          "Different entries have different chemistry.",
      },
      "C and H are nonmetals used as comparison positions; detailed extraction is a separate lesson.",
      "A comparison list can include nonmetal reference points.",
    ),
    c(
      "p-acid-threshold",
      "Use the hydrogen position",
      "Given Fe > H > Cu, which metal can displace hydrogen from suitable dilute HCl?",
      "Fe",
      {
        Cu: "Cu is below H in this comparison.",
        "Both necessarily do": "Do not ignore the hydrogen position.",
      },
      "Iron is above hydrogen and reacts with suitable dilute HCl; copper does not produce hydrogen in this case.",
      "This claim concerns a suitable non-oxidising dilute acid.",
    ),
    c(
      "p-acid-gas",
      "Name the observed gas",
      "A supplied Zn + dilute HCl reaction evolves a gas. Which gas is the expected product?",
      "Hydrogen",
      {
        Oxygen: "Metal–dilute-HCl reaction produces H2, not O2.",
        "Carbon dioxide": "There is no carbon-containing reactant.",
      },
      "Zn + 2HCl → ZnCl2 + H2.",
      "Use the stated metal–acid reaction.",
    ),
    c(
      "p-calcium",
      "Interpret cold water",
      "A supplied Ca + room-temperature water record shows bubbles and a cloudy suspension. Which products explain this?",
      "Ca(OH)2 and H2",
      {
        "CaCl2 and O2": "No chloride is supplied and the gas is hydrogen.",
        "Ca metal and CO2": "That does not describe the reaction.",
      },
      "Ca + 2H2O → Ca(OH)2 + H2; limited hydroxide solubility can produce cloudiness.",
      "Match water to a hydroxide product.",
    ),
    c(
      "p-magnesium-water",
      "Interpret a short observation",
      "No obvious bubbles appear during a brief Mg + room-temperature water observation. Which conclusion is justified?",
      "The short observation does not rule out a very slow reaction",
      {
        "Mg cannot react with any reagent":
          "Mg reacts with suitable dilute acid.",
        "Mg must be less reactive than Cu":
          "A brief null water observation does not establish that order.",
      },
      "Reaction may be very slow or affected by surface film. Absence of a visible change over a short interval is not proof of zero reaction.",
      "Distinguish detection from chemical possibility.",
    ),
    c(
      "p-null-water",
      "Do not force a rank",
      "Zn, Fe and Cu all show no visible change in a short room-temperature water comparison. Can those observations alone rank all three?",
      "No: these null observations do not distinguish them",
      {
        "Yes: all three have exactly equal reactivity":
          "A shared short observation does not establish equality.",
        "Yes: Cu must be most reactive":
          "No supplied observation supports that.",
      },
      "Use other suitable comparisons, such as acid or salt-solution results, to distinguish these metals.",
      "Same visible outcome need not mean same reactivity.",
    ),
    c(
      "p-zinc-copper",
      "Use displacement direction",
      "Zn metal is added to CuSO4 solution under suitable conditions. Which metal forms as a solid product?",
      "Cu",
      {
        "Zn forms from Cu atoms": "Element identities cannot swap.",
        "No metal product forms": "Zn can displace Cu in this case.",
      },
      "Copper ions form copper metal; zinc atoms enter solution as Zn2+.",
      "The less reactive dissolved metal is deposited.",
    ),
    c(
      "p-reverse",
      "Test the reverse pair",
      "Cu metal is added to MgSO4 solution under suitable conditions. What is expected?",
      "No displacement",
      {
        "Mg metal forms": "Cu is less reactive than Mg.",
        "Cu changes into Mg": "No element transmutation occurs.",
      },
      "Cu cannot displace Mg from this salt solution.",
      "Added metal must be more reactive.",
    ),
    c(
      "p-iron",
      "Keep the supplied ion identity",
      "Fe metal displaces Cu from CuSO4 solution; the supplied dissolved iron product is Fe2+. Which salt is formed?",
      "FeSO4",
      {
        "Fe2(SO4)3": "That would require Fe3+, not the supplied Fe2+.",
        "CuSO4 is the new iron salt": "That formula still names copper.",
      },
      "One Fe2+ balances one SO4²−; Fe + CuSO4 → FeSO4 + Cu.",
      "Use the supplied Fe2+ charge.",
    ),
    c(
      "p-same",
      "Compare the same metal",
      "Cu metal is added to a CuSO4 solution. Is a net displacement predicted?",
      "No: added and dissolved metal are the same element",
      {
        "Yes: one Cu becomes Zn": "No zinc is present.",
        "Yes: every metal addition causes displacement":
          "A same-metal pair has no reactivity difference.",
      },
      "The rule requires an added more reactive metal, not merely a metal surface.",
      "Same-metal comparison has no direction of displacement.",
    ),
    c(
      "p-bounds",
      "Use both positive and negative outcomes",
      "Assume complete observable suitable tests: A displaces B, and A does not displace C. All three are different. What follows?",
      "C > A > B",
      {
        "A > C > B": "The completed A/C outcome places A below C.",
        "B > A > C": "That reverses both relations.",
      },
      "The stated complete outcomes imply A > B and C > A; hence C > A > B. Real short null observations need additional caution.",
      "Use the stated complete-test assumption.",
    ),
    c(
      "p-partial",
      "Recognise an incomplete order",
      "Complete suitable tests show P displaces R and Q displaces R, but P/Q is untested. What follows?",
      "P and Q are above R; their relative order is undetermined",
      {
        "P > Q > R must be true": "The P/Q comparison is missing.",
        "R > P > Q must be true":
          "R is below both from the supplied observations.",
      },
      "Two supported comparisons do not determine the missing one.",
      "Keep the unknown comparison unknown.",
    ),
    c(
      "p-temperature",
      "Use a supplied comparison criterion",
      "In a comparable experiment with the stated criterion that larger temperature rise indicates greater reactivity: Cu 0°C, Fe 11°C, Zn 19°C, Mg 37°C. Unknown X gives 25°C. Where does X fit among these reference metals?",
      "Between Mg and Zn",
      {
        "Between Fe and Cu": "25 is above the Zn result.",
        "Above Mg": "25 is below 37.",
      },
      "37 > 25 > 19, so Mg > X > Zn for this supplied comparison. This is not a universal numerical definition of reactivity.",
      "Use the given criterion and comparable conditions.",
    ),
    n(
      "p-rise",
      "Calculate the measured change",
      "A supplied comparison begins at 20°C and reaches 36°C. Calculate the temperature rise.",
      16,
      "°C",
      "36−20=16°C. The measured difference is used, not the final reading alone.",
      "Subtract initial temperature.",
    ),
    w(
      "p-controls",
      "Explain a valid comparison",
      "Unequal masses of metal powder and a large chip give different gas volumes after 10 s. Explain why this cannot rank reactivity and give suitable controls.",
      "Exposed area/state of division and metal amount differ, so gas progress may reflect those differences. Use a supplied comparable protocol with controlled metal mass/amount and exposed area, acid volume/concentration/initial temperature and observation interval before applying the stated comparison criterion.",
      [
        "Identify amount and surface confounding.",
        "Name suitable controls for comparable results.",
        "Do not certify the rank from this unfair observation.",
      ],
    ),
    w(
      "p-spectator",
      "Explain the particle change",
      "Explain Zn + CuSO4 → ZnSO4 + Cu in terms of the named metal atoms/ions and the sulfate ion. Explain why this is not one element changing into another.",
      "Zn atoms form dissolved Zn2+ while Cu2+ forms Cu metal. The intact SO4²− counterion remains unchanged. Zn stays Zn and Cu stays Cu; atomic constituents and total charge are conserved. Aqueous salts consist of separate ions, not CuSO4/ZnSO4 molecules.",
      [
        "Describe Zn entering solution and Cu depositing.",
        "Retain the sulfate spectator unchanged.",
        "Conserve elements and charge without calling the aqueous salt a molecule.",
      ],
    ),
    w(
      "p-final-gas",
      "Distinguish rate from yield",
      "Two supplied complete metal–acid reactions each produce 50 cm³ hydrogen. No times are recorded. Explain why equal final volumes do not prove equal reactivity.",
      "Final gas yield depends on available reacting quantities and stoichiometry, not just how quickly the reaction proceeds. Without comparable progress-versus-time evidence and controlled conditions, the observation does not rank reactivity.",
      [
        "Separate final quantity from rate.",
        "Identify missing timing/comparable evidence.",
        "Do not infer equal reactivity from equal final volume.",
      ],
    ),
  ],
  checkForms: [
    [
      c(
        "ca-bounds",
        "Fresh incomplete position",
        "Assume complete suitable tests: unknown P displaces Cu but does not displace Zn. Given Zn > Fe > Cu, which conclusion is justified?",
        "P is between Zn and Cu; P versus Fe is undetermined",
        {
          "Zn > P > Fe > Cu is proven": "No P/Fe comparison establishes that.",
          "P must be above Zn": "The completed Zn comparison says otherwise.",
        },
        "Zn > P > Cu is supported, but Fe may lie on either side of P.",
        "Identify the comparison that is missing.",
      ),
      c(
        "ca-water",
        "Fresh condition comparison",
        "A short Mg + room-temperature water record shows no visible gas; Mg + suitable dilute HCl shows gas. What is justified?",
        "The water record does not rule out slow reaction or reaction under different suitable conditions",
        {
          "Mg becomes a different element in acid":
            "Changing conditions does not transmute the metal.",
          "No bubbles in water proves complete unreactivity":
            "The acid result already contradicts that claim.",
        },
        "Observed progress depends on the reagent, interval and surface condition.",
        "Use the actual conditions of each record.",
      ),
      n(
        "ca-ion",
        "Fresh positive-ion count",
        "A supplied Fe ion has 26 protons and 24 electrons. Give its positive charge as a number.",
        2,
        "+",
        "26−24=2+. It remains iron.",
        "Compare charges, not neutron count.",
      ),
      c(
        "ca-pair",
        "Fresh reverse displacement",
        "Cu is added to FeSO4 solution under suitable conditions. Given Fe > Cu, what follows?",
        "No displacement",
        {
          "Fe metal must form": "The added Cu is lower in the given order.",
          "Cu atoms become Fe atoms": "Element identity is retained.",
        },
        "Cu cannot displace Fe from this case.",
        "Compare added with dissolved metal.",
      ),
      w(
        "ca-written",
        "Check fair conditions",
        "Dilute-HCl tests: A has an oxide-coated small area at 18°C; B a cleaned larger area at 30°C. B gives gas faster. Explain why this cannot rank their reactivity.",
        "Surface film, exposed area and temperature are uncontrolled, and each can affect observed progress. Comparable supplied trials must control relevant conditions and measure the same defined response before attributing the difference to metal identity.",
        [
          "Identify surface and temperature differences.",
          "Explain those can change observed rate.",
          "Require a comparable test before ranking.",
        ],
      ),
    ],
    [
      c(
        "cb-bounds",
        "Alternative incomplete position",
        "Assume complete suitable tests: unknown Q displaces Fe but does not displace Mg. Given Mg > Zn > Fe > Cu, what follows?",
        "Q is between Mg and Fe; Q versus Zn is undetermined",
        {
          "Mg > Zn > Q > Fe is proven": "No Q/Zn comparison establishes that.",
          "Q must be less reactive than Cu":
            "Q displaces Fe, which is above Cu.",
        },
        "Mg > Q > Fe follows, but Zn relative to Q is not determined.",
        "Do not insert an untested comparison.",
      ),
      c(
        "cb-water",
        "Alternative water products",
        "A supplied Ca + room-temperature water record shows gas and a cloudy hydroxide suspension. Which products fit?",
        "Ca(OH)2 and H2",
        {
          "CaSO4 and O2": "No sulfate is supplied, and the gas is hydrogen.",
          "Cu and H2O": "There is no copper reactant.",
        },
        "Ca + 2H2O → Ca(OH)2 + H2.",
        "Use the actual water reagent.",
      ),
      n(
        "cb-ion",
        "Alternative ion count",
        "A supplied Zn ion has 30 protons and 28 electrons. Give its positive charge as a number.",
        2,
        "+",
        "30−28=2+. The element remains zinc.",
        "Compare proton and electron charges.",
      ),
      c(
        "cb-pair",
        "Alternative forward displacement",
        "Mg metal is added to FeSO4 solution under suitable conditions. Given Mg > Fe, which products form?",
        "MgSO4 solution and Fe metal",
        {
          "No displacement": "The added Mg is above Fe.",
          "Mg atoms become Fe ions":
            "That would incorrectly change element identity.",
        },
        "Mg enters solution as Mg2+ while dissolved Fe2+ forms Fe metal.",
        "Identify the added and dissolved metals.",
      ),
      w(
        "cb-written",
        "Evaluate equal yield",
        "Two metals each give 80 cm³ hydrogen after complete reaction. No times or comparison controls are supplied. Evaluate the claim of equal reactivity.",
        "Equal final gas quantities do not establish equal reaction rate or positive-ion tendency. Reacting quantities and conditions may differ. Comparable timed observations with appropriate controls are needed before using the given rate criterion to rank the metals.",
        [
          "Distinguish final gas quantity from rate.",
          "Identify missing comparable timed observations.",
          "Reject the unsupported equality claim.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      c(
        "ra-pair",
        "Delayed displacement",
        "Given Mg > Fe, what happens when Mg is added to FeSO4 solution under suitable conditions?",
        "Fe metal forms and Mg enters solution",
        {
          "No displacement occurs": "Mg is above Fe.",
          "Mg changes into Fe": "Element identity is conserved.",
        },
        "Mg can displace Fe from this salt solution.",
        "Added more-reactive metal forms positive ions.",
      ),
      n(
        "ra-ion",
        "Delayed charge",
        "A Ca ion has 20 protons and 18 electrons. Give its positive charge as a number.",
        2,
        "+",
        "20−18=2+.",
        "Compare proton and electron charges.",
      ),
      c(
        "ra-partial",
        "Delayed partial evidence",
        "Complete suitable tests show R displaces S and T displaces S; R/T is untested. What follows?",
        "S is below both; R versus T is undetermined",
        {
          "R > T > S is proven": "No R/T comparison is given.",
          "S is above both": "That reverses the observed displacements.",
        },
        "Both edges point down to S but do not compare R and T.",
        "Keep the missing comparison missing.",
      ),
    ],
    [
      c(
        "rb-gas",
        "Other delayed gas",
        "A suitable dilute-HCl reaction with zinc produces which expected gas?",
        "Hydrogen",
        {
          Oxygen: "The expected product is H2.",
          "Carbon dioxide": "No carbon-containing reactant is supplied.",
        },
        "Zn + 2HCl → ZnCl2 + H2.",
        "Use the stated metal–acid case.",
      ),
      n(
        "rb-rise",
        "Other delayed change",
        "A supplied comparison goes from 22°C to 35°C. Find the temperature rise.",
        13,
        "°C",
        "35−22=13°C.",
        "Subtract the initial reading.",
      ),
      c(
        "rb-ions",
        "Other delayed mechanism",
        "What does greater metal reactivity mean in this GCSE comparison?",
        "Greater tendency to form positive ions",
        {
          "Greater tendency to become a different element":
            "No transmutation occurs.",
          "More neutrons always means greater reactivity":
            "Neutron count is not the supplied chemical criterion.",
        },
        "The comparison concerns forming metal cations, not changing nuclei.",
        "Connect reactivity with positive-ion formation.",
      ),
    ],
  ],
};
metalReactivityJourney.guided[0].openingHint = true;
for (const [from, to] of Object.entries({
  "p-alkali": "r-series",
  "p-magnesium-water": "r-acid",
  "p-reverse": "r-displace",
  "p-partial": "r-evidence",
})) {
  metalReactivityJourney.practice.find(
    (q) => q.id === `mr-v1-${from}`,
  )!.followUp = `mr-v1-${to}`;
}

import { extendReactivityWriting } from "./reactivity-writing";
extendReactivityWriting(metalReactivityJourney);
