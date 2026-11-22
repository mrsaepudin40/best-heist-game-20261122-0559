// alarm.js — one job: the alarm meter (0-100) and the fair caught moment.
import { CONFIG } from './config.js';

export function createAlarm() {
  return { value: 0, graceLeft: 0, inGrace: false, raised: 0 };
}

export function addAlarm(alarm, amount) {
  alarm.value = Math.min(100, alarm.value + amount);
  if (amount >= 20) alarm.raised += 1;
}

export function updateAlarm(alarm, dt, hidden) {
  if (!alarm.inGrace && hidden) {
    alarm.value = Math.max(0, alarm.value - CONFIG.alarmDecayPerSecond * dt);
  }
  if (alarm.inGrace) {
    alarm.graceLeft -= dt;
    if (alarm.graceLeft <= 0) alarm.inGrace = false;
  }
}

export function startGrace(alarm) {
  alarm.inGrace = true;
  alarm.graceLeft = CONFIG.graceSeconds;
  addAlarm(alarm, CONFIG.spotAlarmCost);
}

export function alarmLabel(alarm) {
  if (alarm.inGrace) return 'BREAK LINE OF SIGHT!';
  if (alarm.value >= 70) return 'ALARM HIGH';
  if (alarm.value >= 35) return 'ALARM RISING';
  return 'UNDETECTED';
}
