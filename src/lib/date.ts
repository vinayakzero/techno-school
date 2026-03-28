const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatShortDate(dateInput: string | number | Date) {
  return shortDateFormatter.format(new Date(dateInput));
}
