# Jade Triage Dashboard

Hackathon project. When Jade (the AI receptionist) takes a call, the details land here already sorted by urgency, so the clinic owner and front desk can see at a glance what needs them *now* instead of digging through messy call logs.

## Screens

| Route | Screen | What it's for |
| --- | --- | --- |
| `#/dashboard` | **Today at the clinic** | Stat tiles + Live Triage Board: Urgent / Needs attention today / Routine columns, filter & search |
| `#/appointments` | **Upcoming Bookings & Screenings** | All appointments in one table, plus booking requests Jade collected |
| `#/calls/:id` | **Call Detail** | Why Jade flagged it, summary, transcript, suggested slots, assign/escalate/resolve, internal notes |
| `#/alerts` | **Owner Escalation Board** | Only the calls that need the owner (emergencies, complaints, billing disputes) |
| `#/settings` | **Settings** | Owner notifications, SMS templates, escalation rules, reset demo data |

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # triage rule tests
npm run build    # outputs to docs/
```

## Live site (GitHub Pages)

**https://divaarifah123.github.io/Hackathon/**

Pages is set to *Deploy from a branch* → `claude/jolly-newton-nvuovm`. Either folder works: `/docs` serves the built app directly, and `/ (root)` has an `index.html` that redirects into `docs/`. The app source lives in `web/`; the site is the built copy in `docs/`, so after changing code:

```bash
npm run build
git add -A && git commit -m "Rebuild site" && git push
```

GitHub redeploys within a minute or two (progress shows under the repo's **Actions** tab).

## How it fits together

- `web/src/data/mockData.js`: sample calls in the shape we expect from Jade. Replace with a fetch from Jade's API when it's available. `CLINIC_NAME` lives here too.
- `web/src/lib/triage.js`: **the core idea.** Turns a raw call into `{ level, flags, escalateToOwner }` using keyword rules over the caller's words and Jade's summary. It's the one place to tune what counts as urgent (or swap in an LLM classifier later).
- `web/src/lib/store.jsx`: app state (React context + reducer). Actions: assign, resolve, acknowledge, book, add note. Saved to `localStorage` so the demo survives a refresh; use **Settings → Reset demo** before presenting.
- `web/src/pages/*`: one file per screen. `web/src/components/*`: shared UI.

No UI framework or router dependency, just React + Vite + plain CSS (`web/src/styles.css`, colour tokens at the top).
