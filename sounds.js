// Sintesis de notas musicales con Web Audio API
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Note frequencies (equal temperament)
const NOTE_FREQUENCIES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
};

function playNote(frequency, color) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Main oscillator (triangle for warm melodic sound)
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, now);

  // Sub oscillator (sine, one octave below, quiet)
  const subOsc = ctx.createOscillator();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(frequency, now);

  // Gain envelope (ADSR-like)
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.02);  // attack
  gain.gain.linearRampToValueAtTime(0.2, now + 0.1);    // decay to sustain
  gain.gain.linearRampToValueAtTime(0.15, now + 0.25);  // sustain
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4); // release

  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0, now);
  subGain.gain.linearRampToValueAtTime(0.1, now + 0.02);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc.connect(gain);
  subOsc.connect(subGain);
  gain.connect(ctx.destination);
  subGain.connect(ctx.destination);

  osc.start(now);
  subOsc.start(now);
  osc.stop(now + 0.45);
  subOsc.stop(now + 0.4);
}

// Note definitions with colors from pink to purple gradient
const notes = [
  { name: 'C5',  frequency: NOTE_FREQUENCIES.C5, emoji: '\uD83C\uDFB5', color: '#9370db' },
  { name: 'B4',  frequency: NOTE_FREQUENCIES.B4, emoji: '\uD83C\uDFB6', color: '#a264d9' },
  { name: 'A4',  frequency: NOTE_FREQUENCIES.A4, emoji: '\uD83C\uDFB5', color: '#b158d6' },
  { name: 'G4',  frequency: NOTE_FREQUENCIES.G4, emoji: '\uD83C\uDFB6', color: '#c04cd3' },
  { name: 'F4',  frequency: NOTE_FREQUENCIES.F4, emoji: '\uD83C\uDFB5', color: '#d040c8' },
  { name: 'E4',  frequency: NOTE_FREQUENCIES.E4, emoji: '\uD83C\uDFB6', color: '#da45bf' },
  { name: 'D4',  frequency: NOTE_FREQUENCIES.D4, emoji: '\uD83C\uDFB5', color: '#e84fb3' },
  { name: 'C4',  frequency: NOTE_FREQUENCIES.C4, emoji: '\uD83C\uDFB6', color: '#ff69b4' },
];

// Add play function to each note
notes.forEach(note => {
  note.play = () => playNote(note.frequency, note.color);
});

export { notes, getAudioContext };
