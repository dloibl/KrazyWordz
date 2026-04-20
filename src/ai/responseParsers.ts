import { CandidateScore } from "./types";
import { clamp } from "./rng";

export interface ParsedWordResponse {
  word?: string;
  failureType?: "emptyResponse" | "invalidJson" | "missingWord";
}

export interface ParsedScoresResponse {
  scores: CandidateScore[];
  failureType?: "emptyResponse" | "invalidJson" | "missingScores";
}

export function parseWordResponse(text: string): ParsedWordResponse {
  if (!text.trim()) {
    return { failureType: "emptyResponse" };
  }
  const json = parseJsonObject(text);
  if (!json) {
    return { failureType: "invalidJson" };
  }
  if (!Object.prototype.hasOwnProperty.call(json, "word")) {
    return { failureType: "missingWord" };
  }
  return { word: String(json.word ?? "") };
}

export function parseScoresResponse(text: string): ParsedScoresResponse {
  if (!text.trim()) {
    return { scores: [], failureType: "emptyResponse" };
  }
  const json = parseJsonObject(text);
  if (!json) {
    return { scores: [], failureType: "invalidJson" };
  }
  if (!Array.isArray(json.scores)) {
    return { scores: [], failureType: "missingScores" };
  }

  return {
    scores: json.scores
      .map(toCandidateScore)
      .filter((score): score is CandidateScore => score != null),
  };
}

function toCandidateScore(value: unknown): CandidateScore | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.wordPlayerId !== "string" ||
    typeof candidate.cardId !== "string" ||
    typeof candidate.score !== "number"
  ) {
    return undefined;
  }
  return {
    wordPlayerId: candidate.wordPlayerId,
    cardId: candidate.cardId,
    score: clamp(candidate.score),
    reasoningTag:
      typeof candidate.reasoningTag === "string"
        ? candidate.reasoningTag.slice(0, 40)
        : undefined,
  };
}

function parseJsonObject(text: string): Record<string, unknown> | undefined {
  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  if (start < 0 || end < start) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(unfenced.slice(start, end + 1));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : undefined;
  } catch {
    return undefined;
  }
}
