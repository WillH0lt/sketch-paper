function floodfill(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  color: [number, number, number, number],
): boolean {
  // Floodfill an RGBA image array of a given width and height
  // starting at (x, y) with a color.

  // returns false if the floodfill made no change (i.e. floodfilling the same color)
  // otherwise returns true

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(2 * width * height);

  const referenceColor = rgba.slice((x + y * width) * 4, (x + y * width) * 4 + 3);

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
      r !== referenceColor[0] || g !== referenceColor[1] || b !== referenceColor[2];

    visited[i] = +isNotReference;
  }

  // Add initial pixel to queue
  let n = 0;
  queue[n++] = x;
  queue[n++] = y;

  const c = rgba;

  // Mark initial pixel as visited
  const i = x + y * width;
  visited[i] = 1;
  c[i * 4 + 0] = color[0];
  c[i * 4 + 1] = color[1];
  c[i * 4 + 2] = color[2];
  c[i * 4 + 3] = 255;

  // While we have not processed all pixels yet
  while (n > 0) {
    // Pop pixel from queue
    const yt = queue[--n];
    const xt = queue[--n];

    // Scan to the left
    let x1 = xt;
    while (x1 > 0 && !visited[x1 - 1 + yt * width]) x1--;

    // Scan to the right
    let x2 = xt;
    while (x2 < width - 1 && !visited[x2 + 1 + yt * width]) x2++;

    // Mark all pixels in scan line as visited
    for (let x0 = x1; x0 <= x2; x0++) {
      const i0 = x0 + yt * width;
      visited[i0] = 1;
      c[i * 4 + 0] = color[0];
      c[i * 4 + 1] = color[1];
      c[i * 4 + 2] = color[2];
      c[i * 4 + 3] = 255;
    }

    // Add pixels above scan line to queue
    if (yt + 1 < height) {
      for (let x0 = x1; x <= x2; x0++) {
        const i0 = x0 + (yt + 1) * width;
        if (!visited[i0]) {
          visited[i0] = 1;
          queue[n++] = x0;
          queue[n++] = yt + 1;
        }
      }
    }

    // Add pixels below scan line to queue
    if (yt > 0) {
      for (let x0 = x1; x0 <= x2; x0++) {
        const i0 = x0 + (yt - 1) * width;
        if (!visited[i0]) {
          visited[i0] = 1;
          queue[n++] = x0;
          queue[n++] = yt - 1;
        }
      }
    }
  }

  return true;
}

export default floodfill;
