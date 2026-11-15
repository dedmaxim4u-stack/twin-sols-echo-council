# TWIN SOLS: ECHO COUNCIL

**TWIN SOLS** is a browser-based 2D visual novel and junior astronaut mission trainer created for the **2026 NASA Space Apps Challenge**. Players ages 7–12 run a fictional Mars outpost for ten sols, balance real engineering trade-offs, manage crew relationships, and discover one of nine endings.

## Play

- Live game: https://twin-sols-echo-council.foidhunter777333.chatgpt.site
- No account or installation is required.
- The interface and story are in English.

## Core loop

1. Walk through Echo Station by selecting highlighted exits or using the resource shortcuts.
2. Talk with Jack, Maya, Riley, and Theo. Trust, health, energy, fatigue, and conflicts affect later plans.
3. Spend three time blocks on conversations or station work.
4. Join the Crew Council and choose between three plans. Every useful choice has an immediate or delayed cost.
5. Return to the Commander Cabin, review the result, and sleep to apply overnight consequences.

The three primary resources are **Power**, **Life Support**, and **Radiation Safety**. Greenhouse, communications, shelter, rover condition, science, relationships, hidden flags, and future decisions provide the deeper simulation layer without crowding the main HUD.

## NASA and partner data

- [NASA DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) supplies solar-event context for radiation and communications training scenarios.
- [NASA OSDR](https://osdr.nasa.gov/bio/repo/) grounds fatigue, sleep, health, and plant consequences.
- [NASA RadLab](https://visualization.osdr.nasa.gov/radlab/gui/data-api/) provides real ISS dose-rate units as a comparison, never as a claimed Mars reading.
- [NASA Mars Trek](https://trek.nasa.gov/mars/) grounds Gale Crater route and terrain decisions.
- [CSA food-production resources](https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/) connect greenhouse choices with food, air, water, power, health, and morale.

Live, cached, and archived data are labelled separately in the game. DONKI events select training risk; they are not presented as an operational Mars forecast.

## Features

- Ten-sol branching story and nine computed endings
- 40 contextual crew conversations and ten Council introductions
- Immediate, delayed, social, and engineering consequences
- Visual-novel dialogue, backlog, rollback, Auto, Skip, Save, and Load
- Autosave plus six manual save slots with v3→v4 migration
- Distinct procedural bit-voices for all four characters
- Keyboard, mouse, touch, and reduced-motion support
- Offline NASA snapshot when live data is unavailable

## Local development

Requirements: Node.js 20 or newer.

```bash
npm run build
npm run dev
```

The game is a buildless HTML5 application served from `dist/`. `npm run build` verifies required deployment files and confirms that the private NASA API key is absent from browser code.

Run the complete deterministic mission test:

```bash
npm test
```

This evaluates all **59,049** Council-choice chains and verifies that all nine endings remain reachable.

## Deploy to Vercel

The repository includes `vercel.json`; no framework preset is required.

1. Import the repository into Vercel.
2. Leave the Framework Preset as **Other**.
3. Vercel runs `npm run build` and publishes `dist/`.

Or deploy with the CLI:

```bash
npx vercel
```

Do not place a NASA API key in Vercel client environment variables. `scripts/refresh-nasa-data.mjs` may use `NASA_API_KEY` only during an offline snapshot refresh; the browser uses the public CCMC endpoint and the bundled fallback.

## Project structure

```text
dist/                       Browser-ready game and assets
scripts/test-mission.mjs    Exhaustive ending/balance test
scripts/verify-build.mjs    Vercel deployment verification
scripts/refresh-nasa-data.mjs
api-1.json                  Local DONKI OpenAPI specification
vercel.json                 Vercel static deployment configuration
```

## Educational intent

The goal is not to teach that one option is always correct. It is to let a young player answer two questions after every decision:

> What did I gain, and what did I spend now or later?

Echo Station and its crew are fictional. Scientific sources and simulation limitations are shown in the game and in the final Mission Science Report.
