// File: game/draw.js

const SQRT3 = Math.sqrt(3);
import { getState } from './game-state.js';

export function drawTerrain(ctx, q, r, terrainType, size) {
  const { x, y } = hexToPixel(q, r, size);
  const corners = getHexCorners(x, y, size);
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < 6; i++) ctx.lineTo(corners[i].x, corners[i].y);
  ctx.closePath();
  ctx.fillStyle = terrainColor(terrainType);
  ctx.fill();
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function drawUnit(ctx, unit, size) {
  const { x, y } = hexToPixel(unit.q, unit.r, size); // ✅ uses q, r
  ctx.beginPath();
  ctx.arc(x, y, size / 2.5, 0, 2 * Math.PI);
  ctx.fillStyle = unit.owner === 'player1' ? "red" : "blue";
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.stroke();

  const selectedUnitId = getState().selectedUnitId;
  if (selectedUnitId && unit.id === selectedUnitId) {
    ctx.beginPath();
    ctx.arc(x, y, size / 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
  }
}

function terrainColor(type) {
  switch (type) {
    case "grassland": return "#34a853";
    case "mud": return "#795548";
    case "sand": return "#FFF59D";
    case "mountain": return "#9E9E9E";
    case "water": return "#4da6ff";
    default: return "#cccccc";
  }
}

function hexToPixel(q, r, size) {
  const canvas = document.getElementById('gameCanvas');
  const x = size * SQRT3 * (q + 0.5 * (r % 2));
  const y = size * 1.5 * r;
  const offsetX = canvas.width / 2 - ((25 * size * SQRT3) / 2);
  const offsetY = canvas.height / 2 - ((25 * size * 1.5) / 2);
  return { x: x + offsetX, y: y + offsetY };
}

function getHexCorners(cx, cy, size) {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 180 * (60 * i - 30);
    corners.push({ x: cx + size * Math.cos(angle), y: cy + size * Math.sin(angle) });
  }
  return corners;
}
