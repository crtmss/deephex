// game/map.js

export const terrainTypes = {
  grassland: { movementCost: 1, color: '#34a853' },
  sand: { movementCost: 2, color: '#FFF59D' },
  mud: { movementCost: 3, color: '#795548' },
  mountain: { movementCost: Infinity, color: '#9E9E9E', impassable: true },
  water: { movementCost: Infinity, color: '#4da6ff', impassable: true }
};

function seededRandom(seed) {
  if (!seed || typeof seed !== 'string') seed = 'defaultseed';
  let x = 0;
  for (let i = 0; i < seed.length; i++) x += seed.charCodeAt(i);
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

export function generateMap(rows = 25, cols = 25, seed = 'defaultseed') {
  const rand = seededRandom(seed);
  const map = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, q) => ({
      q,
      r,
      type: 'grassland',
      movementCost: terrainTypes.grassland.movementCost,
      impassable: false
    }))
  );

  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      if (r < 2 || r >= rows - 2 || q < 2 || q >= cols - 2) {
        map[r][q].type = 'water';
        map[r][q].movementCost = terrainTypes.water.movementCost;
        map[r][q].impassable = true;
      }
    }
  }

  function neighbors(q, r) {
    const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
    return dirs
      .map(([dq, dr]) => [q + dq, r + dr])
      .filter(([x, y]) => map[y] && map[y][x]);
  }

  function placeBiome(type, size) {
    let placed = 0;
    let attempts = 0;

    while (placed < size && attempts < 500) {
      const q = Math.floor(rand() * cols);
      const r = Math.floor(rand() * rows);

      const distFromP1 = Math.sqrt((q - 2) ** 2 + (r - 2) ** 2);
      const distFromP2 = Math.sqrt((q - 22) ** 2 + (r - 22) ** 2);
      if ((type === 'mountain') && (distFromP1 <= 3 || distFromP2 <= 3)) {
        attempts++;
        continue;
      }

      const tile = map[r][q];
      if (tile.type !== 'grassland') {
        attempts++;
        continue;
      }

      const queue = [[q, r]];
      let count = 0;

      while (queue.length && placed < size) {
        const [x, y] = queue.shift();
        const t = map[y][x];
        if (t.type === 'grassland') {
          t.type = type;
          t.movementCost = terrainTypes[type].movementCost;
          t.impassable = terrainTypes[type].impassable || false;
          placed++;
          count++;
        }

        if (count < 15) {
          neighbors(x, y).forEach(([nx, ny]) => {
            const nTile = map[ny][nx];
            if (nTile.type === 'grassland') queue.push([nx, ny]);
          });
        }
      }
    }
  }

  placeBiome('mud', 30);
  placeBiome('sand', 30);
  placeBiome('mountain', 25);

  return map;
}



