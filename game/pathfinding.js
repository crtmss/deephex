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
    { dx: 0, dy: 1 },
  ];
  const neighbors = [];
  directions.forEach(({ dx, dy }) => {
    const x = node.x + dx;
    const y = node.y + dy;
    if (map[y] && map[y][x] && terrainCosts[map[y][x].type] !== Infinity) {
      neighbors.push({ x, y });
    }
  });
  return neighbors;
}

export function findPath(map, start, goal) {
  const openSet = [{ x: start.x, y: start.y }];
  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(start.y * 100 + start.x, 0);
  const fScore = new Map();
  fScore.set(start.y * 100 + start.x, heuristic(start, goal));

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore.get(a.y * 100 + a.x) - fScore.get(b.y * 100 + b.x));
    const current = openSet.shift();
    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let temp = current;
      while (cameFrom.has(temp.y * 100 + temp.x)) {
        path.push(temp);
        temp = cameFrom.get(temp.y * 100 + temp.x);
      }
      path.push(start);
      return path.reverse();
    }

    getNeighbors(map, current).forEach((neighbor) => {
      const key = neighbor.y * 100 + neighbor.x;
      const tentativeGScore = gScore.get(current.y * 100 + current.x) + (terrainCosts[map[neighbor.y][neighbor.x].type] ?? 1);

      if (tentativeGScore < (gScore.get(key) || Infinity)) {
        cameFrom.set(key, current);
        gScore.set(key, tentativeGScore);
        fScore.set(key, tentativeGScore + heuristic(neighbor, goal));
        if (!openSet.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    });
  }

  return [];
}

export function calculatePath(startX, startY, targetX, targetY, map) {
  const startTile = { x: startX, y: startY };
  const goalTile = { x: targetX, y: targetY };
  return findPath(map, startTile, goalTile);
}

export function calculateMovementCost(path, map) {
  if (!path) return Infinity;
  return path.reduce((sum, step) => {
    const tile = map[step.y]?.[step.x];
    if (!tile) return sum + 1;
    return sum + (terrainCosts[tile.type] ?? 1);
  }, 0);
}



