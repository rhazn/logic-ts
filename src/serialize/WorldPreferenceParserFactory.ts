import { PropositionalSyntax } from "../logic/Syntax";
import { ParserFactoryBinary } from "./interface/ParserFactoryBinary";
import { ParserFactoryJson } from "./interface/ParserFactoryJson";
import { WorldPreference } from "../logic/WorldPreference";
import { PropositionalWorld } from "../logic/PropositionalWorld";
import { PropositionalWorldParserFactory } from "./PropositionalWorldParserFactory";

export class WorldPreferenceParserFactory
    implements ParserFactoryJson<WorldPreference>, ParserFactoryBinary<WorldPreference>
{
    constructor(private syntax: PropositionalSyntax) {}

    public fromJson(json: string): WorldPreference {
        const parsed = JSON.parse(json);

        return new WorldPreference(
            parsed.map(rank => rank.map(assignment => new PropositionalWorld(this.syntax, new Set(assignment)))),
        );
    }

    public fromBinary(binary: ArrayBuffer): WorldPreference {
        const result = [];
        const view = new DataView(binary);

        if (view.byteLength === 0) {
            return new WorldPreference(result);
        }

        let offset = 0;

        // Ignore version
        offset += Uint8Array.BYTES_PER_ELEMENT;

        // read syntaxsize
        const syntaxSize = view.getUint32(offset);
        offset += Uint32Array.BYTES_PER_ELEMENT;

        const worldView = PropositionalWorldParserFactory.getMinimalViewForSyntaxSize(syntaxSize, binary);

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

                rank.push(PropositionalWorldParserFactory.worldFromNumber(this.syntax, worldNumber));
            }

            offset += numberOfWorlds * worldView.BYTES_PER_ELEMENT;

            result.push(rank);

            for (let j = 0; j < emptyRanks; j++) {
                result.push([]);
            }
        }

        return new WorldPreference(result);
    }
}
