import Icon from './Icon.jsx'
import { useStore } from '../lib/store.jsx'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'appointments', label: 'Appointments', icon: 'calendar' },
  { id: 'calls', label: 'Call Detail', icon: 'phone' },
  { id: 'alerts', label: 'Owner Alerts', icon: 'bell' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

export default function Sidebar({ active }) {
  const { calls } = useStore()
  const alertCount = calls.filter((c) => c.triage.escalateToOwner && c.status !== 'resolved' && !c.ownerAcknowledged).length

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
              {item.id === 'alerts' && alertCount > 0 && <span className="nav-badge">{alertCount}</span>}
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
