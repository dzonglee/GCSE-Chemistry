import type { NaturalTask as Task } from "./natural-types";
import type { NaturalMode } from "../../lib/natural";
const prefix = "natural-v1-";
export function c(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  mode?: NaturalMode,
  record = "initial",
): Task {
  const options = [answer, ...Object.keys(errors)],
    offset = [...id].reduce((s, x) => s + x.charCodeAt(0), 0) % options.length;
  return {
    id: prefix + id,
    title,
    purpose: title,
    ...(title.startsWith("Higher:") ? { tier: "higher" as const } : {}),
    prompt,
    answer,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    ...(mode
      ? {
          model: { kind: "natural-polymers", mode, record, instruction: title },
        }
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
  mode?: NaturalMode,
  record = "initial",
): Task {
  return {
    id: prefix + id,
    title,
    purpose: title,
    ...(title.startsWith("Higher:") ? { tier: "higher" as const } : {}),
    prompt,
    answer,
    unit,
    explanation,
    hint,
    ...(mode
      ? {
          model: {
            kind: "natural-polymers" as const,
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
    ...(title.startsWith("Higher:") ? { tier: "higher" as const } : {}),
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
  mode: "dna" | "repeat" | "peptide" | "peptideUnit",
  record: string,
  answer: string,
  rubric: string[],
  hint = "Build your own proposal from the supplied structure; check complete units and every shown link.",
): Task {
  return {
    ...w(id, title, prompt, answer, rubric, hint),
    naturalGiven: { mode, record },
    naturalDrawing: { mode, record },
  };
}
export const warmup: Task[] = [
  c(
    "w-polymer",
    "Distinguish a chain from its building blocks",
    "What are the small molecules which join to make a polymer called?",
    "Monomers",
    {
      Electrons: "Electrons are not the repeating molecular building blocks.",
      Mixtures: "A polymer chain is covalently joined, not merely mixed.",
    },
    "Many monomer molecules contribute units to a polymer chain.",
    "Think about the original molecules.",
  ),
  c(
    "w-units",
    "Count units on both strands",
    "A supplied excerpt has three units on each of two strands. How many strand units are shown in total?",
    "Six",
    {
      Three: "Count both strands.",
      Two: "Two is the number of strands, not the number of units.",
    },
    "3 + 3 = 6. One whole rung contains one unit on each strand.",
    "Separate strands from units.",
  ),
  c(
    "w-oxygen",
    "Read a complete water molecule",
    "What atoms are in one H₂O molecule?",
    "Two H and one O",
    {
      "One H and one O": "That is OH, not H₂O.",
      "Two O and one H": "The 2 belongs to H.",
    },
    "One water molecule contains two hydrogen atoms and one oxygen atom.",
    "Read the subscript.",
  ),
];
export const refresher: Task[] = [
  c(
    "r-dna-unit",
    "One nucleotide belongs to one strand",
    "At a paired position, what is one complete DNA monomer?",
    "One nucleotide on one strand",
    {
      "The complete two-sided rung":
        "A complete rung contains two nucleotides.",
      "One base alone":
        "A base is part of a nucleotide, not the whole monomer.",
    },
    "One nucleotide is one complete strand unit.",
    "Follow one strand.",
    "dna",
  ),
  c(
    "r-dna-shape",
    "Separate name and shape",
    "What is the overall shape of most DNA molecules?",
    "Double helix",
    {
      DNA: "DNA names the molecule; the question asks its shape.",
      "Single straight chain":
        "Most DNA contains two chains wound around one another.",
    },
    "Most DNA has two polymer chains in a double helix.",
    "Think about both winding strands.",
    "dna",
  ),
  c(
    "r-dna-types",
    "Possible types are not excerpt counts",
    "How many different nucleotide types are available in DNA?",
    "Four",
    {
      Two: "Two is the strand count, not the number of types.",
      Eight: "An excerpt may contain eight units but only four possible types.",
    },
    "DNA uses four different nucleotide types; a short excerpt need not show all four.",
    "Distinguish types from positions.",
    "dna",
    "cg",
  ),
  c(
    "r-protein",
    "Name protein monomers",
    "Proteins are polymers based on what monomer type?",
    "Amino acids",
    {
      Glucose: "Glucose is the building block of starch and cellulose.",
      Nucleotides: "Nucleotides form DNA.",
    },
    "Different amino acids can contribute to one protein chain.",
    "Use the supplied chain description.",
    "identify",
    "protein",
  ),
  c(
    "r-glucose",
    "Name carbohydrate building blocks",
    "Starch and cellulose are both based on which monomer?",
    "Glucose",
    {
      Ethene: "Ethene forms poly(ethene), not starch or cellulose.",
      "Amino acids": "Amino acids form polypeptides.",
    },
    "Both are glucose-based polymers with different linking arrangements.",
    "Same building block does not mean same structure.",
    "identify",
    "cellulose",
  ),
  c(
    "r-repeat",
    "Select a whole contribution",
    "Which selection represents one glucose-derived contribution in this supplied crop?",
    "One complete ring with one linking oxygen",
    {
      "One oxygen alone": "The bridge alone omits the carbon-containing ring.",
      "All three rings": "That is the whole crop, not one contribution.",
    },
    "A complete contribution includes a whole ring and one linking O; it is not an isolated glucose molecule.",
    "Check the ring and the adjoining bridge.",
    "repeat",
  ),
  c(
    "r-identity",
    "Use the amount of evidence actually given",
    "A crop is only described as glucose-derived. What identity is justified here?",
    "A glucose-based polymer",
    {
      "Definitely DNA": "DNA is based on nucleotides.",
      "Uniquely starch":
        "The supplied information does not uniquely distinguish starch from cellulose.",
    },
    "Name only what the supplied structure and context justify.",
    "Avoid guessing a more specific identity.",
    "identify",
    "fragment",
  ),
  c(
    "r-sequence",
    "Same composition can have a different order",
    "Glycine–alanine–glycine is rearranged as alanine–glycine–glycine. What is unchanged?",
    "The complete atom composition",
    {
      "The order": "The order changed.",
      "The identity of every position": "The first two positions changed.",
    },
    "The same contributions in a different order preserve total composition.",
    "Count the contributions.",
    "sequence",
  ),
  c(
    "r-function",
    "Respect the limits of a short excerpt",
    "Two short excerpts have the same atom composition. What exact function can this alone prove?",
    "No exact function is determined",
    {
      "They must have exactly the same function":
        "Composition alone does not fix sequence, full structure or exact function.",
      "They must have exactly different functions":
        "A short fragment does not prove a specific functional change.",
    },
    "Order influences structure, but these excerpts alone do not determine an exact protein function.",
    "Distinguish evidence from certainty.",
    "sequence",
  ),
  c(
    "r-groups",
    "Higher: find two different functional groups",
    "Glycine is H₂N–CH₂–COOH. Which pair of functional groups does it contain?",
    "An amino group and a carboxylic acid group",
    {
      "Two alcohol groups":
        "NH₂ is an amino group; COOH is a carboxylic acid group.",
      "A C=C bond only":
        "Glycine does not need an alkene bond to undergo condensation.",
    },
    "One amino acid molecule has two different functional groups.",
    "Look at both ends.",
    "peptide",
  ),
  c(
    "r-peptide",
    "Higher: identify the actual joining atoms",
    "In the supplied amino-acid condensation, which atoms make the peptide joining bond?",
    "Carbonyl carbon and amino nitrogen",
    {
      "Carbon and oxygen":
        "C–O is an ester-link choice, not this peptide link.",
      "Two carbon atoms": "A C–C joining bond is not the peptide link.",
    },
    "The new C–N bond joins the carbonyl carbon to the amino nitrogen.",
    "Retain the carbonyl oxygen.",
    "peptide",
  ),
  c(
    "r-water",
    "Higher: identify the atoms removed",
    "Which groups form water at one amino-acid joining junction?",
    "Acid OH and one amino H",
    {
      "Carbonyl O and both amino H": "The carbonyl O remains in the chain.",
      "The entire amino group":
        "Nitrogen remains in the chain and forms the link.",
    },
    "Acid OH plus one H forms H₂O. The internal nitrogen retains one H.",
    "Remove OH + H, not C=O.",
    "peptide",
  ),
  n(
    "r-links",
    "Higher: count actual open-chain links",
    "Four monomers join into one finite open chain, with both outer terminal groups shown. How many joining links are there?",
    "3",
    "links",
    "There is a link between each adjacent pair: four units give three actual links.",
    "Count spaces between units.",
    "peptide",
    "four",
  ),
  n(
    "r-mass",
    "Higher: subtract released water once per link",
    "Two glycines each have Mr 75. One joining link releases one H₂O of Mr 18. What is the whole dipeptide Mr?",
    "132",
    "relative formula mass",
    "75 + 75 − 18 = 132; both terminal groups remain.",
    "Subtract only the water actually released.",
    "mass",
  ),
];
refresher.push(
  c(
    "r-information",
    "DNA carries instructions",
    "Which statement describes why DNA is important?",
    "It encodes genetic instructions",
    {
      "It is made from glucose only": "DNA uses nucleotide monomers.",
      "A short excerpt always contains all four types":
        "A short excerpt may omit some types.",
    },
    "DNA encodes genetic instructions for development and functioning. Most DNA has two nucleotide chains in a double helix.",
    "Separate biological role from monomer counts.",
    "dna",
  ),
  c(
    "r-composition",
    "Replacing a contribution changes its inventory",
    "Glycine C₂H₅NO₂ is replaced by alanine C₃H₇NO₂ in an otherwise unchanged excerpt. What changes?",
    "The complete carbon and hydrogen totals",
    {
      "Only the displayed order":
        "A contribution was replaced by a different formula.",
      "No atom totals": "C₂H₅ and C₃H₇ contain different C and H counts.",
    },
    "A replacement changes composition, while reordering the same contributions preserves composition.",
    "Compare the given formulas.",
    "sequence",
    "different",
  ),
  c(
    "r-connectivity",
    "Same formula can have different connectivity",
    "Alanine H₂N–CH(CH₃)–COOH and beta-alanine H₂N–CH₂–CH₂–COOH have the same formula. What differs in the supplied structures?",
    "Atom connectivity",
    {
      "The supplied atom totals": "Both are C₃H₇NO₂.",
      "Nothing about the structures":
        "The carbon skeleton and amino-group attachment differ.",
    },
    "Atom composition and connectivity answer different questions. These unfamiliar structures are supplied, not recalled names.",
    "Follow the bonds in each formula.",
    "sequence",
    "beta",
  ),
);
refresher.push(
  n(
    "r-core-ends",
    "Higher: account for unchanged end groups",
    "Given Ar: H 1, C 12, N 14, O 16, calculate the combined relative mass of NH₂ and COOH in H₂N–[unknown section]–COOH.",
    "61",
    "relative mass",
    "NH₂: 14 + 2 = 16. COOH: 12 + 2 × 16 + 1 = 45. Combined mass = 61.",
    "Count all atoms in both printed end groups.",
    "core",
  ),
  n(
    "r-core-subtract",
    "Higher: work backwards from whole mass",
    "H₂N–[unknown section]–COOH has whole Mr 75. Its unchanged NH₂ and COOH groups together have relative mass 61. Find the unknown section’s relative mass.",
    "14",
    "relative mass",
    "75 − 61 = 14. The mass does not by itself identify the section’s connectivity.",
    "Subtract the known parts from the whole.",
    "core",
  ),
);

refresher.push(
  c(
    "r-amino-repeat",
    "Higher: distinguish repeat boundaries from chain ends",
    "For glycine H₂N–CH₂–COOH, which end-omitted contribution belongs inside the polypeptide brackets?",
    "–NH–CH₂–C(=O)–",
    {
      "–NH₂–CH₂–COOH–":
        "Those are the original monomer's terminal groups, not the internal contribution.",
      "–NH–CH₂–CH₂–":
        "The original carbonyl oxygen must remain; condensation does not turn C=O into CH₂.",
    },
    "Remove acid OH and one amino H while retaining CH₂ and C=O. The repeat bonds cross both brackets; n sits outside. Adjacent contributions meet through C–N.",
    "Retain the carbon skeleton and carbonyl oxygen.",
    "peptideUnit",
  ),
);
