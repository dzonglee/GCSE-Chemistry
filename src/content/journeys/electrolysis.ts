import { addElectrolysisWriting } from "./electrolysis-writing";
import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
const c = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...choice(
    "el-v1-" + id,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    title,
    model,
  ),
  title,
});
const n = (
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...number(
    "el-v1-" + id,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    title,
    {},
    model,
  ),
  title,
});
const w = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  points: string[],
): LearningTask => ({
  id: "el-v1-" + id,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: points[0],
  rubric: points,
  purpose: title,
});
const m = (
  mode: "movement" | "conductivity" | "products" | "mixture" | "anode",
  instruction: string,
): TaskModel => ({ kind: "electrolysis-process", mode, instruction });
export const electrolysisJourney: LessonJourney = {
  version: 1,
  introduction:
    "Move ions to correctly charged electrodes, distinguish current carriers and predict molten products before considering aluminium extraction.",
  scopeNote:
    "Foundation/shared AQA Chemistry 4.4.3.1–4.4.3.3 and Combined Trilogy 5.4.3.1–5.4.3.3; related plain Pearson Combined 3.22–3.26. A direct-current source drives decomposition of an electrolyte. Mobile ions carry charge in molten ionic compounds and aqueous ionic solutions; delocalised electrons carry charge through metal wires and graphite electrodes. Solid ionic compounds contain ions but these are fixed in the lattice. In an electrolytic cell the negative electrode is the cathode and the positive electrode is the anode; position on the page is not their defining property. Positive cations migrate to the cathode and negative anions to the anode. Schematic one-step movements teach direction, not microscopic straight paths, rates or complete circuit dynamics. Binary molten ionic salts with inert electrodes give neutral metal at the cathode and neutral non-metal at the anode; water is absent. Element names/formulas must not be confused with starting ion names. The true Zn1Cl2 before/after 3D shows separate Zn2+/Cl− ionic constituents before and Zn metal plus a Cl2 molecule afterwards, with identical atomic IDs and total represented charge 0; it is not a ZnCl2 molecule or a full molten liquid. The reference shows discharge and retained atoms, not a microscopic mechanism. Half-equation writing and electron-defined redox are Higher in AQA and visibly bold Pearson 3.27–3.29, so they are not required in reserved Foundation checks. Existing six legacy IDs remain for saved compatibility. AQA shared aluminium extraction uses aluminium oxide dissolved in molten cryolite to reduce operating temperature; electrical current and heating remain needed. Carbon cannot reduce aluminium oxide in the supplied GCSE reactivity model. Oxygen product reacts with carbon anodes, which are consumed and replaced. Supplied carbon/oxygen → CO2 mass records are simplified; real industrial anode gases need not be exclusively CO2. Aqueous product competition, practical investigation and Higher half equations need their own individual lessons. Real chemical processes require qualified supervision; no instructions for unsupervised electrolysis. Six written explanations remain self-reviewed rather than automatic examiner marks or readiness evidence.",
  outcomes: [
    "Distinguish mobile ionic conduction from metallic electron conduction.",
    "Move each ion toward the correctly charged electrode in either layout.",
    "Predict both neutral products of binary molten ionic compounds.",
    "Explain cryolite and the continuing energy requirement.",
    "Explain why carbon anodes are consumed and replaced.",
  ],
  warmup: [
    n(
      "w-charge",
      "Recall an ionic formula",
      "One Zn2+ balances with Cl− ions in ZnCl2. How many chloride ions balance one zinc ion?",
      2,
      "ions",
      "Two −1 charges balance one +2 charge.",
      "Balance the total charge.",
    ),
    c(
      "w-attract",
      "Recall opposite charges",
      "Which electrode charge attracts a positive ion?",
      "Negative",
      {
        Positive: "Like charges repel in this electrode model.",
        "Neither: ions are neutral": "The ion carries a positive charge.",
      },
      "Opposite charges attract.",
      "Use the ion's charge.",
    ),
  ],
  refresher: [
    c(
      "r-mobile",
      "Find the current carrier",
      "Why can molten NaCl conduct while solid NaCl cannot conduct through mobile ions?",
      "The molten ions are free to move",
      {
        "The solid has no ions": "The solid has ions fixed in its lattice.",
        "Molten salt becomes a metal with free electrons":
          "It remains an ionic electrolyte; mobile ions carry charge.",
      },
      "Melting frees the ions to move; it does not remove their charges.",
      "Compare mobility, not existence.",
      m(
        "conductivity",
        "Predict conduction type and carrier for each supplied phase/material.",
      ),
    ),
    c(
      "r-direction",
      "Use polarity, not page position",
      "Where does a positive cation move during electrolysis?",
      "To the negative cathode",
      {
        "To the positive anode": "That attracts negative anions.",
        "Always to the electrode drawn left":
          "Polarity, not page side, determines the destination.",
      },
      "Cations migrate to the negative cathode; a reversed drawing changes its side.",
      "Use opposite charge.",
      m(
        "movement",
        "Move one schematic ion a step at a time; changed layouts test polarity.",
      ),
    ),
    c(
      "r-products",
      "Name neutral elements",
      "What does molten ZnCl2 produce with inert electrodes?",
      "Zinc at cathode; chlorine at anode",
      {
        "Chlorine at cathode; zinc at anode": "Products are reversed.",
        "Zinc ions at cathode; chloride ions as final gas":
          "Final products are neutral elements, not starting ions.",
      },
      "Zinc forms at the cathode; neutral chlorine forms at the anode.",
      "Name both products.",
      m(
        "products",
        "Predict both products independently; do not apply an aqueous hydrogen rule to a melt.",
      ),
    ),
    c(
      "r-mixture",
      "Explain the mixture",
      "Why dissolve aluminium oxide in molten cryolite in the supplied process?",
      "To allow a lower operating temperature",
      {
        "To remove the need for electric current":
          "Electrolysis still needs electrical energy.",
        "To make aluminium less reactive than carbon":
          "Cryolite does not change aluminium's reactivity-series position.",
      },
      "The mixture reduces operating temperature; heating and current remain needed.",
      "Separate temperature benefit from current.",
      m("mixture", "Choose the reason and continuing energy requirement."),
    ),
    c(
      "r-anode",
      "Explain replacement",
      "Why replace carbon anodes in the simplified aluminium cell?",
      "Oxygen reacts with and consumes carbon",
      {
        "All inert electrodes are always consumed":
          "A genuinely inert electrode does not react in that supplied record.",
        "Aluminium deposits on the positive anode":
          "Aluminium forms at the negative cathode.",
      },
      "Oxygen at the positive electrode reacts with carbon, requiring replacement.",
      "Track carbon atoms.",
      m(
        "anode",
        "Compare a carbon/oxygen record with genuinely inert electrodes.",
      ),
    ),
    n(
      "r-pairs",
      "Retain chlorine atoms",
      "A supplied chlorine product has 8 chlorine atoms, all paired into Cl2. How many molecules are present?",
      4,
      "molecules",
      "8÷2=4 Cl2 molecules.",
      "Use two atoms per molecule.",
    ),
  ],
  guided: [
    c(
      "g-move",
      "Move to the electrode",
      "Move the supplied Zn2+ ion to its electrode, then name that electrode.",
      "Negative cathode",
      {
        "Positive anode": "Positive zinc ions move to the negative electrode.",
        "Either electrode regardless of polarity":
          "Charge and polarity determine the destination.",
      },
      "Zn2+ moves toward the negative cathode in either layout.",
      "Use opposite charge.",
      m(
        "movement",
        "One schematic coordinate step per action; no straight microscopic path or rate is claimed.",
      ),
    ),
    c(
      "g-phase",
      "Distinguish charge carriers",
      "For the initial solid NaCl record, predict conduction and carrier. Why is ionic conduction unavailable?",
      "The ions are fixed in the solid lattice",
      {
        "The solid contains no charged particles":
          "Its ions remain charged but fixed.",
        "Electrons flow freely through every ionic solid":
          "That is not the carrier in this salt.",
      },
      "Its ions cannot migrate as they can in the melt.",
      "Use carrier and mobility.",
      m(
        "conductivity",
        "Explore molten salt, dissolved salt and metal wire separately.",
      ),
    ),
    c(
      "g-products",
      "Predict both products",
      "Predict both neutral element products of molten ZnCl2 with inert electrodes.",
      "Cathode zinc; anode chlorine",
      {
        "Cathode chlorine; anode zinc": "Products are reversed.",
        "Cathode hydrogen; anode chlorine":
          "The supplied melt has no water-derived hydrogen.",
      },
      "The salt gives zinc metal and chlorine.",
      "The word molten matters.",
      m(
        "products",
        "Actual 3D preserves one Zn and two Cl atomic identities; a Cl2 bond appears only in the product.",
      ),
    ),
    c(
      "g-mixture",
      "Keep the energy requirement",
      "Choose the benefit and remaining energy need for the initial aluminium oxide/cryolite record.",
      "Lower temperature; heating and current still needed",
      {
        "Lower temperature; no current needed": "It is still electrolysis.",
        "Aluminium becomes less reactive; carbon now extracts it":
          "Cryolite does not change the reactivity relationship.",
      },
      "Lower operating temperature does not eliminate electrical driving energy.",
      "Separate heat and current.",
      m(
        "mixture",
        "Compare suitability and aqueous competition as supplied boundary cases.",
      ),
    ),
    c(
      "g-anode",
      "Track the consumed electrode",
      "Predict the change and replacement for the simplified carbon/oxygen anode record.",
      "Carbon is consumed; replace the anode",
      {
        "Only the cathode is consumed; replace that":
          "Oxygen reacts with carbon at the positive anode.",
        "Carbon is a catalyst and never consumed":
          "Carbon enters the supplied carbon dioxide product.",
      },
      "Carbon reacts with oxygen to form CO2 in the supplied simplified record.",
      "Track where carbon goes.",
      m(
        "anode",
        "Real industrial gases need not be exclusively CO2; this is a supplied simplified case.",
      ),
    ),
  ],
  practice: [
    c(
      "p-electrolyte",
      "Name an electrolyte",
      "Which supplied material is an ionic electrolyte?",
      "Molten sodium chloride",
      {
        "Solid sodium chloride with fixed ions":
          "Its ions are not mobile in this state.",
        "A copper connecting wire":
          "Copper conducts through delocalised electrons.",
      },
      "An electrolyte has mobile ions in a melt or ionic solution.",
      "Use phase and carrier.",
    ),
    c(
      "p-source",
      "Drive decomposition",
      "What drives the supplied electrolytic decomposition?",
      "An external direct-current electrical supply",
      {
        "Cooling a solid without an electrical supply":
          "Cooling does not supply the driving electrical energy.",
        "The salt decomposes just because electrodes are drawn":
          "The electrical source is essential.",
      },
      "Electrical energy drives electrolysis.",
      "Use the stated source.",
    ),
    c(
      "p-solid",
      "Compare phases",
      "Why does solid NaCl lack ionic conduction through migration?",
      "The ions are fixed in the lattice",
      {
        "Its ions are electrically neutral": "They remain charged.",
        "Only negative ions are present":
          "Both cations and anions are present.",
      },
      "Its charge carriers cannot migrate through the lattice.",
      "Fixed does not mean absent.",
    ),
    c(
      "p-wire",
      "Distinguish the wire",
      "What carries charge through metal connecting wires?",
      "Delocalised electrons",
      {
        "Chloride ions migrating through copper":
          "Ions carry charge in the electrolyte, not through the metal wire.",
        "Zinc ions moving through the wire as molten salt":
          "The wire is a metal conductor.",
      },
      "The circuit has different carriers in electrolyte and wires.",
      "Use the material.",
    ),
    w(
      "p-carrier-write",
      "Explain both conductors",
      "Compare carriers in molten NaCl and copper wire, and explain why solid NaCl differs.",
      "Mobile Na+ and Cl− ions carry charge in the molten salt. Delocalised electrons carry charge through copper. Solid NaCl contains charged ions fixed in its lattice, so they cannot migrate.",
      [
        "Name mobile ions in the melt.",
        "Name electrons in wire.",
        "Explain fixed, rather than absent, ions in solid.",
      ],
    ),
    c(
      "p-cation",
      "Identify cation destination",
      "Where does Ca2+ move in electrolysis?",
      "Negative cathode",
      {
        "Positive anode": "That attracts negative ions.",
        "The electrode always drawn left": "Polarity defines the destination.",
      },
      "Cations migrate to the negative cathode.",
      "Opposite charges attract.",
    ),
    c(
      "p-anion",
      "Identify anion destination",
      "Where does Br− move in electrolysis?",
      "Positive anode",
      {
        "Negative cathode": "That attracts positive ions.",
        "Both equally because Br− is a gas":
          "Br− is an ion; bromine is a different final product.",
      },
      "Anions migrate to the positive anode.",
      "Use the ion charge.",
    ),
    c(
      "p-reversed",
      "Reverse the drawing",
      "Positive electrode is left; negative electrode is right. Where does Mg2+ move?",
      "Right, to the negative cathode",
      {
        "Left, because cathodes must be left":
          "Cathode is defined by negative polarity in electrolysis.",
        "Left, to the positive anode":
          "A cation moves toward the opposite charge.",
      },
      "Polarity determines destination.",
      "Read labels before choosing side.",
    ),
    w(
      "p-move-write",
      "Explain movement and discharge",
      "Explain both ion destinations. Does movement toward an electrode itself change the atomic element identity?",
      "Cations move to the negative cathode and anions to the positive anode because opposite charges attract. Movement does not change their atomic element identity. Discharge at electrodes gives neutral products in the supplied molten binary cases.",
      [
        "Give both destinations and charges.",
        "Explain opposite-charge attraction.",
        "Distinguish movement from discharge and element identity.",
      ],
    ),
    c(
      "p-lead",
      "Transfer to lead bromide",
      "What are the final products of molten PbBr2 with inert electrodes?",
      "Cathode lead; anode bromine",
      {
        "Cathode bromine; anode lead": "Products are reversed.",
        "Cathode hydrogen; anode bromide ions":
          "No water is supplied; the final non-metal is neutral bromine.",
      },
      "Metal forms at cathode; non-metal at anode.",
      "Use molten binary ions.",
    ),
    c(
      "p-sodium",
      "Keep molten distinct",
      "What is the cathode product of molten NaCl with inert electrodes?",
      "Sodium",
      {
        Hydrogen: "No water is supplied; do not import the aqueous rule.",
        Chlorine: "Chlorine forms at the anode.",
      },
      "Molten NaCl gives sodium at the cathode.",
      "Read the phase.",
    ),
    c(
      "p-chlorine",
      "Name the product",
      "What is the final anode product of molten CaCl2 with inert electrodes?",
      "Chlorine, Cl2",
      {
        "Chloride ions, Cl−":
          "That is the starting anion, not neutral final gas.",
        "Calcium ions, Ca2+": "Calcium cations migrate to the cathode.",
      },
      "Chlorine is the neutral element, with diatomic molecules.",
      "Distinguish ion from element.",
    ),
    n(
      "p-pairs",
      "Retain paired atoms",
      "A supplied chlorine product contains 14 chlorine atoms, all in Cl2. How many molecules are present?",
      7,
      "molecules",
      "14÷2=7; atoms are retained.",
      "Two atoms per molecule.",
    ),
    w(
      "p-products-write",
      "Explain both molten products",
      "Explain why molten ZnCl2 gives zinc and chlorine rather than hydrogen and chloride ions as final products. Name the electrodes.",
      "The melt supplies Zn2+ and Cl− with no water-derived hydrogen. Zinc forms at the negative cathode and neutral chlorine at the positive anode. Chloride is the starting ion; chlorine is the final element with Cl2 molecules.",
      [
        "Use molten/no water.",
        "Name both products and electrode charges.",
        "Distinguish chloride ion from chlorine element.",
      ],
    ),
    c(
      "p-reactivity",
      "Choose extraction",
      "Aluminium is above carbon in the supplied reactivity series. Why choose electrolysis?",
      "Carbon cannot reduce aluminium oxide in this supplied model",
      {
        "Carbon is above aluminium so extracts it easily":
          "That reverses the supplied order.",
        "Aluminium occurs only as uncombined metal":
          "The given starting material is aluminium oxide.",
      },
      "Ordinary carbon reduction is unsuitable in the supplied GCSE model.",
      "Use the reactivity order.",
    ),
    c(
      "p-cryolite",
      "Explain cryolite",
      "What is the effect of dissolving oxide in molten cryolite?",
      "Lower required operating temperature",
      {
        "Eliminate all electrical energy use":
          "Current still drives electrolysis.",
        "Remove all ions": "Mobile ions are needed.",
      },
      "The mixture can operate below the temperature needed for pure oxide.",
      "Keep ions and current.",
    ),
    c(
      "p-energy",
      "Keep both energy uses",
      "Which requirements remain in the mixed aluminium electrolyte process?",
      "Heating the electrolyte and supplying electric current",
      {
        "Heating only, without current":
          "Electrical energy still drives decomposition.",
        "Neither, because cryolite is a power supply":
          "Cryolite is part of the electrolyte, not a generator.",
      },
      "Lower temperature does not eliminate heating or current.",
      "Separate the two purposes.",
    ),
    c(
      "p-carbon",
      "Explain carbon loss",
      "The supplied simplified anode record forms CO2. Why replace carbon?",
      "Its carbon is consumed in the product",
      {
        "Carbon remains unchanged as a catalyst": "Carbon atoms enter CO2.",
        "Aluminium forms there and uses up carbon":
          "Aluminium forms at the negative cathode.",
      },
      "Oxygen reacts with carbon at the positive anode.",
      "Track the atoms.",
    ),
    n(
      "p-mass",
      "Retain product mass",
      "A supplied CO2-forming record combines 3 g anode carbon with 8 g oxygen. With no other reactants/products, what CO2 mass forms?",
      11,
      "g",
      "3+8=11 g. Anode carbon loss is 3 g, not 11 g.",
      "Include both reactants.",
    ),
    w(
      "p-extraction-write",
      "Connect industrial decisions",
      "Explain why the supplied aluminium process uses electrolysis, a cryolite mixture and replaceable carbon anodes.",
      "Aluminium is above carbon, so ordinary carbon reduction cannot extract it from its oxide in the supplied GCSE model. Molten cryolite allows a lower operating temperature while current remains needed. Oxygen product reacts with carbon anodes, consuming carbon, so they need replacement.",
      [
        "Explain reactivity and carbon reduction.",
        "Explain lower temperature and continuing current.",
        "Explain oxygen reaction and carbon consumption.",
      ],
    ),
  ],
  checkForms: [
    [
      c(
        "a-products",
        "Predict changed molten products",
        "With inert electrodes, what final products does molten CaBr2 give?",
        "Cathode calcium; anode bromine",
        {
          "Cathode bromine; anode calcium": "Products are reversed.",
          "Cathode hydrogen; anode bromide ions":
            "No water is supplied, and final bromine is neutral.",
        },
        "Calcium forms at negative cathode; bromine at positive anode.",
        "Use molten binary ions.",
      ),
      c(
        "a-layout",
        "Use a changed layout",
        "Positive electrode is right; negative electrode is left. Where does I− move?",
        "Right, to the positive anode",
        {
          "Left, to the negative cathode":
            "Negative ions move to positive polarity.",
          "Right, because every ion always moves right":
            "Positive ions would move to the other electrode.",
        },
        "Ion charge determines destination.",
        "Read the polarity.",
      ),
      n(
        "a-pairs",
        "Account for changed atoms",
        "A supplied bromine product contains 18 atoms, all in Br2. How many molecules are present?",
        9,
        "molecules",
        "18÷2=9.",
        "Two atoms per molecule.",
      ),
      c(
        "a-anode",
        "Explain a changed electrode",
        "A carbon anode loses carbon as oxygen forms CO2 with it. Which conclusion follows?",
        "Carbon is consumed and needs replacement",
        {
          "Carbon is inert and unchanged":
            "Carbon enters the supplied product.",
          "The cathode creates new carbon atoms":
            "That does not explain the stated loss.",
        },
        "Carbon is a reactant in the given anode reaction.",
        "Track material.",
      ),
      w(
        "a-write",
        "Explain phases and carriers",
        "Explain ionic conduction in molten versus solid MgCl2 and distinguish the metal wire's carrier.",
        "Molten MgCl2 has mobile magnesium and chloride ions. Solid MgCl2 contains ions fixed in its lattice. Metal wire conducts through delocalised electrons, not migrating electrolyte ions.",
        [
          "Name mobile ions.",
          "Explain fixed ions in solid.",
          "Distinguish electrons in metal.",
        ],
      ),
    ],
    [
      c(
        "b-products",
        "Predict another changed melt",
        "With inert electrodes, what final products does molten KI give?",
        "Cathode potassium; anode iodine",
        {
          "Cathode iodine; anode potassium": "Products are reversed.",
          "Cathode hydrogen; anode iodide ions":
            "No water is supplied; neutral iodine is the final non-metal.",
        },
        "Potassium forms at cathode; iodine at anode.",
        "Use the phase and ions.",
      ),
      c(
        "b-layout",
        "Reverse the layout again",
        "Negative electrode is right; positive electrode is left. Where does Na+ move?",
        "Right, to the negative cathode",
        {
          "Left, because cathodes are always left":
            "Cathode is defined by polarity.",
          "Left, to the positive anode": "Cations move to opposite polarity.",
        },
        "Na+ moves to the negative cathode.",
        "Use charge, not side convention.",
      ),
      n(
        "b-mass",
        "Conserve changed mass",
        "A supplied simplified CO2 anode record consumes 6 g carbon and 16 g oxygen, with no other reactants/products. What CO2 mass forms?",
        22,
        "g",
        "6+16=22 g; anode carbon loss is 6 g.",
        "Include both reactants.",
      ),
      c(
        "b-mixture",
        "Explain continuing current",
        "Cryolite lowers operating temperature. Which statement remains correct?",
        "Heating and electrical current are still needed",
        {
          "Heating only: carbon now reduces the oxide":
            "The process is still electrolysis.",
          "No energy: cryolite is the power supply":
            "Cryolite is part of the molten electrolyte.",
        },
        "Lower temperature does not eliminate the electrical drive.",
        "Separate heat and current.",
      ),
      w(
        "b-write",
        "Explain product identity",
        "Explain both molten NaBr products, starting bromide versus final bromine, and why hydrogen is not the supplied cathode product.",
        "Sodium forms at the negative cathode and neutral bromine at the positive anode. Bromide is the starting negative ion; bromine is the final element with Br2 molecules. The supplied melt has no water-derived hydrogen.",
        [
          "Name both products and charges.",
          "Distinguish bromide from bromine.",
          "Use molten/no water.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      c(
        "ra-phase",
        "Retrieve mobile carriers",
        "What carries charge through a molten ionic electrolyte?",
        "Mobile ions",
        {
          "Only free electrons within the salt":
            "That is not its supplied carrier.",
          "Only neutral molecules": "The compound is ionic.",
        },
        "Ions are mobile in the melt.",
        "Recall material.",
      ),
      n(
        "ra-pairs",
        "Retrieve a changed count",
        "A supplied iodine product has 10 atoms, all paired into I2. How many molecules are there?",
        5,
        "molecules",
        "10÷2=5.",
        "Two atoms per molecule.",
      ),
      c(
        "ra-anode",
        "Retrieve replacement",
        "Why replace carbon anodes in the supplied oxygen/CO2 aluminium model?",
        "Oxygen consumes the carbon",
        {
          "They are necessarily inert": "They react in this record.",
          "Aluminium forms at the anode": "Aluminium forms at cathode.",
        },
        "Carbon enters the product.",
        "Track its atoms.",
      ),
    ],
    [
      c(
        "rb-side",
        "Retrieve polarity",
        "If a negative electrode is moved to the right of a drawing, what is its name in electrolysis?",
        "Cathode",
        {
          "Anode because it is on the right":
            "Position does not define its name.",
          "Positive electrode because it moves":
            "Its supplied polarity is unchanged.",
        },
        "Electrolytic cathode is negative.",
        "Use polarity.",
      ),
      n(
        "rb-mass",
        "Retrieve mass conservation",
        "A supplied simplified anode record combines 1.5 g carbon with 4 g oxygen to form only CO2. What mass forms?",
        5.5,
        "g",
        "1.5+4=5.5 g.",
        "Include both masses.",
      ),
      c(
        "rb-cryolite",
        "Retrieve energy distinction",
        "Why use the molten cryolite mixture?",
        "Lower temperature while current remains needed",
        {
          "Eliminate current entirely":
            "Electrical driving energy remains needed.",
          "Make carbon reduction extract aluminium":
            "It does not reverse the supplied reactivity relation.",
        },
        "The mixture lowers temperature, not the need for a supply.",
        "Separate the purposes.",
      ),
    ],
  ],
};
electrolysisJourney.guided[0].openingHint = true;
const recovery: Record<string, string> = {
  "p-electrolyte": "r-mobile",
  "p-source": "r-mobile",
  "p-solid": "r-mobile",
  "p-wire": "r-mobile",
  "p-carrier-write": "r-mobile",
  "p-cation": "r-direction",
  "p-anion": "r-direction",
  "p-reversed": "r-direction",
  "p-move-write": "r-direction",
  "p-lead": "r-products",
  "p-sodium": "r-products",
  "p-chlorine": "r-products",
  "p-pairs": "r-pairs",
  "p-products-write": "r-products",
  "p-reactivity": "r-mixture",
  "p-cryolite": "r-mixture",
  "p-energy": "r-mixture",
  "p-carbon": "r-anode",
  "p-mass": "r-anode",
  "p-extraction-write": "r-mixture",
};
for (const task of electrolysisJourney.practice)
  task.followUp = "el-v1-" + recovery[task.id.replace("el-v1-", "")];

addElectrolysisWriting(electrolysisJourney);
