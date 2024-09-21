import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/range/range.js';
import type { TemplateResult } from 'lit';
import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import install from '@twind/with-web-components';
import config from './twind.config.js';

const withTwind = install(config);

@customElement('bottom-zoom')
@withTwind
class BottomZoom extends LitElement {
  public static styles = css`
    .slider {
      -webkit-appearance: none;
      width: 4px;
      height: 25px;
      background: var(--gray-medium);
      outline: none;
      opacity: 0.7;
      -webkit-transition: 0.2s;
      transition: opacity 0.2s;
    }

    .slider:hover {
      opacity: 1;
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 15px;
      height: 15px;
      border-radius: 9999px;
      background: var(--gray-dark);
      cursor: pointer;
    }

    .slider::-webkit-slider-thumb:hover {
      background: var(--primary-color);
    }

    .slider::-moz-range-thumb {
      width: 15px;
      height: 15px;
      border-radius: 9999px;
      background: var(--gray-dark);
      cursor: pointer;
    }

    .slider::-moz-range-thumb:hover {
      background: var(--primary-color);
    }
  `;

  @property({ type: Number })
  public zoom = 1;

  @property({ type: Number, attribute: 'min-zoom' })
  public minZoom = 0.1;

  @property({ type: Number, attribute: 'max-zoom' })
  public maxZoom = 10;

  @query('input')
  private readonly input!: HTMLInputElement;

  public attributeChangedCallback(name: string, oldVal: string, newVal: string): void {
    if (name === 'zoom') {
      this.input.value = Math.log(parseFloat(newVal)).toString();
    }

    // eslint-disable-next-line wc/guard-super-call
    super.attributeChangedCallback(name, oldVal, newVal);
  }

  protected render(): TemplateResult {
    return html`
      <div
        class="hidden md:flex flex-col items-center justify-center h-32 w-8 py-4 m-2 bg-toolbar rounded-full shadow-md cursor-default bg-cover pointer-events-auto"
        @pointerdown=${this.handlePointerDown}
      >
        <sl-icon
          class="text-base text-gray-medium cursor-pointer hover:text-primary"
          library="fa"
          name="fas-plus"
          @click=${this.handlePlusClick}
        ></sl-icon>
        <input
          class="h-16 my-2 slider"
          style="writing-mode: vertical-lr; direction: rtl"
          type="range"
          orient="vertical"
          min=${Math.log(this.minZoom)}
          step="0.01"
          max=${Math.log(this.maxZoom)}
          .value=${Math.log(this.zoom).toString()}
          @input=${this.handleZoomSliderInput}
        />
        <sl-icon
          class="text-base text-gray-medium cursor-pointer hover:text-primary"
          library="fa"
          name="fas-minus"
          @click=${this.handleMinusClick}
        ></sl-icon>
      </div>
    `;
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  private handlePointerDown(ev: PointerEvent): void {
    ev.stopPropagation();
  }

  private handlePlusClick(): void {
    const zoom = Math.min(this.maxZoom, this.zoom * 1.5);
    this.updateZoom(zoom);
  }

  private handleZoomSliderInput(ev: InputEvent): void {
    const target = ev.target as HTMLInputElement;
    const zoom = Math.exp(parseFloat(target.value));
    this.updateZoom(zoom);
  }

  private handleMinusClick(): void {
    const zoom = Math.max(this.minZoom, this.zoom / 1.5);
    this.updateZoom(zoom);
  }

  private updateZoom(zoom: number): void {
    this.zoom = zoom;

    this.input.value = Math.log(zoom).toString();

    const updateZoomEvent = new CustomEvent('update-zoom', {
      detail: zoom,
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(updateZoomEvent);
  }
}

export default BottomZoom;
