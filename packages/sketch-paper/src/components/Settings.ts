import { component, field } from "@lastolivegames/becsy";

@component
export class Settings {
  @field.uint16 declare tileCountX: number;
  @field.uint16 declare tileCountY: number;
  @field.uint16 declare tileWidth: number;
  @field.uint16 declare tileHeight: number;
}
