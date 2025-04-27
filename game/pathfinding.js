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
    { dx: 0, dy: 1 },
  ];

  const neighbors = [];
  for (const { dx, dy } of directions) {
    const nx = node.x + dx;
    const ny = node.y + dy;
    if (map[ny]?.[nx] && !isTileBlocked(nx, ny, map)) {
      neighbors.push({ x: nx, y: ny });
    }
  }
  return neighbors;
}

export function calculatePath(startX, startY, goalX, goalY, map) {
  const start = { x: startX, y: startY };
  const goal = { x: goalX, y: goalY };

  const openSet = [start];
  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(`${start.x},${start.y}`, 0);

  const fScore = new Map();
  fScore.set(`${start.x},${start.y}`, heuristic(start, goal));

  while (openSet.length > 0) {
    openSet.sort((a, b) => {
      return (fScore.get(`${a.x},${a.y}`) || Infinity) - (fScore.get(`${b.x},${b.y}`) || Infinity);
    });

    const current = openSet.shift();
    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let temp = current;
      while (cameFrom.has(`${temp.x},${temp.y}`)) {
        path.push(temp);
        temp = cameFrom.get(`${temp.x},${temp.y}`);
      }
      path.push(start);
      return path.reverse();
    }

    const neighbors = getNeighbors(map, current);
    for (const neighbor of neighbors) {
      const tentativeG = (gScore.get(`${current.x},${current.y}`) || Infinity) + getMovementCost(map[neighbor.y][neighbor.x].type);
      const neighborKey = `${neighbor.x},${neighbor.y}`;

      if (tentativeG < (gScore.get(neighborKey) || Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + heuristic(neighbor, goal));
        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return [];
}

export function calculateMovementCost(path, map) {
  return path.reduce((total, tile) => {
    const terrainType = map[tile.y]?.[tile.x]?.type ?? 'grassland';
    return total + getMovementCost(terrainType);
  }, 0);
}


