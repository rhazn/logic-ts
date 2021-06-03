import { PropositionalAssignment } from "./Semantic";
import { SerializableBinary } from "../serialize/interface/SerializeableBinary";
import { SerializableJson } from "../serialize/interface/SerializeableJson";
import { PropositionalSyntax } from "./Syntax";
import { PropositionalWorldParserFactory } from "../serialize/PropositionalWorldParserFactory";

export class PropositionalWorld implements SerializableJson, SerializableBinary {
    constructor(public syntax: PropositionalSyntax, public assignment: PropositionalAssignment) {}

    public toJson(): string {
        return JSON.stringify([...this.assignment]);
    }

    public toBinary(): ArrayBuffer {
        const syntaxSize = this.syntax.size;
        const result = new ArrayBuffer(PropositionalWorldParserFactory.getMinimalByteSyntaxSize(syntaxSize));
        const view = PropositionalWorldParserFactory.getMinimalViewForSyntaxSize(syntaxSize, result);

        view[0] = this.getWorldNumber();

        return result;
    }

    public getWorldNumber(): number {
        return [...this.syntax].reduce((previous, current, index) => {
            return previous + (this.assignment.has(current) ? Math.pow(2, this.syntax.size - 1 - index) : 0);
        }, 0);
    }
}
