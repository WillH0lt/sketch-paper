const maxWorldCoord = 2 ** 31;
function getBoundedCoord(v: bigint): number {
  let boundedV = BigInt(v);
  const abs = v < 0 ? -v : v;

  if (abs > maxWorldCoord) {
    const sign = v < 0 ? -1 : 1;
    boundedV =
      BigInt(-1 * sign * maxWorldCoord) + ((v - BigInt(maxWorldCoord)) % BigInt(2 * maxWorldCoord));
  }

  return Number(boundedV);
}

export function getBoundedCoords(x: bigint, y: bigint): [number, number] {
  return [getBoundedCoord(x), getBoundedCoord(y)];
}

export function luminance(color: string): number {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function setCrayonCursor(fill: string): void {
  if (!import.meta.client) return;
  const l = luminance(fill);
  let crayonWrapperStyle = 'filter: saturate(20%) brightness(1.5);';
  if (l < 50) {
    crayonWrapperStyle = 'filter: invert(25%) grayscale(80%);';
  }
  if (l > 175) {
    crayonWrapperStyle = 'filter: saturate(30%) brightness(0.75);';
  }

  const crayonCursor = `
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs><style>.crayon-wrapper {${crayonWrapperStyle}}</style></defs>
    <path d="M24.4853 2.56853C24.0948 2.178 23.4616 2.178 23.0711 2.56853L22.0104 3.62919L24.4853 7.51828L28.3744 9.99315L29.435 8.93249C29.8256 8.54196 29.8256 7.9088 29.435 7.51828L24.4853 2.56853Z" fill="${fill}"/>
    <path d="M5.0417 20.598L9.54659 22.9885L11.4057 26.962L10.8656 27.502C10.7557 27.6119 10.6218 27.6946 10.4744 27.7437L4.15157 29.849C3.61257 30.0286 3.01832 29.8883 2.61657 29.4866L2.5134 29.3834C2.11165 28.9817 1.97137 28.3874 2.15104 27.8484L4.25992 21.5289C4.30903 21.3817 4.3917 21.248 4.50139 21.1383L5.0417 20.598Z" fill="${fill}"/>
    <path class="crayon-wrapper" d="M28.3762 9.9914L22.0122 3.62744L21.3051 4.33456L24.122 7.90855L27.6691 10.6985L28.3762 9.9914ZM26.962 11.4056L24.122 7.90855L20.598 5.04167L6.45587 19.1838L9.14918 22.6762L12.8198 25.5478L26.962 11.4056ZM12.1127 26.2549L9.14918 22.6762L5.74876 19.8909L5.04169 20.598L11.4056 26.962L12.1127 26.2549Z" fill="${fill}"/>
    <path d="M27.6691 10.6986L21.3052 4.33459L20.5981 5.0417L26.962 11.4057L27.6691 10.6986Z" fill="#321B41"/>
    <path d="M18.1213 16.7071C15.3877 19.4408 12.5384 21.0237 11.7574 20.2427C10.9763 19.4616 12.5592 16.6124 15.2929 13.8787C18.0266 11.145 20.8758 9.56212 21.6569 10.3432C22.4379 11.1242 20.855 13.9735 18.1213 16.7071Z" fill="#321B41"/>
    <path d="M6.45592 19.1838L12.8199 25.5478L12.1128 26.2549L5.74881 19.8909L6.45592 19.1838Z" fill="#321B41"/>
  </svg>
  `;

  document.body.style.cursor = `url("data:image/svg+xml,${encodeURIComponent(crayonCursor)}") 0 32, auto`;
}

export function setHandCursor(): void {
  if (!import.meta.client) return;
  const handCursor = `<?xml version="1.0" encoding="UTF-8"?><svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4.08 4.75" width="24" height="24"><defs><style>.cls-1{fill:#fff;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:.25px;}.cls-2{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:.51px;}</style></defs><path class="cls-1" d="M.89,2.25v.63M.89,2.25V.75c0-.21.17-.38.38-.38s.38.17.38.38M.89,2.25c0-.21-.17-.37-.38-.37s-.38.17-.38.37v.5c0,1.04.86,1.87,1.91,1.87s1.91-.84,1.91-1.87v-1.25c0-.21-.17-.38-.38-.38s-.38.17-.38.38M1.66.75v1.38M1.66.75v-.25c0-.21.17-.38.38-.38s.38.17.38.38v.25M2.42.75v1.38M2.42.75c0-.21.17-.38.38-.38s.38.17.38.38v.75M3.19,1.5v.63"/><line class="cls-2" x1="2.8" y1=".77" x2="2.8" y2="2.03"/><line class="cls-2" x1="2.04" y1=".64" x2="2.04" y2="2.02"/><line class="cls-2" x1="1.27" y1=".84" x2="1.27" y2="2.29"/></svg>`;
  document.body.style.cursor = `url("data:image/svg+xml,${encodeURIComponent(handCursor)}") 0 0, auto`;
}
