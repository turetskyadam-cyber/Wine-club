# The Wine Room — Wine Club Landing Page

A single-page membership site for **The Wine Room Kitchen & Bar** in Delray Beach, FL — the world-record holder for most wines on tap (180+). Converts visitors into wine club members at $29/month.

---

## What the page does

| Section | What a visitor sees |
|---------|-------------------|
| **Hero** | Headline + $29/month CTA, animated stats (180+ wines, 26 machines, 7 days/week), spinning world-record badge |
| **Pricing** | Single membership card with full benefit list, "No commitment. Cancel anytime." |
| **Membership Perks** | 7 flip cards — tap to reveal the full story behind each benefit |
| **Testimonials** | Three member quotes |
| **The Rare Room** | Dark-section spotlight on the 2,400+ bottle private vault |
| **Wine Card** | How the dollar-for-dollar Enomatic card match works, with pour sizes |
| **Value Calculator** | Interactive slider: adjust card load + bottle count, see monthly savings vs. $29 |
| **Join Form** | Name + email + optional phone. Submit sends the lead (wire up Formspree / Netlify Forms to go live) |
| **FAQ** | 5 accordion questions about the card, cancellation, pickup party, wine selection, in-person pickup |

---

## Running it locally

This is a static site — no build step, no dependencies.

```bash
# Option A: just open the file
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux

# Option B: local server (avoids any browser CORS quirks with assets)
npx serve .
# or
python3 -m http.server 8080
```

Visit `http://localhost:8080` (or whatever port the server prints).

---

## File structure

```
Wine-club/
├── index.html          # Entire page — all sections are here
├── css/
│   └── styles.css      # All styles, including animations, flip cards, calculator
├── js/
│   └── main.js         # Nav, scroll animations, flip cards, calculator logic, form handling
└── assets/
    ├── logo-wine-room.png
    ├── world-record-badge.png
    ├── wine-bottle-icon.png
    └── *.jpeg           # Restaurant/event photos
```

---

## Wiring up the join form

The form (`#signup-form`) currently has no `action`. To accept submissions:

**Formspree** — simplest:
```html
<form id="signup-form" action="https://formspree.io/f/YOUR_ID" method="POST">
```

**Netlify Forms** — if hosted on Netlify:
```html
<form id="signup-form" netlify name="wine-club-signup">
```

The success state (`#form-success`) is already built — it shows automatically after a successful submit.

---

## Tech

- Plain HTML, CSS, JavaScript — no frameworks, no build tools
- Fonts: Playfair Display + Raleway via Google Fonts
- Wine dispensers: [Enomatic](https://www.enomatic.com/) self-pour system (referenced in copy, not a code dependency)
- CSS custom properties drive the color palette and animation timing throughout `styles.css`

---

## Customizing

**Colors** — defined as CSS variables at the top of `styles.css`:
- `--burgundy` — primary brand red
- `--gold` / `--gold-light` — accent gold
- `--cream` — light background sections

**Pricing** — update the `$29` figure in `index.html` (appears in nav CTA, hero sub, pricing card, testimonials, and calculator baseline). The calculator uses `MEMBERSHIP = 29` in `main.js`.

**Calculator defaults** — `main.js` constants: `CARD_MIN = 100` (starting card load, also the step), `BOTTLE_MIN = 1`, `AVG_BOTTLE = 48`. Adjust these to match current pricing.

**Stats** — the animated counters (`data-count="180"`, `data-count="26"`, etc.) in `index.html` are the live numbers. Update if the wine selection grows.
