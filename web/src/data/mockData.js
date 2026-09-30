// Mock output from Jade. Each call is shaped the way we'd expect Jade's
// per-call payload to look, so this file can later be replaced by a fetch.
// Times are relative to "now" so the demo always looks live.

export const CLINIC_NAME = 'Harbourside Dental'
export const CLINIC_PHONE = '(02) 9555 0142'

const ago = (min) => new Date(Date.now() - min * 60000).toISOString()
// Most recent past occurrence of a given weekday/time (0 = Sunday).
const last = (weekday, hour, minute = 0) => {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() - weekday + 7) % 7))
  if (d > new Date()) d.setDate(d.getDate() - 7)
  return d.toISOString()
}
// Most recent past time of day (today if it's already passed, else yesterday).
const lastAt = (hour, minute) => {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  if (d > new Date()) d.setDate(d.getDate() - 1)
  return d.toISOString()
}
// A slot later today (rounded to 15 min), so demo slots are never in the past.
const laterToday = (hoursAhead) => {
  const d = new Date(Date.now() + hoursAhead * 3600000)
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0)
  return d.toISOString()
}
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
      { speaker: 'jade', text: 'Thanks for calling Harbourside Dental, this is Jade. How can I help?' },
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
      { speaker: 'jade', text: 'Thanks for calling Harbourside Dental, this is Jade. How can I help?' },
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
    summary: 'Interested in teeth whitening, wants a consult and price range. Also asked if we do Invisalign. Any weekday after 4pm.',
    status: 'new',
    assignee: null,
    transcript: [{ speaker: 'caller', text: "I'm interested in whitening, can I book a consult? After 4pm works." }],
  },
  // --- Edge cases from the brief -------------------------------------------
  // Rang three times over the weekend and never got an appointment.
  {
    id: '0466',
    caller: 'Liam Foster',
    phone: '0421 556 093',
    callerId: '0421556093',
    receivedAt: last(6, 9, 12),
    durationSec: 74,
    intent: 'appointment',
    reason: 'Broken filling — wants an appointment',
    summary: 'Part of a filling came out on Friday night. Not painful but sharp on his tongue. Wants the first available appointment.',
    status: 'new',
    assignee: null,
    transcript: [{ speaker: 'caller', text: 'Part of my filling came out. Can I book the first appointment you have?' }],
  },
  {
    id: '0467',
    caller: 'Liam Foster',
    phone: '0421 556 093',
    callerId: '0421556093',
    receivedAt: last(6, 14, 40),
    durationSec: 51,
    intent: 'appointment',
    reason: 'Calling again about broken filling',
    summary: 'Second call today. Asked if anyone had got his earlier message. Still wants the first available appointment.',
    status: 'new',
    assignee: null,
    transcript: [{ speaker: 'caller', text: 'I called this morning about my filling, just checking someone got the message?' }],
  },
  {
    id: '0468',
    caller: 'Liam Foster',
    phone: '0421 556 093',
    callerId: '0421556093',
    receivedAt: last(0, 10, 5),
    durationSec: 63,
    intent: 'appointment',
    reason: 'Third call — still no appointment',
    summary: "Third call this weekend. Getting frustrated that nobody has called back. Wants an appointment early this week, any time.",
    status: 'new',
    assignee: null,
    transcript: [{ speaker: 'caller', text: "This is my third time calling. I just need an appointment, any time early this week is fine." }],
  },
  // Came in at 2:14am.
  {
    id: '0483',
    caller: 'Chloe Nguyen',
    phone: '0447 902 316',
    callerId: '0447902316',
    receivedAt: lastAt(2, 14),
    durationSec: 97,
    intent: 'appointment',
    reason: 'Crown came off',
    summary: 'Crown came off while eating a late snack. No pain, has the crown with her. Would like it re-cemented this week.',
    status: 'new',
    assignee: null,
    transcript: [
      { speaker: 'caller', text: "Sorry for calling so late, my crown just came off. It doesn't hurt, I've got the crown." },
      { speaker: 'jade', text: "No problem at all. I'll pass this to the team for first thing in the morning." },
    ],
  },
  // Gave a phone number one digit short, and withheld caller ID.
  {
    id: '0478',
    caller: 'Mia Thompson',
    phone: '0412 345 67',
    callerId: null,
    receivedAt: ago(48),
    durationSec: 118,
    intent: 'appointment',
    reason: 'Hygiene clean',
    summary: 'Wants a scale and clean in the next two weeks, any weekday after 3pm. Number given is only 9 digits and caller ID was withheld.',
    status: 'new',
    assignee: null,
    transcript: [
      { speaker: 'caller', text: "I'd like to book a clean, weekdays after three work best." },
      { speaker: 'jade', text: 'Sure. What number can we reach you on?' },
      { speaker: 'caller', text: 'Oh-four-one-two, three-four-five, six-seven.' },
    ],
  },
  // Also a digit short, but the phone system captured caller ID so we can recover.
  {
    id: '0471',
    caller: 'Josh Bennett',
    phone: '0438 21 907',
    callerId: '0438219077',
    receivedAt: ago(130),
    durationSec: 82,
    intent: 'appointment',
    reason: 'Sensitive tooth check',
    summary: 'Cold drinks make a lower tooth sensitive for a few weeks. Would like a check-up next week.',
    status: 'new',
    assignee: null,
    transcript: [{ speaker: 'caller', text: 'One of my teeth is sensitive to cold drinks, could I get it checked next week?' }],
  },
  // Said "I'll try somewhere else" and hung up.
  {
    id: '0465',
    caller: 'Rachel Ong',
    phone: '0402 881 437',
    callerId: '0402881437',
    receivedAt: ago(85),
    durationSec: 69,
    intent: 'appointment',
    reason: 'Wanted an appointment this week',
    summary: "Wanted a check-up this week. Jade offered next Thursday; she said she'd try somewhere else and hung up.",
    status: 'new',
    assignee: null,
    transcript: [
      { speaker: 'caller', text: 'Have you got anything this week?' },
      { speaker: 'jade', text: 'The earliest I can see is next Thursday at 10am.' },
      { speaker: 'caller', text: "That's too far away, I'll try somewhere else. Thanks anyway." },
    ],
  },
  // Asked for a service the clinic doesn't offer.
  {
    id: '0464',
    caller: 'Ben Carter',
    phone: '0415 330 928',
    callerId: '0415330928',
    receivedAt: ago(150),
    durationSec: 104,
    intent: 'question',
    reason: 'Asked about dental implants',
    summary: 'Missing a lower molar and asked about implants and cost. The clinic does not offer implants — needs a referral.',
    status: 'new',
    assignee: null,
    transcript: [{ speaker: 'caller', text: "I'm missing a back tooth, do you do implants? Roughly how much are they?" }],
  },
  // Incomplete data: hung up before saying anything, no recording.
  {
    id: '0463',
    caller: null,
    phone: null,
    callerId: '0296614420',
    receivedAt: ago(175),
    durationSec: 6,
    intent: 'unknown',
    reason: 'Hung up before speaking',
    summary: null,
    status: 'new',
    assignee: null,
    transcript: [],
  },
  {
    id: '0460',
    caller: 'Grace Park',
    phone: '0433 671 205',
    callerId: '0433671205',
    receivedAt: last(5, 16, 20),
    durationSec: 58,
    intent: 'question',
    reason: 'Asked about implants',
    summary: 'Asked whether the clinic does implants. Jade explained we refer out. No follow-up requested.',
    status: 'resolved',
    resolvedBy: 'jade',
    assignee: null,
    transcript: [{ speaker: 'caller', text: 'Do you do implants there?' }],
  },
]

