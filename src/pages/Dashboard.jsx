import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { LEVELS, sortByPriority } from '../lib/triage.js'
import { CLINIC_NAME } from '../data/mockData.js'
import { PageHeader, JadeLive, Empty } from '../components/ui.jsx'
import CallCard from '../components/CallCard.jsx'
import Icon from '../components/Icon.jsx'

const COLUMNS = [
  { level: 'urgent', hint: 'Call back now' },
  { level: 'today', hint: 'Handle before close' },
  { level: 'routine', hint: 'When you have a moment' },
]

export default function Dashboard() {
  const { calls, appointments } = useStore()
  const [query, setQuery] = useState('')
  const [who, setWho] = useState('all')

  const today = new Date().toDateString()
  const open = calls.filter((c) => c.status !== 'resolved')
  const stats = [
    { label: 'Urgent now', value: open.filter((c) => c.triage.level === 'urgent').length, tone: 'red' },
    { label: 'Awaiting callback', value: open.filter((c) => c.triage.level !== 'urgent').length, tone: 'blue' },
    { label: 'Calls handled by Jade', value: calls.length, tone: 'ink' },
    { label: 'Booked today', value: appointments.filter((a) => new Date(a.start).toDateString() === today).length, tone: 'green' },
    { label: 'Resolved by Jade', value: calls.filter((c) => c.resolvedBy === 'jade').length, tone: 'teal' },
  ]

  const q = query.trim().toLowerCase()
  const visible = sortByPriority(open).filter((c) => {
    if (who === 'mine' && c.assignee !== 'reception') return false
    if (who === 'unassigned' && c.assignee) return false
    if (!q) return true
    return [c.caller, c.phone, c.reason, c.summary, c.id].join(' ').toLowerCase().includes(q)
  })

  const dateLabel = new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      <PageHeader title={`Today at ${CLINIC_NAME}`} subtitle={`${dateLabel} · every call Jade took, sorted by how urgently it needs you`}>
        <JadeLive />
      </PageHeader>

      <div className="stats">
        {stats.map((s) => (
          <div key={s.label} className={`stat tone-${s.tone}`}>
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="board-toolbar">
        <h2>Live Triage Board</h2>
        <div className="toolbar-right">
          <div className="segmented" role="tablist">
            {[
              ['all', 'All'],
              ['unassigned', 'Unassigned'],
              ['mine', 'Reception'],
            ].map(([id, label]) => (
              <button key={id} className={who === id ? 'on' : ''} onClick={() => setWho(id)}>
                {label}
              </button>
            ))}
          </div>
          <label className="search">
            <Icon name="search" size={15} />
            <input placeholder="Search caller, number, reason…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="board">
        {COLUMNS.map((col) => {
          const items = visible.filter((c) => c.triage.level === col.level)
          return (
            <section key={col.level} className={`column level-${col.level}`}>
              <header className="column-head">
                <span className="column-dot" />
                <h3>{LEVELS[col.level].label}</h3>
                <span className="count">{items.length}</span>
                <span className="muted small column-hint">{col.hint}</span>
              </header>
              <div className="column-body">
                {items.length ? items.map((c) => <CallCard key={c.id} call={c} />) : <Empty>Nothing here</Empty>}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}
