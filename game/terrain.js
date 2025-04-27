// File: game/terrain.js

const terrainMovementCosts = {
  grassland: 1,
  sand: 2,
  mud: 3,
  mountain: Infinity,
  water: Infinity
};

export function getMovementCost(terrainType) {
  return terrainMovementCosts[terrainType] ?? 1;
}

export function isPassable(terrainType) {
  return getMovementCost(terrainType) !== Infinity;
}

export function isTileBlocked(x, y, map) {
  const tile = map?.[y]?.[x];
  if (!tile) return true;
  return !isPassable(tile.type);
}
