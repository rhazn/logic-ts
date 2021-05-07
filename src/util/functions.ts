import { Interpretation, PropositionalAssignment } from "../logic/Semantic";
import { Formula, PropositionalSyntax, PropositionalVariable } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/World";

export function getWorldByAssignment(
    syntax: PropositionalSyntax,
    assignment: PropositionalAssignment,
): PropositionalWorld {
    return new PropositionalWorld(syntax, interpretationFromAssignment(assignment));
}

export function getAllInterpretationsForSyntax(syntax: PropositionalSyntax): Interpretation[] {
    return [...syntax]
        .reduce(
            (prev: PropositionalAssignment[], curr: PropositionalVariable) => {
                return [
                    ...[...prev].map(assignment => {
                        return new Set([...assignment, curr]);
                    }),
                    ...prev,
                ];
            },
            [new Set()],
        )
        .map(interpretationFromAssignment);
}

export function getAllWorldsForSyntax(syntax: PropositionalSyntax): PropositionalWorld[] {
    return (getAllInterpretationsForSyntax(syntax) as Interpretation[]).map(
        interpretation => new PropositionalWorld(syntax, interpretation),
    );
}

export function getInitialPreferenceForSyntax(syntax: PropositionalSyntax): PropositionalWorld[][] {
    return [getAllWorldsForSyntax(syntax)];
}

function interpretationFromAssignment(assignment: PropositionalAssignment): (formula: Formula) => boolean {
    return (formula: Formula) => {
        return assignment.has(formula);
    };
}
