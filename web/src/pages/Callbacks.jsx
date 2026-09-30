import { useStore } from '../lib/store.jsx'
import { sortByPriority, formatWait } from '../lib/triage.js'
import { PageHeader, JadeLive, Card, Flags, Avatar, UrgencyBadge, Empty } from '../components/ui.jsx'
import { PhoneLine, CallBackButton, FixPhone, displayName } from '../components/Contact.jsx'
import Icon from '../components/Icon.jsx'

// When a callback is due, based on the targets in Settings → Callbacks.
// Calls that come in after hours or on a weekend are due next business morning.
export function callbackDue(call, cb) {
  const received = new Date(call.receivedAt)
  if (call.triage.level === 'urgent') return new Date(received.getTime() + cb.urgentWithinMin * 60000)
  if (cb.standardWithin !== 'same_day') return new Date(received.getTime() + Number(cb.standardWithin) * 3600000)
  const due = new Date(received)
  due.setHours(17, 0, 0, 0)
  const closed = received.getHours() >= 17 || received.getDay() === 0 || received.getDay() === 6
  if (closed) {
    do due.setDate(due.getDate() + 1)
    while (due.getDay() === 0 || due.getDay() === 6)
    due.setHours(10, 0, 0, 0)
  }
  return due
}

function DueLabel({ due }) {
  const mins = Math.round((due - Date.now()) / 60000)
  const fmt = (m) => (Math.abs(m) >= 60 ? `${Math.floor(Math.abs(m) / 60)}h ${Math.abs(m) % 60}m` : `${Math.abs(m)}m`)
  if (mins < 0) return <span className="due overdue">Overdue {fmt(mins)}</span>
  return <span className="due">Due in {fmt(mins)}</span>
}

const SECTIONS = [
  {
    id: 'unreachable',
    title: "Can't call back — fix the number",
    hint: 'Jade got an incomplete number and there was no caller ID or patient record to fall back on. Check voicemail or the patient file.',
    test: (c) => !c.contact.ok,
  },
  { id: 'urgent', title: 'Call back now', hint: 'Clinically urgent.', test: (c) => c.triage.level === 'urgent' },
  {
    id: 'atRisk',
    title: 'At risk of going elsewhere',
    hint: 'Said they would try another clinic. A quick call today can keep them.',
    test: (c) => c.triage.atRisk,
  },
  { id: 'repeat', title: 'Called more than once', hint: "They've been trying to reach us.", test: (c) => c.repeatCount > 1 },
  {
    id: 'leads',
    title: "Leads — services we don't offer",
    hint: 'Refer them on and note the demand for the owner.',
    test: (c) => c.triage.notOffered.length > 0,
  },
  { id: 'rest', title: 'Everyone else', hint: 'Same-day callbacks and routine requests.', test: () => true },
]

export default function Callbacks() {
  const { calls, settings, dispatch } = useStore()
  const queue = sortByPriority(calls.filter((c) => c.status !== 'resolved' && c.isLatestFromCaller))
  const overdue = queue.filter((c) => c.contact.ok && callbackDue(c, settings.callbacks) < Date.now()).length

  // Each caller appears once, in the first section that matches.
  const placed = new Set()
  const sections = SECTIONS.map((s) => {
    const items = queue.filter((c) => !placed.has(c.id) && s.test(c))
    items.forEach((c) => placed.add(c.id))
    return { ...s, items }
  }).filter((s) => s.items.length)

  return (
    <>
      <PageHeader title="Callbacks" subtitle={`${queue.length} people waiting to hear back${overdue ? ` · ${overdue} overdue` : ''}`}>
        <JadeLive />
      </PageHeader>

      {!sections.length && <Empty>Everyone has been called back</Empty>}

      {sections.map((s) => (
        <Card key={s.id} className={`callback-section section-${s.id}`} title={s.title} action={<span className="count">{s.items.length}</span>}>
          <p className="muted small section-hint">{s.hint}</p>
          <ul className="callback-list">
            {s.items.map((c) => (
              <li key={c.id}>
                <Avatar name={c.caller} size="small" />
                <div className="grow">
                  <div className="callback-top">
                    <a href={`#/calls/${c.id}`}>
                      <strong>{displayName(c)}</strong>
                    </a>
                    <UrgencyBadge level={c.triage.level} />
                    {c.contact.ok && <DueLabel due={callbackDue(c, settings.callbacks)} />}
                  </div>
                  <p className="small">
                    {c.reason} <span className="muted">· {formatWait(c.receivedAt)}</span>
                  </p>
                  <p className="small">
                    <PhoneLine call={c} />
                  </p>
                  <Flags flags={c.triage.flags.slice(0, 4)} />
                  {!c.contact.ok && <FixPhone call={c} />}
                </div>
                <div className="callback-actions">
                  {c.contact.ok && <CallBackButton call={c} />}
                  <button className="btn ghost sm" onClick={() => dispatch({ type: 'resolve', id: c.relatedIds })}>
                    <Icon name="check" size={14} /> Done
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </>
  )
}
