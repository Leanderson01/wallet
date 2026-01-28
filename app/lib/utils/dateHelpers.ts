export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function convertDateToTimestamp(date: Date): number {
  return date.getTime();
}
