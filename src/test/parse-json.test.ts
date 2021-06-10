import { PropositionalSignature } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/PropositionalWorld";
import { WorldPreference } from "../logic/WorldPreference";
import { PropositionalWorldParserFactory } from "../serialize/PropositionalWorldParserFactory";
import { WorldPreferenceParserFactory } from "../serialize/WorldPreferenceParserFactory";
import { DMFSystemParserFactory } from "../serialize/DMFSystemParserFactory";
import { DMFSystemStateParserFactory } from "../serialize/DMFSystemStateParserFactory";
import { BeliefRevisionInputParserFactory } from "../serialize/BeliefRevisionInputParserFactory";
import { DMFSystem } from "../logic/DMFSystem";
import { DMFSystemState } from "../logic/DMFSystemState";
import { SingleStepBeliefRevisionInput } from "../logic/BeliefRevisionInput";

describe("parsing json", () => {
    describe("propositional worlds", () => {
        const signature: PropositionalSignature = new Set(["a", "b", "c"]);
        const worldParser = new PropositionalWorldParserFactory(signature);

        test.each([
            [`["a"]`, new PropositionalWorld(signature, new Set(["a"]))],
            [`["a", "b"]`, new PropositionalWorld(signature, new Set(["a", "b"]))],
            [`["c", "a", "b"]`, new PropositionalWorld(signature, new Set(["a", "b", "c"]))],
            [`[]`, new PropositionalWorld(signature, new Set([]))],
        ])("parse: %j", (input: string, expected: PropositionalWorld) => {
            expect(worldParser.fromJson(input).assignment).toEqual(expected.assignment);
            expect(worldParser.fromJson(input).signature).toEqual(expected.signature);
        });
    });

    describe("world preferences", () => {
        const signature: PropositionalSignature = new Set(["a", "b", "c"]);
        const preferenceParser = new WorldPreferenceParserFactory(signature);

        test.each([
            [
                `[[["a"], ["b"]]]`,
                new WorldPreference([
                    [
                        new PropositionalWorld(signature, new Set(["a"])),
                        new PropositionalWorld(signature, new Set(["b"])),
                    ],
                ]),
            ],
            [
                `[[["a"], ["b"]], [["a", "c"]]]`,
                new WorldPreference([
                    [
                        new PropositionalWorld(signature, new Set(["a"])),
                        new PropositionalWorld(signature, new Set(["b"])),
                    ],
                    [new PropositionalWorld(signature, new Set(["a", "c"]))],
                ]),
            ],
            [
                `[[["a"], ["b"]], [], [["a", "c"]]]`,
                new WorldPreference([
                    [
                        new PropositionalWorld(signature, new Set(["a"])),
                        new PropositionalWorld(signature, new Set(["b"])),
                    ],
                    [],
                    [new PropositionalWorld(signature, new Set(["a", "c"]))],
                ]),
            ],
            [`[]`, new WorldPreference([])],
        ])("parse: %j", (input: string, expected: WorldPreference) => {
            expect(preferenceParser.fromJson(input).data).toEqual(expected.data);
        });
    });

    describe("dmf systems", () => {
        const signature: PropositionalSignature = new Set(["a", "b"]);
        const parser = new DMFSystemParserFactory(signature);

        test.each([
            [
                `{"tpos":[[[["a"],["b"]]],[[[],["a","b"]]]],"edges":[{"fromIndex":0,"toIndex":1,"formula":"a"}]}`,
                new DMFSystem(
                    new Set([
                        new WorldPreference([
                            [
                                new PropositionalWorld(signature, new Set(["a"])),
                                new PropositionalWorld(signature, new Set(["b"])),
                            ],
                        ]),
                        new WorldPreference([
                            [
                                new PropositionalWorld(signature, new Set([])),
                                new PropositionalWorld(signature, new Set(["a", "b"])),
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
        const signature: PropositionalSignature = new Set(["a", "b"]);
        const parser = new DMFSystemStateParserFactory(signature);

        test.each([
            [
                `{"dmfSystem":{"tpos":[[[["a"],["b"]]],[[[],["a","b"]]]],"edges":[{"fromIndex":0,"toIndex":1,"formula":"a"}]},"beliefSet":["a"],"contextIndex":1}`,
                new DMFSystemState(
                    new DMFSystem(
                        new Set([
                            new WorldPreference([
                                [
                                    new PropositionalWorld(signature, new Set(["a"])),
                                    new PropositionalWorld(signature, new Set(["b"])),
                                ],
                            ]),
                            new WorldPreference([
                                [
                                    new PropositionalWorld(signature, new Set([])),
                                    new PropositionalWorld(signature, new Set(["a", "b"])),
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

    describe("single step belief revision", () => {
        const signature: PropositionalSignature = new Set(["a", "b"]);
        const parser = new BeliefRevisionInputParserFactory(signature);

        test.each([
            [
                `{"tpoBefore":[[["a", "b"],["b"],["a"],[]]], "tpoAfter": [[["a", "b"],["a"]],[["b"],[]]], "input": "a"}`,
                new SingleStepBeliefRevisionInput(
                    new WorldPreference([
                        [
                            new PropositionalWorld(signature, new Set(["a", "b"])),
                            new PropositionalWorld(signature, new Set(["b"])),
                            new PropositionalWorld(signature, new Set(["a"])),
                            new PropositionalWorld(signature, new Set([])),
                        ],
                    ]),
                    "a",
                    new WorldPreference([
                        [
                            new PropositionalWorld(signature, new Set(["a", "b"])),
                            new PropositionalWorld(signature, new Set(["a"])),
                        ],
                        [
                            new PropositionalWorld(signature, new Set(["b"])),
                            new PropositionalWorld(signature, new Set([])),
                        ],
                    ]),
                ),
            ],
            [
                `{"tpoBefore": [], "tpoAfter": [], "input": ""}`,
                new SingleStepBeliefRevisionInput(new WorldPreference([]), "", new WorldPreference([])),
            ],
        ])("parse: %j", (input: string, expected: SingleStepBeliefRevisionInput) => {
            expect(parser.fromJson(input)).toEqual(expected);
        });
    });
});
