import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT) || 3001;
const PRICES_URL = "https://interview.switcheo.com/prices.json";
const SUBMIT_DELAY_MS = 800;

const app = express();
app.use(express.json());

app.post("/api/swap", async (req, res) => {
  const from = typeof req.body?.from === "string" ? req.body.from.trim() : "";
  const to = typeof req.body?.to === "string" ? req.body.to.trim() : "";
  const pay = Number(req.body?.amount);

  if (!from || !to) {
    res.status(400).json({ message: "Choose two tokens." });
    return;
  }
  if (from === to) {
    res.status(400).json({ message: "Choose two different tokens." });
    return;
  }
  if (!Number.isFinite(pay) || pay <= 0) {
    res.status(400).json({ message: "Amount must be greater than zero." });
    return;
  }

  try {
    const tokens = await loadTokens();
    const fromToken = tokens.get(from);
    const toToken = tokens.get(to);
    if (!fromToken || !toToken) {
      res.status(400).json({ message: "One of these tokens has no price." });
      return;
    }

    const receive = (pay * fromToken.price) / toToken.price;
    if (!Number.isFinite(receive) || receive <= 0) {
      res.status(400).json({ message: "Could not calculate an amount to receive." });
      return;
    }

    await delay(SUBMIT_DELAY_MS);
    res.json({
      pay,
      receive,
      from: fromToken.symbol,
      to: toToken.symbol,
      rate: fromToken.price / toToken.price,
      value: pay * fromToken.price,
    });
  } catch {
    res.status(502).json({ message: "Could not load token prices." });
  }
});

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
if (fs.existsSync(path.join(dist, "index.html"))) {
  app.use(express.static(dist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Swap API listening on http://localhost:${PORT}`);
});

async function loadTokens() {
  const response = await fetch(PRICES_URL);
  if (!response.ok) throw new Error(`Price request failed (${response.status})`);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error("Unexpected price data");

  const latest = new Map();
  for (const row of rows) {
    if (!row || typeof row.currency !== "string" || typeof row.price !== "number") continue;
    const symbol = row.currency.trim();
    if (!symbol || !Number.isFinite(row.price) || row.price <= 0) continue;
    const date = typeof row.date === "string" ? row.date : "";
    const existing = latest.get(symbol);
    if (!existing || date >= existing.updatedAt) {
      latest.set(symbol, { symbol, price: row.price, updatedAt: date });
    }
  }
  return latest;
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
