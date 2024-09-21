import { component, field, Type } from "@lastolivegames/becsy";

import { BrushKind } from "../enums";

@component
export class Brush {
  @field.staticString(Object.values(BrushKind))
  declare kind: BrushKind;
  @field({ type: Type.dynamicString(9), default: "#D94141" })
  declare color: string;
  @field({ type: Type.float64, default: 25 }) declare size: number;
}
