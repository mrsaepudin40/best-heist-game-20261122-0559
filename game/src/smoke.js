// smoke.js — one job: smoke clouds that block vision.
import { CONFIG } from './config.js';

export function createSmoke(x, y) {
  return { x, y, radius: CONFIG.smokeRadius, left: CONFIG.smokeSeconds, total: CONFIG.smokeSeconds };
}

export function updateSmokes(smokes, dt) {
  for (const s of smokes) s.left -= dt;
  return smokes.filter((s) => s.left > 0);
}

export function smokeCovers(smokes, x, y) {
  for (const s of smokes) {
    if (s.left > 0 && Math.hypot(x - s.x, y - s.y) < s.radius) return true;
  }
  return false;
}
