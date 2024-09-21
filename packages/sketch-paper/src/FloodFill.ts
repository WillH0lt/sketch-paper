export function floodfill(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  color: [number, number, number, number]
): boolean {
  // Floodfill an RGBA image array of a given width and height
  // starting at (x, y) with a color.

  // returns false if the floodfill made no change (i.e. floodfilling the same color)
  // otherwise returns true

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(2 * width * height);

  const referenceColor = rgba.slice(
    (x + y * width) * 4,
    (x + y * width) * 4 + 3
  );

  if (
    referenceColor[0] === color[0] &&
    referenceColor[1] === color[1] &&
    referenceColor[2] === color[2]
  ) {
    return false;
  }

  // Only same-color pixels can be visited
  for (let i = 0; i < width * height; i++) {
    const r = rgba[i * 4 + 0];
    const g = rgba[i * 4 + 1];
    const b = rgba[i * 4 + 2];

    const isNotReference =
      r !== referenceColor[0] ||
      g !== referenceColor[1] ||
      b !== referenceColor[2];

    visited[i] = +isNotReference;
  }

  // Add initial pixel to queue
  let n = 0;
  queue[n++] = x;
  queue[n++] = y;

  // Mark initial pixel as visited
  let i = x + y * width;
  visited[i] = 1;
  rgba[i * 4 + 0] = color[0];
  rgba[i * 4 + 1] = color[1];
  rgba[i * 4 + 2] = color[2];
  rgba[i * 4 + 3] = 255;

  // While we have not processed all pixels yet
  while (n > 0) {
    // Pop pixel from queue
    let y = queue[--n];
    let x = queue[--n];

    // Scan to the left
    let x1 = x;
    while (x1 > 0 && !visited[x1 - 1 + y * width]) x1--;

    // Scan to the right
    let x2 = x;
    while (x2 < width - 1 && !visited[x2 + 1 + y * width]) x2++;

    // Mark all pixels in scan line as visited
    for (let x = x1; x <= x2; x++) {
      let i = x + y * width;
      visited[i] = 1;
      rgba[i * 4 + 0] = color[0];
      rgba[i * 4 + 1] = color[1];
      rgba[i * 4 + 2] = color[2];
      rgba[i * 4 + 3] = 255;
    }

    // Add pixels above scan line to queue
    if (y + 1 < height) {
      for (let x = x1; x <= x2; x++) {
        let i = x + (y + 1) * width;
        if (!visited[i]) {
          visited[i] = 1;
          queue[n++] = x;
          queue[n++] = y + 1;
        }
      }
    }

    // Add pixels below scan line to queue
    if (y > 0) {
      for (let x = x1; x <= x2; x++) {
        let i = x + (y - 1) * width;
        if (!visited[i]) {
          visited[i] = 1;
          queue[n++] = x;
          queue[n++] = y - 1;
        }
      }
    }
  }

  return true;
}
