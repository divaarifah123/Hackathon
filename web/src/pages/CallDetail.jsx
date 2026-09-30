import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { sortByPriority, formatWait } from '../lib/triage.js'
import { go } from '../lib/router.js'
import { PageHeader, UrgencyBadge, StatusBadge, Avatar, Card, Flags, Empty, formatDay, formatTime } from '../components/ui.jsx'
import { PhoneLine, CallBackButton, FixPhone, displayName } from '../components/Contact.jsx'
import { openSlots } from '../lib/insights.js'
import Icon from '../components/Icon.jsx'

// Offer the next few open slots. Urgent calls get same-day slots first.
function suggestSlots(level) {
  const now = new Date()
  const at = (days, h, m) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    d.setHours(h, m, 0, 0)
    return d
  }
  const candidates = [at(0, 11, 15), at(0, 13, 45), at(0, 15, 45), at(0, 16, 30), at(1, 9, 15), at(1, 11, 0), at(2, 10, 0)]
  const future = candidates.filter((d) => d > now)
  return (level === 'routine' ? future.filter((d) => d.getDate() !== now.getDate()) : future).slice(0, 3)
}

const INTENT_LABELS = {
  emergency: 'Emergency',
  appointment: 'New booking',
  reschedule: 'Reschedule',
  prescription: 'Prescription',
  complaint: 'Complaint',
  question: 'General question',
  unknown: 'Unknown',
}

