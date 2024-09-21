import { component, field } from '@lastolivegames/becsy';

@component
class Settings {
  @field.uint16 public declare tileCountX: number;

  @field.uint16 public declare tileCountY: number;

  @field.uint16 public declare tileWidth: number;

  @field.uint16 public declare tileHeight: number;

  @field.dynamicString(512) public declare assetsPath: string;
}

export default Settings;
