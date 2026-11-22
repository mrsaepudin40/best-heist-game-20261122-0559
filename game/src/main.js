// main.js — one job: boot the canvas, stage a screenshot, start the loop.
import { createGame, startLoop } from './game.js';
import { readShotFromUrl, stageShot } from './shots.js';

const canvas = document.getElementById('game');
const game = createGame(canvas);
window.__heistGame = game;

const staged = readShotFromUrl();
if (staged) {
  stageShot(game, staged.shot);
  // Render one frozen frame immediately so a headless screenshot is stable.
  game.lastTime = performance.now();
}

startLoop(game);
