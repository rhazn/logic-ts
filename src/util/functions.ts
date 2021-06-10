import { PropositionalAssignment } from "../logic/Semantic";
import { PropositionalSignature, PropositionalVariable } from "../logic/Syntax";
import { PropositionalWorld } from "../logic/PropositionalWorld";
import { WorldPreference } from "../logic/WorldPreference";

export function getAllAssignmentsForSignature(signature: PropositionalSignature): PropositionalAssignment[] {
    return [...signature].reduce(
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

export function getAllWorldsForSignature(signature: PropositionalSignature): PropositionalWorld[] {
    return (getAllAssignmentsForSignature(signature) as PropositionalAssignment[]).map(
        assignment => new PropositionalWorld(signature, assignment),
    );
}

export function getInitialPreferenceForSignature(signature: PropositionalSignature): WorldPreference {
    return new WorldPreference([getAllWorldsForSignature(signature)]);
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
