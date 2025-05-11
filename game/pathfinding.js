// File: game/pathfinding.js

import { isDangerousTile } from './terrain.js';

// ✅ Fixed: proper hex grid distance heuristic
function heuristic(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return (Math.abs(dx) + Math.abs(dx + dy) + Math.abs(dy)) / 2;
}

function getNeighbors(map, node) {
  const col = node.x;
  const row = node.y;

  const evenOffsets = [
    { dx: +1, dy:  0 }, { dx:  0, dy: -1 }, { dx: -1, dy: -1 },
    { dx: -1, dy:  0 }, { dx: -1, dy: +1 }, { dx:  0, dy: +1 }
  ];

  const oddOffsets = [
    { dx: +1, dy:  0 }, { dx: +1, dy: -1 }, { dx:  0, dy: -1 },
    { dx: -1, dy:  0 }, { dx:  0, dy: +1 }, { dx: +1, dy: +1 }
  ];

  const offsets = col % 2 === 0 ? evenOffsets : oddOffsets;
  const neighbors = [];

  for (const { dx, dy } of offsets) {
    const nx = col + dx;
    const ny = row + dy;
    if (map[ny] && map[ny][nx]) {
      const tile = map[ny][nx];
      if (tile.movementCost !== Infinity && !tile.impassable && !isDangerousTile(tile)) {
        neighbors.push({ ...tile, x: nx, y: ny });
      }
    }
  }

  return neighbors;
}

export function findPath(map, start, goal) {
  if (!start || !goal) return [];

  const startNode = { ...start, x: start.q ?? start.x, y: start.r ?? start.y };
  const goalNode = { ...goal, x: goal.q ?? goal.x, y: goal.r ?? goal.y };

  const key = (t) => `${t.x},${t.y}`;
  const openSet = [startNode];
  const cameFrom = new Map();
  const gScore = new Map([[key(startNode), 0]]);
  const fScore = new Map([[key(startNode), heuristic(startNode, goalNode)]]); // ✅ fixed missing bracket

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore.get(key(a)) - fScore.get(key(b)));
    const current = openSet.shift();
    const currentKey = key(current);

    if (current.x === goalNode.x && current.y === goalNode.y) {
      const path = [];
      let currKey = currentKey;
      let currNode = current;
      while (cameFrom.has(currKey)) {
        path.unshift({ x: currNode.x, y: currNode.y });
        currNode = cameFrom.get(currKey);
        currKey = key(currNode);
      }
      path.unshift({ x: startNode.x, y: startNode.y });
      return path;
    }

    for (const neighbor of getNeighbors(map, current)) {
      const neighborKey = key(neighbor);
      const tentativeG = gScore.get(currentKey) + neighbor.movementCost;
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
    const terrain = map[tile.y]?.[tile.x];
    return total + (terrain?.movementCost ?? 1);
  }, 0);
}
