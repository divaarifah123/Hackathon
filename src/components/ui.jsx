import Icon from './Icon.jsx'
import { LEVELS } from '../lib/triage.js'

export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      <div className="header-actions">{children}</div>
    </header>
  )
}

export function JadeLive() {
  return (
    <span className="pill live">
      <span className="dot" /> Jade is answering calls
    </span>
  )
}

export function UrgencyBadge({ level }) {
  return <span className={`badge level-${level}`}>{LEVELS[level].label}</span>
}

export function StatusBadge({ status }) {
  const labels = {
    new: 'New',
    in_progress: 'In progress',
    resolved: 'Resolved',
    confirmed: 'Confirmed',
    pending: 'Pending',
    reschedule: 'Reschedule',
    cancelled: 'Cancelled',
  }
  return <span className={`badge status-${status}`}>{labels[status] || status}</span>
}

export function Avatar({ name, size }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
  // Stable pastel colour per name.
  const hue = [...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 360, 7)
  return (
    <span className={`avatar ${size || ''}`} style={{ '--hue': hue }}>
      {initials}
    </span>
  )
}

export function Flags({ flags }) {
  if (!flags.length) return null
  return (
    <div className="flags">
      {flags.map((f) => (
        <span key={f} className="flag">
          {f}
        </span>
      ))}
    </div>
  )
}

export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="card-head">
          {title && <h2>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Empty({ children }) {
  return (
    <div className="empty">
      <Icon name="check" size={20} />
      {children}
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`toggle ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
      <span />
    </button>
  )
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function formatDay(iso) {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
}
