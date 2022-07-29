import { Resource } from "./Resource";

export enum TextResourceFormat {
    Buffer,
    Plain,
    JSON,
    XML
}

export class TextResource extends Resource {
    public readonly data: any;
    public readonly format: TextResourceFormat;

    constructor(data: any, format: TextResourceFormat) {
        super();

        this.data = data;
        this.format = format;
    }
}