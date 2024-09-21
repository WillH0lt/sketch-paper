import * as PIXI from 'pixi.js';

import fragment from '../../assets/shaders/default.frag';
import vertex from '../../assets/shaders/default.vert';

export interface DefaultShaderOptions {
  texture: PIXI.Texture;
}

export class DefaultShader extends PIXI.Shader {
  public constructor(options: DefaultShaderOptions) {
    const glProgram = PIXI.GlProgram.from({
      vertex,
      fragment,
    });

    super({
      glProgram,
      resources: {
        uTexture: options.texture.source,
      },
    });
  }
}
