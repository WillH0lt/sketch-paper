import { component, field } from '@lastolivegames/becsy';

import { PointerActions, WheelActions } from '../types.js';

@component
class InputMode {
  @field.staticString(Object.values(PointerActions)) public declare actionLeftMouse: PointerActions;

  @field.staticString(Object.values(PointerActions))
  public declare actionMiddleMouse: PointerActions;

  @field.staticString(Object.values(PointerActions))
  public declare actionRightMouse: PointerActions;

  @field.staticString(Object.values(WheelActions)) public declare actionWheel: WheelActions;
}

export default InputMode;
