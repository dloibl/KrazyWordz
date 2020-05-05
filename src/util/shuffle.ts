/** shuffle array, i.e. sort more or less randomly.
 *  We are only dealing with small arrays so we can neglect performance penalties  */
export function shuffle<T>(a: T[], random?: number) {
  return a.slice().sort(() => random || Math.random() - 0.5);
}
