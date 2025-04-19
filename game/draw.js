// game/draw.js

export function drawTerrain(ctx, x, y, terrain, hexSize) {
  const [px, py] = hexToPixel(x, y, hexSize);

  ctx.beginPath();
  ctx.moveTo(...hexCorner(px, py, hexSize, 0));
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(...hexCorner(px, py, hexSize, i));
  }
  ctx.closePath();

  // Fill based on terrain type
  switch (terrain) {
    case 'mud': ctx.fillStyle = '#8B7355'; break;        // gray-brown
    case 'sand': ctx.fillStyle = '#f0e68c'; break;        // pale yellow
    case 'mountain': ctx.fillStyle = '#888888'; break;    // gray
    default: ctx.fillStyle = '#55aa55'; break;            // green grass
  }

  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.stroke();
}

export function drawUnit(ctx, unit, hexSize) {
  const [px, py] = hexToPixel(unit.x, unit.y, hexSize);
  ctx.beginPath();
  ctx.arc(px, py, hexSize / 3, 0, Math.PI * 2);

  ctx.fillStyle = unit.owner === 1 ? 'blue' : 'red'; // Player colors
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.stroke();
}

// Helpers
function hexToPixel(q, r, size) {
  const x = size * Math.sqrt(3) * (q + r / 2);
  const y = size * 3 / 2 * r;
  return [x, y];
}

function hexCorner(cx, cy, size, i) {
  const angle = Math.PI / 3 * i;
  return [cx + size * Math.cos(angle), cy + size * Math.sin(angle)];
}
