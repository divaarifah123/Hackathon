import { test } from 'node:test'
import assert from 'node:assert/strict'
import { triageCall } from './triage.js'
import { calls } from '../data/mockData.js'

const byId = (id) => triageCall(calls.find((c) => c.id === id))

test('swelling + severe pain is urgent and escalates to owner', () => {
  const t = byId('0482')
  assert.equal(t.level, 'urgent')
  assert.ok(t.escalateToOwner)
})

test('child with bleeding is urgent', () => {
  assert.equal(byId('0481').level, 'urgent')
})

test('billing complaint goes to the owner but is not a medical emergency', () => {
  const t = byId('0479')
  assert.equal(t.level, 'today')
  assert.ok(t.escalateToOwner)
  assert.ok(t.ownerReasons.includes('Billing dispute'))
})

test('new patient check-up is routine', () => {
  const t = byId('0476')
  assert.equal(t.level, 'routine')
  assert.ok(!t.escalateToOwner)
})

test("Jade's own lines do not trigger flags", () => {
  const t = triageCall({
    reason: 'Opening hours',
    summary: 'Asked about opening hours.',
    receivedAt: new Date().toISOString(),
    transcript: [{ speaker: 'jade', text: "I'll have someone call you back today if it's urgent" }],
  })
  assert.equal(t.level, 'routine')
  assert.deepEqual(t.flags, [])
})
