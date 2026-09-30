import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkPhone, isValidPhone, enrichCalls, openSlots, slotCandidates, missedDemand } from './insights.js'
import { calls, patients, appointments } from '../data/mockData.js'

const enriched = enrichCalls(calls, patients)
const byId = (id) => enriched.find((c) => c.id === id)

test('phone validation', () => {
  assert.ok(isValidPhone('0412 384 902'))
  assert.ok(isValidPhone('(02) 9555 0142'))
  assert.ok(isValidPhone('+61 412 384 902'))
  assert.ok(!isValidPhone('0412 345 67'))
  assert.ok(!isValidPhone(''))
  assert.ok(!isValidPhone(null))
})

test('digit-short number with no caller ID cannot be called back and is flagged', () => {
  const c = byId('0478')
  assert.equal(c.contact.ok, false)
  assert.match(c.contact.problem, /1 short/)
  assert.ok(c.triage.flags.includes("Can't call back"))
  assert.notEqual(c.triage.level, 'routine')
})

test('digit-short number falls back to caller ID', () => {
  const c = byId('0471')
  assert.equal(c.contact.ok, true)
  assert.equal(c.contact.source, 'callerId')
  assert.equal(c.contact.number, '0438 219 077')
})

test('digit-short number falls back to patient record by name', () => {
  const r = checkPhone({ caller: 'Daniel Okafor', phone: '0455 209', callerId: null }, patients)
  assert.equal(r.source, 'patientRecord')
  assert.equal(r.number, '0455 209 334')
})

test('staff correction wins', () => {
  const r = checkPhone({ phone: '0412 345 67', phoneOverride: '0412345678' })
  assert.deepEqual([r.ok, r.source], [true, 'staff'])
})

test('three weekend calls collapse into one card that is bumped up', () => {
  const liam = enriched.filter((c) => c.caller === 'Liam Foster')
  assert.equal(liam.filter((c) => c.isLatestFromCaller).length, 1)
  const latest = liam.find((c) => c.isLatestFromCaller)
  assert.equal(latest.repeatCount, 3)
  assert.equal(latest.triage.level, 'today')
  assert.match(latest.triage.flags[0], /Called 3×/)
})

test('2:14am call is flagged after hours and not left as routine', () => {
  const c = byId('0483')
  assert.ok(c.triage.flags.some((f) => f.startsWith('After hours')))
  assert.equal(c.triage.level, 'today')
})

test('"I\'ll try somewhere else" is at risk', () => {
  const c = byId('0465')
  assert.ok(c.triage.atRisk)
  assert.equal(c.triage.level, 'today')
})

test('services not offered are counted as demand', () => {
  const d = missedDemand(enriched)
  assert.deepEqual(d.find((x) => x.service === 'Dental implants'), { service: 'Dental implants', count: 2 })
  assert.ok(d.some((x) => x.service === 'Invisalign'))
})

test('call with no recording or name still triages', () => {
  const c = byId('0463')
  assert.equal(c.contact.source, 'callerId')
  assert.ok(c.triage.flags.includes('No recording'))
})

test('cancelled future slots become opportunities with candidates', () => {
  const slots = openSlots(appointments)
  assert.equal(slots.length, 2)
  const who = slotCandidates(enriched)
  assert.ok(who.length > 0)
  assert.ok(who.every((c) => c.contact.ok && c.status !== 'resolved'))
  assert.ok(!who.some((c) => c.id === '0466'), 'older duplicate calls are not offered separately')
})
