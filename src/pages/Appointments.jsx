import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { PageHeader, JadeLive, StatusBadge, Avatar, Card, Empty, formatDay, formatTime } from '../components/ui.jsx'

const FILTERS = [
  ['all', 'All upcoming'],
  ['today', 'Today'],
  ['jade', 'Booked by Jade'],
  ['action', 'Needs action'],
]

export default function Appointments() {
  const { appointments, calls, dispatch } = useStore()
  const [filter, setFilter] = useState('all')

  const todayStr = new Date().toDateString()
  const rows = [...appointments]
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .filter((a) => {
      if (filter === 'today') return new Date(a.start).toDateString() === todayStr
      if (filter === 'jade') return a.source === 'Jade'
      if (filter === 'action') return a.status === 'pending' || a.status === 'reschedule'
      return a.status !== 'cancelled'
    })

  const requests = calls.filter((c) => ['appointment', 'reschedule'].includes(c.intent) && c.status !== 'resolved')

  return (
    <>
      <PageHeader title="Upcoming Bookings & Screenings" subtitle="Appointments from the front desk and from Jade, in one list">
        <JadeLive />
      </PageHeader>

      <div className="segmented chips">
        {FILTERS.map(([id, label]) => (
          <button key={id} className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      <Card className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>When</th>
                <th>Appointment</th>
                <th>Source</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className="who">
                      <Avatar name={a.patient} size="small" />
                      {a.patient}
                    </span>
                  </td>
                  <td>
                    <strong>{formatDay(a.start)}</strong> <span className="muted">{formatTime(a.start)}</span>
                  </td>
                  <td>{a.type}</td>
                  <td>
                    <span className={`source ${a.source === 'Jade' ? 'jade' : ''}`}>{a.source}</span>
                  </td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="row-actions">
                    {a.status !== 'confirmed' && (
                      <button className="btn ghost sm" onClick={() => dispatch({ type: 'setApptStatus', id: a.id, status: 'confirmed' })}>
                        Confirm
                      </button>
                    )}
                    {a.callId && (
                      <a className="btn link sm" href={`#/calls/${a.callId}`}>
                        View call
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <Empty>No appointments match this filter</Empty>}
        </div>
      </Card>

      <Card title="Booking requests from Jade" action={<span className="count">{requests.length}</span>}>
        {requests.length ? (
          <ul className="list">
            {requests.map((c) => (
              <li key={c.id}>
                <Avatar name={c.caller} size="small" />
                <div className="grow">
                  <strong>{c.caller}</strong>
                  <p className="muted small">{c.summary}</p>
                </div>
                <a className="btn primary sm" href={`#/calls/${c.id}`}>
                  Book
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>All booking requests handled</Empty>
        )}
      </Card>
    </>
  )
}
