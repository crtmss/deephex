// File: game/pathfinding.js

import { isTileBlocked } from './terrain.js';

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function nodeKey(x, y) {
  return `${x},${y}`;
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
  const fScore = new Map();

  gScore.set(nodeKey(start.x, start.y), 0);
  fScore.set(nodeKey(start.x, start.y), heuristic(start, goal));

  while (openSet.length > 0) {
    openSet.sort((a, b) =>
      (fScore.get(nodeKey(a.x, a.y)) || Infinity) -
      (fScore.get(nodeKey(b.x, b.y)) || Infinity)
    );

    const current = openSet.shift();
    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let currentKey = nodeKey(current.x, current.y);
      while (cameFrom.has(currentKey)) {
        const [cx, cy] = currentKey.split(',').map(Number);
        path.push({ x: cx, y: cy });
        currentKey = cameFrom.get(currentKey);
      }
      path.push({ x: start.x, y: start.y });
      return path.reverse();
    }

    for (const neighbor of getNeighbors(map, current)) {
      const nKey = nodeKey(neighbor.x, neighbor.y);
      const cKey = nodeKey(current.x, current.y);
      const tentativeG = (gScore.get(cKey) || Infinity) + (neighbor.movementCost || 1);

      if (tentativeG < (gScore.get(nKey) || Infinity)) {
        cameFrom.set(nKey, cKey);
        gScore.set(nKey, tentativeG);
        fScore.set(nKey, tentativeG + heuristic(neighbor, goal));
        if (!openSet.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
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
    const terrain = map[tile.y]?.[tile.x];
    return total + (terrain?.movementCost || 1);
  }, 0);
}
