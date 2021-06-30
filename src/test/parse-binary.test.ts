import { PropositionalSignature } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/PropositionalWorld";
import { WorldPreference } from "../logic/WorldPreference";
import { PropositionalWorldParserFactory } from "../serialize/PropositionalWorldParserFactory";
import { WorldPreferenceParserFactory } from "../serialize/WorldPreferenceParserFactory";

describe("parse binary", () => {
    describe("propositional worlds", () => {
        const signature: PropositionalSignature = new Set(["a", "b", "c"]);
        const worldParser = new PropositionalWorldParserFactory(signature);

        test.each([
            [4, new PropositionalWorld(signature, new Set(["a"]))],
            [6, new PropositionalWorld(signature, new Set(["a", "b"]))],
            [7, new PropositionalWorld(signature, new Set(["a", "b", "c"]))],
            [0, new PropositionalWorld(signature, new Set([]))],
        ])("parse: %j", (input: number, expected: PropositionalWorld) => {
            const buffer = new ArrayBuffer(1);
            const view = new Uint8Array(buffer);
            view[0] = input;

            expect(worldParser.fromBinary(buffer).assignment).toEqual(expected.assignment);
            expect(worldParser.fromBinary(buffer).signature).toEqual(expected.signature);
        });
    });

    describe("world preferences", () => {
        const signature: PropositionalSignature = new Set(["a", "b", "c"]);
        const preferenceParser = new WorldPreferenceParserFactory(signature);

        test.each([
            [
                new Uint8Array([1, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 0, 4, 2]).buffer,
                new WorldPreference(signature, [
                    [
                        new PropositionalWorld(signature, new Set(["a"])),
                        new PropositionalWorld(signature, new Set(["b"])),
                    ],
                ]),
            ],
            [
                new Uint8Array([1, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 0, 4, 2, 0, 0, 0, 1, 0, 0, 0, 0, 5]).buffer,
                new WorldPreference(signature, [
                    [
                        new PropositionalWorld(signature, new Set(["a"])),
                        new PropositionalWorld(signature, new Set(["b"])),
                    ],
                    [new PropositionalWorld(signature, new Set(["a", "c"]))],
                ]),
            ],
            [
                new Uint8Array([1, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 1, 4, 2, 0, 0, 0, 1, 0, 0, 0, 0, 5]).buffer,
                new WorldPreference(signature, [
                    [
                        new PropositionalWorld(signature, new Set(["a"])),
                        new PropositionalWorld(signature, new Set(["b"])),
                    ],
                    [],
                    [new PropositionalWorld(signature, new Set(["a", "c"]))],
                ]),
            ],
            [new Uint8Array([]).buffer, new WorldPreference(signature, [])],
        ])("parse: %o", (input: ArrayBuffer, expected: WorldPreference) => {
            const inputPreference = preferenceParser.fromBinary(input);

            expect(expected.data).toEqual(inputPreference.data);
        });
    });

    describe("world preferences ranklist", () => {
        const signature: PropositionalSignature = new Set(["a", "b", "c"]);
        const preferenceParser = new WorldPreferenceParserFactory(signature);

        test.each([
            [
                new Uint8Array([
                    1, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0,
                ]).buffer,
                new WorldPreference(signature, [
                    [
                        new PropositionalWorld(signature, new Set(["b"])),
                        new PropositionalWorld(signature, new Set(["a"])),
                    ],
                ]),
            ],
            [
                new Uint8Array([
                    1, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0,
                    0, 0, 0, 0,
                ]).buffer,
                new WorldPreference(signature, [
                    [
                        new PropositionalWorld(signature, new Set(["b"])),
                        new PropositionalWorld(signature, new Set(["a"])),
                    ],
                    [new PropositionalWorld(signature, new Set(["a", "c"]))],
                ]),
            ],
            [
                new Uint8Array([
                    1, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 0,
                    0, 0, 0, 0,
                ]).buffer,
                new WorldPreference(signature, [
                    [
                        new PropositionalWorld(signature, new Set(["b"])),
                        new PropositionalWorld(signature, new Set(["a"])),
                    ],
                    [],
                    [new PropositionalWorld(signature, new Set(["a", "c"]))],
                ]),
            ],
            [new Uint8Array([]).buffer, new WorldPreference(signature, [])],
        ])("parse: %o", (input: ArrayBuffer, expected: WorldPreference) => {
            const inputPreference = preferenceParser.fromBinaryRanklist(input);

            expect(expected.data).toEqual(inputPreference.data);
        });
    });
});
