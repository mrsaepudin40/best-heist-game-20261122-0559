// camera.js — one job: sweeping security cameras.
import { CONFIG } from './config.js';

export function createCamera(def) {
  return {
    x: def.x,
    y: def.y,
    baseAngle: def.baseAngle,
    sweep: def.sweep,
    period: def.period,
    label: def.label,
    angle: def.baseAngle,
    suspicion: 0,
    disabledLeft: 0,
    time: Math.random() * 2,
  };
}

export function updateCamera(camera, dt) {
  camera.time += dt;
  if (camera.disabledLeft > 0) {
    camera.disabledLeft -= dt;
    return;
  }
  const phase = (camera.time % camera.period) / camera.period;
  camera.angle = camera.baseAngle + Math.sin(phase * Math.PI * 2) * camera.sweep;
}

export function cameraSees(camera) {
  return camera.disabledLeft <= 0;
}

export function cameraRange() {
  return CONFIG.cameraRange;
}
