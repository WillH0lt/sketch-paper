import { component, field } from '@lastolivegames/becsy';

@component
class Settings {
  @field.float32 public declare minZoom: number;

  @field.float32 public declare maxZoom: number;

  @field.uint32 public declare tileCountX: number;

  @field.uint32 public declare tileCountY: number;

  @field.uint32 public declare tileWidth: number;

  @field.uint32 public declare tileHeight: number;

  @field.dynamicString(512) public declare baseUrl: string;

  @field.dynamicString(7) public declare baseColor: string;

  @field.boolean public declare isTransparent: boolean;

  @field.dynamicString(7) public declare backgroundColor: string;

  @field.boolean public declare allowUndo: boolean;

  @field.uint8 public declare tileLoadingConcurrency: number;

  @field.dynamicString(512) public declare loadingImg: string;

  @field.uint8 public declare maxTiles: number;

  @field.uint32 public declare maxSegmentLength: number;
}

export default Settings;
