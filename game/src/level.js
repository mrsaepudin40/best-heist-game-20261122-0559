// level.js — one job: the three rooms Mara Voss must cross.
import { CONFIG } from './config.js';

// Walls are cover. Shadow zones are darker floor where cones reach slower.
export const LEVELS = [
  {
    id: 1,
    name: 'Gallery Hall',
    parSeconds: 75,
    intro: 'Midnight. Cross the gallery, lift the Brass Ledger, reach the green door.',
    playerStart: { x: 90, y: 700 },
    exit: { x: 1150, y: 130, w: 110, h: 90, label: 'GREEN DOOR' },
    loot: { x: 640, y: 180, label: 'BRASS LEDGER', value: 500 },
    coins: [
      { x: 300, y: 620, taken: false },
      { x: 980, y: 620, taken: false },
      { x: 640, y: 420, taken: false },
    ],
    walls: [
      { x: 260, y: 300, w: 180, h: 34, kind: 'case' },
      { x: 840, y: 300, w: 180, h: 34, kind: 'case' },
      { x: 260, y: 560, w: 180, h: 34, kind: 'crate' },
      { x: 840, y: 560, w: 180, h: 34, kind: 'crate' },
      { x: 560, y: 430, w: 40, h: 120, kind: 'pillar' },
      { x: 680, y: 430, w: 40, h: 120, kind: 'pillar' },
    ],
    shadows: [
      { x: 40, y: 560, w: 200, h: 200, label: 'SHADOW' },
      { x: 1040, y: 560, w: 200, h: 200, label: 'SHADOW' },
      { x: 480, y: 120, w: 320, h: 120, label: 'SHADOW' },
    ],
    vents: [{ x: 90, y: 420, w: 120, h: 26, label: 'VENT' }],
    guards: [
      {
        x: 400, y: 200, speed: 62,
        waypoints: [{ x: 400, y: 200 }, { x: 880, y: 200 }, { x: 880, y: 380 }, { x: 400, y: 380 }],
      },
      {
        x: 900, y: 650, speed: 55,
        waypoints: [{ x: 900, y: 650 }, { x: 380, y: 650 }],
      },
    ],
    cameras: [
      { x: 640, y: 96, baseAngle: Math.PI / 2, sweep: 0.7, period: 5, label: 'CAM 1' },
    ],
    lasers: [],
    tripwires: [],
  },
  {
    id: 2,
    name: 'Vault Floor',
    parSeconds: 90,
    intro: 'Lasers and a tripwire guard the vault. Time the blinks, mind the red line.',
    playerStart: { x: 90, y: 700 },
    exit: { x: 1150, y: 130, w: 110, h: 90, label: 'VAULT DOOR' },
    loot: { x: 640, y: 170, label: 'VAULT LEDGER', value: 900 },
    coins: [
      { x: 220, y: 480, taken: false },
      { x: 1060, y: 480, taken: false },
      { x: 640, y: 560, taken: false },
    ],
    walls: [
      { x: 220, y: 260, w: 34, h: 180, kind: 'case' },
      { x: 1026, y: 260, w: 34, h: 180, kind: 'case' },
      { x: 420, y: 560, w: 180, h: 34, kind: 'crate' },
      { x: 680, y: 560, w: 180, h: 34, kind: 'crate' },
      { x: 620, y: 380, w: 40, h: 110, kind: 'pillar' },
    ],
    shadows: [
      { x: 40, y: 480, w: 160, h: 280, label: 'SHADOW' },
      { x: 1080, y: 480, w: 160, h: 280, label: 'SHADOW' },
      { x: 500, y: 620, w: 280, h: 140, label: 'SHADOW' },
    ],
    vents: [{ x: 90, y: 300, w: 120, h: 26, label: 'VENT' }],
    guards: [
      {
        x: 350, y: 200, speed: 66,
        waypoints: [{ x: 350, y: 200 }, { x: 930, y: 200 }, { x: 930, y: 420 }, { x: 350, y: 420 }],
      },
      {
        x: 640, y: 680, speed: 60,
        waypoints: [{ x: 640, y: 680 }, { x: 300, y: 680 }, { x: 980, y: 680 }, { x: 640, y: 680 }],
      },
      {
        x: 1100, y: 350, speed: 58,
        waypoints: [{ x: 1100, y: 350 }, { x: 1100, y: 620 }],
      },
    ],
    cameras: [
      { x: 300, y: 96, baseAngle: Math.PI / 2, sweep: 0.8, period: 4.5, label: 'CAM 1' },
      { x: 980, y: 96, baseAngle: Math.PI / 2, sweep: 0.8, period: 5.5, label: 'CAM 2' },
    ],
    lasers: [
      { x1: 420, y1: 330, x2: 860, y2: 330, period: 3.2, onFraction: 0.55, phase: 0 },
      { x1: 420, y1: 470, x2: 860, y2: 470, period: 3.2, onFraction: 0.55, phase: 1.6 },
    ],
    tripwires: [
      { x1: 300, y1: 600, x2: 980, y2: 600, tripped: false },
    ],
  },
  {
    id: 3,
    name: 'Rooftop Getaway',
    parSeconds: 100,
    intro: 'The ledger is in the rooftop safe. Grab it and sprint to the getaway van.',
    playerStart: { x: 90, y: 700 },
    exit: { x: 1140, y: 120, w: 120, h: 100, label: 'GETAWAY VAN' },
    loot: { x: 640, y: 200, label: 'ROOFTOP SAFE', value: 1500 },
    coins: [
      { x: 280, y: 640, taken: false },
      { x: 1000, y: 640, taken: false },
      { x: 640, y: 480, taken: false },
      { x: 340, y: 240, taken: false },
    ],
    walls: [
      { x: 300, y: 300, w: 160, h: 34, kind: 'crate' },
      { x: 820, y: 300, w: 160, h: 34, kind: 'crate' },
      { x: 300, y: 560, w: 160, h: 34, kind: 'crate' },
      { x: 820, y: 560, w: 160, h: 34, kind: 'crate' },
      { x: 560, y: 380, w: 40, h: 120, kind: 'pillar' },
      { x: 680, y: 380, w: 40, h: 120, kind: 'pillar' },
      { x: 560, y: 140, w: 160, h: 30, kind: 'case' },
    ],
    shadows: [
      { x: 40, y: 560, w: 200, h: 200, label: 'SHADOW' },
      { x: 1040, y: 560, w: 200, h: 200, label: 'SHADOW' },
      { x: 480, y: 620, w: 320, h: 140, label: 'SHADOW' },
    ],
    vents: [
      { x: 90, y: 420, w: 120, h: 26, label: 'VENT' },
      { x: 1070, y: 420, w: 120, h: 26, label: 'VENT' },
    ],
    guards: [
      {
        x: 400, y: 220, speed: 72,
        waypoints: [{ x: 400, y: 220 }, { x: 880, y: 220 }, { x: 880, y: 420 }, { x: 400, y: 420 }],
      },
      {
        x: 900, y: 660, speed: 68,
        waypoints: [{ x: 900, y: 660 }, { x: 380, y: 660 }],
      },
      {
        x: 640, y: 520, speed: 64,
        waypoints: [{ x: 640, y: 520 }, { x: 300, y: 520 }, { x: 980, y: 520 }, { x: 640, y: 520 }],
      },
    ],
    cameras: [
      { x: 640, y: 96, baseAngle: Math.PI / 2, sweep: 0.9, period: 4, label: 'CAM 1' },
      { x: 120, y: 400, baseAngle: 0, sweep: 0.7, period: 5, label: 'CAM 2' },
    ],
    lasers: [
      { x1: 460, y1: 320, x2: 820, y2: 320, period: 2.6, onFraction: 0.5, phase: 0 },
    ],
    tripwires: [
      { x1: 260, y1: 600, x2: 1020, y2: 600, tripped: false },
    ],
  },
];

export function getLevel(index) {
  return LEVELS[index % LEVELS.length];
}

export function levelCount() {
  return LEVELS.length;
}

export function roomBounds() {
  return CONFIG.room;
}
