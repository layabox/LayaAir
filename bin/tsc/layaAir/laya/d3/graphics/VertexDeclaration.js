import { VertexElementFormat } from "./VertexElementFormat";
import { ShaderData } from "../shader/ShaderData";
/**
 * <code>VertexDeclaration</code> 类用于生成顶点声明。
 */
export class VertexDeclaration {
    /**
     * 创建一个 <code>VertexDeclaration</code> 实例。
     * @param	vertexStride 顶点跨度。
     * @param	vertexElements 顶点元素集合。
     */
    constructor(vertexStride, vertexElements) {
        this._id = ++VertexDeclaration._uniqueIDCounter;
        this._vertexElementsDic = {};
        this._vertexStride = vertexStride;
        this._vertexElements = vertexElements;
        var count = vertexElements.length;
        this._shaderValues = new ShaderData(null);
        for (var j = 0; j < count; j++) {
            var vertexElement = vertexElements[j];
            var name = vertexElement._elementUsage;
            this._vertexElementsDic[name] = vertexElement;
            var value = new Int32Array(5);
            var elmentInfo = VertexElementFormat.getElementInfos(vertexElement._elementFormat);
            value[0] = elmentInfo[0];
            value[1] = elmentInfo[1];
            value[2] = elmentInfo[2];
            value[3] = this._vertexStride;
            value[4] = vertexElement._offset;
            this._shaderValues.setAttribute(name, value);
        }
    }
    /**
     * 获取唯一标识ID(通常用于优化或识别)。
     * @return 唯一标识ID
     */
    get id() {
        return this._id;
    }
    /**
     * 顶点跨度，以字节为单位。
     */
    get vertexStride() {
        return this._vertexStride;
    }
    /**
     * 顶点元素的数量。
     */
    get vertexElementCount() {
        return this._vertexElements.length;
    }
    /**
     * 通过索引获取顶点元素。
     * @param index 索引。
     */
    getVertexElementByIndex(index) {
        return this._vertexElements[index];
    }
    /**
     * @internal
     */
    getVertexElementByUsage(usage) {
        return this._vertexElementsDic[usage];
    }
}
/**@internal */
VertexDeclaration._uniqueIDCounter = 1;
