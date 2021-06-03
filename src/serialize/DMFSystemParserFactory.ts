import { PropositionalSyntax } from "../logic/Syntax";
import { ParserFactoryJson } from "./interface/ParserFactoryJson";
import { DMFSystem } from "../logic/DMFSystem";
import { WorldPreferenceParserFactory } from "./WorldPreferenceParserFactory";

export class DMFSystemParserFactory implements ParserFactoryJson<DMFSystem> {
    constructor(private syntax: PropositionalSyntax) {}

    public fromJson(json: string): DMFSystem {
        const preferenceFactory = new WorldPreferenceParserFactory(this.syntax);
        const parsed = JSON.parse(json);

        return new DMFSystem(
            new Set(parsed.tpos.map(tpo => preferenceFactory.fromJson(JSON.stringify(tpo)))),
            new Set(parsed.edges),
        );
    }
}
