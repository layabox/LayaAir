/**
 * ...
 * @author ...
 */
export declare class VertexElementFormat {
    static Single: string;
    static Vector2: string;
    static Vector3: string;
    static Vector4: string;
    static Color: string;
    static Byte4: string;
    static Short2: string;
    static Short4: string;
    static NormalizedShort2: string;
    static NormalizedShort4: string;
    static HalfVector2: string;
    static HalfVector4: string;
    /** @private [组数量,数据类型,是否归一化:0为false]。*/
    private static _elementInfos;
    /**
     * 获取顶点元素格式信息。
     */
    static getElementInfos(element: string): any[];
}
