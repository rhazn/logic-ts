export interface ParserFactoryJson<T> {
    fromJson(json: string): T;
}
