import type { LearningTask, LessonJourney } from "../types";
import {
  instrumentalRecords,
  type InstrumentalGiven,
  type InstrumentalMode,
} from "../../lib/instrumental";
const id = (s: string) => "instrumental-analysis-v1-" + s;
type Model = { mode: InstrumentalMode; record: string };
function choice(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: Model,
  given?: InstrumentalGiven,
): LearningTask {
  const o = [answer, ...Object.keys(errors)],
    n = [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % o.length;
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    options: [...o.slice(n), ...o.slice(0, n)],
    misconceptions: errors,
    explanation,
    hint,
    ...(model
      ? { model: { kind: "instrumental-investigation" as const, ...model } }
      : {}),
    ...(given ? { instrumentalGiven: given } : {}),
  };
}
function written(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
  given?: InstrumentalGiven,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    rubric,
    hint,
    ...(given ? { instrumentalGiven: given } : {}),
  };
}
function numeric(
  s: string,
  title: string,
  prompt: string,
  answer: number,
  given: InstrumentalGiven,
  model?: Model,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: String(answer),
    inputMode: "decimal",
    tolerance: 0.05,
    unit: "mg/dm³",
    explanation: `The supplied response corresponds to ${answer} mg/dm³ on this calibration. Use the concentration axis and the given standards under matching conditions.`,
    hint: "Find the unknown response on the response axis, move across to the supplied calibration, then read concentration downwards.",
    ...(s.startsWith("p-") || !model ? { instrumentalGiven: given } : {}),
    ...(model
      ? { model: { kind: "instrumental-investigation" as const, ...model } }
      : {}),
  };
}
function supplied(record: string): InstrumentalGiven {
  const r = instrumentalRecords[record];
  return {
    title: r.title,
    ...(r.spectrum ? { spectrum: r.spectrum } : {}),
    ...(r.calibration ? { calibration: r.calibration } : {}),
    ...(r.rows ? { rows: r.rows } : {}),
  };
}
const spec = (
  lines: number[],
  conditions: string,
  table = false,
): InstrumentalGiven => ({
  title: "Supplied emission record",
  spectrum: { lines, conditions, table },
});
const pair =
  "Exactly two of the five supplied metal ions. All three reference lines of each are detectable; shared positions overlap.";
