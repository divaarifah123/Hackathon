import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { calls as seedCalls, appointments as seedAppointments, defaultSettings } from '../data/mockData.js'
import { triageCall } from './triage.js'

const STORAGE_KEY = 'jade-triage-v1'

function initialState() {
  const fresh = { calls: seedCalls, appointments: seedAppointments, settings: defaultSettings, activity: [] }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.calls) return saved
  } catch {
    // Storage unavailable or corrupt — fall back to the seed data.
  }
  return fresh
}

function log(state, text) {
  return [{ at: new Date().toISOString(), text }, ...state.activity].slice(0, 30)
}

function updateCall(state, id, patch) {
  return state.calls.map((c) => (c.id === id ? { ...c, ...patch } : c))
}

function reducer(state, action) {
  const call = state.calls.find((c) => c.id === action.id)
  switch (action.type) {
    case 'assign':
      return {
        ...state,
        calls: updateCall(state, action.id, { assignee: action.to, status: 'in_progress' }),
        activity: log(state, `${call.caller} assigned to ${action.to}`),
      }
    case 'resolve':
      return {
        ...state,
        calls: updateCall(state, action.id, { status: 'resolved', resolvedBy: action.by || 'staff', resolvedAt: new Date().toISOString() }),
        activity: log(state, `${call.caller} marked resolved`),
      }
    case 'reopen':
      return { ...state, calls: updateCall(state, action.id, { status: 'new', resolvedBy: undefined }) }
    case 'acknowledge':
      return {
        ...state,
        calls: updateCall(state, action.id, { ownerAcknowledged: true, assignee: 'owner', status: 'in_progress' }),
        activity: log(state, `Owner acknowledged ${call.caller}`),
      }
    case 'addNote':
      return {
        ...state,
        calls: updateCall(state, action.id, {
          notes: [...(call.notes || []), { at: new Date().toISOString(), text: action.text }],
        }),
      }
    case 'book': {
      const appt = {
        id: `a${Date.now()}`,
        patient: call.caller,
        start: action.start,
        type: call.reason,
        source: 'Jade',
        status: 'confirmed',
        callId: call.id,
      }
      return {
        ...state,
        appointments: [...state.appointments, appt],
        calls: updateCall(state, action.id, { status: 'resolved', resolvedBy: 'staff', bookedAt: action.start }),
        activity: log(state, `Booked ${call.caller}`),
      }
    }
    case 'setApptStatus':
      return {
        ...state,
        appointments: state.appointments.map((a) => (a.id === action.id ? { ...a, status: action.status } : a)),
      }
    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'reset':
      return { calls: seedCalls, appointments: seedAppointments, settings: defaultSettings, activity: [] }
    default:
      return state
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Private mode etc. — the demo still works, it just won't persist.
    }
  }, [state])

  // Triage is derived, never stored, so tweaking the rules re-scores everything.
  const calls = useMemo(() => state.calls.map((c) => ({ ...c, triage: triageCall(c) })), [state.calls])

  const value = useMemo(() => ({ ...state, calls, dispatch }), [state, calls])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}
