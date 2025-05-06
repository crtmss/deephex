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
  for (const { dx, dy } of directions) {
    const x = node.x + dx;
    const y = node.y + dy;
    if (map[y]?.[x] && map[y][x].movementCost !== Infinity && !isDangerousTile(map[y][x])) {
      neighbors.push({ x, y });
    }
  }
  return neighbors;
}

export function calculatePath(startX, startY, goalX, goalY, map) {
  const startKey = `${startX},${startY}`;
  const goalKey = `${goalX},${goalY}`;
  const openSet = [{ x: startX, y: startY }];
  const cameFrom = {};
  const gScore = { [startKey]: 0 };
  const fScore = { [startKey]: heuristic({ x: startX, y: startY }, { x: goalX, y: goalY }) };
  const visited = new Set();

  while (openSet.length > 0) {
    openSet.sort((a, b) => (fScore[`${a.x},${a.y}`] ?? Infinity) - (fScore[`${b.x},${b.y}`] ?? Infinity));
    const current = openSet.shift();
    const currKey = `${current.x},${current.y}`;

    if (currKey === goalKey) {
      const path = [current];
      let step = cameFrom[currKey];
      while (step) {
        path.push(step);
        step = cameFrom[`${step.x},${step.y}`];
      }
      return path.reverse();
    }

    visited.add(currKey);

    for (const neighbor of getNeighbors(map, current)) {
      const nKey = `${neighbor.x},${neighbor.y}`;
      if (visited.has(nKey)) continue;

      const tentativeG = (gScore[currKey] ?? Infinity) + (map[neighbor.y][neighbor.x].movementCost || 1);
      if (tentativeG < (gScore[nKey] ?? Infinity)) {
        cameFrom[nKey] = current;
        gScore[nKey] = tentativeG;
        fScore[nKey] = tentativeG + heuristic(neighbor, { x: goalX, y: goalY });
        if (!openSet.find(p => p.x === neighbor.x && p.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return [];
}

