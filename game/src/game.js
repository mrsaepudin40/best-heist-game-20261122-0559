// game.js — one job: the game loop — states, detection, tools, levels, scoring.
import { CONFIG } from './config.js';
import { getLevel, levelCount } from './level.js';
import { createGuard, updateGuard, guardStateLabel } from './guard.js';
import { createCamera, updateCamera, cameraSees } from './camera.js';
import { createLoot, updateLoot, createCoins } from './loot.js';
import { createAlarm, addAlarm, updateAlarm, startGrace, alarmLabel } from './alarm.js';
import { createPlayer, movePlayer, playerInRect } from './player.js';
import { createInput, bindInput, bindClicks, consumeClick } from './input.js';
import { createAudio, ensureAudio, beep, soundPickup, soundSpotted, soundCaught, soundWin } from './audio.js';
import { createSmoke, updateSmokes, smokeCovers } from './smoke.js';
import { createLaser, updateLaser, laserCrossed } from './laser.js';
import { createTripwire, tripwireCrossed } from './tripwire.js';
import { canSeeWatcher, pointInWall, pointInSmoke } from './vision.js';
import { renderWorld } from './render.js';
import { drawHud, drawGraceBanner, drawCenterPanel } from './hud.js';

export function createGame(canvas) {
  const ctx = canvas.getContext('2d');
  const input = createInput();
  const audio = createAudio();
  const game = {
    canvas, ctx, input, audio,
    screen: 'title',
    levelIndex: 1,
    level: null,
    player: null,
    guards: [],
    cameras: [],
    lasers: [],
    tripwires: [],
    loot: null,
    coins: [],
    alarm: createAlarm(),
    smokes: [],
    lure: null,
    lureLeft: 0,
    score: 0,
    elapsed: 0,
    levelTime: 0,
    totalScore: 0,
    totalAlarms: 0,
    caughtMessage: '',
    levelResult: null,
    shotMode: null,
    lastTime: 0,
    prevX: 0,
    prevY: 0,
    coinCooldown: 0,
  };
  bindInput(input, (code) => onKey(game, code));
  bindClicks(canvas, input);
  loadLevel(game, 0);
  game.screen = 'title';
  return game;
}

function loadLevel(game, index) {
  const level = getLevel(index);
  // Deep-ish copy so retries reset tripwires/coins without touching the defs.
  game.level = JSON.parse(JSON.stringify(level));
  game.level.lamps = [
    { x: 320, y: 200 }, { x: 960, y: 200 }, { x: 640, y: 650 },
  ];
  game.levelIndex = index + 1;
  game.player = createPlayer(level.playerStart);
  game.guards = level.guards.map((g) => createGuard(g));
  game.cameras = level.cameras.map((c) => createCamera(c));
  game.lasers = level.lasers.map((l) => createLaser(l));
  game.tripwires = level.tripwires.map((t) => createTripwire(t));
  game.loot = createLoot(level.loot);
  game.coins = createCoins(level.coins);
  game.alarm = createAlarm();
  game.smokes = [];
  game.lure = null;
  game.levelTime = 0;
  game.elapsed = 0;
  game.score = 0;
  game.prevX = game.player.x;
  game.prevY = game.player.y;
}

