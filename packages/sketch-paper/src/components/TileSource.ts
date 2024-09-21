import { component, field, Entity } from "@lastolivegames/becsy";
import { Tile } from "./Tile";

@component
export class TileSource {
  @field.dynamicString(512) declare image: string;
  @field.dynamicString(36) declare label: string;
  @field.backrefs(Tile, "source") declare tiles: Entity[];
}
