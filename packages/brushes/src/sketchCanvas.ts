// eslint-disable-next-line import/no-extraneous-dependencies
import { Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';

import { CrayonBrush } from './brushes/index.js';
import { BrushKindEnum } from './brushes/types.js';

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
  viewport.addChild(sprite);

  // ===========================================================
  // handle drawing

  let pointerDown = false;
  let last: PIXI.Point | null = null;

  const brush = new CrayonBrush(app);
  await brush.init();

  viewport.on('pointerdown', () => {
    brush.onStrokeStart();
    pointerDown = true;
  });

  viewport.on('pointermove', (event) => {
    if (!pointerDown) return;

    const curr = sprite.toLocal(event.global);

    if (!last) {
      last = curr;
      return;
    }

    brush.draw(
      {
        tileX: 0,
        tileY: 0,
        startX: last.x,
        startY: last.y,
        endX: curr.x,
        endY: curr.y,
        red: 0,
        green: 255,
        blue: 0,
        alpha: 255,
        size: 10,
        kind: BrushKindEnum.Crayon,
      },
      texture,
    );

    last = curr;
  });

  viewport.on('pointerup', () => {
    brush.onStrokeEnd();
    last = null;
    pointerDown = false;
  });
}

export default setupSketchCanvas;