function onKey(game, code) {
  ensureAudio(game.audio);
  if (code === 'KeyM') {
    game.audio.muted = !game.audio.muted;
    return;
  }
  if (game.screen === 'title') {
    if (code === 'Enter' || code === 'Space') startLevel(game, game.levelIndex - 1);
    return;
  }
  if (code === 'KeyP' || code === 'Escape') {
    if (game.screen === 'playing') game.screen = 'paused';
    else if (game.screen === 'paused') game.screen = 'playing';
    return;
  }
  if (game.screen === 'caught' && (code === 'KeyR' || code === 'Enter')) {
    loadLevel(game, game.levelIndex - 1);
    game.screen = 'playing';
    return;
  }
  if (game.screen === 'leveldone' && (code === 'Enter' || code === 'Space')) {
    nextLevel(game);
    return;
  }
  if (game.screen === 'complete' && (code === 'KeyR' || code === 'Enter')) {
    game.totalScore = 0;
    game.totalAlarms = 0;
    loadLevel(game, 0);
    game.screen = 'title';
    return;
  }
  if (game.screen !== 'playing') return;
  if (code === 'KeyR') {
    loadLevel(game, game.levelIndex - 1);
    return;
  }
  if (code === 'KeyE') grabLoot(game);
  if (code === 'KeyQ') useSmoke(game);
  if (code === 'KeyF') useEmp(game);
  if (code === 'KeyC') tossCoin(game);
}

function startLevel(game, index) {
  loadLevel(game, index);
  game.screen = 'playing';
  beep(game.audio, 660, 0.1, 'sine', 0.05);
}

function nextLevel(game) {
  if (game.levelIndex >= levelCount()) {
    game.screen = 'complete';
    soundWin(game.audio);
    return;
  }
  startLevel(game, game.levelIndex);
}

function grabLoot(game) {
  const p = game.player;
  const loot = game.loot;
  if (loot.taken) return;
  if (Math.hypot(p.x - loot.x, p.y - loot.y) < 46) {
    loot.taken = true;
    game.score += loot.value;
    game.totalScore += loot.value;
    soundPickup(game.audio);
  }
}

function useSmoke(game) {
  const p = game.player;
  if (p.smokeLeft <= 0) return;
  p.smokeLeft -= 1;
  game.smokes.push(createSmoke(p.x, p.y));
  beep(game.audio, 300, 0.2, 'sine', 0.05);
}

function useEmp(game) {
  const p = game.player;
  if (p.empLeft <= 0) return;
  let best = null;
  let bestDist = 320;
  for (const cam of game.cameras) {
    const d = Math.hypot(cam.x - p.x, cam.y - p.y);
    if (d < bestDist) { best = cam; bestDist = d; }
  }
  if (!best) return;
  p.empLeft -= 1;
  best.disabledLeft = CONFIG.empSeconds;
  addAlarm(game.alarm, CONFIG.empAlarmCost);
  beep(game.audio, 1200, 0.15, 'square', 0.05);
}

function tossCoin(game) {
  const p = game.player;
  if (p.coinsLeft <= 0) return;
  p.coinsLeft -= 1;
  const x = p.x + Math.cos(p.facing) * 90;
  const y = p.y + Math.sin(p.facing) * 90;
  game.lure = { x, y };
  game.lureLeft = 6;
  beep(game.audio, 1500, 0.08, 'sine', 0.05);
}

function rankFor(game) {
  if (game.totalAlarms === 0 && game.levelTime <= game.level.parSeconds) return 'GHOST';
  if (game.totalAlarms <= 1) return 'SHADOW';
  return 'SPOTTED';
}

