import { PropositionalWorldParserFactory } from "../serialize/PropositionalWorldParserFactory";
import { SerializableBinary } from "../serialize/interface/SerializeableBinary";
import { SerializableJson } from "../serialize/interface/SerializeableJson";
import { PropositionalWorld } from "./PropositionalWorld";
import { PropositionalSignature } from "./Syntax";

export class WorldPreference implements SerializableJson, SerializableBinary {
    constructor(public signature: PropositionalSignature, public data: PropositionalWorld[][]) {}

    public toJson(): string {
        return JSON.stringify({
            signature: [...this.signature],
            ranks: this.data.map(rank => rank.map(world => JSON.parse(world.toJson()))),
        });
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

        const signatureSize = this.signature.size;

        const result = new ArrayBuffer(
            // Version
            Uint8Array.BYTES_PER_ELEMENT +
                // Signature size
                Uint32Array.BYTES_PER_ELEMENT +
                // Number of worlds in rank + distance to next rank
                numberOfFilledRanks * (Uint32Array.BYTES_PER_ELEMENT * 2) +
                // actual worlds
                numberOfWorlds * PropositionalWorldParserFactory.getMinimalByteSignatureSize(signatureSize),
        );

        const view = new DataView(result);

        // Version
        view.setUint8(0, 1);

        // Signature size
        view.setUint32(Uint8Array.BYTES_PER_ELEMENT, signatureSize);

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
                addedWorlds * PropositionalWorldParserFactory.getMinimalByteSignatureSize(signatureSize) +
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
                switch (PropositionalWorldParserFactory.getMinimalByteSignatureSize(signatureSize)) {
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

    /**
     * Exports a WorldPreference to a binary representation using a list of ranks for every world.
     */
    public toBinaryRanklist(): ArrayBuffer {
        if (!this.data[0]) {
            return new ArrayBuffer(0);
        }

        const signatureSize = this.signature.size;
        const possibleWorlds = Math.pow(2, signatureSize);

        // Array buffers are initialized to 0
        // 4294967295 is the maximum number in an unsigned 32 bit array
        const result = new ArrayBuffer(
            // Version
            Uint8Array.BYTES_PER_ELEMENT +
                // Signature size
                Uint32Array.BYTES_PER_ELEMENT +
                // Ranks
                possibleWorlds * Uint32Array.BYTES_PER_ELEMENT,
        );

        const view = new DataView(result);

        // Version
        view.setUint8(0, 1);

        // Signature size
        view.setUint32(Uint8Array.BYTES_PER_ELEMENT, signatureSize);

        let rankIndex = 0;
        for (const rank of this.data) {
            for (const world of rank) {
                // we are treating 0 as "does not exist" and shifting all ranks up by one
                view.setUint32(
                    Uint8Array.BYTES_PER_ELEMENT +
                        Uint32Array.BYTES_PER_ELEMENT +
                        world.getWorldNumber() * Uint32Array.BYTES_PER_ELEMENT,
                    rankIndex + 1,
                );
            }
            rankIndex++;
        }

        return result;
    }
}
