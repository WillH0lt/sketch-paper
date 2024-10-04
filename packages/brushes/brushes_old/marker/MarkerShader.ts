import * as PIXI from 'pixi.js';

import vertex from '../../assets/shaders/default.vert';
import fragment from '../../assets/shaders/marker.frag';

export interface MarkerShaderOptions {
  texture: PIXI.Texture;
  shapeTexture: PIXI.Texture;
  grainTexture: PIXI.Texture;
  brushSize?: number;
  brushColor?: [number, number, number, number];
  position?: [number, number];
  lastPosition?: [number, number];
}

interface MarkerResources {
  markerUniforms: {
    uniforms: {
      uBrushSize: number;
      uBrushColor: Float32Array;
      uPosition: Float32Array;
      uLastPosition: Float32Array;
    };
  };
  uTexture: PIXI.TextureSource;
  uShapeTexture: PIXI.TextureSource;
  uGrainTexture: PIXI.TextureSource;
}

export class MarkerShader extends PIXI.Shader {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public resources: MarkerResources;

  public constructor(options: MarkerShaderOptions) {
    const glProgram = PIXI.GlProgram.from({
      vertex,
      fragment,
    });

    super({
      glProgram,
      resources: {
        markerUniforms: {
          uBrushSize: { value: options.brushSize, type: 'f32' },
          uBrushColor: { value: options.brushColor, type: 'vec4<f32>' },
          uPosition: { value: options.position, type: 'vec2<f32>' },
          uLastPosition: { value: options.lastPosition, type: 'vec2<f32>' },
        },

        uTexture: options.texture.source,
        uShapeTexture: options.shapeTexture.source,
        uGrainTexture: options.grainTexture.source,
      },
    });
  }

  public get texture(): PIXI.TextureSource {
    return this.resources.uTexture;
  }

  public set texture(value: PIXI.TextureSource) {
    this.resources.uTexture = value;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public get shapeTexture(): PIXI.TextureSource {
    return this.resources.uShapeTexture;
  }

  public set shapeTexture(value: PIXI.TextureSource) {
    this.resources.uShapeTexture = value;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public get grainTexture(): PIXI.TextureSource {
    return this.resources.uGrainTexture;
  }

  public set grainTexture(value: PIXI.TextureSource) {
    this.resources.uGrainTexture = value;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public get brushSize(): number {
    return this.resources.markerUniforms.uniforms.uBrushSize;
  }

  public set brushSize(value: number) {
    this.resources.markerUniforms.uniforms.uBrushSize = value;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public get brushColor(): [number, number, number, number] {
    const f32 = this.resources.markerUniforms.uniforms.uBrushColor;
    return [f32[0], f32[1], f32[2], f32[3]];
  }

  public set brushColor(value: [number, number, number, number]) {
    this.resources.markerUniforms.uniforms.uBrushColor[0] = value[0] / 255;
    this.resources.markerUniforms.uniforms.uBrushColor[1] = value[1] / 255;
    this.resources.markerUniforms.uniforms.uBrushColor[2] = value[2] / 255;
    this.resources.markerUniforms.uniforms.uBrushColor[3] = value[3] / 255;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public get position(): [number, number] {
    const f32 = this.resources.markerUniforms.uniforms.uPosition;
    return [f32[0], f32[1]];
  }

  public set position(value: [number, number]) {
    this.resources.markerUniforms.uniforms.uPosition[0] = value[0];
    this.resources.markerUniforms.uniforms.uPosition[1] = value[1];
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public get lastPosition(): [number, number] {
    const f32 = this.resources.markerUniforms.uniforms.uLastPosition;
    return [f32[0], f32[1]];
  }

  public set lastPosition(value: [number, number]) {
    this.resources.markerUniforms.uniforms.uLastPosition[0] = value[0];
    this.resources.markerUniforms.uniforms.uLastPosition[1] = value[1];
  }
}