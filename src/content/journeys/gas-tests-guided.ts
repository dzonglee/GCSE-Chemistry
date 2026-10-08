import { choice as c, written as w, type GasTask } from "./gas-tests-tasks";
export const gasGuided: GasTask[] = [
  c(
    "g-hydrogen",
    "Test for hydrogen",
    "Which complete method is required?",
    "A burning splint held at the open end",
    {
      "A cold splint inserted into the tube":
        "A cold splint does not perform the ignition test.",
      "A glowing splint placed away from the sample":
        "That supplies neither the hydrogen-test state nor contact.",
    },
    "Hold a burning splint at the open end. A rapid pop is the positive hydrogen result.",
    "Choose the starting state and position separately.",
    { mode: "procedure", record: "hydrogen-mouth", focus: "all" },
  ),
  c(
    "g-oxygen",
    "Set up the oxygen test",
    "Propose an oxygen test. Which starting state and position are required?",
    "A glowing splint inserted into the gas",
    {
      "A burning splint away from the tube":
        "That cannot demonstrate a glowing splint relighting in the gas.",
      "A cold splint at the mouth": "Cold wood is not the specified test.",
    },
    "Insert a glowing splint; the positive result is that it relights. Oxygen supports burning.",
    "Distinguish the initial glow from the later flame.",
    { mode: "procedure", record: "oxygen-insert", focus: "all" },
  ),
  c(
    "g-co2",
    "Make contact with limewater",
    "The original outlet ends above limewater. Which proposal performs the requested bubbling test?",
    "Fresh limewater with the outlet below its surface",
    {
      "Pure water with an outlet above it":
        "Both the reagent and contact are wrong for this test.",
      "Limewater with an outlet above it":
        "The original fault remains; gas is not bubbled through the liquid.",
    },
    "The gas must pass through fresh limewater. Cloudiness is a change in the liquid, not in the gas.",
    "Compare outlet position with liquid level.",
    { mode: "procedure", record: "co2-delivery", focus: "all" },
  ),
  c(
    "g-chlorine",
    "Prepare litmus correctly",
    "Correct the dry-paper proposal for a chlorine test. Which proposal is appropriate?",
    "Damp litmus in contact with the sample",
    {
      "Dry litmus away from the sample":
        "The paper is neither damp nor in contact.",
      "Dry paper in contact is always equivalent":
        "The specified test requires damp litmus.",
    },
    "Chlorine bleaches damp litmus white. Damp blue litmus can become red before bleaching.",
    "Check both dampness and contact.",
    { mode: "procedure", record: "chlorine-damp", focus: "all" },
  ),
  c(
    "g-pop",
    "Read a sound observation",
    "Read the complete original pop record. Which item is an observation?",
    "A pop is heard",
    {
      "Hydrogen is the gas": "That is the identification, not the observation.",
      "Oxygen burns as a fuel":
        "That is both an explanation claim and scientifically incorrect.",
    },
    "The burning-splint test and pop support hydrogen. Keep the heard result distinct from the gas name.",
    "Read what happened at the tube opening.",
    { mode: "observation", record: "pop-record", focus: "all" },
  ),
  c(
    "g-bleaching",
    "Read past the first colour change",
    "Read all stages of the damp-blue-litmus record. Which change completes the chlorine evidence?",
    "The paper is bleached white",
    {
      "It first becomes red":
        "Red alone is an acidic response rather than unique identification.",
      "It was initially blue":
        "The starting colour is not the positive change.",
    },
    "The decisive supplied stage is bleaching white. Do not stop the record at its intermediate red stage.",
    "Move through all three supplied stages.",
    { mode: "observation", record: "bleach-record", focus: "all" },
  ),
  c(
    "g-compare",
    "Compare a specified starting condition",
    "Two splints are inserted into the same oxygen sample. One starts glowing and relights; the other starts cold and stays unlit. Which method difference explains why only A performs the specified test?",
    "The initial splint state",
    {
      "The sample must be two different gases":
        "The original record states the same known oxygen sample.",
      "The tube colour": "No tube-colour change is given or relevant.",
    },
    "The oxygen test starts with a glowing splint. Cold wood not igniting cannot rule out oxygen.",
    "Hold the sample fixed and compare the methods.",
    { mode: "comparison", record: "glowing-versus-cold", focus: "all" },
  ),
  c(
    "g-mixture",
    "Build a warranted conclusion",
    "A mixed sample makes fresh limewater milky. Complete the evidence chain. Which conclusion is supported?",
    "Carbon dioxide is present; the other components are undetermined",
    {
      "The entire mixture is pure carbon dioxide":
        "A positive test does not establish the whole composition.",
      "Oxygen must be absent": "No valid oxygen test is recorded.",
    },
    "Limewater cloudiness supports CO2 present. Keep the known mixture and missing other tests in the conclusion.",
    "Do not turn presence into purity.",
    { mode: "evidence", record: "mixture-chain", focus: "all" },
  ),
  c(
    "g-wording",
    "Correct an imprecise result",
    "Review “The gas turns white” for the limewater test. What is the useful correction?",
    "The limewater turns milky or cloudy",
    {
      "The gas becomes white oxygen":
        "Neither the observed object nor identity is supported.",
      "The liquid always becomes purple":
        "That is not the recorded limewater change.",
    },
    "AQA’s reviewed Foundation/Higher mark schemes accept milky/cloudy or white precipitate. Name the liquid that changes.",
    "Keep reagent and result attached to one another.",
    { mode: "wording", record: "white-gas", focus: "all" },
  ),
  w(
    "g-full-answer",
    "Write method, observation and conclusion",
    "A school sample gives a positive oxygen test. Describe the test, its positive observation and what oxygen does in the test.",
    "Insert a glowing splint into the sample. It relights. The evidence supports oxygen present; oxygen supports the combustion of the splint rather than being the fuel.",
    [
      "State a glowing splint as the initial condition.",
      "State insertion into the gas.",
      "Give relighting as the observation.",
      "Describe oxygen as supporting burning.",
    ],
    "Write the procedure before the result, then its meaning.",
  ),
];
