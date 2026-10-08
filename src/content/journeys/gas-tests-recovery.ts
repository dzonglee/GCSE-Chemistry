import { choice as c, type GasTask } from "./gas-tests-tasks";
export const gasRecovery: GasTask[] = [
  c(
    "r-supervision",
    "Match school controls to the activity",
    "Why do school gas tests need suitable supervision and approved controls?",
    "Toxic, flammable or oxidising gases and flames can create hazards",
    {
      "Every gas is harmless in any amount":
        "Gas identity, concentration and the activity matter.",
      "A screen model authorises a home experiment":
        "The model is for interpreting records, not authorising practical work.",
    },
    "The RSC teaching guidance distinguishes hydrogen’s flammability, oxygen’s oxidising role and chlorine’s toxicity. School procedures account for the gas and flame handling.",
    "Consider the particular gas and the test used.",
  ),
  c(
    "r-observe",
    "Report what was noticed",
    "Which phrase directly reports an observation?",
    "A glowing splint relights",
    {
      "The gas is pure oxygen": "That adds an identity and purity conclusion.",
      "The gas is definitely safe": "That is not an observed test result.",
    },
    "Relighting is an observable change; gas identity is an interpretation.",
    "Report the event before naming the gas.",
  ),
  c(
    "r-glow",
    "Keep the initial state explicit",
    "A hot splint end glows without a flame. Which description fits?",
    "Glowing",
    {
      "Cold and unlit": "The end is still hot and visibly glowing.",
      "Burning with a visible flame": "The source excludes a visible flame.",
    },
    "Glowing does not mean cold, and it does not mean already burning with a visible flame.",
    "Separate heat, glow and flame.",
  ),
  c(
    "r-aqueous",
    "Name the solution state",
    "A reagent label says aqueous calcium hydroxide. What is the solvent?",
    "Water",
    {
      "No solvent; it is a powder": "Aqueous means dissolved in water.",
      "The gas being tested":
        "The sample gas is not the solvent named by aqueous.",
    },
    "Water is the solvent in an aqueous solution.",
    "Read aqueous as water-based.",
  ),
  c(
    "r-presence",
    "Do not infer every component",
    "A mixture gives a positive test for one component. What remains open?",
    "The identities of its other components",
    {
      "Whether any other component exists": "The source says it is a mixture.",
      "Whether all components are identical":
        "Different components are compatible with a mixture.",
    },
    "A positive test supports presence, not complete composition or purity.",
    "Keep the word mixture in your conclusion.",
  ),
  c(
    "r-hydrogen",
    "Rebuild the pop evidence",
    "A burning splint at a tube mouth gives a pop. Which identification follows within the four-core-gas set?",
    "Hydrogen",
    {
      Oxygen:
        "The characteristic oxygen test is relighting of a glowing splint.",
      Chlorine: "Its test uses damp litmus and bleaching.",
    },
    "Burning splint at the open end plus a pop is the hydrogen test/result pair.",
    "Keep method and result together.",
    { mode: "evidence", record: "hydrogen-chain", focus: "all" },
  ),
  c(
    "r-oxygen",
    "Rebuild the relighting evidence",
    "A glowing splint inserted into the sample relights. Which gas is supported in the stated four-gas set?",
    "Oxygen",
    {
      Hydrogen: "Hydrogen is tested with a burning splint for a pop.",
      "Carbon dioxide": "Its positive test makes limewater milky/cloudy.",
    },
    "The oxygen test starts glowing and ends relit.",
    "Compare the initial and subsequent splint states.",
    { mode: "evidence", record: "oxygen-chain", focus: "all" },
  ),
  c(
    "r-co2",
    "Rebuild the cloudy-liquid evidence",
    "Fresh limewater becomes cloudy after gas is bubbled through it. Which gas is supported in the stated four-gas set?",
    "Carbon dioxide",
    {
      Hydrogen: "Bubbles alone do not give the hydrogen pop test.",
      Oxygen: "Oxygen is identified with a glowing splint.",
    },
    "CO2 makes aqueous calcium hydroxide, limewater, milky/cloudy.",
    "Name the reagent and its change.",
    { mode: "evidence", record: "co2-chain", focus: "all" },
  ),
  c(
    "r-chlorine",
    "Rebuild the bleaching evidence",
    "Damp litmus is bleached white by a sample from the four-core-gas set. Which gas is identified?",
    "Chlorine",
    {
      Oxygen: "Relighting of a glowing splint is the oxygen result.",
      "Carbon dioxide":
        "A damp-litmus acid response alone is different from the bleaching described.",
    },
    "Bleaching damp litmus white is the positive chlorine test here.",
    "Use bleaching, not red alone.",
    { mode: "evidence", record: "chlorine-chain", focus: "all" },
  ),
  c(
    "r-dry",
    "Diagnose a dry-paper negative",
    "Dry blue litmus stays blue in the sample. Does this validly rule out chlorine?",
    "No; use damp litmus for the specified test",
    {
      "Yes; unchanged dry paper proves absence":
        "The method does not meet the stated damp-paper condition.",
      "No; therefore the gas must be oxygen":
        "A faulty chlorine test does not identify another gas.",
    },
    "Correct the paper condition before interpreting the result as a negative chlorine test.",
    "Check the method before the conclusion.",
    { mode: "faults", record: "dry-litmus-negative", focus: "all" },
  ),
  c(
    "r-contact",
    "Diagnose missing reagent contact",
    "A delivery outlet remains above limewater. The liquid stays clear and no bubbles pass through it. What is the necessary correction?",
    "Put the outlet below the liquid surface for bubbling",
    {
      "Name the gas oxygen immediately": "No oxygen test is recorded.",
      "Leave the outlet above and declare no CO2":
        "The sample has not been bubbled through the reagent.",
    },
    "The unchanged liquid cannot rule out CO2 when the requested contact never occurred.",
    "Trace where the gas actually goes.",
    { mode: "faults", record: "above-limewater-negative", focus: "all" },
  ),
  c(
    "r-reagent",
    "Use the specified receiving liquid",
    "A sample bubbles through pure water, which stays clear. What reagent is needed for the CO2 test?",
    "Fresh limewater",
    {
      "More pure water": "Water is not aqueous calcium hydroxide.",
      "Dry blue litmus": "That does not perform the specified limewater test.",
    },
    "Use fresh aqueous calcium hydroxide rather than pure water.",
    "Correct the reagent before interpreting a negative.",
    { mode: "faults", record: "water-negative", focus: "all" },
  ),
  c(
    "r-cold",
    "Start with a glowing splint",
    "A cold wooden splint does not ignite in a sample. Why is this not the specified oxygen test?",
    "The test starts with a glowing splint and asks whether it relights",
    {
      "Oxygen is the fuel and must burn by itself":
        "Oxygen supports burning; it is not the fuel.",
      "The sample must therefore be hydrogen":
        "This failed method does not identify another gas.",
    },
    "A cold unlit splint is different from a hot glowing splint.",
    "Repair the starting condition.",
    { mode: "faults", record: "cold-splint-negative", focus: "all" },
  ),
  c(
    "r-lost",
    "Preserve the sample being tested",
    "The collected sample escaped before a burning-splint test. No pop follows. What should happen before drawing a conclusion?",
    "Test a freshly collected sample",
    {
      "Declare hydrogen absent from the original sample":
        "The original sample was no longer available.",
      "Identify the original sample as chlorine":
        "No chlorine observation is recorded.",
    },
    "A test on a lost sample cannot establish the original sample’s identity.",
    "Check whether the record still tests the collected gas.",
    { mode: "faults", record: "escaped-sample", focus: "all" },
  ),
  c(
    "r-red",
    "Record the decisive litmus change",
    "Recording stops when damp blue litmus turns red. What later change must be checked for the chlorine test?",
    "Whether the litmus is bleached white",
    {
      "Whether it becomes a glowing splint":
        "That is a different apparatus and test.",
      "No later observation; red uniquely proves chlorine":
        "Red alone shows an acidic response, not unique chlorine identification.",
    },
    "Record the complete change, especially bleaching. The truncated record cannot rule chlorine in or out uniquely.",
    "Do not stop at the intermediate change.",
    { mode: "faults", record: "red-only-record", focus: "all" },
  ),
  c(
    "r-support",
    "Correct oxygen’s role",
    "A student writes “oxygen burns as the fuel”. Which correction is useful?",
    "Oxygen supports burning; the splint is the burning material",
    {
      "Oxygen must give a pop as its own fuel":
        "That confuses it with the hydrogen test.",
      "The original claim is correct": "Oxygen is not the fuel in this test.",
    },
    "A glowing splint relights because oxygen supports its combustion.",
    "Identify which material is actually burning.",
    { mode: "wording", record: "oxygen-burns", focus: "all" },
  ),
  c(
    "r-limewater",
    "Distinguish reagent and precipitate",
    "What is dissolved in the starting limewater?",
    "Calcium hydroxide",
    {
      "Calcium carbonate":
        "That is the white precipitate associated with the positive test.",
      "Calcium chloride": "That is not limewater.",
    },
    "Limewater is aqueous calcium hydroxide. Carbon dioxide produces calcium carbonate, which makes it cloudy.",
    "Separate the starting reagent from the product.",
    { mode: "wording", record: "limewater-identity", focus: "all" },
  ),
];
