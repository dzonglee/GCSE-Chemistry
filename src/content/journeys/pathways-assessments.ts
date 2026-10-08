import { c, n, w, draw } from "./pathways-tasks";
import type { PathwayTask as Task } from "./pathways-types";
export const checkForms: Task[][] = [
  [
    draw(
      "a-drawing",
      "Independent product construction",
      "The supplied three-carbon terminal alkene reacts with Br2. Construct the complete fully displayed product.",
      "propeneBr",
      "A single three-carbon chain with Br on C1 and C2, and C–H counts 2, 1, 3: C3H6Br2.",
      [
        "Retain all original C and H.",
        "C=C becomes C–C; one Br attaches to each original reacting carbon.",
        "Show all H and both Br individually; no polymer notation.",
      ],
    ),
    c(
      "a-condition",
      "Independent reaction conditions",
      "An industrial reaction converts ethene and water into ethanol. Which conditions fit?",
      "Heated steam, pressure and a phosphoric-acid catalyst",
      {
        "Hydrogen and nickel": "That produces ethane.",
        "Glucose and yeast": "That is a different starting material and route.",
      },
      "The industrial hydration reagent is steam and the catalyst is phosphoric acid.",
      "Identify the reagent and process.",
    ),
    c(
      "a-family",
      "Independent product classification",
      "A supplied addition product has formula C4H8I2 and no C=C. Which description fits?",
      "A saturated iodine-containing compound",
      {
        "An alkane hydrocarbon":
          "Iodine is present; this is not a hydrocarbon.",
        "An alkene": "The product has no double bond.",
      },
      "Saturation concerns bonds, while hydrocarbon concerns its elements.",
      "Check the product itself.",
    ),
    n(
      "a-unused",
      "Independent process accounting",
      "A schematic reactor receives fifteen ethene and twenty-three water molecules. Seven additions are reported. How many water molecules remain unreacted?",
      "16",
      "molecules",
      "23 − 7 = 16 water molecules remain; they were supplied in the feed.",
      "Each reported addition consumes one water molecule.",
    ),
    n(
      "a-mass",
      "Independent mass from a formula",
      "Find Mr of C3H6Br2 using Ar(C)=12, Ar(H)=1 and Ar(Br)=80.",
      "202",
      "relative molecular mass",
      "36 + 6 + 160 = 202.",
      "Count both Br atoms.",
    ),
    c(
      "a-feed",
      "Independent route selection",
      "Which starting material is used with yeast to make ethanol by fermentation?",
      "Aqueous glucose",
      {
        "Ethene under pressure": "That belongs to hydration.",
        "Ethanoic acid plus hydrogen":
          "That is not the stated fermentation route.",
      },
      "Suitable warm anaerobic fermentation of glucose forms ethanol and CO2.",
      "Identify the biological feed.",
    ),
    w(
      "a-explain",
      "Independent state-change explanation",
      "Explain why collected water after cooling excess-steam hydration is not evidence that the hydration reaction eliminates water.",
      "Water is a hydration reactant. Excess feed steam can remain unreacted and then physically condense in the cooler, so its presence does not show chemical elimination of a new water molecule.",
      [
        "Water is consumed as a reactant in hydration.",
        "Some excess steam can remain unused.",
        "Cooling is physical condensation, distinct from a chemical condensation reaction.",
      ],
      "Follow the feed and distinguish the two stages.",
    ),
  ],
  [
    draw(
      "b-drawing",
      "Independent internal-site construction",
      "The supplied four-carbon alkene has C=C between C2 and C3. It reacts with steam. Construct the alcohol with OH on C3, counting from the shown left end.",
      "internalWater",
      "Four-carbon single-bond chain with C–H counts 3, 2, 1, 3 and OH on C3. Equivalent reversed structures are valid.",
      [
        "Keep both original terminal methyl groups.",
        "Original C2=C3 becomes C2–C3; H adds at C2 and OH at C3.",
        "Show the O–H bond and every C–H individually; no repeat notation.",
      ],
    ),
    c(
      "b-condition",
      "Independent hydrogenation catalyst",
      "Which catalyst accompanies H2 in the stated conversion of an alkene to an alkane?",
      "Nickel",
      {
        Yeast: "Yeast belongs to fermentation.",
        "Phosphoric acid in industrial hydration":
          "That belongs to steam addition.",
      },
      "Hydrogen with nickel and suitable heating gives the alkane.",
      "Identify the supplied reagent.",
    ),
    c(
      "b-infer",
      "Independent reagent inference",
      "An alkene product retains all original C and H but contains two new Cl atoms across the former C=C. Which reagent supplied them?",
      "Cl2",
      {
        HCl: "It would supply one Cl and an additional H per molecule.",
        H2O: "It supplies no Cl.",
      },
      "One Cl2 contributes the two chlorine atoms in this addition.",
      "Compare original atoms with added atoms.",
    ),
    n(
      "b-unused",
      "Independent unreacted-feed count",
      "A model receives seventeen ethene and twenty-two water molecules and reports nine additions. How many ethene molecules remain?",
      "8",
      "molecules",
      "17 − 9 = 8; the remaining feed is not ethanol.",
      "Subtract the reported reaction count.",
    ),
    n(
      "b-mass",
      "Independent full-molecule mass",
      "Find Mr of the supplied C4H10O product using Ar(C)=12, Ar(H)=1 and Ar(O)=16.",
      "74",
      "relative molecular mass",
      "48 + 10 + 16 = 74; H10 includes any O–H hydrogen.",
      "Count all atoms in the formula.",
    ),
    c(
      "b-product",
      "Independent biological by-product",
      "Which separate small product accompanies ethanol in the stated yeast fermentation of glucose?",
      "Carbon dioxide",
      {
        Bromine: "No bromine-containing feed is present.",
        "Hydrogen as the defining fermentation by-product":
          "That is not the supplied ethanol-fermentation route.",
      },
      "Fermentation forms ethanol and CO2 under the stated conditions.",
      "Use the biological route.",
    ),
    w(
      "b-explain",
      "Independent carbon-source explanation",
      "Explain how ethanoic acid and ethanol supply the four carbon atoms in ethyl ethanoate.",
      "Two carbons come from ethanoic acid and two from ethanol. Both organic reactants contribute groups to the ester; water is the separate small product.",
      [
        "Two acid-derived C.",
        "Two alcohol-derived C.",
        "Ester plus separate water; no carbon atoms created from water.",
      ],
      "Trace both starting organic molecules.",
    ),
  ],
];
export const reviewForms: Task[][] = [
  [
    c(
      "d1-test",
      "Delayed bromine-water retrieval",
      "In the ordinary stated alkene test, what happens to orange bromine water?",
      "It becomes colourless",
      {
        "It must remain orange": "That is the negative saturated comparison.",
        "UV must first be supplied":
          "The ordinary alkene test does not require it.",
      },
      "Addition consumes the bromine at C=C.",
      "Recall the observation without opening the model.",
    ),
    n(
      "d1-flow",
      "Delayed reported-conversion accounting",
      "A reactor model receives eleven ethene and fourteen water molecules and reports five additions. How many ethanol molecules form?",
      "5",
      "molecules",
      "Five reported additions produce five ethanol molecules; the feed maximum is not the measured conversion.",
      "Use what actually reacted.",
    ),
    w(
      "d1-explain",
      "Delayed water-origin explanation",
      "Explain the difference between hydration consuming steam and unused steam condensing after cooling.",
      "Hydration chemically adds water across C=C to form an alcohol. Unused feed steam can physically change to liquid water on cooling without being a newly formed reaction by-product.",
      [
        "Chemical addition consumes water.",
        "Unused feed remains chemically water.",
        "Cooling changes state physically.",
      ],
      "Describe reactor and cooler separately.",
    ),
  ],
  [
    c(
      "d2-pair",
      "Delayed halogen atom conservation",
      "One I2 adds across a supplied alkene C=C. Which atom gain follows?",
      "Two I and no loss of original C or H",
      {
        "One I plus one H": "That is a different atom pair.",
        "Two I replace two original H":
          "That confuses addition with substitution.",
      },
      "Both iodine atoms are retained in the single addition product.",
      "Read the reagent formula and preserve the starting molecule.",
    ),
    n(
      "d2-mass",
      "Delayed molecular-mass retrieval",
      "Find Mr of the provided product C3H6Cl2 using Ar(C)=12, Ar(H)=1 and Ar(Cl)=35.5.",
      "113",
      "relative molecular mass",
      "36 + 6 + 71 = 113.",
      "Count both chlorine contributions.",
    ),
    w(
      "d2-explain",
      "Delayed route comparison",
      "Distinguish ethene + hydrogen from ethene addition polymerisation by feed and product extent.",
      "Hydrogenation adds H2 to one ethene, forming discrete ethane. Polymerisation joins many ethene monomers into a very large chain, with no separate small by-product in the stated addition.",
      [
        "H2 feed and discrete alkane.",
        "Many alkene monomers and a very large chain.",
        "Do not invent water loss in ordinary addition polymerisation.",
      ],
      "Track the material supplying the new attachments.",
    ),
  ],
];
