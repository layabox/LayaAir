import { WebGLRenderElement3D } from "../../../RenderDriver/WebglDriver/3DRenderPass/WebGLRenderElement3D";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { LayaGL } from "../../../layagl/LayaGL";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";

export class InstanceRenderElementOBJ extends WebGLRenderElement3D {

    /**@internal 当instance数量特别大时可能需要一段一段数据来画,所以需要更新顶点数据*/
    private _vertexBuffer3D: Array<VertexBuffer3D> = [];

    private _updateData: Array<Float32Array> = [];

    private _updateDataNum: Array<number> = [];

    drawCount: number;

    updateNums: number;

    /**
     * 增加UpdateBuffer
     * @param vb 
     * @param length 每个instance属性的数据长度
     */
    addUpdateBuffer(vb: VertexBuffer3D,length:number) {
        this._vertexBuffer3D[this.updateNums] = vb;
        this._updateDataNum[this.updateNums++] = length;
    }

    /**
     * 
     * @param index index of Buffer3D
     * @param length length of array
     */
    getUpdateData(index: number,length:number): Float32Array {
        let data = this._updateData[index];
        if (!data || data.length < length) {
            data = this._updateData[index] = new Float32Array(length);
        }
        return data;
    }

    constructor() {
        super();
    }

    /**
     * draw geometry
     * @param shaderIns 
     */
    drawGeometry(shaderIns: ShaderInstance) {
        //当instance数量特别大时可能需要一段一段数据来画,所以需要更新顶点数据
        let data: Float32Array;
        let buffer: VertexBuffer3D;
        for (let i = 0; i < this.updateNums; i++) {
            buffer = this._vertexBuffer3D[i];
            if (!buffer) break;
            data = this._updateData[i];
            buffer.orphanStorage();
            buffer.setData(data.buffer, 0, 0, this.drawCount * this._updateDataNum[i] * 4);
        }
        LayaGL.renderDrawContext.drawGeometryElement(this.geometry);
    }

    clear() {
        this.updateNums = 0;
    }
}