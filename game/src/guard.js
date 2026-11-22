// guard.js — one job: a patrolling guard's state and suspicion.
import { createPatrol, stepPatrol, patrolFacing } from './patrol.js';
import { CONFIG } from './config.js';

export function createGuard(def) {
  return {
    x: def.x,
    y: def.y,
    angle: 0,
    speed: def.speed || CONFIG.guardBaseSpeed,
    patrol: createPatrol(def.waypoints, 1.6),
    suspicion: 0,
    alerted: false,
    investigating: null,
    investigateLeft: 0,
    lastSeen: null,
  };
}

export function updateGuard(guard, dt, alarm, investigatingTarget) {
  const speed = guard.alerted
    ? CONFIG.guardAlertSpeed * (1 + alarm / 300)
    : guard.speed * (1 + alarm / 250);
  if (guard.investigating) {
    const dx = guard.investigating.x - guard.x;
    const dy = guard.investigating.y - guard.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 8) {
      guard.investigateLeft -= dt;
      guard.angle += Math.sin(guard.investigateLeft * 2) * 0.02;
      if (guard.investigateLeft <= 0) guard.investigating = null;
    } else {
      const step = Math.min(dist, speed * dt);
      guard.x += (dx / dist) * step;
      guard.y += (dy / dist) * step;
      guard.angle = Math.atan2(dy, dx);
    }
    return;
  }
  if (investigatingTarget && guard.suspicion > 55) {
    guard.investigating = { x: investigatingTarget.x, y: investigatingTarget.y };
    guard.investigateLeft = 2.2;
    return;
  }
  const move = stepPatrol(guard.patrol, guard.x, guard.y, speed, dt);
  guard.x += move.mx;
  guard.y += move.my;
  if (move.moving) {
    guard.angle = Math.atan2(move.my, move.mx);
  } else {
    guard.angle = patrolFacing(guard.patrol, guard.x, guard.y, guard.angle);
  }
}

export function guardStateLabel(guard) {
  if (guard.alerted) return 'ALERTED';
  if (guard.investigating) return 'INVESTIGATING';
  if (guard.suspicion > 55) return 'SUSPICIOUS';
  return 'PATROLLING';
}
