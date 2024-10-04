const maxWorldCoord = 2 ** 31;
function getBoundedCoord(v: bigint): number {
  let boundedV = BigInt(v);
  const abs = v < 0 ? -v : v;
  const sign = v < 0 ? -1 : 1;

  if (abs > maxWorldCoord) {
    boundedV =
      BigInt(-1 * sign * maxWorldCoord) + ((v - BigInt(maxWorldCoord)) % BigInt(2 * maxWorldCoord));
  }

  return Number(boundedV);
}

// eslint-disable-next-line import/prefer-default-export
export function getBoundedCoords(x: bigint, y: bigint): [number, number] {
  return [getBoundedCoord(x), getBoundedCoord(y)];
}
