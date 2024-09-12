import { System, system } from "@lastolivegames/becsy";

import * as comps from "../components";

@system
export class Deleter extends System {
  // Note the usingAll.write below, which grants write entitlements on all component types.
  private readonly entities = this.query(
    (q) => q.current.with(comps.ToBeDeleted).usingAll.write
  );
  execute() {
    for (const entity of this.entities.current) entity.delete();
  }
}
