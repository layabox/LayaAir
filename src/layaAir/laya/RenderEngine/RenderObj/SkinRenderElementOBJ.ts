import { SkinnedMeshSprite3D } from "../../d3/core/SkinnedMeshSprite3D";
import { ShaderInstance } from "../../d3/shader/ShaderInstance";
import { LayaGL } from "../../layagl/LayaGL";
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
            var subSkinnedDatas: Float32Array = this.skinnedData[i];
            shaderIns.uploadCustomUniform(SkinnedMeshSprite3D.BONES,subSkinnedDatas);
            var offset = i*2;
            LayaGL.renderDrawConatext.drawElements(this._geometry.mode,element[offset+1],this._geometry.indexFormat,element[offset]);
        }
    }
 
}