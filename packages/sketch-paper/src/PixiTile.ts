import * as PIXI from "pixi.js";

import { DefaultShader } from "./shaders/default";

export class PixiTile extends PIXI.Container {
  texture: PIXI.Texture;
  mesh: PIXI.Mesh<PIXI.Geometry, PIXI.Shader>;

  constructor(width: number, height: number) {
    super();

    const quadGeometry = new PIXI.Geometry({
      attributes: {
        aPosition: [0, 0, width, 0, width, height, 0, height],
        aUV: [0, 0, 1, 0, 1, 1, 0, 1],
      },
      indexBuffer: [0, 1, 2, 0, 2, 3],
    });

    this.texture = PIXI.RenderTexture.create({
      width,
      height,
    });

    const shader = new DefaultShader({ texture: this.texture });

    this.mesh = new PIXI.Mesh({
      geometry: quadGeometry,
      shader,
    });

    this.addChild(this.mesh);
  }

  destroy(options: PIXI.DestroyOptions) {
    this.texture.destroy(true);
    super.destroy(options);
  }
}
