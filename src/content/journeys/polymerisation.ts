import type { LearningTask as Task, LessonJourney as Journey } from "../types";
import { extendCondensationWriting } from "./condensation-writing";
import {
  additionRecords,
  reverseRecords,
  type FourGroups,
  type PolymerisationMode,
} from "../../lib/polymerisation";
const prefix = "pol-v1-";
function c(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  mode?: PolymerisationMode,
  record = "initial",
): Task {
  const options = [answer, ...Object.keys(errors)],
    offset = [...id].reduce((s, x) => s + x.charCodeAt(0), 0) % options.length;
  return {
    id: prefix + id,
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    ...(mode
      ? { model: { kind: "polymerisation", mode, record, instruction: title } }
      : {}),
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
  mode?: PolymerisationMode,
  record = "initial",
): Task {
  return {
    id: prefix + id,
    title,
    purpose: title,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    ...(mode
      ? { model: { kind: "polymerisation", mode, record, instruction: title } }
      : {}),
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
    id: prefix + id,
    title,
    purpose: title,
    prompt,
    answer,
    rubric,
    explanation: answer,
    hint,
  };
}
function draw(
  id: string,
  title: string,
  prompt: string,
  groups: FourGroups,
  polymer = false,
): Task {
  return {
    ...w(
      id,
      title,
      prompt,
      polymer
        ? "A separate C=C monomer with every original substituent on its original reacting carbon; no polymer brackets, n or continuation bonds."
        : "Two singly bonded backbone carbons, every supplied side group retained, single continuation bonds crossing both brackets and lower-case n outside at the lower right.",
      polymer
        ? [
            "Restore C=C between the two reacting carbons.",
            "Preserve all side groups and their carbon attachments; rotated/reversed equivalents are valid.",
            "No polymer brackets, n or continuation bonds on the separate monomer.",
          ]
        : [
            "Change the original C=C to a single C–C bond.",
            "Preserve every original side group on its reacting carbon; retain correct C4/H1/halogen1 valences.",
            "Show both single continuation bonds through brackets and lower-case n outside lower right.",
          ],
      "Trace the two original reacting carbons and keep their substituents.",
    ),
    polymerisationGiven: { groups, polymer },
    polymerisationDrawing: {
      kind: polymer ? "monomer" : "repeat",
      note: "The original supplied structure above stays fixed. Construct your requested response from blank attachments and bond/notation choices.",
    },
  };
}
function polyester(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  diolC: number,
  acidSpacerC: number,
): Task {
  return {
    ...w(
      id,
      title,
      prompt,
      answer,
      [
        "Both original spacers retained with their correct carbon counts.",
        "Both carboxyl carbons retained with separate C=O groups.",
        "Both alcohol-derived oxygen atoms retained as ester linking oxygens; no acid OH or terminal alcohol H in this end-omitted repeat.",
        "Single continuation bonds through both brackets and lower-case n outside lower right.",
      ],
      "Keep diol spacer carbons separate from acid spacer carbons and its two carboxyl carbons.",
    ),
    polyesterDrawing: {
      diolC,
      acidSpacerC,
      note: "Higher: construct a diol/diacid-derived repeat using the given CH2 spacer notation. No correct spacer or oxygen choices are prefilled.",
    },
  };
}
export const warmup: Task[] = [
  c(
    "w-double",
    "Recognise the reacting group",
    "Which supplied bond permits ordinary alkene addition polymerisation?",
    "C=C",
    {
      "C–C only": "A saturated alkane lacks the required alkene double bond.",
      "C–H only": "C–H is retained in the supplied alkene transformation.",
    },
    "The alkene C=C functional group reacts; the carbon skeleton and its side groups remain.",
    "Look for carbon–carbon unsaturation.",
  ),
  c(
    "w-carbon",
    "Recall carbon bonding",
    "How many covalent bond orders does a neutral carbon normally have in these displayed structures?",
    "Four",
    {
      Two: "A double bond contributes two, but carbon needs four in total.",
      Five: "Five exceeds the normal carbon valence in these examples.",
    },
    "Count a single bond as one and a double bond as two.",
    "Count bond orders rather than neighbouring atoms alone.",
  ),
];
export const refresher: Task[] = [
  c(
    "r-monomer",
    "Small molecule to long chain",
    "Which description distinguishes a monomer from its addition polymer?",
    "A small molecule joins with many others into a very large chain molecule",
    {
      "A monomer is an unchanged catalyst":
        "Its atoms become part of the polymer.",
      "The polymer must be a diamond-like network":
        "Ordinary addition polymer chains are large molecules, not automatically a three-dimensional covalent network.",
    },
    "Many separate monomer molecules become part of the same covalently bonded chain.",
    "Track what joins.",
  ),
  c(
    "r-double",
    "Find C=C",
    "In chloroethene, which functional group enables addition polymerisation?",
    "The carbon–carbon double bond",
    {
      "The chlorine alone":
        "C–Cl remains; it is not the reacting alkene group.",
      "The carbon–hydrogen bonds alone":
        "Those bonds are retained in the repeating unit.",
    },
    "Circle the C=C group when recognising the polymerising alkene.",
    "Separate the reacting group from a substituent.",
  ),
  c(
    "r-single",
    "Change the reacting bond",
    "What happens to C=C in the ordinary addition-polymer backbone?",
    "It becomes a C–C single bond",
    {
      "It stays C=C throughout the backbone":
        "That would leave insufficient valence for the two outward chain connections.",
      "Both carbon atoms disappear": "They remain as backbone atoms.",
    },
    "Each former alkene carbon forms one new outward single bond to an adjacent unit.",
    "Keep four bond orders at each carbon.",
  ),
  c(
    "r-groups",
    "Preserve substituents",
    "When propene forms poly(propene), what happens to its CH3 group?",
    "It remains a side group on the same original reacting carbon",
    {
      "It leaves as methane":
        "No small molecule is eliminated in addition polymerisation.",
      "Its carbon must become a third backbone carbon per unit":
        "The two reacting C=C carbons become the backbone pair.",
    },
    "The C3H6 inventory is retained; two C are in the backbone and one in the methyl substituent.",
    "Trace the atoms rather than changing the formula.",
  ),
  c(
    "r-outward",
    "Keep carbon valence",
    "After C=C becomes C–C, how many new outward chain bonds does EACH original alkene carbon form?",
    "One",
    {
      Two: "Two extra outward bonds per carbon would exceed carbon valence.",
      None: "The monomer-derived units must connect to neighbouring units.",
    },
    "One outward bond per carbon means two outward bonds for the two-carbon repeat altogether.",
    "Distinguish each carbon from each two-carbon unit.",
  ),
  c(
    "r-halogen",
    "Retain halogens",
    "In the supplied tetrafluoroethene-to-PTFE transformation, what leaves as a small product?",
    "Nothing: all four F atoms remain in the repeat",
    {
      "Four fluorine atoms": "That loses atoms from the addition product.",
      "Hydrogen fluoride":
        "No H is present in this supplied monomer, and addition eliminates no small molecule.",
    },
    "A C2F4 repeat has the same atoms as the C2F4 monomer.",
    "Check both atom identity and reaction type.",
  ),
  c(
    "r-brackets",
    "Read a repeat",
    "What do outward bonds passing through repeat brackets mean?",
    "The covalent chain continues beyond the shown unit",
    {
      "Extra H atoms must cap both ends":
        "The brackets represent a repeating contribution, not a completed small alkane.",
      "The unit is disconnected from its neighbours":
        "The continuation bonds mean the opposite.",
    },
    "Single bonds through both brackets connect repeated contributions.",
    "A crop is not a complete molecule.",
  ),
  c(
    "r-n",
    "Use repeat notation",
    "Which notation convention is appropriate for an addition-polymer repeat?",
    "Lower-case n outside the brackets at the lower right",
    {
      "Upper-case N inside the unit":
        "N is also the element symbol for nitrogen and is not the specified repeat-count convention.",
      "A number written as an extra atom":
        "The repeat count is notation, not another atom.",
    },
    "The brackets enclose the unit; n indicates many repetitions.",
    "Keep count notation separate from the atomic structure.",
  ),
  c(
    "r-reverse",
    "Recover a monomer",
    "What change reconstructs a separate alkene from an addition-polymer-derived two-carbon repeat?",
    "Restore C=C and retain its original side groups",
    {
      "Delete halogens and add H": "That changes the original atom inventory.",
      "Keep both continuation bonds and n":
        "Those belong to the polymer representation, not the separate monomer.",
    },
    "Remove polymer notation and continuation bonds; restore the alkene double bond.",
    "Trace the same pair of carbons in reverse.",
  ),
  c(
    "r-name",
    "Name poly(propene)",
    "Which name follows from addition polymerisation of propene?",
    "Poly(propene)",
    {
      "Poly(propane)":
        "The monomer was propene; changing the ending changes its identity.",
      Propane: "This names a small alkane, not the polymer.",
    },
    "Use poly followed by the unchanged monomer name in parentheses.",
    "Keep the monomer name.",
  ),
  c(
    "r-inventory",
    "Keep all atoms",
    "Which comparison is true for an ordinary addition monomer and its monomer-derived repeat?",
    "They contain the same atoms",
    {
      "The repeat always loses H2O":
        "That is not ordinary addition polymerisation.",
      "The repeat always gains two terminal H":
        "Repeat ends indicate continuation, not capping atoms.",
    },
    "No other molecule is formed in addition polymerisation.",
    "Compare repeat contributions, not hypothetical chain end groups.",
  ),
  n(
    "r-mass",
    "Multiply a repeat contribution",
    "A supplied C2H4 repeat contribution has relative mass 28. What is the contribution from three such units, ignoring omitted ends?",
    "84",
    "relative-mass contribution",
    "3 × 28 = 84; this is a stated repeat contribution, not an exact whole-chain Mr.",
    "Multiply the supplied per-unit contribution by three.",
  ),
  c(
    "r-forces",
    "Separate melting from polymerisation",
    "In a supplied thermoplastic melting comparison, what changes without cutting its polymer backbone?",
    "Intermolecular attractions are overcome while chain covalent bonds remain",
    {
      "Every chain bond must break":
        "That describes a chemical change, not this intact-chain physical change.",
      "No forces matter":
        "Energy is needed to overcome attractions between the molecules.",
    },
    "Polymerisation forms covalent chain connections; this melting comparison separates intact molecules.",
    "Distinguish within-chain from between-chain bonding.",
  ),
  c(
    "r-functional",
    "Higher: two reactive groups",
    "Why can the supplied diol and diacid continue forming a polyester chain?",
    "Each molecule has two reactive functional groups",
    {
      "Their names both contain carbon":
        "Carbon alone does not provide the two functional groups.",
      "Any alcohol with one OH must form an indefinitely alternating chain":
        "A monofunctional reagent cannot continue the chain in both directions.",
    },
    "Two reactive ends permit repeated ester-link formation.",
    "Count the actual functional groups.",
  ),
  c(
    "r-water",
    "Higher: form one small molecule",
    "In a supplied diacid/diol ester link, which fragments form water?",
    "Acid OH plus the H bonded to alcohol oxygen",
    {
      "The entire acid COOH plus the entire alcohol OH":
        "That would remove the carbonyl carbon and linking oxygen.",
      "Both carbonyl oxygens": "Carbonyl O is retained in the polyester.",
    },
    "The alcohol oxygen remains in the ester link; the acid OH and alcohol H form H2O.",
    "Track O and H individually.",
  ),
  n(
    "r-spacer",
    "Higher: include the carboxyl carbons",
    "HOOC–CH2–CH2–CH2–CH2–COOH has how many C atoms?",
    "6",
    "C atoms",
    "Four CH2 spacer carbons plus two carboxyl carbons give six.",
    "Each COOH also contains a carbon.",
  ),
  n(
    "r-links",
    "Higher: count a finite open chain",
    "Five supplied monomer-derived nodes form ONE open, unbranched chain. Each connecting condensation link releases one water. How many waters form?",
    "4",
    "water molecules",
    "A five-node open chain has four actual links. End groups are retained in this finite model.",
    "Count the connections between nodes.",
  ),
  n(
    "r-symbolic",
    "Higher: read the end-omitted repeat equation",
    "A standard idealised polyester repeat equation omits end groups and states two water losses PER repeat contribution. For n = 3 contributions, how many waters does THAT representation show?",
    "6",
    "water molecules",
    "The specified idealised representation shows 2n = 6 H2O. This is distinct from counting actual links in a finite open-chain diagram.",
    "Use the stated two-per-repeat convention; do not change its scope.",
  ),
];
refresher.push(
  c(
    "r-properties",
    "Link structure to different properties",
    "Which statement explains why polymers can have different properties despite each having covalent chain bonds?",
    "Their chain structures and attractions between chains can differ",
    {
      "Every polymer must have identical properties":
        "Different monomers and chain arrangements can produce different behaviour.",
      "No polymer has intermolecular attractions":
        "Large separate chain molecules can interact with one another.",
    },
    "Covalent bonding within chains alone does not specify every bulk property. Use the actual chain structure and supplied material evidence.",
    "Distinguish the shared bond type from the full molecular structure.",
  ),
);
export const guided: Task[] = [
  c(
    "g-addition",
    "Build a repeat",
    "Build the ethene repeat. Which bond joins its two backbone carbons?",
    "Single C–C",
    {
      "Double C=C":
        "A retained double plus both outward bonds overfills carbon valence.",
      "No bond": "The two backbone carbons must remain covalently joined.",
    },
    "Keep all four H; replace C=C by C–C and show chain continuation through both brackets.",
    "Count bond orders at each carbon.",
    "addition",
  ),
  c(
    "g-reverse",
    "Reconstruct the alkene",
    "After reversing the supplied chlorine-containing repeat, what distinguishes the separate monomer?",
    "C=C with original side groups and no repeat notation",
    {
      "C–C with polymer brackets":
        "That is still the polymer-derived representation.",
      "A chlorine-free molecule with two extra H":
        "That changes the original substituents.",
    },
    "Restore the reacting double bond and retain three H and one Cl on their original carbons.",
    "Keep the original attachment pattern.",
    "reverse",
  ),
  n(
    "g-segment",
    "Select one monomer-derived repeat",
    "In the supplied poly(propene) crop, how many TOTAL C atoms belong to one two-backbone-carbon monomer-derived repeat?",
    "3",
    "C atoms",
    "Two backbone carbons plus one methyl side-group carbon give three.",
    "Count side groups as well as the selected backbone.",
    "segment",
  ),
  n(
    "g-inventory",
    "Audit five repeat contributions",
    "Five original ethene-derived contributions contain how many H atoms, ignoring omitted chain ends?",
    "20",
    "H atoms",
    "5 × 4 = 20 H atoms. No H2 or H2O is eliminated.",
    "Use the original per-unit inventory.",
    "inventory",
  ),
  c(
    "g-ester",
    "Higher: explain repeated ester growth",
    "Use the original diacid/diol evidence. What permits continued alternating chain growth?",
    "Two reactive groups on each supplied monomer",
    {
      "A gas bubble proves it":
        "This structural requirement is not established by bubbles.",
      "One reactive group on every molecule is enough":
        "That limits further alternating growth.",
    },
    "Each ester link uses acid OH and alcohol H; the remaining reactive end can join another monomer.",
    "Count functional groups on each original molecule.",
    "ester",
  ),
  n(
    "g-polyester",
    "Higher: construct the actual repeat",
    "The supplied diol has two CH2 carbons and the diacid has two CH2 spacer carbons plus two COOH carbons. How many C atoms remain in one complete end-omitted repeat?",
    "6",
    "C atoms",
    "2 + 2 + 2 = 6 C atoms; water loss removes no carbon.",
    "Keep both carboxyl carbons.",
    "polyester",
  ),
  n(
    "g-links",
    "Higher: count actual links",
    "In the supplied six-node ONE open chain, each drawn condensation link releases one water. How many waters have formed?",
    "5",
    "water molecules",
    "Six connected nodes have five actual links. This is the specified finite open diagram.",
    "Count drawn links, not monomers.",
    "links",
  ),
];
export const practice: Task[] = [
  draw(
    "p-ethene",
    "Construct poly(ethene)",
    "Draw one monomer-derived repeat from the supplied ethene, including bonds through brackets and n.",
    additionRecords.initial.groups,
  ),
  draw(
    "p-propene",
    "Keep the methyl side group",
    "Draw one monomer-derived repeat from the supplied propene. Keep the methyl carbon off the two-carbon backbone.",
    additionRecords.propene.groups,
  ),
  draw(
    "p-chloro",
    "Keep the chlorine attachment",
    "Draw one monomer-derived repeat from the supplied chloroethene. Do not replace Cl with H.",
    additionRecords.chloro.groups,
  ),
  draw(
    "p-fluoro",
    "Construct the fluorinated repeat",
    "Draw one monomer-derived repeat from the supplied tetrafluoroethene. Show every original F.",
    additionRecords.fluoro.groups,
  ),
  draw(
    "p-but1",
    "Deduce a supplied unfamiliar repeat",
    "The supplied alkene has an ethyl side group. Draw its monomer-derived addition repeat; no name recall is required.",
    additionRecords.but1.groups,
  ),
  draw(
    "p-but2",
    "Retain two methyl attachments",
    "Draw the addition repeat from the supplied alkene with one CH3 on EACH reacting carbon.",
    additionRecords.but2.groups,
  ),
  draw(
    "p-cl11",
    "Retain both chlorines on one carbon",
    "Draw the addition repeat from the supplied alkene whose two Cl are on the SAME reacting carbon.",
    additionRecords.dichloro11.groups,
  ),
  draw(
    "p-cl12",
    "Retain one chlorine on each carbon",
    "Draw the addition repeat from the supplied alkene with one Cl on EACH reacting carbon.",
    additionRecords.dichloro12.groups,
  ),
  draw(
    "p-reverse-cl",
    "Recover a chlorine-containing monomer",
    "Draw the separate alkene monomer from the supplied chlorine-containing polymer-derived repeating unit.",
    reverseRecords.initial.groups,
    true,
  ),
  draw(
    "p-reverse-fl",
    "Recover a fluorinated monomer",
    "Draw the separate alkene monomer from the supplied fluorinated polymer-derived repeating unit.",
    reverseRecords.fluoro.groups,
    true,
  ),
  draw(
    "p-reverse-but1",
    "Reverse an unfamiliar supplied repeat",
    "Draw the separate alkene from the supplied ethyl-substituted repeating unit; retain the original ethyl side group.",
    reverseRecords.but1.groups,
    true,
  ),
  draw(
    "p-reverse-cl12",
    "Reverse without rearranging chlorine",
    "Draw the separate alkene from the supplied repeat with one Cl on each backbone carbon.",
    reverseRecords.dichloro12.groups,
    true,
  ),
  c(
    "p-bond",
    "Repair the retained double bond",
    "A proposed addition repeat retains C=C AND has outward single continuation bonds from both reacting carbons. What repair preserves the original atoms?",
    "Change that C=C to C–C",
    {
      "Delete one H from each carbon":
        "That would change the original addition inventory.",
      "Remove both continuation bonds permanently":
        "That leaves a monomer rather than the requested linked repeat.",
    },
    "One bond order is freed at each alkene carbon when C=C becomes C–C; each carbon forms one outward chain bond.",
    "Audit local carbon valence.",
  ),
  c(
    "p-connectivity",
    "Reject a same-formula rearrangement",
    "The original repeat alternates CH2 and CCl2. A student draws CHCl and CHCl instead. Which judgement follows?",
    "Wrong connectivity despite the same atom totals",
    {
      "Correct because C2H2Cl2 totals agree":
        "The two original Cl were attached to one carbon, not one each.",
      "Only the lower-case n is wrong":
        "The substituent attachment pattern itself changed.",
    },
    "Addition retains substituents on their original reacting carbons. Formula equality alone cannot verify this structure.",
    "Trace which carbon each chlorine belongs to.",
  ),
  c(
    "p-equivalent",
    "Accept a reversed repeating unit",
    "The same propene-derived repeat is written –CH2–CH(CH3)– or –CH(CH3)–CH2– with correct brackets/continuations. Which judgement follows?",
    "Equivalent reversed/shifted repeat representations",
    {
      "The second must lose its CH3": "Its side group is unchanged.",
      "Only one direction is chemically valid":
        "Orientation on the page does not define a different connectivity here.",
    },
    "Either phase represents the same alternating two-carbon backbone pattern.",
    "Follow the pattern beyond the brackets.",
  ),
  c(
    "p-n",
    "Repair repeat-count notation",
    "A correct repeat has single continuation bonds through brackets but an uppercase N at the lower right. What is the specified repair?",
    "Use lower-case n outside at the lower right",
    {
      "Change a carbon to nitrogen":
        "N here was incorrect count notation, not an intended atom.",
      "Put lower-case n in place of a hydrogen":
        "The count must remain outside the structural unit.",
    },
    "Use the conventional lower-case repeat count outside brackets.",
    "Keep atoms separate from notation.",
  ),
  c(
    "p-end",
    "Avoid inventing chain ends",
    "A repeat crop shows –CH2–CH2– with outward bonds through both brackets. Which interpretation is justified?",
    "An end-omitted contribution continuing into a longer chain",
    {
      "A complete C2H6 molecule with two added H":
        "The outward bonds are chain continuations, not end caps.",
      "Two disconnected carbon atoms": "The carbons are covalently connected.",
    },
    "The repeat inventory is C2H4; the complete polymer end groups are not specified.",
    "Read the bonds through the brackets.",
  ),
  c(
    "p-monomer-unit",
    "Respect the stated representation",
    "A task explicitly asks for the unit derived from ONE supplied ethene monomer. Which backbone contribution meets that instruction?",
    "Two carbons with four H",
    {
      "One CH2 group is always chemically impossible":
        "A smaller CH2 translational motif can describe poly(ethene), but is not the stated one-monomer-derived representation.",
      "Four carbons from two monomers":
        "That is a larger repeated block, not the requested one-monomer contribution.",
    },
    "The instruction requests C2H4 from one C2H4 monomer; distinguish representation scope from chemical impossibility.",
    "Read what the stated unit represents.",
  ),
  c(
    "p-name",
    "Name the addition product",
    "What is the ordinary addition-polymer name formed from propene?",
    "Poly(propene)",
    {
      "Poly(propane)": "The monomer name remains propene.",
      Ethene: "That is a different small alkene.",
    },
    "Poly plus the unchanged monomer name gives poly(propene).",
    "Retain the monomer ending.",
  ),
  n(
    "p-C",
    "Count methyl-containing contributions",
    "Seven propene-derived C3H6 contributions contain how many C atoms, ignoring omitted chain ends?",
    "21",
    "C atoms",
    "7 × 3 = 21, including the methyl side-group carbons.",
    "Count all carbons in each contribution.",
  ),
  n(
    "p-H",
    "Avoid adding absent hydrogen",
    "Four supplied C2F4 repeat contributions contain how many H atoms?",
    "0",
    "H atoms",
    "The supplied monomer contains no H; addition does not add it.",
    "Read the actual original formula.",
  ),
  n(
    "p-Cl",
    "Conserve chlorine atoms",
    "Five chloroethene-derived C2H3Cl contributions contain how many Cl atoms?",
    "5",
    "Cl atoms",
    "5 × 1 = 5 Cl; no HCl is lost in this addition reaction.",
    "Keep each original chlorine.",
  ),
  n(
    "p-Mr",
    "Calculate a contribution",
    "A supplied ethene-derived contribution has relative mass 28. What is the contribution from eight units, excluding omitted ends?",
    "224",
    "relative-mass contribution",
    "8 × 28 = 224. A precise full-chain Mr would require its actual end groups.",
    "Multiply the supplied per-unit contribution.",
  ),
  n(
    "p-mass",
    "Conserve an addition feed",
    "An original closed-process report states that 12.0 g of monomer is entirely incorporated into its addition polymer, with no other product and no material loss. What mass of polymer is produced?",
    "12",
    "g",
    "Mass is conserved: all 12.0 g is incorporated under the explicitly stated conditions.",
    "Use the stated complete conversion and absence of losses.",
  ),
  n(
    "p-units",
    "Count units from the backbone",
    "An original crop contains 18 BACKBONE carbons from a two-backbone-carbon alkene monomer. How many monomer-derived contributions are shown?",
    "9",
    "contributions",
    "18 ÷ 2 = 9. Side-group carbons would not belong in this stated backbone count.",
    "Use two backbone carbons per contribution.",
  ),
  c(
    "p-molecules",
    "Distinguish atom and molecule counts",
    "A supplied idealised report joins 200 separate alkene molecules into ONE chain, with no other product. Which counts are conserved?",
    "Atoms and total mass; the number of separate molecules changes",
    {
      "All 200 separate molecules remain disconnected":
        "The stated process joins them into one chain.",
      "Carbon atoms are destroyed to reduce molecule count":
        "Joining changes connectivity, not atom inventory.",
    },
    "200 original monomer molecules become part of one large chain while their atoms remain.",
    "Distinguish molecules from atoms.",
  ),
  c(
    "p-bromine",
    "Use the supplied saturated-chain comparison",
    "The supplied addition-polymer backbone and side groups contain no C=C bonds. What bromine-water observation follows from this specified comparison?",
    "It stays orange",
    {
      "It becomes colourless merely because the molecule is large":
        "Size alone does not provide a reacting C=C group.",
      "Every polymer must contain C=C":
        "The supplied ordinary addition repeat is saturated.",
    },
    "The original alkene can decolourise bromine water; the specified saturated chain has no reacting C=C. This is not a universal statement about every possible polymer.",
    "Use the actual supplied bond types.",
  ),
  w(
    "p-melt",
    "Explain physical versus chemical change",
    "A supplied thermoplastic softens on heating without cutting its chains. Compare that change with forming the polymer from monomers.",
    "Polymerisation changes covalent connectivity between monomer-derived units and is chemical. In the supplied softening/melting process, intermolecular attractions between intact chain molecules are overcome; strong covalent bonds within each chain remain.",
    [
      "Polymerisation joins units covalently and changes molecular identity.",
      "The stated physical change leaves the covalent backbone intact.",
      "Between-chain attractions, rather than breaking every backbone bond, explain this softening.",
    ],
    "Distinguish within-chain and between-chain bonding.",
  ),
  c(
    "p-use",
    "Choose from original material evidence",
    "An original material table gives A: flexible, water-resistant, shock-absorbing; B: rigid, water-absorbing; C: brittle, water-resistant. Which has the best supported combination for a flexible trainer insole that must resist water and cushion impacts?",
    "A",
    {
      B: "Its supplied rigidity/water absorption fail the stated requirements.",
      C: "Its supplied brittleness fails flexibility and cushioning.",
    },
    "A meets the specifically stated combination. This is a decision from supplied evidence, not a claim that every formulation of one polymer has identical properties.",
    "Compare every stated requirement.",
  ),
  c(
    "p-water",
    "Higher: preserve the ester oxygen",
    "When the supplied diacid and diol form one ester link, which fragment pair makes water?",
    "Acid OH and alcohol H",
    {
      "Acid carbonyl O and alcohol O":
        "Both of these O atoms are retained in the ester-containing structure.",
      "Both whole functional groups":
        "Removing both whole groups would lose the carbonyl carbon and linking O.",
    },
    "The alcohol O stays in the link and the acid OH leaves with alcohol H as H2O.",
    "Account for the oxygen that remains.",
  ),
  c(
    "p-stopper",
    "Higher: identify a growth limit",
    "The only supplied reagents are a diacid and ethanol with ONE OH group. What is justified?",
    "Ester formation is possible, but these reagents alone do not give an indefinitely alternating polyester chain",
    {
      "Every ester reaction necessarily gives a long polymer":
        "The monofunctional ethanol cannot continue the alternating chain at a second end.",
      "No ester can form at all":
        "A carboxylic acid can react with an alcohol group.",
    },
    "Polymer growth needs continuing reactive groups, not merely one successful ester reaction.",
    "Count reactive groups on each monomer.",
  ),
  polyester(
    "p-polyester1",
    "Higher: construct the two-carbon/two-carbon repeat",
    "Original diol: HO–CH2–CH2–OH. Original diacid: HOOC–CH2–CH2–COOH. Construct one end-omitted polyester repeat.",
    "[–O–CH2–CH2–O–C(=O)–CH2–CH2–C(=O)–]n; both spacers, both carbonyls and both alcohol-derived linking O atoms remain.",
    2,
    2,
  ),
  polyester(
    "p-polyester2",
    "Higher: preserve unequal spacer lengths",
    "Original diol: HO–CH2–CH2–CH2–OH. Original diacid: HOOC–CH2–COOH. Construct one end-omitted polyester repeat.",
    "[–O–CH2–CH2–CH2–O–C(=O)–CH2–C(=O)–]n; the diol spacer has three C and the acid spacer one, with two additional carboxyl C.",
    3,
    1,
  ),
  polyester(
    "p-polyester3",
    "Higher: retain the longer acid spacer",
    "Original diol: HO–CH2–CH2–OH. Original diacid: HOOC–CH2–CH2–CH2–CH2–COOH. Construct one end-omitted polyester repeat.",
    "[–O–CH2–CH2–O–C(=O)–CH2–CH2–CH2–CH2–C(=O)–]n; four acid spacer carbons plus two carboxyl carbons and two diol carbons.",
    2,
    4,
  ),
  n(
    "p-poly-C",
    "Higher: audit repeat carbon",
    "A supplied polyester contribution contains two diol spacer C, four diacid spacer C and both carboxyl C. How many C atoms remain?",
    "8",
    "C atoms",
    "2 + 4 + 2 = 8. Water formation removes no carbon.",
    "Count the carbon in each original COOH.",
  ),
  n(
    "p-poly-O",
    "Higher: audit repeat oxygen",
    "A supplied end-omitted diol/diacid-derived polyester contribution retains two carbonyl O and two alcohol-derived linking O. How many O atoms does this contribution contain?",
    "4",
    "O atoms",
    "2 carbonyl O + 2 linking O = 4. This stated repeat inventory omits the separate finite-chain end groups.",
    "Do not delete the alcohol linking oxygens.",
  ),
  n(
    "p-open",
    "Higher: count ten monomers in ONE open chain",
    "Five diol and five diacid molecules form ONE finite open chain with all ten monomer-derived nodes connected. Each actual ester link releases one water. How many waters have formed?",
    "9",
    "water molecules",
    "Ten connected nodes in one open chain have nine links. This diagram retains its terminal functional groups.",
    "Count actual finite connections, not a different end-omitted repeat equation.",
  ),
  n(
    "p-twochains",
    "Higher: distinguish two chains",
    "Eight supplied monomer-derived nodes form TWO separate open chains. Each actual condensation link releases one water. How many waters form?",
    "6",
    "water molecules",
    "8 nodes − 2 connected open-chain components = 6 links and six waters.",
    "Count components as well as nodes.",
  ),
  n(
    "p-symbolic",
    "Higher: use the specified repeat equation",
    "An idealised end-omitted polyester equation specifies two water losses per repeating contribution. For n = 20, how many waters does this representation show?",
    "40",
    "water molecules",
    "2n = 40 in the explicitly stated repeat-equation convention. A finite open-chain diagram would require its actual links and end groups.",
    "Use the given two-per-repeat representation.",
  ),
  w(
    "p-condensation",
    "Higher: explain why this is condensation",
    "For the supplied diol/diacid polyester, explain the role of two functional groups, an ester link and water formation.",
    "Both monomers have two reactive functional groups, allowing repeated chain growth. Acid OH and the H on alcohol O form water at each ester link. Alcohol O and acid carbonyl C/O remain in the polyester link. The small-molecule loss distinguishes this condensation from ordinary alkene addition.",
    [
      "Two reacting ends on each supplied diol/diacid enable repeated growth.",
      "Each link is an ester linkage.",
      "The actual acid OH/alcohol H form water, while the alcohol linking O and carbonyl atoms remain.",
      "Ordinary addition retains the monomer atom inventory without a small-molecule by-product.",
    ],
    "Explain the actual atoms at a single link before describing continued growth.",
  ),
];
practice.push(
  c(
    "p-properties",
    "Reject identical-property reasoning",
    "A student says all polymers have the same properties because each has strong covalent bonds. Which correction is supported?",
    "Their different chain structures and between-chain interactions can give different properties",
    {
      "Strong covalent bonds prove identical flexibility":
        "The full molecular structure and interactions matter.",
      "All polymer chains must be diamond-like networks":
        "Many polymers consist of large separate chain molecules.",
    },
    "Different chain structures can give different material behaviour. Decide a use from supplied properties, not the word polymer alone.",
    "Keep within-chain bonds separate from whole-material behaviour.",
  ),
);
export const checkForms: Task[][] = [
  [
    draw(
      "a-draw",
      "Independent forward construction",
      "Construct one monomer-derived addition repeat from the original supplied alkene, retaining every side group.",
      ["H", "Cl", "H", "CH3"],
    ),
    draw(
      "a-reverse",
      "Independent reverse deduction",
      "Construct the separate alkene monomer from the original supplied repeating unit.",
      ["H", "Cl", "H", "Cl"],
      true,
    ),
    c(
      "a-products",
      "Independent product distinction",
      "An ordinary alkene addition polymerisation is specified. Which product statement is justified?",
      "The polymer forms without a small-molecule by-product",
      {
        "Polymer and water necessarily form":
          "That imports condensation into the stated addition reaction.",
        "Hydrogen chloride necessarily forms":
          "The addition inventory is retained, including any original halogens.",
      },
      "Ordinary addition joins monomers without eliminating a small molecule.",
      "Use the specified reaction type.",
    ),
    n(
      "a-Cl",
      "Independent chlorine inventory",
      "Eight supplied C2H3Cl contributions contain how many Cl atoms, ignoring omitted ends?",
      "8",
      "Cl atoms",
      "8 × 1 = 8 Cl. All original chlorine is retained.",
      "Use the original repeat contribution.",
    ),
    n(
      "a-C",
      "Independent side-group accounting",
      "Five supplied propene-derived C3H6 contributions contain how many TOTAL C atoms?",
      "15",
      "C atoms",
      "5 × 3 = 15 C, including the methyl side groups.",
      "Do not count backbone carbons alone.",
    ),
    c(
      "a-n",
      "Independent continuation notation",
      "Which description completes the representation of a connected repeating unit?",
      "Single bonds through both brackets, with lower-case n outside lower right",
      {
        "Two extra H instead of continuation bonds":
          "That caps a small molecule instead of showing repetition.",
        "A retained C=C and no outward bonds":
          "That represents the alkene monomer.",
      },
      "Brackets and n describe repeating contributions; continuation bonds connect them.",
      "Read what continues beyond the brackets.",
    ),
    c(
      "a-name",
      "Independent polymer naming",
      "Which addition-polymer name keeps the supplied propene monomer identity?",
      "Poly(propene)",
      {
        "Poly(propane)": "Propane is a different monomer identity.",
        "Poly(ethene)": "That belongs to ethene rather than propene.",
      },
      "The unchanged monomer name is placed after poly.",
      "Keep the supplied name.",
    ),
    w(
      "a-explain",
      "Independent chemical-change explanation",
      "An original diagram shows separate alkene molecules before and one covalently connected chain after. Explain why this is chemical, despite conservation of atoms.",
      "The monomers gain covalent connections into a new very large chain molecule, changing molecular identity. Their original C=C bonds become C–C backbone bonds while the side groups and atoms are retained. Conserving atoms does not make a change physical.",
      [
        "New covalent connectivity joins monomer-derived units.",
        "The alkene double becomes a single backbone bond while outward chain bonds form.",
        "Atoms/side groups remain, but molecular identities change.",
      ],
      "Distinguish atom conservation from molecular identity.",
    ),
  ],
  [
    draw(
      "b-draw",
      "Independent substituted addition",
      "Construct one monomer-derived addition repeat from the original supplied fluorine-containing alkene.",
      ["H", "F", "H", "F"],
    ),
    draw(
      "b-reverse",
      "Independent unfamiliar reverse deduction",
      "Construct the separate alkene from the original supplied ethyl-substituted repeating unit.",
      ["H", "H", "H", "C2H5"],
      true,
    ),
    c(
      "b-bond",
      "Independent bond and valence check",
      "A correct original alkene is converted to an ordinary connected addition repeat. Which change provides one outward bonding position on EACH reacting carbon?",
      "C=C becomes C–C",
      {
        "Each carbon gains two new outward bonds without changing C=C":
          "That exceeds the normal carbon valence.",
        "Every side group is deleted":
          "That loses the original addition inventory.",
      },
      "The reduction from double to single frees one bond order on each reacting carbon.",
      "Count four bond orders per carbon.",
    ),
    n(
      "b-Mr",
      "Independent repeat contribution",
      "A supplied repeat contribution has relative mass 42. What is the contribution from six units, ignoring omitted ends?",
      "252",
      "relative-mass contribution",
      "6 × 42 = 252. End groups are not included.",
      "Multiply the stated contribution.",
    ),
    n(
      "b-units",
      "Independent backbone-to-unit conversion",
      "A supplied alkene-derived crop contains 14 backbone C atoms, with two backbone C per monomer-derived contribution. How many contributions are shown?",
      "7",
      "contributions",
      "14 ÷ 2 = 7. Side groups do not alter the stated two-carbon backbone contribution.",
      "Count backbone pairs.",
    ),
    c(
      "b-connectivity",
      "Independent connectivity comparison",
      "The original repeat has both Cl atoms on ONE backbone carbon. A proposed repeat puts one Cl on EACH. Which judgement follows?",
      "Atom totals match but the original connectivity was changed",
      {
        "Always correct because the formula agrees":
          "Connectivity, not formula alone, must be retained.",
        "Only the displayed direction changed":
          "Distributing two Cl across both carbons changes their attachments.",
      },
      "A reversed/rotated drawing can be equivalent; rearranged chlorine attachments are not.",
      "Trace each Cl to its carbon.",
    ),
    c(
      "b-product",
      "Independent absence of a by-product",
      "For the stated ordinary addition transformation of a chlorine-containing alkene, what happens to its original Cl?",
      "It remains in the polymer-derived repeat",
      {
        "It must leave as HCl": "That is not ordinary addition polymerisation.",
        "It is replaced with F":
          "No supplied reagent or reaction justifies that substitution.",
      },
      "Original substituents are retained during this addition transformation.",
      "Use the original atom inventory.",
    ),
    w(
      "b-explain",
      "Independent physical-change comparison",
      "A supplied thermoplastic melts while its chains remain intact. Explain why cutting the covalent backbone would be a different change.",
      "The stated melting overcomes attractions between intact chain molecules and is physical. Cutting the covalent backbone breaks within-chain bonds and changes molecular identity, so it is chemical. Strong covalent backbone bonds do not all break in the stated melt.",
      [
        "Physical melting separates intact chain molecules by overcoming intermolecular forces.",
        "The covalent backbone remains intact in the specified physical change.",
        "Cutting covalent chain bonds changes molecular identity and is chemical.",
      ],
      "Separate between-chain forces from within-chain bonds.",
    ),
  ],
];
export const reviewForms: Task[][] = [
  [
    c(
      "ra-bond",
      "Delayed bond retrieval",
      "For ordinary addition polymerisation of the supplied alkene, what happens to its reacting C=C?",
      "It becomes C–C, with one outward chain bond per reacting carbon",
      {
        "It stays C=C and each carbon gains two outward bonds":
          "That exceeds normal carbon valence.",
        "Both reacting carbons leave the polymer":
          "Those carbons form the backbone.",
      },
      "The backbone pair and all its side groups are retained.",
      "Count bond orders at each carbon.",
    ),
    n(
      "ra-Cl",
      "Delayed halogen accounting",
      "Four supplied C2H3Cl repeat contributions contain how many Cl atoms?",
      "4",
      "Cl atoms",
      "Four contributions retain four Cl.",
      "One Cl per original contribution.",
    ),
    c(
      "ra-n",
      "Delayed repeat notation",
      "What does lower-case n outside repeat brackets represent?",
      "Many covalently joined repeating contributions",
      {
        "A nitrogen atom added to the unit":
          "The lower-case n is count notation, not element N.",
        "Two terminal hydrogen atoms":
          "No end-group structure is specified by n.",
      },
      "The outward bonds and brackets show continuing repetition.",
      "Read count notation separately from atoms.",
    ),
  ],
  [
    c(
      "rb-reverse",
      "Delayed reverse reasoning",
      "Recovering an alkene from an addition-polymer-derived repeat requires which change?",
      "Restore C=C while retaining the original side groups",
      {
        "Remove chlorine before changing the backbone":
          "That changes the original inventory.",
        "Keep n and both continuation bonds on the separate molecule":
          "Those are polymer notation.",
      },
      "A separate monomer has the reacting double bond and its original substituents.",
      "Reverse the transformation without rearranging atoms.",
    ),
    n(
      "rb-C",
      "Delayed methyl-carbon accounting",
      "Four propene-derived C3H6 contributions contain how many TOTAL C atoms?",
      "12",
      "C atoms",
      "Four times three gives twelve, including side-group carbon.",
      "Count every original carbon.",
    ),
    c(
      "rb-change",
      "Delayed chemical-change reasoning",
      "Joining monomers covalently into a polymer is chemical because…",
      "Covalent connectivity and molecular identity change",
      {
        "Atoms are destroyed": "Atoms are conserved in the reaction.",
        "Only intermolecular attractions are overcome":
          "That would describe a physical separation of intact molecules.",
      },
      "The original small molecules become part of a new large chain molecule.",
      "Follow covalent connectivity.",
    ),
  ],
];
export const polymerisationRecovery: Record<string, string[]> = {};
const recoveryGroups: [string[], string[]][] = [
  [
    [
      "p-ethene",
      "p-propene",
      "p-chloro",
      "p-fluoro",
      "p-but1",
      "p-but2",
      "p-cl11",
      "p-cl12",
    ],
    ["r-single", "r-groups", "g-addition"],
  ],
  [
    ["p-reverse-cl", "p-reverse-fl", "p-reverse-but1", "p-reverse-cl12"],
    ["r-reverse", "g-reverse"],
  ],
  [["p-bond"], ["r-outward", "g-addition"]],
  [
    ["p-connectivity", "p-equivalent"],
    ["r-groups", "g-segment"],
  ],
  [
    ["p-n", "p-end", "p-monomer-unit"],
    ["r-brackets", "r-n", "g-segment"],
  ],
  [["p-name"], ["r-name"]],
  [
    ["p-C", "p-H", "p-Cl", "p-Mr", "p-mass", "p-units", "p-molecules"],
    ["r-inventory", "r-mass", "g-inventory"],
  ],
  [["p-bromine"], ["r-double", "r-single"]],
  [["p-melt"], ["r-forces", "r-monomer"]],
  [["p-use"], ["r-properties", "r-groups"]],
  [["p-properties"], ["r-properties", "r-forces"]],
  [
    ["p-water", "p-stopper", "p-condensation"],
    ["r-functional", "r-water", "g-ester"],
  ],
  [
    ["p-polyester1", "p-polyester2", "p-polyester3", "p-poly-C", "p-poly-O"],
    ["r-spacer", "r-water", "g-polyester"],
  ],
  [
    ["p-open", "p-twochains"],
    ["r-links", "g-links"],
  ],
  [["p-symbolic"], ["r-symbolic"]],
];
for (const [ids, targets] of recoveryGroups)
  for (const id of ids) {
    const t = practice.find((t) => t.id === prefix + id);
    if (!t) throw Error("Missing practice recovery " + id);
    const refs = targets.map((id) => prefix + id);
    polymerisationRecovery[t.id] = refs;
    t.followUp = refs[0];
  }
export const polymerisationExposureFamilies: Record<string, string[]> = {
  properties: ["r-properties", "p-properties"],
  double: ["w-double", "r-double", "p-bromine"],
  carbonValence: ["w-carbon", "r-outward", "p-bond", "b-bond", "ra-bond"],
  addition: [
    "r-single",
    "r-groups",
    "g-addition",
    "p-ethene",
    "p-propene",
    "p-chloro",
    "p-fluoro",
    "p-but1",
    "p-but2",
    "p-cl11",
    "p-cl12",
    "p-bond",
    "a-draw",
    "b-draw",
    "b-bond",
    "ra-bond",
  ],
  connectivity: [
    "r-groups",
    "g-segment",
    "p-connectivity",
    "p-equivalent",
    "p-cl11",
    "p-cl12",
    "b-connectivity",
  ],
  reverse: [
    "r-reverse",
    "g-reverse",
    "p-reverse-cl",
    "p-reverse-fl",
    "p-reverse-but1",
    "p-reverse-cl12",
    "a-reverse",
    "b-reverse",
    "rb-reverse",
  ],
  notation: [
    "r-brackets",
    "r-n",
    "g-segment",
    "p-n",
    "p-end",
    "p-monomer-unit",
    "a-n",
    "ra-n",
  ],
  names: ["r-name", "p-name", "a-name"],
  etheneName: ["g-addition", "p-ethene"],
  monomers: ["r-monomer", "p-molecules", "a-explain", "rb-change"],
  atomRetention: [
    "r-inventory",
    "r-halogen",
    "g-inventory",
    "p-H",
    "p-Cl",
    "p-mass",
    "a-products",
    "a-Cl",
    "b-product",
    "ra-Cl",
  ],
  countCarbon: ["g-segment", "p-C", "a-C", "rb-C"],
  unitCount: ["p-units", "b-units"],
  repeatMass: ["r-mass", "p-Mr", "b-Mr"],
  chemicalChange: ["r-forces", "p-melt", "a-explain", "b-explain", "rb-change"],
  higherGroups: ["r-functional", "g-ester", "p-stopper", "p-condensation"],
  higherWater: ["r-water", "g-ester", "p-water", "p-condensation"],
  higherRepeat: [
    "r-spacer",
    "g-polyester",
    "p-polyester1",
    "p-polyester2",
    "p-polyester3",
    "p-poly-C",
    "p-poly-O",
  ],
  finiteLinks: ["r-links", "g-links", "p-open", "p-twochains"],
  symbolicWater: ["r-symbolic", "p-symbolic"],
};
const all = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
for (const ids of Object.values(polymerisationExposureFamilies)) {
  const aliases = ids.map((id) => prefix + id);
  for (const t of all)
    if (aliases.includes(t.id))
      t.exposureAliases = [
        ...new Set([
          ...(t.exposureAliases ?? []),
          ...aliases.filter((id) => id !== t.id),
        ]),
      ];
}
export const polymerisationJourney: Journey = {
  version: 1,
  introduction:
    "Construct an addition-polymer repeat, reconstruct its alkene monomer and preserve every original side group. Higher extensions build polyester repeats and distinguish actual condensation links from end-omitted notation.",
  scopeNote:
    "Separate Chemistry: actual AQA8462 4.7.3.1–2 and limited Pearson9.17C–24C, paired2023 Foundation02/Higher08 questions and mark schemes, and actual RSC addition/condensation worksheets informed this original lesson. Addition transformations require no mechanisms or conditions. PVC/PTFE names are supplied for structural deduction. Condensation is clearly labelled Higher; acid-chloride examples are provided extensions with no acid-chloride recall required. Independent checks cover the shared/Foundation addition and structure-change demands; Higher construction/explanation tasks require independent self-review in practice. Earlier Polymer structures teaches physical structure/state; natural polymers and waste/material decisions have their later lessons. Every written/drawn response requires self-review, with no automatic examiner mark. Whole-course coverage and exam readiness remain unfinished.",
  outcomes: [
    "Represent alkene addition with single backbone bonds, original side groups, bracket continuations and lower-case n.",
    "Deduce separate monomers from repeating units without losing or rearranging substituents.",
    "Distinguish a monomer-derived repeat contribution, an equivalent phase, a crop and a complete molecule.",
    "Conserve atom inventories and supplied relative-mass contributions without inventing end groups or addition by-products.",
    "Distinguish covalent chemical changes from supplied intact-chain physical changes and use actual material evidence.",
    "Higher: construct a diol/diacid-derived polyester repeat with both spacers, carbonyls and alcohol-derived linking oxygens.",
    "Higher: explain functional-group requirements, small-molecule loss and context-specific finite-link versus idealised repeat counts.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Forward displayed construction",
      taskIds: [
        "p-ethene",
        "p-propene",
        "p-chloro",
        "p-fluoro",
        "p-but1",
        "p-but2",
        "p-cl11",
        "p-cl12",
      ].map((id) => prefix + id),
    },
    {
      label: "Reverse deduction and connectivity",
      taskIds: [
        "p-reverse-cl",
        "p-reverse-fl",
        "p-reverse-but1",
        "p-reverse-cl12",
        "p-bond",
        "p-connectivity",
        "p-equivalent",
      ].map((id) => prefix + id),
    },
    {
      label: "Notation and naming",
      taskIds: ["p-n", "p-end", "p-monomer-unit", "p-name"].map(
        (id) => prefix + id,
      ),
    },
    {
      label: "Atoms, mass and molecule counts",
      taskIds: [
        "p-C",
        "p-H",
        "p-Cl",
        "p-Mr",
        "p-mass",
        "p-units",
        "p-molecules",
      ].map((id) => prefix + id),
    },
    {
      label: "Chemical/physical change and supplied uses",
      taskIds: ["p-bromine", "p-melt", "p-use", "p-properties"].map(
        (id) => prefix + id,
      ),
    },
    {
      label: "Higher: polyester structure and functional groups",
      taskIds: [
        "p-water",
        "p-stopper",
        "p-polyester1",
        "p-polyester2",
        "p-polyester3",
        "p-poly-C",
        "p-poly-O",
        "p-condensation",
      ].map((id) => prefix + id),
    },
    {
      label: "Higher: actual links and repeat equations",
      taskIds: ["p-open", "p-twochains", "p-symbolic"].map((id) => prefix + id),
    },
  ],
};
extendCondensationWriting(
  polymerisationJourney,
  polymerisationExposureFamilies,
  polymerisationRecovery,
);

practice.find((q) => q.id === "pol-v1-p-molecules")!.optionAliases = {
  "All200 separate molecules remain disconnected":
    "All 200 separate molecules remain disconnected",
};
