import type { ExamPaper, ExamPart } from "./exam-paper-types";
import { boardPaperAuthor } from "./board-paper-authoring";
import { emptyOrganicDrawing } from "../lib/organic-drawing";
import { blankPolymerisationDrawing } from "../lib/polymerisation-board";
import { blankPolyesterDrawing } from "../lib/polyester";

const author = boardPaperAuthor("chem-edx-p2h-full-v1-", "higher");
const group = author(
  "Periodic groups and electron transfer",
  "atomic-structure",
);
const rate = author("Rates and endpoint evidence", "rates");
const energy = author("Hydrogenation and reaction profiles", "energy");
const fuel = author("Fractions, cracking and pollutants", "organic");
const organic = author("Alcohols, acids and fermentation", "organic");
const polymer = author("Addition and condensation polymers", "organic");
const analysis = author("Unknown salt and instrumental evidence", "analysis");
const nano = author("Nanoparticles and exposed surfaces", "bonding");
const air = author("Atmosphere mechanisms and evidence", "atmosphere");
const heat = author("Comparing alcohol burners", "energy");

const groups: ExamPart[] = [
  group(
    "1(a)",
    ["6.4", "6.5"],
    "Explain the Group 1 change",
    "Explain why potassium reacts more vigorously with water than sodium. Refer to electron arrangements and attraction to the outer electron.",
    "Potassium has an additional occupied electron shell. Its outer electron is farther from the nucleus and more shielded by inner electrons, weakening the attraction. It is therefore lost more readily in reaction with water.",
    3,
    [3, 0, 0],
    [
      [
        "Potassium has an additional occupied shell / greater outer-electron distance than sodium.",
        1,
      ],
      [
        "More shielding and greater distance reduce the nuclear attraction to the outer electron; do not attribute the trend to fewer protons.",
        1,
      ],
      [
        "The outer electron is lost more readily, explaining the increased reactivity.",
        1,
      ],
    ],
    "written",
  ),
  group(
    "1(b)",
    ["6.11", "6.12"],
    "Write the displacement equation",
    "Chlorine reacts with aqueous potassium bromide. Write the balanced net ionic equation. Omit spectator ions; state symbols are not required.",
    "Cl₂ + 2Br⁻ → 2Cl⁻ + Br₂",
    2,
    [0, 2, 0],
    [
      [
        "Correct reacting/product species Cl₂, Br⁻, Cl⁻ and Br₂, omitting K⁺ spectators.",
        1,
      ],
      [
        "Balances atoms and charge as Cl₂+2Br⁻→2Cl⁻+Br₂, or a consistent multiple. Correct species with incorrect coefficients can earn the first point.",
        1,
      ],
    ],
    "written",
    { question: { writtenEquations: true } },
  ),
  group(
    "1(c)",
    ["6.12"],
    "Explain chlorine's reduction",
    "In chlorine's displacement of bromide, explain why chlorine is reduced, in terms of electrons.",
    "Each chlorine atom gains an electron to become a chloride ion; reduction is gain of electrons.",
    1,
    [1, 0, 0],
    [
      [
        "Chlorine gains electrons to form chloride; merely saying 'it displaces bromine' does not explain reduction.",
        1,
      ],
    ],
    "written",
  ),
  group(
    "1(d)",
    ["6.12"],
    "Identify the oxidised species",
    "Which reacting species is oxidised when chlorine displaces bromine from potassium bromide? Explain using electron transfer.",
    "Bromide ions are oxidised: they lose electrons to form bromine. Potassium ions remain spectators.",
    1,
    [1, 0, 0],
    [
      [
        "Identifies bromide ions and explains loss of electrons; both identification and reason are needed for this point.",
        1,
      ],
    ],
    "written",
  ),
  group(
    "1(e)",
    ["1.12"],
    "Use isotope counts as weights",
    "An illustrative enriched chlorine sample contains 210 atoms of relative isotope mass 35 and 140 of mass 37. Calculate its relative atomic mass to one decimal place. Show how the counts determine your denominator.",
    "35.8",
    3,
    [0, 3, 0],
    [
      [
        "Uses the total count 210+140=350, not 100 as if the counts were percentages.",
        1,
      ],
      ["Sets up (210×35+140×37)/350, or correctly equivalent fractions.", 1],
      [
        "Evaluates 35.8 to one decimal place. Allow evaluation of a consistent preceding weighted setup after a count/arithmetic error; do not ignore contradictory work.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      question: { rounding: { kind: "decimal-places", digits: 1 } },
    },
  ),
];

const tangentReference = '{"tx0":"10","ty0":"21","tx1":"50","ty1":"69"}';
const rates: ExamPart[] = [
  rate(
    "2(a)",
    ["7.2", "7.5"],
    "Construct a tangent at 30 seconds",
    "On this constructed gas-volume curve, draw a tangent at 30 s using two well-separated endpoints. The curve represents a model over 0–60 s, not an experimental fit. Do not draw the origin-to-end chord.",
    tangentReference,
    3,
    [0, 3, 0],
    [
      [
        "A straight tangent contacts the curve near (30 s,45 cm³), rather than merely joining two distant curve points.",
        1,
      ],
      [
        "Its slope follows the local direction: approximately 1.2 cm³/s, allowing a sensible graphical tolerance of 1.05–1.35 cm³/s when contact is appropriate.",
        1,
      ],
      [
        "Uses a useful span of at least 20 s, with visible endpoints inside the graph and no appreciable crossing of the curve locally. Other valid endpoint pairs are accepted; the reference pair is not compulsory.",
        1,
      ],
    ],
    "native",
    {
      mathematics: true,
      practical: 3,
      referenceConstruction: tangentReference,
      question: {
        explanation:
          "One valid tangent passes through (10,21) and (50,69), meeting the curve at (30,45) with slope (69−21)/(50−10)=1.2 cm³/s. Other suitably placed tangent endpoints earn credit.",
        tangentDrawing: {
          label: "Original constructed gas-volume curve",
          curve: {
            start: 0,
            end: 60,
            max: 90,
            unit: "cm³",
            quantity: "Gas volume",
            origin: 0,
            a: -0.01,
            b: 1.8,
            c: 0,
            at: 30,
            label:
              "Constructed assessment curve; its equation is not required.",
          },
        },
      },
    },
  ),
  rate(
    "2(b)",
    ["7.5"],
    "Calculate a separate tangent gradient",
    "A different product-volume tangent passes through (15 s,18 cm³) and (55 s,58 cm³). Calculate the instantaneous rate in cm³/s. Show the coordinate differences; these are tangent points, not two measured curve points.",
    "1.0",
    2,
    [0, 2, 0],
    [
      ["Calculates rise/run as (58−18)/(55−15)=40/40.", 1],
      [
        "Evaluates 1.0 cm³/s. Allow consistent evaluation of the student's coordinate differences; dividing a final coordinate by another is not the correct method.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, practical: 2, question: { unit: "cm³/s" } },
  ),
  rate(
    "2(c)",
    ["7.3", "7.4", "7.15"],
    "Explain temperature and successful collisions",
    "Explain why increasing temperature usually increases reaction rate. Include both collision frequency and the activation-energy requirement.",
    "Particles have greater average kinetic energy and move faster. They collide more often, and a greater fraction of collisions have energy at least the activation energy. More successful collisions occur per second.",
    3,
    [3, 0, 0],
    [
      ["Greater average kinetic energy / faster particle motion.", 1],
      ["Higher collision frequency per unit time.", 1],
      [
        "A greater fraction have energy at least the activation energy, giving more successful collisions per second; not merely a lower activation energy at higher temperature.",
        1,
      ],
    ],
    "written",
  ),
  rate(
    "2(d)",
    ["7.1b", "7.2"],
    "Evaluate a disappearing-cross comparison",
    "A class compares thiosulfate concentrations using disappearance of a cross. It changes solution depth and observers as well as concentration, but claims its times show only concentration's effect. Evaluate the claim and give two specific corrections for a fair endpoint comparison.",
    "The claim is unsupported because depth changes the amount of cloudiness needed to hide the cross and different observers may judge disappearance differently. Use the same total liquid volume/depth and vessel geometry, adjusting water when changing concentration, and use one observer with the same cross/lighting/viewing arrangement or a consistent instrumental threshold. Keep acid amount and temperature matched.",
    3,
    [0, 0, 3],
    [
      [
        "Rejects an isolated concentration conclusion because the changed depth and endpoint judgement introduce other influences; identifies a relevant mechanism, not simply 'it is unfair'.",
        1,
      ],
      [
        "Corrects depth/optical path using the same total volume, vessel and cross geometry, with matched acid conditions; not fixing thiosulfate amount instead of varying concentration.",
        1,
      ],
      [
        "Corrects subjective endpoint comparison using the same observer/view/lighting or a suitable fixed instrumental threshold. Generic repeats alone do not remove these confounds.",
        1,
      ],
    ],
    "written",
    { practical: 3 },
  ),
  rate(
    "2(e)",
    ["7.1b", "7.5"],
    "Compare reciprocal-time rates",
    "For a matched disappearing-cross endpoint, use relative rate=1/time. Time is 75 s in A and 50 s in B. Calculate rate B divided by rate A.",
    "1.5",
    1,
    [0, 1, 0],
    [["(1/50)/(1/75)=75/50=1.5, not 50/75.", 1]],
    "scalar",
    { mathematics: true, practical: 1 },
  ),
];

const profileReference =
  '{"reactant":"60","product":"30","peak":"100","activationArrow":"reactants-peak","overallArrow":"reactants-products"}';
const energies: ExamPart[] = [
  energy(
    "3(a)",
    ["7.12", "7.13", "7.14"],
    "Calculate hydrogenation's energy change",
    "For CH₂=CH₂ + H₂ → CH₃–CH₃, use mean bond energies (kJ/mol): C=C 612; H–H 436; C–C 348; C–H 412. Calculate the signed energy change per mole of ethene reacted. Show bond totals; unchanged C–H bonds may be cancelled.",
    "-124",
    4,
    [0, 4, 0],
    [
      [
        "Broken bonds: 612+436=1048 kJ/mol after cancelling unchanged C–H bonds; alternatively includes four C–H on both sides consistently.",
        1,
      ],
      [
        "New bonds: 348+2×412=1172 kJ/mol after cancellation; alternatively six product C–H bonds in the full tally.",
        1,
      ],
      [
        "Uses total energy for breaking minus total released in forming; credit this method after an earlier bond-count error if consistent.",
        1,
      ],
      [
        "Correctly evaluates the signed difference −124 kJ/mol, or consistently evaluates the preceding broken−formed values after an error. A wrong positive sign may retain the other valid three points. The prompt requires working; do not award unshown method points from a bare number.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, question: { unit: "kJ/mol" } },
  ),
  energy(
    "3(b)",
    ["7.16"],
    "Build the specified energy profile",
    "For a separate reaction amount, reactants are at 60 kJ, 30 kJ is released overall, and forward activation energy is 40 kJ. Construct its levels and both arrows. The horizontal axis is reaction progress.",
    profileReference,
    3,
    [0, 3, 0],
    [
      [
        "Sets reactants to 60 and products to 30 kJ, because 30 kJ is released; not products at 90.",
        1,
      ],
      [
        "Peak is at 100 kJ and activation arrow spans reactants→peak, representing 40 kJ.",
        1,
      ],
      [
        "Overall-change arrow runs reactants→products downwards, representing −30 kJ for the stated amount.",
        1,
      ],
    ],
    "native",
    {
      referenceConstruction: profileReference,
      question: {
        profileDrawing: true,
        compactProfileInstructions: true,
        referenceResponse:
          "Reactants 60 kJ, products 30 kJ, peak 100 kJ; activation from reactants to peak, overall change from reactants down to products.",
      },
    },
  ),
  energy(
    "3(c)",
    ["7.15"],
    "Define activation energy",
    "State what activation energy means in a collision model of reaction.",
    "The minimum energy that colliding particles must have for a reaction to occur.",
    1,
    [1, 0, 0],
    [
      [
        "Minimum energy for a successful/reacting collision, not the total energy released.",
        1,
      ],
    ],
    "written",
  ),
  energy(
    "3(d)",
    ["7.12", "7.13"],
    "Explain an exothermic bond balance",
    "Explain an exothermic reaction in terms of the energy absorbed in breaking bonds and released in forming bonds.",
    "Breaking reactant bonds absorbs energy; forming product bonds releases energy. The energy released in forming exceeds the energy absorbed in breaking, so energy is transferred to the surroundings overall.",
    2,
    [2, 0, 0],
    [
      [
        "Correctly states that breaking absorbs and forming releases energy.",
        1,
      ],
      [
        "Explains that more is released in forming than absorbed in breaking, giving overall release; not 'bonds contain heat that is released when broken'.",
        1,
      ],
    ],
    "written",
  ),
];

const fuels: ExamPart[] = [
  fuel(
    "4(a)",
    ["8.3", "8.5"],
    "Explain fraction boiling points",
    "Explain why a crude-oil fraction with longer hydrocarbon molecules generally has a higher boiling range than one with shorter molecules. Identify which attractions are overcome.",
    "Longer hydrocarbon molecules generally have stronger intermolecular attractions. More energy is needed to overcome these attractions and separate the molecules; boiling does not break their covalent C–C bonds.",
    2,
    [2, 0, 0],
    [
      [
        "Longer molecules generally have stronger intermolecular attractions.",
        1,
      ],
      [
        "More energy is needed to overcome those attractions on boiling; a covalent-bond-breaking explanation does not earn this point.",
        1,
      ],
    ],
    "written",
  ),
  fuel(
    "4(b)",
    ["1.43a", "1.45b", "1.47", "8.16"],
    "Deduce the missing cracking feedstock",
    "One molecule of alkane X cracks into exactly one C₁₀H₂₂ molecule and one alkene Y, with no other products. Y has empirical formula CH₂ and relative molecular mass 98. Deduce both Y and X, showing all steps. Aᵣ: C=12,H=1.",
    "CH₂ has empirical mass 14;98/14=7, so Y is C₇H₁₄. Conserving atoms gives X=C₁₇H₃₆: C₁₇H₃₆→C₁₀H₂₂+C₇H₁₄.",
    4,
    [0, 0, 4],
    [
      ["Empirical formula mass of CH₂ is 12+2=14.", 1],
      [
        "98/14=7 gives the molecular multiplier; credit a consistently evaluated ratio after an earlier empirical-mass error.",
        1,
      ],
      [
        "Y is C₇H₁₄, or the correctly scaled empirical formula using the preceding integer multiplier after an error. A bare correct Y earns this point, not unseen working points.",
        1,
      ],
      [
        "X is C₁₇H₃₆ by adding the atoms of exactly one of each product; allow consistent atom addition after a shown earlier Y error. A bare correct X earns only this point.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  fuel(
    "4(c)",
    ["8.11", "8.12"],
    "Trace sulfur pollution",
    "Explain how a sulfur impurity in a hydrocarbon fuel can cause acid rain when the fuel burns.",
    "The sulfur impurity is oxidised during combustion, forming sulfur dioxide. This dissolves/reacts in atmospheric water to form acidic solution, contributing to acid rain.",
    3,
    [3, 0, 0],
    [
      ["Sulfur in the fuel burns/is oxidised.", 1],
      ["Names sulfur dioxide as the sulfur-containing combustion product.", 1],
      [
        "Sulfur dioxide dissolves/reacts in rain/cloud water, making it acidic. Nitrogen from air is a different pollution pathway.",
        1,
      ],
    ],
    "written",
  ),
  fuel(
    "4(d)",
    ["8.4"],
    "Choose the road-surfacing fraction",
    "Which crude-oil fraction is used in road surfacing?",
    "Bitumen",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: ["Refinery gases", "Petrol", "Kerosene", "Bitumen"],
      },
    },
  ),
];

const acidReference = JSON.stringify({
  ...emptyOrganicDrawing(),
  n: "4",
  hydroxyl: "yes",
  carbonyl: "2",
  oxygenH: "yes",
  h0: "yes",
  h1: "yes",
  h2: "yes",
  h4: "yes",
  h5: "yes",
  h8: "yes",
  h9: "yes",
});
const organics: ExamPart[] = [
  organic(
    "5(a)",
    ["9.29C", "9.30C"],
    "Construct butanoic acid",
    "Construct butanoic acid using the carbon scaffold, individual C–H attachments and oxygen bonds. Show all hydrogens and the complete carboxylic acid group. Do not leave an alcohol at the end.",
    acidReference,
    3,
    [3, 0, 0],
    [
      [
        "An unbranched four-carbon chain, counting the carboxyl carbon among the four.",
        1,
      ],
      [
        "A terminal C(=O)–O–H group with one double-bonded oxygen and one hydroxyl oxygen; not two hydroxyls or an aldehyde.",
        1,
      ],
      [
        "C–H attachments complete CH₃–CH₂–CH₂–COOH with valid carbon/oxygen valences, molecular formula C₄H₈O₂. Equivalent reversal of the whole displayed chain is acceptable.",
        1,
      ],
    ],
    "native",
    {
      referenceConstruction: acidReference,
      question: {
        organicDrawing: {
          maxCarbons: 4,
          note: "Construct the complete four-carbon acid; all displayed valences are manually reviewed.",
        },
        explanation:
          "Butanoic acid is CH₃–CH₂–CH₂–C(=O)–OH. Its four carbons include the carboxyl carbon; there are eight hydrogens and two oxygens.",
      },
    },
  ),
  organic(
    "5(b)",
    ["9.31C", "9.32C"],
    "Identify the functional-group conversion",
    "Butan-1-ol is converted into butanoic acid without changing its carbon-chain length. Name the type of chemical change.",
    "Oxidation",
    1,
    [1, 0, 0],
    [["Oxidation; no reagent recall or reaction mechanism is required.", 1]],
    "written",
  ),
  organic(
    "5(c)",
    ["9.33C", "9.34C"],
    "Explain fermentation and concentration",
    "A supervised school project needs a more concentrated ethanol solution starting from aqueous glucose. Explain how fermentation produces ethanol and how it can then be concentrated. Link the conditions and separation method to their purposes.",
    "Yeast enzymes ferment glucose in warm aqueous conditions, for example around 30–35°C, with oxygen excluded. An airlock allows carbon dioxide to escape while limiting air entry; excessive heat denatures enzymes. Ethanol and carbon dioxide are formed. After fermentation, separate yeast if needed and use fractional distillation with suitable electrical heating, a fractionating column and condenser. Ethanol is more volatile / has a lower boiling point than water, so the collected fraction is enriched in ethanol and vapour is condensed for collection. This concentrates aqueous ethanol; ordinary fractional distillation does not establish pure 100% ethanol.",
    6,
    [6, 0, 0],
    [],
    "written",
    {
      practical: 0,
      levels: [
        {
          min: 5,
          max: 6,
          text: "Coherent account covers fermentation and subsequent concentration, with developed links between conditions, enzyme action/oxygen exclusion and the relative volatility/condensation separation. Both stages are chemically sound. Select 5 for a minor gap, 6 for a well-developed whole response; equivalent relevant detail is accepted and no exhaustive apparatus checklist is required.",
        },
        {
          min: 3,
          max: 4,
          text: "A useful account has one stage developed accurately or both stages described with limited explanation. Choose 3 or 4 by coherence, correct conditions and the useful separation reasoning; important omissions prevent the top level.",
        },
        {
          min: 1,
          max: 2,
          text: "Isolated relevant ideas about yeast, suitable warmth, ethanol production or distillation, with few links and limited development. Award 1 or 2 for the quality of the complete response.",
        },
        {
          min: 0,
          max: 0,
          text: "No relevant fermentation or ethanol-concentration science.",
        },
      ],
    },
  ),
];

const monomerReference = JSON.stringify({
  ...blankPolymerisationDrawing(),
  s0: "F",
  s1: "F",
  s2: "H",
  s3: "CH3",
  bond: "2",
});
const polyesterReference = JSON.stringify({
  ...blankPolyesterDrawing(),
  diolC: "4",
  acidSpacerC: "1",
  leftO: "1",
  middleO: "1",
  carbonyl1: "2",
  carbonyl2: "2",
  left: "1",
  right: "1",
  brackets: "1",
  countMark: "n",
});
const polymers: ExamPart[] = [
  polymer(
    "6(a)",
    ["9.20C"],
    "Recover the addition monomer",
    "Construct its alkene monomer. Keep every side group, choose the joining bond and remove polymer notation.",
    monomerReference,
    3,
    [0, 3, 0],
    [
      ["Restores a C=C bond between the two original backbone carbons.", 1],
      [
        "Preserves two F on one reacting carbon and H/CH₃ on the other: CF₂=CHCH₃. Equivalent reflection or rotation is accepted; splitting the fluorines between carbons changes the compound.",
        1,
      ],
      [
        "Shows a discrete monomer with neither polymer continuation bonds nor polymer brackets/count notation. CH₃ is the supplied side-group notation and may remain condensed.",
        1,
      ],
    ],
    "native",
    {
      referenceConstruction: monomerReference,
      question: {
        polymerisationGiven: { groups: ["F", "F", "H", "CH3"], polymer: true },
        polymerisationDrawing: {
          kind: "monomer",
          note: "Recover a discrete alkene from the supplied repeat; CH₃ may remain as the supplied group.",
        },
        explanation:
          "The monomer is CF₂=CHCH₃. The double bond is restored between the backbone carbons, each substituent remains attached to its original carbon, and polymer notation is absent.",
      },
    },
  ),
  polymer(
    "6(b)",
    ["9.22C"],
    "Construct the polyester repeat",
    "Construct a polyester repeat from HO–(CH₂)₄–OH and HOOC–CH₂–COOH. Retain both monomer spacers and both carbonyls. Show two complete ester linkages through the repeating chain, continuation bonds, brackets and n. CH₂ spacer notation is allowed.",
    polyesterReference,
    4,
    [0, 4, 0],
    [
      [
        "Retains four CH₂ groups from the diol and one CH₂ between the two separate carboxyl carbons from the diacid; these carboxyl carbons are additional.",
        1,
      ],
      ["Both original carboxyl carbons retain C=O double bonds.", 1],
      [
        "Correct ester connectivity –O–(CH₂)₄–O–C(=O)–CH₂–C(=O)– through the repeating chain; no retained OH at the joined repeat boundaries. Equivalent reversed/shifted repeat boundaries are acceptable.",
        1,
      ],
      [
        "Continuation bonds cross the brackets and n is outside: a repeat, not an isolated molecule. The prompt explicitly asks for this notation.",
        1,
      ],
    ],
    "native",
    {
      referenceConstruction: polyesterReference,
      question: {
        polyesterDrawing: {
          diolC: 4,
          acidSpacerC: 1,
          note: "Both monomer spacers and carbonyls must survive condensation; use the supplied CH₂ notation.",
        },
        explanation:
          "A valid repeat is [–O–(CH₂)₄–O–C(=O)–CH₂–C(=O)–]ₙ. It contains seven carbons and four oxygens per repeat contribution, with omitted chain ends; the two joined monomers lose water at ester-link formation.",
      },
    },
  ),
  polymer(
    "6(c)",
    ["9.22Cb"],
    "Explain the need for two functional groups",
    "Why can ethanol and ethanoic acid by themselves form an ester but not a polyester chain? Refer to their functional groups.",
    "Each has only one reacting functional group. After those join there is no second functional group on either unit to continue growth; polyester chain growth needs bifunctional monomers such as a diol and a dicarboxylic acid.",
    1,
    [1, 0, 0],
    [
      [
        "Each monomer has only one reacting group, so after joining no second reactive end remains for continued chain growth. Merely saying they are small is insufficient.",
        1,
      ],
    ],
    "written",
  ),
  polymer(
    "6(d)",
    ["9.22C"],
    "Count water in one finite chain",
    "Exactly three diol molecules and three dicarboxylic-acid molecules join into one open linear chain. All six molecules are connected, no ring forms, and each new ester link eliminates one H₂O. How many water molecules are eliminated? Explain by counting links, not repeating units.",
    "Six starting molecules joined into one open chain require five links, so five water molecules are eliminated. The two chain ends remain; six repeat-fragment waters is not the count for this finite chain.",
    2,
    [0, 2, 0],
    [
      [
        "Six separate molecules connected into one open linear chain require 6−1=5 new links.",
        1,
      ],
      [
        "One H₂O per ester link gives five water molecules. A bare 5 earns this result point but not the unshown link-count point.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  polymer(
    "6(e)",
    ["9.25C"],
    "Identify two natural-polymer building blocks",
    "State the type of monomer in DNA, including how many different types it uses, and the type of monomer in starch.",
    "DNA uses four different nucleotide types. Starch is built from sugar/glucose monomers.",
    2,
    [2, 0, 0],
    [
      [
        "DNA uses four different nucleotide types; the specific nucleotide names are not required.",
        1,
      ],
      ["Starch uses sugar/glucose monomers, not amino acids.", 1],
    ],
    "written",
  ),
];

const ions: ExamPart[] = [
  analysis(
    "7(a)",
    ["9.3C", "9.5C", "9.6C", "9.7C"],
    "Identify both ions in the unknown",
    "A colourless unknown contains one metal cation and one anion. Candidates are Al³⁺ or Ca²⁺, and SO₄²⁻ or Cl⁻. Describe a supervised-school testing plan to identify both ions, including distinguishing observations and precautions against a misleading result.",
    "Use fresh separate portions and clean apparatus. Add aqueous sodium hydroxide dropwise and then in excess to one portion: both candidates give white precipitates initially, but aluminium's dissolves in excess whereas calcium's remains. On another portion add dilute hydrochloric acid then barium chloride solution: a white barium sulfate precipitate supports sulfate. For a chloride test use a fresh portion acidified with dilute nitric acid followed by silver nitrate: a white silver chloride precipitate supports chloride. Do not acidify the chloride portion with hydrochloric acid, which introduces chloride, or the sulfate test with sulfuric acid, which introduces sulfate. Link the observed pattern to the actual cation and anion; do not identify either cation from a white precipitate alone.",
    6,
    [3, 0, 3],
    [],
    "written",
    {
      practical: 6,
      levels: [
        {
          min: 5,
          max: 6,
          text: "Coherent workable plan distinguishes both candidate cations and both anions using appropriate reagents, observations and uncontaminated portions. Explains at least one relevant false-result precaution. Both identifications are supported rather than assumed. Choose 5 for a minor gap, 6 for developed, accurate reasoning. Scientifically valid alternative flame/precipitation combinations may earn full credit; this indicative plan is not an exhaustive checklist.",
        },
        {
          min: 3,
          max: 4,
          text: "Useful testing sequence correctly develops one ion distinction or covers both with an important reagent, distinguishing-observation or contamination omission. Select 3 or 4 for the completeness and quality of the whole account.",
        },
        {
          min: 1,
          max: 2,
          text: "Isolated relevant test/reagent/observation ideas, insufficiently linked to identifying both ions. Choose 1 or 2 by the useful chemical detail supplied.",
        },
        { min: 0, max: 0, text: "No relevant identification method." },
      ],
    },
  ),
  analysis(
    "7(b)",
    ["1.26", "9.5C"],
    "Represent a different halide precipitation",
    "For this unfamiliar supplied precipitation, solutions contain Pb²⁺,NO₃⁻,K⁺ and I⁻ ions. Solid PbI₂ forms; K⁺ and NO₃⁻ remain aqueous. Write the balanced net ionic equation, omitting spectators. State symbols are optional.",
    "Pb²⁺ + 2I⁻ → PbI₂",
    3,
    [0, 3, 0],
    [
      [
        "Pb²⁺ on the reacting side with the correct charge, omitting the supplied spectator ions.",
        1,
      ],
      ["I⁻ on the reacting side with the correct charge.", 1],
      [
        "Forms PbI₂ and balances the complete equation 1:2:1, or a consistent multiple. Correct reacting species with wrong balancing may retain their respective points; no state-symbol mark is imposed.",
        1,
      ],
    ],
    "written",
    { question: { writtenEquations: true } },
  ),
  analysis(
    "7(c)",
    ["9.8C", "9.9C"],
    "Interpret a nonzero photometer blank",
    "Flame-photometer standards give intensity 5,19,33 for metal-ion concentrations 0,2,4 mg/dm³. Assume a linear calibration. A sample gives 22.5. Determine its concentration and explain why using 22.5/33×4 would be wrong.",
    "The blank intensity is 5, so the signal slope is (33−5)/4=7 intensity units per mg/dm³. The sample's corrected signal is 22.5−5=17.5; concentration 17.5/7=2.5 mg/dm³. The proposed proportional calculation wrongly forces the calibration through zero intensity, ignoring the nonzero blank.",
    3,
    [0, 0, 3],
    [
      [
        "Recognises/subtracts the nonzero intensity blank 5 rather than treating total intensity as proportional to concentration.",
        1,
      ],
      [
        "Uses slope(33−5)/4=7, or equivalent interpolation between the actual standards.",
        1,
      ],
      [
        "Obtains 2.5 mg/dm³ and links rejection of the proposed method to its incorrect zero-intercept assumption. A correct number alone is insufficient for this combined result/explanation point.",
        1,
      ],
    ],
    "written",
    { mathematics: true, practical: 3 },
  ),
];

const nanoparticles: ExamPart[] = [
  nano(
    "8(a)",
    ["9.35C"],
    "Convert the particle edge length",
    "A cube-shaped nanoparticle has edge length 42 nm. Express this length in metres. 1 nm=10⁻⁹ m.",
    "4.2e-8",
    1,
    [0, 1, 0],
    [["42×10⁻⁹ m=4.2×10⁻⁸ m; equivalent numerical notation is accepted.", 1]],
    "scalar",
    { mathematics: true, question: { unit: "m" } },
  ),
  nano(
    "8(b)",
    ["9.36C"],
    "Analyse the newly exposed area",
    "A solid cube of edge 210 nm is cut without material loss into identical 42 nm cubes. All small cubes are separated so every face is exposed. Calculate total exposed surface area after cutting divided by the original exposed area. Show the cube count and areas. Cube area=6l²; volume=l³.",
    "There are (210/42)³=125 small cubes. Original area 6×210²=264600 nm². Each small area 6×42²=10584 nm²; total 125×10584=1323000 nm². The factor is 1323000/264600=5. Volume is conserved; counting only five small cubes ignores three dimensions.",
    3,
    [0, 0, 3],
    [
      [
        "Uses 125=(210/42)³ small cubes, or an equivalent volume-conservation argument.",
        1,
      ],
      [
        "Compares original 6×210² with total 125×6×42², or derives area per conserved volume proportional to 1/edge length; counts all separated faces.",
        1,
      ],
      [
        "Obtains factor 5 with a consistent area comparison; allow correct evaluation after a shown earlier arithmetic/count error, without inventing or losing material. A bare 5 earns only the result point.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  nano(
    "8(c)",
    ["9.36C", "9.37C", "9.38C", "9.39C"],
    "Evaluate the catalyst evidence",
    "Catalysts N and L are the same material. At equal mass and temperature, N (42 nm particles) converts 92% of a pollutant in 60 s; L (larger particles) converts 71%. A seller calls N 'better and proven safe for repeated worker exposure'. Evaluate the claim and explain one size-related benefit.",
    "The matched test supports greater conversion by N after 60 s: 92% versus 71%. Smaller particles expose more surface area per unit material volume, providing more catalytic sites at equal mass of this material. This does not establish safety: conversion data do not measure inhalation effects, long-term toxicity or repeated exposure. Relevant safety evidence is needed before the whole claim is justified.",
    3,
    [0, 1, 2],
    [
      [
        "Applies larger surface area per unit volume to more exposed catalytic sites at equal material mass; not simply more material or proven safety.",
        1,
      ],
      [
        "Uses the equal-mass 92% versus 71% evidence to support the limited conversion in 60 s conclusion.",
        1,
      ],
      [
        "Rejects the proven repeated-use safety conclusion because the test supplies no relevant inhalation/toxicity/long-term exposure evidence, naming a relevant missing investigation. Generic 'more tests' alone is insufficient.",
        1,
      ],
    ],
    "written",
  ),
  nano(
    "8(d)",
    ["9.35C"],
    "State the nanoparticle size range",
    "State the approximate size range conventionally used for nanoparticles in GCSE Chemistry.",
    "Approximately 1–100 nm.",
    1,
    [1, 0, 0],
    [["Approximately 1–100 nanometres; not micrometres or 1–100 metres.", 1]],
    "written",
  ),
];

const atmosphere: ExamPart[] = [
  air(
    "9(a)",
    ["8.20", "8.21", "8.22"],
    "Explain two early-atmosphere changes",
    "Describe how cooling of the early Earth and later photosynthetic organisms helped reduce atmospheric carbon dioxide and increase oxygen.",
    "Cooling allowed water vapour to condense and form oceans. Carbon dioxide dissolved in ocean water, reducing atmospheric carbon dioxide. Later photosynthetic organisms removed carbon dioxide and released oxygen, contributing to oxygen's atmospheric increase.",
    3,
    [3, 0, 0],
    [
      ["Cooling caused water vapour to condense, forming oceans.", 1],
      [
        "Carbon dioxide dissolved in the oceans, removing it from the atmosphere.",
        1,
      ],
      [
        "Photosynthesis removed CO₂ and released O₂; both linked gas changes are needed for this point.",
        1,
      ],
    ],
    "written",
  ),
  air(
    "9(b)",
    ["8.24"],
    "Explain greenhouse-gas action",
    "Explain how greenhouse gases affect energy leaving the Earth's surface. Identify the relevant radiation and what happens after absorption.",
    "Greenhouse gases absorb outgoing infrared radiation from the Earth's surface. They re-emit infrared in different directions, including towards the surface, reducing the rate of energy loss to space for a given surface temperature.",
    2,
    [2, 0, 0],
    [
      [
        "Absorb outgoing infrared radiation emitted by the Earth's surface; not merely 'reflect sunlight'.",
        1,
      ],
      [
        "Re-emit infrared, including back towards the surface, affecting energy loss to space / contributing to warming.",
        1,
      ],
    ],
    "written",
  ),
  air(
    "9(c)",
    ["8.9"],
    "Explain carbon-monoxide toxicity",
    "Explain why breathing carbon monoxide from incomplete fuel combustion is dangerous, referring to blood transport.",
    "Carbon monoxide binds strongly to haemoglobin, reducing its capacity to carry oxygen. Less oxygen reaches body tissues, which can be fatal.",
    2,
    [2, 0, 0],
    [
      ["Carbon monoxide binds to haemoglobin.", 1],
      [
        "Reduces oxygen-carrying capacity / oxygen delivery to tissues; 'poisonous' alone is not an explanation.",
        1,
      ],
    ],
    "written",
  ),
  air(
    "9(d)",
    ["8.25"],
    "Evaluate a two-station conclusion",
    "An illustrative report uses temperatures from only two city stations over three years. Their average rose 0.4°C while local CO₂ readings rose. It concludes this alone measures the global long-term human-caused warming trend exactly. Evaluate the conclusion and specify better evidence.",
    "These coincident local changes alone cannot exactly quantify a global long-term human-caused trend. Two city sites over three years have limited geographical coverage and are affected by short-term weather and possible urban/instrument changes. Use long-term globally distributed calibrated measurements with uncertainty estimates, alongside greenhouse mechanisms and evidence separating human emissions from other influences. This report's limitation does not establish that human-caused warming is absent.",
    3,
    [0, 0, 3],
    [
      [
        "Rejects the exact global causal inference from local correlation alone; distinguishes a measured association from attribution/quantification.",
        1,
      ],
      [
        "Identifies a concrete limitation of the two-site/three-year design, such as weather variability, geographical representativeness or urban/instrument changes.",
        1,
      ],
      [
        "Specifies improved long-term, geographically representative/calibrated evidence with uncertainty and/or evidence separating causes, linked to the stated limitation. A claim that global warming is therefore disproved earns no point.",
        1,
      ],
    ],
    "written",
  ),
];

const calorimetry: ExamPart[] = [
  heat(
    "10(a)",
    ["9.28C"],
    "Calculate the fuel comparison measure",
    "In a supervised burner comparison, 120 g of water warms from 18.6°C to 43.6°C. The burner mass falls from 152.84 g to 151.59 g. Calculate fuel mass burned per degree of temperature rise in g/°C. Show both subtractions. This measure is not an energy per mole.",
    "0.050",
    3,
    [0, 3, 0],
    [
      ["Fuel burned=152.84−151.59=1.25 g.", 1],
      ["Temperature rise=43.6−18.6=25.0°C.", 1],
      [
        "Fuel per degree=1.25/25.0=0.050 g/°C. Allow consistent division of the preceding differences after an error; inverse 25/1.25 is the wrong quantity.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, practical: 3, question: { unit: "g/°C" } },
  ),
  heat(
    "10(b)",
    ["9.28C"],
    "Evaluate three proposed changes",
    "The class compares fuel burned for the same water temperature rise. It proposes: (i) a draught shield with adequate air supply; (ii) a polystyrene cup directly above the flame; (iii) equal burn times despite unequal temperature rises. Evaluate all three proposals for transfer efficiency and a fair comparison.",
    "A suitable draught shield can reduce heat lost to moving air while retaining adequate oxygen for combustion. A polystyrene cup directly above a flame is unsuitable because it can soften/melt/burn; use a suitable heat-resistant metal calorimeter rather than this replacement. Equal burn times do not ensure the same temperature rise, so they do not preserve the stated comparison. Keep water mass, initial temperature, burner-to-container distance/wick geometry matched and stop at the same chosen temperature rise for each fuel.",
    3,
    [0, 0, 3],
    [
      [
        "Accepts an appropriate draught shield because it reduces heat loss while maintaining adequate combustion air.",
        1,
      ],
      [
        "Rejects polystyrene directly above the flame with a melting/burning/heat-resistance reason; a metal calorimeter is a suitable alternative.",
        1,
      ],
      [
        "Rejects fixed burn time for the stated fixed-temperature-rise goal and restores that goal with matched water mass and relevant geometry/starting conditions. Merely saying 'keep everything the same' is insufficient.",
        1,
      ],
    ],
    "written",
    { practical: 3 },
  ),
];

export const edexcelPaper2HigherFull: ExamPaper = {
  id: "edexcel-paper-2-higher-full",
  totalMarks: 100,
  minutes: 105,
  basis: {
    board: "Edexcel",
    qualification: "1CH0",
    component: "1CH0/2H",
    summary:
      "Pearson Higher Paper 2: common key concepts and Topics 6–9. Original evidence includes halogen electron transfer, independent tangent and energy-profile construction, unknown cracking products, two extended responses, monomer/acid/polyester construction, instrumental calibration, finite-chain water loss and critical practical/data evaluation.",
    specificationUrl:
      "https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-chemistry-spec.pdf",
    researchPath: "docs/board-mocks/edexcel-2h-basis.md",
  },
  parts: [
    ...groups,
    ...rates,
    ...energies,
    ...fuels,
    ...organics,
    ...polymers,
    ...ions,
    ...nanoparticles,
    ...atmosphere,
    ...calorimetry,
  ],
};

// Individually compared prior prompts/references; different supplied numeric
// cases retain separate identities. exposureIds also resolves reverse links.
const priorDisclosures: Record<string, string[]> = {
  "1(a)": ["g1-v1-p-explain"],
  "1(b)": ["g7-write-v1-p-displace"],
  "1(c)": ["chem-p1h-full-v1-08a"],
  "1(d)": ["chem-p1h-full-v1-08a"],
  "2(c)": ["tc-v1-p-heat-written"],
  "3(c)": ["profile-v1-p-definition"],
  "3(d)": ["bond-v1-d-a-explain", "chem-edx-p2f-full-v1-4e"],
  "4(a)": ["crude-oil-and-fractions-2"],
  "4(c)": ["pollution-v1-p-acid"],
  "4(d)": ["oil-v1-p-bitumen"],
  "5(a)": ["alc-v1-p-butanoic"],
  "5(b)": ["alc-v1-r-oxidation"],
  "5(c)": ["alc-v1-p-ferment-plan"],
  "6(c)": ["pol-v1-p-condensation"],
  "6(e)": [
    "natural-v1-r-dna-unit",
    "natural-v1-r-dna-types",
    "natural-v1-p-starch",
  ],
  "8(d)": ["np-size-v1-p-ranges"],
  "9(a)": ["early-atmosphere-v1-p-synthesis"],
  "9(b)": ["greenhouse-v1-p-mechanism"],
  "9(c)": ["alk-v1-r-co"],
  "9(d)": ["chem-edx-p2f-full-v1-6d"],
};
for (const part of edexcelPaper2HigherFull.parts) {
  if (priorDisclosures[part.number])
    part.question.exposureAliases = priorDisclosures[part.number];
  if (part.referenceConstruction && part.question.rubric)
    part.question.referenceResponse = part.question.explanation;
}
