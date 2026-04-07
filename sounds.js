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

// --- Drum synthesis (same as Anto Drum Box) ---

function playKick() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(160, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

function playSnare() {
  const ctx = getAudioContext();
  const duration = 0.15;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1000;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.8, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + duration);
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  oscGain.gain.setValueAtTime(0.5, ctx.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
}

function playHihat() {
  const ctx = getAudioContext();
  const duration = 0.08;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + duration);
}

function playClap() {
  const ctx = getAudioContext();
  const duration = 0.15;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  filter.Q.value = 2;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.setValueAtTime(0.8, ctx.currentTime + 0.005);
  gain.gain.setValueAtTime(0.2, ctx.currentTime + 0.01);
  gain.gain.setValueAtTime(0.7, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + duration);
}

const drums = [
  { name: 'Kick',   play: playKick,  emoji: '🥁', color: '#ff8c69', isDrum: true },
  { name: 'Snare',  play: playSnare, emoji: '🪇', color: '#ffa07a', isDrum: true },
  { name: 'Hi-hat', play: playHihat, emoji: '🔔', color: '#f0a0c0', isDrum: true },
  { name: 'Clap',   play: playClap,  emoji: '👏', color: '#e8a0d0', isDrum: true },
];

export { notes, drums, getAudioContext };
