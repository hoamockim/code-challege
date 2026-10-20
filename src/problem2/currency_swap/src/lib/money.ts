export function sanitizeAmount(raw: string): string | null {
  const compact = raw.replace(/[$,\s]/g, "");
  if (compact === "") return "";
  if (!/^\d*\.?\d*$/.test(compact)) return null;

  const hasDot = compact.includes(".");
  let [whole, fraction = ""] = compact.split(".");
  whole = whole.replace(/^0+(?=\d)/, "");
  if (whole.length > 12) return null;
  if (whole === "") whole = "0";
  fraction = fraction.slice(0, 8);
  return hasDot ? `${whole}.${fraction}` : whole;
}

export function parseAmount(value: string): number | null {
  if (!value || value === ".") return null;
  const normalized = value.endsWith(".") ? value.slice(0, -1) : value;
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

export function convert(amount: number, fromPrice: number, toPrice: number): number | null {
  if (!Number.isFinite(amount) || fromPrice <= 0 || toPrice <= 0) return null;
  const value = (amount * fromPrice) / toPrice;
  return Number.isFinite(value) ? value : null;
}

export function toRaw(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  const abs = Math.abs(value);
  const decimals = abs >= 1000 ? 4 : abs >= 1 ? 6 : 8;
  const fixed = value.toFixed(decimals).replace(/\.?0+$/, "");
  if (fixed !== "0") return fixed;
  const tiny = value.toFixed(12).replace(/\.?0+$/, "");
  return tiny === "0" ? "0" : tiny;
}

export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const digits = abs >= 1000 ? 2 : abs >= 1 ? 4 : abs >= 0.01 ? 6 : 8;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const digits = abs > 0 && abs < 0.01 ? 4 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.max(2, digits),
  }).format(value);
}

export function formatRate(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const digits = abs >= 1000 ? 2 : abs >= 1 ? 4 : abs >= 0.01 ? 6 : 8;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

export function formatUpdated(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hourCycle: "h23",
  }).format(date);
  return `${formatted} UTC`;
}
