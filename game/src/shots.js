// shots.js — one job: deterministic staged frames for the four screenshots.
import { applyShot } from './game.js';

export function readShotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed') || '1');
  if (!shot) return null;
  return { shot, seed };
}

export function stageShot(game, shot) {
  applyShot(game, shot);
}

// The four shots the maker takes: cover, play, alarm, win.
export const SHOT_LIST = ['cover', 'play', 'alarm', 'win'];
