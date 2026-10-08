import {
  choice as c,
  number as n,
  type ChromaTask,
} from "./chromatography-tasks";
// Targeted teaching, kept separate from reserved independent forms.
export const chromatographyRecovery: ChromaTask[] = [
  c(
    "r-solubility",
    "Use the stated meaning of soluble",
    "Dye K is supplied as soluble in water. A small amount is mixed with enough water. Which description is correct?",
    "K dissolves to form a solution",
    {
      "K must remain as insoluble grains":
        "This contradicts the supplied solubility.",
      "K becomes chemically identical to water":
        "Dissolving does not turn the dye into solvent molecules.",
    },
    "The soluble dye disperses in the solvent as a solution. It remains the dye; physical dissolving does not establish a new substance.",
    "Use the source property rather than appearance.",
  ),
  c(
    "r-pure-spot",
    "Predict one detectable pure compound",
    "The complete source contains only soluble, detectable Q. What chromatogram is expected in the supplied valid run?",
    "One Q spot",
    {
      "One spot for each element in Q":
        "Chromatography separates sample substances; it does not break the compound into elements.",
      "No spot because Q is pure": "Pure does not mean undetectable.",
    },
    "A supplied pure detectable soluble compound gives one spot. One spot in an unknown can still conceal overlapping compounds, so the reverse inference is limited.",
    "Count the supplied substances.",
    {
      mode: "interpretation",
      record: "known-pure",
      focus: "minimumComponents",
    },
  ),
  c(
    "r-phase-identity",
    "Identify the stationary separating phase",
    "Paper is held fixed while water moves through it in the supplied chromatography practical. Which phase is stationary?",
    "Paper",
    {
      Water: "Water moves through the separating material and is mobile.",
      "The sample": "Sample components distribute between the two phases.",
    },
    "Stationary identifies the fixed separating phase. Here it is paper. In an explicitly supplied coating example, identify that fixed separating layer rather than its support or moving solvent.",
    "Identify the fixed separating material and moving solvent.",
    { mode: "phases", record: "paper-water", focus: "stationary" },
  ),
  n(
    "r-centre",
    "Measure to the middle of a spot",
    "Origin 12 mm; circular spot centre 60 mm; radius 4 mm. What is its travel distance?",
    "48",
    "mm",
    "Use centre 60 mm minus origin 12 mm: 48 mm. The radius gives the spot edges, not centre travel.",
    "Identify the centre before subtracting.",
    { mode: "measurement", record: "spot-centre", focus: "spotDistance" },
  ),
  n(
    "r-direct",
    "Keep the ratio in the right order",
    "Spot travel is 28 mm and front travel 80 mm. Find Rf.",
    "0.35",
    "",
    "28 ÷ 80 = 0.35. Reversing the division gives the wrong ratio.",
    "The sample travel is the numerator.",
    { mode: "ratio", record: "forward", focus: "rf" },
  ),
  n(
    "r-denominator",
    "Rearrange for solvent-front travel",
    "Spot travel is 45 mm and Rf is 0.75. Find front travel.",
    "60",
    "mm",
    "From 0.75 = 45 ÷ front, front = 45 ÷ 0.75 = 60 mm. Multiplying 45 by 0.75 would find the wrong quantity.",
    "Identify the unknown denominator before rearranging.",
    { mode: "ratio", record: "find-front", focus: "frontDistance" },
  ),
  n(
    "r-endpoint",
    "Keep the inclusive upper endpoint",
    "Spot and front both travel 80 mm from the same origin. Find Rf.",
    "1",
    "",
    "80 ÷ 80 = 1. The supplied ideal position coincides with its front; it does not lie beyond it.",
    "Equal nonzero travel distances give one.",
    { mode: "ratio", record: "at-front", focus: "rf" },
  ),
  c(
    "r-lanes",
    "Leave an unmatched spot unnamed",
    "The lower unknown spot matches P in the same run. Its upper spot does not match either supplied P or Q. Which description preserves the evidence?",
    "A P-consistent component and an unidentified component",
    {
      "P and Q": "The upper spot does not match Q.",
      "Only pure P": "A second resolved unknown spot is supplied.",
    },
    "Match only positions supported by the reference lanes. A limited reference list may leave a component unidentified.",
    "Compare each observed centre separately.",
    { mode: "interpretation", record: "unnamed-second", focus: "matches" },
  ),
  c(
    "r-coelution",
    "Retain overlapping alternatives",
    "The unknown, reference A and reference B all produce a spot at the same position under the same conditions. What is unresolved?",
    "Whether the unknown is A, B or both",
    {
      "Whether any sample was detected": "A visible spot was detected.",
      "The unknown is uniquely A": "B and a co-eluting mixture also fit.",
    },
    "Two components can overlap. A single visible spot need not represent a single chemical substance.",
    "Distinguish spots from uniquely resolved components.",
    { mode: "interpretation", record: "one-unresolved", focus: "matches" },
  ),
  c(
    "r-colour",
    "Compare travel rather than colour alone",
    "Unknown and reference are both pink but give Rf = 0.30 and 0.70 in the same run. Is the proposed match supported?",
    "No: the same-condition relative travel differs",
    {
      "Yes: all pink dyes are identical":
        "Colour is not a unique chemical identifier.",
      "Yes: the front is irrelevant":
        "Relative travel uses the front as its reference.",
    },
    "A shared colour cannot override different same-condition positions.",
    "Use the separation evidence.",
    { mode: "interpretation", record: "same-colour", focus: "matches" },
  ),
  c(
    "r-resolve",
    "Choose a resolving solvent from supplied evidence",
    "The supplied S1 gives A and B Rf = 0.40. S2 gives A = 0.20 and B = 0.70 on the same paper. Which separates the two candidates?",
    "S2",
    { S1: "A and B overlap there.", Neither: "The S2 centres are different." },
    "The actual supplied S2 results show resolved positions. Do not predict effectiveness solely from a solvent name.",
    "Look for different relative travel.",
    { mode: "conditions", record: "resolve-solvent", focus: "choice" },
  ),
  c(
    "r-confounded",
    "Change one causal factor at a time",
    "The same dye changes both paper and solvent between runs. Can the Rf difference isolate the effect of paper?",
    "No: the solvent change also affects the comparison",
    {
      "Yes: only paper can affect Rf": "Both phase interactions matter.",
      "Yes: greater Rf identifies the paper effect alone":
        "The observations do not separate the changed factors.",
    },
    "Keep solvent and other relevant conditions constant to compare paper alone.",
    "List every changed condition.",
    {
      mode: "affinity",
      record: "confounded",
      focus: "moreStationaryRetention",
    },
  ),
  n(
    "r-amount",
    "Keep amount distinct from travel ratio",
    "The same dilute yellow dye changes in proportion from 85% to 75%, with paper, solvent and temperature unchanged and no overload. Its original Rf is 0.60. What is expected now?",
    "0.60",
    "",
    "Its relative travel remains 0.60 in the supplied conditions, although spot strength may differ. Rf is not the yellow mass fraction.",
    "Use the stated controlled dilute comparison.",
    { mode: "conditions", record: "different-amounts", focus: "newRf" },
  ),
  n(
    "r-proportional",
    "Compare both distances together",
    "One run gives spot/front = 30/50 mm. A second gives 60/100 mm under the same conditions. Find the second Rf.",
    "0.60",
    "",
    "Both distances doubled; 60 ÷ 100 = 0.60. The relative travel stays the same.",
    "Calculate the ratio rather than comparing spot distance alone.",
    { mode: "conditions", record: "longer-run", focus: "newRf" },
  ),
  c(
    "r-substances",
    "Distinguish a mixture from a compound",
    "The complete sample contains water molecules and glucose molecules. What is its classification?",
    "A mixture",
    {
      "A pure compound because glucose has several elements":
        "Both water and glucose are present as different substances.",
      "A pure element because it is clear":
        "Appearance does not determine chemical classification.",
    },
    "The supplied inventory contains two substances, so it is a mixture.",
    "Count the supplied substance identities.",
  ),
  c(
    "r-pencil",
    "Avoid adding a soluble dye",
    "The supplied baseline ink dissolves in the mobile solvent. What should replace it?",
    "A pencil line",
    {
      "More of the same soluble ink":
        "It can still travel and add unwanted spots.",
      "No recorded origin at all":
        "The origin is needed to measure both travel distances.",
    },
    "Graphite in a pencil line does not dissolve and travel with the solvent in this practical.",
    "The line should remain a reliable reference.",
    { mode: "setup", record: "ink-line", focus: "lineMaterial" },
  ),
  c(
    "r-contact",
    "Make solvent contact without immersion",
    "The paper bottom is 14 mm high and its sample origin is 30 mm high. Which solvent level fixes the supplied dry-paper error?",
    "20 mm",
    {
      "8 mm": "The solvent still does not reach the paper.",
      "35 mm": "The sample would be immersed in the reservoir.",
    },
    "20 mm reaches the paper but stays below the 30 mm sample origin. Other levels in that valid interval can also work.",
    "Check both the lower and upper constraints.",
    { mode: "setup", record: "dry-paper", focus: "solventLevel" },
  ),
  c(
    "r-front",
    "Record the front while visible",
    "When should the leading solvent-front boundary be marked on removal of the paper?",
    "Immediately, while the front is visible",
    {
      "Only after the front has disappeared during drying":
        "Its position may then be lost, preventing the solvent travel measurement.",
      "Never, because only the sample spots matter":
        "Rf requires both spot and solvent-front travel.",
    },
    "Record the wet front before drying makes its boundary difficult to see. The front is a boundary; its distance is measured from the origin.",
    "Preserve the denominator measurement.",
  ),
  c(
    "r-clean",
    "Keep sample lanes interpretable",
    "Why use small separate sample spots and clean applicators?",
    "To limit spreading and cross-contamination",
    {
      "To make every sample chemically pure":
        "Careful spotting does not remove the sample’s original mixture components.",
      "To force every Rf value to equal one":
        "Spotting technique does not set every component’s relative travel.",
    },
    "Small separate spots and clean applicators reduce avoidable overlap and contamination.",
    "Keep a lane’s detected components attributable to its supplied sample.",
  ),
  c(
    "r-mobile",
    "Identify a different moving solvent",
    "The source explicitly uses paper and ethanol. Which is the mobile phase?",
    "Ethanol",
    {
      Paper: "Paper is stationary in this supplied example.",
      "The glass beaker":
        "The beaker holds the apparatus; it is not the moving phase.",
    },
    "The ethanol solvent travels through the paper. Mobile does not always mean water.",
    "Use the actual source solvent.",
    { mode: "phases", record: "paper-ethanol", focus: "mobile" },
  ),
  n(
    "r-offset",
    "Subtract the origin offset",
    "The paper-bottom coordinates are origin 15 mm and centre 45 mm. What is the centre travel distance?",
    "30",
    "mm",
    "45 − 15 = 30 mm. The paper-bottom coordinate 45 mm is not the travel distance.",
    "Use a common start point.",
    { mode: "measurement", record: "second-origin", focus: "spotDistance" },
  ),
  n(
    "r-front-distance",
    "Measure the denominator from the same origin",
    "The origin is at 20 mm and the solvent front at 100 mm above the paper bottom. What distance has the front travelled?",
    "80",
    "mm",
    "100 − 20 = 80 mm. The spot and front distances must start at the same origin.",
    "Subtract before forming a ratio.",
    { mode: "measurement", record: "high-origin", focus: "frontDistance" },
  ),
  c(
    "r-missing",
    "Recognise a lost measurement",
    "The original record includes the origin and spot centre, but the front was not marked. What can be concluded?",
    "Rf cannot be calculated from this incomplete record",
    {
      "Rf is zero because the front is blank":
        "A missing measurement is not a measured zero.",
      "The paper top is automatically the front":
        "The front is the actual solvent boundary, not an arbitrary edge.",
    },
    "The denominator is missing. The centre travel can still be measured, but a numerical Rf is unsupported.",
    "Do not invent a solvent-front position.",
    { mode: "measurement", record: "missing-front", focus: "conclusion" },
  ),
  n(
    "r-units",
    "Convert before dividing",
    "The spot travels 30 mm and the solvent front 6 cm. Calculate Rf.",
    "0.5",
    "",
    "6 cm = 60 mm, so Rf = 30 ÷ 60 = 0.5. Dividing the unconverted numerical values would give the wrong ratio.",
    "Express both lengths in the same unit.",
    { mode: "ratio", record: "mixed-units", focus: "rf" },
  ),
  n(
    "r-inverse",
    "Predict a distance from the ratio",
    "The supplied Rf is 0.575 and the front travels 80 mm from the origin. How far does the spot travel?",
    "46",
    "mm",
    "Spot distance = 0.575 × 80 = 46 mm. This is a distance from the origin, not its paper-bottom coordinate.",
    "Rearrange Rf = spot distance ÷ front distance.",
    { mode: "ratio", record: "inverse", focus: "spotDistance" },
  ),
  {
    ...n(
      "r-precision",
      "Use the requested significant figures",
      "The spot travels 3 cm and the front 7 cm. Calculate Rf to two significant figures.",
      "0.43",
      "",
      "3 ÷ 7 = 0.428571…, which rounds to 0.43 at two significant figures.",
      "Find the third significant digit before rounding.",
      { mode: "ratio", record: "two-sf", focus: "rf" },
    ),
    rounding: { kind: "significant-figures", digits: 2 },
  },
  c(
    "r-ratio-range",
    "Check a physically inconsistent record",
    "An ordinary record states spot travel 88 mm and its solvent-front travel 80 mm. What does 88 ÷ 80 = 1.1 tell you?",
    "The recorded distances or labels need checking",
    {
      "The spot should silently be moved back to 80 mm":
        "That replaces the original evidence instead of diagnosing the inconsistency.",
      "1.1 is a normal valid Rf for this record":
        "An ordinary sample centre cannot lie beyond its own solvent front.",
    },
    "The arithmetic is 1.1, but the supplied physical record is inconsistent. Preserve it and check measurements or labels.",
    "Distinguish correct arithmetic from a valid physical record.",
    { mode: "ratio", record: "past-front", focus: "conclusion" },
  ),
  c(
    "r-phase-cause",
    "Connect retention to relative travel",
    "In a controlled comparison, dye A spends a greater proportion of time in the stationary phase than dye B. Which travels a greater fraction of the front distance?",
    "Dye B",
    {
      "Dye A":
        "A spends more time retained in the stationary phase and less time being carried by the mobile phase.",
      "Both must have identical Rf":
        "The supplied distribution-time comparison differs.",
    },
    "A is retained for more of the run and is carried less far relative to the front.",
    "Link phase distribution to movement.",
    {
      mode: "affinity",
      record: "time-comparison",
      focus: "greaterRelativeTravel",
    },
  ),
  n(
    "r-minimum",
    "Count resolved components cautiously",
    "A supplied uncontaminated sample gives three resolved spots. What is the minimum number of detected components?",
    "3",
    "",
    "Each resolved spot supports a component. Further components may overlap or be undetected, so three is a minimum rather than a guaranteed total.",
    "Count the resolved spots.",
    {
      mode: "interpretation",
      record: "three-resolved",
      focus: "minimumComponents",
    },
  ),
  c(
    "r-reference-conditions",
    "Check the solvent used for a reference",
    "A reference and unknown have equal recorded Rf values but were run in different solvents. What does this establish?",
    "Insufficient evidence for the proposed match",
    {
      "A unique identification of the unknown":
        "Changing solvent can change Rf; equal values across unlike conditions are not a valid same-condition match.",
      "The unknown must contain no components":
        "A condition mismatch does not establish absence of substances.",
    },
    "Use the same relevant conditions for reference comparisons. An Rf value is not a universal identifier.",
    "Compare how each record was obtained.",
    { mode: "conditions", record: "different-solvents", focus: "conclusion" },
  ),
  c(
    "r-unmoved",
    "Do not overinterpret a stationary spot",
    "A detected sample spot remains at the origin. Its solubility and phase attractions are not supplied. What can this alone prove?",
    "It does not uniquely distinguish insolubility from strong retention",
    {
      "The sample contains no substance":
        "A detected spot is evidence of sample material.",
      "The sample is definitely insoluble in every solvent":
        "The record does not supply that information.",
    },
    "Failure to travel can be consistent with insolubility in this solvent or strong stationary retention. More evidence is needed to distinguish the cause.",
    "State the limit of the observation.",
    { mode: "interpretation", record: "no-travel", focus: "composition" },
  ),
];
const order = [
  "r-substances",
  "r-solubility",
  "r-pure-spot",
  "r-pencil",
  "r-contact",
  "r-front",
  "r-clean",
  "r-mobile",
  "r-phase-identity",
  "r-offset",
  "r-centre",
  "r-front-distance",
  "r-missing",
  "r-direct",
  "r-units",
  "r-inverse",
  "r-denominator",
  "r-precision",
  "r-endpoint",
  "r-ratio-range",
  "r-phase-cause",
  "r-minimum",
  "r-lanes",
  "r-coelution",
  "r-colour",
  "r-reference-conditions",
  "r-confounded",
  "r-resolve",
  "r-amount",
  "r-proportional",
  "r-unmoved",
];
if (
  order.length !== chromatographyRecovery.length ||
  new Set(order).size !== order.length
)
  throw Error("Incomplete individual refresher sequence");
chromatographyRecovery.sort(
  (a, b) =>
    order.indexOf(a.id.replace("chromatography-v1-", "")) -
    order.indexOf(b.id.replace("chromatography-v1-", "")),
);
