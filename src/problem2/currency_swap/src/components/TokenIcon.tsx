import { useEffect, useState } from "react";
import { iconUrl } from "../lib/prices";

type TokenIconProps = {
  symbol: string;
  size?: number;
};

export function TokenIcon({ symbol, size = 28 }: TokenIconProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [symbol]);

  if (failed) {
    const hue = [...symbol].reduce((sum, char) => (sum * 33 + char.charCodeAt(0)) % 360, 0);
    return (
      <span
        className="token-fallback"
        style={{ width: size, height: size, background: `hsl(${hue} 42% 38%)` }}
        aria-hidden="true"
      >
        {symbol.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      className="token-icon"
      src={iconUrl(symbol)}
      alt=""
      width={size}
      height={size}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
