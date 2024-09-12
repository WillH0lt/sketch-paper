import { Emitter } from "strict-event-emitter";
import { World, System } from "@lastolivegames/becsy";
import "@shoelace-style/shoelace/dist/themes/light.css";
import { registerIconLibrary } from "@shoelace-style/shoelace/dist/utilities/icon-library.js";
import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";

import * as comps from "./components";
import * as sys from "./systems";
import type { Settings, Brush } from "./types";
import { BrushKind } from "./enums";
import { emitter } from "./Emitter";
import "./elements";

registerIconLibrary("fa", {
  resolver: (name) => {
    const filename = name.replace(/^fa[rbs]-/, "");
    let folder = "regular";
    if (name.substring(0, 4) === "fas-") folder = "solid";
    if (name.substring(0, 4) === "fab-") folder = "brands";
    return `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/svgs/${folder}/${filename}.svg`;
  },
  mutator: (svg) => svg.setAttribute("fill", "currentColor"),
});

type Events = {
  // "select-image": [void];
  // "add-tile": [Tile];
  // "update-tile": [Tile];
  // "remove-tile": [Tile];
};

type StudioEmitter = Emitter<Events>;

export class Studio extends (Emitter as { new (): StudioEmitter }) {
  private toolbar: HTMLElement | null = null;
  private zoomContainer: HTMLElement | null = null;
  private onDestroyCallbacks: (() => void)[] = [];

  async initialize(container: HTMLElement, settings: Settings) {
    // =================================
    // toolbar

    const toolbar = document.createElement("bottom-toolbar");
    toolbar.style.position = "absolute";
    toolbar.style.bottom = "0";
    toolbar.style.width = "100%";
    toolbar.style.zIndex = "20";
    toolbar.style.pointerEvents = "none";
    container.appendChild(toolbar);
    this.toolbar = toolbar;
    toolbar.addEventListener("update-brush", (e: Event) => {
      const brush = (e as CustomEvent).detail as Brush;
      emitter.emit("studio:update-brush", brush);
    });

    const zoomContainer = document.createElement("bottom-zoom");
    zoomContainer.style.position = "fixed";
    zoomContainer.style.bottom = "0";
    zoomContainer.style.right = "0";
    zoomContainer.style.zIndex = "20";
    zoomContainer.style.pointerEvents = "none";
    zoomContainer.setAttribute("minZoom", settings.minZoom.toString());
    zoomContainer.setAttribute("maxZoom", settings.maxZoom.toString());
    container.appendChild(zoomContainer);
    this.zoomContainer = zoomContainer;

    // =================================
    // events

    // emitter.on("toolbar:change-brush", (event: Partial<Brush>) => {
    //   if (event.color) {
    //     localStorage.setItem("brush-color", event.color);
    //   }
    //   if (event.size) {
    //     localStorage.setItem("brush-size", event.size.toString());
    //   }
    // });

    // emitter.on("camera:zoom-changed", (zoom: number) => {
    //   this.zoomContainer?.setAttribute("zoom", zoom.toString());
    // });

    // =================================
    // pixi app

    const div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.position = "absolute";
    div.style.top = "0";
    div.style.left = "0";
    div.addEventListener("contextmenu", (e) => e.preventDefault());
    container.prepend(div);

    const app = new PIXI.Application();
    await app.init({
      autoStart: false,
      preference: "webgl",
    });
    app.renderer.canvas.style.width = "100%";
    app.renderer.canvas.style.height = "100%";
    div.appendChild(app.renderer.canvas);
    app.renderer.background.color = 0xebecf0;

    const viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      // worldWidth: 6000,
      // worldHeight: 6000,
      events: app.renderer.events,
    });

    viewport
      .drag({
        mouseButtons: "right",
      })
      .pinch()
      .wheel()
      .decelerate()
      .clampZoom({
        minScale: settings.minZoom,
        maxScale: settings.maxZoom,
      });
    // .clamp({
    //   direction: "all",
    // });

    app.stage.addChild(viewport);

    viewport.addEventListener("zoomed", () => {
      this.zoomContainer?.setAttribute("zoom", viewport.scale.x.toString());
    });

    zoomContainer.addEventListener("update-zoom", (e: Event) => {
      const zoom = (e as CustomEvent).detail as number;
      viewport.setZoom(zoom, true);
    });

    // =================================
    // system groups

    const resources = { app, container, viewport };

    const inputsGroup = System.group(
      sys.InputReader,
      resources,
      sys.EventReceiver,
      resources
    );
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
      resources
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
      world.terminate();
    });

    world.build((worldSys) => {
      Object.assign(worldSys.singleton.write(comps.Settings), settings);

      const brush = worldSys.singleton.write(comps.Brush);
      brush.size = localStorage.getItem("brush-size")
        ? parseInt(localStorage.getItem("brush-size")!)
        : 25;
      brush.color = localStorage.getItem("brush-color") || "#D94141";
      brush.kind = BrushKind.Marker;

      const zoom = Math.min(window.innerWidth, 1000) / 2000;
      viewport.setZoom(zoom, true);
      viewport.position.set(
        window.innerWidth / 2 - settings.tileWidth / 4,
        window.innerHeight / 2 - settings.tileHeight / 4
      );
      this.zoomContainer?.setAttribute("zoom", zoom.toString());

      // worldSys.createEntity(comps.Tile);
    });

    // =================================
    // loop

    function loop() {
      if (!world.alive) {
        return;
      }

      requestAnimationFrame(loop);
      world.execute();
    }

    requestAnimationFrame(loop);
  }

  destroy() {
    for (const cb of this.onDestroyCallbacks) {
      cb();
    }

    this.removeAllListeners();
    emitter.removeAllListeners();
  }

  // zoomCamera(zoom: number) {
  //   emitter.emit("studio:zoom-camera", { zoom });
  // }

  hideToolbar() {
    this.toolbar?.style.setProperty("display", "none");
    this.zoomContainer?.style.setProperty("display", "none");
  }

  showToolbar() {
    this.toolbar?.style.setProperty("display", "block");
    this.zoomContainer?.style.setProperty("display", "block");
  }
}
