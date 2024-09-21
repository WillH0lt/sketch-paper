import { component, field, Entity } from "@lastolivegames/becsy";
import { Tile } from "./Tile";

@component
export class Stroke {
  @field.float64.vector(2) declare prevPoint: [number, number];
  @field.backrefs(Tile) declare tiles: Entity[];
}
