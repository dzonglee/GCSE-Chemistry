// Original measured givens only. No result classifications, matches or answers.
export type ChromaGivenData = { record: string };
export type ChromaGivenSource = {
  title: string;
  origin: number;
  front: number | null;
  top: number;
  unit: "mm";
  phaseNote: string;
  lanes: readonly {
    label: string;
    centres: readonly number[];
    radius?: number;
    colour: string;
  }[];
  note: string;
};
export const chromaGivenSources: Record<string, ChromaGivenSource> = {
  coldAmeasurement: {
    title: "Original calibrated record A",
    origin: 18,
    front: 108,
    top: 120,
    unit: "mm",
    phaseNote:
      "Paper and water; source positions measured above the paper bottom.",
    lanes: [{ label: "Sample", centres: [63], colour: "purple" }],
    note: "The original origin, centre and marked front are supplied. The coordinate scale is in millimetres; this schematic is not a life-size sheet.",
  },
  coldBmeasurement: {
    title: "Original calibrated record B",
    origin: 16,
    front: 106,
    top: 120,
    unit: "mm",
    phaseNote:
      "Paper and water; source positions measured above the paper bottom.",
    lanes: [{ label: "Sample", centres: [70], radius: 5, colour: "purple" }],
    note: "The supplied circular spot has a 5 mm radius. Its centre and edges are distinct. The scale gives original source coordinates.",
  },
  coldAreferences: {
    title: "Unknown and three known reference lanes",
    origin: 22,
    front: 122,
    top: 135,
    unit: "mm",
    phaseNote:
      "All lanes run together on the same paper, in the same solvent and at the same temperature.",
    lanes: [
      { label: "Unknown", centres: [42, 82], colour: "purple" },
      { label: "P", centres: [42], colour: "purple" },
      { label: "Q", centres: [62], colour: "purple" },
      { label: "R", centres: [82], colour: "purple" },
    ],
    note: "The supplied sample is uncontaminated and these spots are resolved. The reference list supplies candidates; it is not a complete list of every possible chemical substance.",
  },
  coldAoverlap: {
    title: "Original overlapping reference positions",
    origin: 10,
    front: 110,
    top: 125,
    unit: "mm",
    phaseNote:
      "Unknown and both references run under the same paper, solvent and temperature conditions.",
    lanes: [
      { label: "Unknown", centres: [60], colour: "blue" },
      { label: "A", centres: [60], colour: "blue" },
      { label: "B", centres: [60], colour: "blue" },
    ],
    note: "Both reference compounds are supplied as detectable and soluble. The unknown composition is not supplied.",
  },
  coldBcount: {
    title: "Four resolved original sample positions",
    origin: 10,
    front: 110,
    top: 125,
    unit: "mm",
    phaseNote: "Paper chromatography with a stated suitable solvent.",
    lanes: [{ label: "Unknown", centres: [25, 45, 75, 100], colour: "purple" }],
    note: "The sample is supplied as uncontaminated and all four shown spots are distinct and resolved. No complete inventory of other overlapping or undetected components is supplied.",
  },
  reviewAmeasurement: {
    title: "Original delayed coordinate record",
    origin: 24,
    front: 104,
    top: 120,
    unit: "mm",
    phaseNote:
      "Paper and a suitable solvent; source positions measured above the paper bottom.",
    lanes: [{ label: "Sample", centres: [72], colour: "purple" }],
    note: "The original source uses a millimetre scale measured above the paper bottom.",
  },
};
function freeze(x: unknown) {
  if (x && typeof x === "object") {
    Object.values(x).forEach(freeze);
    Object.freeze(x);
  }
}
freeze(chromaGivenSources);
