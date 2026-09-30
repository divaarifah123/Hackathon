import { useRef, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { CLINIC_NAME, CLINIC_PHONE, defaultSettings } from '../data/mockData.js'
import { PageHeader, Toggle } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'

const FIRST_OPTIONS = [48, 24, 12]
const SECOND_OPTIONS = [6, 3, 2, 1]
const VARIABLES = ['[Patient Name]', '[Time]', '[Date]', '[Clinic Phone]']

const SAMPLE = {
  '[Patient Name]': 'Sarah',
  '[Time]': '2:30pm',
  '[Date]': 'Thursday 2 October',
  '[Clinic Phone]': CLINIC_PHONE,
  '[Clinic Name]': CLINIC_NAME,
}

const fillSample = (text) => Object.entries(SAMPLE).reduce((t, [k, v]) => t.split(k).join(v), text)
const hoursLabel = (h) => `${h} hour${h === 1 ? '' : 's'} before`
// Standard SMS: 160 characters, or 153 per part once it's split.
const smsParts = (text) => (text.length <= 160 ? 1 : Math.ceil(text.length / 153))

export default function Settings() {
  const { settings, dispatch } = useStore()
  const [draft, setDraft] = useState(settings)
  const [saved, setSaved] = useState(false)
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings)

  const set = (section, key, value) => {
    setSaved(false)
    setDraft((d) => ({ ...d, [section]: { ...d[section], [key]: value } }))
  }
  const setReminder = (which, key, value) => set('reminders', which, { ...draft.reminders[which], [key]: value })
  const save = () => {
    dispatch({ type: 'saveSettings', settings: draft })
    setSaved(true)
  }

  const { reminders, messages, rescheduling, callbacks, notifications } = draft
  const remindersOff = !reminders.auto

  return (
    <div className="settings">
      <PageHeader title="Settings" subtitle="Manage how Jade handles appointment reminders, rescheduling, callbacks, and notifications." />

      {/* 1 — Appointment reminders */}
      <SettingsCard title="Appointment reminders" subtitle="Automatically remind patients about upcoming appointments.">
        <label className="check-row">
          <input type="checkbox" checked={reminders.auto} onChange={(e) => set('reminders', 'auto', e.target.checked)} />
          <span>Automatically send appointment reminders</span>
        </label>

        <div className={`reminder-rows ${remindersOff ? 'is-disabled' : ''}`}>
          <ReminderRow
            label="First reminder"
            value={reminders.first}
            options={FIRST_OPTIONS}
            disabled={remindersOff}
            onHours={(h) => setReminder('first', 'hours', h)}
            onToggle={(v) => setReminder('first', 'enabled', v)}
          />
          <ReminderRow
            label="Second reminder"
            value={reminders.second}
            options={SECOND_OPTIONS}
            disabled={remindersOff}
            onHours={(h) => setReminder('second', 'hours', h)}
            onToggle={(v) => setReminder('second', 'enabled', v)}
          />
        </div>

        <p className="help">
          <Icon name="clock" size={14} /> Patients will automatically receive reminders based on their appointment time.
        </p>
      </SettingsCard>

      {/* 2 — Reminder messages */}
      <SettingsCard title="Reminder messages" subtitle="Customize the messages Jade sends to patients.">
        <div className="message-grid">
          <MessageEditor
            title={`${reminders.first.hours}-hour reminder`}
            value={messages.first}
            off={remindersOff || !reminders.first.enabled}
            onChange={(v) => set('messages', 'first', v)}
            onReset={() => set('messages', 'first', defaultSettings.messages.first)}
          />
          <MessageEditor
            title={`${reminders.second.hours}-hour reminder`}
            value={messages.second}
            off={remindersOff || !reminders.second.enabled}
            onChange={(v) => set('messages', 'second', v)}
            onReset={() => set('messages', 'second', defaultSettings.messages.second)}
          />
        </div>
      </SettingsCard>

      {/* 3 — Rescheduling */}
      <SettingsCard title="Rescheduling" subtitle="How patients can move their appointment, and what happens to the slot they leave.">
        <SettingRow title="Let patients reschedule by text" hint="Patients reply R to any reminder and Jade offers new times.">
          <Toggle label="Let patients reschedule by text" checked={rescheduling.allowByReply} onChange={(v) => set('rescheduling', 'allowByReply', v)} />
        </SettingRow>
        <SettingRow title="New times to offer" hint="How many alternative slots Jade suggests." disabled={!rescheduling.allowByReply}>
          <Select value={rescheduling.slotsToOffer} onChange={(v) => set('rescheduling', 'slotsToOffer', v)} options={[2, 3, 4].map((n) => [n, `${n} options`])} disabled={!rescheduling.allowByReply} />
        </SettingRow>
        <SettingRow title="Minimum notice" hint="Changes closer to the appointment than this go to reception instead." disabled={!rescheduling.allowByReply}>
          <Select
            value={rescheduling.minNoticeHours}
            onChange={(v) => set('rescheduling', 'minNoticeHours', v)}
            options={[
              [0, 'No minimum'],
              [2, '2 hours'],
              [24, '24 hours'],
              [48, '48 hours'],
            ]}
            disabled={!rescheduling.allowByReply}
          />
        </SettingRow>
        <SettingRow title="Offer cancelled slots to waiting patients" hint="When someone cancels, the slot is suggested to people already waiting for an appointment.">
          <Toggle label="Offer cancelled slots" checked={rescheduling.fillCancellations} onChange={(v) => set('rescheduling', 'fillCancellations', v)} />
        </SettingRow>
      </SettingsCard>

      {/* 4 — Callbacks */}
      <SettingsCard title="Callbacks" subtitle="How quickly the team should call people back, and how Jade makes sure we can.">
        <SettingRow title="Urgent calls" hint="Target time to call back anything flagged urgent.">
          <Select
            value={callbacks.urgentWithinMin}
            onChange={(v) => set('callbacks', 'urgentWithinMin', v)}
            options={[10, 15, 30, 60].map((m) => [m, `Within ${m} minutes`])}
          />
        </SettingRow>
        <SettingRow title="Everything else" hint="After-hours and weekend calls are due the next business morning.">
          <Select
            value={callbacks.standardWithin}
            onChange={(v) => set('callbacks', 'standardWithin', v)}
            options={[
              ['2', 'Within 2 hours'],
              ['4', 'Within 4 hours'],
              ['same_day', 'Same business day'],
            ]}
          />
        </SettingRow>
        <SettingRow title="Read phone numbers back" hint="Jade repeats the number digit by digit, so a missed digit is caught during the call.">
          <Toggle label="Read phone numbers back" checked={callbacks.readBackNumber} onChange={(v) => set('callbacks', 'readBackNumber', v)} />
        </SettingRow>
        <SettingRow title="Use caller ID if a number is incomplete" hint="Falls back to the number the call came from, then the patient record.">
          <Toggle label="Use caller ID" checked={callbacks.useCallerId} onChange={(v) => set('callbacks', 'useCallerId', v)} />
        </SettingRow>
        <SettingRow title="Win back patients who go elsewhere" hint={`If a caller says they'll try another clinic, Jade texts them the earliest available slot.`}>
          <Toggle label="Win back patients" checked={callbacks.followUpAtRisk} onChange={(v) => set('callbacks', 'followUpAtRisk', v)} />
        </SettingRow>
      </SettingsCard>

      {/* 5 — Notifications */}
      <SettingsCard title="Notifications" subtitle="What the owner hears about, and how.">
        <SettingRow title="Owner's mobile" hint="Used for urgent text alerts.">
          <input className="input" inputMode="tel" value={notifications.ownerPhone} onChange={(e) => set('notifications', 'ownerPhone', e.target.value)} />
        </SettingRow>
        <SettingRow title="Text me urgent calls" hint="Sent as soon as Jade flags a call.">
          <Toggle label="Text me urgent calls" checked={notifications.sms} onChange={(v) => set('notifications', 'sms', v)} />
        </SettingRow>
        <SettingRow title="Email me escalations" hint="One email per escalated call, with Jade's summary.">
          <Toggle label="Email me escalations" checked={notifications.email} onChange={(v) => set('notifications', 'email', v)} />
        </SettingRow>
        <SettingRow title="Morning summary" hint="Overnight and weekend calls in one email at 7:30am.">
          <Toggle label="Morning summary" checked={notifications.dailySummary} onChange={(v) => set('notifications', 'dailySummary', v)} />
        </SettingRow>
        <SettingRow title="Which calls reach the owner" hint="Controls the Owner alerts board.">
          <Select
            value={notifications.escalationRule}
            onChange={(v) => set('notifications', 'escalationRule', v)}
            options={[
              ['urgent_only', 'Urgent calls only'],
              ['urgent_and_complaints', 'Urgent calls and complaints'],
              ['all_today', 'Anything needing a same-day reply'],
            ]}
          />
        </SettingRow>
        <SettingRow title="Quiet hours" hint="Between 9pm and 7am, only urgent calls notify you.">
          <Toggle label="Quiet hours" checked={notifications.quietHours} onChange={(v) => set('notifications', 'quietHours', v)} />
        </SettingRow>
      </SettingsCard>

      <p className="demo-reset">
        <button className="btn link sm" onClick={() => {
            dispatch({ type: 'reset' })
            setDraft(defaultSettings)
          }}>
          Reset demo data
        </button>
      </p>

      {(dirty || saved) && (
      <div className="save-bar" role="status">
        {dirty ? (
          <>
            <span>You have unsaved changes</span>
            <button className="btn ghost" onClick={() => setDraft(settings)}>
              Discard
            </button>
            <button className="btn primary" onClick={save}>
              Save changes
            </button>
          </>
        ) : (
          saved && (
            <span className="saved">
              <Icon name="check" size={16} /> Settings saved
            </span>
          )
        )}
      </div>
      )}
    </div>
  )
}

