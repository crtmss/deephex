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
    const x = node.x;
    const y = node.y;
    const nx = x + dx;
    const ny = y + dy;
    if (map[ny] && map[ny][nx]) {
      const neighbor = map[ny][nx];
      // Add coordinates explicitly so downstream logic works
      neighbors.push({ ...neighbor, x: nx, y: ny });
    }
  });
  return neighbors;
}

export function findPath(map, start, goal) {
  if (!start || !goal) return [];

  const openSet = [{ ...start, x: start.q, y: start.r }];
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();
  const visited = new Set();

  const key = (tile) => `${tile.x},${tile.y}`;

  gScore.set(key(start), 0);
  fScore.set(key(start), heuristic(start, goal));

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore.get(key(a)) - fScore.get(key(b)));
    const current = openSet.shift();
    if (current.x === goal.q && current.y === goal.r) {
      const path = [];
      let temp = key(current);
      const allTiles = {};
      allTiles[temp] = current;

      while (cameFrom.has(temp)) {
        const tile = cameFrom.get(temp);
        path.unshift({ x: tile.x, y: tile.y });
        temp = key(tile);
      }
      path.push({ x: current.x, y: current.y });
      return path;
    }

    getNeighbors(map, current).forEach((neighbor) => {
      const neighborKey = key(neighbor);
      if (visited.has(neighborKey) || isDangerousTile(neighbor)) return;

      visited.add(neighborKey);

      const tentativeG = gScore.get(key(current)) + (neighbor.movementCost || 1);
      if (tentativeG < (gScore.get(neighborKey) || Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + heuristic(neighbor, goal));
        if (!openSet.find(n => key(n) === neighborKey)) {
          openSet.push(neighbor);
        }
      }
    });
  }

  return [];
}

export function calculatePath(startX, startY, targetX, targetY, map) {
  const start = { ...map[startY]?.[startX], x: startX, y: startY };
  const goal = map[targetY]?.[targetX];
  if (!start || !goal) return [];
  return findPath(map, start, goal);
}

export function calculateMovementCost(path, map) {
  return path.reduce((total, tile) => {
    const terrain = map[tile.y]?.[tile.x]?.type || 'grassland';
    return total + (terrain === 'mountain' || terrain === 'water' ? Infinity : 1);
  }, 0);
}
