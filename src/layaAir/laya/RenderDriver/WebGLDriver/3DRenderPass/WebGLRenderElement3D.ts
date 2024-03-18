
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Transform3D } from "../../../d3/core/Transform3D";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLRenderGeometryElement } from "../RenderDevice/WebGLRenderGeometryElement";
import { WebGLShaderInstance } from "../RenderDevice/WebGLShaderInstance";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";

export class WebGLRenderElement3D implements IRenderElement3D {
    /** @internal */
    static _compileDefine: WebDefineDatas = new WebDefineDatas();

    protected _shaderInstances: SingletonList<WebGLShaderInstance>;

    geometry: WebGLRenderGeometryElement;

    subShader: SubShader;

    materialId: number;


    materialShaderData: WebGLShaderData;

    materialRenderQueue: number;

    renderShaderData: WebGLShaderData;

    transform: Transform3D;

    isRender: boolean;

    owner: WebBaseRenderNode;//GLESRenderNode

    protected _invertFront: boolean;

    constructor() {
        this._shaderInstances = new SingletonList();
    }

    _addShaderInstance(shader: WebGLShaderInstance) {
        this._shaderInstances.add(shader);
    }

    _clearShaderInstance() {
        this._shaderInstances.length = 0;
    }

    _preUpdatePre(context: WebGLRenderContext3D) {
        this._compileShader(context);
        this._invertFront = this._getInvertFront();
    }

    protected _getInvertFront(): boolean {
        let transform = this.owner?.transform;
        return transform ? transform._isFrontFaceInvert : false;
    }

    /**
     * render RenderElement
     * context:GLESRenderContext3D
     * @param renderqueue 
     */
    _render(context: WebGLRenderContext3D): void {
        var forceInvertFace: boolean = context.invertY;
        var updateMark: number = context.cameraUpdateMask;
        var sceneShaderData = context.sceneData as WebGLShaderData;
        var cameraShaderData = context.cameraData as WebGLShaderData;
        if (this.isRender) {
            var passes: WebGLShaderInstance[] = this._shaderInstances.elements;
            for (var j: number = 0, m: number = this._shaderInstances.length; j < m; j++) {
                const shaderIns: WebGLShaderInstance = passes[j];
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
                if (this.renderShaderData) {
                    var uploadSprite3D: boolean = (shaderIns._uploadRender !== this.renderShaderData) || switchUpdateMark;
                    if (uploadSprite3D || switchShader) {
                        shaderIns.uploadUniforms(shaderIns._spriteUniformParamsMap, this.renderShaderData, uploadSprite3D);
                        shaderIns._uploadRender = this.renderShaderData;
                    }
                }
                //camera
                var uploadCamera: boolean = shaderIns._uploadCameraShaderValue !== cameraShaderData || switchUpdateMark;
                if (uploadCamera || switchShader) {
                    cameraShaderData && shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, cameraShaderData, uploadCamera);
                    shaderIns._uploadCameraShaderValue = cameraShaderData;
                }
                //material
                var uploadMaterial: boolean = (shaderIns._uploadMaterial !== this.materialShaderData) || switchUpdateMark;
                if (uploadMaterial || switchShader) {
                    shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, this.materialShaderData, uploadMaterial);
                    shaderIns._uploadMaterial = this.materialShaderData;
                    //GlobalData
                    context.globalShaderData && shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, context.globalShaderData, uploadMaterial);
                }
                //renderData update
                //TODO：Renderstate as a Object to less upload
                shaderIns.uploadRenderStateBlendDepth(this.materialShaderData);
                shaderIns.uploadRenderStateFrontFace(this.materialShaderData, forceInvertFace, this._invertFront);
                this.drawGeometry(shaderIns);
            }
        }
    }

    protected _compileShader(context: WebGLRenderContext3D) {
        var passes: ShaderPass[] = this.subShader._passes;
        this._clearShaderInstance();
        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            var pass: ShaderPass = passes[j];
            //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
            if (pass.pipelineMode !== context.pipelineMode)
                continue;

            var comDef = WebGLRenderElement3D._compileDefine;

            if (context.sceneData) {
                context.sceneData._defineDatas.cloneTo(comDef);
            } else {
                context._globalConfigShaderData.cloneTo(comDef);
            }

            context.cameraData && comDef.addDefineDatas(context.cameraData._defineDatas);
            if (this.renderShaderData) {
                comDef.addDefineDatas(this.renderShaderData.getDefineData());
                pass.nodeCommonMap = this.owner._commonUniformMap;
            } else {
                pass.nodeCommonMap = null;
            }
            comDef.addDefineDatas(this.materialShaderData._defineDatas);

            var shaderIns = pass.withCompile(comDef) as WebGLShaderInstance;

            //get shaderInstance
            //create ShaderInstance

            this._addShaderInstance(shaderIns);
        }
    }

    drawGeometry(shaderIns: WebGLShaderInstance) {
        WebGLEngine.instance.getDrawContext().drawGeometryElement(this.geometry);
    }

    destroy() {
        this.geometry = null;
        this._shaderInstances = null;
        this.materialShaderData = null;
        this.renderShaderData = null;
        this.transform = null;
        this.isRender = null;
    }
}