import type { LearningTask, LessonJourney, TaskModel } from "../types";
import type { VoltageMode } from "../../lib/cell-voltage";
import type { VoltageData } from "../../components/VoltageComparison";
type Model = Extract<TaskModel, { kind: "cell-voltage" }>;
type Task = LearningTask;
const model = (
  mode: VoltageMode,
  instruction: string,
  record?: string,
): Model => ({ kind: "cell-voltage", mode, instruction, record });
const n = (
  id: string,
  title: string,
  prompt: string,
  answer: number,
  explanation: string,
  hint: string,
  m?: Model,
): Task => ({
  id: "cv-v1-" + id,
  title,
  purpose: title,
  prompt,
  answer: String(answer),
  unit: "V",
  explanation,
  hint,
  model: m,
});
function c(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  m?: Model,
  data?: VoltageData,
): Task {
  const options = [answer, ...Object.keys(errors)],
    offset =
      [...id].reduce((s, ch) => s + ch.charCodeAt(0), 0) % options.length;
  return {
    id: "cv-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    model: m,
    voltageData: data,
  };
}
const w = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): Task => ({
  id: "cv-v1-" + id,
  title,
  purpose: title,
  prompt,
  answer,
  explanation: answer,
  hint: rubric[0],
  rubric,
});
const data = (
  reference: string,
  referenceRole: "first" | "second",
  values: ReadonlyArray<[string, number]>,
): VoltageData => ({
  reference,
  referenceRole,
  values: values.map(([metal, volts]) => ({ metal, volts })),
});
const specimenData = data("chromium", "second", [
  ["chromium", 0],
  ["zinc", 0.2],
  ["iron", 0.5],
  ["tin", 0.8],
  ["copper", 1.2],
]);
const letterData = data("R", "second", [
  ["A", 0.3],
  ["B", 1.1],
  ["C", -0.4],
  ["D", 0.7],
  ["E", 0],
]);
const negativeData = data("R", "second", [
  ["A", -0.7],
  ["B", -0.2],
  ["C", -1.4],
  ["D", -1],
  ["E", -0.5],
]);
const shiftedData = data("S", "second", [
  ["A", 2.3],
  ["B", 3.1],
  ["C", 1.6],
  ["D", 2.7],
  ["E", 2],
]);
const oppositeData = data("R", "first", [
  ["A", -0.3],
  ["B", -1.1],
  ["C", 0.4],
  ["D", -0.7],
  ["E", 0],
]);
export const voltageJourney: LessonJourney = {
  version: 1,
  introduction:
    "Read role-sensitive cell data, reconnect a voltmeter and infer a missing signed reading from a common reference.",
  scopeNote:
    "Separate Chemistry working AQA 8462 4.5.2.1. This dedicated Higher transfer route addresses the actual specimen Higher Paper 1 Q06.2–06.3; the specification section itself is not Higher-only, and the Foundation simple-cell core remains in the preceding cells lesson. QP 18–20 and paired MS 14 were read; the actual diagram/table and mark-scheme page were visually inspected. The supplied convention makes V(metal1,metal2) positive when metal2 is more reactive and negative when metal1 is more reactive. The specimen identifies copper as least reactive and predicts iron/copper −0.7 V using iron/chromium +0.5 V and copper/chromium +1.2 V. This experiment-specific table must not become a universal chromium/zinc reactivity order or a standard-potential table. Actual 2019 Foundation Q04.1–.3 and MS 11 distinguish controlled conditions, comparison magnitudes, Mg/Zn/Co ranking and matching Cu/Cu 0 V. Those unsigned magnitudes alone do not define a signed lead convention. Here red is the positive meter input and black COM; reversing only those leads changes the reading sign, not the unchanged physical cell donor/acceptor, unsigned magnitude or separate conducting-load circuit. Both probes on one plate measure zero between that point without proving the full cell has no potential difference. Under matching reference roles and comparison conditions, V(A,B)=V(A,R)−V(B,R). Subtract the whole signed second reading; a shared display-origin shift, including the reference, cancels from a difference and does not alter the measured cell readings themselves. A different common reference can shift both comparison readings equally without changing the pair difference. The graph plots relative comparison readings, not an absolute isolated-electrode potential. Not measured is not zero. Exact constructed inconsistent data must be diagnosed; real measurements require their stated rounding, uncertainty and controls. Voltage depends on electrode/electrolyte identity, concentration and temperature; do not mix unmatched experiments as one unchanged comparison. Negative reading is not negative reactivity or proof of energy absorption. The reduced species/products at the receiving electrode cannot be inferred from voltage signs alone. The actual OpenStax Electrode and Cell Potentials section and Cu/reference figure support difference and terminal roles; SHE, universal standard potentials, ΔG/K/Nernst and prescribed advanced conditions are not required here. Real 3D shows immersed separate plates, electrolyte, red/black lead topology, voltmeter and separate load. Wire changes preserve physical metals; proposed discharge arrows are annotations, not measured current or particle speeds. Geometry does not calculate voltage. Static independent tables preserve given data without a recommendation or learning model. Written explanations remain self-reviewed; global exposure is conservative, check feedback deferred and delayed retrieval waits actual seven days. Full board mapping, whole-course educational parity and exam readiness remain unfinished.",
  outcomes: [
    "Read a signed table using its actual metal roles and convention.",
    "Distinguish signed voltage from its unsigned magnitude.",
    "Explain meter-lead reversal separately from discharge electron direction.",
    "Infer a missing comparison using two cells with the same reference role and conditions.",
    "Order metals from role-consistent signed data and explain the limits of that evidence.",
  ],
  warmup: [
    n(
      "warm-magnitude",
      "Keep magnitude unsigned",
      "What is the magnitude of a −0.60 V reading?",
      0.6,
      "Magnitude is the unsigned size of the difference: 0.60 V.",
      "Separate sign from size.",
    ),
    n(
      "warm-subtract",
      "Recall signed subtraction",
      "Calculate 0.40−0.90.",
      -0.5,
      "Subtracting 0.90 from 0.40 gives −0.50.",
      "Keep the order of the two values.",
    ),
  ],
  refresher: [
    c(
      "r-roles",
      "Read the table roles",
      "In the supplied matrix, how are the two metals assigned?",
      "Metal1 is the row; metal2 is the column",
      {
        "Metal1 is always the column":
          "The declared table uses rows for metal1.",
        "Both labels refer to the least reactive metal":
          "They specify apparatus/table roles, not reactivity ranks.",
      },
      "Read the row and column before interpreting a sign.",
      "Use the stated table headings.",
    ),
    c(
      "r-sign",
      "Use the stated sign rule",
      "Under the supplied convention, what does a negative reading mean for a different-metal pair?",
      "Metal1 is more reactive than metal2 in this comparison",
      {
        "Metal2 is more reactive":
          "That is the supplied positive-reading case.",
        "A negative reading proves no chemical reaction":
          "The sign describes the terminal potential order.",
      },
      "Apply the declared convention; a minus sign does not mean negative reactivity.",
      "Keep the metal roles fixed.",
    ),
    n(
      "r-magnitude",
      "Separate reading and magnitude",
      "A reading is −0.40 V. What is its unsigned magnitude?",
      0.4,
      "The reading keeps −; its magnitude is 0.40 V.",
      "An unsigned size is non-negative.",
    ),
    n(
      "r-reverse",
      "Reverse only meter leads",
      "The same cell reads +1.20 V. Only red and black meter connections are reversed. What is the new signed reading?",
      -1.2,
      "Reversing terminal order changes +1.20 V to −1.20 V, with the same magnitude and unchanged cell chemistry.",
      "Swap the sign, not the physical metals.",
    ),
    n(
      "r-subtract",
      "Use a common reference",
      "Given V(A,R)=+0.50 V and V(B,R)=+1.20 V under matching conditions, calculate V(A,B).",
      -0.7,
      "V(A,B)=0.50−1.20=−0.70 V. Reversing the requested A/B order would reverse the sign.",
      "First reference reading minus the complete second reading.",
    ),
    n(
      "r-negative",
      "Subtract a negative reading",
      "With the same reference role and conditions, V(A,R)=−0.60 V and V(B,R)=−1.40 V. Calculate V(A,B).",
      0.8,
      "−0.60−(−1.40)=+0.80 V. The second minus sign is part of the second reading.",
      "Subtract the entire signed value.",
    ),
    c(
      "r-carriers",
      "Separate discharge from measurement",
      "In the given discharging metal cell, which metal supplies electrons to the separate load?",
      "The more reactive metal in the stated pair",
      {
        "Whichever metal has the red meter lead":
          "Meter-lead choice does not decide the chemical donor.",
        "The electrolyte sends electrons through its bulk":
          "The external conducting circuit carries electrons; ionic conduction is different.",
      },
      "The given chemical donor remains fixed when only meter leads are reversed.",
      "Keep the physical cell and load unchanged.",
    ),
    c(
      "r-reference",
      "Check a shared comparison",
      "When may the two stated common-reference readings be subtracted for the target cell?",
      "Their reference role and comparison conditions match",
      {
        "Whenever the two numbers use volts":
          "Units alone do not establish matching experiments.",
        "Even after an arbitrary electrolyte change":
          "Electrolyte and temperature can affect voltage.",
      },
      "Use the same reference role and unchanged conditions. Relative display-origin offsets cancel; they do not change measured cell readings.",
      "Check roles and conditions before arithmetic.",
    ),
    c(
      "r-missing",
      "Do not invent a measurement",
      "A table entry says not measured. What does that establish?",
      "No observed reading is recorded",
      {
        "The cell has exactly 0 V":
          "Absence of an observation is not a zero measurement.",
        "The metals cannot react": "That conclusion needs chemical evidence.",
      },
      "Keep observed and inferred values distinct.",
      "Read the actual entry.",
    ),
    c(
      "r-order",
      "Keep reference orientation",
      "When the reference changes from metal2 to metal1 in each comparison, how should the signed readings be handled before ranking the other metals?",
      "Reverse their signs to compare the same relative-level order",
      {
        "Keep every sign and rank as before":
          "The terminal order has reversed.",
        "Choose the most negative reading regardless of roles":
          "A sign rule depends on the declared roles.",
      },
      "Reference-as-metal2 gives lower relative levels for more reactive metals in this supplied model; reference-as-metal1 reverses the signed readings.",
      "Read which role the reference occupies.",
    ),
    n(
      "r-zero",
      "Limit identical-electrode evidence",
      "Two matching copper plates both give +1.20 V against the same reference in this comparison. What is their mutual difference?",
      0,
      "1.20−1.20=0 V. This matching-electrode result does not prove copper is unreactive in other contexts.",
      "Equal relative levels have zero difference.",
    ),
    c(
      "r-probes",
      "Measure between the actual probes",
      "Both voltmeter probes touch the same conducting plate while a separate load remains across a discharging two-metal cell. What does the meter read?",
      "0 V between the same plate point",
      {
        "It necessarily shows the full cell voltage":
          "Both probes are not across the two different electrodes.",
        "It proves the separate cell has stopped reacting":
          "The unchanged load is still across the physical cell.",
      },
      "Equal probe potentials give zero meter difference; this does not establish zero across the separate cell/load.",
      "Identify the two actual measurement points.",
    ),
  ],
  guided: [
    n(
      "g-read",
      "Read a cell",
      "Read copper as metal1 and chromium as metal2. What is the signed reading?",
      1.2,
      "The copper row/chromium column records +1.2 V. The sign and magnitude are separate predictions.",
      "Select the stated row and column.",
      model(
        "read",
        "Select both roles; retain the signed observation and predict its unsigned size and relative reactivity.",
      ),
    ),
    n(
      "g-leads",
      "Swap the meter leads",
      "The given iron/copper cell reads −0.70 V. Reverse only its meter leads. What is the new reading?",
      0.7,
      "The terminal order reverses, giving +0.70 V. Iron still supplies discharge electrons to the unchanged separate load.",
      "Do not swap the chemical donor and acceptor.",
      model(
        "lead",
        "Reconnect both meter inputs, then predict the reading, magnitude and unchanged discharge direction.",
      ),
    ),
    n(
      "g-infer",
      "Infer the missing cell",
      "Use iron/chromium +0.50 V and copper/chromium +1.20 V to predict iron/copper.",
      -0.7,
      "0.50−1.20=−0.70 V. Iron is more reactive under this supplied investigation, so the stated iron/copper order has negative sign.",
      "Both cells share the reference in the second role.",
      model(
        "infer",
        "Place both given readings; independently choose the subtraction order, signed difference and magnitude.",
      ),
    ),
    c(
      "g-rank",
      "Use the comparison order",
      "Which metal is least reactive in the supplied specimen investigation?",
      "Copper",
      {
        Chromium: "Its supplied common-reference level is lowest, not highest.",
        Zinc: "Its level is below iron, tin and copper in this comparison.",
      },
      "Copper has the highest supplied level against chromium and is least reactive under the stated convention. This is evidence for this investigation, not a universal standard-potential table.",
      "Compare the common-reference roles.",
      model("rank", "Propose all five positions from most to least reactive."),
      specimenData,
    ),
    c(
      "g-evidence",
      "Explain the sign change",
      "What changes when only the voltmeter leads are reversed on the same discharging cell?",
      "The reading sign changes; the chemical donor and acceptor do not",
      {
        "The physical metals automatically swap reactivity":
          "Changing meter leads does not replace or chemically transform the plates.",
        "A negative reading means the cell absorbs electrical energy":
          "The sign describes meter terminal order.",
      },
      "The meter measures terminal potential difference in a chosen order; chemical discharge remains a separate fact.",
      "Separate measurement connections from the reaction.",
      model(
        "evidence",
        "Choose a supported claim and the reason for this lead-only change.",
      ),
    ),
  ],
  practice: [
    n(
      "p-negative",
      "Retain a recorded minus sign",
      "In the supplied specimen table, what reading is recorded for metal1=tin and metal2=copper?",
      -0.4,
      "The tin row/copper column records −0.4 V, not its unsigned magnitude.",
      "Read roles before sign.",
      model(
        "read",
        "Keep the negative reading and magnitude as independent entries.",
        "negative",
      ),
    ),
    n(
      "p-small",
      "Read another signed pair",
      "In the supplied specimen table, what reading is recorded for metal1=zinc and metal2=iron?",
      -0.3,
      "The zinc row/iron column records −0.3 V.",
      "Keep the column role fixed.",
      model("read", "Read the smaller negative comparison.", "small"),
    ),
    n(
      "p-zero",
      "Read the diagonal",
      "What reading is recorded for the supplied zinc/zinc diagonal?",
      0,
      "The matching zinc electrodes have 0.0 V in this stated comparison.",
      "Read the measured diagonal, not an empty cell.",
      model(
        "read",
        "Separate an observed zero from a missing observation.",
        "identical",
      ),
    ),
    n(
      "p-positive",
      "Use a positive observation",
      "In the supplied specimen table, what reading is recorded for metal1=tin and metal2=iron?",
      0.3,
      "The tin row/iron column records +0.3 V; under this convention iron is more reactive than tin in the stated comparison.",
      "Use the declared metal1/metal2 order.",
      model(
        "read",
        "Interpret the positive sign after selecting the actual roles.",
        "positive",
      ),
    ),
    n(
      "p-magnitude",
      "Do not copy the sign into magnitude",
      "The given tin/copper reading is −0.40 V. What is its unsigned magnitude?",
      0.4,
      "The unsigned separation is 0.40 V, while the signed reading remains −0.40 V.",
      "Magnitude is a size.",
      model("read", "Keep the two numerical predictions separate.", "negative"),
    ),
    c(
      "p-lookup",
      "Avoid transposing the table",
      "To read V(tin,copper) in this supplied matrix, which roles are needed?",
      "Tin row; copper column",
      {
        "Copper row; tin column": "That reverses the requested metal roles.",
        "Tin row; iron column": "That chooses a different second metal.",
      },
      "Metal1 is the row and metal2 the column. Reversing an available pair would reverse its sign, not give the same signed reading.",
      "Read both table headings.",
    ),
    n(
      "p-reverse",
      "Reverse a positive cell reading",
      "A given copper/iron cell reads +0.70 V with normal red/black connections. Reverse only those meter leads. What is the new reading?",
      -0.7,
      "The same magnitude is read in the opposite terminal order: −0.70 V. Iron remains the given discharge donor.",
      "Reverse sign without changing the physical cell.",
      model(
        "lead",
        "Keep the positive-to-negative reversal separate from discharge direction.",
        "positive",
      ),
    ),
    n(
      "p-wide",
      "Reverse a wider supplied comparison",
      "A given copper/chromium cell reads +1.20 V with normal meter connections. Reverse only the meter leads. What is the new reading?",
      -1.2,
      "+1.20 V becomes −1.20 V; the unsigned magnitude remains 1.20 V.",
      "Only the terminal order changes.",
      model(
        "lead",
        "Preserve the wider magnitude and stated donor/acceptor.",
        "wide",
      ),
    ),
    n(
      "p-normal",
      "Do not reverse unchanged wiring",
      "A given tin/copper cell reads −0.40 V with red on metal1=tin and black on metal2=copper. Keep those connections. What is the reading?",
      -0.4,
      "The connections are unchanged, so the supplied −0.40 V reading keeps its sign.",
      "Read whether the question asks for a reversal.",
      model(
        "lead",
        "Keep the requested normal wiring rather than automatically swapping leads.",
        "normal",
      ),
    ),
    n(
      "p-identical-swap",
      "Reverse a zero comparison",
      "The stated ideal copper/copper comparison reads 0 V. Reverse the meter leads. What is the reading?",
      0,
      "Reversing zero still gives zero; matching electrodes have no cell-driven net discharge direction in this ideal comparison.",
      "Keep the limited comparison context.",
      model(
        "lead",
        "Do not invent discharge direction for the matching-electrode case.",
        "identical",
      ),
    ),
    c(
      "p-electron-source",
      "Keep the chemical donor fixed",
      "Only the meter leads are reversed on the given discharging iron/copper cell. Which metal remains the discharge electron source?",
      "Iron",
      {
        Copper: "The meter reversal does not swap the given chemical donor.",
        "The black meter terminal creates electrons":
          "A terminal label does not create electrons.",
      },
      "Iron is the given more reactive donor; discharge electrons go from iron through the separate load towards copper.",
      "Identify the unchanged chemical pair.",
      model(
        "lead",
        "Propose the unchanged donor and destination independently of meter polarity.",
      ),
    ),
    n(
      "p-same-plate",
      "Measure the actual probe points",
      "Both voltmeter leads touch metal1=iron while the separate load stays across the given iron/copper cell. What does this meter read?",
      0,
      "Both probes have the same plate potential, so the meter reads 0 V between them. That does not establish zero across the separate two-metal cell/load.",
      "The probes are not across two different electrodes.",
      model(
        "lead",
        "Connect both meter leads to the same plate and retain the separate cell/load discharge.",
        "samePlate",
      ),
    ),
    n(
      "p-infer-reverse",
      "Reverse the target cell roles",
      "Given V(copper,chromium)=+1.20 V and V(iron,chromium)=+0.50 V, predict V(copper,iron).",
      0.7,
      "1.20−0.50=+0.70 V. The requested target is reversed from iron/copper.",
      "Subtract in the target metal order.",
      model(
        "infer",
        "Preserve the changed first/second target roles.",
        "reversed",
      ),
    ),
    n(
      "p-mixed",
      "Span opposite sides of zero",
      "Exact constructed readings under matching roles/conditions are V(A,R)=−0.30 V and V(B,R)=+0.80 V. Predict V(A,B).",
      -1.1,
      "−0.30−(+0.80)=−1.10 V; the magnitude is 1.10 V.",
      "The first level is below the second.",
      model(
        "infer",
        "Place the negative and positive readings before choosing the signed subtraction.",
        "mixed",
      ),
    ),
    n(
      "p-double-negative",
      "Subtract an entire negative value",
      "Exact constructed readings are V(A,R)=−0.60 V and V(B,R)=−1.40 V with the same reference role and conditions. Predict V(A,B).",
      0.8,
      "−0.60−(−1.40)=+0.80 V; subtracting the negative second reading increases the result.",
      "Keep both minus signs.",
      model(
        "infer",
        "Do not add two magnitudes or subtract an unsigned second value.",
        "negatives",
      ),
    ),
    n(
      "p-alternate",
      "Use another common reference",
      "The supplied equivalent comparisons give V(iron,tin)=−0.30 V and V(copper,tin)=+0.40 V. Predict V(iron,copper).",
      -0.7,
      "−0.30−(+0.40)=−0.70 V, agreeing with the chromium-reference route.",
      "Keep tin in the same role in both givens.",
      model(
        "infer",
        "Infer the same missing cell from the permitted alternative reference.",
        "alternate",
      ),
    ),
    n(
      "p-new-reference",
      "Use a different shared reference",
      "The unchanged A/B comparison is now measured against common reference S: V(A,S)=+1.90 V and V(B,S)=+2.60 V. Predict V(A,B).",
      -0.7,
      "1.90−2.60=−0.70 V. Using the same new reference for both preserves the pair difference under the stated unchanged comparison.",
      "Subtract the two readings against the same S.",
      model(
        "infer",
        "Do not treat a shared-reference reading as an absolute isolated-electrode voltage.",
        "shifted",
      ),
    ),
    n(
      "p-equal-reference",
      "Compare matching reference readings",
      "Two matching copper plates A/B each give +1.20 V against the same chromium reference. Predict V(copper A,copper B).",
      0,
      "1.20−1.20=0 V; equal relative levels give no mutual difference in this supplied comparison.",
      "Subtract matching levels.",
      model(
        "infer",
        "Keep both equal markers and independently predict zero difference.",
        "identical",
      ),
    ),
    c(
      "p-rank-letters",
      "Order a constructed comparison",
      "Which listed labelled metal is most reactive under this supplied common-reference convention?",
      "C",
      {
        B: "B has the highest reference-as-metal2 level, making it least reactive here.",
        E: "E is at the reference level; C is lower.",
      },
      "With R as metal2, C has the lowest level −0.4 V and is most reactive among the supplied labelled metals.",
      "Interpret the stated reference role.",
      model(
        "rank",
        "Order all five labelled metals from most to least reactive.",
        "letters",
      ),
      letterData,
    ),
    c(
      "p-rank-negative",
      "Order several negative readings",
      "Which listed labelled metal is least reactive under this supplied reference-as-metal2 convention?",
      "B",
      {
        C: "The most negative level belongs to the most reactive metal here.",
        D: "D is below A, E and B in relative-level order.",
      },
      "B at −0.2 V has the highest of these negative relative levels and is least reactive among this supplied set.",
      "Negative values still have a signed order.",
      model(
        "rank",
        "Retain the order across the entire negative set.",
        "negative",
      ),
      negativeData,
    ),
    c(
      "p-rank-shift",
      "Compare after changing reference",
      "Which labelled metal is least reactive under this supplied comparison against new reference S as metal2?",
      "B",
      {
        C: "Its supplied level 1.6 V is lowest, so it is most reactive in this set.",
        E: "Its level is below A, D and B.",
      },
      "B has the highest level 3.1 V. A common change in reference can shift all comparison readings without changing the relative order of the same metals.",
      "Compare the given readings under one reference role.",
      model(
        "rank",
        "Order the new common-reference observations without making voltages universal constants.",
        "shifted",
      ),
      shiftedData,
    ),
    c(
      "p-rank-opposite",
      "Read the reference in the first role",
      "With reference R now as metal1 in each listed comparison, which labelled metal is most reactive?",
      "C",
      {
        B: "The sign convention is now reference-first; choosing the most negative blindly reverses the order.",
        A: "C gives the largest positive reading as metal2 in this supplied set.",
      },
      "For V(R,metal), larger positive values identify a more reactive metal2 relative to the same R. Reversing the signs converts to the previous relative-level orientation; C is most reactive.",
      "The reference role changed.",
      model(
        "rank",
        "Read the first-role convention before proposing the full order.",
        "opposite",
      ),
      oppositeData,
    ),
    c(
      "p-inconsistent",
      "Retain contradictory exact records",
      "Exact unchanged-comparison claims are V(A,R)=+0.50 V, V(B,R)=+1.20 V and V(A,B)=−0.90 V. What is supported?",
      "The three exact claims are inconsistent",
      {
        "All three satisfy the shared-reference subtraction":
          "0.50−1.20 requires −0.70 V.",
        "Delete the inconvenient record and call it verified":
          "The records should be retained while their conditions are investigated.",
      },
      "The exact givens require−0.70 V, so −0.90 V cannot also hold for this stated unchanged comparison. Real measured data need their stated uncertainty/rounding.",
      "Test the given consistency rule.",
      model(
        "evidence",
        "Diagnose rather than silently replace the conflicting exact claim.",
        "inconsistent",
      ),
    ),
    c(
      "p-conditions",
      "Do not combine unmatched investigations",
      "One comparison used a different electrolyte and temperature from another. Can their numbers automatically be subtracted as one unchanged comparison?",
      "No; the roles and conditions must be justified as matching",
      {
        "Yes; all volt numbers are interchangeable":
          "Electrolyte and temperature affect voltage.",
        "Yes; electrode metal names fully determine every voltage":
          "The specification includes electrolyte and other conditions.",
      },
      "Voltage is not a universal function of metal names alone. Match the declared comparison conditions before transferring numerical differences.",
      "Check the actual investigation controls.",
      model(
        "evidence",
        "Judge the condition mismatch before doing arithmetic.",
        "controls",
      ),
    ),
    c(
      "p-missing",
      "Keep inference distinct from observation",
      "The specimen iron/copper entry says not measured. Before inferring a value, what is established?",
      "No observed reading is recorded",
      {
        "The cell was measured at exactly 0 V":
          "Not measured is not a zero observation.",
        "The table proves the metals are identical":
          "Missing data do not establish matching metals.",
      },
      "An inferred −0.70 V must be labelled as a prediction from other data, not a recorded observation.",
      "Distinguish an absent value from an observed zero.",
      model(
        "evidence",
        "Preserve the missing table entry while judging its meaning.",
        "missing",
      ),
    ),
    c(
      "p-negative-energy",
      "Do not misread the meter sign",
      "A given discharging cell has a −0.70 V meter reading under the declared terminal order. What does that sign establish?",
      "The chosen meter terminal potential order",
      {
        "The metal has negative reactivity":
          "Reactivity is not a signed voltmeter reading.",
        "The discharging cell must absorb electrical energy":
          "The sign alone does not reverse the stated chemical energy source.",
      },
      "A negative reading describes the measurement order; it is not proof of negative reactivity, absent reaction or energy absorption.",
      "Keep meter convention separate from chemical discharge.",
      model(
        "evidence",
        "Support a sign interpretation without changing the given donor/acceptor.",
        "sign",
      ),
    ),
    c(
      "p-zero-origin",
      "Shift only the display origin",
      "Every plotted relative level, including the reference, is shifted by +2 V on the display. What happens to the measured difference between two electrodes?",
      "It stays the same",
      {
        "It necessarily increases by 2 V":
          "Both levels gain the same offset, which cancels.",
        "It becomes an absolute isolated-electrode voltage":
          "A display origin does not change what is measured.",
      },
      "(first+2)−(second+2)=first−second. The measured cell readings themselves do not change.",
      "Subtract both full levels.",
      model(
        "evidence",
        "Separate a plotting-origin choice from a changed measured voltage.",
        "reference",
      ),
    ),
    c(
      "p-identical-scope",
      "Limit a zero-reading conclusion",
      "The supplied ideal copper/copper comparison reads 0 V. Which conclusion is supported?",
      "No electrode-reactivity difference in this matching-plate comparison",
      {
        "Copper cannot react in any chemical situation":
          "The matching-electrode result has narrower scope.",
        "The table entries marked not measured must also be 0 V":
          "A missing observation is different from this measured zero.",
      },
      "Two matching plates give no relative-reactivity difference here; copper can still react in other stated chemical contexts.",
      "State only what this comparison shows.",
      model(
        "evidence",
        "Keep matching-electrode evidence narrower than a universal unreactivity claim.",
        "identical",
      ),
    ),
    w(
      "p-explain-signed",
      "Explain the missing signed cell",
      "Explain how the supplied iron/chromium +0.50 V and copper/chromium +1.20 V comparisons give iron/copper −0.70 V, and distinguish its magnitude.",
      "Both givens use chromium in the same second role under the supplied comparison. Subtract first-minus-second: 0.50−1.20=−0.70 V. The magnitude is 0.70 V. The supplied sign rule makes iron more reactive than copper for this ordered pair. The prediction is inferred, not a previously recorded iron/copper observation.",
      [
        "Identify the matching reference role and conditions.",
        "Use ordered subtraction and distinguish signed reading from magnitude.",
        "State the limited reactivity and inferred-observation interpretation.",
      ],
    ),
    w(
      "p-explain-leads",
      "Explain lead-only reversal",
      "Explain why reversing only red/black meter leads on the given discharging iron/copper cell changes −0.70 V to +0.70 V without reversing its chemical electron-transfer direction.",
      "The meter subtracts its terminal potentials in the opposite order, so the sign reverses while magnitude stays 0.70 V. The physical iron/copper plates and separate conducting load are unchanged. Iron remains the given more reactive electron donor and the copper electrode receives electrons; discharge electrons still pass through the load from iron to copper.",
      [
        "Explain terminal-order reversal and unchanged magnitude.",
        "Keep the physical cell/load and given donor/acceptor unchanged.",
        "State the separate discharge electron direction.",
      ],
    ),
    w(
      "p-explain-evidence",
      "Explain data limits",
      "Explain why a missing voltage must not be treated as zero, and why values from changed electrolytes cannot automatically be combined as one unchanged comparison.",
      "Not measured means no observation is recorded; a later inferred value must be labelled as a prediction. Electrode/electrolyte identity, concentration and temperature can affect voltage, so the reference roles and conditions must match for the stated transfer. Real measurements also need their reported precision and uncertainty; inconsistent exact constructed records should be retained and investigated rather than silently deleted.",
      [
        "Distinguish absent observations, observed zero and inferred predictions.",
        "Justify matching reference roles and experimental conditions.",
        "Respect measurement limits and retain conflicting evidence.",
      ],
    ),
  ],
  checkForms: [
    [
      {
        ...n(
          "A-table",
          "Read a reserved observation",
          "Use the supplied specimen matrix. What reading was recorded for metal1=tin and metal2=copper?",
          -0.4,
          "The tin row/copper column records −0.4 V; this is an observation, distinct from an inferred missing cell.",
          "Read both table roles.",
        ),
        voltageMatrix: true,
      },
      n(
        "A-swap",
        "Transfer meter reversal",
        "A given unchanged cell reads −0.85 V with normal red/black connections. Only those leads are reversed. What is the new reading?",
        0.85,
        "The opposite terminal order gives +0.85 V with the same magnitude.",
        "Keep the physical cell fixed.",
      ),
      n(
        "A-reference",
        "Infer a new target",
        "Exact constructed readings under matching reference roles/conditions are V(P,R)=−0.25 V and V(Q,R)=+0.95 V. Predict V(P,Q).",
        -1.2,
        "−0.25−(+0.95)=−1.20 V.",
        "Use the target first-minus-second order.",
      ),
      c(
        "A-reactivity",
        "Interpret a declared positive sign",
        "The supplied rule gives positive voltage when metal2 is more reactive. V(copper,iron)=+0.70 V. Which metal is more reactive in this stated pair?",
        "Iron",
        {
          Copper:
            "That would give negative voltage under this supplied convention.",
          "They have no reactivity difference":
            "The supplied comparison is non-zero.",
        },
        "Iron is metal2 and is more reactive under the declared positive-reading case.",
        "Keep the two named roles.",
      ),
      w(
        "A-explain",
        "Explain a negative reading",
        "A given cell discharges through its separate load while its voltmeter reads −0.85 V under the declared terminal order. Explain why the sign does not prove the reaction has stopped or that the cell absorbs electrical energy.",
        "The meter reports its chosen terminal potential order; −0.85 V has magnitude 0.85 V. A reversed terminal order would give +0.85 V while the same physical discharging cell/load remains. The negative measurement sign is not negative reactivity, proof of no reaction or proof of energy absorption.",
        [
          "Explain signed terminal order and unsigned magnitude.",
          "Separate the measurement convention from the given continuing chemical discharge.",
        ],
      ),
    ],
    [
      n(
        "B-reference",
        "Infer another reserved target",
        "Exact constructed readings under matching reference roles/conditions are V(P,R)=−0.65 V and V(Q,R)=+0.75 V. Predict V(P,Q).",
        -1.4,
        "−0.65−(+0.75)=−1.40 V.",
        "Subtract the full second reading.",
      ),
      n(
        "B-negative",
        "Transfer two negative givens",
        "Exact constructed common-reference readings are V(P,R)=−1.35 V and V(Q,R)=−0.45 V under matching conditions. Predict V(P,Q).",
        -0.9,
        "−1.35−(−0.45)=−0.90 V. The first level is still lower than the second.",
        "Subtract the complete signed negative.",
      ),
      n(
        "B-magnitude",
        "Keep a new magnitude unsigned",
        "A stated meter reading is −1.05 V. What is its unsigned magnitude?",
        1.05,
        "Magnitude is 1.05 V, without the reading sign.",
        "Separate size and order.",
      ),
      c(
        "B-order",
        "Transfer the opposite reference role",
        "Reference S is metal1 in each supplied comparison. Which listed labelled metal is most reactive under the declared sign rule?",
        "B",
        {
          C: "Choosing the most negative reading ignores that the reference is now metal1.",
          D: "B gives a larger positive reference-first comparison.",
        },
        "For V(S,metal), B has the largest positive reading +0.9 V and is most reactive among this stated set.",
        "Use the declared reference-first role.",
        undefined,
        data("S", "first", [
          ["A", -0.2],
          ["B", 0.9],
          ["C", -0.7],
          ["D", 0.4],
          ["E", 0],
        ]),
      ),
      w(
        "B-evidence",
        "Explain missing-data and control limits",
        "Explain why a not-measured voltage is different from 0 V, and what must be checked before combining readings from two investigations.",
        "Not measured records no observed value; 0 V is a recorded zero difference. A missing value may be inferred only as a labelled prediction from appropriate data. The reference role and comparison conditions must match; electrode/electrolyte identity, concentration and temperature can affect voltage. Real measurements also require their stated precision and uncertainty.",
        [
          "Distinguish absent, zero and inferred values.",
          "Justify matching roles/conditions and measurement limits.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "R-reference",
        "Retrieve shared-reference subtraction",
        "Under matching roles/conditions, V(A,R)=+0.35 V and V(B,R)=+1.25 V. Predict V(A,B).",
        -0.9,
        "0.35−1.25=−0.90 V.",
        "Use first-minus-second.",
      ),
      n(
        "R-reverse",
        "Retrieve lead reversal",
        "The same given cell reads +1.05 V. Only the meter leads are reversed. What is the new reading?",
        -1.05,
        "Reversed terminal order gives −1.05 V, with unchanged magnitude and physical cell.",
        "Reverse the measurement sign.",
      ),
      w(
        "R-chemistry",
        "Retrieve discharge/measurement separation",
        "Explain why reversing only meter leads does not reverse which electrode supplies electrons to the unchanged separate conducting load in the stated discharging cell.",
        "Meter-lead reversal changes only the order of the two potentials being subtracted. The physical electrodes, electrolyte and separate load remain unchanged, so the given chemical donor and discharge electron-transfer direction remain the same. The species reduced at the receiving electrode cannot be identified from voltage signs alone.",
        [
          "Explain terminal-order reversal.",
          "Keep the given physical reaction/load unchanged and avoid inventing reduction products.",
        ],
      ),
    ],
    [
      n(
        "S-negative",
        "Retrieve subtraction across negative levels",
        "Exact common-reference readings are V(A,R)=−0.85 V and V(B,R)=−1.25 V under matching conditions. Predict V(A,B).",
        0.4,
        "−0.85−(−1.25)=+0.40 V.",
        "Subtract the whole negative second value.",
      ),
      n(
        "S-magnitude",
        "Retrieve unsigned magnitude",
        "A given signed reading is −0.95 V. What is its unsigned magnitude?",
        0.95,
        "Its magnitude is 0.95 V.",
        "A size is non-negative.",
      ),
      w(
        "S-conditions",
        "Retrieve comparison conditions",
        "Explain why readings obtained using different electrolytes cannot automatically be treated as one unchanged common-reference comparison.",
        "Electrolyte identity, concentration and temperature can affect voltage, alongside electrode identity. Numerical transfer requires matching reference roles and justified comparison conditions. Retain the actual observations and their reported uncertainty rather than treating metal names as universal voltage constants.",
        [
          "Identify relevant conditions and their effect on voltage.",
          "Justify the transfer rule and retain measurement limits.",
        ],
      ),
    ],
  ],
};
const recovery: Record<string, string> = {
  "p-negative": "r-sign",
  "p-small": "r-roles",
  "p-zero": "r-zero",
  "p-positive": "r-sign",
  "p-magnitude": "r-magnitude",
  "p-lookup": "r-roles",
  "p-reverse": "r-reverse",
  "p-wide": "r-reverse",
  "p-normal": "r-roles",
  "p-identical-swap": "r-zero",
  "p-electron-source": "r-carriers",
  "p-same-plate": "r-probes",
  "p-infer-reverse": "r-subtract",
  "p-mixed": "r-subtract",
  "p-double-negative": "r-negative",
  "p-alternate": "r-reference",
  "p-new-reference": "r-reference",
  "p-equal-reference": "r-zero",
  "p-rank-letters": "r-order",
  "p-rank-negative": "r-order",
  "p-rank-shift": "r-order",
  "p-rank-opposite": "r-order",
  "p-inconsistent": "r-reference",
  "p-conditions": "r-reference",
  "p-missing": "r-missing",
  "p-negative-energy": "r-sign",
  "p-zero-origin": "r-reference",
  "p-identical-scope": "r-zero",
  "p-explain-signed": "r-subtract",
  "p-explain-leads": "r-reverse",
  "p-explain-evidence": "r-missing",
};
for (const q of voltageJourney.practice)
  q.followUp = "cv-v1-" + recovery[q.id.slice(6)];
const all: Task[] = [
  ...voltageJourney.warmup,
  ...voltageJourney.refresher,
  ...voltageJourney.guided,
  ...voltageJourney.practice,
  ...voltageJourney.checkForms.flat(),
  ...voltageJourney.reviewForms.flat(),
];
const families: Record<string, string[]> = {
  table: [
    "r-roles",
    "r-sign",
    "g-read",
    "p-negative",
    "p-small",
    "p-zero",
    "p-positive",
    "p-lookup",
    "A-table",
    "A-reactivity",
  ],
  magnitude: [
    "warm-magnitude",
    "r-magnitude",
    "p-magnitude",
    "B-magnitude",
    "S-magnitude",
  ],
  leads: [
    "r-reverse",
    "r-carriers",
    "g-leads",
    "g-evidence",
    "p-reverse",
    "p-wide",
    "p-normal",
    "p-identical-swap",
    "p-electron-source",
    "p-explain-leads",
    "A-swap",
    "A-explain",
    "R-reverse",
    "R-chemistry",
  ],
  probes: ["r-probes", "p-same-plate"],
  inference: [
    "warm-subtract",
    "r-subtract",
    "r-negative",
    "r-reference",
    "g-infer",
    "p-infer-reverse",
    "p-mixed",
    "p-double-negative",
    "p-alternate",
    "p-new-reference",
    "p-equal-reference",
    "p-explain-signed",
    "A-reference",
    "B-reference",
    "B-negative",
    "R-reference",
    "S-negative",
  ],
  rank: [
    "r-order",
    "g-rank",
    "p-rank-letters",
    "p-rank-negative",
    "p-rank-shift",
    "p-rank-opposite",
    "B-order",
  ],
  evidence: [
    "r-sign",
    "r-reference",
    "r-missing",
    "g-evidence",
    "p-inconsistent",
    "p-conditions",
    "p-missing",
    "p-negative-energy",
    "p-zero-origin",
    "p-identical-scope",
    "p-explain-evidence",
    "A-explain",
    "B-evidence",
    "S-conditions",
  ],
  zero: [
    "r-zero",
    "p-zero",
    "p-identical-swap",
    "p-equal-reference",
    "p-identical-scope",
  ],
};
for (const ids of Object.values(families)) {
  const full = ids.map((id) => "cv-v1-" + id);
  for (const q of all)
    if (full.includes(q.id))
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...full.filter((id) => id !== q.id),
        ]),
      ];
}
const exposure: Record<VoltageMode, string[]> = {
  read: [...families.table, ...families.magnitude, ...families.zero],
  lead: [...families.leads, ...families.probes, ...families.zero],
  infer: [...families.inference, ...families.magnitude, ...families.zero],
  rank: families.rank,
  evidence: [
    ...families.evidence,
    ...families.leads,
    ...families.probes,
    ...families.zero,
  ],
};
for (const q of all)
  if (q.model?.kind === "cell-voltage")
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...exposure[q.model.mode]
          .map((id) => "cv-v1-" + id)
          .filter((id) => id !== q.id),
      ]),
    ];

voltageJourney.refresher.find(
  (q) => q.id === "cv-v1-r-missing",
)!.optionAliases = { "The cell has exactly0 V": "The cell has exactly 0 V" };

voltageJourney.practice.find((q) => q.id === "cv-v1-p-missing")!.optionAliases =
  {
    "The cell was measured at exactly0 V":
      "The cell was measured at exactly 0 V",
  };

voltageJourney.practice.find(
  (q) => q.id === "cv-v1-p-zero-origin",
)!.optionAliases = {
  "It necessarily increases by2 V": "It necessarily increases by 2 V",
};

voltageJourney.practice.find(
  (q) => q.id === "cv-v1-p-identical-scope",
)!.optionAliases = {
  "The table entries marked not measured must also be0 V":
    "The table entries marked not measured must also be 0 V",
};
