import { useCallback, useEffect, useRef, useState } from "react";
import { SwapCard } from "./components/SwapCard";
import { TokenIcon } from "./components/TokenIcon";
import { formatUsd } from "./lib/money";
import { fetchTokens } from "./lib/prices";
import type { Token } from "./types";

const FEATURED = ["SWTH", "ETH", "WBTC", "ATOM"];

export default function App() {
  const [tokens, setTokens] = useState<Token[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const request = ++requestId.current;
    setLoading(true);
    setError(null);
    fetchTokens()
      .then((next) => {
        if (request !== requestId.current) return;
        if (next.length < 2) {
          setTokens(null);
          setError("Not enough priced tokens to build a swap.");
          return;
        }
        setTokens(next);
        setError(null);
      })
      .catch(() => {
        if (request !== requestId.current) return;
        setTokens(null);
        setError("Could not load token prices. Check your connection and try again.");
      })
      .finally(() => {
        if (request !== requestId.current) return;
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="page">
      <div className="wrap">
        <header className="top">
          <TokenIcon symbol="SWTH" size={46} />
          <div>
            <h1>Currency Swap</h1>
            <p className="subtitle">Exchange one token for another</p>
          </div>
        </header>

        {tokens ? <QuoteStrip tokens={tokens} /> : null}

        {loading ? <LoadingCard /> : null}
        {!loading && error ? <ErrorCard message={error} onRetry={load} /> : null}
        {!loading && !error && tokens ? <SwapCard tokens={tokens} /> : null}

        <p className="footnote">Rates are crossed from USD prices in the Switcheo feed. Tokens with no price are left out.</p>
      </div>
    </main>
  );
}

function QuoteStrip({ tokens }: { tokens: Token[] }) {
  const items = FEATURED.map((symbol) => tokens.find((token) => token.symbol === symbol)).filter((token): token is Token =>
    Boolean(token),
  );
  if (items.length === 0) return null;

  return (
    <div className="quotes" aria-label="Featured prices">
      {items.map((token) => (
        <div className="quote" key={token.symbol}>
          <TokenIcon symbol={token.symbol} size={22} />
          <b>{token.symbol}</b>
          <span>{formatUsd(token.price)}</span>
        </div>
      ))}
    </div>
  );
}

function LoadingCard() {
  return (
    <section className="card" aria-busy="true" aria-live="polite">
      <p className="meta">Loading token prices…</p>
      <div className="skel skel-panel" />
      <div className="skel skel-panel" />
      <div className="skel skel-btn" />
    </section>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="card error-card">
      <h2>Prices unavailable</h2>
      <p>{message}</p>
      <button type="button" className="submit" onClick={onRetry}>
        Try again
      </button>
    </section>
  );
}
