import { SingletonList } from "../../d3/component/SingletonList";
import { Transform3D } from "../../d3/core/Transform3D";
import { ShaderInstance } from "../../d3/shader/ShaderInstance";
import { LayaGL } from "../../layagl/LayaGL";
import { IBaseRenderNode } from "../RenderInterface/RenderPipelineInterface/IBaseRenderNode";
import { IRenderContext3D } from "../RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderElement } from "../RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { IRenderQueue } from "../RenderInterface/RenderPipelineInterface/IRenderQueue";
import { ShaderData } from "../RenderShader/ShaderData";

export class RenderElementOBJ implements IRenderElement {


    _geometry: IRenderGeometryElement;

    _shaderInstances: SingletonList<ShaderInstance>;

    _materialShaderData: ShaderData;

    _renderShaderData: ShaderData;

    _transform: Transform3D;

    _isRender: boolean;

    _owner: IBaseRenderNode;

    constructor(){
        this._shaderInstances = new SingletonList();
    }

    _addShaderInstance(shader:ShaderInstance){
        this._shaderInstances.add(shader);
    }

    _clearShaderInstance(){
        this._shaderInstances.length = 0;
    }

    /**
     * @internal
     */
    getInvertFront(): boolean {
        return this._transform._isFrontFaceInvert;
    }

    /**
     * render RenderElement
     * @param renderqueue 
     */
    _render(context: IRenderContext3D): void {
        var forceInvertFace: boolean = context.invertY;
        var updateMark: number = context.cameraUpdateMark;
        var sceneID = context.sceneID;
        var sceneShaderData:ShaderData = context.sceneShaderData;
        var cameraShaderData:ShaderData = context.cameraShaderData;
        if (this._isRender) {
            var passes: ShaderInstance[] = this._shaderInstances.elements;
            for (var j: number = 0, m: number =  this._shaderInstances.length; j < m; j++) {
                // var pass: ShaderPass = passes[j];
                // //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
                // if (pass._pipelineMode !== pipeline)
                //     continue;
                // var comDef: DefineDatas = RenderElementOBJ._compileDefine;
                // renderqueue.sceneShaderData._defineDatas.cloneTo(comDef);
                // comDef.addDefineDatas(this._renderShaderData._defineDatas);
                // comDef.addDefineDatas(this._materialShaderData._defineDatas);
                const shaderIns: ShaderInstance = passes[j];;
                var switchShader: boolean = shaderIns.bind();
                var switchUpdateMark: boolean = (updateMark !== shaderIns._uploadMark);
                var uploadScene: boolean = (shaderIns._uploadScene !== sceneID) || switchUpdateMark;
                //Scene
                if (uploadScene || switchShader) {
                    shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, sceneShaderData, uploadScene);
                    shaderIns._uploadScene = sceneID;
                }
                //render
                var uploadSprite3D: boolean = (shaderIns._uploadRender !== this._renderShaderData) || switchUpdateMark;
                if (uploadSprite3D || switchShader) {
                    shaderIns.uploadUniforms(shaderIns._spriteUniformParamsMap, this._renderShaderData, uploadSprite3D);
                    //UBO Buffer Range TODO
                    //this.render._subUniformBufferData && (BaseRender._transLargeUbO.updateBindRange(this.render._subUniformBufferData));
                    shaderIns._uploadRender = this._renderShaderData;
                }
                //camera
                var uploadCamera: boolean = shaderIns._uploadCameraShaderValue !== cameraShaderData || switchUpdateMark;
                if (uploadCamera || switchShader) {
                    shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, cameraShaderData, uploadCamera);
                    shaderIns._uploadCameraShaderValue = cameraShaderData;
                }
                //material
                var uploadMaterial: boolean = (shaderIns._uploadMaterial !== this._materialShaderData) || switchUpdateMark;
                if (uploadMaterial || switchShader) {
                    shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, this._materialShaderData, uploadMaterial);
                    shaderIns._uploadMaterial = this._materialShaderData;
                }
                //renderData update
                //TODO：Renderstate as a Object to less upload
                shaderIns.uploadRenderStateBlendDepth(this._materialShaderData);
                shaderIns.uploadRenderStateFrontFace(this._materialShaderData, forceInvertFace, this.getInvertFront());
                this.drawGeometry(shaderIns);
            }
        }
    }

    drawGeometry(shaderIns:ShaderInstance){
        LayaGL.renderDrawConatext.drawGeometryElement(this._geometry);
    }

    _destroy() {
        this._geometry = null;
        this._shaderInstances = null;
        this._materialShaderData = null;
        this._renderShaderData = null;
        this._transform = null;
        this._isRender = null;
    }
}