import { PropositionalSyntax, PropositionalVariable } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/World";
import { WorldPreference } from "../logic/WorldPreference";
import { getMinimalViewForSyntaxSize } from "./serialize";

export function worldPreferenceParserBinary(syntax: PropositionalSyntax): (input: ArrayBuffer) => WorldPreference {
    return (input: ArrayBuffer): WorldPreference => {
        const result = [];
        const view = new DataView(input);

        if (view.byteLength === 0) {
            return new WorldPreference(result);
        }

        let offset = 0;

        // Ignore version
        offset += Uint8Array.BYTES_PER_ELEMENT;

        // read syntaxsize
        const syntaxSize = view.getUint32(offset);
        offset += Uint32Array.BYTES_PER_ELEMENT;

        const worldView = getMinimalViewForSyntaxSize(syntaxSize, input);

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

                rank.push(worldFromNumber(syntax, worldNumber));
            }

            offset += numberOfWorlds * worldView.BYTES_PER_ELEMENT;

            result.push(rank);

            for (let j = 0; j < emptyRanks; j++) {
                result.push([]);
            }
        }

        return new WorldPreference(result);
    };
}

export function propositionalWorldParserBinary(
    syntax: PropositionalSyntax,
): (input: ArrayBuffer) => PropositionalWorld {
    return (input: ArrayBuffer): PropositionalWorld => {
        const view = getMinimalViewForSyntaxSize(syntax.size, input);

        return worldFromNumber(syntax, view[0]);
    };
}

export function propositionalWorldParser(syntax: PropositionalSyntax): (input: string) => PropositionalWorld {
    return (input: string): PropositionalWorld => {
        const parsed = JSON.parse(input) as PropositionalVariable[];

        return new PropositionalWorld(syntax, new Set(parsed));
    };
}

export function worldPreferenceParser(syntax: PropositionalSyntax): (input: string) => WorldPreference {
    return (input: string): WorldPreference => {
        const parsed = JSON.parse(input) as PropositionalVariable[][][];

        return new WorldPreference(
            parsed.map(rank => rank.map(assignment => new PropositionalWorld(syntax, new Set(assignment)))),
        );
    };
}

function worldFromNumber(syntax: PropositionalSyntax, number: number): PropositionalWorld {
    const assignment = [...number.toString(2).padStart(syntax.size, "0")].reduce((previous, current, index) => {
        return previous.concat(current === "1" ? [...syntax][index] : []);
    }, []);

    return new PropositionalWorld(syntax, new Set(assignment));
}
