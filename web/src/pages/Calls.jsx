import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { sortByPriority, formatWait } from '../lib/triage.js'
import { go } from '../lib/router.js'
import { PageHeader, JadeLive, Card, Avatar, UrgencyBadge, StatusBadge, Empty } from '../components/ui.jsx'
import { PhoneLine, displayName } from '../components/Contact.jsx'
import Icon from '../components/Icon.jsx'

const FILTERS = [
  ['open', 'Open'],
  ['all', 'All calls'],
  ['resolved', 'Resolved'],
  ['issues', 'Needs fixing'],
]

export default function Calls() {
  const { calls } = useStore()
  const [filter, setFilter] = useState('open')
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const rows = (filter === 'resolved' ? [...calls].sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)) : sortByPriority(calls)).filter((c) => {
    if (filter === 'open' && c.status === 'resolved') return false
    if (filter === 'resolved' && c.status !== 'resolved') return false
    if (filter === 'issues' && (c.status === 'resolved' || (c.contact.ok && c.transcript?.length))) return false
    if (!q) return true
    return [c.caller, c.phone, c.contact.number, c.reason, c.summary, c.id].join(' ').toLowerCase().includes(q)
  })

  return (
    <>
      <PageHeader title="Calls" subtitle="Every call Jade has taken. Open one to see the transcript and act on it.">
        <JadeLive />
      </PageHeader>

      <div className="board-toolbar">
        <div className="segmented">
          {FILTERS.map(([id, label]) => (
            <button key={id} className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
        <label className="search">
          <Icon name="search" size={15} />
          <input placeholder="Search caller, number, reason…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      <Card className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Caller</th>
                <th>Reason</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="clickable" onClick={() => go(`calls/${c.id}`)}>
                  <td>
                    <span className="who">
                      <Avatar name={c.caller} size="small" />
                      <span>
                        <a href={`#/calls/${c.id}`} onClick={(e) => e.stopPropagation()}>
                          {displayName(c)}
                        </a>
                        <span className="block muted small">
                          <PhoneLine call={c} />
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="wrap">{c.reason || '—'}</td>
                  <td>
                    <UrgencyBadge level={c.triage.level} />
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="muted">{formatWait(c.receivedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <Empty>No calls match</Empty>}
        </div>
      </Card>
    </>
  )
}
