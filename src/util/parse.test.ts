import { PropositionalSyntax } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/World";
import { WorldPreference } from "../logic/WorldPreference";
import { propositionalWorldParser, worldPreferenceParser } from "./parse";

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
});
