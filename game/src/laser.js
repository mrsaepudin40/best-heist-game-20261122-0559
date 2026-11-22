// laser.js — one job: blinking laser beams that spike the alarm when crossed.
import { CONFIG } from './config.js';

export function createLaser(def) {
  return {
    x1: def.x1, y1: def.y1, x2: def.x2, y2: def.y2,
    period: def.period, onFraction: def.onFraction, phase: def.phase || 0,
    time: def.phase || 0,
    on: true,
  };
}

export function updateLaser(laser, dt) {
  laser.time += dt;
  const phase = (laser.time % laser.period) / laser.period;
  laser.on = phase < laser.onFraction;
}

// Distance from a point to the laser segment.
export function laserCrossed(laser, px, py) {
  if (!laser.on) return false;
  const dx = laser.x2 - laser.x1;
  const dy = laser.y2 - laser.y1;
  const len2 = dx * dx + dy * dy;
  let t = ((px - laser.x1) * dx + (py - laser.y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = laser.x1 + t * dx;
  const cy = laser.y1 + t * dy;
  return Math.hypot(px - cx, py - cy) < 14;
}

export function laserAlarmCost() {
  return CONFIG.laserAlarmCost;
}
