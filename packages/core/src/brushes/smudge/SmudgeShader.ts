import * as PIXI from 'pixi.js';

import vertex from '../../assets/shaders/default.vert';
import fragment from '../../assets/shaders/smudge.frag';

export interface SmudgeShaderOptions {
  texture: PIXI.Texture;
  shapeTexture: PIXI.Texture;
  brushSize: number;
}

interface SmudgeResources {
  smudgeUniforms: {
    uniforms: {
      uBrushSize: number;
    };
  };
  uTexture: PIXI.TextureSource;
  uShapeTexture: PIXI.TextureSource;
}

export class SmudgeShader extends PIXI.Shader {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public resources: SmudgeResources;

  public constructor(options: SmudgeShaderOptions) {
    const glProgram = PIXI.GlProgram.from({
      vertex,
      fragment,
    });

    super({
      glProgram,
      resources: {
        smudgeUniforms: {
          uBrushSize: { value: options.brushSize, type: 'f32' },
        },

        uTexture: options.texture.source,
        uShapeTexture: options.shapeTexture.source,
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
  public get brushSize(): number {
    return this.resources.smudgeUniforms.uniforms.uBrushSize;
  }

  public set brushSize(value: number) {
    this.resources.smudgeUniforms.uniforms.uBrushSize = value;
  }
}
