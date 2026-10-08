import {
  choice as c,
  number as n,
  written as w,
  drawing as d,
  ratio,
  type PurityTask,
} from "./purity-tasks";
export const purityPractice: PurityTask[] = [
  c(
    "p-element",
    "A pure molecular element",
    "The complete source sample contains only O₂ molecules. How should it be classified?",
    "A pure element",
    {
      "A compound":
        "Both atoms in O₂ belong to oxygen; a compound contains different elements chemically combined.",
      "A mixture": "The given complete sample contains one substance.",
    },
    "Molecules can belong to an element. Only oxygen is supplied.",
    "Count different element identities inside each molecule.",
    { mode: "identity", record: "oxygen", focus: "category" },
  ),
  c(
    "p-compound",
    "Different atoms in one substance",
    "A complete sample contains H₂O molecules only. Which classification is supported?",
    "A pure compound",
    {
      "A mixture of hydrogen and oxygen":
        "The atoms are chemically combined in one compound, not supplied as uncombined gases.",
      "A pure element": "Two different elements are combined inside H₂O.",
    },
    "A compound containing different elements is still one substance.",
    "Count different substances, not atom colours.",
    { mode: "identity", record: "water", focus: "category" },
  ),
  c(
    "p-mixture",
    "Uncombined gases",
    "The complete source contains N₂ and O₂ molecules together. Neither changes chemical identity. What is supplied?",
    "A mixture",
    {
      "A new compound":
        "No chemical combination into a new substance is supplied.",
      "A pure element": "Two different elemental substances are present.",
    },
    "A mixture can contain more than one element or compound without chemical reaction.",
    "Keep the original molecular identities.",
    { mode: "identity", record: "air", focus: "category" },
  ),
  c(
    "p-milk",
    "Interpret the everyday wording",
    "The milk label says “nothing added”. The stated composition includes water, sugars and fats. Which interpretation is supported?",
    "Everyday pure, but chemically a mixture",
    {
      "Chemically one compound": "Several different substances are listed.",
      "Chemically one element": "Milk is not an element.",
    },
    "Nothing-added wording does not replace the supplied chemical composition.",
    "Use the stated meanings rather than the label alone.",
  ),
  w(
    "p-water-label",
    "Explain a purity claim",
    "Water sold as “pure: in its natural state” contains dissolved sodium and chloride ions. Explain the everyday meaning and why the supplied water is not chemically pure.",
    "The label uses everyday pure to mean natural or unadulterated. The supplied sample contains water plus dissolved ions, so it is a mixture rather than only one element or compound.",
    [
      "Explain the natural/unadulterated meaning in the stated label.",
      "Identify water and the additional dissolved material.",
      "Distinguish this from chemical purity; clear appearance or safety does not establish one substance.",
    ],
    "Separate the label’s wording from its composition.",
  ),
  n(
    "p-narrow-width",
    "Keep a measured decimal interval",
    "A sample begins at 84.8 °C and finishes at 85.2 °C. What is its melting interval width?",
    "0.4",
    "°C",
    "85.2 −84.8 =0.4 °C. Do not round both endpoints to 85 before subtracting.",
    "Subtract the original supplied readings.",
    { mode: "melting", record: "other", focus: "width" },
  ),
  c(
    "p-melt-match",
    "State what matching data support",
    "The supplied solid R melts from 51.8 °C to 52.2 °C, near its 52 °C pure reference with stated reading uncertainty ±0.2 °C. Which conclusion is supported?",
    "Its measured interval is consistent with the pure reference",
    {
      "This proves a unique chemical identity":
        "Another substance could share similar measured properties.",
      "A natural label is required for chemical purity":
        "The comparison uses measured behaviour and a reference, not everyday branding.",
    },
    "These measurements support the reference comparison without proving identity by themselves.",
    "Compare position and width.",
    { mode: "melting", record: "narrow", focus: "conclusion" },
  ),
  c(
    "p-melt-broad",
    "Interpret lower, wider behaviour",
    "Pure P’s reference is 80 °C. Under the supplied controlled conditions, the sample melts from 75 °C to 78 °C. What does the interval support?",
    "Possible impurities in the sample",
    {
      "It establishes exactly which impurity is present":
        "The readings do not identify the contaminant.",
      "It establishes no other substance is present":
        "The lower, wider interval differs from the pure reference.",
    },
    "The supplied lower and broader interval supports impurity. It is not a unique identification test.",
    "Use the whole interval.",
    { mode: "melting", record: "depressed", focus: "conclusion" },
  ),
  c(
    "p-incomplete",
    "Do not invent a completion reading",
    "The start of melting was recorded but the finish was not. Can this record establish a sharp complete melting interval?",
    "No; the completion reading is missing",
    {
      "Yes; the start and finish must be equal":
        "That silently invents an unmeasured endpoint.",
      "Yes; the sample must be an element":
        "These observations do not establish its elemental composition.",
    },
    "A start alone does not provide the interval width or establish a sharp complete transition.",
    "Identify what was actually measured.",
    { mode: "melting", record: "incomplete", focus: "conclusion" },
  ),
  c(
    "p-boil-match",
    "Use a stated-pressure reference",
    "A sample boils at 100 °C and 101 kPa. The supplied pure-water reference is 100 °C at 101 kPa, with measurement uncertainty 0.3 °C. What is supported?",
    "The boiling result is consistent with the supplied water reference",
    {
      "The reading proves that all impurities are absent":
        "One measured property does not establish complete absence of every impurity.",
      "The temperature proves there are no microbes":
        "Boiling-point evidence and microorganism testing are different.",
    },
    "The given same-pressure comparison is consistent; do not turn it into a universal purity or safety certificate.",
    "Compare the same measured quantity under the same conditions.",
    { mode: "boiling", record: "match", focus: "conclusion" },
  ),
  c(
    "p-boil-salt",
    "Read the changed boiling result",
    "At the same 101 kPa pressure, a sample containing nonvolatile dissolved material boils at 103 °C. Pure water’s supplied reference is 100 °C. Which conclusion is supported?",
    "The result is inconsistent with the supplied pure-water reference",
    {
      "It proves the solute is sodium chloride":
        "Many dissolved substances can affect boiling behaviour.",
      "Pressure mismatch alone explains the difference":
        "The stated pressures are the same.",
    },
    "The sample does not match the pure-water boiling reference under the given conditions. The temperature alone does not uniquely name its solute.",
    "Use both the pressure and the given nonvolatile-solute condition.",
    { mode: "boiling", record: "salt", focus: "conclusion" },
  ),
  c(
    "p-boil-missing",
    "Missing conditions limit the inference",
    "A sample boils at 98 °C, but its pressure was not recorded. The supplied water reference is 100 °C at 101 kPa. What can be concluded from this comparison?",
    "The conditions are insufficient for this purity comparison",
    {
      "The two-degree difference proves an impurity":
        "Pressure can also change boiling temperature.",
      "The sample must be chemically pure":
        "An incomplete comparison cannot establish that.",
    },
    "Record pressure before relying on the boiling-reference comparison.",
    "Check whether the conditions match.",
    { mode: "boiling", record: "missing", focus: "conclusion" },
  ),
  ratio(
    "p-ingredient-ratio",
    "Use the given ingredient order",
    "An ink mixture contains 65% yellow dye and 35% blue dye by mass. Give the simplest whole-number yellow:blue mass ratio.",
    "Yellow parts",
    "Blue parts",
    13,
    7,
    "65:35 divides by the common factor 5 to give 13:7. Both entries must use the same factor; 26:14 is equivalent but is not simplest.",
    "Simplify both original entries by their common factor.",
  ),
  n(
    "p-pigment",
    "Use the formulation whole",
    "The supplied 400 g paint recipe requires 25% pigment by mass. What pigment mass is needed?",
    "100",
    "g",
    "0.25×400 =100 g pigment. The binder and carrier are separate measured ingredients.",
    "Use one quarter of the whole 400 g.",
    { mode: "formulation", record: "paint", focus: "amount0" },
  ),
  n(
    "p-fragrance",
    "Read a third ingredient proportion",
    "The supplied 250 g cleaning formulation requires 2% fragrance by mass. What fragrance mass is needed?",
    "5",
    "g",
    "0.02×250 =5 g. The purpose and required proportion are supplied; no proprietary ingredient name is needed.",
    "Apply 2% to 250 g.",
    { mode: "formulation", record: "cleaner", focus: "amount2" },
  ),
  c(
    "p-accidental",
    "Do not classify every mixture as a formulation",
    "Yellow and blue dye solutions were accidentally mixed. Their amounts were measured afterwards, but no useful product was deliberately designed. How should the supplied account be classified?",
    "A mixture, without evidence of formulation design",
    {
      "A designed formulation just because quantities can be measured":
        "Measured composition after an accident does not establish purposeful product design.",
      "A pure compound because the mixture has one colour":
        "Appearance is not the number of chemical substances.",
    },
    "A formulation is a deliberately designed useful mixture; the stated accident lacks that design.",
    "Look for purpose and deliberate measured mixing.",
    { mode: "formulation", record: "accidental", focus: "category" },
  ),
  c(
    "p-sand-method",
    "Recover a stated insoluble solid",
    "Sand grains are insoluble in water and larger than the supplied filter pores. You need sand collected on the supplied filter paper without heating. Which method fits this request?",
    "Filtration",
    {
      "Simple distillation only":
        "That primarily collects the volatile liquid; it is not the stated solid-retention method.",
      "Ordinary filtration chemically changes the sand":
        "Filtration uses physical differences and does not make a new substance.",
    },
    "The filter retains the insoluble grains as residue.",
    "Use the stated target and grain properties.",
    { mode: "method", record: "sand", focus: "method" },
  ),
  c(
    "p-crystal-method",
    "Produce crystals by cooling",
    "The supplied solute is much less soluble in cold water. You want crystals formed by cooling a concentrated solution. Which method fits this target?",
    "Crystallisation",
    {
      "Filtration of the original fully dissolved solution":
        "The solute must first form solid crystals before a filter can collect them.",
      "Simple distillation to collect water":
        "That names a different target product.",
    },
    "The supplied solubility change supports crystallisation from the concentrated solution.",
    "Match the target state and solubility property.",
    { mode: "method", record: "crystals", focus: "method" },
  ),
  c(
    "p-fractional-method",
    "Use the given improvement in separation",
    "In the supplied ideal comparison, close-boiling miscible liquids separate better with repeated vaporisation and condensation in a column. Which method uses this?",
    "Fractional distillation",
    {
      "Ordinary filtration":
        "Both liquids pass through an ordinary filter; they are not retained insoluble grains.",
      "Evaporation with no collection":
        "That does not collect separate liquid fractions.",
    },
    "A fractionating column supports repeated vaporisation and condensation. Do not infer perfectly pure output without evidence.",
    "Identify the role of the column.",
    { mode: "method", record: "liquids", focus: "method" },
  ),
  d(
    "p-distil-draw",
    "Propose solvent collection",
    "Use the supplied nonvolatile-solute source to construct a simple-distillation proposal. Identify the original feed, vapour, cooling-water direction, collected liquid, endpoint flask material and type of process.",
    { mode: "distillation", record: "distilPractice" },
    "The original flask contains the solution. Water forms the vapour, cools and condenses into the receiver as liquid water. Cooling water enters the lower condenser port and leaves the upper port. Nonvolatile solute remains in the original flask at the stated ideal endpoint. This is physical separation.",
    [
      "Keep the original source identities.",
      "Follow water as vapour then condensed liquid through the apparatus.",
      "Connect cooling water from lower to upper port so the jacket remains filled.",
      "Retain nonvolatile solute in the original flask and distinguish physical separation from reaction.",
    ],
  ),
  n(
    "p-undissolved",
    "Do not send undissolved salt through automatically",
    "The supplied feed contains 3 g salt; only 2 g has dissolved. The ideal filter retains sand and undissolved salt but no mother liquor. How much salt is in the residue?",
    "1",
    "g",
    "3−2 =1 g salt remains undissolved and is retained. The 2 g dissolved portion passes with water.",
    "Separate the dissolved portion from the whole salt input.",
    { mode: "filtration", record: "incomplete", focus: "residueSalt" },
  ),
  n(
    "p-damp-filtrate",
    "Conserve salt across the outputs",
    "The source contains 4 g fully dissolved salt. The supplied damp residue retains 0.2 g salt in mother liquor. How much salt is in the filtrate?",
    "3.8",
    "g",
    "4−0.2 =3.8 g salt passes in the filtrate. Both outputs together retain the original 4 g salt.",
    "Subtract the retained portion from the total input.",
    { mode: "filtration", record: "damp", focus: "filtrateSalt" },
  ),
  d(
    "p-filter-draw",
    "Propose a filtration arrangement",
    "Use the original supplied mixture. Construct a filter-paper position, flow path, residue and filtrate composition. Account for dissolved salt and identify whether a new substance is formed.",
    { mode: "filtration", record: "filterPractice" },
    "Filter paper is placed in the funnel and the mixture flows through it. The insoluble sand remains as residue; water with dissolved salt is the filtrate in this ideal no-mother-liquor case. Sodium chloride is dissolved as ions, not separate salt molecules or new water. The separation is physical.",
    [
      "Place the paper in the funnel and direct flow through it.",
      "Keep insoluble solid as residue and water plus dissolved salt as filtrate.",
      "Preserve dissolved-material identity and distinguish ions from invented salt molecules.",
      "No new substance is made.",
    ],
  ),
  n(
    "p-product-recovery",
    "Recover product from a known source",
    "10 g product was available and 8 g dry product was collected, with no supplied contamination. What percentage of the available product is recovered?",
    "80",
    "%",
    "8÷10×100 =80%. Its collected-sample product fraction is 100%, which is a different denominator.",
    "Use the original available product mass.",
    { mode: "recovery", record: "dry", focus: "recovery" },
  ),
  n(
    "p-collected-mass",
    "Account for the whole wet collection",
    "A collection contains 8 g product and 3 g water. What is its total collected mass?",
    "11",
    "g",
    "8+3 =11 g. Treating all 11 g as product would overstate product recovery.",
    "Add the material that is actually in the collection.",
    { mode: "recovery", record: "wet", focus: "collectionMass" },
  ),
];
