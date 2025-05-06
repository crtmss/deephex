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
    const nx = node.x + dx;
    const ny = node.y + dy;
    if (map[ny] && map[ny][nx]) {
      neighbors.push({ ...map[ny][nx], x: nx, y: ny });
    }
  }
  return neighbors;
}

export function findPath(map, start, goal) {
  if (!start || !goal) return [];

  const startNode = { ...start, x: start.q, y: start.r };
  const goalNode = { ...goal, x: goal.q, y: goal.r };

  const openSet = [startNode];
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  const key = (n) => `${n.x},${n.y}`;
  gScore.set(key(startNode), 0);
  fScore.set(key(startNode), heuristic(startNode, goalNode));

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore.get(key(a)) - fScore.get(key(b)));
    const current = openSet.shift();
    const currentKey = key(current);

    if (current.x === goalNode.x && current.y === goalNode.y) {
      const path = [current];
      while (cameFrom.has(currentKey)) {
        const prev = cameFrom.get(currentKey);
        path.unshift(prev);
        currentKey = key(prev);
      }
      return path;
    }

    for (const neighbor of getNeighbors(map, current)) {
      if (isDangerousTile(neighbor) || neighbor.movementCost === Infinity) continue;

      const neighborKey = key(neighbor);
      const tentativeG = gScore.get(currentKey) + (neighbor.movementCost || 1);
      if (tentativeG < (gScore.get(neighborKey) || Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + heuristic(neighbor, goalNode));
        if (!openSet.find(n => key(n) === neighborKey)) {
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
  return findPath(map, start, goal);
}
