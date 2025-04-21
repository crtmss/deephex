// game/map.js

// === Terrain Types ===
export const terrainTypes = {
  grassland: { movementCost: 1, color: '#4CAF50' },
  sand: { movementCost: 2, color: '#FFF59D' },
  mud: { movementCost: 3, color: '#795548' },
  mountain: { movementCost: Infinity, color: '#9E9E9E', impassable: true }
};

// === Seeded Random Generator ===
function seededRandom(seed) {
  if (!seed || typeof seed !== 'string') {
    seed = 'defaultseed';
  }

  let x = 0;
  for (let i = 0; i < seed.length; i++) {
    x += seed.charCodeAt(i);
  }

  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

// === Map Generation Function ===
export function generateMap(rows = 25, cols = 25, seed = 'defaultseed') {
  const rand = seededRandom(seed);
  const map = [];

  let sandCount = 0;
  let mudCount = 0;
  const maxBiomeSize = 30;

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let q = 0; q < cols; q++) {
      const n = rand();
      let type = 'grassland';

      if (n > 0.98) {
        type = 'mountain';
      } else if (n > 0.92 && sandCount < maxBiomeSize) {
        type = 'sand';
        sandCount++;
      } else if (n > 0.85 && mudCount < maxBiomeSize) {
        type = 'mud';
        mudCount++;
      }

      row.push({
        q,
        r,
        type,
        movementCost: terrainTypes[type].movementCost,
        impassable: terrainTypes[type].impassable || false,
      });
    }
    map.push(row);
  }

  return map;
}

// === Default Map (for non-networked testing) ===
export const map = generateMap(25, 25, 'shared-seed-123');

// === Hex Geometry Helpers ===
const HEX_SIZE = 25;
function hexToPixel(q, r) {
  const x = HEX_SIZE * 3/2 * q;
  const y = HEX_SIZE * Math.sqrt(3) * (r + q / 2);
  return { x, y };
}

function drawHex(ctx, x, y, size, color) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 3 * i;
    const dx = x + size * Math.cos(angle);
    const dy = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(dx, dy);
    else ctx.lineTo(dx, dy);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.stroke();
}

// === Render Function ===
export function render(canvasElement, gameMap = map) {
  const ctx = canvasElement.getContext('2d');
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  const offsetX = (canvasElement.width - (25 * HEX_SIZE * 1.5)) / 2;
  const offsetY = (canvasElement.height - (25 * HEX_SIZE * Math.sqrt(3))) / 2;

  for (const row of gameMap) {
    for (const hex of row) {
      const { x, y } = hexToPixel(hex.q, hex.r);
      drawHex(ctx, x + offsetX, y + offsetY, HEX_SIZE, terrainTypes[hex.type].color);
    }
  }
}

