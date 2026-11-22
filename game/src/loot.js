// loot.js — one job: the loot target and the coins scattered per room.
export function createLoot(def) {
  return {
    x: def.x,
    y: def.y,
    label: def.label,
    value: def.value,
    taken: false,
    glow: 0,
  };
}

export function updateLoot(loot, dt) {
  loot.glow += dt;
}

export function lootTakenValue(loot) {
  return loot.taken ? loot.value : 0;
}

export function createCoins(defs) {
  return defs.map((d) => ({ x: d.x, y: d.y, taken: false, value: 25 }));
}

export function coinsCollectedValue(coins) {
  return coins.filter((c) => c.taken).length * 25;
}
