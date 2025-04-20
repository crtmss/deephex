// game/map.js

import { getState } from './game-state.js';
import { drawTerrain, drawUnit } from './draw.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const HEX_SIZE = 20;

// ✅ Exported map used in the game
export const map = generateMap(25, 25);

export function generateMap(width, height) {
  const map = [];

  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      let terrain = 'grass';

      const noise = Math.sin(x * 0.2) + Math.cos(y * 0.3);

      if (noise > 1.2) terrain = 'sand';
      else if (noise < -1.2) terrain = 'mud';
      else if (Math.random() < 0.07) terrain = 'mountain';

      row.push(terrain);
    }
    map.push(row);
  }

  return map;
}

export function render(state = getState()) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw terrain
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      drawTerrain(ctx, x, y, map[y][x], HEX_SIZE);
    }
  }

  // Draw units
  if (state.units) {
    for (const unit of state.units) {
      drawUnit(ctx, unit, HEX_SIZE);
    }
  }
}