function updatePlaying(game, dt) {
  game.levelTime += dt;
  game.elapsed = game.levelTime;
  const p = game.player;
  game.prevX = p.x;
  game.prevY = p.y;
  movePlayer(p, game.input, dt, game.level.walls, CONFIG.room);
  updateLoot(game.loot, dt);
  game.smokes = updateSmokes(game.smokes, dt);
  if (game.lure) {
    game.lureLeft -= dt;
    if (game.lureLeft <= 0) game.lure = null;
  }
  // Coins: walk over to pocket them.
  for (const coin of game.coins) {
    if (!coin.taken && Math.hypot(p.x - coin.x, p.y - coin.y) < 24) {
      coin.taken = true;
      game.score += coin.value;
      game.totalScore += coin.value;
      beep(game.audio, 990, 0.07, 'sine', 0.04);
    }
  }
  // Lasers and tripwires.
  for (const laser of game.lasers) {
    updateLaser(laser, dt);
    if (laserCrossed(laser, p.x, p.y)) {
      addAlarm(game.alarm, CONFIG.laserAlarmCost);
      game.totalAlarms += 1;
      // Push the thief back so one crossing cannot farm the alarm.
      p.x = game.prevX;
      p.y = game.prevY;
      soundSpotted(game.audio);
    }
  }
  for (const wire of game.tripwires) {
    if (tripwireCrossed(wire, game.prevX, game.prevY, p.x, p.y)) {
      addAlarm(game.alarm, CONFIG.tripwireAlarmCost);
      game.totalAlarms += 1;
      soundSpotted(game.audio);
    }
  }
  // Detection: guards and cameras.
  const hiddenBySmoke = smokeCovers(game.smokes, p.x, p.y);
  let anySees = false;
  let maxSuspicion = 0;
  for (const guard of game.guards) {
    const sees = !hiddenBySmoke && !pointInSmoke(guard.x, guard.y, game.smokes) &&
      canSeeWatcher(guard, p.x, p.y, game.level.walls, CONFIG.visionRange, CONFIG.visionHalfAngle);
    if (sees) {
      guard.suspicion = Math.min(100, guard.suspicion + CONFIG.suspicionFillPerSecond * dt);
      guard.lastSeen = { x: p.x, y: p.y };
      anySees = true;
    } else {
      guard.suspicion = Math.max(0, guard.suspicion - CONFIG.suspicionDecayPerSecond * dt);
    }
    guard.alerted = guard.suspicion >= 100;
    maxSuspicion = Math.max(maxSuspicion, guard.suspicion);
    updateGuard(guard, dt, game.alarm.value, guard.suspicion > 55 ? guard.lastSeen : null);
  }
  for (const cam of game.cameras) {
    updateCamera(cam, dt);
    if (!cameraSees(cam)) { cam.suspicion = 0; continue; }
    const sees = !hiddenBySmoke &&
      canSeeWatcher(cam, p.x, p.y, game.level.walls, CONFIG.cameraRange, CONFIG.cameraHalfAngle);
    if (sees) {
      cam.suspicion = Math.min(100, cam.suspicion + CONFIG.suspicionFillPerSecond * 0.8 * dt);
      anySees = true;
    } else {
      cam.suspicion = Math.max(0, cam.suspicion - CONFIG.suspicionDecayPerSecond * dt);
    }
    maxSuspicion = Math.max(maxSuspicion, cam.suspicion);
  }
  // Coin lure: nearest guard investigates.
  if (game.lure) {
    let best = null;
    let bestDist = CONFIG.coinLureRange;
    for (const guard of game.guards) {
      const d = Math.hypot(guard.x - game.lure.x, guard.y - game.lure.y);
      if (d < bestDist) { best = guard; bestDist = d; }
    }
    if (best && !best.investigating) {
      best.investigating = { x: game.lure.x, y: game.lure.y };
      best.investigateLeft = 2.2;
    }
  }
  // Fair caught moment: full suspicion opens a 3s grace window.
  if (maxSuspicion >= 100 && !game.alarm.inGrace) {
    startGrace(game.alarm);
    game.totalAlarms += 1;
    soundSpotted(game.audio);
  }
  updateAlarm(game.alarm, dt, !anySees);
  if (game.alarm.inGrace && !anySees) {
    // Broke line of sight: grace ends early, suspicion drops back.
    game.alarm.inGrace = false;
    for (const g of game.guards) g.suspicion = Math.min(g.suspicion, 60);
    for (const c of game.cameras) c.suspicion = Math.min(c.suspicion, 60);
  }
  if (game.alarm.inGrace && game.alarm.graceLeft <= 0) {
    game.screen = 'caught';
    game.caughtMessage = 'Caught in the open — the guards closed in. Press R to retry the room.';
    soundCaught(game.audio);
    return;
  }
  // Exit: only after the loot is taken.
  if (game.loot.taken && playerInRect(p, game.level.exit)) {
    game.levelResult = {
      time: game.levelTime,
      par: game.level.parSeconds,
      score: game.score,
      rank: rankFor(game),
    };
    if (game.levelIndex >= levelCount()) {
      game.screen = 'complete';
      soundWin(game.audio);
    } else {
      game.screen = 'leveldone';
      soundWin(game.audio);
    }
  }
}

