import {
  choice as c,
  written as w,
  drawing as d,
  type GasTask,
} from "./gas-tests-tasks";
export const gasPractice: GasTask[] = [
  c(
    "p-hydrogen-state",
    "Correct a hydrogen proposal",
    "A proposed hydrogen test uses a glowing splint at the open end. What change is required?",
    "Use a burning splint at the open end",
    {
      "Use a cold unlit splint":
        "That does not supply the specified ignition test.",
      "Keep the glowing splint because all splints are equivalent":
        "The starting states are different.",
    },
    "Correct the state to burning; the mouth position is already appropriate.",
    "Change the actual error, not every part.",
    { mode: "procedure", record: "hydrogen-glowing-error", focus: "all" },
  ),
  c(
    "p-oxygen-state",
    "Correct a cold-splint proposal",
    "A proposed oxygen test inserts a cold unlit splint. What correction is necessary?",
    "Insert a glowing splint",
    {
      "Keep cold wood; oxygen must ignite it":
        "Oxygen supports combustion but is not ordinarily an ignition source for cold wood.",
      "Use limewater instead": "That is the CO2 reagent.",
    },
    "A glowing splint retains a hot end and can relight in oxygen.",
    "Specify the starting state.",
    { mode: "procedure", record: "oxygen-unlit-error", focus: "all" },
  ),
  c(
    "p-relights",
    "Interpret the initial and final states",
    "Read the original sequence: initially glowing, then a flame appears. What is the positive oxygen observation?",
    "The glowing splint relights",
    {
      "The oxygen itself burns as fuel": "The splint is the burning material.",
      "A cold splint stays unlit": "That is not the supplied sequence.",
    },
    "Relighting describes the change from an initially glowing splint to a flame.",
    "Read both states.",
    { mode: "observation", record: "relight-record", focus: "all" },
  ),
  c(
    "p-cloudy",
    "Distinguish bubbling from identification",
    "In the original limewater record, what identifies CO2 rather than merely showing gas delivery?",
    "The limewater becomes milky/cloudy",
    {
      "Bubbles pass through":
        "Many gases can form bubbles when delivered through liquid.",
      "The delivery tube exists":
        "Apparatus presence alone is not a positive result.",
    },
    "Cloudiness in the specified reagent is the identifying observation here.",
    "Separate delivery from the reagent change.",
    { mode: "observation", record: "cloudy-record", focus: "all" },
  ),
  c(
    "p-shaken",
    "Recognise another valid contact method",
    "Fresh limewater is shaken with the collected gas and becomes cloudy. Does this perform an AQA CO2 test?",
    "Yes; shaking with limewater is a specified valid method",
    {
      "No; only bubbling can ever be valid":
        "AQA explicitly allows shaking or bubbling.",
      "No; cloudy never counts in AQA":
        "The reviewed AQA mark schemes accept milky/cloudy.",
    },
    "Both shaking with and bubbling through limewater can give the specified positive result.",
    "Use the actual specification rather than one remembered diagram.",
    { mode: "observation", record: "shaken-limewater", focus: "all" },
  ),
  c(
    "p-identify-h",
    "Identify sample K",
    "K is one of the four core gases. A burning splint at its open end gives a pop. Which gas?",
    "Hydrogen",
    {
      Oxygen: "That gas relights a glowing splint in its characteristic test.",
      Chlorine: "Its test bleaches damp litmus.",
    },
    "The test/result pair identifies hydrogen within the supplied candidate set.",
    "Use the complete pair.",
    { mode: "identification", record: "unknown-pop", focus: "all" },
  ),
  c(
    "p-identify-o",
    "Identify sample M",
    "M is one of the four core gases. A glowing splint inserted into it relights. Which gas?",
    "Oxygen",
    {
      "Carbon dioxide": "CO2 makes limewater milky/cloudy.",
      Hydrogen: "Its pop test uses a burning splint.",
    },
    "The initially glowing splint relighting identifies oxygen here.",
    "Do not replace glowing with burning.",
    { mode: "identification", record: "unknown-relight", focus: "all" },
  ),
  c(
    "p-identify-c",
    "Identify sample R",
    "R is one of the four core gases. It makes fresh limewater milky when bubbled through it. Which gas?",
    "Carbon dioxide",
    {
      Oxygen: "No glowing-splint result is given.",
      Chlorine: "No damp-litmus bleaching result is given.",
    },
    "The limewater change identifies CO2 within the stated set.",
    "Keep the liquid change attached to its reagent.",
    { mode: "identification", record: "unknown-limewater", focus: "all" },
  ),
  c(
    "p-identify-cl",
    "Identify sample T",
    "T is one of the four core gases. Damp litmus in contact with it is bleached white. Which gas?",
    "Chlorine",
    {
      Hydrogen: "That uses a burning-splint pop test.",
      Oxygen: "That uses a glowing-splint relighting test.",
    },
    "Damp-litmus bleaching is the positive chlorine observation in this four-gas problem.",
    "Use the whole change.",
    { mode: "identification", record: "unknown-bleaching", focus: "all" },
  ),
  c(
    "p-mixture",
    "Interpret a mixed exhaust sample",
    "A gas mixture makes fresh limewater cloudy. Which conclusion is warranted?",
    "Carbon dioxide is present; the complete composition remains unknown",
    {
      "The entire mixture is pure carbon dioxide":
        "A positive test for a component does not prove purity.",
      "Oxygen cannot be present": "No oxygen test is recorded.",
    },
    "The positive test supports CO2 present while leaving other components undetermined.",
    "Preserve the mixture condition.",
    { mode: "identification", record: "exhaust-mixture", focus: "all" },
  ),
  c(
    "p-electrolysis",
    "Use the observation in a new context",
    "A school electrolysis sample U gives a pop with a burning splint at its open end. Which gas is supported within the H2/O2/Cl2 set?",
    "Hydrogen",
    {
      "Chlorine, because electrolysis always produces chlorine":
        "Products depend on conditions, and this actual test gives hydrogen evidence.",
      "Oxygen, because every electrolysis gas is oxygen":
        "The source gives a pop, not relighting.",
    },
    "Identify from the test record; do not guess from an unspecified electrode or solution.",
    "Context does not replace observation.",
    { mode: "identification", record: "electrolysis-sample", focus: "all" },
  ),
  c(
    "p-damp",
    "Compare otherwise matched strips",
    "The same chlorine sample leaves dry blue litmus unchanged but bleaches damp blue litmus. What is the decisive method difference?",
    "Paper dampness",
    {
      "A different gas in each test": "The record states the same gas.",
      "The identity of the glass tube": "No such difference is supplied.",
    },
    "Dampness matters to the specified litmus test. An unchanged dry strip does not rule out chlorine.",
    "Hold the known sample fixed.",
    { mode: "comparison", record: "damp-versus-dry", focus: "all" },
  ),
  c(
    "p-reagent",
    "Compare two clear liquids",
    "A known CO2 sample leaves pure water clear but makes fresh limewater cloudy. Which record performs the specified identification test?",
    "The limewater record",
    {
      "The water record, because bubbles prove CO2":
        "Bubbles show delivery, not identity.",
      "Neither, because milky/cloudy is always invalid":
        "The reviewed AQA results accept that wording.",
    },
    "The reagent is aqueous calcium hydroxide, not simply any clear liquid.",
    "Compare receiving reagents.",
    { mode: "comparison", record: "limewater-versus-water", focus: "all" },
  ),
  c(
    "p-outlet",
    "Compare two outlet positions",
    "The same known CO2 sample is supplied above limewater in A and bubbled through it in B. Which record performs the requested bubbling test?",
    "B: the outlet below the liquid surface",
    {
      "A: the outlet above the liquid":
        "The original record says no bubbles pass through its liquid.",
      "Both methods are equivalent to bubbling":
        "A does not make the specified gas/liquid contact.",
    },
    "The outlet must deliver the gas through the liquid for this arrangement.",
    "Trace actual contact.",
    { mode: "comparison", record: "outlet-position", focus: "all" },
  ),
  c(
    "p-methods",
    "Compare shaking and bubbling",
    "One known CO2 sample makes limewater cloudy when shaken with it; another portion makes it milky when bubbled through. Which records are valid positive tests?",
    "Both",
    {
      "Only bubbling": "The specification also allows shaking.",
      "Neither; milky and cloudy describe different gases":
        "They describe the positive limewater result here.",
    },
    "Both contact methods are specified; both recorded liquid changes support CO2.",
    "Check the allowed methods and actual results.",
    { mode: "comparison", record: "shake-or-bubble", focus: "all" },
  ),
  c(
    "p-word-glow",
    "Repair a vague oxygen answer",
    "Review “Put a splint in the gas. It burns.” Which replacement is precise?",
    "Insert a glowing splint; it relights",
    {
      "Put any cold splint nearby; it ignites itself":
        "That changes both the starting state and contact incorrectly.",
      "Use a burning splint and listen for a pop": "That is the hydrogen test.",
    },
    "State the initial glow, insertion and later relighting.",
    "Include the change, not merely burning.",
    { mode: "wording", record: "splint-unspecified", focus: "all" },
  ),
  c(
    "p-word-red",
    "Repair an incomplete chlorine result",
    "Review “Blue litmus turns red” as the positive chlorine test. Which missing change matters?",
    "The damp litmus is bleached white",
    {
      "A pop sound": "That belongs to the hydrogen test.",
      "The gas must turn purple": "No such result is part of this test.",
    },
    "Red alone is not the distinguishing chlorine result; include dampness and bleaching.",
    "Read past the acid response.",
    { mode: "wording", record: "red-only", focus: "all" },
  ),
  c(
    "p-word-h",
    "Include the test as well as the result",
    "A student answers “It makes a pop” to “Describe the hydrogen test and its positive result.” What must be added?",
    "A burning splint held at the open end of the test tube",
    {
      "A glowing splint relights": "That is the oxygen test/result pair.",
      "Pure water becomes purple": "Neither reagent nor result fits.",
    },
    "The pop is the result; the question also requires the burning-splint procedure.",
    "Check both parts of the command.",
    { mode: "wording", record: "hydrogen-method-result", focus: "all" },
  ),
  c(
    "p-distinguish",
    "Distinguish CO2 from oxygen",
    "Which matched pair distinguishes the two gases using their characteristic tests?",
    "CO2 clouds limewater; oxygen relights a glowing splint",
    {
      "Both give a pop with a burning splint": "That is the hydrogen result.",
      "Both bleach dry litmus white":
        "The chlorine test requires damp litmus and is not the given pair.",
    },
    "Use different test/result pairs rather than generic signs that gas is present.",
    "Attach each observation to its test.",
  ),
  c(
    "p-no-other-gas",
    "Reject an unsupported replacement identity",
    "A faulty chlorine test uses dry paper and gives no change. Which conclusion is justified?",
    "The record cannot identify a replacement gas",
    {
      "The sample must be oxygen": "No valid oxygen test is recorded.",
      "The sample must be carbon dioxide":
        "No valid limewater result is recorded.",
    },
    "An invalid negative does not identify another gas. Correct the test and obtain relevant evidence.",
    "Do not treat failure as a new positive test.",
  ),
  w(
    "p-explain-liquid",
    "Explain an imprecise CO2 answer",
    "A student writes “The gas turns white” after a positive limewater test. Correct the wording and identify the starting reagent.",
    "The limewater, an aqueous solution of calcium hydroxide, becomes milky/cloudy. A white calcium carbonate precipitate forms. The change is in the liquid, not a white gas.",
    [
      "Name limewater or aqueous calcium hydroxide as reagent.",
      "Say the limewater becomes milky/cloudy or a white precipitate forms.",
      "Correct the claim that the gas changes to white.",
    ],
    "Name what was changed before naming a product.",
  ),
  w(
    "p-explain-lost",
    "Evaluate a lost-sample result",
    "A collected sample escapes before a burning splint is brought to the tube mouth. No pop is recorded. Explain why this does not establish that the original sample lacked hydrogen.",
    "The original gas was no longer in the collecting tube, so the later splint test did not test that original sample. No pop under these conditions cannot rule out hydrogen in it. A fresh collected sample must be tested with the specified method.",
    [
      "Use the explicitly lost sample, not a guessed gas identity.",
      "Explain why the absence of a pop is inconclusive.",
      "Propose testing a freshly collected sample.",
    ],
    "Check the sample before interpreting the result.",
  ),
  w(
    "p-explain-oxygen",
    "Explain relighting without making oxygen the fuel",
    "Describe a positive oxygen test and explain why “oxygen burns as the fuel” is a mistake.",
    "Insert a glowing splint into the gas; it relights. Oxygen supports the combustion of the splint. The splint is the burning material, so oxygen is not the fuel in this test.",
    [
      "State glowing splint and insertion.",
      "State relighting.",
      "Describe oxygen as supporting burning and the splint as fuel.",
    ],
    "Distinguish the supporting gas from the burning material.",
  ),
  d(
    "p-draw-oxygen",
    "Construct a labelled oxygen test",
    "Annotate the blank schematic with the starting splint state, position, positive result and warranted identification.",
    { mode: "splint", record: "oxygenPractice" },
    "A glowing splint is inserted into the sample; it relights, supporting oxygen present. Oxygen supports combustion.",
    [
      "Place the splint in the sample.",
      "Label the initial condition as glowing rather than cold or already flaming.",
      "Label relighting as the positive change.",
      "Give oxygen present and avoid claiming oxygen is the fuel.",
    ],
  ),
  d(
    "p-draw-co2",
    "Construct a labelled bubbling test",
    "Annotate the blank schematic with the receiving reagent, delivery outlet, positive change and conclusion.",
    { mode: "liquid", record: "co2Practice" },
    "Use fresh limewater, aqueous calcium hydroxide, with the outlet below its surface. The liquid becomes milky/cloudy, supporting carbon dioxide present.",
    [
      "Name limewater/aqueous calcium hydroxide.",
      "Put the outlet below the liquid surface for bubbling.",
      "Label a change in the limewater.",
      "Identify carbon dioxide present.",
    ],
  ),
  c(
    "p-supervision",
    "Keep the app’s experiment records in context",
    "Why are real gas tests performed with suitable school supervision and controls?",
    "Some gases and flame tests present serious hazards",
    {
      "All gases are harmless": "Some gases are toxic, oxidising or flammable.",
      "Small amounts never pose risk":
        "Quantity alone does not remove the relevant hazards.",
    },
    "These on-screen records are for interpreting evidence. Real tests require approved school procedures and supervision.",
    "Consider the gas and the use of a flame.",
  ),
];
