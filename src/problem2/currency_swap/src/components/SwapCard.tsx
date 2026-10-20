import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { convert, formatAmount, formatRate, formatUpdated, formatUsd, parseAmount, sanitizeAmount, toRaw } from "../lib/money";
import { latestUpdate, pickPair } from "../lib/prices";
import type { Receipt, Token } from "../types";
import { TokenDialog } from "./TokenDialog";
import { TokenIcon } from "./TokenIcon";

type Side = "pay" | "receive";

type SwapCardProps = {
  tokens: Token[];
};

export function SwapCard({ tokens }: SwapCardProps) {
  const defaults = pickPair(tokens);
  const [fromSymbol, setFromSymbol] = useState(defaults.from);
  const [toSymbol, setToSymbol] = useState(defaults.to);
  const [payInput, setPayInput] = useState("");
  const [receiveInput, setReceiveInput] = useState("");
  const [side, setSide] = useState<Side>("pay");
  const [inverted, setInverted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [picker, setPicker] = useState<Side | null>(null);
  const [turns, setTurns] = useState(0);

  const payRef = useRef<HTMLInputElement>(null);
  const payButtonRef = useRef<HTMLButtonElement>(null);
  const receiveButtonRef = useRef<HTMLButtonElement>(null);

  const from = tokens.find((token) => token.symbol === fromSymbol) ?? tokens[0];
  const to = tokens.find((token) => token.symbol === toSymbol) ?? tokens.find((token) => token.symbol !== from.symbol) ?? tokens[0];

  useEffect(() => {
    if (!shake) return;
    const id = window.setTimeout(() => setShake(false), 420);
    return () => window.clearTimeout(id);
  }, [shake]);

  function fail(message: string) {
    setError(message);
    setShake(true);
  }

  function edit(which: Side, raw: string) {
    const next = sanitizeAmount(raw);
    if (next === null) return;
    setSide(which);
    setError(null);
    setReceipt(null);
    const amount = parseAmount(next);
    if (which === "pay") {
      setPayInput(next);
      setReceiveInput(amount != null && amount > 0 ? quoted(amount, from.price, to.price) : "");
    } else {
      setReceiveInput(next);
      setPayInput(amount != null && amount > 0 ? quoted(amount, to.price, from.price) : "");
    }
  }

  function flip() {
    setFromSymbol(to.symbol);
    setToSymbol(from.symbol);
    setPayInput(receiveInput);
    setReceiveInput(payInput);
    setSide((current) => (current === "pay" ? "receive" : "pay"));
    setTurns((current) => current + 1);
    setInverted(false);
    setError(null);
    setReceipt(null);
  }

  function selectToken(symbol: string) {
    if (!picker) return;
    const current = picker === "pay" ? from.symbol : to.symbol;
    if (symbol === current) {
      closePicker();
      return;
    }

    let nextFrom = from;
    let nextTo = to;
    if (picker === "pay") {
      if (symbol === to.symbol) nextTo = from;
      nextFrom = tokens.find((token) => token.symbol === symbol) ?? from;
    } else {
      if (symbol === from.symbol) nextFrom = to;
      nextTo = tokens.find((token) => token.symbol === symbol) ?? to;
    }

    setFromSymbol(nextFrom.symbol);
    setToSymbol(nextTo.symbol);
    const source = side === "pay" ? payInput : receiveInput;
    const amount = parseAmount(source);
    if (side === "pay") {
      setReceiveInput(amount != null && amount > 0 ? quoted(amount, nextFrom.price, nextTo.price) : "");
    } else {
      setPayInput(amount != null && amount > 0 ? quoted(amount, nextTo.price, nextFrom.price) : "");
    }
    setInverted(false);
    setError(null);
    setReceipt(null);
    closePicker();
  }

  function closePicker() {
    const which = picker;
    setPicker(null);
    window.requestAnimationFrame(() => {
      (which === "pay" ? payButtonRef : receiveButtonRef).current?.focus();
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (from.symbol === to.symbol) {
      fail("Choose two different tokens.");
      return;
    }
    if (!payInput.trim() || payInput === ".") {
      fail("Enter an amount to swap.");
      payRef.current?.focus();
      return;
    }
    const pay = parseAmount(payInput);
    if (pay == null) {
      fail("Enter a valid amount.");
      payRef.current?.focus();
      return;
    }
    if (pay <= 0) {
      fail("Amount must be greater than zero.");
      payRef.current?.focus();
      return;
    }
    const receive = parseAmount(receiveInput);
    if (receive == null || receive <= 0) {
      fail("Could not calculate an amount to receive.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: from.symbol, to: to.symbol, amount: pay }),
      });
      const data: Receipt & { message?: string } = await response.json();
      if (!response.ok) {
        fail(data.message ?? "The swap could not be completed.");
        return;
      }
      setReceipt({
        pay: data.pay,
        receive: data.receive,
        from: data.from,
        to: data.to,
        rate: data.rate,
        value: data.value,
      });
    } catch {
      fail("Could not reach the swap service.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setReceipt(null);
    setPayInput("");
    setReceiveInput("");
    setSide("pay");
    setError(null);
    window.requestAnimationFrame(() => payRef.current?.focus());
  }

  if (receipt) {
    return (
      <section className="card">
        <ReceiptView receipt={receipt} onReset={reset} />
      </section>
    );
  }

  const payAmount = parseAmount(payInput);
  const valueUsd = payAmount != null && payAmount > 0 ? payAmount * from.price : null;
  const rateBase = inverted ? to : from;
  const rateQuote = inverted ? from : to;
  const unitRate = rateBase.price / rateQuote.price;

  return (
    <section className={shake ? "card shake" : "card"}>
      <p className="meta">
        {tokens.length} tokens
        <span aria-hidden="true"> · </span>
        Updated {formatUpdated(latestUpdate(tokens))}
      </p>
      <form onSubmit={onSubmit} noValidate>
        <AmountPanel
          id="pay-amount"
          label="You pay"
          inputRef={payRef}
          buttonRef={payButtonRef}
          value={payInput}
          usd={valueUsd}
          symbol={from.symbol}
          expanded={picker === "pay"}
          invalid={Boolean(error)}
          describedBy={error ? "swap-error" : undefined}
          onChange={(value) => edit("pay", value)}
          onPick={() => setPicker("pay")}
        />
        <div className="flip-row">
          <button type="button" className="flip" onClick={flip} aria-label="Switch tokens">
            <FlipIcon turns={turns} />
          </button>
        </div>
        <AmountPanel
          id="receive-amount"
          label="You receive"
          buttonRef={receiveButtonRef}
          value={receiveInput}
          usd={valueUsd}
          symbol={to.symbol}
          expanded={picker === "receive"}
          invalid={Boolean(error)}
          describedBy={error ? "swap-error" : undefined}
          onChange={(value) => edit("receive", value)}
          onPick={() => setPicker("receive")}
        />

        {error ? (
          <p id="swap-error" className="alert" role="alert">
            {error}
          </p>
        ) : null}

        <div className="rate">
          <button
            type="button"
            className="rate-btn"
            onClick={() => setInverted((value) => !value)}
            aria-label={`Invert rate. Currently 1 ${rateBase.symbol} equals ${formatRate(unitRate)} ${rateQuote.symbol}`}
          >
            <span>
              1 {rateBase.symbol} = <span className="rate-num">{formatRate(unitRate)}</span> {rateQuote.symbol}
            </span>
            <SwapMiniIcon />
          </button>
        </div>

        <button className="submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Swapping…
            </>
          ) : (
            "Confirm swap"
          )}
        </button>
      </form>

      {picker ? (
        <TokenDialog
          tokens={tokens}
          selected={picker === "pay" ? from.symbol : to.symbol}
          onSelect={selectToken}
          onClose={closePicker}
        />
      ) : null}
    </section>
  );
}

function quoted(amount: number, fromPrice: number, toPrice: number): string {
  const value = convert(amount, fromPrice, toPrice);
  return value != null && value > 0 ? toRaw(value) : "";
}

type AmountPanelProps = {
  id: string;
  label: string;
  value: string;
  usd: number | null;
  symbol: string;
  expanded: boolean;
  invalid: boolean;
  describedBy?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  buttonRef: RefObject<HTMLButtonElement | null>;
  onChange: (value: string) => void;
  onPick: () => void;
};

function AmountPanel({
  id,
  label,
  value,
  usd,
  symbol,
  expanded,
  invalid,
  describedBy,
  inputRef,
  buttonRef,
  onChange,
  onPick,
}: AmountPanelProps) {
  return (
    <div className="panel">
      <div className="panel-top">
        <label htmlFor={id}>{label}</label>
        <span className="usd">{usd == null ? "" : `≈ ${formatUsd(usd)}`}</span>
      </div>
      <div className="panel-row">
        <input
          id={id}
          ref={inputRef}
          className="amount"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="0"
          value={value}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          style={{ fontSize: value.length > 12 ? 22 : undefined }}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          ref={buttonRef}
          type="button"
          className="token-btn"
          aria-haspopup="dialog"
          aria-expanded={expanded}
          onClick={onPick}
        >
          <TokenIcon symbol={symbol} size={24} />
          <span className="sym">{symbol}</span>
          <ChevronIcon />
        </button>
      </div>
    </div>
  );
}

function ReceiptView({ receipt, onReset }: { receipt: Receipt; onReset: () => void }) {
  return (
    <div className="receipt">
      <div className="mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path d="M5 12.5l4.2 4.2L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2>Swap confirmed</h2>
      <p className="receipt-lead">The swap service confirmed this quote.</p>
      <div className="receipt-line">
        <TokenIcon symbol={receipt.from} size={28} />
        <span>
          <strong>{formatAmount(receipt.pay)}</strong> {receipt.from}
        </span>
      </div>
      <div className="receipt-arrow" aria-hidden="true">
        ↓
      </div>
      <div className="receipt-line">
        <TokenIcon symbol={receipt.to} size={28} />
        <span>
          <strong>{formatAmount(receipt.receive)}</strong> {receipt.to}
        </span>
      </div>
      <dl className="receipt-meta">
        <div>
          <dt>Rate</dt>
          <dd>
            1 {receipt.from} = {formatRate(receipt.rate)} {receipt.to}
          </dd>
        </div>
        <div>
          <dt>Value</dt>
          <dd>{formatUsd(receipt.value)}</dd>
        </div>
      </dl>
      <p className="fine">Preview only. Nothing is sent on-chain.</p>
      <button type="button" className="submit" onClick={onReset}>
        New swap
      </button>
    </div>
  );
}

function FlipIcon({ turns }: { turns: number }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style={{ transform: `rotate(${turns * 180}deg)` }}>
      <path
        d="M12 4v16M7 15l5 5 5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="chev" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SwapMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M7 7h11M15 4l3 3-3 3M17 17H6M9 14l-3 3 3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
