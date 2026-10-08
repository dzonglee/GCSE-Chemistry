import {
  choice as c,
  number as n,
  type ChromaTask,
} from "./chromatography-tasks";
export const chromatographyWarmup: ChromaTask[] = [
  c(
    "w-compound",
    "Count substances, not elements",
    "A complete supplied sample contains only glucose molecules, C₆H₁₂O₆. How is it classified?",
    "A pure compound",
    {
      "A mixture because it has three elements":
        "The different elements are chemically combined in one supplied substance.",
      "A pure element": "Glucose contains carbon, hydrogen and oxygen.",
    },
    "One supplied compound is a chemically pure substance.",
    "Separate substance identity from element identity.",
  ),
  c(
    "w-soluble",
    "Use the stated solvent",
    "Dye K is supplied as soluble in water. What happens when a small amount is mixed with enough water?",
    "It forms a solution",
    {
      "It must remain as insoluble grains":
        "The source explicitly states that K is soluble.",
      "It becomes chemically identical to water":
        "Dissolving does not replace the dye with water.",
    },
    "Soluble K disperses in the water to form a solution; its chemical identity remains K.",
    "Use the given solubility, not the colour.",
  ),
  n(
    "w-fraction",
    "Treat a fraction as division",
    "Calculate 7 ÷ 20 as a decimal.",
    "0.35",
    "",
    "7 ÷ 20 = 0.35. A fraction expresses division.",
    "Write an equivalent fraction out of 100.",
  ),
];
