import { PropositionalSyntax } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/PropositionalWorld";
import { WorldPreference } from "../logic/WorldPreference";
import { PropositionalWorldParserFactory } from "../serialize/PropositionalWorldParserFactory";
import { WorldPreferenceParserFactory } from "../serialize/WorldPreferenceParserFactory";

describe("parse binary", () => {
    describe("propositional worlds", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);
        const worldParser = new PropositionalWorldParserFactory(syntax);

        test.each([
            [4, new PropositionalWorld(syntax, new Set(["a"]))],
            [6, new PropositionalWorld(syntax, new Set(["a", "b"]))],
            [7, new PropositionalWorld(syntax, new Set(["a", "b", "c"]))],
            [0, new PropositionalWorld(syntax, new Set([]))],
        ])("parse: %j", (input: number, expected: PropositionalWorld) => {
            const buffer = new ArrayBuffer(1);
            const view = new Uint8Array(buffer);
            view[0] = input;

            expect(worldParser.fromBinary(buffer).assignment).toEqual(expected.assignment);
            expect(worldParser.fromBinary(buffer).syntax).toEqual(expected.syntax);
        });
    });

    describe("world preferences", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);
        const preferenceParser = new WorldPreferenceParserFactory(syntax);

        test.each([
            [
                new Uint8Array([1, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 0, 4, 2]).buffer,
                new WorldPreference([
                    [new PropositionalWorld(syntax, new Set(["a"])), new PropositionalWorld(syntax, new Set(["b"]))],
                ]),
            ],
            [
                new Uint8Array([1, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 0, 4, 2, 0, 0, 0, 1, 0, 0, 0, 0, 5]).buffer,
                new WorldPreference([
                    [new PropositionalWorld(syntax, new Set(["a"])), new PropositionalWorld(syntax, new Set(["b"]))],
                    [new PropositionalWorld(syntax, new Set(["a", "c"]))],
                ]),
            ],
            [
                new Uint8Array([1, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 1, 4, 2, 0, 0, 0, 1, 0, 0, 0, 0, 5]).buffer,
                new WorldPreference([
                    [new PropositionalWorld(syntax, new Set(["a"])), new PropositionalWorld(syntax, new Set(["b"]))],
                    [],
                    [new PropositionalWorld(syntax, new Set(["a", "c"]))],
                ]),
            ],
            [new Uint8Array([]).buffer, new WorldPreference([])],
        ])("parse: %o", (input: ArrayBuffer, expected: WorldPreference) => {
            const inputPreference = preferenceParser.fromBinary(input);

            expect(expected.data).toEqual(inputPreference.data);
        });
    });
});