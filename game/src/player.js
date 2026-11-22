// player.js — one job: Mara Voss — movement, sneak, tools, collision.
import { CONFIG } from './config.js';

export function createPlayer(start) {
  return {
    x: start.x,
    y: start.y,
    radius: CONFIG.playerRadius,
    sneaking: false,
    smokeLeft: 1,
    empLeft: 1,
    coinsLeft: 3,
    facing: -Math.PI / 2,
  };
}

function collideCircleWalls(p, walls, room) {
  const r = p.radius;
  p.x = Math.max(room.x + r, Math.min(room.x + room.w - r, p.x));
  p.y = Math.max(room.y + r, Math.min(room.y + room.h - r, p.y));
  for (const w of walls) {
    const cx = Math.max(w.x, Math.min(p.x, w.x + w.w));
    const cy = Math.max(w.y, Math.min(p.y, w.y + w.h));
    const dx = p.x - cx;
    const dy = p.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < r * r) {
      const d = Math.sqrt(d2) || 0.01;
      p.x = cx + (dx / d) * r;
      p.y = cy + (dy / d) * r;
    }
  }
}

export function movePlayer(player, input, dt, walls, room) {
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;
  player.sneaking = !!input.sneak;
  if (mx === 0 && my === 0) return;
  const len = Math.hypot(mx, my);
  const speed = player.sneaking ? CONFIG.playerSneakSpeed : CONFIG.playerWalkSpeed;
  player.x += (mx / len) * speed * dt;
  player.y += (my / len) * speed * dt;
  player.facing = Math.atan2(my, mx);
  collideCircleWalls(player, walls, room);
}

export function playerInRect(player, rect) {
  return (
    player.x >= rect.x &&
    player.x <= rect.x + rect.w &&
    player.y >= rect.y &&
    player.y <= rect.y + rect.h
  );
}
