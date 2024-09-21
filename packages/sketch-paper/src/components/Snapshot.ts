import { component, field } from "@lastolivegames/becsy";

@component
export class Snapshot {
  @field.dynamicString(128) declare url: string;
}
