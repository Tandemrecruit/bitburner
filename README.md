# Puffin Planes COO Dump Builder

A small Vite + React app for capturing a **Puffin Planes** game-state snapshot and exporting it as a structured JSON briefing that can be pasted into ChatGPT. The exported dump asks ChatGPT to act as COO, review the current operating state, identify risks and opportunities, and recommend next actions.

## What it captures

The app includes editable sections for:

- Executive context: save name, in-game date, cash, weekly profit, reputation, and risk tolerance.
- COO objectives: strategic goals that should guide the recommendation.
- Fleet: aircraft ID, model, assigned route, age, condition, utilization, and margin.
- Routes: demand, competition, satisfaction, and route-specific notes.
- Staffing: pilots, cabin crew, mechanics, morale, and open roles.
- Strategic constraints: cash floors, expansion preferences, or other operating limits.

It also calculates an operational health score and generates a live JSON dump for ChatGPT.

## Prerequisites

- Node.js 20 or newer
- npm

## Install

```bash
npm install
```

## Run locally

```bash
npm start
```

Then open the local URL printed by Vite in your browser.

## Build for production

```bash
npm run build
```

The production build is written to `dist/`.

## Preview the production build

```bash
npm run preview
```

## Using the COO dump with ChatGPT

1. Fill in or edit the game-state fields in the app.
2. Review the generated JSON in the **ChatGPT-ready COO dump** panel.
3. Click **Copy dump** to copy it to your clipboard, or **Download JSON** to save it as `puffin-planes-coo-dump.json`.
4. Paste the JSON into ChatGPT and ask for an operating plan, prioritization, risk review, or next-turn recommendations.

## Notes

- The app runs entirely in the browser and does not send game data to a backend.
- Local build output and environment files are ignored by Git.
