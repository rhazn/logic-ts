export interface ParserFactoryBinary<T> {
    fromBinary(binary: ArrayBuffer): T;
}
