# Pixel Vault — 3D Video Game Store

An interactive 3D game store built with React and Three.js. Walk around, browse games, add to cart, and checkout using in-game currency.

---

## Tech Stack

| Tool | Version |
|---|---|
| React | 19.2.7 |
| Three.js | 0.184.0 |
| React Three Fiber | 9.6.1 |
| React Three Drei | 10.7.7 |
| React Three Rapier | 2.2.0 |
| Zustand | 5.0.14 |
| Vite | 8.1.0 |

---

## Features

- **3D Navigation** — WASD / Arrow keys to move, mouse to look around
- **Game Catalog** — 8 AAA titles with price, genre, platform, and rating
- **Wall Shelves** — 6 interactive shelves, press `E` to browse
- **Filtering** — Press `F` to filter by platform and genre
- **Shopping Cart** — Add games, checkout at the counter with 500 starting credits
- **Post-processing** — Bloom, vignette, chromatic aberration

---

## Controls

| Key | Action |
|---|---|
| `WASD` / Arrows | Move |
| Mouse | Look around |
| `E` | Interact (game pedestal / shelf / checkout) |
| `F` | Open filter panel |
| `Esc` | Close any open menu |

---

## Getting Started

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Lint with Oxlint
```

---

## Project Structure

```
src/
├── components/
│   ├── Character/   # Player mesh & movement controller
│   ├── World/       # 3D scene, building, lighting
│   ├── Shop/        # Game pedestals & floor layout
│   └── UI/          # HUD, modals, filter panel, intro
├── hooks/
│   ├── useStore.js  # Global state (cart, balance, filters)
│   └── useKeys.js   # Keyboard input
├── data/
│   ├── games.js     # Game catalog + filter logic
│   └── devices.js   # Platform definitions
└── App.jsx          # Canvas setup & post-processing
```
