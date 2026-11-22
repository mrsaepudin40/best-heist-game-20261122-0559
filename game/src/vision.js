// vision.js — one job: cones, line of sight, and "can this watcher see the thief".
export function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function pointInWall(px, py, walls) {
  for (const w of walls) {
    if (px >= w.x && px <= w.x + w.w && py >= w.y && py <= w.y + w.h) return true;
  }
  return false;
}

// Sampled line-of-sight test; walls block sight.
export function hasLineOfSight(x1, y1, x2, y2, walls) {
  const steps = 14;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (pointInWall(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, walls)) return false;
  }
  return true;
}

// True when the target is inside the cone and nothing blocks the view.
export function canSeeWatcher(watcher, tx, ty, walls, range, halfAngle) {
  const dx = tx - watcher.x;
  const dy = ty - watcher.y;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist < 14) return hasLineOfSight(watcher.x, watcher.y, tx, ty, walls);
  const angle = Math.atan2(dy, dx);
  if (Math.abs(angleDifference(angle, watcher.angle)) > halfAngle) return false;
  return hasLineOfSight(watcher.x, watcher.y, tx, ty, walls);
}

export function pointInSmoke(px, py, smokes) {
  for (const s of smokes) {
    if (s.left > 0 && Math.hypot(px - s.x, py - s.y) < s.radius) return true;
  }
  return false;
}
