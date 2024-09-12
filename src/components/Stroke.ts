import { component, field, Entity } from "@lastolivegames/becsy";
import { Page } from "./Page";

@component
export class Stroke {
  @field.float64.vector(2) declare prevPoint: [number, number];
  @field.backrefs(Page) declare pages: Entity[];
}
