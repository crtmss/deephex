import { getMovementCost, isTileBlocked } from './terrain.js';

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function findPath(map, start, goal) {
  if (!start || !goal) return [];

  const openSet = [{ x: start.x, y: start.y }];
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  const key = (n) => `${n.x},${n.y}`;

  gScore.set(key(start), 0);
  fScore.set(key(start), heuristic(start, goal));

  while (openSet.length > 0) {
    openSet.sort((a, b) => (fScore.get(key(a)) || Infinity) - (fScore.get(key(b)) || Infinity));
    const current = openSet.shift();
    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let temp = current;
      while (cameFrom.has(key(temp))) {
        path.push(temp);
        temp = cameFrom.get(key(temp));
      }
      path.push(start);
      return path.reverse();
    }

    for (const neighbor of getNeighbors(map, current)) {
      const tentativeGScore = (gScore.get(key(current)) || Infinity) + getMovementCost(map[neighbor.y][neighbor.x].terrain);
      if (tentativeGScore < (gScore.get(key(neighbor)) || Infinity)) {
        cameFrom.set(key(neighbor), current);
        gScore.set(key(neighbor), tentativeGScore);
        fScore.set(key(neighbor), tentativeGScore + heuristic(neighbor, goal));
        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return [];
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
    if (map[y] && map[y][x] && !isTileBlocked(x, y, map)) {
      neighbors.push({ x, y });
    }
  });
  return neighbors;
}

export function calculatePath(startX, startY, targetX, targetY, map) {
  if (!map[startY]?.[startX] || !map[targetY]?.[targetX]) return [];
  return findPath(map, { x: startX, y: startY }, { x: targetX, y: targetY });
}

export function calculateMovementCost(path, map) {
  return path.reduce((total, tile) => {
    const terrain = map[tile.y]?.[tile.x]?.terrain || 'grassland';
    return total + getMovementCost(terrain);
  }, 0);
}

