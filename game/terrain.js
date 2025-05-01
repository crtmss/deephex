// File: game/terrain.js

// Movement cost per terrain type
const terrainMovementCosts = {
  grassland: 1,
  forest: 2,
  mountain: Infinity,
  swamp: 3,
  water: Infinity
};

// Returns the movement cost of a tile, or of a terrain type
export function getMovementCost(terrainOrTile) {
  const type = typeof terrainOrTile === 'string' ? terrainOrTile : terrainOrTile?.terrain || terrainOrTile?.type;
  return terrainMovementCosts[type] ?? 1;
}

// Returns true if the tile or terrain type is passable
export function isPassable(terrainOrTile) {
  return getMovementCost(terrainOrTile) !== Infinity;
}

// Returns true if the tile is not passable or is missing
export function isTileBlocked(x, y, map) {
  const tile = map?.[y]?.[x];
  if (!tile) return true;
  return !isPassable(tile);
}

// Returns true if the tile is dangerous (e.g. fire, landmine)
export function isDangerousTile(tile) {
  return tile?.effect === 'fire' || tile?.effect === 'mine';
}
