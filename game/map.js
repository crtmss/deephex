// game/map.js

import { getState } from './game-state.js';
import { drawTerrain, drawUnit } from './draw.js';
import { sfc32, cyrb128 } from './prng.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const HEX_SIZE = 20;

// ✅ Exported map used in the game
export function generateMap(width, height, seed) {
  const seedArray = cyrb128(seed);
  const rand = sfc32(...seedArray);

  const map = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push({ x, y, terrain: 'grass' });
    }
    map.push(row);
  }

  const biomes = ['mud', 'sand', 'mountain'];
  biomes.forEach((biome) => {
    let count = 0;
    const maxTiles = biome === 'mountain' ? 15 : 30;
    while (count < maxTiles) {
      const x = Math.floor(rand() * width);
      const y = Math.floor(rand() * height);
      if (map[y][x].terrain === 'grass') {
        map[y][x].terrain = biome;
        count++;
      }
    }
  });

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
