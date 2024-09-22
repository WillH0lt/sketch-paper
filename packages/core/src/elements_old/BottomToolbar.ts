// import '@shoelace-style/shoelace/dist/components/color-picker/color-picker.js';
// import '@shoelace-style/shoelace/dist/components/icon/icon.js';
// import '@shoelace-style/shoelace/dist/components/range/range.js';
// import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
// import type { TemplateResult } from 'lit';
// import { LitElement, html } from 'lit';
// import { customElement, property, query } from 'lit/decorators.js';

// import install from '@twind/with-web-components';
// import type { Brush } from '../types.js';
// import { BrushKindEnum as BrushKind } from '../types.js';
// import config from './twind.config.js';

// const shapes = [
//   {
//     kind: BrushKind.Line,
//     iconLibrary: 'fa',
//     icon: 'fas-minus',
//     tooltip: 'Line',
//   },
//   {
//     kind: BrushKind.Rectangle,
//     iconLibrary: 'fa',
//     icon: 'square',
//     tooltip: 'Rectangle',
//   },
//   {
//     kind: BrushKind.Ellipse,
//     iconLibrary: 'fa',
//     icon: 'circle',
//     tooltip: 'Ellipse',
//   },
//   {
//     kind: BrushKind.Star,
//     iconLibrary: 'fa',
//     icon: 'star',
//     tooltip: 'Ellipse',
//   },
// ];

// const withTwind = install(config);

// @customElement('bottom-toolbar')
// @withTwind
// class BottomToolbar extends LitElement {
//   @property()
//   public brush: Brush = {
//     kind: BrushKind.Marker,
//     color: '#000000',
//     size: 25,
//   };

//   @query('#brushToolsContainer')
//   private readonly container!: HTMLElement;

//   protected render(): TemplateResult {
//     const arrows = [
//       {
//         text: 'next',
//         iconLibrary: 'fa',
//         icon: 'fas-arrow-right-long',
//         handleClick: (): void => {
//           const container = this.shadowRoot?.getElementById('brushToolsContainer');
//           container?.scrollBy({ left: 1000, behavior: 'smooth' });
//         },
//       },
//       {
//         text: 'back',
//         iconLibrary: 'fa',
//         icon: 'fas-arrow-left-long',
//         handleClick: (): void => {
//           const container = this.shadowRoot?.getElementById('brushToolsContainer');
//           container?.scrollBy({ left: -1000, behavior: 'smooth' });
//         },
//       },
//     ];

//     // <!-- <div class="h-screen pt-[calc(100vh-96px)] m-2 pointer-events-none">
//     //   <div
//     //     class="h-full max-w-[600px] bg-black rounded-xl shadow-md cursor-default pointer-events-auto bg-cover"
//     //     @pointerdown=${(ev: PointerEvent) => ev.stopPropagation()}
//     //   >
//     //     <div
//     //       class="relative h-full w-full flex flex-nowrap [&>*]:shrink-0 items-center"
//     //     >
//     //       ${this.getBrushMenu()}
//     //     </div>
//     //   </div>
//     // </div> -->
//     return html`
//       <div
//         class="flex max-w-screen-xs h-20 xs:h-24 bg-toolbar mx-auto xs:mb-2 xs:rounded-xl xs:shadow-md cursor-default pointer-events-auto overflow-hidden"
//       >
//         <div
//           id="brushToolsContainer"
//           class="flex-1 flex flex-nowrap [&>*]:shrink-0 items-center overflow-hidden"
//           @wheel=${this.handleWheel}
//         >
//           <!-- ------------------------------------------ -->
//           <!-- Tools -->

//           ${this.getTools()}

//           <!-- ------------------------------------------ -->
//           <!-- Shapes -->

//           <div class="h-full w-1/4 grid grid-cols-2 grid-rows-2 gap-y-2 gap-x-4">
//             ${shapes.map(
//               (shape) => html`
//                 <sl-icon
//                   class="text-4xl p-1 text-black data-[selected=false]:hover:scale-125 transition-[transform,colors] cursor-pointer hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-[#00000033] rounded-md"
//                   @click=${() =>
//                     this.updateBrush({
//                       ...this.brush,
//                       kind: shape.kind,
//                     })}
//                   data-selected="${this.brush.kind === shape.kind}"
//                   library=${shape.iconLibrary}
//                   name=${shape.icon}
//                 ></sl-icon>
//               `,
//             )}
//           </div>
//         </div>

//         <!-- ------------------------------------------ -->
//         <!-- Arrows -->

