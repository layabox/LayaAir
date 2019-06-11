import { Color } from "../math/Color";
/**
 * <code>TextMesh</code> 类用于创建文本网格。
 */
export declare class TextMesh {
    /**@private */
    private static _indexBuffer;
    /**@private */
    private _vertices;
    /**@private */
    private _vertexBuffer;
    /**@private */
    private _text;
    /**@private */
    private _fontSize;
    /**@private */
    private _color;
    /**
     * 获取文本。
     * @return 文本。
     */
    /**
    * 设置文本。
    * @param value 文本。
    */
    text: string;
    /**
     * 获取字体尺寸。
     * @param  value 字体尺寸。
     */
    /**
    * 设置字体储存。
    * @return 字体尺寸。
    */
    fontSize: number;
    /**
     * 获取颜色。
     * @return 颜色。
     */
    /**
    * 设置颜色。
    * @param 颜色。
    */
    color: Color;
    /**
     * 创建一个新的 <code>TextMesh</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    private _createVertexBuffer;
    /**
     * @private
     */
    private _resizeVertexBuffer;
    /**
     * @private
     */
    private _addChar;
}
