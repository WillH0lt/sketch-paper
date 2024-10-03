import * as PIXI from 'pixi.js';

import BaseShader from '../BaseShader.js';
import fragment from './crayon.frag';
import vertex from './crayon.vert';

export interface CrayonShaderOptions {
  crayonShape: PIXI.Texture;
  crayonGrain: PIXI.Texture;
  brushSize?: number;
  brushColor?: [number, number, number, number];
  position?: [number, number];
  lastPosition?: [number, number];
}

interface CrayonResources {
  brushUniforms: {
    uniforms: {
      uBrushSize: number;
      uBrushColor: Float32Array;
      uPosition: Float32Array;
      uLastPosition: Float32Array;
    };
  };
  uCrayonShape: PIXI.TextureSource;
  uCrayonGrain: PIXI.TextureSource;
}

export class CrayonShader extends BaseShader {
  public constructor(options: CrayonShaderOptions) {
    const glProgram = PIXI.GlProgram.from({
      vertex,
      fragment,
    });

    const resources = {
      brushUniforms: {
        uBrushSize: { value: options.brushSize, type: 'f32' },
        uBrushColor: { value: options.brushColor, type: 'vec4<f32>' },
        uPosition: { value: options.position, type: 'vec2<f32>' },
        uLastPosition: { value: options.lastPosition, type: 'vec2<f32>' },
      },
      uCrayonShape: options.crayonShape.source,
      uCrayonGrain: options.crayonGrain.source,
    };

    super({
      glProgram,
      resources,
    });
  }

  private get crayonResources(): CrayonResources {
    return this.resources as CrayonResources;
  }

  public setBrushSize(value: number): void {
    this.crayonResources.brushUniforms.uniforms.uBrushSize = value;
  }

  public setBrushColor(value: [number, number, number, number]): void {
    this.crayonResources.brushUniforms.uniforms.uBrushColor[0] = value[0] / 255;
    this.crayonResources.brushUniforms.uniforms.uBrushColor[1] = value[1] / 255;
    this.crayonResources.brushUniforms.uniforms.uBrushColor[2] = value[2] / 255;
    this.crayonResources.brushUniforms.uniforms.uBrushColor[3] = value[3] / 255;
  }

  public setPosition(value: [number, number]): void {
    this.crayonResources.brushUniforms.uniforms.uPosition[0] = value[0];
    this.crayonResources.brushUniforms.uniforms.uPosition[1] = value[1];
  }

  public setLastPosition(value: [number, number]): void {
    this.crayonResources.brushUniforms.uniforms.uLastPosition[0] = value[0];
    this.crayonResources.brushUniforms.uniforms.uLastPosition[1] = value[1];
  }
}
