export function timeDifferenceInSeconds(date1: Date, date2: Date) {
  return Math.floor(Math.abs(date2.getTime() - date1.getTime()) / 1000);
}
