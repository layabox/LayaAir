
import { LayaGL } from "../../../layagl/LayaGL";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { SkinnedMeshSprite3D } from "../../core/SkinnedMeshSprite3D";
import { RenderElementOBJ } from "./RenderElementOBJ";

export class SkinRenderElementOBJ extends RenderElementOBJ {
    
    skinnedData:Float32Array[];

    constructor(){
        super();
    }

    /** 更新数据并且 */
    drawGeometry(shaderIns:ShaderInstance){
        let length = this._shaderInstances.length;
        let element =this._geometry.drawParams.elements;
        if(!this.skinnedData)
            return;
        this._geometry.bufferState.bind();
        for (var i: number = 0, n: number =length; i < n; i++) {
            for(var j = 0,m = this._geometry.drawParams.length/2;j<m;j++){
                var subSkinnedDatas: Float32Array = this.skinnedData[j];
                shaderIns.uploadCustomUniform(SkinnedMeshSprite3D.BONES,subSkinnedDatas);
                var offset = j*2;
                LayaGL.renderDrawContext.drawElements(this._geometry.mode,element[offset+1],this._geometry.indexFormat,element[offset]);
            }
        }
    }
}