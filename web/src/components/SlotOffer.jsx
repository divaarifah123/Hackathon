import { useStore } from '../lib/store.jsx'
import { openSlots, slotCandidates } from '../lib/insights.js'
import { formatDay, formatTime, Avatar, Empty } from './ui.jsx'
import { displayName } from './Contact.jsx'

// A cancellation isn't a hole in the diary, it's a chance to help someone
// who's waiting. For each freed slot, suggest the callers who most need it.
export default function SlotOffers({ limit = 2 }) {
  const { appointments, calls, dispatch } = useStore()
  const slots = openSlots(appointments)
  const candidates = slotCandidates(calls)

  if (!slots.length) return <Empty>No cancellations to fill</Empty>

  const used = new Set()
  return (
    <ul className="slot-offers">
      {slots.map((slot) => {
        const picks = candidates.filter((c) => !used.has(c.id)).slice(0, limit)
        if (picks[0]) used.add(picks[0].id)
        return (
          <li key={slot.id}>
            <div className="slot-when">
              <strong>
                {formatDay(slot.start)} · {formatTime(slot.start)}
              </strong>
              <span className="muted small">
                {slot.type} · {slot.note || 'Cancelled'}
              </span>
            </div>
            {picks.length ? (
              <div className="slot-picks">
                {picks.map((c) => (
                  <div className="slot-pick" key={c.id}>
                    <Avatar name={c.caller} size="small" />
                    <div className="grow">
                      <strong>{displayName(c)}</strong>
                      <span className="muted small">
                        {c.reason}
                        {c.repeatCount > 1 ? ` · called ${c.repeatCount}×` : ''}
                      </span>
                    </div>
                    <button className="btn primary sm" onClick={() => dispatch({ type: 'book', id: c.relatedIds, start: slot.start, slotId: slot.id })}>
                      Offer & book
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted small">Nobody waiting — Jade will offer it to the next caller.</p>
            )}
          </li>
        )
      })}
    </ul>
  )
}
