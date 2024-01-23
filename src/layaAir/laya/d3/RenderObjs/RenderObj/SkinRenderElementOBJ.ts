
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { LayaGL } from "../../../layagl/LayaGL";
import { SkinnedMeshSprite3D } from "../../core/SkinnedMeshSprite3D";
import { GLESRenderElementOBJ } from "../WebGLOBJ/GLESRenderElementOBJ";
import { RenderGeometryElementOBJ } from "../WebGLOBJ/RenderGeometryElementOBJ";

export class SkinRenderElementOBJ extends GLESRenderElementOBJ {

    skinnedData: Float32Array[];

    constructor() {
        super();
    }

    /** 更新数据并且 */
    drawGeometry(shaderIns: ShaderInstance) {
        //@ts-ignore
        let length = this.shaderInstances.length;
        let element = this.geometry.drawParams.elements;
        if (!this.skinnedData)
            return;
        this.geometry.bufferState.bind();
        for (var i: number = 0, n: number = length; i < n; i++) {
            for (var j = 0, m = this.geometry.drawParams.length / 2; j < m; j++) {
                var subSkinnedDatas: Float32Array = this.skinnedData[j];
                shaderIns.uploadCustomUniform(SkinnedMeshSprite3D.BONES, subSkinnedDatas);
                var offset = j * 2;
                LayaGL.renderDrawContext.drawElements((this.geometry as RenderGeometryElementOBJ)._glmode, element[offset + 1], (this.geometry as RenderGeometryElementOBJ)._glindexFormat, element[offset]);
            }
        }
    }
}