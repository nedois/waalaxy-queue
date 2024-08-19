export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('fr').format(date);
}
