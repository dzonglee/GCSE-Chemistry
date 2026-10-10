import type { LearningTask, LessonJourney, TaskModel } from "../types";
import type { FuelHalfMode } from "../../lib/fuel-half";
type Model = Extract<TaskModel, { kind: "fuel-half" }>;
type Task = LearningTask;
const m = (
  mode: FuelHalfMode,
  instruction: string,
  record?: string,
): Model => ({ kind: "fuel-half", mode, instruction, record });
function n(
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  model?: Model,
): Task {
  return {
    id: "fh-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer: String(answer),
    unit,
    explanation,
    hint,
    model,
  };
}
function c(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: Model,
): Task {
  const opts = [answer, ...Object.keys(errors)],
    offset = [...id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % opts.length;
  return {
    id: "fh-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    options: [...opts.slice(offset), ...opts.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    model,
  };
}
function e(
  id: string,
  title: string,
  prompt: string,
  reaction: NonNullable<Task["electronEquation"]>["reaction"],
  answer: string,
  explanation: string,
  hint: string,
  model?: Model,
): Task {
  return {
    id: "fh-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    explanation,
    hint,
    electronEquation: { reaction, simplest: true },
    model,
  };
}
function w(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): Task {
  return {
    id: "fh-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    hint: rubric[0],
    rubric,
  };
}
export const fuelHalfJourney: LessonJourney = {
  version: 1,
  introduction:
    "Construct the two acidic fuel-cell half equations, match their electrons and recover the overall water reaction.",
  scopeNote:
    "Higher/separate Chemistry working AQA 8462 4.5.2.2: write the electrode half equations for a hydrogen fuel cell. Actual AQA specimen Higher Paper 1 Q06.5 and paired mark scheme were read and visually inspected. Its acidic equations are H₂→2H⁺+2e⁻ and O₂+4H⁺+4e⁻→2H₂O. This lesson declares an acidic proton-conducting account; it does not mix H⁺ and OH⁻ equations or claim that every fuel cell has this electrolyte. In the supplied discharging fuel cell, hydrogen oxidation occurs at the negative anode and oxygen reduction at the positive cathode. Anode means oxidation and cathode means reduction; electrolysis electrode signs are a different context. Electrons move through the external wire from hydrogen to oxygen; H⁺ carries charge through the electrolyte in this supplied account. Conventional-current direction is an optional extension, opposite to electron flow in the wire, not actual protons travelling through the metal. Each electron contributes −1 charge and no H/O atoms. Balance every element and total charge separately, with fixed species and the required direction. To combine half equations, multiply all terms on both sides until electron counts match; cancel equal identical H⁺ and e⁻ amounts on opposite sides. The overall reaction is 2H₂+O₂→2H₂O and has no net H⁺ or electrons. Cancellation describes the net accounting, not destruction of atoms or charges. Constructed cases specify a reactant count and retained combined scale; typed tasks explicitly ask for smallest positive whole-number coefficients. The reused strict parser accepts reordered terms, charged ASCII/Unicode notation, appropriate optional states and declared positive whole-number bounds; no automatic partial examiner marks are claimed. Optional states use H₂(g), O₂(g) and H⁺(aq). Fuel-cell water can leave as liquid or vapour depending on output conditions: H₂O(l) and H₂O(g) are accepted here, and states are not required. Electron state labels are inappropriate. Macroscopic 3D layers and route arrows are schematic, not atoms moving at measured speed or voltage computed from geometry. OpenStax Chemistry 2e Fuel Cells supplies the acidic electrode/transport account; its illustrative voltage, efficiency and historical market comments are not imported as compulsory GCSE facts. Pearson 5.25C–5.27C does not make these half equations compulsory; full board mapping remains unfinished. Written responses remain self-reviewed. Repeated/model-assisted reasoning has conservative direct global exposure; independent checks defer feedback and delayed review waits seven days. This app does not certify laboratory technique or whole-course exam readiness.",
  outcomes: [
    "Balance H/O counts and total charge in the stated half equations.",
    "Identify hydrogen oxidation and oxygen reduction under declared acidic conditions.",
    "Scale and combine the two reactions, cancelling only shared opposite-side terms.",
    "Distinguish electronic/ionic paths and contextual electrode signs.",
    "Reject atom-balanced but charge-wrong or chemically reversed proposals.",
  ],
  warmup: [
    n(
      "warm-positive",
      "Count positive charge",
      "What total charge do two H⁺ ions contribute?",
      2,
      "relative charge",
      "Each H⁺ contributes +1, so two give +2.",
      "Multiply ion count by its charge.",
    ),
    n(
      "warm-electron",
      "Count electron charge",
      "What total charge do four electrons contribute?",
      -4,
      "relative charge",
      "Each electron contributes −1; four give −4.",
      "Retain the negative sign.",
    ),
  ],
  refresher: [
    n(
      "r-atoms",
      "Count fixed formulas",
      "How many H atoms are represented by one H₂?",
      2,
      "atoms",
      "H₂ contains two hydrogen atoms.",
      "Read the fixed subscript.",
    ),
    n(
      "r-charge",
      "Combine signed charges",
      "Calculate total charge of 2H⁺+2e⁻.",
      0,
      "relative charge",
      "+2−2=0.",
      "Ions and electrons contribute separately.",
    ),
    c(
      "r-redox",
      "Recall electron loss",
      "What describes hydrogen losing electrons?",
      "Oxidation",
      {
        Reduction: "Reduction is electron gain.",
        "Creation of a new element":
          "Electron transfer does not change nuclear identity.",
      },
      "Oxidation is loss of electrons; reduction is gain.",
      "Use electron loss or gain.",
    ),
    n(
      "r-water",
      "Count oxygen in water",
      "How many oxygen atoms are in 2H₂O?",
      2,
      "atoms",
      "Each water formula contains one O atom.",
      "Multiply the complete formula by its coefficient.",
    ),
    c(
      "r-scale",
      "Scale a whole equation",
      "When doubling a half equation, which terms must double?",
      "Every term on both sides",
      {
        "Only electrons": "That can break charge balance.",
        "Only the product formula's subscripts":
          "Changing subscripts changes substance identity.",
      },
      "Multiply every coefficient; keep species formulas fixed.",
      "Preserve every atom and charge contribution.",
    ),
    c(
      "r-cancel",
      "Cancel only shared terms",
      "When can a term be cancelled after adding two equations?",
      "Equal amounts of the same species occur on opposite sides",
      {
        "Whenever the species is unwanted":
          "An unwanted one-sided term cannot be deleted.",
        "Different species happen to have equal charges":
          "Equal charge does not make species identical.",
      },
      "Cancellation requires the same species and equal opposite-side coefficients.",
      "Compare both identity and amount.",
    ),
    c(
      "r-path",
      "Distinguish charge carriers",
      "In this acidic fuel-cell account, which path is appropriate?",
      "Electrons through the external wire; H⁺ through the electrolyte",
      {
        "Electrons through the proton-conducting electrolyte":
          "The supplied electrolyte conducts H⁺.",
        "Neutral H₂ carries the external electric current":
          "The wire carries electrons.",
      },
      "Electronic and ionic conduction use different paths.",
      "Identify the carrier and its conducting region.",
    ),
    c(
      "r-process",
      "Keep the required direction",
      "The hydrogen fuel electrode must oxidise H₂. Does 2H⁺+2e⁻→H₂ describe that process?",
      "No; it describes reduction",
      {
        "Yes; balanced always means correct for the electrode":
          "The stated direction and process also matter.",
        "Yes; gaining electrons is oxidation": "Gain is reduction.",
      },
      "The equation is balanced but describes hydrogen-ion reduction, not the stated hydrogen oxidation.",
      "Check electron gain or loss.",
    ),
    c(
      "r-sign",
      "Use electrode signs in context",
      "Which is true for the supplied discharging hydrogen fuel cell?",
      "Its hydrogen anode is negative and oxidation occurs there",
      {
        "Every anode is positive":
          "Anode identifies oxidation; its sign depends on the cell context.",
        "Oxidation means electron gain": "Oxidation is electron loss.",
      },
      "Do not carry the positive-anode sign from electrolysis into this discharging fuel cell.",
      "Separate the process name from electrode sign.",
    ),
  ],
  guided: [
    e(
      "g-hydrogen",
      "Hydrogen oxidation",
      "Write hydrogen oxidation for this acidic fuel cell. Use smallest positive whole-number coefficients.",
      "fuelHydrogen",
      "H₂→2H⁺+2e⁻",
      "H₂ loses two electrons; two H⁺ and two e⁻ have total charge 0, matching neutral H₂.",
      "Balance H atoms, then total charge.",
      m(
        "construct",
        "Build the fixed-formula coefficients, electron side, process and signed charge predictions.",
      ),
    ),
    e(
      "g-oxygen",
      "Construct oxygen reduction",
      "Write the acidic fuel-cell oxygen-reduction half equation with smallest positive whole-number coefficients.",
      "fuelOxygen",
      "O₂+4H⁺+4e⁻→2H₂O",
      "Two water formulas contain 2 O and 4 H. Four H⁺ and four electrons have net charge 0.",
      "Balance oxygen and hydrogen, then charge.",
      m(
        "construct",
        "Use the stated oxygen electrode; balance atoms and charge separately.",
        "oxygen",
      ),
    ),
    n(
      "g-combine",
      "Match and combine the reactions",
      "Combine the primitive acidic half equations using the smallest multipliers. How many electrons cancel on each side?",
      4,
      "electrons",
      "Double H₂→2H⁺+2e⁻ so both halves transfer four electrons. Four H⁺ also cancel, leaving 2H₂+O₂→2H₂O.",
      "Match electron counts before cancelling.",
      m(
        "combine",
        "Choose both multipliers, cancellation amounts and all net coefficients independently.",
      ),
    ),
    c(
      "g-route",
      "Route the electrons",
      "Where do electrons travel in the supplied discharging acidic fuel cell?",
      "External wire from hydrogen anode to oxygen cathode",
      {
        "Electrolyte from hydrogen to oxygen":
          "The supplied electrolyte carries H⁺, not electrons.",
        "External wire from oxygen to hydrogen":
          "This reverses electron flow in the stated discharge process.",
      },
      "Hydrogen oxidation supplies electrons and oxygen reduction consumes them through the external circuit.",
      "Link the electron source and sink.",
      m("path", "Propose the carrier, path, direction and electrode signs."),
    ),
    n(
      "g-diagnose",
      "Check a plausible wrong half equation",
      "A student proposes H₂→2H⁺+e⁻. What is the total charge on its right-hand side?",
      1,
      "relative charge",
      "2(+1)+1(−1)=+1. H atoms balance, but charge does not match the neutral left side.",
      "Count ion charge and electron charge separately.",
      m(
        "diagnose",
        "Predict both signed charges, then diagnose the error and its reason.",
      ),
    ),
    c(
      "g-electron",
      "Account for an electron",
      "How does one electron contribute to the H/O/charge ledger?",
      "−1 charge and no H or O atoms",
      {
        "One hydrogen atom and zero charge":
          "An electron is not a hydrogen nucleus and has negative charge.",
        "+1 charge and one oxygen atom":
          "This changes both charge and species identity.",
      },
      "Electrons carry negative charge but do not add hydrogen or oxygen atom counts.",
      "Keep charge accounting separate from atom accounting.",
      m("evidence", "Choose the supported statement and its chemical reason."),
    ),
  ],
  practice: [
    e(
      "p-hydrogen",
      "Write without the construction model",
      "Write the hydrogen-oxidation half equation for the supplied acidic fuel cell, using smallest positive whole-number coefficients.",
      "fuelHydrogen",
      "H₂→2H⁺+2e⁻",
      "Two H atoms become two H⁺; two electrons on the product side balance total charge.",
      "Hydrogen loses electrons.",
    ),
    e(
      "p-oxygen",
      "Write oxygen reduction independently",
      "Write the oxygen-reduction half equation for the supplied acidic fuel cell, using smallest positive whole-number coefficients.",
      "fuelOxygen",
      "O₂+4H⁺+4e⁻→2H₂O",
      "Balance 2 O with two water formulas and 4 H with four H⁺; four electrons make the left charge 0.",
      "Balance atoms before electrons.",
    ),
    n(
      "p-h-double",
      "Scale hydrogen oxidation",
      "Exactly two H₂ are oxidised in the supplied acidic half equation. How many electrons are produced?",
      4,
      "electrons",
      "Each H₂ produces two electrons; two H₂ produce four. All H⁺ coefficients scale too.",
      "Multiply the whole primitive half equation.",
      m("construct", "Preserve the requested two-H₂ scale.", "hydrogenDouble"),
    ),
    n(
      "p-o-double",
      "Scale oxygen reduction",
      "Exactly two O₂ are reduced in the supplied acidic half equation. How many water formulas are produced?",
      4,
      "H₂O formulas",
      "Two O₂ supply 4 O atoms, requiring four H₂O formulas; H⁺ and electron coefficients are both eight.",
      "Scale every coefficient together.",
      m("construct", "Preserve the requested two-O₂ scale.", "oxygenDouble"),
    ),
    n(
      "p-h-charge",
      "Find excess electron charge",
      "For the proposed H₂→2H⁺+3e⁻, calculate the right-hand total charge.",
      -1,
      "relative charge",
      "+2−3=−1; this proposal does not conserve charge.",
      "Multiply each term by its charge.",
    ),
    n(
      "p-o-charge",
      "Find missing electron charge",
      "For the proposed O₂+4H⁺+e⁻→2H₂O, calculate the left-hand total charge.",
      3,
      "relative charge",
      "+4−1=+3; neutral water on the right has charge 0.",
      "Do not ignore H⁺ charge.",
    ),
    c(
      "p-oxygen-error",
      "Separate atoms and charge",
      "What is wrong with O₂+4H⁺+2e⁻→2H₂O?",
      "Atoms balance, but charge does not",
      {
        "Both atoms and charge balance": "The left charge is +2, not 0.",
        "Only oxygen atoms fail": "Both sides contain 2 O and 4 H.",
      },
      "Its left charge is +4−2=+2; right charge is 0. H/O atom counts do match.",
      "Perform both checks separately.",
      m(
        "diagnose",
        "Keep the plausible proposed equation and predict both charges.",
        "oxygenCharge",
      ),
    ),
    c(
      "p-h-atoms",
      "Do not rely on charge alone",
      "What is wrong with H₂→H⁺+e⁻?",
      "Charge balances, but H atom counts do not",
      {
        "Both checks pass":
          "Two H atoms on the left become only one on the right.",
        "Only charge fails": "+1−1=0 matches neutral H₂.",
      },
      "Charge 0 matches 0, but H counts 2 and 1 do not.",
      "Check the fixed formulas' atoms as well as charge.",
      m(
        "diagnose",
        "Diagnose the atom-count error without inventing new formulas.",
        "hydrogenAtoms",
      ),
    ),
    c(
      "p-reverse",
      "Check the declared process",
      "Is 2H⁺+2e⁻→H₂ correct for the fuel cell's stated hydrogen-oxidation electrode?",
      "No; balanced but in the wrong process direction",
      {
        "Yes; balancing proves the stated process":
          "The reaction consumes electrons, so it is reduction.",
        "No; it creates oxygen": "No oxygen species occur in this equation.",
      },
      "Balancing is necessary, but this equation describes reduction rather than the required hydrogen oxidation.",
      "Identify the electron side.",
      m("diagnose", "Retain the reversed but balanced proposal.", "reversed"),
    ),
    n(
      "p-water-count",
      "Check a wrong water coefficient",
      "In the proposed O₂+4H⁺+4e⁻→4H₂O, how many H atoms occur on the right?",
      8,
      "H atoms",
      "Four water formulas each contain two H atoms: 8, compared with 4 on the left.",
      "Multiply the whole water formula by its coefficient.",
      m(
        "diagnose",
        "Separate the water-coefficient atom error from charge.",
        "waterAtoms",
      ),
    ),
    n(
      "p-wrong-side",
      "Keep signed charge on each side",
      "In H₂+2e⁻→2H⁺, what is the left-hand total charge?",
      -2,
      "relative charge",
      "Neutral H₂ contributes 0 and two electrons contribute −2. Right charge is +2.",
      "Include the electron sign.",
      m(
        "diagnose",
        "Keep the wrong electron side visible and compare both signed totals.",
        "wrongSide",
      ),
    ),
    n(
      "p-matched",
      "Recognise already matching halves",
      "Combine 2H₂→4H⁺+4e⁻ and O₂+4H⁺+4e⁻→2H₂O using smallest multipliers. What multiplier is needed for the hydrogen half?",
      1,
      "",
      "Both supplied halves already transfer four electrons; no additional scaling is needed.",
      "Compare the given electron counts first.",
      m(
        "combine",
        "Do not automatically double an already doubled half.",
        "matched",
      ),
    ),
    n(
      "p-o-combine",
      "Match a doubled oxygen half",
      "Combine H₂→2H⁺+2e⁻ with 2O₂+8H⁺+8e⁻→4H₂O. What is the smallest multiplier for the hydrogen half?",
      4,
      "",
      "2×4=8 electrons matches the supplied oxygen half. Net retained scale is 4H₂+2O₂→4H₂O.",
      "Match the supplied eight electrons.",
      m(
        "combine",
        "Scale to the provided oxygen half and retain that combined scale.",
        "oxygenDouble",
      ),
    ),
    n(
      "p-unequal",
      "Find a common electron count",
      "Combine 3H₂→6H⁺+6e⁻ and O₂+4H⁺+4e⁻→2H₂O using smallest multipliers. How many electrons cancel on each side?",
      12,
      "electrons",
      "Smallest common count of 6 and 4 is 12: multiply the hydrogen half by 2 and oxygen half by 3.",
      "Find the smallest positive common multiple.",
      m(
        "combine",
        "Predict both multipliers and both cancellation amounts.",
        "unequal",
      ),
    ),
    e(
      "p-overall",
      "Recover the net reaction",
      "Write the overall hydrogen–oxygen reaction after correctly cancelling matched H⁺ and e⁻, using smallest positive whole-number coefficients.",
      "fuelOverall",
      "2H₂+O₂→2H₂O",
      "Shared H⁺ and e⁻ terms cancel; the net reactants are hydrogen and oxygen, forming water.",
      "Keep only the net chemical species.",
    ),
    c(
      "p-proton-route",
      "Route the ion separately",
      "In the supplied acidic proton-conducting fuel cell, where does H⁺ carry charge?",
      "Through the electrolyte from hydrogen to oxygen electrode",
      {
        "Through the external metal wire": "The metal wire carries electrons.",
        "Only as neutral H₂ in the gas inlet":
          "H⁺ is an ion, distinct from H₂.",
      },
      "H⁺ is produced at the hydrogen anode and consumed at the oxygen cathode in this acidic account.",
      "Identify the ionic conducting path.",
      m(
        "path",
        "Propose the proton route separately from the electron route.",
        "proton",
      ),
    ),
    c(
      "p-convention",
      "Extension: current direction",
      "Which external-wire direction is conventional current in the supplied discharging cell?",
      "Oxygen cathode to hydrogen anode",
      {
        "Hydrogen anode to oxygen cathode":
          "That is electron-flow direction; conventional current is opposite.",
        "Actual protons move through the metal wire":
          "Conventional current is a positive-charge direction convention.",
      },
      "Conventional current is opposite to electron flow, from positive oxygen side towards negative hydrogen side.",
      "This extension uses the positive-charge convention.",
      m(
        "path",
        "Keep conventional direction distinct from actual electron motion.",
        "conventional",
      ),
    ),
    c(
      "p-sign",
      "Avoid a universal sign rule",
      "Which statement about the supplied fuel-cell anode is supported?",
      "Negative anode; oxidation occurs there",
      {
        "Every anode must be positive":
          "Anode names the process, not a universal sign.",
        "Negative anode means reduction":
          "Hydrogen loses electrons here: oxidation.",
      },
      "The supplied discharging fuel cell has a negative hydrogen anode. Earlier electrolysis uses a positive anode.",
      "Use the declared cell context.",
      m("evidence", "Compare process definition with contextual sign.", "sign"),
    ),
    c(
      "p-conditions",
      "Keep one electrolyte account",
      "The supplied fuel-cell account is acidic and proton-conducting. What should its half equations use?",
      "The supplied H⁺ species and consistent acidic half equations",
      {
        "Mix OH⁻ into the same equation without rebalancing":
          "Different electrolyte accounts cannot be mixed indiscriminately.",
        "Remove all charge labels": "Ion/electron charge labels are essential.",
      },
      "Use the declared H⁺ account, fixed species and charge balance.",
      "Read the stated electrolyte conditions.",
      m(
        "evidence",
        "Limit the half equations to the supplied acidic account.",
        "conditions",
      ),
    ),
    c(
      "p-scale-rule",
      "Preserve a whole half equation",
      "What is the valid way to double H₂→2H⁺+2e⁻?",
      "2H₂→4H⁺+4e⁻",
      {
        "H₂→2H⁺+4e⁻": "Only electrons changed; charge no longer balances.",
        "H₄→2H⁺+2e⁻": "Changing the formula changes the stated species.",
      },
      "Multiply all coefficients on both sides while retaining formulas.",
      "Scale whole terms, including electrons.",
      m("evidence", "Choose scaling that preserves both inventories.", "scale"),
    ),
    c(
      "p-cancel-rule",
      "Reject an arbitrary deletion",
      "Water appears only on the product side after adding the matched acidic half equations. May it be cancelled?",
      "No; equal water is not present on the opposite side",
      {
        "Yes; any product can be deleted":
          "Cancellation requires equal identical opposite-side terms.",
        "Yes; neutral substances do not count":
          "Neutral water still contains H/O atoms.",
      },
      "Cancel matched H⁺ and e⁻ terms, not one-sided water.",
      "Check identical species on both sides.",
      m(
        "evidence",
        "Keep the difference between cancellation and deleting a product.",
        "cancel",
      ),
    ),
    w(
      "p-explain-charge",
      "Explain hydrogen's electrons",
      "Explain why one H₂ forming two H⁺ needs two electrons on the product side in the stated acidic half equation.",
      "Two H atoms in H₂ become two H⁺, conserving H nuclei. Neutral H₂ has charge 0; two H⁺ contribute +2. Two product electrons contribute −2, so the product total is 0. Electron loss is oxidation.",
      [
        "Conserve the two H atoms.",
        "Compare 0 with +2−2 and identify product electrons.",
        "Link electron loss with oxidation.",
      ],
    ),
    w(
      "p-derive",
      "Explain combination and cancellation",
      "Use the primitive acidic half equations to explain how the overall 2H₂+O₂→2H₂O is obtained.",
      "Double the whole hydrogen half to 2H₂→4H⁺+4e⁻. Add O₂+4H⁺+4e⁻→2H₂O. Equal 4H⁺ and 4e⁻ occur on opposite sides and cancel, leaving 2H₂+O₂→2H₂O. Cancellation is net accounting, not destruction of atoms or charge.",
      [
        "Scale all terms to match four electrons.",
        "Add and cancel equal identical H⁺/e⁻ terms.",
        "State the conserved overall reaction and what cancellation means.",
      ],
    ),
    w(
      "p-explain-path",
      "Explain both charge paths",
      "Explain how electrons and H⁺ use different paths in the supplied acidic fuel cell and why electrode sign must be read in context.",
      "Hydrogen oxidation at the negative anode supplies electrons to the external wire; oxygen reduction at the positive cathode consumes them. H⁺ carries charge through the supplied proton-conducting electrolyte. Anode means oxidation; its negative fuel-cell sign differs from positive-anode electrolysis.",
      [
        "Identify the external electron source, path and sink.",
        "Distinguish internal H⁺ conduction.",
        "Explain the contextual electrode sign without changing the process definition.",
      ],
    ),
  ],
  checkForms: [
    [
      e(
        "A-hydrogen",
        "Write a reserved half equation",
        "For the supplied acidic hydrogen fuel cell, write the hydrogen-oxidation half equation using smallest positive whole-number coefficients.",
        "fuelHydrogen",
        "H₂→2H⁺+2e⁻",
        "Hydrogen oxidation gives two H⁺ and two product electrons, conserving H atoms and total charge.",
        "Check atoms, charge and electron side.",
      ),
      n(
        "A-water",
        "Transfer an oxygen scale",
        "Exactly three O₂ are reduced in the stated acidic half equation. How many H₂O formulas are formed?",
        6,
        "H₂O formulas",
        "Three O₂ give 6 O atoms, so 6H₂O are formed; other terms scale consistently.",
        "Use the fixed water formula.",
      ),
      n(
        "A-charge",
        "Read a signed charge inventory",
        "For the proposed H₂+2e⁻→2H⁺, what is the right-hand total charge?",
        2,
        "relative charge",
        "Two H⁺ give +2 on the right; electrons in this proposal are on the left.",
        "Count only the right-hand terms.",
      ),
      c(
        "A-path",
        "Identify electronic conduction",
        "In the supplied discharging acidic fuel cell, which route carries electrons?",
        "External wire from negative hydrogen anode to positive oxygen cathode",
        {
          "Proton-conducting electrolyte from hydrogen to oxygen":
            "This supplied region carries H⁺.",
          "Metal wire carrying neutral H₂ gas":
            "Neutral gas is not the wire's electronic carrier.",
        },
        "Hydrogen supplies electrons by oxidation; oxygen consumes them by reduction through the external circuit.",
        "Distinguish electronic and ionic regions.",
      ),
      w(
        "A-direction",
        "Reject a balanced wrong process",
        "Explain why 2H⁺+2e⁻→H₂ is not the required hydrogen-oxidation half equation even though its atoms and total charge balance.",
        "Atoms and charge balance, but the equation consumes electrons and describes reduction of H⁺. The stated fuel-cell hydrogen electrode oxidises H₂ and produces electrons, so the process direction is wrong.",
        [
          "Acknowledge both conserved inventories.",
          "Identify electron gain/reduction versus required hydrogen oxidation.",
        ],
      ),
    ],
    [
      e(
        "B-oxygen",
        "Write another reserved half equation",
        "For the supplied acidic hydrogen fuel cell, write the oxygen-reduction half equation using smallest positive whole-number coefficients.",
        "fuelOxygen",
        "O₂+4H⁺+4e⁻→2H₂O",
        "Two water formulas conserve 2 O and 4 H; four H⁺ and four electrons give net charge 0.",
        "Balance both elements and total charge.",
      ),
      n(
        "B-electrons",
        "Transfer a hydrogen scale",
        "Exactly four H₂ are oxidised in the stated acidic half equation. How many electrons are produced?",
        8,
        "electrons",
        "Each H₂ produces two electrons, so four produce eight.",
        "Scale the whole primitive equation.",
      ),
      n(
        "B-common",
        "Match a different supplied pair",
        "The supplied hydrogen half produces 6e⁻ and oxygen half consumes 8e⁻. Using smallest positive multipliers, how many electrons cancel on each side?",
        24,
        "electrons",
        "The smallest common positive count is 24: hydrogen multiplier 4 and oxygen multiplier 3.",
        "Find the smallest common multiple of 6 and 8.",
      ),
      c(
        "B-electrode",
        "Identify fuel-cell reduction",
        "In the supplied discharging acidic cell, where is oxygen reduced?",
        "Positive oxygen cathode",
        {
          "Positive hydrogen anode":
            "Hydrogen is oxidised at the negative anode in this stated cell.",
          "Negative oxygen anode":
            "Cathode names reduction and is positive here.",
        },
        "Oxygen gains electrons at the supplied positive cathode.",
        "Use electron gain and the stated cell context.",
      ),
      w(
        "B-net",
        "Explain the absence of net electrons",
        "Explain why electrons pass through the external circuit but do not remain in the correctly combined overall hydrogen–oxygen equation.",
        "Hydrogen oxidation produces electrons and oxygen reduction consumes them. After scaling the half equations, equal electron amounts occur on opposite sides and cancel in the net accounting. Electrons are transferred internally to the full cell system, not left as net chemical products.",
        [
          "Identify electron production and consumption at different electrodes.",
          "Explain equal opposite-side cancellation after scaling without denying external electron flow.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      e(
        "R-hydrogen",
        "Retrieve hydrogen oxidation",
        "Write the acidic hydrogen fuel-cell oxidation half equation using smallest positive whole-number coefficients.",
        "fuelHydrogen",
        "H₂→2H⁺+2e⁻",
        "Two H⁺ and two electrons balance neutral H₂.",
        "Keep both atoms and charge conserved.",
      ),
      n(
        "R-charge",
        "Retrieve signed accounting",
        "Calculate total charge of 6H⁺+6e⁻.",
        0,
        "relative charge",
        "+6−6=0.",
        "Count the signs separately.",
      ),
      w(
        "R-combine",
        "Retrieve the combination method",
        "Describe how to combine the primitive acidic fuel-cell half equations without changing formulas or deleting one-sided products.",
        "Double every hydrogen-half coefficient to match four electrons, add both equations and cancel equal H⁺ and e⁻ amounts on opposite sides. Water is a one-sided product and remains in the overall 2H₂+O₂→2H₂O.",
        [
          "Scale whole equations before cancellation.",
          "Cancel only equal identical opposite-side terms and retain water.",
        ],
      ),
    ],
    [
      e(
        "S-oxygen",
        "Retrieve oxygen reduction",
        "Write the acidic hydrogen fuel-cell oxygen-reduction half equation using smallest positive whole-number coefficients.",
        "fuelOxygen",
        "O₂+4H⁺+4e⁻→2H₂O",
        "H/O atoms and total charge balance with electrons consumed.",
        "Balance atoms, then charge.",
      ),
      n(
        "S-electrons",
        "Retrieve another scale",
        "Exactly five H₂ are oxidised in the stated acidic half equation. How many electrons are produced?",
        10,
        "electrons",
        "5×2=10 electrons.",
        "Scale the primitive hydrogen half consistently.",
      ),
      w(
        "S-sign",
        "Retrieve contextual signs",
        "Explain why 'anode' does not always mean 'positive electrode', using this fuel cell and the earlier electrolysis account.",
        "Anode identifies oxidation. The supplied discharging hydrogen fuel cell has a negative hydrogen anode, whereas the earlier electrolysis account has a positive anode. The process definition stays electron loss; the sign depends on the type of cell.",
        [
          "Define anode by oxidation/electron loss.",
          "Compare the two stated signs in their correct contexts.",
        ],
      ),
    ],
  ],
};

const recovery: Record<string, string> = {
  "p-hydrogen": "r-charge",
  "p-oxygen": "r-water",
  "p-h-double": "r-scale",
  "p-o-double": "r-scale",
  "p-h-charge": "r-charge",
  "p-o-charge": "r-charge",
  "p-oxygen-error": "r-charge",
  "p-h-atoms": "r-atoms",
  "p-reverse": "r-process",
  "p-water-count": "r-water",
  "p-wrong-side": "r-redox",
  "p-matched": "r-scale",
  "p-o-combine": "r-scale",
  "p-unequal": "r-scale",
  "p-overall": "r-cancel",
  "p-proton-route": "r-path",
  "p-convention": "r-convention",
  "p-sign": "r-sign",
  "p-conditions": "r-path",
  "p-scale-rule": "r-scale",
  "p-cancel-rule": "r-cancel",
  "p-explain-charge": "r-charge",
  "p-derive": "r-cancel",
  "p-explain-path": "r-path",
};
fuelHalfJourney.refresher.push(
  c(
    "r-convention",
    "Extension: distinguish a direction convention",
    "In the metal wire, how does conventional current relate to electron flow?",
    "Its direction is opposite to electron flow",
    {
      "It is actual proton motion in the wire":
        "The metal wire carries electrons; this is a positive-charge convention.",
      "It has the same direction as electrons":
        "Electron charge is negative, so the conventional direction is opposite.",
    },
    "Conventional current uses the direction positive charge would move. It is opposite to actual electron flow in the external metal wire.",
    "Keep the convention separate from the actual carrier.",
  ),
);
for (const task of fuelHalfJourney.practice)
  task.followUp = "fh-v1-" + recovery[task.id.slice(6)];
const allTasks: Task[] = [
  ...fuelHalfJourney.warmup,
  ...fuelHalfJourney.refresher,
  ...fuelHalfJourney.guided,
  ...fuelHalfJourney.practice,
  ...fuelHalfJourney.checkForms.flat(),
  ...fuelHalfJourney.reviewForms.flat(),
];
// Exposure lookup is direct, not transitive: every member receives every other member ID.
const families: Record<string, string[]> = {
  hydrogen: [
    "g-hydrogen",
    "p-hydrogen",
    "p-h-double",
    "p-scale-rule",
    "p-explain-charge",
    "A-hydrogen",
    "B-electrons",
    "R-hydrogen",
    "S-electrons",
  ],
  oxygen: [
    "r-water",
    "g-oxygen",
    "p-oxygen",
    "p-o-double",
    "B-oxygen",
    "A-water",
    "S-oxygen",
  ],
  charge: [
    "warm-positive",
    "warm-electron",
    "r-charge",
    "g-diagnose",
    "g-electron",
    "p-h-charge",
    "p-o-charge",
    "p-oxygen-error",
    "p-h-atoms",
    "p-water-count",
    "p-wrong-side",
    "p-explain-charge",
    "A-charge",
    "R-charge",
  ],
  combine: [
    "r-scale",
    "r-cancel",
    "g-combine",
    "p-matched",
    "p-o-combine",
    "p-unequal",
    "p-overall",
    "p-scale-rule",
    "p-cancel-rule",
    "p-derive",
    "B-common",
    "B-net",
    "R-combine",
  ],
  path: [
    "r-path",
    "r-convention",
    "g-route",
    "p-proton-route",
    "p-convention",
    "p-explain-path",
    "A-path",
  ],
  process: [
    "r-redox",
    "r-process",
    "r-sign",
    "p-reverse",
    "p-sign",
    "p-explain-path",
    "A-direction",
    "B-electrode",
    "S-sign",
  ],
};
for (const ids of Object.values(families)) {
  const memberIds = ids.map((id) => "fh-v1-" + id);
  for (const task of allTasks)
    if (memberIds.includes(task.id))
      task.exposureAliases = [
        ...new Set([
          ...(task.exposureAliases ?? []),
          ...memberIds.filter((id) => id !== task.id),
        ]),
      ];
}
const modelExposure: Record<FuelHalfMode, string[]> = {
  construct: [
    ...families.hydrogen,
    ...families.oxygen,
    ...families.charge,
    ...families.process,
  ],
  combine: [...families.combine, ...families.hydrogen, ...families.oxygen],
  path: [...families.path, ...families.process],
  diagnose: [...families.charge, ...families.process],
  evidence: [
    ...families.charge,
    ...families.combine,
    ...families.process,
    "p-conditions",
  ],
};
for (const task of allTasks)
  if (task.model?.kind === "fuel-half")
    task.exposureAliases = [
      ...new Set([
        ...(task.exposureAliases ?? []),
        ...modelExposure[task.model.mode]
          .map((id) => "fh-v1-" + id)
          .filter((id) => id !== task.id),
      ]),
    ];