export const appointments = [
  { id: 'a1', patient: 'Sarah Jenkins', start: laterToday(2), type: 'Filling — upper right', source: 'Jade', status: 'confirmed' },
  { id: 'a2', patient: 'Michael Torres', start: laterToday(3), type: 'Check-up & clean', source: 'Reception', status: 'cancelled', note: 'Cancelled via Jade this morning' },
  { id: 'a3', patient: 'Olivia Chen', start: laterToday(4), type: 'Emergency screening', source: 'Jade', status: 'pending' },
  { id: 'a4', patient: 'James Wilson', start: inDays(1, 9, 0), type: 'Root canal — stage 2', source: 'Reception', status: 'confirmed' },
  { id: 'a5', patient: 'Amelia Patel', start: inDays(1, 10, 30), type: 'New patient screening', source: 'Jade', status: 'cancelled', note: 'Cancelled by text reply' },
  { id: 'a6', patient: 'Noah Robinson', start: inDays(1, 13, 0), type: 'Crown fitting', source: 'Jade', status: 'confirmed' },
  { id: 'a7', patient: 'Ahmed Rahimi', start: inDays(2, 14, 30), type: 'Filling — lower left', source: 'Reception', status: 'reschedule' },
  { id: 'a8', patient: 'Isla Murphy', start: inDays(3, 11, 0), type: 'Orthodontic screening', source: 'Jade', status: 'confirmed' },
]

// Existing patients, used as a fallback when Jade mishears a phone number.
export const patients = [
  { name: 'Daniel Okafor', phone: '0455 209 334' },
  { name: 'Ahmed Rahimi', phone: '0408 316 775' },
  { name: 'Tom Hadley', phone: '0401 773 540' },
]

export const defaultSettings = {
  reminders: {
    auto: true,
    first: { enabled: true, hours: 24 },
    second: { enabled: true, hours: 3 },
  },
  messages: {
    first:
      'Hi [Patient Name], this is Harbourside Dental. Just a reminder that you have an appointment tomorrow at [Time]. If you need to reschedule, reply R or call us on [Clinic Phone].',
    second: 'Hi [Patient Name], see you today at [Time] at Harbourside Dental. Reply R if you can no longer make it and we\'ll find you a new time.',
  },
  rescheduling: {
    allowByReply: true,
    slotsToOffer: 3,
    minNoticeHours: 24,
    fillCancellations: true,
  },
  callbacks: {
    urgentWithinMin: 15,
    standardWithin: 'same_day',
    readBackNumber: true,
    useCallerId: true,
    followUpAtRisk: true,
  },
  notifications: {
    ownerPhone: '0400 000 000',
    sms: true,
    email: true,
    dailySummary: true,
    escalationRule: 'urgent_and_complaints',
    quietHours: true,
  },
}
