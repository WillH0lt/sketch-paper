// eslint-disable-next-line import/no-extraneous-dependencies
import { Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';

import { CrayonBrush } from './brushes/index.js';
import { BrushKinds } from './brushes/types.js';

async function setupSketchCanvas(element: HTMLElement): Promise<void> {
  // ===========================================================
  // create PIXI application

  const app = new PIXI.Application();

  await app.init();

  app.canvas.classList.add('sketch-canvas');

  element.appendChild(app.canvas);

  app.canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  const width = app.canvas.clientWidth;
  const height = app.canvas.clientHeight;

  app.renderer.resize(width, height);

  // ===========================================================
  // create Viewport

  const viewport = new Viewport({
    events: app.renderer.events,
  });

  viewport
    .drag({
      mouseButtons: 'right',
    })
    .wheel()
    .decelerate();

  viewport.setZoom(1, true);

  const shift = 0; // 2 ** 32 - 1;
  viewport.moveCenter(shift, shift);

  app.stage.addChild(viewport);

  // ===========================================================
  // setup drawing surface

  const texture = PIXI.RenderTexture.create({
    width,
    height,
  });

  // //
  const white = new PIXI.Sprite(PIXI.Texture.WHITE);
  white.width = texture.width;
  white.height = texture.height;

  app.renderer.render({
    container: white,
    target: texture,
    clear: true,
  });
  // //

  const sprite = new PIXI.Sprite(texture);
  sprite.position.set(shift, shift);
  viewport.addChild(sprite);

  // ===========================================================
  // handle drawing

  let pointerDown = false;
  let last: PIXI.Point | null = null;
  let runningLength = 0;

  const brush = new CrayonBrush(app);
  await brush.init();

  viewport.on('pointerdown', () => {
    pointerDown = true;
  });

  viewport.on('pointermove', (event) => {
    if (!pointerDown) return;

    const curr = viewport.toLocal(event.global);

    if (!last) {
      last = curr;
      return;
    }

    const dx = curr.x - last.x;
    const dy = curr.y - last.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    runningLength += length;

    brush.draw(
      {
        tileX: sprite.x,
        tileY: sprite.y,
        startX: last.x,
        startY: last.y,
        endX: curr.x,
        endY: curr.y,
        red: 0,
        green: 0,
        blue: 0,
        alpha: 255,
        size: 10,
        kind: BrushKinds.Crayon,
        runningLength,
      },
      texture,
    );

    last = curr;
  });

  viewport.on('pointerup', () => {
    last = null;
    pointerDown = false;
    runningLength = 0;
  });
}

export default setupSketchCanvas;
