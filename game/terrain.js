// File: game/terrain.js

const terrainMovementCosts = {
  grassland: 1,
  forest: 2,
  mountain: Infinity,
  swamp: 3,
  water: Infinity
};

export function getMovementCost(terrainType) {
  return terrainMovementCosts[terrainType] ?? 1;
}

export function isPassable(terrainType) {
  return getMovementCost(terrainType) !== Infinity;
}
