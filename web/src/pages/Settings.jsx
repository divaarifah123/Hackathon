import { useStore } from '../lib/store.jsx'
import { CLINIC_NAME } from '../data/mockData.js'
import { PageHeader, Card, Toggle } from '../components/ui.jsx'

const RULES = [
  ['urgent_only', 'Urgent calls only', 'Medical emergencies: bleeding, swelling, severe pain, breathing.'],
  ['urgent_and_complaints', 'Urgent calls + complaints', 'Also billing disputes, refunds and callers asking for the owner.'],
  ['all_today', 'Everything that needs a same-day response', 'Noisier — useful when the front desk is short-staffed.'],
]

function fill(template) {
  return template.replace('{name}', 'Marcus').replace('{clinic}', CLINIC_NAME).replace('{time}', 'Today 3:45pm')
}

export default function Settings() {
  const { settings, dispatch } = useStore()
  const set = (patch) => dispatch({ type: 'updateSettings', patch })
  const setTemplate = (key, value) => set({ templates: { ...settings.templates, [key]: value } })

  return (
    <>
      <PageHeader title="Settings" subtitle="Control how Jade flags calls and who gets told" />

      <Card title="Owner notifications">
        <p className="muted small">How the owner hears about escalated calls.</p>
        {[
          ['notifySms', 'Text message', `Sent to ${settings.ownerPhone}`],
          ['notifyEmail', 'Email summary', 'One email per escalation'],
          ['notifyPush', 'Push notification', 'On the Jade mobile app'],
          ['quietHours', 'Respect quiet hours', 'Only urgent calls notify between 7pm and 7am'],
        ].map(([key, label, hint]) => (
          <div className="setting-row" key={key}>
            <div>
              <strong>{label}</strong>
              <p className="muted small">{hint}</p>
            </div>
            <Toggle label={label} checked={settings[key]} onChange={(v) => set({ [key]: v })} />
          </div>
        ))}
      </Card>

      <Card title="Message templates">
        <p className="muted small">
          Texts sent to callers. Use <code>{'{name}'}</code>, <code>{'{clinic}'}</code> and <code>{'{time}'}</code>.
        </p>
        {[
          ['callback', 'Callback acknowledgement'],
          ['confirm', 'Appointment confirmation'],
        ].map(([key, label]) => (
          <div className="template" key={key}>
            <label htmlFor={`tpl-${key}`}>
              <strong>{label}</strong>
            </label>
            <textarea id={`tpl-${key}`} rows={2} value={settings.templates[key]} onChange={(e) => setTemplate(key, e.target.value)} />
            <p className="preview small">
              <span className="muted">Preview:</span> {fill(settings.templates[key])}
            </p>
          </div>
        ))}
      </Card>

      <Card title="Escalation rules">
        <p className="muted small">Which calls appear on the Owner Escalation Board.</p>
        <div className="radios">
          {RULES.map(([id, label, hint]) => (
            <label key={id} className={`radio ${settings.escalationRule === id ? 'on' : ''}`}>
              <input type="radio" name="rule" checked={settings.escalationRule === id} onChange={() => set({ escalationRule: id })} />
              <span>
                <strong>{label}</strong>
                <span className="muted small">{hint}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="setting-row">
          <div>
            <strong>Auto-escalate unanswered urgent calls</strong>
            <p className="muted small">If nobody picks up an urgent call, notify the owner after this many minutes.</p>
          </div>
          <select value={settings.autoEscalateAfterMin} onChange={(e) => set({ autoEscalateAfterMin: Number(e.target.value) })}>
            {[5, 10, 15, 30].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card title="Demo data">
        <div className="setting-row">
          <div>
            <strong>Reset demo</strong>
            <p className="muted small">Restore the sample calls and appointments (useful before presenting).</p>
          </div>
          <button className="btn ghost" onClick={() => dispatch({ type: 'reset' })}>
            Reset
          </button>
        </div>
      </Card>
    </>
  )
}
