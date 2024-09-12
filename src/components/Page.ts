import { component, field, Entity, Type } from "@lastolivegames/becsy";
import { v4 as uuid } from "uuid";

@component
export class Page {
  @field.ref declare strokeEntity: Entity | null;
  @field.int32.vector(2) declare position: [number, number];
  @field.dynamicString(512) declare image: string;
  @field({ type: Type.dynamicString(36), default: uuid() })
  declare label: string;
  @field.boolean declare loading: boolean;
}
