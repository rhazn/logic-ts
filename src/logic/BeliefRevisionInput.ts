import { SerializableJson } from "../serialize/interface/SerializeableJson";
import { Formula } from "./Syntax";
import { WorldPreference } from "./WorldPreference";

export class SingleStepBeliefRevisionInput implements SerializableJson {
    constructor(public tpoBefore: WorldPreference, public input: Formula, public tpoAfter: WorldPreference) {}

    public toJson(): string {
        return JSON.stringify({
            tpoBefore: JSON.parse(this.tpoBefore.toJson()),
            tpoAfter: JSON.parse(this.tpoAfter.toJson()),
            input: this.input,
        });
    }
}
