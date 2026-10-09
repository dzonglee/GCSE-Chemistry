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
  levels?: { min: number; max: number; text: string }[];
}
export interface ExamPaper {
  id: string;
  totalMarks: number;
  minutes: number;
  parts: ExamPart[];
}
