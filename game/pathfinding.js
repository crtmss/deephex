// File: game/pathfinding.js

import { isDangerousTile } from './terrain.js';

// ✅ Correct hex grid distance heuristic (cube distance for axial coords)
function heuristic(a, b) {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  const dz = -dq - dr;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dz));
}

// ✅ Correct neighbors for odd-q vertical layout
function getNeighbors(map, node) {
  const q = node.q;
  const r = node.r;

  const directionsEven = [
    { dq: +1, dr:  0 }, { dq:  0, dr: -1 }, { dq: -1, dr: -1 },
    { dq: -1, dr:  0 }, { dq: -1, dr: +1 }, { dq:  0, dr: +1 }
  ];
  const directionsOdd = [
    { dq: +1, dr:  0 }, { dq: +1, dr: -1 }, { dq:  0, dr: -1 },
    { dq: -1, dr:  0 }, { dq:  0, dr: +1 }, { dq: +1, dr: +1 }
  ];
  const dirs = q % 2 === 0 ? directionsEven : directionsOdd;

  const neighbors = [];
  for (const { dq, dr } of dirs) {
    const nq = q + dq;
    const nr = r + dr;
    const row = map[nr];
    if (row && row[nq]) {
      const tile = row[nq];
      if (tile.movementCost !== Infinity && !tile.impassable && !isDangerousTile(tile)) {
        neighbors.push({ ...tile });
      }
    }
  }
  return neighbors;
}

export function findPath(map, start, goal) {
  if (!start || !goal) return [];

  const startNode = { ...start };
  const goalNode = { ...goal };

  const key = (t) => `${t.q},${t.r}`;
  const openSet = [startNode];
  const cameFrom = new Map();
  const gScore = new Map([[key(startNode), 0]]);
  const fScore = new Map([[key(startNode), heuristic(startNode, goalNode)]]);

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore.get(key(a)) - fScore.get(key(b)));
    const current = openSet.shift();
    const currentKey = key(current);

    if (current.q === goalNode.q && current.r === goalNode.r) {
      const path = [];
      let currKey = currentKey;
      let currNode = current;
      while (cameFrom.has(currKey)) {
        path.unshift({ q: currNode.q, r: currNode.r });
        currNode = cameFrom.get(currKey);
        currKey = key(currNode);
      }
      path.unshift({ q: startNode.q, r: startNode.r });
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

export function calculatePath(startQ, startR, targetQ, targetR, map) {
  const start = map[startR]?.[startQ];
  const goal = map[targetR]?.[targetQ];
  if (!start || !goal) return [];
  return findPath(map, start, goal);
}

export function calculateMovementCost(path, map) {
  return path.reduce((total, tile) => {
    const terrain = map[tile.r]?.[tile.q];
    return total + (terrain?.movementCost ?? 1);
  }, 0);
}
