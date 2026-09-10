// Shared formatting helpers — consolidates PKR/date formatting that was
// previously repeated inline across ProductCard, CartItem, OrderSummary,
// admin orders/reports pages, etc.

export function formatCurrency(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString()}`;
}

export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", options);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}