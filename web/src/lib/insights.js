// Checks that need more than one call at a time (or other clinic data).
// These answer the awkward "what about…" questions from the brief:
//
//   - A caller gives a phone number that's a digit short    → checkPhone()
//   - Someone rang three times over the weekend              → repeat callers in enrichCalls()
//   - A call came in at 2:14am                               → after-hours in enrichCalls()
//   - Two people cancelled, slots are empty                  → openSlots() + slotCandidates()
//   - Someone asked for a service the clinic doesn't offer   → missedDemand()
//   - "I'll try somewhere else" and hung up                  → triage.atRisk (triage.js)

import { triageCall, LEVELS } from './triage.js'

// ---------- Phone numbers ----------

export function digitsOf(phone) {
  return (phone || '').replace(/\D/g, '')
}

// Australian numbers: 10 digits starting with 0 (04 mobile, 02/03/07/08
// landline), or +61 followed by 9 digits. 13/1300/1800 numbers aren't
// numbers we can call a patient back on, so they don't count.
export function isValidPhone(phone) {
  const d = digitsOf(phone)
  if (/^61[2-478]\d{8}$/.test(d)) return true
  return /^0[2-478]\d{8}$/.test(d)
}

export function formatPhone(phone) {
  const d = digitsOf(phone)
  if (d.length === 10 && d.startsWith('04')) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)} ${d.slice(6)}`
  return phone || ''
}

function describeProblem(phone) {
  const d = digitsOf(phone)
  if (!d) return 'No number given'
  if (d.length < 10) return `${d.length} digits — ${10 - d.length} short`
  if (d.length > 10 && !d.startsWith('61')) return `${d.length} digits — too long`
  return "Doesn't look like a valid number"
}

// Decide which number staff should call back, in order of trust:
//   1. the number Jade heard, if it's valid
//   2. caller ID from the phone system (what the call actually came from)
//   3. the number on file for a patient with the same name
// If none work, the call is flagged "can't call back" so a human fixes it,
// instead of the patient silently never hearing from us.
export function checkPhone(call, patients = [], { useCallerId = true } = {}) {
  if (call.phoneOverride) return { ok: true, number: formatPhone(call.phoneOverride), source: 'staff' }
  if (isValidPhone(call.phone)) return { ok: true, number: formatPhone(call.phone), source: 'spoken' }

  const problem = describeProblem(call.phone)
  if (useCallerId && isValidPhone(call.callerId)) {
    return { ok: true, number: formatPhone(call.callerId), source: 'callerId', problem, spoken: call.phone }
  }
  const onFile = call.caller && patients.find((p) => p.name.toLowerCase() === call.caller.toLowerCase())
  if (onFile && isValidPhone(onFile.phone)) {
    return { ok: true, number: formatPhone(onFile.phone), source: 'patientRecord', problem, spoken: call.phone }
  }
  return { ok: false, number: call.phone || null, source: null, problem, spoken: call.phone }
}

export const PHONE_SOURCE_LABEL = {
  spoken: null,
  staff: 'Corrected by staff',
  callerId: 'Using caller ID',
  patientRecord: 'From patient record',
}

// ---------- Enrichment across the whole call log ----------

// Key used to spot the same person calling more than once.
function callerKey(call, contact) {
  const d = digitsOf(contact.ok ? contact.number : call.callerId)
  if (d.length >= 9) return `tel:${d.slice(-9)}`
  return call.caller ? `name:${call.caller.toLowerCase()}` : `id:${call.id}`
}

// Overnight = 9pm to 7am local time.
export function isAfterHours(iso) {
  const h = new Date(iso).getHours()
  return h >= 21 || h < 7
}

const bump = (level) => (level === 'routine' ? 'today' : level)

export function enrichCalls(calls, patients = [], options = {}) {
  const base = calls.map((c) => {
    const contact = checkPhone(c, patients, options)
    return { ...c, contact, key: callerKey(c, contact), triage: triageCall(c) }
  })

  // Group open calls by caller so three calls from one person show as one card.
  const groups = {}
  for (const c of base) {
    if (c.status === 'resolved') continue
    ;(groups[c.key] ||= []).push(c)
  }
  for (const list of Object.values(groups)) list.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))

  return base.map((c) => {
    const t = { ...c.triage, flags: [...c.triage.flags] }
    const group = c.status === 'resolved' ? [c] : groups[c.key]
    const repeat = group.length

    // Called more than once and still not sorted out: they're trying hard to
    // reach us, so they go up the queue.
    if (repeat >= 2) {
      t.level = bump(t.level)
      t.score += repeat * 15
      const first = group[group.length - 1].receivedAt
      const day = new Date(first).toLocaleDateString([], { weekday: 'short' })
      t.flags.unshift(`Called ${repeat}× since ${day}`)
    }

    // A 2am call doesn't change how sick someone is, but people rarely ring
    // at 2am about something routine, and they've been waiting all night.
    if (isAfterHours(c.receivedAt)) {
      t.level = bump(t.level)
      t.score += 10
      t.flags.push(`After hours · ${new Date(c.receivedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`)
    }

    // We can't call them back: someone needs to fix this today.
    if (!c.contact.ok) {
      t.level = bump(t.level)
      t.score += 25
      t.flags.unshift("Can't call back")
    }

    if (!c.transcript?.length) t.flags.push('No recording')

    return {
      ...c,
      triage: t,
      repeatCount: repeat,
      relatedIds: group.map((g) => g.id),
      // Only the most recent call from each caller is shown on the board.
      isLatestFromCaller: group[0].id === c.id,
    }
  })
}

// ---------- Freed-up appointment slots ----------

export function openSlots(appointments, now = Date.now()) {
  return appointments
    .filter((a) => a.status === 'cancelled' && !a.refilledBy && new Date(a.start).getTime() > now)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
}

// Who should be offered a freed slot: open callers who want an appointment,
// most urgent and most persistent first. A cancelled slot is an opportunity,
// not a gap.
export function slotCandidates(calls) {
  const wantsBooking = /appointment|book|see (me|someone)|fit (me|him|her) in|check-?up|consult/i
  return calls
    .filter((c) => c.status !== 'resolved' && c.isLatestFromCaller && !c.bookedAt && c.contact.ok)
    .filter((c) => ['appointment', 'emergency'].includes(c.intent) || wantsBooking.test([c.reason, c.summary].join(' ')))
    .sort((a, b) => LEVELS[a.triage.level].rank - LEVELS[b.triage.level].rank || b.triage.score - a.triage.score)
}

// ---------- Demand the clinic can't serve (yet) ----------

export function missedDemand(calls) {
  const counts = {}
  for (const c of calls) for (const s of c.triage.notOffered) counts[s] = (counts[s] || 0) + 1
  return Object.entries(counts)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count)
}
