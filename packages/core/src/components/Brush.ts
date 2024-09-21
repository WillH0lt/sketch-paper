import { component, field, Type } from '@lastolivegames/becsy';

import { BrushKindEnum } from '../types.js';

@component
class Brush {
  @field.staticString(Object.values(BrushKindEnum))
  public declare kind: BrushKindEnum;

  @field({ type: Type.dynamicString(9), default: '#D94141' })
  public declare color: string;

  @field({ type: Type.float64, default: 25 }) public declare size: number;
}

export default Brush;
