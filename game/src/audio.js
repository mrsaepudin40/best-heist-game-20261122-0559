// audio.js — one job: tiny WebAudio bleeps (no audio files, no network).
export function createAudio() {
  return { ctx: null, muted: false };
}

export function ensureAudio(audio) {
  if (!audio.ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audio.ctx = new AC();
    } catch (e) {
      audio.ctx = null;
    }
  }
  if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
}

export function beep(audio, freq, seconds, type, gain) {
  if (audio.muted || !audio.ctx) return;
  try {
    const t = audio.ctx.currentTime;
    const osc = audio.ctx.createOscillator();
    const g = audio.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain || 0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    osc.connect(g);
    g.connect(audio.ctx.destination);
    osc.start(t);
    osc.stop(t + seconds);
  } catch (e) {
    // Sound is garnish; a silent game is still a game.
  }
}

export function soundPickup(audio) {
  beep(audio, 880, 0.12, 'sine', 0.07);
  setTimeout(() => beep(audio, 1320, 0.14, 'sine', 0.06), 70);
}

export function soundSpotted(audio) {
  beep(audio, 220, 0.25, 'square', 0.05);
  setTimeout(() => beep(audio, 180, 0.3, 'square', 0.05), 120);
}

export function soundCaught(audio) {
  beep(audio, 160, 0.5, 'sawtooth', 0.07);
}

export function soundWin(audio) {
  [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(audio, f, 0.18, 'sine', 0.07), i * 110));
}
