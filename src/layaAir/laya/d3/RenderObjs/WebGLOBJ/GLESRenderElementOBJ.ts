import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { DefineDatas } from "../../../RenderEngine/RenderShader/DefineDatas";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { WebShaderData } from "../../../RenderEngine/RenderShader/WebShaderData";
import { LayaGL } from "../../../layagl/LayaGL";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderContext3D } from "../../RenderDriverLayer/IRenderContext3D";
import { Transform3D } from "../../core/Transform3D";
import { GLESRenderContext3D } from "./GLESRenderContext3D";
import { GLESBaseRenderNode } from "./Render3DNode/GLESBaseRenderNode";


export class GLESRenderElementOBJ implements IRenderElement {
    /** @internal */
    static _compileDefine: DefineDatas = new DefineDatas();

    _geometry: IRenderGeometryElement;

    _subShader: SubShader;

    _shaderInstances: SingletonList<ShaderInstance>;

    _materialShaderData: WebShaderData;

    _materialRenderQueue: number;

    _renderShaderData: WebShaderData;

    _transform: Transform3D;

    _isRender: boolean;

    _owner: GLESBaseRenderNode;//GLESRenderNode

    _invertFront: boolean;

    constructor() {
        this._shaderInstances = new SingletonList();
    }

    _addShaderInstance(shader: ShaderInstance) {
        this._shaderInstances.add(shader);
    }

    _clearShaderInstance() {
        this._shaderInstances.length = 0;
    }

    _preUpdatePre(context: GLESRenderContext3D) {
        this._compileShader(context);
        this._invertFront = this._getInvertFront();
    }

    private _getInvertFront(): boolean {
        let transform = this._owner?.transform;
        return transform ? transform._isFrontFaceInvert : false;
    }

    /**
     * render RenderElement
     * context:GLESRenderContext3D
     * @param renderqueue 
     */
    _render(context: IRenderContext3D): void {
        var forceInvertFace: boolean = context.invertY;
        var updateMark: number = context.cameraUpdateMask;
        var sceneShaderData = context.sceneData as WebShaderData;
        var cameraShaderData = context.cameraData as WebShaderData;
        if (this._isRender) {
            var passes: ShaderInstance[] = this._shaderInstances.elements;
            for (var j: number = 0, m: number = this._shaderInstances.length; j < m; j++) {
                const shaderIns: ShaderInstance = passes[j];
                if (!shaderIns.complete)
                    continue;
                var switchShader: boolean = shaderIns.bind();
                var switchUpdateMark: boolean = (updateMark !== shaderIns._uploadMark);
                var uploadScene: boolean = (shaderIns._uploadScene !== sceneShaderData) || switchUpdateMark;
                //Scene
                if (uploadScene || switchShader) {
                    sceneShaderData && shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, sceneShaderData, uploadScene);
                    shaderIns._uploadScene = sceneShaderData;
                }
                //render
                if (this._renderShaderData) {
                    var uploadSprite3D: boolean = (shaderIns._uploadRender !== this._renderShaderData) || switchUpdateMark;
                    if (uploadSprite3D || switchShader) {
                        shaderIns.uploadUniforms(shaderIns._spriteUniformParamsMap, this._renderShaderData, uploadSprite3D);
                        shaderIns._uploadRender = this._renderShaderData;
                    }
                }
                //camera
                var uploadCamera: boolean = shaderIns._uploadCameraShaderValue !== cameraShaderData || switchUpdateMark;
                if (uploadCamera || switchShader) {
                    cameraShaderData && shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, cameraShaderData, uploadCamera);
                    shaderIns._uploadCameraShaderValue = cameraShaderData;
                }
                //material
                var uploadMaterial: boolean = (shaderIns._uploadMaterial !== this._materialShaderData) || switchUpdateMark;
                if (uploadMaterial || switchShader) {
                    shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, this._materialShaderData, uploadMaterial);
                    shaderIns._uploadMaterial = this._materialShaderData;
                    //GlobalData
                    context.globalShaderData && shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, context.globalShaderData, uploadMaterial);
                }
                //renderData update
                //TODO：Renderstate as a Object to less upload
                shaderIns.uploadRenderStateBlendDepth(this._materialShaderData);
                shaderIns.uploadRenderStateFrontFace(this._materialShaderData, forceInvertFace, this._invertFront);
                this.drawGeometry(shaderIns);
            }
        }
    }

    private _compileShader(context: GLESRenderContext3D) {
        var passes: ShaderPass[] = this._subShader._passes;
        this._clearShaderInstance();
        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            var pass: ShaderPass = passes[j];
            //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
            if (pass._pipelineMode !== context.pipelineMode)
                continue;

            var comDef: DefineDatas = GLESRenderElementOBJ._compileDefine;

            if (context.sceneData) {
                context.sceneData._defineDatas.cloneTo(comDef);
            } else {
                context._globalConfigShaderData.cloneTo(comDef);
            }

            context.cameraData && comDef.addDefineDatas(context.cameraData._defineDatas);
            if (this._renderShaderData) {
                comDef.addDefineDatas(this._renderShaderData._defineDatas);
                pass.nodeCommonMap = this._owner._commonUniformMap;
            } else {
                pass.nodeCommonMap = null;
            }
            comDef.addDefineDatas(this._materialShaderData._defineDatas);
            var shaderIns: ShaderInstance = pass.withCompile(comDef);
            this._addShaderInstance(shaderIns);
        }
    }


    drawGeometry(shaderIns: ShaderInstance) {
        LayaGL.renderDrawContext.drawGeometryElement(this._geometry);
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