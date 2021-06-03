import { PropositionalSyntax } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/PropositionalWorld";
import { WorldPreference } from "../logic/WorldPreference";
import { DMFSystem } from "../logic/DMFSystem";

describe("serialize entities as json", () => {
    describe("propositional worlds", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);

        test.each([
            [new PropositionalWorld(syntax, new Set(["a"])), `["a"]`],
            [new PropositionalWorld(syntax, new Set(["a", "b"])), `["a","b"]`],
            [new PropositionalWorld(syntax, new Set(["a", "b", "c"])), `["a","b","c"]`],
            [new PropositionalWorld(syntax, new Set([])), `[]`],
        ])("serialize: %o", (input: PropositionalWorld, expected: string) => {
            expect(input.toJson()).toEqual(expected);
        });
    });

    describe("world preferences", () => {
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
            expect(input.toJson()).toEqual(expected);
        });
    });

    describe("dmf systems", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b"]);

        test.each([
            [
                new DMFSystem(
                    new Set([
                        new WorldPreference([
                            [
                                new PropositionalWorld(syntax, new Set(["a"])),
                                new PropositionalWorld(syntax, new Set(["b"])),
                            ],
                        ]),
                        new WorldPreference([
                            [
                                new PropositionalWorld(syntax, new Set([])),
                                new PropositionalWorld(syntax, new Set(["a", "b"])),
                            ],
                        ]),
                    ]),
                    new Set([{ fromIndex: 0, toIndex: 1, formula: "a" }]),
                ),
                `{"tpos":[[[["a"],["b"]]],[[[],["a","b"]]]],"edges":[{"fromIndex":0,"toIndex":1,"formula":"a"}]}`,
            ],
            [new DMFSystem(new Set([]), new Set()), `{"tpos":[],"edges":[]}`],
        ])("parse: %o", (input: DMFSystem, expected: string) => {
            expect(input.toJson()).toEqual(expected);
        });
    });
});
