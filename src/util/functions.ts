import { PropositionalAssignment } from "../logic/Semantic";
import { PropositionalSyntax, PropositionalVariable } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/World";

export function getAllAssignmentsForSyntax(syntax: PropositionalSyntax): PropositionalAssignment[] {
    return [...syntax].reduce(
        (prev: PropositionalAssignment[], curr: PropositionalVariable) => {
            return [
                ...[...prev].map(assignment => {
                    return new Set([...assignment, curr]);
                }),
                ...prev,
            ];
        },
        [new Set()],
    );
}

export function getAllWorldsForSyntax(syntax: PropositionalSyntax): PropositionalWorld[] {
    return (getAllAssignmentsForSyntax(syntax) as PropositionalAssignment[]).map(
        assignment => new PropositionalWorld(syntax, assignment),
    );
}

export function getInitialPreferenceForSyntax(syntax: PropositionalSyntax): PropositionalWorld[][] {
    return [getAllWorldsForSyntax(syntax)];
}

export function infOCFToTPTP(infOCFFormula: string) {
    const tptp = infOCFFormula
        .replaceAll(",", "&")
        .replaceAll(";", "|")
        .replaceAll("!", "~")
        .replaceAll("Top", "(a | ~a)")
        .replaceAll("Bottom", "(a & ~a)");

    return `fof('formula', axiom, ${tptp}).`;
}
