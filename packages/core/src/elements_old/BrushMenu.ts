// import { LitElement, css, html } from "lit";
// import { customElement, state } from "lit/decorators.js";
// import install from "@twind/with-web-components";
// import { styleMap } from "lit/directives/style-map.js";

// import "@shoelace-style/shoelace/dist/components/icon/icon.js";
// import "@shoelace-style/shoelace/dist/components/tooltip/tooltip.js";
// import "@shoelace-style/shoelace/dist/components/color-picker/color-picker.js";
// import "@shoelace-style/shoelace/dist/components/range/range.js";
// import config from "./twind.config";

// const withTwind = install(config);

// @customElement("brush-menu")
// @withTwind
// export class BrushMenu extends LitElement {
//   @state()
//   brushSize = 25;

//   colors: string[] = ["#D94141", "#fff5db", "#bedf99", "#404040", "#000000"];

//   @state()
//   selectedIndex = 0;

//   static styles = css`
//     sl-color-picker::part(trigger) {
//       border-radius: 0;
//       width: 52px;
//       height: 48px;
//       border-top-right-radius: 0.375rem;
//       margin-top: 3px;
//     }
//     sl-color-picker::part(trigger):before {
//       box-shadow: none;
//       margin: 0;
//       background: conic-gradient(red, orange, yellow, green, blue, violet, red);
//     }
//   `;

//   connectedCallback() {
//     super.connectedCallback();
//     setTimeout(() => {
//       const colorPicker = this.renderRoot.querySelector("sl-color-picker");
//       colorPicker?.addEventListener(
//         "sl-change",
//         this.handleColorChange.bind(this)
//       );

//       const sizeRange = this.renderRoot.querySelector("sl-range");
//       sizeRange?.addEventListener(
//         "sl-change",
//         this.handleSizeChange.bind(this)
//       );

//       // load from local storage
//       const storedBrushSize = localStorage.getItem("brush-size");
//       if (storedBrushSize) {
//         this.brushSize = parseInt(storedBrushSize);
//       }

//       const storedColors = localStorage.getItem("colors");
//       if (storedColors) {
//         const c = JSON.parse(storedColors);
//         for (let i = 0; i < c.length; i++) {
//           this.colors[i] = c[i];
//         }
//       }

//       const storedSelectedIndex = localStorage.getItem("selected-index");
//       if (storedSelectedIndex) {
//         this.selectedIndex = parseInt(storedSelectedIndex);
//       }
//     }, 0);
//   }

//   protected render() {
//     return html`
//       <!-- <div class="flex items-center gap-4"> -->
//       <!-- <sl-range
//           class="flex-1 pl-4"
//           min="5"
//           max="50"
//           step="5"
//           value=${this.brushSize}
//           style="--track-color-active: var(--primary-color); --track-color-inactive: #97989c;"
//         ></sl-range> -->

//       <div class="flex w-fit items-center">
//         ${this.colors.map(
//           (color, index) => html`
//             <div
//               class="h-12 w-12 mt-0 cursor-pointer transition-all data-[selected=true]:-mt-2 data-[selected=true]:h-14 data-[selected=true]:rounded-t-md first:rounded-tl-md"
//               style=${styleMap({ backgroundColor: color })}
//               data-selected=${this.selectedIndex === index}
//               @click=${() => {
//                 this.handleIndexChange(index);
//               }}
//             ></div>
//           `
//         )}
//         <!-- <div class="flex items-center justify-center h-12 w-12 bg-black">
//           <sl-icon
//             class="text-white text-xl"
//             name="fas-sliders"
//             library="fa"
//           ></sl-icon>
//         </div> -->
//         <sl-color-picker
//           size="medium"
//           label="Select a color"
//           swatches="#d0021b; #f5a623; #f8e71c; #8b572a; #7ed321; #417505; #bd10e0; #9013fe; #4a90e2; #50e3c2; #b8e986; #000; #444; #888; #ccc; #fff;"
//           value=${this.colors[this.selectedIndex]}
//           hoist
//           no-format-toggle
//         ></sl-color-picker>
//       </div>
//       <!-- </div> -->
//     `;
//   }

//   private handleColorChange(event: Event) {
//     const target = event.target as HTMLInputElement;
//     this.setColor(target.value);
//   }

//   private handleIndexChange(index: number) {
//     this.selectedIndex = index;
//     this.setColor(this.colors[index]);
//     localStorage.setItem("selected-index", this.selectedIndex.toString());
//   }

//   private setColor(color: string) {
//     this.colors[this.selectedIndex] = color;
//     this.requestUpdate();
//     const colorChangeEvent = new CustomEvent("color-change", {
//       detail: color,
//       bubbles: true,
//       composed: true,
//     });

//     this.dispatchEvent(colorChangeEvent);

//     localStorage.setItem("colors", JSON.stringify(this.colors));
//   }

//   private handleSizeChange(event: Event) {
//     const target = event.target as HTMLInputElement;
//     this.brushSize = parseInt(target.value);
//     const sizeChangeEvent = new CustomEvent("size-change", {
//       detail: target.value,
//       bubbles: true,
//       composed: true,
//     });

//     this.dispatchEvent(sizeChangeEvent);

//     localStorage.setItem("brush-size", this.brushSize.toString());
//   }
// }
