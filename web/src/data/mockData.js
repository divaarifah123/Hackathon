// Mock output from Jade. Each call is shaped the way we'd expect Jade's
// per-call payload to look, so this file can later be replaced by a fetch.
// Times are relative to "now" so the demo always looks live.

export const CLINIC_NAME = 'Boro Clinic'

const ago = (min) => new Date(Date.now() - min * 60000).toISOString()
const inDays = (days, hour, minute = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const calls = [
  {
    id: '0482',
    caller: 'Marcus Vance',
    phone: '0412 384 902',
    receivedAt: ago(6),
    durationSec: 214,
    intent: 'emergency',
    reason: 'Facial swelling after extraction',
    summary:
      'Had a wisdom tooth removed on Monday. Swelling has spread to the jaw and neck since this morning, severe throbbing pain, finding it hard to swallow. Wants to be seen today.',
    status: 'new',
    assignee: null,
    transcript: [
      { speaker: 'jade', text: 'Thanks for calling Boro Clinic, this is Jade. How can I help?' },
      { speaker: 'caller', text: "Hi, I had a wisdom tooth out on Monday and the swelling's gotten a lot worse since this morning." },
      { speaker: 'jade', text: "I'm sorry to hear that. Can you tell me where the swelling is and how the pain is?" },
      { speaker: 'caller', text: "It's gone down my jaw into my neck. The pain is severe, like a 9, and it's getting hard to swallow." },
      { speaker: 'jade', text: "Thank you. I'm flagging this as urgent for the team right now. Is this the best number to reach you?" },
      { speaker: 'caller', text: 'Yes, this number. Can someone see me today?' },
      { speaker: 'jade', text: "I've let the team know you'd like to be seen today. If you have trouble breathing, please call 000 straight away." },
    ],
  },
  {
    id: '0481',
    caller: 'Priya Natarajan',
    phone: '0433 118 207',
    receivedAt: ago(14),
    durationSec: 162,
    intent: 'emergency',
    reason: "Child's chipped tooth, bleeding",
    summary: "Son (7) fell at school and chipped a front tooth. Gum bleeding that won't stop after 15 minutes. Mum is on the way to pick him up.",
    status: 'new',
    assignee: null,
    transcript: [
      { speaker: 'jade', text: 'Thanks for calling Boro Clinic, this is Jade. How can I help?' },
      { speaker: 'caller', text: "My son fell at school and chipped his front tooth. The school says it won't stop bleeding." },
      { speaker: 'jade', text: 'How long has it been bleeding for?' },
      { speaker: 'caller', text: 'About fifteen minutes now. I am on my way to get him. Can you fit him in?' },
    ],
  },
  {
    id: '0479',
    caller: 'Tom Hadley',
    phone: '0401 773 540',
    receivedAt: ago(38),
    durationSec: 301,
    intent: 'complaint',
    reason: 'Charged twice for last visit',
    summary: 'Says he was charged twice for his crown fitting and has asked for a refund. Frustrated, asked to speak to the owner directly.',
    status: 'new',
    assignee: null,
    transcript: [
      { speaker: 'caller', text: "I've been charged twice for my crown last week and I want a refund." },
      { speaker: 'jade', text: "I'm sorry about that. I can pass this on to the team with your details." },
      { speaker: 'caller', text: "Honestly I'd like to speak to the owner. This is the second time this has happened." },
    ],
  },
  {
    id: '0480',
    caller: 'Grace Liu',
    phone: '0422 650 118',
    receivedAt: ago(22),
    durationSec: 128,
    intent: 'appointment',
    reason: 'Toothache, wants today',
    summary: 'Dull ache in lower left molar for three days, getting worse at night. Asked for an appointment this afternoon if possible.',
    status: 'new',
    assignee: 'reception',
    transcript: [
      { speaker: 'caller', text: "I've had a toothache for three days, it hurts more at night." },
      { speaker: 'caller', text: 'Is there anything this afternoon?' },
    ],
  },
  {
    id: '0477',
    caller: 'Daniel Okafor',
    phone: '0455 209 334',
    receivedAt: ago(55),
    durationSec: 96,
    intent: 'prescription',
    reason: 'Ran out of antibiotics',
    summary: 'Ran out of the antibiotics prescribed after his root canal, two days short. Wants a callback about a repeat script.',
    status: 'in_progress',
    assignee: 'reception',
    transcript: [
      { speaker: 'caller', text: 'I ran out of my medication, I think I was given two days short.' },
      { speaker: 'caller', text: 'Could someone call me back about getting a new prescription?' },
    ],
  },
  {
    id: '0476',
    caller: 'Sophie Marchetti',
    phone: '0419 882 016',
    receivedAt: ago(71),
    durationSec: 145,
    intent: 'appointment',
    reason: 'New patient check-up & clean',
    summary: 'New patient, moved to the area recently. Wants a check-up and clean, flexible on days, prefers mornings.',
    status: 'new',
    assignee: null,
    transcript: [
      { speaker: 'caller', text: "Hi, I'm a new patient, I just moved nearby. I'd like to book a check-up and clean." },
      { speaker: 'caller', text: 'Mornings are best for me, any day next week is fine.' },
    ],
  },
  {
    id: '0475',
    caller: 'Ahmed Rahimi',
    phone: '0408 316 775',
    receivedAt: ago(96),
    durationSec: 88,
    intent: 'reschedule',
    reason: "Reschedule Thursday's appointment",
    summary: 'Needs to move his Thursday 2:30pm filling to next week due to a work trip.',
    status: 'new',
    assignee: null,
    transcript: [{ speaker: 'caller', text: "I need to move my Thursday appointment, I'm travelling for work." }],
  },
  {
    id: '0474',
    caller: 'Ellie Brooks',
    phone: '0437 551 902',
    receivedAt: ago(120),
    durationSec: 64,
    intent: 'question',
    reason: 'Health fund question',
    summary: 'Asked whether the clinic accepts Bupa and if HICAPS claiming is on the spot. Jade answered — no follow-up needed.',
    status: 'resolved',
    resolvedBy: 'jade',
    assignee: null,
    transcript: [{ speaker: 'caller', text: 'Do you take Bupa? Can I claim on the spot?' }],
  },
  {
    id: '0473',
    caller: 'Ravi Shah',
    phone: '0466 204 811',
    receivedAt: ago(140),
    durationSec: 51,
    intent: 'question',
    reason: 'Parking & opening hours',
    summary: 'Asked about Saturday hours and parking. Jade answered — no follow-up needed.',
    status: 'resolved',
    resolvedBy: 'jade',
    assignee: null,
    transcript: [{ speaker: 'caller', text: 'Are you open Saturday, and is there parking?' }],
  },
  {
    id: '0472',
    caller: 'Hannah Kim',
    phone: '0413 998 204',
    receivedAt: ago(165),
    durationSec: 110,
    intent: 'appointment',
    reason: 'Whitening consult',
    summary: 'Interested in teeth whitening, wants a consult and price range. Any weekday after 4pm.',
    status: 'new',
    assignee: null,
    transcript: [{ speaker: 'caller', text: "I'm interested in whitening, can I book a consult? After 4pm works." }],
  },
]

export const appointments = [
  { id: 'a1', patient: 'Sarah Jenkins', start: inDays(0, 14, 30), type: 'Filling — upper right', source: 'Jade', status: 'confirmed' },
  { id: 'a2', patient: 'Michael Torres', start: inDays(0, 15, 15), type: 'Check-up & clean', source: 'Reception', status: 'confirmed' },
  { id: 'a3', patient: 'Olivia Chen', start: inDays(0, 16, 0), type: 'Emergency screening', source: 'Jade', status: 'pending' },
  { id: 'a4', patient: 'James Wilson', start: inDays(1, 9, 0), type: 'Root canal — stage 2', source: 'Reception', status: 'confirmed' },
  { id: 'a5', patient: 'Amelia Patel', start: inDays(1, 10, 30), type: 'New patient screening', source: 'Jade', status: 'pending' },
  { id: 'a6', patient: 'Noah Robinson', start: inDays(1, 13, 0), type: 'Crown fitting', source: 'Jade', status: 'confirmed' },
  { id: 'a7', patient: 'Ahmed Rahimi', start: inDays(2, 14, 30), type: 'Filling — lower left', source: 'Reception', status: 'reschedule' },
  { id: 'a8', patient: 'Isla Murphy', start: inDays(3, 11, 0), type: 'Orthodontic screening', source: 'Jade', status: 'confirmed' },
]

export const defaultSettings = {
  notifySms: true,
  notifyEmail: true,
  notifyPush: false,
  quietHours: true,
  escalationRule: 'urgent_and_complaints',
  autoEscalateAfterMin: 10,
  ownerPhone: '0400 000 000',
  templates: {
    callback: "Hi {name}, it's {clinic} returning your call. We've got your message and will ring you shortly.",
    confirm: 'Hi {name}, your appointment at {clinic} is confirmed for {time}. Reply C to confirm or R to reschedule.',
  },
}
