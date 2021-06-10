import { PropositionalSignature } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/PropositionalWorld";
import { ParserFactoryBinary } from "./interface/ParserFactoryBinary";
import { ParserFactoryJson } from "./interface/ParserFactoryJson";

export class PropositionalWorldParserFactory
    implements ParserFactoryJson<PropositionalWorld>, ParserFactoryBinary<PropositionalWorld>
{
    constructor(private signature: PropositionalSignature) {}

    public fromJson(json: string): PropositionalWorld {
        const parsed = JSON.parse(json);

        return new PropositionalWorld(this.signature, new Set(parsed));
    }

    public fromBinary(binary: ArrayBuffer): PropositionalWorld {
        const view = PropositionalWorldParserFactory.getMinimalViewForSignatureSize(this.signature.size, binary);

        return PropositionalWorldParserFactory.worldFromNumber(this.signature, view[0]);
    }

    public static worldFromNumber(signature: PropositionalSignature, number: number): PropositionalWorld {
        const assignment = [...number.toString(2).padStart(signature.size, "0")].reduce((previous, current, index) => {
            return previous.concat(current === "1" ? [...signature][index] : []);
        }, []);

        return new PropositionalWorld(signature, new Set(assignment));
    }

    public static getMinimalViewForSignatureSize(
        size: number,
        buffer: ArrayBuffer,
    ): Uint8Array | Uint16Array | Uint32Array {
        if (size <= 8) {
            return new Uint8Array(buffer);
        }

        if (size <= 16) {
            return new Uint16Array(buffer);
        }

        return new Uint32Array(buffer);
    }

    public static getMinimalByteSignatureSize(size: number): number {
        if (size <= 8) {
            return Uint8Array.BYTES_PER_ELEMENT;
        }

        if (size <= 16) {
            return Uint16Array.BYTES_PER_ELEMENT;
        }

        return Uint32Array.BYTES_PER_ELEMENT;
    }
}
