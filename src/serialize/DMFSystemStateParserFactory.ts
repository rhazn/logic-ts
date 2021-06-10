import { PropositionalSignature } from "../logic/Syntax";
import { ParserFactoryJson } from "./interface/ParserFactoryJson";
import { DMFSystemState } from "../logic/DMFSystemState";
import { DMFSystemParserFactory } from "./DMFSystemParserFactory";

export class DMFSystemStateParserFactory implements ParserFactoryJson<DMFSystemState> {
    constructor(private signature: PropositionalSignature) {}

    public fromJson(json: string): DMFSystemState {
        const dmfSystemFactory = new DMFSystemParserFactory(this.signature);
        const parsed = JSON.parse(json);

        return new DMFSystemState(
            dmfSystemFactory.fromJson(JSON.stringify(parsed.dmfSystem)),
            new Set(parsed.beliefSet),
            parsed.contextIndex,
        );
    }
}
