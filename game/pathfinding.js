// File: game/pathfinding.js

const terrainCosts = {
  grassland: 1,
  sand: 2,
  mud: 3,
  mountain: Infinity,
  water: Infinity
};

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(map, node) {
  const directions = [
    { dx: 1, dy: 0 },
    { dx: 1, dy: -1 },
    { dx: 0, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: 1 }
  ];
  const neighbors = [];
  for (let { dx, dy } of directions) {
    const x = node.x + dx;
    const y = node.y + dy;
    if (map[y]?.[x] && terrainCosts[map[y][x].type] !== Infinity) {
      neighbors.push(map[y][x]);
    }
  }
  return neighbors;
}

export function findPath(map, start, goal) {
  const openSet = [start];
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();
  gScore.set(start, 0);
  fScore.set(start, heuristic(start, goal));

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore.get(a) - fScore.get(b));
    const current = openSet.shift();
    if (current === goal) {
      const path = [];
      let temp = current;
      while (cameFrom.has(temp)) {
        path.unshift(temp);
        temp = cameFrom.get(temp);
      }
      return path;
    }

    for (const neighbor of getNeighbors(map, current)) {
      const tentativeG = gScore.get(current) + terrainCosts[neighbor.type];
      if (tentativeG < (gScore.get(neighbor) || Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + heuristic(neighbor, goal));
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return [];
}

export function calculatePath(startX, startY, targetX, targetY, map) {
  const start = map[startY]?.[startX];
  const goal = map[targetY]?.[targetX];
  if (!start || !goal) return null;
  return findPath(map, start, goal);
}

export function calculateMovementCost(path, map) {
  return path.reduce((total, tile) => {
    const terrain = tile.type || 'grassland';
    return total + (terrainCosts[terrain] ?? 1);
  }, 0);
}
