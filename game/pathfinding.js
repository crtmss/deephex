// File: game/pathfinding.js

import { isDangerousTile } from './terrain.js';

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(map, node) {
  const directions = [
    { dx: 1, dy: 0 }, { dx: 1, dy: -1 }, { dx: 0, dy: -1 },
    { dx: -1, dy: 0 }, { dx: -1, dy: 1 }, { dx: 0, dy: 1 }
  ];
  const neighbors = [];
  directions.forEach(({ dx, dy }) => {
    const x = node.x + dx;
    const y = node.y + dy;
    if (map[y] && map[y][x]) {
      neighbors.push(map[y][x]);
    }
  });
  return neighbors;
}

export function findPath(map, start, goal) {
  if (!start || !goal) return null;
  const openSet = [start];
  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(start, 0);
  const fScore = new Map();
  fScore.set(start, heuristic(start, goal));
  const visited = new Set();

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
      return path.reverse();
    }

    getNeighbors(map, current).forEach((neighbor) => {
      const key = `${neighbor.x},${neighbor.y}`;
      if (visited.has(key) || isDangerousTile(neighbor)) return;
      visited.add(key);

      const tentativeG = gScore.get(current) + (neighbor.movementCost || 1);
      if (tentativeG < (gScore.get(neighbor) || Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + heuristic(neighbor, goal));
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
  return findPath(map, start, goal);
}

export function calculateMovementCost(path, map) {
  return path.reduce((total, tile) => {
    const terrain = map[tile.y]?.[tile.x]?.terrain || 'grassland';
    return total + (terrainMovementCosts[terrain] ?? 1);
  }, 0);
}

