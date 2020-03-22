export function random(list: string[] = []) {
  return list[Math.floor(Math.random() * list.length)];
}
