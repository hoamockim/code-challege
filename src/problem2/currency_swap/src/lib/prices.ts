import type { Token } from "../types";

const PRICES_URL = "https://interview.switcheo.com/prices.json";

export const TOKEN_ICON_BASE = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export function iconUrl(symbol: string): string {
  return `${TOKEN_ICON_BASE}/${encodeURIComponent(symbol)}.svg`;
}

type PriceRow = {
  currency: string;
  date: string;
  price: number;
};

function isPriceRow(value: unknown): value is PriceRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.currency === "string" && typeof row.date === "string" && typeof row.price === "number";
}

export function normalizePrices(rows: unknown[]): Token[] {
  const latest = new Map<string, Token>();

  for (const value of rows) {
    if (!isPriceRow(value)) continue;
    const symbol = value.currency.trim();
    if (!symbol || !Number.isFinite(value.price) || value.price <= 0) continue;

    const existing = latest.get(symbol);
    if (!existing || value.date >= existing.updatedAt) {
      latest.set(symbol, {
        symbol,
        price: value.price,
        updatedAt: value.date,
      });
    }
  }

  return [...latest.values()].sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export async function fetchTokens(): Promise<Token[]> {
  const response = await fetch(PRICES_URL);
  if (!response.ok) {
    throw new Error(`Price request failed (${response.status})`);
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected price data");
  }
  return normalizePrices(data);
}

const PREFERRED_RECEIVE = ["USDC", "ETH", "USD", "ATOM"];

export function pickPair(tokens: Token[]): { from: string; to: string } {
  const symbols = new Set(tokens.map((token) => token.symbol));
  const from = symbols.has("SWTH") ? "SWTH" : tokens[0].symbol;
  const to =
    PREFERRED_RECEIVE.find((symbol) => symbols.has(symbol) && symbol !== from) ??
    tokens.find((token) => token.symbol !== from)?.symbol ??
    tokens[0].symbol;
  return { from, to };
}

export function latestUpdate(tokens: Token[]): string {
  return tokens.reduce((max, token) => (token.updatedAt > max ? token.updatedAt : max), tokens[0]?.updatedAt ?? "");
}
