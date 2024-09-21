import { component, field } from '@lastolivegames/becsy';
import { BrushKindEnum } from '../types.js';

@component
class Shape {
  @field.float64.vector(2) public declare startPoint: [number, number];

  @field.staticString(Object.values(BrushKindEnum))
  public declare kind: BrushKindEnum;
}

export default Shape;
