import { DMFSystem } from "./DMFSystem";
import { Formula } from "./Syntax";
import { WorldPreference } from "./WorldPreference";

export class DMFSystemState {
    constructor(public dmfSystem: DMFSystem, public beliefSet: Set<Formula>, public contextIndex: number) {}

    public getContext(): WorldPreference {
        return [...this.dmfSystem.tpos][this.contextIndex];
    }
}
