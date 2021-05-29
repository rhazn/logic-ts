import { PropositionalVariable } from "./Syntax";
import { PropositionalWorld } from "./World";

/**
 * Propositional assignment by keeping a set of truthy variables
 */
export type PropositionalAssignment = Set<PropositionalVariable>;
