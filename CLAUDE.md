# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

Open `Plano.html` directly in a browser — no build step, server, or package manager needed. Babel Standalone transpiles JSX in the browser on load. Edit any `.jsx` file and refresh to see changes.

## Architecture

All source lives in 9 flat files. Load order (declared in `Plano.html`):

| File | Role |
|---|---|
| `plano-app.jsx` | Root component; owns all React state (elements, connections, zoom, pan, selection, drag) |
| `plano-chrome.jsx` | UI shell: Sidebar, Toolbar, HUD panels, Properties inspector, TweaksPanel |
| `plano-canvas.jsx` | `CanvasView` — renders SVG connection layer + scaled element stage |
| `plano-elements.jsx` | One component per element type: Card, Sticky, Image, Shape, Column, Checklist, Link, Audio, File |
| `plano-data.jsx` | Demo/initial board data |
| `plano-icons.jsx` | `Icon` component + SVG path registry |
| `tweaks-panel.jsx` | Generic settings UI system; `useTweaks` hook persists theme/density/background |
| `plano.css` | All styles — CSS custom properties for theming, no preprocessor |

**Data flow:** all user input routes through `plano-app.jsx` → `setElements` / `setConnections` → canvas re-renders.

## Key Schemas

Element:
```js
{ id, type, x, y, w, h, title, body, meta, hidden, locked, /* type-specific fields */ }
```

Connection:
```js
{ id, from, fromSide, to, toSide, style, arrow, label }
// sides: "t" | "r" | "b" | "l"
```

## Coordinate System

World coords ↔ screen coords via zoom/pan:
```
worldX = (screenX - rect.left - pan.x) / zoom
```

## Theming

Theme and density are toggled by setting data-attributes on `<html>`:
- `data-theme="light|dark"`
- `data-density="compact|comfortable|spacious"`

Colors use OKLch CSS variables (`--bg`, `--ink`, `--accent`, etc.).

## Default Tweaks Config

Defined in `Plano.html` between `/*EDITMODE-BEGIN*/` / `/*EDITMODE-END*/` markers:
```js
window.PLANO_TWEAKS_DEFAULTS = { theme, background, density, cardStyle }
```

## Keyboard Shortcuts (canvas)

`V` select · `H` pan · `C` card · `S` sticky · `K` checklist · `L` column · `R` shape · `I` image · `U` link · `A` audio · `F` file  
`Space` (hold) temp pan · `Ctrl+D` duplicate · `Delete/Backspace` remove · `Escape` deselect
