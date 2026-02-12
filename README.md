# Wind Power Forecast (Frontend)

React SPA for wind power forecasting with login/register, configuration, and chart visualization.

## Requirements

- Node.js 18+ recommended
- npm 9+ recommended

## Install

```
npm install
```

## Environment

Create `.env` in the project root:

```
VITE_N8N_BASE_URL=http://localhost:5678/webhook/
VITE_DEBUG_MODE=1
```

Notes:
- `VITE_N8N_BASE_URL` can be changed for VPS/prod.
- `VITE_DEBUG_MODE=1` shows the API mode banner and login debug box.

## Run (Dev)

```
npm run dev
```

## Build

```
npm run build
```

## API Reference

See `docs/09_api_reference.md`.

## UI Flow

- Login → Config → Chart
- Register → Login

## Troubleshooting

- Env changes require restarting `npm run dev`.
- If API calls fail due to CORS in dev, use the Vite proxy or enable CORS on the API.

