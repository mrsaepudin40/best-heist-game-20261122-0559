// render.js — one job: draw the room, the cones, the people and the loot.
import { CONFIG } from './config.js';

function drawCone(ctx, x, y, angle, range, halfAngle, color) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawGuard(ctx, guard) {
  drawCone(
    ctx, guard.x, guard.y, guard.angle, CONFIG.visionRange, CONFIG.visionHalfAngle,
    guard.alerted ? 'rgba(255,60,60,0.30)' : 'rgba(255,214,80,0.20)',
  );
  ctx.save();
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, 14, 0, Math.PI * 2);
  ctx.fillStyle = guard.alerted ? '#ff4444' : '#2e4a7a';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = guard.alerted ? '#ffcccc' : '#9db8e8';
  ctx.stroke();
  // Facing tick + torch dot.
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.lineTo(guard.x + Math.cos(guard.angle) * 20, guard.y + Math.sin(guard.angle) * 20);
  ctx.strokeStyle = '#ffd650';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GUARD', guard.x, guard.y - 20);
  ctx.restore();
}

function drawCamera(ctx, camera) {
  if (camera.disabledLeft > 0) {
    ctx.fillStyle = '#666';
  } else {
    drawCone(
      ctx, camera.x, camera.y, camera.angle, CONFIG.cameraRange, CONFIG.cameraHalfAngle,
      'rgba(120,200,255,0.30)',
    );
    ctx.fillStyle = '#7ec8ff';
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(camera.x, camera.y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0b1020';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(camera.label, camera.x, camera.y - 16);
  if (camera.disabledLeft > 0) {
    ctx.fillStyle = '#ffdd55';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('EMP OFF ' + Math.ceil(camera.disabledLeft) + 's', camera.x, camera.y + 24);
  }
  ctx.restore();
}

export function renderWorld(ctx, state) {
  const level = state.level;
  const room = CONFIG.room;
  // Floor.
  ctx.fillStyle = '#141a26';
  ctx.fillRect(room.x, room.y, room.w, room.h);
  ctx.strokeStyle = '#2a3348';
  ctx.lineWidth = 1;
  for (let x = room.x; x <= room.x + room.w; x += 62) {
    ctx.beginPath(); ctx.moveTo(x, room.y); ctx.lineTo(x, room.y + room.h); ctx.stroke();
  }
  for (let y = room.y; y <= room.y + room.h; y += 62) {
    ctx.beginPath(); ctx.moveTo(room.x, y); ctx.lineTo(room.x + room.w, y); ctx.stroke();
  }
  // Warm lamp pools.
  for (const lamp of level.lamps || []) {
    const g = ctx.createRadialGradient(lamp.x, lamp.y, 10, lamp.x, lamp.y, 150);
    g.addColorStop(0, 'rgba(255,196,90,0.20)');
    g.addColorStop(1, 'rgba(255,196,90,0)');
    ctx.fillStyle = g;
    ctx.fillRect(lamp.x - 150, lamp.y - 150, 300, 300);
  }
  // Shadow zones (safe, darker).
  for (const s of level.shadows) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.fillStyle = 'rgba(140,170,255,0.55)';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(s.label + ' — SAFE', s.x + 8, s.y + 18);
  }
  // Vents (alternate route).
  for (const v of level.vents) {
    ctx.fillStyle = '#3a2f1e';
    ctx.fillRect(v.x, v.y, v.w, v.h);
    ctx.strokeStyle = '#c9a86a';
    ctx.strokeRect(v.x, v.y, v.w, v.h);
    ctx.fillStyle = '#c9a86a';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(v.label, v.x + 38, v.y + 17);
  }
  // Walls / cover.
  for (const w of level.walls) {
    ctx.fillStyle = w.kind === 'crate' ? '#6b4f2a' : w.kind === 'case' ? '#274b63' : '#39415a';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = '#8a97b5';
    ctx.lineWidth = 1;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(w.kind.toUpperCase(), w.x + w.w / 2, w.y + w.h / 2 + 3);
  }
  // Tripwires.
  for (const wire of state.tripwires) {
    ctx.strokeStyle = wire.tripped ? '#555' : '#ff5555';
    ctx.lineWidth = wire.tripped ? 1 : 2;
    ctx.setLineDash(wire.tripped ? [] : [6, 4]);
    ctx.beginPath(); ctx.moveTo(wire.x1, wire.y1); ctx.lineTo(wire.x2, wire.y2); ctx.stroke();
    ctx.setLineDash([]);
    if (!wire.tripped) {
      ctx.fillStyle = '#ff8888';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('TRIPWIRE', wire.x1 + 6, wire.y1 - 6);
    }
  }
  // Lasers.
  for (const laser of state.lasers) {
    ctx.strokeStyle = laser.on ? '#ff2e63' : 'rgba(255,46,99,0.18)';
    ctx.lineWidth = laser.on ? 3 : 1;
    ctx.beginPath(); ctx.moveTo(laser.x1, laser.y1); ctx.lineTo(laser.x2, laser.y2); ctx.stroke();
    ctx.fillStyle = '#ff88aa';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(laser.on ? 'LASER — LIVE' : 'LASER — OFF', laser.x1 + 4, laser.y1 - 6);
  }
  // Exit.
  const exit = level.exit;
  ctx.fillStyle = state.loot.taken ? '#1f9d55' : '#274d33';
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.strokeStyle = state.loot.taken ? '#7dffb0' : '#5a7a66';
  ctx.lineWidth = 2;
  ctx.strokeRect(exit.x, exit.y, exit.w, exit.h);
  ctx.fillStyle = '#eafff0';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', exit.x + exit.w / 2, exit.y + exit.h / 2 - 8);
  ctx.font = 'bold 11px monospace';
  ctx.fillText(exit.label, exit.x + exit.w / 2, exit.y + exit.h / 2 + 8);
  ctx.font = '11px monospace';
  ctx.fillText(state.loot.taken ? 'OPEN — GO!' : 'LOCKED', exit.x + exit.w / 2, exit.y + exit.h / 2 + 26);
  // Coins.
  for (const coin of state.coins) {
    if (coin.taken) continue;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd650';
    ctx.fill();
    ctx.strokeStyle = '#8a6d00';
    ctx.stroke();
  }
  // Loot target — glowing gold.
  if (!state.loot.taken) {
    const pulse = 0.6 + 0.4 * Math.sin(state.loot.glow * 4);
    const g = ctx.createRadialGradient(state.loot.x, state.loot.y, 4, state.loot.x, state.loot.y, 60);
    g.addColorStop(0, `rgba(255,215,80,${0.55 * pulse})`);
    g.addColorStop(1, 'rgba(255,215,80,0)');
    ctx.fillStyle = g;
    ctx.fillRect(state.loot.x - 60, state.loot.y - 60, 120, 120);
    ctx.save();
    ctx.translate(state.loot.x, state.loot.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#ffd650';
    ctx.fillRect(-13, -13, 26, 26);
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 2;
    ctx.strokeRect(-13, -13, 26, 26);
    ctx.restore();
    ctx.fillStyle = '#ffe98a';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LOOT: ' + state.loot.label, state.loot.x, state.loot.y - 34);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.fillText('Press E to grab', state.loot.x, state.loot.y + 34);
  }
  // Smoke clouds.
  for (const s of state.smokes) {
    const g = ctx.createRadialGradient(s.x, s.y, 5, s.x, s.y, s.radius);
    g.addColorStop(0, 'rgba(200,200,210,0.55)');
    g.addColorStop(1, 'rgba(200,200,210,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dfe3ee';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SMOKE', s.x, s.y);
  }
  // Coin lure marker.
  if (state.lure) {
    ctx.beginPath();
    ctx.arc(state.lure.x, state.lure.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd650';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CLINK!', state.lure.x, state.lure.y - 12);
  }
  // Cameras (cones drawn under guards' cones is fine; draw now).
  for (const cam of state.cameras) drawCamera(ctx, cam);
  // Guards.
  for (const guard of state.guards) drawGuard(ctx, guard);
  // Player — Mara Voss, teal, crouched dot when sneaking.
  const p = state.player;
  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.sneaking ? 10 : p.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#19c2a6';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#dffff7';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + Math.cos(p.facing) * 18, p.y + Math.sin(p.facing) * 18);
  ctx.strokeStyle = '#dffff7';
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MARA', p.x, p.y - 20);
  if (p.sneaking) {
    ctx.fillStyle = '#9ff5e6';
    ctx.font = '10px monospace';
    ctx.fillText('SNEAKING', p.x, p.y + 26);
  }
  ctx.restore();
}
