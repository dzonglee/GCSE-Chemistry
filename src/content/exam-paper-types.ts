import type { Question } from "./types";

export interface PaperCriterion {
  id: string;
  text: string;
  marks: number;
}
export interface ExamPart {
  question: Question;
  number: string;
  context: string;
  topic: string;
  specification: string[];
  marks: number;
  ao: [number, number, number];
  mathematics?: boolean;
  practical?: number;
  /** Only a discrete, unambiguous answer point; never automatic method marks. */
  automaticMarks: number;
  criteria: PaperCriterion[];
  /** A worked native construction shown only after whole-paper submission. */
  referenceConstruction?: string;
  levels?: { min: number; max: number; text: string }[];
}
export interface ExamPaper {
  id: string;
  totalMarks: number;
  minutes: number;
  /** The specification used to author this original practice paper. */
  basis?: {
    board: "AQA" | "Edexcel" | "OCR";
    qualification: string;
    component: string;
    summary: string;
    specificationUrl: string;
    researchPath: string;
  };
  parts: ExamPart[];
}
