import { Resource } from "./Resource";
/**
 * 文字资源格式
 */
export enum TextResourceFormat {
    /**Buffer */
    Buffer,
    /**TODO */
    Plain,
    /**Json */
    JSON,
    /**XML */
    XML
}

/**
 * 文字资源
 */
export class TextResource extends Resource {
    /**数据 */
    public readonly data: any;
    /**格式 */
    public readonly format: TextResourceFormat;
    /**
     * 实例化文字资源
     * @param data 
     * @param format 
     */
    constructor(data: any, format: TextResourceFormat) {
        super();
        this.data = data;
        this.format = format;
    }
}