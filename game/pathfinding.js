// File: game/pathfinding.js

import { getMovementCost, isTileBlocked } from './terrain.js';

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
    const nx = node.x + dx;
    const ny = node.y + dy;
    if (map[ny] && map[ny][nx] && !isTileBlocked(nx, ny, map)) {
      neighbors.push(map[ny][nx]);
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
    openSet.sort((a, b) => (fScore.get(a) || Infinity) - (fScore.get(b) || Infinity));
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

    for (const neighbor of getNeighbors(map, current)) {
      const tentative = (gScore.get(current) || Infinity) + getMovementCost(neighbor.terrain);
      if (tentative < (gScore.get(neighbor) || Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentative);
        fScore.set(neighbor, tentative + heuristic(neighbor, goal));
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return [];
}

export function calculatePath(sx, sy, tx, ty, map) {
  const start = map[sy]?.[sx];
  const goal = map[ty]?.[tx];
  if (!start || !goal) return [];
  return findPath(map, start, goal);
}

export function calculateMovementCost(path, map) {
  return path.reduce((acc, tile) => acc + getMovementCost(tile.terrain), 0);
}
