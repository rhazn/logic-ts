import { PropositionalWorldParserFactory } from "../serialize/PropositionalWorldParserFactory";
import { SerializableBinary } from "../serialize/interface/SerializeableBinary";
import { SerializableJson } from "../serialize/interface/SerializeableJson";
import { PropositionalWorld } from "./PropositionalWorld";

export class WorldPreference implements SerializableJson, SerializableBinary {
    constructor(public data: PropositionalWorld[][]) {}

    public toJson(): string {
        return JSON.stringify(this.data.map(rank => rank.map(world => [...world.assignment])));
    }

    public toBinary(): ArrayBuffer {
        const numberOfWorlds = this.data.reduce((totalWorlds, currentRank) => {
            return totalWorlds + currentRank.length;
        }, 0);

        const numberOfFilledRanks = this.data.reduce((totalWorlds, currentRank) => {
            return totalWorlds + (currentRank.length > 0 ? 1 : 0);
        }, 0);

        if (numberOfFilledRanks === 0) {
            return new ArrayBuffer(0);
        }

        // todo get syntaxsize from a concrete world, dont guess 0,0 is filled
        const syntaxSize = this.data[0][0].syntax.size;

        const result = new ArrayBuffer(
            // Version
            Uint8Array.BYTES_PER_ELEMENT +
                // Syntax size
                Uint32Array.BYTES_PER_ELEMENT +
                // Number of worlds in rank + distance to next rank
                numberOfFilledRanks * (Uint32Array.BYTES_PER_ELEMENT * 2) +
                // actual worlds
                numberOfWorlds * PropositionalWorldParserFactory.getMinimalByteSyntaxSize(syntaxSize),
        );

        const view = new DataView(result);

        // Version
        view.setUint8(0, 1);

        // Syntax size
        view.setUint32(Uint8Array.BYTES_PER_ELEMENT, syntaxSize);

        let addedRanks = 0;
        let addedWorlds = 0;
        for (let i = 0; i < this.data.length; i++) {
            const rank = this.data[i];

            if (rank.length === 0) {
                continue;
            }

            const rankOffset =
                Uint8Array.BYTES_PER_ELEMENT +
                Uint32Array.BYTES_PER_ELEMENT +
                addedWorlds * PropositionalWorldParserFactory.getMinimalByteSyntaxSize(syntaxSize) +
                addedRanks * Uint32Array.BYTES_PER_ELEMENT * 2;

            const remainingRanks = this.data.slice(i + 1, this.data.length);
            const nextFilledRankIndex = remainingRanks.findIndex(rank => rank.length > 0);

            view.setUint32(rankOffset, rank.length);
            view.setUint32(
                rankOffset + Uint32Array.BYTES_PER_ELEMENT,
                nextFilledRankIndex === -1 ? 0 : nextFilledRankIndex,
            );

            const worldOffset = rankOffset + Uint32Array.BYTES_PER_ELEMENT * 2;

            for (let j = 0; j < rank.length; j++) {
                const world = rank[j];
                switch (PropositionalWorldParserFactory.getMinimalByteSyntaxSize(syntaxSize)) {
                    case Uint8Array.BYTES_PER_ELEMENT:
                        view.setUint8(worldOffset + j, world.getWorldNumber());
                        break;
                    case Uint16Array.BYTES_PER_ELEMENT:
                        view.setUint16(worldOffset + j, world.getWorldNumber());
                        break;
                    case Uint32Array.BYTES_PER_ELEMENT:
                        view.setUint32(worldOffset + j, world.getWorldNumber());
                        break;
                }
            }

            addedWorlds += rank.length;
            addedRanks += 1;
        }

        return result;
    }
}
