
import { SkinnedMeshSprite3D } from "../../../d3/core/SkinnedMeshSprite3D";
import { ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLRenderGeometryElement } from "../RenderDevice/WebGLRenderGeometryElement";
import { WebGLShaderInstance } from "../RenderDevice/WebGLShaderInstance";
import { WebGLRenderElement3D } from "./WebGLRenderElement3D";


export class WebGLSkinRenderElement3D extends WebGLRenderElement3D implements ISkinRenderElement3D {

    skinnedData: Float32Array[];

    constructor() {
        super();
    }

    /** 更新数据并且 */
    drawGeometry(shaderIns: WebGLShaderInstance) {
        let length = this._shaderInstances.length;
        let element = this.geometry.drawParams.elements;
        if (!this.skinnedData)
            return;
        this.geometry.bufferState.bind();
        for (var i: number = 0, n: number = length; i < n; i++) {
            for (var j = 0, m = this.geometry.drawParams.length / 2; j < m; j++) {
                var subSkinnedDatas: Float32Array = this.skinnedData[j];
                shaderIns.uploadCustomUniform(SkinnedMeshSprite3D.BONES, subSkinnedDatas);
                var offset = j * 2;
                WebGLEngine.instance.getDrawContext().drawElements((this.geometry as WebGLRenderGeometryElement)._glmode, element[offset + 1], (this.geometry as WebGLRenderGeometryElement)._glindexFormat, element[offset]);
            }
        }
    }
}