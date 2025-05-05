// File: game/pathfinding.js

import { isDangerousTile } from './terrain.js';

function heuristic(a, b) {
  return Math.abs(a.q - b.q) + Math.abs(a.r - b.r);
}

function getNeighbors(map, node) {
  const directions = [
    { dq: 1, dr: 0 }, { dq: 1, dr: -1 }, { dq: 0, dr: -1 },
    { dq: -1, dr: 0 }, { dq: -1, dr: 1 }, { dq: 0, dr: 1 }
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
      const key = `${neighbor.q},${neighbor.r}`;
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
  const rawPath = findPath(map, start, goal);
  return rawPath?.map(tile => ({ x: tile.q, y: tile.r })) ?? [];
}
