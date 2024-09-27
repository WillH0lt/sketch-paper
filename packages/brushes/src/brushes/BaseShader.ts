import * as PIXI from 'pixi.js';

abstract class BaseShader extends PIXI.Shader {
  public abstract getBrushSize(): number;

  public abstract setBrushSize(value: number): void;

  public abstract getBrushColor(): [number, number, number, number];

  public abstract setBrushColor(value: [number, number, number, number]): void;
}

export default BaseShader;
