import { component, field } from "@lastolivegames/becsy";
import { BrushKind } from "../enums";

@component
export class Shape {
  @field.float64.vector(2) declare startPoint: [number, number];
  @field.staticString(Object.values(BrushKind))
  declare kind: BrushKind;
}
