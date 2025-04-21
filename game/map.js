// game/map.js

import { noise } from './noise.js'; // Simplex or Perlin noise generator

export const map = generateMap(25, 25, 'shared-seed-123');

// Tile movement costs and colors
export const terrainTypes = {
  grassland: { movementCost: 1, color: '#4CAF50' },
  sand: { movementCost: 2, color: '#FFF59D' },
  mud: { movementCost: 3, color: '#795548' },
  mountain: { movementCost: Infinity, color: '#9E9E9E', impassable: true }
};

// === Helper: seeded random number generator ===
function seededRandom(seed) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return function () {
    h += h << 13; h ^= h >>> 7;
    h += h << 3; h ^= h >>> 17;
    h += h << 5;
    return (h >>> 0) / 4294967296;
  };
}

// === Map Generation ===
function generateMap(rows, cols, seed) {
  const rand = seededRandom(seed);
  const map = [];

  // Keep track of biome sizes to cap non-grassland regions
  let sandCount = 0;
  let mudCount = 0;
  let maxPerBiome = 30;

  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      const n = rand();

      let type = 'grassland'; // default

      if (n > 0.98) {
        type = 'mountain';
      } else if (n > 0.92 && sandCount < maxPerBiome) {
        type = 'sand';
        sandCount++;
      } else if (n > 0.85 && mudCount < maxPerBiome) {
        type = 'mud';
        mudCount++;
      }

      row.push({
        q: x,
        r: y,
        type,
        movementCost: terrainTypes[type].movementCost,
        impassable: terrainTypes[type].impassable || false,
      });
    }
    map.push(row);
  }

  return map;
}
