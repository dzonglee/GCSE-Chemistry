import type { LearningTask as Task, LessonJourney } from "../types";
import type { CrackingMode } from "../../lib/cracking";
const model = (
  mode: CrackingMode,
  instruction: string,
  record = "initial",
): Task["model"] => ({ kind: "cracking", mode, record, instruction });
function c(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  m?: Task["model"],
): Task {
  const options = [answer, ...Object.keys(errors)],
    offset =
      [...id].reduce((sum, x) => sum + x.charCodeAt(0), 0) % options.length;
  return {
    id: "crk-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    ...(m ? { model: m } : {}),
  };
}
function n(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  unit: string,
  explanation: string,
  hint: string,
  m?: Task["model"],
): Task {
  return {
    id: "crk-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    ...(m ? { model: m } : {}),
  };
}
function w(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
): Task {
  return {
    id: "crk-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    rubric,
    explanation: answer,
    hint,
  };
}
function drawing(
  id: string,
  title: string,
  prompt: string,
  answer: string,
): Task {
  return {
    ...w(
      id,
      title,
      prompt,
      answer,
      [
        "Requested carbon skeleton and correct C=C position, allowing the reversed-chain equivalent.",
        "Every hydrogen atom and every C–H/C–C bond shown; a double bond has two lines.",
        "Each neutral C has bond-order total four; each H has one bond; total formula agrees.",
      ],
      "A double bond uses two of each attached carbon’s four bonding units.",
    ),
    alkeneDrawing: {
      maxCarbons: 5,
      note: "Choose your own carbon count, C=C position and individual H attachments. Your submitted structure is self-reviewed against criteria, without automatic examiner marks.",
    },
  };
}
const warmup: Task[] = [
  c(
    "w-valence",
    "Recall carbon bonding",
    "In an ordinary neutral hydrocarbon, what bond-order total does each carbon have?",
    "4",
    {
      "2": "A double bond is one neighbour but contributes two bonding units.",
      "6": "Six is carbon’s atomic number, not its bond-order total.",
    },
    "Carbon normally has bond-order total four in these neutral molecules.",
    "Count single bonds as one and double bonds as two.",
  ),
  n(
    "w-coefficient",
    "Count repeated molecules",
    "How many H atoms are represented by 2 C₃H₆ molecules?",
    "12",
    "atoms",
    "2 × 6 = 12 H atoms; the coefficient multiplies the whole molecular formula.",
    "Keep the molecule’s subscript fixed.",
  ),
];
const refresher: Task[] = [
  c(
    "r-bond",
    "Count a double bond",
    "How much does one C=C bond contribute to the bond-order total at EACH carbon?",
    "2",
    {
      "1": "There is one neighbouring carbon, but a double bond contributes two.",
      "4": "Two is contributed to each carbon separately, not four to each.",
    },
    "Two bonding units at each end.",
    "Inspect both parallel lines.",
  ),
  n(
    "r-ethene-h",
    "Complete one carbon",
    "In ethene, each C is double-bonded to the other C. How many H atoms attach to EACH C?",
    "2",
    "H atoms",
    "4 − 2 = 2 single C–H bonds at each carbon.",
    "Complete each C locally to four.",
  ),
  c(
    "r-saturation",
    "Use the bonding definition",
    "Which bonding feature makes an alkene unsaturated?",
    "A carbon–carbon double bond",
    {
      "Any C–H bond": "Alkanes also have C–H bonds.",
      "A lack of all hydrogen": "Alkenes contain hydrogen.",
    },
    "An alkene contains C=C, allowing addition reactions.",
    "Saturation concerns the carbon–carbon bonds.",
  ),
  n(
    "r-formula",
    "Apply the stated series",
    "An open-chain alkene with ONE C=C has general formula CₙH₂ₙ. For n = 5, how many H atoms are present?",
    "10",
    "H atoms",
    "2 × 5 = 10. The one-C=C open-chain qualification matters.",
    "Use the supplied general formula.",
  ),
  c(
    "r-names",
    "Separate Chemistry extension: first four",
    "Which is the first-four alkene name order as carbon count increases from 2 to 5?",
    "Ethene, propene, butene, pentene",
    {
      "Methene, ethene, propene, butene":
        "C=C needs at least two carbon atoms; there is no one-carbon member.",
      "Ethane, propane, butane, pentane":
        "Those names identify the alkane series.",
    },
    "AQA separate Chemistry includes these four. Pearson separate includes ethene/propene/butene and the two stated butene double-bond positions. Shared models supply unfamiliar names.",
    "An alkene needs two carbons to make C=C.",
  ),
  c(
    "r-ring",
    "Do not identify bonds from formula alone",
    "A supplied C₄H₈ ring has only single bonds. Does its formula alone prove that it is an alkene?",
    "No; the supplied ring has no C=C",
    {
      "Yes; every CₙH₂ₙ molecule must be an alkene":
        "That formula also fits some rings.",
      "No; C₄H₈ contains no carbon": "C and H are both present.",
    },
    "Use the actual displayed bonds. The formula describes the simple open-chain one-C=C series, not every possible hydrocarbon.",
    "Look for a double bond.",
  ),
  c(
    "r-atoms",
    "Conservation during cracking",
    "During a supplied cracking reaction, what happens to the carbon and hydrogen atom totals?",
    "Both totals are conserved",
    {
      "Carbon is created to meet demand":
        "Chemical reactions rearrange existing atoms.",
      "Hydrogen is always destroyed":
        "Hydrogen moves between bonding arrangements rather than disappearing.",
    },
    "Atoms are conserved while covalent bonds change.",
    "Track C and H separately.",
  ),
  n(
    "r-subscript",
    "Subtract hydrogen",
    "For C₁₀H₂₂ → C₈H₁₈ + C₂H?, what is the missing H subscript?",
    "4",
    "",
    "22 − 18 = 4 H atoms in the one remaining molecule.",
    "Subtract product H from original H.",
  ),
  n(
    "r-repeated",
    "Allocate to two molecules",
    "For C₁₂H₂₆ → C₄H₁₀ + 2 C₄H?, what is the H subscript in EACH unknown molecule?",
    "8",
    "",
    "26 − 10 = 16; 16 ÷ 2 = 8 H per molecule.",
    "A coefficient of two means two separate molecules.",
  ),
  c(
    "r-scale",
    "Scale entire formulas",
    "When balancing a supplied molecular equation, which operation preserves molecular identities?",
    "Change whole-number coefficients",
    {
      "Change C/H subscripts": "That changes each molecule’s composition.",
      "Change only one atom in a molecule":
        "A coefficient must multiply all atoms in the molecule.",
    },
    "Keep supplied formulas fixed; positive whole-number balanced multiples are valid.",
    "Separate coefficient from subscript.",
  ),
  c(
    "r-heat",
    "General cracking conditions",
    "Which general conditions describe a permitted cracking method?",
    "High temperature with a catalyst or steam",
    {
      "Room temperature with bromine water":
        "Bromine water tests unsaturation; it is not the stated cracking method.",
      "Cooling until a fraction condenses":
        "That describes physical separation.",
    },
    "Catalytic and steam cracking are permitted general methods. Exact industrial temperatures vary.",
    "Cracking changes covalent bonding.",
  ),
  c(
    "r-purpose",
    "Connect products with demand",
    "Why can cracking be useful when demand exceeds supply of short hydrocarbons?",
    "It produces smaller fuels and alkene chemical starting materials",
    {
      "It creates new carbon atoms": "Existing atoms are rearranged.",
      "It converts every hydrocarbon to pure ethene":
        "Actual cracking mixtures are not universally one pure product.",
    },
    "Smaller hydrocarbons can meet fuel demand; alkenes are useful chemical/polymer feedstocks. Uses are not exclusive.",
    "Connect products to two uses.",
  ),
  c(
    "r-separate",
    "Distinguish two processes",
    "Fractional distillation collects molecules already present; cracking produces new smaller molecules. Which changes covalent bonding?",
    "Cracking",
    {
      "Fractional distillation":
        "Separation does not change molecular identities.",
      Neither: "Cracking changes bonding and creates new molecular species.",
    },
    "Cracking is chemical; fractionation is physical.",
    "Ask whether molecules remain the same.",
  ),
  c(
    "r-bromine",
    "State the observable change",
    "What happens when ethene decolourises initially orange bromine water in the ordinary supplied test?",
    "Orange changes to colourless",
    {
      "Colourless changes to orange": "The original bromine colour is orange.",
      "Orange changes to purple": "That is not the bromine-water observation.",
    },
    "State both original and final colour.",
    "Name the starting colour first.",
  ),
  c(
    "r-mixture",
    "Limit a mixture inference",
    "A cracking gas mixture changes orange bromine water to colourless. What is supported?",
    "Unsaturated molecules are present in the mixture",
    {
      "Every molecule is ethene":
        "A positive mixture test does not identify all species or a unique formula.",
      "Every molecule is an alkane":
        "Ordinary alkane candidates do not give this decolourisation result.",
    },
    "The mixture contains unsaturated molecules; it need not be pure or wholly unsaturated.",
    "Distinguish some from every.",
  ),
  c(
    "r-controls",
    "Use the supplied blank",
    "In a supplied comparison the no-sample blank also becomes colourless. Why is the unknown’s result unreliable for identification?",
    "Colour changed even without the unknown sample",
    {
      "A colourless blank proves pure ethene":
        "The blank contains no unknown sample.",
      "All blank tubes must become colourless":
        "The stated matched blank should retain the original bromine colour.",
    },
    "Use the actual controls provided in this question; the colour loss is not attributable solely to the sample.",
    "Compare the no-sample result.",
  ),
];
const guided: Task[] = [
  n(
    "g-rearrange",
    "Compare molecules",
    "Form C₄H₁₀ + alkene from C₆H₁₄. Count H across BOTH products.",
    "14",
    "atoms",
    "C₄H₁₀ + C₂H₄ retains all 14 original H atoms; changed bonding completes both products.",
    "Count both molecules, not only the alkane.",
    model("rearrange", "Compare complete before and after molecules."),
  ),
  n(
    "g-structure",
    "Build ethene",
    "Build the supplied two-carbon ethene structure with C=C and complete each C to four. What is the total number of H atoms?",
    "4",
    "H atoms",
    "Each C has a double bond and two C–H single bonds: four H atoms in total.",
    "A C=C contributes two bonding units to EACH carbon.",
    model("structure", "Build ethene."),
  ),
  n(
    "g-balance",
    "Recover the missing formula",
    "Use the supplied C₁₀H₂₂ → C₈H₁₈ + unknown equation. What H subscript belongs in the one unknown alkene molecule?",
    "4",
    "",
    "C₂H₄ supplies the two remaining C and four remaining H atoms.",
    "Track both elements without changing the supplied C₈H₁₈.",
    model("balance", "Conserve C and H."),
  ),
  c(
    "g-bromine",
    "Interpret the original observations",
    "Reveal the original blank, known-alkene and sample observations. Within the supplied alkane/alkene comparison, what does the sample’s orange→colourless result support?",
    "An alkene candidate",
    {
      "An alkane candidate":
        "The successful ordinary comparison supports unsaturation.",
      "An exact ethene formula for every possible unknown":
        "Colour alone does not give a unique molecular formula.",
    },
    "The originally orange reagent, retained-colour blank and successful reference support the stated comparison; the formula remains unidentified.",
    "Use the original observations and the stated candidate scope.",
    model("bromine", "Reveal and interpret the supplied evidence."),
  ),
  c(
    "g-process",
    "Choose from purpose and conditions",
    "Select a catalytic route that creates smaller molecules from the original long hydrocarbon. What type of change is cracking?",
    "Chemical",
    {
      Physical: "New molecules are formed by covalent bond rearrangement.",
      Nuclear: "The identities of the atoms do not change.",
    },
    "High-temperature catalytic cracking rearranges covalent bonds and forms new molecular species.",
    "Compare the original and product molecules.",
    model("process", "Choose the route from its purpose."),
  ),
];
const practice: Task[] = [
  n(
    "p-feed-h",
    "Preserve the original inventory",
    "C₁₀H₂₂ cracks into C₈H₁₈ + C₂H₄ in the supplied example. How many H atoms are present across ALL products?",
    "22",
    "atoms",
    "18 + 4 = 22; the original molecule contains the same total.",
    "Do not count only the smaller alkene.",
  ),
  c(
    "p-cut-only",
    "A cut alone is incomplete",
    "Why does simply deleting a C–C bond from a fully saturated alkane fail to produce the two complete neutral product structures shown?",
    "Further C–H and C–C bond rearrangement is needed",
    {
      "Two complete alkanes always appear immediately":
        "Their total H requirement exceeds the original inventory.",
      "Extra hydrogen atoms appear automatically":
        "No extra H source is supplied.",
    },
    "The complete net comparison moves an existing H partner and increases another C–C bond order. It illustrates net bookkeeping, not an actual cracking mechanism.",
    "Check local carbon valences and the original H inventory.",
  ),
  n(
    "p-other-cut",
    "Original request remains fixed",
    "The original supplied request is C₁₀H₂₂ → C₈H₁₈ + alkene. How many C atoms must the requested alkene contain, even if you try another cut?",
    "2",
    "C atoms",
    "10 − 8 = 2. Another cut may illustrate a different valid pair but cannot rewrite the original request.",
    "Use the original requested product.",
    model("rearrange", "Keep the original product request fixed.", "decane"),
  ),
  n(
    "p-methane-pair",
    "A small saturated product",
    "For the supplied C₆H₁₄ → CH₄ + C₅H? example, find the H subscript.",
    "10",
    "",
    "14 − 4 = 10, giving C₅H₁₀.",
    "Subtract the H atoms in the supplied methane.",
  ),
  c(
    "p-saturation",
    "Read the bonds",
    "Which feature identifies the supplied open-chain structure as an alkene?",
    "The carbon–carbon double bond",
    {
      "The presence of C–H bonds":
        "Both alkane and alkene structures contain C–H bonds.",
      "It has carbon atoms in a line":
        "An alkane can also be drawn as a chain.",
    },
    "Identify C=C directly from the displayed two-line bond.",
    "Inspect the original carbon–carbon bonds.",
  ),
  n(
    "p-propene-h",
    "Complete propene locally",
    "In the supplied propene target, C1=C2–C3. How many H atoms attach to the MIDDLE C2?",
    "1",
    "H atom",
    "C2 has a double C1 bond (two) and a single C3 bond (one), leaving one C–H bond.",
    "Complete the middle carbon, not the whole formula.",
    model("structure", "Complete each carbon locally.", "propene"),
  ),
  n(
    "p-but2-h",
    "Internal double bond",
    "In supplied but-2-ene C1–C2=C3–C4, how many H atoms attach to C2?",
    "1",
    "H atom",
    "2 + 1 + 1 = 4 bonding units; one H attaches.",
    "Count both neighbouring-carbon bonds.",
    model("structure", "Locate the supplied internal C=C.", "but2"),
  ),
  c(
    "p-reverse",
    "Equivalent chain direction",
    "A four-carbon drawing has C=C at the RIGHT-hand end instead of the left. All local valences and H atoms are correct. How does it compare with but-1-ene drawn from the other direction?",
    "It is the same reversed-chain structure",
    {
      "It necessarily becomes but-2-ene":
        "The double bond remains at the end, not between the two middle carbons.",
      "It becomes a saturated alkane":
        "Reversing a drawing does not remove C=C.",
    },
    "The carbon numbering can be reversed; an end double bond remains an end double bond.",
    "Compare adjacency, not drawing direction.",
  ),
  n(
    "p-formula-seven",
    "Apply the qualified series",
    "A supplied open-chain alkene has seven C atoms and ONE C=C. How many H atoms does its molecular formula contain?",
    "14",
    "H atoms",
    "2n = 14. The larger name need not be recalled.",
    "Use the supplied n and stated series.",
  ),
  c(
    "p-ring",
    "Read a ring rather than assume",
    "The original supplied C₄H₈ ring shows every carbon–carbon bond as single. Which conclusion is justified?",
    "It has no C=C and is not an alkene",
    {
      "It must contain a hidden double bond because H = 2n":
        "The actual complete displayed structure has only single bonds.",
      "Its atoms must be counted as C₄H₁₀": "Eight H atoms are shown.",
    },
    "A saturated ring may share CₙH₂ₙ; read the displayed bonds rather than apply the open-chain qualification universally.",
    "Look at the actual lines.",
  ),
  c(
    "p-ethene-name",
    "Separate Chemistry extension: ethene",
    "Name the simple two-carbon C₂H₄ alkene.",
    "Ethene",
    {
      Ethane: "Ethane is the two-carbon alkane C₂H₆.",
      Propene: "Propene has three carbon atoms.",
    },
    "Ethene is the first alkene member; C=C requires two carbons.",
    "Use the two-carbon stem.",
  ),
  c(
    "p-propene-name",
    "Separate Chemistry extension: propene",
    "Name the simple three-carbon C₃H₆ alkene.",
    "Propene",
    {
      Propane: "Propane has only single C–C bonds and formula C₃H₈.",
      Butene: "Butene has four carbons.",
    },
    "Three-carbon alkene: propene.",
    "Use the three-carbon stem and alkene ending.",
  ),
  c(
    "p-butene-name",
    "Separate Chemistry extension: butene",
    "Name the first-four-series four-carbon C₄H₈ alkene family.",
    "Butene",
    {
      Butane: "Butane has formula C₄H₁₀.",
      Pentene: "Pentene has five carbons.",
    },
    "Butene has four carbons. Supplied but-1-ene and but-2-ene differ in C=C position.",
    "Use the four-carbon stem.",
  ),
  c(
    "p-pentene-name",
    "AQA separate Chemistry extension: pentene",
    "Name the first-four-series five-carbon C₅H₁₀ alkene.",
    "Pentene",
    {
      Pentane: "Pentane has only single C–C bonds and formula C₅H₁₂.",
      Butene: "Butene has four carbons.",
    },
    "AQA separate includes pentene as its fourth alkene member. This is not individual-name recall required by AQA Combined.",
    "Use the five-carbon stem.",
  ),
  drawing(
    "p-draw-ethene",
    "Construct supplied ethene",
    "Construct supplied ethene: two carbon atoms, formula C₂H₄, with C=C. Show every atom and bond.",
    "H₂C=CH₂ with every individual C–H bond shown; each carbon has bond-order total four.",
  ),
  drawing(
    "p-draw-propene",
    "Construct supplied propene",
    "Construct supplied propene: three carbons, formula C₃H₆, C=C at an end. Show every atom and bond.",
    "H₂C=CH–CH₃, or the reversed-chain equivalent; every H and bond is displayed.",
  ),
  drawing(
    "p-draw-but1",
    "Construct supplied but-1-ene",
    "Construct supplied but-1-ene: four carbons, C₄H₈, end C=C. Show every atom and bond.",
    "H₂C=CH–CH₂–CH₃, or its reversed-chain equivalent; eight individually bonded H atoms.",
  ),
  drawing(
    "p-draw-but2",
    "Construct supplied but-2-ene",
    "Construct supplied but-2-ene: four carbons, C₄H₈, C=C between the middle two carbons. Show every atom and bond.",
    "CH₃–CH=CH–CH₃; three H on each terminal C, one on each middle C; all bonds displayed.",
  ),
  drawing(
    "p-draw-pentene",
    "Construct supplied pent-1-ene",
    "Construct supplied pent-1-ene: five carbons, C₅H₁₀, end C=C. Show every atom and bond.",
    "H₂C=CH–CH₂–CH₂–CH₃, or reversed; ten H atoms, each C has bond-order total four.",
  ),
  n(
    "p-nine-formula",
    "Subtract both elements",
    "In C₉H₂₀ → C₅H₁₂ + C?H₈, find the missing C subscript.",
    "4",
    "",
    "9 − 5 = 4 C; 20 − 12 = 8 H, consistent with C₄H₈.",
    "Keep all supplied molecular formulas fixed.",
  ),
  n(
    "p-two-alkenes",
    "Two product molecules",
    "For C₁₂H₂₆ → C₄H₁₀ + 2 C₄H?, find the H subscript in ONE alkene molecule.",
    "8",
    "",
    "26 − 10 = 16 H allocated to two molecules: 8 each.",
    "Divide the remaining inventory by two.",
    model(
      "balance",
      "Distinguish formula from repeated molecules.",
      "twoAlkenes",
    ),
  ),
  n(
    "p-ten-coeff",
    "Supply a coefficient",
    "In C₁₀H₂₂ → C₄H₁₀ + ? C₃H₆, find the positive whole-number missing coefficient.",
    "2",
    "",
    "C: 10 − 4 = 6, so two C₃ molecules. H: 22 − 10 = 12, so two H₆ molecules too.",
    "Check BOTH elements.",
    model("balance", "Balance by changing coefficients.", "tenCarbon"),
  ),
  c(
    "p-multiple",
    "Accept balanced multiples",
    "Is 2 C₆H₁₄ → 2 C₄H₁₀ + 2 C₂H₄ an atom-balanced multiple of the supplied cracking equation?",
    "Yes; both elements are conserved",
    {
      "No; only coefficients of one are ever allowed":
        "Balanced positive whole-number multiples preserve the same reaction ratio.",
      "No; the product subscripts should double":
        "Changing subscripts changes molecular identities.",
    },
    "Both sides contain C12 and H28; doubling every coefficient preserves the ratio.",
    "Count whole molecules on both sides.",
  ),
  c(
    "p-change-subscript",
    "Preserve supplied species",
    "Why is changing the supplied C₃H₆ product to C₆H₁₂ not a valid coefficient-balancing step?",
    "It changes the molecule’s identity rather than its amount",
    {
      "A formula subscript always counts molecules":
        "Subscripts count atoms within one molecule.",
      "It always leaves the original three-carbon structure unchanged":
        "Six C atoms describe a different molecule.",
    },
    "2 C₃H₆ means two original molecules; C₆H₁₂ means one molecule with a different atom count.",
    "Separate formula from amount.",
  ),
  c(
    "p-conditions",
    "Two accepted general routes",
    "Which pair states two permitted general cracking methods?",
    "High heat with catalyst; high heat with steam",
    {
      "Catalyst at room temperature; steam only when frozen":
        "The required high-temperature condition is absent.",
      "Fractional distillation; bromine-water testing":
        "These separate and test materials rather than perform the stated cracking reaction.",
    },
    "The general alternatives are high-temperature catalytic cracking and high-temperature steam cracking.",
    "Each route needs the required general heat condition.",
  ),
  c(
    "p-demand",
    "Explain the purpose",
    "Which reason directly links cracking to product demand?",
    "Convert excess longer hydrocarbons into demanded smaller fuels and alkene feedstocks",
    {
      "Separate only already-present shorter molecules without reaction":
        "That describes fractionation.",
      "Create carbon atoms from nothing": "Chemical reactions conserve atoms.",
    },
    "Longer hydrocarbons can be chemically converted to useful shorter products and chemical starting materials.",
    "Use both the original material and target demand.",
  ),
  c(
    "p-stage",
    "Three different stages",
    "A mixture is separated into fractions, a long hydrocarbon is converted to propene, then propene molecules form a polymer. Which process makes new SMALLER hydrocarbon molecules?",
    "Cracking",
    {
      "Fractional distillation": "This collects existing molecules.",
      Polymerisation: "This joins molecules into a larger polymer.",
    },
    "Separation → cracking → polymerisation serve different purposes.",
    "Focus on the stage that creates smaller molecules.",
  ),
  c(
    "p-steam",
    "Choose the supplied route",
    "The supplied plant uses high temperature and steam, with no catalyst stated. Is this a permitted general cracking route?",
    "Yes; high-temperature steam cracking",
    {
      "No; every cracking route must use a catalyst":
        "The general steam route is also accepted.",
      "Yes; steam at any temperature is sufficient":
        "High temperature remains part of the route.",
    },
    "Steam cracking is an accepted general method; do not add a universal catalyst requirement.",
    "Use the route actually supplied.",
    model("process", "Judge the supplied steam route.", "steam"),
  ),
  c(
    "p-distil",
    "Existing molecules",
    "The target is to collect an existing boiling-range fraction without changing its molecules. Which process serves that target?",
    "Fractional distillation",
    {
      Cracking: "Cracking changes molecular identities.",
      Polymerisation:
        "Polymerisation joins small molecules into a larger material.",
    },
    "Heating and condensation separate existing molecules physically.",
    "Ask whether new molecules are requested.",
    model(
      "process",
      "Choose physical separation when molecules stay the same.",
      "separate",
    ),
  ),
  c(
    "p-alkane-colour",
    "Ordinary supplied comparison",
    "A successful ordinary matched test of supplied hexane retains orange bromine colour. What is its final colour?",
    "Orange",
    {
      Colourless:
        "That is the decolourisation outcome for the supplied alkene comparison.",
      Purple: "Purple is not the supplied bromine-water observation.",
    },
    "Within these ordinary supplied conditions the alkane sample retains orange.",
    "Read the actual reported final colour.",
    model("bromine", "Compare a supplied saturated sample.", "alkane"),
  ),
  c(
    "p-mixture",
    "Do not claim purity",
    "The original cracking gas MIXTURE decolourises bromine water. Which inference is justified?",
    "It contains unsaturated molecules",
    {
      "Every molecule must be an alkene":
        "A mixture result does not establish every component.",
      "Its exact formula must be C₂H₄":
        "The colour test cannot identify a unique alkene formula.",
    },
    "Unsaturation is present; purity and all identities remain unestablished.",
    "Use the word mixture.",
    model("bromine", "Keep the mixture inference limited.", "mixture"),
  ),
  c(
    "p-blank-failed",
    "Failed original blank",
    "The original blank and unknown sample both turn colourless. What makes the unknown identification unreliable?",
    "The reagent also lost colour without the unknown",
    {
      "The blank proves the unknown is pure ethene":
        "The blank has no unknown.",
      "The unknown’s formula is now measured":
        "Colour does not measure formula.",
    },
    "The matched no-sample control shows loss that cannot be attributed solely to the unknown.",
    "Compare the original blank.",
    model("bromine", "Use the failed-control evidence.", "blankFailed"),
  ),
  c(
    "p-positive-failed",
    "Failed known reference",
    "The original known ethene reference stays orange, as does the unknown. What should be concluded in this supplied comparison?",
    "The failed positive reference makes the unknown identification unreliable",
    {
      "The unknown must be a pure alkane":
        "The supplied positive reference failed to show the expected response.",
      "Ethene is now proved saturated":
        "Ethene’s C=C structure is unchanged by a failed test.",
    },
    "Use the stated failed-reference evidence; absence of a reliable response is not confident class identification.",
    "Check the known alkene observation.",
    model("bromine", "Assess the failed reference.", "positiveFailed"),
  ),
  c(
    "p-spent",
    "Original colour matters",
    "The original reagent is already colourless before either sample is added. Can a colourless final tube demonstrate orange→colourless decolourisation?",
    "No; there was no original orange colour to lose",
    {
      "Yes; any colourless tube proves an alkene":
        "The starting colour is essential to demonstrate the change.",
      "Yes; all original reagents are colourless":
        "The ordinary stated bromine-water reagent is orange.",
    },
    "A final colour alone does not demonstrate the required observable change.",
    "Inspect the ORIGINAL reagent colour.",
    model("bromine", "Use both original and final colour.", "spent"),
  ),
  w(
    "p-written-cracking",
    "Explain cracking for demand",
    "Explain why cracking a supply of long hydrocarbons can help meet demand for smaller fuels and polymer starting materials.",
    "High-temperature catalyst/steam cracking changes covalent bonding in longer hydrocarbons to produce smaller hydrocarbons, including useful fuels and alkenes that provide chemical/polymer starting materials. Atoms are conserved.",
    [
      "Connect original longer hydrocarbons to new smaller molecules.",
      "State high temperature with catalyst or steam.",
      "Link smaller fuel demand and alkene chemical/polymer feedstock use.",
    ],
    "Link conditions, changed molecules and two uses.",
  ),
  w(
    "p-written-test",
    "Explain a limited test conclusion",
    "A gas mixture produced by cracking turns initially orange bromine water colourless under a supplied successful comparison. State the observation, inference and one limit.",
    "Orange bromine water becomes colourless. Unsaturated molecules are present in the mixture. The test does not show that every molecule is an alkene, establish purity, or identify a unique formula.",
    [
      "State orange→colourless.",
      "Infer unsaturation present.",
      "Give a limit consistent with a mixture, rather than claim all molecules are ethene.",
    ],
    "Separate what happened from what it establishes.",
  ),
];
// Original diagrams are attached to specific independent demands; no answer scaffold is supplied to drawings.
practice.find((t) => t.id === "crk-v1-p-saturation")!.hydrocarbonGiven = {
  carbons: 3,
  doubleBond: 0,
};
practice.find((t) => t.id === "crk-v1-p-ring")!.hydrocarbonGiven = {
  carbons: 4,
  doubleBond: null,
  ring: true,
};
const checkForms: Task[][] = [
  [
    n(
      "a-missing-h",
      "Conserve hydrogen",
      "For supplied C₈H₁₈ → C₅H₁₂ + C₃H?, find the H subscript.",
      "6",
      "",
      "18 − 12 = 6, giving C₃H₆.",
      "Account for all original H atoms.",
    ),
    n(
      "a-repeated",
      "Count molecules",
      "For supplied C₁₆H₃₄ → C₈H₁₈ + ? C₄H₈, find the positive whole-number coefficient.",
      "2",
      "",
      "Eight remaining C and sixteen remaining H require two C₄H₈ molecules.",
      "Check C and H independently.",
    ),
    c(
      "a-conditions",
      "General route",
      "Which general conditions can convert a supplied long hydrocarbon into smaller new hydrocarbon molecules?",
      "High temperature and a catalyst or steam",
      {
        "Cooling and condensation alone":
          "That physically separates original molecules.",
        "Orange bromine water at room temperature":
          "That is an unsaturation test.",
      },
      "General cracking methods use high temperature with catalyst or steam.",
      "Distinguish reaction from separation/testing.",
    ),
    c(
      "a-bromine",
      "Supplied matched test",
      "Initially orange bromine water stays orange with the matched blank and becomes colourless with the known alkene and unknown. Candidates are an ordinary alkane or alkene. Which class is supported for the unknown?",
      "Alkene",
      {
        Alkane:
          "The ordinary successful matched comparison supports unsaturation.",
        "An exact uniquely identified ethene formula":
          "The class test does not identify a unique formula.",
      },
      "The stated controls support the comparison and colour change, within its candidate scope.",
      "Use the actual original observations.",
    ),
    c(
      "a-mixture",
      "Limit inference",
      "A cracking mixture gives a reliable orange→colourless result. What is established?",
      "Unsaturated molecules are present",
      {
        "Every product molecule is ethene":
          "The mixture result does not identify every species.",
        "All products must be saturated":
          "That conflicts with the successful unsaturation evidence.",
      },
      "The result supports presence, not purity or a unique molecular formula.",
      "Read mixture carefully.",
    ),
    c(
      "a-ring",
      "Interpret supplied bonds",
      "The supplied four-carbon ring has all single bonds and formula C₄H₈. Which conclusion is supported?",
      "It is not an alkene because it has no C=C",
      {
        "It is definitely an alkene just because H = 2n":
          "The actual ring shows only single bonds.",
        "It contains no covalent bonds":
          "Every shown C–C/C–H connection is covalent.",
      },
      "The open-chain alkene formula does not universally identify bonds in a ring.",
      "Inspect the actual displayed structure.",
    ),
    drawing(
      "a-draw",
      "Construct supplied propene",
      "Construct supplied propene C₃H₆: three carbons with an end C=C. Show each H and all bonds.",
      "H₂C=CH–CH₃, or reversed; six H atoms with bond-order four at every C.",
    ),
    w(
      "a-explain",
      "Link cracking with demand",
      "Explain how cracking serves demand for smaller fuels and alkene starting materials. Include general conditions and the molecular change.",
      "High temperature with catalyst or steam converts longer hydrocarbons into new smaller molecules by changing covalent bonding. Smaller hydrocarbons can supply fuels and alkenes can be starting materials for chemicals/polymers.",
      [
        "State high temperature with catalyst or steam.",
        "Explain new smaller molecules through bond changes rather than creation of atoms.",
        "Connect products with fuel demand and alkene feedstock use.",
      ],
      "Link original material, conditions and product uses.",
    ),
  ],
  [
    n(
      "b-missing-c",
      "Conserve carbon",
      "For supplied C₁₁H₂₄ → C₇H₁₆ + C?H₈, find the C subscript.",
      "4",
      "",
      "11 − 7 = 4 C; 24 − 16 = 8 H, consistent with C₄H₈.",
      "Conserve both elements.",
    ),
    n(
      "b-repeated",
      "Allocate repeated molecules",
      "For supplied C₁₄H₃₀ → C₆H₁₄ + 2 C₄H?, find the H subscript of EACH repeated product.",
      "8",
      "",
      "30 − 14 = 16 H; divide between two molecules, giving eight each.",
      "A subscript describes one molecule.",
    ),
    c(
      "b-steam",
      "Judge a route",
      "A supplied cracking route uses high temperature and steam, with no catalyst. Which judgement is correct?",
      "It is a permitted general cracking route",
      {
        "It cannot be cracking without a catalyst":
          "Steam cracking is also permitted.",
        "Steam alone makes the high-temperature condition irrelevant":
          "High temperature remains part of this route.",
      },
      "Catalyst and steam are alternative general methods.",
      "Use the conditions actually supplied.",
    ),
    c(
      "b-bromine",
      "Read original final colour",
      "The supplied known alkene successfully decolourises initially orange bromine water. What is its final colour?",
      "Colourless",
      {
        Orange:
          "Orange is the original colour, retained by a saturated candidate in the ordinary comparison.",
        Purple: "Purple is not the supplied bromine-water result.",
      },
      "Orange changes to colourless.",
      "Distinguish original and final.",
    ),
    c(
      "b-control",
      "Failed reference",
      "The supplied known ethene reference stays orange. The unknown also stays orange. What does the failed reference mean for unknown class identification?",
      "The identification is unreliable in this supplied comparison",
      {
        "The unknown is conclusively a pure alkane":
          "A failed positive reference does not support confident negative classification.",
        "Ethene has become an alkane":
          "The test failure does not rewrite ethene’s structure.",
      },
      "Use the actual failed-reference evidence.",
      "Compare the original known-reference result.",
    ),
    c(
      "b-stage",
      "Choose a process",
      "A supplied factory has already separated its fractions. It now wants to JOIN small alkene molecules into a larger polymer. Which stage meets this target?",
      "Polymerisation",
      {
        Cracking: "Cracking creates smaller molecules.",
        "Fractional distillation":
          "Fractionation collects existing molecules without joining them.",
      },
      "Joining alkene molecules is polymerisation; its detailed structure is studied in the later lesson.",
      "Focus on the stated larger-product target.",
    ),
    drawing(
      "b-draw",
      "Construct supplied but-2-ene",
      "Construct supplied but-2-ene C₄H₈: four carbons with C=C between the middle two. Show all H atoms and bonds.",
      "CH₃–CH=CH–CH₃: eight H atoms; each terminal C has three H and each middle C one.",
    ),
    w(
      "b-explain",
      "Use evidence without overclaiming",
      "A supplied cracking gas mixture turns initially orange bromine water colourless in a successful comparison. Explain the observation, inference and a limit.",
      "Orange changes to colourless. Unsaturated molecules are present in the gas mixture. This does not identify every molecule, establish purity or give a unique molecular formula.",
      [
        "State original and final colours.",
        "Infer unsaturated molecules present.",
        "State a mixture/purity/unique-identity limit.",
      ],
      "Separate observation, inference and limit.",
    ),
  ],
];
checkForms[0].find((t) => t.id === "crk-v1-a-ring")!.hydrocarbonGiven = {
  carbons: 4,
  doubleBond: null,
  ring: true,
};
const reviewForms: Task[][] = [
  [
    n(
      "ra-formula",
      "Retrieve atom conservation",
      "For supplied C₁₀H₂₂ → C₆H₁₄ + C₄H?, find the missing H subscript.",
      "8",
      "",
      "22 − 14 = 8 H.",
      "Conserve original H.",
    ),
    c(
      "ra-purpose",
      "Retrieve process purpose",
      "Which process creates smaller new hydrocarbons from supplied longer hydrocarbons?",
      "Cracking",
      {
        "Fractional distillation": "It separates existing molecules.",
        Polymerisation: "It joins molecules to form a larger polymer.",
      },
      "Cracking changes covalent bonding to form smaller products.",
      "Focus on new smaller molecules.",
    ),
    w(
      "ra-test",
      "Retrieve test and limit",
      "State the bromine-water observation for a successful alkene test, and explain why a positive cracking-mixture test does not prove every molecule is an alkene.",
      "Initially orange bromine water becomes colourless. Unsaturated molecules are present, but a mixture response does not establish every component’s identity.",
      [
        "Orange→colourless.",
        "Unsaturation present.",
        "Mixture result does not establish every component.",
      ],
      "Use original/final colour and a limited conclusion.",
    ),
  ],
  [
    n(
      "rb-repeated",
      "Retrieve molecule versus formula",
      "For supplied C₁₈H₃₈ → C₁₀H₂₂ + 2 C₄H?, find the H subscript in ONE alkene molecule.",
      "8",
      "",
      "38 − 22 = 16; 16 ÷ 2 = 8 per molecule.",
      "Divide the remainder by the stated number of molecules.",
    ),
    c(
      "rb-route",
      "Retrieve general conditions",
      "Which route gives stated general cracking conditions?",
      "High temperature with catalyst or steam",
      {
        "Cooling alone": "Cooling is not the stated cracking method.",
        "Bromine water only": "It is an unsaturation test.",
      },
      "High heat with catalyst or steam describes the accepted general methods.",
      "Recall heat and either accepted route.",
    ),
    drawing(
      "rb-draw",
      "Retrieve a supplied structure",
      "Construct supplied ethene C₂H₄: two C atoms joined by C=C. Show each H and every bond.",
      "H₂C=CH₂ with four individually displayed H atoms and bond-order four at each C.",
    ),
  ],
];
const recovery: Record<string, string[]> = {
  "p-feed-h": ["r-atoms"],
  "p-cut-only": ["r-atoms", "r-bond"],
  "p-other-cut": ["r-atoms"],
  "p-methane-pair": ["r-subscript"],
  "p-saturation": ["r-saturation"],
  "p-propene-h": ["r-bond", "r-ethene-h"],
  "p-but2-h": ["r-bond", "r-ethene-h"],
  "p-reverse": ["r-bond"],
  "p-formula-seven": ["r-formula"],
  "p-ring": ["r-ring"],
  "p-ethene-name": ["r-names"],
  "p-propene-name": ["r-names"],
  "p-butene-name": ["r-names"],
  "p-pentene-name": ["r-names"],
  "p-draw-ethene": ["r-bond", "r-ethene-h"],
  "p-draw-propene": ["r-bond", "r-ethene-h"],
  "p-draw-but1": ["r-bond", "r-formula"],
  "p-draw-but2": ["r-bond", "r-formula"],
  "p-draw-pentene": ["r-bond", "r-formula"],
  "p-nine-formula": ["r-atoms", "r-subscript"],
  "p-two-alkenes": ["r-repeated"],
  "p-ten-coeff": ["r-scale", "r-repeated"],
  "p-multiple": ["r-scale"],
  "p-change-subscript": ["r-scale"],
  "p-conditions": ["r-heat"],
  "p-demand": ["r-purpose"],
  "p-stage": ["r-separate"],
  "p-steam": ["r-heat"],
  "p-distil": ["r-separate"],
  "p-alkane-colour": ["r-bromine"],
  "p-mixture": ["r-mixture"],
  "p-blank-failed": ["r-controls"],
  "p-positive-failed": ["r-controls"],
  "p-spent": ["r-bromine"],
  "p-written-cracking": ["r-heat", "r-purpose", "r-separate"],
  "p-written-test": ["r-bromine", "r-mixture"],
};
for (const t of practice)
  t.followUp = "crk-v1-" + recovery[t.id.replace("crk-v1-", "")][0];
