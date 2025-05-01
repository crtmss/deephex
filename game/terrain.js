//File: game/terrain.js

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

export function isTileBlocked(x, y, map) {
  const tile = map?.[y]?.[x];
  if (!tile) return true;
  return !isPassable(tile.terrain);
}

// ✅ NEW: mark dangerous tiles (fire, mine, etc)
export function isDangerousTile(tile) {
  return tile.effect === 'fire' || tile.effect === 'mine';
}