function SettingsCard({ title, subtitle, children }) {
  return (
    <section className="card settings-card">
      <header className="settings-card-head">
        <h2>{title}</h2>
        <p className="muted">{subtitle}</p>
      </header>
      {children}
    </section>
  )
}

function SettingRow({ title, hint, disabled, children }) {
  return (
    <div className={`setting-row ${disabled ? 'is-disabled' : ''}`}>
      <div>
        <strong>{title}</strong>
        {hint && <p className="muted small">{hint}</p>}
      </div>
      <div className="setting-control">{children}</div>
    </div>
  )
}

function Select({ value, onChange, options, disabled }) {
  return (
    <select className="select" value={value} disabled={disabled} onChange={(e) => onChange(typeof value === 'number' ? Number(e.target.value) : e.target.value)}>
      {options.map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  )
}

function ReminderRow({ label, value, options, disabled, onHours, onToggle }) {
  const off = disabled || !value.enabled
  return (
    <div className={`reminder-row ${off ? 'is-off' : ''}`}>
      <div className="reminder-icon">
        <Icon name="bell" size={16} />
      </div>
      <div className="grow">
        <strong>{label}</strong>
        <p className="muted small">{hoursLabel(value.hours)} appointment</p>
      </div>
      <Select value={value.hours} onChange={onHours} options={options.map((h) => [h, hoursLabel(h)])} disabled={off} />
      <Toggle label={label} checked={value.enabled && !disabled} onChange={onToggle} />
    </div>
  )
}

function MessageEditor({ title, value, off, onChange, onReset }) {
  const ref = useRef(null)
  const insert = (token) => {
    const el = ref.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    onChange(value.slice(0, start) + token + value.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + token.length, start + token.length)
    })
  }
  const parts = smsParts(fillSample(value))

  return (
    <div className={`message-editor ${off ? 'is-off' : ''}`}>
      <div className="message-head">
        <h3>{title}</h3>
        {off ? <span className="badge status-cancelled">Off</span> : <span className="badge status-confirmed">Active</span>}
      </div>
      <label className="sr-only" htmlFor={`msg-${title}`}>
        {title} message
      </label>
      <textarea id={`msg-${title}`} ref={ref} rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
      <div className="message-tools">
        <div className="chips">
          {VARIABLES.map((v) => (
            <button type="button" key={v} className="chip" onClick={() => insert(v)}>
              + {v.slice(1, -1)}
            </button>
          ))}
        </div>
        <span className={`muted small ${parts > 1 ? 'warn-text' : ''}`}>
          {value.length} chars · {parts} SMS
        </span>
      </div>
      <div className="sms-preview">
        <span className="muted small">Preview</span>
        <p>{fillSample(value)}</p>
      </div>
      <button type="button" className="btn link sm" onClick={onReset}>
        Reset to default
      </button>
    </div>
  )
}
