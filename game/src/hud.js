// hud.js — one job: the top bar — alarm meter, loot, tools, timer, objective.
import { CONFIG } from './config.js';
import { alarmLabel } from './alarm.js';

export function drawHud(ctx, state) {
  ctx.fillStyle = '#0b0f18';
  ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.hudHeight);
  ctx.strokeStyle = '#2a3348';
  ctx.beginPath();
  ctx.moveTo(0, CONFIG.hudHeight);
  ctx.lineTo(CONFIG.canvasWidth, CONFIG.hudHeight);
  ctx.stroke();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd650';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(CONFIG.title, 16, 28);
  ctx.fillStyle = '#9db8e8';
  ctx.font = '13px monospace';
  ctx.fillText('Level ' + state.levelIndex + ' — ' + state.level.name, 16, 50);

  // Alarm meter.
  const ax = 470;
  const ay = 16;
  const aw = 220;
  ctx.fillStyle = '#222';
  ctx.fillRect(ax, ay, aw, 18);
  const alarmColor = state.alarm.value >= 70 ? '#ff4444' : state.alarm.value >= 35 ? '#ffaa33' : '#ffd650';
  ctx.fillStyle = alarmColor;
  ctx.fillRect(ax, ay, aw * (state.alarm.value / 100), 18);
  ctx.strokeStyle = '#8a97b5';
  ctx.strokeRect(ax, ay, aw, 18);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('ALARM ' + Math.round(state.alarm.value) + '%', ax + 4, ay + 34);
  ctx.fillStyle = alarmColor;
  ctx.font = 'bold 12px monospace';
  ctx.fillText(alarmLabel(state.alarm), ax, ay + 50);

  // Loot + tools.
  const lx = 730;
  ctx.fillStyle = '#ffe98a';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('LOOT $' + state.score, lx, 28);
  ctx.fillStyle = '#c9d6f2';
  ctx.font = '12px monospace';
  ctx.fillText('Smoke Q x' + state.player.smokeLeft + '   EMP F x' + state.player.empLeft + '   Coin C x' + state.player.coinsLeft, lx, 48);

  // Timer + detection.
  const tx = 1010;
  const elapsed = Math.floor(state.elapsed);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('TIME ' + mm + ':' + ss + '  /  PAR ' + state.level.parSeconds + 's', tx, 28);
  const worst = Math.max(0, ...state.guards.map((g) => g.suspicion), ...state.cameras.map((c) => c.suspicion));
  ctx.fillStyle = worst > 70 ? '#ff6666' : worst > 30 ? '#ffcc66' : '#7dffb0';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(worst > 70 ? 'SPOTTED!' : worst > 30 ? 'SUSPICION ' + Math.round(worst) + '%' : 'HIDDEN', tx, 50);

  // Objective line under the bar.
  ctx.fillStyle = '#e8ecf5';
  ctx.font = '13px monospace';
  ctx.fillText(
    'OBJECTIVE: Steal ' + state.loot.label + ', then reach the exit.  WASD move · Shift sneak · E grab · Q smoke · F EMP · C coin · P pause',
    16, 78,
  );
}

export function drawGraceBanner(ctx, state) {
  if (!state.alarm.inGrace) return;
  ctx.save();
  ctx.fillStyle = 'rgba(255,40,40,0.85)';
  ctx.fillRect(390, 300, 500, 64);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BREAK LINE OF SIGHT!', 640, 328);
  ctx.font = 'bold 20px monospace';
  ctx.fillText('Caught in ' + state.alarm.graceLeft.toFixed(1) + 's — hide behind cover!', 640, 354);
  ctx.restore();
}

export function drawCenterPanel(ctx, title, lines, hint) {
  ctx.save();
  ctx.fillStyle = 'rgba(5,8,16,0.88)';
  ctx.fillRect(290, 170, 700, 420);
  ctx.strokeStyle = '#ffd650';
  ctx.lineWidth = 2;
  ctx.strokeRect(290, 170, 700, 420);
  ctx.fillStyle = '#ffd650';
  ctx.font = 'bold 30px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(title, 640, 225);
  ctx.fillStyle = '#e8ecf5';
  ctx.font = '16px monospace';
  lines.forEach((line, i) => ctx.fillText(line, 640, 270 + i * 30));
  ctx.fillStyle = '#9db8e8';
  ctx.font = '14px monospace';
  ctx.fillText(hint, 640, 270 + lines.length * 30 + 24);
  ctx.restore();
}
