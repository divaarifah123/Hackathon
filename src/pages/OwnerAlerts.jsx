import { useStore } from '../lib/store.jsx'
import { sortByPriority, formatWait } from '../lib/triage.js'
import { go } from '../lib/router.js'
import { PageHeader, JadeLive, UrgencyBadge, Card, Flags, Empty, formatTime } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'

export default function OwnerAlerts() {
  const { calls, activity, settings, dispatch } = useStore()

  const matchesRule = (c) => {
    if (settings.escalationRule === 'urgent_only') return c.triage.level === 'urgent'
    if (settings.escalationRule === 'all_today') return c.triage.level !== 'routine' || c.triage.escalateToOwner
    return c.triage.escalateToOwner
  }

  const open = sortByPriority(calls.filter((c) => c.status !== 'resolved' && matchesRule(c)))
  const needsOwner = open.filter((c) => !c.ownerAcknowledged)
  const acknowledged = open.filter((c) => c.ownerAcknowledged)
  const resolved = calls
    .filter((c) => c.status === 'resolved' && c.resolvedBy !== 'jade')
    .sort((a, b) => new Date(b.resolvedAt || b.receivedAt) - new Date(a.resolvedAt || a.receivedAt))
    .slice(0, 5)

  return (
    <>
      <PageHeader title="Owner Escalation Board" subtitle="Only the calls that need the owner — emergencies, complaints and billing disputes">
        <JadeLive />
      </PageHeader>

      <div className="detail-grid">
        <div className="stack">
          <Card title="Urgent escalations requiring you" action={<span className="count red">{needsOwner.length}</span>}>
            {needsOwner.length ? (
              <div className="stack tight">
                {needsOwner.map((c) => (
                  <EscalationItem key={c.id} call={c}>
                    <button className="btn primary" onClick={() => dispatch({ type: 'acknowledge', id: c.id })}>
                      Acknowledge & take over
                    </button>
                    <button className="btn ghost" onClick={() => dispatch({ type: 'assign', id: c.id, to: 'reception' })}>
                      Hand to reception
                    </button>
                  </EscalationItem>
                ))}
              </div>
            ) : (
              <Empty>Nothing needs you right now</Empty>
            )}
          </Card>

          {acknowledged.length > 0 && (
            <Card title="You're handling">
              <div className="stack tight">
                {acknowledged.map((c) => (
                  <EscalationItem key={c.id} call={c}>
                    <a className="btn ghost" href={`tel:${c.phone.replace(/\s/g, '')}`}>
                      <Icon name="phone" size={15} /> Call {c.caller.split(' ')[0]}
                    </a>
                    <button className="btn success" onClick={() => dispatch({ type: 'resolve', id: c.id })}>
                      Mark resolved
                    </button>
                  </EscalationItem>
                ))}
              </div>
            </Card>
          )}
        </div>

        <aside className="stack">
          <Card title="Recently resolved">
            {resolved.length ? (
              <ul className="timeline">
                {resolved.map((c) => (
                  <li key={c.id}>
                    <Icon name="check" size={14} />
                    <div>
                      <strong>{c.caller}</strong>
                      <p className="muted small">{c.reason}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small">Resolved escalations will show here.</p>
            )}
          </Card>
          <Card title="Activity">
            {activity.length ? (
              <ul className="timeline">
                {activity.slice(0, 8).map((a, i) => (
                  <li key={i}>
                    <span className="muted small">{formatTime(a.at)}</span>
                    <p className="small">{a.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small">Actions taken by staff will be logged here.</p>
            )}
          </Card>
        </aside>
      </div>
    </>
  )
}

function EscalationItem({ call, children }) {
  return (
    <article className={`escalation level-${call.triage.level}`}>
      <div className="escalation-top">
        <div>
          <h3>{call.caller}</h3>
          <span className="muted small">
            {call.phone} · {formatWait(call.receivedAt)}
          </span>
        </div>
        <UrgencyBadge level={call.triage.level} />
      </div>
      <p className="call-reason">{call.reason}</p>
      <p className="call-summary">{call.summary}</p>
      <Flags flags={call.triage.ownerReasons.length ? call.triage.ownerReasons : call.triage.flags.slice(0, 3)} />
      <div className="call-actions">
        {children}
        <button className="btn link" onClick={() => go(`calls/${call.id}`)}>
          Full call →
        </button>
      </div>
    </article>
  )
}
