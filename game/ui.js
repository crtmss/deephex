// File: game/ui.js

import { drawTerrain, drawUnit } from './draw.js';
import { getState } from './game-state.js';

export function updateTurnDisplay(turn) {
  const turnInfo = document.getElementById('turn-display');
  if (turnInfo) {
    turnInfo.textContent = `Current Turn: ${turn}`;
  }
}

export function drawMap() {
  const state = getState();
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const hexSize = 20;

  for (let y = 0; y < state.map.length; y++) {
    for (let x = 0; x < state.map[y].length; x++) {
      const tile = state.map[y][x];
      drawTerrain(ctx, x, y, tile.terrain, hexSize);
    }
  }

  state.units.forEach((unit) => {
    drawUnit(ctx, unit, hexSize);
  });
}


