import * as PIXI from 'pixi.js';

import { DefaultShader } from './shaders/default/index.js';

class PixiTile extends PIXI.Container {
  public texture: PIXI.Texture;

  public mesh: PIXI.Mesh<PIXI.Geometry, PIXI.Shader>;

  public constructor(width: number, height: number) {
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

  public destroy(options: PIXI.DestroyOptions): void {
    this.texture.destroy(true);
    super.destroy(options);
  }
}

export default PixiTile;
