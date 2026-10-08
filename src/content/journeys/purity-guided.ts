import { choice as c, number as n, type PurityTask } from "./purity-tasks";
export const purityGuided: PurityTask[] = [
  c(
    "g-interval",
    "Melting interval",
    "Mark both temperatures, find the width and compare.",
    "The readings are consistent with the pure P reference",
    {
      "The sample is definitely a unique substance":
        "A matching interval supports the reference comparison; this measurement alone does not establish a unique chemical identity.",
      "The sample must be impure because two readings differ":
        "The supplied 79.8–80.2 °C interval is narrow at the reference, within the stated ±0.2 °C reading uncertainty.",
    },
    "The narrow measured interval matches the stated reference within the stated ±0.2 °C reading uncertainty. Keep the comparison separate from proving identity.",
    "Place each mark from its original reading; compare the entire interval.",
    { mode: "melting", record: "matching", focus: "all" },
  ),
  n(
    "g-width",
    "Measure the interval width",
    "Solid Q begins melting at −10 °C and finishes at −7 °C. What is its melting interval width?",
    "3",
    "°C",
    "Width = finish − start = −7 − (−10) = 3 °C. A width is positive; −10 °C is a position, not the width.",
    "Count the separation between the two readings.",
    { mode: "melting", record: "negative", focus: "width" },
  ),
  c(
    "g-compound",
    "One compound can contain two elements",
    "The supplied sample contains only H₂O molecules. Is it a pure element, a pure compound, or a mixture?",
    "A pure compound",
    {
      "A mixture":
        "Hydrogen and oxygen are chemically combined inside one compound. More than one element inside that compound is not a mixture.",
      "A pure element":
        "H₂O contains atoms of two different elements chemically combined.",
    },
    "One compound, without another substance mixed in, is chemically pure.",
    "Count different substances, not different element symbols.",
    { mode: "identity", record: "water", focus: "category" },
  ),
  n(
    "g-ingredient",
    "Allocate a formulation ingredient",
    "A 200 g ink formulation requires 85% yellow dye and 15% blue dye by mass. What mass of yellow dye is needed?",
    "170",
    "g",
    "85% of 200 g =0.85×200 =170 g. The other 30 g is blue dye, and both masses must total 200 g.",
    "Use the whole formulation mass as the percentage reference.",
    { mode: "formulation", record: "ink", focus: "amount0" },
  ),
  c(
    "g-solvent",
    "Recover liquid water",
    "The supplied solution contains water and nonvolatile sodium chloride, with no other volatile solutes. Use a condenser with no fractionating column to collect liquid water separately. Which method fits?",
    "Simple distillation",
    {
      Filtration:
        "Dissolved ions pass through ordinary filter paper with the water.",
      "Evaporation without collection":
        "That removes water from the vessel but does not collect it as a liquid product.",
    },
    "Water vaporises and then condenses into the receiver; the nonvolatile salt remains behind under the stated conditions.",
    "Identify the requested product and follow its change of state.",
    { mode: "method", record: "water", focus: "method" },
  ),
  n(
    "g-filter-salt",
    "Follow dissolved salt",
    "All 2 g of salt is dissolved in the supplied sand–salt–water mixture. The ideal filter retains sand and no mother liquor. How much salt is in the filter residue?",
    "0",
    "g",
    "Dissolved salt passes with the water. The ideal residue contains the 8 g insoluble sand and no salt.",
    "Distinguish dissolved material from retained solid grains.",
    { mode: "filtration", record: "complete", focus: "residueSalt" },
  ),
  n(
    "g-damp-salt",
    "A damp residue can retain solution",
    "The supplied result says the damp sand retains 2 g water and 0.2 g dissolved salt as mother liquor. How much salt contaminates this residue?",
    "0.2",
    "g",
    "The retained 0.2 g dissolved salt remains with the damp sand. Filtration did not turn it into a different substance or guarantee pure sand.",
    "Use the stated retained mother liquor; do not assume the residue is perfectly dry.",
    { mode: "filtration", record: "damp", focus: "residueSalt" },
  ),
  n(
    "g-wet-purity",
    "Separate product fraction from recovery",
    "From 10 g available salt, 8 g salt is collected with 3 g water. What percentage of the collected sample’s mass is salt? Give the result to the nearest 0.1%.",
    "72.7",
    "%",
    "Collected mass =8+3 =11 g. Salt fraction =8÷11×100 =72.7%. Product recovery instead uses the original 10 g reference and is 80.0%.",
    "Use all material in the collected sample as this denominator.",
    { mode: "recovery", record: "wet", focus: "purity" },
  ),
  c(
    "g-pressure",
    "Compare boiling points under the same conditions",
    "The pure-water reference is 100 °C at 101 kPa. A sample boils at 95 °C at 85 kPa. What can this comparison establish about chemical purity?",
    "It is insufficient because the pressures differ",
    {
      "It proves the sample is impure":
        "Boiling temperature depends on pressure. These are not the same conditions.",
      "It proves the sample is pure water":
        "Neither pressure-mismatched reading alone establishes purity or identity.",
    },
    "Compare boiling data at the same pressure and with stated measurement uncertainty.",
    "Read the conditions as well as the temperature.",
    { mode: "boiling", record: "pressure", focus: "conclusion" },
  ),
];
