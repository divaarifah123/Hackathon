import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { isValidPhone, PHONE_SOURCE_LABEL } from '../lib/insights.js'
import Icon from './Icon.jsx'

export const displayName = (call) => call.caller || 'Unknown caller'

// Shows the number staff should call, and says plainly when it's been
// recovered from somewhere else or can't be used at all.
export function PhoneLine({ call }) {
  const { contact } = call
  if (!contact.ok) {
    return (
      <span className="phone bad" title={contact.spoken ? `Jade heard: ${contact.spoken}` : undefined}>
        <Icon name="alert" size={13} /> {contact.spoken || 'No number'} · {contact.problem}
      </span>
    )
  }
  const note = PHONE_SOURCE_LABEL[contact.source]
  return (
    <span className="phone">
      {contact.number}
      {note && (
        <span className="phone-note" title={contact.spoken ? `Jade heard: ${contact.spoken} (${contact.problem})` : undefined}>
          {note}
        </span>
      )}
    </span>
  )
}

export function CallBackButton({ call, className = 'btn ghost sm' }) {
  if (!call.contact.ok) {
    return (
      <a className={`${className} warn`} href={`#/calls/${call.id}`}>
        <Icon name="alert" size={14} /> Fix number
      </a>
    )
  }
  return (
    <a className={className} href={`tel:${call.contact.number.replace(/\D/g, '')}`}>
      <Icon name="phone" size={14} /> Call back
    </a>
  )
}

// Inline form for correcting a bad number (e.g. from the patient file or a
// voicemail). Validates before saving so we never store another bad number.
export function FixPhone({ call }) {
  const { dispatch } = useStore()
  const [value, setValue] = useState(call.contact.spoken || '')
  const valid = isValidPhone(value)
  const save = (e) => {
    e.preventDefault()
    if (valid) dispatch({ type: 'fixPhone', id: call.relatedIds, phone: value })
  }
  return (
    <form className="fix-phone" onSubmit={save}>
      <label className="sr-only" htmlFor={`fix-${call.id}`}>
        Correct phone number
      </label>
      <input id={`fix-${call.id}`} inputMode="tel" value={value} onChange={(e) => setValue(e.target.value)} placeholder="04xx xxx xxx" aria-invalid={!valid} />
      <button className="btn primary sm" type="submit" disabled={!valid}>
        Save number
      </button>
    </form>
  )
}
