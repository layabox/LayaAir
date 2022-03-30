import { LayaGL } from "../../../../layagl/LayaGL";
import { IRenderElement } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { IRenderQueue } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderQueue";
import { DefineDatas } from "../../../../RenderEngine/RenderShader/DefineDatas";
import { ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData";
import { ShaderInstance } from "../../../shader/ShaderInstance";
import { ShaderPass } from "../../../shader/ShaderPass";
import { SubShader } from "../../../shader/SubShader";
import { Transform3D } from "../../Transform3D";

export class RenderElementOBJ implements IRenderElement {
    /** @internal */
    private static _compileDefine: DefineDatas = new DefineDatas();

    _geometry: IRenderGeometryElement;

    _subShader: SubShader;

    _materialShaderData: ShaderData;

    _renderShaderData: ShaderData;

    _transform: Transform3D;

    _isRender: boolean;
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
    _render(renderqueue: IRenderQueue): void {
        var forceInvertFace: boolean = renderqueue.invertY;
        var updateMark: number = renderqueue.cameraUpdateMark;
        var sceneID = renderqueue.sceneID;
        let pipeline = renderqueue.pipelineMode;
        if (this._isRender) {
            var passes: ShaderPass[] = this._subShader._passes;
            for (var j: number = 0, m: number = passes.length; j < m; j++) {
                var pass: ShaderPass = passes[j];
                //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
                if (pass._pipelineMode !== pipeline)
                    continue;
                var comDef: DefineDatas = RenderElementOBJ._compileDefine;
                renderqueue.sceneShaderData._defineDatas.cloneTo(comDef);
                comDef.addDefineDatas(this._renderShaderData._defineDatas);
                comDef.addDefineDatas(this._materialShaderData._defineDatas);
                const shaderIns: ShaderInstance = pass.withCompile(comDef);
                var switchShader: boolean = shaderIns.bind();
                var switchUpdateMark: boolean = (updateMark !== shaderIns._uploadMark);
                var uploadScene: boolean = (shaderIns._uploadScene !== sceneID) || switchUpdateMark;
                //Scene
                if (uploadScene || switchShader) {
                    shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, renderqueue.sceneShaderData, uploadScene);
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
                var uploadCamera: boolean = shaderIns._uploadCameraShaderValue !== renderqueue.cameraShaderData || switchUpdateMark;
                if (uploadCamera || switchShader) {
                    shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, renderqueue.cameraShaderData, uploadCamera);
                    shaderIns._uploadCameraShaderValue = renderqueue.cameraShaderData;
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
                LayaGL.renderDrawConatext.drawGeometryElement(this._geometry);
            }
        }
    }

    _destroy() {
        this._geometry = null;
        this._subShader = null;
        this._materialShaderData = null;
        this._renderShaderData = null;
        this._transform = null;
        this._isRender = null;
    }
}