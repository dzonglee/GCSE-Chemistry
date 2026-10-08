import { c, n } from "./natural-tasks";
import type { NaturalTask as Task } from "./natural-types";
export const guided: Task[] = [
  c(
    "g-unit",
    "Select one nucleotide",
    "Highlight one whole DNA monomer, then identify it.",
    "One nucleotide on one strand",
    {
      "One complete rung": "That contains one nucleotide from each strand.",
      "One base alone": "A base is only part of the whole nucleotide.",
    },
    "A single nucleotide is one monomer on one strand. The other side of the rung is a second nucleotide.",
    "Highlight either complete strand unit.",
    "dna",
  ),
  n(
    "g-count",
    "Count both strands",
    "The supplied DNA excerpt has four positions on each of two strands. How many nucleotides are shown?",
    "8",
    "nucleotides",
    "Four on each strand gives eight total; four rungs do not mean four nucleotides.",
    "Count complete units on both sides.",
    "dna",
  ),
  c(
    "g-types",
    "Read an excerpt without changing the general rule",
    "The CGCG excerpt only shows two of the possible type labels. How many nucleotide types are available in DNA generally?",
    "Four",
    {
      Two: "This short excerpt does not contain every possible type.",
      Eight: "Eight is the number of units shown across both strands.",
    },
    "Four possible types is different from the number of types occurring in a short excerpt.",
    "Use the full DNA rule.",
    "dna",
    "cg",
  ),
  c(
    "g-glucose",
    "Match named cellulose to its monomer",
    "Cellulose is named in the supplied case. What is its original building block?",
    "Glucose",
    {
      "Amino acids": "Those are protein building blocks.",
      Nucleotides: "Those are DNA building blocks.",
    },
    "Cellulose and starch are both glucose-based polymers; their linking arrangements differ.",
    "A shared monomer does not make identical polymers.",
    "identify",
    "cellulose",
  ),
  c(
    "g-repeat",
    "Select a whole glucose-derived contribution",
    "Choose boundaries around one complete ring plus one bridge oxygen. What did you select?",
    "One glucose-derived contribution",
    {
      "One isolated glucose molecule":
        "The contribution inside the chain differs from the original monomer.",
      "The complete polymer molecule": "The displayed crop is only an excerpt.",
    },
    "A whole ring and one linking O make one contribution in the given end-omitted crop.",
    "Keep one complete ring, not just its oxygen.",
    "repeat",
  ),
  c(
    "g-order",
    "Reconstruct the target order",
    "Rebuild alanine–glycine–glycine from the supplied original glycine–alanine–glycine. What is preserved?",
    "The atom composition",
    {
      "The order of the first two contributions": "Their order changed.",
      "A proved exact protein function":
        "These excerpts do not determine an exact function.",
    },
    "Reordering the same contributions preserves the atom inventory but changes sequence.",
    "Match each target position.",
    "sequence",
  ),
  c(
    "g-connectivity",
    "Use the given structures, not mass alone",
    "Alanine is H₂N–CH(CH₃)–COOH; beta-alanine is H₂N–CH₂–CH₂–COOH. Both have C₃H₇NO₂. Which difference is shown?",
    "Different atom connectivity",
    {
      "Different complete atom totals":
        "Their supplied formulas have the same totals.",
      "Exactly identical structures":
        "The amino group and carbon skeleton connect differently.",
    },
    "The same molecular formula and Mr do not guarantee the same connectivity. Both unfamiliar structures are supplied.",
    "Follow the printed bonds.",
    "sequence",
    "beta",
  ),
  c(
    "g-join",
    "Higher: join the carbon to the nitrogen",
    "Build the two-glycine dipeptide, retaining terminal NH₂ and COOH. Which new bond joins the units?",
    "C–N",
    {
      "C–O": "That does not make this peptide linkage.",
      "C–C": "That joins the wrong atom pair.",
    },
    "Carbonyl C bonds to amino N; carbonyl O remains doubly bonded to C.",
    "Check the joining atoms.",
    "peptide",
  ),
  n(
    "g-three",
    "Higher: keep the actual open-chain endpoints",
    "Three glycine molecules make the shown finite open chain. How many waters do its two joining links release?",
    "2",
    "water molecules",
    "Two actual junctions release two H₂O. The left NH₂ and right COOH remain at the open ends.",
    "Count shown junctions, not repeat symbols.",
    "peptide",
    "three",
  ),
  n(
    "g-inventory",
    "Higher: count the whole mixed dipeptide",
    "Glycine C₂H₅NO₂ and alanine C₃H₇NO₂ form one C–N joining link, releasing H₂O. How many H atoms remain in the whole chain?",
    "10",
    "hydrogen atoms",
    "5 + 7 − 2 = 10. The full product is C₅H₁₀N₂O₃ with Mr 146.",
    "Subtract both water hydrogens.",
    "mass",
    "mixed",
  ),
];
guided.push(
  n(
    "g-core",
    "Higher: find an unfamiliar missing section",
    "H₂N–[unknown section]–COOH has whole Mr 89. Use Ar H 1, C 12, N 14, O 16 to calculate the relative mass of its unknown section.",
    "28",
    "relative mass",
    "NH₂ and COOH contribute 16 + 45 = 61. The section contributes 89 − 61 = 28. Do not infer a unique structure from this mass.",
    "Find both known group masses, then subtract.",
    "core",
    "larger",
  ),
);

guided.push(
  c(
    "g-amino-repeat",
    "Higher: preserve an unfamiliar supplied carbon section",
    "Build one bracketed contribution from H₂N–CH₂–CH₂–COOH. Which carbon section remains between NH and C=O?",
    "CH₂–CH₂",
    {
      "CH₂ only":
        "Condensation removes OH and H; it does not remove a carbon atom.",
      "CH(CH₃)":
        "That rearranges the supplied connectivity rather than retaining it.",
    },
    "The supplied monomer contributes –NH–CH₂–CH₂–C(=O)–. Keep both carbons in their original order, bonds through both brackets and n outside.",
    "Copy the given carbon section without rearranging it.",
    "peptideUnit",
    "beta",
  ),
);
