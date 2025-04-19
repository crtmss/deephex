import { getHexCoordinates } from '../lib/hex.js';

export let map = [];

export function initMap() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const size = 20;

  for (let y = 0; y < 25; y++) {
    for (let x = 0; x < 25; x++) {
      const { x: px, y: py } = getHexCoordinates(x, y, size);
      ctx.beginPath();
      ctx.arc(px, py, size, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
}

