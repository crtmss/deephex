// game/map.js

export const terrainTypes = {
  grassland: { movementCost: 1, color: '#4CAF50' },
  sand: { movementCost: 2, color: '#FFF59D' },
  mud: { movementCost: 3, color: '#795548' },
  mountain: { movementCost: Infinity, color: '#9E9E9E', impassable: true }
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

  function neighbors(q, r) {
    const dirs = [
      [1, 0], [0, 1], [-1, 0], [0, -1],
      [1, -1], [-1, 1]
    ];
    return dirs
      .map(([dq, dr]) => [q + dq, r + dr])
      .filter(([x, y]) => map[y] && map[y][x]);
  }

  function placeBiome(type, size) {
    let tries = 0;
    while (tries < 100) {
      const q = Math.floor(rand() * cols);
      const r = Math.floor(rand() * rows);
      const tile = map[r][q];
      if (tile.type !== 'grassland') {
        tries++;
        continue;
      }

      const queue = [[q, r]];
      let placed = 0;

      while (queue.length && placed < size) {
        const [x, y] = queue.shift();
        const t = map[y][x];
        if (t.type !== 'grassland') continue;

        t.type = type;
        t.movementCost = terrainTypes[type].movementCost;
        t.impassable = terrainTypes[type].impassable || false;
        placed++;

        neighbors(x, y).forEach(([nx, ny]) => {
          if (Math.random() < 0.6) queue.push([nx, ny]);
        });
      }
      break;
    }
  }

  function placeMountainChain(length) {
    let tries = 0;
    while (tries < 100) {
      let q = Math.floor(rand() * cols);
      let r = Math.floor(rand() * rows);
      const directions = [[1, 0], [0, 1], [1, -1], [-1, 1]];
      const [dq, dr] = directions[Math.floor(rand() * directions.length)];

      let placed = 0;
      while (placed < length) {
        if (!map[r] || !map[r][q] || map[r][q].type !== 'grassland') break;
        map[r][q].type = 'mountain';
        map[r][q].movementCost = Infinity;
        map[r][q].impassable = true;
        q += dq;
        r += dr;
        placed++;
      }
      break;
    }
  }

  // === Biomes ===
  for (let i = 0; i < 3; i++) placeBiome('mud', Math.floor(9 + rand() * 6));
  for (let i = 0; i < 3; i++) placeBiome('sand', Math.floor(9 + rand() * 6));
  for (let i = 0; i < 4; i++) placeMountainChain(Math.floor(5 + rand() * 4));

  return map;
}
