import {
  choice as c,
  number as n,
  ratio,
  type PurityTask,
} from "./purity-tasks";
export const purityWarmup: PurityTask[] = [
  c(
    "w-substance",
    "Count substances, not element symbols",
    "A complete sample contains only carbon dioxide molecules. How many different substances are supplied?",
    "One",
    {
      Two: "Carbon and oxygen are different elements chemically combined inside one compound.",
      Three:
        "The three atoms in each molecule are not three different substances.",
    },
    "Carbon dioxide is one compound. A sample containing only that compound is chemically pure.",
    "Count chemical identities.",
  ),
  n(
    "w-difference",
    "Measure a temperature interval",
    "Two readings are 24 °C and 28 °C. What is their difference?",
    "4",
    "°C",
    "28 −24 =4 °C. The difference is not either endpoint temperature.",
    "Subtract the earlier lower reading from the later higher reading.",
  ),
  c(
    "w-solubility",
    "Dissolved and insoluble are different",
    "A mixture contains insoluble sand and fully dissolved salt in water. Which material is an ordinary filter able to retain as solid grains?",
    "Sand",
    {
      "Dissolved salt":
        "Dissolved ions move with the water through ordinary filter paper.",
      "All the water": "The liquid passes through filter paper.",
    },
    "The insoluble grains remain as residue; water and dissolved material form the filtrate.",
    "Use the stated physical properties.",
  ),
];
export const purityRefreshers: PurityTask[] = [
  ratio(
    "r-ratio",
    "Simplify ingredient proportions",
    "A mixture contains 75% yellow dye and 25% blue dye by mass. Give the simplest whole-number yellow:blue mass ratio.",
    "Yellow parts",
    "Blue parts",
    3,
    1,
    "75:25 divides by the common factor 25 to give 3:1. Divide both entries by the same factor and keep their order.",
    "Use a common factor for both entries.",
  ),
  c(
    "r-definition",
    "Use chemical purity",
    "Which complete composition describes a chemically pure substance?",
    "Only one element or one compound",
    {
      "Any material with a natural label":
        "Everyday natural/unadulterated wording does not establish one chemical substance.",
      "Any mixture that is clear": "Dissolved substances can be invisible.",
    },
    "Chemical purity is about the substances present, not the number of elements inside a compound or the appearance.",
    "Count different substances.",
  ),
  c(
    "r-label",
    "Read an everyday pure label",
    "A milk label says “nothing added”. Supplied composition includes water, fat and sugars. What does that label mean here?",
    "Unadulterated, not chemically one substance",
    {
      "Only H₂O is present":
        "The given composition includes several substances.",
      "The milk is a pure element": "Milk is not one element.",
    },
    "Everyday “pure” can mean nothing added or natural. The stated milk is chemically a mixture.",
    "Read both the wording and the supplied composition.",
  ),
  c(
    "r-interval",
    "Compare a melting interval",
    "In a controlled comparison, pure S melts near 60 °C. A sample begins at 54 °C and finishes at 58 °C. What does the lower, wider interval support?",
    "The sample may contain impurities",
    {
      "The contaminant must be copper":
        "These readings do not identify a particular contaminant.",
      "It proves the sample contains no other substance":
        "The supplied interval is inconsistent with the pure reference.",
    },
    "Impurity commonly depresses and broadens melting behaviour in the stated comparison. Keep the conclusion within the data.",
    "Compare the interval with the reference, not just its last reading.",
  ),
  n(
    "r-width",
    "Subtract temperature positions",
    "A sample begins melting at −4 °C and finishes at −1 °C. What is its interval width?",
    "3",
    "°C",
    "−1 −(−4) =3 °C. Its negative-temperature positions are three degrees apart.",
    "Count from −4 to −1.",
  ),
  c(
    "r-reference",
    "Separate identity from purity",
    "A sample has a narrow melting interval near 90 °C. The stated reference for claimed substance T is 70 °C. Which conclusion is justified?",
    "The sample does not match T’s stated reference",
    {
      "Every sharp melting point identifies T":
        "Different substances can have different sharp melting points.",
      "The sample must contain exactly two substances":
        "These readings do not determine the number or identities of contaminants.",
    },
    "Sharpness and identity matching are different checks. The supplied narrow interval does not match the claimed reference.",
    "Check where the interval lies as well as its width.",
  ),
  c(
    "r-pressure",
    "Keep boiling conditions comparable",
    "Why should boiling temperatures be compared at the same pressure?",
    "Pressure affects boiling temperature",
    {
      "Pressure changes water into a different element":
        "A boiling-temperature change is not an element change.",
      "All pure liquids must boil at 100 °C":
        "Different substances have different boiling points;100 °C is not universal.",
    },
    "Use references at matching stated conditions. Temperature alone without pressure can leave the comparison inconclusive.",
    "Read the conditions attached to each number.",
  ),
  c(
    "r-formulation",
    "Recognise deliberate product design",
    "Which feature establishes a formulation in the supplied account?",
    "Ingredients are deliberately mixed in measured proportions for useful properties",
    {
      "Any accidental mixture is a formulation":
        "A mixture is not automatically a designed product.",
      "Its ingredients must chemically react to form one compound":
        "A formulation is a designed mixture.",
    },
    "Ingredient purposes and carefully measured amounts are central to formulation design.",
    "Look for purpose and measured composition.",
  ),
  n(
    "r-percent",
    "Apply a recipe percentage",
    "A supplied recipe requires 20% component A by mass in 150 g total. How much A is needed?",
    "30",
    "g",
    "0.20×150 =30 g. The denominator is the whole formulation mass.",
    "Find one fifth of 150 g.",
  ),
  c(
    "r-target",
    "State what you want to recover",
    "From a salt solution, you need water collected as a liquid in a separate vessel. Why is evaporation without collection unsuitable?",
    "The water leaves but is not collected as the requested liquid product",
    {
      "Evaporation chemically destroys the water":
        "Water changes state; its atoms do not disappear.",
      "An ordinary filter would retain every dissolved ion":
        "Dissolved ions pass through an ordinary filter with water.",
    },
    "Choosing a method depends on the target product. Vaporisation followed by collection/condensation recovers the solvent.",
    "Follow the water through the process.",
  ),
  c(
    "r-filter",
    "Name the filter outputs",
    "What is the correct pair of output names for ordinary filtration?",
    "Residue remains on the filter; filtrate passes through",
    {
      "Filtrate remains on the filter; residue passes through":
        "Those names are reversed.",
      "Both outputs must be chemically pure":
        "Retained mother liquor and other dissolved material can contaminate samples.",
    },
    "These names identify where material ends up, not a guarantee of purity.",
    "Associate residue with retained material.",
  ),
  c(
    "r-mother",
    "Account for retained mother liquor",
    "Why can filtered sand still contain salt when the salt dissolved in the source water?",
    "Some salt solution can remain with the damp sand",
    {
      "The filter chemically turns sand into salt":
        "Physical filtration does not make a new substance.",
      "Dissolved ions are always trapped by ordinary filter pores":
        "Dissolved salt generally passes with the water; retained liquid can still remain in a damp residue.",
    },
    "Mother liquor is solution retained around the solid. Washing and drying are distinct processes.",
    "Consider the liquid left with the solid.",
  ),
  c(
    "r-crystals",
    "Choose a crystal-forming route",
    "A supplied solid is much less soluble in cold water than hot water. You want crystals from its solution. Which property supports concentration then cooling?",
    "Solubility decreases as the solution cools",
    {
      "The solid must become a gas":
        "Crystal formation retains the solid substance rather than requiring it to vaporise.",
      "Ordinary filtration removes all dissolved material immediately":
        "Dissolved material first needs to form solid crystals.",
    },
    "Concentrating then cooling can produce crystals when the supplied solubility decreases sufficiently.",
    "Use the given hot-versus-cold solubility.",
  ),
  n(
    "r-recovery",
    "Use the available product reference",
    "From 12 g available product,9 g product is collected. What percentage is recovered?",
    "75",
    "%",
    "9÷12×100 =75%. Uncollected product is not destroyed matter.",
    "Use available product as the denominator.",
  ),
  n(
    "r-purity",
    "Use the whole collected-sample reference",
    "A collected sample contains 6 g product and 2 g other material. What percentage of the collected sample’s mass is product?",
    "75",
    "%",
    "Total collected mass =6+2 =8 g. Product fraction =6÷8×100 =75%. This does not state its recovery from the source.",
    "Include the contaminant in the collected mass denominator.",
  ),
];
