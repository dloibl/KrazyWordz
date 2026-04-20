export interface BotProfile {
  id: string;
  name: string;
  style: string;
  creativity: number;
  deduction: number;
  deception: number;
  humor: number;
  mistakeRate: number;
}

export const BOT_PROFILES: BotProfile[] = [
  {
    id: "professor",
    name: "Professor",
    style: "gelehrt, genau, leicht altmodisch",
    creativity: 0.55,
    deduction: 0.88,
    deception: 0.22,
    humor: 0.28,
    mistakeRate: 0.08,
  },
  {
    id: "chaotic",
    name: "Chaos",
    style: "sprunghaft, verspielt, unerwartet",
    creativity: 0.92,
    deduction: 0.42,
    deception: 0.38,
    humor: 0.85,
    mistakeRate: 0.28,
  },
  {
    id: "poetic",
    name: "Poet",
    style: "bildhaft, weich, klangverliebt",
    creativity: 0.82,
    deduction: 0.62,
    deception: 0.35,
    humor: 0.5,
    mistakeRate: 0.16,
  },
  {
    id: "trickster",
    name: "Trickster",
    style: "doppeldeutig, listig, knapp daneben",
    creativity: 0.75,
    deduction: 0.68,
    deception: 0.9,
    humor: 0.72,
    mistakeRate: 0.2,
  },
  {
    id: "pragmatic",
    name: "Pragma",
    style: "kurz, trocken, naheliegend",
    creativity: 0.38,
    deduction: 0.74,
    deception: 0.18,
    humor: 0.2,
    mistakeRate: 0.12,
  },
];

export function chooseBotProfiles(count: number) {
  return BOT_PROFILES.slice(0, Math.max(0, Math.min(count, 4)));
}
