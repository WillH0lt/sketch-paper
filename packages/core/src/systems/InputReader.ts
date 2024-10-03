import { co, system } from '@lastolivegames/becsy';
import type { Viewport } from 'pixi-viewport';

import * as comps from '../components/index.js';
import { PointerActions } from '../types.js';
import BaseSystem from './Base.js';

@system
class InputReader extends BaseSystem {
  public container!: HTMLElement;

  public viewport!: Viewport;

  private readonly input = this.singleton.write(comps.Input);

  private readonly inputSettings = this.singleton.read(comps.InputSettings);

  private readonly pointerIds = new Set<number>();

  @co private *setInputTrigger(triggerKey: string): Generator {
    if (!(triggerKey in this.input)) return;

    Object.assign(this.input, { [triggerKey]: true });

    yield co.waitForFrames(1);

    Object.assign(this.input, { [triggerKey]: false });

    yield;
  }

  public initialize(): void {
    // ==========================================================================
    const pointerMoveFn = (e: PointerEvent): void => {
      const pointerWorld = this.viewport.toWorld(e.offsetX, e.offsetY);
      this.input.pointerWorld = [pointerWorld.x, pointerWorld.y];
    };

    this.container.addEventListener('pointermove', pointerMoveFn);
    this.onDestroyCallbacks.push(() => {
      this.container.removeEventListener('pointermove', pointerMoveFn);
    });

    // ==========================================================================
    const pointerDownFn = (e: PointerEvent): void => {
      const mouseButtons = [];
      if (this.inputSettings.actionLeftMouse === PointerActions.Draw) {
        mouseButtons.push(0);
      }
      if (this.inputSettings.actionMiddleMouse === PointerActions.Draw) {
        mouseButtons.push(1);
      }
      if (this.inputSettings.actionRightMouse === PointerActions.Draw) {
        mouseButtons.push(2);
      }

      if (e.pointerType === 'mouse' && !mouseButtons.includes(e.button)) return;

      // TODO detect pen eraser (e.pointerType === 'pen' && e.buttons === 32)

      this.pointerIds.add(e.pointerId);

      this.input.pointerDown = true;
      this.setInputTrigger('pointerDownTrigger');

      if (this.pointerIds.size === 1) {
        const pointerWorld = this.viewport.toWorld(e.offsetX, e.offsetY);
        this.input.pointerWorld = [pointerWorld.x, pointerWorld.y];
      }
    };

    this.container.addEventListener('pointerdown', pointerDownFn);
    this.onDestroyCallbacks.push(() => {
      this.container.removeEventListener('pointerdown', pointerDownFn);
    });

    // ==========================================================================
    const pointerCancelFn = (e: PointerEvent): void => {
      this.pointerIds.delete(e.pointerId);
      this.input.pointerDown = false;
    };

    window.document.addEventListener('pointercancel', pointerCancelFn);
    this.onDestroyCallbacks.push(() => {
      window.document.removeEventListener('pointercancel', pointerCancelFn);
    });

    // ==========================================================================
    const pointerUpFn = (e: PointerEvent): void => {
      this.setInputTrigger('pointerUpTrigger');
      this.pointerIds.delete(e.pointerId);
      this.input.pointerDown = false;
    };

    window.document.addEventListener('pointerup', pointerUpFn);
    this.onDestroyCallbacks.push(() => {
      window.document.removeEventListener('pointerup', pointerUpFn);
    });

    // ==========================================================================

    const globalWheelFn = (ev: WheelEvent): void => {
      if (this.input.modDown) {
        ev.preventDefault();
      }
    };
    window.addEventListener('wheel', globalWheelFn, { passive: false });
    this.onDestroyCallbacks.push(() => {
      window.removeEventListener('wheel', globalWheelFn);
    });

    // ==========================================================================
    const keyDownFn = (e: KeyboardEvent): void => {
      const key = `${e.key === ' ' ? 'space' : e.key.toLowerCase()}Down`;
      if (key in this.input) {
        if (this.input[key as keyof comps.Input] === false) {
          const triggerKey = `${key}Trigger`;
          this.setInputTrigger(triggerKey);
        }

        Object.assign(this.input, { [key]: true });
      }
    };
    window.addEventListener('keydown', keyDownFn);
    this.onDestroyCallbacks.push(() => {
      window.removeEventListener('keydown', keyDownFn);
    });

    const globalkeyDownFn = (e: KeyboardEvent): void => {
      this.input.modDown = e.ctrlKey || e.metaKey;

      if (e.key === 'z' && this.input.modDown) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', globalkeyDownFn, true);
    this.onDestroyCallbacks.push(() => {
      window.removeEventListener('keydown', globalkeyDownFn);
    });
    const globalUpDownFn = (e: KeyboardEvent): void => {
      this.input.modDown = e.ctrlKey || e.metaKey;
    };
    window.addEventListener('keyup', globalUpDownFn, true);
    this.onDestroyCallbacks.push(() => {
      window.removeEventListener('keyup', globalUpDownFn);
    });

    // ==========================================================================
    const keyUpFn = (e: KeyboardEvent): void => {
      const key = `${e.key === ' ' ? 'space' : e.key.toLowerCase()}Down`;
      if (key in this.input) {
        Object.assign(this.input, { [key]: false });
      }
    };
    window.addEventListener('keyup', keyUpFn);
    this.onDestroyCallbacks.push(() => {
      window.removeEventListener('keyup', keyUpFn);
    });
  }
}

export default InputReader;
