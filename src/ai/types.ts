import { BotProfile } from "../model/BotProfile";

export type Difficulty = "easy" | "normal" | "hard";

export interface AIWordGenerationInput {
  questionCard: string;
  availableLetters: string[];
  botProfile: BotProfile;
  difficulty?: Difficulty;
}

export interface AIWordGenerationOutput {
  word: string;
  source: "llm" | "fallback";
}

export interface SubmittedWord {
  playerId: string;
  word: string;
}

export interface QuestionCardOption {
  cardId: string;
  text: string;
}

export interface AIAssignmentEvaluationInput {
  allQuestionCards: QuestionCardOption[];
  allSubmittedWords: SubmittedWord[];
  selfPlayerId: string;
  selfQuestionCard: QuestionCardOption;
  selfWord: string;
  botProfile: BotProfile;
  difficulty?: Difficulty;
}

export interface CandidateScore {
  wordPlayerId: string;
  cardId: string;
  score: number;
  reasoningTag?: string;
}

export interface AIAssignmentEvaluationOutput {
  candidateScores: CandidateScore[];
  source: "llm" | "fallback" | "mixed";
}
