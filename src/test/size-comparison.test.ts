import { PropositionalSignature } from "../logic/Syntax";
import { WorldPreference } from "../logic/WorldPreference";
import { getAllWorldsForSignature } from "../util/functions";

describe.skip("serialize world preference sizes", () => {
    test("size", () => {
        for (let i = 24; i <= 24; i++) {
            const signature = new Set("abcdefghijklmnopqrstuvwxyz".substr(0, i).split("")) as PropositionalSignature;

            const worlds = getAllWorldsForSignature(signature);
            const preference = new WorldPreference([worlds]);

            //const serializedJSON = preference.toJson();
            //const serializedBinary = preference.toBinary();
            const serializedBinaryRanklist = preference.toBinaryRanklist();

            console.log(`Signature size: ${i},${Buffer.from(serializedBinaryRanklist).byteLength}`);
        }

        expect(true).toBe(true);
    });
});
