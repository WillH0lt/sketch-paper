import type { Entity } from '@lastolivegames/becsy';
import { component, field } from '@lastolivegames/becsy';

@component
class Tile {
  @field.ref public declare strokeEntity: Entity | null;

  @field.ref public declare source: Entity;

  @field.int32.vector(2) public declare position: [number, number];

  // @field.dynamicString(512) declare public image: string;

  // @field.dynamicString(36) declare public label: string;

  @field.boolean public declare loading: boolean;
}

export default Tile;
