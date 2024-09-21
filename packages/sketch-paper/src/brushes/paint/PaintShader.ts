import * as PIXI from "pixi.js";

import vertex from "../../shaders/default/default.vert";
import fragment from "./paint.frag";

export interface PaintShaderOptions {
  texture: PIXI.Texture;
  shapeTexture: PIXI.Texture;
  grainTexture: PIXI.Texture;
  brushSize: number;
  brushColor: [number, number, number, number];
  position: [number, number];
}

export class PaintShader extends PIXI.Shader {
  constructor(options: PaintShaderOptions) {
    const glProgram = PIXI.GlProgram.from({
      vertex,
      fragment,
    });

    super({
      glProgram,
      resources: {
        paintUniforms: {
          uBrushSize: { value: options.brushSize, type: "f32" },
          uBrushColor: { value: options.brushColor, type: "vec4<f32>" },
          uPosition: { value: options.position, type: "vec2<f32>" },
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
    return this.resources.paintUniforms.uniforms.uBrushSize;
  }
  set brushSize(value: number) {
    this.resources.paintUniforms.uniforms.uBrushSize = value;
  }

  get brushColor(): Float32Array {
    return this.resources.paintUniforms.uniforms.uBrushColor;
  }
  set brushColor(value: [number, number, number, number]) {
    this.resources.paintUniforms.uniforms.uBrushColor[0] = value[0] / 255;
    this.resources.paintUniforms.uniforms.uBrushColor[1] = value[1] / 255;
    this.resources.paintUniforms.uniforms.uBrushColor[2] = value[2] / 255;
    this.resources.paintUniforms.uniforms.uBrushColor[3] = value[3] / 255;
  }

  get position(): Float32Array {
    return this.resources.paintUniforms.uniforms.uPosition;
  }
  set position(value: [number, number]) {
    this.resources.paintUniforms.uniforms.uPosition[0] = value[0];
    this.resources.paintUniforms.uniforms.uPosition[1] = value[1];
  }
}
