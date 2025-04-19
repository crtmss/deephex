export function getHexCoordinates(x, y, size) {
  const width = size * Math.sqrt(3);
  const height = size * 2;
  return {
    x: width * (x + y / 2),
    y: (3 / 4) * height * y,
  };
}