const warmup: LearningTask[] = [
  choice(
    "w-ion",
    "Recall metal ions",
    "Which species is a metal cation?",
    "K⁺",
    {
      "Cl⁻": "Chloride is a non-metal anion.",
      "CO₂": "Carbon dioxide is a neutral molecular substance.",
    },
    "Potassium ions have positive charge and are metal cations.",
    "Read both the element and the charge.",
  ),
  choice(
    "w-light",
    "Emission or absorption?",
    "A sample gives out light. What is this called?",
    "Emission",
    {
      Absorption: "Absorption means taking in radiation.",
      Filtration: "Filtration separates an insoluble solid from a fluid.",
    },
    "Emission means light is given out.",
    "Which term means giving out?",
  ),
  choice(
    "w-scale",
    "Read concentration units",
    "A solution contains 3 mg of the ion in each dm³. What is its concentration?",
    "3 mg/dm³",
    {
      "3 dm³/mg":
        "Concentration here is mass divided by volume, not the inverse.",
      "3 mg": "Mass alone omits the volume basis.",
    },
    "The concentration is 3 mg per dm³.",
    "Keep the mass and volume units together.",
  ),
  choice(
    "w-accuracy",
    "Recall accuracy",
    "A measured value is close to an accepted reference. Which feature does this describe?",
    "Accuracy",
    {
      Precision: "Precision concerns agreement of repeats.",
      Speed: "Measurement time is not supplied.",
    },
    "Accuracy concerns closeness to the accepted value.",
    "Distinguish closeness to a reference from agreement of repeated readings.",
  ),
];
const refresher: LearningTask[] = [
  choice(
    "r-path",
    "Construct the light path",
    "Which light is analysed in flame emission spectroscopy?",
    "Light emitted by the sample in the flame",
    {
      "The cold solution's colour":
        "That is not the specified flame emission sequence.",
      "Only light absorbed from a separate lamp":
        "The named method analyses emitted light.",
    },
    instrumentalRecords["path-emission"].feedback,
    "Track the sample, light and output.",
    { mode: "path", record: "path-repair" },
  ),
  choice(
    "r-positions",
    "Read a fingerprint",
    "What distinguishes the sodium reference from the potassium reference here?",
    "Their full sets of line positions",
    {
      "Both have three lines, so they are the same":
        "Equal counts do not mean equal positions.",
      "Any one shared line identifies both":
        "A shared position is insufficient for either full fingerprint.",
    },
    "Compare all supplied positions on the same scale; a shared line alone does not identify an ion.",
    "Inspect the lines that are not shared.",
    { mode: "spectrum", record: "s-k" },
  ),
  choice(
    "r-mixture",
    "Allow overlapping lines",
    "Lithium and copper references overlap at position 4. How many different display positions are in their combined spectrum?",
    "5",
    {
      "6": "The shared position appears once.",
      "2": "The number of ions is not the number of spectral lines.",
    },
    "Their union is 1, 4, 7, 10, 12: five positions.",
    "Count each distinct position once.",
    { mode: "spectrum", record: "s-li-cu" },
  ),
  numeric(
    "r-calibration",
    "Use the supplied standards",
    "The sodium response is 45. Read concentration from the supplied calibration.",
    4,
    supplied("cal-4"),
    { mode: "calibration", record: "cal-4" },
  ),
  choice(
    "r-blank",
    "Check background",
    "Why check a blank alongside the standards?",
    "To check the method's background signal",
    {
      "To replace the concentration standards":
        "A blank is not a complete calibration.",
      "To force the unknown response to be zero":
        "A blank diagnoses background; it does not change the original unknown.",
    },
    instrumentalRecords["q-blank"].feedback,
    "Consider a sample containing none of the ion being measured.",
    { mode: "quality", record: "q-blank" },
  ),
  choice(
    "r-range",
    "Stay within supplied evidence",
    "The standards have responses up to 65; the unknown response is 85. What is needed?",
    "Suitable standards covering the unknown response",
    {
      "Report an exact concentration by extending the line indefinitely":
        "No response relation beyond this range is supplied.",
      "Count the unknown's lines to find concentration":
        "Line count is not a concentration calibration.",
    },
    instrumentalRecords["q-range"].feedback,
    "Compare the measured response with the actual standard range.",
    { mode: "quality", record: "q-range" },
  ),
  choice(
    "r-sensitive",
    "Recognise sensitivity",
    "Which comparison demonstrates greater sensitivity?",
    "Detecting the ion at a lower concentration",
    {
      "Taking less time": "That supports greater speed.",
      "Repeated readings agreeing closely": "That concerns precision.",
    },
    "Sensitivity supports detecting small concentrations; it is different from speed and precision.",
    "Look for the smaller amount that can be detected.",
    { mode: "advantage", record: "a-sensitive" },
  ),
  choice(
    "r-precision",
    "Do not confuse agreement and accuracy",
    "Repeated results differ widely and no accepted value is supplied. What can be judged?",
    "Poor precision; accuracy is not established",
    {
      "Poor accuracy is proven":
        "Without an accepted value, closeness to it is not known.",
      "Perfect accuracy because an instrument was used":
        "Instruments can have errors.",
    },
    instrumentalRecords["q-repeat"].feedback,
    "What do repeats tell you without a true-value reference?",
    { mode: "quality", record: "q-repeat" },
  ),
  choice(
    "r-mask",
    "Why a mixture is difficult",
    "Why can an ordinary flame-colour test miss an ion in a mixture?",
    "One ion's colour can mask another's",
    {
      "Every mixture produces no light": "Mixtures can emit light.",
      "Each ion gives a completely separate visible flame":
        "The eye observes the combined colour.",
    },
    "Two flame colours can mix, or one colour can mask another. The missing visible colour does not prove that ion absent.",
    "Think about viewing combined colours.",
  ),
];
refresher.push(
  choice(
    "r-accuracy",
    "Judge closeness to a reference",
    "Which evidence supports greater accuracy here?",
    "A result closer to the accepted reference",
    {
      "Closely agreeing repeats alone":
        "That concerns precision, not closeness to an accepted value.",
      "A shorter test time": "That supports speed.",
    },
    instrumentalRecords["a-accurate"].feedback,
    "Compare each result with the accepted value.",
    { mode: "advantage", record: "a-accurate" },
  ),
  choice(
    "r-rapid",
    "Compare test times",
    "What does the supplied time comparison support?",
    "The instrument is faster here",
    {
      "The instrument detects a smaller concentration":
        "No detection limits are supplied.",
      "The instrument is always accurate": "Time does not establish accuracy.",
    },
    instrumentalRecords["a-rapid"].feedback,
    "Compare seconds with seconds.",
    { mode: "advantage", record: "a-rapid" },
  ),
);
const guided: LearningTask[] = [
  choice(
    "g-path",
    "Follow the light",
    "What is the output?",
    "A line spectrum",
    {
      "A beaker mass": "Mass is not this optical output.",
      "Only one overall colour":
        "The spectroscope resolves emitted light into lines.",
    },
    instrumentalRecords["path-emission"].feedback,
    "Build the three stages of the method.",
    { mode: "path", record: "path-emission" },
  ),
  choice(
    "g-na",
    "Match an unknown",
    "Which metal ion matches the full unknown pattern?",
    "Sodium ions",
    {
      "Potassium ions":
        "Position 6 is shared, but 2 and 9 do not match potassium.",
      "Calcium ions": "Calcium has positions 1, 5 and 8.",
    },
    instrumentalRecords["s-na"].feedback,
    "Compare each original line with the same-scale references.",
    { mode: "spectrum", record: "s-na" },
  ),
  choice(
    "g-mixture",
    "Two patterns, one sample",
    "Which two ions together explain this complete supplied mixture?",
    "Sodium and calcium ions",
    {
      "Sodium and potassium ions":
        "That proposal includes 3 and 11 and does not explain 1, 5 and 8.",
      "Lithium and copper(II) ions":
        "Their positions do not match this original record.",
    },
    instrumentalRecords["s-ca-na"].feedback,
    "Select two reference patterns and compare their combined positions.",
    { mode: "spectrum", record: "s-ca-na" },
  ),
  choice(
    "g-overlap",
    "Shared positions overlap",
    "Why are there five visible positions for two three-line references?",
    "One line position is shared",
    {
      "One ion has vanished":
        "Both patterns are present under the stated conditions.",
      "Five positions mean five ions":
        "The number of lines is not the number of ions.",
    },
    instrumentalRecords["s-li-cu"].feedback,
    "Use the supplied table as well as the aligned comparison.",
    { mode: "spectrum", record: "s-li-cu" },
  ),
  choice(
    "g-shared",
    "Keep uncertainty",
    "Only position 6 was measured. What conclusion is justified?",
    "Sodium or potassium remains unresolved",
    {
      "Definitely sodium only": "Potassium also has a line at 6.",
      "Definitely potassium only": "Sodium also has a line at 6.",
    },
    instrumentalRecords["s-shared"].feedback,
    "Do not treat unmeasured positions as absent.",
    { mode: "spectrum", record: "s-shared" },
  ),
  numeric(
    "g-cal4",
    "Read identity and concentration separately",
    "The sodium ion is already identified. What concentration corresponds to response 45?",
    4,
    supplied("cal-4"),
    { mode: "calibration", record: "cal-4" },
  ),
  numeric(
    "g-cal3",
    "Interpolate the response",
    "Use the potassium standards to read concentration at response 18.",
    3,
    supplied("cal-3"),
    { mode: "calibration", record: "cal-3" },
  ),
  choice(
    "g-background",
    "Interpret a non-zero blank",
    "The blank response is 7. What should be checked?",
    "Background from the method",
    {
      "Purity is proven": "A background measurement cannot establish purity.",
      "Every standard can be discarded":
        "The blank helps interpret the standard calibration.",
    },
    instrumentalRecords["q-blank"].feedback,
    "Keep the original blank and unknown readings visible.",
    { mode: "quality", record: "q-blank" },
  ),
  choice(
    "g-range",
    "Recognise the calibrated range",
    "An unknown response lies above all supplied standards. What does that mean?",
    "An exact concentration needs further calibration evidence",
    {
      "Any extrapolation is automatically valid":
        "The response relationship outside the measured range is not supplied.",
      "The ion must be absent": "A high response is not evidence of absence.",
    },
    instrumentalRecords["q-range"].feedback,
    "Compare the response with both endpoints of the standards.",
    { mode: "quality", record: "q-range" },
  ),
  choice(
    "g-accuracy",
    "Evaluate an actual advantage",
    "Which feature is supported by the given accepted-value comparison?",
    "Greater accuracy for this result",
    {
      "Greater sensitivity is established":
        "No detection-limit comparison is supplied.",
      "Faster testing is established": "No time comparison is supplied.",
    },
    instrumentalRecords["a-accurate"].feedback,
    "Compare distances from the accepted reference.",
    { mode: "advantage", record: "a-accurate" },
  ),
];
const practice: LearningTask[] = [
  choice(
    "p-method",
    "Name the instrumental method",
    "Which instrumental method analyses emitted flame light to identify metal ions in a solution?",
    "Flame emission spectroscopy",
    {
      "Paper chromatography":
        "That separates components through stationary/mobile phases.",
      "A sodium hydroxide precipitate test":
        "That is a chemical test, not the named instrumental method.",
    },
    "Flame emission spectroscopy analyses the line spectrum of emitted light.",
    "Name the method using flame light.",
    { mode: "path", record: "path-emission" },
  ),
  choice(
    "p-k",
    "Distinguish a shared line",
    "Which ion matches positions 3, 6 and 11?",
    "Potassium ions",
    {
      "Sodium ions": "Sodium matches 2, 6, 9 rather than 3, 6, 11.",
      "Calcium ions": "Calcium matches 1, 5, 8.",
    },
    instrumentalRecords["s-k"].feedback,
    "Use the entire fingerprint.",
    { mode: "spectrum", record: "s-k" },
    supplied("s-k"),
  ),
  choice(
    "p-ca",
    "Equal counts are insufficient",
    "The unknown has three lines, as do all five references. Which ion does its pattern support?",
    "Calcium ions",
    {
      "Lithium ions": "Lithium shares 1 but not 5 and 8.",
      "All five ions":
        "Equal line counts do not mean all references are present.",
    },
    instrumentalRecords["s-ca"].feedback,
    "Compare the positions rather than the count.",
    { mode: "spectrum", record: "s-ca" },
    supplied("s-ca"),
  ),
  choice(
    "p-cu",
    "Use tabular evidence",
    "Which ion matches the supplied table of original positions?",
    "Copper(II) ions",
    {
      "Lithium ions": "Lithium shares position 4 but not 7 and 12.",
      "Potassium ions": "Potassium is 3, 6, 11.",
    },
    instrumentalRecords["s-cu"].feedback,
    "Match all positions in the same-form table.",
    { mode: "spectrum", record: "s-cu" },
    supplied("s-cu"),
  ),
  choice(
    "p-li",
    "Different overlapping references",
    "Which single ion explains the complete original record?",
    "Lithium ions",
    {
      "Calcium ions": "Calcium shares 1 but has no 4 or 10.",
      "Copper(II) ions": "Copper shares 4 but has no 1 or 10.",
    },
    instrumentalRecords["s-li"].feedback,
    "A single overlapping position is not the full fingerprint.",
    { mode: "spectrum", record: "s-li" },
    supplied("s-li"),
  ),
  choice(
    "p-shared",
    "Partial measurements",
    "Only position 6 was recorded. What is the supported conclusion?",
    "The ion is not uniquely identified",
    {
      "Sodium is uniquely identified": "Potassium shares that position.",
      "Both ions must be present": "One shared line cannot establish two ions.",
    },
    instrumentalRecords["s-shared"].feedback,
    "Unmeasured positions supply no absence evidence.",
    { mode: "spectrum", record: "s-shared" },
    supplied("s-shared"),
  ),
  choice(
    "p-cana",
    "Combine two references",
    "Name the two ions supported by the complete original mixture.",
    "Sodium and calcium ions",
    {
      "Sodium and potassium ions":
        "Potassium would add 3 and 11 while leaving calcium's positions unexplained.",
      "Lithium and copper(II) ions": "Their combined pattern differs.",
    },
    instrumentalRecords["s-ca-na"].feedback,
    "Check both that every unknown position is explained and that the proposal does not add unexplained lines.",
    { mode: "spectrum", record: "s-ca-na" },
    supplied("s-ca-na"),
  ),
  choice(
    "p-licu",
    "A mixture with an overlap",
    "Which pair explains positions 1, 4, 7, 10 and 12?",
    "Lithium and copper(II) ions",
    {
      "Lithium and calcium ions":
        "Calcium would add 5 and 8 and not explain 7 and 12.",
      "Five separate ions": "Visible line count is not ion count.",
    },
    instrumentalRecords["s-li-cu"].feedback,
    "Count shared position 4 once.",
    { mode: "spectrum", record: "s-li-cu" },
    supplied("s-li-cu"),
  ),
  numeric(
    "p-cal3",
    "Keep the intercept",
    "Read potassium concentration from response 18 using its own supplied calibration.",
    3,
    supplied("cal-3"),
    { mode: "calibration", record: "cal-3" },
  ),
  numeric(
    "p-cal25",
    "Read a quarter interval",
    "Read the lithium concentration for response 28.",
    2.5,
    supplied("cal-2.5"),
    { mode: "calibration", record: "cal-2.5" },
  ),
  numeric(
    "p-cal5",
    "Use copper standards",
    "Read copper(II) concentration at response 32.",
    5,
    supplied("cal-5"),
    { mode: "calibration", record: "cal-5" },
  ),
  choice(
    "p-intensity",
    "Identity is not concentration",
    "Two samples show exactly the same line positions but different intensities. Standards and conditions are matched. What distinction is supported?",
    "The same ion identity can occur at different concentrations",
    {
      "Different intensities prove different ions":
        "Identity uses the positions, not brightness alone.",
      "The number of ions equals the number of lines":
        "Each ion can produce several lines.",
    },
    "The same pattern can identify the same ion; the intensity with its matched calibration can indicate differing concentrations.",
    "Separate where the lines are from how strong the selected signal is.",
  ),
  choice(
    "p-blank",
    "Background evidence",
    "What is the role of the supplied blank response?",
    "Checking signal from the method without the analyte",
    {
      "Proving the solution is pure":
        "A blank does not test every possible substance.",
      "Replacing every concentration standard":
        "The calibration still requires known concentrations.",
    },
    instrumentalRecords["q-blank"].feedback,
    "Consider what is measured when the analyte concentration is zero.",
    { mode: "quality", record: "q-blank" },
    supplied("q-blank"),
  ),
  choice(
    "p-settings",
    "Match measurement conditions",
    "The flame and gain changed after calibration. What should happen before using the new unknown response?",
    "Obtain standards under the new conditions",
    {
      "Use the old graph as if nothing changed":
        "The response relationship may have changed.",
      "Identify concentration from the ion name":
        "Identity alone gives no concentration.",
    },
    instrumentalRecords["q-settings"].feedback,
    "Ask whether standards and unknown are comparable.",
    { mode: "quality", record: "q-settings" },
    supplied("q-settings"),
  ),
  choice(
    "p-range",
    "An unsupported extrapolation",
    "Which response to the outside-range unknown is justified?",
    "Obtain suitable calibration evidence before an exact concentration claim",
    {
      "Report 8 mg/dm³ as an established exact result":
        "An extended line here is an unsupported extrapolation.",
      "Declare the sample pure": "Intensity does not establish purity.",
    },
    instrumentalRecords["q-range"].feedback,
    "Use the range of measurements actually supplied.",
    { mode: "quality", record: "q-range" },
    supplied("q-range"),
  ),
  choice(
    "p-repeat",
    "Judge repeats honestly",
    "What can the supplied repeated estimates establish?",
    "Poor precision; accuracy cannot be judged without a reference",
    {
      "Poor accuracy is proven by disagreement alone":
        "Disagreement concerns precision; closeness to a true value needs a reference.",
      "All instrumental readings are exact":
        "An instrument is not immune to errors.",
    },
    instrumentalRecords["q-repeat"].feedback,
    "Keep precision and accuracy distinct.",
    { mode: "quality", record: "q-repeat" },
    supplied("q-repeat"),
  ),
  choice(
    "p-sensitive",
    "Lower detection limit",
    "What advantage is supported by the supplied detection limits?",
    "Greater sensitivity in this comparison",
    {
      "Faster results": "No timing is supplied.",
      "Perfect immunity to contamination":
        "Blanks and proper methods remain necessary.",
    },
    instrumentalRecords["a-sensitive"].feedback,
    "Compare the smallest concentrations detected.",
    { mode: "advantage", record: "a-sensitive" },
    supplied("a-sensitive"),
  ),
  choice(
    "p-accuracy",
    "Closeness to a reference",
    "What does the accepted-value comparison support?",
    "The instrument result is more accurate here",
    {
      "The instrument always has better precision":
        "Repeated measurements are not supplied.",
      "The instrument is always perfect":
        "The instrumental result still differs from the reference.",
    },
    instrumentalRecords["a-accurate"].feedback,
    "Compare absolute differences from the accepted value.",
    { mode: "advantage", record: "a-accurate" },
    supplied("a-accurate"),
  ),
  choice(
    "p-rapid",
    "Use the time units",
    "Which advantage is supported by 20 seconds compared with 4 minutes?",
    "The instrumental method is faster in this comparison",
    {
      "It has a lower detection limit":
        "Time says nothing about the smallest detectable concentration.",
      "It is immune to errors": "A faster method can still have errors.",
    },
    instrumentalRecords["a-rapid"].feedback,
    "Convert minutes to seconds before comparing.",
    { mode: "advantage", record: "a-rapid" },
    supplied("a-rapid"),
  ),
  written(
    "p-oneadv",
    "State one advantage",
    "Give one advantage of instrumental analysis compared with chemical testing.",
    "It can be more sensitive. Also accept more accurate, faster, or able to determine concentration; a suitable smaller-sample advantage is acceptable.",
    [
      "State one valid advantage. One concise statement is enough for this demand.",
      "Do not claim instruments are infallible or never need calibration.",
    ],
    "Choose one supported advantage; do not invent a requirement for a long explanation.",
  ),
  written(
    "p-mask",
    "Explain a mixture's flame colour",
    "A spectrum supports sodium and calcium ions, but an ordinary flame test mainly looks yellow. Explain why flame colour alone can fail to identify both.",
    "The ions have different flame colours. Their colours can mix, or sodium's yellow can mask calcium's orange-red, so viewing the combined colour may not reveal both.",
    [
      "Describe the two different colours, or state that the ions give different flame colours.",
      "Explain that colours mix or one masks the other.",
      "Do not infer calcium is absent from the mainly yellow appearance.",
    ],
    "Link different colours to what the eye observes together.",
  ),
  written(
    "p-fingerprint",
    "Justify a line match",
    "Explain why matching a complete line pattern is stronger identification evidence than matching only one shared line.",
    "A shared line can occur in more than one supplied reference. Several matching positions distinguish the full patterns within the supplied reference set and conditions.",
    [
      "Recognise that one position may be shared.",
      "Use several positions and the supplied reference set.",
      "Avoid claiming absolute proof of purity or absence of all other substances.",
    ],
    "Say what alternative a single shared line leaves open.",
  ),
  written(
    "p-concentration-plan",
    "Plan evidence for concentration",
    "The metal ion is identified. Explain how its concentration can be found from instrumental response, and why the identity alone is insufficient.",
    "Measure known concentration standards for the same ion and chosen line under matched conditions, accounting for the blank/background. Compare the unknown response with the supplied calibration within its range. Line positions identify the ion; response with standards relates to concentration.",
    [
      "Use known concentrations of the same ion and matched conditions.",
      "Compare the unknown response with the calibration; consider background and measured range.",
      "Separate identification by positions from concentration using response and standards.",
    ],
    "Specify what must be known before response can be turned into concentration.",
  ),
  written(
    "p-limit",
    "Evaluate benefits and limits",
    "A school is comparing flame emission spectroscopy with visual chemical tests. Give two benefits and one relevant limitation without claiming every result is error-free.",
    "Instrumental analysis can be sensitive to small concentrations and rapid (or more accurate, or measure concentration). Equipment cost or trained interpretation is a relevant limitation; suitable standards and attention to contamination/conditions are still needed.",
    [
      "Give two distinct supported benefits.",
      "Give a relevant limitation, such as cost, training or calibration/contamination requirements.",
      "Do not treat a general possible advantage as guaranteed perfection for every measurement.",
    ],
    "Balance useful features with a real resource or measurement requirement.",
  ),
];
const checkForms: LearningTask[][] = [
  [
    choice(
      "cA-method",
      "Name the method",
      "Name the instrumental method that analyses emitted light from a solution sample in a flame.",
      "Flame emission spectroscopy",
      {
        Filtration: "That is a separation, not emission analysis.",
        "A limewater test": "That is a chemical gas test.",
      },
      "Flame emission spectroscopy resolves emitted light into a line spectrum.",
      "Name the flame-light method.",
    ),
    choice(
      "cA-li-k",
      "Identify two ions",
      "Which two ions explain this complete supplied spectrum?",
      "Lithium and potassium ions",
      {
        "Lithium and sodium ions":
          "Sodium would add 2 and 9 instead of potassium's 3 and 11.",
        "Calcium and potassium ions":
          "Calcium would add 5 and 8 and not explain 4 and 10.",
      },
      "Lithium gives 1,4,10 and potassium 3,6,11; their union matches the original record.",
      "Match the complete union.",
      undefined,
      spec([1, 3, 4, 6, 10, 11], pair),
    ),
    choice(
      "cA-k-ca",
      "Keep both identities",
      "Which pair explains all supplied positions?",
      "Potassium and calcium ions",
      {
        "Sodium and calcium ions": "Sodium would add 2 and 9, not 3 and 11.",
        "Lithium and copper(II) ions": "That union differs.",
      },
      "Potassium contributes 3,6,11 and calcium 1,5,8.",
      "Use two complete references.",
      undefined,
      spec([1, 3, 5, 6, 8, 11], pair),
    ),
    choice(
      "cA-na-cu",
      "Read the table",
      "Which two ions match the original tabular mixture?",
      "Sodium and copper(II) ions",
      {
        "Potassium and copper(II) ions":
          "The original has sodium's 2 and 9, not potassium's 3 and 11.",
        "Calcium and lithium ions":
          "That pattern does not explain these positions.",
      },
      "Sodium's 2,6,9 and copper's 4,7,12 explain the table.",
      "Compare with the same-form supplied table.",
      undefined,
      spec([2, 4, 6, 7, 9, 12], pair, true),
    ),
    numeric(
      "cA-concentration",
      "Use new standards",
      "Read sodium concentration for the unknown response 39.",
      5,
      {
        title: "Supplied sodium calibration",
        calibration: {
          ion: "na",
          standards: [
            { concentration: 0, response: 4 },
            { concentration: 3, response: 25 },
            { concentration: 6, response: 46 },
          ],
          unknown: 39,
          maxResponse: 50,
          conditions:
            "Original supplied standards under identical conditions. Use the drawn straight segments; response units are arbitrary.",
        },
      },
    ),
    choice(
      "cA-range",
      "Limit the claim",
      "Standards cover responses 4–46; the unknown response is 70. No relationship above 46 is supplied. What is justified?",
      "Further suitable calibration evidence is needed for an exact concentration",
      {
        "An exact extrapolated concentration is established":
          "The relation above 46 is unspecified.",
        "No ion can be present": "Outside range does not mean absent.",
      },
      "The unknown lies outside the supplied calibrated range.",
      "Compare the unknown with the highest standard.",
    ),
    written(
      "cA-advantage",
      "One concise advantage",
      "State one advantage of instrumental analysis over a chemical test.",
      "More sensitive. Also accept more accurate, faster, determining concentration or a suitable smaller-sample advantage.",
      [
        "State one valid advantage; a concise statement satisfies this demand.",
        "Avoid infallibility claims.",
      ],
      "Choose one benefit.",
    ),
    written(
      "cA-mask",
      "Explain masked colour",
      "Two metal ions have different flame colours. Why might a visual flame test fail to identify both?",
      "Their colours can mix or one colour can mask the other, so the combined visible colour may not reveal both ions.",
      [
        "Recognise different flame colours.",
        "Explain mixing or masking and its consequence for identification.",
      ],
      "Link separate colours to their combined appearance.",
    ),
  ],
  [
    choice(
      "cB-output",
      "Explain the light path",
      "Which statement correctly describes the specified output?",
      "Emitted light passes through a spectroscope to produce a line spectrum",
      {
        "The cold beaker's mass produces a spectrum": "That is not the method.",
        "Only absorbed light from a separate source is measured":
          "The named method uses emission.",
      },
      "A flame sample emits light; the spectroscope gives a line spectrum.",
      "Track what gives out light and what resolves it.",
    ),
    choice(
      "cB-partial",
      "A different shared position",
      "Only position 1 was measured in a single-ion sample; other positions were not measured. What follows?",
      "Lithium or calcium remains unresolved",
      {
        "Lithium is uniquely identified": "Calcium also has position 1.",
        "Both lithium and calcium must be present":
          "A shared line alone does not establish a mixture.",
      },
      "Position 1 is shared by lithium and calcium in the supplied references.",
      "Do not treat unmeasured lines as absent.",
      undefined,
      spec(
        [1],
        "Partial single-ion record: unrecorded positions were not measured.",
        true,
      ),
    ),
    choice(
      "cB-k-cu",
      "Identify a new pair",
      "Which two ions explain the complete supplied spectrum?",
      "Potassium and copper(II) ions",
      {
        "Sodium and copper(II) ions":
          "Sodium's 2 and 9 are not the potassium positions supplied.",
        "Lithium and copper(II) ions":
          "Lithium's 1 and 10 do not explain 3,6,11.",
      },
      "Potassium gives 3,6,11 and copper gives 4,7,12.",
      "Compare all original positions.",
      undefined,
      spec([3, 4, 6, 7, 11, 12], pair),
    ),
    choice(
      "cB-ca-cu",
      "Read another mixture table",
      "Which two ions match the complete tabular record?",
      "Calcium and copper(II) ions",
      {
        "Calcium and lithium ions":
          "Lithium would add 10 rather than copper's 7 and 12.",
        "Potassium and copper(II) ions":
          "Potassium would add 3,6,11 rather than 1,5,8.",
      },
      "Calcium's 1,5,8 and copper's 4,7,12 explain the original table.",
      "Use the table in the same form as the references.",
      undefined,
      spec([1, 4, 5, 7, 8, 12], pair, true),
    ),
    numeric(
      "cB-concentration",
      "A different scale",
      "Read lithium concentration at response 30.",
      6,
      {
        title: "Supplied lithium calibration",
        calibration: {
          ion: "li",
          standards: [
            { concentration: 0, response: 6 },
            { concentration: 4, response: 22 },
            { concentration: 8, response: 38 },
          ],
          unknown: 30,
          maxResponse: 40,
          conditions:
            "Original illustrative standards: unchanged settings, chosen lithium line, straight segments between standards.",
        },
      },
    ),
    choice(
      "cB-identity",
      "Identity without standards",
      "Several line positions identify potassium, but no intensity or concentration standards are supplied. What can be concluded?",
      "Potassium is identified; its concentration is not determined",
      {
        "Three lines mean 3 mg/dm³": "Line count is not a concentration scale.",
        "The whole solution must be pure potassium":
          "Identification does not establish purity.",
      },
      "Matching positions gives identity. Concentration needs response linked to known standards.",
      "Separate the two analytical questions.",
    ),
    choice(
      "cB-sensitive",
      "Interpret a comparison",
      "One method detects 0.02 mg/dm³ and the other detects only 0.8 mg/dm³ or above, under valid comparable conditions. What does this support?",
      "The first method is more sensitive",
      {
        "The first is faster": "No times are supplied.",
        "The first has proven better precision":
          "No repeat agreement is supplied.",
      },
      "The first detects a smaller concentration, so it is more sensitive in this comparison.",
      "Compare detection limits.",
    ),
    written(
      "cB-measurement",
      "Explain concentration evidence",
      "Explain why a line-pattern identity is insufficient to report concentration, and what extra evidence is needed.",
      "Positions identify the ion. Measure the relevant response and use known concentration standards for that same ion and line under matched conditions, accounting for background and the calibrated range.",
      [
        "Separate line positions/identity from response/concentration.",
        "Use known standards for the same ion under matched conditions.",
        "Keep the estimate within supported calibration evidence.",
      ],
      "Specify what relates signal to amount per volume.",
    ),
  ],
];
const reviewForms: LearningTask[][] = [
  [
    choice(
      "vA-li-ca",
      "Retrieve mixture matching",
      "Which two ions explain this complete mixture?",
      "Lithium and calcium ions",
      {
        "Lithium and copper(II) ions":
          "Copper would add 7 and 12 and not calcium's 5 and 8.",
        "Sodium and calcium ions":
          "Sodium's 2,6,9 do not match lithium's positions.",
      },
      "Lithium and calcium share 1; the union is 1,4,5,8,10.",
      "Match complete patterns, counting overlap once.",
      undefined,
      spec([1, 4, 5, 8, 10], pair),
    ),
    numeric(
      "vA-cal",
      "Retrieve calibration",
      "Read copper(II) concentration at response 19.",
      3,
      {
        title: "Supplied copper calibration",
        calibration: {
          ion: "cu",
          standards: [
            { concentration: 0, response: 1 },
            { concentration: 2, response: 13 },
            { concentration: 4, response: 25 },
            { concentration: 6, response: 37 },
          ],
          unknown: 19,
          maxResponse: 40,
          conditions:
            "Original illustrative standards with unchanged conditions and straight connecting segments.",
        },
      },
    ),
    choice(
      "vA-background",
      "Retrieve the blank",
      "A blank gives response 4. What is its useful role?",
      "Checking background from the method",
      {
        "Replacing all known concentration standards":
          "A blank is one zero-analyte measurement, not all standards.",
        "Proving absence of every possible ion":
          "The blank does not establish the unknown's composition.",
      },
      "The blank checks background alongside the standards.",
      "Think about response when none of the measured ion is supplied.",
    ),
    written(
      "vA-advantage",
      "Retrieve an advantage",
      "Give one valid advantage of instrumental analysis over chemical testing.",
      "It can be faster. Also accept more sensitive, more accurate, measuring concentration or a suitable smaller-sample advantage.",
      [
        "Give one valid concise advantage.",
        "Do not claim perfect immunity to error.",
      ],
      "Recall one of the specified benefits.",
    ),
  ],
  [
    choice(
      "vB-na-k",
      "Retrieve overlapping patterns",
      "Which two ions explain this complete spectrum?",
      "Sodium and potassium ions",
      {
        "Sodium alone": "Sodium does not explain 3 and 11.",
        "Potassium alone": "Potassium does not explain 2 and 9.",
      },
      "Sodium and potassium share 6; their union is 2,3,6,9,11.",
      "Explain all positions, not just the shared one.",
      undefined,
      spec([2, 3, 6, 9, 11], pair, true),
    ),
    numeric(
      "vB-cal",
      "Retrieve another scale",
      "Read calcium concentration at response 22.",
      4,
      {
        title: "Supplied calcium calibration",
        calibration: {
          ion: "ca",
          standards: [
            { concentration: 0, response: 2 },
            { concentration: 3, response: 17 },
            { concentration: 6, response: 32 },
          ],
          unknown: 22,
          maxResponse: 40,
          conditions:
            "Original illustrative standards: same calcium line and conditions, straight segments between the supplied standards.",
        },
      },
    ),
    choice(
      "vB-rapid",
      "Retrieve speed evidence",
      "A valid instrumental result takes 15 seconds; the chemical test takes 3 minutes. Which advantage is shown?",
      "The instrumental method is faster here",
      {
        "The instrument's accuracy is proven better":
          "No accepted-value comparison is supplied.",
        "The chemical test proves purity": "Timing does not establish purity.",
      },
      "15 seconds is less than 180 seconds; this comparison supports speed.",
      "Compare the same time units.",
    ),
    choice(
      "vB-settings",
      "Retrieve calibration conditions",
      "An instrument gain changes after standards are measured. What should be done?",
      "Obtain standards under the changed conditions",
      {
        "Assume the old graph still applies exactly":
          "The changed settings may change the response.",
        "Use the line count as concentration":
          "That does not calibrate concentration.",
      },
      "Standards and unknown must be comparable under the measurement conditions.",
      "Check whether the response relationship remains established.",
    ),
  ],
];
export const instrumentalRecoveryRoutes: Record<string, string> = {};
for (const [s, r] of [
  ["p-method", "r-path"],
  ["p-k", "r-positions"],
  ["p-ca", "r-positions"],
  ["p-cu", "r-positions"],
  ["p-li", "r-positions"],
  ["p-shared", "r-positions"],
  ["p-cana", "r-mixture"],
  ["p-licu", "r-mixture"],
  ["p-cal3", "r-calibration"],
  ["p-cal25", "r-calibration"],
  ["p-cal5", "r-calibration"],
  ["p-intensity", "r-calibration"],
  ["p-blank", "r-blank"],
  ["p-settings", "r-calibration"],
  ["p-range", "r-range"],
  ["p-repeat", "r-precision"],
  ["p-sensitive", "r-sensitive"],
  ["p-accuracy", "r-accuracy"],
  ["p-rapid", "r-rapid"],
  ["p-oneadv", "r-sensitive"],
  ["p-mask", "r-mask"],
  ["p-fingerprint", "r-positions"],
  ["p-concentration-plan", "r-calibration"],
  ["p-limit", "r-sensitive"],
]) {
  const q = practice.find((q) => q.id === id(s))!;
  q.followUp = id(r);
  instrumentalRecoveryRoutes[q.id] = id(r);
}
for (const [s, r] of [
  ["w-ion", "r-path"],
  ["w-light", "r-path"],
  ["w-scale", "r-calibration"],
  ["w-accuracy", "r-accuracy"],
])
  warmup.find((q) => q.id === id(s))!.followUp = id(r);
