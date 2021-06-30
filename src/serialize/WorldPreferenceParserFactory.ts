import { PropositionalSignature } from "../logic/Syntax";
import { ParserFactoryBinary } from "./interface/ParserFactoryBinary";
import { ParserFactoryJson } from "./interface/ParserFactoryJson";
import { WorldPreference } from "../logic/WorldPreference";
import { PropositionalWorld } from "../logic/PropositionalWorld";
import { PropositionalWorldParserFactory } from "./PropositionalWorldParserFactory";

export class WorldPreferenceParserFactory
    implements ParserFactoryJson<WorldPreference>, ParserFactoryBinary<WorldPreference>
{
    constructor(private signature: PropositionalSignature) {}

    public fromJson(json: string): WorldPreference {
        const parsed = JSON.parse(json);
        const signature = new Set(parsed.signature) as PropositionalSignature;

        if (signature.size !== this.signature.size) {
            throw Error(
                `Signature size does not match. Found in data: ${signature.size}, defined in parser: ${this.signature.size}.`,
            );
        }

        return new WorldPreference(
            signature,
            parsed.ranks.map(rank => rank.map(assignment => new PropositionalWorld(signature, new Set(assignment)))),
        );
    }

    public fromBinary(binary: ArrayBuffer): WorldPreference {
        const result = [];
        const view = new DataView(binary);

        if (view.byteLength === 0) {
            return new WorldPreference(this.signature, result);
        }

        let offset = 0;

        // Ignore version
        offset += Uint8Array.BYTES_PER_ELEMENT;

        // read signaturesize
        const signatureSize = view.getUint32(offset);
        if (signatureSize !== this.signature.size) {
            throw Error(
                `Signature size does not match. Found in data: ${signatureSize}, defined in parser: ${this.signature.size}.`,
            );
        }

        offset += Uint32Array.BYTES_PER_ELEMENT;

        const worldView = PropositionalWorldParserFactory.getMinimalViewForSignatureSize(signatureSize, binary);

        let retrieveWorld = view.getUint32.bind(view);
        switch (worldView.BYTES_PER_ELEMENT) {
            case 1:
                retrieveWorld = view.getUint8.bind(view);
                break;
            case 2:
                retrieveWorld = view.getUint16.bind(view);
                break;
            case 4:
                retrieveWorld = view.getUint32.bind(view);
                break;
        }

        while (offset < view.byteLength) {
            const numberOfWorlds = view.getUint32(offset);
            offset += Uint32Array.BYTES_PER_ELEMENT;

            const emptyRanks = view.getUint32(offset);
            offset += Uint32Array.BYTES_PER_ELEMENT;

            const rank = [];

            for (let i = 0; i < numberOfWorlds; i++) {
                const worldNumber = retrieveWorld(offset + i * worldView.BYTES_PER_ELEMENT);

                rank.push(PropositionalWorldParserFactory.worldFromNumber(this.signature, worldNumber));
            }

            offset += numberOfWorlds * worldView.BYTES_PER_ELEMENT;

            result.push(rank);

            for (let j = 0; j < emptyRanks; j++) {
                result.push([]);
            }
        }

        return new WorldPreference(this.signature, result);
    }

    public fromBinaryRanklist(binary: ArrayBuffer): WorldPreference {
        const result = [];
        const view = new DataView(binary);

        if (view.byteLength === 0) {
            return new WorldPreference(this.signature, result);
        }

        let offset = 0;

        // Ignore version
        offset += Uint8Array.BYTES_PER_ELEMENT;

        // read signaturesize
        const signatureSize = view.getUint32(offset);

        if (signatureSize !== this.signature.size) {
            throw Error(
                `Signature size does not match. Found in data: ${signatureSize}, defined in parser: ${this.signature.size}.`,
            );
        }

        offset += Uint32Array.BYTES_PER_ELEMENT;

        for (let worldIndex = 0; offset < view.byteLength; worldIndex++, offset += Uint32Array.BYTES_PER_ELEMENT) {
            // ranks are saved with an offset of 1 so that "0" means the world does not exist
            const rank = view.getUint32(offset) - 1;

            if (rank === -1) {
                continue;
            }

            const world = PropositionalWorldParserFactory.worldFromNumber(this.signature, worldIndex);

            if (result[rank] === undefined) {
                result[rank] = [];
            }

            result[rank] = [...result[rank], world];
        }

        for (var i = 0; i < result.length; i++) {
            if (result[i] === undefined) {
                result[i] = [];
            }
        }

        return new WorldPreference(this.signature, result);
    }
}
