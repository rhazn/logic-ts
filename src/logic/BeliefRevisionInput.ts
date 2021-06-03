import { Formula } from "./Syntax";
import { WorldPreference } from "./WorldPreference";

export class SingleStepBeliefRevisionInput {
    constructor(public tpoBefore: WorldPreference, public input: Formula, public tpoAfter: WorldPreference) {}
}