export const allInstrumentalTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const instrumentalExposureFamilies = {
  method: ["r-path", "g-path", "p-method", "cA-method", "cB-output"],
  positions: ["r-positions", "p-fingerprint"],
  potassium: ["r-positions", "p-k"],
  sodium: ["g-na"],
  calcium: ["p-ca"],
  copper: ["p-cu"],
  lithium: ["p-li"],
  caNa: ["g-mixture", "p-cana"],
  liCu: ["r-mixture", "g-overlap", "p-licu"],
  partial6: ["g-shared", "p-shared"],
  cal4: ["r-calibration", "g-cal4"],
  cal3: ["g-cal3", "p-cal3"],
  concentration: [
    "p-intensity",
    "p-concentration-plan",
    "cB-identity",
    "cB-measurement",
  ],
  blank: ["r-blank", "g-background", "p-blank", "vA-background"],
  range: ["r-range", "g-range", "p-range", "cA-range"],
  conditions: ["p-settings", "vB-settings"],
  precision: [
    "w-accuracy",
    "r-precision",
    "p-repeat",
    "r-accuracy",
    "g-accuracy",
    "p-accuracy",
  ],
  sensitive: ["r-sensitive", "p-sensitive", "cB-sensitive"],
  rapid: ["r-rapid", "p-rapid", "vB-rapid"],
  advantage: [
    "r-sensitive",
    "g-accuracy",
    "p-sensitive",
    "p-accuracy",
    "p-rapid",
    "p-oneadv",
    "p-limit",
    "cA-advantage",
    "vA-advantage",
  ],
  masking: ["r-mask", "p-mask", "cA-mask"],
};
for (const family of Object.values(instrumentalExposureFamilies))
  for (const s of family) {
    const q = allInstrumentalTasks.find((q) => q.id === id(s))!;
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...family.filter((other) => other !== s).map(id),
      ]),
    ];
  }
export const instrumentalJourney: LessonJourney = {
  version: 1,
  introduction:
    "Compare emitted-light patterns, identify metal ions and use supplied standards to measure concentration. Keep every proposal distinct from the original evidence.",
  scopeNote:
    "AQA separate Chemistry, both tiers, 4.8.3.6–7. Original schematic reference charts/tables and supplied calibration applications; positions are not real wavelengths to memorise. School practical work still needs qualified supervision. Extended responses are self-reviewed, without examiner marks.",
  outcomes: [
    "Describe the sample, emitted light, spectroscope and line-spectrum sequence.",
    "Interpret supplied spectra and tables, including two-ion mixtures and shared-line uncertainty.",
    "Distinguish ion identity from concentration; use supplied standards and labelled units.",
    "Interpret sensitivity, accuracy and speed without claiming immunity to error.",
    "Explain masked flame colours and justify measurement decisions.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Emission and ion fingerprints",
      taskIds: practice.slice(0, 8).map((q) => q.id),
    },
    {
      label: "Concentration and evidence quality",
      taskIds: practice.slice(8, 16).map((q) => q.id),
    },
    {
      label: "Advantages and written explanations",
      taskIds: practice.slice(16).map((q) => q.id),
    },
  ],
};
