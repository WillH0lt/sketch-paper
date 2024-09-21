import { component, field } from '@lastolivegames/becsy';

@component
class Input {
  @field.float32.vector(2) public declare pointerClient: [number, number];

  @field.float32.vector(2) public declare pointerWorld: [number, number];

  @field.boolean public declare pointerDown: boolean;

  @field.boolean public declare pointerDownTrigger: boolean;

  @field.boolean public declare pointerUpTrigger: boolean;

  @field.boolean public declare pointerBeingDragged: boolean;

  @field.boolean public declare pointerBeingDraggedTrigger: boolean;

  @field.float32.vector(2) public declare dragStart: [number, number];

  @field.boolean public declare didHaveMultiplePointersDown: boolean;

  @field.float32 public declare pointerTravelDistance: number;

  @field.boolean public declare aDown: boolean;

  @field.boolean public declare aDownTrigger: boolean;

  @field.boolean public declare bDown: boolean;

  @field.boolean public declare bDownTrigger: boolean;

  @field.boolean public declare cDown: boolean;

  @field.boolean public declare cDownTrigger: boolean;

  @field.boolean public declare dDown: boolean;

  @field.boolean public declare dDownTrigger: boolean;

  @field.boolean public declare eDown: boolean;

  @field.boolean public declare eDownTrigger: boolean;

  @field.boolean public declare fDown: boolean;

  @field.boolean public declare fDownTrigger: boolean;

  @field.boolean public declare gDown: boolean;

  @field.boolean public declare gDownTrigger: boolean;

  @field.boolean public declare hDown: boolean;

  @field.boolean public declare hDownTrigger: boolean;

  @field.boolean public declare iDown: boolean;

  @field.boolean public declare iDownTrigger: boolean;

  @field.boolean public declare jDown: boolean;

  @field.boolean public declare jDownTrigger: boolean;

  @field.boolean public declare kDown: boolean;

  @field.boolean public declare kDownTrigger: boolean;

  @field.boolean public declare lDown: boolean;

  @field.boolean public declare lDownTrigger: boolean;

  @field.boolean public declare mDown: boolean;

  @field.boolean public declare mDownTrigger: boolean;

  @field.boolean public declare nDown: boolean;

  @field.boolean public declare nDownTrigger: boolean;

  @field.boolean public declare oDown: boolean;

  @field.boolean public declare oDownTrigger: boolean;

  @field.boolean public declare pDown: boolean;

  @field.boolean public declare pDownTrigger: boolean;

  @field.boolean public declare qDown: boolean;

  @field.boolean public declare qDownTrigger: boolean;

  @field.boolean public declare rDown: boolean;

  @field.boolean public declare rDownTrigger: boolean;

  @field.boolean public declare sDown: boolean;

  @field.boolean public declare sDownTrigger: boolean;

  @field.boolean public declare tDown: boolean;

  @field.boolean public declare tDownTrigger: boolean;

  @field.boolean public declare uDown: boolean;

  @field.boolean public declare uDownTrigger: boolean;

  @field.boolean public declare vDown: boolean;

  @field.boolean public declare vDownTrigger: boolean;

  @field.boolean public declare wDown: boolean;

  @field.boolean public declare wDownTrigger: boolean;

  @field.boolean public declare xDown: boolean;

  @field.boolean public declare xDownTrigger: boolean;

  @field.boolean public declare yDown: boolean;

  @field.boolean public declare yDownTrigger: boolean;

  @field.boolean public declare zDown: boolean;

  @field.boolean public declare zDownTrigger: boolean;

  @field.boolean public declare oneDown: boolean;

  @field.boolean public declare oneDownTrigger: boolean;

  @field.boolean public declare twoDown: boolean;

  @field.boolean public declare twoDownTrigger: boolean;

  @field.boolean public declare threeDown: boolean;

  @field.boolean public declare threeDownTrigger: boolean;

  @field.boolean public declare fourDown: boolean;

  @field.boolean public declare fourDownTrigger: boolean;

  @field.boolean public declare fiveDown: boolean;

  @field.boolean public declare fiveDownTrigger: boolean;

  @field.boolean public declare sixDown: boolean;

  @field.boolean public declare sixDownTrigger: boolean;

  @field.boolean public declare sevenDown: boolean;

  @field.boolean public declare sevenDownTrigger: boolean;

  @field.boolean public declare eightDown: boolean;

  @field.boolean public declare eightDownTrigger: boolean;

  @field.boolean public declare nineDown: boolean;

  @field.boolean public declare nineDownTrigger: boolean;

  @field.boolean public declare zeroDown: boolean;

  @field.boolean public declare zeroDownTrigger: boolean;

  @field.boolean public declare minusDown: boolean;

  @field.boolean public declare minusDownTrigger: boolean;

  @field.boolean public declare plusDown: boolean;

  @field.boolean public declare plusDownTrigger: boolean;

  @field.boolean public declare backspaceDown: boolean;

  @field.boolean public declare backspaceDownTrigger: boolean;

  @field.boolean public declare enterDown: boolean;

  @field.boolean public declare enterDownTrigger: boolean;

  @field.boolean public declare spaceDown: boolean;

  @field.boolean public declare spaceDownTrigger: boolean;

  @field.boolean public declare tabDown: boolean;

  @field.boolean public declare tabDownTrigger: boolean;

  @field.boolean public declare escapeDown: boolean;

  @field.boolean public declare escapeDownTrigger: boolean;

  @field.boolean public declare shiftDown: boolean;

  @field.boolean public declare shiftDownTrigger: boolean;

  @field.boolean public declare modDown: boolean;

  @field.boolean public declare modDownTrigger: boolean;

  @field.boolean public declare deleteDown: boolean;

  @field.boolean public declare deleteDownTrigger: boolean;

  @field.boolean public declare arrowleftDown: boolean;

  @field.boolean public declare arrowleftDownTrigger: boolean;

  @field.boolean public declare arrowrightDown: boolean;

  @field.boolean public declare arrowrightDownTrigger: boolean;

  @field.boolean public declare arrowupDown: boolean;

  @field.boolean public declare arrowupDownTrigger: boolean;

  @field.boolean public declare arrowdownDown: boolean;

  @field.boolean public declare arrowdownDownTrigger: boolean;

  @field.boolean public declare rightMouseDown: boolean;

  @field.boolean public declare rightMouseDownTrigger: boolean;
}

export default Input;
