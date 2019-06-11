import { VertexElementFormat } from "././VertexElementFormat";
import { ShaderData } from "../shader/ShaderData";
/**
 * @private
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
        this.vertexElements = vertexElements;
        var count = vertexElements.length;
        this._shaderValues = new ShaderData(null);
        for (var j = 0; j < count; j++) {
            var vertexElement = vertexElements[j];
            var name = vertexElement.elementUsage;
            this._vertexElementsDic[name] = vertexElement;
            var value = new Int32Array(5);
            var elmentInfo = VertexElementFormat.getElementInfos(vertexElement.elementFormat);
            value[0] = elmentInfo[0];
            value[1] = elmentInfo[1];
            value[2] = elmentInfo[2];
            value[3] = this._vertexStride;
            value[4] = vertexElement.offset;
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
     * @private
     */
    get vertexStride() {
        return this._vertexStride;
    }
    /**
     * @private
     */
    getVertexElementByUsage(usage) {
        return this._vertexElementsDic[usage];
    }
    /**
     * @private
     */
    unBinding() {
    }
}
/**@private */
VertexDeclaration._uniqueIDCounter = 1;
