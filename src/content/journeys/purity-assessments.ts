import {
  choice as c,
  number as n,
  drawing as d,
  ratio,
  type PurityTask,
} from "./purity-tasks";
export const purityCheckForms: PurityTask[][] = [
  [
    c(
      "cA-compound",
      "Classify a complete source",
      "The complete source sample contains only NH₃ molecules. Which chemical classification is supported?",
      "A pure compound",
      {
        "A mixture":
          "Different elements inside a chemically combined molecule do not by themselves form a mixture.",
        "A pure element": "Nitrogen and hydrogen are two different elements.",
      },
      "One supplied compound is chemically pure.",
      "Count substances rather than element symbols.",
    ),
    c(
      "cA-label",
      "Interpret the label from given composition",
      "A water label says “pure: nothing added”. Supplied composition includes H₂O and dissolved sodium and hydrogencarbonate ions. Which interpretation fits?",
      "An everyday pure label on a chemical mixture",
      {
        "A chemically pure element":
          "Water is a compound, and additional dissolved substances are supplied.",
        "Chemically pure H₂O only":
          "The ions contradict an H₂O-only composition.",
      },
      "Nothing-added wording is the everyday meaning; the supplied chemical composition contains more than one substance.",
      "Read the given composition.",
    ),
    n(
      "cA-width",
      "Read unfamiliar measured temperatures",
      "The sample begins melting at 31.5 °C and finishes at 35.5 °C. What is its melting interval width?",
      "4",
      "°C",
      "35.5−31.5 =4.0 °C.",
      "Subtract the original readings.",
    ),
    c(
      "cA-interval",
      "Evaluate the reference comparison",
      "At the same stated conditions, pure U melts near 50 °C. The test sample melts from 45 °C to 48 °C, outside measurement uncertainty. What does the supplied comparison support?",
      "Possible impurities in the test sample",
      {
        "An exact identification of the contaminant":
          "The data do not name a contaminant.",
        "Proof that the test sample contains no other substance":
          "The interval differs from the stated pure reference.",
      },
      "The lower and wider interval supports possible impurity under the given comparison.",
      "Compare position and width.",
    ),
    n(
      "cA-recipe",
      "Apply the whole-recipe reference",
      "A 75 g formulation requires 10% ingredient K by mass. What mass of K is required?",
      "7.5",
      "g",
      "0.10×75 =7.5 g.",
      "Use the whole 75 g as the reference.",
    ),
    c(
      "cA-filtrate",
      "Follow dissolved material",
      "The supplied source is salt fully dissolved in water. An ordinary ideal filter retains no mother liquor. Where does the salt go?",
      "Through the paper with water as filtrate",
      {
        "It all remains as dry residue on the paper":
          "The material is fully dissolved, not supplied as solid grains.",
        "It changes chemically into water":
          "Physical filtration does not make a new substance.",
      },
      "Dissolved ions pass through ordinary paper with water.",
      "Use the stated physical state.",
    ),
    n(
      "cA-recovery",
      "Choose the recovery denominator",
      "20 g product was available. The collection contains 15 g product,4 g water and 3 g other material. What percentage of the available product is recovered?",
      "75",
      "%",
      "15÷20×100 =75%. Water and other material are not product.",
      "Use collected product, not the entire wet collection.",
    ),
    d(
      "cA-structure",
      "Construct a filtration proposal",
      "Independently use the supplied source to propose paper position, path, residue, filtrate and dissolved-material account. Identify whether the separation makes a new substance.",
      { mode: "filtration", record: "filterCheckA" },
      "The paper is in the funnel and flow passes through it. Insoluble Z remains as residue; water and dissolved salt pass as filtrate in the stated ideal case. Dissolved salt remains ions; this is a physical separation.",
      [
        "Place the paper and flow path consistently.",
        "Retain Z and pass water with dissolved salt.",
        "Preserve dissolved-material identity.",
        "Distinguish physical separation from chemical reaction.",
      ],
    ),
  ],
  [
    c(
      "cB-element",
      "Classify a different complete source",
      "The complete source sample contains only O₃ molecules. Which chemical classification is supported?",
      "A pure element",
      {
        "A compound":
          "Every atom in O₃ is oxygen. More than one atom does not establish different elements.",
        "A mixture": "Only one supplied substance is present.",
      },
      "Ozone is an elemental substance containing oxygen atoms only.",
      "Count element identities.",
    ),
    c(
      "cB-label",
      "Read a supplied everyday claim",
      "A juice label says “pure: unadulterated”. The supplied juice contains water, sugars and other substances. What does this support?",
      "An everyday pure label on a chemical mixture",
      {
        "Chemically one compound": "Several substances are listed.",
        "A pure element because it is natural":
          "Natural is not the definition of an element.",
      },
      "The supplied label describes unadulterated juice; its chemical composition remains a mixture.",
      "Use the given composition.",
    ),
    n(
      "cB-width",
      "Read a negative-temperature interval",
      "A sample begins melting at −9.5 °C and finishes at −4.5 °C. What is its interval width?",
      "5",
      "°C",
      "−4.5−(−9.5) =5.0 °C.",
      "Find the distance between the readings.",
    ),
    c(
      "cB-interval",
      "Evaluate a narrow reference match",
      "At the same stated conditions, the pure reference is 64 °C. The sample melts from 64.0 °C to 64.4 °C, with stated reading uncertainty ±0.4 °C. What is supported?",
      "The measured interval is consistent with the pure reference",
      {
        "A unique chemical identity is proved":
          "One measured property does not prove unique identity.",
        "Every molecule has changed into a new substance":
          "Melting is a physical state change.",
      },
      "The supplied interval is narrow near the reference; consistency is the bounded conclusion.",
      "Compare the entire interval with the stated conditions.",
    ),
    ratio(
      "cB-recipe",
      "Read a different ingredient ratio",
      "A supplied formulation contains 60% ingredient J and 40% ingredient K by mass. Give the simplest whole-number J:K mass ratio.",
      "J parts",
      "K parts",
      3,
      2,
      "60:40 simplifies by the common factor 20 to 3:2. Keep the stated order.",
      "Use the same factor for both entries.",
    ),
    c(
      "cB-method",
      "Collect a declared liquid product",
      "Water contains one nonvolatile solute, with no other volatile substances. You need water collected as a liquid separately. Which method fits?",
      "Simple distillation",
      {
        "Ordinary filtration":
          "The dissolved material passes with water through the paper.",
        "Evaporation with no collection":
          "The requested liquid water is not collected.",
      },
      "Vaporisation followed by condensation collects water while the stated nonvolatile solute remains behind.",
      "Follow the target product.",
    ),
    n(
      "cB-recovery",
      "Separate wet collection from product",
      "25 g product was available. The collection contains 20 g product and 6 g water. What percentage of available product is recovered?",
      "80",
      "%",
      "20÷25×100 =80%. The collection’s 26 g total is not 26 g product.",
      "Use the product component only.",
    ),
    d(
      "cB-structure",
      "Construct a solvent-collection proposal",
      "Independently propose how water reaches the receiver as liquid from the supplied source. Include the vapour, cooling-water direction, endpoint flask material and type of separation.",
      { mode: "distillation", record: "distilCheckB" },
      "The original flask contains the solution. Water vapour travels through the cooled inner tube and condenses into liquid water in the receiver. Cooling water enters the lower jacket port and leaves the upper one. Nonvolatile X remains in the original flask at the stated ideal endpoint. No new substance is made.",
      [
        "Retain the original solution and nonvolatile X.",
        "Follow water as gas then condensed liquid through the inner tube.",
        "Place cooling-water flow in the outer jacket, lower port to upper.",
        "Keep endpoint materials and identify physical separation.",
      ],
    ),
  ],
];
export const purityReviewForms: PurityTask[][] = [
  [
    c(
      "rA-pressure",
      "Review the conditions",
      "A water sample boils at 97 °C, but its pressure was not recorded. Can comparison with 100 °C at 101 kPa establish chemical impurity?",
      "No; the required comparison conditions are missing",
      {
        "Yes; any temperature other than 100 °C proves impurity":
          "Boiling temperature depends on pressure.",
        "It establishes chemically pure water":
          "The incomplete comparison cannot establish that.",
      },
      "The missing pressure makes this comparison inconclusive.",
      "Check the conditions.",
    ),
    n(
      "rA-recipe",
      "Review a fresh ingredient allocation",
      "A 160 g formulation requires 12.5% ingredient A by mass. What mass is needed?",
      "20",
      "g",
      "0.125×160 =20 g.",
      "12.5% is one eighth of the whole.",
    ),
    d(
      "rA-structure",
      "Reconstruct a fresh filtration proposal",
      "Without a worked model, propose the filter-paper position, flow path, residue and filtrate for the supplied source. Preserve the original chemical identities.",
      { mode: "filtration", record: "filterReview" },
      "Paper is in the funnel and the flow passes through it. Z remains as residue; water and dissolved salt form the filtrate under the stated ideal condition. No chemical reaction is needed.",
      [
        "Show consistent paper position and path.",
        "Keep insoluble Z as residue.",
        "Pass water and dissolved ions as filtrate; no new substance is made.",
      ],
    ),
  ],
  [
    c(
      "rB-element",
      "Review one supplied element",
      "The complete source contains only neon atoms. Which classification fits?",
      "A pure element",
      {
        "A mixture because there are many atoms":
          "Many atoms of one supplied element do not form different substances.",
        "A compound":
          "No different elements are chemically combined in the supplied source.",
      },
      "One elemental substance without another substance is chemically pure.",
      "Count different identities.",
    ),
    n(
      "rB-width",
      "Review a decimal interval",
      "Melting begins at 10.4 °C and finishes at 11.6 °C. What is the interval width?",
      "1.2",
      "°C",
      "11.6−10.4 =1.2 °C.",
      "Subtract the original readings.",
    ),
    d(
      "rB-structure",
      "Reconstruct a fresh solvent-collection proposal",
      "Without a worked model, propose the material path, cooling-water direction and endpoint outputs for the supplied nonvolatile-solute source.",
      { mode: "distillation", record: "distilReview" },
      "Water vaporises, travels through the inner tube, condenses and is collected as liquid. Lower-to-upper cooling-water flow fills the jacket. Nonvolatile X remains in the original flask at the stated ideal endpoint. This is physical separation.",
      [
        "Follow water from solution to gas to collected liquid.",
        "Keep cooling water in the outer jacket, lower to upper port.",
        "Retain X in the original flask; no new substance is made.",
      ],
    ),
  ],
];
