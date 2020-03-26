export function random<T>(list: T[] = []) {
  return list[randomIndex(list)];
}

export function randomIndex<T>(list: T[] = []) {
  return Math.floor(Math.random() * list.length);
}
