// File: game/pathfinding.js

const terrainCosts = {
  grassland: 1,
  mud: 3,
  sand: 2,
  mountain: Infinity,
  water: Infinity,
};

function heuristic(a, b) {
  return Math.abs(a.q - b.q) + Math.abs(a.r - b.r);
}

function getNeighbors(map, node) {
  const directions = [
    { dq: 1, dr: 0 },
    { dq: 1, dr: -1 },
    { dq: 0, dr: -1 },
    { dq: -1, dr: 0 },
    { dq: -1, dr: 1 },
    { dq: 0, dr: 1 },
  ];
  const neighbors = [];
  directions.forEach(({ dq, dr }) => {
    const q = node.q + dq;
    const r = node.r + dr;
    if (map[r] && map[r][q]) {
      neighbors.push(map[r][q]);
    }
  });
  return neighbors;
}

export function findPath(map, start, goal) {
  if (!start || !goal) return []; // ✅ Guard

  const openSet = [start];
  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(start, 0);
  const fScore = new Map();
  fScore.set(start, heuristic(start, goal));

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore.get(a) - fScore.get(b));
    const current = openSet.shift();
    if (current === goal) {
      const path = [];
      let temp = current;
      while (cameFrom.has(temp)) {
        path.push(temp);
        temp = cameFrom.get(temp);
      }
      path.push(start);
      return path.reverse();
    }

    getNeighbors(map, current).forEach((neighbor) => {
      const tentativeGScore = gScore.get(current) + (terrainCosts[neighbor.type] ?? 1);
      if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, tentativeGScore + heuristic(neighbor, goal));
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    });
  }

  return [];
}

export function calculatePath(startX, startY, targetX, targetY, map) {
  const start = map[startY]?.[startX];
  const goal = map[targetY]?.[targetX];
  if (!start || !goal) return []; // ✅ Return empty path if bad click

  return findPath(map, start, goal);
}

export function calculateMovementCost(path, map) {
  return path.reduce((total, tile) => {
    const terrain = tile.type || 'grassland';
    return total + (terrainCosts[terrain] ?? 1);
  }, 0);
}




