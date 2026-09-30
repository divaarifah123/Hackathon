import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { calls as seedCalls, appointments as seedAppointments, patients, defaultSettings } from '../data/mockData.js'
import { enrichCalls } from './insights.js'

const STORAGE_KEY = 'jade-triage-v2'

function initialState() {
  const fresh = { calls: seedCalls, appointments: seedAppointments, settings: defaultSettings, activity: [] }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.calls) return { ...saved, settings: mergeSettings(saved.settings) }
  } catch {
    // Storage unavailable or corrupt — fall back to the seed data.
  }
  return fresh
}

// Saved settings may predate a newly added option: fill any gaps from defaults.
function mergeSettings(saved = {}) {
  const out = {}
  for (const [k, v] of Object.entries(defaultSettings)) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) ? { ...v, ...(saved[k] || {}) } : (saved[k] ?? v)
  }
  return out
}

function log(state, text) {
  return [{ at: new Date().toISOString(), text }, ...state.activity].slice(0, 30)
}

// Accepts one id or several (a caller who rang three times is handled once).
function updateCall(state, id, patch) {
  const ids = Array.isArray(id) ? id : [id]
  return state.calls.map((c) => (ids.includes(c.id) ? { ...c, ...patch } : c))
}

const nameOf = (call) => call?.caller || 'Unknown caller'

function reducer(state, action) {
  const call = state.calls.find((c) => c.id === (Array.isArray(action.id) ? action.id[0] : action.id))
  switch (action.type) {
    case 'assign':
      return {
        ...state,
        calls: updateCall(state, action.id, { assignee: action.to, status: 'in_progress' }),
        activity: log(state, `${nameOf(call)} assigned to ${action.to}`),
      }
    case 'resolve':
      return {
        ...state,
        calls: updateCall(state, action.id, { status: 'resolved', resolvedBy: action.by || 'staff', resolvedAt: new Date().toISOString() }),
        activity: log(state, `${nameOf(call)} marked resolved`),
      }
    case 'reopen':
      return { ...state, calls: updateCall(state, action.id, { status: 'new', resolvedBy: undefined }) }
    case 'acknowledge':
      return {
        ...state,
        calls: updateCall(state, action.id, { ownerAcknowledged: true, assignee: 'owner', status: 'in_progress' }),
        activity: log(state, `Owner acknowledged ${nameOf(call)}`),
      }
    case 'addNote':
      return {
        ...state,
        calls: updateCall(state, action.id, {
          notes: [...(call.notes || []), { at: new Date().toISOString(), text: action.text }],
        }),
      }
    case 'fixPhone':
      return {
        ...state,
        calls: updateCall(state, action.id, { phoneOverride: action.phone }),
        activity: log(state, `Number corrected for ${nameOf(call)}`),
      }
    case 'book': {
      const appt = {
        id: `a${Date.now()}`,
        patient: nameOf(call),
        start: action.start,
        type: call.reason,
        source: 'Jade',
        status: 'confirmed',
        callId: call.id,
      }
      return {
        ...state,
        // Filling a cancelled slot: remember who took it so it stops showing as open.
        appointments: [
          ...state.appointments.map((a) => (a.id === action.slotId ? { ...a, refilledBy: appt.id } : a)),
          appt,
        ],
        calls: updateCall(state, action.id, { status: 'resolved', resolvedBy: 'staff', bookedAt: action.start }),
        activity: log(state, `Booked ${nameOf(call)}`),
      }
    }
    case 'setApptStatus':
      return {
        ...state,
        appointments: state.appointments.map((a) => (a.id === action.id ? { ...a, status: action.status } : a)),
      }
    case 'saveSettings':
      return { ...state, settings: action.settings, activity: log(state, 'Settings updated') }
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
  const useCallerId = state.settings.callbacks.useCallerId
  const calls = useMemo(() => enrichCalls(state.calls, patients, { useCallerId }), [state.calls, useCallerId])

  const value = useMemo(() => ({ ...state, calls, dispatch }), [state, calls])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}
