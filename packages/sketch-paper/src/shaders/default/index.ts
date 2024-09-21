import * as PIXI from "pixi.js";

import vertex from "./default.vert";
import fragment from "./default.frag";

export interface DefaultShaderOptions {
  texture: PIXI.Texture;
}

export class DefaultShader extends PIXI.Shader {
  constructor(options: DefaultShaderOptions) {
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
