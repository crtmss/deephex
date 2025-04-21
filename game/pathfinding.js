// game/pathfinding.js

const terrainCosts = {
  grass: 1,
  sand: 2,
  mud: 3,
  mountain: Infinity,
};

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
  directions.forEach(({ dx, dy }) => {
    const x = node.x + dx;
    const y = node.y + dy;
    if (map[y] && map[y][x]) {
      neighbors.push(map[y][x]);
    }
  });
  return neighbors;
}

export function findPath(map, start, goal) {
  const openSet = [start];
  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(start, 0);
  const fScore = new Map();
  fScore.set(start, heuristic(start, goal));

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
      const tentativeGScore = gScore.get(current) + terrainCosts[neighbor.terrain];
      if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, tentativeGScore + heuristic(neighbor, goal));
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    });
  }

  return [];
}
