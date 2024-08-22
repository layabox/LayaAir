import { Resource } from "./Resource";
/**
 * @en Enum for text resource formats.
 * @zh 文字资源格式的枚举类型。
 */
export enum TextResourceFormat {
    /**
     * @en Represents the buffer format.
     * @zh 表示缓冲区格式。
     */
    Buffer,
    /**
     * @en Represents the plain text format.
     * @zh 表示纯文本格式。
     * TODO:
     */
    Plain,
    /**
     * @en Represents the JSON format.
     * @zh 表示JSON格式。
     */
    JSON,
    /**
     * @en Represents the XML format.
     * @zh 表示XML格式。
     */
    XML
}

/**
 * @en The `TextResource` class represents a text resource.
 * @zh `TextResource` 类表示文字资源。
 */
export class TextResource extends Resource {
    /**
     * @en The data of the text resource, read-only.
     * @zh 文字资源的数据，只读。
     */
    public readonly data: any;
    /**
     * @en The format of the text resource, read-only.
     * @zh 文字资源的格式，只读。
     */
    public readonly format: TextResourceFormat;
    /**
     * @en Constructor method.
     * @param data The data of the text resource.
     * @param format The format of the text resource.
     * @zh 构造方法
     * @param data 文字资源的数据。
     * @param format 文字资源的格式
     */
    constructor(data: any, format: TextResourceFormat) {
        super();
        this.data = data;
        this.format = format;
    }
}