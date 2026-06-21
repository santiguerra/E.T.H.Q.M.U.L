# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

E.T.H.Q.M.U.L is a single-page, browser-based puzzle/ARG experience built as a romantic gift. It presents a hacker-terminal aesthetic with CRT/glitch effects and walks the recipient through 10 sequential missions (ciphers, riddles, physical scavenger hunts, and personal questions) that unlock one by one.

## Running the project

No build step required — open `index.html` directly in a browser. The project is pure HTML/CSS/JS with no dependencies or package manager.

```bash
open index.html
# or serve locally:
python3 -m http.server 8080
```

## Architecture

All logic lives in three files:

- **`index.html`** — full page structure. The access screen (`.glitch-container`) and the dashboard (`#dashboard`) both live in this file; the dashboard is hidden until the correct PIN is entered.
- **`styles.css`** — CRT/glitch aesthetic using CSS variables (`--neon-wine`, `--terminal-green`, etc.), keyframe animations (`background-glitch`, `sweep`), and `.puzzle-complete` class applied to `body` when all 10 missions are solved.
- **`script.js`** — all game logic. No frameworks; plain vanilla JS.

## How the mission system works

**Entry gate:** The PIN `2351` unlocks the dashboard. After 2 failed attempts per day, `localStorage` triggers a lockdown until the next calendar day.

**Sequential unlocking:** Each `solveMissionXX(silent)` function marks the current row `.solved` and removes `.locked` from the next row. `silent=true` suppresses UI feedback (used on page reload to restore state).

**Persistence:** Mission progress is stored in `localStorage` under key `mission_progress` as a JSON object (`{ "01": "solved", ... }`). On page load, `applyStoredProgress()` replays all solved missions silently, then `updateProgressDisplay()` refreshes the progress bar.

**Answer constants** are plain JS constants at the top of each mission's section in `script.js`. All comparison is done `.toUpperCase()` — answers are case-insensitive.

**Mission 08** (THREE_KEYS_PROTOCOL) has three sequential sub-keys that must each be verified before the final sum input unlocks. When all three keys are verified, the final input auto-fills with the sum.

**Mission 09** (MASTER_DECRYPT) has four sequential layers, each unlocking the next via `key-locked`/`key-verified` CSS classes.

**Mission 10** (FINAL_SEQUENCE) triggers a typewriter effect on `FINAL_MESSAGE`, then adds `.puzzle-complete` to `body` and `#dashboard` to apply the completion styling.

## Assets

`assets/` contains three PNG images used for visual decoration (corrupted retina scan, bookshelf background, GitHub logo). They are referenced directly from HTML/CSS.
