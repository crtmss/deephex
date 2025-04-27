// Corrected pathfinding.js
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
    { dx: 0, dy: 1 },
  ];
  const neighbors = [];
  for (const {dx, dy} of directions) {
    const x = node.x + dx;
    const y = node.y + dy;
    if (map[y] && map[y][x] && !isTileBlocked(x, y, map)) {
      neighbors.push({x, y});
    }
  }
  return neighbors;
}

export function findPath(map, start, goal) {
  const openSet = [{x: start.x, y: start.y}];
  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(\`\${start.x},\${start.y}\`, 0);

  while (openSet.length) {
    openSet.sort((a, b) => heuristic(a, goal) - heuristic(b, goal));
    const current = openSet.shift();
    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let node = current;
      while (node) {
        path.push(node);
        node = cameFrom.get(\`\${node.x},\${node.y}\`);
      }
      return path.reverse();
    }

    for (const neighbor of getNeighbors(map, current)) {
      const tentativeGScore = (gScore.get(\`\${current.x},\${current.y}\`) || 0) + 1;
      const neighborKey = \`\${neighbor.x},\${neighbor.y}\`;
      if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return [];
}

export function calculatePath(startX, startY, targetX, targetY, map) {
  const start = {x: startX, y: startY};
  const goal = {x: targetX, y: targetY};
  return findPath(map, start, goal);
}

export function calculateMovementCost(path, map) {
  return path.length - 1; // each step costs 1
}
