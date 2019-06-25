import { WebGLContext } from "../../webgl/WebGLContext";
/**
 * ...
 * @author ...
 */
export class VertexElementFormat {
    /**
     * 获取顶点元素格式信息。
     */
    static getElementInfos(element) {
        var info = VertexElementFormat._elementInfos[element];
        if (info)
            return info;
        else
            throw "VertexElementFormat: this vertexElementFormat is not implement.";
    }
}
VertexElementFormat.Single = "single";
VertexElementFormat.Vector2 = "vector2";
VertexElementFormat.Vector3 = "vector3";
VertexElementFormat.Vector4 = "vector4";
VertexElementFormat.Color = "color";
VertexElementFormat.Byte4 = "byte4";
VertexElementFormat.Short2 = "short2";
VertexElementFormat.Short4 = "short4";
VertexElementFormat.NormalizedShort2 = "normalizedshort2";
VertexElementFormat.NormalizedShort4 = "normalizedshort4";
VertexElementFormat.HalfVector2 = "halfvector2";
VertexElementFormat.HalfVector4 = "halfvector4";
/** @private [组数量,数据类型,是否归一化:0为false]。*/
VertexElementFormat._elementInfos = {
    "single": [1, WebGLContext.FLOAT, 0],
    "vector2": [2, WebGLContext.FLOAT, 0],
    "vector3": [3, WebGLContext.FLOAT, 0],
    "vector4": [4, WebGLContext.FLOAT, 0],
    "color": [4, WebGLContext.FLOAT, 0],
    "byte4": [4, WebGLContext.UNSIGNED_BYTE, 0],
    "short2": [2, WebGLContext.FLOAT, 0],
    "short4": [4, WebGLContext.FLOAT, 0],
    "normalizedshort2": [2, WebGLContext.FLOAT, 0],
    "normalizedshort4": [4, WebGLContext.FLOAT, 0],
    "halfvector2": [2, WebGLContext.FLOAT, 0],
    "halfvector4": [4, WebGLContext.FLOAT, 0]
};
