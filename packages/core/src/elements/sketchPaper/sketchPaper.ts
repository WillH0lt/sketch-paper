import { System, World } from '@lastolivegames/becsy';
import type { TemplateResult } from 'lit';
import { css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import { Emitter } from 'strict-event-emitter';

import type { BaseBrush } from '@sketch-paper/brushes';
import { CrayonBrush } from '@sketch-paper/brushes';
import * as comps from '../../components/index.js';
import { hexToNumber, hexToRgba } from '../../systems/common.js';
import * as sys from '../../systems/index.js';
import type { DrawSegment, Events, Settings, Tile } from '../../types.js';
import { BrushKindEnum, InteractionModeEnum, defaultSettings } from '../../types.js';
import SpBaseElement from '../base/sketchPaperBase.js';

@customElement('sketch-paper')
class SketchPaper extends SpBaseElement {
  public static styles = css`
    canvas {
      display: block;
      vertical-align: middle;
    }
  `;

  @property({ attribute: 'brush-color', type: String })
  private readonly brushColor = '#000000';

  @property({ attribute: 'brush-kind', type: BrushKindEnum })
  private readonly brushKind: BrushKindEnum = BrushKindEnum.None;

  @property({ attribute: 'brush-size', type: Number })
  private readonly brushSize = 10;

  @property({ attribute: 'interaction-mode', type: InteractionModeEnum })
  private readonly mode: InteractionModeEnum = InteractionModeEnum.Draw;

  @query('#container')
  private readonly container!: HTMLDivElement;

  private readonly emitter = new Emitter<Events>();

  private app: PIXI.Application | null = null;

  private settings: Settings = defaultSettings;

  private viewport: Viewport | null = null;

  private readonly brushInstances = new Map<BrushKindEnum, BaseBrush>();

  private readonly onDestroyCallbacks: (() => void)[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public attributeChangedCallback(name: string, _old: string | null, _value: string | null): void {
    super.attributeChangedCallback(name, _old, _value);

    if (name.startsWith('brush-')) {
      this.handleBrushUpdate(name);
    } else if (name === 'interaction-mode') {
      this.handleModeUpdate();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const cb of this.onDestroyCallbacks) {
      cb();
    }
  }

  public draw(segments: DrawSegment[]): void {
    this.emitter.emit('draw-incoming', segments);
  }

  public move(x: number, y: number): void {
    this.viewport?.moveCenter(x, y);
  }

  public async initialize(settings: Partial<Settings>): Promise<void> {
    await this.updateComplete;

    this.settings = { ...this.settings, ...settings };

    // =================================
    // pixi app

    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    const app = new PIXI.Application();
    this.app = app;
    this.onDestroyCallbacks.push(() => {
      app.destroy();
    });
    await app.init({
      autoStart: false,
      preference: 'webgl',
    });
    app.renderer.canvas.style.width = '100%';
    app.renderer.canvas.style.height = '100%';
    this.container.appendChild(app.renderer.canvas);
    app.renderer.background.color = hexToNumber(this.settings.backgroundColor);

    const viewport = new Viewport({
      events: app.renderer.events,
    });
    this.viewport = viewport;

    viewport
      .drag({
        mouseButtons: 'left',
      })
      .pinch()
      .wheel({
        smooth: 8,
      })
      .decelerate({
        friction: 0.95,
        minSpeed: 0.1,
      })
      .clampZoom({
        minScale: settings.minZoom,
        maxScale: settings.maxZoom,
      });

    app.stage.addChild(viewport);

    // =================================
    // brushes

    Promise.all(this.settings.brushes.map(async (kind) => this.loadBrush(kind))).catch(
      (err: unknown) => {
        console.error(err);
      },
    );

    // =================================
    // events

    viewport.addEventListener('zoomed', () => {
      this.emit('sp-zoom', { detail: { zoom: viewport.scale.x } });
    });

    viewport.on('moved', () => {
      const { x, y } = viewport.center;
      this.emit('sp-move', { detail: { x: Math.round(x), y: Math.round(y) } });
    });

    this.emitter.on('draw-outgoing', (segments: DrawSegment[]) => {
      this.emit('sp-draw', {
        detail: segments,
      });
    });

    this.emitter.on('tile-load', (tile: Tile) => {
      this.emit('sp-tile-load', {
        detail: tile,
      });
    });

    // =================================
    // system groups

    const resources = {
      app: this.app,
      container: this.container,
      viewport: this.viewport,
      emitter: this.emitter,
      brushInstances: this.brushInstances,
    };

    const inputsGroup = System.group(sys.InputReader, resources, sys.EventReceiver, resources);
    const renderGroup = System.group(
      sys.SketchTileHandler,
      resources,
      sys.SketchStrokeHandler,
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

      const [red, green, blue, alpha] = hexToRgba(this.brushColor);
      Object.assign(worldSys.singleton.write(comps.Brush), {
        size: this.brushSize,
        red,
        green,
        blue,
        alpha,
        kind: this.brushKind,
      });

      const zoom = Math.min(window.innerWidth, 1000) / 2000;
      viewport.setZoom(zoom, true);
      viewport.moveCenter(this.settings.startX, this.settings.startY);
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

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  protected render(): TemplateResult {
    return html` <div id="container" style="width: 100%; height: 100%;"></div> `;
  }

  private async loadBrush(kind: BrushKindEnum): Promise<void> {
    if (!this.app) {
      throw new Error('App not initialized');
    }

    if (this.brushInstances.has(kind)) {
      throw new Error(`Brush of kind ${kind} already loaded`);
    }

    if (kind === BrushKindEnum.Crayon) {
      const brush = new CrayonBrush(this.app);
      await brush.init();
      this.brushInstances.set(kind, brush);
    } else {
      throw new Error(`Brush of kind ${kind} not implemented`);
    }
  }

  private handleBrushUpdate(name: string): void {
    if (name === 'brush-color') {
      const [red, green, blue, alpha] = hexToRgba(this.brushColor);
      this.emitter.emit('update-brush', {
        red,
        green,
        blue,
        alpha,
      });
    } else if (name === 'brush-size') {
      this.emitter.emit('update-brush', {
        size: this.brushSize,
      });
    } else if (name === 'brush-kind') {
      this.emitter.emit('update-brush', {
        kind: this.brushKind,
      });
    }
  }

  private handleModeUpdate(): void {
    if (this.mode === InteractionModeEnum.Pan) {
      this.viewport?.drag({ mouseButtons: 'left' });
    } else {
      this.viewport?.drag({ mouseButtons: 'right' });
    }
  }
}

export default SketchPaper;
