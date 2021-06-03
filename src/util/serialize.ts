import { PropositionalWorld } from "../logic/World";
import { WorldPreference } from "../logic/WorldPreference";

export function propositionalWorldBinarySerializer(world: PropositionalWorld): ArrayBuffer {
    const syntaxSize = world.syntax.size;
    const result = new ArrayBuffer(getMinimalByteSyntaxSize(syntaxSize));
    const view = getMinimalViewForSyntaxSize(syntaxSize, result);

    view[0] = getWorldNumber(world);

    return result;
}

export function worldPreferenceBinarySerializer(preference: WorldPreference): ArrayBuffer {
    const numberOfWorlds = preference.data.reduce((totalWorlds, currentRank) => {
        return totalWorlds + currentRank.length;
    }, 0);

    const numberOfFilledRanks = preference.data.reduce((totalWorlds, currentRank) => {
        return totalWorlds + (currentRank.length > 0 ? 1 : 0);
    }, 0);

    if (numberOfFilledRanks === 0) {
        return new ArrayBuffer(0);
    }

    // todo get syntaxsize from a concrete world, dont guess 0,0 is filled
    const syntaxSize = preference.data[0][0].syntax.size;

    const result = new ArrayBuffer(
        // Version
        Uint8Array.BYTES_PER_ELEMENT +
            // Syntax size
            Uint32Array.BYTES_PER_ELEMENT +
            // Number of worlds in rank + distance to next rank
            numberOfFilledRanks * (Uint32Array.BYTES_PER_ELEMENT * 2) +
            // actual worlds
            numberOfWorlds * getMinimalByteSyntaxSize(syntaxSize),
    );

    const view = new DataView(result);

    // Version
    view.setUint8(0, 1);

    // Syntax size
    view.setUint32(Uint8Array.BYTES_PER_ELEMENT, syntaxSize);

    let addedRanks = 0;
    let addedWorlds = 0;
    for (let i = 0; i < preference.data.length; i++) {
        const rank = preference.data[i];

        if (rank.length === 0) {
            continue;
        }

        const rankOffset =
            Uint8Array.BYTES_PER_ELEMENT +
            Uint32Array.BYTES_PER_ELEMENT +
            addedWorlds * getMinimalByteSyntaxSize(syntaxSize) +
            addedRanks * Uint32Array.BYTES_PER_ELEMENT * 2;

        const remainingRanks = preference.data.slice(i + 1, preference.data.length);
        const nextFilledRankIndex = remainingRanks.findIndex(rank => rank.length > 0);

        view.setUint32(rankOffset, rank.length);
        view.setUint32(
            rankOffset + Uint32Array.BYTES_PER_ELEMENT,
            nextFilledRankIndex === -1 ? 0 : nextFilledRankIndex,
        );

        const worldOffset = rankOffset + Uint32Array.BYTES_PER_ELEMENT * 2;

        for (let j = 0; j < rank.length; j++) {
            const world = rank[j];
            switch (getMinimalByteSyntaxSize(syntaxSize)) {
                case Uint8Array.BYTES_PER_ELEMENT:
                    view.setUint8(worldOffset + j, getWorldNumber(world));
                    break;
                case Uint16Array.BYTES_PER_ELEMENT:
                    view.setUint16(worldOffset + j, getWorldNumber(world));
                    break;
                case Uint32Array.BYTES_PER_ELEMENT:
                    view.setUint32(worldOffset + j, getWorldNumber(world));
                    break;
            }
        }

        addedWorlds += rank.length;
        addedRanks += 1;
    }

    return result;
}

export function propositionalWorldSerializer(world: PropositionalWorld): string {
    return JSON.stringify([...world.assignment]);
}

export function worldPreferenceSerializer(preference: WorldPreference): string {
    return JSON.stringify(preference.data.map(rank => rank.map(world => [...world.assignment])));
}

function getWorldNumber(world: PropositionalWorld): number {
    return [...world.syntax].reduce((previous, current, index) => {
        return previous + (world.assignment.has(current) ? Math.pow(2, world.syntax.size - 1 - index) : 0);
    }, 0);
}

function getMinimalByteSyntaxSize(size: number): number {
    if (size <= 8) {
        return Uint8Array.BYTES_PER_ELEMENT;
    }

    if (size <= 16) {
        return Uint16Array.BYTES_PER_ELEMENT;
    }

    return Uint32Array.BYTES_PER_ELEMENT;
}

export function getMinimalViewForSyntaxSize(size: number, buffer: ArrayBuffer): Uint8Array | Uint16Array | Uint32Array {
    if (size <= 8) {
        return new Uint8Array(buffer);
    }

    if (size <= 16) {
        return new Uint16Array(buffer);
    }

    return new Uint32Array(buffer);
}
