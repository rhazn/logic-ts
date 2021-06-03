import { PropositionalSyntax } from "../logic/Syntax";
import { ParserFactoryJson } from "./interface/ParserFactoryJson";
import { WorldPreferenceParserFactory } from "./WorldPreferenceParserFactory";
import { SingleStepBeliefRevisionInput } from "../logic/BeliefRevisionInput";

export class BeliefRevisionInputParserFactory implements ParserFactoryJson<SingleStepBeliefRevisionInput> {
    constructor(private syntax: PropositionalSyntax) {}

    public fromJson(json: string): SingleStepBeliefRevisionInput {
        const preferenceFactory = new WorldPreferenceParserFactory(this.syntax);
        const parsed = JSON.parse(json);

        return new SingleStepBeliefRevisionInput(
            preferenceFactory.fromJson(JSON.stringify(parsed.tpoBefore)),
            parsed.input,
            preferenceFactory.fromJson(JSON.stringify(parsed.tpoAfter)),
        );
    }
}