export default function CallDetail({ params }) {
  const { calls, appointments, dispatch } = useStore()
  const [note, setNote] = useState('')
  const [slot, setSlot] = useState(null)

  const ordered = sortByPriority(calls.filter((c) => c.status !== 'resolved' && c.isLatestFromCaller))
  const call = calls.find((c) => c.id === params[0]) || ordered[0] || calls[0]
  if (!call) return <Empty>No calls yet</Empty>

  const { triage } = call
  const idx = ordered.findIndex((c) => c.id === call.id)
  const next = ordered[idx + 1]
  // Freed-up (cancelled) slots are offered first, then the usual suggestions.
  const freed = openSlots(appointments).map((a) => ({ start: a.start, slotId: a.id, freed: true }))
  const slots = [...freed, ...suggestSlots(triage.level).map((d) => ({ start: d.toISOString() }))].slice(0, 4)
  const related = calls.filter((c) => call.relatedIds.includes(c.id)).sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt))
  const mins = Math.round(call.durationSec / 60)

  const addNote = (e) => {
    e.preventDefault()
    if (!note.trim()) return
    dispatch({ type: 'addNote', id: call.id, text: note.trim() })
    setNote('')
  }

  return (
    <>
      <PageHeader title={`Call Detail #${call.id} ${displayName(call)}`} subtitle={`Received ${formatWait(call.receivedAt)} · ${mins} min call · ${INTENT_LABELS[call.intent] || call.intent}`}>
        <button className="btn ghost" onClick={() => go('calls')}>
          <Icon name="arrowLeft" size={15} /> All calls
        </button>
        {next && (
          <button className="btn ghost" onClick={() => go(`calls/${next.id}`)}>
            Next call →
          </button>
        )}
      </PageHeader>

      <div className="detail-grid">
        <div className="stack">
          <Card>
            <div className="caller-head">
              <Avatar name={call.caller} size="large" />
              <div className="grow">
                <h2>{displayName(call)}</h2>
                <p className="muted">
                  <PhoneLine call={call} /> · #{call.id}
                </p>
              </div>
              <div className="badges">
                <UrgencyBadge level={triage.level} />
                <StatusBadge status={call.status} />
              </div>
            </div>

            {triage.level !== 'routine' && (
              <div className={`alert level-${triage.level}`}>
                <Icon name="alert" size={18} />
                <div>
                  <strong>{triage.level === 'urgent' ? 'Flagged urgent by Jade' : 'Needs a response today'}</strong>
                  <p>{call.reason}</p>
                  <Flags flags={triage.flags} />
                </div>
              </div>
            )}

            {!call.contact.ok && (
              <div className="alert level-urgent">
                <Icon name="phone" size={18} />
                <div className="grow">
                  <strong>We can't call this person back yet</strong>
                  <p>
                    Jade heard "{call.contact.spoken || 'nothing'}" ({call.contact.problem.toLowerCase()}). Caller ID was withheld and no patient record
                    matches. Check voicemail or the patient file, then save the correct number.
                  </p>
                  <FixPhone call={call} />
                </div>
              </div>
            )}
            {call.contact.ok && call.contact.problem && (
              <p className="recovered small">
                <Icon name="check" size={14} /> Jade heard "{call.contact.spoken}" ({call.contact.problem.toLowerCase()}), so we're using the number from{' '}
                {call.contact.source === 'callerId' ? 'caller ID' : call.contact.source === 'patientRecord' ? 'the patient record' : 'staff'}.
              </p>
            )}
          </Card>

          {related.length > 1 && (
            <Card title={`Called ${related.length} times`}>
              <ol className="timeline numbered">
                {related.map((r) => (
                  <li key={r.id}>
                    <span className="muted small">{new Date(r.receivedAt).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span>
                    <p className="small">{r.summary || r.reason}</p>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          <Card title="Jade's call summary" action={<Icon name="spark" size={16} className="accent" />}>
            <p className="summary-text">{call.summary || 'Jade did not capture a summary for this call.'}</p>
            <dl className="facts">
              <div>
                <dt>Reason</dt>
                <dd>{call.reason || '—'}</dd>
              </div>
              <div>
                <dt>Intent</dt>
                <dd>{INTENT_LABELS[call.intent] || call.intent}</dd>
              </div>
              <div>
                <dt>Escalate to owner</dt>
                <dd>{triage.escalateToOwner ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt>Callback</dt>
                <dd>{call.contact.ok ? call.contact.number : 'Needs fixing'}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Transcript">
            {call.transcript?.length ? (
              <ol className="transcript">
                {call.transcript.map((line, i) => (
                  <li key={i} className={line.speaker}>
                    <span className="speaker">{line.speaker === 'jade' ? 'Jade' : call.caller?.split(' ')[0] || 'Caller'}</span>
                    <p>{line.text}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <Empty>No recording for this call — the caller hung up before speaking. Caller ID is shown above if we have it.</Empty>
            )}
          </Card>
        </div>

        <aside className="stack">
          <Card title="Booking">
            {call.bookedAt ? (
              <p className="booked">
                <Icon name="check" size={16} /> Booked for {formatDay(call.bookedAt)} at {formatTime(call.bookedAt)}
              </p>
            ) : (
              <>
                <p className="muted small">Suggested slots</p>
                <div className="slots">
                  {slots.map((s) => (
                    <button key={s.start} className={`slot ${slot?.start === s.start ? 'on' : ''}`} onClick={() => setSlot(s)}>
                      {formatDay(s.start)} · {formatTime(s.start)}
                      {s.freed && <span className="slot-tag">Just freed up</span>}
                    </button>
                  ))}
                </div>
                <button className="btn primary block" disabled={!slot} onClick={() => dispatch({ type: 'book', id: call.relatedIds, start: slot.start, slotId: slot.slotId })}>
                  Book slot & text confirmation
                </button>
              </>
            )}
          </Card>

          <Card title="Actions">
            <div className="action-grid">
              <CallBackButton call={call} className="btn ghost" />
              <button className="btn ghost" onClick={() => dispatch({ type: 'assign', id: call.id, to: 'reception' })}>
                <Icon name="user" size={15} /> Take it
              </button>
              <button className="btn ghost" onClick={() => dispatch({ type: 'assign', id: call.id, to: 'owner' })}>
                <Icon name="bell" size={15} /> Escalate to owner
              </button>
              {call.status === 'resolved' ? (
                <button className="btn ghost" onClick={() => dispatch({ type: 'reopen', id: call.relatedIds })}>
                  Reopen
                </button>
              ) : (
                <button className="btn success" onClick={() => dispatch({ type: 'resolve', id: call.relatedIds })}>
                  <Icon name="check" size={15} /> Mark resolved
                </button>
              )}
            </div>
          </Card>

          <Card title="Internal notes">
            {(call.notes || []).length > 0 && (
              <ul className="notes">
                {call.notes.map((n, i) => (
                  <li key={i}>
                    <p>{n.text}</p>
                    <span className="muted small">{formatTime(n.at)}</span>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={addNote} className="note-form">
              <textarea rows={3} placeholder="e.g. Left voicemail, will try again at 2pm" value={note} onChange={(e) => setNote(e.target.value)} />
              <button className="btn primary sm" type="submit">
                Add note
              </button>
            </form>
          </Card>
        </aside>
      </div>
    </>
  )
}
