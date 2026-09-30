# Jade Triage Dashboard

Hackathon project. When Jade (the AI receptionist) takes a call, the details land here already sorted by urgency, so the clinic owner and front desk can see at a glance what needs them *now* instead of digging through messy call logs.

## Screens

| Route | Screen | What it's for |
| --- | --- | --- |
| `#/dashboard` | **Today at Harbourside Dental** | Stat tiles, opportunities (freed slots, patients at risk, unmet demand), Live Triage Board |
| `#/calls` | **Calls** | Every call Jade took; `#/calls/:id` opens the detail with transcript, booking and notes |
| `#/appointments` | **Appointments** | Bookings table + cancellations to fill + booking requests |
| `#/callbacks` | **Callbacks** | One queue grouped by what each caller needs, with due/overdue times |
| `#/settings` | **Settings** | Reminders, reminder messages, rescheduling, callbacks, notifications |
| `#/alerts` | **Owner alerts** | Only what needs the owner (linked from the dashboard header) |

## The "what about…" questions from the brief

| Situation | What the screen does |
| --- | --- |
| Phone number a digit short | Falls back to caller ID, then the patient record. If neither works the caller is flagged **Can't call back**, goes to the top of Callbacks with an inline "fix number" field, and is never silently dropped. Settings also has Jade read numbers back to prevent it. |
| Rang three times over the weekend | Calls from the same number fold into one card ("3 calls"), the caller moves up a level, and the Callbacks page shows how overdue they are. Marking it done resolves all three. |
| Two cancellations | Shown as **Slots opened up**, with the best-matched waiting caller and a one-click "Offer & book". |
| Call at 2:14am | Tagged "After hours", bumped out of Routine (it's been waiting all night), and due first thing next business morning. |
| Asked for a service we don't offer | Counted under **Asked for services you don't offer** (a lead and a demand signal) and listed as a referral in Callbacks. |
| "I'll try somewhere else" and hung up | Flagged **May go elsewhere**, moved to Needs attention today, and shown under "Don't lose these patients". |
| Incomplete data / no recording | Every field is optional: unknown callers show as "Unknown caller" with caller ID, and the transcript shows a clear "no recording" state. |

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
- `web/src/lib/insights.js`: checks across the whole call log (phone numbers, repeat callers, after-hours, freed slots, unmet demand). Tests: `web/src/lib/*.test.js`.
- `web/src/lib/triage.js`: **the core idea.** Turns a raw call into `{ level, flags, escalateToOwner }` using keyword rules over the caller's words and Jade's summary. It's the one place to tune what counts as urgent (or swap in an LLM classifier later).
- `web/src/lib/store.jsx`: app state (React context + reducer). Actions: assign, resolve, acknowledge, book, add note. Saved to `localStorage` so the demo survives a refresh; use **Settings → Reset demo** before presenting.
- `web/src/pages/*`: one file per screen. `web/src/components/*`: shared UI.

No UI framework or router dependency, just React + Vite + plain CSS (`web/src/styles.css`, colour tokens at the top).
