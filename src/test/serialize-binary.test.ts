import { PropositionalSyntax } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/PropositionalWorld";
import { WorldPreference } from "../logic/WorldPreference";

describe("serialize entities to binary", () => {
    describe("propositional worlds", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);

        test.each([
            [new PropositionalWorld(syntax, new Set(["a"])), 4],
            [new PropositionalWorld(syntax, new Set(["a", "b"])), 6],
            [new PropositionalWorld(syntax, new Set(["a", "b", "c"])), 7],
            [new PropositionalWorld(syntax, new Set([])), 0],
        ])("serialize: %o", (input: PropositionalWorld, expected: number) => {
            const serializedView = new Int8Array(input.toBinary());

            expect(serializedView[0]).toEqual(expected);
        });
    });

    describe("world preferences", () => {
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
            const serialized = new DataView(input.toBinary());

            expect(expected.byteLength).toEqual(serialized.byteLength);

            for (let i = 0; i < expected.byteLength; i++) {
                expect(expected.getUint8(i)).toEqual(serialized.getUint8(i));
            }
        });
    });
});
