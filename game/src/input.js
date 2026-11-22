// input.js — one job: keyboard state and mouse clicks.
export function createInput() {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    sneak: false,
    keys: new Set(),
    clickX: -1,
    clickY: -1,
    clicked: false,
  };
}

const KEYMAP = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'sneak',
  ShiftRight: 'sneak',
};

export function bindInput(input, onKey) {
  window.addEventListener('keydown', (e) => {
    if (KEYMAP[e.code] !== undefined) {
      input[KEYMAP[e.code]] = true;
      e.preventDefault();
    }
    if (!input.keys.has(e.code)) onKey(e.code);
    input.keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => {
    if (KEYMAP[e.code] !== undefined) input[KEYMAP[e.code]] = false;
    input.keys.delete(e.code);
  });
  window.addEventListener('blur', () => {
    input.up = input.down = input.left = input.right = input.sneak = false;
    input.keys.clear();
  });
}

export function bindClicks(canvas, input) {
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    input.clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    input.clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;
    input.clicked = true;
  });
}

export function consumeClick(input) {
  if (!input.clicked) return null;
  input.clicked = false;
  return { x: input.clickX, y: input.clickY };
}
