export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function convertDateToTimestamp(date: Date): number {
  return date.getTime();
}

export function toPaymentDateFromDay(
  day: number,
  year?: number,
  month?: number
): number {
  const y = year ?? getCurrentYear();
  const m = (month ?? getCurrentMonth()) - 1;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const d = Math.min(day, daysInMonth);
  return new Date(y, m, d).getTime();
}
