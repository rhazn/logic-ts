import { PropositionalSyntax } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/World";
import { WorldPreference } from "../logic/WorldPreference";
import {
    propositionalWorldParser,
    propositionalWorldParserBinary,
    worldPreferenceParser,
    worldPreferenceParserBinary,
} from "./parse";

describe("parsing strings", () => {
    describe("parsing propositional worlds", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);
        const worldParser = propositionalWorldParser(syntax);

        test.each([
            [`["a"]`, new PropositionalWorld(syntax, new Set(["a"]))],
            [`["a", "b"]`, new PropositionalWorld(syntax, new Set(["a", "b"]))],
            [`["c", "a", "b"]`, new PropositionalWorld(syntax, new Set(["a", "b", "c"]))],
            [`[]`, new PropositionalWorld(syntax, new Set([]))],
        ])("parse: %j", (input: string, expected: PropositionalWorld) => {
            expect(worldParser(input).assignment).toEqual(expected.assignment);
            expect(worldParser(input).syntax).toEqual(expected.syntax);
        });
    });

    describe("parsing propositional worlds as binary", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);
        const worldParser = propositionalWorldParserBinary(syntax);

        test.each([
            [4, new PropositionalWorld(syntax, new Set(["a"]))],
            [6, new PropositionalWorld(syntax, new Set(["a", "b"]))],
            [7, new PropositionalWorld(syntax, new Set(["a", "b", "c"]))],
            [0, new PropositionalWorld(syntax, new Set([]))],
        ])("parse: %j", (input: number, expected: PropositionalWorld) => {
            const buffer = new ArrayBuffer(1);
            const view = new Uint8Array(buffer);
            view[0] = input;

            expect(worldParser(buffer).assignment).toEqual(expected.assignment);
            expect(worldParser(buffer).syntax).toEqual(expected.syntax);
        });
    });

    describe("parsing world preferences", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);
        const preferenceParser = worldPreferenceParser(syntax);

        test.each([
            [
                `[[["a"], ["b"]]]`,
                new WorldPreference([
                    [new PropositionalWorld(syntax, new Set(["a"])), new PropositionalWorld(syntax, new Set(["b"]))],
                ]),
            ],
            [
                `[[["a"], ["b"]], [["a", "c"]]]`,
                new WorldPreference([
                    [new PropositionalWorld(syntax, new Set(["a"])), new PropositionalWorld(syntax, new Set(["b"]))],
                    [new PropositionalWorld(syntax, new Set(["a", "c"]))],
                ]),
            ],
            [
                `[[["a"], ["b"]], [], [["a", "c"]]]`,
                new WorldPreference([
                    [new PropositionalWorld(syntax, new Set(["a"])), new PropositionalWorld(syntax, new Set(["b"]))],
                    [],
                    [new PropositionalWorld(syntax, new Set(["a", "c"]))],
                ]),
            ],
            [`[]`, new WorldPreference([])],
        ])("parse: %j", (input: string, expected: WorldPreference) => {
            expect(preferenceParser(input).data).toEqual(expected.data);
        });
    });

    describe("parsing world preferences as binary", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);
        const preferenceParser = worldPreferenceParserBinary(syntax);

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
            const inputPreference = preferenceParser(input);

            expect(expected.data).toEqual(inputPreference.data);
        });
    });
});
