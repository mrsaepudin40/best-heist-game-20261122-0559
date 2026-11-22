// patrol.js — one job: walk a guard along fixed waypoints, pausing to look around.
export function createPatrol(waypoints, pauseSeconds) {
  return {
    waypoints,
    index: 0,
    pauseSeconds: pauseSeconds || 1.6,
    pauseLeft: 0,
    lookAngle: 0,
    lookTimer: 0,
  };
}

// Advance the patrol; returns the unit movement vector for this frame.
export function stepPatrol(patrol, x, y, speed, dt) {
  const target = patrol.waypoints[patrol.index];
  const dx = target.x - x;
  const dy = target.y - y;
  const dist = Math.hypot(dx, dy);
  if (dist < 6) {
    if (patrol.pauseLeft <= 0) {
      patrol.pauseLeft = patrol.pauseSeconds;
      patrol.lookTimer = 0;
    }
    patrol.pauseLeft -= dt;
    patrol.lookTimer += dt;
    // Sweep the head left and right while paused at the waypoint.
    patrol.lookAngle = Math.sin(patrol.lookTimer * 1.4) * 0.9;
    if (patrol.pauseLeft <= 0) {
      patrol.index = (patrol.index + 1) % patrol.waypoints.length;
      patrol.lookAngle = 0;
    }
    return { mx: 0, my: 0, moving: false };
  }
  const step = Math.min(dist, speed * dt);
  return { mx: (dx / dist) * step, my: (dy / dist) * step, moving: true };
}

export function patrolFacing(patrol, x, y, fallbackAngle) {
  const target = patrol.waypoints[patrol.index];
  if (Math.hypot(target.x - x, target.y - y) < 6) {
    return fallbackAngle + patrol.lookAngle;
  }
  return Math.atan2(target.y - y, target.x - x);
}