function handleTitleClicks(game) {
  const click = consumeClick(game.input);
  if (!click) return;
  // Level-select buttons on the title screen.
  const buttons = levelButtons();
  for (let i = 0; i < buttons.length; i++) {
    const b = buttons[i];
    if (click.x >= b.x && click.x <= b.x + b.w && click.y >= b.y && click.y <= b.y + b.h) {
      startLevel(game, i);
      return;
    }
  }
}

export function levelButtons() {
  return [
    { x: 340, y: 560, w: 180, h: 54, label: '1 — GALLERY HALL' },
    { x: 550, y: 560, w: 180, h: 54, label: '2 — VAULT FLOOR' },
    { x: 760, y: 560, w: 180, h: 54, label: '3 — ROOFTOP' },
  ];
}

function drawTitle(ctx, game) {
  ctx.fillStyle = '#0b0f18';
  ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
  ctx.fillStyle = '#ffd650';
  ctx.font = 'bold 46px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(CONFIG.title, 640, 150);
  ctx.fillStyle = '#e8ecf5';
  ctx.font = '18px monospace';
  ctx.fillText('Mara Voss has one night to steal ' + CONFIG.target + ' from ' + CONFIG.venue + '.', 640, 195);
  ctx.fillText('Cross each room unseen. Read the cones. Time the cameras. Then run.', 640, 224);
  ctx.fillStyle = '#9db8e8';
  ctx.font = '15px monospace';
  const controls = [
    'WASD / Arrows — move      Shift — sneak (slower, harder to spot)',
    'E — grab the loot      Q — smoke bomb (1 per room)      F — EMP a camera (1 per room, +10 alarm)',
    'C — toss a coin to lure a guard      P — pause      M — mute      R — restart room',
    'Three routes per room: the main floor, the shadow corridor, the vent gap behind cover.',
  ];
  controls.forEach((line, i) => ctx.fillText(line, 640, 280 + i * 28));
  ctx.fillStyle = '#ffd650';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('CHOOSE A ROOM — click, or press Enter for Room 1', 640, 530);
  for (const b of levelButtons()) {
    ctx.fillStyle = '#1d2b45';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = '#ffd650';
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(b.label, b.x + b.w / 2, b.y + 33);
  }
  ctx.fillStyle = '#7d8aa5';
  ctx.font = '13px monospace';
  ctx.fillText('A complete heist: guards with vision cones, sweeping cameras, lasers, tripwires,', 640, 660);
  ctx.fillText('an alarm meter, tools at a cost — and a getaway that pays off the planning.', 640, 682);
}

function drawPaused(ctx) {
  drawCenterPanel(ctx, 'PAUSED', ['Take a breath. The guards keep their patrols.', 'The cones will be right where you left them.'], 'Press P to resume');
}

function drawCaught(ctx, game) {
  drawCenterPanel(ctx, 'CAUGHT!', [game.caughtMessage, 'Tip: wait for a cone to sweep past, then move in the shadow.'], 'Press R to retry the room');
}

function drawLevelDone(ctx, game) {
  const r = game.levelResult;
  drawCenterPanel(ctx, 'ROOM CLEARED — ' + game.level.name, [
    'Time ' + r.time.toFixed(1) + 's  (par ' + r.par + 's)    Loot $' + r.score,
    'Alarms raised this run: ' + game.totalAlarms,
    'Rank: ' + r.rank,
    game.levelIndex < levelCount() ? 'Next: ' + getLevel(game.levelIndex).name : 'Final room ahead.',
  ], 'Press Enter for the next room');
}

