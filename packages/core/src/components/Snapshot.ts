import { component, field } from '@lastolivegames/becsy';

@component
class Snapshot {
  @field.dynamicString(128) public declare url: string;
}

export default Snapshot;
