import { PropositionalSyntax, PropositionalVariable } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/World";
import { WorldPreference } from "../logic/WorldPreference";

export function propositionalWorldParser(syntax: PropositionalSyntax): (input: string) => PropositionalWorld {
    return (input: string): PropositionalWorld => {
        const parsed = JSON.parse(input) as PropositionalVariable[];

        return new PropositionalWorld(syntax, new Set(parsed));
    };
}

export function worldPreferenceParser(syntax: PropositionalSyntax): (input: string) => WorldPreference {
    return (input: string): WorldPreference => {
        const parsed = JSON.parse(input) as PropositionalVariable[][][];

        return new WorldPreference(
            parsed.map(rank => rank.map(assignment => new PropositionalWorld(syntax, new Set(assignment)))),
        );
    };
}
