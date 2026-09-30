import Icon from './Icon.jsx'
import { useStore } from '../lib/store.jsx'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'calls', label: 'Calls', icon: 'phone' },
  { id: 'appointments', label: 'Appointments', icon: 'calendar' },
  { id: 'callbacks', label: 'Callbacks', icon: 'callback' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

export default function Sidebar({ active }) {
  const { calls } = useStore()
  // Callers who need a person soon: urgent, unreachable, or about to go elsewhere.
  const needsYou = calls.filter(
    (c) => c.status !== 'resolved' && c.isLatestFromCaller && (c.triage.level === 'urgent' || !c.contact.ok || c.triage.atRisk),
  ).length

  return (
    <nav className="sidebar" aria-label="Main">
      <div className="brand">
        <span className="brand-mark">J</span>
        <span className="brand-name">Jade</span>
      </div>
      <ul>
        {NAV.map((item) => (
          <li key={item.id}>
            <a href={`#/${item.id}`} className={active === item.id ? 'active' : ''} title={item.label}>
              <Icon name={item.icon} />
              <span className="nav-label">{item.label}</span>
              {item.id === 'callbacks' && needsYou > 0 && <span className="nav-badge">{needsYou}</span>}
            </a>
          </li>
        ))}
      </ul>
      <div className="sidebar-foot">
        <span className="avatar small">RC</span>
        <span className="nav-label">
          Reception
          <small>Front desk</small>
        </span>
      </div>
    </nav>
  )
}