//         <div class="flex flex-col w-20 h-full border-l border-gray-light">
//           ${arrows.map(
//             (arrow) => html`
//               <div
//                 class="flex items-center justify-center w-full h-1/2 pt-1 transition-colors hover:bg-primary hover:text-white cursor-pointer first:rounded-tr-xl last:rounded-br-xl first:border-b border-gray-light"
//                 @click=${() => arrow.handleClick()}
//               >
//                 <sl-icon class="text-xl" library=${arrow.iconLibrary} name=${arrow.icon}></sl-icon>
//               </div>
//             `,
//           )}
//         </div>
//       </div>

//       <!-- ------------------------------------------ -->
//       <!-- Menu -->

//       <brush-menu
//         class="absolute -top-12 left-[50%] -translate-x-1/2 -z-10 rounded-t-xl shadow-md cursor-default pointer-events-auto"
//         @color-change="${(event: CustomEvent) => {
//           this.updateBrush({
//             ...this.brush,
//             color: event.detail,
//           });
//         }}"
//         @size-change="${(event: CustomEvent) => {
//           this.updateBrush({
//             ...this.brush,
//             size: event.detail,
//           });
//         }}"
//       ></brush-menu>
//     `;
//   }

//   private handleWheel(ev: WheelEvent): void {
//     ev.stopPropagation();
//     this.container.scrollBy({ left: ev.deltaY });
//   }

//   private getTools(): TemplateResult[] {
//     const tools = [
//       {
//         kind: BrushKind.Marker,
//         image: '/items/marker.png',
//         emptyImage: '/items/marker-empty.png',
//       },
//       {
//         kind: BrushKind.Paint,
//         image: '/items/paintbrush.png',
//         emptyImage: '/items/paintbrush-empty.png',
//       },
//       {
//         kind: BrushKind.Crayon,
//         image: '/items/crayon.png',
//         emptyImage: '/items/crayon-empty.png',
//       },
//       {
//         kind: BrushKind.Eraser,
//         image: '/items/eraser.png',
//         emptyImage: '/items/eraser-empty.png',
//       },
//       {
//         kind: BrushKind.Smudge,
//         image: '/items/smudge.png',
//         emptyImage: '/items/smudge-empty.png',
//       },
//       {
//         kind: BrushKind.FloodFill,
//         image: '/items/floodFill.png',
//         emptyImage: '/items/floodFill-empty.png',
//       },
//     ];

//     return tools.map(
//       (tool) => html`
//         <div
//           class="relative h-full w-1/4 group cursor-pointer data-[selected=true]:bg-[#00000033]"
//           data-selected="${this.brush.kind === tool.kind}"
//           @click=${() =>
//             this.updateBrush({
//               ...this.brush,
//               kind: BrushKind[tool.kind as keyof typeof BrushKind],
//             })}
//         >
//           <img
//             class="w-full px-2 grayscale data-[selected=false]:group-hover:-translate-y-4 transition-transform"
//             src=${tool.emptyImage}
//             alt=${tool.kind}
//             data-selected=${this.brush.kind === tool.kind}
//           />
//           <img
//             class="absolute inset-0 px-2 mx-auto cursor-pointer data-[selected=false]:group-hover:-translate-y-4 transition-transform data-[selected=true]:translate-y-24 pointer-events-none"
//             src=${tool.image}
//             alt=${tool.kind}
//             data-selected=${this.brush.kind === tool.kind}
//           />
//         </div>
//       `,
//     );
//   }

//   private getShapes(): TemplateResult {
//     const shapes = [
//       {
//         kind: BrushKind.Line,
//         iconLibrary: 'fa',
//         icon: 'fas-minus',
//         tooltip: 'Line',
//       },
//       {
//         kind: BrushKind.Rectangle,
//         iconLibrary: 'fa',
//         icon: 'square',
//         tooltip: 'Rectangle',
//       },
//       {
//         kind: BrushKind.Ellipse,
//         iconLibrary: 'fa',
//         icon: 'circle',
//         tooltip: 'Ellipse',
//       },
//       {
//         kind: BrushKind.Star,
//         iconLibrary: 'fa',
//         icon: 'star',
//         tooltip: 'Ellipse',
//       },
//     ];

//     return html`
//       <div class="h-full w-1/4 grid grid-cols-2 grid-rows-2 gap-y-2 gap-x-4">
//         ${shapes.map(
//           (shape) => html`
//             <sl-icon
//               class="text-4xl p-1 text-black data-[selected=false]:hover:scale-125 transition-[transform,colors] cursor-pointer hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-[#00000033]"
//               @click=${() =>
//                 this.updateBrush({
//                   ...this.brush,
//                   kind: shape.kind,
//                 })}
//               data-selected="${this.brush.kind === shape.kind}"
//               library=${shape.iconLibrary}
//               name=${shape.icon}
//             ></sl-icon>
//           `,
//         )}
//       </div>
//     `;
//   }

