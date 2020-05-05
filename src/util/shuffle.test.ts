import { shuffle } from "./shuffle";

test("shuffle", () => {
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  expect(shuffle(array)).not.toEqual(array);
});
