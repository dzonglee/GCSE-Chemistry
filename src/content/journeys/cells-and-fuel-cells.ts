/** Individually authored lesson62 content draft; no bulk lesson generation. */
import type { LearningTask, LessonJourney, TaskModel } from "../types";
import type { CellsMode } from "../../lib/cells-and-fuel-cells";
type Model = Extract<TaskModel, { kind: "cells-workbench" }>;
type Task = LearningTask;
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
  const options = [answer, ...Object.keys(errors)];
  const offset =
    [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % options.length;
  return {
    id: "cf-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    model,
  };
}
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
    id: "cf-v1-" + id,
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
function w(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): Task {
  return {
    id: "cf-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    hint: rubric[0],
    rubric,
  };
}
const m = (mode: CellsMode, instruction: string, record?: string): Model => ({
  kind: "cells-workbench",
  mode,
  instruction,
  record,
});
export const cellsJourney: LessonJourney = {
  version: 1,
  introduction:
    "Construct a chemical cell, build a target-voltage battery and compare hydrogen fuel cells with evidence.",
  scopeNote:
    "Foundation/separate Chemistry: working AQA 8462 4.5.2.1–4.5.2.2 scope, with actual Pearson 5.25 C–5.27 C comparison. Chemical reactions can produce a potential difference; electrode and electrolyte choices affect output. A simple school cell uses two different metals and an electrolyte. Matching identical electrodes have zero output under the stated equal conditions; the supplied distilled-water comparison is idealised and does not describe every water sample. Specific voltage values are supplied observations, not universal numbers computed from metal names. Potential difference is not current: an open load circuit can retain voltage without current through the load. Electrons carry charge in the external metal wire; ions conduct in the electrolyte. Two or more cells connected in series can give a larger voltage; the optional reversed-cell extension uses an ideal signed sum without predicting real load behaviour. A specified non-rechargeable primary cell stops when a reactant is used up and its reaction cannot be reversed for reuse. A rechargeable cell uses an external electrical supply to reverse its reactions. A hydrogen fuel cell is continually supplied with hydrogen and oxygen or air, produces a potential difference through electrochemical reactions and forms water as its only new chemical product. This is not burning hydrogen in a flame inside the cell. Unused air or hydrogen can also leave an outlet; they are not new reaction products. The overall equation is 2 H₂+O₂→2 H₂O; equivalent multiples conserve atoms. Half equations are Higher only and excluded from compulsory tasks here. Fuel-cell and battery comparisons depend on given uses, range, restoration time, cost, available supply and environmental evidence. Hydrogen may be made using fossil fuels or renewable-powered electrolysis; water at the cell outlet does not establish a carbon-free lifecycle. Continuous feeds do not guarantee an infinite component life. The app teaches simulations and data interpretation, not unsupervised experiment construction. Actual AQA 2018 FQ 10 and 2019 FQ 4 and paired mark schemes were read; original questions and consistent-unit data are used here. Structured written answers remain self-reviewed, not automatically awarded GCSE marks. Full board mapping and course readiness remain unfinished.",
  outcomes: [
    "Construct and interpret a simple chemical cell using supplied conditions.",
    "Calculate series voltages and explain connections.",
    "Distinguish depletion, electrical recharging and continuous fuel supply.",
    "Balance the overall hydrogen–oxygen fuel-cell reaction.",
    "Evaluate an energy source for a stated use with evidence and limitations.",
  ],
  warmup: [
    n(
      "warm-series",
      "Add equal voltages",
      "Calculate 1.5×4.",
      6,
      "",
      "Four equal 1.5 values total 6.",
      "Multiply one value by the count.",
    ),
    n(
      "warm-oxygen",
      "Count fixed formulas",
      "How many oxygen atoms are represented by 2 H₂O?",
      2,
      "atoms",
      "Each H₂O contains one oxygen atom, so 2 H₂O contains 2.",
      "The coefficient multiplies the whole formula.",
    ),
  ],
  refresher: [
    c(
      "r-setup",
      "Choose a cell",
      "For the stated simple-school-cell comparison, which setup gives a non-zero reading?",
      "Copper and zinc in sodium chloride solution",
      {
        "Two matching copper plates in matching solution":
          "Matching identical electrodes have zero output in these stated conditions.",
        "Copper and zinc in the supplied distilled-water zero-output case":
          "Use the supplied comparison; this is not a claim about all water.",
      },
      "Use different metals and the supplied conducting electrolyte.",
      "Check both plates and the liquid.",
    ),
    n(
      "r-series",
      "Add series voltages",
      "Four 1.5 V cells face the same way in the supplied ideal series model. What voltage do they give?",
      6,
      "V",
      "4×1.5=6 V; the series connection matters.",
      "Add the four potential differences.",
    ),
    c(
      "r-restore",
      "Distinguish recharge",
      "What restores the specified discharged rechargeable cell's reactants?",
      "External electrical energy driving reverse reactions",
      {
        "Adding arbitrary water":
          "Water addition is not the stated recharge mechanism.",
        "Creating new elements":
          "Recharging reverses reactions; it does not create elements.",
      },
      "An external electrical supply drives the reverse chemical reactions.",
      "Think about the direction of the chemical change.",
    ),
    c(
      "r-feed",
      "Keep a fuel cell operating",
      "A working hydrogen fuel-cell system loses its oxygen feed. What reactant must be restored?",
      "Oxygen",
      {
        Water: "Water is the new chemical product.",
        "Carbon dioxide":
          "Carbon dioxide is not a reactant in the overall hydrogen–oxygen reaction.",
      },
      "Both hydrogen and oxygen are required; continuous hydrogen alone is insufficient.",
      "Name both reactants.",
    ),
    n(
      "r-equation",
      "Balance oxygen",
      "In 2 H₂+xO₂→2 H₂O, what is x?",
      1,
      "",
      "Products contain 2 O atoms, supplied by one O₂.",
      "Count oxygen on each side.",
    ),
    c(
      "r-impact",
      "Judge the whole system",
      "Hydrogen production in the supplied process releases CO₂. Does water at the fuel-cell outlet establish zero whole-system CO₂?",
      "No; production emissions must be included",
      {
        "Yes; only the outlet matters":
          "The claim concerns the whole system, including production.",
        "Yes; water contains no hydrogen":
          "Water contains hydrogen and oxygen; that does not establish the lifecycle.",
      },
      "The cell forms water, but its hydrogen supply can cause emissions.",
      "Separate the cell reaction from production.",
    ),
    c(
      "r-controls",
      "Select a fair comparison",
      "MetalX is varied against fixed copper; voltage is measured in copper sulfate solution. Which variables should be controlled?",
      "Solution concentration and solution temperature",
      {
        "MetalX and measured voltage":
          "These are the independent variable and response.",
        "Only the desired voltage": "You cannot force the measured response.",
      },
      "Match solution conditions to compare metal identity fairly.",
      "Do not control the variable you vary or measure.",
    ),
    c(
      "r-constraints",
      "Check the required use",
      "A 450 km source and a 300 km source must complete 500 km without a stop. Which meets the supplied range requirement?",
      "Neither",
      {
        "The 450 km source": "450 km is still less than 500 km.",
        Both: "Both supplied ranges are below the requirement.",
      },
      "A relatively larger range does not necessarily meet an absolute requirement.",
      "Compare each range with 500 km.",
    ),
    c(
      "r-carriers",
      "Distinguish conductors",
      "Which charge carriers are appropriate for the simple cell's external metal wire and electrolyte?",
      "Electrons in the wire; ions in the electrolyte",
      {
        "Electrons alone through both":
          "The electrolyte conducts through ions.",
        "Neutral atoms through both":
          "Neutral atoms are not the stated charge carriers.",
      },
      "External electronic conduction differs from ionic conduction in the solution.",
      "Identify the two paths separately.",
    ),
    c(
      "r-current",
      "Distinguish potential difference",
      "A cell has a potential difference while its external load circuit is open. What follows?",
      "No current flows through that open load circuit",
      {
        "There must be no voltage":
          "Potential difference can remain across an open circuit.",
        "Voltage and current are identical":
          "Potential difference and current are distinct quantities.",
      },
      "A potential difference alone does not prove current through an open load circuit.",
      "Ask whether the load circuit is complete.",
    ),
    c(
      "r-life",
      "Distinguish feed and lifetime",
      "Does replenishing both fuel-cell reactants guarantee infinite component life?",
      "No; components can still degrade",
      {
        "Yes; every component lasts forever":
          "Reactant supply does not prevent every form of component degradation.",
        "No; hydrogen can never be replenished":
          "Hydrogen can be supplied, but that does not guarantee infinite stack life.",
      },
      "Continuing feeds address reactant availability; component service life is a separate limit.",
      "Separate two causes of stopping.",
    ),
    c(
      "r-energy",
      "Identify the energy transfer",
      "A chemical cell powers a closed external load circuit. Which describes its energy transfer?",
      "Chemical energy transferred electrically",
      {
        "Electricity creates new elements":
          "Chemical reactions rearrange substances; they do not create elements.",
        "Energy created from nothing":
          "The cell uses chemical reactants as its energy source.",
      },
      "The chemical reactions can transfer energy electrically to the external circuit.",
      "Identify the source and transfer pathway.",
    ),
    n(
      "r-opposing",
      "Compare opposing voltages",
      "Three forward 1.5 V cells and one reversed 1.5 V cell are in the supplied ideal series model. What net voltage is predicted?",
      3,
      "V",
      "4.5−1.5=3 V in the reference direction.",
      "Subtract the reversed contribution from the forward total.",
    ),
    c(
      "r-reactivity",
      "Read a matched comparison",
      "Three metals, all more reactive than fixed copper, are compared in the same supplied solution. In this dataset, larger cell-voltage magnitude indicates a larger difference in reactivity from copper. X:1.8 V, Y:0.5 V, Z:1.1 V. Which order is most to least reactive?",
      "X, Z, Y",
      {
        "Y, Z, X":
          "This reverses the supplied voltage–reactivity relationship.",
        "X, Y, Z": "1.1 V exceeds 0.5 V.",
      },
      "Use the stated relationship under matching conditions:1.8>1.1>0.5 gives X>Z>Y. Do not derive universal voltage values from this order.",
      "Order the given readings and apply the stated relationship.",
    ),
  ],
  guided: [
    n(
      "g-cell",
      "Repair a simple cell",
      "Construct the supplied copper/zinc sodium-chloride cell and predict its given measured voltage.",
      1.1,
      "V",
      "The supplied matched comparison gives 1.10 V. This is a measured value under specified conditions.",
      "Select both metal plates and the supplied electrolyte.",
      m(
        "setup",
        "Choose the apparatus and enter your voltage prediction before checking.",
      ),
    ),
    n(
      "g-series",
      "Build a 12 V battery",
      "Build 12 V from supplied 1.5 V cells in series. How many cells are needed?",
      8,
      "cells",
      "12÷1.5=8; connect all eight in series with matching polarity.",
      "Divide the target voltage by one cell's voltage.",
      m(
        "series",
        "Enter the count, connection, reversed count and predicted net voltage.",
      ),
    ),
    c(
      "g-restore",
      "Restore the source",
      "Which action restores power after the specified primary alkaline cell uses up a reactant?",
      "Replace the specified primary cell",
      {
        "Electrically recharge this primary cell":
          "This specified primary cell is not designed for reverse-reaction recharging.",
        "Add oxygen to every cell":
          "Primary-cell replacement differs from a fuel-cell reactant feed.",
      },
      "Replace the specified non-rechargeable cell; its intended operation cannot reverse its reaction for reuse.",
      "Distinguish primary, rechargeable and fed sources.",
      m("restore", "Choose the restoration action and its chemical reason."),
    ),
    n(
      "g-reaction",
      "Construct the overall reaction",
      "For the smallest whole-number hydrogen–oxygen fuel-cell equation, what is the water coefficient?",
      2,
      "",
      "2 H₂+O₂→2 H₂O balances 4 H and 2 O on each side.",
      "Keep the formulas fixed and count both elements.",
      m(
        "reaction",
        "Enter all three coefficients and compare the resulting atom counts.",
      ),
    ),
    c(
      "g-choice",
      "Choose for a stated journey",
      "For the supplied 400 km non-stop trip with restoration within 10 min, which supplied source meets both limits?",
      "Hydrogen fuel-cell system",
      {
        "Rechargeable battery":
          "Its supplied 300 km range and 40 min restoration both fail the stated requirements.",
        Neither: "The supplied 450 km and 5 min fuel system meets both limits.",
      },
      "450≥400 and 5≤10; the fuel system meets the required use. This is a conclusion from supplied data.",
      "Check range and restoration time separately.",
      m(
        "compare",
        "Select the source, supporting data and the reason the alternative fails.",
      ),
    ),
    c(
      "g-evidence",
      "Identify the reaction product",
      "What is the only new chemical product in the overall hydrogen–oxygen fuel-cell reaction?",
      "Water",
      {
        "Carbon dioxide": "Neither hydrogen nor oxygen supplies carbon.",
        "Every gas at the outlet is water":
          "Unused inlet gases can also leave an air-fed outlet.",
      },
      "Water is the new product; unchanged unused gases are not new reaction products.",
      "Distinguish formed product from unused inlet material.",
      m("evidence", "Choose the chemical claim and its supporting reason."),
    ),
  ],
  practice: [
    c(
      "p-energy",
      "Connect chemistry and electricity",
      "When a chemical cell powers a closed external load circuit, what is its energy source and transfer pathway?",
      "Chemical energy transferred electrically",
      {
        "Gravity transferred to new elements":
          "The stated source is a chemical reaction.",
        "New energy created from nothing":
          "Energy is transferred from the chemical system.",
      },
      "Chemical reactions can transfer energy electrically through the external circuit. Potential difference alone is not a quantity of transferred energy.",
      "Identify the chemical source and electrical pathway.",
    ),
    n(
      "p-identical",
      "Predict matching electrodes",
      "Two identical copper plates have matching electrolyte and temperature conditions with no gradients. What voltage does the stated simple-cell comparison give?",
      0,
      "V",
      "Matching identical electrodes give 0 V in the stated comparison.",
      "Check whether there is a difference between the electrodes.",
      m(
        "setup",
        "Retain the matching copper plates and predict the supplied output.",
        "identical",
      ),
    ),
    n(
      "p-mg",
      "Interpret measured voltages",
      "Copper sulfate comparison: fixed Cu with Mg 2.71 V, Zn 1.10 V or Co 0.62 V. What is the largest supplied reading?",
      2.71,
      "V",
      "2.71 V is the largest of the supplied matched measurements.",
      "Compare the three observed values.",
      m(
        "setup",
        "Construct the supplied largest-output case; do not invent an electrode potential.",
        "magnesium",
      ),
    ),
    n(
      "p-co",
      "Interpret the smallest output",
      "Same matched comparison: Mg 2.71 V, Zn 1.10 V, Co 0.62 V. What is the smallest non-zero reading?",
      0.62,
      "V",
      "0.62 V is the smallest supplied non-zero reading.",
      "Compare only the supplied values.",
      m(
        "setup",
        "Select the matching apparatus and predict the smallest measured output.",
        "cobalt",
      ),
    ),
    c(
      "p-reactivity",
      "Infer a supported reactivity order",
      "In the supplied fixed-copper comparison, Mg, Zn and Co are all more reactive than copper. For this matched dataset larger voltage magnitude indicates a larger reactivity difference: Mg 2.71 V, Zn 1.10 V, Co 0.62 V. Order the three from most to least reactive.",
      "Mg, Zn, Co",
      {
        "Co, Zn, Mg": "This reverses the given relation.",
        "Mg, Co, Zn": "Zinc's supplied 1.10 V exceeds cobalt's 0.62 V.",
      },
      "2.71>1.10>0.62 and the stated relationship give Mg>Zn>Co. This is interpretation of the supplied comparison, not a universal formula for electrode voltage.",
      "Apply the given relationship to the ordered readings.",
    ),
    n(
      "p-six",
      "Construct another target",
      "How many supplied 1.5 V cells facing the same way in series give 6 V?",
      4,
      "cells",
      "6÷1.5=4 cells.",
      "Divide target voltage by cell voltage.",
      m(
        "series",
        "Construct the 6 V target, including connection and polarity.",
        "six",
      ),
    ),
    n(
      "p-decimal",
      "Use a different cell voltage",
      "Six supplied 1.2 V cells face the same way in the ideal series model. Predict the voltage.",
      7.2,
      "V",
      "6×1.2=7.2 V.",
      "Use the supplied 1.2 V, not 1.5 V.",
      m(
        "series",
        "Construct the 7.2 V battery from the stated cells.",
        "decimal",
      ),
    ),
    n(
      "p-reversed",
      "Extension: opposing polarity",
      "Four 1.5 V cells are in the ideal series model; one is reversed. Predict the signed voltage in the reference direction.",
      3,
      "V",
      "Three forward cells contribute 4.5 V and the reversed cell subtracts 1.5 V: net 3 V.",
      "Add forward contributions and subtract the opposing one.",
      m(
        "series",
        "Retain four cells with one reversed and enter your signed prediction.",
        "oppose",
      ),
    ),
    n(
      "p-cancel",
      "Extension: cancelling voltages",
      "Four 1.5 V series cells have two facing each direction. What is the ideal net voltage?",
      0,
      "V",
      "Two forward 3 V and two reverse 3 V cancel. This does not describe a safe real battery connection.",
      "Compare the two equal opposing totals.",
      m(
        "series",
        "Represent the supplied ideal polarity comparison; this is not a practical assembly instruction.",
        "cancel",
      ),
    ),
    c(
      "p-secondary",
      "Explain rechargeable cells",
      "What supplies the energy to restore the specified rechargeable cell's reactants?",
      "An external electrical supply",
      {
        "The cell creates energy from nothing": "External energy is required.",
        "Fresh hydrogen is always added":
          "This is a rechargeable cell, not the stated hydrogen fuel-cell system.",
      },
      "External electrical energy drives the reverse reactions.",
      "Distinguish recharge from fuel supply.",
      m(
        "restore",
        "Choose the rechargeable-cell restoration mechanism.",
        "secondary",
      ),
    ),
    c(
      "p-hydrogen",
      "Restore the missing feed",
      "The working fuel-cell system has oxygen but has lost its hydrogen feed. What is missing?",
      "Hydrogen",
      {
        Water: "Water is the new reaction product.",
        Carbon: "The overall reaction uses hydrogen and oxygen.",
      },
      "Restore the specified hydrogen feed; oxygen alone cannot sustain the reaction.",
      "Identify the absent reactant.",
      m("restore", "Select the missing feed and a reason.", "hydrogen"),
    ),
    c(
      "p-open",
      "Distinguish voltage and current",
      "A supplied cell retains a potential difference but its external load circuit is open. Which statement is supported?",
      "No current flows through the open load circuit",
      {
        "The cell must have zero voltage":
          "A potential difference can exist across an open circuit.",
        "Voltage and current are the same quantity":
          "They are different quantities.",
      },
      "Complete the external circuit to permit current through its load; a voltage reading alone does not prove load current.",
      "Separate potential difference from charge flow.",
      m(
        "restore",
        "Restore the load path rather than incorrectly refuelling the cell.",
        "open",
      ),
    ),
    n(
      "p-double",
      "Balance a specified scale",
      "For xH₂+2 O₂→yH₂O, what is x in a balanced overall reaction?",
      4,
      "",
      "2 O₂ gives 4 O atoms, requiring 4 H₂O and 4 H₂.",
      "Balance oxygen, then hydrogen.",
      m(
        "reaction",
        "Use the specified 2 O₂ coefficient and retain all atom counts.",
        "doubled",
      ),
    ),
    n(
      "p-triple",
      "Balance another scale",
      "For 6 H₂+xO₂→yH₂O, what is x?",
      3,
      "",
      "6 H₂ requires 6 H₂O, containing 6 O atoms supplied by 3 O₂.",
      "Count atoms rather than changing the formulas.",
      m("reaction", "Use the specified 6 H₂ scale.", "tripled"),
    ),
    c(
      "p-short",
      "Compare cost for a suitable source",
      "For the supplied 200 km trip, overnight restoration and available infrastructure for both sources, which meets the range at lower stated trip-energy cost?",
      "Rechargeable battery",
      {
        "Fuel cell because restoration is faster":
          "Extra speed is not required; the battery meets the constraints at£9 instead of£60.",
        Neither: "Both stated ranges exceed 200 km.",
      },
      "The battery meets range and timing requirements and has lower supplied cost.",
      "Apply the stated priorities.",
      m(
        "compare",
        "Use the short-trip requirements and cost evidence.",
        "short",
      ),
    ),
    c(
      "p-supply",
      "Account for infrastructure",
      "The supplied 200 km trip allows overnight restoration. Compatible chargers exist but no hydrogen supply is available. Which supplied system can be restored locally?",
      "Rechargeable battery",
      {
        "Fuel cell because its nominal range is larger":
          "It cannot receive its required hydrogen locally.",
        Both: "Only the battery has the specified available compatible supply.",
      },
      "A fuel-cell system requires a usable hydrogen feed; nominal range alone is insufficient.",
      "Check access to the required supply.",
      m(
        "compare",
        "Consider the stated infrastructure rather than range alone.",
        "infrastructure",
      ),
    ),
    c(
      "p-neither",
      "Reject an inadequate choice",
      "The supplied systems have 450 km and 300 km non-stop ranges. A 500 km trip permits no intermediate supply. Which meets the requirement?",
      "Neither",
      {
        "Fuel cell": "450 km remains below 500 km.",
        "Rechargeable battery": "300 km is below 500 km.",
      },
      "Neither supplied range reaches the required distance.",
      "A larger value can still be insufficient.",
      m("compare", "Retain the 500 km constraint in the judgement.", "neither"),
    ),
    c(
      "p-fossil",
      "Evaluate the supply chain",
      "Hydrogen in the supplied process comes from fossil feedstock with CO₂ release. Which conclusion is supported?",
      "The complete stated system is not carbon-free",
      {
        "Water at the cell outlet proves zero lifecycle emissions":
          "Production emissions are part of the lifecycle.",
        "The fuel-cell reaction itself must form methane":
          "The specified overall cell reaction forms water.",
      },
      "A water-forming cell reaction can use hydrogen whose production causes CO₂ emissions.",
      "Separate reaction products from supply-chain effects.",
      m(
        "evidence",
        "Judge the whole-system claim from the supplied process.",
        "fossil",
      ),
    ),
    c(
      "p-renewable",
      "Keep an environmental claim conditional",
      "Specified renewable electricity powers water electrolysis to make hydrogen. No manufacturing or transport inventory is given. What is justified?",
      "This production can use renewable energy; full lifecycle emissions are not established",
      {
        "Every hydrogen supply is renewable":
          "The claim depends on the stated electricity and production route.",
        "The full lifecycle is proven emission-free":
          "Manufacturing and transport data are absent.",
      },
      "The stated route supports a conditional production claim, not an unreported whole-lifecycle guarantee.",
      "Limit the conclusion to supplied evidence.",
      m(
        "evidence",
        "Separate known production conditions from unknown lifecycle effects.",
        "renewable",
      ),
    ),
    c(
      "p-controls",
      "Design a fair metal comparison",
      "Compare metalX with fixed copper in copper sulfate solution while measuring voltage. Which controls support the comparison?",
      "Same solution concentration and solution temperature",
      {
        "Same metalX and forced voltage":
          "MetalX is varied and voltage is the response.",
        "Only the classroom temperature, regardless of solution":
          "Control the solution temperature, not merely an unrelated room reading.",
      },
      "Matched solution conditions help isolate metal identity; other relevant geometry and amount controls can also matter.",
      "Identify the independent variable and response.",
      m(
        "evidence",
        "Choose valid solution controls and explain why voltage is not a control.",
        "controls",
      ),
    ),
    c(
      "p-carriers",
      "Identify charge paths",
      "In the simple cell, which charge carriers apply to the external metal wire and electrolyte?",
      "Wire electrons and electrolyte ions",
      {
        "Only neutral atoms in both":
          "Neutral atoms do not provide the stated charge flow.",
        "Electrons move through the electrolyte as in the wire":
          "Electrolyte conduction involves ions.",
      },
      "Charge transfer in the external metal differs from ionic movement in the electrolyte.",
      "Name the two conducting regions.",
      m(
        "evidence",
        "Select both the carriers and their different paths.",
        "carriers",
      ),
    ),
    c(
      "p-life",
      "Avoid perpetual-operation claims",
      "A supplier states finite fuel-cell stack life even when hydrogen and oxygen are replenished. What is supported?",
      "Feeds sustain reaction but do not guarantee infinite component life",
      {
        "Continuous feed guarantees infinite stack life":
          "Components can degrade.",
        "Reactants can never be replenished":
          "Fuel cells are supplied with reactants.",
      },
      "Continuous feed addresses reactant availability, not all component degradation.",
      "Distinguish reactant depletion from component life.",
      m("evidence", "Judge the finite-life evidence.", "durability"),
    ),
    w(
      "p-method",
      "Explain a simple-cell investigation",
      "Describe how the supplied copper/metalX copper-sulfate comparison can fairly compare metal identity. Include the response, two controls and how to use the supplied readings.",
      "Change metalX against fixed copper; measure voltage. Keep solution concentration and solution temperature the same, with matched apparatus and electrode geometry where appropriate. Compare supplied voltage magnitudes under these conditions; do not present the values as universal metal constants.",
      [
        "Name metalX as the varied variable and voltage as the response.",
        "State two relevant controlled conditions.",
        "Use the supplied readings under matching conditions and state the limit.",
      ],
    ),
    w(
      "p-evaluation",
      "Write a supported comparison",
      "Original data: fuel 450 km/5 min/£60; battery 300 km/40 min/£9. The user needs 400 km without a stop and restoration within 10 min. Evaluate both, make a judgement and identify one limitation of extending that judgement.",
      "Choose the supplied fuel system: 450 km exceeds 400 km and 5 min is below 10 min. The battery fails both with 300 km and 40 min, although its£9 cost is lower than£60. The judgement depends on these supplied requirements, measurements and compatible hydrogen infrastructure; it does not prove universal superiority or a current market price.",
      [
        "Compare both sources with both required limits.",
        "Recognise the battery's cost advantage without ignoring the requirements.",
        "Support a judgement and a limitation with the supplied evidence.",
      ],
    ),
    w(
      "p-environment",
      "Explain a conditional environmental claim",
      "Explain why water as the only new reaction product does not by itself make a hydrogen fuel-cell system carbon-free overall. Compare specified fossil production with renewable-powered electrolysis.",
      "The hydrogen–oxygen cell forms water, but hydrogen production and transport also matter. A supplied fossil-production process releases CO₂. Renewable-powered water electrolysis can avoid that specified fossil energy route, but electricity origin and manufacturing/transport evidence are needed before claiming a full carbon-free lifecycle.",
      [
        "Distinguish the cell product from supply-chain effects.",
        "Compare the two stated production routes conditionally.",
        "Do not claim an unreported zero-emission lifecycle.",
      ],
    ),
  ],
  checkForms: [
    [
      n(
        "A-series",
        "Construct a fresh target",
        "How many supplied 1.5 V cells must face the same way in series to make 9 V?",
        6,
        "cells",
        "9÷1.5=6 cells in series.",
        "Use target divided by cell voltage.",
      ),
      n(
        "A-water",
        "Transfer the atom balance",
        "For 8 H₂+xO₂→8 H₂O, calculate x.",
        4,
        "",
        "8 H₂O contains 8 O atoms;4 O₂ supplies 8 O.",
        "Balance the fixed oxygen formulas.",
      ),
      c(
        "A-use",
        "Evaluate new constraints",
        "A 240 km trip allows overnight restoration. Both compatible supplies are available. Which source meets the required range at lower trip-energy cost?",
        "Source B",
        {
          "Source F":
            "Its range and faster restoration are unnecessary for the stated requirement, and its cost is higher.",
          Neither: "Both ranges exceed 240 km.",
        },
        "B meets 240 km, allows overnight restoration and costs£8 instead of£44.",
        "Check constraints before cost.",
      ),
      c(
        "A-charge",
        "Identify a restoration mechanism",
        "A supplied undamaged rechargeable cell is discharged. Which restores its chemical reactants?",
        "External electrical energy driving reverse reactions",
        {
          "Fuel-cell oxygen feed only":
            "This is a rechargeable cell, not the stated fuel-cell system.",
          "Creation of energy": "An external energy supply is needed.",
        },
        "Recharging reverses the cell's chemical reactions using electrical energy.",
        "Name the energy source and reaction direction.",
      ),
      w(
        "A-impact",
        "Evaluate an emission statement",
        "An air-fed hydrogen fuel-cell outlet contains water and unused nitrogen. Its hydrogen supplier reports fossil-process CO₂. Evaluate 'every outlet substance is water and the full system is carbon-free'.",
        "Both parts overstate the evidence. Water is the new chemical reaction product; unused nitrogen from the inlet can leave unchanged. Reported hydrogen-production CO₂ means the supplied full system is not carbon-free.",
        [
          "Separate new product from unused inlet gas.",
          "Include reported production emissions in the overall judgement.",
        ],
      ),
    ],
    [
      n(
        "B-series",
        "Use another fresh target",
        "How many supplied 1.2 V cells facing the same way in series give 9.6 V?",
        8,
        "cells",
        "9.6÷1.2=8 cells.",
        "Use the stated single-cell voltage.",
      ),
      n(
        "B-oxygen",
        "Transfer another atom balance",
        "For 10 H₂+xO₂→10 H₂O, calculate x.",
        5,
        "",
        "10 water formulas contain 10 O atoms;5 O₂ supplies them.",
        "Count oxygen atoms.",
      ),
      c(
        "B-use",
        "Apply a fresh absolute limit",
        "A 460 km trip permits no intermediate supply. Which supplied source meets the non-stop range requirement?",
        "Neither",
        {
          "Source F": "420 km is less than 460 km.",
          "Source B": "280 km is less than 460 km.",
        },
        "Neither supplied source meets 460 km without a stop.",
        "Compare each range with the required distance.",
      ),
      c(
        "B-feed",
        "Identify a missing reactant",
        "An otherwise working hydrogen fuel-cell system receives hydrogen but no oxygen. Which conclusion is supported?",
        "Restore the oxygen feed to supply the missing reactant",
        {
          "Hydrogen alone always sustains the reaction":
            "Both reactants are needed.",
          "Restore water because it is the reactant":
            "Water is the new product in the overall reaction.",
        },
        "Hydrogen and oxygen are both required for the stated reaction.",
        "Distinguish reactants from products.",
      ),
      w(
        "B-method",
        "Explain controlled conditions",
        "MetalX is varied against fixed copper in copper sulfate solution and voltage is measured. Explain two valid controls and why 'keep voltage constant' is not an appropriate control.",
        "Keep solution concentration and solution temperature matched to avoid changing those influences while comparing metals. Voltage is the measured response; forcing it constant would defeat the comparison. Match other relevant apparatus conditions as appropriate.",
        [
          "Name two relevant solution controls and their purpose.",
          "Explain that voltage is the measured response.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "R-series",
        "Retrieve the series calculation",
        "How many supplied 1.5 V cells facing the same way in series give 7.5 V?",
        5,
        "cells",
        "7.5÷1.5=5.",
        "Divide target by individual voltage.",
      ),
      c(
        "R-primary",
        "Retrieve primary-cell depletion",
        "Why can the specified primary cell no longer power its device after a reactant is used up?",
        "Its chemical reaction can no longer continue as designed",
        {
          "All cells recharge themselves":
            "Restoration depends on the source type and requires replacement or an appropriate energy/reactant supply.",
          "Energy is created indefinitely":
            "The reaction needs available reactants.",
        },
        "A reactant is depleted; the specified primary cell is not restored by reversing its reaction.",
        "Link reactant availability to the chemical change.",
      ),
      w(
        "R-judgement",
        "Retrieve conditional evaluation",
        "Explain why there is no universally best choice between a rechargeable battery and a hydrogen fuel-cell system from their names alone.",
        "The choice depends on required range, restoration time, cost, infrastructure and production/lifecycle evidence. Compare supplied data with the stated use, support the judgement and recognise missing information.",
        [
          "Name relevant use constraints.",
          "Require supplied comparative evidence and identify limits.",
        ],
      ),
    ],
    [
      n(
        "S-balance",
        "Retrieve overall atom conservation",
        "For 12 H₂+xO₂→12 H₂O, calculate x.",
        6,
        "",
        "12 O atoms require 6 O₂.",
        "Count both sides using fixed formulas.",
      ),
      c(
        "S-recharge",
        "Retrieve reaction reversal",
        "Which describes recharging the specified rechargeable cell?",
        "External electrical energy reverses its chemical reactions",
        {
          "All fuel cells are recharged this way":
            "Hydrogen fuel cells require reactant feeds.",
          "Adding arbitrary acid restores every cell":
            "The stated recharge mechanism is electrical reaction reversal.",
        },
        "Electrical energy drives the reverse chemical change.",
        "Distinguish source types.",
      ),
      w(
        "S-lifecycle",
        "Retrieve environmental limits",
        "A supplier reports water as the fuel-cell reaction product but provides no hydrogen-production or transport data. What environmental conclusion is justified, and what remains unknown?",
        "Water is the stated new cell-reaction product. Production and transport impacts are unreported, so a carbon-free whole-system claim is not established.",
        [
          "State the known cell-product fact.",
          "Identify the missing lifecycle evidence and limit the conclusion.",
        ],
      ),
    ],
  ],
};
const allTasks = [
  ...cellsJourney.warmup,
  ...cellsJourney.refresher,
  ...cellsJourney.guided,
  ...cellsJourney.practice,
  ...cellsJourney.checkForms.flat(),
  ...cellsJourney.reviewForms.flat(),
];
const byId = new Map(allTasks.map((t) => [t.id, t]));
// Preserve the exact saved wrong choice while displaying the corrected spacing.
byId.get("cf-v1-r-constraints")!.optionAliases = {
  "The450km source": "The 450 km source",
};
byId.get("cf-v1-A-use")!.cellsComparison = {
  sources: [
    {
      label: "Source F",
      rangeKm: 380,
      restorationMinutes: 6,
      tripCostPounds: 44,
    },
    {
      label: "Source B",
      rangeKm: 260,
      restorationMinutes: 35,
      tripCostPounds: 8,
    },
  ],
};
byId.get("cf-v1-B-use")!.cellsComparison = {
  sources: [
    { label: "Source F", rangeKm: 420, restorationMinutes: 4 },
    { label: "Source B", rangeKm: 280, restorationMinutes: 30 },
  ],
};
const followUps: Record<string, string> = {
  "p-energy": "r-energy",
  "p-identical": "r-setup",
  "p-mg": "r-setup",
  "p-co": "r-setup",
  "p-reactivity": "r-reactivity",
  "p-six": "r-series",
  "p-decimal": "r-series",
  "p-reversed": "r-opposing",
  "p-cancel": "r-opposing",
  "p-secondary": "r-restore",
  "p-hydrogen": "r-feed",
  "p-open": "r-current",
  "p-double": "r-equation",
  "p-triple": "r-equation",
  "p-short": "r-constraints",
  "p-supply": "r-constraints",
  "p-neither": "r-constraints",
  "p-fossil": "r-impact",
  "p-renewable": "r-impact",
  "p-controls": "r-controls",
  "p-carriers": "r-carriers",
  "p-life": "r-life",
  "p-method": "r-controls",
  "p-evaluation": "r-constraints",
  "p-environment": "r-impact",
};
for (const [id, follow] of Object.entries(followUps))
  byId.get("cf-v1-" + id)!.followUp = "cf-v1-" + follow;
function family(name: string, ids: string[], legacy: string[] = []) {
  const members = ids.map((id) => "cf-v1-" + id);
  for (const id of members) {
    const q = byId.get(id);
    if (!q) throw Error("Unknown individual cells task" + id);
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        "cells-family-" + name,
        ...members.filter((other) => other !== id),
        ...legacy,
      ]),
    ];
  }
}
family("energy-reaction", ["r-energy", "p-energy"], ["cells-and-fuel-cells-0"]);
family("simple-cell", ["r-setup", "g-cell", "p-identical", "p-mg", "p-co"]);
family("reactivity", ["r-reactivity", "p-reactivity", "p-mg", "p-co"]);
family("series", [
  "warm-series",
  "r-series",
  "g-series",
  "p-six",
  "p-decimal",
  "A-series",
  "B-series",
  "R-series",
]);
family("opposing", ["r-opposing", "p-reversed", "p-cancel"]);
family("primary", ["g-restore", "R-primary"]);
family(
  "recharge",
  ["r-restore", "p-secondary", "A-charge", "S-recharge"],
  ["cells-and-fuel-cells-1"],
);
family("feeds", ["r-feed", "p-hydrogen", "B-feed"], ["cells-and-fuel-cells-4"]);
family("current", ["r-current", "p-open"]);
family("overall-reaction", [
  "warm-oxygen",
  "r-equation",
  "g-reaction",
  "p-double",
  "p-triple",
  "A-water",
  "B-oxygen",
  "S-balance",
]);
family("water-product", ["g-evidence", "A-impact"], ["cells-and-fuel-cells-2"]);
family(
  "use-evaluation",
  [
    "r-constraints",
    "g-choice",
    "p-short",
    "p-supply",
    "p-neither",
    "p-evaluation",
    "A-use",
    "B-use",
    "R-judgement",
  ],
  ["cells-and-fuel-cells-5"],
);
family(
  "environment",
  [
    "r-impact",
    "p-fossil",
    "p-renewable",
    "p-environment",
    "A-impact",
    "S-lifecycle",
  ],
  ["cells-and-fuel-cells-3"],
);
family("controls", ["r-controls", "p-controls", "p-method", "B-method"]);
family("carriers", ["r-carriers", "p-carriers"]);
family("life", ["r-life", "p-life"]);
// A model exposes every switchable record in that mode. Link each reachable demand directly;
// exposure lookup is deliberately conservative and one-hop, not a transitive graph traversal.
const modeExposure: Record<CellsMode, string[]> = {
  setup: [
    "r-setup",
    "r-reactivity",
    "p-reactivity",
    "g-cell",
    "p-identical",
    "p-mg",
    "p-co",
  ],
  series: [
    "warm-series",
    "r-series",
    "r-opposing",
    "g-series",
    "p-six",
    "p-decimal",
    "p-reversed",
    "p-cancel",
    "A-series",
    "B-series",
    "R-series",
  ],
  restore: [
    "g-restore",
    "R-primary",
    "r-restore",
    "p-secondary",
    "A-charge",
    "S-recharge",
    "r-feed",
    "p-hydrogen",
    "B-feed",
    "r-current",
    "p-open",
  ],
  reaction: [
    "warm-oxygen",
    "r-equation",
    "g-reaction",
    "p-double",
    "p-triple",
    "A-water",
    "B-oxygen",
    "S-balance",
  ],
  compare: [
    "r-constraints",
    "g-choice",
    "p-short",
    "p-supply",
    "p-neither",
    "p-evaluation",
    "A-use",
    "B-use",
    "R-judgement",
  ],
  evidence: [
    "g-evidence",
    "A-impact",
    "r-impact",
    "p-fossil",
    "p-renewable",
    "p-environment",
    "S-lifecycle",
    "r-controls",
    "p-controls",
    "p-method",
    "B-method",
    "r-carriers",
    "p-carriers",
    "r-life",
    "p-life",
  ],
};
for (const q of allTasks)
  if (q.model?.kind === "cells-workbench") {
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...modeExposure[q.model.mode]
          .map((id) => "cf-v1-" + id)
          .filter((id) => id !== q.id),
      ]),
    ];
  }
