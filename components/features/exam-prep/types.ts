export type UserRole = "student" | "teacher";
export type StudentExamMode = "flashcards" | "theory" | "mcq";
export type StudentDifficulty = "adaptive" | "easy" | "medium" | "hard";

export type SubjectOption = {
  id: string;
  name: string;
  description: string;
  color?: string;
};

export type QuestionMix = {
  mcq: boolean;
  theory: boolean;
  flashcards: boolean;
};
