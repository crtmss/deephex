// File: game/ui.js

import { drawTerrain, drawUnit } from './draw.js';
import { getState, setState } from './game-state.js';

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

  const hexSize = 16;
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

  const hexSize = 16;
  ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
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
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`Cost: ${cost}`, x - 20, y - 10);
  }
}

function hexToPixel(col, row, size) {
  const SQRT3 = Math.sqrt(3);
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return { x: 0, y: 0 };

  const x = size * SQRT3 * (col + 0.5 * (row % 2));
  const y = size * 1.5 * (row + 1);
  const offsetX = canvas.width / 2 - ((25 * size * SQRT3) / 2);
  const offsetY = canvas.height / 2 - ((25 * size * 1.5) / 2);
  return { x: x + offsetX, y: y + offsetY };
}

export function updateGameUI() {
  const state = getState();
  drawMap();
  updateTurnDisplay(state.currentTurn);
}

export function drawDebugInfo(col, row) {
  const state = getState();
  if (!state.debugEnabled) return;

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const tile = state.map?.[row]?.[col];
  if (!tile) return;

  const hexSize = 16;
  const { x, y } = hexToPixel(col, row, hexSize);

  let debugText = `(${col},${row}) ${tile.type}`;
  const unit = state.units.find(u => u.x === col && u.y === row);
  if (unit) debugText += ` | ${unit.owner}`;

  ctx.fillStyle = 'black';
  ctx.font = '12px monospace';
  ctx.fillText(debugText, x + 10, y - 10);
}

export function toggleDebugMode() {
  const state = getState();
  const enabled = !state.debugEnabled;
  setState({ ...state, debugEnabled: enabled });
  console.log(enabled ? '✅ Entered debug mode' : '❌ Exited debug mode');
}
