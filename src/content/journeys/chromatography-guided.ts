import {
  choice as c,
  number as n,
  written as w,
  type ChromaTask,
} from "./chromatography-tasks";
export const chromatographyGuided: ChromaTask[] = [
  c(
    "g-setup",
    "Keep the sample above the reservoir",
    "The paper bottom is 2 mm above the beaker base and the sample origin is 18 mm high. Which proposed water level contacts the paper while leaving the sample above the reservoir?",
    "10 mm",
    {
      "24 mm":
        "This immerses the sample origin, allowing sample to dissolve into the reservoir.",
      "1 mm": "This does not reach the paper bottom.",
    },
    "A valid level reaches the paper and remains below the 18 mm sample origin. 10 mm is one valid choice, not the only one.",
    "Compare the level with both fixed heights.",
    { mode: "setup", record: "immersed", focus: "solventLevel" },
  ),
  c(
    "g-phases",
    "Identify the two phases",
    "The source uses paper and water. Which pairing identifies the stationary and mobile phases?",
    "Stationary: paper; mobile: water",
    {
      "Stationary: water; mobile: paper":
        "The solvent travels through the paper; the paper stays in place.",
      "Stationary: sample; mobile: beaker":
        "The sample separates between the two phases; the beaker is apparatus.",
    },
    "For this GCSE paper/water example, the paper is the stationary phase and the moving water is the mobile phase.",
    "Identify what stays in place and what moves.",
    { mode: "phases", record: "paper-water", focus: "all" },
  ),
  n(
    "g-origin",
    "Measure travel from the origin",
    "On the original calibrated plot, the origin is at 10 mm above the paper bottom and the spot centre is at 58 mm. Move the ruler zero to the origin, then give the spot travel distance.",
    "48",
    "mm",
    "58 − 10 = 48 mm. Reading 58 mm measures from the paper bottom, not from the origin.",
    "Subtract the origin position from the centre position.",
    { mode: "measurement", record: "shifted-origin", focus: "spotDistance" },
  ),
  n(
    "g-centre",
    "Use the spot centre",
    "The origin is at 12 mm and the spot centre is at 60 mm. Its radius is 4 mm. What distance has the spot travelled?",
    "48",
    "mm",
    "60 − 12 = 48 mm. The upper edge would give 52 mm and the lower edge 44 mm; neither measures centre travel.",
    "Measure to the centre, not either edge.",
    { mode: "measurement", record: "spot-centre", focus: "spotDistance" },
  ),
  n(
    "g-rf",
    "Calculate relative travel",
    "A spot travels 28 mm and the solvent front 80 mm, both measured from the same origin. Calculate Rf.",
    "0.35",
    "",
    "Rf = 28 ÷ 80 = 0.35. It is a ratio of two lengths in the same unit, so it has no unit.",
    "Divide spot distance by solvent-front distance.",
    { mode: "ratio", record: "forward", focus: "rf" },
  ),
  c(
    "g-retention",
    "Compare retention in the stationary phase",
    "The same dye and solvent give Rf = 0.40 on paper A and 0.45 on paper B. All other stated conditions are controlled. Which comparison is supported?",
    "The dye is retained more in paper A",
    {
      "The dye is retained more in paper B":
        "The larger relative travel on B indicates less retention there under this controlled comparison.",
      "Paper A must make the dye molecules larger":
        "The data do not establish a change in molecular size.",
    },
    "Lower relative travel on A is consistent with stronger attraction to that stationary phase and more time retained there.",
    "Link relative movement to the time spent in the stationary phase.",
    { mode: "affinity", record: "paper-a", focus: "moreStationaryRetention" },
  ),
  c(
    "g-reference",
    "Compare reference lanes under one set of conditions",
    "The supplied chromatogram runs the unknown and known references together in the same solvent on the same paper. The unknown has resolved centres matching both P and Q. What does the comparison support?",
    "The unknown contains components consistent with P and Q",
    {
      "The unknown is certainly one pure compound":
        "Two resolved sample spots contradict that claim in the supplied uncontaminated experiment.",
      "The unknown has no soluble components":
        "Its observed separated spots demonstrate detected components.",
    },
    "Matching same-condition reference positions support P and Q as candidate components. Such matches do not prove unique identities among every possible substance.",
    "Compare original lane positions, not colours alone.",
    { mode: "interpretation", record: "known-mixture", focus: "matches" },
  ),
  c(
    "g-one-spot",
    "Recognise a limit of the method",
    "The unknown produces one visible spot. The supplied comparison states that two different compounds can co-elute at that position in this solvent. What conclusion is justified?",
    "One visible spot does not establish that the unknown is pure",
    {
      "One spot proves one substance under every condition":
        "Different components can overlap and give one visible spot.",
      "No substance is present because there is only one spot":
        "A visible sample spot is detected evidence.",
    },
    "A single spot can be consistent with purity, but here the source explicitly permits unresolved components. Another solvent or additional evidence can help.",
    "Separate a visible spot from a uniquely resolved substance.",
    { mode: "interpretation", record: "one-unresolved", focus: "composition" },
  ),
  c(
    "g-conditions",
    "Control the stationary phase too",
    "A reference Rf is measured on paper A, but the unknown uses paper B. The solvent is the same. Can an equal Rf alone establish the reference match?",
    "No: the stationary phase also differs",
    {
      "Yes: only the solvent affects Rf":
        "Relative attractions to the stationary phase can also change the result.",
      "Yes: all equal decimal values uniquely identify compounds":
        "Rf is condition-dependent and not a unique identifier.",
    },
    "Comparisons require the same relevant conditions, including the stationary phase. Changing the paper can alter retention.",
    "Check both phases, not just the solvent.",
    { mode: "conditions", record: "different-papers", focus: "conclusion" },
  ),
  w(
    "g-explain",
    "Explain separation through both phases",
    "Two supplied soluble dyes separate in the same paper and solvent. Explain why different relative attractions to the two phases can produce different travel distances.",
    "Both dyes distribute between the stationary phase and the moving solvent. A dye retained more strongly in the stationary phase spends more time there and travels a smaller fraction of the solvent-front distance. A dye spending a greater proportion of time in the mobile phase is carried farther relative to the front.",
    [
      "Identify both stationary and mobile phases.",
      "Link relative attraction to distribution/time in each phase.",
      "Connect more stationary retention with smaller relative travel.",
    ],
    "Build a cause-and-effect explanation rather than saying that a dye “likes” a phase.",
  ),
];
