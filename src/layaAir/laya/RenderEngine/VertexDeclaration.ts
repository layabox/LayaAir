import { VertexElement } from "../renders/VertexElement";
import { VertexElementFormat } from "../renders/VertexElementFormat";
import { VAElement } from "./VertexAttributeLayout"
/**
 * <code>VertexDeclaration</code> 类用于生成顶点声明。
 */
export class VertexDeclaration {
    /**@internal */
    private static _uniqueIDCounter: number = 1;

    /**@internal */
    private _id: number;
    /**@internal */
    private _vertexStride: number;
    /**@internal */
    private _vertexElementsDic: { [key: string]: VertexElement };
    /**@internal */
    _shaderValues: { [key: number]: Int32Array };

    /**@internal [只读]*/
    _vertexElements: Array<VertexElement>;
    /**@internal */
    _VAElements: Array<VAElement>;
    /**
     * 获取唯一标识ID(通常用于优化或识别)。
     * @return 唯一标识ID
     */
    get id(): number {
        return this._id;
    }

    /**
     * 顶点跨度，以字节为单位。
     */
    get vertexStride(): number {
        return this._vertexStride;
    }

    /**
     * 顶点元素的数量。
     */
    get vertexElementCount(): number {
        return this._vertexElements.length;
    }

    /**
     * 创建一个 <code>VertexDeclaration</code> 实例。
     * @param vertexStride 顶点跨度。
     * @param vertexElements 顶点元素集合。
     */
    constructor(vertexStride: number, vertexElements: Array<VertexElement>) {
        this._id = ++VertexDeclaration._uniqueIDCounter;
        this._vertexElementsDic = {};
        this._vertexStride = vertexStride;
        this._vertexElements = vertexElements;
        this._VAElements = [];
        var count: number = vertexElements.length;
        this._shaderValues = {};

        for (var j: number = 0; j < count; j++) {
            var vertexElement: VertexElement = vertexElements[j];
            var name: number = vertexElement._elementUsage;
            this._vertexElementsDic[name] = vertexElement;
            var value: Int32Array = new Int32Array(5);
            var elmentInfo: any[] = VertexElementFormat.getElementInfos(vertexElement._elementFormat);
            value[0] = elmentInfo[0];
            value[1] = elmentInfo[1];
            value[2] = elmentInfo[2];
            value[3] = this._vertexStride;
            value[4] = vertexElement._offset;
            this._shaderValues[name] = value;

            //VAElement
            this._VAElements.push({ format: vertexElement._elementFormat, stride: vertexElement._offset, shaderLocation: name })
        }
    }

    /**
     * 通过索引获取顶点元素。
     * @param index 索引。
     */
    getVertexElementByIndex(index: number): VertexElement {
        return this._vertexElements[index];
    }

    /**
     * get vertexElement by usage
     */
    getVertexElementByUsage(usage: number): VertexElement {
        return this._vertexElementsDic[usage];
    }
}


