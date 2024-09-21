import { co, system } from "@lastolivegames/becsy";
import { Viewport } from "pixi-viewport";

import * as comps from "../components";
import { BaseSystem } from "./Base";

const MOUSE_TRAVEL_THRESHOLD: { [key: string]: number } = {
  mouse: 0.005,
  touch: 0.05,
  pen: 0.005,
};

@system
export class InputReader extends BaseSystem {
  private readonly input = this.singleton.write(comps.Input);

  private pointerIds: Set<number> = new Set();

  // injected via world defs
  container!: HTMLElement;
  viewport!: Viewport;

  initialize(): void {
    // ==========================================================================
    const pointerMoveFn = (e: PointerEvent) => {
      const prevPointerClient = this.input.pointerClient;
      this.input.pointerClient = [e.clientX, e.clientY];
      const pointerWorld = this.viewport.toWorld(e.clientX, e.clientY);
      this.input.pointerWorld = [pointerWorld.x, pointerWorld.y];

      if (this.pointerIds.size === 1) {
        this.input.pointerTravelDistance += distance(
          this.input.pointerClient,
          prevPointerClient
        );
        if (
          this.input.pointerTravelDistance >
            MOUSE_TRAVEL_THRESHOLD[e.pointerType] &&
          !this.input.didHaveMultiplePointersDown &&
          !this.input.pointerBeingDragged
        ) {
          this.input.pointerBeingDragged = true;
          this.setInputTrigger("pointerBeingDraggedTrigger");
        }
      }
    };

    this.container.addEventListener("pointermove", pointerMoveFn);
    this.onDestroyCallbacks.push(() =>
      this.container?.removeEventListener("pointermove", pointerMoveFn)
    );

    // ==========================================================================
    const pointerDownFn = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      // TODO detect pen eraser (e.pointerType === 'pen' && e.buttons === 32)

      this.pointerIds.add(e.pointerId);
      if (this.pointerIds.size > 1) {
        this.input.didHaveMultiplePointersDown = true;
      }

      this.input.pointerDown = true;
      this.setInputTrigger("pointerDownTrigger");

      if (this.pointerIds.size === 1) {
        this.input.pointerClient = [e.clientX, e.clientY];
        const pointerWorld = this.viewport.toWorld(e.clientX, e.clientY);
        this.input.pointerWorld = [pointerWorld.x, pointerWorld.y];
        // pointerPosition.toArray(this.input.dragStart);
      } else {
        this.input.pointerBeingDragged = false;
      }
    };

    this.container.addEventListener("pointerdown", pointerDownFn);
    this.onDestroyCallbacks.push(() =>
      this.container?.removeEventListener("pointerdown", pointerDownFn)
    );

    // ==========================================================================
    const pointerCancelFn = (e: PointerEvent) => {
      this.pointerIds.delete(e.pointerId);
      this.input.pointerDown = false;
      this.input.pointerBeingDragged = false;
      if (this.pointerIds.size === 0) {
        this.input.pointerTravelDistance = 0;
        this.input.didHaveMultiplePointersDown = false;
      }
    };

    window.document.addEventListener("pointercancel", pointerCancelFn);
    this.onDestroyCallbacks.push(() =>
      window.document.removeEventListener("pointercancel", pointerCancelFn)
    );

    // ==========================================================================
    const pointerUpFn = (e: PointerEvent) => {
      this.setInputTrigger("pointerUpTrigger");
      this.pointerIds.delete(e.pointerId);
      this.input.pointerDown = false;
      this.input.pointerBeingDragged = false;
      if (this.pointerIds.size === 0) {
        this.input.pointerTravelDistance = 0;
        this.input.didHaveMultiplePointersDown = false;
      }
    };

    window.document.addEventListener("pointerup", pointerUpFn);
    this.onDestroyCallbacks.push(() =>
      window.document.removeEventListener("pointerup", pointerUpFn)
    );

    // ==========================================================================
    const mouseDownFn = (e: MouseEvent) => {
      if (e.button === 2) {
        this.input.rightMouseDown = true;
        this.input.pointerBeingDragged = false;
        this.input.didHaveMultiplePointersDown = true;
        this.setInputTrigger("rightMouseDownTrigger");
      }
    };

    window.document.addEventListener("mousedown", mouseDownFn);
    this.onDestroyCallbacks.push(() =>
      window.document.removeEventListener("mousedown", mouseDownFn)
    );

    // ==========================================================================
    const mouseUpFn = (e: MouseEvent) => {
      if (e.button === 2) {
        this.input.rightMouseDown = false;
      }
    };

    window.document.addEventListener("mouseup", mouseUpFn);
    this.onDestroyCallbacks.push(() =>
      window.document.removeEventListener("mouseup", mouseUpFn)
    );

    // ==========================================================================

    const globalWheelFn = (ev: WheelEvent) => {
      if (this.input.modDown) {
        ev.preventDefault();
      }
    };
    window.addEventListener("wheel", globalWheelFn, { passive: false });
    this.onDestroyCallbacks.push(() =>
      window.removeEventListener("wheel", globalWheelFn)
    );

    // ==========================================================================
    const keyDownFn = (e: KeyboardEvent) => {
      const key = `${e.key === " " ? "space" : e.key.toLowerCase()}Down`;
      if (key in this.input) {
        if (!this.input[key as keyof comps.Input]) {
          const triggerKey = `${key}Trigger`;
          this.setInputTrigger(triggerKey);
        }

        Object.assign(this.input, { [key]: true });
      }

      if (e.key === "Escape") {
        this.input.pointerBeingDragged = false;
        this.input.didHaveMultiplePointersDown = true;
      }
    };
    window.addEventListener("keydown", keyDownFn);
    this.onDestroyCallbacks.push(() =>
      window.removeEventListener("keydown", keyDownFn)
    );

    const globalkeyDownFn = (e: KeyboardEvent) => {
      this.input.modDown = e.ctrlKey || e.metaKey;

      if (e.key === "z" && this.input.modDown) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", globalkeyDownFn, true);
    this.onDestroyCallbacks.push(() =>
      window.removeEventListener("keydown", globalkeyDownFn)
    );
    const globalUpDownFn = (e: KeyboardEvent) => {
      this.input.modDown = e.ctrlKey || e.metaKey;
    };
    window.addEventListener("keyup", globalUpDownFn, true);
    this.onDestroyCallbacks.push(() =>
      window.removeEventListener("keyup", globalUpDownFn)
    );

    // ==========================================================================
    const keyUpFn = (e: KeyboardEvent) => {
      const key = `${e.key === " " ? "space" : e.key.toLowerCase()}Down`;
      if (key in this.input) {
        Object.assign(this.input, { [key]: false });
      }
    };
    window.addEventListener("keyup", keyUpFn);
    this.onDestroyCallbacks.push(() =>
      window.removeEventListener("keyup", keyUpFn)
    );
  }

  @co *setInputTrigger(triggerKey: string) {
    if (!(triggerKey in this.input)) return;

    Object.assign(this.input, { [triggerKey]: true });

    yield co.waitForFrames(1);

    Object.assign(this.input, { [triggerKey]: false });

    yield;
  }
}

function distance(a: [number, number], b: [number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}
