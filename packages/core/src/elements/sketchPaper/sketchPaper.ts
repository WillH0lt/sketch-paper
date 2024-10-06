import { System, World } from '@lastolivegames/becsy';
import { primaryInput } from 'detect-it';
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
import { BrushKinds, PointerActions, WheelActions, defaultSettings } from '../../types.js';
import SpBaseElement from '../base/sketchPaperBase.js';

const maxWorldCoord = 2 ** 31;
function getBoundedCoord(v: number): number {
  let boundedV = v;
  if (Math.abs(v) > maxWorldCoord) {
    boundedV = -1 * Math.sign(v) * maxWorldCoord + ((v - maxWorldCoord) % (2 * maxWorldCoord));
  }

  return boundedV;
}
function getBoundedCoords(x: number, y: number): [number, number] {
  return [getBoundedCoord(x), getBoundedCoord(y)];
}

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

  @property({ attribute: 'brush-kind', type: BrushKinds })
  private readonly brushKind: BrushKinds = BrushKinds.None;

  @property({ attribute: 'brush-size', type: Number })
  private readonly brushSize = 10;

  @property({ attribute: 'action-left-mouse', type: PointerActions })
  private readonly actionLeftMouse: PointerActions = PointerActions.Draw;

  @property({ attribute: 'action-middle-mouse', type: PointerActions })
  private readonly actionMiddleMouse: PointerActions = PointerActions.Pan;

  @property({ attribute: 'action-right-mouse', type: PointerActions })
  private readonly actionRightMouse: PointerActions = PointerActions.Pan;

  @property({ attribute: 'action-wheel', type: WheelActions })
  private readonly actionWheel: WheelActions = WheelActions.Zoom;

  @query('#container')
  private readonly container!: HTMLDivElement;

  private readonly emitter = new Emitter<Events>();

  private app: PIXI.Application | null = null;

  private settings: Settings = defaultSettings;

  private viewport: Viewport | null = null;

  private readonly brushInstances = new Map<BrushKinds, BaseBrush>();

  private readonly onDestroyCallbacks: (() => void)[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public attributeChangedCallback(name: string, _old: string | null, _value: string | null): void {
    super.attributeChangedCallback(name, _old, _value);

    if (name.startsWith('brush-')) {
      this.updateBrush(name);
    } else if (name.startsWith('action-')) {
      this.updateControls();
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
    const [boundedX, boundedY] = getBoundedCoords(x, y);
    this.viewport?.moveCenter(boundedX, boundedY);
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

    this.updateControls();

    app.stage.addChild(viewport);

    // =================================
    // brushes

    await Promise.all(this.settings.brushes.map(async (kind) => this.loadBrush(kind))).catch(
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

      const [boundedX, boundedY] = getBoundedCoords(x, y);

      if (x !== boundedX || y !== boundedY) {
        viewport.moveCenter(boundedX, boundedY);
      }

      this.emit('sp-move', { detail: { x: Math.round(boundedX), y: Math.round(boundedY) } });
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
    const undoGroup = System.group(sys.UndoRedo);

    inputsGroup.schedule((s) => s.before(renderGroup));
    renderGroup.schedule((s) => s.before(cleanupGroup));
    cleanupGroup.schedule((s) => s.before(undoGroup));

    // =================================
    // world

    const world = await World.create({
      maxLimboComponents: 512 * 512,
      defs: [inputsGroup, renderGroup, cleanupGroup, undoGroup],
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

      Object.assign(worldSys.singleton.write(comps.InputSettings), {
        actionLeftMouse: this.actionLeftMouse,
        actionMiddleMouse: this.actionMiddleMouse,
        actionRightMouse: this.actionRightMouse,
        actionWheel: this.actionWheel,
      });

      const zoom = Math.min(window.innerWidth, 1000) / 2000;
      viewport.setZoom(zoom, true);
      const [startX, startY] = getBoundedCoords(this.settings.startX, this.settings.startY);
      viewport.moveCenter(startX, startY);
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

  private async loadBrush(kind: BrushKinds): Promise<void> {
    if (!this.app) {
      throw new Error('App not initialized');
    }

    if (this.brushInstances.has(kind)) {
      throw new Error(`Brush of kind ${kind} already loaded`);
    }

    if (kind === BrushKinds.Crayon) {
      const brush = new CrayonBrush(this.app);
      await brush.init();
      this.brushInstances.set(kind, brush);
    } else {
      throw new Error(`Brush of kind ${kind} not implemented`);
    }
  }

  private updateBrush(fieldName: string): void {
    if (fieldName === 'brush-color') {
      const [red, green, blue, alpha] = hexToRgba(this.brushColor);
      this.emitter.emit('update-brush', {
        red,
        green,
        blue,
        alpha,
      });
    } else if (fieldName === 'brush-size') {
      this.emitter.emit('update-brush', {
        size: this.brushSize,
      });
    } else if (fieldName === 'brush-kind') {
      this.emitter.emit('update-brush', {
        kind: this.brushKind,
      });
    }
  }

  private updateControls(): void {
    const mouseButtons = [];
    if (this.actionLeftMouse === PointerActions.Pan) {
      mouseButtons.push('left');
    }
    if (this.actionMiddleMouse === PointerActions.Pan) {
      mouseButtons.push('middle');
    }
    if (this.actionRightMouse === PointerActions.Pan) {
      mouseButtons.push('right');
    }

    let dragEnabled = true;
    if (primaryInput === 'mouse') {
      dragEnabled = mouseButtons.length > 0;
    } else {
      dragEnabled = this.actionLeftMouse === PointerActions.Pan;
    }

    this.viewport?.drag({
      mouseButtons: mouseButtons.join('|'),
      factor: Number(dragEnabled),
      wheel: this.actionWheel === WheelActions.Scroll,
    });

    this.viewport?.wheel({
      smooth: 8,
      wheelZoom: this.actionWheel === WheelActions.Zoom,
    });

    this.viewport
      ?.pinch()
      .decelerate({
        friction: 0.95,
        minSpeed: 0.1,
      })
      .clampZoom({
        minScale: this.settings.minZoom,
        maxScale: this.settings.maxZoom,
      });

    this.emitter.emit('update-input-settings', {
      actionLeftMouse: this.actionLeftMouse,
      actionMiddleMouse: this.actionMiddleMouse,
      actionRightMouse: this.actionRightMouse,
      actionWheel: this.actionWheel,
    });

    // if (this.mode === InteractionModeEnum.Pan) {
    //   this.viewport?.drag({ mouseButtons: 'left|right' });
    // } else {
    //   this.viewport?.drag({ mouseButtons: 'right' });
    // }
  }
}

export default SketchPaper;
