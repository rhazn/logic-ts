import { Formula, PropositionalVariable } from "./Syntax";

export type Interpretation = (formula: Formula) => boolean;

/**
 * Propositional assignment by keeping a set of truthy variables
 */
export type PropositionalAssignment = Set<PropositionalVariable>;
