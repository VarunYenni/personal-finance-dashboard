const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const compactFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1
});

export function currency(value: number) {
  return inrFormatter.format(value);
}

export function compactCurrency(value: number) {
  return `₹${compactFormatter.format(value)}`;
}

export function percent(value: number) {
  return `${Math.round(value)}%`;
}

export function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
