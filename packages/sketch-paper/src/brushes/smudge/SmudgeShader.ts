import * as PIXI from "pixi.js";

import vertex from "../../shaders/default/default.vert";
import fragment from "./smudge.frag";

export interface SmudgeShaderOptions {
  texture: PIXI.Texture;
  shapeTexture: PIXI.Texture;
  brushSize: number;
}

export class SmudgeShader extends PIXI.Shader {
  constructor(options: SmudgeShaderOptions) {
    const glProgram = PIXI.GlProgram.from({
      vertex,
      fragment,
    });

    super({
      glProgram,
      resources: {
        smudgeUniforms: {
          uBrushSize: { value: options.brushSize, type: "f32" },
        },

        uTexture: options.texture.source,
        uShapeTexture: options.shapeTexture.source,
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

  get brushSize(): number {
    return this.resources.smudgeUniforms.uniforms.uBrushSize;
  }
  set brushSize(value: number) {
    this.resources.smudgeUniforms.uniforms.uBrushSize = value;
  }
}
