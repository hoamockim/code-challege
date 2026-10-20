import { useEffect,useMemo, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { formatUsd } from "../lib/money";
import type { Token } from "../types";
import { TokenIcon } from "./TokenIcon";

const PINNED = ["SWTH", "ETH", "WBTC", "USDC", "USD", "ATOM", "BUSD"];

type TokenDialogProps = {
  tokens: Token[];
  selected: string;
  onSelect: (symbol: string) => void;
  onClose: () => void;
};

function sortTokens(tokens: Token[], query: string): Token[] {
  const q = query.trim().toLowerCase();

  const getRank = (symbol: string): number => {
    if (!q) {
      const index = PINNED.indexOf(symbol);
      return index === -1 ? PINNED.length : index;
    }

    const normalized = symbol.toLowerCase();

    if (normalized === q) return 0;
    if (normalized.startsWith(q)) return 1;
    return 2;
  };

  return tokens
    .filter((token) =>
      !q || token.symbol.toLowerCase().includes(q),
    )
    .sort((a, b) => {
      const diff = getRank(a.symbol) - getRank(b.symbol);

      return diff || a.symbol.localeCompare(b.symbol);
    });
}

export function TokenDialog({ tokens, selected, onSelect, onClose }: TokenDialogProps) {
  const titleId = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const filtered = useMemo(
    () => sortTokens(tokens, query),
    [tokens, query],
  );
  const active = filtered.length === 0 ? 0 : Math.min(highlight, filtered.length - 1);

  useEffect(() => {
    searchRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    document.getElementById(`token-opt-${filtered[active]?.symbol}`)?.scrollIntoView({ block: "nearest" });
  }, [active, filtered]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (filtered.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((current) => Math.min(current + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const token = filtered[active];
      if (token) onSelect(token.symbol);
    }
  }

  return createPortal(
    <div className="overlay" onMouseDown={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="dialog-head">
          <h2 id={titleId}>Select a token</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <label className="search">
          <SearchIcon />
          <input
            ref={searchRef}
            value={query}
            placeholder="Search by symbol"
            aria-label="Search by symbol"
            aria-controls="token-list"
            aria-activedescendant={filtered[active] ? `token-opt-${filtered[active].symbol}` : undefined}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlight(0);
            }}
          />
        </label>
        <div id="token-list" className="token-list" role="listbox" aria-label="Tokens">
          {filtered.length === 0 ? (
            <p className="empty">No token matches "{query.trim()}".</p>
          ) : (
            filtered.map((token, index) => (
              <button
                key={token.symbol}
                id={`token-opt-${token.symbol}`}
                type="button"
                role="option"
                aria-selected={token.symbol === selected}
                data-active={index === active ? "true" : "false"}
                className="token-option"
                onMouseEnter={() => setHighlight(index)}
                onClick={() => onSelect(token.symbol)}
              >
                <TokenIcon symbol={token.symbol} size={32} />
                <span className="sym">{token.symbol}</span>
                <span className="token-price">{formatUsd(token.price)}</span>
                {token.symbol === selected ? <CheckIcon /> : null}
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16.5L20 20.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="check" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M5 12.5l4.2 4.2L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