//   private getBrushMenu(): TemplateResult {
//     const arrows = [
//       {
//         text: 'next',
//         iconLibrary: 'fa',
//         icon: 'fas-arrow-right-long',
//         handleClick: () => {
//           const container = this.shadowRoot!.getElementById('brushToolsContainer');
//           container?.scrollBy({ left: 1000, behavior: 'smooth' });
//         },
//       },
//       {
//         text: 'back',
//         iconLibrary: 'fa',
//         icon: 'fas-arrow-left-long',
//         handleClick: () => {
//           const container = this.shadowRoot!.getElementById('brushToolsContainer');
//           container?.scrollBy({ left: -1000, behavior: 'smooth' });
//         },
//       },
//     ];

//     return html`
//       <div
//         class="absolute flex items-center gap-4 -top-12 left-[50%] -translate-x-1/2 w-4/5 h-12 -z-10 rounded-t-xl shadow-md bg-gray-dark cursor-default"
//       >
//         <brush-menu
//           @color-change=${(event: CustomEvent) => {
//             this.updateBrush({
//               ...this.brush,
//               color: event.detail,
//             });
//           }}
//           @size-change=${(event: CustomEvent) => {
//             this.updateBrush({
//               ...this.brush,
//               size: event.detail,
//             });
//           }}
//         ></brush-menu>
//       </div>

//       <!-- ------------------------------------------ -->
//       <!-- Tools -->
//       <div
//         id="brushToolsContainer"
//         class="h-full w-full flex-1 flex flex-nowrap [&>*]:shrink-0 items-center overflow-hidden"
//         @wheel=${(ev: WheelEvent) => {
//           ev.stopPropagation();
//           const container = this.shadowRoot!.getElementById('brushToolsContainer');
//           container?.scrollBy({ left: ev.deltaY });
//         }}
//       >
//         ${tools.map(
//           (tool) => html`
//             <div
//               class="relative h-full w-1/4 group cursor-pointer data-[selected=true]:bg-[#00000033]"
//               data-selected="${this.brush.kind === tool.kind}"
//               @click=${() =>
//                 this.updateBrush({
//                   ...this.brush,
//                   kind: BrushKind[tool.kind as keyof typeof BrushKind],
//                 })}
//             >
//               <img
//                 class="w-full px-2 grayscale data-[selected=false]:group-hover:-translate-y-4 transition-transform"
//                 src=${tool.emptyImage}
//                 data-selected="${this.brush.kind === tool.kind}"
//               />
//               <img
//                 class="absolute inset-0 px-2 mx-auto cursor-pointer data-[selected=false]:group-hover:-translate-y-4 transition-transform data-[selected=true]:translate-y-24 pointer-events-none"
//                 src=${tool.image}
//                 data-selected="${this.brush.kind === tool.kind}"
//               />
//             </div>
//           `,
//         )}

//         <!-- TODO move shapes and select to their own component -->
//         <!-- ------------------------------------------ -->
//         <!-- Shapes -->

//         <div class="h-full w-1/4 grid grid-cols-2 grid-rows-2 gap-y-2 gap-x-4">
//           ${shapes.map(
//             (shape) => html`
//               <sl-icon
//                 class="text-4xl p-1 text-black data-[selected=false]:hover:scale-125 transition-[transform,colors] cursor-pointer hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-[#00000033]"
//                 @click=${() =>
//                   this.updateBrush({
//                     ...this.brush,
//                     kind: shape.kind,
//                   })}
//                 data-selected="${this.brush.kind === shape.kind}"
//                 library=${shape.iconLibrary}
//                 name=${shape.icon}
//               ></sl-icon>
//             `,
//           )}
//         </div>

//         <!-- ------------------------------------------ -->
//         <!-- Arrows -->

//         <div class="flex flex-col w-20 h-full border-l border-gray-light">
//           ${arrows.map(
//             (arrow) => html`
//               <div
//                 class="flex items-center justify-center w-full h-1/2 pt-1 transition-colors hover:bg-primary hover:text-white cursor-pointer first:rounded-tr-xl last:rounded-br-xl border-b border-gray-light"
//                 @click=${() => arrow.handleClick()}
//               >
//                 <sl-icon class="text-xl" library=${arrow.iconLibrary} name=${arrow.icon}></sl-icon>
//               </div>
//             `,
//           )}
//         </div>
//       </div>
//     `;
//   }

//   private updateBrush(brush: Brush): void {
//     this.brush = brush;

//     const updateBrushEvent = new CustomEvent('updateBrush', {
//       detail: brush,
//       bubbles: true,
//       composed: true,
//     });

//     this.dispatchEvent(updateBrushEvent);
//   }
// }

// export default BottomToolbar;
