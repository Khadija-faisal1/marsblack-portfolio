let ctx = null;
let master, ambientBus, sfxBus, echoIn;
let enabled = false;
let seqTimer = null;
let nextNote = 0;

const SCALE = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25]; // A minor pentatonic

/* ---------- build the graph once ---------- */
function build() {
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();

  master = ctx.createGain();
  master.gain.value = 0.8;
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp);
  comp.connect(ctx.destination);

  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.9;
  sfxBus.connect(master);

  ambientBus = ctx.createGain();
  ambientBus.gain.value = 0;
  ambientBus.connect(master);

  // shared echo for the plucks
  echoIn = ctx.createGain();
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.42;
  const fb = ctx.createGain();
  fb.gain.value = 0.42;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1800;
  echoIn.connect(delay);
  delay.connect(lp);
  lp.connect(fb);
  fb.connect(delay);
  lp.connect(ambientBus);

  buildDrone();

  document.addEventListener("visibilitychange", () => {
    if (!ctx || !enabled) return;
    document.hidden ? ctx.suspend() : ctx.resume();
  });
}

function buildDrone() {
  // low evolving drone
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.16;
  const filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 380;
  filt.Q.value = 6;
  filt.connect(droneGain);
  droneGain.connect(ambientBus);

  [
    [55, "sawtooth", 0.35],
    [55.3, "sawtooth", 0.35],
    [82.41, "sine", 0.5],
    [110, "triangle", 0.5],
  ].forEach(([f, type, level]) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = level;
    o.connect(g);
    g.connect(filt);
    o.start();
  });

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 220;
  lfo.connect(lfoGain);
  lfoGain.connect(filt.frequency);
  lfo.start();

  // airy pad with slow tremolo
  const pad = ctx.createGain();
  pad.gain.value = 0.03;
  pad.connect(ambientBus);
  pad.connect(echoIn);
  [220, 329.63, 440, 442].forEach((f) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    o.connect(pad);
    o.start();
  });
  const trem = ctx.createOscillator();
  trem.frequency.value = 0.13;
  const tremGain = ctx.createGain();
  tremGain.gain.value = 0.02;
  trem.connect(tremGain);
  tremGain.connect(pad.gain);
  trem.start();
}

/* ---------- generative plucks ---------- */
function pluck(t) {
  const f = SCALE[Math.floor(Math.random() * SCALE.length)];
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.value = f;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.07, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
  o.connect(g);
  g.connect(ambientBus);
  g.connect(echoIn);
  o.start(t);
  o.stop(t + 1.2);
}

function schedule() {
  while (nextNote < ctx.currentTime + 0.4) {
    if (Math.random() < 0.55) pluck(nextNote);
    nextNote += 0.375;
  }
}

/* ---------- public API ---------- */
export function unlock() {
  if (!ctx) build();
  if (ctx.state === "suspended") ctx.resume();
}

export function setEnabled(on) {
  unlock();
  enabled = on;
  const t = ctx.currentTime;
  ambientBus.gain.cancelScheduledValues(t);
  ambientBus.gain.setTargetAtTime(on ? 0.55 : 0, t, on ? 0.6 : 0.25);
  clearInterval(seqTimer);
  seqTimer = null;
  if (on) {
    nextNote = ctx.currentTime + 0.1;
    seqTimer = setInterval(schedule, 120);
  }
}

/* ---------- sound effects ---------- */
const ok = () => ctx && enabled;

function tone({ type = "sine", f0, f1 = f0, dur = 0.08, vol = 0.05, at = 0 }) {
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(sfxBus);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise({ dur = 0.06, vol = 0.04, hp = 2000, at = 0 }) {
  const t = ctx.currentTime + at;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = ctx.createBufferSource();
  s.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = hp;
  const g = ctx.createGain();
  g.gain.value = vol;
  s.connect(f);
  f.connect(g);
  g.connect(sfxBus);
  s.start(t);
}

export const sfx = {
  hover() {
    if (!ok()) return;
    tone({ f0: 2400, f1: 1400, dur: 0.04, vol: 0.035 });
  },
  step() {
    if (!ok()) return;
    tone({ type: "square", f0: 180, f1: 90, dur: 0.06, vol: 0.04 });
    noise({ dur: 0.04, vol: 0.04, hp: 4000 });
  },
  click() {
    if (!ok()) return;
    tone({ type: "square", f0: 320, f1: 120, dur: 0.09, vol: 0.05 });
    noise({ dur: 0.05, vol: 0.05, hp: 3000 });
  },
  toggle(on) {
    if (!ok()) return;
    const [a, b] = on ? [600, 1000] : [1000, 480];
    tone({ type: "triangle", f0: a, dur: 0.07, vol: 0.06 });
    tone({ type: "triangle", f0: b, dur: 0.12, vol: 0.06, at: 0.07 });
  },
  enter() {
    if (!ok()) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(70, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 1);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(200, t);
    f.frequency.exponentialRampToValueAtTime(7000, t + 1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);
    o.connect(f);
    f.connect(g);
    g.connect(sfxBus);
    o.start(t);
    o.stop(t + 1.3);
    tone({ f0: 90, f1: 35, dur: 0.9, vol: 0.35, at: 0.95 });
    noise({ dur: 0.5, vol: 0.08, hp: 1500, at: 0.95 });
    [440, 659.25, 880].forEach((hz, i) =>
      tone({ type: "triangle", f0: hz, dur: 1.2, vol: 0.04, at: 1 + i * 0.07 }),
    );
  },
};
