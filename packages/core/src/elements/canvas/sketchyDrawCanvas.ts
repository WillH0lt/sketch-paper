import { System, World } from '@lastolivegames/becsy';
import type { TemplateResult } from 'lit';
import { css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import { Emitter } from 'strict-event-emitter';

import * as comps from '../../components/index.js';
import * as sys from '../../systems/index.js';
import type { Events, Settings } from '../../types.js';
import { BrushKindEnum } from '../../types.js';
import SdBaseElement from '../base/sketchyDrawBase.js';

@customElement('sketchy-draw-canvas')
class SketchyDrawCanvas extends SdBaseElement {
  public static styles = css`
    canvas {
      display: block;
      vertical-align: middle;
    }
  `;

  @property()
  private readonly settings: Settings = {
    minZoom: 0.25,
    maxZoom: 10,
    tileWidth: 2048,
    tileHeight: 2048,
    assetsPath: 'https://storage.googleapis.com/sketch-paper-public',
  };

  @query('#container')
  private readonly container!: HTMLDivElement;

  public readonly emitter = new Emitter<Events>();

  // private toolbar: HTMLElement | null = null;
  // private zoomContainer: HTMLElement | null = null;
  private readonly onDestroyCallbacks: (() => void)[] = [];

  public firstUpdated(): void {
    this.initialize().catch((err: unknown) => {
      console.error(err);
    });
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const cb of this.onDestroyCallbacks) {
      cb();
    }
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  protected render(): TemplateResult {
    return html` <div id="container" style="width: 100%; height: 100%;"></div> `;
  }

  private async initialize(): Promise<void> {
    // =================================
    // toolbar

    // const toolbar = document.createElement("bottom-toolbar");
    // toolbar.style.position = "absolute";
    // toolbar.style.bottom = "0";
    // toolbar.style.width = "100%";
    // toolbar.style.zIndex = "20";
    // toolbar.style.pointerEvents = "none";
    // container.appendChild(toolbar);
    // this.toolbar = toolbar;
    // toolbar.addEventListener("updateBrush", (e: Event) => {
    //   const brush = (e as CustomEvent).detail as Brush;
    //   this.emitter.emit("updateBrush", brush);
    // });

    // const zoomContainer = document.createElement("bottom-zoom");
    // zoomContainer.style.position = "fixed";
    // zoomContainer.style.bottom = "0";
    // zoomContainer.style.right = "0";
    // zoomContainer.style.zIndex = "20";
    // zoomContainer.style.pointerEvents = "none";
    // zoomContainer.setAttribute("minZoom", settings.minZoom.toString());
    // zoomContainer.setAttribute("maxZoom", settings.maxZoom.toString());
    // container.appendChild(zoomContainer);
    // this.zoomContainer = zoomContainer;

    // =================================
    // pixi app

    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    const app = new PIXI.Application();
    await app.init({
      autoStart: false,
      preference: 'webgl',
    });
    app.renderer.canvas.style.width = '100%';
    app.renderer.canvas.style.height = '100%';
    this.container.appendChild(app.renderer.canvas);
    app.renderer.background.color = 0xebecf0;

    const viewport = new Viewport({
      screenWidth: this.container.offsetWidth,
      screenHeight: this.container.offsetHeight,
      // worldWidth: 6000,
      // worldHeight: 6000,
      events: app.renderer.events,
    });

    viewport
      .drag({
        mouseButtons: 'right',
      })
      .pinch()
      .wheel()
      .decelerate()
      .clampZoom({
        minScale: this.settings.minZoom,
        maxScale: this.settings.maxZoom,
      });
    // .clamp({
    //   direction: "all",
    // });

    app.stage.addChild(viewport);

    // =================================
    // events

    viewport.addEventListener('zoomed', () => {
      // this.zoomContainer?.setAttribute("zoom", viewport.scale.x.toString());
      this.emit('sd-zoom', { detail: { zoom: viewport.scale.x } });
    });

    viewport.on('moved', () => {
      const { x, y } = viewport.center;
      this.emit('sd-move', { detail: { x, y } });
    });

    this.emitter.on('draw', ({ startX, startY, endX, endY }) => {
      this.emit('sd-draw', {
        detail: {
          startX: Math.round(startX),
          startY: Math.round(startY),
          endX: Math.round(endX),
          endY: Math.round(endY),
        },
      });
    });

    // zoomContainer.addEventListener("update-zoom", (e: Event) => {
    //   const zoom = (e as CustomEvent).detail as number;
    //   viewport.setZoom(zoom, true);
    // });

    // =================================
    // system groups

    const resources = { app, container: this.container, viewport, emitter: this.emitter };

    const inputsGroup = System.group(sys.InputReader, resources, sys.EventReceiver, resources);
    const renderGroup = System.group(
      sys.SketchTileHandler,
      resources,
      sys.SketchShapeHandler,
      resources,
      sys.SketchStrokeHandler,
      resources,
      sys.SketchFloodFillHandler,
      resources,
      sys.ViewportHandler,
      resources,
    );
    const cleanupGroup = System.group(sys.Deleter);
    const networkGroup = System.group(sys.UndoRedo);

    inputsGroup.schedule((s) => s.before(renderGroup));
    renderGroup.schedule((s) => s.before(cleanupGroup));
    cleanupGroup.schedule((s) => s.before(networkGroup));

    // =================================
    // world

    const world = await World.create({
      maxLimboComponents: 512 * 512,
      defs: [inputsGroup, renderGroup, cleanupGroup, networkGroup],
    });
    this.onDestroyCallbacks.push(() => {
      world.terminate().catch((err: unknown) => {
        console.error(err);
      });
    });

    world.build((worldSys) => {
      Object.assign(worldSys.singleton.write(comps.Settings), this.settings);

      const brush = worldSys.singleton.write(comps.Brush);
      const savedSize = localStorage.getItem('brush-size');
      if (savedSize !== null) {
        brush.size = parseInt(savedSize, 10);
      } else {
        brush.size = 25;
      }

      // brush.color = localStorage.getItem('brush-color') ?? '#D94141';

      brush.size = 10;
      brush.color = '#ffffff';
      brush.kind = BrushKindEnum.Crayon;

      const zoom = Math.min(window.innerWidth, 1000) / 2000;
      viewport.setZoom(zoom, true);
      viewport.position.set(
        window.innerWidth / 2 - this.settings.tileWidth / 4,
        window.innerHeight / 2 - this.settings.tileHeight / 4,
      );
      // this.zoomContainer?.setAttribute("zoom", zoom.toString());
    });

    // =================================
    // loop

    function loop(): void {
      if (!world.alive) {
        return;
      }

      requestAnimationFrame(loop);
      world.execute().catch((err: unknown) => {
        console.error(err);
      });
    }

    requestAnimationFrame(loop);
  }

  // destroy() {
  //   for (const cb of this.onDestroyCallbacks) {
  //     cb();
  //   }

  //   this.emitter.removeAllListeners();
  // }

  // zoomCamera(zoom: number) {
  //   emitter.emit("studio:zoom-camera", { zoom });
  // }
}

export default SketchyDrawCanvas;
