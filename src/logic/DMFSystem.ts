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

    public addTpo(tpo: WorldPreference): DMFSystem {
        this.tpos.add(tpo);

        return this;
    }

    public removeTpo(index: number): DMFSystem {
        const edgesToDelete = [];

        this.edges.forEach(edge => {
            if (edge.fromIndex > index) {
                edge.fromIndex -= 1;
            }

            if (edge.toIndex > index) {
                edge.toIndex -= 1;
            }

            if (edge.fromIndex === index || edge.toIndex === index) {
                edgesToDelete.push(edge);
            }
        });

        edgesToDelete.forEach(edge => {
            this.edges.delete(edge);
        });

        this.tpos.delete([...this.tpos][index]);

        return this;
    }

    public addEdge(edge: DMFEdge): DMFSystem {
        this.edges.add(edge);

        return this;
    }

    public removeEdge(index: number): DMFSystem {
        this.edges.delete([...this.edges][index]);

        return this;
    }
}
