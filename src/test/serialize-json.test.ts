import { PropositionalSignature } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/PropositionalWorld";
import { WorldPreference } from "../logic/WorldPreference";
import { DMFSystem } from "../logic/DMFSystem";
import { DMFSystemState } from "../logic/DMFSystemState";
import { SingleStepBeliefRevisionInput } from "../logic/BeliefRevisionInput";

describe("serialize entities as json", () => {
    describe("propositional worlds", () => {
        const signature: PropositionalSignature = new Set(["a", "b", "c"]);

        test.each([
            [new PropositionalWorld(signature, new Set(["a"])), `["a"]`],
            [new PropositionalWorld(signature, new Set(["a", "b"])), `["a","b"]`],
            [new PropositionalWorld(signature, new Set(["a", "b", "c"])), `["a","b","c"]`],
            [new PropositionalWorld(signature, new Set([])), `[]`],
        ])("serialize: %o", (input: PropositionalWorld, expected: string) => {
            expect(input.toJson()).toEqual(expected);
        });
    });

    describe("world preferences", () => {
        const signature: PropositionalSignature = new Set(["a", "b", "c"]);

        test.each([
            [
                new WorldPreference(signature, [
                    [
                        new PropositionalWorld(signature, new Set(["a"])),
                        new PropositionalWorld(signature, new Set(["b"])),
                    ],
                ]),
                `{"signature":["a","b","c"],"ranks":[[["a"],["b"]]]}`,
            ],
            [
                new WorldPreference(signature, [
                    [
                        new PropositionalWorld(signature, new Set(["a"])),
                        new PropositionalWorld(signature, new Set(["b"])),
                    ],
                    [new PropositionalWorld(signature, new Set(["a", "c"]))],
                ]),
                `{"signature":["a","b","c"],"ranks":[[["a"],["b"]],[["a","c"]]]}`,
            ],
            [
                new WorldPreference(signature, [
                    [
                        new PropositionalWorld(signature, new Set(["a"])),
                        new PropositionalWorld(signature, new Set(["b"])),
                    ],
                    [],
                    [new PropositionalWorld(signature, new Set(["a", "c"]))],
                ]),
                `{"signature":["a","b","c"],"ranks":[[["a"],["b"]],[],[["a","c"]]]}`,
            ],
            [new WorldPreference(signature, []), `{"signature":["a","b","c"],"ranks":[]}`],
        ])("parse: %o", (input: WorldPreference, expected: string) => {
            expect(input.toJson()).toEqual(expected);
        });
    });
    describe("dmf systems", () => {
        const signature: PropositionalSignature = new Set(["a", "b"]);

        test.each([
            [
                new DMFSystem(
                    new Set([
                        new WorldPreference(signature, [
                            [
                                new PropositionalWorld(signature, new Set(["a"])),
                                new PropositionalWorld(signature, new Set(["b"])),
                            ],
                        ]),
                        new WorldPreference(signature, [
                            [
                                new PropositionalWorld(signature, new Set([])),
                                new PropositionalWorld(signature, new Set(["a", "b"])),
                            ],
                        ]),
                    ]),
                    new Set([{ fromIndex: 0, toIndex: 1, formula: "a" }]),
                ),
                `{"tpos":[{"signature":["a","b"],"ranks":[[["a"],["b"]]]},{"signature":["a","b"],"ranks":[[[],["a","b"]]]}],"edges":[{"fromIndex":0,"toIndex":1,"formula":"a"}]}`,
            ],
            [new DMFSystem(new Set([]), new Set()), `{"tpos":[],"edges":[]}`],
        ])("parse: %o", (input: DMFSystem, expected: string) => {
            expect(input.toJson()).toEqual(expected);
        });
    });

    describe("dmf system state", () => {
        const signature: PropositionalSignature = new Set(["a", "b"]);

        test.each([
            [
                new DMFSystemState(
                    new DMFSystem(
                        new Set([
                            new WorldPreference(signature, [
                                [
                                    new PropositionalWorld(signature, new Set(["a"])),
                                    new PropositionalWorld(signature, new Set(["b"])),
                                ],
                            ]),
                            new WorldPreference(signature, [
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
                `{"dmfSystem":{"tpos":[{"signature":["a","b"],"ranks":[[["a"],["b"]]]},{"signature":["a","b"],"ranks":[[[],["a","b"]]]}],"edges":[{"fromIndex":0,"toIndex":1,"formula":"a"}]},"states":[{"beliefSet":["a"],"contextIndex":1}]}`,
            ],
            [
                new DMFSystemState(new DMFSystem(new Set([]), new Set()), new Set(), 0),
                `{"dmfSystem":{"tpos":[],"edges":[]},"states":[{"beliefSet":[],"contextIndex":0}]}`,
            ],
        ])("parse: %o", (input: DMFSystemState, expected: string) => {
            expect(input.toJson()).toEqual(expected);
        });
    });

    describe("single step belief revision", () => {
        const signature: PropositionalSignature = new Set(["a", "b"]);

        test.each([
            [
                new SingleStepBeliefRevisionInput(
                    new WorldPreference(signature, [
                        [
                            new PropositionalWorld(signature, new Set(["a", "b"])),
                            new PropositionalWorld(signature, new Set(["b"])),
                            new PropositionalWorld(signature, new Set(["a"])),
                            new PropositionalWorld(signature, new Set([])),
                        ],
                    ]),
                    "a",
                    new WorldPreference(signature, [
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
                `{"tpoBefore":{"signature":["a","b"],"ranks":[[["a","b"],["b"],["a"],[]]]},"tpoAfter":{"signature":["a","b"],"ranks":[[["a","b"],["a"]],[["b"],[]]]},"input":"a"}`,
            ],
            [
                new SingleStepBeliefRevisionInput(
                    new WorldPreference(signature, []),
                    "",
                    new WorldPreference(signature, []),
                ),
                `{"tpoBefore":{"signature":["a","b"],"ranks":[]},"tpoAfter":{"signature":["a","b"],"ranks":[]},"input":""}`,
            ],
        ])("parse: %j", (input: SingleStepBeliefRevisionInput, expected: string) => {
            expect(input.toJson()).toEqual(expected);
        });
    });
});
