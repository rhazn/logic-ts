import { PropositionalAssignment } from "./Semantic";
import { SerializableBinary } from "../serialize/interface/SerializeableBinary";
import { SerializableJson } from "../serialize/interface/SerializeableJson";
import { PropositionalSignature } from "./Syntax";
import { PropositionalWorldParserFactory } from "../serialize/PropositionalWorldParserFactory";

export class PropositionalWorld implements SerializableJson, SerializableBinary {
    constructor(public signature: PropositionalSignature, public assignment: PropositionalAssignment) {}

    public toJson(): string {
        return JSON.stringify([...this.assignment]);
    }

    public toBinary(): ArrayBuffer {
        const signatureSize = this.signature.size;
        const result = new ArrayBuffer(PropositionalWorldParserFactory.getMinimalByteSignatureSize(signatureSize));
        const view = PropositionalWorldParserFactory.getMinimalViewForSignatureSize(signatureSize, result);

        view[0] = this.getWorldNumber();

        return result;
    }

    public getWorldNumber(): number {
        return [...this.signature].reduce((previous, current, index) => {
            return previous + (this.assignment.has(current) ? Math.pow(2, this.signature.size - 1 - index) : 0);
        }, 0);
    }
}
