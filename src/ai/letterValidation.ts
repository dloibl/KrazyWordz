export function normalizeWord(word: string): string {
  return word
    .normalize("NFC")
    .replace(/[^A-Za-zÄÖÜäöüß]/g, "")
    .toUpperCase()
    .replace(/ß/g, "SS");
}

export function validateWordUsesOnlyAllowedLetters(
  word: string,
  availableLetters: string[]
): boolean {
  const normalizedWord = normalizeWord(word);
  if (normalizedWord.length === 0) {
    return true;
  }

  const availableCounts = countLetters(availableLetters.map(normalizeWord));
  const wordCounts = countLetters(normalizedWord.split(""));

  return Object.entries(wordCounts).every(
    ([letter, count]) => (availableCounts[letter] || 0) >= count
  );
}

export function createFallbackWord(
  availableLetters: string[],
  creativity: number,
  random: () => number
): string {
  const normalizedLetters = availableLetters
    .map(normalizeWord)
    .flatMap((letter) => letter.split(""))
    .filter(Boolean);

  if (normalizedLetters.length === 0 || random() < creativity * 0.06) {
    return "";
  }

  const vowels = normalizedLetters.filter(isVowel);
  const consonants = normalizedLetters.filter((letter) => !isVowel(letter));
  const targetLength = Math.max(
    2,
    Math.min(
      normalizedLetters.length,
      Math.round(3 + creativity * 4 + random() * 2)
    )
  );
  const result: string[] = [];

  while (result.length < targetLength && (vowels.length || consonants.length)) {
    const preferVowel = result.length % 2 === 1;
    const source =
      preferVowel && vowels.length
        ? vowels
        : !preferVowel && consonants.length
        ? consonants
        : vowels.length
        ? vowels
        : consonants;
    result.push(takeRandom(source, random));
  }

  return result.join("");
}

function countLetters(letters: string[]): Record<string, number> {
  return letters.reduce<Record<string, number>>((counts, letter) => {
    for (const char of letter) {
      counts[char] = (counts[char] || 0) + 1;
    }
    return counts;
  }, {});
}

function isVowel(letter: string): boolean {
  return ["A", "E", "I", "O", "U", "Ä", "Ö", "Ü", "Y"].includes(letter);
}

function takeRandom(items: string[], random: () => number): string {
  const index = Math.floor(random() * items.length);
  const [item] = items.splice(index, 1);
  return item;
}
