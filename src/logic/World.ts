import { PropositionalAssignment } from "./Semantic";
import { PropositionalSyntax } from "./Syntax";

export class PropositionalWorld {
    constructor(public syntax: PropositionalSyntax, public assignment: PropositionalAssignment) {}
}
