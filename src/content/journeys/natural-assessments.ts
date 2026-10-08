import { c, n, draw } from "./natural-tasks";
import type { NaturalTask as Task } from "./natural-types";
export const checkForms: Task[][] = [
  [
    c(
      "c-a-protein",
      "Identify the monomer type",
      "A naturally occurring protein is a polymer based on which monomer type?",
      "Amino acids",
      {
        Nucleotides: "Those are DNA monomers.",
        Glucose: "That is a carbohydrate building block.",
      },
      "Proteins are polymers based on amino acids.",
      "Use the named polymer.",
    ),
    c(
      "c-a-glucose",
      "Identify a shared building block",
      "Which pair of naturally occurring polymers is based on glucose?",
      "Starch and cellulose",
      {
        "DNA and proteins": "Their monomers are nucleotides and amino acids.",
        "DNA and cellulose": "DNA is not glucose-based.",
      },
      "Starch and cellulose are glucose-based polymers.",
      "Consider each monomer type.",
    ),
    c(
      "c-a-types",
      "Distinguish possible nucleotide types",
      "An unfamiliar short DNA excerpt only shows three type labels. How many possible nucleotide types are available in DNA?",
      "Four",
      {
        Three: "The excerpt need not display every type.",
        Two: "That is the usual strand count.",
      },
      "DNA uses four possible nucleotide types.",
      "Separate an excerpt from the general rule.",
    ),
    n(
      "c-a-count",
      "Count both complete strands",
      "A supplied DNA excerpt has five positions on each of two strands. How many nucleotide units are shown in total?",
      "10",
      "nucleotides",
      "5 × 2 = 10 complete strand units.",
      "Count both strands.",
    ),
    c(
      "c-a-shape",
      "Name a structural arrangement",
      "Two polymer strands winding around one another form which common DNA arrangement?",
      "Double helix",
      {
        DNA: "That names the molecule instead of the shape.",
        "Single helix": "The supplied description has two winding strands.",
      },
      "Most DNA has two polymer chains in a double helix.",
      "Name the shape.",
    ),
    draw(
      "c-a-draw",
      "Select one monomer independently",
      "Using the supplied six-position excerpt and its provided visual key, mark one complete nucleotide at position 1. Show a two-strand DNA proposal and identify the overall shape.",
      "dna",
      "six",
      "Mark either one whole nucleotide on either strand at position 1, with two strands and double-helix identification.",
      [
        "Choose one complete nucleotide, not a rung or a base alone.",
        "Retain two polymer strands.",
        "Identify double helix and nucleotide monomers.",
        "Treat the provided pairing key as supplied information.",
      ],
    ),
  ],
  [
    c(
      "c-b-dna",
      "Name the monomer rather than a component",
      "What is the general name of one complete DNA monomer?",
      "Nucleotide",
      {
        "Base alone": "A base is only part of a nucleotide.",
        "Amino acid": "That is a protein monomer.",
      },
      "DNA is a polymer based on nucleotides.",
      "Name the whole unit.",
    ),
    c(
      "c-b-cellulose",
      "Identify a named natural polymer",
      "Cellulose is based on which original monomer?",
      "Glucose",
      { Ethene: "Ethene makes poly(ethene).", Nucleotides: "Those make DNA." },
      "Cellulose is glucose-based.",
      "Use the named polymer.",
    ),
    n(
      "c-b-count",
      "Count a different excerpt",
      "A supplied DNA excerpt has seven positions on each of two strands. How many nucleotide units are present?",
      "14",
      "nucleotides",
      "7 × 2 = 14, not seven whole-rung units.",
      "Count both sides.",
    ),
    c(
      "c-b-sequence",
      "Distinguish order from inventory",
      "Two excerpts contain the same two glycine contributions and one alanine contribution, but in different order. What is unchanged?",
      "The complete atom composition",
      {
        "The sequence": "The supplied order differs.",
        "An established exact biological function":
          "These excerpts do not establish an exact function.",
      },
      "The same contributions preserve total composition while sequence differs.",
      "Count the contributions.",
    ),
    c(
      "c-b-information",
      "State the role of DNA",
      "Which statement explains the importance of DNA?",
      "It encodes genetic instructions",
      {
        "It contains only glucose units": "DNA has nucleotide monomers.",
        "Every short excerpt must contain all four types":
          "A short excerpt need not show every type.",
      },
      "DNA encodes genetic instructions for development and functioning.",
      "Use its information-carrying role.",
    ),
    draw(
      "c-b-draw",
      "Select a complete glucose-derived contribution",
      "In the supplied five-ring crop, independently select one complete repeating contribution.",
      "repeat",
      "middle",
      "A complete ring plus one linking O, for example boundaries 4 to 6 in this crop.",
      [
        "Include one whole glucose-derived ring.",
        "Include one adjoining linking O.",
        "Exclude the other whole rings; do not select O alone.",
        "Name glucose as the original monomer rather than calling the joined contribution a complete free glucose molecule.",
      ],
    ),
  ],
];
for (const form of checkForms)
  form.splice(
    5,
    0,
    c(
      form === checkForms[0] ? "c-a-diagram" : "c-b-diagram",
      "Recognise the supplied polymer structure",
      "The supplied schematic shows the usual structure of a naturally occurring polymer. Which monomer type makes its two chains?",
      "Nucleotides",
      {
        Glucose:
          "Glucose-based polymers do not have this common two-strand winding arrangement.",
        "Amino acids":
          "Those contribute to polypeptides; this supplied diagram represents the common DNA arrangement.",
      },
      "The two-chain winding diagram represents the common DNA structure. Its monomer type is nucleotides.",
      "Read the supplied structure.",
    ),
  );
