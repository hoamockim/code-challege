# Currency Swap

A token swap form. Pick two tokens, enter an amount on either side, and the other side updates from the [Switcheo price feed](https://interview.switcheo.com/prices.json). Token icons come from the [Switcheo token icon set](https://github.com/Switcheo/token-icons).

Confirm does not send a transaction. It calls a mock Express server, which quotes the swap and returns the result.

## Requirements

- Node.js 20 or newer
- npm
- An internet connection, so the app can load prices and icons

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173/.

`npm run dev` starts both processes:

| Process | Address | Role |
| --- | --- | --- |
| Vite | http://localhost:5173/ | The swap form. Requests to `/api` are forwarded to the mock server. |
| Express | http://localhost:3001/ | The mock swap API. |

To run the mock server on its own:

```bash
npm run server
```

## Mock server

`server/index.js` is a small Express app. It stands in for a backend so the confirm button can show a real request: the button switches to **Swapping…** and stays disabled until the response arrives.

`POST /api/swap`

```json
{
  "from": "SWTH",
  "to": "USDC",
  "amount": 100
}
```

The server loads the price feed, keeps the newest price for each token, waits about 800ms, and responds:

```json
{
  "pay": 100,
  "receive": 0.40403423,
  "from": "SWTH",
  "to": "USDC",
  "rate": 0.00404034,
  "value": 0.40398505
}
```

`receive` is `amount * fromPrice / toPrice`. `value` is the pay amount in USD. A missing token, a non-positive amount, or two identical symbols returns `400` with a `message`. If the price feed cannot be loaded, the response is `502`.

Try it directly:

```bash
curl -s -X POST http://localhost:3001/api/swap \
  -H 'Content-Type: application/json' \
  -d '{"from":"SWTH","to":"USDC","amount":100}'
```

## Production build

```bash
npm run build
npm start
```

`build` typechecks the project and writes the static files to `dist/`. `npm start` serves those files and the mock API together at http://localhost:3001/.
