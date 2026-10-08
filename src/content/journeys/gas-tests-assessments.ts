import {
  choice as c,
  written as w,
  drawing as d,
  type GasTask,
} from "./gas-tests-tasks";
// Reserved original forms: no teaching-model bindings. All feedback is deferred.
export const gasCheckForms: GasTask[][] = [
  [
    {
      ...c(
        "cA-pair",
        "Interpret two original figures",
        "Use the two original figures and observations. Which identification pair is supported within the stated single-gas set?",
        "A oxygen; B chlorine",
        {
          "A hydrogen; B carbon dioxide":
            "Those do not match the glowing-splint relighting and damp-litmus bleaching records.",
          "A chlorine; B oxygen": "That reverses the test/result pairs.",
        },
        "A’s initially glowing splint relights; B bleaches damp litmus white. Within the stated four-gas set these support oxygen and chlorine respectively.",
        "Use each complete test/result pair.",
      ),
      gasGiven: { record: "pairA" },
    },
    c(
      "cA-h-method",
      "Specify a hydrogen test",
      "Which method and positive observation form the characteristic hydrogen test?",
      "Burning splint at the open end; a pop",
      {
        "Glowing splint inserted; relights": "That is the oxygen test.",
        "Damp litmus in contact; bleached white": "That is the chlorine test.",
      },
      "Hydrogen is tested with a burning splint held at the open end and burns rapidly with a pop.",
      "Keep state, position and result together.",
    ),
    c(
      "cA-reagent",
      "Name the limewater solute",
      "A fresh reagent bottle is labelled limewater. Which dissolved substance is present?",
      "Calcium hydroxide",
      {
        "Calcium carbonate":
          "Calcium carbonate is the precipitate associated with the positive CO2 test.",
        "Calcium chloride": "That does not name limewater.",
      },
      "Limewater is aqueous calcium hydroxide.",
      "Distinguish starting reagent and product.",
    ),
    c(
      "cA-dry",
      "Evaluate an invalid negative",
      "A technician’s record says dry litmus stayed blue in a gas sample. Which conclusion is justified?",
      "The record does not rule out chlorine because the specified test requires damp litmus",
      {
        "Chlorine is absent because any dry paper result is decisive":
          "The dampness condition is missing.",
        "The sample is oxygen because chlorine was not shown":
          "There is no valid oxygen observation.",
      },
      "An invalid negative cannot rule out the target or identify a replacement gas.",
      "Evaluate the method before its conclusion.",
    ),
    c(
      "cA-mixture-two",
      "Combine two positive observations",
      "A mixed sample relights a glowing splint. A separate portion makes fresh limewater cloudy. What is supported?",
      "Oxygen and carbon dioxide are present; other components remain undetermined",
      {
        "The whole sample is pure oxygen":
          "The positive limewater result also supports CO2.",
        "The whole sample is pure carbon dioxide":
          "The glowing-splint result also supports oxygen.",
      },
      "The two valid positive test records support the presence of two gases, without identifying every component.",
      "Use both records and keep the mixture limit.",
    ),
    w(
      "cA-written",
      "Compare two splint tests",
      "Describe how a technician could distinguish a supplied single hydrogen sample from a supplied single oxygen sample using the two characteristic splint tests. Include starting state, contact and positive result.",
      "Hydrogen: hold a burning splint at the open end of its test tube; it burns with a pop. Oxygen: insert a glowing splint into the gas; the splint relights.",
      [
        "Hydrogen: burning splint at the open end.",
        "Hydrogen: pop.",
        "Oxygen: initially glowing splint inserted.",
        "Oxygen: relights.",
      ],
      "Write separate complete test/result pairs.",
    ),
    d(
      "cA-drawing",
      "Construct a new hydrogen diagram",
      "Independently annotate the blank test-tube schematic for hydrogen. Label the starting condition, position, positive observation and identification.",
      { mode: "splint", record: "hydrogenCheckA" },
      "A burning splint held at the open end gives a pop, supporting hydrogen present.",
      [
        "Show contact at the tube mouth.",
        "Label a burning splint.",
        "Label the pop sound.",
        "Identify hydrogen from that pair.",
      ],
    ),
    c(
      "cA-incomplete",
      "Interpret an incomplete observation",
      "Damp blue litmus becomes red, but the observer records no later appearance. Which statement is justified?",
      "An acidic response is recorded; the missing bleaching observation prevents unique chlorine identification",
      {
        "Red alone proves chlorine uniquely":
          "Other acidic responses are possible; bleaching is the distinguishing chlorine observation here.",
        "Chlorine is definitely absent":
          "The later appearance is not recorded.",
      },
      "Use what was actually recorded. The red-only, truncated record neither gives the characteristic bleaching evidence nor establishes absence.",
      "Do not invent the unrecorded final stage.",
    ),
  ],
  [
    {
      ...c(
        "cB-pair",
        "Interpret another pair of original figures",
        "Use the supplied K and L records. Which identification pair is supported within the stated single-gas set?",
        "K hydrogen; L carbon dioxide",
        {
          "K oxygen; L chlorine":
            "Neither matches the supplied burning-splint pop and cloudy-limewater records.",
          "K carbon dioxide; L hydrogen":
            "That reverses the test/result pairs.",
        },
        "K gives a pop with a burning splint at the open end; L makes limewater milky. These support hydrogen and CO2 within the stated set.",
        "Match each record separately.",
      ),
      gasGiven: { record: "pairB" },
    },
    c(
      "cB-o-method",
      "Specify an oxygen test",
      "Which method and positive observation form the characteristic oxygen test?",
      "Insert a glowing splint; it relights",
      {
        "Use a cold splint; oxygen must ignite it":
          "The specified test starts with a glowing splint.",
        "Hold a burning splint at the mouth; a pop":
          "That is the hydrogen test.",
      },
      "Oxygen supports combustion and relights an initially glowing splint inserted into the gas.",
      "State the initial glow and the later change.",
    ),
    c(
      "cB-reagent-result",
      "Identify the changed object",
      "A sample makes fresh limewater milky. What does the positive record actually describe?",
      "A white precipitate/cloudiness in the limewater",
      {
        "The gas itself becomes white": "The change occurs in the liquid.",
        "The delivery tube becomes purple":
          "That is not the supplied observation.",
      },
      "The limewater becomes milky/cloudy; a white precipitate is an accepted description in the reviewed AQA questions.",
      "Name the object that changes.",
    ),
    c(
      "cB-contact",
      "Evaluate a missed liquid",
      "A delivery outlet ends above limewater, and no bubbles enter the liquid. The limewater stays clear. Which conclusion is justified?",
      "This record does not rule out CO2 because the requested bubbling contact never occurred",
      {
        "CO2 is absent because any clear liquid proves absence":
          "The required gas/reagent contact was not achieved.",
        "The gas must be chlorine": "There is no damp-litmus bleaching result.",
      },
      "The record has a method limitation, not a valid new gas identity.",
      "Trace whether gas passed through the reagent.",
    ),
    c(
      "cB-mixture-limit",
      "Combine a presence claim with missing tests",
      "A mixed sample bleaches damp litmus white. No tests of its other components are recorded. Which conclusion best respects the evidence within this GCSE four-gas context?",
      "Chlorine is present; the other components are undetermined",
      {
        "The entire mixture is pure chlorine":
          "The positive test does not identify every component.",
        "Carbon dioxide is definitely absent": "No CO2 test is recorded.",
      },
      "Keep the positive identification and the limit imposed by the untested components.",
      "Do not turn presence into purity.",
    ),
    w(
      "cB-written",
      "Evaluate a flawed oxygen test",
      "A student inserts a cold unlit splint into a collected sample and observes no flame. The student writes “oxygen is absent”. Evaluate the method and conclusion, and state the correct test and positive result.",
      "The specified oxygen test starts with a glowing splint, not cold wood. No flame from a cold splint does not rule out oxygen. Insert a glowing splint; it relights in oxygen, which supports combustion.",
      [
        "Identify the wrong starting condition.",
        "Reject absence as unsupported by this method.",
        "Give glowing splint inserted.",
        "Give relighting and oxygen supporting burning.",
      ],
      "Separate a failed method from a valid negative.",
    ),
    d(
      "cB-drawing",
      "Construct a new chlorine diagram",
      "Independently annotate the blank schematic for a chlorine test. Label the paper condition, gas contact, complete positive observation and identification.",
      { mode: "litmus", record: "chlorineCheckB" },
      "Damp litmus contacts the sample and is bleached white. Damp blue litmus may become red first. The full test supports chlorine present.",
      [
        "Use damp litmus.",
        "Show paper in gas contact.",
        "Include bleaching white, with red then white if using blue.",
        "Identify chlorine and avoid treating red alone as unique evidence.",
      ],
    ),
    c(
      "cB-shaking",
      "Recognise the specified alternative",
      "A school record says fresh limewater was shaken with a collected gas and became cloudy. Which statement is supported?",
      "This is a specified positive CO2 test even though no delivery tube was used",
      {
        "AQA requires a delivery tube for every valid CO2 test":
          "The specification permits shaking with or bubbling through limewater.",
        "Cloudy is never accepted in the reviewed AQA schemes":
          "The actual reviewed schemes accept milky/cloudy.",
      },
      "The permitted contact methods include shaking; the observed limewater change is positive.",
      "Use the stated method and result.",
    ),
  ],
];
export const gasReviewForms: GasTask[][] = [
  [
    c(
      "vA-record-limit",
      "Return to evidence limits",
      "A new mixed school sample makes limewater cloudy. A student claims this also proves oxygen absent. What is the useful correction?",
      "CO2 is present, but no conclusion about oxygen follows without its test",
      {
        "Cloudy limewater is an oxygen test": "It is the CO2 test.",
        "The student is correct because mixtures contain one gas":
          "Mixtures have multiple components.",
      },
      "Evidence for CO2 does not settle whether oxygen is also present.",
      "Separate tested and untested components.",
    ),
    c(
      "vA-chlorine",
      "Retrieve the full litmus change",
      "What is the complete characteristic positive change when chlorine contacts damp blue litmus?",
      "It may first turn red, then is bleached white",
      {
        "It stays permanently red, which is unique to chlorine":
          "The bleaching is the identifying observation.",
        "It turns the gas white": "The change occurs in litmus paper.",
      },
      "Include dampness and bleaching. Red alone is not unique chlorine evidence.",
      "Read past the intermediate stage.",
    ),
    w(
      "vA-two-records",
      "Explain two observation records",
      "One collected sample relights an inserted glowing splint. A different collected sample gives a pop with a burning splint at the open end. Identify each within the four-core-gas set and explain why the starting states differ.",
      "The first supports oxygen: a glowing splint relights because oxygen supports burning. The second supports hydrogen: a burning splint supplies ignition and hydrogen burns rapidly with a pop. Glowing and burning are distinct starting states.",
      [
        "First: oxygen from relighting.",
        "Second: hydrogen from the pop.",
        "Distinguish glowing from a visible flame.",
        "Keep procedure and result matched.",
      ],
      "Write two justified identifications.",
    ),
    d(
      "vA-drawing",
      "Construct a fresh mixed-sample test",
      "Draw and label a bubbling test for CO2 in the new mixed sample. Include reagent, outlet, positive change and a conclusion limited by the mixture.",
      { mode: "liquid", record: "co2ReviewA" },
      "Fresh limewater, outlet below the surface, milky/cloudy liquid. CO2 is present; other components and purity remain undetermined.",
      [
        "Name aqueous calcium hydroxide/limewater.",
        "Place the outlet below its surface.",
        "Label cloudiness in the liquid.",
        "Give presence without a purity claim.",
      ],
    ),
  ],
  [
    c(
      "vB-method",
      "Retrieve the hydrogen procedure",
      "Which complete procedure and positive result belong together for hydrogen?",
      "Burning splint at the open end; a pop",
      {
        "Glowing splint inserted; relights": "That is oxygen.",
        "Damp litmus; bleached white": "That is chlorine.",
      },
      "Use a burning splint held at the open end; hydrogen burns rapidly with a pop.",
      "Keep starting state, position and result together.",
    ),
    c(
      "vB-negative",
      "Revisit an invalid negative",
      "A new sample is bubbled through pure water, which stays clear. A student rules out CO2. What is the useful correction?",
      "Use fresh limewater; pure water has not performed the specified identification test",
      {
        "Keep using water and name oxygen instead": "No oxygen test is given.",
        "The student’s conclusion is already justified":
          "Water is not the limewater reagent.",
      },
      "The reagent error makes this record inconclusive for the specified CO2 test.",
      "Check the reagent before the identity.",
    ),
    w(
      "vB-litmus-limit",
      "Evaluate a truncated paper record",
      "An observer records damp blue litmus becoming red but does not record later appearance. Explain what the observation supports and why it does not uniquely identify chlorine or establish chlorine absent.",
      "The red change supports an acidic response. The characteristic chlorine result is bleaching damp litmus white, possibly after red. Because later appearance is missing, this record cannot uniquely identify chlorine or rule it out.",
      [
        "Use red as an acidic response.",
        "State bleaching white as the characteristic chlorine result.",
        "Use the missing later observation to limit both identification and absence.",
      ],
      "Use only recorded evidence.",
    ),
    d(
      "vB-drawing",
      "Construct a fresh oxygen test",
      "Draw and label the new oxygen test: initial splint condition, position, positive change and oxygen’s role.",
      { mode: "splint", record: "oxygenReviewB" },
      "An inserted glowing splint relights. Oxygen is present and supports burning; it is not the fuel.",
      [
        "Label glowing rather than cold/initial flame.",
        "Place it in the sample.",
        "Label relighting.",
        "Describe oxygen as supporting combustion.",
      ],
    ),
  ],
];
