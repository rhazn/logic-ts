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
        [...this.edges]
            .filter(edge => {
                return edge.fromIndex === index || edge.toIndex === index;
            })
            .forEach(edge => {
                this.edges.delete(edge);
            });

        this.edges.forEach(edge => {
            if (edge.fromIndex > index) {
                edge.fromIndex -= 1;
            }

            if (edge.toIndex > index) {
                edge.toIndex -= 1;
            }
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

    public isCompleteGraph(): boolean {
        return this.edges.size === this.tpos.size * (this.tpos.size - 1);
    }

    public getFirstAllowedIndices(): { from: number; to: number } | undefined {
        for (let from = 0; from < this.tpos.size; from++) {
            for (let to = 0; to < this.tpos.size; to++) {
                if (from === to) {
                    continue;
                }

                if ([...this.edges].find(edge => edge.fromIndex === from && edge.toIndex === to) === undefined) {
                    // there is no edge between from and to yet, use this one
                    return { from: from, to: to };
                }
            }
        }
    }

    public getPossibleToIndices(edge: DMFEdge): number[] {
        return this.getTpoIndices()
            .filter(index => index !== edge.fromIndex)
            .filter(
                index =>
                    [...this.edges].find(
                        possibleEdge => possibleEdge.fromIndex === edge.fromIndex && possibleEdge.toIndex === index,
                    ) === undefined,
            )
            .concat([edge.toIndex]);
    }

    public getPossibleFromIndices(edge: DMFEdge): number[] {
        return this.getTpoIndices()
            .filter(index => index !== edge.toIndex)
            .filter(
                index =>
                    [...this.edges].find(
                        possibleEdge => possibleEdge.toIndex === edge.toIndex && possibleEdge.fromIndex === index,
                    ) === undefined,
            )
            .concat([edge.fromIndex]);
    }

    private getTpoIndices(): number[] {
        const possibleIndices = [];

        for (let i = 0; i < this.tpos.size; i++) {
            possibleIndices.push(i);
        }

        return possibleIndices;
    }
}
