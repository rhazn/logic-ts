import { PropositionalSyntax } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/PropositionalWorld";
import { WorldPreference } from "../logic/WorldPreference";
import { PropositionalWorldParserFactory } from "../serialize/PropositionalWorldParserFactory";
import { WorldPreferenceParserFactory } from "../serialize/WorldPreferenceParserFactory";
import { DMFSystemParserFactory } from "../serialize/DMFSystemParserFactory";
import { DMFSystemStateParserFactory } from "../serialize/DMFSystemStateParserFactory";
import { DMFSystem } from "../logic/DMFSystem";
import { DMFSystemState } from "../logic/DMFSystemState";

describe("parsing json", () => {
    describe("propositional worlds", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);
        const worldParser = new PropositionalWorldParserFactory(syntax);

        test.each([
            [`["a"]`, new PropositionalWorld(syntax, new Set(["a"]))],
            [`["a", "b"]`, new PropositionalWorld(syntax, new Set(["a", "b"]))],
            [`["c", "a", "b"]`, new PropositionalWorld(syntax, new Set(["a", "b", "c"]))],
            [`[]`, new PropositionalWorld(syntax, new Set([]))],
        ])("parse: %j", (input: string, expected: PropositionalWorld) => {
            expect(worldParser.fromJson(input).assignment).toEqual(expected.assignment);
            expect(worldParser.fromJson(input).syntax).toEqual(expected.syntax);
        });
    });

    describe("world preferences", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b", "c"]);
        const preferenceParser = new WorldPreferenceParserFactory(syntax);

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
            expect(preferenceParser.fromJson(input).data).toEqual(expected.data);
        });
    });

    describe("dmf systems", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b"]);
        const parser = new DMFSystemParserFactory(syntax);

        test.each([
            [
                `{"tpos":[[[["a"],["b"]]],[[[],["a","b"]]]],"edges":[{"fromIndex":0,"toIndex":1,"formula":"a"}]}`,
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
            ],
            [`{"tpos":[],"edges":[]}`, new DMFSystem(new Set([]), new Set())],
        ])("parse: %o", (input: string, expected: DMFSystem) => {
            expect(parser.fromJson(input)).toEqual(expected);
        });
    });

    describe("dmf systems state", () => {
        const syntax: PropositionalSyntax = new Set(["a", "b"]);
        const parser = new DMFSystemStateParserFactory(syntax);

        test.each([
            [
                `{"dmfSystem":{"tpos":[[[["a"],["b"]]],[[[],["a","b"]]]],"edges":[{"fromIndex":0,"toIndex":1,"formula":"a"}]},"beliefSet":["a"],"contextIndex":1}`,
                new DMFSystemState(
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
                    new Set("a"),
                    1,
                ),
            ],
            [
                `{"dmfSystem":{"tpos":[],"edges":[]},"beliefSet":[],"contextIndex":0}`,
                new DMFSystemState(new DMFSystem(new Set([]), new Set()), new Set(), 0),
            ],
        ])("parse: %o", (input: string, expected: DMFSystemState) => {
            expect(parser.fromJson(input)).toEqual(expected);
        });
    });
});
