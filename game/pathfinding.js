// File: game/pathfinding.js

import { isTileBlocked } from './terrain.js';

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

  for (const { dx, dy } of directions) {
    const x = node.x + dx;
    const y = node.y + dy;
    if (map[y] && map[y][x] && !isTileBlocked(x, y, map)) {
      neighbors.push(map[y][x]);
    }
  }

  return neighbors;
}

export function findPath(map, start, goal) {
  const openSet = [start];
  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(start, 0);

  const fScore = new Map();
  fScore.set(start, heuristic(start, goal));

  while (openSet.length > 0) {
    openSet.sort((a, b) => (fScore.get(a) || Infinity) - (fScore.get(b) || Infinity));
    const current = openSet.shift();
    if (current === goal) {
      const path = [];
      let temp = current;
      while (cameFrom.has(temp)) {
        path.push(temp);
        temp = cameFrom.get(temp);
      }
      path.push(start); // Add the start node
      return path.reverse();
    }

    const neighbors = getNeighbors(map, current);

    for (const neighbor of neighbors) {
      const tentativeG = (gScore.get(current) || Infinity) + (neighbor.movementCost || 1);
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
  if (!start || !goal) return [];

  return findPath(map, start, goal);
}

export function calculateMovementCost(path, map) {
  return path.reduce((total, tile) => {
    return total + (tile.movementCost || 1);
  }, 0);
}
