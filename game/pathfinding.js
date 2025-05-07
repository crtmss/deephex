// File: game/pathfinding.js

import { isDangerousTile } from './terrain.js';

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Correct neighbor offsets for odd-q vertical layout
function getNeighbors(map, node) {
  const evenQOffsets = [
    { dx: +1, dy:  0 }, { dx:  0, dy: -1 }, { dx: -1, dy: -1 },
    { dx: -1, dy:  0 }, { dx: -1, dy: +1 }, { dx:  0, dy: +1 }
  ];

  const oddQOffsets = [
    { dx: +1, dy:  0 }, { dx: +1, dy: -1 }, { dx:  0, dy: -1 },
    { dx: -1, dy:  0 }, { dx:  0, dy: +1 }, { dx: +1, dy: +1 }
  ];

  const offsets = node.x % 2 === 0 ? evenQOffsets : oddQOffsets;
  const neighbors = [];

  for (const { dx, dy } of offsets) {
    const nx = node.x + dx;
    const ny = node.y + dy;
    if (map[ny] && map[ny][nx]) {
      const tile = map[ny][nx];
      neighbors.push({ ...tile, x: nx, y: ny });
    }
  }

  return neighbors;
}

export function findPath(map, start, goal) {
  if (!start || !goal) return [];

  const startNode = { ...start, x: start.q ?? start.x, y: start.r ?? start.y };
  const goalNode = { ...goal, x: goal.q ?? goal.x, y: goal.r ?? goal.y };

  const openSet = [startNode];
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  const key = (t) => `${t.x},${t.y}`;
  gScore.set(key(startNode), 0);
  fScore.set(key(startNode), heuristic(startNode, goalNode));

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore.get(key(a)) - fScore.get(key(b)));
    const current = openSet.shift();
    const currentKey = key(current);

    if (current.x === goalNode.x && current.y === goalNode.y) {
      const path = [];
      let curr = currentKey;
      while (cameFrom.has(curr)) {
        const node = cameFrom.get(curr);
        path.unshift({ x: node.x, y: node.y });
        curr = key(node);
      }
      path.push({ x: current.x, y: current.y });
      return path;
    }

    for (const neighbor of getNeighbors(map, current)) {
      const neighborKey = key(neighbor);
      if (neighbor.movementCost === Infinity || isDangerousTile(neighbor)) continue;

      const tentativeG = (gScore.get(currentKey) ?? Infinity) + neighbor.movementCost;
      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
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

export function calculatePath(startX, startY, targetX, targetY, map) {
  const start = map[startY]?.[startX];
  const goal = map[targetY]?.[targetX];
  if (!start || !goal) return [];
  return findPath(map, start, goal);
}

export function calculateMovementCost(path, map) {
  return path.reduce((total, tile) => {
    const terrain = map[tile.y]?.[tile.x]?.terrain || 'grassland';
    return total + (terrain.movementCost ?? 1);
  }, 0);
}
