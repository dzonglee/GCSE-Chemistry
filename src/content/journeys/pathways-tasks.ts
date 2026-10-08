import type { PathwayTask as Task } from "./pathways-types";
import type { PathwayMode } from "../../lib/pathways";
const prefix = "path-v1-";
export function c(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  mode?: PathwayMode,
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
      ? { model: { kind: "pathways", mode, record, instruction: title } }
      : {}),
  };
}
export function n(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  unit: string,
  explanation: string,
  hint: string,
  mode?: PathwayMode,
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
      ? {
          model: {
            kind: "pathways" as const,
            mode,
            record,
            instruction: title,
          },
        }
      : {}),
  };
}
export function w(
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
export function draw(
  id: string,
  title: string,
  prompt: string,
  caseId: string,
  answer: string,
  rubric: string[],
): Task {
  return {
    ...w(
      id,
      title,
      prompt,
      answer,
      rubric,
      "Keep the original carbon chain; count every bond and every hydrogen, including any O–H.",
    ),
    pathwayGiven: { caseId },
    pathwayDrawing: {
      caseId,
      note: "The supplied starting structure remains fixed. Build the requested fully displayed product from blank carbon, hydrogen, bond, oxygen and halogen choices.",
    },
  };
}
export const warmup: Task[] = [
  c(
    "w-site",
    "Find the functional group",
    "Which bond makes an acyclic alkene different from its corresponding alkane?",
    "A carbon–carbon double bond",
    {
      "An O–H bond": "An O–H group is not the defining alkene group.",
      "Only carbon–carbon single bonds":
        "Those describe a saturated carbon skeleton.",
    },
    "An alkene contains C=C; carbon still has four bond orders in its displayed structure.",
    "Look between the carbon atoms.",
  ),
  c(
    "w-water",
    "Count both water hydrogens",
    "One water molecule contains one oxygen atom. How many hydrogen atoms does it contain?",
    "Two",
    {
      One: "OH alone omits the second hydrogen of H2O.",
      Zero: "Water is not a lone oxygen atom.",
    },
    "H2O supplies two H and one O in total.",
    "Read the subscript in H2O.",
  ),
  c(
    "w-family",
    "Distinguish a hydrocarbon",
    "Which supplied formula contains only carbon and hydrogen?",
    "C3H8",
    {
      C3H8O: "Oxygen makes it more than a hydrocarbon.",
      C2H4Br2: "Bromine makes it more than a hydrocarbon.",
    },
    "A hydrocarbon contains only C and H; being saturated alone does not make a molecule a hydrocarbon.",
    "Check all element symbols.",
  ),
];
export const refresher: Task[] = [
  c(
    "r-addition",
    "Describe addition",
    "What happens to the original C=C when one H2 molecule adds to an alkene?",
    "It becomes C–C and one H attaches to each reacting carbon",
    {
      "The C=C stays and both H attach to one carbon":
        "This overfills the reacting carbon and leaves the other unsaturated.",
      "Two original carbon atoms leave": "The carbon chain is retained.",
    },
    "The double becomes single; the two new C–H bonds use the released carbon valences.",
    "Count four bond orders at each carbon.",
  ),
  c(
    "r-original",
    "Retain original atoms",
    "Propene reacts with hydrogen. What happens to the three original carbon atoms?",
    "All three remain in the product",
    {
      "Only the two double-bond carbons remain":
        "The methyl carbon is not discarded.",
      "A fourth carbon comes from hydrogen": "H2 contains no carbon.",
    },
    "Addition retains the whole original carbon skeleton, including the unreacted methyl end.",
    "Track the complete chain.",
  ),
  c(
    "r-steam",
    "Split water correctly",
    "Which new attachments represent one H2O addition across C=C?",
    "H on one reacting carbon and OH on the other",
    {
      "OH on both reacting carbons":
        "That adds two O rather than the one O in water.",
      "O alone on one carbon and no hydrogen": "That loses both H from water.",
    },
    "H plus OH has H2O overall; the O–H hydrogen is part of the product.",
    "Count the atoms in each proposed pair.",
  ),
  c(
    "r-halogen",
    "Keep a halogen pair",
    "One Br2 molecule adds to ethene. Which atom gain is correct?",
    "Two Br atoms and no change in the original C or H counts",
    {
      "One Br atom and one H atom":
        "That describes a different supplied atom pair, HBr.",
      "Two Br atoms replace two original H": "Addition is not substitution.",
    },
    "Each reacting carbon gains one Br while all original H remain.",
    "Read Br2 and preserve the original molecule.",
  ),
  c(
    "r-product",
    "Do not call every product an alkane",
    "Ethene reacts with steam to form a saturated product containing oxygen. Which family fits?",
    "Alcohol",
    {
      Alkane: "An alkane is a hydrocarbon; this product also contains O.",
      Alkene: "Its original C=C has become C–C.",
    },
    "Ethanol contains an OH group. It is saturated but is not a hydrocarbon.",
    "Use both its bonds and its elements.",
  ),
  c(
    "r-unsaturated",
    "Use the correct definition",
    "In this GCSE alkene series, what does unsaturated mean?",
    "A carbon–carbon double bond is present",
    {
      "Every carbon–carbon bond is single":
        "That describes saturation in this comparison.",
      "There are no carbon atoms": "Alkenes are carbon compounds.",
    },
    "Acyclic alkenes with one C=C have formula CnH2n.",
    "Inspect the carbon–carbon bonds.",
  ),
  c(
    "r-nickel",
    "Supply hydrogenation conditions",
    "Which catalyst is used with hydrogen for the stated alkene hydrogenation route?",
    "Nickel",
    {
      Yeast: "Yeast supports fermentation, not this addition.",
      "A cold water mixture alone": "Water is not the hydrogenation catalyst.",
    },
    "Hydrogen with nickel and suitable heating converts the alkene to an alkane.",
    "Choose the catalyst associated with H2 addition.",
  ),
  c(
    "r-hydration",
    "Use industrial steam",
    "Which conditions describe industrial ethene hydration?",
    "Heated steam under pressure with a phosphoric-acid catalyst",
    {
      "Cold water and yeast":
        "That does not describe industrial alkene hydration.",
      "Hydrogen and nickel": "That forms ethane rather than ethanol.",
    },
    "Steam adds across C=C; pressure, heating and phosphoric acid belong to this industrial route.",
    "Distinguish the reagent from the catalyst.",
  ),
  c(
    "r-bromine",
    "Read a positive test",
    "Bromine water is shaken with an alkene under ordinary test conditions. What happens to its orange colour?",
    "It becomes colourless",
    {
      "It becomes more orange": "The alkene consumes the bromine in this test.",
      "It remains orange as the positive alkene result":
        "Remaining orange is the stated negative comparison for a saturated alkane.",
    },
    "Decolourisation is evidence for the reacting C=C in this test.",
    "Track bromine rather than the shape of the container.",
  ),
  c(
    "r-uv",
    "Avoid substitution conditions",
    "Does the ordinary bromine-water alkene test require UV light?",
    "No",
    {
      "Yes: UV is essential for every bromine reaction":
        "This confuses alkene addition with a supplied alkane substitution context.",
      "Only if the alkene has two carbons":
        "The functional group, not this carbon count, is the key.",
    },
    "The standard alkene test occurs without requiring UV.",
    "Recall the ordinary room-condition test.",
  ),
  c(
    "r-count-oh",
    "Include the O–H hydrogen",
    "In fully displayed ethanol, should the H bonded to O be included when finding the molecular formula?",
    "Yes, it belongs to the same molecule",
    {
      "No, only C–H hydrogens count":
        "A molecular formula counts every atom, not only atoms bonded to carbon.",
      "No, OH always represents a separate water molecule":
        "The OH group is bonded to the carbon in ethanol.",
    },
    "Ethanol has formula C2H6O, including its O–H hydrogen.",
    "Trace connected atoms.",
  ),
  c(
    "r-water-origin",
    "Distinguish unused steam",
    "Ethene and excess steam form ethanol; the unused steam is cooled to water. Where did that collected water originate?",
    "From unreacted feed steam",
    {
      "It was eliminated as the hydration by-product":
        "Hydration consumes water rather than eliminating it.",
      "The carbon atoms changed into water": "That does not conserve elements.",
    },
    "The water was already supplied; cooling changes its state physically.",
    "Separate the reactor from the cooler.",
  ),
  c(
    "r-recycle",
    "Return unused feed",
    "After the stated industrial ethanol process is cooled, what can be done with the unreacted ethene gas?",
    "Return it to the reactor",
    {
      "Count it as ethanol already made": "It remains unreacted ethene.",
      "Treat it as a newly formed water molecule":
        "Its atoms and identity are different.",
    },
    "Recycling lets unused ethene undergo another pass through the reactor.",
    "Follow the gas return arrow.",
  ),
  c(
    "r-observed",
    "Use reported conversion",
    "A model receives eight ethene and eight water molecules, but reports four additions. How many ethanol molecules were produced?",
    "Four",
    {
      Eight: "That assumes complete conversion instead of using the report.",
      Sixteen:
        "Each ethanol needs one molecule of each reactant, not one molecule from either feed.",
    },
    "Four reported additions produce four ethanol molecules. Eight is only the supplied-feed maximum.",
    "Separate actual reaction count from its upper bound.",
  ),
  c(
    "r-oxidation",
    "Identify the ethanol oxidation branch",
    "The supplied primary ethanol reacts with oxygen from air during storage. Which organic product can form?",
    "Ethanoic acid",
    {
      Ethane: "That removes oxygen instead of describing this oxidation.",
      "Poly(ethene)": "Storage oxidation is not alkene polymerisation.",
    },
    "For the specified primary ethanol, oxidation can form ethanoic acid. This does not imply every alcohol isomer forms an acid.",
    "Use the particular starting alcohol.",
  ),
  c(
    "r-ester",
    "Account for two organic feeds",
    "Ethanoic acid reacts with ethanol to form an ester. Which statement accounts for its carbon atoms?",
    "Two acid carbons and two ethanol carbons enter the four-carbon ester",
    {
      "The acid alone creates two new carbon atoms":
        "Atoms must come from a reactant.",
      "The ethanol supplies only oxygen and none of its carbon":
        "Its carbon-containing group is retained in the ester.",
    },
    "Ethyl ethanoate has four carbons supplied by the two original molecules; water is the small by-product.",
    "Trace both reactants.",
  ),
  c(
    "r-fermentation",
    "Choose a distinct ethanol route",
    "Which starting material is fermented with yeast to produce ethanol?",
    "Glucose in aqueous solution",
    {
      "Ethene gas under pressure": "That belongs to hydration.",
      "Ethane and nickel": "Nickel does not ferment an alkane.",
    },
    "Suitable warm anaerobic yeast fermentation forms ethanol and carbon dioxide from glucose.",
    "Identify the biological route.",
  ),
  c(
    "r-polymer",
    "Distinguish one addition from many monomers",
    "Why is ethene addition polymerisation different from ethene plus one H2 molecule?",
    "Many ethene monomers join into one very large chain",
    {
      "One H2 molecule supplies a long carbon chain":
        "Hydrogen contains no carbon.",
      "Both must release water":
        "Ordinary addition polymerisation releases no small by-product.",
    },
    "Other monomers provide repeated carbon contributions; hydrogenation gives one discrete alkane molecule.",
    "Track the second feed and the product extent.",
  ),
];
refresher.push(
  c(
    "r-higher-groups",
    "Higher: count both reactive ends",
    "Higher Chemistry: why can a supplied diol and dicarboxylic acid form a continuing polyester chain?",
    "Each reactant has two reactive functional groups",
    {
      "Both contain carbon":
        "Carbon alone does not establish two reactive ends.",
      "A molecule with only one OH must continue indefinitely in both directions":
        "One reactive group can stop growth instead.",
    },
    "Two reactive ends permit repeated ester-link formation between the supplied monomers.",
    "Count the actual functional groups.",
  ),
  c(
    "r-higher-water",
    "Higher: separate condensation from cooling",
    "Higher Chemistry: water formed at an actual diol/diacid ester link is…",
    "A small product of a chemical condensation reaction",
    {
      "Only the original steam cooling to liquid":
        "That is a different physical process.",
      "Required as the new feed for ordinary ethene polymerisation":
        "Ordinary addition polymerisation does not eliminate water.",
    },
    "Chemical condensation forms a new ester link and eliminates water; physical condensation changes the state of existing water.",
    "Ask whether chemical connectivity changes.",
  ),
);
