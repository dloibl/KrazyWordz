import { BotProfile } from "../model/BotProfile";
import {
  ASSIGNMENT_EVALUATION_SYSTEM_INSTRUCTION,
  buildAssignmentEvaluationPrompt,
  buildWordGenerationPrompt,
  WORD_GENERATION_SYSTEM_INSTRUCTION,
} from "./prompts";
import { generateAIText } from "./firebaseAiClient";
import { parseScoresResponse, parseWordResponse } from "./responseParsers";
import {
  createFallbackWord,
  normalizeWord,
  validateWordUsesOnlyAllowedLetters,
} from "./letterValidation";
import {
  applyAssignmentBias,
  chooseAssignmentFromRankedCandidates,
} from "./assignmentBias";
import { createSeededRng } from "./rng";
import {
  AIAssignmentEvaluationInput,
  AIWordGenerationInput,
  CandidateScore,
  QuestionCardOption,
  SubmittedWord,
} from "./types";

export async function generateBotWord(input: {
  questionCard: string;
  availableLetters: string[];
  botProfile: BotProfile;
  seed: string;
}): Promise<{ word: string; source: "llm" | "fallback" }> {
  const rng = createSeededRng(`${input.seed}:word`);
  const generationInput: AIWordGenerationInput = {
    questionCard: input.questionCard,
    availableLetters: input.availableLetters,
    botProfile: input.botProfile,
  };

  try {
    const text = await generateAIText({
      systemInstruction: WORD_GENERATION_SYSTEM_INSTRUCTION,
      prompt: buildWordGenerationPrompt(generationInput),
      temperature: 0.9,
      topP: 0.9,
      maxOutputTokens: 80,
    });
    const parsed = parseWordResponse(text);
    const normalizedWord = normalizeWord(parsed.word || "");

    if (
      parsed.failureType ||
      !validateWordUsesOnlyAllowedLetters(
        normalizedWord,
        input.availableLetters
      )
    ) {
      console.warn("Bot word response invalid; using fallback", {
        failureType: parsed.failureType || "invalidLetters",
        botProfileId: input.botProfile.id,
      });
      return {
        word: createFallbackWord(
          input.availableLetters,
          input.botProfile.creativity,
          rng
        ),
        source: "fallback",
      };
    }

    return { word: normalizedWord, source: "llm" };
  } catch (error) {
    console.warn("Bot word generation failed; using fallback", {
      error,
      botProfileId: input.botProfile.id,
    });
    return {
      word: createFallbackWord(
        input.availableLetters,
        input.botProfile.creativity,
        rng
      ),
      source: "fallback",
    };
  }
}

export async function evaluateBotAssignments(input: {
  allQuestionCards: QuestionCardOption[];
  allSubmittedWords: SubmittedWord[];
  selfPlayerId: string;
  selfQuestionCard: QuestionCardOption;
  selfWord: string;
  botProfile: BotProfile;
  seed: string;
}): Promise<{
  guess: Record<string, string>;
  source: "llm" | "fallback" | "mixed";
}> {
  const rng = createSeededRng(`${input.seed}:guess`);
  const evaluationInput: AIAssignmentEvaluationInput = {
    allQuestionCards: input.allQuestionCards,
    allSubmittedWords: input.allSubmittedWords,
    selfPlayerId: input.selfPlayerId,
    selfQuestionCard: input.selfQuestionCard,
    selfWord: input.selfWord,
    botProfile: input.botProfile,
  };

  let source: "llm" | "fallback" | "mixed" = "llm";
  let candidateScores: CandidateScore[] = [];

  try {
    const text = await generateAIText({
      systemInstruction: ASSIGNMENT_EVALUATION_SYSTEM_INSTRUCTION,
      prompt: buildAssignmentEvaluationPrompt(evaluationInput),
      temperature: 0.35,
      topP: 0.8,
      maxOutputTokens: Math.max(
        600,
        input.allSubmittedWords.length * input.allQuestionCards.length * 60
      ),
    });
    const parsed = parseScoresResponse(text);
    candidateScores = sanitizeCandidateScores(
      parsed.scores,
      input.allSubmittedWords,
      input.allQuestionCards
    );

    if (
      parsed.failureType ||
      isIncomplete(
        candidateScores,
        input.allSubmittedWords,
        input.allQuestionCards
      )
    ) {
      source = candidateScores.length ? "mixed" : "fallback";
      console.warn("Bot assignment scores incomplete; adding fallbacks", {
        failureType: parsed.failureType || "missingScores",
        botProfileId: input.botProfile.id,
      });
    }
  } catch (error) {
    source = "fallback";
    console.warn("Bot assignment evaluation failed; using fallback", {
      error,
      botProfileId: input.botProfile.id,
    });
  }

  const completedScores = completeCandidateScores(
    candidateScores,
    input.allSubmittedWords,
    input.allQuestionCards,
    rng
  );
  const biasedScores = applyAssignmentBias(
    completedScores,
    input.botProfile,
    rng
  );
  const guess = chooseFullGuess(
    input.allSubmittedWords,
    input.allQuestionCards,
    biasedScores,
    input.botProfile,
    rng
  );

  return { guess, source };
}

