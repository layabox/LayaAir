import { VertexBuffer3D } from "../../d3/graphics/VertexBuffer3D";
import { ShaderInstance } from "../../d3/shader/ShaderInstance";
import { LayaGL } from "../../layagl/LayaGL";
import { RenderElementOBJ } from "./RenderElementOBJ";

export class InstanceRenderElementOBJ extends RenderElementOBJ {

    /**@internal 当instance数量特别大时可能需要一段一段数据来画,所以需要更新顶点数据*/
    vertexBuffer3D: Array<VertexBuffer3D> = [];
    
    updateData: Array<Float32Array> = [];
    
    updateDataNum: Array<number> = [];
    
    drawCount:number;

    constructor() {
        super();
    }

    drawGeometry(shaderIns: ShaderInstance) {
        //当instance数量特别大时可能需要一段一段数据来画,所以需要更新顶点数据
        let data:Float32Array;
        let buffer:VertexBuffer3D;
        for (let i = 0, n = this.vertexBuffer3D.length; i < n; i++) {
            buffer = this.vertexBuffer3D[i];
            if(!buffer) break;
            data = this.updateData[i];
            buffer.orphanStorage();
            buffer.setData(data.buffer, 0, 0, this.drawCount * this.updateDataNum[i] * 4);
        }
        LayaGL.renderDrawConatext.drawGeometryElement(this._geometry);
    }
}