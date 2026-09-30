import { useStore } from '../lib/store.jsx'
import { go } from '../lib/router.js'
import { formatWait } from '../lib/triage.js'
import { Flags } from './ui.jsx'
import { PhoneLine, CallBackButton, displayName } from './Contact.jsx'
import Icon from './Icon.jsx'

export default function CallCard({ call }) {
  const { dispatch } = useStore()
  const { triage } = call
  return (
    <article className={`call-card level-${triage.level}`}>
      <div className="call-card-top">
        <div>
          <h3>
            {displayName(call)}
            {call.repeatCount > 1 && <span className="repeat">{call.repeatCount} calls</span>}
          </h3>
          <span className="muted small">
            #{call.id} · <PhoneLine call={call} />
          </span>
        </div>
        <span className="wait" title={new Date(call.receivedAt).toLocaleString()}>
          <Icon name="clock" size={13} /> {formatWait(call.receivedAt)}
        </span>
      </div>
      <p className="call-reason">{call.reason || 'No reason captured'}</p>
      {call.summary && <p className="call-summary">{call.summary}</p>}
      <Flags flags={triage.flags.slice(0, 3)} />
      <div className="call-meta">
        {call.assignee ? <span className="assignee">→ {call.assignee === 'owner' ? 'Owner' : 'Reception'}</span> : <span className="assignee unassigned">Unassigned</span>}
      </div>
      <div className="call-actions">
        <CallBackButton call={call} />
        <button className="btn ghost sm" onClick={() => dispatch({ type: 'resolve', id: call.relatedIds })}>
          <Icon name="check" size={14} /> Done
        </button>
        <button className="btn primary sm" onClick={() => go(`calls/${call.id}`)}>
          View
        </button>
      </div>
    </article>
  )
}
