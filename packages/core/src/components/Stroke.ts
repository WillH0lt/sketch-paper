import type { Entity } from '@lastolivegames/becsy';
import { component, field } from '@lastolivegames/becsy';
import Tile from './Tile.js';

@component
class Stroke {
  @field.int32.vector(2) public declare prevPoint: [number, number];

  @field.backrefs(Tile) public declare tiles: Entity[];
}

export default Stroke;
