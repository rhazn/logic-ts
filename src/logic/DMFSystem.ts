import { SerializableJson } from "../serialize/interface/SerializeableJson";
import { Formula } from "./Syntax";
import { WorldPreference } from "./WorldPreference";

export interface DMFEdge {
    fromIndex: number;
    toIndex: number;
    formula: Formula;
}

export class DMFSystem implements SerializableJson {
    constructor(public tpos: Set<WorldPreference>, public edges: Set<DMFEdge>) {}

    public toJson(): string {
        return JSON.stringify({
            tpos: [...this.tpos].map(preference => JSON.parse(preference.toJson())),
            edges: [...this.edges],
        });
    }
}
