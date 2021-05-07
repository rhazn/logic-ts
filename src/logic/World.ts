import { Interpretation, PropositionalAssignment } from "./Semantic";
import { PropositionalSyntax } from "./Syntax";

export class PropositionalWorld {
    constructor(public syntax: PropositionalSyntax, public interpretation: Interpretation) {}

    public getPropositionalAssignment(): PropositionalAssignment {
        return new Set([...this.syntax].filter(this.interpretation.bind(this)));
    }
}