checkForms[0].splice(
  6,
  0,
  c(
    "c-a-information",
    "Explain its importance",
    "Which statement describes a role of DNA?",
    "It encodes genetic instructions",
    {
      "It is made only from glucose": "DNA is based on nucleotides.",
      "Every short excerpt must show all four types":
        "A short excerpt need not contain every type.",
    },
    "DNA encodes genetic instructions for development and functioning.",
    "Use the role of the molecule.",
  ),
);
checkForms[1].splice(
  6,
  0,
  c(
    "c-b-types",
    "Separate types from excerpt length",
    "An unfamiliar DNA excerpt has twelve positions on each strand. How many possible nucleotide types can DNA use generally?",
    "Four",
    {
      Twelve: "Positions are not the number of possible types.",
      Two: "Two is the common strand count.",
    },
    "DNA uses four possible nucleotide types, independent of excerpt length.",
    "Distinguish types from copies.",
  ),
);
for (let i = 0; i < 2; i++)
  checkForms[i][5].naturalHelix = { positions: i ? 15 : 12, turns: i ? 3 : 2 };
checkForms[0][4].prompt =
  "Name the common two-chain arrangement shown in the supplied schematic.";
checkForms[0][4].naturalHelix = { positions: 14, turns: 2.5 };
export const reviewForms: Task[][] = [
  [
    n(
      "v-a-count",
      "Retrieve a whole-excerpt count",
      "A later two-strand DNA excerpt has three positions on each strand. How many nucleotide units are shown?",
      "6",
      "nucleotides",
      "3 × 2 = 6 complete strand units.",
      "Count both strands.",
    ),
    c(
      "v-a-protein",
      "Retrieve the protein building blocks",
      "Which monomer type contributes units to protein chains?",
      "Amino acids",
      {
        Glucose: "Glucose is used in starch and cellulose.",
        Nucleotides: "Nucleotides are used in DNA.",
      },
      "Proteins are polymers based on amino acids.",
      "Use the named polymer.",
    ),
    draw(
      "v-a-draw",
      "Retrieve a whole contribution",
      "Independently mark one complete glucose-derived contribution in the supplied two-ring crop, including one bridge oxygen.",
      "repeat",
      "short",
      "One complete ring plus one linking O; boundaries 0 to 2 or 1 to 3 are examples.",
      [
        "Include one complete ring and one bridge O.",
        "Do not select a whole two-ring crop or a lone O.",
        "Name glucose as the original monomer.",
      ],
    ),
  ],
  [
    c(
      "v-b-dna",
      "Retrieve the monomer name",
      "What is the general name of one complete DNA strand unit?",
      "Nucleotide",
      {
        "Whole rung": "A rung contains two units.",
        Glucose: "Glucose is a carbohydrate monomer.",
      },
      "One nucleotide belongs to one strand.",
      "Follow one strand.",
    ),
    c(
      "v-b-glucose",
      "Retrieve the common building block",
      "Which original monomer is shared by starch and cellulose?",
      "Glucose",
      {
        "Amino acid": "Those contribute to proteins.",
        Nucleotide: "Those contribute to DNA.",
      },
      "Both are glucose-based polymers.",
      "Recall the carbohydrate building block.",
    ),
    draw(
      "v-b-draw",
      "Retrieve one nucleotide selection",
      "In the supplied CGCG two-strand excerpt, independently highlight one complete nucleotide at position 1. Identify its monomer type and the common DNA arrangement.",
      "dna",
      "cg",
      "One complete nucleotide on either strand at position 1; two strands and double helix.",
      [
        "Select one whole nucleotide rather than a rung or base alone.",
        "Identify nucleotides and two strands.",
        "Identify the common double-helix arrangement; supplied labels need not show all four possible types.",
      ],
    ),
  ],
];
