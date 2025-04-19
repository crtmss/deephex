import { getState } from './game-state.js';
import { drawHex, drawUnit, drawTerrain } from './draw.js'; // imaginary helpers

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const HEX_SIZE = 20;

export function render(state = getState()) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw terrain
  for (let y = 0; y < 25; y++) {
    for (let x = 0; x < 25; x++) {
      const terrain = state.map?.[y]?.[x] || 'grass';
      drawTerrain(ctx, x, y, terrain, HEX_SIZE);
    }
  }

  // Draw units
  if (state.units) {
    for (const unit of state.units) {
      drawUnit(ctx, unit, HEX_SIZE);
    }
  }

  // Optional: draw selection, path, etc.
}
