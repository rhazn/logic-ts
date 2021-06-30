import { PropositionalSignature } from "../logic/Syntax";
import { ParserFactoryJson } from "./interface/ParserFactoryJson";
import { DMFSystemState } from "../logic/DMFSystemState";
import { DMFSystemParserFactory } from "./DMFSystemParserFactory";

export class DMFSystemStateParserFactory implements ParserFactoryJson<DMFSystemState[]> {
    constructor(private signature: PropositionalSignature) {}

    public fromJson(json: string): DMFSystemState[] {
        const dmfSystemFactory = new DMFSystemParserFactory(this.signature);
        const parsed = JSON.parse(json);
        const dmfSystem = dmfSystemFactory.fromJson(JSON.stringify(parsed.dmfSystem));

        return parsed.states.map(
            stateData => new DMFSystemState(dmfSystem, new Set(stateData.beliefSet), stateData.contextIndex),
        );
    }
}
