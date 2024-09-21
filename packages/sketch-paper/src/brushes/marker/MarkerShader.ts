import * as PIXI from "pixi.js";

import vertex from "../../shaders/default/default.vert";
import fragment from "./marker.frag";

export interface MarkerShaderOptions {
  texture: PIXI.Texture;
  shapeTexture: PIXI.Texture;
  grainTexture: PIXI.Texture;
  brushSize?: number;
  brushColor?: [number, number, number, number];
  position?: [number, number];
  lastPosition?: [number, number];
}

export class MarkerShader extends PIXI.Shader {
  constructor(options: MarkerShaderOptions) {
    const glProgram = PIXI.GlProgram.from({
      vertex,
      fragment,
    });

    super({
      glProgram,
      resources: {
        markerUniforms: {
          uBrushSize: { value: options.brushSize, type: "f32" },
          uBrushColor: { value: options.brushColor, type: "vec4<f32>" },
          uPosition: { value: options.position, type: "vec2<f32>" },
          uLastPosition: { value: options.lastPosition, type: "vec2<f32>" },
        },

        uTexture: options.texture.source,
        uShapeTexture: options.shapeTexture.source,
        uGrainTexture: options.grainTexture.source,
      },
    });
  }

  get texture(): PIXI.TextureSource<any> {
    return this.resources.uTexture;
  }
  set texture(value: PIXI.TextureSource<any>) {
    this.resources.uTexture = value;
  }

  get shapeTexture(): PIXI.TextureSource<any> {
    return this.resources.uShapeTexture;
  }
  set shapeTexture(value: PIXI.TextureSource<any>) {
    this.resources.uShapeTexture = value;
  }

  get grainTexture(): PIXI.TextureSource<any> {
    return this.resources.uGrainTexture;
  }

  set grainTexture(value: PIXI.TextureSource<any>) {
    this.resources.uGrainTexture = value;
  }

  get brushSize(): number {
    return this.resources.markerUniforms.uniforms.uBrushSize;
  }
  set brushSize(value: number) {
    this.resources.markerUniforms.uniforms.uBrushSize = value;
  }

  get brushColor(): Float32Array {
    return this.resources.markerUniforms.uniforms.uBrushColor;
  }
  set brushColor(value: [number, number, number, number]) {
    this.resources.markerUniforms.uniforms.uBrushColor[0] = value[0] / 255;
    this.resources.markerUniforms.uniforms.uBrushColor[1] = value[1] / 255;
    this.resources.markerUniforms.uniforms.uBrushColor[2] = value[2] / 255;
    this.resources.markerUniforms.uniforms.uBrushColor[3] = value[3] / 255;
  }

  get position(): Float32Array {
    return this.resources.markerUniforms.uniforms.uPosition;
  }
  set position(value: [number, number]) {
    this.resources.markerUniforms.uniforms.uPosition[0] = value[0];
    this.resources.markerUniforms.uniforms.uPosition[1] = value[1];
  }

  get lastPosition(): Float32Array {
    return this.resources.markerUniforms.uniforms.uLastPosition;
  }
  set lastPosition(value: [number, number]) {
    this.resources.markerUniforms.uniforms.uLastPosition[0] = value[0];
    this.resources.markerUniforms.uniforms.uLastPosition[1] = value[1];
  }
}