function sanitizeCandidateScores(
  scores: CandidateScore[],
  submittedWords: SubmittedWord[],
  questionCards: QuestionCardOption[]
): CandidateScore[] {
  const wordIds = new Set(submittedWords.map((word) => word.playerId));
  const cardIds = new Set(questionCards.map((card) => card.cardId));
  const seen = new Set<string>();

  return scores.filter((score) => {
    const key = `${score.wordPlayerId}:${score.cardId}`;
    if (
      !wordIds.has(score.wordPlayerId) ||
      !cardIds.has(score.cardId) ||
      seen.has(key)
    ) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function isIncomplete(
  scores: CandidateScore[],
  submittedWords: SubmittedWord[],
  questionCards: QuestionCardOption[]
): boolean {
  return scores.length < submittedWords.length * questionCards.length;
}

function completeCandidateScores(
  scores: CandidateScore[],
  submittedWords: SubmittedWord[],
  questionCards: QuestionCardOption[],
  random: () => number
): CandidateScore[] {
  const byKey = new Map(
    scores.map((score) => [`${score.wordPlayerId}:${score.cardId}`, score])
  );

  for (const word of submittedWords) {
    for (const card of questionCards) {
      const key = `${word.playerId}:${card.cardId}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          wordPlayerId: word.playerId,
          cardId: card.cardId,
          score: fallbackScore(word.word, card.text, random),
          reasoningTag: "fallback",
        });
      }
    }
  }

  return Array.from(byKey.values());
}

function fallbackScore(
  word: string,
  cardText: string,
  random: () => number
): number {
  const normalizedWord = normalizeWord(word);
  const normalizedCard = normalizeWord(cardText);
  if (!normalizedWord) {
    return 0.22 + random() * 0.24;
  }
  const sharedLetters = new Set(
    normalizedWord.split("").filter((letter) => normalizedCard.includes(letter))
  );
  const overlap =
    sharedLetters.size / Math.max(1, new Set(normalizedWord.split("")).size);
  const lengthFit = Math.max(0, 1 - Math.abs(normalizedWord.length - 5) / 10);
  return Math.min(1, 0.18 + overlap * 0.45 + lengthFit * 0.18 + random() * 0.12);
}

function chooseFullGuess(
  submittedWords: SubmittedWord[],
  questionCards: QuestionCardOption[],
  candidateScores: CandidateScore[],
  botProfile: BotProfile,
  random: () => number
): Record<string, string> {
  const remainingCards = new Set(questionCards.map((card) => card.cardId));
  const guess: Record<string, string> = {};

  for (const word of submittedWords) {
    const candidates = candidateScores.filter(
      (candidate) =>
        candidate.wordPlayerId === word.playerId &&
        remainingCards.has(candidate.cardId)
    );
    const choice = chooseAssignmentFromRankedCandidates(
      candidates,
      botProfile,
      random
    );
    const cardId = choice?.cardId || remainingCards.values().next().value;

    if (cardId) {
      guess[cardId] = word.playerId;
      remainingCards.delete(cardId);
    }
  }

  return guess;
}