const families: Record<string, string[]> = {
  valence: [
    "w-valence",
    "r-bond",
    "r-ethene-h",
    "g-structure",
    "p-propene-h",
    "p-but2-h",
    "p-reverse",
    "p-draw-ethene",
    "p-draw-propene",
    "p-draw-but1",
    "p-draw-but2",
    "p-draw-pentene",
    "a-draw",
    "b-draw",
    "rb-draw",
  ],
  saturation: [
    "r-saturation",
    "r-ring",
    "g-structure",
    "p-saturation",
    "p-ring",
    "a-ring",
  ],
  series: [
    "r-formula",
    "p-formula-seven",
    "p-draw-ethene",
    "p-draw-propene",
    "p-draw-but1",
    "p-draw-but2",
    "p-draw-pentene",
    "a-draw",
    "b-draw",
    "rb-draw",
  ],
  names: [
    "r-names",
    "p-ethene-name",
    "p-propene-name",
    "p-butene-name",
    "p-pentene-name",
  ],
  atoms: [
    "r-atoms",
    "g-rearrange",
    "p-feed-h",
    "p-cut-only",
    "p-other-cut",
    "a-explain",
  ],
  formula: [
    "r-subscript",
    "g-balance",
    "p-methane-pair",
    "p-nine-formula",
    "a-missing-h",
    "b-missing-c",
    "ra-formula",
  ],
  repeated: [
    "w-coefficient",
    "r-repeated",
    "p-two-alkenes",
    "p-ten-coeff",
    "a-repeated",
    "b-repeated",
    "rb-repeated",
  ],
  coefficients: [
    "r-scale",
    "p-ten-coeff",
    "p-multiple",
    "p-change-subscript",
    "a-repeated",
  ],
  conditions: [
    "r-heat",
    "g-process",
    "p-conditions",
    "p-steam",
    "p-written-cracking",
    "a-conditions",
    "b-steam",
    "a-explain",
    "rb-route",
  ],
  purpose: [
    "r-purpose",
    "g-process",
    "p-demand",
    "p-written-cracking",
    "a-explain",
  ],
  stages: [
    "r-separate",
    "g-process",
    "p-stage",
    "p-distil",
    "b-stage",
    "ra-purpose",
  ],
  bromine: [
    "r-bromine",
    "g-bromine",
    "p-alkane-colour",
    "p-spent",
    "p-written-test",
    "a-bromine",
    "b-bromine",
    "b-explain",
    "ra-test",
  ],
  mixture: [
    "r-mixture",
    "g-bromine",
    "p-mixture",
    "p-written-test",
    "a-mixture",
    "b-explain",
    "ra-test",
  ],
  controls: [
    "r-controls",
    "g-bromine",
    "p-blank-failed",
    "p-positive-failed",
    "p-spent",
    "a-bromine",
    "b-control",
  ],
};
const all = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
for (const ids of Object.values(families)) {
  const aliases = ids.map((x) => "crk-v1-" + x);
  for (const t of all)
    if (aliases.includes(t.id))
      t.exposureAliases = [
        ...new Set([
          ...(t.exposureAliases ?? []),
          ...aliases.filter((x) => x !== t.id),
        ]),
      ];
}
export const crackingJourney: LessonJourney = {
  version: 1,
  introduction:
    "Compare complete cracking products, construct and interpret alkene bonds, conserve both elements, use bromine evidence and choose processes from their purpose.",
  scopeNote:
    "Shared cracking, general conditions, atom conservation, uses and ordinary bromine-water evidence are based on actual AQA8462 4.7.1.4/4.7.2.1–2, Trilogy5.7.1.4 and limited Pearson8.16–17/9.12C–16C reading. AQA Combined does not require recall of individual alkene names/formulas. First-four name recall is labelled separate Chemistry; AQA separate includes pentene, while the reviewed Pearson requirement includes first three and but-1-ene/but-2-ene displayed structures. Shared checks supply names/formulas for structure constructions. Actual2022F Q02.5,2022H Q04.6–7 and2023F Q02.6–7 were paired with genuine mark schemes; an actual RSC/Nuffield teaching resource informed the model/evidence design. The complete 3D comparison illustrates net atom/bond bookkeeping, not a reaction mechanism or unique real product distribution. Written and drawn answers require self-review. Detailed addition/polymer reactions follow in later lessons; full board coverage, Maths parity and whole-course exam readiness remain unfinished.",
  outcomes: [
    "Explain why longer hydrocarbons are cracked into useful smaller fuels and alkene chemical feedstocks.",
    "State high-temperature catalyst/steam methods without imposing one universal industrial temperature.",
    "Construct and interpret supplied alkene structures using local carbon valence and a C=C; distinguish a supplied saturated ring.",
    "Balance supplied cracking equations while preserving molecular formulas and accounting for repeated products.",
    "State orange→colourless bromine evidence and judge actual supplied controls and mixture limits.",
    "Distinguish physical separation, cracking and polymerisation from their original purpose.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
};
export const crackingRecovery = recovery;
export const crackingExposureFamilies = families;
export { warmup, refresher, guided, practice, checkForms, reviewForms };
