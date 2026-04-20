import {
  AIAssignmentEvaluationInput,
  AIWordGenerationInput,
} from "./types";

export const WORD_GENERATION_SYSTEM_INSTRUCTION =
  "You generate one invented fantasy word or an intentionally empty answer for a party word game. Prefer German associations, but allow English, French, Spanish, Latin, or other familiar language hints when they fit the task card. Follow the letter constraints exactly. Return only valid compact JSON.";

export const ASSIGNMENT_EVALUATION_SYSTEM_INSTRUCTION =
  "You score likely matches in a mostly German party word game. German associations are most likely, but English, French, Spanish, Latin, and other familiar language hints may be relevant. Return only compact JSON. Do not decide the final game action.";

export function buildWordGenerationPrompt(
  input: AIWordGenerationInput
): string {
  return [
    `Task card: ${input.questionCard}`,
    `Available letters: ${JSON.stringify(input.availableLetters)}`,
    `Bot style: ${input.botProfile.style}`,
    `Creativity: ${input.botProfile.creativity}`,
    `Deception: ${input.botProfile.deception}`,
    `Humor: ${input.botProfile.humor}`,
    "",
    "Rules:",
    "- Create exactly one invented word, or an empty word if that is a fitting hint.",
    "- Use only the available letters.",
    "- Do not use any letter more often than it appears.",
    "- You do not need to use all letters.",
    "- The word should sound plausible for the task card, but only hint at it.",
    "- Prefer German-language play, but other familiar language associations are allowed when useful.",
    "- No explanation.",
    "",
    'Return JSON: {"word":"..."}',
  ].join("\n");
}

export function buildAssignmentEvaluationPrompt(
  input: AIAssignmentEvaluationInput
): string {
  return [
    "Question cards:",
    JSON.stringify(input.allQuestionCards),
    "",
    "Submitted words:",
    JSON.stringify(input.allSubmittedWords),
    "",
    "Bot:",
    JSON.stringify({
      name: input.botProfile.name,
      style: input.botProfile.style,
      deduction: input.botProfile.deduction,
      mistakeRate: input.botProfile.mistakeRate,
      humor: input.botProfile.humor,
    }),
    "",
    `Self player id: ${input.selfPlayerId}`,
    `Self card id: ${input.selfQuestionCard.cardId}`,
    `Self word: ${input.selfWord}`,
    "",
    "Rules:",
    "- Score possible matches between submitted words and question cards.",
    "- Do not include the bot's own word.",
    "- Do not include the bot's own card.",
    "- Empty words are valid submitted hints and must be scored like other words.",
    "- Return scores from 0 to 1.",
    "- Prefer a spread of plausible candidates, not only perfect matches.",
    "- reasoningTag must be short.",
    "",
    'Return JSON: {"scores":[{"wordPlayerId":"...","cardId":"...","score":0.72,"reasoningTag":"sound_hint"}]}',
  ].join("\n");
}