function drawComplete(ctx, game) {
  const rank = game.totalAlarms === 0 ? 'GHOST' : game.totalAlarms <= 2 ? 'SHADOW' : 'SPOTTED';
  drawCenterPanel(ctx, 'GETAWAY COMPLETE', [
    'Mara Voss slips into the night with ' + CONFIG.target + '.',
    'Total loot $' + game.totalScore + '    Alarms raised: ' + game.totalAlarms,
    'Final rank: ' + rank,
    'The Meridian Gallery never knew she was there.',
  ], 'Press R to play again');
}

export function render(game) {
  const ctx = game.ctx;
  ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
  if (game.screen === 'title') {
    drawTitle(ctx, game);
    return;
  }
  renderWorld(ctx, game);
  drawHud(ctx, game);
  drawGraceBanner(ctx, game);
  if (game.screen === 'paused') drawPaused(ctx);
  if (game.screen === 'caught') drawCaught(ctx, game);
  if (game.screen === 'leveldone') drawLevelDone(ctx, game);
  if (game.screen === 'complete') drawComplete(ctx, game);
}

export function step(game, now) {
  const dt = Math.min(0.05, (now - game.lastTime) / 1000 || 0.016);
  game.lastTime = now;
  if (game.screen === 'title') {
    handleTitleClicks(game);
    render(game);
    return;
  }
  if (game.screen === 'playing' && !game.shotMode) updatePlaying(game, dt);
  if (game.screen === 'playing' && game.shotMode) {
    // Frozen staged frame for screenshots: render only.
  }
  consumeClick(game.input);
  render(game);
}

export function startLoop(game) {
  game.lastTime = performance.now();
  const frame = (now) => {
    step(game, now);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// Staged states for screenshots — see shots.js.
export function applyShot(game, shot) {
  game.shotMode = shot;
  if (shot === 'cover' || shot === 'play') {
    startLevel(game, 0);
    game.screen = 'playing';
    game.player.x = 500;
    game.player.y = 620;
    game.player.sneaking = shot === 'cover';
    game.player.facing = Math.PI / 4;
    game.guards[0].x = 640;
    game.guards[0].y = 260;
    game.guards[0].angle = Math.PI / 2;
    game.guards[1].x = 980;
    game.guards[1].y = 620;
    game.guards[1].angle = Math.PI;
    game.cameras[0].angle = Math.PI / 2 + 0.4;
    game.alarm.value = shot === 'cover' ? 25 : 8;
    game.loot.glow = 1.2;
    if (shot === 'cover') game.guards[0].suspicion = 35;
  } else if (shot === 'alarm') {
    startLevel(game, 1);
    game.screen = 'playing';
    game.player.x = 640;
    game.player.y = 400;
    game.guards[0].x = 640;
    game.guards[0].y = 260;
    game.guards[0].angle = Math.PI / 2;
    game.guards[0].suspicion = 100;
    game.guards[0].alerted = true;
    game.guards[1].x = 300;
    game.guards[1].y = 680;
    game.alarm.value = 78;
    game.alarm.inGrace = true;
    game.alarm.graceLeft = 2.1;
    game.alarm.raised = 2;
    game.cameras[0].angle = Math.PI / 2 + 0.5;
    game.cameras[1].angle = Math.PI / 2 - 0.5;
  } else if (shot === 'win') {
    startLevel(game, 2);
    game.totalScore = 2900;
    game.totalAlarms = 0;
    game.loot.taken = true;
    game.score = 1500;
    game.levelTime = 88.4;
    game.elapsed = 88.4;
    game.levelResult = { time: 88.4, par: 100, score: 1500, rank: 'GHOST' };
    game.screen = 'complete';
  }
}

export { loadLevel, alarmLabel, guardStateLabel };
