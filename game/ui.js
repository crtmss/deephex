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
  if (!canvas || !state.map || state.map.length === 0) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const hexSize = 20;

  for (let y = 0; y < state.map.length; y++) {
    for (let x = 0; x < state.map[y].length; x++) {
      const tile = state.map[y][x];
      drawTerrain(ctx, x, y, tile.type, hexSize);
    }
  }

  state.units.forEach((unit) => {
    drawUnit(ctx, unit, hexSize);
  });
}

export function showPathCost(path, cost) {
  drawMap();

  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const hexSize = 20;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let i = 0; i < path.length; i++) {
    const { x, y } = path[i];
    const { x: px, y: py } = hexToPixel(x, y, hexSize);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();

  if (path.length > 0) {
    const last = path[path.length - 1];
    const { x, y } = hexToPixel(last.x, last.y, hexSize);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`Cost: ${cost}`, x - 20, y - 10);
  }
}

export function updateGameUI() {
  const state = getState();
  drawMap();
  updateTurnDisplay(state.currentTurn);
}

function hexToPixel(col, row, size) {
  const SQRT3 = Math.sqrt(3);
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return { x: 0, y: 0 };

  const x = size * SQRT3 * (col + 0.5 * (row % 2));
  const y = size * 1.5 * row;

  const offsetX = canvas.width / 2 - ((25 * size * SQRT3) / 2);
  const offsetY = canvas.height / 2 - ((25 * size * 1.5) / 2);

  return { x: x + offsetX, y: y + offsetY };
}

