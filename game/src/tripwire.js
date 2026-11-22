// tripwire.js — one job: tripwires that raise the alarm once when crossed.
import { CONFIG } from './config.js';

export function createTripwire(def) {
  return { x1: def.x1, y1: def.y1, x2: def.x2, y2: def.y2, tripped: false };
}

// True on the frame the player steps over the wire.
export function tripwireCrossed(wire, prevX, prevY, px, py) {
  if (wire.tripped) return false;
  const crossed = (prevY - wire.y1) * (py - wire.y1) <= 0 &&
    px >= Math.min(wire.x1, wire.x2) && px <= Math.max(wire.x1, wire.x2) &&
    Math.abs(py - wire.y1) < 16;
  if (crossed) wire.tripped = true;
  return crossed;
}

export function tripwireAlarmCost() {
  return CONFIG.tripwireAlarmCost;
}
