import { PropositionalSyntax } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/World";
import { WorldPreference } from "../logic/WorldPreference";
import { propositionalWorldSerializer, worldPreferenceSerializer } from "./serialize";

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
});
