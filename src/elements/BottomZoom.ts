import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/range/range.js";

import install from "@twind/with-web-components";
import config from "./twind.config";

const withTwind = install(config);

@customElement("bottom-zoom")
@withTwind
export class BottomZoom extends LitElement {
  static styles = css`
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
  zoom = 1;

  minZoom = 0.1;
  maxZoom = 10;

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (name === "zoom") {
      const input = this.renderRoot?.querySelector("input") as HTMLInputElement;
      input.value = Math.log(parseFloat(newVal)).toString();
    }

    super.attributeChangedCallback(name, oldVal, newVal);
  }

  protected render() {
    return html`
      <div
        class="hidden md:flex flex-col items-center justify-center h-32 w-8 py-4 m-2 bg-toolbar rounded-full shadow-md cursor-default bg-cover pointer-events-auto"
        @pointerdown=${(ev: PointerEvent) => ev.stopPropagation()}
      >
        <sl-icon
          class="text-base text-gray-medium cursor-pointer hover:text-primary"
          library="fa"
          name="fas-plus"
          @click=${() => {
            const zoom = Math.min(this.maxZoom, this.zoom * 1.5);
            this.updateZoom(zoom);
          }}
        ></sl-icon>
        <input
          class="h-16 my-2 slider"
          style="writing-mode: vertical-lr; direction: rtl"
          type="range"
          orient="vertical"
          min=${Math.log(this.minZoom)}
          step="0.01"
          max=${Math.log(this.maxZoom)}
          value=${Math.log(this.zoom).toString()}
          @input=${(ev: InputEvent) => {
            const target = ev.target as HTMLInputElement;
            const zoom = Math.exp(parseFloat(target.value));
            this.updateZoom(zoom);
          }}
        />
        <sl-icon
          class="text-base text-gray-medium cursor-pointer hover:text-primary"
          library="fa"
          name="fas-minus"
          @click=${() => {
            const zoom = Math.max(this.minZoom, this.zoom / 1.5);
            this.updateZoom(zoom);
          }}
        ></sl-icon>
      </div>
    `;
  }

  updateZoom(zoom: number) {
    this.zoom = zoom;

    const input = this.renderRoot?.querySelector("input") as HTMLInputElement;
    input.value = Math.log(zoom).toString();

    const updateZoomEvent = new CustomEvent("update-zoom", {
      detail: zoom,
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(updateZoomEvent);
  }
}
