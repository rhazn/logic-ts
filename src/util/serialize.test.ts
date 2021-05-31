import { PropositionalSyntax } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/World";
import { WorldPreference } from "../logic/WorldPreference";
import {
    propositionalWorldBinarySerializer,
    propositionalWorldSerializer,
    worldPreferenceBinarySerializer,
    worldPreferenceSerializer,
} from "./serialize";

describe("serialize entities", () => {
    describe("serialize propositional worlds", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);

        test.each([
            [new PropositionalWorld(syntax, new Set(["a"])), `["a"]`],
            [new PropositionalWorld(syntax, new Set(["a", "b"])), `["a","b"]`],
            [new PropositionalWorld(syntax, new Set(["a", "b", "c"])), `["a","b","c"]`],
            [new PropositionalWorld(syntax, new Set([])), `[]`],
        ])("serialize: %o", (input: PropositionalWorld, expected: string) => {
            expect(propositionalWorldSerializer(input)).toEqual(expected);
        });
    });

    describe("serialize propositional worlds as binary", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);

        test.each([
            [new PropositionalWorld(syntax, new Set(["a"])), 4],
            [new PropositionalWorld(syntax, new Set(["a", "b"])), 6],
            [new PropositionalWorld(syntax, new Set(["a", "b", "c"])), 7],
            [new PropositionalWorld(syntax, new Set([])), 0],
        ])("serialize: %o", (input: PropositionalWorld, expected: number) => {
            const serializedView = new Int8Array(propositionalWorldBinarySerializer(input));

            expect(serializedView[0]).toEqual(expected);
        });
    });

    describe("serialize world preferences", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);

        test.each([
            [
                new WorldPreference([
                    [new PropositionalWorld(syntax, new Set(["a"])), new PropositionalWorld(syntax, new Set(["b"]))],
                ]),
                `[[["a"],["b"]]]`,
            ],
            [
                new WorldPreference([
                    [new PropositionalWorld(syntax, new Set(["a"])), new PropositionalWorld(syntax, new Set(["b"]))],
                    [new PropositionalWorld(syntax, new Set(["a", "c"]))],
                ]),
                `[[["a"],["b"]],[["a","c"]]]`,
            ],
            [
                new WorldPreference([
                    [new PropositionalWorld(syntax, new Set(["a"])), new PropositionalWorld(syntax, new Set(["b"]))],
                    [],
                    [new PropositionalWorld(syntax, new Set(["a", "c"]))],
                ]),
                `[[["a"],["b"]],[],[["a","c"]]]`,
            ],
            [new WorldPreference([]), `[]`],
        ])("parse: %o", (input: WorldPreference, expected: string) => {
            expect(worldPreferenceSerializer(input)).toEqual(expected);
        });
    });

    describe("serialize world preferences as binary", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);

        test.each([
            [
                new WorldPreference([
                    [new PropositionalWorld(syntax, new Set(["a"])), new PropositionalWorld(syntax, new Set(["b"]))],
                ]),
                new DataView(new Uint8Array([1, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 0, 4, 2]).buffer),
            ],
            [
                new WorldPreference([
                    [new PropositionalWorld(syntax, new Set(["a"])), new PropositionalWorld(syntax, new Set(["b"]))],
                    [new PropositionalWorld(syntax, new Set(["a", "c"]))],
                ]),
                new DataView(
                    new Uint8Array([1, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 0, 4, 2, 0, 0, 0, 1, 0, 0, 0, 0, 5]).buffer,
                ),
            ],
            [
                new WorldPreference([
                    [new PropositionalWorld(syntax, new Set(["a"])), new PropositionalWorld(syntax, new Set(["b"]))],
                    [],
                    [new PropositionalWorld(syntax, new Set(["a", "c"]))],
                ]),
                new DataView(
                    new Uint8Array([1, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 1, 4, 2, 0, 0, 0, 1, 0, 0, 0, 0, 5]).buffer,
                ),
            ],
            [new WorldPreference([]), new DataView(new Uint8Array([]).buffer)],
        ])("parse: %o", (input: WorldPreference, expected: DataView) => {
            const serialized = new DataView(worldPreferenceBinarySerializer(input));

            expect(expected.byteLength).toEqual(serialized.byteLength);

            for (let i = 0; i < expected.byteLength; i++) {
                expect(expected.getUint8(i)).toEqual(serialized.getUint8(i));
            }
        });
    });
});
