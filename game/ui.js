// File: game/ui.js

import { drawTerrain, drawUnit } from './draw.js';
import { getState } from './game-state.js';

let hoveredHex = null;
let currentPath = [];

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

  // Draw terrain
  for (let y = 0; y < state.map.length; y++) {
    for (let x = 0; x < state.map[y].length; x++) {
      const tile = state.map[y][x];
      drawTerrain(ctx, x, y, tile.type, hexSize);
    }
  }

  // Draw selected hex
  if (state.selectedHex) {
    drawSelectedHex(ctx, state.selectedHex.col, state.selectedHex.row, hexSize);
  }

  // Draw hovered hex
  if (hoveredHex && !state.selectedHex) {
    drawHoveredHex(ctx, hoveredHex.col, hoveredHex.row, hexSize);
  }

  // 🔥 Draw path
  if (currentPath.length > 0) {
    drawPath(ctx, currentPath, hexSize);
  }

  // Draw units
  state.units.forEach((unit) => {
    drawUnit(ctx, unit, hexSize);
  });
}

export function setHoveredHex(col, row) {
  hoveredHex = col !== null && row !== null ? { col, row } : null;
}

export function setCurrentPath(path) {
  currentPath = path;

  const state = getState();
  if (state.debugEnabled && path.length > 0) {
    const debugCoords = path.map(p => `(hex ${p.x},${p.y})`).join(', ');
    console.log(`[Path] Highlighted path: ${debugCoords}`);
  }

  drawMap(); // ✅ Force re-render to show the path
}

function drawPath(ctx, path, hexSize) {
  ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let i = 0; i < path.length; i++) {
    const { x, y } = path[i];
    const { x: px, y: py } = hexToPixel(x, y, hexSize);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.stroke();

  if (path.length > 0) {
    const last = path[path.length - 1];
    const { x, y } = hexToPixel(last.x, last.y, hexSize);
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`Cost: ${path.length}`, x - 20, y - 10);
  }
}

function drawHoveredHex(ctx, col, row, size) {
  const { x, y } = hexToPixel(col, row, size);
  const corners = getHexCorners(x, y, size);
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < corners.length; i++) {
    ctx.lineTo(corners[i].x, corners[i].y);
  }
  ctx.closePath();
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawSelectedHex(ctx, col, row, size) {
  const { x, y } = hexToPixel(col, row, size);
  const corners = getHexCorners(x, y, size);
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < corners.length; i++) {
    ctx.lineTo(corners[i].x, corners[i].y);
  }
  ctx.closePath();
  ctx.strokeStyle = 'orange';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function getHexCorners(cx, cy, size) {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 180 * (60 * i - 30);
    corners.push({
      x: cx + size * Math.cos(angle),
      y: cy + size * Math.sin(angle)
    });
  }
  return corners;
}

function hexToPixel(col, row, size) {
  const SQRT3 = Math.sqrt(3);
  const canvas = document.getElementById('gameCanvas');
  const x = size * SQRT3 * (col + 0.5 * (row % 2));
  const y = size * 1.5 * row;
  const offsetX = canvas.width / 2 - ((25 * size * SQRT3) / 2);
  const offsetY = canvas.height / 2 - ((25 * size * 1.5) / 2);
  return { x: x + offsetX, y: y + offsetY };
}

export function updateGameUI() {
  drawMap();
  updateTurnDisplay(getState().currentTurn);
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
