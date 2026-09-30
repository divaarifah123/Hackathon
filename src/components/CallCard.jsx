import { useStore } from '../lib/store.jsx'
import { go } from '../lib/router.js'
import { formatWait } from '../lib/triage.js'
import { Flags } from './ui.jsx'
import Icon from './Icon.jsx'

export default function CallCard({ call }) {
  const { dispatch } = useStore()
  const { triage } = call
  return (
    <article className={`call-card level-${triage.level}`}>
      <div className="call-card-top">
        <div>
          <h3>{call.caller}</h3>
          <span className="muted small">
            #{call.id} · {call.phone}
          </span>
        </div>
        <span className="wait" title={new Date(call.receivedAt).toLocaleString()}>
          <Icon name="clock" size={13} /> {formatWait(call.receivedAt)}
        </span>
      </div>
      <p className="call-reason">{call.reason}</p>
      <p className="call-summary">{call.summary}</p>
      <Flags flags={triage.flags.slice(0, 3)} />
      <div className="call-meta">
        {call.assignee ? <span className="assignee">→ {call.assignee === 'owner' ? 'Owner' : 'Reception'}</span> : <span className="assignee unassigned">Unassigned</span>}
      </div>
      <div className="call-actions">
        <a className="btn ghost sm" href={`tel:${call.phone.replace(/\s/g, '')}`}>
          <Icon name="phone" size={14} /> Call back
        </a>
        <button className="btn ghost sm" onClick={() => dispatch({ type: 'resolve', id: call.id })}>
          <Icon name="check" size={14} /> Done
        </button>
        <button className="btn primary sm" onClick={() => go(`calls/${call.id}`)}>
          View
        </button>
      </div>
    </article>
  )
}
