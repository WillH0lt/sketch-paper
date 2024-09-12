import { component, field, Entity, Type } from "@lastolivegames/becsy";

@component
export class Tile {
  @field.ref declare strokeEntity: Entity | null;
  @field.ref declare source: Entity;
  @field.int32.vector(2) declare position: [number, number];
  // @field.dynamicString(512) declare image: string;
  // @field.dynamicString(36) declare label: string;
  @field.boolean declare loading: boolean;
}
