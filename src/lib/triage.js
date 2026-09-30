// Turns a raw call from Jade into something staff can act on at a glance:
// an urgency level, the reasons behind it, and whether the owner needs to know.
//
// Rules are deliberately simple keyword checks so they are easy to explain in a
// demo and easy to tune. Swap this for an LLM classifier later without touching
// the UI — every screen only reads the object returned by triageCall().

const RED_FLAGS = [
  { match: /chest pain|can'?t breathe|trouble breathing|short(ness)? of breath/i, flag: 'Breathing / chest' },
  { match: /bleeding|losing blood|won'?t stop bleeding/i, flag: 'Bleeding' },
  { match: /swell(ing|en)|allergic|anaphyla/i, flag: 'Swelling / allergy' },
  { match: /unconscious|faint(ed)?|collapsed|seizure/i, flag: 'Collapse' },
  { match: /severe|unbearable|worst pain|10 out of 10/i, flag: 'Severe pain' },
  { match: /high fever|fever of 39|fever of 40|40 degrees/i, flag: 'High fever' },
]

const TODAY_FLAGS = [
  { match: /today|this afternoon|asap|as soon as|right away|urgent/i, flag: 'Wants today' },
  { match: /pain|hurts|ache|sore/i, flag: 'In pain' },
  { match: /ran out|out of (my )?medication|prescription/i, flag: 'Medication' },
  { match: /callback|call me back|call back/i, flag: 'Callback requested' },
]

const OWNER_FLAGS = [
  { match: /complain|unhappy|disappointed|terrible service/i, flag: 'Complaint' },
  { match: /refund|overcharged|billing dispute|charged twice/i, flag: 'Billing dispute' },
  { match: /lawyer|solicitor|legal|report you/i, flag: 'Legal risk' },
  { match: /speak to the (owner|manager)|ask(ed)? for the (owner|manager)/i, flag: 'Asked for owner' },
]

const INFO_FLAGS = [
  { match: /new (patient|client)|first time|never been/i, flag: 'New patient' },
  { match: /child|son|daughter|baby|toddler/i, flag: 'Child' },
]

function collect(rules, text) {
  return rules.filter((r) => r.match.test(text)).map((r) => r.flag)
}

export const LEVELS = {
  urgent: { label: 'Urgent', rank: 0 },
  today: { label: 'Needs attention today', rank: 1 },
  routine: { label: 'Routine', rank: 2 },
}

// Only the caller's own words are scanned (plus Jade's summary), so Jade's
// scripted lines like "I'll have someone call you back" don't trigger flags.
export function callText(call) {
  const said = (call.transcript || []).filter((t) => t.speaker === 'caller').map((t) => t.text)
  return [call.reason, call.summary, ...said].join(' ')
}

export function triageCall(call) {
  const text = callText(call)
  const red = collect(RED_FLAGS, text)
  const today = collect(TODAY_FLAGS, text)
  const owner = collect(OWNER_FLAGS, text)
  const info = collect(INFO_FLAGS, text)

  let level = 'routine'
  if (red.length) level = 'urgent'
  else if (today.length || owner.length) level = 'today'

  // A child with any pain or fever gets bumped up one step.
  if (info.includes('Child') && level === 'today' && today.includes('In pain')) level = 'urgent'

  // Score is only used to order cards inside a column: more flags and a longer
  // wait float to the top.
  const waitingMin = minutesSince(call.receivedAt)
  const score = red.length * 30 + owner.length * 15 + today.length * 10 + Math.min(waitingMin, 120) / 4

  return {
    level,
    score,
    flags: [...red, ...owner, ...today, ...info],
    escalateToOwner: level === 'urgent' || owner.length > 0,
    ownerReasons: owner,
  }
}

export function minutesSince(iso, now = Date.now()) {
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000))
}

export function formatWait(iso) {
  const m = minutesSince(iso)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m ago`
}

export function sortByPriority(calls) {
  return [...calls].sort((a, b) => {
    const ta = a.triage
    const tb = b.triage
    return LEVELS[ta.level].rank - LEVELS[tb.level].rank || tb.score - ta.score
  })
}
