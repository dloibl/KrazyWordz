import { BotProfile } from "../model/BotProfile";
import { CandidateScore } from "./types";
import { clamp } from "./rng";

export function applyAssignmentBias(
  candidateScores: CandidateScore[],
  botProfile: BotProfile,
  random: () => number
): CandidateScore[] {
  return candidateScores.map((candidate) => {
    const skillNoise = (1 - botProfile.deduction) * (random() - 0.5) * 0.35;
    const humorLift = botProfile.humor * (random() - 0.4) * 0.08;
    const deceptionLift =
      botProfile.deception > 0.7 &&
      candidate.score > 0.35 &&
      candidate.score < 0.75
        ? botProfile.deception * 0.05
        : 0;

    return {
      ...candidate,
      score: clamp(candidate.score + skillNoise + humorLift + deceptionLift),
    };
  });
}

export function chooseAssignmentFromRankedCandidates(
  candidateScores: CandidateScore[],
  botProfile: BotProfile,
  random: () => number
): CandidateScore | undefined {
  const ranked = candidateScores
    .slice()
    .sort((a, b) => b.score - a.score)
    .filter((candidate) => candidate.score > 0.05);

  if (!ranked.length) {
    return undefined;
  }

  const roll = random();
  const secondChoiceChance =
    botProfile.mistakeRate * 0.8 + (1 - botProfile.deduction) * 0.2;
  const thirdChoiceChance =
    botProfile.mistakeRate * 0.35 + botProfile.humor * 0.08;

  if (ranked[2] && roll < thirdChoiceChance) {
    return ranked[2];
  }
  if (ranked[1] && roll < thirdChoiceChance + secondChoiceChance) {
    return ranked[1];
  }
  return ranked[0];
}
