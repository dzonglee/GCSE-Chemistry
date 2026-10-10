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
    `or-v1-${id}`,
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
    `or-v1-${id}`,
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
  id: `or-v1-${id}`,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: points[0],
  rubric: points,
  purpose: title,
});
const m = (
  mode: "oxidation" | "transfer" | "agent" | "mass" | "evidence",
  instruction: string,
): TaskModel => ({ kind: "oxygen-redox", mode, instruction });
export const oxygenRedoxJourney: LessonJourney = {
  version: 1,
  introduction: "Track oxygen to explain the changes in each named substance.",
  scopeNote:
    "Foundation/shared AQA 4.4.1.1 and oxygen interpretation from 4.4.1.3; related Pearson 4.5. Oxidation involves oxygen gain in the supplied cases; metal-oxide reduction to metal involves oxygen loss. Identify the named substance, not simply whether an entire equation contains oxygen. Oxygen atoms are conserved and transferred to another product. Both linked changes occur in supplied oxide/reducing-agent reactions. Carbon may form CO or CO2 depending on the stated equation; do not impose one product universally. The reducing agent removes oxygen from the oxide and is itself oxidised in these examples. AQA recall is limited to carbon reduction; CO/aluminium comparisons here have their equations supplied for interpretation and are not a claim of required industrial-process detail. Full extraction routes and Higher electron definitions/half-equations require their separate lessons. The actual 3D model shows 2CuO + C → 2Cu + CO2 with the same inventory: Cu2 C1 O2 constituents. CuO is a representative ionic-solid crop, not CuO molecules; carbon and copper surfaces are cropped. CO2 is an actual linear molecule. Water, full lattices, electron motion and microscopic mechanism are omitted. Sample mass may increase when external oxygen enters or decrease when oxygen goes to a product outside the tracked sample; the complete sealed system retains its total mass. Net oxygen mass crossing a boundary is different from oxygen transferred internally. Acid plus copper oxide forms a copper salt and water, not copper metal; Cu remains a 2+ ion, so this is not the oxide-to-metal reduction taught here. Colour change alone does not identify products. Absence of oxygen gain/loss does not prove absence of general redox: that needs the separate broader electron lesson. Written explanations are self-reviewed, never automatically correct or official examiner marks. Practical records are interpreted; no unsupervised heating or reaction instructions.",
  outcomes: [
    "Explain metal oxidation through oxygen gain.",
    "Identify both changes in supplied oxygen-transfer reactions.",
    "Identify the reducing agent and justify its role.",
    "Distinguish sample and sealed-system mass changes.",
    "Use product evidence and recognise limits of an oxygen-only model.",
  ],
  warmup: [
    n(
      "w-oxygen",
      "Count a formula",
      "How many oxygen atoms are represented by 2CuO?",
      2,
      "atoms",
      "Two whole CuO formula units contain two O atoms; this count does not imply separate CuO molecules.",
      "Apply the coefficient to the whole formula.",
    ),
    c(
      "w-metal",
      "Retain element identity",
      "CuO is converted to Cu metal. Does copper become a different element?",
      "No: copper remains copper",
      {
        "Yes: it becomes oxygen": "Proton identity does not change.",
        "Yes: it becomes carbon": "No transmutation occurs.",
      },
      "The chemical state changes; copper retains its element identity.",
      "Separate element identity from its compound.",
    ),
  ],
  refresher: [
    c(
      "r-gain",
      "Recall oxygen gain",
      "A metal reacts with oxygen to form its oxide. What happens to the metal?",
      "It is oxidised",
      {
        "It is reduced":
          "Reduction of its oxide to metal involves oxygen loss.",
        "It only changes physical state": "A new oxide substance forms.",
      },
      "The metal gains oxygen: oxidation.",
      "Identify the named substance and its oxygen change.",
    ),
    c(
      "r-loss",
      "Recall oxide reduction",
      "A metal oxide loses oxygen and forms the metal. What happens to the oxide?",
      "It is reduced",
      {
        "It is oxidised": "The oxide loses rather than gains oxygen.",
        "Its oxygen is destroyed": "Oxygen remains in another product.",
      },
      "Loss of oxygen when the oxide becomes metal is reduction.",
      "Track oxygen to the other product.",
    ),
    c(
      "r-agent",
      "Identify the oxygen receiver",
      "Given CuO + C → Cu + CO, which substance receives oxygen?",
      "C",
      {
        Cu: "Copper is the metal product after oxygen loss.",
        CuO: "The oxide supplies the oxygen.",
      },
      "Carbon gains oxygen to form CO and acts as the reducing agent.",
      "Follow oxygen from CuO to CO.",
    ),
    n(
      "r-mass",
      "Find the oxygen addition",
      "A metal sample increases from 0.60 g to 1.00 g oxide, with no solid lost. What oxygen mass was added?",
      0.4,
      "g",
      "1.00−0.60=0.40 g oxygen from outside the sample.",
      "Subtract the initial metal mass.",
    ),
  ],
  guided: [
    n(
      "g-oxidation",
      "Track the oxygen",
      "2Mg + O2 → 2MgO. How many oxygen atoms does the Mg inventory gain?",
      2,
      "atoms",
      "The two Mg atoms combine with two oxygen atoms. Metal oxygen gain is oxidation.",
      "Count atoms, not oxygen molecules.",
      m(
        "oxidation",
        "Change the oxygen-atom count, then classify the metal change. The count refers to the whole coefficient-weighted metal inventory.",
      ),
    ),
    c(
      "g-transfer",
      "Identify both changes",
      "Initial equation: 2CuO + C → 2Cu + CO2. Which pair correctly names the substances changed?",
      "CuO reduced; C oxidised",
      {
        "CuO oxidised; C reduced": "That reverses oxygen loss and gain.",
        "Cu reduced; CO2 oxidised":
          "Those are products; track the original named reactants.",
      },
      "CuO loses oxygen to form Cu; C gains it to form CO2. Both processes occur in the same reaction.",
      "Follow the same oxygen atoms.",
      m(
        "transfer",
        "Predict the oxygen transfer and named substances; actual 3D retains the same five atomic constituents before and after.",
      ),
    ),
    c(
      "g-agent",
      "Identify the reducing agent",
      "Initial equation: 2CuO + C → 2Cu + CO2. Which substance is the reducing agent?",
      "C",
      {
        CuO: "CuO is reduced rather than the reducing agent.",
        Cu: "Cu is the resulting metal product.",
      },
      "C removes oxygen from CuO and gains oxygen itself, becoming CO2.",
      "The agent causes reduction of another substance.",
      m(
        "agent",
        "Keep the reducing agent distinct from the substance reduced; supplied records change the oxygen receiver.",
      ),
    ),
    n(
      "g-mass",
      "Choose the sample boundary",
      "No solid is lost: 0.48 g Mg becomes 0.80 g MgO. What oxygen mass enters the tracked sample?",
      0.32,
      "g",
      "0.80−0.48=0.32 g oxygen enters from the surroundings.",
      "The metal sample is not a complete sealed system.",
      m(
        "mass",
        "Predict the magnitude of net oxygen mass crossing the stated boundary and its direction. Internal transfer in a sealed apparatus has zero net crossing, not zero reaction.",
      ),
    ),
    c(
      "g-evidence",
      "Use identified products",
      "Initial record: CuO and carbon produce identified Cu metal and a carbon oxide. What does this support?",
      "CuO reduction with oxygen transferred to carbon",
      {
        "Colour alone proves every possible product":
          "Products are identified in this record; colour alone would be insufficient.",
        "Copper atoms are destroyed":
          "Copper is conserved in the metal product.",
      },
      "The oxide becomes metal and carbon receives the oxygen.",
      "Use substance identification, not appearance alone.",
      m(
        "evidence",
        "Compare adequate product evidence, colour-only observations, oxide neutralisation and limits of oxygen-only descriptions.",
      ),
    ),
  ],
  practice: [
    c(
      "p-magnesium",
      "Explain metal oxidation",
      "Why is 2Mg + O2 → 2MgO oxidation of magnesium?",
      "Magnesium gains oxygen",
      {
        "Magnesium loses oxygen": "Mg starts as the oxygen-free metal.",
        "Magnesium becomes a different element": "Mg remains Mg.",
      },
      "The metal combines with oxygen to make its oxide.",
      "Describe the named metal.",
    ),
    n(
      "p-aluminium",
      "Count the whole inventory",
      "In 4Al + 3O2 → 2Al2O3, how many oxygen atoms combine with the four Al atoms?",
      6,
      "atoms",
      "3O2 contains six oxygen atoms; 2Al2O3 also contains six.",
      "Multiply coefficient by subscript.",
    ),
    c(
      "p-reduction",
      "Name oxide reduction",
      "In CuO + C → Cu + CO, which substance is reduced?",
      "CuO",
      {
        C: "Carbon gains oxygen and is oxidised.",
        CO: "CO is the carbon oxide product.",
      },
      "CuO loses oxygen as it forms Cu metal.",
      "Name the starting substance that loses oxygen.",
    ),
    c(
      "p-carbon",
      "Name carbon oxidation",
      "In 2CuO + C → 2Cu + CO2, which original substance is oxidised?",
      "C",
      { CuO: "CuO loses oxygen.", Cu: "Cu is the metal product." },
      "Carbon gains two oxygen atoms to form CO2.",
      "Follow the oxygen receiver.",
    ),
    n(
      "p-nickel-count",
      "Use the stated carbon oxide",
      "In NiO + C → Ni + CO, how many oxygen atoms move from one NiO formula unit into CO?",
      1,
      "atom",
      "The stated CO product contains one oxygen atom. Do not substitute CO2 into the given balanced equation.",
      "Read the supplied equation.",
    ),
    c(
      "p-carbon-product",
      "Avoid a universal carbon product",
      "Two given equations form CO and CO2 respectively. Which rule should you use?",
      "Use the carbon oxide stated in each balanced equation",
      {
        "Carbon reduction always forms CO2":
          "The supplied NiO + C equation forms CO.",
        "Carbon reduction always forms CO":
          "The supplied 2CuO + C equation forms CO2.",
      },
      "Products depend on the supplied reaction and conditions; oxygen counts must match the actual equation.",
      "Keep substance formulas fixed.",
    ),
    c(
      "p-monoxide",
      "Track extra oxygen",
      "Given Fe2O3 + 3CO → 2Fe + 3CO2, which substance gains oxygen?",
      "CO",
      {
        Fe2O3: "The iron oxide loses its oxygen.",
        Fe: "Iron is the metal product.",
      },
      "Each CO gains one additional O to become CO2; CO is oxidised.",
      "Compare CO with CO2.",
    ),
    n(
      "p-extra-oxygen",
      "Count transferred oxygen",
      "In Fe2O3 + 3CO → 2Fe + 3CO2, how many oxygen atoms transfer from Fe2O3 into the carbon oxide inventory?",
      3,
      "atoms",
      "Three oxygen atoms from Fe2O3 join the three already in CO, giving six in 3CO2.",
      "Distinguish additional oxygen from final total oxygen.",
    ),
    c(
      "p-aluminium-agent",
      "Interpret a supplied metal reductant",
      "Given Fe2O3 + 2Al → 2Fe + Al2O3, which is the reducing agent?",
      "Al",
      {
        Fe2O3: "The iron oxide is reduced.",
        Fe: "Iron is the resulting product.",
      },
      "Al removes oxygen from Fe2O3 and is oxidised to Al2O3.",
      "The agent receives oxygen in this supplied oxide reaction.",
    ),
    c(
      "p-agent-role",
      "Do not swap roles",
      "In a supplied oxide/carbon reaction, why can carbon be the reducing agent while it is oxidised?",
      "It causes the oxide to lose oxygen while gaining that oxygen itself",
      {
        "Reducing agent means it must itself be reduced":
          "The agent causes reduction of the other substance.",
        "Both substances lose the same oxygen atoms":
          "Oxygen is conserved and transferred.",
      },
      "Agent and substance reduced are different roles.",
      "Ask whose change the agent causes.",
    ),
    n(
      "p-open-gain",
      "Use an open-sample increase",
      "A metal sample becomes oxide: 1.20 g → 2.00 g, no solid lost. Calculate oxygen mass entering.",
      0.8,
      "g",
      "2.00−1.20=0.80 g oxygen.",
      "Subtract the sample masses.",
    ),
    n(
      "p-open-loss",
      "Use the correct tracked material",
      "Only the oxide/metal portion is tracked: 4.00 g oxide becomes 3.20 g metal. Oxygen goes into a separate product. Calculate oxygen mass leaving that portion.",
      0.8,
      "g",
      "4.00−3.20=0.80 g oxygen transfers to another product; it is not destroyed.",
      "The boundary excludes that other product.",
    ),
    c(
      "p-closed",
      "Keep total system mass",
      "A complete sealed apparatus retains all reactants/products during oxide reduction. What happens to total mass?",
      "It remains unchanged",
      {
        "It falls whenever the oxide loses oxygen":
          "Oxygen stays elsewhere inside the apparatus.",
        "It rises because a metal is made": "No atoms are created.",
      },
      "Internal oxygen transfer changes substances, not the total mass of a closed system.",
      "Use the complete stated boundary.",
    ),
    n(
      "p-apparatus",
      "Retain the apparatus contribution",
      "A sealed complete apparatus has mass 42.50 g before a chemical reaction and retains all products. What is its final total mass?",
      42.5,
      "g",
      "All material is retained, so 42.50 g remains the total.",
      "No external mass crosses this boundary.",
    ),
    c(
      "p-colour",
      "Use evidence carefully",
      "A black powder becomes reddish on heating. No chemical identity tests or composition data are supplied. Is oxide reduction established?",
      "No: colour alone does not identify the substances",
      {
        "Yes: every black powder is CuO": "Many substances can be black.",
        "Yes: all colour changes mean reduction":
          "Appearance is not a complete chemical identification.",
      },
      "Product identity and appropriate supplied evidence are needed.",
      "Separate observation from its interpretation.",
    ),
    c(
      "p-acid",
      "Distinguish neutralisation",
      "Given CuO + 2HCl → CuCl2 + H2O and Cu2+ in both copper compounds, has the oxide been reduced to copper metal?",
      "No: the copper product is a salt, not Cu metal",
      {
        "Yes: any oxygen movement means oxide-to-metal reduction":
          "Cu stays a positive ion in its salt.",
        "Yes: CuCl2 is copper metal": "CuCl2 is a compound.",
      },
      "This is oxide/acid neutralisation, not the oxide-to-metal reduction being studied.",
      "Identify the copper-containing product.",
    ),
    w(
      "p-paired",
      "Explain both changes",
      "Explain 2CuO + C → 2Cu + CO2 by naming the substance reduced and the substance oxidised. State where the oxygen goes.",
      "CuO is reduced because it loses oxygen to form Cu metal. Carbon is oxidised because it gains that oxygen to form CO2. The oxygen atoms are transferred and conserved.",
      [
        "Name CuO and oxygen loss.",
        "Name C and oxygen gain.",
        "Conserve oxygen in CO2.",
      ],
    ),
    w(
      "p-mass-explain",
      "Explain a mass decrease",
      "Only oxide/metal is weighed: 1.60 g CuO becomes 1.28 g Cu. A student claims 0.32 g oxygen has been destroyed. Explain the mistake.",
      "The tracked sample loses 0.32 g oxygen, but that oxygen goes into another product outside this sample boundary. A complete closed system would retain total mass. Oxygen atoms are not destroyed.",
      [
        "Identify the sample boundary.",
        "Transfer rather than destroy oxygen.",
        "Distinguish complete-system mass.",
      ],
    ),
    w(
      "p-agent-explain",
      "Explain the agent",
      "Given Fe2O3 + 3CO → 2Fe + 3CO2, justify why CO is the reducing agent and name its own change.",
      "CO removes oxygen from Fe2O3, allowing the oxide to form Fe metal. CO gains oxygen to form CO2 and is itself oxidised. The iron oxide is the substance reduced.",
      [
        "Identify the oxygen remover/receiver.",
        "Describe CO gaining oxygen.",
        "Keep agent and reduced substance distinct.",
      ],
    ),
    w(
      "p-limit",
      "Explain the model limit",
      "Zn + CuSO4 → ZnSO4 + Cu does not change the sulfate oxygen inventory. A student concludes it cannot be a redox reaction. Evaluate that oxygen-only argument.",
      "Absence of oxygen gain or loss does not rule out general redox. Oxygen-only descriptions cover the supplied oxide cases, but the broader electron-based definition is needed for this displacement and is taught separately. Sulfate remains unchanged.",
      [
        "Reject the unsupported absence-of-oxygen inference.",
        "Identify the oxygen-model limit.",
        "Retain unchanged sulfate.",
      ],
    ),
  ],
  checkForms: [
    [
      c(
        "ca-transfer",
        "Fresh oxygen transfer",
        "Given 3CuO + 2Al → 3Cu + Al2O3, which pair of original substances is changed as stated?",
        "CuO reduced; Al oxidised",
        {
          "Al reduced; CuO oxidised": "Oxygen moves from CuO to Al.",
          "Cu reduced; Al2O3 oxidised":
            "Those are products rather than the named starting changes.",
        },
        "CuO loses oxygen; Al gains oxygen.",
        "Follow oxygen through the supplied equation.",
      ),
      n(
        "ca-count",
        "Fresh transferred count",
        "In 3CuO + 2Al → 3Cu + Al2O3, how many oxygen atoms transfer from the oxide inventory?",
        3,
        "atoms",
        "3CuO supplies three O to Al2O3.",
        "Count the whole inventory.",
      ),
      c(
        "ca-agent",
        "Fresh agent role",
        "For 3CuO + 2Al → 3Cu + Al2O3, which is the reducing agent?",
        "Al",
        { CuO: "CuO is reduced.", Cu: "Cu is the product." },
        "Al receives oxygen and causes CuO reduction.",
        "Identify the substance removing oxygen from the oxide.",
      ),
      n(
        "ca-mass",
        "Fresh open-sample mass",
        "No solid lost: 2.40 g metal becomes 4.00 g oxide. Calculate oxygen mass entering the sample.",
        1.6,
        "g",
        "4.00−2.40=1.60 g.",
        "Use final minus initial.",
      ),
      w(
        "ca-written",
        "Fresh linked explanation",
        "A student says an oxide/carbon reaction reduces both oxide and carbon because a metal is obtained. Explain the error using the supplied general oxygen-transfer pattern.",
        "The oxide is reduced by losing oxygen to form metal. Carbon gains that oxygen and is oxidised to its stated carbon oxide product. Obtaining metal does not mean every substance is reduced; oxygen is transferred rather than destroyed.",
        [
          "Distinguish both named changes.",
          "Explain oxygen transfer.",
          "Reject the both-reduced claim.",
        ],
      ),
    ],
    [
      c(
        "cb-transfer",
        "Alternative oxygen transfer",
        "Given 2PbO + C → 2Pb + CO2, which pair of original substances is changed as stated?",
        "PbO reduced; C oxidised",
        {
          "PbO oxidised; C reduced": "Oxygen moves from PbO to C.",
          "Pb oxidised; CO2 reduced":
            "Those are products rather than the named reactant changes.",
        },
        "Interpret the supplied equation: PbO loses oxygen and C gains it. No experimental instructions are supplied.",
        "Follow the named oxygen source and receiver.",
      ),
      n(
        "cb-count",
        "Alternative transferred count",
        "In 2PbO + C → 2Pb + CO2, how many oxygen atoms transfer from the oxide inventory?",
        2,
        "atoms",
        "Two PbO formula units supply two O.",
        "Use coefficients and fixed formulas.",
      ),
      c(
        "cb-agent",
        "Alternative agent role",
        "Given 2PbO + C → 2Pb + CO2, which is the reducing agent?",
        "C",
        { PbO: "The oxide is reduced.", Pb: "Lead is the product." },
        "Carbon removes oxygen from PbO and gains oxygen.",
        "Identify the oxygen receiver.",
      ),
      n(
        "cb-mass",
        "Alternative tracked loss",
        "Track only oxide/metal: 5.60 g oxide becomes 4.80 g metal. Calculate oxygen mass leaving this sample for a separate product.",
        0.8,
        "g",
        "5.60−4.80=0.80 g transferred out of this sample.",
        "Do not claim oxygen is destroyed.",
      ),
      w(
        "cb-written",
        "Alternative boundary explanation",
        "A student says a sealed apparatus must lose mass when an oxide loses oxygen, although all products remain inside. Evaluate the claim.",
        "The oxide/metal portion may lose oxygen mass, but oxygen stays in another product inside the sealed apparatus. The complete system retains its total mass. The claim confuses the smaller sample boundary with the complete system.",
        [
          "Distinguish oxide portion from complete apparatus.",
          "Retain oxygen in another product.",
          "Explain unchanged total mass.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      c(
        "ra-gain",
        "Delayed oxygen gain",
        "A metal gains oxygen to form its oxide. What is its change?",
        "Oxidation",
        {
          Reduction: "This would describe oxide oxygen loss to metal.",
          "Only a physical change": "A new compound forms.",
        },
        "Metal oxygen gain is oxidation.",
        "Use the oxygen change.",
      ),
      n(
        "ra-mass",
        "Delayed mass addition",
        "No solid lost: 0.90 g metal becomes 1.50 g oxide. Find oxygen mass added.",
        0.6,
        "g",
        "1.50−0.90=0.60 g.",
        "Subtract the initial sample mass.",
      ),
      c(
        "ra-agent",
        "Delayed reducing agent",
        "Given NiO + C → Ni + CO, which is the reducing agent?",
        "C",
        { NiO: "This is the oxide reduced.", Ni: "Nickel is the product." },
        "Carbon receives oxygen from NiO.",
        "Separate the agent from the reduced oxide.",
      ),
    ],
    [
      c(
        "rb-loss",
        "Other delayed oxygen loss",
        "An oxide loses oxygen and forms its metal. What happens to the oxide?",
        "Reduction",
        {
          Oxidation: "The oxide loses rather than gains oxygen.",
          "Oxygen atoms are destroyed":
            "They are transferred to another product.",
        },
        "Oxide-to-metal oxygen loss is reduction.",
        "Track the stated substance.",
      ),
      n(
        "rb-count",
        "Other delayed atom count",
        "In 2CuO + C → 2Cu + CO2, how many O atoms enter the carbon dioxide molecule?",
        2,
        "atoms",
        "CO2 contains two oxygen atoms.",
        "Read the fixed product formula.",
      ),
      c(
        "rb-closed",
        "Other delayed boundary",
        "In a complete sealed apparatus retaining every product, does internal oxygen transfer change total mass?",
        "No: total mass stays unchanged",
        {
          "Yes: oxygen disappears": "Oxygen is conserved.",
          "Yes: all metal formation adds mass": "No atoms are created.",
        },
        "Internal reaction changes substances, not the retained mass.",
        "Use the complete boundary.",
      ),
    ],
  ],
};
oxygenRedoxJourney.guided[0].openingHint = true;
for (const [from, to] of Object.entries({
  "p-reduction": "r-loss",
  "p-agent-role": "r-agent",
  "p-open-gain": "r-mass",
  "p-magnesium": "r-gain",
})) {
  oxygenRedoxJourney.practice.find((q) => q.id === `or-v1-${from}`)!.followUp =
    `or-v1-${to}`;
}
