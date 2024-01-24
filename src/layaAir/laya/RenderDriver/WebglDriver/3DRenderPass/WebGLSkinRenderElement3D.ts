import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { RenderGeometryElementOBJ } from "../../../d3/RenderObjs/WebGLOBJ/RenderGeometryElementOBJ";
import { SkinnedMeshSprite3D } from "../../../d3/core/SkinnedMeshSprite3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { WebGLRenderElement3D } from "./WebGLRenderElement3D";


export class WebGLSkinRenderElement3D extends WebGLRenderElement3D {

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